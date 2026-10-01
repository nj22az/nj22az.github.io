import * as THREE from '../../vendor/three.module.js';
import {generateFloor,TILE,WALL,FLOOR,tileCentre,worldTile,seeded} from './generate.js';
import {COSTUMES,COSTUMED,costumeRecipe,buildCostumeHead,bizarroLine} from './costumes.js';
import {buildAvatar} from '../avatars/build.js';
import {createAvatarAnimator} from '../avatars/animate.js';
import {recipeFor} from '../avatars/cast.js';
import {WEAPONS} from '../interact/fists.js';

/**
 * Below the old sea cave: Bizarro Minato, a floor at a time, built into the room the game
 * shows interiors in, and run while you are down there.
 *
 * You come down a rope into the first room with a lantern. Down here everything is the
 * wrong way round: the rock is violet, the signs are in mirror writing, the furniture
 * hangs from the roof, and the whole town is here in monster suits -- Officer Mori in a
 * crocodile head, Mrs Sato as a donkey -- talking backwards and bopping you when they
 * catch you. Bop them back with the action button. Chests in the rooms hold coins and
 * things the sea left. The
 * stairs in the furthest room go down a floor, bigger and busier; the rope goes back up to
 * the cave mouth, and what you found comes with you. Black out and you wake at the mouth
 * with nothing but a headache.
 *
 * Walls are the tile grid itself -- `blocked` asks the grid -- so a floor costs one lookup
 * per step rather than a collider per wall. The geometry is merged into a handful of meshes
 * at the room's origin.
 */
export const WALL_HEIGHT=3;
export const CREATURES=Object.freeze({
 costume:{name:'townsperson',hp:2,speed:1.35,sight:8,reach:.8,damage:1,yen:30},
});
/** The older folk waddle; everyone else is quick in a suit. */
const SLOW=new Set(['Mrs Sato','Harbour master']);

const colour=(hex,k=1)=>{const c=new THREE.Color(hex);return [c.r*k,c.g*k,c.b*k];};

/** The floor, ceiling and walls of the grid, as one vertex-coloured mesh. */
function buildShell(map){
 const positions=[],colours=[],random=seeded(map.seed+map.floor*31);
 const quad=(a,b,c,d,col)=>{for(const p of [a,b,c,a,c,d])positions.push(...p);for(let i=0;i<6;i++)colours.push(...col);};
 const H=WALL_HEIGHT;
 for(let y=0;y<map.h;y++)for(let x=0;x<map.w;x++){
  if(map.at(x,y)!==FLOOR)continue;
  const x0=x*TILE,x1=x0+TILE,z0=y*TILE,z1=z0+TILE,n=.85+random()*.25;
  // The stairs tile has no floor: it is the mouth of the pit the steps go down.
  if(x!==map.stairs.x||y!==map.stairs.y)quad([x0,0,z0],[x0,0,z1],[x1,0,z1],[x1,0,z0],colour(0x5d7a74,n));
  quad([x0,H,z0],[x1,H,z0],[x1,H,z1],[x0,H,z1],colour(0x2c2440,n*.8));         // the roof, violet
  // A wall wherever a floor tile meets rock, faced into the tile.
  const face=(ax,az,bx,bz)=>{const k=.8+random()*.3;quad([ax,0,az],[bx,0,bz],[bx,H,bz],[ax,H,az],colour(0x6c5a80,k));};
  if(map.at(x,y-1)===WALL)face(x1,z0,x0,z0);
  if(map.at(x,y+1)===WALL)face(x0,z1,x1,z1);
  if(map.at(x-1,y)===WALL)face(x0,z0,x0,z1);
  if(map.at(x+1,y)===WALL)face(x1,z1,x1,z0);
 }
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 g.setAttribute('color',new THREE.Float32BufferAttribute(colours,3));g.computeVertexNormals();
 // Kept out of the town's cel pass, which lifts every shadow to a tint: down here the dark
 // has to be dark, and the lantern has to be what shows the rock.
 const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide});material.userData.keepPhysical=true;material.userData.keepPhysicalStrict=true;
 const mesh=new THREE.Mesh(g,material);
 mesh.name='Dungeon rock';mesh.receiveShadow=true;return mesh;
}

