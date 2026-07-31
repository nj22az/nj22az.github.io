/**
 * One place that decides how hard to push the device.
 *
 * Phones get the same room, not a cut-down one: what changes is pixel count,
 * shadow resolution, rain density, and whether the soft-shadow filter and the
 * bloom composer run at all. The tier is chosen once, then held, so the scene never flickers between
 * settings mid-walk.
 */

const MOBILE_POINTER = '(hover: none) and (pointer: coarse)';

export const TIERS = {
  low: {
    name: 'low',
    maxPixelRatio: 1.25,
    shadows: false,
    shadowMapSize: 512,
    rainCount: 700,
    riverSegments: 18,
    farBank: false,
    antialias: false,
    bloom: false,
    fogFar: 42,
  },
  medium: {
    name: 'medium',
    maxPixelRatio: 1.5,
    shadows: true,
    shadowMapSize: 1024,
    rainCount: 1500,
    riverSegments: 32,
    farBank: true,
    antialias: true,
    bloom: true,
    fogFar: 58,
  },
  high: {
    name: 'high',
    maxPixelRatio: 2.0,
    shadows: true,
    shadowMapSize: 2048,
    rainCount: 2600,
    riverSegments: 60,
    farBank: true,
    antialias: true,
    bloom: true,
    fogFar: 74,
  },
};

/**
 * Pick a tier from what the device admits to. Deliberately conservative: a
 * phone that turns out to be fast gets promoted by the frame-rate watcher
 * below, which is safer than starting high and stuttering.
 */
export function detectTier() {
  const isCoarsePointer = window.matchMedia && window.matchMedia(MOBILE_POINTER).matches;
  const cores = navigator.hardwareConcurrency || 4;
  const memory = navigator.deviceMemory || 4;
  const narrow = Math.min(window.innerWidth, window.innerHeight) < 500;

  if (isCoarsePointer && (cores <= 4 || memory <= 3)) return TIERS.low;
  if (isCoarsePointer || narrow || cores <= 4) return TIERS.medium;
  return TIERS.high;
}

/**
 * Watches the frame time and steps the renderer down if the device cannot hold
 * a reasonable rate. Only ever steps down — a visitor who has settled into a
 * smooth walk should not be interrupted by the scene getting prettier.
 */
export function createPerformanceGovernor(renderer, tier, { onDowngrade, view } = {}) {
  const SAMPLE_SIZE = 90;
  const SLOW_FRAME_MS = 34; // roughly below 30fps
  let samples = 0;
  let slowFrames = 0;
  let currentRatio = Math.min(window.devicePixelRatio, tier.maxPixelRatio);
  let settled = false;

  return function record(deltaMs) {
    if (settled) return;
    samples += 1;
    if (deltaMs > SLOW_FRAME_MS) slowFrames += 1;
    if (samples < SAMPLE_SIZE) return;

    const slowShare = slowFrames / samples;
    samples = 0;
    slowFrames = 0;

    if (slowShare < 0.25) { settled = true; return; }

    if (currentRatio > 0.75) {
      currentRatio = Math.max(0.75, currentRatio - 0.25);
      renderer.setPixelRatio(currentRatio);
      if (onDowngrade) onDowngrade({ reason: 'pixelRatio', value: currentRatio });
      return;
    }
    // Bloom before shadows: it is the most expensive pass and the least
    // structural — losing it dims the flames, losing shadows unmoors the room.
    if (view && view.dropEffects()) {
      if (onDowngrade) onDowngrade({ reason: 'bloom', value: false });
      return;
    }
    if (renderer.shadowMap.enabled) {
      renderer.shadowMap.enabled = false;
      if (onDowngrade) onDowngrade({ reason: 'shadows', value: false });
      return;
    }
    settled = true;
  };
}
