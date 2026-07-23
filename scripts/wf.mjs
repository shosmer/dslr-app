import { chromium } from "playwright";
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader","--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: 500, height: 560 } });
const errs=[]; p.on("pageerror",e=>errs.push(String(e).slice(0,200)));
await p.goto("http://localhost:4190/camera?wf=/models/wf-placeholder.glb&az=40&el=20&dist=3&nohot=1", { waitUntil: "networkidle" });
await p.waitForTimeout(4000);
await p.screenshot({ path: "shots/wireframe-test.png", clip:{x:0,y:60,width:500,height:400} });
console.log(errs.length?("ERR: "+errs.join(" | ")):"no errors");
await b.close();
