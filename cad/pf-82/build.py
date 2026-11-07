"""Johansson PF-82: the instrument as CAD. Every design input below is in millimetres.

Run:  uvx --from build123d python cad/pf-82/build.py

Writes
  cad/pf-82/out/pf-82.step          the solid model in millimetres (not committed; regenerate)
  polivoks/3d/pf82.glb              the same model for three.js, in metres, Y up
  polivoks/3d/pf82-layout.json      where every control sits on the panel and which parameter it drives

The page turns the knobs, presses the keys and lights the LED of this model (polivoks/view3d.js).
Node names use only letters, digits and underscores: three.js strips '.' and ':' from glTF names.
"""
from pathlib import Path
import json
import math
import build123d as b

HERE = Path(__file__).resolve().parent
WEB = HERE.parent.parent / "polivoks" / "3d"

# ---------------------------------------------------------------- design inputs (mm)
W, D = 640.0, 400.0                     # overall width and depth
CHEEK = 20.0                            # walnut end cheeks
INNER = W - 2 * CHEEK                   # 600 between the cheeks
KEY_FLOOR = 40.0                        # top of the key frame
WHITE = dict(pitch=23.5, width=22.5, length=150.0, height=20.0, front=14.0)
BLACK = dict(width=13.0, length=95.0, height=12.0)
KEYS = 37                               # three octaves and a top C: C2 to C5 at the default octave
PANEL_FRONT = (185.0, 78.0)             # (y, z) of the panel's front edge, on the body
PANEL_REAR = (395.0, 140.0)             # (y, z) of its rear edge
PLATE = 2.0                             # aluminium panel thickness
COLORS = dict(case="#202224", cheek="#4b3424", plate="#121314", knob="#1d1d1e", skirt="#0c0c0d",
              pointer="#eeebe4", white="#ede9e0", black="#141414", jack="#8a8c8e", hole="#050505",
              power="#2a2a2a", led="#4a3412", rail="#18191a", foot="#0f0f10")

# The panel frame: origin at the front-left corner of the plate's top face, U across, V up the slope, N outward.
dy, dz = PANEL_REAR[0] - PANEL_FRONT[0], PANEL_REAR[1] - PANEL_FRONT[1]
SLOPE = math.hypot(dy, dz)              # 219 mm along the slope
U = b.Vector(1, 0, 0)
V = b.Vector(0, dy / SLOPE, dz / SLOPE)
N = U.cross(V)                          # (0, -sin, cos): up and toward the player
O = b.Vector(-INNER / 2, PANEL_FRONT[0], PANEL_FRONT[1]) + N * PLATE

parts, layout_controls = [], []


def paint(shape, name, color):
    shape.label = name
    shape.color = b.Color(COLORS.get(color, color))
    return shape


def at(u, v, t=0.0):
    """A point on the panel: u mm across from the left, v mm up the slope from the front edge, t above the plate."""
    return O + U * u + V * v + N * t


def on_panel(u, v, shape, t=0.0):
    return b.Location(b.Plane(origin=at(u, v, t), x_dir=U, z_dir=N)) * shape


def cyl(r, h, z0=0.0):
    return b.Pos(0, 0, z0) * b.Cylinder(r, h, align=(b.Align.CENTER, b.Align.CENTER, b.Align.MIN))


def gltf(p):
    """CAD (Z up, mm) to glTF (Y up, m), the axis change the glTF writer makes."""
    return [round(p.X / 1000, 6), round(p.Z / 1000, 6), round(-p.Y / 1000, 6)]


# ---------------------------------------------------------------- body
PROFILE = [(0, 0), (D, 0), (D, 140), (PANEL_REAR[0], PANEL_REAR[1]), PANEL_FRONT, (172, 74), (166, KEY_FLOOR),
           (10, KEY_FLOOR), (10, 46), (0, 46)]              # side section of the case: (y, z) mm
