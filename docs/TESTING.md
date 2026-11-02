# Testing

Zero npm dependencies. Node >= 18 built-ins only (`node:test`, `assert`, `vm`, `fs`, `path`).

```
node --test tests/*.test.js tests/sims/*.test.js
```

(`node --test tests/` is not used: this Node treats a directory argument as a module path.)

If Node is missing, skip running tests; do not install packages.

## Loader

`tests/helpers/load.js` reads `core/manifest.json` and loads those files (then optional extra files) into a `vm` context whose global is `window`. Crystal tests also load `shared/crystals/lattice.js`.

## Minimum suites

- `tests/property.test.js` — link immediate; lazyLink not; no notify if unchanged; reset; derive.
- `tests/format.test.js` — `num(1.5,1)=="۱٫۵"`, `num(-2,0)=="−۲"`, `parseNum("۱٫۵")==1.5`.
- `tests/i18n.test.js` — interpolation; missing key `⟦key⟧`.
- `tests/loop.test.js` — 60 frames of 16.667 ms at speed 1 ~ 60 steps; paused 0; stepOnce 1; speed 2 ~ double; 2 s frame clamped.
- `tests/dialogs.test.js` — `nextFocusIndex` wrap; `shouldClose` Escape.
- `tests/registry.test.js` — unique ids; required fields; topics exist; path files exist; thumbnail starts with `<svg`; goals non-empty; committed file matches `tools/build-registry.js`.
- `tests/pages.test.js` — core / shared / sim markers; core tags in manifest order; shared after core and before `strings.js`; local files exist; no `type="module"`; no forbidden URLs. Failure message: `run npm run sync-pages`.
- `tests/api-docs.test.js` — every key of `PL.ui`, `PL.dialogs`, `PL.format`, `PL.shared.crystals` appears in `docs/API.md`.
- `tests/sims/crystalline.test.js` — 2D invariants (equal site counts; amorphous min distance vs measured floor; T=0 displacement 0; rms ~ sqrt(T) with seeded rng).
- `tests/sims/crystalline-3d.test.js` — 8 corners; 1 atom/cell; bulk coordination 6; 27-cell cycle.
- `tests/sims/hydrostatic.test.js` — gauge pressure ∝ depth; ∝ rho; P(0)=P0.
- `tests/sims/u-tube.test.js` — equal P in connected fluid at several y; g scales P not heights; Σρgh equal at join; volume conserved; density relations; unknown height from equation at y=0 and another level; reject different liquids.
- `tests/sims/u-tube-settle.test.js` — analytic equilibrium; idle never settles; conserve water/top; pour direction; head decays; equal pour; TOP_MAX clamp; locks after first pour; kerosene Δh; predictionCorrect; reset; pendingArm; deterministic.
- `tests/sims/surface-tension.test.js` — surface net inward vs bulk ~0; Jurin 1/r and mercury depression; soap sink; adhesion↔θ; Reset All.
- `tests/sims/barometer.test.js` — ISA/units reference numbers; hV independent of radius; tilt/critical angle; force balance; steps sequence and prediction; free-lab altitude/tilt; activity coverage; smoke draw.
- `tests/activity.test.js` — pure `isCorrect` / `checkAnswer` / `validate` (1–5) / `coverGoals` / `applyPreset`; every activity covers `meta.goals`; every `preset` key is a Property on that sim's model.
- `tests/smoke.test.js` — each ported view `draw()` with a Proxy stub 2D context.
- `tests/pack.test.js` — pack file list omits `legacy/` `tests/` `tools/`; zip is unzip-readable.

Violated invariants are `test.todo` plus a row in `docs/ISSUES.md`. Do not “fix physics” during a port.
