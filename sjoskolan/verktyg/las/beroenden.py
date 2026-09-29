"""Lokala körningsberoenden, utan att följa navigeringslänkar eller hela mappar.

Följ HTML-skript (även inline), stilmallar, ES-import/export, bokstavliga dynamiska
importer och CSS-import/url. Beräknade sökvägar måste anges som egna startfiler.
Den publicerade bundlen låses; dess byggverktyg, npm-paket och källfiler behöver
inte frysas eftersom de inte laddas av elevens webbläsare.
"""
from html.parser import HTMLParser
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit


# Bevara strängar när kommentarer tas bort (bl.a. https:// och SVG i mallsträngar).
KOMMENTARER = re.compile(r'''("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|//[^\n]*|/\*[\s\S]*?\*/''')
MODULER = re.compile(r'''\b(?:from\s*|import\s*\(?\s*)['"]([./][^'"]+)['"]''')
CSS = re.compile(r'''(?:@import\s+(?!url\s*\()|url\(\s*)["']?([^\s"'();]+)''')


def utan_kommentarer(text):
    return KOMMENTARER.sub(lambda m: m[1] or ' ', text)


def css_referenser(text):
    return CSS.findall(re.sub(r'/\*[\s\S]*?\*/', ' ', text))


class Sida(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.referenser = []
        self.inline = None
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'script':
            if attrs.get('src'):
                self.referenser.append(attrs['src'])
            self.inline = 'script' if attrs.get('type', '') in ('', 'module', 'text/javascript', 'application/javascript') else None
        elif tag == 'style':
            self.inline = 'style'
        elif tag == 'link' and 'stylesheet' in attrs.get('rel', '').split():
            if attrs.get('href'):
                self.referenser.append(attrs['href'])

    def handle_data(self, data):
        if self.inline == 'script':
            self.referenser.extend(MODULER.findall(utan_kommentarer(data)))
        elif self.inline == 'style':
            self.referenser.extend(css_referenser(data))

    def handle_endtag(self, tag):
        if tag == self.inline:
            self.inline = None


def lokalt(sjo, kalla, ref):
    url = urlsplit(ref)
    if url.scheme or url.netloc or not url.path:
        return None
    path = unquote(url.path)
    p = ((sjo.parent / path.lstrip('/')) if path.startswith('/') else kalla.parent / path).resolve()
    if not p.is_relative_to(sjo):
        raise ValueError(f'{kalla.relative_to(sjo)}: beroende utanför sjoskolan: {ref}')
    if not p.is_file():
        raise ValueError(f'{kalla.relative_to(sjo)}: saknat beroende: {ref}')
    return p


def beroenden(sjo, startfiler):
    """Returnera den transitiva mängden, inklusive startfiler; saknat mål är ett fel."""
    sjo = Path(sjo).resolve()
    kvar = [sjo / rel for rel in startfiler]
    ut = set()
    while kvar:
        p = kvar.pop()
        if p in ut:
            continue
        if not p.is_file():
            raise ValueError(f'saknad startfil/beroende: {p.relative_to(sjo)}')
        ut.add(p)
        if p.suffix not in ('.html', '.js', '.mjs', '.css'):
            continue
        text = p.read_text(encoding='utf-8')
        if p.suffix == '.html':
            refs = Sida(text).referenser
        elif p.suffix == '.css':
            refs = css_referenser(text)
        else:
            refs = MODULER.findall(utan_kommentarer(text))
        for ref in refs:
            mal = lokalt(sjo, p, ref)
            if mal is not None:
                kvar.append(mal)
    return ut
