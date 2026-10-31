# shared/

Domain helpers used by more than one simulation. Core stays physics-agnostic.

Convention:

- Path: `shared/<topic>/<name>.js`
- Each file is an IIFE that attaches to `PL.shared.<topic>`
- Sim pages load these between `<!-- shared:start -->` and `<!-- shared:end -->`
- Order on a sim page: core block, then shared block, then the sim's `strings.js`

Current modules:

- `shared/crystals/lattice.js` — 2D/3D packing, bonds, harmonic `step`, rms, coordination (`PL.shared.crystals`)
