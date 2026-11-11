"""
The owner's drinks machine, JPVM-2R20, read from its own file (assets/jpvm-2r20/vending_machine.glb) for the two places
that need it: vending.py, which stands it in the lobby, and atlas.py, which draws what is lettered on it.
No Blender here: numpy, and Pillow for the pictures.

Everything is given in the axes of the machine's own script (assets/jpvm-2r20/vending_machine.py): x to the right as one
faces it, y from the front (the customer's side) toward the back, z up from the floor; the origin on the floor under the
middle of the cabinet's front. Metres.

Two things in the file are not where its script means them (the owner is told):

  the pivots      the door's hinge, the flap's bar and the coin return's two pivots are at the origin: the script gives
                  each its place, then loses it when it hangs the pivot on its parent (`setparent` copies a place that
                  Blender has not worked out yet), so the file's door turns about the middle of its own front. PIVOTS has
                  them from the script.
  the lettering   every line of lettering lies flat on the floor at the origin, in one heap, for the same reason, and at
                  a third of the size the script names. It is in Japanese only and names no drink.

The owner, 11 November 2026, of the lettering: "Use English so we can see what we are selling , English and Japanese".
So the file's lettering is not used. The machine is lettered anew, in both languages (pictures(), drawn onto her sheet):
each selection's label names the drink over its price; a menu of the seven drinks is on the door's lower panel; the money
panel's notices, the header, the sold-out lamps, the card reader and the recycling plate say what they say in both.

What it sells is Johansson World's own line-up (johansson-town: src/commerce/vending-catalogue.js, read from the owner's
site): SELL below, with why each is there and where it stands (ROWS).
"""
import os
import re
import numpy as np
import glb

HERE = os.path.dirname(os.path.abspath(__file__))
ASSET = os.path.join(HERE, 'assets', 'jpvm-2r20', 'vending_machine.glb')
W, D, H = 1.000, 0.700, 1.830                  # the cabinet; the door stands 60 mm in front of it
DOOR = 0.060
# The pivots, from the script: where, the axis each turns about, and how far the script turns it.
PIVOTS = dict(
    door=dict(at=(-W / 2, -0.005, 0.06), axis='z', turn=-100.0),          # hinged on its left
    flap=dict(at=(-0.12, -DOOR + 0.004, 0.38), axis='x', turn=75.0),      # the take-out flap, pushed in on the bar at its top
    lever=dict(at=(0.365, -0.072, 1.14), axis='x', turn=25.0),            # the coin return lever
    change=dict(at=(0.365, -0.074, 0.98), axis='x', turn=-51.6),          # the change cup's flap
)
SOLD_OUT = ('R1C01',)                          # the selections whose sold-out lamp is lit (the file: soldout_R1C01 = 1)
DUMMIES_BACK = 0.028                           # the display cans and bottles stand this much further back (see vending.py)

# ---- What the machine sells aboard: the Town's drinks (the World's brands, what each is, its colour), with the Japanese
# each is asked for by. `why` is who it is for on a ferry between Minato and Kitano-jima.
SELL = {
    'sanpin': dict(brand='SANPIN', en='Jasmine tea', jp='さんぴん茶', colour=0xc9a33a,
                   why="the island's own tea, what most aboard ask for first: three columns of bottles and a can"),
    'harbour-tea': dict(brand='HARBOUR TEA', en='Green tea', jp='緑茶', colour=0x366451,
                        why='unsweetened green tea, cold in a bottle for the crossing and hot in a can for the early sailing'),
    'shikuwasa': dict(brand='SHIKUWASA', en='Citrus soda', jp='シークヮーサー', colour=0x7bb342,
                      why="the island's citrus as a soda: for children and for a hot afternoon on deck"),
    'ryukyu-cola': dict(brand='RYUKYU COLA', en='Cola', jp='琉球コーラ', colour=0xb3262e, why='the cola, for those who want nothing else'),
    'j-coffee': dict(brand='J-COFFEE', en='Black coffee', jp='ブラックコーヒー', colour=0x141414,
                     why='strong and unsweetened, a big can: for drivers and the deck crew, cold or hot'),
    'dockside-coffee': dict(brand='DOCKSIDE', en='Milk coffee', jp='缶コーヒー', colour=0x784632,
                            why='the sweet canned coffee of every quay, cold or hot'),
    'corn-soup': dict(brand='CORN SOUP', en='Corn soup', jp='コーンスープ', colour=0xe8b030,
                      why='something warm to hold on a winter morning crossing; hot only'),
}
# Where each stands: the upper row is ten cans, the right-hand four of them kept hot (the file's hot zone, R1C07 to C10);
# the lower row is ten 500 ml bottles, cold. Tea takes the most columns, as it sells the most; what is drunk hot stands
# together at the right, by the money panel, where the red buttons are.
ROWS = (('harbour-tea', 'sanpin', 'shikuwasa', 'ryukyu-cola', 'j-coffee', 'dockside-coffee', 'dockside-coffee', 'j-coffee', 'corn-soup', 'harbour-tea'),
        ('sanpin', 'sanpin', 'sanpin', 'harbour-tea', 'harbour-tea', 'harbour-tea', 'shikuwasa', 'shikuwasa', 'ryukyu-cola', 'ryukyu-cola'))
