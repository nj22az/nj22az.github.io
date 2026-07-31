/**
 * Every texture in the scene is drawn at runtime onto a 2D canvas — there is
 * not one image file in this directory. Each generator returns a THREE
 * texture ready to assign; callers set their own repeat.
 */

import * as THREE from '../vendor/three.module.min.js';

const TEXTURE_SIZE = 512;

/** Deterministic value noise, so the room looks the same on every visit. */
function createSeededRandom(seed) {
  let state = seed >>> 0;
  return function random() {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function createCanvas(size = TEXTURE_SIZE) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

/**
 * Derive a normal map from a drawn canvas by running a Sobel filter over its
 * luminance. Every surface in the room is flat geometry, so this is what makes
 * oak look like oak under a moving flame rather than like brown paper.
 */
export function deriveNormalMap(sourceCanvas, { strength = 2.6, repeat = 1 } = {}) {
  const size = sourceCanvas.width;
  const source = sourceCanvas.getContext('2d').getImageData(0, 0, size, size).data;

  const height = new Float32Array(size * size);
  for (let i = 0; i < size * size; i += 1) {
    const o = i * 4;
    height[i] = (source[o] * 0.299 + source[o + 1] * 0.587 + source[o + 2] * 0.114) / 255;
  }

  const target = createCanvas(size);
  const context = target.getContext('2d');
  const image = context.createImageData(size, size);
  const at = (x, y) => height[((y + size) % size) * size + ((x + size) % size)];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const dx = (at(x - 1, y - 1) + 2 * at(x - 1, y) + at(x - 1, y + 1))
               - (at(x + 1, y - 1) + 2 * at(x + 1, y) + at(x + 1, y + 1));
      const dy = (at(x - 1, y - 1) + 2 * at(x, y - 1) + at(x + 1, y - 1))
               - (at(x - 1, y + 1) + 2 * at(x, y + 1) + at(x + 1, y + 1));

      const nx = dx * strength;
      const ny = dy * strength;
      const length = Math.hypot(nx, ny, 1);
      const o = (y * size + x) * 4;
      image.data[o] = ((nx / length) * 0.5 + 0.5) * 255;
      image.data[o + 1] = ((ny / length) * 0.5 + 0.5) * 255;
      image.data[o + 2] = ((1 / length) * 0.5 + 0.5) * 255;
      image.data[o + 3] = 255;
    }
  }
  context.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(target);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  return texture;
}

