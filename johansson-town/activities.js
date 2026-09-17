import {elapsedTownAbsence} from './src/people/town-absence.js';
import {createShopLedgerView} from './src/commerce/shop-ledger.js';
import {restoreTownCleanup,collectTownFind} from './src/commerce/town-cleanup.js';
import {restoreSakura,buySakuraItem} from './src/commerce/sakura-economy.js';
import {printedModels} from './src/workshop/catalogue.js';
import {restoreWorkshop,advancePrint} from './src/workshop/production.js';
import {createWorkshopUI} from './src/workshop/interface.js';
import {loadWorkshopModel,printedItem} from './src/workshop/models.js';
import {loadOfficeWorkbooks,createOfficeWorkbookView} from './src/office/workbooks.js';
import {STORE_MENU} from './src/people/store-service.js';
import {restoreResidentLife} from './src/people/resident-personalities.js';
import {travelProgress,travelStatusText} from './src/progression/travel.js';
import {PROFILES} from './src/people/profiles.js';
import {RESIDENTS,residentHomeDescription} from './src/people/residents.js';
import {gossipAt,izakayaOpen} from './src/people/social.js';
import {VENDING_PRODUCTS} from './src/commerce/vending-catalogue.js';
import {STORE_ITEMS} from './src/commerce/catalogue.js';
import {SHOPIFY_CONFIG} from './src/commerce/shopify-config.js';
import {createShopify} from './src/commerce/shopify.js';
import {townAudio} from './src/audio/town-audio.js?snappy=1';
import {DIALOGUE} from './src/people/schedules.js?snappy=1';
import {JOURNAL} from './content-data.js';
import {SAVE_KEY,readSave} from './src/save.js';

