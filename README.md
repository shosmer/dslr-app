# Ljósmynd

Offline-first PWA field companion for a Nikon D7100 — lighting analyzer, physical-camera How-Tos, Iceland scenario guides, and a dedicated Eclipse Mode for the **Aug 12, 2026** total solar eclipse on Snæfellsnes.

*Ljósmynd* is Icelandic for "photograph" — literally "light-image."

## Quick start

```bash
npm install
npm run dev        # local dev server
npm test           # analyzer engine + eclipse timeline + content integrity
npm run build      # type-check + production build + service worker
npm run preview    # serve the built PWA
```

Open on the iPhone via the LAN URL (`npm run dev -- --host`) or a Vercel preview; install via Share → Add to Home Screen.

## The map

| Where | What |
|---|---|
| `docs/PRD.md` | The contract — full spec |
| `docs/TODO.md` | External gates (3D model, API key, solar filter, verifications) |
| `design/` | Synced Ljósmynd design system; `design/ui_kits/ljosmynd/index.html` is the visual contract |
| `src/components/ds/` | The 10 design-system primitives, ported to typed TSX |
| `src/features/` | analyzer (EV/histogram/classify/recommend engine), eclipse (phase state machine + practice mode), guides, camera3d, home, presets |
| `src/data/` | Gear profiles (source of truth for every recommendation), eclipse contact tables, trip itinerary |
| `content/` | 12 scenario guides + 15 How-Tos as JSON, keyed by ids |
| `api/analyze.ts` | Vercel serverless Claude-vision proxy ("Enhance with AI"; 501 until `ANTHROPIC_API_KEY` is set) |

## Iron rules

See `CLAUDE.md`. The short version: **if it's needed on a lava field, it works in airplane mode.**
