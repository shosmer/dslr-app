import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
const cdp = await p.context().newCDPSession(p);
await cdp.send("Emulation.setSafeAreaInsetsOverride", { insets: { top: 59, left: 0, bottom: 34, right: 0 } });
await p.goto("http://localhost:4173/", { waitUntil: "networkidle" });
await p.waitForTimeout(300);
// Measure the nav bar: its padding-bottom should equal the 34px emulated inset
const info = await p.evaluate(() => {
  const nav = document.querySelector("nav");
  const cs = getComputedStyle(nav);
  const rect = nav.getBoundingClientRect();
  return { paddingBottom: cs.paddingBottom, height: cs.height, bottomEdge: Math.round(rect.bottom), winH: window.innerHeight };
});
console.log(JSON.stringify(info));
await p.screenshot({ path: "shots/inset-navbar.png" });
await b.close();
