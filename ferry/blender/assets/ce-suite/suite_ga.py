"""Chief Engineer's Suite - GA / Electrical / Plumbing drawing generator (SVG + DXF + PDF).
Sheet A1 landscape (841 x 594 mm), drawing scale 1:25 (40 mm per m)."""
import ezdxf, cairosvg

W, H = 841, 594
S = 40.0  # mm on paper per metre (1:25)
svg = []
doc = ezdxf.new("R2010", setup=True); doc.units = ezdxf.units.MM
msp = doc.modelspace()
COL = {"STR": "#000", "OUT": "#000", "FUR": "#777", "ELEC": "#d00", "CW": "#06c", "HW": "#e70",
       "GW": "#2a2", "BW": "#850", "VENT": "#a0a", "DIM": "#444", "TXT": "#000", "EM": "#f0f"}
ACI = {"STR": 7, "OUT": 7, "FUR": 8, "ELEC": 1, "CW": 5, "HW": 30, "GW": 3, "BW": 34, "VENT": 6,
       "DIM": 8, "TXT": 7, "EM": 6}
for k, v in ACI.items():
    doc.layers.add(k, color=v)


def P(x, y): return (x, H - y)  # svg y-down -> dxf y-up


def line(x1, y1, x2, y2, L="STR", w=0.35, dash=None):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    svg.append(f'<line x1="{x1:.2f}" y1="{y1:.2f}" x2="{x2:.2f}" y2="{y2:.2f}" stroke="{COL[L]}" stroke-width="{w}"{d}/>')
    msp.add_line(P(x1, y1), P(x2, y2), dxfattribs={"layer": L, **({"linetype": "DASHED"} if dash else {})})


def rect(x, y, w_, h_, L="STR", w=0.35, fill="none", dash=None):
    d = f' stroke-dasharray="{dash}"' if dash else ""
    svg.append(f'<rect x="{x:.2f}" y="{y:.2f}" width="{w_:.2f}" height="{h_:.2f}" fill="{fill}" stroke="{COL[L]}" stroke-width="{w}"{d}/>')
    msp.add_lwpolyline([P(x, y), P(x + w_, y), P(x + w_, y + h_), P(x, y + h_)], close=True,
                       dxfattribs={"layer": L, **({"linetype": "DASHED"} if dash else {})})


def circle(x, y, r, L="FUR", w=0.3, fill="none"):
    svg.append(f'<circle cx="{x:.2f}" cy="{y:.2f}" r="{r:.2f}" fill="{fill}" stroke="{COL[L]}" stroke-width="{w}"/>')
    msp.add_circle(P(x, y), r, dxfattribs={"layer": L})


def text(x, y, s, h=2.5, L="TXT", anchor="start", bold=False, rot=0):
    b = ' font-weight="bold"' if bold else ""
    r = f' transform="rotate({rot} {x:.2f} {y:.2f})"' if rot else ""
    s2 = s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    svg.append(f'<text x="{x:.2f}" y="{y:.2f}" font-family="Arial" font-size="{h}" fill="{COL[L]}" text-anchor="{anchor}"{b}{r}>{s2}</text>')
    al = {"start": "LEFT", "middle": "CENTER", "end": "RIGHT"}[anchor]
    t = msp.add_text(s, height=h * 0.75, rotation=-rot, dxfattribs={"layer": L})
    t.set_placement(P(x, y), align=ezdxf.enums.TextEntityAlignment[f"BOTTOM_{al}"])


def poly(pts, L, w=0.5, dash=None):
    for a, b in zip(pts, pts[1:]):
        line(*a, *b, L=L, w=w, dash=dash)


