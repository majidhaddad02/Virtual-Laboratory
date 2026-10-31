# Issues

Logged during ports. Do not fix during a port except crashes. Each later fix needs a test.

## Branding

- TODO: consider a distinct brand before any public release. Current logo and purple/yellow chrome stay as-is until then.

## Catalog / shell (Phase A)

- `css/phet.css` is unused by live pages (only `legacy/`). Identifiers there still include the old `phet` prefix. Dual CSS can be deleted in a later cleanup.

## Crystalline 2D (port)

- Temperature T is a 0–100 relative slider, not kelvin. Vibration rms uses `RMS_MAX * sqrt(T/100)`. At T=0 the noise term is 0 but existing displacements are not forced to 0 until reset (legacy same). Reset All now rebuilds both lattices and zeroes displacements.
- Amorphous packing is stochastic dart-throw + repulsion; minimum distance is targeted (`0.66 * D` during placement, `0.88 * D` during relaxation) but not a hard invariant after vibration. Tests use a documented placement threshold.
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
