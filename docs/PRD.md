# PRD — Ljósmynd (working title)
### An interactive DSLR field companion for the Nikon D7100

| | |
|---|---|
| **Version** | 1.0 — Draft for review |
| **Date** | July 17, 2026 |
| **Owner** | Shannon (Shanny) Hosmer |
| **Built with** | Claude Code |
| **Status** | Ready to build — 15 days to departure (Aug 1) |

> *Ljósmynd* is Icelandic for "photograph" — literally "light-image." Fitting for an app whose maiden voyage is chasing light across Iceland. Rename freely; see Open Questions.

---

## 1. Executive Summary

Ljósmynd is a slick, modern Progressive Web App that acts as a personal photography companion for Shanny's Nikon D7100 and lens kit. It combines an interactive 3D guide to the physical camera, a hybrid (on-device + AI) lighting analyzer that turns a phone snapshot into concrete D7100 settings, curated troubleshooting guides written from the official D7100 manual, and a dedicated **Eclipse Mode** for the August 12, 2026 total solar eclipse on Snæfellsnes.

The app must be **field-ready before August 1, 2026** (Iceland departure) and **fully functional offline** for the parts that matter in the field — rural Iceland connectivity is unreliable, and the eclipse waits for no API.

**The one-sentence pitch:** *Point your phone at the light, and know exactly which dials to turn on your D7100 — even standing on a lava field with no signal, two minutes before totality.*

---

## 2. Context & Why Now

- **The trip.** Iceland, Aug 1–13, 2026: waterfalls, black-sand beaches, glacier lagoons, horseback riding, whale watching — a two-week gauntlet of tricky, beautiful light.
- **The eclipse.** Aug 12, totality crosses the Snæfellsnes peninsula at **~17:45:46 local time**, lasting up to **2m 07s** (Hellissandur). The sun sits ~24° above the western horizon. This is a once-in-a-lifetime shot with a hard 2-minute window and zero margin for fumbling with settings.
- **The gear.** A capable D7100 kit that deserves to be used in full manual confidence, not left on Auto.
- **The builder.** Shanny is building this herself with Claude Code — the PRD doubles as the working spec Claude Code will implement against (see §18).

**Deadline math:** PRD approved ~Jul 17 → feature-complete Jul 29 → field test + freeze Jul 31 → fly Aug 1 → eclipse Aug 12.

---

## 3. Goals & Non-Goals

### Goals (v1)
1. Give confident, gear-specific setting recommendations for real lighting situations, in under 10 seconds, with or without connectivity.
2. Teach the *physical* camera — where every dial and button is and how to actually change a setting on the D7100 body.
3. Make eclipse day foolproof: right settings, right timing, right safety, rehearsed in advance.
4. Feel like a polished native app: installed on the home screen, fast, bold, dark, delightful.
5. Be structured so a second camera body or lens can be added later without rearchitecting (data-driven gear profiles).

### Non-Goals (v1)
- No accounts, no multi-user support, no social features.
- No conversational "ask the manual anything" AI chat (v2 — see §16).
- No Android-specific enhancements (iOS-safe baseline only).
- No photo editing, culling, or image management.
- No camera-to-phone image transfer (the D7100 lacks built-in Wi-Fi; the WU-1a accessory path is out of scope).
- No public distribution or app store presence.

---

## 4. Primary User & Usage Context

**The user:** Shanny — a design leader and enthusiast photographer who knows composition instinctively but wants fast, trustworthy answers on exposure mechanics for her specific gear. One user in v1; the data model supports more gear later (§5).

**Field conditions the design must respect:**

| Condition | Design consequence |
|---|---|
| No/spotty signal (highlands, Snæfellsnes) | Every P0 feature works offline; AI is an enhancement, never a dependency |
| Bright overcast glare or low sun | High-contrast dark UI, large type, no subtle gray-on-gray |
| Cold hands / light gloves | ≥44pt touch targets, primary actions thumb-reachable, minimal typing |
| Time pressure (eclipse, fleeting light) | Recommendations in ≤2 taps from launch; countdowns and checklists pre-armed |
| One hand holding a camera | Bottom-tab nav, one-handed reach for core flows |

---

## 5. Gear Profiles (Data Foundation)

