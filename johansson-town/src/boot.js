import {preloadSuppliedRooms} from './world/supplied-rooms.js';
import {preloadTeaHouse} from './world/tea-house.js';
import {preloadHarbourBlock} from './world/harbour-block.js';
import {preloadIzakaya} from './world/izakaya.js';
import {preloadVending} from './world/vending.js';
// One boot path: settle local character loading before constructing the town.
import {preloadCharacters} from './people/characters.js?vroid-2';
await preloadCharacters({onProgress:value=>{document.querySelector('#bootStatus').textContent='OPENING · '+Math.round(value*100)+'%';}});
const {preloadStreetPlants}=await import('./world/street-plants.js');
await Promise.all([preloadVending(),preloadIzakaya(),preloadTeaHouse(),preloadHarbourBlock(),preloadStreetPlants(),preloadSuppliedRooms()]);
await import('../touch-ui.js?ui=controls-3');
await import('./game.js?living-town=14');
await import('../webmcp.js');
await import('../webmcp-characters.js');
