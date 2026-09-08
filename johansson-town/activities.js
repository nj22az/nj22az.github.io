import {townAudio} from './src/audio/town-audio.js';
import {DIALOGUE} from './src/people/schedules.js';
import {JOURNAL} from './content-data.js';
import {SAVE_KEY,readSave} from './src/save.js';

export function createActivities({say,onWeather,onTime,onCamera,getMinutes=()=>1002,onPhone=()=>false,onEscort=()=>{},onPurchase=()=>false,onSeat=()=>false,onDrink=()=>false,onMap=()=>null}) {
  const $=s=>document.querySelector(s);
  const defaults={yen:1200,inventory:[],visited:[],quest:0,fish:0,best:0,weather:false,sound:true,operated:[],inspectedIds:[],notes:['14 September 1988. Last harbour bus: 18:20.'],shrineIntent:null,kenjiEscort:false};
  let state={...defaults},timer=null,modalOpen=false,previousFocus=null,radioStation=0;

  try {
    const saved=readSave(localStorage);
    if(saved&&typeof saved==='object'){
      for(const k of ['yen','quest','fish','best'])if(Number.isFinite(saved[k])&&saved[k]>=0)state[k]=saved[k];
      state.yen=Math.min(state.yen,999999);state.quest=Math.min(state.quest,3);
      for(const k of ['inventory','visited','operated','inspectedIds','notes'])if(Array.isArray(saved[k]))state[k]=saved[k].filter(x=>typeof x==='string').slice(0,100);
      state.notes=state.notes.filter(n=>!n.includes('Website is the town')&&!/https?:/.test(n));state.minutes=Number.isFinite(saved.minutes)?saved.minutes:1002;state.sound=saved.sound!==false;state.bookRescue=saved.bookRescue||0;state.radioStation=Number.isInteger(saved.radioStation)?Math.max(0,Math.min(2,saved.radioStation)):0;state.inventory=state.inventory.map(i=>i==='Mackerel'?'Sea bream':i);state.weather=saved.weather===true;state.shrineIntent=['Book','Work','Home'].includes(saved.shrineIntent)?saved.shrineIntent:null;state.kenjiEscort=[true,'walking','done'].includes(saved.kenjiEscort)?saved.kenjiEscort:false;
    }
  } catch {}

  const modal=$('#activity'),heading=$('#activityTitle'),body=$('#activityBody'),actions=$('#activityActions');

  function save(){
    try {state.minutes=getMinutes();localStorage.setItem(SAVE_KEY,JSON.stringify(state));$('#saveState').textContent='PROGRESS SAVED';}
    catch {$('#saveState').textContent='SAVING UNAVAILABLE';}
    $('#wallet').textContent=`¥${state.yen.toLocaleString()}`;
  }
  function close(){townAudio.stopSpeech();clearInterval(timer);timer=null;modalOpen=false;modal.classList.add('hidden');previousFocus?.focus?.();}
  function show(title,text,buttons=[]){
    townAudio.stopSpeech();clearInterval(timer);timer=null;if(!modalOpen)previousFocus=document.activeElement;modalOpen=true;document.exitPointerLock?.();
    heading.textContent=title;body.classList.remove('signal');body.replaceChildren();
    const p=document.createElement('p');p.textContent=text;body.append(p);actions.replaceChildren();
    buttons.forEach(([label,fn,disabled=false])=>{const b=document.createElement('button');b.textContent=label;b.disabled=disabled;b.onclick=fn;actions.append(b);});
    modal.classList.remove('hidden');$('#closeActivity').focus();
  }
  function addItem(item){if(['Green tea','Canned coffee','Sea bream','Ice'].includes(item)||!state.inventory.includes(item))state.inventory.push(item);save();}
  function spend(n){if(state.yen<n){say('You do not have enough yen.');return false;}state.yen-=n;save();return true;}
  function receipt(title,text){show(title,text,[['Back',close]]);}
  function inventory(){
    const quest=['Speak to Aiko beside the bookshop.','Find Tama, Aiko’s cat, near the ramen stall. A fish might help.','Return to Aiko with news of Tama.','Tama is safely home. Aiko has paid you ¥500.'][state.quest];
    show('Field book',`${state.notes.join('\n')}\n\nShrine intention: ${state.shrineIntent||'Unset'}\n\n${quest}\n\nCash: ¥${state.yen} · Fish caught: ${state.fish}\nBag: ${state.inventory.length?state.inventory.join(', '):'Empty'}\nPlaces visited: ${state.visited.length}\nMachines tried: ${state.operated.length}\nStar Port best: ${state.best}`,[...['Canned coffee','Green tea'].filter(i=>state.inventory.includes(i)).map(i=>['Drink '+i,()=>{close();onDrink(i);}]),['Back to town',close]]);
    const map=onMap();if(map)body.append(map);
  }


  function note(text){if(!state.notes.includes(text)){state.notes.push(text);state.notes=state.notes.slice(-100);save();}}
  function inspectItem(item){if(!state.inspectedIds.includes(item.id)){state.inspectedIds.push(item.id);note(item.note);save();}}
  function openURL(){say('The ledger is kept here in town.');}

  function quietRead(){if(!state.inspectedIds.includes('book')){receipt('Window chair','Lift The Venture from the display first. Aiko has kept your place.');return;}let left=20;show('Quiet reading','Rain on the shutters. The street can wait.',[['Put down the book',close]]);timer=setInterval(()=>{left--;body.firstChild.textContent='A page, a breath, the harbour. '+left+' seconds.';if(left<=0){onTime(10);note('Read by the window. Ten town minutes passed.');receipt('Window chair','The bookmark is a ferry ticket. Returned it to the same page.');}},1000);}
  const histories=new Map();
  function resident(name){
    const all=DIALOGUE[name];if(!all){legacyResident(name);return;}
    const history=histories.get(name)||[];
    const available=all.filter(([id,line,requires])=>(!requires||state.inspectedIds.includes(requires))&&!history.includes(id));
    // Newly discovered callbacks take precedence, then cycle through authored topics.
    const row=available.find(r=>r[2])||available[0]||all[0];history.push(row[0]);histories.set(name,history.slice(-3));
    let text=row[1];
    if(name==='Mrs Sato'&&state.shrineIntent&&row[0]==='home')text='You chose '+state.shrineIntent+'. Good. Now do one small thing about it.';
    const buttons=[['Another subject',()=>resident(name)]];
    if(name==='Aiko')buttons.push(['About Tama',()=>legacyResident(name)]);
    if(name==='Kenji'&&state.kenjiEscort&&state.kenjiEscort!=='done')buttons.push(['Show me the workshop',()=>{onEscort();close();say('Kenji: Keep up. These are the accurate directions.',4);}]);
    if(name==='Mrs Sato')buttons.push(['Umeboshi rice ball · ¥80',()=>{if(spend(80)){state.sprintUntil=performance.now()+20000;note('Umeboshi rice ball. Ready to move.');close();}}]);
    if(name==='Cold-storage kid')buttons.push(['Ice · ¥20',()=>{if(spend(20)){addItem('Ice');receipt(name,'Keep it out of the sun. That is the entire manual.');}}]);
    if(name==='Harbour master')buttons.push(['Sell a catch',()=>legacyResident(name)]);
    buttons.push(['Goodbye',close]);show(name,text,buttons);if(text===row[1]&&row[3])townAudio.speak(row[3]);
  }

  function vending(){show('自動販売機 · Vending machine','The compressor hums. A can drops into the tray when you make a purchase.',[['Green tea · ¥120',()=>buyDrink('Green tea')],['Canned coffee · ¥120',()=>buyDrink('Canned coffee')],['Leave',close]]);}
  function buyDrink(name){if(!spend(120))return;addItem(name);townAudio.play('clunk',.7);close();if(!onPurchase(name))receipt('Thank you',`${name} is in your bag.`);}

  function legacyResident(name){
    if(name==='Aiko'){
      if(state.quest===0){show('Aiko · Bookshop assistant','My ginger cat Tama has wandered off again. He likes the warm corner by the ramen stall. Would you find him?',[['I will look for Tama',()=>{state.quest=1;save();receipt('A note in your notebook','Look near the ramen stall. If Tama is hungry, try the fishing pier.');}],['Later',close]]);}
      else if(state.quest===2){state.quest=3;state.yen+=500;save();receipt('Aiko','Tama followed you home! Thank you. Please take ¥500 for your trouble.');}
      else receipt('Aiko',state.quest===3?'Tama is sleeping upstairs. The harbour is lovely at sunset.':'Try the ramen stall further down the street. Tama cannot resist fresh fish.');
      return;
    }
    const lines={
      Kenji:'The Star Port cabinet is outside the workshop. Stop the signal in the illuminated zone three times to win. It costs ¥100; a perfect round pays ¥250.',
      'Mrs Sato':'Ramen is ¥300 today. The payphone near the bookshop still works, and the harbour bus leaves at 18:20.',
      'Harbour master':'There are sea bream off the pier. Cast a line and wait until the float dips. Reel in while the signal reads BITE. You can sell your catch here.'
    };
    show(name,lines[name]||'The resident nods politely.',[
      ...(name==='Harbour master'?[['Sell a fish · +¥180',()=>{const i=state.inventory.indexOf('Sea bream');if(i<0){say('Catch a fish at the pier first.');return;}state.inventory.splice(i,1);state.yen+=180;save();receipt('Harbour master','A fine sea bream. Here is ¥180.');},!state.inventory.includes('Sea bream')]]:[]),
      ['Goodbye',close]
    ]);
  }

  function cat(){
    note('Tama approved this route');
    if(state.quest===1){
      if(state.inventory.includes('Sea bream'))show('Tama','The ginger cat watches the fish in your bag.',[['Give Tama a fish',()=>{state.inventory.splice(state.inventory.indexOf('Sea bream'),1);state.quest=2;save();receipt('Tama','Tama eats the fish and trots towards Aiko’s shop. Tell Aiko where he is.');}],['Leave',close]]);
      else receipt('Tama','The ginger cat chirps, but keeps his distance. He seems hungry. Try fishing at the harbour.');
    } else receipt('Ginger cat',state.quest===3?'A neighbourhood cat stretches in the afternoon warmth.':'A ginger cat is warming himself beside the ramen stall.');
  }

  function fishing(){
    show('Harbour fishing','Cast a line. Wait for BITE, then reel in before the fish gets away.',[
      ['Cast line',()=>{let elapsed=0,biteAt=2+Math.random()*2.5,caught=false;show('Harbour fishing','Waiting for a bite…',[
        ['Reel in',()=>{if(caught)return;caught=true;if(elapsed>=biteAt&&elapsed<biteAt+1.35){state.fish++;if(state.fish===2){addItem('Waterlogged page · Kings of Ben…');note('Recovered a Book Three fragment: Kings of Ben…');receipt('A waterlogged page','Only “Kings of Ben…” survives. Aiko will want this dried away from the stove.');return;}addItem('Sea bream');tone(880,.2);receipt('A sea bream!','A fresh sea bream is in your bag. Keep it, give it to Tama, or sell it to the harbour master.');}else receipt('The line is empty','You reeled in too soon. Watch for BITE.');}],
        ['Put away the rod',close]
      ]);timer=setInterval(()=>{elapsed+=.05;if(elapsed>=biteAt&&elapsed<biteAt+1.35){body.firstChild.textContent='BITE — REEL IN NOW';body.classList.add('signal');}if(elapsed>=biteAt+1.35){body.classList.remove('signal');receipt('The fish got away','Try again and reel in when BITE appears.');}},50);}],
      ['Leave',close]
    ]);
  }

  function arcade(){
    show('STAR PORT · 1988','Stop the moving signal inside the green zone. Three rounds. Entry ¥100; three hits pays ¥250.',[
      ['Insert ¥100',()=>{if(!spend(100))return;let round=0,hits=0,start=performance.now(),position=0;function next(){show(`STAR PORT · Round ${round+1}/3`,`Successful docks: ${hits}`,[['DOCK',()=>{if(position>=.36&&position<=.64){hits++;tone(700,.1);}else tone(170,.12);round++;if(round===3){state.best=Math.max(state.best,hits);if(hits===3){state.yen+=250;state.kenjiEscort=true;note('Perfect Star Port run. Kenji offered a workshop escort.');}save();receipt('STAR PORT · Results',`${hits}/3 successful docks.${hits===3?' Perfect run — ¥250 paid.':' Try another flight at the cabinet.'}`);}else{start=performance.now();next();}}],['Leave cabinet',close]]);const track=document.createElement('div');track.className='arcade-track';track.innerHTML='<span class="target-zone"></span><span class="arcade-marker"></span>';body.append(track);timer=setInterval(()=>{position=(Math.sin((performance.now()-start)/380)+1)/2;track.lastChild.style.left=`${position*100}%`;},25);}next();}],
      ['Leave',close]
    ]);
  }

  function tone(){townAudio.play('click',.35);}
  function toggleSound(){state.sound=!state.sound;townAudio.setEnabled(state.sound);$('#soundButton').textContent=state.sound?'SOUND ON':'SOUND OFF';save();}

  function inspect(name,detail){if(name==='Convex traffic mirror'){note('Traffic mirror: Tama was behind me. No cat when I turned.');say('A ginger shape in the mirror. Behind you: only the street.',5);}show(name,detail||'A thumb-sized clean patch marks the part everybody touches.',[['Close',close]]);}
  function read(name,detail){show(name,detail||'One corner is pinned with a bent brass tack. Read the complete dispatch at the Field Notes rack.',[['Put it back',close]]);}
  function operate(name,detail){
    const already=state.operated.includes(name);
    show(name,detail||'A working machine from the late 1980s.',[
      ['Operate',()=>{if(!state.operated.includes(name))state.operated.push(name);tone(520,.18);onTime(5);save();receipt(name,already?'The controls respond with a familiar mechanical click.':'The machine completes a short test cycle. Five minutes pass.');}],
      ['Leave',close]
    ]);
  }
  function sit(name,detail){if(onSeat(name))return;show(name,detail||'A quiet place to sit.',[['Sit for ten minutes',()=>{onTime(10);receipt(name,'You sit for a while and listen to the town around you. Ten minutes pass.');}],['Leave',close]]);}
  function buy(name,detail){
    const spec=detail&&typeof detail==='object'?detail:{};const cost=Number.isFinite(spec.cost)?Math.max(0,Math.round(spec.cost)):100,item=typeof spec.item==='string'?spec.item:name,text=typeof spec.text==='string'?spec.text:`${name} is ready to purchase.`;
    show(name,text,[[`Buy · ¥${cost}`,()=>{if(!spend(cost))return;addItem(item);tone(700,.12);receipt(name,`${item} has been added to your bag.`);}],['Leave',close]]);
  }
  function radio(name,detail){
    const stations=[
      '82.1 Harbour Service — fictional relay: Sweden, cool rain; Nam Phuoc, warm showers. Check the moorings.',
      '89.4 JOJO — tonight’s request: '+JOURNAL[Math.floor(getMinutes())%JOURNAL.length][1]+'. A title from the journal, for the late shift.',
      '95.7 Sports — fictional prefectural score: Harbour '+Math.floor(getMinutes()/30)%8+', Mountain '+Math.floor(getMinutes()/47)%6+'.'
    ];
    if(state.weather)radioStation=0;
    const render=()=>{note(stations[radioStation]);show(name,`${detail||'A compact transistor radio.'}\n\n${stations[radioStation]}`,[['Tune +',()=>{radioStation=(radioStation+1)%stations.length;state.radioStation=radioStation;save();tone(440+radioStation*110,.08);render();}],['Tune −',()=>{radioStation=(radioStation+stations.length-1)%stations.length;state.radioStation=radioStation;save();tone(440+radioStation*110,.08);render();}],['Leave',close]]);};
    render();
  }

  function action(kind,name,detail){
    body.classList.remove('signal');
    switch(kind){
      case 'vending':vending();break;
      case 'resident':resident(name);break;
      case 'cat':cat();break;
      case 'fishing':fishing();break;
      case 'arcade':arcade();break;
      case 'inspect':inspect(name,detail);break;
      case 'read':read(name,detail);break;
      case 'machine':operate(name,detail);break;
      case 'seat':sit(name,detail);break;
      case 'buy':buy(name,detail);break;
      case 'radio':radio(name,detail);break;
      case 'ramen':show('中華そば · Ramen stall','A steaming bowl of shoyu ramen, served at the counter.',[['Order ramen · ¥300',()=>{if(spend(300)){onTime(20);receipt('Ramen at the counter','You finish your bowl while the radio plays. Twenty quiet minutes pass.');}}],['Leave',close]]);break;
      case 'phone':show('Public telephone','A handwritten card lists the harbour office.',[['Call harbour office · ¥10',()=>{if(spend(10)&&!onPhone())receipt('Harbour office','“Last passenger bus: 18:20. Fishing is allowed at the promenade. Speak to the harbour master if you want to sell a catch.”');}],['Hang up',close]]);break;
      case 'bus':receipt('Harbour bus timetable','Harbour → Station\n06:40 · 08:10 · 10:40 · 13:10 · 16:40 · 18:20');break;
      case 'shrine':show('Neighbourhood shrine','The street sounds soften behind the torii gate.',[['Make an offering · ¥5',()=>{if(spend(5)){tone(420,.7);show('Set an intention','A bell note hangs above the roofs. Choose one thing to carry back into the street.',['Book','Work','Home'].map(intent=>[intent,()=>{state.shrineIntent=intent;note('Shrine intention: '+intent+'.');receipt('A quiet moment',intent+'. Noted.');}]));}}],['Leave',close]]);break;
    }
  }

  $('#closeActivity').onclick=close;
  modal.addEventListener('click',e=>{if(e.target===modal)close();});
  document.addEventListener('keydown',e=>{if(!modalOpen)return;if(e.code==='Escape'){e.preventDefault();close();}if(e.key==='Tab'){const focusable=[...modal.querySelectorAll('button:not(:disabled)')];const index=focusable.indexOf(document.activeElement);e.preventDefault();focusable[(index+(e.shiftKey?-1:1)+focusable.length)%focusable.length]?.focus();}});
  $('#notebookButton').onclick=inventory;
  $('#soundButton').onclick=toggleSound;
  $('#weatherButton').onclick=()=>{state.weather=!state.weather;onWeather(state.weather);$('#weatherButton').textContent=state.weather?'RAIN':'CLEAR';save();};
  $('#timeButton').onclick=()=>onTime('cycle');
  $('#cameraButton').onclick=onCamera;
  $('#creditsButton').onclick=()=>show('Credits','Three.js r170 · MIT.\nPoly Haven / Texture Haven: asphalt, plaster, timber and roof albedo, normal and packed ARM maps · CC0.\nTomonoura centreline data: © OpenStreetMap contributors · ODbL 1.0. The local extract and adapted layout are included with the source.\nQuaternius Ultimate Modular Men and Women: five local skinned body bases and embedded clips · CC0.\nTown geometry, procedural fallback and original rendered Foley/instrumental loops: Johansson Town.\nQwen3-TTS CustomVoice: four generated Japanese dialogue clips, model licence Apache 2.0; provenance in assets/audio/voices/.\nambientCG remains a proposed source; its assets are not included in this revision.\nSee assets/ATTRIBUTION.md for the licence ledger.',[['Close',close]]);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});

  if(Number.isFinite(state.minutes))onTime({restore:state.minutes});townAudio.setEnabled(state.sound);$('#soundButton').textContent=state.sound?'SOUND ON':'SOUND OFF';radioStation=state.radioStation||0;save();onWeather(state.weather);$('#weatherButton').textContent=state.weather?'RAIN':'CLEAR';
  return {action,inventory,close,save,note,inspectItem,openURL,quietRead,footstep(material){townAudio.step(material);},get paused(){return modalOpen;},get state(){return state;},visit(id){if(!state.visited.includes(id)){state.visited.push(id);save();}},tick(){}};
}
