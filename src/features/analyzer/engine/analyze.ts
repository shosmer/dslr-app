import exifr from "exifr";
import type { GearBody, GearLens } from "@/data/gear/types";
import type { IntentId } from "@/app/store";
import { correctedSceneEV, evFromExif, evLabel } from "./ev";
import { frameStats, type FrameStats } from "./histogram";
import { classifyScene, suggestWhiteBalance, SCENE_LABELS, type SceneClass } from "./classify";
import { recommend, type Combo } from "./recommend";

export interface AnalysisResult {
  ev: number | null;
  evSource: "exif" | "scene-estimate" | "manual";
  evLabel: string;
  scene: SceneClass;
  sceneLabel: string;
  wb: string;
  combos: Combo[];
  stats: FrameStats;
  elapsedMs: number;
  /** small preview for history */
  thumb: string;
}

const ANALYZE_SIZE = 256;
const THUMB_SIZE = 96;

async function decodeToCanvas(file: File, maxSize: number): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return canvas;
}

export interface AnalyzeOptions {
  /** User-asserted scene EV — the fallback anchor when the capture has no EXIF
   *  (iOS in-app captures often arrive stripped; library imports keep it). */
  evOverride?: number | null;
}

/** Full local analysis — deterministic, offline, <2s (PRD §7 acceptance). */
export async function analyzeCapture(
  file: File,
  intent: IntentId,
  lens: GearLens,
  body: GearBody,
  opts: AnalyzeOptions = {},
): Promise<AnalysisResult> {
  const t0 = performance.now();

  const [canvas, exif] = await Promise.all([
    decodeToCanvas(file, ANALYZE_SIZE),
    exifr
      .parse(file, { pick: ["FNumber", "ExposureTime", "ISO"] })
      .catch(() => null),
  ]);

  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  const stats = frameStats(
    ctx.getImageData(0, 0, canvas.width, canvas.height).data,
    canvas.width,
    canvas.height,
  );

  const evExif = evFromExif({
    fNumber: exif?.FNumber,
    exposureTime: exif?.ExposureTime,
    iso: exif?.ISO,
  });
  let ev: number | null;
  let evSource: AnalysisResult["evSource"];
  if (evExif != null) {
    ev = correctedSceneEV(evExif, stats.meanLinear);
    evSource = "exif";
  } else if (opts.evOverride != null) {
    // The user told us the light level — take it as-is, no mid-gray correction
    ev = opts.evOverride;
    evSource = "manual";
  } else {
    ev = null;
    evSource = "scene-estimate";
  }

  const scene = classifyScene(stats, ev);
  const wb = suggestWhiteBalance(stats, scene);
  const combos = recommend({ ev, scene, stats, intent, lens, body, wb });

  // History thumbnail
  const thumbCanvas = document.createElement("canvas");
  const ts = Math.min(1, THUMB_SIZE / Math.max(canvas.width, canvas.height));
  thumbCanvas.width = Math.max(1, Math.round(canvas.width * ts));
  thumbCanvas.height = Math.max(1, Math.round(canvas.height * ts));
  thumbCanvas.getContext("2d")!.drawImage(canvas, 0, 0, thumbCanvas.width, thumbCanvas.height);

  return {
    ev,
    evSource,
    evLabel: ev != null ? evLabel(ev) : SCENE_LABELS[scene].toLowerCase(),
    scene,
    sceneLabel: SCENE_LABELS[scene],
    wb,
    combos,
    stats,
    elapsedMs: Math.round(performance.now() - t0),
    thumb: thumbCanvas.toDataURL("image/jpeg", 0.7),
  };
}
