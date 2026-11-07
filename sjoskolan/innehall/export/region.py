"""Genererade regioner i befintliga filer.

En region avgränsas av kommentarer:
    <!-- innehall:start NAMN · genererat ur sjoskolan/innehall, redigera inte här -->
    …
    <!-- innehall:slut NAMN -->
Allt utanför regionerna hör till sidans mall och redigeras som vanligt.
"""
import re

START = '<!-- innehall:start {n} · genererat ur sjoskolan/innehall, redigera inte här -->'
SLUT = '<!-- innehall:slut {n} -->'


def ersatt(text, namn, innehall, forsta=None):
    """Ersätt regionen NAMN. Finns den inte används forsta (regex) för att hitta var den ska läggas första gången."""
    s, e = START.format(n=namn), SLUT.format(n=namn)
    ny = f'{s}{innehall}{e}'
    if s in text:
        i, j = text.index(s), text.index(e, text.index(s)) + len(e)
        return text[:i] + ny + text[j:]
    if forsta is None:
        raise ValueError(f'regionen {namn} saknas')
    m = re.search(forsta, text, flags=re.S)
    if not m:
        raise ValueError(f'hittar inte platsen för regionen {namn}')
    return text[:m.start()] + ny + text[m.end():]


def regioner(text):
    return re.findall(r'<!-- innehall:start (\S+) ·', text)
