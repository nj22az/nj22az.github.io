// Maintenance Desk for a vessel: the same program, given a ship's own list of everything aboard.
//
// Opened as `./?vessel=chisum` it keeps a workspace of its own (the workshop's is untouched) and fills it from the list
// the ship's build writes (`/ferry/data/equipment.json`, made by ferry/systems/equipment.py). The owner, 12 November 2026:
// "This could be used for the maintenance system onboard , if it needs enhancing add that"; "Which has all parts and
// equipment onboard". Design record: ferry/yard/design/maintenance-computer.md.
//
// The first half is plain functions (tests/vessel.test.mjs); `initVesselUI` at the end is the only part that touches a page.
// Its look is vessel.css; its icons are drawn by icons/draw_icons.py.

import { SHIP_ICONS, KIND_ICONS } from './ship-icons.mjs?v=2026.11.12.1';

export const VESSELS = {
  chisum: {
    id: 'chisum', name: 'M/V Chisum', key: 'johansson-maintenance-vessel-chisum-v1', list: '/ferry/data/equipment.json', ship: '/ferry/',
    company: 'Johansson Line', site: 'M/V Chisum', coordinator: 'Chief Engineer', desk: 'Chief engineer’s computer',
    program: 'Maintenance Desk', maker: 'Johansson Co',
  },
};

/**
 * The vessel a page is opened for. The program opens on the Chisum: the owner, 12 November 2026, "We don't need the demo data ,
 * we have chisums data , and that is what we will use on the web app too". The workshop it was first written for is still
 * there for whoever kept records in it, under `?workshop`, and is offered nowhere.
 */
export function vesselFor(search) {
  const q = new URLSearchParams(search || '');
  if (q.has('workshop')) return null;
  const id = q.get('vessel');
  return id && Object.hasOwn(VESSELS, id) ? VESSELS[id] : VESSELS.chisum;
}

// ---- Jobs. Nothing aboard has a maker's manual: these are a yard's usual routines by kind of thing, and say so. Where a thing
// has its own instruction the jobs are that instruction's (the stern ramp's power pack: JS3-304-M1, section 12).
export const BASIS = {
  yard: 'The yard’s own routine for this kind of equipment: no maker’s manual exists aboard. Adapt the interval and the checklist before use.',
  statutory: 'A statutory routine, as recalled and not read (SOLAS chapter III, regulation 20, and the life-saving and fire codes). Check it against the ship’s own flag and class requirements before use.',
  instruction: 'From the ship’s own operating instruction JS3-304-M1, section 12 (Looking after it): a yard’s usual routine for a pack of this kind, not a maker’s schedule.',
};
const job = (title, interval, unit, checklist, basis = 'yard', priority = 'Normal') => ({ title, interval, unit, checklist, basis, priority });

