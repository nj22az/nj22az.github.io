"""A small CAD sheet engine on ezdxf, for the bridge drawings (A1 sheets, metres at a stated scale, drawn in sheet millimetres).

A Sheet writes DXF (R2010, millimetres on the sheet) and renders a PDF and a PNG of the same entities through ezdxf's
matplotlib back end, so what the DXF holds is what the paper shows. A View maps the ship's metres onto the sheet at a
scale, so a line can be placed by its ship coordinates: plan (x to port is drawn to the left, the bow up), a section across
the ship looking forward (port left), or a section along it looking to port (bow right).
"""
import math
import os

import ezdxf
from ezdxf import units
from ezdxf.enums import TextEntityAlignment as TA

A1 = (841.0, 594.0)

LAYERS = {   # name: (aci colour, lineweight in 1/100 mm, linetype)
    'FRAME': (7, 50, 'CONTINUOUS'), 'TITLE': (7, 35, 'CONTINUOUS'), 'TEXT': (7, 18, 'CONTINUOUS'),
    'WALL': (7, 35, 'CONTINUOUS'), 'CUT': (7, 25, 'CONTINUOUS'), 'LOW': (8, 13, 'CONTINUOUS'),
    'FURN': (8, 18, 'CONTINUOUS'), 'EQUIP': (3, 25, 'CONTINUOUS'), 'GLASS': (5, 25, 'CONTINUOUS'),
    'DOOR': (4, 25, 'CONTINUOUS'), 'DIM': (2, 13, 'CONTINUOUS'), 'THIN': (8, 13, 'CONTINUOUS'),
    'TAG': (3, 18, 'CONTINUOUS'), 'FIND': (1, 25, 'CONTINUOUS'), 'SIGHT': (30, 18, 'DASHED'),
    'HIDDEN': (8, 13, 'DASHED'), 'NEW': (6, 35, 'CONTINUOUS'), 'MISSING': (1, 25, 'DASHED'),
    'POWER': (5, 35, 'CONTINUOUS'), 'WATER': (4, 35, 'CONTINUOUS'), 'FIRE': (1, 35, 'CONTINUOUS'), 'WASTE': (30, 35, 'CONTINUOUS'),
    'FUEL': (2, 35, 'CONTINUOUS'), 'CTRL': (6, 25, 'CONTINUOUS'),
}


# readable on white paper (the AutoCAD index colours 2, 3 and 30 are too pale)
RGB = {'DIM': (30, 70, 160), 'TAG': (0, 105, 60), 'EQUIP': (0, 105, 60), 'FIND': (200, 0, 0), 'MISSING': (200, 0, 0), 'SIGHT': (215, 105, 0),
       'NEW': (150, 0, 150), 'GLASS': (30, 90, 200), 'DOOR': (0, 130, 150), 'POWER': (30, 70, 160), 'WATER': (0, 120, 180), 'FIRE': (200, 0, 0),
       'WASTE': (130, 80, 20), 'FUEL': (150, 120, 0), 'CTRL': (150, 0, 150), 'LOW': (140, 140, 140), 'FURN': (110, 110, 110), 'THIN': (140, 140, 140),
       'HIDDEN': (140, 140, 140)}


