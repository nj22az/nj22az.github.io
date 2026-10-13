#!/usr/bin/env node
/**
 * Johansson's house, drawn back from what the game builds (src/world/johansson-house.js): the plans of the three floors as
 * built, as SVG to look at and as DXF (millimetres, the layers of the creator's Rev C) to open in a CAD and make the next
 * revision from, and the design book's README with the rooms and the findings.
 *
 *   node tools/johansson-house-drawings.mjs           writes docs/johansson-house/
 *   node tools/johansson-house-drawings.mjs --check   exits 1 if a committed sheet differs from the data (CI)
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {JOHANSSON_HOUSE_CAD as CAD} from '../src/world/johansson-house-cad.js';
import {HOUSE_FLOORS,HOUSE_LEVELS,HOUSE_ROOMS,HOUSE_WALLS,HOUSE_DOORS,HOUSE_OPENINGS,HOUSE_SLABS,HOUSE_STAIR,HOUSE_SITE,HOUSE_FINDINGS} from '../src/world/johansson-house.js';

const OUT=join(dirname(fileURLToPath(import.meta.url)),'..','docs','johansson-house');
const CUT=1.2;
/** The walls a plan cuts, 1.2 m over its floor (sills and heads lie under and over the cut). */
const cut=level=>HOUSE_WALLS.filter(w=>w.level===level&&w.min[2]<=HOUSE_FLOORS[level].floor+CUT&&w.max[2]>=HOUSE_FLOORS[level].floor+CUT);
const f2=n=>Number(n.toFixed(2)),mm=n=>Math.round(n*1000);
const area=r=>f2((r.bounds[2]-r.bounds[0])*(r.bounds[3]-r.bounds[1]));

// ---------------------------------------------------------------- the plans as SVG

