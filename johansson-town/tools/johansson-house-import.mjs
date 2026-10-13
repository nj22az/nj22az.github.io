#!/usr/bin/env node
/**
 * Johansson's house, read from the creator's CAD (docs/johansson-house/cad-rev-c: three coordinated plans as DXF, the
 * building manifest, the shell as GLB) into src/world/johansson-house-cad.js, the data the game builds the house from.
 *
 *   node tools/johansson-house-import.mjs           writes src/world/johansson-house-cad.js
 *   node tools/johansson-house-import.mjs --check   exits 1 if the committed module differs from the drawings (CI)
 *
 * The plans and the manifest are checked against each other on the way in: every wall and partition cut in a plan is a
 * box of the manifest on that level, and every floor outline a slab, or the import stops and says which. A new
 * revision is a new folder and a new SOURCE below; what the game does with the drawings (and where it departs from them,
 * with the reason) is src/world/johansson-house.js and docs/johansson-house/README.md.
 *
 * Frame, as drawn: x east and y north from the south-west outside corner, z up from the ground floor's datum; metres.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {readDxf} from './dxf.mjs';

const ROOT=join(dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE='docs/johansson-house/cad-rev-c';
const PLANS=Object.freeze({B1:'A_B1_Coordinated.dxf',G0:'A_G0_Coordinated.dxf',L1:'A_L1_Coordinated.dxf'});
const OUT='src/world/johansson-house-cad.js';
const m=v=>Math.round(v)/1000;

/** The rectangle a closed four-point polyline outlines, [x0, y0, x1, y1] in metres. */
function rectOf(points){
 const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]);
 return [m(Math.min(...xs)),m(Math.min(...ys)),m(Math.max(...xs)),m(Math.max(...ys))];
}
const key=r=>r.join(',');

export function importHouse(){
 const manifest=JSON.parse(readFileSync(join(ROOT,SOURCE,'building_manifest.json'),'utf8'));
 if(manifest.units!=='mm')throw new Error('manifest: units are not millimetres');
 const boxes=manifest.geometry_elements.map(g=>{
  const [x0,y0,z0,x1,y1,z1]=g.bounds_mm.map(m);
  const level=(g.name.match(/^(B1|G0|L1) /)||[])[1]||(/^roof/.test(g.name)?'roof':null);
  return {name:g.name,layer:g.layer,level,min:[x0,y0,z0],max:[x1,y1,z1]};
 });
 // A lintel or sill is named after its opening; its level is the opening's.
 const openingLevel=Object.fromEntries(Object.entries(manifest.openings).flatMap(([lv,list])=>list.map(o=>[o.id,lv])));
 for(const b of boxes)if(!b.level){const id=b.name.split(' ')[0];b.level=openingLevel[id]??null;if(!b.level)throw new Error('manifest: no level for '+b.name);}
 const plans={},rooms=[],labels={};
 for(const [level,file] of Object.entries(PLANS)){
  const ents=readDxf(readFileSync(join(ROOT,SOURCE,file),'utf8'));
  const rects=layer=>ents.filter(e=>e.type==='LWPOLYLINE'&&e.layer===layer).map(e=>rectOf(e.points));
  const plan={
   exterior:rects('A-EXT-WALL'),partitions:rects('A-PARTITION'),floors:rects('A-FLOOR'),
   stair:rects('A-STAIR')[0]??null,
   treads:ents.filter(e=>e.type==='LINE'&&e.layer==='A-STAIR').map(e=>[m(e.a[0]),m(e.a[1]),m(e.b[0]),m(e.b[1])]),
   openings:ents.filter(e=>e.type==='LINE'&&e.layer==='A-OPENING').map(e=>[m(e.a[0]),m(e.a[1]),m(e.b[0]),m(e.b[1])]),
  };
  // The plan and the manifest are the same building: each cut wall is a box on its level, and the other way round.
  for(const [what,layer,list] of [['wall','A-EXT-WALL',plan.exterior],['partition','A-PARTITION',plan.partitions],['floor','A-FLOOR',plan.floors]]){
   const cut=boxes.filter(b=>b.level===level&&b.layer===layer&&!/ (lintel|sill)$/.test(b.name)).map(b=>key([b.min[0],b.min[1],b.max[0],b.max[1]]));
   const drawn=list.map(key);
   for(const r of drawn)if(!cut.includes(r))throw new Error(`${file}: ${what} ${r} is not a box of the manifest on ${level}`);
   for(const r of cut)if(!drawn.includes(r))throw new Error(`manifest: ${what} ${r} on ${level} is not drawn in ${file}`);
  }
  for(const e of ents.filter(e=>e.type==='TEXT'&&e.layer==='A-ANNOT')){
   const room=manifest.rooms[level]?.find(r=>r.name===e.text);
   if(room)rooms.push({level,name:room.name,label:[m(e.a[0]),m(e.a[1])],bounds:room.bounds_mm.map(m)});
   else if(/^[DW]-/.test(e.text))labels[e.text]=[m(e.a[0]),m(e.a[1])];
  }
  for(const r of manifest.rooms[level]??[])if(!rooms.some(q=>q.level===level&&q.name===r.name))throw new Error(`${file}: room ${r.name} has no label`);
  plans[level]=plan;
 }
 const openings=Object.entries(manifest.openings).flatMap(([level,list])=>list.map(o=>({id:o.id,level,side:o.side,type:o.type,from:m(o.start_mm),to:m(o.end_mm),sill:m(o.sill_mm),head:m(o.head_mm)})));
 // Each opening is a cut in its plan, on its side, between the same two points.
 for(const o of openings){
  const along=o.side==='south'||o.side==='north',line=plans[o.level].openings.find(([x0,y0,x1,y1])=>along?Math.min(x0,x1)===o.from&&Math.max(x0,x1)===o.to&&y0===y1:Math.min(y0,y1)===o.from&&Math.max(y0,y1)===o.to&&x0===x1);
  if(!line)throw new Error(`${o.id}: not cut in the ${o.level} plan`);
 }
 const S=manifest.stair;
 return {
  source:SOURCE,revision:manifest.revision,project:manifest.project,
  footprint:manifest.footprint_mm.map(m),levels:Object.fromEntries(Object.entries(manifest.levels_mm).map(([k,v])=>[k,m(v)])),
  wallThickness:{exterior:m(manifest.wall_thickness_mm.exterior),partition:m(manifest.wall_thickness_mm.partition)},
  rooms,openings,openingLabels:labels,
  stair:{footprint:S.footprint_mm.map(m),rise:m(S.rise_between_floors_mm),risers:S.risers,riser:m(S.riser_mm),tread:m(S.tread_mm),configuration:S.configuration},
  boxes,plans,notes:manifest.notes,
 };
}

