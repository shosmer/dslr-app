import { chromium } from "playwright";
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader"] });
for (const [name,az,el,dist] of [["front",0,10,3],["topback",180,50,2.6],["top",0,88,2.6]]) {
  const p = await b.newPage({ viewport: { width: 460, height: 900 } });
  await p.goto(`http://localhost:4186/camera?az=${az}&el=${el}&dist=${dist}&nohot=1`, { waitUntil: "networkidle" });
  await p.waitForTimeout(3200);
  const box = await p.locator("nav ~ *, .screen").first().boundingBox().catch(()=>null);
  await p.screenshot({ path: `shots/v2-${name}.png`, clip: { x: 0, y: 60, width: 460, height: 400 } });
  await p.close();
}
console.log("done"); await b.close();
