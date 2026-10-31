# Testing

Zero npm dependencies. Node >= 18 built-ins only (`node:test`, `assert`, `vm`, `fs`, `path`).

```
node --test tests/*.test.js tests/sims/*.test.js
```

(`node --test tests/` is not used: this Node treats a directory argument as a module path.)

If Node is missing, skip running tests; do not install packages.

## Loader

`tests/helpers/load.js` reads `core/manifest.json` and loads those files (then optional extra files) into a `vm` context whose global is `window`.

## Minimum suites

- `tests/property.test.js` — link immediate; lazyLink not; no notify if unchanged; reset; derive.
- `tests/format.test.js` — `num(1.5,1)=="۱٫۵"`, `num(-2,0)=="−۲"`, `parseNum("۱٫۵")==1.5`.
- `tests/i18n.test.js` — interpolation; missing key `⟦key⟧`.
- `tests/loop.test.js` — 60 frames of 16.667 ms at speed 1 ~ 60 steps; paused 0; stepOnce 1; speed 2 ~ double; 2 s frame clamped.
- `tests/registry.test.js` — unique ids; required fields; topics exist; path files exist; thumbnail starts with `<svg`; goals non-empty.
- `tests/pages.test.js` — every `sims/*/index.html` has core tags in manifest order; local files exist; no `type="module"`; no forbidden URLs.
- `tests/sims/crystalline.test.js` — 2D invariants (equal site counts; amorphous min distance; T=0 displacement 0; rms ~ sqrt(T) with seeded rng).
- `tests/sims/crystalline-3d.test.js` — 8 corners; 1 atom/cell; bulk coordination 6; 27-cell cycle.
- `tests/sims/hydrostatic.test.js` — P = P0 + ρgh; same P at A/B/C; density/depth dependence.
- `tests/sims/u-tube.test.js` — equal P in connected fluid; Σρgh equal at join; volume conserved; density relations; unknown height from equation; reject different liquids.
- `tests/sims/surface-tension.test.js` — surface net inward vs bulk ~0; Jurin 1/r and mercury depression; soap sink; adhesion↔θ; Reset All.
- `tests/smoke.test.js` — each ported view `draw()` with a Proxy stub 2D context.

Violated invariants are `test.todo` plus a row in `docs/ISSUES.md`. Do not “fix physics” during a port.
