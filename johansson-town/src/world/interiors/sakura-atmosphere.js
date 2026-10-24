import * as THREE from '../../../vendor/three.module.js';
import {mergeGeometries} from '../../../vendor/BufferGeometryUtils.js';
import DATA from './sakura-atmosphere.json' with {type:'json'};
import {crayon} from './sakura-crayon.js';
import {SAKURA_REBUILD_OFFSET} from './sakura-rebuild-layout.js';

const point=(x,d,y)=>new THREE.Vector3(x/1000,y/1000,-d/1000);
// Low-contrast radial contact only: one tiny texture/merged draw per location group.
export function addSakuraContacts(parent,records){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const c=canvas.getContext('2d'),gradient=c.createRadialGradient(64,64,8,64,64,64);gradient.addColorStop(0,'rgba(26,38,32,.85)');gradient.addColorStop(.45,'rgba(26,38,32,.40)');gradient.addColorStop(1,'rgba(26,38,32,0)');c.fillStyle=gradient;c.fillRect(0,0,128,128);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;const geometries=[];
 for(const r of records){const g=new THREE.PlaneGeometry(...r.size);g.rotateX(-Math.PI/2);g.translate(...r.center);geometries.push(g);}
 const mesh=new THREE.Mesh(mergeGeometries(geometries),new THREE.MeshBasicMaterial({map:texture,transparent:true,opacity:DATA.contactShadows.opacity,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,toneMapped:false}));geometries.forEach(g=>g.dispose());mesh.name='Sakura soft contact footprints';mesh.userData.footprints=records;parent.add(mesh);return mesh;
}
function batch(parent,name){
 const group=new THREE.Group();group.name=name;parent.add(group);const parts=new Map(),materials=new Map();
 const add=(g,color,kind='solid')=>{const key=color+':'+kind;if(!parts.has(key))parts.set(key,[]);parts.get(key).push(g);if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:kind==='metal'?.35:.78,metalness:kind==='metal'?.55:0,...(kind==='pet'?{transparent:true,opacity:.25,depthWrite:false,roughness:.2}:{})}));};
 const box=(x,d,w,l,h,y,color,kind)=>{const g=new THREE.BoxGeometry(w/1000,h/1000,l/1000);g.translate((x+w/2)/1000,(y+h/2)/1000,-(d+l/2)/1000);add(g,color,kind);};
 const rod=(a,b,r,color,kind='metal')=>{const p=point(...a),q=point(...b),v=q.clone().sub(p),g=new THREE.CylinderGeometry(r/1000,r/1000,v.length(),8);g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize()));g.translate(...p.add(q).multiplyScalar(.5).toArray());add(g,color,kind);};
 const finish=()=>{for(const [k,list]of parts){const m=new THREE.Mesh(mergeGeometries(list),materials.get(k));list.forEach(g=>g.dispose());m.castShadow=!k.endsWith('pet');m.receiveShadow=true;group.add(m);}return group;};return {group,box,rod,finish};
}
export function buildSakuraCounterAtmosphere(room){
 const b=batch(room,'Sakura everyday counter details'),{box,rod}=b,C=DATA.counter;b.group.position.set(...SAKURA_REBUILD_OFFSET);
 const holder=(p,divided=false)=>{const [x,d,w,l]=p.box,y=p.bottom,h=p.height;box(x,d,w,l,3,y,0xc6e4de,'pet');for(const xx of [x,x+w-3])box(xx,d,3,l,h,y,0xc6e4de,'pet');for(const dd of [d,d+l-3])box(x,dd,w,3,h,y,0xc6e4de,'pet');if(divided)box(x+w*.48,d,3,l,h,y,0xc6e4de,'pet');};
 holder(C.chopsticks);holder(C.supplies,true);
 const [sx,sd]=C.supplies.box;
 for(let i=0;i<8;i++)rod([sx+35+i%4*18,sd+35+Math.floor(i/4)*32,783],[sx+35+i%4*18,sd+35+Math.floor(i/4)*32,975+(i%3)*8],2.4,i%2?0xe8b0a0:0xf0e7c9,'solid');
 for(let i=0;i<5;i++){box(sx+150+i*13,sd+30,9,95,140,783,i%2?0xefe9d8:0xd8e7d5);box(sx+149+i*13,sd+38,2,79,30,845,0x5c8275);}
 // Replace the white placeholder with the actual open handwash basin.
 const [x,d,w,l]=C.basin.box,y=C.basin.bottom;box(x,d,w,l,10,y,0x6d827d,'metal');
 for(const xx of [x,x+w-20])box(xx,d,20,l,90,y,0xa8bab3,'metal');for(const dd of [d,d+l-20])box(x,dd,w,20,90,y,0xa8bab3,'metal');
 for(const [xx,dd,ww,ll]of [[x,d,w,28],[x,d+l-28,w,28],[x,d,28,l],[x+w-28,d,28,l]])box(xx,dd,ww,ll,7,y+87,0xc4d0c9,'metal');
 box(x+275,d+225,50,50,2,y+11,0x354d46);const t=C.basin.tap;rod([t.x,t.depth,t.bottom],[t.x,t.depth,t.bottom+t.height],13,0x9faea8);rod([t.x,t.depth,t.bottom+t.height],[t.spoutToX,t.depth,t.bottom+t.height],13,0x9faea8);rod([t.spoutToX,t.depth,t.bottom+t.height],[t.spoutToX,t.depth,985],13,0x9faea8);rod([t.x-35,t.depth,950],[t.x+35,t.depth,950],7,0x82978c);
 const tag=C.odenTag;box(11325,tag.depth-25,60,50,8,780,0x71867d,'metal');rod([11355,tag.depth,788],[11355,tag.depth,1042.5],3,0x71867d);rod([11355,tag.depth,1042.5],[tag.x+3,tag.depth,1042.5],3,0x71867d);
 const paper=new THREE.Shape(tag.outline.map(([x,y])=>new THREE.Vector2(x/1000,-y/1000))),geometry=new THREE.ShapeGeometry(paper);geometry.rotateY(-Math.PI/2);geometry.translate(tag.x/1000,(tag.bottom+tag.height/2)/1000,-tag.depth/1000);
 const canvas=document.createElement('canvas');canvas.width=320;canvas.height=128;const c=canvas.getContext('2d');c.fillStyle='#ffe479';c.fillRect(0,0,320,128);crayon(c,tag.copy[0],160,54,40,'#bc4436');crayon(c,tag.copy[1],160,103,25,'#45654e');const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 // Shape UVs are metres; remap into the shared 320x128 crayon print.
 const uv=geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)/.1+.5,uv.getY(i)/.065+.5);
 const print=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({map:texture,toneMapped:false}));print.name='Sakura hot oden crayon tag';b.group.add(print);
 const contacts=[];for(const r of C.retained.filter(r=>r.id.startsWith('microwave'))){const [x,d,w,l]=r.box;contacts.push({id:r.id,center:point(x+w/2,d+l/2,781.5).toArray(),size:[w/1000*1.24,l/1000*1.24]});}
 for(const x of [13330,13870])for(const d of [4830,6070])contacts.push({id:'tobacco foot',center:point(x,d,781.5).toArray(),size:[.16,.16]});addSakuraContacts(b.group,contacts);
 b.group.userData={drawing:DATA.drawing,revision:DATA.revision,stockChanges:false,retained:C.retained,contacts:contacts.length};return b.finish();
}
export function buildSakuraRoofAtmosphere(parent){
 const b=batch(parent,'Sakura roof maintenance dressing'),{box}=b,R=DATA.roof;
 let tileCount=0;for(const [x,d,w,l]of R.pads)for(let a=0;a<w;a+=400)for(let e=0;e<l;e+=400){box(x+a+10,d+e+10,Math.min(380,w-a-20),Math.min(380,l-e-20),20,4010,[0x9ba79b,0xa7afa0,0x929f94][tileCount%3]);tileCount++;}
 for(const r of R.trim)box(...r,2,4010,0x7e8f85);
 const K=DATA.crates,[x,d,w,l]=K.box,labels=[];
 const cv=document.createElement('canvas');cv.width=512;cv.height=384;const ctx=cv.getContext('2d');
 for(let i=0;i<K.count;i++){
  const y=K.bottom+i*K.height,color=i===1?0x497f9d:0xc7aa4e;
  box(x,d,w,l,18,y,color);
  for(const yy of [y+18,y+260]){for(const xx of [x,x+w-18])box(xx,d,18,l,20,yy,color);for(const dd of [d,d+l-18])box(x,dd,w,18,20,yy,color);}
  for(let n=0;n<8;n++)for(const dd of [d,d+l-12])box(x+20+n*58,dd,12,12,242,y+18,color);
  for(let n=0;n<7;n++)for(const xx of [x,x+w-12])box(xx,d+20+n*58,12,12,242,y+18,color);
  for(const xx of [x,x+w-18])box(xx,d,18,l,K.midBand[1],y+K.midBand[0],color);
  for(const dd of [d,d+l-18])box(x,dd,w,18,K.midBand[1],y+K.midBand[0],color);
  const P=K.labelPanel;box(x+(w-P.width)/2,d+l-10,P.width,10,P.height,y+P.bottom,color);box(x+w-10,d+(l-P.width)/2,10,P.width,P.height,y+P.bottom,color);
  ctx.fillStyle=i===1?'#f1e5bd':'#49664f';ctx.textAlign='center';ctx.font='800 60px sans-serif';ctx.fillText(P.copy[i],256,i*128+66);ctx.font='700 24px sans-serif';ctx.fillText(P.foot,256,i*128+104);
  for(const side of [0,1]){const g=new THREE.PlaneGeometry(P.width/1000,P.height/1000);g.rotateY(side?Math.PI/2:Math.PI);g.translate((side?x+w+P.projection:x+w/2)/1000,(y+P.bottom+P.height/2)/1000,-(side?d+l/2:d+l+P.projection)/1000);const uv=g.attributes.uv;for(let v=0;v<uv.count;v++)uv.setY(v,1-(i+1-uv.getY(v))/3);labels.push(g);}
 }
 const tx=new THREE.CanvasTexture(cv);tx.colorSpace=THREE.SRGBColorSpace;const print=new THREE.Mesh(mergeGeometries(labels),new THREE.MeshBasicMaterial({map:tx,transparent:true,depthWrite:false,alphaTest:.02,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,toneMapped:false}));print.name='Sakura return crate markings';labels.forEach(g=>g.dispose());b.group.add(print);
 const contacts=[];for(const x of [10200,11600])for(const d of [7800,9200])contacts.push({id:'tank foot',center:point(x,d,4011.5).toArray(),size:[.36,.36]});
 for(const [x,d]of [[8140,10860],[8140,13030],[9060,10860],[9060,13030],[4540,10680],[4540,11780],[5460,10680],[5460,11780]])contacts.push({id:'stair post',center:point(x,d,41.5).toArray(),size:[.25,.25]});addSakuraContacts(b.group,contacts);
 b.group.userData={drawing:DATA.drawing,revision:DATA.revision,tiles:tileCount,crates:K,printedCrates:K.count,contacts:contacts.length,routeChanges:false};return b.finish();
}
