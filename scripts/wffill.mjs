import { chromium } from "playwright";
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader"] });
for (const [name,az,el,dist] of [["hero",195,42,2.5],["front",40,15,2.6]]) {
  const p = await b.newPage({ viewport: { width: 500, height: 560 } });
  await p.goto(`http://localhost:4195/camera?az=${az}&el=${el}&dist=${dist}&nohot=1`, { waitUntil: "networkidle" });
  await p.waitForTimeout(3800);
  await p.screenshot({ path: `shots/wffill-${name}.png`, clip:{x:0,y:60,width:500,height:400} });
  await p.close();
}
console.log("done"); await b.close();
