import { chromium } from "playwright";
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader"] });
const p = await b.newPage({ viewport: { width: 500, height: 560 } });
const coords=[]; p.on("console", m => { const t=m.text(); if(t.startsWith("HOTSPOT")) coords.push(t); });
await p.goto("http://localhost:4196/camera?az=40&el=15&dist=2.6&author&nohot=1", { waitUntil: "networkidle" });
await p.waitForTimeout(3800);
const canvas = await p.locator("canvas").boundingBox();
console.log("canvas", JSON.stringify(canvas));
// click points (page coords) at controls visible in wffill-front
const pts = { lens:[200,275], grip:[380,240], prism:[300,155], modedial:[235,170], topright:[350,150] };
for (const [k,[x,y]] of Object.entries(pts)) {
  await p.mouse.click(x,y); await p.waitForTimeout(150);
  console.log("clicked", k, coords[coords.length-1] || "MISS");
}
await b.close();
