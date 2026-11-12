/**
 * How she looks: surfaces, light, the sky and the sea.
 *
 * The owner, 11 November 2026, of a bridge wing drawn in clean shapes and flat colours: "It still looks like Lego create a
 * realistic bridge"; "you have no budget on the 3d model, focus on photorealism and reality". What reads as plastic bricks is
 * one flat colour on every face under one flat light. This file is what answers it, for everything aboard at once:
 *
 *   1. Surfaces. Each material is told what it is made of (the file's `surface`: paint, deck coating, wood, metal, leather,
 *      laminate, vinyl, plastic, primer, matt), and gets that material's own grain: a relief the light catches, a sheen
 *      that is not the same everywhere, a colour that is not one number. It is worked out where it is drawn, from the
 *      place on the ship itself, so nothing is fetched for it and nothing needs unwrapping; it fades where a grain is
 *      smaller than what one dot of the screen covers, so it does not sparkle far away.
 *   2. The light of the place. How much light reaches each place aboard, and from which side, is worked out when she is
 *      built by tracing rays through her (blender/light.py, data/light.bin.gz): a room is lit by its windows and lamps and
 *      by what its own deck and walls throw back, and is darker in its corners. Every surface takes its light from there.
 *      The sun itself, and its sharp shadows, are the viewer's own lamp.
 *   3. Light where things meet. In a corner, under a foot, behind a pipe, less is seen of what lights the place: that shade
 *      is what sets a thing on the deck instead of over it. It is worked out from what is on the screen.
 *   4. The day she stands in: a sky with clouds, a sea that moves, the glare of what is too bright to look at, and an eye
 *      that opens as one goes in from the deck and closes again coming out.
 *
 * It stands apart from the viewer (app.js) and knows nothing of ships.
 */
import * as THREE from 'three';
import { EffectComposer } from './vendor/three/postprocessing/EffectComposer.js';
import { RenderPass } from './vendor/three/postprocessing/RenderPass.js';
import { GTAOPass } from './vendor/three/postprocessing/GTAOPass.js';
import { UnrealBloomPass } from './vendor/three/postprocessing/UnrealBloomPass.js';
import { OutputPass } from './vendor/three/postprocessing/OutputPass.js';

/**
 * The day. These are blender/light.py's figures (the light file carries them, and `light.set` takes them from it, so the
 * two cannot drift): from her toward the sun, what the sun gives a surface that faces it, and the sky's radiance overhead,
 * at the horizon and looking down past her.
 */
export const day = {
  sun: new THREE.Vector3(-0.6, 0.72, 0.36).normalize(),
  sunLight: new THREE.Color(9.0, 8.46, 7.56),
  zenith: new THREE.Color(0.16, 0.34, 0.80),
  horizon: new THREE.Color(0.66, 0.78, 0.95),
  below: new THREE.Color(0.20, 0.24, 0.27),
  glow: new THREE.Color(0.5, 0.45, 0.375),
  time: { value: 0 },
};
const dayUniforms = () => ({ uSun: { value: day.sun }, uSunLight: { value: day.sunLight }, uZenith: { value: day.zenith }, uHorizon: { value: day.horizon }, uBelow: { value: day.below }, uGlow: { value: day.glow }, uTime: day.time });
const SKY = `
uniform vec3 uSun, uSunLight, uZenith, uHorizon, uBelow, uGlow;
uniform float uTime;
vec3 skyColour(vec3 n) {
  vec3 c = n.y >= 0.0 ? mix(uHorizon, uZenith, sqrt(n.y)) : mix(uHorizon * 0.8, uBelow, pow(min(-n.y * 4.0, 1.0), 0.6));
  return c + uGlow * pow(max(dot(n, uSun), 0.0), 10.0);
}
float skHash(vec2 p) { p = fract(p * vec2(0.1031, 0.1030)); p += dot(p, p.yx + 33.33); return fract((p.x + p.y) * p.y); }
float skNoise(vec2 x) {
  vec2 i = floor(x), t = fract(x); t = t * t * (3.0 - 2.0 * t);
  return mix(mix(skHash(i), skHash(i + vec2(1, 0)), t.x), mix(skHash(i + vec2(0, 1)), skHash(i + vec2(1, 1)), t.x), t.y);
}
float skFbm(vec2 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++) { s += a * skNoise(p); p = p * 2.03 + 17.1; a *= 0.5; } return s; }
`;

// ---------------------------------------------------------------------------------------------------------------------
// The light of the place
// ---------------------------------------------------------------------------------------------------------------------
/**
 * What blender/light.py found, as the page keeps it: two blocks of the same grid. `set` takes the file; `at` says how
 * light a place is (for the eye's opening); `eye` is where the looker stands (a surface asks for the light a little
 * toward the looker, so that a thin wall does not let the next room's light through).
 */
