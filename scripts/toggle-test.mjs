import { chromium } from "playwright";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
await p.goto("http://localhost:4173/settings", { waitUntil: "networkidle" });
// Toggle Eclipse OFF
await p.getByRole("switch", { name: "Eclipse Mode" }).click();
// Toggle destination to Everyday
await p.getByText("Everyday", { exact: true }).click();
await p.waitForTimeout(300);
const tabCount = await p.locator("nav button").count();
const hasEclipseTab = await p.locator("nav").getByText("Eclipse").count();
// Go home, check hero + trip card gone
await p.getByLabel("Back").click();
await p.waitForTimeout(300);
const hasHero = await p.getByText("Total solar eclipse").count();
const hasTripCard = await p.getByText(/in Iceland/).count();
await p.screenshot({ path: "shots/home-everyday.png" });
console.log(JSON.stringify({ tabCount, hasEclipseTab, hasHero, hasTripCard }));
await b.close();
