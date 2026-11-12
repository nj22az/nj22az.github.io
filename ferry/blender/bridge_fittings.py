"""
What is fitted to the wheelhouse's deckhead, windows and linings: the overhead consoles and the round instruments hung
between them, the downlights, loudspeaker, sprinklers and smoke detector, the grab rails; at the windows the sun blinds,
the wipers with their motors, the two clear-view screens, the wash; under the sills the handrail on its brackets, the
sockets and the junction box of the heated glass.

The owner's photographs of a ferry's wheelhouse (reference F3, F4): "round clear-view screens (a spinning glass disc in a
ring with its motor housing at the centre) in two of the front windows; wipers outside; a continuous handrail under the
sills on brackets; sockets and a small recessed box in the lining below the sill"; "instruments hung under [the deckhead]
over the windows (repeaters, a clock), small round lights, a sprinkler head, a loudspeaker, a smoke detector".
"""
from bridge_kit import *
import bridge_kit as K

# ---------------------------------------------------------------------------------------------------------------------
# Overhead: two consoles under the deckhead, either side of the instruments that hang between them
# ---------------------------------------------------------------------------------------------------------------------
OVH_UP = Vector((0.0, 0.24, -0.14)).normalized()          # up the consoles' face, from its lower edge to the deckhead
OVH_N = Vector((0.0, -0.14, -0.24)).normalized()          # and the way the face looks: down and aft
OVH_MID = (22.43, 2.18)                                    # the middle of the face: (metres from the transom, over the deck)
OVH_BOXES = ((0.66, 1.50), (-1.50, -0.60))
OVH_HALF = hypot(0.14, 0.24) / 2


def ovh_frame(x, lift=0.0):
    return Frame(tuple(Vector(P(x, *OVH_MID)) + OVH_N * lift), STBD, tuple(OVH_UP), local=True)


def overhead(g, tag, x, yard, h):
    """
    The overhead consoles: two sloped boxes under the deckhead, their faces looking aft and down, a dark field on each. They
    hang wholly above the windows' head: their lowest edge, 2.06 m over the deck, is over the line from a tall helmsman's eye
    to the top of the glass, so they hide nothing that the glass would show (the first hung to 1.80 m, that eye's own height).
    """
    prof = [(22.36, CEIL), (22.68, CEIL), (22.68, h + 0.06), (22.50, h)]
    for x0, x1 in OVH_BOXES:
        prism('console', x0, x1, prof, BLUEC)
        with ovh_frame((x0 + x1) / 2) as F:
            F.block('desk', (-(x1 - x0) / 2 + 0.02, -OVH_HALF + 0.014, 0.0), ((x1 - x0) / 2 - 0.02, OVH_HALF - 0.012, 0.005), DESK, r=0.002)
        # held to the deckhead: a flange along its after edge, screwed up into the strips
        box('steel', x0 + 0.02, x1 - 0.02, 22.325, 22.36, CEIL - 0.004, CEIL, STAINLESS, r=0.0)
        n = int((x1 - x0) / 0.2)
        for k in range(n):
            with Frame((x0 + 0.06 + k * (x1 - x0 - 0.12) / max(n - 1, 1), 22.342, CEIL - 0.004), PORT, FWD) as F:
                screw(F, 0.0, 0.0, 0.0, r=0.003)


def ovh_dial(g, tag, x, yard, h):
    """A round instrument hung under the deckhead on a trunnion: a black case with a brass bezel, its face under glass; a
    yoke of flat bar down from a deckhead plate, with a clamping knob at each side; its cable up through a gland."""
    r = g['r']
    with ovh_frame(x) as F:
        F.lathe('anod', (0.0, 0.0, -0.066), [(0.0, 0.0), (0.0, r + 0.004), (0.052, r + 0.006), (0.054, r + 0.012)], ANOD)
        F.lathe('brass', (0.0, 0.0, -0.066), [(0.052, r + 0.006), (0.054, r + 0.018), (0.066, r + 0.018), (0.071, r + 0.011), (0.071, r + 0.001)], BRASS)
        F.round_pic(g['tile'], 0.0, 0.0, r + 0.002, -0.004)
        F.lathe('clear', (0.0, 0.0, 0.0005), [(0.0, 0.0), (0.0, r + 0.002), (0.0015, r + 0.002), (0.0015, 0.0)], (0.9, 0.95, 0.95))
    c = unP(Vector(P(x, *OVH_MID)) - OVH_N * 0.034)                                  # the case's middle, in the bridge's measures
    for sx in (-1, 1):
        box('steel', c[0] + sx * (r + 0.019), c[0] + sx * (r + 0.023), c[1] - 0.012, c[1] + 0.012, c[2] - 0.014, CEIL - 0.004, STAINLESS, r=0.0)
        lathe('steel', (c[0] + sx * (r + 0.004), c[1], c[2]), (sx, 0, 0), [(0.0, 0.007), (0.019, 0.007), (0.019, 0.013), (0.028, 0.013), (0.030, 0.009), (0.030, 0.0)], STAINLESS)
    box('steel', c[0] - r - 0.035, c[0] + r + 0.035, c[1] - 0.022, c[1] + 0.022, CEIL - 0.004, CEIL, STAINLESS, r=0.0)
    for sx in (-1, 1):
        with Frame((c[0] + sx * (r + 0.006), c[1], CEIL - 0.004), PORT, FWD) as F:
            screw(F, 0.0, 0.0, 0.0, r=0.003)
    back = unP(Vector(P(x, *OVH_MID)) - OVH_N * 0.064)
    sweep('rubber', [back, (back[0], back[1] + 0.02, back[2] + 0.03), (back[0], back[1] + 0.02, CEIL - 0.008)], 0.0035, RUBBER)
    with Frame((back[0], back[1] + 0.02, CEIL), PORT, FWD) as F:
        gland(F, 0.0, 0.0, 0.0, r=0.007, cable=0.0035)


