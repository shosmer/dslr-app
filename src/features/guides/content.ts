import type { Guide, HowTo } from "./types";

const guideModules = import.meta.glob("/content/guides/*.json", { eager: true }) as Record<
  string,
  { default: Guide }
>;
const howtoModules = import.meta.glob("/content/howtos/*.json", { eager: true }) as Record<
  string,
  { default: HowTo }
>;

export const GUIDES: Guide[] = Object.values(guideModules)
  .map((m) => m.default)
  .sort((a, b) => (a.pack === b.pack ? a.title.localeCompare(b.title) : a.pack === "core" ? -1 : 1));

export const HOWTOS: HowTo[] = Object.values(howtoModules)
  .map((m) => m.default)
  .sort((a, b) => a.title.localeCompare(b.title));

export function guideById(id: string): Guide | undefined {
  return GUIDES.find((g) => g.id === id);
}

export function howtoById(id: string): HowTo | undefined {
  return HOWTOS.find((h) => h.id === id);
}
