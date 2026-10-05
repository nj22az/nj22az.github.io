import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildMayorHome,buildMayorOffice} from '../src/world/interiors/town-hall.js';
import {createHomeCustomization,HOME_CUSTOMIZATION_PLACEMENT} from '../src/world/interiors/home-customization.js';
import {createRoomWalk} from '../src/people/room-walk.js';
import {circleHitsRect} from '../physics.js';
import {restoreHomeDecor,setHomeDecor,unlockedHomeKeepsakes} from '../src/progression/home-decor.js';
import {createActivities} from '../activities.js';
import {slotKey,addPlayer,DEFAULT_PLAYER} from '../src/save.js';

test('home choices survive saving and player switching; earned decorations cannot be equipped early',()=>{
 const ui=installDOM();let activities=createActivities({say(){},onTime(){},onWeather(){}}),state=activities.state;
 assert.deepEqual(unlockedHomeKeepsakes(state).map(i=>i.id),['postcard']);
 assert.equal(setHomeDecor(state,'keepsake','cat'),false);
 assert.equal(setHomeDecor(state,'wall','harbour'),true);assert.equal(setHomeDecor(state,'textile','leaf'),true);
 state.quest=3;state.fish=1;state.kenjiEscort='done';assert.equal(setHomeDecor(state,'keepsake','cat'),true);activities.save();
 const saved=localStorage.getItem(slotKey(DEFAULT_PLAYER.id));activities=createActivities({say(){},onTime(){},onWeather(){}});
 assert.deepEqual(activities.state.homeDecor,{wall:'harbour',textile:'leaf',keepsake:'cat'});
 addPlayer(localStorage,'Second neighbour');
 activities=createActivities({say(){},onTime(){},onWeather(){}});assert.deepEqual(activities.state.homeDecor,restoreHomeDecor());
 assert.deepEqual(JSON.parse(localStorage.getItem(slotKey(DEFAULT_PLAYER.id))).homeDecor,JSON.parse(saved).homeDecor,'Creating a player retains the first player’s room');
 assert.deepEqual(restoreHomeDecor({wall:'invalid',textile:null,keepsake:'script'}),restoreHomeDecor());
});

test('physical decoration changes only the player room and keeps clear of the doorway',()=>{
 installDOM();const room=new THREE.Group(),office=new THREE.Group(),hits=[];
 buildMayorHome({room,reg(){},action(){}});buildMayorOffice({room:office,reg(){},action(){}});
 const officeColours=[];office.traverse(o=>{if(o.isMesh)officeColours.push(o.material.color.getHex());});
 const state={homeDecor:restoreHomeDecor(),quest:0,fish:0},menus=[];let saves=0;
 const decor=createHomeCustomization({room,state,reg:(o,label,fn)=>hits.push({o,label,fn}),menu:(...a)=>menus.push(a),close(){},save(){saves++;}});
 hits[0].fn();menus.at(-1)[2].find(([label])=>label==='Wall colour')[1]();menus.at(-1)[2].find(([label])=>label==='Garden green')[1]();
 assert.equal(saves,1);assert.equal(decor.snapshot().wall,'garden');
 const doorwayWall=room.getObjectByName('Mayor’s home').children.find(o=>o.isMesh&&o.position.z>2.8&&o.position.y>2.1);
 assert.ok(doorwayWall,'There is a wall over the exit');assert.equal(doorwayWall.material.color.getHex(),0xdde5cb,'The selected colour includes the wall over the doorway');
 const after=[];office.traverse(o=>{if(o.isMesh)after.push(o.material.color.getHex());});assert.deepEqual(after,officeColours,'Shared shell materials are never recoloured');
 assert.equal(room.getObjectByName('Tama clay cat').visible,false);
 state.quest=3;assert.equal(setHomeDecor(state,'keepsake','cat'),true);decor.snapshot();assert.equal(room.getObjectByName('Tama clay cat').visible,true);assert.equal(room.getObjectByName('Swedish harbour postcard').visible,false);
 const shelf=new THREE.Box3().setFromObject(room.getObjectByName('Earned keepsake shelf'));
 assert.ok(shelf.min.x>3&&shelf.max.x<3.3&&shelf.min.z>.4&&shelf.max.z<1.39,'Every keepsake stays inside the main room, between the east window and the bathroom wall');
});

test('the keepsake display faces the main room and its control can be walked to without entering the bathroom',()=>{
 installDOM();const room=new THREE.Group(),colliders=[],hits=[];
 const layout=buildMayorHome({room,reg(){},action(){},collider:(x,z,w,d)=>colliders.push({x,z,w,d})});
 createHomeCustomization({room,state:{homeDecor:restoreHomeDecor()},reg:(o,label)=>hits.push({o,label}),menu(){},close(){},save(){}});
 room.updateMatrixWorld(true);
 const anchor=hits.find(h=>h.label==='Decorate your home').o;
 assert.deepEqual(anchor.position.toArray(),HOME_CUSTOMIZATION_PLACEMENT.anchor);
 const bounds=layout.bounds,blocked=(x,z,r=.32)=>x<bounds.minX+r||x>bounds.maxX-r||z<bounds.minZ+r||z>bounds.maxZ-r||colliders.some(c=>circleHitsRect(x,z,r,c));
 assert.equal(blocked(anchor.position.x,anchor.position.z),false,'A full player body fits at the decoration control');
 const person={g:new THREE.Group(),profile:{name:'Johansson',age:35}},walker=createRoomWalk(blocked,{bounds,radius:.32});
 person.g.position.set(...layout.spawn);
 for(const target of [[0,0,.85],[anchor.position.x,0,anchor.position.z],layout.spawn]){
  let arrived=false;
  for(let frame=0;frame<3600&&!arrived;frame++){
   const before=person.g.position.clone();arrived=walker.move(person,target,1/60);
   assert.ok(person.g.position.distanceTo(before)<=1/60+1e-7,'Movement is continuous, without a clearance teleport');
   assert.equal(blocked(person.g.position.x,person.g.position.z),false,'The actual doorway-to-control path clears all room furniture and partitions');
   assert.ok(person.g.position.x<1.3||person.g.position.z<1.39,'The route remains on the main-room side of the wet-room wall');
  }
  assert.ok(arrived,'Reach the decoration control and return through the normal doorway');
 }
 const ray=new THREE.Raycaster(new THREE.Vector3(2.4,1.44,.85),new THREE.Vector3(1,0,0));
 const visible=ray.intersectObjects(room.children,true).filter(h=>h.object.visible&&h.object.isMesh);
 assert.equal(visible[0]?.object.name,'Postcard sea','The postcard artwork is in front of its frame and faces the accessible main room');
});
