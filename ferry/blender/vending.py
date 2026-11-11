"""
The owner's own drinks machine aboard: the JPVM-2R20, in the passenger deck's lobby.

The owner, 11 November 2026, with the machine's files (assets/jpvm-2r20/: the model, its script, its parts list, its
controller and wiring): "Use this vending machine instead"; and of what is lettered on it: "Use English so we can see what
we are selling , English and Japanese". It takes the place of the machine built here after Johansson World's (the JV-16C
of the same morning), which took the place of the other ship's two plain boxes.

The machine is not redrawn: its parts are read from its own file (glb.py, jpvm.py) and stood in the ship, each in the
finish the file gives it. A Japanese drinks machine of two rows of ten: a red cabinet 1.00 m wide, 0.70 m deep and 1.83 m
high on a black plinth; a door 60 mm thick with a lit display window (ten cans over ten bottles, a label, a button and a
sold-out lamp under each), a lit header, the money panel to the right (credit display, card reader, coin slot, note slot,
return lever, change cup), the take-out port behind its flap; inside, ten columns with their stock and vend motors, the
coin mechanism, the note validator, the controller and power supply, the compressor, condenser, evaporator, heater and
fans.

What it sells and what is lettered on it are hers (jpvm.py: SELL, ROWS, PRICE, pictures): Johansson World's seven drinks,
each named in English and in Japanese on its label and on a menu on the door; the display cans and the bottles' wraps are
in each drink's own colour (the file's are a mixed palette that names nothing). The file's own lettering is not used: it
is in Japanese only, names no drink, and lies in a heap at the file's origin.

What moves in the file moves aboard (README of the machine: "Rig / state controls"), about the pivots its script names:
  the door            on its left hinges, for a tap; 90° aboard (the file's 100° would stand it over the stair well's guard)
  the take-out flap   pushed in on the bar at its top, for whoever stands before it; 55° aboard (at the file's 75° its
                      edge passes through the back of the bin behind it)
  the coin return     the lever (25°) and the change cup's flap with it, for a tap
The vend cycle itself (a can dropping) is not played: the can the file keeps in mid-fall is left out, for at rest it would
hang in the air.

What else is put right aboard, and why:
  the pivots are where the script names them (in the file they lie at its origin: jpvm.py)
  the display cans and bottles stand 28 mm further back. In the file they stand through the window's glass, 19 mm proud of it
  the chute behind the take-out port is at the place its script gives it. In the file it is turned about the origin, not
  about its own middle, and passes through the top of the compressor
  what hangs free inside the cabinet is carried (mounts()): the file's inside parts are stand-ins without their mounts
  five pairs of surfaces that lay in one plane and flickered are moved apart by a millimetre or two (put_right())

Aboard it stands against the lobby's forward wall, facing aft, 60 mm off the wall for the condenser's air, and is held to
the ship: two angles from its top to the wall and a cleat on the deck at each side of its plinth.
"""
import numpy as np
import lines as L
import glb
import jpvm
from shipyard import Part, srgb, tint

DECK, FLOOR = 6.50, 0.008          # the passenger deck; the lobby's floor covering lies 8 mm over it
XC, BACK, GAP = 2.10, 9.46, 0.06   # the machine's middle off the centreline; the lobby's forward wall behind it; the air gap
DOOR_OPENS, FLAP_OPENS = 90, 55    # degrees aboard (the file: 100 and 75)
Z = L.Z
MOTIONS = {}

