var ad = [
    {
      id: `tea`,
      name: `Sencha tins`,
      short: `Tea`,
      zone: `drinks`,
      color: 4029038,
      accent: 13349001,
    },
    {
      id: `coffee`,
      name: `Canned coffee`,
      short: `Coffee`,
      zone: `drinks`,
      color: 6044206,
      accent: 14070330,
    },
    {
      id: `onigiri`,
      name: `Rice balls`,
      short: `Onigiri`,
      zone: `dry`,
      color: 16051171,
      accent: 2762274,
    },
    {
      id: `biscuits`,
      name: `Sakura biscuits`,
      short: `Biscuits`,
      zone: `dry`,
      color: 13933491,
      accent: 16051171,
    },
    {
      id: `soap`,
      name: `Camellia soap`,
      short: `Soap`,
      zone: `sundries`,
      color: 15194572,
      accent: 12023952,
    },
    {
      id: `notebooks`,
      name: `Pocket notebooks`,
      short: `Notebooks`,
      zone: `paper`,
      color: 4020858,
      accent: 16051171,
    },
    {
      id: `postcards`,
      name: `Harbour postcards`,
      short: `Postcards`,
      zone: `paper`,
      color: 14070330,
      accent: 4029038,
    },
    {
      id: `batteries`,
      name: `AA batteries`,
      short: `Batteries`,
      zone: `sundries`,
      color: 14070330,
      accent: 2762274,
    },
  ],
  od = {
    dry: { label: `Dry goods`, color: 12886122 },
    drinks: { label: `Drinks`, color: 4029038 },
    sundries: { label: `Sundries`, color: 12023952 },
    paper: { label: `Stationery`, color: 4020858 },
  },
  sd = 1.5,
  cd = 2.92;
function ld(e, t, n = 15) {
  return t * n + e;
}
function ud(e) {
  let t = e >>> 0;
  return () => {
    t = (t + 1831565813) >>> 0;
    let e = t;
    return (
      (e = Math.imul(e ^ (e >>> 15), e | 1)),
      (e ^= e + Math.imul(e ^ (e >>> 7), e | 61)),
      ((e ^ (e >>> 14)) >>> 0) / 4294967296
    );
  };
}
function dd(e, t, n, r) {
  for (let i = r.r; i < r.r + r.h; i++)
    for (let a = r.c; a < r.c + r.w; a++)
      a > 0 && i > 0 && a < t - 1 && i < n - 1 && (e[ld(a, i, t)] = 0);
}
function fd(e, t, n, r, i, a, o, s) {
  let c = (r, i, a) => {
      let o = Math.min(r, i),
        s = Math.max(r, i);
      for (let r = o; r <= s; r++)
        r > 0 && a > 0 && r < t - 1 && a < n - 1 && (e[ld(r, a, t)] = 0);
    },
    l = (r, i, a) => {
      let o = Math.min(r, i),
        s = Math.max(r, i);
      for (let r = o; r <= s; r++)
        a > 0 && r > 0 && a < t - 1 && r < n - 1 && (e[ld(a, r, t)] = 0);
    };
  s ? (c(r, a, i), l(i, o, a)) : (l(i, o, r), c(r, a, o));
}
function pd(e) {
  return {
    c: e.c + Math.floor((e.w - 1) / 2),
    r: e.r + Math.floor((e.h - 1) / 2),
  };
}
function md(e, t, n, r) {
  let i = new Set(),
    a = [r];
  for (i.add(`${r.c},${r.r}`); a.length; ) {
    let r = a.pop();
    for (let [o, s] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      let c = r.c + o,
        l = r.r + s;
      if (c < 0 || l < 0 || c >= t || l >= n || e[ld(c, l, t)] !== 0) continue;
      let u = `${c},${l}`;
      i.has(u) || (i.add(u), a.push({ c, r: l }));
    }
  }
  return i;
}

