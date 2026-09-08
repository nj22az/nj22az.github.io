import {preloadIzakaya} from './world/izakaya.js';
import {preloadVending} from './world/vending.js';
// One boot path: settle local character loading before constructing the town.
import {preloadCharacters} from './people/characters.js?yuri-greeting-1';
await preloadCharacters({onProgress:value=>{document.querySelector('#bootStatus').textContent='OPENING · '+Math.round(value*100)+'%';}});
await Promise.all([preloadVending(),preloadIzakaya()]);
await import('../touch-ui.js?ui=controls-3');
await import('./game.js?living-town=1');
await import('../webmcp.js');
await import('../webmcp-characters.js');