function planSvg(level){
 const S=50,M=90,W=12*S+2*M,H=10*S+2*M+70,X=x=>f2(M+x*S),Y=y=>f2(M+(10-y)*S);
 const out=[`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" font-family="Helvetica, Arial, sans-serif">`,
  `<rect width="${W}" height="${H}" fill="#fbfaf6"/>`];
 const rect=(x0,y0,x1,y1,a)=>out.push(`<rect x="${X(x0)}" y="${Y(y1)}" width="${f2((x1-x0)*S)}" height="${f2((y1-y0)*S)}" ${a}/>`);
 const line=(x0,y0,x1,y1,a)=>out.push(`<line x1="${X(x0)}" y1="${Y(y0)}" x2="${X(x1)}" y2="${Y(y1)}" ${a}/>`);
 const text=(x,y,s,a='')=>out.push(`<text x="${X(x)}" y="${Y(y)}" ${a}>${s}</text>`);
 // The rooms, their names and floor areas.
 for(const r of HOUSE_ROOMS.filter(q=>q.level===level)){
  const [x0,y0,x1,y1]=r.bounds;rect(x0,y0,x1,y1,'fill="#ffffff" stroke="none"');
  if(r.id.endsWith('-stair'))continue;
  text((x0+x1)/2,(y0+y1)/2+.12,r.name,'font-size="12" text-anchor="middle" fill="#222"');
  text((x0+x1)/2,(y0+y1)/2-.22,`${area(r)} m²`,'font-size="10" text-anchor="middle" fill="#777"');
 }
 // The stair: each tread's nosing, the landing, and the way up; on the upper floor the flight below, dashed.
 const S2=HOUSE_STAIR,[sx0,sy0,sx1,sy1]=S2.shaft;
 const flight=S2.flights.find(f=>f.from===level),below=S2.flights.find(f=>f.to===level);
 for(const [f,dash] of [[flight,''],[below,' stroke-dasharray="4 3"']]){
  if(!f)continue;
  for(const t of f.treads){const y=t.x[0]<S2.spine[0]?t.y[0]:t.y[1];line(t.x[0],y,t.x[1],y,`stroke="#555" stroke-width="1"${dash}`);}
  rect(f.landing.x[0],f.landing.y[0],f.landing.x[1],f.landing.y[1],`fill="none" stroke="#555" stroke-width="1"${dash}`);
 }
 if(flight){
  const mx=(sx0+S2.spine[0])/2,ex=(S2.spine[1]+sx1)/2,ly=(flight.landing.y[0]+flight.landing.y[1])/2;
  out.push(`<polyline points="${X(mx)},${Y(sy0+.15)} ${X(mx)},${Y(ly)} ${X(ex)},${Y(ly)} ${X(ex)},${Y(sy0+.35)}" fill="none" stroke="#b03a2e" stroke-width="1.5"/>`);
  out.push(`<polygon points="${X(ex-.12)},${Y(sy0+.5)} ${X(ex+.12)},${Y(sy0+.5)} ${X(ex)},${Y(sy0+.25)}" fill="#b03a2e"/>`);
  text((sx0+sx1)/2,sy0-.28,`UP ${S2.risers}R × ${mm(S2.riser)} / ${mm(S2.tread)}`,'font-size="9" text-anchor="middle" fill="#b03a2e"');
 }
 // The spine wall between the flights, and on the upper floor the balustrade along the well.
 rect(S2.spine[0],sy0,S2.spine[1],S2.flights[0].landing.y[0],'fill="#8a8a8a"');
 if(level==='L1')line(sx0,sy0,S2.spine[0],sy0,'stroke="#222" stroke-width="2.5"');
 // Openings in the outside walls: a window two thin lines, a door its leaf's swing.
 for(const o of HOUSE_OPENINGS.filter(q=>q.level===level)){
  const along=o.side==='south'||o.side==='north',f=o.side==='south'?0:o.side==='north'?10:o.side==='west'?0:12;
  for(const d of [.06,.14]){if(along)line(o.from,f+(o.side==='south'?d:-d),o.to,f+(o.side==='south'?d:-d),'stroke="#3a7ca5" stroke-width="1"');else line(f+(o.side==='west'?d:-d),o.from,f+(o.side==='west'?d:-d),o.to,'stroke="#3a7ca5" stroke-width="1"');}
  const lx=along?(o.from+o.to)/2:f+(o.side==='west'?-.35:.35),ly=along?f+(o.side==='south'?-.32:.32):(o.from+o.to)/2;
  text(lx,ly,o.id,'font-size="9" text-anchor="middle" fill="#3a7ca5"');
 }
 // The walls the plan cuts, outside walls darker.
 for(const w of cut(level))rect(w.min[0],w.min[1],w.max[0],w.max[1],w.kind==='exterior'?'fill="#2b2b2b"':'fill="#8a8a8a"');
 // The doorways between rooms (no leaves are hung: finding F8), marked by their jambs.
 for(const d of HOUSE_DOORS.filter(q=>q.level===level&&!q.open))for(const e of [d.from,d.to]){if(d.along==='x')line(e,d.at-.1,e,d.at+.1,'stroke="#2b2b2b" stroke-width="1"');else line(d.at-.1,e,d.at+.1,e,'stroke="#2b2b2b" stroke-width="1"');}
 // Dimensions, the title, the scale and north.
 line(0,-.9,12,-.9,'stroke="#555"');text(6,-.82,'12 000','font-size="10" text-anchor="middle" fill="#555"');
 line(-.9,0,-.9,10,'stroke="#555"');out.push(`<text x="${X(-1.05)}" y="${Y(5)}" font-size="10" text-anchor="middle" fill="#555" transform="rotate(-90 ${X(-1.05)} ${Y(5)})">10 000</text>`);
 const F=HOUSE_FLOORS[level];
 out.push(`<text x="${M}" y="${H-46}" font-size="15" font-weight="bold" fill="#222">Johansson House · ${F.name} (${level}) · finished floor ${F.floor>=0?'+':''}${mm(F.floor)}</text>`);
 out.push(`<text x="${M}" y="${H-28}" font-size="10" fill="#555">As built in Johansson World from ${CAD.revision.split(' - ')[0]==='C'?'Rev C':CAD.revision} (findings F1–F${HOUSE_FINDINGS.length}, README.md). Plan cut at ${mm(CUT)} mm. Millimetres. Game asset: not for construction.</text>`);
 out.push(`<line x1="${W-M-100}" y1="${H-40}" x2="${W-M}" y2="${H-40}" stroke="#222" stroke-width="2"/><text x="${W-M-50}" y="${H-46}" font-size="9" text-anchor="middle">2 m</text>`);
 out.push(`<text x="${W-M+40}" y="${M-20}" font-size="12" text-anchor="middle">N</text><polygon points="${W-M+34},${M-6} ${W-M+46},${M-6} ${W-M+40},${M-18}" fill="#222"/>`);
 out.push('</svg>');
 return out.join('\n')+'\n';
}

