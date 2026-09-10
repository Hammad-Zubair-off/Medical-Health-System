/**
 * Doctor–patient appointment chat smoke.
 * Run: QA_BASE_URL=http://127.0.0.1:5174 node scripts/manual-qa-chat.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.QA_BASE_URL || "http://127.0.0.1:5174";
const results = [];

function record(id, pass, detail = "") {
  const status = pass ? "PASS" : "FAIL";
  results.push({ id, status, pass, detail: String(detail).slice(0, 200) });
  console.log(`[${status}] ${id}${detail ? " — " + String(detail).slice(0, 140) : ""}`);
}

async function wipe(page) {
  await page.goto(BASE + "/login", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate(async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
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

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const marker = `QA-CHAT-${Date.now()}`;

  try {
    await wipe(page);
    await login(page, "doctor@example.com", "Doctor123!");
    await page.goto(BASE + "/doctor/messages", { waitUntil: "domcontentloaded" });
    await page.waitForSelector('[data-testid="appointment-chat"]', { timeout: 20000 });
    const doctorTitle = await page.locator('[data-testid="chat-page-title"]').innerText();
    record("C.doctor-messages-page", /Messages/i.test(doctorTitle), doctorTitle);

    const threadBtn = page.locator('[data-testid^="chat-thread-"]').first();
    const hasThread = (await threadBtn.count()) > 0;
    if (hasThread) {
      await threadBtn.click();
      await page.waitForTimeout(2000);
      await page.waitForSelector('[data-testid="chat-composer"]', { timeout: 15000 });
      record("C.doctor-open-thread", true, page.url());
    } else {
      record("C.doctor-open-thread", false, "No chat threads — re-run seed");
    }

    await wipe(page);
    await login(page, "patient@example.com", "Patient123!");
    await page.goto(BASE + "/patient/messages", { waitUntil: "domcontentloaded" });
    await page.waitForSelector('[data-testid="appointment-chat"]', { timeout: 20000 });
    record(
      "C.patient-messages-page",
      /Messages/i.test(await page.locator('[data-testid="chat-page-title"]').innerText())
    );

    const patientThread = page.locator('[data-testid^="chat-thread-"]').first();
    if ((await patientThread.count()) > 0) {
      await patientThread.click();
      await page.waitForSelector('[data-testid="chat-input"]', { timeout: 15000 });
      await page.fill('[data-testid="chat-input"]', marker);
      await page.click('[data-testid="chat-send"]');
      await page.waitForTimeout(3000);
      const list = await page.locator('[data-testid="chat-message-list"]').innerText();
      record("C.patient-send-message", list.includes(marker), list.slice(0, 160));
    } else {
      record("C.patient-send-message", false, "No threads for patient — re-run seed");
    }

    await wipe(page);
    await login(page, "doctor@example.com", "Doctor123!");
    await page.goto(BASE + "/doctor/messages", { waitUntil: "domcontentloaded" });
    await page.waitForSelector('[data-testid="appointment-chat"]', { timeout: 20000 });
    const t2 = page.locator('[data-testid^="chat-thread-"]').first();
    if ((await t2.count()) > 0) {
      await t2.click();
      await page.waitForTimeout(2500);
      const list = await page.locator('[data-testid="chat-message-list"]').innerText();
      record("C.doctor-sees-patient-message", list.includes(marker), list.slice(0, 160));
    } else {
      record("C.doctor-sees-patient-message", false, "No threads");
    }
  } catch (err) {
    record("C.chat-suite", false, String(err).slice(0, 180));
  }

  await browser.close();
  const failed = results.filter((r) => !r.pass).length;
  console.log(`\n=== SUMMARY ===\nPASS ${results.length - failed}  FAIL ${failed}`);
  process.exit(failed ? 1 : 0);
}

main();
