// Johansson Heights Minato's drawing set, generated from the building's data (src/world/minato-apartments.js):
//   node tools/apartment-drawings.mjs           writes docs/minato-apartments/
//   node tools/apartment-drawings.mjs --check   fails if a sheet differs from what the data draws
// Change the data, run the tool, commit the sheets (tests/apartment-design-book.test.mjs fails on stale ones).
// The sheets are framed like the Minato Maru's (tools/ferry-drawings.mjs): a zoned border, a title block grid at the
// bottom right and the notes in a box over it. Plans are drawn north up, x east, at a stated scale in px per metre.
import {writeFileSync,readFileSync,mkdirSync,existsSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {APARTMENTS as AP,GRID,BAY,WALLS,COLUMN,COLUMNS,LEVELS,ROOF,FLAT_SECTION,CORE,ESCAPE,ESCAPE_DISTANCE,FLAT,FLAT_AREA,flatRect,
 FLATS,RESIDENTS,ALLOCATION,LEFT_HOMES,GROUND,WALKWAY,WATER,WATER_PRESSURE,DRAINAGE,JOHKASOU_SIZE,FLAT_BOARD,HEATER,ELECTRICAL,
 FLAT_PIPES,FLAT_ELECTRIC,FINDINGS} from '../src/world/minato-apartments.js';

const OUT=fileURLToPath(new URL('../docs/minato-apartments/',import.meta.url));
const W=1400,H=990;
const r2=v=>Math.round(v*100)/100;
const SHEET_LIST=[
 ['A-01','site-plan.svg','Site plan'],
 ['A-02','plan-1F.svg','Ground floor plan (1F)'],
 ['A-03','plan-typical.svg','Typical floor plan (2F–7F)'],
 ['A-04','plan-roof.svg','Roof plan'],
 ['A-05','flat-plan.svg','Flat plans, types A and B'],
 ['A-06','section-elevation.svg','Section A–A and west elevation'],
 ['P-01','water-supply.svg','Cold water supply: riser diagram'],
 ['P-02','drainage.svg','Soil, waste and vent: riser diagram'],
 ['P-03','flat-plumbing.svg','Flat plumbing plan'],
 ['E-01','single-line.svg','Electrical single-line diagram'],
 ['E-02','flat-electrical.svg','Flat electrical plan'],
 ['F-01','fire-escape.svg','Fire safety and escape'],
];
const NO=Object.fromEntries(SHEET_LIST.map(([n,f],i)=>[f,{no:'JC-H01-'+n,index:i+1}]));

// ---------------------------------------------------------------- sheet furniture
const CHAR=.56;
const textWidth=(s,size)=>[...String(s)].reduce((w,c)=>w+(c.charCodeAt(0)>0x2e80?1:CHAR)*size,0);
const fit=(s,width,size)=>Math.min(size,size*width/Math.max(1,textWidth(s,size)));
function wrap(s,width,size){const words=String(s).split(' '),lines=[];let line='';for(const w of words){const t=line?line+' '+w:w;if(textWidth(t,size)>width&&line){lines.push(line);line=w;}else line=t;}if(line)lines.push(line);return lines;}
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const text=(x,y,s,cls='txt',extra='')=>`<text class="${cls}" x="${r2(x)}" y="${r2(y)}" ${extra}>${esc(s)}</text>`;
const fitText=(x,y,s,width,size,cls='lab',extra='')=>text(x,y,s,cls,`style="font-size:${r2(fit(s,width,size))}px" ${extra}`);
const line=(x1,y1,x2,y2,cls='l',extra='')=>`<line class="${cls}" x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(x2)}" y2="${r2(y2)}" ${extra}/>`;
const box=(x,y,w,h,cls='l',extra='')=>`<rect class="${cls}" x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}" ${extra}/>`;
const poly=(pts,cls='l',extra='')=>`<path class="${cls}" d="M${pts.map(p=>p.map(r2).join(',')).join(' L')}" ${extra}/>`;
function svg(body,title){
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="Helvetica, Arial, sans-serif" font-size="11">
<title>${esc(title)}</title><rect width="${W}" height="${H}" fill="#fbfaf6"/>
<style>.l{fill:none;stroke:#1d2326;stroke-width:1.1}.t{fill:none;stroke:#1d2326;stroke-width:.45}.g{fill:none;stroke:#9aa3a6;stroke-width:.4;stroke-dasharray:6 3 1 3}.h{fill:none;stroke:#1d2326;stroke-width:.6;stroke-dasharray:4 3}.d{fill:none;stroke:#1d2326;stroke-width:.5}.txt{fill:#1d2326}.lab{fill:#1d2326;font-size:9px}.ttl{fill:#1d2326;font-weight:bold}.cut{fill:url(#hatch);stroke:#1d2326;stroke-width:.9}.fx{fill:#fff;stroke:#1d2326;stroke-width:.6}.fu{fill:#f3efe4;stroke:#5c6366;stroke-width:.5}.cold{fill:none;stroke:#1f5fa8;stroke-width:1.6}.hot{fill:none;stroke:#b8322a;stroke-width:1.6}.waste{fill:none;stroke:#7a5230;stroke-width:2.2}.vent{fill:none;stroke:#7a5230;stroke-width:1.2;stroke-dasharray:5 3}.rain{fill:none;stroke:#2f6f74;stroke-width:1.6;stroke-dasharray:8 3}.pw{fill:none;stroke:#c07a12;stroke-width:1.4}.hv{fill:none;stroke:#8e3a30;stroke-width:2.2}.fire{fill:none;stroke:#c0281e;stroke-width:1.6}.zone{fill:#eef1ee;stroke:#1d2326;stroke-width:.5}</style>
<defs><pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="5" fill="#d9d6cc"/><line x1="0" y1="0" x2="0" y2="5" stroke="#1d2326" stroke-width=".5"/></pattern><marker id="arr" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,1 L10,5 L0,9 z" fill="#1d2326"/></marker></defs>
${frame()}${body}<text x="16" y="${H-16}" font-size="8" fill="#9b3030">FOR DESIGN REVIEW · Rev A · a game asset's design basis, not for construction · metres unless noted</text></svg>`;
}
function frame(){
 let out=box(10,10,W-20,H-20)+box(4,4,W-8,H-8,'t');
 const cols=8,rows=6;
 for(let i=0;i<cols;i++){const x=10+(W-20)*(i+.5)/cols;out+=text(x,9,String.fromCharCode(65+i),'lab','text-anchor="middle"')+text(x,H-3,String.fromCharCode(65+i),'lab','text-anchor="middle"');}
 for(let i=0;i<rows;i++){const y=10+(H-20)*(i+.5)/rows;out+=text(7,y+3,i+1,'lab','text-anchor="middle"')+text(W-7,y+3,i+1,'lab','text-anchor="middle"');}
 return out;
}
function titleBlock(file,title,scale,notes=[]){
 const bw=430,bh=96,x=W-10-bw,y=H-10-bh,{no,index}=NO[file];let out=box(x,y,bw,bh,'l','fill="#fff"');
 const cell=(cx,cy,cw,ch,label,value,big=false)=>{let s=box(x+cx,y+cy,cw,ch,'t')+text(x+cx+3,y+cy+8,label,'lab','font-size="6.5" fill="#6a7477"');
  const lines=Array.isArray(value)?value:[value];const size=big?12:9;lines.forEach((v,i)=>s+=fitText(x+cx+3,y+cy+ch-4-(lines.length-1-i)*(size+1),v,cw-6,i===lines.length-1?size:8,i===lines.length-1&&big?'ttl':'txt'));return s;};
 out+=cell(0,0,180,30,'BUILDER',[AP.builderJp,'JOHANSSON CONSTRUCTION'],true);
 out+=cell(180,0,160,30,'PROJECT',[AP.jp,AP.name.toUpperCase()+' · Minato-chō']);
 out+=cell(340,0,90,30,'DRAWING No.',no,true);
 out+=cell(0,30,340,30,'TITLE',title);
 out+=cell(340,30,90,30,'SCALE',scale);
 out+=cell(0,60,80,36,'DRAWN','tools/apartment-drawings.mjs');out+=cell(80,60,70,36,'CHECKED','numeric checks');out+=cell(150,60,70,36,'ISSUE','DESIGN REVIEW');
 out+=cell(220,60,70,36,'DATE','2026-10-13');out+=cell(290,60,60,36,'SHEET',index+' / '+SHEET_LIST.length);out+=cell(350,60,80,36,'REV','A · first issue');
 const lines=notes.flatMap(n=>wrap(n,bw-12,8.5));if(lines.length){const nh=lines.length*11+12;out+=box(x,y-nh-4,bw,nh,'t','fill="#fff"')+text(x+5,y-nh+4,'NOTES','lab','font-size="6.5" fill="#6a7477"');lines.forEach((l,i)=>out+=text(x+5,y-nh+15+i*11,l,'lab'));}
 return out;
}
/** A dimension between two points, offset along the normal. */
function dim(x1,y1,x2,y2,label,off=16){
 const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy)||1,nx=-dy/len*off,ny=dx/len*off,ax=x1+nx,ay=y1+ny,bx=x2+nx,by=y2+ny,vertical=Math.abs(dx)<Math.abs(dy);
 return line(x1,y1,ax+nx*.2,ay+ny*.2,'d')+line(x2,y2,bx+nx*.2,by+ny*.2,'d')+line(ax,ay,bx,by,'d','marker-start="url(#arr)" marker-end="url(#arr)"')
  +(vertical?text((ax+bx)/2-3,(ay+by)/2,label,'lab',`text-anchor="middle" transform="rotate(-90 ${r2((ax+bx)/2-3)} ${r2((ay+by)/2)})"`):text((ax+bx)/2,(ay+by)/2-3,label,'lab','text-anchor="middle"'));
}
const heading=(x,y,s,sub='')=>text(x,y,s,'ttl','font-size="13"')+(sub?text(x,y+14,sub,'lab'):'');
const north=(x,y)=>`<g transform="translate(${x},${y})"><circle r="16" class="t"/><path d="M0,-14 L6,8 L0,3 L-6,8 z" fill="#1d2326"/>`+text(0,-20,'N','ttl','text-anchor="middle"')+'</g>';
function scaleBar(x,y,S,metres=5){let s='';for(let i=0;i<metres;i++)s+=box(x+i*S,y,S,5,'t',i%2?'fill="#fff"':'fill="#1d2326"');return s+text(x,y+16,'0','lab')+text(x+metres*S,y+16,metres+' m','lab','text-anchor="middle"');}

// ---------------------------------------------------------------- plan helpers
/** A plan view: building frame (x east, z north) to the page, north up. */
const plan=(ox,oy,S)=>({S,X:x=>ox+x*S,Y:z=>oy-z*S,
 rect(x0,x1,z0,z1,cls='l',extra=''){return box(ox+Math.min(x0,x1)*S,oy-Math.max(z0,z1)*S,Math.abs(x1-x0)*S,Math.abs(z1-z0)*S,cls,extra);},
 pts(list){return list.map(([x,z])=>[ox+x*S,oy-z*S]);}});
/** Grid lines with their bubbles. */
function grid(p,{x0=-4,x1=11.5,z0=-1.5,z1=23}={}){
 let s='';
 for(const [k,x] of Object.entries(GRID.x)){s+=line(p.X(x),p.Y(z0),p.X(x),p.Y(z1),'g')+`<circle cx="${r2(p.X(x))}" cy="${r2(p.Y(z1)-9)}" r="8" class="t" fill="#fff"/>`+text(p.X(x),p.Y(z1)-6,k,'lab','text-anchor="middle"');}
 for(const [k,z] of Object.entries(GRID.z)){s+=line(p.X(x0),p.Y(z),p.X(x1),p.Y(z),'g')+`<circle cx="${r2(p.X(x1)+9)}" cy="${r2(p.Y(z))}" r="8" class="t" fill="#fff"/>`+text(p.X(x1)+9,p.Y(z)+3,k,'lab','text-anchor="middle"');}
 return s;
}
const columns=p=>COLUMNS.map(c=>p.rect(c.x-COLUMN/2,c.x+COLUMN/2,c.z-COLUMN/2,c.z+COLUMN/2,'cut')).join('');
/** The core: walls, lift shaft (crossed), stair flights with their arrow. */
function core(p,{ground=false}={}){
 const C=CORE,L=C.lift,St=C.stair;let s=p.rect(C.x0,C.x1,C.z0,C.z1,'cut');
 s+=p.rect(C.x0+WALLS.core,C.x1-WALLS.core,C.z0+WALLS.core,C.z1-WALLS.core,'fx');
 // Doors to the corridor: the lift's and the stair's, as gaps in the east wall.
 s+=p.rect(C.x1-WALLS.core-0.01,C.x1+0.01,8.0,8.8,'t','fill="#fff"')+p.rect(C.x1-WALLS.core-0.01,C.x1+0.01,11.55,12.45,'t','fill="#fff"');
 s+=p.rect(L.x0,L.x1,L.z0,L.z1,'fx')+poly(p.pts([[L.x0,L.z0],[L.x1,L.z1]]),'t')+poly(p.pts([[L.x0,L.z1],[L.x1,L.z0]]),'t')+text(p.X((L.x0+L.x1)/2),p.Y((L.z0+L.z1)/2)+3,'EV','lab','text-anchor="middle" font-weight="bold"');
 s+=line(p.X(L.x0-0.02),p.Y(L.z1+0.1),p.X(L.x1),p.Y(L.z1+0.1),'l');
 // Two flights: west going north, east coming back south; treads across.
 const fx=[[St.x0,St.x0+St.flight],[St.x1-St.flight,St.x1]],lz0=St.z0+1.2,steps=ground?9:7,len=steps*St.tread;
 for(const [i,[a,b]] of fx.entries()){s+=p.rect(a,b,lz0,lz0+len,'t');for(let k=1;k<steps;k++)s+=line(p.X(a),p.Y(lz0+k*St.tread),p.X(b),p.Y(lz0+k*St.tread),'t');
  const mid=(a+b)/2;s+=poly(p.pts(i===0?[[mid,lz0+.1],[mid,lz0+len-.1]]:[[mid,lz0+len-.1],[mid,lz0+.1]]),'d','marker-end="url(#arr)"');}
 s+=text(p.X((St.x0+St.x1)/2),p.Y(St.z1-0.35),ground?'UP':'UP / DN','lab','text-anchor="middle"');
 return s;
}
/** One flat's walls are drawn with the floor; this draws its fixtures and furniture. */
function flatContents(p,flat,{furniture=true,labels=false}={}){
 let s='';const R=r=>flatRect(flat,r);
 const sh=R(FLAT.shaft);s+=p.rect(sh.x0,sh.x1,sh.z0,sh.z1,'zone')+poly(p.pts([[sh.x0,sh.z0],[sh.x1,sh.z1]]),'t');
 const gk=R(FLAT.genkan);s+=p.rect(gk.x0,gk.x1,gk.z0,gk.z1,'t','stroke-dasharray="2 2"');
 for(const f of FLAT.fixtures){const r=R(f);s+=p.rect(r.x0,r.x1,r.z0,r.z1,'fx');
  if(f.id==='unit-bath'){const t=R({u0:0.1,u1:0.85,v0:0.65,v1:1.55});s+=`<rect class="t" x="${r2(p.X(t.x0))}" y="${r2(p.Y(t.z1))}" width="${r2((t.x1-t.x0)*p.S)}" height="${r2((t.z1-t.z0)*p.S)}" rx="4"/>`;}
  if(f.id==='water-heater'){const c=R({u0:0.35,u1:0.35,v0:3.42,v1:3.42});s+=`<circle class="t" cx="${r2(p.X(c.x0))}" cy="${r2(p.Y(c.z0))}" r="${r2(.27*p.S)}"/>`;}
  if(labels)s+=fitText(p.X((r.x0+r.x1)/2),p.Y((r.z0+r.z1)/2)+3,f.id.replace('-',' '),Math.abs(r.x1-r.x0)*p.S-2,7.5,'lab','text-anchor="middle"');}
 if(furniture)for(const f of FLAT.furniture[flat.type]){const r=R(f);s+=p.rect(r.x0,r.x1,r.z0,r.z1,'fu');
  if(labels)s+=fitText(p.X((r.x0+r.x1)/2),p.Y((r.z0+r.z1)/2)+3,f.id.replace('-',' '),Math.abs(r.x1-r.x0)*p.S-2,7.5,'lab','text-anchor="middle"');}
 return s;
}
/** A typical floor's walls: corridor parapet, front and back walls with their openings, party walls, balconies. */
function typicalWalls(p){
 let s='';const X=GRID.x;
 s+=p.rect(X.A,X.D,0,6*BAY,'t','fill="#fff"');
 s+=p.rect(X.A,X.A+WALLS.corridorParapet,0,CORE.z0,'cut')+p.rect(X.A,X.A+WALLS.corridorParapet,CORE.z1,6*BAY,'cut'); // corridor parapet, open to the core
 s+=p.rect(X.D-0.1,X.D,0,6*BAY,'t','fill="#fff"');                                          // balcony rail
 for(let bay=1;bay<=6;bay++){
  const fl={bay},z0=(bay-1)*BAY,z1=bay*BAY,door=flatRect(fl,{...FLAT.door,v0:0,v1:0}),win=flatRect(fl,{...FLAT.window,v0:0,v1:0});
  // Front wall, broken by the door; back wall, broken by the window.
  const seg=(a,b,x0,x1)=>a<b?p.rect(x0,x1,a,b,'cut'):'';
  s+=seg(z0,door.z0,X.B-WALLS.front/2,X.B+WALLS.front/2)+seg(door.z1,z1,X.B-WALLS.front/2,X.B+WALLS.front/2);
  s+=line(p.X(X.B-WALLS.front/2),p.Y(door.z0),p.X(X.B-WALLS.front/2-0.82),p.Y(door.z0),'t')+`<path class="t" d="M${r2(p.X(X.B-WALLS.front/2-0.82))},${r2(p.Y(door.z0))} A${r2(.85*p.S)},${r2(.85*p.S)} 0 0 1 ${r2(p.X(X.B-WALLS.front/2))},${r2(p.Y(door.z1))}"/>`;
  s+=seg(z0,win.z0,X.C-WALLS.back/2,X.C+WALLS.back/2)+seg(win.z1,z1,X.C-WALLS.back/2,X.C+WALLS.back/2);
  s+=p.rect(X.C-0.03,X.C+0.03,win.z0,win.z1,'t','fill="#fff"')+line(p.X(X.C),p.Y(win.z0),p.X(X.C),p.Y(win.z1),'t');
 }
 for(let i=0;i<=6;i++){const z=i*BAY,end=i===0||i===6;
  s+=p.rect(X.B,X.C,z-WALLS.party/2,z+WALLS.party/2,'cut');
  s+=end?p.rect(X.C,X.D,z-WALLS.party/2,z+WALLS.party/2,'cut'):line(p.X(X.C),p.Y(z),p.X(X.D),p.Y(z),'h');}
 return s;
}

// ---------------------------------------------------------------- A-01 site plan
function sitePlan(){
 const S=24,p=plan(300,790,S),site=AP.site,o=AP.origin;const w=(x,z)=>[x-o.x,z-o.z];let s='';
 s+=heading(30,40,'SITE PLAN · the plot Rainflower Lane leaves','World coordinates in brackets; building frame origin at ('+o.x+', '+o.z+').');
 // Neighbours.
 s+=p.rect(...[w(-12,0)[0],w(-5.4,0)[0]],...[w(0,34)[1],w(0,56)[1]],'zone')+text(p.X(w(-11.6,0)[0]),p.Y(w(0,48)[1]),'AOBA GARDEN','lab','transform="rotate(-90 '+r2(p.X(w(-11.6,0)[0]))+' '+r2(p.Y(w(0,48)[1]))+')"');
 s+=p.rect(w(-10.6,0)[0],w(12,0)[0],w(0,26)[1],w(0,29)[1],'zone')+text(p.X(w(-6,0)[0]),p.Y(w(0,27)[1]),'BUS STATION PLAZA · head of Main Street (continues south)','lab');
 s+=text(p.X(w(2,0)[0]),p.Y(w(0,58)[1]),'↑ Kitahama walk','lab','text-anchor="middle"')+text(p.X(w(12.5,0)[0]),p.Y(w(0,42)[1]),'east lawn →','lab');
 // The plot (dash) and the building.
 const a=w(site.minX,site.minZ),b=w(site.maxX,site.maxZ);s+=p.rect(a[0],b[0],a[1],b[1],'h');
 s+=text(p.X(a[0])+4,p.Y(b[1])-6,`PLOT (Rainflower Lane, removed) x ${site.minX}…${site.maxX}, z ${site.minZ}…${site.maxZ}`,'lab');
 s+=p.rect(GRID.x.A,GRID.x.D,0,6*BAY,'zone','fill="#e6e0d2"')+p.rect(CORE.x0,CORE.x1,CORE.z0,CORE.z1,'cut');
 s+=text(p.X(4.8),p.Y(11),'JOHANSSON HEIGHTS MINATO','ttl','text-anchor="middle" font-size="11"')+text(p.X(4.8),p.Y(11)+13,'7 storeys · 36 flats · shops on 1F','lab','text-anchor="middle"');
 // Treatment tank, utilities.
 const J=DRAINAGE.johkasou;s+=p.rect(J.x0,J.x1,J.z0,J.z1,'fx','stroke-dasharray="3 2"')+text(p.X((J.x0+J.x1)/2),p.Y((J.z0+J.z1)/2),'TREATMENT','lab','text-anchor="middle" font-size="7"')+text(p.X((J.x0+J.x1)/2),p.Y((J.z0+J.z1)/2)+9,'TANK '+JOHKASOU_SIZE.chosen+'p','lab','text-anchor="middle" font-size="7"');
 const pole=w(5.2,28);s+=`<circle cx="${r2(p.X(pole[0]))}" cy="${r2(p.Y(pole[1]))}" r="5" fill="#8e3a30"/>`+text(p.X(pole[0])+8,p.Y(pole[1])+4,'feeder pole, PAS (5.2, 28)','lab');
 s+=poly(p.pts([pole,[pole[0],-0.6],[9.0,-0.6],[9.0,12.6],[8.35,12.6]]),'hv')+text(p.X(9.2),p.Y(11.2),'6.6 kV buried','lab','fill="#8e3a30"');
 s+=poly(p.pts([[-0.6,-2.4],[-0.6,16.2],[1.2,16.2]]),'cold')+text(p.X(-0.4),p.Y(-2.6),'water main 50A, meter','lab','fill="#1f5fa8"');
 s+=poly(p.pts([[11.0,2.0],[11.0,-2.5]]),'waste')+text(p.X(11.2),p.Y(-2.0),'treated water → storm drain','lab','fill="#7a5230"');
 s+=poly(p.pts([[9.75,18.0],[9.75,9.0]]),'waste')+text(p.X(9.85),p.Y(17),'building drain 125A','lab','fill="#7a5230"');
 // Dimensions.
 s+=dim(p.X(GRID.x.A),p.Y(0),p.X(GRID.x.D),p.Y(0),'9.55',-22)+dim(p.X(CORE.x0),p.Y(0),p.X(CORE.x0),p.Y(6*BAY),'21.60',-26);
 s+=dim(p.X(CORE.x0),p.Y(CORE.z1),p.X(CORE.x1),p.Y(CORE.z1),'2.80',18);
 s+=north(1250,90)+scaleBar(1100,150,S,5);
 // Particulars.
 const rows=[['Name',AP.name+' · '+AP.jp],['Builder',AP.builder+' · '+AP.builderJp+', '+AP.built],['Structure',AP.structure],['Storeys',`${AP.storeys} above ground, none below · roof at +${ROOF.level} m, top of the machine room +${r2(ROOF.level+ROOF.machineRoom.height)} m`],['Flats',`${FLATS.length}: ${FLAT_AREA.inside} m² inside + ${FLAT_AREA.balcony} m² balcony each`],['People',`${RESIDENTS.length} residents in ${new Set(ALLOCATION.filter(a=>a.members.length).map(a=>a.from)).size} households; flat ${FLATS.filter(f=>f.toLet).map(f=>f.number).join(', ')} to let`],['Ground floor',`+${AP.groundFloor} m above the town datum (the lane’s −0.40 regraded)`]];
 rows.forEach(([k,v],i)=>{s+=text(830,230+i*20,k,'ttl','font-size="10"')+fitText(930,230+i*20,v,440,10,'txt');});
 return svg(s+titleBlock('site-plan.svg','SITE PLAN','1:400 (24 px/m)',['The building stands on the plot of Rainflower Lane, which is removed; Blue Coral and Rainflower Florist move into its ground floor.','Services come from the plaza: water main, the town’s 6.6 kV feeder pole, and the storm drain that takes the treated water.']),'Johansson Heights Minato · site plan');
}

// ---------------------------------------------------------------- A-02 ground floor
function groundPlan(){
 const S=38,p=plan(260,900,S);let s=heading(30,40,'GROUND FLOOR PLAN (1F) · FL +0.10','Shops to the plaza, the entrance hall inside the autolock, the building’s services behind.');
 s+=grid(p);
 for(const r of GROUND){s+=p.rect(r.x0,r.x1,r.z0,r.z1,r.id==='transformer-room'||r.id==='lv-room'?'zone':'t','fill="#fff"');
  const ly=r.id==='pump-room'||r.id==='transformer-room'||r.id==='lv-room'?r.z1-0.45:(r.z0+r.z1)/2;
  s+=fitText(p.X((r.x0+r.x1)/2),p.Y(ly)-2,r.name.toUpperCase(),Math.abs(r.x1-r.x0)*S-6,9,'ttl','text-anchor="middle"')+fitText(p.X((r.x0+r.x1)/2),p.Y(ly)+10,r.jp,Math.abs(r.x1-r.x0)*S-6,9,'lab','text-anchor="middle"');}
 s+=p.rect(WALKWAY.x0,WALKWAY.x1,WALKWAY.z0,WALKWAY.z1,'t','stroke-dasharray="4 3"')+text(p.X(0.6),p.Y(3.6),'COVERED WALKWAY','lab','text-anchor="middle" transform="rotate(-90 '+r2(p.X(0.6))+' '+r2(p.Y(3.6))+')"');
 // External walls (cut) round the ground floor rooms, the shop fronts glazed.
 s+=p.rect(GRID.x.B,GRID.x.C,-0.09,0.09,'cut')+p.rect(GRID.x.C-0.09,GRID.x.C+0.09,0,6*BAY,'cut')+p.rect(GRID.x.B,GRID.x.C,6*BAY-0.09,6*BAY+0.09,'cut');
 s+=line(p.X(GRID.x.B+0.3),p.Y(0),p.X(GRID.x.C-0.6),p.Y(0),'l','stroke-width="2.4" stroke="#7aa4b4"')+line(p.X(GRID.x.B),p.Y(0.2),p.X(GRID.x.B),p.Y(7.0),'l','stroke-width="2.4" stroke="#7aa4b4"');
 s+=columns(p)+core(p,{ground:true});
 // Equipment.
 const T=WATER.receivingTank,B=WATER.booster,J=DRAINAGE.johkasou;
 s+=p.rect(T.x0,T.x1,T.z0,T.z1,'fx')+line(p.X(T.x0),p.Y((T.z0+T.z1)/2),p.X(T.x1),p.Y((T.z0+T.z1)/2),'t')+text(p.X((T.x0+T.x1)/2),p.Y(T.z1)+12,`RECEIVING TANK ${T.nominal} m³`,'lab','text-anchor="middle"');
 s+=p.rect(B.x0,B.x1,B.z0,B.z1,'fx')+text(p.X((B.x0+B.x1)/2),p.Y((B.z0+B.z1)/2)+3,'BOOSTER ×2','lab','text-anchor="middle"');
 s+=p.rect(5.0,7.8,11.2,13.8,'fx')+text(p.X(6.4),p.Y(12.5),'T1 150 · T2 50 kVA','lab','text-anchor="middle"')+p.rect(1.6,3.8,13.4,14.2,'fx')+text(p.X(2.7),p.Y(13.8)+3,'LV BOARDS','lab','text-anchor="middle"');
 s+=p.rect(J.x0,J.x1,J.z0,J.z1,'fx','stroke-dasharray="3 2"')+text(p.X((J.x0+J.x1)/2),p.Y((J.z0+J.z1)/2),'TREATMENT TANK','lab','text-anchor="middle" font-size="7"')+text(p.X((J.x0+J.x1)/2),p.Y((J.z0+J.z1)/2)+10,JOHKASOU_SIZE.chosen+' persons (buried)','lab','text-anchor="middle" font-size="7"');
 for(let i=0;i<38;i++){const col=i%2,row=Math.floor(i/2);s+=p.rect(2.4+col*0.25,2.65+col*0.25,7.35+row*0.13,7.47+row*0.13,'t');}
 s+=text(p.X(2.55),p.Y(7.3)+10,'38 mailboxes','lab','text-anchor="middle"');
 // Stacks dropping to the building drain (dashed under the slab).
 for(const st of DRAINAGE.stacks)s+=`<circle class="waste" cx="${r2(p.X(st.x))}" cy="${r2(p.Y(st.z))}" r="4"/>`+poly(p.pts([[st.x,st.z],[9.75,st.z]]),'waste','stroke-dasharray="6 3"');
 s+=poly(p.pts([[9.75,DRAINAGE.stacks.at(-1).z],[9.75,J.z1]]),'waste','stroke-dasharray="6 3"');
 // Doors (arrows into each room from outside).
 const doors=[[4.8,0,'up'],[1.2,5.4,'right'],[0.6,7.2,'up'],[8.35,12.6,'left'],[8.35,16.2,'left'],[3.0,21.6,'down'],[6.4,21.6,'down'],[-1.4,14.8,'down']];
 for(const [x,z,d] of doors){const v={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]}[d];s+=line(p.X(x)-v[0]*16,p.Y(z)+v[1]*16*-1,p.X(x)+v[0]*2,p.Y(z)-v[1]*-2,'d','marker-end="url(#arr)"');}
 s+=dim(p.X(GRID.x.A),p.Y(0),p.X(GRID.x.B),p.Y(0),'1.20',-24)+dim(p.X(GRID.x.B),p.Y(0),p.X(GRID.x.C),p.Y(0),'7.15',-24)+dim(p.X(GRID.x.C),p.Y(0),p.X(GRID.x.D),p.Y(0),'1.20',-24);
 for(let i=0;i<6;i++)s+=dim(p.X(GRID.x.D+3.2),p.Y(i*BAY),p.X(GRID.x.D+3.2),p.Y((i+1)*BAY),'3.60',-12);
 s+=north(1250,90)+scaleBar(1080,150,S,5);
 // Room schedule.
 GROUND.forEach((r,i)=>{s+=text(870,230+i*30,r.name+' · '+r.jp,'ttl','font-size="9.5"')+fitText(870,242+i*30,r.use+' · door: '+r.door,500,8.5,'lab');});
 return svg(s+titleBlock('plan-1F.svg','GROUND FLOOR PLAN (1F)','1:100 (38 px/m)',['The transformer room is the utility’s, let to it, with its own door from outside; no water pipe passes over it or the electrical room.','The three stacks turn under the slab into the building drain, which runs in the east yard to the treatment tank.']),'Johansson Heights Minato · 1F plan');
}

