"""
The wheelhouse's furniture: the two pilot chairs on their rails, the steering stand and its wheel, the settee and the
watchkeeper's table, the chart table, the lockers, and what hangs on the after wall.

The owner's photographs of a ferry's wheelhouse (reference F3, F4): "two pilot chairs running on rails let into the deck",
"a table with a ship's profile engraved in its top and a cup well; a sofa abaft". Each thing here is drawn with the parts
it is known by (JSY-STD-404): a chair has a carriage on its rail, a pedestal with its gaiter, a seat, a back, a headrest,
armrests and a footrest; a drawer is a box that runs out; a locker has what is kept in it.
"""
from bridge_kit import *

# ---------------------------------------------------------------------------------------------------------------------
# The pilot chairs. Each runs fore and aft on a track let into the deck covering, and turns on its pedestal.
# ---------------------------------------------------------------------------------------------------------------------
TRACK = (21.00, 21.96)              # the track, from and to
TRACK_HALF = 0.125                  # half the breadth of the slot it lies in
CHAIRS = {'OUT-02': ('master', "Master's chair"), 'OUT-03': ('officer', "Watch officer's chair")}


def chair_slots():
    """Where the deck covering is cut for the chairs' tracks: (x from, to, yard from, to)."""
    return [(c['at'][0] - TRACK_HALF, c['at'][0] + TRACK_HALF, TRACK[0], TRACK[1]) for c in REG.COMPONENTS if c['g'].get('kind') == 'chair']


def chair(g, tag, x, yard):
    """A pilot chair: high-backed, black, on a pedestal that runs on a track let into the deck."""
    key, name = CHAIRS[tag]
    # ---- the track, in its slot: a base plate on the steel deck, two rails, a stop at each end
    box('dark', x - TRACK_HALF, x + TRACK_HALF, TRACK[0], TRACK[1], 0.0, 0.003, srgb(0x1a1c1e), r=0.0)
    for sx in (-1, 1):
        box('steel', x + sx * 0.085 - 0.016, x + sx * 0.085 + 0.016, TRACK[0] + 0.004, TRACK[1] - 0.004, 0.003, 0.0105, STAINLESS, r=0.0015)
        for k in range(8):                                                           # the rail's countersunk screws
            yd = TRACK[0] + 0.06 + k * (TRACK[1] - TRACK[0] - 0.12) / 7
            with Frame((x + sx * 0.085, yd, 0.0105), STBD, FWD) as F:
                F.lathe('steel', (0.0, 0.0, -0.0004), [(0.0, 0.0045), (0.0006, 0.0045), (0.0006, 0.0)], tint(STAINLESS, 0.7))
    for yd in (TRACK[0] + 0.004, TRACK[1] - 0.034):
        box('steel', x - 0.05, x + 0.05, yd, yd + 0.03, 0.003, 0.028, STAINLESS, r=0.003)
        box('rubber', x - 0.04, x + 0.04, yd + (0.03 if yd < 21.5 else -0.008), yd + (0.038 if yd < 21.5 else 0.0), 0.006, 0.026, RUBBER, r=0.002)
    # ---- what slides: the carriage on its shoes, the pedestal, the gaiter, the lock's pedal
    S = moving(f'{name}, carriage', f'chair-{key}-slide', steel='Stainless', dark='Black anodised', rubber='Rubber')
    box(S['dark'], x - 0.155, x + 0.155, yard - 0.18, yard + 0.18, 0.0135, 0.034, ANOD, r=0.004)
    for sx in (-1, 1):
        for sy in (-1, 1):
            box(S['steel'], x + sx * 0.085 - 0.02, x + sx * 0.085 + 0.02, yard + sy * 0.12 - 0.035, yard + sy * 0.12 + 0.035, 0.0106, 0.0135, STAINLESS, r=0.0)
            with Frame((x + sx * 0.125, yard + sy * 0.15, 0.034), STBD, FWD) as F:
                F.into = dict(steel=S['steel'], seam=S['steel'])
                bolt(F, 0.0, 0.0, 0.0, r=0.006, h=0.004)
    lathe(S['dark'], (x, yard, 0.034), UP, [(0.0, 0.115), (0.010, 0.115), (0.016, 0.075), (0.05, 0.062), (0.30, 0.055), (0.31, 0.060), (0.33, 0.060)], ANOD)
    lathe(S['rubber'], (x, yard, 0.33), UP, [(0.0, 0.058), (0.012, 0.070), (0.024, 0.058), (0.036, 0.070), (0.048, 0.058), (0.060, 0.070), (0.072, 0.058),
                                               (0.084, 0.068), (0.096, 0.056), (0.108, 0.064), (0.118, 0.052)], RUBBER)
    lathe(S['steel'], (x, yard, 0.448), UP, [(0.0, 0.050), (0.03, 0.050), (0.03, 0.0)], STAINLESS)
    side = 1 if x > 0 else -1                                                         # the lock's pedal, on the outboard side
    box(S['steel'], x + side * 0.155, x + side * 0.215, yard - 0.025, yard + 0.025, 0.020, 0.028, STAINLESS, r=0.002)
    box(S['rubber'], x + side * 0.170, x + side * 0.212, yard - 0.022, yard + 0.022, 0.028, 0.032, RUBBER, r=0.0)
    sliding(f'chair-{key}-slide', f'{name}: on its rail', (0, 0, -1), 0.42, (x, yard, 0.2), say=('forward at the console', 'run aft'))
    # ---- what turns on the pedestal: the seat's mechanism, the seat, the back, the headrest, the armrests, the footrest
    T = moving(f'{name}, seat', f'chair-{key}-turn', leather='Leather', plastic='Plastic', steel='Stainless', seam='Marking')
    box(T['plastic'], x - 0.17, x + 0.17, yard - 0.17, yard + 0.17, 0.478, 0.515, srgb(0x1c1e20), r=0.006)
    tube(T['steel'], (x - side * 0.17, yard + 0.02, 0.497), (x - side * 0.25, yard + 0.02, 0.497), 0.006, STAINLESS)                 # the height lever
    T['plastic'].ball(P(x - side * 0.255, yard + 0.02, 0.497), 0.012, srgb(0x1c1e20))
    pillow(T['leather'], x - 0.25, x + 0.25, yard - 0.23, yard + 0.25, 0.515, 0.64, LEATHER, r=0.045)
    for sx in (-1, 1):                                                                # the seat's side bolsters
        pillow(T['leather'], x + sx * 0.25 - 0.045, x + sx * 0.25 + 0.035, yard - 0.20, yard + 0.22, 0.585, 0.665, tint(LEATHER, 1.12), r=0.03)
    lean = radians(11.0)
    with Frame((x, yard - 0.205, 0.60), PORT, (0.0, cos(lean), -sin(lean))) as F:     # the back's own frame: its front looks forward
        F.into = dict(seat=T['leather'], plastic=T['plastic'], steel=T['steel'], seam=T['seam'])
        F.pillow('seat', (-0.235, 0.0, -0.095), (0.235, 0.66, 0.0), LEATHER, r=0.04)
        for sx in (-1, 1):                                                            # the back's side wings
            F.pillow('seat', (sx * 0.235 - 0.045, 0.05, -0.06), (sx * 0.235 + 0.035, 0.48, 0.035), tint(LEATHER, 1.12), r=0.03)
        F.pillow('seat', (-0.15, 0.12, -0.02), (0.15, 0.30, 0.018), tint(LEATHER, 1.08), r=0.018)                    # the lumbar pad
        for yy in (0.36, 0.47, 0.58):                                                 # the seams across the back
            F.line('seam', [(-0.17, yy), (0.17, yy)], 0.0025, 0.0006, srgb(0x0c0c0d))
        F.block('plastic', (-0.225, 0.02, -0.112), (0.225, 0.62, -0.090), srgb(0x17191b), r=0.006)                   # the shell behind it
        for sx in (-1, 1):                                                            # the headrest on its two stalks
            F.tube('steel', (sx * 0.07, 0.60, -0.05), (sx * 0.07, 0.74, -0.05), 0.006, STAINLESS)
        F.pillow('seat', (-0.14, 0.70, -0.09), (0.14, 0.88, -0.005), LEATHER, r=0.035)
    for sx in (-1, 1):                                                                # an armrest each side: a bar from the mechanism, a pad
        sweep(T['steel'], [(x + sx * 0.17, yard - 0.12, 0.50), (x + sx * 0.295, yard - 0.12, 0.50), (x + sx * 0.295, yard - 0.12, 0.84)], 0.011, STAINLESS)
        pillow(T['leather'], x + sx * 0.295 - 0.035, x + sx * 0.295 + 0.035, yard - 0.17, yard + 0.19, 0.842, 0.89, tint(LEATHER, 1.1), r=0.02)
    # the footrest: a bar bent from the mechanism down and forward, and a ribbed tread across it
    for sx in (-1, 1):
        sweep(T['steel'], [(x + sx * 0.13, yard + 0.16, 0.495), (x + sx * 0.13, yard + 0.30, 0.42), (x + sx * 0.13, yard + 0.40, 0.25)], 0.010, STAINLESS)
    box(T['plastic'], x - 0.17, x + 0.17, yard + 0.36, yard + 0.44, 0.228, 0.248, srgb(0x1c1e20), r=0.004)
    for k in range(5):
        box(T['plastic'], x - 0.16, x + 0.16, yard + 0.368 + k * 0.014, yard + 0.374 + k * 0.014, 0.248, 0.251, srgb(0x2a2d30), r=0.0)
    px, py, pz = P(x, yard, 0.0)
    MOTIONS.append(dict(id=f'chair-{key}-turn', name=f'{name}: on its pedestal', kind='turn', pivot=[px, py, pz], axis=[0, 1, 0], ratio=-1.0 * side, max=70,
                        at=[px, py + 0.7, pz], auto='tap', reach=1.9, rest='facing forward', above='turned inboard', on=f'chair-{key}-slide'))