/** The data as a module, deeply frozen, one entry a line where it helps a diff. */
export function moduleText(data=importHouse()){
 const json=v=>JSON.stringify(v);
 const list=(name,items)=>` ${name}:[\n${items.map(i=>'  '+json(i)).join(',\n')}\n ],`;
 const {boxes,plans,rooms,openings,...head}=data;
 return `/**
 * Johansson's house as the creator drew it: ${data.revision} (${data.source}). Generated by
 * tools/johansson-house-import.mjs from the plans and the manifest; do not edit by hand, import a new revision instead.
 * Frame: x east, y north from the south-west outside corner, z up from the ground floor's datum; metres.
 * What the game builds from this, and where it departs from it, is johansson-house.js.
 */
const freeze=o=>{if(o&&typeof o==='object'&&!Object.isFrozen(o)){Object.freeze(o);for(const v of Object.values(o))freeze(v);}return o;};
export const JOHANSSON_HOUSE_CAD=freeze({
${Object.entries(head).map(([k,v])=>` ${k}:${json(v)},`).join('\n')}
${list('rooms',rooms)}
${list('openings',openings)}
${list('boxes',boxes)}
 plans:{
${Object.entries(plans).map(([lv,p])=>`  ${lv}:${json(p)},`).join('\n')}
 },
});
`;
}

if(process.argv[1]===fileURLToPath(import.meta.url)){
 const text=moduleText(),path=join(ROOT,OUT);
 if(process.argv.includes('--check')){
  let now='';try{now=readFileSync(path,'utf8');}catch{}
  if(now!==text){console.error(OUT+' is stale: run node tools/johansson-house-import.mjs');process.exit(1);}
  console.log(OUT+' matches '+SOURCE);
 }else{writeFileSync(path,text);console.log('wrote '+OUT);}
}