function finalise(canvas, { repeat = 1, anisotropy = 4 } = {}) {
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  texture.anisotropy = anisotropy;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Sprinkled grain, used under most surfaces to kill the plastic look. */
function speckle(context, size, random, { count, alpha, maxRadius }) {
  for (let i = 0; i < count; i += 1) {
    const shade = Math.floor(random() * 255);
    context.fillStyle = `rgba(${shade},${shade},${shade},${alpha})`;
    context.beginPath();
    context.arc(random() * size, random() * size, random() * maxRadius, 0, Math.PI * 2);
    context.fill();
  }
}

/** A colour map and the normal map derived from the same drawing. */
function withNormal(canvas, repeat, strength) {
  const map = finalise(canvas, { repeat });
  map.normalMap = deriveNormalMap(canvas, { strength, repeat });
  map.roughnessMap = deriveRoughnessMap(canvas, { repeat });
  return map;
}

export function createOakTexture({ seed = 7, base = '#4a3423', repeat = 1 } = {}) {
  const canvas = createCanvas();
  const context = canvas.getContext('2d');
  const random = createSeededRandom(seed);
  const size = canvas.width;

  context.fillStyle = base;
  context.fillRect(0, 0, size, size);

  // Long grain: wandering vertical lines, darker in the heartwood.
  for (let i = 0; i < 190; i += 1) {
    const x = random() * size;
    const width = 0.6 + random() * 2.6;
    const darkness = 0.06 + random() * 0.22;
    context.strokeStyle = `rgba(20,12,6,${darkness})`;
    context.lineWidth = width;
    context.beginPath();
    context.moveTo(x, -10);
    let drift = x;
    for (let y = -10; y < size + 10; y += 16) {
      drift += (random() - 0.5) * 5.5;
      context.lineTo(drift, y);
    }
    context.stroke();
  }

  // Knots.
  const knotCount = 2 + Math.floor(random() * 3);
  for (let i = 0; i < knotCount; i += 1) {
    const cx = random() * size;
    const cy = random() * size;
    const rings = 5 + Math.floor(random() * 6);
    for (let r = rings; r > 0; r -= 1) {
      context.strokeStyle = `rgba(24,14,7,${0.05 + r * 0.02})`;
      context.lineWidth = 1 + random();
      context.beginPath();
      context.ellipse(cx, cy, r * 3.1, r * 2.0, random() * Math.PI, 0, Math.PI * 2);
      context.stroke();
    }
  }

  speckle(context, size, random, { count: 2600, alpha: 0.05, maxRadius: 1.5 });
  return withNormal(canvas, repeat, 2.2);
}

export function createFlagstoneTexture({ seed = 21, repeat = 1 } = {}) {
  const canvas = createCanvas();
  const context = canvas.getContext('2d');
  const random = createSeededRandom(seed);
  const size = canvas.width;

  context.fillStyle = '#221e1b';
  context.fillRect(0, 0, size, size);

  // Irregular slabs on a jittered grid, worn paler toward their centres.
  const columns = 4;
  const rows = 4;
  const cell = size / columns;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const inset = 3 + random() * 4;
      const x = column * cell + inset + (random() - 0.5) * 5;
      const y = row * cell + inset + (random() - 0.5) * 5;
      const width = cell - inset * 2 + (random() - 0.5) * 7;
      const height = cell - inset * 2 + (random() - 0.5) * 7;
      const tone = 52 + Math.floor(random() * 26);
      const gradient = context.createRadialGradient(
        x + width / 2, y + height / 2, 2,
        x + width / 2, y + height / 2, Math.max(width, height) * 0.7,
      );
      gradient.addColorStop(0, `rgb(${tone + 14},${tone + 11},${tone + 8})`);
      gradient.addColorStop(1, `rgb(${tone - 8},${tone - 9},${tone - 10})`);
      context.fillStyle = gradient;
      context.beginPath();
      context.roundRect(x, y, width, height, 3 + random() * 4);
      context.fill();
    }
  }

  speckle(context, size, random, { count: 5200, alpha: 0.055, maxRadius: 1.9 });
  return withNormal(canvas, repeat, 3.4);
}

export function createPlasterTexture({ seed = 33, repeat = 1 } = {}) {
  const canvas = createCanvas();
  const context = canvas.getContext('2d');
  const random = createSeededRandom(seed);
  const size = canvas.width;

  context.fillStyle = '#6d6155';
  context.fillRect(0, 0, size, size);

  // Trowel sweeps.
  for (let i = 0; i < 130; i += 1) {
    const tone = random() > 0.5 ? 255 : 0;
    context.strokeStyle = `rgba(${tone},${tone},${tone},${0.012 + random() * 0.03})`;
    context.lineWidth = 6 + random() * 26;
    context.beginPath();
    const x = random() * size;
    const y = random() * size;
    context.arc(x, y, 18 + random() * 60, random() * Math.PI * 2, random() * Math.PI * 2);
    context.stroke();
  }

  // Smoke staining, heavier toward the top of the tile.
  const smoke = context.createLinearGradient(0, 0, 0, size);
  smoke.addColorStop(0, 'rgba(18,14,10,0.34)');
  smoke.addColorStop(0.45, 'rgba(18,14,10,0.06)');
  smoke.addColorStop(1, 'rgba(18,14,10,0.0)');
  context.fillStyle = smoke;
  context.fillRect(0, 0, size, size);

  speckle(context, size, random, { count: 3400, alpha: 0.045, maxRadius: 1.6 });
  return withNormal(canvas, repeat, 1.8);
}