# ---------------------------------------------------------------------------------------------------------------------
# The steering stand and its wheel
# ---------------------------------------------------------------------------------------------------------------------
def stand(g, tag, *where):
    """The steering stand: a hammer-finish pedestal bolted to the deck, a dark top, the helm unit, and the wooden wheel on
    its shaft, which turns with the rudder order."""
    box('case', -0.32, 0.32, 21.48, 22.02, 0.012, 0.10, STAND, r=0.006)
    box('case', -0.28, 0.28, 21.52, 21.98, 0.10, 0.95, STAND, r=0.006)
    box('desk', -0.31, 0.31, 21.49, 22.01, 0.95, 0.98, DESK, r=0.004)
    for sx in (-1, 1):                                                                # the foot's holding-down bolts, and an inspection plate each side
        for yd in (21.53, 21.75, 21.97):
            with Frame((sx * 0.30, yd, 0.10), STBD, FWD) as F:
                bolt(F, 0.0, 0.0, 0.0, r=0.007, h=0.005)
        with Frame((sx * 0.28, 21.75, 0.52), AFTWARD if sx > 0 else FWD, UP) as F:
            F.block('case', (-0.15, -0.20, 0.0), (0.15, 0.20, 0.004), tint(STAND, 0.94), r=0.001)
            corner_screws(F, -0.15, -0.20, 0.15, 0.20, 0.004, inset=0.012, r=0.003)
            louvres(F, -0.10, -0.15, 0.10, -0.05, 0.004, n=4, key='case', colour=tint(STAND, 0.94))
    with Frame((0.0, 21.52, 0.30), STBD, UP) as F:
        nameplate(F, 'STEERING STAND', 0.0, 0.0, 0.0, height=0.009)
    # The wheel is one moving part on its shaft: it turns with the rudder order, four degrees for one of rudder, and its
    # king spoke (the one with the brass cap) stands upright when the rudders are amidships.
    c = (0.0, 21.42, 1.05)
    mv = moving('Wheelhouse, steering wheel', 'wheel', wood='Varnished wood', brass='Bronze', shaft='Stainless')
    torus(mv['wood'], c, 0.29, 0.022, WOOD)
    lathe(mv['brass'], (0, 21.385, 1.05), FWD, [(0.0, 0.0), (0.0, 0.040), (0.006, 0.055), (0.064, 0.055), (0.070, 0.045), (0.070, 0.0)], BRASS)
    # The helm unit, on the stand's top at its after edge. The owner, 11 November 2026: "The wheel is not connected to anything
    # in the wheelhouse": it hung on a stub of shaft that ended in the air, 4 cm over the stand. The shaft now turns with the
    # wheel and runs through a flanged bearing into the unit, where it turns the two transmitters (one for each control
    # system) and, through a reduction, the pointer under the glass on the unit's lid, which shows the rudder ordered.
    hx, ha, hb, h0, h1 = 0.11, 21.50, 21.63, 0.98, 1.135
    box('case', -hx, hx, ha, hb, h0, h1 - 0.012, STAND, r=0.005)
    box('desk', -hx + 0.008, hx - 0.008, ha + 0.008, hb - 0.008, h1 - 0.012, h1, DESK, r=0.002)                    # its lid
    with Frame((0.0, (ha + hb) / 2, h1), STBD, FWD) as F:
        corner_screws(F, -hx + 0.008, -(hb - ha) / 2 + 0.008, hx - 0.008, (hb - ha) / 2 - 0.008, 0.0, inset=0.008, r=0.0028)
        F.lathe('brass', (0.0, 0.0, 0.0), [(0.0, 0.056), (0.006, 0.056), (0.008, 0.050), (0.008, 0.046)], BRASS)       # the bezel of the rudder-order dial
        F.round_pic('rai', 0.0, 0.0, 0.046, 0.0016)
        F.lathe('clear', (0.0, 0.0, 0.004), [(0.0, 0.0), (0.0, 0.047), (0.0015, 0.047), (0.0015, 0.0)], (0.9, 0.95, 0.95))
    lathe('steel', (0, ha - 0.012, 1.05), FWD, [(0.0, 0.0), (0.0, 0.064), (0.012, 0.064), (0.012, 0.0)], GREY)        # the bearing's flange
    lathe('steel', (0, ha - 0.034, 1.05), FWD, [(0.0, 0.0), (0.0, 0.036), (0.004, 0.040), (0.022, 0.040)], GREY)      # and its boss
    for i in range(6):
        a = i * pi / 3 + pi / 6
        with Frame((0.052 * cos(a), ha - 0.012, 1.05 + 0.052 * sin(a)), STBD, UP) as F:
            bolt(F, 0.0, 0.0, 0.0, r=0.0055, h=0.004)
    tube(mv['shaft'], (0, 21.455, 1.05), (0, ha + 0.04, 1.05), 0.019, STEEL, 14)                                      # the shaft, into the unit
    for i in range(8):
        a = i * pi / 4
        d = (cos(a), sin(a))
        # a turned spoke: a swell where it leaves the hub, a waist, a swell at the rim, and the handle beyond it
        lathe(mv['wood'], (0.05 * d[0], 21.42, 1.05 + 0.05 * d[1]), (d[0], d[1], 0.0),
              [(0.0, 0.012), (0.03, 0.017), (0.06, 0.012), (0.20, 0.014), (0.225, 0.018), (0.255, 0.018), (0.262, 0.013), (0.285, 0.016), (0.315, 0.0165), (0.325, 0.011), (0.325, 0.0)], WOOD)
    lathe(mv['brass'], (0, 21.42, 1.05 + 0.365), UP, [(0.0, 0.0), (0.0, 0.0172), (0.016, 0.0172), (0.022, 0.012), (0.022, 0.0)], BRASS)   # the king spoke's cap
    tube(mv['brass'], (0, 21.42, 1.05 + 0.312), (0, 21.42, 1.05 + 0.322), 0.0178, BRASS, 10)
    LEVERS.append(dict(id='wheel', input='rudder', axis=[0, 0, 1], pivot=list(P(*c)), ratio=4.0))


