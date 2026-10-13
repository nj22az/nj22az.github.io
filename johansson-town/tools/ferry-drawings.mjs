#!/usr/bin/env node
/**
 * The Minato Maru's design book (docs/minato-maru/), drawn from her data, so that the drawings and the game are one ship
 * (the creator, 2026-10-12: "Be a naval ship architect and build the ferry as a real ferry would be built and make
 * drawings, one should be able to build a real ferry from our documentation").
 *
 *   node tools/ferry-drawings.mjs            writes the drawings and tables
 *   node tools/ferry-drawings.mjs --check    exits 1 if a committed drawing differs from the data (CI)
 *
 * Frames: shipyard z metres forward of the transom (station 0 at the transom), y above the base line (keel), x half-breadth.
 * The hull is ferry-model.js's loft (sectionPoint, keelY, deckEdge, halfBreadth), in the model's frame (origin amidships
 * on the laden waterline); everything here converts to the shipyard's.
 */
import {writeFileSync,readFileSync,existsSync,mkdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {FERRY_SHIP,FERRY_HEIGHTS,FERRY_GA,FERRY_MACHINERY,FERRY_ELECTRICS,FERRY_LOADS,FERRY_CONDITIONS,FERRY_SAFETY,FERRY_MANNING} from '../src/world/ferry-ship.js';
import {sectionPoint,keelY,deckEdge,bulwarkTop,halfBreadth,hullX} from '../src/world/ferry-model.js';
import {FERRY_INTERIOR,FERRY_ENGINE_ROOM} from '../src/world/ferry-interior.js';
import {JOHANSSON_MARINE} from '../src/world/johansson-marine.js';
import {drawSafetyPlan,svgPen} from '../src/world/ferry-safety-plan.js';
import {installDOM} from '../tests/fixtures.mjs';
installDOM();

const OUT=join(dirname(fileURLToPath(import.meta.url)),'..','docs','minato-maru');
const SH=FERRY_SHIP,H=FERRY_HEIGHTS,L=SH.length,HALF=L/2,B=SH.beam,T=SH.draft,RHO=1.025;
const toModel=z=>z-HALF,fromModel=z=>z+HALF,keelAbove=y=>y+T; // model y → above base line
const r2=n=>Math.round(n*100)/100,r3=n=>Math.round(n*1000)/1000,r1=n=>Math.round(n*10)/10;

// ---------------------------------------------------------------- the hull, sampled
/** The section at shipyard z as [x, yAboveKeel] from the keel (θ 0) to the deck edge (θ π/2), y increasing. */
export function section(z,n=72){
 const zm=toModel(z),pts=[];
 for(let i=0;i<=n;i++){const [x,y]=sectionPoint(zm,Math.PI/2*i/n);pts.push([x,keelAbove(y)]);}
 return pts;
}
/** Half-breadth at height y above the keel. */
export const breadthAt=(z,y)=>hullX(y-T,toModel(z));
/** Section area, vertical moment about the keel and the waterline half-breadth, cut at draft t (above keel). */
export function sectionAt(z,t){
 const pts=section(z);let area=0,moment=0;
 for(let i=0;i<pts.length-1;i++){
  let [x0,y0]=pts[i],[x1,y1]=pts[i+1];if(y0>=t)break;
  if(y1>t){x1=x0+(x1-x0)*(t-y0)/(y1-y0);y1=t;}
  const dy=y1-y0,xm=(x0+x1)/2;area+=2*xm*dy;moment+=2*xm*dy*((y0+y1)/2);
 }
 const k=pts[0][1],b=t>k?breadthAt(z,t):0;
 return {area,moment,b,keel:k};
}
/** Simpson's rule over equal stations. */
function simpson(ys,h){let s=ys[0]+ys[ys.length-1];for(let i=1;i<ys.length-1;i++)s+=ys[i]*(i%2?4:2);return s*h/3;}
/** The hydrostatics at a draft: the real naval architect's table, from the loft. */
export function hydrostatics(t,N=100){
 const h=L/N,zs=Array.from({length:N+1},(_,i)=>i*h),secs=zs.map(z=>sectionAt(z,t));
 const A=secs.map(s=>s.area),Mz=A.map((a,i)=>a*zs[i]),Mv=secs.map(s=>s.moment),b=secs.map(s=>s.b);
 const vol=simpson(A,h),lcb=vol?simpson(Mz,h)/vol:0,kb=vol?simpson(Mv,h)/vol:0;
 const awp=simpson(b.map(x=>2*x),h),lcf=awp?simpson(b.map((x,i)=>2*x*zs[i]),h)/awp:0;
 const it=simpson(b.map(x=>2/3*x**3),h),il=simpson(b.map((x,i)=>2*x*(zs[i]-lcf)**2),h);
 const wl=zs.filter((z,i)=>b[i]>0),lwl=wl.length?wl[wl.length-1]-wl[0]:0,amax=Math.max(...A),bwl=2*Math.max(...b);
 const bmT=vol?it/vol:0,bmL=vol?il/vol:0;
 return {draft:t,volume:vol,displacement:vol*RHO,lcb,kb,bmT,kmT:kb+bmT,bmL,awp,lcf,tpc:awp*RHO/100,lwl,bwl,
  cb:vol/(lwl*bwl*(t-Math.min(...secs.map(s=>s.keel)))),cp:vol/(amax*lwl),cwp:awp/(lwl*bwl),cm:amax/(bwl*(t-sectionAt(HALF,t).keel)),
  mct:vol*RHO*bmL/(100*L)};
}

// ---------------------------------------------------------------- SVG helpers: the yard's sheet
// Every sheet is framed like a yard drawing: a border with zone marks (A–H across, 1–6 down), a title block at the
// bottom right as a grid (yard, ship and hull number, title, drawing number, scale, sheet, date, drawn/checked/
// approved, revision), the notes in a box over it, wrapped to fit. Nothing is allowed to run out of its box: `fit`
// shrinks a text to its width, `wrap` breaks notes into lines.
const DRAWING_NO={1:'JS-127-01',2:'JS-127-02',3:'JS-127-03',5:'JS-127-05',6:'JS-127-06'};
const CHAR=.56; // average character width as a fraction of the font size (Helvetica)
/** CJK characters are a full em wide; the rest about 0.56 em. */
export const textWidth=(s,size)=>[...String(s)].reduce((w,c)=>w+(c.charCodeAt(0)>0x2e80?1:CHAR)*size,0);
/** The font size at which `s` fits `width` px, at most `size`. */
export const fit=(s,width,size)=>Math.min(size,size*width/Math.max(1,textWidth(s,size)));
/** Breaks `s` into lines of at most `width` px at `size`. */
export function wrap(s,width,size){const words=String(s).split(' '),lines=[];let line='';for(const w of words){const t=line?line+' '+w:w;if(textWidth(t,size)>width&&line){lines.push(line);line=w;}else line=t;}if(line)lines.push(line);return lines;}
const svg=(w,h,body,title)=>`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" font-family="Helvetica, Arial, sans-serif" font-size="11">
<title>${title}</title><rect width="${w}" height="${h}" fill="#fbfaf6"/>
<style>.l{fill:none;stroke:#1d2326;stroke-width:1.1}.t{fill:none;stroke:#1d2326;stroke-width:.45}.g{fill:none;stroke:#9aa3a6;stroke-width:.4;stroke-dasharray:3 3}.wl{fill:none;stroke:#2f6f74;stroke-width:.8;stroke-dasharray:6 3}.c{fill:none;stroke:#8e3a30;stroke-width:.6;stroke-dasharray:1 3}.d{fill:none;stroke:#1d2326;stroke-width:.5}.txt{fill:#1d2326}.sp{fill:#eef1ee;stroke:#1d2326;stroke-width:.7}.lab{fill:#1d2326;font-size:8.5}.ttl{fill:#1d2326;font-size:14;font-weight:bold}.sub{fill:#4a5457;font-size:10}.hatch{fill:url(#hatch);stroke:#1d2326;stroke-width:.7}</style>
<defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="6" stroke="#1d2326" stroke-width=".6"/></pattern><marker id="arr" viewBox="0 0 10 10" refX="10" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse"><path d="M0,1 L10,5 L0,9 z" fill="#1d2326"/></marker></defs>
${frame(w,h)}${body}</svg>`;
/** The border and its zone marks. */
function frame(w,h){
 let out=`<rect class="l" x="10" y="10" width="${w-20}" height="${h-20}" fill="none"/><rect class="t" x="4" y="4" width="${w-8}" height="${h-8}" fill="none"/>`;
 const cols=Math.max(4,Math.round((w-20)/160)),rows=Math.max(3,Math.round((h-20)/160));
 for(let i=0;i<cols;i++){const x=10+(w-20)*(i+.5)/cols;out+=text(x,9,String.fromCharCode(65+i),'lab','text-anchor="middle"')+text(x,h-3,String.fromCharCode(65+i),'lab','text-anchor="middle"');if(i)out+=`<line class="t" x1="${r2(10+(w-20)*i/cols)}" y1="4" x2="${r2(10+(w-20)*i/cols)}" y2="10"/><line class="t" x1="${r2(10+(w-20)*i/cols)}" y1="${h-10}" x2="${r2(10+(w-20)*i/cols)}" y2="${h-4}"/>`;}
 for(let i=0;i<rows;i++){const y=10+(h-20)*(i+.5)/rows;out+=text(7,y+3,i+1,'lab','text-anchor="middle"')+text(w-7,y+3,i+1,'lab','text-anchor="middle"');if(i)out+=`<line class="t" x1="4" y1="${r2(10+(h-20)*i/rows)}" x2="10" y2="${r2(10+(h-20)*i/rows)}"/><line class="t" x1="${w-10}" y1="${r2(10+(h-20)*i/rows)}" x2="${w-4}" y2="${r2(10+(h-20)*i/rows)}"/>`;}
 return out;
}
const path=(pts,cls='l')=>`<path class="${cls}" d="M${pts.map(p=>p.map(r2).join(',')).join(' L')}"/>`;
const text=(x,y,s,cls='txt',extra='')=>`<text class="${cls}" x="${r2(x)}" y="${r2(y)}" ${extra}>${String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')}</text>`;
/** A text that fits a width: shrunk to fit, never clipped. */
const fitText=(x,y,s,width,size,cls='lab',extra='')=>text(x,y,s,cls,`style="font-size:${r2(fit(s,width,size))}px" ${extra}`);
/** A dimension line between two points with arrows and its figure (offset `off` px from the points, along the normal). */
function dim(x1,y1,x2,y2,label,off=18){
 const dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy)||1,nx=-dy/len*off,ny=dx/len*off;
 const ax=x1+nx,ay=y1+ny,bx=x2+nx,by=y2+ny;
 return `<line class="d" x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(ax+nx*.25)}" y2="${r2(ay+ny*.25)}"/><line class="d" x1="${r2(x2)}" y1="${r2(y2)}" x2="${r2(bx+nx*.25)}" y2="${r2(by+ny*.25)}"/><line class="d" x1="${r2(ax)}" y1="${r2(ay)}" x2="${r2(bx)}" y2="${r2(by)}" marker-start="url(#arr)" marker-end="url(#arr)"/>`+text((ax+bx)/2,(ay+by)/2-3+(Math.abs(dx)<Math.abs(dy)?8:0),label,'lab',`text-anchor="middle"${Math.abs(dx)<Math.abs(dy)?` transform="rotate(-90 ${r2((ax+bx)/2)} ${r2((ay+by)/2)})"`:''}`);
}
/** The title block (grid) at the bottom right, with the notes in a box over it. */
const titleBlock=(w,h,name,sheet,notes=[])=>{
 const bw=420,bh=96,x=w-10-bw,y=h-10-bh;let out=`<rect class="l" x="${x}" y="${y}" width="${bw}" height="${bh}" fill="#fff"/>`;
 const cell=(cx,cy,cw,ch,label,value,big=false)=>{let s=`<rect class="t" x="${r2(x+cx)}" y="${r2(y+cy)}" width="${r2(cw)}" height="${r2(ch)}"/>`+text(x+cx+3,y+cy+8,label,'lab','font-size="6.5" fill="#6a7477"');
  const lines=Array.isArray(value)?value:[value];const size=big?12:9;lines.forEach((v,i)=>s+=fitText(x+cx+3,y+cy+ch-4-(lines.length-1-i)*(size+1),v,cw-6,i===lines.length-1?size:8,i===lines.length-1&&big?'ttl':'txt'));return s;};
 out+=cell(0,0,180,30,'YARD',['ヨハンソン造船 · Innoshima','JOHANSSON SHIPYARD'],true);
 out+=cell(180,0,160,30,'SHIP','M/V MINATO MARU みなと丸 · hull No. 127');
 out+=cell(340,0,80,30,'DRAWING No.',DRAWING_NO[sheet]||('JS-127-0'+sheet),true);
 out+=cell(0,30,340,30,'TITLE',name.split(' · ').slice(0,2).join(' · '));
 out+=cell(340,30,80,30,'SCALE',(name.match(/1:[\d.]+/)||['as noted'])[0]);
 out+=cell(0,60,70,36,'DRAWN','tools/ferry-drawings.mjs');out+=cell(70,60,70,36,'CHECKED','tests/ferry-design-book');out+=cell(140,60,70,36,'APPROVED','the creator');
 out+=cell(210,60,70,36,'DATE','2026-10-12');out+=cell(280,60,60,36,'SHEET',sheet+' / 6');out+=cell(340,60,80,36,'REV','A · first issue');
 // Notes, wrapped, in their own box over the title block.
 const lines=notes.flatMap(n=>wrap(n,bw-12,8.5));if(lines.length){const nh=lines.length*11+12;out+=`<rect class="t" x="${x}" y="${y-nh-4}" width="${bw}" height="${nh}" fill="#fff"/>`+text(x+5,y-nh+4,'NOTES','lab','font-size="6.5" fill="#6a7477"');lines.forEach((l,i)=>out+=text(x+5,y-nh+15+i*11,l,'lab'));}
 return out;
};