// ---------------------------------------------------------------- A-03 typical floor
function typicalPlan(){
 const S=38,p=plan(260,900,S);let s=heading(30,40,'TYPICAL FLOOR PLAN · 2F–7F','Six flats a floor off an open corridor; the lift and stair on its west side; balconies to the sea.');
 s+=grid(p)+typicalWalls(p);
 const level=FLATS.filter(f=>f.level==='3F');
 for(const f of level){s+=flatContents(p,f);const c=flatRect(f,{u0:2.1,u1:2.1,v0:2.0,v1:2.0});
  s+=text(p.X(c.x0),p.Y(c.z0)+4,'x0'+f.bay,'ttl','text-anchor="middle" font-size="11"');}
 s+=columns(p)+core(p);
 s+=text(p.X(0.6),p.Y(3),'OPEN CORRIDOR 1.2','lab','text-anchor="middle" transform="rotate(-90 '+r2(p.X(0.6))+' '+r2(p.Y(3))+')"')+text(p.X(9.0),p.Y(3),'BALCONY','lab','text-anchor="middle" transform="rotate(-90 '+r2(p.X(9.0))+' '+r2(p.Y(3))+')"');
 s+=dim(p.X(GRID.x.A),p.Y(0),p.X(GRID.x.B),p.Y(0),'1.20',-24)+dim(p.X(GRID.x.B),p.Y(0),p.X(GRID.x.C),p.Y(0),'7.15',-24)+dim(p.X(GRID.x.C),p.Y(0),p.X(GRID.x.D),p.Y(0),'1.20',-24);
 for(let i=0;i<6;i++)s+=dim(p.X(GRID.x.D+1.6),p.Y(i*BAY),p.X(GRID.x.D+1.6),p.Y((i+1)*BAY),'3.60',-12);
 s+=north(1250,90)+scaleBar(1080,150,S,5);
 // The allocation, floor by floor.
 s+=text(870,220,'WHO LIVES WHERE','ttl','font-size="11"');
 const levels=['2F','3F','4F','5F','6F','7F'];let y=238;
 for(const lv of levels){s+=text(870,y,lv,'ttl','font-size="9.5"');y+=2;
  for(const f of FLATS.filter(f=>f.level===lv)){y+=11;const who=f.toLet?'to let':f.household.members.join(', ')+(f.connectsTo?' (connects to '+f.connectsTo+')':'');s+=fitText(890,y,f.number+' '+f.type+' · '+who,470,8.5,'lab');}
  y+=8;}
 return svg(s+titleBlock('plan-typical.svg','TYPICAL FLOOR PLAN (2F–7F)','1:100 (38 px/m)',[`Flats ${FLAT.width} × ${FLAT.depth} m inside (${FLAT_AREA.inside} m²) and a ${FLAT.balcony} m balcony. Odd flats have their shaft (PS/MB) on the north wall, even flats on the south: two flats share each shaft.`,'Balcony partitions are breakable boards (dashed); columns 600 × 600 on B and C every 7.2 m.']),'Johansson Heights Minato · typical floor plan');
}

