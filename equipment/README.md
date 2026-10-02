# Equipment library

Machines in 3D, built from named parts, for Johansson Town, Sjöskolan's lessons and study
material. One model is described once and used everywhere: in the town's workshops, in a lesson
where Johansson demonstrates on it, and as a picture in a document.

**Viewer:** [`/equipment/`](https://nj22az.github.io/equipment/) — turn, zoom, explode, cutaway,
numbered labels, Swedish or English, and **Save picture (PNG)** with a numbered parts list for
documents. Every setting is kept in the address, so a link or an embed shows exactly the same view:

```
/equipment/?model=induction-motor&lang=sv&explode=0.6&cutaway=1&labels=1&part=rotor&connection=star
/equipment/?model=diesel-engine&crank=130&cutaway=1&embed=1     (embed: no header or machine list)
```

| Model | id | Parts | Controls |
|---|---|---:|---|
| Butterfly valve DN150, lug type | `butterfly-valve` | 10 | opening 0–90° |
| Induction motor, squirrel cage, IEC frame 160 | `induction-motor` | 16 | run; star/delta links |
| Synchronous generator, brushless, four-pole | `generator` | 17 | run |
| Diesel engine, six in line, four-stroke | `diesel-engine` | 17 | run; crank angle 0–720° |

The valve's lever always lies along its disc, as on a real valve. The motor has frame 160's real
shaft height (160 mm) and shaft end (Ø42 × 110 mm), and the six terminals U1 V1 W1 / W2 U2 V2 with
links that switch between star and delta. The generator has its exciter, rotating rectifier and
AVR. The diesel's pistons follow the slider-crank motion, its throws give the firing order
1-5-3-6-2-4, the camshaft turns at half speed, and each cylinder glows as it fires.

The models are teaching models: right in their parts, proportions and movements, simplified in
shape. They are not manufacturing drawings.

## Using a model in a page

```js
import * as THREE from '/johansson-town/vendor/three.module.js';
import {buildEquipment,setExplode,setCutaway,highlight} from '/equipment/catalogue.js';

const motor=buildEquipment(THREE,'induction-motor');
scene.add(motor.group);
setExplode(motor,.5);                  // 0 assembled … 1 fully exploded
setCutaway(motor,true);                // casings turn see-through
highlight(motor,'rotor');              // one part glows
motor.controls.find(c=>c.id==='running').set(true);
// every frame: motor.update(dt);
```

three.js is passed in, so a page can use its own copy. The town and Sjöskolan both use
`johansson-town/vendor/three.module.js` (r170).

## The model contract

`build(THREE)` returns:

| Field | |
|---|---|
| `id`, `title{sv,en}`, `summary{sv,en}` | What it is |
| `group` | The three.js group to add to a scene. Metres, Y up, main axis along X, drive end towards +X |
| `parts[]` | `{id, name{sv,en}, text{sv,en}, object, explode:[x,y,z], shell}`. `shell` parts turn see-through in cutaway |
| `controls[]` | `{id, label{sv,en}, type?, min, max, unit, value, set(v)}`; `type` is `toggle` or `choice` for non-sliders |
| `update(dt)` | Moves whatever is running |

## Adding a machine

1. Write `models/<id>.js` with `createKit` from `kit.js`: each part gets a Swedish and an English name
   and a short text that teaches something true, and an explode offset.
2. Add it to `catalogue.js`.
3. Add its size range to `tests/equipment.test.mjs`, plus a test for anything it does (a pump's
   impeller turning, a breaker's contacts opening).
4. Run `node --test equipment/tests/*.test.mjs`. CI runs the same (`.github/workflows/equipment.yml`).

Next in line: a centrifugal pump (to sit under the motor with the valve in its line), a main
switchboard section with a circuit breaker, and a shaft coupling.
