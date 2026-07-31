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
   * sawn pine — which is where the pale dust in Silas Rook's boot welt comes
   * from, and how the room proves he was in it.
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
 * across, and a taproom with twelve men in it would have had tallow burning on
 * every table. Each is a real object with a real small light on it.
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
 * outside. These are the four places worth standing.
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
    id: 'gibbet',
    label: 'The gibbet, downriver',
    reach: 26,
    position: { x: EXTERIOR.gibbetX + 0.6, y: 0.1, z: EXTERIOR.gibbetZ },
    body: [
      'Admiralty ground. Pirates and mutineers were hanged at the low-water mark and left through three tides, so that everyone coming up the river on the flood had to pass them.',
      'It is real and it was in use in 1603 — but not here. The site of Execution Dock is disputed between three riverside houses, and Rocque’s map of 1746 puts Execution Dock Stairs several hundred yards west, down toward King Henry’s Stairs. So it stands where you see it: downriver, at the edge of sight.',
      'The cage is empty. The house has never needed a body on the page to make its point about what the river is for.',
    ],
  },
  {
    id: 'shed',
    label: 'The breaking shed',
    reach: 9,
    position: { x: EXTERIOR.shedX + 1.4, y: -0.95, z: EXTERIOR.shedZ - 1.1 },
    body: [
      'A ship-breaking shed: hulls come up the mud and are taken to pieces here, and the pine comes out pale and dusty and goes off to be something else.',
      'This is where Matthew Bell is caught. Silas Rook does it under this roof, out of the rain and out of the wind, in a quiet nobody on the Wall hears over a three-day gale — which is the whole of Arthur’s wind arithmetic, and the reason the room believes there was no scream to hear.',
      'And it is how they have him. Carter finds pale pine dust in the welt of Rook’s boot, and there is nowhere else on this reach it could have come from. A man may lie. Sawdust does not.',
    ],
  },
  {
    id: 'stairs',
    label: 'Pelican Stairs',
    position: { x: EXTERIOR.stairRunStart - 0.35, y: 1.02, z: DOOR.z },
    body: [
      'The tavern’s own stairs, and named for it. This house was the Pelican for its first centuries before it was the Devil’s Tavern and then the Prospect of Whitby, and the stairs beside it took the old name and kept it after the sign changed.',
      'Watermen work them at every state of the tide. Maria de Sousa goes down them in the dark on the night of the storm, over the lean-to roof and barefoot, to a timber boat and a Dutchman who asks her nothing.',
      'At low water the mud below is walkable. At high water none of it is there at all.',
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