const BY_ID = {
  'HYD-01': [
    job('Power pack: weekly round', 7, 'days', ['The three gauges read 0 with the pumps stopped', 'The pressure filter’s and the return filter’s indicators', 'The cooler’s matrix is clear of dust', 'The level glass stands at FILL with the ramp raised; the drip tray is dry'], 'instruction'),
    job('Power pack: monthly greasing and trials', 1, 'months', ['Grease the six hinges and the cleats’ bolts', 'Work the hand pump a few strokes', 'Try the emergency stop: both pumps trip and the ramp is held'], 'instruction'),
    job('Power pack: oil sample and filter elements', 12, 'months', ['Take a sample of the oil (ISO VG 46, HVLP) for analysis', 'Renew the pressure filter’s element', 'Renew the return filter’s element', 'Record the oil’s hours and the level after topping up'], 'instruction'),
  ],
};
const BY_KIND = {
  'Lifeboat and davits': [
    job('Lifeboat: weekly visual inspection', 7, 'days', ['Boat, davits, falls and gripes ready for immediate use', 'Hooks closed and reset; no visible damage', 'Run the boat’s engine ahead and astern where fitted'], 'statutory', 'High'),
    job('Lifeboat: monthly inspection', 1, 'months', ['Inspect boat, davits and winch against the checklist', 'Check the inventory of the boat’s equipment', 'Turn the boat out from its stowed position where conditions allow', 'Record the inspection in the log'], 'statutory', 'High'),
    job('Davits and winch: annual thorough examination', 12, 'months', ['Thorough examination of davits, winch, falls and release gear', 'Operational test of the release gear', 'Dynamic test of the winch brake'], 'statutory', 'High'),
    job('Davits and winch: five-yearly overload test', 5, 'years', ['Overload operational test of the release gear', 'Dynamic winch brake test with the proof load', 'Renew or turn the falls end for end as due'], 'statutory', 'High'),
  ],
  'Liferaft': [
    job('Liferaft: monthly visual inspection', 1, 'months', ['Container, lashing and cradle sound', 'Hydrostatic release unit in date and correctly rigged', 'Painter made fast to the weak link'], 'statutory', 'High'),
    job('Liferaft: annual service ashore', 12, 'months', ['Land the raft to an approved service station', 'Record the certificate and the next service date', 'Renew the hydrostatic release unit when it is due'], 'statutory', 'High'),
  ],
  'Anchor windlass and mooring winch': [
    job('Windlass: monthly greasing and oil level', 1, 'months', ['Grease the bearings, the clutch and the brake spindle', 'Check the gear case’s oil level', 'Check the hydraulic motor and its pipes for leaks'], 'yard'),
    job('Windlass: brake and clutch inspection', 6, 'months', ['Measure the brake lining’s thickness; inspect the band and its anchor', 'Work the dog clutch in and out under no load', 'Inspect the cable lifter’s snugs for wear'], 'yard'),
    job('Windlass: annual brake holding test', 12, 'months', ['Test the band brake’s holding capacity by the approved method', 'Inspect the holding-down bolts and the bedplate’s seating', 'Record the result and the lining thickness'], 'yard'),
  ],
  'Mooring winch': [
    job('Mooring winch: monthly greasing and oil level', 1, 'months', ['Grease the drum’s bearings and the brake spindle', 'Check the gear case’s oil level', 'Check the hydraulic motor, valve and pipes for leaks'], 'yard'),
    job('Mooring winch: brake inspection', 6, 'months', ['Measure the brake lining’s thickness; inspect the band', 'Inspect the rope on the drum for chafe and broken strands', 'Inspect the holding-down bolts'], 'yard'),
    job('Mooring winch: annual brake holding test', 12, 'months', ['Test the brake’s rendering load by the approved method', 'Record the setting and the result'], 'yard'),
  ],
  'Capstan': [
    job('Capstan: greasing and trial', 3, 'months', ['Grease the barrel’s bearing and the pawls', 'Run it both ways; check the control lever returns to stop', 'Check the deck flanges and pipes for leaks'], 'yard'),
  ],
  'Chain stopper': [job('Chain stopper: inspect and grease', 3, 'months', ['Grease the roller’s axle and the bar’s hinge pin', 'The locking bar drops across a flat link and its pin is on its chain', 'Inspect the cheeks and the seat for cracks'], 'yard')],
  'Roller fairlead': [job('Roller fairlead: grease and turn the rollers', 3, 'months', ['Grease each roller’s pin by its nipple', 'Each roller turns freely by hand', 'Inspect the rollers for grooving and the frame for cracks'], 'yard')],
  'Panama chock': [job('Chock: annual inspection', 12, 'months', ['Inspect the lips for grooving and cracks', 'Inspect the welds to the bulwark and its doubler', 'Touch up the coating'], 'yard')],
  'Bitts': [job('Bitts: annual inspection', 12, 'months', ['Inspect the posts, the head plates and the foot brackets for cracks and wastage', 'Inspect the bedplate’s weld to the deck', 'Touch up the coating and the yellow banding'], 'yard')],
  'Rope reel': [job('Mooring rope and reel: inspection', 3, 'months', ['Inspect the rope for chafe, cuts and hardened lengths', 'Turn the rope end for end when due', 'Grease the reel’s axle; check its brake pin'], 'yard')],
  'Mushroom ventilator': [job('Ventilator: work the closing device', 3, 'months', ['Close and open the head by its handwheel', 'Grease the spindle', 'Inspect the gasket, the screen and the coaming'], 'yard')],
  'Gooseneck ventilator': [job('Ventilator: work the closing device', 3, 'months', ['Close and open the flap', 'Inspect the gasket, the screen and the coaming'], 'yard')],
  'Air pipe': [job('Air pipe head: annual inspection', 12, 'months', ['Open the head: the float or ball moves freely and seats', 'Inspect the screen and the pipe at the deck for wastage', 'Check the tank’s name on the plate'], 'yard')],
  'Foam monitor': [
    job('Foam monitor: monthly function check', 1, 'months', ['Train and elevate through its full arc', 'Grease the swivel joints', 'The valve opens and shuts'], 'statutory', 'High'),
    job('Foam monitor: annual test with water', 12, 'months', ['Flow test through the monitor', 'Inspect the nozzle and the pipe', 'Record the result'], 'statutory', 'High'),
  ],
  'Lashing pots': [job('Lashing pots: clear and inspect', 6, 'months', ['Clear each pot of water and dirt', 'Inspect the crossbars for wear and cracks', 'Mark and report any pot not to be used'], 'yard')],
  'Floodlight': [job('Floodlight: function check', 3, 'months', ['Switch on; the lamp lights', 'Clean the glass; inspect the gasket and the gland', 'The bracket is tight and aimed'], 'yard')],
};
const BY_SYSTEM = {
  RMP: [
    job('Stern ramp gear: monthly inspection', 1, 'months', ['Inspect for damage, leaks and loose fastenings', 'Hoses and their fittings: no chafe, no weeping', 'Report any defect before the ramp is next worked'], 'yard'),
  ],
  HYD: [job('Hydraulic component: quarterly inspection', 3, 'months', ['Inspect for leaks at every joint', 'Clamps and supports tight', 'Record gauge readings where it has a gauge'], 'yard')],
  NAV: [job('Navigation equipment: monthly function check', 1, 'months', ['Switch on and run its self-test where it has one', 'Compare its reading with an independent one', 'Record defects in the bridge’s defect book'], 'yard')],
  STR: [job('Steering: function test', 1, 'months', ['Test from every steering position', 'Rudder angle shown agrees with the order', 'Alarms of the steering gear sound and show'], 'statutory', 'High')],
  PRP: [job('Propulsion control: function test', 1, 'months', ['Test control from the bridge and from each wing', 'Transfer of control between stations', 'Emergency stops and their lamps'], 'yard', 'High')],
  COM: [job('Radio equipment: monthly test', 1, 'months', ['Test call on each set by its own routine', 'Battery condition and charger', 'Float-free and portable sets in date', 'Enter the test in the radio log'], 'statutory', 'High')],
  INT: [job('Internal communication: monthly test', 1, 'months', ['Call every station and be answered', 'Public address and general alarm heard in every space', 'Record stations that failed'], 'statutory')],
  ALM: [job('Alarm and monitoring: monthly test', 1, 'months', ['Lamp and buzzer test', 'Trip one alarm of each group and see it on the bridge', 'The watch alarm runs through its stages'], 'yard')],
  FIR: [job('Fire appliance: monthly inspection', 1, 'months', ['In place, unobstructed, seal and pin intact', 'Pressure or contents within its mark', 'Record the inspection on its tag'], 'statutory', 'High'), job('Fire appliance: annual service', 12, 'months', ['Service by a competent person', 'Record the certificate and the next due date'], 'statutory', 'High')],
  NLT: [job('Navigation light: function test', 1, 'months', ['Lights from the panel; the panel’s failure alarm works', 'Lens clean, gasket and gland sound', 'Spare lamps aboard'], 'statutory', 'High')],
  LGT: [job('Lighting: quarterly function check', 3, 'months', ['Every fitting lights', 'Emergency fittings light with the main supply off', 'Diffusers and gaskets sound'], 'yard')],
  ELD: [job('Distribution board: annual inspection', 12, 'months', ['Isolate by the approved procedure before opening', 'Terminals tight; no sign of heat', 'Insulation resistance of each outgoing way', 'Breakers trip by their test buttons'], 'yard')],
  EMG: [job('Emergency power: weekly test run', 7, 'days', ['Start the set and run it', 'Starting battery voltage and charger', 'Fuel in the day tank; no leaks'], 'statutory', 'High'), job('Emergency power: monthly test on load', 1, 'months', ['Run on load through the emergency switchboard', 'Automatic start on loss of the main supply', 'Record hours, voltages and frequency'], 'statutory', 'High')],
  LSA: [job('Life-saving appliance: monthly inspection', 1, 'months', ['In place and ready for use', 'In date; seals and markings sound', 'Record the inspection in the log'], 'statutory', 'High')],
  HVC: [job('Ventilation and air conditioning: quarterly service', 3, 'months', ['Clean or renew the filters', 'Condensate drains clear', 'Fan runs quietly; dampers move'], 'yard')],
  ADM: [job('Maintenance computer: monthly copy of the records', 1, 'months', ['Export a backup of the programme (Settings: Export backup)', 'Keep the copy off the computer', 'Screen, keyboard and cables sound; the vents of the unit clear of dust'], 'yard')],
  PIP: [job('Piping and valves: annual inspection', 12, 'months', ['Work every valve through its travel', 'Inspect for leaks and wastage', 'Labels in place'], 'yard')],
};
/** No routine is planned for what is not installed or is furniture: it is listed, and says why it has no job. */
const NO_JOBS = { GEN: 'Not installed: a marked place only.', OUT: 'Furniture and fittings: inspected with their room.', DKO: 'Deck outfit: inspected with the deck.' };

