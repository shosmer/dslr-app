import { chromium } from "playwright";
const b = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: 390, height: 844 } });
const errs = [];
p.on("pageerror", (e) => errs.push(e.stack || String(e)));
await p.goto("http://localhost:4177/camera", { waitUntil: "networkidle" });
await p.waitForTimeout(3000);
console.log(errs.slice(0, 2).join("\n----\n").slice(0, 1500));
await b.close();
