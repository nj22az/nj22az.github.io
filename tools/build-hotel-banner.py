#!/usr/bin/env python3
"""Build the Hotels & Parking banner from an in-game frame of Tetsuo driving his kei truck.

The frame comes from Johansson World itself (johansson-town/tools/tetsuo-banner-shoot.mjs, the
"cab" setup outside Sakura Shoten, 17:40, Cartoon look). This script only lays it out:

  banner-desktop  3:1, title and line on the calm left third, a soft ink gradient behind them
  banner-phone    4:3 crop centred on Tetsuo, title in the sky at the top
  art-*           the same crops with no text, for a page that sets the title as real HTML

--style stamp / riso set the title as printed matter for the Rubber stamp and Risograph Looks: a stamped
burgundy label or a two-plate riso tag on the frame's own paper colour.

  python3 tools/build-hotel-banner.py <frame.png> [--style stamp] [--site] [--out blog/hotels/banner]

Colours are the hotel page's own: ink #08131a, white, free-parking green #22c55e for the rule.
"""
import argparse
import random
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


# Print Looks get printed titles: the frame's own paper and inks, sampled from the in-game renders.
PRINT = {
    'stamp': {'paper': (252, 247, 231), 'ink': (125, 36, 51)},
    'riso': {'paper': (247, 239, 226), 'ink': (36, 138, 135), 'second': (224, 103, 92)},
}


