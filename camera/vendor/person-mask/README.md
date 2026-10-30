# Local person-mask dependency

Chosen on 30 October 2026, before integration: MediaPipe Tasks Vision **0.10.21**, CPU delegate in a dedicated classic
worker, with Selfie Segmenter **float16 / version 1** (256 × 256 model input). All four assets are served from this
site; there is no CDN request or photo upload. The bundle is unchanged; `vision_bundle.cjs` is renamed `.js` so static
hosts serve it as JavaScript. `LICENSE` is upstream MediaPipe v0.10.21's complete licence and bundled notices.

Sources:

- Runtime: <https://registry.npmjs.org/@mediapipe/tasks-vision/-/tasks-vision-0.10.21.tgz>, package declares Apache-2.0.
- Licence/notices: <https://github.com/google-ai-edge/mediapipe/blob/v0.10.21/LICENSE>.
- Model: <https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/1/selfie_segmenter.tflite>.
- Model card (Apache-2.0, page 1; limitations on page 2): <https://storage.googleapis.com/mediapipe-assets/Model%20Card%20MediaPipe%20Selfie%20Segmentation.pdf>.
- Pipeline benchmarks and alternatives: <https://ai.google.dev/edge/mediapipe/solutions/vision/image_segmenter>.
- Worker requirement (segment blocks its calling thread): <https://ai.google.dev/edge/mediapipe/solutions/vision/image_segmenter/web_js>.

| Asset | Bytes | SHA-256 |
|---|---:|---|
| selfie_segmenter.tflite | 249537 | 191ac9529ae506ee0beefa6b2c945a172dab9d07d1e802a290a4e4038226658b |
| vision_bundle.js | 137890 | bf58c9b3f592304422947b51e1f7de360c67d4dfeaa900064352da0c5a7c9115 |
| vision_wasm_internal.js | 204284 | 4a97e2520ba506c680ecd6ba6acfb146888afa0e2746d57f205352bc6ebb82eb |
| vision_wasm_internal.wasm | 9574032 | f00ec4731faa23b3e714d00e88d4d10e2df5c0a427d3a2b4ae6e3526fdd14ef7 |

Total **10,165,743 bytes**, or **3,200,243 bytes** under local gzip (an estimate, not a measured hosting transfer).
Loaded only on the first still-photo recipe that needs a person contour, then cached by the existing offline worker.
Only the SIMD runtime is included; devices without the required Wasm/OffscreenCanvas support keep the normal Look.
No inference runs on the live viewfinder. A saved shutter photo is segmented after freezing it, and the editor's
mask is re-used for adjustments/Looks, replaced after Erase, and regenerated when re-editing an album original.
A changed image invalidates its old mask immediately. A failure/15-second timeout keeps the ordinary Look.

Why this model: the official Pixel 6 pipeline benchmark is 33.46 ms CPU, against 217.76 ms for multiclass and
123.93 ms for DeepLab-v3. Neither that benchmark nor this cloud's measurements prove iPhone performance. The
prototype measured 23–52 ms after startup across six photos at 256 px width (some upright inputs were 341 px tall);
the integrated worker caps **either side at 256 px**, transfers buffers, and runs one inference at a time.
The focused cloud browser check measured about 619 ms cold including runtime/model start. No phone memory,
energy, warm inference, thermal or frame-rate measurements are claimed.

Quality boundary: this is a close-person model, not precise matting. It can lose fingers, hat brims and occluded
parts, join neighbouring objects, or miss distant people, especially in poor light. Components below 5% of the
picture and components without 75% confident interior pixels are removed. A soft model edge is cleaned
and lightly blurred, then each medium inks its .5 boundary. This improves separation but does not locate a jaw or
nose inside the person, and is not sufficient for hair highlight cuts. Live masks are deferred until phone costs and
motion alignment can be checked; never put an old asynchronous mask over a newer video frame.
