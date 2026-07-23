/** Interactive hotspots for the 3D camera (F1). Content and layout are from the
 *  official D7100 manual ("Parts of the Camera", pp. 2–7); positions are in the
 *  model's local frame calibrated by raycast:
 *    +X = grip/right · +Y = up · +Z = lens/front · −Z = back (LCD)
 *  Renderer is a view over this data — the same hotspots work over any model.
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
}

export const HOTSPOTS: Hotspot[] = [
  // ── Top plate ──
  {
    id: "mode-dial",
    label: "Mode dial",
    what: "Top-left dial — selects P, S, A, M, plus Auto, Scene, Effects, and the U1/U2 user banks. Hold the lock release to turn it.",
    when: "Set to A for most field work; U1/U2 hold your saved eclipse banks.",
    howtoId: "shooting-mode",
    position: [-0.5, 0.42, -0.32],
  },
  {
    id: "release-mode-dial",
    label: "Release-mode dial",
    what: "The collar beneath the mode dial — single frame, continuous low/high (CL/CH), quiet (Q), self-timer, and mirror-up (Mup).",
    when: "CH for wildlife bursts; self-timer for tripod work with no remote.",
    howtoId: "self-timer",
    position: [-0.52, 0.3, -0.1],
  },
  {
    id: "shutter-release",
    label: "Shutter release",
    what: "Half-press to meter and focus; full press to shoot. The power switch rings it.",
    when: "Every frame — and half-press to wake the meter and re-check exposure.",
    position: [0.42, 0.42, 0.3],
  },
  {
    id: "exp-comp-btn",
    label: "Exposure compensation",
    what: "The ± button behind the shutter — hold it and spin the main dial to bias brighter or darker.",
    when: "Black sand, white skies, snow — anywhere the meter gets fooled.",
    howtoId: "exposure-comp",
    position: [0.5, 0.48, 0.02],
  },
  {
    id: "metering-btn",
    label: "Metering button",
    what: "Hold it and spin the main dial: matrix, center-weighted, or spot metering.",
    when: "Spot when one thing must be exposed right — a face, the sun's edge, the bright half.",
    howtoId: "metering-mode",
    position: [0.56, 0.48, -0.2],
  },
  // ── Command dials ──
  {
    id: "sub-command-dial",
    label: "Sub-command (front) dial",
    what: "Front dial by the grip — sets aperture in A and M, and pairs with buttons for many settings.",
    when: "Your aperture control in A mode.",
    position: [0.56, 0.14, 0.34],
  },
  {
    id: "main-command-dial",
    label: "Main (rear) dial",
    what: "Rear dial by your thumb — sets shutter speed, and spins to change ISO/WB/etc. while a button is held.",
    when: "The dial you spin for almost every held-button setting.",
    position: [0.5, 0.3, -0.46],
  },
  // ── Back-left button column ──
  {
    id: "iso-btn",
    label: "ISO button",
    what: "Left column on the back — hold and spin the rear dial to change ISO; watch the top LCD.",
    when: "Raise ISO in low light before the shutter drops below the handhold line.",
    howtoId: "change-iso",
    position: [-0.5, -0.14, -0.5],
  },
  {
    id: "wb-btn",
    label: "WB button",
    what: "Left column — hold and spin the rear dial through white-balance presets.",
    when: "Lock Cloudy/Daylight so golden light stays warm instead of going neutral.",
    howtoId: "white-balance",
    position: [-0.5, 0.1, -0.5],
  },
  {
    id: "qual-btn",
    label: "QUAL button",
    what: "Left column — hold and spin the dials to set image quality (RAW/JPEG) and size.",
    when: "RAW+FINE for latitude; the front dial sets JPEG size.",
    howtoId: "image-quality",
    position: [-0.5, 0.34, -0.5],
  },
  {
    id: "menu-btn",
    label: "MENU button",
    what: "Opens the menus — shooting, playback, setup, retouch. Where U1/U2 banks are saved and cards formatted.",
    when: "Save user banks, format cards, set custom functions.",
    howtoId: "u1-u2-banks",
    position: [-0.5, 0.52, -0.42],
  },
  {
    id: "i-btn",
    label: "i / info buttons",
    what: "The i button edits settings in the info display; the info button shows shutter, aperture, ISO, and AF-area mode on the monitor.",
    when: "A fast way to change settings without hunting through menus.",
    position: [-0.32, -0.3, -0.48],
  },
  // ── Front-left ──
  {
    id: "af-mode-btn",
    label: "AF-mode button",
    what: "Center of the focus-mode selector by the lens mount — hold and spin the dials to pick AF-S/AF-C and the AF-area mode.",
    when: "AF-C + 3D tracking for horses and whales; AF-S for still scenes.",
    howtoId: "af-mode",
    position: [-0.48, -0.18, 0.42],
  },
  {
    id: "bkt-btn",
    label: "BKT button",
    what: "Front-left — hold and spin the dials to set exposure/WB/ADL bracketing frames and step.",
    when: "Bracket high-contrast scenes and the eclipse corona.",
    howtoId: "bracketing",
    position: [-0.42, 0.28, 0.4],
  },
];
