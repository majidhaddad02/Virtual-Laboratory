# U-tube

- Goals: pick a valid equal-pressure pair in one connected liquid; write P from vertical layer thicknesses; predict the unknown height.
- Assumptions: open arms; bend is graphical; water 1000, oil 920, glycerin 1260; g = 9.8 or 10; heights in cm internally converted to m for ρgh.
- Controls: case (one/two/three liquids), guided phases, compare, g toggle, guess input. Reset All restores case 2 (دو مایع), g=9.8, phase 0, no points.
- Two screens. Screen 1 is pour-and-settle (time-based). Screen 2 is the existing measurement lab (unchanged).

Teach: pick a valid equal-pressure pair, write `P = P_atm + Σρᵢghᵢ` (vertical thicknesses), solve an unknown height.

- Open arms; bend is graphical. Safe liquids: آب 1000, روغن 920, گلیسیرین 1260.
- Valid pair iff both points sit in the same connected liquid.
- Do not treat any same-height pair as equal pressure.
- Do not use path length along the bend as `h`.
- Do not make ΔP = ρgΔh the primary lesson (that is hydrostatic).
- U-tube is its own catalog card, not a tab on hydrostatic.

Model assumptions:

- Equal cross-section arms (heights equal volumes).
- Both ends open to the same atmosphere.
- Immiscible liquids.
- No surface-tension or capillary effects.

## Screen 1 - Pour and settle

Learning goals:

1. Pressure of a liquid column at the bottom is ρgh.
2. A pressure difference at the bottom drives flow through the bend.
3. Equilibrium means equal bottom pressures, not equal free surfaces.

Assumptions:

- Quasi-static overdamped model (real water would oscillate slightly).
- Equal cross-section arms; height equals volume.
- Both ends open to the same atmosphere; displayed pressures are gauge.
- Top liquid is immiscible and lighter than water (oil 920, kerosene 800). Heavier or miscible liquids are not offered.
- g = 9.8; water ρ = 1000; total water height S = 30 cm.

Controls: prediction radios (locked after first pour), top-liquid radios (locked after first pour), arm radios, pour-amount slider (1–6 cm), Pour button. Shell play/pause/step/speed. Reset All restores both screens.

Simplifications: no viscosity wave, no oscillation, no capillary rise, identical arm area, pour rate 3 cm/s, κ = 0.4 /s.