# ---------------- Cabin geometry (metres) ----------------
# x = longitudinal (aft->fwd) 0..7.2 ; y = transverse, y=0 corridor bulkhead, y=5.0 ship side shell
LX, LY, T = 7.2, 5.0, 0.05  # B-15 panel bulkhead 50 mm
WALLS = [  # internal partitions (x1,y1,x2,y2)
    (3.6, 0, 3.6, 5.0),      # day room / bedroom
    (3.6, 1.9, 7.2, 1.9),    # bedroom / bath+store
    (5.0, 0, 5.0, 1.9),      # store / bath
]
DOORS = [  # (x, y, width, orientation 'h'|'v', label)
    (1.0, 0.0, 0.8, "h", "D1 B-15 fire door 800 (self-closing)"),
    (3.6, 2.6, 0.8, "v", "D2 700"),
    (5.6, 1.9, 0.7, "h", "D3 bath 700 (vent grille)"),
    (4.0, 1.9, 0.7, "h", "D4 store"),
]
WINDOWS = [(0.8, 1.2), (2.2, 1.2), (5.0, 1.2)]  # x start, width along ship side (y=5.0)
FURN = [  # name, x, y, w, h
    ("Desk", 0.3, 4.3, 1.8, 0.7), ("Chair", 1.0, 3.7, 0.5, 0.5), ("Sofa", 0.1, 1.0, 0.8, 2.0),
    ("Table", 1.2, 1.5, 0.8, 0.8), ("Fridge", 2.9, 0.1, 0.6, 0.6), ("Bookcase/files", 2.2, 0.1, 0.65, 0.4),
    ("Bed 2000x1400", 5.0, 3.5, 2.0, 1.4), ("Wardrobe", 3.7, 4.35, 1.2, 0.6), ("Bedside", 7.05, 3.5, 0.1, 0.1),
    ("Locker", 3.7, 0.1, 1.2, 0.6),
    ("Shower 900x900", 6.25, 0.05, 0.9, 0.9), ("WC", 5.15, 0.1, 0.4, 0.65), ("Basin", 5.9, 1.35, 0.55, 0.45),
]
ELEC = {  # symbol, x, y, label
    "light": [(1.0, 2.5), (2.6, 2.5), (1.2, 4.0), (5.6, 3.2), (6.6, 3.2), (6.0, 0.95), (4.3, 0.95)],
    "emlight": [(1.8, 1.0), (4.3, 3.4)],
    "socket": [(0.35, 4.95), (2.0, 4.95), (3.55, 1.2), (3.65, 4.1), (7.15, 3.3), (7.15, 4.7), (3.25, 0.05)],
    "switch": [(0.85, 0.05), (3.65, 2.45), (5.45, 1.85), (4.85, 1.85)],
    "shaver": [(6.5, 1.85)],
    "smoke": [(1.8, 2.5), (5.4, 4.2)],
    "gab": [(0.2, 0.3)], "tel": [(0.3, 4.95)], "eap": [(2.8, 4.95)], "pa": [(1.8, 3.4), (6.2, 2.6)],
    "fcu": [(3.0, 0.9)], "db": [(0.3, 0.05)],
}
# ------------------------------------------------------------


