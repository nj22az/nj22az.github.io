#!/usr/bin/env python3
"""Optional single-user FLUX.2 Klein image server for Pocket Camera.

Run only on a machine whose operator has chosen to download and run the model.
Local by default; this is not a complete public hosting or payment service.
"""
from __future__ import annotations
import base64
import binascii
import hmac
import io
import ipaddress
import json
import os
import re
import secrets
import sys
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit

MODEL = 'black-forest-labs/FLUX.2-klein-4B'
MAX_BODY = 12 * 1024 * 1024
MAX_IMAGE_BYTES = 8 * 1024 * 1024
MAX_IMAGE_PIXELS = 16_000_000
DEFAULT_ORIGINS = 'https://nj22az.github.io,http://localhost:8000,http://127.0.0.1:8000'
DATA_URI = re.compile(r'^data:image/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$', re.ASCII)


class BadRequest(ValueError):
    pass


def validate(payload):
    if not isinstance(payload, dict):
        raise BadRequest('Request must be a JSON object.')
    if set(payload) - {'prompt', 'width', 'height', 'seed', 'image'}:
        raise BadRequest('Unexpected request field.')
    prompt = payload.get('prompt')
    if not isinstance(prompt, str) or not prompt.strip() or len(prompt) > 1500:
        raise BadRequest('Prompt must contain 1–1500 characters.')
    dimensions = []
    for key in ('width', 'height'):
        v = payload.get(key, 512)
        if type(v) is not int or not 256 <= v <= 1024 or v % 32:
            raise BadRequest('Width and height must be multiples of 32 between 256 and 1024.')
        dimensions.append(v)
    seed = payload.get('seed')
    if seed is not None and (type(seed) is not int or not 0 <= seed < 2**32):
        raise BadRequest('Seed must be an integer between 0 and 4294967295.')
    img = None
    if 'image' in payload and payload['image'] is not None:
        value = payload['image']
        if not isinstance(value, str) or len(value) > MAX_IMAGE_BYTES * 4 // 3 + 128:
            raise BadRequest('Reference image exceeds the size limit.')
        match = DATA_URI.fullmatch(value)
        if not match:
            raise BadRequest('Reference must be a PNG, JPEG or WebP data URL.')
        try:
            data = base64.b64decode(match.group(2), validate=True)
        except (binascii.Error, ValueError):
            raise BadRequest('Reference image is not valid base64.') from None
        if not data or len(data) > MAX_IMAGE_BYTES:
            raise BadRequest('Reference image exceeds the size limit.')
        try:
            from PIL import Image, ImageOps, UnidentifiedImageError
            Image.MAX_IMAGE_PIXELS = MAX_IMAGE_PIXELS
            with Image.open(io.BytesIO(data)) as source:
                if source.format not in ('PNG', 'JPEG', 'WEBP') or source.width * source.height > MAX_IMAGE_PIXELS:
                    raise BadRequest('Reference image is too large or has an unsupported format.')
                source.load()
                img = ImageOps.exif_transpose(source).convert('RGB')
                img.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
        except BadRequest:
            raise
        except (UnidentifiedImageError, OSError, ValueError, Image.DecompressionBombError):
            raise BadRequest('Reference image could not be read.') from None
    return {'prompt': prompt.strip(), 'width': dimensions[0], 'height': dimensions[1],
            'seed': seed if seed is not None else secrets.randbits(32), 'image': img}


class KleinEngine:
    """Load lazily; avoid downloading multi-GB model weights until the first request."""
    def __init__(self):
        self.pipe = None
        self.torch = None
        self.device = None

    @property
    def ready(self):
        return self.pipe is not None

    def _load(self):
        import torch
        from diffusers import Flux2KleinPipeline
        selected = os.getenv('POCKET_DEVICE', 'auto').lower()
        if selected == 'auto':
            selected = 'mps' if torch.backends.mps.is_available() else 'cuda' if torch.cuda.is_available() else 'cpu'
        if selected not in ('cpu', 'mps', 'cuda'):
            raise RuntimeError('POCKET_DEVICE must be auto, cpu, mps or cuda')
        if selected == 'mps' and not torch.backends.mps.is_available():
            raise RuntimeError('MPS is not available on this machine')
        if selected == 'cuda' and not torch.cuda.is_available():
            raise RuntimeError('CUDA is not available on this machine')
        dtype = torch.float32 if selected == 'cpu' else torch.float16
        pipe = Flux2KleinPipeline.from_pretrained(MODEL, torch_dtype=dtype)
        pipe = pipe.to(selected)
        if selected == 'mps':
            pipe.enable_attention_slicing()
        self.pipe, self.torch, self.device = pipe, torch, selected

    def generate(self, request):
        if self.pipe is None:
            self._load()
        # A CPU RNG is accepted by diffusers for reproducible noise on CPU/MPS/CUDA.
        rng = self.torch.Generator(device='cpu').manual_seed(request['seed'])
        args = dict(prompt=request['prompt'], width=request['width'], height=request['height'],
                    num_inference_steps=4, guidance_scale=1.0, generator=rng)
        if request['image'] is not None:
            args['image'] = request['image']
        with self.torch.inference_mode():
            result = self.pipe(**args).images[0]
        buf = io.BytesIO()
        result.save(buf, format='PNG')
        return buf.getvalue()


