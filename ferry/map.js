// The deck plan on foot: her general arrangement as a mimic panel, with a lamp where one stands.
//
// The owner, 12 November 2026: "I miss a mini map sort of so I don't get lost maybe based on the GA". On a ship the plan one
// finds one's way by is a mimic panel: her arrangement engraved on a dark plate, with a lamp for what is so. This is that
// panel, drawn from the arrangement itself (data/plans.json, written by blender/ga.py: what drawing JS1-102 is drawn from)
// and from the model's own stairs, ladders and doorways. Bow to the right and port up, as the drawing has her.
//
//   - the small panel, top right while on foot: the plan of the deck one is on, about 55 m of it round where one stands
//     (the whole of a tier of the house), the room one is in lit, a lamp where one stands and a wedge the way one looks;
//     under it her profile with every deck, the one one is on marked, and its name;
//   - pressed (or the key M), the whole plan of that deck with the rooms' names, and a key for each other deck. A room
//     chosen is named; "Go there" puts one in it (the page's own quick travel).
//
// createMap({ mini, chart, plans, stairs, doorways, ways, half, go }) returns { update, open, close, isOpen, state }.
// `update` is given where the walker is each frame and draws only when that has changed.

const PLATE = '#172024', DECK = '#1f2c31', LINE = '#d5efe9', HERE = '#3fb3a8', LAMP = '#ffc24a';
const ACROSS = 24;                         // metres across her that the small panel's plan shows: her breadth and a little
const el = (tag, props = {}, ...kids) => { const n = Object.assign(document.createElement(tag), props); n.append(...kids); return n; };
const ink = (alpha, colour = LINE) => colour + Math.round(alpha * 255).toString(16).padStart(2, '0');