# ---------------------------------------------------------------------------------------------------------------------
# The settee and the watchkeeper's table
# ---------------------------------------------------------------------------------------------------------------------
def sofa(g, tag, x, yard, h):
    """A settee along the port side under the windows, forward of the wing door: black leather on a base with a recessed
    plinth; two seat cushions, two back cushions that lean, an arm at each end; piping along the seat's front."""
    L_, D = g['l'], g['d']
    x1 = X_IN - 0.012                                   # its back stands just off the skirting
    x0 = x1 - D                                         # its front, inboard
    y0, y1 = yard - L_ / 2, yard + L_ / 2
    box('dark', x0 + 0.05, x1 - 0.03, y0 + 0.04, y1 - 0.04, 0.012, 0.11, srgb(0x16181a), r=0.003)
    box('seat', x0, x1, y0, y1, 0.11, 0.31, tint(LEATHER, 0.92), r=0.004)
    arm = 0.10
    for a, b in ((y0, y0 + arm), (y1 - arm, y1)):                                     # the arms
        pillow('seat', x0 - 0.005, x1, a, b, 0.29, 0.63, LEATHER, r=0.04)
    half = (L_ - 2 * arm) / 2
    for k in range(2):
        a = y0 + arm + k * half
        pillow('seat', x0 - 0.012, x1 - 0.13, a + 0.004, a + half - 0.004, 0.305, 0.455, LEATHER, r=0.045)          # a seat cushion
        with Frame((x1 - 0.185, a + half / 2, 0.44), FWD, (sin(radians(9)), cos(radians(9)), 0.0)) as F:             # a back cushion, leaning against the wall
            F.pillow('seat', (-half / 2 + 0.004, 0.0, -0.115), (half / 2 - 0.004, 0.39, 0.01), LEATHER, r=0.045)
            F.line('seam', [(-half / 2 + 0.05, 0.20), (half / 2 - 0.05, 0.20)], 0.0025, 0.0106, srgb(0x0c0c0d))
    sweep('rubber', [(x0 - 0.002, y0 + arm + 0.01, 0.307), (x0 - 0.002, y1 - arm - 0.01, 0.307)], 0.004, srgb(0x0e0e0f))   # the piping
    with Frame((x0, yard, 0.20), FWD, UP) as F:                                       # the base's front: two flush pulls for the lockers under the seat
        for sx in (-1, 1):
            F.block('steel', (sx * half / 2 - 0.045, -0.012, 0.0), (sx * half / 2 + 0.045, 0.012, 0.003), STAINLESS, r=0.001)
            F.box('dark', (sx * half / 2 - 0.035, -0.006, 0.003), (sx * half / 2 + 0.035, 0.006, 0.0035), srgb(0x0c0c0d))


# Her profile for the table's top, bow to the right: lines of (along her length, up from her keel) in metres. The 68 m ship
# of the general arrangement: hull, bulwark, the long house, the wheelhouse forward, two funnels aft, the mast.
_PROFILE = [
    [(0.0, 3.0), (0.0, 9.7), (2.0, 10.9), (20.0, 10.9), (20.0, 9.7), (50.0, 9.7), (58.0, 9.9), (66.0, 10.6), (68.4, 11.0), (66.6, 6.0), (64.0, 1.6), (61.0, 0.0), (6.0, 0.0), (2.0, 1.0), (0.0, 3.0)],
    [(0.0, 5.1), (66.0, 5.1)],                                                        # her waterline
    [(3.0, 10.9), (3.0, 12.1), (22.0, 12.1), (22.0, 14.4), (50.0, 14.4), (50.0, 17.1), (53.6, 17.1), (54.2, 14.4), (54.2, 12.1), (57.0, 12.1), (57.0, 10.0)],
    [(22.0, 12.1), (54.2, 12.1)], [(50.0, 14.4), (54.2, 14.4)],
    [(13.4, 12.1), (13.0, 19.6), (16.6, 19.6), (17.4, 12.1)], [(13.1, 18.2), (16.75, 18.2)],            # a funnel and its band
    [(51.6, 17.1), (51.6, 21.6)], [(50.9, 20.0), (52.3, 20.0)], [(51.0, 18.4), (52.2, 18.4)],            # the mast, its yard, the radar
    [(0.0, 9.7), (-1.6, 8.6)],                                                         # the ramp, raised
] + [[(24.0 + k * 2.6, 12.9), (25.2 + k * 2.6, 12.9), (25.2 + k * 2.6, 13.6), (24.0 + k * 2.6, 13.6), (24.0 + k * 2.6, 12.9)] for k in range(10)] \
  + [[(50.5 + k * 0.75, 15.4), (51.0 + k * 0.75, 15.4), (51.0 + k * 0.75, 16.4), (50.5 + k * 0.75, 16.4), (50.5 + k * 0.75, 15.4)] for k in range(4)]


def table(g, tag, x, yard, h):
    """The watchkeeper's table at the starboard side, forward of the pantry: a top of light varnished wood with her profile
    engraved in it and a cup well in its inboard after corner; an apron with a drawer; two legs bolted to the deck, and a
    cleat on the side lining. On it the deck log under its lamp. (It stood in the forward corner, cleated to the front
    lining too; the bay is before it now, and it is 0.36 m broad where it was 0.58, so that the way past it to the front
    of the console block is 0.70 m: the access to the block's back.)"""
    w, l, H = g['w'], g['l'], g['H']
    xa, xb = -X_IN + 0.006, -X_IN + 0.006 + w           # against the starboard lining, to inboard
    ya, yb = FRONT_IN - 0.006 - l, FRONT_IN - 0.006     # and against the front lining
    t = 0.030
    well = (xb - 0.085, ya + 0.085, 0.046)              # the cup well: its middle, its radius
    p = part('lwood')
    # ---- the top: one board with a round hole through it for the well
    corners = [(xa, ya), (xb - 0.03, ya), (xb, ya + 0.03), (xb, yb), (xa, yb)]
    ring = [(well[0] + well[2] * cos(2 * pi * k / 36), well[1] + well[2] * sin(2 * pi * k / 36)) for k in range(36)]
    start = len(p.f)
    p.polygon([P(a, b, H) for a, b in corners], WOODL, holes=[[P(a, b, H) for a, b in ring]])
    p.orient(start, UP)
    start = len(p.f)
    p.polygon([P(a, b, H - t) for a, b in corners], WOODL, holes=[[P(a, b, H - t) for a, b in ring]])
    p.orient(start, (0, -1, 0))
    start = len(p.f)
    p.grid([[P(a, b, H - t) for a, b in corners], [P(a, b, H) for a, b in corners]], WOODL, close=True)
    mid = Vector(P((xa + xb) / 2, (ya + yb) / 2, H - t / 2))
    p.orient(start, lambda c: (c[0] - mid[0], 0.0, c[2] - mid[2]))
    start = len(p.f)
    p.grid([[P(a, b, H - t) for a, b in ring], [P(a, b, H) for a, b in ring]], WOODL, close=True)
    cw = Vector(P(well[0], well[1], H))
    p.orient(start, lambda c: (cw[0] - c[0], 0.0, cw[2] - c[2]))
    # the well's stainless cup, hung in the hole by its rim
    lathe('steel', (well[0], well[1], H - 0.062), UP, [(0.0, 0.0), (0.0, well[2] - 0.004), (0.060, well[2] - 0.002), (0.0635, well[2] + 0.007), (0.0635, well[2] - 0.003)], STAINLESS)
    # a low fiddle along the two free edges
    box('lwood', xa, xb - 0.03, ya - 0.004, ya + 0.008, H, H + 0.014, tint(WOODL, 0.92), r=0.003)
    box('lwood', xb - 0.008, xb + 0.004, ya + 0.16, yb, H, H + 0.014, tint(WOODL, 0.92), r=0.003)
    # ---- her profile, engraved and filled dark, bow forward, along the table's length
    with Frame(((xa + xb) / 2 - 0.02, (ya + yb) / 2 + 0.04, H), AFTWARD, STBD) as F:   # read by one who stands inboard of the table: her bow to his left, forward
        s = 0.52 / 68.4
        for line in _PROFILE:
            F.line('seam', [((34.2 - a) * s, (b - 10.5) * s) for a, b in line], 0.0016, 0.0007, srgb(0x3a2a18))
        F.text('M.V. CHISUM', 0.0, -0.105, 0.0007, 0.011, srgb(0x3a2a18))
        F.text('JOHANSSON LINE  ·  MINATO', 0.0, -0.125, 0.0007, 0.0065, srgb(0x3a2a18))
    # ---- the apron and its drawer, the legs, the cleats
    for a, b, c, e in ((xa + 0.03, xb - 0.04, ya + 0.04, ya + 0.058), (xa + 0.03, xb - 0.04, yb - 0.058, yb - 0.04), (xa + 0.03, xa + 0.048, ya + 0.058, yb - 0.058)):
        box('lwood', a, b, c, e, H - t - 0.10, H - t, tint(WOODL, 0.94), r=0.002)
    for yd in (ya + 0.06, yb - 0.06):
        lathe('steel', (xb - 0.06, yd, 0.012), UP, [(0.0, 0.055), (0.006, 0.055), (0.010, 0.030), (0.03, 0.024), (H - t - 0.012 - 0.03, 0.024), (H - t - 0.012 - 0.012, 0.040), (H - t - 0.012, 0.040)], STAINLESS)
        for k in range(4):
            with Frame((xb - 0.06 + 0.043 * cos(k * pi / 2 + 0.7), yd + 0.043 * sin(k * pi / 2 + 0.7), 0.018), STBD, FWD) as F:
                bolt(F, 0.0, 0.0, 0.0, r=0.0045, h=0.0035)
    box('lwood', xa - 0.006, xa + 0.03, ya + 0.04, yb - 0.04, H - t - 0.045, H - t, tint(WOODL, 0.9), r=0.002)       # a cleat on the side lining
    box('lwood', xa, xb - 0.03, yb - 0.008, yb + 0.004, H, H + 0.014, tint(WOODL, 0.92), r=0.003)                    # a fiddle along its forward edge, which is free since the bay was built out
    M = moving("Watchkeeper's table, drawer", 'table-drawer', wood='Light wood', brass='Bronze', paint='Deck paint')
    da, db = ya + 0.075, yb - 0.075
    box(M['wood'], xb - 0.058, xb - 0.040, da, db, H - t - 0.092, H - t - 0.008, WOODL, r=0.003)                   # its front
    box(M['wood'], xa + 0.07, xb - 0.058, da + 0.01, db - 0.01, H - t - 0.088, H - t - 0.078, tint(WOODL, 0.85), r=0.0)   # its bottom
    for a, b in ((da + 0.01, da + 0.02), (db - 0.02, db - 0.01)):
        box(M['wood'], xa + 0.07, xb - 0.058, a, b, H - t - 0.078, H - t - 0.02, tint(WOODL, 0.85), r=0.0)
    box(M['wood'], xa + 0.07, xa + 0.08, da + 0.02, db - 0.02, H - t - 0.078, H - t - 0.02, tint(WOODL, 0.85), r=0.0)
    box(M['paint'], xa + 0.12, xb - 0.12, da + 0.05, db - 0.05, H - t - 0.078, H - t - 0.062, srgb(0x22344a), r=0.002)      # a spare log book in it
    with Frame((xb - 0.040, (da + db) / 2, H - t - 0.05), AFTWARD, UP) as F:
        F.into = dict(steel=M['brass'], brass=M['brass'])
        pull(F, -0.05, 0.05, 0.0, 0.0, proud=0.02, r=0.004, colour=BRASS)
    sliding('table-drawer', "Watchkeeper's table, drawer", (1, 0, 0), 0.26, (xb - 0.04, (da + db) / 2, H - 0.08))
    # ---- on it: the deck log, open, and a pencil
    pic((xa + 0.19, yb - 0.21, H), UP, STBD, 0.30, 0.21, 'logbook', proud=0.0052)
    box('paint', xa + 0.085, xa + 0.295, yb - 0.365, yb - 0.055, H, H + 0.005, srgb(0x22344a), r=0.001)
    sweep('paint', [(xa + 0.33, yb - 0.30, H + 0.0035), (xa + 0.33, yb - 0.16, H + 0.0035)], 0.0035, srgb(0xd8b23a))
    # ---- its lamp: a base on the top, a flexible neck, a small shaded head, lit
    lx, ly = xa + 0.06, yb - 0.06
    lathe('anod', (lx, ly, H), UP, [(0.0, 0.032), (0.006, 0.032), (0.012, 0.012), (0.02, 0.008)], ANOD)
    sweep('steel', [(lx, ly, H + 0.018), (lx, ly, H + 0.20), (lx + 0.03, ly - 0.03, H + 0.29), (lx + 0.10, ly - 0.10, H + 0.31), (lx + 0.14, ly - 0.14, H + 0.29)], 0.0045, srgb(0x4a4f52))
    _shade((lx + 0.125, ly - 0.125, H + 0.30), (0.5, -0.62, -0.5), 0.05, 0.030)