/** The jobs of one item of the ship's list: its own, else its kind's, else its system's. */
export function jobsFor(item) {
  return BY_ID[item.id] || BY_KIND[item.kind] || BY_SYSTEM[item.system] || [];
}
export const noJobsReason = item => (jobsFor(item).length ? '' : NO_JOBS[item.system] || 'No routine is written for this kind of thing yet.');

const pad = n => String(n).padStart(2, '0');
/** A date so many days, months or years on (as the program's own nextDate does it). */
export function dateAfter(day, n, unit) {
  const a = new Date(day + 'T12:00:00');
  if (unit === 'days') a.setDate(a.getDate() + Number(n));
  else if (unit === 'hours') return '';
  else { const d = a.getDate(); a.setDate(1); a.setMonth(a.getMonth() + Number(n) * (unit === 'years' ? 12 : 1)); a.setDate(Math.min(d, new Date(a.getFullYear(), a.getMonth() + 1, 0).getDate())); }
  return `${a.getFullYear()}-${pad(a.getMonth() + 1)}-${pad(a.getDate())}`;
}

export const assetId = id => 'v-' + id;
/** One item of the ship's list as the program's asset. What the program does not know of (system, deck, room, place, parts) rides along. */
export function assetFrom(item, vessel) {
  const type = item.kind === item.systemName ? item.kind : `${item.kind} · ${item.systemName}`;
  return {
    id: assetId(item.id), tag: item.id, name: item.name, kind: item.kind, type, location: `${item.deckName} · ${item.roomName}`,
    manufacturer: '', model: '', serial: '', year: '', meter: 0, owner: vessel.coordinator, notes: item.what || '',
    vessel: vessel.id, system: item.system, systemName: item.systemName, deck: item.deck, deckName: item.deckName, room: item.room, roomName: item.roomName,
    at: item.at, parts: item.parts || [], source: item.source, noJobs: noJobsReason(item),
  };
}
export function tasksFrom(item, vessel, day) {
  return jobsFor(item).map((j, n) => ({
    id: `vt-${item.id}-${n + 1}`, assetId: assetId(item.id), title: j.title, interval: j.interval, unit: j.unit, due: dateAfter(day, j.interval, j.unit), nextMeter: 0,
    owner: vessel.coordinator, priority: j.priority, instructions: BASIS[j.basis], checklist: j.checklist, basis: j.basis,
  }));
}

