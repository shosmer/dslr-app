import { describe, expect, it } from "vitest";
import { GUIDES, HOWTOS, howtoById } from "./content";
import { TRIP_DAYS } from "@/features/home/trip";
import { LENSES } from "@/data/gear";

describe("content integrity (PRD §8 acceptance)", () => {
  it("ships all 12 guides", () => {
    expect(GUIDES.length).toBe(12);
    expect(GUIDES.filter((g) => g.pack === "core").length).toBe(5);
    expect(GUIDES.filter((g) => g.pack === "iceland").length).toBe(7);
  });

  it("ships ≥15 how-tos (PRD §6 acceptance)", () => {
    expect(HOWTOS.length).toBeGreaterThanOrEqual(15);
  });

  it("every guide step howtoId resolves — the Guide → How-To chain has no dead ends", () => {
    for (const g of GUIDES) {
      for (const s of g.steps) {
        if (s.howtoId) {
          expect(howtoById(s.howtoId), `${g.id} → ${s.howtoId}`).toBeDefined();
        }
      }
    }
  });

  it("every how-to relatedGuideId resolves back to a guide", () => {
    const guideIds = new Set(GUIDES.map((g) => g.id));
    for (const h of HOWTOS) {
      for (const gid of h.relatedGuideIds ?? []) {
        expect(guideIds.has(gid), `${h.id} → ${gid}`).toBe(true);
      }
    }
  });

  it("every guide references real lenses", () => {
    const lensIds = new Set(LENSES.map((l) => l.id));
    for (const g of GUIDES) {
      for (const id of g.lensIds) {
        expect(lensIds.has(id), `${g.id} → ${id}`).toBe(true);
      }
    }
  });

  it("every trip-day guideId resolves", () => {
    const guideIds = new Set(GUIDES.map((g) => g.id));
    for (const d of TRIP_DAYS) {
      for (const gid of d.guideIds) {
        expect(guideIds.has(gid), `day ${d.day} → ${gid}`).toBe(true);
      }
    }
  });

  it("guides follow the anatomy: recipe + steps + ≥1 pitfall", () => {
    for (const g of GUIDES) {
      expect(g.recipe.rows.length, g.id).toBeGreaterThanOrEqual(4);
      expect(g.steps.length, g.id).toBeGreaterThanOrEqual(3);
      expect(g.pitfalls.length, g.id).toBeGreaterThanOrEqual(1);
      expect(g.why.length, g.id).toBeGreaterThan(40);
    }
  });
});
