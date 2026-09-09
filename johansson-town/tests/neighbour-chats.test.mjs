import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {PROFILES} from '../src/people/profiles.js';
import {createNeighbourChats,clearChatLine,createChatBubble} from '../src/people/neighbour-chats.js';
import {installDOM} from './fixtures.mjs';
function setup(names=['Kenji','Tetsuo'],options={}){
 const scene=new THREE.Scene(),world={people:names.map((name,i)=>{const profile=PROFILES.find(p=>p.name===name),g=new THREE.Group();g.userData.name=name;g.position.set(i*1.5,0,-4);scene.add(g);return {g,profile};})};
 return {scene,world,chats:createNeighbourChats({world,observer:()=>new THREE.Vector3(),...options})};
}
test('nearby friends take turns, face each other, then release their schedules and cool down',()=>{
 const {world,chats}=setup();const before=world.people.map(p=>p.g.position.clone());chats.update(2,1002);
 assert.ok(chats.current);assert.match(chats.current.text,/radio/);assert.equal(chats.current.speaker.profile.name,'Kenji');
 assert.equal(world.people[0].g.userData.chat.speaking,true);assert.equal(world.people[1].g.userData.chat.speaking,false);
 chats.update(4.1,1006);assert.equal(chats.current.speaker.profile.name,'Tetsuo');assert.match(chats.current.text,/music/);
 world.people.forEach((p,i)=>assert.ok(p.g.position.equals(before[i]),'Ambient gestures never move actors towards the player'));
 chats.update(8,1014);assert.equal(chats.current,null);for(const p of world.people){assert.equal(p.g.userData.chatHold,undefined);assert.equal(p.g.userData.chat,undefined);}
 chats.update(10,1024);assert.equal(chats.current,null,'No immediate repeated exchange');
});
test('walls, hidden parents, distance and escort quests prevent chats; closing cancels them',()=>{
 const a=new THREE.Vector3(0,1.5,0),b=new THREE.Vector3(3,1.5,0);
 assert.equal(clearChatLine(a,b,[{x:1.5,z:0,w:.2,d:4,height:3}]),false);
 assert.equal(clearChatLine(a,b,[{x:1.5,z:0,w:.2,d:4,height:1}]),true,'Conversation can pass above a low table');
 const wall=setup(undefined,{blocked:()=>true});wall.chats.update(2,1002);assert.equal(wall.chats.current,null);
 const hidden=setup();hidden.scene.visible=false;hidden.chats.update(2,1002);assert.equal(hidden.chats.current,null);
 const far=setup();far.world.people[1].g.position.x=8;far.chats.update(2,1002);assert.equal(far.chats.current,null);
 const escort=setup(undefined,{state:()=>({kenjiEscort:'walking'})});escort.chats.update(2,1002);assert.equal(escort.chats.current,null);
 const {world,chats}=setup(['Nao','Masaru']);for(const p of world.people){p.g.userData.inIzakaya=true;p.g.userData.indoors='izakaya';p.g.userData.seatHeight=.71;p.g.rotation.y=.6;}
 chats.update(2,1559);assert.ok(chats.current);chats.update(.1,1560);assert.equal(chats.current,null,'Masaru leaves at the end of supper');
 for(const p of world.people){assert.equal(p.g.rotation.y,.6,'Do not rotate seated bodies off the furniture');assert.equal(p.g.userData.chatHold,undefined);}
});
test('player intervention and streaming cancel an exchange without stale talking flags',()=>{
 const {world,chats}=setup();chats.update(2,1002);world.people[0].g.userData.facePlayerUntil=performance.now()+1000;chats.update(.1,1002);assert.equal(chats.current,null);
 for(const p of world.people)assert.equal(p.g.userData.chat,undefined);
 const next=setup();next.chats.update(2,1002);next.world.people[1].g.visible=false;next.chats.update(.1,1002);assert.equal(next.chats.current,null);
});
test('ambient bubble follows its speaker and hides behind walls or off screen',()=>{
 installDOM();const camera=new THREE.PerspectiveCamera(65,1,0.1,50);camera.position.set(0,1.7,0);camera.updateMatrixWorld(true);
 const canvas={getBoundingClientRect:()=>({left:0,top:0,width:800,height:800})};const {chats}=setup();chats.update(2,1002);
 let occluded=false;const ui=createChatBubble({camera,canvas,target:g=>g.position.clone().add(new THREE.Vector3(0,1.4,0)),blocked:()=>occluded});
 const bubble=document.body.lastChild;ui.render(chats.current);assert.equal(bubble.hidden,false);assert.equal(bubble.firstChild.textContent,'Kenji');
 occluded=true;ui.render(chats.current);assert.equal(bubble.hidden,true);occluded=false;camera.rotation.y=Math.PI;camera.updateMatrixWorld(true);ui.render(chats.current);assert.equal(bubble.hidden,true);
 ui.hide();assert.equal(bubble.hidden,true);
});
