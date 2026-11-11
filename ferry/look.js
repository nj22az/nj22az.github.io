/**
 * How she looks: surfaces and light.
 *
 * The owner, 11 November 2026, of a bridge wing drawn in clean shapes and flat colours: "It still looks like Lego create a
 * realistic bridge"; "Use the highest possible form of quality you can". What reads as plastic bricks is one flat colour on
 * every face under one flat light. Two things are added here, for everything aboard at once:
 *
 *   1. Surfaces. Each material is told what it is made of (the file's `surface`: paint, deck coating, wood, metal, leather,
 *      laminate, vinyl, plastic, primer, matt), and gets that material's own grain: a relief the light catches, a sheen
 *      that is not the same everywhere, a colour that is not one number. It is worked out where it is drawn, from the
 *      place on the ship itself, so nothing is fetched for it and nothing needs unwrapping; it fades where a grain is
 *      smaller than what one dot of the screen covers, so it does not sparkle far away.
 *   2. Light where things meet. In a corner, under a foot, behind a pipe, less of the sky is seen: that shade (ambient
 *      occlusion) is what sets a thing on the deck instead of over it. It is worked out from what is on the screen.
 *
 * It stands apart from the viewer (app.js) and knows nothing of ships: `surface(material, kind)` and `createLook(...)`.
 */
import * as THREE from 'three';
import { EffectComposer } from './vendor/three/postprocessing/EffectComposer.js';
import { RenderPass } from './vendor/three/postprocessing/RenderPass.js';
import { GTAOPass } from './vendor/three/postprocessing/GTAOPass.js';
import { OutputPass } from './vendor/three/postprocessing/OutputPass.js';

/**
 * What each kind of surface is like. Lengths in metres.
 *   grain   the size of one grain, and how it is drawn out along x, y and z (a brushed or sawn surface runs one way)
 *   relief  how high the grain stands
 *   sheen   how much its roughness swings with the grain
 *   tone    how much its colour swings with the grain
 *   patch   the size of the larger unevenness (wear, weather, the painter's hand) and how much colour and sheen swing with it
 */
export const SURFACES = {
  paint:    { grain: 0.0035, along: [1, 1, 1],    relief: 0.000030, sheen: 0.05, tone: 0.015, patch: 0.90, patchTone: 0.035 },
  primer:   { grain: 0.0040, along: [1, 1, 1],    relief: 0.000040, sheen: 0.06, tone: 0.030, patch: 0.60, patchTone: 0.060 },
  matt:     { grain: 0.0030, along: [1, 1, 1],    relief: 0.000060, sheen: 0.05, tone: 0.040, patch: 0.70, patchTone: 0.070 },
  deck:     { grain: 0.0045, along: [1, 1, 1],    relief: 0.000350, sheen: 0.10, tone: 0.070, patch: 0.80, patchTone: 0.060 },
  metal:    { grain: 0.0010, along: [1, 1, 0.05], relief: 0.000010, sheen: 0.12, tone: 0.030, patch: 0.30, patchTone: 0.030 },
  wood:     { grain: 0.0060, along: [1, 1, 0.03], relief: 0.000060, sheen: 0.10, tone: 0.160, patch: 0.25, patchTone: 0.080 },
  leather:  { grain: 0.0022, along: [1, 1, 1],    relief: 0.000120, sheen: 0.08, tone: 0.050, patch: 0.30, patchTone: 0.050 },
  laminate: { grain: 0.0030, along: [1, 1, 1],    relief: 0.000012, sheen: 0.03, tone: 0.012, patch: 1.20, patchTone: 0.020 },
  vinyl:    { grain: 0.0018, along: [1, 1, 1],    relief: 0.000030, sheen: 0.05, tone: 0.060, patch: 0.90, patchTone: 0.040 },
  plastic:  { grain: 0.0012, along: [1, 1, 1],    relief: 0.000008, sheen: 0.03, tone: 0.010, patch: 0.50, patchTone: 0.015 },
};

const f = v => (Number.isInteger(v) ? v.toFixed(1) : String(v));
const NOISE = `
varying vec3 vSurfaceAt;
float sfHash(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float sfNoise(vec3 x) {
  vec3 i = floor(x), t = fract(x); t = t * t * (3.0 - 2.0 * t);
  return mix(mix(mix(sfHash(i), sfHash(i + vec3(1, 0, 0)), t.x), mix(sfHash(i + vec3(0, 1, 0)), sfHash(i + vec3(1, 1, 0)), t.x), t.y),
             mix(mix(sfHash(i + vec3(0, 0, 1)), sfHash(i + vec3(1, 0, 1)), t.x), mix(sfHash(i + vec3(0, 1, 1)), sfHash(i + vec3(1, 1, 1)), t.x), t.y), t.z);
}
float sfGrain(vec3 p) { return 0.58 * sfNoise(p) + 0.29 * sfNoise(p * 2.07 + 5.3) + 0.13 * sfNoise(p * 4.31 + 11.7); }
`;