def plan(ox, oy, title, mode, toff=22):
    """Draw plan with origin (ox,oy) paper mm = cabin (x=0,y=0) top-left; x->right, y(transverse)->down."""
    X = lambda x: ox + x * S
    Y = lambda y: oy + y * S
    text(ox + LX * S / 2, oy - toff, title, 5, anchor="middle", bold=True)
    text(ox + LX * S / 2, oy - toff + 6, "SCALE 1:25", 3, anchor="middle")
    # outer boundaries
    rect(X(-0.1), Y(-0.06), (LX + 0.2) * S, 0.06 * S, "STR", 0.4, "#ccc")       # corridor bhd (A-0/B-15)
    rect(X(-0.1), Y(LY), (LX + 0.2) * S, 0.25 * S, "STR", 0.4, "#9ab")         # shell + insulation lining
    rect(X(-0.1), Y(0), 0.1 * S, LY * S, "STR", 0.4, "#ccc")
    rect(X(LX), Y(0), 0.1 * S, LY * S, "STR", 0.4, "#ccc")
    text(X(LX / 2), Y(-0.15), "CORRIDOR (fire zone MVZ-2)", 2.5, anchor="middle")
    text(X(LX / 2), Y(LY + 0.45), "SHIP SIDE SHELL - STBD, 8 mm plate, frames @ 700 mm, 75 mm mineral wool + lining", 2.5, anchor="middle")
    text(X(-0.2), Y(LY / 2), "ADJ. CABIN (2/E)", 2.3, anchor="middle", rot=-90)
    text(X(LX + 0.2), Y(LY / 2), "STAIR / AC TRUNK", 2.3, anchor="middle", rot=90)
    for fr in range(0, 11):
        fx = fr * 0.7 + 0.1
        if fx <= LX:
            line(X(fx), Y(LY + 0.05), X(fx), Y(LY + 0.25), "STR", 0.6)
            if mode == "arch":
                text(X(fx), Y(LY + 0.7), f"Fr{120 + fr}", 2, anchor="middle")
    for x1, y1, x2, y2 in WALLS:
        if x1 == x2:
            rect(X(x1 - T / 2), Y(y1), T * S, (y2 - y1) * S, "STR", 0.35, "#ddd")
        else:
            rect(X(x1), Y(y1 - T / 2), (x2 - x1) * S, T * S, "STR", 0.35, "#ddd")
    for x, y, w_, o, lab in DOORS:
        if o == "h":
            rect(X(x), Y(y - 0.06), w_ * S, 0.12 * S, "STR", 0.2, "#fff")
            sgn = 1
            line(X(x), Y(y), X(x), Y(y + sgn * w_), "FUR", 0.3)
            svg.append(f'<path d="M{X(x):.1f},{Y(y + w_):.1f} A{w_ * S:.1f},{w_ * S:.1f} 0 0 0 {X(x + w_):.1f},{Y(y):.1f}" fill="none" stroke="#777" stroke-width="0.2" stroke-dasharray="1,1"/>')
            msp.add_arc(P(X(x), Y(y)), w_ * S, 0, 90 if False else 360 - 90 + 90, dxfattribs={"layer": "FUR"}) if False else None
        else:
            rect(X(x - 0.06), Y(y), 0.12 * S, w_ * S, "STR", 0.2, "#fff")
            line(X(x), Y(y), X(x + w_), Y(y), "FUR", 0.3)
            svg.append(f'<path d="M{X(x + w_):.1f},{Y(y):.1f} A{w_ * S:.1f},{w_ * S:.1f} 0 0 1 {X(x):.1f},{Y(y + w_):.1f}" fill="none" stroke="#777" stroke-width="0.2" stroke-dasharray="1,1"/>')
        if mode == "arch":
            text(X(x + (w_ / 2 if o == "h" else 0.15)), Y(y + (0.3 if o == "h" else w_ / 2)) + (4 if o == "h" else 0), lab.split(" ")[0], 2.2, anchor="middle" if o == "h" else "start")
    for wx, ww in WINDOWS:
        rect(X(wx), Y(LY), ww * S, 0.25 * S, "STR", 0.3, "#cef")
        if mode == "arch":
            text(X(wx + ww / 2), Y(LY - 0.1), "W 1200x900", 2, anchor="middle")
    for n, x, y, w_, h_ in FURN:
        if n == "Bedside":
            continue
        rect(X(x), Y(y), w_ * S, h_ * S, "FUR", 0.25, "none" if mode == "arch" else "#f6f6f6")
        if mode == "arch":
            text(X(x + w_ / 2), Y(y + h_ / 2) + 1, n, 1.9, "FUR", anchor="middle")
    if mode == "arch":
        for n, cx, cy in [("DAY ROOM / OFFICE  18.0 m²", 1.8, 3.1), ("BEDROOM  11.2 m²", 5.4, 2.7),
                          ("BATH  4.2 m²", 6.1, 1.25), ("STORE", 4.3, 1.0)]:
            text(X(cx), Y(cy), n, 2.6, anchor="middle", bold=True)
        # dimensions
        dy = Y(-0.6)
        for a, b in [(0, 3.6), (3.6, 5.0), (5.0, 7.2)]:
            line(X(a), dy, X(b), dy, "DIM", 0.2); line(X(a), dy - 2, X(a), dy + 2, "DIM", 0.2); line(X(b), dy - 2, X(b), dy + 2, "DIM", 0.2)
            text(X((a + b) / 2), dy - 1.2, f"{(b - a) * 1000:.0f}", 2.2, "DIM", anchor="middle")
        line(X(0), dy - 7, X(LX), dy - 7, "DIM", 0.2); text(X(LX / 2), dy - 8.2, "7200 (clear)", 2.4, "DIM", anchor="middle")
        dx = X(LX + 0.6)
        for a, b in [(0, 1.9), (1.9, 5.0)]:
            line(dx, Y(a), dx, Y(b), "DIM", 0.2); line(dx - 2, Y(a), dx + 2, Y(a), "DIM", 0.2); line(dx - 2, Y(b), dx + 2, Y(b), "DIM", 0.2)
            text(dx + 2, Y((a + b) / 2), f"{(b - a) * 1000:.0f}", 2.2, "DIM", rot=90, anchor="middle")
        # section line
        line(X(2.0), Y(-0.9), X(2.0), Y(LY + 0.9), "DIM", 0.4, "8,2,2,2")
        text(X(2.0) - 2, Y(-0.9), "A", 4, bold=True, anchor="end"); text(X(2.0) - 2, Y(LY + 0.9) + 4, "A", 4, bold=True, anchor="end")
        # north arrow / fwd
        line(X(LX) - 30, Y(-1.0), X(LX), Y(-1.0), "TXT", 0.5); line(X(LX) - 3, Y(-1.0) - 1.5, X(LX), Y(-1.0), "TXT", 0.5)
        text(X(LX) - 32, Y(-1.0) + 1, "FWD", 2.5, anchor="end", bold=True)
    if mode == "elec":
        sym = lambda k: [(X(x), Y(y)) for x, y in ELEC[k]]
        db = sym("db")[0]
        rect(db[0] - 3, db[1], 6, 4, "ELEC", 0.4, "#fcc"); text(db[0] + 4, db[1] + 7, "DB-CE (local MCB/RCBO panel)", 2, "ELEC")
        for p in sym("light"):
            circle(*p, 2.2, "ELEC"); line(p[0] - 1.6, p[1] - 1.6, p[0] + 1.6, p[1] + 1.6, "ELEC", 0.3); line(p[0] - 1.6, p[1] + 1.6, p[0] + 1.6, p[1] - 1.6, "ELEC", 0.3)
        for p in sym("emlight"):
            circle(*p, 2.2, "EM", 0.4, "#fdf"); text(p[0] + 3, p[1] + 1, "EM", 2, "EM")
        for p in sym("socket"):
            circle(*p, 1.6, "ELEC", 0.3, "#fff"); line(p[0] - 1.6, p[1], p[0] + 1.6, p[1], "ELEC", 0.3)
        for p in sym("switch"):
            circle(*p, 0.9, "ELEC", 0.3, "#d00"); line(*p, p[0] + 2, p[1] - 2, "ELEC", 0.3)
        for p in sym("shaver"):
            rect(p[0] - 2, p[1] - 2, 4, 3, "ELEC", 0.3); text(p[0], p[1] - 3, "SH", 1.8, "ELEC", anchor="middle")
        for p in sym("smoke"):
            circle(*p, 2.0, "ELEC", 0.3, "#ffc"); text(p[0], p[1] + 0.8, "S", 2.2, "ELEC", anchor="middle")
        for k, lab in [("gab", "GA"), ("tel", "T"), ("eap", "EAP"), ("pa", "PA"), ("fcu", "FCU")]:
            for p in sym(k):
                rect(p[0] - 2.5, p[1] - 2.5, 5, 5, "ELEC", 0.3, "#eef"); text(p[0], p[1] + 0.9, lab, 1.6, "ELEC", anchor="middle")
        # circuits (cable runs in ceiling void / skirting trunking)
        c = lambda pts, dash=None: poly([(X(a), Y(b)) for a, b in pts], "ELEC", 0.35, dash)
        c([(0.3, 0.05), (0.3, 0.4), (1.0, 0.4), (1.0, 2.5), (2.6, 2.5)], "3,1")                  # L1
        c([(1.0, 2.5), (1.0, 4.0), (1.2, 4.0)], "3,1")
        c([(0.85, 0.05), (0.85, 0.4)], "3,1")
        c([(1.0, 0.4), (3.3, 0.4), (3.3, 2.2), (4.3, 2.2), (5.6, 2.2), (5.6, 3.2), (6.6, 3.2)], "3,1")  # L2
        c([(4.3, 2.2), (4.3, 0.95)], "3,1"); c([(5.6, 2.2), (6.0, 2.2), (6.0, 0.95)], "3,1"); c([(3.65, 2.45), (3.65, 2.2)], "3,1")
        c([(0.35, 0.05), (0.15, 0.05), (0.15, 4.95), (3.4, 4.95)])                                  # S1 skirting
        c([(3.4, 4.95), (3.8, 4.95), (3.8, 4.1), (3.65, 4.1)]); c([(3.8, 4.95), (7.15, 4.95), (7.15, 3.3)])
        c([(0.3, 0.05), (3.25, 0.05)]); c([(3.25, 0.05), (3.55, 0.05), (3.55, 1.2)])
        c([(6.5, 1.85), (6.5, 2.05), (5.0, 2.05), (5.0, 2.2)], "1,1")                             # shaver
        c([(3.0, 0.9), (3.0, 0.4)], "6,1,1,1")
        text(X(1.05), Y(1.6), "L1", 2.2, "ELEC", bold=True); text(X(4.5), Y(2.15), "L2", 2.2, "ELEC", bold=True)
        text(X(0.2), Y(3.3), "S1", 2.2, "ELEC", bold=True, rot=-90); text(X(6.2), Y(4.9), "S2", 2.2, "ELEC", bold=True)
        text(X(5.1), Y(2.0) - 0.5, "SH (IEC 61558-2-5)", 1.6, "ELEC")
        text(X(LX / 2), Y(LY + 1.0), "Feeder 3x2.5 mm² from ACC-DB-03 (230 V 60 Hz 1~), EM light 2x1.5 mm² 24 V DC from EM-DB; IT/IS cables segregated", 2.2, "ELEC", anchor="middle")
    if mode == "plumb":
        def pipe(pts, L, w=0.8, dash=None): poly([(X(a), Y(b)) for a, b in pts], L, w, dash)
        # risers in pipe duct at aft-port corner of bath (x=7.0..7.2, y=0..0.3) -> duct
        rect(X(7.0), Y(0.0), 0.2 * S, 0.5 * S, "STR", 0.3, "#eee"); text(X(7.1), Y(0.7), "PIPE DUCT", 1.8, anchor="middle")
        pipe([(7.08, 0.1), (7.08, 1.0), (6.45, 1.0), (6.45, 1.55), (6.2, 1.55)], "CW")
        pipe([(7.08, 1.0), (7.1, 0.5), (6.7, 0.5)], "CW")                   # shower mixer
        pipe([(6.45, 1.0), (5.35, 1.0), (5.35, 0.75)], "CW")                # WC cistern
        pipe([(7.14, 0.1), (7.14, 1.1), (6.55, 1.1), (6.55, 1.6), (6.25, 1.6)], "HW")
        pipe([(7.14, 0.5), (6.75, 0.5)], "HW", 0.8, "2,1")
        pipe([(7.14, 0.1), (7.18, 0.1), (7.18, 1.2), (7.18, 1.25)], "HW", 0.4, "1,1")  # HW circulation return
        # drains
        pipe([(6.7, 0.5), (6.7, 0.25), (7.02, 0.25)], "GW", 1.2)            # shower drain
        pipe([(6.17, 1.55), (6.17, 1.2), (6.9, 1.2), (6.9, 0.25)], "GW", 1.2)  # basin
        pipe([(5.75, 1.0), (5.75, 0.15), (7.02, 0.15)], "GW", 1.0, "4,1")   # bath floor gully
        pipe([(5.35, 0.6), (5.35, 0.4), (7.04, 0.4)], "BW", 1.6)           # WC 100mm
        for (px, py, lab) in [(6.7, 0.5, "FD-1 shower"), (5.75, 1.0, "FG-1 floor gully")]:
            circle(X(px), Y(py), 2, "GW", 0.4, "#cfc"); text(X(px) + 2.5, Y(py) - 2.5, lab, 1.7, "GW")
        # isolation valves
        for (px, py, L) in [(7.08, 0.25, "CW"), (7.14, 0.3, "HW")]:
            rect(X(px) - 1.2, Y(py) - 1.2, 2.4, 2.4, L, 0.4, "#fff")
        text(X(5.2), Y(2.45), "CW DN15 Cu  •  HW DN15 Cu (insul.)  •  GW DN50  •  BW DN100", 2, "TXT")
        # fridge? no water. FCU condensate
        pipe([(3.0, 0.9), (3.0, 0.15), (4.95, 0.15), (5.75, 0.15)], "GW", 0.5, "1,1")
        text(X(3.05), Y(0.6), "FCU condensate DN20 → gully FG-1", 1.6, "GW")
        # HVAC
        for (vx, vy, lab) in [(1.8, 1.8, "SA"), (2.6, 3.6, "SA"), (5.9, 3.9, "SA"), (6.0, 0.6, "EA bath")]:
            rect(X(vx) - 3, Y(vy) - 2, 6, 4, "VENT", 0.4, "#fef"); text(X(vx), Y(vy) + 4.5, lab, 1.8, "VENT", anchor="middle")
        text(X(0.3), Y(LY + 0.8), "Ventilation: SA from AHU-2 via FCU ≥ 6 ACH; bath EA 50 m³/h to sanitary exhaust fan (cabin under-pressure). Fire dampers at A-class boundary only.", 2.1, "VENT")