# The file's finishes as the page draws them: the look, and whether the colour is the file's own or a lit part's glow.
FINISH = {
    'MAT_Body_PaintRed': 'Vending enamel', 'MAT_Body_PaintWhite': 'Vending enamel',
    'MAT_Chrome': 'Chrome', 'MAT_Steel_Brushed': 'Shaft steel', 'MAT_Copper': 'Bronze',
    'MAT_Plastic_Black': 'Plastic', 'MAT_Plastic_Grey': 'Plastic', 'MAT_Label_White': 'Plastic', 'MAT_Label_Text': 'Plastic',
    'MAT_Label_ColdBlue': 'Plastic', 'MAT_Label_HotRed': 'Plastic', 'MAT_SoldOut_Lamp': 'Plastic', 'MAT_IC_Reader': 'Plastic',
    'MAT_Rubber': 'Lining', 'MAT_Foam_Insulation': 'Lining',
    'MAT_PET_Bottle': 'Clear plastic', 'MAT_Glass_Display': 'Clear glass', 'MAT_Acrylic_Flap': 'Smoked plastic',
    'MAT_Backlight_Panel': 'Lit panel', 'MAT_LED_Cold': 'Lit blue', 'MAT_LED_Hot': 'Lit red', 'MAT_LCD_7seg': 'Lit green',
}
# A part that shines takes the colour of its light; the card reader's pad is drawn in the blue it shows when lit.
GLOW = {'MAT_Backlight_Panel': (1.0, 0.98, 0.94), 'MAT_LED_Cold': (0.20, 0.45, 1.0), 'MAT_LED_Hot': (1.0, 0.22, 0.12),
        'MAT_LCD_7seg': (0.48, 0.95, 0.55), 'MAT_IC_Reader': (0.30, 0.62, 0.86), 'MAT_SoldOut_Lamp': (0.38, 0.09, 0.08)}
WHAT = {'Vending enamel': 'enamel', 'Chrome': 'bright parts', 'Shaft steel': 'steel', 'Bronze': 'copper', 'Plastic': 'plastics', 'Lining': 'rubber and foam',
        'Clear plastic': 'bottles', 'Clear glass': 'window glass', 'Smoked plastic': 'smoked flaps', 'Lit panel': 'lit panels', 'Lit blue': 'cold buttons',
        'Lit red': 'hot buttons', 'Lit green': 'credit display', 'Drinks can': 'cans', 'Panel face': 'labels and notices',
        'Screen picture': 'lit lettering'}
MOVER = {'door': 'door-drinks-machine', 'flap': 'flap-drinks-machine', 'lever': 'lever-drinks-machine', 'change': 'change-drinks-machine'}
ON = {None: 'cabinet', 'door': 'door', 'flap': 'take-out flap', 'lever': 'return lever', 'change': 'change flap'}

def put_right(name, parent, pts):
    """
    A part's points where they stand aboard, for the few parts of the file that are moved a little (the head of this file
    says why in full).
    """
    if name.startswith('VM_Display_Dummy'):
        pts = pts + (0.0, jpvm.DUMMIES_BACK, 0.0)             # behind the window's glass, not through it
        if name.startswith('VM_Display_DummyWrap'):
            # A bottle's wrap is drawn half a millimetre outside the bottle: the two flickered. A millimetre more.
            mid = (pts.min(0) + pts.max(0)) / 2
            pts = np.column_stack([mid[0] + (pts[:, 0] - mid[0]) * 1.03, mid[1] + (pts[:, 1] - mid[1]) * 1.03, pts[:, 2]])
    elif name == 'VM_Dispense_Chute':
        pts = pts + (np.array((-0.12, 0.29, 0.41)) - (pts.min(0) + pts.max(0)) / 2)       # to the middle its script gives it
    elif parent.startswith('VM_HMI_ButtonPivot'):
        # The file leaves one button (R1C04, pressed in its animation) 60 mm out in front of the door: every button at rest.
        pts = pts + (0.0, -jpvm.DOOR - 0.012 - pts[:, 1].min(), 0.0)
    elif name in ('VM_Thermal_Evaporator_Cold', 'VM_Thermal_Heater_Hot'):
        pts = pts + (0.0, -0.002, 0.0)                        # their backs lay in one plane with the columns' backs
    elif name == 'VM_Dispense_BinBack':
        pts = pts + (0.0, 0.006, 0.0)                         # behind the bin's floor, not through its end (their undersides lay in one plane)
    elif name == 'VM_Door_DisplayGlass':
        mid = (pts[:, 0].min() + pts[:, 0].max()) / 2         # the pane's edges lay in one plane with the shelves' ends
        pts = np.column_stack([mid + (pts[:, 0] - mid) * 0.998, pts[:, 1], pts[:, 2]])
    return pts


