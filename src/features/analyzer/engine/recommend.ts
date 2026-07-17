import type { GearBody, GearLens } from "@/data/gear/types";
import { maxApertureAt } from "@/data/gear/types";
import type { RecipeRow } from "@/components/ds";
import type { IntentId } from "@/app/store";
import type { FrameStats } from "./histogram";
import type { SceneClass } from "./classify";
import { APERTURE_STOPS, ISO_STOPS, SHUTTER_STOPS, formatAperture, formatShutter, nearest } from "./format";

/** EV + classification + intent + mounted-lens profile → 2–3 ranked combos
 *  (PRD §7). Every number must respect the gear profiles (CLAUDE.md rule 2). */

export interface Combo {
  rank: number;
  title: string;
  mode: string;
  rows: RecipeRow[];
  why: string;
  warnings: string[];
  howtoIds: string[];
}

export interface RecommendInput {
  ev: number | null;
  scene: SceneClass;
  stats: FrameStats | null;
  intent: IntentId;
  lens: GearLens;
  body: GearBody;
  wb: string;
}

const SCENE_FALLBACK_EV: Record<SceneClass, number> = {
  "low-light": 6,
  "split-lighting": 11,
  backlit: 12,
  "overcast-white-sky": 12,
  "high-contrast": 13,
  "golden-low-sun": 9.5,
  "flat-even": 11,
};

/** Exposure-comp bias per scene: [EV, one-line why]. */
const SCENE_COMP: Partial<Record<SceneClass, { comp: number; why: string }>> = {
  "overcast-white-sky": {
    comp: -0.7,
    why: "flat bright sky reads mid-gray to the meter — it'll blow out. Bias down 0.7 EV.",
  },
  "high-contrast": {
    comp: -0.7,
    why: "protect the highlights — shadows recover in RAW, blown skies don't.",
  },
  backlit: {
    comp: 1.0,
    why: "the bright background drags the meter down and silhouettes your subject. Bias up 1 EV (or spot-meter the subject).",
  },
  "golden-low-sun": {
    comp: -0.3,
    why: "keep the warm light moody — a third-stop under protects the glow.",
  },
};

function clampAperture(lens: GearLens, focal: number, target: number): { value: number; clamped: boolean } {
  const widest = maxApertureAt(lens, focal);
  const narrowest = lens.aperture.min;
  const clampedValue = Math.min(narrowest, Math.max(widest, target));
  return { value: nearest(APERTURE_STOPS, clampedValue), clamped: target < widest - 0.01 };
}

function shutterFor(ev: number, aperture: number, iso: number): number {
  // EV(ISO100) = log2(N²/t) − log2(ISO/100)  ⇒  t = N² / (2^EV · ISO/100)
  return (aperture * aperture) / (Math.pow(2, ev) * (iso / 100));
}

function isoFor(ev: number, aperture: number, shutter: number): number {
  return (100 * aperture * aperture) / (Math.pow(2, ev) * shutter);
}

function baseIso(ev: number, body: GearBody): number {
  let iso: number;
  if (ev >= 12) iso = 100;
  else if (ev >= 9) iso = 200;
  else if (ev >= 7) iso = 400;
  else if (ev >= 5) iso = 1600;
  else iso = body.iso.practicalMax;
  return Math.min(iso, body.iso.practicalMax);
}

/** Slowest handholdable shutter: 1/(focal × crop), VR buys ~3 stops (PRD §7). */
export function handholdLimit(lens: GearLens, body: GearBody, focal: number): number {
  const base = 1 / (focal * body.sensor.cropFactor);
  return lens.vr ? base * 8 : base;
}

function fmtComp(comp: number): string {
  const sign = comp > 0 ? "+" : "−";
  return `${sign}${Math.abs(comp).toFixed(1)} EV`;
}

interface BuildOpts {
  ev: number;
  lens: GearLens;
  body: GearBody;
  focal: number;
  aperture: number;
  apertureClamped: boolean;
  iso: number;
  mode: string;
  title: string;
  why: string;
  comp?: number;
  compHighlight?: boolean;
  wb: string;
  metering?: string;
  shutterFloor?: number;
  extraWarnings?: string[];
  extraHowtos?: string[];
  apertureHighlight?: boolean;
  shutterHighlight?: boolean;
  clipHigh?: number;
}

