import { chromium } from "playwright";
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader"] });
const p = await b.newPage({ viewport: { width: 400, height: 500 } });
const logs=[]; p.on("console",m=>{const t=m.text(); if(t.startsWith("MESH"))logs.push(t);});
await p.goto("http://localhost:4207/camera?meshes=1&nohot=1", { waitUntil: "networkidle" });
await p.waitForTimeout(4000);
console.log(logs.join("\n"));
await b.close();
