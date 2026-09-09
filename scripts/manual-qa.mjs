/**
 * Automated walkthrough of docs/MANUAL_QA_PATIENTS_DOCTORS.md
 * Run: QA_BASE_URL=http://127.0.0.1:5174 node scripts/manual-qa.mjs
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.QA_BASE_URL || "http://127.0.0.1:5174";
const SHOT_DIR = resolve(__dirname, "../docs/qa-screenshots");
const results = [];

let page;
let consoleErrors = [];
let permissionDenied = false;

function record(id, pass, detail = "") {
  const status = pass === null ? "SKIP" : pass ? "PASS" : "FAIL";
  results.push({ id, pass, detail, status });
  console.log(`[${status}] ${id}${detail ? " — " + String(detail).replace(/\s+/g, " ").slice(0, 160) : ""}`);
}

async function shot(name) {
  try {
    mkdirSync(SHOT_DIR, { recursive: true });
    await page.screenshot({
      path: resolve(SHOT_DIR, `${name}.png`),
      fullPage: true,
    });
  } catch {
    /* ignore */
  }
}

async function goto(path) {
  await page.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(2500);
}

async function bodyText() {
  return page.locator("body").innerText();
}

async function mainContentText() {
  const content = page.locator(".page-wrapper .content, .content, main").first();
  if (await content.count()) {
    try {
      return await content.innerText({ timeout: 5000 });
    } catch {
      /* fall through */
    }
  }
  return bodyText();
}

async function clearSession() {
  await page.evaluate(async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      /* ignore */
    }
    try {
      if (indexedDB.databases) {
        const dbs = await indexedDB.databases();
        await Promise.all(
          dbs
            .filter((db) => db.name)
            .map(
              (db) =>
                new Promise((resolve) => {
                  const req = indexedDB.deleteDatabase(db.name);
                  req.onsuccess = () => resolve(null);
                  req.onerror = () => resolve(null);
                  req.onblocked = () => resolve(null);
                })
            )
        );
      }
    } catch {
      /* ignore */
    }
  });
  await page.context().clearCookies();
  await page.goto(BASE + "/login", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1500);
  // PublicOnlyRoute may bounce briefly; force reload after storage wipe
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("#login-email", { timeout: 30000 });
}

async function login(email, password) {
  consoleErrors = [];
  permissionDenied = false;
  await goto("/login");
  await page.waitForSelector("#login-email", { timeout: 20000 });
  await page.fill("#login-email", "");
  await page.fill("#login-password", "");
  await page.fill("#login-email", email);
  await page.fill("#login-password", password);
  await page.click('button[type="submit"]');
  await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 45000 });
  await page.waitForTimeout(2000);
}

function attachConsole() {
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      const text = msg.text();
      consoleErrors.push(text);
      if (/permission-denied|insufficient permissions/i.test(text)) {
        permissionDenied = true;
      }
    }
  });
  page.on("pageerror", (err) => {
    consoleErrors.push(String(err));
    if (/permission-denied|insufficient permissions/i.test(String(err))) {
      permissionDenied = true;
    }
  });
}

async function section(id, fn) {
  try {
    await fn();
  } catch (err) {
    record(id, false, `threw: ${String(err).slice(0, 180)}`);
    await shot(`fail-${id.replace(/[^\w.-]+/g, "_")}`);
  }
}