def ovh_screen(g, tag, x, yard, h):
    """A display in an overhead console's face: the camera monitor."""
    with ovh_frame(x, lift=0.005) as F:
        K.display(F, g['tile'], g['w'] + 0.03, min(g['H'] + 0.04, 2 * OVH_HALF - 0.03), keys=4, dims=60.0)


def ovh_set(g, tag, x, yard, h):
    """A radio set in an overhead console's face: its plate with every key as a shape, and (the distress set) its handset in
    a cradle beside it, on a coiled cord."""
    w, H = g['w'], g['H']
    with ovh_frame(x, lift=0.005) as F:
        panel(F, g['tile'], -w / 2, -H / 2, w / 2, H / 2, thick=0.010, margin=0.004)
        if g.get('handset'):
            import bridge_console
            bridge_console.handset(F, g['handset'] * (w / 2 + 0.06), 0.0, 0.0, title='VHF handset', mover='handset-vhf', fitting=tag)


def periscope(g, tag, x, yard, h):
    """The magnetic compass read from the helm: a tube down from the binnacle above, a mirror box, a glass. The box hangs
    above the line from a tall helmsman's eye to the top of the forward glass: it is glanced up at, not looked round."""
    box('anod', -0.11, 0.11, yard - 0.10, yard + 0.10, CEIL - 0.025, CEIL, ANOD, r=0.004)
    for sx in (-1, 1):
        for sy in (-1, 1):
            with Frame((sx * 0.09, yard + sy * 0.08, CEIL - 0.025), PORT, FWD) as F:
                screw(F, 0.0, 0.0, 0.0, r=0.003)
    tube('steel', (0.0, yard, CEIL - 0.025), (0.0, yard, h + 0.11), 0.025, STAINLESS, 12)
    box('anod', -0.08, 0.08, yard - 0.08, yard + 0.08, h, h + 0.11, ANOD, r=0.006)
    lathe('brass', (0.0, yard - 0.08, h + 0.055), AFTWARD, [(0.0, 0.040), (0.006, 0.040), (0.010, 0.034), (0.010, 0.030)], BRASS)
    lathe('lens', (0.0, yard - 0.082, h + 0.055), AFTWARD, [(0.0, 0.0), (0.0, 0.031), (0.004, 0.029), (0.006, 0.0)], srgb(0xdfe6e1))
    with Frame((0.07, yard - 0.08, h + 0.02), STBD, UP) as F:                          # its dimmer
        knob(F, 0.0, 0.0, 0.0, 0.008, h=0.010)