/** Rubble and stalagmites along the walls, so the rooms read as cave rather than as boxes. */
function buildRubble(map){
 const random=seeded(map.seed*3+map.floor),spots=[];
 for(let y=0;y<map.h;y++)for(let x=0;x<map.w;x++){
  if(map.at(x,y)!==FLOOR)continue;
  for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
   if(map.at(x+dx,y+dy)!==WALL||random()>.45)continue;
   const [cx,cz]=tileCentre(x,y),along=(random()-.5)*TILE*.8;
   spots.push([cx+dx*TILE*.4+(dy?along:0),cz+dy*TILE*.4+(dx?along:0),.25+random()*.35,random()]);
  }
 }
 const g=new THREE.IcosahedronGeometry(1,0);
 const rubble=new THREE.MeshStandardMaterial({color:0x4f4466,roughness:1,flatShading:true});rubble.userData.keepPhysical=true;rubble.userData.keepPhysicalStrict=true;
 const mesh=new THREE.InstancedMesh(g,rubble,Math.max(1,spots.length));
 const d=new THREE.Object3D();
 spots.forEach(([x,z,s,r],i)=>{d.position.set(x,s*.5,z);d.scale.set(s,s*(r<.3?2.2:.8),s);d.rotation.set(r,r*5,0);d.updateMatrix();mesh.setMatrixAt(i,d.matrix);});
 mesh.count=spots.length;mesh.name='Dungeon rubble';return mesh;
}

function buildChest(){
 const g=new THREE.Group(),wood=new THREE.MeshStandardMaterial({color:0x7a5230,roughness:.8}),iron=new THREE.MeshStandardMaterial({color:0x3b3a36,roughness:.5,metalness:.4});
 const base=new THREE.Mesh(new THREE.BoxGeometry(.8,.45,.55),wood);base.position.y=.23;g.add(base);
 const lid=new THREE.Group();lid.position.set(0,.45,-.275);g.add(lid);
 const top=new THREE.Mesh(new THREE.BoxGeometry(.82,.18,.57),wood);top.position.set(0,.09,.285);lid.add(top);
 for(const x of [-.3,.3]){const band=new THREE.Mesh(new THREE.BoxGeometry(.06,.64,.58),iron);band.position.set(x,.32,0);g.add(band);}
 g.userData.lid=lid;return g;
}

/**
 * A townsperson in their suit: their own avatar, recoloured, with the animal's hood on the
 * head bone. Without a page to paint faces on (the tests), a plain stand-in wears the hood.
 */
function buildCostumed(who){
 const look=COSTUMES[who],mesh=new THREE.Group();mesh.name=who+' in a '+look.animal+' suit';
 if(typeof document!=='undefined'&&document.createElement){
  try{
   const avatar=buildAvatar(costumeRecipe(recipeFor(who),who),{shadows:false,faceSize:128});
   avatar.root.rotation.y=0;mesh.add(avatar.root);
   const m=avatar.measure;
   avatar.bones.head.add(buildCostumeHead(look.animal,{R:m.Rh,cy:m.headCentre-m.headY,sx:m.headSX,sy:m.headSY,colour:look.colour,belly:look.belly}));
   return {mesh,animator:createAvatarAnimator(avatar)};
  }catch(error){console.warn('Costume avatar unavailable',who,error);}
 }
 const suit=new THREE.MeshStandardMaterial({color:look.colour,roughness:.8});
 const body=new THREE.Mesh(new THREE.CapsuleGeometry(.24,.7,4,10),suit);body.position.y=.6;mesh.add(body);
 const head=new THREE.Group();head.position.y=1.25;mesh.add(head);
 head.add(new THREE.Mesh(new THREE.SphereGeometry(.14,12,8),new THREE.MeshStandardMaterial({color:0xe0b894})));
 head.add(buildCostumeHead(look.animal,{R:.14,cy:0,colour:look.colour,belly:look.belly}));
 return {mesh,animator:null};
}

