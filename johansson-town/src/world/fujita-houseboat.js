import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {assetURL} from '../assets.js';
import {mergeGeometries} from '../../vendor/BufferGeometryUtils.js';
// West of the working pier: the cargo ship uses the eastern side.
export const HOUSEBOAT=Object.freeze({x:-40.5,z:-56.5,deckY:.06,width:3.1,length:6.8,
 gangway:{minX:-39.45,maxX:-37.55,minZ:-54.65,maxZ:-53.75},
 bedside:[.26,.06,-.55],bed:[-.63,.85,-.65],cover:{position:[-.63,.85,-1.5],width:1.12,length:1.55}});
export function houseboatSurface(x,z,r=0){
 const B=HOUSEBOAT,G=B.gangway,inside=(a,b,c,d)=>x>=a+r&&x<=b-r&&z>=c+r&&z<=d-r;
 if(inside(G.minX,G.maxX,G.minZ,G.maxZ))return {id:'fujita-gangway',surface:'wood',y:x>=-38.3?0:B.deckY};
 if(inside(B.x-1.48,B.x+1.48,B.z-3.2,B.z+3.2))return {id:'fujita-houseboat',surface:'wood',y:B.deckY};
 return null;
}
export function createHouseboatModel(hull=null,{shadows=false}={}){
 const g=new THREE.Group();g.name='Shiosai — Mr Fujita’s houseboat';const materials=new Map();
 const mat=(color,extra={})=>{const key=JSON.stringify([color,extra]);if(!materials.has(key))materials.set(key,new THREE.MeshStandardMaterial({color,roughness:.86,...extra}));return materials.get(key);};
 const wood=mat(0x846449),trim=mat(0xeee1bd),blue=mat(0x294f64),metal=mat(0x66726f,{metalness:.25,roughness:.65}),glass=mat(0x8bb6bb,{transparent:true,opacity:.3,roughness:.25});
 const box=(name,size,at,m)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(...size),m);o.name=name;o.position.set(...at);o.castShadow=shadows;o.receiveShadow=true;g.add(o);return o;};
 if(hull)g.add(hull);else box('Temporary hull',[3.05,.6,6.7],[0,-.39,0],blue.clone()).userData.temporaryHull=true;
 box('Deck',[3.12,.1,6.8],[0,.01,0],wood);
 for(let x=-1.4;x<1.5;x+=.22)box('Deck caulking',[.013,.005,6.65],[x,.063,0],mat(0x433a30));
 for(const side of [-1,1]){
  box('Cream rubbing strake',[.08,.12,6.2],[side*1.62,-.19,0],trim);
  for(const z of [-2.9,-1.3,.7,2.9]){const f=new THREE.Mesh(new THREE.TorusGeometry(.19,.07,6,12),mat(0x252a2b));f.name='Tyre fender';f.rotation.y=Math.PI/2;f.position.set(side*1.73,-.24,z);g.add(f);}
 }
 // Timber cabin. Windows have clear openings; the sliding door is parked open.
 for(const side of [-1,1]){
  const x=side*1.25;
  box('Cabin sill',[.08,.78,3.3],[x,.45,-.95],wood);box('Cabin header',[.08,.48,3.3],[x,1.93,-.95],wood);
  for(const z of [-2.55,-1.85,-.45,.65])box('Window post',[.1,1.35,.12],[x,1.2,z],trim);
  for(const z of [-1.15,.1]){box('Cabin window',[.02,.87,z<0?1.25:.85],[x,1.25,z],glass);box('Window sill',[.13,.06,z<0?1.4:1],[x,.8,z],trim);}
 }
 box('Cabin stern wall',[2.55,2.12,.09],[0,1.12,-2.6],wood);box('Cabin front left',[1.3,2.12,.09],[-.61,1.12,.7],wood);
 box('Door lintel',[1.2,.24,.13],[.65,2.06,.7],trim);box('Door jamb',[.09,1.86,.13],[1.23,1.04,.7],trim);
 box('Open sliding door',[.95,1.82,.08],[-.52,1.01,.78],blue);box('Door frosted panel',[.78,.68,.015],[-.52,1.34,.828],glass);
 box('Houseboat cutaway roof',[2.85,.14,3.72],[0,2.24,-.92],metal).userData.houseboatRoof=true;
 for(let x=-1.3;x<=1.3;x+=.15)box('Roof corrugation',[.025,.025,3.67],[x,2.32,-.92],metal).userData.houseboatRoof=true;
 box('Berth frame',[1.18,.43,2.05],[-.63,.28,-1.65],blue);box('Berth mattress',[1.13,.13,1.98],[-.63,.56,-1.65],mat(0xcac5ac));
 box('Berth pillow',[.66,.14,.35],[-.63,.70,-2.35],mat(0xf3e7cc));box('Folded quilt',[1.08,.12,.45],[-.63,.69,-.85],mat(0x557b72));
 for(let i=0;i<4;i++)box('Quilt stripe',[.035,.006,.45],[-1.04+i*.26,.756,-.85],trim);
 box('Bedside shelf',[.32,.05,.35],[.07,.63,-2.2],wood);box('Radio',[.24,.16,.11],[.07,.73,-2.2],mat(0x403c34));
 box('Galley cabinet',[.5,.75,.94],[.93,.44,-1.98],trim);box('Galley worktop',[.56,.06,1.02],[.93,.85,-1.98],metal);
 box('Sink',[.32,.025,.28],[.93,.888,-2.19],mat(0x39484b,{metalness:.4}));
 const tap=new THREE.Mesh(new THREE.TorusGeometry(.065,.012,6,12,Math.PI),metal);tap.name='Galley tap';tap.position.set(.96,.98,-2.4);g.add(tap);
 const stove=new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,.035,12),mat(0x242b2d));stove.position.set(.93,.9,-1.7);g.add(stove);
 const kettle=new THREE.Mesh(new THREE.SphereGeometry(.105,12,8),metal);kettle.scale.y=.85;kettle.position.set(.93,1,-1.7);g.add(kettle);
 box('Hanging hand towel',[.025,.33,.22],[.655,.6,-1.95],mat(0xf3e7cc));
 for(let i=0;i<4;i++)box('Paperback',[.08,.22,.14],[.73+i*.09,1.3,-2.48],mat([0x756647,0x435c70,0x99624c,0x707c54][i]));
 box('Bookshelf',[.65,.05,.22],[.91,1.17,-2.47],wood);
 const clock=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.04,20),trim);clock.rotation.x=Math.PI/2;clock.position.set(.28,1.72,-2.53);clock.name='Cabin clock';g.add(clock);
 for(const [w,h,x,y] of [[.015,.12,.28,1.76],[.1,.015,.31,1.72]])box('Clock hand',[w,h,.015],[x,y,-2.501],blue);
 box('Entrance mat',[.82,.025,.55],[.66,.08,1.08],mat(0x506e58));
 for(const x of [-1.48,1.48])for(const z of [1.2,3.2])box('Deck rail post',[.045,.65,.045],[x,.39,z],trim);
 box('Bow rail',[3,.045,.045],[0,.72,3.2],trim);box('Port rail',[.045,.045,2],[-1.48,.72,2.2],trim);
 for(const x of [-1.05,1.05])box('Mooring cleat',[.3,.07,.08],[x,.12,2.95],metal);
 box('Freshwater tank',[.45,.46,.35],[-.98,.3,2.55],mat(0xd4d9cc));box('Boot tray',[.5,.03,.3],[-.92,.1,1.15],blue);
 for(const x of [-1.05,-.81])box('Boat slippers',[.16,.05,.25],[x,.145,1.15],trim);
 box('Cabin lamp',[.14,.08,.14],[.55,2.06,-.3],mat(0xffe0a5,{emissive:0xffc77f,emissiveIntensity:0})).userData.houseboatLamp=true;
 box('Shiosai name board',[.025,.25,1.25],[-1.306,1.94,-1.02],blue);
 if(typeof document!=='undefined'){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d');
  if(ctx){ctx.fillStyle='#294f64';ctx.fillRect(0,0,512,128);ctx.fillStyle='#eee1bd';ctx.font='bold 58px serif';ctx.textAlign='center';ctx.fillText('SHIOSAI',256,87);const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
   const sign=new THREE.Mesh(new THREE.PlaneGeometry(1.18,.23),new THREE.MeshStandardMaterial({map:tex,roughness:.8}));sign.name='Shiosai lettering';sign.rotation.y=-Math.PI/2;sign.position.set(-1.323,1.94,-1.02);g.add(sign);}
 }
 const batches=new Map();
 for(const mesh of [...g.children]){
  if(!mesh.isMesh||mesh.material.transparent||mesh.material.map||mesh.userData.temporaryHull||mesh.userData.houseboatLamp)continue;
  const key=mesh.material.uuid+(mesh.userData.houseboatRoof?'roof':'fixed');let batch=batches.get(key);
  if(!batch)batches.set(key,batch={material:mesh.material,roof:!!mesh.userData.houseboatRoof,parts:[],geometry:[]});
  mesh.updateMatrix();batch.geometry.push(mesh.geometry.clone().applyMatrix4(mesh.matrix));batch.parts.push(mesh.name);mesh.removeFromParent();mesh.geometry.dispose();
 }
 for(const batch of batches.values()){const geometry=mergeGeometries(batch.geometry,false);batch.geometry.forEach(o=>o.dispose());const mesh=new THREE.Mesh(geometry,batch.material);mesh.name=batch.roof?'Houseboat cutaway roof':'Houseboat fittings';mesh.userData.parts=batch.parts;mesh.userData.houseboatRoof=batch.roof;mesh.castShadow=shadows;mesh.receiveShadow=true;g.add(mesh);}
 return g;
}
export function buildFujitaHouseboat({parent,colliders,register,onAction,shadows=false}){
 const B=HOUSEBOAT,group=createHouseboatModel(null,{shadows});group.position.set(B.x,0,B.z);parent.add(group);
 const G=B.gangway,gangway=new THREE.Mesh(new THREE.BoxGeometry(G.maxX-G.minX,.08,G.maxZ-G.minZ),new THREE.MeshStandardMaterial({color:0x896b4c,roughness:.9}));gangway.name='Houseboat gangway';gangway.position.set((G.minX+G.maxX)/2,.02,(G.minZ+G.maxZ)/2);gangway.receiveShadow=true;gangway.userData.walkLevels=[{...G,y:B.deckY}];parent.add(gangway);
 group.userData.walkLevels=[{minX:B.x-1.48,maxX:B.x+1.48,minZ:B.z-3.2,maxZ:B.z+3.2,y:B.deckY}];
 for(const z of [-2.8,2.8]){const rope=new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(1.42,.18,z),new THREE.Vector3(2.05,-.08,z-.1),new THREE.Vector3(2.32,.05,z)]),new THREE.LineBasicMaterial({color:0x7d7154}));rope.name='Mooring rope';group.add(rope);}
 const solid=(x,z,w,d,height)=>colliders.push({x:B.x+x,z:B.z+z,w,d,height,houseboat:true});
 solid(-1.25,-.95,.12,3.4,2.2);solid(1.25,-.95,.12,3.4,2.2);solid(0,-2.6,2.55,.12,2.2);solid(-.61,.7,1.3,.12,2.2);solid(1.23,.7,.1,.12,2.2);solid(-.63,-1.65,1.18,2.05,.65);solid(.93,-1.98,.6,1.02,.95);solid(-1.48,2.2,.09,2,.78);solid(0,3.2,3,.09,.78);solid(-.98,2.55,.45,.35,.52);
 const at=new THREE.Object3D();at.position.set(.65,1,1.2);group.add(at);register(at,'Mr Fujita’s houseboat',()=>onAction('read','Shiosai — Mr Fujita’s houseboat','Mr Fujita rebuilt this little working boat into a home: one berth, a kettle and a radio. At half past eleven he switches off the shed television and comes aboard. The gangway must stay clear.'));
 let disposed=false,ready=Promise.resolve(false);
 if(typeof window!=='undefined'&&typeof window.fetch==='function')ready=fetch(assetURL('models/harbour/fujita-houseboat-hull.glb')).then(r=>{if(!r.ok)throw Error('Houseboat hull HTTP '+r.status);return r.arrayBuffer();}).then(data=>new GLTFLoader().parseAsync(data,'')).then(({scene})=>{
  if(disposed){scene.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});return false;}
  const fallback=group.getObjectByName('Temporary hull');fallback?.removeFromParent();fallback?.geometry.dispose();fallback?.material.dispose();scene.traverse(o=>{if(o.isMesh){o.castShadow=shadows;o.receiveShadow=true;}});group.add(scene);return true;
 }).catch(e=>{console.warn('Houseboat hull unavailable; using local hull.',e.message);return false;});
 const roofs=[],lamps=[];group.traverse(o=>{if(o.userData.houseboatRoof)roofs.push(o);if(o.userData.houseboatLamp)lamps.push(o);});
 return {group,gangway,ready,tick({sleeping=false,player=null}={}){const inside=player&&Math.abs(player.x-B.x)<1.5&&player.z>B.z-3&&player.z<B.z+1.3;for(const o of roofs)o.visible=!(sleeping||inside);for(const o of lamps)o.material.emissiveIntensity=sleeping?0:.7;},dispose(){disposed=true;}};
}
