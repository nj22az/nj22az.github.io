/**
 * First-person movement: pointer-lock look on desktop, drag-look plus an
 * on-screen stick on touch. Collision is circle-versus-box against a small
 * set of blockers, which is all a room this size needs.
 */

import * as THREE from '../vendor/three.module.min.js';
import { PLAYER, BAR, CENTRE_TABLE, HEARTH } from './config.js';
import { groundHeightAt, clampToZones } from './terrain.js';

/** Solid furniture the visitor cannot walk through. */
function buildBlockers() {
  return {
    boxes: [
      // The bar.
      {
        minX: BAR.x - BAR.depth / 2 - 0.05, maxX: BAR.x + BAR.depth / 2 + 0.05,
        minZ: BAR.z - BAR.length / 2, maxZ: BAR.z + BAR.length / 2,
      },
      // The centre table.
      {
        minX: CENTRE_TABLE.x - CENTRE_TABLE.width / 2, maxX: CENTRE_TABLE.x + CENTRE_TABLE.width / 2,
        minZ: CENTRE_TABLE.z - CENTRE_TABLE.depth / 2, maxZ: CENTRE_TABLE.z + CENTRE_TABLE.depth / 2,
      },
      // The hearth breast.
      {
        minX: HEARTH.x - HEARTH.depth, maxX: HEARTH.x,
        minZ: HEARTH.z - 1.2, maxZ: HEARTH.z + 1.2,
      },
    ],
  };
}

/** Push a circle of `radius` out of any box it has entered, then onto the ground. */
function resolveCollisions(position, radius, blockers) {
  const { boxes } = blockers;
  clampToZones(position);

  boxes.forEach((box) => {
    const nearestX = THREE.MathUtils.clamp(position.x, box.minX, box.maxX);
    const nearestZ = THREE.MathUtils.clamp(position.z, box.minZ, box.maxZ);
    const dx = position.x - nearestX;
    const dz = position.z - nearestZ;
    const distanceSquared = dx * dx + dz * dz;
    if (distanceSquared >= radius * radius) return;

    if (distanceSquared > 1e-6) {
      const distance = Math.sqrt(distanceSquared);
      position.x = nearestX + (dx / distance) * radius;
      position.z = nearestZ + (dz / distance) * radius;
      return;
    }
    // Dead centre: eject along the shallowest axis.
    const toLeft = Math.abs(position.x - box.minX);
    const toRight = Math.abs(box.maxX - position.x);
    const toBack = Math.abs(position.z - box.minZ);
    const toFront = Math.abs(box.maxZ - position.z);
    const smallest = Math.min(toLeft, toRight, toBack, toFront);
    if (smallest === toLeft) position.x = box.minX - radius;
    else if (smallest === toRight) position.x = box.maxX + radius;
    else if (smallest === toBack) position.z = box.minZ - radius;
    else position.z = box.maxZ + radius;
  });
}