// ---------------------------------------------------------------- the plans as DXF (R12, millimetres)

function planDxf(level){
 const e=[];
 const pair=(c,v)=>e.push(String(c),String(v));
 const line=(layer,x0,y0,x1,y1)=>{pair(0,'LINE');pair(8,layer);pair(10,mm(x0));pair(20,mm(y0));pair(30,0);pair(11,mm(x1));pair(21,mm(y1));pair(31,0);};
 const box=(layer,x0,y0,x1,y1)=>{line(layer,x0,y0,x1,y0);line(layer,x1,y0,x1,y1);line(layer,x1,y1,x0,y1);line(layer,x0,y1,x0,y0);};
 const text=(layer,x,y,h,s)=>{pair(0,'TEXT');pair(8,layer);pair(10,mm(x));pair(20,mm(y));pair(30,0);pair(40,h);pair(1,s);};
 for(const w of cut(level))box(w.kind==='exterior'?'A-EXT-WALL':'A-PARTITION',w.min[0],w.min[1],w.max[0],w.max[1]);
 for(const s of HOUSE_SLABS.filter(q=>q.level===level))box('A-FLOOR',s.min[0],s.min[1],s.max[0],s.max[1]);
 for(const o of HOUSE_OPENINGS.filter(q=>q.level===level)){
  const along=o.side==='south'||o.side==='north',f=o.side==='south'?.1:o.side==='north'?9.9:o.side==='west'?.1:11.9;
  if(along)line('A-OPENING',o.from,f,o.to,f);else line('A-OPENING',f,o.from,f,o.to);
  text('A-ANNOT',along?o.from+.05:f+.25,along?f+.35:o.from+.05,100,o.id);
 }
 const S=HOUSE_STAIR;box('A-STAIR',...S.shaft);
 for(const f of S.flights.filter(q=>q.from===level)){for(const t of f.treads){const y=t.x[0]<S.spine[0]?t.y[0]:t.y[1];line('A-STAIR',t.x[0],y,t.x[1],y);}box('A-STAIR',f.landing.x[0],f.landing.y[0],f.landing.x[1],f.landing.y[1]);}
 box('A-PARTITION',S.spine[0],S.shaft[1],S.spine[1],S.flights[0].landing.y[0]);
 for(const r of HOUSE_ROOMS.filter(q=>q.level===level))text('A-ANNOT',r.bounds[0]+.18,r.bounds[1]+.23,120,r.name);
 text('A-ANNOT',0,11,250,`JOHANSSON HOUSE ${level}  AS BUILT IN JOHANSSON WORLD FROM REV C  |  1 unit = 1 mm`);
 return ['0','SECTION','2','ENTITIES',...e,'0','ENDSEC','0','EOF'].join('\n')+'\n';
}

// ---------------------------------------------------------------- the design book

