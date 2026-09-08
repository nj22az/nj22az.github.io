# Supplied town buildings

The owner supplied two Meshy GLBs through Drive. Originals stay in Drive; source hashes and runtime hashes are recorded in each optimisation report.

| Asset | Source | Runtime | Triangles |
| --- | ---: | ---: | ---: |
| Lantern Izakaya | 101,242,600 bytes | 4,716,880 bytes | 60,000 |
| Corner Tea House | 101,733,180 bytes | 4,988,984 bytes | 60,000 |

Blender 4.2 decimation retains the source material and UVs. Portable JPEG maps use 2048px base colour and 1024px normal/roughness maps. No external texture URLs or runtime compression decoder are required. Each exterior is one opaque mesh. Small roof tiles and bicycle detail are simplified. The PNG reviews render the actual exported GLBs in Blender.

Reproduce from the source files:

```sh
blender -b --python tools/blender/prepare-supplied-izakaya.py -- --input /path/to/izakaya.glb --root .
python tools/pack-supplied-izakaya.py
blender -b --python tools/blender/prepare-supplied-izakaya.py -- --input /path/to/tea-house.glb --root . --asset tea-house --scale 4 --front-offset 0.4
python tools/pack-supplied-izakaya.py --asset tea-house
```

Minato's supplied exterior replaces its previous Blender facade; the existing first-person interior, supper/gossip and Yuri's alternate-evening visits remain. Corner Tea House replaces the decorative Shiomi apartment shell at (46,57), with an entrance on the residential lane at (46,62), a furnished tea room and a Town Book shortcut. It opens 09:00–19:00. The tea room offers inspection and seating; it does not implement food purchases. Both rooms use the visible Exit to street control.

Validation: CPU game entry/exit checks cover every registered interior; dedicated supplied-building checks load embedded textures and verify triangle, file-size, bounds and entrance limits. Production Vite build passes with the existing large-chunk warning. Blender previews were reviewed; browser interaction and mobile GPU performance were not measured in this environment.