# ---------------------------------------------------------------------------------------------------------------------
# The chart table and what belongs to it
# ---------------------------------------------------------------------------------------------------------------------
def chart_table(g, tag, x, yard, h):
    """The chart table against the after wall: a mahogany carcass, three drawers for folded charts that run out to a tap,
    a top with a fiddle round three sides, the chart in use, dividers and a parallel rule."""
    w, d, H = g['w'], g['d'], g['H']
    x0, x1, y0, y1 = x - w / 2, x + w / 2, AFT_FACE, AFT + d
    dark = tint(WOOD, 0.9)
    box('wood', x0 + 0.02, x1 - 0.02, y0 + 0.02, y1 - 0.05, 0.012, 0.09, tint(WOOD, 0.6), r=0.003)                   # the plinth
    for a, b in ((x0, x0 + 0.02), (x1 - 0.02, x1)):                                                               # its two sides
        box('wood', a, b, y0, y1 - 0.01, 0.09, H - 0.03, dark, r=0.003)
    box('wood', x0 + 0.02, x1 - 0.02, y0, y0 + 0.015, 0.09, H - 0.03, dark, r=0.0)                                 # its back
    for k in range(3):                                                                                            # the rails the drawers run on
        hh = 0.108 + k * 0.272
        box('wood', x0 + 0.02, x1 - 0.02, y0 + 0.015, y1 - 0.012, hh - 0.013, hh + 0.002, dark, r=0.0)
    box('wood', x0 - 0.01, x1 + 0.01, y0, y1 + 0.01, H - 0.03, H, WOOD, r=0.004)                                   # the top
    for a, b, c, e in ((x0 - 0.01, x1 + 0.01, y0, y0 + 0.012), (x0 - 0.01, x0 + 0.002, y0 + 0.012, y1 + 0.01), (x1 - 0.002, x1 + 0.01, y0 + 0.012, y1 + 0.01)):
        box('wood', a, b, c, e, H, H + 0.025, WOOD, r=0.003)                                                       # a fiddle round three sides
    for k in range(3):                                                                                            # the drawers
        hh = 0.108 + k * 0.272
        mover = f'chart-drawer-{k + 1}'
        M = moving(f'Chart table, drawer {k + 1}', mover, wood='Varnished wood', brass='Bronze', paper='Deck paint')
        box(M['wood'], x0 + 0.024, x1 - 0.024, y1 - 0.012, y1 + 0.008, hh, hh + 0.252, tint(WOOD, 1.08), r=0.004)   # its front
        box(M['wood'], x0 + 0.03, x1 - 0.03, y0 + 0.03, y1 - 0.012, hh + 0.005, hh + 0.016, dark, r=0.0)            # its bottom, sides and back
        for a, b in ((x0 + 0.03, x0 + 0.042), (x1 - 0.042, x1 - 0.03)):
            box(M['wood'], a, b, y0 + 0.03, y1 - 0.012, hh + 0.016, hh + 0.20, dark, r=0.0)
        box(M['wood'], x0 + 0.042, x1 - 0.042, y0 + 0.03, y0 + 0.042, hh + 0.016, hh + 0.20, dark, r=0.0)
        for j in range(3 - k):                                                                                    # the folded charts in it
            box(M['paper'], x0 + 0.07 + j * 0.01, x1 - 0.08 - j * 0.015, y0 + 0.07, y1 - 0.06, hh + 0.016 + j * 0.006, hh + 0.0215 + j * 0.006,
                (srgb(0xe6dfc8), srgb(0xd9d3bd), srgb(0xcfd6d2))[j], r=0.0)
        with Frame((x, y1 + 0.008, hh + 0.126), PORT, UP) as F:
            F.into = dict(steel=M['brass'], brass=M['brass'], anod=M['brass'], seam=M['paper'])
            pull(F, -0.06, 0.06, 0.0, 0.0, proud=0.022, r=0.0045, colour=BRASS)
            F.block('brass', (-0.035, 0.045, 0.0), (0.035, 0.072, 0.0015), BRASS, r=0.0)                            # the label holder
        sliding(mover, f'Chart table, drawer {k + 1}', (0, 0, 1), 0.36, (x, y1, hh + 0.126), say=('shut', 'run out'))
    pic((x, yard + 0.01, H), UP, FWD, 0.88, 0.54, 'chart')
    # dividers and a parallel rule on the chart
    for end in ((x + 0.20, yard + 0.02), (x + 0.24, yard + 0.01)):
        sweep('brass', [(x + 0.30, yard + 0.14, H + 0.006), (end[0], end[1], H + 0.004)], 0.0032, BRASS)
    part('brass').ball(P(x + 0.30, yard + 0.14, H + 0.007), 0.006, BRASS)
    for off in (0.0, 0.065):
        box('plastic', x - 0.34, x - 0.02, yard - 0.20 + off, yard - 0.16 + off, H + 0.002, H + 0.007, srgb(0x9aa7aa), r=0.001)
    for xx in (x - 0.27, x - 0.09):
        box('brass', xx - 0.006, xx + 0.006, yard - 0.165, yard - 0.13, H + 0.007, H + 0.009, BRASS, r=0.0)


