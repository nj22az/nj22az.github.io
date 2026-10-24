/**
 * Every constant for the Pelican scene. Nothing numeric or textual that
 * describes the room belongs anywhere else in this directory.
 *
 * The room is the Pelican's working taproom on the night of the storm, 1603:
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
  length: 3.9,
  height: 0.98,
  depth: 0.62,
  topThickness: 0.075,
  x: -ROOM.width / 2 + 0.62,
  z: 0.95,
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

/** Loose stools placed around the working taproom; no symbolic seating plan. */
export const STOOL = {
  seatRadius: 0.155,
  seatThickness: 0.05,
  height: 0.52,
  legInset: 0.09,
  legRadius: 0.021,
};

/**
 * Stool placements. `barnaby` marks the stool nearest the fire — empty by
 * unspoken habit from 1604 until Tom sits on it in 1612.
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

/**
 * Standing barrels. The first one used to sit at x -3.95, z -2.35 — squarely
 * in the doorway, so the view out of the door was a barrel lid. They stand
 * against the walls now, clear of the threshold.
 */
export const BARREL_PLACEMENTS = [
  { x: -2.6, z: -2.66, rotation: 0.2 },
  { x: -ROOM.width / 2 + 0.55, z: 2.55, rotation: -0.3 },
  { x: 2.4, z: -2.5, rotation: 0.9 },
];

export const WINDOWS = [
  { x: -1.8, z: ROOM.depth / 2, width: 0.92, height: 0.78, sillHeight: 1.14 },
  { x: 1.9, z: ROOM.depth / 2, width: 0.92, height: 0.78, sillHeight: 1.14 },
];

export const DOOR = {
  x: -ROOM.width / 2,
  z: -2.25,
  width: 1.3,
  height: 1.94,
};

/**
 * Outside the door: the alley, Pelican Stairs, the foreshore at low water and
 * the river beyond.
 *
 * Grounding — the Prospect of Whitby was the Pelican for its first centuries,
 * and Pelican Stairs beside it are named for the tavern and still carry the
 * name. The stairs and the foreshore below them are therefore literally this
 * house's own ground.
 *
 * Execution Dock is a different matter. It was a real Wapping institution and
 * in use in 1603, but its site is disputed and Rocque's 1746 map puts
 * Execution Dock Stairs several hundred yards west, down toward King Henry's
 * Stairs. So the gibbet here stands well downriver, at the edge of sight, and
 * the scene never claims it stood at this door.
 */
export const EXTERIOR = {
  /** The alley beside the tavern, running from the door to the stairhead. */
  alleyWidth: 2.5,
  alleyLength: 5.4,
  stairheadX: -9.9,
  /** Pelican Stairs: worn timber and stone down to the foreshore. */
  stairTop: 0.0,
  stairBottom: -2.35,
  stairRunStart: -9.9,
  stairRunEnd: -13.2,
  stairCount: 11,
  stairWidth: 2.1,
  /** The foreshore, uncovered at low water, sloping into the river. */
  foreshoreFar: -34.0,
  foreshoreSlope: 0.045,
  waterLevel: -3.5,
  /**
   * The ship-breaking shed up the foreshore. Roofed, open-sided, stacked with
   * sawn pine. Pale dust from this work later becomes one ordinary material
   * detail that makes Rook's account harder to believe; it is not a courtroom
   * exhibit or a single proof of guilt.
   */
  shedX: -15.4,
  shedZ: 5.2,
  shedWidth: 6.4,
  shedDepth: 5.0,
  shedHeight: 3.2,
  /** The gibbet, downriver and deliberately distant. */
  gibbetX: -24.0,
  gibbetZ: -21.0,
  gibbetHeight: 4.3,
  /** Lighters and a wherry drawn up on the mud. */
  moorings: [
    { x: -17.5, z: 6.5, rotation: 0.35, length: 7.4 },
    { x: -23.0, z: -2.0, rotation: -0.22, length: 8.8 },
    { x: -15.2, z: -9.5, rotation: 0.9, length: 5.2 },
  ],
  /** The far bank, a smear of roofs and one or two lights. */
  farBankDistance: -78.0,
};

