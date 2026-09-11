import {preloadJapaneseTown} from './world/japanese-town.js';
import {preloadPark} from './world/park.js';
import {preloadSuppliedRooms} from './world/supplied-rooms.js';
import {preloadTeaHouse} from './world/tea-house.js';
import {preloadHarbourBlock} from './world/harbour-block.js';
import {preloadIzakaya} from './world/izakaya.js';
import {preloadVending} from './world/vending.js';
// One boot path: settle local character loading before constructing the town.
import {preloadCharacters} from './people/characters.js?konbini-1';
const charactersReady=preloadCharacters({onProgress:value=>{document.querySelector('#bootStatus').textContent='OPENING · '+Math.round(value*100)+'%';}});
const {preloadStreetPlants}=await import('./world/street-plants.js');
// Inakaya is shared by street and ramen room; other supplied interiors load on entry.
await Promise.all([charactersReady,preloadPark(),preloadVending(),preloadIzakaya(),preloadTeaHouse(),preloadJapaneseTown().then(ok=>ok||preloadHarbourBlock()),preloadStreetPlants(),preloadSuppliedRooms(['ramen-exterior'])]);
await import('../touch-ui.js?ui=controls-3');
await import('./game.js?living-town=40');
await import('../webmcp.js');
await import('../webmcp-characters.js');
