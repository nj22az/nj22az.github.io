import * as THREE from '../../vendor/three.module.js';
import {unitToModel,headReach,dirAt} from './head-cover.js';
import {orient} from './police-uniform.js';

/**
 * The kitchen kerchief: a sankakukin (三角巾), the triangle of cotton every Japanese school-lunch server, kitchen hand and
 * shop cook ties over the hair (and the boiler-room oiler over his, against the oil mist). The long edge is folded over
 * once and laid across the forehead at the hairline; the cloth covers the head to the back; the two ends go round above
 * the ears and are tied in a knot at the nape, two short tails standing out of it; the point is tucked under the knot.
 *
 * Built as cloth on the head (head-cover.js): its shell lies a couple of millimetres over the head and the hair it
 * covers, every hair point under it drawn in (KERCHIEF.tuck), so nothing comes through and it never floats; the folded
 * edge is a soft roll all round, so the line between the cloth and the forehead is clean. Its colour is the hat colour:
 * white for the school lunch squad and Mrs Nakamura, the red of Sato Ramen's noren for Mrs Sato, red for the oiler.
 */
export const KERCHIEF=Object.freeze({
 /** The folded edge's height on the head's unit sphere: across the forehead, above the ears, at the nape. */
 edge:Object.freeze({front:.4,side:.2,back:-.36}),gap:.02,roll:.045,
 /** The folded hem: how far up from the edge it reaches (radians on the head) and how far it stands off the cloth. */
 hem:Object.freeze({height:.12,lift:.012}),
 /** The cloth's slack gathered behind above the knot: how far it stands out, how wide and how high it spreads. */
 pouch:Object.freeze({size:.09,across:.85,y:-.05,up:.4}),
 /** Hair under the cloth is tucked from this far outside the edge (in the edge's own measure) to the edge. */
 tuck:Object.freeze([-.07,0]),
 knot:Object.freeze({size:.15}),
 /** The creases fanning from the knot: how far round the head each runs (radians) and how high it reaches. */
 creases:Object.freeze([Object.freeze([1.25,.12]),Object.freeze([.6,.6])]),tails:Object.freeze({length:.42,width:.08,spread:1.0}),
 why:'Hair covered over food, the way school lunch servers and cooks in Japan wear it: a triangle of cotton tied at the nape.',
});

const {smoothstep,lerp}=THREE.MathUtils;
/** The folded edge's height at azimuth a (0 straight ahead). */
export function kerchiefEdge(a){
 const E=KERCHIEF.edge,x=Math.abs(Math.atan2(Math.sin(a),Math.cos(a)));
 return x<Math.PI/2?lerp(E.front,E.side,smoothstep(x,0,Math.PI/2)):lerp(E.side,E.back,smoothstep(x,Math.PI/2,Math.PI));
}
/** How far a unit point is under the cloth (positive) or out from under it (negative). */
export const kerchiefField=(x,y,z)=>{const r=Math.hypot(x,y,z)||1;return y/r-kerchiefEdge(Math.atan2(x,z));};
/** How much of the hair at a unit point the kerchief tucks in (0–1). */
export const kerchiefTuck=(x,y,z)=>smoothstep(kerchiefField(x,y,z),KERCHIEF.tuck[0],KERCHIEF.tuck[1]);

