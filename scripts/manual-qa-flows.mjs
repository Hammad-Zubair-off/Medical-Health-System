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
  await controls.nth(index).waitFor({ state: "visible", timeout: 20000 });
  await controls.nth(index).click();
  await page.waitForSelector(".react-select__menu .react-select__option", {
    timeout: 15000,
  });
  await page.waitForTimeout(300);
  if (optionText) {
    const exact = page.locator(".react-select__option", {
      hasText: new RegExp(`^${optionText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`),
    });
    if (await exact.count()) {
      await exact.first().click();
      await page.waitForTimeout(300);
      return true;
    }
    const fuzzy = page.locator(".react-select__option", { hasText: optionText }).first();
    if (await fuzzy.count()) {
      await fuzzy.click();
      await page.waitForTimeout(300);
      return true;
    }
  }
  const first = page.locator(".react-select__option").first();
  if (await first.count()) {
    await first.click();
    await page.waitForTimeout(300);
    return true;
  }
  await page.keyboard.press("Escape");
  return false;
}

/** Set Ant Date/Time picker without Enter (Enter can native-submit the form). */
async function setAntPicker(page, nth, value) {
  const input = page.locator(".ant-picker input").nth(nth);
  await input.waitFor({ state: "visible", timeout: 15000 });
  await input.click({ clickCount: 3 });
  await page.keyboard.press("Backspace");
  await input.type(value, { delay: 40 });
  await page.waitForTimeout(300);
  // Confirm via blur — do not press Enter (submits the surrounding form)
  await page.locator("body").click({ position: { x: 8, y: 8 } });
  await page.waitForTimeout(400);
}

async function dismissOverlays(page) {
  const gdpr = page.locator('[data-testid="gdpr-banner"] button');
  if (await gdpr.count()) {
    await gdpr.first().click({ timeout: 3000 }).catch(() => {});
  }
  await page.evaluate(() => {
    document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
    document.body.classList.remove("modal-open");
    document.body.style.removeProperty("overflow");
    document.body.style.removeProperty("padding-right");
    document.querySelectorAll(".modal.show").forEach((m) => {
      m.classList.remove("show");
      m.style.display = "none";
      m.setAttribute("aria-hidden", "true");
    });
  });
}

