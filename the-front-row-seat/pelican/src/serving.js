/**
 * Drawing a pint.
 *
 * A cask sits on a stillage behind the counter with its tap over the boards.
 * Aim at it and hold to pour: the ale rises, a head builds on it, and if you
 * keep pouring past the brim it goes over the counter and down your leg. Let
 * go and the tankard slides down the bar, and a fresh one comes under the tap.
 *
 * The whole thing is geometry and a level between 0 and 1.
 */

import * as THREE from '../vendor/three.module.min.js';
import { BAR, SERVING, INTERACTION, PALETTE } from './config.js';

const TANKARD_RADIUS = SERVING.tankardRadius;
const TANKARD_HEIGHT = SERVING.tankardHeight;
const WALL = SERVING.tankardWall;

function cylinder(rTop, rBottom, height, material, segments = 14, open = false) {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(rTop, rBottom, height, segments, 1, open), material,
  );
  mesh.castShadow = true;
  return mesh;
}

function buildTankard(pewterMaterial) {
  const tankard = new THREE.Group();
  const body = cylinder(TANKARD_RADIUS, TANKARD_RADIUS * 0.92, TANKARD_HEIGHT, pewterMaterial, 16, true);
  body.position.y = TANKARD_HEIGHT / 2;
  tankard.add(body);
  const base = cylinder(TANKARD_RADIUS * 0.92, TANKARD_RADIUS * 0.92, WALL, pewterMaterial, 16);
  base.position.y = WALL / 2;
  tankard.add(base);
  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.034, 0.0075, 6, 12, Math.PI * 1.15), pewterMaterial,
  );
  handle.position.set(TANKARD_RADIUS + 0.018, TANKARD_HEIGHT * 0.52, 0);
  handle.rotation.y = Math.PI / 2;
  tankard.add(handle);
  return tankard;
}

