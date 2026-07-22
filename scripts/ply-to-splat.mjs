// Convert a 3DGS binary PLY (Scaniverse export) → antimatter15 .splat (32 B/splat).
// Recenters on the median and normalizes scale so the object frames predictably.
// Usage: node scripts/ply-to-splat.mjs input.ply public/models/d7100.splat
import fs from "node:fs";

const [, , inPath, outPath] = process.argv;
const buf = fs.readFileSync(inPath);
const headerStr = buf.toString("latin1", 0, 4096);
const headerEnd = buf.indexOf("end_header\n") + "end_header\n".length;
const count = parseInt(/element vertex (\d+)/.exec(headerStr)[1], 10);

const STRIDE = 62; // floats per splat
const dv = new DataView(buf.buffer, buf.byteOffset + headerEnd);
const f = (i, prop) => dv.getFloat32((i * STRIDE + prop) * 4, true);
// property indices
const X = 0, Y = 1, Z = 2, DC0 = 6, DC1 = 7, DC2 = 8, OP = 54, S0 = 55, R0 = 58;

// Pass 1: medians (robust center) + radius percentile (robust scale)
const xs = new Float32Array(count), ys = new Float32Array(count), zs = new Float32Array(count);
for (let i = 0; i < count; i++) { xs[i] = f(i, X); ys[i] = f(i, Y); zs[i] = f(i, Z); }
const median = (arr) => { const a = Float32Array.from(arr).sort(); return a[a.length >> 1]; };
const cx = median(xs), cy = median(ys), cz = median(zs);
const radii = new Float32Array(count);
for (let i = 0; i < count; i++) {
  const dx = xs[i] - cx, dy = ys[i] - cy, dz = zs[i] - cz;
  radii[i] = Math.sqrt(dx * dx + dy * dy + dz * dz);
}
const sorted = Float32Array.from(radii).sort();
const r90 = sorted[Math.floor(count * 0.9)];
const scale = 1 / r90; // normalize 90th-percentile radius → 1

// Pass 2: write .splat
const SH_C0 = 0.28209479177387814;
const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
const out = Buffer.alloc(count * 32);
let kept = 0;
for (let i = 0; i < count; i++) {
  const r = radii[i] * scale;
  if (r > 4) continue; // drop far floaters (4× the object radius)
  const o = kept * 32;
  out.writeFloatLE((xs[i] - cx) * scale, o);
  out.writeFloatLE((ys[i] - cy) * scale, o + 4);
  out.writeFloatLE((zs[i] - cz) * scale, o + 8);
  out.writeFloatLE(Math.exp(f(i, S0)) * scale, o + 12);
  out.writeFloatLE(Math.exp(f(i, S0 + 1)) * scale, o + 16);
  out.writeFloatLE(Math.exp(f(i, S0 + 2)) * scale, o + 20);
  out.writeUInt8(clamp((0.5 + SH_C0 * f(i, DC0)) * 255), o + 24);
  out.writeUInt8(clamp((0.5 + SH_C0 * f(i, DC1)) * 255), o + 25);
  out.writeUInt8(clamp((0.5 + SH_C0 * f(i, DC2)) * 255), o + 26);
  out.writeUInt8(clamp((1 / (1 + Math.exp(-f(i, OP)))) * 255), o + 27);
  let q0 = f(i, R0), q1 = f(i, R0 + 1), q2 = f(i, R0 + 2), q3 = f(i, R0 + 3);
  const n = Math.hypot(q0, q1, q2, q3) || 1;
  out.writeUInt8(clamp((q0 / n) * 128 + 128), o + 28);
  out.writeUInt8(clamp((q1 / n) * 128 + 128), o + 29);
  out.writeUInt8(clamp((q2 / n) * 128 + 128), o + 30);
  out.writeUInt8(clamp((q3 / n) * 128 + 128), o + 31);
  kept++;
}
fs.writeFileSync(outPath, out.subarray(0, kept * 32));
console.log(JSON.stringify({
  splats: count, kept, dropped: count - kept,
  center: [cx, cy, cz].map((v) => +v.toFixed(3)),
  r90: +r90.toFixed(4), outMB: +(kept * 32 / 1048576).toFixed(2),
}));
