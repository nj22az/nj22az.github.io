#!/usr/bin/env python3
"""Draw the Johansson PF-82 illustrations as SVG, with the standard library only.

    python3 polivoks/art/draw.py          # write the SVGs and inline the two diagrams into index.html
    python3 polivoks/art/draw.py --check  # exit 1 if any output is stale (CI)

signal-flow.svg    the patch on the panel: what feeds what, numbered like the modules
filter-anatomy.svg the filter circuit, stage by stage, with where a real unit is imperfect

Both are inlined into index.html between <!-- art:NAME --> markers so they take the page's
fonts and colours and the map's blocks can be links; the .svg files are the same drawings.
"""
import pathlib
import re
import sys

HERE = pathlib.Path(__file__).resolve().parent
PAGE = HERE.parent / "index.html"


def esc(text):
    return str(text).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;")


def n(v):
    """Numbers without trailing noise, so output is stable."""
    return f"{v:.2f}".rstrip("0").rstrip(".") if isinstance(v, float) else str(v)


class Svg:
    def __init__(self, w, h, cls, label, desc=None, standalone=False):
        self.w, self.h, self.items = w, h, []
        ns = ' xmlns="http://www.w3.org/2000/svg"' if standalone else ""
        self.head = f'<svg{ns} class="{cls}" viewBox="0 0 {w} {h}" role="img" aria-labelledby="{cls}-t"'
        self.head += f' width="{w}" height="{h}">' if standalone else ">"
        self.items.append(f'<title id="{cls}-t">{esc(label)}</title>')
        if desc:
            self.items.append(f"<desc>{esc(desc)}</desc>")

    def add(self, s):
        self.items.append(s)

    def rect(self, x, y, w, h, cls="box", rx=8, extra=""):
        self.add(f'<rect class="{cls}" x="{n(x)}" y="{n(y)}" width="{n(w)}" height="{n(h)}" rx="{rx}"{extra}/>')

    def text(self, x, y, s, cls="t", anchor="start"):
        a = "" if anchor == "start" else f' text-anchor="{anchor}"'
        self.add(f'<text class="{cls}" x="{n(x)}" y="{n(y)}"{a}>{esc(s)}</text>')

    def path(self, d, cls="audio", end=True):
        m = ' marker-end="url(#arrow)"' if end else ""
        self.add(f'<path class="{cls}" d="{d}"{m}/>')

    def dot(self, x, y, cls="junction", r=3.5):
        self.add(f'<circle class="{cls}" cx="{n(x)}" cy="{n(y)}" r="{r}"/>')

    def svg(self):
        return self.head + "".join(self.items) + "</svg>"


ARROW = ('<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">'
         '<path class="arrowhead" d="M0 0L10 5L0 10z" fill="#eeebe4"/></marker></defs>')


# ---------------------------------------------------------------- signal flow

def block(s, x, y, w, h, num, title, sub, mod, big=False):
    s.add(f'<a class="sf-block" href="#mod-{mod}" data-mod="{mod}"><title>{esc(num + " " + title if num else title)}: open the module</title>')
    s.rect(x, y, w, h, "sf-box" + (" sf-main" if big else ""))
    ty = y + (30 if big else 20)
    if num:
        s.text(x + 12, ty, num, "sf-num")
    s.text(x + (34 if num else 12), ty, title, "sf-title")
    for i, line in enumerate(sub if isinstance(sub, list) else [sub]):
        s.text(x + 12, ty + 17 + 15 * i, line, "sf-sub")
    s.add("</a>")


