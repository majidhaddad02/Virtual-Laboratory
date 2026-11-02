# Issues

Logged during ports. Do not fix during a port except crashes. Each later fix needs a test.

## Branding

- TODO: consider a distinct brand before any public release. Current logo and purple/yellow chrome stay as-is until then.

## Catalog / shell (Phase A)

- `css/phet.css` is unused by live pages (only `legacy/`). Identifiers there still include the old `phet` prefix. Dual CSS can be deleted in a later cleanup.

## Crystalline 2D (port)

- Temperature T is a 0–100 relative slider, not kelvin. Vibration rms uses `RMS_MAX * sqrt(T/100)`. At T=0 the noise term is 0 but existing displacements are not forced to 0 until reset (legacy same). Reset All now rebuilds both lattices and zeroes displacements.
- Amorphous packing is stochastic dart-throw + repulsion; minimum distance is targeted (`0.66 * D` during placement, `0.88 * D` during relaxation) but not a hard invariant after vibration.
- Pause icon lives in the shell bottom bar (time-based model) rather than only in the yellow panel. Panel still has regenerate. Visual difference from legacy: extra bottom chrome (Reset All, play/pause/step/speed).
- Legacy had no “درباره‌ی مدل” or Reset All confirm. Added by shell spec.

## Crystalline 3D (port)

- Pause lives in the shell bottom bar, not the yellow panel (legacy had a panel pause). Spin and auto-cell still run in `view.draw` even while paused, matching legacy.
- Camera angles are view state; Reset All now also resets yaw/pitch (legacy had no Reset All for the camera).
- Auto-advance uses `performance.now` in the view, not model time.

## Hydrostatic (port)

- Legacy reset restored only depth and water; checkboxes stayed. Reset All now restores gauges/height/equation too (shell contract).
- Liquid picker is three colored buttons (legacy look), not a radio list.
- Wave animation uses `performance.now` in the view; not physics.
- Readouts still use Latin `toFixed` on the analog dials (legacy same). Persian digits are on the slider value only.

## U-tube (port)

- Guided phases stay in one screen (not three screens).
- Reset All restores case index 1 (دو مایع) via `caseIndex.reset()`, which reloads layers. Legacy reset was the orange button calling `loadCase()` without changing g; shell Reset All also restores g=9.8.
- Caliper / hover height are view state; Reset All clears them via `view.reset`.
- Compare button still forces both points on (legacy same), even if the student had not clicked both arms.
- Dial / layer labels still use Latin `toFixed` on canvas (legacy same); the readout uses Persian digits.
- Extra shell chrome (about, Reset All confirm). Compact `fit` class is applied.

## Surface tension (port)

- Five shell screens (bottom tabs) replace the old top `sim-tabs`. Extra chrome: about, Reset All confirm. No play bar (`timeBased: false`).
- One shared model across screens so needle/capillary/drop state survives tab switches (legacy same).
- Reset All restores every Property and needle/column animation; legacy orange buttons only reset the active tab's animation.
- Needle sink and capillary height easing mutate view/model in `draw()` (legacy same, driven by rAF).
- Canvas labels still Latin `mm` / `toFixed` (legacy same). Slider heads now show Persian digits.
- Compare screen uses `.compare` grid; hydrophilic badge color is still an inline style (legacy same).
- Depth slider is a numeric widget (0–3) plus a caption; legacy was range + caption only.

## Not ported yet

- (none)

## Fix-up pass (items 1–17)

### Amorphous packing threshold

Measured `amorphSites` + `minDistance` over seeds 1–20 (mulberry32): minD in [0.080985598369851, 0.08346923565931895], mean ≈ 0.08248. Placement target `MIN_PLACE = 0.66 * D ≈ 0.06286`; relax target `0.88 * D ≈ 0.08381`. The old test used `MIN_PLACE * 0.5 ≈ 0.031` which every run cleared by a large margin. The test now fails if any of those 20 seeds drops below `0.90 * measured min` (0.0728870385328659). Vibration can still push sites closer; the floor is post-relaxation packing only.

### Listener hygiene

- `core/shell.js`: `model.playing.link` ran again on every screen switch and was never removed. Now linked once per model (`playLinks[idx]`) and unlinked in `dispose`.
- `sims/crystalline/view.js`: `model.temperature.link` for the temperature bar had no unlink. Named `onTemp` and unlinked in `dispose`.
- `sims/crystalline-3d/view.js`: same temperature-bar leak; unlinked in `dispose` (same class of bug as crystalline 2D).
- `sims/u-tube/view.js`: six `lazyLink(syncPanel)` calls had no unlink. Tracked and unlinked in `dispose`.
- Already paired (unchanged): `core/widgets.js` (all `link` have dispose unlink); `sims/hydrostatic/view.js` `model.rho.link(syncLiq)`; `sims/surface-tension/view.js` capMode/liquid link and lazyLink. Model-lifetime links (`u-tube` `caseIndex.lazyLink(applyCase)`, `crystalline-3d` `cellIndex.lazyLink`) stay for the model lifetime.

### U-tube equation vs reference level

Fixed in Phase E: `equationTerms` tags the unknown by `(arm, index)` the same way `solveUnknown` does. The equation step now always shows `؟` for that layer at any valid reference. A model test checks exactly one unknown term at y=0 and another level inside the connecting liquid.

## Phase E (activity)

- Activity answers are not stored (by design). Worksheet fields live in the drawer DOM; closing with Escape hides the drawer without wiping them. Reset All does not touch them.
- Drawer is non-modal, opposite the control panel (panel is inline-end / left in RTL; drawer is inline-start / right). Below 760 px it becomes a bottom sheet and may cover part of the stage.
- «تنظیم آزمایش» resets then applies `preset`. Answers are never auto-graded from live sim state.
- Print CSS hides everything except `.pl-worksheet`. Browser print dialogs still depend on the user agent.
- Surface-tension Jurin overestimate at r = 2 mm is stated in `docs/sims/surface-tension.md`; the capillary challenge uses the 1/r trend, not a numeric height.
- No physics claim was dropped for lack of certainty.

## Phase F (docs, pack, fonts)

- Vazirmatn woff2 is local under `fonts/`. Browsers without woff2 fall back to Tahoma.
- `fonts/OFL.txt` is the SIL license text and contains SIL/GitHub URLs required by that license; runtime pages do not load it.
- `npm run pack` writes `dist/physics-lab.zip` (gitignored). Unzip and open `index.html` as `file://`.
- `css/phet.css` stays in the repo for `legacy/` parity and is omitted from the zip.

### Oil density naming

Hydrostatic oil is 800 kg/m³; u-tube oil is 920. Kept both densities. Smaller UI change: hydrostatic string `sim.hydrostatic.oil` is now «روغن سبک»; u-tube stays «روغن».
