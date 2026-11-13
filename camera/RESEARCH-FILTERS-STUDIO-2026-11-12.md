# Filters and a "studio" for Pocket Camera: what four projects can teach us

Read-only study, 12 November 2026. Four public repositories were cloned (depth 1) under `/home/user/research-src/`. Nothing from them was run or installed. This study changed no file in `/home/user/nj22az.github.io` or `/home/user/johansson-town`. (The site repository does show uncommitted work on `camera/frames.js` and two new files; that is someone else's.)

## Short answer

- **More filters: yes.** The sources hold about 29 effects Pocket Camera does not have. Most are simple lens and colour tricks that fit one fragment pass in our engine as it is.
- **Reusing code: almost never.** Filters4Processing is mostly CC BY-NC-SA or has no licence at all. PhotoCraft (MIT or Apache) is Rust on the CPU, and XBImageFilters (MIT) has only trivial shaders. mIRO's own GLSL (Apache 2.0) is the one body of code that could be reused with attribution, apart from three helpers it took from others. Learning the technique and writing our own shader is both the owner's rule and the practical route.
- **"A studio like PhotoCraft":** PhotoCraft has no feature called a studio ("Studio" is only the name of its UI themes). The whole app is a Photoshop-style layered editor. Section 8 lists the eight parts of it that would matter in a toy camera.
- **AI:** PhotoCraft ships no ML runtime and downloads no models. Its "smart" tools are classical algorithms from published papers.

## 1. Filters4Processing (`/home/user/research-src/Filters4Processing`)

- **What:** 13 Processing (Java) sketches, each applying one GLSL ES 1.0 fragment shader through `filter()`. Desktop Processing, no server, no build. 50 files, 7.2 MB (mostly sample media), 14 `.glsl` files. Last commit 2023-09-22.
- **Licence:** there is no licence file. `README.md` line 120: "All shaders from Shadertoy belong to there respective authors. Unless otherwise specified in the shader file, they are licensed under Creative Commons (CC BY-NC-SA 3.0)". Only two shader files state a licence themselves.

| Filter (file under `sketches/`) | Author as stated | Licence as stated | Freely reusable? | Look and technique |
|---|---|---|---|---|
| GaussianBlur | Callum Hay (blog) | none stated; not from Shadertoy | **No** (unknown) | Soft blur; separable two-pass Gaussian with incremental coefficients |
| BarrelBlurChroma | hornet, Shadertoy XssGz8 | README default CC BY-NC-SA 3.0 | **No** | Rainbow smear growing to the edges; 12 taps along a barrel distortion weighted by a spectrum |
| FisheyePincushion | SanchYESS, Shadertoy 4s2GRR | README default | **No** | Fisheye bulge or pincushion pinch; radial remap with tan/atan |
| Bicubic | inigo quilez 2013, modified by sgreen | "License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License." | **No** | Smooth enlargement; 4x4 B-spline from 4 bilinear taps |
| Bilateral | mrharicot, Shadertoy 4dfGDH | README default | **No** | Noise removed, edges kept; spatial Gaussian times colour-difference Gaussian |
| ContrastSaturationBrightness | Romain Dura 2012 | "Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies." | **Yes, with the notice** (the inner function is credited to "TGM's shader pack", a forum post with no licence) | Basic adjust; mix towards luminance and towards mid grey |
| Dithering | RavenWorks, Shadertoy Xs23zW | README default | **No** | 1-bit black and white, early Mac; luminance against an 8x8 threshold texture |
| FloydSteinberg | RavenWorks, Shadertoy 4sjGRD (port: Martin Prout) | README default | **No** | 1-bit with error-diffusion grain; error carried over 64 pixels left and 64 up (128 taps) |
| EdgeDetection | Ken Slade, Shadertoy ldsSWr, after Jeroen Baert | README default | **No** | White or coloured edges on black; 3x3 Sobel, Prewitt, Scharr, Roberts or Kayyali kernels |
| Metaballs | blur by Callum Hay; `threshold.glsl` has no header | none stated | **No** (unknown) | Shapes merge into gooey blobs; wide blur then smooth threshold |
| Droste | ArKano22, gamedev.net forum (adapted by @monkstone) | none stated | **No** (unknown) | Picture repeating inside itself in a spiral; complex log/exp map, animated |
| NTSC | UltraMoogleMan, Shadertoy ldXGRf, "a port of the NTSC encode/decode shader pair in MAME and MESS" | README default; MAME's own terms not stated | **No** | Analog TV colour bleed; RGB to YIQ composite, 83-sample FIR decode |
| Pixelate | simesgreen 4sl3zr, radiodario ltjGDh | README default | **No** | Mosaic blocks; UV snapped to a grid |

## 2. PhotoCraft (`/home/user/research-src/photocraft`)

- **What:** "an open-source, clean-room reimplementation of Adobe Photoshop, rebuilt in pure Rust" (`README.md`), version 0.23.1, early alpha. 2,612 `.rs` files, about 1.02 million lines, 83 MB checkout. Last commit 2026-11-12.
- **Runs on:** native desktop (egui on wgpu), a CLI, an MCP server, and the browser as WebAssembly. Building needs Rust 1.95 and Cargo. The web build is a static site with "no server-side code" (`packaging/web/README.md`): about 10.9 MiB gzipped (23.9 MiB of wasm), WebGPU or WebGL2, files through the browser picker and download, preferences in localStorage, no autosave.
- **Licence:** `Cargo.toml`: `license = "MIT OR Apache-2.0"`. `LICENSE-MIT`: "Copyright (c) 2026 ArtCraft Team and the PhotoCraft contributors". Exceptions in `NOTICE`: the ArtCraft logos are trademarks and "not open source"; fonts are OFL; icons ISC/MIT; face-detection weights BSD-3-Clause. No per-file headers that change this were found. The code is reusable with attribution, but it is Rust on CPU tiles, so nothing drops into a GLSL engine.

**What its "studio" is.** One editor, with these parts:

| Part | What PhotoCraft has | Evidence |
|---|---|---|
| Editing model | A layer tree: pixel, group, adjustment, fill, type, shape and smart-object layers; 27 blend modes; opacity and fill; clipping masks; layer styles (shadows, glows, bevel, stroke, overlays) | `README.md`, `docs/architecture.md` |
| Masks | Pixel and vector masks per layer, Quick Mask, alpha channels | `README.md` |
| Selections | Marquees, lassos, Magic Wand, Quick Selection, Object Selection, Select Subject, Focus Area, Select and Mask; feather, grow, smooth | `crates/algo/src/segment.rs`, `matting.rs` |
| History | Every action is a command (about 700 per `docs/architecture.md`); history stores transactions over copy-on-write 256x256 tiles, so undo swaps tiles; History panel, snapshots, History Brush | `docs/architecture.md` section 6 |
| Brushes | Dab engine with shape dynamics, scattering, texture, dual brush, wet edges, smoothing; "deterministic, replayable strokes"; 69 tools in all | `README.md`, `crates/paint` |
| Non-destructive | 16 adjustment layers (Curves, Levels, Vibrance, Hue/Saturation, Black & White, Channel Mixer, Gradient Map, Photo Filter, Selective Color, Color Lookup named); smart filters stay editable | `README.md` |
| Retouch | Content-Aware Fill (PatchMatch with multi-scale voting), Remove tool, Healing (Poisson blending), Clone Stamp, Red Eye, Liquify (strokes edit a coarse displacement grid, resampled once), seam-carving scale | `crates/algo/src/inpaint.rs`, `poisson.rs`, `liquify.rs`, `seam.rs` |
| AI | **No ML runtime** ("There is no ML runtime", `docs/gaps.md` G15). Select Subject is superpixel saliency seeding GrabCut; Select Sky is a colour heuristic. The one learned model is a face detector (YuNet weights, about 100 KB, embedded, BSD-3), left out of the web build | `crates/algo/src/segment.rs`, `faces.rs` |
| Export | PSD/PSB, layered TIFF, OpenRaster, native `.pcraft`, PNG, JPEG, WebP, GIF, BMP, TGA, ICO, QOI, PNM, OpenEXR, HDR, FITS; Export As with quality, scale and a size estimate | `README.md` |

Everything runs on the device, in the browser too. Nothing is fetched at run time.

**Filters** (75 menu commands in `crates/ui-egui/src/menu_catalog.rs`, 47 gallery filters in `crates/algo/src/artistic.rs`). Grouped, with the technique where the source documents it:

| Family | Filters | Technique |
|---|---|---|
| Blur | Average, Blur, Blur More, Box, Gaussian, Lens, Motion, Radial, Shape, Smart, Surface; Blur Gallery: Field, Iris, Path, Spin, Tilt-Shift | Running-sum box passes; directional and radial taps; edge-keeping variants |
| Distort | Displace, Pinch, Polar Coordinates, Ripple, Shear, Spherize, Twirl, Wave, ZigZag; Liquify, Lens Correction, Adaptive Wide Angle | Inverse UV mapping with bilinear resampling |
| Noise | Add Noise, Despeckle, Dust & Scratches, Median, Reduce Noise | Hashed noise; rank filters |
| Pixelate | Color Halftone, Crystallize, Facet, Fragment, Mezzotint, Mosaic, Pointillize | Cell layouts on a jittered grid, hashed from position |
| Render | Clouds, Difference Clouds, Fibers, Flame, Lens Flare, Lighting Effects, Picture Frame, Tree | Procedural noise; flare elements placed along the axis through the image centre |
| Sharpen | Sharpen, Sharpen Edges, Sharpen More, Smart Sharpen, Unsharp Mask | Blur subtracted from the original |
| Stylize | Diffuse, Emboss, Extrude, Find Edges, Oil Paint, Solarize, Tiles, Trace Contour, Wind | Oil Paint: structure-tensor flow field, line integral convolution, lit bristle relief |
| Other | Custom (kernel), High Pass, HSB/HSL, Maximum, Minimum, Offset, De-Interlace, NTSC Colors, Camera Raw, Vanishing Point | Convolution, morphology |
| Gallery: Artistic | Colored Pencil, Cutout, Dry Brush, Film Grain, Fresco, Neon Glow, Paint Daubs, Palette Knife, Plastic Wrap, Poster Edges, Rough Pastels, Smudge Stick, Sponge, Underpainting, Watercolor | "the looks are our own approximations" |
| Gallery: Brush Strokes | Accented Edges, Angled Strokes, Crosshatch, Dark Strokes, Ink Outlines, Spatter, Sprayed Strokes, Sumi-e | as above |
| Gallery: Sketch | Bas Relief, Chalk & Charcoal, Charcoal, Chrome, Conté Crayon, Graphic Pen, Halftone Pattern, Note Paper, Photocopy, Plaster, Reticulation, Stamp, Torn Edges, Water Paper | as above |
| Gallery: other | Diffuse Glow, Glass, Ocean Ripple, Glowing Edges, Craquelure, Grain, Mosaic Tiles, Patchwork, Stained Glass, Texturizer | as above |

## 3. mIRO (`/home/user/research-src/mIRO`)

- **What:** a browser shader toy for the phone camera, 12 JavaScript files and one HTML page, 6,483 lines, 252 KB. Last commit 2023-02-06. No build, no server; it loads p5.js 1.4.0 from the jsDelivr CDN, so the first load needs the network.
- **Licence:** `LICENSE` is Apache License 2.0. `setup.js`: "// Copyright 2022, Sergey Egorov // Licensed under the Apache License, Version 2.0". Third-party fragments inside `library.js`, with no licence stated: the "Watercolor Distortion" ("Based on the code by Victor Li"), RGB/HSB conversion ("from Sam Hocevar"), and `uv2bar` ("Distortion function from Q_Layer: shadertoy.com/view/lslGRN"). **Those three are not clearly reusable.**
- **Structure:** a filter is plain text: a name, then fragment-shader bodies separated by `@`. Each body becomes one pass (`shaders.js`). Every pass gets the same uniforms and a prepended library of about 60 helpers. Inputs: `TXC` camera, `TXP` previous pass, `TXB` a tiny blurred copy (2.5% size), `TXF` the accumulated output of the previous frame. The result is drawn onto a 2D canvas with its alpha, so transparent pixels keep what was there: pictures build up as a collage (`gui.js`).
- **Presets:** pack "mIRO)))" has 37, named after bands; "Disaurde v.303" has 32 building blocks; "Mixes Still" and "Mixes Motion" have 28 chains of the others. The 37 are grouped below by their main technique, as I read them; several use more than one.

| Family | Presets | Look and technique |
|---|---|---|
| Self-displacement | Vibravoid, Chromeo, Oval, Autechre, Bluejuice, Deerhoof, Klaxons, Dungen, Xenakis, Monolake | Liquid smear; UV offset by an angle and length read from the picture's own (or the blurred copy's) colour channels |
| Mirror and polar | Locussolus, Uffie, Goldie, Infadels, Q-Tip | Kaleidoscope, bubbles; polar coordinates, mirrored wrap, circle inversion |
| Mosaic by content | Jetone, Goto80 | Block size set by local colour |
| Feedback | Gas, Spirallianz, Aeroplane, Mastodon, Meanderthals, Royksopp, Hexstatic, Floex, Enduser, Zeebox | Zoom tunnels, trails; previous output scaled, rotated or hue-shifted behind the new frame |
| Collage by mask | Sevish, Workshop, Interpol, Pictures, Morphine, Timewriter, Periskop | Each frame stamps a brightness band or a random circle, rectangle, dash or drop |
| Tone folding | Neu, Yage, EU | Solarized bands via sin() of luminance or HSB; four quarters of the frame blended |
| Disaurde blocks | Crop 1/4, Edges Only, Mix 4/4, Mosaic of images, Blend with the camera, Replace color, Change color, Accent color, Tone, Hue shift, Invert, Barell & displace, Sine, Rain, Watercolor, Feedback Blend Normal, Threshold Lighten, Zebra, Substract, Screen, Difference, Divide, Feedback blur, Alpha blur, Black cutoffs, Vertical, Threshold, Copy, Delay, Just Stamp, Alt Stamp, Pointilism | One small job each, meant to be chained |