class Config:
    def __init__(self, engine=None, token=None, origins=None):
        self.engine = engine or KleinEngine()
        self.token = token if token is not None else os.getenv('POCKET_IMAGE_TOKEN', '')
        raw_origins = os.getenv('POCKET_IMAGE_ORIGINS', DEFAULT_ORIGINS)
        self.origins = set(origins if origins is not None else (x.strip() for x in raw_origins.split(',') if x.strip()))
        if '*' in self.origins:
            raise ValueError('Wildcard CORS origins are not allowed')
        self.lock = threading.Lock()


def make_handler(config):
    class Handler(BaseHTTPRequestHandler):
        server_version = 'PocketImage/1'
        # The prompt, generated images and token are deliberately never logged.
        def log_message(self, fmt, *args):
            return

        def origin_allowed(self):
            origin = self.headers.get('Origin')
            return not origin or origin in config.origins

        def cors(self):
            origin = self.headers.get('Origin')
            if origin and origin in config.origins:
                self.send_header('Access-Control-Allow-Origin', origin)
                self.send_header('Vary', 'Origin')
                self.send_header('Access-Control-Allow-Headers', 'Authorization, Content-Type')
                self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                self.send_header('Access-Control-Max-Age', '600')
                if self.headers.get('Access-Control-Request-Private-Network', '').lower() == 'true':
                    self.send_header('Access-Control-Allow-Private-Network', 'true')

        def send(self, status, data, content_type='application/json; charset=utf-8'):
            if not isinstance(data, bytes):
                data = json.dumps(data, ensure_ascii=False).encode('utf-8')
            self.send_response(status)
            self.cors()
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Length', str(len(data)))
            self.send_header('Cache-Control', 'no-store')
            self.send_header('X-Content-Type-Options', 'nosniff')
            self.end_headers()
            self.wfile.write(data)

        def error(self, code, message):
            self.send(code, {'error': message})

        def authorized(self):
            if not config.token:
                return True
            value = self.headers.get('Authorization', '')
            return hmac.compare_digest(value, 'Bearer ' + config.token)

        def check(self):
            if not self.origin_allowed():
                self.error(403, 'Origin is not allowed.'); return False
            if not self.authorized():
                self.error(401, 'The server access token is missing or incorrect.'); return False
            return True

        def do_OPTIONS(self):
            if not self.origin_allowed():
                self.error(403, 'Origin is not allowed.'); return
            self.send_response(204); self.cors(); self.send_header('Content-Length', '0'); self.end_headers()

        def do_GET(self):
            if not self.check(): return
            if urlsplit(self.path).path != '/v1/health':
                self.error(404, 'Not found.'); return
            self.send(200, {'ok': True, 'model': 'FLUX.2-klein-4B', 'ready': config.engine.ready})

        def do_POST(self):
            if not self.check(): return
            if urlsplit(self.path).path != '/v1/generate':
                self.error(404, 'Not found.'); return
            if self.headers.get('Content-Type', '').split(';')[0].strip().lower() != 'application/json':
                self.error(415, 'Use application/json.'); return
            try:
                n = int(self.headers.get('Content-Length', '-1'))
                if n < 0: raise ValueError()
            except ValueError:
                self.error(411, 'Content-Length is required.'); return
            if n > MAX_BODY:
                self.error(413, 'Request is too large.'); return
            try:
                raw = self.rfile.read(n)
                if len(raw) != n: raise BadRequest('Incomplete request.')
                request = validate(json.loads(raw))
            except (json.JSONDecodeError, UnicodeDecodeError):
                self.error(400, 'Invalid JSON.'); return
            except BadRequest as exc:
                self.error(400, str(exc)); return
            if not config.lock.acquire(blocking=False):
                self.error(429, 'Generator is busy. Try again when the current image is finished.'); return
            try:
                try:
                    data = config.engine.generate(request)
                except Exception as exc:
                    print(f'Generation failed ({type(exc).__name__}). Check model dependencies and available memory.', file=sys.stderr)
                    self.error(503, 'Model could not load or generate. Check the server console and available memory.'); return
                self.send(200, data, 'image/png')
            finally:
                config.lock.release()

    return Handler


def is_loopback(host):
    if host.lower() == 'localhost': return True
    try: return ipaddress.ip_address(host).is_loopback
    except ValueError: return False


def main():
    host = os.getenv('POCKET_IMAGE_HOST', '127.0.0.1')
    port = int(os.getenv('POCKET_IMAGE_PORT', '7861'))
    config = Config()
    if not is_loopback(host) and not config.token:
        raise SystemExit('A POCKET_IMAGE_TOKEN is required when binding beyond localhost.')
    if config.token and len(config.token) < 24:
        raise SystemExit('POCKET_IMAGE_TOKEN must contain at least 24 characters.')
    server = ThreadingHTTPServer((host, port), make_handler(config))
    print(f'Pocket Image listening on http://{host}:{port}. Model loads on first generation.', flush=True)
    try: server.serve_forever()
    except KeyboardInterrupt: pass
    finally: server.server_close()


if __name__ == '__main__': main()
