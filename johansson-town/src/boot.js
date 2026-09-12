import {preloadDiningStreet} from './world/dining-street.js';
import {preloadVending} from './world/vending.js';
import {preloadSakuraBench} from './world/sakura-bench.js';
import {preloadCharacter} from './people/characters.js?snappy=1';
import {settleStartupAssets} from './startup-assets.js';
// The retained alley replaces the unused legacy shop kit in the entry gate.
// District scenery and residents stream after the first playable frame.
const status=document.querySelector('#bootStatus');
const startup=window.__JOHANSSON_STARTUP__;if(startup){startup.codeMs=performance.now()-startup.startedAt;startup.stage='street-model';}
// Start the retained shopkeeper during the existing entry gate, without extending it.
void preloadCharacter('Yuri');
status.textContent='LOADING STREET MODEL…';
const result=await settleStartupAssets({street:preloadDiningStreet,vending:preloadVending,bench:preloadSakuraBench},{timeoutMs:3000});
if(result.pending.length)console.warn('Starting with fallback models:',result.pending.join(', '));
status.textContent='BUILDING TOWN…';
if(startup){startup.modelsMs=performance.now()-startup.startedAt-startup.codeMs;startup.stage='building';}
await import('../touch-ui.js?ui=controls-3');
await import('./game.js?snappy=1');
void import('../webmcp.js').then(()=>import('../webmcp-characters.js')).catch(error=>console.warn('Town browser tools unavailable:',error));
