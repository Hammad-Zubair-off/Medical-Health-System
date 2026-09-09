/**
 * Playwright smoke for COMPLETION_PLAN.md domains (Prescriptions → Finance →
 * HRM → Reports → Misc → Deletion checks).
 *
 * Run: QA_BASE_URL=http://127.0.0.1:5174 node scripts/manual-qa-completion.mjs
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.QA_BASE_URL || "http://127.0.0.1:5174";
const SHOT = resolve(__dirname, "../docs/qa-screenshots/completion");
const results = [];

function record(id, pass, detail = "") {
  const status = pass === null ? "SKIP" : pass ? "PASS" : "FAIL";
  results.push({
    id,
    status,
    pass,
    detail: String(detail).replace(/\s+/g, " ").slice(0, 220),
  });
  console.log(
    `[${status}] ${id}${detail ? " — " + String(detail).replace(/\s+/g, " ").slice(0, 160) : ""}`
  );
}

async function wipe(page) {
  await page.goto(BASE + "/login", { waitUntil: "domcontentloaded", timeout: 60000 });
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
  await page.waitForSelector("#login-email", { timeout: 30000 });
}

async function login(page, email, password) {
  await page.fill("#login-email", email);
  await page.fill("#login-password", password);
  await page.click('button[type="submit"]');
  await page.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 45000 });
  await page.waitForTimeout(2000);
}

async function waitBody(page, pred, maxSec = 25) {
  let last = "";
  for (let i = 0; i < maxSec; i++) {
    await page.waitForTimeout(1000);
    last = await page.locator("body").innerText();
    if (pred(last)) return last;
  }
  return last;
}

async function content(page) {
  const el = page.locator(".page-wrapper .content, .content, main").first();
  if (await el.count()) {
    try {
      return await el.innerText({ timeout: 5000 });
    } catch {}
  }
  return page.locator("body").innerText();
}

function looksBroken(text) {
  // Do not match sidebar "Coming Soon" links — only page/content failures.
  return /Missing or insufficient permissions|something went wrong|Failed to load|permission-denied|Cannot read prop|is not defined|Unexpected Application Error|Error 403|requires an index|currently under development|will be available soon/i.test(
    text
  );
}

function looksEmptyOk(text) {
  return /No (records|data|results|invoices|expenses|payments|transactions|staff|leaves|holidays|prescriptions|assets|locations|services)|Nothing here|0 results|empty/i.test(
    text
  );
}

function stillLoading(text) {
  return /Loading[\s.…]*($|\n)|Loading (invoice|invoices|expense|expenses|payment|payments|transaction|transactions|income|prescription|prescriptions|leave|leaves|patient|patients|appointment|appointments|categor|asset|assets|location|locations|service|services|staff|holiday|holidays|payroll)/i.test(
    text
  );
}

/**
 * Visit a path and assert it renders real UI (seeded data OR empty state),
 * not Coming Soon / crash / permission-denied / stuck Loading.
 */
async function smokePage(page, id, path, expectRe, opts = {}) {
  const { maxSec = 35, shotName } = opts;
  let perm = false;
  const onConsole = (m) => {
    if (m.type() === "error" && /permission-denied|insufficient permissions/i.test(m.text())) {
      perm = true;
    }
  };
  page.on("console", onConsole);

  await page.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 60000 });
  let text = "";
  for (let i = 0; i < maxSec; i++) {
    await page.waitForTimeout(1000);
    text = await content(page);
    if (looksBroken(text) || /error-404|Page not found/i.test(text)) break;
    if (stillLoading(text)) continue;
    if (expectRe.test(text) || looksEmptyOk(text)) break;
  }
  if (shotName) {
    await page.screenshot({
      path: resolve(SHOT, `${shotName}.png`),
      fullPage: true,
    });
  }

  page.off("console", onConsole);

  const url = page.url();
  const stillLogin = /\/login/.test(url);
  const notFound = /error-404|Page not found/i.test(url + " " + text);
  const broken = looksBroken(text) || perm;
  const loadingStuck = stillLoading(text);
  const matched = !loadingStuck && (expectRe.test(text) || looksEmptyOk(text));
  const ok = !stillLogin && !notFound && !broken && !loadingStuck && matched;

  record(
    id,
    ok,
    broken
      ? `broken: ${text.slice(0, 140)}`
      : loadingStuck
        ? `still loading: ${text.slice(0, 140)}`
        : stillLogin
          ? "redirected to login"
          : notFound
            ? `404: ${url}`
            : matched
              ? text.slice(0, 140)
              : `no match: ${text.slice(0, 140)}`
  );
  return { ok, text, url };
}

async function waitForDetailLink(page, hrefPart, maxSec = 30) {
  for (let i = 0; i < maxSec; i++) {
    const link = page.locator(`a[href*="${hrefPart}"]`).first();
    if ((await link.count()) > 0) {
      const href = await link.getAttribute("href");
      if (href && href.includes(hrefPart)) return href;
    }
    await page.waitForTimeout(1000);
  }
  return null;
}

