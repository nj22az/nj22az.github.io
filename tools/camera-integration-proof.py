#!/usr/bin/env python3
"""Lay out actual render outputs and phone screenshots; never generate or repaint the photographs.

python3 tools/camera-integration-proof.py --renders /tmp/pocket-camera-integration/renders \
  --screens /tmp/pocket-camera-integration --out camera/qa/2026-10-30-integration
"""
import argparse
import hashlib
import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


def font(size):
    return ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', size)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--renders', type=Path, required=True)
    parser.add_argument('--screens', type=Path, required=True)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    photos = ['portrait-restaurant', 'portrait-braids', 'portrait-hat', 'cafe', 'garden', 'night']
    looks = {'none': 'Natural', 'crayon': 'Crayon', 'manga': 'Manga', 'oil': 'Oil', 'tilt': 'Miniature', 'risoThree': 'Riso three-colour'}
    variants = [('off', 'Enhance off / Paper None'), ('enhance', 'Enhance 65% / Paper None'),
                ('paper', 'Enhance 65% / Rough paper'), ('light', 'LIGHT / Enhance 65% / Rough paper')]
    background = '#16191c'
    for look, label in looks.items():
        sheet = Image.new('RGB', (1242, 1012), background)
        d = ImageDraw.Draw(sheet)
        d.text((14, 12), f'Pocket Camera integration / {label}', font=font(23), fill='white')
        d.text((14, 43), 'Actual Chromium 133 / SwiftShader renders. Six established test photographs; not physical Safari.', font=font(14), fill='#c0c7cc')
        for column, photo in enumerate(photos):
            d.text((14 + column * 204, 69), photo, font=font(13), fill='#e9c979')
        for row, (folder, caption) in enumerate(variants):
            y = 92 + row * 222
            d.text((14, y), caption, font=font(15), fill='#e9c979')
            for column, photo in enumerate(photos):
                image = Image.open(args.renders / folder / f'{photo}--{look}.png').convert('RGB')
                image.thumbnail((198, 194), Image.Resampling.LANCZOS)
                sheet.paste(image, (14 + column * 204 + (198 - image.width) // 2, y + 23 + (194 - image.height) // 2))
        d.text((14, 988), 'Photo credits and licences: README.md. Night-derived proof: CC BY-SA 4.0.', font=font(13), fill='#c0c7cc')
        sheet.save(args.out / f'proof-{look}.jpg', quality=93, subsampling=0)

    # Unscaled face crops from the 720-line render; one output pixel is one proof pixel.
    box = (147, 133, 374, 314)
    detail = Image.new('RGB', (974, 257), background)
    d = ImageDraw.Draw(detail)
    d.text((12, 8), 'Crayon / portrait-restaurant / 1:1 crop of 720-line renders', font=font(19), fill='white')
    for i, (folder, _) in enumerate(variants):
        d.text((12 + i * 243, 41), folder, font=font(16), fill='#e9c979')
        image = Image.open(args.renders / folder / 'portrait-restaurant--crayon.png').convert('RGB').crop(box)
        detail.paste(image, (12 + i * 243, 65))
    detail.save(args.out / 'crayon-detail.jpg', quality=96, subsampling=0)

    screens = [('combined/phone-combined-adjust.png', 'Enhance / 390 x 664'),
               ('combined/phone-combined-paper.png', 'Paper / 390 x 664'),
               ('layout/iphone-portrait-browser.png', 'Solitaire / 402 x 740')]
    ui = Image.new('RGB', (1214, 805), background)
    d = ImageDraw.Draw(ui)
    d.text((12, 8), 'Phone-sized Chromium screenshots / emulation, not physical iPhone Safari', font=font(19), fill='white')
    x = 10
    for file, caption in screens:
        image = Image.open(args.screens / file).convert('RGB')
        d.text((x, 41), caption, font=font(15), fill='#e9c979')
        ui.paste(image, (x, 65))
        x += image.width + 10
    ui.save(args.out / 'phone-screens.jpg', quality=93, subsampling=0)
    for source, target in [('combined/phone-combined-adjust.png', 'phone-enhance.png'),
                           ('combined/phone-combined-paper.png', 'phone-paper.png'),
                           ('layout/iphone-portrait-browser.png', 'phone-solitaire.png'),
                           ('layout/iphone-landscape.png', 'phone-solitaire-landscape.png')]:
        (args.out / target).write_bytes((args.screens / source).read_bytes())
    (args.out / 'render-matrix.json').write_bytes((args.screens / 'combined/render-matrix.json').read_bytes())
    files = sorted(args.renders.glob('*/*.png'))
    assert len(files) == 144, f'expected 144 actual renders, found {len(files)}'
    manifest = [{'file': str(p.relative_to(args.renders)), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(),
                 'dimensions': list(Image.open(p).size)} for p in files]
    (args.out / 'render-manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')
    print(f'{len(files)} rendered outputs; six four-row proofs, 1:1 detail, phone montage and four original screenshots')


if __name__ == '__main__':
    main()
