export const GRAPHICS_ERROR='Unable to start the graphics engine.';
export const START_ERROR='Johansson Town could not start. Reload and try again.';
export const LOADING_LIMIT_MS=90000;
export const WATCHDOG_MS=25000;

export function getBootState(){
  return globalThis.__JOHANSSON_BOOT__||(globalThis.__JOHANSSON_BOOT__={
    phase:'idle',detail:'',kind:null,error:null,startedAt:0,updatedAt:0,progress:0
  });
}

export function setBootPhase(phase,detail='',kind=null){
  const state=getBootState();
  state.phase=phase;
  state.detail=detail||'';
  state.updatedAt=Date.now();
  if(!state.startedAt)state.startedAt=state.updatedAt;
  if(kind)state.kind=kind;
  if(phase==='failed'&&kind)state.kind=kind;
  return state;
}

function phaseLabel(boot){
  return [boot?.phase,boot?.detail].filter(Boolean).join(' · ')||'assets';
}

export function watchdogDecision({running,boot,elapsed=0,limitMs=LOADING_LIMIT_MS}){
  if(running)return {action:'ready'};
  if(boot?.kind==='graphics')return {action:'fatal',message:GRAPHICS_ERROR,status:'GRAPHICS FAILED'};
  if(boot?.kind==='import'||boot?.phase==='failed')return {action:'fatal',message:START_ERROR,status:'START FAILED'};
  const label=phaseLabel(boot);
  if(elapsed>=limitMs)return {
    action:'fatal',
    message:`Johansson Town is still waiting for ${label}. This is a loading timeout, not a graphics-engine failure.`,
    status:'STARTUP TOOK TOO LONG'
  };
  if(boot?.phase&&boot.phase!=='idle')return {
    action:'wait',
    message:`Still loading ${label}. This is not a graphics failure.`,
    status:'LOADING · '+label
  };
  return {action:'wait',message:'Still opening Johansson Town.',status:'OPENING…'};
}

export function isGraphicsFailure(error){
  return /WebGL|WebGLRenderer|GPU|graphics engine|GL context/i.test(String(error?.message||error||'')+' '+String(error?.name||''));
}

export function createLauncher({
  importBoot=()=>import('./boot.js?living-town=24'),
  watchdogMs=WATCHDOG_MS,
  limitMs=LOADING_LIMIT_MS,
  schedule=setTimeout,
  clearSchedule=clearTimeout,
  now=Date.now,
  isRunning=()=>globalThis.__JOHANSSON_RUNNING__===true,
  getBoot=getBootState,
}={}){
  return async function launch(ui){
    if(globalThis.__JOHANSSON_BOOTING__)return;
    globalThis.__JOHANSSON_BOOTING__=true;
    if(ui.enter)ui.enter.disabled=true;
    if(ui.status)ui.status.textContent='OPENING…';
    const state=getBoot();
    state.startedAt=now();
    state.updatedAt=state.startedAt;
    if(state.phase==='idle')state.phase='boot';
    const started=state.startedAt;
    let watchdog;
    const apply=()=>{
      if(isRunning()){
        ui.fatal?.classList.add('hidden');
        return 'ready';
      }
      const decision=watchdogDecision({running:false,boot:getBoot(),elapsed:now()-started,limitMs});
      if(ui.status)ui.status.textContent=decision.status;
      if(ui.fatalMessage)ui.fatalMessage.textContent=decision.message;
      if(decision.action==='fatal')ui.fatal?.classList.remove('hidden');
      return decision.action;
    };
    const tick=()=>{
      const action=apply();
      if(action==='wait')watchdog=schedule(tick,watchdogMs);
    };
    watchdog=schedule(tick,watchdogMs);
    try{
      await importBoot();
      if(watchdog!=null)clearSchedule(watchdog);
      globalThis.__JOHANSSON_RUNNING__=true;
      ui.fatal?.classList.add('hidden');
    }catch(err){
      if(watchdog!=null)clearSchedule(watchdog);
      console.error(err);
      const graphics=isGraphicsFailure(err);
      setBootPhase('failed',err?.message||'start failed',graphics?'graphics':'import');
      if(ui.status)ui.status.textContent=graphics?'GRAPHICS FAILED':'START FAILED';
      if(ui.fatalMessage)ui.fatalMessage.textContent=graphics?GRAPHICS_ERROR:START_ERROR;
      ui.fatal?.classList.remove('hidden');
      globalThis.__JOHANSSON_BOOTING__=false;
      if(ui.enter)ui.enter.disabled=false;
    }
  };
}