// ---------------------------------------------------------------- 1. Lines plan
export function linesPlan(){
 const S=18; // px per metre
 const stations=Array.from({length:21},(_,i)=>i*L/20); // 0 at the transom, 20 at the stem
 const waterlines=[.5,1,1.5,T,2.5,H.carDeck],buttocks=[1,2,3,4];
 const W=1400,Hh=620;
 let out='';
 // Sheer (profile) plan: keel, deck edge, bulwark, waterlines, buttocks' intersections.
 const px=z=>60+z*S,py0=200,py=y=>py0-y*S;
 const zs=Array.from({length:139},(_,i)=>i*L/138);
 out+=path(zs.map(z=>[px(z),py(keelAbove(keelY(toModel(z))))]));
 out+=path(zs.map(z=>[px(z),py(keelAbove(deckEdge(toModel(z))))]));
 out+=path(zs.map(z=>[px(z),py(keelAbove(bulwarkTop(toModel(z))))]));
 out+=`<line class="l" x1="${px(L)}" y1="${py(keelAbove(keelY(toModel(L))))}" x2="${px(L)}" y2="${py(keelAbove(deckEdge(toModel(L))))}"/>`;
 out+=`<line class="l" x1="${px(0)}" y1="${py(keelAbove(keelY(toModel(0))))}" x2="${px(0)}" y2="${py(keelAbove(bulwarkTop(toModel(0))))}"/>`;
 for(const wl of waterlines){out+=`<line class="${wl===T?'wl':'g'}" x1="${px(0)}" y1="${py(wl)}" x2="${px(L)}" y2="${py(wl)}"/>`;out+=text(px(L)+4,py(wl)+3,(wl===T?'LWL ':'WL ')+wl+' m','lab');}
 for(const bt of buttocks){ // where the hull at half-breadth bt meets each section: height
  const pts=[];for(const z of zs){const sec=section(z);const hit=sec.find(([x])=>x>=bt);if(hit)pts.push([px(z),py(hit[1])]);}
  if(pts.length>1)out+=path(pts,'c')+text(pts[0][0]-30,pts[0][1]+3,'B'+bt,'lab');
 }
 stations.forEach((z,i)=>{out+=`<line class="g" x1="${px(z)}" y1="${py(0)+8}" x2="${px(z)}" y2="${py(H.carDeck+1.2)}"/>`+text(px(z)-4,py(0)+20,i,'lab');});
 out+=text(60,py(0)+36,'SHEER PLAN · stations 0 (transom) to 20 (stem), spacing '+r3(L/20)+' m · buttocks B1–B4 (red), waterlines (grey), laden waterline 1.9 m (teal)','sub');
 // Half-breadth plan: waterlines in plan, deck edge.
 const hy0=430,hy=x=>hy0-x*S;
 out+=path(zs.map(z=>[px(z),hy(halfBreadth(toModel(z)))]));out+=`<line class="l" x1="${px(0)}" y1="${hy(0)}" x2="${px(L)}" y2="${hy(0)}"/>`;
 for(const wl of waterlines){const pts=zs.map(z=>[px(z),hy(breadthAt(z,wl))]).filter(p=>Number.isFinite(p[1]));out+=path(pts,wl===T?'wl':'t');}
 stations.forEach((z,i)=>{out+=`<line class="g" x1="${px(z)}" y1="${hy(0)}" x2="${px(z)}" y2="${hy(B/2+.4)}"/>`;});
 out+=text(60,hy0+16,'HALF-BREADTH PLAN · waterlines 0.5, 1.0, 1.5, 1.9 (LWL), 2.5, 3.0 (deck) m, and the deck edge','sub');
 out+=dim(px(0),hy0+36,px(L),hy0+36,'LOA 34.5 m · stations every 1.725 m',0);
 // Body plan: sections, aft on the left, forward on the right, about the centreline.
 const bx=px(L)+300,by0=290,bx0=bx,bs=x=>bx0+x*S*2.6,bys=y=>by0-y*S*2.6;
 out+=dim(bs(-B/2),bys(-.6),bs(B/2),bys(-.6),'B 8.4 m',0);
 out+=`<line class="l" x1="${bs(-B/2-.3)}" y1="${bys(0)}" x2="${bs(B/2+.3)}" y2="${bys(0)}"/><line class="g" x1="${bs(0)}" y1="${bys(0)}" x2="${bs(0)}" y2="${bys(H.carDeck+1.3)}"/>`;
 for(const wl of waterlines)out+=`<line class="${wl===T?'wl':'g'}" x1="${bs(-B/2-.2)}" y1="${bys(wl)}" x2="${bs(B/2+.2)}" y2="${bys(wl)}"/>`+text(bs(B/2+.3),bys(wl)+3,(wl===T?'LWL ':'WL ')+wl,'lab');
 stations.forEach((z,i)=>{const side=i>=10?1:-1;const pts=section(z).map(([x,y])=>[bs(side*x),bys(y)]);const top=pts[pts.length-1];out+=path(pts,i%5?'t':'l');if(i%2===0)out+=text(top[0]+(side<0?-12:4),top[1]-6-(i%4?0:9),i,'lab');});
 out+=text(bs(-B/2-.3),bys(0)+16,'BODY PLAN · aft stations 0–9 to the left, forward 10–20 to the right · 1:40','sub');
 out+=titleBlock(W,Hh,'LINES PLAN · sheer and half-breadth plans at 18 px/m, body plan at 46.8 px/m',1,['Hull: parallel midbody with a 0.6 m bilge, spoon forefoot under the bow ramp, counter rising aft over the screws (ferry-model.js keelY, fullness).']);
 return svg(W,Hh,out,'Minato Maru · lines plan');
}