/** Mirror-writing signs of the town's shops, and furniture hanging from the roof. */
function dressBizarro(group,map){
 const random=seeded(map.seed*11+map.floor);
 const signs=[['さくら','SAKURA','#a6333c'],['みなと','MINATO IZAKAYA','#2b3a4a'],['中華そば','SATO RAMEN','#a34e3d'],['港','HARBOUR OFFICE','#2b5a78'],['交番','KOBAN','#1f2d4a']];
 const H=WALL_HEIGHT;
 const walls=[];
 for(const r of map.rooms)for(let x=r.x;x<r.x+r.w;x++)if(map.at(x,r.y-1)===WALL)walls.push([x,r.y]);
 const wood=new THREE.MeshStandardMaterial({color:0x6d5238,roughness:.9});
 for(let i=0;i<Math.min(5,walls.length);i++){
  const [x,y]=walls[Math.floor(random()*walls.length)],[cx,cz]=tileCentre(x,y),[jp,en,bg]=signs[i%signs.length];
  let material=new THREE.MeshStandardMaterial({color:bg,roughness:.8});
  if(typeof document!=='undefined'&&document.createElement){
   const canvas=document.createElement('canvas');canvas.width=512;canvas.height=160;const ctx=canvas.getContext('2d');
   ctx.fillStyle=bg;ctx.fillRect(0,0,512,160);ctx.fillStyle='#f4efe2';ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.font='bold 64px "Hiragino Mincho ProN","Yu Mincho","Noto Serif CJK JP",serif';ctx.fillText(jp,256,62);ctx.font='bold 26px sans-serif';ctx.fillText(en,256,126);
   const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;material=new THREE.MeshStandardMaterial({map:texture,roughness:.8});
  }
  // Mirror writing, and hung upside down half the time.
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(1.6,.5),material);sign.name='Bizarro sign';
  sign.position.set(cx,1.9,cz-TILE/2+.03);sign.scale.x=-1;if(random()<.5)sign.rotation.z=Math.PI;group.add(sign);
 }
 // A bench, a vending machine and a street lamp on the roof of a room or two.
 for(const r of map.rooms.slice(1,4)){
  const [cx,cz]=tileCentre(r.cx,r.cy),kind=Math.floor(random()*3),thing=new THREE.Group();
  if(kind===0){const seat=new THREE.Mesh(new THREE.BoxGeometry(1.6,.08,.45),wood);seat.position.y=.45;thing.add(seat);for(const dx of [-.7,.7]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.06,.45,.4),wood);leg.position.set(dx,.22,0);thing.add(leg);}const back=new THREE.Mesh(new THREE.BoxGeometry(1.6,.4,.06),wood);back.position.set(0,.75,-.2);thing.add(back);}
  else if(kind===1){const box=new THREE.Mesh(new THREE.BoxGeometry(.9,1.7,.7),new THREE.MeshStandardMaterial({color:0xc8453a,roughness:.6}));box.position.y=.85;thing.add(box);const glass=new THREE.Mesh(new THREE.BoxGeometry(.7,.8,.02),new THREE.MeshStandardMaterial({color:0x9fc4d6,emissive:0x9fc4d6,emissiveIntensity:.4}));glass.position.set(0,1.15,.36);thing.add(glass);}
  else{const pole=new THREE.Mesh(new THREE.CylinderGeometry(.05,.07,2.2,8),new THREE.MeshStandardMaterial({color:0x3d4a4a}));pole.position.y=1.1;thing.add(pole);const lamp=new THREE.Mesh(new THREE.SphereGeometry(.18,10,8),new THREE.MeshBasicMaterial({color:0xfff0c0}));lamp.position.y=2.25;thing.add(lamp);}
  thing.rotation.x=Math.PI;thing.position.set(cx,H,cz);thing.name='Upside-down furniture';group.add(thing);
 }
 // A goldfish swimming slowly round the first room, in the air.
 const [fx,fz]=tileCentre(map.rooms[0].cx,map.rooms[0].cy);
 const fish=new THREE.Group();fish.name='Bizarro goldfish';
 const orange=new THREE.MeshStandardMaterial({color:0xf08a2a,roughness:.5,emissive:0x5a2a00,emissiveIntensity:.3});
 const body=new THREE.Mesh(new THREE.SphereGeometry(.16,12,8),orange);body.scale.set(1.5,1,.7);fish.add(body);
 const tail=new THREE.Mesh(new THREE.ConeGeometry(.12,.22,6),orange);tail.rotation.z=Math.PI/2;tail.position.x=-.3;fish.add(tail);
 group.add(fish);group.userData.goldfish={fish,x:fx,z:fz};
}

/**
 * @param {object} o
 * @param {THREE.Object3D} o.room
 * @param {(object:THREE.Object3D,label:string,fn:Function,inside:boolean)=>void} o.reg
 * @param {{hp:number,maxHp:number,loot:number,items:string[],floor:number,seed:number}} o.run
 * @param {Function} [o.say] @param {Function} [o.hud]
 * @param {Function} [o.onDescend] @param {Function} [o.onExit] @param {Function} [o.onFaint] @param {Function} [o.onHurt]
 */
