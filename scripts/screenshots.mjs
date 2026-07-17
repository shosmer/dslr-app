import { chromium } from "playwright";

const OUT = process.argv[2] ?? ".";
const routes = [
  ["home", "/"],
  ["camera", "/camera"],
  ["analyze", "/analyze"],
  ["guides", "/guides"],
  ["guide-detail", "/guides/black-sand-beaches"],
  ["eclipse", "/eclipse"],
  ["practice", "/eclipse/practice"],
  ["howto", "/camera/howto/exposure-comp"],
  ["presets", "/presets"],
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

for (const [name, path] of routes) {
  await page.goto(`http://localhost:4173${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${name}.png` });
}
await browser.close();
if (errors.length) {
  console.log("CONSOLE ERRORS:");
  for (const e of errors) console.log(" -", e);
} else {
  console.log("no console errors");
}
