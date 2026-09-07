// Johansson Town WebMCP surface — browser-native tools for AI agents.
// Current WebMCP draft: https://webmachinelearning.github.io/webmcp/
// Uses document.modelContext when available, with the older navigator.modelContext alias as fallback.
// The game remains fully playable without WebMCP.

const TOOL_PREFIX='johansson_';
const DESTINATIONS=Object.freeze({
  office:'The Office',
  frontrow:'Front-Row Books',
  form3d:'Form 3D Workshop',
  stepwise:'StepWise Instruments',
  journal:'The Journal Press',
  electronics:'Johansson Electronics',
  market:'Colonial Club Market',
  career:'Career Bureau'
});

const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const visible=el=>!!el&&!el.classList.contains('hidden');
const text=id=>(document.querySelector(id)?.textContent||'').trim();
const normal=s=>String(s||'').trim().toLowerCase().replace(/[^a-z0-9]+/g,' ');
const result=(ok,data={})=>JSON.stringify({ok,...data});

function gameReady(){return window.__JOHANSSON_RUNNING__===true&&visible(document.querySelector('#hud'));}
function activityOpen(){return visible(document.querySelector('#activity'));}
function directoryOpen(){return visible(document.querySelector('#directory'));}

function dispatchKey(code,type='keydown'){
  const keyMap={KeyW:'w',KeyA:'a',KeyS:'s',KeyD:'d',ShiftLeft:'Shift',Space:' ',KeyE:'e',KeyQ:'q',KeyB:'b',KeyV:'v',KeyN:'n'};
  const event=new KeyboardEvent(type,{code,key:keyMap[code]||'',bubbles:true,cancelable:true,repeat:false});
  document.dispatchEvent(event);
}

function actionButtons(){
  return [...document.querySelectorAll('#activityActions button:not(:disabled)')].filter(visible);
}

function getState(){
  const modal=activityOpen();
  const directory=directoryOpen();
  const buttons=modal?actionButtons().map((b,index)=>({index,label:(b.textContent||'').trim()})):[];
  const destinations=directory?[...document.querySelectorAll('#directoryGrid .dir-item')].map(b=>({id:b.dataset.id,label:(b.querySelector('b')?.textContent||b.textContent||'').trim()})):[];
  return {
    running:gameReady(),
    place:text('#place'),
    placeDetail:text('#placeSub'),
    time:text('#clock'),
    wallet:text('#wallet'),
    nearbyAction:text('#prompt'),
    subtitle:text('#subtitle'),
    activity:modal?{
      title:text('#activityTitle'),
      body:text('#activityBody'),
      actions:buttons
    }:null,
    directoryOpen:directory,
    directoryDestinations:destinations,
    knownDestinations:DESTINATIONS,
    controls:{jump:true,interact:true,move:true,look:true,directoryTravel:true,activityChoice:true},
    webmcp:window.__JOHANSSON_WEBMCP__||{status:'initialising'}
  };
}

async function move({direction,durationMs=700,run=false}={}){
  if(!gameReady())return result(false,{error:'Johansson Town is not running. Enter the town first.'});
  if(activityOpen()||directoryOpen())return result(false,{error:'Movement is blocked while a modal or directory is open.',state:getState()});
  const codes={forward:'KeyW',backward:'KeyS',left:'KeyA',right:'KeyD'};
  const code=codes[direction];
  if(!code)return result(false,{error:'direction must be forward, backward, left, or right'});
  const ms=Math.max(80,Math.min(2500,Number(durationMs)||700));
  if(run)dispatchKey('ShiftLeft','keydown');
  dispatchKey(code,'keydown');
  try{await sleep(ms);}finally{
    dispatchKey(code,'keyup');
    if(run)dispatchKey('ShiftLeft','keyup');
  }
  return result(true,{action:'move',direction,durationMs:ms,run:!!run,state:getState()});
}

async function look({direction,degrees=45}={}){
  if(!gameReady())return result(false,{error:'Johansson Town is not running.'});
  if(activityOpen()||directoryOpen())return result(false,{error:'Camera control is blocked while a modal or directory is open.',state:getState()});
  if(direction!=='left'&&direction!=='right')return result(false,{error:'direction must be left or right'});
  const deg=Math.max(5,Math.min(180,Number(degrees)||45));
  // The game already implements touch-look without pointer lock. Feed that same path
  // with a small synthetic touch-like event rather than reaching into private Three.js state.
  const id=91731,startX=Math.max(innerWidth*.72,innerWidth-120),startY=innerHeight*.46;
  const px=(deg*Math.PI/180)/.005*(direction==='right'?1:-1);
  const make=(type,x)=>{
    const e=new Event(type,{bubbles:true,cancelable:true});
    Object.defineProperty(e,'changedTouches',{value:[{identifier:id,clientX:x,clientY:startY}],configurable:true});
    return e;
  };
  const canvas=document.querySelector('#game');
  canvas?.dispatchEvent(make('touchstart',startX));
  canvas?.dispatchEvent(make('touchmove',startX+px));
  canvas?.dispatchEvent(make('touchend',startX+px));
  await sleep(30);
  return result(true,{action:'look',direction,degrees:deg,state:getState()});
}

