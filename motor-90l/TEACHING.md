# Teaching basic electrotechnology with the 90L motor

Tetsuo's routine (`workshop/`) is the first set of lessons: Tetsuo from Johansson Town does a real job on the bilge
pump motor, and the 3D model shows what you cannot see on a real bench. Each chapter has a *Learn* card with the theory
and the numbers, all worked out in `calc.mjs` from this motor's design.

## In the routine now

| # | Job | Electrotechnology | What the 3D adds |
|---|---|---|---|
| 1 | Isolate and lock off | Isolation vs. control switching; one person, one lock | The supply cable traced from gland to starter |
| 2 | Prove it dead | Test–test–test; line-to-line and line-to-PE; separate PTC supply | Labels on the studs being probed; big tester readout |
| 3 | Star or delta | U<sub>phase</sub> = U<sub>L</sub>/√3, I<sub>L</sub> = √3·I<sub>phase</sub>; why one motor runs on 230 V and 400 V | Winding in phase colours; links moving between Y and Δ |
| 4 | Measure the windings | Ohm's law, R = ρL/A, copper temperature correction; insulation resistance and leakage current | Readings from the design (2.68 Ω at 20 °C), not invented |
| 5 | Bearings and shaft | Locating vs. floating bearing, axial and radial load, runout | Cutaway: balls rolling as the shaft turns; dial indicator |
| 6 | Clean and inspect | Losses become heat (296 W); 10 K hotter halves insulation life | Dust disappears from the fins and grille as he brushes |
| 7 | Test run | Rotating field, n<sub>s</sub> = 120·f/p, slip; Kirchhoff: a clamp round the whole cable reads zero | N/S field poles rotating ahead of the rotor |

## Next lessons that fit this motor

1. **Read the plate, set the overload.** From I<sub>N</sub> and the connection to the relay setting; what happens at 1.2 × I<sub>N</sub>.
2. **Reverse the rotation.** Swap two phases; the field ring turns the other way before the rotor follows.
3. **Single phasing.** One fuse gone: the field becomes pulsating, the motor hums and will not start, the other two
   lines carry √3 × the current. Simulated clamp readings make the fault visible.
4. **Earth fault.** A chafed lead at the frame: insulation falls to 0.2 MΩ on one phase; find it by splitting the links.
5. **Shorted turns.** One winding reads 4 % low and runs hot; show the hot coil in the cutaway.
6. **Power factor at no load.** 1.9 A at no load but little power: magnetising current vs. working current, cos φ 0.2 → 0.79.
7. **The PTC chain.** Thermistor in the winding → relay → contactor; trip and reset, and why a megger kills a PTC.
8. **The magnetic circuit.** Flux through yoke, teeth and air gap in the cutaway; why a 0.35 mm gap matters.
9. **Dry out a flooded motor.** Insulation low after the pump room flooded → heat → retest.
10. **Bearing change.** The workshop strip-down on the motor page, with Tetsuo doing the steps.

Each one is a symptom, measurements on the model, a diagnosis and a fix. If they become Sjöskolan exercises, the text
goes in `sjoskolan/innehall/` and uses the course notation (U_{pp}, I_{L} …), as CLAUDE.md requires.
