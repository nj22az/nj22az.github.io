/**
 * Wires the Pelican together: build the room, light it, put a body in it,
 * and run the loop.
 */

import * as THREE from '../vendor/three.module.min.js';
import { PLACES } from './config.js';
import { buildRoom } from './room.js';
import { buildFittings } from './fittings.js';
import { buildProps } from './props.js';
import { buildTavern } from './tavern.js';
import { buildServing, createServing } from './serving.js';
import { buildExterior } from './exterior.js';
import { buildLighting, createLightingAnimator } from './lighting.js';
import { buildRain, createRainAnimator } from './weather.js';
import { createControls } from './controls.js';
import { createHotspots } from './hotspots.js';
import { createStormAudio } from './audio.js';
import { detectTier, createPerformanceGovernor } from './quality.js';
import { STORM } from './config.js';

const canvas = document.getElementById('scene');
const overlay = document.getElementById('overlay');
const enterButton = document.getElementById('enter');
const card = document.getElementById('card');
const cardTitle = document.getElementById('card-title');
const cardBody = document.getElementById('card-body');
const cardClose = document.getElementById('card-close');
const reticle = document.getElementById('reticle');
const reticleLabel = document.getElementById('reticle-label');
const progress = document.getElementById('progress');
const soundToggle = document.getElementById('sound-toggle');
const loading = document.getElementById('loading');
const placesNav = document.getElementById('places');
const pints = document.getElementById('pints');

const tier = detectTier();

const renderer = new THREE.WebGLRenderer({
  canvas, antialias: tier.antialias, powerPreference: 'high-performance',
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, tier.maxPixelRatio));
renderer.shadowMap.enabled = tier.shadows;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.05;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(68, 1, 0.05, 190);

buildRoom(scene);
buildFittings(scene);
buildProps(scene);
buildTavern(scene);
buildExterior(scene);
const lighting = buildLighting(scene, tier);
const rainAnimator = createRainAnimator(buildRain(scene, tier.rainCount));
const controls = createControls(camera, canvas);
const servingParts = buildServing(scene);
const recordFrame = createPerformanceGovernor(renderer, tier);

let audio = null;
let soundOn = true;

const lightingAnimator = createLightingAnimator(lighting, scene, {
  onFlash: () => {
    if (audio && soundOn && Math.random() < STORM.shutterRattleChance) audio.shutterRattle();
  },
  onThunder: (loudness) => {
    if (audio && soundOn) audio.thunder(loudness);
  },
});

const serving = createServing(servingParts, camera, {
  onServed: ({ quality, served: count, best }) => {
    pints.textContent = count === 1
      ? `1 pint drawn · ${quality}%`
      : `${count} pints drawn · best ${best}%`;
    if (audio && soundOn) audio.pourStop(quality);
  },
  onPourChange: (isPouring) => {
    if (!audio || !soundOn) return;
    if (isPouring) audio.pourStart();
  },
});

const hotspots = createHotspots(scene, camera, {
  onOpen: (hotspot) => {
    cardTitle.textContent = hotspot.label;
    cardBody.innerHTML = hotspot.body.map((line) => `<p>${line}</p>`).join('');
    card.hidden = false;
    if (document.pointerLockElement) document.exitPointerLock();
    updateProgress();
  },
});

PLACES.forEach((place) => {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = place.label;
  button.addEventListener('click', () => {
    controls.moveTo(place);
    card.hidden = true;
    placesNav.querySelectorAll('button').forEach((other) => other.removeAttribute('aria-current'));
    button.setAttribute('aria-current', 'true');
  });
  placesNav.append(button);
});

function updateProgress() {
  progress.textContent = `${hotspots.visitedCount} of ${hotspots.total} found`;
}

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);
resize();

// --- interaction ------------------------------------------------------------
canvas.addEventListener('pointerdown', () => {
  if (!card.hidden) return;
  serving.startPour();
});
window.addEventListener('pointerup', () => serving.stopPour());

canvas.addEventListener('click', (event) => {
  if (!card.hidden) return;
  if (serving.isAimed) return;
  if (hotspots.focused) {
    hotspots.activate();
    return;
  }
  // Not aiming with the reticle? Take the click where it actually landed.
  if (!controls.isPointerLocked && hotspots.activateAt(event.clientX, event.clientY, canvas)) return;
  if (!controls.isPointerLocked) controls.requestPointerLock();
});

function closeCard() {
  card.hidden = true;
}
cardClose.addEventListener('click', closeCard);
window.addEventListener('keyup', (event) => {
  if (event.code === 'KeyE') serving.stopPour();
});

window.addEventListener('keydown', (event) => {
  if (event.code === 'Escape' && !card.hidden) closeCard();
  if (event.code === 'KeyE' && card.hidden) {
    if (serving.isAimed) serving.startPour();
    else if (hotspots.focused) hotspots.activate();
  }
  if (event.code === 'KeyR') controls.reset();
});

soundToggle.addEventListener('click', () => {
  soundOn = !soundOn;
  soundToggle.textContent = soundOn ? 'Sound on' : 'Sound off';
  soundToggle.setAttribute('aria-pressed', String(soundOn));
  if (audio) audio.setEnabled(soundOn);
});

enterButton.addEventListener('click', async () => {
  overlay.hidden = true;
  if (!audio) {
    audio = createStormAudio();
    if (audio) {
      await audio.resume();
      audio.setEnabled(soundOn);
    } else {
      soundToggle.hidden = true;
    }
  }
  controls.requestPointerLock();
});

// --- loop -------------------------------------------------------------------
const clock = new THREE.Clock();

function frame() {
  const delta = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.getElapsedTime();

  if (card.hidden) controls.update(delta);
  lightingAnimator(elapsed, delta, camera.position.x);
  rainAnimator(delta, camera.position.x);
  recordFrame(delta * 1000);

  const atTap = serving.update(delta);
  const focused = atTap ? null : hotspots.update(elapsed);
  // The reticle has no business showing through an open card.
  reticle.hidden = !card.hidden;
  reticle.classList.toggle('is-active', Boolean(focused));
  if (atTap && card.hidden) {
    reticle.classList.add('is-active');
    reticleLabel.textContent = serving.isPouring
      ? `${Math.round(serving.level * 100)}%`
      : 'Hold to draw a pint';
  } else {
    reticleLabel.textContent = focused && card.hidden ? focused.label : '';
  }

  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}

updateProgress();
loading.hidden = true;
frame();