async function jump(){
  if(!gameReady())return result(false,{error:'Johansson Town is not running.'});
  if(activityOpen()||directoryOpen())return result(false,{error:'Jump is blocked while a modal or directory is open.'});
  let accepted=false;
  if(typeof window.__JOHANSSON_JUMP__==='function')accepted=window.__JOHANSSON_JUMP__()===true;
  else{dispatchKey('Space','keydown');dispatchKey('Space','keyup');accepted=true;}
  return result(accepted,{action:'jump',accepted,state:getState()});
}

async function interact(){
  if(!gameReady())return result(false,{error:'Johansson Town is not running.'});
  if(activityOpen())return result(false,{error:'An activity is already open. Use johansson_choose_action instead.',state:getState()});
  if(directoryOpen())return result(false,{error:'The directory is open. Travel or close it first.',state:getState()});
  const before=text('#prompt');
  dispatchKey('KeyE','keydown');dispatchKey('KeyE','keyup');
  await sleep(80);
  return result(true,{action:'interact',promptBefore:before||null,state:getState()});
}

async function travel({destination}={}){
  if(!gameReady())return result(false,{error:'Johansson Town is not running.'});
  if(activityOpen())return result(false,{error:'Close the current activity before using the directory.',state:getState()});
  const wanted=normal(destination);
  const id=Object.keys(DESTINATIONS).find(key=>normal(key)===wanted||normal(DESTINATIONS[key])===wanted||normal(DESTINATIONS[key]).includes(wanted));
  if(!id)return result(false,{error:'Unknown destination.',destinations:DESTINATIONS});
  if(!directoryOpen())document.querySelector('#directoryButton')?.click();
  await sleep(20);
  const button=document.querySelector(`#directoryGrid .dir-item[data-id="${CSS.escape(id)}"]`);
  if(!button)return result(false,{error:'Destination button is unavailable.',destination:id,state:getState()});
  button.click();
  await sleep(80);
  return result(true,{action:'directory_travel',destination:id,label:DESTINATIONS[id],state:getState()});
}

async function chooseAction({label,index}={}){
  if(!activityOpen())return result(false,{error:'No activity dialog is open.',state:getState()});
  const buttons=actionButtons();
  let button=null;
  if(Number.isInteger(index)&&index>=0&&index<buttons.length)button=buttons[index];
  if(!button&&label){const wanted=normal(label);button=buttons.find(b=>normal(b.textContent)===wanted)||buttons.find(b=>normal(b.textContent).includes(wanted));}
  if(!button)return result(false,{error:'No matching enabled action.',actions:buttons.map((b,i)=>({index:i,label:(b.textContent||'').trim()}))});
  const chosen=(button.textContent||'').trim();
  button.click();
  await sleep(80);
  return result(true,{action:'choose_action',chosen,state:getState()});
}

async function ui({control}={}){
  if(!gameReady())return result(false,{error:'Johansson Town is not running.'});
  const map={
    notebook:'#notebookButton',camera:'#cameraButton',time:'#timeButton',weather:'#weatherButton',sound:'#soundButton',directory:'#directoryButton',close_activity:'#closeActivity',close_directory:'#closeDirectory'
  };
  const selector=map[control];
  if(!selector)return result(false,{error:'Unknown control.',controls:Object.keys(map)});
  const button=document.querySelector(selector);
  if(!button)return result(false,{error:'Control is unavailable.',control});
  button.click();
  await sleep(60);
  return result(true,{action:'ui',control,state:getState()});
}

const API=Object.freeze({getState,move,look,jump,interact,travel,chooseAction,ui});
window.__JOHANSSON_AGENT_API__=API;
window.__JOHANSSON_WEBMCP__={status:'waiting-for-model-context',registered:0,api:'2026-draft',tools:[]};

