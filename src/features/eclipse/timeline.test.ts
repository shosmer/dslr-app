import { describe, expect, it } from "vitest";
import { SPOTS, phaseAt, practiceSpot, recipesForPhase, spotById, timelineFor } from "./timeline";

const hellissandur = spotById("hellissandur");

const t = (iso: string) => Date.parse(iso);

describe("eclipse data integrity", () => {
  it("has ≥3 spot presets (PRD §9 acceptance)", () => {
    expect(SPOTS.length).toBeGreaterThanOrEqual(3);
  });

  it("contacts are strictly ordered for every spot", () => {
    for (const s of SPOTS) {
      const { c1, c2, max, c3, c4 } = s.contacts;
      expect(t(c1)).toBeLessThan(t(c2));
      expect(t(c2)).toBeLessThan(t(max));
      expect(t(max)).toBeLessThan(t(c3));
      expect(t(c3)).toBeLessThan(t(c4));
    }
  });

  it("C3 − C2 matches the stated totality duration", () => {
    for (const s of SPOTS) {
      expect((t(s.contacts.c3) - t(s.contacts.c2)) / 1000).toBeCloseTo(s.totalitySeconds, 0);
    }
  });

  it("Hellissandur matches the PRD's verified table", () => {
    expect(hellissandur.contacts.c2).toBe("2026-08-12T17:45:46Z");
    expect(hellissandur.totalitySeconds).toBe(127);
    expect(hellissandur.verified).toBe(true);
  });
});

describe("phaseAt — safety state machine", () => {
  const c = hellissandur.contacts;

  it("is danger (filter on) during partials", () => {
    const phase = phaseAt(hellissandur, t(c.c1) + 60_000);
    expect(phase.id).toBe("partial1");
    expect(phase.safety.state).toBe("danger");
  });

  it("is safe (look up) during totality", () => {
    const phase = phaseAt(hellissandur, t(c.c2) + 30_000);
    expect(phase.id).toBe("totality");
    expect(phase.safety.state).toBe("safe");
    expect(phase.countdownTo?.toISOString()).toBe(new Date(c.c3).toISOString());
  });

  it("returns to danger the moment totality ends", () => {
    const phase = phaseAt(hellissandur, t(c.c3) + 1000);
    expect(phase.id).toBe("partial2");
    expect(phase.safety.state).toBe("danger");
  });

  it("diamond-ring window sits just before C2", () => {
    expect(phaseAt(hellissandur, t(c.c2) - 10_000).id).toBe("diamond");
    expect(phaseAt(hellissandur, t(c.c2) - 60_000).id).toBe("filterCheck");
  });

  it("counts down to C1 before the eclipse", () => {
    const phase = phaseAt(hellissandur, t(c.c1) - 3_600_000);
    expect(phase.id).toBe("pre");
    expect(phase.countdownTo?.toISOString()).toBe(new Date(c.c1).toISOString());
  });
});

describe("recipes per phase", () => {
  it("totality shows the U2 bracket and the wide ambient recipe", () => {
    const ids = recipesForPhase("totality").map((r) => r.id);
    expect(ids).toContain("totality");
    expect(ids).toContain("wide-ambient");
  });

  it("partials show the filtered U1 recipe", () => {
    expect(recipesForPhase("partial1").map((r) => r.id)).toContain("partials");
  });
});

describe("practice mode", () => {
  it("compresses the full arc into ~5 minutes with valid ordering", () => {
    const start = Date.parse("2026-07-20T20:00:00Z");
    const spot = practiceSpot(start);
    const events = timelineFor(spot);
    for (let i = 1; i < events.length; i++) {
      expect(events[i].time.getTime()).toBeGreaterThan(events[i - 1].time.getTime());
    }
    expect(Date.parse(spot.contacts.c4) - start).toBeLessThanOrEqual(5 * 60_000);
    // The state machine runs the same phases on the compressed clock
    expect(phaseAt(spot, start + 60_000).id).toBe("partial1");
    expect(phaseAt(spot, start + 180_000).id).toBe("totality");
  });
});
