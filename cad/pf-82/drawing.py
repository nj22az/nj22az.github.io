"""Johansson PF-82 general arrangement, in millimetres, from the layout that build.py writes.

Run:  python3 cad/pf-82/drawing.py   (after build.py; standard library only)
Writes cad/pf-82/drawing.svg: the panel as a plan (true size along the slope), the side section and the keys.
"""
from html import escape
from pathlib import Path
import json

HERE = Path(__file__).resolve().parent
L = json.loads((HERE.parent.parent / "polivoks" / "3d" / "pf82-layout.json").read_text(encoding="utf-8"))
s = ['<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1130" viewBox="0 0 1600 1130">',
     '<rect width="1600" height="1130" fill="#f8f7f2"/>',
     '<style>text{font-family:Arial,sans-serif;fill:#203b46} .small{font-size:13px} .note{font-size:16px} .title{font-size:23px;font-weight:bold} '
     '.dim{stroke:#567580;stroke-width:1;fill:none} .edge{stroke:#29434b;stroke-width:1.3}</style>',
     '<defs><marker id="a" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto-start-reverse"><path d="M8 1L1 4L8 7" fill="none" stroke="#567580"/></marker></defs>']


def text(x, y, t, cls="small", anchor="start"):
    s.append(f'<text x="{x:.1f}" y="{y:.1f}" class="{cls}" text-anchor="{anchor}">{escape(str(t))}</text>')


def line(x1, y1, x2, y2, cls="edge"):
    s.append(f'<path d="M{x1:.1f} {y1:.1f}L{x2:.1f} {y2:.1f}" class="{cls}"/>')


def rect(x, y, w, h, fill="none", rx=0):
    s.append(f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{rx}" fill="{fill}" class="edge"/>')


def circle(x, y, r, fill="none"):
    s.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.1f}" fill="{fill}" class="edge"/>')


def poly(pts, fill):
    s.append('<polygon points="' + " ".join(f"{x:.1f},{y:.1f}" for x, y in pts) + f'" fill="{fill}" class="edge"/>')


def dim(x1, y1, x2, y2, label, off=0):
    s.append(f'<path d="M{x1:.1f} {y1:.1f}L{x2:.1f} {y2:.1f}" class="dim" marker-start="url(#a)" marker-end="url(#a)"/>')
    if abs(x1 - x2) < 1e-6:
        s.append(f'<text transform="translate({x1 - 10 + off:.1f} {(y1 + y2) / 2:.1f}) rotate(-90)" class="small" text-anchor="middle">{escape(label)}</text>')
    else:
        text((x1 + x2) / 2, (y1 + y2) / 2 - 7 + off, label, "small", "middle")


size, panel = L["size_mm"], L["panel"]
text(60, 51, "JOHANSSON PF-82 · POLIVOKS FILTER SYNTHESISER", "title")
text(60, 79, "Johansson Denki • General arrangement • Revision A • 3 November 2026", "note")
text(1540, 50, "PF-82–GA–001", "title", "end")
text(1540, 77, "ALL DIMENSIONS IN MILLIMETRES", "small", "end")
line(60, 95, 1540, 95)

# 01 panel plan, true size along the slope (v up the page)
sc = 2.2
px, py = 100, 150 + panel["height_mm"] * sc
P = lambda u, v: (px + u * sc, py - v * sc)  # noqa: E731
text(60, 128, "01 / PANEL, TRUE SIZE ALONG THE SLOPE", "title")
x0, y0 = P(0, panel["height_mm"])
rect(x0, y0, panel["width_mm"] * sc, panel["height_mm"] * sc, "#dfe3e1")
for m in L["modules"]:
    u0, v0, u1, v1 = m["rect"]
    a, bb = P(u0, v1), P(u1, v0)
    rect(a[0], a[1], bb[0] - a[0], bb[1] - a[1], "#f1f2ee", 6)
    text(a[0] + 8, a[1] + 16, m["num"] + "  " + m["title"])
for c in L["controls"]:
    x, y = P(c["u"], c["v"])
    circle(x, y, c["r"] * sc, "#ffffff" if c["kind"] != "jack" else "#b8bcbd")
    if c["kind"] == "selector":
        line(x, y, x, y - (c["r"] + 6) * sc)
text(P(548, 207)[0], P(548, 207)[1] + 4, "lamp", "small", "middle")
text(P(574, 207)[0], P(574, 207)[1] + 4, "power", "small", "middle")
dim(P(0, 0)[0], py + 22, P(600, 0)[0], py + 22, f'{panel["width_mm"]:.0f} between the cheeks')
dim(px - 22, P(0, 0)[1], px - 22, P(0, panel["height_mm"])[1], f'{panel["height_mm"]:.0f} along the slope')
text(px, py + 52, "Knobs Ø20 (filter Ø30) · chicken-head selectors, 24 × 6 bar · jacks, Ø11 nut · the lit output jack feeds the VCA", "small")

# 02 side section
text(60, 720, "02 / SIDE SECTION, CASE AND CHEEK", "title")
sx, sy, ss = 120, 1000, 1.45
S = lambda y, z: (sx + y * ss, sy - z * ss)  # noqa: E731
poly([S(*p) for p in L["cheek_profile_mm"]], "#d9cfc4")
poly([S(*p) for p in L["profile_mm"]], "#c9cdcf")
wk = L["white_key_mm"]
a, bb = S(wk["front"], size["key_floor"] + wk["height"]), S(wk["front"] + wk["length"], size["key_floor"])
rect(a[0], a[1], bb[0] - a[0], bb[1] - a[1], "#ede9e0")
dim(S(0, 0)[0], sy + 24, S(size["depth"], 0)[0], sy + 24, f'{size["depth"]:.0f} deep')
dim(S(size["depth"], 0)[0] + 24, S(0, 0)[1], S(size["depth"], 0)[0] + 24, S(0, 152)[1], "152", 34)
text(S(270, 120)[0], S(270, 120)[1] - 6, f'panel slope {L["slope_deg"]}°', "small", "middle")
text(S(80, 60)[0], S(80, 60)[1] - 8, f'white key {wk["length"]:.0f} × {wk["height"]:.0f}', "small", "middle")

# 03 keys
text(860, 720, "03 / KEYS, THREE OCTAVES AND A TOP C", "title")
kx, ky, ks = 870, 770, 1.15
whites = [0, 2, 4, 5, 7, 9, 11]
wi = 0
for i in range(L["keys"]["count"]):
    if i % 12 in whites:
        rect(kx + wi * wk["pitch"] * ks, ky, wk["width"] * ks, wk["length"] * ks, "#ede9e0")
        wi += 1
bk = L["black_key_mm"]
wi = 0
for i in range(L["keys"]["count"]):
    if i % 12 in whites:
        wi += 1
    else:
        rect(kx + (wi * wk["pitch"] - bk["width"] / 2) * ks, ky, bk["width"] * ks, bk["length"] * ks, "#141414")
dim(kx, ky + wk["length"] * ks + 22, kx + 22 * wk["pitch"] * ks, ky + wk["length"] * ks + 22, f'22 white keys × {wk["pitch"]} = {22 * wk["pitch"]:.0f}')
text(kx, ky + wk["length"] * ks + 60, f'{size["width"]:.0f} over two {size["cheek"]:.0f} cheeks; 37 keys C2–C5 at the default octave', "small")
s.append("</svg>")
(HERE / "drawing.svg").write_text("\n".join(s) + "\n", encoding="utf-8")
print("wrote", HERE / "drawing.svg")