export const light = {
  on: false, head: null, bytes: null,
  uniforms: {
    uLightA: { value: null }, uLightB: { value: null }, uLightMin: { value: new THREE.Vector3() }, uLightSize: { value: new THREE.Vector3(1, 1, 1) },
    uLightScale: { value: 8 }, uLightOn: { value: 0 }, uLightOpen: { value: 1.3 }, uLightCell: { value: 0.4 }, uLightEye: { value: new THREE.Vector3() },
  },
  set(head, bytes) {
    const [nx, ny, nz] = head.grid, n = nx * ny * nz * 4, u = this.uniforms;
    const block = at => {
      const t = new THREE.Data3DTexture(bytes.subarray(at, at + n), nx, ny, nz);
      t.format = THREE.RGBAFormat; t.type = THREE.UnsignedByteType; t.minFilter = t.magFilter = THREE.LinearFilter;
      t.wrapS = t.wrapT = t.wrapR = THREE.ClampToEdgeWrapping; t.unpackAlignment = 1; t.needsUpdate = true;
      return t;
    };
    u.uLightA.value = block(0); u.uLightB.value = block(n);
    u.uLightMin.value.fromArray(head.min); u.uLightSize.value.set(nx, ny, nz).multiplyScalar(head.cell);
    u.uLightScale.value = head.scale; u.uLightCell.value = head.cell; u.uLightOn.value = 1;
    day.sun.fromArray(head.sun.dir).normalize(); day.sunLight.fromArray(head.sun.light);
    day.zenith.fromArray(head.sky.zenith); day.horizon.fromArray(head.sky.horizon); day.below.fromArray(head.sky.below); day.glow.fromArray(head.sky.glow);
    this.head = head; this.bytes = bytes; this.on = true;
    // how light it is in the open, by the same measure as `at`
    const top = head.min[1] + (ny - 1.5) * head.cell;
    u.uLightOpen.value = this.open = this.at(head.min[0] + 0.6 * head.cell, top, head.min[2] + 0.6 * head.cell);
  },
  /** How open the place is: the share of what it sees that is sky or sea and not her own steel (1 on an open deck, 0 in a room without windows). */
  openAt(x, y, z) {
    if (!this.on) return 1;
    const h = this.head, [nx, ny, nz] = h.grid, c = h.cell;
    const i = Math.min(nx - 1, Math.max(0, Math.floor((x - h.min[0]) / c))), j = Math.min(ny - 1, Math.max(0, Math.floor((y - h.min[1]) / c))), k = Math.min(nz - 1, Math.max(0, Math.floor((z - h.min[2]) / c)));
    return this.bytes[(i + nx * (j + ny * k)) * 4 + 3] / 255;
  },
  /** How light the place is (the light it gets taken all round), from the grid point nearest it. */
  at(x, y, z) {
    if (!this.on) return 1.3;
    const h = this.head, [nx, ny, nz] = h.grid, c = h.cell;
    const i = Math.min(nx - 1, Math.max(0, Math.floor((x - h.min[0]) / c))), j = Math.min(ny - 1, Math.max(0, Math.floor((y - h.min[1]) / c))), k = Math.min(nz - 1, Math.max(0, Math.floor((z - h.min[2]) / c)));
    const o = (i + nx * (j + ny * k)) * 4, b = this.bytes, s = v => (v / 255) ** 2 * h.scale;
    return 0.2126 * s(b[o]) + 0.7152 * s(b[o + 1]) + 0.0722 * s(b[o + 2]);
  },
};

/**
 * What each kind of surface is like. Lengths in metres.
 *   grain   the size of one grain, and how it is drawn out along x, y and z (a brushed or sawn surface runs one way)
 *   relief  how high the grain stands
 *   sheen   how much its roughness swings with the grain
 *   tone    how much its colour swings with the grain
 *   patch   the size of the larger unevenness (wear, weather, the painter's hand) and how much colour and sheen swing with it
 *   plate   for what is steel plate under its coat: how far the plate dishes between its stiffeners (metres). Welded plating is
 *           never flat: it pulls in toward each frame and stiffener, its seams and butts stand a little proud, and water
 *           leaves its streaks down it. That is what tells painted steel from plastic. Stiffeners are taken 0.6 m apart
 *           along her and 0.68 m the other way, seams every third stiffener and butts every twelfth frame.
 */
