import { chromium } from "playwright";
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader"] });
const p = await b.newPage({ viewport: { width: 500, height: 560 } });
const logs=[]; p.on("console",m=>{const t=m.text(); if(t.includes("HOTSPOT"))logs.push(t);});
await p.goto("http://localhost:4205/camera?az=195&el=42&dist=2.5&author", { waitUntil: "networkidle" });
await p.waitForTimeout(3500);
const c = await p.locator("canvas").boundingBox();
console.log("canvas box:", JSON.stringify(c));
for (const [fx,fy] of [[0.45,0.38],[0.5,0.5],[0.4,0.45],[0.55,0.45]]) {
  await p.mouse.click(c.x + c.width*fx, c.y + c.height*fy); await p.waitForTimeout(200);
}
console.log("raycast hits:", logs.length, logs.slice(0,4).join("  "));
await b.close();
