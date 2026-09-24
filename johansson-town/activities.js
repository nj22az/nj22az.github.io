import {isWorkshopSite} from './src/world/businesses.js';
import {harbourTimetable} from './src/people/commuter-schedule.js';
import {pendingTownAbsence} from './src/people/town-absence.js';
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
import {ensureDailyQuests,markDailyDone,hasDailyQuest,isDailyDone,NOTICE_NUDGE,RADIO_821} from './src/progression/soft-quests.js';
import {PROFILES} from './src/people/profiles.js';
import {RESIDENTS,residentHomeDescription} from './src/people/residents.js';
import {gossipAt,izakayaOpen,onsenInvitationDay} from './src/people/social.js';
import {DRINKS} from './src/people/izakaya-beer.js';
import {VENDING_PRODUCTS} from './src/commerce/vending-catalogue.js';
import {MEDICINES,STAMINA_DRINK} from './src/world/interiors/sakura-dressing.js';
import {STORE_ITEMS} from './src/commerce/catalogue.js';
import {SHOPIFY_CONFIG} from './src/commerce/shopify-config.js';
import {createShopify} from './src/commerce/shopify.js';
import {townAudio} from './src/audio/town-audio.js?snappy=1';
import {DIALOGUE} from './src/people/schedules.js?snappy=1';
import {JOURNAL} from './content-data.js';
import {SAVE_KEY,readSave,readPlayers,activePlayer,addPlayer,switchPlayer,renamePlayer,touchPlayer,slotKey} from './src/save.js';
import {createTownDialogue,restoreStory,countTalk,dialogueVariables} from './src/dialogue/town-dialogue.js';
import {createDialogueBox} from './src/dialogue/dialogue-box.js';
import {giftableItems,takeGift,giftReaction} from './src/people/thuan-gifts.js';
import {NEIGHBOUR_TALK} from './src/people/neighbours.js';
import {svg,itemIcon} from './src/ui/icons.js';
import {TOWN_FINDS} from './src/commerce/sakura-economy.js';
import {SAKURA_SCRIPT,sakuraEntry} from './src/dialogue/sakura-script.js';
import {createThuanMind} from './src/people/thuan-mind.js';
import {createThuanVoice} from './src/people/thuan-voice.js';
import {createThuanChat} from './src/people/thuan-chat.js';
import {GROCERY_ITEMS} from './src/commerce/catalogue.js';
import {closingStockPending,shelvesNeedRestock,applyStorageRestock,consumeStorageWonHandshake} from './src/commerce/shop-stock.js';
import {restoreKonbini,addToBasket,removeFromBasket,basketLines,basketTotal,warmableInBasket,
 checkoutQuote,checkout,receiptText,CARD_STAMPS,SAKURA_AWAY_MESSAGE,sakuraHoursOpen} from './src/commerce/konbini.js';