class Sheet:
    def __init__(self, no, title, subtitle, scales, notes=(), size=A1, source=''):
        self.no, self.title, self.size = no, title, size
        self.doc = ezdxf.new('R2010', setup=True)
        self.doc.units = units.MM
        self.doc.styles.add('SANS', font='DejaVuSans.ttf')
        self.doc.styles.add('SANSB', font='DejaVuSans-Bold.ttf')
        for name, (col, lw, lt) in LAYERS.items():
            layer = self.doc.layers.add(name, color=col, lineweight=lw, linetype=lt)
            if name in RGB:
                layer.rgb = RGB[name]
        self.msp = self.doc.modelspace()
        self._frame(no, title, subtitle, scales, notes, source)

    # ------------------------------------------------------------------ primitives (sheet millimetres)
    def line(self, p, q, layer='THIN'):
        return self.msp.add_line(p, q, dxfattribs={'layer': layer})

    def poly(self, pts, layer='CUT', closed=False):
        return self.msp.add_lwpolyline(pts, close=closed, dxfattribs={'layer': layer})

    def rect(self, x0, y0, x1, y1, layer='CUT'):
        return self.poly([(x0, y0), (x1, y0), (x1, y1), (x0, y1)], layer, True)

    def circle(self, c, r, layer='CUT'):
        return self.msp.add_circle(c, r, dxfattribs={'layer': layer})

    def arc(self, c, r, a0, a1, layer='CUT'):
        return self.msp.add_arc(c, r, a0, a1, dxfattribs={'layer': layer})

    def fill(self, pts, layer='FURN', color=None):
        h = self.msp.add_hatch(color=color if color is not None else 7, dxfattribs={'layer': layer})
        h.paths.add_polyline_path(pts, is_closed=True)
        return h

    def text(self, x, y, s, h=2.5, layer='TEXT', anchor='l', rot=0, bold=False):
        t = self.msp.add_text(str(s), height=h, rotation=rot, dxfattribs={'layer': layer, 'style': 'SANSB' if bold else 'SANS'})
        t.set_placement((x, y), align={'l': TA.LEFT, 'c': TA.CENTER, 'r': TA.RIGHT, 'm': TA.MIDDLE_CENTER}[anchor])
        return t

    def wrapped(self, x, y, s, width, h=2.4, layer='TEXT', lead=1.35, bold=False):
        """Text wrapped to `width` mm, top-left at (x, y), going down. Returns the y below the last line."""
        cw = h * 0.66
        n = max(8, int(width / cw))
        for para in str(s).split('\n'):
            line = ''
            for w in para.split(' '):
                if len(line) + len(w) + (1 if line else 0) > n and line:
                    self.text(x, y - h, line, h, layer, bold=bold)
                    y -= h * lead
                    line = w
                else:
                    line = (line + ' ' + w) if line else w
            self.text(x, y - h, line, h, layer, bold=bold)
            y -= h * lead
        return y

    def balloon(self, x, y, label, r=3.0, layer='TAG', fill=False):
        self.circle((x, y), r, layer)
        self.text(x, y, label, r * 0.78, layer, 'm')

    def tick_dim(self, p, q, label, off=4.0, layer='DIM', h=2.2):
        """A dimension line between two sheet points, offset by `off` to the left of p→q, with end ticks and its text."""
        dx, dy = q[0] - p[0], q[1] - p[1]
        L = math.hypot(dx, dy) or 1
        nx, ny = -dy / L, dx / L
        a = (p[0] + nx * off, p[1] + ny * off)
        b = (q[0] + nx * off, q[1] + ny * off)
        self.line(p, (a[0] + nx * 1.0, a[1] + ny * 1.0), layer)
        self.line(q, (b[0] + nx * 1.0, b[1] + ny * 1.0), layer)
        self.line(a, b, layer)
        for c in (a, b):
            self.line((c[0] - dx / L * 1.2 - nx * 1.2, c[1] - dy / L * 1.2 - ny * 1.2), (c[0] + dx / L * 1.2 + nx * 1.2, c[1] + dy / L * 1.2 + ny * 1.2), layer)
        ang = math.degrees(math.atan2(dy, dx))
        if ang > 90 or ang < -90:
            ang += 180
        m = ((a[0] + b[0]) / 2 + nx * 1.6, (a[1] + b[1]) / 2 + ny * 1.6)
        self.text(m[0], m[1], label, h, layer, 'm', rot=ang)

    # ------------------------------------------------------------------ the frame and title block
    def _frame(self, no, title, subtitle, scales, notes, source):
        w, h = self.size
        self.rect(5, 5, w - 5, h - 5, 'FRAME')
        self.rect(10, 10, w - 10, h - 10, 'FRAME')
        bw, bh = 175.0, 58.0
        x0, y0 = w - 10 - bw, 10
        self.rect(x0, y0, w - 10, y0 + bh, 'TITLE')
        self.line((x0, y0 + 40), (w - 10, y0 + 40), 'TITLE')
        self.line((x0, y0 + 25), (w - 10, y0 + 25), 'TITLE')
        self.line((x0 + 120, y0), (x0 + 120, y0 + 25), 'TITLE')
        self.text(x0 + 3, y0 + 44, 'THE CHRISTINA · bridge survey, Rev A', 2.6, bold=True)
        self.text(x0 + 3, y0 + 30, title, min(4.2, 168 / (0.62 * len(title))), bold=True)
        self.text(x0 + 3, y0 + 17.5, subtitle[:80], min(2.4, 112 / (0.72 * max(1, len(subtitle[:80])))))
        self.text(x0 + 3, y0 + 12, 'Scale ' + ' · '.join(scales), 2.4)
        self.text(x0 + 3, y0 + 6.5, 'Metres on the sheet at the stated scale; DXF in sheet millimetres', 1.9)
        self.text(x0 + 3, y0 + 2.5, source, 1.9)
        self.text(x0 + 123, y0 + 17.5, 'Drawing no.', 1.9)
        self.text(x0 + 123, y0 + 9, f'CHR-{no}', 5.0, bold=True)
        self.text(x0 + 3, y0 + 49, 'Drawn from ferry/data/ferry.bin.gz and the Town data at the commit below; not for construction', 1.9)
        self.title_box = (x0, y0, w - 10, y0 + bh)

    # ------------------------------------------------------------------ output
    def save(self, base):
        self.doc.saveas(base + '.dxf')
        render(self.doc, base, self.size)


