#!/usr/bin/env python3
"""
The Chisum's accommodation in her register: so far one room, the chief engineer's day room, with the maintenance computer.

The owner, 12 November 2026: "Build a functional Maintenance PC and add it to the chief engineers cabin". Design record:
yard/design/maintenance-computer.md. Drawing: JS5-511 (yard/drawings/cabin_drawing.py).

A third section, beside the navigation bridge's (bridge.py) and the stern ramp's (stern.py), and of the stern's kind: the
simplest that the register takes. Every place is read from blender/cabin_place.py, which the builder (blender/cabin_ce.py)
and the drawing read too.

How it is fed is the owner's own package's (blender/assets/ce-suite/MS-CE-001, section 5, the cable schedule): the suite has
a distribution board of its own, **DB-CE**, six ways, by the door; its circuit S1 is the day room's sockets, 3 x 2.5 mm² on a
16 A breaker, in skirting trunking; the board's feeder is 3 x 2.5 mm² from an accommodation board. What is in the register:

  The computer (ADM-01) on circuit S1, at the twin socket under the desk (ELD-71).
  DB-CE (ELD-72) as a board with that one way. **It is not installed**: its place beside the door is marked, the skirting
  trunking is built to it, and the socket's cable ends in a box there. The accommodation board that is to feed it does not
  exist aboard: its feeder is entered from the lighting and small-power board LB, whose own place is not built either, with
  the register's estimate for the way beyond the room (ship.BOARDS: `ext`).
  The data outlet (ADM-02): its cable goes the same way and ends in the same box. No network is built aboard and none is
  registered: the outlet is a component, not a net. The maintenance program keeps its records on the computer and needs none.
  The desk, the chair and the calendar are the room's outfit (OUT-51, OUT-52, OUT-53).

Places are (x to port, metres from the transom, metres above the keel), as stern.py has them.
"""
import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'blender'))
import ga
import lines as L
import cabin_place as CP

K = ga.DECKS[CP.DECK]                   # the officers' deck, above the keel
SECTION = dict(id='accommodation', name='Accommodation', rooms={'chief-engineer': "Chief engineer's suite"})


def xyz(p):
    """(x, metres from the transom, metres above the keel) → the ship's axes."""
    return [round(p[0], 3), round(L.Y(p[2]), 3), round(L.Z(p[1]), 3)]


def at(place):
    """A place as cabin_place.py gives it (x, from the transom, over the officers' deck) → this section's measure."""
    x, yard, h = place
    return (round(x, 4), round(yard, 4), round(K + h, 4))


def mid(pair):
    return (pair[0] + pair[1]) / 2


# ---------------------------------------------------------------------------------------------------------------------
# Cable ways: from the system unit to the outlets, and along the skirting trunking to the place of DB-CE
# ---------------------------------------------------------------------------------------------------------------------
_th = mid(CP.TRUNK['h'])
_su, _du = mid(CP.SOCKET['u']), mid(CP.DATA['u'])
_bx0, _bx1, _bh0, _bh1 = CP.BOARD['box']
NODES = {
    'CE-UNIT': at(CP.side(mid(CP.UNIT['u']), CP.UNIT['v'][0], 0.22)),                 # the back of the system unit
    'CE-SKT': at(CP.side(_su, 0.02, mid(CP.SOCKET['h']))),                            # the twin socket
    'CE-DATA': at(CP.side(_du, 0.02, mid(CP.DATA['h']))),                             # the data outlet
    'CE-TR-D': at(CP.side(_du, 0.01, _th)),                                           # the skirting trunking: under the data outlet,
    'CE-TR-S': at(CP.side(_su, 0.01, _th)),                                           # under the socket,
    'CE-TR-C': at((CP.SIDE - 0.01, CP.AFT + 0.01, _th)),                              # in the corner,
    'CE-TR-U': at(CP.aft(CP.TRUNK['up'], 0.01, _th)),                                 # and at the foot of its way up
    'CE-DB': at(CP.aft(CP.TRUNK['up'], 0.02, (_bh0 + _bh1) / 2)),                     # the box at the place of DB-CE, where the cables end
}
EDGES = [('CE-UNIT', 'CE-SKT'), ('CE-UNIT', 'CE-DATA'), ('CE-SKT', 'CE-TR-S'), ('CE-DATA', 'CE-TR-D'), ('CE-TR-D', 'CE-TR-S'), ('CE-TR-S', 'CE-TR-C'),
         ('CE-TR-C', 'CE-TR-U'), ('CE-TR-U', 'CE-DB')]
ENTRY = {'LB': 'CE-DB'}                  # where the feeder of DB-CE comes into the room: at the board's own place

