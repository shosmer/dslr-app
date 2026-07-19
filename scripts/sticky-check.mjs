import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
// Emulate iPhone safe-area insets if this Chromium supports it
const cdp = await page.context().newCDPSession(page);
let insets = false;
try {
  await cdp.send("Emulation.setSafeAreaInsetsOverride", { insets: { top: 59, left: 0, bottom: 34, right: 0 } });
  insets = true;
} catch {}
await page.goto("http://localhost:4173/", { waitUntil: "networkidle" });
await page.locator(".scroll-area").evaluate((el) => (el.scrollTop = 500));
await page.waitForTimeout(400);
await page.screenshot({ path: "shots/sticky-home-scrolled.png" });
await page.goto("http://localhost:4173/eclipse", { waitUntil: "networkidle" });
await page.locator(".scroll-area").evaluate((el) => (el.scrollTop = 700));
await page.waitForTimeout(400);
await page.screenshot({ path: "shots/sticky-eclipse-scrolled.png" });
console.log("done, safe-area emulation:", insets);
await browser.close();
