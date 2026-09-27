#!/usr/bin/env python3
"""Check the published Week 40 route, links and generated browser assets.

Run from any directory: python3 sjoskolan/verktyg/qa/week40.py
Uses only the standard library; run after innehall.py bygg.
"""
from collections import Counter
from functools import lru_cache
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import subprocess
from urllib.parse import unquote, urljoin, urlparse, parse_qs
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[3]
BASE = 'https://nj22az.github.io/'
WEEK = ROOT / 'sjoskolan/vecka-40/aktuell'
errors = []
checked = set()


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.ids, self.links = [], []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        for key in ('href', 'src'):
            if attrs.get(key):
                self.links.append(attrs[key])


@lru_cache(None)
def page(path):
    return Page(path.read_text(encoding='utf-8'))


def check(source, link):
    url = urlparse(urljoin(BASE + source.relative_to(ROOT).as_posix(), link))
    if url.netloc != 'nj22az.github.io':
        return
    dest = ROOT / unquote(url.path).lstrip('/')
    if dest.is_dir():
        dest /= 'index.html'
    if not dest.is_file() or not dest.stat().st_size:
        errors.append(f'{source.relative_to(ROOT)}: missing {link}')
        return
    if url.fragment and dest.suffix == '.html' and not (dest.parent.name == 'bildspel' and url.fragment.isdigit()):
        if unquote(url.fragment) not in page(dest).ids:
            errors.append(f'{source.relative_to(ROOT)}: missing anchor {link}')
    deck = parse_qs(url.query).get('d', [None])[0]
    if deck and dest.parent.name == 'bildspel':
        check(dest, deck + '/data.json')
    if dest in checked:
        return
    checked.add(dest)
    if dest.suffix in ('.mjs', '.js'):
        for ref in re.findall(r'''(?:from\s*|import\s*\(?\s*)['"](\.[^'"]+)['"]''', dest.read_text()):
            check(dest, ref)


pages = sorted(WEEK.glob('*.html')) + [ROOT / f'sjoskolan/{p}' for p in ('index.html', 'vaxelstromslabbet/index.html', 'bildspel/index.html')]
for source in pages:
    duplicates = [key for key, n in Counter(page(source).ids).items() if n > 1]
    if duplicates:
        errors.append(f'{source.relative_to(ROOT)}: duplicate IDs {duplicates}')
    for link in page(source).links:
        check(source, link)

# Dynamic presentation images and downloadable equivalents are committed outputs.
decks = json.loads((ROOT / 'sjoskolan/bildspel/lista.json').read_text())
slide_count = 0
for deck in (d for d in decks if d['week'] == 40):
    datafile = ROOT / 'sjoskolan/bildspel' / deck['id'] / 'data.json'
    check(ROOT / 'sjoskolan/bildspel/index.html', f'{deck["id"]}/data.json')
    if not datafile.is_file():
        continue
    data = json.loads(datafile.read_text())
    viewer = ROOT / 'sjoskolan/bildspel/index.html'
    for key in ('exercises', 'weekUrl', 'pdf', 'pptx'):
        if data.get(key):
            check(viewer, data[key])
    for slide in data['slides']:
        if slide.get('ex'):
            check(viewer, slide['ex'])
    if len(data['slides']) != deck['n']:
        errors.append(f'{deck["id"]}: slide count differs from catalog')
    for i in range(1, len(data['slides']) + 1):
        check(datafile, f'{i:02}.webp')
        slide_count += 1
    for ext in ('pdf', 'pptx'):
        path = WEEK / f'{deck["id"]}_elev.{ext}'
        if ext == 'pptx':
            with ZipFile(path) as archive:
                if archive.testzip():
                    errors.append(f'{path.name}: corrupt archive')
        elif not path.read_bytes().startswith(b'%PDF-'):
            errors.append(f'{path.name}: invalid PDF')

for name in ('sinus', 'impedans', 'effekt'):
    check(WEEK / 'Kortfilmer.html', f'film-audio/{name}.mp3')
check(WEEK / 'Kortfilmer.html', 'film-audio/timeline.json')

# Verify that each generated simulator task points to an actual lesson section.
js = """
import {LESSONS} from './sjoskolan/vecka-40/aktuell/lektioner.mjs';
import {UPPGIFTER,GUIDADE} from './sjoskolan/vaxelstromslabbet/uppgifter.gen.mjs';
console.log(JSON.stringify({lessons:LESSONS.map(l=>({id:l.id,slides:l.slides.map(s=>s.id)})),tasks:[...UPPGIFTER,...GUIDADE]}));
"""
data = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', js], cwd=ROOT, text=True))
sections = {l['id']: l['slides'] for l in data['lessons']}
for task in data['tasks']:
    lesson = task.get('tab', task.get('lesson'))
    if task['theory'] not in sections.get(lesson, []):
        errors.append(f'{task["id"]}: missing theory section')

if errors:
    raise SystemExit('\n'.join(errors))
print(f'Week 40: {len(pages)} pages, {len(checked)} local files, {slide_count} slides, {len(data["tasks"])} task explanations OK.')
