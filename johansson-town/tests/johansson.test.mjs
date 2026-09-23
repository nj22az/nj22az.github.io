import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import * as THREE from '../vendor/three.module.js';
import {GLTFLoader} from '../vendor/GLTFLoader.js';
import {createJohansson,baseMove,gaitRate,GAIT_SPEED,MOVES,FACE_SHAPES,EXPRESSIONS,LOOPS} from '../src/people/johansson.js';

const FILE=new URL('../assets/characters/johansson/johansson.glb',import.meta.url);

async function withImageStub(run){
 const previous={self:globalThis.self,bitmap:globalThis.createImageBitmap};
 globalThis.self=globalThis;globalThis.createImageBitmap=async()=>({width:1024,height:1024,close(){}});
 try{return await run();}finally{globalThis.self=previous.self;globalThis.createImageBitmap=previous.bitmap;}
}
async function load(){
 const b=await readFile(FILE);
 return withImageStub(()=>new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),''));
}

test('Johansson ships as one self-contained GLB: full skeleton, face shapes, every move',async()=>{
 const b=await readFile(FILE);
 assert.equal(b.readUInt32LE(0),0x46546c67);assert.equal(b.readUInt32LE(8),b.length);
 assert.ok(b.length<4_500_000,'a phone downloads him in one go: '+b.length);
 const g=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));
 for(const buffer of g.buffers)assert.equal(buffer.uri,undefined);
 for(const image of g.images)assert.equal(image.uri,undefined);
 assert.equal(g.skins.length,1);
 const joints=new Set(g.skins[0].joints.map(i=>g.nodes[i].name));
 assert.equal(joints.size,163);
 for(const side of ['L','R']){
  for(let f=1;f<=5;f++)for(let j=1;j<=3;j++)assert.ok(joints.has(`finger${f}-${j}.${side}`),`finger${f}-${j}.${side}`);
  for(const bone of ['upperleg01','lowerleg01','foot','toe1-1','toe5-3','eye','upperarm01','lowerarm01','wrist','clavicle'])assert.ok(joints.has(bone+'.'+side),bone+'.'+side);
 }
 for(const bone of ['jaw','head','neck01','spine01','spine05','tongue00'])assert.ok(joints.has(bone),bone);
 const names=g.animations.map(a=>a.name);
 for(const [move] of MOVES)assert.ok(names.includes(move),move);
 for(const move of ['Idle','Walk','Run','Jump','Fall','Sit','SitEat','Soak','Drink','Eat','Give','Cast','FishIdle','Reel','Phone'])assert.ok(names.includes(move),move);
 const faces=g.meshes.filter(m=>m.extras?.targetNames);
 assert.ok(faces.length>=2,'head and brows both carry the face');
 for(const mesh of faces)assert.deepEqual([...mesh.extras.targetNames].sort(),[...FACE_SHAPES].sort());
 const blend=g.materials.filter(m=>m.alphaMode==='BLEND').map(m=>m.name).sort();
 assert.deepEqual(blend,['Johansson.Brows','Johansson.FringeHair']);
});

test('every move keeps him in one piece: finite bones, feet near the ground, no stretched limbs',async()=>{
 const gltf=await load();
 const model=gltf.scene,mixer=new THREE.AnimationMixer(model);
 const bone=name=>model.getObjectByName(THREE.PropertyBinding.sanitizeNodeName(name)),p=new THREE.Vector3(),q=new THREE.Vector3();
 const length=(a,b)=>bone(a).getWorldPosition(p).distanceTo(bone(b).getWorldPosition(q));
 model.updateMatrixWorld(true);
 const rest={thigh:length('upperleg01.L','lowerleg01.L'),forearm:length('lowerarm01.R','wrist.R')};
 for(const clip of gltf.animations){
  mixer.stopAllAction();const action=mixer.clipAction(clip).play();
  for(const t of [0,.25,.5,.75,1]){
   action.time=clip.duration*t;mixer.update(0);model.updateMatrixWorld(true);
   const feet=Math.min(bone('foot.L').getWorldPosition(p).y,bone('foot.R').getWorldPosition(q).y);
   assert.ok(Number.isFinite(feet),clip.name);
   const low=clip.name==='Soak'?-.25:-.08,high=['Jump','Fall','Sit','SitEat','Crouch','Soak'].includes(clip.name)?1:.3;
   assert.ok(feet>low&&feet<high,`${clip.name} feet at ${feet.toFixed(3)} (t=${t})`);
   assert.ok(Math.abs(length('upperleg01.L','lowerleg01.L')-rest.thigh)<1e-3,clip.name+' thigh length');
   assert.ok(Math.abs(length('lowerarm01.R','wrist.R')-rest.forearm)<1e-3,clip.name+' forearm length');
   const head=bone('head').getWorldPosition(p).y;
   assert.ok(head>(['Crouch','Sit','SitEat','Soak','PickUp'].includes(clip.name)?.55:1.2),clip.name+' head height '+head.toFixed(2));
  }
 }
});

