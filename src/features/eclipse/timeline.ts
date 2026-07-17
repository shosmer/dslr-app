import eclipseData from "@/data/eclipse/snaefellsnes.json";
import type { RecipeRow } from "@/components/ds";

export interface EclipseContacts {
  c1: string;
  c2: string;
  max: string;
  c3: string;
  c4: string;
}

export interface EclipseSpot {
  id: string;
  name: string;
  totalitySeconds: number;
  contacts: EclipseContacts;
  verified: boolean;
  /** cue leads, compressed for practice mode */
  filterCheckLeadMs?: number;
  diamondLeadMs?: number;
}

export const SPOTS: EclipseSpot[] = eclipseData.spots;
export const SUN_ALTITUDE_DEG: number = eclipseData.sunAltitudeDeg;

export function spotById(id: string): EclipseSpot {
  return SPOTS.find((s) => s.id === id) ?? SPOTS[0];
}

/** Canonical eclipse moment for countdowns app-wide (Hellissandur C2, PRD-verified). */
export const ECLIPSE_C2 = new Date(SPOTS[0].contacts.c2);

/** Filter-off is allowed only during totality. The checkpoint cue fires shortly before C2. */
const FILTER_CHECK_LEAD_MS = 2 * 60_000;
/** Diamond-ring window: last seconds before C2 — get ready, filter comes off AT totality. */
const DIAMOND_LEAD_MS = 30_000;

export type PhaseId =
  | "pre" // before C1
  | "partial1" // C1 → filter checkpoint
  | "filterCheck" // checkpoint → diamond window
  | "diamond" // final seconds before C2
  | "totality" // C2 → C3
  | "partial2" // C3 → C4
  | "post"; // after C4

export interface TimelineEvent {
  id: string;
  label: string;
  time: Date;
}

export function timelineFor(spot: EclipseSpot): TimelineEvent[] {
  const c = spot.contacts;
  const c2 = new Date(c.c2);
  const lead = spot.filterCheckLeadMs ?? FILTER_CHECK_LEAD_MS;
  return [
    { id: "c1", label: "C1 · First contact", time: new Date(c.c1) },
    { id: "filter-check", label: "Filter checkpoint", time: new Date(c2.getTime() - lead) },
    { id: "c2", label: "C2 · Totality begins", time: c2 },
    { id: "max", label: "Maximum", time: new Date(c.max) },
    { id: "c3", label: "C3 · Totality ends", time: new Date(c.c3) },
    { id: "c4", label: "C4 · Last contact", time: new Date(c.c4) },
  ];
}

export interface SafetyState {
  state: "danger" | "safe" | "warn";
  title: string;
  detail: string;
}

export interface PhaseState {
  id: PhaseId;
  label: string;
  safety: SafetyState;
  /** the next timeline moment worth counting down to */
  countdownLabel: string;
  countdownTo: Date | null;
  events: TimelineEvent[];
}

export function phaseAt(spot: EclipseSpot, nowMs: number): PhaseState {
  const c = spot.contacts;
  const c1 = Date.parse(c.c1);
  const c2 = Date.parse(c.c2);
  const c3 = Date.parse(c.c3);
  const c4 = Date.parse(c.c4);
  const filterCheckLead = spot.filterCheckLeadMs ?? FILTER_CHECK_LEAD_MS;
  const diamondLead = spot.diamondLeadMs ?? DIAMOND_LEAD_MS;
  const events = timelineFor(spot);

  if (nowMs < c1) {
    return {
      id: "pre",
      label: "Before first contact",
      safety: {
        state: "warn",
        title: "Filter ready",
        detail: "Partials start at C1 — solar filter on the lens before then.",
      },
      countdownLabel: "First contact in",
      countdownTo: new Date(c1),
      events,
    };
  }
  if (nowMs < c2 - filterCheckLead) {
    return {
      id: "partial1",
      label: "Partial phase",
      safety: {
        state: "danger",
        title: "Filter on now",
        detail: "Partial phase — never look unfiltered.",
      },
      countdownLabel: "Totality begins in",
      countdownTo: new Date(c2),
      events,
    };
  }
  if (nowMs < c2 - diamondLead) {
    return {
      id: "filterCheck",
      label: "Filter checkpoint",
      safety: {
        state: "danger",
        title: "Filter still on",
        detail: "Final checks: U2 armed, focus set, bracket ready.",
      },
      countdownLabel: "Totality begins in",
      countdownTo: new Date(c2),
      events,
    };
  }
  if (nowMs < c2) {
    return {
      id: "diamond",
      label: "Diamond ring",
      safety: {
        state: "warn",
        title: "Get ready",
        detail: "Filter comes OFF the moment totality begins.",
      },
      countdownLabel: "Totality begins in",
      countdownTo: new Date(c2),
      events,
    };
  }
  if (nowMs < c3) {
    return {
      id: "totality",
      label: "TOTALITY",
      safety: {
        state: "safe",
        title: "Filter off — look up",
        detail: "Totality. Safe with naked eyes. Bracket, then stop and look.",
      },
      countdownLabel: "Totality ends in",
      countdownTo: new Date(c3),
      events,
    };
  }
  if (nowMs < c4) {
    return {
      id: "partial2",
      label: "Partial phase (waning)",
      safety: {
        state: "danger",
        title: "Filter on now",
        detail: "Totality is over — filter back on before you look or shoot.",
      },
      countdownLabel: "Last contact in",
      countdownTo: new Date(c4),
      events,
    };
  }
  return {
    id: "post",
    label: "Eclipse complete",
    safety: {
      state: "warn",
      title: "That was it",
      detail: "Check your cards. Write down what you felt.",
    },
    countdownLabel: "Eclipse complete",
    countdownTo: null,
    events,
  };
}

