const SAVE_KEY='johansson-town-1988-v3';

export function createActivities({say,onWeather,onTime,onCamera}) {
  const $=s=>document.querySelector(s);
  const defaults={yen:1200,inventory:[],visited:[],quest:0,fish:0,best:0,weather:false,sound:false,operated:[]};
  let state={...defaults},timer=null,modalOpen=false,previousFocus=null,audio=null,hum=null,radioStation=0;

  try {
    const saved=JSON.parse(localStorage.getItem(SAVE_KEY));
    if(saved&&typeof saved==='object'){
      for(const k of ['yen','quest','fish','best'])if(Number.isFinite(saved[k])&&saved[k]>=0)state[k]=saved[k];
      state.yen=Math.min(state.yen,999999);state.quest=Math.min(state.quest,3);
      for(const k of ['inventory','visited','operated'])if(Array.isArray(saved[k]))state[k]=saved[k].filter(x=>typeof x==='string').slice(0,100);
      state.weather=saved.weather===true;
    }
  } catch {}

  const modal=$('#activity'),heading=$('#activityTitle'),body=$('#activityBody'),actions=$('#activityActions');

  function save(){
    try {localStorage.setItem(SAVE_KEY,JSON.stringify(state));$('#saveState').textContent='PROGRESS SAVED';}
    catch {$('#saveState').textContent='SAVING UNAVAILABLE';}
    $('#wallet').textContent=`¥${state.yen.toLocaleString()}`;
  }
  function close(){clearInterval(timer);timer=null;modalOpen=false;modal.classList.add('hidden');previousFocus?.focus?.();}
  function show(title,text,buttons=[]){
    clearInterval(timer);timer=null;if(!modalOpen)previousFocus=document.activeElement;modalOpen=true;document.exitPointerLock?.();
    heading.textContent=title;body.classList.remove('signal');body.replaceChildren();
    const p=document.createElement('p');p.textContent=text;body.append(p);actions.replaceChildren();
    buttons.forEach(([label,fn,disabled=false])=>{const b=document.createElement('button');b.textContent=label;b.disabled=disabled;b.onclick=fn;actions.append(b);});
    modal.classList.remove('hidden');$('#closeActivity').focus();
  }
  function addItem(item){if(!state.inventory.includes(item))state.inventory.push(item);save();}
  function spend(n){if(state.yen<n){say('You do not have enough yen.');return false;}state.yen-=n;save();return true;}
  function receipt(title,text){show(title,text,[['Back',close]]);}
  function inventory(){
    const quest=['Speak to Aiko near the southern shops.','Find Tama, Aiko’s cat, near the ramen stall. A fish might help.','Return to Aiko with news of Tama.','Tama is safely home. Aiko has paid you ¥500.'][state.quest];
    show('Pocket notebook',`${quest}\n\nCash: ¥${state.yen} · Fish caught: ${state.fish}\nBag: ${state.inventory.length?state.inventory.join(', '):'Empty'}\nPlaces visited: ${state.visited.length}/8\nMachines tried: ${state.operated.length}\nStar Port best: ${state.best}`,[['Back to town',close]]);
  }

  function vending(){show('自動販売機 · Vending machine','The compressor hums. A can drops into the tray when you make a purchase.',[['Green tea · ¥120',()=>buyDrink('Green tea')],['Canned coffee · ¥120',()=>buyDrink('Canned coffee')],['Leave',close]]);}
  function buyDrink(name){if(!spend(120))return;addItem(name);tone(640,.1);receipt('Thank you',`${name} is in your bag.`);}

  function resident(name){
    if(name==='Aiko'){
      if(state.quest===0){show('Aiko · Bookshop assistant','My ginger cat Tama has wandered off again. He likes the warm corner by the ramen stall. Would you find him?',[['I will look for Tama',()=>{state.quest=1;save();receipt('A note in your notebook','Look near the ramen stall. If Tama is hungry, try the fishing pier.');}],['Later',close]]);}
      else if(state.quest===2){state.quest=3;state.yen+=500;save();receipt('Aiko','Tama followed you home! Thank you. Please take ¥500 for your trouble.');}
      else receipt('Aiko',state.quest===3?'Tama is sleeping upstairs. The harbour is lovely at sunset.':'Try the ramen stall further down the street. Tama cannot resist fresh fish.');
      return;
    }
    const lines={
      Kenji:'The Star Port cabinet is outside the workshop. Stop the signal in the illuminated zone three times to win. It costs ¥100; a perfect round pays ¥250.',
      'Mrs Sato':'Ramen is ¥300 today. The payphone near the bookshop still works, and the harbour bus leaves at 18:20.',
      'Harbour master':'There are mackerel off the pier. Cast a line and wait until the float dips. Reel in while the signal reads BITE. You can sell your catch here.'
    };
    show(name,lines[name]||'The resident nods politely.',[
      ...(name==='Harbour master'?[['Sell a fish · +¥180',()=>{const i=state.inventory.indexOf('Mackerel');if(i<0){say('Catch a fish at the pier first.');return;}state.inventory.splice(i,1);state.yen+=180;save();receipt('Harbour master','A fine mackerel. Here is ¥180.');},!state.inventory.includes('Mackerel')]]:[]),
      ['Goodbye',close]
    ]);
  }

  function cat(){
    if(state.quest===1){
      if(state.inventory.includes('Mackerel'))show('Tama','The ginger cat watches the fish in your bag.',[['Give Tama a fish',()=>{state.inventory.splice(state.inventory.indexOf('Mackerel'),1);state.quest=2;save();receipt('Tama','Tama eats the fish and trots towards Aiko’s shop. Tell Aiko where he is.');}],['Leave',close]]);
      else receipt('Tama','The ginger cat chirps, but keeps his distance. He seems hungry. Try fishing at the harbour.');
    } else receipt('Ginger cat',state.quest===3?'A neighbourhood cat stretches in the afternoon warmth.':'A ginger cat is warming himself beside the ramen stall.');
  }

  function fishing(){
    show('Harbour fishing','Cast a line. Wait for BITE, then reel in before the fish gets away.',[
      ['Cast line',()=>{let elapsed=0,biteAt=2+Math.random()*2.5,caught=false;show('Harbour fishing','Waiting for a bite…',[
        ['Reel in',()=>{if(caught)return;caught=true;if(elapsed>=biteAt&&elapsed<biteAt+1.35){state.fish++;addItem('Mackerel');tone(880,.2);receipt('A mackerel!','A fresh mackerel is in your bag. Keep it, give it to Tama, or sell it to the harbour master.');}else receipt('The line is empty','You reeled in too soon. Watch for BITE.');}],
        ['Put away the rod',close]
      ]);timer=setInterval(()=>{elapsed+=.05;if(elapsed>=biteAt&&elapsed<biteAt+1.35){body.firstChild.textContent='BITE — REEL IN NOW';body.classList.add('signal');}if(elapsed>=biteAt+1.35){body.classList.remove('signal');receipt('The fish got away','Try again and reel in when BITE appears.');}},50);}],
      ['Leave',close]
    ]);
  }

  function arcade(){
    show('STAR PORT · 1988','Stop the moving signal inside the green zone. Three rounds. Entry ¥100; three hits pays ¥250.',[
      ['Insert ¥100',()=>{if(!spend(100))return;let round=0,hits=0,start=performance.now(),position=0;function next(){show(`STAR PORT · Round ${round+1}/3`,`Successful docks: ${hits}`,[['DOCK',()=>{if(position>=.36&&position<=.64){hits++;tone(700,.1);}else tone(170,.12);round++;if(round===3){state.best=Math.max(state.best,hits);if(hits===3)state.yen+=250;save();receipt('STAR PORT · Results',`${hits}/3 successful docks.${hits===3?' Perfect run — ¥250 paid.':' Try another flight at the cabinet.'}`);}else{start=performance.now();next();}}],['Leave cabinet',close]]);const track=document.createElement('div');track.className='arcade-track';track.innerHTML='<span class="target-zone"></span><span class="arcade-marker"></span>';body.append(track);timer=setInterval(()=>{position=(Math.sin((performance.now()-start)/380)+1)/2;track.lastChild.style.left=`${position*100}%`;},25);}next();}],
      ['Leave',close]
    ]);
  }

  function tone(frequency,duration=.15){if(!audio||!state.sound)return;const oscillator=audio.createOscillator(),gain=audio.createGain();oscillator.type='sine';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(.06,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+duration);oscillator.connect(gain).connect(audio.destination);oscillator.start();oscillator.stop(audio.currentTime+duration);}
  function toggleSound(){
    const AudioContext=window.AudioContext||window.webkitAudioContext;if(!AudioContext){say('Audio is unavailable in this browser.');return;}
    try {
      if(!audio){audio=new AudioContext();const buffer=audio.createBuffer(1,audio.sampleRate*3,audio.sampleRate);const samples=buffer.getChannelData(0);for(let i=0;i<samples.length;i++)samples[i]=(Math.random()*2-1)*.16;const source=audio.createBufferSource();source.buffer=buffer;source.loop=true;const filter=audio.createBiquadFilter();filter.type='lowpass';filter.frequency.value=550;hum=audio.createGain();hum.gain.value=0;source.connect(filter).connect(hum).connect(audio.destination);source.start();}
      state.sound=!state.sound;audio.resume().catch(()=>{});hum.gain.setTargetAtTime(state.sound?.17:0,audio.currentTime,.25);$('#soundButton').textContent=state.sound?'SOUND ON':'SOUND OFF';tone(550);
    } catch {say('Audio could not start.');}
  }

  function inspect(name,detail){show(name,detail||'There is nothing unusual here.',[['Close',close]]);}
  function read(name,detail){show(name,detail||'The text is faded but still legible.',[['Put it back',close]]);}
  function operate(name,detail){
    const already=state.operated.includes(name);
    show(name,detail||'A working machine from the late 1980s.',[
      ['Operate',()=>{if(!state.operated.includes(name))state.operated.push(name);tone(520,.18);onTime(5);save();receipt(name,already?'The controls respond with a familiar mechanical click.':'The machine completes a short test cycle. Five minutes pass.');}],
      ['Leave',close]
    ]);
  }
  function sit(name,detail){show(name,detail||'A quiet place to sit.',[['Sit for ten minutes',()=>{onTime(10);receipt(name,'You sit for a while and listen to the town around you. Ten minutes pass.');}],['Leave',close]]);}
  function buy(name,detail){
    const spec=detail&&typeof detail==='object'?detail:{};const cost=Number.isFinite(spec.cost)?Math.max(0,Math.round(spec.cost)):100,item=typeof spec.item==='string'?spec.item:name,text=typeof spec.text==='string'?spec.text:`${name} is ready to purchase.`;
    show(name,text,[[`Buy · ¥${cost}`,()=>{if(!spend(cost))return;addItem(item);tone(700,.12);receipt(name,`${item} has been added to your bag.`);}],['Leave',close]]);
  }
  function radio(name,detail){
    const stations=[
      '82.1 Harbour Service — tide times, weather and fishing notices.',
      '89.4 JOJO Radio — light music, local adverts and the evening request programme.',
      '95.7 Sports — baseball scores and commentary from the prefectural league.'
    ];
    const render=()=>show(name,`${detail||'A compact transistor radio.'}\n\n${stations[radioStation]}`,[['Tune +',()=>{radioStation=(radioStation+1)%stations.length;tone(440+radioStation*110,.08);render();}],['Tune −',()=>{radioStation=(radioStation+stations.length-1)%stations.length;tone(440+radioStation*110,.08);render();}],['Leave',close]]);
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
      case 'phone':show('Public telephone','A handwritten card lists the harbour office.',[['Call harbour office · ¥10',()=>{if(spend(10))receipt('Harbour office','“Last passenger bus: 18:20. Fishing is allowed at the promenade. Speak to the harbour master if you want to sell a catch.”');}],['Hang up',close]]);break;
      case 'bus':receipt('Harbour bus timetable','Harbour → Station\n06:40 · 08:10 · 10:40 · 13:10 · 16:40 · 18:20');break;
      case 'shrine':show('Neighbourhood shrine','The street sounds soften behind the torii gate.',[['Make an offering · ¥5',()=>{if(spend(5)){tone(420,.7);receipt('A quiet moment','You ring the bell and pause beneath the tiled roof.');}}],['Leave',close]]);break;
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
  $('#creditsButton').onclick=()=>show('Credits','Johansson Town uses Three.js and local procedural geometry. Resource discovery is guided by Fasani/three-js-resources (MIT). Road, plaster, timber and roof textures come from Poly Haven / Texture Haven (CC0). Quaternius CC0 packs are approved for curated local intake; no third-party host is required at runtime. The stable character rigs are original Johansson Town geometry.',[['Texture credits',()=>window.open('./assets/ATTRIBUTION.md','_blank','noopener')],['Resource catalogue',()=>window.open('https://github.com/Fasani/three-js-resources','_blank','noopener')],['Asset intake policy',()=>window.open('./assets/late-showa/ASSETS.md','_blank','noopener')],['Close',close]]);
  document.addEventListener('visibilitychange',()=>{if(audio){if(document.hidden)audio.suspend().catch(()=>{});else if(state.sound)audio.resume().catch(()=>{});}});

  save();onWeather(state.weather);$('#weatherButton').textContent=state.weather?'RAIN':'CLEAR';
  return {action,inventory,close,get paused(){return modalOpen;},get state(){return state;},visit(id){if(!state.visited.includes(id)){state.visited.push(id);save();}},tick(){}};
}