def signal_flow():
    s = Svg(1180, 250, "art-flow", "Signal flow of the Johansson PF-82",
            "Audio: VCO 1 and VCO 2 into the mixer, the mixer into the Polivoks filter, the filter into the VCA, then out. "
            "Control: the keyboard sets the VCO pitch and, through TRACK, the filter's CV 2; the LFO feeds CV 2; "
            "envelope 1 feeds CV 1; envelope 2 opens the VCA.")
    s.add(ARROW)
    block(s, 20, 20, 150, 46, "1", "VCO 1", "makes the tone", "vco1")
    block(s, 20, 80, 150, 46, "2", "VCO 2", "a second tone", "vco2")
    block(s, 240, 40, 140, 66, "3", "MIXER", ["blends the tones", "and the noise"], "mix")
    block(s, 450, 18, 250, 106, "4", "VCF", ["POLIVOKS FILTER", "shapes the tone:", "bright, dark, ringing"], "flt", big=True)
    block(s, 770, 40, 140, 66, "5", "VCA", "sets the loudness", "amp")
    s.rect(980, 48, 110, 50, "sf-box sf-out")
    s.text(995, 69, "OUT", "sf-title")
    s.text(995, 86, "to your speakers", "sf-sub")
    block(s, 20, 188, 150, 46, "8", "KEYBOARD", "plays the notes", "voice")
    block(s, 450, 188, 112, 46, "7", "LFO", "a slow wobble", "lfo")
    block(s, 588, 188, 112, 46, "6", "ENV 1", "moves the filter", "eg1")
    block(s, 770, 188, 140, 46, "5", "ENV 2", "shapes the loudness", "amp")
    # audio, solid
    s.path("M170 43H205V64H236")
    s.path("M170 103H205V82H236")
    s.path("M380 73H446")
    s.path("M700 73H766", "audio sf-patched")
    s.add('<text class="sf-port" id="sf-out" x="733" y="64" text-anchor="middle">LP OUT</text>')
    s.path("M910 73H976")
    # control, dashed
    s.path("M95 188V130", "cv")
    s.text(103, 162, "PITCH", "sf-port")
    s.path("M506 188V128", "cv")
    s.text(514, 162, "CV 2", "sf-port")
    s.path("M644 188V128", "cv")
    s.text(652, 162, "CV 1", "sf-port")
    s.path("M840 188V110", "cv")
    s.path("M170 211H420V150H502", "cv")
    s.dot(506, 150)
    s.text(232, 204, "TRACK → CV 2", "sf-port")
    return s.svg()


# ---------------------------------------------------------------- filter anatomy

def opamp(s, x, y, label, sub):
    """A triangle pointing right, input at (x, y+40), output at (x+90, y+40)."""
    s.add(f'<path class="art-amp" d="M{x} {y}L{x} {y + 80}L{x + 90} {y + 40}Z"/>')
    s.text(x + 10, y + 36, label, "an-label")
    s.text(x + 10, y + 52, sub, "an-sub")


