import { chromium } from "playwright";
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader","--ignore-gpu-blocklist"] });
for (const [name,az,el,dist] of [["topback",180,50,2.6],["topdown",0,88,2.4],["backupper",180,35,2.6]]) {
  const p = await b.newPage({ viewport: { width: 520, height: 560 } });
  await p.goto(`http://localhost:4192/camera?wf=/models/d7100.glb&az=${az}&el=${el}&dist=${dist}&nohot=1`, { waitUntil: "networkidle" });
  await p.waitForTimeout(3800);
  await p.screenshot({ path: `shots/wfv-${name}.png`, clip:{x:0,y:60,width:520,height:420} });
  await p.close();
}
console.log("done"); await b.close();