CHEEK_PROFILE = [(0, 0), (D, 0), (D, 152), (384, 152), (178, 92), (150, 74), (0, 74)]


def body():
    profile, cheek = PROFILE, CHEEK_PROFILE
    shell = b.extrude(b.Plane.YZ * b.Polygon(*profile, align=None), amount=INNER / 2, both=True)
    parts.append(paint(shell, "case", "case"))
    for side, x in (("left", -W / 2 + CHEEK / 2), ("right", W / 2 - CHEEK / 2)):
        c = b.Pos(x, 0, 0) * b.extrude(b.Plane.YZ * b.Polygon(*cheek, align=None), amount=CHEEK / 2, both=True)
        parts.append(paint(c, f"cheek_{side}", "cheek"))
    plate = b.Location(b.Plane(origin=O - N * (PLATE / 2) + U * (INNER / 2) + V * (SLOPE / 2), x_dir=U, z_dir=N)) * b.Box(INNER, SLOPE, PLATE)
    parts.append(paint(plate, "panel", "plate"))
    parts.append(paint(b.Pos(0, 5, 43) * b.Box(INNER, 10, 6), "key_slip", "rail"))
    for i, (x, y) in enumerate([(-280, 30), (280, 30), (-280, 370), (280, 370)]):
        parts.append(paint(b.Pos(x, y, -6) * b.Cylinder(12, 6, align=(b.Align.CENTER, b.Align.CENTER, b.Align.MIN)), f"foot_{i}", "foot"))


# ---------------------------------------------------------------- controls
def knob(node, u, v, r, height):
    skirt = paint(on_panel(u, v, cyl(r + 2.5, 2.4)), f"{node}_skirt", "skirt")
    cap = cyl(r, height, 2.4)
    # A small chamfer on the top edge: crisp in the light, and a few triangles where a round costs thousands.
    cap = b.chamfer(cap.edges().sort_by(b.Axis.Z)[-1], min(1.2, r * 0.12))
    cap = paint(on_panel(u, v, cap), f"{node}_cap", "knob")
    ptr = paint(on_panel(u, v, b.Pos(0, r * 0.5, 2.4 + height + 0.3) * b.Box(1.8, r * 0.9, 0.6)), f"{node}_pointer", "pointer")
    return b.Compound(label=node, children=[skirt, cap, ptr])


def selector(node, u, v):
    """A chicken-head selector: a round boss and a pointed bar, pointing up the slope at the middle position."""
    boss = paint(on_panel(u, v, cyl(7, 9, 1)), f"{node}_cap", "knob")
    bar = paint(on_panel(u, v, b.Pos(0, 4, 1) * b.Box(6, 24, 7, align=(b.Align.CENTER, b.Align.CENTER, b.Align.MIN))), f"{node}_bar", "knob")
    ptr = paint(on_panel(u, v, b.Pos(0, 11, 8.3) * b.Box(1.6, 8, 0.6)), f"{node}_pointer", "pointer")
    base = paint(on_panel(u, v, cyl(9, 1)), f"{node}_skirt", "skirt")
    return b.Compound(label=node, children=[base, boss, bar, ptr])


def jack(node, u, v):
    nut = paint(on_panel(u, v, cyl(5.6, 1.6)), f"{node}_nut", "jack")
    bush = paint(on_panel(u, v, cyl(3.6, 3.2, 1.6)), f"{node}_bush", "jack")
    hole = paint(on_panel(u, v, cyl(2.3, 0.3, 4.8)), f"{node}_hole", "hole")
    return b.Compound(label=node, children=[nut, bush, hole])