export const SURFACES = {
  paint:    { grain: 0.0035, along: [1, 1, 1],    relief: 0.000030, sheen: 0.05, tone: 0.015, patch: 0.90, patchTone: 0.035, plate: 0.0032 },
  primer:   { grain: 0.0040, along: [1, 1, 1],    relief: 0.000040, sheen: 0.06, tone: 0.030, patch: 0.60, patchTone: 0.060, plate: 0.0020 },
  matt:     { grain: 0.0030, along: [1, 1, 1],    relief: 0.000060, sheen: 0.05, tone: 0.040, patch: 0.70, patchTone: 0.070, plate: 0.0024 },
  deck:     { grain: 0.0045, along: [1, 1, 1],    relief: 0.000350, sheen: 0.10, tone: 0.070, patch: 0.80, patchTone: 0.060, plate: 0.0012 },
  metal:    { grain: 0.0010, along: [1, 1, 0.05], relief: 0.000010, sheen: 0.12, tone: 0.030, patch: 0.30, patchTone: 0.030 },
  wood:     { grain: 0.0060, along: [1, 1, 0.03], relief: 0.000060, sheen: 0.10, tone: 0.160, patch: 0.25, patchTone: 0.080 },
  leather:  { grain: 0.0022, along: [1, 1, 1],    relief: 0.000120, sheen: 0.08, tone: 0.050, patch: 0.30, patchTone: 0.050 },
  laminate: { grain: 0.0030, along: [1, 1, 1],    relief: 0.000012, sheen: 0.03, tone: 0.012, patch: 1.20, patchTone: 0.020 },
  vinyl:    { grain: 0.0018, along: [1, 1, 1],    relief: 0.000030, sheen: 0.05, tone: 0.060, patch: 0.90, patchTone: 0.040 },
  plastic:  { grain: 0.0012, along: [1, 1, 1],    relief: 0.000008, sheen: 0.03, tone: 0.010, patch: 0.50, patchTone: 0.015 },
};

const f = v => (Number.isInteger(v) ? v.toFixed(1) : String(v));
const NOISE = `
float sfHash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float sfNoise(vec3 x) {
  vec3 i = floor(x), t = fract(x); t = t * t * (3.0 - 2.0 * t);
  return mix(mix(mix(sfHash(i), sfHash(i + vec3(1, 0, 0)), t.x), mix(sfHash(i + vec3(0, 1, 0)), sfHash(i + vec3(1, 1, 0)), t.x), t.y),
             mix(mix(sfHash(i + vec3(0, 0, 1)), sfHash(i + vec3(1, 0, 1)), t.x), mix(sfHash(i + vec3(0, 1, 1)), sfHash(i + vec3(1, 1, 1)), t.x), t.y), t.z);
}
float sfGrain(vec3 p) { return 0.58 * sfNoise(p) + 0.29 * sfNoise(p * 2.07 + 5.3) + 0.13 * sfNoise(p * 4.31 + 11.7); }
`;
const PLACE = `
varying vec3 vSurfaceAt;
varying vec3 vSurfaceN;
uniform sampler3D uLightA, uLightB;
uniform vec3 uLightMin, uLightSize, uLightEye;
uniform float uLightScale, uLightOn, uLightOpen, uLightCell;
`;

/**
 * Give a lit material the light of its place and, when its kind is known, the surface of that kind. A material that is not
 * lit (a screen, a dial) is left as it is.
 */