// An item's id becomes an asset's id and tag, which the program writes into its pages' handlers: only plain ids are taken.
const PLAIN_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const valid = doc => !!doc && doc.format === 'chisum-equipment-1' && Array.isArray(doc.items)
  && doc.items.every(i => i && typeof i.id === 'string' && PLAIN_ID.test(i.id) && typeof i.name === 'string');
/** A fresh workspace filled from the ship's list. `seed` is the program's own empty workspace. */
export function seedWorkspace(seed, doc, vessel, day) {
  if (!valid(doc)) throw Error('The ship’s equipment list could not be read.');
  const ws = structuredClone(seed);
  ws.settings = { ...ws.settings, company: vessel.company, site: vessel.site, coordinator: vessel.coordinator };
  ws.assets = doc.items.map(i => assetFrom(i, vessel));
  ws.tasks = doc.items.flatMap(i => tasksFrom(i, vessel, day));
  ws.vessel = { id: vessel.id, format: doc.format, items: doc.items.length, filled: day };
  return ws;
}
/**
 * The ship has been built further since the workspace was filled: what is new in her list is added, with its jobs. Nothing that
 * is recorded is touched: no asset is removed or overwritten, no task or history changed. Returns how many were added, and
 * which of the workspace's ship items are no longer in her list (they are kept, and named).
 */
export function mergeEquipment(db, doc, vessel, day) {
  if (!valid(doc)) throw Error('The ship’s equipment list could not be read.');
  const have = new Set(db.assets.map(a => a.id)), listed = new Set(doc.items.map(i => assetId(i.id)));
  const fresh = doc.items.filter(i => !have.has(assetId(i.id)));
  const gone = db.assets.filter(a => a.vessel === vessel.id && !listed.has(a.id)).map(a => a.tag);
  if (!fresh.length) return { added: 0, gone, workspace: null };
  const ws = structuredClone(db);
  ws.assets.push(...fresh.map(i => assetFrom(i, vessel)));
  ws.tasks.push(...fresh.flatMap(i => tasksFrom(i, vessel, day)));
  ws.vessel = { ...(ws.vessel || {}), id: vessel.id, format: doc.format, items: doc.items.length, grown: day };
  return { added: fresh.length, gone, workspace: ws };
}

/** Where an item is, in a seaman's words, from the page's own measures (x to port, metres over the waterline, metres forward of amidships). */
export function placeWords(at, length) {
  if (!Array.isArray(at) || at.length < 3) return '';
  const [x, y, z] = at, side = Math.abs(x) < 0.05 ? 'on the centreline' : `${Math.abs(x).toFixed(1)} m to ${x > 0 ? 'port' : 'starboard'}`;
  return `${(z + length / 2).toFixed(1)} m from the transom, ${side}, ${y.toFixed(1)} m over the waterline`;
}

/** The drawing for an item: its kind's where it has one of its own, else its system's. */
export const iconKey = a => KIND_ICONS[a.kind || String(a.type || '').split(' · ')[0]] || (SHIP_ICONS[a.system] ? a.system : 'ship');
export const shipIcon = key => `<svg class="ui-icon v-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${SHIP_ICONS[key] || SHIP_ICONS.ship}</svg>`;

/** How an item's jobs stand on a day: what is overdue, what is due within 30 days, and when the next is due. */
export function jobState(tasks, day) {
  const dated = tasks.filter(t => t.unit !== 'hours' && t.due).map(t => t.due).sort();
  const left = d => Math.round((new Date(d + 'T12:00:00') - new Date(day + 'T12:00:00')) / 86400000);
  const overdue = dated.filter(d => left(d) < 0).length, soon = dated.filter(d => left(d) >= 0 && left(d) <= 30).length;
  return { jobs: tasks.length, overdue, soon, next: dated.find(d => left(d) >= 0) || '', state: !tasks.length ? 'none' : overdue ? 'overdue' : soon ? 'soon' : 'planned' };
}
/**
 * Whose a thing is aboard. The owner, 12 November 2026: "We should be able to filter by department , deck, engine , galley".
 * The ship's list names her departments and says which each item is of (ferry/systems/equipment.py); a list that names none
 * gives none. It is read from the list each time, not kept in the workspace: a workspace filled before she had departments
 * is narrowed like any other.
 */
export function departmentsOf(doc) {
  const list = (doc && Array.isArray(doc.departments) ? doc.departments : []).filter(d => d && PLAIN_ID.test(d.id) && typeof d.name === 'string')
    .map(d => ({ id: d.id, name: d.name, text: typeof d.text === 'string' ? d.text : '' }));
  const known = new Set(list.map(d => d.id));
  return { list, of: new Map((doc && Array.isArray(doc.items) ? doc.items : []).filter(i => i && known.has(i.department)).map(i => [i.id, i.department])) };
}
/**
 * The register's rows for what is asked: a department, a word to find, a system, a deck. Grouped by system, in the ship's own
 * order. A department comes first: the systems offered are those it has, with its own counts (`scope` is how many items it
 * has); the departments and the decks offered do not shrink with what is asked.
 */