export const RAIN = {
  count: 2600,
  areaWidth: 46,
  areaDepth: 46,
  topHeight: 16,
  fallSpeed: 15.5,
  slant: 0.34,
  colour: 0x9fb4c8,
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
  river: 0x121a20,
  mud: 0x2f2b25,
  nightSky: 0x0d1116,
  wetTimber: 0x241c15,
  emberCore: 0xff6a1e,
  lampFlame: 0xffb457,
  lightning: 0xbcd2ff,
  paper: 0xd9cdb2,
  panelOak: 0x5b4127,
  pewter: 0x9497a0,
  pottery: 0x8a6a48,
  greenGlass: 0x3f5344,
  driedHerb: 0x5d5a34,
  smokedHam: 0x6b3a2c,
  rush: 0x7a683f,
  caskOak: 0x3a2a1a,
  ale: 0x9c5514,
  aleGlow: 0x6d2f05,
  foam: 0xf0e3c8,
  aleStream: 0xc87d24,
  spilledAle: 0x4a2a10,
};

/**
 * The fitting-out of the taproom — the things that make it a taproom rather
 * than a room with a table in it. Wainscot to chair height, a back-bar the
 * drinker reads across the counter, settles, posts, goods hung at head height.
 */
export const TAVERN = {
  wainscotHeight: 1.16,
  panelWidth: 0.52,
  /** Shelf heights on the back-bar dresser, bottom to top. */
  backBarShelfHeights: [0.66, 1.06, 1.46, 1.82],
  backBarItemsPerShelf: 10,
  /** The pot-board rail over the counter and the tankards hung from it. */
  potRailHeight: 1.86,
  hangingTankards: 11,
  settles: [
    { x: HEARTH.x - 1.22, z: HEARTH.z + 1.72, rotation: -Math.PI / 2, length: 2.0 },
    { x: 0.2, z: -ROOM.depth / 2 + 0.5, rotation: 0, length: 2.6 },
    { x: 3.2, z: ROOM.depth / 2 - 0.52, rotation: Math.PI, length: 1.9 },
  ],
  sideTables: [
    { x: 2.7, z: -1.85, rotation: 0.3, width: 1.02, depth: 0.72 },
    { x: -1.05, z: -2.25, rotation: -0.18, width: 0.9, depth: 0.66 },
  ],
  posts: [{ x: -0.5, z: -1.15 }, { x: 1.95, z: 1.75 }],
  herbBunches: [
    { x: 0.9, z: -2.55 }, { x: 1.55, z: -2.5 }, { x: 2.2, z: -2.58 },
    { x: -2.1, z: 2.6 }, { x: -1.5, z: 2.55 },
  ],
  ham: { x: 3.5, z: -1.5 },
  /**
   * Rushes strewn on the flagstones. Instanced, because a floor only reads as
   * strewn at a few hundred pieces and a few hundred draw calls would cost the
   * scene its frame rate on a phone.
   */
  rushCount: 420,
  rushLengthMin: 0.06,
  rushLengthMax: 0.17,
  rushWidth: 0.007,
  rushHeight: 0.005,
};

export const LIGHTING = {
  ambientColour: 0x2a2320,
  ambientIntensity: 0.82,
  fireColour: 0xff8f45,
  fireIntensity: 13.5,
  fireDistance: 15.5,
  fireHeight: 0.52,
  /** Firelight never sits still; these drive the flicker. */
  flickerSpeed: 7.5,
  flickerDepth: 0.32,
  lampColour: 0xffbe6b,
  lampIntensity: 5.6,
  lampDistance: 7.6,
  fogColour: 0x0a0908,
  /** Outside, the horizon is storm-lit rather than black. */
  skyColour: 0x1b242c,
  fogNear: 5.2,
  fogFar: 26.0,
  /**
   * Bounce off the plaster and the boards. Warm from above because everything
   * above head height in this room has firelight on it, dark below because the
   * floor is wet flagstone and gives almost nothing back.
   */
  indoorBounceSky: 0x63401f,
  indoorBounceGround: 0x18120e,
  indoorBounceIntensity: 0.92,
  /**
   * The storm sky. Deliberately faint: a hemisphere light reaches everywhere,
   * and any real amount of it turns the beams and the counter-top the colour of
   * daylight. The taproom must stay firelit, so the night gets its strength
   * from the two distance-limited lamps below instead.
   */
  nightSkyColour: 0x3d4a5a,
  nightSkyGround: 0x0a0c0e,
  nightSkyIntensity: 0.15,
  /**
   * Sky-glow on the mud and the water. Walls do not stop light in a renderer,
   * so these two are placed and range-limited such that their reach ends short
   * of the taproom's outer wall — otherwise cold river light lands on the
   * counter-top and the room stops reading as a firelit bar.
   */
  riverGlowColour: 0x8aa8cd,
  riverGlowIntensity: 200,
  riverGlowDistance: 40,
  riverGlowPosition: { x: -46, y: 13, z: -4 },
  moonColour: 0x9fb6d4,
  moonIntensity: 30,
  moonDistance: 15,
  moonPosition: { x: -19.5, y: 7, z: -9 },
  /**
   * The river and the mud carry a little emissive of their own. A hemisphere
   * or directional light strong enough to read across 150 m of water would
   * also land on the counter-top, and emissive belongs to the material, so it
   * cannot leak through a wall the way a light does.
   */
  riverEmissive: 0x1c2c3a,
  riverEmissiveIntensity: 0.62,
  mudEmissive: 0x1b1a19,
  mudEmissiveIntensity: 0.4,
  /** The near foreshore, between the stairs and the mud. Same range rule. */
  foreshoreGlowColour: 0x7d97b8,
  foreshoreGlowIntensity: 16,
  foreshoreGlowDistance: 8,
  foreshoreGlowPosition: { x: -12.5, y: 4.6, z: -2.5 },
};