export function surface(material, kind) {
  if (!material.isMeshStandardMaterial) return material;
  const s = SURFACES[kind];
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, light.uniforms);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vSurfaceAt;\nvarying vec3 vSurfaceN;')
      .replace('#include <beginnormal_vertex>', '#include <beginnormal_vertex>\nvSurfaceN = objectNormal;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvSurfaceAt = position;');
    let frag = shader.fragmentShader
      .replace('#include <common>', '#include <common>\n' + PLACE + NOISE)
      .replace('#include <lights_fragment_maps>', `#include <lights_fragment_maps>
        if (uLightOn > 0.5) {
          // The light of this place, from the grid: asked for half a step out from the surface and a little toward the
          // looker, so that a thin wall does not let through what is on its other side.
          vec3 lvN = normalize(vSurfaceN);
          #ifdef DOUBLE_SIDED
            if (!gl_FrontFacing) lvN = -lvN;
          #endif
          vec3 lvP = vSurfaceAt + lvN * (0.6 * uLightCell) + normalize(uLightEye - vSurfaceAt) * (0.3 * uLightCell);
          vec3 lvT = (lvP - uLightMin) / uLightSize;
          vec4 lvA = texture(uLightA, lvT);
          vec3 lvV = texture(uLightB, lvT).xyz * 2.0 - 1.0;
          vec3 lvE = lvA.rgb * lvA.rgb * uLightScale * max(0.2, 1.0 + dot(lvV, lvN));
          iblIrradiance = lvE;
          // What a surface mirrors is its own room, not the open sky: the sky's mirror image is let down with the light.
          float lvOpen = clamp(dot(lvE, vec3(0.2126, 0.7152, 0.0722)) / uLightOpen, 0.0, 1.0);
          radiance *= 0.1 + 0.9 * lvOpen;
          #ifdef USE_CLEARCOAT
            clearcoatRadiance *= 0.1 + 0.9 * lvOpen;
          #endif
        }`);
    if (s) frag = frag
      .replace('#include <color_fragment>', `#include <color_fragment>
        // how much of the ship one dot of the screen covers here: a grain smaller than that is left out
        float sfDot = max(length(dFdx(vSurfaceAt)), length(dFdy(vSurfaceAt)));
        float sfShown = 1.0 - smoothstep(0.35, 1.3, sfDot / ${f(s.grain)});
        float sfG = sfGrain(vSurfaceAt * vec3(${s.along.map(f).join(', ')}) / ${f(s.grain)});
        float sfP = sfNoise(vSurfaceAt / ${f(s.patch)} + 3.7) * 0.65 + sfNoise(vSurfaceAt / ${f(s.patch * 0.31)} + 9.1) * 0.35;
        diffuseColor.rgb *= 1.0 + ${f(s.tone)} * (sfG - 0.5) * 2.0 * sfShown + ${f(s.patchTone)} * (sfP - 0.5) * 2.0;
        ${s.plate ? `
        // steel plate under its coat: along her and up a wall, along and across a deck
        vec3 plN = abs(normalize(vSurfaceN));
        vec2 plAt = plN.y > 0.6 ? vSurfaceAt.zx : (plN.x > plN.z ? vSurfaceAt.zy : vSurfaceAt.xy);
        vec2 plCell = plAt / vec2(0.6, 0.68);
        float plSeen = 1.0 - smoothstep(0.08, 0.35, sfDot / 0.6);
        float plDish = cos(6.2832 * plCell.x) * cos(6.2832 * plCell.y);
        // a seam every third stiffener, a butt every twelfth frame: a line no finer than the screen can draw
        vec2 plTo = abs(fract(plCell / vec2(12.0, 3.0) + 0.5) - 0.5) * vec2(12.0 * 0.6, 3.0 * 0.68);
        float plWide = max(0.007, 1.2 * sfDot), plLine = max(1.0 - plTo.x / plWide, 1.0 - plTo.y / plWide);
        float plSeam = clamp(plLine, 0.0, 1.0) * min(1.0, 0.007 / plWide * 2.5);
        // where water runs down a wall it leaves streaks, and a seam holds a little dirt
        float plStreak = plN.y > 0.6 ? 0.0 : sfNoise(vec3(plAt.x * 7.0, plAt.y * 0.22, 3.3)) * sfNoise(vec3(plAt.x * 1.3, plAt.y * 0.05, 9.9));
        diffuseColor.rgb *= 1.0 - 0.07 * plSeam - 0.08 * plStreak * plSeen;` : ''}`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        roughnessFactor = clamp(roughnessFactor + ${f(s.sheen)} * (sfG - 0.5) * 2.0 * sfShown + ${f(s.patchTone)} * (sfP - 0.5), 0.04, 1.0);`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        {
          // the grain's relief turns the face a little toward or away from the light (a height, in metres, differenced across the screen)
          float sfH = sfG * ${f(s.relief)} * sfShown${s.plate ? ` + ${f(s.plate)} * plDish * plSeen + 0.0012 * plSeam` : ''};
          vec3 sfX = dFdx(-vViewPosition), sfY = dFdy(-vViewPosition);
          vec3 sfR1 = cross(sfY, normal), sfR2 = cross(normal, sfX);
          float sfDet = dot(sfX, sfR1);
          normal = normalize(abs(sfDet) * normal - sign(sfDet) * (dFdx(sfH) * sfR1 + dFdy(sfH) * sfR2));
        }`);
    shader.fragmentShader = frag;
  };
  material.customProgramCacheKey = () => 'surface:' + (s ? kind : '');
  return material;
}

// ---------------------------------------------------------------------------------------------------------------------
// The sky and the sea
// ---------------------------------------------------------------------------------------------------------------------
/**
 * The sky: a dome that goes with the looker, drawn behind everything. Blue overhead, pale at the horizon, brighter toward
 * the sun, with the sun's own disc and a layer of cloud that drifts. `env(renderer)` is the same sky without the sun's
 * disc, as the picture every polished surface mirrors.
 */
