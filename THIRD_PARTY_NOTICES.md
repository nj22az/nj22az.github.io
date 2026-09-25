# Third-party credits and notices

Nils Johansson's original material is governed by the
[copyright and permissions notice](LICENSE.md). This repository also contains
separately licensed software and assets. Their authors retain their rights;
the original-material restrictions do not replace or limit those licences.

The tables below identify documented reuse, adaptations and references in this
repository. A credit is not an assertion that Nils Johansson owns the credited
work, nor that the original author endorses this website. Full component
licences, source comments, package notices and asset records remain applicable.

## Sjöskolan film companions

These components support `sjoskolan/multimeterfilm/` and `sjoskolan/acfilm/`.
The lesson scripts, instructional diagrams and project media are distinct from
the software used to make and play them.

| Project and creator | Documented use | Licence and retained notices |
| --- | --- | --- |
| [Anidoodle — Alex Greenshpun](https://github.com/alexgreensh/anidoodle) | `vendor/anidoodle-film.mjs` adapts the deterministic `film.ts` core to JavaScript. Types were removed; the rendering algorithm was preserved. | Apache-2.0. [Licence](sjoskolan/multimeterfilm/vendor/ANIDOODLE-LICENSE.txt), [upstream NOTICE](sjoskolan/multimeterfilm/vendor/ANIDOODLE-NOTICE.txt); [AC licence](sjoskolan/acfilm/vendor/ANIDOODLE-LICENSE.txt) and [AC NOTICE](sjoskolan/acfilm/vendor/ANIDOODLE-NOTICE.txt). Modification notices remain in the source. |
| [Helios — Gavin Bintz](https://github.com/BintzGavin/helios) | Helios 5.13.2 supplies the frame timeline for the film players and export workflow. | Elastic License 2.0 (ELv2), not an open-source licence. [Multimeter licence](sjoskolan/multimeterfilm/vendor/HELIOS-LICENSE.txt); [AC licence](sjoskolan/acfilm/vendor/HELIOS-LICENSE.txt). Its restrictions remain applicable. |
| [kokoro-onnx — thewh1teagle and contributors](https://github.com/thewh1teagle/kokoro-onnx) | Version 0.4.9 generates British English narration locally. It is an authoring dependency. | MIT. [Licence](sjoskolan/multimeterfilm/vendor/KOKORO-ONNX-LICENSE.txt), [multimeter voice record](sjoskolan/multimeterfilm/vendor/VOICE-NOTICE.md) and [AC voice record](sjoskolan/acfilm/vendor/VOICE-NOTICE.md). |
| [Kokoro-82M — hexgrad and contributors](https://huggingface.co/hexgrad/Kokoro-82M) | The `bf_emma` voice supplies synthetic narration. The model and voice archive are not distributed with the website. | Model documentation states Apache-2.0. Model versions, hashes and the distinction between generated audio and model files are recorded in the voice notices above. |
| [DejaVu Fonts](https://dejavu-fonts.github.io/) / Bitstream and DejaVu contributors | Local fonts for Swedish letters and technical symbols in the films. | [Font licence](sjoskolan/multimeterfilm/vendor/DEJAVU-LICENSE.txt); [AC copy](sjoskolan/acfilm/vendor/DEJAVU-LICENSE.txt). |

Build and rendering tools include [esbuild](https://github.com/evanw/esbuild),
[@napi-rs/canvas](https://github.com/Brooooooklyn/canvas) and
[FFmpeg](https://ffmpeg.org/). They are credited as tools, not as authors of the
lessons. Their own terms apply to the installed tool versions. The two film
package manifests and lockfiles record the JavaScript dependencies.

## Johansson Town and related 3D scenes

| Project and creator | Documented use | Licence and retained notices |
| --- | --- | --- |
| [Three.js — three.js authors](https://github.com/mrdoob/three.js) | Three.js r170 rendering, loaders and utilities in Johansson Town; Three.js and its example postprocessing code are also retained in the Pelican scene. | MIT. [Town licence](johansson-town/vendor/LICENSE-THREE.txt), [Pelican licence](the-front-row-seat/pelican/vendor/THREE-LICENSE.txt), [Pelican postprocessing licence](the-front-row-seat/pelican/vendor/postprocessing/LICENSE.txt). |
| [Godot Open Dialogue System — Tina Qin / QueenChristina](https://github.com/QueenChristina/gd_dialog) | Dialogue rules reimplemented from GDScript as a JavaScript state machine in `johansson-town/src/dialogue/dialogue-engine.js`. Town dialogue text is project writing. | MIT. [Licence](johansson-town/src/dialogue/LICENSE-GD-DIALOG.txt); adaptation scope in the [asset ledger](johansson-town/assets/ATTRIBUTION.md). |
| [Virtual Joystick — Marco Fazio](https://github.com/MarcoFazioRandom/Virtual-Joystick-Godot) | Joystick modes, visibility and dead-zone response adapted from GDScript to JavaScript Pointer Events in `src/input/virtual-joystick.js`. | MIT. [Licence](johansson-town/LICENSE-VIRTUAL-JOYSTICK.txt). |
| [Sakura Crossing — Kenton Wang / Kenton-GMI](https://github.com/Kenton-GMI/sakura-crossing) | Adapted cel shading, screen-space ink, colour grading and FXAA; selected batching, sagging-cable, utility-pole and kei-truck construction. | MIT. [Licence](johansson-town/LICENSE-SAKURA-CROSSING.txt). Exact paths and changes are listed in the [asset ledger](johansson-town/assets/ATTRIBUTION.md). |
| [AsagaoUI — Hiroshi ISOBE](https://github.com/ctpena/asagaoui) | Landing-page design reference: colour ramps, typography, spacing, corners and focus treatment. Its framework code and artwork are not bundled. | MIT upstream. [Retained notice](johansson-town/LICENSE-ASAGAOUI.txt). |
| [Yorimichi — emaxsaun](https://github.com/emaxsaun/yorimichi) | Design reference for the shop counter ritual, stamp card, receipts and purchase history. No upstream code was copied. | MIT upstream. [Retained notice](johansson-town/LICENSE-YORIMICHI.txt). |
| [MPFB — MakeHuman Community](https://github.com/makehumancommunity/mpfb2) | Blender authoring tool for character preparation; the add-on code is not bundled. MakeHuman asset data has its own terms. | See the [Johansson character source record](johansson-town/art/characters/johansson/README.md) and [MakeHuman CC0 asset notice](johansson-town/assets/characters/realistic/LICENSE-MAKEHUMAN-CC0.md). |

### Assets and data have their own authors

The [Johansson Town asset ledger](johansson-town/assets/ATTRIBUTION.md) remains
the detailed record of model, texture, map, audio and image sources and changes.
Some entries describe historical assets; current source paths and the more
specific character/model manifests identify retained files. The ledger includes:

- **Quaternius, MakeHuman Community and Kenney** character assets, with their
  respective CC0 records in [character credits](johansson-town/assets/characters/ATTRIBUTION.md)
  and [resident provenance](johansson-town/assets/characters/residents/PROVENANCE.md).
- **Poly Haven contributors**, including the named texture and HDR creators in
  the ledger; CC0 materials and lighting.
- **YCbCr and para** via OpenGameArt, and **Polygonal Mind** via
  [ToxSam/cc0-models-Polygonal-Mind](https://github.com/ToxSam/cc0-models-Polygonal-Mind),
  for the individually recorded surfaces and banana-plant model.
- **OpenStreetMap contributors** for the recorded map extract and adapted road
  data; [ODbL terms and attribution](https://www.openstreetmap.org/copyright)
  continue to apply to that data.
- Individual model authors credited in the local `CREDITS.md`, `manifest.json`
  and source records. CC BY, CC BY-NC, standard asset licences and any unresolved
  permissions are not converted into Nils Johansson's exclusive property.

Uploader metadata is preserved as provenance; it is not independent proof that
an uploader can license underlying third-party or franchise artwork. Adding a
credit does not resolve a missing permission or authorise commercial sale.

## Form 3D Studio and Image → SVG

| Project | Documented use | Licence and source records |
| --- | --- | --- |
| [JSCAD — JSCAD Organization and contributors](https://github.com/jscad/OpenJSCAD.org) | `@jscad/modeling` 2.13.0 supplies the modelling kernel. | MIT; [full notice](form-3d-studio/vendor/JSCAD-LICENSE.txt). |
| [VTracer — Vision Cortex](https://github.com/visioncortex/vtracer) | `@visioncortex/vtracer` 1.0.0-alpha.3; raster-to-vector conversion, with a browser-adapted loader. | MIT OR Apache-2.0; [component record](form-3d-studio/THIRD_PARTY_NOTICES.md). |
| [esm-potrace-wasm — Thomas Steiner / tomayac](https://github.com/tomayac/esm-potrace-wasm), based on [Potrace — Peter Selinger](https://potrace.sourceforge.net/) | Version 0.5.0; binary tracing in the generated vector worker. | GPL-2.0; [complete distributed licence](form-3d-studio/image-to-svg/POTRACE-GPL-2.0.txt). The root no-resale restriction does not apply to this GPL-covered worker or other code covered by its copyleft requirements. |
| [ImageTracer.js — András Jankovics](https://github.com/jankovicsandras/imagetracerjs) | Version 1.2.6; JavaScript tracing fallback. | Unlicense; [component record](form-3d-studio/THIRD_PARTY_NOTICES.md). |
| [SVGO — SVG Optimizer contributors](https://github.com/svg/svgo) | Version 4.0.2; SVG optimisation. | MIT; [component record](form-3d-studio/THIRD_PARTY_NOTICES.md). |
| [fflate — Arjun Barrett / 101arrowz](https://github.com/101arrowz/fflate) | Version 0.8.3; local ZIP export. | MIT; [component record](form-3d-studio/THIRD_PARTY_NOTICES.md). |

The vectorizer's editable source is in
[`form-3d-studio/image-to-svg/src/`](form-3d-studio/image-to-svg/src/), with
[build instructions](form-3d-studio/image-to-svg/README.md),
[build script](form-3d-studio/scripts/build-vectorizer.mjs), and pinned
dependencies in its [package lock](form-3d-studio/package-lock.json).
Existing GPL requirements, including those concerning covered combined works
and corresponding source, take precedence over the root ownership notice.

The project-authored open-model recipes were already released under
[MIT](form-3d-studio/OPEN_MODELS_LICENSE.txt). That specific grant, and the
[workshop copy's notices](johansson-town/assets/workshop/LICENSE.txt), are
preserved. They are not subject to the original-material no-resale restriction.

## References and discovery catalogues

These acknowledgements distinguish research and inspiration from shipped code:

- [OpenLake/bhilaee-simulator](https://github.com/OpenLake/bhilaee-simulator),
  [pfalstad/circuitjs1](https://github.com/pfalstad/circuitjs1),
  [Yousef4008/Multimeter](https://github.com/Yousef4008/Multimeter) and
  [tiagocoutinho/sinstruments](https://github.com/tiagocoutinho/sinstruments)
  are documented research references for the multimeter lab. Their code and
  firmware are not included in that lab; see its
  [reference notes](sjoskolan/multimetersimulator/README.md#referensprojekt-och-källor).
- [teamgravitydev/gamedev-free-resources](https://github.com/teamgravitydev/gamedev-free-resources),
  [ToxSam/os3a-gallery](https://github.com/ToxSam/os3a-gallery) and
  [ToxSam/open-source-3D-assets](https://github.com/ToxSam/open-source-3D-assets)
  are asset-discovery catalogues. Their application code is not imported; the
  selected assets are credited to their own creators.
- Historical VRoid references and their
  [madjin/vrm-samples mirror](https://github.com/madjin/vrm-samples) remain
  documented in the town's ledger as historical provenance, not a claim that
  all those models are part of the current cast.

For teaching references, instrument documentation and image sources, see
[Sjöskolan's source page](sjoskolan/kallor.html) and the sources inside the
individual presentations. School templates, third-party illustrations, names
and logos retain their respective owners' rights.

## Scope and maintenance

This is an index of the documented direct reuse and references, not a replacement
for full licences or an assurance that every historical asset has commercial
clearance. Preserve component notices and relevant source when redistributing
anything permitted by its own licence. A separately licensed component does not
automatically license unrelated original course material, writing or artwork.

When adding a dependency or asset, record the creator, source URL, exact version
or file, licence, affected paths and changes. Retain upstream NOTICE files where
required, and distinguish tools and inspiration from copied code or media.

Reviewed against repository commit `ad5069dbbd005bf9c91b27a1822f659c6e2b38ba`,
25 September 2026.