export function createControls(camera, domElement) {
  const blockers = buildBlockers();
  const position = new THREE.Vector3(PLAYER.startPosition.x, PLAYER.eyeHeight, PLAYER.startPosition.z);
  let yaw = PLAYER.startYaw;
  let pitch = PLAYER.startPitch;
  let bobPhase = 0;
  let groundY = 0;
  let pointerLocked = false;

  const keys = new Set();
  const touchMove = { x: 0, y: 0, active: false, id: null, originX: 0, originY: 0 };
  const dragLook = { active: false, id: null, lastX: 0, lastY: 0 };

  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();

  // --- keyboard -------------------------------------------------------------
  const MOVEMENT_CODES = new Set([
    'KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ShiftLeft', 'ShiftRight',
  ]);
  window.addEventListener('keydown', (event) => {
    if (MOVEMENT_CODES.has(event.code)) {
      keys.add(event.code);
      event.preventDefault();
    }
  });
  window.addEventListener('keyup', (event) => keys.delete(event.code));
  window.addEventListener('blur', () => keys.clear());

  // --- pointer lock ---------------------------------------------------------
  function requestPointerLock() {
    if (domElement.requestPointerLock) domElement.requestPointerLock();
  }
  document.addEventListener('pointerlockchange', () => {
    pointerLocked = document.pointerLockElement === domElement;
  });
  document.addEventListener('mousemove', (event) => {
    if (!pointerLocked) return;
    yaw -= event.movementX * PLAYER.lookSensitivity;
    pitch -= event.movementY * PLAYER.lookSensitivity;
    pitch = THREE.MathUtils.clamp(pitch, -PLAYER.pitchLimit, PLAYER.pitchLimit);
  });

  // --- touch ----------------------------------------------------------------
  const HALF_SCREEN = () => window.innerWidth / 2;

  domElement.addEventListener('touchstart', (event) => {
    Array.from(event.changedTouches).forEach((touch) => {
      if (touch.clientX < HALF_SCREEN() && !touchMove.active) {
        touchMove.active = true;
        touchMove.id = touch.identifier;
        touchMove.originX = touch.clientX;
        touchMove.originY = touch.clientY;
      } else if (!dragLook.active) {
        dragLook.active = true;
        dragLook.id = touch.identifier;
        dragLook.lastX = touch.clientX;
        dragLook.lastY = touch.clientY;
      }
    });
  }, { passive: true });

  domElement.addEventListener('touchmove', (event) => {
    Array.from(event.changedTouches).forEach((touch) => {
      if (touch.identifier === touchMove.id) {
        const STICK_RANGE = 62;
        touchMove.x = THREE.MathUtils.clamp((touch.clientX - touchMove.originX) / STICK_RANGE, -1, 1);
        touchMove.y = THREE.MathUtils.clamp((touch.clientY - touchMove.originY) / STICK_RANGE, -1, 1);
      } else if (touch.identifier === dragLook.id) {
        yaw -= (touch.clientX - dragLook.lastX) * PLAYER.touchLookSensitivity;
        pitch -= (touch.clientY - dragLook.lastY) * PLAYER.touchLookSensitivity;
        pitch = THREE.MathUtils.clamp(pitch, -PLAYER.pitchLimit, PLAYER.pitchLimit);
        dragLook.lastX = touch.clientX;
        dragLook.lastY = touch.clientY;
      }
    });
  }, { passive: true });

  function endTouch(event) {
    Array.from(event.changedTouches).forEach((touch) => {
      if (touch.identifier === touchMove.id) {
        touchMove.active = false; touchMove.id = null; touchMove.x = 0; touchMove.y = 0;
      }
      if (touch.identifier === dragLook.id) {
        dragLook.active = false; dragLook.id = null;
      }
    });
  }
  domElement.addEventListener('touchend', endTouch, { passive: true });
  domElement.addEventListener('touchcancel', endTouch, { passive: true });

  function update(delta) {
    let inputX = 0;
    let inputZ = 0;
    // WASD moves, the arrows look. Keyboard-only visitors need to be able to
    // look down at the counter, so pitch is on the arrows too.
    if (keys.has('KeyW')) inputZ += 1;
    if (keys.has('KeyS')) inputZ -= 1;
    if (keys.has('KeyA')) inputX -= 1;
    if (keys.has('KeyD')) inputX += 1;
    if (keys.has('ArrowLeft')) yaw += PLAYER.turnSpeed * delta;
    if (keys.has('ArrowRight')) yaw -= PLAYER.turnSpeed * delta;
    if (keys.has('ArrowUp')) pitch += PLAYER.turnSpeed * delta;
    if (keys.has('ArrowDown')) pitch -= PLAYER.turnSpeed * delta;
    pitch = THREE.MathUtils.clamp(pitch, -PLAYER.pitchLimit, PLAYER.pitchLimit);
    if (touchMove.active) {
      inputX += touchMove.x;
      inputZ -= touchMove.y;
    }

    const magnitude = Math.hypot(inputX, inputZ);
    if (magnitude > 1) { inputX /= magnitude; inputZ /= magnitude; }

    const running = keys.has('ShiftLeft') || keys.has('ShiftRight');
    const speed = PLAYER.walkSpeed * (running ? PLAYER.runMultiplier : 1);

    forward.set(-Math.sin(yaw), 0, -Math.cos(yaw));
    right.set(Math.cos(yaw), 0, -Math.sin(yaw));

    position.addScaledVector(forward, inputZ * speed * delta);
    position.addScaledVector(right, inputX * speed * delta);
    resolveCollisions(position, PLAYER.bodyRadius, blockers);

    // Head-bob only while actually moving.
    const moving = Math.hypot(inputX, inputZ) > 0.02;
    bobPhase += delta * PLAYER.bobFrequency * (running ? PLAYER.runMultiplier : 1) * (moving ? 1 : 0);
    const bob = moving ? Math.sin(bobPhase) * PLAYER.bobAmplitude : 0;

    // Follow the ground down the stairs and out onto the mud, easing so the
    // steps register as steps without jolting the view.
    const targetGround = groundHeightAt(position.x);
    groundY += (targetGround - groundY) * Math.min(1, delta * 12);

    camera.position.set(position.x, groundY + PLAYER.eyeHeight + bob, position.z);
    camera.rotation.set(pitch, yaw, 0, 'YXZ');
  }

  return {
    update,
    requestPointerLock,
    get isPointerLocked() { return pointerLocked; },
    get position() { return position; },
    /** Put the visitor somewhere, facing a given way. */
    moveTo({ x, z, yaw: targetYaw, pitch: targetPitch }) {
      position.set(x, PLAYER.eyeHeight, z);
      groundY = groundHeightAt(x);
      if (typeof targetYaw === 'number') yaw = targetYaw;
      pitch = typeof targetPitch === 'number' ? targetPitch : 0;
    },
    reset() {
      position.set(PLAYER.startPosition.x, PLAYER.eyeHeight, PLAYER.startPosition.z);
      groundY = 0;
      yaw = PLAYER.startYaw;
      pitch = PLAYER.startPitch;
    },
  };
}
