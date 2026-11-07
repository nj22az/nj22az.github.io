# Actor’s desk

Open Edit character → Preview & performance → Actor’s desk, or Build scene → Pose & position → Actor’s desk.

1. Choose a character and body pose. Start camera, look forwards with a relaxed face, then Calibrate. Head, gaze, eyelids, mouth and brows follow you. Adjust sensitivity, smoothing and mirror movement.
2. Optionally start microphone or select a dialogue audio file. Volume drives mouth opening and takes priority over camera mouth movement. This is amplitude lip sync, not phoneme recognition.
3. Name and Record take, then stop within 60 seconds. Manual poses and expression changes can also be recorded without a camera.
4. Replay a take, save it in this browser or Download take (`.actor.json`). Open take reuses it on any character. Takes store no camera images or audio; keep dialogue audio separately.
5. In a scene, select an actor and Use for actor. Assign takes to other actors and Play cast together. Pause or scrub Scene time to capture a picture or comic panel. Download project includes assigned takes.

Twelve takes can be saved in browser storage; download important takes and projects. Non-looping takes hold their last frame. Looping takes blend the final 0.2 seconds into the first frame. Facial capture does not track arms, hands or legs.

Camera access starts only on request, using HTTPS/localhost. Frames are processed in a Web Worker and discarded; only numeric facial parameters reach the page. Microphone input is analysed locally without speaker feedback. Devices stop when leaving a workspace, hiding the page or leaving it. Lost tracking fades to neutral. Manual recording and replay remain available if tracking fails to load.

MediaPipe Tasks Vision 0.10.21 and its WASM runtime load from jsDelivr when camera tracking starts; the Face Landmarker model is bundled locally. Runtime/model: Apache 2.0, see `vendor/MEDIAPIPE-LICENSE`.

`tracking.mjs` is adapted from Yuki Shindo’s `shinshin86/live2d-add-motion-sample-web-ui/web/tracking.js`, MIT, Copyright (c) 2026 Yuki Shindo. Full notice: `TRACKING-LICENSE`. This is a native 3D integration without a Live2D runtime or third-party avatar models.
