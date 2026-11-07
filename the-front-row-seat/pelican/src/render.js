/**
 * How the frame actually reaches the screen.
 *
 * Everything in this room that matters is a small bright thing in a large
 * dark one — a hearth, six candle flames, a lantern across the alley, ale in
 * a pewter pot. Bloom is what makes those read as light rather than as pale
 * pixels, so the composer exists for them.
 *
 * On the low tier there is no composer at all and the renderer draws straight
 * to the canvas: a phone that is already struggling should not be asked to
 * pay for five extra full-screen passes.
 *
 * Post-processing passes are three.js's own addons, vendored under MIT from
 * three r169 — see vendor/postprocessing/LICENSE.txt.
 */

import * as THREE from '../vendor/three.module.min.js';
import { EffectComposer } from '../vendor/postprocessing/EffectComposer.js';
import { RenderPass } from '../vendor/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../vendor/postprocessing/UnrealBloomPass.js';
import { OutputPass } from '../vendor/postprocessing/OutputPass.js';
import { RENDER } from './config.js';

/**
 * Returns `{ render, resize, dropEffects }`. All three are safe to call
 * whether or not a composer was built, so neither the loop nor the
 * performance governor has to know which path it is on.
 */
export function createRenderer(renderer, scene, camera, tier) {
  const plain = {
    render: () => renderer.render(scene, camera),
    resize: (width, height) => renderer.setSize(width, height, false),
    dropEffects: () => false,
  };
  if (!tier.bloom) return plain;

  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));

  const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    RENDER.bloomStrength,
    RENDER.bloomRadius,
    RENDER.bloomThreshold,
  );
  composer.addPass(bloom);

  // Tone maps and converts to sRGB once, at the end of the chain, which is
  // where it has to happen when a composer is in the way.
  composer.addPass(new OutputPass());

  let composing = true;

  return {
    render: () => (composing ? composer.render() : renderer.render(scene, camera)),
    resize: (width, height) => {
      renderer.setSize(width, height, false);
      if (!composing) return;
      composer.setSize(width, height);
      bloom.setSize(width, height);
    },
    /**
     * Give the bloom back when the device cannot afford it. Called by the
     * performance governor, and only ever once — five full-screen passes are
     * the most expensive thing here and the cheapest thing to lose.
     */
    dropEffects: () => {
      if (!composing) return false;
      composing = false;
      composer.dispose();
      return true;
    },
  };
}
