/**
 * The findable objects. Each gets a small pulsing marker; look at one from
 * close enough and the reticle names it, and a click opens its card.
 */

import * as THREE from '../vendor/three.module.min.js';
import { HOTSPOTS, INTERACTION } from './config.js';
import { createGlowTexture } from './textures.js';

export function createHotspots(scene, camera, { onOpen } = {}) {
  const glow = createGlowTexture();
  const markers = [];

  HOTSPOTS.forEach((hotspot) => {
    const material = new THREE.SpriteMaterial({
      map: glow,
      color: INTERACTION.markerColour,
      transparent: true,
      opacity: 0.55,
      depthTest: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const sprite = new THREE.Sprite(material);
    sprite.position.set(hotspot.position.x, hotspot.position.y, hotspot.position.z);
    sprite.scale.setScalar(INTERACTION.markerRadius * 2);
    sprite.userData.hotspot = hotspot;
    scene.add(sprite);
    markers.push(sprite);
  });

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  const cameraPosition = new THREE.Vector3();
  const viewDirection = new THREE.Vector3();
  const toMarker = new THREE.Vector3();
  const aimCosine = Math.cos(THREE.MathUtils.degToRad(INTERACTION.aimConeDegrees));
  let focused = null;
  const visited = new Set();

  function update(elapsed) {
    camera.getWorldPosition(cameraPosition);

    markers.forEach((marker) => {
      const distance = marker.position.distanceTo(cameraPosition);
      const inRange = distance < INTERACTION.maxDistance;
      const pulse = 0.5 + Math.sin(elapsed * INTERACTION.pulseSpeed + marker.id) * 0.25;
      const seen = visited.has(marker.userData.hotspot.id);
      marker.material.opacity = (inRange ? 0.85 : 0.4) * pulse * (seen ? 0.45 : 1);
      marker.scale.setScalar(INTERACTION.markerRadius * 2 * (inRange ? 1.25 : 1));
    });

    // Whichever marker sits closest to the middle of the view, inside the aim
    // cone and within reach. Ties break toward the nearer object.
    camera.getWorldDirection(viewDirection);
    let best = null;
    let bestScore = aimCosine;
    markers.forEach((marker) => {
      toMarker.subVectors(marker.position, cameraPosition);
      const distance = toMarker.length();
      if (distance > INTERACTION.maxDistance || distance < 1e-4) return;
      toMarker.divideScalar(distance);
      const alignment = toMarker.dot(viewDirection);
      if (alignment <= bestScore) return;
      bestScore = alignment;
      best = marker.userData.hotspot;
    });
    focused = best;
    return focused;
  }

  function activate() {
    if (!focused) return null;
    visited.add(focused.id);
    if (onOpen) onOpen(focused);
    return focused;
  }

  /**
   * Activate whatever sits under a screen point. Without pointer lock — and on
   * every touch device — the reticle is not where the visitor is aiming, so a
   * direct tap on a marker has to work too.
   */
  function activateAt(clientX, clientY, element) {
    const rect = element.getBoundingClientRect();
    pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(markers, false);
    const hit = hits.find((entry) => entry.distance < INTERACTION.maxDistance);
    if (!hit) return null;
    const hotspot = hit.object.userData.hotspot;
    visited.add(hotspot.id);
    if (onOpen) onOpen(hotspot);
    return hotspot;
  }

  return {
    update,
    activate,
    activateAt,
    get focused() { return focused; },
    get visitedCount() { return visited.size; },
    total: HOTSPOTS.length,
  };
}