export function registerGroups(db, vessel, { q = '', system = 'all', deck = 'all', department = 'all' } = {}, dep = null) {
  const word = q.trim().toLowerCase();
  const mine = db.assets.filter(a => a.vessel === vessel.id);
  const names = dep ? dep.list : [], of = a => (dep ? dep.of.get(a.tag) : undefined);
  const within = names.some(d => d.id === department) ? mine.filter(a => of(a) === department) : mine;
  const hit = a => (system === 'all' || a.system === system) && (deck === 'all' || a.deck === deck)
    && (!word || [a.name, a.tag, a.type, a.location, a.notes].join(' ').toLowerCase().includes(word));
  const groups = [];
  for (const a of within) {
    if (!hit(a)) continue;
    let g = groups.find(x => x.id === a.system);
    if (!g) groups.push(g = { id: a.system, name: a.systemName, items: [] });
    g.items.push(a);
  }
  const systems = [], decks = [];
  for (const a of within) {
    const s = systems.find(x => x.id === a.system); if (s) s.count++; else systems.push({ id: a.system, name: a.systemName, count: 1 });
  }
  for (const a of mine) if (!decks.some(d => d.id === a.deck)) decks.push({ id: a.deck, name: a.deckName });
  const departments = names.map(d => ({ ...d, count: mine.filter(a => of(a) === d.id).length }));
  return { groups, systems, decks, departments, shown: groups.reduce((n, g) => n + g.items.length, 0), scope: within.length, all: mine.length };
}
/**
 * A paper the program may show: a sheet or a page from the yard's own folders, or from the owner's package for the chief
 * engineer's suite (ferry/blender/assets/ce-suite/), and from nowhere else.
 */
export const paperAllowed = p => !!p && PLAIN_ID.test(p.id) && typeof p.file === 'string' && !p.file.includes('..')
  && /^\/ferry\/(yard\/[A-Za-z0-9._\/-]+|blender\/assets\/ce-suite\/[A-Za-z0-9._-]+)\.(svg|md)$/.test(p.file);

/**
 * An instruction or a calculation of the yard's, written as plain text with marks (# headings, - lists, | tables, **bold**),
 * as a page. Every word is escaped first (`e`); only the marks named here become anything, and a link keeps its words and
 * loses its address: nothing in a paper can take one out of the program.
 */
