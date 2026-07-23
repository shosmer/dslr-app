import { chromium } from "playwright";
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader"] });
const p = await b.newPage({ viewport: { width: 460, height: 500 } });
// default view (no az param) but stop autorotate by using fixed cam at same angle
await p.goto("http://localhost:4189/camera?az=180&el=45&dist=2.6", { waitUntil: "networkidle" });
await p.waitForTimeout(3200);
await p.screenshot({ path: "shots/hotcheck.png", clip:{x:0,y:60,width:460,height:400} });
await b.close();