def _shade(at, way, length=0.06, mouth=0.036, works=None):
    """A lamp's shade and the lit glass in its mouth: `at` is where the neck meets it, `way` the way it shines. With `works`
    (a dimmer) the glass is lit only while that is turned up: under it is the glass unlit."""
    ax = Vector(way).normalized()
    lathe('anod', at, tuple(ax), [(0.0, 0.011), (0.012, 0.018), (length, mouth), (length, mouth - 0.005)], ANOD)
    o = Vector(P(*at)) + ax * (length - 0.006)
    lit = part('lit') if not works else shown('chart-lamp-lit', works, 'Chart lamp, lit', 'Lit lamp')
    lit.lathe(tuple(o), tuple(ax), [(0.0, 0.0), (0.0, mouth - 0.006), (0.002, mouth - 0.006), (0.002, 0.0)], WHITE_LAMP)
    if works:
        part('lens').lathe(tuple(o - ax * 0.003), tuple(ax), [(0.0, 0.0), (0.0, mouth - 0.007), (0.002, mouth - 0.007), (0.002, 0.0)], tint(WHITE_LAMP, 0.7))


def chart_lamp(g, tag, x, yard, h):
    """The chart lamp: a base, a flexible neck, a shaded head over the chart, lit and dimmed."""
    lathe('anod', (x, yard, h), UP, [(0.0, 0.034), (0.006, 0.034), (0.014, 0.012), (0.024, 0.008)], ANOD)
    sweep('steel', [(x, yard, h + 0.02), (x, yard, h + 0.24), (x + 0.03, yard + 0.02, h + 0.32), (x + 0.11, yard + 0.08, h + 0.34), (x + 0.16, yard + 0.12, h + 0.31)], 0.005, srgb(0x4a4f52))
    _shade((x + 0.15, yard + 0.112, h + 0.318), (0.55, 0.45, -0.7), works='dimmer-chart')


def bookshelf(g, tag, x, yard, h):
    """The shelf of nautical publications: a mahogany shelf with ends and a fiddle bar, and the books themselves, no two alike."""
    w, d, H = g['w'], g['d'], g['H']
    box('wood', x - w / 2 - 0.015, x + w / 2 + 0.015, yard + 0.001, yard + d, h - 0.02, h, WOOD, r=0.003)
    for sx in (-1, 1):
        box('wood', x + sx * (w / 2 + 0.015), x + sx * (w / 2), yard + 0.001, yard + d, h, h + H + 0.02, WOOD, r=0.003)
    box('wood', x - w / 2, x + w / 2, yard + 0.001, yard + 0.012, h, h + H + 0.02, tint(WOOD, 0.8), r=0.0)
    sweep('brass', [(x - w / 2, yard + d - 0.012, h + 0.09), (x + w / 2, yard + d - 0.012, h + 0.09)], 0.005, BRASS)
    colours = (0x1f3a5c, 0x7a1f1f, 0x1f5c3a, 0xc8a23a, 0x2a2a2a, 0xdad6c6, 0x5c3a1f, 0x14506e, 0x8a2f1f, 0x3a5c1f, 0xb8b2a0, 0x22344a)
    at = x - w / 2 + 0.006
    k = 0
    while at < x + w / 2 - 0.03:
        thick = 0.022 + 0.018 * _hash01(k * 3.7)
        tall = H - 0.01 - 0.05 * _hash01(k * 1.3 + 2.0)
        deep = d - 0.05 - 0.03 * _hash01(k * 2.1 + 5.0)
        if at + thick > x + w / 2 - 0.004:
            break
        col = srgb(colours[k % len(colours)])
        box('paint', at, at + thick, yard + 0.012, yard + 0.012 + deep, h, h + tall, col, r=0.002)
        box('paint', at + 0.0015, at + thick - 0.0015, yard + 0.012 + deep - 0.0005, yard + 0.012 + deep + 0.0006, h + tall * 0.62, h + tall * 0.80, srgb(0xe8e2c8), r=0.0)   # its title label
        at += thick + 0.0015
        k += 1


def _hash01(v):
    q = sin(v * 12.9898) * 43758.5453
    return q - int(q) if q > 0 else q - int(q) + 1


def log_desk(g, tag, x, yard, h):
    """(The fold-down log desk is gone: the watchkeeper's table has the deck log.)"""
    table(g, tag, x, yard, h)


def locker(g, tag, x, yard, h):
    """The locker under the boards: lifejackets and pyrotechnics. A white carcass on a plinth with a mahogany top; four doors
    on hinges with pulls, each opening to a tap; in it four lifejackets, the flares in their drum, the line-thrower."""
    w, d, H = g['w'], g['d'], g['H']
    x0, x1, ya, yb = x - w / 2, x + w / 2, AFT_FACE, yard + d
    box('dark', x0 + 0.02, x1 - 0.02, ya + 0.02, yb - 0.035, 0.012, 0.08, srgb(0x16181a), r=0.003)
    box('joinery', x0, x1, ya, yb, 0.08, 0.10, JOINERY, r=0.0)                                                     # bottom
    box('joinery', x0, x1, ya, ya + 0.015, 0.10, H, JOINERY, r=0.0)                                                # back
    n = 4
    for k in range(n + 1):                                                                                        # ends and divisions
        xx = x0 + k * (w - 0.018) / n
        box('joinery', xx, xx + 0.018, ya + 0.015, yb, 0.10, H, JOINERY, r=0.0)
    box('wood', x0 - 0.01, x1 + 0.01, ya, yb + 0.012, H, H + 0.025, WOOD, r=0.005)
    stock = ('lifejackets', 'lifejackets', 'flares', 'line')
    for k in range(n):
        a, b = x0 + k * (w - 0.018) / n + 0.018, x0 + (k + 1) * (w - 0.018) / n
        # what is kept in it
        if stock[k] == 'lifejackets':
            for j in range(2):
                pillow('cloth', a + 0.03, b - 0.03, ya + 0.04, yb - 0.05, 0.10 + j * 0.235, 0.34 + j * 0.235, ORANGE, r=0.05)
                box('paint', a + 0.08, b - 0.08, yb - 0.052, yb - 0.049, 0.18 + j * 0.235, 0.21 + j * 0.235, srgb(0xd8dcdc), r=0.0)    # its reflective tape
        elif stock[k] == 'flares':
            lathe('plastic', ((a + b) / 2, ya + 0.16, 0.10), UP, [(0.0, 0.0), (0.0, 0.13), (0.34, 0.13), (0.36, 0.11), (0.36, 0.0)], srgb(0xc23a2a))
            lathe('dark', ((a + b) / 2, ya + 0.16, 0.46), UP, [(0.0, 0.0), (0.0, 0.135), (0.04, 0.135), (0.05, 0.10), (0.05, 0.0)], srgb(0x202326))
        else:
            box('plastic', a + 0.04, b - 0.04, ya + 0.05, yb - 0.06, 0.10, 0.42, YELLOW, r=0.02)
            box('dark', a + 0.14, b - 0.14, ya + 0.12, yb - 0.13, 0.42, 0.45, srgb(0x202326), r=0.006)
        mover = f'locker-door-{k + 1}'
        M = moving(f'Locker under the boards, door {k + 1}', mover, leaf='Laminate', fit='Stainless', mark='Marking')
        box(M['leaf'], a + 0.003, b - 0.003, yb - 0.002, yb + 0.016, 0.105, H - 0.005, tint(JOINERY, 1.02), r=0.004)
        with Frame(((a + b) / 2, yb + 0.016, (0.105 + H) / 2), PORT, UP) as F:
            F.into = dict(steel=M['fit'], seam=M['mark'], anod=M['leaf'], joinery=M['leaf'])
            wd = b - a - 0.006
            pull(F, wd / 2 - 0.05, wd / 2 - 0.05, 0.0, 0.0) if False else None
            F.sweep('steel', [(wd / 2 - 0.045, 0.10, 0.0), (wd / 2 - 0.045, 0.10, 0.02), (wd / 2 - 0.045, 0.20, 0.02), (wd / 2 - 0.045, 0.20, 0.0)], 0.005, STAINLESS)
            for yy in (-0.22, 0.22):
                hinge(F, -wd / 2 + 0.004, yy - 0.03, yy + 0.03, 0.0)
        hinged(mover, f'Locker under the boards, door {k + 1} ({stock[k]})', (a + 0.003, yb + 0.006, 0.0), ratio=-1.0, opens=100, at=((a + b) / 2, yb, 0.45), reach=1.9)


