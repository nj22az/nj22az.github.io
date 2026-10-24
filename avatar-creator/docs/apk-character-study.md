# Johansson Studio: character-system study and first enhancements

10 October 2026. Reference APK: `com.nintendo.zaaa`, supplied as version 2.2.2 build 98600 (Miitomo).

## Scope and method

Inspected the supplied archive locally, inventoried assets and exported native symbols, and used Ghidra 11.0.3 headless with Java 17 to import the ARM ELF library and decompile selected AFL routines. This is a focused character-system study, not a complete reconstruction of the game. No Nintendo meshes, textures, shaders or implementation code were added to Johansson Studio.

APK SHA-256: `93522419922627db5480936fcc07e48838b7a0a4f879a99c288375d3908edebe`.

The APK contains 2,760 entries, a 7,386,160-byte `classes.dex`, and a 28,762,892-byte ARMv7 `libcocos2dcpp.so`. Native AFL routines, shader sources and camera/expression configuration provide substantially more relevant evidence than the Android wrapper.

Ghidra's initial whole-library analysis reached its 120-second limit. Selected decompilation was then run separately. Some unrelated functions have disassembly warnings. The expression setter still has a bad-instruction warning; its complete control flow is therefore not treated as established. The small beard/glasses accessors and material initialisers below produced useful, readable results. Ghidra loaded the library at a base of 0x10000; addresses below include that base.

## Findings and application

| Evidence in supplied APK | Established finding | Application to Johansson Studio |
| --- | --- | --- |
| `AFLiGetDrawParamOpaBeardFromCharModel` at `0x01174f6c` | Returns a separate draw-parameter block at model + 0x148. | Beard volume belongs in dedicated geometry, attached to the head. |
| `AFLiGetDrawParamXluGlassFromCharModel` at `0x011750d0` | Checks an enable field and returns a different draw block, at model + 0x788, or zero. | Glasses need their own renderable objects and explicit visibility control. |
| `AFLiInitModulateShapeBeard` at `0x0117b458` | Sets a shape material and obtains its hair colour independently of a face texture. | Use separate hair-coloured material for the beard mesh. |
| `AFLiInitModulateFaceBeard` at `0x0117b420`, `AFLiInitModulateMustache` at `0x0117b2d8` | Both configure colour and a supplied texture; they differ from the beard-shape path. | A hybrid approach is appropriate: subtle stubble shading, with physical volume for longer facial hair. |
| `AFLiInitModulateShapeGlass` at `0x0117b538` | Has a separate modulation mode, glass colour and supplied texture. | Separate frame geometry and lenses; review from the side and under different light. |
| `AFLiGetShapeResourceNum`, `AFLiGetTextureResourceNum` | Use separate, indexed resource tables. | Keep original part geometry, face artwork and material presets as separate catalogues. |
| `AFLiVerifyCharInfoWithReason` at `0x011736a0` | Performs per-field bounds checks and returns distinct validation reasons. | Keep recipe normalisation; add migration and validation whenever expanding transforms. Numeric field identities cannot all be established from bounds alone. |
| `assets/userData/afl_expression_data.xml` | Lists 71 numeric mappings, 0–70. | Separate saved identity from temporary expression state. This does not establish 71 distinct user-facing expressions. |
| `ch_mii_camera.xml`, `closet_camera.xml` | Define camera aim, clipping, field of view and detail/zoom settings. | Give users reliable face, full-body and profile views. |
| `MiiDefaultShader.fsh` and material LUT filenames | Shader includes diffuse, specular and anisotropic calculations; LUTs include hair, skin and metal variants. | Use differentiated original skin, hair, frame and lens materials; provide neutral and side-light inspection. |

## Implemented first pass

- A Preview menu available while editing faces on desktop, tablet and phone.
- Front, three-quarter, left profile, right profile and back views.
- Automatic, face-detail and full-body framing.
- Warm, neutral-studio and side lighting.
- The existing expression and pose catalogues are available through the Preview menu, including on phones.
- Reset feature restores only the selected category's controls to the last loaded template/design. It is one undoable edit and preserves the character's name and other categories.
- Template selects have 44-pixel touch targets. Closed dropdown contents are explicitly hidden.
- A compact landscape layout reserves usable space for choices and the palette.

Johansson and Thuận remain the starting templates. Design JSON and shared-link formats are unchanged. Preview choices do not modify the saved recipe. PNG output remains a full-body transparent image and uses the preview's current orientation and lighting.

## Next rendering milestone

Current main now includes original glasses and facial-hair objects (PR #169); this enhancement branch integrates them. Refine their rims, bridge, hinges, temple arms and lens materials. Fit glasses to the nose bridge and ear line across head forms. For facial hair, use scalp/head-attached volumes for beards and moustaches and restrained surface shading for stubble. Inspect all of these in front/profile views, with side light and changing expressions. The integrated objects pass geometry, fitting-control, head-attachment and resource-disposal checks; more visual refinement remains.

Follow with real 3D part thumbnails, material controls, and the missing nose-width/mouth-rotation transforms through an explicit recipe migration. The APK itself does not provide evidence that its complete downloadable wardrobe or all character resources are present in this archive; avoid treating the local inventory as the full game catalogue.

## Validation

27 focused character, feature, expression, normalisation and drag-position checks passed; six further checks cover the integrated 3D accessories and rebuilt runtime. Production runtime rebuilt with Vite. Browser acceptance covers saved designs, template preservation, undo after feature reset, preview controls, expression access, storage isolation, PNG pixels, JSON import and responsive layout. All six viewport checks passed at 1280×800, 820×1180, 768×1024, 844×390, 390×844 and 320×568. Publication is authorised through GitHub. Studio is the refinement environment; shared avatar code and the rebuilt town runtime carry accepted changes into the game.
