import {buildHarbourOffice} from './harbour-office.js';
import {ALLEY_SHOPS,buildAlleyShop} from './alley-shops.js';
import {WEST_SHOPS,buildWestShop} from './west-shops.js';
import {buildPeninsula} from './peninsula.js';
import {buildBicycle} from './bicycle.js';
import {createVendingMachine,vendingReady,hydrateVending} from './vending.js';
import {buildBoardwalk} from './boardwalk.js?snappy=1';
import {buildWarehouse} from './warehouse.js';
import {BOARDWALK} from './layout.js?snappy=1';
import {MAIN_ROAD,SHOP_CROSSING_Z} from './main-road.js';
import {buildStreetLamps} from './street-lamps.js';
import {createHarbourInstances} from '../render/harbour-instances.js';
import {addHorizon} from './horizon.js';
import {createHarbourBasin,tickOcean,setOceanWeather} from './ocean.js';
import {buildStorefront} from './storefront.js?snappy=1';
import {SAKURA_FRONT} from './interiors/sakura-layout.js';
import {peninsulaActive} from './town-mode.js';

import {buildBusStation} from './bus-station.js';
import {createMaterials} from '../render/materials.js?snappy=1';
import {lanternGlow, windowGlow} from '../render/dusk.js';
import * as THREE from '../../vendor/three.module.js';