- **Interaction, the distinctive part:**
  - One large PLAY pad. Frames are processed only while it is held (or one per tap). Where the finger rests on the pad sets two live parameters, `MX` and `MY`.
  - Buttons A, B and C appear only when the filter's text uses them. Five random numbers and five noise values arrive per frame, so holding PLAY keeps producing variations.
  - **Random Mix** chains 1 to 5 random presets and randomly rebinds or inverts their controls (`keyboard.js`).
  - A tap-tempo beat clock can fire recorded key macros; the microphone code is commented out.
  - An in-app editor compiles as you type, with the live picture behind the text.
  - SAVE writes a JPG or PNG. **There is no video recording.**

## 4. XBImageFilters (`/home/user/research-src/XBImageFilters`)

- **What:** an iOS library (Objective-C, OpenGL ES 2 through GLKit, AVFoundation) that shows an image, the live camera or a video through fragment shaders you supply, in chained passes. Needs Xcode; CocoaPods spec 1.1.2. 76 files, 944 KB, 12 shader files (8 fragment, 4 vertex). Last commit 2014-10-29.
- **Licence:** `LICENSE.txt` is the MIT text, "Copyright (C) 2011 xissburg, http://xissburg.com … Permission is hereby granted, free of charge, to any person obtaining a copy of this software …" (the file stops at "DEALINGS IN"). `README.md`: "This project is under the MIT license". Per-file headers disagree on their face: 27 files, every shader included, say "Copyright (c) 2012 __MyCompanyName__. All rights reserved." (the Xcode template), and four Objective-C files say "Copyright (c) 2012 webWeaving.org. All rights reserved." The shaders are trivial and better rewritten than copied.