// ---------------------------------------------------------------- A-04 roof
function roofPlan(){
 const S=38,p=plan(260,900,S);let s=heading(30,40,'ROOF PLAN · +'+ROOF.level+' m','Falls of 1/50 to two drains; the machine room and stair penthouse over the core.');
 s+=grid(p)+p.rect(GRID.x.A,GRID.x.D,0,6*BAY,'fx')+p.rect(GRID.x.A+0.15,GRID.x.D-0.15,0.15,6*BAY-0.15,'t');
 const M=ROOF.machineRoom,P=ROOF.penthouse;s+=p.rect(M.x0,M.x1,M.z0,M.z1,'cut')+p.rect(P.x0,P.x1,P.z0,P.z1,'zone');
 s+=text(p.X(-1.4),p.Y((M.z0+M.z1)/2)+3,'LIFT M/C','lab','text-anchor="middle"')+text(p.X(-1.4),p.Y((P.z0+P.z1)/2)+3,'STAIR','lab','text-anchor="middle"');
 for(const d of ROOF.drains){s+=`<circle class="rain" cx="${r2(p.X(d.x))}" cy="${r2(p.Y(d.z))}" r="6"/>`;}
 for(const [z1,z2] of [[10.8,0.6],[10.8,21.0]])s+=poly(p.pts([[4.8,z1],[7.6,z2]]),'d','marker-end="url(#arr)"');
 s+=text(p.X(4.8),p.Y(10.8)-6,'RIDGE','lab','text-anchor="middle"')+text(p.X(5.6),p.Y(5),'fall 1/50','lab')+text(p.X(5.6),p.Y(16),'fall 1/50','lab');
 for(const st of DRAINAGE.stacks)s+=`<circle class="vent" cx="${r2(p.X(st.x))}" cy="${r2(p.Y(st.z))}" r="5"/>`+text(p.X(st.x)+8,p.Y(st.z)+3,st.id+' vent','lab');
 s+=`<circle cx="${r2(p.X(ROOF.lightningRod.x))}" cy="${r2(p.Y(ROOF.lightningRod.z))}" r="4" fill="#8e3a30"/>`+text(p.X(CORE.x0)-6,p.Y(ROOF.lightningRod.z)+3,'lightning rod','lab','text-anchor="end"');
 s+=box(p.X(3.0)-4,p.Y(19.5)-4,8,8,'t')+text(p.X(3.0)+8,p.Y(19.5)+3,'TV aerial','lab');
 s+=north(1250,90)+scaleBar(1080,150,S,5)+text(870,230,'ROOF','ttl','font-size="11"');
 wrap(ROOF.note,480,9).forEach((l,i)=>s+=text(870,248+i*13,l,'lab'));
 return svg(s+titleBlock('plan-roof.svg','ROOF PLAN','1:100 (38 px/m)',['Every stack’s vent is carried 0.6 m through the roof; the roof drains go down the north and south ends to the storm drain.']),'Johansson Heights Minato · roof plan');
}