// Johansson Town original harbour geometry, using the shared PBR surface maps.
// Static geometry is instanced by geometry/material; interaction anchors stay independent.
export function createTown({scene,sites,mobile,shadows=!mobile,maxAnisotropy=4,register,enter,onAction,getPlayerPosition,harbourCellSize=48,harbourBatching=true}) {
  const group=new THREE.Group();scene.add(group);
  const harbourShops=[],plantSites=[],details=[],shopDoors=[];
  const materials=new Map(),geometries=new Map(),batches=new Map(),colliders=[],lamps=[],lampLights=[],people=[],water=[],wetMeshes=[];

  const bands=new Uint8Array([
    38,38,38,255,
    92,92,92,255,
    154,154,154,255,
    214,214,214,255,
    255,255,255,255
  ]);
  const toonGradient=new THREE.DataTexture(bands,5,1,THREE.RGBAFormat);
  toonGradient.needsUpdate=true;toonGradient.magFilter=THREE.NearestFilter;toonGradient.minFilter=THREE.NearestFilter;toonGradient.generateMipmaps=false;
  const outlineMaterial=new THREE.MeshBasicMaterial({color:0x1c2729,side:THREE.BackSide});

  const pbr=createMaterials({mobile,anisotropy:maxAnisotropy});
  function material(color,map,glow=0){
    const key=`${color}/${map||''}/${glow}`;
    if(!materials.has(key)){
      let m;
      m=new THREE.MeshStandardMaterial({color,roughness:.87,emissive:glow?color:0,emissiveIntensity:glow,dithering:true});
      if(map){
        const kind=({road:'asphalt',wall:'concrete',wood:'timber',roof:'roof',paving:'paving'})[map];
        m=pbr.worldMaterial(kind,color,map==='wood'?2.4:map==='paving'?3:2);
        if(map==='road'){m.name='town-asphalt';m.roughness=.84;}
        m.emissive.set(glow?color:0);m.emissiveIntensity=glow;
      }
      materials.set(key,m);
    }
    return materials.get(key);
  }
  function shape(type,args,p,c,rotation=[0,0,0],map=null){
    const scalable=type==='box'||type==='cylinder'&&args[0]===args[1];
    const key=scalable?(type==='box'?'box:unit':'cylinder:unit/'+args[3]):type+args.join(',');
    if(!geometries.has(key))geometries.set(key,type==='box'?new THREE.BoxGeometry(1,1,1):type==='cylinder'?new THREE.CylinderGeometry(...(scalable?[1,1,1,args[3]]:args)):new THREE.SphereGeometry(...args));
    const mat=material(c,map),bk=key+mat.uuid;
    if(!batches.has(bk))batches.set(bk,{geo:geometries.get(key),mat,mutable:map==='road',matrices:[]});
    const obj=new THREE.Object3D();obj.position.set(...p);obj.rotation.set(...rotation);if(scalable)obj.scale.set(...(type==='box'?args:[args[0],args[2],args[0]]));obj.updateMatrix();batches.get(bk).matrices.push(obj.matrix.clone());
  }
  const box=(s,p,c=0xffffff,r=[0,0,0],map=null)=>shape('box',s,p,c,r,map);
  const cyl=(r,h,p,c=0x444b4b)=>shape('cylinder',[r,r,h,10],p,c);
  function beam(a,b,r=.025,c=0x303334){
    const d=new THREE.Vector3().subVectors(new THREE.Vector3(...b),new THREE.Vector3(...a));
    const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());
    const e=new THREE.Euler().setFromQuaternion(q);shape('cylinder',[r,r,d.length(),8],a.map((v,i)=>(v+b[i])/2),c,[e.x,e.y,e.z]);
  }
  function directMesh(geo,mat,parent=group,p=[0,0,0],r=[0,0,0],scale=[1,1,1],outline=false){
    const m=new THREE.Mesh(geo,mat);m.position.set(...p);m.rotation.set(...r);m.scale.set(...scale);m.castShadow=shadows;m.receiveShadow=shadows;parent.add(m);
    if(outline){const o=new THREE.Mesh(geo,outlineMaterial);o.position.copy(m.position);o.rotation.copy(m.rotation);o.scale.copy(m.scale).multiplyScalar(1.025);o.castShadow=false;o.receiveShadow=false;parent.add(o);}
    return m;
  }
  function directBox(size,p,c,parent=group,r=[0,0,0],outline=false,map=null){return directMesh(new THREE.BoxGeometry(...size),material(c,map),parent,p,r,[1,1,1],outline);}
  function directCyl(radius,height,p,c,parent=group,r=[0,0,0],outline=false,segments=12){return directMesh(new THREE.CylinderGeometry(radius,radius,height,segments),material(c),parent,p,r,[1,1,1],outline);}
  function directBeam(parent,a,b,r=.025,c=0x303334){
    const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),d=new THREE.Vector3().subVectors(bv,av);
    const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize()),e=new THREE.Euler().setFromQuaternion(q);
    return directMesh(new THREE.CylinderGeometry(r,r,d.length(),8),material(c),parent,[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],[e.x,e.y,e.z]);
  }
  function label(text,sub,p,width,height,angle=0,bg='#e9dcc1',fg='#283d3e',glow=false){
    const canvas=document.createElement('canvas');canvas.width=768;canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,768,256);ctx.strokeStyle=fg;ctx.lineWidth=8;ctx.strokeRect(12,12,744,232);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=fg;ctx.font='700 96px "Yu Gothic",system-ui';ctx.fillText(text,384,106,716);ctx.font='600 30px system-ui';ctx.fillText(sub,384,201,700);
    const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=Math.min(maxAnisotropy,8);
    const mat=new THREE.MeshStandardMaterial({map:tex,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:glow?.55:.05});
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),mat);mesh.position.set(...p);mesh.rotation.y=angle;mesh.castShadow=false;mesh.receiveShadow=false;group.add(mesh);
    // A plain panel behind it. These used to be double-sided, so walking round one —
    // the bus-station board stands square across the tunnel road — showed the lettering
    // through the back of the sign, reversed.
    const back=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshStandardMaterial({color:new THREE.Color(bg).multiplyScalar(.78),roughness:.9}));
    back.position.set(p[0]-Math.sin(angle)*.012,p[1],p[2]-Math.cos(angle)*.012);
    back.rotation.y=angle+Math.PI;back.castShadow=false;back.receiveShadow=false;group.add(back);
    return mesh;
  }
  function anchor(p,label,action){const a=new THREE.Object3D();a.position.set(...p);group.add(a);register(a,label,action);return a;}
  function obstacle(x,z,w,d){colliders.push({x,z,w,d});}
  function lantern(x,z){
    const lm=material(0xf0a65c,null,.12),m=new THREE.Mesh(new THREE.SphereGeometry(.25,12,10),lm);m.scale.set(.8,1.4,.8);m.position.set(x,2.55,z);m.castShadow=false;group.add(m);lamps.push(m);box([.26,.05,.26],[x,2.91,z],0x3c3430);
    if(shadows){const light=new THREE.PointLight(0xffb96e,0,8,2);light.position.set(x,2.55,z);group.add(light);lampLights.push(light);}
  }
  function glassPanel(x,y,z,w,h,angle){
    const mat=new THREE.MeshPhysicalMaterial({color:0x355662,roughness:.40,metalness:.02,clearcoat:.12,clearcoatRoughness:.18,emissive:0xdba978,emissiveIntensity:.16});
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);m.position.set(x,y,z);m.rotation.y=angle;m.receiveShadow=false;m.castShadow=false;group.add(m);return m;
  }
  const shopGlass=[];
  function puddle(x,z,sx,sz,rot=0){
    const mat=new THREE.MeshPhysicalMaterial({color:0x263c43,roughness:.14,metalness:.08,transparent:true,opacity:.34,depthWrite:false});
    const m=new THREE.Mesh(new THREE.CircleGeometry(1,28),mat);m.rotation.x=-Math.PI/2;m.rotation.z=rot;m.position.set(x,-.031,z);m.scale.set(sx,sz,1);m.visible=false;m.renderOrder=2;group.add(m);wetMeshes.push(m);
  }
  const markingMaterials=new Map();
  function roadMark(w,d,x,z,c=0xb7aa80){
    if(!markingMaterials.has(c))markingMaterials.set(c,new THREE.MeshBasicMaterial({color:c,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),markingMaterials.get(c));m.rotation.x=-Math.PI/2;m.position.set(x,.004,z);m.renderOrder=1;group.add(m);return m;
  }

  addHorizon(group);
  // Base town and road. Markings are non-coplanar decal planes to eliminate white-line z fighting.
  buildPeninsula(group);
  const upperRoadLength=MAIN_ROAD.maxZ-BOARDWALK.maxZ;
  box([MAIN_ROAD.width,.2,upperRoadLength],[MAIN_ROAD.x,-.10,(MAIN_ROAD.maxZ+BOARDWALK.maxZ)/2],0xb8b8af,[0,0,0],'road');
  box([MAIN_ROAD.width,.2,4],[MAIN_ROAD.x,-.10,-40],0xb8b8af,[0,0,0],'road');
  const boardwalk=buildBoardwalk(group,{mobile,shadows,maxAnisotropy});
  for(const [left,right] of [[MAIN_ROAD.pavementWest,MAIN_ROAD.west],[MAIN_ROAD.east,MAIN_ROAD.pavementEast]]){
    const pavement=directBox([right-left,.10,MAIN_ROAD.maxZ-MAIN_ROAD.minZ],[(left+right)/2,-.062,(MAIN_ROAD.maxZ+MAIN_ROAD.minZ)/2],0xc8c0b0,group,[0,0,0],false,'paving');pavement.name='Main Street footway';
  }
  for(const x of [MAIN_ROAD.west+.15,MAIN_ROAD.east-.15])for(let z=10;z<MAIN_ROAD.maxZ-.8;z+=4.5)roadMark(.10,1.55,x,z,0xa99f7d);
  for(let x=MAIN_ROAD.west+.55;x<MAIN_ROAD.east-.3;x+=1.15)roadMark(.62,1.8,x,MAIN_ROAD.maxZ-1.8,0xbeb79a);
  [[-4.1,18.2,1.15,.45,.2],[-1.7,10,.8,.35,-.3]].forEach(v=>puddle(...v));

  // Two perpendicular crossings define the short rectangular shopping blocks.
  for(const z of [SHOP_CROSSING_Z,-18])for(let x=MAIN_ROAD.west+.55;x<MAIN_ROAD.east-.3;x+=1.15)roadMark(.62,1.8,x,z,0xbeb79a);

  // Shopfronts — masonry and timber with glass where useful.
  sites.forEach((s,i)=>{
    if(s.id==='office'){const office=buildHarbourOffice({parent:group,site:s,register,enter,label,shadows});harbourShops.push(office);colliders.push(office.collider);return;}
    // The alley units are a recessed door in the side of the supplied night-market
    // kit. The peninsula does not build that kit, so on this layout a shop that has a
    // west-pavement plot gets a building of its own instead of a door standing in the
    // open air. See west-shops.js.
    if(peninsulaActive()&&WEST_SHOPS[s.id]){
      const shop=buildWestShop({parent:group,site:s,register,enter,label,colliders,shadows});
      if(shop){harbourShops.push(shop);return;}
    }
    if(ALLEY_SHOPS[s.id]){
      harbourShops.push(buildAlleyShop({parent:group,site:s,register,enter,label,shadows}));return;
    }
    if(s.id==='market'){
      const front=-7.45;
      // Big enough for the shop that is actually inside it. The supplied interior is
      // 13.7m by 10.8m and the frontage that stood for it is 10 by 8.2, so the shop
      // seen through its own window had to be shrunk to fit and read as a model of
      // itself. The full-size frontage only fits where the shops either side of it are
      // switched off: on the street proper the izakaya is against its shoulder, which
      // is why this was never simply made bigger. The door moves to the middle with it,
      // where the interior's own door is.
      if(peninsulaActive()){
       const centre=s.z+1.2,span={width:SAKURA_FRONT.width,depth:SAKURA_FRONT.depth,doorX:0};
       shopDoors.push(buildStorefront({parent:group,site:s,register,enter,label,span,placement:{x:front,z:centre,yaw:Math.PI/2,scale:1}}).shopDoor);
       s.x=front;s.door=[front+1.95,0,centre];
       // Turned a quarter: the frontage runs along z and the shop runs back along -x.
       obstacle(front-span.depth/2,centre,span.depth,span.width);return;
      }
      shopDoors.push(buildStorefront({parent:group,site:s,register,enter,label,placement:{x:front,z:s.z,yaw:Math.PI/2,scale:1}}).shopDoor);
      s.x=front;s.door=[-5.5,0,s.z+2.5];
      obstacle(-11.65,s.z,8.2,10);return;
    }
    throw Error('No street frontage defined for '+s.id);
  });

  // Utility poles and overhead cables.
  for(const side of [-1,1])for(const z of [-32,11,17]){
    const px=side<0?-7.2:.8,toward=side<0?1:-1;
    if(z<=BOARDWALK.maxZ){
      if(z===-32){
        // Low deck lights replace the southern overhead power poles.
        cyl(.10,.85,[px,.425,z],0x3b4848);box([.22,.10,.22],[px,.9,z],0xe7c080);obstacle(px,z,.25,.25);
        const light=new THREE.PointLight(0xffd7a0,0,14,2);light.userData.nightIntensity=18;light.position.set(px,1,z);group.add(light);lampLights.push(light);
      }
      continue;
    }
    cyl(.13,8,[px,4,z],0x574f49);obstacle(px,z,.38,.38);box([1.8,.14,.18],[px,7.3,z],0x4b534e);
    for(const dx of [-.8,0,.8]){
      cyl(.08,.26,[px+dx,7.52,z],0xc6cac1);
      if(z<28){const points=[];for(let k=0;k<=8;k++)points.push(new THREE.Vector3(px+dx,7.58+42*(Math.cosh((k*2-8)/42)-Math.cosh(8/42)),z+k*2));const g=new THREE.BufferGeometry().setFromPoints(points);group.add(new THREE.Line(g,new THREE.LineBasicMaterial({color:0x263234})));}
    }
    beam([px,5.7,z],[px+toward*.7,5.7,z],.06);box([.6,.12,.26],[px+toward*.75,5.65,z],0xdac08d);
    if(z===-32||z===28){const light=new THREE.PointLight(0xffd7a0,0,22,2);light.userData.nightIntensity=18;light.position.set(px+toward*.75,4.8,z);group.add(light);lampLights.push(light);}
  }
  for(const x of [-7.8,.8])cyl(.17,6.8,[x,3.4,18.7],0x416568);beam([-7.8,6.4,18.7],[.8,6.4,18.7],.11,0x416568);label('ヨハンソン商店街','JOHANSSON SHOPPING STREET',[MAIN_ROAD.x,6.3,18.7],5.8,.9,0,'#d8d5b9','#31565d');

  // Late-Shōwa street lamps: shopping street + quay approach. Emissive heads only
  // (no new PointLights); kept out of static batching so lanternGlow can update.
  const streetLamps=buildStreetLamps({parent:group,colliders,shadows,mobile});

  // Useful street furniture sits in the block recesses, clear of junctions.
  const vending=createVendingMachine({shadows});vending.position.set(4.35,0,9.1);group.add(vending);
  if(!vendingReady())details.push({id:'street-vending',x:4.35,z:9.1,radius:42,load:()=>hydrateVending(vending,{shadows})});
  obstacle(4.35,9.1,1.3,1);anchor([4.35,1,10.1],'Buy a drink',()=>onAction('vending'));
  // Payphone sits fully on the west footway: narrowing Main Street to six metres
  // left it overhanging the kerb into the carriageway.
  box([1.1,2.5,1],[-7.1,1.25,17.2],0x457e73);box([.91,1.6,.91],[-7.1,1.55,17.2],0x648c87);box([.35,.65,.28],[-7.1,1.4,17.73],0x3d9c6c);label('電話','TELEPHONE',[-7.1,2.4,17.75],1,.28);anchor([-7.1,1,18.2],'Use payphone',()=>onAction('phone'));obstacle(-7.1,17.2,1.1,1);
  const busStation=buildBusStation({parent:group,colliders,register,onAction,label,shadows});

  // The one at [-7.4,-33] stood against the konbini's frontage, in front of the only
  // window the shop is read through from the street. The others are along the harbour.
  for(const [x,z] of [[-7.4,10],[3.9,-22]]){
    const bicycle=buildBicycle({x,z,shadows});group.add(bicycle.object);obstacle(x,z,bicycle.collider.w,bicycle.collider.d);
  }

  // ----- Working harbour district -----
  // Quay is deliberately built as one elevated slab with chunky edge geometry; no coplanar white strips.
  box([38,.4,12],[0,-.105,-44],0x999b94,[0,0,0],'wall');
  box([38,.6,.65],[0,-.12,-49.65],0x596568);
  box([38,.18,.55],[0,.19,-49.28],0x343f41);

  const sea=createHarbourBasin();sea.receiveShadow=false;group.add(sea);water.push(sea);

  const warehouseWorld={group,colliders};
  // The warehouse stands at the quay in every layout. It was switched off while the
  // peninsula was stripped back to its ground, and it is the first building back.
  const harbourWarehouse=buildWarehouse(warehouseWorld,{mobile,shadows,maxAnisotropy,register,onAction,enter,label});
  label('倉庫 ←','WAREHOUSE · LEFT AT THE QUAY',[-7.3,2.7,-35],3.2,.72);
  cyl(.045,2.3,[-7.3,1.15,-35],0x655444);obstacle(-7.3,-35,.12,.12);

  function bollard(x,z){
    directCyl(.22,.48,[x,.35,z],0x2f3c3f,group,[0,0,0],true,12);directCyl(.31,.12,[x,.61,z],0x2f3c3f);obstacle(x,z,.48,.48);
  }
  [-15,-10,-5,5,10,15].forEach(x=>bollard(x,-48.45));

  function ropeCoil(x,z,scale=1){
    const rm=material(0xa38a62);for(let i=0;i<3;i++){const t=directMesh(new THREE.TorusGeometry(.35*scale+i*.07,.045*scale,6,20),rm,group,[x,.18+i*.035,z],[Math.PI/2,0,(i%2)*.25],[1,1,1],false);t.castShadow=false;}
  }
  ropeCoil(-8.3,-47.1,.9);ropeCoil(8.9,-47.2,.75);

  function crateStack(x,z,cols=2,rows=2){
    const colors=[0x4f6f76,0xa9854e,0x6f805e];
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const px=x+(c-(cols-1)/2)*.72,pz=z+(r%2)*.12;box([.62,.45,.72],[px,.32+r*.48,pz],colors[(r+c)%colors.length]);for(const sx of [-.25,.25])box([.04,.28,.76],[px+sx,.34+r*.48,pz],0x263537);}
    obstacle(x,z,cols*.78,.9);
  }
  crateStack(-7.3,-44,2,3);crateStack(7.2,-46.2,3,2);

  // Fishing-net drying rack.
  for(const x of [-10.2,-7.9])cyl(.06,2.4,[x,1.3,-46.4],0x655747);beam([-10.2,2.45,-46.4],[-7.9,2.45,-46.4],.055,0x655747);
  for(let x=-9.95;x<-8.1;x+=.22)beam([x,.5,-46.38],[x,2.32,-46.38],.012,0x65736f);obstacle(-9.05,-46.4,2.5,.5);

  // Period service kei-truck — original procedural model, not a branded vehicle.
  const truck=new THREE.Group();truck.position.set(6.2,.12,-42.3);truck.rotation.y=.06;group.add(truck);
  directBox([1.55,.52,2.8],[0,.47,.15],0xd7d4c6,truck,[0,0,0],true);directBox([1.5,1.25,1.18],[0,1.15,-.73],0xdedbcf,truck,[0,0,0],true);directBox([1.28,.52,.055],[0,1.35,-1.335],0x385965,truck);
  directBox([1.42,.12,1.35],[0,.84,.92],0x8c918b,truck);directBox([1.36,.28,.06],[0,.52,1.57],0xd6d1b9,truck);
  for(const x of [-.69,.69])for(const z of [-.88,1.03]){const wheel=directMesh(new THREE.TorusGeometry(.25,.09,7,16),material(0x252b2c),truck,[x,.38,z],[0,Math.PI/2,0]);wheel.castShadow=shadows;}
  box([.3,.13,.08],[5.75,.62,-40.72],0xb36b4b);box([.3,.13,.08],[6.65,.62,-40.72],0xe5cf8c);obstacle(6.2,-42.3,1.8,3.2);

  // Harbour office details: ice cabinet, drums, hand trolley and lamps.
  directBox([1.15,1.55,.85],[8.7,.88,-36.8],0xd8d8cc,group,[0,0,0],true);label('氷','ICE',[8.7,1.85,-36.35],.78,.5,0,'#dde1d7','#37636a');obstacle(8.7,-36.8,1.2,.9);

  for(const [x,z] of [[-17.1,-48],[16.3,-47.2]]){cyl(.11,4,[x,2.1,z],0x4b5655);box([1.1,.1,.18],[x,3.8,z],0x4b5655);lantern(x,z);}

  // Tyre fenders on the quay wall — broad black shapes, not thin white lines.
  for(const x of [-14,-7,0,7,14]){const tire=directMesh(new THREE.TorusGeometry(.42,.1,8,20),material(0x262d2e),group,[x,-.05,-49.76],[0,0,0]);tire.scale.set(1,.78,1);}

  // Rail only on far sides so the fishing position remains open and readable.
  for(const start of [-17,8])for(let x=start;x<start+9;x+=2.25){cyl(.06,1,[x,.63,-49.05],0x4b5c60);if(x<start+7)beam([x,1.02,-49.05],[x+2.25,1.02,-49.05],.045,0x4b5c60);}
  // The quay's own board is gone too: it stood two and a half metres up on nothing at
  // all, in the middle of the one open view the town has of the water.
  anchor([0,1,-47.1],'Cast a fishing line',()=>onAction('fishing'));

  // A couple of benches moved away from warehouse geometry.
  for(const x of [-4.7,4.7]){box([1.8,.14,.6],[x,.62,-43.2],0x8d7652,[0,0,0],'wood');for(const dx of [-.65,.65])box([.12,.6,.4],[x+dx,.31,-43.2],0x465355);obstacle(x,-43.2,1.9,.7);}

  // Fishing boat with a tapered toon hull, cabin, life-ring, mast and working lights.
  const boat=new THREE.Group();boat.position.set(9,-.18,-56);boat.rotation.y=-.07;group.add(boat);
  directMesh(new THREE.CylinderGeometry(1.45,1.02,6.3,6,1,false),material(0x2f5360),boat,[0,0,0],[Math.PI/2,0,0],[1,1,.45],true);
  directBox([2.25,1.55,2.25],[0,1.05,.2],0xd4cfb8,boat,[0,0,0],true);directBox([2.3,.58,2.3],[0,1.48,.2],0x365b66,boat);directBox([2.45,.12,2.55],[0,1.86,.2],0x394b50,boat);
  directCyl(.06,3.0,[0,3.25,.55],0x454b49,boat);directBox([1.2,.06,.06],[0,4.05,.55],0x454b49,boat);directBeam(boat,[0,3.72,.56],[.72,4.45,.98],.018,0x30383a);
  const life=directMesh(new THREE.TorusGeometry(.32,.07,8,18),material(0xc55e44),boat,[1.17,1.05,.5],[0,Math.PI/2,0]);life.castShadow=false;
  directBox([.5,.14,.16],[-.65,2.05,-.88],0xd7b75f,boat);directBox([.5,.14,.16],[.65,2.05,-.88],0xd7b75f,boat);

  // Distant breakwater, beacons and industrial silhouettes to give the harbour scale.
  box([68,2.1,4],[0,.18,-83],0x727f7e);for(const x of [-27,27]){cyl(1,7,[x,3.5,-83],0xc2c1b2);box([2.3,.7,2.3],[x,7,-83],x<0?0xa0493f:0xd1cdbb);}
  for(const [x,z,h] of [[-31,-98,13],[32,-102,16],[-45,-111,10]]){cyl(.24,h,[x,h/2,z],0x455054);beam([x,h*.8,z],[x+7,h*.8,z],.17,0x455054);beam([x+6.8,h*.8,z],[x+9,h*.55,z-3],.09,0x455054);}
  for(const [x,z,w,h] of [[-24,-105,15,7],[20,-107,18,8],[-3,-114,22,6]])box([w,h,10],[x,h/2-1,z],0x66706f);

  // The harbour used to stand four placeholder residents here. The town replaces its
  // people with the street cast, so they are no longer built at all: removed from the
  // scene they still answered 'Talk to' from where they had stood.
  const cat=new THREE.Group();cat.position.set(-5,0,-25);group.add(cat);
  const catLast=cat.position.clone();let catFacing=0,catResting=true;const cb=new THREE.Mesh(new THREE.BoxGeometry(.3,.3,.65),material(0xd0a471));cb.position.y=.28;cat.add(cb);const ch=new THREE.Mesh(new THREE.SphereGeometry(.2,10,8),material(0xd0a471));ch.position.set(0,.49,-.3);cat.add(ch);for(const x of [-.11,.11]){const ear=new THREE.Mesh(new THREE.ConeGeometry(.085,.18,3),material(0xd0a471));ear.position.set(x,.67,-.3);cat.add(ear);}register(cat,'Greet the cat',()=>onAction('cat'));

  for(const mesh of createHarbourInstances(batches.values(),{shadows,cellSize:harbourCellSize,consolidate:harbourBatching}))group.add(mesh);

  let wet=false;const rainCount=mobile?260:600,positions=new Float32Array(rainCount*3);
  for(let i=0;i<rainCount;i++){positions[i*3]=(Math.random()-.5)*32;positions[i*3+1]=Math.random()*16;positions[i*3+2]=(Math.random()-.5)*120;}
  const rainGeo=new THREE.BufferGeometry();rainGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));const rain=new THREE.Points(rainGeo,new THREE.PointsMaterial({color:0xadc8ca,size:.052,transparent:true,opacity:.58,depthWrite:false}));rain.visible=false;group.add(rain);

  return {
    group,colliders,people,cat,details,warehouse:harbourWarehouse,busStation,streetLamps,
    landmarks:[harbourWarehouse?.place,busStation.place].filter(Boolean),
    harbourShops,boardwalk,plantSites,shopDoors:shopDoors.filter(Boolean),
    setRain(value){
      boardwalk.setRain(value);
      wet=value;rain.visible=value;wetMeshes.forEach(m=>m.visible=value);const road=material(0xb8b8af,'road');road.roughness=value?.28:.84;setOceanWeather(value);
    },
    update(dt,time,day,minutes=1002){
      boat.rotation.z=Math.sin(time*.7)*.022;boat.position.y=-.18+Math.sin(time*.9)*.06;
      tickOcean(time);
      const lantern=lanternGlow(minutes),glass=windowGlow(minutes);
      for(const m of lamps){m.material.emissive.set(0xf0a65c);m.material.emissiveIntensity=.12+lantern*.82;}
      streetLamps.update(lantern);
      lampLights.forEach((l,i)=>l.intensity=lantern*(l.userData.nightIntensity||6));
      shopGlass.forEach(m=>{m.material.emissiveIntensity=.035+glass*.31;m.material.roughness=wet?.18:.24;});
      wetMeshes.forEach((m,i)=>{if(wet)m.material.opacity=.28+Math.sin(time*.7+i)*.045;});
      const playerPos=getPlayerPosition?.(),now=performance.now();
      people.forEach(p=>{
        if(p.g.userData.scheduled)return;
        let desiredZ=p.z+Math.sin(time*.11+p.index)*2.2;if(playerPos){const dx=p.g.position.x-playerPos.x,dz=desiredZ-playerPos.z;if(dx*dx+dz*dz<.72*.72)desiredZ=p.g.position.z;}
        const beforeZ=p.g.position.z;
        p.g.position.z=THREE.MathUtils.damp(p.g.position.z,desiredZ,7,dt);
        const movedZ=p.g.position.z-beforeZ;
        if(p.g.userData.facePlayerUntil>now&&playerPos){p.g.lookAt(playerPos.x,p.g.position.y,playerPos.z);p.g.rotateY(Math.PI);}
        else if(Math.abs(movedZ)>1e-5){
          // Face the way they are actually going, and ease into it. This used to flip
          // between two fixed angles from the phase of the patrol, but the position is
          // damped and lags that phase, so at each end of the walk they turned round
          // before they stopped and spent a moment travelling backwards.
          const yaw=movedZ>0?Math.PI:0;
          const angle=Math.atan2(Math.sin(yaw-p.g.rotation.y),Math.cos(yaw-p.g.rotation.y));
          p.g.rotation.y+=angle*(1-Math.exp(-dt*6));
        }
        p.legs.forEach((l,i)=>l.rotation.x=Math.sin(time*3+i*Math.PI)*.22);p.arms.forEach((l,i)=>l.rotation.x=-Math.sin(time*3+i*Math.PI)*.16);
      });
      // The cat's heading belongs to whoever is walking it (people/schedules.js turns it
      // toward each place it visits). Overwriting it every frame with an absolute sway
      // meant it spent most of the day travelling sideways or backwards. Sway only when
      // it has actually stopped, and sway around where it is facing.
      const catMoved=Math.hypot(cat.position.x-catLast.x,cat.position.z-catLast.z);
      catLast.copy(cat.position);
      if(catMoved>1e-4){catResting=false;catFacing=cat.rotation.y;}
      else{if(!catResting){catResting=true;catFacing=cat.rotation.y;}cat.rotation.y=catFacing+Math.sin(time*.3)*.2;}
      if(wet){for(let i=0;i<rainCount;i++){positions[i*3+1]-=dt*12;if(positions[i*3+1]<0)positions[i*3+1]=16;}rainGeo.attributes.position.needsUpdate=true;}
    }
  };
}
