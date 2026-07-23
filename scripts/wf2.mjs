import { chromium } from "playwright";
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader","--ignore-gpu-blocklist"] });
for (const [name,az,el,dist,thr] of [["3q",40,20,3,32],["thr20",40,20,3,20],["thr45",40,20,3,45]]) {
  const p = await b.newPage({ viewport: { width: 500, height: 560 } });
  const errs=[]; p.on("pageerror",e=>errs.push(String(e).slice(0,160)));
  await p.goto(`http://localhost:4191/camera?wf=/models/d7100.glb&az=${az}&el=${el}&dist=${dist}&thr=${thr}&nohot=1`, { waitUntil: "networkidle" });
  await p.waitForTimeout(4000);
  await p.screenshot({ path: `shots/wf-d7100-${name}.png`, clip:{x:0,y:60,width:500,height:400} });
  if(errs.length) console.log(name, "ERR:", errs[0]);
  await p.close();
}
console.log("done"); await b.close();