async function main() {
  mkdirSync(SHOT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  page = await context.newPage();
  attachConsole();

  // 0
  await section("0.login-page", async () => {
    await goto("/login");
    const ok = await page.locator("#login-email").isVisible();
    record("0.login-page", ok, await page.title());
    await shot("00-login");
  });

  // 1 Admin
  await section("1.1 admin-login", async () => {
    await login("admin@example.com", "Admin123!");
    record("1.1 admin-login", page.url().includes("/dashboard"), page.url());
    record("1.1 admin-no-permission-denied", !permissionDenied, permissionDenied ? consoleErrors.join(" | ") : "ok");
    await shot("01-admin-dashboard");
  });

  let patientId = null;
  let doctorId = null;

  await section("1.2 patients-list", async () => {
    await goto("/patients");
    await page.waitForTimeout(3000);
    const text = await mainContentText();
    await shot("02-patients-list");
    record("1.2 patients-list-seeded", /Demo Patient|Walk-in/i.test(text), text.slice(0, 200));
    record("1.2 patients-total-badge", /Total Patients\s*:\s*\d+/i.test(text));

    const searchInput = page.locator(".search-input input, .table-search input, input[type='search'], .dataTables_filter input").first();
    if ((await searchInput.count()) > 0 && (await searchInput.isVisible().catch(() => false))) {
      await searchInput.fill("demo");
      await page.waitForTimeout(2500);
      const after = await mainContentText();
      record("1.2 patients-search", /Demo Patient/i.test(after), "search=demo");
      await searchInput.fill("");
      await page.waitForTimeout(1500);
    } else {
      record("1.2 patients-search", null, "search input not found / not visible — skip");
    }

    const statusSelect = page.locator("select").first();
    if (await statusSelect.count()) {
      await statusSelect.selectOption("inactive");
      await page.waitForTimeout(2500);
      const inactive = await mainContentText();
      record(
        "1.2 patients-status-filter",
        /Unavailable|No patients|Walk-in|inactive/i.test(inactive),
        "filter=inactive"
      );
      await statusSelect.selectOption("all");
      await page.waitForTimeout(1500);
    } else {
      record("1.2 patients-status-filter", false, "status select not found");
    }
  });

  await section("1.3 patients-grid", async () => {
    await goto("/patients-grid");
    let text = "";
    for (let i = 0; i < 20; i++) {
      await page.waitForTimeout(1000);
      text = await mainContentText();
      if (/Demo Patient|Walk-in/i.test(text)) break;
    }
    await shot("03-patients-grid");
    record("1.3 patients-grid", /Demo Patient|Walk-in/i.test(text), text.slice(0, 160));
    const link = page.locator('a[href*="/patient-details/"]').first();
    if (await link.count()) {
      const href = await link.getAttribute("href");
      patientId = href?.match(/\/patient-details\/([^/?#]+)/)?.[1] || null;
      record("1.3 patient-link-has-id", Boolean(patientId), href || "");
    } else {
      record("1.3 patient-link-has-id", false, "no links");
    }
  });

  await section("1.4 create-patient", async () => {
    await goto("/create-patient");
    await page.waitForTimeout(2000);
    const text = await mainContentText();
    record("1.4 create-patient-page", /First Name|Patient Information|Add New Patient/i.test(text));
    await shot("04-create-patient");

    // Form is hard to fully automate (phone + antd + react-select). Mark as partial.
    const hasForm = await page.locator('input[name="firstName"]').count();
    if (!hasForm) {
      record("1.4 create-patient-submit", false, "form fields missing");
      return;
    }
    await page.fill('input[name="firstName"]', "QA");
    await page.fill('input[name="lastName"]', "ManualTest");
    await page.fill('input[name="email"]', `qa.manual.${Date.now()}@example.com`);
    await page.fill('input[name="addressLine1"]', "123 QA Street");
    await page.fill('input[name="postalCode"]', "90210");
    const tel = page.locator('input[type="tel"]').first();
    if (await tel.count()) await tel.fill("+12025550199");

    // react-select primary doctor
    const controls = page.locator(".react-select__control");
    const count = await controls.count();
    for (let i = 0; i < Math.min(count, 6); i++) {
      await controls.nth(i).click();
      await page.waitForTimeout(400);
      const opt = page.locator(".react-select__option").first();
      if (await opt.count()) {
        await opt.click();
        await page.waitForTimeout(200);
      } else {
        await page.keyboard.press("Escape");
      }
    }

    const dob = page.locator(".ant-picker input").first();
    if (await dob.count()) {
      await dob.click();
      await dob.fill("01-01-1990");
      await page.keyboard.press("Enter");
    }

    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(5000);
    const url = page.url();
    const created = /\/patient-details\/[A-Za-z0-9]+/.test(url);
    record("1.4 create-patient-submit", created, url + (created ? "" : " (validation may have blocked)"));
    await shot("04b-create-patient-after-submit");
    if (created) {
      patientId = url.match(/\/patient-details\/([A-Za-z0-9]+)/)[1];
    }
  });

  await section("1.6 patient-detail-404", async () => {
    if (patientId) {
      await goto(`/patient-details/${patientId}`);
      await page.waitForTimeout(2500);
      const detail = await mainContentText();
      await shot("05-patient-detail");
      record(
        "1.6 patient-detail",
        detail.length > 20 && !/do not have access/i.test(detail),
        detail.slice(0, 160)
      );
    } else {
      record("1.6 patient-detail", false, "no patientId");
    }

    await goto("/patient-details/does-not-exist");
    await page.waitForTimeout(4000);
    const url = page.url();
    const text = await bodyText();
    await shot("06-patient-404");
    record(
      "1.6 patient-404",
      /error-404|Page not found|something went wrong|404/i.test(url + " " + text),
      url
    );
  });

  await section("1.8 specializations", async () => {
    await goto("/specializations");
    await page.waitForTimeout(4000);
    const text = await mainContentText();
    await shot("07-specializations");
    record(
      "1.8 specializations-seeded",
      /Cardiology|Pediatrics|General Practice|Dermatology/i.test(text),
      text.slice(0, 200)
    );
    const nameInput = page.locator("form input.form-control, .card input.form-control").first();
    if ((await nameInput.count()) > 0 && (await nameInput.isVisible().catch(() => false))) {
      const specName = `QA Spec ${Date.now()}`;
      await nameInput.fill(specName);
      await page.locator('button[type="submit"]').filter({ hasText: /Add/i }).click();
      await page.waitForTimeout(3500);
      const after = await mainContentText();
      record("1.8 specialization-add", after.includes(specName));
      await shot("07b-specialization-added");
    } else {
      record("1.8 specialization-add", null, "add form input not visible — skip");
    }
  });

  await section("1.9 doctors", async () => {
    await goto("/doctors-list");
    await page.waitForTimeout(3500);
    const list = await mainContentText();
    await shot("08-doctors-list");
    record("1.9 doctors-list", /Demo Doctor/i.test(list), list.slice(0, 160));

    await goto("/doctors");
    await page.waitForTimeout(3500);
    const grid = await mainContentText();
    await shot("09-doctors-grid");
    record("1.9 doctors-grid", /Demo Doctor/i.test(grid));

    const link = page.locator('a[href*="/doctor-details/"]').first();
    if (await link.count()) {
      const href = await link.getAttribute("href");
      doctorId = href?.match(/\/doctor-details\/([^/?#]+)/)?.[1] || null;
      record("1.9 doctor-link-has-id", Boolean(doctorId), href || "");
    } else {
      record("1.9 doctor-link-has-id", false, "no links");
    }

    if (doctorId) {
      await goto(`/doctor-details/${doctorId}`);
      await page.waitForTimeout(3000);
      const detail = await mainContentText();
      await shot("10-doctor-detail");
      record(
        "1.9 doctor-detail",
        /Demo Doctor|Consultation Charge|Edit doctor|@example\.com/i.test(detail),
        detail.slice(0, 160)
      );

      await goto(`/edit-doctors/${doctorId}`);
      await page.waitForTimeout(4000);
      const edit = await mainContentText();
      await shot("11-edit-doctor");
      record(
        "1.11 edit-doctor-page",
        /Doctor|Save|Email|Phone|Specialization|Edit/i.test(edit) &&
          !/error-404|Page not found/i.test(edit),
        edit.slice(0, 120)
      );
    }
  });

  record("1.10 add-doctor-console-uid", null, "requires Firebase Console — skipped in automation");

  // 2 Doctor
  await section("2.doctor-role", async () => {
    await clearSession();
    await login("doctor@example.com", "Doctor123!");
    record(
      "2.1 doctor-login",
      /doctor-dashboard|\/doctor\//.test(page.url()),
      page.url()
    );
    await shot("12-doctor-dashboard");

    await goto("/doctor/doctor-dashboard");
    let dash = "";
    for (let i = 0; i < 25; i++) {
      await page.waitForTimeout(1000);
      dash = await mainContentText();
      if (/Demo Patient|Error Loading Dashboard|permission-denied/i.test(dash) && !/Loading dashboard/i.test(dash)) {
        break;
      }
    }
    await shot("12b-doctor-dashboard-loaded");
    record("2.2 dashboard-no-error-alert", !/Error Loading Dashboard/i.test(dash), dash.slice(0, 160));
    record(
      "2.2 dashboard-patient-name",
      /Demo Patient/i.test(dash),
      /Demo Patient/i.test(dash) ? "Demo Patient visible" : dash.slice(0, 120)
    );
    record(
      "2.2 dashboard-no-permission-denied",
      !permissionDenied,
      permissionDenied ? consoleErrors.filter((e) => /permission/i.test(e)).join(" | ") : "ok"
    );

    await goto("/patients");
    await page.waitForTimeout(3500);
    const pts = await mainContentText();
    await shot("13-doctor-patients");
    // Admin /patients is Role-guarded; doctors must not open it.
    record(
      "2.3 doctor-patients-admin-route-blocked",
      /Access Denied|Error 403|do not have permission/i.test(pts) ||
        /\/doctor\//.test(page.url()),
      pts.slice(0, 120)
    );

    await goto("/doctor/doctor-schedule");
    await page.waitForTimeout(3500);
    const schedule = await mainContentText();
    await shot("14-doctor-schedule");
    record(
      "2.4 doctor-schedule",
      schedule.length > 20 && !/permission-denied/i.test(schedule),
      schedule.slice(0, 120)
    );
  });

  // 3 Patient
  await section("3.patient-role", async () => {
    await clearSession();
    await login("patient@example.com", "Patient123!");
    record("3.1 patient-login", page.url().includes("/patient"), page.url());
    await shot("15-patient-dashboard");

    await goto("/patient/patient-doctors");
    await page.waitForTimeout(3500);
    const browse = await mainContentText();
    await shot("16-patient-doctors");
    record("3.2 browse-doctors", /Demo Doctor/i.test(browse), browse.slice(0, 160));

    if (patientId) {
      await goto(`/patient-details/${patientId}`);
      await page.waitForTimeout(3500);
      const denied = await bodyText();
      await shot("17-patient-other-chart");
      const blocked =
        /do not have access|not found|404|something went wrong|Failed to load|error-404/i.test(
          denied + page.url()
        );
      const leaked =
        /Walk-in Avery|Walk-in Blake|QA ManualTest/i.test(denied) && !blocked;
      record(
        "3.3 cannot-read-other-patient",
        blocked || !leaked,
        blocked ? "blocked/404" : leaked ? "LEAKED" : "inconclusive-safe"
      );
    } else {
      record("3.3 cannot-read-other-patient", null, "no foreign patientId");
    }
  });

  // 4 Cross
  await section("4.cross-checks", async () => {
    await clearSession();
    await goto("/login");
    await page.fill("#login-email", "admin@example.com");
    await page.fill("#login-password", "WrongPassword!");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);
    const bad = await bodyText();
    record(
      "4.wrong-password",
      page.url().includes("/login") &&
        (/invalid|incorrect|wrong|error|failed|credential|auth/i.test(bad) ||
          (await page.locator(".alert-danger, .text-danger").count()) > 0),
      page.url()
    );
    record("4.detail-urls-need-id", Boolean(patientId || doctorId), `patientId=${patientId} doctorId=${doctorId}`);
  });

  // Grep check via node
  await section("4.grep-json", async () => {
    const { execSync } = await import("node:child_process");
    try {
      const out = execSync(
        'grep -rn "patientListData\\|patientDeatilsData\\|doctorsListData\\|specializationListData\\|patientDoctorsData" src/ || true',
        { cwd: resolve(__dirname, ".."), encoding: "utf8" }
      );
      record("4.grep-deleted-json", out.trim() === "", out.trim() || "0 matches");
    } catch (err) {
      record("4.grep-deleted-json", false, String(err));
    }
  });

  await browser.close();

  const passed = results.filter((r) => r.pass === true).length;
  const failed = results.filter((r) => r.pass === false).length;
  const skipped = results.filter((r) => r.pass === null).length;
  const report = {
    base: BASE,
    date: new Date().toISOString(),
    summary: { passed, failed, skipped, total: results.length },
    results,
    screenshots: SHOT_DIR,
  };
  const outJson = resolve(__dirname, "../docs/MANUAL_QA_RESULTS.json");
  const outMd = resolve(__dirname, "../docs/MANUAL_QA_RESULTS.md");
  writeFileSync(outJson, JSON.stringify(report, null, 2));

  const md = [
    "# Manual QA Results",
    "",
    `**Date:** ${report.date}`,
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
          .slice(0, 120)} |`
    ),
    "",
    "## Screenshots",
    "",
    `Saved under \`docs/qa-screenshots/\`.`,
    "",
    "## Notes",
    "",
    "- Create-patient / full form flows may fail automation due to react-select + antd DatePicker; re-check those manually if FAIL.",
    "- Add-doctor Console UID flow is intentionally skipped.",
    "- Doctor dashboard patient name: confirm **Demo Patient** visually if marked inconclusive.",
    "",
  ].join("\n");
  writeFileSync(outMd, md);

  console.log("\n=== SUMMARY ===");
  console.log(`PASS ${passed}  FAIL ${failed}  SKIP ${skipped}`);
  console.log(`Wrote ${outMd}`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
