import { chromium } from "playwright";
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader"] });
for (const [name,az,el,dist] of [["hero",195,42,2.5],["front",35,12,2.6],["back",185,18,2.6]]) {
  const p = await b.newPage({ viewport: { width: 500, height: 560 } });
  await p.goto(`http://localhost:4200/camera?az=${az}&el=${el}&dist=${dist}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(3800);
  await p.screenshot({ path: `shots/wfver-${name}.png`, clip:{x:0,y:60,width:500,height:400} });
  await p.close();
}
console.log("done"); await b.close();
