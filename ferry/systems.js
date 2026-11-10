/**
 * The Chisum's systems on the page: her component register (data/systems.json, written by systems/register.py) made
 * explorable. A tap on a component names it and says what feeds it and what it talks to; the Systems tab lists her
 * supply, the boards and their circuits, the nets, the pipes and the equipment by subsystem, and shows whichever is
 * chosen in the model: a box round each component that belongs to it, and the run of its cables or its pipe.
 *
 * Nothing here knows how the ship is drawn: app.js hands over the decks' nodes, and the register gives each component
 * its box in the ship's own axes and the part of the viewer it is drawn in.
 */
import * as THREE from 'three';

const el = (tag, props = {}, ...kids) => { const n = Object.assign(document.createElement(tag), props); n.append(...kids.filter(k => k !== null && k !== undefined && k !== false)); return n; };
const kW = w => w >= 1000 ? `${(w / 1000).toFixed(1)} kW` : `${w} W`;
/** What each kind of run is drawn in: cables that carry power, cables that carry signals, pipes. */
const INK = { power: 0xe58a00, net: 0x2f7de1, pipe: 0x0a9c94 };

export function createSystems({ data, decks, list, card, readout, flyTo, eyeDir, redraw, accent, walking, onChange }) {
  const comps = new Map(data.components.map(c => [c.id, c]));
  const boards = new Map(data.boards.map(b => [b.id, b]));
  const nets = new Map(data.nets.map(n => [n.id, n]));
  const pipes = new Map(data.pipes.map(p => [p.id, p]));
  const subs = new Map(data.subsystems.map(s => [s.id, s]));
  const deckOf = id => decks().find(d => d.id === id);
  const state = { shown: null, component: null };

  // ---------- what is drawn over the model ----------
  let marks = [];
  const boxMat = new THREE.LineBasicMaterial({ depthTest: false, transparent: true, toneMapped: false });
  const fillMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.16, depthTest: false, depthWrite: false, toneMapped: false });
  const unit = new THREE.BoxGeometry(1, 1, 1), unitEdges = new THREE.EdgesGeometry(unit);

  function clearMarks() {
    for (const m of marks) { m.parent && m.parent.remove(m); if (m.userData.own) m.geometry.dispose(); }
    marks = [];
  }
  function boxOf(c, grow = 0.012) {
    const b = new THREE.Box3(new THREE.Vector3(...c.box[0]), new THREE.Vector3(...c.box[1]));
    return b.expandByScalar(grow);
  }
  function markComponent(c, strong = false) {
    const deck = c.box && deckOf(c.part || 'bridge');
    if (!deck) return null;
    const b = boxOf(c), size = b.getSize(new THREE.Vector3()), mid = b.getCenter(new THREE.Vector3());
    const edges = new THREE.LineSegments(unitEdges, boxMat);
    edges.scale.copy(size); edges.position.copy(mid); edges.renderOrder = 13;
    deck.node.add(edges); marks.push(edges);
    if (strong) {
      const fill = new THREE.Mesh(unit, fillMat);
      fill.scale.copy(size); fill.position.copy(mid); fill.renderOrder = 12;
      deck.node.add(fill); marks.push(fill);
    }
    return b.clone().translate(deck.node.position);
  }
  /** Runs of cable or pipe: every length once, as a thin square bar that is seen through whatever stands before it. */
  function markRuns(paths, colour, radius = 0.012) {
    const deck = deckOf('bridge');
    if (!deck || !paths.length) return;
    const seen = new Set(), pos = [], idx = [];
    const A = new THREE.Vector3(), B = new THREE.Vector3(), D = new THREE.Vector3(), U = new THREE.Vector3(), V = new THREE.Vector3();
    for (const path of paths) for (let i = 0; i + 1 < path.length; i++) {
      const a = path[i], b = path[i + 1];
      const key = [a, b].map(p => p.map(v => v.toFixed(2)).join(',')).sort().join('|');
      if (seen.has(key)) continue;
      seen.add(key);
      A.fromArray(a); B.fromArray(b); D.subVectors(B, A);
      if (D.lengthSq() < 1e-8) continue;
      D.normalize();
      U.set(0, 1, 0); if (Math.abs(D.y) > 0.9) U.set(1, 0, 0);
      V.crossVectors(D, U).normalize(); U.crossVectors(V, D).normalize();
      // carried a little past each end, so that a corner is closed
      A.addScaledVector(D, -radius); B.addScaledVector(D, radius);
      const base = pos.length / 3;
      for (const end of [A, B]) for (const [su, sv] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) pos.push(end.x + (U.x * su + V.x * sv) * radius, end.y + (U.y * su + V.y * sv) * radius, end.z + (U.z * su + V.z * sv) * radius);
      for (let k = 0; k < 4; k++) { const n = (k + 1) % 4; idx.push(base + k, base + n, base + 4 + n, base + k, base + 4 + n, base + 4 + k); }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
    const mesh = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: colour, depthTest: false, depthWrite: false, transparent: true, opacity: 0.92, toneMapped: false, side: THREE.DoubleSide }));
    mesh.renderOrder = 11; mesh.userData.own = true;
    deck.node.add(mesh); marks.push(mesh);
  }
  function tint() { const c = accent(); boxMat.color.copy(c); fillMat.color.copy(c); redraw(); }

  // ---------- words ----------
  const circuitOf = (bid, no) => { const b = boards.get(bid); return b ? b.circuits.find(k => String(k.no) === String(no)) : data.outside.find(k => k.board === bid && String(k.no) === String(no)); };
  const boardName = bid => boards.get(bid)?.name || data.elsewhere.find(b => b.id === bid)?.name || bid;
  const volts = bid => { const b = boards.get(bid) || data.elsewhere.find(x => x.id === bid); return b ? `${b.volts} V${b.kind === 'DC' ? ' DC' : ''}` : ''; };
  const circuitLine = k => `${kW(k.watts)}${k.standbyWatts ? ` (${kW(k.standbyWatts)} on standby)` : ''} · ${k.amps} A · ${k.breaker} A breaker · ${k.cable} · ${k.length} m · ${k.total ?? k.drop} % drop`;
  const way = (bid, no) => typeof no === 'number' ? `${bid} way ${no}` : `${bid}, its own feeder`;
  const link = (text, kind, id) => { const b = el('button', { type: 'button', className: 'link' }, text); b.addEventListener('click', () => go(kind, id)); return b; };

  // ---------- one component: the card ----------
  function showComponent(id, { fly = true, keep = false } = {}) {
    const c = comps.get(id);
    if (!c) return hideCard();
    state.component = id;
    if (!keep) { clearMarks(); state.shown = null; syncList(); }
    const box = markComponent(c, true);
    if (box && fly && !walking()) {
      const size = box.getSize(new THREE.Vector3());
      flyTo(box.getCenter(new THREE.Vector3()), eyeDir(), Math.max(size.length() * 2.6, 1.6), 420);
    }
    const sub = subs.get(c.sys);
    const rows = el('dl');
    const add = (k, ...v) => rows.append(el('dt', {}, k), el('dd', {}, ...v));
    if (c.by) {
      const k = circuitOf(c.by[0], c.by[1]);
      add('Supply', `${kW(c.w)} at ${volts(c.by[0])}, from `, link(way(c.by[0], c.by[1]), 'circuit', `${c.by[0]}:${c.by[1]}`),
        k ? ` (${k.name}): ${k.breaker} A breaker, ${k.cable}, ${k.length} m, ${k.total ?? k.drop} % voltage drop${k.total !== undefined ? ' from the switchboard' : ''}.` : '.');
      if (c.alt) add('Second supply', link(way(c.alt[0], c.alt[1]), 'circuit', `${c.alt[0]}:${c.alt[1]}`), ` (${boardName(c.alt[0])}).`);
    } else if (boards.has(boardIdOf(c.id))) {
      const b = boards.get(boardIdOf(c.id));
      add('Board', link(`${b.id}, ${b.circuits.length} ways`, 'board', b.id), ` · ${kW(b.load.connected)} connected.`);
    }
    if (c.nets.length) {
      const dd = [];
      for (const nid of c.nets) {
        const n = nets.get(nid), me = n.members.find(m => m.id === c.id);
        dd.push(el('span', { className: 'chip' }, link(n.name, 'net', nid), me && me.role !== 'node' ? ` ${me.role}` : '', me && me.says ? `: ${me.says}` : ''));
      }
      add('Nets', ...dd);
    }
    if (c.pipes.length) add('Pipes', ...c.pipes.map(pid => el('span', { className: 'chip' }, link(pipes.get(pid).name, 'pipe', pid))));
    const where = [c.id, sub ? sub.name : c.sys, c.roomName].join(' · ');
    const close = el('button', { type: 'button', className: 'close', title: 'Close' }, '×');
    close.setAttribute('aria-label', 'Close');
    close.addEventListener('click', () => { hideCard(); if (!state.shown) clearMarks(); redraw(); });
    card.replaceChildren(...[close, el('p', { className: 'tag' }, where), el('h3', {}, c.name), el('p', {}, c.what),
      c.hid ? el('p', { className: 'muted' }, `Not seen: ${c.hid}.`) : null, rows.childNodes.length ? rows : null,
      c.note ? el('p', { className: 'muted' }, c.note) : null,
      c.w ? el('p', { className: 'muted small' }, c.basis === 'town' ? "The power figure is the Minato Maru's planning figure." : 'The power figure is typical for equipment of the kind, not a maker\'s.') : null].filter(Boolean));
    card.hidden = false;
    readout.textContent = `${c.name} · ${c.id}`;
    redraw(); onChange && onChange();
    return c;
  }
  const boardIdOf = compId => data.boards.find(b => b.comp === compId)?.id;
  function hideCard() { card.hidden = true; card.replaceChildren(); state.component = null; onChange && onChange(); }

  // ---------- a board, a circuit, a net, a pipe, a subsystem ----------
  function gather(kind, id) {
    if (kind === 'board') {
      const b = boards.get(id); if (!b) return null;
      const members = new Set([b.comp]), paths = [];
      if (b.feeder) paths.push(b.feeder.path);
      for (const k of b.circuits) { for (const c of [...k.consumers, ...k.standby]) members.add(c); paths.push(...Object.values(k.paths)); if (k.feeds) members.add(boards.get(k.feeds).comp); }
      return { title: `${b.id} · ${b.name}`, members: [...members], paths, ink: INK.power };
    }
    if (kind === 'circuit') {
      const [bid, no] = id.split(':'), k = circuitOf(bid, isNaN(no) ? no : Number(no)); if (!k) return null;
      const members = new Set([...k.consumers, ...k.standby]);
      if (boards.has(bid)) members.add(boards.get(bid).comp);
      if (k.feeds) members.add(boards.get(k.feeds).comp);
      return { title: `${way(bid, k.no)} · ${k.name}`, members: [...members], paths: Object.values(k.paths), ink: INK.power };
    }
    if (kind === 'net') { const n = nets.get(id); return n && { title: n.name, members: n.members.filter(m => m.id).map(m => m.id), paths: n.paths, ink: INK.net }; }
    if (kind === 'pipe') { const p = pipes.get(id); return p && { title: `${p.name} · DN ${p.dn}`, members: p.ends.filter(e => e.id).map(e => e.id), paths: [p.path], ink: INK.pipe, radius: Math.max(p.dn / 2000, 0.014) }; }
    if (kind === 'sub') { const s = subs.get(id); return s && { title: s.name, members: data.components.filter(c => c.sys === id && c.pick).map(c => c.id), paths: [], ink: INK.net }; }
    return null;
  }
  function show(kind, id, { fly = true } = {}) {
    if (state.shown && state.shown.kind === kind && state.shown.id === id) { clear(); return null; }
    const got = gather(kind, id);
    if (!got) return null;
    clearMarks();
    state.shown = { kind, id };
    const all = new THREE.Box3();
    for (const cid of got.members) { const c = comps.get(cid), b = c && markComponent(c); if (b) all.union(b); }
    markRuns(got.paths, got.ink, got.radius);
    if (state.component && comps.get(state.component)) markComponent(comps.get(state.component), true);
    if (fly && !walking() && !all.isEmpty()) {
      const size = all.getSize(new THREE.Vector3());
      flyTo(all.getCenter(new THREE.Vector3()), eyeDir(), Math.max(size.length() * 1.5, 4), 520);
    }
    readout.textContent = got.title;
    syncList(true); redraw(); onChange && onChange();
    return got;
  }
  function clear() {
    clearMarks(); state.shown = null; hideCard(); readout.textContent = ''; syncList(); redraw();
  }

  // ---------- which component is at a point of the model ----------
  const P = new THREE.Vector3(), S = new THREE.Vector3();
  function pick(deckId, point) {
    let best = null, least = Infinity;
    for (const c of data.components) {
      if (!c.pick || !c.box || (c.part || 'bridge') !== deckId) continue;
      if (!boxOf(c, 0.02).containsPoint(P.copy(point))) continue;
      // the smallest of those that hold the point: a knob wins over the panel it stands on, the panel over the console
      boxOf(c, 0).getSize(S);
      const v = S.x * S.y * S.z;
      if (v < least) { best = c; least = v; }
    }
    return best;
  }

  // ---------- the list ----------
  const noteFor = {
    board(b) {
      const n = el('div', { className: 'note' }, el('p', {}, b.text));
      if (b.feeder) n.append(el('p', { className: 'muted' }, `Fed from the ${b.fedBy.name.toLowerCase()} (${b.fedBy.where.toLowerCase()}): ${b.feeder.amps} A, ${b.feeder.breaker} A breaker, ${b.feeder.cable}, ${b.feeder.length} m, ${b.feeder.drop} % drop.`));
      else n.append(el('p', { className: 'muted' }, `Fed from ${way(b.fedBy.board, b.fedBy.circuit)}${b.alt ? `, with ${way(b.alt.board, b.alt.circuit)} as its second supply` : ''}.`));
      n.append(el('p', { className: 'muted' }, `${kW(b.load.connected)} connected, about ${kW(b.load.sea)} at sea.`));
      const ways = el('ul', { className: 'ways' });
      for (const k of b.circuits) {
        const btn = el('button', { type: 'button', className: 'pick way' }, el('span', {}, `${k.no}  ${k.name}`), el('small', { className: 'muted' }, circuitLine(k)));
        btn.dataset.kind = 'circuit'; btn.dataset.id = `${b.id}:${k.no}`;
        btn.addEventListener('click', () => show('circuit', `${b.id}:${k.no}`));
        ways.append(el('li', {}, btn));
      }
      n.append(ways);
      return n;
    },
    net(net) {
      const n = el('div', { className: 'note' });
      if (net.text) n.append(el('p', {}, net.text));
      const ul = el('ul', { className: 'members' });
      for (const m of net.members) {
        const what = [m.role !== 'node' ? m.role : '', m.says].filter(Boolean).join(': ');
        ul.append(el('li', {}, m.id ? link(comps.get(m.id).name, 'comp', m.id) : el('span', { className: 'muted' }, `${m.place}: ${m.ext}`), what ? el('small', { className: 'muted' }, ` ${what}`) : null));
      }
      n.append(ul);
      return n;
    },
    pipe(p) {
      const n = el('div', { className: 'note' }, el('p', {}, p.text),
        el('p', { className: 'muted' }, `${p.system} · DN ${p.dn} · ${p.material} · ${p.medium} · ${p.length} m on the bridge.`));
      const ul = el('ul', { className: 'members' });
      for (const e of p.ends) ul.append(el('li', {}, e.id ? link(comps.get(e.id).name, 'comp', e.id) : el('span', { className: 'muted' }, `${e.place}: ${e.ext}`)));
      n.append(ul);
      return n;
    },
    sub(s) {
      const n = el('div', { className: 'note' }, el('p', {}, s.text));
      const ul = el('ul', { className: 'members' });
      for (const c of data.components) if (c.sys === s.id) ul.append(el('li', {}, link(c.name, 'comp', c.id), el('small', { className: 'muted' }, ` ${c.id}${c.w ? ` · ${kW(c.w)}` : ''}`)));
      n.append(ul);
      return n;
    },
  };
  function row(kind, item, name, sub) {
    const b = el('button', { type: 'button', className: 'pick' }, el('span', {}, name), sub ? el('small', { className: 'muted' }, sub) : null);
    b.dataset.kind = kind; b.dataset.id = item.id;
    b.setAttribute('aria-expanded', 'false');
    b.addEventListener('click', () => show(kind, item.id));
    return el('li', {}, b);
  }
  function build() {
    const s = data.supply;
    list.replaceChildren(
      el('p', { className: 'lede' }, `Her main supply is ${s.main.label}, from two generators of 100 kW; lighting and small power are ${s.small.label}; navigation, control and the radio run on ${s.dc.label} from two battery banks. A 32 kW emergency generator takes over what must not go dark.`),
      el('p', { className: 'muted lede' }, 'Registered so far: the navigation bridge. Choose a board, a net or a pipe to see what is on it and how it runs; tap any fitting in the model to see what it is.'));
    const group = (title, items, open = false) => {
      const ul = el('ul'); ul.append(...items);
      const d = el('details', { className: 'sys' }, el('summary', {}, title), ul); d.open = open;
      list.append(d);
    };
    group('Sources', data.sources.map(x => el('li', { className: 'plain' }, el('span', {}, x.name), el('small', { className: 'muted' }, `${x.rating} · ${x.where}${x.built === false ? ' · not yet built' : ''}`))));
    group(`Boards and circuits (${data.boards.length})`, data.boards.map(b => row('board', b, `${b.id}  ${b.name}`, `${b.volts} V${b.kind === 'DC' ? ' DC' : ''} · ${b.circuits.length} ways · ${kW(b.load.connected)}`)), true);
    group(`Nets (${data.nets.length})`, data.nets.map(n => row('net', n, n.name, n.medium)));
    group(`Pipes (${data.pipes.length})`, data.pipes.map(p => row('pipe', p, p.name, `${p.system} · DN ${p.dn}`)));
    group(`Equipment (${data.components.length})`, data.subsystems.map(x => row('sub', x, x.name, `${x.count}`)));
    list.append(el('p', { className: 'source' }, 'The register as tables: ',
      ...['components', 'circuits', 'nets', 'pipes'].flatMap((t, i) => [i ? ', ' : '', el('a', { href: `./systems/out/bridge-${t}.csv` }, t)]),
      '. ', data.rules.text, ' Powers are typical figures; none of this is class-approved.'));
  }
  /** The list says what is shown: the chosen row is marked and its note stands under it. */
  function syncList(scroll = false) {
    for (const b of list.querySelectorAll('.pick.on')) { b.classList.remove('on'); b.setAttribute('aria-expanded', 'false'); }
    const sh = state.shown;
    // a circuit's row lives in its board's note: keep that note while one of its ways is shown
    const keepBoard = sh && sh.kind === 'circuit' ? sh.id.split(':')[0] : null;
    for (const n of list.querySelectorAll('.note')) if (!(keepBoard && n.dataset.board === keepBoard)) n.remove();
    if (!sh) return;
    const open = (kind, id) => {
      const btn = list.querySelector(`.pick[data-kind="${kind}"][data-id="${CSS.escape(id)}"]`);
      if (!btn) return null;
      btn.classList.add('on'); btn.setAttribute('aria-expanded', 'true');
      btn.closest('details').open = true;
      return btn;
    };
    if (sh.kind === 'circuit') {
      const bid = sh.id.split(':')[0], bbtn = open('board', bid);
      if (bbtn && !list.querySelector(`.note[data-board="${bid}"]`)) { const note = noteFor.board(boards.get(bid)); note.dataset.board = bid; bbtn.after(note); }
      const w = open('circuit', sh.id);
      if (w && scroll) w.scrollIntoView({ block: 'nearest' });
      return;
    }
    if (sh.kind === 'comp') return;
    const btn = open(sh.kind, sh.id);
    if (!btn) return;
    const item = { board: boards, net: nets, pipe: pipes, sub: subs }[sh.kind].get(sh.id);
    const note = noteFor[sh.kind](item);
    if (sh.kind === 'board') note.dataset.board = sh.id;
    btn.after(note);
    if (scroll) btn.scrollIntoView({ block: 'nearest' });
  }
  /** A link in a card or a note: to a component, or to a board, circuit, net, pipe or subsystem. */
  function go(kind, id, opts) { return kind === 'comp' ? showComponent(id, { keep: true, ...opts }) : show(kind, id, opts); }
  build(); tint();
  return { data, state, comps, pick, show: go, showComponent, clear, hideCard, tint };
}