// ---------------------------------------------------------------- 2. Offsets and hydrostatics (markdown)
export function offsetsTable(){
 const stations=Array.from({length:21},(_,i)=>i*L/20),wls=[.25,.5,1,1.5,T,2.5,H.carDeck];
 let md=`# Table of offsets · Minato Maru\n\nHalf-breadths in metres from the centreline at each waterline, at 21 stations from the transom (0) to the stem (20), station spacing ${r3(L/20)} m. Heights above the base line (keel at amidships). Drawn from the loft in \`src/world/ferry-model.js\` by \`tools/ferry-drawings.mjs\`; the lines plan is \`lines-plan.svg\`.\n\n`;
 md+='| Station | z from transom (m) | Keel height | '+wls.map(w=>`WL ${w}`).join(' | ')+' | Deck edge height | Deck half-breadth | Bulwark top |\n|'+'---|'.repeat(wls.length+6)+'\n';
 stations.forEach((z,i)=>{const zm=toModel(z);md+=`| ${i} | ${r2(z)} | ${r2(keelAbove(keelY(zm)))} | ${wls.map(w=>r3(breadthAt(z,w))).join(' | ')} | ${r2(keelAbove(deckEdge(zm)))} | ${r3(halfBreadth(zm))} | ${r2(keelAbove(bulwarkTop(zm)))} |\n`;});
 return md;
}
export function hydrostaticsTable(){
 const drafts=[1.0,1.2,1.4,1.6,SH.serviceDraft,1.8,T,2.0,2.2,2.4];
 const rows=drafts.map(t=>hydrostatics(t));
 let md=`# Hydrostatics · Minato Maru\n\nComputed from the loft (\`ferry-model.js\` sectionPoint) by Simpson's rule over 100 stations, sea water 1.025 t/m³. Lengths from the transom (station 0), heights above the base line. Laden draft ${T} m, service draft ${SH.serviceDraft} m (\`ferry-ship.js\`).\n\n`;
 md+='| Draft (m) | Displacement (t) | Volume (m³) | LCB from transom (m) | KB (m) | BM_T (m) | KM_T (m) | A_WP (m²) | LCF (m) | TPC (t/cm) | MCT 1 cm (t·m) | L_WL (m) | C_B | C_P | C_WP | C_M |\n|'+'---|'.repeat(16)+'\n';
 for(const r of rows)md+=`| ${r2(r.draft)} | ${r1(r.displacement)} | ${r1(r.volume)} | ${r2(r.lcb)} | ${r3(r.kb)} | ${r3(r.bmT)} | ${r3(r.kmT)} | ${r1(r.awp)} | ${r2(r.lcf)} | ${r3(r.tpc)} | ${r2(r.mct)} | ${r2(r.lwl)} | ${r3(r.cb)} | ${r3(r.cp)} | ${r3(r.cwp)} | ${r3(r.cm)} |\n`;
 const laden=rows.find(r=>r.draft===T);
 md+=`\n## Against the particulars\n\n| | Data (\`FERRY_SHIP\`) | From the loft at ${T} m |\n|---|---|---|\n| Displacement | ${SH.displacement} t | ${r1(laden.displacement)} t |\n| Block coefficient | ${SH.blockCoefficient} | ${r3(laden.cb)} |\n| GM (loaded) | ${SH.gm} m | KM_T ${r3(laden.kmT)} m, so KG must be ${r3(laden.kmT-SH.gm)} m (lightship + load; see the weight estimate, open) |\n| Lightship / deadweight | ${SH.lightship} t / ${SH.deadweight} t | ${r1(laden.displacement-SH.deadweight)} t lightship if the deadweight stands |\n`;
 return {md,rows,laden};
}