def grain(size, seed, keep):
    """A fixed speckle mask (same seed, same print): 255 where ink lands, 0 where the stamp missed."""
    w, h = size
    rng = random.Random(seed)
    small = Image.frombytes('L', (max(1, w // 3), max(1, h // 3)), rng.randbytes(max(1, w // 3) * max(1, h // 3)))
    small = small.resize((w, h), Image.BICUBIC).filter(ImageFilter.GaussianBlur(1.2))
    return small.point(lambda v: 255 if v < 255 * keep else 0).filter(ImageFilter.GaussianBlur(.6))


def printed_label(base, x, edge, title_size, line_size, style, anchor='bottom', tilt=-2.2):
    """The title as printed matter on the frame: a stamped label (stamp) or a two-plate riso tag (riso)."""
    look = PRINT[style]
    title_font, line_font = font('InterDisplay-ExtraBold.otf', title_size), font('InterDisplay-SemiBold.otf', line_size)
    tw, lw = title_font.getlength(TITLE), line_font.getlength(LINE)
    tb, lb = title_font.getbbox(TITLE), line_font.getbbox(LINE)
    pad, gap = round(title_size * .34), round(line_size * .5)
    w = round(max(tw, lw) + 2 * pad)
    h = round((tb[3] - tb[1]) + gap + (lb[3] - lb[1]) + 2 * pad)
    label = Image.new('RGBA', (w + 40, h + 40), (0, 0, 0, 0))
    ox, oy = 20, 20
    paper = Image.new('L', label.size, 0)
    ImageDraw.Draw(paper).rounded_rectangle((ox, oy, ox + w, oy + h), radius=round(title_size * (.06 if style == 'stamp' else .16)), fill=255)
    label.paste(look['paper'] + (255,), (0, 0), paper)
    ink = Image.new('L', label.size, 0)
    d = ImageDraw.Draw(ink)
    tx, ty = ox + pad, oy + pad - tb[1]
    d.text((tx, ty), TITLE, font=title_font, fill=255)
    d.text((tx, oy + pad + (tb[3] - tb[1]) + gap - lb[1]), LINE, font=line_font, fill=255)
    if style == 'stamp':
        # A rubber stamp's double border, uneven pressure and a few missed specks.
        b = max(5, title_size // 22)
        d.rounded_rectangle((ox + b, oy + b, ox + w - b, oy + h - b), radius=round(title_size * .05), outline=255, width=b)
        d.rounded_rectangle((ox + 3 * b, oy + 3 * b, ox + w - 3 * b, oy + h - 3 * b), radius=round(title_size * .04), outline=255, width=max(2, b // 2))
        pressure = Image.linear_gradient('L').rotate(-70, expand=False).resize(label.size).point(lambda v: 170 + v * 85 // 255)
        ink = Image.composite(ink, Image.new('L', label.size, 0), grain(label.size, 7, .93))
        ink = Image.composite(Image.new('L', label.size, 0), ink, pressure.point(lambda v: 255 - v)).point(lambda v: min(255, v * 1.25))
        label.paste(look['ink'] + (255,), (0, 0), ink)
    else:
        # Two riso plates: coral slightly out of register under teal, both with the drum's grain.
        off = max(4, title_size // 30)
        second = ink.transform(ink.size, Image.AFFINE, (1, 0, -off, 0, 1, -off * .6))
        g = grain(label.size, 11, .97)
        label.paste(look['second'] + (255,), (0, 0), Image.composite(second, Image.new('L', label.size, 0), g).point(lambda v: v * 92 // 100))
        label.paste(look['ink'] + (255,), (0, 0), Image.composite(ink, Image.new('L', label.size, 0), g))
        bar = Image.new('L', label.size, 0)
        ImageDraw.Draw(bar).rectangle((ox, oy + h - max(8, title_size // 14), ox + w, oy + h), fill=255)
        label.paste(look['second'] + (255,), (0, 0), Image.composite(bar, Image.new('L', label.size, 0), paper))
    label = label.rotate(tilt, resample=Image.BICUBIC, expand=True)
    shadow = Image.new('RGBA', label.size, (0, 0, 0, 0))
    shadow.putalpha(label.getchannel('A').point(lambda v: v * 50 // 255).filter(ImageFilter.GaussianBlur(10)))
    top = edge if anchor == 'top' else edge - label.height
    base.alpha_composite(shadow, (x, top + 8))
    base.alpha_composite(label, (x, top))


def build(frame, out, truck_x, style='ink', site=False):
    out.mkdir(parents=True, exist_ok=True)
    source = Image.open(frame).convert('RGBA')
    made = []
    # Desktop: 3:1, the whole street; title on the left third where the road and sky are calm.
    desk = crop_to(source, 3, centre_x=0.5).resize((2400, 800), Image.LANCZOS)
    art_desk = desk.copy()
    if style == 'ink':
        desk.alpha_composite(gradient(desk.size, 'right', [(0, 200), (0.32, 110), (0.56, 0), (1, 0)]))
        text_block(desk, 120, 800 - 128, 150, 50, 800)
    else:
        printed_label(desk, 80, 800 - 76, 94, 34, style)  # ends near x 900, clear of the truck (from ~1010)
    # Phone: 4:3, centred on Tetsuo's cab; title along the bottom over an upward gradient.
    phone = crop_to(source, 4 / 3, centre_x=truck_x).resize((1200, 900), Image.LANCZOS)
    phone_art = phone.copy()
    if style == 'ink':
        phone.alpha_composite(gradient(phone.size, 'up', [(0, 0), (0.55, 0), (0.82, 120), (1, 190)]).transpose(Image.FLIP_TOP_BOTTOM))
        text_block(phone, 64, 70, 112, 40, 1000, anchor='top')
    else:
        printed_label(phone, 34, 26, 84, 30, style, anchor='top', tilt=-1.6)  # ends above the truck's canopy
    images = [('banner-desktop', desk), ('banner-phone', phone)] + ([] if site else [('art-desktop', art_desk), ('art-phone', phone_art)])
    for name, image in images:
        rgb = image.convert('RGB')
        if site:
            # For the site: WebP for browsers, a JPEG fallback for old ones and link previews.
            rgb.save(out / f'{name}.jpg', quality=84, optimize=True, progressive=True)
            made.append(out / f'{name}.jpg')
        else:
            rgb.save(out / f'{name}.png', optimize=True)
            made.append(out / f'{name}.png')
        # Print Looks are all grain and halftone dots: quality 75 keeps them crisp at a fraction of the size.
        rgb.save(out / f'{name}.webp', quality=86 if style == 'ink' else 75, method=6)
        made.append(out / f'{name}.webp')
    return made


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('frame', type=Path)
    parser.add_argument('--out', type=Path, default=ROOT / 'blog/hotels/banner')
    parser.add_argument('--style', choices=['ink', *PRINT], default='ink', help='ink: white title on an ink gradient; stamp or riso: a printed label for those Looks')
    parser.add_argument('--site', action='store_true', help='Write only what the page serves: banner-* as WebP plus a JPEG fallback (no PNG, no art-*)')
    parser.add_argument('--truck-x', type=float, default=0.47, help='Tetsuo cab position across the frame (0-1) for the phone crop')
    args = parser.parse_args()
    for path in build(args.frame, args.out, args.truck_x, args.style, site=args.site):
        print(f'{path.relative_to(ROOT) if path.is_relative_to(ROOT) else path}  {path.stat().st_size // 1024} KB')


if __name__ == '__main__':
    main()