const HARBOUR_GUESTS = [
  { id: 'reiko', name: 'Reiko', accent: 0xc45c78, lines: [
    'Oh — Thuan’s back room! It smells like tea and cardboard.',
    'Don’t mind me. I’m only admiring the biscuit aisle.',
    'Tell Sakura the harbour says hello.',
  ]},
  { id: 'kenji', name: 'Kenji', accent: 0x3a6f8a, lines: [
    'Need a hand with a carton? I’ve got workshop gloves.',
    'Thuan runs a neat stockroom. Neater than my bench.',
    'I’ll stay off your list. Promise.',
  ]},
  { id: 'aya', name: 'Aya', accent: 0xd4a06a, lines: [
    'I ducked in for quiet. The street is chatty today.',
    'Those notebooks look soft. Soft for paper, I mean.',
    'Go on — I’ll wave when you pass with the tea.',
  ]},
  { id: 'nao', name: 'Nao', accent: 0x6b8f71, lines: [
    'Izakaya tip: never stack soy over the pink curtain.',
    'Thuan would notice. She notices everything.',
    'I’m only browsing. Not stealing the onigiri. Mostly.',
  ]},
];

/** Place one guest off every shortest restock path (~1/3 of seeds). Guests yield (no collision). */
function placeHarbourGuest(maze, random) {
  if (random() > 0.36) return null;
  const critical = new Set();
  const mark = path => { for (const p of path) critical.add(`${p.c},${p.r}`); };
  mark(storageRoute(maze, maze.start, maze.exit));
  for (const item of maze.items) {
    if (!item.needed) continue;
    mark(storageRoute(maze, maze.start, item));
    mark(storageRoute(maze, item, maze.exit));
  }
  const candidates = [];
  for (let r = 1; r < maze.rows - 1; r++) for (let c = 1; c < maze.cols - 1; c++) {
    if (maze.cells[r * maze.cols + c] !== 0) continue;
    const key = `${c},${r}`;
    if (critical.has(key)) continue;
    if (maze.items.some(item => item.c === c && item.r === r)) continue;
    const nearShelf = [[1,0],[-1,0],[0,1],[0,-1]].some(([dc, dr]) => {
      const rr = r + dr, cc = c + dc;
      return rr >= 0 && cc >= 0 && rr < maze.rows && cc < maze.cols && maze.cells[rr * maze.cols + cc] === 2;
    });
    if (nearShelf) candidates.push({ c, r });
  }
  if (!candidates.length) return null;
  const spot = candidates[Math.floor(random() * candidates.length)];
  const who = HARBOUR_GUESTS[Math.floor(random() * HARBOUR_GUESTS.length)];
  return { c: spot.c, r: spot.r, id: who.id, name: who.name, accent: who.accent, lines: who.lines.slice() };
}