# ---------------- Sheet ----------------
svg_head = f'<svg xmlns="http://www.w3.org/2000/svg" width="{W}mm" height="{H}mm" viewBox="0 0 {W} {H}">'
rect(0, 0, W, H, "OUT", 0.1, "#fff"); rect(10, 10, W - 20, H - 20, "OUT", 0.8)

plan(40, 64, "1 - GENERAL ARRANGEMENT PLAN (BRIDGE DECK 'C', Fr120-Fr131 STBD)", "arch", 46)
plan(440, 64, "2 - ELECTRICAL LAYOUT", "elec")
plan(40, 328, "3 - PLUMBING & HVAC LAYOUT", "plumb")

# Section A-A (transverse, at x=2.0 m through day room), origin bottom-left
sx, sy = 440, 472
text(sx + 2.5 * S, 335, "4 - SECTION A-A (looking FWD)", 5, anchor="middle", bold=True); text(sx + 2.5 * S, 341, "SCALE 1:25", 3, anchor="middle")
Z = lambda z: sy - z * S
Yx = lambda y: sx + y * S
rect(Yx(-0.1), Z(0), 5.35 * S, 0.012 * S * 2, "STR", 0.4, "#999")                       # deck plate 12mm
rect(Yx(-0.1), Z(0.06), 5.35 * S, 0.06 * S, "STR", 0.2, "#dcb")                        # floating floor/screed 60mm
rect(Yx(-0.1), Z(2.85), 5.35 * S, 0.012 * S * 2, "STR", 0.4, "#999")                     # deck above
for yy in [0.7, 1.4, 2.1, 2.8, 3.5, 4.2]:
    rect(Yx(yy), Z(2.85) + 0.5, 0.2 * S, 0.3 * S, "STR", 0.2, "#bbb")                  # deck beams 300