export function createActivities({say,getResidentLocations=()=>null,onConversation=()=>{},onWeather,onTime,getMinutes=()=>1002,getSocialContext=()=>({}),onPhone=()=>false,onEscort=()=>{},onPurchase=()=>false,onSeat=()=>false,onDrink=()=>false,onMap=()=>null,getTableService=()=>null,onStand=()=>{},onInspectModel=()=>{}}) {
  const $=s=>document.querySelector(s);
  const defaults={yen:1200,inventory:[],visited:[],quest:0,fish:0,best:0,weather:false,sound:true,operated:[],inspectedIds:[],notes:['14 September 1988. Harbour Line last departure: 21:00.'],shrineIntent:null,kenjiEscort:false,quickTravelNotified:false,townMode:'shopping-district'};
  const realShop=createShopify(SHOPIFY_CONFIG);let modalRevision=0;
  let pendingAbsence=0,ledgerView=null;let state={...defaults},timer=null,modalOpen=false,previousFocus=null,radioStation=0;

  try {
    const saved=readSave(localStorage);
    if(saved&&typeof saved==='object'){pendingAbsence=elapsedTownAbsence(saved.savedAt);
      state.sakura=saved.sakura;state.townCleanup=saved.townCleanup;state.workshop=saved.workshop;state.residentLife=restoreResidentLife(saved.residentLife);state.residentLocations=saved.residentLocations;
      for(const k of ['yen','quest','fish','best'])if(Number.isFinite(saved[k])&&saved[k]>=0)state[k]=saved[k];
      state.yen=Math.min(state.yen,999999);state.quest=Math.min(state.quest,3);
      for(const k of ['inventory','visited','operated','inspectedIds','notes'])if(Array.isArray(saved[k]))state[k]=saved[k].filter(x=>typeof x==='string').slice(0,100);
      state.notes=state.notes.filter(n=>!n.includes('Website is the town')&&!/https?:/.test(n));state.minutes=Number.isFinite(saved.minutes)?saved.minutes:1002;state.sound=saved.sound!==false;state.bookRescue=saved.bookRescue||0;state.radioStation=Number.isInteger(saved.radioStation)?Math.max(0,Math.min(2,saved.radioStation)):0;state.inventory=state.inventory.map(i=>i==='Mackerel'?'Sea bream':i);state.weather=saved.weather===true;state.shrineIntent=['Book','Work','Home'].includes(saved.shrineIntent)?saved.shrineIntent:null;state.kenjiEscort=[true,'walking','done'].includes(saved.kenjiEscort)?saved.kenjiEscort:false;state.quickTravelNotified=saved.quickTravelNotified===true;
    }
  } catch {}

  state.sakura=restoreSakura(state.sakura);
  state.townCleanup=restoreTownCleanup(state.townCleanup);
  state.workshop=restoreWorkshop(state.workshop,state.inventory);
  state.townMode='shopping-district';

  const commuterDescription=name=>name==='Harbour master'?'The harbour office is staffed around the clock. I stay on the quay.':name==='Bus driver'?'I work the Harbour Line and stay at the northern terminal.':'I commute into the shopping district on the Harbour Line and leave by bus after my shift.';

  const modal=$('#activity'),heading=$('#activityTitle'),body=$('#activityBody'),actions=$('#activityActions');

  const workshopUI=createWorkshopUI({state,show,close,save,say,note,getContext:getSocialContext,getMinutes,preview:previewPrint,body,modal});

  async function previewPrint(model){
    show('Form 3D · '+model.name,'Preparing the model…',[['Close',close]]);const revision=modalRevision;
    try{const data=await loadWorkshopModel(model.id);if(!modalOpen||revision!==modalRevision)return;close();onInspectModel(printedItem(model,data));}
    catch{if(!modalOpen||revision!==modalRevision)return;show('Form 3D','The model could not be loaded. Your inventory is unchanged.',[['Try again',()=>previewPrint(model)],['Close',close]]);}
  }

  function save(){
    if(travelProgress(state).unlocked&&!state.quickTravelNotified){state.quickTravelNotified=true;state.notes.push('Earned the town shortcuts: Tama is home and Kenji’s workshop route is complete.');say('Town shortcuts unlocked! Quick travel is now in your Town Book.',7);}
    try {const locations=getResidentLocations();if(locations)state.residentLocations=locations;state.minutes=getMinutes();state.savedAt=Date.now();localStorage.setItem(SAVE_KEY,JSON.stringify(state));$('#saveState').textContent='PROGRESS SAVED';}
    catch {$('#saveState').textContent='SAVING UNAVAILABLE';}
    $('#wallet').textContent=`¥${state.yen.toLocaleString()}`;
  }
  function close(){ledgerView=null;modal.classList.remove('sakura-records');workshopUI.dispose();modalRevision++;townAudio.stopSpeech();clearInterval(timer);timer=null;modalOpen=false;modal.classList.add('hidden');modal.classList.remove('conversation');modal.classList.remove('office-records');document.body.classList.remove('conversation-open');onConversation(null);previousFocus?.focus?.();}
  function show(title,text,buttons=[]){
    ledgerView=null;modal.classList.remove('sakura-records');workshopUI.dispose();modal.classList.remove('office-records');
    modalRevision++;const revision=modalRevision;
    townAudio.stopSpeech();clearInterval(timer);timer=null;if(!modalOpen)previousFocus=document.activeElement;modalOpen=true;document.exitPointerLock?.();
    heading.textContent=title;body.classList.remove('signal');body.replaceChildren();
    const p=document.createElement('p');p.textContent=text;body.append(p);actions.replaceChildren();
    buttons.forEach(([label,fn,disabled=false])=>{const b=document.createElement('button');b.textContent=label;b.disabled=disabled;b.onclick=()=>{if(modalOpen&&modalRevision===revision&&!b.disabled)fn();};actions.append(b);});
    const speaker=title.split('·')[0].trim();
    const conversation=speaker==='Thuan'||!!DIALOGUE[speaker];
    modal.classList.toggle('conversation',conversation);document.body.classList.toggle('conversation-open',conversation);
    modal.classList.remove('hidden');onConversation(conversation?speaker:null,text);$('#closeActivity').focus();
  }
  function addItem(item){if(STORE_ITEMS.some(p=>p.name===item)||['Green tea','Canned coffee','Sea bream','Ice'].includes(item)||!state.inventory.includes(item))state.inventory.push(item);save();}
  function spend(n){if(state.yen<n){say('You do not have enough yen.');return false;}state.yen-=n;save();return true;}
  function receipt(title,text){show(title,text,[['Back',close]]);}
  function inventory(){
    const quest=['Speak to Aya beside the bookshop.','Find Tama, Aya’s cat, near the ramen stall. A fish might help.','Return to Aya with news of Tama.','Tama is safely home. Aya has paid you ¥500.'][state.quest];
    show('Field book',`${state.notes.join('\n')}\n\n${quest}\n\n${travelStatusText(state)}\n\nCash: ¥${state.yen} · Fish caught: ${state.fish}\nBag: ${state.inventory.length?state.inventory.join(', '):'Empty'}\nPlaces visited: ${state.visited.length}\nMachines tried: ${state.operated.length}\nStar Port best: ${state.best}`,[...['Canned coffee','Green tea'].filter(i=>state.inventory.includes(i)).map(i=>['Drink '+i,()=>{close();onDrink(i);}]),...printedModels(state.inventory).map(model=>['Inspect '+model.name,()=>previewPrint(model)]),['Back to town',close]]);
    const map=onMap();if(map)body.append(map);
  }


  function note(text){if(!state.notes.includes(text)){state.notes.push(text);state.notes=state.notes.slice(-100);save();}}
  function inspectItem(item){if(!state.inspectedIds.includes(item.id)){state.inspectedIds.push(item.id);note(item.note);save();}}
  function openURL(){say('The ledger is kept here in town.');}

  function quietRead(){if(!state.inspectedIds.includes('book')){receipt('Window chair','Lift The Venture from the display first. Aya has kept your place.');return;}let left=20;show('Quiet reading','Rain on the shutters. The street can wait.',[['Put down the book',close]]);timer=setInterval(()=>{left--;body.firstChild.textContent='A page, a breath, the harbour. '+left+' seconds.';if(left<=0){onTime(10);note('Read by the window. Ten town minutes passed.');receipt('Window chair','The bookmark is a ferry ticket. Returned it to the same page.');}},1000);}
  const histories=new Map();
  function thuanConversation(topic=null){
    if(!modalOpen)window.__JOHANSSON_CHARACTER_CONTROL__?.gesture('Thuan');
    const ramenVisit=getSocialContext().inside==='ramen',offDuty=getSocialContext().inside==='izakaya';
    const commuterMode=state.townMode==='shopping-district';
    if(ramenVisit)note('Shared a ramen-shop break with Thuan after closing.');
    if(offDuty)note('Caught up with Thuan after closing at Minato Izakaya.');
    const met=state.notes.includes('Met Thuan, the heart of Sakura Konbini.');
    if(!met)note('Met Thuan, the heart of Sakura Konbini.');
    const replies={
      snack:'おすすめ？ 任せて！\nMy recommendation? Tea and a biscuit. The tea makes it a sensible decision. The biscuit makes it a good one.',
      ribbon:'このリボン？\nThis ribbon? I tied it three times this morning. Effortlessly charming takes a surprising amount of effort.',
      town:commuterMode?'夕方の港が好き。\nSakura closes at eight. I walk to the Harbour Line terminal and take the last bus after my shift. Nao’s izakaya is beside Main Street — follow the red lanterns. She always keeps a chair for a good story.':'夕方の港が好き。\nSakura closes at eight. Some evenings I stop by Minato after twenty past, until half past nine; other evenings I walk home by the harbour. Nao’s izakaya is beside Main Street — follow the red lanterns. She always keeps a chair for a good story.',
      home:state.townMode==='shopping-district'?commuterDescription('Thuan'):residentHomeDescription('Thuan'),
      compliment:'もう、照れちゃう。\nOh, now you have made me shy. I was trying to look very professional behind this counter. Thank you. That was lovely.',
      challenge:'勝負しよう！\nA challenge! Find the strangest postcard on the rack. I will defend the seagull one. He looks as though he owns the harbour.',
      radio:'内緒だよ。\nIf the radio plays my favourite song, this becomes a very small concert hall. The assistant manager is a plant, so the reviews are generous.',
      secret:'ここだけの話ね。\nA little shop secret: I name the plants. The stubborn one by the door is the assistant manager. Terrible at counting change.',
    };
    if(offDuty){
      replies.snack='Nao saved me some edamame and barley tea. Choosing a snack is much easier when I am not the person stocking the shelves.';
      replies.compliment='Thank you. It is lovely being here with everyone, just as Thuan. No till to count tonight.';
      replies.challenge='A little challenge: ask Nao which neighbour tells the tallest stories. I have my suspicions.';
      replies.radio='When this song comes on at Sakura I sing along. Here I let Nao join in. She knows all the wrong words with enormous confidence.';
    }
    if(ramenVisit){
      replies.snack='Tonight, a hot bowl of shoyu ramen. I have spent all day recommending snacks to everyone else.';
      replies.compliment='Thank you. It is nice to be a customer for a change. Someone else can count the till.';
      replies.challenge='Try naming every topping before the steam fogs your glasses. I always forget one.';
      replies.radio='I leave the singing to the shop radio tonight. Here I am listening to the kitchen.';
    }
    const greeting=ramenVisit?'おつかれさま！\nSakura is locked up for the evening. I stopped for a bowl of ramen before heading on. There is a stool at the counter if you would like to join me.':offDuty?'あ、おつかれさま！\nYou found me! Sakura is all locked up. Nao saved me some supper. Come keep me company — I want to hear about your day.':met?'おかえり！\nYou are back! Welcome to Sakura. Looking for a snack, or shall we make the afternoon a little less ordinary?':'いらっしゃいませ！ トゥアンです。\nWelcome! I am Thuan. I keep Sakura stocked, the plants alive, and the radio just loud enough to sing along. What brings you in?';
    const title=ramenVisit?'Thuan · Ramen break':offDuty?'Thuan · After hours':'Thuan · Heart of Sakura';
    if(topic){show(title,replies[topic],[['Tell me something else',()=>thuanConversation()],['See you soon, Thuan',close]]);return;}
    show(title,greeting,[['Sell items from my bag',workshopUI.selling],['Read the shop ledger',shopLedger],['What is your favourite snack?',()=>thuanConversation('snack')],['I like your ribbon',()=>thuanConversation('ribbon')],['Where do you go after work?',()=>thuanConversation('town')],[commuterMode?'How do you travel?':'Where do you live?',()=>thuanConversation('home')],['You make this place lovely',()=>thuanConversation('compliment')],['Give me a little challenge',()=>thuanConversation('challenge')],['Do you sing along to the radio?',()=>thuanConversation('radio')],['Tell me a shop secret',()=>thuanConversation('secret')],['See you soon, Thuan',close]]);
  }
  function resident(name){
    if(name==='Thuan'){thuanConversation();return;}

    const all=DIALOGUE[name];if(!all){legacyResident(name);return;}
    const history=histories.get(name)||[];
    const commuterMode=state.townMode==='shopping-district';
    const available=all.filter(([id,line,requires])=>(!requires||state.inspectedIds.includes(requires))&&!history.includes(id)&&!(commuterMode&&id==='home'));
    // Newly discovered callbacks take precedence, then cycle through authored topics.
    const row=available.find(r=>r[2])||available[0]||all[0];history.push(row[0]);histories.set(name,history.slice(-3));
    let text=row[1];
    const profile=RESIDENTS.find(p=>p.name===name)||PROFILES.find(p=>p.name===name);
    const buttons=[['Tell me more',()=>resident(name)],...(profile?[['How is '+profile.friend+'?',()=>show(name+' · '+profile.personality,profile.gossip,[['And around town?',()=>resident(name)],['See you soon',close]])],['Somewhere worth exploring?',()=>{note(profile.clue);show(name,profile.clue,[['I will have a look',close]]);}]]:[])];
    if(residentHomeDescription(name)||commuterMode)buttons.push([commuterMode?'How do you travel?':'Where do you live?',()=>show(name+' · '+(commuterMode?'Harbour Line':'Home'),commuterMode?commuterDescription(name):residentHomeDescription(name),[['Tell me more',()=>resident(name)],['See you soon',close]])]);
    if(name==='Nao'&&getSocialContext().inside!=='ramen')buttons.push(['What is cooking?',()=>izakayaMenu()],['What have I missed?',()=>izakayaGossip()]);
    if(name==='Aya')buttons.push(['About Tama',()=>legacyResident(name)]);
    if(name==='Kenji')buttons.push(['How does the 3D printer work?',()=>show('Kenji · Form 3D','Yo bro, pick a pattern on the Form 3D machine. StepWise checks the material cost and what Thuan will pay. Start the print, let the machine run, then collect it. One of each in your bag. Thuan buys them at Sakura from nine till eight, using the money her shop earns.',[['Got it, bro',close]])]);
    if(name==='Kenji'&&state.kenjiEscort&&state.kenjiEscort!=='done')buttons.push(['Show me the workshop',()=>{onEscort();close();say('Kenji: Come on, bro. I’ll show you the way.',4);}]);
    if(name==='Mrs Sato')buttons.push(['Umeboshi rice ball · ¥80',()=>{if(spend(80)){state.sprintUntil=performance.now()+20000;note('Umeboshi rice ball. Ready to move.');close();}}]);
    if(name==='Cold-storage kid')buttons.push(['Ice · ¥20',()=>{if(spend(20)){addItem('Ice');receipt(name,'Keep it out of the sun. That is the entire manual.');}}]);
    if(name==='Harbour master')buttons.push(['Sell a catch',()=>legacyResident(name)]);
    buttons.push(['See you soon',close]);show(profile?name+' · '+profile.personality:name,text,buttons);if(text===row[1]&&row[3])townAudio.speak(row[3]);
  }

  function izakayaMenu(){
    if(!izakayaOpen(getMinutes())){close();say('Minato closes at 03:00. Nao is locking up.');return;}
    show('Minato · Tonight’s little pleasures','Nao: Choose something you like. The stories are on the house.',[
      ...[['Yakitori plate',180,'Sweet soy glaze, three little skewers, and a very satisfied silence.'],['Edamame & barley tea',120,'Warm beans and cold barley tea. Nao settles a tiny saucer beside your cup.'],['Oden supper',260,'Daikon, egg and tofu, simmered until the day feels a little kinder.'],['Small beer',180,'A little glass of harbour lager. Someone at the next table starts a story.']].map(([name,cost,detail])=>[name+' · ¥'+cost,()=>{if(!izakayaOpen(getMinutes())){izakayaMenu();return;}if(!spend(cost))return;onTime(8);note('Supper at Minato: '+name+'.');show('Supper at Minato',detail,[['Listen to the table',izakayaGossip],['Something else?',izakayaMenu],['Enjoy the room',close]]);}]),
      ['Just looking, thank you',close]
    ]);
  }
  function izakayaGossip(){
    if(!izakayaOpen(getMinutes())){izakayaMenu();return;}
    const social=getSocialContext(),gossip=gossipAt(getMinutes(),social.names||[]);note(gossip.clue);
    show('Overheard at Minato',gossip.line+'\n\n'+gossip.clue,[['Stay a little longer',()=>{onTime(7);izakayaGossip();}],['Back to the evening',close]]);
  }
  function vending(){show('MINATO DRINKS · 自動販売機','A harbour break. Choose a chilled drink · ¥120.',[...VENDING_PRODUCTS.map(product=>[product.label,()=>buyDrink(product)]),['Leave',close]]);}
  function buyDrink(product){if(!spend(product.price))return;const name=product.inventoryName;addItem(name);townAudio.play('clunk',.7);close();if(!onPurchase(name))receipt('Thank you',`${product.brand} — ${name} is in your bag.`);}

  function legacyResident(name){
    if(name==='Aya'){
      if(state.quest===0){show('Aya · Bookshop assistant','My ginger cat Tama has wandered off again. He likes the warm corner by the ramen stall. Would you find him?',[['I will look for Tama',()=>{state.quest=1;save();receipt('A note in your notebook','Look near the ramen stall. If Tama is hungry, try the fishing pier.');}],['Later',close]]);}
      else if(state.quest===2){state.quest=3;state.yen+=500;save();receipt('Aya','Tama followed you back to the shopping street! Thank you. Please take ¥500 for your trouble. That is one town favour complete — your Field book tracks the shortcuts you can earn.');}
      else receipt('Aya',state.quest===3?'Tama is sleeping upstairs. The harbour is lovely at sunset.':'Try the ramen stall further down the street. Tama cannot resist fresh fish.');
      return;
    }
    const lines={
      Kenji:'The Star Port cabinet is outside the workshop. Stop the signal in the illuminated zone three times to win. It costs ¥100; a perfect round pays ¥250.',
      'Mrs Sato':'Ramen is ¥300 today. The payphone near the bookshop still works, and the Harbour Line leaves at 21:00.',
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
      if(state.inventory.includes('Sea bream'))show('Tama','The ginger cat watches the fish in your bag.',[['Give Tama a fish',()=>{state.inventory.splice(state.inventory.indexOf('Sea bream'),1);state.quest=2;save();receipt('Tama','Tama eats the fish and trots towards Aya’s shop. Tell Aya where he is.');}],['Leave',close]]);
      else receipt('Tama','The ginger cat chirps, but keeps his distance. He seems hungry. Try fishing at the harbour.');
    } else receipt('Ginger cat',state.quest===3?'A neighbourhood cat stretches in the afternoon warmth.':'A ginger cat is warming himself beside the ramen stall.');
  }

  function fishing(){
    show('Harbour fishing','Cast a line. Wait for BITE, then reel in before the fish gets away.',[
      ['Cast line',()=>{let elapsed=0,biteAt=2+Math.random()*2.5,caught=false;show('Harbour fishing','Waiting for a bite…',[
        ['Reel in',()=>{if(caught)return;caught=true;if(elapsed>=biteAt&&elapsed<biteAt+1.35){state.fish++;if(state.fish===2){addItem('Waterlogged page · Kings of Ben…');note('Recovered a Book Three fragment: Kings of Ben…');receipt('A waterlogged page','Only “Kings of Ben…” survives. Aya will want this dried away from the stove.');return;}addItem('Sea bream');tone(880,.2);receipt('A sea bream!','A fresh sea bream is in your bag. Keep it, give it to Tama, or sell it to the harbour master.');}else receipt('The line is empty','You reeled in too soon. Watch for BITE.');}],
        ['Put away the rod',close]
      ]);timer=setInterval(()=>{elapsed+=.05;if(elapsed>=biteAt&&elapsed<biteAt+1.35){body.firstChild.textContent='BITE — REEL IN NOW';body.classList.add('signal');}if(elapsed>=biteAt+1.35){body.classList.remove('signal');receipt('The fish got away','Try again and reel in when BITE appears.');}},50);}],
      ['Leave',close]
    ]);
  }

  function arcade(){
    show('STAR PORT · 1988','Stop the moving signal inside the green zone. Three rounds. Entry ¥100; three hits pays ¥250.',[
      ['Insert ¥100',()=>{if(!spend(100))return;let round=0,hits=0,start=performance.now(),position=0;function next(){show(`STAR PORT · Round ${round+1}/3`,`Successful docks: ${hits}`,[['DOCK',()=>{if(position>=.36&&position<=.64){hits++;tone(700,.1);}else tone(170,.12);round++;if(round===3){state.best=Math.max(state.best,hits);if(hits===3){state.yen+=250;if(state.kenjiEscort!=='done')state.kenjiEscort=true;note('Perfect Star Port run. Kenji offered a workshop escort.');}save();receipt('STAR PORT · Results',`${hits}/3 successful docks.${hits===3?' Perfect run — ¥250 paid.':' Try another flight at the cabinet.'}`);}else{start=performance.now();next();}}],['Leave cabinet',close]]);const track=document.createElement('div');track.className='arcade-track';track.innerHTML='<span class="target-zone"></span><span class="arcade-marker"></span>';body.append(track);timer=setInterval(()=>{position=(Math.sin((performance.now()-start)/380)+1)/2;track.lastChild.style.left=`${position*100}%`;},25);}next();}],
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
  function tableService(){
    const service=getTableService();if(!service)return;
    const order=service.order;
    const server=service.server||'Thuan';const text=order?.delivered?'Your order is on the counter.':order?server+' is preparing your '+order.item.name.toLowerCase()+'.':'Take your time. '+server+' will prepare your order. Pay when it arrives.';
    const buttons=order?.delivered?[[order.item.id==='tea'?'Drink tea':'Eat '+order.item.name,()=>{close();service.eat();}]]:order?[]:(service.menu||STORE_MENU).map(item=>[item.name+' · ¥'+item.cost,()=>{if(service.request(item.id))close();}]);
    show(service.title||'Sakura · At the table',text,[...buttons,['Keep sitting',close],['Stand up',()=>{close();onStand();}]]);
  }
  function sit(name,detail){if(onSeat(name))return;show(name,detail||'A quiet place to sit.',[['Sit for ten minutes',()=>{onTime(10);receipt(name,'You sit for a while and listen to the town around you. Ten minutes pass.');}],['Leave',close]]);}
  async function realProduct(item){
    show('Mail-order catalogue','Looking up the current price…',[['Close',close]]);const revision=modalRevision;
    try{const product=await realShop.product(item.id);if(revision!==modalRevision)return;
      if(!product||!product.availableForSale){receipt('Mail-order catalogue','This item is not available to order.');return;}
      const price=new Intl.NumberFormat(undefined,{style:'currency',currency:product.price.currencyCode}).format(Number(product.price.amount));
      show(product.title,`Real-world order · ${price}\nThis uses real money through Shopify. Town yen cannot pay for it. Delivery and taxes are shown at checkout.`,[['Prepare Shopify checkout',async()=>{
        show('Preparing checkout','Please wait…',[['Cancel',close]]);const checkoutRevision=modalRevision;
        try{const url=await realShop.checkout(product.id);if(checkoutRevision!==modalRevision)return;show('Shopify checkout',`Real-world purchase · ${price}. Review the total and delivery details on Shopify.`,[['Return to town',close]]);const link=document.createElement('a');link.textContent='Continue to Shopify checkout';link.href=url;link.target='_blank';link.rel='noopener noreferrer';body.append(link);}catch(error){if(checkoutRevision===modalRevision)receipt('Mail-order catalogue',error.message);}
      }],['Back',close]]);
    }catch(error){if(revision===modalRevision)receipt('Mail-order catalogue',error.message);}
  }
  function shopLedger(){
    if(getSocialContext().inside!=='market'){receipt('Sakura sales ledger','The stock and sales books are on the counter at Sakura.');return;}
    show('Sakura Shōten · Shop ledger','Thuan’s sales, purchases and stock records.',[['Close ledger',close]]);modal.classList.add('sakura-records');
    ledgerView=createShopLedgerView(state,getMinutes);body.replaceChildren(ledgerView.element);
  }
  function storeItem(item){
    const available=state.sakura.stock[item.id]?.shelf||0;
    show(item.jp+' · '+item.name,item.text+'\n\n'+(available?'On shelf: '+available:'Thuan: Sorry, we’ve sold out. Please come back tomorrow.'),[[`Buy in town · ¥${item.cost}`,()=>{
      const result=buySakuraItem(state,item,getMinutes());if(!result.ok){receipt('Sakura Shōten',result.message);return;}
      save();if(['Green tea','Canned coffee'].includes(item.name))onPurchase(item.name);receipt('Thank you',item.name+' is in your bag.');
    },!available],...(realShop.enabled&&SHOPIFY_CONFIG.products[item.id]?[['View real-world product',()=>realProduct(item)]]:[]),['Put it back',close]]);
  }
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

  async function officeRecords(id){
    show('Harbour office records','Opening the workbook…',[['Close records',close]]);modal.classList.add('office-records');const revision=modalRevision;
    try{const catalogue=await loadOfficeWorkbooks();if(!modalOpen||revision!==modalRevision)return;body.replaceChildren(createOfficeWorkbookView(catalogue,id,officeRecords));}
    catch{if(!modalOpen||revision!==modalRevision)return;show('Harbour office records','The records could not be loaded. Please try again.',[['Try again',()=>officeRecords(id)],['Close records',close]]);}
  }
  function action(kind,name,detail){
    body.classList.remove('signal');
    switch(kind){
      case 'workshop':workshopUI.printer();break;
      case 'town-cleanup':{const result=collectTownFind(state,name);if(!result.ok){receipt('Town clean-up',result.message);break;}save();receipt('Street tidied',result.name+' is in your bag. Thuan offers ¥'+result.price+' when the shop has enough takings.');break;}
      case 'stepwise':if(getSocialContext().inside==='form3d')inspectItem({id:'stepwise',note:'Checked the workshop calculator.'});workshopUI.stepwise();break;
      case 'office-records':officeRecords(detail);break;
      case 'store-item':storeItem(detail);break;
      case 'shop-ledger':shopLedger();break;
      case 'store-catalogue':show('Thuan’s mail-order book',realShop.enabled?'Real-world products. Current prices and Shopify checkout are shown separately from town yen.':'A pink ribbon marks the next page. Thuan is still preparing the mail-order selection.',[...STORE_ITEMS.filter(i=>realShop.enabled&&SHOPIFY_CONFIG.products[i.id]).map(i=>[i.name,()=>realProduct(i)]),['Close',close]]);break;
      case 'travel-progress':show('Earn your town shortcuts',travelStatusText(state),[['Back to exploring',close]]);break;
      case 'vending':vending();break;
      case 'resident':resident(name);break;
      case 'visit-home':show(name,'Choose an apartment to visit.',[...detail.map(home=>[home.name,()=>{close();home.enter();}]),['Back',close]]);break;
      case 'izakaya-menu':izakayaMenu();break;
      case 'izakaya-gossip':izakayaGossip();break;
      case 'cat':cat();break;
      case 'fishing':fishing();break;
      case 'arcade':arcade();break;
      case 'inspect':inspect(name,detail);break;
      case 'read':read(name,detail);break;
      case 'machine':operate(name,detail);break;
      case 'store-table':tableService();break;
      case 'seat':sit(name,detail);break;
      case 'buy':buy(name,detail);break;
      case 'radio':radio(name,detail);break;
      case 'ramen':if(getTableService())tableService();else show('Sato Ramen','Take a counter seat to order ramen, onigiri, steamed buns or tea. The cook prepares your meal and serves it at your place.',[['Take a seat',close]]);break;
       case 'phone':show('Public telephone','A handwritten card lists the harbour office.',[['Call harbour office · ¥10',()=>{if(spend(10)&&!onPhone())receipt('Harbour office','“The Harbour Line runs to the northern terminal. Port operations continue through the night. Speak to the harbour master if you want to sell a catch.”');}],['Hang up',close]]);break;
       case 'bus':receipt('Harbour Line timetable','Shopping District → Harbour Line terminal\n07:00 · 09:30 · 12:00 · 15:00 · 18:30 · 21:00');break;
      case 'shrine':show('Neighbourhood shrine','The street sounds soften behind the torii gate.',[['Make an offering · ¥5',()=>{if(spend(5)){tone(420,.7);show('Set an intention','A bell note hangs above the roofs. Choose one thing to carry back into the street.',['Book','Work','Home'].map(intent=>[intent,()=>{state.shrineIntent=intent;note('Shrine intention: '+intent+'.');receipt('A quiet moment',intent+'. Noted.');}]));}}],['Leave',close]]);break;
    }
  }

  $('#closeActivity').onclick=close;
  modal.addEventListener('click',e=>{if(e.target===modal)close();});
  document.addEventListener('keydown',e=>{if(!modalOpen)return;if(e.code==='Escape'){e.preventDefault();close();}if(e.key==='Tab'){const focusable=[...modal.querySelectorAll('button:not(:disabled),a[href],iframe,input:not(:disabled),[tabindex="0"]')];const index=focusable.indexOf(document.activeElement);e.preventDefault();focusable[(index+(e.shiftKey?-1:1)+focusable.length)%focusable.length]?.focus();}});
  $('#notebookButton').onclick=inventory;
  $('#soundButton').onclick=toggleSound;
  $('#weatherButton').onclick=()=>{state.weather=!state.weather;onWeather(state.weather);$('#weatherButton').textContent=state.weather?'RAIN':'CLEAR';save();};
  $('#timeButton').onclick=()=>onTime('cycle');
  $('#creditsButton').onclick=()=>show('Credits','Nozomi appearance for Reiko: user-supplied Shenmue model, upload credited to Kiklox; embedded metadata declares CC BY 4.0. Geometry batching, material conversion and original movement clips by Johansson Town. Full source and provenance: assets/ATTRIBUTION.md.\nJapanese Town: Nazareno_rojas · CC BY 4.0. Complete supplied overworld, texture compression and static batching; original arrangement preserved. Source and licence: assets/models/full-town/CREDITS.md.\nThree.js r170 · MIT.\nVending Machine: Don Carson / Poly Pizza · CC BY 3.0. Adapted materials, glass removed, original fictional branding added. Source and licence links: assets/ATTRIBUTION.md.\nPoly Haven / Texture Haven: asphalt, plaster, timber and roof albedo, normal and packed ARM maps · CC0.\nIndustrial Sunset 02 environment lighting: Sergej Majboroda / Poly Haven · CC0.\nTomonoura centreline data: © OpenStreetMap contributors · ODbL 1.0. The local extract and adapted layout are included with the source.\n21 fitted neighbours and the Yui fallback: Blender / MakeHuman system assets · CC0. Original scripted animations.\nQuaternius Ultimate Modular Men and Women: local fallback and archived bases/clips · CC0.\nOpenGameArt: concrete and bamboo by YCbCr; stone paving by para · CC0.\nPotted plant: Polygonal Mind, discovered through ToxSam OS3A · CC0.\nMinato Izakaya exterior: BenMaher, Izakaya - Low Poly Building · CC BY 4.0 per supplied source metadata. Texture and entrance adaptations by Johansson Town.\nOffice interior: user-supplied Tomodachi Life model, source upload by Unknown Person.\nSato Ramen exterior and interior: Japanese Restaurant Inakaya by Jellepostma, CC BY 4.0. Adapted customer aisle, seating and interactions by Johansson Town. Source and licence links: assets/ATTRIBUTION.md.\nCurrent Thuan: user-supplied Meshy Thoughtful Girl; Blender mesh/weight repairs, supplied walk/run, original idle and greeting.\nTown geometry, procedural fallback and original rendered Foley/instrumental loops: Johansson Town.\nQwen3-TTS CustomVoice: four generated Japanese dialogue clips, model licence Apache 2.0; provenance in assets/audio/voices/.\nambientCG remains a proposed source; its assets are not included in this revision.\nSee assets/ATTRIBUTION.md for the licence ledger.',[['Close',close]]);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});

  if(Number.isFinite(state.minutes))onTime({restore:state.minutes});townAudio.setEnabled(state.sound);$('#soundButton').textContent=state.sound?'SOUND ON':'SOUND OFF';radioStation=state.radioStation||0;save();onWeather(state.weather);$('#weatherButton').textContent=state.weather?'RAIN':'CLEAR';
  return {action,inventory,close,save,spend,takeAbsence(){const elapsed=pendingAbsence;pendingAbsence=0;return elapsed;},note,inspectItem,openURL,quietRead,footstep(material){townAudio.step(material);},get paused(){return modalOpen;},get state(){return state;},visit(id){if(!state.visited.includes(id)){state.visited.push(id);save();}},tick(dt){ledgerView?.update();if(advancePrint(state,dt)){save();say('Your Form 3D model is ready. Collect it at the workshop.',5);}}};
}
