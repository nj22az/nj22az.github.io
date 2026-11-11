"""
The drinks machine of Johansson World, aboard: the Johansson Vending JV-16C that stands on Sakura Street, in the passenger
deck's lobby.

The owner, 11 November 2026: "Can you bring the vending machine from Johansson World into the accommodation ?", and of the
first one built here, which was drawn from a description only: "It doesn't look like the machine in Johansson World?"
This one is built to the World's own machine: its builder, johansson-town/src/world/vending.js, is not in this repository
but is served on the owner's site, and its measures and colours are read from there (VENDING_MACHINE, VENDING_COLUMNS,
commerce/vending-catalogue.js). A can vending machine of the mid-1990s: a pressed-steel cabinet 1.03 m wide, 1.83 m high
and 0.74 m deep in the bottler's red, with a cream face; a lit header with Minato Drinks' name over a blue strip for cold
and a red one for hot; two bands of glass, each with eight cans standing over their price plates and a row of buttons on
the rail under it; the J-Coffee poster; the money panel to the right (the amount, the coin slot, the note slot, the return
lever, the change cup); the take-out pocket behind a flap of smoked plastic, which swings in; a poster on each side; the
maker's plate. The cans are the catalogue's, in its colours and its order.

What is painted on it is on her sheet of pictures (atlas.py: vm_*), drawn after the World's own painted sheets.
Aboard it stands against the lobby's forward wall, facing aft, held to the deck by four lugs.
"""
from mathutils import Vector
import lines as L
from shipyard import Part, srgb, tint

DECK, FLOOR = 6.50, 0.008          # the passenger deck; the lobby's floor covering lies 8 mm over it
XC, BACK = 2.225, 9.46             # the machine's middle off the centreline; the lobby's forward wall behind it
W, H, D, DOOR = 1.03, 1.83, 0.74, 0.21
BANDS = ((1.37, 1.585, 1.305), (1.09, 1.305, 1.025))        # each band of glass: bottom, top, and the rail under it
WINDOW, HEADER = 0.89, (1.61, 1.795, 0.90)
POCKET = (-0.43, 0.19, 0.16, 0.36, 0.17)                    # x0, x1, y0, y1, depth
MONEY = (0.225, 0.455, 0.43, 0.97)
RED, CREAM, METAL, DARK, LIT = srgb(0xc4262e), srgb(0xf6eedb), srgb(0xd0d4d6), srgb(0x1b1d1f), srgb(0xeef6f8)
PRODUCT = dict(sanpin=0xc9a33a, harbour=0x366451, shikuwasa=0x7bb342, cola=0xb3262e, jcoffee=0x141414, dockside=0x784632, corn=0xe8b030)
# column by column from the left as one faces it, the top row first: (product, the can's diameter and height, hot)
CAN350, CAN190 = (0.066, 0.122), (0.053, 0.104)
COLUMNS = ([('sanpin', CAN350, False)] * 2 + [('harbour', CAN350, False)] * 2 + [('shikuwasa', CAN350, False)] * 2 + [('cola', CAN350, False)] * 2
           + [('jcoffee', CAN350, False)] * 3 + [('dockside', CAN190, False)] * 3 + [('corn', CAN190, True)] * 2)
MOTIONS = []
Z = L.Z


def P(x, y, z):
    """A point of the machine in the ship: x to the right as one faces it, y up from its foot, z toward one from its middle."""
    return (XC - x, DECK + FLOOR + y, Z(BACK - D / 2 - z))