def mounts():
    """
    What hangs free inside the cabinet in the file, and what carries it aboard: (low corner, high corner, what it rides
    on), in the machine's axes. The file's inside parts are stand-ins without their mounts; the yard's check that nothing
    hangs in the air (afloat.py) named these, one by one.
    """
    out = []
    for k in range(1, 11):                                    # each vend motor: a bracket up to the foot of its column
        m, c = jpvm.box(f'VM_Internal_VendMotor_{k:02d}'), jpvm.box(f'VM_Internal_Column_{k:02d}')
        x = (m[0][0] + m[1][0]) / 2
        out.append(((x - 0.012, m[1][1] - 0.012, (m[0][2] + m[1][2]) / 2), (x + 0.012, c[0][1] + 0.006, c[0][2] + 0.006), None))
    lo, hi = jpvm.box('VM_Thermal_Compressor')                # the compressor: two feet on the plinth
    for x in (lo[0] + 0.035, hi[0] - 0.035):
        out.append(((x - 0.012, (lo[1] + hi[1]) / 2 - 0.012, 0.056), (x + 0.012, (lo[1] + hi[1]) / 2 + 0.012, lo[2] + 0.004), None))
    f, c = jpvm.box('VM_Thermal_CondenserFan'), jpvm.box('VM_Thermal_Condenser')      # the condenser's fan: on the condenser
    x, z = (f[0][0] + f[1][0]) / 2, (f[0][2] + f[1][2]) / 2
    out.append(((x - 0.015, f[1][1] - 0.004, z - 0.015), (x + 0.015, c[0][1] + 0.004, z + 0.015), None))
    lo, hi = jpvm.box('VM_Internal_PSU')                      # the power supply: hung from the cabinet's top
    x, y = (lo[0] + hi[0]) / 2, (lo[1] + hi[1]) / 2
    out.append(((x - 0.015, y - 0.015, hi[2] - 0.004), (x + 0.015, y + 0.015, jpvm.H - 0.016), None))
    lo, hi = jpvm.box('VM_Internal_InnerDoor_Insulated')      # the insulated bar across the front: a clip to each side
    y, z = (lo[1] + hi[1]) / 2, (lo[2] + hi[2]) / 2
    for sx in (-1, 1):
        a, b = sx * (jpvm.W / 2 - 0.034), sx * (jpvm.W / 2 - 0.016)
        out.append(((min(a, b), y - 0.012, z - 0.012), (max(a, b), y + 0.012, z + 0.012), None))
    # the chute, which goes with the door: two straps up from the back of the bin (each at the place put_right gives it)
    back = jpvm.box('VM_Dispense_BinBack')
    y0, y1 = back[0][1] + 0.006 + 0.0015, back[1][1] + 0.006 - 0.0015          # within the bin back's thickness, not flush with its faces
    under = 0.41 - ((y0 + y1) / 2 - 0.29) * np.tan(np.radians(20)) - 0.006 / np.cos(np.radians(20))
    for x in (-0.37, 0.11):
        out.append(((x, y0, back[1][2] - 0.004), (x + 0.02, y1, under + 0.004), 'door'))
    return out


def ship(p):
    """A point of the machine (jpvm's axes) in the ship: its right to starboard, its back forward."""
    return (XC - p[0], DECK + FLOOR + p[2], Z(BACK - GAP - jpvm.D + p[1]))


def way(n):
    return (-n[0], n[2], n[1])


class Shop:
    def __init__(self):
        self.parts = {}

    def __call__(self, look, mover=None, smooth=True):
        key = (look, mover)
        if key not in self.parts:
            p = Part(f'Drinks machine, {ON[mover]}, {WHAT[look]}', look, smooth=smooth, angle=180, mover=MOVER.get(mover))
            p.group = 'passenger'
            self.parts[key] = p
        return self.parts[key]


def carried_by(doc, i):
    """Which moving part of the machine a node goes with: the nearest pivot above it in the file."""
    for name in glb.lineage(doc, i):
        if name == 'VM_Dispense_Flap_Hinge':
            return 'flap'
        if name == 'VM_Pay_ReturnLever_Pivot':
            return 'lever'
        if name == 'VM_Pay_ChangeFlap_Pivot':
            return 'change'
        if name == 'VM_Door_Hinge':
            return 'door'
    return None


