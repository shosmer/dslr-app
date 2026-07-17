# Ljósmynd Design System

A dark-first, field-ready design system for **Ljósmynd** — an offline-capable Progressive Web App that acts as a photography companion for a Nikon D7100, built for a two-week Iceland trip culminating in the Aug 12 2026 total solar eclipse.

> **Source:** synced from the Claude Design project (`47953cc0-491d-47ce-89d6-99405b01b7fe`), which was derived from `docs/PRD.md` (PRD v1.0, owner Shannon "Shanny" Hosmer). This local copy is the fidelity reference for the production port in `src/`. The full project also contains `guidelines/` specimen cards and per-component `.prompt.md` docs not mirrored here.

## The design problem
Every choice serves shooting in the field: bright overcast glare, cold gloved hands, spotty signal on a lava field, and a hard two-minute eclipse window with zero margin for fumbling. So the system is **dark-first, high-contrast, large-type, big-target, offline-honest**.

## Content fundamentals
- **Voice:** direct, confident, zero fluff. Recipe-first — settings before theory. ("Meter for the highlights, then dial −0.7 EV.")
- **Person:** second-person imperative to the shooter. No marketing "we".
- **Casing:** Title case for screen/card titles; UPPERCASE mono for eyebrows, labels, badges, safety cues ("FILTER ON NOW", "TOTALITY · C2").
- **Numbers are content:** exposure values are first-class and always mono — `f/8 · 1/1000s · ISO 200`.
- **Tone in safety copy:** blunt and unambiguous — eye safety is never hedged.
- **Emoji:** none. This is a premium instrument, not a consumer toy.
- **Length:** short. A "why" is one sentence. A pitfall is one sentence.

## Visual foundations
- **Mood:** premium camera-brand companion. Warm near-black canvas, one confident corona-amber accent, Iceland teal as a quiet second voice.
- **Color:** dark ramp in `oklch` — warm near-blacks (`--ink-1000…750`), warm off-white text (never pure `#fff`). Accent = corona amber (`--accent`); secondary = Iceland teal (`--accent-2`). Semantics: `--safe` (look now), `--warn` (get ready), `--danger` (filter on / eye safety). See `tokens/colors.css`.
- **Type:** Space Grotesk (display), Inter (UI), IBM Plex Mono (all camera data, labels, countdowns). Nothing critical below 13px. See `tokens/typography.css`.
- **Spacing:** 4px grid; `--touch-min: 44px`, `--touch-lg: 56px`, `--tabbar-h: 64px`. `tokens/spacing.css`.
- **Radius:** `--radius-md: 14px` default, `--radius-lg: 20px` for cards/sheets, pills for controls/badges. `tokens/radius.css`.
- **Elevation:** deep diffuse shadows; the signature move is the **corona glow** (`--glow-amber`) on the single primary action / featured card, never everywhere. `tokens/effects.css`.
- **Backgrounds:** flat warm-black surfaces; translucent blurred bars via `--blur-scrim`. Imagery shown as striped placeholders with mono captions until real assets exist.
- **Motion:** 120–200ms, `--ease-out`. Number-roll on countdowns, press = scale 0.97. Motion signals state, never decorates.
- **Anti-tropes:** no purple gradients, no emoji, no colored-left-border cards.

## Iconography
- **Lucide** (outline, ~2px stroke). Production uses `lucide-react` (self-hosted, offline). Unicode/emoji are **not** icons.

## Index
- `styles.css` — global entry point; `@import`s all tokens.
- `tokens/` — `fonts.css` (CDN in DS; production self-hosts via @fontsource), `colors.css`, `typography.css`, `spacing.css`, `radius.css`, `effects.css`.
- `components/` — canonical primitive sources: `actions/` (Button, IconButton), `display/` (Badge, Card, RecipeTable), `navigation/` (TabBar, SegmentedControl), `eclipse/` (Countdown, SafetyBanner, ChecklistItem). Navigation + eclipse sources live inline in `ui_kits/ljosmynd/index.html` (kept in sync by the DS).
- `ui_kits/ljosmynd/index.html` — **the visual contract**: interactive phone mockup wiring all five tabs. Open in a browser (needs network for React/Babel/Lucide CDNs).

## Caveats
- **Fonts** load from Google Fonts CDN here; production self-hosts (woff2 via @fontsource).
- **No logo** exists; the brand is the Space Grotesk wordmark "Ljósmynd". Do not invent a mark.
