# Architecture

Static site. Classic scripts. One global `window.PL`. Each file is an IIFE:

```js
(function (PL) {
  // ...
})(window.PL = window.PL || {});
```

No ES modules, no bundler, no `fetch`. Data files are `.js` that assign to `PL.*`.

## Script order

Browser pages load core files in the order listed in `core/manifest.json` (that JSON is for tests/tools only; HTML between `<!-- core:start -->` and `<!-- core:end -->` is rewritten by `npm run sync-pages`). Then optional `<!-- shared:start -->` files, then `data/registry.js` or sim files (`strings.js`, `model.js`, `view.js`, `activity.js`, `main.js`).

Paths from a sim page (`sims/<id>/index.html`) use `../../core/...`. Paths from the catalog use `core/...`.

## Core

| File | Responsibility |
|------|----------------|
| `ns.js` | Ensure `PL` exists. |
| `property.js` | `PL.Property`, `PL.derive`, `PL.Emitter`. |
| `math.js` | `clamp`, `lerp`, `mulberry32`, `gauss`. |
| `format.js` | Persian digits, parse, unit HTML. |
| `i18n.js` | `PL.i18n.add`, `PL.t`. |
| `strings.js` | Shell `ui.*` strings. |
| `loop.js` | Fixed-timestep loop, play/pause/step/speed. |
| `draw.js` | Canvas helpers (DPR fit). |
| `widgets.js` | `PL.ui.*` two-way bound controls. |
| `dialogs.js` | About-model and confirm-reset dialogs. |
| `activity.js` | `PL.Activity` challenges and worksheet. |
| `shell.js` | `PL.Shell.start(simDef, rootEl)`. |

Domain packing lives in `shared/crystals/lattice.js` (`PL.shared.crystals`), not core.

## Property

- `.value` get/set. Setter notifies only if `Object.is` says the value changed.
- `.link(fn)` calls `fn(new, old)` immediately, then on change.
- `.lazyLink(fn)` does not call immediately.
- `.unlink(fn)`, `.reset()` (restores initial), `.dispose()`.
- `options.range: [min, max]` is a dev warning only.

`PL.derive(deps, fn)` is read-only; recomputes when any dep changes.

## Model / View / Screen

Model: `{ fixedDt?, timeBased, reset(), step(dt), ...Properties }`. Never touches `document`, `window`, `canvas`, or the DOM. Randomness via injectable `rng` (default `Math.random`).

View: `{ mount(stageEl, panelEl), layout(w, h, dpr), draw(), reset?(), dispose() }`.

Screen: `{ id, title (i18n key), icon (SVG string), createModel(), createView(model) }`.

`PL.Shell.start({ id, screens }, rootEl)` looks up metadata in `PL.registry` by `id`. If `PL.activities[id]` is defined, the top bar shows «فعالیت» and a non-modal drawer opens opposite the control panel (bottom sheet below 760 px). No focus trap. Reset All does not clear worksheet fields. Each challenge has `goal` (index into `meta.goals`; all goals covered) and optional `preset` (Reset All, then Property values). Answers are never taken from live sim state.

## Loop

- `dt = model.fixedDt || 1/60`.
- Accumulator; frame time clamped to 0.1 s; max 8 steps per frame (excess dropped).
- `speed` multiplies elapsed time (0.25, 0.5, 1, 2).
- `view.draw()` every animation frame even while paused.
- `stepOnce()` advances exactly one fixed step while paused.
- Auto-pauses when `document.hidden`.

## Constraints

- ES2017 max (no `?.`, no `??`, no class fields).
- UTF-8, LF.
- No `http://` or `https://` in source except SVG namespace `http://www.w3.org/2000/svg`.
- `file://` and static server both work.

## Catalog

`data/topics.js` defines `PL.topics`. `data/registry.js` is generated (`PL.registry` only). `index.html` renders cards from that array. Hash filter: `#molecular`, `#pressure`.

## Unported sims

None. `css/phet.css` remains only under `legacy/`.

Ported: `sims/crystalline/`, `sims/crystalline-3d/`, `sims/hydrostatic/`, `sims/u-tube/`, `sims/surface-tension/`.

`PL.Shell.start` accepts optional `fit: true` for compact one-page labs (`sim-app fit`).

## Fonts

`css/tokens.css` loads Vazirmatn from `fonts/*.woff2` (SIL OFL). Fallback: Tahoma, Segoe UI, sans-serif. No CDN.

## Tools

`node tools/new-sim.js <id>` creates `sims/<id>/` with marker blocks, `meta.js`, placeholder `thumb.svg`, `strings.js`, `model.js`, `view.js`, `activity.js`, `main.js`, `docs/sims/<id>.md`, and `tests/sims/<id>.test.js`, then runs `build-registry` and `sync-pages`.

`node tools/pack.js` writes `dist/physics-lab.zip` (deflate, no extra deps). Omits `.git`, `legacy/`, `tests/`, `tools/`, `dist/`, `css/phet.css`.
