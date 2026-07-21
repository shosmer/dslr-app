# Changelog

Every change from the original starting point — **PRD v1.0** (`docs/PRD.md`) and the **Ljósmynd design system** (synced to `design/`). The PRD and design system are the baseline; this file records what was built, added, corrected, or deviated from them.

Newest first. Dates are when the work happened.

---

## Baseline (the starting point)

- **PRD v1.0** — `docs/PRD.md`. The contract: features F1–F6, gear profiles, eclipse data, offline-first rules, tech stack (React + Vite + TS + Tailwind + R3F, Zustand + idb-keyval, vite-plugin-pwa, Vercel).
- **Design system** — `design/`: oklch dark-first tokens, 10 primitives (Button, IconButton, Badge, Card, RecipeTable, TabBar, SegmentedControl, Countdown, SafetyBanner, ChecklistItem), and `design/ui_kits/ljosmynd/index.html` (the five-screen visual contract).
- **Native-feel directive (added by Shanny, ongoing):** the PWA must look and feel as native-iOS as possible. Judge UI against native apps; don't change the design system's *visual identity* (color/tone/type) without sign-off, but geometry/layout fixes proceed directly.

---

## 2026-07-21 — Settings screen + Presets relocation (IA rework)

Split the conflated gear-icon-opens-presets into two honest things.

- **New Settings screen** (gear icon on Home). Four sections, each wired to real behavior:
  - **Camera & lenses** — D7100 (fixed) + a toggle per lens ("in the bag"). Drives the Analyze lens picker and which profiles the recommender uses.
  - **Trip** — destination selector (Iceland 2026 / Everyday). Iceland shows the Iceland guide pack + the Home trip card; Everyday hides both.
  - **Eclipse** — on/off toggle (hides the Eclipse tab AND the Home countdown hero when off) + viewing-spot selector.
  - **Backup** — export/import presets JSON (moved here from the old Presets screen).
- **Presets → bottom sheet on Analyze** (bookmark icon in the Analyze header). Saved recipes open as a native slide-up sheet with notes + delete, without leaving Analyze. Replaces the standalone `/presets` screen/route.
- **New DS pieces:** `Toggle` (iOS-style switch) and a reusable `BottomSheet` (scrim, slide-up, rubber-band guard).
- **Home:** removed the eclipse-prep checklist card; the "download everything" button was already replaced by the passive offline-readiness line (green "Ready offline" / amber "Connect once to finish caching") — the button downloaded nothing (app self-precaches on install).
- **Store:** added `bodyId`, `activeLensIds`, `destinationId`, `eclipseEnabled` (+ setters); route guard redirects `/eclipse` → Home when eclipse is off.
- **Files:** `src/app/store.ts`, `src/app/App.tsx`, `src/app/TabShell.tsx`, `src/features/settings/`, `src/features/presets/PresetsSheet.tsx`, `src/components/ds/Toggle.tsx`, `src/components/BottomSheet.tsx`, `src/features/home/`, `src/features/analyzer/`, `src/features/guides/`.

## 2026-07-21 — Nav bar: no rubber-band on swipe-down

Non-passive `touchmove` preventDefault + `touch-action: none` on the tab bar so a swipe starting on it can't drag the page. Taps unaffected.

## 2026-07-21 — Native iOS tab-bar geometry (long debugging arc)

The tab bar not sitting flush at the bottom in the installed (home-screen) app took a long diagnosis. Summary of the journey and the resolution:

