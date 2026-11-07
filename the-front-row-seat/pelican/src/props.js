/**
 * The small furniture that makes a taproom look inhabited rather than staged:
 * pewter on a shelf, casks racked behind the bar, tankards left where people
 * left them, fire irons, a coil of rope, and the slate Arthur books wagers on.
 *
 * None of it is interactive. All of it is there so that turning round shows
 * you something.
 */

import * as THREE from '../vendor/three.module.min.js';
import { BAR, HEARTH, CENTRE_TABLE, ROOM, PALETTE } from './config.js';
import { createOakTexture } from './textures.js';

const NORMAL_SCALE = new THREE.Vector2(0.85, 0.85);

function cylinder(rTop, rBottom, height, material, segments = 12) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, height, segments), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function box(w, h, d, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/** A shelf of pewter behind the bar, which is where the light gets caught. */
function buildBackShelf(parent, timberMaterial, pewterMaterial) {
  const shelfX = -ROOM.width / 2 + 0.24;
  [1.12, 1.52].forEach((height, tier) => {
    const shelf = box(0.26, 0.04, BAR.length - 0.5, timberMaterial);
    shelf.position.set(shelfX, height, BAR.z);
    parent.add(shelf);

    const count = 9 - tier;
    for (let i = 0; i < count; i += 1) {
      const z = BAR.z - (BAR.length - 1.1) / 2 + (i / (count - 1)) * (BAR.length - 1.1);
      if (tier === 0) {
        const tankard = cylinder(0.038, 0.043, 0.115, pewterMaterial, 10);
        tankard.position.set(shelfX, height + 0.078, z + (Math.random() - 0.5) * 0.05);
        parent.add(tankard);
      } else {
        const plate = cylinder(0.072, 0.072, 0.012, pewterMaterial, 14);
        plate.rotation.x = Math.PI / 2.06;
        plate.position.set(shelfX + 0.04, height + 0.09, z);
        parent.add(plate);
      }
    }
  });
}

/** Casks on a rack, the shop floor of the whole operation. */
function buildCaskRack(parent, timberMaterial, ironMaterial) {
  const rackX = -ROOM.width / 2 + 0.42;
  [-1.05, 0.35, 1.75].forEach((z, index) => {
    const cask = cylinder(0.2, 0.2, 0.62, timberMaterial, 16);
    cask.rotation.z = Math.PI / 2;
    cask.position.set(rackX, 0.42, BAR.z + z);
    parent.add(cask);
    [-0.19, 0.19].forEach((offset) => {
      const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.205, 0.012, 5, 16), ironMaterial);
      hoop.position.set(rackX + offset, 0.42, BAR.z + z);
      hoop.rotation.y = Math.PI / 2;
      parent.add(hoop);
    });
    if (index === 1) {
      const tap = cylinder(0.012, 0.012, 0.1, ironMaterial, 6);
      tap.rotation.z = Math.PI / 2;
      tap.position.set(rackX + 0.24, 0.42, BAR.z + z);
      parent.add(tap);
    }
  });
}

/** Tankards left about on the tables, as they would be at this hour. */
function buildTankards(parent, pewterMaterial) {
  const spots = [
    { x: CENTRE_TABLE.x - 0.35, z: CENTRE_TABLE.z + 0.3, y: CENTRE_TABLE.height },
    { x: CENTRE_TABLE.x + 0.15, z: CENTRE_TABLE.z - 0.31, y: CENTRE_TABLE.height },
    { x: CENTRE_TABLE.x + 0.62, z: CENTRE_TABLE.z + 0.26, y: CENTRE_TABLE.height },
    { x: BAR.x + 0.12, z: BAR.z - 0.9, y: BAR.height },
    { x: BAR.x + 0.18, z: BAR.z + 0.35, y: BAR.height },
  ];
  spots.forEach((spot) => {
    const tankard = cylinder(0.04, 0.046, 0.12, pewterMaterial, 10);
    tankard.position.set(spot.x, spot.y + 0.06, spot.z);
    parent.add(tankard);
    const handle = new THREE.Mesh(
      new THREE.TorusGeometry(0.032, 0.007, 5, 10, Math.PI * 1.1), pewterMaterial,
    );
    handle.position.set(spot.x + 0.05, spot.y + 0.06, spot.z);
    handle.rotation.y = Math.PI / 2;
    parent.add(handle);
  });
}