rect(Yx(0), Z(2.3), LY * S, 0.025 * S, "STR", 0.3, "#eee")                              # ceiling panels at 2300
text(Yx(0.1), Z(2.4), "CEILING VOID 2300-2850: cable trays, CW/HW branches, SA duct Ø160", 2, "TXT")
rect(Yx(0.3), Z(2.75), 2.2 * S, 0.12 * S, "ELEC", 0.4, "#fdd"); text(Yx(1.4), Z(2.55) + 6, "Cable tray 200", 1.8, "ELEC", anchor="middle")
circle(Yx(3.2), Z(2.55), 0.08 * S, "VENT", 0.4, "#fef")
circle(Yx(4.0), Z(2.5), 0.02 * S, "CW", 0.5, "#06c"); circle(Yx(4.15), Z(2.5), 0.03 * S, "HW", 0.5, "#e70")
rect(Yx(-0.06), Z(2.3), 0.06 * S, 2.24 * S, "STR", 0.3, "#ccc")                         # corridor bhd
rect(Yx(5.0), Z(2.85), 0.25 * S, 2.85 * S, "STR", 0.3, "#9ab")                          # shell+insul
rect(Yx(5.0), Z(1.9), 0.25 * S, 0.9 * S, "STR", 0.3, "#cef"); text(Yx(5.3), Z(1.45), "Window 1200x900 (ISO 3903)", 1.8, rot=-90)
rect(Yx(4.3), Z(0.76), 0.7 * S, 0.04 * S, "FUR", 0.3, "#eee"); text(Yx(4.65), Z(0.82), "Desk", 2, "FUR", anchor="middle")
rect(Yx(1.0), Z(0.45), 2.0 * S, 0.4 * S, "FUR", 0.2) if False else rect(Yx(0.1), Z(0.45), 0.8 * S, 0.39 * S, "FUR", 0.3, "#eee")
text(Yx(0.5), Z(0.55), "Sofa", 2, "FUR", anchor="middle")
# heights
for z, lab in [(0, "DK 0.000"), (0.06, "FFL +0.060"), (2.3, "CL +2.300"), (2.85, "DK +2.850")]:
    line(Yx(-0.9), Z(z), Yx(-0.15), Z(z), "DIM", 0.2); text(Yx(-0.9), Z(z) - 0.8, lab, 2, "DIM")
