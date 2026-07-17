import fs from "node:fs";
import { chromium } from "playwright";

/** E2E: feed the analyzer a synthetic capture (bright flat sky over dark land —
 *  the overcast trap) and verify a ranked recommendation renders offline. */
const OUT = process.argv[2] ?? "shots";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });

// Build the test JPEG in-browser: top 60% near-white sky, bottom dark moss
await page.goto("http://localhost:4173/analyze", { waitUntil: "networkidle" });
const b64 = await page.evaluate(() => {
  const c = document.createElement("canvas");
  c.width = 800;
  c.height = 600;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "rgb(242,244,246)";
  ctx.fillRect(0, 0, 800, 360);
  ctx.fillStyle = "rgb(52,58,48)";
  ctx.fillRect(0, 360, 800, 240);
  return c.toDataURL("image/jpeg", 0.9).split(",")[1];
});
fs.writeFileSync(`${OUT}/overcast-test.jpg`, Buffer.from(b64, "base64"));

await page.context().setOffline(true); // the P0 rule: analyzer works in airplane mode
await page.setInputFiles('input[type="file"]', `${OUT}/overcast-test.jpg`);
await page.getByText("Recommended · #1").waitFor({ timeout: 5000 });
await page.waitForTimeout(300);
await page.screenshot({ path: `${OUT}/analyze-result.png`, fullPage: false });

const badge = await page.getByText("Recommended · #1").isVisible();
const scene = await page.locator("text=/Overcast|Flat|High contrast|Split/").first().textContent();
console.log("recommendation rendered:", badge, "| scene:", scene?.trim());
await browser.close();