export function addKerchief(list,recipe,m,kit){
 const K=KERCHIEF,c=recipe.outfit.hatColour,spec=kit.HAIR[recipe.hair.style]||null,flip=recipe.hair.flip,U=v=>unitToModel(v,m);
 const fold=new THREE.Color(c).multiplyScalar(.9).getStyle(),centre=new THREE.Vector3(0,m.headCentre,0);
 // The cloth lies over whatever is highest under it: between two of its rows it is a straight chord, so each point takes the
 // most the head and hair reach a little either side of it, and the chord's own sag.
 // The slack of the cloth gathers behind, above the knot, in a soft pouch: a kerchief, not a swimming cap.
 const pouch=(a,y)=>{const da=Math.atan2(Math.sin(a-Math.PI),Math.cos(a-Math.PI));return K.pouch.size*Math.exp(-((da/K.pouch.across)**2)-(((y-K.pouch.y)/K.pouch.up)**2));};
 const NA=32,NR=9,reach=(a,th,step)=>{let r=0;for(const k of [-.5,0,.5]){const t=Math.min(Math.PI/2,th+k*step);r=Math.max(r,headReach(spec,dirAt(a,Math.sin(t)),1,flip));}return r/Math.cos(step/2)+K.gap+pouch(a,Math.sin(th));};
 const rowTh=(a,j)=>{const e=Math.asin(kerchiefEdge(a));return e+(Math.PI/2-e)*j/NR;},rings=[];
 for(let j=0;j<NR;j++){const row=[];
  for(let i=0;i<NA;i++){const a=i/NA*Math.PI*2,th=rowTh(a,j),step=rowTh(a,1)-rowTh(a,0),d=dirAt(a,Math.sin(th));row.push(U(d.multiplyScalar(reach(a,th,step))));}
  rings.push(row);}
 const pos=[],index=[];for(const row of rings)for(const p of row)pos.push(p.x,p.y,p.z);
 const top=U(new THREE.Vector3(0,reach(0,Math.PI/2,.1),0)),ti=pos.length/3;pos.push(top.x,top.y,top.z);
 for(let j=0;j+1<NR;j++)for(let i=0;i<NA;i++){const a=j*NA+i,b=j*NA+(i+1)%NA,cc=a+NA,d=b+NA;index.push(a,cc,b,b,cc,d);}
 for(let i=0;i<NA;i++)index.push((NR-1)*NA+i,ti,(NR-1)*NA+(i+1)%NA);
 const cloth=new THREE.BufferGeometry();cloth.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));cloth.setIndex(index);
 kit.part(list,orient(cloth,()=>centre),'head',c);
 // The folded hem: the long edge turned over once, a band of double cloth from the forehead round above the ears to the
 // knot, standing a little proud of the cloth, its lower edge rolled.
 const B=K.hem,NB=48,hemRows=[];
 for(const [f,lift] of [[0,B.lift],[1,B.lift],[1,0]]){const row=[];
  for(let i=0;i<NB;i++){const a=i/NB*Math.PI*2,e=Math.asin(kerchiefEdge(a)),th=e+B.height*f,step=rowTh(a,1)-rowTh(a,0),d=dirAt(a,Math.sin(th));row.push(U(d.multiplyScalar(reach(a,th,step)+lift)));}
  hemRows.push(row);}
 {const pos=[],idx=[];for(const row of hemRows)for(const p of row)pos.push(p.x,p.y,p.z);
  for(let j=0;j+1<hemRows.length;j++)for(let i=0;i<NB;i++){const a=j*NB+i,b=j*NB+(i+1)%NB;idx.push(a,a+NB,b,b,a+NB,b+NB);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setIndex(idx);
  kit.part(list,orient(g,()=>centre),'head',c).attributes.ink.array.fill(.7);}
 const edge=hemRows[0].map((p,i)=>{const a=i/NB*Math.PI*2,e=Math.asin(kerchiefEdge(a)),d=dirAt(a,Math.sin(e));return U(d.multiplyScalar(reach(a,e,rowTh(a,1)-rowTh(a,0))+K.roll*.5));});
 kit.part(list,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(edge,true),NB,m.Rh*K.roll*.5,4,true),'head',fold).attributes.ink.array.fill(.5);
 // The cloth drawn back to the knot: soft creases fanning out from it over the back and the sides.
 for(const [da,el] of K.creases)for(const sgn of [-1,1]){
  const pts=[];for(let i=0;i<=16;i++){const f=i/16,a=Math.PI+sgn*da*f**.8,e0=Math.asin(K.edge.back+.08),th=e0+(el-e0)*f,step=rowTh(a,1)-rowTh(a,0);
   pts.push(U(dirAt(a,Math.sin(th)).multiplyScalar(reach(a,th,step)+.006)));}
  const g=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),10,m.Rh*.018,3,false);
  // thicker in the middle of its run, nothing at its ends: a fold that fades into the cloth
  const P=g.attributes.position;for(let i=0;i<P.count;i++){const t=Math.floor(i/4)/10,c=new THREE.CatmullRomCurve3(pts).getPointAt(t),v=new THREE.Vector3().fromBufferAttribute(P,i);v.sub(c).multiplyScalar(Math.sin(Math.PI*t)**.7).add(c);P.setXYZ(i,v.x,v.y,v.z);}
  g.computeVertexNormals();kit.part(list,g,'head',fold).attributes.ink.array.fill(.15);
 }
 // The knot at the nape and its two tails, standing out and down from it.
 const dk=dirAt(Math.PI,K.edge.back+.05),knot=U(dk.clone().multiplyScalar(reach(Math.PI,Math.asin(K.edge.back+.05),.1)+K.roll*1.6)),R=m.Rh;
 kit.part(list,new THREE.SphereGeometry(1,8,6),'head',fold,new THREE.Matrix4().compose(knot,new THREE.Quaternion(),new THREE.Vector3(R*K.knot.size*1.25,R*K.knot.size*.85,R*K.knot.size*.8))).attributes.ink.array.fill(.6);
 for(const s of [-1,1]){
  const T=K.tails,dir=new THREE.Vector3(s*Math.sin(T.spread),-Math.cos(T.spread),-.35).normalize(),mid=knot.clone().addScaledVector(dir,R*T.length*.5);
  const g=new THREE.CapsuleGeometry(1,1.6,2,6);
  const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),dir);
  // flat cloth: thin across its face, which looks out from the nape
  const flat=new THREE.Quaternion().setFromAxisAngle(dir,s*.35);q.premultiply(flat);
  kit.part(list,g,'head',c,new THREE.Matrix4().compose(mid,q,new THREE.Vector3(R*T.width,R*T.length/3.6,R*T.width*.3))).attributes.ink.array.fill(.5);
 }
 return {knot,edge:KERCHIEF.edge};
}