# One price for a can and one for a bottle: the commonest price of each row in the file's own table (which gives every
# selection a price of its own, 110 to 200 yen, whatever stands in it).
PRICE = dict(can=130, bottle=160)
MENU = ('sanpin', 'harbour-tea', 'shikuwasa', 'ryukyu-cola', 'j-coffee', 'dockside-coffee', 'corn-soup')
# The notices on the money panel and over the take-out port, each a printed strip: its middle (x, z), its size, the face
# it lies on (y), and what it says in English and in Japanese.
_PX = 0.365
STRIPS = {
    'jpvm_coins': dict(at=(_PX, 1.332), size=(0.180, 0.015), face=-0.066, en='COINS', jp='硬貨', more='¥10  ¥50  ¥100  ¥500'),
    'jpvm_note': dict(at=(_PX, 1.205), size=(0.120, 0.015), face=-0.066, en='¥1000 NOTE', jp='千円札'),
    'jpvm_lever': dict(at=(_PX, 1.100), size=(0.150, 0.015), face=-0.066, en='RETURN LEVER', jp='返却レバー'),
    'jpvm_change': dict(at=(_PX, 0.896), size=(0.110, 0.015), face=-0.066, en='CHANGE', jp='おつり'),
    'jpvm_takeout': dict(at=(-0.12, 0.412), size=(0.260, 0.026), face=-0.060, en='TAKE OUT', jp='取出口', more='PUSH  押す'),
}
MENU_AT = dict(at=(-0.12, 0.615), size=(0.700, 0.320), face=-0.060)      # the menu, on the door's white lower panel

_doc = None


def doc():
    global _doc
    if _doc is None:
        _doc = glb.read(ASSET)
    return _doc


def B(p):
    """The file's axes (glTF: y up, z toward the customer) to the script's (y toward the back, z up)."""
    p = np.asarray(p, dtype=np.float64)
    return np.stack([p[..., 0], -p[..., 2], p[..., 1]], -1)


def srgb(linear):
    """A colour of the file (linear) as the yard's parts carry it (sRGB)."""
    c = np.clip(np.asarray(linear, dtype=np.float64), 0, 1)
    return tuple(np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(c, 1 / 2.4) - 0.055))


def box(name):
    """The box round a part of the machine: (low corner, high corner)."""
    pts = np.concatenate([B(pos) for pos, _, _, _ in glb.placed(doc(), name)])
    return pts.min(0), pts.max(0)


def selections():
    """The twenty selections: its name (R1C01 ...), its label's and its lamp's boxes, what stands in it, hot or cold, its price."""
    d = doc()
    out = []
    for name in sorted(d['by_name']):
        m = re.match(r'VM_HMI_Button_(R(\d)C(\d\d))$', name)
        if not m:
            continue
        sid, row, col = m.group(1), int(m.group(2)), int(m.group(3))
        tag = d['nodes'][d['by_name'][f'VM_Display_Dummy_{sid}']]['extras']
        kind = 'can' if row == 1 else 'bottle'
        out.append(dict(id=sid, row=row, col=col, label=box(f'VM_HMI_PriceLabel_{sid}'), lamp=box(f'VM_HMI_SoldOutLamp_{sid}'),
                        hot=tag.get('zone') == 'HOT', sells=ROWS[row - 1][col - 1], kind=kind, price=PRICE[kind]))
    return out