/**
 * Candles and a lantern. A single hearth cannot light a room nine metres
 * across, and a busy storm-night taproom needs tallow burning on the tables.
 * Each is a real object with a real small light on it.
 */
export const CANDLES = [
  { x: CENTRE_TABLE.x - 0.72, y: CENTRE_TABLE.height, z: CENTRE_TABLE.z - 0.26, intensity: 2.4, distance: 4.6 },
  { x: CENTRE_TABLE.x + 0.78, y: CENTRE_TABLE.height, z: CENTRE_TABLE.z + 0.2, intensity: 2.0, distance: 4.2 },
  { x: -3.2, y: 1.02, z: -2.6, intensity: 1.6, distance: 3.4 },
  { x: 3.05, y: 1.06, z: 2.35, intensity: 1.8, distance: 3.8 },
];

/** Two lanterns outside: one in the alley, one left burning in the shed. */
export const ALLEY_LANTERN = {
  x: -6.2, y: 2.05, z: -3.35, intensity: 4.2, distance: 7.5,
};

export const SHED_LANTERN = {
  x: EXTERIOR.shedX - 1.4, y: EXTERIOR.stairBottom + 0.7, z: EXTERIOR.shedZ - 0.2,
  intensity: 9.5, distance: 13.0,
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
  /** How far the visitor may wander out onto the mud before the river stops them. */
  foreshoreLimitX: -30.0,
  startYaw: -1.13,
  startPitch: -0.22,
};

/**
 * Somewhere to jump to. A 1.3-metre doorway is a hard thing to steer a phone
 * through, and a visitor who cannot find the way out never learns there is an
 * outside. These are the places worth standing.
 */
export const PLACES = [
  { id: 'taproom', label: 'The taproom', x: -2.4, z: -1.95, yaw: 2.86, pitch: -0.07 },
  { id: 'bar', label: 'The bar', x: -2.05, z: -0.3, yaw: 1.5708, pitch: -0.26 },
  { id: 'door', label: 'The door', x: -2.9, z: -2.25, yaw: 1.57, pitch: -0.19 },
  { id: 'stairs', label: 'Pelican Stairs', x: -8.6, z: -2.25, yaw: 1.57, pitch: -0.2 },
  { id: 'foreshore', label: 'The foreshore', x: -16.5, z: -3.0, yaw: 2.25, pitch: -0.05 },
  { id: 'downriver', label: 'Downriver', x: -19.5, z: -12.5, yaw: 0.51, pitch: 0.06 },
  { id: 'shed', label: 'The breaking shed', x: -19.5, z: 5.2, yaw: -1.37, pitch: 0.01 },
];

/**
 * The tap. A cask on a stillage behind the counter with its spout over the
 * boards, so a pint can be drawn from the customer's side without anybody
 * having to get behind the bar.
 */
export const SERVING = {
  tapX: BAR.x + 0.1,
  tapY: BAR.height + 0.28,
  tapZ: BAR.z - 1.25,
  /** How fast the tankard fills, in tankards per second. */
  pourRate: 0.44,
  reach: 2.6,
  /** A pint pot: about 0.57 litres to the brim, which fixes these two. */
  tankardRadius: 0.047,
  tankardHeight: 0.125,
  tankardWall: 0.006,
  /** How much head a full-tilt pour throws, in metres. */
  headMax: 0.02,
  headBuildRate: 1.6,
  headSettleRate: 0.28,
  /** Drawn pints stand along the counter; the oldest goes to the scullery. */
  maxOnCounter: 6,
  counterSlotSpacing: 0.17,
  counterFirstSlot: 0.24,
  /**
   * The ale is lit from inside. In a room this dark a tankard filling at the
   * far end of a counter is a few dozen pixels of brown against brown, and the
   * one thing the visitor must be able to see is whether it is filling — so
   * the ale glows, and a small light over the tap comes up with the level.
   */
  aleEmissiveIntensity: 0.62,
  foamEmissiveIntensity: 0.5,
  tapLightColour: 0xffa63c,
  tapLightMax: 1.5,
  tapLightDistance: 1.6,
};

