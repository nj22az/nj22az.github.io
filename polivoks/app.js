// Johansson PF-82: the page. The sound is made in dsp/polivoks-dsp.js (AudioWorklet).
import { DEFAULTS, MAP, PARTS, PolivoksFilter, makeUnit, voltsPerOctave } from './dsp/polivoks-dsp.js';
import { SONGS, build } from './songs.js';
import { HELP, JINGLE_SONGS, PATCHES, SHOP_UNIT, patchValues, validateParams, validateSong, decodeSpec } from './agent.js';

const STORE = 'polivoks.patch.v1', SETTINGS = 'polivoks.settings.v1';
const TRANSIENT = new Set(['kbd.bend']);
const store = {
  get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage is optional */ } },
};

const saved = store.get(STORE) || {};
const state = { ...DEFAULTS };
for (const k of Object.keys(saved)) if (k in DEFAULTS && !TRANSIENT.has(k)) state[k] = saved[k];
const settings = { lang: 'en', os: 4, base: 36, patch: 'init', song: SONGS[0].id, ...(store.get(SETTINGS) || {}) };
let saveTimer = 0;
function persist() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    const out = {}; for (const k of Object.keys(state)) if (!TRANSIENT.has(k)) out[k] = state[k];
    store.set(STORE, out); store.set(SETTINGS, settings);
  }, 250);
}

const $ = (s, el = document) => el.querySelector(s);
const h = (tag, attrs = {}, ...kids) => {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v; else if (k === 'text') el.textContent = v; else if (k.startsWith('on')) el.addEventListener(k.slice(2), v); else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null) el.append(c);
  return el;
};
const SVGNS = 'http://www.w3.org/2000/svg';
const svg = (tag, attrs = {}) => { const el = document.createElementNS(SVGNS, tag); for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v); return el; };
const label = (l) => h('span', { 'data-en': l.en, 'data-ru': l.ru, text: l[settings.lang] || l.en });
const L = (en, ru) => ({ en, ru });

