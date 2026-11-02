# Adding a simulation

`sims/crystalline/` is the reference implementation. Never read or copy `legacy/`.

1. Write `docs/sims/<id>.md` from the template in `docs/DESIGN.md`.
2. Create `sims/<id>/meta.js` and `sims/<id>/thumb.svg`.
3. Create `sims/<id>/strings.js` with keys `sim.<id>.<name>`.
4. Create `sims/<id>/model.js` and `tests/sims/<id>.test.js` with real invariants.
5. Create `sims/<id>/view.js`. Unlink every `.link` / `.lazyLink` in `dispose` (or use a widget that unlinks).
6. Create `sims/<id>/main.js` calling `PL.Shell.start`.
7. Create `sims/<id>/activity.js` assigning `PL.activities['<id>']` with 1–5 challenges. Each has `goal` (index into `meta.goals`); every goal is covered. Optional `preset` maps Property names to values («تنظیم آزمایش» = Reset All then those values). Do not auto-grade from sim state. Omit a claim rather than guess; log it in `docs/ISSUES.md`.
8. Create `sims/<id>/index.html` with three marker blocks: `<!-- core:start -->` … `<!-- core:end -->`, `<!-- shared:start -->` … `<!-- shared:end -->`, `<!-- sim:start -->` … `<!-- sim:end -->` (include `activity.js` before `main.js`).
9. Run `npm run build-registry`, `npm run sync-pages`, `npm test`. After a release pass, `npm run pack`.
10. Manual checklist: open as `file://`; Reset All; widths 360 px and 1920 px; keyboard; Persian digits; formulas/units LTR; فعالیت drawer opposite the panel; Escape closes it; worksheet survives Reset All.

`node tools/new-sim.js <id>` scaffolds steps 1–8 (placeholder thumb, activity skeleton, test skeleton, markers) and runs both generators.

## Common mistakes

- Script order: core, then shared, then `strings.js`.
- Ids with hyphens need bracket form: `PL.sims['u-tube']`.
- DOM in a model.
- `Math.random` without injectable `rng`.
- `?.` / `??`.
- Missing `unlink`.
- Hash filters: letters, digits, hyphen only.
- Forgetting to regenerate registry/pages.
- Missing `activity.js` in the sim block, or loading it after `main.js`.
