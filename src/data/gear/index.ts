import type { GearBody, GearLens } from "./types";
import d7100 from "./d7100.json";
import lens35 from "./lens-35mm-f18g.json";
import lens55200 from "./lens-55-200-f4-56g.json";
import lensMid from "./lens-mid-placeholder.json";

export const BODY = d7100 as GearBody;
export const LENSES = [lens35, lens55200, lensMid] as GearLens[];

export function lensById(id: string): GearLens {
  return LENSES.find((l) => l.id === id) ?? (lens35 as GearLens);
}

export * from "./types";
