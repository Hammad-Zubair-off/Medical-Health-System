/**
 * Production smoke against Vercel (read-mostly; no settings writes).
 * Run: QA_BASE_URL=https://medical-health-system.vercel.app node scripts/prod-smoke.mjs
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE =
  process.env.QA_BASE_URL || "https://medical-health-system.vercel.app";
const SHOT = resolve(__dirname, "../docs/qa-screenshots/prod-smoke");
const OUT_JSON = resolve(__dirname, "../docs/PROD_SMOKE_RESULTS.json");
const OUT_MD = resolve(__dirname, "../docs/PROD_SMOKE_RESULTS.md");

const ADMIN = {
  email: "admin@example.com",
  password: "Admin123!",
};
const DOCTOR = {
  email: "elena.vargas@trustcare.example.com",
  password: "Doctor123!",
};
const PATIENT = {
  email: "maya.patel@email.example.com",
  password: "Patient123!",
};

const results = [];
let page;
let consoleErrors = [];
let pageErrors = [];

function record(id, pass, detail = "") {
  const status = pass === null ? "SKIP" : pass ? "PASS" : "FAIL";
  results.push({
    id,
    status,
    pass,
    detail: String(detail).replace(/\s+/g, " ").slice(0, 320),
  });
  console.log(
    `[${status}] ${id}${detail ? " — " + String(detail).replace(/\s+/g, " ").slice(0, 200) : ""}`
  );
}

async function shot(name) {
  try {
    mkdirSync(SHOT, { recursive: true });
    await page.screenshot({
      path: resolve(SHOT, `${name}.png`),
      fullPage: true,
    });
  } catch {
    /* ignore */
  }
}

async function content() {
  const el = page.locator(".page-wrapper .content, .content, main, body").first();
  try {
    return await el.innerText({ timeout: 8000 });
  } catch {
    return page.locator("body").innerText();
  }
}

function badSignals(text) {
  const t = text.toLowerCase();
  if (/missing or insufficient permissions/.test(t)) return "permissions";
  if (/something went wrong|uncaught|chunkloaderror/.test(t)) return "crash";
  if (/\b403\b|access denied|forbidden/.test(t)) return "forbidden";
  if (/page not found|404/.test(t) && !/invoice/.test(t)) return "not-found";
  return null;
}

async function waitOk(pred, maxSec = 35) {
  let last = "";
  for (let i = 0; i < maxSec; i++) {
    await page.waitForTimeout(1000);
    last = await content();
    if (pred(last)) return last;
  }
  return last;
}

async function wipe() {
  await page.goto(BASE + "/login", {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });
  await page.evaluate(async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    try {
      if (indexedDB.databases) {
        for (const d of await indexedDB.databases()) {
          if (d.name) {
            await new Promise((r) => {
              const x = indexedDB.deleteDatabase(d.name);
              x.onsuccess = x.onerror = x.onblocked = () => r();
            });
          }
        }
      }
    } catch {}
  });
  await page.context().clearCookies();
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("#login-email", { timeout: 45000 });
}

async function login(email, password) {
  consoleErrors = [];
  pageErrors = [];
  await page.fill("#login-email", email);
  await page.fill("#login-password", password);
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.includes("/login"), {
    timeout: 60000,
  });
  await page.waitForTimeout(2000);
}

async function visit(path, id, expectRe) {
  consoleErrors = [];
  pageErrors = [];
  await page.goto(BASE + path, {
    waitUntil: "domcontentloaded",
    timeout: 90000,
  });
  const text = await waitOk((t) => {
    if (badSignals(t)) return true;
    if (expectRe && expectRe.test(t)) return true;
    return /loading/i.test(t) === false && t.trim().length > 40;
  }, 40);
  const bad = badSignals(text);
  const errs = [...consoleErrors, ...pageErrors].slice(0, 3).join(" | ");
  if (bad) {
    await shot(`fail-${id}`);
    record(id, false, `${bad}; url=${page.url()}; ${text.slice(0, 120)}`);
    return false;
  }
  if (expectRe && !expectRe.test(text)) {
    await shot(`fail-${id}`);
    record(
      id,
      false,
      `missing expected content; url=${page.url()}; ${text.slice(0, 140)}`
    );
    return false;
  }
  if (errs && /firebase|permission|firestore/i.test(errs)) {
    await shot(`fail-${id}`);
    record(id, false, `console: ${errs}`);
    return false;
  }
  await shot(id);
  record(id, true, `url=${page.url().replace(BASE, "")}`);
  return true;
}

