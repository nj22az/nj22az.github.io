// Interaktiv filmspelare. Med ?film=<id>&render=1 visas bara duken och window.__frame(t) ritar en bild (används av render.cjs).
import { drawFrame, duration, lineAt } from './engine.mjs';
import { FILMS } from './films/index.mjs';

const q = new URLSearchParams(location.search);
const film = FILMS.find((f) => f.id === q.get('film')) || FILMS[0];
const cv = document.getElementById('c'); const ctx = cv.getContext('2d');
const T = duration(film);
window.__film = { id: film.id, duration: T };
window.__frame = (t) => drawFrame(ctx, film, t);

if (q.get('render')) {
  document.body.className = 'film-render'; document.body.replaceChildren(cv);
} else {
  document.title = `${film.title} · Sjöskolan`;
  document.getElementById('film-title').textContent = film.title;
  document.getElementById('film-sub').textContent = `${film.sub} · ${film.week} · ${film.deck}`;
  const play = document.getElementById('play'), seek = document.getElementById('seek'), time = document.getElementById('time'), lineEl = document.getElementById('line');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let t = 0, playing = false, last = 0, shown = null;
  const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  const show = () => {
    drawFrame(ctx, film, t); seek.value = Math.round((t / T) * 1000); time.textContent = `${mmss(t)} / ${mmss(T)}`;
    const ln = lineAt(film, t); const txt = ln ? `${ln.who}: ${ln.text}` : '';
    if (txt !== shown) { lineEl.textContent = txt; shown = txt; }
  };
  const tick = (now) => { if (!playing) return; t = Math.min(T, t + (now - last) / 1000); last = now; if (t >= T) { playing = false; play.textContent = 'Spela igen'; } show(); if (playing) requestAnimationFrame(tick); };
  play.addEventListener('click', () => { if (playing) { playing = false; play.textContent = 'Spela'; return; } if (t >= T) t = 0; playing = true; play.textContent = 'Paus'; last = performance.now(); requestAnimationFrame(tick); });
  seek.addEventListener('input', () => { t = (seek.value / 1000) * T; show(); });
  // Vänta på typsnitt innan första bilden
  (document.fonts?.ready || Promise.resolve()).then(() => { t = reduce ? 0 : 0; show(); });
}
