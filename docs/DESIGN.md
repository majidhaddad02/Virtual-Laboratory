# Design

Interactive Persian physics lab. Architecture and interaction follow common lab-sim patterns (separate Model and View, screens, properties, one Reset All). Docs may mention PhET; UI strings and code identifiers must not.

## Principles

- Minimal on-screen text. Teach with the picture, arrows, sliders, gauges.
- Direct manipulation (drag, click, sliders) with immediate feedback.
- Linked representations: the same state drives canvas, readouts, and controls.
- One Reset All restores every Property and internal model state, and updates widgets.
- Consistent colors across sims (see tokens). Max about 5 controls per screen.
- Readouts include units. Formulas use `.formula` (LTR isolate). Latin symbols and units use `.ltr`.
- UI is Persian RTL. Identifiers, comments, and docs are English.
- Catalog cards, not nested tabs, as the primary navigation.
- Do not redesign visuals when porting. Behavior parity first.

## Sim brief template

Fill one brief per simulation in `docs/sims/<id>.md` (and keep `goals` / `modelNotes` in `sims/<id>/meta.js`).

1. Learning goals (exactly 3, student-facing in Persian in the registry).
2. Model assumptions and validity range (what is idealized, SI units, when the model is wrong).
3. Controls (each bound to a Property) and what Reset All restores.
4. Screens (one apparatus = one screen unless modes are truly different experiments).
5. Representations (canvas, gauges, equation overlay) and how they stay in sync.

Ported briefs: `docs/sims/crystalline.md`, `docs/sims/crystalline-3d.md`, `docs/sims/hydrostatic.md`, `docs/sims/u-tube.md`, `docs/sims/surface-tension.md`.

## Catalog

- One card per sim on `index.html`, rendered from `PL.registry` (no hand-written counts or duplicated thumbnails).
- Filters: `all` / topic ids. Hash `#molecular`, `#pressure` (letters, digits, hyphen only).
- Thumbnail: inline SVG, cartoon, no photo.
- Topics: `molecular` (نیروی مولکولی), `pressure` (فشار).
- `topics/` pages are redirect stubs to `index.html#<topicId>`, not the main nav.

## Visual language

- Purple `#521764`, yellow panel `#f5d547`, green `#58a73b`, header white.
- Stage `.sim-stage` (default sky/table), `.lab`, or `.dark`.
- Right panel `.sim-panel` with yellow `.box` controls, round reset `.ico-btn.reset`.
- Fluid picker: `.fluid-list` / `.fluid-btn`. Amount: `.num-row`. Pour: `.pour-row`.
- Equation overlay: `.eq-banner` + `.formula`.
- Shared CSS lives in `css/tokens.css`, `css/shell.css`, `css/catalog.css`. Sim `<style>` only for one-off rules.

## Layout (runtime)

```
index.html                 catalog from PL.registry
css/tokens.css             :root tokens
css/shell.css              sim chrome + widgets
css/catalog.css            catalog page
core/*.js                  window.PL (IIFE, classic scripts)
data/topics.js             PL.topics
data/registry.js           PL.registry (generated)
shared/<topic>/*.js        domain helpers (PL.shared.<topic>)
sims/<id>/index.html       thin page
sims/<id>/*.js             strings, model, view, main, meta
legacy/                    pre-port HTML for parity
```

`fonts/` Vazirmatn woff2 (local; SIL OFL). Preview from repo root: `python3 -m http.server 8000 --bind 0.0.0.0`. Also works as `file://`. Offline zip: `npm run pack` → `dist/physics-lab.zip`.

## Physics defaults (when a sim needs them)

- SI internally; display kPa / cm as needed.
- `g = 9.8`, `P0 = 101325 Pa` unless the experiment requires classroom `g = 10`.
- Canvas `fit` with `devicePixelRatio`. `requestAnimationFrame` via `PL.Loop`.

## Anti-patterns

- Long instructional paragraphs on the stage.
- RTL formulas without `.formula`.
- Putting U-tube back as a tab on hydrostatic.
- Treating any same-height pair as equal pressure.
- Using path length along the U-bend as height.
- Recreating yellow-panel CSS in every HTML file.
- `topics/` as the primary entry.
- Bundlers, modules, CDN, `fetch` of local JSON, PhET code/assets, the word PhET in UI or identifiers.
