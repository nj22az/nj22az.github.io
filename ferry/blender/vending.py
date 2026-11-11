"""
The drinks machine of Johansson World, aboard: a Johansson Vending JV-16C in the passenger deck's lobby.

The owner, 11 November 2026: "Can you bring the vending machine from Johansson World into the accommodation ?" In the
World it stands against Sakura Shōten's wall: sixteen columns of the island's own drinks, cold and hot, filled by Minato
Drinks, with J-Coffee at ¥120 in three columns of the bottom row, under the coin slot (the World's library,
avatar-creator/world-library.json: registry:vending-machine, registry:j-coffee-can). The World's own model and builder
(johansson-town/src/world/vending.js, vending-machine.glb) are not in this repository, so this is the same machine built
again from what the library says of it, not a copy of that model: sixteen columns in two rows behind glass, a button
under each (blue for cold, red for hot), the coin and note slots to the right, the delivery flap below.

It takes the place of the other ship's two plain boxes in the lobby's vending corner, against the forward wall, facing
aft. Its delivery flap swings in for whoever stands before it.
"""
from math import pi
import lines as L
from shipyard import Part, srgb, tint

DECK = 6.50
X0, X1 = 1.80, 2.66                # across the lobby
FRONT, BACK = 8.77, 9.46           # its front, looking aft, and the lobby's forward wall behind it
HEIGHT = 1.83
BODY, TEAL, DARK, STEEL = srgb(0xf0f0ea), srgb(0x2f6f74), srgb(0x20262a), srgb(0x9aa2a3)
# The sixteen columns, top row then bottom row, from the left as one faces it: (body, cap or band, 'bottle' or 'can', hot).
TEA, WATER, COLA, MILK, COFFEE, JUICE = (srgb(0x4f8a4a), srgb(0xd9b548)), (srgb(0x9fc7dd), srgb(0xf2f2f2)), (srgb(0xb8322c), srgb(0xe8e8e8)), \
    (srgb(0xd8c39a), srgb(0x8a5a32)), (srgb(0x1c1c1e), srgb(0xc8a24a)), (srgb(0xe08a2e), srgb(0x3f7a3a))
COLUMNS = ([(TEA, 'bottle', False)] * 3 + [(WATER, 'bottle', False)] * 2 + [(JUICE, 'bottle', False)] * 2 + [(COLA, 'can', False)]
           + [(COLA, 'can', False)] * 2 + [(MILK, 'can', False)] * 2 + [(TEA, 'can', True)] + [(COFFEE, 'can', True)] * 3)
MOTIONS = []
Z = L.Z


def P(x, yard, h):
    return (x, DECK + h, Z(yard))


