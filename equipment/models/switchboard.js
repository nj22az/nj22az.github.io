import {createKit} from '../kit.js';

/**
 * Main switchboard, generator section (huvudtavla, generatorfält): the cubicle where one
 * generator connects to the ship's busbars, through a withdrawable air circuit breaker (ACB).
 *
 * Origin on the floor at the middle of the cubicle; its width runs along X, its height along Y,
 * and its front faces +Z. Controls: the breaker open or closed, and its rack position
 * (connected, test, disconnected). Like the real one, the breaker cannot be racked while closed.
 * Procedures: isolating and locking out the generator breaker.
 */
export const SWITCHBOARD_META=Object.freeze({
 id:'switchboard',
 title:{sv:'Huvudtavla, generatorfält',en:'Main switchboard, generator section'},
 summary:{
  sv:'Generatorfältet kopplar en generator till fartygets samlingsskenor. Effektbrytaren sluter och bryter strömmen, även kortslutningsströmmar på tiotusentals ampere. Instrumenten på dörren visar spänning, ström, effekt och frekvens, och synkronoskopet används när generatorn ska kopplas in parallellt med de andra.',
  en:'The generator section connects one generator to the ship’s busbars. The circuit breaker makes and breaks the current, even short-circuit currents of tens of thousands of amperes. The instruments on the door show voltage, current, power and frequency, and the synchroscope is used to bring the generator in parallel with the others.',
 },
});

const POSITIONS=Object.freeze({connected:0,test:.07,disconnected:.19});

