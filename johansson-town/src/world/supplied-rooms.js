import {YURI_APARTMENT_LAYOUT} from './interiors/yuri-apartment-layout.js';
import {DINING} from './dining-layout.js';
import {registerDetail} from './detail-stream.js';
import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {assetURL} from '../assets.js';
import {INAKAYA_FIT,RAMEN_LAYOUT,RAMEN_PLAYER_SEATS,ramenPoint,ramenX} from './interiors/ramen-layout.js';
import {localToWorld} from './landmark-lots.js';

const assets=new Map();
const pending=new Map();
const files={'crystal-room':'crystal/crystal-room.glb',office:'office/office-interior.glb',ramen:'ramen/inakaya-exterior.glb','ramen-exterior':'ramen/inakaya-exterior.glb','yuri-home':'yuri-home/seinfeld-apartment.glb'};

// Geometry is in metres. Layouts specify each actual doorway and floor at Y=0.
// Bounds follow each supplied floor; the old 13 m shell remains the load-failure fallback.
export const SUPPLIED_ROOM_LAYOUTS={
  'crystal-room':{bounds:{minX:-3.32,maxX:3.32,minZ:-3.32,maxZ:3.32},spawn:[0,0,2.45],exit:[0,1.1,3.28],
    colliders:[
      {x:2.75,z:2,w:1.35,d:2.8,height:1.9},
      {x:2.6,z:-.48,w:1.6,d:1.8,height:.9},
      {x:2.25,z:-2.5,w:2.3,d:1.8,height:1.95},
      {x:-.5,z:-2.8,w:2.75,d:1.2,height:2.45},
      {x:-2.5,z:-2.2,w:1.8,d:2.2,height:1.7},
      {x:-2.85,z:2.1,w:1.05,d:2.15,height:1.6},
    ]},
  office:{bounds:{minX:-3.37,maxX:3.37,minZ:-3.37,maxZ:3.37},spawn:[0,0,2.4],exit:[0,1.1,3.34],
    colliders:[
      {x:0,z:-2.78,w:6.27,d:1.23,height:1.72},
      {x:0,z:-2.0,w:.11,d:.45,height:1.7},
      {x:-3.08,z:-2.02,w:.12,d:.48,height:1.7},
      {x:3.08,z:-2.02,w:.12,d:.48,height:1.7},
      {x:-2.52,z:-1.82,w:.59,d:.68,height:.94},
      {x:1.14,z:-2.22,w:.65,d:.72,height:.94},
      {x:2.91,z:-1.39,w:.43,d:.46,height:.46},
      {x:3.1,z:1.58,w:.6,d:2.72,height:1.87},
      {x:-2.98,z:.17,w:.7,d:2.28,height:2.05},
      {x:-2.54,z:2.51,w:.61,d:.62,height:1.62},
    ]},
  ramen:RAMEN_LAYOUT,
  'yuri-home':YURI_APARTMENT_LAYOUT,
};

export function suppliedRoomBoundsBlocked(layout,x,z,r=0){
  const b=layout.bounds;
  if(layout.floorPolygon){
    const inside=(px,pz)=>{let hit=false;const p=layout.floorPolygon;for(let i=0,j=p.length-1;i<p.length;j=i++){
      const [ax,az]=p[i],[bx,bz]=p[j];if((az>pz)!==(bz>pz)&&px<(bx-ax)*(pz-az)/(bz-az)+ax)hit=!hit;
    }return hit;};
    if(!inside(x,z))return true;
    for(let i=0;r>0&&i<16;i++)if(!inside(x+Math.cos(i*Math.PI/8)*r,z+Math.sin(i*Math.PI/8)*r))return true;
  }
  return x<b.minX+r||x>b.maxX-r||z<b.minZ+r||z>b.maxZ-r;
}

const assetKey=id=>id==='ramen'?'ramen-exterior':id;
export function suppliedRoomReady(id){return assets.has(assetKey(id));}
export function isSuppliedRoom(id){return Object.hasOwn(files,id);}
export function preloadSuppliedRooms(ids=Object.keys(files)){
  return Promise.all(ids.map(requestedId=>{
    const id=assetKey(requestedId);
    if(assets.has(id))return true;
    if(pending.has(id))return pending.get(id);
    const file=files[id];if(!file)return false;
    const task=(async()=>{
    const controller=new AbortController();let timer;
    try{
      const load=fetch(assetURL('models/'+file),{signal:controller.signal}).then(response=>{
        if(!response.ok)throw Error('HTTP '+response.status);
        return response.arrayBuffer();
      }).then(bytes=>new GLTFLoader().parseAsync(bytes,''));
      const gltf=await Promise.race([load,new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('load timed out'));},15000);})]);
      let meshes=0;
      gltf.scene.traverse(o=>{if(!o.isMesh)return;meshes++;
        for(const material of Array.isArray(o.material)?o.material:[o.material]){
          // Vertex-alpha shadow decals must not occlude the floor behind them.
          if(material.transparent){material.depthWrite=false;material.forceSinglePass=true;}
          if(material.map){material.map.magFilter=THREE.LinearFilter;material.map.anisotropy=2;}
        }
      });
      if(!meshes)throw Error('empty scene');
      assets.set(id,gltf.scene);return true;
    }catch(error){console.warn('Supplied '+id+' unavailable:',error.message);return false;}
    finally{clearTimeout(timer);}
    })();
    pending.set(id,task);
    task.finally(()=>pending.delete(id));
    return task;
  }));
}

