import {preloadJapaneseTown} from './world/japanese-town.js';
import {preloadPark} from './world/park.js';
import {preloadSuppliedRooms} from './world/supplied-rooms.js';
import {preloadTeaHouse} from './world/tea-house.js';
import {preloadHarbourBlock} from './world/harbour-block.js';
import {preloadIzakaya} from './world/izakaya.js';
import {preloadVending} from './world/vending.js';
import {preloadCharacters} from './people/characters.js?konbini-1';
import {preloadStreetPlants} from './world/street-plants.js';
import {settleStartupAssets} from './startup-assets.js';
let loadingAssets=true;
const status=document.querySelector('#bootStatus');
// Bound the complete download AND texture decode, not just fetch. A stalled
// optional model must not prevent the existing procedural town from opening.
const result=await settleStartupAssets({
  characters:()=>preloadCharacters({onProgress:value=>{
    if(loadingAssets)status.textContent='LOADING RESIDENTS · '+Math.round(value*100)+'%';
  }}),
  park:preloadPark,
  vending:preloadVending,
  izakaya:preloadIzakaya,
  teaHouse:preloadTeaHouse,
  street:()=>preloadJapaneseTown().then(ok=>ok||preloadHarbourBlock()),
  plants:preloadStreetPlants,
  ramen:()=>preloadSuppliedRooms(['ramen-exterior'])
});
loadingAssets=false;
if(result.pending.length)console.warn('Starting with fallback models:',result.pending.join(', '));
status.textContent='BUILDING TOWN…';
await import('../touch-ui.js?ui=controls-3');
await import('./game.js?living-town=41');
// Browser automation is optional and must never hold the loading screen open.
void import('../webmcp.js').then(()=>import('../webmcp-characters.js')).catch(error=>console.warn('Town browser tools unavailable:',error));
