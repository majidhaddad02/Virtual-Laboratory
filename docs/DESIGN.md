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

Fill one brief per simulation (keep it in the registry `goals` / `modelNotes` and this section when a sim is ported).

1. Learning goals (exactly 3, student-facing in Persian in the registry).
2. Model assumptions and validity range (what is idealized, SI units, when the model is wrong).
3. Controls (each bound to a Property) and what Reset All restores.
4. Screens (one apparatus = one screen unless modes are truly different experiments).
5. Representations (canvas, gauges, equation overlay) and how they stay in sync.

### Crystalline 2D brief

- Goals: see long-range order vs amorphous packing; see vibration amplitude grow with temperature; toggle bonds.
- Assumptions: 2D cartoon particles; harmonic wells; T is a 0–100 relative scale, not kelvin; positions live in the unit square.
- Controls: temperature, show bonds, regenerate amorphous, play/pause (time-based). Reset All restores T=35, bonds on, playing on, and rebuilds both lattices.
- One screen. Two side-by-side canvases (crystal / amorphous).

### Crystalline 3D brief

- Goals: see the simple-cubic unit cell; follow corner-sharing (8 x 1/8 = 1 atom/cell); compare crystal vs amorphous.
- Assumptions: cartoon 4x4x4 simple cubic; T is 0–100 relative; camera yaw/pitch is display-only.
- Controls: temperature, bonds, show cell, spin, auto-advance cell, next cell, regenerate amorphous. Reset All restores T=30, overlays on (auto off), cell index 13, camera 0.7 / -0.5.
- One screen. Three canvases: crystal, unit cell, amorphous.

### Hydrostatic brief

- Goals: equal pressure at equal depth in connected vessels; follow P = P0 + ρgh; vessel shape does not change P on the purple line.
- Assumptions: one liquid at a time (water 1000, oil 800, mercury 13600); g = 9.8; P0 = 101325 Pa; slider depth 6–78 maps to 0–0.22 m.
- Controls: depth (slider or drag the line), liquid, gauges, height overlay, equation banner. Reset All restores depth 42, water, overlays on.
- One screen. Single canvas + analog gauges.

### U-tube brief

- Goals: pick a valid equal-pressure pair in one connected liquid; write P from vertical layer thicknesses; predict the unknown height.
- Assumptions: open arms; bend is graphical; water 1000, oil 920, glycerin 1260; g = 9.8 or 10; heights in cm internally converted to m for ρgh.
- Controls: case (one/two/three liquids), guided phases, compare, g toggle, guess input. Reset All restores case 2 (دو مایع), g=9.8, phase 0, no points.
- One screen with guided phases (not separate screens).

### Surface tension brief

- Goals: see net inward force on a surface molecule; float a needle vs soap; compare capillary rise/depression vs radius.
- Assumptions: cartoon 2D; water γ=0.072 ρ=1000 θ0=10°; mercury γ=0.485 ρ=13600 θ0=140°; g=9.8; Jurin h=2γcosθ/(ρgr); soap multiplies γ by 0.4; needle L=35 mm, F=2γL.
- Controls: five screens (molecules, needle, drop, capillary, compare). Shared model so tab switches keep state. Reset All restores depth 3, cohesion 1, mass 0.25, adhesion 0.75, water, θ=10, radii mode, floating needle, zeroed columns.
- Five screens: different experiments, not one apparatus.

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
data/registry.js           PL.topics, PL.registry
sims/<id>/index.html       thin page
sims/<id>/*.js             strings, model, view, main
legacy/                    pre-port HTML for parity
```

Preview from repo root: `python3 -m http.server 8000 --bind 0.0.0.0`. Also works as `file://`.

## Physics defaults (when a sim needs them)

- SI internally; display kPa / cm as needed.
- `g = 9.8`, `P0 = 101325 Pa` unless the experiment requires classroom `g = 10`.
- Canvas `fit` with `devicePixelRatio`. `requestAnimationFrame` via `PL.Loop`.

## Hydrostatic

- One liquid at a time: water 1000, oil 800, mercury 13600 kg/m³.
- Connected tank + vessels A (wide bottom), B (cylinder), C (funnel).
- Dashed purple equal-pressure line; `P = P0 + ρgh` identical at A,B,C.

## U-tube

Teach: pick a valid equal-pressure pair, write `P = P_atm + Σρᵢghᵢ` (vertical thicknesses), solve an unknown height.

- Open arms; bend is graphical. Safe liquids: آب 1000, روغن 920, گلیسیرین 1260.
- Valid pair iff both points sit in the same connected liquid.
- Do not treat any same-height pair as equal pressure.
- Do not use path length along the bend as `h`.
- Do not make ΔP = ρgΔh the primary lesson (that is hydrostatic).
- U-tube is its own catalog card, not a tab on hydrostatic.

## Surface tension / crystals (notes)

- Capillary: water climbs (concave), mercury depresses (convex).
- Crystals: ordered lattice vs amorphous; 3D unit cell. Cartoon 2D, not photoreal.

## Anti-patterns

- Long instructional paragraphs on the stage.
- RTL formulas without `.formula`.
- Putting U-tube back as a tab on hydrostatic.
- Treating any same-height pair as equal pressure.
- Using path length along the U-bend as height.
- Recreating yellow-panel CSS in every HTML file.
- `topics/` as the primary entry.
- Bundlers, modules, CDN, `fetch` of local JSON, PhET code/assets, the word PhET in UI or identifiers.