// A warehouse footprint with a receiving bay, dispatch bay and four stock
// departments. Shelf banks change orientation and position with the daily seed;
// the central spine and cross-aisles remain clear in every layout.
function hd(seed = 1988, required = 6) {
  const random = ud(seed);
  const cols = 21, rows = 21;
  const cells = Array(cols * rows).fill(0);
  const put = (c, r, value) => { cells[r * cols + c] = value; };
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (!c || !r || c === cols - 1 || r === rows - 1) put(c, r, 1);
  }
  const shuffle = list => {
    const result = [...list];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  const rooms = [
    { name: 'Receiving', zone: 'bay', c: 1, r: 1, w: 7, h: 4, color: 14070330 },
    { name: 'Shop dispatch', zone: 'shop', c: 13, r: 1, w: 7, h: 4, color: 13933491 },
  ];
  const zones = shuffle(Object.keys(od));
  const shelves = [];
  [[1,7], [12,7], [1,14], [12,14]].forEach(([c,r], index) => {
    const zone = zones[index];
    const room = { name: od[zone].label, zone, c, r, w: 8, h: 6, color: od[zone].color };
    rooms.push(room);
    const vertical = random() > 0.5;
    const offset = random() > 0.5 ? 1 : 2;
    for (let bank = 0; bank < 2; bank++) {
      const shelf = vertical
        ? { c: c + 1 + bank * 4, r: r + offset, w: 1, h: 3, zone }
        : { c: c + offset, r: r + 1 + bank * 3, w: 4, h: 1, zone };
      shelves.push(shelf);
      for (let y = shelf.r; y < shelf.r + shelf.h; y++)
        for (let x = shelf.c; x < shelf.c + shelf.w; x++) put(x, y, 2);
    }
  });
  for (const c of [2,4,6]) put(c,1,3); // Receiving pallets have solid footprints.
  const start = { c: 4, r: 3 }, exit = { c: 16, r: 2 };
  const reachable = md(cells, cols, rows, start);
  const needed = new Set(shuffle(ad).slice(0, Math.max(1, Math.min(ad.length, required))).map(item => item.id));
  const used = new Set([`${start.c},${start.r}`, `${exit.c},${exit.r}`]);
  const items = shuffle(ad).map(def => {
    const room = rooms.find(room => room.zone === def.zone);
    const candidates = [];
    for (let r = room.r; r < room.r + room.h; r++) for (let c = room.c; c < room.c + room.w; c++) {
      const key = `${c},${r}`;
      if (cells[r*cols+c] !== 0 || used.has(key) || !reachable.has(key)) continue;
      if ([[1,0],[-1,0],[0,1],[0,-1]].some(([dc,dr]) => cells[(r+dr)*cols+c+dc] === 2)) candidates.push({c,r});
    }
    const position = shuffle(candidates)[0];
    if (!position) throw Error('No reachable picking bay for ' + def.id);
    used.add(`${position.c},${position.r}`);
    return { ...position, id: def.id, def, needed: needed.has(def.id) };
  });
  const guest = placeHarbourGuest({ cols, rows, cells, rooms, shelves, start, exit, items, seed }, random);
  return { cols, rows, cells, rooms, shelves, start, exit, items, seed, guest };

}

// Breadth-first routing is shared by automatic restocking and regression tests.
function storageRoute(maze, start, target) {
  const key = p => `${p.c},${p.r}`;
  const queue = [start], parent = new Map([[key(start), null]]);
  for (let i = 0; i < queue.length; i++) {
    const current = queue[i];
    if (key(current) === key(target)) {
      const route = [];
      for (let p = current; p; p = parent.get(key(p))) route.push(p);
      return route.reverse();
    }
    for (const [dc,dr] of [[0,1],[1,0],[0,-1],[-1,0]]) {
      const next = {c: current.c+dc, r: current.r+dr};
      if (yd(next.c,next.r,maze) && !parent.has(key(next))) {
        parent.set(key(next),current); queue.push(next);
      }
    }
  }
  return [];
}
function gd(e, t, n) {
  return { x: (e - (n.cols - 1) / 2) * sd, z: (t - (n.rows - 1) / 2) * sd };
}
function _d(e, t, n) {
  let r = Math.round(e / sd + (n.cols - 1) / 2),
    i = Math.round(t / sd + (n.rows - 1) / 2);
  return {
    c: Math.max(0, Math.min(n.cols - 1, r)),
    r: Math.max(0, Math.min(n.rows - 1, i)),
  };
}
function vd(e, t, n) {
  return (
    e < 0 ||
    t < 0 ||
    e >= n.cols ||
    t >= n.rows ||
    n.cells[ld(e, t, n.cols)] !== 0
  );
}
function yd(e, t, n) {
  return !vd(e, t, n);
}
function bd(e, t, n) {
  return n.rooms.find(
    (n) => e >= n.c && e < n.c + n.w && t >= n.r && t < n.r + n.h,
  );
}
// Test a small sphere along the complete camera boom, including the shoulder.
// Never force the camera beyond the first obstruction in a narrow aisle.
function xd(x, y, z, dx, dy, dz, distance, maze, minimum = 0.3) {
  const length = Math.hypot(dx, dy, dz) || 1;
  for (let travel = 0.08; travel <= distance; travel += 0.06) {
    const px = x + dx / length * travel, pz = z + dz / length * travel;
    if (Ed(px, pz, 0.18, maze).hit || y + dy / length * travel < 0.12)
      return Math.max(0.08, travel - 0.12);
  }
  return distance;
}