text(Yx(2.5), Z(-0.25), "Deck 12 mm on frames; 60 mm floating floor (vibration isolated, IMO MSC.337(91) ≤ 55 dB(A))", 2, "TXT", anchor="middle")
text(Yx(2.5), Z(-0.45), "Corridor bulkhead B-15 / joiner panels 50 mm mineral wool, FTP Code Part 3", 2, "TXT", anchor="middle")

# Legend
lx, ly = 440, 380
text(lx + 245, ly - 25, "LEGEND", 4, bold=True)
leg = [("ELEC", "Lighting fixture LED 230 V (IP20 / IP44 in bath)", "x"), ("EM", "Emergency light 24 V DC", "o"),
       ("ELEC", "Socket outlet 230 V 16 A Schuko, RCBO 30 mA", "s"), ("ELEC", "Light switch", "w"),
       ("ELEC", "Smoke detector (addressable, to FDS panel)", "o"), ("ELEC", "GA/FA bell, PA spkr, Tel, EAP = engineer alarm panel", "b"),
       ("CW", "Cold fresh water DN15 Cu", "-"), ("HW", "Hot fresh water DN15 Cu + 25 mm insulation", "-"),
       ("GW", "Grey water drain DN50 → grey water tank", "-"), ("BW", "Black water DN100 → STP (MARPOL Annex IV)", "-"),
       ("VENT", "HVAC supply / exhaust terminal", "b"), ("STR", "B-15 joiner bulkhead 50 mm", "-")]