export const INTERACTION = {
  /** Default reach. Individual hotspots may set their own `reach`. */
  maxDistance: 4.2,
  /**
   * Aim is angular rather than pixel-exact: the hotspot nearest the centre of
   * view within this cone is the focused one. Pixel-hunting a 2cm thimble in a
   * dark room is not an interaction anybody enjoys.
   */
  aimConeDegrees: 16,
  /** Hotspot markers pulse so they read as findable without being labelled. */
  pulseSpeed: 2.2,
  markerRadius: 0.07,
  markerColour: 0xffd9a0,
};

/**
 * The findable objects are physical details from Book One. Their cards describe
 * what the characters encounter; they do not turn the taproom into a tribunal
 * or assign any object the role of decisive evidence.
 */
/**
 * How the frame is put together. Bloom thresholds are set so only the actual
 * light sources bloom — flames, embers, the lantern, lit ale — and lit oak
 * never does, because a tavern full of glowing furniture reads as fog.
 */
export const RENDER = {
  toneMappingExposure: 2.05,
  /**
   * The composer works on linear values before tone mapping, so the threshold
   * has to sit above the exposure or ordinary lit oak blooms and the room
   * goes milky. Only flames, embers, the lantern and lit ale get past 3.4.
   */
  bloomStrength: 0.2,
  bloomRadius: 0.24,
  bloomThreshold: 3.4,
};