// ---------------------------------------------------------------- 3. General arrangement
const DECKS=[['hold','HOLD · tank top 0.7 m, floor plates 0.9 m',0],['car','CAR DECK · 3.0 m above base',H.carDeck],['passenger','PASSENGER DECK · 7.4 m',H.passengerDeck],['bridge','BRIDGE DECK · 10.0 m',H.bridgeDeck],['compass','COMPASS DECK · 12.4 m',H.compassDeck]];
export function generalArrangement(){
 const S=16,W=1260,Hh=5*210+400;
 let out='';
 // Profile at the top.
 const px=z=>50+z*S,py0=320,py=y=>py0-y*S;
 const zs=Array.from({length:139},(_,i)=>i*L/138);
 out+=path(zs.map(z=>[px(z),py(keelAbove(keelY(toModel(z))))]));out+=path(zs.map(z=>[px(z),py(keelAbove(bulwarkTop(toModel(z))))]));
 out+=`<line class="l" x1="${px(0)}" y1="${py(keelAbove(keelY(toModel(0))))}" x2="${px(0)}" y2="${py(keelAbove(bulwarkTop(toModel(0))))}"/><line class="l" x1="${px(L)}" y1="${py(keelAbove(keelY(toModel(L))))}" x2="${px(L)}" y2="${py(keelAbove(bulwarkTop(toModel(L))))}"/>`;
 out+=`<line class="wl" x1="${px(-1)}" y1="${py(T)}" x2="${px(L+6)}" y2="${py(T)}"/>`+text(px(L+1),py(T)-3,'LWL 1.9 m','lab');
 for(const [name,y] of [['car deck',H.carDeck],['passenger deck',H.passengerDeck],['bridge deck',H.bridgeDeck],['compass deck',H.compassDeck]])out+=`<line class="g" x1="${px(0)}" y1="${py(y)}" x2="${px(L)}" y2="${py(y)}"/>`+text(px(0)-46,py(y)+3,name,'lab');
 // Houses in profile: deckhouse z 6–23 passenger→bridge, bridge house z 6–23 bridge→compass, wheelhouse windows, funnels, ramp, mast.
 const rect=(z0,z1,y0,y1,cls='sp')=>`<rect class="${cls}" x="${r2(px(z0))}" y="${r2(py(y1))}" width="${r2((z1-z0)*S)}" height="${r2((y1-y0)*S)}"/>`;
 out+=rect(6,23,H.passengerDeck,H.bridgeDeck)+rect(6,23,H.bridgeDeck,H.compassDeck)+rect(3,20,H.carDeck,H.passengerDeck)+rect(30,34,H.carDeck,H.carDeck+2.4)+rect(4,5.8,H.passengerDeck,H.funnelTop)+rect(0,6,H.passengerDeck,H.passengerDeck+.05);
 out+=`<line class="l" x1="${px(34.3)}" y1="${py(H.carDeck)}" x2="${px(40.3)}" y2="${py(H.carDeck-1.9)}"/>`+text(px(36),py(H.carDeck-2.4),'bow ramp lowered (6.0 m)','lab');
 out+=`<line class="l" x1="${px(21.5)}" y1="${py(H.compassDeck)}" x2="${px(21.5)}" y2="${py(H.mastTop)}"/>`+text(px(21.9),py(H.mastheadLight),'masthead light 15 m','lab')+text(px(21.9),py(H.mastTop),'mast top 17 m','lab');
 out+=text(px(10),py(H.passengerDeck+1.6),'passenger saloon · carpet room · lobby','lab')+text(px(7),py(H.bridgeDeck+1.5),'crew cabins · mess · galley · EG and CO₂ rooms','lab')+text(px(19.8),py(H.bridgeDeck+.5),'wheelhouse','lab')+text(px(8),py(H.carDeck+1.2),'casings P and S · lower lobby · stairs','lab')+text(px(9),py(1.8),'engine room','lab')+text(px(.6),py(2.2),'steering gear','lab')+text(px(28),py(1.6),'thruster','lab');
 out+=text(50,py0+40,'PROFILE · looking at the port side · stern to the left','sub');
 out+=dim(px(0),py(H.compassDeck+5.5),px(L),py(H.compassDeck+5.5),'LOA 34.5 m',0)+dim(px(L)+30,py(0),px(L)+30,py(H.carDeck),'D 3.0 m',0)+dim(px(L)+60,py(0),px(L)+60,py(T),'T 1.9 m',0);
 Array.from({length:21},(_,i)=>i*L/20).forEach((z,i)=>out+=text(px(z)-3,py0+22,i,'lab'));
 // Deck plans.
 DECKS.forEach(([deck,title],d)=>{
  const oy=400+d*210,cx=z=>50+z*S,cy=x=>oy+100-x*S; // +x port is up on the page
  out+=text(50,oy-4,title,'sub');
  const outline=zs.map(z=>[cx(z),cy(halfBreadth(toModel(z)))]).concat(zs.slice().reverse().map(z=>[cx(z),cy(-halfBreadth(toModel(z)))]));outline.push(outline[0]);out+=path(outline,'l');
  out+=`<line class="g" x1="${cx(0)}" y1="${cy(0)}" x2="${cx(L)}" y2="${cy(0)}"/>`;
  for(const s of FERRY_GA.filter(s=>s.deck===deck)){
   const [z0,z1]=s.z,[x0,x1]=s.x;out+=`<rect class="sp" x="${r2(cx(z0))}" y="${r2(cy(x1))}" width="${r2((z1-z0)*S)}" height="${r2((x1-x0)*S)}"/>`;
   const label=s.id.replace(/-/g,' ');if((z1-z0)*S>18&&(x1-x0)*S>9)out+=fitText(cx(z0)+2,cy(x1)+Math.min(9,(x1-x0)*S-2),label,(z1-z0)*S-4,8.5);
  }
 });
 out+=dim(50,410+100+4.2*S+14,50+L*S,410+100+4.2*S+14,'LBP 31.0 m between perpendiculars · LOA 34.5 m',0)+dim(50+L*S+24,400+100-4.2*S,50+L*S+24,400+100+4.2*S,'B 8.4 m',0);
 out+=titleBlock(W,Hh,'GENERAL ARRANGEMENT · profile and deck plans · 1:62.5 at 16 px/m',2,['Every space is a FERRY_GA entry with its z and x ranges; its contents and reasons are in ferry-ship.js and README.md.']);
 return svg(W,Hh,out,'Minato Maru · lines plan');
}

