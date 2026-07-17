import { describe, expect, it } from "vitest";
import { correctedSceneEV, evFromExif, evLabel } from "./ev";

describe("evFromExif", () => {
  it("computes EV100 from sunny-16-ish values", () => {
    // f/16, 1/125s, ISO 100 → EV = log2(256/0.008) = 15
    expect(evFromExif({ fNumber: 16, exposureTime: 1 / 125, iso: 100 })).toBeCloseTo(15, 1);
  });

  it("normalizes ISO back to 100", () => {
    const base = evFromExif({ fNumber: 8, exposureTime: 1 / 500, iso: 100 })!;
    const at400 = evFromExif({ fNumber: 8, exposureTime: 1 / 500, iso: 400 })!;
    expect(base - at400).toBeCloseTo(2, 5);
  });

  it("returns null on missing fields", () => {
    expect(evFromExif({ fNumber: 8, iso: 100 })).toBeNull();
    expect(evFromExif({})).toBeNull();
  });
});

describe("correctedSceneEV", () => {
  it("leaves a mid-gray frame unchanged", () => {
    expect(correctedSceneEV(12, 0.18)).toBeCloseTo(12, 5);
  });

  it("raises EV for a frame brighter than mid-gray", () => {
    expect(correctedSceneEV(12, 0.36)).toBeCloseTo(13, 5);
  });

  it("lowers EV for a darker frame", () => {
    expect(correctedSceneEV(12, 0.09)).toBeCloseTo(11, 5);
  });
});

describe("evLabel anchors (PRD §7)", () => {
  it("matches the PRD anchor table", () => {
    expect(evLabel(15)).toBe("bright sun");
    expect(evLabel(12)).toBe("overcast");
    expect(evLabel(9.5)).toBe("golden hour");
    expect(evLabel(6)).toBe("dim interior");
  });
});
