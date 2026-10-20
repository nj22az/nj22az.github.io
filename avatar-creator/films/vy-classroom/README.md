# Vy's classroom — review production

The four saved scenes of `Vy-Classroom-Vietnamese.studio.json` are the source, including Mrs Kubo (the owner's Studio-only adaptation of Miss Higa), Vy's actual recipe, the World classroom builder, paper comic treatment and LỐI RA doorway. The source comic is preserved. No generated replacement imagery, borrowed motion files or imitation voices are used.

## Rebuild

From the website repository root, with `npm ci` already run in `johansson-town` and a Playwright Chromium available:

1. Place the original Vietnamese project at `production/vy-classroom/source.studio.json` and the retained voice takes at `production/vy-classroom/audio/{vy,teacher,scream}.mp3`.
2. `python3 avatar-creator/films/vy-classroom/audio.py` makes the 48 kHz stereo master and amplitude-based facial envelopes (requires NumPy and ffmpeg).
3. `node avatar-creator/films/vy-classroom/render.mjs` makes the frames, measured contacts, motion data and an animated GLB. Set `STUDIO_BROWSER` for an existing Chromium executable. `FILM_CHECKPOINTS=300,304,308` renders selected frames for contact review.
4. `ffmpeg -y -framerate 30 -i production/vy-classroom/frames/%05d.png -i production/vy-classroom/mix.wav -c:v libx264 -preset medium -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -af loudnorm=I=-14:TP=-2:LRA=9 -t 20 -movflags +faststart production/vy-classroom/Vy-Classroom-Review.mp4`.

Review resolution is 540 × 800: the original 3:4 composition occupies 540 × 720 and a separate 80-pixel subtitle area keeps the faces clear. There are exactly 600 frames, 30 fps, 20 seconds, with a final reaction hold. This is a review copy, not an approved final or a published episode.

## Beat and contact plan

| Seconds | Frames | Picture and acting | Sound |
|---|---|---|---|
| 0–3.2 | 0–95 | Original folded slump, eye movement, blink and slow push in | Quiet original ticks |
| 3.2–10 | 96–299 | Exaggerated protest, asymmetrical arm movement and head acting | Vy's two Vietnamese lines; audio amplitude opens the mouth |
| 10–13.2 | 300–395 | Hand brushes actual desk surface, releases before the tumble; desk/chair rotate, hop and settle on geometry-derived floor; imported running clip and authored travel towards the exit | Escape cry, chair scrape, wood clatter and shoes; landing transient one frame after support returns to zero |
| 13.2–20 | 396–599 | Original blouse lift with measured hand constraint, embarrassed Vy and teacher's calm delivery | Teacher's existing Vietnamese line, then a quiet hold |

`timeline.mjs` is the authoritative exact-time choreography. Frames can be requested out of order. Body motion is original sampling of existing World/Studio poses, exported on actual Vy geometry as GLB, then imported and retargeted with PR #297 before the scene plays it. Source dimensions and recipes are retained. The desk is full size in the animated interaction to make its edge reachable and leave the body clear; this does not edit the comic or World classroom.

## Existing film/voice investigation

`nj22az/jojo/remotion/CLAUDE.md`, `src/stage.ts`, `scripts/film-node.mjs`, `voicestudio/studio.py`, and the website's `film-staging.mjs` / `tools/studio/film-pipeline.mjs` were inspected. The existing film engine has exact-time staging, timed dialogue, voice caching, collision and creator-review gates. Studio's current handoff is a clean plate plus camera/cast marks. It explicitly warns that performance takes still need mapping: native GLB clip transfer into that Remotion system is not complete.

The private companion repository could be read through the connected GitHub application, but could not be cloned here (no command-line credentials). Its local Kokoro/VoxCPM environments and models are absent. This review therefore captures frames through the actual Studio workspace and encodes them with ffmpeg, without creating a second character, room or rendering engine. It does **not** claim the Remotion track bridge has been implemented or passed its collision gate. Yukkuri Explainer remains uninstalled.

## Audio provenance

The retained review takes were generated via the connected Runway service with preset Rachel for Vy and Miriam for Mrs Kubo, Vietnamese pronunciation requested. They are synthetic fictional performances, without cloning a real child or any supplied person's recording. Task IDs:

- Vy protest: `5f071cd8-0ec1-4840-a317-b8c8781e9a0a`.
- Mrs Kubo: `fa609e6b-3b11-4c1e-8923-f27a2012ecca`.
- Escape cry: `d2cd6981-66fd-4802-802e-48f36f1b8edd`.

Runway's official usage-rights page (checked 21 October 2026) permits commercial use of content generated through its service and does not require attribution: https://help.runwayml.com/hc/en-us/articles/18927776141715-Usage-rights . This is the service used for these takes; it is not a claim about a separate direct ElevenLabs free account. All foley is original seeded synthesis in `audio.py`; no commercial music, sample recording or AquesTalk component was added. Existing original-asset copyright and Three.js/tracking notices remain intact.

## Limits and approval

- The facial curves are hand-directed eyes/brows/head movement with audio-envelope mouth opening, not phoneme or viseme lip-sync. The young voice's perceived age and Vietnamese delivery need creator review.
- Shoe height is corrected from the real sole geometry. This is not horizontal foot locking, automatic motion generation or a general collision solver. Desk contact is a staged triangle-surface constraint and floor support is derived from prop bounds; these do not certify every body/cloth triangle collision.
- The existing blouse grip is a hand-target constraint, not simulated cloth. The cut to the final panel preserves the comic's payoff; the teacher does not perform a continuous simulated catch.
- This preview uses software WebGL. No physical iPad/iPhone or GPU-quality final render is claimed.
- Preserve the creator's storyboard/casting/animatic/video approvals. No approval is recorded on their behalf, and no film is published.