All recommendations, how-tos, and content are keyed to structured gear data — hardcoded to Shanny's kit in v1, extensible by design. **Correction from the concept doc:** the telephoto is the AF-S DX Nikkor **55-200mm f/4-5.6G ED** (the concept's "f/1.4-5.6G" was a typo), and the body is the **D7100** (not "7D7100").

### Camera body — Nikon D7100
Key facts the app's logic and content rely on:
- 24.1MP DX (APS-C, 1.5× crop) CMOS, no optical low-pass filter
- ISO 100–6400 native, expandable to 25600 (Hi2); practical field ceiling ~ISO 3200
- Shutter 30s–1/8000s + Bulb; flash sync 1/250s
- 51-point AF (15 cross-type), AF-S/AF-C, 3D tracking; dedicated AF-mode button + M/AF switch
- Matrix / center-weighted / spot metering; 2016-pixel RGB sensor
- 6 fps burst (7 fps in 1.3× crop mode)
- U1/U2 user settings banks on the mode dial — **central to Eclipse Mode** (pre-bank filtered vs. totality settings)
- Dual SD slots, EN-EL15 battery, optical pentaprism (100% coverage)

### Lenses
| Lens | Key specs | Notes |
|---|---|---|
| AF-S DX Nikkor 35mm f/1.8G | 52.5mm equiv., f/1.8, 52mm filter thread | Low light, environmental shots, totality wide-angles |
| AF-S DX Nikkor 55-200mm f/4-5.6G ED | 82.5–300mm equiv., 52mm filter thread | Wildlife, compression, **eclipse close-ups at 200mm**. Confirm whether it's the VR variant (affects handhold guidance) |
| *Incoming mid-range lens (TBD)* | Placeholder profile | Between 35 and 55mm; fill in on arrival — app ships with an editable placeholder |

Convenient coincidence: **both current lenses share a 52mm filter thread**, so one 52mm solar filter and one 52mm ND kit covers everything.

### Data model (v1 shape)
```jsonc
// src/data/gear/d7100.json (abridged)
{
  "id": "nikon-d7100", "type": "body", "name": "Nikon D7100",
  "sensor": { "format": "DX", "cropFactor": 1.5, "mp": 24.1 },
  "iso": { "min": 100, "max": 6400, "extendedMax": 25600, "practicalMax": 3200 },
  "shutter": { "min": 30, "max": 0.000125, "bulb": true, "flashSync": 0.004 },
  "controls": ["mode-dial", "front-dial", "rear-dial", "iso-btn", "wb-btn", ...]
}
// src/data/gear/lens-35mm-f18g.json
{
  "id": "nikkor-35-18g", "type": "lens", "mount": "F-DX",
  "focal": { "min": 35, "max": 35 }, "aperture": { "maxWide": 1.8, "min": 22 },
  "filterThread": 52, "vr": false
}
```
Guides and recommendations reference gear by `id`, so adding a future body/lens = adding a JSON file + content, not new code.

---

## 6. Feature F1 — Interactive 3D Camera Guide (P0)

**Purpose:** Learn the physical D7100 by touching it — a photorealistic, interactive 3D model where every meaningful control is a tappable hotspot.

**Decision (Shanny, 7/17):** True 3D from day one, rendered with React Three Fiber. Model sourcing is the schedule's #1 risk and is gated early (§15).

### Requirements
1. **3D viewer:** Orbit/pinch-zoom around a photorealistic D7100 (+ mounted lens visual if the model allows). Smooth on iPhone Safari; draco-compressed GLB, target ≤15MB, lazy-loaded and cached for offline.
2. **Hotspots:** ≥20 tappable markers on the model's controls: mode dial, release-mode collar, front/rear command dials, shutter release, ISO / WB / QUAL buttons, exposure-comp button, metering button, AF-mode button + focus-mode switch, AE-L/AF-L, live view lever, i and info buttons, playback/menu cluster, diopter, flash pop-up, card doors, battery door.
3. **Hotspot cards:** Tap → bottom-sheet card: what it is, what it does, when you'd use it, and a **"Show me how"** link into the relevant How-To.
4. **How-To Library:** Searchable, browsable step-by-step recipes for physical operations (e.g., *Change ISO: hold ISO button → spin rear dial → watch top LCD*). Each step names the physical control and highlights it on the 3D model. Initial set (~15): ISO, WB, exposure comp, metering mode, AF mode (AF-S/AF-C), AF-area mode, focus point, shooting mode (P/S/A/M), U1/U2 save & recall, bracketing, self-timer/remote, image quality (RAW+JPEG), format card, diopter, 1.3× crop toggle.
5. **Render-agnostic content:** Hotspot and How-To content live in JSON keyed by control `id` — the 3D layer is a *view* over that data. (This is also the safety net: if the 3D model falls through, the same data renders over annotated photos without content rework.)