test('fingers close into a fist and open to wave; the walk swings the legs',async()=>{
 const gltf=await load();
 const model=gltf.scene,mixer=new THREE.AnimationMixer(model);
 const at=(name,t,bone)=>{mixer.stopAllAction();const clip=gltf.animations.find(c=>c.name===name),a=mixer.clipAction(clip).play();a.time=t;mixer.update(0);return model.getObjectByName(THREE.PropertyBinding.sanitizeNodeName(bone)).quaternion.clone();};
 const idle=at('Idle',0,'finger3-2.R'),fist=at('Fist',.6,'finger3-2.R');
 assert.ok(idle.angleTo(fist)>1,'middle finger bends well over a radian');
 const thumbIdle=at('Idle',0,'finger1-3.R'),thumbFist=at('Fist',.6,'finger1-3.R');
 assert.ok(thumbIdle.angleTo(thumbFist)>.3,'thumb folds too');
 const front=at('Walk',0,'upperleg01.L'),back=at('Walk',.38,'upperleg01.L');
 assert.ok(front.angleTo(back)>.7,'the stride is a real stride');
});

test('the body move follows the controller, and the gait keeps pace with the ground',()=>{
 assert.equal(baseMove({}),'Idle');
 assert.equal(baseMove({speed:3}),'Walk');
 assert.equal(baseMove({speed:3,running:true}),'Run');
 assert.equal(baseMove({speed:5.2}),'Run');
 assert.equal(baseMove({speed:3,airborne:true}),'Fall');
 assert.equal(baseMove({speed:0,seated:true,seat:'Soak'}),'Soak');
 assert.ok(Math.abs(gaitRate('Walk',3)*GAIT_SPEED.Walk-3)<1e-9,'3 m/s walk plays at its own stride');
 assert.ok(Math.abs(gaitRate('Run',5.2)*GAIT_SPEED.Run-5.2)<1e-9);
 assert.equal(gaitRate('Idle',0),1);
 for(const [name,preset] of Object.entries(EXPRESSIONS))for(const shape of Object.keys(preset))assert.ok(FACE_SHAPES.includes(shape),name+' uses '+shape);
 assert.ok(LOOPS.has('Walk')&&!LOOPS.has('Wave'));
});

test('the live controller blinks, talks, plays moves and hands back to walking',async()=>{
 const b=await readFile(FILE);
 const previous=globalThis.fetch;
 globalThis.fetch=async()=>({ok:true,arrayBuffer:async()=>b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength)});
 try{
  await withImageStub(async()=>{
   const scene=new THREE.Scene(),him=createJohansson({scene,resolve:p=>p});
   assert.equal(await him.loading,true);
   assert.equal(him.actions.length,31);
   let blinked=0;
   for(let i=0;i<360;i++){him.update(1/60,{visible:true});blinked=Math.max(blinked,him.weights.blinkL);}
   assert.ok(blinked>.6,'he blinks within six seconds');
   assert.equal(him.move,'Idle');assert.equal(him.root.visible,true);
   assert.ok(him.weights.smile>.15,'rests on a half-smile');
   him.speak(1);let jaw=0;for(let i=0;i<50;i++){him.update(1/60,{visible:true});jaw=Math.max(jaw,him.weights.jawOpen+him.weights.pucker+him.weights.mouthWide);}
   assert.ok(jaw>.2,'the mouth moves while he talks');
   assert.equal(him.play('Wave'),true);him.update(.1,{visible:true});assert.equal(him.move,'Wave');assert.equal(him.expression,'happy');
   him.update(.1,{visible:true,speed:3});assert.equal(him.move,'Walk','walking off ends the wave');
   him.update(.1,{visible:false,seated:true});assert.equal(him.move,'Sit');assert.equal(him.root.visible,false);
   assert.equal(him.play('No such move'),false);
  });
 }finally{globalThis.fetch=previous;}
});