function writeReport() {
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  const skipped = results.filter((r) => r.status === "SKIP").length;
  const payload = {
    base: BASE,
    at: new Date().toISOString(),
    summary: { passed, failed, skipped, total: results.length },
    results,
  };
  mkdirSync(dirname(OUT_JSON), { recursive: true });
  writeFileSync(OUT_JSON, JSON.stringify(payload, null, 2));
  const lines = [
    `# Production smoke — ${BASE}`,
    "",
    `Ran: ${payload.at}`,
    "",
    `**${passed} PASS / ${failed} FAIL / ${skipped} SKIP** (${results.length} total)`,
    "",
    "| ID | Status | Detail |",
    "|----|--------|--------|",
    ...results.map(
      (r) =>
        `| ${r.id} | ${r.status} | ${r.detail.replace(/\|/g, "/")} |`
    ),
    "",
  ];
  writeFileSync(OUT_MD, lines.join("\n"));
  console.log("\n" + lines.slice(0, 8).join("\n"));
  console.log(`Wrote ${OUT_MD}`);
}

async function main() {
  mkdirSync(SHOT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true,
  });
  page = await context.newPage();
  page.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(msg.text());
  });
  page.on("pageerror", (err) => pageErrors.push(String(err.message || err)));

  // --- Site up ---
  try {
    const res = await page.goto(BASE + "/login", {
      waitUntil: "domcontentloaded",
      timeout: 90000,
    });
    const ok = !!res && res.ok();
    await page.waitForSelector("#login-email", { timeout: 45000 });
    await shot("00-login");
    record(
      "P0.login-page",
      ok,
      `status=${res?.status()} title=${await page.title()}`
    );
  } catch (e) {
    record("P0.login-page", false, String(e));
    writeReport();
    await browser.close();
    process.exit(1);
  }

  // --- Admin ---
  await wipe();
  try {
    await login(ADMIN.email, ADMIN.password);
    const onDash = /dashboard/i.test(page.url()) || /Admin Dashboard/i.test(await content());
    record("A0.admin-login", onDash, `url=${page.url()}`);
    await shot("A0-admin-dashboard");
  } catch (e) {
    record("A0.admin-login", false, String(e));
  }

  const adminPages = [
    ["/dashboard", "A1.dashboard", /Admin Dashboard|Doctors|Patients|Appointment/i],
    ["/patients", "A2.patients", /Patient|Add Patient|patients/i],
    ["/doctors", "A3.doctors", /Doctor|Add Doctor|doctors/i],
    ["/appointments", "A4.appointments", /Appointment/i],
    ["/invoices", "A5.invoices", /Invoice/i],
    ["/payments", "A6.payments", /Payment/i],
    ["/expenses", "A7.expenses", /Expense/i],
    ["/leaves", "A8.leaves", /Leave/i],
    ["/staffs", "A9.staffs", /Staff/i],
    ["/assets", "A10.assets", /Asset/i],
    ["/locations", "A11.locations", /Location/i],
    ["/services", "A12.services", /Service/i],
    ["/application/file-manager", "A13.file-manager", /File Manager|My Files|Storage/i],
    ["/settings", "A14.settings", /Settings|Profile|Security|Organization/i],
    ["/income-report", "A15.income-report", /Income|Report/i],
    ["/appointment-report", "A16.appointment-report", /Appointment|Report/i],
  ];

  for (const [path, id, re] of adminPages) {
    try {
      await visit(path, id, re);
    } catch (e) {
      record(id, false, String(e));
    }
  }

  // Sidebar noise checks on dashboard
  try {
    await page.goto(BASE + "/dashboard", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    await page.waitForTimeout(2500);
    const side = await page.locator(".sidebar, #sidebar, aside, .sidebar-menu").first().innerText().catch(() => "");
    const body = await content();
    const menu = `${side}\n${body}`;
    record(
      "A17.no-layouts-menu",
      !/\bLayouts\b/.test(menu) || !/Hover View|Full Width|RTL/.test(menu),
      "Layouts template section should be gone"
    );
    record(
      "A18.no-help-docs-changelog",
      !/\bDocumentation\b/.test(menu) && !/\bChangelog\b/.test(menu),
      "Help docs/changelog should be gone"
    );
  } catch (e) {
    record("A17.no-layouts-menu", false, String(e));
    record("A18.no-help-docs-changelog", false, String(e));
  }

  // Dashboard not stuck on ...
  try {
    await page.goto(BASE + "/dashboard", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });
    const text = await waitOk(
      (t) => /Doctors/i.test(t) && !/Doctors[\s\S]{0,40}\.\.\./.test(t),
      45
    );
    const stuck = /Doctors[\s\S]{0,80}\.\.\./.test(text) && /Patients[\s\S]{0,80}\.\.\./.test(text);
    const hasNumbers = /Doctors[\s\S]{0,80}\d/.test(text);
    record(
      "A19.dashboard-kpis-loaded",
      !stuck && hasNumbers,
      stuck ? "KPIs still ..." : text.match(/Doctors[\s\S]{0,60}/)?.[0] || "ok"
    );
  } catch (e) {
    record("A19.dashboard-kpis-loaded", false, String(e));
  }

  // --- Doctor ---
  await wipe();
  try {
    await login(DOCTOR.email, DOCTOR.password);
    record(
      "D0.doctor-login",
      /doctor/i.test(page.url()),
      `url=${page.url()}`
    );
    await shot("D0-doctor-dashboard");
  } catch (e) {
    record("D0.doctor-login", false, String(e));
  }

  for (const [path, id, re] of [
    ["/doctor/doctor-dashboard", "D1.dashboard", /Dashboard|Appointment|Patient/i],
    ["/doctor/doctor-appointments", "D2.appointments", /Appointment/i],
    ["/doctor/doctors-schedule", "D3.schedule", /Schedule|Availability|Time/i],
    ["/doctor/doctors-prescriptions", "D4.prescriptions", /Prescription/i],
    ["/doctor/doctors-leaves", "D5.leaves", /Leave/i],
  ]) {
    try {
      await visit(path, id, re);
    } catch (e) {
      record(id, false, String(e));
    }
  }

  // --- Patient ---
  await wipe();
  try {
    await login(PATIENT.email, PATIENT.password);
    record(
      "P0.patient-login",
      /patient/i.test(page.url()),
      `url=${page.url()}`
    );
    await shot("P0-patient-dashboard");
  } catch (e) {
    record("P0.patient-login", false, String(e));
  }

  for (const [path, id, re] of [
    ["/patient/patient-dashboard", "P1.dashboard", /Dashboard|Appointment|Doctor/i],
    ["/patient/patient-appointments", "P2.appointments", /Appointment/i],
    ["/patient/patient-doctors", "P3.doctors", /Doctor/i],
    ["/patient/patient-prescriptions", "P4.prescriptions", /Prescription/i],
    ["/patient/patient-invoices", "P5.invoices", /Invoice/i],
  ]) {
    try {
      await visit(path, id, re);
    } catch (e) {
      record(id, false, String(e));
    }
  }

  writeReport();
  await browser.close();
  const failed = results.filter((r) => r.status === "FAIL").length;
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  writeReport();
  process.exit(1);
});
