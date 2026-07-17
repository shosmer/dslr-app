# Ljósmynd — DSLR field companion PWA (personal project)

## What this is
Offline-first PWA companion for a Nikon D7100. Full spec: docs/PRD.md — it is the contract.
Hard deadline: feature-complete Jul 29, frozen Jul 31, in-field (Iceland) Aug 1–13.

## Stack
React 18 + Vite + TypeScript + Tailwind + React Three Fiber. Zustand + idb-keyval.
vite-plugin-pwa (Workbox). Vercel hosting; api/analyze.ts serverless (Anthropic vision proxy).

## Design system
`design/` holds the synced Ljósmynd design system (tokens, component sources, ui_kits mockup)
from the Claude Design project. `design/ui_kits/ljosmynd/index.html` is the visual contract —
open it in a browser for side-by-side checks. Tokens are consumed verbatim from
`src/styles/tokens/*.css`; ported primitives live in `src/components/ds/`.

## Iron rules
1. OFFLINE-FIRST: every P0 feature must work in airplane mode. If a change adds a network
   dependency to Analyzer, Guides, Camera, or Eclipse, it's wrong.
2. Gear data is the source of truth: recommendations must respect src/data/gear/*.json
   limits (aperture ranges, ISO 100–6400, shutter 30s–1/8000). Never hardcode gear facts.
3. Content is data: hotspots/how-tos/guides live in content/ + JSON, keyed by ids —
   renderers stay dumb.
4. iOS Safari is the target device. File-input capture is the baseline camera path.
5. Keep the offline bundle ≤30MB including the 3D model.
6. Shanny reviews all content (guides, eclipse recipes) before it's marked done.

## Definition of done
The acceptance-criteria checklist in the relevant PRD section passes on the real iPhone,
offline, via a Vercel preview build.