def build():
    MOTIONS.clear()
    body = Part('Drinks machine, cabinet', 'Machinery paint')
    dark = Part('Drinks machine, dark parts', 'Plastic')
    drinks = Part('Drinks machine, drinks', 'Plastic', smooth=True, angle=40)
    glass = Part('Drinks machine, glass', 'Window glass')
    face = Part('Drinks machine, lettering', 'Panel face')
    flap = Part('Drinks machine, delivery flap', 'Plastic', mover='flap-drinks-machine')
    parts = [body, dark, drinks, glass, face, flap]
    for p in parts:
        p.group = 'passenger'

    def box(p, x0, x1, a, b, h0, h1, colour):
        p.box(P(min(x0, x1), min(a, b), min(h0, h1)), P(max(x0, x1), max(a, b), max(h0, h1)), colour)

    def sign(centre, w, h, name):
        x, yard, hh = centre
        c = P(x, yard - 0.0015, hh)
        # read from aft: the reader's right is to starboard
        face.picture([(c[0] + w / 2, c[1] - h / 2, c[2]), (c[0] - w / 2, c[1] - h / 2, c[2]), (c[0] - w / 2, c[1] + h / 2, c[2]), (c[0] + w / 2, c[1] + h / 2, c[2])], name)

    F = FRONT
    for x in (X0 + 0.04, X1 - 0.10):
        for a in (F + 0.04, BACK - 0.10):
            box(body, x, x + 0.06, a, a + 0.06, 0.0, 0.04, DARK)                           # four feet
    box(body, X0, X1, F + 0.09, BACK, 0.04, HEIGHT, BODY)                                 # the cabinet, behind its front
    # ---- the front, 9 cm deep, built round the showcase and the delivery opening
    # (One faces it looking forward, so one's right is to starboard, the lower x: the slots are on that side.)
    wx0, wx1, wh0, wh1 = X0 + 0.20, X1 - 0.05, 0.96, 1.62                                 # the showcase
    dx0, dx1, dh0, dh1 = X0 + 0.24, X1 - 0.12, 0.10, 0.28                                 # the delivery opening
    box(body, X0, X1, F, F + 0.09, wh1, HEIGHT, BODY)                                     # over the showcase
    box(body, X0, wx0, F, F + 0.09, wh0, wh1, BODY)                                       # the column of slots, to the right
    box(body, wx1, X1, F, F + 0.09, wh0, wh1, BODY)
    box(body, X0, X1, F, F + 0.09, dh1, wh0, BODY)                                        # between showcase and delivery
    box(body, X0, dx0, F, F + 0.09, dh0, dh1, BODY)
    box(body, dx1, X1, F, F + 0.09, dh0, dh1, BODY)
    box(body, X0, X1, F, F + 0.09, 0.04, dh0, BODY)
    box(dark, dx0, dx1, F + 0.085, F + 0.09, dh0, dh1, DARK)                              # the delivery chute's back
    start = len(glass.f)
    glass.polygon([P(wx0, F + 0.006, wh0), P(wx1, F + 0.006, wh0), P(wx1, F + 0.006, wh1), P(wx0, F + 0.006, wh1)], srgb(0x9fb8c0))
    glass.orient(start, (0, 0, -1))
    # ---- two rows of eight: each drink on its shelf, a price strip under it with its button
    step = (wx1 - wx0) / 8
    for row, (shelf, strip) in enumerate(((1.335, 1.30), (1.015, 0.98))):
        box(body, wx0, wx1, F + 0.012, F + 0.09, shelf - 0.012, shelf, tint(BODY, 0.9))
        box(dark, wx0, wx1, F + 0.008, F + 0.012, strip - 0.012, shelf, tint(BODY, 0.8))
        for k in range(8):
            (colour, cap), kind, hot = COLUMNS[row * 8 + k]
            x = wx1 - step * (k + 0.5)                                                    # from the reader's left, which is to port
            tall, r = (0.17, 0.027) if kind == 'bottle' else (0.115, 0.027)
            drinks.tube(P(x, F + 0.05, shelf), P(x, F + 0.05, shelf + tall * 0.78), r, None, colour=colour, sides=12)
            drinks.tube(P(x, F + 0.05, shelf + tall * 0.78), P(x, F + 0.05, shelf + tall), r, r * (0.45 if kind == 'bottle' else 0.92), colour=cap, sides=12)
            box(dark, x - 0.022, x + 0.022, F + 0.004, F + 0.008, shelf - 0.03, shelf - 0.012, srgb(0xc2412f) if hot else srgb(0x2f6fb4))
    # ---- to the right: the display, the coin slot, the note slot, the return lever and its cup
    cx = (X0 + wx0) / 2
    box(dark, cx - 0.045, cx + 0.045, F - 0.004, F, 1.48, 1.54, DARK)
    box(dark, cx - 0.02, cx + 0.02, F - 0.006, F, 1.33, 1.41, STEEL)
    box(dark, cx - 0.004, cx + 0.004, F - 0.008, F - 0.006, 1.345, 1.395, DARK)
    box(dark, cx - 0.045, cx + 0.045, F - 0.006, F, 1.20, 1.25, STEEL)
    box(dark, cx - 0.036, cx + 0.036, F - 0.008, F - 0.006, 1.22, 1.23, DARK)
    box(dark, cx - 0.012, cx + 0.012, F - 0.03, F, 1.08, 1.11, STEEL)
    box(dark, X0 + 0.06, X0 + 0.20, F - 0.012, F, 0.12, 0.24, DARK)
    # ---- lettering: the maker's band over the showcase, what she sells under it
    box(body, X0, X1, F - 0.004, F, 1.66, 1.80, TEAL)
    sign(((X0 + X1) / 2, F - 0.004, 1.73), 0.66, 0.11, 'jv_brand')
    sign(((wx0 + X1) / 2 - 0.02, F, 0.62), 0.50, 0.27, 'jv_panel')
    # ---- the delivery flap: hung at its top, it swings in
    box(flap, dx0 + 0.004, dx1 - 0.004, F + 0.006, F + 0.014, dh0 + 0.004, dh1 - 0.004, tint(DARK, 1.6))
    MOTIONS.append(dict(id='flap-drinks-machine', name='Drinks machine, delivery flap', pivot=[0.0, DECK + dh1 - 0.004, Z(F + 0.010)], max=60,
                        at=[(X0 + X1) / 2, DECK, Z(F - 0.45)], reach=0.9))
    return parts


def motion():
    inputs, movers = [], []
    for m in MOTIONS:
        inputs.append(dict(id=m['id'], name=m['name'], min=0, max=m['max'], step=1, unit='°', below='', above='open', rest='shut', auto='near', at=m['at'], reach=m['reach']))
        movers.append(dict(id=m['id'], kind='turn', input=m['id'], axis=[1, 0, 0], pivot=m['pivot'], ratio=-1.0))
    return inputs, movers
