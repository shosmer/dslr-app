import { chromium } from "playwright";
const [az,el,dist]=process.argv.slice(2);
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader"] });
const p = await b.newPage({ viewport: { width: 460, height: 500 } });
await p.goto(`http://localhost:4187/camera?az=${az}&el=${el}&dist=${dist}&nohot=1`, { waitUntil: "networkidle" });
await p.waitForTimeout(3200);
await p.screenshot({ path: "shots/tune.png", clip:{x:0,y:60,width:460,height:400} });
await b.close();