FLAGS = [                                 # the code flags, a colour or two each (not their patterns): letters, numerals, substitutes
    (0xf2f0e8, 0x1f4fa0), (0xc2281f, 0xc2281f), (0x1f4fa0, 0xf2f0e8), (0xe8c820, 0x1f4fa0), (0x1f4fa0, 0xc2281f), (0xf2f0e8, 0xc2281f), (0xe8c820, 0x1f4fa0),
    (0xf2f0e8, 0xc2281f), (0xe8c820, 0x16181a), (0x1f4fa0, 0xf2f0e8), (0xe8c820, 0x1f4fa0), (0xe8c820, 0x16181a), (0x1f4fa0, 0xf2f0e8), (0x1f4fa0, 0xf2f0e8),
    (0xc2281f, 0xe8c820), (0x1f4fa0, 0xf2f0e8), (0xe8c820, 0xe8c820), (0xc2281f, 0xe8c820), (0xf2f0e8, 0x1f4fa0), (0xc2281f, 0xf2f0e8), (0xc2281f, 0xe8c820),
    (0xf2f0e8, 0xc2281f), (0x1f4fa0, 0xc2281f), (0xf2f0e8, 0x1f4fa0), (0xe8c820, 0xc2281f), (0x16181a, 0xe8c820), (0xe8c820, 0xc2281f), (0xf2f0e8, 0xc2281f),
    (0x1f4fa0, 0xf2f0e8), (0xc2281f, 0x1f4fa0), (0xc2281f, 0xf2f0e8), (0xe8c820, 0x1f4fa0), (0x16181a, 0xf2f0e8), (0xe8c820, 0xc2281f), (0xf2f0e8, 0xc2281f),
    (0xf2f0e8, 0x16181a), (0x1f4fa0, 0xe8c820), (0x1f4fa0, 0xf2f0e8), (0xf2f0e8, 0x16181a), (0xc2281f, 0xe8c820),
]


def flag_locker(g, tag, x, yard, h):
    """The flag locker: a mahogany case of forty pigeonholes, four across and ten high, a signal flag rolled in each with
    its toggle outward."""
    w, H, d = g['w'], g['H'], g['d']
    x0, x1, ya, yb = x - w / 2, x + w / 2, yard + 0.001, yard + d
    box('wood', x0, x1, ya, ya + 0.012, h, h + H, tint(WOOD, 0.75), r=0.0)
    cols, rows, t = 4, 10, 0.008
    cw, ch = (w - t) / cols, (H - t) / rows
    for k in range(cols + 1):
        box('wood', x0 + k * cw, x0 + k * cw + t, ya + 0.012, yb, h, h + H, WOOD, r=0.0)
    for j in range(rows + 1):
        box('wood', x0 + t, x1 - t, ya + 0.012, yb, h + j * ch, h + j * ch + t, WOOD, r=0.0)
    for j in range(rows):
        for k in range(cols):
            a, b = srgb(FLAGS[(rows - 1 - j) * cols + k][0]), srgb(FLAGS[(rows - 1 - j) * cols + k][1])
            cx, hy = x0 + t + k * cw + (cw - t) / 2, h + j * ch + t
            pillow('cloth', cx - (cw - t) / 2 + 0.008, cx + 0.004, ya + 0.02, yb - 0.02, hy, hy + ch - t - 0.012, a, r=0.014, segs=3)
            pillow('cloth', cx - 0.004, cx + (cw - t) / 2 - 0.008, ya + 0.022, yb - 0.026, hy, hy + ch - t - 0.018, b, r=0.014, segs=3)
            lathe('wood', (cx, yb - 0.022, hy + 0.022), FWD, [(0.0, 0.006), (0.012, 0.008), (0.022, 0.005), (0.022, 0.0)], srgb(0xb08a5a))     # its wooden toggle


# ---------------------------------------------------------------------------------------------------------------------
# On the after wall
# ---------------------------------------------------------------------------------------------------------------------
def wallbox(g, tag, x, yard, h):
    """A cabinet on the after wall: a distribution board, the fire detection panel, the first-aid box. A hammer-finish case;
    its door a plate on two hinges with quarter-turn locks, lettered with what is behind it; glands on its top where the
    cables enter from the trunk."""
    if g.get('open'):
        return flag_locker(g, tag, x, yard, h)
    w, H, d = g['w'], g['H'], g['d']
    col = srgb(g['colour'])
    box('case', x - w / 2, x + w / 2, yard + 0.001, yard + d, h, h + H, col, r=0.005)
    with Frame((x, yard + d, h + H / 2), PORT, UP) as F:
        F.box('rubber', (-w / 2 + 0.006, -H / 2 + 0.006, 0.0), (w / 2 - 0.006, H / 2 - 0.006, 0.0015), RUBBER)
        F.block('case', (-w / 2 + 0.008, -H / 2 + 0.008, 0.0), (w / 2 - 0.008, H / 2 - 0.008, 0.006), tint(col, 1.04), r=0.002)
        F.pic(g['tile'], -w / 2 + 0.014, -H / 2 + 0.014, w / 2 - 0.014, H / 2 - 0.014, 0.0065)
        raise_marks(F, g['tile'], -w / 2 + 0.014, -H / 2 + 0.014, w / 2 - 0.014, H / 2 - 0.014, 0.006, skip=('screw',))
        if g.get('handle') or g.get('door'):
            for yy in (-H / 2 + 0.07, H / 2 - 0.07):
                hinge(F, -w / 2 + 0.006, yy - 0.025, yy + 0.025, 0.004)
                quarter_turn(F, w / 2 - 0.024, yy * 0.75, 0.006)
    if g.get('handle'):                                                               # a board: its cables come down the trunk and in through glands on its top
        for k, dx in enumerate((-0.12, -0.04, 0.04, 0.12)):
            if abs(dx) > w / 2 - 0.05:
                continue
            with Frame((x + dx, yard + d * 0.5, h + H), STBD, FWD) as F:
                gland(F, 0.0, 0.0, 0.0, r=0.009, cable=0.0045)
            sweep('rubber', [(x + dx, yard + d * 0.5, h + H + 0.012), (x + dx, yard + d * 0.5, g.get('tail', TRUNK_H + 0.004))], 0.0045, RUBBER)   # into the trunk, or into the board over it


TRUNK_H = 1.86                    # the underside of the cable trunk that runs along the after wall over the boards


def trunk():
    """The cable trunk on the after wall: along over the boards and up to the deckhead, a covered duct with its cover's screws."""
    box('case', 1.16, 2.86, 19.541, 19.625, TRUNK_H, TRUNK_H + 0.07, tint(CASE, 1.15), r=0.003)
    box('case', 1.55, 1.65, 19.541, 19.625, TRUNK_H + 0.07, CEIL + 0.006, tint(CASE, 1.15), r=0.003)          # its riser, up through the deckhead's strip
    for xx in (1.25, 1.75, 2.25, 2.75):
        with Frame((xx, 19.625, TRUNK_H + 0.035), PORT, UP) as F:
            screw(F, 0.0, 0.0, 0.0, r=0.003)
    for hh in (2.0, 2.2):
        with Frame((1.60, 19.625, hh), PORT, UP) as F:
            screw(F, 0.0, 0.0, 0.0, r=0.003)