- **Root cause found (via on-device markers):** on iOS, a standalone PWA with `apple-mobile-web-app-status-bar-style: black-translucent` extends under the status bar (top) but is *fenced out of the bottom ~62pt* of the screen, and reports `env(safe-area-inset-bottom) = 0`. A lime/magenta viewport-edge marker proved web content cannot reach the physical bottom — it's an OS limit, not a CSS bug.
- **Fix:** switched `apple-mobile-web-app-status-bar-style` → `default`. iOS now insets the webview above the home indicator and reports `SAB ≈ 34` correctly.
- **Then removed the nav bar's `env(safe-area-inset-bottom)` padding** — with the webview inset above the home indicator, that padding was dead space pushing the bar up. Bar now sits flush at the webview bottom.
- **Tab-bar row height 64px → 50px** to match native iOS (~49pt) — `--tabbar-h` in `src/styles/spacing.css`.
- **Dead ends reverted along the way (recorded for honesty):** a `display: fullscreen` manifest attempt (zeroed safe-area insets, made it worse); a `position: fixed` body lock to stop rubber-band scrolling (zeroed safe-area insets); a solid/color-matched "ESPN-style" tab bar (changed DS visual identity without sign-off — reverted at Shanny's request). All removed.
- **Rubber-band pull-down** on the fixed nav: addressed with `overscroll-behavior` on the document + contained scroll area (after the body-lock approach was reverted for breaking safe areas).
- **Files:** `index.html`, `src/components/ds/TabBar.tsx`, `src/app/TabShell.tsx`, `src/styles/spacing.css`, `src/styles/index.css`, `vite.config.ts`.

## 2026-07-21 — Performance & tooling

- **Isolated the 1s countdown re-render.** Home re-rendered its whole tree every second for the hero countdown; extracted `LiveCountdown` (`src/components/LiveCountdown.tsx`) so only the clock ticks. Home now ticks once/min for the trip card. (Applied `vercel-react-best-practices` skill.)
- **Added `vercel-react-best-practices` skill** to the repo tooling.
- **Native-feel goal saved to Claude Code memory** so it persists across sessions.

## 2026-07-19–20 — Native shell & PWA update mechanism

- **Sticky blurred screen headers** on all nine screens (pin like native nav bars, extend under the status bar) — `.screen-header` in `src/styles/index.css`; headers converted across `src/features/**`.
- **Fixed app frame** (`position: fixed` shell) so only the content area scrolls.
- **Service worker: `registerType` `prompt` → `autoUpdate`** + foreground update checks + a visible **build stamp** on Home. The original prompt mode left new versions "waiting" forever on iOS standalone, so device updates never applied. (`vite.config.ts`, `src/main.tsx`.)
- **On-device viewport diagnostics** line on Home (temporary; `src/lib/viewport.ts`) — used to diagnose the tab-bar issue. *To be stripped before the trip.*

## 2026-07-18 — Device-test feedback (first real iPhone run)

- **EXIF-less captures handled.** iOS in-app camera captures arrive with no exposure EXIF, leaving the analyzer blind (a backlit kitchen read as "flat, even light"). Added: an **"Import from library"** path that preserves EXIF, and **one-tap light-level chips** (Bright sun … Very dim) to anchor EV manually when EXIF is missing. (`src/features/analyzer/`.)
- **Classifier gap fixed:** a bright light source in a dark surround (window in a dim room) now classifies as high-contrast, not flat. New test.
- **Analyzer "Save as preset" dedupe** — button disables after saving (device test showed duplicate presets).

## 2026-07-17 — Initial build (Phases 0–6) + deploy fixes

This is the bulk of the app, built against the PRD and design system in one day.

**Additions beyond the raw PRD/DS (the DS defined tokens + 10 primitives + screen mockups; these are the working implementations and content):**

- **Full app implementation:** React Router tab shell + all five screens wired to real data (Home, Camera/How-Tos, Analyze, Guides, Eclipse), plus Presets and How-To detail screens. DS primitives ported from `design/` JSX to typed `src/components/ds/*.tsx`.
- **Analyzer engine** (`src/features/analyzer/engine/`): EXIF→EV math, histogram/spatial stats, rule-based scene classifier, gear-clamped recommender. Vitest suite.
- **Eclipse logic** (`src/features/eclipse/`): per-spot contact tables, phase state machine driving safety banners, wake lock, compressed 5-minute practice mode.
- **Content authored** (not in PRD, which only specified the list): 12 scenario guides + 15 How-Tos as JSON in `content/`, keyed by ids. *Flagged for Shanny's review against the official D7100 manual.*
- **Data:** gear profiles, `iceland-2026.json` trip itinerary (draft), `snaefellsnes.json` eclipse data. *Non-Hellissandur eclipse contact times are interpolated estimates (`verified: false`) — cross-check before the trip.*
- **AI proxy** `api/analyze.ts` (Vercel serverless Claude-vision) + client enhance flow; degrades to local-only when offline or unconfigured.
- **PWA:** self-hosted fonts (replaced the DS's CDN font import), manifest, icons, offline precache.

**Corrections to the PRD/concept:**

- Gear corrected per PRD §5: telephoto is the **55-200mm f/4-5.6G ED** (concept doc's "f/1.4-5.6G" typo), body is the **D7100** (not "7D7100").

**Deploy/infra fixes (7/17):**

- **TypeScript pinned to 5.x** — Vercel's function builder crashes on TS 7's new API.
- **`api/analyze` export** switched to method-named web handler (`export async function POST`) — Vercel invoked the default export Node-style and never sent the `Response` (504).
- **AI enhance** response shape hardened: enforce array types in the vision prompt, normalize the client response, surface parse errors.
- Pushed to `github.com/shosmer/dslr-app` (private); deployed to `dslr-app.vercel.app`.

---

## Still open (from PRD / not yet done)

- **F1 3D camera model** — gated on model sourcing (evaluated candidates 7/20; free Sketchfab model fails control fidelity, paid 3DOverstock is the fallback; scanning the real D7100 discussed). Camera tab ships the designed placeholder + How-To library.
- **F5 Learning Hub** (exposure-triangle interactive, primers, glossary) — not built.
- **Native-motion polish** (screen transitions, swipe-back, number-roll countdown) — identified in design critique, not built.
- **Content review** against the official D7100 manual; **eclipse contact-time verification**; **EV calibration** — all flagged in `docs/TODO.md`.
- **Strip the temporary viewport debug line** before the trip.
