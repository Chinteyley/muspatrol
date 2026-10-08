import { mkdirSync } from "node:fs";
import puppeteer from "puppeteer-core";

const BASE = process.env.BASE_URL ?? "http://127.0.0.1:4173";
const OUT = new URL("../docs/screenshots/", import.meta.url);
mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/google-chrome",
  headless: true,
  args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  defaultViewport: { width: 390, height: 844, deviceScaleFactor: 2 },
});

const page = await browser.newPage();
page.setDefaultTimeout(120_000);

async function shot(name) {
  const dest = new URL(`${name}.png`, OUT);
  await page.screenshot({ path: dest.pathname, fullPage: true });
  console.log("wrote", dest.pathname);
}

await page.goto(BASE, { waitUntil: "networkidle0" });
await shot("home");

await page.goto(`${BASE}/about`, { waitUntil: "networkidle0" });
await shot("about");

await page.goto(`${BASE}/patrol?judge=1`, { waitUntil: "networkidle0" });
await page.waitForSelector(".sample-grid img");
await shot("samples");

const first = await page.$(".sample-grid button");
if (!first) throw new Error("no sample button");
await first.click();
await page.waitForSelector(".choice");
await shot("choices");

const confirm = [...(await page.$$("button"))].at(-2);
await page.evaluate(() => {
  const buttons = [...document.querySelectorAll("button")];
  const that = buttons.find((b) => /That one/i.test(b.textContent ?? ""));
  that?.click();
});
await page.waitForSelector("text/Yes, water");
await page.evaluate(() => {
  const buttons = [...document.querySelectorAll("button")];
  buttons.find((b) => /Yes, water/i.test(b.textContent ?? ""))?.click();
});
await page.waitForSelector(".order-word");
await shot("order");

await page.evaluate(() => {
  const buttons = [...document.querySelectorAll("button")];
  buttons.find((b) => /Done/i.test(b.textContent ?? ""))?.click();
});
await page.waitForSelector("text/Finish patrol");
await page.evaluate(() => {
  const buttons = [...document.querySelectorAll("button")];
  buttons.find((b) => /Finish patrol/i.test(b.textContent ?? ""))?.click();
});
await page.waitForSelector(".report");
await shot("report");

await browser.close();
console.log("ok");