# Modules on the panel, as on the page (and the signal-flow map): u0, v0, u1, v1 in panel mm.
ROWS = {1: (130, 192), 2: (66, 128), 3: (2, 64)}
COLS = {1: (4, 198), 2: (202, 398), 3: (402, 596)}
MODULES = [
    ("vco1", "1", "VCO 1", 1, 1), ("vco2", "2", "VCO 2", 2, 1), ("mix", "3", "MIXER", 1, 2), ("eg1", "6", "ENV 1 · FILTER", 2, 2),
    ("amp", "5", "VCA + ENV 2", 1, 3), ("lfo", "7", "LFO", 2, 3), ("voice", "8", "KEYBOARD", 3, 3),
]
# Each module's controls left to right: (parameter, kind, options)
CONTROLS = {
    "vco1": [("vco1.oct", "selector", [-2, -1, 0, 1, 2]), ("vco1.wave", "selector", ["tri", "saw", "square", "pulse"]), ("vco1.pw", "knob", None)],
    "vco2": [("vco2.oct", "selector", [-2, -1, 0, 1, 2]), ("vco2.wave", "selector", ["tri", "saw", "square", "pulse"]), ("vco2.pw", "knob", None), ("vco2.detune", "knob", None)],
    "mix": [("mix.vco1", "knob", None), ("mix.vco2", "knob", None), ("mix.noise", "knob", None), ("src", "selector", ["synth", "line"])],
    "eg1": [("eg1.a", "knob", None), ("eg1.d", "knob", None), ("eg1.s", "knob", None), ("eg1.r", "knob", None)],
    "amp": [("eg2.a", "knob", None), ("eg2.d", "knob", None), ("eg2.s", "knob", None), ("eg2.r", "knob", None), ("vca.mode", "selector", ["env", "open"])],
    "lfo": [("lfo.rate", "knob", None), ("lfo.wave", "selector", ["tri", "square", "saw", "sh"]), ("lfo.pitch", "knob", None), ("lfo.filter", "knob", None), ("lfo.pw", "knob", None)],
    "voice": [("glob.glide", "knob", None), ("glob.track", "knob", None), ("glob.volume", "knob", None), ("glob.mode", "selector", ["mono", "duo"]), ("glob.legato", "selector", ["off", "on"])],
}
node_of = lambda param: "c_" + param.replace(".", "_")  # noqa: E731


def controls():
    modules = []
    for mid, num, title, col, row in MODULES:
        u0, u1 = COLS[col]; v0, v1 = ROWS[row]
        modules.append(dict(id=mid, num=num, title=title, rect=[u0, v0, u1, v1]))
        items = CONTROLS[mid]
        step = (u1 - u0) / len(items)
        for i, (param, kind, options) in enumerate(items):
            u, v = u0 + step * (i + 0.5), (v0 + v1) / 2 - 6
            node = node_of(param)
            parts.append(knob(node, u, v, 10, 15) if kind == "knob" else selector(node, u, v))
            layout_controls.append(dict(node=node, param=param, kind=kind, options=options, u=round(u, 2), v=round(v, 2),
                                        r=10 if kind == "knob" else 9, module=mid, center=gltf(at(u, v))))
    # The filter: two rows of the right-hand column.
    u0, u1 = COLS[3]; v0, v1 = ROWS[2][0], ROWS[1][1]
    modules.append(dict(id="flt", num="4", title="VCF · POLIVOKS FILTER", rect=[u0, v0, u1, v1], main=True))
    for param, u, v, r, h in [("flt.frq", 452, 151, 15, 18), ("flt.res", 548, 151, 15, 18),
                              ("flt.cv1", 420, 116, 10, 15), ("flt.lvl", 500, 116, 10, 15), ("flt.mix", 580, 116, 10, 15)]:  # clear of the big knobs' labels
        node = node_of(param)
        parts.append(knob(node, u, v, r, h))
        layout_controls.append(dict(node=node, param=param, kind="knob", options=None, u=u, v=v, r=r, module="flt", big=r > 12, center=gltf(at(u, v))))
    for k, (jid, label, out) in enumerate([("cv1", "CV 1", None), ("cv2", "CV 2", None), ("in", "AUDIO IN", None),
                                           ("lp", "LP OUT", "lp"), ("bp", "BP OUT", "bp"), ("mix", "MIX OUT", "mix")]):
        u, v = 417 + 32 * k, 80
        node = f"jack_{jid}"
        parts.append(jack(node, u, v))
        layout_controls.append(dict(node=node, param="flt.out" if out else None, kind="jack", value=out, label=label, u=u, v=v, r=5.6, module="flt", center=gltf(at(u, v))))
    return modules