export function createMap({ mini, chart, plans, stairs = [], doorways = [], ways = [], half, go }) {
  const draft = plans.draft;
  const byDeck = new Map(plans.plans.map(p => [p.deck, p]));
  // The plans from the lowest up, each with the height over the waterline its deck stands at: a height belongs to the
  // highest plan at or under it (a stair's head to the deck it arrives on, a platform in the engine room to the plan below
  // the main deck).
  const levels = [...plans.plans].sort((a, b) => a.level - b.level);
  const planAt = y => { let p = levels[0]; for (const q of levels) if (q.level - draft <= y + 0.6) p = q; return p; };
  const yard = z => z + half;
  const marks = new Map(plans.plans.map(p => [p.id, { stairs: [], ladders: [], doors: [] }]));
  for (const s of stairs) {
    const rect = { a: Math.min(s.foot[0], s.top[0]), b: Math.max(s.foot[0], s.top[0]), x0: Math.min(...s.x), x1: Math.max(...s.x), up: s.top[0] > s.foot[0] ? 1 : -1 };
    for (const p of new Set([planAt(s.foot[1]), planAt(s.top[1])])) marks.get(p.id).stairs.push(rect);
  }
  for (const w of ways) for (const q of [w.a, w.b]) marks.get(planAt(q[1]).id).ladders.push({ yard: yard(q[2]), x: q[0] });
  for (const d of doorways) marks.get(planAt(d.at[1] + 0.1).id).doors.push({ yard: yard(d.at[2]), x: d.at[0], along: Math.abs(d.normal[0]) > 0.5, w: d.width });

  // ---- the two panels
  const small = el('canvas');
  const button = el('button', { type: 'button', id: 'map-mini', title: 'Deck plan (M)' }, small);
  button.setAttribute('aria-haspopup', 'dialog');
  mini.append(button);
  const title = el('h2', { id: 'chart-title' }), level = el('p', { className: 'level' });
  const shut = el('button', { type: 'button', className: 'close', title: 'Close the plan (Esc)', textContent: '×' });
  shut.setAttribute('aria-label', 'Close the plan');
  const keys = el('div', { className: 'decks' });
  keys.setAttribute('role', 'group'); keys.setAttribute('aria-label', 'Decks');
  const big = el('canvas', { tabIndex: 0 });
  big.setAttribute('role', 'img');
  const said = el('p', { className: 'said' }), goBtn = el('button', { type: 'button', className: 'btn', textContent: 'Go there', hidden: true });
  said.setAttribute('aria-live', 'polite');
  const sheet = el('div', { className: 'sheet' }, el('header', {}, title, level, shut), keys, el('div', { className: 'plan' }, big), el('footer', {}, said, goBtn));
  chart.append(sheet);
  chart.setAttribute('role', 'dialog'); chart.setAttribute('aria-modal', 'true'); chart.setAttribute('aria-labelledby', 'chart-title');
  const deckKeys = new Map();
  for (const p of [...levels].reverse()) {
    const k = el('button', { type: 'button', className: 'deck-key', textContent: p.name });
    k.addEventListener('click', () => { shown = p; picked = null; drawBig(); });
    keys.append(k); deckKeys.set(p.id, k);
  }

  // ---- where one is
  let at = null;                      // { x, y, z, yaw, deck, room }: the walker, as the page says
  let drawn = '';                     // what the small panel last drew, to draw again only when it has changed
  let open = false, shown = null, picked = null, frame = null;      // the big plan: is it open, the plan it shows, the room chosen, its place on its canvas
  const here = () => at && (byDeck.get(at.deck) || planAt(at.y));

  const fit = (canvas, w, h) => {
    const r = Math.min(window.devicePixelRatio || 1, 3);
    if (canvas.width !== Math.round(w * r) || canvas.height !== Math.round(h * r)) { canvas.width = Math.round(w * r); canvas.height = Math.round(h * r); canvas.style.height = h + 'px'; }
    const c = canvas.getContext('2d');
    c.setTransform(r, 0, 0, r, 0, 0);
    return c;
  };

  /** A plan drawn on a canvas: `X` and `Y` put metres from the transom and metres to port on it, `k` is pixels to a metre. */
  function drawPlan(c, p, X, Y, k, { names = false, room = null, chosen = null, clip = null, lampAt = null } = {}) {
    const edge = pts => { c.beginPath(); pts.forEach(([y, hb], i) => c[i ? 'lineTo' : 'moveTo'](X(y), Y(hb))); [...pts].reverse().forEach(([y, hb]) => c.lineTo(X(y), Y(-hb))); c.closePath(); };
    c.save();
    if (clip) { c.beginPath(); c.rect(...clip); c.clip(); }
    c.lineJoin = 'round';
    // her side at the upper deck, faintly, round a tier of the house or a deck that is shorter than she is
    if (p.tier || p.id === 'boat') { edge(plans.side); c.setLineDash([3, 3]); c.strokeStyle = ink(0.28); c.lineWidth = 1; c.stroke(); c.setLineDash([]); }
    if (p.edge) { edge(p.edge); c.fillStyle = DECK; c.fill(); }
    const spaces = [...p.spaces].sort((a, b) => (b.yard[1] - b.yard[0]) * (b.x[1] - b.x[0]) - (a.yard[1] - a.yard[0]) * (a.x[1] - a.x[0]));
    const box = s => [X(s.yard[0]), Y(s.x[1]), (s.yard[1] - s.yard[0]) * k, (s.x[1] - s.x[0]) * k];
    c.save();
    if (p.edge) { edge(p.edge); c.clip(); }
    else for (const s of spaces) { c.fillStyle = DECK; c.fillRect(...box(s)); }                 // a tier's deck is what its spaces cover
    for (const s of spaces) {
      if (s.id === room) { c.fillStyle = ink(0.42, HERE); c.fillRect(...box(s)); }
      c.setLineDash(s.level === 'platform' || s.level === 'aft' ? [4, 3] : []);
      c.strokeStyle = ink(s.kind === 'open' || s.kind === 'vehicle' ? 0.3 : 0.62); c.lineWidth = 1;
      c.strokeRect(...box(s));
    }
    c.setLineDash([]);
    if (p.lanes) {
      c.setLineDash([7, 5]); c.strokeStyle = ink(0.22); c.lineWidth = 1;
      for (const x of p.lanes.x) { c.beginPath(); c.moveTo(X(p.lanes.yard[0]), Y(x)); c.lineTo(X(p.lanes.yard[1]), Y(x)); c.stroke(); }
      c.setLineDash([]);
    }
    if (p.helideck) {
      const r = p.helideck.across / 2, e = r * (Math.SQRT2 - 1), y0 = p.helideck.yard;
      c.beginPath();
      [[-r, e], [-e, r], [e, r], [r, e], [r, -e], [e, -r], [-e, -r], [-r, -e]].forEach(([u, v], i) => c[i ? 'lineTo' : 'moveTo'](X(y0 + u), Y(v)));
      c.closePath(); c.strokeStyle = ink(0.62); c.stroke();
      c.beginPath(); c.arc(X(y0), Y(0), 5 * k, 0, Math.PI * 2); c.strokeStyle = ink(0.4); c.stroke();
    }
    const m = marks.get(p.id);
    // a doorway is a gap in the wall it stands in
    c.strokeStyle = DECK; c.lineWidth = 2.5; c.lineCap = 'butt';
    for (const d of m.doors) {
      const w = Math.max(d.w * k, 3) / 2;
      c.beginPath();
      if (d.along) { c.moveTo(X(d.yard) - w, Y(d.x)); c.lineTo(X(d.yard) + w, Y(d.x)); } else { c.moveTo(X(d.yard), Y(d.x) - w); c.lineTo(X(d.yard), Y(d.x) + w); }
      c.stroke();
    }
    // a stair is its treads; a ladder a ring
    for (const s of m.stairs) {
      const x0 = X(s.a), x1 = X(s.b), y0 = Y(s.x1), y1 = Y(s.x0), n = Math.max(2, Math.round((x1 - x0) / Math.max(2.6, 0.28 * k)));
      c.fillStyle = PLATE; c.fillRect(x0, y0, x1 - x0, y1 - y0);
      c.strokeStyle = ink(0.75); c.lineWidth = 1; c.strokeRect(x0, y0, x1 - x0, y1 - y0);
      c.beginPath();
      for (let i = 1; i < n; i++) { const x = x0 + (x1 - x0) * i / n; c.moveTo(x, y0); c.lineTo(x, y1); }
      c.strokeStyle = ink(0.5); c.stroke();
    }
    for (const l of m.ladders) { c.beginPath(); c.arc(X(l.yard), Y(l.x), Math.max(2.2, 0.35 * k), 0, Math.PI * 2); c.fillStyle = PLATE; c.fill(); c.strokeStyle = ink(0.8); c.lineWidth = 1.2; c.stroke(); }
    if (p.bulkheads) {
      c.strokeStyle = ink(0.8); c.lineWidth = 1.6;
      for (const y of p.bulkheads) { c.beginPath(); c.moveTo(X(y), Y(plans.beam / 2)); c.lineTo(X(y), Y(-plans.beam / 2)); c.stroke(); }
    }
    c.restore();
    if (p.edge) { edge(p.edge); c.strokeStyle = LINE; c.lineWidth = 1.4; c.stroke(); }
    const pick = chosen && p.spaces.find(s => s.id === chosen);
    if (pick) { c.strokeStyle = '#ffffff'; c.lineWidth = 2; c.strokeRect(...box(pick)); }
    // the rooms' names, the smallest rooms first: each where it fits inside its room and inside her side, clear of the
    // stairs, of a smaller room that stands in it and of every other name (its middle first, then its thirds)
    if (names) {
      const taken = m.stairs.map(s => [X(s.a), Y(s.x1), X(s.b) - X(s.a), Y(s.x0) - Y(s.x1)]);
      if (lampAt) taken.push([lampAt[0] - 11, lampAt[1] - 11, 22, 22]);                 // nor under the lamp
      const within = s => spaces.filter(o => o !== s && o.yard[0] >= s.yard[0] - 1e-6 && o.yard[1] <= s.yard[1] + 1e-6 && o.x[0] >= s.x[0] - 1e-6 && o.x[1] <= s.x[1] + 1e-6).map(box);
      const side = v => {                                              // half her breadth at this deck's edge, v metres from the transom
        const e = p.edge;
        if (!e) return Infinity;
        if (v <= e[0][0]) return e[0][1];
        for (let i = 1; i < e.length; i++) if (v <= e[i][0]) return e[i - 1][1] + (v - e[i - 1][0]) / (e[i][0] - e[i - 1][0]) * (e[i][1] - e[i - 1][1]);
        return 0;
      };
      const inside = r => [r[0], r[0] + r[2]].every(px => { const hb = side((px - X(0)) / k) - 0.15; return Math.abs((Y(0) - r[1]) / k) <= hb && Math.abs((Y(0) - r[1] - r[3]) / k) <= hb; });
      c.textAlign = 'center'; c.textBaseline = 'middle';
      for (const s of [...spaces].reverse()) {
        const [bx, by, bw, bh] = box(s), inner = within(s);
        let put = null;
        for (const size of [12, 10.5, 9.5]) {
          c.font = `500 ${size}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
          const lines = wrap(c, s.name.replace(/, (port|starboard)$/, ''), bw - 8);
          if (!lines.length || lines.length > 3) continue;
          const lh = size * 1.18, th = lines.length * lh, tw = Math.max(...lines.map(t => c.measureText(t).width));
          if (th > bh - 4 || tw > bw - 6) continue;
          for (const [fu, fv] of [[0.5, 0.5], [0.5, 0.25], [0.5, 0.75], [0.25, 0.5], [0.75, 0.5], [0.25, 0.25], [0.75, 0.25], [0.25, 0.75], [0.75, 0.75]]) {
            const cx = Math.min(Math.max(bx + bw * fu, bx + tw / 2 + 3), bx + bw - tw / 2 - 3), cy = Math.min(Math.max(by + bh * fv, by + th / 2 + 2), by + bh - th / 2 - 2);
            const r = [cx - tw / 2, cy - th / 2, tw, th];
            if (!inside(r) || inner.some(o => overlap(r, o)) || taken.some(t => overlap(r, t))) continue;
            put = { r, lines, lh, size, cx, cy, th };
            break;
          }
          if (put) break;
        }
        if (!put) continue;
        taken.push(put.r);
        c.font = `500 ${put.size}px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
        c.fillStyle = s.id === room ? '#ffffff' : ink(0.86);
        put.lines.forEach((t, i) => c.fillText(t, put.cx, put.cy - put.th / 2 + put.lh * (i + 0.5)));
      }
    }
    c.restore();
  }
  const overlap = (a, b) => a[0] < b[0] + b[2] && b[0] < a[0] + a[2] && a[1] < b[1] + b[3] && b[1] < a[1] + a[3];
  function wrap(c, text, width) {
    const words = text.split(' '), lines = [];
    let line = '';
    for (const w of words) {
      const next = line ? line + ' ' + w : w;
      if (c.measureText(next).width <= width || !line) line = next; else { lines.push(line); line = w; }
    }
    if (line) lines.push(line);
    return lines.every(t => c.measureText(t).width <= width) ? lines : [];
  }
  /** The lamp where one stands, and the wedge the way one looks (the page's yaw: half a turn is looking forward). */
  function lamp(c, x, y, yaw, r = 3.4, reach = 17) {
    const a = Math.atan2(Math.sin(yaw), -Math.cos(yaw));               // on the plan forward is to the right and port is up
    const g = c.createRadialGradient(x, y, 0, x, y, reach);
    g.addColorStop(0, ink(0.5, LAMP)); g.addColorStop(1, ink(0, LAMP));
    c.beginPath(); c.moveTo(x, y); c.arc(x, y, reach, a - 0.5, a + 0.5); c.closePath(); c.fillStyle = g; c.fill();
    c.beginPath(); c.arc(x, y, r + 2.6, 0, Math.PI * 2); c.fillStyle = ink(0.28, LAMP); c.fill();
    c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = LAMP; c.fill();
    c.lineWidth = 1; c.strokeStyle = PLATE; c.stroke();
  }

  // ---- the small panel
  function drawSmall() {
    const p = here();
    if (!p || !small.clientWidth) return;
    const W = small.clientWidth, planH = Math.round(W * 0.44), kp = W / (plans.length + 7), profH = Math.round((plans.profile.mast + 2.2) * kp), gap = 5;
    const c = fit(small, W, planH + gap + profH);
    c.clearRect(0, 0, W, planH + gap + profH);
    // the plan: the whole of a short deck, else as much as fits round where one stands
    const k = planH / ACROSS, span = W / k, [a, b] = p.yard, pad = 2;
    const y0 = b - a + 2 * pad <= span ? (a + b) / 2 - span / 2 : Math.min(Math.max(yard(at.z) - span / 2, a - pad), b + pad - span);
    const X = v => (v - y0) * k, Y = x => planH / 2 - x * k;
    drawPlan(c, p, X, Y, k, { room: at.room, clip: [0, 0, W, planH] });
    lamp(c, X(yard(at.z)), Y(at.x), at.yaw);
    // her profile under it: every deck, the one one is on marked; the stretch the plan shows; the deck's name
    const PX = v => (v + 3.5) * kp, PY = h => planH + gap + profH - 1.5 - h * kp;
    c.beginPath(); plans.profile.hull.forEach(([v, h], i) => c[i ? 'lineTo' : 'moveTo'](PX(v), PY(h))); c.closePath();
    c.fillStyle = DECK; c.fill(); c.strokeStyle = ink(0.7); c.lineWidth = 1; c.stroke();
    for (const blk of plans.profile.blocks) { c.fillStyle = DECK; c.fillRect(PX(blk.yard[0]), PY(blk.h[1]), (blk.yard[1] - blk.yard[0]) * kp, (blk.h[1] - blk.h[0]) * kp); c.strokeRect(PX(blk.yard[0]), PY(blk.h[1]), (blk.yard[1] - blk.yard[0]) * kp, (blk.h[1] - blk.h[0]) * kp); }
    for (const q of levels) {
      c.save();
      if (q.edge && q.id !== 'boat') { c.beginPath(); plans.profile.hull.forEach(([v, h], i) => c[i ? 'lineTo' : 'moveTo'](PX(v), PY(h))); c.closePath(); c.clip(); }   // a deck of her hull ends at her plating
      c.beginPath(); c.moveTo(PX(q.yard[0]), PY(q.level)); c.lineTo(PX(q.yard[1]), PY(q.level));
      c.strokeStyle = q === p ? HERE : ink(0.35); c.lineWidth = q === p ? 2 : 1; c.stroke();
      c.restore();
    }
    c.beginPath(); c.moveTo(PX(y0), PY(-1)); c.lineTo(PX(y0), PY(-2.2)); c.lineTo(PX(y0 + span), PY(-2.2)); c.lineTo(PX(y0 + span), PY(-1));
    if (b - a + 2 * pad > span) { c.strokeStyle = ink(0.55); c.lineWidth = 1; c.stroke(); }
    const lx = PX(yard(at.z)), ly = PY(at.y + draft + 0.9);
    c.beginPath(); c.arc(lx, ly, 4.4, 0, Math.PI * 2); c.fillStyle = ink(0.28, LAMP); c.fill();
    c.beginPath(); c.arc(lx, ly, 2.4, 0, Math.PI * 2); c.fillStyle = LAMP; c.fill();
    c.font = '600 11.5px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'; c.textAlign = 'left'; c.textBaseline = 'top'; c.fillStyle = LINE;
    c.fillText(p.name, 2, planH + gap + 1);
  }

  // ---- the whole plan
  function drawBig() {
    if (!open || !shown) return;
    const p = shown, on = here(), holder = big.parentElement;
    const W = holder.clientWidth, [a, b] = p.yard, pad = 2.5, across = (p.tier || p.id === 'boat' ? Math.max(...p.spaces.map(s => Math.max(Math.abs(s.x[0]), Math.abs(s.x[1])))) : plans.beam / 2) * 2 + 3;
    const maxH = Math.max(150, Math.min(window.innerHeight * 0.58, 560));
    // As much of her as fits; where that would leave a long deck too small to read or to press (a phone), she is drawn
    // 8 pixels to a metre and the plan is moved along under the finger, beginning where one stands.
    const whole = Math.min((W - 8) / (b - a + 2 * pad), maxH / across), k = whole < 4.5 ? Math.min(8, maxH / across) : whole;
    const H = Math.round(across * k), wide = Math.max(W, Math.round((b - a + 2 * pad) * k));
    big.style.width = wide + 'px';
    const c = fit(big, wide, H);
    c.clearRect(0, 0, wide, H);
    const x0 = (wide - (b - a) * k) / 2;
    const X = v => x0 + (v - a) * k, Y = x => H / 2 - x * k;
    if (!frame || frame.p !== p) holder.scrollLeft = wide > W ? X(on === p ? yard(at.z) : (a + b) / 2) - W / 2 : 0;
    frame = { p, X, Y, k, a, x0, H };
    drawPlan(c, p, X, Y, k, { names: true, room: on === p ? at.room : null, chosen: picked, lampAt: on === p ? [X(yard(at.z)), Y(at.x)] : null });
    if (on === p) lamp(c, X(yard(at.z)), Y(at.x), at.yaw, 4.2, 24);
    title.textContent = p.name;
    level.textContent = `${p.level} m above the keel. Bow to the right, port up.`;
    for (const [id, key] of deckKeys) { key.setAttribute('aria-pressed', String(id === p.id)); key.classList.toggle('here', !!on && id === on.id); }
    if (keys.scrollWidth > keys.clientWidth) { const key = deckKeys.get(p.id); keys.scrollLeft = key.offsetLeft - keys.offsetLeft - (keys.clientWidth - key.offsetWidth) / 2; }
    const room = picked && p.spaces.find(s => s.id === picked), mine = on === p && room && room.id === at.room;
    const stand = on && on.spaces.find(s => s.id === at.room);
    said.textContent = room ? (mine ? `${room.name}. You are here.` : room.name)
      : `You are ${stand ? 'in: ' + stand.name : 'on the ' + (on ? on.name.toLowerCase() : 'ship')}. Choose a room to go there.`;
    goBtn.hidden = !room || mine;
    big.setAttribute('aria-label', `${p.name}: its plan, with ${p.spaces.length} rooms`);
  }
  const spaceAt = (p, yd, x) => p.spaces.filter(s => yd >= s.yard[0] && yd <= s.yard[1] && x >= s.x[0] && x <= s.x[1])
    .sort((s, t) => (s.yard[1] - s.yard[0]) * (s.x[1] - s.x[0]) - (t.yard[1] - t.yard[0]) * (t.x[1] - t.x[0]))[0] || null;
  big.addEventListener('click', e => {
    if (!frame) return;
    const r = big.getBoundingClientRect(), s = spaceAt(frame.p, frame.a + (e.clientX - r.left - frame.x0) / frame.k, (frame.H / 2 - (e.clientY - r.top)) / frame.k);
    const again = s && s.id === picked;
    picked = s ? s.id : null;
    drawBig();
    if (again && !goBtn.hidden) goBtn.click();                       // a second press on the room chosen goes there
  });
  goBtn.addEventListener('click', () => {
    if (!shown || !picked) return;
    const answer = go(shown.deck, picked);
    if (answer === true) setOpen(false); else { said.textContent = answer || 'There is nowhere to stand there yet.'; goBtn.hidden = true; }
  });
  shut.addEventListener('click', () => setOpen(false));
  chart.addEventListener('pointerdown', e => { if (e.target === chart) setOpen(false); });
  button.addEventListener('click', () => setOpen(true));
  addEventListener('resize', () => { drawn = ''; if (at) drawSmall(); drawBig(); });

  function setOpen(on) {
    if (on === open || (on && !at)) return;
    open = on;
    chart.hidden = !on;
    button.setAttribute('aria-expanded', String(on));
    if (on) { shown = here(); picked = null; drawBig(); shut.focus(); } else { frame = null; button.focus({ preventScroll: true }); button.blur(); }
  }

  return {
    /** Where the walker is: { x, y, z, yaw, deck, room } in the model's own measures, the deck and the room by their ids. */
    update(where) {
      at = where;
      const key = `${where.deck}|${where.room}|${where.x.toFixed(2)}|${where.z.toFixed(2)}|${where.y.toFixed(1)}|${where.yaw.toFixed(2)}|${small.clientWidth}`;
      if (key === drawn) return;
      drawn = key;
      drawSmall();
      const p = here(), room = p && p.spaces.find(s => s.id === where.room);
      button.setAttribute('aria-label', `Deck plan. You are on the ${p ? p.name.toLowerCase() : 'ship'}${room ? ', in: ' + room.name : ''}. Open the plan.`);
      if (open) drawBig();
    },
    open: () => setOpen(true),
    close: () => setOpen(false),
    isOpen: () => open,
    /** For checks: what the panels show. */
    get state() {
      const p = here();
      return { plan: p ? p.id : null, deck: p ? p.deck : null, room: at ? at.room : null, yard: at ? yard(at.z) : null, x: at ? at.x : null, open, shown: shown ? shown.id : null, picked,
               size: [small.clientWidth, small.clientHeight], frame: frame && { a: frame.a, x0: frame.x0, k: frame.k, H: frame.H } };
    },
  };
}