/** Give a lit material the surface of its kind. A material with no kind, or one that is not lit, is left as it is. */
export function surface(material, kind) {
  const s = SURFACES[kind];
  if (!s || !material.isMeshStandardMaterial) return material;
  material.onBeforeCompile = shader => {
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vSurfaceAt;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvSurfaceAt = position;');
    shader.fragmentShader = shader.fragmentShader
      .replace('#include <common>', '#include <common>\n' + NOISE)
      .replace('#include <color_fragment>', `#include <color_fragment>
        // how much of the ship one dot of the screen covers here: a grain smaller than that is left out
        float sfDot = max(length(dFdx(vSurfaceAt)), length(dFdy(vSurfaceAt)));
        float sfShown = 1.0 - smoothstep(0.35, 1.3, sfDot / ${f(s.grain)});
        float sfG = sfGrain(vSurfaceAt * vec3(${s.along.map(f).join(', ')}) / ${f(s.grain)});
        float sfP = sfNoise(vSurfaceAt / ${f(s.patch)} + 3.7) * 0.65 + sfNoise(vSurfaceAt / ${f(s.patch * 0.31)} + 9.1) * 0.35;
        diffuseColor.rgb *= 1.0 + ${f(s.tone)} * (sfG - 0.5) * 2.0 * sfShown + ${f(s.patchTone)} * (sfP - 0.5) * 2.0;`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
        roughnessFactor = clamp(roughnessFactor + ${f(s.sheen)} * (sfG - 0.5) * 2.0 * sfShown + ${f(s.patchTone)} * (sfP - 0.5), 0.04, 1.0);`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        {
          // the grain's relief turns the face a little toward or away from the light (a height, in metres, differenced across the screen)
          float sfH = sfG * ${f(s.relief)} * sfShown;
          vec3 sfX = dFdx(-vViewPosition), sfY = dFdy(-vViewPosition);
          vec3 sfR1 = cross(sfY, normal), sfR2 = cross(normal, sfX);
          float sfDet = dot(sfX, sfR1);
          normal = normalize(abs(sfDet) * normal - sign(sfDet) * (dFdx(sfH) * sfR1 + dFdy(sfH) * sfR2));
        }`);
  };
  material.customProgramCacheKey = () => 'surface:' + kind;
  return material;
}

/**
 * The drawing of a frame with the shade where things meet. `hidden(object)` says what is left out when that shade is
 * worked out (glass: what stands behind a pane is shaded as if the pane were not there).
 * Returns { render(), setSize(width, height), shade } where `shade` is the pass itself, to tune or to switch off.
 */
export function createLook(renderer, scene, camera, { hidden = () => false, radius = 0.32, strength = 1.0 } = {}) {
  const size = renderer.getDrawingBufferSize(new THREE.Vector2());
  const samples = renderer.capabilities.isWebGL2 ? Math.min(4, renderer.capabilities.maxSamples) : 0;
  const target = new THREE.WebGLRenderTarget(size.x, size.y, { type: THREE.HalfFloatType, samples });
  const composer = new EffectComposer(renderer, target);
  composer.addPass(new RenderPass(scene, camera));
  const shade = new GTAOPass(scene, camera, size.x, size.y);
  shade.blendIntensity = strength;
  // The reach is in metres: what lies within a forearm's length shades a place. Sixteen looks each way.
  shade.updateGtaoMaterial({ radius, distanceExponent: 1.4, thickness: 1.0, scale: 1.15, samples: 16, distanceFallOff: 1.0, screenSpaceRadius: false });
  shade.updatePdMaterial({ lumaPhi: 10.0, depthPhi: 2.0, normalPhi: 3.0, radius: 5.0, radiusExponent: 1.0, rings: 2.0, samples: 16 });
  // Leave out what the caller names, as well as what the pass itself leaves out (points and lines).
  const hide = shade.overrideVisibility.bind(shade), show = shade.restoreVisibility.bind(shade), put = [];
  shade.overrideVisibility = () => { hide(); scene.traverse(o => { if (o.visible && o.isMesh && hidden(o)) { o.visible = false; put.push(o); } }); };
  shade.restoreVisibility = () => { for (const o of put) o.visible = true; put.length = 0; show(); };
  composer.addPass(shade);
  composer.addPass(new OutputPass());
  return {
    shade,
    render() { composer.render(); },
    setSize(width, height) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(width, height); },
  };
}
