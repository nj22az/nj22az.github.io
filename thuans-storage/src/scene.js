// Three.js aliases come from the preserved runtime: ur Group, q Mesh,
// Ha BoxGeometry, co MeshLambertMaterial, da InstancedMesh, lr Object3D.
function Yp(maze) {
  const group = new ur();
  group.name = 'Sakura stockroom';
  function createHarbourGuestMesh(guest) {
    const root = new ur();
    root.name = 'harbour-guest-' + (guest.id || 'friend');
    const skin = new co({color:0xf0c9b0});
    const coat = new co({color:guest.accent || 0xc45c78});
    const hair = new co({color:0x3a2f2a});
    const body = new q(new Ha(0.42, 0.78, 0.28), coat);
    body.position.y = 0.95; root.add(body);
    const head = new q(new Ha(0.28, 0.28, 0.28), skin);
    head.position.y = 1.48; root.add(head);
    const bangs = new q(new Ha(0.3, 0.1, 0.3), hair);
    bangs.position.y = 1.62; root.add(bangs);
    const legs = new q(new Ha(0.36, 0.55, 0.24), new co({color:0x4a5556}));
    legs.position.y = 0.35; root.add(legs);
    const pin = new q(new Ha(0.06, 0.06, 0.04), new co({color:0xf3d0d8}));
    pin.position.set(0.16, 1.1, 0.16); root.add(pin);
    return { mesh: root };
  }

  const textures = [], batches = new Map();
  const boxGeometry = new Ha(1, 1, 1), matrix = new lr();
  const materials = {
    wall: new co({color:0xe9e2d4}), steel: new co({color:0x5a7074}),
    shelf: new co({color:0xc4c9bc}), wood: new co({color:0xa9845c}),
    tape: new co({color:0xe8c86a,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),
    dark: new co({color:0x4a5556}),
    lamp: new co({color:0xfff3dc,emissive:0xfff0d2,emissiveIntensity:0.72}),
    // Decals/end-caps/posters: bias depth so they do not z-fight coplanar hosts.
    sakura: new co({color:0xf3d0d8,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),
    cream: new co({color:0xf7f1e6,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),
  };
  const productMaps = Ap();
  for (const def of ad) materials[def.id] = new co({map:productMaps.get(def.id)});
  function box(material,x,y,z,w,h,d,rotation=0) {
    if (!batches.has(material)) batches.set(material,[]);
    batches.get(material).push([x,y,z,w,h,d,rotation]);
  }
  const floorTexture = Np((ctx,size) => {
    ctx.fillStyle = '#a8a899'; ctx.fillRect(0,0,size,size);
    const random = ud(90);
    for(let i=0;i<900;i++) {
      ctx.fillStyle = i%2 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.04)';
      ctx.fillRect(random()*size,random()*size,2+random()*5,2);
    }
    ctx.strokeStyle = '#8e9488';ctx.lineWidth=2;ctx.strokeRect(1,1,size-2,size-2);
  },256);
  floorTexture.repeat.set(maze.cols/2,maze.rows/2);textures.push(floorTexture);
  const floor = new q(new qa(maze.cols*sd,maze.rows*sd),new co({map:floorTexture}));
  floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;group.add(floor);
  for(let r=0;r<maze.rows;r++) for(let c=0;c<maze.cols;c++) {
    if(maze.cells[r*maze.cols+c]!==1) continue;
    const p=gd(c,r,maze);box('wall',p.x,cd/2,p.z,sd,cd,sd);
    box('dark',p.x,0.19,p.z,sd+0.01,0.34,sd+0.01);
  }
  const random=ud(maze.seed^711);
  for(const bank of maze.shelves) {
    const centre=gd(bank.c+(bank.w-1)/2,bank.r+(bank.h-1)/2,maze);
    const width=bank.w*sd, depth=bank.h*sd;
    // Collision and visible rack extents agree, including the bottom plinth.
    box('dark',centre.x,0.09,centre.z,width,0.14,depth);
    for(const sx of [-1,1]) for(const sz of [-1,1]) {
      box('steel',centre.x+sx*(width/2-0.045),1.05,centre.z+sz*(depth/2-0.045),0.09,2.1,0.09);
    }
    for(const height of [0.22,0.84,1.46,2.08]) box('shelf',centre.x,height,centre.z,width,0.06,depth);
    const goods=Jp(bank.zone);
    for(let r=bank.r;r<bank.r+bank.h;r++) for(let c=bank.c;c<bank.c+bank.w;c++) {
      const cell=gd(c,r,maze);
      for(let level=0;level<3;level++) for(let side=0;side<2;side++) {
        if(random()<0.13) continue;
        const def=goods[(c+r+level+side)%goods.length];
        const vertical=bank.h>bank.w;
        const x=cell.x+(vertical?(side?0.39:-0.39):0);
        const z=cell.z+(vertical?0:(side?0.39:-0.39));
        box(def.id,x,0.46+level*0.62,z,vertical?0.58:1.15,0.4,vertical?1.15:0.58);
      }
    }
    const signTexture=Sp(od[bank.zone].label,od[bank.zone].color);textures.push(signTexture);
    const sign=Wp(od[bank.zone].label,od[bank.zone].color,signTexture);
    sign.position.set(centre.x,2.3,centre.z-depth/2-0.07);sign.rotation.y=Math.PI;group.add(sign);
    // Warm cream + sakura end-cap plaques — offset off the rack so faces are not coplanar.
    box('cream',centre.x-width/2-0.045,1.15,centre.z,0.035,0.55,Math.min(depth,0.9));
    box('sakura',centre.x+width/2+0.045,1.15,centre.z,0.035,0.55,Math.min(depth,0.9));
  }
  // Soft wall posters — cream cards with sakura trim, never horror.
  // Sit on the aisle face of the wall (not coplanar with the wall volume).
  const posterSpots=[[2,4],[18,4],[2,16],[18,16],[10,1]];
  for(const [c,r] of posterSpots){
    if(maze.cells[r*maze.cols+c]!==1) continue;
    const p=gd(c,r,maze);
    let ix=0,iz=0;
    for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){
      const nc=c+dc,nr=r+dr;
      if(nc<0||nr<0||nc>=maze.cols||nr>=maze.rows) continue;
      if(maze.cells[nr*maze.cols+nc]===0){ix=dc;iz=dr;break;}
    }
    const face=sd/2+0.03;
    box('cream',p.x+ix*face,1.55,p.z+iz*face,ix?0.04:0.55,0.7,iz?0.04:0.55);
    box('sakura',p.x+ix*(face+0.025),1.55,p.z+iz*(face+0.025),ix?0.02:0.48,0.62,iz?0.02:0.48);
  }
  // Continuous clear transport lanes, rather than a hazard border on every tile.
  for(const c of [8.8,11.2]) {
    const p=gd(c,12,maze);box('tape',p.x,0.014,p.z,0.045,0.01,14*sd);
  }
  const receiving=maze.rooms[0],dispatch=maze.rooms[1];
  for(const room of [receiving,dispatch]) {
    const p=gd(room.c+(room.w-1)/2,room.r-0.4,maze);
    const texture=Sp(room.name,room.color);textures.push(texture);
    const sign=Wp(room.name,room.color,texture);sign.position.set(p.x,2.25,p.z);group.add(sign);
  }
  // Stacked deliveries stay against the loading wall, clear of the spawn.
  for(let i=0;i<3;i++) {
    const p=gd(2+i*2,1,maze);
    box('wood',p.x,0.1,p.z,sd,0.2,sd);
    box(ad[i].id,p.x,0.49,p.z,1.05,0.58,0.9);
    if(i!==1)box(ad[i].id,p.x,1.06,p.z,0.93,0.56,0.84);
  }
  const shutter=gd(9.7,0.52,maze);
  box('steel',shutter.x,1.2,shutter.z,2.6,2.4,0.08);
  for(let i=0;i<12;i++)box('shelf',shutter.x,0.15+i*0.19,shutter.z+0.05,2.6,0.025,0.03);
  const lanterns=[];
  for(const r of [4,10,17]) for(const c of [4,10,16]) {
    const p=gd(c,r,maze);
    box('dark',p.x,cd-0.1,p.z,1.35,0.08,0.25);
    box('lamp',p.x,cd-0.15,p.z,1.22,0.04,0.17);
  }
  const items=maze.items.map(item=>{
    const p=gd(item.c,item.r,maze),mesh=up(item.def,item.needed);
    // The marked picking cartons are stationary and close to their stock bank.
    const direction=[[1,0],[-1,0],[0,1],[0,-1]].find(([dc,dr])=>maze.cells[(item.r+dr)*maze.cols+item.c+dc]===2)??[0,0];
    const x=p.x+direction[0]*0.42,z=p.z+direction[1]*0.42;
    const carton = new q(boxGeometry,materials.wood);
    carton.scale.set(0.45/1.6,0.48/1.6,0.45/1.6);carton.position.y=-0.26/1.6;mesh.add(carton);
    const labelTex=Sp(item.def.short||item.def.name,item.def.accent||0xf3d0d8);textures.push(labelTex);
    const label=Wp(item.def.short||item.def.name,item.def.accent||0xf3d0d8,labelTex);
    label.scale.set(0.55,0.55,0.55);label.position.set(0,0.08,0.36);mesh.add(label);
    label.traverse(node=>{
      const mats=node.material?(Array.isArray(node.material)?node.material:[node.material]):[];
      for(const mat of mats){
        mat.polygonOffset=true;mat.polygonOffsetFactor=-2;mat.polygonOffsetUnits=-2;
        if(mat.transparent)mat.depthWrite=false;
      }
    });
    mesh.position.set(x,0.5,z);mesh.scale.setScalar(1.6);group.add(mesh);
    return {...item,mesh,taken:false,name:item.def.name,x,z};
  });
  const exitPosition=gd(maze.exit.c,maze.exit.r,maze),curtain=Gp();
  curtain.position.set(exitPosition.x,0,exitPosition.z);group.add(curtain);
  for(const [name,instances] of batches) {
    const mesh=new da(boxGeometry,materials[name],instances.length);
    instances.forEach(([x,y,z,w,h,d,rotation],index)=>{
      matrix.position.set(x,y,z);matrix.scale.set(w,h,d);matrix.rotation.set(0,rotation,0);matrix.updateMatrix();mesh.setMatrixAt(index,matrix.matrix);
    });
    mesh.instanceMatrix.needsUpdate=true;group.add(mesh);
  }
  group.add(new Jo(0xfff6e8,0x7a8476,1.85),new ms(0xfff8ef,0.48));
  const key=new ps(0xffefd4,1.05);key.position.set(-6,14,8);group.add(key);
  const fill=new ps(0xf0d8dc,0.42);fill.position.set(8,9,-6);group.add(fill);
  const soft=new ps(0xfff5e6,0.28);soft.position.set(0,6,0);group.add(soft);
  const motes=new da(new qa(0.035,0.045),new Oi({color:0xe8dcc4,transparent:true,opacity:0.14,depthWrite:false}),28);group.add(motes);
  let guest=null;
  if(maze.guest){
    const gp=gd(maze.guest.c,maze.guest.r,maze);
    guest=createHarbourGuestMesh(maze.guest);
    guest.mesh.position.set(gp.x,0,gp.z);
    group.add(guest.mesh);
    guest={...maze.guest,x:gp.x,z:gp.z,mesh:guest.mesh};
  }
  return {group,items,exit:{...exitPosition,mesh:curtain},guest,lanterns,motes,dispose(){
    const geometries=new Set(),mats=new Set();
    group.traverse(node=>{if(node instanceof q){geometries.add(node.geometry);for(const material of Array.isArray(node.material)?node.material:[node.material])mats.add(material);}});
    geometries.forEach(value=>value.dispose());mats.forEach(value=>value.dispose());textures.forEach(value=>value.dispose());
  }};
}