export function renderInstruction(text, e) {
  const inline = t => e(t).replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>').replace(/\[([^\]]+)\]\((?:[^()]|\([^()]*\))*\)/g, '$1');
  const out = [];
  let para = [], list = null, table = null;
  const flush = () => {
    if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para = []; }
    if (list) { out.push(`<${list.tag}>${list.items.map(i => `<li>${inline(i)}</li>`).join('')}</${list.tag}>`); list = null; }
    if (table) {
      const cells = r => r.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map(c => c.trim());
      const rows = table.filter(r => !/^\s*\|?[\s:|-]+\|?\s*$/.test(r)).map(cells), head = table.length > 1 && /^\s*\|?[\s:|-]+\|?\s*$/.test(table[1]);
      out.push('<div class="tablewrap"><table>' + (head ? `<thead><tr>${rows[0].map(c => `<th scope="col">${inline(c)}</th>`).join('')}</tr></thead>` : '')
        + `<tbody>${rows.slice(head ? 1 : 0).map(r => `<tr>${r.map(c => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
      table = null;
    }
  };
  for (const line of String(text || '').replace(/\r/g, '').split('\n')) {
    const h = /^(#{1,4})\s+(.*)$/.exec(line), li = /^\s*[-*]\s+(.*)$/.exec(line), ol = /^\s*\d+\.\s+(.*)$/.exec(line);
    if (!line.trim()) flush();
    else if (h) { flush(); out.push(`<h${h[1].length + 1}>${inline(h[2])}</h${h[1].length + 1}>`); }
    else if (/^\s*\|/.test(line)) { if (!table) { flush(); table = []; } table.push(line); }
    else if (li || ol) { const tag = li ? 'ul' : 'ol'; if (!list || list.tag !== tag) { flush(); list = { tag, items: [] }; } list.items.push((li || ol)[1]); }
    else if (list && /^\s+\S/.test(line)) list.items[list.items.length - 1] += ' ' + line.trim();
    else { if (list || table) flush(); para.push(line.trim()); }
  }
  flush();
  return out.join('\n');
}
/** The papers of an item, in the ship's own order; and the ship's papers by their number, each with its sheets. */
export const papersOf = (papers, ids) => (ids || []).map(id => papers.find(p => p.id === id)).filter(Boolean);
export function papersByNumber(papers) {
  const groups = [];
  for (const p of papers) { let g = groups.find(x => x.number === p.number); if (!g) groups.push(g = { number: p.number, title: p.title, papers: [] }); g.papers.push(p); }
  return groups;
}

// ---- The page. Everything above is plain; this is the only part that needs a document.
export function initVesselUI(api, vessel) {
  const { e, card, btn, heading, badge, toast, render, pages, asset, today, route, seed } = api;
  const embedded = window.parent !== window;
  const root = document.documentElement;
  root.dataset.vessel = vessel.id;
  if (embedded) root.dataset.embedded = 'true';
  // Whose program it is, and where it is installed.
  const brand = document.querySelector('.app-brand-copy'), mark = document.querySelector('.brandmark');
  if (brand) {
    const strong = document.createElement('strong'), small = document.createElement('small');
    strong.textContent = vessel.program; small.textContent = `A ${vessel.maker} program · ${vessel.name}`;
    brand.replaceChildren(strong, small);
  }
  if (mark) {                                                    // the program's own drawing of a ship, built as nodes: nothing anybody typed goes in
    const svg = new DOMParser().parseFromString(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SHIP_ICONS.ship}</svg>`, 'image/svg+xml').documentElement;
    mark.replaceChildren(document.importNode(svg, true));
  }
  document.title = `${vessel.program} · ${vessel.name} | ${vessel.maker}`;
  let length = 0;
  const longDate = d => d ? new Date(d + 'T12:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
  const WORD = { overdue: 'Overdue', soon: 'Due soon', planned: 'Planned', none: 'No routine' }, CLS = { overdue: 'overdue', soon: 'review', planned: '', none: 'none' };

  window.showOnBoard = tag => {
    const a = asset(assetId(tag));
    if (embedded) window.parent.postMessage({ app: 'maintenance-desk', type: 'show-on-board', id: tag, name: a ? a.name : tag, at: a ? a.at : null }, location.origin);
    else location.href = `${vessel.ship}?show=${encodeURIComponent(tag)}`;
  };

  // ---- The register: everything aboard, by department and by system, close together. (Every word of the ship's list goes through `e`.)
  const reg = { q: '', system: 'all', deck: 'all', department: 'all' };
  let dep = null;                                                // her departments, once her list has been read
  const rowsOf = () => {
    const db = api.getDB(), day = today(), r = registerGroups(db, vessel, reg, dep);
    const body = r.groups.map(g => `<tr class="v-group"><th colspan="4" scope="colgroup"><span>${shipIcon(SHIP_ICONS[g.id] ? g.id : 'ship')}${e(g.name)} <small>${g.items.length}</small></span></th></tr>`
      + g.items.map(a => {
        const st = jobState(db.tasks.filter(t => t.assetId === a.id), day);
        const jobs = st.jobs ? `${st.jobs} ${st.jobs === 1 ? 'job' : 'jobs'}${st.next ? ' · next ' + longDate(st.next) : ''}` : e(a.noJobs || 'No routine');
        return `<tr><td><div class="v-item">${shipIcon(iconKey(a))}<div><a href="#detail/${e(a.id)}">${e(a.name)}</a><small>${e(a.tag)}</small></div></div></td><td class="v-where">${e(a.location)}</td><td>${jobs}</td><td>${badge(CLS[st.state], st.overdue ? `${st.overdue} overdue` : WORD[st.state])}</td></tr>`;
      }).join('')).join('');
    const count = `<p class="v-count" role="status">${r.shown === r.all ? `${r.all} items` : `${r.shown} of ${r.all} items`} · ${r.groups.length} ${r.groups.length === 1 ? 'system' : 'systems'}</p>`;
    return count + (r.shown ? `<table><thead><tr><th scope="col">Item</th><th scope="col">Where</th><th scope="col">Jobs</th><th scope="col">State</th></tr></thead><tbody>${body}</tbody></table>`
      : '<div class="empty"><strong>Nothing aboard matches</strong><p>Try another word, or all departments and systems.</p></div>');
  };
  const deptsOf = () => {
    const r = registerGroups(api.getDB(), vessel, reg, dep);
    if (!r.departments.length) return '';
    return `<button type="button" class="v-chip v-dept" data-department="all" aria-pressed="${reg.department === 'all'}">${shipIcon('ship')}All departments <b>${r.all}</b></button>`
      + r.departments.map(d => `<button type="button" class="v-chip v-dept" data-department="${e(d.id)}" aria-pressed="${reg.department === d.id}" title="${e(d.text)}">${shipIcon(SHIP_ICONS[d.id] ? d.id : 'ship')}${e(d.name)} <b>${d.count}</b></button>`).join('');
  };
  const chipsOf = () => {
    const r = registerGroups(api.getDB(), vessel, reg, dep);
    return `<button type="button" class="v-chip" data-system="all" aria-pressed="${reg.system === 'all'}">${shipIcon('ship')}All systems <b>${r.scope}</b></button>`
      + r.systems.map(s => `<button type="button" class="v-chip" data-system="${e(s.id)}" aria-pressed="${reg.system === s.id}">${shipIcon(SHIP_ICONS[s.id] ? s.id : 'ship')}${e(s.name)} <b>${s.count}</b></button>`).join('');
  };
  pages.assets = () => {
    const db = api.getDB(), r = registerGroups(db, vessel, reg, dep), whole = registerGroups(db, vessel, {}, dep);
    return heading('EQUIPMENT REGISTER', 'Everything aboard', `${e(vessel.name)}: ${whole.all} items in ${whole.systems.length} systems, from the ship’s own lists.`, btn('＋ Add asset', 'assetForm()'))
      + `<section class="card v-register"><div class="v-depts" id="v-depts" role="group" aria-label="Department">${deptsOf()}</div>`
      + `<div class="v-systems" id="v-systems" role="group" aria-label="Systems">${chipsOf()}</div>`
      + `<div class="v-tools"><input id="v-search" type="search" aria-label="Search the register" placeholder="Search name, tag, room or description" value="${e(reg.q)}">`
      + `<select id="v-deck" aria-label="Deck"><option value="all">All decks</option>${r.decks.map(d => `<option value="${e(d.id)}"${reg.deck === d.id ? ' selected' : ''}>${e(d.name)}</option>`).join('')}</select></div>`
      + `<div id="v-results">${rowsOf()}</div></section>`;
  };
  // The program draws its pages as text it has itself escaped (index.html: render); the register's parts are drawn the same way.
  const draw = (sel, html) => { const el = document.querySelector(sel); if (el) el.replaceChildren(document.createRange().createContextualFragment(html)); };
  const app = document.querySelector('#app');
  const again = () => draw('#v-results', rowsOf());
  app.addEventListener('input', ev => { if (ev.target.id === 'v-search') { reg.q = ev.target.value; again(); } });
  app.addEventListener('change', ev => { if (ev.target.id === 'v-deck') { reg.deck = ev.target.value; again(); } });
  app.addEventListener('click', ev => {
    const chip = ev.target.closest && ev.target.closest('.v-chip');
    if (!chip) return;
    if (chip.dataset.department !== undefined) {                 // a department first: a system it does not have is let go
      reg.department = chip.dataset.department;
      if (reg.system !== 'all' && !registerGroups(api.getDB(), vessel, reg, dep).systems.some(s => s.id === reg.system)) reg.system = 'all';
      draw('#v-depts', deptsOf());
    } else reg.system = chip.dataset.system;
    draw('#v-systems', chipsOf());
    again();
  });

  // ---- Its first page. Aboard, nothing in the program leads out to the site (the owner: "we are not going to a website we are
  // still on the chisum"): the workshop's line about StepWise, a tool that is on the site, gives way to the ship's own.
  const overview = pages.overview;
  pages.overview = () => {
    const page = document.createRange().createContextualFragment(overview()), line = page.querySelector('.page-head p');
    if (line && line.querySelector('a[href]:not([href^="#"])')) line.textContent = `${vessel.name}: what is due aboard, from the ship’s own lists.`;
    const box = document.createElement('div');
    box.append(page);
    return box.innerHTML;
  };

  // ---- One item: where it is aboard, before its record; what it is made of, after it.
  const base = pages.detail;
  pages.detail = () => {
    const a = asset(api.getSelected());
    if (!a || a.vessel !== vessel.id) return base();
    const where = length ? placeWords(a.at, length) : '';
    const can = PLAIN_ID.test(a.tag);
    const strip = `<div class="v-strip">${shipIcon(iconKey(a))}<p><b>${e(a.systemName)}</b>${e(a.location)}${where ? ' · ' + e(where) : ''}</p>${can ? btn('Show on board', `showOnBoard('${a.tag}')`, 'primary') : ''}</div>`;
    const parts = a.parts && a.parts.length ? `<ul class="aboard-parts">${a.parts.map(p => `<li>${e(p)}</li>`).join('')}</ul>` : '<p class="aboard-note">Its parts are not listed yet: the ship’s build does not say them for this item.</p>';
    const whose = dep && dep.list.find(d => d.id === dep.of.get(a.tag));
    const rows = [['Tag', a.tag], ['Department', whose ? whose.name : ''], ['System', `${a.systemName} (${a.system})`], ['Deck', a.deckName], ['Room', a.roomName], ['Place', where], ['Listed from', a.source === 'register' ? 'her register of systems' : 'her deck fittings']]
      .filter(([, v]) => v).map(([l, v]) => `<div><label>${l}</label><b>${e(v)}</b></div>`).join('');
    return strip + base() + papersCard(a) + card('Aboard', 'Where it is in the ship, and what it is made of', `<div class="card-body"><div class="kv">${rows}</div><h3 style="margin-top:20px">Parts</h3>${parts}`
      + (a.noJobs ? `<p class="aboard-note">${e(a.noJobs)}</p>` : '') + '</div>');
  };

  // ---- Her papers: the yard's drawings, instructions, calculations and lists, read inside the program.
  // The owner, 12 November 2026: "I want to be able to access drawings and installation instructions in the maintenance desk".
  let papers = [], itemPapers = new Map();
  const texts = new Map();
  const PAPER_ICON = { Drawing: 'DOC', Instruction: 'DOC', Calculation: 'DOC', List: 'DOC' };
  const sheetWord = p => p.kind === 'Drawing' ? `sheet ${p.sheet}` : p.kind === 'Instruction' ? `instruction ${String(p.sheet).replace(/^M/, '')}` : p.kind.toLowerCase();
  const paperRow = p => `<tr><td><div class="v-item">${shipIcon(PAPER_ICON[p.kind])}<div><a href="#document/${e(p.id)}">${e(p.shows)}</a><small>${e(p.number)} · ${e(sheetWord(p))}</small></div></div></td><td>${e(p.title)}</td><td>${badge(p.kind === 'Drawing' ? 'blue' : p.kind === 'Instruction' ? '' : 'none', p.kind)}</td></tr>`;
  if (api.ICONS) api.ICONS.documents = SHIP_ICONS.DOC;
  if (api.nav && !api.nav.some(n => n[0] === 'documents')) api.nav.splice(2, 0, ['documents', '', 'Drawings and instructions']);
  Object.assign(api.NAV_NAMES || {}, { documents: 'Drawings', assets: 'Register' });
  Object.assign(api.titles || {}, { documents: 'Drawings and instructions', document: 'A drawing or an instruction', assets: 'Equipment register' });
  pages.documents = () => {
    const groups = papersByNumber(papers), n = { Drawing: 0, Instruction: 0, Calculation: 0, List: 0 };
    papers.forEach(p => { n[p.kind] = (n[p.kind] || 0) + 1; });
    return heading('DRAWINGS AND INSTRUCTIONS', 'The ship’s papers', `${e(vessel.name)}: ${n.Drawing} drawing sheets, ${n.Instruction} ${n.Instruction === 1 ? 'instruction' : 'instructions'}, ${n.Calculation} calculations and ${n.List} lists, as the yard has them.`)
      + (papers.length ? `<section class="card v-register"><table><thead><tr><th scope="col">Sheet or paper</th><th scope="col">Document</th><th scope="col">Kind</th></tr></thead><tbody>`
        + groups.map(g => `<tr class="v-group"><th colspan="3" scope="colgroup"><span>${e(g.number)} <small>${e(g.title)}</small></span></th></tr>` + g.papers.map(paperRow).join('')).join('') + '</tbody></table></section>'
        + '<p class="aboard-note">A sheet that is not here is not drawn yet: the yard’s document register says what is still to do. No installation instruction is written yet; the electrical sheets (layout and connections) are what there is to install by.</p>'
        : '<div class="empty"><strong>Reading the ship’s papers</strong><p>They come with her list.</p></div>');
  };
  pages.document = () => {
    const p = papers.find(x => x.id === api.getSelected());
    if (!p) return pages.documents();
    const back = `<p><a href="#documents">← All drawings and instructions</a></p>`;
    const head = heading(`${e(p.number)} · ${e(sheetWord(p).toUpperCase())}`, e(p.shows), e(p.title));
    if (p.format === 'svg') {
      return back + head + `<section class="card"><div class="v-zoombar" role="group" aria-label="Size of the sheet">${[1, 2, 3].map(z => `<button type="button" class="v-zoom small" data-zoom="${z}" aria-pressed="${z === 1}">${z === 1 ? 'Whole sheet' : z + ' ×'}</button>`).join('')}</div>`
        + `<div class="v-sheet" id="v-sheet" data-zoom="1" tabindex="0" aria-label="${e(p.shows)}: the sheet; scroll to move over it"><img src="${e(p.file)}" alt="${e(p.number)}, ${e(sheetWord(p))}: ${e(p.shows)}"></div></section>`;
    }
    if (!texts.has(p.id)) {
      texts.set(p.id, null);
      fetch(p.file, { cache: 'no-cache' }).then(r => { if (!r.ok) throw Error(String(r.status)); return r.text(); })
        .then(t => { texts.set(p.id, t); if (api.getSelected() === p.id) draw('#v-paper', renderInstruction(t, e)); })
        .catch(() => { texts.delete(p.id); if (api.getSelected() === p.id) draw('#v-paper', '<p>This paper could not be read.</p>'); });
    }
    return back + head + `<section class="card"><div class="card-body v-paper" id="v-paper">${texts.get(p.id) ? renderInstruction(texts.get(p.id), e) : '<p>Reading…</p>'}</div></section>`;
  };
  app.addEventListener('click', ev => {
    const z = ev.target.closest && ev.target.closest('.v-zoom');
    if (!z) return;
    const sheet = document.querySelector('#v-sheet'); if (sheet) sheet.dataset.zoom = z.dataset.zoom;
    document.querySelectorAll('.v-zoom').forEach(b => b.setAttribute('aria-pressed', String(b === z)));
  });
  const papersCard = a => {
    const mine = papersOf(papers, itemPapers.get(a.tag));
    return card('Drawings and instructions', 'What the yard has drawn and written about it', mine.length
      ? `<div class="v-register"><table><thead><tr><th scope="col">Sheet or paper</th><th scope="col">Document</th><th scope="col">Kind</th></tr></thead><tbody>${mine.map(paperRow).join('')}</tbody></table></div>`
      : '<div class="card-body"><p class="aboard-note">Nothing is drawn or written about this item yet.</p></div>', '<a class="textbtn" href="#documents">All papers →</a>');
  };

  // The ship's page may ask for an item (a fitting's card aboard: "Maintenance"); and Escape, with nothing of the program's
  // open, is the ship's: it goes back to her.
  window.addEventListener('message', ev => {
    if (ev.origin !== location.origin || !ev.data || ev.data.app !== 'chisum' || ev.data.type !== 'open-item') return;
    const id = assetId(String(ev.data.id || ''));
    if (asset(id)) window.go('detail', id); else if (ev.data.id) window.go('assets');
  });
  if (embedded) window.addEventListener('keydown', ev => {
    if (ev.key === 'Escape' && !document.querySelector('dialog[open]')) window.parent.postMessage({ app: 'maintenance-desk', type: 'leave' }, location.origin);
  });

  fetch(vessel.list, { cache: 'no-cache' }).then(r => { if (!r.ok) throw Error(`The ship’s equipment list was not found (${r.status}).`); return r.json(); }).then(doc => {
    length = (doc.ship && doc.ship.length) || 0;
    papers = Array.isArray(doc.documents) ? doc.documents.filter(paperAllowed) : [];
    dep = departmentsOf(doc);
    itemPapers = new Map(doc.items.map(i => [i.id, i.docs || []]));
    const db = api.getDB();
    if (!db.assets.length && !db.vessel) {
      api.replaceWorkspace(seedWorkspace(seed, doc, vessel, today()));
      toast(`${doc.items.length} items of the ${vessel.name} listed, with their jobs.`);
    } else {
      const m = mergeEquipment(db, doc, vessel, today());
      if (m.workspace) { api.replaceWorkspace(m.workspace); toast(`${m.added} items new aboard were added.`); }
    }
    route();
  }).catch(err => { toast(err.message || 'The ship’s equipment list could not be read.'); render(); });
}
