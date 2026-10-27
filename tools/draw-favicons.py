#!/usr/bin/env python3
"""Draw the site's three favicons as vector geometry and write their SVG and PNG files.

  office  The Office of Nils Johansson: the seal, a cream stamp disc on the brand teal with
          N and J in warm ink.
  hotels  Hotels & Parking: on the register's near-black ink, a free-parking-green P above
          a white bed.
  world   Johansson World: on the island navy, a red hip-roofed house on a sand island in a
          teal sea, a small sun in the corner.

Each icon is a 512-unit tile. Straight edges sit on a 32-unit grid, so at 16 px (one pixel =
32 units) the tab icon is built from whole pixels. Letters are geometry, never <text>.
Designed through a panel of four independent sets, three judges and skeptics checking the
true 16 px pixels (handover: docs/HANDOVER-FAVICONS-2026-10-27.md).

  python3 tools/draw-favicons.py            # SVGs, then PNGs rendered by Chromium
  python3 tools/draw-favicons.py --svg-only
"""
import argparse
import math
import os
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
S = 512            # tile size
TILE_R = 112       # tile corner radius


def fmt(v):
    """Compact number formatting for SVG attributes."""
    if isinstance(v, float):
        s = f"{v:.2f}".rstrip("0").rstrip(".")
        return "0" if s in ("-0", "") else s
    return str(v)


def tile_d(r=TILE_R):
    return (f"M{r},0 H{S - r} A{r},{r} 0 0 1 {S},{r} V{S - r} A{r},{r} 0 0 1 {S - r},{S}"
            f" H{r} A{r},{r} 0 0 1 0,{S - r} V{r} A{r},{r} 0 0 1 {r},0 Z")


def tile(fill):
    return f'<path d="{tile_d()}" fill="{fill}"/>'


def tile_clip(name="tile"):
    return f'<defs><clipPath id="{name}"><path d="{tile_d()}"/></clipPath></defs>'


def circle(cx, cy, r, fill):
    return f'<circle cx="{fmt(cx)}" cy="{fmt(cy)}" r="{fmt(r)}" fill="{fill}"/>'


def path(d, fill, clip=None, rule=None):
    extra = f' clip-path="url(#{clip})"' if clip else ""
    if rule:
        extra += f' fill-rule="{rule}"'
    return f'<path d="{d}" fill="{fill}"{extra}/>'


def poly_d(points):
    return "M" + " L".join(f"{fmt(x)},{fmt(y)}" for x, y in points) + " Z"


def rounded_poly_d(points, radii):
    """Closed polygon with a circular fillet of the given radius at each vertex.

    points: [(x, y), ...] in order; radii: one radius per vertex (0 = sharp).
    Each fillet is an arc tangent to both edges at the vertex; the sweep follows the
    turn direction, so convex and concave corners both round correctly."""
    n = len(points)
    corners = []
    for i in range(n):
        px, py = points[i]
        qx, qy = points[i - 1]
        nx, ny = points[(i + 1) % n]
        r = radii[i]
        if r <= 0:
            corners.append(((px, py), (px, py), 0, 0))
            continue
        ax, ay = qx - px, qy - py                    # towards previous
        bx, by = nx - px, ny - py                    # towards next
        la, lb = math.hypot(ax, ay), math.hypot(bx, by)
        ax, ay, bx, by = ax / la, ay / la, bx / lb, by / lb
        cos_t = max(-1.0, min(1.0, ax * bx + ay * by))
        theta = math.acos(cos_t)                     # angle between the edges
        t = r / math.tan(theta / 2)                  # tangent length
        assert t <= min(la, lb), (points[i], r, t)
        a = (px + ax * t, py + ay * t)
        b = (px + bx * t, py + by * t)
        cross = (-ax) * by - (-ay) * bx              # turn from incoming to outgoing
        sweep = 1 if cross > 0 else 0
        corners.append((a, b, r, sweep))
    d = ""
    for i in range(n):
        a, b, r, sweep = corners[i]
        d += (" L" if d else "M") + f"{fmt(a[0])},{fmt(a[1])}"
        if r > 0:
            d += f" A{fmt(r)},{fmt(r)} 0 0 {sweep} {fmt(b[0])},{fmt(b[1])}"
    return d + " Z"


def rounded_poly(points, radii, fill):
    return path(rounded_poly_d(points, radii), fill)


def pt(cx, cy, r, deg):
    a = math.radians(deg)
    return cx + r * math.cos(a), cy + r * math.sin(a)


def svg(body, title):
    title = title.replace("&", "&amp;")
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}" '
            f'width="{S}" height="{S}" role="img" aria-label="{title}">\n'
            + "\n".join(body) + "\n</svg>\n")