def dial(g, tag, x, yard, h):
    """A brass bulkhead instrument on the after wall: a flanged case with three screws, its face under glass in a bezel."""
    r = g['r']
    with Frame((x, yard + 0.001, h), PORT, UP) as F:
        F.lathe('brass', (0.0, 0.0, 0.0), [(0.0, r + 0.030), (0.004, r + 0.030), (0.006, r + 0.016), (0.030, r + 0.014), (0.036, r + 0.010), (0.036, r + 0.001)], BRASS)
        for k in range(3):
            a = pi / 2 + k * 2 * pi / 3
            screw(F, (r + 0.023) * cos(a), (r + 0.023) * sin(a), 0.004, r=0.0028, key='brass', colour=tint(BRASS, 0.8))
        F.round_pic(g['tile'], 0.0, 0.0, r + 0.001, 0.0285)
        F.lathe('clear', (0.0, 0.0, 0.0325), [(0.0, 0.0), (0.0, r + 0.002), (0.0015, r + 0.002), (0.0015, 0.0)], (0.9, 0.95, 0.95))


def callpoint(g, tag, x, yard, h):
    """A push button box on the wall: a moulded case, its face lettered, the button itself, and the conduit up from it."""
    col = srgb(g['colour'])
    with Frame((x, yard + 0.001, h), PORT, UP) as F:
        F.pillow('case', (-0.05, -0.05, 0.0), (0.05, 0.05, 0.04), col, r=0.006, segs=3)
        F.pic(g['tile'], -0.044, -0.044, 0.044, 0.044, 0.0404)
        F.lathe('plastic', (0.0, -0.012, 0.040), [(0.0, 0.014), (0.006, 0.014), (0.009, 0.011), (0.009, 0.0)], tint(col, 0.75) if g['tile'] != 'callpoint' else srgb(0x202326))
        corner_screws(F, -0.05, -0.05, 0.05, 0.05, 0.04, inset=0.008, r=0.002)


def extinguisher(g, tag, x, yard, h):
    """A portable fire extinguisher in its bracket: the cylinder with its rounded shoulder and foot ring, the valve with its
    handle, lever and pressure gauge, the hose (or the CO2 horn), a label band; held by a strap on a wall bracket."""
    col = srgb(g['colour'])
    port = g.get('wall') == 'port'
    if port:
        x = X_IN - 0.095
    lathe('paint', (x, yard, h), UP, [(0.0, 0.0), (0.0, 0.070), (0.012, 0.075), (0.43, 0.075), (0.47, 0.060), (0.50, 0.032), (0.52, 0.026)], col)
    lathe('paint', (x, yard, h + 0.20), UP, [(0.0, 0.0758), (0.13, 0.0758)], srgb(0xf2f0e8))                           # the label band
    lathe('brass', (x, yard, h + 0.52), UP, [(0.0, 0.026), (0.03, 0.022), (0.05, 0.022), (0.05, 0.0)], BRASS)       # the valve
    box('dark', x - 0.012, x + 0.012, yard - 0.02, yard + 0.11, h + 0.57, h + 0.585, BLACK, r=0.003)                # the carrying handle
    box('dark', x - 0.010, x + 0.010, yard - 0.01, yard + 0.12, h + 0.595, h + 0.607, srgb(0x8a1f1a), r=0.003)      # the lever over it
    box('dark', x - 0.008, x + 0.008, yard - 0.012, yard + 0.012, h + 0.583, h + 0.597, BLACK, r=0.002)             # and its pivot
    lathe('steel', (x - 0.022, yard, h + 0.545), (-1.0, 0.0, 0.0), [(0.0, 0.006), (0.010, 0.006), (0.010, 0.016), (0.018, 0.016), (0.018, 0.0)], STAINLESS)   # the gauge
    out = (0.04, 0.03) if not port else (-0.05, 0.03)
    if g.get('horn'):
        sweep('rubber', [(x, yard, h + 0.545), (x + 0.07, yard + 0.05, h + 0.52), (x + 0.10, yard + 0.06, h + 0.40)], 0.010, RUBBER)
        lathe('dark', (x + 0.10, yard + 0.06, h + 0.40), (0.05, -0.99, 0.05), [(0.0, 0.014), (0.05, 0.018), (0.30, 0.050), (0.30, 0.046)], BLACK)
    else:
        sweep('rubber', [(x, yard, h + 0.545), (x + out[0] * 1.6, yard + out[1] * 1.6, h + 0.50), (x + out[0] * 1.9, yard + out[1] * 1.7, h + 0.26)], 0.008, RUBBER)
        lathe('dark', (x + out[0] * 1.9, yard + out[1] * 1.7, h + 0.26), (0.0, -1.0, 0.0), [(0.0, 0.010), (0.05, 0.008), (0.06, 0.004), (0.06, 0.0)], BLACK)
    # the bracket: a back plate on the wall, a strap round the cylinder with its toggle clip, a cup under the foot
    if port:
        box('steel', X_IN - 0.016, X_IN, yard - 0.03, yard + 0.03, h - 0.02, h + 0.40, STAINLESS, r=0.002)
        box('steel', x - 0.06, X_IN, yard - 0.05, yard + 0.05, h - 0.012, h, STAINLESS, r=0.002)
    else:
        box('steel', x - 0.03, x + 0.03, 19.541, yard - 0.07, h + 0.02, h + 0.40, STAINLESS, r=0.002)
        box('steel', x - 0.05, x + 0.05, 19.541, yard + 0.05, h - 0.012, h, STAINLESS, r=0.002)
    part('steel').ring(P(x, yard, h + 0.32), UP, 0.0775, 0.0045, STAINLESS)
    box('steel', x - 0.012, x + 0.012, yard + 0.076, yard + 0.092, h + 0.305, h + 0.335, STAINLESS, r=0.003)


def sart(g, tag, x, yard, h):
    """A radar transponder in its wall bracket: an orange cylinder with its switch ring, in two spring clips on a back plate."""
    side = g['side']
    xw = side * X_IN
    box('steel', xw, xw - side * 0.012, yard - 0.05, yard + 0.05, h - 0.02, h + 0.34, STAINLESS, r=0.002)
    cx = xw - side * 0.056
    lathe('plastic', (cx, yard, h), UP, [(0.0, 0.0), (0.0, 0.034), (0.008, 0.038), (0.25, 0.038), (0.26, 0.030), (0.31, 0.024), (0.325, 0.014), (0.325, 0.0)], ORANGE)
    lathe('plastic', (cx, yard, h + 0.225), UP, [(0.0, 0.0395), (0.02, 0.0395)], srgb(0x202326))                    # the switch ring
    lathe('plastic', (cx, yard, h + 0.10), UP, [(0.0, 0.0388), (0.07, 0.0388)], srgb(0xf2f0e8))                     # its instructions
    for hh in (h + 0.05, h + 0.20):
        part('steel').ring(P(cx, yard, hh), UP, 0.040, 0.0035, STAINLESS, sweep=(radians(40), radians(320)) if side < 0 else (radians(220), radians(500)))
        box('steel', xw - side * 0.020, xw, yard - 0.012, yard + 0.012, hh - 0.006, hh + 0.006, STAINLESS, r=0.001)


def handhelds(g, tag, x, yard, h):
    """Three portable VHF sets in their charger rack: the rack on the wall, a cup for each set, and each set with its aerial,
    its knobs, its speaker grille and its key."""
    box('anod', x - 0.14, x + 0.14, yard + 0.001, yard + 0.065, h, h + 0.075, ANOD, r=0.004)
    with Frame((x, yard + 0.065, h + 0.03), PORT, UP) as F:
        lamp(F, 0.12, 0.0, 0.0, 0.003, srgb(0x3cf058))
        nameplate(F, 'GMDSS  VHF', -0.03, -0.012, 0.0, height=0.006, screws=False)
    for k in range(3):
        xx = x - 0.09 + k * 0.09
        col = ORANGE if k == 1 else srgb(0xe0c020)
        pillow('plastic', xx - 0.03, xx + 0.03, yard + 0.012, yard + 0.052, h + 0.03, h + 0.175, col, r=0.008, segs=3)
        box('dark', xx - 0.022, xx + 0.022, yard + 0.0515, yard + 0.0535, h + 0.10, h + 0.155, srgb(0x16181a), r=0.0)      # its grille
        for j in range(5):
            box('plastic', xx - 0.018, xx + 0.018, yard + 0.0535, yard + 0.0545, h + 0.106 + j * 0.010, h + 0.110 + j * 0.010, col, r=0.0)
        box('rubber', xx + 0.030, xx + 0.034, yard + 0.02, yard + 0.044, h + 0.09, h + 0.14, RUBBER, r=0.0)             # its key
        lathe('rubber', (xx - 0.015, yard + 0.03, h + 0.175), UP, [(0.0, 0.007), (0.012, 0.007), (0.02, 0.004), (0.10, 0.003), (0.10, 0.0)], RUBBER)     # its aerial
        lathe('plastic', (xx + 0.014, yard + 0.03, h + 0.175), UP, [(0.0, 0.007), (0.012, 0.007), (0.012, 0.0)], srgb(0x16181a))                          # its knob


