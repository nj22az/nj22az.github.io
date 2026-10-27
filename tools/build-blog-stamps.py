#!/usr/bin/env python3
"""Turn the Minato rubber-stamp renders into the blog's pictures and place them on the articles.

  python3 tools/build-blog-stamps.py --from <dir of '<name>--stamp.png'>   make the images, then place them
  python3 tools/build-blog-stamps.py                                        place them only (images already made)
  python3 tools/build-blog-stamps.py --check                                fail if a page is out of date

Each shot in johansson-town/tools/minato-stamps.json (made by tools/minato-stamp-shoot.mjs) gives:
  assets/images/blog/stamps/<name>.webp   one ink: the ink's colour with its strength as transparency, so a page can
                                          print it in its own theme colour (a CSS mask); 1400 x 700, and <name>-thumb.webp
                                          480 x 240 for the blog list
  assets/images/blog/stamps/<name>.jpg    the stamp as printed, burgundy on cream, for link previews; 1200 x 600
The article gets the picture under its header, and its link preview; the blog catalogue gets "stamp" for the list.
"""
import argparse
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SHOTS = ROOT / 'johansson-town/tools/minato-stamps.json'
OUT = ROOT / 'assets/images/blog/stamps'
CATALOGUE = ROOT / 'assets/js/blog-posts.js'
SITE = 'https://nj22az.github.io'
PAPER = (252, 247, 231)
INK = (125, 36, 51)
MARK = 'data-blog-stamp'
CSS_VERSION = 4   # raise with every change to css/blog-stamps.css, so browsers fetch it again


def make_images(source):
    import numpy as np
    from PIL import Image, ImageFilter, ImageOps
    OUT.mkdir(parents=True, exist_ok=True)
    for shot in json.loads(SHOTS.read_text(encoding='utf-8'))['shots']:
        if not shot.get('article'):
            continue
        render = Image.open(source / f'{shot["name"]}--stamp.png').convert('RGB')
        if shot.get('crop'):
            # A part of the frame (fractions of width and height), where the render holds more than the picture needs.
            x0, y0, x1, y1 = shot['crop']
            render = render.crop((round(x0 * render.width), round(y0 * render.height), round(x1 * render.width), round(y1 * render.height)))
        render = ImageOps.fit(render, (1600, 800), Image.LANCZOS)
        grey = render.convert('L')
        # The Look's paper is not flat (a soft vignette towards the edges). Divide by the paper's own lightness, found
        # by spreading the lightest nearby pixels, so all of it clears evenly and only the ink is left.
        paper = grey.filter(ImageFilter.MaxFilter(15)).filter(ImageFilter.GaussianBlur(30))
        flat = Image.fromarray(np.clip(np.asarray(grey, float) * 255 / np.maximum(np.asarray(paper, float), 1), 0, 255).astype(np.uint8))
        # Ink strength from the paper (clear) down to solid ink (opaque); a little paper grain is kept out.
        lo, hi = sum(INK) / 3 / (sum(PAPER) / 3) * 255 * 1.05, 244
        alpha = flat.point(lambda v: max(0, min(255, round((hi - v) / (hi - lo) * 255))))
        ink = Image.new('RGBA', render.size, INK + (0,))
        ink.putalpha(alpha)
        # The stamp's grain lives in the transparency, so that is where the bytes go: a lighter alpha keeps the grain.
        ink.resize((1400, 700), Image.LANCZOS).save(OUT / f'{shot["name"]}.webp', 'WEBP', quality=70, alpha_quality=55, method=6)
        ink.resize((480, 240), Image.LANCZOS).save(OUT / f'{shot["name"]}-thumb.webp', 'WEBP', quality=65, alpha_quality=60, method=6)
        printed = Image.new('RGB', render.size, PAPER)
        printed.paste(Image.new('RGB', render.size, INK), mask=alpha)
        printed.resize((1200, 600), Image.LANCZOS).save(OUT / f'{shot["name"]}.jpg', 'JPEG', quality=84, optimize=True, progressive=True)
        print('made', shot['name'])


def pages_for(shot):
    """The English article and, for the electrical series, its Swedish version."""
    slug = shot['article']
    if slug == '/blog/':
        return []
    base = ROOT / 'blog' / 'elteknik' / slug if (ROOT / 'blog/elteknik' / slug).is_dir() else ROOT / 'blog' / slug
    return [p for p in (base / 'index.html', base / 'sv/index.html') if p.is_file()]


def figure(shot, lang):
    src = f'/assets/images/blog/stamps/{shot["name"]}.webp'
    alt = shot['alt_sv'] if lang == 'sv' else shot['alt']
    caption = shot['caption_sv'] if lang == 'sv' else shot['caption']
    return (f'<figure class="blog-stamp" {MARK}="{shot["name"]}"><span class="blog-stamp-art" role="img" aria-label="{html.escape(alt)}" '
            f'style="--stamp:url({src})"></span><figcaption>{html.escape(caption)}</figcaption></figure>')


