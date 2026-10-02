import {createKit} from '../kit.js';

/**
 * Brushless synchronous generator (synkrongenerator), four poles, two bearings, as in an
 * auxiliary diesel generator set on board (around 500 kVA).
 *
 * Origin on the floor under the middle; the drive end, where the diesel engine couples on,
 * faces +X. Controls: running (the rotor turns).
 */
export const GENERATOR_META=Object.freeze({
 id:'generator',
 title:{sv:'Synkrongenerator, borstlös',en:'Synchronous generator, brushless'},
 summary:{
  sv:'Generatorn i ett hjälpaggregat. Dieselmotorn vrider rotorn, rotorns poler magnetiseras med likström, och deras fält inducerar trefasspänning i statorn. Frekvensen följer varvtalet: med fyra poler ger 1 500 r/min 50 Hz och 1 800 r/min 60 Hz.',
  en:'The generator of an auxiliary set. The diesel engine turns the rotor, the rotor’s poles are magnetised with direct current, and their field induces three-phase voltage in the stator. Frequency follows speed: with four poles, 1,500 rpm gives 50 Hz and 1,800 rpm gives 60 Hz.',
 },
});

export function buildGenerator(THREE){
 const kit=createKit(THREE,GENERATOR_META),{part,add,geo}=kit;
 const H=.45;

 const frame=part({id:'frame',sv:'Statorhus',en:'Frame',shell:true,
  textSv:'Det svetsade huset bär statorn och står på fötter som bultas till samma bädd som dieselmotorn, så att de två hålls i linje.',
  textEn:'The welded frame carries the stator and stands on feet bolted to the same bedplate as the diesel engine, so the two stay in line.'});
 add(frame,geo.tubeX(.42,.39,1.0,56),'generatorGreen',[0,H,0]);
 for(const z of [-.33,.33]){add(frame,geo.box(1.0,.05,.1),'generatorGreen',[0,.025,z],[0,0,0],'Foot rail');add(frame,geo.box(.9,.12,.03),'generatorGreen',[0,.1,z*.92],[0,0,0],'Foot web');}
 for(let i=0;i<5;i++)for(const z of [-.425,.425])add(frame,geo.box(.06,.16,.012),'black',[.32+i*.035,H,z],[0,0,0],'Air outlet louvre');
 add(frame,new THREE.TorusGeometry(.04,.012,8,20),'darkSteel',[-.3,H+.45,0],[0,Math.PI/2,0],'Lifting eye');
 add(frame,new THREE.TorusGeometry(.04,.012,8,20),'darkSteel',[.38,H+.45,0],[0,Math.PI/2,0],'Lifting eye');

 const core=part({id:'stator-core',sv:'Statorpaket',en:'Stator core',
  textSv:'Statorns plåtpaket bär lindningen och leder det roterande fältet. Plåten är isolerad och tunn för att hålla nere förlusterna.',
  textEn:'The stator core carries the winding and guides the rotating field. Its laminations are thin and insulated to keep losses down.'});
 add(core,geo.tubeX(.38,.255,.7,56),'lamination',[0,H,0]);
 const winding=part({id:'stator-winding',sv:'Statorlindning (huvudlindning)',en:'Stator winding (main winding)',
  textSv:'Generatorns utgång. När polerna sveper förbi induceras en växelspänning i var och en av de tre faslindningarna, 120° förskjutna.',
  textEn:'The generator’s output. As the poles sweep past, an alternating voltage is induced in each of the three phase windings, 120° apart.'});
 for(const x of [-.4,.4])add(winding,geo.torusX(.315,.045,48),'copper',[x,H,0]);

 const rotor=part({id:'rotor',sv:'Rotor med poler',en:'Rotor and poles',explode:[1.15,0,0],
  textSv:'Fyra utpräglade poler. Likström i fältlindningarna gör dem till elektromagneter, omväxlande nord och syd. Fyra poler är två polpar: varje varv ger två perioder.',
  textEn:'Four salient poles. Direct current in the field windings makes them electromagnets, alternately north and south. Four poles are two pole pairs: every turn gives two cycles.'});
 rotor.object.position.set(0,H,0);
 add(rotor,geo.cylX(.12,.7,32),'lamination');
 for(let i=0;i<4;i++){const a=i/4*Math.PI*2+Math.PI/4,c=Math.cos(a),s=Math.sin(a);
  add(rotor,geo.box(.66,.1,.15),'lamination',[0,c*.17,s*.17],[a,0,0],'Pole body');
  add(rotor,geo.box(.68,.03,.27),'lamination',[0,c*.232,s*.232],[a,0,0],'Pole shoe');}
 const field=part({id:'field-winding',parent:rotor.object,sv:'Fältlindning',en:'Field winding',
  textSv:'Lindningen runt varje pol. Den matas med likström från den roterande likriktaren; mer ström ger starkare fält och högre spänning.',
  textEn:'The coil round each pole. It is fed with direct current from the rotating rectifier; more current gives a stronger field and a higher voltage.'});
 for(let i=0;i<4;i++){const a=i/4*Math.PI*2+Math.PI/4,c=Math.cos(a),s=Math.sin(a);
  add(field,geo.box(.7,.075,.19),'copper',[0,c*.165,s*.165],[a,0,0],'Field coil');}

 const shaft=part({id:'shaft',parent:rotor.object,sv:'Axel',en:'Shaft',
  textSv:'Axeln går genom hela maskinen. På D-sidan kopplas den till dieselmotorn; på N-sidan bär den magnetiseringsmaskinens rotor och likriktaren.',
  textEn:'The shaft runs through the whole machine. At the drive end it couples to the diesel engine; at the other end it carries the exciter rotor and the rectifier.'});
 add(shaft,geo.cylX(.075,2.0,28),'steel',[.1,0,0]);
 add(shaft,geo.cylX(.2,.05,40),'darkSteel',[1.075,0,0],[0,0,0],'Coupling flange');

 const fan=part({id:'fan',parent:rotor.object,sv:'Fläkt',en:'Cooling fan',explode:[.18,0,0],
  textSv:'Fläkten på D-sidan suger kylluft genom generatorn: in vid N-sidan, förbi lindningarna och ut genom gallren vid D-sidan.',
  textEn:'The fan at the drive end draws cooling air through the generator: in at the far end, past the windings and out through the louvres at the drive end.'});
 add(fan,geo.cylX(.12,.08,24),'darkSteel',[.47,0,0]);
 for(let i=0;i<12;i++){const a=i/12*Math.PI*2;add(fan,geo.box(.07,.2,.012),'darkSteel',[.47,Math.cos(a)*.24,Math.sin(a)*.24],[a,0,0],'Fan blade');}

 const exciterRotor=part({id:'exciter-rotor',parent:rotor.object,sv:'Magnetiseringsmaskin, rotor',en:'Exciter rotor',
  textSv:'En liten trefasgenerator på samma axel, fast tvärtom: fältet står still och lindningen roterar. Växelspänningen den ger likriktas på axeln.',
  textEn:'A small three-phase generator on the same shaft, the other way round: its field stands still and its winding turns. The alternating voltage it makes is rectified on the shaft.'});
 add(exciterRotor,geo.cylX(.1,.12,32),'lamination',[-.64,0,0]);
 for(const x of [-.71,-.57])add(exciterRotor,geo.torusX(.08,.016),'copper',[x,0,0]);

 const rectifier=part({id:'rotating-rectifier',parent:rotor.object,sv:'Roterande likriktare',en:'Rotating rectifier',explode:[-.22,0,0],
  textSv:'Sex dioder sitter på axeln och snurrar med den. De gör om magnetiseringsmaskinens växelström till likström för polerna, så att inga släpringar eller borstar behövs. En trasig diod ger låg eller ostadig spänning.',
  textEn:'Six diodes ride on the shaft and turn with it. They turn the exciter’s alternating current into direct current for the poles, so no slip rings or brushes are needed. A failed diode gives a low or unsteady voltage.'});
 add(rectifier,geo.cylX(.14,.02,36),'aluminium',[-.79,0,0]);
 for(let i=0;i<6;i++){const a=i/6*Math.PI*2;add(rectifier,geo.box(.03,.03,.03),'diode',[-.81,Math.cos(a)*.1,Math.sin(a)*.1],[a,0,0],'Diode');}

 const bearingDE=part({id:'bearing-de',parent:rotor.object,sv:'Lager, D-sida',en:'Bearing, drive end',explode:[.32,0,0],
  textSv:'Rullager som bär rotorns vikt och tar kraften från kopplingen. Smörjs med fett genom en nippel i gaveln.',
  textEn:'A roller bearing that carries the rotor’s weight and the load from the coupling. Greased through a nipple in the end shield.'});
 add(bearingDE,geo.tubeX(.12,.075,.06),'steel',[.62,0,0]);
 const bearingNDE=part({id:'bearing-nde',parent:rotor.object,sv:'Lager, N-sida',en:'Bearing, non-drive end',explode:[-.12,0,0],
  textSv:'Kullagret på N-sidan låter axeln växa i längd när den blir varm.',
  textEn:'The ball bearing at the non-drive end lets the shaft grow in length as it warms up.'});
 add(bearingNDE,geo.tubeX(.11,.075,.05),'steel',[-.52,0,0]);

 const exciterStator=part({id:'exciter-stator',sv:'Magnetiseringsmaskin, stator',en:'Exciter stator',explode:[-.55,0,0],
  textSv:'Den fasta delen av magnetiseringsmaskinen. AVR:en matar den med en liten likström, och det är så generatorns spänning styrs.',
  textEn:'The fixed part of the exciter. The AVR feeds it a small direct current, and that is how the generator’s voltage is controlled.'});
 add(exciterStator,geo.tubeX(.2,.108,.12,40),'lamination',[-.64,H,0]);
 for(let i=0;i<6;i++){const a=i/6*Math.PI*2;add(exciterStator,geo.box(.13,.04,.06),'copper',[-.64,H+Math.cos(a)*.13,Math.sin(a)*.13],[a,0,0],'Exciter field coil');}

 const shieldDE=part({id:'end-shield-de',sv:'Lagersköld, D-sida',en:'End shield, drive end',shell:true,explode:[1.75,0,0],
  textSv:'Gaveln mot dieselmotorn. Den bär D-lagret och har gallren där kylluften går ut.',
  textEn:'The end shield towards the engine. It carries the drive-end bearing and has the louvres where the cooling air leaves.'});
 add(shieldDE,geo.tubeX(.42,.12,.04,56),'generatorGreen',[.52,H,0]);
 const shieldNDE=part({id:'end-shield-nde',sv:'Lagersköld och kåpa, N-sida',en:'End shield and cover, non-drive end',shell:true,explode:[-.95,0,0],
  textSv:'Gaveln och kåpan på N-sidan skyddar magnetiseringsmaskinen och likriktaren. Kylluften går in här.',
  textEn:'The end shield and cover at the far end guard the exciter and the rectifier. The cooling air comes in here.'});
 add(shieldNDE,geo.tubeX(.42,.11,.04,56),'generatorGreen',[-.52,H,0]);
 add(shieldNDE,geo.tubeX(.26,.25,.36,48),'generatorGreen',[-.72,H,0],[0,0,0],'Exciter cover');
 add(shieldNDE,geo.cylX(.26,.012,48),'black',[-.9,H,0],[0,0,0],'Air inlet grille');

 const tbox=part({id:'terminal-box',sv:'Uttagslåda',en:'Terminal box',shell:true,explode:[0,.55,0],
  textSv:'Huvudkablarna till huvudtavlan ansluts här. Lådan är stor, för strömmen är stor: flera hundra ampere per fas.',
  textEn:'The main cables to the switchboard connect here. The box is large because the current is large: several hundred amperes per phase.'});
 add(tbox,geo.box(.42,.28,.36),'generatorGreen',[.1,H+.42+.12,0]);
 const terminals=part({id:'main-terminals',sv:'Huvuduttag U, V, W, N',en:'Main terminals U, V, W, N',explode:[0,.3,0],
  textSv:'Fyra uttag: de tre faserna U, V och W och nollan N från lindningarnas gemensamma punkt. Generatorlindningen är Y-kopplad.',
  textEn:'Four terminals: the three phases U, V and W, and the neutral N from the windings’ common point. The generator winding is star-connected.'});
 for(let i=0;i<4;i++)add(terminals,geo.box(.04,.1,.012),'copper',[-.02+i*.08,H+.42+.2,0],[0,0,0],'Busbar');

 const avr=part({id:'avr',sv:'AVR (spänningsregulator)',en:'AVR (voltage regulator)',explode:[0,.5,.45],
  textSv:'Den automatiska spänningsregulatorn mäter utspänningen och ändrar magnetiseringsströmmen så att spänningen hålls konstant när lasten ändras.',
  textEn:'The automatic voltage regulator measures the output voltage and adjusts the excitation current, so the voltage holds steady as the load changes.'});
 add(avr,geo.box(.26,.18,.05),'black',[.1,H+.42+.12,.205]);
 add(avr,geo.box(.06,.04,.01),'yellow',[.05,H+.42+.16,.232],[0,0,0],'AVR trimmer');

 let running=false,turn=0;
 return kit.finish({
  controls:[{id:'running',type:'toggle',label:{sv:'Kör',en:'Run'},get value(){return running;},set(v){running=!!v;}}],
  /** Slow enough to follow by eye; a 50 Hz four-pole set runs 1,500 rpm. */
  update(dt=0){if(!running)return;turn+=dt*Math.PI;rotor.object.rotation.x=turn;},
 });
}
