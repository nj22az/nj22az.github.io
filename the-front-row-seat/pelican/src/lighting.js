/**
 * Firelight, one lamp, and the storm outside. Nothing in this room is lit
 * steadily; the flicker is what makes the flagstones move.
 */

import * as THREE from '../vendor/three.module.min.js';
import { LIGHTING, STORM, HEARTH, BAR, ROOM, WINDOWS, PALETTE } from './config.js';
import { createGlowTexture } from './textures.js';

const EMBER_COUNT = 26;

export function buildLighting(scene) {
  scene.fog = new THREE.Fog(LIGHTING.fogColour, LIGHTING.fogNear, LIGHTING.fogFar);
  scene.background = new THREE.Color(LIGHTING.fogColour);

  const ambient = new THREE.AmbientLight(LIGHTING.ambientColour, LIGHTING.ambientIntensity);
  scene.add(ambient);

  // Standing in for bounce off the plaster: warm from the hearth side, cold
  // from the shuttered windows. Keeps the far corners from going to pitch.
  const bounce = new THREE.HemisphereLight(0x4a3320, 0x161418, 0.5);
  scene.add(bounce);

  const fireLight = new THREE.PointLight(
    LIGHTING.fireColour, LIGHTING.fireIntensity, LIGHTING.fireDistance, 1.25,
  );
  fireLight.position.set(HEARTH.x - 0.35, LIGHTING.fireHeight, HEARTH.z);
  fireLight.castShadow = true;
  fireLight.shadow.mapSize.set(1024, 1024);
  fireLight.shadow.bias = -0.004;
  fireLight.shadow.camera.far = 12;
  scene.add(fireLight);

  const lampLight = new THREE.PointLight(
    LIGHTING.lampColour, LIGHTING.lampIntensity, LIGHTING.lampDistance, 1.4,
  );
  lampLight.position.set(BAR.x + 0.05, BAR.height + 0.1, BAR.z - 0.4);
  scene.add(lampLight);

  // Lightning arrives as a broad cool wash from beyond the window wall.
  const lightning = new THREE.DirectionalLight(PALETTE.lightning, 0);
  lightning.position.set(-2, 3.4, ROOM.depth / 2 + 6);
  lightning.target.position.set(0, 0.8, 0);
  scene.add(lightning);
  scene.add(lightning.target);

  // Thin blades of storm light through the shutter gaps.
  const gapMaterial = new THREE.MeshBasicMaterial({
    color: PALETTE.lightning, transparent: true, opacity: 0, side: THREE.DoubleSide,
  });
  const shutterGaps = WINDOWS.map((window) => {
    const gap = new THREE.Mesh(new THREE.PlaneGeometry(window.width * 0.92, 0.012), gapMaterial.clone());
    gap.position.set(window.x, window.sillHeight + window.height / 2, ROOM.depth / 2 - 0.115);
    scene.add(gap);
    return gap;
  });

  // Embers riding the draught above the fire.
  const glow = createGlowTexture();
  const emberGeometry = new THREE.BufferGeometry();
  const emberPositions = new Float32Array(EMBER_COUNT * 3);
  const emberSeeds = new Float32Array(EMBER_COUNT);
  for (let i = 0; i < EMBER_COUNT; i += 1) {
    emberPositions[i * 3] = HEARTH.x - 0.35 + (Math.random() - 0.5) * 0.5;
    emberPositions[i * 3 + 1] = 0.1 + Math.random() * 0.9;
    emberPositions[i * 3 + 2] = HEARTH.z + (Math.random() - 0.5) * 0.6;
    emberSeeds[i] = Math.random();
  }
  emberGeometry.setAttribute('position', new THREE.BufferAttribute(emberPositions, 3));
  const embers = new THREE.Points(emberGeometry, new THREE.PointsMaterial({
    map: glow,
    color: 0xff9440,
    size: 0.035,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  }));
  scene.add(embers);

  return {
    ambient, bounce, fireLight, lampLight, lightning, shutterGaps, embers, emberSeeds,
  };
}

/**
 * Drives the flicker, the embers and the storm. `onThunder` is called with a
 * loudness in 0..1 when a flash's thunder should sound.
 */
export function createLightingAnimator(lighting, { onThunder, onFlash } = {}) {
  let nextFlashAt = STORM.flashIntervalMin;
  let flashUntil = -1;
  let flashPeak = 0;

  function scheduleNextFlash(elapsed) {
    const span = STORM.flashIntervalMax - STORM.flashIntervalMin;
    nextFlashAt = elapsed + STORM.flashIntervalMin + Math.random() * span;
  }

  return function update(elapsed, delta) {
    // Firelight: two out-of-phase sines plus a little noise reads as flame.
    const flickerA = Math.sin(elapsed * LIGHTING.flickerSpeed);
    const flickerB = Math.sin(elapsed * LIGHTING.flickerSpeed * 0.41 + 1.7);
    const noise = (Math.random() - 0.5) * 0.12;
    const flicker = 1 + ((flickerA * 0.6 + flickerB * 0.4) * LIGHTING.flickerDepth) + noise;
    lighting.fireLight.intensity = LIGHTING.fireIntensity * Math.max(0.45, flicker);
    lighting.fireLight.position.x = HEARTH.x - 0.35 + flickerB * 0.03;

    lighting.lampLight.intensity = LIGHTING.lampIntensity * (1 + Math.sin(elapsed * 3.1) * 0.06);

    // Embers drift up and reset into the fire.
    const positions = lighting.embers.geometry.attributes.position;
    for (let i = 0; i < positions.count; i += 1) {
      const seed = lighting.emberSeeds[i];
      let y = positions.getY(i) + delta * (0.22 + seed * 0.4);
      let x = positions.getX(i) + Math.sin(elapsed * (1.2 + seed * 2) + seed * 6) * delta * 0.09;
      if (y > 1.35) {
        y = 0.08 + Math.random() * 0.1;
        x = HEARTH.x - 0.35 + (Math.random() - 0.5) * 0.4;
      }
      positions.setY(i, y);
      positions.setX(i, x);
    }
    positions.needsUpdate = true;

    // Lightning.
    if (elapsed > nextFlashAt && flashUntil < 0) {
      flashPeak = STORM.flashIntensity * (0.55 + Math.random() * 0.45);
      flashUntil = elapsed + STORM.flashDurationMs / 1000;
      const delayRange = STORM.thunderDelayMaxMs - STORM.thunderDelayMinMs;
      const delayMs = STORM.thunderDelayMinMs + Math.random() * delayRange;
      const loudness = 1 - (delayMs - STORM.thunderDelayMinMs) / delayRange;
      if (onFlash) onFlash();
      if (onThunder) window.setTimeout(() => onThunder(loudness), delayMs);
      scheduleNextFlash(elapsed);
    }

    if (flashUntil > 0) {
      const remaining = flashUntil - elapsed;
      if (remaining <= 0) {
        flashUntil = -1;
        lighting.lightning.intensity = 0;
        lighting.shutterGaps.forEach((gap) => { gap.material.opacity = 0; });
      } else {
        // Two-stroke flash, because lightning almost never fires once.
        const phase = remaining / (STORM.flashDurationMs / 1000);
        const stroke = phase > 0.62 ? phase : phase * (0.4 + Math.random() * 0.6);
        lighting.lightning.intensity = flashPeak * stroke;
        lighting.shutterGaps.forEach((gap) => { gap.material.opacity = stroke * 0.9; });
      }
    }
  };
}