def place(page, shot):
    text = page.read_text(encoding='utf-8')
    lang = 'sv' if '/sv/' in str(page) else 'en'
    text = re.sub(rf'<figure class="blog-stamp[^"]*" {MARK}="[^"]*">.*?</figure>', '', text, flags=re.S)
    # Under the article's own header: the one that holds its title (a Swedish page also has a top bar header).
    title = text.find('<h1')
    end = text.find('</header>', title)
    assert title > 0 and end > 0, f'{page}: expected the title inside a header'
    end += len('</header>')
    # A page that sets its text in a column of its own (the Swedish pages' .post-body) gets the picture as the first
    # thing in that column, so it lines up with the text.
    body = re.compile(r'<div class="post-body[^"]*">').search(text, end)
    if body and not text[end:body.start()].strip():
        end = body.end()
    text = text[:end] + figure(shot, lang) + text[end:]
    image = f'{SITE}/assets/images/blog/stamps/{shot["name"]}.jpg'
    text = re.sub(r'<meta property="og:image(?::width|:height|:alt)?" content="[^"]*">', '', text)
    text = re.sub(r'<meta name="twitter:card" content="[^"]*">', '', text)
    meta = (f'<meta property="og:image" content="{image}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="600">'
            f'<meta property="og:image:alt" content="{html.escape(shot["alt"])}"><meta name="twitter:card" content="summary_large_image">')
    text = text.replace('<meta property="og:locale"', meta + '<meta property="og:locale"', 1) if '<meta property="og:locale"' in text else text.replace('</head>', meta + '</head>', 1)
    text = re.sub(r'<link rel="stylesheet" href="/css/blog-stamps\.css\?v=\d+">', '', text)
    text = text.replace('</head>', f'<link rel="stylesheet" href="/css/blog-stamps.css?v={CSS_VERSION}"></head>', 1)
    return text


def place_header(page, shot):
    """The blog page's own header picture: the harbour, wide, under the title."""
    text = page.read_text(encoding='utf-8')
    text = re.sub(rf'<span class="blog-head-stamp" {MARK}="[^"]*"[^>]*></span>', '', text)
    assert text.count('</header>') == 1, f'{page}: expected one page header'
    src = f'/assets/images/blog/stamps/{shot["name"]}.webp'
    text = text.replace('</header>', f'</header><span class="blog-head-stamp" {MARK}="{shot["name"]}" role="img" aria-label="{html.escape(shot["alt"])}" style="--stamp:url({src})"></span>', 1)
    text = re.sub(r'<link rel="stylesheet" href="/css/blog-stamps\.css\?v=\d+">', '', text)
    text = text.replace('</head>', f'<link rel="stylesheet" href="/css/blog-stamps.css?v={CSS_VERSION}"></head>', 1)
    return text


def catalogue(shots):
    source = CATALOGUE.read_text(encoding='utf-8')
    start = source.index('[')
    items = json.loads(source[start:source.rindex(']') + 1])
    by_slug = {s['article']: s for s in shots if s.get('article')}
    for item in items:
        slug = item['url'].rstrip('/').split('/')[-1]
        shot = by_slug.get(slug)
        item.pop('stamp', None)
        if shot:
            item['stamp'] = {'src': f'/assets/images/blog/stamps/{shot["name"]}-thumb.webp', 'alt': shot['alt']}
    return source[:start] + json.dumps(items, ensure_ascii=False, indent=2) + ';\n'


def run(check):
    shots = json.loads(SHOTS.read_text(encoding='utf-8'))['shots']
    stale = []
    for shot in shots:
        if not shot.get('article'):
            continue
        if shot['article'] == '/blog/':
            page = ROOT / 'blog/index.html'
            new = place_header(page, shot)
            if page.read_text(encoding='utf-8') != new:
                stale.append(page)
                if not check:
                    page.write_text(new, encoding='utf-8')
            continue
        # "place": false keeps a picture to the blog list (a page with pictures of its own, such as a comic).
        for page in (pages_for(shot) if shot.get('place', True) else []):
            new = place(page, shot)
            if page.read_text(encoding='utf-8') != new:
                stale.append(page)
                if not check:
                    page.write_text(new, encoding='utf-8')
    new = catalogue(shots)
    if CATALOGUE.read_text(encoding='utf-8') != new:
        stale.append(CATALOGUE)
        if not check:
            CATALOGUE.write_text(new, encoding='utf-8')
    for shot in (s for s in shots if s.get('article')):
        for ext in ('webp', '-thumb.webp', 'jpg'):
            assert (OUT / f'{shot["name"]}{"" if ext.startswith("-") else "."}{ext}').is_file(), f'missing {shot["name"]}.{ext}: run with --from'
    if check:
        assert not stale, 'Out of date: ' + ', '.join(str(p.relative_to(ROOT)) for p in stale)
        print(f'PASS: {len(shots)} stamp pictures placed')
    else:
        print('updated', len(stale), 'file(s)')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--from', dest='source', type=Path, help='directory of <name>--stamp.png renders')
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    if args.source:
        make_images(args.source)
    run(args.check)
