/**
 * Every constant for the Pelican scene. Nothing numeric or textual that
 * describes the room belongs anywhere else in this directory.
 *
 * The room is the Pelican's taproom on the night of the storm, 1603:
 * low, dark, firelit, shutters barred against a three-day north-easter.
 * Units are metres.
 */

export const ROOM = {
  width: 9.0,          // along X, door wall to hearth wall
  depth: 6.2,          // along Z, bar wall to window wall
  ceilingHeight: 2.34, // deliberately low; a tall man stoops under the beams
  beamHeight: 2.06,
  beamCount: 7,
  beamWidth: 0.16,
  beamDepth: 0.13,
  wallThickness: 0.22,
};

export const BAR = {
  length: 4.6,
  height: 0.98,
  depth: 0.62,
  topThickness: 0.075,
  x: -ROOM.width / 2 + 0.62,
  z: 0.2,
  footRailHeight: 0.16,
  /** The narrow fault in the old oak where spilled ale never reaches. */
  faultLength: 0.44,
  faultWidth: 0.02,
  faultDepth: 0.09,
  faultOffsetZ: -1.15,
};

export const HEARTH = {
  x: ROOM.width / 2 - 0.34,
  z: -0.4,
  openingWidth: 1.5,
  openingHeight: 1.12,
  depth: 0.66,
  mantelHeight: 1.3,
};

export const CENTRE_TABLE = {
  width: 2.24,
  depth: 0.94,
  height: 0.76,
  topThickness: 0.062,
  x: 0.55,
  z: 0.15,
};

/** Twelve stools, one per soul in the room, plus the one by the fire. */
export const STOOL = {
  seatRadius: 0.155,
  seatThickness: 0.05,
  height: 0.52,
  legInset: 0.09,
  legRadius: 0.021,
};

/**
 * Stool placements. `barnaby` marks the stool nearest the fire — empty by
 * unspoken treaty from 1604 until Tom sits on it in 1612.
 */
export const STOOL_PLACEMENTS = [
  { x: -0.7, z: -0.85, rotation: 0.3 },
  { x: 0.25, z: -0.95, rotation: -0.2 },
  { x: 1.2, z: -0.9, rotation: 0.15 },
  { x: 2.0, z: -0.5, rotation: 1.1 },
  { x: 2.05, z: 0.55, rotation: 1.5 },
  { x: 1.35, z: 1.2, rotation: 2.8 },
  { x: 0.4, z: 1.25, rotation: 3.0 },
  { x: -0.55, z: 1.15, rotation: 3.3 },
  { x: -1.35, z: 0.75, rotation: 4.2 },
  { x: -1.45, z: -0.2, rotation: 4.6 },
  { x: 2.9, z: -1.35, rotation: 0.8 },
  { x: 3.15, z: 0.9, rotation: 2.1, barnaby: true },
];

export const WINDOWS = [
  { x: -1.8, z: ROOM.depth / 2, width: 0.92, height: 0.78, sillHeight: 1.14 },
  { x: 1.9, z: ROOM.depth / 2, width: 0.92, height: 0.78, sillHeight: 1.14 },
];

export const DOOR = {
  x: -ROOM.width / 2,
  z: -1.7,
  width: 1.02,
  height: 1.94,
};

export const PALETTE = {
  oakDark: 0x2b1f16,
  oakMid: 0x4a3423,
  oakWorn: 0x6b4c30,
  plaster: 0x6d6155,
  flagstone: 0x413b36,
  soot: 0x1a1512,
  iron: 0x2e2b28,
  brass: 0xb08d4a,
  emberCore: 0xff6a1e,
  lampFlame: 0xffb457,
  lightning: 0xbcd2ff,
  paper: 0xd9cdb2,
};

export const LIGHTING = {
  ambientColour: 0x2a2320,
  ambientIntensity: 0.5,
  fireColour: 0xff8f45,
  fireIntensity: 9.5,
  fireDistance: 13.0,
  fireHeight: 0.52,
  /** Firelight never sits still; these drive the flicker. */
  flickerSpeed: 7.5,
  flickerDepth: 0.32,
  lampColour: 0xffbe6b,
  lampIntensity: 2.6,
  lampDistance: 6.5,
  fogColour: 0x0a0908,
  fogNear: 5.2,
  fogFar: 26.0,
};

export const STORM = {
  /** Seconds between lightning flashes, randomised within this range. */
  flashIntervalMin: 7.0,
  flashIntervalMax: 21.0,
  flashIntensity: 1.5,
  flashDurationMs: 190,
  /** Thunder trails the flash; the storm is close but not overhead. */
  thunderDelayMinMs: 900,
  thunderDelayMaxMs: 2600,
  shutterRattleChance: 0.55,
};

