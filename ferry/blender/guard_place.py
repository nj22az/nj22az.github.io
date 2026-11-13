"""
The guard at each lifeboat station's open deck edge: where its stanchions, chains and hinges are, as plain numbers.

The owner, 13 November 2026, with a picture of the boat deck under No 1 lifeboat, the open edge ringed: "Need a chain here on
both sides so we don't fall down it needs to be removable".

One file for everything that reads it: the drawing JS4-413 (yard/drawings/guard_drawing.py) is made from it before anything is
built; the station's builder (blender/fittings_boats.py) builds the guard from it and stops if the station is not as this file
has it.

What is there already (fittings_boats.py; a station is drawn about the deck's edge abreast the middle of the boat: x outboard,
y up from the deck, z toward the boat's bow). The ship's rail stops at each station; the station has a short rail of its own at
each end, whose inner posts stand 3.80 m either side of its middle, and a coaming bar 0.10 m high at the edge. **Between those
posts 7.6 m of deck edge are open, 10 m over the water**, under a boat that hangs with her keel 1.40 m over the deck.

Why it is a folding guard, and not a fixed rail or a chain between fixed posts. When the davits are turned out the boat goes
over that edge, and her keel passes it 0.95 m over the deck (`keel_over_guard()`): a metre-high guard stands in her way. So
it has to come away before she is swung out, and go back when she is home:

  - three stanchions, each hinged at its foot between two cheeks on a base plate and held upright by a pin on a lanyard;
  - two courses of chain through eyes on the stanchions, at the heights of the rail's top and middle courses, each end hooked
    into an eye on the station's end post: four bays of 1.9 m;
  - pins out, hooks off, and the stanchions fold inboard flat on the deck with their chains, under the boat, each head on a pad.

It is worked by a tap (one at each station). The davits are not turned out while it stands, and it is not raised while they
are out: the page refuses both and says why.

Heights are over the deck; x is outboard of the deck's edge (inboard is negative); z is along the station.
"""
from math import cos, radians, sin

# ---- The station, as fittings_boats.py has it (the builder stops if these are not its own).
STATION = dict(
    pin=(-2.15, 0.55),            # the davit arms' pins
    boat=(-1.70, 1.40),           # the boat stowed: her centreline, the underside of her keel
    head=(-1.76, 5.30),           # the arms' head sheaves, stowed
    turn=46.0,                    # degrees from stowed to turned out
    end_posts=3.80,               # the station's end rails: their inner posts, either side of the middle
    rail_x=-0.06,                 # the line the end rails stand on
    rail_courses=(1.00, 0.62, 0.30),
    coaming=(-0.035, -0.005, 0.10),                 # the coaming bar: from, to, high
    frames_inboard_of=-1.20,      # the davit frames' doublers begin here; the arms' landing stops stand at -1.45
)
# ---- The guard.
X = STATION['rail_x']             # it stands on the rail's own line
POSTS = (-1.90, 0.0, 1.90)        # the three folding stanchions
COURSES = (1.00, 0.62)            # the chains: the rail's top and middle courses
TALL = 1.03                       # a stanchion's top
TUBE = 0.017                      # its radius (34 mm tube)
HINGE = 0.035                     # the hinge pin, over the deck: folded, the stanchion and its chains lie 18 mm over the deck
HEEL = 0.012                      # the stanchion below its hinge pin
LOCK = 0.105                      # the locking pin, through both cheeks and the stanchion
CHEEK = dict(x=(-0.098, -0.040), high=0.140, thick=0.008, apart=0.021)      # two cheeks either side of the stanchion: 4 mm of air each side
BASE = dict(x=(-0.150, -0.040), half=0.060, thick=0.010)                    # the base plate welded to the deck
PAD = dict(at=0.93, half=0.030, high=0.018)                                  # the pad a folded stanchion's head lies on: so far inboard of the hinge
CHAIN = 0.008                     # 8 mm chain
SAG = 0.030                       # a bay's chain hangs this much in its middle
EYE = 0.045                       # an eye stands this far out from its stanchion or post, toward the next
FOLD = 90.0                       # degrees, inboard
REACH = 2.2                       # a walker works it from this near


