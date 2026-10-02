import {createKit} from '../kit.js';

/**
 * Four-stroke diesel engine (fyrtakts dieselmotor), six cylinders in line, turbocharged,
 * as in an auxiliary generator set.
 *
 * Origin on the floor under the middle; the crankshaft runs along X, the flywheel at +X.
 * The running gear moves as the real one does: each piston follows the slider-crank
 * motion of its throw, the throws are set for the firing order 1-5-3-6-2-4, and the
 * camshaft turns at half crankshaft speed. A cylinder glows briefly as it fires.
 *
 * Controls: running, and the crank angle (0–720°, one full four-stroke cycle) to step
 * through by hand.
 */
export const DIESEL_ENGINE_META=Object.freeze({
 id:'diesel-engine',
 title:{sv:'Dieselmotor, sex cylindrar i rad',en:'Diesel engine, six cylinders in line'},
 summary:{
  sv:'En fyrtakts dieselmotor: insug, kompression, arbete och avgas under två varv på vevaxeln. Bränslet sprutas in i den hoptryckta, heta luften och tänds av värmen. Sex cylindrar ger ett arbetsslag var 120:e grad och en jämn gång.',
  en:'A four-stroke diesel: intake, compression, power and exhaust over two turns of the crankshaft. Fuel is injected into the hot, compressed air and lit by its heat. Six cylinders give a power stroke every 120 degrees and an even run.',
 },
});

/** The order the cylinders fire in, and each one's firing angle in the 720° cycle. */
export const FIRING_ORDER=Object.freeze([1,5,3,6,2,4]);
const FIRE_AT=Object.freeze(Object.fromEntries(FIRING_ORDER.map((c,i)=>[c,i*120])));
/** Crank geometry, metres: crank radius (half the stroke) and connecting-rod length. */
export const CRANK=Object.freeze({radius:.1,rod:.42,centre:.55,pitch:.3,bore:.17});

const cylX=i=>(i-3.5)*CRANK.pitch;
const deg=a=>a*Math.PI/180;
/** The crank angle of cylinder i's throw past its top dead centre, degrees. */
export const throwAngle=(i,crank)=>((crank-FIRE_AT[i]%360)%360+360)%360;
/** Height of cylinder i's gudgeon pin above the crankshaft centre (slider-crank). */
export function pinHeight(i,crank){
 const a=deg(throwAngle(i,crank)),{radius:r,rod:l}=CRANK;
 return r*Math.cos(a)+Math.sqrt(l*l-(r*Math.sin(a))**2);
}