export const PLAYER = {
  eyeHeight: 1.62,
  walkSpeed: 2.15,
  runMultiplier: 1.7,
  bodyRadius: 0.28,
  /** Head-bob keeps the flagstones feeling like a floor rather than a plane. */
  bobFrequency: 8.4,
  bobAmplitude: 0.028,
  lookSensitivity: 0.0022,
  /** Arrow-key looking, for visitors who never take pointer lock. */
  turnSpeed: 1.55,
  touchLookSensitivity: 0.0038,
  pitchLimit: Math.PI / 2 - 0.08,
  startPosition: { x: -2.85, z: 1.75 },
  startYaw: -1.34,
};

export const INTERACTION = {
  maxDistance: 3.1,
  /**
   * Aim is angular rather than pixel-exact: the hotspot nearest the centre of
   * view within this cone is the focused one. Pixel-hunting a 2cm thimble in a
   * dark room is not an interaction anybody enjoys.
   */
  aimConeDegrees: 13,
  /** Hotspot markers pulse so they read as findable without being labelled. */
  pulseSpeed: 2.2,
  markerRadius: 0.07,
  markerColour: 0xffd9a0,
};

/**
 * The findable objects. Every line of `body` is canon from Book One; the
 * fault beneath the bar is the counter-ledger itself and opens to its 1603
 * contents, with a note on what it goes on to hold.
 */
export const HOTSPOTS = [
  {
    id: 'thimble',
    label: 'A brass thimble',
    position: { x: BAR.x + 0.16, y: BAR.height + 0.055, z: BAR.z - 1.5 },
    body: [
      'Tom Fletcher’s mother’s. He leaves it on the counter the night he signs, and the wager it stands against is three words long.',
      'Till I’m back.',
      'Maggie cuts his notch before dawn — the only notch she ever cuts early, and she never cuts one early again.',
    ],
  },
  {
    id: 'fault',
    label: 'The fault beneath the bar',
    position: { x: BAR.x + 0.1, y: BAR.height - 0.28, z: BAR.z + BAR.faultOffsetZ },
    body: [
      'A narrow fault in the old oak where spilled ale never reaches. Merchants do not think to search a tavern, because merchants do not believe taverns remember.',
      'Tonight it holds the notches — one for every boy the sea did not give back — and, from this night, Matthew Bell’s confession, blood-marked, his full name on the outside in Arthur’s hand.',
      'In time it takes Daniel Vale’s true copy of Amboyna, laid beside Bell’s page and not behind it; then Maria’s packet; then fourteen years of letters tied with sail-twine, from a man who thought nobody was catching them.',
    ],
  },
  {
    id: 'centre-table',
    label: 'The centre table',
    position: { x: CENTRE_TABLE.x, y: CENTRE_TABLE.height + 0.03, z: CENTRE_TABLE.z },
    body: [
      'The room reasons its way to the truth across this table: the wind arithmetic, the practised underhand grip, the pale pine dust in a boot welt.',
      'Matthew Bell is carried in from the breaking shed and dies on it, having said one name and one word.',
      'Anne. And no.',
    ],
  },
  {
    id: 'barnaby-stool',
    label: 'The stool nearest the fire',
    position: { x: 3.15, y: STOOL.height + 0.02, z: 0.9 },
    body: [
      'Barnaby Gale’s, and he has a graveyard cough and knows exactly what it is. Money cannot buy a dying witness; his observation about the boots is what breaks Silas Rook.',
      'He is dead by Whitsun 1604, exactly as he said he would be. The stool stays empty eight years by unspoken treaty.',
      'In 1612 Tom comes home hardened and sits on it unasked, and the room lets him, and both of those things mean something.',
    ],
  },
  {
    id: 'door',
    label: 'The door',
    position: { x: DOOR.x + 0.24, y: 1.15, z: DOOR.z },
    body: [
      'Silas Rook kicks it in out of a three-day gale, dragging a blood-soaked woman by the arm and calling her a murderer.',
      'Tom Fletcher, twenty-two years old and four hours into owning a Company contract, puts himself between the room and the door. He takes a backhand across the face for it. He stays.',
      'Ned Hawkins states the water-law that decides the night: she came here over water, so she is owed a landing.',
    ],
  },
  {
    id: 'mallet',
    label: 'A bung mallet',
    position: { x: BAR.x + 0.14, y: BAR.height + 0.04, z: BAR.z + 0.75 },
    body: [
      'Maggie’s, kept under the counter, never once in thirty years called a weapon.',
      'It is a cooper’s tool in the hand of a woman who knows to an ounce what it can crack.',
    ],
  },
  {
    id: 'genever',
    label: 'A stone bottle',
    position: { x: BAR.x + 0.2, y: BAR.height + 0.09, z: BAR.z + 1.5 },
    body: [
      'Hendricks the waterman calls it Dutch physic and hands it round like medicine, which tonight it is.',
      'He gives the room its thesis while he pours: a room can beat a bully, and no room has ever stood up to a paper.',
      'In 1626 Carter pours the last of it onto these flagstones for the dead at Amboyna, and nobody in the house asks for it by name again for a generation.',
    ],
  },
];
