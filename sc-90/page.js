// Johansson SC-90: the page. The chip itself is chip.js; the jingles are sakura.js.
import { FS, renderPiece } from './chip.js';
import { JINGLES } from './sakura.js';

const $ = (s) => document.querySelector(s);
const h = (tag, attrs = {}, ...kids) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'text') el.textContent = v; else if (k.startsWith('on')) el.addEventListener(k.slice(2), v); else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null) el.append(c);
  return el;
};

/* What each voice is called on a card: the second pulse voice does a different job in each jingle. */
const VOICE_NAME = { melody: 'Melody', harmony: 'Harmony', echo: 'Echo', accomp: 'Chords', bass: 'Bass', drums: 'Drums' };

let ctx = null, playing = null; // { source, button }
function stop() {
  if (!playing) return;
  try { playing.source.stop(); } catch { /* already stopped */ }
  playing.button.setAttribute('aria-pressed', 'false'); playing.button.textContent = 'Play live';
  playing = null;
}

async function playLive(j, button, card) {
  if (playing && playing.button === button) { stop(); $('#status').textContent = ''; return; }
  stop();
  ctx ||= new (window.AudioContext || window.webkitAudioContext)();
  if (ctx.state === 'suspended') await ctx.resume();
  const on = new Set([...card.querySelectorAll('input[data-voice]')].filter((x) => x.checked).map((x) => x.dataset.voice));
  if (!on.size) { $('#status').textContent = 'Switch at least one voice on.'; return; }
  $('#status').textContent = `The SC-90 is playing “${j.title}”…`;
  await new Promise((r) => setTimeout(r, 0)); // let the line paint before the chip works
  // A voice switched off still runs, silently, so an echo keeps its source.
  const voices = Object.fromEntries(Object.entries(j.voices).map(([k, v]) => [k, on.has(k) ? v : { ...v, gain: -300 }]));
  const piece = renderPiece({ ...j, voices });
  const buf = ctx.createBuffer(1, piece.samples.length, FS);
  buf.getChannelData(0).set(piece.samples);
  const source = ctx.createBufferSource();
  source.buffer = buf; source.loop = piece.loop; source.connect(ctx.destination);
  source.onended = () => { if (playing && playing.source === source) { stop(); $('#status').textContent = ''; } };
  source.start();
  playing = { source, button };
  button.setAttribute('aria-pressed', 'true'); button.textContent = 'Stop';
  $('#status').textContent = `Live on the SC-90: “${j.title}”, ${[...on].map((k) => VOICE_NAME[k] || k).join(', ').toLowerCase()}${piece.loop ? ', looping' : ''}.`;
}

function card(j) {
  const file = `sakura/${j.id}.${j.loop ? 'wav' : 'mp3'}`; // the loop is the WAV: an MP3 adds silence at the seam
  const button = h('button', { type: 'button', class: 'btn', 'aria-pressed': 'false', text: 'Play live' });
  const toggles = Object.keys(j.voices).map((k) => h('label', {}, h('input', { type: 'checkbox', checked: true, 'data-voice': k }), VOICE_NAME[k] || k));
  const li = h('li', { class: 'card' },
    h('h3', { text: j.title }), h('p', { class: 'when', text: j.when }), h('p', { class: 'why', text: j.why }),
    h('audio', { controls: true, preload: 'none', loop: j.loop, src: file, 'aria-label': `${j.title}, recorded on the SC-90` }),
    h('div', { class: 'live', role: 'group', 'aria-label': `${j.title} live` }, button, ...toggles));
  button.addEventListener('click', () => playLive(j, button, li));
  return li;
}

$('#jingles').replaceChildren(...JINGLES.map(card));
window.SC90 = Object.freeze({ jingles: JINGLES.map((j) => j.id), play: (id) => { const i = JINGLES.findIndex((j) => j.id === id); document.querySelectorAll('#jingles .btn')[i]?.click(); }, stop });
