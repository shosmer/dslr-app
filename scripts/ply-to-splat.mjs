// Convert a 3DGS binary PLY (Scaniverse export) → antimatter15 .splat (32 B/splat).
// Detects the ground/pedestal plane, drops it, and recenters+normalizes on just
// the camera body so it frames cleanly. Usage: node ply-to-splat.mjs in.ply out.splat
import fs from "node:fs";

const [, , inPath, outPath] = process.argv;
const buf = fs.readFileSync(inPath);
const header = buf.toString("latin1", 0, 4096);
const headerEnd = buf.indexOf("end_header\n") + "end_header\n".length;
const count = parseInt(/element vertex (\d+)/.exec(header)[1], 10);
const STRIDE = 62;
const dv = new DataView(buf.buffer, buf.byteOffset + headerEnd);
const f = (i, p) => dv.getFloat32((i * STRIDE + p) * 4, true);
const X = 0, Y = 1, Z = 2, DC0 = 6, OP = 54, S0 = 55, R0 = 58;

// Positions
const px = new Float32Array(count), py = new Float32Array(count), pz = new Float32Array(count);
for (let i = 0; i < count; i++) { px[i] = f(i, X); py[i] = f(i, Y); pz[i] = f(i, Z); }

// Up-axis = the one whose distribution is most concentrated (thin ground plane)
const axisConc = (arr) => {
  let lo = Infinity, hi = -Infinity;
  for (const v of arr) { if (v < lo) lo = v; if (v > hi) hi = v; }
  const B = 80, bins = new Array(B).fill(0), range = hi - lo || 1;
  for (const v of arr) bins[Math.min(B - 1, Math.floor(((v - lo) / range) * B))]++;
  const peak = Math.max(...bins);
  return { conc: peak / count, peakBin: bins.indexOf(peak), lo, hi, range, bins, B };
};
const cand = [axisConc(px), axisConc(py), axisConc(pz)];
const up = cand[0].conc > cand[1].conc && cand[0].conc > cand[2].conc ? 0 : cand[1].conc > cand[2].conc ? 1 : 2;
const upArr = [px, py, pz][up];
const g = cand[up];
const groundLevel = g.lo + ((g.peakBin + 0.5) / g.B) * g.range;

// Crop: keep the camera, drop the pedestal disc. Tunable via CLI:
//   --above=V / --below=V : keep splats on one side of up-axis value V
//   --rh=R                : keep splats within horizontal radius R of center
const arg = (k) => { const a = process.argv.find((s) => s.startsWith(`--${k}=`)); return a ? +a.split("=")[1] : null; };
const above = arg("above"), below = arg("below"), rhMax = arg("rh");
const hAxes = [0, 1, 2].filter((a) => a !== up);
const hMed = (arr) => { const a = Float32Array.from(arr).sort(); return a[a.length >> 1]; };
const hc = [hMed([px, py, pz][hAxes[0]]), hMed([px, py, pz][hAxes[1]])];
const horiz = [px, py, pz][hAxes[0]], horiz2 = [px, py, pz][hAxes[1]];

const keepMask = new Uint8Array(count);
let kept = 0, sx = 0, sy = 0, sz = 0;
for (let i = 0; i < count; i++) {
  if (above != null && upArr[i] < above) continue;
  if (below != null && upArr[i] > below) continue;
  if (rhMax != null) {
    const rh = Math.hypot(horiz[i] - hc[0], horiz2[i] - hc[1]);
    if (rh > rhMax) continue;
  }
  keepMask[i] = 1; kept++; sx += px[i]; sy += py[i]; sz += pz[i];
}
const cx = sx / kept, cy = sy / kept, cz = sz / kept;

// Normalize by the camera's 90th-percentile radius
const radii = [];
for (let i = 0; i < count; i++) {
  if (!keepMask[i]) continue;
  radii.push(Math.hypot(px[i] - cx, py[i] - cy, pz[i] - cz));
}
radii.sort((a, b) => a - b);
const r90 = radii[Math.floor(radii.length * 0.9)];
const scale = 1 / r90;

const SH_C0 = 0.28209479177387814;
const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
const out = Buffer.alloc(kept * 32);
let w = 0;
for (let i = 0; i < count; i++) {
  if (!keepMask[i]) continue;
  const rr = Math.hypot(px[i] - cx, py[i] - cy, pz[i] - cz) * scale;
  if (rr > 3) continue; // trim any remaining stragglers
  const o = w * 32;
  out.writeFloatLE((px[i] - cx) * scale, o);
  out.writeFloatLE((py[i] - cy) * scale, o + 4);
  out.writeFloatLE((pz[i] - cz) * scale, o + 8);
  out.writeFloatLE(Math.exp(f(i, S0)) * scale, o + 12);
  out.writeFloatLE(Math.exp(f(i, S0 + 1)) * scale, o + 16);
  out.writeFloatLE(Math.exp(f(i, S0 + 2)) * scale, o + 20);
  out.writeUInt8(clamp((0.5 + SH_C0 * f(i, DC0)) * 255), o + 24);
  out.writeUInt8(clamp((0.5 + SH_C0 * f(i, DC0 + 1)) * 255), o + 25);
  out.writeUInt8(clamp((0.5 + SH_C0 * f(i, DC0 + 2)) * 255), o + 26);
  out.writeUInt8(clamp((1 / (1 + Math.exp(-f(i, OP)))) * 255), o + 27);
  let q0 = f(i, R0), q1 = f(i, R0 + 1), q2 = f(i, R0 + 2), q3 = f(i, R0 + 3);
  const n = Math.hypot(q0, q1, q2, q3) || 1;
  out.writeUInt8(clamp((q0 / n) * 128 + 128), o + 28);
  out.writeUInt8(clamp((q1 / n) * 128 + 128), o + 29);
  out.writeUInt8(clamp((q2 / n) * 128 + 128), o + 30);
  out.writeUInt8(clamp((q3 / n) * 128 + 128), o + 31);
  w++;
}
fs.writeFileSync(outPath, out.subarray(0, w * 32));
console.log(JSON.stringify({
  total: count, upAxis: ["x", "y", "z"][up], groundLevel: +groundLevel.toFixed(3),
  crop: { above, below, rh: rhMax }, kept: w, dropped: count - w, outMB: +(w * 32 / 1048576).toFixed(2),
}));
