import { chromium } from "playwright";
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader"] });
const p = await b.newPage({ viewport: { width: 500, height: 560 } });
await p.goto("http://localhost:4193/camera?wf=/models/d7100.glb", { waitUntil: "networkidle" });
await p.waitForTimeout(3800);
await p.screenshot({ path: "shots/wf-hotspots.png", clip:{x:0,y:60,width:500,height:400} });
await b.close();