def keel_over_guard():
    """How high the boat's keel is over the deck as it passes over the guard's line while the davits turn out."""
    (px, py), (cx, ky), (hx, hy) = STATION['pin'], STATION['boat'], STATION['head']
    best = None
    for k in range(0, int(STATION['turn'] * 20) + 1):
        a = radians(k / 20)
        x = px + (hx - px) * cos(a) + (hy - py) * sin(a)
        y = py - (hx - px) * sin(a) + (hy - py) * cos(a)
        keel_x, keel_y = cx + (x - hx), ky + (y - hy)
        if best is None or abs(keel_x - X) < abs(best[0] - X):
            best = (keel_x, keel_y, k / 20)
    return round(best[1], 3), best[2]


def folded(x, h):
    """Where a point of the guard lies when it is folded down: (x, height) upright → (x, height) folded inboard."""
    return (X - (h - HINGE), HINGE + (x - X))


def wrong():
    """What would stand where it cannot: an empty list when the guard holds."""
    bad = []
    keel, _ = keel_over_guard()
    if TALL > STATION['boat'][1] - 0.25:
        bad.append('the guard does not stand clear under the stowed boat\'s keel')
    if keel > TALL + 0.10:
        bad.append('the boat\'s keel passes clear over the guard: it need not fold, and the davits\' interlock is for nothing')
    bays = [b - a for a, b in zip((-STATION['end_posts'],) + POSTS, POSTS + (STATION['end_posts'],))]
    if max(bays) > 2.0 or min(bays) < 1.0:
        bad.append(f'a bay of {max(bays):.2f} m: chain between stanchions hangs too slack over 2.0 m')
    if COURSES[0] - SAG < 0.95 or COURSES[0] != STATION['rail_courses'][0] or COURSES[1] != STATION['rail_courses'][1]:
        bad.append('the chains are not at the rail\'s top and middle courses, or the top one hangs under 0.95 m')
    if CHEEK['x'][1] > STATION['coaming'][0] - 0.004 or X + TUBE > STATION['coaming'][0] - 0.004:
        bad.append('the hinge stands in the coaming bar')
    if CHEEK['apart'] - CHEEK['thick'] / 2 < TUBE:
        bad.append('the stanchion does not go between its hinge\'s cheeks')
    if HINGE - HEEL < BASE['thick'] + 0.008 or HINGE - TUBE < BASE['thick'] + 0.004:
        bad.append('the stanchion\'s heel, or the stanchion folded, strikes its base plate')
    head = folded(X, TALL)
    if head[0] < STATION['frames_inboard_of'] + 0.10:
        bad.append('folded, a stanchion\'s head lies on a davit frame')
    if abs(PAD['high'] - (HINGE - TUBE)) > 0.002:
        bad.append('the pad does not carry the folded stanchion')
    return bad



# =====================================================================================================================
# The liferafts' gaps in the rail (JS4-413 sheet 2)
# =====================================================================================================================
# The owner, 13 November 2026, asked whether the six liferafts' gaps should have chains too: "Yes, add them".
#
# What is there (steel.open_deck_rails; spec.OUTFIT; fittings_liferaft.py). The boat deck's rail has a gap of 1.7 m at each
# liferaft; the raft's canister lies along the gap on a cradle, 1.45 m long, its middle 0.50 m inboard of the deck's edge and
# 1.11 m over the deck, on a slope of 12 degrees toward the side: let go, it rolls over the side by itself. The canister fills
# the gap from 0.76 m up; **under it the edge is open, 0.76 m high and 1.7 m long.**
#
# **A chain across that gap stands in the raft's way** when it is rolled over the side (`raft_passes()`: it crosses the rail's
# line 0.64 m over the deck and falls from there). So: no chain where the canister itself is the guard (the rail's top
# course); the rail's middle and bottom courses are carried across in chain, under the canister; and each chain is held at its
# forward end by a slip hook that lets go at a pull, as the raft's own lashing is. Letting them go is a step of launching by
# hand, and the placard on each cradle says so. A raft set free by its hydrostatic release floats up clear of them.
RAFT = dict(
    gap=0.85,                     # the rail's gap: so far either side of the cradle's middle (steel.open_deck_rails)
    rail_in=0.09,                 # the rail's line, inboard of the deck's edge
    post=0.0135,                  # a rail stanchion's radius
    rail_courses=(1.0, 0.615, 0.23),
    centre_in=0.50,               # the canister's middle, inboard of the deck's edge (spec.OUTFIT)
    high=1.11, r=0.35, flange=0.378, long=1.45, slope=12.0,          # the canister and its cradle (fittings_liferaft.py)
    leg_in=0.128,                 # the cradle's outboard legs: their outboard faces, inboard of the deck's edge
    pad_high=0.010,               # the pads the legs stand on reach out to the rail's line
)
RAFT_COURSES = RAFT['rail_courses'][1:]         # the chains: the rail's middle and bottom courses
RAFT_SAG = 0.025
RAFT_LIE = 0.026                  # let go, a chain lies this high over the deck: on the edge of the legs' pads
RAFT_REACH = 1.6


