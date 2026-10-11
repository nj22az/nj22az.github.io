import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from '../vendor/three.module.js';
import {toRoom,roomColliders,roomSeats,roomAnchors,partsByRole,studioAssetsEnabled,registerStudioAsset,resetStudioAssets,STUDIO_ASSETS_KEY,travelAlong,restoreNames,placeStudioAsset} from '../src/world/studio-assets.js';
import {ONSEN_SEATS,buildOnsenInterior} from '../src/world/interiors/onsen.js';
import {CHAIR_TIMER,MASSAGE_CHAIR} from '../src/world/interiors/onsen-electrics.js';
import {ONSEN_PROPS} from '../src/world/interiors/onsen-props.js';

// Studio's catalogue (jojo/town-studio/assets/README.md): what Studio published, placed in World by id.
const catalog=JSON.parse(readFileSync(new URL('../assets/catalog/index.json',import.meta.url)));
const chairCard=JSON.parse(readFileSync(new URL('../assets/catalog/massage-chair/asset.json',import.meta.url)));
const near=(a,b,eps=.006)=>a.every((v,i)=>Math.abs(v-b[i])<=eps);

test('a point in the asset turns into the room as World places furniture (placements.js)',()=>{
 assert.deepEqual(toRoom([0,0,0],{x:2,z:3,yaw:0}),[2,0,3]);
 assert.deepEqual(toRoom([1,.5,0],{x:0,z:0,yaw:Math.PI/2}),[0,.5,-1]);// three.js rotation.y: +x turns to -z
 assert.deepEqual(toRoom([0,0,1],{x:0,z:0,yaw:Math.PI/2}),[1,0,0]);
 const p=new THREE.Object3D();p.position.set(4,0,2);p.rotation.y=.7;p.updateMatrixWorld(true);
 const v=new THREE.Vector3(.3,.2,-.4).applyMatrix4(p.matrixWorld);
 assert.ok(near(toRoom([.3,.2,-.4],{x:4,z:2,yaw:.7}),v.toArray(),1e-4),'the same as three.js would put it');
});

test('the catalogue lists the chair, from Studio, and every part says what it is for',()=>{
 const entry=catalog.assets.find(a=>a.id==='massage-chair');
 assert.ok(entry,'listed');assert.equal(entry.from,'johansson-studio');assert.equal(entry.version,chairCard.version);
 const roles=partsByRole(chairCard);
 for(const [role,name] of [['seat','Massage chair seat'],['lamp','Massage chair lamp'],['motor','Massage chair rollers'],['coin-slot','Massage chair coin box'],['cord','Massage chair cord']])
  assert.ok(roles[role]?.includes(name),`${name} is the ${role}`);
 assert.ok(chairCard.parts.every(p=>p.role),'no part without a role');
 assert.ok(chairCard.checks.every(c=>c.ok),'it passed every Studio check');
});

test('placed where its card says, the chair agrees with the onsen: the same seat and the same footprint',()=>{
 const at=chairCard.replaces.placement;
 const [s]=roomSeats(chairCard,at),old=ONSEN_SEATS.massage;
 assert.ok(near(s.position,old.position),'seat position '+s.position);
 assert.ok(near(s.stand,old.stand),'stand '+s.stand);
 assert.ok(Math.abs(s.yaw-old.yaw)<1e-3,'faces the room');
 assert.equal(s.surfaceY,old.surfaceY);assert.equal(s.eyeY,old.eyeY);
 const body=roomColliders(chairCard,at).find(c=>c.name==='body');
 assert.ok(Math.abs(body.x-(MASSAGE_CHAIR.front+(4.81-MASSAGE_CHAIR.front)/2))<.006&&Math.abs(body.z-3.55)<.006,'centred where the old collider was');
 assert.ok(Math.abs(body.w-.61)<.006&&Math.abs(body.d-.9)<.006,'the old collider exactly: '+body.w+' × '+body.d);
 const arm=roomAnchors(chairCard,at)['right-arm-top'];
 assert.ok(Math.abs(arm[1]-ONSEN_PROPS.offering.top)<.006,'the arm top is where the coffee milks stand');
 for(const x of ONSEN_PROPS.offering.xs)assert.ok(Math.abs(x-arm[0])<.13,'each milk on the arm');
});

// A stand-in for the GLB (node cannot decode its textures): the card's parts as named groups, a box each, as Studio's
// export names them, with the readout as its own mesh and the lamp as an unlit "glow" mesh.
function standIn(card){
 const scene=new THREE.Group(),root=new THREE.Group();root.name=card.name;scene.add(root);
 for(const p of card.parts){
  const g=p.name===card.name?root:new THREE.Group();if(g!==root){g.name=p.name;root.add(g);}
  const glow=p.role==='lamp',m=new THREE.Mesh(new THREE.BoxGeometry(.02,.02,.02),glow?new THREE.MeshBasicMaterial({color:0xff4a2a}):new THREE.MeshStandardMaterial());
  m.name=glow?p.name+' (glow)':p.name;m.position.set(...(p.role==='motor'?[0,.7,-.125]:[0,.4,0]));g.add(m);
  if(p.role==='coin-slot'){const d=new THREE.Mesh(new THREE.PlaneGeometry(.046,.022),new THREE.MeshStandardMaterial());d.name=CHAIR_TIMER.name;g.add(d);}
 }
 return {card,scene};
}
const build=()=>{const room=new THREE.Group(),hits=[];const layout=buildOnsenInterior({room,reg:(o,label,fn)=>hits.push({o,label,fn}),action:()=>{},exit(){}});room.updateMatrixWorld(true);return {room,layout};};
const withSwitch=(on,fn)=>{const old=globalThis.localStorage;globalThis.localStorage={getItem:k=>k===STUDIO_ASSETS_KEY&&on?'on':null};try{return fn();}finally{globalThis.localStorage=old;}};