// ---------------------------------------------------------------- 4. Electrical one-line
export function oneLine(){
 const E=FERRY_ELECTRICS,W=1200,Hh=820;let out='';
 const box=(x,y,w,h,lines,cls='sp')=>`<rect class="${cls}" x="${x}" y="${y}" width="${w}" height="${h}" rx="3"/>`+lines.map((l,i)=>text(x+6,y+14+i*12,l,'lab')).join('');
 const line=(x1,y1,x2,y2)=>`<line class="l" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
 out+=box(60,40,170,52,['DG1 '+E.generators.kVA+' kVA '+E.generators.kW+' kW',E.generators.volts+' V '+E.generators.hz+' Hz · '+E.generators.amps+' A','ACB '+E.generators.breaker.frame+' AF set '+E.generators.breaker.setting+' A']);
 out+=box(300,40,170,52,['DG2 '+E.generators.kVA+' kVA '+E.generators.kW+' kW',E.generators.volts+' V '+E.generators.hz+' Hz · '+E.generators.amps+' A','ACB '+E.generators.breaker.frame+' AF set '+E.generators.breaker.setting+' A']);
 out+=box(560,40,200,52,['SHORE '+E.shore.kVA+' kVA · '+E.shore.volts+' V quay','transformer '+E.shore.transformer,'MCCB '+E.shore.breaker+' A · interlocked with DG1/DG2']);
 out+=line(145,92,145,140)+line(385,92,385,140)+line(660,92,660,140);
 out+=`<rect class="l" x="60" y="140" width="700" height="10" fill="#1d2326"/>`+text(60,166,'MAIN SWITCHBOARD (MSB) · 440 V 3-phase 3-wire IT bus · engine control booth · earth lamps, insulation meter, synchroscope','lab');
 // Feeders from MSB
 const msb=FERRY_LOADS.filter(l=>l.board==='MSB'),esb=FERRY_LOADS.filter(l=>l.board==='ESB'),lb=FERRY_LOADS.filter(l=>l.board==='LB'),elb=FERRY_LOADS.filter(l=>!['MSB','ESB','LB'].includes(l.board));
 const feeders=(list,x,y,title)=>{let s=text(x,y,title,'sub');list.forEach((l,i)=>{s+=text(x,y+13+i*11,`${l.count>1?l.count+'× ':''}${l.name} · ${l.kW} kW · ${l.amps} A${l.trip?' · trip st.'+l.trip:''}`,'lab');});return s;};
 out+=line(100,150,100,200)+feeders(msb,70,214,'440 V FEEDERS (MSB)');
 out+=line(500,150,500,200)+box(440,200,150,40,['TR1 / TR2 '+E.transformers.lighting.kVA+' kVA',E.transformers.lighting.ratio+' · one in use'])+line(515,240,515,270)+`<rect class="l" x="440" y="270" width="200" height="8" fill="#1d2326"/>`+text(440,292,'LIGHTING BOARD (LB) · 105 V','lab')+feeders(lb,440,310,'105 V FEEDERS (LB)');
 out+=line(740,150,740,200)+box(690,200,120,40,['BUS-TIE to ESB','opens on main-bus loss'])+line(750,240,750,560);
 out+=box(900,480,220,52,['EMERGENCY GENERATOR '+E.emergency.kVA+' kVA',E.emergency.kW+' kW · on load within '+E.emergency.onLoadWithin+' s','day tank '+E.emergency.dayTank+' L · '+E.emergency.hours+' h']);
 out+=line(1000,532,1000,560)+`<rect class="l" x="700" y="560" width="440" height="10" fill="#1d2326"/>`+text(700,586,'EMERGENCY SWITCHBOARD (ESB) · 440 V and 105 V sections · emergency-generator room (bridge deck)','lab');
 out+=line(760,570,760,610)+feeders(esb,700,624,'EMERGENCY FEEDERS (ESB 440 V)')+box(960,610,150,40,['ETR '+E.transformers.emergency.kVA+' kVA',E.transformers.emergency.ratio])+line(1035,650,1035,670)+feeders(elb,960,684,'ESB 105 V and 24 V');
 out+=box(60,660,300,60,['24 V BATTERIES · '+E.batteries.banks.join(' · '),'transitional source '+E.batteries.transitionalMinutes+' min','chargers on the ESB 105 V section']);
 out+=text(60,745,'Preference trip: '+E.preferenceTrip.stages+' stages, '+E.preferenceTrip.delay+' s. '+E.preferenceTrip.why,'lab');
 out+=titleBlock(W,Hh,'ELECTRICAL ONE-LINE DIAGRAM · generation, distribution and feeders',3,['Load analysis per condition: README.md § electrical load (FERRY_LOADS).']);
 return svg(W,Hh,out,'Minato Maru · one-line diagram');
}

// ---------------------------------------------------------------- 5. Tables: tanks, loads, safety, manning
export function tankTable(){
 const M=FERRY_MACHINERY.tanks;
 const rows=[['Fuel storage P','er-double-bottom',M.fuelStorage[0],'A-heavy oil'],['Fuel storage S','er-double-bottom',M.fuelStorage[1],'A-heavy oil'],['Fuel service','engine-room',M.fuelService,'A-heavy oil, gravity to the engines'],['Lubricating oil','er-double-bottom',M.lubeOil,''],['Sludge','er-double-bottom',M.sludge,''],['Bilge holding','er-double-bottom',M.bilgeHolding,''],['Fresh water P','fresh-water',M.freshWater/2,''],['Fresh water S','fresh-water',M.freshWater/2,''],['Sewage holding','tanks',M.sewage,'pumped ashore at Minato'],['Ballast fore peak','fore-peak',M.ballast.forePeak,'sea water'],['Ballast aft peak','aft-peak',M.ballast.aftPeak,'sea water'],['Ballast P','tanks',M.ballast.port,'sea water'],['Ballast S','tanks',M.ballast.starboard,'sea water']];
 let md='# Tank plan · Minato Maru\n\n| Tank | Space (FERRY_GA) | z (m) | Capacity (m³) | Note |\n|---|---|---|---|---|\n';
 for(const [name,id,cap,note] of rows){const s=FERRY_GA.find(s=>s.id===id);md+=`| ${name} | ${id} | ${s?s.z.join('–'):'?'} | ${cap} | ${note} |\n`;}
 md+=`\nTotal fuel ${M.fuel} m³ (${FERRY_MACHINERY.fuelPerDay} L a day: ${Math.floor(M.fuel*1000/FERRY_MACHINERY.fuelPerDay)} days), fresh water ${M.freshWater} m³ (${FERRY_MACHINERY.freshWater.perDay} m³ a day), ballast ${Object.values(M.ballast).reduce((a,b)=>a+b,0)} m³.\n`;
 return md;
}
export function loadTable(){
 let md='# Electrical load analysis (電力調査表) · Minato Maru\n\n| Consumer | Space | Board | Supply | n | kW each | A | '+FERRY_CONDITIONS.join(' | ')+' | Trip | Why |\n|'+'---|'.repeat(10+FERRY_CONDITIONS.length)+'\n';
 for(const l of FERRY_LOADS)md+=`| ${l.name} | ${l.where} | ${l.board} | ${l.supply} | ${l.count} | ${l.kW} | ${l.amps} | ${FERRY_CONDITIONS.map(c=>l.draw[c]||'').join(' | ')} | ${l.trip||''} | ${l.why} |\n`;
 md+='| **Total kW** | | | | | | | '+FERRY_CONDITIONS.map(c=>r1(FERRY_LOADS.reduce((s,l)=>s+(l.draw[c]||0),0))).join(' | ')+' | | |\n';
 return md;
}

// ---------------------------------------------------------------- write
// ---------------------------------------------------------------- 5. Engine room arrangement
const ER=FERRY_ENGINE_ROOM,Z0=ER.aft+HALF,Z1=ER.fore+HALF,Y0=ER.floor+T,Y1=FERRY_HEIGHTS.carDeck;
const inER=b=>Math.min(b.a[2],b.b[2])+HALF>=Z0-.1&&Math.max(b.a[2],b.b[2])+HALF<=Z1+.1&&Math.max(b.a[1],b.b[1])+T>=Y0-.2&&Math.min(b.a[1],b.b[1])+T<=Y1-.05;
/** The equipment list: a number for every named thing, in the order a yard lists them. */
const LIST=[['main engine','Main engine, Johansson Marine '+JOHANSSON_MARINE.catalogue.main.model],['gearbox','Reverse-reduction gear '+JOHANSSON_MARINE.catalogue.gear.model],['generator engine','Generator set '+JOHANSSON_MARINE.catalogue.genset.model+' (engine)'],['generator bed','Generator set bed'],
 ['main switchboard','Main switchboard '+JOHANSSON_MARINE.catalogue.switchboard.model],['engine panel and log desk','Engine panel and log desk'],['pump','Pumps: fire and GS, fire and bilge, GS, bilge, sanitary, hydrophore'],['fuel service tank','Fuel-oil service tank 1.6 m³'],['sea-water strainer','Sea-water strainers (sea chests under the plates)'],
 ['air bottles','Starting-air bottles 2 × 150 L'],['air compressor','Starting-air compressor '+JOHANSSON_MARINE.catalogue.compressor.model],['workbench','Workbench and vice'],['fuel purifier','Fuel purifier '+JOHANSSON_MARINE.catalogue.purifier.model],['oily-water separator','Oily-water separator '+JOHANSSON_MARINE.catalogue.separator.model],
['local control stand','Local control stand'],['hydrant','Fire hydrant'],['ladder trunk','Access ladder from casing P'],['engine room door','Engine-room door (car deck)']];
export function engineRoomArrangement(){
 const S=50,W=1260,Hh=800,boxes=FERRY_INTERIOR.boxes.filter(b=>inER(b)&&(b.draw!==false||LIST.some(([n])=>n===b.name))),cyls=FERRY_INTERIOR.cyls.filter(c=>c.pos[2]+HALF>=Z0&&c.pos[2]+HALF<=Z1);
 let out='';
 const rect=(x,y,w,h,cls='sp')=>`<rect class="${cls}" x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}"/>`;
 const num=(x,y,n)=>`<circle cx="${r2(x)}" cy="${r2(y)}" r="7" fill="#fff" stroke="#1d2326" stroke-width=".7"/>`+text(x,y+3,n,'lab','text-anchor="middle"');
 // Plan at the floor plates, port up: z across the page (stern left), x up.
 const px=z=>60+(z-Z0)*S,py=x=>60+(4.2-x)*S;
 out+=text(60,40,'PLAN · at the floor plates (0.9 m above base) looking down · port side up · 1:20 at 50 px/m','sub');
 const zs=Array.from({length:23},(_,i)=>Z0+(Z1-Z0)*i/22);
 out+=`<path class="l" d="M${zs.map(z=>[px(z),py(hullX(ER.floor,z-HALF))].map(r2).join(',')).join(' L')}"/><path class="l" d="M${zs.map(z=>[px(z),py(-hullX(ER.floor,z-HALF))].map(r2).join(',')).join(' L')}"/>`;
 out+=`<line class="l" x1="${px(Z0)}" y1="${py(hullX(ER.floor,Z0-HALF))}" x2="${px(Z0)}" y2="${py(-hullX(ER.floor,Z0-HALF))}"/><line class="l" x1="${px(Z1)}" y1="${py(hullX(ER.floor,Z1-HALF))}" x2="${px(Z1)}" y2="${py(-hullX(ER.floor,Z1-HALF))}"/><line class="c" x1="${px(Z0)-20}" y1="${py(0)}" x2="${px(Z1)+20}" y2="${py(0)}"/>`;
 for(const b of boxes){const z0=Math.min(b.a[2],b.b[2])+HALF,z1=Math.max(b.a[2],b.b[2])+HALF,x0=Math.min(b.a[0],b.b[0]),x1=Math.max(b.a[0],b.b[0]);out+=rect(px(z0),py(x1),(z1-z0)*S,(x1-x0)*S,b.solid?'sp':'t');}
 for(const c of cyls){const r=Math.max(c.rt,c.rb);out+=`<circle class="t" cx="${r2(px(c.pos[2]+HALF))}" cy="${r2(py(c.pos[0]))}" r="${r2(r*S)}"/>`;}
 const placed=new Map();
 boxes.forEach(b=>{const i=LIST.findIndex(([n])=>n===b.name);if(i<0)return;const key=i+':'+r2((b.a[0]+b.b[0])/2)+':'+r2((b.a[2]+b.b[2])/2);if(placed.has(key))return;placed.set(key,1);out+=num(px((b.a[2]+b.b[2])/2+HALF),py((b.a[0]+b.b[0])/2),i+1);});
 // Frames every 0.5 m from the transom (frame 17 at z 8.5), the grid a yard reads positions off; the overall dimensions.
 for(let i=0;i<=11;i++){const z=Z0+i*.5;out+=`<line class="g" x1="${r2(px(z))}" y1="${r2(py(4.3))}" x2="${r2(px(z))}" y2="${r2(py(-4.3))}"/>`+text(px(z),py(-4.3)+12,'Fr '+Math.round(z*2),'lab','text-anchor="middle"');}
 out+=dim(px(Z0),py(-4.3)+30,px(Z1),py(-4.3)+30,'5.5 m · Fr 17 to Fr 28',0)+dim(px(Z1)+20,py(4),px(Z1)+20,py(-4),'8.0 m between the linings',0);
 // Elevation: looking to port from the centreline (z across, y up), the port-side machines.
 const ey0=680,ex=z=>60+(z-Z0)*S,ey=y=>ey0-(y-Y0+.3)*S;
 out+=text(60,ey0-(Y1-Y0+.3)*S-12,'ELEVATION · section at the centreline looking to port · stern left','sub');
 out+=`<line class="l" x1="${ex(Z0)}" y1="${ey(Y0)}" x2="${ex(Z1)}" y2="${ey(Y0)}"/><line class="l" x1="${ex(Z0)}" y1="${ey(Y1)}" x2="${ex(Z1)}" y2="${ey(Y1)}"/><line class="l" x1="${ex(Z0)}" y1="${ey(Y0-.3)}" x2="${ex(Z0)}" y2="${ey(Y1)}"/><line class="l" x1="${ex(Z1)}" y1="${ey(Y0-.3)}" x2="${ex(Z1)}" y2="${ey(Y1)}"/>`;
 out+=text(ex(Z0)-50,ey(Y0)+3,'floor 0.9','lab')+text(ex(Z0)-50,ey(Y1)+3,'car deck 3.0','lab')+text(ex(Z0)-50,ey(Y0-.3)+3,'tank top','lab');
 for(const b of boxes.filter(b=>Math.max(b.a[0],b.b[0])>0)){const z0=Math.min(b.a[2],b.b[2])+HALF,z1=Math.max(b.a[2],b.b[2])+HALF,y0=Math.min(b.a[1],b.b[1])+T,y1=Math.min(Y1,Math.max(b.a[1],b.b[1])+T);out+=rect(ex(z0),ey(y1),(z1-z0)*S,(y1-y0)*S,b.solid?'sp':'t');}
 for(const c of cyls.filter(c=>c.pos[0]>0)){const r=Math.max(c.rt,c.rb);out+=`<circle class="t" cx="${r2(ex(c.pos[2]+HALF))}" cy="${r2(ey(c.pos[1]+T))}" r="${r2(Math.min(r,c.h/2)*S)}"/>`;}
 // Section looking forward through the main engines (x across, port to the right as seen from aft).
 const SZ=10.8,sx=x=>420+(x+4.2)*S,sy=y=>ey0-(y-Y0+.3)*S;
 out+=text(420,ey0-(Y1-Y0+.3)*S-12,'SECTION at z '+SZ+' looking forward · through the main engines','sub');
 const ys=Array.from({length:12},(_,i)=>Y0-.3+(Y1-Y0+.3)*i/11);
 for(const sgn of [1,-1])out+=`<path class="l" d="M${ys.map(y=>[sx(sgn*hullX(y-T,SZ-HALF)),sy(y)].map(r2).join(',')).join(' L')}"/>`;
 // The cut structure hatched: the shell, the tank top and the car deck as plating.
 for(const sgn of [1,-1])out+=`<path class="hatch" d="M${ys.map(y=>[sx(sgn*hullX(y-T,SZ-HALF)),sy(y)].map(r2).join(',')).join(' L')} L${ys.slice().reverse().map(y=>[sx(sgn*(hullX(y-T,SZ-HALF)-.12)),sy(y)].map(r2).join(',')).join(' L')} z"/>`;
 out+=`<rect class="hatch" x="${r2(sx(-hullX(Y1-T,SZ-HALF)))}" y="${r2(sy(Y1))}" width="${r2(2*hullX(Y1-T,SZ-HALF)*S)}" height="4"/><rect class="hatch" x="${r2(sx(-hullX(Y0-.3-T,SZ-HALF)))}" y="${r2(sy(Y0-.3))}" width="${r2(2*hullX(Y0-.3-T,SZ-HALF)*S)}" height="4"/>`;
 out+=dim(sx(-1.55),sy(Y0-.3)+20,sx(1.55),sy(Y0-.3)+20,'3.1 m between engine centres',0)+dim(sx(-4.4),sy(Y0),sx(-4.4),sy(Y1),'2.1 m floor to deck',0);
 out+=`<line class="l" x1="${sx(-hullX(Y0-T,SZ-HALF))}" y1="${sy(Y0)}" x2="${sx(hullX(Y0-T,SZ-HALF))}" y2="${sy(Y0)}"/><line class="l" x1="${sx(-hullX(Y1-T,SZ-HALF))}" y1="${sy(Y1)}" x2="${sx(hullX(Y1-T,SZ-HALF))}" y2="${sy(Y1)}"/>`;
 for(const b of boxes.filter(b=>Math.min(b.a[2],b.b[2])+HALF<=SZ&&Math.max(b.a[2],b.b[2])+HALF>=SZ)){const x0=Math.min(b.a[0],b.b[0]),x1=Math.max(b.a[0],b.b[0]),y0=Math.min(b.a[1],b.b[1])+T,y1=Math.min(Y1,Math.max(b.a[1],b.b[1])+T);out+=rect(sx(x0),sy(y1),(x1-x0)*S,(y1-y0)*S,b.solid?'sp':'t');}
 for(const c of cyls.filter(c=>Math.abs(c.pos[2]+HALF-SZ)<.3)){const r=Math.max(c.rt,c.rb);out+=`<circle class="t" cx="${r2(sx(c.pos[0]))}" cy="${r2(sy(c.pos[1]+T))}" r="${r2(Math.min(r,c.h/2)*S)}"/>`;}
 // Equipment list.
 const lx=W-330,ly=60;out+=rect(lx-10,ly-16,320,LIST.length*14+22,'t')+text(lx,ly,'EQUIPMENT LIST','sub');
 LIST.forEach(([,label],i)=>out+=fitText(lx,ly+16+i*14,(i+1)+'  '+label,300,8.5));
 wrap('Builder: '+FERRY_SHIP.yard+'. Machinery: '+JOHANSSON_MARINE.name+', '+JOHANSSON_MARINE.works+'.',300,8.5).forEach((l,i)=>out+=text(lx,ly+LIST.length*14+40+i*11,l,'lab'));
 out+=titleBlock(W,Hh,'ENGINE ROOM ARRANGEMENT · plan at the floor plates, centreline elevation, section · 1:20 at 50 px/m',5,['Every rectangle is a box of FERRY_INTERIOR as built (ferry-interior.js); circles are its cylinders. Numbers key the equipment list.']);
 return svg(W,Hh,out,'Minato Maru · engine room arrangement · Johansson Shipyard');
}

