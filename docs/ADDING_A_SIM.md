# Adding a simulation

`sims/crystalline/` is the reference implementation. Never read or copy `legacy/`.

1. Write `docs/sims/<id>.md` from the template in `docs/DESIGN.md`.
2. Create `sims/<id>/meta.js` and `sims/<id>/thumb.svg`.
3. Create `sims/<id>/strings.js` with keys `sim.<id>.<name>`.
4. Create `sims/<id>/model.js` and `tests/sims/<id>.test.js` with real invariants.
5. Create `sims/<id>/view.js`. Unlink every `.link` / `.lazyLink` in `dispose` (or use a widget that unlinks).
6. Create `sims/<id>/main.js` calling `PL.Shell.start`.
7. Create `sims/<id>/index.html` with three marker blocks: `<!-- core:start -->` … `<!-- core:end -->`, `<!-- shared:start -->` … `<!-- shared:end -->`, `<!-- sim:start -->` … `<!-- sim:end -->`.
8. Run `npm run build-registry`, `npm run sync-pages`, `npm test`.
9. Manual checklist: open as `file://`; Reset All; widths 360 px and 1920 px; keyboard; Persian digits; formulas/units LTR.

`node tools/new-sim.js <id>` scaffolds steps 1–7 (placeholder thumb, test skeleton, markers) and runs both generators.

## Common mistakes

- Script order: core, then shared, then `strings.js`.
- Ids with hyphens need bracket form: `PL.sims['u-tube']`.
- DOM in a model.
- `Math.random` without injectable `rng`.
- `?.` / `??`.
- Missing `unlink`.
- Hash filters: letters, digits, hyphen only.
- Forgetting to regenerate registry/pages.