/* ---------- formats ---------- */
const fmtTime = (s) => (s < 1 ? `${(s * 1000).toFixed(s < 0.01 ? 1 : 0)} ms` : `${s.toFixed(2)} s`);
const fmtHz = (f) => (!Number.isFinite(f) ? '—' : f >= 1000 ? `${(f / 1000).toFixed(f >= 10000 ? 1 : 2)} kHz` : `${f.toFixed(f < 10 ? 2 : f < 100 ? 1 : 0)} Hz`);
const fmtA = (a) => (a >= 1e-6 ? `${(a * 1e6).toFixed(2)} µA` : `${(a * 1e9).toFixed(a < 1e-8 ? 2 : 1)} nA`);
const dial = (v) => (v * 10).toFixed(1);
const signed = (v, d = 1) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(d)}`;
const nominalVpo = voltsPerOctave(PARTS, 25);

/* ---------- wave icons ---------- */
const ICON = {
  tri: 'M1 11 L6 1 L11 11 L16 1 L21 11', saw: 'M1 11 L11 1 L11 11 L21 1 L21 11',
  square: 'M1 11 L1 1 L11 1 L11 11 L21 11 L21 1', pulse: 'M1 11 L1 1 L5 1 L5 11 L11 11 L11 1 L15 1 L15 11 L21 11',
  sh: 'M1 8 L5 8 L5 2 L9 2 L9 10 L13 10 L13 5 L17 5 L17 9 L21 9',
};
const icon = (name, title) => {
  const s = svg('svg', { viewBox: '0 0 22 12', 'aria-hidden': 'true' });
  s.append(svg('path', { d: ICON[name], fill: 'none', stroke: 'currentColor', 'stroke-width': '1.6', 'stroke-linejoin': 'round' }));
  return [s, h('span', { class: 'sr-only', style: 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)', text: title })];
};

const DEFAULT_HELP = 'Point at a knob, switch or jack to see what it does.';
function showHelp(key) {
  const el = $('#help'), hlp = HELP[key];
  if (!el || !hlp) return;
  el.replaceChildren(h('b', { text: hlp[0] }), hlp[1]);
}
function helpOn(el, key) { el.addEventListener('pointerenter', () => showHelp(key)); el.addEventListener('focusin', () => showHelp(key)); return el; }

/* ---------- controls ---------- */
const controls = new Map(); // param key → { set(v) }
const LABELS = {}; // param key → { en, ru }: the 3D panel prints the same words

function setParam(k, v, { send = true } = {}) {
  state[k] = v;
  const c = controls.get(k); if (c) c.show(v);
  if (send && engine.node) engine.node.port.postMessage({ t: 'p', k, v });
  if (!TRANSIENT.has(k)) persist();
  if (SERVICE_REDRAW.has(k)) renderService();
  else if (serviceLabels[k]) serviceLabels[k].b.textContent = serviceLabels[k].fmt(Number(v));
  if (k === 'flt.out') renderJacks();
  if (view3d) view3d.syncParam(k);
}

function knob({ k, l, fmt, big = false }) {
  const def = DEFAULTS[k];
  LABELS[k] = l;
  const body = h('div', { class: 'knob-body', role: 'slider', tabindex: '0', 'aria-valuemin': '0', 'aria-valuemax': '100' });
  const s = svg('svg', { viewBox: '-30 -30 60 60' });
  for (let i = 0; i <= 10; i++) {
    const a = ((-135 + 27 * i) * Math.PI) / 180, r1 = 25, r2 = i % 5 === 0 ? 29 : 27.5;
    s.append(svg('line', { class: 'tick', x1: (r1 * Math.sin(a)).toFixed(2), y1: (-r1 * Math.cos(a)).toFixed(2), x2: (r2 * Math.sin(a)).toFixed(2), y2: (-r2 * Math.cos(a)).toFixed(2) }));
  }
  s.append(svg('circle', { class: 'skirt', r: '22' }), svg('circle', { class: 'cap', r: '16' }));
  const g = svg('g'); g.append(svg('line', { class: 'ptr', x1: '0', y1: '-5', x2: '0', y2: '-20' })); s.append(g);
  body.append(s);
  const val = h('output', { class: 'knob-val' });
  const lab = h('div', { class: 'ctl-label' }, label(l));
  const wrap = h('div', { class: `ctl knob${big ? ' big' : ''}` }, lab, body, val);
  const name = () => `${l[settings.lang] || l.en}`;
  const show = (v) => {
    g.setAttribute('transform', `rotate(${-135 + 270 * v})`);
    const text = fmt ? fmt(v) : dial(v);
    val.textContent = text;
    body.setAttribute('aria-valuenow', String(Math.round(v * 100)));
    body.setAttribute('aria-valuetext', text);
    body.setAttribute('aria-label', name());
  };
  const set = (v) => setParam(k, Math.min(1, Math.max(0, Math.round(v * 10000) / 10000)));
  let drag = null;
  body.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    body.setPointerCapture(e.pointerId); body.focus({ preventScroll: true });
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, v: Number(state[k]) };
    wrap.classList.add('active'); e.preventDefault();
  });
  body.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const fine = e.shiftKey ? 0.1 : 1;
    set(drag.v + ((drag.y - e.clientY + (e.clientX - drag.x)) / 240) * fine);
  });
  const end = (e) => { if (drag && e.pointerId === drag.id) { drag = null; wrap.classList.remove('active'); } };
  body.addEventListener('pointerup', end); body.addEventListener('pointercancel', end);
  body.addEventListener('dblclick', () => set(def));
  body.addEventListener('wheel', (e) => { if (document.activeElement !== body) return; e.preventDefault(); set(Number(state[k]) - e.deltaY * (e.shiftKey ? 0.0002 : 0.0015)); }, { passive: false });
  body.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 0.002 : 0.01, v = Number(state[k]);
    const map = { ArrowUp: v + step, ArrowRight: v + step, ArrowDown: v - step, ArrowLeft: v - step, PageUp: v + 0.1, PageDown: v - 0.1, Home: 0, End: 1 };
    if (e.key in map) { e.preventDefault(); set(map[e.key]); }
  });
  body.addEventListener('focus', () => wrap.classList.add('active'));
  body.addEventListener('blur', () => wrap.classList.remove('active'));
  controls.set(k, { show, relabel: () => show(Number(state[k])) });
  show(Number(state[k]));
  return helpOn(wrap, k);
}

function seg(k, opts, { onPick, cls = 'seg', aria } = {}) {
  const row = h('div', { class: cls, role: 'group', 'aria-label': aria || k });
  const btns = opts.map(([v, text, title]) => {
    const b = h('button', { type: 'button', 'aria-pressed': 'false', title: title || null, onclick: () => (onPick ? onPick(v) : setParam(k, v)) });
    if (typeof text === 'string' && ICON[text]) b.append(...icon(text, title || text));
    else if (typeof text === 'object' && text.en) b.append(label(text));
    else b.append(String(text));
    b.dataset.v = String(v);
    return b;
  });
  row.append(...btns);
  const show = (v) => { for (const b of btns) b.setAttribute('aria-pressed', String(b.dataset.v === String(v))); };
  return { row, show };
}

function switchCtl({ k, l, opts }) {
  LABELS[k] = l;
  const s = seg(k, opts, { aria: l.en });
  controls.set(k, { show: s.show });
  s.show(state[k]);
  return helpOn(h('div', { class: 'ctl sw' }, h('div', { class: 'ctl-label' }, label(l)), s.row), k);
}

/* ---------- the panel ---------- */
const RANGE = [[-2, "32'"], [-1, "16'"], [0, "8'"], [1, "4'"], [2, "2'"]];
const WAVES = [['tri', 'tri', 'Triangle'], ['saw', 'saw', 'Sawtooth'], ['square', 'square', 'Square'], ['pulse', 'pulse', 'Pulse']];
const pctPW = (x) => `${(MAP.pw(x) * 100).toFixed(0)} %`;
const egKnobs = (n) => [
  knob({ k: `eg${n}.a`, l: L('ATTACK', 'АТАКА'), fmt: (x) => fmtTime(MAP.time(x)) }),
  knob({ k: `eg${n}.d`, l: L('DECAY', 'СПАД'), fmt: (x) => fmtTime(MAP.time(x)) }),
  knob({ k: `eg${n}.s`, l: L('SUSTAIN', 'УРОВЕНЬ') }),
  knob({ k: `eg${n}.r`, l: L('RELEASE', 'ЗАТУХАНИЕ'), fmt: (x) => fmtTime(MAP.time(x)) }),
];
// Modules are numbered and named like the blocks of the signal-flow map above them.
const mod = (cls, id, num, title, ...kids) => h('section', { class: `module ${cls}`, id: `mod-${id}` }, h('h2', {}, h('span', { class: 'num', text: num }), title), ...kids);

let jacksEl;
function buildPanel() {
  const m = $('#modules');
  m.append(
    mod('m-vco1', 'vco1', '1', h('span', {}, label(L('VCO 1', 'ГЕНЕРАТОР 1')), ' ', h('small', {}, label(L('MAKES THE TONE', 'ДАЁТ ТОН')))), h('div', { class: 'ctls' },
      switchCtl({ k: 'vco1.oct', l: L('RANGE', 'РЕГИСТР'), opts: RANGE }),
      switchCtl({ k: 'vco1.wave', l: L('WAVE', 'ФОРМА'), opts: WAVES }),
      knob({ k: 'vco1.pw', l: L('PULSE WIDTH', 'ШИРИНА'), fmt: pctPW }))),
    mod('m-vco2', 'vco2', '2', h('span', {}, label(L('VCO 2', 'ГЕНЕРАТОР 2')), ' ', h('small', {}, label(L('A SECOND TONE', 'ВТОРОЙ ТОН')))), h('div', { class: 'ctls' },
      switchCtl({ k: 'vco2.oct', l: L('RANGE', 'РЕГИСТР'), opts: RANGE }),
      switchCtl({ k: 'vco2.wave', l: L('WAVE', 'ФОРМА'), opts: WAVES }),
      knob({ k: 'vco2.pw', l: L('PULSE WIDTH', 'ШИРИНА'), fmt: pctPW }),
      knob({ k: 'vco2.detune', l: L('DETUNE', 'РАССТРОЙКА'), fmt: (x) => `${signed(MAP.detune(x), 0)} cents` }))),
    mod('m-mix', 'mix', '3', h('span', {}, label(L('MIXER', 'МИКШЕР')), ' ', h('small', {}, label(L('BLENDS THEM', 'СМЕШИВАЕТ')))), h('div', { class: 'ctls' },
      knob({ k: 'mix.vco1', l: L('VCO 1', 'ГЕН. 1') }),
      knob({ k: 'mix.vco2', l: L('VCO 2', 'ГЕН. 2') }),
      knob({ k: 'mix.noise', l: L('NOISE', 'ШУМ') }),
      sourceSwitch())),
    filterModule(),
    mod('m-eg1', 'eg1', '6', h('span', {}, label(L('ENV 1', 'ОГИБ. 1')), ' ', h('small', {}, label(L('MOVES THE FILTER ON EACH NOTE', 'ДВИЖЕТ ФИЛЬТР')))), h('div', { class: 'ctls' }, ...egKnobs(1))),
    mod('m-eg2', 'amp', '5', h('span', {}, label(L('VCA + ENV 2', 'УСИЛИТЕЛЬ')), ' ', h('small', {}, label(L('LOUDNESS', 'ГРОМКОСТЬ')))), h('div', { class: 'ctls' }, ...egKnobs(2),
      switchCtl({ k: 'vca.mode', l: L('VCA', 'УСИЛИТЕЛЬ'), opts: [['env', L('ENV', 'ОГИБ.')], ['open', L('OPEN', 'ОТКР.')]] }))),
    mod('m-lfo', 'lfo', '7', h('span', {}, label(L('LFO', 'МОДУЛЯТОР')), ' ', h('small', {}, label(L('A SLOW WOBBLE', 'МЕДЛЕННОЕ КОЛЕБАНИЕ')))), h('div', { class: 'ctls' },
      knob({ k: 'lfo.rate', l: L('RATE', 'СКОРОСТЬ'), fmt: (x) => fmtHz(MAP.lfoRate(x)) }),
      switchCtl({ k: 'lfo.wave', l: L('WAVE', 'ФОРМА'), opts: [['tri', 'tri', 'Triangle'], ['square', 'square', 'Square'], ['saw', 'saw', 'Sawtooth'], ['sh', 'sh', 'Sample and hold']] }),
      knob({ k: 'lfo.pitch', l: L('→ PITCH', '→ ВЫСОТА'), fmt: (x) => `±${MAP.lfoPitch(x).toFixed(2)} st` }),
      knob({ k: 'lfo.filter', l: L('→ CV 2', '→ УН 2'), fmt: (x) => `±${MAP.lfoFilter(x).toFixed(2)} V` }),
      knob({ k: 'lfo.pw', l: L('→ PW', '→ ШИРИНА'), fmt: (x) => `±${(45 * x).toFixed(0)} %` }))),
    mod('m-voice', 'voice', '8', h('span', {}, label(L('KEYBOARD', 'КЛАВИАТУРА')), ' ', h('small', {}, label(L('HOW NOTES PLAY', 'КАК ЗВУЧАТ НОТЫ')))), h('div', { class: 'ctls' },
      knob({ k: 'glob.glide', l: L('GLIDE', 'ПОРТАМЕНТО'), fmt: (x) => (MAP.glide(x) ? fmtTime(MAP.glide(x)) : 'off') }),
      knob({ k: 'glob.track', l: L('TRACK → CV 2', 'СЛЕЖЕНИЕ'), fmt: (x) => `${MAP.track(x).toFixed(2)} V/oct · ×${(MAP.track(x) / nominalVpo).toFixed(2)}` }),
      knob({ k: 'glob.volume', l: L('VOLUME', 'ГРОМКОСТЬ') }),
      switchCtl({ k: 'glob.mode', l: L('VOICES', 'РЕЖИМ'), opts: [['mono', L('MONO', 'МОНО')], ['duo', L('DUO', 'ДУО')]] }),
      switchCtl({ k: 'glob.legato', l: L('LEGATO', 'ЛЕГАТО'), opts: [['off', L('OFF', 'ВЫКЛ')], ['on', L('ON', 'ВКЛ')]] }))),
  );
  renderJacks();
}

function sourceSwitch() {
  const s = seg('src', [['synth', L('SYNTH', 'СИНТ')], ['line', L('LINE IN', 'ЛИНИЯ')]], { aria: 'Source', onPick: (v) => pickSource(v) });
  controls.set('src', { show: s.show }); s.show(state.src);
  return helpOn(h('div', { class: 'ctl sw' }, h('div', { class: 'ctl-label' }, label(L('SOURCE', 'ИСТОЧНИК'))), s.row), 'src');
}

function filterModule() {
  jacksEl = h('div', { class: 'jacks', role: 'group', 'aria-label': 'Filter jacks' });
  return mod('m-flt', 'flt', '4', h('span', {}, label(L('VCF', 'ФИЛЬТР')), ' ', h('small', {}, label(L('THE POLIVOKS FILTER: SHAPES THE TONE', 'ФИЛЬТР ПОЛИВОКС')))),
    h('div', { class: 'flt-knobs' },
      knob({ k: 'flt.frq', l: L('FREQUENCY', 'ЧАСТОТА'), big: true }),
      knob({ k: 'flt.res', l: L('RESONANCE', 'РЕЗОНАНС'), big: true }),
      knob({ k: 'flt.cv1', l: L('CV 1', 'УН 1'), fmt: (x) => `×${signed(2 * x - 1, 2)}` }),
      knob({ k: 'flt.lvl', l: L('AUDIO', 'ВХОД') }),
      knob({ k: 'flt.mix', l: L('MIX LP–BP', 'СМЕСЬ НЧ–ПФ') })),
    jacksEl);
}

function renderJacks() {
  if (!jacksEl) return;
  const ins = [[L('CV 1', 'УН 1'), L('EG 1', 'ОГИБ. 1')], [L('CV 2', 'УН 2'), L('TRACK + LFO', 'СЛЕЖ. + МОД.')], [L('AUDIO IN', 'ВХОД'), L('MIXER', 'МИКШЕР')]];
  const outs = [['lp', L('LP OUT', 'ВЫХ НЧ')], ['bp', L('BP OUT', 'ВЫХ ПФ')], ['mix', L('MIX OUT', 'ВЫХ СМЕСЬ')]];
  jacksEl.replaceChildren(
    ...ins.map(([n, from]) => helpOn(h('div', { class: 'jack patched' }, h('i'), label(n), h('em', {}, label(from))), 'jack.in')),
    ...outs.map(([v, n]) => {
      const on = state['flt.out'] === v;
      return helpOn(h('button', { type: 'button', class: 'jack', 'aria-pressed': String(on), title: 'Patch this output to the amplifier', onclick: () => setParam('flt.out', v) },
        h('i'), label(n), h('em', {}, on ? label(L('→ VCA', '→ УСИЛ.')) : '')), 'flt.out');
    }),
  );
  const tag = document.getElementById('sf-out');
  if (tag) tag.textContent = { lp: 'LP OUT', bp: 'BP OUT', mix: 'MIX OUT' }[state['flt.out']] || 'LP OUT';
}

/* The signal-flow map (art/draw.py): a block lights its module, a module lights its block, a click goes there. */
function bindFlow() {
  const blocks = [...document.querySelectorAll('.sf-block')];
  const lightBlocks = (id) => blocks.forEach((b) => b.classList.toggle('lit', b.dataset.mod === id));
  for (const b of blocks) {
    const m = () => document.getElementById(`mod-${b.dataset.mod}`);
    b.addEventListener('mouseenter', () => { lightBlocks(b.dataset.mod); m()?.classList.add('lit'); });
    b.addEventListener('mouseleave', () => { lightBlocks(null); m()?.classList.remove('lit'); });
    b.addEventListener('click', (e) => {
      const el = m(); if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
      el.classList.add('flash'); setTimeout(() => el.classList.remove('flash'), 1100);
      if (e.detail === 0) el.querySelector('[role="slider"], button')?.focus({ preventScroll: true });
    });
  }
  document.querySelectorAll('.module').forEach((el) => {
    el.addEventListener('mouseenter', () => lightBlocks(el.id.slice(4)));
    el.addEventListener('mouseleave', () => lightBlocks(null));
  });
}

function setLang(lang) {
  settings.lang = lang; persist();
  document.querySelectorAll('[data-en]').forEach((el) => { el.textContent = el.dataset[lang] || el.dataset.en; });
  document.querySelectorAll('[data-lang]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  for (const c of controls.values()) if (c.relabel) c.relabel();
  view3d?.setLang(lang);
}

/* ---------- the PF-82 in 3D (view3d.js, from the CAD model in cad/pf-82) ---------- */
let view3d = null;
const MODULE_LABELS = {
  vco1: L('VCO 1 · MAKES THE TONE', 'ГЕНЕРАТОР 1'), vco2: L('VCO 2 · A SECOND TONE', 'ГЕНЕРАТОР 2'), mix: L('MIXER · BLENDS THEM', 'МИКШЕР'),
  flt: L('VCF · THE POLIVOKS FILTER', 'ФИЛЬТР ПОЛИВОКС'), eg1: L('ENV 1 · MOVES THE FILTER', 'ОГИБ. 1 · ФИЛЬТР'), amp: L('VCA + ENV 2 · LOUDNESS', 'УСИЛИТЕЛЬ · ГРОМКОСТЬ'),
  lfo: L('LFO · A SLOW WOBBLE', 'МОДУЛЯТОР'), voice: L('KEYBOARD · HOW NOTES PLAY', 'КЛАВИАТУРА'),
};
function start3D() {
  const stage = $('#view3d-stage');
  if (!stage) return;
  const begin = async () => {
    try {
      const { createView3D } = await import('./view3d.js');
      view3d = await createView3D({
        stage, base: '.', lang: settings.lang, keyBase: settings.base, powered: engine.on,
        getState: () => state,
        labelFor: (k, lang) => (LABELS[k] ? LABELS[k][lang] || LABELS[k].en : null),
        moduleLabel: (id, lang) => (MODULE_LABELS[id] ? MODULE_LABELS[id][lang] || MODULE_LABELS[id].en : null),
        onParam: (k, v) => (k === 'src' ? pickSource(v) : setParam(k, v)),
        onNote: (n, down, src) => (down ? noteOn(n, src) : noteOff(src)),
        onPower: () => power(),
        onHover: (k) => showHelp(k),
      });
      for (const n of sounding.keys()) view3d.key(n, true);
      window.PF82_3D = Object.freeze({ project: view3d.project, stats: view3d.stats });
      stage.dataset.ready = 'true';
    } catch (err) {
      stage.replaceChildren(h('p', { class: 'view3d-wait', text: `The 3D view could not start here (${err.message}). The panel below works the same.` }));
    }
  };
  if (!('IntersectionObserver' in window)) { begin(); return; }
  const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) { io.disconnect(); begin(); } }, { rootMargin: '200px' });
  io.observe(stage);
}

/* ---------- patches ---------- */

function applyPatch(id, extra = {}) {
  if (!PATCHES[id]) return;
  settings.patch = id;
  const values = patchValues(id, extra);
  for (const [k, v] of Object.entries(values)) setParam(k, v, { send: false });
  if (engine.node) engine.node.port.postMessage({ t: 'params', v: values });
  const sel = $('#patch'); if (sel) sel.value = id;
  renderJacks(); persist();
}
const loadPatch = (id) => applyPatch(id);

/* ---------- songs ---------- */
const songs = { prepared: null, playing: null, pending: null, lit: new Set(), shown: '' };
// Your own songs (from an agent or a #song= link) are kept in this browser, the newest first, at most 20.
const USER_SONGS = 'polivoks.songs.v1';
let userSongs = (store.get(USER_SONGS) || []).flatMap((x) => { try { return [validateSong(x.spec)]; } catch { return []; } });
const userSpecs = new Map((store.get(USER_SONGS) || []).map((x) => [x.id, x.spec]));
const songById = (id) => SONGS.find((x) => x.id === id) || JINGLE_SONGS.find((x) => x.id === id) || userSongs.find((x) => x.id === id);
function addUserSong(spec) {
  const x = validateSong(spec);
  userSongs = [x, ...userSongs.filter((y) => y.id !== x.id)].slice(0, 20);
  userSpecs.set(x.id, spec);
  store.set(USER_SONGS, userSongs.map((y) => ({ id: y.id, spec: userSpecs.get(y.id) })).filter((y) => y.spec));
  renderSongSelect(x.id);
  return x;
}
function renderSongSelect(selected) {
  const sel = $('#song');
  const opt = (x) => h('option', { value: x.id, text: `${x.title} · ${x.by.split(',')[0]}` });
  sel.replaceChildren(
    h('optgroup', { label: 'Public-domain songs' }, ...SONGS.map(opt)),
    h('optgroup', { label: 'Sakura Shōten jingles' }, ...JINGLE_SONGS.map((x) => h('option', { value: x.id, text: `${x.title} · Sakura Shōten` }))),
    ...(userSongs.length ? [h('optgroup', { label: 'Your songs' }, ...userSongs.map(opt))] : []),
  );
  sel.value = songById(selected) ? selected : SONGS[0].id;
  settings.song = sel.value;
}
function buildSongs() {
  const sel = $('#song');
  renderSongSelect(settings.song);
  sel.addEventListener('change', () => { settings.song = sel.value; persist(); prepareSong(sel.value); if (songs.playing) playSong(); });
  helpOn(sel.closest('label'), 'song');
  helpOn($('#play'), 'play').addEventListener('click', () => (songs.playing ? stopSong() : playSong()));
  const t = seg('song.tempo', [[0.2925, '×¾'], [0.5, '×1'], [0.661, '×1¼']], { aria: 'Song tempo' });
  controls.set('song.tempo', { show: t.show }); t.show(state['song.tempo']);
  $('#tempo').replaceWith(helpOn(Object.assign(t.row, { id: 'tempo' }), 'song.tempo'));
  $('#songbook').replaceChildren(...SONGS.map((x) => h('li', {},
    h('strong', { text: x.title }), h('span', { text: `${x.by}, ${x.year}${x.from && x.from !== 'Traditional' ? ` · ${x.from}` : ''}` }), h('span', { text: x.note }),
    h('button', { type: 'button', class: 'btn', text: 'Play on the PF-82', onclick: () => playFromList(x.id) }))));
  // Sakura Shōten's jingles: the shop's recordings, and the same notes on this PF-82 (with its own tuning).
  $('#jingles').replaceChildren(...JINGLE_SONGS.map((x) => {
    const file = `jingles/sakura/${x.id}.${x.jingle.loop ? 'wav' : 'mp3'}`; // the loop is the WAV: an MP3 adds silence at the seam
    return h('li', {},
      h('strong', { text: x.title }), h('span', { class: 'when', text: x.jingle.when }), h('span', { text: x.note }),
      h('audio', { controls: true, preload: 'none', loop: x.jingle.loop, src: file, 'aria-label': `${x.title}, recorded on the shop's PF-82` }),
      h('button', { type: 'button', class: 'btn', text: 'Play on the PF-82', onclick: () => playFromList(x.id) }));
  }));
  $('#jingles-unit').textContent = String(SHOP_UNIT.seed);
}
function playFromList(id) {
  const sel = $('#song');
  sel.value = id; settings.song = id; persist(); prepareSong(id); playSong();
  $('#panel').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function prepareSong(id) { const x = songById(id); if (!x) return; applyPatch(x.patch.base, x.patch.set); songs.prepared = id; }
async function playSong() {
  const x = songById($('#song').value); if (!x) return;
  songs.pending = null;
  if (!engine.on) await power();
  if (!engine.on) return;
  if (songs.prepared !== x.id) prepareSong(x.id);
  engine.node.port.postMessage({ t: 'song', ...build(x) });
  songs.playing = x.id;
  $('#play').setAttribute('aria-pressed', 'true'); $('#play-label').textContent = 'STOP';
}
function stopSong() { engine.node?.port.postMessage({ t: 'songStop' }); songDone(); }
function songDone(text) {
  songs.playing = null; songs.shown = '';
  $('#play').setAttribute('aria-pressed', 'false'); $('#play-label').textContent = 'PLAY';
  if (text) status(text);
}
function songTele(t) {
  if (songs.playing && t.ended === songs.playing && !t.song) songDone('Song finished. Play it again or choose another.');
  if (t.song && songs.playing === t.song.id) {
    const x = songById(t.song.id), bars = Math.ceil(t.song.len / x.meter), bar = Math.min(bars, Math.floor(t.song.beat / x.meter) + 1);
    const text = `♪ ${x.title} · ${x.by.split(',')[0]}, ${x.year} · bar ${bar} of ${bars}`;
    if (text !== songs.shown) { songs.shown = text; status(text); }
  }
  const now = new Set(t.notes || []); // light the keys the song is playing
  for (const n of songs.lit) if (!now.has(n) && !sounding.has(n)) markKey(n, false);
  for (const n of now) markKey(n, true);
  songs.lit = now;
}

/* ---------- agents ----------
 * The same commands for every agent: the MCP server's live bridge (?agent=TOKEN on its own 127.0.0.1 page),
 * and window.PF82 for an agent that drives this page in a browser. Browsers start sound only after a
 * person's click, so a song asked for while Power is off waits until it is pressed. */
const agentApi = {
  state() {
    const t = engine.tele;
    return {
      power: engine.on, patch: settings.patch, song: songs.playing, waitingForPower: songs.pending,
      params: Object.fromEntries(Object.entries(state).filter(([k]) => k !== 'src')),
      songs: [...SONGS, ...JINGLE_SONGS, ...userSongs].map((x) => ({ id: x.id, title: x.title, yours: !!x.user, ...(x.jingle ? { jingle: true } : {}) })),
      circuit: t ? { cutoffHz: Math.round(t.fc), q: Number.isFinite(t.q) ? +t.q.toFixed(2) : 'self-oscillating', caseC: +t.temp.toFixed(2), clipping: t.clip } : null,
    };
  },
  set({ values = {} }) {
    const { values: v, errors } = validateParams(values);
    if (errors.length) throw new Error(errors.join('\n'));
    for (const [k, x] of Object.entries(v)) setParam(k, x);
    return { set: v };
  },
  patch({ id }) { if (!PATCHES[id]) throw new Error(`No patch ${id}.`); applyPatch(id); return { patch: id }; },
  play({ song, id }) {
    const x = song ? addUserSong(song) : songById(id);
    if (!x) throw new Error(`No song ${id}.`);
    $('#song').value = x.id; settings.song = x.id; persist(); prepareSong(x.id);
    if (!engine.on) { songs.pending = x.id; status(`“${x.title}” is ready. Press Power to hear it.`); return { id: x.id, title: x.title, waitingForPower: true }; }
    playSong();
    return { id: x.id, title: x.title, playing: true };
  },
  stop() { stopSong(); return { stopped: true }; },
};
window.PF82 = Object.freeze({ ...agentApi });

function connectAgent() {
  const token = new URLSearchParams(location.search).get('agent');
  if (!token || !window.EventSource) return;
  const q = `token=${encodeURIComponent(token)}`;
  const es = new EventSource(`/agent/events?${q}`);
  es.onopen = () => status('An agent is connected: it can turn knobs and play songs here. Press Power to hear it.');
  es.onerror = () => status('The agent connection dropped; it comes back by itself while the MCP server runs.');
  es.onmessage = async (e) => {
    let msg; try { msg = JSON.parse(e.data); } catch { return; }
    let reply;
    try {
      const fn = agentApi[msg.cmd];
      if (!fn) throw new Error(`Unknown command ${msg.cmd}.`);
      reply = { id: msg.id, ok: true, result: await fn(msg.args || {}) };
    } catch (err) { reply = { id: msg.id, ok: false, error: err.message }; }
    fetch(`/agent/result?${q}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(reply) }).catch(() => {});
  };
}

/* A song in the address (#song=…, from pf82_share_link) joins Your songs, ready to play. */
function openSharedSong() {
  const m = /[#&]song=([A-Za-z0-9_-]+)/.exec(location.hash);
  if (!m) return;
  try {
    const x = addUserSong(decodeSpec(m[1]));
    prepareSong(x.id); songs.pending = x.id;
    status(`“${x.title}” is loaded. Press Power, and it plays.`);
  } catch (err) { status(`That song link could not be read: ${err.message.split('\n')[0]}`); }
}

/* ---------- audio ---------- */
const engine = { ctx: null, node: null, analyser: null, mute: null, mic: null, micNode: null, tele: null, on: false, os: 4 };
const status = (text) => { const el = $('#status'); el.textContent = text; el.title = text; };

async function power() {
  const btn = $('#power');
  if (engine.on) {
    engine.on = false; btn.setAttribute('aria-pressed', 'false'); view3d?.power(false);
    engine.node?.port.postMessage({ t: 'panic' });
    if (songs.playing) songDone();
    await engine.ctx?.suspend();
    status('Sound is off. Press Power.');
    return;
  }
  try {
    if (!engine.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) throw new Error('This browser has no Web Audio.');
      engine.ctx = new Ctx({ latencyHint: 'interactive' });
      engine.ctx.resume(); // inside the click: Safari only starts audio from a gesture
      if (!engine.ctx.audioWorklet) throw new Error('This browser has no AudioWorklet; try a current Chrome, Edge, Firefox or Safari.');
      await engine.ctx.audioWorklet.addModule(new URL('./dsp/polivoks-dsp.js', import.meta.url));
      engine.analyser = engine.ctx.createAnalyser();
      engine.analyser.fftSize = 8192; engine.analyser.smoothingTimeConstant = 0.55;
      engine.mute = engine.ctx.createGain(); engine.mute.gain.value = 0;
      engine.analyser.connect(engine.mute).connect(engine.ctx.destination);
      makeNode();
    }
    await engine.ctx.resume();
    engine.on = true; btn.setAttribute('aria-pressed', 'true'); view3d?.power(true);
    status(`Running at ${(engine.ctx.sampleRate / 1000).toFixed(1)} kHz, ${engine.os}× oversampled.`);
    if (songs.pending) { $('#song').value = songs.pending; songs.pending = null; playSong(); }
  } catch (err) {
    status(`Could not start the sound: ${err.message}`);
  }
}

function makeNode() {
  const ctx = engine.ctx;
  if (engine.node) { engine.node.port.onmessage = null; engine.node.disconnect(); }
  const os = ctx.sampleRate >= 88200 ? 2 : settings.os;
  engine.os = os;
  const params = {}; for (const k of Object.keys(DEFAULTS)) params[k] = state[k];
  engine.node = new AudioWorkletNode(ctx, 'polivoks', { numberOfInputs: 1, numberOfOutputs: 2, outputChannelCount: [2, 1], processorOptions: { os, params } });
  engine.node.port.onmessage = (e) => { if (e.data && e.data.t === 'tele') { engine.tele = e.data; renderReadout(); songTele(e.data); } };
  engine.node.onprocessorerror = () => status('The audio processor stopped. Reload the page.');
  engine.node.connect(ctx.destination, 0);
  engine.node.connect(engine.analyser, 1);
  if (engine.micNode) engine.micNode.connect(engine.node);
}

async function pickSource(v) {
  if (v === 'line' && !engine.micNode) {
    if (!engine.ctx) await power();
    if (!engine.ctx) return;
    try {
      engine.mic = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      engine.micNode = engine.ctx.createMediaStreamSource(engine.mic);
      engine.micNode.connect(engine.node);
      status('Line in: your input goes through the filter. Use headphones to avoid feedback.');
    } catch (err) {
      status(`No line input: ${err.message}`);
      setParam('src', 'synth'); return;
    }
  }
  setParam('src', v);
}

/* ---------- keyboard ---------- */
const held = new Map(); // source id → note
const sounding = new Map(); // note → count
function noteOn(n, src) {
  if (held.has(src)) noteOff(src);
  held.set(src, n);
  sounding.set(n, (sounding.get(n) || 0) + 1);
  if (sounding.get(n) === 1) engine.node?.port.postMessage({ t: 'on', n });
  markKey(n, true);
  if (!engine.on) status('Press Power to hear it.');
}
function noteOff(src) {
  const n = held.get(src); if (n == null) return;
  held.delete(src);
  const c = (sounding.get(n) || 1) - 1;
  if (c <= 0) { sounding.delete(n); engine.node?.port.postMessage({ t: 'off', n }); markKey(n, false); } else sounding.set(n, c);
}
function markKey(n, down) { const el = document.querySelector(`.key[data-n="${n}"]`); if (el) el.classList.toggle('down', down); if (view3d) view3d.key(n, down); }
const NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const noteName = (n) => `${NAMES[n % 12]}${Math.floor(n / 12) - 1}`;

function buildKeys() {
  const box = $('#keys');
  const width = box.clientWidth || 800;
  const octaves = Math.max(1, Math.min(4, Math.floor(width / (7 * 34))));
  const lo = settings.base, hi = lo + 12 * octaves;
  box.replaceChildren();
  let last = null;
  for (let n = lo; n <= hi; n++) {
    const black = [1, 3, 6, 8, 10].includes(n % 12);
    if (black) { if (last) last.append(h('div', { class: 'key b', 'data-n': n, style: 'right:-31%;width:62%' })); continue; }
    last = h('div', { class: 'key w', 'data-n': n, style: 'flex:1 1 0' }, n % 12 === 0 ? h('span', { class: 'kl', text: noteName(n) }) : null);
    box.append(last);
  }
  for (const n of sounding.keys()) markKey(n, true);
  $('#oct-show').textContent = noteName(lo);
}

function bindKeys() {
  const box = $('#keys');
  const at = (e) => { const el = document.elementFromPoint(e.clientX, e.clientY); return el && el.closest('.key') ? Number(el.closest('.key').dataset.n) : null; };
  box.addEventListener('pointerdown', (e) => { const n = at(e); if (n == null) return; box.setPointerCapture(e.pointerId); noteOn(n, `p${e.pointerId}`); e.preventDefault(); });
  box.addEventListener('pointermove', (e) => { const src = `p${e.pointerId}`; if (!held.has(src)) return; const n = at(e); if (n != null && n !== held.get(src)) noteOn(n, src); });
  const up = (e) => noteOff(`p${e.pointerId}`);
  box.addEventListener('pointerup', up); box.addEventListener('pointercancel', up);
  const KEYS = 'awsedftgyhujkolp;\'';
  window.addEventListener('keydown', (e) => {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.closest && e.target.closest('input, select, textarea')) return;
    const key = e.key.toLowerCase();
    if (key === 'z' || key === 'x') { shiftOctave(key === 'z' ? -1 : 1); return; }
    const i = KEYS.indexOf(key);
    if (i >= 0) { noteOn(settings.base + 12 + i, `k${key}`); e.preventDefault(); }
  });
  window.addEventListener('keyup', (e) => noteOff(`k${e.key.toLowerCase()}`));
  window.addEventListener('blur', () => { for (const src of [...held.keys()]) noteOff(src); });
  $('#oct-down').addEventListener('click', () => shiftOctave(-1));
  $('#oct-up').addEventListener('click', () => shiftOctave(1));
  let rt = 0; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(buildKeys, 150); });
}
function shiftOctave(d) { settings.base = Math.max(12, Math.min(84, settings.base + 12 * d)); persist(); buildKeys(); if (view3d) view3d.setKeyBase(settings.base); }

/* ---------- MIDI ---------- */
async function midi() {
  const btn = $('#midi');
  if (!navigator.requestMIDIAccess) { status('This browser has no Web MIDI.'); return; }
  try {
    const access = await navigator.requestMIDIAccess();
    const bind = () => { let n = 0; for (const input of access.inputs.values()) { input.onmidimessage = onMidi; n++; } status(n ? `MIDI: ${n} input${n > 1 ? 's' : ''} listening.` : 'MIDI is on, but no input is connected.'); };
    access.onstatechange = bind; bind();
    btn.setAttribute('aria-pressed', 'true');
  } catch (err) { status(`MIDI not available: ${err.message}`); }
}
function onMidi(e) {
  const [st, a, b] = e.data, type = st & 0xf0;
  if (type === 0x90 && b > 0) noteOn(a, `m${a}`);
  else if (type === 0x80 || (type === 0x90 && b === 0)) noteOff(`m${a}`);
  else if (type === 0xb0) {
    const k = { 74: 'flt.frq', 71: 'flt.res', 1: 'lfo.pitch' }[a];
    if (k) setParam(k, b / 127);
  } else if (type === 0xe0) setParam('kbd.bend', (((b << 7) | a) - 8192) / 4096);
}

/* ---------- scope and spectrum ---------- */
const TIMEBASES = [2, 5, 10, 20, 50];
const PROBES = [['out', 'OUT'], ['lp', 'LP'], ['bp', 'BP'], ['mix', 'MIX'], ['in', 'IN']];
let timebase = 10, tbuf = null, fbuf = null;
function buildBench() {
  const p = seg('probe', PROBES, { cls: 'seg small', aria: 'Probe' });
  controls.set('probe', { show: p.show }); p.show(state.probe);
  $('#probe').replaceWith(Object.assign(p.row, { id: 'probe' }));
  const t = seg('tb', TIMEBASES.map((ms) => [ms, `${ms} ms`]), { cls: 'seg small', aria: 'Time base', onPick: (v) => { timebase = Number(v); t.show(v); } });
  t.show(timebase); $('#timebase').replaceWith(Object.assign(t.row, { id: 'timebase' }));
}
function fitCanvas(c) {
  const dpr = Math.min(2, window.devicePixelRatio || 1), w = Math.round(c.clientWidth * dpr), hh = Math.round(c.clientHeight * dpr);
  if (c.width !== w || c.height !== hh) { c.width = w; c.height = hh; }
  return dpr;
}
const css = getComputedStyle(document.documentElement);
const AMBER = css.getPropertyValue('--amber').trim() || '#f2a93b';
function grid(g, w, hh, nx, ny) {
  g.fillStyle = '#0c0d0c'; g.fillRect(0, 0, w, hh);
  g.strokeStyle = 'rgba(238,235,228,0.09)'; g.lineWidth = 1; g.beginPath();
  for (let i = 1; i < nx; i++) { const x = Math.round((w * i) / nx) + 0.5; g.moveTo(x, 0); g.lineTo(x, hh); }
  for (let i = 1; i < ny; i++) { const y = Math.round((hh * i) / ny) + 0.5; g.moveTo(0, y); g.lineTo(w, y); }
  g.stroke();
}
function drawScope() {
  const c = $('#scope'), dpr = fitCanvas(c), g = c.getContext('2d'), w = c.width, hh = c.height;
  grid(g, w, hh, 10, 8);
  g.fillStyle = 'rgba(238,235,228,0.45)'; g.font = `${11 * dpr}px "IBM Plex Mono", monospace`;
  const volts = state.probe !== 'out';
  g.fillText(volts ? '±10 V' : '±1 FS', 6 * dpr, 14 * dpr); g.fillText(`${timebase} ms`, w - 50 * dpr, hh - 8 * dpr);
  if (!engine.on || !engine.analyser) return;
  const a = engine.analyser; if (!tbuf || tbuf.length !== a.fftSize) tbuf = new Float32Array(a.fftSize);
  a.getFloatTimeDomainData(tbuf);
  const win = Math.min(Math.round((timebase * engine.ctx.sampleRate) / 1000), tbuf.length >> 1);
  let start = 0, armed = false;
  for (let i = 1; i < tbuf.length - win; i++) {
    if (tbuf[i] < -0.01) armed = true;
    if (armed && tbuf[i - 1] <= 0 && tbuf[i] > 0) { start = i; break; }
  }
  g.strokeStyle = AMBER; g.lineWidth = 1.6 * dpr; g.beginPath();
  for (let i = 0; i < win; i++) { const x = (i / (win - 1)) * w, y = hh * (0.5 - 0.5 * Math.max(-1.05, Math.min(1.05, tbuf[start + i]))); i ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.stroke();
}
function drawSpectrum() {
  const c = $('#spectrum'), dpr = fitCanvas(c), g = c.getContext('2d'), w = c.width, hh = c.height;
  grid(g, w, hh, 1, 6);
  const fx = (f) => (Math.log10(f / 20) / 3) * w; // 20 Hz … 20 kHz
  g.strokeStyle = 'rgba(238,235,228,0.09)'; g.beginPath();
  for (const f of [50, 100, 200, 500, 1000, 2000, 5000, 10000]) { const x = Math.round(fx(f)) + 0.5; g.moveTo(x, 0); g.lineTo(x, hh); }
  g.stroke();
  g.fillStyle = 'rgba(238,235,228,0.45)'; g.font = `${11 * dpr}px "IBM Plex Mono", monospace`;
  for (const [f, t] of [[100, '100'], [1000, '1k'], [10000, '10k']]) g.fillText(t, fx(f) + 3 * dpr, hh - 6 * dpr);
  g.fillText('0 dB', 6 * dpr, 14 * dpr); g.fillText('−120', 6 * dpr, hh - 20 * dpr);
  if (!engine.on || !engine.analyser) return;
  const a = engine.analyser; if (!fbuf || fbuf.length !== a.frequencyBinCount) fbuf = new Float32Array(a.frequencyBinCount);
  a.getFloatFrequencyData(fbuf);
  const binHz = engine.ctx.sampleRate / a.fftSize, y = (db) => hh * Math.min(1, Math.max(0, -db / 120));
  g.beginPath(); g.moveTo(0, hh);
  let started = false;
  for (let px = 0; px <= w; px += 2) {
    const f0 = 20 * Math.pow(1000, px / w), f1 = 20 * Math.pow(1000, (px + 2) / w);
    let m = -200; for (let b = Math.floor(f0 / binHz); b <= Math.ceil(f1 / binHz) && b < fbuf.length; b++) m = Math.max(m, fbuf[b]);
    g.lineTo(px, y(m)); started = true;
  }
  if (started) { g.lineTo(w, hh); g.closePath(); g.fillStyle = 'rgba(242,169,59,0.16)'; g.fill(); g.strokeStyle = AMBER; g.lineWidth = 1.2 * dpr; g.stroke(); }
  const fc = engine.tele && engine.tele.fc;
  if (fc > 20 && fc < 20000) {
    g.setLineDash([4 * dpr, 4 * dpr]); g.strokeStyle = 'rgba(238,235,228,0.7)'; g.beginPath(); g.moveTo(fx(fc), 0); g.lineTo(fx(fc), hh); g.stroke(); g.setLineDash([]);
  }
}
function frame() {
  if (!document.hidden) { drawScope(); drawSpectrum(); }
  requestAnimationFrame(frame);
}

/* ---------- readouts ---------- */
function rows(dl, list) {
  dl.replaceChildren(...list.flatMap(([k, v, warn]) => [h('dt', { text: k }), h('dd', { class: warn ? 'warn' : null, text: v })]));
}
function renderReadout() {
  const t = engine.tele, dl = $('#readout');
  if (!t) { rows(dl, [['Cutoff', '—'], ['Resonance', '—'], ['State', 'Press Power']]); return; }
  const mins = Math.floor(t.run / 60), secs = Math.floor(t.run % 60);
  rows(dl, [
    ['Cutoff, small signal', fmtHz(t.fc)],
    ['Resonance', t.osc ? 'self-oscillating' : `Q ${t.q.toFixed(t.q < 10 ? 2 : 1)}`, t.osc],
    ['Q1 base–emitter', `${(t.vbe * 1000).toFixed(1)} mV`],
    ['Iset U2 · U3', `${fmtA(t.i2)} · ${fmtA(t.i3)}`],
    ['Case temperature', `${t.temp.toFixed(2)} °C`],
    ['+12 V rail', `${t.vplus.toFixed(3)} V`],
    ['CV 2 sensitivity', `${t.vpo.toFixed(3)} V/oct`],
    ['Keyboard tracking', `×${(MAP.track(state['glob.track']) / t.vpo).toFixed(3)}`],
    ['Peaks BP · LP', `${t.bp.toFixed(1)} · ${t.lp.toFixed(1)} V${t.clip ? ', clipping' : ''}`, t.clip],
    ['Powered for', `${mins}:${String(secs).padStart(2, '0')}`],
  ]);
}

/* ---------- imperfections ---------- */
const SERVICE_REDRAW = new Set(['imp.grade', 'imp.seed', 'imp.warmup', 'imp.mains']);
const serviceLabels = {}; // slider key → { b, fmt }: updated in place so a drag is never interrupted
function slider(k, aria, fmt, attrs = {}) {
  const el = h('input', { type: 'range', min: '0', max: '1', step: '0.005', ...attrs, value: String(state[k]), 'aria-label': aria });
  el.addEventListener('input', () => setParam(k, Number(el.value)));
  const b = h('b', { text: fmt(Number(state[k])) });
  serviceLabels[k] = { b, fmt };
  return { el, b };
}
function field(text, b, ...kids) { return h('div', { class: 'field' }, h('span', {}, text, b), ...kids); }
function renderService() {
  const box = $('#service'), ideal = state['imp.grade'] === 'ideal';
  const grade = seg('imp.grade', [['ideal', 'Ideal parts'], ['modern', 'Modern build'], ['vintage', 'Vintage']], { aria: 'Build' }); grade.show(state['imp.grade']);
  const serial = h('input', { type: 'number', min: '1', max: '99999', value: String(state['imp.seed']), 'aria-label': 'Serial number', disabled: ideal });
  serial.addEventListener('change', () => setParam('imp.seed', Math.max(1, Math.min(99999, Math.round(Number(serial.value)) || 1))));
  const reroll = h('button', { type: 'button', class: 'btn', disabled: ideal, text: 'Another unit', onclick: () => setParam('imp.seed', 1 + Math.floor(Math.random() * 99999)) });
  const amb = slider('imp.ambient', 'Room temperature', (x) => `${x.toFixed(1)} °C`, { min: '10', max: '40', step: '0.5' });
  const warm = seg('imp.warmup', [['on', 'Warms up'], ['off', 'Held at room temperature']], { aria: 'Warm-up' }); warm.show(state['imp.warmup']);
  const cold = h('button', { type: 'button', class: 'btn', disabled: ideal, text: 'Cold start', onclick: () => engine.node?.port.postMessage({ t: 'power' }) });
  const rip = slider('imp.ripple', 'Mains ripple', (x) => `${(MAP.ripple(x) * 1000).toFixed(1)} mV`);
  const mains = seg('imp.mains', [[50, '50 Hz'], [60, '60 Hz']], { aria: 'Mains frequency' }); mains.show(state['imp.mains']);
  const hiss = slider('imp.hiss', '776 hiss', (x) => `×${MAP.hiss(x).toFixed(1)}`);
  const wear = slider('imp.wear', 'Pot wear', (x) => `${Math.round(x * 100)} %`);
  const os = seg('os', [[4, '4×'], [2, '2×']], { aria: 'Oversampling', onPick: (v) => { settings.os = Number(v); persist(); if (engine.ctx) makeNode(); os.show(v); } }); os.show(settings.os);
  for (const c of [amb, rip, hiss, wear]) c.el.disabled = ideal;
  for (const b of [...warm.row.children, ...mains.row.children]) b.disabled = ideal;
  const dis = (f) => { if (ideal) f.classList.add('disabled'); return f; };
  box.replaceChildren(
    field('Build', null, grade.row),
    dis(field('Serial number', null, h('div', { class: 'row' }, serial, reroll))),
    dis(field('Room temperature', amb.b, amb.el)),
    dis(field('Warm-up after power-on', null, h('div', { class: 'row' }, warm.row, cold))),
    dis(field('Mains ripple on +12 V', rip.b, rip.el, mains.row)),
    dis(field('776 hiss', hiss.b, hiss.el)),
    dis(field('Pot wear (wipers lift when turned)', wear.b, wear.el)),
    field('Oversampling (2× is lighter for phones)', null, os.row),
  );
  renderSheet();
}
function renderSheet() {
  const u = makeUnit(Number(state['imp.seed']) || 1, state['imp.grade']);
  $('#sheet-serial').textContent = u.grade === 'ideal' ? 'nominal parts' : `№ ${String(u.seed).padStart(5, '0')}, ${u.grade}`;
  const f = new PolivoksFilter(192000, u);
  const base = { frq: 0.5, att: 0.5, lvl: 0.5, res: 0, mix: 0, open: 0, cv1: 0, cv2: 0, vplus: u.vreg, tempC: 25, hiss: 0, steps: 1 };
  f.control(base); const fc = f.w0 / (2 * Math.PI);
  let lo = 0.5, hi = 1; // where does it break into oscillation?
  for (let i = 0; i < 24; i++) { const mid = (lo + hi) / 2; f.control({ ...base, res: mid }); if (f.knet > 0) lo = mid; else hi = mid; }
  const chip = (c) => `${signed(c.vos * 1000, 2)} mV · ${(c.cc * 1e12).toFixed(1)} pF · ×${c.m.toFixed(3)}`;
  const split = (100 * u.u2.isd) / (u.u2.isd + u.u3.isd);
  rows($('#sheet'), [
    ['Cutoff at FREQUENCY 5, 25 °C', fmtHz(fc)],
    ['Oscillates from RESONANCE', (hi * 10).toFixed(2)],
    ['Q1 saturation current', `×${(u.q1.Is / 6.73e-15).toFixed(3)} nominal`],
    ['Q1 current gain', u.q1.beta.toFixed(0)],
    ['R8 (sets the octave)', `${(u.R.R8 / 1000).toFixed(4)} kΩ`],
    ['U2 offset · Cc · bias', chip(u.u2)],
    ['U3 offset · Cc · bias', chip(u.u3)],
    ['Iset split at low current', `${split.toFixed(1)} / ${(100 - split).toFixed(1)} %`],
    ['+12 V regulator', `${u.vreg.toFixed(3)} V`],
    ['Warm-up rise', u.warmRise ? `+${u.warmRise.toFixed(1)} °C` : 'none'],
    ['VCO 1 · VCO 2 tuning', `${signed(u.vco[0].cents, 1)} · ${signed(u.vco[1].cents, 1)} cents`],
    ['VCO tempco', `${signed(u.vco[0].tempco, 2)} · ${signed(u.vco[1].tempco, 2)} c/°C`],
  ]);
}

/* ---------- start ---------- */
function init() {
  buildPanel(); bindFlow();
  buildBench(); buildSongs();
  buildKeys(); bindKeys();
  renderService(); renderReadout();
  const sel = $('#patch');
  helpOn(sel.closest('label'), 'patch'); helpOn($('#power'), 'power');
  sel.replaceChildren(...Object.entries(PATCHES).map(([id, [name]]) => h('option', { value: id, text: name })));
  sel.value = PATCHES[settings.patch] ? settings.patch : 'init';
  sel.addEventListener('change', () => loadPatch(sel.value));
  document.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));
  setLang(settings.lang);
  $('#power').addEventListener('click', power);
  $('#midi').addEventListener('click', midi);
  if (state.src === 'line') setParam('src', 'synth', { send: false }); // the microphone needs asking again
  openSharedSong(); connectAgent(); start3D();
  window.addEventListener('hashchange', openSharedSong);
  requestAnimationFrame(frame);
}
init();
