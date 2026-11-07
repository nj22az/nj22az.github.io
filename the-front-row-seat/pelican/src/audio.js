/**
 * Rain, fire and thunder, synthesised from noise buffers and filters. No
 * audio files: the storm is generated the same way the oak grain is.
 *
 * Nothing starts until the visitor clicks to enter, which supplies the
 * gesture browsers require before an AudioContext may run.
 */

const NOISE_SECONDS = 3;

function createNoiseBuffer(context) {
  const length = context.sampleRate * NOISE_SECONDS;
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const channel = buffer.getChannelData(0);
  let previous = 0;
  for (let i = 0; i < length; i += 1) {
    const white = Math.random() * 2 - 1;
    // Light low-pass on the source gives brown-ish noise: rain, not hiss.
    previous = (previous + 0.032 * white) / 1.032;
    channel[i] = previous * 3.2;
  }
  return buffer;
}

export function createStormAudio() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;

  const context = new AudioContextClass();
  const noiseBuffer = createNoiseBuffer(context);

  const master = context.createGain();
  master.gain.value = 0.0;
  master.connect(context.destination);

  // --- rain against the shutters -------------------------------------------
  const rainSource = context.createBufferSource();
  rainSource.buffer = noiseBuffer;
  rainSource.loop = true;
  const rainFilter = context.createBiquadFilter();
  rainFilter.type = 'bandpass';
  rainFilter.frequency.value = 1150;
  rainFilter.Q.value = 0.55;
  const rainGain = context.createGain();
  rainGain.gain.value = 0.34;
  rainSource.connect(rainFilter).connect(rainGain).connect(master);
  rainSource.start();

  // Slow gusts: an LFO on the rain's level, so the gale breathes.
  const gust = context.createOscillator();
  gust.frequency.value = 0.07;
  const gustDepth = context.createGain();
  gustDepth.gain.value = 0.16;
  gust.connect(gustDepth).connect(rainGain.gain);
  gust.start();

  // --- the fire -------------------------------------------------------------
  const fireSource = context.createBufferSource();
  fireSource.buffer = noiseBuffer;
  fireSource.loop = true;
  const fireFilter = context.createBiquadFilter();
  fireFilter.type = 'lowpass';
  fireFilter.frequency.value = 420;
  const fireGain = context.createGain();
  fireGain.gain.value = 0.2;
  fireSource.connect(fireFilter).connect(fireGain).connect(master);
  fireSource.start();

  /** An occasional crack from the logs. */
  function crackle() {
    const now = context.currentTime;
    const source = context.createBufferSource();
    source.buffer = noiseBuffer;
    const filter = context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 900 + Math.random() * 2200;
    filter.Q.value = 3;
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05 + Math.random() * 0.09, now + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    source.connect(filter).connect(gain).connect(master);
    source.start(now, Math.random() * NOISE_SECONDS * 0.8, 0.12);
    window.setTimeout(crackle, 400 + Math.random() * 2600);
  }
  window.setTimeout(crackle, 900);

  /** A roll of thunder; loudness 0..1 maps to how close the strike was. */
  function thunder(loudness = 0.6) {
    const now = context.currentTime;
    const duration = 1.8 + loudness * 2.4;
    const source = context.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;
    const filter = context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(150 + loudness * 260, now);
    filter.frequency.exponentialRampToValueAtTime(58, now + duration);
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16 + loudness * 0.42, now + 0.13);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.connect(filter).connect(gain).connect(master);
    source.start(now);
    source.stop(now + duration + 0.1);
  }

  /** The shutters take the gust a moment before the room hears the thunder. */
  function shutterRattle() {
    const now = context.currentTime;
    for (let i = 0; i < 5; i += 1) {
      const source = context.createBufferSource();
      source.buffer = noiseBuffer;
      const filter = context.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 260 + Math.random() * 320;
      filter.Q.value = 6;
      const gain = context.createGain();
      const at = now + i * (0.05 + Math.random() * 0.06);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.05 + Math.random() * 0.05, at + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.11);
      source.connect(filter).connect(gain).connect(master);
      source.start(at, Math.random(), 0.14);
    }
  }

  /**
   * Pouring: filtered noise whose band climbs as the vessel fills, which is
   * the whole reason a pour sounds like a pour and not like a tap running.
   */
  let pourSource = null;
  let pourFilter = null;
  let pourGain = null;

  function pourStart() {
    if (pourSource) return;
    const now = context.currentTime;
    pourSource = context.createBufferSource();
    pourSource.buffer = noiseBuffer;
    pourSource.loop = true;
    pourFilter = context.createBiquadFilter();
    pourFilter.type = 'bandpass';
    pourFilter.frequency.setValueAtTime(520, now);
    pourFilter.frequency.linearRampToValueAtTime(1500, now + 2.4);
    pourFilter.Q.value = 2.2;
    pourGain = context.createGain();
    pourGain.gain.setValueAtTime(0.0001, now);
    pourGain.gain.exponentialRampToValueAtTime(0.16, now + 0.06);
    pourSource.connect(pourFilter).connect(pourGain).connect(master);
    pourSource.start(now);
  }

  /** Stopping gives a short knock as the tankard is set down. */
  function pourStop(quality = 100) {
    if (!pourSource) return;
    const now = context.currentTime;
    pourGain.gain.cancelScheduledValues(now);
    pourGain.gain.setValueAtTime(pourGain.gain.value, now);
    pourGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
    const ending = pourSource;
    window.setTimeout(() => { try { ending.stop(); } catch (error) { /* already stopped */ } }, 200);
    pourSource = null;

    const knock = context.createBufferSource();
    knock.buffer = noiseBuffer;
    const knockFilter = context.createBiquadFilter();
    knockFilter.type = 'lowpass';
    knockFilter.frequency.value = quality > 70 ? 340 : 240;
    const knockGain = context.createGain();
    knockGain.gain.setValueAtTime(0.0001, now + 0.1);
    knockGain.gain.exponentialRampToValueAtTime(0.14, now + 0.115);
    knockGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.26);
    knock.connect(knockFilter).connect(knockGain).connect(master);
    knock.start(now + 0.1, Math.random(), 0.3);
  }

  function setEnabled(enabled) {
    const now = context.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.linearRampToValueAtTime(enabled ? 0.85 : 0.0, now + 0.5);
  }

  async function resume() {
    if (context.state === 'suspended') await context.resume();
  }

  return { thunder, shutterRattle, pourStart, pourStop, setEnabled, resume };
}