def on_grid(*values, step=32):
    for v in values:
        assert v % step == 0, f"{v} is not on the {step}-unit grid"


def letter_n(x0, x1, top, base, w, fillet):
    """A geometric N as one outline: two stems, a diagonal of near-stem weight,
    open counters top and bottom. Convex corners filleted, counter apexes sharp."""
    h = base - top
    # horizontal width d of the diagonal so its perpendicular weight is ~0.94 w
    # (diagonals look heavier than stems of the same weight)
    d = w
    for _ in range(40):
        ang = math.atan2(h, (x1 - x0) - d)
        d = 0.94 * w / math.sin(ang)
    # where the diagonal's right edge enters the right stem, and its left edge leaves the left stem
    y_in = top + h * ((x1 - w) - (x0 + d)) / ((x1 - x0) - d)
    y_out = top + h * w / ((x1 - d) - x0)
    pts = [(x0, top), (x0 + d, top), (x1 - w, y_in), (x1 - w, top), (x1, top),
           (x1, base), (x1 - d, base), (x0 + w, y_out), (x0 + w, base), (x0, base)]
    rad = [fillet, fillet, 0, fillet, fillet, fillet, fillet, 0, fillet, fillet]
    return rounded_poly_d(pts, rad)


def letter_j(x1, top, base, w, hook_r, fillet, hook_end=172, overshoot=6):
    """A geometric J without a top bar: stem on the right, hook curling left to
    hook_end degrees, the hook's bottom overshooting the baseline a little."""
    cx = x1 - hook_r
    cy = base + overshoot - hook_r
    r_in = hook_r - w
    assert r_in >= 20, r_in
    f = fillet
    to = pt(cx, cy, hook_r, hook_end)
    ti = pt(cx, cy, r_in, hook_end)
    # a radial end cut, with the same small fillet on its two corners: approximated by
    # shortening the cut and bridging with two quarter-ish arcs is overkill at this
    # size; the cut is kept clean and square to the curve.
    return (f"M{fmt(x1 - w + f)},{fmt(top)} H{fmt(x1 - f)} A{f},{f} 0 0 1 {fmt(x1)},{fmt(top + f)}"
            f" V{fmt(cy)} A{fmt(hook_r)},{fmt(hook_r)} 0 0 1 {fmt(to[0])},{fmt(to[1])}"
            f" L{fmt(ti[0])},{fmt(ti[1])} A{fmt(r_in)},{fmt(r_in)} 0 0 0 {fmt(cx + r_in)},{fmt(cy)}"
            f" V{fmt(top + f)} A{f},{f} 0 0 1 {fmt(x1 - w + f)},{fmt(top)} Z")



# ---------------------------------------------------------------- office ---
def office():
    """The seal: teal tile, cream stamp disc (r 236, a thin teal rim), N and J in warm ink.
    Letters 224 tall (144..368, 7 px at 16 px), stroke 60."""
    teal, cream, ink = "#3ea88c", "#f5f0e8", "#3d3a37"
    disc_r = 236
    w, fillet = 60, 18
    top, base = 144, 368
    n_x0, n_x1 = 72, 256
    j_x1, hook_r = 440, 84
    for x, y in ((n_x0, top), (j_x1, top), (n_x0, base), (j_x1 - hook_r, base + 6)):
        assert math.hypot(x - 256, y - 256) <= disc_r - 14, (x, y)
    assert (j_x1 - 2 * hook_r) - n_x1 >= 16
    body = [tile(teal),
            circle(256, 256, disc_r, cream),
            path(letter_n(n_x0, n_x1, top, base, w, fillet), ink),
            path(letter_j(j_x1, top, base, w, hook_r, fillet), ink)]
    return svg(body, "The Office of Nils Johansson")