test('the switch is off unless asked for: the live onsen keeps its own chair',()=>{
 assert.equal(studioAssetsEnabled({search:''},null),false);
 assert.equal(studioAssetsEnabled({search:'?studio-assets'},null),true);
 assert.equal(studioAssetsEnabled({search:''},{getItem:()=>'on'}),true);
 resetStudioAssets();registerStudioAsset('massage-chair',standIn(chairCard));
 const {room}=withSwitch(false,build);
 assert.ok(room.getObjectByName('Massage chair arm'),'the old chair');assert.equal(room.getObjectByName(chairCard.name),undefined);
 resetStudioAssets();
});

test('switched on, the onsen uses Studio’s chair: one coin box, one lamp that lights, the readout on its display',()=>{
 resetStudioAssets();registerStudioAsset('massage-chair',standIn(chairCard));
 const {room}=withSwitch(true,build);
 const chair=room.getObjectByName(chairCard.name);
 assert.ok(chair?.userData.studioAsset,'Studio’s chair is in the room');
 assert.equal(room.getObjectByName('Massage chair arm'),undefined,'no old boxes');
 const named=n=>{const all=[];room.traverse(o=>{if(o.name===n)all.push(o);});return all;};
 assert.equal(named('Massage chair coin timer').length,0,'World’s own coin box is gone');
 const lamps=named('Massage chair lamp').filter(o=>o.isMesh);
 assert.equal(lamps.length,1,'one lamp');assert.ok(lamps[0].material.emissive,'it can be lit');
 const display=named(CHAIR_TIMER.name);
 assert.equal(display.length,1,'one readout: the chair’s own (World draws the time on it where there is a canvas: the browser check)');
 assert.ok(named('Massage chair cord').some(o=>o.isMesh),'World draws its cord');
 assert.equal(chair.getObjectByName('Massage chair cord (part)').visible,false,'the chair’s own loose cord is hidden: the room wires it');
 for(const name of ['Massage chair seat','Massage chair back','Massage chair coin box','Massage chair lamp','Massage chair rollers'])
  assert.ok(room.getObjectByName(name)?.isMesh,name+': found by name, it is a mesh, as World’s code expects');
 assert.equal(named('Massage chair rollers').length,1,'one set of rollers: the chair’s');
 assert.equal(chair.getObjectByName('Massage chair rollers').userData.staticProp,false,'moving parts are not static');
 const plate=room.getObjectByName('Massage chair rating plate');assert.ok(plate.position.x>4.8,'the rating plate on the back');
 const milk=room.getObjectByName(ONSEN_PROPS.offering.name);
 assert.ok(Math.abs(milk.position.z-roomAnchors(chairCard,chairCard.replaces.placement)['right-arm-top'][2])<1e-4,'the milks on the new arm');
 assert.ok(chair.getObjectByName('Massage chair rollers'),'the rollers are the chair’s motor part');
 resetStudioAssets();
});

test('the rollers travel the track and stay a centimetre inside both ends, clear of the headrest',()=>{
 const track=chairCard.anchors['roller-track'],half=.045*.9;// the rollers' half height (model.js: sphere 0.045, sy 0.9)
 const {centre,amplitude}=travelAlong(track,half);
 assert.ok(Math.abs(centre-.73)<1e-6,'the track’s own middle');
 assert.ok(centre+amplitude+half<=track.max[1]-.0099&&centre-amplitude-half>=track.min[1]+.0099,'inside the track');
 assert.ok(centre+amplitude+half<.98,'below the headrest pillow (its underside at 0.98)');
});

test('names three’s loader made safe go back to Studio’s own',()=>{
 const g=new THREE.Group();g.name='Massage_chair_lamp';g.userData.name='Massage chair lamp';
 const m=new THREE.Mesh();m.name='Massage_chair_lamp_(glow)';m.userData.name='Massage chair lamp (glow)';g.add(m);
 restoreNames(g);assert.equal(g.name,'Massage chair lamp');assert.equal(m.name,'Massage chair lamp (glow)');
});

test('a collider turned off the room’s axes keeps its turn, and a room of square boxes refuses it',()=>{
 const card={...chairCard,colliders:[{name:'turned',x:0,z:0,w:1,d:.5,height:1,yaw:Math.PI/4}]};
 assert.ok(Math.abs(roomColliders(card,{x:0,z:0,yaw:0})[0].yaw-Math.PI/4)<1e-3,'square placement, turned box');
 const [q]=roomColliders({...chairCard,colliders:[{name:'q',x:0,z:0,w:1,d:.5,height:1,yaw:Math.PI/4}]},{x:0,z:0,yaw:Math.PI/4});
 assert.equal(q.yaw,undefined,'a quarter turn in all is square again');assert.equal(q.w,.5);assert.equal(q.d,1);
 resetStudioAssets();registerStudioAsset('turned',{card,scene:new THREE.Group()});
 const warn=console.warn;console.warn=()=>{};
 try{assert.equal(placeStudioAsset('turned',new THREE.Group(),{x:0,z:0,yaw:0},{squareOnly:true}),null);}finally{console.warn=warn;resetStudioAssets();}
});
