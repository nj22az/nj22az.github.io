// Three.js aliases come from the preserved runtime: ur Group, q Mesh,
// Ha BoxGeometry, co MeshLambertMaterial, da InstancedMesh, lr Object3D.
// Also: Ya SphereGeometry, Ka ConeGeometry, Ga CylinderGeometry, Ua CapsuleGeometry,
// Oi MeshBasicMaterial, us PointLight.

/**
 * The night's boss, in their suit: a townsperson's own face looking out from under the
 * animal's hood, a suit in its colours, and joints game.js moves to make it behave like the
 * animal -- legs on hip pivots (a donkey kicks), arms on shoulder pivots (a gorilla beats its
 * chest and walks on its knuckles), and a ring of stars for when it is worn out. The same
 * suits as the sea cave (johansson-town/src/dungeon/costumes.js).
 */
function createBizarroBoss(look) {
  const root = new ur(); root.name = 'Bizarro ' + look.who + ' the ' + look.animal;
  const suit = new ur(); root.add(suit);
  const mats = new Map(), mat = c => { if (!mats.has(c)) mats.set(c, new co({color:c})); return mats.get(c); };
  const fur = mat(look.colour), pale = mat(look.belly), skin = mat(0xe6bc98), black = mat(0x181416), white = mat(0xf7f5ef);
  const add = (geometry, material, x, y, z, parent = suit) => { const m = new q(geometry, material); m.position.set(x, y, z); parent.add(m); return m; };
  // A gorilla is all shoulders and arms; the rest stand like people in suits.
  const ape = look.animal === 'gorilla', chest = ape ? 1.3 : 1, reach = ape ? 1.55 : 1;
  const legs = [-1, 1].map(sx => { const hip = new ur(); hip.position.set(sx * .12, .5, 0); suit.add(hip); add(new Ha(.17, .5, .2), fur, 0, -.25, 0, hip); return hip; });
  add(new Ua(.27, .5, 4, 10), fur, 0, .88, 0).scale.set(chest, 1, ape ? 1.15 : 1);
  add(new Ya(.2, 16, 12), pale, 0, .86, .2 * (ape ? 1.15 : 1)).scale.set(.85, 1.2, .45);
  const arms = [-1, 1].map(sx => { const pivot = new ur(); pivot.position.set(sx * .34 * chest, 1.15, 0); suit.add(pivot); add(new Ua(.075 * (ape ? 1.4 : 1), .38 * reach, 3, 8), fur, 0, -.25 * reach, 0, pivot); add(new Ya(.08 * (ape ? 1.5 : 1), 8, 6), pale, 0, -.5 * reach, 0, pivot); return pivot; });
  const head = new ur(); head.position.y = 1.5; suit.add(head);
  const R = .21;
  add(new Ya(R, 14, 10), skin, 0, 0, 0, head);
  for (const sx of [-1, 1]) add(new Ya(.025, 6, 4), black, sx * .075, .02, R * .92, head);
  // The hood: over the crown and down the back, open at the face.
  const hood = add(new Ya(R * 1.18, 16, 10, 0, Math.PI * 2, 0, Math.PI * .5), fur, 0, .02, -.02, head); hood.scale.set(1, 1.05, 1.05);
  add(new Ya(R * 1.15, 14, 8), fur, 0, -.03, -.06, head).scale.set(1, 1, .75);
  const cone = (r, h, m, x, y, z, rx = 0, rz = 0, seg = 8) => { const c = add(new Ka(r, h, seg), m, x, y, z, head); c.rotation.set(rx, 0, rz); return c; };
  const ball = (r, m, x, y, z) => add(new Ya(r, 10, 8), m, x, y, z, head);
  switch (look.animal) {
    case 'crocodile':
      add(new Ha(.2, .07, .34), fur, 0, .2, .3, head); add(new Ha(.18, .025, .3), pale, 0, .16, .31, head);
      for (let i = 0; i < 5; i++) for (const sx of [-1, 1]) cone(.012, .035, white, sx * .085, .13, .2 + i * .055, Math.PI);
      for (const sx of [-1, 1]) { ball(.06, fur, sx * .08, .26, .12); ball(.035, mat(0xe8d24a), sx * .08, .29, .15); }
      break;
    case 'donkey':
      ball(.1, pale, 0, .1, .22).scale.set(1, .8, 1.2);
      for (const sx of [-1, 1]) { const ear = cone(.05, .36, fur, sx * .12, .38, -.02, 0, sx * -.3); ear.scale.z = .55; cone(.028, .26, mat(0xd4707e), sx * .118, .37, .0, 0, sx * -.3).scale.z = .4; }
      break;
    case 'tanuki':
      for (const sx of [-1, 1]) ball(.055, black, sx * .14, .22, -.01);
      break;
    case 'octopus':
      ball(.28, fur, 0, .2, -.05).scale.set(1, 1.25, 1.05);
      for (const sx of [-1, 1]) { ball(.05, white, sx * .1, .18, .24); ball(.025, black, sx * .1, .18, .28); }
      for (let i = 0; i < 8; i++) { const a = Math.PI * .35 + i * (Math.PI * 1.3 / 7), arm = add(new Ga(.03, .012, .34, 6), fur, Math.cos(a) * .24, -.22, -Math.sin(a) * .2 - .02, head); arm.rotation.set(Math.sin(a) * .35, 0, Math.cos(a) * -.35); }
      break;
    case 'seagull':
      cone(.045, .17, mat(0xe8b53a), 0, .04, .27, Math.PI / 2); ball(.02, mat(0xd9483a), 0, .01, .32);
      break;
    case 'shark':
      { const fin = add(new Ka(.09, .24, 3), fur, 0, .3, -.02, head); fin.scale.z = .3; }
      add(new Ha(.22, .03, .1), pale, 0, .1, .22, head);
      for (let i = 0; i < 6; i++) cone(.012, .035, white, -.08 + i * .032, .08, .27, Math.PI);
      break;
    case 'owl':
      for (const sx of [-1, 1]) { cone(.035, .12, fur, sx * .12, .28, 0, 0, sx * -.35, 5); ball(.06, pale, sx * .07, .14, .19); ball(.035, mat(0xe8a22a), sx * .07, .14, .23); }
      cone(.025, .07, mat(0xd9902a), 0, .07, .23, Math.PI * .6, 0, 6);
      break;
    case 'fox':
      cone(.06, .18, pale, 0, .07, .27, Math.PI / 2).scale.set(1, 1, .7); ball(.02, black, 0, .07, .36);
      for (const sx of [-1, 1]) cone(.055, .16, fur, sx * .11, .29, 0, 0, sx * -.3, 4);
      break;
    case 'bear':
      ball(.075, pale, 0, .06, .21).scale.set(1.1, .8, .9);
      for (const sx of [-1, 1]) ball(.06, fur, sx * .15, .23, -.01);
      break;
    case 'gorilla':
      // A heavy brow, a grey leathery muzzle, small ears and a crest.
      add(new Ha(.3, .06, .1), fur, 0, .2, .17, head).rotation.x = -.2;
      ball(.09, pale, 0, .08, .21).scale.set(1.25, .75, .7);
      for (const sx of [-1, 1]) { ball(.015, black, sx * .035, .1, .27); ball(.04, pale, sx * .2, .13, 0); }
      ball(.13, fur, 0, .27, -.05).scale.set(.85, .7, 1.1);
      break;
  }
  // Worn out: stars round the head, the moment to shoo.
  const stars = new ur(); stars.position.y = 1.95; stars.visible = false; suit.add(stars);
  const gold = new Oi({color:0xffd75a});
  for (let i = 0; i < 5; i++) { const star = new q(new Ka(.05, .1, 5), gold), a = i / 5 * Math.PI * 2; star.position.set(Math.cos(a) * .32, 0, Math.sin(a) * .32); stars.add(star); }
  root.traverse(node => { if (node instanceof q) node.castShadow = true; });
  return { group: root, suit, arms, legs, head, stars };
}