export function createSky({ lite = false } = {}) {
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false,
    uniforms: { ...dayUniforms(), uDisc: { value: 1 } },
    vertexShader: 'varying vec3 vDir; void main() { vDir = position; vec4 p = modelViewMatrix * vec4(position, 0.0); gl_Position = projectionMatrix * vec4(p.xyz, 1.0); gl_Position.z = gl_Position.w; }',
    fragmentShader: `${lite ? '#define LITE' : ''}
      varying vec3 vDir; uniform float uDisc; ${SKY}
      void main() {
        vec3 n = normalize(vDir);
        vec3 c = skyColour(n);
        #ifdef LITE
          if (n.y > 0.0) c += uSunLight * 3.2 * uDisc * smoothstep(0.99975, 0.99992, dot(n, uSun));
        #else
        if (n.y > 0.0) {
          // a layer of cloud: flat sheets seen from below, near overhead and small toward the horizon
          vec2 uv = n.xz / (n.y + 0.16) * 0.85 + uTime * vec2(0.0035, 0.0012);
          float d = skFbm(uv), toward = skFbm(uv + normalize(uSun.xz) * 0.07);
          float cover = smoothstep(0.50, 0.74, d) * smoothstep(0.015, 0.16, n.y);
          float lit = clamp(0.62 + (d - toward) * 3.2 + 0.25 * uSun.y, 0.35, 1.25);
          vec3 cloud = mix(uHorizon * 0.78, vec3(1.0, 0.985, 0.96) * 1.25, lit);
          c = mix(c, cloud, cover * 0.94);
          c += uSunLight * 3.2 * uDisc * smoothstep(0.99975, 0.99992, dot(n, uSun)) * (1.0 - cover);
        }
        #endif
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), material);
  dome.frustumCulled = false; dome.renderOrder = -10; dome.userData.backdrop = true; dome.matrixAutoUpdate = false;
  return {
    dome,
    env(renderer) {
      const scene = new THREE.Scene(), copy = new THREE.Mesh(new THREE.SphereGeometry(50, 48, 32), material);
      scene.add(copy);
      material.uniforms.uDisc.value = 0;
      const pmrem = new THREE.PMREMGenerator(renderer), texture = pmrem.fromScene(scene, 0.01).texture;
      material.uniforms.uDisc.value = 1;
      pmrem.dispose(); copy.geometry.dispose();
      return texture;
    },
  };
}

/**
 * The sea she floats in: level at her waterline, out to the horizon, with her own outline cut out of it (`waterline`:
 * (z, half breadth) from stern to stem), so that no room below the waterline has the sea standing in it. Its waves are worked
 * out where it is drawn: a swell, wind waves across it and ripples, the small ones left out where they are smaller than a
 * dot of the screen. It mirrors the sky by how flat one looks at it, glitters toward the sun and pales into the haze.
 * `shadow` is a second sheet of the same shape that takes only her shadow.
 */
export function createSea(waterline, { lite = false, reach = 4000 } = {}) {
  const shape = new THREE.Shape();
  shape.absarc(0, 0, reach, 0, Math.PI * 2, false);
  if (waterline && waterline.length > 2) {
    // inset by the plating's thickness and a little, so the sea runs into the plate and not short of it
    const inset = 0.03, side = waterline.map(([z, x]) => [Math.max(x - inset, 0), z]);
    const hole = new THREE.Path();
    hole.moveTo(side[0][0], side[0][1] + inset);
    for (const [x, z] of side) hole.lineTo(x, z + (z === side[0][1] ? inset : 0));
    for (const [x, z] of side.slice().reverse()) if (x > 0) hole.lineTo(-x, z + (z === side[0][1] ? inset : 0));
    hole.closePath();
    shape.holes.push(hole);
  }
  // the shape is drawn in (x, z) and laid flat: x stays, the shape's second axis becomes z
  const geometry = new THREE.ShapeGeometry(shape, 96);
  const pos = geometry.attributes.position;
  for (let i = 0; i < pos.count; i++) pos.setXYZ(i, pos.getX(i), 0, pos.getY(i));
  geometry.computeVertexNormals();
  const material = new THREE.ShaderMaterial({
    fog: false, side: THREE.DoubleSide,
    uniforms: { ...dayUniforms(), uWater: { value: new THREE.Color(0.012, 0.058, 0.085) }, uCalm: { value: 1 }, uMirror: { value: null }, uMirrorAt: { value: new THREE.Matrix4() }, uMirrorOn: { value: 0 } },
    vertexShader: 'varying vec3 vAt; varying vec4 vMirror; uniform mat4 uMirrorAt; void main() { vec4 w = modelMatrix * vec4(position, 1.0); vAt = w.xyz; vMirror = uMirrorAt * w; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `${lite ? '#define LITE' : ''}
      varying vec3 vAt; varying vec4 vMirror; uniform vec3 uWater; uniform float uCalm, uMirrorOn; uniform sampler2D uMirror; ${SKY}
      vec2 wave(vec2 p, vec2 dir, float len, float height, float speed) {
        float k = 6.2832 / len;
        return dir * (k * height * cos(dot(p, dir) * k + uTime * speed * k));
      }
      void main() {
        vec3 toEye = cameraPosition - vAt;
        float far = length(toEye);
        vec3 V = toEye / far;
        vec2 p = vAt.xz;
        // one dot of the screen covers this much sea: a wave is left out well before it is as short as that
        float dotSize = max(length(dFdx(p)), length(dFdy(p)));
        #define SEEN(len) (1.0 - smoothstep(0.10, 0.42, dotSize / (len)))
        // the wind comes in patches, and no crest runs straight for long: the place a wave is asked at wanders a little
        #ifdef LITE
          float gust = 1.0; vec2 wander = vec2(0.0);
        #else
          float gust = 0.5 + 1.0 * skNoise(p * 0.009 + uTime * 0.008);
          vec2 wander = vec2(skNoise(p * 0.031 + 3.1), skNoise(p * 0.031 + 47.7)) - 0.5;
        #endif
        vec2 g = vec2(0.0);
        g += wave(p + wander * 9.0, vec2(0.819, 0.574), 47.0, 0.34, 4.3) * SEEN(47.0);
        g += wave(p + wander * 7.0, vec2(0.530, 0.848), 29.0, 0.20, 3.4) * SEEN(29.0);
        g += wave(p + wander * 6.0, vec2(0.966, 0.259), 17.3, 0.11, 2.6) * SEEN(17.3) * gust;
        vec2 swell = g;                                            // the long waves alone: what bends a mirror image
        g += wave(p + wander * 5.0, vec2(0.292, 0.956), 11.1, 0.075, 2.1) * SEEN(11.1) * gust;
        #ifndef LITE
        g += wave(p + wander * 4.0, vec2(0.743, -0.669), 6.7, 0.040, 1.6) * SEEN(6.7) * gust;
        g += wave(p + wander * 3.0, vec2(-0.208, 0.978), 4.1, 0.026, 1.25) * SEEN(4.1) * gust;
        g += wave(p + wander * 2.0, vec2(0.899, 0.438), 2.3, 0.014, 0.95) * SEEN(2.3) * gust;
        g += wave(p + wander * 1.2, vec2(0.423, -0.906), 1.27, 0.0075, 0.7) * SEEN(1.27) * gust;
        // the wind's ripple, which has no one direction
        vec2 q = p * 2.6 + uTime * vec2(0.31, 0.17);
        float r0 = skFbm(q), e = 0.11;
        g += vec2(skFbm(q + vec2(e, 0.0)) - r0, skFbm(q + vec2(0.0, e)) - r0) * (0.30 / e) * 0.5 * SEEN(0.6) * gust;
        #endif
        // what was left out is still there on the sea: a surface too finely ruffled to see mirrors less cleanly
        float lost = 1.0 - SEEN(2.3);
        vec3 N = normalize(vec3(-g.x, 1.0, -g.y) * vec3(uCalm, 1.0, uCalm));
        if (V.y < 0.0) { N = -N; }                               // from below, the underside of the surface
        float cosV = max(dot(N, V), 0.0);
        float mirror = 0.02 + 0.98 * pow(1.0 - cosV, 5.0);
        mirror = mix(mirror, mirror * 0.55 + 0.035, lost);
        vec3 R = reflect(-V, N); R.y = abs(R.y);
        vec3 seen = skyColour(R);
        if (uMirrorOn > 0.5) {
          // what stands over the water is mirrored in it, broken up by the waves
          // (bent by the long waves, and drawn out by the short ones: three looks a little apart, taken together)
          vec2 bend = swell * 0.42, ruffle = (g - swell) * 0.10;
          vec4 at = vMirror; at.xy += bend * at.w;
          vec4 hers = texture2DProj(uMirror, at + vec4(ruffle, 0.0, 0.0) * at.w)
                    + texture2DProj(uMirror, at + vec4(ruffle * 2.2 + vec2(0.0, 0.012), 0.0, 0.0) * at.w)
                    + texture2DProj(uMirror, at + vec4(ruffle * -1.4 - vec2(0.0, 0.010), 0.0, 0.0) * at.w);
          hers /= 3.0;
          seen = mix(seen, hers.rgb / max(hers.a, 0.001), hers.a * mix(1.0, 0.6, lost));
        }
        // the water's own colour: darker looking down into it, greener where the sun gets into a wave's face
        vec3 body = uWater * (0.6 + 0.9 * max(uSun.y, 0.0)) + vec3(0.0, 0.035, 0.03) * pow(max(dot(N, uSun) - uSun.y + 0.25, 0.0), 2.0);
        body += (uZenith * 0.5 + uHorizon * 0.5) * 0.05 * lost;
        vec3 c = mix(body, seen, mirror);
        // the sun's glitter, sharper close to and smeared out far away
        float sharp = mix(900.0, 90.0, smoothstep(30.0, 900.0, far));
        c += uSunLight * 0.9 * pow(max(dot(R, uSun), 0.0), sharp) * mix(1.0, 0.25, smoothstep(30.0, 900.0, far));
        // the haze toward the horizon
        c = mix(c, uHorizon * 0.9 + uGlow * pow(max(dot(-V, uSun), 0.0), 10.0), 1.0 - exp(-far / 1700.0));
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  const mesh = new THREE.Mesh(geometry, material);
  mesh.frustumCulled = false; mesh.userData.sea = true;
  const shadow = new THREE.Mesh(geometry, new THREE.ShadowMaterial({ opacity: 0.38, depthWrite: false }));
  shadow.position.y = 0.012; shadow.receiveShadow = true; shadow.frustumCulled = false; shadow.renderOrder = 2;
  // The lap of the water against her: a band of broken water round her waterline, widest where the swell lifts against her
  // and thinning to nothing half a metre out. It is a ribbon laid on the sea, drawn from her own outline.
  let lap = null;
  if (waterline && waterline.length > 2) {
    const ring = [...waterline.map(([z, x]) => [x, z]), ...waterline.slice().reverse().filter(([, x]) => x > 0).map(([z, x]) => [-x, z])];
    const n = ring.length, pos = [], edge = [], idx = [];
    for (let i = 0; i < n; i++) {
      const a = ring[(i + n - 1) % n], b = ring[(i + 1) % n], q = ring[i];
      let nx = b[1] - a[1], nz = -(b[0] - a[0]);
      const m = Math.hypot(nx, nz) || 1; nx /= m; nz /= m;
      if (nx * q[0] + nz * (q[1] - (ring[0][1] + ring[Math.floor(n / 4)][1]) / 2) < 0 && Math.abs(q[0]) > 0.2) { nx = -nx; nz = -nz; }
      pos.push(q[0] - nx * 0.04, 0, q[1] - nz * 0.04, q[0] + nx * 0.55, 0, q[1] + nz * 0.55);
      edge.push(0, 1);
      const j = (i + 1) % n;
      idx.push(2 * i, 2 * j, 2 * i + 1, 2 * j, 2 * j + 1, 2 * i + 1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('edge', new THREE.Float32BufferAttribute(edge, 1));
    g.setIndex(idx);
    lap = new THREE.Mesh(g, new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide, fog: false, uniforms: dayUniforms(),
      vertexShader: 'attribute float edge; varying float vEdge; varying vec3 vAt; void main() { vEdge = edge; vec4 w = modelMatrix * vec4(position, 1.0); vAt = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: `varying float vEdge; varying vec3 vAt; ${SKY}
        void main() {
          vec2 p = vAt.xz;
          float along = skFbm(p * 0.9 + uTime * vec2(0.21, 0.13));                       // where it is broken and where it is smooth
          float fine = skFbm(p * 7.0 - uTime * vec2(0.5, 0.3));
          float swell = 0.5 + 0.5 * sin(dot(p, vec2(0.819, 0.574)) * 0.1337 + uTime * 0.575);      // the long wave coming and going
          float reach = mix(0.35, 1.0, swell) * (0.45 + 0.9 * along);
          float a = smoothstep(reach, reach * 0.25, vEdge) * smoothstep(0.30, 0.62, fine + 0.35 * (1.0 - vEdge));
          vec3 c = (uHorizon * 0.75 + uZenith * 0.25) * 0.9 + uSunLight * 0.07 * max(uSun.y, 0.0);
          gl_FragColor = vec4(c, a * 0.85);
        }`,
    }));
    lap.position.y = 0.02; lap.frustumCulled = false; lap.renderOrder = 3;
  }
  // Her mirror image: she is drawn once more as the sea sees her, from under the water looking up, and the sea shows that
  // picture where its waves let it. Left out on the light way.
  const mirror = lite ? null : new THREE.WebGLRenderTarget(1024, 640, { type: THREE.HalfFloatType });
  const below = new THREE.PerspectiveCamera(), waterline0 = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const eye = new THREE.Vector3(), ahead = new THREE.Vector3(), up = new THREE.Vector3(), turn = new THREE.Matrix4(), was = new THREE.Color();
  material.uniforms.uMirror.value = mirror ? mirror.texture : null;
  /** Draw the mirror picture for this camera. `others` are things that are not hers and are left out (the sky, the slip). */
  function reflect(renderer, scene, camera, others = []) {
    const u = material.uniforms;
    camera.updateMatrixWorld();
    eye.setFromMatrixPosition(camera.matrixWorld);
    // From inside a room her mirror image is not to be seen: it is drawn only for an eye that stands in the open.
    if (!mirror || !mesh.visible || eye.y < 0.05 || light.openAt(eye.x, eye.y, eye.z) < 0.3) { u.uMirrorOn.value = 0; return; }
    turn.extractRotation(camera.matrixWorld);
    ahead.set(0, 0, -1).applyMatrix4(turn).add(eye);
    up.set(0, 1, 0).applyMatrix4(turn);
    below.position.set(eye.x, -eye.y, eye.z);
    below.up.set(up.x, -up.y, up.z);
    below.lookAt(ahead.x, -ahead.y, ahead.z);
    below.updateMatrixWorld();
    below.projectionMatrix.copy(camera.projectionMatrix); below.projectionMatrixInverse.copy(camera.projectionMatrixInverse);
    u.uMirrorAt.value.set(0.5, 0, 0, 0.5, 0, 0.5, 0, 0.5, 0, 0, 0.5, 0.5, 0, 0, 0, 1).multiply(below.projectionMatrix).multiply(below.matrixWorldInverse);
    const hide = [mesh, shadow, lap, ...others].filter(o => o && o.visible);
    for (const o of hide) o.visible = false;
    const target = renderer.getRenderTarget(), planes = renderer.clippingPlanes, alpha = renderer.getClearAlpha(), auto = renderer.shadowMap.autoUpdate, need = renderer.shadowMap.needsUpdate;
    renderer.getClearColor(was);
    renderer.clippingPlanes = [waterline0];                 // only what is above the water is mirrored
    renderer.shadowMap.autoUpdate = false; renderer.shadowMap.needsUpdate = false;
    renderer.setRenderTarget(mirror); renderer.setClearColor(0x000000, 0); renderer.clear();
    renderer.render(scene, below);
    renderer.setRenderTarget(target); renderer.setClearColor(was, alpha); renderer.clippingPlanes = planes;
    renderer.shadowMap.autoUpdate = auto; renderer.shadowMap.needsUpdate = need;
    for (const o of hide) o.visible = true;
    u.uMirrorOn.value = 1;
  }
  return { mesh, shadow, lap, material, reflect };
}

// ---------------------------------------------------------------------------------------------------------------------
// The drawing of a frame
// ---------------------------------------------------------------------------------------------------------------------
/**
 * A frame is drawn, shaded where things meet, given the glare of what is too bright, and brought to what a screen can
 * show. `hidden(object)` says what is left out when the shade is worked out (glass: what stands behind a pane is shaded as
 * if the pane were not there; the sky).
 * `lite` leaves the glare out (see `lite` in app.js).
 * Returns { render(), setSize(width, height), shade, glare, expose(dt) }: `expose` opens or closes the eye toward the light
 * of the place the camera is in, a little each call, and says whether it is still moving.
 */
export function createLook(renderer, scene, camera, { hidden = () => false, radius = 0.32, strength = 1.0, lite = false } = {}) {
  const size = renderer.getDrawingBufferSize(new THREE.Vector2());
  const samples = renderer.capabilities.isWebGL2 ? Math.min(4, renderer.capabilities.maxSamples) : 0;
  const target = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples });
  const composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));
  // The shade is worked out at half the picture's size each way and spread over it: at the full size it took two thirds of
  // a frame's time on foot (34 of 50 ms at 3200 by 2000, measured), and the light of the place now carries the large shade.
  const SHADE_SIZE = 0.5, part = v => Math.max(1, Math.round(v * SHADE_SIZE));
  const shade = new GTAOPass(scene, camera, part(size.x), part(size.y));
  const sizeShade = shade.setSize.bind(shade);
  shade.setSize = (width, height) => sizeShade(part(width), part(height));
  shade.blendIntensity = strength;
  // The reach is in metres: what lies within a forearm's length shades a place. Twelve looks each way.
  shade.updateGtaoMaterial({ radius, distanceExponent: 1.4, thickness: 1.0, scale: 1.15, samples: 12, distanceFallOff: 1.0, screenSpaceRadius: false });
  shade.updatePdMaterial({ lumaPhi: 10.0, depthPhi: 2.0, normalPhi: 3.0, radius: 5.0, radiusExponent: 1.0, rings: 2.0, samples: 12 });
  // Leave out what the caller names, as well as what the pass itself leaves out (points and lines).
  const hide = shade.overrideVisibility.bind(shade), show = shade.restoreVisibility.bind(shade), put = [];
  shade.overrideVisibility = () => { hide(); scene.traverse(o => { if (o.visible && o.isMesh && hidden(o)) { o.visible = false; put.push(o); } }); };
  shade.restoreVisibility = () => { for (const o of put) o.visible = true; put.length = 0; show(); };
  composer.addPass(shade);
  // The glare: what is brighter than the screen's white spills a little over what is beside it, as it does in an eye or a lens.
  const glare = new UnrealBloomPass(new THREE.Vector2(part(size.x), part(size.y)), 0.16, 0.55, 2.4);
  const sizeGlare = glare.setSize.bind(glare);
  glare.setSize = (width, height) => sizeGlare(part(width), part(height));          // a glow needs no fine picture
  if (!lite) composer.addPass(glare);          // left out where the drawing is done without a graphics card: it costs several passes
  composer.addPass(new OutputPass());
  // The eye. In the open it is nearly shut; in a room it opens, by a good part of how much darker the room is.
  const eye = { open: 0.5, least: 0.5, most: 4.2, by: 0.80, pace: 2.2 };
  renderer.toneMappingExposure = eye.open;
  return {
    shade, glare, eye,
    render() {
      light.uniforms.uLightEye.value.copy(camera.position);
      glare.threshold = 1.25 / renderer.toneMappingExposure;
      composer.render();
    },
    setSize(width, height) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(width, height); },
    expose(dt, at = camera.position) {
      const here = Math.max(light.at(at.x, at.y, at.z), 0.02), open = light.on ? light.open : 1.3;
      const want = THREE.MathUtils.clamp(eye.least * Math.pow(open / here, eye.by), eye.least, eye.most);
      const step = 1 - Math.exp(-dt * eye.pace);
      const next = Math.abs(want - eye.open) < 0.004 ? want : eye.open + (want - eye.open) * step;
      const moving = next !== eye.open;
      eye.open = next;
      renderer.toneMappingExposure = next;
      return moving;
    },
  };
}
