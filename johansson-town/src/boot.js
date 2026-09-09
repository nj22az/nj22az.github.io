import {setBootPhase,isGraphicsFailure} from './launch.js';

function status(text,phase,detail){
  setBootPhase(phase,detail||text);
  const el=document.querySelector('#bootStatus');
  if(el)el.textContent=text;
}

status('OPENING TOWN…','boot','Opening Johansson Town');

// Neighbours, plants and extra interiors have procedural fallbacks. They must
// not delay the first rendered frame or trip the launcher watchdog.
const charactersReady=import('./people/characters.js?vroid-3').then(({preloadCharacters})=>
  preloadCharacters({onProgress:(value,id)=>{
    if(window.__JOHANSSON_RUNNING__)return;
    const phase=window.__JOHANSSON_BOOT__?.phase;
    if(phase==='world'||phase==='graphics')return;
    status('NEIGHBOURS · '+Math.round(value*100)+'%','characters',id||'neighbours');
  }})
).catch(error=>{console.warn('Character preload failed',error);return {ready:0,total:0};});

status('LOADING THE NEIGHBOURHOOD…','world','Neighbourhood map');
const [
  {preloadFullTown},
  {preloadJapaneseTown},
  {preloadHarbourBlock},
  {preloadPark},
  {preloadVending},
  {preloadSuppliedRooms},
]=await Promise.all([
  import('./world/full-town.js'),
  import('./world/japanese-town.js'),
  import('./world/harbour-block.js'),
  import('./world/park.js'),
  import('./world/vending.js'),
  import('./world/supplied-rooms.js'),
]);
const extras=Promise.allSettled([
  charactersReady,
  import('./world/street-plants.js').then(({preloadStreetPlants})=>preloadStreetPlants()),
  import('./world/izakaya.js').then(({preloadIzakaya})=>preloadIzakaya()),
  import('./world/tea-house.js').then(({preloadTeaHouse})=>preloadTeaHouse()),
]);
await Promise.all([
  preloadPark(),
  preloadVending(),
  preloadSuppliedRooms(),
  preloadFullTown().then(ok=>ok||preloadJapaneseTown().then(ok=>ok||preloadHarbourBlock())),
]);

status('STARTING…','graphics','Starting the renderer');
await import('../touch-ui.js?ui=controls-3');
try{
  await import('./game.js?living-town=24');
}catch(error){
  setBootPhase('failed',error?.message||'start failed',isGraphicsFailure(error)?'graphics':'import');
  throw error;
}
await import('../webmcp.js');
await import('../webmcp-characters.js');
extras.catch(()=>{});
