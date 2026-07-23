import { chromium } from "playwright";
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader"] });
const p = await b.newPage({ viewport: { width: 500, height: 560 } });
const got={}; let last=null;
p.on("console", m => { const t=m.text(); if(t.startsWith("HOTSPOT")) last=t.replace("HOTSPOT ",""); });
// TOP-DOWN author view — top plate flat
await p.goto("http://localhost:4201/camera?az=0&el=86&dist=2.3&author&nohot=1", { waitUntil: "networkidle" });
await p.waitForTimeout(3800);
const c = await p.locator("canvas").boundingBox();
console.log("canvas", JSON.stringify(c));
await p.screenshot({ path: "shots/author-topdown.png", clip:{x:0,y:60,width:500,height:400} });
// grid of clicks across the canvas to map coords
const rows=5, cols=5;
for(let r=0;r<rows;r++){ for(let cc=0;cc<cols;cc++){
  const x=c.x + c.width*(0.15+0.7*cc/(cols-1));
  const y=c.y + c.height*(0.15+0.7*r/(rows-1));
  last=null; await p.mouse.click(x,y); await p.waitForTimeout(80);
  process.stdout.write(`(${(0.15+0.7*cc/(cols-1)).toFixed(2)},${(0.15+0.7*r/(rows-1)).toFixed(2)})=${last||"-"}  `);
}
console.log(); }
await b.close();