# ---------------------------------------------------------------------------------------------------------------------
# In the deckhead
# ---------------------------------------------------------------------------------------------------------------------
def ceil(g, tag, x, yard, h):
    kind = g['type']
    with Frame((x, yard, CEIL), PORT, FWD) as F:                                      # looked up at: z is down, out of the deckhead
        if kind == 'light':
            # a round downlight: a white trim ring in the strips, the lamp's lit glass
            r = g.get('r', 0.055)
            F.lathe('paint', (0.0, 0.0, 0.0), [(0.0, r + 0.024), (0.004, r + 0.024), (0.008, r + 0.010), (0.008, r - 0.002)], WHITE)
            F.lathe('lit', (0.0, 0.0, 0.0), [(0.0, r), (0.004, r), (0.005, r * 0.9), (0.005, 0.0)], WHITE_LAMP)
        elif kind == 'red':
            # a night light: a small red glass in a black ring
            r = g['r']
            F.lathe('anod', (0.0, 0.0, 0.0), [(0.0, r + 0.016), (0.006, r + 0.016), (0.010, r + 0.004), (0.010, r - 0.002)], ANOD)
            F.lathe('lens', (0.0, 0.0, 0.0), [(0.0, 0.0), (0.0, r * 0.8), (0.006, r * 0.8), (0.0105, r * 0.4), (0.0115, 0.0)], tint(RED, 0.55))
            F.into = dict(lit_red=shown('night-lights-lit', 'dimmer-console', 'Night lights, lit', 'Lit night red'))
            F.lathe('lit_red', (0.0, 0.0, 0.0008), [(0.0, 0.0), (0.0, r + 0.001), (0.0085, r + 0.001), (0.0145, r * 0.62), (0.0165, 0.0)], RED)
            F.into = None
        elif kind == 'speaker':
            # a loudspeaker: a white ring, a grille of rings over the dark of the cone, three screws
            r = g['r']
            F.lathe('paint', (0.0, 0.0, 0.0), [(0.0, r + 0.018), (0.005, r + 0.018), (0.010, r + 0.004), (0.010, r - 0.004)], WHITE)
            F.lathe('dark', (0.0, 0.0, 0.0), [(0.0, r - 0.002), (0.003, r - 0.002), (0.003, 0.0)], srgb(0x202326))
            for k in range(1, 6):
                F.ring('paint', (0.0, 0.0, 0.006), r * k / 6.2, 0.0022, tint(WHITE, 0.92))
            for k in range(3):
                a = k * 2 * pi / 3 + 0.5
                F.box('paint', (-0.003, 0.0, 0.004), (0.003, r - 0.004, 0.0075), tint(WHITE, 0.92)) if k == 0 else None
                screw(F, (r + 0.011) * cos(a), (r + 0.011) * sin(a), 0.006, r=0.0026)
        elif kind == 'detector':
            # a smoke detector: its base, its body with the smoke's slots, its lamp
            r = g['r']
            F.lathe('plastic', (0.0, 0.0, 0.0), [(0.0, r), (0.016, r), (0.020, r * 0.86), (0.036, r * 0.80), (0.044, r * 0.5), (0.046, 0.0)], WHITE)
            for k in range(12):
                a = k * pi / 6
                F.box('dark', (r * 0.83 * cos(a) - 0.002, r * 0.83 * sin(a) - 0.002, 0.0225), (r * 0.83 * cos(a) + 0.002, r * 0.83 * sin(a) + 0.002, 0.034), srgb(0x2a2d30))
            lamp(F, r * 0.55, 0.0, 0.040, 0.003, RED, lit=False, bezel=False)
        elif kind == 'emergency':
            w, l = g['w'], g['l']
            F.pillow('paint', (-w / 2, -l / 2, 0.0), (w / 2, l / 2, 0.04), WHITE, r=0.008, segs=3)
            F.pillow('lens', (-w / 2 + 0.015, -l / 2 + 0.015, 0.034), (w / 2 - 0.015, l / 2 - 0.015, 0.048), WHITE_LAMP, r=0.006, segs=3)
            lamp(F, w / 2 - 0.02, 0.0, 0.047, 0.003, srgb(0x3cf058), bezel=False)
        elif kind == 'transit':
            # a cable transit: a steel frame in the deckhead, packed with blocks round each cable
            w, l = g['w'], g['l']
            F.block('steel', (-w / 2, -l / 2, 0.0), (w / 2, l / 2, 0.02), GREY, r=0.002)
            for i in range(4):
                for j in range(2):
                    F.block('rubber', (-0.098 + i * 0.05, -0.055 + j * 0.06, 0.02), (-0.052 + i * 0.05, -0.005 + j * 0.06, 0.026), RUBBER, r=0.0)
                    F.tube('rubber', (-0.075 + i * 0.05, -0.03 + j * 0.06, 0.026), (-0.075 + i * 0.05, -0.03 + j * 0.06, 0.04), 0.009, srgb(0x202326))
            corner_screws(F, -w / 2, -l / 2, w / 2, l / 2, 0.02, inset=0.008, r=0.003)
        elif kind == 'sprinkler':
            # a pendent sprinkler head: an escutcheon, the body, the frame's two arms, the glass bulb, the deflector
            F.lathe('chrome', (0.0, 0.0, 0.0), [(0.0, 0.032), (0.003, 0.032), (0.006, 0.014), (0.022, 0.011), (0.022, 0.0)], CHROME)
            for sx in (-1, 1):
                F.sweep('chrome', [(sx * 0.009, 0.0, 0.020), (sx * 0.013, 0.0, 0.034), (sx * 0.005, 0.0, 0.048)], 0.0022, CHROME)
            F.lathe('lens', (0.0, 0.0, 0.022), [(0.0, 0.002), (0.004, 0.0038), (0.020, 0.0038), (0.024, 0.002), (0.024, 0.0)], srgb(0xc2281f))
            F.lathe('chrome', (0.0, 0.0, 0.046), [(0.0, 0.006), (0.004, 0.006), (0.005, 0.019), (0.0065, 0.019), (0.0065, 0.0)], CHROME)