/** The hole down to the sea cave: a cracked opening low in the back wall, a pit in the floor, a violet glow. */
const BOSS_SIZE = 1.25;
function createSeaCaveHole(maze) {
  const group = new ur(); group.name = 'Hole down to the old sea cave';
  // Built as if the wall were to the south (+z), then turned to whichever wall it is in.
  const p = gd(maze.hole.c, maze.hole.r, maze), [wc, wr] = maze.hole.wall || [0, 1];
  const frame = new ur(); frame.position.set(p.x, 0, p.z); frame.rotation.y = Math.atan2(wc, wr); group.add(frame);
  const wallZ = sd / 2 - .01;
  const dark = new Oi({color:0x07040c}), glow = new Oi({color:0xb070ff}), rock = new co({color:0x6c5a80});
  const opening = new q(new Ha(1.05, 1.15, .04), dark); opening.position.set(0, .58, wallZ); frame.add(opening);
  // A jagged violet rim round the break.
  [[-.55,.3,.5,.95],[.55,.35,-.45,.9],[0,1.18,.15,.9],[-.32,1.02,.8,.35],[.34,1.0,-.75,.35]].forEach(([x,y,rz,h]) => {
    const edge = new q(new Ha(.06, h, .05), glow); edge.position.set(x, y, wallZ - .01); edge.rotation.z = rz; frame.add(edge);
  });
  for (let i = 0; i < 7; i++) { const chunk = new q(new Ha(.22, .16, .2), rock); chunk.position.set(-.7 + i * .24, .08, wallZ - .25 - (i % 2) * .15); chunk.rotation.set(i, i * 1.7, 0); frame.add(chunk); }
  const pit = new q(new Ga(.55, .55, .02, 20), dark); pit.position.set(0, .012, .1); frame.add(pit);
  const ring = new q(new Ga(.62, .62, .015, 20), glow); ring.position.set(0, .008, .1); frame.add(ring);
  const light = new us(0xa060ff, 2.4, 6, 1.6); light.position.set(0, .7, -.2); frame.add(light);
  // The sign the cave left behind, in mirror writing, upside down.
  const texture = Sp('古洞 · SEA CAVE', 0x6c5a80), sign = Wp('古洞 · SEA CAVE', 0x6c5a80, texture);
  sign.position.set(0, 1.75, wallZ - .02); sign.rotation.set(0, Math.PI, Math.PI); sign.scale.x = -1; frame.add(sign);
  return { group, texture, light, x: p.x, z: p.z };
}

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
    tape: new co({color:0xe8c86a}), dark: new co({color:0x4a5556}),
    lamp: new co({color:0xfff3dc,emissive:0xfff0d2,emissiveIntensity:0.72}),
    sakura: new co({color:0xf3d0d8}), cream: new co({color:0xf7f1e6}),
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
    // Warm cream + sakura end-cap plaques (late-Shōwa konbini stockroom charm).
    box('cream',centre.x-width/2-0.02,1.15,centre.z,0.04,0.55,Math.min(depth,0.9));
    box('sakura',centre.x+width/2+0.02,1.15,centre.z,0.04,0.55,Math.min(depth,0.9));
  }
  // Soft wall posters — cream cards with sakura trim, never horror.
  const posterSpots=[[2,4],[18,4],[2,16],[18,16],[10,1]];
  for(const [c,r] of posterSpots){
    if(maze.cells[r*maze.cols+c]!==1) continue;
    const p=gd(c,r,maze);
    box('cream',p.x,1.55,p.z,0.08,0.7,0.55);
    box('sakura',p.x,1.55,p.z+(r<10?0.02:-0.02),0.02,0.62,0.48);
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
    const labelTex=Sp(item.def.short||item.def.name,item.def.accent||0xf3d0d8);textures.push(labelTex);
    const label=Wp(item.def.short||item.def.name,item.def.accent||0xf3d0d8,labelTex);
    label.scale.set(0.55,0.55,0.55);label.position.set(0,0.08,0.28);mesh.add(label);
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
  const hole=createSeaCaveHole(maze);group.add(hole.group);textures.push(hole.texture);
  // Tonight's boss waits down the hole until its time; game.js brings it up. A head taller than Thuan.
  let boss=null;
  if(maze.boss){const body=createBizarroBoss(maze.boss);body.group.visible=false;body.group.scale.setScalar(BOSS_SIZE);body.group.position.set(hole.x,0,hole.z);group.add(body.group);boss={...maze.boss,body};}
  return {group,items,exit:{...exitPosition,mesh:curtain},guest,lanterns,motes,hole,boss,dispose(){
    const geometries=new Set(),mats=new Set();
    group.traverse(node=>{if(node instanceof q){geometries.add(node.geometry);for(const material of Array.isArray(node.material)?node.material:[node.material])mats.add(material);}});
    geometries.forEach(value=>value.dispose());mats.forEach(value=>value.dispose());textures.forEach(value=>value.dispose());
  }};
}