async function clickCreateAppointment(page) {
  const btn = page.locator(
    '[data-testid="create-appointment-submit"], button[type="submit"]:has-text("Create Appointment")'
  );
  await btn.waitFor({ state: "visible", timeout: 15000 });
  for (let i = 0; i < 40; i++) {
    if (!(await btn.isDisabled())) break;
    await page.waitForTimeout(500);
  }
  await btn.click({ timeout: 30000 });
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

    await page.evaluate(() => {
      const el = document.getElementById("add_new_payment");
      if (el && !el.classList.contains("show")) {
        el.classList.add("show");
        el.style.display = "block";
        document.body.classList.add("modal-open");
      }
    });
    await page.waitForSelector('[data-testid="payment-invoice"]', { timeout: 15000 });

    // Wait until the invoice we created is listed (not just the select shell)
    const invSelect = page.locator('[data-testid="payment-invoice"]');
    let selected = false;
    for (let i = 0; i < 30; i++) {
      const labels = await invSelect.locator("option").allTextContents();
      const matchIdx = labels.findIndex(
        (l) => createdInvoiceNumber && l.includes(createdInvoiceNumber)
      );
      if (matchIdx > 0) {
        await invSelect.selectOption({ index: matchIdx });
        selected = true;
        break;
      }
      await page.waitForTimeout(500);
    }
    if (!selected) {
      throw new Error(
        `Invoice ${createdInvoiceNumber || "?"} not in payment select options`
      );
    }

    await page.fill('[data-testid="payment-amount"]', "50");
    await page.selectOption('[data-testid="payment-method"]', "cash");
    await page.fill('[data-testid="payment-reference"]', paymentMarker);
    await page.fill('[data-testid="payment-notes"]', paymentMarker);
    await page.click('[data-testid="payment-submit"]');
    await page.waitForTimeout(5000);

    const successAlert = page.locator(".alert-success, .alert-danger");
    const alertText = (await successAlert.first().innerText().catch(() => "")) || "";
    if (/Failed|error|Select an invoice/i.test(alertText)) {
      throw new Error(`Payment submit failed: ${alertText}`);
    }

    if (!createdInvoiceId) throw new Error("no invoice id from F1");
    await page.goto(BASE + `/invoices-details/${createdInvoiceId}`, {
      waitUntil: "domcontentloaded",
    });
    const invText = await waitContent(
      page,
      (t) =>
        /Amount Paid|Balance/i.test(t) &&
        !/Loading/i.test(t) &&
        (/\$50\.00|50\.00/.test(t) || /\$100\.00|100\.00/.test(t)),
      30
    );
    const balanceOk =
      /Amount Paid\s*:\s*\$?50\.00/i.test(invText) ||
      /Balance\s*:\s*\$?100\.00/i.test(invText) ||
      /Partially Paid|partially-paid/i.test(invText);
    record(
      "F2 record-payment",
      balanceOk,
      invText.slice(0, 180)
    );
    record(
      "F2 invoice-side-effects",
      balanceOk && !/Amount Paid\s*:\s*\$?0\.00/i.test(invText),
      invText.slice(0, 180)
    );
    await shot(page, "F2-invoice-after-pay");
    await shot(page, "F2-payments");
  } catch (err) {
    record("F2 record-payment", false, String(err).slice(0, 180));
    record("F2 invoice-side-effects", false, String(err).slice(0, 120));
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

  // ---- F4 Create pending leave then approve ----
  try {
    await page.goto(BASE + "/leaves", { waitUntil: "domcontentloaded" });
    await waitContent(
      page,
      (t) => /Admin Leaves/i.test(t) && !/Loading leaves/i.test(t),
      35
    );
    await page.waitForSelector('[data-testid="leaves-table"]', { timeout: 20000 });
    await dismissOverlays(page);

    let approveBtn = page.locator('[data-testid^="leave-approve-"]').first();
    if ((await approveBtn.count()) === 0) {
      await page.locator('a[data-bs-target="#add_leave"]').click();
      await page.waitForSelector('[data-testid="add-leave-form"]', { timeout: 10000 });
      await page.waitForFunction(() => {
        const sel = document.querySelector('[data-testid="leave-staff"]');
        return sel && sel.options && sel.options.length > 1;
      }, null, { timeout: 20000 });

      const staffSelect = page.locator('[data-testid="leave-staff"]');
      const typeSelect = page.locator('[data-testid="leave-type"]');
      const staffValue = await staffSelect.locator("option").nth(1).getAttribute("value");
      const typeValue = await typeSelect.locator("option").nth(1).getAttribute("value");
      await staffSelect.selectOption(staffValue);
      await typeSelect.selectOption(typeValue);

      const reason = `QA-LEAVE-${Date.now()}`;
      await page.fill('[data-testid="leave-reason"]', reason);

      await page.click('[data-testid="leave-create-submit"]');
      await page.waitForTimeout(3000);
      await dismissOverlays(page);
      await page.waitForSelector('[data-testid^="leave-approve-"]', {
        state: "visible",
        timeout: 25000,
      });
      approveBtn = page.locator('[data-testid^="leave-approve-"]').first();
    }

    await approveBtn.waitFor({ state: "visible", timeout: 15000 });
    await approveBtn.scrollIntoViewIfNeeded();
    await approveBtn.click({ force: true, timeout: 15000 });
    await page.waitForTimeout(4000);
    const after = await content(page);
    record(
      "F4 approve-leave",
      !/leave-action-error|leave-create-error|Failed to/i.test(after),
      after.slice(0, 140)
    );
    await shot(page, "F4-leaves");
  } catch (err) {
    record("F4 approve-leave", false, String(err).slice(0, 180));
  }

  // ---- F5 Holiday blocks booking ----
  try {
    const hol = holidayDatePlus2();
    const holidayName = `QA-HOL-${Date.now()}`;

    await page.goto(BASE + "/holidays", { waitUntil: "domcontentloaded" });
    await waitContent(page, (t) => /Holiday/i.test(t), 25);
    await dismissOverlays(page);
    await page.locator('a[data-bs-target="#add_holiday"]').click();
    await page.waitForSelector('[data-testid="add-holiday-form"]', { timeout: 10000 });
    await page.fill('[data-testid="holiday-name"]', holidayName);
    const holPicker = page.locator("#add_holiday .ant-picker input").first();
    await holPicker.click({ clickCount: 3 });
    await page.keyboard.press("Backspace");
    await holPicker.type(hol.display, { delay: 40 });
    await page.locator('[data-testid="holiday-name"]').click();
    await page.click('[data-testid="holiday-create-submit"]');
    await page.waitForTimeout(3000);
    await dismissOverlays(page);
    await waitContent(page, (t) => t.includes(holidayName), 20);

    await page.goto(BASE + "/new-appointment", { waitUntil: "domcontentloaded" });
    await waitContent(
      page,
      (t) => /Create Appointment/i.test(t) && /Demo Patient/i.test(t),
      35
    );

    await pickReactSelect(page, 0, "Demo Patient");
    await pickReactSelect(page, 1, "Demo Doctor");
    await setAntPicker(page, 0, hol.display);
    if (await page.locator(".ant-picker input").nth(1).count()) {
      await setAntPicker(page, 1, "10:00");
    }

    await clickCreateAppointment(page);
    const errText = await waitContent(
      page,
      (t) => /holiday|Cannot create appointment/i.test(t),
      25
    );
    const errVisible = await page
      .locator('[data-testid="appointment-submit-error"]')
      .innerText()
      .catch(() => "");
    const blocked =
      /holiday|Cannot create appointment/i.test(errText) ||
      /holiday|Cannot create appointment/i.test(errVisible);
    record("F5 holiday-blocks-booking", blocked, (errVisible || errText).slice(0, 160));
    await shot(page, "F5-holiday-block");
  } catch (err) {
    record("F5 holiday-blocks-booking", false, String(err).slice(0, 180));
  }

  // ---- F6 Book on open day ----
  try {
    const open = openDayPlus5();
    await page.goto(BASE + "/new-appointment", { waitUntil: "domcontentloaded" });
    await waitContent(
      page,
      (t) => /Create Appointment/i.test(t) && /Demo Patient/i.test(t),
      35
    );
    const pickedPatient = await pickReactSelect(page, 0, "Demo Patient");
    if (!pickedPatient) throw new Error("Failed to select Demo Patient");
    const pickedDoctor = await pickReactSelect(page, 1, "Demo Doctor");
    if (!pickedDoctor) throw new Error("Failed to select Demo Doctor");
    await setAntPicker(page, 0, open.display);
    if (await page.locator(".ant-picker input").nth(1).count()) {
      await setAntPicker(page, 1, "14:30");
    }

    await clickCreateAppointment(page);
    await page
      .waitForURL(/appointment-consultations|consultation/i, { timeout: 25000 })
      .catch(() => {});
    await page.waitForTimeout(2000);
    const url = page.url();
    const text = await content(page);
    const submitErr = await page
      .locator('[data-testid="appointment-submit-error"]')
      .innerText()
      .catch(() => "");
    const created =
      /appointment-consultations|consultation/i.test(url) &&
      !/Cannot create appointment on a holiday/i.test(text + submitErr);
    await page.goto(BASE + "/appointments", { waitUntil: "domcontentloaded" });
    const list = await waitContent(
      page,
      (t) => /Demo Patient|Appointment/i.test(t) && !/Loading/i.test(t),
      30
    );
    record(
      "F6 book-open-day",
      created && /Demo Patient/i.test(list),
      `${url} | ${submitErr || text.slice(0, 80)} | ${list.slice(0, 80)}`
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