for i, (L, s, t) in enumerate(leg):
    yy = ly - 15 + i * 6.3
    line(lx + 245, yy, lx + 260, yy, L, 1.0); text(lx + 263, yy + 1, s, 2.2)

# Notes
nx, ny = 420, 512
notes = ["NOTES:", "1. All dims in mm unless noted. Clear room heights 2300 mm. Suite area 32.4 m² (MLC 2006 Reg.3.1 min. for senior officer satisfied).",
         "2. Electrical installation to IEC 60092-201/-401/-507 and class rules (DNV-RU-SHIP Pt.4 Ch.8). Cables halogen-free, flame retardant IEC 60092-350/-353, IEC 60332-3-22.",
         "3. Fresh water to ISO 15748-1/-2; potable water hygiene per WHO Guide to Ship Sanitation. Sanitary drains per ISO 15749. Penetrations type-approved (FTP Code).",
         "4. Fire insulation, doors and penetrations per SOLAS II-2 Reg. 9; ref. Method Statement MS-CE-001. SAFETY-CRITICAL ITEMS TO BE VERIFIED BY CLASS-APPROVED ENGINEER."]
for i, n in enumerate(notes):
    text(nx, ny + i * 4.5, n, 2.0, bold=(i == 0))

# Title block
tx, ty = 600, 500
rect(tx, ty, 231, 84, "OUT", 0.6)
for yy in [ty + 14, ty + 30, ty + 46, ty + 62]:
    line(tx, yy, tx + 231, yy, "OUT", 0.3)