def grabrails(g, tag, x, yard, h):
    """An overhead grab rail: stainless tube on three stanchions from the deckhead, each on a flange."""
    sx = g['side']
    tube('steel', (sx * 0.75, 20.30, h), (sx * 0.75, 22.05, h), 0.014, STAINLESS, 10)
    for yd in (20.30, 22.05):
        part('steel').ball(P(sx * 0.75, yd, h), 0.014, STAINLESS)
    for yd in (20.36, 21.18, 21.99):
        tube('steel', (sx * 0.75, yd, h), (sx * 0.75, yd, CEIL), 0.008, STAINLESS, 6)
        lathe('steel', (sx * 0.75, yd, CEIL), (0, -1, 0), [(0.0, 0.026), (0.004, 0.026), (0.010, 0.012), (0.02, 0.009)], STAINLESS)


def whistle_valve(g, tag, x, yard, h):
    """The whistle valve under the deckhead, and its pull over the helm: a brass valve with its solenoid, the air pipe each
    way, a lever; a wire from the lever to a sheave, and down from the sheave the pull with its wooden toggle. The pull is
    drawn down by a tap, and the lever goes with it."""
    box('wood', x - 0.055, x + 0.055, yard - 0.055, yard + 0.055, CEIL - 0.014, CEIL, WOOD, r=0.003)             # the hardwood pad it is screwed to
    lathe('brass', (x, yard, CEIL - 0.014), (0, -1, 0), [(0.0, 0.030), (0.008, 0.030), (0.014, 0.022), (0.06, 0.022), (0.07, 0.030), (0.10, 0.030), (0.11, 0.020), (0.11, 0.0)], BRASS)
    for sy in (-1, 1):                                                                # the air pipe, either way
        tube('brass', (x, yard + sy * 0.03, CEIL - 0.09), (x, yard + sy * 0.10, CEIL - 0.09), 0.011, BRASS)
        sweep('brass', [(x, yard + sy * 0.10, CEIL - 0.09), (x, yard + sy * 0.12, CEIL - 0.085), (x, yard + sy * 0.125, CEIL - 0.06), (x, yard + sy * 0.125, CEIL)], 0.011, BRASS)
    lathe('dark', (x + 0.03, yard, CEIL - 0.09), (1, 0, 0), [(0.0, 0.020), (0.05, 0.020), (0.055, 0.012), (0.055, 0.0)], srgb(0x202326))     # the solenoid
    M = moving('Whistle pull', 'whistle-pull', wood='Varnished wood', steel='Stainless', brass='Bronze')
    yp = yard + 0.30                                                                   # the pull hangs over the helm
    # the wire from the lever to the sheave, through an eye
    sweep('steel', [(x - 0.03, yard + 0.01, CEIL - 0.045), (x - 0.03, yp, CEIL - 0.045)], 0.0015, STAINLESS)
    box('steel', x - 0.045, x - 0.015, yp - 0.02, yp + 0.02, CEIL - 0.095, CEIL, STAINLESS, r=0.003)                 # the sheave's housing
    lathe('steel', (x - 0.03, yard + 0.16, CEIL), (0, -1, 0), [(0.0, 0.012), (0.003, 0.012), (0.003, 0.003), (0.040, 0.003)], STAINLESS)   # the eye's stem
    part('steel').ring(P(x - 0.03, yard + 0.16, CEIL - 0.045), (0, 0, 1), 0.005, 0.0015, STAINLESS)
    # what is pulled: the wire down from the sheave, the toggle
    sweep(M['steel'], [(x - 0.03, yp, CEIL - 0.02), (x - 0.03, yp, h - 0.118)], 0.0015, STAINLESS)
    lathe(M['wood'], (x - 0.085, yp, h - 0.13), (1, 0, 0), [(0.0, 0.0), (0.0, 0.009), (0.02, 0.013), (0.09, 0.013), (0.11, 0.009), (0.11, 0.0)], WOOD)
    lathe(M['brass'], (x - 0.034, yp, h - 0.13), (1, 0, 0), [(0.0, 0.0), (0.0, 0.0135), (0.008, 0.0135), (0.008, 0.0)], BRASS)
    MOTIONS.append(dict(id='whistle-pull', name='Whistle pull', kind='slide', pivot=list(P(x - 0.03, yp, h - 0.13)), axis=[0, -1, 0], ratio=0.01, max=7.0,
                        at=list(P(x - 0.03, yp, h - 0.13)), auto='tap', reach=2.2, rest='let go', above='pulled: one blast', unit='cm', fitting=tag))
    # the valve's lever, which the wire draws over
    V = moving('Whistle valve, lever', 'whistle-lever', brass='Bronze')
    box(V['brass'], x - 0.036, x - 0.024, yard - 0.008, yard + 0.008, CEIL - 0.10, CEIL - 0.04, BRASS, r=0.002)
    LEVERS.append(dict(id='whistle-lever', input='whistle-pull', axis=[1, 0, 0], pivot=list(P(x - 0.03, yard, CEIL - 0.09)), ratio=-3.0))