async function main() {
  mkdirSync(SHOT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  // ---------- Admin ----------
  await wipe(page);
  await login(page, "admin@example.com", "Admin123!");
  record("C.0 admin-login", /dashboard/i.test(page.url()), page.url());

  // Finance
  await smokePage(page, "C.2 invoices-list", "/invoices", /Invoice|INV-|SEED-INV|Total|Amount/i, {
    shotName: "01-invoices",
  });
  await smokePage(page, "C.2 add-invoice", "/add-invoices", /Invoice|Patient|Line|Amount|Add/i, {
    shotName: "02-add-invoice",
  });
  await smokePage(page, "C.2 expenses", "/expenses", /Expense|Amount|Category|SEED/i, {
    shotName: "03-expenses",
  });
  await smokePage(
    page,
    "C.2 expense-category",
    "/expense-category",
    /Categor|Payroll|Supplies|Utilities|Expense/i,
    { shotName: "04-expense-category" }
  );
  await smokePage(page, "C.2 income-view", "/income", /Income|Payment|Patient|Amount|Received/i, {
    shotName: "05-income",
  });
  await smokePage(
    page,
    "C.2 transactions-view",
    "/transactions",
    /Transaction|Payment|Expense|Income|Amount/i,
    { shotName: "06-transactions" }
  );
  await smokePage(page, "C.2 payments", "/payments", /Payment|Amount|Method|Invoice|Patient/i, {
    shotName: "07-payments",
  });

  // Detail deep-link — wait until rows finish loading (up to 30s)
  {
    await page.goto(BASE + "/invoices", { waitUntil: "domcontentloaded" });
    const href = await waitForDetailLink(page, "/invoices-details/");
    const id = href?.match(/\/invoices-details\/([^/?#]+)/)?.[1];
    if (id) {
      await smokePage(
        page,
        "C.2 invoice-detail",
        `/invoices-details/${id}`,
        /Invoice|INV-|Patient|Total|Balance|Line/i,
        { shotName: "08-invoice-detail" }
      );
    } else {
      record("C.2 invoice-detail", false, "no detail links after wait");
    }
  }

  // HRM
  await smokePage(page, "C.3 staffs", "/staffs", /Staff|Employee|Demo|Nurse|Doctor/i, {
    shotName: "09-staffs",
  });
  await smokePage(
    page,
    "C.3 departments",
    "/hrm-departments",
    /Department|Nursing|Admin|Clinic|HR/i,
    { shotName: "10-departments" }
  );
  await smokePage(page, "C.3 designation", "/designation", /Designation|Nurse|Manager|Doctor/i, {
    shotName: "11-designation",
  });
  await smokePage(page, "C.3 leaves", "/leaves", /Leave|Pending|Approved|Staff|Type/i, {
    shotName: "12-leaves",
  });
  await smokePage(page, "C.3 leave-type", "/leave-type", /Leave|Annual|Sick|Type|Days/i, {
    shotName: "13-leave-type",
  });
  await smokePage(page, "C.3 holidays", "/holidays", /Holiday|Christmas|New Year|Recurring|Date/i, {
    shotName: "14-holidays",
  });
  await smokePage(page, "C.3 payroll", "/payroll", /Payroll|Salary|Net|Basic|Staff/i, {
    shotName: "15-payroll",
  });
  await smokePage(page, "C.3 attendance", "/attendance", /Attendance|Present|Absent|Staff|Check/i, {
    shotName: "16-attendance",
    maxSec: 35,
  });

  // Reports (computed)
  await smokePage(
    page,
    "C.4 income-report",
    "/income-report",
    /Income|Report|Payment|Date|Total|Filter/i,
    { shotName: "17-income-report" }
  );
  await smokePage(
    page,
    "C.4 expense-report",
    "/expense-report",
    /Expense|Report|Date|Total|Filter|Category/i,
    { shotName: "18-expense-report" }
  );
  await smokePage(
    page,
    "C.4 appointment-report",
    "/appointment-report",
    /Appointment|Report|Date|Doctor|Patient|Status/i,
    { shotName: "19-appointment-report" }
  );
  await smokePage(
    page,
    "C.4 patient-report",
    "/patient-report",
    /Patient|Report|Date|Total|Filter/i,
    { shotName: "20-patient-report" }
  );

  // Misc
  await smokePage(page, "C.5 assets", "/assets", /Asset|Purchase|Cost|Location|Status/i, {
    shotName: "21-assets",
  });
  await smokePage(page, "C.5 locations", "/locations", /Location|Address|Clinic|Room|Floor/i, {
    shotName: "22-locations",
  });
  await smokePage(page, "C.5 services", "/services", /Service|Price|Duration|Active|Name/i, {
    shotName: "23-services",
  });

  // Deletion checks — CMS / Support paths should not render live clinic pages
  for (const [id, path] of [
    ["C.6 deleted-blogs", "/blogs"],
    ["C.6 deleted-faq", "/faq"],
    ["C.6 deleted-tickets", "/tickets"],
    ["C.6 deleted-countries", "/countries"],
    ["C.6 deleted-newsletters", "/newsletters"],
  ]) {
    await page.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.waitForTimeout(2500);
    const text = await page.locator("body").innerText();
    const url = page.url();
    const gone =
      /error-404|Page not found|Coming Soon|under-maintenance|under-construction/i.test(
        url + " " + text
      ) ||
      !url.includes(path) ||
      /dashboard/i.test(url);
    record(id, gone, url);
  }

  // Patient form geo still works (risk #4)
  await smokePage(
    page,
    "C.6 patient-form-geo",
    "/create-patient",
    /Country|State|City|Patient|First Name/i,
    { shotName: "24-create-patient-geo" }
  );
  {
    const country = page.locator("text=Country").first();
    const hasGeo =
      (await page.locator("select, .react-select__control").count()) > 0 ||
      (await country.count()) > 0;
    record("C.6 patient-geo-controls", hasGeo, "country/state/city controls present");
  }

  // ---------- Doctor ----------
  await wipe(page);
  await login(page, "doctor@example.com", "Doctor123!");
  record("C.0 doctor-login", /doctor/i.test(page.url()), page.url());

  await smokePage(
    page,
    "C.1 doctor-prescriptions",
    "/doctor/doctors-prescriptions",
    /Prescription|Medicine|Patient|Demo|RX|Add/i,
    { shotName: "25-doctor-prescriptions" }
  );
  await smokePage(
    page,
    "C.1 add-prescription",
    "/doctor/add-prescription",
    /Prescription|Medicine|Patient|Dosage|Frequency|Add/i,
    { shotName: "26-add-prescription" }
  );
  {
    await page.goto(BASE + "/doctor/doctors-prescriptions", {
      waitUntil: "domcontentloaded",
    });
    const href = await waitForDetailLink(
      page,
      "/doctor/doctors-prescription-details/"
    );
    const id = href?.match(/\/doctors-prescription-details\/([^/?#]+)/)?.[1];
    if (id) {
      await smokePage(
        page,
        "C.1 prescription-detail",
        `/doctor/doctors-prescription-details/${id}`,
        /Prescription|Medicine|Dosage|Patient|Frequency/i,
        { shotName: "27-prescription-detail" }
      );
    } else {
      record("C.1 prescription-detail", false, "no detail links after wait");
    }
  }
  await smokePage(
    page,
    "C.3 doctor-leaves",
    "/doctor/doctors-leaves",
    /Leave|Pending|Approved|Request|Type|Days/i,
    { shotName: "28-doctor-leaves" }
  );

  // ---------- Patient ----------
  await wipe(page);
  await login(page, "patient@example.com", "Patient123!");
  record("C.0 patient-login", /patient/i.test(page.url()), page.url());

  await smokePage(
    page,
    "C.1 patient-prescriptions",
    "/patient/patient-prescriptions",
    /Prescription|Medicine|Doctor|Demo|RX/i,
    { shotName: "29-patient-prescriptions" }
  );
  await smokePage(
    page,
    "C.2 patient-invoices",
    "/patient/patient-invoices",
    /Invoice|Amount|Paid|Balance|INV-/i,
    { shotName: "30-patient-invoices" }
  );

  // Grep: no core/json imports remain
  {
    const { execSync } = await import("node:child_process");
    try {
      const out = execSync(
        'grep -rn "core/json/\\|from \\\".*json/.*Data" src/ --include="*.ts" --include="*.tsx" || true',
        { cwd: resolve(__dirname, ".."), encoding: "utf8" }
      );
      record("C.6 no-json-imports", out.trim() === "", out.trim() || "0 matches");
    } catch (err) {
      record("C.6 no-json-imports", false, String(err));
    }
  }

  await browser.close();

  const passed = results.filter((r) => r.pass === true).length;
  const failed = results.filter((r) => r.pass === false).length;
  const skipped = results.filter((r) => r.pass === null).length;
  const report = {
    base: BASE,
    date: new Date().toISOString(),
    summary: { passed, failed, skipped, total: results.length },
    results,
    screenshots: SHOT,
  };

  writeFileSync(
    resolve(__dirname, "../docs/MANUAL_QA_COMPLETION_RESULTS.json"),
    JSON.stringify(report, null, 2)
  );
  const md = [
    "# Completion Plan Playwright Results",
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
          .slice(0, 120)} |`
    ),
    "",
    `Screenshots: \`docs/qa-screenshots/completion/\``,
    "",
  ].join("\n");
  writeFileSync(resolve(__dirname, "../docs/MANUAL_QA_COMPLETION_RESULTS.md"), md);

  console.log("\n=== SUMMARY ===");
  console.log(`PASS ${passed}  FAIL ${failed}  SKIP ${skipped}`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
