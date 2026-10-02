import {createKit} from '../kit.js';

/**
 * Centrifugal pump (centrifugalpump), end suction, back pull-out design, on its own bearing
 * bracket: about size 65-50-160 (suction DN65, discharge DN50, impeller about 160 mm), as for
 * sea-water cooling or a general-service pump on board. It is driven through a flexible coupling
 * (see the coupling model) by an induction motor.
 *
 * Origin on the floor under the shaft centre at the impeller; the shaft runs along X, the
 * suction faces -X and the drive (coupling) end +X. Controls: running.
 * Procedures: changing the mechanical seal.
 */
export const CENTRIFUGAL_PUMP_META=Object.freeze({
 id:'centrifugal-pump',
 title:{sv:'Centrifugalpump, ändsug',en:'Centrifugal pump, end suction'},
 summary:{
  sv:'Vätskan kommer in axiellt i pumphjulets öga, slungas utåt av skovlarna och samlas i spiralhuset, där farten blir tryck. Pumpen är byggd för att dras ut bakåt: huset sitter kvar på rören medan pumphjul, tätning och lager tas ut som en enhet.',
  en:'The liquid enters the eye of the impeller along the shaft, is flung outward by the vanes and gathers in the volute, where speed becomes pressure. The pump is built to pull out backwards: the casing stays on its pipes while the impeller, seal and bearings come out as one unit.',
 },
});

