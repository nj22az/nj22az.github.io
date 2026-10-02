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

| Model | id | Parts | Controls | Service procedures |
|---|---|---:|---|---|
| Butterfly valve DN150, lug type | `butterfly-valve` | 10 | opening 0–90° | |
| Induction motor, squirrel cage, IEC frame 160 | `induction-motor` | 16 | run; star/delta links | |
| Synchronous generator, brushless, four-pole, ~500 kVA | `generator` | 30 | run | insulation test; rectifier diode check; non-drive-end bearing change |
| Diesel engine, six in line, four-stroke | `diesel-engine` | 17 | run; crank angle 0–720° | |
| Centrifugal pump, end suction, back pull-out | `centrifugal-pump` | 11 | run | mechanical seal change |
| Flexible jaw coupling with dial indicator | `shaft-coupling` | 9 | parallel offset; angular error (drawn 10×); run | motor–pump alignment |
| Main switchboard, generator section, withdrawable ACB | `switchboard` | 11 | breaker open/closed; connected/test/disconnected (interlocked) | isolating and locking out the breaker |

The valve's lever always lies along its disc, as on a real valve. The motor has frame 160's real
shaft height (160 mm) and shaft end (Ø42 × 110 mm), and the six terminals U1 V1 W1 / W2 U2 V2 with
links that switch between star and delta. The generator has its exciter, rotating rectifier and
AVR. The diesel's pistons follow the slider-crank motion, its throws give the firing order
1-5-3-6-2-4, the camshaft turns at half speed, and each cylinder glows as it fires.

The generator is built after the common marine brushless designs: a slotted stator (48 slots)
with varnished end windings, four salient poles with curved shoes, damper bars and field coils, a
radial fan, a roller bearing at the drive end and a ball bearing at the far end with bearing caps and
grease nipples, the exciter, a rotating rectifier with six diodes and a varistor, a permanent-magnet
pilot exciter (PMG), an AVR, PT100 sensors, an anti-condensation heater and shims under the feet.

The switchboard has the real interlock: a closed breaker cannot be racked, and the viewer says why.

**Service mode.** Choose a job under *Service and maintenance* and step through it: each step says
what to do, which tool and what to check; parts come off in order, the unit slides out in a back
pull-out, the breaker opens and racks out, and the view turns to the parts the step is about. The
link keeps the job and the step (`&proc=seal-change&step=4`), so a lesson can open at a given step.

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
| `controls[]` | `{id, label{sv,en}, type?, min, max, unit, value, set(v), note?}`; `type` is `toggle` or `choice` for non-sliders; `note{sv,en}` explains a refused setting (an interlock) |
| `procedures[]` | `{id, title{sv,en}, initial?, steps[]}`; each step `{sv, en, tool?, check?, remove?, move?, set?, focus?}` (see `kit.js`). Show a step with `showProcedureStep(model, id, i)`, end with `clearProcedure(model)` |
| `update(dt)` | Moves whatever is running |

## Adding a machine

1. Write `models/<id>.js` with `createKit` from `kit.js`: each part gets a Swedish and an English name
   and a short text that teaches something true, and an explode offset.
2. Add it to `catalogue.js`.
3. Add its size range to `tests/equipment.test.mjs`, plus a test for anything it does (a pump's
   impeller turning, a breaker's contacts opening).
4. Run `node --test equipment/tests/*.test.mjs`. CI runs the same (`.github/workflows/equipment.yml`).

## Why the models are built in code, not downloaded

Realistic free models exist, but none fit service training:

- **Manufacturer CAD** (motors, pumps, valves from the makers' catalogues on PARTcommunity,
  TraceParts and similar) is free to download, but the terms forbid passing it on or publishing it,
  which a web page does. It is also the outside only: a motor is a shell with a shaft, with nothing
  inside to take apart.
- **Sketchfab models under CC BY** may be used and published with credit to the author. Most are
  single sculpted meshes or a handful of pieces, made to look at, not to dismantle, and rarely right
  in their proportions.
- **Marketplace "free" models** (CGTrader, TurboSquid, Free3D and others) mostly come under
  royalty-free licences that allow use in a product but not handing out the file itself, which a
  web viewer effectively does.
- **AI-generated models** (image-to-3D) come as one fused mesh: no parts, no inside.

Built in code, every part is separate, named, described in two languages, sized from real
standards, free of licence questions, and can be opened, moved and tested. A good CC BY or CC0
model can still dress a scene in Johansson Town, where no one takes it apart; check its licence and
record its author in the town's `assets/ATTRIBUTION.md`.

Next in line: a shell-and-tube heat exchanger, a purifier (separator), a fuel injector and an air
compressor, and placing the machines in the town's electrical workshop.