/** Phase-by-phase D7100 recipes (PRD §9 — starting points, refined in rehearsal). */
export interface PhaseRecipe {
  id: string;
  title: string;
  bank?: "U1" | "U2";
  lensNote: string;
  accent: "amber" | "teal";
  rows: RecipeRow[];
  note: string;
  phases: PhaseId[];
}

export const PHASE_RECIPES: PhaseRecipe[] = [
  {
    id: "partials",
    title: "Partials · U1",
    bank: "U1",
    lensNote: "55-200 @ 200mm",
    accent: "amber",
    rows: [
      { label: "Filter", value: "SOLAR ON", highlight: true },
      { label: "Mode", value: "M — Manual" },
      { label: "Aperture", value: "f/8" },
      { label: "Shutter", value: "1/500–1/1000s" },
      { label: "ISO", value: "100–200" },
      { label: "Focus", value: "Manual · sun's edge" },
    ],
    note: "Use live view — never the optical viewfinder during partials.",
    phases: ["pre", "partial1", "filterCheck", "partial2", "post"],
  },
  {
    id: "diamond-ring",
    title: "Diamond ring / Baily's beads",
    lensNote: "55-200 @ 200mm",
    accent: "amber",
    rows: [
      { label: "Filter", value: "OFF at C2", highlight: true },
      { label: "Aperture", value: "f/8" },
      { label: "Shutter", value: "1/2000–1/4000s", highlight: true },
      { label: "ISO", value: "200" },
    ],
    note: "Seconds only — then straight into the totality bracket.",
    phases: ["diamond"],
  },
  {
    id: "totality",
    title: "Totality base · U2",
    bank: "U2",
    lensNote: "55-200 @ 200mm",
    accent: "teal",
    rows: [
      { label: "Filter", value: "OFF", highlight: true },
      { label: "Aperture", value: "f/5.6–8" },
      { label: "Shutter", value: "1/1000s → 1s (bracket)", highlight: true },
      { label: "ISO", value: "200–400" },
      { label: "Focus", value: "Manual · sun's edge" },
    ],
    note: "Bracket the corona, then stop and look up for 20 seconds.",
    phases: ["totality"],
  },
  {
    id: "wide-ambient",
    title: "Wide ambient · 35mm",
    lensNote: "35mm f/1.8",
    accent: "teal",
    rows: [
      { label: "Aperture", value: "f/1.8–2.8" },
      { label: "Shutter", value: "1/60–1/125s" },
      { label: "ISO", value: "800–1600" },
    ],
    note: "The darkened landscape and 360° twilight glow — handheld is fine.",
    phases: ["totality"],
  },
];

export function recipesForPhase(phase: PhaseId): PhaseRecipe[] {
  return PHASE_RECIPES.filter((r) => r.phases.includes(phase));
}

/** Compressed practice run (PRD §9.5): the full C1→C4 arc in ~5 minutes. */
export function practiceSpot(startMs: number): EclipseSpot {
  const t = (s: number) => new Date(startMs + s * 1000).toISOString();
  return {
    id: "practice",
    name: "Practice run",
    totalitySeconds: 40,
    contacts: {
      c1: t(15),
      c2: t(170),
      max: t(190),
      c3: t(210),
      c4: t(290),
    },
    verified: true,
    // Cue leads compressed to match the ×20 clock
    filterCheckLeadMs: 45_000,
    diamondLeadMs: 10_000,
  };
}
