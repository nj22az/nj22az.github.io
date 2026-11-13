"""
Deck fittings: the inflatable liferaft in its canister, on its cradle at the ship's side.

    origin   on the deck under the middle of the canister
    x        along the canister (it lies fore and aft, along the ship's side)
    z        its FRONT: inboard, where its lettering and its placard are read from; it is launched the other way, over the side
             (so on the port side it is placed with heading 270, on the starboard side with heading 90)

Sizes [M]: a 25-person throw-overboard raft's canister is about 1.45 m long and 0.70 m across and weighs about 150 kg (the
makers' lists of the 1970s and since, as recalled; not read tonight). The cradle holds it 0.75 m over the deck on a slope of
12 degrees toward the side, so that let go it rolls over the side by itself. Lashing, slip hook and hydrostatic release as
they are fitted on every ship: the release cuts the lashing's rope loop at 2 to 4 m under water, and the painter is made
fast to its weak link, which parts when the sinking ship pulls on the inflated raft.
"""
from math import pi, sin, cos, radians, degrees
from mathutils import Vector
from shipyard import tint, srgb
from fittings_kit import *          # noqa: F401,F403
from fittings_kit import fitting

R, LEN = 0.35, 1.45
SLOPE = 12.0
CY = 1.11                           # the canister's middle over the deck


@fitting('liferaft', size=(1.6, 0.95, 1.55), front='+z (inboard); launched toward -z', title='Liferaft',
         note='canister lying along x on a sloping cradle; origin on the deck under its middle; place with its back (-z) to the ship\'s side: heading 270 to port, 90 to starboard; options persons, guard (chains are rigged across the rail\'s gap before it: the placard says to let them go)')