// ---------------------------------------------------------------- A-05 flat plans
function flatPlans(){
 const S=78;let s=heading(30,40,'FLAT PLANS · TYPES A AND B','Like a hotel room: a bed, a desk with its chair, a TV console, an armchair by the window; a unit bath and a kitchenette by the door.');
 const pair=[FLATS.find(f=>f.number==='301'),FLATS.find(f=>f.number==='302')]; // a mirrored pair round one shaft, A and B
 const p=plan(110-GRID.x.A*S,880,S);
 // Only bays 1 and 2: draw their walls.
 const X=GRID.x;
 s+=p.rect(X.A,X.D,0,2*BAY,'t','fill="#fff"')+p.rect(X.A,X.A+WALLS.corridorParapet,0,2*BAY,'cut');
 for(const f of pair){const door=flatRect(f,{...FLAT.door,v0:0,v1:0}),win=flatRect(f,{...FLAT.window,v0:0,v1:0}),z0=(f.bay-1)*BAY,z1=f.bay*BAY;
  s+=(z0<door.z0?p.rect(X.B-.075,X.B+.075,z0,door.z0,'cut'):'')+(door.z1<z1?p.rect(X.B-.075,X.B+.075,door.z1,z1,'cut'):'');
  s+=(z0<win.z0?p.rect(X.C-.075,X.C+.075,z0,win.z0,'cut'):'')+(win.z1<z1?p.rect(X.C-.075,X.C+.075,win.z1,z1,'cut'):'')+p.rect(X.C-.03,X.C+.03,win.z0,win.z1,'t','fill="#fff"');
  s+=`<path class="t" d="M${r2(p.X(X.B-.075-.82))},${r2(p.Y(door.z0))} A${r2(.85*S)},${r2(.85*S)} 0 0 1 ${r2(p.X(X.B-.075))},${r2(p.Y(door.z1))}"/>`+line(p.X(X.B-.075),p.Y(door.z0),p.X(X.B-.075-.82),p.Y(door.z0),'t');
  s+=flatContents(p,f,{labels:true});
  const c=flatRect(f,{u0:1.7,u1:1.7,v0:0,v1:0});s+=text(p.X(X.D)+44,p.Y(c.z0)+4,f.number+' · TYPE '+f.type,'ttl','font-size="12"');}
 for(const z of [0,BAY,2*BAY])s+=p.rect(X.B,X.C,z-.09,z+.09,'cut')+(z===BAY?line(p.X(X.C),p.Y(z),p.X(X.D),p.Y(z),'h'):p.rect(X.C,X.D,z-.09,z+.09,'cut'));
 // The connecting door between 301 and 302 (the Higas’ pair).
 const cd=FLAT.connectingDoor;s+=p.rect(X.B+.075+cd.v0,X.B+.075+cd.v1,BAY-.09,BAY+.09,'fx')+text(p.X(X.B+.075+(cd.v0+cd.v1)/2),p.Y(BAY)-6,'connecting door','lab','text-anchor="middle" font-size="8"');
 s+=COLUMNS.filter(c=>c.z<=2*BAY&&c.x>0).map(c=>p.rect(c.x-COLUMN/2,c.x+COLUMN/2,c.z-COLUMN/2,c.z+COLUMN/2,'cut')).join('');
 s+=dim(p.X(X.B+.075),p.Y(0)+20,p.X(X.C-.075),p.Y(0)+20,FLAT.depth.toFixed(2)+' clear',8)+dim(p.X(X.C+.075),p.Y(0)+20,p.X(X.D),p.Y(0)+20,FLAT.balcony.toFixed(2),8);
 s+=dim(p.X(X.D)+24,p.Y(.09),p.X(X.D)+24,p.Y(BAY-.09),FLAT.width.toFixed(2)+' clear',-8);
 s+=north(1250,90)+scaleBar(1080,150,S,2);
 // Schedule of the flat's parts.
 let y=230;s+=text(1010,y,'THE FLAT','ttl','font-size="11"');
 for(const it of [FLAT.shaft,FLAT.door,FLAT.genkan,...FLAT.fixtures,FLAT.window,FLAT.connectingDoor])for(const l of wrap('· '+it.label,360,8.5)){y+=12;s+=text(1010,y,l,'lab');}
 y+=20;s+=text(1010,y,'TYPE A (double)','ttl','font-size="10"');for(const f of FLAT.furniture.A){y+=12;s+=fitText(1010,y,'· '+f.label,360,8.5,'lab');}
 y+=18;s+=text(1010,y,'TYPE B (twin)','ttl','font-size="10"');for(const f of FLAT.furniture.B.filter(f=>!FLAT.furniture.A.some(a=>a.label===f.label))){y+=12;s+=fitText(1010,y,'· '+f.label,360,8.5,'lab');}
 y+=18;s+=fitText(1010,y,`Floor: ${FLAT_SECTION.slab*1000} slab, ${FLAT_SECTION.raisedFloor*1000} raised floor; ceiling ${FLAT_SECTION.ceiling} m; genkan step ${FLAT_SECTION.genkanStep*1000}.`,360,8.5,'lab');
 return svg(s+titleBlock('flat-plan.svg','FLAT PLANS · TYPES A AND B (301, 302)','1:50 (78 px/m)',['Flats 301 and 302 are the Higas’ connecting pair: Grandmother Higa in 301 (type A), Mrs Higa and Kenta in 302 (type B).','Every flat is one of these two, mirrored about its shaft; furniture is the hotel set, the kitchenette is the serviced-apartment addition.']),'Johansson Heights Minato · flat plans');
}

