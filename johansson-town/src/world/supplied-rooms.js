import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {assetURL} from '../assets.js';
import {localToWorld} from './landmark-lots.js';

const assets=new Map();
let pending;
const files={stepwise:'crystal/crystal-room.glb',office:'office/office-interior.glb',ramen:'ramen/ramen-restaurant.glb'};

// Geometry is already in metres, with the front door facing +Z and the floor at Y=0.
// Bounds follow each supplied floor; the old 13 m shell remains the load-failure fallback.
export const SUPPLIED_ROOM_LAYOUTS={
  stepwise:{bounds:{minX:-3.32,maxX:3.32,minZ:-3.32,maxZ:3.32},spawn:[0,0,2.45],exit:[0,1.1,3.28],
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
  ramen:{bounds:{minX:-2.30,maxX:2.30,minZ:-3.46,maxZ:3.44},spawn:[.42,0,2.65],exit:[.42,1.2,3.42],
    colliders:[
      // Counter and staff kitchen, then the six stools and perimeter furniture.
      {x:-.875,z:-1.16,w:2.93,d:4.68,height:1.31},
      {x:.775,z:0,w:.39,d:.39,height:.59},
      {x:-.39,z:1.36,w:.39,d:.39,height:.59},
      {x:-1.485,z:1.36,w:.39,d:.39,height:.59},
      {x:.97,z:-1.36,w:.39,d:.39,height:.59},
      {x:2.08,z:-1.68,w:.39,d:.39,height:.59},
      {x:2.08,z:-2.14,w:.39,d:.39,height:.59},
      {x:-2.06,z:1.68,w:.45,d:.45,height:1.16},
      {x:-1.84,z:2.32,w:.96,d:.72,height:.8},
      {x:-1.94,z:3.10,w:.79,d:.79,height:1.45},
      {x:2.12,z:2.98,w:.44,d:1.04,height:1.45},
      {x:1.86,z:-3.08,w:.88,d:.94,height:1.02},
    ]},
};

export function suppliedRoomBoundsBlocked(layout,x,z,r=0){
  const b=layout.bounds;
  return x<b.minX+r||x>b.maxX-r||z<b.minZ+r||z>b.maxZ-r;
}

export function preloadSuppliedRooms(){
  if(pending)return pending;
  pending=Promise.all(Object.entries(files).map(async([id,file])=>{
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
  }));
  return pending;
}

function addAsset(id,parent){
  const source=assets.get(id);if(!source)return false;
  const model=source.clone(true);model.name='Supplied '+id;model.userData.sharedAsset=true;
  model.userData.suppliedRoom=id;parent.add(model);return model;
}

function closeRamenExteriorDoor(model){
  // The packed source bakes its open left leaf into six material batches,
  // some shared with the fixed right leaf. Move only the left-leaf vertices;
  // cloning their geometry leaves the separately instantiated interior intact.
  const doorMaterials=new Set([
    'mat_5f42316192ce94ce','mat_5f42316292cd929b','mat_5f42316192c19fd5',
    'mat_5f42316292ce94ce','mat_5f42316192ca92a9','mat_5f42316392d1a094',
  ]);
  // Measured hinge, open edge direction and closed jamb in the packed GLB.
  const hinge=new THREE.Vector3(-.3638,0,3.44815);
  const closedHinge=new THREE.Vector3(-.395,0,3.4999);
  const rotation=new THREE.Matrix4().makeRotationY(Math.atan2(.9089,.7358));
  const point=new THREE.Vector3(),normal=new THREE.Vector3();
  model.traverse(mesh=>{
    if(!mesh.isMesh||!doorMaterials.has(mesh.material.name))return;
    mesh.geometry=mesh.geometry.clone();
    const positions=mesh.geometry.attributes.position,normals=mesh.geometry.attributes.normal;
    for(let i=0;i<positions.count;i++){
      point.fromBufferAttribute(positions,i);
      if(point.x>=.5)continue; // The fixed right leaf shares these materials.
      point.sub(hinge).applyMatrix4(rotation).add(closedHinge);
      positions.setXYZ(i,point.x,point.y,point.z);
      if(normals){normal.fromBufferAttribute(normals,i).transformDirection(rotation);normals.setXYZ(i,normal.x,normal.y,normal.z);}
    }
    positions.needsUpdate=true;if(normals)normals.needsUpdate=true;
    mesh.geometry.computeBoundingBox();mesh.geometry.computeBoundingSphere();
  });
  model.userData.exteriorDoorClosed=true;
}

export function buildRamenRestaurant(world,options,placement){
  if(!assets.has('ramen'))return false;
  const place=placement||{x:24,z:10,yaw:0,scale:1};
  const scale=place.scale??1,sx=scale.x??scale,sy=scale.y??scale,sz=scale.z??scale;
  const site=place.site||{id:'ramen',title:'Sato Ramen',jp:'中華そば 佐藤',sub:'COUNTER & KITCHEN',x:place.x,z:place.z,
    color:0xb6a98a,accent:'#a34e3d',line:'Shoyu ramen · ¥300 · 09:00–21:00',opens:'09:00'};
  const [dx,dz]=localToWorld(place.x,place.z,place.yaw||0,scale,.65,4.7);
  site.door=[dx,0,dz];site.x=place.x;site.z=place.z;
  if(!place.skipSite)options.sites.push(site);
  const building=new THREE.Group();building.name=place.name||'Sato Ramen restaurant';building.position.set(place.x,0,place.z);building.rotation.y=place.yaw||0;building.scale.set(sx,sy,sz);world.group.add(building);
  closeRamenExteriorDoor(addAsset('ramen',building));
  const [ex,ez]=localToWorld(place.x,place.z,place.yaw||0,scale,.65,4.15);
  const entrance=new THREE.Object3D();entrance.name='Sato Ramen entrance';entrance.position.set(ex,1.2,ez);world.group.add(entrance);
  options.register(entrance,'Enter Sato Ramen',()=>options.enter(site));
  if(placement)hangRamenNoren(building);
  const boxes=[{x:24,z:10,w:4.72,d:7.1,height:3.12}];
  if(!placement)boxes.push({x:24,z:13.92,w:.78,d:.94,height:2.75});
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
  if(!layout||!addAsset(site.id,room))return null;
  for(const c of layout.colliders)collider(c.x,c.z,c.w,c.d,c.height);
  const anchor=(position,label,kind,title,text)=>{
    const object=new THREE.Object3D();object.name=label;object.position.set(...position);room.add(object);
    reg(object,label,kind==='exit'?exit:()=>action(kind,title,text),true);return object;
  };
  anchor(layout.exit,'Exit to street','exit');
  if(site.id==='stepwise'){
    anchor([0,1.1,.6],'Listen to the room','inspect','A room that should not be here','The street sounds have faded. A clear, sustained note seems to come from the walls. There are no speakers.');
    anchor([1.55,1.2,1.8],'Examine the crystal formation','inspect','The crystal formation','Light gathers inside the stone, though the room has no windows. A tiny ruler rests against it. Every mark reads zero.');
    anchor([0,1.1,-1.65],'Read the pencilled note','read','An unfinished measurement','14 September 1988.\nThe instruments agree until the door closes. Do not move the large crystal. — K.');
    anchor([-1.5,.8,.5],'Inspect the compass','inspect','The compass','The needle points towards the door. Turn it, and it patiently finds the door again.');
  }else if(site.id==='office'){
    anchor([-1.40,1.15,-2.74],'Use office computer','machine','Office computer','Service records, calibration certificates and travel plans are open on the workstation.');
    anchor([1.70,.93,-2.75],'Read the ledger','read','Johansson Marine Office ledger',site.line+'\n14 September 1988. Evening deliveries are written in blue pencil.');
    anchor([-2.45,.93,-2.64],'Inspect field-service desk','inspect','Field-service desk','Route sheets, reference books and handwritten travel notes lie beside the keyboard.');
    anchor([3.0,1.25,1.25],'Open drawing cabinet','inspect','Drawing cabinet','Folders contain electrical drawings, calibration sheets and old ship-engine notes.');
    anchor([-2.94,1.05,.05],'Browse service files','read','Service files','A row of labelled binders keeps each vessel’s service history in order.');
    anchor([-2.52,.7,-1.82],'Sit at the desk','seat','Office chair','A blue swivel chair faces the service desk.');
    anchor([1.14,.7,-2.05],'Sit down','seat','Office chair','The desk is ready for the next round of paperwork.');
  }else{
    anchor([.15,1.02,.86],'Order ramen · ¥300','ramen','Sato Ramen');
    anchor([-.4,.59,1.36],'Sit at the ramen counter','seat','Counter stool','A worn green stool beside the lacquered counter.');
    anchor([.97,.59,-1.36],'Take a counter seat','seat','Counter stool','The kitchen is busy on the other side of the counter.');
    anchor([-1.36,1.05,.86],'Inspect broth kettle','inspect','Broth kettle','The simmering broth has been tended since morning.');
    anchor([.2,1.01,.5],'Read the counter newspaper','read','Counter newspaper','The paper is folded open at the harbour notices. A delivery for the morning ferry is circled in pencil.');
    anchor([2.25,1.7,-1.25],'Read the menu','read','Sato Ramen menu','Shoyu ramen · ¥300. Take a seat at the counter and order a hot bowl.');
  }
  return layout;
}
