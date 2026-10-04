import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {buildMayorHome,buildMayorOffice} from '../src/world/interiors/town-hall.js';
import {createHomeCustomization} from '../src/world/interiors/home-customization.js';
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
 const shelf=new THREE.Box3().setFromObject(room.getObjectByName('Earned keepsake shelf'));assert.ok(shelf.min.x>1.1&&shelf.max.z<2.8,'Decorations remain above the side wall shelf, clear of the central exit');
});