| Filter (sample app name) | Look and technique |
|---|---|
| Luminance | Greyscale; weighted sum of RGB |
| Pixelate | Mosaic; UV rounded to a 64-step grid |
| Discretize | Posterize; each channel rounded to 4 levels |
| Spread (`Suck.fsh`) | Edges stretched outwards, the centre left alone; each UV axis scaled by the cosine of its offset from the centre |
| Overlay | A second image laid over with Overlay blending |
| Horizontal Blur, Vertical Blur, Blur | 15-tap Gaussian; tap positions computed in the vertex shader; two passes |
| Blur B&W | Luminance, then the two blur passes |
| Sharpen | Unsharp mask: twice the original minus the blurred copy; the pass also reads the original |
| Discrete Blur | Blur, then posterize: flat cut-paper shapes |

Other features: a high-resolution photo taken through the filter, filtered video saved to a file.

## 5. Where Pocket Camera stands

`/home/user/nj22az.github.io/camera/looks-gl.js` offers 43 Looks: 19 from World, counting Natural, and 24 of the camera's own. Already covered: mono, sepia, negative, posterize, pixel consoles with dithers, halftone, line and edge Looks, Kuwahara-style oil, watercolour, CRT, VHS, tilt-shift, thermal, night vision, a face bulge (Funhouse) and the Twin and Quad mirrors.

