# External gates & open items

Things the app is ready for but that need Shanny's hands (PRD §15, §17).

## Blocking the remaining features
- [ ] **3D model gate (by Jul 19–20).** Download the free Sketchfab "Camera Nikon D7100" (euforia.agencia), check control fidelity + license, drop the draco-compressed GLB at `public/model/d7100.glb`. If inadequate → buy (3DOverstock/TurboSquid, ~$20–150) or fall back to photo hotspots. The Camera tab and `content/howtos` are already keyed by control id, so the 3D layer drops in without content rework.
- [ ] **Anthropic API key.** Add `ANTHROPIC_API_KEY` in Vercel project env to activate "Enhance with AI" (`api/analyze.ts` answers 501 until then; the app degrades gracefully).
- [ ] **Vercel project.** `npx vercel` login + link, then deploys give iPhone-testable preview URLs. (Suggest `! npx vercel login` in a Claude Code session.)

## Buy / gather now
- [ ] **52mm solar filter** — order immediately (PRD risk #6). One filter covers both lenses.
- [ ] ISO 12312-2 eclipse glasses.
- [ ] **Nikon D7100 Reference Manual PDF** from the Nikon Download Center → `docs/manual/` (authoring reference for guide review; repo stays private).

## Verify / answer (PRD §17)
- [ ] Eclipse contact times for non-Hellissandur spots are **interpolated estimates** (`verified: false` in `src/data/eclipse/snaefellsnes.json`). Cross-check against timeanddate.com + eclipse2026.is before the Jul 31 freeze; re-verify on the Day-11 scouting trip.
- [ ] Is the 55-200mm the VR variant? Check the barrel → set `"vr": true` in `src/data/gear/lens-55-200-f4-56g.json` (changes handhold guidance).
- [ ] Mid-range lens arrives → replace `src/data/gear/lens-mid-placeholder.json` with real specs.
- [ ] iPhone model + iOS version (wake-lock needs 16.4+; the app falls back with a warning).
- [ ] Trip itinerary in `src/data/trip/iceland-2026.json` is a plausible draft — align it with the real trip plan.
- [ ] Guide + How-To content review against the official manual (CLAUDE.md rule 6) before marking F3 done.
- [ ] EV calibration: ~10 real scenes vs. a light-meter app (PRD §7 acceptance, M2).

## Before the trip (M5)
- [ ] Full-day offline field test on the iPhone (airplane mode).
- [ ] Backyard eclipse dress rehearsal via Practice mode; save U1/U2 banks for real.
- [ ] Content freeze Jul 31 — after that, hotfixes only.
