import { describe, expect, it } from "vitest";
import type { GearBody, GearLens } from "@/data/gear/types";
import d7100 from "@/data/gear/d7100.json";
import lens35 from "@/data/gear/lens-35mm-f18g.json";
import lens55200 from "@/data/gear/lens-55-200-f4-56g.json";
import { recommend, handholdLimit, type RecommendInput } from "./recommend";

const body = d7100 as GearBody;
const wide = lens35 as GearLens;
const tele = lens55200 as GearLens;

function input(partial: Partial<RecommendInput>): RecommendInput {
  return {
    ev: 12,
    scene: "flat-even",
    stats: null,
    intent: "landscape",
    lens: wide,
    body,
    wb: "Daylight",
    ...partial,
  };
}

function num(v: string): number {
  const m = v.match(/[\d.]+/);
  return m ? parseFloat(m[0]) : NaN;
}

function apertureOf(rows: { label: string; value: string }[]): number {
  return num(rows.find((r) => r.label === "Aperture")!.value);
}

function isoOf(rows: { label: string; value: string }[]): number {
  return num(rows.find((r) => r.label === "ISO")!.value);
}

describe("recommend — gear limits (CLAUDE.md rule 2)", () => {
  it("never opens wider than the lens allows (55-200 at 200mm, action)", () => {
    for (const combo of recommend(input({ intent: "action", lens: tele }))) {
      // action assumes the long end: widest legal there is f/5.6
      expect(apertureOf(combo.rows)).toBeGreaterThanOrEqual(5.6);
    }
  });

  it("never opens wider than f/1.8 on the 35mm in low light", () => {
    for (const combo of recommend(input({ intent: "lowlight", ev: 5, lens: wide }))) {
      expect(apertureOf(combo.rows)).toBeGreaterThanOrEqual(1.8);
    }
  });

  it("never exceeds the body's ISO ceiling", () => {
    for (const combo of recommend(input({ intent: "action", ev: 4, lens: tele }))) {
      expect(isoOf(combo.rows)).toBeLessThanOrEqual(body.iso.max);
    }
  });

  it("every combo produces 2-3 ranked options with a why", () => {
    const combos = recommend(input({}));
    expect(combos.length).toBeGreaterThanOrEqual(2);
    expect(combos.length).toBeLessThanOrEqual(3);
    for (const c of combos) expect(c.why.length).toBeGreaterThan(10);
  });
});

describe("recommend — scene biases", () => {
  it("overcast gets −0.7 EV comp with the sky warning", () => {
    const [top] = recommend(input({ scene: "overcast-white-sky" }));
    const comp = top.rows.find((r) => r.label === "Exp. comp");
    expect(comp?.value).toBe("−0.7 EV");
    expect(top.howtoIds).toContain("exposure-comp");
  });

  it("backlit gets +1.0 EV comp", () => {
    const [top] = recommend(input({ scene: "backlit" }));
    expect(top.rows.find((r) => r.label === "Exp. comp")?.value).toBe("+1.0 EV");
  });
});

describe("recommend — intents", () => {
  it("waterfall silky combo demands a tripod and mentions ND when bright", () => {
    const [silky] = recommend(input({ intent: "waterfall", ev: 14 }));
    expect(silky.warnings.some((w) => w.toLowerCase().includes("tripod"))).toBe(true);
    expect(silky.why.toLowerCase()).toContain("nd");
  });

  it("waterfall in dim light needs no ND", () => {
    const [silky] = recommend(input({ intent: "waterfall", ev: 6 }));
    expect(silky.why.toLowerCase()).toContain("without an nd");
  });

  it("action enforces the 1/500s floor by raising ISO", () => {
    const [top] = recommend(input({ intent: "action", lens: tele, ev: 8 }));
    const shutter = top.rows.find((r) => r.label === "Shutter")!.value;
    const denom = num(shutter.replace(/^1\//, ""));
    expect(denom).toBeGreaterThanOrEqual(500);
    expect(top.howtoIds).toContain("af-mode");
  });

  it("low light on the tele suggests switching to the 35mm", () => {
    const [top] = recommend(input({ intent: "lowlight", ev: 5, lens: tele }));
    expect(top.warnings.some((w) => w.includes("35mm"))).toBe(true);
  });
});

describe("handholdLimit", () => {
  it("uses the 1/(focal × crop) rule", () => {
    expect(handholdLimit(wide, body, 35)).toBeCloseTo(1 / 52.5, 5);
    expect(handholdLimit(tele, body, 200)).toBeCloseTo(1 / 300, 5);
  });
});
