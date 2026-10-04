import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {installDOM} from './fixtures.mjs';
import {createBusinesses,BUSINESS_ALIASES} from '../src/world/businesses.js';
import {buildCompactShop} from '../src/world/interiors/compact-shops.js';
import {buildBusinessContent,BUSINESS_CONTENT} from '../src/world/interiors/business-content.js';
import {createTown} from '../src/world/town.js';
import {createNavigation} from '../src/people/navmesh.js';
import {assignWorkplaces} from '../src/people/workplaces.js';
import {createWorkplaceResidents} from '../src/people/workplace-residents.js';
import {createResidentLedger} from '../src/people/resident-personalities.js';
import {suppliedRoomBoundsBlocked} from '../src/world/supplied-rooms.js';
import {circleHitsRect,townBoundsBlocked,sweepFraction} from '../physics.js';
import {ITEMS} from '../content-data.js';
import {SAVE_KEY,readSave} from '../src/save.js';
import {STREET_CAST,STREET_CAST_NAMES} from '../src/people/residents.js';

function town(){installDOM();const scene=new THREE.Scene(),sites=createBusinesses(),actions=[];
 const register=(o,label,fn,inside=false)=>{o.userData.hit={label,fn,inside};actions.push(o);};
 const world=createTown({scene,sites,mobile:true,shadows:false,register,enter(){},onAction(){}});assignWorkplaces(world,sites);
 return {world,scene,sites,actions,register};
}
function roomFor(site,register){const room=new THREE.Group(),colliders=[];
 const layout=buildCompactShop({site,room,reg:register,collider:(x,z,w,d,height)=>colliders.push({x,z,w,d,height}),action(){},exit(){}});
 const blocked=(x,z,r=.32)=>suppliedRoomBoundsBlocked(layout,x,z,r)||colliders.some(c=>circleHitsRect(x,z,r,c));
 return {room,layout,colliders,blocked};
}



const awaiting=names=>{const missing=names.filter(n=>!STREET_CAST_NAMES.includes(n));return missing.length?'waiting for '+missing.join(', ')+' to return to the street cast':false;};
test('old saved visits merge without altering inventory, quests, content IDs or residents',()=>{
 const before={visited:['journal','frontrow','electronics','stepwise','form3d','career'],inventory:['Evening newspaper'],quest:3,kenjiEscort:'done',inspectedIds:['journal','stepwise'],residentLocations:{Reiko:{position:[0,0],indoors:'work'}}};
 const saved=readSave({getItem:key=>key===SAVE_KEY?JSON.stringify(before):null});
 assert.deepEqual(saved.visited,['frontrow','form3d','office']);for(const key of Object.keys(before).filter(k=>k!=='visited'))assert.deepEqual(saved[key],before[key]);
});
