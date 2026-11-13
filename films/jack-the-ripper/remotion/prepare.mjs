// Reads the shot table out of ../blender/film.py and what the render has produced in public/film, and writes
// src/data.json: for every shot its times, its plates, and for every picture where the cast's crop sits and
// where Jack's head and right hand are.
import fs from 'fs';
const py = fs.readFileSync(new URL('../blender/film.py', import.meta.url), 'utf8');
const man = fs.existsSync('public/film/manifest.json') ? JSON.parse(fs.readFileSync('public/film/manifest.json', 'utf8')) : {shots: {}};
const shots = [];
for (const m of py.matchAll(/@shot\('(\w+)', ([\d.]+), ([\d.]+)(?:, plates=\[([\d., ]+)\])?(?:, fps=(\d+))?\)/g)) {
  const [, name, t0, t1, plates, fpsS] = m;
  const fps = +(fpsS ?? 12);
  const frames = Math.round((+t1 - +t0) * fps);
  const rec = man.shots[name];
  const fg = {}; const steps = []; const was = [9, 9];
  if (rec) for (const tr of rec.tracks) {
    // a step: a toe that was up in the picture before and is down in this one
    (tr.jacks[0]?.feet ?? []).forEach((ft, k) => { if (ft[2] < 0.06 && was[k] >= 0.06 && was[k] < 9) steps.push({t: +t0 + tr.f / fps, x: ft[0], y: ft[1]}); was[k] = ft[2]; });
    const file = `public/film/${name}/fg_${String(tr.f).padStart(4, '0')}.png`;
    fg[tr.f] = {star: tr.star ?? null, box: tr.box && fs.existsSync(file) ? tr.box : null, head: tr.jacks[0]?.head ?? null, hand: tr.jacks[0]?.hand ?? null};
  }
  const nplates = plates ? plates.split(',').length : 1;
  const have = [...Array(nplates).keys()].every((k) => fs.existsSync(`public/film/${name}/bg_${k}.png`));
  shots.push({name, t0: +t0, t1: +t1, fps, frames, steps, plates: plates ? plates.split(',').map(Number) : [+t0], bg: have, fg});
}
fs.writeFileSync('src/data.json', JSON.stringify({shots}));
console.log(shots.map((s) => `${s.name} bg:${s.bg ? 'yes' : 'no'} fg:${Object.values(s.fg).filter((f) => f.box).length}/${s.frames}`).join('\n'));
