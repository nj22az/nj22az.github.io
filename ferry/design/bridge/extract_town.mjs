// Reads the Town's bridge-deck data and writes town-bridge.json, the snapshot the register and the drawings are made from.
//   node ferry/design/bridge/extract_town.mjs [path to the Town checkout]
// The Town is a separate repository (nj22az/johansson-town); this file is the only thing here that needs it. The
// snapshot records which commit it was taken at, so the drawings can say what they were drawn from.
import fs from 'node:fs';
import path from 'node:path';
import {execSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const TOWN = path.resolve(process.argv[2] || process.env.TOWN || '/home/user/nj22az/johansson-town');
const here = path.dirname(fileURLToPath(import.meta.url));
const load = f => import(path.join(TOWN, 'src/world', f));
const {FERRY_INTERIOR: I} = await load('ferry-interior.js');
const {FERRY_GA, FERRY_HEIGHTS: H, FERRY_LOADS} = await load('ferry-ship.js');
const {FERRY_FEEDERS, FERRY_BOARDS, FERRY_SOURCES} = await load('ferry-electrical.js');
const {FERRY_PIPING} = await load('ferry-piping.js');
const {yardOf, deckOf, spaceOf, auditFerry} = await import(path.join(TOWN, 'tools/ferry-audit.mjs'));

const commit = execSync('git rev-parse --short HEAD', {cwd: TOWN}).toString().trim();
const dirty = execSync('git status --porcelain', {cwd: TOWN}).toString().trim() !== '';
const r3 = v => +v.toFixed(3);

// Rooms on the bridge deck (floor 11.0 m above the keel, deckhead 13.4 m) and the compass deck above them.
const ROOMS = new Set(['eg-room', 'co2-room', 'crew-cabin', 'mate-cabin', 'deckhand-cabin', 'crew-wc', 'mess', 'galley',
  'chief-cabin', 'master-cabin', 'corridor', 'wheelhouse', 'wing-p', 'wing-s']);
const rooms = FERRY_GA.filter(s => ROOMS.has(s.id)).map(s => ({id: s.id, name: s.name, x: s.x, y: s.y, z: s.z,
  what: s.what || null, why: s.why || null, exits: s.exits || []}));

// Where each name is written in ferry-interior.js (bridge-deck block), so a piece can be traced to its line.
const srcLines = fs.readFileSync(path.join(TOWN, 'src/world/ferry-interior.js'), 'utf8').split('\n');
const linesOf = name => srcLines.map((t, i) => [i + 1, t]).filter(([n, t]) => n >= 560 && n <= 740 && t.includes(`name:'${name}'`)).map(([n]) => n);

const pieces = [];
const add = (o, type) => {
  const c = o.lo.map((v, k) => (v + o.hi[k]) / 2), y = yardOf(c);
  if (deckOf(y.h) !== 'bridge') return;
  pieces.push({type, name: o.name || null, space: spaceOf(c), solid: !!o.solid, hex: o.hex ?? null,
    lo: o.lo.map(r3), hi: o.hi.map(r3), lines: o.name ? linesOf(o.name) : []});
};
for (const b of I.boxes) {
  if (!b.draw) continue;
  add({name: b.name, lo: b.a.map((v, k) => Math.min(v, b.b[k])), hi: b.a.map((v, k) => Math.max(v, b.b[k])), solid: b.solid, hex: b.hex}, 'box');
}
for (const c of I.cyls) {
  const r = Math.max(c.rt, c.rb), h = c.h;
  add({name: c.name, lo: c.pos.map((v, k) => v - (k === 1 ? h / 2 : r)), hi: c.pos.map((v, k) => v + (k === 1 ? h / 2 : r)), hex: c.hex}, 'cyl');
}
const inB = y => y >= 9.0 && y <= 11.6;
const glass = I.glass.filter(g => inB(g.pos[1])).map(g => ({size: g.size.map(r3), pos: g.pos.map(r3)}));
const plates = I.plates.filter(p => inB(p.pos[1])).map(p => ({name: p.name, kind: p.kind, pos: p.pos.map(r3), w: p.w, h: p.h, lines: p.lines}));
const floors = I.floors.filter(f => inB(Math.max(...[].concat(f.y)))).map(f => ({id: f.id, x: f.x, z: f.z, y: f.y}));

// Electrical: everything whose consumer, board or source stands on the bridge deck or the compass deck above it.
const E_ROOMS = new Set([...ROOMS, 'compass-deck']);
const loads = FERRY_LOADS.filter(l => E_ROOMS.has(l.where));
const feeders = FERRY_FEEDERS.filter(f => E_ROOMS.has(f.where)).map(f => ({id: f.id, name: f.name, tag: f.tag, board: f.board, boardTag: f.boardTag,
  where: f.where, volts: f.volts, phases: f.phases, kW: f.kW, amps: f.amps, starter: f.starter, breaker: f.breaker, cable: f.cable,
  rating: f.rating, length: f.length, drop: f.drop, route: f.route, number: f.number}));
const boards = [...FERRY_BOARDS, ...FERRY_SOURCES].filter(b => E_ROOMS.has(b.where)).map(b => ({id: b.id, tag: b.tag, name: b.name, where: b.where, fedBy: b.fedBy || null, to: b.to || null}));

// Piping: the nodes in bridge rooms (and the bridge hydrant), the lines that touch them, and what is drawn of them.
const nodeRoom = {hBridge: 'wing-p'};
const pnodes = [], plines = [];
for (const s of FERRY_PIPING) {
  const ids = new Set();
  for (const n of s.nodes) if (E_ROOMS.has(n.where) || n.id === 'hBridge' || (s.id === 'freshwater' && n.id === 'toilets') || (s.id === 'sewage' && n.id === 'flush')) {
    ids.add(n.id); pnodes.push({system: s.id, medium: s.medium, id: n.id, kind: n.kind, tag: n.tag, where: n.where, label: n.label});
  }
  for (const l of s.lines) if (ids.has(l.from) || ids.has(l.to)) plines.push({system: s.id, from: l.from, to: l.to, dn: l.dn, note: l.note || null});
}
const pipesDrawnOnBridge = [...I.pipes, ...I.engineeringPipes].filter(p => (p.points || (p.terminals || []).map(t => t.pos)).some(q => q[1] >= 9.0)).length;
const routeIssues = I.pipeRouteIssues.filter(p => plines.some(l => p.lineId.startsWith(`${l.system}/${l.from}>${l.to}`)))
  .map(p => ({line: p.lineId, status: p.status, reason: p.reason, missing: p.missing || null}));

// The Town's own audit (clash, floating, into-structure, part-clash), the findings on the bridge deck as it stands now.
const audit = (await auditFerry({})).findings.filter(f => f.deck === 'bridge' || ['wheelhouse', 'wing-p', 'wing-s'].includes(f.space))
  .map(f => ({n: f.n, kind: f.kind, severity: f.severity, what: f.what, space: f.space, at: f.at, pieces: f.pieces || []}));

const out = {source: {repository: 'nj22az/johansson-town', commit, uncommitted: dirty, note: 'axes: x to port, y up from the laden waterline (deck floor 9.1), z forward from amidships; yard = z + 17.25, height above keel = y + 1.9'},
  heights: H, rooms, pieces, glass, plates, floors, loads, feeders, boards, pipingNodes: pnodes, pipingLines: plines, pipesDrawnOnBridge, routeIssues, audit};
fs.writeFileSync(path.join(here, 'town-bridge.json'), JSON.stringify(out, null, 1) + '\n');
console.log(`rooms ${rooms.length}, pieces ${pieces.length} (${pieces.filter(p => p.name).length} named), glass ${glass.length}, plates ${plates.length}, loads ${loads.length}, feeders ${feeders.length}, boards ${boards.length}, pipe nodes ${pnodes.length}, lines ${plines.length}, pipes drawn on the bridge ${pipesDrawnOnBridge}, route issues ${routeIssues.length}, audit findings ${audit.length}; Town ${commit}${dirty ? '+' : ''}`);
