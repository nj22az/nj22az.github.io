"""Inline-markering i innehållet.

Innehållet skrivs som vanlig svensk text med Unicode (Ω, √, ², ₁, φ …). Två markeringar finns för index
som saknar bra Unicode-tecken:

    X_{L}   nedsänkt  (renderas <sub>L</sub> i HTML och som nedsänkt körning i PowerPoint)
    x^{2}   upphöjt   (renderas <sup>2</sup>)

Inga andra markeringar. Allt annat är text och HTML-escapas vid rendering.
"""
import html
import re

TOKEN = re.compile(r'([_^])\{([^{}]*)\}')
# Äldre källor använde modifierarbokstäver som låtsasindex. De normaliseras vid migreringen.
PSEUDO_SUB = {'ᴸ': 'L', 'ᶜ': 'C', 'ᴿ': 'R', 'ꜰ': 'F', 'ɴ': 'N'}
PSEUDO_RE = re.compile('([ᴸᶜᴿꜰɴ]+)')
# Unicode-nedsänkta tecken skrivs om till markering så att alla index hanteras lika.
UNI_SUB = {'ₓ': 'x', 'ᵢ': 'i', 'ₙ': 'n', 'ᵤ': 'u', 'ₜ': 't', 'ₛ': 's', 'ₖ': 'k', 'ₐ': 'a', 'ₚ': 'p', 'ₑ': 'e', 'ₒ': 'o', 'ᵣ': 'r', 'ₘ': 'm', 'ₗ': 'l', 'ₕ': 'h',
           '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9'}
UNI_RE = re.compile('([' + ''.join(UNI_SUB) + ']+)')


def normalisera(text):
    """Byt låtsasindex (Xᴸ) mot markering (X_{L}) och snygga till blanktecken."""
    if text is None:
        return text
    t = PSEUDO_RE.sub(lambda m: '_{' + ''.join(PSEUDO_SUB[c] for c in m.group(1)) + '}', text)
    t = UNI_RE.sub(lambda m: '_{' + ''.join(UNI_SUB[c] for c in m.group(1)) + '}', t)
    t = t.replace('}_{', '')
    t = t.replace(' ', ' ').replace(' ', ' ')
    return re.sub(r'[ \t]+', ' ', t).strip()


def delar(text):
    """Dela upp text i (typ, text) där typ är 'text', 'sub' eller 'sup'."""
    out, pos = [], 0
    for m in TOKEN.finditer(text or ''):
        if m.start() > pos:
            out.append(('text', text[pos:m.start()]))
        out.append(('sub' if m.group(1) == '_' else 'sup', m.group(2)))
        pos = m.end()
    if pos < len(text or ''):
        out.append(('text', text[pos:]))
    return out


def html_text(text):
    """Rendera till HTML (escapat)."""
    s = []
    for typ, t in delar(text):
        e = html.escape(t, quote=False)
        s.append(e if typ == 'text' else f'<{typ}>{e}</{typ}>')
    return ''.join(s)


def ren_text(text):
    """Rendera till oformaterad text (index skrivs som vanliga tecken)."""
    return ''.join(t for _, t in delar(text))


def kontrollera(text):
    """Returnerar felbeskrivningar för otillåten markering."""
    fel = []
    rest = TOKEN.sub('', text or '')
    if '_{' in rest or '^{' in rest:
        fel.append('ofullständig markering')
    if PSEUDO_RE.search(text or ''):
        fel.append('låtsasindex (ᴸ ᶜ ᴿ ꜰ ɴ) ska skrivas som _{…}')
    return fel