export function buildCentrifugalPump(THREE){
 const kit=createKit(THREE,CENTRIFUGAL_PUMP_META),{part,add,geo,boltCircle}=kit;
 const H=.26;
 const at=(r,a)=>[Math.cos(a)*r,Math.sin(a)*r];

 const volute=part({id:'volute',sv:'Spiralhus',en:'Volute casing',shell:true,
  textSv:'Huset av gjutjärn eller brons vidgar sig runt pumphjulet som ett snäckskal. Den växande arean saktar in vätskan, och farten blir tryck. Tungan uppe vid trycksidan skiljer det utgående flödet från det som går runt igen.',
  textEn:'The cast-iron or bronze casing widens round the impeller like a snail shell. The growing area slows the liquid, and speed becomes pressure. The cutwater at the discharge separates the outgoing flow from the flow going round again.'});
 const SEG=24;
 for(let i=0;i<SEG;i++){const a0=i/SEG*Math.PI*2,a1=(i+1.02)/SEG*Math.PI*2,r=.1+.045*(i/SEG);add(volute,geo.sectorX(.088,r,a0+.05,a1+.05,.075,3),'castIron',[0,H,0],[0,0,0],'Volute wall');}
 add(volute,geo.tubeX(.15,.036,.014,48),'castIron',[-.044,H,0],[0,0,0],'Front wall');
 add(volute,geo.latheX([[-.05,.036],[-.05,.045],[-.2,.045],[-.2,.036]],32),'castIron',[0,H,0],[0,0,0],'Suction nozzle');
 add(volute,geo.cylX(.092,.02,40),'castIron',[-.21,H,0],[0,0,0],'Suction flange');
 boltCircle(volute,{x:-.22,cy:H,r:.072,n:4,size:.014,dir:-1});
 add(volute,geo.cylY(.032,.2,24),'castIron',[0,H+.22,.06],[0,0,0],'Discharge nozzle');
 add(volute,geo.cylY(.083,.02,40),'castIron',[0,H+.33,.06],[0,0,0],'Discharge flange');
 for(let i=0;i<4;i++){const a=(i+.5)/4*Math.PI*2;add(volute,geo.hexX(.022,.01).rotateZ(Math.PI/2),'darkSteel',[Math.sin(a)*.062,H+.344,.06+Math.cos(a)*.062],[0,0,0],'Flange bolt');}
 add(volute,geo.box(.1,H-.13,.16),'castIron',[0,(H-.13)/2,0],[0,0,0],'Casing foot');
 add(volute,geo.hexX(.022,.012).rotateZ(Math.PI/2),'brass',[0,H-.152,0],[0,0,0],'Drain plug');
 add(volute,geo.hexX(.018,.01).rotateZ(Math.PI/2),'brass',[.02,H+.146,-.04],[0,0,0],'Vent plug');

 const wear=part({id:'wear-ring',sv:'Slitring',en:'Wear ring',explode:[-.12,0,0],
  textSv:'En utbytbar ring i huset vid pumphjulets öga. Det smala spelet där hindrar vätskan från att läcka tillbaka från trycksidan till sugsidan. När spelet blivit stort sjunker kapaciteten, och ringen byts.',
  textEn:'A replaceable ring in the casing at the impeller’s eye. The narrow clearance there stops liquid leaking back from the discharge side to the suction. When the clearance has grown, capacity falls and the ring is changed.'});
 add(wear,geo.tubeX(.042,.034,.014,32),'bronze',[-.036,H,0]);

 const impeller=part({id:'impeller',sv:'Pumphjul',en:'Impeller',explode:[.05,0,.32],
  textSv:'Ett slutet pumphjul: skovlarna sitter mellan två skivor. Skovlarna är bakåtböjda mot rotationsriktningen. Hjulet sitter på axeln med kil och mutter, och diametern bestämmer uppfordringshöjden.',
  textEn:'A closed impeller: the vanes are held between two shrouds. They curve backwards against the direction of rotation. It sits on the shaft with a key and a nut, and its diameter sets the head.'});
 impeller.object.position.set(0,H,0);
 add(impeller,geo.cylX(.08,.006,48),'bronze',[.016,0,0],[0,0,0],'Back shroud');
 add(impeller,geo.latheX([[-.03,.034],[-.026,.036],[-.012,.08],[-.006,.08],[-.02,.034]],48),'bronze',[0,0,0],[0,0,0],'Front shroud');
 for(let v=0;v<6;v++)for(let k=0;k<6;k++){const r=.036+k*.0085,a=v/6*Math.PI*2-1.1*Math.log(r/.034);const [y,z]=at(r,a);
  add(impeller,geo.box(.026,.004,.012),'bronze',[0,y,z],[a+.9,0,0],'Vane');}
 add(impeller,geo.cylX(.022,.05,24),'bronze',[0,0,0],[0,0,0],'Impeller hub');
 add(impeller,geo.hexX(.03,.016),'steel',[-.033,0,0],[0,0,0],'Impeller nut');

 const cover=part({id:'casing-cover',sv:'Husgavel (bakplatta)',en:'Casing cover',shell:true,explode:[.18,0,0],
  textSv:'Gaveln stänger huset mot lagerbocken och rymmer axeltätningen. Vid utdragning bakåt följer den med enheten, och huset sitter kvar.',
  textEn:'The cover closes the casing towards the bearing bracket and houses the shaft seal. In a back pull-out it comes away with the unit, and the casing stays.'});
 add(cover,geo.latheX([[.036,.03],[.036,.155],[.05,.155],[.05,.06],[.085,.05],[.085,.03]],48),'castIron',[0,H,0]);
 boltCircle(cover,{x:.05,cy:H,r:.145,n:8,size:.012});

 const seal=part({id:'mechanical-seal',sv:'Mekanisk axeltätning',en:'Mechanical seal',explode:[.32,.12,0],
  textSv:'Två plana, polerade ringar glider mot varandra: en roterar med axeln, en sitter still i gaveln. En fjäder håller dem mot varandra, och en tunn vätskefilm mellan dem smörjer och kyler. Den får aldrig gå torr; då spricker ytorna på några sekunder.',
  textEn:'Two flat, lapped rings slide on each other: one turns with the shaft, one sits still in the cover. A spring holds them together, and a thin film of liquid between them lubricates and cools. It must never run dry; the faces crack in seconds.'});
 add(seal,geo.tubeX(.032,.022,.012,32),'white',[.072,H,0],[0,0,0],'Stationary seat');
 add(seal,geo.tubeX(.03,.021,.01,32),'black',[.062,H,0],[0,0,0],'Rotating face');
 for(let i=0;i<5;i++)add(seal,geo.torusX(.024,.0025,20),'steel',[.042+i*.004,H,0],[0,0,0],'Seal spring');
 add(seal,geo.tubeX(.055,.022,.012,32),'darkSteel',[.091,H,0],[0,0,0],'Gland plate');

 const shaft=part({id:'shaft',sv:'Axel',en:'Shaft',
  textSv:'Axeln bär pumphjulet i ena änden och kopplingen i den andra, och går i två lager i lagerbocken. Den ska vara rak: en krokig axel slår och sliter tätningen.',
  textEn:'The shaft carries the impeller at one end and the coupling at the other, and runs in two bearings in the bracket. It must be straight: a bent shaft runs out and wears the seal.'});
 shaft.object.position.set(0,H,0);
 add(shaft,geo.latheX([[-.04,0],[-.04,.012],[-.02,.012],[-.02,.017],[.03,.017],[.03,.021],[.1,.021],[.1,.025],[.42,.025],[.42,.019],[.54,.019],[.54,0]],28),'steel');
 add(shaft,geo.box(.08,.006,.008),'darkSteel',[.49,.02,0],[0,0,0],'Key');

 const deflector=part({id:'deflector',sv:'Stänkring',en:'Liquid deflector',explode:[.2,.08,0],
  textSv:'En gummiring på axeln mellan tätningen och lagerbocken. Om tätningen läcker kastar den undan vätskan, så att den inte kryper längs axeln in i lagren.',
  textEn:'A rubber ring on the shaft between the seal and the bearing bracket. If the seal leaks, it throws the liquid off, so it cannot creep along the shaft into the bearings.'});
 add(deflector,geo.tubeX(.04,.021,.008,32),'rubber',[.11,H,0]);

 const bracket=part({id:'bearing-bracket',sv:'Lagerbock',en:'Bearing bracket',shell:true,
  textSv:'Lagerbocken bär axeln i två lager och står på en egen fot. Lagren går i oljebad; nivån syns i glaset och ska stå mitt i glaset när pumpen står still.',
  textEn:'The bearing bracket carries the shaft in two bearings and stands on its own foot. The bearings run in an oil bath; the level shows in the sight glass and should be at its middle with the pump at rest.'});
 add(bracket,geo.latheX([[.085,.05],[.085,.075],[.12,.07],[.12,.075],[.4,.075],[.4,.06],[.42,.06],[.42,.05]],40),'castIron',[0,H,0]);
 add(bracket,geo.box(.24,H-.075,.12),'castIron',[.27,(H-.075)/2,0],[0,0,0],'Bracket foot');
 add(bracket,geo.box(.3,.02,.2),'castIron',[.27,.01,0],[0,0,0],'Foot pad');
 add(bracket,geo.cylY(.012,.03,10),'brass',[.3,H+.085,0],[0,0,0],'Oil filler plug');
 add(bracket,geo.cylZ(.016,.01,20),'glass',[.25,H-.04,.076],[0,0,0],'Oil sight glass');
 add(bracket,geo.torusX(.016,.003,16).rotateY(Math.PI/2),'brass',[.25,H-.04,.078],[0,0,0],'Sight glass ring');
 boltCircle(bracket,{x:.085,cy:H,r:.065,n:4,size:.01,dir:-1});

 const bearingIn=part({id:'bearing-inboard',parent:shaft.object,sv:'Lager, pumpsidan',en:'Bearing, pump side',explode:[0,.18,0],
  textSv:'Ett spårkullager nära pumphjulet tar den radiella kraften från pumphjulet.',
  textEn:'A deep-groove ball bearing near the impeller takes the radial load from the impeller.'});
 add(bearingIn,geo.tubeX(.045,.036,.02,32),'steel',[.13,0,0],[0,0,0],'Outer ring');
 add(bearingIn,geo.tubeX(.032,.025,.02,32),'steel',[.13,0,0],[0,0,0],'Inner ring');
 for(let i=0;i<9;i++){const [y,z]=at(.034,i/9*Math.PI*2);add(bearingIn,geo.sphere(.0055,8),'darkSteel',[.13,y,z],[0,0,0],'Ball');}
 const bearingOut=part({id:'bearing-outboard',parent:shaft.object,sv:'Lager, kopplingssidan',en:'Bearing, coupling side',explode:[0,.18,0],
  textSv:'Ett dubbelradigt vinkelkontaktlager nära kopplingen. Det tar axialkraften: pumphjulet suger sig mot sugsidan när pumpen går.',
  textEn:'A double-row angular-contact bearing near the coupling. It takes the axial thrust: the impeller pulls towards the suction when the pump runs.'});
 add(bearingOut,geo.tubeX(.045,.036,.03,32),'steel',[.39,0,0],[0,0,0],'Outer ring');
 add(bearingOut,geo.tubeX(.032,.025,.03,32),'steel',[.39,0,0],[0,0,0],'Inner ring');
 for(const dx of [-.007,.007])for(let i=0;i<9;i++){const [y,z]=at(.034,i/9*Math.PI*2+(dx>0?.35:0));add(bearingOut,geo.sphere(.005,8),'darkSteel',[.39+dx,y,z],[0,0,0],'Ball');}

 const gauges=part({id:'gauges',sv:'Tryckmätare',en:'Pressure gauges',explode:[0,.15,0],
  textSv:'En mätare på sugsidan (som också visar undertryck) och en på trycksidan. Skillnaden mellan dem är pumpens tryckökning; delad med vätskans densitet och tyngdaccelerationen blir den uppfordringshöjden i meter.',
  textEn:'One gauge on the suction (which also reads vacuum) and one on the discharge. The difference between them is the pump’s pressure rise; divided by the liquid’s density and gravity it gives the head in metres.'});
 for(const [x,y,z,yaw] of [[-.15,H+.12,0,0],[.07,H+.36,.17,0]]){
  add(gauges,geo.cylY(.004,.07,6),'brass',[x,y-.05,z]);
  add(gauges,geo.cylZ(.035,.018,24),'darkSteel',[x,y,z],[0,yaw,0],'Gauge case');
  add(gauges,geo.cylZ(.03,.002,24),'white',[x,y,z+.01],[0,yaw,0],'Gauge dial');
  add(gauges,geo.box(.003,.024,.002),'red',[x+.006,y+.006,z+.012],[0,0,-.5],'Gauge needle');
 }

 let running=false,turnAngle=0;
 const spinning=[impeller,shaft];
 const unit={'casing-cover':[.3,0,0],'mechanical-seal':[.3,0,0],shaft:[.3,0,0],'bearing-bracket':[.3,0,0],deflector:[.3,0,0],impeller:[.3,0,0]};
 return kit.finish({
  controls:[{id:'running',type:'toggle',label:{sv:'Kör',en:'Run'},get value(){return running;},set(v){running=!!v;}}],
  update(dt=0){if(!running)return;turnAngle+=dt*Math.PI*1.4;for(const p of spinning)p.object.rotation.x=turnAngle;},
  procedures:[
   {id:'seal-change',title:{sv:'Byte av mekanisk axeltätning',en:'Changing the mechanical seal'},steps:[
    {sv:'Bryt och lås motorns matning med eget hänglås och skylt. Kontrollera att pumpen inte kan startas, inte heller från fjärrstart.',en:'Isolate and lock off the motor supply with your own padlock and tag. Check that the pump cannot be started, not even remotely.',tool:{sv:'Hänglås och skylt',en:'Padlock and tag'}},
    {sv:'Stäng ventilerna på sug- och trycksidan och lås dem. Öppna avtappningspluggen och släpp ut trycket och vätskan.',en:'Shut the suction and discharge valves and lock them. Open the drain plug and let out the pressure and the liquid.',check:{sv:'Båda tryckmätarna ska visa noll.',en:'Both gauges should read zero.'},focus:['volute','gauges']},
    {sv:'Ta bort kopplingsskyddet och kopplingens mellandel. Motorn står kvar.',en:'Remove the coupling guard and the coupling spacer. The motor stays in place.',tool:{sv:'Insexnyckel',en:'Hex key'},focus:['shaft']},
    {sv:'Lossa husgavelns bultar och lagerbockens fot, och dra ut hela enheten bakåt. Spiralhuset sitter kvar på rören.',en:'Undo the casing cover bolts and the bracket foot, and draw the whole unit out backwards. The volute stays on its pipes.',tool:{sv:'Hylsnyckel',en:'Socket wrench'},move:unit},
    {sv:'Håll emot axeln och skruva av pumphjulsmuttern. Dra av pumphjulet; spara kilen.',en:'Hold the shaft and undo the impeller nut. Draw off the impeller; keep the key.',tool:{sv:'Hylsnyckel och axellås',en:'Socket wrench and shaft lock'},remove:['impeller']},
    {sv:'Lossa husgaveln från lagerbocken och trä av den över axeln.',en:'Release the casing cover from the bracket and slide it off over the shaft.',remove:['casing-cover']},
    {sv:'Ta av den gamla tätningen. Titta på ytorna: repor, sprickor eller brännmärken berättar varför den läckte.',en:'Take off the old seal. Look at the faces: scores, cracks or heat marks tell you why it leaked.',remove:['mechanical-seal']},
    {sv:'Mät spelet mellan pumphjulet och slitringen.',en:'Measure the clearance between the impeller and the wear ring.',tool:{sv:'Skjutmått',en:'Vernier calliper'},check:{sv:'Jämför med tillverkarens gräns. Ett stort spel ger låg kapacitet; byt då slitringen.',en:'Compare with the maker’s limit. A large clearance gives low capacity; then change the wear ring.'},focus:['wear-ring']},
    {sv:'Montera den nya tätningen. Rengör axeln, smörj O-ringarna med det medel tillverkaren anger, och rör aldrig de polerade ytorna med fingrarna.',en:'Fit the new seal. Clean the shaft, lubricate the O-rings with what the maker specifies, and never touch the lapped faces with your fingers.',tool:{sv:'Rena handskar',en:'Clean gloves'},focus:['mechanical-seal','shaft']},
    {sv:'Montera i omvänd ordning och rikta upp kopplingen (se kopplingens procedur).',en:'Reassemble in reverse order and align the coupling (see the coupling procedure).',focus:['casing-cover','impeller','shaft']},
    {sv:'Öppna ventilerna, lufta huset vid luftpluggen tills det kommer vätska, och häv låsningen. Starta aldrig en torr pump.',en:'Open the valves, vent the casing at the vent plug until liquid comes, and remove the lock-out. Never start a dry pump.',focus:['volute','gauges']},
   ]},
  ],
 });
}