/** Fire irons and a pot on a crane, at the hearth. */
function buildHearthGear(parent, ironMaterial) {
  const x = HEARTH.x - 0.62;
  [-0.52, -0.42].forEach((offset, index) => {
    const iron = cylinder(0.011, 0.011, 0.9, ironMaterial, 6);
    iron.position.set(x + 0.1, 0.45, HEARTH.z + offset);
    iron.rotation.z = 0.16 + index * 0.05;
    parent.add(iron);
  });

  const crane = cylinder(0.018, 0.018, 0.62, ironMaterial, 6);
  crane.rotation.z = Math.PI / 2;
  crane.position.set(HEARTH.x - 0.34, 1.0, HEARTH.z + 0.3);
  parent.add(crane);

  const pot = cylinder(0.14, 0.11, 0.2, ironMaterial, 14);
  pot.position.set(HEARTH.x - 0.6, 0.82, HEARTH.z + 0.3);
  parent.add(pot);

  const hook = cylinder(0.008, 0.008, 0.14, ironMaterial, 5);
  hook.position.set(HEARTH.x - 0.6, 0.95, HEARTH.z + 0.3);
  parent.add(hook);
}

/** A coil of rope and a stack of sacks, because this is a river house. */
function buildQuayGear(parent, ropeMaterial, sackMaterial) {
  const coil = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.055, 8, 22), ropeMaterial);
  coil.rotation.x = Math.PI / 2;
  coil.position.set(-3.0, 0.055, 2.62);
  coil.castShadow = true;
  parent.add(coil);
  const coil2 = new THREE.Mesh(new THREE.TorusGeometry(0.19, 0.05, 8, 20), ropeMaterial);
  coil2.rotation.x = Math.PI / 2;
  coil2.position.set(-3.0, 0.145, 2.62);
  parent.add(coil2);

  [[-0.2, 0], [0.16, 0.1], [-0.02, 0.42]].forEach(([dx, dz], index) => {
    const sack = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), sackMaterial);
    sack.scale.set(1, 0.78, 0.82);
    sack.position.set(3.5 + dx, 0.18 + index * 0.02, -2.3 + dz);
    sack.rotation.y = index;
    sack.castShadow = true;
    parent.add(sack);
  });
}

/** Arthur's slate. Every wager in the house goes on it, in chalk. */
function buildWagerSlate(parent, slateMaterial) {
  const slate = box(0.03, 0.62, 0.86, slateMaterial);
  slate.position.set(-ROOM.width / 2 + 0.13, 1.42, BAR.z - 2.4);
  parent.add(slate);

  // Chalk: illegible short strokes, because the wagers are not ours to read.
  const chalk = new THREE.MeshBasicMaterial({ color: 0xd8d2c4, transparent: true, opacity: 0.5 });
  for (let row = 0; row < 6; row += 1) {
    const width = 0.14 + Math.random() * 0.4;
    const mark = new THREE.Mesh(new THREE.PlaneGeometry(width, 0.012), chalk);
    mark.position.set(-ROOM.width / 2 + 0.149, 1.65 - row * 0.085, BAR.z - 2.62 + width / 2);
    mark.rotation.y = -Math.PI / 2;
    parent.add(mark);
  }
}

export function buildProps(scene) {
  const props = new THREE.Group();
  props.name = 'props';

  const oakMap = createOakTexture({ seed: 311, repeat: 1, base: '#3a2a1b' });
  const timberMaterial = new THREE.MeshStandardMaterial({
    map: oakMap, normalMap: oakMap.normalMap, normalScale: NORMAL_SCALE, roughnessMap: oakMap.roughnessMap,
    color: PALETTE.oakDark, roughness: 0.84,
  });
  const pewterMaterial = new THREE.MeshStandardMaterial({
    color: 0x8e9199, roughness: 0.34, metalness: 0.82,
  });
  const ironMaterial = new THREE.MeshStandardMaterial({
    color: PALETTE.iron, roughness: 0.55, metalness: 0.62,
  });
  const ropeMaterial = new THREE.MeshStandardMaterial({ color: 0x6b5c3f, roughness: 0.96 });
  const sackMaterial = new THREE.MeshStandardMaterial({ color: 0x554936, roughness: 0.99 });
  const slateMaterial = new THREE.MeshStandardMaterial({ color: 0x22242a, roughness: 0.72 });

  buildBackShelf(props, timberMaterial, pewterMaterial);
  buildCaskRack(props, timberMaterial, ironMaterial);
  buildTankards(props, pewterMaterial);
  buildHearthGear(props, ironMaterial);
  buildQuayGear(props, ropeMaterial, sackMaterial);
  buildWagerSlate(props, slateMaterial);

  scene.add(props);
  return props;
}
