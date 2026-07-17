import { chromium } from "playwright";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
await page.goto("http://localhost:4173/", { waitUntil: "networkidle" });
await page.evaluate(() => navigator.serviceWorker.ready);
await page.waitForTimeout(1500); // let precache finish
await ctx.setOffline(true);
for (const path of ["/", "/eclipse", "/guides/waterfalls", "/eclipse/practice"]) {
  await page.goto(`http://localhost:4173${path}`, { waitUntil: "load" }).catch(() => {});
  const ok = await page.locator("nav").isVisible().catch(() => false);
  console.log(path, ok ? "OK offline" : "FAILED offline");
}
await browser.close();
