# فیزیک‌لب

Static Persian interactive physics lab. Classic scripts on `window.PL`. No bundler, no npm packages, no network at runtime.

Open `index.html` as `file://` or from the repo root:

```
python3 -m http.server 8000 --bind 0.0.0.0
```

## Commands

```
npm test
npm run build-registry
npm run sync-pages
npm run pack
```

`npm run pack` writes `dist/physics-lab.zip` for offline use (`file://`). The zip omits `.git`, `legacy/`, `tests/`, `tools/`, `dist/`, and unused `css/phet.css`.

## Layout

```
index.html                 catalog from PL.registry
css/                       tokens, shell, catalog
core/                      window.PL (IIFE)
data/                      topics + generated registry
shared/                    domain helpers
sims/<id>/                 meta, model, view, activity, main
fonts/                     Vazirmatn woff2 (SIL Open Font License)
docs/                      design, API, sim briefs
```

UI is Persian RTL. Identifiers, comments, and these docs are English. Formulas and units use `.formula` / `.ltr`.

## Add a simulation

See `docs/ADDING_A_SIM.md`. Scaffold:

```
node tools/new-sim.js <id>
```

Then fill the brief, model tests, and activity `goal` coverage.

## Manual check

See `CHECKLIST.md` after `npm test` and both `--check` scripts.
