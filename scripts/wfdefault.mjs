import { chromium } from "playwright";
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader"] });
const p = await b.newPage({ viewport: { width: 500, height: 560 } });
const errs=[]; p.on("pageerror",e=>errs.push(String(e).slice(0,150)));
await p.goto("http://localhost:4194/camera", { waitUntil: "networkidle" });
await p.waitForTimeout(4000);
await p.screenshot({ path: "shots/wf-default.png", clip:{x:0,y:60,width:500,height:400} });
console.log(errs.length?("ERR "+errs[0]):"ok, wireframe is default");
await b.close();
