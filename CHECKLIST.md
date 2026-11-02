# Manual checklist

Run after `npm test`, `node tools/build-registry.js --check`, and `node tools/sync-pages.js --check`.

## Catalog

- [ ] `index.html` as `file://` shows five cards from `PL.registry`
- [ ] Hash `#molecular` and `#pressure` filter cards
- [ ] Thumbnails are inline SVG, not photos
- [ ] Vazirmatn loads from `fonts/` (Tahoma fallback if the browser has no woff2)

## Every simulation

- [ ] Opens from its catalog card and from `sims/<id>.html` redirect
- [ ] Reset All confirm restores every Property and view overlay
- [ ] About lists goals, model notes, version; Escape / backdrop close; focus returns
- [ ] Layout at 360 px and 1920 px; hit targets ≥ 44 px
- [ ] Tab order reaches controls; no keyboard trap in the activity drawer
- [ ] Slider values use Persian digits; formulas and units stay LTR
- [ ] «فعالیت» opens a non-modal drawer opposite the control panel
- [ ] Escape closes the drawer; focus returns to «فعالیت»; `aria-expanded` toggles
- [ ] Below 760 px the drawer is a bottom sheet
- [ ] Worksheet fields survive Reset All and drawer close
- [ ] «تنظیم آزمایش» is Reset All then `preset` (no auto-grade from sim state)
- [ ] Print shows only the worksheet

## U-tube

- [ ] First tab is «ریختن و تعادل» with play/pause/step/speed
- [ ] Second tab is «اندازه‌گیری و محاسبه» with no time bar (unchanged lab)
- [ ] Pour locks prediction and top-liquid radios; Reset All unlocks both screens

## Offline pack

- [ ] `npm run pack` writes `dist/physics-lab.zip`
- [ ] Unzip and open `index.html` as `file://` with the network off
- [ ] Sims, activity drawer, and local fonts still work
- [ ] Zip has no `legacy/`, `tests/`, or `tools/`
