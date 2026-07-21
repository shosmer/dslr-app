import { chromium } from "playwright";
const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const errs = [];
p.on("pageerror", (e) => errs.push(String(e)));
p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await p.goto("http://localhost:4176/camera", { waitUntil: "networkidle" });
await p.waitForTimeout(4000); // let the splat load + render
await p.screenshot({ path: "shots/camera-3d.png" });
// Try tapping a hotspot marker
const markers = await p.locator('button[aria-label="Mode dial"]').count();
if (markers) {
  await p.locator('button[aria-label="Mode dial"]').first().click({ force: true });
  await p.waitForTimeout(600);
  await p.screenshot({ path: "shots/camera-hotspot.png" });
}
console.log(JSON.stringify({ markers, errs: errs.slice(0, 5) }));
await b.close();
