/** Standard photographic stop tables + display formatting. Numbers are content
 *  (DS voice): always mono, always in real third-stop values a D7100 can set. */

export const SHUTTER_STOPS: number[] = [
  30, 25, 20, 15, 13, 10, 8, 6, 5, 4, 3, 2.5, 2, 1.6, 1.3, 1, 0.8, 0.6, 0.5, 0.4, 1 / 3,
  1 / 4, 1 / 5, 1 / 6, 1 / 8, 1 / 10, 1 / 13, 1 / 15, 1 / 20, 1 / 25, 1 / 30, 1 / 40, 1 / 50,
  1 / 60, 1 / 80, 1 / 100, 1 / 125, 1 / 160, 1 / 200, 1 / 250, 1 / 320, 1 / 400, 1 / 500,
  1 / 640, 1 / 800, 1 / 1000, 1 / 1250, 1 / 1600, 1 / 2000, 1 / 2500, 1 / 3200, 1 / 4000,
  1 / 5000, 1 / 6400, 1 / 8000,
];

export const APERTURE_STOPS: number[] = [
  1.4, 1.6, 1.8, 2, 2.2, 2.5, 2.8, 3.2, 3.5, 4, 4.5, 5, 5.6, 6.3, 7.1, 8, 9, 10, 11, 13, 14,
  16, 18, 20, 22, 25, 29, 32,
];

export const ISO_STOPS: number[] = [100, 125, 160, 200, 250, 320, 400, 500, 640, 800, 1000, 1250, 1600, 2000, 2500, 3200, 4000, 5000, 6400];

export function nearest(values: number[], target: number): number {
  let best = values[0];
  let bestDist = Infinity;
  for (const v of values) {
    const d = Math.abs(Math.log2(v) - Math.log2(target));
    if (d < bestDist) {
      bestDist = d;
      best = v;
    }
  }
  return best;
}

export function formatShutter(seconds: number): string {
  if (seconds >= 1) {
    const v = Math.round(seconds * 10) / 10;
    return `${Number.isInteger(v) ? v.toFixed(0) : v}s`;
  }
  return `1/${Math.round(1 / seconds)}s`;
}

export function formatAperture(n: number): string {
  return `f/${n % 1 === 0 ? n.toFixed(0) : n}`;
}
