#!/usr/bin/env python3
"""Pocket Camera's stickers: the die-cut sticker sheets of the studio repo (nj22az/jojo, art/stickers/), made light
enough for the web. Every sticker of every set becomes a 1024 px WebP to place on a photo and a 256 px one for the
picker, with its lettering's English gloss for its label, in camera/stickers/ and its manifest stickers.json.

    python3 tools/build-camera-stickers.py ../jojo

The stickers are drawn and lettered in the studio (art/stickers/README.md); nothing about them is changed here, only
their size. Run it again after the studio adds or re-cuts a sticker; the manifest records the commit it came from.
"""
import json
import subprocess
import sys
from pathlib import Path

from PIL import Image

SETS = [  # (folder in art/stickers, name in the picker)
    ('thuan', 'Thuan'),
    ('fuji', 'Fuji'),
    ('thuan-nils', 'Thuan & Nils'),
]
PLACE, THUMB = 1024, 256
OUT = Path(__file__).resolve().parent.parent / 'camera' / 'stickers'


def webp(image, side, path):
    copy = image.copy()
    copy.thumbnail((side, side), Image.LANCZOS)
    copy.save(path, 'WEBP', quality=82, method=6)
    return copy.size


def main(studio):
    root = Path(studio) / 'art' / 'stickers'
    commit = subprocess.run(['git', '-C', str(studio), 'rev-parse', '--short', 'HEAD'], capture_output=True, text=True).stdout.strip()
    manifest = {'source': f'nj22az/jojo art/stickers at {commit or "unknown"}', 'sets': []}
    for folder, name in SETS:
        data = json.loads((root / folder / 'stickers.json').read_text(encoding='utf-8'))
        (OUT / folder).mkdir(parents=True, exist_ok=True)
        entries = []
        for sticker in data['stickers']:
            key = sticker.get('id') or sticker['pose']
            png = root / folder / 'out' / f'{key}.png'
            if not png.exists():
                sys.exit(f'{png} is missing: compose the set in the studio first')
            image = Image.open(png).convert('RGBA')
            image = image.crop(image.getchannel('A').getbbox())
            width, height = webp(image, PLACE, OUT / folder / f'{key}.webp')
            webp(image, THUMB, OUT / folder / f'{key}.thumb.webp')
            entries.append({'id': f'{folder}/{key}', 'src': f'{folder}/{key}.webp', 'thumb': f'{folder}/{key}.thumb.webp',
                            'width': width, 'height': height, 'line': sticker.get('line', ''), 'gloss': sticker.get('gloss', '')})
        manifest['sets'].append({'id': folder, 'name': name, 'stickers': entries})
        print(f'{name}: {len(entries)} stickers')
    (OUT / 'stickers.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
