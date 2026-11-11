// Quick travel on foot reaches every deck and every room, and from each one can walk.
//
//   node ferry/checks/travel.cjs          (the site served on port 8765: python3 -m http.server 8765)
//
// The owner, 11 November 2026: "In the free walk add quick travel to the decks", and: "I want to explore every deck and
// every room". Every entry of the list in the bar is chosen: it must put the walker on that deck, or in that room, and
// from there a walk in each of four directions must get somewhere (0.3 m or more in at least one). What cannot be stood
// in, or cannot be left, is listed: those are the rooms still to be made walkable.
const { chromium } = require('playwright');
const fails = [];
const check = (ok, text) => { console.log((ok ? 'ok    ' : 'FAIL  ') + text); if (!ok) fails.push(text); };
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  await page.goto('http://localhost:8765/ferry/?t=' + Date.now());
  await page.waitForFunction(() => window.__ferry && document.body.classList.contains('ready'), null, { timeout: 120000 });
  const out = await page.evaluate(() => {
    const f = window.__ferry;
    f.enterWalk();
    const spaces = f.spaces, rows = [];
    for (const t of f.travels) {
      const [kind, deck, room] = t.value.split(':');
      const went = f.travelTo(t.value);
      const w = f.state.walk;
      const row = { name: t.name, kind, deck, went, where: f.whereOnFoot(), reach: 0 };
      if (went) {
        const sp = spaces.find(s => s.deck === deck && s.id === room);
        row.inside = !sp || sp.stand ? true : (w.x >= sp.min[0] - 0.3 && w.x <= sp.max[0] + 0.3 && w.z >= sp.min[2] - 0.3 && w.z <= sp.max[2] + 0.3 && w.y >= sp.min[1] - 0.7 && w.y <= sp.max[1] + 0.2);
        const at = { x: w.x, z: w.z, y: w.y };
        for (const yaw of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
          f.walkTo(at.x, at.z, yaw, 0, at.y);
          f.hold('KeyW', true); for (let k = 0; k < 15; k++) { f.workAuto(0.1); f.walkFor(0.1); } f.hold('KeyW', false);
          const v = f.state.walk;
          row.reach = Math.max(row.reach, Math.hypot(v.x - at.x, v.z - at.z));
        }
      }
      rows.push(row);
    }
    return rows;
  });
  const decks = out.filter(r => r.kind === 'deck'), rooms = out.filter(r => r.kind === 'room');
  check(decks.length >= 5 && decks.every(r => r.went), `quick travel lists ${decks.length} decks and reaches each (${decks.map(r => r.name.split(',')[0]).join(', ')})`);
  const nowhere = rooms.filter(r => !r.went), outside = rooms.filter(r => r.went && !r.inside), stuck = rooms.filter(r => r.went && r.reach < 0.3);
  check(nowhere.length === 0, `each of the ${rooms.length} rooms can be stood in (${nowhere.length ? 'not: ' + nowhere.map(r => r.name).join('; ') : 'all'})`);
  check(outside.length === 0, `quick travel puts one inside the room it names (${outside.length ? 'not: ' + outside.map(r => `${r.name} (stood at ${r.where})`).join('; ') : 'all'})`);
  check(stuck.length === 0, `from where one is put, one can walk (${stuck.length ? 'not: ' + stuck.map(r => `${r.name} (${r.reach.toFixed(2)} m)`).join('; ') : 'all'})`);
  check(errors.length === 0, `no errors in the console (${errors.slice(0, 3).join(' | ') || 'none'})`);
  await browser.close();
  console.log(fails.length ? `\n${fails.length} FAILED` : '\nall passed');
  process.exit(fails.length ? 1 : 0);
})();
