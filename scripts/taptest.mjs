import { chromium } from "playwright";
const b = await chromium.launch({ args: ["--use-gl=angle","--use-angle=swiftshader"] });
const p = await b.newPage({ viewport: { width: 500, height: 560 } });
await p.goto("http://localhost:4203/camera?az=195&el=42&dist=2.5", { waitUntil: "networkidle" });
await p.waitForTimeout(3800);
const canvas = await p.locator("canvas").boundingBox();
// tap several points on the camera body; report which control (sheet title) opens
const tries = [[0.42,0.35],[0.6,0.55],[0.35,0.35],[0.5,0.7]];
for (const [fx,fy] of tries) {
  const x = canvas.x + canvas.width*fx, y = canvas.y + canvas.height*fy;
  await p.mouse.click(x,y); await p.waitForTimeout(400);
  const title = await p.locator('[role="dialog"]').getByRole("heading").first().textContent().catch(()=>null)
    || await p.locator('[role="dialog"] .display, [role="dialog"]').first().textContent().catch(()=>null);
  const anyCard = await p.getByText(/Hold it and spin|Half-press|selects P, S, A|Rear dial|Left column/).count();
  console.log(`(${fx},${fy}) card=${anyCard>0}`);
  // close sheet
  await p.keyboard.press("Escape"); await p.waitForTimeout(300);
}
await p.screenshot({ path: "shots/tap-final.png", clip:{x:0,y:60,width:500,height:400} });
await b.close();
