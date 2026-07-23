// Analyze a 3DGS PLY: bounding box, centroid, and per-axis density to find the
// ground plane + up-axis. Read-only.
import fs from "node:fs";
const buf = fs.readFileSync(process.argv[2]);
const header = buf.toString("latin1", 0, 4096);
const headerEnd = buf.indexOf("end_header\n") + "end_header\n".length;
const count = parseInt(/element vertex (\d+)/.exec(header)[1], 10);
const STRIDE = 62;
const dv = new DataView(buf.buffer, buf.byteOffset + headerEnd);
const f = (i, p) => dv.getFloat32((i * STRIDE + p) * 4, true);

const axes = ["x", "y", "z"];
const stats = axes.map(() => ({ min: Infinity, max: -Infinity, vals: new Float32Array(count) }));
for (let i = 0; i < count; i++) {
  for (let a = 0; a < 3; a++) {
    const v = f(i, a);
    stats[a].vals[i] = v;
    if (v < stats[a].min) stats[a].min = v;
    if (v > stats[a].max) stats[a].max = v;
  }
}
const pct = (arr, p) => { const a = Float32Array.from(arr).sort(); return a[Math.floor(a.length * p)]; };
for (let a = 0; a < 3; a++) {
  const s = stats[a];
  // 20-bin histogram to spot a dense flat plane (ground)
  const bins = new Array(20).fill(0);
  const range = s.max - s.min || 1;
  for (const v of s.vals) bins[Math.min(19, Math.floor(((v - s.min) / range) * 20))]++;
  const maxBin = Math.max(...bins);
  const spike = bins.indexOf(maxBin);
  console.log(
    `${axes[a]}: min=${s.min.toFixed(3)} max=${s.max.toFixed(3)} ` +
    `p5=${pct(s.vals, 0.05).toFixed(3)} p50=${pct(s.vals, 0.5).toFixed(3)} p95=${pct(s.vals, 0.95).toFixed(3)} ` +
    `| densest bin #${spike}/20 (${((maxBin / count) * 100).toFixed(0)}% of splats)`,
  );
  console.log("   hist " + bins.map((b) => Math.round((b / maxBin) * 9)).join(""));
}
