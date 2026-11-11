# JPVM-2R20 – Japanese 2-row drink vending machine (digital-twin asset)

| File | Purpose |
|---|---|
| `vending_machine.py` | bpy build script: model, PBR materials, rig, drivers, animation, glTF export, previews |
| `vending_machine.blend` | Scene that the script generated (has the animation) |
| `vending_machine.glb` | Export-ready asset (VM_* objects only; the custom properties are written as glTF `extras`) |
| `vending_machine_metadata.json` | Asset metadata, the object list and the I/O tag map (object → PLC tag) |
| `preview_front.png`, `preview_open.png` | Cycles renders (closed, and with the door open) |
| `controller_state_machine.md` | Vend/payment/thermal state machine (PLC-style pseudo-code), I/O map, fault codes |
| `wiring_schematic.svg/.pdf` (+ `make_schematic.py`) | Power, sensor, motor, MDB and HMI wiring |
| `bom.csv` | 46-line BOM, with each line linked to its Blender object name |

## How to rebuild
`blender -b -P vending_machine.py -- ./out` (or `pip install bpy` and then `python3 vending_machine.py ./out`).
Environment variables: `VM_SAMPLES` (default 48) and `VM_RENDER=0` to skip the renders. This was tested with bpy 5.0.1.

## Assumptions
- The body is 1000 W × 700 D × 1830 H mm, on AC100V.
- There are 2 display rows × 10 = 20 selections: row 1 is 350 ml cans and row 2 is 500 ml PET bottles.
- Hot zone: R1C07–C10, shown with red buttons and the label あったか～い. This maps to columns 8–10. Everything else is cold (つめた～い, blue buttons).
- Payment uses MDB: a coin changer, a ¥1000 bill validator and an IC (Suica/PASMO) reader.
- Refrigerant is R744.

## Naming convention
`VM_<Subsystem>_<Part>[_R<row>C<col> | _<index>]`
- Subsystems are Cabinet, Door, HMI, Pay, Dispense, Internal, Thermal and Display.
- Collections follow the same split.
- Pivots and empties go in `VM_Rig`.
- Scene helpers (camera, lights, floor) use the `ENV_` prefix and are left out of the export.

## Rig / state controls
These are custom properties on the `VM_Root` empty. They are driven by drivers and are also exported as extras.

| Property | Range | Drives |
|---|---|---|
| `door_open` | 0–1 | `VM_Door_Hinge` Z rotation, 0–100° |
| `flap_open` | 0–1 | `VM_Dispense_Flap_Hinge`, pushes in 75° |
| `coin_return` | 0–1 | Return lever 25° and the change flap |
| `vend_drop` | 0–1 | `VM_Dispense_ProductInTransit` falling into the bin |
| `soldout_R1C01` | 0–1 | Sold-out lamp emission (shown as an example) |

- `state`, `credit_yen`, `selected`, `cold_setpoint_C` and `hot_setpoint_C` are fields for the twin runtime to mirror.
- Timeline 1–240 runs one vend cycle: ¥500 inserted, button R1C04 pressed, product drops, flap opens, change returned.
- glTF has no drivers. A twin runtime should map the properties above onto the node transforms named in the table. The pivot names stay stable for this.

## Known limitations
- The labels and dummy products are procedural, not texture-mapped. Swap in real label textures for brand-accurate looks.
- Internal parts are simplified proxies for the columns, compressor and other components.
- The animation is not baked into the GLB (`export_animations=False`). Turn it on to bake the timeline.
