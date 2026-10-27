#!/usr/bin/env python3
"""Build the Hotels & Parking banner from an in-game frame of Tetsuo driving his kei truck.

The frame comes from Johansson World itself (johansson-town/tools/tetsuo-banner-shoot.mjs, the
"cab" setup outside Sakura Shoten, 17:40, Cartoon look). This script only lays it out:

  banner-desktop  3:1, title and line on the calm left third, a soft ink gradient behind them
  banner-phone    4:3 crop centred on Tetsuo, title in the sky at the top
  art-*           the same crops with no text, for a page that sets the title as real HTML

  python3 tools/build-hotel-banner.py <frame.png> [--out blog/hotels/banner]

Colours are the hotel page's own: ink #08131a, white, free-parking green #22c55e for the rule.
"""
import argparse
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
FONTS = Path('/usr/share/fonts/opentype/inter')
INK = (8, 19, 26)
GREEN = (34, 197, 94)
TITLE = 'Hotels & Parking'
LINE = 'Free parking for field service trips'


def font(name, size):
    for candidate in (FONTS / name, Path('/System/Library/Fonts/Supplemental/Arial Bold.ttf')):
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size)
    raise SystemExit(f'Font not found: {name}')


def crop_to(image, ratio, centre_x=0.5, centre_y=0.5):
    """The largest crop of the given width/height ratio around a centre point (fractions of the frame)."""
    w, h = image.size
    if w / h > ratio:  # wider than wanted: keep the height
        cw, ch = round(h * ratio), h
    else:
        cw, ch = w, round(w / ratio)
    left = min(max(round(w * centre_x - cw / 2), 0), w - cw)
    top = min(max(round(h * centre_y - ch / 2), 0), h - ch)
    return image.crop((left, top, left + cw, top + ch))


def gradient(size, direction, stops):
    """An ink overlay whose opacity follows (position, alpha) stops along 'right' or 'up'."""
    w, h = size
    length = w if direction == 'right' else h
    ramp = Image.new('L', (length, 1))
    for i in range(length):
        t = i / (length - 1)
        for (p0, a0), (p1, a1) in zip(stops, stops[1:]):
            if p0 <= t <= p1:
                ramp.putpixel((i, 0), round(a0 + (a1 - a0) * ((t - p0) / (p1 - p0) if p1 > p0 else 0)))
                break
    mask = ramp.resize((w, 1)).resize((w, h)) if direction == 'right' else ramp.resize((h, 1)).rotate(90, expand=True).transpose(Image.FLIP_TOP_BOTTOM).resize((w, h))
    layer = Image.new('RGBA', size, INK + (0,))
    layer.putalpha(mask)
    return layer


def text_block(base, x, edge, title_size, line_size, max_width, anchor='bottom'):
    """The title, a short green rule and the line, its last line ending at `edge` (anchor 'bottom') or its first line
    starting at `edge` (anchor 'top'), with a faint shadow for legibility."""
    title_font, line_font = font('InterDisplay-ExtraBold.otf', title_size), font('InterDisplay-Medium.otf', line_size)
    while title_font.getlength(TITLE) > max_width:
        title_size -= 2
        title_font = font('InterDisplay-ExtraBold.otf', title_size)
    gap, rule_h = round(line_size * 0.55), max(4, round(title_size * 0.06))
    line_box = line_font.getbbox(LINE)
    title_box = title_font.getbbox(TITLE)
    title_h, line_h = title_box[3] - title_box[1], line_box[3] - line_box[1]
    block = title_h + gap + rule_h + gap + line_h
    title_top = edge if anchor == 'top' else edge - block
    rule_top = title_top + title_h + gap
    line_top = rule_top + rule_h + gap
    shadow = Image.new('RGBA', base.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    for d in (sd,):
        d.text((x, title_top - title_box[1]), TITLE, font=title_font, fill=(0, 0, 0, 120))
        d.text((x, line_top - line_box[1]), LINE, font=line_font, fill=(0, 0, 0, 120))
    shadow = shadow.filter(ImageFilter.GaussianBlur(max(2, title_size // 28)))
    base.alpha_composite(shadow, (0, max(1, title_size // 40)))
    draw = ImageDraw.Draw(base)
    draw.text((x, title_top - title_box[1]), TITLE, font=title_font, fill=(255, 255, 255, 255))
    draw.rounded_rectangle((x, rule_top, x + round(title_size * 1.1), rule_top + rule_h), radius=rule_h // 2, fill=GREEN + (255,))
    draw.text((x, line_top - line_box[1]), LINE, font=line_font, fill=(255, 255, 255, 240))


def build(frame, out, truck_x):
    out.mkdir(parents=True, exist_ok=True)
    source = Image.open(frame).convert('RGBA')
    made = []
    # Desktop: 3:1, the whole street; title on the left third where the road and sky are calm.
    desk = crop_to(source, 3, centre_x=0.5).resize((2400, 800), Image.LANCZOS)
    art = desk.copy()
    desk.alpha_composite(gradient(desk.size, 'right', [(0, 200), (0.32, 110), (0.56, 0), (1, 0)]))
    text_block(desk, 120, 800 - 128, 150, 50, 800)
    # Phone: 4:3, centred on Tetsuo's cab; title along the bottom over an upward gradient.
    phone = crop_to(source, 4 / 3, centre_x=truck_x).resize((1200, 900), Image.LANCZOS)
    phone_art = phone.copy()
    phone.alpha_composite(gradient(phone.size, 'up', [(0, 0), (0.55, 0), (0.82, 120), (1, 190)]).transpose(Image.FLIP_TOP_BOTTOM))
    text_block(phone, 64, 70, 112, 40, 1000, anchor='top')
    for name, image in (('banner-desktop', desk), ('banner-phone', phone), ('art-desktop', art), ('art-phone', phone_art)):
        rgb = image.convert('RGB')
        rgb.save(out / f'{name}.png', optimize=True)
        rgb.save(out / f'{name}.webp', quality=86, method=6)
        made += [out / f'{name}.png', out / f'{name}.webp']
    return made


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('frame', type=Path)
    parser.add_argument('--out', type=Path, default=ROOT / 'blog/hotels/banner')
    parser.add_argument('--truck-x', type=float, default=0.47, help='Tetsuo cab position across the frame (0-1) for the phone crop')
    args = parser.parse_args()
    for path in build(args.frame, args.out, args.truck_x):
        print(f'{path.relative_to(ROOT) if path.is_relative_to(ROOT) else path}  {path.stat().st_size // 1024} KB')


if __name__ == '__main__':
    main()
