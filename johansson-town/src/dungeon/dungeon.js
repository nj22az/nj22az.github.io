import * as THREE from '../../vendor/three.module.js';
import {generateFloor,TILE,WALL,FLOOR,tileCentre,worldTile,seeded} from './generate.js';

/**
 * Below the old sea cave: a floor of the dungeon, built into the room the game shows
 * interiors in, and run while you are down there.
 *
 * You come down a rope into the first room with a lantern. Chests in the other rooms hold
 * coins and things the sea left; crabs the size of dogs and blue wisps come for you when
 * you are near, and hurt when they touch you. Strike them with the action button. The
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
 crab:{name:'crab',hp:2,speed:1.25,sight:7,reach:.8,damage:1,yen:20},
 wisp:{name:'wisp',hp:1,speed:1.9,sight:9,reach:.7,damage:1,yen:35},
});

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
  if(x!==map.stairs.x||y!==map.stairs.y)quad([x0,0,z0],[x0,0,z1],[x1,0,z1],[x1,0,z0],colour(0x8a7d66,n));
  quad([x0,H,z0],[x1,H,z0],[x1,H,z1],[x0,H,z1],colour(0x3a352f,n*.8));         // the roof
  // A wall wherever a floor tile meets rock, faced into the tile.
  const face=(ax,az,bx,bz)=>{const k=.8+random()*.3;quad([ax,0,az],[bx,0,bz],[bx,H,bz],[ax,H,az],colour(0x6b6256,k));};
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
 const material=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide});material.userData.keepPhysical=true;
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
 const rubble=new THREE.MeshStandardMaterial({color:0x5d564c,roughness:1,flatShading:true});rubble.userData.keepPhysical=true;
 const mesh=new THREE.InstancedMesh(g,rubble,Math.max(1,spots.length));
 const d=new THREE.Object3D();
 spots.forEach(([x,z,s,r],i)=>{d.position.set(x,s*.5,z);d.scale.set(s,s*(r<.3?2.2:.8),s);d.rotation.set(r,r*5,0);d.updateMatrix();mesh.setMatrixAt(i,d.matrix);});
 mesh.count=spots.length;mesh.name='Dungeon rubble';return mesh;
}

function buildCrab(){
 const g=new THREE.Group();
 const shell=new THREE.MeshStandardMaterial({color:0x8e2c20,roughness:.6}),dark=new THREE.MeshStandardMaterial({color:0x1b1512});
 const body=new THREE.Mesh(new THREE.SphereGeometry(.42,12,8),shell);body.scale.set(1,.45,.8);body.position.y=.3;g.add(body);
 for(const s of [-1,1]){
  const claw=new THREE.Mesh(new THREE.SphereGeometry(.16,8,6),shell);claw.scale.set(1,.7,1.4);claw.position.set(s*.42,.3,.35);g.add(claw);
  const eye=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.16,5),dark);eye.position.set(s*.1,.5,.25);g.add(eye);
  for(const z of [-.15,0,.15]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.45,.05,.05),shell);leg.position.set(s*.5,.18,z);leg.rotation.z=s*-.5;g.add(leg);}
 }
 return g;
}
function buildWisp(){
 const g=new THREE.Group();
 const core=new THREE.Mesh(new THREE.SphereGeometry(.2,12,8),new THREE.MeshBasicMaterial({color:0xcff4ff}));core.position.y=1.2;g.add(core);
 const halo=new THREE.Mesh(new THREE.SphereGeometry(.42,12,8),new THREE.MeshBasicMaterial({color:0x5fc8ff,transparent:true,opacity:.35,depthWrite:false}));halo.position.y=1.2;g.add(halo);
 const tail=new THREE.Mesh(new THREE.ConeGeometry(.2,.6,8),new THREE.MeshBasicMaterial({color:0x5fc8ff,transparent:true,opacity:.3,depthWrite:false}));tail.position.y=.8;tail.rotation.x=Math.PI;g.add(tail);
 return g;
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
 * @param {object} o
 * @param {THREE.Object3D} o.room
 * @param {(object:THREE.Object3D,label:string,fn:Function,inside:boolean)=>void} o.reg
 * @param {{hp:number,maxHp:number,loot:number,items:string[],floor:number,seed:number}} o.run
 * @param {Function} [o.say] @param {Function} [o.hud]
 * @param {Function} [o.onDescend] @param {Function} [o.onExit] @param {Function} [o.onFaint] @param {Function} [o.onHurt]
 */
