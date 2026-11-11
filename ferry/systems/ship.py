"""
The Chisum's systems, ship-wide: what supplies her, the boards the sections are fed from, the subsystems her equipment
is sorted into, and the rules a circuit is sized by. Each section's own components, circuits, nets and pipes are a module of
their own (bridge.py is the first); register.py puts them together, checks them and writes what the page reads.

Her electrical plant continues the Minato Maru's (the Town's working drawings, D1 and D15: `temp/minato-maru/town/docs/minato-maru/`
on the work branch): the same generators, voltages and frequency, the same sizing rule for a feeder. What is new is hers.
Nothing here is class-approved or construction information.
"""

SHIP = dict(name='Chisum', length=34.5, type='car and passenger ferry')

# ---- What she is supplied by: the answer to "what is the main?"
SUPPLY = dict(
    main=dict(label='440 V three-phase, 60 Hz', volts=440, phases=3, hz=60,
              text='The main supply: three-wire, insulated from the hull (no neutral, earth-fault lamps on each board). '
                   'Motors, the galley range and the water heater take it directly.'),
    small=dict(label='105 V single-phase, 60 Hz', volts=105, phases=1, hz=60,
               text='Lighting and small power, through 440/105 V transformers: two-wire, both poles insulated and both switched.'),
    dc=dict(label='24 V direct current', volts=24, phases=0, hz=0,
            text='Two-wire, insulated, from two battery banks in the emergency generator room. The general service bank feeds '
                 'navigation and control and is the transitional source: it carries the general alarm, the public address, the '
                 'transitional lighting and, through an inverter, the navigation lights through the 45 seconds the emergency '
                 'generator takes to start, and for half an hour if it does not. The radio bank feeds the radio and nothing else. '
                 'Each bank floats on its own charger.'),
)

SOURCES = [
    dict(id='G1', name='Diesel generator No. 1', rating='125 kVA, 100 kW, 445 V, 60 Hz', where='Engine room', feeds='MSB', built=False),
    dict(id='G2', name='Diesel generator No. 2', rating='125 kVA, 100 kW, 445 V, 60 Hz', where='Engine room', feeds='MSB', built=False),
    dict(id='SHORE', name='Shore connection at Minato', rating='50 kVA, 440 V, 60 Hz', where='Car deck, port side', feeds='MSB', built=False),
    dict(id='EG', name='Emergency generator', rating='40 kVA, 32 kW, 445 V, 60 Hz', where='Emergency generator room, bridge deck', feeds='ESB', built=False),
    dict(id='BAT-G', name='24 V battery bank, general service and transitional', rating='24 V, 200 Ah (calculation JS8-855)', where='Emergency generator room', feeds='DCB', built=False),
    dict(id='BAT-R', name='24 V battery bank, radio', rating='24 V, 100 Ah (calculation JS8-855)', where='Emergency generator room', feeds='DCB-R', built=False),
]

# ---- The boards a section may be fed from. `ext` is the cable length, in metres, from the board to the point where its
# cables enter the bridge (the corridor's deckhead at the wheelhouse door): the Minato Maru's feeder list gives 33 m from the
# control booth to the wheelhouse and 20 m from the emergency generator room, and 3 m of each is measured in bridge.py.
# They are the Minato Maru's lengths until the sections between are routed.
BOARDS = [
    dict(id='MSB', name='Main switchboard', volts=440, kind='AC', where='Engine control room', fed_by=['G1', 'G2', 'SHORE'], built=False),
    dict(id='LB', name='Lighting and small-power board', volts=105, kind='AC', where='Engine control room', fed_by=['MSB'], ext=30.0, built=False,
         text='The 105 V section of the main board, behind the lighting transformers.'),
    dict(id='ESB', name='Emergency switchboard', volts=105, kind='AC', where='Emergency generator room', fed_by=['MSB', 'EG'], ext=17.0, built=False,
         text='Fed from the main board through the bus-tie while there is main power, and from the emergency generator within 45 s of '
              'losing it; its 105 V section is behind the 5 kVA emergency lighting transformer.'),
    # SOLAS II-1/42.4 (read for PA-001 revision 1): the transitional source is an accumulator battery that takes over by
    # itself and carries, among other things, the navigation lights for half an hour. They are 105 V lanterns, so the
    # battery feeds them through an inverter.
    dict(id='TSB', name='Emergency switchboard, transitional section', volts=105, kind='AC', where='Emergency generator room', fed_by=['ESB', 'BAT-G'], ext=17.0, built=False,
         text='A section of the emergency switchboard that is never dead: fed from the board while it is alive, and without a break from the '
              'general service battery through a 1 kVA inverter (24 V DC to 105 V) when it is not. It feeds the navigation light panel.'),
    dict(id='DCB', name='24 V DC board, general service bank', volts=24, kind='DC', where='Emergency generator room', fed_by=['BAT-G'], ext=17.0, built=False),
    dict(id='DCB-R', name='24 V DC board, radio bank', volts=24, kind='DC', where='Emergency generator room', fed_by=['BAT-R'], ext=17.0, built=False,
         text='The reserve source of energy of the radio installation: it feeds the radio and nothing else.'),
    # The two steering gear power units' own circuits (SOLAS II-1/30: two exclusive circuits, one of them by the emergency
    # switchboard). Each steering control system takes its supply from its own power unit's circuit, in the steering-gear
    # room (II-1/29). 45 m of cable to the bridge is an estimate until the sections between are routed.
    dict(id='SG1', name='Steering gear power unit No. 1, control circuit', volts=105, kind='AC', where='Steering-gear room', fed_by=['MSB'], ext=45.0, built=False),
    dict(id='SG2', name='Steering gear power unit No. 2, control circuit', volts=105, kind='AC', where='Steering-gear room', fed_by=['ESB'], ext=45.0, built=False),
]