The engine runs one "prepare" pass, then one fragment pass per Look between two ping-pong textures. A Look reads one texture: the result so far. It has **no time uniform, no previous-frame buffer, no second texture, no multi-pass blur inside a Look, and no noise texture** (noise is hashed in code). Saves are drawn in tiles, so a Look must depend only on position.

## 6. Effects we do not have yet

F4P is Filters4Processing; XB is XBImageFilters.

| Effect | From | Looks like | Technique | Difficulty | Engine needs |
|---|---|---|---|---|---|
| Kaleidoscope | mIRO Locussolus | Picture folded into mirrored wedges | Polar angle folded with abs/mod | easy | nothing |
| Fisheye / pinch | F4P FisheyePincushion; PhotoCraft Spherize, Pinch | Peephole bulge or pinch of the whole frame | Radial remap | easy | nothing |
| Twirl | PhotoCraft Twirl | Centre wound into a spiral | Rotation falling off with radius | easy | nothing |
| Tiny planet | PhotoCraft Polar Coordinates | Horizon wrapped into a ball | Rectangular to polar map | easy | nothing; a seam to hide |
| Ripple / wave | PhotoCraft Wave, Ripple, ZigZag; mIRO Sine, Rain | Underwater wobble, pond rings | Sum-of-sines UV offset | easy | time, only if it should move |
| Glass blocks | mIRO `uv2gbr`; PhotoCraft Glass | Seen through bathroom glass bricks | Per-cell sine refraction | easy | nothing |
| Melt | mIRO Vibravoid, Chromeo | Picture smeared along its own colours | UV offset read from the pixel's colour | easy; medium if smooth | smooth version: a blurred copy as second input |
| Marble swirl | mIRO Watercolor | Paint-marbling swirls | Iterated sin/cos domain warp | easy | nothing (write our own warp) |
| Prism fringe | F4P BarrelBlurChroma | Rainbow smear at the edges | 12 spectrum-weighted taps along a barrel curve | easy | nothing |
| Solarize / acid bands | PhotoCraft Solarize; mIRO Neu | Tones folded back, poster-acid colour | sin() or mod() of luminance, hue turn | easy | nothing |
| Colour splash | mIRO Accent color | One colour kept, the rest grey | Hue-distance mask | easy | a picked-hue uniform |
| Colour swap | mIRO Replace color | The red jumper turns blue | Hue-distance mask plus hue shift | easy | two colour uniforms |
| 1-bit dither | F4P Dithering, FloydSteinberg | Pure black and white dots, early Mac | Luminance against an 8x8 matrix | easy (ordered); hard (128 taps) | nothing |
| Stained glass | PhotoCraft Crystallize, Stained Glass | Coloured cells with dark leading | Voronoi on a jittered grid | medium | nothing |
| Pointillism | PhotoCraft Pointillize; mIRO Pointilism | Dabs of pure colour on paper | Jittered discs coloured at their centres | medium | nothing |
| Emboss / chrome | PhotoCraft Emboss, Bas Relief, Chrome | Pressed metal or foil | Luminance gradient lit as a height map | easy to medium | nothing |
| Extrude / tiles | PhotoCraft Extrude, Tiles | Picture broken into raised blocks | Per-cell offset with shaded sides | medium | nothing |
| Zoom burst / wind | PhotoCraft Radial Blur, Wind | Streaks towards the centre or sideways | 16 to 24 taps along a direction | easy | nothing |
| Dreamy glow | PhotoCraft Diffuse Glow; XB Blur | Bright haze over highlights | Wide blur of highlights screened back | medium | two-pass blur and the original as second input |
| Goo / cut paper | F4P Metaballs; XB Discrete Blur | Shapes melt into flat blobs | Wide blur then threshold or posterize | medium | two-pass blur |
| Droste | F4P Droste | Picture repeating inside itself | Complex log/exp map | medium | nothing for a still |
| Hall of mirrors | mIRO Gas, Spirallianz | Frame within frame, receding | Previous output scaled behind the new frame | medium | feedback buffer (or a fixed loop for stills) |
| Ghost trails | mIRO Delay, Feedback blur | Movement leaves trails | Mix with the previous frame | easy | feedback buffer; live only |
| Slit collage | mIRO Sevish, Pictures, Workshop | Each frame stamps a shape onto a growing collage | Alpha from a brightness band or random figure | medium | feedback buffer, per-frame random numbers; live only |
| Double exposure | XB Overlay; mIRO Blend with the camera | Two pictures in one | Screen, Overlay or Difference with a second image | easy | second texture |
| Bubbles | mIRO Goldie, Infadels | Picture seen in soap bubbles | Circle inversion about several centres | medium | nothing |
| Quad blend | mIRO EU, Mix 4/4 | The frame's four quarters laid over each other | Four UV samples blended | easy | nothing |
| Lens flare | PhotoCraft Lens Flare | Sun flare across the frame | Rings and streaks along the axis through the centre | medium | a position uniform |
| NTSC composite | F4P NTSC | Analog rainbow fringing | YIQ encode and 83-tap decode | hard | nothing; Old TV and VHS largely cover it |

