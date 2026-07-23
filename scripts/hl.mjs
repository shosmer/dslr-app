import { chromium } from "playwright";
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader"] });
const p = await b.newPage({ viewport: { width: 500, height: 560 } });
await p.goto("http://localhost:4208/camera?az=195&el=42&dist=2.4", { waitUntil: "networkidle" });
await p.waitForTimeout(3800);
await p.screenshot({ path: "shots/hl-hero.png", clip:{x:0,y:60,width:500,height:400} });
// tap a highlighted control and screenshot the selected highlight
const c = await p.locator("canvas").boundingBox();
await p.mouse.click(c.x + c.width*0.30, c.y + c.height*0.42);
await p.waitForTimeout(500);
const title = await p.locator('[role="dialog"]').first().innerText().catch(()=>"");
console.log("tapped ->", title.split("\n")[0] || "(none)");
await p.screenshot({ path: "shots/hl-selected.png", clip:{x:0,y:60,width:500,height:340} });
await b.close();
