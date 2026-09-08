// One boot path: settle local character loading before constructing the town.
import {preloadCharacters} from './people/characters.js';
await preloadCharacters({onProgress:value=>{document.querySelector('#bootStatus').textContent='OPENING · '+Math.round(value*100)+'%';}});
await import('../touch-ui.js');
await import('./game.js');
await import('../webmcp.js');
await import('../webmcp-characters.js');