## 7. Top 12 to write ourselves

1. **Kaleidoscope.** Instant delight on the live camera, one pass, and it continues Twin and Quad.
2. **Fisheye / pinch lens.** The classic toy-camera lens; one slider from bulge to pinch, for the whole frame where Funhouse is for the face.
3. **Twirl.** A photo-booth staple that makes faces funny with a few lines of shader.
4. **Colour splash.** Tap a colour to keep and the rest goes grey: simple to explain, reliably striking.
5. **Tiny planet.** Turns any street or beach into a little globe; one mapping.
6. **Prism fringe.** A rainbow lens look that flatters ordinary photos and stacks well under other Looks.
7. **Solarize / acid bands.** Loud 1960s-poster colour for the Pop family at almost no cost.
8. **Melt.** The picture warps along its own colours, so every photo gives a different, surprising result.
9. **Glass blocks.** Recognisable at once, and it needs no face or subject to work.
10. **Stained glass.** A craft look beside Riso and Woodblock; the dark leading reads well small.
11. **Droste.** The "how did you do that" picture; the still version needs no engine change.
12. **Ghost trails.** The one effect worth a feedback buffer, because the same buffer unlocks hall of mirrors and collage.

Close behind: 1-bit dither, pointillism, emboss.

## 8. Studio capabilities worth adding

