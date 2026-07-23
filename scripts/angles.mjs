import { chromium } from "playwright";
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader","--ignore-gpu-blocklist"] });
const angles = [["front",0,10],["back",180,10],["left",90,10],["right",-90,10],["top",0,80],["topback",180,55]];
for (const [name,az,el] of angles) {
  const p = await b.newPage({ viewport: { width: 500, height: 500 }, deviceScaleFactor: 1 });
  await p.goto(`http://localhost:4184/camera?az=${az}&el=${el}&dist=3.2&nohot=1`, { waitUntil: "networkidle" });
  await p.waitForTimeout(3500);
  await p.locator(".screen > div").first().screenshot({ path: `shots/ang-${name}.png` }).catch(async()=>{ await p.screenshot({path:`shots/ang-${name}.png`}); });
  await p.close();
}
console.log("done");
await b.close();