def build():
    MOTIONS.clear()
    doc = jpvm.doc()
    S = Shop()
    shown = {}
    for sel in jpvm.selections():
        c = srgb(jpvm.SELL[sel['sells']]['colour'])
        shown[f"VM_Display_Dummy{'' if sel['kind'] == 'can' else 'Wrap'}_{sel['id']}"] = c
        shown[f"VM_Display_DummyCap_{sel['id']}"] = tint(c, 0.75)
    for i, node in enumerate(doc['nodes']):
        name = node['name']
        if node['mesh'] is None or 'Text' in name or name == 'VM_Dispense_ProductInTransit':
            continue
        mover = carried_by(doc, i)
        parent = doc['nodes'][node['parent']]['name'] if node['parent'] is not None else ''
        for pos, nor, idx, mat in glb.placed(doc, i):
            m = doc['materials'][mat]
            look = FINISH.get(m['name']) or ('Drinks can' if m['name'].startswith('MAT_Can_') else None)
            if look is None:
                raise SystemExit(f"the drinks machine's file has a finish the yard has no look for: {m['name']} ({name})")
            colour = GLOW.get(m['name']) or jpvm.srgb(m['colour'])
            if name in shown:                                     # a display can or a bottle's wrap and cap: the drink's own colour
                colour = shown[name]
            part = S(look, mover)
            base = len(part.v)
            for p, n in zip(put_right(name, parent, jpvm.B(pos)), jpvm.B(nor)):
                part.vert(ship(p), way(n))
            for a, b, c in idx:
                part.face((base + int(a), base + int(b), base + int(c)), colour)

    # ---- what is lettered on it, in English and Japanese: a picture on each face that carries words (jpvm.pictures)
    printed, lit = S('Panel face', 'door', smooth=False), S('Screen picture', 'door', smooth=False)

    def picture(part, x0, x1, y, z0, z1, tile):
        part.picture([ship((x0, y, z0)), ship((x1, y, z0)), ship((x1, y, z1)), ship((x0, y, z1))], tile)

    def on_face(part, name, tile, inset=0.0):
        """A picture over the front face of one of the machine's parts (inside its rounded edge, if it has one)."""
        lo, hi = jpvm.box(name)
        picture(part, lo[0] + inset, hi[0] - inset, lo[1], lo[2] + inset, hi[2] - inset, tile)

    for s in jpvm.selections():
        (x0, y, z0), (x1, _, z1) = s['label']
        picture(printed, x0, x1, y, z0, z1, jpvm.label_tile(s))
        (x0, y, z0), (x1, _, z1) = s['lamp']
        sold = s['id'] in jpvm.SOLD_OUT
        picture(lit if sold else printed, x0, x1, y, z0, z1, 'jpvm_soldout_lit' if sold else 'jpvm_soldout')
    on_face(lit, 'VM_Door_Header_Lightbox', 'jpvm_header')
    on_face(lit, 'VM_Pay_LCD_Credit', 'jpvm_lcd')
    on_face(printed, 'VM_Pay_ICReader', 'jpvm_ic', inset=0.006)
    on_face(printed, 'VM_Door_InfoPlate', 'jpvm_info', inset=0.002)
    for tile, t in list(jpvm.STRIPS.items()) + [('jpvm_menu', jpvm.MENU_AT)]:
        (cx, cz), (w, h) = t['at'], t['size']
        picture(printed, cx - w / 2, cx + w / 2, t['face'] - 0.0005, cz - h / 2, cz + h / 2, tile)

    # ---- held to the ship: two angles from the cabinet's top to the wall, a cleat on the deck at each side of the plinth
    hold = Part('Drinks machine, securing', 'Machinery paint')
    hold.group = 'passenger'
    grey = srgb(0x8f9698)

    def box(x0, x1, y0, y1, z0, z1, colour=grey):
        a, b = ship((x0, y0, z0)), ship((x1, y1, z1))
        hold.box(tuple(map(min, a, b)), tuple(map(max, a, b)), colour)

    wall = jpvm.D + GAP
    for x in (-0.33, 0.33):
        box(x - 0.03, x + 0.03, 0.56, wall, jpvm.H, jpvm.H + 0.006)                      # on the cabinet's top
        box(x - 0.03, x + 0.03, wall - 0.006, wall, jpvm.H + 0.006, jpvm.H + 0.07)       # up the wall
        for yb in (0.59, 0.63):
            box(x - 0.008, x + 0.008, yb - 0.008, yb + 0.008, jpvm.H + 0.006, jpvm.H + 0.012, tint(grey, 0.7))
        box(x - 0.008, x + 0.008, wall - 0.012, wall - 0.006, jpvm.H + 0.035, jpvm.H + 0.051, tint(grey, 0.7))
    for sx in (-1, 1):
        x = sx * (jpvm.W / 2 - 0.005)                                                    # the plinth's side
        for yb in (0.10, 0.52):
            box(x, x + sx * 0.006, yb, yb + 0.07, 0.0, 0.05)                             # against the plinth
            box(x, x + sx * 0.05, yb, yb + 0.07, -FLOOR, 0.012)                          # on the deck, through the covering
            box(x + sx * 0.022, x + sx * 0.038, yb + 0.027, yb + 0.043, 0.012, 0.018, tint(grey, 0.7))

    # ---- what hangs free inside the cabinet in the file, carried
    steel = srgb(0xa9aeb0)
    carry = {None: Part('Drinks machine, mounts', 'Shaft steel'), 'door': Part('Drinks machine, door, mounts', 'Shaft steel', mover=MOVER['door'])}
    for lo, hi, rides in mounts():
        a, b = ship(lo), ship(hi)
        carry[rides].box(tuple(map(min, a, b)), tuple(map(max, a, b)), steel)
    for part in carry.values():
        part.group = 'passenger'

    # ---- how it moves
    front = BACK - GAP - jpvm.D - jpvm.DOOR
    P = jpvm.PIVOTS
    MOTIONS['inputs'] = [
        dict(id='door-drinks-machine', name="Drinks machine's door", min=0, max=DOOR_OPENS, step=1, unit='°', below='', above='open', rest='shut',
             auto='tap', at=[XC, DECK, Z(front - 0.5)], reach=0.0),
        dict(id='flap-drinks-machine', name='Drinks machine, take-out flap', min=0, max=FLAP_OPENS, step=1, unit='°', below='', above='open', rest='shut',
             auto='near', at=[XC - P['flap']['at'][0], DECK, Z(front - 0.45)], reach=0.9),
        dict(id='coin-return-drinks-machine', name='Drinks machine, coin return', min=0, max=int(P['lever']['turn']), step=1, unit='°', below='',
             above='pressed', rest='at rest', auto='tap', at=[XC - P['lever']['at'][0], DECK, Z(front - 0.45)], reach=0.0),
    ]
    door = 'door-drinks-machine'
    # The machine's x axis lies along the ship's, the other way: a turn about its x by an angle is a turn about hers by
    # the same angle the other way. Its upright axis is hers.
    MOTIONS['movers'] = [
        dict(id=door, kind='turn', input=door, axis=[0, 1, 0], pivot=list(ship(P['door']['at'])), ratio=-1.0),
        dict(id='flap-drinks-machine', kind='turn', input='flap-drinks-machine', axis=[1, 0, 0], pivot=list(ship(P['flap']['at'])), ratio=-1.0, on=door),
        dict(id='lever-drinks-machine', kind='turn', input='coin-return-drinks-machine', axis=[1, 0, 0], pivot=list(ship(P['lever']['at'])), ratio=-1.0, on=door),
        dict(id='change-drinks-machine', kind='turn', input='coin-return-drinks-machine', axis=[1, 0, 0], pivot=list(ship(P['change']['at'])),
             ratio=round(-P['change']['turn'] / P['lever']['turn'], 3), on=door),
    ]
    return list(S.parts.values()) + [hold] + list(carry.values())


def motion():
    """The door, the take-out flap and the coin return, each about the pivot the machine's script names."""
    return MOTIONS['inputs'], MOTIONS['movers']
