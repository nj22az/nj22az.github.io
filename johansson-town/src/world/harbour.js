import {createVendingMachine} from './vending.js';
import {buildHarbourShop} from './harbour-block.js';
import {buildBoardwalk} from './boardwalk.js';
import {BOARDWALK} from './layout.js';
import {createHarbourInstances} from '../render/harbour-instances.js';
import {addHorizon} from './horizon.js';
import {buildStorefront} from './storefront.js';
import {MERCHANT_FRONTAGES,merchantRoofGeometry} from './merchant-roofs.js';
import {createMaterials} from '../render/materials.js';
import * as THREE from '../../vendor/three.module.js';

// Johansson Town original harbour geometry, using the shared PBR surface maps.
// Static geometry is instanced by geometry/material; interaction anchors stay independent.
export function createTown({scene,sites,mobile,shadows=!mobile,maxAnisotropy=4,register,enter,onAction,getPlayerPosition,harbourCellSize=48,harbourBatching=true}) {
  const group=new THREE.Group();scene.add(group);
  const harbourShops=[],plantSites=[];
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
    const mat=new THREE.MeshStandardMaterial({map:tex,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:glow?.55:.05,side:THREE.DoubleSide});
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),mat);mesh.position.set(...p);mesh.rotation.y=angle;mesh.castShadow=false;mesh.receiveShadow=false;group.add(mesh);return mesh;
  }
  function anchor(p,label,action){const a=new THREE.Object3D();a.position.set(...p);group.add(a);register(a,label,action);return a;}
  function obstacle(x,z,w,d){colliders.push({x,z,w,d});}
  function lantern(x,z){
    const lm=material(0xf0a65c,null,.12),m=new THREE.Mesh(new THREE.SphereGeometry(.25,12,10),lm);m.scale.set(.8,1.4,.8);m.position.set(x,2.55,z);m.castShadow=false;group.add(m);lamps.push(m.material);box([.26,.05,.26],[x,2.91,z],0x3c3430);
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
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,d),markingMaterials.get(c));m.rotation.x=-Math.PI/2;m.position.set(x,-.046,z);m.renderOrder=1;group.add(m);return m;
  }

  addHorizon(group);
  // Base town and road. Markings are non-coplanar decal planes to eliminate white-line z fighting.
  box([150,.5,190],[0,-.65,0],0x606b61);
  box([15,.2,48],[0,-.16,32],0xb8b8af,[0,0,0],'road');
  box([15,.2,4],[0,-.16,-54],0xb8b8af,[0,0,0],'road');
  const boardwalk=buildBoardwalk(group,{mobile,shadows,maxAnisotropy});
  for(const side of [-1,1]){
    for(const [a,b] of (side<0?[[8,27.5],[30.5,47.25],[52.75,56]]:[[8,15.25],[20.75,47.25],[52.75,56]]))box([4.5,.12,b-a],[side*9.5,-.06,(a+b)/2],0xddd7ca,[0,0,0],'paving');
    for(let z=9;z<56;z+=1)if(!(side<0?[29,50]:[18,50]).some(gap=>Math.abs(z-gap)<3.5))box([.22,.3,1],[side*7.35,.02,z],0x777c77);
    for(let z=11;z<52;z+=4.5)roadMark(.16,1.55,side*6.25,z,0xa99f7d);
    for(let z=10;z<52;z+=3)box([.18,.018,1.4],[side*7.1,.145,z],0x343d3e);
  }
  for(let z=11;z<47;z+=7.4)roadMark(.13,2.7,0,z,0xc2ad74);
  for(let x=-5.2;x<=5.2;x+=1.35)roadMark(.72,2.45,x,43,0xbeb79a);
  [[-2.1,36,1.15,.45,.2],[2.7,25,.8,.35,-.3]].forEach(v=>puddle(...v));

  // Shopfronts — masonry and timber with glass where useful.
  sites.forEach((s,i)=>{
    if(s.id==='market'){
      buildStorefront({parent:group,site:s,register,enter,label});
      s.x=s.side*11.65;s.door=[s.side*5.5,0,s.z+2.5];
      obstacle(s.side*11.65,s.z,8.2,10);return;
    }
    const harbourShop=buildHarbourShop({parent:group,site:s,register,enter,label,mobile,shadows,maxAnisotropy});
    if(harbourShop){harbourShops.push(harbourShop);colliders.push(harbourShop.collider);plantSites.push({x:s.side*6.75,z:s.z-3.7,height:1.15});obstacle(s.side*6.75,s.z-3.7,.5,.5);return;}
    if(s.id==='market'){buildStorefront({parent:group,site:s,register,enter,label});return;}
    const style=MERCHANT_FRONTAGES[i%MERCHANT_FRONTAGES.length],side=s.side,x=side*11.8,z=s.z,front=side*7.55,angle=-side*Math.PI/2,height=style.height;
    box([8.2,height,10],[x,height/2,z],[0xe0cfaa,0xe5c8b5,0xc0d0c9,0xe4d5bb,0xd8c3ba,0xc5cfd5,0xead5b8,0xc5d0bf][i%8],[0,0,0],'wall');
    box([.25,2.7,10.15],[side*7.65,1.4,z],s.color,[0,0,0],'wood');
    if(style.roof==='parapet'){
      box([8.65,.2,10.5],[x,height+.1,z],style.roofColour,[0,0,0],'wall');
      for(const edge of [-1,1]){box([.23,.7,10.6],[x+edge*4.2,height+.46,z],style.wall,[0,0,0],'wall');box([8.65,.7,.23],[x,height+.46,z+edge*5.18],style.wall,[0,0,0],'wall');}
    }else{
      const roof=directMesh(merchantRoofGeometry(style.roof),material(style.roofColour,'roof'),group,[x,height+.18,z]);roof.name='merchant-roof:'+s.id+':'+style.roof;roof.material.side=THREE.DoubleSide;
      if(style.roof!=='hipped')beam([x,height+(style.roof==='low-gable'?.82:1.74),z-5.5],[x,height+(style.roof==='low-gable'?.82:1.74),z+5.5],.105,0x4d554e);
    }
    // Broad painted plaster, fine joinery and stocked windows read at walking distance.
    for(const dz of [-3,-.2,2.6]){
      box([.42,.18,2.0],[front-side*.25,4.23,z+dz],0x875c44,[0,0,0],'wood');
      for(let n=0;n<7;n++)box([.12,.66,.04],[front-side*.47,4.58,z+dz-.75+n*.25],0x6b493c);
    }
    for(let n=0;n<19;n++)box([.07,.78,.055],[front-side*.20,.42,z-4.5+n*.23],0x765342);
    box([.38,.36,1.5],[front-side*.62,.40,z-3.2],0x9c6850);
    for(let n=0;n<6;n++){
      shape('sphere',[.10,10,8],[front-side*.64,.74,z-3.8+n*.23],0x66864f);
      shape('sphere',[.045,10,8],[front-side*.65,.84,z-3.8+n*.23],[0xdb9a91,0xe4bd6a,0xd9aec0][i%3]);
    }
    label(['新刊','修理','手仕事','喫茶'][i%4],['NEW ARRIVALS','REPAIRS WELCOME','MADE HERE','TAKE A LITTLE BREAK'][i%4],[front-side*.36,1.65,z+4.0],.72,.98,angle,'#f8e7c3',s.accent);
    // Deep eaves and exposed timber establish a two-storey merchant house silhouette.
    box([.52,.2,10.7],[front-side*.2,height-.1,z],0x565549,[0,0,0],'wood');
    if(style.timber){
      for(const offset of [-4.65,-1.55,1.55,4.65])box([.14,2.65,.14],[front-side*.17,4.96,z+offset],0x655c49,[0,0,0],'wood');
      for(const y of [3.9,height-.3])box([.14,.16,9.6],[front-side*.18,y,z],0x655c49,[0,0,0],'wood');
    }
    label(s.jp,s.title.toUpperCase(),[front-side*.09,3.43,z-.4],style.signWidth,style.signHeight,angle,'#d9ceb3',s.accent,false);
    for(const dz of [-3,-.2,2.6]){
      box([.07,1.45,1.7],[front-side*.1,5.12,z+dz],0x40595d);
      shopGlass.push(glassPanel(front-side*.145,5.12,z+dz,1.62,1.34,angle));
      for(const offset of [-.88,0,.88])box([.18,1.7,.075],[front-side*.19,5.12,z+dz+offset],0x675d4b);
      for(const y of [4.33,5.9])box([.18,.08,1.85],[front-side*.19,y,z+dz],0x675d4b);
      box([1,.09,2],[front-side*.38,4.24,z+dz],0x62645c);
    }
    box([.1,1.75,3.5],[front-side*.18,1.45,z-1.8],0x294c53);shopGlass.push(glassPanel(front-side*.245,1.47,z-1.8,3.25,1.58,angle));
    for(const dz of [-3.5,-1.8,-.1])box([.18,2,.06],[front-side*.28,1.5,z+dz],0x745b42);
    for(let j=0;j<6;j++)box([.09,.12,.34],[front-side*.25,.77+(j%2)*.3,z-3.2+j*.48],[0xcabb8a,0x9d6652,0x6e877b][j%3]);
    box([1.55,.09,5.2],[front-side*.55,2.9,z-1.6],s.color,[0,0,-side*.13]);
    for(let n=0;n<7;n++)box([.06,.35,.36],[front-side*1.28,2.72,z-3.86+n*.7],0xe1d4af);
    box([.18,2.55,1.5],[front-side*.14,1.35,z+2.55],0x3b4440);box([.12,2.35,1.22],[front-side*.26,1.3,z+2.55],0x8b7050,[0,0,0],'wood');
    for(let n=0;n<3;n++)box([.08,.65,.39],[front-side*.38,2.27,z+2.08+n*.47],s.color);
    label('営業中','OPEN',[front-side*.44,1.65,z+2.5],.65,.38,angle);anchor([side*6.8,1.2,z+2.5],`Enter ${s.title}`,()=>enter(s));
    box([.65,.18,1.8],[side*7.05,.18,z+2.5],0xb2afa3);box([.65,.65,1.1],[front-side*.32,4.05,z+4.2],0xaaa497);
    for(let y=3.8;y<4.3;y+=.1)box([.02,.025,.85],[front-side*.66,y,z+4.2],0x5c655f);
    cyl(.045,height,[front-side*.22,height/2,z-4.8],0x555f60);plantSites.push({x:side*6.75,z:z-4.25,height:1.05});obstacle(side*6.75,z-4.25,.65,.65);
  });

  // Utility poles and overhead cables.
  for(const side of [-1,1])for(let z=-48;z<=48;z+=16){
    if(z<=BOARDWALK.maxZ){
      if(z===-32){
        // Low deck lights replace the southern overhead power poles.
        cyl(.10,.85,[side*6.3,.425,z],0x3b4848);box([.22,.10,.22],[side*6.3,.9,z],0xe7c080);obstacle(side*6.3,z,.25,.25);
        const light=new THREE.PointLight(0xffd7a0,0,14,2);light.userData.nightIntensity=18;light.position.set(side*6.3,1,z);group.add(light);lampLights.push(light);
      }
      continue;
    }
    cyl(.13,8,[side*6.7,4,z],0x574f49);obstacle(side*6.7,z,.38,.38);box([2.4,.14,.18],[side*6.7,7.3,z],0x4b534e);
    for(const dx of [-.8,0,.8]){
      cyl(.08,.26,[side*6.7+dx,7.52,z],0xc6cac1);
      if(z<48){const points=[];for(let k=0;k<=8;k++)points.push(new THREE.Vector3(side*6.7+dx,7.58+42*(Math.cosh((k*2-8)/42)-Math.cosh(8/42)),z+k*2));const g=new THREE.BufferGeometry().setFromPoints(points);group.add(new THREE.Line(g,new THREE.LineBasicMaterial({color:0x263234})));}
    }
    beam([side*6.7,5.7,z],[side*5.6,5.7,z],.06);box([.6,.12,.26],[side*5.5,5.65,z],0xdac08d);
    if(z===-32||z===32){const light=new THREE.PointLight(0xffd7a0,0,22,2);light.userData.nightIntensity=18;light.position.set(side*5.5,4.8,z);group.add(light);lampLights.push(light);}
  }
  for(const x of [-7,7])cyl(.17,6.8,[x,3.4,48],0x416568);beam([-7,6.4,48],[7,6.4,48],.11,0x416568);label('ヨハンソン商店街','JOHANSSON TOWN · 1988',[0,6.3,48],7.2,1.15,0,'#d8d5b9','#31565d');

  // Street interactions.
  const vending=createVendingMachine({shadows});vending.position.set(5.95,0,38);group.add(vending);
  obstacle(5.95,38,1.3,1);anchor([5.95,1,39],'Buy a drink',()=>onAction('vending'));
  box([1.1,2.5,1],[-5.9,1.25,31],0x457e73);box([.91,1.6,.91],[-5.9,1.55,31],0x648c87);box([.35,.65,.28],[-5.9,1.4,31.53],0x3d9c6c);label('電話','TELEPHONE',[-5.9,2.4,31.55],1,.28);anchor([-5.9,1,32],'Use payphone',()=>onAction('phone'));obstacle(-5.9,31,1.1,1);
  cyl(.05,2.8,[-5.9,1.4,44],0x64756d);label('バス停','HARBOUR LINE',[-5.9,2.6,44],1.1,.75);anchor([-5.8,1,44],'Read bus timetable',()=>onAction('bus'));obstacle(-5.9,44,.26,.26);
  box([1,1.8,1.1],[5.9,.9,20],0x483d50);box([.88,.7,.12],[5.9,1.4,20.57],0x294d59);label('STAR PORT','INSERT ¥100',[5.9,1.48,20.65],.77,.5,0,'#142d42','#83ded8',true);obstacle(5.9,20,1,1.1);anchor([5.9,1,21],'Play Star Port',()=>onAction('arcade'));

  for(const [x,z] of [[-6,4],[6,-6],[-6,-35]]){
    for(const dz of [-.62,.62]){const tire=new THREE.Mesh(new THREE.TorusGeometry(.36,.035,6,20),material(0x333b3d));tire.rotation.y=Math.PI/2;tire.position.set(x,.4,z+dz);tire.castShadow=shadows;group.add(tire);}
    beam([x,.4,z-.62],[x,.9,z],.035,0x71999a);beam([x,.9,z],[x,.4,z+.62],.035,0x71999a);beam([x,.4,z-.62],[x,.4,z+.35],.035,0x71999a);beam([x,.4,z+.62],[x,1.14,z+.55],.03);beam([x-.24,1.14,z+.55],[x+.24,1.14,z+.55],.03);box([.24,.07,.32],[x,1,z-.1],0x463d32);obstacle(x,z,.65,1.55);
  }

  // ----- Working harbour district -----
  // Quay is deliberately built as one elevated slab with chunky edge geometry; no coplanar white strips.
  box([38,.4,12],[0,-.105,-58],0x999b94,[0,0,0],'wall');
  box([38,.6,.65],[0,-.12,-63.65],0x596568);
  box([38,.18,.55],[0,.19,-63.28],0x343f41);

  const seaGeo=new THREE.PlaneGeometry(160,86,42,28);
  const seaMat=new THREE.MeshStandardMaterial({color:0x426f79,transparent:false,dithering:true});
  const sea=new THREE.Mesh(seaGeo,seaMat);sea.rotation.x=-Math.PI/2;sea.position.set(0,-.50,-106.5);sea.receiveShadow=false;group.add(sea);water.push(sea);
  const seaPos=seaGeo.attributes.position;

  function warehouse(side){
    const x=side*13.7,z=-56.4,front=side*10.55,angle=-side*Math.PI/2;
    box([6.2,3.7,5.8],[x,1.85,z],side<0?0x707a78:0x76776e);box([6.8,.24,6.25],[x,3.86,z],0x4f5f61,[0,0,side*.04],'roof');
    box([.16,2.75,3.4],[front,1.5,z],0x556466);for(let y=.45;y<2.65;y+=.43)box([.20,.055,3.46],[front-side*.09,y,z],0x303b3d);
    for(let dz=-2.25;dz<=2.25;dz+=.5)box([.09,3.25,.07],[front-side*.13,1.75,z+dz],0x8b8d82);
    label(side<0?'漁具倉庫':'冷蔵倉庫',side<0?'FISHING GEAR':'COLD STORAGE',[front-side*.17,3.15,z+1.55],2.2,.55,angle,'#d5cfb7','#38494b');
    box([.55,.95,.45],[front-side*.25,.55,z-1.9],0x5a6a65);box([.34,.2,.12],[front-side*.5,.78,z-1.9],0xc9b36c);
    obstacle(x,z,6.4,6.0);
  }
  warehouse(-1);warehouse(1);

  function bollard(x,z){
    directCyl(.22,.48,[x,.35,z],0x2f3c3f,group,[0,0,0],true,12);directCyl(.31,.12,[x,.61,z],0x2f3c3f);obstacle(x,z,.48,.48);
  }
  [-15,-10,-5,5,10,15].forEach(x=>bollard(x,-62.45));

  function ropeCoil(x,z,scale=1){
    const rm=material(0xa38a62);for(let i=0;i<3;i++){const t=directMesh(new THREE.TorusGeometry(.35*scale+i*.07,.045*scale,6,20),rm,group,[x,.18+i*.035,z],[Math.PI/2,0,(i%2)*.25],[1,1,1],false);t.castShadow=false;}
  }
  ropeCoil(-8.3,-61.1,.9);ropeCoil(8.9,-61.2,.75);

  function crateStack(x,z,cols=2,rows=2){
    const colors=[0x4f6f76,0xa9854e,0x6f805e];
    for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){const px=x+(c-(cols-1)/2)*.72,pz=z+(r%2)*.12;box([.62,.45,.72],[px,.32+r*.48,pz],colors[(r+c)%colors.length]);for(const sx of [-.25,.25])box([.04,.28,.76],[px+sx,.34+r*.48,pz],0x263537);}
    obstacle(x,z,cols*.78,.9);
  }
  crateStack(-7.3,-58.0,2,3);crateStack(7.2,-60.2,3,2);

  // Fishing-net drying rack.
  for(const x of [-10.2,-7.9])cyl(.06,2.4,[x,1.3,-60.4],0x655747);beam([-10.2,2.45,-60.4],[-7.9,2.45,-60.4],.055,0x655747);
  for(let x=-9.95;x<-8.1;x+=.22)beam([x,.5,-60.38],[x,2.32,-60.38],.012,0x65736f);obstacle(-9.05,-60.4,2.5,.5);

  // Period service kei-truck — original procedural model, not a branded vehicle.
  const truck=new THREE.Group();truck.position.set(6.2,.12,-56.3);truck.rotation.y=.06;group.add(truck);
  directBox([1.55,.52,2.8],[0,.47,.15],0xd7d4c6,truck,[0,0,0],true);directBox([1.5,1.25,1.18],[0,1.15,-.73],0xdedbcf,truck,[0,0,0],true);directBox([1.28,.52,.055],[0,1.35,-1.335],0x385965,truck);
  directBox([1.42,.12,1.35],[0,.84,.92],0x8c918b,truck);directBox([1.36,.28,.06],[0,.52,1.57],0xd6d1b9,truck);
  for(const x of [-.69,.69])for(const z of [-.88,1.03]){const wheel=directMesh(new THREE.TorusGeometry(.25,.09,7,16),material(0x252b2c),truck,[x,.38,z],[0,Math.PI/2,0]);wheel.castShadow=shadows;}
  box([.3,.13,.08],[5.75,.62,-54.72],0xb36b4b);box([.3,.13,.08],[6.65,.62,-54.72],0xe5cf8c);obstacle(6.2,-56.3,1.8,3.2);

  // Harbour office details: ice cabinet, drums, hand trolley and lamps.
  directBox([1.15,1.55,.85],[-10.0,.88,-54.15],0xd8d8cc,group,[0,0,0],true);label('氷','ICE',[-10,1.85,-53.70],.78,.5,0,'#dde1d7','#37636a');obstacle(-10,-54.15,1.2,.9);
  for(const [x,z,c] of [[10.3,-54.2,0x4b6870],[11.0,-54.3,0x8b634e],[10.7,-55.0,0x66704e]]){directCyl(.3,.72,[x,.48,z],c,group,[0,0,0],true);obstacle(x,z,.6,.6);}
  for(const x of [-16.3,16.3]){cyl(.11,4,[x,2.1,-61.2],0x4b5655);box([1.1,.1,.18],[x,3.8,-61.2],0x4b5655);lantern(x,-61.2);}

  // Tyre fenders on the quay wall — broad black shapes, not thin white lines.
  for(const x of [-14,-7,0,7,14]){const tire=directMesh(new THREE.TorusGeometry(.42,.1,8,20),material(0x262d2e),group,[x,-.05,-63.76],[0,0,0]);tire.scale.set(1,.78,1);}

  // Rail only on far sides so the fishing position remains open and readable.
  for(const start of [-17,8])for(let x=start;x<start+9;x+=2.25){cyl(.06,1,[x,.63,-63.05],0x4b5c60);if(x<start+7)beam([x,1.02,-63.05],[x+2.25,1.02,-63.05],.045,0x4b5c60);}
  label('港町','HARBOUR · FISHING PIER',[0,2.5,-58.15],3.8,.75);anchor([0,1,-61.1],'Cast a fishing line',()=>onAction('fishing'));

  // A couple of benches moved away from warehouse geometry.
  for(const x of [-4.7,4.7]){box([1.8,.14,.6],[x,.62,-57.2],0x8d7652,[0,0,0],'wood');for(const dx of [-.65,.65])box([.12,.6,.4],[x+dx,.31,-57.2],0x465355);obstacle(x,-57.2,1.9,.7);}

  // Fishing boat with a tapered toon hull, cabin, life-ring, mast and working lights.
  const boat=new THREE.Group();boat.position.set(9,-.18,-70);boat.rotation.y=-.07;group.add(boat);
  directMesh(new THREE.CylinderGeometry(1.45,1.02,6.3,6,1,false),material(0x2f5360),boat,[0,0,0],[Math.PI/2,0,0],[1,1,.45],true);
  directBox([2.25,1.55,2.25],[0,1.05,.2],0xd4cfb8,boat,[0,0,0],true);directBox([2.3,.58,2.3],[0,1.48,.2],0x365b66,boat);directBox([2.45,.12,2.55],[0,1.86,.2],0x394b50,boat);
  directCyl(.06,3.0,[0,3.25,.55],0x454b49,boat);directBox([1.2,.06,.06],[0,4.05,.55],0x454b49,boat);directBeam(boat,[0,3.72,.56],[.72,4.45,.98],.018,0x30383a);
  const life=directMesh(new THREE.TorusGeometry(.32,.07,8,18),material(0xc55e44),boat,[1.17,1.05,.5],[0,Math.PI/2,0]);life.castShadow=false;
  directBox([.5,.14,.16],[-.65,2.05,-.88],0xd7b75f,boat);directBox([.5,.14,.16],[.65,2.05,-.88],0xd7b75f,boat);

  // Distant breakwater, beacons and industrial silhouettes to give the harbour scale.
  box([68,2.1,4],[0,.18,-97],0x727f7e);for(const x of [-27,27]){cyl(1,7,[x,3.5,-97],0xc2c1b2);box([2.3,.7,2.3],[x,7,-97],x<0?0xa0493f:0xd1cdbb);}
  for(const [x,z,h] of [[-31,-112,13],[32,-116,16],[-45,-125,10]]){cyl(.24,h,[x,h/2,z],0x455054);beam([x,h*.8,z],[x+7,h*.8,z],.17,0x455054);beam([x+6.8,h*.8,z],[x+9,h*.55,z-3],.09,0x455054);}
  for(const [x,z,w,h] of [[-24,-119,15,7],[20,-121,18,8],[-3,-128,22,6]])box([w,h,10],[x,h/2-1,z],0x66706f);

  // Shrine at the far end of town.
  for(const x of [-3,3]){cyl(.16,4,[x,2,55],0xa34531);obstacle(x,55,.38,.38);}box([7.3,.24,.36],[0,4.1,55],0x973f30);box([6.7,.18,.32],[0,3.45,55],0x973f30);box([3,2.6,2],[0,1.3,60],0x8b7050,[0,0,0],'wood');obstacle(0,60,3,2);box([3.8,.22,2.8],[0,2.8,60],0x4e6061);anchor([0,1,57.8],'Visit the shrine',()=>onAction('shrine'));

  const residents=[['Aiko',-4,34,0x9b5347],['Kenji',4,13,0x51717d],['Mrs Sato',-3,-23,0x766484],['Harbour master',3,-54,0x465965]];
  residents.forEach(([name,x,z,color],index)=>{
    const g=new THREE.Group();g.position.set(x,0,z);g.userData.name=name;group.add(g);
    function part(geo,p,col){const m=new THREE.Mesh(geo,material(col));m.position.set(...p);g.add(m);return m;}
    part(new THREE.CylinderGeometry(.25,.21,.66,8),[0,1.17,0],color);part(new THREE.SphereGeometry(.22,10,8),[0,1.73,0],0xc79571);
    const legs=[-.14,.14].map(dx=>part(new THREE.BoxGeometry(.17,.65,.2),[dx,.53,0],0x354349));const arms=[-.33,.33].map(dx=>part(new THREE.BoxGeometry(.14,.55,.17),[dx,1.1,0],color));register(g,`Talk to ${name}`,()=>onAction('resident',name));people.push({g,legs,arms,x,z,index});
  });
  const cat=new THREE.Group();cat.position.set(-5,0,-25);group.add(cat);const cb=new THREE.Mesh(new THREE.BoxGeometry(.3,.3,.65),material(0xd0a471));cb.position.y=.28;cat.add(cb);const ch=new THREE.Mesh(new THREE.SphereGeometry(.2,10,8),material(0xd0a471));ch.position.set(0,.49,-.3);cat.add(ch);for(const x of [-.11,.11]){const ear=new THREE.Mesh(new THREE.ConeGeometry(.085,.18,3),material(0xd0a471));ear.position.set(x,.67,-.3);cat.add(ear);}register(cat,'Greet the cat',()=>onAction('cat'));

  for(const mesh of createHarbourInstances(batches.values(),{shadows,cellSize:harbourCellSize,consolidate:harbourBatching}))group.add(mesh);

  let wet=false;const rainCount=mobile?260:600,positions=new Float32Array(rainCount*3);
  for(let i=0;i<rainCount;i++){positions[i*3]=(Math.random()-.5)*32;positions[i*3+1]=Math.random()*16;positions[i*3+2]=(Math.random()-.5)*120;}
  const rainGeo=new THREE.BufferGeometry();rainGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));const rain=new THREE.Points(rainGeo,new THREE.PointsMaterial({color:0xadc8ca,size:.052,transparent:true,opacity:.58,depthWrite:false}));rain.visible=false;group.add(rain);

  return {
    group,colliders,people,cat,
    harbourShops,boardwalk,plantSites,
    setRain(value){
      boardwalk.setRain(value);
      wet=value;rain.visible=value;wetMeshes.forEach(m=>m.visible=value);const road=material(0xb8b8af,'road');road.roughness=value?.28:.84;seaMat.color.set(value?0x345b66:0x426f79);
    },
    update(dt,time,day){
      boat.rotation.z=Math.sin(time*.7)*.022;boat.position.y=-.18+Math.sin(time*.9)*.06;
      for(let i=0;i<seaPos.count;i++){const x=seaPos.getX(i),y=seaPos.getY(i);seaPos.setZ(i,Math.sin(x*.17+time*.72)*.035+Math.sin(y*.12-time*.47)*.024);}seaPos.needsUpdate=true;
      for(const m of lamps){m.emissive.set(0xf0a65c);m.emissiveIntensity=.12+(1-day)*.82;}
      lampLights.forEach((l,i)=>l.intensity=(1-day)*(l.userData.nightIntensity||6));
      shopGlass.forEach(m=>{m.material.emissiveIntensity=.035+(1-day)*.31;m.material.roughness=wet?.18:.24;});
      wetMeshes.forEach((m,i)=>{if(wet)m.material.opacity=.28+Math.sin(time*.7+i)*.045;});
      const playerPos=getPlayerPosition?.(),now=performance.now();
      people.forEach(p=>{
        if(p.g.userData.scheduled)return;
        let desiredZ=p.z+Math.sin(time*.11+p.index)*2.2;if(playerPos){const dx=p.g.position.x-playerPos.x,dz=desiredZ-playerPos.z;if(dx*dx+dz*dz<.72*.72)desiredZ=p.g.position.z;}
        p.g.position.z=THREE.MathUtils.damp(p.g.position.z,desiredZ,7,dt);
        if(p.g.userData.facePlayerUntil>now&&playerPos){p.g.lookAt(playerPos.x,p.g.position.y,playerPos.z);p.g.rotateY(Math.PI);}else p.g.rotation.y=Math.cos(time*.11+p.index)>0?Math.PI:0;
        p.legs.forEach((l,i)=>l.rotation.x=Math.sin(time*3+i*Math.PI)*.22);p.arms.forEach((l,i)=>l.rotation.x=-Math.sin(time*3+i*Math.PI)*.16);
      });
      cat.rotation.y=Math.sin(time*.3)*.2;
      if(wet){for(let i=0;i<rainCount;i++){positions[i*3+1]-=dt*12;if(positions[i*3+1]<0)positions[i*3+1]=16;}rainGeo.attributes.position.needsUpdate=true;}
    }
  };
}
