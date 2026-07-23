import { chromium } from "playwright";
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader"] });
const p = await b.newPage({ viewport: { width: 500, height: 560 } });
const logs=[]; p.on("console",m=>{const t=m.text(); if(t.startsWith("TAP"))logs.push(t);});
await p.goto("http://localhost:4210/camera?az=200&el=38&dist=2.4&tapdbg", { waitUntil: "networkidle" });
await p.waitForTimeout(3800);
const c = await p.locator("canvas").boundingBox();
for (const [fx,fy] of [[0.61,0.63],[0.15,0.45],[0.35,0.4],[0.65,0.42]]) {
  await p.mouse.click(c.x + c.width*fx, c.y + c.height*fy); await p.waitForTimeout(200);
}
console.log(logs.join("\n"));
await p.screenshot({ path: "shots/hl-selected.png", clip:{x:0,y:60,width:500,height:360} });
await b.close();
