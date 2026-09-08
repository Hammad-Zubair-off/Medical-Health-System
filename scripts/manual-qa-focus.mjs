/**
 * Focused re-run: doctor + patient role checks after IndexedDB session clear.
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.QA_BASE_URL || "http://127.0.0.1:5174";
const SHOT_DIR = resolve(__dirname, "../docs/qa-screenshots");
const results = [];

function record(id, pass, detail = "") {
  const status = pass === null ? "SKIP" : pass ? "PASS" : "FAIL";
  results.push({ id, pass, detail, status });
  console.log(`[${status}] ${id}${detail ? " — " + String(detail).replace(/\s+/g, " ").slice(0, 180) : ""}`);
}

async function wipeAuth(page) {
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate(async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    try {
      if (indexedDB.databases) {
        const dbs = await indexedDB.databases();
        await Promise.all(
          (dbs || [])
            .filter((d) => d.name)
            .map(
              (d) =>
                new Promise((res) => {
                  const r = indexedDB.deleteDatabase(d.name);
                  r.onsuccess = r.onerror = r.onblocked = () => res(null);
                })
            )
        );
      }
    } catch {}
  });
  await page.context().clearCookies();
  await page.goto(BASE + "/login", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("#login-email", { timeout: 30000 });
}

async function login(page, email, password) {
  await page.fill("#login-email", email);
  await page.fill("#login-password", password);
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 45000 });
  await page.waitForTimeout(2500);
}

async function content(page) {
  const el = page.locator(".page-wrapper .content").first();
  if (await el.count()) {
    try {
      return await el.innerText({ timeout: 5000 });
    } catch {}
  }
  return page.locator("body").innerText();
}

async function main() {
  mkdirSync(SHOT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  let permissionDenied = false;
  const consoleErrors = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
      if (/permission-denied|insufficient permissions/i.test(msg.text())) permissionDenied = true;
    }
  });

  // Grab a patient id while admin (quick)
  await wipeAuth(page);
  await login(page, "admin@example.com", "Admin123!");
  await page.goto(BASE + "/patients-grid", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(4000);
  const href = await page.locator('a[href*="/patient-details/"]').first().getAttribute("href");
  const patientId = href?.match(/\/patient-details\/([^/?#]+)/)?.[1];
  record("prep.patient-id", Boolean(patientId), href || "");

  // Patient detail longer wait
  if (patientId) {
    await page.goto(BASE + `/patient-details/${patientId}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(8000);
    const detail = await content(page);
    await page.screenshot({ path: resolve(SHOT_DIR, "20-patient-detail-retry.png"), fullPage: true });
    record(
      "1.6 patient-detail-retry",
      !/Loading patient/i.test(detail) && detail.length > 40,
      detail.slice(0, 180)
    );
  }

  // Doctor role
  permissionDenied = false;
  await wipeAuth(page);
  await login(page, "doctor@example.com", "Doctor123!");
  record("2.1 doctor-login", /doctor/i.test(page.url()), page.url());
  await page.goto(BASE + "/doctor/doctor-dashboard", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(8000);
  const dash = await content(page);
  await page.screenshot({ path: resolve(SHOT_DIR, "21-doctor-dashboard.png"), fullPage: true });
  record("2.2 dashboard-no-error-alert", !/Error Loading Dashboard/i.test(dash), dash.slice(0, 160));
  record(
    "2.2 dashboard-patient-name",
    /Demo Patient|Demo Hammad/i.test(dash),
    /Demo Patient|Demo Hammad/i.test(dash) ? "name visible" : dash.slice(0, 120)
  );
  record("2.2 dashboard-no-permission-denied", !permissionDenied, permissionDenied ? consoleErrors.join(" | ") : "ok");

  await page.goto(BASE + "/patients", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(5000);
  const pts = await content(page);
  await page.screenshot({ path: resolve(SHOT_DIR, "22-doctor-patients.png"), fullPage: true });
  record(
    "2.3 doctor-patients-list",
    !/Failed to load|permission-denied|Missing or insufficient/i.test(pts) &&
      /Patients List|Demo|Walk-in|Total Patients/i.test(pts),
    pts.slice(0, 140)
  );

  await page.goto(BASE + "/doctor/doctor-schedule", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(5000);
  const schedule = await content(page);
  await page.screenshot({ path: resolve(SHOT_DIR, "23-doctor-schedule.png"), fullPage: true });
  record("2.4 doctor-schedule", schedule.length > 20 && !/permission-denied/i.test(schedule), schedule.slice(0, 120));

  // Patient role
  permissionDenied = false;
  await wipeAuth(page);
  await login(page, "patient@example.com", "Patient123!");
  record("3.1 patient-login", /patient/i.test(page.url()), page.url());
  await page.goto(BASE + "/patient/patient-doctors", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(5000);
  const browse = await content(page);
  await page.screenshot({ path: resolve(SHOT_DIR, "24-patient-doctors.png"), fullPage: true });
  record("3.2 browse-doctors", /Demo Doctor/i.test(browse), browse.slice(0, 160));

  if (patientId) {
    await page.goto(BASE + `/patient-details/${patientId}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(6000);
    const denied = await page.locator("body").innerText();
    await page.screenshot({ path: resolve(SHOT_DIR, "25-patient-other-chart.png"), fullPage: true });
    const blocked =
      /do not have access|not found|404|something went wrong|Failed to load|error-404/i.test(
        denied + page.url()
      );
    record("3.3 cannot-read-other-patient", blocked, blocked ? "blocked" : denied.slice(0, 120));
  }

  // Wrong password
  await wipeAuth(page);
  await page.fill("#login-email", "admin@example.com");
  await page.fill("#login-password", "WrongPassword!");
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);
  const bad = await page.locator("body").innerText();
  record(
    "4.wrong-password",
    page.url().includes("/login") &&
      (/invalid|incorrect|wrong|error|failed|credential|auth/i.test(bad) ||
        (await page.locator(".alert-danger, .text-danger").count()) > 0),
    page.url()
  );

  await browser.close();

  // Merge into existing results file
  const outMd = resolve(__dirname, "../docs/MANUAL_QA_RESULTS.md");
  const passed = results.filter((r) => r.pass === true).length;
  const failed = results.filter((r) => r.pass === false).length;
  const skipped = results.filter((r) => r.pass === null).length;

  const prevPath = resolve(__dirname, "../docs/MANUAL_QA_RESULTS.json");
  let prev = { results: [] };
  try {
    prev = JSON.parse(readFileSync(prevPath, "utf8"));
  } catch {}

  const merged = {
    base: BASE,
    date: new Date().toISOString(),
    summary: { passed, failed, skipped, total: results.length },
    focusRerun: results,
    previousRun: prev.summary || null,
  };
  writeFileSync(prevPath, JSON.stringify({ ...prev, focusRerun: merged }, null, 2));

  const md = [
    "# Manual QA Results (focus re-run: doctor/patient)",
    "",
    `**Date:** ${merged.date}`,
    `**Base URL:** ${BASE}`,
    `**Summary:** ${passed} passed · ${failed} failed · ${skipped} skipped`,
    "",
    "| Status | Check | Detail |",
    "|---|---|---|",
    ...results.map(
      (r) =>
        `| ${r.status} | \`${r.id}\` | ${String(r.detail || "")
          .replace(/\|/g, "\\|")
          .replace(/\n/g, " ")
          .slice(0, 140)} |`
    ),
    "",
    "Screenshots: `docs/qa-screenshots/21-*.png` … `25-*.png`",
    "",
  ].join("\n");
  writeFileSync(resolve(__dirname, "../docs/MANUAL_QA_RESULTS_FOCUS.md"), md);
  console.log("\n=== SUMMARY ===");
  console.log(`PASS ${passed}  FAIL ${failed}  SKIP ${skipped}`);
  console.log(md);
  if (failed > 0) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
