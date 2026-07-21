/** Interactive hotspots for the 3D camera (F1). Content is render-agnostic and
 *  keyed by control id — the splat/model is just the backdrop. Positions are in
 *  the model's local space; the PLACEHOLDER coords below are tuned to the stand-in
 *  splat and get re-authored against Shanny's real D7100 scan (tap-to-place).
 */
export interface Hotspot {
  id: string;
  /** control label shown on the card */
  label: string;
  /** what it is / does — one or two sentences */
  what: string;
  /** when you'd reach for it */
  when?: string;
  /** deep link into the How-To library */
  howtoId?: string;
  /** [x, y, z] in model local space */
  position: [number, number, number];
  /** true until re-authored on the real camera model */
  placeholder?: boolean;
}

/** Full control content for the D7100. Positions marked placeholder are demo
 *  coords on the stand-in splat purely to prove the interaction; the real scan
 *  gets accurate positions. Content is final. */
export const HOTSPOTS: Hotspot[] = [
  {
    id: "mode-dial",
    label: "Mode dial",
    what: "Selects the exposure mode — P, S, A, M — plus the U1/U2 user banks.",
    when: "Set to A for most field work; U1/U2 hold your saved eclipse banks.",
    howtoId: "shooting-mode",
    position: [0.4, 0.5, 0],
    placeholder: true,
  },
  {
    id: "iso-btn",
    label: "ISO button",
    what: "Hold it and spin the rear dial to change ISO; watch the top LCD.",
    when: "Raise ISO in low light before you let the shutter drop below the handhold line.",
    howtoId: "change-iso",
    position: [-0.4, 0.4, 0.2],
    placeholder: true,
  },
  {
    id: "exp-comp-btn",
    label: "Exposure compensation",
    what: "Hold the ± button and spin the rear dial to bias brighter or darker.",
    when: "Black sand, white skies, snow — anywhere the meter gets fooled.",
    howtoId: "exposure-comp",
    position: [0.2, 0.5, 0.35],
    placeholder: true,
  },
  {
    id: "shutter-release",
    label: "Shutter release",
    what: "Half-press to meter and focus; full press to shoot.",
    when: "Every frame — and half-press to wake the meter and re-check exposure.",
    position: [0.35, 0.45, 0.3],
    placeholder: true,
  },
  {
    id: "af-mode-btn",
    label: "AF-mode button",
    what: "In the center of the focus-mode switch — hold and spin a dial to pick AF-S/AF-C and the AF-area mode.",
    when: "AF-C + 3D tracking for horses and whales; AF-S for still scenes.",
    howtoId: "af-mode",
    position: [-0.45, 0.1, 0.35],
    placeholder: true,
  },
  {
    id: "wb-btn",
    label: "WB button",
    what: "Hold and spin the rear dial through white-balance presets.",
    when: "Lock Cloudy/Daylight so golden light stays warm instead of going neutral.",
    howtoId: "white-balance",
    position: [-0.4, 0.35, -0.1],
    placeholder: true,
  },
];