def label_tile(s):
    return f"jpvm_label_{s['sells']}_{s['kind']}_{'hot' if s['hot'] else 'cold'}"


def _rgb(hexv):
    return (hexv >> 16) & 255, (hexv >> 8) & 255, hexv & 255


def pictures(latin, kana):
    """
    What is lettered on the machine, as pictures for her sheet (atlas.py), in English and Japanese: the label of each
    selection (one picture for each drink, can or bottle, hot or cold, that occurs), the sold-out lamp lit and unlit, the
    header, the credit display, the card reader's pad, the recycling plate, the strips on the money panel and over the
    take-out port, and the menu. `latin(size, kind)` and `kana(size)` give the fonts. Returns {name: (image, kind)}.
    """
    from PIL import Image, ImageDraw
    WHITE, INK, COLD, HOT = (250, 249, 246), (28, 30, 32), (24, 96, 214), (214, 44, 30)

    def line(d, cx, cy, parts, gap=0.3):
        """One line of several pieces side by side, each (words, font, colour, weight), its middle at (cx, cy)."""
        widths = [d.textlength(t, font=f) for t, f, _, _ in parts]
        space = gap * max(f.size for _, f, _, _ in parts)
        x = cx - (sum(widths) + space * (len(parts) - 1)) / 2
        for (t, f, ink, weight), w in zip(parts, widths):
            d.text((x, cy), t, font=f, fill=ink, anchor='lm', stroke_width=weight, stroke_fill=ink)
            x += w + space

    def plate(size_mm, per_mm, ground):
        im = Image.new('RGB', (int(round(size_mm[0] * per_mm)), int(round(size_mm[1] * per_mm))), ground)
        return im, ImageDraw.Draw(im)

    def fit(words, size, width, font, kind=None):
        """The font at `size`, or smaller if the words would not fit the width."""
        f = font(size, kind) if kind else font(size)
        probe = ImageDraw.Draw(Image.new('RGB', (4, 4)))
        while probe.textlength(words, font=f) > width and size > 8:
            size -= 1
            f = font(size, kind) if kind else font(size)
        return f

    out = {}
    # ---- the labels: the brand, what it is, its Japanese name, the price, hot or cold
    for s in selections():
        name = label_tile(s)
        if name in out:
            continue
        p = SELL[s['sells']]
        lo, hi = s['label']
        im, d = plate(((hi[0] - lo[0]) * 1000, (hi[2] - lo[2]) * 1000), 6, WHITE)
        w, h = im.size
        d.rectangle((0, 0, w - 1, 13), fill=_rgb(p['colour']))
        line(d, w / 2, 32, [(p['brand'], fit(p['brand'], 20, w - 24, latin, 'b'), (96, 100, 104), 0)])
        line(d, w / 2, 62, [(p['en'], fit(p['en'], 32, w - 20, latin, 'b'), INK, 0)])
        line(d, w / 2, 100, [(p['jp'], fit(p['jp'], 34, w - 20, kana), INK, 1)])
        line(d, w / 2, 142, [(f"¥{s['price']}", latin(38, 'b'), INK, 0), ('500 ml' if s['kind'] == 'bottle' else 'can', latin(18, 'r'), (96, 100, 104), 0)], gap=0.25)
        zone = [('HOT', latin(24, 'b'), HOT, 0), ('あったか～い', kana(25), HOT, 1)] if s['hot'] else [('COLD', latin(24, 'b'), COLD, 0), ('つめた～い', kana(25), COLD, 1)]
        line(d, w / 2, 184, zone)
        out[name] = (im, 'face')
    # ---- the sold-out lamp, lit and unlit
    lo, hi = selections()[0]['lamp']
    for name, ground, ink, kind in (('jpvm_soldout_lit', (255, 58, 46), (255, 255, 255), 'screen'), ('jpvm_soldout', (96, 22, 20), (196, 150, 144), 'face')):
        im, d = plate(((hi[0] - lo[0]) * 1000, (hi[2] - lo[2]) * 1000), 10, ground)
        w, h = im.size
        line(d, w / 2, 26, [('売切', kana(40), ink, 1)])
        line(d, w / 2, 68, [('SOLD OUT', latin(25, 'b'), ink, 0)])
        out[name] = (im, kind)
    # ---- the header: lit
    lo, hi = box('VM_Door_Header_Lightbox')
    im, d = plate(((hi[0] - lo[0]) * 1000, (hi[2] - lo[2]) * 1000), 2, (255, 250, 240))
    w, h = im.size
    line(d, w / 2, h / 2, [('DRINKS', latin(58, 'b'), INK, 0), ('ドリンク', kana(56), INK, 2), ('·', latin(58, 'b'), (150, 150, 150), 0),
                           ('COLD', latin(50, 'b'), COLD, 0), ('つめた～い', kana(50), COLD, 2), ('·', latin(58, 'b'), (150, 150, 150), 0),
                           ('HOT', latin(50, 'b'), HOT, 0), ('あったか～い', kana(50), HOT, 2)], gap=0.5)
    out['jpvm_header'] = (im, 'screen')
    # ---- the credit display: lit
    lo, hi = box('VM_Pay_LCD_Credit')
    im, d = plate(((hi[0] - lo[0]) * 1000, (hi[2] - lo[2]) * 1000), 4, (122, 242, 140))
    w, h = im.size
    dark = (14, 44, 22)
    d.text((16, 40), 'CREDIT', font=latin(30, 'b'), fill=dark, anchor='lm')
    d.text((16, 90), '投入金額', font=kana(32), fill=dark, anchor='lm', stroke_width=1, stroke_fill=dark)
    d.text((w - 18, h / 2), '¥0', font=latin(92, 'm'), fill=dark, anchor='rm')
    out['jpvm_lcd'] = (im, 'screen')
    # ---- the card reader's pad (its flat face, inside the rounded edge)
    lo, hi = box('VM_Pay_ICReader')
    im, d = plate(((hi[0] - lo[0] - 0.012) * 1000, (hi[2] - lo[2] - 0.012) * 1000), 4, (77, 158, 219))
    w, h = im.size
    line(d, w / 2, 100, [('IC )))', latin(96, 'b'), (255, 255, 255), 0)])
    line(d, w / 2, 228, [('TOUCH', latin(56, 'b'), (255, 255, 255), 0), ('タッチ', kana(58), (255, 255, 255), 2)])
    out['jpvm_ic'] = (im, 'face')
    # ---- the recycling plate
    lo, hi = box('VM_Door_InfoPlate')
    im, d = plate(((hi[0] - lo[0] - 0.004) * 1000, (hi[2] - lo[2] - 0.004) * 1000), 4, WHITE)
    w, h = im.size
    d.rectangle((0, 0, w - 1, 22), fill=(30, 130, 70))
    line(d, w / 2, 96, [('Empty cans and bottles', latin(44, 'b'), INK, 0)])
    line(d, w / 2, 156, [('in the recycling box', latin(44, 'b'), INK, 0)])
    line(d, w / 2, 250, [('空き缶・ペットボトルは', kana(46), INK, 1)])
    line(d, w / 2, 316, [('リサイクルボックスへ', kana(46), INK, 1)])
    out['jpvm_info'] = (im, 'face')
    # ---- the strips: English, Japanese, and what else there is to say
    for name, t in STRIPS.items():
        per = 4 if name == 'jpvm_takeout' else 5
        im, d = plate((t['size'][0] * 1000, t['size'][1] * 1000), per, WHITE)
        w, h = im.size
        size = int(h * 0.56)
        while True:                                        # as large as fits the strip
            parts = [(t['en'], latin(size, 'b'), INK, 0), (t['jp'], kana(size + 2), INK, 1)]
            if t.get('more'):
                en, _, jp = t['more'].partition('  押す')
                parts += [('·', latin(size, 'b'), (150, 150, 150), 0), (en.strip(), latin(size, 'b'), INK, 0)]
                if '押す' in t['more']:
                    parts.append(('押す', kana(size + 2), INK, 1))
            if sum(d.textlength(q[0], font=q[1]) for q in parts) + 0.35 * (size + 2) * (len(parts) - 1) <= w - 20 or size <= 10:
                break
            size -= 1
        line(d, w / 2, h / 2, parts, gap=0.35)
        d.rectangle((0, 0, w - 1, h - 1), outline=(170, 172, 172))
        out[name] = (im, 'face')
    # ---- the menu: the seven drinks, each with its colour, in both languages, and what a can and a bottle cost
    im, d = plate((MENU_AT['size'][0] * 1000, MENU_AT['size'][1] * 1000), 1.5, WHITE)
    w, h = im.size
    teal, cream = (36, 75, 74), (244, 232, 203)
    d.rectangle((0, 0, w - 1, 78), fill=teal)
    d.text((24, 40), 'DRINKS', font=latin(44, 'b'), fill=cream, anchor='lm')
    d.text((232, 40), 'ドリンク', font=kana(42), fill=cream, anchor='lm', stroke_width=1, stroke_fill=cream)
    d.text((w - 24, 28), f"Can ¥{PRICE['can']}  ·  500 ml bottle ¥{PRICE['bottle']}", font=latin(24, 'b'), fill=cream, anchor='rm')
    d.text((w - 24, 58), f"缶 ¥{PRICE['can']}  ・  ペットボトル ¥{PRICE['bottle']}", font=kana(24), fill=cream, anchor='rm')
    cell_w, cell_h, top = w / 2, (h - 78 - 8) / 4, 78 + 6
    sold = lambda key: sorted({('hot can' if s['hot'] else 'can') if s['kind'] == 'can' else 'bottle' for s in selections() if s['sells'] == key},
                              key=('can', 'hot can', 'bottle').index)
    for k, key in enumerate(MENU):
        p = SELL[key]
        x0, y0 = (k % 2) * cell_w, top + (k // 2) * cell_h
        d.rounded_rectangle((x0 + 20, y0 + 10, x0 + 70, y0 + cell_h - 10), radius=8, fill=_rgb(p['colour']), outline=(60, 60, 60))
        d.rectangle((x0 + 20, y0 + 22, x0 + 70, y0 + 28), fill=(215, 218, 220))
        d.text((x0 + 88, y0 + 26), p['en'], font=latin(31, 'b'), fill=INK, anchor='lm')
        d.text((x0 + 88 + d.textlength(p['en'], font=latin(31, 'b')) + 14, y0 + 28), p['brand'], font=latin(17, 'b'), fill=(110, 114, 118), anchor='lm')
        d.text((x0 + 88, y0 + 66), p['jp'], font=kana(30), fill=INK, anchor='lm', stroke_width=1, stroke_fill=INK)
        how = ' · '.join(sold(key))
        d.text((x0 + cell_w - 18, y0 + 68), how, font=latin(17, 'r'), fill=(110, 114, 118), anchor='rm')
    x0, y0 = cell_w, top + 3 * cell_h                      # the eighth cell: what the buttons' colours mean
    d.rounded_rectangle((x0 + 20, y0 + 16, x0 + 70, y0 + 40), radius=6, fill=COLD)
    d.text((x0 + 88, y0 + 28), 'COLD', font=latin(24, 'b'), fill=COLD, anchor='lm')
    d.text((x0 + 170, y0 + 28), 'つめた～い', font=kana(25), fill=COLD, anchor='lm', stroke_width=1, stroke_fill=COLD)
    d.rounded_rectangle((x0 + 20, y0 + 54, x0 + 70, y0 + 78), radius=6, fill=HOT)
    d.text((x0 + 88, y0 + 66), 'HOT', font=latin(24, 'b'), fill=HOT, anchor='lm')
    d.text((x0 + 170, y0 + 66), 'あったか～い', font=kana(25), fill=HOT, anchor='lm', stroke_width=1, stroke_fill=HOT)
    d.rectangle((0, 0, w - 1, h - 1), outline=(120, 124, 126))
    out['jpvm_menu'] = (im, 'face')
    return out
