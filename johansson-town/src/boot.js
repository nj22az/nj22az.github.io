import {preloadFullTown} from './world/full-town.js';
import {preloadJapaneseTown} from './world/japanese-town.js';
import {preloadPark} from './world/park.js';
import {preloadSuppliedRooms} from './world/supplied-rooms.js';
import {preloadTeaHouse} from './world/tea-house.js';
import {preloadHarbourBlock} from './world/harbour-block.js';
import {preloadIzakaya} from './world/izakaya.js';
import {preloadVending} from './world/vending.js';
import {preloadYuriHome} from './world/yuri-home.js';
// One boot path: settle local character loading before constructing the town.
import {preloadCharacters} from './people/characters.js?vroid-3';
await preloadCharacters({onProgress:value=>{document.querySelector('#bootStatus').textContent='OPENING · '+Math.round(value*100)+'%';}});
const {preloadStreetPlants}=await import('./world/street-plants.js');
await Promise.all([preloadPark(),preloadVending(),preloadIzakaya(),preloadTeaHouse(),preloadYuriHome(),preloadFullTown().then(ok=>ok||preloadJapaneseTown().then(ok=>ok||preloadHarbourBlock())),preloadStreetPlants(),preloadSuppliedRooms()]);
await import('../touch-ui.js?ui=controls-3');
await import('./game.js?living-town=30');
await import('../webmcp.js');
await import('../webmcp-characters.js');