// ---------------------------------------------------------------- A-06 section and elevation
function sectionElevation(){
 let s=heading(30,40,'SECTION A–A AND WEST ELEVATION','Levels above the ground floor’s finished floor (+0.00 = GL +0.10).');
 const S=26,gx=90,gy=790,X=x=>gx+(x-CORE.x0)*S,Y=h=>gy-h*S;
 // Section through a flat: core, corridor, flat, balcony.
 for(const L of LEVELS){s+=line(X(CORE.x0)-30,Y(L.floor),X(GRID.x.D)+20,Y(L.floor),'g')+text(X(GRID.x.D)+24,Y(L.floor)+3,`${L.id} +${L.floor.toFixed(2)}`,'lab');
  if(L.id!=='R'){s+=box(X(GRID.x.A),Y(L.floor)-0.2*S/1,(GRID.x.D-GRID.x.A)*S,0.2*S,'cut');}}
 s+=box(X(CORE.x0),Y(ROOF.level+ROOF.machineRoom.height),(CORE.x1-CORE.x0)*S,(ROOF.level+ROOF.machineRoom.height)*S,'t')+box(X(CORE.x0),Y(ROOF.level)-0.2*S,(GRID.x.D-CORE.x0)*S,0.2*S,'cut');
 s+=box(X(GRID.x.A),Y(ROOF.level+ROOF.parapet),0.15*S,ROOF.parapet*S,'cut')+box(X(GRID.x.D)-0.15*S,Y(ROOF.level+ROOF.parapet),0.15*S,ROOF.parapet*S,'cut');
 for(const L of LEVELS.slice(1,7)){s+=box(X(GRID.x.B)-2,Y(L.floor+L.height),4,(L.height-0.2)*S,'cut')+box(X(GRID.x.C)-2,Y(L.floor+2.1),4,0.2*S,'t');
  s+=box(X(GRID.x.B)+3,Y(L.floor+FLAT_SECTION.raisedFloor+FLAT_SECTION.ceiling),(GRID.x.C-GRID.x.B)*S-6,FLAT_SECTION.ceiling*S,'t','stroke-dasharray="2 2"');
  s+=box(X(GRID.x.A),Y(L.floor+1.1),0.12*S,1.1*S,'cut')+box(X(GRID.x.D)-0.1*S,Y(L.floor+1.1),0.1*S,1.1*S,'t');
  // The window wall on C: a spandrel up to the sill at +0.15, the 2.0 m sash, a head wall to the slab over.
  s+=box(X(GRID.x.C)-2,Y(L.floor+L.height),4,(L.height-2.15)*S,'cut')+box(X(GRID.x.C)-1,Y(L.floor+2.15),2,2.0*S,'t','fill="#dce9ee"');}
 s+=box(X(GRID.x.B)-2,Y(LEVELS[0].height),4,LEVELS[0].height*S,'cut')+text(X(4.8),Y(1.8),'1F shops / services','lab','text-anchor="middle"');
 s+=text(X(-1.4),Y(10),'CORE','lab','text-anchor="middle" transform="rotate(-90 '+r2(X(-1.4))+' '+r2(Y(10))+')"')+text(X(4.8),Y(LEVELS[3].floor+1.3),'flat','lab','text-anchor="middle"');
 s+=dim(X(GRID.x.D)+150,Y(0),X(GRID.x.D)+150,Y(ROOF.level),ROOF.level.toFixed(2)+' to roof',-10)+dim(X(GRID.x.D)+120,Y(LEVELS[2].floor),X(GRID.x.D)+120,Y(LEVELS[3].floor),'2.90',-10)+dim(X(GRID.x.D)+120,Y(0),X(GRID.x.D)+120,Y(3.6),'3.60',-10);
 s+=line(X(CORE.x0)-40,Y(-0.1),X(GRID.x.D)+40,Y(-0.1),'l')+text(X(CORE.x0)-40,Y(-0.1)+14,'GL (town datum +0.00 = FL −0.10)','lab');
 s+=text(X(4.8),Y(-1.1),'SECTION A–A (across, through flat x03)','ttl','text-anchor="middle"');
 // West elevation: the corridor face, bays along z.
 const ex=640,EX=z=>ex+z*S,EY=Y;
 s+=box(EX(0),EY(ROOF.level+ROOF.parapet),6*BAY*S,(ROOF.level+ROOF.parapet)*S,'fx');
 for(const L of LEVELS.slice(1,7))s+=box(EX(0),EY(L.floor+1.1),6*BAY*S,0.12*S,'t','fill="#e6e0d2"')+line(EX(0),EY(L.floor+1.1),EX(6*BAY),EY(L.floor+1.1),'t');
 s+=box(EX(CORE.z0),EY(ROOF.level+ROOF.machineRoom.height),(CORE.z1-CORE.z0)*S,(ROOF.level+ROOF.machineRoom.height)*S,'zone');
 for(let i=0;i<=6;i++)s+=line(EX(i*BAY),EY(0),EX(i*BAY),EY(ROOF.level),'g');
 s+=box(EX(0.3),EY(3.0),(7.2-0.6)*S,2.6*S,'t','fill="#dce9ee"')+text(EX(3.6),EY(1.6),'BLUE CORAL · RAINFLOWER','lab','text-anchor="middle"');
 s+=text(EX(CORE.z0+3.7),EY(ROOF.level-1.2),AP.jp,'ttl','text-anchor="middle" font-size="11" transform="rotate(-90 '+r2(EX(CORE.z0+3.7))+' '+r2(EY(ROOF.level-1.2))+')"');
 s+=line(EX(ROOF.lightningRod.z),EY(ROOF.level+ROOF.machineRoom.height),EX(ROOF.lightningRod.z),EY(ROOF.level+ROOF.machineRoom.height+ROOF.lightningRod.height),'l','stroke="#8e3a30"');
 s+=line(ex-20,EY(-0.1),EX(6*BAY)+20,EY(-0.1),'l')+text(EX(10.8),EY(-1.1),'WEST ELEVATION (the corridor side, from Aoba Garden)','ttl','text-anchor="middle"');
 return svg(s+titleBlock('section-elevation.svg','SECTION A–A AND WEST ELEVATION','1:230 (26 px/m)',[`Floors ${LEVELS[1].height} m apart (slab ${FLAT_SECTION.slab}, raised floor ${FLAT_SECTION.raisedFloor}, ceiling ${FLAT_SECTION.ceiling} m); 1F ${LEVELS[0].height} m for the shops. Corridor and balcony parapets 1.10 m.`,'The open corridor’s parapet carries the building’s name at the core in Japanese: ヨハンソンハイツ港町.']),'Johansson Heights Minato · section and elevation');
}