def filter_anatomy():
    s = Svg(1180, 470, "art-anatomy", "Inside the PF-82 filter",
            "The control path sums FREQUENCY, CV 1 through the attenuverter, CV 2 and +12 V into U1B, whose feedback "
            "transistor Q1 turns current into an exponential Iset for both MC1776 integrators. The audio input and the "
            "low-pass feedback meet at U2's input; U2 integrates to the band-pass, U3 to the low-pass; the resonance pot "
            "feeds the band-pass back as damping. Buffers and an equal-power mixer give the three outputs. Amber notes mark "
            "where a real unit is imperfect.")
    s.add(ARROW)
    s.rect(0, 0, 1180, 470, "an-bg", rx=14)
    s.text(28, 40, "INSIDE THE PF-82 FILTER", "an-head")
    s.text(28, 62, "After clarionut’s Eurorack Polivoks filter; reference designators from his schematic.", "an-sub")
    # control path
    s.text(28, 98, "CONTROL", "an-section")
    for i, (a, b) in enumerate([("FREQUENCY", "RV1 · R2 180k"), ("CV 1", "U1A attenuverter · R6 47k"),
                                ("CV 2", "R3 100k"), ("+12 V", "R7 100k")]):
        y = 126 + 34 * i
        s.text(28, y, a, "an-label")
        s.text(110, y, b, "an-sub")
        s.path(f"M262 {y - 4}L282 165", "audio thin", end=False)
    s.add('<circle class="art-sum" cx="296" cy="165" r="14"/>')
    s.text(296, 170, "Σ", "an-label", "middle")
    s.text(28, 250, "Ripple on +12 V", "an-imp")
    s.text(28, 266, "moves the cutoff", "an-imp")
    s.path("M296 179V238", "audio")
    s.rect(206, 240, 180, 66, "an-box")
    s.text(218, 262, "U1B + Q1 (2N3904)", "an-label")
    s.text(218, 279, "exponential converter", "an-sub")
    s.text(218, 295, "R8 3k: ×2 per 5.9 µA", "an-sub")
    s.text(28, 336, "No temperature compensation:", "an-imp")
    s.text(28, 352, "+1.3 octaves per 10 °C", "an-imp")
    # Iset bus to both integrators
    s.path("M386 273H420V330H770V212", "cv")
    s.path("M570 330V212", "cv")
    s.dot(570, 330)
    s.text(440, 348, "Iset through R12 / R15 · the two chips share it unequally", "an-sub")
    # core
    s.text(440, 98, "CORE", "an-section")
    s.text(430, 186, "AUDIO IN", "an-label", "end")
    s.text(430, 202, "RV3 · R4", "an-sub", "end")
    s.path("M434 190H458")
    s.add('<circle class="art-sum" cx="472" cy="190" r="14"/>')
    s.text(472, 195, "Σ", "an-label", "middle")
    s.text(492, 212, "÷50", "an-sub")
    s.path("M486 190H516")
    opamp(s, 520, 150, "U2A", "MC1776")
    s.dot(650, 190)
    s.text(652, 180, "BP", "an-label")
    s.path("M610 190H716", "audio", end=True)
    s.text(668, 206, "÷48", "an-sub", "middle")
    opamp(s, 720, 150, "U3A", "MC1776")
    s.path("M810 190H850", "audio", end=False)
    s.dot(850, 190)
    s.text(852, 180, "LP", "an-label")
    # resonance and LP feedback
    s.path("M650 190V134H472V172", "audio")
    s.text(560, 126, "RV4 RESONANCE", "an-label", "middle")
    s.path("M850 190V260H472V208", "audio")
    s.text(600, 254, "R10 · LP back to U2", "an-sub")
    s.text(440, 372, "U2A, U3A run open loop: their slew limit is the growl,", "an-imp")
    s.text(440, 390, "and their second pole tips full RESONANCE into oscillation.", "an-imp")
    # outputs
    s.text(900, 98, "OUTPUTS", "an-section")
    s.path("M650 134V108H896", "audio")
    s.rect(900, 86, 120, 40, "an-box")
    s.text(912, 104, "×1.61 · U4B", "an-label")
    s.text(912, 119, "C11 coupling", "an-sub")
    s.path("M1020 106H1060")
    s.text(1066, 111, "BP OUT", "an-label")
    s.path("M850 190H896")
    s.rect(900, 170, 120, 40, "an-box")
    s.text(912, 188, "×1.33 · U4A", "an-label")
    s.text(912, 203, "C12 coupling", "an-sub")
    s.path("M1020 190H1060")
    s.text(1066, 195, "LP OUT", "an-label")
    s.rect(900, 250, 120, 40, "an-box")
    s.text(912, 268, "RV5 · U4C · U4D", "an-label")
    s.text(912, 283, "equal-power mix", "an-sub")
    s.text(894, 262, "BP", "an-sub", "end")
    s.text(894, 284, "LP", "an-sub", "end")
    s.path("M1020 270H1060")
    s.text(1066, 275, "MIX OUT", "an-label")
    s.text(900, 318, "Buffers clip near ±10.5 V", "an-imp")
    s.text(862, 240, "Integrators stop at the ±11 V rails", "an-imp")
    # pots and legend
    s.text(28, 420, "Every pot: ±20 % and its end resistance; worn wipers lift for a moment when turned.", "an-imp")
    s.text(28, 448, "White: audio and control voltages · dashed: the Iset current · amber: where a real unit is imperfect.", "an-sub")
    return s.svg()


# ---------------------------------------------------------------- write / check

def outputs():
    return {"signal-flow.svg": signal_flow(), "filter-anatomy.svg": filter_anatomy()}


def inline(page, name, svg):
    pattern = re.compile(rf"(<!-- art:{name} -->)(.*?)(<!-- /art:{name} -->)", re.S)
    if not pattern.search(page):
        raise SystemExit(f"index.html has no <!-- art:{name} --> marker")
    return pattern.sub(lambda m: m.group(1) + svg + m.group(3), page)


def main():
    check = "--check" in sys.argv
    out = outputs()
    stale = []
    for name, svg in out.items():
        f = HERE / name
        text = svg + "\n"
        if not f.exists() or f.read_text(encoding="utf-8") != text:
            stale.append(name)
            if not check:
                f.write_text(text, encoding="utf-8")
    page = PAGE.read_text(encoding="utf-8")
    new = inline(inline(page, "signal-flow", out["signal-flow.svg"]), "filter-anatomy", out["filter-anatomy.svg"])
    if new != page:
        stale.append("index.html")
        if not check:
            PAGE.write_text(new, encoding="utf-8")
    if check and stale:
        print("Stale, run python3 polivoks/art/draw.py:", ", ".join(stale))
        sys.exit(1)
    print("up to date" if not stale else "wrote " + ", ".join(stale))


if __name__ == "__main__":
    main()