def header():
    """Wordmark strip at the rear of the panel: the power rocker and its lamp on the right."""
    rocker = b.Compound(label="power", children=[
        paint(on_panel(574, 207, b.Box(20, 12, 3, align=(b.Align.CENTER, b.Align.CENTER, b.Align.MIN))), "power_bezel", "rail"),
        paint(on_panel(574, 207, b.Pos(0, 0, 3) * b.Box(16, 9, 5, align=(b.Align.CENTER, b.Align.CENTER, b.Align.MIN))), "power_rocker", "power"),
    ])
    parts.append(rocker)
    parts.append(paint(on_panel(548, 207, cyl(3.2, 3.5)), "led", "led"))
    return dict(power=dict(node="power", u=574, v=207, center=gltf(at(574, 207))), led=dict(node="led", u=548, v=207))


# ---------------------------------------------------------------- keys
def keys():
    whites = [0, 2, 4, 5, 7, 9, 11]
    x0 = -WHITE["pitch"] * 22 / 2
    nodes, wi = [], 0
    for i in range(KEYS):
        semis = i % 12
        if semis in whites:
            x = x0 + WHITE["pitch"] * (wi + 0.5)
            k = b.Pos(x, WHITE["front"] + WHITE["length"] / 2, KEY_FLOOR + WHITE["height"] / 2) * b.Box(WHITE["width"], WHITE["length"], WHITE["height"])
            parts.append(paint(k, f"key_{i}", "white"))
            wi += 1
        else:
            x = x0 + WHITE["pitch"] * wi
            y = WHITE["front"] + WHITE["length"] - BLACK["length"] / 2
            k = b.Pos(x, y, KEY_FLOOR + WHITE["height"] + BLACK["height"] / 2 - 4) * b.Box(BLACK["width"], BLACK["length"], BLACK["height"] + 4)
            parts.append(paint(k, f"key_{i}", "black"))
        nodes.append(f"key_{i}")
    return dict(nodes=nodes, count=KEYS, travel_mm=4.0)


def main():
    body()
    modules = controls()
    head = header()
    keyinfo = keys()
    model = b.Compound(label="pf82", children=parts)
    (HERE / "out").mkdir(exist_ok=True)
    WEB.mkdir(parents=True, exist_ok=True)
    b.export_step(model, HERE / "out" / "pf-82.step")
    b.export_gltf(model, WEB / "pf82.glb", binary=True, linear_deflection=0.2, angular_deflection=0.3)
    layout = dict(
        units="m", note="Generated by cad/pf-82/build.py. Panel coordinates u, v in mm; centers and vectors in glTF metres, Y up.",
        size_mm=dict(width=W, depth=D, height=152, cheek=CHEEK, inner=INNER, key_floor=KEY_FLOOR),
        profile_mm=PROFILE, cheek_profile_mm=CHEEK_PROFILE, white_key_mm=WHITE, black_key_mm=BLACK,
        slope_deg=round(math.degrees(math.atan2(dz, dy)), 2),
        panel=dict(origin=gltf(O), u=gltf(U * 1000), v=gltf(V * 1000), n=gltf(N * 1000), width_mm=INNER, height_mm=round(SLOPE, 2)),
        modules=modules, controls=layout_controls, keys=keyinfo, **head,
    )
    (WEB / "pf82-layout.json").write_text(json.dumps(layout, indent=1) + "\n", encoding="utf-8")
    print(f"{len(layout_controls)} controls, {keyinfo['count']} keys; wrote {WEB / 'pf82.glb'} ({(WEB / 'pf82.glb').stat().st_size // 1024} KB)")


if __name__ == "__main__":
    main()