// ---------------------------------------------------------------- P-01 water
function waterSupply(){
 let s=heading(30,40,'COLD WATER SUPPLY · RISER DIAGRAM','Town main → meter → receiving tank → booster set (duty / standby) → three risers → a meter for every flat.');
 const LY=L=>860-L.floor*34,L1=LEVELS[0];let x0=90;
 s+=poly([[x0,LY(L1)+40],[x0+80,LY(L1)+40]],'cold')+text(x0,LY(L1)+56,'town main 75 (AF1)','lab');
 s+=box(x0+80,LY(L1)+32,18,16,'fx')+text(x0+89,LY(L1)+26,'M 50','lab','text-anchor="middle"');
 s+=poly([[x0+98,LY(L1)+40],[x0+150,LY(L1)+40]],'cold')+box(x0+150,LY(L1)-10,90,64,'fx')+line(x0+195,LY(L1)-10,x0+195,LY(L1)+54,'t')+text(x0+195,LY(L1)-16,'RECEIVING TANK','lab','text-anchor="middle"')+text(x0+195,LY(L1)+68,`${WATER.receivingTank.nominal} m³ (eff. ${WATER.receivingTank.effective})`,'lab','text-anchor="middle"');
 const py=LY(L1)+30;
 for(const [i,dy] of [-14,14].entries()){s+=poly([[x0+240,py+dy],[x0+280,py+dy]],'cold')+`<circle cx="${x0+295}" cy="${py+dy}" r="11" fill="#fff" stroke="#1d2326"/><path d="M${x0+289},${py+dy-6} L${x0+303},${py+dy} L${x0+289},${py+dy+6} z" fill="#1d2326"/>`+poly([[x0+306,py+dy],[x0+340,py+dy]],'cold')+text(x0+295,py+dy+(i?26:-16),'P'+(i+1)+(i?' standby':' duty'),'lab','text-anchor="middle"');}
 s+=poly([[x0+340,py-14],[x0+340,py+14]],'cold')+poly([[x0+340,py],[x0+380,py]],'cold')+box(x0+360,py-26,14,18,'fx')+text(x0+367,py-30,'PT','lab','text-anchor="middle"');
 s+=text(x0+295,py+56,`${WATER.booster.maker} · ${WATER.booster.motor} kW each · set ${WATER.booster.discharge} MPa`,'lab','text-anchor="middle"');
 const rx=[520,700,880];s+=poly([[x0+380,py],[rx.at(-1),py]],'cold');
 for(const [i,R] of WATER.risers.entries()){const x=rx[i];s+=poly([[x,py],[x,LY(LEVELS[6])-10]],'cold')+text(x,LY(LEVELS[6])-18,R.id+' '+R.size,'ttl','text-anchor="middle" font-size="10"')+text(x,LY(LEVELS[6])-30,'shaft z '+R.z,'lab','text-anchor="middle"');
  for(const L of LEVELS.slice(1,7)){const y=LY(L);const a=FLATS.find(f=>f.level===L.id&&f.bay===2*i+1),b=FLATS.find(f=>f.level===L.id&&f.bay===2*i+2);
   for(const [k,f] of [[-1,a],[1,b]]){s+=poly([[x,y],[x+k*48,y]],'cold')+box(x+k*48-(k<0?12:0),y-6,12,12,'fx')+text(x+k*70,y+4,f.number,'lab','text-anchor="middle"');}}}
 for(const L of LEVELS.slice(0,7))s+=line(70,LY(L),980,LY(L),'g')+text(60,LY(L)+3,L.id,'lab','text-anchor="end"');
 // Calculation.
 const P=WATER_PRESSURE;let y=230;const row=(k,v)=>{s+=text(1010,y,k,'lab')+text(1370,y,v,'lab','text-anchor="end"');y+=14;};
 s+=text(1010,212,'SIZING (SHASE-S 206)','ttl','font-size="10"');
 row('People',`${WATER.people} × ${WATER.perPerson} L`);row('Shops',`${WATER.shops} × ${WATER.perShop} L`);row('Daily use',`${WATER.daily} m³/day`);
 row('Peak hour (÷ 10 h × 2)',`${WATER.peakHour} m³/h`);row('Instantaneous peak (× 4 / 60)',`${WATER.instantPeak} L/min`);
 row('Receiving tank (½ day or more)',`${WATER.receivingTank.effective} m³ effective`);y+=8;
 row('Highest outlet (7F shower)',`+${P.topOutlet} m`);row('Pressure there',`${P.top} MPa (≥ ${P.minimum})`);
 row('Lowest outlet (2F basin)',`+${P.lowOutlet} m`);row('Pressure there',`${P.low} MPa (≤ ${P.maximum})`);
 row('Pump hydraulic power at peak',`${P.pumpPower} kW (η 0.55)`);row('Motors',`${WATER.booster.motor} kW × 2`);
 y+=10;wrap('Pipes: '+WATER.pipe+'. Flat branch '+WATER.flatBranch+' with a '+WATER.meter+' meter and stop valve in the shaft.',360,8.5).forEach(l=>{s+=text(1010,y,l,'lab');y+=12;});
 return svg(s+titleBlock('water-supply.svg','COLD WATER SUPPLY · RISER DIAGRAM','NTS',['Two pumps, each able to carry the peak, alternate on every start; the pressure tank keeps them from cycling at night.','The tank’s overflow and drain go to the floor gully through an air break, never straight to a drain.']),'Johansson Heights Minato · water supply');
}

// ---------------------------------------------------------------- P-02 drainage
function drainage(){
 let s=heading(30,40,'SOIL, WASTE AND VENT · RISER DIAGRAM','Three stacks, each vented through the roof, into the building drain and the treatment tank; rain kept apart.');
 const LY=L=>790-L.floor*31;const sx=[240,440,640];
 for(const L of LEVELS)s+=line(70,LY(L),900,LY(L),'g')+text(60,LY(L)+3,L.id,'lab','text-anchor="end"');
 for(const [i,St] of DRAINAGE.stacks.entries()){const x=sx[i];
  s+=poly([[x,LY(LEVELS[0])+30],[x,LY(LEVELS[7])]],'waste')+poly([[x,LY(LEVELS[7])],[x,LY(LEVELS[7])-30]],'vent')+text(x,LY(LEVELS[7])-36,St.id+' '+St.size,'ttl','text-anchor="middle" font-size="10"');
  for(const L of LEVELS.slice(1,7)){const y=LY(L)+8;s+=poly([[x-60,y-12],[x,y]],'waste')+poly([[x+60,y-12],[x,y]],'waste');
   const a=FLATS.find(f=>f.level===L.id&&f.bay===2*i+1),b=FLATS.find(f=>f.level===L.id&&f.bay===2*i+2);s+=text(x-64,y-14,a.number,'lab','text-anchor="end"')+text(x+64,y-14,b.number,'lab');}
  s+=text(x+6,LY(LEVELS[0])+20,`${St.units} DFU (limit ${St.limit})`,'lab');}
 const by=LY(LEVELS[0])+30;s+=poly([[sx[0],by],[720,by]],'waste')+text(440,by+16,`building drain ${DRAINAGE.buildingDrain.size} at ${DRAINAGE.buildingDrain.fall}, under the slab, to the east yard`,'lab','text-anchor="middle"');
 s+=box(720,by-24,90,48,'fx')+text(765,by-2,'TREATMENT','lab','text-anchor="middle"')+text(765,by+10,`TANK ${JOHKASOU_SIZE.chosen} p`,'lab','text-anchor="middle"')+poly([[810,by],[880,by]],'waste')+text(820,by+18,'→ storm drain','lab');
 s+=box(120,by-50,40,20,'fx')+text(140,by-36,'GT','lab','text-anchor="middle"')+poly([[160,by-40],[sx[0]-10,by-40],[sx[0],by]],'waste')+text(100,by-56,'Blue Coral sink','lab');
 s+=poly([[110,by-14],[sx[0],by]],'waste')+text(106,by-10,'Florist sink','lab','text-anchor="end"');
 // Rain, separately.
 s+=poly([[830,LY(LEVELS[7])],[830,by-50]],'rain')+text(834,LY(LEVELS[7])+14,'RWP 100 (roof)','lab')+poly([[880,LY(LEVELS[6])],[880,by-50]],'rain')+text(884,LY(LEVELS[6])+14,'RWP 75 (balconies)','lab')+text(855,by-36,'→ storm drain','lab','text-anchor="middle"');
 let y=230;s+=text(1000,212,'DRAINAGE FIXTURE UNITS (IPC table)','ttl','font-size="10"');
 for(const [k,v] of Object.entries(DRAINAGE.fixtureUnits)){s+=text(1000,y,k,'lab')+text(1370,y,v,'lab','text-anchor="end"');y+=13;}
 s+=text(1000,y,'per flat','ttl','font-size="9"')+text(1370,y,DRAINAGE.perFlat,'ttl','text-anchor="end" font-size="9"');y+=22;
 s+=text(1000,y,'TREATMENT TANK (JIS A 3302)','ttl','font-size="10"');y+=16;
 for(const [k,v] of [['Flats’ floor area',JOHKASOU_SIZE.flatArea+' m² × 0.05'],['Shops’ floor area',JOHKASOU_SIZE.shopArea+' m² × 0.075'],['Persons',JOHKASOU_SIZE.persons],['Chosen',JOHKASOU_SIZE.chosen+'-person tank']]){s+=text(1000,y,k,'lab')+fitText(1370,y,v,240,9,'lab','text-anchor="end"');y+=13;}
 y+=10;for(const l of wrap(DRAINAGE.johkasou.kind+'. '+DRAINAGE.shops+' '+DRAINAGE.rain.balconies+'.',370,8.5)){s+=text(1000,y,l,'lab');y+=12;}
 return svg(s+titleBlock('drainage.svg','SOIL, WASTE AND VENT · RISER DIAGRAM','NTS',['Soil and waste in one stack (合流式), each with its own vent carried through the roof (伸頂通気).','Treated water to the storm drain (BOD 20 mg/L or less); the treatment tank’s blowers run on the building supply.']),'Johansson Heights Minato · drainage');
}

