// Reads the shot table out of ../blender/film.py and what the render has produced in public/film, and writes
// src/data.json: for every shot its times, its plates, and for every picture where the cast's crop sits and
// where Jack's head and right hand are.
import fs from 'fs';
const py = fs.readFileSync(new URL('../blender/film.py', import.meta.url), 'utf8');
const man = fs.existsSync('public/film/manifest.json') ? JSON.parse(fs.readFileSync('public/film/manifest.json', 'utf8')) : {shots: {}};
const shots = [];
for (const m of py.matchAll(/@shot\('(\w+)', ([\d.]+), ([\d.]+)(?:, plates=\[([\d., ]+)\])?\)/g)) {
  const [, name, t0, t1, plates] = m;
  const frames = Math.round((+t1 - +t0) * 12);
  const rec = man.shots[name];
  const fg = {};
  if (rec) for (const tr of rec.tracks) {
    const file = `public/film/${name}/fgc_${String(tr.f).padStart(4, '0')}.png`;   // the cast pass after blender/shadows.py
    fg[tr.f] = {box: tr.box && fs.existsSync(file) ? tr.box : null, head: tr.jacks[0]?.head ?? null, hand: tr.jacks[0]?.hand ?? null};
  }
  const nplates = plates ? plates.split(',').length : 1;
  const have = [...Array(nplates).keys()].every((k) => fs.existsSync(`public/film/${name}/bg_${k}.png`));
  shots.push({name, t0: +t0, t1: +t1, frames, plates: plates ? plates.split(',').map(Number) : [+t0], bg: have, fg});
}
fs.writeFileSync('src/data.json', JSON.stringify({shots}));
console.log(shots.map((s) => `${s.name} bg:${s.bg ? 'yes' : 'no'} fg:${Object.values(s.fg).filter((f) => f.box).length}/${s.frames}`).join('\n'));