// ---------------------------------------------------------------- 6. Fire control and safety plan
/** The plan as posted aboard (ferry-safety-plan.js draws it; here it is bound in the book, unmarked). */
export function safetyPlan(){
 const W=1260,Hh=900,out=[];
 out.push(`<g transform="translate(30,30)">`);drawSafetyPlan(svgPen(out),1180,700,null);out.push('</g>');
 return svg(W,Hh,out.join('')+titleBlock(W,Hh,'FIRE CONTROL AND SAFETY PLAN · posted in the lower lobby, the saloon, the crew corridor and the control booth · 1:46 at 20 px/m',6,['Symbols after the IMO signs: fire-fighting in red, lifesaving in orange, muster stations and escapes in green, control stations in blue. Items and positions: FERRY_SAFETY_ITEMS (ferry-safety-plan.js), from FERRY_SAFETY and FERRY_GA.']),'Minato Maru · fire control and safety plan');
}
export function build(){
 const hyd=hydrostaticsTable();
 return {
  'lines-plan.svg':linesPlan(),
  'general-arrangement.svg':generalArrangement(),
  'electrical-one-line.svg':oneLine(),
  'engine-room-arrangement.svg':engineRoomArrangement(),
  'safety-plan.svg':safetyPlan(),
  'offsets.md':offsetsTable(),
  'hydrostatics.md':hyd.md,
  'tanks.md':tankTable(),
  'electrical-load.md':loadTable(),
 };
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const files=build(),check=process.argv.includes('--check');mkdirSync(OUT,{recursive:true});let stale=0;
 for(const [name,body] of Object.entries(files)){const p=join(OUT,name);if(check){if(!existsSync(p)||readFileSync(p,'utf8')!==body){console.error('stale: docs/minato-maru/'+name);stale++;}}else{writeFileSync(p,body);console.log('wrote docs/minato-maru/'+name);}}
 if(check){console.log(stale?stale+' drawing(s) differ from the data: run node tools/ferry-drawings.mjs':'drawings match the data');process.exit(stale?1:0);}
 const laden=hydrostaticsTable().laden;console.log(`laden ${T} m: ${r1(laden.displacement)} t (data ${SH.displacement}), Cb ${r3(laden.cb)} (data ${SH.blockCoefficient}), KM ${r3(laden.kmT)} m, LCB ${r2(laden.lcb)} m from transom`);
}