// ---------------------------------------------------------------- P-03 flat plumbing, E-02 flat electrical
/** A single flat drawn large (flat 301, shaft to the north), for the services sheets. */
function bigFlat(S,ox,oy){
 const f=FLATS.find(f=>f.number==='301'),p=plan(ox,oy,S),X=GRID.x;let s='';
 s+=p.rect(X.A,X.D,0,BAY,'t','fill="#fff"');
 const door=flatRect(f,{...FLAT.door,v0:0,v1:0}),win=flatRect(f,{...FLAT.window,v0:0,v1:0});
 s+=p.rect(X.B-.075,X.B+.075,0,door.z0,'cut')+p.rect(X.B-.075,X.B+.075,door.z1,BAY,'cut')+p.rect(X.C-.075,X.C+.075,0,win.z0,'cut')+p.rect(X.C-.075,X.C+.075,win.z1,BAY,'cut')+p.rect(X.C-.03,X.C+.03,win.z0,win.z1,'t','fill="#fff"');
 s+=p.rect(X.B,X.D,-.09,.09,'cut')+p.rect(X.B,X.C,BAY-.09,BAY+.09,'cut')+line(p.X(X.C),p.Y(BAY),p.X(X.D),p.Y(BAY),'h');
 s+=flatContents(p,f,{labels:false});
 // Flat coordinates → page.
 const at=(u,v)=>{const r=flatRect(f,{u0:u,u1:u,v0:v,v1:v});return [p.X(r.x0),p.Y(r.z0)];};
 return {s,at,p,f};
}
function flatPlumbing(){
 const {s:base,at}=bigFlat(92,120,620);let s=heading(30,40,'FLAT PLUMBING PLAN · flat 301 (all flats alike, mirrored)','Pipes under the 150 mm raised floor; none under the genkan, which is at slab level.')+base;
 const draw=(runs,cls)=>runs.map(run=>`<path class="${cls}" d="M${run.map(([u,v])=>at(u,v).map(r2).join(',')).join(' L')}"/>`).join('');
 s+=draw(FLAT_PIPES.cold.runs,'cold')+draw(FLAT_PIPES.hot.runs,'hot')+draw(FLAT_PIPES.waste.runs,'waste');
 const [sx,sy]=at(0.2,0.25);s+=`<circle cx="${r2(sx)}" cy="${r2(sy)}" r="7" fill="#fff" stroke="#7a5230" stroke-width="2"/>`+text(sx,sy-12,'SS 100A + WR 40A','lab','text-anchor="middle"');
 let y=200;s+=text(1000,y,'LEGEND','ttl','font-size="10"');
 for(const [cls,k,v] of [['cold','Cold water',FLAT_PIPES.cold.size],['hot','Hot water',FLAT_PIPES.hot.size],['waste','Soil and waste',FLAT_PIPES.waste.size]]){y+=18;s+=line(1000,y-4,1040,y-4,cls)+text(1050,y,k+' · '+v,'lab');}
 y+=26;s+=text(1000,y,'FIXTURES','ttl','font-size="10"');
 for(const f of FLAT.fixtures.filter(f=>f.wet||f.id==='water-heater')){y+=14;s+=fitText(1000,y,'· '+f.label,370,8.5,'lab');}
 y+=22;s+=text(1000,y,'WATER HEATER','ttl','font-size="10"');y+=14;
 s+=fitText(1000,y,`${HEATER.litres} L, ${HEATER.from}→${HEATER.to} °C needs ${HEATER.needs} kWh; ${HEATER.kw} kW × ${HEATER.hours} h night gives ${HEATER.gives} kWh.`,370,8.5,'lab');
 y+=14;s+=fitText(1000,y,FLAT_PIPES.relief,370,8.5,'lab');
 return svg(s+titleBlock('flat-plumbing.svg','FLAT PLUMBING PLAN','1:40 (92 px/m)',['Waste falls 1/50 to the stack; the longest run (the kitchenette) is 3.9 m and drops 78 mm inside the 150 mm floor void.','The shaft holds the flat’s 20 mm meter and stop valve, read from the corridor without entering the flat.']),'Johansson Heights Minato · flat plumbing');
}
function flatElectrical(){
 const {s:base,at}=bigFlat(92,120,620);let s=heading(30,40,'FLAT ELECTRICAL PLAN · flat 301','The board in the genkan; lights, sockets and outlets by circuit; a heat detector on the ceiling.')+base;
 const colour=c=>({1:'#c07a12',2:'#1f5fa8',3:'#2f6f74',4:'#8e3a30',5:'#6a4c9c',6:'#2d7a3a',7:'#5c6366',night:'#b8322a'})[c]||'#1d2326';
 const [bx,by]=at(FLAT_ELECTRIC[0].u,FLAT_ELECTRIC[0].v);
 for(const e of FLAT_ELECTRIC){const [x,y]=at(e.u,e.v),c=colour(e.circuit);
  if(e.circuit!=null)s+=`<path d="M${r2(bx)},${r2(by)} Q${r2((bx+x)/2+20)},${r2((by+y)/2)} ${r2(x)},${r2(y)}" fill="none" stroke="${c}" stroke-width=".8" stroke-dasharray="4 2"/>`;
  if(e.kind==='board')s+=box(x-9,y-6,18,12,'l','fill="#1d2326"');
  else if(e.kind==='light')s+=`<circle cx="${r2(x)}" cy="${r2(y)}" r="7" fill="#fff" stroke="${c}" stroke-width="1.4"/><path d="M${r2(x-5)},${r2(y-5)} L${r2(x+5)},${r2(y+5)} M${r2(x+5)},${r2(y-5)} L${r2(x-5)},${r2(y+5)}" stroke="${c}"/>`;
  else if(e.kind==='socket')s+=`<circle cx="${r2(x)}" cy="${r2(y)}" r="6" fill="#fff" stroke="${c}" stroke-width="1.4"/><path d="M${r2(x-3)},${r2(y)} L${r2(x+3)},${r2(y)}" stroke="${c}" stroke-width="1.4"/>`;
  else if(e.kind==='outlet')s+=box(x-6,y-6,12,12,'l',`fill="#fff" stroke="${c}"`)+text(x,y+3,'□','lab','text-anchor="middle" font-size="7"');
  else if(e.kind==='switch')s+=`<circle cx="${r2(x)}" cy="${r2(y)}" r="4" fill="#1d2326"/>`+line(x,y,x+8,y-8,'t');
  else if(e.kind==='detector')s+=`<circle cx="${r2(x)}" cy="${r2(y)}" r="8" fill="#fff" stroke="#c0281e" stroke-width="1.4"/>`+text(x,y+3,'H','lab','text-anchor="middle" font-size="8" fill="#c0281e"');
  else s+=box(x-5,y-7,10,14,'t','fill="#fff"');}
 let y=180;s+=text(1000,y,'FLAT BOARD','ttl','font-size="10"');y+=14;
 for(const l of [FLAT_BOARD.location,FLAT_BOARD.supply,FLAT_BOARD.main]){s+=fitText(1000,y,l,370,8.5,'lab');y+=13;}
 y+=6;for(const c of [...FLAT_BOARD.circuits,{n:'N',...FLAT_BOARD.night}]){s+=line(1000,y-3,1018,y-3,'l',`stroke="${colour(c.n==='N'?'night':c.n)}" stroke-width="2"`)+fitText(1024,y,`${c.n}. ${c.name} · ${c.volts} V · ${c.breaker} A · ${c.cable}`,350,8.5,'lab');y+=14;}
 y+=14;s+=text(1000,y,'POINTS','ttl','font-size="10"');
 for(const e of FLAT_ELECTRIC){y+=12;s+=fitText(1000,y,'· '+e.label+(e.circuit!=null?' (circuit '+e.circuit+')':''),370,8,'lab');}
 return svg(s+titleBlock('flat-electrical.svg','FLAT ELECTRICAL PLAN','1:40 (92 px/m)',['Cables run in the ceiling void and down in the walls; sockets in the kitchenette, unit bath and washer place are earthed and on the 30 mA earth-leakage breaker.','The water heater is on its own night-rate meter in the shaft, switched by the utility’s time switch.']),'Johansson Heights Minato · flat electrical');
}

// ---------------------------------------------------------------- E-01 single line
function singleLine(){
 let s=heading(30,40,'ELECTRICAL SINGLE-LINE DIAGRAM','6,600 V from the town’s feeder to the utility’s transformer room; 210/105 V to the flats, 210 V three-phase to the lift, pumps and shops.');
 const E=ELECTRICAL,x=160;
 s+=text(x,110,'TOWN 6.6 kV FEEDER','ttl','text-anchor="middle"')+poly([[x,118],[x,160]],'hv')+box(x-14,160,28,24,'fx')+text(x+22,176,'PAS (pole switch) · '+E.hv.from,'lab');
 s+=poly([[x,184],[x,260]],'hv')+text(x+8,225,E.hv.cable+', '+E.hv.length+' m','lab');
 s+=box(x-120,260,560,190,'h')+text(x-114,274,'UTILITY TRANSFORMER ROOM (借室電気室) · the utility’s','lab');
 s+=box(x-14,282,28,22,'fx')+text(x+22,297,'LBS + fuses, VCT (utility’s metering)','lab')+poly([[x,304],[x,330],[x-60,330],[x-60,360]],'hv')+poly([[x,330],[x+200,330],[x+200,360]],'hv');
 for(const [i,T] of E.transformers.entries()){const tx=i?x+200:x-60;s+=`<circle cx="${tx}" cy="372" r="12" class="l" fill="#fff"/><circle cx="${tx}" cy="390" r="12" class="l" fill="#fff"/>`+text(tx+18,384,`${T.id} ${T.kva} kVA · ${T.kind}`,'lab')+text(tx+18,396,T.feeds,'lab');}
 // LV boards.
 s+=box(x-120,470,780,40,'fx')+text(x-114,486,'LV BOARD (1φ3W 210/105 V) · electrical room','ttl','font-size="9"')+poly([[x-60,402],[x-60,470]],'pw');
 s+=box(x+680,470,300,40,'fx')+text(x+686,486,'POWER BOARD (3φ 210 V)','ttl','font-size="9"')+poly([[x+200,402],[x+200,440],[x+760,440],[x+760,470]],'pw');
 const risers=E.risers;risers.forEach((R,i)=>{const rx=x-60+i*190;s+=poly([[rx,510],[rx,700]],'pw')+text(rx+6,530,`${R.id} MCCB ${R.breaker} A`,'lab')+text(rx+6,542,`${R.cable} · ${R.amps} A`,'lab')+text(rx+6,554,`drop ${R.drop} V (40 m)`,'lab');
  for(let k=0;k<6;k++){const y=580+k*20;s+=line(rx,y,rx+30,y,'pw')+box(rx+30,y-6,16,12,'fx')+text(rx+50,y+4,`${7-k}F: ${7-k}0${2*i+1}, ${7-k}0${2*i+2}`,'lab');}
  const nx=rx+110;s+=poly([[nx,510],[nx,560]],'pw','stroke-dasharray="5 3"')+text(nx+4,570,`night ${R.night.breaker} A`,'lab');});
 s+=box(x-120,520,0,0,'t');
 const loads=E.common.filter(c=>c.phase===3);loads.forEach((c,i)=>{const y=540+i*22;s+=line(x+700,510,x+700,y,'pw')+line(x+700,y,x+730,y,'pw')+text(x+734,y+4,c.name+' · '+c.kva+' kVA','lab');});
 s+=text(x+700,650,'Common lighting, alarm, intercom, tank blowers: 1φ circuits on the LV board','lab');
 // Flat board.
 s+=box(x-120,720,560,110,'t')+text(x-114,734,'EACH FLAT (in its shaft and genkan)','ttl','font-size="9"');
 s+=text(x-110,752,'meter (utility) → '+FLAT_BOARD.main,'lab')+text(x-110,766,FLAT_BOARD.circuits.map(c=>c.n+' '+c.name.split(':')[0].split(' (')[0]).join(' · '),'lab','style="font-size:8px"');
 s+=text(x-110,780,'night-rate meter + time switch → water heater '+HEATER.kw+' kW','lab');
 // Load summary.
 let y=200;const row=(k,v)=>{s+=text(1000,y,k,'lab')+text(1370,y,v,'lab','text-anchor="end"');y+=14;};
 s+=text(1000,182,'MAXIMUM DEMAND','ttl','font-size="10"');
 row('Flats',`${FLATS.length} × ${E.flatKva} kVA × ${E.demandFactor}`);row('Day, single-phase',`${E.dayOnePhase} kVA`);
 row('Night (heaters + 30 % of day)',`${E.nightOnePhase} kVA`);row('T1 single-phase',`${E.transformers[0].kva} kVA ✓`);
 row('Three-phase loads',`${E.threePhase} kVA`);row('T2 three-phase',`${E.transformers[1].kva} kVA ✓`);
 y+=10;for(const l of wrap(E.earthing,370,8.5)){s+=text(1000,y,l,'lab');y+=12;}
 return svg(s+titleBlock('single-line.svg','ELECTRICAL SINGLE-LINE DIAGRAM','NTS',['Voltage drop on a riser at full demand is under 1 V of 210 V. Night-rate risers run separately to the shafts’ night meters.','The demand factor for the flats is assumed (finding AF2).']),'Johansson Heights Minato · single line');
}