export function createActivities({say,getResidentLocations=()=>null,onConversation=()=>{},onDialoguePhase=()=>{},onWeather,onTime,getMinutes=()=>1002,getSocialContext=()=>({}),onPhone=()=>false,onEscort=()=>{},onPurchase=()=>false,onSeat=()=>false,onDrink=()=>false,onMap=()=>null,getTableService=()=>null,onStand=()=>{},onInspectModel=()=>{},onInspectShopGood=null,onMove=()=>{},getBeerTable=()=>null,onOrderDrink=()=>false,onSip=()=>false,onOutfit=()=>{},getOutfit=()=>false}) {
  const $=s=>document.querySelector(s);
  const defaults={yen:1200,inventory:[],visited:[],quest:0,fish:0,best:0,weather:false,sound:true,operated:[],inspectedIds:[],notes:['14 September 1997. Harbour Line: check the terminal timetable for day and night services.'],shrineIntent:null,kenjiEscort:false,quickTravelNotified:false,townMode:'shopping-district'};
  const realShop=createShopify(SHOPIFY_CONFIG);let modalRevision=0;
  let pendingAbsence=0,ledgerView=null;let state={...defaults},timer=null,modalOpen=false,previousFocus=null,radioStation=0;

  try {
    const saved=readSave(localStorage);
    if(saved&&typeof saved==='object'){pendingAbsence=pendingTownAbsence(saved);state.pendingTownMinutes=pendingAbsence;
      state.sakura=saved.sakura;state.townCleanup=saved.townCleanup;state.workshop=saved.workshop;state.story=saved.story;state.konbini=saved.konbini;state.residentLife=restoreResidentLife(saved.residentLife);state.residentLocations=saved.residentLocations;
      for(const k of ['yen','quest','fish','best'])if(Number.isFinite(saved[k])&&saved[k]>=0)state[k]=saved[k];
      state.yen=Math.min(state.yen,999999);state.quest=Math.min(state.quest,3);
      for(const k of ['inventory','visited','operated','inspectedIds','notes'])if(Array.isArray(saved[k]))state[k]=saved[k].filter(x=>typeof x==='string').slice(0,100);
      state.notes=state.notes.filter(n=>!n.includes('Website is the town')&&!/https?:/.test(n));state.clockAhead=Number.isFinite(saved.clockAhead)?Math.max(0,Math.min(10080,saved.clockAhead)):0;state.minutes=Number.isFinite(saved.minutes)?saved.minutes:1002;state.sound=saved.sound!==false;state.bookRescue=saved.bookRescue||0;state.radioStation=Number.isInteger(saved.radioStation)?Math.max(0,Math.min(2,saved.radioStation)):0;state.inventory=state.inventory.map(i=>i==='Mackerel'?'Sea bream':i);state.weather=saved.weather===true;state.shrineIntent=['Book','Work','Home'].includes(saved.shrineIntent)?saved.shrineIntent:null;state.kenjiEscort=[true,'walking','done'].includes(saved.kenjiEscort)?saved.kenjiEscort:false;if(Number.isInteger(saved.onsenDate)&&saved.onsenDate>=0)state.onsenDate=saved.onsenDate;state.quickTravelNotified=saved.quickTravelNotified===true;
      if(typeof saved.lastDayKey==='string')state.lastDayKey=saved.lastDayKey;if(Array.isArray(saved.dailyQuests))state.dailyQuests=saved.dailyQuests;if(saved.dailyDone&&(typeof saved.dailyDone==='object'))state.dailyDone=saved.dailyDone;
    }
  } catch {}

  state.story=restoreStory(state.story);
  ensureDailyQuests(state);
  state.konbini=restoreKonbini(state.konbini);
  state.sakura=restoreSakura(state.sakura);
  state.townCleanup=restoreTownCleanup(state.townCleanup);
  state.workshop=restoreWorkshop(state.workshop,state.inventory);
  state.townMode='shopping-district';

  const commuterDescription=name=>name==='Harbour master'?'The harbour office is staffed around the clock. I stay on the quay.':name==='Bus driver'?'I work the Harbour Line and stay at the northern terminal.':'I commute into the shopping district on the Harbour Line and leave by bus after my shift.';

  const characterControl=()=>window.__JOHANSSON_CHARACTER_CONTROL__;
  const modal=$('#activity'),heading=$('#activityTitle'),body=$('#activityBody'),actions=$('#activityActions');
  const dialogueBox=createDialogueBox({modal,heading,body,actions,isOpen:()=>modalOpen,leave:()=>close(),onPhase:phase=>onDialoguePhase(phase)});

  const workshopUI=createWorkshopUI({state,show,close,save,say,note,getContext:getSocialContext,getMinutes,preview:previewPrint,body,modal});

  async function previewPrint(model){
    show('Form 3D · '+model.name,'Preparing the model…',[['Close',close]]);const revision=modalRevision;
    try{const data=await loadWorkshopModel(model.id);if(!modalOpen||revision!==modalRevision)return;close();onInspectModel(printedItem(model,data));}
    catch{if(!modalOpen||revision!==modalRevision)return;show('Form 3D','The model could not be loaded. Your inventory is unchanged.',[['Try again',()=>previewPrint(model)],['Close',close]]);}
  }

  function save(){
    if(travelProgress(state).unlocked&&!state.quickTravelNotified){state.quickTravelNotified=true;state.notes.push('Earned the town shortcuts: Tama is home and Kenji’s workshop route is complete.');say('Town shortcuts unlocked! Quick travel is now in your Town Book.',7);}
    try {const locations=getResidentLocations();if(locations)state.residentLocations=locations;state.minutes=getMinutes();state.savedAt=Date.now();localStorage.setItem(slotKey(readPlayers(localStorage).active),JSON.stringify(state));touchPlayer(localStorage,state.savedAt);$('#saveState').textContent='PROGRESS SAVED';}
    catch {$('#saveState').textContent='SAVING UNAVAILABLE';}
    $('#wallet').textContent=`¥${state.yen.toLocaleString()}`;
  }
  function close(){dialogueBox.close();modal.classList.remove('bag-view');ledgerView=null;modal.classList.remove('sakura-records');workshopUI.dispose();modalRevision++;townAudio.stopSpeech();clearInterval(timer);timer=null;modalOpen=false;modal.classList.add('hidden');modal.classList.remove('conversation');modal.classList.remove('office-records');document.body.classList.remove('conversation-open');onConversation(null);window.__JOHANSSON_CHARACTER_CONTROL__?.setExpression?.('Thuan',null);previousFocus?.focus?.();}
  // options.mood: how Thuan's face looks for this line (her lines only; others release it).
  function show(title,text,buttons=[],options={}){
    modal.classList.remove('bag-view');ledgerView=null;modal.classList.remove('sakura-records');workshopUI.dispose();modal.classList.remove('office-records');
    modalRevision++;const revision=modalRevision;
    townAudio.stopSpeech();clearInterval(timer);timer=null;if(!modalOpen)previousFocus=document.activeElement;modalOpen=true;document.exitPointerLock?.();
    heading.textContent=title;body.classList.remove('signal');body.replaceChildren();
    const p=document.createElement('p');p.textContent=text;body.append(p);actions.replaceChildren();
    buttons.forEach(([label,fn,disabled=false,say])=>{const b=document.createElement('button');b.textContent=label;b.disabled=disabled;if(say!==undefined)b.dataset.say=say||'';b.onclick=()=>{if(modalOpen&&modalRevision===revision&&!b.disabled)fn();};actions.append(b);});
    const speaker=title.split('·')[0].trim();
    const conversation=speaker==='Thuan'||!!DIALOGUE[speaker]||!!NEIGHBOUR_TALK[speaker];
    modal.classList.toggle('conversation',conversation);document.body.classList.toggle('conversation-open',conversation);
    modal.classList.remove('hidden');onConversation(conversation?speaker:null,text);
    if(speaker==='Thuan')characterControl()?.setExpression?.('Thuan',options.mood||null);
    dialogueBox.present({title,text,conversation});
    if(!conversation)$('#closeActivity').focus();
  }
  // The bag: what you are carrying, as a tray of icons. Tap one to use it or look at it.
  function bag(){
    const counts=new Map();for(const item of state.inventory)counts.set(item,(counts.get(item)||0)+1);
    if(!counts.size){receipt('Bag','Your bag is empty.');return;}
    const models=new Set(printedModels(state.inventory).map(m=>m.name));
    show('Bag',`${state.inventory.length} thing${state.inventory.length===1?'':'s'} · ¥${state.yen.toLocaleString()}`,[['Field book',inventory],['Close',close]]);
    modal.classList.add('bag-view');
    const grid=document.createElement('div');grid.className='bag-grid';
    for(const [item,n] of counts){
      const tile=document.createElement('button');tile.type='button';tile.className='bag-tile';
      tile.innerHTML=svg(itemIcon(item,{printed:models.has(item)}),{size:34});
      const label=document.createElement('span');label.className='bag-name';label.textContent=item;tile.append(label);
      if(n>1){const count=document.createElement('b');count.className='bag-n';count.textContent='×'+n;tile.append(count);}
      tile.setAttribute('aria-label',n>1?`${item}, ${n}`:item);
      tile.onclick=()=>bagItem(item);grid.append(tile);
    }
    body.append(grid);
  }
  function bagItem(item){
    const model=printedModels(state.inventory).find(m=>m.name===item);
    const drinkable=['Canned coffee','Green tea'].includes(item)&&state.inventory.includes(item);
    const spec=GROCERY_ITEMS.find(g=>g.name===item),find=TOWN_FINDS.find(f=>f.name===item);
    const text=model?'A model you printed on the Form 3. Thuan would put it by the till.'
      :spec?spec.text:find?`Worth ¥${find.price} back at Sakura’s till.`
      :item==='Sea bream'?'Fresh from the pier. Nao — or Thuan — would know what to do with it.'
      :'Something you picked up in town.';
    show(item,text,[...(drinkable?[['Drink it',()=>{close();onDrink(item);}]]:[]),...(model?[['Look at it',()=>previewPrint(model)]]:[]),['Back to the bag',bag],['Close',close]]);
    modal.classList.add('bag-view');
    const hero=document.createElement('div');hero.className='bag-hero';hero.innerHTML=svg(itemIcon(item,{printed:!!model}),{size:56});body.prepend(hero);
  }
  function addItem(item){if(STORE_ITEMS.some(p=>p.name===item)||['Green tea','Canned coffee','Sea bream','Ice'].includes(item)||!state.inventory.includes(item))state.inventory.push(item);save();}
  function spend(n){if(state.yen<n){say('You do not have enough yen.');return false;}state.yen-=n;save();return true;}
  function receipt(title,text){show(title,text,[['Back',close]]);}
  function inventory(){
    const quest=['Speak to Aya beside the bookshop.','Find Tama, Aya’s cat, near the ramen stall. A fish might help.','Return to Aya with news of Tama.','Tama is safely home. Aya has paid you ¥500.'][state.quest];
    show('Field book',`${state.notes.join('\n')}\n\n${quest}\n\n${travelStatusText(state)}\n\nCash: ¥${state.yen} · Fish caught: ${state.fish}\nBag: ${state.inventory.length?state.inventory.join(', '):'Empty'}\nPlaces visited: ${state.visited.length}\nMachines tried: ${state.operated.length}\nStar Port best: ${state.best}`,[...['Canned coffee','Green tea'].filter(i=>state.inventory.includes(i)).map(i=>['Drink '+i,()=>{close();onDrink(i);}]),...printedModels(state.inventory).map(model=>['Inspect '+model.name,()=>previewPrint(model)]),['Konbini passport',konbiniPassport],['Back to town',close]]);
    const map=onMap();if(map)body.append(map);
  }


  // What the shop remembers of you: the card under the till, what you have tried, and
  // the last thing she rang through.
  function konbiniPassport(){
    const {visits,cards,stamps,tried,lastReceipt}=state.konbini;
    const stock=GROCERY_ITEMS.filter(item=>state.sakura.stock[item.id]);
    const names=tried.map(id=>GROCERY_ITEMS.find(item=>item.id===id)?.name).filter(Boolean).sort();
    const card='スタンプカード  '+'●'.repeat(stamps)+'○'.repeat(Math.max(0,CARD_STAMPS-stamps))+`  ${stamps}/${CARD_STAMPS}`;
    const body=[
      `Visits: ${visits}`,
      `Cards filled: ${cards}`,
      card,
      '',
      `Tried ${names.length} of ${stock.length} things she stocks.`,
      names.length?names.join(', '):'Nothing yet. The cooler is at the back.'
    ].join('\n');
    show('コンビニ手帳 · Konbini passport',body,
      [...(lastReceipt?[['Last receipt',()=>show('レシート · Receipt',receiptText(lastReceipt),[['Back',konbiniPassport]])]]:[]),
       ['Back to the field book',inventory]]);
  }

  function note(text){if(!state.notes.includes(text)){state.notes.push(text);state.notes=state.notes.slice(-100);save();}}
  function inspectItem(item){if(!state.inspectedIds.includes(item.id)){state.inspectedIds.push(item.id);note(item.note);save();}}
  function openURL(){say('The ledger is kept here in town.');}

  function quietRead(){if(!state.inspectedIds.includes('book')){receipt('Window chair','Lift The Venture from the display first. Aya has kept your place.');return;}let left=20;show('Quiet reading','Rain on the shutters. The street can wait.',[['Put down the book',close]]);timer=setInterval(()=>{left--;body.firstChild.textContent='A page, a breath, the harbour. '+left+' seconds.';if(left<=0){onTime(10);note('Read by the window. Ten town minutes passed.');receipt('Window chair','The bookmark is a ferry ticket. Returned it to the same page.');}},1000);}
  const histories=new Map();
  // Runs a ported gd_dialog script through the existing conversation modal: one speaker
  // line, its choices as buttons, and the node's own actions writing the story flags.
  function runDialogue(script,startId,title){
    const dialogue=createTownDialogue({script,state,note,getMinutes,
      getPlace:()=>getSocialContext().inside||'street',getRain:()=>state.weather===true});
    const render=frame=>{
      if(frame.done){save();close();return;}
      const buttons=frame.choices.length
        ? frame.choices.map(choice=>[choice.text,()=>render(dialogue.choose(choice.index))])
        : [[frame.endsHere?'See you soon, Thuan':'Go on',()=>render(dialogue.advance())]];
      // Each of her lines carries a mood (happy, sad, angry, shy...), and her face follows.
      show(title||frame.speaker||'',frame.text,buttons,{mood:frame.speaker==='Thuan'?frame.mood:null});
    };
    render(dialogue.start(startId));
    return dialogue;
  }

  // Thuan's story thread. The shop counter menu below stays as it is; this is the part
  // that remembers, so it is the part the flags and conditions drive.
  // Her unscripted side. Built on first use and never before: see thuan-chat.js for why
  // the download is opt-in. The written conversation below stays the default.
  let thuanChat=null;
  function askThuan(){
    if(!thuanChat){
      const mind=createThuanMind();
      const voice=createThuanVoice({face:{setSpeaking(value){
        window.__JOHANSSON_CHARACTER_CONTROL__?.setSpeaking?.('Thuan',value);
      }}});
      thuanChat=createThuanChat({show,close,body,mind,voice,
        onReply:reply=>window.__JOHANSSON_CHARACTER_CONTROL__?.setExpression?.('Thuan',reply.expression,reply.gesture),
        getContext:()=>{
          const m=((getMinutes()%1440)+1440)%1440;
          return 'It is '+String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')+
            (m>=540&&m<1200?' and the shop is open.':' and the shop is shut.');
        }});
    }
    thuanChat.open();
  }

  function thuanStory(){
    if(!modalOpen)window.__JOHANSSON_CHARACTER_CONTROL__?.gesture('Thuan');
    countTalk(state.story,getMinutes());
    const variables=dialogueVariables({story:state.story,minutes:getMinutes(),
      place:getSocialContext().inside||'street',rain:state.weather===true});
    return runDialogue(SAKURA_SCRIPT,sakuraEntry(variables),'Thuan · Sakura Shōten');
  }

  function thuanConversation(topic=null){
    if(!modalOpen)window.__JOHANSSON_CHARACTER_CONTROL__?.gesture('Thuan');
    const ramenVisit=getSocialContext().inside==='ramen',offDuty=getSocialContext().inside==='izakaya',onsenBath=getSocialContext().inside==='onsen';
    const commuterMode=state.townMode==='shopping-district';
    if(ramenVisit)note('Shared a ramen-shop break with Thuan after closing.');
    if(offDuty)note('Caught up with Thuan after closing at Minato Izakaya.');
    const met=state.notes.includes('Met Thuan, the heart of Sakura Konbini.');
    if(!met)note('Met Thuan, the heart of Sakura Konbini.');
    const replies={
      snack:'おすすめ？ 任せて！\nMy recommendation? Tea and a biscuit. The tea makes it a sensible decision. The biscuit makes it a good one.',
      ribbon:'髪？ ありがとう！\nMy hair? Thank you! I let it grow long and tie it back when I restock. On a hot day I braid it — my little sister says my plaits are crooked.',
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
    const greeting=onsenBath?'はぁ… 気持ちいい。\nYou came! Sit, sit — the water is perfect tonight. Listen: you can hear the sea on the other side of the fence. This is the best part of my whole day.':ramenVisit?'おつかれさま！\nSakura is locked up for the evening. I stopped for a bowl of ramen before heading on. There is a stool at the counter if you would like to join me.':offDuty?'あ、おつかれさま！\nYou found me! Sakura is all locked up. Nao saved me some supper. Come keep me company — I want to hear about your day.':met?'おかえり！\nYou are back! Welcome to Sakura. Looking for a snack, or shall we make the afternoon a little less ordinary?':'いらっしゃいませ！ トゥアンです。\nWelcome! I am Thuan. I keep Sakura stocked, the plants alive, and the radio just loud enough to sing along. What brings you in?';
    const title=onsenBath?'Thuan · Umi-no-yu':ramenVisit?'Thuan · Ramen break':offDuty?'Thuan · After hours':'Thuan · Heart of Sakura';
    if(topic){show(title,replies[topic],[['Tell me something else',()=>thuanConversation()],['See you soon, Thuan',close]]);return;}
    // A conversation, not a menu. Two pieces of small talk at a time, rotated so the
    // next time you stop by she has something else to say, and the shop's paperwork
    // folded away behind one button. Fourteen choices at once made her a directory.
    const smallTalk=[
      ['What is your favourite snack?','snack'],
      ['I like your hair','ribbon'],
      ['Where do you go after work?','town'],
      [commuterMode?'How do you travel?':'Where do you live?','home'],
      ['You make this place lovely','compliment'],
      ['Give me a little challenge','challenge'],
      ['Do you sing along to the radio?','radio'],
      ['Tell me a shop secret','secret'],
    ];
    const asked=histories.get('Thuan/small-talk')||[];
    const fresh=smallTalk.filter(([,id])=>!asked.includes(id));
    const offered=(fresh.length>=2?fresh:smallTalk).slice(0,2);
    histories.set('Thuan/small-talk',[...asked,...offered.map(([,id])=>id)].slice(-5));
    const paperwork=()=>show(title,'書類ね。\nThe shop side of things.',[
      ['Sell items from my bag',workshopUI.selling],
      ['Read the shop ledger',shopLedger],
      ['Back to Thuan',()=>thuanConversation()],
    ]);
    // Umi-no-yu: ask her along after work. She goes straight from locking up.
    const today=Math.floor(getMinutes()/1440),thuanProfile=PROFILES.find(p=>p.name==='Thuan');
    const onsenAsked=Number.isFinite(state.onsenDate)&&state.onsenDate>=today;
    const inviteOnsen=()=>{
     const day=onsenInvitationDay(thuanProfile,getMinutes(),false,state),tonight=day===today;
     state.onsenDate=day;save();
     show(title,(tonight?'お風呂？ いいね！\nYes — tonight, straight after I lock up. ':'今夜はもう遅いから… 明日ね！\nTonight it is too late for me, but tomorrow, straight after I lock up. ')+'I will be in the rock bath by the sea wall. Bring your swimsuit — they are strict about that at Umi-no-yu. Pay Higa-san at the bandai.',[['See you at the bath',close]]);
    };
    // A present from your bag. She is delighted; a second the same day makes her shy.
    const gifts=giftableItems(state.inventory);
    const giveGift=()=>show(title,'え、何かくれるの？\nFor me? What have you brought?',[
      ...gifts.slice(0,8).map(item=>[item,()=>{
        if(!takeGift(state.inventory,item)){thuanConversation();return;}
        const story=state.story,day=Math.floor(getMinutes()/1440);
        if(story.gift_day!==day){story.gift_day=day;story.gifts_today=0;}
        const reaction=giftReaction(item,{giftsToday:story.gifts_today});
        story.gifts_today=Math.min(999,story.gifts_today+1);story.gifts_given=Math.min(999,story.gifts_given+1);
        note('Gave Thuan a present: '+item+'.');save();
        characterControl()?.feel?.('Thuan',reaction.mood,10);
        show(title,reaction.text,[['Back to Thuan',()=>thuanConversation()],['See you soon, Thuan',close]],{mood:reaction.mood});
      },false,'I brought you this — '+item.toLowerCase()+'.']),
      ['Never mind',()=>thuanConversation()]]);
    show(title,greeting,[
      ...(basketTotal(state)?[[`Pay for ${basketLines(state).reduce((n,l)=>n+l.count,0)} item(s) · ¥${basketTotal(state)}`,konbiniCounter]]:[]),
      ['Talk with Thuan',thuanStory],
      ...(gifts.length?[['Give her a present',giveGift]]:[]),
      ...(onsenBath?[]:[[onsenAsked?'Umi-no-yu after work — still on':'Come to Umi-no-yu after work',onsenAsked?()=>show(title,state.onsenDate===today?'Of course! After I lock up. The rock bath, by the sea wall.':'Tomorrow, after I lock up. I have not forgotten.',[['Back to Thuan',()=>thuanConversation()]]):inviteOnsen]]),
      ...offered.map(([label,id])=>[label,()=>thuanConversation(id)]),
      ['Ask her something',askThuan],
      ['The shop side of things',paperwork],
      ['See you soon, Thuan',close],
    ]);
  }
  // The people of the new streets: a few things each to say, in turn, and the odd thing
  // to sell. See src/people/neighbours.js.
  const neighbourTurns=new Map();
  const NEIGHBOUR_SALES=Object.freeze({
   'Mrs Nakamura':['A zenzai, please · ¥250',250,'Zenzai','She shaves the ice straight into the glass, spoons the beans over and pushes it across. “Eat it before it eats you.”'],
   'Mrs Yonamine':['A tray of mozuku · ¥200',200,'Mozuku','A tray of mozuku in vinegar, wrapped in newspaper. “Good for everything,” she says again, in case you missed it.'],
   'Kōji':['I’ll take the tuna head',0,'Tuna head','He wraps it in two newspapers and a plastic bag, and it is still looking at you. “Soup,” he says. “Trust me.”'],
   'Mrs Kinjō':null,
  });
  function neighbour(name){
    const spec=NEIGHBOUR_TALK[name];if(!spec){close();return;}
    const turn=neighbourTurns.get(name)||0;neighbourTurns.set(name,turn+1);
    const line=spec.lines[turn%spec.lines.length],buttons=[];
    const sale=NEIGHBOUR_SALES[name];
    if(sale)buttons.push([sale[0],()=>{if(sale[1]&&!spend(sale[1]))return;onTime(2);addItem(sale[2]);tone(700,.12);show(name+' · '+spec.role,sale[3],[['Thank you',close]]);}]);
    if(spec.lines.length>1)buttons.push(['Tell me more',()=>neighbour(name)]);
    buttons.push(['See you later',close]);
    show(name+' · '+spec.role,line,buttons);
  }
  function resident(name){
    if(name==='Thuan'){thuanConversation();return;}

    const all=DIALOGUE[name];if(!all){legacyResident(name);return;}
    const history=histories.get(name)||[];
    const commuterMode=state.townMode==='shopping-district';
    // The home topic keeps its place in the rotation while commuting. Dropping it
    // left the thinner residents three usable lines against a three-deep history,
    // so their opening line came round again every fourth time they were asked.
    const available=all.filter(([id,line,requires])=>(!requires||state.inspectedIds.includes(requires))&&!history.includes(id));
    // Newly discovered callbacks take precedence, then cycle through authored topics.
    const row=available.find(r=>r[2])||available[0]||all[0];history.push(row[0]);histories.set(name,history.slice(-3));
    let text=commuterMode&&row[0]==='home'?commuterDescription(name):row[1];
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

  /** At your own table in Minato: order a beer, drink it, eat, or get up. */
  function izakayaTable(){
    const table=getBeerTable()||{},drink=table.drink,order=table.order,buttons=[];
    let text=izakayaOpen(getMinutes())?'Lanterns, the radio low, the smell of the grill. Nao is behind the counter.':'Minato is closing. Nao is stacking the stools.';
    if(order)text='Nao is '+(order.phase==='pouring'?'pouring your '+DRINKS[order.kind].en.toLowerCase():'on her way over with it')+'.';
    else if(drink)text='Your '+DRINKS[drink.kind].en.toLowerCase()+' is in front of you'+(drink.left<drink.sips?', '+drink.left+' sips left':', untouched')+'.';
    if(drink&&drink.left>0)buttons.push([drink.left===drink.sips?'乾杯 · Kanpai, and drink':'Drink',()=>{close();onSip();}]);
    if(!order&&(!drink||drink.left<=1)&&izakayaOpen(getMinutes())){
      if(!table.naoHere)text+='\n\nNao is not at the counter just now.';
      else for(const d of Object.values(DRINKS))buttons.push([d.jp+' · ¥'+d.price,()=>{
        if(!spend(d.price))return;
        if(!onOrderDrink(d.id)){state.yen+=d.price;save();receipt('Minato','Nao is busy -- try again in a moment.');return;}
        onTime(2);note('Ordered '+d.en.toLowerCase()+' at Minato.');close();say('「すみません、'+d.jp+'ください！」 Nao nods and reaches for '+(d.id==='draft'?'a mug.':d.id==='bottle'?'a big bottle.':d.id==='can'?'the fridge.':'the tea jug.'),4);
      }]);
    }
    buttons.push(['Something to eat',izakayaMenu],['Stand up',()=>{close();onStand();}],['Stay seated',close]);
    show('居酒屋 みなと · your table',text,buttons);
  }
  function izakayaMenu(){
    if(!izakayaOpen(getMinutes())){close();say('Minato closes at 03:00. Nao is locking up.');return;}
    show('Minato · Tonight’s little pleasures','Nao: Choose something you like. The stories are on the house.',[
      ...[['Yakitori plate',180,'Sweet soy glaze, three little skewers, and a very satisfied silence.'],['Edamame & barley tea',120,'Warm beans and cold barley tea. Nao settles a tiny saucer beside your cup.'],['Oden supper',260,'Daikon, egg and tofu, simmered until the day feels a little kinder.'],['Small beer',180,'A little glass of harbour lager. Someone at the next table starts a story.']].map(([name,cost,detail])=>[name+' · ¥'+cost,()=>{if(!izakayaOpen(getMinutes())){izakayaMenu();return;}if(!spend(cost))return;onTime(8);note('Supper at Minato: '+name+'.');show('Supper at Minato',detail,[['Listen to the table',izakayaGossip],['Something else?',izakayaMenu],['Enjoy the room',close]]);}]),
      ['Just looking, thank you',close]
    ]);
  }
  // Minato school. Lunch is kyūshoku: eaten in the classroom, the same meal for everyone,
  // the teacher included, and a visitor who turns up at the right time gets a tray too.
  function kyushoku(phase,menu){
    if(phase!=='serving'&&phase!=='lunch'){
      show('Kyūshoku trolley','The stainless trolley parked by the pantry, its cauldrons scrubbed and upside down. Lunch is at 12:20: the lunch squad fetches it from the prep kitchen and serves at the front.',[['Back',close]]);return;
    }
    const dishes=menu?.jp?.join('、')||'';
    show('給食 · Kyūshoku','Yonamine-sensei waves you over: "There is always a spare tray. Sit with han three." The lunch squad, in white smocks and caps and gauze masks, ladles it out: '+(menu?.en||'')+'.',[
      ['Take a tray · いただきます',()=>{onTime(phase==='serving'?30:18);note('Ate kyūshoku with the 5・6年 class: '+dishes+'.');
        show('いただきます！','Twelve voices and one teacher, all at once. '+(menu?.en?menu.en[0].toUpperCase()+menu.en.slice(1):'')+'. The bottle of milk is cold, and finishing it before you leave the table is not optional. Across the han, Kenta is trying to trade his goya to anyone who will take it. At the end: ごちそうさまでした, trays stacked, milk bottles rinsed at the corridor taps, and everybody is already rolling up their sleeves for sōji.',[['Help with sōji',()=>{onTime(15);receipt('Sōji','Desks to the back, brooms down the rows, wet rags pushed along the floorboards at a run. The class finishes in fifteen minutes flat and the floor shines.');}],['Thank the class',close]]);}],
      ['Just watch',close]]);
  }
  // The class pantry. Anyone can use it after school, if they leave it as they found it and
  // put something in the ingredients jar.
  const PANTRY_DISHES=[
    ['Sata andagi',100,25,'Balls of dough dropped into the oil, turning themselves over as they puff and crack open. Crisp outside, cake inside. Mai says hers are the best and they are.'],
    ['Onigiri',50,10,'Rice from the class cooker, salt on your palms, a strip of nori. Three triangles, slightly lopsided, wrapped in a sheet of the class\'s newspaper.'],
    ['Barley tea',20,8,'A kettle of mugicha, poured into the big plastic jug and set in a bowl of tap water to cool. It tastes of every summer afternoon.'],
    ['Goya champuru',150,20,'Bitter melon, tofu, egg and a few slices of luncheon meat, stir-fried in the big pan on the gas ring. The bitterness is the point, says Sensei.'],
  ];
  function schoolPantry(phase){
    const club=phase==='club';
    const intro=club?'The home-economics club is at the pantry: three pupils in aprons and Yonamine-sensei with the andagi pot. "Wash your hands first. Then you can help."':
      phase==='lesson'||phase==='lesson-pm'?'A lesson is on. The pantry can wait until after school -- the jar says ¥ on it, for ingredients.':
      'The class pantry: a sink, two gas rings, the rice cooker, a shelf of trays and bowls, and a jar for ingredient money. Clean up after yourself.';
    if(phase==='lesson'||phase==='lesson-pm'){show('Class pantry',intro,[['Back',close]]);return;}
    show('Class pantry',intro,[...PANTRY_DISHES.map(([dish,cost,minutes,text])=>[`Make ${dish.toLowerCase()} · ¥${cost} in the jar`,()=>{
      if(!spend(cost))return;onTime(minutes);addItem(dish);note('Made '+dish.toLowerCase()+' in the 5・6年 pantry.');receipt(dish,text+' It is in your bag.');}]),['Leave it for now',close]]);
  }
  function schoolTeacher(phase){
    const lines={
      morning:'"Good morning! You are early. The children will be in soon -- they walk along the seawall, which they are not supposed to."',
      lesson:'"We are dividing fractions. The sixth-graders help the fifth-graders; with twelve of them in one room, everyone teaches someone."',
      'lesson-pm':'"Social studies: the fishing co-op. Half their parents are in it, so the children correct me."',
      serving:'"The lunch squad is serving. Wait your turn -- and if you are staying, there is a spare tray."',
      lunch:'"We eat together. It is a lesson too: gratitude, manners, and nothing left on the plate."',
      cleaning:'"Sōji! Everybody cleans, teachers too. The floor will not wipe itself."',
      club:'"Home-ec club. Sata andagi today -- the oil has to be just right, one hundred and seventy degrees."',
      after:'"The children have gone home. I am marking notebooks. Would you like some barley tea from the pantry?"',
      weekend:'"No school today. I came in to water the morning glories on the windowsill."',
      closed:'Nobody here. The notebooks are stacked on the teacher\'s desk, the chairs are up on the desks.'};
    const text=lines[phase]||lines.closed;
    show(phase==='closed'?'Empty classroom':'与那嶺先生 · Yonamine-sensei',text,[['Thank you',close]]);
  }
  // The medicine shelf behind Sakura's till. Nothing on it is self-service: you ask, and
  // Thuan reaches it down and tells you how many to take.
  function sakuraMedicine(){
    const m=((getMinutes()%1440)+1440)%1440;
    if(m<540||m>=1200){show('Medicine shelf','The till is closed. The boxes behind it wait for 09:00.',[['Back',close]]);return;}
    const items=[...MEDICINES.filter(i=>['kaze','itami','ichou','megusuri','nodo','bansoko','shippu','katori','mushi','vitamin'].includes(i.id)),STAMINA_DRINK];
    show('くすり · Medicine shelf','Thuan: "What do you need? If it is more than a cold, the clinic boat comes on Thursdays."',[
      ...items.map(item=>[`${item.jp} · ¥${item.price.toLocaleString('en-GB')}`,()=>{if(!spend(item.price))return;onTime(2);addItem(item.en);townAudio.play('click',.35);
        receipt(item.jp,item.en+' is in your bag. Thuan writes the dose on the box in marker, the way she does for everyone.');}]),
      ['Nothing, thank you',close]]);
  }
  // Local players: several people can keep their own progress on one device. Switching
  // reloads the town from that player's save, which is the only way to be sure nothing
  // from the last player is still in memory.
  function players(){
    let roster=readPlayers(localStorage);const me=roster.players.find(p=>p.id===roster.active);
    const when=t=>t?new Date(t).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'never';
    const others=roster.players.filter(p=>p.id!==roster.active);
    show('Player · '+(me?.name||'Visitor'),'Progress saves on this device, automatically every few seconds and whenever you leave. Last saved: '+when(state.savedAt)+'.',[
      ['Save now',()=>{save();receipt('Saved','Saved for '+(me?.name||'Visitor')+' at '+when(Date.now())+'.');}],
      ['Rename player',()=>{const name=globalThis.prompt?.('Name for this player',me?.name||'');if(name&&renamePlayer(localStorage,name)){players();}}],
      ...others.map(p=>['Switch to '+p.name+' · '+when(p.lastPlayed),()=>{save();switchPlayer(localStorage,p.id);globalThis.location?.reload?.();}]),
      ['New player',()=>{const name=globalThis.prompt?.('Name for the new player','');if(!name)return;save();addPlayer(localStorage,name);globalThis.location?.reload?.();}],
      ['Export save file',exportSave],
      ['Import save file',importSave],
      ['Close',close]]);
  }
  function exportSave(){
    save();const me=activePlayer(localStorage);
    try{const blob=new Blob([JSON.stringify({game:'johansson-town',version:1,player:me?.name,savedAt:state.savedAt,state},null,1)],{type:'application/json'});
      const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='johansson-town-'+(me?.name||'player').replace(/\W+/g,'-').toLowerCase()+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);}
    catch{receipt('Export','This browser would not save the file.');}
  }
  function importSave(){
    const input=document.createElement('input');input.type='file';input.accept='application/json,.json';
    input.onchange=async()=>{
      const file=input.files?.[0];if(!file)return;
      try{const data=JSON.parse(await file.text());if(data?.game!=='johansson-town'||!data.state||typeof data.state!=='object')throw Error('not a save');
        const id=addPlayer(localStorage,data.player||file.name.replace(/\.json$/,''));localStorage.setItem(slotKey(id),JSON.stringify(data.state));globalThis.location?.reload?.();}
      catch{receipt('Import','That file is not a Johansson Town save.');}
    };
    input.click();
  }
  // Umi-no-yu. The bath keeps municipal hours; the footbath outside never closes.
  // Inside Umi-no-yu (src/world/interiors/onsen.js): pay at the bandai, change, bathe.
  const townDay=()=>Math.floor(getMinutes()/1440);
  const onsenPaid=()=>state.onsenPaidDay===townDay();
  function onsenPay(){
    const m=((getMinutes()%1440)+1440)%1440;
    if(m<600||m>=1320){show('海の湯 · Umi-no-yu','Higa-san is counting the day’s coins. "The bath is closed -- ten o’clock tomorrow. The footbath outside never closes."',[['Back',close]]);return;}
    if(onsenPaid()){receipt('海の湯 · Umi-no-yu','You have paid for today. Higa-san waves you through without looking up.');return;}
    show('海の湯 · Umi-no-yu','Higa-san looks up from her crossword. Adults ¥300. Swimwear in the water -- it is a family bath.',[
      ['Pay ¥300',()=>{if(!spend(300))return;state.onsenPaidDay=townDay();save();note('Bathed at Umi-no-yu.');receipt('海の湯 · Umi-no-yu','Three coins in the tray. "Lockers through the curtain. Wash before you get in."');}],
      ['Not today',close]]);
  }
  function onsenMilk(){
    show('Coffee milk','Cold coffee milk in a glass bottle, ¥100. It is drunk standing up, hand on hip, all in one go.',[
      ['Buy one · ¥100',()=>{if(!spend(100))return;onTime(1);addItem('Coffee milk');onMove('Drink');receipt('Umi-no-yu','The cap pops off with your thumbnail. It is gone in five swallows. The bottle goes back in the crate.');}],
      ['Back',close]]);
  }
  function onsenChange(){
    const swimming=getOutfit();
    show('Lockers',swimming?'Your clothes are folded in locker 14, the key on its rubber band round your wrist.':'A locker with a brass key on a rubber band. The notice says swimwear in the bath.',[
      [swimming?'Get dressed':'Change into swimwear',()=>{close();onOutfit(!swimming);}],['Back',close]]);
  }
  function onsen(){
    const m=((getMinutes()%1440)+1440)%1440;
    if(m<600||m>=1320){show('海の湯 · Umi-no-yu','The glass doors are locked and the lamps inside are out. A card in the window: 10:00–22:00. The footbath outside is still warm.',[['Back',close]]);return;}
    show('海の湯 · Umi-no-yu','The attendant at the desk looks up from a crossword. Adults ¥300; a towel is ¥100 more, or bring your own.',[
      ['Bathe · ¥300',()=>{if(!spend(300))return;onTime(40);note('Bathed at Umi-no-yu.');
        show('The rock bath','You wash at the low taps, then lower yourself into the outdoor bath a little at a time. Over the bamboo on the sea side the harbour lights come and go in the steam. Forty minutes pass without asking.',[
          ['Coffee milk from the fridge · ¥100',()=>{if(!spend(100))return;addItem('Coffee milk');receipt('Umi-no-yu','Cold coffee milk in a glass bottle, drunk standing up, hand on hip. The bottle goes back in the crate.');}],
          ['Step back outside',close]]);}],
      ['Not today',close]]);
  }
  function izakayaGossip(){
    if(!izakayaOpen(getMinutes())){izakayaMenu();return;}
    const social=getSocialContext(),gossip=gossipAt(getMinutes(),social.names||[]);note(gossip.clue);
    show('Overheard at Minato',gossip.line+'\n\n'+gossip.clue,[['Stay a little longer',()=>{onTime(7);izakayaGossip();}],['Back to the evening',close]]);
  }
  function vending(){show('MINATO DRINKS · 自動販売機','A harbour break. Choose a chilled drink · ¥120.',[...VENDING_PRODUCTS.map(product=>[product.label,()=>buyDrink(product)]),['Leave',close]]);}
  function buyDrink(product){if(!spend(product.price))return;onTime(1);onMove('Give');const name=product.inventoryName;addItem(name);townAudio.play('clunk',.7);close();if(!onPurchase(name))receipt('Thank you',`${product.brand} — ${name} is in your bag.`);}

  function legacyResident(name){
    if(name==='Aya'){
      if(state.quest===0){show('Aya · Bookshop assistant','My ginger cat Tama has wandered off again. He likes the warm corner by the ramen stall. Would you find him?',[['I will look for Tama',()=>{state.quest=1;save();receipt('A note in your notebook','Look near the ramen stall. If Tama is hungry, try the fishing pier.');}],['Later',close]]);}
      else if(state.quest===2){state.quest=3;state.yen+=500;save();receipt('Aya','Tama followed you back to the shopping street! Thank you. Please take ¥500 for your trouble. That is one town favour complete — your Field book tracks the shortcuts you can earn.');}
      else receipt('Aya',state.quest===3?'Tama is sleeping upstairs. The harbour is lovely at sunset.':'Try the ramen stall further down the street. Tama cannot resist fresh fish.');
      return;
    }
    const lines={
      Kenji:'The Star Port cabinet is outside the workshop. Stop the signal in the illuminated zone three times to win. It costs ¥100; a perfect round pays ¥250.',
      'Mrs Sato':'Ramen is ¥300 today. The payphone near the bookshop still works, and the Harbour Line timetable is at the northern terminal.',
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
      // Waiting for a bite is the time the town gets on without you.
      ['Cast line',()=>{onTime(8);onMove('Cast');let elapsed=0,biteAt=2+Math.random()*2.5,caught=false;show('Harbour fishing','Waiting for a bite…',[
        ['Reel in',()=>{if(caught)return;caught=true;onMove('Reel');if(elapsed>=biteAt&&elapsed<biteAt+1.35){state.fish++;if(state.fish===2){addItem('Waterlogged page · Kings of Ben…');note('Recovered a Book Three fragment: Kings of Ben…');receipt('A waterlogged page','Only “Kings of Ben…” survives. Aya will want this dried away from the stove.');return;}addItem('Sea bream');tone(880,.2);receipt('A sea bream!','A fresh sea bream is in your bag. Keep it, give it to Tama, or sell it to the harbour master.');}else receipt('The line is empty','You reeled in too soon. Watch for BITE.');}],
        ['Put away the rod',close]
      ]);timer=setInterval(()=>{elapsed+=.05;if(elapsed>=biteAt&&elapsed<biteAt+1.35){body.firstChild.textContent='BITE — REEL IN NOW';body.classList.add('signal');}if(elapsed>=biteAt+1.35){body.classList.remove('signal');receipt('The fish got away','Try again and reel in when BITE appears.');}},50);}],
      ['Leave',close]
    ]);
  }

  function arcade(){
    show('STAR PORT','A 1988 cabinet, nine years on and still taking hundred-yen coins. Stop the moving signal inside the green zone. Three rounds. Entry ¥100; three hits pays ¥250.',[
      ['Insert ¥100',()=>{if(!spend(100))return;onTime(4);let round=0,hits=0,start=performance.now(),position=0;function next(){show(`STAR PORT · Round ${round+1}/3`,`Successful docks: ${hits}`,[['DOCK',()=>{if(position>=.36&&position<=.64){hits++;tone(700,.1);}else tone(170,.12);round++;if(round===3){state.best=Math.max(state.best,hits);if(hits===3){state.yen+=250;if(state.kenjiEscort!=='done')state.kenjiEscort=true;note('Perfect Star Port run. Kenji offered a workshop escort.');}save();receipt('STAR PORT · Results',`${hits}/3 successful docks.${hits===3?' Perfect run — ¥250 paid.':' Try another flight at the cabinet.'}`);}else{start=performance.now();next();}}],['Leave cabinet',close]]);const track=document.createElement('div');track.className='arcade-track';track.innerHTML='<span class="target-zone"></span><span class="arcade-marker"></span>';body.append(track);timer=setInterval(()=>{position=(Math.sin((performance.now()-start)/380)+1)/2;track.lastChild.style.left=`${position*100}%`;},25);}next();}],
      ['Leave',close]
    ]);
  }

  function tone(){townAudio.play('click',.35);}
  function toggleSound(){state.sound=!state.sound;townAudio.setEnabled(state.sound);$('#soundButton').textContent=state.sound?'SOUND ON':'SOUND OFF';save();}

  function inspect(name,detail){if(name==='Convex traffic mirror'){note('Traffic mirror: Tama was behind me. No cat when I turned.');say('A ginger shape in the mirror. Behind you: only the street.',5);}show(name,detail||'A thumb-sized clean patch marks the part everybody touches.',[['Close',close]]);}
  function read(name,detail){if(/harbour notice/i.test(String(name))&&hasDailyQuest(state,'notice')&&!isDailyDone(state,'notice')){markDailyDone(state,'notice');save();say(NOTICE_NUDGE,6);}show(name,detail||'One corner is pinned with a bent brass tack. Read the complete dispatch at the Field Notes rack.',[['Put it back',close]]);}
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
  // A konbini is not a vending machine: things go in the basket and are paid for at the
  // counter, where Thuan rings them through.
  // TalkFun one-liners on lift — Thuan's voice, never Yuri's.
  const EXAMINE_LINES=Object.freeze({
    tea:'Back of the cooler is colder. Front ones cooked.',
    coffee:'Harbour walk fuel. Don\'t shake it.',
    rice:'Wrapped this afternoon. Plum\'s in the middle.',
    biscuit:'Corner folded so they don\'t rattle.',
    soap:'Smells like the pink paper, not the flower.',
    notebook:'For tide times. Or excuses.',
    postcard:'Old breakwater. Photographer still owes me change.',
    battery:'For the radio. Ask before you open the hatch.',
  });
  function storeItem(item){
    // Prefer the Field-book orbit when the game wired an inspector; tests keep the dialogue path.
    if(typeof onInspectShopGood==='function'){
      const brand=item.brand||'',jp=item.jp||'',name=item.name||item.id;
      const caption=[brand,jp,name].filter(Boolean).filter((v,i,a)=>a.indexOf(v)===i).join(' · ')+' · ¥'+item.cost;
      onInspectShopGood({
        kind:'shop-good',id:'shop-'+item.id,productId:item.id,title:name+' · ¥'+item.cost,caption,
        liftLine:EXAMINE_LINES[item.id]||'Shelf price is the price.',
        canTalk:()=>getSocialContext().inside==='market'&&getSocialContext().thuanAvailable!==false,
        onBuy:()=>{
          const result=addToBasket(state,item);save();
          receipt(result.ok?'Basket':'Sakura Shōten',result.ok
            ?result.message+' '+basketLines(state).reduce((n,l)=>n+l.count,0)+' item(s), ¥'+basketTotal(state)+'. Pay at the counter.'
            :result.message);
        },
        onTalk:()=>{action('resident','Thuan');},
      });
      return;
    }
    const available=state.sakura.stock[item.id]?.shelf||0;
    const held=state.konbini.basket.filter(id=>id===item.id).length;
    const carrying=state.konbini.basket.length;
    const note=available?'On shelf: '+available+(held?' · in your basket: '+held:''):'Thuan: Sorry, we’ve sold out. Please come back tomorrow.';
    show(item.jp+' · '+item.name,item.text+'\n\n'+note,[
      [`Into the basket · ¥${item.cost}`,()=>{
        const result=addToBasket(state,item);save();
        receipt(result.ok?'Basket':'Sakura Shōten',result.ok
          ?result.message+' '+basketLines(state).reduce((n,l)=>n+l.count,0)+' item(s), ¥'+basketTotal(state)+'. Pay at the counter.'
          :result.message);
      },!available],
      ...(carrying?[[`Take ¥${basketTotal(state)} to the counter`,konbiniCounter]]:[]),
      ...(realShop.enabled&&SHOPIFY_CONFIG.products[item.id]?[['View real-world product',()=>realProduct(item)]]:[]),
      ['Put it back',close]]);
  }

  // --- the counter -------------------------------------------------------------
  // Thuan's half of the exchange, in the order a 1997 konbini would run it: warm it,
  // a bag, the stamp card, then cash and change.
  let counterWarm=null,counterBag=null;
  function konbiniCounter(){
    const lines=basketLines(state);
    if(!lines.length){receipt('Sakura Shōten','Your basket is empty.');return;}
    // Same presence gate as Form 3 sell: posted hours alone must not ring an empty till.
    if(getSocialContext().thuanAvailable===false&&sakuraHoursOpen(getMinutes())){
      receipt('Sakura Shōten',SAKURA_AWAY_MESSAGE);return;
    }
    const listing=lines.map(l=>`${l.jp} ${l.name}${l.count>1?' ×'+l.count:''} · ¥${l.cost*l.count}`).join('\n');
    const warmable=warmableInBasket(state);
    if(warmable.length&&counterWarm===null){
      show('Thuan · Counter',listing+'\n\n温めますか？\nShall I warm the '+warmable.map(l=>l.name.toLowerCase()).join(' and ')+'?',
        [['Yes, please',()=>{counterWarm=true;konbiniCounter();}],['No, thank you',()=>{counterWarm=false;konbiniCounter();}],
         ['Put something back',konbiniBasket]]);
      return;
    }
    if(counterBag===null){
      show('Thuan · Counter',listing+'\n\n袋はご利用ですか？\nDo you need a bag?',
        [['Yes, please',()=>{counterBag=true;konbiniCounter();}],
         ['I have my own',()=>{counterBag=false;konbiniCounter();}],
         ['Put something back',konbiniBasket]]);
      return;
    }
    const quote=checkoutQuote(state,{warm:counterWarm===true,bag:counterBag!==false});
    const card=quote.cardFull?'\n\nカード満了 · that fills your stamp card.'
      :`\n\nスタンプカード · ${state.konbini.stamps}/${CARD_STAMPS}${quote.stampsEarned?', +'+quote.stampsEarned+' with this':''}`;
    show('Thuan · Counter',listing+`\n\n合計 ¥${quote.total}\nShe waits with her hand on the till.`+card,
      [[`Pay ¥${quote.total} in cash`,payAtCounter],['Put something back',konbiniBasket],['Not yet',close]]);
  }

  function payAtCounter(){
    const result=checkout(state,{warm:counterWarm===true,bag:counterBag!==false},getMinutes(),getSocialContext().thuanAvailable!==false);
    counterWarm=null;counterBag=null;
    if(!result.ok){receipt('Sakura Shōten',result.message);return;}
    onTime(3);   // the counter ritual takes a few minutes
    save();
    const bought=result.receipt.lines.map(l=>l.name);
    if(bought.some(name=>['Green tea','Canned coffee'].includes(name)))onPurchase(bought.find(name=>['Green tea','Canned coffee'].includes(name)));
    note('Shopped at Sakura Shōten · ¥'+result.receipt.total+'.');
    if(result.receipt.gift)note('Filled a Sakura stamp card. Thuan put a green tea on the counter.');
    // A sale makes her day a little: she beams, and is still smiling as you leave.
    characterControl()?.feel?.('Thuan','happy',8);
    const thanks=result.receipt.gift
      ?'ありがとうございました！\nThank you! And that fills your card — the green tea is on the house. Do not tell the assistant manager.'
      :['ありがとうございました！\nThank you! Come back soon — the cooler gets lonely.',
        'ありがとうございました！\nThank you! I put the receipt in the bag so it does not blow away on the quay.',
        'まいど！\nThank you! You are my favourite customer today. Do not tell the others.'][state.konbini.visits%3];
    show('Thuan · Counter',thanks,[
      ['Look at the receipt',()=>show('レシート · Receipt',receiptText(result.receipt),[['Into your pocket',close]])],
      ['Thank you, Thuan',close]],{mood:'happy'});
  }

  function konbiniBasket(){
    const lines=basketLines(state);
    if(!lines.length){counterWarm=null;counterBag=null;receipt('Basket','Your basket is empty.');return;}
    show('かご · Basket',`${lines.reduce((n,l)=>n+l.count,0)} item(s) · ¥${basketTotal(state)}`,
      [...lines.map(line=>[`Put back ${line.name}${line.count>1?' (×'+line.count+')':''}`,()=>{
        removeFromBasket(state,line.id);counterWarm=null;save();konbiniBasket();
      }]),['Back to the counter',konbiniCounter],['Close',close]]);
  }
  function buy(name,detail){
    const spec=detail&&typeof detail==='object'?detail:{};const cost=Number.isFinite(spec.cost)?Math.max(0,Math.round(spec.cost)):100,item=typeof spec.item==='string'?spec.item:name,text=typeof spec.text==='string'?spec.text:`${name} is ready to purchase.`;
    show(name,text,[[`Buy · ¥${cost}`,()=>{if(!spend(cost))return;onTime(2);addItem(item);tone(700,.12);receipt(name,`${item} has been added to your bag.`);}],['Leave',close]]);
  }
  function radio(name,detail){
    const stations=[
      RADIO_821,
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
  function storageRestock(){
    state.sakura=restoreSakura(state.sakura);
    const minutes=getMinutes();
    if(!(closingStockPending(state,minutes)||shelvesNeedRestock(state))){
      show('Stockroom','Shelves are already set.',[['Leave',close]]);
      return;
    }
    const day=Math.floor(minutes/1440);
    show('Thuan\'s stockroom','Cartons wait in the back room. Restock the shelves before the next open.',[
      ['Play as Thuan',()=>{close();location.href='/thuans-storage/?from=johansson-town&mode=play&day='+day;}],
      ['Let Thuan restock',()=>{close();location.href='/thuans-storage/?from=johansson-town&mode=auto&day='+day;}],
      ['Leave',close],
    ]);
  }
  function consumeStorageRestock(){
    const handshake=consumeStorageWonHandshake();
    if(!handshake)return false;
    state.sakura=restoreSakura(state.sakura);
    applyStorageRestock(state,getMinutes());
    save();
    say('Shelves restocked.',4);
    return true;
  }
  function action(kind,name,detail){
    body.classList.remove('signal');
    switch(kind){
      case 'workshop':workshopUI.printer();break;
      case 'town-cleanup':{const result=collectTownFind(state,name);if(!result.ok){receipt('Town clean-up',result.message);break;}save();receipt('Street tidied',result.name+' is in your bag. Thuan offers ¥'+result.price+' when the shop has enough takings.');break;}
      case 'stepwise':if(isWorkshopSite(getSocialContext().inside))inspectItem({id:'stepwise',note:'Checked the workshop calculator.'});workshopUI.stepwise();break;
      case 'office-records':officeRecords(detail);break;
      case 'store-item':storeItem(detail);break;
      case 'shop-ledger':shopLedger();break;
      case 'storage-restock':storageRestock();break;
      case 'store-catalogue':show('Thuan’s mail-order book',realShop.enabled?'Real-world products. Current prices and Shopify checkout are shown separately from town yen.':'A pink ribbon marks the next page. Thuan is still preparing the mail-order selection.',[...STORE_ITEMS.filter(i=>realShop.enabled&&SHOPIFY_CONFIG.products[i.id]).map(i=>[i.name,()=>realProduct(i)]),['Close',close]]);break;
      case 'travel-progress':show('Earn your town shortcuts',travelStatusText(state),[['Back to exploring',close]]);break;
      case 'vending':vending();break;
      case 'resident':resident(name);break;
      case 'neighbour':neighbour(name);break;
      case 'visit-home':show(name,'Choose an apartment to visit.',[...detail.map(home=>[home.name,()=>{close();home.enter();}]),['Back',close]]);break;
      case 'izakaya-menu':izakayaMenu();break;
      case 'izakaya-table':izakayaTable();break;
      case 'onsen':onsen();break;
      case 'onsen-pay':onsenPay();break;
      case 'onsen-milk':onsenMilk();break;
      case 'onsen-change':onsenChange();break;
      case 'sakura-medicine':sakuraMedicine();break;
      case 'kyushoku':kyushoku(name,detail);break;
      case 'school-pantry':schoolPantry(name);break;
      case 'school-teacher':schoolTeacher(name);break;
      case 'school-taps':show('Wash station','Brass push taps over a concrete trough. You press one and it runs cold for exactly as long as you hold it. There is an orange net of soap hanging from the pipe, and somebody\'s blue sandal.',[['Rinse the sand off your feet',()=>{onTime(2);receipt('Wash station','Cold, clean, and the sand runs off down the trough. Your feet dry on the corridor concrete in a minute.');}],['Leave',close]]);break;
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
       case 'bus':receipt('Harbour Line timetable',harbourTimetable(getMinutes()));break;
      case 'shrine':show(typeof name==='string'&&name?name:'Neighbourhood shrine',typeof detail==='string'&&detail?detail:'The street sounds soften behind the torii gate.',[['Make an offering · ¥5',()=>{if(spend(5)){tone(420,.7);show('Set an intention','A bell note hangs above the roofs. Choose one thing to carry back into the street.',['Book','Work','Home'].map(intent=>[intent,()=>{state.shrineIntent=intent;note('Shrine intention: '+intent+'.');receipt('A quiet moment',intent+'. Noted.');}]));}}],['Leave',close]]);break;
    }
  }

  $('#closeActivity').onclick=close;
  modal.addEventListener('click',e=>{if(e.target===modal)close();});
  document.addEventListener('keydown',e=>{if(!modalOpen)return;if(e.code==='Escape'){e.preventDefault();close();}if(e.key==='Tab'){const focusable=[...modal.querySelectorAll('button:not(:disabled),a[href],iframe,input:not(:disabled),[tabindex="0"]')];const index=focusable.indexOf(document.activeElement);e.preventDefault();focusable[(index+(e.shiftKey?-1:1)+focusable.length)%focusable.length]?.focus();}});
  $('#notebookButton').onclick=inventory;
  $('#soundButton').onclick=toggleSound;
  $('#weatherButton').onclick=()=>{state.weather=!state.weather;onWeather(state.weather);$('#weatherButton').textContent=state.weather?'RAIN':'CLEAR';save();};
  $('#timeButton').onclick=()=>onTime('cycle');
  $('#playerButton').onclick=players;
  $('#creditsButton').onclick=()=>show('Credits','Nozomi appearance for Reiko: user-supplied Shenmue model, upload credited to Kiklox; embedded metadata declares CC BY 4.0. Geometry batching, material conversion and original movement clips by Johansson Town. Full source and provenance: assets/ATTRIBUTION.md.\nJohansson: MakeHuman base, skeleton, textures and clothing · CC0 1.0 (MakeHuman team), shaped and rigged with MPFB; face, painted skin and hair, print and all movements by Johansson Town.\nJapanese Town: Nazareno_rojas · CC BY 4.0. Complete supplied overworld, texture compression and static batching; original arrangement preserved. Source and licence: assets/models/full-town/CREDITS.md.\nThree.js r170 · MIT.\nBranching dialogue system: Godot Open Dialogue System by Tina Qin (QueenChristina) · MIT. Reimplemented in JavaScript from the GDScript; the dialogue data format and its rules are kept. Town dialogue is original writing.\nTouch joystick: Virtual Joystick for Godot by Marco Fazio (MarcoFazioRandom) \u00b7 MIT. Reimplemented in JavaScript; the joystick and visibility modes and the dead-zone output curve are kept, so the stick is drawn only where and when a thumb is down.\nCel shading, screen-space ink and the anime colour grade: Sakura Crossing by Kenton Wang (Kenton-GMI) \u00b7 MIT. The gradient ramps, the violet shadow-band patch, the depth second-difference line work and the split-tone grade are ported; the materials here are converted at runtime rather than authored, and photographic textures are only partly flattened.\nKonbini counter ritual, stamp card and receipt: inspired by Yorimichi by emaxsaun · MIT. Design only, no code; adapted to 1997, which had neither IC cards nor bag charges.\nEntry board design language: AsagaoUI by Hiroshi ISOBE · MIT, following the Japan Digital Agency design system. Colour ramps, type scale, spacing, rounding and focus ring ported as CSS; no framework code, icons or illustrations included.\nVending Machine: Don Carson / Poly Pizza · CC BY 3.0. Adapted materials, glass removed, original fictional branding added. Source and licence links: assets/ATTRIBUTION.md.\nPoly Haven / Texture Haven: asphalt, plaster, timber and roof albedo, normal and packed ARM maps · CC0.\nIndustrial Sunset 02 environment lighting: Sergej Majboroda / Poly Haven · CC0.\nTomonoura centreline data: © OpenStreetMap contributors · ODbL 1.0. The local extract and adapted layout are included with the source.\n21 fitted neighbours and the Yui fallback: Blender / MakeHuman system assets · CC0. Original scripted animations.\nQuaternius Ultimate Modular Men and Women: local fallback and archived bases/clips · CC0.\nOpenGameArt: concrete and bamboo by YCbCr; stone paving by para · CC0.\nPotted plant: Polygonal Mind, discovered through ToxSam OS3A · CC0.\nMinato Izakaya exterior: BenMaher, Izakaya - Low Poly Building · CC BY 4.0 per supplied source metadata. Texture and entrance adaptations by Johansson Town.\nOffice interior: user-supplied Tomodachi Life model, source upload by Unknown Person.\nSato Ramen exterior and interior: Japanese Restaurant Inakaya by Jellepostma, CC BY 4.0. Adapted customer aisle, seating and interactions by Johansson Town. Source and licence links: assets/ATTRIBUTION.md.\nCurrent Thuan: user-supplied Meshy Thoughtful Girl; Blender mesh/weight repairs, supplied walk/run, original idle and greeting.\nTown geometry, procedural fallback and original rendered Foley/instrumental loops: Johansson Town.\nQwen3-TTS CustomVoice: four generated Japanese dialogue clips, model licence Apache 2.0; provenance in assets/audio/voices/.\nambientCG remains a proposed source; its assets are not included in this revision.\nSee assets/ATTRIBUTION.md for the licence ledger.',[['Close',close]]);
  document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});

  if(Number.isFinite(state.minutes))onTime({restore:state.minutes});townAudio.setEnabled(state.sound);
  // Storage restock handshake may arrive while the tab was on thuans-storage.
  consumeStorageRestock();$('#soundButton').textContent=state.sound?'SOUND ON':'SOUND OFF';radioStation=state.radioStation||0;save();onWeather(state.weather);$('#weatherButton').textContent=state.weather?'RAIN':'CLEAR';
  return {action,inventory,bag,close,save,spend,players,menu:show,dialogue:dialogueBox,onsenPaid:()=>state.onsenPaidDay===Math.floor(getMinutes()/1440),thuanStory,konbiniCounter,konbiniBasket,consumeStorageRestock,takeAbsence(){const elapsed=pendingAbsence;pendingAbsence=0;return elapsed;},note,inspectItem,openURL,quietRead,footstep(material){townAudio.step(material);},get paused(){return modalOpen;},get state(){return state;},visit(id){if(!state.visited.includes(id)){state.visited.push(id);save();}},tick(dt){ledgerView?.update();if(advancePrint(state,dt)){save();say('Your Form 3D model is ready. Collect it at the workshop.',5);}}};
}
