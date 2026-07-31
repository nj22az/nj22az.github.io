/**
 * The shell of the taproom: flagstones, plaster, the low ceiling and its
 * beams, the shuttered windows and the door Rook comes through.
 *
 * Walls with openings are assembled from box segments rather than cut, which
 * keeps the geometry cheap and the seams invisible at this scale.
 */

import * as THREE from '../vendor/three.module.min.js';
import { ROOM, WINDOWS, DOOR, PALETTE } from './config.js';
import {
  createOakTexture,
  createFlagstoneTexture,
  createPlasterTexture,
  createSootTexture,
} from './textures.js';

function addBox(parent, { width, height, depth, x, y, z, material, rotationY = 0 }) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), material);
  mesh.position.set(x, y, z);
  mesh.rotation.y = rotationY;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}

/**
 * A wall running along X at a fixed Z, with rectangular openings punched out
 * of it. Openings are given as {centre, width, bottom, top} in wall space.
 */
function buildWallWithOpenings(parent, { position, rotationY, length, material, openings }) {
  const group = new THREE.Group();
  const { ceilingHeight, wallThickness } = ROOM;
  const sorted = [...openings].sort((a, b) => a.centre - b.centre);
  let cursor = -length / 2;

  const addPier = (from, to) => {
    if (to - from < 0.01) return;
    addBox(group, {
      width: to - from,
      height: ceilingHeight,
      depth: wallThickness,
      x: (from + to) / 2,
      y: ceilingHeight / 2,
      z: 0,
      material,
    });
  };

  sorted.forEach((opening) => {
    const left = opening.centre - opening.width / 2;
    const right = opening.centre + opening.width / 2;
    addPier(cursor, left);
    if (opening.bottom > 0.01) {
      addBox(group, {
        width: opening.width,
        height: opening.bottom,
        depth: wallThickness,
        x: opening.centre,
        y: opening.bottom / 2,
        z: 0,
        material,
      });
    }
    if (opening.top < ceilingHeight - 0.01) {
      addBox(group, {
        width: opening.width,
        height: ceilingHeight - opening.top,
        depth: wallThickness,
        x: opening.centre,
        y: (ceilingHeight + opening.top) / 2,
        z: 0,
        material,
      });
    }
    cursor = right;
  });
  addPier(cursor, length / 2);

  // A rotated group is translated after its children are rotated, so the
  // position given here is plain world space and the opening centres are in
  // the wall's own left-to-right axis.
  group.position.set(position.x, 0, position.z);
  group.rotation.y = rotationY;
  parent.add(group);
  return group;
}

