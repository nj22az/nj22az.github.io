#!/usr/bin/env python3
"""Pocket Camera's stickers: the die-cut sticker sheets of the studio repo (nj22az/jojo, art/stickers/), made light
enough for the web. Every sticker of every set becomes a 1024 px WebP to place on a photo and a 256 px one for the
picker, in camera/stickers/ and its manifest stickers.json.

    python3 tools/build-camera-stickers.py ../jojo

The camera's stickers are the figures alone, without their lettering (the owner, 29 October 2026: "Make the stickers
without text and we can add any text as another sticker"): the studio cuts them with `compose.py … --plain` into each
set's `plain/` folder (art/stickers/README.md). Each keeps its line and its English gloss in the manifest, for its label
and for the speech balloon the camera offers with those words. Nothing about the art is changed here, only its size.
Run it again after the studio adds or re-cuts a sticker; the manifest records the commit it came from.
"""
import json
import subprocess
import sys
from pathlib import Path

from PIL import Image

SETS = [  # (folder in art/stickers, name in the picker, who they are: "What does Thuan say?")
    # The camera's cast is Johansson, Thuan and Thao (the owner, 29 October 2026: "Remove Fujita he is not important
    # for the camera app", "Use Johansson , Thuan and Thao"), first in their 3D bodies.
    ('thuan-pixar', 'Thuan', 'Thuan'),         # her Pixar body in World (the owner: "Bring Pixar Thuan too")
    ('johansson-pixar', 'Johansson', 'Johansson'),
    ('thao-pixar', 'Thao', 'Thao'),
    ('thuan', 'Cartoon Thuan', 'Thuan'),       # her cartoon of 19 October, with the same poses and lines
    ('thuan-nils', 'Thuan & Nils', ''),
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
    manifest = {'source': f'nj22az/jojo art/stickers/*/plain at {commit or "unknown"}', 'lettered': False, 'sets': []}
    for folder, name, who in SETS:
        data = json.loads((root / folder / 'stickers.json').read_text(encoding='utf-8'))
        (OUT / folder).mkdir(parents=True, exist_ok=True)
        entries = []
        for sticker in data['stickers']:
            key = sticker.get('id') or sticker['pose']
            png = root / folder / 'plain' / f'{key}.png'
            if not png.exists():
                sys.exit(f'{png} is missing: cut the set without lettering in the studio first (compose.py … --plain)')
            image = Image.open(png).convert('RGBA')
            image = image.crop(image.getchannel('A').getbbox())
            width, height = webp(image, PLACE, OUT / folder / f'{key}.webp')
            webp(image, THUMB, OUT / folder / f'{key}.thumb.webp')
            # The studio's commit on each picture's address, so a browser that kept an earlier cut fetches the new one.
            stamp = f'?v={commit}' if commit else ''
            entries.append({'id': f'{folder}/{key}', 'src': f'{folder}/{key}.webp{stamp}', 'thumb': f'{folder}/{key}.thumb.webp{stamp}',
                            'width': width, 'height': height, 'line': sticker.get('line', ''),
                            # what a sticker with no line shows is said by its label ("Waving")
                            'gloss': sticker.get('gloss') or sticker.get('label', '')})
        manifest['sets'].append({'id': folder, 'name': name, 'who': who, 'stickers': entries})
        print(f'{name}: {len(entries)} stickers')
    (OUT / 'stickers.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