class View:
    """Ship metres to sheet millimetres at 1:`scale`. kind: 'plan' (x→ left, z up), 'cross' (x→ left, y up), 'long' (z→ right, y up)."""

    def __init__(self, kind, scale, region, origin):
        self.kind, self.k, self.region, self.o = kind, 1000.0 / scale, region, origin

    def __call__(self, a, b):
        x0, x1, y0, y1 = self.region
        if self.kind == 'long':
            return (self.o[0] + (a - x0) * self.k, self.o[1] + (b - y0) * self.k)
        return (self.o[0] + (x1 - a) * self.k, self.o[1] + (b - y0) * self.k)

    @property
    def size(self):
        x0, x1, y0, y1 = self.region
        return ((x1 - x0) * self.k, (y1 - y0) * self.k)

    def box(self, sheet, layer='THIN'):
        w, h = self.size
        sheet.rect(self.o[0], self.o[1], self.o[0] + w, self.o[1] + h, layer)


def render(doc, base, size, dpi=70):
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    from ezdxf.addons.drawing import Frontend, RenderContext
    from ezdxf.addons.drawing.config import BackgroundPolicy, ColorPolicy, Configuration
    from ezdxf.addons.drawing.matplotlib import MatplotlibBackend
    w, h = size
    fig = plt.figure(figsize=(w / 25.4, h / 25.4))
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, w)
    ax.set_ylim(0, h)
    ax.set_aspect('equal')
    ax.axis('off')
    cfg = Configuration(background_policy=BackgroundPolicy.WHITE, color_policy=ColorPolicy.COLOR, lineweight_scaling=1.0, min_lineweight=0.12)
    Frontend(RenderContext(doc), MatplotlibBackend(ax), config=cfg).draw_layout(doc.modelspace())
    # the back end fits the view to the drawing and shrinks the figure: put the sheet back, edge to edge
    fig.set_size_inches(w / 25.4, h / 25.4)
    ax.set_position([0, 0, 1, 1])
    ax.set_xlim(0, w)
    ax.set_ylim(0, h)
    fig.savefig(base + '.pdf')
    fig.savefig(base + '.png', dpi=dpi)
    plt.close(fig)
