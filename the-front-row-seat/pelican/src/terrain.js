/**
 * Where the ground is, and where the visitor is allowed to stand.
 *
 * The scene is no longer one flat room: there is the taproom floor, the alley
 * outside the door, Pelican Stairs down to the foreshore, and the mud itself
 * sloping into the river. Both the camera height and the walk bounds come
 * from here so they can never disagree.
 */

import { ROOM, DOOR, EXTERIOR, PLAYER } from './config.js';

const STAIR_SPAN = EXTERIOR.stairRunEnd - EXTERIOR.stairRunStart;

/** Ground height under any point, in metres. */
export function groundHeightAt(x) {
  if (x >= EXTERIOR.stairRunStart) return 0;
  if (x <= EXTERIOR.stairRunEnd) {
    // Beyond the stairs the mud falls away toward the water.
    const beyond = EXTERIOR.stairRunEnd - x;
    return Math.max(
      EXTERIOR.waterLevel + 0.05,
      EXTERIOR.stairBottom - beyond * EXTERIOR.foreshoreSlope,
    );
  }
  // On the stairs. Stepped rather than ramped, so the descent is felt.
  const progress = (x - EXTERIOR.stairRunStart) / STAIR_SPAN;
  const step = Math.floor(progress * EXTERIOR.stairCount);
  return (step / EXTERIOR.stairCount) * (EXTERIOR.stairBottom - EXTERIOR.stairTop);
}

/**
 * Walkable rectangles. The visitor must stand inside one of them; the doorway
 * is its own narrow zone so the room and the alley connect only through it.
 */
export const WALK_ZONES = [
  // The taproom.
  {
    name: 'taproom',
    minX: -ROOM.width / 2 + 0.12, maxX: ROOM.width / 2 - 0.12,
    minZ: -ROOM.depth / 2 + 0.12, maxZ: ROOM.depth / 2 - 0.12,
  },
  // The doorway itself.
  {
    name: 'doorway',
    minX: -ROOM.width / 2 - 0.4, maxX: -ROOM.width / 2 + 0.2,
    minZ: DOOR.z - DOOR.width / 2 + 0.22, maxZ: DOOR.z + DOOR.width / 2 - 0.22,
  },
  // The alley running from the door to the stairhead.
  {
    name: 'alley',
    minX: -ROOM.width / 2 - EXTERIOR.alleyLength, maxX: -ROOM.width / 2 - 0.3,
    minZ: DOOR.z - EXTERIOR.alleyWidth / 2, maxZ: DOOR.z + EXTERIOR.alleyWidth / 2,
  },
  // Pelican Stairs.
  {
    name: 'stairs',
    minX: EXTERIOR.stairRunEnd, maxX: EXTERIOR.stairRunStart + 0.4,
    minZ: DOOR.z - EXTERIOR.stairWidth / 2, maxZ: DOOR.z + EXTERIOR.stairWidth / 2,
  },
  // The open foreshore.
  {
    name: 'foreshore',
    minX: PLAYER.foreshoreLimitX, maxX: EXTERIOR.stairRunEnd + 0.3,
    minZ: -22.0, maxZ: 16.0,
  },
];

function distanceToZone(zone, x, z) {
  const dx = Math.max(zone.minX - x, 0, x - zone.maxX);
  const dz = Math.max(zone.minZ - z, 0, z - zone.maxZ);
  return Math.hypot(dx, dz);
}

export function isInsideAnyZone(x, z) {
  return WALK_ZONES.some(
    (zone) => x >= zone.minX && x <= zone.maxX && z >= zone.minZ && z <= zone.maxZ,
  );
}

/**
 * Pull a position back onto the nearest walkable zone. Called only when the
 * visitor has already left every zone, so the nearest one is where they came
 * from in all but pathological cases.
 */
export function clampToZones(position) {
  if (isInsideAnyZone(position.x, position.z)) return;

  let best = WALK_ZONES[0];
  let bestDistance = Infinity;
  WALK_ZONES.forEach((zone) => {
    const distance = distanceToZone(zone, position.x, position.z);
    if (distance < bestDistance) { bestDistance = distance; best = zone; }
  });

  position.x = Math.min(Math.max(position.x, best.minX), best.maxX);
  position.z = Math.min(Math.max(position.z, best.minZ), best.maxZ);
}
