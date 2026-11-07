# Animation and film direction for Claude and Codex

Owner-provided reference: **Opus 5.5 promt.pdf**, the five-page *Tap. Tock. Stop.* / *Chain Reaction* prompt pack, supplied 20 October 2026. These are adapted working instructions, not a claim that this repository has already achieved the reference's render or sound measurements. Apply them when building character performances, animated scenes, films and their rendering tools. They do not mandate an expensive film-rendering path for the interactive game or editor.

## Start with a concrete film brief

Use these seven blocks for each film or substantial animated sequence:

1. **BRAND:** name the real cast, their current Studio recipes, props, location, materials and colour references. Use Johansson World's established characters and sets. Do not replace them with the reference's voxel mascot, copy its sample story, or introduce another character system.
2. **FORMAT:** state duration, aspect ratio, resolution, frame rate and whether the ending holds or loops. For a standalone film, the reference baseline is 1920 x 1080, 16:9, 60 fps; choose a different format when the task requires it. Use the existing project architecture. A single HTML file and a particular Three.js CDN version are reference-delivery choices, not requirements to duplicate the engine or downgrade its dependencies.
3. **LOOK:** define the key, fill, rim, contact shadows, material response and the limited purpose of any depth of field, bloom, grain or vignette. Preserve the established cartoon style and readable faces. Measure important colours in rendered frames rather than trusting material hex values alone.
4. **BEATS:** make a table of times and frame numbers, visible actions, emotional changes, prop contacts, camera intentions and corresponding sound events. Give the audience time to read the setup, reaction and payoff. Hold an ending long enough to understand it.
5. **MOTION:** use anticipation, eyes leading an action by roughly 6-10 frames where appropriate, weight, controlled squash, overshoot and settling. A transferred clip is raw material: adapt it to the character's proportions, props and floor contacts. Do not accept floating, clipping or sliding as finished acting.
6. **CAMERA:** give every move a storytelling purpose. Preserve clear silhouettes, eyes, mouths and necessary props. Check the whole character stays inside the intended margins. Use a continuous move only when it makes the story clearer; do not require it for every film.
7. **CHECKS:** write observable acceptance criteria before implementation: readable action, contact timing, framing, colour tolerances, continuity, clipping, duration, frame count and audio quality. State what was actually checked.

## One reproducible timeline

- Film rendering must support `renderAt(t)` or an equivalent exact-time API. Seeking to a time must give the same picture regardless of previous playback, frame rate or the order in which times were requested.
- Use seeded randomness. Bake simulations/contact events once when practical; render from the resulting data rather than advancing live physics during frame capture. Reset or bake springs, particles and secondary motion as necessary.
- Picture, character motion, camera and sound share the same authoritative timeline. Derive seconds and frame numbers from its frame rate. Distinguish 1080 encoded frames for an 18-second, 60-fps film from an optional endpoint still at frame 1080; do not accidentally encode an extra frame.
- Interacting props must visibly contact before causing the next action. Determine rest positions from geometry, not independent angles that let objects pass through each other.
- For tightly timed stylised impacts, the reference target is an audible hit peak about one frame after contact. Check the encoded output: compressor lookahead and codec delay may require compensation. This is a sound-design target, not an excuse to offset all dialogue.

## Review, measure, then refine

- Inspect the opening frame, each principal beat, the final hold and at least five neighbouring frames around important contacts or transitions. Make a contact sheet and watch a moving draft; isolated attractive stills are insufficient.
- Review face visibility during turns, complete framing, prop readability, shadow acne, detached shadows, pitch-black materials, continuity and camera obstructions. Check contact and overlap over the complete sequence where automation is practical.
- Give revision notes with exact times/frame numbers, the visible defect and the desired observable result. Fix the cause, then re-render the affected beats and watch the sequence again.
- Keep palette-critical faces/materials clear of unwanted coloured reflections. Use a neutral key or suitable roughness where needed; record measured pixel tolerance when colour matching is an acceptance criterion.
- Do not blindly impose the reference's 4096 shadow map or fixed penumbra on every device. Fit shadow cameras, tune bias and choose detail for the actual scene and renderer. Keep offline quality settings separate from interactive budgets.

## Offline final rendering

- Capture frames deterministically, preferably on an available GPU. Report when the environment cannot perform a real GPU or physical-device check.
- When supported by the renderer and render budget, use 2x spatial supersampling and multiple shutter/subpixel samples accumulated in linear light; the reference uses 12 samples, 16 during fast movement, across a 0.45-frame shutter. These are starting values, not evidence of work performed or mandatory costs for previews.
- Apply colour transforms in a defined order; avoid double tone mapping. Downsample correctly, and add grain/dither only when the brief calls for it. Render long work in resumable, verified chunks.
- For a high-quality 1080p/60 delivery, the reference starting point is H.264 High, CRF 14, slow preset, BT.709, with AAC 192 kb/s. Choose settings appropriate to the destination and verify duration, frame count, timestamps, missing/duplicate frames and final playback. Deliberately held frames are valid and must not be rejected merely because a duplicate detector finds them.

## Sound

- Build the sound plan from the picture's event table. Match the material and scale of each contact. Use restrained, seeded variation; place/pan effects consistently with the image and avoid turning rapid contacts into a harsh buzz.
- Use the task's authorised dialogue and voices. The reference's silent/no-words brief belongs to that example and does not ban dialogue in Johansson films.
- Original procedural effects can use Web Audio / `OfflineAudioContext`; preserve dependency notices and the rights of any separately sourced audio or voices.
- For a comparable web film, begin with 48 kHz stereo, approximately -14 LUFS integrated and true peak below -2 dBTP, with modest limiting (the reference ceiling is 3 dB gain reduction). Adapt to the destination specification. Measure the encoded AAC as well as the master; report actual results, never substitute the reference's numbers.
- Solve excessive peaks in the mix first: rebalance transients/music, soften attacks and use appropriate compression before mastering. Preserve intentional silence and reaction pauses.

## Ownership and reporting

Use original Johansson work or appropriately licensed dependencies and assets. Rewording or rewriting restricted code, a model, a recording or an asset does not remove its licence conditions. Do not label an entire application commercially cleared merely because one new component is original.

Finish with the delivered behaviour, validation actually performed, remaining limitations and the review link. Never claim an unrendered example, unmeasured colour, untested rig, unfinished capture feature or unverified audio result as complete.
