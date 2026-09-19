// Benches and vending machines already have usable local stand-ins and hydrate
// through the detail stream. Their downloads must not gate the first town frame.
const status=document.querySelector('#bootStatus');
const startup=window.__JOHANSSON_STARTUP__;if(startup){startup.codeMs=performance.now()-startup.startedAt;startup.modelsMs=0;startup.stage='building';}
status.textContent='BUILDING TOWN…';
await import('../touch-ui.js?ui=controls-3');
await import('./game.js?snappy=1');
void import('../webmcp.js').then(()=>import('../webmcp-characters.js')).catch(error=>console.warn('Town browser tools unavailable:',error));