def build():
    MOTIONS.clear()
    red = Part('Drinks machine, cabinet', 'Machinery paint')
    cream = Part('Drinks machine, face', 'Machinery paint')
    dark = Part('Drinks machine, dark parts', 'Plastic')
    lit = Part('Drinks machine, lit parts', 'Lens')
    cans = Part('Drinks machine, cans', 'Plastic', smooth=True, angle=40)
    glass = Part('Drinks machine, glass', 'Window glass')
    face = Part('Drinks machine, lettering', 'Panel face')
    flap = Part('Drinks machine, take-out flap', 'Window glass', mover='flap-drinks-machine')
    parts = [red, cream, dark, lit, cans, glass, face, flap]
    for p in parts:
        p.group = 'passenger'

    def box(p, x0, x1, y0, y1, z0, z1, colour):
        a, b = P(x0, y0, z0), P(x1, y1, z1)
        p.box(tuple(min(u, v) for u, v in zip(a, b)), tuple(max(u, v) for u, v in zip(a, b)), colour)

    def pic(centre, normal, w, h, name, proud=0.0015):
        c, n, u = Vector(P(*centre)), Vector(normal).normalized(), Vector((0, 1, 0))
        r = u.cross(n)
        c = c + n * proud
        face.picture([tuple(c - r * (w / 2) - u * (h / 2)), tuple(c + r * (w / 2) - u * (h / 2)),
                      tuple(c + r * (w / 2) + u * (h / 2)), tuple(c - r * (w / 2) + u * (h / 2))], name)

    AFT = (0, 0, -1)                                             # the way its face looks, in the ship
    hw, f, back = W / 2, D / 2, -D / 2
    door = f - DOOR                                              # where the door begins
    box(red, -hw, hw, 0.0, H, back, door, RED)                   # the cabinet
    for x in (-hw + 0.02, hw - 0.08):                            # four lugs to the deck
        for z in (back + 0.04, door - 0.10):
            box(dark, x, x + 0.06, -FLOOR, 0.012, z, z + 0.06, DARK)
    # ---- the door: red at its edges, cream on its face, built round the two bands of glass and the take-out pocket
    e = 0.015
    box(red, -hw, -hw + e, 0.0, H, door, f, RED)
    box(red, hw - e, hw, 0.0, H, door, f, RED)
    box(red, -hw + e, hw - e, H - e, H, door, f, RED)
    wx = WINDOW / 2
    px0, px1, py0, py1, pd = POCKET
    rows = [(0.0, py0, [(-hw + e, hw - e)]), (py0, py1, [(-hw + e, px0), (px1, hw - e)]), (py1, BANDS[1][0], [(-hw + e, hw - e)]),
            (BANDS[1][0], BANDS[1][1], [(-hw + e, -wx), (wx, hw - e)]), (BANDS[1][1], BANDS[0][0], [(-hw + e, hw - e)]),
            (BANDS[0][0], BANDS[0][1], [(-hw + e, -wx), (wx, hw - e)]), (BANDS[0][1], H - e, [(-hw + e, hw - e)])]
    for y0, y1, spans in rows:
        for x0, x1 in spans:
            box(cream, x0, x1, y0, y1, door, f, CREAM)
    # ---- the window: behind each band a lit back, eight cans over their price plates, the glass; buttons on the rail under it
    step = WINDOW / 8
    for row, (b0, b1, rail) in enumerate(BANDS):
        box(lit, -wx, wx, b0, b1, door, door + 0.004, LIT)
        start = len(glass.f)
        glass.polygon([P(-wx, b0, f - 0.008), P(wx, b0, f - 0.008), P(wx, b1, f - 0.008), P(-wx, b1, f - 0.008)], srgb(0xa8c4cc))
        glass.orient(start, AFT)
        for k in range(8):
            name, (dia, tall), hot = COLUMNS[row * 8 + k]
            x = -wx + step * (k + 0.5)
            colour = srgb(PRODUCT[name])
            cans.tube(P(x, b0, door + 0.09), P(x, b0 + tall - 0.008, door + 0.09), dia / 2, None, colour=colour, sides=14)
            cans.tube(P(x, b0 + tall - 0.008, door + 0.09), P(x, b0 + tall, door + 0.09), dia / 2, dia / 2 - 0.006, colour=srgb(0xc9cdd0), sides=14)
            pic((x, b0 + 0.02, f - 0.03), AFT, 0.075, 0.036, 'vm_price_hot' if hot else 'vm_price_cold', proud=0.0)
            box(dark, x - 0.03, x + 0.03, rail + 0.018, rail + 0.048, f, f + 0.008, srgb(0xec3a2c) if hot else srgb(0x2f7cf0))
        if row == 0:                                             # the first shikuwasa column is sold out: its lamp is lit
            x = -wx + step * 4.5
            box(lit, x + 0.034, x + 0.046, rail + 0.022, rail + 0.044, f, f + 0.006, srgb(0xff3b2a))
    # ---- the lit header, the poster, the take-out label, the maker's plate
    h0, h1, hw2 = HEADER
    box(lit, -hw2 / 2, hw2 / 2, h0, h1, f, f + 0.004, CREAM)
    pic((0.0, (h0 + h1) / 2, f + 0.004), AFT, hw2, h1 - h0, 'vm_header')
    pic(((px0 + px1) / 2, 0.70, f), AFT, 0.62, 0.42, 'vm_poster')
    pic(((px0 + px1) / 2, 0.392, f), AFT, 0.62, 0.034, 'vm_takeout')
    pic((0.34, 0.20, f), AFT, 0.17, 0.074, 'vm_badge')
    # ---- the money panel: a plate with what is printed on it; the coin slot's lip, the return lever, the change cup
    mx0, mx1, my0, my1 = MONEY
    box(dark, mx0, mx1, my0, my1, f, f + 0.006, METAL)
    pic(((mx0 + mx1) / 2, (my0 + my1) / 2, f + 0.006), AFT, mx1 - mx0, my1 - my0, 'vm_money')
    box(dark, mx0 + 0.095, mx0 + 0.135, my0 + 0.30, my0 + 0.38, f + 0.006, f + 0.014, METAL)
    box(dark, mx0 + 0.09, mx0 + 0.14, my0 + 0.105, my0 + 0.125, f + 0.006, f + 0.03, DARK)
    box(dark, mx0 + 0.07, mx0 + 0.16, my0 + 0.01, my0 + 0.055, f + 0.006, f + 0.02, DARK)
    # ---- the take-out pocket: its floor and back inside the door, and the smoked flap hung from its top
    box(dark, px0, px1, py0, py0 + 0.006, f - pd, f - 0.004, DARK)
    box(dark, px0, px1, py0, py1, f - pd - 0.006, f - pd, DARK)
    box(flap, px0 + 0.004, px1 - 0.004, py0 + 0.004, py1 - 0.004, f - 0.012, f - 0.006, srgb(0x2a2422))
    hinge = P(0.0, py1 - 0.004, f - 0.009)
    MOTIONS.append(dict(id='flap-drinks-machine', name='Drinks machine, take-out flap', pivot=[0.0, hinge[1], hinge[2]], max=60,
                        at=[XC, DECK, Z(BACK - D - 0.45)], reach=0.9))
    # ---- a poster on each side
    for side, name in ((1, 'vm_side_a'), (-1, 'vm_side_b')):
        pic((-side * hw, 1.0, back + (door - back) / 2), (side, 0, 0), 0.45, 0.73, name)
    return parts


def motion():
    """The take-out flap swings in, on the bar at its top, for whoever stands before the machine."""
    inputs, movers = [], []
    for m in MOTIONS:
        inputs.append(dict(id=m['id'], name=m['name'], min=0, max=m['max'], step=1, unit='°', below='', above='open', rest='shut', auto='near', at=m['at'], reach=m['reach']))
        movers.append(dict(id=m['id'], kind='turn', input=m['id'], axis=[1, 0, 0], pivot=m['pivot'], ratio=-1.0))
    return inputs, movers