Pocket Camera already keeps the original and a recipe (crop, adjust, up to three Looks, stickers, text, frames, makeup, Erase, Remove background). These would add most:

| # | Capability | Learned from | Size | Main technical risk |
|---|---|---|---|---|
| 1 | **Undo and redo for everything.** Today only Erase and Surprise can be undone | PhotoCraft's command history | small to medium | Erase changes the source pixels, so history must hold source revisions; memory on an iPhone |
| 2 | **Paint a Look on or off** (a mask per Look layer) | PhotoCraft's layer masks | medium | The engine binds one texture per pass; a mask is a second sampler and must stay sharp in a tiled 16 MP save |
| 3 | **Look on the subject or the background only**, from the matte Remove background already makes | PhotoCraft's selection-to-mask; its guided-filter edge refinement | small once 2 exists | Halo at hair and soft edges |
| 4 | **Doodle layer**: pen, marker, eraser | PhotoCraft's replayable strokes | medium | Touch conflicts with swipe and pinch; replaying strokes at save size |
| 5 | **Push and pull** (finger warp) | PhotoCraft's Liquify grid | medium | Needs a displacement texture with enough precision; face stickers and makeup must follow the warp |
| 6 | **Tone presets from a curve**, with a histogram | PhotoCraft's Curves, Levels, Gradient Map | small | Keeping it simple: named curves, not a curve editor |
| 7 | **Double exposure and blend modes** for a second photo | PhotoCraft's blend modes; XBImageFilters' Overlay; mIRO's blends | medium | A second full-size source in memory and in the album's storage |
| 8 | **Rotate, straighten and perspective** in Crop | PhotoCraft's Free Transform and Perspective Crop | small to medium | The crop is an axis-aligned rectangle in `crop.js`; Looks, frames, stickers, Erase and the face guide all assume that |

Two smaller ideas from mIRO's interaction: let a finger's position on the picture set two parameters of a Look at once, and let the dice also randomise which control does what.

## Not verified

- No code was run, so every "looks like" comes from reading the shaders and READMEs.
- Shadertoy and the other original sources could not be opened from here. The licences of the Shadertoy originals are taken from the repository's README, and the terms of Callum Hay's, ArKano22's, Victor Li's, Sam Hocevar's and Q_Layer's code are unknown.
- PhotoCraft was cloned at depth 1, so its age and history are not known.
- PhotoCraft's per-filter techniques are given per family; only the modules quoted were read.
- Difficulty ratings are estimates and nothing was prototyped.
- `photocraft/AGENTS.md` was shown automatically while reading that repository. It is that project's contributor guide; it was treated as data and not acted on.