export function buildDungeon({room,reg=()=>{},run,say=()=>{},hud=()=>{},onDescend=()=>{},onExit=()=>{},onFaint=()=>{},onHurt=()=>{}}){
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
   if(chest.treasure){run.items.push(chest.treasure.name);run.loot+=0;say('In the chest: '+chest.treasure.name+'. Worth something to somebody.',3.5);}
   else{run.loot+=chest.yen;say('The chest holds ¥'+chest.yen+' in old coins.',3);}
   refresh();
  },true);
  return chest;
 });
 // Creatures.
 const creatures=map.creatures.map((c,i)=>{
  const kind=CREATURES[c.kind],mesh=c.kind==='wisp'?buildWisp():buildCrab(),[x,z]=tileCentre(c.x,c.y);
  mesh.position.set(x,0,z);mesh.userData.dynamicProp=true;group.add(mesh);
  const creature={kind:c.kind,...kind,x,z,hp:kind.hp,mesh,alive:true,cool:0,hurt:0,phase:i*1.7,home:[x,z]};
  reg(mesh,'Strike the '+kind.name,()=>strike(creature),true);
  return creature;
 });
 const lantern=new THREE.PointLight(0xffdcaa,5,14,1.4);lantern.name='Your lantern';group.add(lantern);
 room.add(new THREE.HemisphereLight(0x39465a,0x14110e,.35));

 const refresh=()=>hud('♥'.repeat(Math.max(0,run.hp))+'♡'.repeat(Math.max(0,run.maxHp-run.hp))+' · B'+run.floor+' · ¥'+run.loot+(run.items.length?' · '+run.items.length+' found':''));
 const blocked=(x,z,r=0)=>{
  for(const [dx,dz] of [[0,0],[r,0],[-r,0],[0,r],[0,-r],[r*.7,r*.7],[-r*.7,r*.7],[r*.7,-r*.7],[-r*.7,-r*.7]]){
   const [tx,ty]=worldTile(x+dx,z+dz);if(map.at(tx,ty)!==FLOOR||tx===map.stairs.x&&ty===map.stairs.y)return true;
  }
  return false;
 };
 let player=null;
 function strike(c){
  if(!c.alive||!player)return;
  const dx=c.x-player.x,dz=c.z-player.z,d=Math.hypot(dx,dz)||1;
  if(d>2.2){say('Too far to reach.',1.5);return;}
  c.hp--;c.hurt=.35;
  // Knocked back, if there is room behind it.
  const nx=c.x+dx/d*.9,nz=c.z+dz/d*.9;if(!blocked(nx,nz,.3)){c.x=nx;c.z=nz;}
  if(c.hp<=0){
   c.alive=false;run.loot+=c.yen*run.floor;run.kills=(run.kills||0)+1;
   say(c.kind==='wisp'?'The wisp goes out like a blown candle. ¥'+c.yen*run.floor+' clinks on the stone.':'The crab backs into a crack and is gone, leaving ¥'+c.yen*run.floor+' behind.',2.5);
   refresh();
  }else say(c.kind==='wisp'?'The wisp flickers.':'Your blow rings off its shell.',1.2);
 }
 const spawn=[sx+.6,0,sz+.6];
 refresh();
 say(run.floor===1?'古洞 · Down the rope into the dark. Your lantern shows the way; find the stairs, or the rope back up.':'Floor B'+run.floor+'. The air is colder down here.',4);
 return {
  bounds:{minX:0,maxX:map.w*TILE,minZ:0,maxZ:map.h*TILE},
  spawn,exit:[sx,1.1,sz],yaw:0,noDoorway:true,colliders:[],
  blocked,
  dungeon:{
   map,run,chests,creatures,strike,
   /**
    * @param {number} dt seconds
    * @param {{x:number,z:number}} at where the player stands
    */
   update(dt,at){
    player=at;if(!at)return;
    lantern.position.set(at.x,1.7,at.z);
    const t=performance.now()/1000;
    for(const l of torchLights)l.intensity=2.7+.5*Math.sin(t*9+l.position.x);
    for(const c of creatures){
     if(!c.alive){c.mesh.visible=c.hurt>0;c.hurt=Math.max(0,c.hurt-dt);c.mesh.scale.setScalar(Math.max(.01,c.hurt/.35));continue;}
     c.cool=Math.max(0,c.cool-dt);c.hurt=Math.max(0,c.hurt-dt);c.phase+=dt;
     const dx=at.x-c.x,dz=at.z-c.z,d=Math.hypot(dx,dz);
     let tx=c.home[0]-c.x,tz=c.home[1]-c.z,speed=c.speed*.4;
     if(d<c.sight){tx=dx;tz=dz;speed=c.speed;}
     const len=Math.hypot(tx,tz);
     if(len>c.reach*.8&&c.hurt<=0){
      const step=Math.min(len,speed*dt),nx=c.x+tx/len*step,nz=c.z+tz/len*step;
      if(!blocked(nx,nz,.3)){c.x=nx;c.z=nz;}else if(!blocked(nx,c.z,.3))c.x=nx;else if(!blocked(c.x,nz,.3))c.z=nz;
     }
     c.mesh.position.set(c.x,c.kind==='wisp'?.15*Math.sin(c.phase*3):0,c.z);
     c.mesh.rotation.y=Math.atan2(dx,dz)+(c.kind==='crab'?Math.sin(c.phase*14)*.15:0);
     c.mesh.scale.setScalar(c.hurt>0?1.15:1);
     if(d<c.reach&&c.cool<=0){
      c.cool=1.3;run.hp-=c.damage;onHurt(c);refresh();
      if(run.hp<=0){onFaint();return;}
      say(c.kind==='wisp'?'The wisp’s cold goes right through you.':'The crab’s claw catches your ankle.',1.5);
     }
    }
   },
  },
 };
}