# ---------------------------------------------------------------------------------------------------------------------
# At the windows
# ---------------------------------------------------------------------------------------------------------------------
def _rot(v, n, a):
    """A direction turned by the angle a about the unit direction n."""
    v, n = Vector(v), Vector(n)
    return v * cos(a) + n.cross(v) * sin(a) + n * n.dot(v) * (1 - cos(a))


BLIND_RUN = 1.03                    # how far a blind is drawn down: to the wooden rail under the glass


def blinds(g, tag, x, yard, h):
    """A roller sun blind at the head of each forward window: a cassette on the head lining with its end caps; the tinted
    film; the bottom bar with its pull; a guide wire down each side to the sill. A tap draws one down, and lets it up again."""
    top = FRONT_IN + fwd(HEAD)                                                         # the head lining's face
    for k, (x0, x1) in enumerate(PANES):
        a, b = x0 + 0.012, x1 - 0.012
        box('paint', a, b, top - 0.058, top - 0.001, HEAD + 0.006, HEAD + 0.062, tint(LINING, 0.94), r=0.006)
        for xe in (a, b):
            box('plastic', xe - 0.004, xe + 0.004, top - 0.060, top - 0.001, HEAD + 0.004, HEAD + 0.064, srgb(0xcfcdc4), r=0.002)
        with Frame(((x0 + x1) / 2, FRONT_IN - 0.035 + fwd(HEAD), HEAD), STBD, RAKE_UP) as F:      # the blind's own plane, 35 mm inboard of the lining
            half = (b - a) / 2
            for sx in (-1, 1):                                                         # the guide wires, from the cassette to an eye on the lower rail
                F.sweep('steel', [(sx * (half - 0.012), 0.008, 0.0), (sx * (half - 0.012), -BLIND_RUN - 0.03, 0.0)], 0.0011, STAINLESS)
                F.lathe('steel', (sx * (half - 0.012), -BLIND_RUN - 0.03, -0.023), [(0.0, 0.006), (0.003, 0.006), (0.003, 0.0025), (0.022, 0.0025)], STAINLESS)
            mover = f'blind-{k + 1}'
            M = moving(f'Sun blind {k + 1}', mover, bar='Stainless', pull='Plastic')
            F.into = dict(steel=M['bar'], plastic=M['pull'])
            F.tube('steel', (-half + 0.02, -0.014, 0.0), (half - 0.02, -0.014, 0.0), 0.007, STAINLESS)
            F.sweep('plastic', [(0.0, -0.020, 0.0), (0.0, -0.060, 0.004)], 0.0012, srgb(0xdad6c6))
            F.lathe('plastic', (0.0, -0.058, 0.004), [(0.0, 0.0), (0.0, 0.005), (0.012, 0.008), (0.024, 0.005), (0.024, 0.0)], srgb(0xdad6c6), axis=(0.0, -1.0, 0.0))
            F.into = None
            film = moving(f'Sun blind {k + 1}, film', mover + '-film', film='Blind film')
            F.into = dict(film=film['film'])
            F.quad('film', -half + 0.024, -0.012, half - 0.024, 0.006, 0.0, srgb(0x26343a))
            F.into = None
            down = [float(v) for v in F.way((0.0, -1.0, 0.0))]
            MOTIONS.append(dict(id=mover, name=f'Sun blind, forward window {k + 1}', kind='slide', pivot=[float(v) for v in F.at((0.0, -0.014, 0.0))], axis=down, ratio=0.01,
                                max=round(BLIND_RUN * 100), at=[float(v) for v in F.at((0.0, -0.3, 0.0))], auto='tap', reach=2.4, rest='rolled up', above='drawn down', unit='cm', fitting=tag))
            # the film is drawn out of the cassette: it grows downward from its upper edge as the bar goes down
            LEVERS.append(dict(id=mover + '-film', input=mover, kind='stretch', axis=down, pivot=[float(v) for v in F.at((0.0, 0.006, 0.0))], ratio=0.01 / 0.018))


def mullion_ducts(g, tag, x, yard, h):
    """A covered cable duct down a forward mullion, from the trays over the deckhead into the console: its cover's screws."""
    sx = g['side']
    x0, x1 = sx * MULLION_X - 0.035, sx * MULLION_X + 0.035
    prism('paint', x0, x1, [(FRONT_IN - 0.03 + fwd(1.20), 1.20), (FRONT_IN + fwd(1.20), 1.20), (FRONT_IN + fwd(HEAD), HEAD), (FRONT_IN - 0.03 + fwd(HEAD), HEAD)], tint(LINING, 0.93))
    box('paint', x0, x1, FRONT_IN + fwd(HEAD) - 0.03, FRONT_IN + fwd(HEAD), HEAD, CEIL, tint(LINING, 0.93))
    for hh in (1.35, 1.70, 2.02):
        with Frame((sx * MULLION_X, FRONT_IN - 0.03 + fwd(hh), hh), STBD, RAKE_UP) as F:
            screw(F, 0.0, 0.0, 0.0, r=0.0026)


