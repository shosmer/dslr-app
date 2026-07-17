import type { FrameStats } from "./histogram";

/** Rule-based scene classification (PRD §7) — deterministic and explainable. */
export type SceneClass =
  | "low-light"
  | "split-lighting"
  | "backlit"
  | "overcast-white-sky"
  | "high-contrast"
  | "golden-low-sun"
  | "flat-even";

export const SCENE_LABELS: Record<SceneClass, string> = {
  "low-light": "Low light",
  "split-lighting": "Split lighting",
  backlit: "Backlit subject",
  "overcast-white-sky": "Overcast / white sky",
  "high-contrast": "High contrast",
  "golden-low-sun": "Golden / low sun",
  "flat-even": "Flat, even light",
};

export function classifyScene(stats: FrameStats, ev: number | null): SceneClass {
  const warmCast = stats.avgR > stats.avgB * 1.18;

  if (ev != null && ev < 7) return "low-light";
  if (stats.bimodality > 0.35 && stats.splitEV > 1.5) return "split-lighting";
  if (stats.backlitEV > 1.2) return "backlit";
  if (stats.brightMass > 0.28 && stats.clipLow < 0.08 && !warmCast) return "overcast-white-sky";
  if (stats.clipHigh > 0.02 && stats.clipLow > 0.02) return "high-contrast";
  if (stats.stdev > 0.26) return "high-contrast";
  if (warmCast && ev != null && ev >= 7 && ev < 12) return "golden-low-sun";
  return "flat-even";
}

/** Gray-world white-balance suggestion. The cast of the frame reveals the
 *  illuminant: bluish frame → cool light (suggest Cloudy/Shade to warm it),
 *  reddish frame → warm light. */
export function suggestWhiteBalance(stats: FrameStats, scene: SceneClass): string {
  const rb = stats.avgR / Math.max(1e-4, stats.avgB);
  if (scene === "overcast-white-sky") return "Cloudy";
  if (rb < 0.82) return "Shade";
  if (rb < 0.95) return "Cloudy";
  if (rb > 1.35) return "Tungsten";
  if (rb > 1.15 && scene === "golden-low-sun") return "Daylight — keep the warmth";
  return "Daylight";
}
