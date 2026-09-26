// Preview player for the vertical shorts: play.html?short=<id>. With &render=1 only the canvas is shown
// and window.__frame(t) draws one frame (used by render.cjs).
import { drawShort, lineAt } from './engine.mjs';
import { SHORTS } from './index.mjs';

const q = new URLSearchParams(location.search);
const sh = SHORTS.find((s) => s.id === q.get('short')) || SHORTS[0];
const cv = document.getElementById('c'); const ctx = cv.getContext('2d');
const T = sh.duration;
window.__short = { id: sh.id, duration: T, lines: sh.lines, cuts: sh.cuts, cover: sh.cover ?? 1.2 };
window.__frame = (t) => drawShort(ctx, sh, t);

if (q.get('render')) {
  document.body.className = 'render'; document.body.replaceChildren(cv);
} else {
  document.title = `${sh.title} · JoJo Engineering`;
  document.getElementById('title').textContent = sh.title;
  const pick = document.getElementById('pick');
  for (const s of SHORTS) pick.add(new Option(`${s.title} (${Math.round(s.duration)} s)`, s.id, false, s === sh));
  pick.addEventListener('change', () => { location.search = `?short=${pick.value}`; });
  const play = document.getElementById('play'), seek = document.getElementById('seek'), time = document.getElementById('time'), lineEl = document.getElementById('line');
  let t = 0, playing = false, last = 0, shown = null;
  const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const show = () => {
    drawShort(ctx, sh, t); seek.value = Math.round((t / T) * 1000); time.textContent = `${mmss(t)} / ${mmss(T)}`;
    const ln = lineAt(sh, t); const txt = ln ? ln.text.replace(/_\{([^}]*)\}/g, '$1') : '';
    if (txt !== shown) { lineEl.textContent = txt; shown = txt; }
  };
  const tick = (now) => { if (!playing) return; t = Math.min(T, t + (now - last) / 1000); last = now; if (t >= T) { playing = false; play.textContent = 'Replay'; } show(); if (playing) requestAnimationFrame(tick); };
  play.addEventListener('click', () => { if (playing) { playing = false; play.textContent = 'Play'; return; } if (t >= T) t = 0; playing = true; play.textContent = 'Pause'; last = performance.now(); requestAnimationFrame(tick); });
  seek.addEventListener('input', () => { t = (seek.value / 1000) * T; show(); });
  (document.fonts?.ready || Promise.resolve()).then(show);
}