WIPER_AT = 2.165                    # the wipers' spindles, over the deck: in the head, above the glass and under the visor
WIPER_OFF = 0.42                    # and to one side of the pane's middle: parked, the wiper hangs upright beside the mullion
WIPER_SWING = 62.0                  # how far it swings from there, toward the pane's middle


def wiper(g, tag, x, yard, h):
    """A pendulum wiper on the outside of the raked glass, hung from a spindle in the window's head under the visor: the
    spindle's boss, a cranked arm, the blade in its holder. Inside, over the blind, its motor in a case with its cable.
    Parked it hangs upright at the side of the pane, out of the view; running, it swings across the glass and back."""
    key = g['name']
    off = WIPER_OFF if x >= 0 else -WIPER_OFF
    n = Vector((0.0, -sin(radians(10.0)), cos(radians(10.0))))                          # out of the glass, outside
    o = Vector(P(x + off, GLASS_AT(HEAD), HEAD))
    yp = (WIPER_AT - HEAD) / cos(radians(10.0))                                         # the spindle, up the glass's plane from the head
    pivot = o + Vector(RAKE_UP) * yp
    M = moving(f'Window wiper, {key}', f'wiper-{key}', arm='Stainless', blade='Rubber')
    with Frame(tuple(o), PORT, RAKE_UP, local=True) as F:                              # outside: across is to port
        F.lathe('steel', (0.0, yp, 0.020), [(0.0, 0.030), (0.006, 0.030), (0.010, 0.016), (0.030, 0.014)], STAINLESS)      # the boss on the head's plating
        for k in range(3):
            a = k * 2 * pi / 3
            bolt(F, 0.022 * cos(a), yp + 0.022 * sin(a), 0.026, r=0.0035, h=0.003)
        F.into = dict(steel=M['arm'], rubber=M['blade'])
        F.lathe('steel', (0.0, yp, 0.046), [(0.0, 0.013), (0.010, 0.013), (0.014, 0.008), (0.014, 0.0)], STAINLESS)        # the arm's head on the spindle
        F.sweep('steel', [(0.0, yp, 0.052), (0.0, yp - 0.10, 0.052), (0.0, yp - 0.16, 0.020), (0.0, yp - 0.62, 0.016)], 0.0042, STAINLESS)
        F.block('steel', (-0.006, yp - 0.635, 0.009), (0.006, yp - 0.595, 0.022), STAINLESS, r=0.002)                      # the holder's clip
        F.block('steel', (-0.004, yp - 0.92, 0.008), (0.004, yp - 0.32, 0.012), tint(STAINLESS, 0.8), r=0.0)               # the blade's spring strip
        F.block('rubber', (-0.003, yp - 0.92, 0.0005), (0.003, yp - 0.32, 0.008), RUBBER, r=0.0)
        F.into = None
    # which way round the glass's own direction it must turn for its lower end to go toward the pane's middle
    turn = 1.0 if (_rot(-Vector(RAKE_UP), n, radians(10.0)).x > 0) == (off < 0) else -1.0
    MOTIONS.append(dict(id=f'wiper-{key}', name=f'Window wiper, {key}', kind='turn', pivot=[float(v) for v in pivot], axis=[float(v) for v in n], ratio=turn, max=WIPER_SWING,
                        at=[float(v) for v in pivot], auto='tap', reach=2.6, rest='parked', above='running', run='sweep', period=1.6, fitting=tag,
                        **{'with': f'wiper-switch-{key}'}))
    # inside: the motor, on the head lining over the blind's cassette, its cable up through the deckhead
    top = FRONT_IN + fwd(HEAD)
    with Frame((x + off, top, 2.225), STBD, UP) as F:
        F.pillow('case', (-0.075, -0.05, 0.0), (0.075, 0.05, 0.085), CASE, r=0.010, segs=3)
        corner_screws(F, -0.075, -0.05, 0.075, 0.05, 0.085, inset=0.012, r=0.0026)
        nameplate(F, 'WIPER', 0.0, 0.0, 0.085, height=0.007, screws=False)
        F.sweep('rubber', [(0.05, 0.045, 0.04), (0.05, 0.068, 0.04)], 0.004, RUBBER, ends=(True, False))


def nozzles(g, tag, x, yard, h):
    """The window wash: a brass pipe along the head outside, under the visor, in saddle clips, and a jet over each wiper's glass."""
    yo, hh = FRONT_OUT + fwd(HEAD) + 0.012, 2.25
    sweep('brass', [(-2.36, yo, hh), (2.36, yo, hh)], 0.006, BRASS)
    for k in range(10):
        xx = -2.25 + k * 0.5
        box('brass', xx - 0.006, xx + 0.006, yo - 0.012, yo + 0.008, hh - 0.010, hh + 0.010, tint(BRASS, 0.85), r=0.002)
    for xx in g['xs']:
        xj = xx - 0.08 if xx > 0.1 else xx + 0.08                                      # beside the wiper's spindle, toward the middle
        sweep('brass', [(xj, yo, hh), (xj, yo + 0.012, hh - 0.03), (xj, yo + 0.018, hh - 0.06)], 0.004, BRASS)
        lathe('brass', (xj, yo + 0.018, hh - 0.06), (0.0, -1.0, 0.1), [(0.0, 0.0065), (0.012, 0.0065), (0.016, 0.003), (0.016, 0.0)], BRASS)


