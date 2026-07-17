/** Luminance histogram + spatial stats from a downsampled frame (PRD §7):
 *  clipping, bimodality (split-light), center/edge contrast (backlight),
 *  left/right halves (split direction), gray-world color averages. */

export interface FrameStats {
  /** 64-bin luminance histogram, normalized to sum 1 */
  hist: number[];
  /** linearized mean luminance 0–1 (for EV correction) */
  meanLinear: number;
  /** gamma-space mean 0–1 */
  mean: number;
  /** gamma-space std-dev 0–1 */
  stdev: number;
  /** fraction of pixels ≥ 0.97 */
  clipHigh: number;
  /** fraction of pixels ≤ 0.03 */
  clipLow: number;
  /** fraction of pixels ≥ 0.85 — "white sky mass" */
  brightMass: number;
  /** 0–1: two well-separated histogram lobes → split lighting */
  bimodality: number;
  /** EV difference between LEFT and RIGHT halves only — a vertical sky/ground
   *  difference is normal landscape structure, not split lighting */
  splitEV: number;
  /** EV difference between top and bottom halves (sky vs. ground) */
  skyGroundEV: number;
  /** EV of frame edges minus center (positive = bright edges, dark subject = backlit) */
  backlitEV: number;
  /** gray-world channel means (gamma space) */
  avgR: number;
  avgG: number;
  avgB: number;
}

const BINS = 64;

function lum(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function toLinear(v: number): number {
  return Math.pow(v, 2.2);
}

function safeLog2Ratio(a: number, b: number): number {
  return Math.log2(Math.max(a, 1e-4) / Math.max(b, 1e-4));
}

export function frameStats(data: Uint8ClampedArray, width: number, height: number): FrameStats {
  const hist = new Array<number>(BINS).fill(0);
  let sum = 0;
  let sumSq = 0;
  let sumLinear = 0;
  let clipHigh = 0;
  let clipLow = 0;
  let brightMass = 0;
  let sumR = 0;
  let sumG = 0;
  let sumB = 0;

  // spatial accumulators (linear luminance)
  let left = 0,
    right = 0,
    top = 0,
    bottom = 0,
    center = 0,
    edge = 0;
  let leftN = 0,
    rightN = 0,
    topN = 0,
    bottomN = 0,
    centerN = 0,
    edgeN = 0;

  const n = width * height;
  for (let i = 0; i < n; i++) {
    const r = data[i * 4] / 255;
    const g = data[i * 4 + 1] / 255;
    const b = data[i * 4 + 2] / 255;
    const y = lum(r, g, b);
    const yl = toLinear(y);

    sum += y;
    sumSq += y * y;
    sumLinear += yl;
    sumR += r;
    sumG += g;
    sumB += b;
    if (y >= 0.97) clipHigh++;
    if (y <= 0.03) clipLow++;
    if (y >= 0.85) brightMass++;
    hist[Math.min(BINS - 1, Math.floor(y * BINS))]++;

    const x = i % width;
    const yy = Math.floor(i / width);
    if (x < width / 2) {
      left += yl;
      leftN++;
    } else {
      right += yl;
      rightN++;
    }
    if (yy < height / 2) {
      top += yl;
      topN++;
    } else {
      bottom += yl;
      bottomN++;
    }
    const inCenter =
      x >= width * 0.3 && x < width * 0.7 && yy >= height * 0.3 && yy < height * 0.7;
    if (inCenter) {
      center += yl;
      centerN++;
    } else {
      edge += yl;
      edgeN++;
    }
  }

  const mean = sum / n;
  const stdev = Math.sqrt(Math.max(0, sumSq / n - mean * mean));
  for (let i = 0; i < BINS; i++) hist[i] /= n;

  const hSplit = Math.abs(safeLog2Ratio(left / Math.max(1, leftN), right / Math.max(1, rightN)));
  const vSplit = Math.abs(safeLog2Ratio(top / Math.max(1, topN), bottom / Math.max(1, bottomN)));
  const backlitEV = safeLog2Ratio(edge / Math.max(1, edgeN), center / Math.max(1, centerN));

  return {
    hist,
    meanLinear: sumLinear / n,
    mean,
    stdev,
    clipHigh: clipHigh / n,
    clipLow: clipLow / n,
    brightMass: brightMass / n,
    bimodality: bimodalityOf(hist),
    splitEV: hSplit,
    skyGroundEV: vSplit,
    backlitEV,
    avgR: sumR / n,
    avgG: sumG / n,
    avgB: sumB / n,
  };
}

/** Two separated lobes each holding real mass, with a valley between → high score. */
export function bimodalityOf(hist: number[]): number {
  const bins = hist.length;
  const third = Math.floor(bins / 3);
  const low = hist.slice(0, third).reduce((a, b) => a + b, 0);
  const mid = hist.slice(third, 2 * third).reduce((a, b) => a + b, 0);
  const high = hist.slice(2 * third).reduce((a, b) => a + b, 0);
  const lobes = Math.min(low, high);
  if (lobes < 0.12) return 0;
  const valley = 1 - Math.min(1, mid / Math.max(1e-6, lobes));
  return Math.max(0, Math.min(1, valley * lobes * 3));
}
