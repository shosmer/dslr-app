# Scanning your D7100 into a 3D splat

Goal: a clean, orbitable Gaussian splat of your actual camera to drop into the Camera tab. All free.

## The honest challenge
A glossy black camera body is the *hardest* case for 3D scanning — shiny surfaces move their highlights as you orbit, which confuses the reconstruction. The difference between "gorgeous" and "smeary blob" is almost entirely **lighting and technique**, not the app. Budget for 2–3 attempts. This is normal.

## What you need
- **Scaniverse** (free, App Store — by Niantic). Use its **Splat** mode, not mesh.
- Soft, even light. **Best: an overcast day near a big window, or a room with diffuse ceiling light.** Avoid a single harsh lamp or direct sun — those create hard highlights that ruin the scan.
- A surface with a bit of texture (wood table, a textured placemat or towel). *Not* a plain glossy white or pure black surface — the scanner needs texture to track against.
- Optional but genuinely helpful: a clip-on **circular polarizer** for your phone lens (~$10) — cuts the glare on the black body.

## Set up the shot
1. Put the camera on the textured surface, **lens cap ON** (the front glass will be an artifact zone otherwise — cap hides it).
2. Mode dial and top plate facing up and clearly visible — those are the controls we'll hotspot.
3. Even light on all sides. If one side is in shadow, add a white paper/foam board to bounce light back. No hard highlights sliding across the body as you move.

## Capture technique (the make-or-break part)
- **Move the phone around the stationary camera** — don't spin the camera on a turntable.
- Do **three full orbits at three heights**: low (near table level), eye-level, and high (looking down at the top plate). The top-down pass matters most — that's where ISO/mode dial/shutter live.
- Go **slow**, keep the whole camera in frame, heavy overlap between frames.
- Aim for **~100–200 photos** of coverage. "When unsure, take more."
- Get in reasonably close so the camera fills the frame — detail comes from proximity.

## After capture
1. Let Scaniverse process (on-device, ~1–2 min). Review it — orbit around, check the top plate and buttons look solid, not melted.
2. **Export as SPZ** (Scaniverse's compact format). If it looks rough, reshoot with softer/more-even light before exporting.
3. Get the file to your Mac (AirDrop to `~/Downloads`, or drop it anywhere in the repo).

## If the black body just won't cooperate
Fallbacks, in order: (1) more diffuse light + the polarizer; (2) a light dusting of removable "3D-scanning matte spray" on the shiniest panels (wipes off; hides the true finish though); (3) worst case we use a cleaned photogrammetry mesh instead. We have options — but try the diffuse-light splat first, it's usually enough for a small object.

---
When you've got an SPZ that looks good on your phone, send it over and I'll drop it into the app. Meanwhile I'm building the renderer + tappable hotspots against a placeholder so it's ready.