def aldis(g, tag, x, yard, h):
    """The daylight signalling lamp on its hook beside the starboard door, with its socket: a lamp body with its lens, the
    sighting tube on top, the pistol grip with its trigger, and the lead coiled to the socket."""
    xw = -X_IN
    box('steel', xw, xw + 0.012, yard - 0.04, yard + 0.04, h + 0.02, h + 0.30, STAINLESS, r=0.002)
    sweep('steel', [(xw + 0.012, yard, h + 0.26), (xw + 0.07, yard, h + 0.26), (xw + 0.07, yard, h + 0.285)], 0.006, STAINLESS)
    c = (xw + 0.07, yard - 0.09, h + 0.18)
    lathe('paint', c, FWD, [(0.0, 0.0), (0.0, 0.045), (0.02, 0.062), (0.15, 0.066), (0.16, 0.060)], srgb(0x4a5456))
    lathe('lens', (c[0], yard + 0.062, c[2]), FWD, [(0.0, 0.0), (0.0, 0.060), (0.004, 0.058), (0.008, 0.0)], srgb(0xdfe6e1))
    tube('steel', (c[0], yard - 0.08, c[2] + 0.075), (c[0], yard + 0.06, c[2] + 0.075), 0.008, srgb(0x2a2d30))       # the sight
    for yd in (yard - 0.06, yard + 0.04):
        box('steel', c[0] - 0.004, c[0] + 0.004, yd - 0.004, yd + 0.004, c[2] + 0.06, c[2] + 0.07, srgb(0x2a2d30), r=0.0)
    box('plastic', c[0] - 0.014, c[0] + 0.014, yard - 0.05, yard - 0.015, h + 0.015, c[2] - 0.055, BLACK, r=0.006)   # the grip
    box('steel', c[0] - 0.004, c[0] + 0.004, yard - 0.012, yard - 0.004, h + 0.07, h + 0.105, STAINLESS, r=0.0015)    # the trigger
    with Frame((xw, yard, h - 0.10), AFTWARD, UP) as F:                                                               # its socket, on the wall below (it looks to port)
        F.pillow('case', (-0.035, -0.04, 0.0), (0.035, 0.04, 0.03), CASE, r=0.006, segs=3)
        F.lathe('dark', (0.0, 0.0, 0.03), [(0.0, 0.016), (0.012, 0.016), (0.012, 0.012)], srgb(0x202326))
        nameplate(F, '24 V', 0.0, -0.028, 0.03, height=0.005, screws=False)
    sweep('rubber', [(c[0], yard - 0.032, h + 0.015), (c[0], yard - 0.03, h - 0.03), (xw + 0.045, yard, h - 0.07), (xw + 0.042, yard, h - 0.10)], 0.004, RUBBER)


def stairwell(g, tag, x, yard, h):
    """
    The crew stair's head: a rail along its inboard side, and across the top, where one comes up out of it, a self-closing
    gate of two bars. The first drawing had those bars fixed: nobody could have come up the stair (found when the stairs
    were walked, checks/stairs.cjs). The gate hangs on the outboard post and opens forward, away from the well.
    """
    x = -2.07
    rail = STAINLESS
    for yd in (19.60, 20.15):
        tube('steel', (x, yd, 0.012), (x, yd, 1.0), 0.016, rail, 8)
        lathe('steel', (x, yd, 0.012), UP, [(0.0, 0.045), (0.006, 0.045), (0.012, 0.022), (0.03, 0.017)], rail)        # its deck flange
    for hh in (0.5, 1.0):
        tube('steel', (x, 19.56, hh), (x, 20.16, hh), 0.014, rail, 8)
    part('steel').ball(P(x, 20.16, 1.0), 0.016, rail)
    tube('steel', (-2.88, 20.16, 0.012), (-2.88, 20.16, 1.0), 0.016, rail, 8)
    lathe('steel', (-2.88, 20.16, 0.012), UP, [(0.0, 0.040), (0.006, 0.040), (0.012, 0.022), (0.03, 0.017)], rail)
    mv = moving('Wheelhouse, crew stair gate', 'gate-crew-stair', steel='Stainless', grip='Plastic')
    for hh in (0.5, 1.0):
        tube(mv['steel'], (-2.86, 20.16, hh), (x - 0.03, 20.16, hh), 0.014, rail, 8)
    tube(mv['steel'], (x - 0.03, 20.16, 0.5), (x - 0.03, 20.16, 1.0), 0.012, rail, 8)                 # its closing stile
    tube(mv['steel'], (-2.86, 20.16, 0.5), (-2.86, 20.16, 1.0), 0.012, rail, 8)                      # and the hinge stile
    box(mv['grip'], x - 0.20, x - 0.03, 20.150, 20.170, 0.70, 0.80, srgb(0xe2b93b))                  # a yellow plate on the closing stile: push
    MOTIONS.append(dict(id='gate-crew-stair', name='Gate at the head of the crew stair', pivot=[-2.86, 0.0, BP.Z(20.16)], ratio=-1.0, max=95,
                        at=[-2.50, DECK, BP.Z(20.16)], normal=[0, 0, 1], reach=1.3))
    box('paint', -2.90, -2.14, 19.54, 19.56, 1.52, 1.64, srgb(0x1e8246))                     # over the opening, on the wall: the way out
    pic((-2.52, 19.56, 1.58), FWD, UP, 0.30, 0.11, 'exit')


def ac_indoor(g, tag, x, yard, h):
    """The air conditioner's room unit, high on the after wall: a moulded case, the intake grille along its top, the outlet's
    louvre along its foot, its lamp."""
    w, H, d = g['w'], g['H'], g['d']
    pillow('plastic', x - w / 2, x + w / 2, yard + 0.001, yard + d, h, h + H, WHITE, r=0.02, segs=3)
    box('dark', x - w / 2 + 0.04, x + w / 2 - 0.04, yard + d - 0.05, yard + d + 0.002, h + 0.018, h + 0.05, srgb(0x4a5254), r=0.0)
    box('plastic', x - w / 2 + 0.045, x + w / 2 - 0.045, yard + d - 0.01, yard + d + 0.012, h + 0.03, h + 0.036, tint(WHITE, 0.9), r=0.0)       # the outlet's flap
    for k in range(6):
        box('plastic', x - w / 2 + 0.03, x + w / 2 - 0.03, yard + d - 0.001, yard + d + 0.003, h + 0.10 + k * 0.026, h + 0.105 + k * 0.026, tint(WHITE, 0.85), r=0.0)
    with Frame((x + w / 2 - 0.06, yard + d, h + 0.075), PORT, UP) as F:
        lamp(F, 0.0, 0.0, 0.0, 0.004, srgb(0x3cf058), bezel=False)


def hooks(g, tag, x, yard, h):
    """A hook rail under the after port window: a board of light wood on the lining with four brass hooks, for oilskins and
    the watch's lifejackets."""
    l = g['l']
    with Frame((X_IN, yard, h), FWD, UP) as F:                                          # on a face that looks to starboard
        F.block('lwood', (-l / 2, -0.035, 0.0), (l / 2, 0.035, 0.016), WOODL, r=0.004)
        n = 4
        for k in range(n):
            cx = -l / 2 + (k + 0.5) * l / n
            F.lathe('brass', (cx, 0.0, 0.016), [(0.0, 0.016), (0.003, 0.016), (0.005, 0.008)], BRASS)
            F.sweep('brass', [(cx, 0.0, 0.019), (cx, 0.0, 0.045), (cx, -0.02, 0.062), (cx, -0.045, 0.060), (cx, -0.055, 0.045), (cx, -0.050, 0.030)], 0.0042, BRASS)
            F.ball('brass', (cx, -0.050, 0.030), 0.0065, BRASS)
            for sy in (-1, 1):
                screw(F, cx + sy * 0.0, sy * 0.011, 0.019, r=0.0016, key='brass', colour=tint(BRASS, 0.8))
        for sx in (-1, 1):
            screw(F, sx * (l / 2 - 0.02), 0.022, 0.016, r=0.0024, key='brass', colour=BRASS)