// ---------------------------------------------------------------- F-01 fire and escape
function fireEscape(){
 const S=38,p=plan(260,900,S);let s=heading(30,40,'FIRE SAFETY AND ESCAPE · typical floor','Two ways out of every flat: the door to the corridor and stair, and the balcony to the neighbour or the hatch below.');
 s+=grid(p)+typicalWalls(p)+columns(p)+core(p);
 for(let bay=1;bay<=6;bay++){const d=flatRect({bay},{...FLAT.door,v0:0,v1:0}),z=(d.z0+d.z1)/2;s+=poly(p.pts([[GRID.x.B+0.4,z],[0.6,z],[0.6,CORE.stairDoor.z],[0,CORE.stairDoor.z]]),'fire','marker-end="url(#arr)"');}
 s+=poly(p.pts([[8.9,1.8],[8.9,19.8]]),'fire','stroke-dasharray="6 4" marker-start="url(#arr)" marker-end="url(#arr)"')+text(p.X(9.2),p.Y(11),'balcony escape route','lab','fill="#c0281e" transform="rotate(-90 '+r2(p.X(9.2))+' '+r2(p.Y(11))+')"');
 const h=flatRect({bay:5},{u0:2.4,u1:3.1,v0:7.15,v1:7.75});s+=p.rect(h.x0,h.x1,h.z0,h.z1,'fx','stroke="#c0281e"')+text(p.X(h.x1)+4,p.Y(h.z1)-2,'hatch','lab','fill="#c0281e"');
 s+=`<circle cx="${r2(p.X(-0.2))}" cy="${r2(p.Y(13.4))}" r="6" fill="#c0281e"/>`+text(p.X(-0.2)-8,p.Y(13.4)+3,'dry riser','lab','text-anchor="end" fill="#c0281e"');
 s+=box(p.X(0.2)-5,p.Y(11.0)-5,10,10,'l','fill="#c0281e"')+text(p.X(0.2)+8,p.Y(11.0)+3,'extinguisher','lab','fill="#c0281e"');
 s+=north(1250,90)+scaleBar(1080,150,S,5);
 let y=220;s+=text(870,y,'PROVISIONS','ttl','font-size="11"');
 for(const [k,v] of [['Walking distance',`farthest flat door to the stair ${ESCAPE_DISTANCE} m (limit ${ESCAPE.limit} m)`],['Balconies',ESCAPE.partitions],['Hatches',ESCAPE.balconyHatches],['Connecting water pipe',ESCAPE.dryRiser],['Fire alarm',ESCAPE.alarm],['Extinguishers',ESCAPE.extinguishers],['Lights',ESCAPE.lights]]){
  y+=18;s+=text(870,y,k,'ttl','font-size="9.5"');for(const l of wrap(v,490,8.5)){y+=12;s+=text(870,y,l,'lab');}}
 return svg(s+titleBlock('fire-escape.svg','FIRE SAFETY AND ESCAPE','1:100 (38 px/m)',['The stair is the one way down; the balconies give every flat a second way out (Building Standards Act Order art. 121).','Every flat’s door is a fire door to the corridor; the stair door closes by itself.']),'Johansson Heights Minato · fire and escape');
}

// ---------------------------------------------------------------- schedules
function flatsSchedule(){
 let md='# Johansson Heights Minato · flat schedule\n\nGenerated by `node tools/apartment-drawings.mjs` from `src/world/minato-apartments.js`. Do not edit.\n\n';
 md+='| Flat | Floor | Type | Shaft wall | Who | Moved from | Connects to | Escape hatch |\n|---|---|---|---|---|---|---|---|\n';
 for(const f of FLATS)md+=`| ${f.number} | ${f.level} | ${f.type} | ${f.shaftWall} | ${f.toLet?'to let':f.household.members.join(', ')} | ${f.household?.from||'—'} | ${f.connectsTo||'—'} | ${f.hatch?'yes':'—'} |\n`;
 md+=`\n${RESIDENTS.length} residents in ${FLATS.filter(f=>!f.toLet).length} flats; ${FLATS.filter(f=>f.toLet).length} to let.\n\nHomes that empty: ${LEFT_HOMES.join(', ')}.\n`;
 return md;
}
function readme(){
 let md=`# ${AP.name} (${AP.jp})\n\nThe port town's apartment block, on the plot Rainflower Lane leaves. Built ${AP.built} by ${AP.builder} (${AP.builderJp}).\n\n`;
 md+='The creator (2026-10-13): "Remove rain flower lane, I want the citizens at the port town live in apartments for now. I want a cad drawing for the apartment complex so you know what to build, it should be a realistic apartment complex with plumbing and sewage and electrical wiring each apartment should be big like a hotel room for now and they should look like hotel rooms with a desk". Then: the lane’s shops on the ground floor, everyone in Minato moves in, a kitchenette in every flat.\n\n';
 md+='Every sheet and table here is generated from `src/world/minato-apartments.js` by `node tools/apartment-drawings.mjs`; `tests/apartment-design-book.test.mjs` fails when a sheet is stale or a check fails. Change the data, run the tool, commit the sheets.\n\n## Particulars\n\n';
 md+=`| | |\n|---|---|\n| Plot | x ${AP.site.minX}…${AP.site.maxX}, z ${AP.site.minZ}…${AP.site.maxZ} (world); building origin (${AP.origin.x}, ${AP.origin.z}) |\n| Structure | ${AP.structure} |\n| Storeys | ${AP.storeys}: 1F ${LEVELS[0].height} m, 2F–7F ${LEVELS[1].height} m; roof +${ROOF.level} m |\n| Footprint | ${r2(GRID.x.D-CORE.x0)} × ${6*BAY} m (core ${r2(CORE.x1-CORE.x0)} × ${r2(CORE.z1-CORE.z0)} m on the west) |\n| Flats | ${FLATS.length}, each ${FLAT.width} × ${FLAT.depth} m inside (${FLAT_AREA.inside} m²) + ${FLAT_AREA.balcony} m² balcony |\n| People | ${RESIDENTS.length} |\n| Ground floor | ${GROUND.map(g=>g.name).join(', ')} |\n| Lift | ${CORE.lift.maker}: ${CORE.lift.car}, ${CORE.lift.stops} stops |\n| Water | ${WATER.daily} m³/day; tank ${WATER.receivingTank.nominal} m³; booster ${WATER.booster.pumps} × ${WATER.booster.motor} kW at ${WATER.booster.discharge} MPa |\n| Drainage | 3 stacks 100A vented through the roof; ${JOHKASOU_SIZE.chosen}-person treatment tank |\n| Electricity | 6.6 kV; T1 ${ELECTRICAL.transformers[0].kva} kVA 1φ, T2 ${ELECTRICAL.transformers[1].kva} kVA 3φ; 30 A a flat |\n\n## Sheets\n\n| No. | Sheet | File |\n|---|---|---|\n`;
 for(const [n,f,t] of SHEET_LIST)md+=`| JC-H01-${n} | ${t} | [${f}](${f}) |\n`;
 md+='| | Flat schedule (who lives where) | [flats.md](flats.md) |\n\n## Findings and open points\n\n';
 for(const f of FINDINGS)md+=`- **${f.id}** (${f.open?'open':'closed'}): ${f.text}\n`;
 md+='\n## What the build batch changes in the town\n\nPlanned before building (CLAUDE.md: plan a change before making it):\n\n';
 for(const l of ['Rainflower Lane goes: `shopping-lane.js`, `shopping-lane-plan.js` (routes, ground height, landmark), its colliders, power poles and vending machine; `coastal-ground.js`, `park-access.js`, `island-plan.js`, `island-landscape.js`, `town.js` and `island/play.js` stop calling it; Aoba Garden’s residential walk is rerouted round the building.',
  'Blue Coral and Rainflower Florist move into 1F with their owners, stock, routines and supply accounts (`flower-shop.js`, `blue-coral-shop.js`, `neighbours.js`, `commerce/merchandising.js`); Vy’s after-school stop moves to Blue Coral’s new counter.',
  'Every Minato household moves to its flat (`island-households.js`, `residents.js`, `households.js`, `home-life.js`, `schedules.js`): routines go home to the building’s entrance, then the lift, then their door. A new interior for the flats from this data.',
  'The emptied houses (`LEFT_HOMES`) stay standing but empty, or are removed; the creator to say. Removing the Okinawan quarters’ houses is also the biggest loading saving (26 MB of geometry).',
  'Tests, the feed’s places, the guide, the photo spot and the tools that name the lane are moved to the building; every comic and film shot of the lane is listed by `remotion/tools/impact.py` before it changes.'])md+='- '+l+'\n';
 return md;
}

export function build(){
 return {
  'site-plan.svg':sitePlan(),'plan-1F.svg':groundPlan(),'plan-typical.svg':typicalPlan(),'plan-roof.svg':roofPlan(),
  'flat-plan.svg':flatPlans(),'section-elevation.svg':sectionElevation(),'water-supply.svg':waterSupply(),'drainage.svg':drainage(),
  'flat-plumbing.svg':flatPlumbing(),'single-line.svg':singleLine(),'flat-electrical.svg':flatElectrical(),'fire-escape.svg':fireEscape(),
  'flats.md':flatsSchedule(),'README.md':readme(),
 };
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const files=build(),check=process.argv.includes('--check');mkdirSync(OUT,{recursive:true});let stale=0;
 for(const [name,body] of Object.entries(files)){const p=join(OUT,name);if(check){if(!existsSync(p)||readFileSync(p,'utf8')!==body){console.error('stale: docs/minato-apartments/'+name);stale++;}}else{writeFileSync(p,body);console.log('wrote docs/minato-apartments/'+name);}}
 if(check){console.log(stale?stale+' sheet(s) differ from the data: run node tools/apartment-drawings.mjs':'sheets match the data');process.exit(stale?1:0);}
}