CVS = dict(h=1.50, r=0.170, ring=0.200)        # a clear-view screen: its middle over the deck, its disc, its ring


def cvs_holes():
    """Where the forward glass is cut for the clear-view screens: (x, h, radius)."""
    return [(c['at'][0], CVS['h'], CVS['ring'] - 0.002) for c in REG.COMPONENTS if c['g'].get('kind') == 'cvs']


def cvs(g, tag, x, yard, h):
    """A clear-view screen: a ring clamped in the window's glass with a rubber gasket and eight bolts; in it a glass disc that
    spins, so that spray and rain are thrown off it; at its middle the motor's housing, carried by a tube from the rail under
    the window, which brings its cable. The disc is clear where the window is tinted. A tap starts it and stops it."""
    key = g['name']
    r, R = CVS['r'], CVS['ring']
    hc = CVS['h']
    o = Vector(P(x, GLASS_AT(hc), hc))
    with Frame(tuple(o), STBD, RAKE_UP, local=True) as F:                              # inside: z is into the room
        F.lathe('rubber', (0.0, 0.0, 0.0), [(-0.007, R - 0.004), (-0.007, R + 0.008), (0.007, R + 0.008), (0.007, R - 0.004), (-0.007, R - 0.004)], RUBBER)
        F.lathe('steel', (0.0, 0.0, 0.0), [(-0.013, r + 0.003), (-0.013, R), (-0.009, R + 0.004), (0.009, R + 0.004), (0.013, R), (0.013, r + 0.003), (-0.013, r + 0.003)], STAINLESS)
        for k in range(8):
            a = k * pi / 4 + pi / 8
            bolt(F, (r + 0.017) * cos(a), (r + 0.017) * sin(a), 0.013, r=0.004, h=0.003)
        # the motor at the middle, and the tube that carries it from the rail under the window
        F.lathe('case', (0.0, 0.0, 0.010), [(0.0, 0.0), (0.0, 0.040), (0.004, 0.046), (0.070, 0.046), (0.084, 0.034), (0.086, 0.0)], CASE)
        ys = -(hc - SILL - 0.016) / cos(radians(10.0))                                 # the rail under the window, down the glass's plane
        F.sweep('steel', [(0.0, ys, 0.058), (0.0, ys, 0.085), (0.0, ys + 0.03, 0.105), (0.0, -0.075, 0.105), (0.0, -0.046, 0.085), (0.0, -0.04, 0.06)], 0.010, STAINLESS)
        F.lathe('steel', (0.0, ys, 0.056), [(0.0, 0.026), (0.004, 0.026), (0.008, 0.013), (0.012, 0.011)], STAINLESS)
        for sx in (-1, 1):
            screw(F, sx * 0.018, ys, 0.060, r=0.0026)
        nameplate(F, 'CLEAR VIEW', 0.0, 0.012, 0.096, height=0.006, screws=False)
        lamp(F, 0.022, -0.016, 0.094, 0.003, srgb(0x3cf058), lit=False)
        F.lathe('chrome', (-0.018, -0.016, 0.094), [(0.0, 0.0055), (0.003, 0.0055), (0.003, 0.0)], CHROME)                 # its switch's nut and bat
        F.tube('chrome', (-0.018, -0.016, 0.096), (-0.018, -0.008, 0.112), 0.002, CHROME, r2=0.003)
        # what spins: the glass disc, three clips at its rim, the driving flange at its middle and the cap outside
        M = moving(f'Clear-view screen, {key}, disc', f'clear-view-{key}', glass='Clear glass', steel='Stainless')
        F.into = dict(cvs=M['glass'], steel=M['steel'])
        F.lathe('cvs', (0.0, 0.0, 0.0), [(-0.0035, 0.0), (-0.0035, r), (-0.0005, r), (-0.0005, 0.0)], srgb(0xdfeaea))
        for k in range(3):
            a = k * 2 * pi / 3 + 0.4
            F.lathe('steel', ((r - 0.012) * cos(a), (r - 0.012) * sin(a), -0.0005), [(0.0, 0.006), (0.003, 0.006), (0.004, 0.003), (0.004, 0.0)], STAINLESS)
        F.lathe('steel', (0.0, 0.0, -0.0005), [(0.0, 0.050), (0.004, 0.050), (0.0105, 0.036)], STAINLESS)
        F.lathe('steel', (0.0, 0.0, -0.0035), [(0.0, 0.0), (0.0, 0.034), (0.006, 0.030), (0.016, 0.012), (0.018, 0.0)], STAINLESS, axis=(0.0, 0.0, -1.0))
        for k in range(4):                                                             # so that it is seen to turn: the flange's four screws
            a = k * pi / 2
            F.lathe('steel', (0.043 * cos(a), 0.043 * sin(a), 0.0035), [(0.0, 0.003), (0.0015, 0.003), (0.0015, 0.0)], tint(STAINLESS, 0.6))
        F.into = None
        axis = [float(v) for v in F.way((0.0, 0.0, 1.0))]
    MOTIONS.append(dict(id=f'clear-view-{key}', name=f'Clear-view screen, {key}', kind='turn', pivot=[float(v) for v in o], axis=axis, ratio=1.0, max=360,
                        at=[float(v) for v in o], auto='tap', reach=2.6, rest='stopped', above='spinning', run='spin', rate=1000, fitting=tag))