export function buildServing(scene) {
  const group = new THREE.Group();
  group.name = 'serving';

  const oakMaterial = new THREE.MeshStandardMaterial({
    color: PALETTE.caskOak, roughness: 0.82,
  });
  const ironMaterial = new THREE.MeshStandardMaterial({
    color: PALETTE.iron, roughness: 0.5, metalness: 0.7,
  });
  const pewterMaterial = new THREE.MeshStandardMaterial({
    color: PALETTE.pewter, roughness: 0.28, metalness: 0.86,
  });
  const aleMaterial = new THREE.MeshStandardMaterial({
    color: PALETTE.ale, emissive: PALETTE.aleGlow,
    emissiveIntensity: SERVING.aleEmissiveIntensity,
    roughness: 0.22, metalness: 0.0, transparent: true, opacity: 0.94,
  });
  const foamMaterial = new THREE.MeshStandardMaterial({
    color: PALETTE.foam, emissive: PALETTE.foam,
    emissiveIntensity: SERVING.foamEmissiveIntensity, roughness: 0.95,
  });
  const streamMaterial = new THREE.MeshStandardMaterial({
    color: PALETTE.aleStream, emissive: PALETTE.aleGlow,
    emissiveIntensity: SERVING.aleEmissiveIntensity,
    roughness: 0.15, transparent: true, opacity: 0.82,
  });

  const { tapX, tapY, tapZ } = SERVING;

  // The cask on its stillage, behind the counter.
  const stillage = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.16, 0.7), oakMaterial);
  stillage.position.set(tapX - 0.34, BAR.height + 0.08, tapZ);
  group.add(stillage);

  const cask = cylinder(0.21, 0.21, 0.6, oakMaterial, 18);
  cask.rotation.z = Math.PI / 2;
  cask.position.set(tapX - 0.34, BAR.height + 0.37, tapZ);
  group.add(cask);
  [-0.19, 0.19].forEach((offset) => {
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.215, 0.013, 5, 18), ironMaterial);
    hoop.position.set(tapX - 0.34 + offset, BAR.height + 0.37, tapZ);
    hoop.rotation.y = Math.PI / 2;
    group.add(hoop);
  });

  // The tap: a spout projecting over the counter, with a turned handle.
  const spout = cylinder(0.014, 0.014, 0.3, ironMaterial, 8);
  spout.rotation.z = Math.PI / 2;
  spout.position.set(tapX - 0.16, tapY, tapZ);
  group.add(spout);
  const nozzle = cylinder(0.012, 0.016, 0.05, ironMaterial, 8);
  nozzle.position.set(tapX, tapY - 0.025, tapZ);
  group.add(nozzle);
  const handle = cylinder(0.011, 0.011, 0.11, oakMaterial, 8);
  handle.position.set(tapX - 0.16, tapY + 0.075, tapZ);
  group.add(handle);

  // The tankard under the tap, and the ale and head inside it.
  const tankard = buildTankard(pewterMaterial);
  tankard.position.set(tapX, BAR.height, tapZ - 0.02);
  group.add(tankard);

  const ale = cylinder(TANKARD_RADIUS - WALL, TANKARD_RADIUS - WALL, 1, aleMaterial, 16);
  ale.position.set(tapX, BAR.height, tapZ - 0.02);
  ale.visible = false;
  group.add(ale);

  const foam = cylinder(TANKARD_RADIUS - WALL, TANKARD_RADIUS - WALL, 0.014, foamMaterial, 16);
  foam.position.set(tapX, BAR.height, tapZ - 0.02);
  foam.visible = false;
  group.add(foam);

  const stream = cylinder(0.008, 0.011, 1, streamMaterial, 8);
  stream.visible = false;
  group.add(stream);

  const spill = new THREE.Mesh(
    new THREE.CircleGeometry(0.001, 18),
    new THREE.MeshStandardMaterial({
      color: PALETTE.spilledAle, roughness: 0.2, transparent: true, opacity: 0.8,
    }),
  );
  spill.rotation.x = -Math.PI / 2;
  spill.position.set(tapX + 0.06, BAR.height + 0.004, tapZ - 0.02);
  spill.visible = false;
  group.add(spill);

  // A small light in the tankard's mouth, brought up with the level by the
  // updater, so a filling pint lights its own pewter and the boards under it.
  const tapLight = new THREE.PointLight(
    SERVING.tapLightColour, 0, SERVING.tapLightDistance, 1.4,
  );
  tapLight.position.set(tapX, BAR.height + TANKARD_HEIGHT * 0.6, tapZ - 0.02);
  group.add(tapLight);

  scene.add(group);
  return {
    group, tankard, ale, foam, stream, spill, tapLight, pewterMaterial,
    buildTankard: () => buildTankard(pewterMaterial),
  };
}

/**
 * The pour itself. `isAimed` is angular, matching how hotspots are aimed, so
 * the tap behaves like everything else you can look at.
 */
