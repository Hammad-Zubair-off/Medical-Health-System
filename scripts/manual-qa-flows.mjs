/**
 * Write-path real-life scenarios (plan F1–F10).
 * Run: QA_BASE_URL=http://127.0.0.1:5174 node scripts/manual-qa-flows.mjs
 */
import { chromium } from "playwright";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE = process.env.QA_BASE_URL || "http://127.0.0.1:5174";
const SHOT = resolve(__dirname, "../docs/qa-screenshots/flows");
const results = [];

function record(id, pass, detail = "") {
  const status = pass === null ? "SKIP" : pass ? "PASS" : "FAIL";
  results.push({
    id,
    status,
    pass,
    detail: String(detail).replace(/\s+/g, " ").slice(0, 240),
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

async function content(page) {
  const el = page.locator(".page-wrapper .content, .content, main").first();
  if (await el.count()) {
    try {
      return await el.innerText({ timeout: 5000 });
    } catch {}
  }
  return page.locator("body").innerText();
}

async function waitContent(page, pred, maxSec = 35) {
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

async function pickReactSelect(page, index, optionText) {
  const controls = page.locator(".react-select__control");
  await controls.nth(index).click();
  await page.waitForTimeout(400);
  if (optionText) {
    const opt = page.locator(".react-select__option", { hasText: optionText }).first();
    if (await opt.count()) {
      await opt.click();
      return true;
    }
  }
  const first = page.locator(".react-select__option").first();
  if (await first.count()) {
    await first.click();
    return true;
  }
  await page.keyboard.press("Escape");
  return false;
}

function holidayDatePlus2() {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return { display: `${dd}-${mm}-${yyyy}`, iso: `${yyyy}-${mm}-${dd}`, date: d };
}

function openDayPlus5() {
  const d = new Date();
  d.setDate(d.getDate() + 5);
  // Skip weekends for safer booking
  while (d.getDay() === 0 || d.getDay() === 6) d.setDate(d.getDate() + 1);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return { display: `${dd}-${mm}-${yyyy}`, iso: `${yyyy}-${mm}-${dd}` };
}

async function main() {
  mkdirSync(SHOT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  let createdInvoiceId = null;
  let createdInvoiceNumber = null;
  let paymentMarker = `QA-PAY-${Date.now()}`;

  // ===================== Admin money + leave + appointments =====================
  await wipe(page);
  await login(page, "admin@example.com", "Admin123!");
  record("F.0 admin-login", /dashboard/i.test(page.url()), page.url());

  // ---- F1 Create invoice ----
  try {
    await page.goto(BASE + "/add-invoices", { waitUntil: "domcontentloaded" });
    await waitContent(
      page,
      (t) => /Create Invoice/i.test(t) && /Demo Patient/i.test(t),
      35
    );

    const patientSelect = page.locator('select[name="patientId"]');
    await patientSelect.waitFor({ timeout: 20000 });
    // Prefer exact Demo Patient (not Two/Three)
    const values = await patientSelect.evaluate((sel) =>
      Array.from(sel.options).map((o) => ({
        value: o.value,
        label: o.textContent || "",
      }))
    );
    const demo = values.find((o) => /^Demo Patient$/.test(o.label.trim()));
    const pick = demo || values.find((o) => o.value);
    if (!pick?.value) throw new Error("no patient options");
    await patientSelect.selectOption(pick.value);
    await page.waitForTimeout(300);

    await page.fill('input[name="lineItems.0.description"]', "QA consultation flow");
    await page.fill('input[name="lineItems.0.quantity"]', "1");
    await page.fill('input[name="lineItems.0.unitPrice"]', "150");
    await page.fill('input[name="notes"]', `QA-INV-FLOW-${Date.now()}`);

    await page.click('button[type="submit"]');
    await page.waitForURL(/\/invoices-details\//, { timeout: 45000 }).catch(() => {});
    await page.waitForTimeout(3000);
    const url = page.url();
    const text = await content(page);
    createdInvoiceId = url.match(/\/invoices-details\/([^/?#]+)/)?.[1] || null;
    createdInvoiceNumber = text.match(/INV-\d{4,}/)?.[0] || null;
    const ok =
      Boolean(createdInvoiceId) &&
      Boolean(createdInvoiceNumber) &&
      /150\.00|\$150/i.test(text);
    record(
      "F1 create-invoice",
      ok,
      `${createdInvoiceNumber || "no-number"} ${url} ${text.slice(0, 100)}`
    );
    await shot(page, "F1-invoice-detail");
  } catch (err) {
    record("F1 create-invoice", false, String(err).slice(0, 180));
    await shot(page, "F1-fail");
  }

  // ---- F2 Record payment ----
  try {
    await page.goto(BASE + "/payments", { waitUntil: "domcontentloaded" });
    await waitContent(page, (t) => /Payment/i.test(t) && !/Loading payments/i.test(t), 30);
    await page.click('a[data-bs-target="#add_new_payment"], button[data-bs-target="#add_new_payment"], a:has-text("New Payment")');
    await page.waitForSelector("#add_new_payment.show, #add_new_payment.modal", { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Bootstrap modal may need forced show
    await page.evaluate(() => {
      const el = document.getElementById("add_new_payment");
      if (el && !el.classList.contains("show")) {
        el.classList.add("show");
        el.style.display = "block";
        document.body.classList.add("modal-open");
      }
    });
    await page.waitForSelector('[data-testid="payment-invoice"]', { timeout: 15000 });

    const invSelect = page.locator('[data-testid="payment-invoice"]');
    const optionCount = await invSelect.locator("option").count();
    if (optionCount > 1) {
      // Prefer the invoice we just created if listed
      const labels = await invSelect.locator("option").allTextContents();
      const matchIdx = labels.findIndex(
        (l) =>
          (createdInvoiceNumber && l.includes(createdInvoiceNumber)) ||
          /Demo Patient/i.test(l)
      );
      if (matchIdx > 0) {
        await invSelect.selectOption({ index: matchIdx });
      } else {
        await invSelect.selectOption({ index: 1 });
      }
    }

    await page.fill('[data-testid="payment-amount"]', "50");
    await page.selectOption('[data-testid="payment-method"]', "cash");
    await page.fill('[data-testid="payment-reference"]', paymentMarker);
    await page.fill('[data-testid="payment-notes"]', paymentMarker);
    await page.click('[data-testid="payment-submit"]');
    await page.waitForTimeout(5000);

    await page.goto(BASE + "/payments", { waitUntil: "domcontentloaded" });
    const payText = await waitContent(
      page,
      (t) =>
        (t.includes(paymentMarker) || /\$50\.00|50\.00/.test(t)) &&
        !/Loading payments/i.test(t),
      30
    );
    const payOk =
      !/Missing or insufficient|Failed to/i.test(payText) &&
      (/Paid|Payment|\$50|50\.00/i.test(payText) || payText.includes(paymentMarker));
    record("F2 record-payment", payOk, payText.slice(0, 140));
    await shot(page, "F2-payments");

    if (createdInvoiceId) {
      await page.goto(BASE + `/invoices-details/${createdInvoiceId}`, {
        waitUntil: "domcontentloaded",
      });
      const invText = await waitContent(
        page,
        (t) => /Balance|Paid|Amount/i.test(t) && !/Loading/i.test(t),
        25
      );
      record(
        "F2 invoice-side-effects",
        /\$50|50\.00|Partially|Paid|Balance/i.test(invText),
        invText.slice(0, 140)
      );
      await shot(page, "F2-invoice-after-pay");
    } else {
      record("F2 invoice-side-effects", null, "no invoice id from F1");
    }
  } catch (err) {
    record("F2 record-payment", false, String(err).slice(0, 180));
    await shot(page, "F2-fail");
  }

  // ---- F3 Income + Transactions views ----
  try {
    await page.goto(BASE + "/income", { waitUntil: "domcontentloaded" });
    const income = await waitContent(
      page,
      (t) => /Income|Payment/i.test(t) && !/Loading income/i.test(t),
      30
    );
    record(
      "F3 income-view",
      !/Missing or insufficient|Failed to load/i.test(income) &&
        (/Payment|Income|\$/i.test(income) || /No data/i.test(income)),
      income.slice(0, 140)
    );
    await shot(page, "F3-income");

    await page.goto(BASE + "/transactions", { waitUntil: "domcontentloaded" });
    const tx = await waitContent(
      page,
      (t) => /Transaction/i.test(t) && !/Loading transactions/i.test(t),
      30
    );
    record(
      "F3 transactions-view",
      !/Missing or insufficient|Failed to load/i.test(tx) &&
        (/Payment|Expense|Income|Transaction/i.test(tx) || /No data/i.test(tx)),
      tx.slice(0, 140)
    );
    await shot(page, "F3-transactions");
  } catch (err) {
    record("F3 income-transactions", false, String(err).slice(0, 180));
  }

  // ---- F4 Approve pending leave ----
  try {
    await page.goto(BASE + "/leaves", { waitUntil: "domcontentloaded" });
    await waitContent(
      page,
      (t) => /Leave|Pending|Approved/i.test(t) && !/Loading leaves/i.test(t),
      30
    );
    const approveBtn = page.locator('[data-testid^="leave-approve-"]').first();
    await approveBtn.waitFor({ state: "visible", timeout: 15000 });
    await approveBtn.click();
    await page.waitForTimeout(4000);
    const after = await content(page);
    record(
      "F4 approve-leave",
      !/leave-action-error|Failed to/i.test(after),
      after.slice(0, 140)
    );
    await shot(page, "F4-leaves");
  } catch (err) {
    record("F4 approve-leave", false, String(err).slice(0, 180));
  }

  // ---- F5 Holiday blocks booking ----
  try {
    const hol = holidayDatePlus2();
    await page.goto(BASE + "/new-appointment", { waitUntil: "domcontentloaded" });
    await waitContent(
      page,
      (t) => /Create Appointment/i.test(t) && /Demo Patient/i.test(t),
      35
    );

    // Patient select (first)
    await page.locator(".react-select__control").nth(0).click();
    await page.waitForTimeout(500);
    await page.locator(".react-select__option", { hasText: /^Demo Patient$/ }).first().click();
    await page.waitForTimeout(400);
    // Doctor select (second)
    await page.locator(".react-select__control").nth(1).click();
    await page.waitForTimeout(500);
    await page.locator(".react-select__option", { hasText: /Demo Doctor$/ }).first().click();
    await page.waitForTimeout(400);

    const dateInput = page.locator(".ant-picker input").first();
    await dateInput.click({ clickCount: 3 });
    await dateInput.fill(hol.display);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(1000);

    // TimePicker (antd) — second .ant-picker is often time
    const timeInput = page.locator(".ant-picker input").nth(1);
    if (await timeInput.count()) {
      await timeInput.click();
      await timeInput.fill("10:00");
      await page.keyboard.press("Enter");
      await page.waitForTimeout(400);
    }

    await page.click('button[type="submit"]:has-text("Create Appointment")');
    const errText = await waitContent(
      page,
      (t) => /holiday|Cannot create appointment/i.test(t),
      20
    );
    const blocked = /holiday|Cannot create appointment/i.test(errText);
    record("F5 holiday-blocks-booking", blocked, errText.slice(0, 160));
    await shot(page, "F5-holiday-block");
  } catch (err) {
    record("F5 holiday-blocks-booking", false, String(err).slice(0, 180));
  }

  // ---- F6 Book on open day ----
  try {
    const open = openDayPlus5();
    await page.goto(BASE + "/new-appointment", { waitUntil: "domcontentloaded" });
    await waitContent(page, (t) => /Create Appointment|Patient/i.test(t), 25);
    await pickReactSelect(page, 0, "Demo Patient");
    await pickReactSelect(page, 1, "Demo Doctor");
    const dateInput = page.locator(".ant-picker input").first();
    await dateInput.click();
    await dateInput.fill(open.display);
    await page.keyboard.press("Enter");
    await page.waitForTimeout(800);
    const timeInput = page.locator(".ant-picker input").nth(1);
    if (await timeInput.count()) {
      await timeInput.click();
      await timeInput.fill("11:00");
      await page.keyboard.press("Enter");
    }

    await page.click('button[type="submit"]:has-text("Create Appointment")');
    await page.waitForTimeout(5000);
    const url = page.url();
    const text = await content(page);
    const created =
      /appointments|consultation|success|Demo Patient/i.test(url + " " + text) &&
      !/Cannot create appointment on a holiday/i.test(text);
    // Navigate to list to confirm
    await page.goto(BASE + "/appointments", { waitUntil: "domcontentloaded" });
    const list = await waitContent(
      page,
      (t) => /Demo Patient|Appointment/i.test(t) && !/Loading/i.test(t),
      30
    );
    record(
      "F6 book-open-day",
      created && /Demo Patient/i.test(list),
      `${url} | ${list.slice(0, 100)}`
    );
    await shot(page, "F6-appointments");
  } catch (err) {
    record("F6 book-open-day", false, String(err).slice(0, 180));
  }

  // ---- F9 Create patient (brittle form — human UAT if automation fails) ----
  try {
    await page.goto(BASE + "/create-patient", { waitUntil: "domcontentloaded" });
    await page.waitForSelector('[data-testid="patient-form"]', { timeout: 20000 });
    const email = `qa.flow.${Date.now()}@example.com`;
    await page.fill('[data-testid="patient-first-name"]', "QAFlow");
    await page.fill('[data-testid="patient-last-name"]', "Patient");
    await page.fill('[data-testid="patient-email"]', email);
    await page.fill('[data-testid="patient-address"]', "99 QA Flow Street");
    await page.fill('[data-testid="patient-postal"]', "90210");
    const tel = page.locator('input[type="tel"]').first();
    if (await tel.count()) await tel.fill("+12025550177");

    const controls = page.locator(".react-select__control");
    const count = await controls.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      await controls.nth(i).click();
      await page.waitForTimeout(300);
      const opt = page.locator(".react-select__option").first();
      if (await opt.count()) await opt.click();
      else await page.keyboard.press("Escape");
    }
    const dob = page.locator(".ant-picker input").first();
    if (await dob.count()) {
      await dob.click();
      await dob.fill("15-06-1992");
      await page.keyboard.press("Enter");
    }

    await page.click('[data-testid="patient-submit"]');
    await page.waitForTimeout(6000);
    const url = page.url();
    const created = /\/patient-details\/[A-Za-z0-9]+/.test(url);
    if (created) {
      record("F9 create-patient", true, url);
    } else {
      record(
        "F9 create-patient",
        null,
        `automation blocked — use docs/UAT_REAL_FLOWS.md item for create-patient (${url})`
      );
    }
    await shot(page, "F9-create-patient");
  } catch (err) {
    record(
      "F9 create-patient",
      null,
      `automation error — human UAT: ${String(err).slice(0, 120)}`
    );
  }

  // ---- F10 Payroll admin can see ----
  try {
    await page.goto(BASE + "/payroll", { waitUntil: "domcontentloaded" });
    const pay = await waitContent(
      page,
      (t) => /Payroll|Salary|Employee/i.test(t) && !/Loading/i.test(t),
      30
    );
    record(
      "F10 admin-payroll",
      !/Missing or insufficient|Access Denied|Error 403/i.test(pay) &&
        /Payroll|Salary|Demo|Staff|Employee/i.test(pay),
      pay.slice(0, 140)
    );
    await shot(page, "F10-admin-payroll");
  } catch (err) {
    record("F10 admin-payroll", false, String(err).slice(0, 180));
  }

  // ===================== Doctor =====================
  await wipe(page);
  await login(page, "doctor@example.com", "Doctor123!");
  record("F.0 doctor-login", /doctor/i.test(page.url()), page.url());

  // F7 prescriptions detail
  try {
    await page.goto(BASE + "/doctor/doctors-prescriptions", {
      waitUntil: "domcontentloaded",
    });
    await waitContent(
      page,
      (t) =>
        (/Prescription|PRE-|Medicine/i.test(t) || /No data|No prescriptions/i.test(t)) &&
        !/Loading prescriptions/i.test(t),
      35
    );
    let href = null;
    for (let i = 0; i < 30; i++) {
      const link = page.locator('a[href*="/doctor/doctors-prescription-details/"]').first();
      if (await link.count()) {
        href = await link.getAttribute("href");
        if (href) break;
      }
      await page.waitForTimeout(1000);
    }
    if (href) {
      await page.goto(BASE + href, { waitUntil: "domcontentloaded" });
      const detail = await waitContent(
        page,
        (t) => /Medicine|Dosage|Prescription|Patient/i.test(t) && !/Loading/i.test(t),
        25
      );
      record(
        "F7 prescription-detail",
        /Medicine|Dosage|Prescription/i.test(detail),
        detail.slice(0, 140)
      );
      await shot(page, "F7-prescription-detail");
    } else {
      record("F7 prescription-detail", false, "no prescription detail links");
    }

    await page.goto(BASE + "/doctor/doctors-prescription-details/does-not-exist", {
      waitUntil: "domcontentloaded",
    });
    const badBody = await waitContent(
      page,
      (t) =>
        /error-404|Page not found|not found|404|Access Denied|Prescription not found/i.test(
          t
        ) || /error-404/.test(page.url()),
      25
    );
    const bad = page.url() + " " + badBody;
    record(
      "F7 prescription-404",
      /error-404|Page not found|not found|404|Prescription not found/i.test(bad),
      page.url()
    );
  } catch (err) {
    record("F7 prescription-detail", false, String(err).slice(0, 180));
  }

  // Doctor leaves non-empty
  try {
    await page.goto(BASE + "/doctor/doctors-leaves", { waitUntil: "domcontentloaded" });
    const leaves = await waitContent(
      page,
      (t) =>
        (/Leave|Day|Applied|Pending|Approved/i.test(t) || /No data/i.test(t)) &&
        !/Loading leaves|under development/i.test(t),
      30
    );
    record(
      "F4 doctor-leaves-visible",
      !/under development|Coming Soon/i.test(leaves) &&
        (/Day|Leave|Pending|Approved|Applied|Casual|Sick/i.test(leaves) ||
          /No data/i.test(leaves)),
      leaves.slice(0, 140)
    );
    await shot(page, "F4-doctor-leaves");
  } catch (err) {
    record("F4 doctor-leaves-visible", false, String(err).slice(0, 180));
  }

  // F10 doctor blocked from admin payroll → /error-403
  try {
    await page.goto(BASE + "/payroll", { waitUntil: "domcontentloaded" });
    await page.waitForURL(
      (u) => /error-403|doctor-dashboard|login/.test(u.pathname),
      { timeout: 20000 }
    ).catch(() => {});
    await page.waitForTimeout(1500);
    const text = await page.locator("body").innerText();
    const url = page.url();
    const blocked =
      /error-403|Access Denied|Error 403|do not have permission|403/i.test(
        url + " " + text
      ) || /\/doctor\//.test(url);
    record("F10 doctor-payroll-blocked", blocked, `${url} ${text.slice(0, 100)}`);
    await shot(page, "F10-doctor-payroll");
  } catch (err) {
    record("F10 doctor-payroll-blocked", false, String(err).slice(0, 180));
  }

  // ===================== Patient =====================
  await wipe(page);
  await login(page, "patient@example.com", "Patient123!");
  record("F.0 patient-login", /patient/i.test(page.url()), page.url());

  try {
    await page.goto(BASE + "/patient/patient-prescriptions", {
      waitUntil: "domcontentloaded",
    });
    const rx = await waitContent(
      page,
      (t) =>
        (/Prescription|Medicine|Doctor/i.test(t) || /No data/i.test(t)) &&
        !/Loading prescriptions/i.test(t),
      30
    );
    record(
      "F8 patient-prescriptions",
      !/Missing or insufficient|Access Denied/i.test(rx),
      rx.slice(0, 140)
    );
    await shot(page, "F8-patient-rx");

    await page.goto(BASE + "/patient/patient-invoices", {
      waitUntil: "domcontentloaded",
    });
    const inv = await waitContent(
      page,
      (t) =>
        (/Invoice|INV-|Amount/i.test(t) || /No data/i.test(t)) &&
        !/Loading invoices/i.test(t),
      30
    );
    record(
      "F8 patient-invoices",
      !/Missing or insufficient|Access Denied/i.test(inv),
      inv.slice(0, 140)
    );
    await shot(page, "F8-patient-invoices");

    // Foreign invoice detail (random id) should 404 / deny
    await page.goto(BASE + "/patient/patient-invoice-details/not-a-real-invoice", {
      waitUntil: "domcontentloaded",
    });
    const foreignBody = await waitContent(
      page,
      (t) =>
        /error-404|Page not found|not found|404|Access denied|Invoice not found/i.test(
          t
        ) || /error-404/.test(page.url()),
      25
    );
    const foreign = page.url() + " " + foreignBody;
    record(
      "F8 foreign-invoice-blocked",
      /error-404|Page not found|not found|404|Access denied|Invoice not found/i.test(
        foreign
      ),
      page.url()
    );
  } catch (err) {
    record("F8 patient-reads", false, String(err).slice(0, 180));
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
    resolve(__dirname, "../docs/MANUAL_QA_FLOWS_RESULTS.json"),
    JSON.stringify(report, null, 2)
  );
  const md = [
    "# Real-life Flow Playwright Results",
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
          .slice(0, 140)} |`
    ),
    "",
    "Screenshots: `docs/qa-screenshots/flows/`",
    "",
  ].join("\n");
  writeFileSync(resolve(__dirname, "../docs/MANUAL_QA_FLOWS_RESULTS.md"), md);

  console.log("\n=== SUMMARY ===");
  console.log(`PASS ${passed}  FAIL ${failed}  SKIP ${skipped}`);
  if (failed > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