const tools=[
  {
    name:TOOL_PREFIX+'get_state',
    description:'Read the current Johansson Town game state: location, clock, wallet, nearby interaction prompt, open activity and its available buttons. This does not change the game.',
    inputSchema:{type:'object',properties:{},additionalProperties:false},
    annotations:{readOnlyHint:true,untrustedContentHint:false},
    execute:async()=>result(true,{state:getState()})
  },
  {
    name:TOOL_PREFIX+'move',
    description:'Move Johansson using the same movement controls as the player. Direction is camera-relative. Duration is bounded to 80–2500 ms. Set run=true for faster movement.',
    inputSchema:{type:'object',properties:{direction:{type:'string',enum:['forward','backward','left','right']},durationMs:{type:'integer',minimum:80,maximum:2500},run:{type:'boolean'}},required:['direction'],additionalProperties:false},
    annotations:{readOnlyHint:false,untrustedContentHint:false},
    execute:move
  },
  {
    name:TOOL_PREFIX+'look',
    description:'Turn Johansson Town camera left or right by a bounded number of degrees, using the game touch-look path.',
    inputSchema:{type:'object',properties:{direction:{type:'string',enum:['left','right']},degrees:{type:'number',minimum:5,maximum:180}},required:['direction'],additionalProperties:false},
    annotations:{readOnlyHint:false,untrustedContentHint:false},
    execute:look
  },
  {
    name:TOOL_PREFIX+'jump',
    description:'Make Johansson jump once using the game jump controller. A second jump is rejected while already airborne.',
    inputSchema:{type:'object',properties:{},additionalProperties:false},
    annotations:{readOnlyHint:false,untrustedContentHint:false},
    execute:jump
  },
  {
    name:TOOL_PREFIX+'interact',
    description:'Use the current nearby ACTION/TALK/ENTER interaction in Johansson Town. Read johansson_get_state first to see the nearby prompt.',
    inputSchema:{type:'object',properties:{},additionalProperties:false},
    annotations:{readOnlyHint:false,untrustedContentHint:false},
    execute:interact
  },
  {
    name:TOOL_PREFIX+'travel',
    description:'Use the in-game town directory to travel Johansson to a named shop or bureau. This uses the same directory destination buttons available to the player.',
    inputSchema:{type:'object',properties:{destination:{type:'string',description:'Destination id or display name, such as frontrow or Front-Row Books.'}},required:['destination'],additionalProperties:false},
    annotations:{readOnlyHint:false,untrustedContentHint:false},
    execute:travel
  },
  {
    name:TOOL_PREFIX+'choose_action',
    description:'Choose one enabled button in the currently open activity/dialogue. This can spend in-game yen or advance quests, exactly like the visible button. Select by label or zero-based index.',
    inputSchema:{type:'object',properties:{label:{type:'string'},index:{type:'integer',minimum:0}},additionalProperties:false},
    annotations:{readOnlyHint:false,untrustedContentHint:false},
    execute:chooseAction
  },
  {
    name:TOOL_PREFIX+'ui',
    description:'Operate a Johansson Town HUD control: notebook, camera, time, weather, sound, directory, close_activity, or close_directory.',
    inputSchema:{type:'object',properties:{control:{type:'string',enum:['notebook','camera','time','weather','sound','directory','close_activity','close_directory']}},required:['control'],additionalProperties:false},
    annotations:{readOnlyHint:false,untrustedContentHint:false},
    execute:ui
  }
];

async function registerWebMCP(){
  const mc=document.modelContext||navigator.modelContext;
  if(!mc||typeof mc.registerTool!=='function')return false;
  try{window.__JOHANSSON_WEBMCP_ABORT__?.abort?.();}catch{}
  const controller=new AbortController();
  window.__JOHANSSON_WEBMCP_ABORT__=controller;
  let registered=0;
  for(const tool of tools){
    try{
      await Promise.resolve(mc.registerTool(tool,{signal:controller.signal}));
      registered++;
    }catch(error){
      console.warn(`WebMCP tool ${tool.name} could not register`,error);
    }
  }
  window.__JOHANSSON_WEBMCP__={
    status:registered===tools.length?'ready':'partial',
    registered,
    api:document.modelContext?'document.modelContext':'navigator.modelContext',
    tools:tools.slice(0,registered).map(t=>t.name)
  };
  document.documentElement.dataset.webmcp=registered?'ready':'partial';
  console.info(`Johansson Town WebMCP: ${registered}/${tools.length} tools registered`,window.__JOHANSSON_WEBMCP__);
  return registered>0;
}

// Native implementations expose modelContext synchronously. Some extensions/polyfills
// inject it shortly after page load, so retry briefly without making it a game dependency.
(async()=>{
  for(let attempt=0;attempt<20;attempt++){
    if(await registerWebMCP())return;
    await sleep(500);
  }
  window.__JOHANSSON_WEBMCP__={status:'unsupported',registered:0,api:null,tools:[]};
  document.documentElement.dataset.webmcp='unsupported';
  console.info('Johansson Town: WebMCP is not available in this browser. Human controls remain unchanged; window.__JOHANSSON_AGENT_API__ is available to compatible browser-agent bridges.');
})();
