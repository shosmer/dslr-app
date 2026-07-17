import type { RecipeRow } from "@/components/ds";

/** Content is data (CLAUDE.md rule 3): guides live in content/guides/*.json,
 *  keyed by id, following the PRD §8 anatomy. Renderers stay dumb. */
export interface GuideStep {
  text: string;
  /** short mono control chip, e.g. "mode dial" */
  control: string;
  /** deep link into the How-To library */
  howtoId?: string;
}

export interface Guide {
  id: string;
  title: string;
  pack: "core" | "iceland";
  locations: string[];
  tags: string[];
  /** one-line symptom/summary shown in list + detail lede */
  summary: string;
  /** "Why it happens" — one plain-language paragraph */
  why: string;
  lensIds: string[];
  recipe: { accent?: "amber" | "teal"; rows: RecipeRow[] };
  steps: GuideStep[];
  pitfalls: string[];
  levelUp?: string;
}

export interface HowTo {
  id: string;
  title: string;
  /** physical controls used, keyed to gear controls / future 3D hotspots */
  controlIds: string[];
  steps: { text: string; control: string }[];
  tip?: string;
  relatedGuideIds?: string[];
}