export function createSootTexture({ seed = 44, repeat = 1 } = {}) {
  const canvas = createCanvas(256);
  const context = canvas.getContext('2d');
  const random = createSeededRandom(seed);
  const size = canvas.width;

  context.fillStyle = '#171310';
  context.fillRect(0, 0, size, size);
  for (let i = 0; i < 90; i += 1) {
    context.fillStyle = `rgba(70,58,48,${0.02 + random() * 0.07})`;
    context.beginPath();
    context.arc(random() * size, random() * size, 4 + random() * 30, 0, Math.PI * 2);
    context.fill();
  }
  speckle(context, size, random, { count: 1800, alpha: 0.06, maxRadius: 1.3 });
  return withNormal(canvas, repeat, 1.4);
}

/**
 * A roughness map from the same drawing: darker pixels read as worn and
 * polished, lighter as raw. What it actually buys is that a flame moving in
 * the room no longer slides across every surface at one uniform gloss.
 */
export function deriveRoughnessMap(sourceCanvas, { low = 0.42, high = 0.98, repeat = 1 } = {}) {
  const size = sourceCanvas.width;
  const source = sourceCanvas.getContext('2d').getImageData(0, 0, size, size).data;
  const target = createCanvas(size);
  const context = target.getContext('2d');
  const image = context.createImageData(size, size);

  for (let i = 0; i < size * size; i += 1) {
    const o = i * 4;
    const luminance = (source[o] * 0.299 + source[o + 1] * 0.587 + source[o + 2] * 0.114) / 255;
    const value = (low + (high - low) * luminance) * 255;
    image.data[o] = value;
    image.data[o + 1] = value;
    image.data[o + 2] = value;
    image.data[o + 3] = 255;
  }
  context.putImageData(image, 0, 0);

  const texture = new THREE.CanvasTexture(target);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeat, repeat);
  return texture;
}

/**
 * A flame: a soft teardrop, brightest at the base, used as an additive sprite.
 * Cheaper than a bloom pass and it works on every device.
 */
export function createFlameTexture() {
  const canvas = createCanvas(128);
  const context = canvas.getContext('2d');
  const { width: size } = canvas;

  const gradient = context.createRadialGradient(size / 2, size * 0.66, 0, size / 2, size * 0.66, size * 0.5);
  gradient.addColorStop(0, 'rgba(255,244,214,1)');
  gradient.addColorStop(0.22, 'rgba(255,196,104,0.92)');
  gradient.addColorStop(0.55, 'rgba(255,132,40,0.4)');
  gradient.addColorStop(1, 'rgba(255,96,20,0)');
  context.fillStyle = gradient;
  context.beginPath();
  context.ellipse(size / 2, size * 0.6, size * 0.3, size * 0.44, 0, 0, Math.PI * 2);
  context.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** A soft radial falloff, used as the sprite for embers and hotspot markers. */
export function createGlowTexture() {
  const canvas = createCanvas(128);
  const context = canvas.getContext('2d');
  const half = canvas.width / 2;
  const gradient = context.createRadialGradient(half, half, 0, half, half, half);
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.35, 'rgba(255,225,180,0.55)');
  gradient.addColorStop(1, 'rgba(255,190,120,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/** Bell's confession: a page of unreadable hand, because it is not for us. */
export function createPageTexture({ seed = 61 } = {}) {
  const canvas = createCanvas(256);
  const context = canvas.getContext('2d');
  const random = createSeededRandom(seed);
  const size = canvas.width;

  context.fillStyle = '#d9cdb2';
  context.fillRect(0, 0, size, size);
  for (let i = 0; i < 120; i += 1) {
    context.fillStyle = `rgba(150,130,95,${0.02 + random() * 0.05})`;
    context.beginPath();
    context.arc(random() * size, random() * size, 3 + random() * 18, 0, Math.PI * 2);
    context.fill();
  }
  context.strokeStyle = 'rgba(40,28,18,0.62)';
  for (let line = 0; line < 17; line += 1) {
    const y = 26 + line * 13;
    let x = 24 + random() * 8;
    const end = size - 24 - random() * 40;
    context.lineWidth = 1.1;
    context.beginPath();
    context.moveTo(x, y);
    while (x < end) {
      const step = 3 + random() * 6;
      x += step;
      context.lineTo(x, y + (random() - 0.5) * 3.4);
    }
    context.stroke();
  }
  return finalise(canvas, { repeat: 1 });
}
