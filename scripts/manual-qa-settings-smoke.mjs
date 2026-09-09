/**
 * Clinic Settings free-tier smoke checklist.
 * Run: QA_BASE_URL=http://127.0.0.1:5174 node scripts/manual-qa-settings-smoke.mjs
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.QA_BASE_URL || "http://127.0.0.1:5174";
const SHOT = resolve(__dirname, "../docs/qa-screenshots/settings-smoke");
const OUT_JSON = resolve(__dirname, "../docs/MANUAL_QA_SETTINGS_SMOKE_RESULTS.json");
const OUT_MD = resolve(__dirname, "../docs/MANUAL_QA_SETTINGS_SMOKE_RESULTS.md");
const results = [];
const stamp = Date.now();
const PREFIX = `SMK${String(stamp).slice(-4)}`;

function record(id, pass, detail = "") {
  const status = pass === null ? "SKIP" : pass ? "PASS" : "FAIL";
  results.push({
    id,
    status,
    pass,
    detail: String(detail).replace(/\s+/g, " ").slice(0, 280),
  });
  console.log(
    `[${status}] ${id}${detail ? " — " + String(detail).replace(/\s+/g, " ").slice(0, 180) : ""}`
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
  await page.waitForTimeout(1500);
}

async function content(page) {
  const el = page.locator(".page-wrapper .content, .content, main, body").first();
  try {
    return await el.innerText({ timeout: 5000 });
  } catch {
    return page.locator("body").innerText();
  }
}

async function waitContent(page, pred, maxSec = 30) {
  let last = "";
  for (let i = 0; i < maxSec; i++) {
    await page.waitForTimeout(1000);
    last = await content(page);
    if (pred(last)) return last;
  }
  return last;
}

async function shot(page, name) {
  await page.screenshot({ path: resolve(SHOT, `${name}.png`), fullPage: true });
}

async function waitSuccess(page, re, sec = 20) {
  for (let i = 0; i < sec; i++) {
    await page.waitForTimeout(1000);
    const danger = page.locator(".alert-danger");
    if (await danger.count()) {
      const msg = (await danger.first().innerText()).trim();
      if (msg) throw new Error(msg);
    }
    const success = page.locator(".alert-success");
    if (await success.count()) {
      const msg = await success.first().innerText();
      if (re.test(msg)) return msg;
    }
    const t = await content(page);
    if (re.test(t)) return t;
  }
  throw new Error(`success not seen: ${re}`);
}

async function gotoSettings(page, path, titleRe) {
  await page.goto(BASE + path, { waitUntil: "domcontentloaded", timeout: 60000 });
  const t = await waitContent(
    page,
    (txt) => titleRe.test(txt) && !/Failed to resolve import/i.test(txt),
    40
  );
  if (/Failed to resolve import|Internal server error/i.test(t)) {
    throw new Error("Vite module error on page");
  }
  return t;
}

async function fillByLabel(page, labelText, value) {
  const label = page.locator("label.form-label", { hasText: labelText }).first();
  await label.waitFor({ timeout: 15000 });
  const input = label.locator("xpath=following-sibling::input[1]");
  if (await input.count()) {
    await input.fill(value);
    return;
  }
  const parentInput = label.locator("..").locator("input, textarea, select").first();
  await parentInput.fill(value);
}

async function main() {
  mkdirSync(SHOT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  let adminPassword = "Admin123!";
  const tempPassword = `TempSmoke${stamp}!`;
  let invoiceNumber = null;

  // ---------- Admin login ----------
  try {
    await wipe(page);
    await login(page, "admin@example.com", adminPassword);
    record("S0 admin-login", /dashboard/i.test(page.url()), page.url());
  } catch (err) {
    record("S0 admin-login", false, String(err));
    await browser.close();
    writeResults();
    process.exit(1);
  }

  // ---------- S1 Change password (then restore) ----------
  try {
    await gotoSettings(page, "/security-settings", /Change password/i);
    const form = page.locator('[data-testid="change-password-form"]');
    await form.locator('input[type="password"]').nth(0).fill(adminPassword);
    await form.locator('input[type="password"]').nth(1).fill(tempPassword);
    await form.locator('input[type="password"]').nth(2).fill(tempPassword);
    await form.locator('button[type="submit"]').click();
    const t1 = await waitSuccess(page, /Password updated/i, 25);
    record("S1a change-password", true, t1.slice(0, 80));
    adminPassword = tempPassword;

    await form.locator('input[type="password"]').nth(0).fill(adminPassword);
    await form.locator('input[type="password"]').nth(1).fill("Admin123!");
    await form.locator('input[type="password"]').nth(2).fill("Admin123!");
    await form.locator('button[type="submit"]').click();
    const t2 = await waitSuccess(page, /Password updated/i, 25);
    adminPassword = "Admin123!";
    record("S1b restore-password", true, t2.slice(0, 80));
    await shot(page, "S1-security");
  } catch (err) {
    record("S1a change-password", false, String(err));
    record("S1b restore-password", false, String(err));
    await shot(page, "S1-fail");
  }

  // ---------- S2 Organization ----------
  try {
    await gotoSettings(page, "/organization-settings", /Clinic name/i);
    await waitContent(page, (t) => /Clinic name/i.test(t) && !/\bLoading…\b|\bLoading\.\.\./i.test(t), 30);
    const clinicName = `Smoke Clinic ${stamp}`;
    await fillByLabel(page, "Clinic name", clinicName);
    await fillByLabel(page, "Phone", "+1 555 010 9999");
    await page.click('button.btn-primary[type="submit"]');
    const t = await waitSuccess(page, /Organization settings saved/i, 25);
    record("S2 organization", true, clinicName);
    await shot(page, "S2-organization");
  } catch (err) {
    record("S2 organization", false, String(err));
    await shot(page, "S2-fail");
  }

  // ---------- S3 Working hours ----------
  try {
    await gotoSettings(page, "/working-hours-settings", /Working Hours/i);
    await page.locator('input[type="time"]').first().waitFor({ timeout: 20000 });
    await page.locator('input[type="time"]').first().fill("08:30");
    await page.click('button.btn-primary[type="submit"]');
    await waitSuccess(page, /Working hours saved/i, 25);
    record("S3 working-hours", true, "08:30");
    await shot(page, "S3-hours");
  } catch (err) {
    record("S3 working-hours", false, String(err));
    await shot(page, "S3-fail");
  }

  // ---------- S4 Cancellation reason ----------
  const reasonLabel = `Smoke cancel ${stamp}`;
  try {
    await gotoSettings(page, "/cancellation-reason-settings", /Cancellation Reasons/i);
    await page.fill('input[placeholder="Reason label"]', reasonLabel);
    await page.fill('input[placeholder="Sort"]', "99");
    await page.click('button.btn-primary[type="submit"]');
    await waitContent(page, (t) => t.includes(reasonLabel), 20);
    const danger = await page.locator(".alert-danger").count();
    record("S4 cancellation-reason", danger === 0, reasonLabel);
    await shot(page, "S4-cancel");
  } catch (err) {
    record("S4 cancellation-reason", false, String(err));
    await shot(page, "S4-fail");
  }

  // ---------- S5 Tax rate ----------
  const taxName = `Smoke Tax ${stamp}`;
  try {
    await gotoSettings(page, "/tax-rates-settings", /Tax Rates/i);
    await page.fill('input[placeholder="Name"]', taxName);
    await page.fill('input[placeholder="Rate %"]', "7.5");
    await page.click('button.btn-primary[type="submit"]');
    await waitContent(page, (t) => t.includes(taxName), 20);
    const danger = await page.locator(".alert-danger").count();
    record("S5 tax-rate", danger === 0, taxName);
    await shot(page, "S5-tax");
  } catch (err) {
    record("S5 tax-rate", false, String(err));
    await shot(page, "S5-fail");
  }

  // ---------- S6 Currency ----------
  const curCode = `Z${String(stamp).slice(-2)}`;
  try {
    await gotoSettings(page, "/currencies-settings", /Currencies/i);
    await page.fill('input[placeholder="Code"]', curCode);
    await page.fill('input[placeholder="Symbol"]', "¤");
    await page.fill('input[placeholder="Name"]', `Smoke Currency ${stamp}`);
    await page.click('button.btn-primary[type="submit"]');
    await waitContent(page, (t) => t.includes(curCode), 20);
    const danger = await page.locator(".alert-danger").count();
    record("S6 currency", danger === 0, curCode);
    await shot(page, "S6-currency");
  } catch (err) {
    record("S6 currency", false, String(err));
    await shot(page, "S6-fail");
  }

  // ---------- S7 Bank account ----------
  const bankAcct = `Smoke Acct ${stamp}`;
  try {
    await gotoSettings(page, "/bank-accounts-settings", /Bank Accounts/i);
    await page.fill('input[placeholder="Account name"]', bankAcct);
    await page.fill('input[placeholder="Bank"]', "Smoke Bank");
    await page.fill('input[placeholder="Account number"]', `9${stamp}`);
    await page.click('button.btn-primary[type="submit"]');
    await waitContent(page, (t) => t.includes(bankAcct), 20);
    const danger = await page.locator(".alert-danger").count();
    record("S7 bank-account", danger === 0, bankAcct);
    await shot(page, "S7-bank");
  } catch (err) {
    record("S7 bank-account", false, String(err));
    await shot(page, "S7-fail");
  }

  // ---------- S8 Payment methods ----------
  try {
    await gotoSettings(page, "/payment-methods-settings", /Payment Methods/i);
    await waitContent(page, (t) => /Cash/i.test(t) && !/\bLoading…\b/i.test(t), 30);
    const switches = page.locator('form .form-check-input[type="checkbox"]');
    const count = await switches.count();
    if (count < 1) throw new Error("no payment method switches");
    await switches.nth(count - 1).click();
    await page.click('button.btn-primary[type="submit"]');
    await waitSuccess(page, /Payment method flags saved/i, 25);
    record("S8 payment-methods", true, `toggled ${count} methods`);
    await shot(page, "S8-payments");
  } catch (err) {
    record("S8 payment-methods", false, String(err));
    await shot(page, "S8-fail");
  }

  // ---------- S9 Invoice prefix ----------
  try {
    await gotoSettings(page, "/prefixes-settings", /Invoice prefix/i);
    await fillByLabel(page, "Invoice prefix", PREFIX);
    await page.click('button.btn-primary[type="submit"]');
    await waitSuccess(page, /Invoice prefix saved/i, 25);
    record("S9 invoice-prefix", true, PREFIX);
    await shot(page, "S9-prefix");
  } catch (err) {
    record("S9 invoice-prefix", false, String(err));
    await shot(page, "S9-fail");
  }

  // ---------- S10 Create invoice (prefix must appear) ----------
  try {
    await page.goto(BASE + "/add-invoices", { waitUntil: "domcontentloaded" });
    await waitContent(page, (t) => /Create Invoice/i.test(t), 40);
    const patientSelect = page.locator('select[name="patientId"]');
    await patientSelect.waitFor({ timeout: 20000 });
    let pick = null;
    for (let i = 0; i < 40; i++) {
      const values = await patientSelect.evaluate((sel) =>
        Array.from(sel.options).map((o) => ({
          value: o.value,
          label: (o.textContent || "").trim(),
        }))
      );
      const demo = values.find((o) => /^Demo Patient$/.test(o.label));
      pick = demo || values.find((o) => o.value);
      if (pick?.value) break;
      await page.waitForTimeout(1000);
    }
    if (!pick?.value) throw new Error("no patient options");
    await patientSelect.selectOption(pick.value);
    await page.fill('input[name="lineItems.0.description"]', "Settings smoke consult");
    await page.fill('input[name="lineItems.0.quantity"]', "1");
    await page.fill('input[name="lineItems.0.unitPrice"]', "99");
    await page.fill('input[name="notes"]', `QA-SETTINGS-${stamp}`);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/invoices-details\//, { timeout: 45000 }).catch(() => {});
    await page.waitForTimeout(3000);
    const text = await content(page);
    const url = page.url();
    const numRe = new RegExp(`${PREFIX}-\\d{4,}`, "i");
    invoiceNumber = text.match(numRe)?.[0] || text.match(/[A-Z0-9]+-\d{4,}/)?.[0] || null;
    const ok =
      /invoices-details/i.test(url) &&
      Boolean(invoiceNumber) &&
      numRe.test(invoiceNumber || "");
    record(
      "S10 create-invoice-prefix",
      ok,
      `${invoiceNumber || "no-number"} ${url}`
    );
    await shot(page, "S10-invoice");
  } catch (err) {
    record("S10 create-invoice-prefix", false, String(err));
    await shot(page, "S10-fail");
  }

  // ---------- S11 GDPR enable + accept ----------
  try {
    await gotoSettings(page, "/gdpr-cookies-settings", /GDPR Cookies|cookie consent/i);
    await waitContent(page, (t) => /Show cookie consent/i.test(t) && !/\bLoading…\b/i.test(t), 25);
    const enabled = page.locator("#gdpr-enabled");
    if (!(await enabled.isChecked())) await enabled.check();
    const textarea = page.locator("textarea.form-control").first();
    await textarea.fill(`Smoke GDPR banner ${stamp}`);
    await page.click('button.btn-primary[type="submit"]');
    await waitSuccess(page, /GDPR cookie settings saved/i, 25);

    await page.evaluate(() => localStorage.removeItem("preclinic_gdpr_accepted"));
    // Navigate away then back so banner effect re-runs on pathname change
    await page.goto(BASE + "/organization-settings", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1000);
    await page.goto(BASE + "/dashboard", { waitUntil: "domcontentloaded" });
    const banner = page.locator('[data-testid="gdpr-banner"]');
    let visible = false;
    for (let i = 0; i < 20; i++) {
      visible = await banner.isVisible().catch(() => false);
      if (visible) break;
      await page.waitForTimeout(500);
    }
    if (visible) {
      await banner.locator('button:has-text("Accept")').click();
      await page.waitForTimeout(500);
      const gone = !(await banner.isVisible().catch(() => false));
      const stored = await page.evaluate(
        () => localStorage.getItem("preclinic_gdpr_accepted") === "1"
      );
      record("S11 gdpr-banner-accept", gone && stored, "accepted");
    } else {
      record("S11 gdpr-banner-accept", false, "banner not visible after enable");
    }
    await shot(page, "S11-gdpr");
  } catch (err) {
    record("S11 gdpr-banner-accept", false, String(err));
    await shot(page, "S11-fail");
  }

  // ---------- S12 Maintenance on → patient/doctor blocked, admin OK ----------
  try {
    await gotoSettings(page, "/maintenance-mode-settings", /Maintenance Mode/i);
    await waitContent(page, (t) => /Enable maintenance/i.test(t) && !/\bLoading…\b/i.test(t), 25);
    const maint = page.locator("#maint-enabled");
    if (!(await maint.isChecked())) await maint.check();
    await page.locator("textarea.form-control").first().fill(`Smoke maintenance ${stamp}`);
    await page.click('button.btn-primary[type="submit"]');
    await waitSuccess(page, /Maintenance mode ON/i, 25);
    record("S12a maintenance-on", true, "enabled");

    // Admin still OK
    await page.goto(BASE + "/dashboard", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    const adminText = await content(page);
    const adminOk =
      !/Under maintenance/i.test(adminText) && /dashboard/i.test(page.url());
    record("S12b admin-not-blocked", adminOk, page.url());

    // Patient blocked
    await wipe(page);
    await login(page, "patient@example.com", "Patient123!");
    await page.waitForTimeout(2500);
    let body = await page.locator("body").innerText();
    const patientBlocked = /Under maintenance/i.test(body);
    record("S12c patient-blocked", patientBlocked, body.slice(0, 100));
    await shot(page, "S12-patient");

    // Doctor blocked
    await wipe(page);
    await login(page, "doctor@example.com", "Doctor123!");
    await page.waitForTimeout(2500);
    body = await page.locator("body").innerText();
    const doctorBlocked = /Under maintenance/i.test(body);
    record("S12d doctor-blocked", doctorBlocked, body.slice(0, 100));
    await shot(page, "S12-doctor");

    // Turn maintenance off as admin
    await wipe(page);
    await login(page, "admin@example.com", adminPassword);
    await page.goto(BASE + "/maintenance-mode-settings", {
      waitUntil: "domcontentloaded",
    });
    await waitContent(page, (t) => /Maintenance Mode/i.test(t) && !/Loading/i.test(t), 30);
    if (await page.locator("#maint-enabled").isChecked()) {
      await page.locator("#maint-enabled").uncheck();
    }
    await page.click('button[type="submit"]');
    await waitSuccess(page, /Maintenance mode OFF/i, 20);
    record("S12e maintenance-off", true, "disabled");
  } catch (err) {
    record("S12 maintenance", false, String(err));
    await shot(page, "S12-fail");
    // Best-effort disable
    try {
      await wipe(page);
      await login(page, "admin@example.com", adminPassword);
      await page.goto(BASE + "/maintenance-mode-settings", {
        waitUntil: "domcontentloaded",
      });
      await page.waitForTimeout(2000);
      if (await page.locator("#maint-enabled").isChecked()) {
        await page.locator("#maint-enabled").uncheck();
        await page.click('button[type="submit"]');
        await page.waitForTimeout(2000);
      }
    } catch {}
  }

  // ---------- S13 Applications gone from sidebar ----------
  try {
    await page.goto(BASE + "/dashboard", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);
    const sidebarText = await page
      .locator(".sidebar, #sidebar, .sidebar-menu, .main-wrapper")
      .first()
      .innerText()
      .catch(() => content(page));
    const hasApps =
      /\bApplications\b/i.test(sidebarText) ||
      /\bKanban\b/i.test(sidebarText) ||
      /\bFile Manager\b/i.test(sidebarText) ||
      /\bSocial Feed\b/i.test(sidebarText);
    record(
      "S13 applications-removed",
      !hasApps,
      hasApps ? "Applications still visible" : "no Applications submenu"
    );
    await shot(page, "S13-sidebar");
  } catch (err) {
    record("S13 applications-removed", false, String(err));
  }

  // ---------- Restore invoice prefix to INV ----------
  try {
    await page.goto(BASE + "/prefixes-settings", { waitUntil: "domcontentloaded" });
    await waitContent(page, (t) => /Invoice prefix/i.test(t) && !/Loading/i.test(t), 25);
    await fillByLabel(page, "Invoice prefix", "INV");
    await page.click('button[type="submit"]');
    await waitSuccess(page, /Invoice prefix saved/i, 15);
    record("S14 restore-prefix", true, "INV");
  } catch (err) {
    record("S14 restore-prefix", false, String(err));
  }

  // Disable GDPR banner for cleanliness
  try {
    await page.goto(BASE + "/gdpr-cookies-settings", { waitUntil: "domcontentloaded" });
    await waitContent(page, (t) => /GDPR/i.test(t) && !/Loading/i.test(t), 20);
    if (await page.locator("#gdpr-enabled").isChecked()) {
      await page.locator("#gdpr-enabled").uncheck();
      await page.click('button[type="submit"]');
      await waitSuccess(page, /GDPR cookie settings saved/i, 15);
    }
    record("S15 restore-gdpr-off", true, "disabled");
  } catch (err) {
    record("S15 restore-gdpr-off", false, String(err));
  }

  await browser.close();
  writeResults();
  const failed = results.filter((r) => r.pass === false).length;
  process.exit(failed ? 1 : 0);
}

function writeResults() {
  const failed = results.filter((r) => r.pass === false).length;
  const passed = results.filter((r) => r.pass === true).length;
  const skipped = results.filter((r) => r.pass === null).length;
  writeFileSync(OUT_JSON, JSON.stringify({ passed, failed, skipped, results }, null, 2));
  const lines = [
    "# Clinic Settings Smoke Results",
    "",
    `Passed: ${passed} · Failed: ${failed} · Skipped: ${skipped}`,
    "",
    "| ID | Status | Detail |",
    "|----|--------|--------|",
    ...results.map(
      (r) => `| ${r.id} | ${r.status} | ${r.detail.replace(/\|/g, "/")} |`
    ),
    "",
  ];
  writeFileSync(OUT_MD, lines.join("\n"));
  console.log(`\nSummary: ${passed} passed, ${failed} failed, ${skipped} skipped`);
  console.log(`Wrote ${OUT_MD}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
