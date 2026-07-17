/** Gear profiles are the source of truth for every recommendation (CLAUDE.md rule 2). */

export interface GearBody {
  id: string;
  type: "body";
  name: string;
  sensor: { format: string; cropFactor: number; mp: number; olpf: boolean };
  iso: { min: number; max: number; extendedMax: number; practicalMax: number };
  /** seconds: min = longest exposure, max = shortest */
  shutter: { min: number; max: number; bulb: boolean; flashSync: number };
  af: { points: number; crossType: number; modes: string[]; tracking3d: boolean };
  metering: string[];
  burstFps: number;
  userBanks: string[];
  controls: string[];
}

export interface GearLens {
  id: string;
  type: "lens";
  name: string;
  shortName: string;
  mount: string;
  focal: { min: number; max: number };
  aperture: { maxWide: number; maxTele?: number; min: number };
  filterThread: number;
  vr: boolean;
  /** open question — VR variant unconfirmed (PRD §17) */
  vrUnconfirmed?: boolean;
  /** placeholder profile awaiting the real lens (PRD §5) */
  placeholder?: boolean;
  notes?: string;
}

/** Widest available aperture at a given focal length (linear interp for zooms). */
export function maxApertureAt(lens: GearLens, focal: number): number {
  const { maxWide, maxTele } = lens.aperture;
  if (maxTele == null || lens.focal.max === lens.focal.min) return maxWide;
  const t = (focal - lens.focal.min) / (lens.focal.max - lens.focal.min);
  return maxWide + (maxTele - maxWide) * Math.min(1, Math.max(0, t));
}