let inakayaInterior=null;
function interiorSource(source){
  if(inakayaInterior)return inakayaInterior;
  const model=source.clone(true);
  model.traverse(mesh=>{
    if(!mesh.isMesh)return;
    // One cached geometry variant; never mutate the street instance or textures.
    mesh.geometry=mesh.geometry.clone();
    const positions=mesh.geometry.attributes.position,normals=mesh.geometry.attributes.normal;
    const normal=new THREE.Vector3();
    for(let i=0;i<positions.count;i++){
      const x=positions.getX(i);positions.setX(i,ramenX(x));
      if(normals){normal.fromBufferAttribute(normals,i);normal.x/=1/.75+(x>.43&&x<.73?2:0);normal.normalize();normals.setXYZ(i,...normal.toArray());}
    }
    positions.needsUpdate=true;if(normals)normals.needsUpdate=true;
    mesh.geometry.computeBoundingBox();mesh.geometry.computeBoundingSphere();
  });
  inakayaInterior=model;return model;
}
function addAsset(id,parent){
  const source=assets.get(assetKey(id));if(!source)return false;
  const model=(id==='ramen'?interiorSource(source):source).clone(true);model.name='Supplied '+id;model.userData.sharedAsset=true;
  model.userData.suppliedRoom=id;parent.add(model);return model;
}

// The source contains two real doorways: the restaurant on the right and the
// timber neighbour on the left. Both transition from the same clear east lane.
function buildInakayaPair(world,options){
  const building=new THREE.Group();building.name='Inakaya restaurant and neighbour';
  building.position.set(DINING.ramenX,0,DINING.ramenZ);world.group.add(building);
  const model=addAsset('ramen-exterior',building);
  const prepare=model=>model.traverse(o=>{if(o.isMesh){o.castShadow=!!options.shadows;o.receiveShadow=true;}});
  if(model)prepare(model);
  else{
    const fallback=new THREE.Group();building.add(fallback);
    for(const [x,z,w,d,h] of [[.05,-.6,3.7,7.1,6.3],[-2.84,2.19,2.35,2.9,4]]){
      const box=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color:0xb6a98a,roughness:.9}));box.position.set(x,h/2,z);fallback.add(box);
    }
    hangRamenNoren(fallback);
    registerDetail(world,{id:'ramen-exterior',priority:1,x:DINING.ramenX,z:DINING.ramenZ,radius:48,load:async()=>{
      const [ready]=await preloadSuppliedRooms(['ramen-exterior']);if(!ready)return false;
      const detailed=addAsset('ramen-exterior',building);prepare(detailed);fallback.removeFromParent();return true;
    }});
  }
  const sites=[
    {id:'ramen',title:'Sato Ramen',jp:'中華そば 佐藤',sub:'COUNTER & KITCHEN',x:DINING.ramenDoor[0],z:DINING.ramenZ,
      color:0xb6a98a,accent:'#a34e3d',line:'Shoyu ramen · ¥300 · 09:00–21:00',opens:'09:00',door:[DINING.ramenDoor[0],0,DINING.ramenDoor[1]]},
    {id:'crystal-room',title:'The Timber House',jp:'木の家',sub:'BESIDE SATO RAMEN',x:DINING.crystalDoor[0],z:DINING.ramenZ+2.2,
      color:0x89745b,accent:'#68513c',line:'The timber-fronted building beside Sato Ramen.',opens:'09:00',door:[DINING.crystalDoor[0],0,DINING.crystalDoor[1]]},
  ];
  for(const site of sites){
    options.sites.push(site);
    const entrance=new THREE.Object3D();entrance.name=site.title+' entrance';
    entrance.position.set(site.door[0],1.2,DINING.ramenZ+(site.id==='ramen'?3.9:4.1));world.group.add(entrance);
    options.register(entrance,'Enter '+site.title,()=>options.enter(site));
  }
  // Facade-aligned solids keep the source's doors and paving behind the
  // interaction line; both exit points remain outside the walls and props.
  world.colliders.push(
    {x:DINING.ramenX+.05,z:DINING.ramenZ-.6,w:3.7,d:7.1,height:6.3},
    {x:DINING.ramenX-2.84,z:DINING.ramenZ+2.19,w:2.35,d:2.9,height:4},
    {x:DINING.ramenX-1.28,z:DINING.ramenZ+3.7,w:6.28,d:.3,height:1},
  );
  return sites[0];
}

