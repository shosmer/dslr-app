import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage();
const out = await p.evaluate(() => {
  const resolve = (css) => {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    const ctx = c.getContext("2d");
    ctx.fillStyle = css;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, bl] = ctx.getImageData(0, 0, 1, 1).data;
    return "#" + [r, g, bl].map((n) => n.toString(16).padStart(2, "0")).join("");
  };
  return {
    bgApp: resolve("oklch(0.13 0.006 60)"),
    bgCanvas: resolve("oklch(0.16 0.007 60)"),
  };
});
console.log(JSON.stringify(out));
await b.close();
