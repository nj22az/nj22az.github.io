import {preloadJapaneseTown} from './world/japanese-town.js';
import {preloadVending} from './world/vending.js';
import {settleStartupAssets} from './startup-assets.js';
// Only the shared street kit and the starting street's vending machine gate entry.
// District scenery and residents stream after the first playable frame.
const status=document.querySelector('#bootStatus');
status.textContent='OPENING SHOPPING STREET…';
const result=await settleStartupAssets({street:preloadJapaneseTown,vending:preloadVending},{timeoutMs:8000});
if(result.pending.length)console.warn('Starting with fallback models:',result.pending.join(', '));
status.textContent='BUILDING TOWN…';
await import('../touch-ui.js?ui=controls-3');
await import('./game.js?snappy=1');
void import('../webmcp.js').then(()=>import('../webmcp-characters.js')).catch(error=>console.warn('Town browser tools unavailable:',error));