export function buildDieselEngine(THREE){
 const kit=createKit(THREE,DIESEL_ENGINE_META),{part,add,geo}=kit;
 const {radius:R,rod:L,centre:C,bore:B}=CRANK;
 const TOP=1.2;

 const block=part({id:'engine-block',sv:'Motorblock',en:'Engine block',shell:true,
  textSv:'Blocket av gjutjärn håller cylinderfodren och ramlagren och bär hela motorn. Kylvattnet går i kanaler runt fodren.',
  textEn:'The cast-iron block holds the liners and the main bearings and carries the whole engine. Cooling water runs in jackets round the liners.'});
 add(block,geo.box(1.95,TOP-.35,.52),'engineGrey',[0,(TOP+.35)/2,0]);
 for(const z of [-.27,.27])add(block,geo.box(1.95,.06,.04),'engineGrey',[0,.38,z],[0,0,0],'Mounting flange');

 const sump=part({id:'oil-sump',sv:'Oljetråg',en:'Oil sump',shell:true,explode:[0,-.35,0],
  textSv:'Smörjoljan samlas i tråget. Pumpen suger den därifrån och trycker den genom filtret till lagren och tillbaka.',
  textEn:'The lubricating oil collects in the sump. The pump draws it from there and pushes it through the filter to the bearings and back.'});
 add(sump,geo.box(1.85,.26,.44),'engineGrey',[0,.22,0]);

 const liners=part({id:'cylinder-liners',sv:'Cylinderfoder',en:'Cylinder liners',shell:true,
  textSv:'Kolven går i ett utbytbart foder. När fodret är slitet byts det, i stället för att hela blocket borras om.',
  textEn:'Each piston runs in a replaceable liner. When it wears it is changed, rather than the whole block being rebored.'});
 for(let i=1;i<=6;i++)add(liners,geo.tubeX(B/2+.012,B/2,.38,28).rotateZ(Math.PI/2),'darkSteel',[cylX(i),TOP-.19,0]);

 // The running gear: crankshaft (with the flywheel), connecting rods and pistons.
 const crank=part({id:'crankshaft',sv:'Vevaxel',en:'Crankshaft',
  textSv:'Vevaxeln gör om kolvarnas fram- och återgående rörelse till rotation. Vevslagen sitter så att cylindrarna tänder i ordningen 1-5-3-6-2-4, ett arbetsslag var 120:e grad.',
  textEn:'The crankshaft turns the pistons’ up-and-down motion into rotation. Its throws are set so the cylinders fire in the order 1-5-3-6-2-4, one power stroke every 120 degrees.'});
 crank.object.position.set(0,C,0);
 for(let i=0;i<=6;i++)add(crank,geo.cylX(.055,.12,20),'steel',[(i-3)*CRANK.pitch,0,0],[0,0,0],'Main journal');
 for(let i=1;i<=6;i++){
  const t=-deg(FIRE_AT[i]%360),y=Math.cos(t)*R,z=Math.sin(t)*R;
  add(crank,geo.cylX(.048,.09,20),'steel',[cylX(i),y,z],[0,0,0],'Crankpin');
  for(const s of [-1,1])add(crank,geo.box(.035,R+.11,.15),'steel',[cylX(i)+s*.065,y/2,z/2],[t,0,0],'Crank web');
 }
 add(crank,geo.cylX(.06,.25,20),'steel',[1.07,0,0],[0,0,0],'Crankshaft flange');

 const flywheel=part({id:'flywheel',parent:crank.object,sv:'Svänghjul',en:'Flywheel',explode:[.45,0,0],
  textSv:'Det tunga svänghjulet jämnar ut varvtalet mellan arbetsslagen. Startmotorn griper i krondrevet på dess kant, och generatorn kopplas till det.',
  textEn:'The heavy flywheel evens out the speed between power strokes. The starter engages the ring gear on its rim, and the generator couples to it.'});
 add(flywheel,geo.cylX(.36,.09,48),'darkSteel',[1.12,0,0]);
 add(flywheel,geo.torusX(.36,.015,48),'steel',[1.12,0,0],[0,0,0],'Ring gear');

 const rods=part({id:'connecting-rods',sv:'Vevstakar',en:'Connecting rods',
  textSv:'Vevstaken förbinder kolven med vevaxeln. Den övre änden svänger kring kolvbulten, den nedre går runt med vevtappen.',
  textEn:'The connecting rod joins the piston to the crankshaft. Its small end swings on the gudgeon pin; its big end goes round with the crankpin.'});
 const pistons=part({id:'pistons',sv:'Kolvar',en:'Pistons',
  textSv:'Kolven tar upp förbränningstrycket och för det vidare till vevstaken. Kolvringarna tätar mot fodret och skrapar oljan.',
  textEn:'The piston takes the combustion pressure and passes it to the connecting rod. Its rings seal against the liner and scrape the oil.'});
 const rodMeshes=[],pistonMeshes=[];
 for(let i=1;i<=6;i++){
  const rod=add(rods,geo.box(.04,L,.06),'steel',[cylX(i),0,0],[0,0,0],'Connecting rod '+i);rodMeshes.push(rod);
  const piston=add(pistons,geo.cylY(B/2-.004,.13,24),'aluminium',[cylX(i),0,0],[0,0,0],'Piston '+i);pistonMeshes.push(piston);
  for(const dy of [.035,.05]){const ring=add(pistons,geo.torusY(B/2-.002,.003,24),'darkSteel',[0,dy,0],[0,0,0],'Piston ring');piston.add(ring);}
 }

 const cam=part({id:'camshaft',sv:'Kamaxel',en:'Camshaft',
  textSv:'Kamaxeln öppnar ventilerna och driver bränslepumparna. Den drivs med kugghjul från vevaxeln och går med halva dess varvtal, eftersom varje cylinder arbetar bara vartannat varv.',
  textEn:'The camshaft opens the valves and drives the fuel pumps. It is gear-driven from the crankshaft at half its speed, since each cylinder works only every other turn.'});
 cam.object.position.set(0,C+.38,-.2);
 add(cam,geo.cylX(.025,1.85,16),'steel');
 for(let i=1;i<=6;i++)for(const dx of [-.06,0,.06]){const t=-deg(FIRE_AT[i])/2+dx*8;add(cam,geo.box(.025,.075,.05),'steel',[cylX(i)+dx,Math.cos(t)*.02,Math.sin(t)*.02],[t,0,0],'Cam lobe');}

 const heads=part({id:'cylinder-heads',sv:'Cylinderlock',en:'Cylinder heads',explode:[0,.45,0],
  textSv:'Ett lock per cylinder stänger förbränningsrummet. I det sitter insugs- och avgasventilerna och spridaren.',
  textEn:'One head per cylinder closes the combustion space. It holds the intake and exhaust valves and the injector.'});
 for(let i=1;i<=6;i++)add(heads,geo.box(.27,.16,.4),'engineGrey',[cylX(i),TOP+.08,0]);
 const covers=part({id:'rocker-covers',sv:'Ventilkåpor',en:'Rocker covers',explode:[0,.7,0],
  textSv:'Kåporna täcker vipparmarna som trycker upp ventilerna. Under dem ställs ventilspelet.',
  textEn:'The covers enclose the rocker arms that push the valves open. The valve clearance is set under them.'});
 for(let i=1;i<=6;i++)add(covers,geo.box(.24,.08,.3),'black',[cylX(i),TOP+.2,0]);
 const injectors=part({id:'injectors',sv:'Spridare',en:'Injectors',explode:[0,.3,-.25],
  textSv:'Spridaren finfördelar bränslet i förbränningsrummet vid mycket högt tryck, strax före övre dödläget.',
  textEn:'The injector sprays the fuel into the combustion space at very high pressure, just before top dead centre.'});
 for(let i=1;i<=6;i++)add(injectors,geo.cylY(.012,.16,10),'brass',[cylX(i)+.05,TOP+.17,-.12],[.35,0,0]);

 const pumps=part({id:'fuel-pumps',sv:'Bränslepumpar',en:'Fuel injection pumps',explode:[0,0,-.4],
  textSv:'En pump per cylinder, driven av kamaxeln. Den trycker bränslet till spridaren i exakt rätt ögonblick och mängd.',
  textEn:'One pump per cylinder, driven by the camshaft. It delivers fuel to the injector at exactly the right moment and quantity.'});
 for(let i=1;i<=6;i++){add(pumps,geo.box(.08,.18,.08),'darkSteel',[cylX(i),C+.6,-.3]);add(pumps,geo.cylZ(.006,.2,8),'darkSteel',[cylX(i)+.03,TOP+.06,-.24],[.5,0,0],'Fuel pipe');}

 const exhaust=part({id:'exhaust-manifold',sv:'Avgassamlare',en:'Exhaust manifold',explode:[0,.1,.45],
  textSv:'Avgaserna från alla cylindrar samlas här och leds till turbinen. Samlaren är isolerad: den blir över 400 °C.',
  textEn:'The exhaust from every cylinder gathers here and goes on to the turbine. It is lagged: it runs above 400 °C.'});
 add(exhaust,geo.cylX(.075,1.8,20),'darkSteel',[-.05,TOP+.02,.36]);
 for(let i=1;i<=6;i++)add(exhaust,geo.box(.08,.08,.14),'darkSteel',[cylX(i),TOP+.04,.25],[0,0,0],'Exhaust branch');

 const intake=part({id:'charge-air',sv:'Laddluftkylare och insugsrör',en:'Charge-air cooler and intake manifold',explode:[0,0,-.55],
  textSv:'Turbon trycker in luft, och luften blir varm när den trycks ihop. Kylaren kyler den igen, så att mer luft ryms i cylindern.',
  textEn:'The turbocharger pushes air in, and the air heats up as it is compressed. The cooler cools it again, so more air fits in each cylinder.'});
 add(intake,geo.box(1.7,.12,.12),'engineGrey',[0,TOP-.12,-.34]);
 add(intake,geo.box(.32,.3,.24),'engineGrey',[-.82,TOP+.02,-.36],[0,0,0],'Charge-air cooler');

 const turbo=part({id:'turbocharger',sv:'Turboaggregat',en:'Turbocharger',explode:[-.45,.35,0],
  textSv:'Avgaserna driver en turbin, och på samma axel sitter en kompressor som trycker in mer luft. Mer luft ger plats för mer bränsle och mer effekt.',
  textEn:'The exhaust drives a turbine, and on the same shaft a compressor pushes more air in. More air makes room for more fuel and more power.'});
 add(turbo,geo.cylX(.15,.16,28),'darkSteel',[-1.12,TOP+.22,.12],[0,0,0],'Turbine housing');
 add(turbo,geo.cylX(.17,.14,28),'aluminium',[-1.12,TOP+.22,-.18],[0,Math.PI/2,0],'Compressor housing');
 add(turbo,geo.cylZ(.05,.22,14),'darkSteel',[-1.12,TOP+.22,-.03],[0,0,0],'Bearing housing');

 const housing=part({id:'flywheel-housing',sv:'Svänghjulskåpa',en:'Flywheel housing',shell:true,explode:[.75,0,0],
  textSv:'Kåpan kring svänghjulet. Generatorn bultas fast i den, så att motor och generator står i linje.',
  textEn:'The housing round the flywheel. The generator bolts onto it, so engine and generator stay in line.'});
 add(housing,geo.tubeX(.42,.38,.2,48),'engineGrey',[1.12,C,0]);
 const front=part({id:'gear-cover',sv:'Kamdrevskåpa',en:'Timing gear cover',shell:true,explode:[-.35,0,0],
  textSv:'Bakom kåpan driver kugghjul kamaxeln och olje- och vattenpumparna från vevaxeln.',
  textEn:'Behind the cover, gears drive the camshaft and the oil and water pumps from the crankshaft.'});
 add(front,geo.box(.08,.75,.5),'engineGrey',[-1.0,C+.25,0]);

 // A brief glow in a cylinder as it fires: its own material, so selection never lights it.
 const glows=[];
 for(let i=1;i<=6;i++){const m=new THREE.MeshStandardMaterial({color:0xff9a3c,emissive:0xff6a00,emissiveIntensity:0,transparent:true,opacity:0});
  const g=new THREE.Mesh(new THREE.CylinderGeometry(B/2-.01,B/2-.01,.02,20),m);g.name='Combustion '+i;g.position.set(cylX(i),C+R+L+.125,0);liners.object.add(g);glows.push(m);}

 let running=false,angle=0;
 function pose(a){
  angle=((a%720)+720)%720;
  crank.object.rotation.x=deg(angle);cam.object.rotation.x=deg(angle)/2;
  for(let i=1;i<=6;i++){
   const t=deg(angle-FIRE_AT[i]%360),cy=Math.cos(t)*R,cz=Math.sin(t)*R,py=pinHeight(i,angle);
   pistonMeshes[i-1].position.set(cylX(i),C+py+.05,0);
   const rod=rodMeshes[i-1];rod.position.set(cylX(i),C+(cy+py)/2,cz/2);rod.rotation.x=Math.atan2(-cz,py-cy);
   const since=((angle-FIRE_AT[i])%720+720)%720,glow=since<45?1-since/45:0;
   glows[i-1].emissiveIntensity=glow*2;glows[i-1].opacity=glow*.9;
  }
 }
 pose(0);
 return kit.finish({
  firingOrder:FIRING_ORDER,
  controls:[
   {id:'running',type:'toggle',label:{sv:'Kör',en:'Run'},get value(){return running;},set(v){running=!!v;}},
   {id:'crank',label:{sv:'Vevvinkel',en:'Crank angle'},unit:'°',min:0,max:720,step:1,get value(){return Math.round(angle);},set(v){pose(Number(v)||0);}},
  ],
  /** Where a piston stands, for tests and lessons: its pin height above the crank centre. */
  pinHeight:i=>pistonMeshes[i-1].position.y-.05-C,
  /** Slow enough to follow every stroke; a generator diesel runs 1,500 or 1,800 rpm. */
  update(dt=0){if(running)pose(angle+dt*90);},
 });
}
