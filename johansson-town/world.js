import * as THREE from '../the-front-row-seat/pelican/vendor/three.module.min.js';

// Static geometry is instanced by geometry/material; interaction anchors stay independent.
export function createTown({scene,sites,mobile,shadows=!mobile,maxAnisotropy=4,register,enter,onAction,getPlayerPosition}) {
  const group=new THREE.Group();scene.add(group);
  const materials=new Map(),geometries=new Map(),batches=new Map(),colliders=[],lamps=[],lampLights=[],people=[],water=[],wetMeshes=[];
  const loader=new THREE.TextureLoader();
  function texture(file,repeat){const t=loader.load(new URL(`./assets/${file}`,import.meta.url).href,undefined,undefined,()=>{});t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...repeat);t.anisotropy=Math.min(maxAnisotropy,mobile?4:8);return t;}
  const maps={road:texture('asphalt.jpg',[4,24]),wall:texture('plaster.jpg',[2,2]),wood:texture('timber.jpg',[2,3]),roof:texture('roof.jpg',[3,3])};
  function material(color,map,glow=0){
    const key=`${color}/${map||''}/${glow}`;
    if(!materials.has(key)){
      const roughness=map==='road'?.82:map==='wood'?.76:map==='roof'?.68:map==='wall'?.88:.86;
      const metalness=map==='roof'?.04:0;
      materials.set(key,new THREE.MeshStandardMaterial({color,map:maps[map]||null,roughness,metalness,emissive:glow?color:0,emissiveIntensity:glow}));
    }
    return materials.get(key);
  }
  function shape(type,args,p,c,rotation=[0,0,0],map=null){const key=type+args.join(',');if(!geometries.has(key))geometries.set(key,type==='box'?new THREE.BoxGeometry(...args):type==='cylinder'?new THREE.CylinderGeometry(...args):new THREE.SphereGeometry(...args));const mat=material(c,map),bk=key+mat.uuid;if(!batches.has(bk))batches.set(bk,{geo:geometries.get(key),mat,matrices:[]});const obj=new THREE.Object3D();obj.position.set(...p);obj.rotation.set(...rotation);obj.updateMatrix();batches.get(bk).matrices.push(obj.matrix.clone());}
  const box=(s,p,c=0xffffff,r=[0,0,0],map=null)=>shape('box',s,p,c,r,map);
  const cyl=(r,h,p,c=0x444b4b)=>shape('cylinder',[r,r,h,10],p,c);
  function beam(a,b,r=.025,c=0x303334){const d=new THREE.Vector3().subVectors(new THREE.Vector3(...b),new THREE.Vector3(...a));const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.clone().normalize());const e=new THREE.Euler().setFromQuaternion(q);shape('cylinder',[r,r,d.length(),8],a.map((v,i)=>(v+b[i])/2),c,[e.x,e.y,e.z]);}
  function label(text,sub,p,width,height,angle=0,bg='#e9dcc1',fg='#283d3e',glow=false){const canvas=document.createElement('canvas');canvas.width=768;canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle=bg;ctx.fillRect(0,0,768,256);ctx.strokeStyle=fg;ctx.lineWidth=8;ctx.strokeRect(12,12,744,232);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=fg;ctx.font='700 96px "Yu Gothic",system-ui';ctx.fillText(text,384,106,716);ctx.font='600 30px system-ui';ctx.fillText(sub,384,201,700);const tex=new THREE.CanvasTexture(canvas);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=Math.min(maxAnisotropy,8);const mat=new THREE.MeshStandardMaterial({map:tex,roughness:.76,emissive:0xffffff,emissiveMap:tex,emissiveIntensity:glow?.6:.08,side:THREE.DoubleSide});const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),mat);mesh.position.set(...p);mesh.rotation.y=angle;mesh.castShadow=false;mesh.receiveShadow=false;group.add(mesh);return mesh;}
  function anchor(p,label,action){const a=new THREE.Object3D();a.position.set(...p);group.add(a);register(a,label,action);return a;}
  function obstacle(x,z,w,d){colliders.push({x,z,w,d});}
  function lantern(x,z){const lm=material(0xf6ad60);const m=new THREE.Mesh(new THREE.SphereGeometry(.25,12,10),lm);m.scale.set(.8,1.4,.8);m.position.set(x,2.55,z);m.castShadow=false;group.add(m);lamps.push(m.material);box([.26,.05,.26],[x,2.91,z],0x3c3430);if(shadows){const light=new THREE.PointLight(0xffb96e,0,8,2);light.position.set(x,2.55,z);group.add(light);lampLights.push(light);}}
  function glassPanel(x,y,z,w,h,angle){const mat=new THREE.MeshPhysicalMaterial({color:0x355662,roughness:.22,metalness:.05,clearcoat:.32,clearcoatRoughness:.16,emissive:0x17292e,emissiveIntensity:.05});const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat);m.position.set(x,y,z);m.rotation.y=angle;m.receiveShadow=false;m.castShadow=false;group.add(m);return m;}
  const shopGlass=[];
  function puddle(x,z,sx,sz,rot=0){const mat=new THREE.MeshPhysicalMaterial({color:0x263c43,roughness:.12,metalness:.12,transparent:true,opacity:.38,depthWrite:false});const m=new THREE.Mesh(new THREE.CircleGeometry(1,28),mat);m.rotation.x=-Math.PI/2;m.rotation.z=rot;m.position.set(x,-.032,z);m.scale.set(sx,sz,1);m.visible=false;m.renderOrder=2;group.add(m);wetMeshes.push(m);}

  box([150,.5,190],[0,-.65,0],0x606b61);
  box([15,.2,112],[0,-.16,0],0xcccccc,[0,0,0],'road');
  for(const side of [-1,1]){box([4.5,.25,112],[side*9.5,0,0],0x9d9d93,[0,0,0],'wall');box([.22,.25,112],[side*7.35,0,0],0xc0bfb5);for(let z=-54;z<54;z+=3){box([1.5,.04,.06],[side*6.25,.005,z],0xeee4ca);box([.18,.015,1.4],[side*7.1,.015,z],0x373f40);}}
  for(let z=-48;z<48;z+=7)box([.1,.012,2.8],[0,-.045,z],0xe1c998);
  for(let x=-5;x<=5;x+=1.3)box([.65,.018,2.5],[x,-.04,43],0xd3cdb8);
  [[-2.1,36,1.15,.45,.2],[2.7,25,.8,.35,-.3],[-1.5,8,1,.42,.4],[2,-11,.75,.32,.1],[-2.7,-27,.95,.38,-.2],[1.2,-43,1.2,.48,.25]].forEach(v=>puddle(...v));

  sites.forEach((s,i)=>{
    const side=s.side,x=side*11.8,z=s.z,front=side*7.55,angle=-side*Math.PI/2;
    const height=6.2+(i%3)*.6;
    box([8.2,height,10],[x,height/2,z],i%2?0xb7b4a3:0xc0b29a,[0,0,0],'wall');
    box([.25,2.7,10.15],[side*7.65,1.4,z],s.color,[0,0,0],'wood');
    box([4.7,.22,11],[x-side*2,height+.6,z],0x748083,[0,0,side*.24],'roof');
    box([4.7,.22,11],[x+side*2,height+.6,z],0x748083,[0,0,-side*.24],'roof');
    beam([x,height+1.18,z-5.6],[x,height+1.18,z+5.6],.13,0x4a565b);
    label(s.jp,s.title.toUpperCase(),[front-side*.06,3.55,z-.4],6.8,1.22,angle,'#e8dfc7',s.accent,true);
    for(const dz of [-3,-.2,2.6]){
      box([.07,1.45,1.7],[front-side*.1,5.12,z+dz],0x425c60);
      shopGlass.push(glassPanel(front-side*.145,5.12,z+dz,1.62,1.34,angle));
      for(const offset of [-.88,0,.88])box([.18,1.7,.075],[front-side*.19,5.12,z+dz+offset],0x675d4b);
      for(const y of [4.33,5.9])box([.18,.08,1.85],[front-side*.19,y,z+dz],0x675d4b);
      box([1,.09,2],[front-side*.38,4.24,z+dz],0x68685c);
    }
    box([.1,1.75,3.5],[front-side*.18,1.45,z-1.8],0x294c53);
    shopGlass.push(glassPanel(front-side*.245,1.47,z-1.8,3.25,1.58,angle));
    for(const dz of [-3.5,-1.8,-.1])box([.18,2,.06],[front-side*.28,1.5,z+dz],0x745b42);
    for(let j=0;j<6;j++)box([.09,.12,.34],[front-side*.25,.77+(j%2)*.3,z-3.2+j*.48],[0xcabb8a,0x9d6652,0x6e877b][j%3]);
    box([1.55,.09,5.2],[front-side*.55,2.9,z-1.6],s.color,[0,0,-side*.13]);
    for(let n=0;n<7;n++)box([.06,.35,.36],[front-side*1.28,2.72,z-3.86+n*.7],0xe5d8b3);
    box([.18,2.55,1.5],[front-side*.14,1.35,z+2.55],0x3b4440);
    box([.12,2.35,1.22],[front-side*.26,1.3,z+2.55],0x8b7050,[0,0,0],'wood');
    for(let n=0;n<3;n++)box([.08,.65,.39],[front-side*.38,2.27,z+2.08+n*.47],s.color);
    label('営業中','OPEN',[front-side*.44,1.65,z+2.5],.65,.38,angle);
    anchor([side*6.8,1.2,z+2.5],`Enter ${s.title}`,()=>enter(s));
    box([.65,.18,1.8],[side*7.05,.18,z+2.5],0xbab6a9);
    box([.65,.65,1.1],[front-side*.32,4.05,z+4.2],0xafa99a);
    for(let y=3.8;y<4.3;y+=.1)box([.02,.025,.85],[front-side*.66,y,z+4.2],0x616962);
    cyl(.045,height,[front-side*.22,height/2,z-4.8],0x5b6464);
    cyl(.28,.46,[side*6.75,.25,z-4.25],0x98705a);
    shape('sphere',[.4,9,7],[side*6.75,.78,z-4.25],0x627857);
    obstacle(side*6.75,z-4.25,.65,.65);
    box([8,7+i%4,12],[side*22,(7+i%4)/2,z+4],0x848d87,[0,0,0],'wall');
    for(let n=0;n<3;n++)box([.08,1.5,1.4],[side*17.95,5.5,z+n*3],0x486168);
  });

  for(const side of [-1,1])for(let z=-48;z<=48;z+=16){
    cyl(.13,8,[side*6.7,4,z],0x5f554b);obstacle(side*6.7,z,.38,.38);box([2.4,.14,.18],[side*6.7,7.3,z],0x51584f);
    for(const dx of [-.8,0,.8]){cyl(.08,.26,[side*6.7+dx,7.52,z],0xd5d7cc);if(z<48){const points=[];for(let k=0;k<=8;k++)points.push(new THREE.Vector3(side*6.7+dx,7.58-Math.sin(k/8*Math.PI)*.75,z+k*2));const g=new THREE.BufferGeometry().setFromPoints(points);group.add(new THREE.Line(g,new THREE.LineBasicMaterial({color:0x29373b})));}}
    beam([side*6.7,5.7,z],[side*5.6,5.7,z],.06);box([.6,.12,.26],[side*5.5,5.65,z],0xe5c590);
    if(shadows&&z%32===16){const light=new THREE.PointLight(0xffc17b,0,10,2);light.position.set(side*5.5,4.8,z);group.add(light);lampLights.push(light);}
  }
  for(const x of [-7,7])cyl(.17,6.8,[x,3.4,48],0x466a6b);
  beam([-7,6.4,48],[7,6.4,48],.11,0x466a6b);
  label('ヨハンソン商店街','JOHANSSON TOWN · 1988',[0,6.3,48],7.2,1.15,0,'#ddd9b9','#355b60');

  box([1.3,2.25,1],[5.95,1.13,38],0x9d3e32);box([1.1,1.18,.08],[5.95,1.55,38.54],0xe9dac0);
  for(let row=0;row<3;row++)for(let col=0;col<5;col++)cyl(.055,.22,[5.53+col*.21,1.18+row*.3,38.62],[0xc98a40,0x476f73,0xb6543b][col%3]);
  box([.6,.18,.1],[5.95,.42,38.56],0x252e31);label('飲料','¥120',[5.95,2.12,38.57],1.05,.26);obstacle(5.95,38,1.3,1);anchor([5.95,1,39],'Buy a drink',()=>onAction('vending'));
  box([1.1,2.5,1],[-5.9,1.25,31],0x457e73);box([.91,1.6,.91],[-5.9,1.55,31],0x648c87);box([.35,.65,.28],[-5.9,1.4,31.53],0x3d9c6c);label('電話','TELEPHONE',[-5.9,2.4,31.55],1,.28);anchor([-5.9,1,32],'Use payphone',()=>onAction('phone'));obstacle(-5.9,31,1.1,1);
  cyl(.05,2.8,[-5.9,1.4,44],0x64756d);label('バス停','HARBOUR LINE',[-5.9,2.6,44],1.1,.75);anchor([-5.8,1,44],'Read bus timetable',()=>onAction('bus'));obstacle(-5.9,44,.26,.26);
  box([1,1.8,1.1],[5.9,.9,20],0x483d50);box([.88,.7,.12],[5.9,1.4,20.57],0x294d59);label('STAR PORT','INSERT ¥100',[5.9,1.48,20.65],.77,.5,0,'#142d42','#83ded8',true);obstacle(5.9,20,1,1.1);anchor([5.9,1,21],'Play Star Port',()=>onAction('arcade'));
  box([1.8,2.9,4],[-6.5,1.45,-15],0x61584c,[0,0,0],'wood');box([2.4,.16,4.6],[-6.3,3,-15],0xa8523b);label('中華そば','RAMEN · ¥300',[-5.53,2.4,-15],3.4,.66,Math.PI/2,'#a44131','#f5e8c9',true);box([1.1,1,3.8],[-5.3,.5,-15],0x88704c);for(let z=-16;z<=-14;z++)cyl(.26,.58,[-4.2,.29,z],0x915845);lantern(-4.9,-17);lantern(-4.9,-13);obstacle(-5.5,-15,2.5,4);anchor([-3.9,1,-15],'Order ramen',()=>onAction('ramen'));
  for(const [x,z] of [[-6,6],[6,-6],[-6,-35]]){for(const dz of [-.62,.62]){const tire=new THREE.Mesh(new THREE.TorusGeometry(.36,.035,6,20),material(0x333b3d));tire.rotation.y=Math.PI/2;tire.position.set(x,.4,z+dz);tire.castShadow=shadows;group.add(tire);}beam([x,.4,z-.62],[x,.9,z],.035,0x71999a);beam([x,.9,z],[x,.4,z+.62],.035,0x71999a);beam([x,.4,z-.62],[x,.4,z+.35],.035,0x71999a);beam([x,.4,z+.62],[x,1.14,z+.55],.03);beam([x-.24,1.14,z+.55],[x+.24,1.14,z+.55],.03);box([.24,.07,.32],[x,1,z-.1],0x463d32);obstacle(x,z,.65,1.55);}

  box([38,.35,12],[0,-.08,-58],0xa5a699,[0,0,0],'wall');
  const sea=new THREE.Mesh(new THREE.PlaneGeometry(160,85,42,28),new THREE.MeshPhysicalMaterial({color:0x456f78,roughness:.18,metalness:.18,clearcoat:.18,clearcoatRoughness:.12}));sea.rotation.x=-Math.PI/2;sea.position.set(0,-.48,-106);group.add(sea);water.push(sea);
  for(let x=-17;x<=17;x+=2.5){cyl(.06,1,[x,.55,-63],0x526468);if(x<16)beam([x,1,-63],[x+2.5,1,-63],.045,0x526468);}
  label('港町','HARBOUR · FISHING PIER',[0,2.4,-58],3.5,.7);anchor([0,1,-61],'Cast a fishing line',()=>onAction('fishing'));
  for(const x of [-12,-8,8,12]){box([1.8,.14,.6],[x,.6,-59],0x927c56,[0,0,0],'wood');for(const dx of [-.65,.65])box([.12,.6,.4],[x+dx,.3,-59],0x4a5858);obstacle(x,-59,1.9,.7);}
  const boat=new THREE.Group();boat.position.set(9,0,-70);group.add(boat);const hull=new THREE.Mesh(new THREE.BoxGeometry(3.2,.9,6.5),material(0x334e5c));boat.add(hull);const cabin=new THREE.Mesh(new THREE.BoxGeometry(2.3,1.7,2.3),material(0xd9d2bb));cabin.position.set(0,1,0);boat.add(cabin);const glass=new THREE.Mesh(new THREE.BoxGeometry(2.34,.65,2.35),new THREE.MeshPhysicalMaterial({color:0x426b77,roughness:.16,metalness:.08,clearcoat:.4}));glass.position.y=1.5;boat.add(glass);
  box([65,2,4],[0,.2,-97],0x7a8987);for(const x of [-26,26]){cyl(1,7,[x,3.5,-97],0xcbc9b6);box([2.3,.7,2.3],[x,7,-97],0x984e42);}
  for(const x of [-3,3]){cyl(.16,4,[x,2,55],0xa34531);obstacle(x,55,.38,.38);}box([7.3,.24,.36],[0,4.1,55],0x973f30);box([6.7,.18,.32],[0,3.45,55],0x973f30);box([3,2.6,2],[0,1.3,60],0x8b7050,[0,0,0],'wood');box([3.8,.22,2.8],[0,2.8,60],0x4e6061);anchor([0,1,57.8],'Visit the shrine',()=>onAction('shrine'));

  const residents=[['Aiko',-4,34,0x9b5347],['Kenji',4,13,0x51717d],['Mrs Sato',-3,-23,0x766484],['Harbour master',3,-54,0x465965]];
  residents.forEach(([name,x,z,color],index)=>{const g=new THREE.Group();g.position.set(x,0,z);g.userData.name=name;group.add(g);function part(geo,p,col){const m=new THREE.Mesh(geo,material(col));m.position.set(...p);g.add(m);return m;}part(new THREE.CylinderGeometry(.25,.21,.66,8),[0,1.17,0],color);part(new THREE.SphereGeometry(.22,10,8),[0,1.73,0],0xc79571);const legs=[-.14,.14].map(dx=>part(new THREE.BoxGeometry(.17,.65,.2),[dx,.53,0],0x354349));const arms=[-.33,.33].map(dx=>part(new THREE.BoxGeometry(.14,.55,.17),[dx,1.1,0],color));register(g,`Talk to ${name}`,()=>onAction('resident',name));people.push({g,legs,arms,x,z,index});});
  const cat=new THREE.Group();cat.position.set(-5,0,-25);group.add(cat);const cb=new THREE.Mesh(new THREE.BoxGeometry(.3,.3,.65),material(0xd0a471));cb.position.y=.28;cat.add(cb);const ch=new THREE.Mesh(new THREE.SphereGeometry(.2,10,8),material(0xd0a471));ch.position.set(0,.49,-.3);cat.add(ch);for(const x of [-.11,.11]){const ear=new THREE.Mesh(new THREE.ConeGeometry(.085,.18,3),material(0xd0a471));ear.position.set(x,.67,-.3);cat.add(ear);}register(cat,'Greet the cat',()=>onAction('cat'));

  for(const {geo,mat,matrices} of batches.values()){const m=new THREE.InstancedMesh(geo,mat,matrices.length);matrices.forEach((matrix,i)=>m.setMatrixAt(i,matrix));m.castShadow=shadows;m.receiveShadow=shadows;group.add(m);}
  let wet=false;const rainCount=mobile?260:600,positions=new Float32Array(rainCount*3);for(let i=0;i<rainCount;i++){positions[i*3]=(Math.random()-.5)*32;positions[i*3+1]=Math.random()*16;positions[i*3+2]=(Math.random()-.5)*120;}const rainGeo=new THREE.BufferGeometry();rainGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));const rain=new THREE.Points(rainGeo,new THREE.PointsMaterial({color:0xc7e0df,size:.052,transparent:true,opacity:.62,depthWrite:false}));rain.visible=false;group.add(rain);

  return {group,colliders,people,setRain(value){wet=value;rain.visible=value;wetMeshes.forEach(m=>m.visible=value);material(0xcccccc,'road').roughness=value?.24:.82;},update(dt,time,day){
    boat.rotation.z=Math.sin(time*.7)*.025;boat.position.y=Math.sin(time*.9)*.07;sea.position.y=-.48+Math.sin(time*.4)*.025;
    for(const m of lamps){m.emissive.set(0xf6ad60);m.emissiveIntensity=.12+(1-day)*.9;}
    lampLights.forEach((l,i)=>l.intensity=(1-day)*(i<2?1.1:.7));
    shopGlass.forEach(m=>{m.material.emissiveIntensity=.035+(1-day)*.35;m.material.roughness=wet?.16:.22;});
    wetMeshes.forEach((m,i)=>{if(wet)m.material.opacity=.31+Math.sin(time*.7+i)*.05;});
    const playerPos=getPlayerPosition?.(),now=performance.now();people.forEach(p=>{let desiredZ=p.z+Math.sin(time*.11+p.index)*2.2;if(playerPos){const dx=p.g.position.x-playerPos.x,dz=desiredZ-playerPos.z;if(dx*dx+dz*dz<.72*.72)desiredZ=p.g.position.z;}p.g.position.z=THREE.MathUtils.damp(p.g.position.z,desiredZ,7,dt);if(p.g.userData.facePlayerUntil>now&&playerPos){p.g.lookAt(playerPos.x,p.g.position.y,playerPos.z);p.g.rotateY(Math.PI);}else p.g.rotation.y=Math.cos(time*.11+p.index)>0?Math.PI:0;p.legs.forEach((l,i)=>l.rotation.x=Math.sin(time*3+i*Math.PI)*.22);p.arms.forEach((l,i)=>l.rotation.x=-Math.sin(time*3+i*Math.PI)*.16);});
    cat.rotation.y=Math.sin(time*.3)*.2;if(wet){for(let i=0;i<rainCount;i++){positions[i*3+1]-=dt*12;if(positions[i*3+1]<0)positions[i*3+1]=16;}rainGeo.attributes.position.needsUpdate=true;}
  }};
}