# ---------------------------------------------------------------------------------------------------------------------
# The suite's distribution board (not installed), and its one way that is used
# ---------------------------------------------------------------------------------------------------------------------
BOARDS = [
    dict(id='DB-CE', name="Chief engineer's suite distribution board", comp=CP.TAGS['board'], volts=230, kind='AC', fed_by='LB',
         feeder=dict(breaker=20, mm2=2.5),
         text='The suite\'s own board (the owner\'s method statement MS-CE-001: six ways, miniature breakers, and 30 mA residual-current breakers on '
              'the sockets), on the after wall beside the door. **Not installed: its place is marked.** The skirting trunking is built to it and the '
              'day room\'s cables end in a box there. Its feeder is to come from an accommodation board that does not exist aboard yet: it is entered '
              'here from the lighting and small-power board.'),
]
OUTSIDE_CIRCUITS = {}
# (board, number, name, breaker A, copper mm², power factor)
CIRCUITS = [
    ('DB-CE', 1, 'S1: day-room sockets', 16, 2.5, 0.9),
]
FIRE_RESISTANT = set()
NETS = []
PIPES = []
COMPONENTS = []


def C(id, name, where, what, w=0, use=0.0, by=None, node=None, note=None, basis='yard'):
    COMPONENTS.append(dict(id=id, name=name, room='chief-engineer', at=at(where), what=what, g=dict(kind='cabin'), w=w, use=use, by=by, alt=None, node=node,
                           survey=None, kks=None, basis=basis, hid=None, box=None, pick=True, note=note, tail=None))


_d, _ch, _cal, _b = CP.DESK, CP.CHAIR, CP.CALENDAR, CP.BOARD
C(CP.TAGS['computer'], 'Maintenance computer', CP.screen_centre(),
  'The chief engineer\'s computer, on the desk in the day room: a screen on its stand, a keyboard, a mouse, and the system unit on the deck under the '
  'desk\'s after end. On it runs Maintenance Desk, a Johansson Co program: every item aboard with its jobs, its records, its drawings and its '
  'instructions. **A tap on it sits one down at it**: the program fills the page, and one button, "Back to the Chisum", goes back aboard.',
  w=CP.WATTS, use=0.5, by=('DB-CE', 1), node='CE-UNIT',
  note='The power figure is typical for a desk computer with its screen, not a maker\'s. Its board, DB-CE, is not installed.')
C(CP.TAGS['socket'], 'Twin socket outlet, chief engineer\'s desk', CP.side(mid(CP.SOCKET['u']), 0.0, mid(CP.SOCKET['h'])),
  'A twin 230 V socket on her side under the desk, 0.30 m over the deck, for the computer and its screen: circuit S1 of the suite\'s board DB-CE '
  '(16 A, 3 x 2.5 mm², in skirting trunking, as the owner\'s method statement MS-CE-001 has it). Its cable goes aft and inboard in the trunking to the '
  'place of DB-CE beside the door and **ends there in a box, marked**: the board is not installed.',
  node='CE-SKT')
C(CP.TAGS['data'], 'Data outlet, chief engineer\'s desk', CP.side(mid(CP.DATA['u']), 0.0, mid(CP.DATA['h'])),
  'A network outlet beside the socket. Its cable goes in the same trunking to the same box and **ends there, marked**: no network cabinet is '
  'installed aboard, and no network is registered. The maintenance program keeps its records on the computer itself and needs none.',
  node='CE-DATA')
C(CP.TAGS['board'], 'Place of distribution board DB-CE (not installed)', CP.aft(mid(_b['x']), 0.0, mid(_b['h'])),
  'On the after wall beside the door: a yellow outline and a sign where the suite\'s distribution board is to stand, and under it the box in which '
  'the day room\'s two cables end. **Nothing is installed.** The skirting trunking from the desk\'s outlets comes along her side and the after wall '
  'and up to the box.',
  node='CE-DB')
C(CP.TAGS['desk'], 'Desk, chief engineer\'s day room', CP.side(mid(_d['u']), mid(_d['v']), _d['top']),
  f"A writing desk {_d['u'][1] - _d['u'][0]:.2f} m long and {_d['v'][1] - _d['v'][0]:.2f} m deep along her side at the room's after end, as the owner's "
  'drawing of the suite has it (CE-SUITE-GA-001: at the ship\'s side beside a window). A top on two end panels with a back panel between them, and a '
  'pedestal of three drawers at its forward end. Its forward half metre is under the window, 0.31 m under the sill.',
  node='CE-UNIT')
C(CP.TAGS['chair'], 'Chair, chief engineer\'s desk', CP.side(_ch['u'], _ch['v'], _ch['seat']),
  'An office chair on a five-star base before the desk: whoever sits in it faces her side and the screen, with the window at the right hand.',
  node='CE-UNIT')
C(CP.TAGS['calendar'], 'Wall calendar, chief engineer\'s day room', CP.aft(mid(_cal['x']), 0.0, mid(_cal['h'])),
  'A calendar on the after wall, open at November 2026 with the day ringed: "The engine room watch", three engineers in boiler suits in a manga\'s '
  'manner. The owner, 12 November 2026: "a calendar in the chief engineers office with cute manga ladies". Its picture was made with an image '
  'service from a description (blender/cabin_pictures.py says how); its month is drawn from the calendar itself.',
  node='CE-DB')
