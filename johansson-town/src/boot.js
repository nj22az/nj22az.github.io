import {installIconControls} from './ui/icon-controls.js';
// Benches and vending machines already have usable local stand-ins and hydrate
// through the detail stream. Their downloads must not gate the first town frame.
const status=document.querySelector('#bootStatus');
const startup=window.__JOHANSSON_STARTUP__;if(startup){startup.codeMs=performance.now()-startup.startedAt;startup.modelsMs=0;startup.stage='building';}
status.textContent='Building the town…';
// One frame for the status to be painted (or a moment, in a tab in the background): the town's build holds the page.
await new Promise(resolve=>{requestAnimationFrame(()=>setTimeout(resolve,0));setTimeout(resolve,120);});
// The hats people wear from World's catalogue (the Seagulls cap) are fetched alongside the code and are in hand before the
// town's people are built, so nobody starts in the stand-in (src/catalog/hat-models.js; a failure leaves the stand-in).
const hatModels=import('./catalog/hat-models.js').then(m=>m.loadHatModels({timeout:8000})).catch(error=>{console.warn('Hat models unavailable:',error);return false;});
await import('../touch-ui.js?ui=controls-3');
await hatModels;
await import('./game.js?snappy=1');
void import('../webmcp.js').then(()=>import('../webmcp-characters.js')).catch(error=>console.warn('Town browser tools unavailable:',error));

installIconControls();
