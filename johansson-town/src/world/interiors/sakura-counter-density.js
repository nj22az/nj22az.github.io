import * as THREE from '../../../vendor/three.module.js';
import {mergeGeometries} from '../../../vendor/BufferGeometryUtils.js';
import CAD from './sakura-counter-density.json' with {type:'json'};
import {SAKURA_REBUILD_OFFSET} from './sakura-rebuild-layout.js';

// CAD millimetres: x east, depth north, y up. Decorative fixtures only; no stock/save changes.
export function buildSakuraCounterDensity(room){
 const group=new THREE.Group();group.name='Sakura dense counter bay';group.position.set(...SAKURA_REBUILD_OFFSET);room.add(group);
 const parts=new Map(),materials={steel:new THREE.MeshStandardMaterial({color:0xa9b2ae,metalness:.65,roughness:.36}),cream:new THREE.MeshStandardMaterial({color:0xe8e1cc,roughness:.65}),wood:new THREE.MeshStandardMaterial({color:0xb99160,roughness:.72}),dark:new THREE.MeshStandardMaterial({color:0x354943,roughness:.7}),broth:new THREE.MeshStandardMaterial({color:0x765137,roughness:.28}),food:new THREE.MeshStandardMaterial({color:0xd5b47a,roughness:.75}),warm:new THREE.MeshStandardMaterial({color:0xffdc9d,emissive:0xffa54b,emissiveIntensity:.65,roughness:.4}),pet:new THREE.MeshStandardMaterial({color:0xcfe4dd,transparent:true,opacity:.20,depthWrite:false,roughness:.2})};
 const box=(x,d,w,l,h,y,kind)=>{const g=new THREE.BoxGeometry(w/1000,h/1000,l/1000);g.translate((x+w/2)/1000,(y+h/2)/1000,-(d+l/2)/1000);if(!parts.has(kind))parts.set(kind,[]);parts.get(kind).push(g);};
 const C=CAD.cabinet;
 for(const x of [C.x+20,C.x+C.width-40])for(const d of [C.depth+20,C.depth+C.length-40])box(x,d,20,20,C.supportHeight,C.bottom-C.supportHeight,'steel');
 box(C.x+C.width-18,C.depth,18,C.length,C.height,C.bottom,'cream');
 for(const d of [C.depth,C.depth+C.length-12])box(C.x,d,C.width,12,C.height,C.bottom,'steel');
 for(let r=0;r<C.rows;r++){
  const y=C.bottom+45+r*C.rowPitch;
  box(C.x,C.depth,C.width,C.length,10,y,'steel');box(C.x-3,C.depth,3,C.length,22,y-25,'cream');
  for(let k=0;k<C.columns;k++)box(C.x+18,C.depth+35+k*103,28,70,C.packHeight,y+10,'cream');
 }
 box(C.x,C.depth,C.width,C.length,12,C.bottom+C.height-12,'steel');
 const cv=document.createElement('canvas');cv.width=1536;cv.height=768;const ctx=cv.getContext('2d');
 const colors=['#b84932','#285c50','#e8d9ac','#3f6484','#743e46','#efeada'];
 for(let i=0;i<48;i++){
  const x=i%12*128,y=Math.floor(i/12)*192;ctx.fillStyle=colors[i%6];ctx.fillRect(x,y,128,192);ctx.fillStyle=i%6===5?'#32584c':'#fff6df';ctx.textAlign='center';ctx.font='bold 18px sans-serif';ctx.fillText(['SAKURA','MINATO','HARBOR','ISLAND','SAKURA','MINATO'][i%6],x+64,y+44,116);
  ctx.fillRect(x+13,y+65,102,6);ctx.font='12px sans-serif';ctx.fillText('FILTER',x+64,y+95);ctx.fillStyle='#f6eddb';ctx.fillRect(x,y+150,128,42);ctx.fillStyle='#263d35';ctx.font='bold 26px sans-serif';ctx.fillText(String(i+1).padStart(2,'0'),x+64,y+181);
 }
 const texture=new THREE.CanvasTexture(cv);texture.colorSpace=THREE.SRGBColorSpace;const printed=[];
 const face=(x,d,y,w,h,i,tag=false)=>{
  const g=new THREE.PlaneGeometry(w/1000,h/1000);g.rotateY(-Math.PI/2);g.translate(x/1000,y/1000,-d/1000);const uv=g.attributes.uv;
  for(let n=0;n<uv.count;n++)uv.setXY(n,(i%12+.02+uv.getX(n)*.96)/12,1-(Math.floor(i/12)+(tag?.79:.02)+(1-uv.getY(n))*(tag?.20:.75))/4);printed.push(g);
 };
 for(let r=0;r<4;r++)for(let k=0;k<12;k++){
  const i=r*12+k,d=C.depth+70+k*103,y=C.bottom+55+C.packHeight/2+r*C.rowPitch;face(C.x+17,d,y,70,C.packHeight,i);face(C.x-4,d,C.bottom+31+r*C.rowPitch,46,19,i,true);
 }
 const prints=new THREE.Mesh(mergeGeometries(printed),new THREE.MeshStandardMaterial({map:texture,roughness:.65}));prints.name='Sakura numbered cigarette fronts';group.add(prints);printed.forEach(g=>g.dispose());
 const O=CAD.oden;
 box(O.x,O.depth,O.width,O.length,15,O.bottom,'steel');
 for(const x of [O.x,O.x+O.width-15])box(x,O.depth,15,O.length,85,O.bottom+15,'steel');
 for(const d of [O.depth,O.depth+O.length-15])box(O.x,d,O.width,15,85,O.bottom+15,'steel');
 box(O.x+16,O.depth+16,O.width-32,O.length-32,5,O.bottom+61,'broth');
 for(const x of [O.x+145,O.x+290])box(x,O.depth+16,6,O.length-32,30,O.bottom+62,'steel');box(O.x+16,O.depth+295,O.width-32,6,30,O.bottom+62,'steel');
 for(let k=0;k<6;k++)box(O.x+25+k*67,O.depth+325,56,250,12,O.bottom+102,'wood');
 for(const d of [O.depth+355,O.depth+535])box(O.x+25,d,391,15,15,O.bottom+114,'wood');
 // Daikon slices, fishcake blocks and fish balls, kept inside their broth compartments.
 for(let r=0;r<2;r++)for(let k=0;k<3;k++){
  const x=O.x+80+k*135,d=O.depth+80+r*110;
  if(k===1)box(x-32,d-30,64,60,25,O.bottom+66,'food');
  else{const geometry=k===0?new THREE.CylinderGeometry(.036,.036,.027,16):new THREE.SphereGeometry(.027,12,8);geometry.translate(x/1000,(O.bottom+80)/1000,-d/1000);if(!parts.has('cream'))parts.set('cream',[]);parts.get('cream').push(geometry);}
 }
 const I=CAD.impulse;
 box(I.x,I.depth,I.width,I.length,12,I.bottom,'steel');box(I.x+I.width-10,I.depth,10,I.length,I.height,I.bottom,'steel');
 for(let r=0;r<2;r++)for(let k=0;k<3;k++){box(I.x+20,I.depth+20+k*80,155,55,25,I.bottom+20+r*95,k%2?'wood':'dark');box(I.x,I.depth+20+k*80,5,55,30,I.bottom+16+r*95,'pet');}
 const K=CAD.ticketStand;
 box(K.x,K.depth,K.width,K.length,12,K.bottom,'wood');box(K.x+K.width-12,K.depth,12,K.length,K.height,K.bottom,'wood');
 for(let k=0;k<5;k++)box(K.x+40+k*12,K.depth+15,2,100,145,K.bottom+12,'cream');
 // Warm emissive strips sit within retained hot-food glazing. No extra shadow-casting lights.
 box(11680,5420,410,310,4,1320,'warm');box(11680,5770,410,410,4,1145,'warm');
 for(const [kind,geometries]of parts){const mesh=new THREE.Mesh(mergeGeometries(geometries),materials[kind]);mesh.name='Sakura counter '+kind;mesh.castShadow=kind!=='pet';mesh.receiveShadow=true;group.add(mesh);geometries.forEach(g=>g.dispose());}
 // Small original printed wrappers and a ticket header, on the actual prop surfaces.
 const micro=document.createElement('canvas');micro.width=768;micro.height=256;const ink=micro.getContext('2d');
 for(const [i,title,color]of [[0,'MINT','#376756'],[1,'LEMON','#b89b3c'],[2,'KUJI','#ae4b37']]){ink.fillStyle=color;ink.fillRect(i*256,0,256,256);ink.fillStyle='#fff2d8';ink.textAlign='center';ink.font='bold 48px sans-serif';ink.fillText(title,i*256+128,126,235);ink.font='24px sans-serif';ink.fillText(i===2?'SAKURA':'CHEWING GUM',i*256+128,182,235);}
 const microTexture=new THREE.CanvasTexture(micro);microTexture.colorSpace=THREE.SRGBColorSpace;const labels=[];
 const label=(geometry,i)=>{const uv=geometry.attributes.uv;for(let n=0;n<uv.count;n++)uv.setX(n,(i+.02+uv.getX(n)*.96)/3);labels.push(geometry);};
 for(let r=0;r<2;r++)for(let k=0;k<3;k++){const g=new THREE.PlaneGeometry(.145,.045);g.rotateX(-Math.PI/2);g.translate((I.x+97.5)/1000,(I.bottom+46+r*95)/1000,-(I.depth+47.5+k*80)/1000);label(g,k%2);}
 const ticket=new THREE.PlaneGeometry(.10,.07);ticket.rotateY(-Math.PI/2);ticket.translate((K.x+K.width-13)/1000,(K.bottom+195)/1000,-(K.depth+K.length/2)/1000);label(ticket,2);
 const microMesh=new THREE.Mesh(mergeGeometries(labels),new THREE.MeshStandardMaterial({map:microTexture,roughness:.75}));microMesh.name='Sakura gum and ticket prints';group.add(microMesh);labels.forEach(g=>g.dispose());
 const path=[];for(let i=0;i<=100;i++){const t=i/100;path.push(new THREE.Vector3(11.755+.16*t,.789+Math.sin(t*Math.PI*16)*.008,-3.73-.20*t+Math.cos(t*Math.PI*16)*.009));}
 path.push(new THREE.Vector3(11.94,.789,-3.89),new THREE.Vector3(11.94,.789,-3.2),new THREE.Vector3(11.90,.789,-2.90));
 const cord=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(path),100,.0025,5,false),materials.dark);cord.name='Sakura scanner coiled cord';group.add(cord);
 group.userData={drawing:CAD.drawing,cabinet:C,oden:O,impulse:I,ticketStand:K,packFronts:48,stockChanges:false,newInteractions:false,endcapStatus:'CAD proposal only'};return group;
}
