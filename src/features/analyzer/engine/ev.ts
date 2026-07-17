/** Scene light level from the iPhone capture's EXIF (PRD §7).
 *  EV₁₀₀ = log₂(N²/t) − log₂(ISO/100), corrected by the frame's mean-luminance
 *  deviation from mid-gray. Anchors: bright sun ≈ EV15, overcast ≈ EV12,
 *  golden hour ≈ EV9–10, dim interior ≈ EV6. */

export interface ExposureExif {
  fNumber?: number;
  /** seconds */
  exposureTime?: number;
  iso?: number;
}

const MID_GRAY = 0.18;

/** EV at ISO 100 implied by the capture's exposure settings. */
export function evFromExif(exif: ExposureExif): number | null {
  const { fNumber, exposureTime, iso } = exif;
  if (!fNumber || !exposureTime || !iso || fNumber <= 0 || exposureTime <= 0 || iso <= 0) return null;
  return Math.log2((fNumber * fNumber) / exposureTime) - Math.log2(iso / 100);
}

/** The camera metered the frame to mid-gray; if the resulting frame is brighter
 *  or darker than mid-gray, the scene is that much brighter/darker than the
 *  metered exposure implies. `meanLinear` is the linearized mean luminance (0–1). */
export function correctedSceneEV(evExif: number, meanLinear: number): number {
  const clamped = Math.min(0.95, Math.max(0.005, meanLinear));
  return evExif + Math.log2(clamped / MID_GRAY);
}

/** Human anchor label for an EV level. */
export function evLabel(ev: number): string {
  if (ev >= 14.5) return "bright sun";
  if (ev >= 12.5) return "hazy bright";
  if (ev >= 10.5) return "overcast";
  if (ev >= 8.5) return "golden hour";
  if (ev >= 6.5) return "deep shade";
  if (ev >= 4.5) return "dim interior";
  return "very low light";
}