export const HOTSPOTS = [
  {
    id: 'thimble',
    label: 'A brass thimble',
    position: { x: BAR.x + 0.16, y: BAR.height + 0.055, z: BAR.z - 1.5 },
    body: [
      'Tom Fletcher’s mother’s. He leaves it on the counter the night he signs, and the wager it stands against is three words long.',
      'Till I’m back.',
      'Before dawn Maggie cuts his notch early — a private act of fear she never repeats, not a judgement on whether he will return.',
    ],
    chapter: {
      id: '01-1603-the-boy-who-signed', title: 'The Boy Who Signed', kicker: 'Chapter One', year: '1603',
    },
  },
  {
    id: 'fault',
    label: 'The fault beneath the bar',
    position: { x: BAR.x + 0.1, y: BAR.height - 0.28, z: BAR.z + BAR.faultOffsetZ },
    body: [
      'A narrow dry fault in the old oak. Maggie uses it because papers hidden there survive spilled ale, damp hands and casual searches.',
      'After this night it holds Matthew Bell’s page. Over the years other papers and small objects join it because somebody needs a safe place to keep them.',
      'It is storage before it becomes history: the ordinary gap where Maggie keeps what the official account has no reason to preserve.',
    ],
    chapter: {
      id: '21-1611-the-counter-ledger', title: 'The Return', kicker: 'Chapter Four', year: '1603–1612',
    },
  },
  {
    id: 'centre-table',
    label: 'The centre table',
    position: { x: CENTRE_TABLE.x, y: CENTRE_TABLE.height + 0.03, z: CENTRE_TABLE.z },
    body: [
      'Most nights it carries cups, elbows and whatever Maggie needs out of the way. On this night she has it cleared because somebody is bleeding.',
      'Rook’s story begins to fail around it in scraps: timing, wet clothing, a knife held from habit, pale yard dust where it should not be. No single detail settles anything.',
      'Matthew Bell is carried in from the breaking shed and dies here after saying one name and one word: Anne. And no.',
    ],
    chapter: {
      id: '01-1603-the-boy-who-signed', title: 'The Boy Who Signed', kicker: 'Chapter One', year: '1603',
    },
  },
  {
    id: 'barnaby-stool',
    label: 'The stool nearest the fire',
    position: { x: 3.15, y: STOOL.height + 0.02, z: 0.9 },
    body: [
      'Barnaby Gale sits here because the fire helps his cough. From the hearth he notices one small physical detail the healthier men have ignored.',
      'He is dead by Whitsun 1604. The stool stays empty for years because regulars fall into habits around the places dead men used to occupy.',
      'In 1612 Tom comes home hardened and sits there unasked. Nobody moves him.',
    ],
    chapter: {
      id: '01-1603-the-boy-who-signed', title: 'The Boy Who Signed', kicker: 'Chapter One', year: '1603',
    },
  },
  {
    id: 'door',
    label: 'The door',
    position: { x: DOOR.x + 0.24, y: 1.15, z: DOOR.z },
    body: [
      'Silas Rook comes through it out of a three-day gale with a blood-soaked woman in his grip and a story several people initially believe.',
      'Tom Fletcher, twenty-two and carrying the Company contract he collected that afternoon, steps between Rook and Maria when Rook hurts her again. Tom does not yet know whether she is innocent.',
      'Ned Hawkins is thinking about the river stairs, the weather and what happens if anybody tries to drag a frightened person back into the dark. His instinct is practical, not legal.',
    ],
    chapter: {
      id: '01-1603-the-boy-who-signed', title: 'The Boy Who Signed', kicker: 'Chapter One', year: '1603',
    },
  },
  {
    id: 'mallet',
    label: 'A bung mallet',
    position: { x: BAR.x + 0.14, y: BAR.height + 0.04, z: BAR.z + 0.75 },
    body: [
      'Maggie’s, kept under the counter and used for casks.',
      'When violence enters her house she does what a keeper does first: protects the room, the furniture and the people who cannot protect themselves.',
    ],
    chapter: {
      id: '05-1635-last-orders', title: 'Last Orders', kicker: 'Epilogue', year: '1635',
    },
  },
  {
    id: 'gibbet',
    label: 'The gibbet, downriver',
    reach: 26,
    position: { x: EXTERIOR.gibbetX + 0.6, y: 0.1, z: EXTERIOR.gibbetZ },
    body: [
      'Admiralty ground. Pirates and mutineers were hanged at the low-water mark and left through three tides, so vessels coming upriver passed the bodies.',
      'It was real and in use in 1603 — but not at this door. The site of Execution Dock is disputed, and Rocque’s 1746 map puts Execution Dock Stairs several hundred yards west, down toward King Henry’s Stairs.',
      'The reconstruction therefore keeps the gibbet distant and empty rather than pretending the Pelican owned a spectacle that belonged to the wider reach.',
    ],
  },
  {
    id: 'shed',
    label: 'The breaking shed',
    reach: 9,
    position: { x: EXTERIOR.shedX + 1.4, y: -0.95, z: EXTERIOR.shedZ - 1.1 },
    body: [
      'A working ship-breaking shed: hulls come up the mud and are taken apart under cover. The sawn pine leaves a pale dust on boots and clothing.',
      'Matthew Bell is attacked here, out of the worst of the wind. Maria later struggles to make the people in the Pelican understand that another injured person is still nearby.',
      'Dust from the shed is one of several ordinary details that makes Rook’s neat account harder to inhabit. By the time people stop helping him, they still do not have a formal verdict — and he gets away.',
    ],
    chapter: {
      id: '01-1603-the-boy-who-signed', title: 'The Boy Who Signed', kicker: 'Chapter One', year: '1603',
    },
  },
  {
    id: 'stairs',
    label: 'Pelican Stairs',
    position: { x: EXTERIOR.stairRunStart - 0.35, y: 1.02, z: DOOR.z },
    body: [
      'The tavern’s own stairs, named for the Pelican and still carrying the old name after the house later changes its sign.',
      'Watermen work them at every state of the tide. Maria Mori goes down them in the dark after the storm night, barefoot from the roof, toward a timber boat and a Dutchman who leaves the choice to her.',
      'At low water the mud below is walkable. At high water none of it is there at all.',
    ],
    chapter: {
      id: '06-1603-the-soot-and-the-roof', title: 'What the Women Did', kicker: 'Chapter Two', year: '1603',
    },
  },
  {
    id: 'genever',
    label: 'A stone bottle',
    position: { x: BAR.x + 0.2, y: BAR.height + 0.09, z: BAR.z + 1.5 },
    body: [
      'Hendricks the waterman calls it Dutch physic and passes it like medicine, which on this night is near enough.',
      'He helps with fragments of language and later gives Tom a practical warning about the kind of employer Rook can find after Wapping. He does not explain the meaning of the whole book to the room.',
      'In 1626 Carter pours genever onto these flagstones for the dead at Amboyna. By then the bottle carries memories nobody in 1603 could have predicted.',
    ],
    chapter: {
      id: '02-1626-the-man-who-came-back-wrong', title: 'The Man Who Came Back Wrong', kicker: 'Chapter Twelve', year: '1626',
    },
  },
];
