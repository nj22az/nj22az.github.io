# British English narration

The English edition uses locally generated synthetic speech from **Kokoro-82M v1.0**, voice **bf_emma**, language `en-gb`, speaking rate `0.96`.

- Model and voice documentation: https://huggingface.co/hexgrad/Kokoro-82M
- Voice list: https://huggingface.co/hexgrad/Kokoro-82M/blob/main/VOICES.md
- Inference package: https://github.com/thewh1teagle/kokoro-onnx (MIT), pinned to `kokoro-onnx==0.4.9`.
- Kokoro model licence: Apache-2.0, according to the model's published documentation.
- Downloaded FP32 export and voice archive: https://github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.1
- Model SHA-256: `beb0d1848dee9a49da392cc3df26958d46cfa35d321edf434f52949153f0df3a`.
- Voice archive SHA-256: `bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d`.

Both downloaded hashes were checked against the release metadata. The model and voice archive are not distributed with the website. Narration is generated from `src/content.mjs`; no manuscript is sent to a speech service.

The generation script sets `ORT_DISABLE_TELEMETRY=1` before importing the runtime. See https://github.com/microsoft/onnxruntime/blob/main/docs/Privacy.md. It preserves the FP32 export's floating-point speed input rather than the integer-speed assumption in kokoro-onnx 0.4.9. SI prefixes are separated for pronunciation: `megohm` is spoken as `mega ohm`, and `kilohm` as `kilo ohm`. Captions retain their standard spelling.

Completed audio, captions and the measured timeline are versioned. Playback and ordinary rendering need neither a model download nor a speech service. The preceding Swedish Piper edition remains recoverable from Git history at commit `86b8357ddb42cc0a7987b483390dd880513909fd`.
