/**
 * Firelight, one lamp, and the storm outside. Nothing in this room is lit
 * steadily; the flicker is what makes the flagstones move.
 */

import * as THREE from '../vendor/three.module.min.js';
import { LIGHTING, STORM, HEARTH, BAR, ROOM, WINDOWS, PALETTE, CANDLES, ALLEY_LANTERN, SHED_LANTERN } from './config.js';
import { createGlowTexture, createFlameTexture } from './textures.js';

const EMBER_COUNT = 26;

export function buildLighting(scene, tier) {
  // The fog is warm and close indoors and cold and far outside; the animator
  // crossfades between the two as the visitor steps through the door.
  scene.fog = new THREE.Fog(LIGHTING.fogColour, LIGHTING.fogNear, tier.fogFar);
  scene.background = new THREE.Color(LIGHTING.fogColour);

  const ambient = new THREE.AmbientLight(LIGHTING.ambientColour, LIGHTING.ambientIntensity);
  scene.add(ambient);

  // Standing in for bounce off the plaster: warm from the hearth side, cold
  // from the shuttered windows. Keeps the far corners from going to pitch.
  const bounce = new THREE.HemisphereLight(0x4a3320, 0x161418, 0.5);
  scene.add(bounce);

  // The night outside: a cold, almost directionless wash off a storm sky, so
  // the foreshore and the river read without ever competing with the hearth.
  const nightSky = new THREE.HemisphereLight(0x3d4a5a, 0x0a0c0e, 0.55);
  nightSky.position.set(-20, 20, 0);
  scene.add(nightSky);

  /**
   * Sky-glow on the mud and the water. A distance-limited point light rather
   * than a directional one, so it lights the foreshore and has fallen away to
   * nothing by the time it reaches the taproom — which must stay a firelit
   * room, not a moonlit one.
   */
  const riverGlow = new THREE.PointLight(0x7f9ec4, 34, 44, 1.05);
  riverGlow.position.set(-21, 9, -3);
  scene.add(riverGlow);

  const moon = new THREE.PointLight(0x9fb6d4, 16, 30, 1.1);
  moon.position.set(-12.5, 6, -6);
  scene.add(moon);

  const fireLight = new THREE.PointLight(
    LIGHTING.fireColour, LIGHTING.fireIntensity, LIGHTING.fireDistance, 1.25,
  );
  fireLight.position.set(HEARTH.x - 0.35, LIGHTING.fireHeight, HEARTH.z);
  fireLight.castShadow = true;
  fireLight.shadow.mapSize.set(tier.shadowMapSize, tier.shadowMapSize);
  fireLight.shadow.bias = -0.004;
  fireLight.shadow.camera.far = 12;
  scene.add(fireLight);

  const lampLight = new THREE.PointLight(
    LIGHTING.lampColour, LIGHTING.lampIntensity, LIGHTING.lampDistance, 1.4,
  );
  lampLight.position.set(BAR.x + 0.05, BAR.height + 0.1, BAR.z - 0.4);
  scene.add(lampLight);

  // Candles: each is a small warm point plus the flame you can see burning.
  const candleFlames = [];
  const candleLights = [];
  const flameMaterial = new THREE.MeshStandardMaterial({
    color: PALETTE.lampFlame, emissive: PALETTE.lampFlame, emissiveIntensity: 4.5, roughness: 1,
  });
  CANDLES.forEach((candle) => {
    const light = new THREE.PointLight(LIGHTING.lampColour, candle.intensity, candle.distance, 1.6);
    light.position.set(candle.x, candle.y + 0.16, candle.z);
    scene.add(light);
    candleLights.push(light);

    const stick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.019, 0.13, 8),
      new THREE.MeshStandardMaterial({ color: 0xd8cba8, roughness: 0.85 }),
    );
    stick.position.set(candle.x, candle.y + 0.065, candle.z);
    scene.add(stick);

    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 6), flameMaterial);
    flame.scale.set(0.7, 1.9, 0.7);
    flame.position.set(candle.x, candle.y + 0.16, candle.z);
    scene.add(flame);
    candleFlames.push(flame);
  });

  // The alley lantern.
  const lanternLight = new THREE.PointLight(0xffc27a, ALLEY_LANTERN.intensity, ALLEY_LANTERN.distance, 1.4);
  lanternLight.position.set(ALLEY_LANTERN.x, ALLEY_LANTERN.y, ALLEY_LANTERN.z);
  scene.add(lanternLight);
  const lanternBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.17, 0.24, 0.17),
    new THREE.MeshStandardMaterial({
      color: 0xd8b070, emissive: 0xffa94a, emissiveIntensity: 1.5,
      transparent: true, opacity: 0.72, roughness: 0.6,
    }),
  );
  lanternBody.position.copy(lanternLight.position);
  scene.add(lanternBody);

  // A lantern left burning in the breaking shed, which is the only reason the
  // shed reads at all from the stairs.
  const shedLight = new THREE.PointLight(0xffbb72, SHED_LANTERN.intensity, SHED_LANTERN.distance, 1.5);
  shedLight.position.set(SHED_LANTERN.x, SHED_LANTERN.y, SHED_LANTERN.z);
  scene.add(shedLight);
  const shedLantern = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.22, 0.16),
    new THREE.MeshStandardMaterial({
      color: 0xd8b070, emissive: 0xffa94a, emissiveIntensity: 1.4,
      transparent: true, opacity: 0.7, roughness: 0.6,
    }),
  );
  shedLantern.position.copy(shedLight.position);
  scene.add(shedLantern);

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

  /**
   * A soft additive halo on every flame. This is a stand-in for a bloom pass:
   * it costs one transparent sprite per light instead of a full-screen
   * post-process, which matters on a phone, and reads almost the same.
   */
  const glow = createGlowTexture();
  const flameTexture = createFlameTexture();
  const haloMaterial = new THREE.SpriteMaterial({
    map: flameTexture, transparent: true, depthWrite: false,
    blending: THREE.AdditiveBlending, opacity: 0.85,
  });
  const halos = [];
  function addHalo(position, size, tint) {
    const halo = new THREE.Sprite(haloMaterial.clone());
    halo.material.color.setHex(tint);
    halo.position.copy(position);
    halo.scale.setScalar(size);
    halo.userData.baseScale = size;
    scene.add(halo);
    halos.push(halo);
    return halo;
  }
  addHalo(fireLight.position, 1.55, 0xff8a3c);
  addHalo(lampLight.position, 0.42, 0xffc070);
  candleLights.forEach((light) => addHalo(light.position, 0.3, 0xffc878));
  addHalo(lanternLight.position, 0.75, 0xffb060);
  addHalo(shedLight.position, 0.95, 0xffb060);

  /**
   * Dust in the air of the taproom. Only visible where the firelight catches
   * it, which is exactly what makes a lit interior feel like it has air in it.
   */
  const DUST_COUNT = 140;
  const dustPositions = new Float32Array(DUST_COUNT * 3);
  const dustSeeds = new Float32Array(DUST_COUNT);
  for (let i = 0; i < DUST_COUNT; i += 1) {
    dustPositions[i * 3] = (Math.random() - 0.5) * ROOM.width * 0.92;
    dustPositions[i * 3 + 1] = 0.2 + Math.random() * (ROOM.ceilingHeight - 0.4);
    dustPositions[i * 3 + 2] = (Math.random() - 0.5) * ROOM.depth * 0.92;
    dustSeeds[i] = Math.random();
  }
  const dustGeometry = new THREE.BufferGeometry();
  dustGeometry.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
  const dust = new THREE.Points(dustGeometry, new THREE.PointsMaterial({
    map: glow, color: 0xffd9a8, size: 0.017, transparent: true, opacity: 0.34,
    depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  scene.add(dust);

  // Embers riding the draught above the fire.
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
    ambient, bounce, nightSky, riverGlow, moon, fireLight, lampLight, lightning, shutterGaps, embers, emberSeeds,
    candleFlames, candleLights, lanternLight, shedLight, halos, dust, dustSeeds,
  };
}

/**
 * Drives the flicker, the embers and the storm. `onThunder` is called with a
 * loudness in 0..1 when a flash's thunder should sound.
 */
const INDOOR_FOG = new THREE.Color(LIGHTING.fogColour);
const OUTDOOR_FOG = new THREE.Color(LIGHTING.skyColour);

export function createLightingAnimator(lighting, scene, { onThunder, onFlash } = {}) {
  let outdoorMix = 0;
  let nextFlashAt = STORM.flashIntervalMin;
  let flashUntil = -1;
  let flashPeak = 0;

  function scheduleNextFlash(elapsed) {
    const span = STORM.flashIntervalMax - STORM.flashIntervalMin;
    nextFlashAt = elapsed + STORM.flashIntervalMin + Math.random() * span;
  }

  return function update(elapsed, delta, cameraX) {
    // Step through the door and the air changes: warm and close becomes cold
    // and open. Eased rather than switched, so the threshold is felt.
    const wantOutdoor = cameraX < -ROOM.width / 2 ? 1 : 0;
    outdoorMix += (wantOutdoor - outdoorMix) * Math.min(1, delta * 2.4);
    scene.fog.color.copy(INDOOR_FOG).lerp(OUTDOOR_FOG, outdoorMix);
    scene.background.copy(scene.fog.color);
    scene.fog.near = LIGHTING.fogNear + outdoorMix * 6;

    // Firelight: two out-of-phase sines plus a little noise reads as flame.
    const flickerA = Math.sin(elapsed * LIGHTING.flickerSpeed);
    const flickerB = Math.sin(elapsed * LIGHTING.flickerSpeed * 0.41 + 1.7);
    const noise = (Math.random() - 0.5) * 0.12;
    const flicker = 1 + ((flickerA * 0.6 + flickerB * 0.4) * LIGHTING.flickerDepth) + noise;
    lighting.fireLight.intensity = LIGHTING.fireIntensity * Math.max(0.45, flicker);
    lighting.fireLight.position.x = HEARTH.x - 0.35 + flickerB * 0.03;

    lighting.lampLight.intensity = LIGHTING.lampIntensity * (1 + Math.sin(elapsed * 3.1) * 0.06);

    // Every candle guts on its own rhythm, and the flames lean with it.
    lighting.candleLights.forEach((light, index) => {
      const wobble = Math.sin(elapsed * (4.3 + index * 1.7) + index * 2.1);
      const gust = Math.sin(elapsed * 0.7 + index) * 0.5 + 0.5;
      light.intensity = CANDLES[index].intensity * (0.82 + wobble * 0.12 + gust * 0.1);
      const flame = lighting.candleFlames[index];
      flame.scale.set(0.7 + wobble * 0.06, 1.9 + wobble * 0.35, 0.7);
      flame.rotation.z = wobble * 0.14;
    });

    lighting.lanternLight.intensity = ALLEY_LANTERN.intensity
      * (0.85 + Math.sin(elapsed * 2.3) * 0.09 + Math.sin(elapsed * 5.9) * 0.05);
    lighting.shedLight.intensity = SHED_LANTERN.intensity
      * (0.86 + Math.sin(elapsed * 1.9 + 1.4) * 0.1 + Math.sin(elapsed * 6.7) * 0.04);

    // Halos breathe with their own flame rather than all together.
    lighting.halos.forEach((halo, index) => {
      const breathe = 1 + Math.sin(elapsed * (3.1 + index * 0.9) + index) * 0.11
        + (Math.random() - 0.5) * 0.03;
      halo.scale.setScalar(halo.userData.baseScale * breathe);
    });

    // Dust drifts on the room's slow convection and wraps at the ceiling.
    const dustPoints = lighting.dust.geometry.attributes.position;
    for (let i = 0; i < dustPoints.count; i += 1) {
      const seed = lighting.dustSeeds[i];
      let y = dustPoints.getY(i) + delta * (0.014 + seed * 0.03);
      const x = dustPoints.getX(i) + Math.sin(elapsed * (0.3 + seed) + seed * 9) * delta * 0.05;
      if (y > ROOM.ceilingHeight - 0.12) y = 0.18;
      dustPoints.setY(i, y);
      dustPoints.setX(i, x);
    }
    dustPoints.needsUpdate = true;

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