export function createServing(parts, camera, { onServed, onSpill, onPourChange } = {}) {
  const { tankard, ale, foam, stream, spill, tapLight } = parts;
  const { tapX, tapY, tapZ } = SERVING;

  const cameraPosition = new THREE.Vector3();
  const viewDirection = new THREE.Vector3();
  const toTap = new THREE.Vector3();
  const tapPosition = new THREE.Vector3(tapX, tapY, tapZ);
  const aimCosine = Math.cos(THREE.MathUtils.degToRad(INTERACTION.aimConeDegrees + 4));

  let level = 0;          // 0..1 of the tankard's inside height
  let head = 0;           // foam thickness, 0..1 of HEAD_MAX
  let pouring = false;
  let aimed = false;
  let spilled = 0;
  let served = 0;
  let best = 0;
  const settled = [];     // tankards already drawn, standing along the counter

  const INSIDE_HEIGHT = TANKARD_HEIGHT - WALL - 0.004;
  const HEAD_MAX = SERVING.headMax;

  function reset() {
    level = 0;
    head = 0;
    spilled = 0;
    ale.visible = false;
    foam.visible = false;
    spill.visible = false;
    spill.scale.setScalar(1);
  }

  /** Move the drawn pint down the bar and put a fresh tankard under the tap. */
  function serve() {
    const quality = Math.round(Math.max(0, 1 - spilled * 2.2) * Math.min(1, level / 0.92) * 100);
    served += 1;
    best = Math.max(best, quality);

    const drawn = parts.buildTankard();
    const slot = settled.length % SERVING.maxOnCounter;
    drawn.position.set(
      tapX + 0.02, BAR.height,
      tapZ + SERVING.counterFirstSlot + slot * SERVING.counterSlotSpacing,
    );
    parts.group.add(drawn);

    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(TANKARD_RADIUS - WALL, TANKARD_RADIUS - WALL, INSIDE_HEIGHT * level, 14),
      ale.material,
    );
    body.position.set(0, WALL + (INSIDE_HEIGHT * level) / 2, 0);
    drawn.add(body);
    if (level > 0.15) {
      const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(TANKARD_RADIUS - WALL, TANKARD_RADIUS - WALL, 0.012, 14),
        foam.material,
      );
      cap.position.set(0, WALL + INSIDE_HEIGHT * level + 0.006, 0);
      drawn.add(cap);
    }
    settled.push(drawn);

    // A few along the bar is enough; the oldest goes back to the scullery.
    if (settled.length > SERVING.maxOnCounter) {
      const oldest = settled.shift();
      parts.group.remove(oldest);
    }

    if (onServed) onServed({ quality, served, best });
    reset();
  }

  function startPour() {
    if (!aimed) return false;
    pouring = true;
    if (onPourChange) onPourChange(true);
    return true;
  }

  function stopPour() {
    if (!pouring) return;
    pouring = false;
    stream.visible = false;
    if (onPourChange) onPourChange(false);
    if (level > 0.05) serve();
    else reset();
  }

  function update(delta) {
    camera.getWorldPosition(cameraPosition);
    camera.getWorldDirection(viewDirection);
    toTap.subVectors(tapPosition, cameraPosition);
    const distance = toTap.length();
    toTap.divideScalar(distance || 1);
    aimed = distance < SERVING.reach && toTap.dot(viewDirection) > aimCosine;

    if (pouring) {
      level += SERVING.pourRate * delta;
      if (level > 1) {
        // Over the brim and onto the boards.
        spilled += (level - 1);
        level = 1;
        spill.visible = true;
        spill.scale.setScalar(1 + Math.min(spilled, 0.5) * 260);
        if (onSpill) onSpill(spilled);
      }
      head = Math.min(1, head + delta * SERVING.headBuildRate);
    } else if (head > 0) {
      // The head settles out of the glass when you stop.
      head = Math.max(0, head - delta * SERVING.headSettleRate);
    }

    const aleHeight = INSIDE_HEIGHT * level;
    ale.visible = level > 0.001;
    ale.scale.y = Math.max(0.001, aleHeight);
    ale.position.y = BAR.height + WALL + aleHeight / 2;

    foam.visible = level > 0.05;
    const headHeight = HEAD_MAX * head;
    foam.scale.y = Math.max(0.001, headHeight / 0.014);
    foam.position.y = BAR.height + WALL + aleHeight + headHeight / 2;

    tapLight.intensity = SERVING.tapLightMax * Math.min(1, level * 1.4 + (pouring ? 0.3 : 0));
    tapLight.position.y = BAR.height + WALL + aleHeight + 0.02;

    // The stream, drawn from the nozzle down to whatever level the ale is at.
    if (pouring) {
      const top = tapY - 0.05;
      const bottom = BAR.height + WALL + aleHeight;
      const length = Math.max(0.01, top - bottom);
      stream.visible = true;
      stream.scale.y = length;
      stream.position.set(tapX, bottom + length / 2, tapZ - 0.02);
    }

    return aimed;
  }

  return {
    update,
    startPour,
    stopPour,
    get isAimed() { return aimed; },
    get isPouring() { return pouring; },
    get level() { return level; },
    get served() { return served; },
    get best() { return best; },
  };
}
