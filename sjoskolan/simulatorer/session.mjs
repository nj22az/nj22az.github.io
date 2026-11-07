import {initialState,measure,network} from './multimeter/model.mjs';
import {STATION_A} from './multimeter/lessons.mjs';
export const KEY='sjoskolan-maskinrum-multimeter-v1';
export function createSession(storage){
  let data={stage:0,done:false,records:[]},storageOK=Boolean(storage);
  try{const old=JSON.parse(storage?.getItem(KEY)||'null');if(old){data.stage=Number.isInteger(old.stage)?Math.max(0,Math.min(8,old.stage)):0;data.done=old.done===true;data.records=Array.isArray(old.records)?old.records.filter(r=>r&&typeof r.reading==='string').slice(-200):[];}}catch{storageOK=false;}
  let state={...initialState('station'),rig:6},free=false,passed=false;
  const save=()=>{try{storage?.setItem(KEY,JSON.stringify(data));}catch{storageOK=false;}};
  const reading=()=>measure(state);
  return {
    get state(){return {...state};},get progress(){return structuredClone(data);},get free(){return free;},get passed(){return passed;},get storageOK(){return storageOK;},
    get step(){return STATION_A.steps[data.stage];},get nodes(){return network(state).nodes;},reading,
    change(key,value){
      if(!['mode','jack','red','black','link','power','rig'].includes(key))return 'Okänd inställning.';
      if(key==='rig'&&(!Number.isInteger(value)||value<0||value>6))return 'Välj en giltig rigg.';
      if(['red','black'].includes(key)&&value!==null&&!network(state).nodes.includes(value))return 'Välj en märkt mätpunkt.';
      if(key==='mode'&&!['off','dc','ac','ohm','continuity','current'].includes(value))return 'Välj en mätfunktion.';
      if(key==='jack'&&!['v','ma','a'].includes(value))return 'Välj ett uttag.';
      if(['power','link'].includes(key)&&typeof value!=='boolean')return 'Ogiltigt läge.';
      if(state.power&&(['jack','link','rig'].includes(key)||(['red','black'].includes(key)&&state.jack!=='v')))return 'Bryt matningen innan du kopplar om.';
      if(key==='power'&&value&&state.trip)return 'Återställ mätarskyddet först.';
      state[key]=value;passed=false;
      const m=reading();if(m.trip){state.trip=m.trip;state.power=false;if(m.trip==='fuse')state.fuse=true;return m.detail;}
      return '';
    },
    check(){
      const m=reading();if(!STATION_A.steps[data.stage].test(state,m))return false;
      if(!passed){data.records.push({time:new Date().toISOString(),step:data.stage+1,rig:state.rig,reading:`${m.text} ${m.unit}`,red:state.red,black:state.black,mode:state.mode});data.records=data.records.slice(-200);}
      passed=true;if(data.stage===8)data.done=true;save();return true;
    },
    next(){if(!passed||data.stage===8)return false;data.stage++;passed=false;save();return true;},
    setFree(value){free=Boolean(value);passed=false;},
    restart(){data.stage=0;data.done=false;passed=false;state={...initialState('station'),rig:state.rig};save();},
    resetProtection(){if(state.power||state.red||state.black)return 'Bryt matningen och lossa båda spetsarna först.';state.trip=null;state.fuse=false;return '';},
  };
}