function readme(){
 const L=HOUSE_FLOORS,S=HOUSE_STAIR;
 const rooms=HOUSE_LEVELS.map(level=>HOUSE_ROOMS.filter(r=>r.level===level).map(r=>`| ${level} | ${r.name} | ${f2(r.bounds[2]-r.bounds[0])} × ${f2(r.bounds[3]-r.bounds[1])} m | ${area(r)} m² | ${r.purpose} |`).join('\n')).join('\n');
 const findings=HOUSE_FINDINGS.map(f=>`### ${f.id}. ${f.title}\n\n- **Drawn:** ${f.drawn}\n- **Problem:** ${f.problem}\n- **Built:** ${f.built}\n`).join('\n');
 return `# Johansson's house (ヨハンソン邸): the design book

The creator, 2026-10-13, with the drawings: *"Can you use these drawings and model Johansson’s house on the tropical island?"*
Two revisions came: Rev B (\`cad-rev-b/\`, a schematic set: plans, elevations, a section, structure, electrics, plumbing and
drainage) and Rev C (\`cad-rev-c/\`, three coordinated plans with real wall gaps, the building manifest and the shell as GLB).
Rev C rules; Rev B is reference only, as its README says. This folder is generated from what the game builds
(\`node tools/johansson-house-drawings.mjs\`; \`tests/johansson-house.test.mjs\` fails when a sheet is stale), so the house
in World, these drawings and the house in the stories are one house.

- **The drawings, read:** \`src/world/johansson-house-cad.js\`, generated from \`cad-rev-c/\` by
  \`node tools/johansson-house-import.mjs\`, which checks the plans and the manifest against each other on the way in.
- **The house as built:** \`src/world/johansson-house.js\`: the drawings, and where they leave something open, the findings
  below. Nothing else departs from them.
- **Outside, in Kitano hamlet:** \`src/world/johansson-house-build.js\`, on plot \`kitano-1\` (\`kitano-hamlet-layout.js\`,
  \`kitano-hamlet.js\`), its front door the site \`mayor-home\`.
- **Inside:** \`src/world/interiors/johansson-house-interior.js\`, walked floor by floor with \`src/world/house-walk.js\`.

A new revision: put it in \`cad-rev-<x>/\`, point the importer's \`SOURCE\` at it, run the importer, and the tests say
which finding it settles and what no longer fits.

## Particulars

| | |
|---|---|
| Footprint | ${CAD.footprint[0]} × ${CAD.footprint[1]} m outside, walls ${mm(CAD.wallThickness.exterior)} mm, partitions ${mm(CAD.wallThickness.partition)} mm |
| Floors (finished) | Basement ${mm(L.B1.floor)}, ground ${mm(L.G0.floor)}, upper +${mm(L.L1.floor)} mm; 2 800 mm floor to floor |
| Clear heights | Basement ${mm(L.B1.soffit-L.B1.floor)}, ground ${mm(L.G0.soffit-L.G0.floor)}, upper ${mm(L.L1.soffit-L.L1.floor)} mm |
| Roof | Slab ${mm(HOUSE_SITE.roofSlab.z0)}–${mm(HOUSE_SITE.roofSlab.z1)} mm, ${mm(HOUSE_SITE.roofSlab.overhang)} mm over the walls; hipped red tile to a ridge at +${mm(HOUSE_SITE.ridge)} (F10) |
| Stair | ${S.risers} risers × ${mm(S.riser)} mm, treads ${mm(S.tread)} mm, two flights ${mm(S.width)} mm wide and a landing, stacked (F1) |
| Site | Yard ${mm(HOUSE_SITE.grade)} mm under the datum (450 under the ground floor), 1.3 m above the sea |
| Rooms | ${HOUSE_ROOMS.length} (${HOUSE_ROOMS.filter(r=>!r.id.endsWith('-stair')).length} and the stair on each floor) |

## The sheets

| Sheet | File | What it is |
|---|---|---|
| B1 | \`plan-B1.svg\`, \`as-built-B1.dxf\` | Basement plan as built |
| G0 | \`plan-G0.svg\`, \`as-built-G0.dxf\` | Ground floor plan as built |
| L1 | \`plan-L1.svg\`, \`as-built-L1.dxf\` | Upper floor plan as built |

The DXF are in millimetres on Rev C's layers (A-EXT-WALL, A-PARTITION, A-OPENING, A-STAIR, A-FLOOR, A-ANNOT), so they
open over the creator's own sheets.

## Rooms

| Floor | Room | Size | Area | What it is for |
|---|---|---|---|---|
${rooms}

## Findings

Where the house as built departs from Rev C, and why: for the next revision to settle.

${findings}
## Open

- The creator's roof design (F10), the basement's tanking and its sump (F11), the kitchen window's sill (F12).
- The stair house's own steps down to D-BEXT are not walked yet: the door is bolted in the game.
- Rev B's electrics, plumbing and drainage are not coordinated with Rev C (its README says so); the house's services
  are the next sheets to draw.
`;
}

export function build(){
 const out={};
 for(const level of HOUSE_LEVELS){out[`plan-${level}.svg`]=planSvg(level);out[`as-built-${level}.dxf`]=planDxf(level);}
 out['README.md']=readme();
 return out;
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
 const sheets=build();
 if(process.argv.includes('--check')){
  const stale=Object.entries(sheets).filter(([name,body])=>{try{return readFileSync(join(OUT,name),'utf8')!==body;}catch{return true;}}).map(([n])=>n);
  if(stale.length){console.error('stale: '+stale.join(', ')+': run node tools/johansson-house-drawings.mjs');process.exit(1);}
  console.log('docs/johansson-house matches the data');
 }else{for(const [name,body] of Object.entries(sheets))writeFileSync(join(OUT,name),body);console.log('wrote',Object.keys(sheets).join(', '));}
}
