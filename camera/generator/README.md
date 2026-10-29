# Pocket Camera: optional local image generator

This server lets Pocket Camera send a text prompt, optionally with a reference photo, to FLUX.2 [klein] 4B running on **your own computer**. The website is static and does not itself include or host an image model. There is no subscription or paid API in this setup. First generation downloads the open weights and may take a long time; generation uses your computer's power and memory. Generated pictures are returned to the browser, and this server does not save prompts, references or output images to files.

## Model and hardware

The official [FLUX.2 Klein 4B model card](https://huggingface.co/black-forest-labs/FLUX.2-klein-4B) lists text generation, reference-image editing and Apache 2.0 licensing. Its own hardware estimate is around 13 GB GPU memory, before allowing for the operating system and other processes. The full-precision model plus text encoder is several gigabytes. Leave substantial free disk space for model files and dependencies.

**A 16 GB M1 Pro has not been tested here.** It may run slowly, swap heavily or run out of memory; using `mps` is an attempt, not a guarantee. The server uses float16 for MPS/CUDA and float32 on CPU. Close other applications and begin with 512 × 512. If it cannot load, stop and consider a tested quantised Apple Silicon runtime or a larger computer. No weights were downloaded and no actual generation was tested during implementation.

## Start on a Mac

Use an Apple Silicon Python installation and work in a copy of this repository. The model's download requires network access to Hugging Face. Dependencies are installed only when you run these commands:

```bash
cd /path/to/nj22az.github.io
python3 -m venv .venv-pocket-image
source .venv-pocket-image/bin/activate
python -m pip install --upgrade pip
python -m pip install -r camera/generator/requirements.txt
python camera/generator/server.py
```

The server defaults to `http://127.0.0.1:7861` and automatically selects MPS if available, CUDA otherwise, then CPU. `POCKET_DEVICE=mps`, `POCKET_DEVICE=cuda`, or `POCKET_DEVICE=cpu` forces a particular device. Leave the terminal running and, in Pocket Camera, enter `http://127.0.0.1:7861` as the image server when using a browser **on that same Mac**. Browser security and local-network rules vary; test the actual browser. A first request loads the model, so the initial response can take several minutes or fail if memory is insufficient.

`127.0.0.1` on an iPhone means the iPhone itself, not your Mac. For the phone or other people to connect, a separately configured **HTTPS** endpoint is needed. The current server has no TLS and is private by default. A network-facing instance requires `POCKET_IMAGE_TOKEN` of at least 24 characters, `POCKET_IMAGE_HOST` set to the desired interface, a correctly configured TLS reverse proxy, and an explicit `POCKET_IMAGE_ORIGINS` comma-separated list; do not expose the unencrypted server directly to the internet. The default allowed origins are `https://nj22az.github.io`, `http://localhost:8000`, and `http://127.0.0.1:8000`. Sharing a bearer token with visitors gives them access to your machine, so this personal server is **not** a public production service: it has no user accounts, billing, usage limits, abuse management or hardened internet deployment.

## HTTP contract

- `GET /v1/health` returns `{"ok":true,"model":"FLUX.2-klein-4B","ready":false}` until model loading completes. `ready:false` means reachable but not yet loaded.
- `POST /v1/generate`, JSON: `{"prompt":"...","width":512,"height":512,"seed":123,"image":"data:image/png;base64,..."}`. Only `prompt` is required; seed and reference image are optional. Dimensions must be multiples of 32 between 256 and 1024. References are PNG, JPEG or WebP, up to 8 MiB and 16 megapixels; they are scaled down to at most 1024 px on the long side. Outputs are `image/png` bytes.
- If the server has `POCKET_IMAGE_TOKEN`, include `Authorization: Bearer <token>` on GET and POST. CORS preflight is unauthenticated but restricted by origin. Errors are JSON `{ "error": "..." }`, and concurrent requests receive 429. A connected browser sends prompts and any chosen photo to the configured server, so only connect to a server you trust.

Run the contract tests without model weights:

```bash
python camera/tests/image-backend.test.py
```

Those tests use a fake engine. They do not validate model generation, memory consumption or physical-device behaviour.
