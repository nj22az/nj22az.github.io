import * as THREE from '../../../vendor/three.module.js';
import {mergeGeometries} from '../../../vendor/BufferGeometryUtils.js';
import {shopProductTemplate} from '../../commerce/shop-product.js';
import {STORE_BRANDS} from '../../commerce/brands.js';
import {packagingSlot,ATLAS_COLS,ATLAS_ROWS} from './store-advertising.js';

const cache=new Map();
const FOODS=new Set(['rice','bento','sandwich','bun','pudding','yogurt','noodles']);
/** Foods use the same atlas and the same facing envelope as their original packs.
 * Clear wrappers are separate so the shop can instance them with one shared material.
 * Bounds intentionally retain the original envelope: stocking and reach positions
 * must not change when a packet gains visible food inside it.
 */
export function sakuraProductTemplate(id){
 if(cache.has(id))return cache.get(id);
 const original=shopProductTemplate(id);
 if(!FOODS.has(id)&&!['coffee','beer'].includes(id))return original;
 const brand=STORE_BRANDS[id==='bun'?'buns':id],parts=[],prints=[],wrappers=[],components=[],labelSurfaces=[];
 function append(list,geometry,name,color,pos=[0,0,0]){
  let g=geometry.index?geometry.toNonIndexed():geometry;
  if(g!==geometry)geometry.dispose();g.translate(...pos);
  if(color!=null){const c=new THREE.Color(color),values=new Float32Array(g.attributes.position.count*3);for(let i=0;i<values.length;i+=3)values.set(c.toArray(),i);g.setAttribute('color',new THREE.BufferAttribute(values,3));}
  if(list===parts)components.push({name,start:parts.reduce((n,p)=>n+p.attributes.position.count,0),count:g.attributes.position.count});
  list.push(g);return g;
 }
 const part=(g,color,pos,name)=>append(parts,g,name,color,pos);
 const box=(w,h,d,pos,color,name)=>part(new THREE.BoxGeometry(w,h,d),color,pos,name);
 const cylinder=(rt,rb,h,pos,color,name)=>part(new THREE.CylinderGeometry(rt,rb,h,16),color,pos,name);
 const ellipsoid=(scale,pos,color,name,segments=10,rings=6)=>part(new THREE.SphereGeometry(1,segments,rings).scale(...scale),color,pos,name);
 function triangle(points,depth){const shape=new THREE.Shape();shape.moveTo(...points[0]);for(const p of points.slice(1))shape.lineTo(...p);shape.closePath();return new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:false,steps:1}).translate(0,0,-depth/2);}
 function label(geometry,pos,name){
  const g=append(prints,geometry,name,null,pos),uv=g.attributes.uv,slot=packagingSlot(id);
  for(let i=0;i<uv.count;i++)uv.setXY(i,(slot%ATLAS_COLS+.025+uv.getX(i)*.95)/ATLAS_COLS,1-(Math.floor(slot/ATLAS_COLS)+.025+(1-uv.getY(i))*.95)/ATLAS_ROWS);
  labelSurfaces.push({name,start:prints.slice(0,-1).reduce((n,p)=>n+p.attributes.position.count,0),count:g.attributes.position.count});
 }
 const topLabel=(r,y,name)=>label(new THREE.CircleGeometry(r,16).rotateX(-Math.PI/2),[0,y,0],name);
 const frontLabel=(w,h,pos,name)=>label(new THREE.PlaneGeometry(w,h),pos,name);
 const wrap=(g,pos=[0,0,0])=>append(wrappers,g,'clear wrapping',null,pos);
 function band(topRadius,bottomRadius,height,centre,fullHeight,start=-Math.PI*.48,length=Math.PI*.96){
  const radiusAt=y=>bottomRadius+(topRadius-bottomRadius)*y/fullHeight;
  label(new THREE.CylinderGeometry(radiusAt(centre+height/2)+.0008,radiusAt(centre-height/2)+.0008,height,16,1,true,start,length),[0,centre,0],'brand cup band');
 }

 if(id==='rice'){
  const outline=[[-.066,.003],[.066,.003],[0,.114]];
  part(triangle(outline,.056),0xf6f1dd,[0,0,0],'triangular rice');
  // Individual grains break up the rice face while staying inside the wrapper.
  for(let row=0;row<4;row++)for(let col=0;col<5-row;col++){
   const y=.067+row*.011,x=(col-(4-row)/2)*.012;
   ellipsoid([.0034,.0017,.0011],[x,y,.0286],col%2?0xe5dfca:0xfffae9,'rice grain',6,4);
  }
  box(.063,.057,.004,[0,.031,.031],0x293d2e,'nori front');
  box(.063,.057,.004,[0,.031,-.031],0x293d2e,'nori back');
  box(.063,.003,.066,[0,.0015,0],0x293d2e,'folded nori base');
  box(.052,.022,.001,[0,.029,.0335],brand.paper,'rice paper label');
  frontLabel(.050,.020,[0,.029,.0345],'onigiri front label');
  wrap(triangle([[-.069,.001],[.069,.001],[0,.118]],.074));
  box(.008,.003,.004,[0,.119,0],brand.accent,'wrapper tear tab');
 }else if(id==='bento'){
  box(.190,.008,.132,[0,.004,0],0x292b26,'bento tray base');
  for(const z of [-.064,.064])box(.192,.030,.004,[0,.023,z],0x32372c,'bento tray rim');
  for(const x of [-.094,.094])box(.004,.030,.132,[x,.023,0],0x32372c,'bento tray rim');
  box(.004,.023,.122,[0,.020,0],0x32372c,'compartment divider');
  box(.086,.023,.004,[.047,.020,.010],0x32372c,'compartment divider');
  box(.080,.014,.112,[-.047,.016,0],0xf2edd8,'rice bed');
  for(let row=0;row<5;row++)for(let col=0;col<4;col++)ellipsoid([.0045,.002,.0025],[-.077+col*.019,.024,-.045+row*.022],col%2?0xe6dfca:0xfff8e9,'bento rice grain',6,4);
  ellipsoid([.010,.005,.010],[-.046,.029,.001],0xb84440,'plum pickle');
  for(const z of [-.040,-.014]){
   box(.059,.014,.021,[.047,.020,z],0x9d6236,'grilled protein');
   for(const x of [.028,.047,.066])box(.003,.002,.019,[x,.028,z],0x5d3a28,'grill mark');
  }
  for(const z of [.024,.043])box(.029,.018,.015,[.065,.022,z],0xe6c359,'rolled egg');
  for(const x of [.018,.031])ellipsoid([.007,.006,.014],[x,.021,.036],0x668643,'greens',8,4);
  for(const z of [.025,.044])box(.011,.012,.014,[.045,.020,z],0xe4953d,'pickled vegetable');
  // A narrow sleeve identifies the meal without hiding the compartments.
  box(.042,.003,.128,[.005,.052,0],brand.paper,'bento paper sleeve');
  label(new THREE.PlaneGeometry(.124,.040).rotateX(-Math.PI/2).rotateY(Math.PI/2),[.005,.0545,0],'bento lid sleeve');
  wrap(new THREE.BoxGeometry(.192,.010,.134),[0,.045,0]);
 }else if(id==='sandwich'){
  const crust=[[-.064,.012],[.064,.012],[0,.125]],crumb=[[-.057,.018],[.057,.018],[0,.116]];
  for(const z of [-.0175,.0175]){
   part(triangle(crust,.010),0xb9834b,[0,0,z],'bread crust');
   part(triangle(crumb,.0108),0xf7edd2,[0,0,z],'bread crumb');
  }
  part(triangle([[-.059,.015],[.059,.015],[0,.117]],.019),0xecd274,[0,0,0],'egg filling');
  for(const z of [-.011,.011])part(triangle([[-.058,.015],[.058,.015],[0,.115]],.002),0x769451,[0,0,z],'lettuce filling');
  for(const z of [-.0255,.0255])box(.040,.025,.001,[0,.035,z],brand.paper,'sandwich paper label');
  frontLabel(.038,.023,[0,.035,.0265],'sandwich front label');
  label(new THREE.PlaneGeometry(.038,.023).rotateY(Math.PI),[0,.035,-.0265],'sandwich back label');
  wrap(triangle([[-.069,.0105],[.069,.0105],[0,.130]],.052));
 }else if(id==='bun'){
  box(.105,.002,.086,[0,.001,0],0xf1ead7,'steamer paper square');
  part(new THREE.CylinderGeometry(.053,.049,.019,16).scale(1,1,.79),0xeee0bd,[0,.0115,0],'bun base');
  part(new THREE.SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI/2).scale(.055,.063,.041),0xf5e9c8,[0,.021,0],'round steamed bun');
  for(let i=0;i<8;i++){
   const angle=i*Math.PI/4,start=new THREE.Vector3(0,.084,0),end=new THREE.Vector3(Math.cos(angle)*.039,.059,Math.sin(angle)*.030),delta=end.clone().sub(start);
   const ridge=new THREE.CylinderGeometry(.0011,.0018,delta.length(),5);ridge.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize()));
   part(ridge,0xdfcfaa,start.clone().add(end).multiplyScalar(.5).toArray(),'bun pleat');
  }
  box(.062,.018,.001,[0,.010,.043],brand.paper,'bun paper label');
  frontLabel(.060,.016,[0,.010,.044],'bun base label');
 }else if(id==='pudding'||id==='yogurt'){
  const yogurt=id==='yogurt',r=yogurt?.048:.038,h=yogurt?.078:.062,rb=r*.76;
  if(yogurt){
   cylinder(r-.002,rb-.002,h-.009,[0,(h-.009)/2+.002,0],0xf3f0df,'yogurt cream');
   cylinder(rb+.001,rb,.011,[0,.0055,0],0x729789,'yogurt cup foot');
  }else{
   cylinder(rb+.001,rb-.001,.010,[0,.005,0],0x9b5529,'caramel layer');
   cylinder(r-.002,rb+.001,h-.016,[0,.010+(h-.016)/2,0],0xf0d591,'custard layer');
  }
  const lidRadius=r+.0025;
  cylinder(lidRadius,lidRadius,.002,[0,h+.001,0],0xddd9c8,'foil lid');
  part(new THREE.TorusGeometry(r+.001,.001,4,16).rotateX(Math.PI/2),0xb8bdb4,[0,h+.0015,0],'rolled foil rim');
  topLabel(r-.003,h+.0025,'printed foil lid');
  band(r,rb,yogurt?.032:.020,yogurt?.039:.034,h);
  wrap(new THREE.CylinderGeometry(r+.0002,rb+.0002,h,16,1,true),[0,h/2,0]);
 }else if(id==='noodles'){
  cylinder(.067,.052,.128,[0,.064,0],brand.paper,'tapered ramen cup');
  cylinder(.053,.053,.004,[0,.002,0],0xbbb8a3,'cup foot');
  cylinder(.070,.070,.003,[0,.1315,0],brand.accent,'ramen lid rim');
  cylinder(.0675,.0675,.0015,[0,.132,0],0xf2dfb5,'foil lid');
  band(.067,.052,.105,.065,.128);
  topLabel(.065,.134,'ramen lid print');
  box(.010,.001,.011,[.062,.132,-.022],brand.ink,'ramen pull tab');
 }else{
  // Existing can art and silhouette remain; a dark opening and ring sit above the
  // lid inside its raised rim, rather than creating a new outer can size.
  const h=.135;
  append(parts,original.body.clone(),'original can body',null);
  cylinder(.007,.007,.0005,[0,h+.00225,-.010],0x505850,'can opening');
  const ring=new THREE.TorusGeometry(.006,.00085,4,12).rotateX(Math.PI/2);
  part(ring,0xd6d9cd,[0,h+.00235,.006],'can pull ring');
  box(.005,.0006,.005,[0,h+.0024,0],0xb6bdb3,'pull tab rivet');
  const print=original.art.clone();prints.push(print.toNonIndexed());print.dispose();
 }
 function merged(list){if(!list.length)return null;const g=mergeGeometries(list);list.forEach(p=>p.dispose());g.computeBoundingBox();g.computeBoundingSphere();return g;}
 const body=merged(parts),art=merged(prints),glass=merged(wrappers);
 body.userData.components=components;art.userData.labelSurfaces=labelSurfaces;
 const result={body,art,bounds:original.bounds.clone()};if(glass)result.glass=glass;
 cache.set(id,result);return result;
}