function buildCombo(rank: number, o: BuildOpts): Combo {
  const warnings: string[] = [...(o.extraWarnings ?? [])];
  const howtoIds = new Set<string>(["shooting-mode", ...(o.extraHowtos ?? [])]);

  let iso = o.iso;
  let shutter = shutterFor(o.ev, o.aperture, iso);

  // Respect a shutter floor (action) by raising ISO within body limits
  if (o.shutterFloor && shutter > o.shutterFloor) {
    const needIso = isoFor(o.ev, o.aperture, o.shutterFloor);
    iso = Math.min(nearest(ISO_STOPS, Math.max(iso, needIso)), o.body.iso.max);
    shutter = shutterFor(o.ev, o.aperture, iso);
    if (iso > o.body.iso.practicalMax) {
      warnings.push(
        `ISO ${iso} is above the D7100's clean ceiling (~${o.body.iso.practicalMax}) — expect noise, accept it for the shot.`,
      );
    }
  }

  // Handhold check — raise ISO before surrendering to the tripod
  const limit = handholdLimit(o.lens, o.body, o.focal);
  if (shutter > limit && !o.shutterFloor) {
    const needIso = isoFor(o.ev, o.aperture, limit);
    const cappedIso = Math.min(nearest(ISO_STOPS, needIso), o.body.iso.practicalMax);
    if (cappedIso > iso) {
      iso = cappedIso;
      shutter = shutterFor(o.ev, o.aperture, iso);
    }
    if (shutter > limit) {
      warnings.push(
        `${formatShutter(nearest(SHUTTER_STOPS, shutter))} is below the handhold limit for ${o.focal}mm (${formatShutter(
          nearest(SHUTTER_STOPS, limit),
        )}) — use a tripod or brace hard.`,
      );
      howtoIds.add("self-timer");
    }
  }

  // Clamp to the body's shutter range
  const fastest = o.body.shutter.max;
  const slowest = o.body.shutter.min;
  if (shutter < fastest) {
    shutter = fastest;
    warnings.push("At the D7100's 1/8000s ceiling — stop down or drop ISO.");
  }
  if (shutter > slowest) {
    shutter = slowest;
    warnings.push("Longer than 30s — switch to Bulb.");
  }

  if ((o.clipHigh ?? 0) > 0.03 && !warnings.some((w) => w.includes("clip"))) {
    warnings.push("Sky will clip — meter for highlights, recover in RAW.");
  }
  if (o.apertureClamped) {
    warnings.push(
      `${o.lens.shortName} can't open wider than ${formatAperture(maxApertureAt(o.lens, o.focal))} at ${o.focal}mm.`,
    );
  }
  if (o.comp != null && o.comp !== 0) howtoIds.add("exposure-comp");
  if (o.metering && o.metering !== "Matrix") howtoIds.add("metering-mode");

  const shutterDisplay = formatShutter(nearest(SHUTTER_STOPS, shutter));
  const rows: RecipeRow[] = [
    { label: "Mode", value: o.mode },
    { label: "Aperture", value: formatAperture(o.aperture), highlight: o.apertureHighlight },
    {
      label: "Shutter",
      value: o.mode.startsWith("A") ? `${shutterDisplay} (auto)` : shutterDisplay,
      highlight: o.shutterHighlight,
    },
    { label: "ISO", value: String(nearest(ISO_STOPS, iso)) },
  ];
  if (o.comp != null && o.comp !== 0) {
    rows.push({ label: "Exp. comp", value: fmtComp(o.comp), highlight: o.compHighlight ?? true });
  }
  rows.push({ label: "White balance", value: o.wb });
  if (o.metering && o.metering !== "Matrix") rows.push({ label: "Metering", value: o.metering });

  return {
    rank,
    title: o.title,
    mode: o.mode,
    rows,
    why: o.why,
    warnings,
    howtoIds: [...howtoIds],
  };
}

