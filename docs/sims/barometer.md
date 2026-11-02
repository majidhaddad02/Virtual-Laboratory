# Barometer (Torricelli)

1. Learning goals (Persian in the registry):
   - Explain why inverted mercury does not empty: air pressure on the dish equals ρgh of the column.
   - See that vertical height does not depend on tube diameter or tilt while the tube is long enough.
   - Predict how altitude, weather, and liquid (mercury vs water) change the column.
   - Read and convert pressure in cmHg, mmHg, Pa, kPa, and atm.

2. Model assumptions and validity range:
   - ISA troposphere formula is an approximation; real pressure depends on latitude and season. Measured Everest summit pressure is about 253 mmHg; this model gives about 236 mmHg.
   - Altitude presets 1200 m (Tehran) and 5610 m (Damavand) are approximate.
   - Mercury and water vapour pressure ignored (a real water barometer is about 0.2 m shorter).
   - Mercury density at 0 °C; large dish, constant dish level; no air bubble.
   - Screen 2 tube width is not to scale. Quasi-static overdamped motion (a real column oscillates slightly).
   - Real mercury is toxic — simulation only, or expert supervision.

3. Controls and Reset All:
   - Screen 1: Next, prediction radios, local «از اول». Shell play/pause/step/speed.
   - Screen 2: altitude 0–9000 m plus four presets, sea-level weather 98–104 kPa, tilt 0–60°, radius 0.3–2.0 cm.
   - Reset All restores both screens (every Property and internal state).

4. Screens:
   - «آزمایش توریچلی» — sequential fill, seal, invert, predict, release.
   - «آزمایشگاه آزاد» — mercury 1.00 m and water 12.0 m, same atmosphere.

5. Representations:
   - Canvas tube + dish; vacuum hatch; cm/m rulers; A/B equal-pressure marks after settle; pressure profile bar; force-balance readout; unit table; true-scale height bars.

## Physics reference (model values)

| Quantity | Value |
| --- | --- |
| Sea-level mercury | 0.76000 m |
| Sea-level water | 10.3323 m |
| hW / hHg | 13.5951 |
| atmPressure 1000 / 1190 / 2000 / 5610 / 8849 m | 89874.6 / 87822.5 / 79495.2 / 49759.3 / 31439.3 Pa |
| Mercury at those altitudes | 67.41 / 65.87 / 59.63 / 37.32 / 23.58 cm |
| Water at those altitudes | 9.165 / 8.955 / 8.106 / 5.074 / 3.206 m |
| 101325 Pa | 76.000 cmHg = 760.00 mmHg = 1.0000 atm = 101.325 kPa |
| Mercury 1.00 m critical tilt | 40.536° |
| At 30° | hV 0.7600 m, along 0.8776 m, not full |
| At 45° | full, hV 0.7071 m |
| At 60° | full, hV 0.5000 m, pTop 34664 Pa |
| Water 12 m critical tilt | 30.568° |

Constants: ρ_Hg = 13595.1 kg/m³, ρ_W = 1000 kg/m³, g = 9.80665 m/s², κ = 0.8 /s.