line(tx + 115, ty + 46, tx + 115, ty + 84, "OUT", 0.3)
text(tx + 4, ty + 10, "CHIEF ENGINEER'S SUITE - ACCOMMODATION OUTFITTING", 4.2, bold=True)
text(tx + 4, ty + 22, "GA, ELECTRICAL, PLUMBING & SECTION", 3.5)
text(tx + 4, ty + 27, "Generic 190 m cargo vessel - Accommodation deck 'C', STBD, Fr120-131", 2.5)
text(tx + 4, ty + 40, "DWG No: CE-SUITE-GA-001     REV: A (Issued for review)     SHEET 1 / 1", 3)
text(tx + 4, ty + 54, "SCALE: 1:25 @ A1", 2.8); text(tx + 119, ty + 54, "UNITS: mm / m", 2.8)
text(tx + 4, ty + 59, "DRAWN: AI   DATE: 2026-11-11", 2.4); text(tx + 119, ty + 59, "CHECKED: ____  APPROVED: ____", 2.4)
text(tx + 4, ty + 72, "Standards: SOLAS II-2, MLC 2006, IEC 60092,", 2.4); text(tx + 4, ty + 77, "ISO 15748/15749, DNV-RU-SHIP Pt.3 Ch.12, Pt.4 Ch.8", 2.4)
text(tx + 119, ty + 72, "STATUS: PRELIMINARY - NOT FOR", 2.4, "ELEC", bold=True); text(tx + 119, ty + 77, "CONSTRUCTION UNTIL CLASS APPROVED", 2.4, "ELEC", bold=True)

out = svg_head + "\n".join(svg) + "</svg>"
open("/mnt/session/outputs/CE-SUITE-GA-001.svg", "w").write(out)
cairosvg.svg2pdf(bytestring=out.encode(), write_to="/mnt/session/outputs/CE-SUITE-GA-001.pdf")
cairosvg.svg2png(bytestring=out.encode(), write_to="/work/preview.png", output_width=2400)
doc.saveas("/mnt/session/outputs/CE-SUITE-GA-001.dxf")
print("ok")