export function recommend(input: RecommendInput): Combo[] {
  const { lens, body, scene, intent, wb } = input;
  const ev = input.ev ?? SCENE_FALLBACK_EV[scene];
  const clipHigh = input.stats?.clipHigh ?? 0;
  const comp = SCENE_COMP[scene];

  // Focal assumption per intent: zooms shoot long for action, wide otherwise
  const focal = intent === "action" ? lens.focal.max : lens.focal.min;

  const combos: Combo[] = [];

  if (intent === "waterfall") {
    const silkyAperture = clampAperture(lens, focal, 16);
    const targetShutter = 0.5;
    const ambient = shutterFor(ev, silkyAperture.value, 100);
    const ndStops = Math.max(0, Math.round(Math.log2(targetShutter / ambient)));
    combos.push(
      buildCombo(1, {
        ev: ev - ndStops, // behind the ND
        lens,
        body,
        focal,
        aperture: silkyAperture.value,
        apertureClamped: false,
        iso: 100,
        mode: "M — Manual",
        title: "Silky water",
        why:
          ndStops > 0
            ? `about ½s turns the fall to silk. In this light that needs a ${ndStops}-stop ND on the 52mm thread.`
            : "about ½s turns the fall to silk — the light is low enough to get there without an ND.",
        wb,
        extraWarnings: ["Tripod required — nothing handholds at ½s.", "Wipe spray off the front element between frames."],
        extraHowtos: ["self-timer"],
        shutterHighlight: true,
        clipHigh,
      }),
    );
    combos.push(
      buildCombo(2, {
        ev,
        lens,
        body,
        focal,
        aperture: clampAperture(lens, focal, 5.6).value,
        apertureClamped: false,
        iso: baseIso(ev, body),
        mode: "S — Shutter priority",
        title: "Frozen droplets",
        why: "1/1000s freezes every droplet — the opposite mood, no filter needed.",
        wb,
        shutterFloor: 1 / 1000,
        shutterHighlight: true,
        clipHigh,
      }),
    );
    return combos;
  }

  if (intent === "action") {
    const wide = clampAperture(lens, focal, maxApertureAt(lens, focal));
    combos.push(
      buildCombo(1, {
        ev,
        lens,
        body,
        focal,
        aperture: wide.value,
        apertureClamped: false,
        iso: baseIso(ev, body),
        mode: "S — Shutter priority",
        title: "Freeze the motion",
        why: "1/500s minimum for animals in motion; wide open feeds the shutter every stop the lens has.",
        comp: comp?.comp,
        wb,
        shutterFloor: 1 / 500,
        shutterHighlight: true,
        extraHowtos: ["af-mode", "af-area-mode"],
        extraWarnings: ["AF-C + 3D tracking, burst mode — let the D7100's 51 points work."],
        clipHigh,
      }),
    );
    combos.push(
      buildCombo(2, {
        ev,
        lens,
        body,
        focal,
        aperture: clampAperture(lens, focal, 8).value,
        apertureClamped: false,
        iso: baseIso(ev, body),
        mode: "S — Shutter priority",
        title: "Slower, sharper edges",
        why: "1/250s with more depth — for subjects pausing between moves.",
        wb,
        shutterFloor: 1 / 250,
        clipHigh,
      }),
    );
    return combos;
  }

  if (intent === "portrait") {
    const wideOpen = maxApertureAt(lens, focal);
    const portraitAperture = clampAperture(lens, focal, wideOpen <= 2 ? 2.2 : wideOpen);
    combos.push(
      buildCombo(1, {
        ev,
        lens,
        body,
        focal,
        aperture: portraitAperture.value,
        apertureClamped: portraitAperture.clamped,
        iso: baseIso(ev, body),
        mode: "A — Aperture priority",
        title: "Subject separation",
        why:
          comp?.why ??
          "near wide-open melts the background; a third-stop down from the limit keeps eyes tack sharp.",
        comp: comp?.comp,
        wb,
        metering: scene === "backlit" || scene === "split-lighting" ? "Spot — on the face" : undefined,
        apertureHighlight: true,
        clipHigh,
      }),
    );
    combos.push(
      buildCombo(2, {
        ev,
        lens,
        body,
        focal,
        aperture: clampAperture(lens, focal, 5.6).value,
        apertureClamped: false,
        iso: baseIso(ev, body),
        mode: "A — Aperture priority",
        title: "Environmental portrait",
        why: "f/5.6 keeps the place in the story — Iceland is half the portrait.",
        wb,
        clipHigh,
      }),
    );
    return combos;
  }

  if (intent === "lowlight" || scene === "low-light") {
    const wide = clampAperture(lens, focal, maxApertureAt(lens, focal));
    combos.push(
      buildCombo(1, {
        ev,
        lens,
        body,
        focal,
        aperture: wide.value,
        apertureClamped: false,
        iso: Math.min(1600, body.iso.practicalMax),
        mode: "A — Aperture priority",
        title: "Hold the handhold",
        why: "wide open + high ISO keeps the shutter above the blur line. Noise cleans up; motion blur doesn't.",
        wb,
        apertureHighlight: true,
        extraWarnings:
          lens.id === "nikkor-55-200-g-ed"
            ? ["The 55-200 is slow here — the 35mm f/1.8 is the low-light tool."]
            : [],
        clipHigh,
      }),
    );
    combos.push(
      buildCombo(2, {
        ev,
        lens,
        body,
        focal,
        aperture: wide.value,
        apertureClamped: false,
        iso: body.iso.practicalMax,
        mode: "M — Manual",
        title: "Ceiling push",
        why: `ISO ${body.iso.practicalMax} is the practical ceiling — grain over blur, always.`,
        wb,
        clipHigh,
      }),
    );
    return combos;
  }

  // Landscape (default / auto)
  const sweet = clampAperture(lens, focal, 8);
  combos.push(
    buildCombo(1, {
      ev,
      lens,
      body,
      focal,
      aperture: sweet.value,
      apertureClamped: sweet.clamped,
      iso: baseIso(ev, body),
      mode: "A — Aperture priority",
      title: "The sweet spot",
      why: comp?.why ?? "f/8 is the lens's sharpest aperture with depth front-to-back.",
      comp: comp?.comp,
      wb,
      metering: scene === "split-lighting" ? "Spot — on the bright half" : undefined,
      apertureHighlight: true,
      clipHigh,
    }),
  );
  combos.push(
    buildCombo(2, {
      ev,
      lens,
      body,
      focal,
      aperture: clampAperture(lens, focal, 5.6).value,
      apertureClamped: false,
      iso: baseIso(ev, body),
      mode: "A — Aperture priority",
      title: "Freeze detail",
      why: "a stop wider buys shutter speed for wind-blown grass and spray.",
      wb,
      clipHigh,
    }),
  );
  return combos;
}