export function buildRamenRestaurant(world,options,placement){
  if(!placement)return buildInakayaPair(world,options);
  if(!assets.has('ramen-exterior'))return false;
  const place=placement||{x:24,z:10,yaw:0,scale:1};
  const scale=place.scale??1,sx=scale.x??scale,sy=scale.y??scale,sz=scale.z??scale;
  const site=place.site||{id:'ramen',title:'Sato Ramen',jp:'中華そば 佐藤',sub:'COUNTER & KITCHEN',x:place.x,z:place.z,
    color:0xb6a98a,accent:'#a34e3d',line:'Shoyu ramen · ¥300 · 09:00–21:00',opens:'09:00'};
  const [dx,dz]=localToWorld(place.x,place.z,place.yaw||0,scale,.65,4.7);
  site.door=[dx,0,dz];site.x=place.x;site.z=place.z;
  if(!place.skipSite)options.sites.push(site);
  const building=new THREE.Group();building.name=place.name||'Sato Ramen restaurant';building.position.set(place.x,0,place.z);building.rotation.y=place.yaw||0;building.scale.set(sx,sy,sz);world.group.add(building);
  addAsset('ramen-exterior',building);
  const [ex,ez]=localToWorld(place.x,place.z,place.yaw||0,scale,.65,4.15);
  const entrance=new THREE.Object3D();entrance.name='Sato Ramen entrance';entrance.position.set(ex,1.2,ez);world.group.add(entrance);
  options.register(entrance,'Enter Sato Ramen',()=>options.enter(site));
  if(placement)hangRamenNoren(building);
  const boxes=[{x:24.05,z:9.4,w:3.7,d:7.1,height:6.3},{x:21.16,z:12.19,w:2.35,d:2.9,height:4}];
  for(const c of boxes)world.colliders.push(transformCollider(c,place.x,place.z,place.yaw||0,scale));
  return site;
}

function transformCollider(c,x,z,yaw,scale){
  const corners=[[c.x-24-c.w/2,c.z-10-c.d/2],[c.x-24+c.w/2,c.z-10-c.d/2],[c.x-24-c.w/2,c.z-10+c.d/2],[c.x-24+c.w/2,c.z-10+c.d/2]]
    .map(([lx,lz])=>localToWorld(x,z,yaw,scale,lx,lz));
  const xs=corners.map(p=>p[0]),zs=corners.map(p=>p[1]);
  const minX=Math.min(...xs),maxX=Math.max(...xs),minZ=Math.min(...zs),maxZ=Math.max(...zs);
  return {x:(minX+maxX)/2,z:(minZ+maxZ)/2,w:maxX-minX,d:maxZ-minZ,height:c.height*(scale.y??scale)};
}

function hangRamenNoren(building){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=320;
  const ctx=canvas.getContext('2d');
  ctx.fillStyle='#8b1e1e';ctx.fillRect(0,0,256,320);
  ctx.fillStyle='#f3e0c4';ctx.fillRect(6,0,116,300);ctx.fillRect(134,0,116,300);
  ctx.fillStyle='#8b1e1e';ctx.textAlign='center';ctx.font='700 52px sans-serif';
  ctx.fillText('ら',64,110);ctx.fillText('ー',64,190);ctx.fillText('め',192,110);ctx.fillText('ん',192,190);
  const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;
  const noren=new THREE.Mesh(new THREE.PlaneGeometry(1.8,1.5),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide,transparent:true}));
  noren.name='Sato Ramen noren';noren.position.set(.65,1.65,4.42);building.add(noren);
}

