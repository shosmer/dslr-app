import { describe, expect, it } from "vitest";
import type { FrameStats } from "./histogram";
import { classifyScene, suggestWhiteBalance } from "./classify";

function stats(partial: Partial<FrameStats>): FrameStats {
  return {
    hist: new Array(64).fill(1 / 64),
    meanLinear: 0.18,
    mean: 0.45,
    stdev: 0.15,
    clipHigh: 0,
    clipLow: 0,
    brightMass: 0.05,
    bimodality: 0,
    splitEV: 0,
    skyGroundEV: 0,
    backlitEV: 0,
    avgR: 0.45,
    avgG: 0.45,
    avgB: 0.45,
    ...partial,
  };
}

describe("classifyScene", () => {
  it("low EV wins regardless of shape", () => {
    expect(classifyScene(stats({ bimodality: 0.9, splitEV: 3 }), 5)).toBe("low-light");
  });

  it("detects split lighting from bimodality + half difference", () => {
    expect(classifyScene(stats({ bimodality: 0.5, splitEV: 2.5 }), 12)).toBe("split-lighting");
  });

  it("detects backlight from bright edges vs dark center", () => {
    expect(classifyScene(stats({ backlitEV: 2 }), 12)).toBe("backlit");
  });

  it("detects overcast white sky from bright mass without warm cast", () => {
    expect(classifyScene(stats({ brightMass: 0.4 }), 12)).toBe("overcast-white-sky");
  });

  it("bright sky over dark land is overcast, NOT split lighting (vertical structure is normal)", () => {
    expect(
      classifyScene(stats({ brightMass: 0.5, bimodality: 0.6, skyGroundEV: 2.5, splitEV: 0.2 }), 12),
    ).toBe("overcast-white-sky");
  });

  it("bright mass with a warm cast is not overcast", () => {
    expect(
      classifyScene(stats({ brightMass: 0.4, avgR: 0.6, avgB: 0.4 }), 9.5),
    ).toBe("golden-low-sun");
  });

  it("detects high contrast from both-end clipping", () => {
    expect(classifyScene(stats({ clipHigh: 0.05, clipLow: 0.05 }), 13)).toBe("high-contrast");
  });

  it("falls through to flat-even", () => {
    expect(classifyScene(stats({}), 11)).toBe("flat-even");
  });
});

describe("suggestWhiteBalance", () => {
  it("suggests Cloudy for overcast scenes", () => {
    expect(suggestWhiteBalance(stats({}), "overcast-white-sky")).toBe("Cloudy");
  });

  it("suggests Shade for a strong blue cast", () => {
    expect(suggestWhiteBalance(stats({ avgR: 0.32, avgB: 0.45 }), "flat-even")).toBe("Shade");
  });

  it("suggests Tungsten for a strong warm cast", () => {
    expect(suggestWhiteBalance(stats({ avgR: 0.6, avgB: 0.35 }), "flat-even")).toBe("Tungsten");
  });
});
