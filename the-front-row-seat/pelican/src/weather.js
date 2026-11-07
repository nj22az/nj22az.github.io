/**
 * Rain over the foreshore. Drawn as line segments rather than points so it
 * reads as falling water rather than dust, and slanted with the gale.
 *
 * The rain only exists outside; indoors it is hidden, which costs nothing and
 * keeps the taproom's air clean.
 */

import * as THREE from '../vendor/three.module.min.js';
import { RAIN, EXTERIOR, DOOR, ROOM } from './config.js';

const STREAK_LENGTH = 0.62;

export function buildRain(scene, count) {
  const dropCount = Math.max(1, count);
  const positions = new Float32Array(dropCount * 6);
  const speeds = new Float32Array(dropCount);

  const centreX = EXTERIOR.stairRunEnd - 6;
  const centreZ = DOOR.z;

  for (let i = 0; i < dropCount; i += 1) {
    const x = centreX + (Math.random() - 0.5) * RAIN.areaWidth;
    const y = Math.random() * RAIN.topHeight - 3;
    const z = centreZ + (Math.random() - 0.5) * RAIN.areaDepth;
    positions[i * 6] = x;
    positions[i * 6 + 1] = y;
    positions[i * 6 + 2] = z;
    positions[i * 6 + 3] = x + RAIN.slant * STREAK_LENGTH;
    positions[i * 6 + 4] = y - STREAK_LENGTH;
    positions[i * 6 + 5] = z;
    speeds[i] = 0.75 + Math.random() * 0.5;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.LineBasicMaterial({
    color: RAIN.colour,
    transparent: true,
    opacity: 0.34,
    depthWrite: false,
  });
  const rain = new THREE.LineSegments(geometry, material);
  rain.frustumCulled = false;
  scene.add(rain);

  return { rain, speeds, dropCount, centreX, centreZ };
}

export function createRainAnimator(rainParts) {
  const { rain, speeds, dropCount, centreX, centreZ } = rainParts;
  const positions = rain.geometry.attributes.position;

  return function update(delta, cameraX) {
    // Indoors the rain is switched off entirely rather than drawn and hidden.
    const outside = cameraX < -ROOM.width / 2;
    rain.visible = outside;
    if (!outside) return;

    const array = positions.array;
    for (let i = 0; i < dropCount; i += 1) {
      const base = i * 6;
      const fall = RAIN.fallSpeed * speeds[i] * delta;
      array[base + 1] -= fall;
      array[base + 4] -= fall;
      array[base] += RAIN.slant * fall;
      array[base + 3] += RAIN.slant * fall;

      if (array[base + 4] < EXTERIOR.waterLevel - 0.5) {
        const x = centreX + (Math.random() - 0.5) * RAIN.areaWidth;
        const z = centreZ + (Math.random() - 0.5) * RAIN.areaDepth;
        array[base] = x;
        array[base + 1] = RAIN.topHeight;
        array[base + 2] = z;
        array[base + 3] = x + RAIN.slant * STREAK_LENGTH;
        array[base + 4] = RAIN.topHeight - STREAK_LENGTH;
        array[base + 5] = z;
      }
    }
    positions.needsUpdate = true;
  };
}