export function buildSwitchboard(THREE){
 const kit=createKit(THREE,SWITCHBOARD_META),{part,add,geo}=kit;
 const W=.8,D=.9,TOP=2.2,FRONT=D/2;

 const enclosure=part({id:'enclosure',sv:'Kapsling',en:'Enclosure',shell:true,
  textSv:'Fältet är ett stålskåp med skilda fack för samlingsskenor, brytare, kablar och instrument, så att ett fel i ett fack inte sprider sig. Skåpet är jordat och står på en sockel.',
  textEn:'The section is a steel cubicle with separate compartments for busbars, breaker, cables and instruments, so a fault in one does not spread. The cubicle is earthed and stands on a plinth.'});
 for(const x of [-W/2,W/2])add(enclosure,geo.box(.02,TOP,D),'cabinet',[x,TOP/2,0],[0,0,0],'Side panel');
 add(enclosure,geo.box(W,TOP,.02),'cabinet',[0,TOP/2,-D/2],[0,0,0],'Back panel');
 add(enclosure,geo.box(W+.02,.02,D+.02),'cabinet',[0,TOP+.01,0],[0,0,0],'Roof');
 add(enclosure,geo.box(W,.1,D),'black',[0,.05,0],[0,0,0],'Plinth');
 for(const y of [.92,1.52])add(enclosure,geo.box(W-.04,.01,D-.06),'darkSteel',[0,y,0],[0,0,0],'Compartment partition');

 const instruments=part({id:'instrument-door',sv:'Instrumentdörr',en:'Instrument door',explode:[0,0,.3],
  textSv:'Överst sitter voltmeter, amperemeter, effektmeter (kW) och frekvensmeter, under dem synkronoskopet med dess lampor, och omkopplare för voltmetern och dieselns varvtal (upp/ned). Tryckknapparna sluter och bryter brytaren.',
  textEn:'At the top are the voltmeter, ammeter, power meter (kW) and frequency meter; below them the synchroscope and its lamps, and switches for the voltmeter and the diesel’s speed (raise/lower). The push buttons close and open the breaker.'});
 add(instruments,geo.box(W-.02,.62,.02),'cabinet',[0,1.85,FRONT]);
 for(let i=0;i<4;i++){const x=-.27+i*.18;
  add(instruments,geo.box(.1,.1,.03),'black',[x,2.04,FRONT+.02],[0,0,0],'Meter');
  add(instruments,geo.box(.085,.07,.002),'white',[x,2.045,FRONT+.036],[0,0,0],'Meter face');
  add(instruments,geo.box(.003,.05,.002),'black',[x+.01,2.04,FRONT+.038],[0,0,-.5-i*.2],'Meter needle');}
 add(instruments,geo.cylZ(.065,.03,32),'black',[-.18,1.82,FRONT+.02],[0,0,0],'Synchroscope');
 add(instruments,geo.cylZ(.055,.002,32),'white',[-.18,1.82,FRONT+.036],[0,0,0],'Synchroscope face');
 add(instruments,geo.box(.004,.05,.002),'red',[-.18,1.84,FRONT+.038],[0,0,0],'Synchroscope pointer');
 for(let i=0;i<3;i++)add(instruments,geo.cylZ(.014,.02,16),i===1?'white':'yellow',[-.06+i*.05,1.82,FRONT+.02],[0,0,0],'Synchronising lamp');
 for(const [x,c] of [[-.25,'black'],[-.12,'black']]){add(instruments,geo.cylZ(.025,.02,20),c,[x,1.66,FRONT+.02],[0,0,0],'Selector switch');add(instruments,geo.box(.008,.04,.01),'white',[x,1.67,FRONT+.035],[0,0,0],'Switch pointer');}
 add(instruments,geo.cylZ(.017,.025,20),'green',[.0,1.66,FRONT+.02],[0,0,0],'Close push button');
 add(instruments,geo.cylZ(.017,.025,20),'red',[.06,1.66,FRONT+.02],[0,0,0],'Open push button');

 const relay=part({id:'protection-relay',sv:'Generatorskydd (relä)',en:'Generator protection relay',explode:[0,0,.42],
  textSv:'Reläet vakar över generatorn och löser ut brytaren vid överström, kortslutning och backeffekt, det vill säga när generatorn börjar gå som motor och drivs av de andra. Varje utlösning ska utredas innan generatorn kopplas in igen.',
  textEn:'The relay watches over the generator and trips the breaker on overcurrent, short circuit and reverse power, when the generator starts running as a motor driven by the others. Every trip must be investigated before the generator is put back on.'});
 add(relay,geo.box(.16,.11,.05),'black',[.24,1.7,FRONT+.025]);
 add(relay,geo.box(.1,.035,.002),'green',[.24,1.72,FRONT+.051],[0,0,0],'Relay display');
 for(let i=0;i<4;i++)add(relay,geo.cylZ(.006,.01,10),'white',[.2+i*.026,1.67,FRONT+.052],[0,0,0],'Relay key');

 const bdoor=part({id:'breaker-door',sv:'Brytardörr',en:'Breaker door',shell:true,explode:[0,0,.55],
  textSv:'Dörren har ett urtag för brytarens front, så att den kan manövreras och dras ut med dörren stängd.',
  textEn:'The door has a cut-out for the breaker’s front, so it can be operated and racked with the door shut.'});
 for(const [w,h,x,y] of [[W-.02,.08,0,1.48],[W-.02,.08,0,.97],[.13,.43,-.325,1.225],[.13,.43,.325,1.225]])add(bdoor,geo.box(w,h,.02),'cabinet',[x,y,FRONT],[0,0,0],'Door frame');

 const cradle=part({id:'cradle',sv:'Brytarvagn (kassett)',en:'Cradle',
  textSv:'Den fasta delen som brytaren körs in i: skenor, och bakre kontaktfingrar mot samlingsskenorna upptill och generatorkablarna nedtill. När brytaren dras ut fälls skyddsluckor ned över kontakterna.',
  textEn:'The fixed part the breaker runs into: rails, and rear contact fingers to the busbars above and the generator cables below. When the breaker is withdrawn, shutters drop over the contacts.'});
 for(const x of [-.29,.29])add(cradle,geo.box(.03,.03,.62),'darkSteel',[x,1.0,.1],[0,0,0],'Rail');
 add(cradle,geo.box(.64,.36,.02),'darkSteel',[0,1.22,-.1],[0,0,0],'Cradle back plate');
 for(const y of [1.33,1.11])for(const x of [-.15,0,.15]){add(cradle,geo.box(.05,.04,.06),'copper',[x,y,-.06],[0,0,0],'Contact fingers');}
 const shutters=[-1,1].map(s=>add(cradle,geo.box(.6,.1,.01),'orange',[0,1.22+s*.11,-.03],[0,0,0],'Shutter'));

 const breaker=part({id:'breaker',sv:'Effektbrytare (luftbrytare)',en:'Air circuit breaker',
  textSv:'Brytaren sluts och bryts av en fjädermekanism: fjädern spänns först, och frigörs med tryckknappen. Kontakterna bryter i luft, och ljusbågen dras upp i bågsläckarna och kyls tills den slocknar. Brytaren kan köras ut i tre lägen: inkopplad, provläge och frånskild.',
  textEn:'The breaker is closed and opened by a spring mechanism: the spring is charged first, then released by the push button. The contacts part in air, and the arc is drawn up into the arc chutes and cooled until it goes out. The breaker racks to three positions: connected, test and disconnected.'});
 const carriage=new THREE.Group();carriage.name='Breaker carriage';breaker.object.add(carriage);
 const body=add(breaker,geo.box(.56,.4,.36),'darkSteel',[0,1.22,.25],[0,0,0],'Breaker body');carriage.add(body);
 const put=(g,f,p,name)=>{const m=add(breaker,g,f,p,[0,0,0],name);carriage.add(m);return m;};
 put(geo.box(.5,.34,.02),'black',[0,1.22,.44],'Breaker front');
 put(geo.cylZ(.02,.02,20),'red',[-.1,1.3,.455],'Off button O');
 put(geo.cylZ(.02,.02,20),'green',[-.03,1.3,.455],'On button I');
 const flagOpen=put(geo.box(.06,.03,.004),'green',[.1,1.32,.452],'Contacts open indicator');
 const flagClosed=put(geo.box(.06,.03,.004),'red',[.1,1.32,.452],'Contacts closed indicator');
 put(geo.box(.06,.03,.004),'yellow',[.1,1.27,.452],'Spring charged indicator');
 put(geo.cylZ(.018,.02,16),'black',[0,1.12,.455],'Racking handle socket');
 const marks=['connected','test','disconnected'].map((k,i)=>[k,put(geo.box(.03,.012,.004),'white',[.14+i*.035,1.12,.452],'Position indicator '+k)]);
 put(geo.box(.04,.03,.01),'darkSteel',[.18,1.06,.452],'Padlock hasp');
 for(let i=0;i<3;i++)put(geo.box(.12,.07,.3),'black',[-.15+i*.15,1.455,.23],'Arc chute');
 for(const y of [1.33,1.11])for(const x of [-.15,0,.15])put(geo.box(.04,.03,.12),'copper',[x,y,.03],'Main contact');

 const busbars=part({id:'busbars',sv:'Samlingsskenor',en:'Busbars',
  textSv:'Kopparskenor som löper genom hela tavlan, en per fas. Alla generatorer matar in på dem och alla förbrukare tar ut från dem. De bärs av isolatorer som tål kraften vid en kortslutning.',
  textEn:'Copper bars running the length of the switchboard, one per phase. Every generator feeds in and every consumer draws from them. They are held by insulators strong enough for the forces of a short circuit.'});
 for(let i=0;i<3;i++){const y=1.88+i*.09;add(busbars,geo.box(W,.06,.012),'copper',[0,y,-.33],[0,0,0],'Busbar');add(busbars,geo.box(.03,.5,.01),'copper',[-.15+i*.15,1.6,-.25+i*.004],[0,0,0],'Dropper');}
 for(const x of [-.3,.3])add(busbars,geo.box(.05,.3,.05),'insulator',[x,1.97,-.36],[0,0,0],'Busbar support');

 const cts=part({id:'current-transformers',sv:'Strömtransformatorer',en:'Current transformers',explode:[0,0,.25],
  textSv:'En ringkärna runt varje fas. Den ger en liten ström, till exempel 5 A vid full generatorström, till instrumenten och skyddsreläet. Sekundärkretsen får aldrig brytas när det går ström i primären: då uppstår farlig spänning.',
  textEn:'A ring core round each phase. It gives a small current, for example 5 A at full generator current, to the instruments and the protection relay. Its secondary must never be opened while the primary carries current: a dangerous voltage appears.'});
 for(const x of [-.15,0,.15])add(cts,geo.torusY(.04,.014,24),'black',[x,.82,-.25]);

 const cables=part({id:'generator-cables',sv:'Generatorkablar',en:'Generator cables',
  textSv:'Kablarna från generatorns uttagslåda kommer in underifrån och ansluts till brytarens nedre kontakter. Kabelfacket har en egen dörr.',
  textEn:'The cables from the generator’s terminal box come in from below and connect to the breaker’s lower contacts. The cable compartment has its own door.'});
 for(const x of [-.15,0,.15]){add(cables,geo.cylY(.024,.72,16),'black',[x,.46,-.25]);add(cables,geo.box(.04,.28,.012),'copper',[x,.96,-.25],[0,0,0],'Connection bar');}

 const earth=part({id:'earth-bar',sv:'Jordskena',en:'Earth bar',
  textSv:'En kopparskena längs botten som alla skyddsjordledare ansluts till, och som är förbunden med skrovet.',
  textEn:'A copper bar along the bottom that every protective earth conductor connects to, bonded to the hull.'});
 add(earth,geo.box(W-.08,.012,.03),'copper',[0,.14,-.38]);
 add(earth,geo.box(W-.08,.004,.032),'yellow',[0,.148,-.38],[0,0,0],'Earth bar marking');

 const cdoor=part({id:'cable-door',sv:'Dörr till kabelfacket',en:'Cable compartment door',shell:true,explode:[0,0,.45],
  textSv:'Kabelfackets dörr. Bakom den sitter generatorkablarna, som är spänningsförande så snart generatorn snurrar, även med brytaren öppen.',
  textEn:'The cable compartment door. Behind it are the generator cables, live whenever the generator turns, even with the breaker open.'});
 add(cdoor,geo.box(W-.02,.8,.02),'cabinet',[0,.52,FRONT]);
 add(cdoor,geo.box(.02,.12,.03),'darkSteel',[.33,.55,FRONT+.02],[0,0,0],'Door handle');

 let closed=true,position='connected',note=null;
 function show(){
  carriage.position.z=POSITIONS[position];
  flagOpen.visible=!closed;flagClosed.visible=closed;
  for(const [k,m] of marks)m.material=breaker.finish(k===position?'yellow':'white');
  for(const s of shutters)s.visible=position!=='connected';
 }
 const breakerControl={id:'breaker',type:'choice',label:{sv:'Brytare',en:'Breaker'},
  options:[{value:'open',label:{sv:'Från (O)',en:'Open (O)'}},{value:'closed',label:{sv:'Till (I)',en:'Closed (I)'}}],
  get value(){return closed?'closed':'open';},get note(){return note;},
  set(v){closed=v==='closed';note=null;show();}};
 const positionControl={id:'position',type:'choice',label:{sv:'Läge',en:'Position'},
  options:[{value:'connected',label:{sv:'Inkopplad',en:'Connected'}},{value:'test',label:{sv:'Prov',en:'Test'}},{value:'disconnected',label:{sv:'Frånskild',en:'Disconnected'}}],
  get value(){return position;},get note(){return note;},
  set(v){
   if(!(v in POSITIONS))return;
   // The interlock: a closed breaker cannot be racked in or out.
   if(closed&&v!==position){note={sv:'Förreglingen hindrar: en sluten brytare kan inte köras in eller ut. Bryt den först.',en:'The interlock stops it: a closed breaker cannot be racked in or out. Open it first.'};return;}
   note=null;position=v;show();}};
 show();
 return kit.finish({
  controls:[breakerControl,positionControl],
  procedures:[
   {id:'isolate-breaker',title:{sv:'Frånskilja och låsa generatorbrytaren',en:'Isolating and locking out the generator breaker'},
    initial:[['breaker','open'],['position','connected'],['breaker','closed']],steps:[
    {sv:'Meddela den vakthavande och kontrollera att de andra generatorerna tar lasten. Avlasta generatorn tills effektmetern visar nära noll.',en:'Tell the officer of the watch and check the other generators take the load. Unload this generator until the power meter reads near zero.',focus:['instrument-door']},
    {sv:'Bryt brytaren med O-knappen. Kontrollera att indikatorn visar O och att amperemetern visar noll.',en:'Open the breaker with the O button. Check that the indicator shows O and the ammeter reads zero.',set:{breaker:'open'},focus:['breaker']},
    {sv:'Stoppa dieseln och spärra den mot start.',en:'Stop the diesel and block it from starting.',focus:['instrument-door']},
    {sv:'Vev ut brytaren till frånskilt läge med vevhandtaget. Skyddsluckorna fälls ned över de fasta kontakterna.',en:'Rack the breaker out to the disconnected position with the racking handle. The shutters drop over the fixed contacts.',tool:{sv:'Vevhandtag',en:'Racking handle'},set:{position:'disconnected'},focus:['breaker','cradle']},
    {sv:'Lås brytaren i frånskilt läge med ditt eget hänglås och häng skylt med namn, datum och vad som görs.',en:'Lock the breaker in the disconnected position with your own padlock and hang a tag with your name, the date and the work.',tool:{sv:'Hänglås och skylt',en:'Padlock and tag'},focus:['breaker']},
    {sv:'Öppna kabelfacket och kontrollera spänningslöshet på generatorkablarna. Prova spänningsprovaren före och efter.',en:'Open the cable compartment and check the generator cables are dead. Prove the voltage tester before and after.',tool:{sv:'Spänningsprovare',en:'Voltage tester'},remove:['cable-door'],focus:['generator-cables']},
    {sv:'Nu är generatorn frånskild. Återställning görs i omvänd ordning, av den som satte låset.',en:'The generator is now isolated. Restoring is done in reverse order, by whoever fitted the lock.',focus:['cable-door']},
   ]},
  ],
 });
}