def liferaft(kit, persons=25, guard=False, **_):
    """
    A white glass-fibre canister in two halves with a flange and a rubber seal between, four ribs, three packing bands, its
    painter coming out of one end; on a galvanised cradle of two saddles on four legs bolted to the deck, sloping to the
    side; held by a webbing lashing over it with a slip hook and a hydrostatic release unit to an eye on the cradle; the
    painter made fast to the release's weak link; the maker's label, the lettering and an instruction placard.
    """
    grp, galv, steel, rubber, rope, mark, plastic = (kit.p(k) for k in ('grp', 'galv', 'steel', 'rubber', 'rope', 'mark', 'plastic'))
    white = WHITE
    on = lambda t, r: r * Vector((0.0, -cos(radians(t)), sin(radians(t))))      # round the shell: 0 under it, 90 inboard, 180 on top, -90 toward the side
    with turned(kit, (0.0, CY, 0.0), about=PORT, angle=-SLOPE) as T:
        # ---- the canister: a round shell with domed ends, four ribs moulded in it
        dome = [(-LEN / 2, 0.0), (-LEN / 2 + 0.012, 0.12), (-LEN / 2 + 0.05, 0.235), (-LEN / 2 + 0.11, 0.315), (-LEN / 2 + 0.18, R)]
        prof = list(dome)
        for x in (-0.47, -0.16, 0.16, 0.47):
            prof += [(x - 0.035, R), (x - 0.022, R + 0.012), (x + 0.022, R + 0.012), (x + 0.035, R)]
        prof += [(-d, r) for d, r in reversed(dome)]
        lathe(grp, (0, 0, 0), PORT, prof, white, caps=(False, False))
        # the flange where the two halves meet, and the seal between them
        edge = [(d, r + 0.028) for d, r in prof[1:-1]]
        flange = [(d, r) for d, r in edge] + [(d, -r) for d, r in reversed(edge)]
        for y0, y1, col, part in ((0.004, 0.020, white, grp), (-0.020, -0.004, white, grp), (-0.004, 0.004, BLACK, rubber)):
            prism(part, [(x, y0, z) for x, z in flange], (0, y1 - y0, 0), col, smooth=True)
        # three packing bands round it, each with its buckle
        for x in (-0.40, 0.0, 0.40):
            lathe(steel, (x - 0.008, 0, 0), PORT, [(0.0, R + 0.0005), (0.0, R + 0.003), (0.016, R + 0.003), (0.016, R + 0.0005)], srgb(0x2a2d2e), caps=(False, False))
            q = on(128, R + 0.001)
            with turned(kit, (x, q.y, q.z), y=(0.0, q.y, q.z), x=PORT):
                steel.block((-0.012, 0.0, -0.014), (0.012, 0.008, 0.014), STEEL, r=0.002)

        # ---- lettering, wrapped round the shell: read from inboard
        def r_at(x):
            """The shell's radius at x: over a rib it stands out."""
            for (d0, r0), (d1, r1) in zip(prof, prof[1:]):
                if d0 <= x <= d1:
                    return r0 + (r1 - r0) * (x - d0) / max(d1 - d0, 1e-9)
            return 0.0

        def on_shell(x0, t0, lift=0.0025):
            def f(u, v):
                return Vector((x0 + u, 0.0, 0.0)) + on(t0 + degrees(v / R), r_at(x0 + u) + lift)   # up the shell from the angle t0
            return f

        def lettered(text, h, x0, t0, colour=BLACK, lift=0.0025):
            st = len(mark.f)
            letter(kit, mark, text, h, None, PORT, UP, colour, onto=on_shell(x0, t0, lift), piece=0.02)
            mark.orient(st, lambda c: Vector((0.0, c.y, c.z)))
        lettered('LIFERAFT', 0.058, -0.21, 120)
        lettered(f'{persons} PERSONS', 0.044, -0.21, 108)
        lettered('SOLAS A PACK', 0.026, -0.21, 100)
        lettered('DO NOT ROLL', 0.024, -0.21, 150, RED)
        lettered('THIS WAY UP', 0.024, 0.21, 150, RED)
        # the maker's label: a blue panel laid on the shell, lettered in white
        st = len(mark.f)
        f = on_shell(0.21, 100, lift=0.0015)
        mark.grid([[tuple(f(u, v)) for u in [-0.15 + 0.30 * j / 30 for j in range(31)]] for v in [0.12 * k / 8 for k in range(9)]], BLUE)
        mark.orient(st, lambda c: Vector((0.0, c.y, c.z)))
        for text, h, v in (('JSY MARINE', 0.021, 0.086), ('TYPE 25 DK', 0.016, 0.058), ('SERVICE DUE 11 27', 0.012, 0.034), ('MASS 148 KG', 0.012, 0.012)):
            lettered(text, h, 0.21, 100 + degrees(v / R), WHITE, lift=0.0024)
        # the painter comes out through a grommet in the canister's forward end
        rubber.tube((LEN / 2 - 0.045, -0.09, 0.14), (LEN / 2 - 0.010, -0.09, 0.14), 0.022, colour=BLACK)

        # ---- the cradle's two saddles: each a flat bar bent to the shell and lined with rubber; a rail joins their ends each side
        for x in (-0.47, 0.47):
            arc = [on(t, R + 0.020) for t in range(-62, 63, 4)]
            arc_i = [on(t, R + 0.014) for t in range(-62, 63, 4)]
            arc_r = [on(t, R + 0.0124) for t in range(-62, 63, 4)]
            prism(galv, [(x - 0.025, q.y, q.z) for q in arc] + [(x - 0.025, q.y, q.z) for q in reversed(arc_i)], (0.050, 0, 0), GALV, smooth=True)
            prism(rubber, [(x - 0.022, q.y, q.z) for q in arc_i] + [(x - 0.022, q.y, q.z) for q in reversed(arc_r)], (0.044, 0, 0), BLACK, smooth=True)
        rail = {}
        for t in (-62, 62):
            q = on(t, R + 0.017) + Vector((0.0, 0.0, 0.016 if t > 0 else -0.016))
            galv.tube((-0.515, q.y, q.z), (0.515, q.y, q.z), 0.016, colour=GALV)
            rail[t] = q
        # an outrigger on the inboard rail carries the eye the lashing is made fast to, clear of the canister's flange
        eye = Vector((0.0, rail[62].y - 0.03, rail[62].z + 0.22))
        bar(galv, (0.0, rail[62].y - 0.006, rail[62].z), tuple(eye + Vector((0, 0, 0.03))), 0.040, 0.010, GALV, up=UP)
        galv.ring(tuple(eye + Vector((0, 0.022, 0))), PORT, 0.018, 0.006, GALV)

        # ---- the lashing: webbing round the low rail, up the outboard side, over the top and down to a ring; slip hook; release unit
        web = srgb(0x23406a)
        ts = list(range(-62, -231, -4))                             # from the low rail over the top to the inboard upper quarter
        outer, inner = [on(t, R + 0.0185) for t in ts], [on(t, R + 0.0150) for t in ts]
        prism(kit.p('canvas'), [(-0.025, q.y, q.z) for q in outer] + [(-0.025, q.y, q.z) for q in reversed(inner)], (0.050, 0, 0), web, smooth=True)
        top = on(ts[-1], R + 0.017)
        d = (eye - top).normalized()
        span = (eye - top).length
        at = lambda s: tuple(top + d * s)
        galv.ring(at(0.014), PORT, 0.024, 0.006, GALV)                                                              # the ring sewn in the webbing's end
        sweep(galv, [at(0.03), at(0.075), tuple(top + d * 0.105 + Vector((0.022, 0, 0))), at(0.135), tuple(top + d * 0.105 - Vector((0.022, 0, 0))), at(0.075)], 0.006, GALV)   # the slip hook
        galv.ring(at(0.152), PORT, 0.016, 0.004, GALV)
        # the hydrostatic release: a white unit, a rope loop at its head, the weak link's red line at its foot
        hru = top + d * 0.240
        out = Vector((0.0, hru.y, hru.z)).normalized()
        with turned(kit, tuple(hru), y=tuple(-d), x=PORT):
            plastic.block((-0.033, -0.055, -0.022), (0.033, 0.055, 0.022), WHITE, r=0.008)
            plastic.tube((0.0, 0.012, 0.022), (0.0, 0.012, 0.028), 0.022, colour=srgb(0xd9dde0))
            label(kit, mark, (0.0, -0.032, 0.022), PORT, UP, 0.050, 0.026, YELLOW, ('EXP 11 27',), proud=0.0012)
            sweep(rope, [(-0.012, 0.050, 0.0), (-0.012, 0.074, 0.0), (0.012, 0.074, 0.0), (0.012, 0.050, 0.0)], 0.004, WHITE)
            sweep(rope, [(-0.012, -0.050, 0.0), (-0.014, -0.085, 0.0), (0.0, -0.100, 0.0), (0.014, -0.085, 0.0), (0.012, -0.050, 0.0)], 0.004, RED)   # the weak link
        galv.tube(at(0.335), at(span - 0.035), 0.004, colour=GALV)                                                    # a wire strop on to the eye
        galv.ring(at(span - 0.020), FWD, 0.014, 0.004, GALV)
        # the painter, from the canister's end to the weak link
        wl = hru + d * 0.098
        sweep(rope, [(LEN / 2 - 0.012, -0.09, 0.14), (LEN / 2 + 0.06, -0.12, 0.19), (LEN / 2 + 0.03, -0.10, 0.36), (0.50, 0.02, 0.44), (0.22, wl.y + 0.03, wl.z + 0.06),
                     (0.04, wl.y + 0.012, wl.z + 0.016), (0.0, wl.y, wl.z)], 0.005, ORANGE, lay=3)
        feet = [(x, T.at((x, rail[t].y, rail[t].z))) for x in (-0.47, 0.47) for t in (-62, 62)]

    # ---- the cradle's four legs to the deck, each on a pad with two bolts; a tie at knee height all round; a brace each side
    for x, p in feet:
        galv.block((x - 0.022, 0.010, p[2] - 0.022), (x + 0.022, p[1] - 0.006, p[2] + 0.022), GALV, r=0.004)
        galv.block((x - 0.075, 0.0, p[2] - 0.06), (x + 0.075, 0.010, p[2] + 0.06), GALV, r=0.003)
        for dx in (-0.052, 0.052):
            bolt(steel, (x + dx, 0.010, p[2]), UP, 0.012)
    zs = sorted({round(p[2], 4) for _, p in feet})
    tops = {round(p[2], 4): p[1] for _, p in feet}
    for z in zs:
        galv.block((-0.448, 0.22, z - 0.012), (0.448, 0.26, z + 0.012), GALV, r=0.003)
        bar(galv, (-0.45, 0.27, z), (0.45, tops[z] - 0.10, z), 0.008, 0.035, GALV, up=UP)
    for x in (-0.47, 0.47):
        galv.block((x - 0.012, 0.22, zs[0] + 0.022), (x + 0.012, 0.26, zs[1] - 0.022), GALV, r=0.003)
    # ---- the instruction placard, on a plate on a flat bar across the inboard legs
    zi = zs[1] + 0.022
    galv.block((-0.492, 0.46, zi), (0.492, 0.50, zi + 0.010), GALV, r=0.003)
    galv.block((-0.31, 0.30, zi + 0.010), (0.31, 0.66, zi + 0.014), tint(GALV, 1.05), r=0.001)
    # (where chains are rigged across the rail's gap before the raft, `guard`, letting them go is a step of launching it)
    steps = (['CHECK PAINTER IS MADE FAST'] + (['LET GO GUARD CHAINS'] if guard else []) + ['LET GO SLIP HOOK', 'ROLL RAFT OVER THE SIDE', 'PULL PAINTER TO INFLATE'])
    label(kit, mark, (0.0, 0.48, zi + 0.014), PORT, UP, 0.60, 0.34, WHITE,
          ('LIFERAFT', f'{persons} PERSONS', 'TO LAUNCH') + tuple(f'{n + 1} {s}' for n, s in enumerate(steps)),
          ink=BLACK, proud=0.0015, border=0.008)
    kit.clear = ((-0.95, 0.0, -1.10), (0.95, 1.65, 0.80))
    kit.known_by = ('Canister of white glass fibre in two halves, domed ends, four moulded ribs, flange and rubber seal, three packing bands with '
                    'buckles; lettering round the shell (LIFERAFT, persons, pack), the maker\'s label; the painter out through a grommet. Cradle: '
                    'two saddles of bent flat bar lined with rubber, two rails, four legs on bolted pads, ties and braces, an outrigger with an eye. '
                    'Lashing: webbing round the low rail and over the canister to a ring, slip hook, hydrostatic release unit with its rope '
                    'loop and red weak link, wire strop to the eye; the painter made fast to the weak link. Instruction placard.')
