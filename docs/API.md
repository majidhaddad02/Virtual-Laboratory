# API

Public surface of `core/` and `shared/`. All files are IIFEs on `window.PL`. ES2017.

## PL.Property

`new PL.Property(initial, options?)`

- `options.range`: `[min, max]` number pair (default none). Dev warning only.
- `.value` get/set. Setter notifies only if `Object.is` says the value changed.
- `.link(fn)` → `fn`. Calls `fn(new, old)` immediately, then on change.
- `.lazyLink(fn)` → `fn`. Does not call immediately.
- `.unlink(fn)` removes that listener.
- `.reset()` restores `initial`.
- `.dispose()` drops listeners and ignores later sets.

## PL.derive

`PL.derive(deps, fn)` → Property

- `deps`: array of Property. `fn(...depValues)` recomputes the derived value.
- Read-only: assigning `.value` warns. `.dispose()` unlinks from deps.

## PL.Emitter

`new PL.Emitter()`

- `.add(fn)`, `.remove(fn)`, `.emit(...args)` (snapshot of listeners).

## PL.math

- `clamp(x, a, b)` → number
- `lerp(a, b, t)` → number
- `mulberry32(seed)` → `function ()` in `[0, 1)`
- `gauss(rng?)` → number. `rng` default `Math.random`.

## PL.format

- `num(x, decimals?)` → Persian-digit string. `decimals` default `0`. Negative sign `−`, decimal `٫`.
- `unit(x, decimals, unitStr)` → `num` plus ` <span class="ltr">unitStr</span>`.
- `parseNum(str)` → number. Accepts Persian digits, `٫`, `−`.

## PL.i18n / PL.t

- `PL.locale` default `'fa'`.
- `PL.i18n.add(locale, map)` merges string keys.
- `PL.t(key, params?)` → string. Missing key logs a warning and returns `⟦key⟧`. `{name}` replaced from `params`.

## PL.Loop

`new PL.Loop({ model, view, playing, speed })`

- `dt = model.fixedDt || 1/60`. Frame time clamped to 0.1 s; max 8 steps/frame.
- `speed` multiplies elapsed time. `view.draw()` every frame, including pause.
- `.start()`, `.stop()`, `.stepOnce()`, `.tickForTest(elapsedMs)`.

## PL.draw

- `fitCanvas(canvas, cssW, cssH, dpr)` → `{ w, h, dpr }`. Sets backing store and CSS size.

## PL.ui

Widget factories. Each returns `{ el, dispose }`. `dispose` unlinks Property listeners.

### slider(prop, opts?)

- `min` number default `0`
- `max` number default `100`
- `step` number default `1`
- `label` string default `''`
- `decimals` number default `0`

### radio(prop, opts?)

- `title` string default none
- `name` string default random
- `items` `{ value, label }[]` default `[]`

### checkbox(prop, opts?)

- `label` string default `''`

### stepper(prop, opts?)

- `step` number default `1`
- `min` / `max` number default none
- `label` string default `''`
- `minusLabel` / `plusLabel` string default `−` / `+`

### button(opts?)

- `className` string default `''`
- `label` string default `''`
- `title` string default none
- `html` string default none
- `onClick` function default none
- `dispose` is a no-op

### box(title, children)

- `title` string or falsy
- `children` Element[]
- `dispose` is a no-op

### legend(items)

- `items` `{ color, label }[]`
- `dispose` is a no-op

### readout(prop, opts?)

- `html(v)` optional function → innerHTML
- `format(v)` optional function → text (used if no `html`)

## PL.dialogs

Pure helpers (unit-tested):

- `nextFocusIndex(current, count, shift)` → number. Wraps Tab / Shift+Tab.
- `shouldClose(key)` → boolean. True for `Escape` / `Esc`.

DOM dialogs:

- `about(entry)` → `{ close }`. Lists `goals`, `modelNotes`, `version`. Escape, Tab trap, backdrop click, focus restore.
- `confirmReset(onYes)` → `{ close }`. Backdrop click = cancel.

## PL.Shell.start

`PL.Shell.start(simDef, rootEl)` → `{ resetAll, dispose }`

- `simDef.id` string, looked up in `PL.registry`
- `simDef.screens` `{ id, title, icon?, createModel, createView }[]`
- `simDef.fit` boolean default false (`sim-app fit`)
- Links `model.playing` once per model; unlinks on dispose.

## PL.shared.crystals

From `shared/crystals/lattice.js`.

- `dist(a, b)` → number. Euclidean distance of equal-length arrays.
- `minDistance(sites)` → number. Minimum pairwise distance.
- `pack2d({ n, rng, margin, minPlace, relax, tries?, iterations? })` → `[x,y][]`. `tries` default 200000, `iterations` default 60.
- `pack3d({ n, rng, halfExtent, minPlace, relax, tries?, iterations? })` → `[x,y,z][]`. `tries` default 100000, `iterations` default 80.
- `build(sites, cut)` → `{ p, b }` particles and bonds closer than `cut`.
- `step(sys, { T, rmsMax, K, G, dt, rng })` harmonic well + noise.
- `rms(sys)` → number
- `coordination(sys, index)` → number of bonds on that particle.

## CSS classes available to views

Taken from `css/*.css` and existing views.

- `stage-grid` — full-height canvas grid on the stage
- `two` — two equal columns on `stage-grid`
- `three` — three equal columns on `stage-grid`
- `view` — one canvas pane
- `ghost` — translucent pane (unit-cell)
- `badge` — overlay label on a pane
- `cry` — crystal badge color
- `amo` — amorphous badge color
- `acc` — unit-cell badge color
- `meters` — stacked meter column
- `bar` — thin fill track
- `tools` — row of panel buttons
- `ico-btn` — round icon button
- `reset` — orange regenerate icon
- `formula` — LTR math isolate
- `ltr` — LTR isolate for Latin/units
- `hidden` — hide screen tabs or time controls
- `compare` — three-column compare layout
- `fit` — compact `sim-app` (u-tube)
- `hint` — short stage/panel caption
- `vis-state` — status chip
- `ok` / `bad` — success / error tint
- `legend-dots` — color key list
- `liq-toggle` — liquid / mode button row
- `eq-banner` — formula strip on the stage
- `gauges` — analog gauge stack
- `row` — equal-width button row
- `phases` — guided-phase tabs
- `eqbox` — equation card
- `why` — validity explanation
- `leg` — compact liquid legend
- `readout` — floating stage readout
- `probe` — LTR caliper text
- `num-row` — numeric stepper row
- `box` — yellow control card
- `lab` — lab-table stage background
- `dark` — dark stage background
- `on` — selected control
- `water` / `oil` / `hg` / `mode` — liquid/mode button skins