# ---------------------------------------------------------------- hotels ---
def hotels():
    """Hotels & Parking: near-black tile, a green P (stem 128..192, 64..288; bowl to 288
    wide, counter 64 x 64), a whole 64-unit gap, then a white bed of its own: a headboard
    post 96..160 x 320..448, a pillow, the mattress 160..416 x 352..416 and a foot leg."""
    ink, green, white = "#08131a", "#22c55e", "#ffffff"
    w, f = 64, 18
    x0, top, p_bottom = 128, 64, 288
    r_out = 96
    cx = x0 + w + 32                               # 224
    r_in = r_out - w                               # 32
    bowl_b = top + 2 * r_out                       # 256
    p_d = (f"M{x0 + f},{top} H{cx} A{r_out},{r_out} 0 0 1 {cx},{bowl_b} H{x0 + w}"
           f" V{p_bottom - f} A{f},{f} 0 0 1 {x0 + w - f},{p_bottom} H{x0 + f}"
           f" A{f},{f} 0 0 1 {x0},{p_bottom - f} V{top + f} A{f},{f} 0 0 1 {x0 + f},{top} Z"
           f" M{x0 + w},{top + w} H{cx} A{r_in},{r_in} 0 0 1 {cx},{bowl_b - w} H{x0 + w} Z")
    head_l, head_r, head_t = 96, 160, 320
    m_r, m_t, m_b, floor = 416, 352, 416, 448
    leg_l = 352
    on_grid(x0, top, p_bottom, cx, head_l, head_r, head_t, m_r, m_t, m_b, floor, leg_l)
    assert head_t - p_bottom >= 32                 # the P and the bed never touch
    bed = [(head_l, head_t), (head_r, head_t), (head_r, m_t), (m_r, m_t), (m_r, floor),
           (leg_l, floor), (leg_l, m_b), (head_r, m_b), (head_r, floor), (head_l, floor)]
    bed_r = [f, f, 0, 28, f, f, 0, 0, f, f]
    pillow = rounded_poly([(176, 320), (256, 320), (256, 344), (176, 344)], [12, 12, 0, 0], white)
    body = [tile(ink), path(p_d, green, rule="evenodd"), rounded_poly(bed, bed_r, white), pillow]
    return svg(body, "Hotels & Parking")


# ----------------------------------------------------------------- world ---
def world():
    """Johansson World: navy tile; a small sand sun (r 56) up in the right corner, clear of
    the roof; a red hip roof (ridge 192..320 at 128, eaves 64..448 at 256); tall cream walls
    96..416 x 256..384 with a navy doorway; a sand island 384..416; teal sea below."""
    navy, sun_c, roof, wall = "#294b60", "#f3c34c", "#b4523d", "#fcf0d0"
    ground, sea = "#d8b36e", "#63929a"
    sun_cx, sun_cy, sun_r = 400, 104, 56
    ridge_y, eave_y, wall_b, sea_y = 128, 256, 384, 416
    ridge_l, ridge_r = 192, 320
    eave_l, eave_r = 64, 448
    wall_l, wall_r = 96, 416
    door_l, door_r, door_t = 224, 288, 288
    on_grid(ridge_y, eave_y, wall_b, sea_y, eave_l, eave_r, wall_l, wall_r, door_l, door_r, door_t)
    # the sun sits above the roof slope it overlaps horizontally
    slope_y = ridge_y + (eave_y - ridge_y) * (sun_cx - ridge_r) / (eave_r - ridge_r)
    assert sun_cy + sun_r + 16 <= slope_y, (sun_cy + sun_r, slope_y)
    assert sun_cy - sun_r >= 0.08 * S and sun_cx + sun_r <= 0.92 * S
    body = [tile(navy), tile_clip(),
            circle(sun_cx, sun_cy, sun_r, sun_c),
            path(f"M{wall_l},{eave_y} H{wall_r} V{wall_b} H{wall_l} Z", wall),
            path(poly_d([(ridge_l, ridge_y), (ridge_r, ridge_y), (eave_r, eave_y), (eave_l, eave_y)]), roof),
            rounded_poly([(door_l, door_t), (door_r, door_t), (door_r, wall_b), (door_l, wall_b)], [24, 24, 0, 0], navy),
            rounded_poly([(32, wall_b), (480, wall_b), (480, sea_y), (32, sea_y)], [16, 16, 0, 0], ground),
            path(f"M-16,{sea_y} H{S + 16} V{S + 16} H-16 Z", sea, clip="tile")]
    return svg(body, "Johansson World")


ICONS = {'office': office, 'hotels': hotels, 'world': world}
# Where each icon is published. PNG sizes: 180 is Apple's touch icon; 192/512 are the app manifest's.
OUTPUTS = {
    'office': {'svg': 'assets/images/favicon.svg', 'png': {180: 'assets/images/apple-touch-icon.png'}},
    'hotels': {'svg': 'assets/images/favicon-hotels.svg', 'png': {180: 'assets/images/apple-touch-icon-hotels.png'}},
    'world': {'svg': 'johansson-town/assets/icons/town.svg',
              'png': {192: 'johansson-town/assets/icons/town-192.png', 512: 'johansson-town/assets/icons/town-512.png'}},
}


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--svg-only', action='store_true', help='Skip the Chromium PNG renders')
    args = parser.parse_args()
    for name, out in OUTPUTS.items():
        (ROOT / out['svg']).write_text(ICONS[name](), encoding='utf-8')
        print('wrote', out['svg'])
        if args.svg_only:
            continue
        for size, rel in out['png'].items():
            subprocess.run(['node', str(ROOT / 'tools/render-favicons.cjs'), 'png', str(ROOT / out['svg']), str(size), str(ROOT / rel)], check=True)
            print('wrote', rel)


if __name__ == '__main__':
    main()