def raft_passes():
    """How low the canister comes over the rail's line while it rolls down its cradle's slope with its middle still inboard of
    the deck's edge: (metres over the deck, how far it has rolled)."""
    from math import sqrt, tan
    r, line = RAFT['flange'], RAFT['centre_in'] - RAFT['rail_in']
    best = None
    for k in range(0, int(RAFT['centre_in'] * 1000) + 1):
        d = k / 1000
        off = line - d                                              # the canister's middle, inboard of the rail's line
        if abs(off) > r:
            continue
        y = RAFT['high'] - d * tan(radians(RAFT['slope'])) - sqrt(r * r - off * off)
        if best is None or y < best[0]:
            best = (y, d)
    return round(best[0], 3), best[1]


def wrong_rafts():
    bad = []
    low, _ = raft_passes()
    under = RAFT['high'] - RAFT['r']
    if RAFT_COURSES[0] > under - 0.10:
        bad.append('a chain stands as high as the canister\'s underside: the canister is the guard there')
    if RAFT_COURSES != RAFT['rail_courses'][1:]:
        bad.append('the chains are not at the rail\'s middle and bottom courses')
    if under - RAFT_COURSES[0] > 0.38 or RAFT_COURSES[0] - RAFT_COURSES[1] > 0.39 or RAFT_COURSES[1] > 0.23:
        bad.append('an opening under the canister is wider than a rail\'s may be')
    if RAFT['rail_in'] + 3.6 * CHAIN / 2 > RAFT['leg_in'] - 0.010:
        bad.append('the chains touch the cradle\'s outboard legs')
    if RAFT_LIE - 3.6 * CHAIN / 2 < RAFT['pad_high']:
        bad.append('let go, a chain lies in the legs\' pads')
    if low > RAFT_COURSES[0] + 0.30:
        bad.append('the raft passes well clear over the chains: they need no slip hooks')
    return bad


if __name__ == '__main__':
    for line in wrong() or ['the lifeboat stations\' guard holds']:
        print(line)
    keel, at = keel_over_guard()
    for line in wrong_rafts() or ['the liferafts\' chains hold']:
        print(line)
    low, rolled = raft_passes()
    print(f'liferaft gaps of {2 * RAFT["gap"]:.1f} m: chains at {RAFT_COURSES[0]:.3f} and {RAFT_COURSES[1]:.2f} m under a canister whose underside is {RAFT["high"] - RAFT["r"]:.2f} m over the deck; '
          f'rolled over the side it crosses the rail\'s line {low:.2f} m over the deck ({rolled:.2f} m down its cradle), and falls from there: the chains are in its way and let go')
    print(f'open edge {2 * STATION["end_posts"]:.1f} m in four bays of {POSTS[1] - POSTS[0]:.2f} m; the boat\'s keel passes the guard\'s line {keel:.2f} m over the deck, '
          f'{at:.0f} degrees out; folded, a stanchion\'s head lies {-folded(X, TALL)[0]:.2f} m inboard of the edge, {folded(X, TALL)[1] - TUBE:.3f} m over the deck')