export function buildSuppliedRoom({site,room,reg,collider,action,exit}){
  const layout=SUPPLIED_ROOM_LAYOUTS[site.id];
  if(!layout)return null;
  const model=addAsset(site.id,room);if(!model)return null;
  if(site.id==='ramen'){
    model.scale.set(...INAKAYA_FIT.scale);model.position.y=-INAKAYA_FIT.floor;
    // Shared exterior materials and buffers stay untouched, including on exit.
    room.add(new THREE.HemisphereLight(0xffebd0,0x74604d,1.65));
    const light=new THREE.PointLight(0xffd4a0,2.2,9,2);light.position.set(.2,1.95,.6);room.add(light);
  }
  for(const c of layout.colliders)collider(c.x,c.z,c.w,c.d,c.height);
  const anchor=(position,label,kind,title,text)=>{
    const object=new THREE.Object3D();object.name=label;object.position.set(...position);room.add(object);
    if(kind==='seat'){const [x,,z]=position;object.userData.seat={position:[x,0,z],stand:[x,0,z+1.05],eyeY:1.2,yaw:0,pitch:0};}
    reg(object,label,kind==='exit'?exit:()=>action(kind,title,text),true);return object;
  };
  anchor(layout.exit,'Exit to street','exit');
  if(site.id==='crystal-room'){
    anchor([0,1.1,.6],'Listen to the room','inspect','A room that should not be here','The street sounds have faded. A clear, sustained note seems to come from the walls. There are no speakers.');
    anchor([1.55,1.2,1.8],'Examine the crystal formation','inspect','The crystal formation','Light gathers inside the stone, though the room has no windows. A tiny ruler rests against it. Every mark reads zero.');
    anchor([0,1.1,-1.65],'Read the pencilled note','read','An unfinished measurement','14 September 1988.\nThe instruments agree until the door closes. Do not move the large crystal. — K.');
    anchor([-1.5,.8,.5],'Inspect the compass','inspect','The compass','The needle points towards the door. Turn it, and it patiently finds the door again.');
  }else if(site.id==='office'){
    anchor([-1.40,1.15,-2.74],'Use office computer','machine','Office computer','Service records, calibration certificates and travel plans are open on the workstation.');
    anchor([1.70,.93,-2.75],'Read the ledger','read','Harbour records and service ledger',site.line+'\n14 September 1988. Evening deliveries are written in blue pencil.');
    anchor([-2.45,.93,-2.64],'Inspect field-service desk','inspect','Field-service desk','Route sheets, reference books and handwritten travel notes lie beside the keyboard.');
    anchor([3.0,1.25,1.25],'Open drawing cabinet','inspect','Drawing cabinet','Berth records, vessel draughts, departure times and electrical drawings share this cabinet.');
    anchor([-2.94,1.05,.05],'Browse service files','read','Service files','A row of binders keeps each vessel’s service history, tide tables and cold-store orders in order.');
    anchor([-2.52,.7,-1.82],'Sit at the desk','seat','Office chair','A blue swivel chair faces the service desk.');
    anchor([1.14,.7,-2.05],'Sit down','seat','Office chair','The desk is ready for the next round of paperwork.');
  }else if(site.id==='yuri-home'){
    room.add(new THREE.HemisphereLight(0xffebd0,0x74604d,1.5));
    const sofa=anchor([-2.4,.48,2.2],'Sit on the sofa','seat','Yuri’s sofa','A broad sofa faces the coffee table. Yuri rests here after closing the shop.');
    sofa.userData.seat={position:[-2.4,0,2.2],stand:[-1,0,2.2],eyeY:1.22,yaw:Math.PI,pitch:0};
    anchor([-2.17,.7,3.5],'Read the coffee-table note','read','Tomorrow’s list','Open Sakura. Check the deliveries. Put the kettle on before breakfast.');
    anchor([-4.96,1,-.55],'Inspect the writing desk','inspect','Writing desk','A computer, papers and a quiet corner for the household accounts.');
    anchor([2.2,1.1,.92],'Check the refrigerator','inspect','Yuri’s kitchen','Cold drinks and tomorrow’s breakfast are ready.');
    anchor([-2.75,.6,.84],'Inspect the breakfast table','inspect','Breakfast table','A small round table beside the living area.');
  }else{
    anchor(ramenPoint(.31,1.18,1.7),'Order ramen · ¥300','ramen','Sato Ramen');
    RAMEN_PLAYER_SEATS.forEach((seat,i)=>{
      const object=anchor([seat.position[0],seat.height,seat.position[2]],i?'Take a counter seat':'Sit at the ramen counter','seat','Counter stool','A patterned stool beside the wooden counter.');
      object.userData.seat={position:[...seat.position],stand:[1.14,0,seat.position[2]],eyeY:seat.height+.85,yaw:seat.yaw,pitch:0};
    });
    anchor(ramenPoint(-.6,1.18,.5),'Inspect broth kettle','inspect','Broth kettle','The simmering broth has been tended since morning.');
    anchor(ramenPoint(.27,1.18,.2),'Read the counter newspaper','read','Counter newspaper','The paper is folded open at the harbour notices. A delivery for the morning ferry is circled in pencil.');
    anchor(ramenPoint(1,1.65,-.25),'Read the menu','read','Sato Ramen menu','Shoyu ramen · ¥300. Take a seat at the counter and order a hot bowl.');
  }
  return layout;
}