# ---------------------------------------------------------------------------------------------------------------------
# Under the sills
# ---------------------------------------------------------------------------------------------------------------------
RAIL_H, RAIL_OFF = 0.865, 0.062         # the handrail under the sills: over the deck, and off the lining


def _fillet(points, radius, n=5):
    """A line of points with each corner eased into a curve."""
    pts = [Vector(q) for q in points]
    out = [pts[0]]
    for a, b, c in zip(pts, pts[1:], pts[2:]):
        r = min(radius, (b - a).length / 2, (c - b).length / 2)
        t1, t2 = b + (a - b).normalized() * r, b + (c - b).normalized() * r
        for i in range(n + 1):
            t = i / n
            out.append(t1 * (1 - t) ** 2 + b * 2 * t * (1 - t) + t2 * t ** 2)
    out.append(pts[-1])
    return [tuple(q) for q in out]


def handrail(g, tag, x, yard, h):
    """The handrail under the sills: stainless tube 62 mm off the lining on brackets, along the front from the console block
    to each side, round the corner and aft along the side; its ends turned in to the lining."""
    f, s = FRONT_IN - RAIL_OFF, X_IN - RAIL_OFF
    for side, aft in (((1, 21.36),) if g['side'] > 0 else ((-1, 22.24),)):
        line = [(side * 1.99, FRONT_IN, RAIL_H), (side * 1.99, f, RAIL_H), (side * s, f, RAIL_H), (side * s, aft, RAIL_H), (side * X_IN, aft, RAIL_H)]
        sweep('steel', _fillet([P(*q) for q in line], 0.045), 0.016, STAINLESS, local=True)
        for q, way in ((line[0], AFTWARD), (line[-1], (-side, 0, 0))):                 # a rosette where each end meets the lining
            lathe('steel', q, way, [(0.0, 0.030), (0.004, 0.030), (0.008, 0.018)], STAINLESS)
        places = [((side * xx, FRONT_IN), (0, -1)) for xx in (2.30, 2.62)] + [((side * X_IN, yd), (-side, 0)) for yd in ([22.55, 22.10, 21.68] if side > 0 else [22.56])]
        for (bx, by), (dx, dy) in places:                                             # the brackets: a rosette on the lining, an arm out and up under the tube
            way = (dx, 0, dy)
            lathe('steel', (bx, by, RAIL_H - 0.045), way, [(0.0, 0.022), (0.004, 0.022), (0.008, 0.010)], STAINLESS)
            sweep('steel', [(bx, by, RAIL_H - 0.045), (bx + dx * (RAIL_OFF - 0.02), by + dy * (RAIL_OFF - 0.02), RAIL_H - 0.045),
                            (bx + dx * RAIL_OFF, by + dy * RAIL_OFF, RAIL_H - 0.03), (bx + dx * RAIL_OFF, by + dy * RAIL_OFF, RAIL_H - 0.010)], 0.0075, STAINLESS)


def jbox(g, tag, x, yard, h):
    """The junction box of the heated glass, let into the lining below the sill: a cover plate on a gasket with four screws,
    its name, a switch, a lamp that is lit while the glass is heated."""
    with Frame((x, FRONT_IN, h), STBD, UP) as F:
        F.box('rubber', (-0.092, -0.112, 0.0), (0.092, 0.112, 0.0015), RUBBER)
        F.block('case', (-0.09, -0.11, 0.0), (0.09, 0.11, 0.006), CASE, r=0.002)
        corner_screws(F, -0.09, -0.11, 0.09, 0.11, 0.006, inset=0.012, r=0.003)
        nameplate(F, 'WINDOW HEATING', 0.0, 0.07, 0.006, height=0.007, screws=False)
        F.lathe('dark', (-0.03, 0.0, 0.006), [(0.0, 0.026), (0.002, 0.026), (0.002, 0.0)], srgb(0x202326))
        knob(F, -0.03, 0.0, 0.008, 0.013, h=0.012, turn=0.6)
        lamp(F, 0.04, 0.0, 0.006, 0.006, srgb(0xffb020))
        nameplate(F, '230 V', 0.0, -0.07, 0.006, height=0.005, screws=False)