export function buildDungeon({room,reg=()=>{},run,say=()=>{},hud=()=>{},onDescend=()=>{},onExit=()=>{},onFaint=()=>{},onHurt=()=>{},onStrike=()=>{},onWeapon=()=>{}}){
 const map=generateFloor(run.floor,run.seed);
 const group=new THREE.Group();group.name='Old sea cave, floor B'+run.floor;room.add(group);
 group.add(buildShell(map),buildRubble(map));
 const [sx,sz]=tileCentre(map.start.x,map.start.y);
 // The rope down from the cave mouth, in a shaft of daylight.
 const rope=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,WALL_HEIGHT,6),new THREE.MeshStandardMaterial({color:0xb99a64,roughness:1}));
 rope.position.set(sx,WALL_HEIGHT/2,sz);rope.name='Rope up to the cave mouth';group.add(rope);
 const shaft=new THREE.Mesh(new THREE.CylinderGeometry(.7,1.1,WALL_HEIGHT,16,1,true),new THREE.MeshBasicMaterial({color:0xfff2cf,transparent:true,opacity:.12,depthWrite:false,side:THREE.DoubleSide}));
 shaft.position.set(sx,WALL_HEIGHT/2,sz);group.add(shaft);
 const ropeAnchor=new THREE.Object3D();ropeAnchor.position.set(sx,1.2,sz);group.add(ropeAnchor);
 reg(ropeAnchor,run.floor===1?'Climb the rope back to the cave mouth':'Climb back up to the cave mouth',()=>onExit(),true);
 // The stairs: a dark hole with steps going down into it.
 const [tx,tz]=tileCentre(map.stairs.x,map.stairs.y),stone=new THREE.MeshStandardMaterial({color:0x4a443c,roughness:1});
 // A square pit the size of the tile, lined with stone, with steps cut down one side into
 // the dark.
 const T=TILE,depthPit=2.2;
 for(const [w,d,x,z] of [[T,.1,0,-T/2],[T,.1,0,T/2],[.1,T,-T/2,0],[.1,T,T/2,0]]){
  const side=new THREE.Mesh(new THREE.BoxGeometry(w,depthPit,d),stone);side.position.set(tx+x,-depthPit/2,tz+z);group.add(side);
 }
 const bottom=new THREE.Mesh(new THREE.PlaneGeometry(T,T),new THREE.MeshBasicMaterial({color:0x040303}));bottom.rotation.x=-Math.PI/2;bottom.position.set(tx,-depthPit+.02,tz);group.add(bottom);
 for(let i=0;i<6;i++){const step=new THREE.Mesh(new THREE.BoxGeometry(T*.7,.18,.34),stone);step.position.set(tx,-.12-i*.33,tz-T/2+.2+i*.34);group.add(step);}
 const stairsAnchor=new THREE.Object3D();stairsAnchor.position.set(tx,.9,tz);group.add(stairsAnchor);
 reg(stairsAnchor,'Go down to floor B'+(run.floor+1),()=>onDescend(),true);
 // Torches on the walls of a few rooms: the only light that is not yours.
 const torchLights=[];
 const wood=new THREE.MeshStandardMaterial({color:0x4a3524,roughness:1});
 for(const r of map.rooms.slice(0,3)){
  // On the first wall found round the room's edge, in a bracket at head height.
  let spot=null;
  for(let x=r.x;x<r.x+r.w&&!spot;x++)if(map.at(x,r.y-1)===WALL)spot=[x,r.y,0,-1];
  for(let y=r.y;y<r.y+r.h&&!spot;y++)if(map.at(r.x-1,y)===WALL)spot=[r.x,y,-1,0];
  if(!spot)continue;
  const [cx,cz]=tileCentre(spot[0],spot[1]),wx=cx+spot[2]*(TILE/2-.18),wz=cz+spot[3]*(TILE/2-.18);
  const stick=new THREE.Mesh(new THREE.CylinderGeometry(.04,.05,.5,6),wood);stick.position.set(wx,1.85,wz);stick.rotation.set(spot[3]*.4,0,-spot[2]*.4);group.add(stick);
  const flame=new THREE.Mesh(new THREE.ConeGeometry(.09,.24,8),new THREE.MeshBasicMaterial({color:0xffc26a}));flame.position.set(wx-spot[2]*.1,2.18,wz-spot[3]*.1);group.add(flame);
  const light=new THREE.PointLight(0xff9a4a,3,10,1.6);light.position.set(wx-spot[2]*.35,2.2,wz-spot[3]*.35);group.add(light);torchLights.push(light);
 }
 // Chests.
 const chests=map.chests.map(c=>{
  const mesh=buildChest(),[x,z]=tileCentre(c.x,c.y);mesh.position.set(x,0,z);mesh.rotation.y=(c.x*13+c.y*7)%4*Math.PI/2;group.add(mesh);
  const chest={...c,mesh,open:false};
  reg(mesh,'Open the chest',()=>{
   if(chest.open)return;chest.open=true;mesh.userData.lid.rotation.x=-1.9;
   if(chest.weapon){
    run.items.push(chest.weapon);
    const better=!run.weapon||WEAPONS[chest.weapon].damage>WEAPONS[run.weapon].damage;
    if(better){run.weapon=chest.weapon;onWeapon(chest.weapon);}
    say('In the chest: a '+chest.weapon+'. '+(better?'Better than bare knuckles. You take it in your right hand.':'You already have something better; it goes in the bag.'),3.5);
   }
   else if(chest.treasure){run.items.push(chest.treasure.name);say('In the chest: '+chest.treasure.name+'. Worth something to somebody.',3.5);}
   else{run.loot+=chest.yen;say('The chest holds ¥'+chest.yen+' in old coins.',3);}
   refresh();
  },true);
  return chest;
 });
 // The townsfolk, in their suits. A floor has everybody once before anybody twice.
 const order=[...COSTUMED].sort((a,b)=>((a.length*31+run.seed*7+run.floor)%13)-((b.length*31+run.seed*7+run.floor)%13));
 const creatures=map.creatures.map((c,i)=>{
  const start=Math.floor((map.creatures[0]?.pick||0)*order.length),who=order[(start+i)%order.length],look=COSTUMES[who];
  const kind={...CREATURES.costume,speed:SLOW.has(who)?1.05:CREATURES.costume.speed};
  const {mesh,animator}=buildCostumed(who);
  const [x,z]=tileCentre(c.x,c.y);
  mesh.position.set(x,0,z);mesh.userData.dynamicProp=true;group.add(mesh);
  const creature={kind:c.kind,who,animal:look.animal,...kind,name:who+' the '+look.animal,x,z,hp:kind.hp,mesh,animator,alive:true,cool:0,hurt:0,phase:i*1.7,home:[x,z],said:i};
  reg(mesh,'Fight '+who+' the '+look.animal,()=>strike(creature),true);
  return creature;
 });
 dressBizarro(group,map);
 const lantern=new THREE.PointLight(0xffdcaa,6,15,1.3);lantern.name='Your lantern';group.add(lantern);
 room.add(new THREE.HemisphereLight(0x39465a,0x14110e,.35));

 const refresh=()=>hud('♥'.repeat(Math.max(0,run.hp))+'♡'.repeat(Math.max(0,run.maxHp-run.hp))+' · B'+run.floor+' · ¥'+run.loot+(run.items.length?' · '+run.items.length+' found':''));
 const blocked=(x,z,r=0)=>{
  for(const [dx,dz] of [[0,0],[r,0],[-r,0],[0,r],[0,-r],[r*.7,r*.7],[-r*.7,r*.7],[r*.7,-r*.7],[-r*.7,-r*.7]]){
   const [tx,ty]=worldTile(x+dx,z+dz);if(map.at(tx,ty)!==FLOOR||tx===map.stairs.x&&ty===map.stairs.y)return true;
  }
  return false;
 };
 let player=null;
 let clock=0,lastPunch=-9;
 function strike(c){
  if(!player||clock-lastPunch<.36)return;
  lastPunch=clock;
  // The punch is thrown whether or not it lands: that is what a swing at thin air looks like.
  onStrike(c,run.weapon);
  if(!c?.alive)return;
  const dx=c.x-player.x,dz=c.z-player.z,d=Math.hypot(dx,dz)||1;
  if(d>2.5){say('Too far to reach.',1.2);return;}
  const damage=WEAPONS[run.weapon]?.damage||1;
  c.hp-=damage;c.hurt=.35;c.attack=0;c.animator?.play('Hurt');
  // Knocked back, if there is room behind it.
  // Knocked back half a step: far enough to feel it, near enough to follow up.
  const nx=c.x+dx/d*.5,nz=c.z+dz/d*.5;if(!blocked(nx,nz,.3)){c.x=nx;c.z=nz;}
  if(c.hp<=0){
   c.alive=false;c.leaving=1.6;c.animator?.play('Bow');run.loot+=c.yen*run.floor;run.kills=(run.kills||0)+1;
   say(c.who+' takes off the '+c.animal+' head, bows, puts it back on backwards and waddles off into the dark. ¥'+c.yen*run.floor+' on the floor where they stood.',3.5);
   refresh();
  }else say((run.weapon?'Whack! ':'Pow! ')+c.who+' the '+c.animal+': “'+bizarroLine(c.who,c.said++)+'”',2.2);
 }
 const spawn=[sx+.6,0,sz+.6];
 refresh();
 say(run.floor===1?'古洞 · Down the rope into Bizarro Minato. The whole town is down here in monster suits, and everything is backwards.':'Floor B'+run.floor+'. Further down, and further backwards.',4.5);
 return {
  bounds:{minX:0,maxX:map.w*TILE,minZ:0,maxZ:map.h*TILE},
  spawn,exit:[sx,1.1,sz],yaw:0,noDoorway:true,colliders:[],
  blocked,
  dungeon:{
   map,run,chests,creatures,strike,
   /** Somebody in a suit close enough to fight: the fists come up. */
   nearFoe(at,range=4.5){return creatures.some(c=>c.alive&&Math.hypot(c.x-at.x,c.z-at.z)<range);},
   /**
    * @param {number} dt seconds
    * @param {{x:number,z:number}} at where the player stands
    */
   update(dt,at){
    player=at;clock+=dt;if(!at)return;
    // Held up over your head: at eye height it lit your own fists white as they came past it.
    lantern.position.set(at.x,2.6,at.z);
    const t=performance.now()/1000;
    for(const l of torchLights)l.intensity=2.7+.5*Math.sin(t*9+l.position.x);
    const gold=group.userData.goldfish;if(gold){const a=t*.4;gold.fish.position.set(gold.x+Math.cos(a)*1.6,2+.2*Math.sin(t*1.3),gold.z+Math.sin(a)*1.6);gold.fish.rotation.y=-a-Math.PI/2;}
    for(const c of creatures){
     if(!c.alive){
      // A bow, then gone: shrinking away into the dark over the last moment.
      c.leaving=Math.max(0,(c.leaving||0)-dt);c.mesh.visible=c.leaving>0;
      c.mesh.scale.setScalar(Math.min(1,c.leaving/.35)||.01);c.animator?.update(dt,{speed:0,expression:'happy'});continue;
     }
     c.cool=Math.max(0,c.cool-dt);c.hurt=Math.max(0,c.hurt-dt);c.phase+=dt;
     const dx=at.x-c.x,dz=at.z-c.z,d=Math.hypot(dx,dz);
     let tx=c.home[0]-c.x,tz=c.home[1]-c.z,speed=c.speed*.4;
     if(d<c.sight){tx=dx;tz=dz;speed=c.speed;}
     const len=Math.hypot(tx,tz);
     if(len>c.reach*.8&&c.hurt<=0&&!(c.attack>0)){
      const step=Math.min(len,speed*dt),nx=c.x+tx/len*step,nz=c.z+tz/len*step;
      if(!blocked(nx,nz,.3)){c.x=nx;c.z=nz;}else if(!blocked(nx,c.z,.3))c.x=nx;else if(!blocked(c.x,nz,.3))c.z=nz;
     }
     const moved=Math.hypot(c.x-c.mesh.position.x,c.z-c.mesh.position.z)/Math.max(dt,1e-4);
     c.mesh.position.set(c.x,c.hurt>0?.12*Math.sin(c.hurt*28):0,c.z);
     c.mesh.rotation.y=Math.atan2(d<c.sight?dx:tx,d<c.sight?dz:tz);
     c.animator?.update(dt,{speed:moved>.05?moved:0,expression:c.hurt>0?'surprised':'smile'});
     // Arms up for a moment, then down on you: you can see it coming, and step back.
     if(d<c.reach&&c.cool<=0&&!(c.attack>0)&&c.hurt<=0){c.attack=.42;c.animator?.play('Swipe');}
     if(c.attack>0){
      c.attack-=dt;
      if(c.attack<=0){
       c.cool=1.3;
       if(d<c.reach*1.4){
        run.hp-=c.damage;onHurt(c);refresh();
        if(run.hp<=0){onFaint();return;}
        say(c.who+' the '+c.animal+' bops you. “'+bizarroLine(c.who,c.said++)+'”',2.2);
       }
      }
     }
    }
   },
  },
 };
}