# ---- Places outside the section that its nets and pipes run to. Named, not yet registered: they become components when
# their own section is built.
ELSEWHERE = {
    'ECR': 'Engine control room',
    'ER': 'Engine room',
    'STG': 'Steering-gear room',
    'THR': 'Bow thruster room',
    'EGR': 'Emergency generator room',
    'ACC': 'Crew accommodation, bridge deck',
    'PAX': 'Passenger deck',
    'CAR': 'Car deck',
    'HULL': 'Hull',
    'DECKS': 'All decks',
}

# ---- The subsystems her equipment is sorted into (the first part of a component's tag).
SUBSYSTEMS = [
    dict(id='NAV', name='Navigation', text='Finding where she is, where she heads and what is around her: radar, charts, position, heading, depth, speed, wind.'),
    dict(id='STR', name='Steering', text='From the wheel, the tiller or the autopilot to the two rudders, and the rudder angle shown back.'),
    dict(id='PRP', name='Propulsion control', text='The two main engines, their gearboxes and the bow thruster, worked from the bridge and from either wing.'),
    dict(id='COM', name='Radio', text='Distress and safety radio for sea area A1 (within VHF range of the coast), and the float-free and portable sets.'),
    dict(id='INT', name='Internal communication', text='Public address and general alarm, talkback to the mooring stations and the ramp, the telephones.'),
    dict(id='ALM', name='Alarm and monitoring', text='What the bridge is told without asking: machinery alarms, the watch alarm, doors and ramp, the cameras.'),
    dict(id='FIR', name='Fire detection and fire-fighting', text='The detection loop and its panel, call points, extinguishers, the hydrant and hose.'),
    dict(id='NLT', name='Navigation lights and signals', text='The lanterns and their monitored panel, the whistle, the searchlight, wipers, flags and the signalling lamp.'),
    dict(id='LGT', name='Lighting', text='White light for work, red for the night watch, emergency lighting, the wings and the foredeck.'),
    dict(id='ELD', name='Electrical distribution', text='The boards on the bridge and the cable ways from them.'),
    dict(id='HVC', name='Air conditioning', text='The wheelhouse room unit and its condensing unit on the compass deck.'),
    dict(id='PIP', name='Piping', text='Compressed air to the whistle, fresh water to the window wash, the fire main, the scuppers.'),
    dict(id='LSA', name='Life-saving', text='Lifebuoys, lifejackets for the watch, pyrotechnics, first aid.'),
    dict(id='EMG', name='Emergency power', text='The emergency generator set in its own room, with what starts it, feeds it, cools it and takes its exhaust away, and the emergency switchboard it supplies.'),
    dict(id='OUT', name='Outfit', text='The room itself and its furniture: console, stand, chairs, chart table, doors, windows, linings.'),
]

# ---- The rule a circuit is sized by (the Minato Maru's D15: breaker at least 1.25 times the full-load current, the next
# standard rating; cable rated for the breaker and chosen for voltage drop; the drop no more than 5 % along one cable).
# Recalled from IEC 60092-352 practice and not checked against the text: 6 % in all from a switchboard to the last consumer
# on alternating current, 10 % on a battery supply; the ratings below are for two-core rubber-insulated marine cable at 45 °C,
# rounded down. The resistivity is the one the Minato Maru's feeder list works out to (copper, hot).
BREAKERS = (2, 4, 6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100)
CABLE_RATING = {1.0: 13, 1.5: 17, 2.5: 24, 4: 32, 6: 41, 10: 57, 16: 76, 25: 101, 35: 125}
RHO = 0.0221                  # ohm mm² per metre
DROP_ONE_CABLE = 5.0          # per cent
DROP_TOTAL = {'AC': 6.0, 'DC': 10.0}
MARGIN = 1.25
ALLOWANCE = 1.10              # a cable is a tenth longer than the way it is laid along (bends, making off)


def amps(watts, volts, kind, pf=0.9):
    """Full-load current of a single-phase or direct-current consumer."""
    return watts / volts if kind == 'DC' else watts / (volts * pf)


def drop_volts(length, current, mm2):
    """Voltage lost along a two-wire cable (out and back)."""
    return 2 * length * current * RHO / mm2