export function buildRoom(scene) {
  const room = new THREE.Group();
  room.name = 'room';

  const flagstoneMap = createFlagstoneTexture({ repeat: 5 });
  const plasterMap = createPlasterTexture({ repeat: 3 });
  const oakMap = createOakTexture({ repeat: 2 });
  const sootMap = createSootTexture({ repeat: 2 });

  const flagstoneMaterial = new THREE.MeshStandardMaterial({
    map: flagstoneMap, color: PALETTE.flagstone, roughness: 0.94, metalness: 0.0,
  });
  const plasterMaterial = new THREE.MeshStandardMaterial({
    map: plasterMap, color: PALETTE.plaster, roughness: 0.97, metalness: 0.0,
  });
  const oakMaterial = new THREE.MeshStandardMaterial({
    map: oakMap, color: PALETTE.oakMid, roughness: 0.82, metalness: 0.0,
  });
  const ceilingMaterial = new THREE.MeshStandardMaterial({
    map: sootMap, color: PALETTE.soot, roughness: 0.99, metalness: 0.0,
  });

  // --- floor and ceiling ---------------------------------------------------
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.width, ROOM.depth),
    flagstoneMaterial,
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  room.add(floor);

  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.width, ROOM.depth),
    ceilingMaterial,
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = ROOM.ceilingHeight;
  room.add(ceiling);

  // --- walls ---------------------------------------------------------------
  // Window wall (+Z), two shuttered openings.
  buildWallWithOpenings(room, {
    position: { x: 0, z: ROOM.depth / 2 },
    rotationY: 0,
    length: ROOM.width,
    material: plasterMaterial,
    openings: WINDOWS.map((w) => ({
      centre: w.x,
      width: w.width,
      bottom: w.sillHeight,
      top: w.sillHeight + w.height,
    })),
  });

  // Back wall (-Z), solid.
  buildWallWithOpenings(room, {
    position: { x: 0, z: -ROOM.depth / 2 },
    rotationY: 0,
    length: ROOM.width,
    material: plasterMaterial,
    openings: [],
  });

  // Door wall (-X). Rotating by +90 degrees maps the wall's local +x onto
  // world -z, so the door's centre is negated on the way in.
  buildWallWithOpenings(room, {
    position: { x: -ROOM.width / 2, z: 0 },
    rotationY: Math.PI / 2,
    length: ROOM.depth,
    material: plasterMaterial,
    openings: [{ centre: -DOOR.z, width: DOOR.width, bottom: 0, top: DOOR.height }],
  });

  // Hearth wall (+X), solid; the hearth itself is built into it separately.
  buildWallWithOpenings(room, {
    position: { x: ROOM.width / 2, z: 0 },
    rotationY: -Math.PI / 2,
    length: ROOM.depth,
    material: plasterMaterial,
    openings: [],
  });

  // --- ceiling beams -------------------------------------------------------
  const beamSpacing = ROOM.width / (ROOM.beamCount + 1);
  for (let i = 1; i <= ROOM.beamCount; i += 1) {
    addBox(room, {
      width: ROOM.beamWidth,
      height: ROOM.ceilingHeight - ROOM.beamHeight,
      depth: ROOM.depth,
      x: -ROOM.width / 2 + i * beamSpacing,
      y: ROOM.beamHeight + (ROOM.ceilingHeight - ROOM.beamHeight) / 2,
      z: 0,
      material: oakMaterial,
    });
  }
  // The one spine beam running the other way, lower than the rest.
  addBox(room, {
    width: ROOM.width,
    height: ROOM.beamDepth,
    depth: ROOM.beamWidth * 1.3,
    x: 0,
    y: ROOM.beamHeight - ROOM.beamDepth / 2,
    z: -0.9,
    material: oakMaterial,
  });

  // --- shutters, barred against the gale ----------------------------------
  const shutterMaterial = new THREE.MeshStandardMaterial({
    map: oakMap, color: PALETTE.oakDark, roughness: 0.88,
  });
  const shutters = [];
  WINDOWS.forEach((window) => {
    const shutter = addBox(room, {
      width: window.width - 0.03,
      height: window.height - 0.03,
      depth: 0.035,
      x: window.x,
      y: window.sillHeight + window.height / 2,
      z: ROOM.depth / 2 - 0.09,
      material: shutterMaterial,
    });
    // The bar across it.
    addBox(room, {
      width: window.width + 0.16,
      height: 0.07,
      depth: 0.05,
      x: window.x,
      y: window.sillHeight + window.height / 2,
      z: ROOM.depth / 2 - 0.13,
      material: new THREE.MeshStandardMaterial({ color: PALETTE.iron, roughness: 0.7, metalness: 0.45 }),
    });
    shutters.push(shutter);
  });

  // --- the door ------------------------------------------------------------
  const doorMaterial = new THREE.MeshStandardMaterial({
    map: oakMap, color: PALETTE.oakDark, roughness: 0.85,
  });
  // Standing open, because Rook has already been through it and because the
  // alley beyond is where the visitor is meant to be able to go.
  const door = addBox(room, {
    width: 0.055,
    height: DOOR.height - 0.04,
    depth: DOOR.width - 0.03,
    x: DOOR.x + 0.06,
    y: (DOOR.height - 0.04) / 2,
    z: DOOR.z + DOOR.width / 2 + 0.16,
    material: doorMaterial,
    rotationY: -1.15,
  });
  // Iron strap hinges.
  const ironMaterial = new THREE.MeshStandardMaterial({
    color: PALETTE.iron, roughness: 0.62, metalness: 0.55,
  });
  [-0.55, 0.55].forEach((offset) => {
    addBox(room, {
      width: 0.02,
      height: 0.075,
      depth: DOOR.width - 0.1,
      x: DOOR.x + 0.135,
      y: DOOR.height / 2 + offset,
      z: DOOR.z,
      material: ironMaterial,
    });
  });

  scene.add(room);
  return { room, shutters, door, materials: { oakMaterial, ironMaterial, plasterMaterial } };
}
