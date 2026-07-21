import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errs = [];
p.on("pageerror", (e) => errs.push(String(e)));
await p.goto("http://localhost:4173/settings", { waitUntil: "networkidle" });
await p.waitForTimeout(400);
await p.screenshot({ path: "shots/settings.png", fullPage: true });
// Analyze with presets sheet open
await p.goto("http://localhost:4173/analyze", { waitUntil: "networkidle" });
await p.getByLabel("Saved recipes").click();
await p.waitForTimeout(500);
await p.screenshot({ path: "shots/analyze-sheet.png" });
console.log(errs.length ? "ERRORS: " + errs.join("; ") : "no errors");
await b.close();
