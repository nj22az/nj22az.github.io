# Swedish narration

The film uses locally generated synthetic Swedish narration from Piper's `sv_SE-nst-medium` voice. The model is not distributed with this website.

- Voice/model card: https://huggingface.co/rhasspy/piper-voices/blob/main/sv/sv_SE/nst/medium/MODEL_CARD
- Training: KBLab, National Library of Sweden.
- Dataset: NST, CC0, according to the voice model card.
- Piper engine: https://github.com/OHF-Voice/piper1-gpl (GPL-3.0).
- Model SHA-256 used for this film: `df011f56825a59dd1efc080c38a65a1ef70407e60f63050e9246f43a3d7e471e`.
- The supplied build script sets `ORT_DISABLE_TELEMETRY=1` before importing the inference runtime. See https://github.com/microsoft/onnxruntime/blob/main/docs/Privacy.md.

Narration is generated from the original Swedish manuscript in `src/content.mjs`. The final audio and timeline are checked in so playback and ordinary rendering require no speech service and no local model download.