// Resolve both coordinates together; discarding the other axis causes corner
// jitter. Substeps also keep sprinting safe after slow frames.
function moveStoragePlayer(x, z, dx, dz, maze, radius = Cd) {
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / (radius * 0.45)));
  let hit = false;
  for (let i = 0; i < steps; i++) {
    const next = Ed(x + dx / steps, z + dz / steps, radius, maze);
    x = next.x; z = next.z; hit ||= next.hit;
  }
  return {x, z, hit};
}
function X(e, t, n, r) {
  return e + (t - e) * (1 - Math.exp(-n * r));
}
function Sd(e, t, n) {
  let r = t - e;
  for (; r > Math.PI; ) r -= Math.PI * 2;
  for (; r < -Math.PI; ) r += Math.PI * 2;
  return e + r * n;
}
var Cd = 0.34;
function wd(e, t, n) {
  let r = (e - (n.cols - 1) / 2) * sd,
    i = (t - (n.rows - 1) / 2) * sd,
    a = sd * 0.5;
  return { minX: r - a, maxX: r + a, minZ: i - a, maxZ: i + a };
}
function Td(e, t, n, r) {
  let i = Math.max(r.minX, Math.min(e, r.maxX)),
    a = Math.max(r.minZ, Math.min(t, r.maxZ)),
    o = e - i,
    s = t - a,
    c = o * o + s * s;
  if (c >= n * n) return { x: e, z: t, hit: !1, nx: 0, nz: 0 };
  if (c < 1e-10) {
    let i = e - r.minX,
      a = r.maxX - e,
      o = t - r.minZ,
      s = r.maxZ - t,
      c = Math.min(i, a, o, s);
    return c === i
      ? { x: r.minX - n, z: t, hit: !0, nx: -1, nz: 0 }
      : c === a
        ? { x: r.maxX + n, z: t, hit: !0, nx: 1, nz: 0 }
        : c === o
          ? { x: e, z: r.minZ - n, hit: !0, nx: 0, nz: -1 }
          : { x: e, z: r.maxZ + n, hit: !0, nx: 0, nz: 1 };
  }
  let l = Math.sqrt(c),
    u = o / l,
    d = s / l;
  return { x: i + u * n, z: a + d * n, hit: !0, nx: u, nz: d };
}
function Ed(x, z, radius, maze) {
  let hit = false, nx = 0, nz = 0;
  for (let pass = 0; pass < 3; pass++) {
    let corrected = false;
    const cell = _d(x, z, maze);
    for (let r = cell.r - 1; r <= cell.r + 1; r++) for (let c = cell.c - 1; c <= cell.c + 1; c++) {
      if (!vd(c,r,maze)) continue;
      const result = Td(x,z,radius,wd(c,r,maze));
      x = result.x; z = result.z;
      if (result.hit) { hit = corrected = true; nx += result.nx; nz += result.nz; }
    }
    if (!corrected) break;
  }
  return {x,z,hit,nx,nz};
}
var Dd = new Set([
  `KeyW`,
  `KeyA`,
  `KeyS`,
  `KeyD`,
  `KeyQ`,
  `KeyE`,
  `KeyI`,
  `KeyJ`,
  `KeyK`,
  `KeyL`,
  `ArrowUp`,
  `ArrowDown`,
  `ArrowLeft`,
  `ArrowRight`,
  `ShiftLeft`,
  `ShiftRight`,
  `Space`,
  `KeyR`,
  `KeyM`,
]);
/** Pace scale when facing is not yet aligned with travel (WalkFix). Full forward, zero backward. */
function alignedStep(angle) {
  return Math.max(0, Math.cos(Math.min(Math.abs(angle), Math.PI)));
}
function Od(e, t, n = 0.15) {
  let r = Math.hypot(e, t);
  if (r < n) return { x: 0, y: 0 };
  let i = Math.min(1, (r - n) / (1 - n)) / r;
  return { x: e * i, y: t * i };
}
function kd() {
  let e = new Set(),
    t = null,
    n = {
      moveX: 0,
      moveY: 0,
      lookX: 0,
      lookY: 0,
      lookHoldX: 0,
      lookHoldY: 0,
      sprint: !1,
      moonwalk: !1,
      pause: !1,
    },
    r = 0,
    i = 0,
    a = !1,
    o = 0,
    s = 0,
    c = 0,
    l = { x: 0, y: 0 },
    u = !1,
    sprintPointerId = null,
    moonwalkHeld = !1,
    moonwalkPointerId = null,
    d = null,
    f = [],
    p = (n) => (t ? t.includes(n) : e.has(n)),
    m = (t) => {
      (e.add(t.code), Dd.has(t.code) && t.preventDefault());
    },
    h = (t) => {
      e.delete(t.code);
    },
    clearSprint = () => {
      u = false;
      sprintPointerId = null;
      n.sprint = false;
    },
    clearMoonwalk = () => {
      moonwalkHeld = false;
      moonwalkPointerId = null;
      n.moonwalk = false;
    },
    g = () => {
      e.clear(); t = null; l = {x:0,y:0}; u = false; sprintPointerId = null; moonwalkHeld = false; moonwalkPointerId = null; a = false; c = 0;
      r = i = 0;
      Object.assign(n, {moveX:0,moveY:0,lookX:0,lookY:0,sprint:false,moonwalk:false,pause:false,lookHoldX:0,lookHoldY:0});
    },
    _ = (e) => {
      (e.pointerType !== `mouse` || e.button === 0 || e.button === 2) &&
        ((a = !0),
        (c = 0),
        (o = e.clientX),
        (s = e.clientY),
        e.currentTarget.setPointerCapture?.(e.pointerId),
        e.preventDefault());
    },
    v = (e) => {
      if (document.pointerLockElement === d) {
        ((r += e.movementX), (i += e.movementY));
        return;
      }
      if (!a) return;
      let t = e.clientX - o,
        n = e.clientY - s;
      ((o = e.clientX),
        (s = e.clientY),
        (c += Math.hypot(t, n)),
        (r += t),
        (i += n));
    },
    y = (e) => {
      ((a = !1), e.currentTarget?.releasePointerCapture?.(e.pointerId));
    },
    onSprintPointerEnd = (ev) => {
      if (sprintPointerId != null && ev.pointerId === sprintPointerId) clearSprint();
      if (moonwalkPointerId != null && ev.pointerId === moonwalkPointerId) clearMoonwalk();
    },
    b = (e) => {
      ((d = e),
        window.addEventListener(`keydown`, m),
        window.addEventListener(`keyup`, h),
        window.addEventListener(`blur`, g),
        document.addEventListener(`visibilitychange`, g),
        window.addEventListener(`pointerup`, onSprintPointerEnd),
        window.addEventListener(`pointercancel`, onSprintPointerEnd),
        e.addEventListener(`pointerdown`, _),
        e.addEventListener(`pointermove`, v),
        e.addEventListener(`pointerup`, y),
        e.addEventListener(`pointercancel`, y),
        e.addEventListener(`lostpointercapture`, y),
        f.push(() => {
          (window.removeEventListener(`keydown`, m),
            window.removeEventListener(`keyup`, h),
            window.removeEventListener(`blur`, g),
            document.removeEventListener(`visibilitychange`, g),
            window.removeEventListener(`pointerup`, onSprintPointerEnd),
            window.removeEventListener(`pointercancel`, onSprintPointerEnd),
            e.removeEventListener(`pointerdown`, _),
            e.removeEventListener(`pointermove`, v),
            e.removeEventListener(`pointerup`, y),
            e.removeEventListener(`pointercancel`, y),
            e.removeEventListener(`lostpointercapture`, y));
        }));
    },
    x = () => {
      let e = 0,
        t = 0;
      ((p(`KeyA`) || p(`ArrowLeft`)) && --e,
        (p(`KeyD`) || p(`ArrowRight`)) && (e += 1),
        (p(`KeyW`) || p(`ArrowUp`)) && (t += 1),
        (p(`KeyS`) || p(`ArrowDown`)) && --t,
        (e += l.x),
        (t += l.y));
      let r = 0,
        i = 0;
      ((p(`KeyQ`) || p(`KeyJ`)) && --r,
        (p(`KeyE`) || p(`KeyL`)) && (r += 1),
        p(`KeyI`) && --i,
        p(`KeyK`) && (i += 1));
      let a = navigator.getGamepads?.() ?? [],
        o = !1;
      for (let n of a) {
        if (!n) continue;
        let a = Od(n.axes[0] ?? 0, -(n.axes[1] ?? 0));
        ((e += a.x), (t += a.y));
        let s = Od(n.axes[2] ?? 0, n.axes[3] ?? 0, 0.16);
        ((r += s.x),
          (i += s.y),
          (n.buttons[4]?.pressed ||
            n.buttons[10]?.pressed ||
            n.buttons[7]?.pressed) &&
            (o = !0));
      }
      let s = Math.hypot(e, t);
      (s > 1 && ((e /= s), (t /= s)),
        (n.moveX = e),
        (n.moveY = t),
        (n.lookHoldX = Math.max(-1, Math.min(1, r))),
        (n.lookHoldY = Math.max(-1, Math.min(1, i))),
        // Hold-to-run only: Shift, touch Run button, or gamepad shoulder — never stick magnitude.
        (n.sprint = p(`ShiftLeft`) || p(`ShiftRight`) || u || o),
        // Optional fun moonwalk: hold KeyM or Moonwalk button — never default locomotion.
        (n.moonwalk = p(`KeyM`) || moonwalkHeld));
    };
  return {
    actions: n,
    reset: g,
    clearSprint,
    clearMoonwalk,
    attach: b,
    detach: () => {
      for (let e of f) e();
      ((f.length = 0), e.clear());
    },
    beginLook: () => {
      a = !0;
    },
    endLook: () => {
      a = !1;
    },
    consumeLook: () => {
      x();
      let e = r,
        t = i;
      return ((r = 0), (i = 0), { x: e, y: t });
    },
    setKeys: (n) => {
      ((t = n.length ? n.slice() : null), t || e.clear());
    },
    setTouchMove: (e, t) => {
      l = Od(e, t, 0.08);
    },
    setTouchLook: (e, t) => {
      // Touch look pad: amplify small flicks so the pad feels as quick as a mouse flick.
      ((r += e * 1.15), (i += t * 1.15));
    },
    setTouchSprint: (pressed, pointerId = null) => {
      if (pressed) {
        u = true;
        if (pointerId != null) sprintPointerId = pointerId;
      } else {
        clearSprint();
      }
    },
    setTouchMoonwalk: (pressed, pointerId = null) => {
      if (pressed) {
        moonwalkHeld = true;
        if (pointerId != null) moonwalkPointerId = pointerId;
      } else {
        clearMoonwalk();
      }
    },
    tryPointerLock: (canvas) => {
      if (c > 6 || typeof canvas.requestPointerLock !== 'function' || window.matchMedia?.('(pointer: coarse)').matches) return;
      try {
        const request = canvas.requestPointerLock();
        request?.catch?.(() => {}); // Drag-to-look remains available if denied.
      } catch {} // Safari and embedded browsers may not permit pointer lock.
    },
    isPointerLocked: () => document.pointerLockElement === d,
    has: p,
    dragged: () => c > 6,
  };
}
