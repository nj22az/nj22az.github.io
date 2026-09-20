// Three.js aliases come from the preserved runtime: ur Group, q Mesh,
// Ha BoxGeometry, co MeshLambertMaterial, da InstancedMesh, lr Object3D.
function Yp(maze) {
  const group = new ur();
  group.name = 'Sakura stockroom';
  const textures = [], batches = new Map();
  const boxGeometry = new Ha(1, 1, 1), matrix = new lr();
  const materials = {
    wall: new co({color:0xd7d5ca}), steel: new co({color:0x506467}),
    shelf: new co({color:0xb1b8ad}), wood: new co({color:0x9b7952}),
    tape: new co({color:0xe4ba48}), dark: new co({color:0x374244}),
    lamp: new co({color:0xfbf0d3,emissive:0xfbf0d3,emissiveIntensity:0.6}),
  };
  const productMaps = Ap();
  for (const def of ad) materials[def.id] = new co({map:productMaps.get(def.id)});
  function box(material,x,y,z,w,h,d,rotation=0) {
    if (!batches.has(material)) batches.set(material,[]);
    batches.get(material).push([x,y,z,w,h,d,rotation]);
  }
  const floorTexture = Np((ctx,size) => {
    ctx.fillStyle = '#969a92'; ctx.fillRect(0,0,size,size);
    const random = ud(90);
    for(let i=0;i<900;i++) {
      ctx.fillStyle = i%2 ? 'rgba(255,255,255,.035)' : 'rgba(0,0,0,.04)';
      ctx.fillRect(random()*size,random()*size,2+random()*5,2);
    }
    ctx.strokeStyle = '#7f867f';ctx.lineWidth=2;ctx.strokeRect(1,1,size-2,size-2);
  },256);
  floorTexture.repeat.set(maze.cols/2,maze.rows/2);textures.push(floorTexture);
  const floor = new q(new qa(maze.cols*sd,maze.rows*sd),new co({map:floorTexture}));
  floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;group.add(floor);
  for(let r=0;r<maze.rows;r++) for(let c=0;c<maze.cols;c++) {
    if(maze.cells[r*maze.cols+c]!==1) continue;
    const p=gd(c,r,maze);box('wall',p.x,cd/2,p.z,sd,cd,sd);
    box('dark',p.x,0.18,p.z,sd+0.01,0.36,sd+0.01);
  }
  const random=ud(maze.seed^711);
  for(const bank of maze.shelves) {
    const centre=gd(bank.c+(bank.w-1)/2,bank.r+(bank.h-1)/2,maze);
    const width=bank.w*sd, depth=bank.h*sd;
    // Collision and visible rack extents agree, including the bottom plinth.
    box('dark',centre.x,0.08,centre.z,width,0.16,depth);
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
        box(def.id,x,0.45+level*0.62,z,vertical?0.58:1.15,0.4,vertical?1.15:0.58);
      }
    }
    const signTexture=Sp(od[bank.zone].label,od[bank.zone].color);textures.push(signTexture);
    const sign=Wp(od[bank.zone].label,od[bank.zone].color,signTexture);
    sign.position.set(centre.x,2.3,centre.z-depth/2-0.025);sign.rotation.y=Math.PI;group.add(sign);
  }
  // Continuous clear transport lanes, rather than a hazard border on every tile.
  for(const c of [8.8,11.2]) {
    const p=gd(c,12,maze);box('tape',p.x,0.009,p.z,0.045,0.012,14*sd);
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
  group.add(new Jo(0xfff4df,0x65746a,1.7),new ms(0xffffff,0.55));
  const key=new ps(0xffedca,1.15);key.position.set(-6,14,8);group.add(key);
  const fill=new ps(0xb4d5db,0.45);fill.position.set(8,9,-6);group.add(fill);
  const motes=new da(new qa(0.035,0.045),new Oi({color:0xd3c7ab,transparent:true,opacity:0.12,depthWrite:false}),28);group.add(motes);
  return {group,items,exit:{...exitPosition,mesh:curtain},lanterns,motes,dispose(){
    const geometries=new Set(),mats=new Set();
    group.traverse(node=>{if(node instanceof q){geometries.add(node.geometry);for(const material of Array.isArray(node.material)?node.material:[node.material])mats.add(material);}});
    geometries.forEach(value=>value.dispose());mats.forEach(value=>value.dispose());textures.forEach(value=>value.dispose());
  }};
}