### Model sourcing plan (Week-1 gate)
- **Candidates found (7/17):** Sketchfab has a free ["Camera Nikon D7100" by euforia.agencia](https://sketchfab.com/3d-models/camera-nikon-d7100-ca845d03fafb42daa973019abfc1a013) and a paid ["Nikon D7100 DSLR camera" by 3DOverstock](https://sketchfab.com/3d-models/nikon-d7100-dslr-camera-d88fef80a08a4037a5e177dcb3b26f93); TurboSquid/CGTrader have additional Nikon options (typically $20–150).
- **Gate (by Jul 19):** Download/evaluate the free model first — check control fidelity (are the actual buttons modeled?), texture quality, license terms, and poly count. If inadequate, buy the best paid option. If nothing passes by Jul 20, decision point with Shanny: stylized 3D or photo-hotspot fallback.

### Acceptance criteria
- [ ] Model loads in <3s on iPhone over Wi-Fi, instantly when cached; usable offline
- [ ] 60fps-feeling orbit/zoom on Shanny's iPhone (no jank)
- [ ] ≥20 hotspots, each with a card; ≥15 How-Tos, each reachable from search and from hotspots
- [ ] A first-time user can find and follow "change ISO" in under 30 seconds

---

## 7. Feature F2 — Lighting Analyzer (P0)

**Purpose:** Snap the scene with the iPhone; get concrete D7100 settings for the lens that's mounted and the shot you're going for.

**Decision (Shanny, 7/17):** Hybrid intelligence — deterministic on-device analysis that always works offline, with an optional Claude-vision enhancement when online.

### Flow
1. Open Analyzer → capture photo (or pick from library).
2. Select context: **mounted lens** (persisted from last time) + **intent** — Landscape / Portrait / Action-wildlife / Waterfall-long-exposure / Low light / Auto-detect.
3. **On-device engine** (<2s, no network) produces recommendations.
4. If online, an **"Enhance with AI"** button (per-capture, opt-in) sends a downscaled copy for scene-level analysis layered on top.

### On-device engine (deterministic, explainable)
- **Scene light level:** Read the iPhone capture's EXIF (aperture, shutter, ISO — preserved through the file-input capture path) and compute scene EV₁₀₀ = log₂(N²/t) − log₂(ISO/100), corrected by the frame's mean-luminance deviation from mid-gray. This anchors absolute brightness (bright sun ≈ EV15, overcast ≈ EV12, golden hour ≈ EV9–10, dim interior ≈ EV6).
- **Histogram analysis:** luminance histogram, highlight/shadow clipping %, bimodality (split-light detection), spatial contrast map (backlight detection: dark center vs. bright edges).
- **Color temperature estimate** (gray-world approximation) → white balance suggestion.
- **Scene classification (rules):** high-contrast, overcast/white-sky, split-lighting, backlit, golden/low sun, low light, flat-even.
- **Recommendation mapper:** EV + classification + intent + mounted-lens profile → 2–3 ranked setting combos across the exposure triangle, each with: aperture / shutter / ISO, a one-line *why*, warnings ("sky will blow out — meter for the highlights and use −0.7 EV comp"), handhold check (1/(focal×1.5) rule, VR-aware), and accessory advice (ND filter for silky waterfalls, tripod thresholds).
- **Deep links:** every recommended setting links into F1's How-To for physically dialing it in.

### AI enhancement (online, opt-in)
- POST a ≤1024px JPEG to `/api/analyze` (Vercel serverless function proxying the Anthropic API; key server-side, never in the client).
- Claude vision returns structured JSON: scene description, subject identification, composition suggestions, refinement of the local recommendation with reasoning, and pitfalls specific to what's actually in frame.
- UI merges AI insight *around* the local recommendation (never replaces it silently). Timeouts and failures degrade to local-only with a quiet notice.
- Last 20 analyses (thumbnail + result) cached locally for reference.

### Acceptance criteria
- [ ] Full local result in <2s from capture, in airplane mode
- [ ] EXIF-based EV estimate within ±1 EV of a light-meter reference across ~10 test scenes (calibration task in M2)
- [ ] Recommendations always respect the mounted lens's real aperture range and the D7100's ISO/shutter limits
- [ ] AI path adds ≤5s, fails gracefully, and is never required
- [ ] Every recommendation deep-links to at least one How-To

---

## 8. Feature F3 — Scenario & Troubleshooting Guides (P0)

**Purpose:** Curated, offline-first field guides for the exact situations Shanny will hit — written from the official D7100 manual plus photography best practice, in her app's voice: direct, visual, recipe-first.

**Decision (Shanny, 7/17):** Curated guides only in v1 — no RAG chat over the manual until v2. The manual is still parsed and used as the authoring source (§13).

### Guide anatomy (every guide follows it)
**Situation → What's going wrong (symptoms) → Why (1 paragraph, plain language) → The D7100 recipe (settings table) → Set it up (steps, linked to How-Tos) → Watch out for (pitfalls) → Level up (optional refinement).**

### v1 guide set
**Core lighting challenges (from concept doc):**
1. High-contrast scenes (deep shadows + bright highlights)
2. Overcast / pure white skies
3. Split-lighting (half the frame dark, half bright)
4. Backlit subjects
5. Golden hour / low sun

**Iceland pack (trip-aware):**
6. Waterfalls — silky vs. frozen water (ND advice, spray management at Seljalandsfoss/Skógafoss)
7. Black-sand beaches (Reynisfjara — metering traps, negative exposure comp)
8. Glacier lagoon & Diamond Beach (ice highlights, polarizer notes)
9. Moving animals — Icelandic horses, whale watching (AF-C, 3D tracking, shutter floors)
10. Hot-spring steam & geysir bursts (timing, freeze vs. blur)
11. Dim interiors — inside the volcano, turf houses (high ISO strategy, noise expectations)
12. Landscape panoramas & long vistas (aperture sweet spot, hyperfocal basics)

Each guide is tagged by trip location so Home can surface "today's guides" (§11). Content is Markdown/MDX + a structured settings block, fully precached for offline.

### Acceptance criteria
- [ ] All 12 guides written, reviewed against the D7100 manual, and readable offline
- [ ] Every recipe's settings are valid for the specific lens(es) recommended in it
- [ ] Guide → How-To → 3D hotspot chain works end to end

---

## 9. Feature F4 — Eclipse Mode (P0)

**Purpose:** A dedicated, fully-offline module that makes the ~2 minutes of totality on Aug 12 foolproof. This is the feature the whole timeline bends around.

### Verified event data (baked into the app as a static table)
| Fact | Value |
|---|---|
| Date | Tuesday, Aug 12, 2026 |
| Umbral shadow reaches Snæfellsnes | **17:45:46 local (GMT)** |
| Totality duration — Hellissandur | 2m 07s |
| Totality duration — Ólafsvík / Svöðufoss | 2m 05s / 2m 06s |
| Totality duration — Grundarfjörður (Kirkjufell) | 1m 50s |
| Totality duration — Stykkishólmur | 1m 23s |
| Sun altitude during totality | ~24° (Reykjavík reference: totality 17:48:12 at 24.5°, western sky) |
| Partial phases | Begin ~1 hour before totality; end ~1 hour after |

*(Build task: bake exact C1–C4 contact times for 3–4 candidate viewing spots from a precise source; cross-check two sources. The trip plan has Day 11 reserved for scouting — the app should let her pick the spot and get that spot's timeline.)*

### Requirements
1. **Eclipse timeline & countdowns:** A live timeline for the chosen viewing location: C1 (first contact) → filter checkpoints → C2 (totality begins) → max → C3 (totality ends) → C4. Large countdown clocks; works entirely offline; screen **wake-lock** during the sequence (iOS 16.4+ supports it); loud/visual cues at "FILTER OFF" (C2) and "FILTER ON" (C3) moments.
2. **Phase-by-phase D7100 recipes** (starting points, refined during rehearsal):
   - *Partials (filtered):* 55-200 @ 200mm, solar filter ON, ~f/8, 1/500–1/1000s, ISO 100–200, manual focus on the sun's edge, live view to avoid staring through the viewfinder.
   - *Diamond ring / Baily's beads:* filter OFF seconds before C2, ~1/2000–1/4000s, f/8, ISO 200.
   - *Totality (~2 min):* bracket the corona 1/1000s → 1s at f/5.6–8, ISO 200–400; **AND a scripted 20-second pause to just look up.**
   - *Wide ambient:* 35mm f/1.8 shots of the darkened landscape / 360° twilight glow.
   - *U1/U2 strategy:* U1 = filtered partial settings, U2 = totality base settings — one dial-click to switch when the moment comes. The app teaches saving these banks in advance (links to How-To).
3. **Safety module:** Eye safety (ISO 12312-2 glasses, never the optical viewfinder unfiltered pre/post-totality), sensor safety (solar filter on the lens for all partial phases), and the "when is it actually safe to look" rule tied to the timeline.
4. **Prep checklist (armed from Home starting Aug 1):** 52mm solar filter *(buy before departure — flagged as an immediate to-do)*, eclipse glasses, tripod, charged EN-EL15 spares (cold drains batteries), empty cards, U1/U2 banks saved, focus rehearsed, layers/gloves.
5. **Practice mode:** Run the full timeline as a compressed simulation (e.g., 5 minutes) at home before the trip — the backyard dress rehearsal is a scheduled milestone (§14).
6. **Cloud contingency card:** If it's overcast — settings for the eerie darkness itself, and a note to put the camera down and experience it.

### Acceptance criteria
- [ ] Entire module functions in airplane mode, including countdowns and wake-lock
- [ ] Timeline adjusts to the selected viewing spot (≥3 presets + custom)
- [ ] Filter on/off cues are unmissable (full-screen color + sound if permitted)
- [ ] Practice mode run-through completed before Aug 1 (that's the test)

---

## 10. Feature F5 — Learning Hub (P1) & F6 — Presets and Field Notes (P1)

### F5 Learning Hub
- **Exposure Triangle interactive:** sliders for aperture/shutter/ISO showing coupled trade-offs (brightness, depth of field, motion blur, noise) with visual examples; constrained to the selected lens's real range.
- **Lens mechanics primers:** focal length & DX crop, depth of field, when to reach for the 35mm vs. the 55-200.
- **Accessories primer:** filters (ND, polarizer, solar), hoods, tripods — with 52mm-specific buying notes.
- **Glossary** cross-linked from all guides.

### F6 Presets & Field Notes
- Save any recommendation or guide recipe as a named preset ("Skógafoss silky water"); recently-used surfaces on Home.
- Lightweight notes (text) attachable to presets and analyzer captures.
- **Local-only storage** (IndexedDB) with one-tap JSON export/import for backup. No accounts, no sync in v1. *(Stated assumption — flag if sync matters.)*

Acceptance: presets/notes survive app restarts and offline periods; export produces a re-importable file.

---

## 11. Information Architecture & Navigation

Bottom tab bar, five tabs:

| Tab | Content |
|---|---|
| **Home** | Trip-aware dashboard: countdown to eclipse, "today in Iceland" card (driven by a static trip-itinerary JSON matching the trip plan: date → location → suggested guides), quick actions (Analyze, resume last How-To), armed checklists |
| **Camera** | F1: 3D viewer + How-To Library |
| **Analyze** | F2: capture → recommendations (+ AI enhance) |
| **Guides** | F3 scenario guides + F5 Learning Hub (segmented) |
| **Eclipse** | F4, promoted with a badge during Aug 1–12; recedes to a menu item post-trip |

Cross-linking is the IA's spine: Analyzer results → Guides → How-Tos → 3D hotspots. Nothing is a dead end.

---

## 12. UX & Design Direction

- **Aesthetic:** Slick, bold, modern — closer to a premium camera-brand companion than a utility. Dark-first UI (fits the photography context, preserves night vision near totality, OLED-friendly); one confident accent color (suggestion: eclipse-corona amber on near-black; a teal alternative nods to Iceland — pick during M1 design pass).
- **Type:** A bold geometric display face for headers (e.g., Space Grotesk) + a workhorse UI face (e.g., Inter). Self-hosted (offline).
- **Motion:** 120–200ms eased transitions; camera-orbit easing in the 3D viewer; number-roll on countdowns. Motion communicates state, never decorates gratuitously.
- **Field ergonomics:** ≥44pt targets, bottom-anchored primary actions, high-contrast text (WCAG AA against the dark palette), no critical interaction behind long-press or multi-finger gestures (gloves).
- **PWA feel:** standalone display, themed status bar, app icon + splash, no browser chrome, instant back-forward, skeleton states — it should pass the "is this native?" squint test.
- **Voice:** Direct, confident, zero fluff — recipes first, theory one tap deeper.

---

## 13. Technical Architecture

**Decision (Shanny, 7/17):** React + Vite + React Three Fiber, TypeScript, Tailwind; deployed on Vercel with serverless functions for the AI proxy.

```
ljosmynd/
├── docs/PRD.md                  # this document
├── CLAUDE.md                    # Claude Code project brief (§18)
├── api/analyze.ts               # Vercel serverless: Claude vision proxy
├── public/                      # icons, splash, model/d7100.glb (draco)
├── content/
│   ├── guides/*.mdx             # F3 scenario guides
│   ├── howtos/*.json            # F1 step recipes, keyed by control id
│   └── learn/*.mdx              # F5
├── scripts/
│   ├── extract-manual.ts        # PDF → chunked text for authoring reference
│   └── compress-model.ts        # gltf-transform: draco + texture resize
└── src/
    ├── app/                     # routes, tab shell, theme
    ├── features/
    │   ├── camera3d/            # R3F viewer, hotspots.json, HowToPlayer
    │   ├── analyzer/            # engine/ (ev, histogram, classify, recommend), ai/
    │   ├── guides/              # MDX renderer, tags, trip surfacing
    │   ├── eclipse/             # timeline, countdown, checklist, practice
    │   └── presets/             # IndexedDB store, export/import
    ├── data/
    │   ├── gear/*.json          # §5 profiles
    │   ├── trip/iceland-2026.json
    │   └── eclipse/snaefellsnes.json
    └── lib/                     # exif (exifr), ev-math, storage (idb), pwa
```

**Key choices:**
- **State:** Zustand (light, no boilerplate). Persistent bits (mounted lens, presets, analyzer history) in IndexedDB via `idb-keyval`.
- **PWA:** `vite-plugin-pwa` (Workbox). Precache app shell + all content + gear data + eclipse data; the 3D model cached on first view (or via "Download everything" — see Offline strategy below). `navigator.storage.persist()` requested on install.
- **3D:** R3F + drei (`OrbitControls`, `Html` for hotspot markers), draco-compressed GLB via `gltf-transform`; `<Suspense>` with a branded loader.
- **EXIF:** `exifr` (parses JPEG/HEIC from the iOS file-input capture path).
- **AI proxy:** `api/analyze.ts` — accepts a downscaled image (≤1024px, ≤1MB enforced), calls Anthropic vision with a structured-output prompt, returns JSON. `ANTHROPIC_API_KEY` in Vercel env only. Basic abuse guard (simple shared token in the PWA + size/rate caps) since the endpoint is public but the app is personal.
- **Manual pipeline:** Download the official Nikon D7100 Reference Manual PDF → `extract-manual.ts` produces searchable chunked text **used at authoring time** (Claude Code drafts guides/how-tos from it; Shanny reviews). The manual text ships to the repo as authoring reference, not to the client bundle. Repo stays **private** (manual content is Nikon's copyright; personal use).
- **Testing:** Vitest for the analyzer engine (EV math, classifier, recommender — the most unit-testable logic); Playwright smoke for routes + offline mode; real-device testing via Vercel preview URLs on the iPhone throughout (not at the end).

### iOS Safari / PWA constraints (design inputs, not surprises)
| Constraint | Mitigation |
|---|---|
| No Ambient Light Sensor API | Analyzer is capture-based (EXIF + histogram), not live-sensor |
| `getUserMedia` quirks inside installed PWAs on some iOS versions | Primary path is `<input type="file" capture="environment">` (always works, preserves EXIF); live camera preview is progressive enhancement — **Day-2 spike on Shanny's actual iPhone decides** |
| Install is manual (Share → Add to Home Screen) | First-run coach marks for install; app fully functional in-tab too |
| Storage can be evicted under pressure | `storage.persist()`, total offline budget ≤ ~30MB, "re-download content" recovery button |
| Wake Lock API needs iOS 16.4+ | Eclipse mode checks + falls back to "keep tapping" warning (confirm Shanny's iOS version — Open Questions) |
| No Web Push needed | All countdowns are in-app; no notification infrastructure in v1 |

### Offline strategy (the P0 rule)
**Rule: if it's needed on a lava field, it works in airplane mode.** Offline: everything except the AI enhancement and the initial install. A **"Trip mode — download everything"** action on Home precaches the model, all guides, eclipse data, and fonts, then reports total storage used. Service-worker updates prompt (never silently break mid-trip); **content freeze Jul 31** — no deploys during the trip except critical fixes.

### Privacy & cost
- Photos are processed on-device; nothing leaves the phone except the explicit per-capture AI opt-in (downscaled copy, not stored server-side).
- Anthropic API cost at personal scale: roughly a cent or two per enhanced analysis — negligible; still capped server-side.
- One-time costs: 3D model license $0–150 (gate decides); 52mm solar filter ~$20–40 (buy immediately); Vercel hobby tier $0.

---

## 14. Milestones (Jul 17 → Aug 1)

Two parallel tracks so the 3D bet doesn't block the field essentials. Claude Code is the implementation partner throughout; Shanny reviews and field-tests.

| Milestone | Dates | Deliverables | Gate / test |
|---|---|---|---|
| **M0 — Foundations & spikes** | Jul 17–19 | Repo + CLAUDE.md + scaffold (Vite/TS/Tailwind/PWA), deployed to Vercel; **Spike A:** camera capture + EXIF on Shanny's iPhone; **Spike B:** evaluate free D7100 model in R3F on-device | 🚦 **Jul 19–20: 3D go/no-go** (free model / buy / fallback decision). **Buy solar filter now.** |
| **M1 — Shell & design system** | Jul 19–21 | Dark theme, type, tabs, Home w/ trip card + eclipse countdown; gear profiles + content schema | Installs to home screen; looks like *the app* |
| **M2 — Analyzer** | Jul 21–24 | Local engine (EV/histogram/classify/recommend) + UI + lens/intent selection; AI proxy + enhance flow; engine unit tests + **EV calibration against ~10 real scenes** | Airplane-mode analysis on-device in <2s |
| **M3 — Content & Eclipse** | Jul 24–27 | All 12 guides authored from the manual; How-To content; Eclipse Mode complete (timeline, recipes, safety, checklist, practice mode) | Guides read well on phone; practice mode runs offline |
| **M4 — 3D integration** *(parallel from Jul 20)* | Jul 20–29 | Model optimized + hotspots + cards + How-To highlighting | Smooth orbit on iPhone; 20+ hotspots live |
| **M5 — Harden & rehearse** | Jul 29–31 | Trip-mode download, storage persist, error states, polish pass; **full-day offline field test**; **backyard eclipse dress rehearsal** (U1/U2 banks saved, sequence practiced) | ✅ Content freeze Jul 31 |
| **Trip ops** | Aug 1–13 | No changes; hotfix-only | Eclipse Day: app does its job, then gets out of the way |

**If time compresses,** the cut line runs bottom-up: F6 → F5 interactives (ship as static content) → AI enhancement → reduce guide count to the Iceland 6. **Never cut:** Eclipse Mode, local analyzer, offline integrity.

---

## 15. Risks & Mitigations

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | **3D model inadequate or mis-licensed** | Medium | High (headline feature) | Week-1 gate; free candidate already identified + paid backups; render-agnostic content layer means photo fallback costs a day, not a week |
| 2 | **iOS camera/EXIF quirks in PWA** | Medium | High (analyzer) | Day-2 spike on the actual device; file-input capture path as the guaranteed baseline |
| 3 | **Schedule (15 days, evenings/weekends)** | Medium | High | Parallel tracks, explicit cut line, Claude Code velocity, P0 discipline |
| 4 | **Offline storage evicted mid-trip** | Low | High | `storage.persist()`, ≤30MB budget, re-download recovery, pre-flight check on Jul 31 |
| 5 | **Eclipse data error** | Low | Severe | Cross-check two sources; per-spot tables reviewed during Day-11 scouting; practice mode surfaces mistakes early |
| 6 | **Solar filter doesn't arrive** | Low | High (partial-phase shots) | Order today (Jul 17); backup: buy solar film sheet locally; totality itself needs no filter |
| 7 | **Scope creep (it's a fun project)** | High | Medium | This PRD is the contract; new ideas go to §16 v2 backlog |

---

## 16. Success Criteria & v2 Backlog

### v1 succeeds if…
1. **Before the trip:** installed on Shanny's iPhone, full offline day-test passed, eclipse rehearsal completed with U1/U2 banks saved.
2. **On the trip:** used in the field most days; at least one shot Shanny credits to an app recommendation; zero critical failures without connectivity.
3. **Eclipse day:** the sequence runs — filtered partials, filter-off cue honored, totality bracket captured, *and the scripted look-up moment happened*.
4. **After:** the app still earns a place on the home screen for everyday shooting.

### v2 backlog (post-trip)
- **"Ask the manual" AI chat** — RAG over the parsed D7100 manual (the deferred conversational layer)
- Generalized gear onboarding (add any body/lens; community-shareable gear packs)
- Android/Chrome enhancements (ambient light sensor live metering, install prompts)
- Shot journal: import D7100 photos, read their EXIF, compare against what the app recommended
- Trip packs beyond Iceland; aurora module for a future winter trip
- Real app name + icon design pass (if "Ljósmynd" doesn't stick)

---

## 17. Open Questions

| # | Question | Owner | Needed by |
|---|---|---|---|
| 1 | Incoming mid-range lens — exact model? (placeholder profile ships meanwhile) | Shanny | When it arrives |
| 2 | Is the 55-200mm the VR variant? (check the barrel — affects handhold guidance) | Shanny | M2 |
| 3 | 3D model budget approval if the free one falls short (~$20–150) | Shanny | Jul 20 gate |
| 4 | iPhone model + iOS version (wake-lock + performance targets) | Shanny | M0 spike |
| 5 | App name: keep *Ljósmynd*? | Shanny | Whenever |
| 6 | Anthropic API key available for the proxy? (needed for AI enhance only) | Shanny | M2 |

---

## 18. Working With Claude Code

**How to use this PRD:** create the repo, drop this file at `docs/PRD.md`, and add the `CLAUDE.md` below at the root. Work milestone-by-milestone — one Claude Code session per milestone keeps context tight. Start each session by pointing at the PRD section(s) in scope (e.g., *"Implement M2 per docs/PRD.md §7 and §14"*). Use plan mode for M0 and M4 (the riskiest), and keep the acceptance-criteria checklists as the definition of done.

### Starter `CLAUDE.md`
*(Adopted at repo root — see `/CLAUDE.md`.)*

### Suggested first prompt (M0)
> "Read docs/PRD.md. Scaffold the project per §13 (Vite + React + TS + Tailwind + vite-plugin-pwa + R3F), set up Vercel deploy, and build Spike A: a test page using `<input type='file' capture='environment'>` that reads EXIF (exifr) from a captured photo and displays aperture/shutter/ISO. Then Spike B: load the Sketchfab D7100 GLB in an R3F scene with orbit controls. Plan first."

---

## Appendix — Source Links
- Eclipse timing (Snæfellsnes): [eclipse2026.is — Where to see](https://eclipse2026.is/where-to-see) · [timeanddate.com — Iceland](https://www.timeanddate.com/eclipse/in/iceland?iso=20260812)
- 3D model candidates: [Sketchfab free D7100 (euforia.agencia)](https://sketchfab.com/3d-models/camera-nikon-d7100-ca845d03fafb42daa973019abfc1a013) · [Sketchfab 3DOverstock D7100](https://sketchfab.com/3d-models/nikon-d7100-dslr-camera-d88fef80a08a4037a5e177dcb3b26f93) · [TurboSquid Nikon models](https://www.turbosquid.com/3d-model/nikon)
- Nikon D7100 Reference Manual: download from Nikon Download Center (M0 task)
- Source inputs: Shanny's concept doc (7/17) + Iceland Eclipse Trip Plan 2026 + clarifying decisions (7/17, two rounds)
