import {createKit} from '../kit.js';

/**
 * Brushless synchronous generator (synkrongenerator), four poles, two bearings, about 500 kVA,
 * 400 V 50 Hz: the kind that sits behind the diesel in an auxiliary generator set on board.
 * Built after the common marine designs: a main machine with salient poles and damper bars,
 * an exciter and a rotating rectifier on the shaft, and a permanent-magnet pilot exciter (PMG)
 * that powers the AVR.
 *
 * Origin on the floor under the middle of the frame; the drive end (D-sida), where the diesel
 * couples on, faces +X. Controls: running. Procedures: insulation test, diode check, bearing change.
 */
export const GENERATOR_META=Object.freeze({
 id:'generator',
 title:{sv:'Synkrongenerator, borstlös',en:'Synchronous generator, brushless'},
 summary:{
  sv:'Generatorn i ett hjälpaggregat. Dieselmotorn vrider rotorn, rotorns poler magnetiseras med likström, och deras fält inducerar trefasspänning i statorn. Frekvensen följer varvtalet: med fyra poler ger 1 500 r/min 50 Hz och 1 800 r/min 60 Hz. Ingen ström går genom borstar: magnetiseringen görs på axeln.',
  en:'The generator of an auxiliary set. The diesel turns the rotor, the rotor’s poles are magnetised with direct current, and their field induces three-phase voltage in the stator. Frequency follows speed: with four poles, 1,500 rpm gives 50 Hz and 1,800 rpm gives 60 Hz. No current passes through brushes: the excitation is made on the shaft.',
 },
});

export function buildGenerator(THREE){
 const kit=createKit(THREE,GENERATOR_META),{part,add,geo,boltCircle}=kit;
 const H=.5,FR=.41;
 /** A point at radius r and angle a (from +Y towards +Z) round the shaft. */
 const at=(r,a)=>[Math.cos(a)*r,Math.sin(a)*r];
 /** Rotates a point (y, z) by a round X: for parts laid out in a pole's own frame. */
 const turn=(a,y,z)=>[y*Math.cos(a)-z*Math.sin(a),y*Math.sin(a)+z*Math.cos(a)];

 // ── The stationary machine ──────────────────────────────────────────────
 const frame=part({id:'frame',sv:'Statorhus',en:'Frame',shell:true,
  textSv:'Det svetsade huset av valsad stålplåt bär statorpaketet. Fötterna bultas till samma bädd som dieselmotorn, och ringarna runt huset gör det styvt mot vibrationer.',
  textEn:'The welded frame of rolled steel plate carries the stator core. Its feet bolt to the same bedplate as the diesel, and the rings round it stiffen it against vibration.'});
 add(frame,geo.tubeX(FR,.39,1.0,64),'generatorGreen',[0,H,0]);
 for(const x of [-.32,0,.32])add(frame,geo.tubeX(FR+.018,FR-.005,.03,64),'generatorGreen',[x,H,0],[0,0,0],'Stiffening ring');
 for(const z of [-.34,.34]){
  add(frame,geo.box(.92,.04,.13),'generatorGreen',[0,.024,z],[0,0,0],'Foot');
  add(frame,geo.box(.92,.1,.02),'generatorGreen',[0,.09,z*.9],[0,0,0],'Foot web');
  for(const x of [-.4,.4])add(frame,geo.cylY(.012,.042,10),'black',[x,.025,z],[0,0,0],'Foot hole');
 }
 for(const x of [-.3,.3]){add(frame,geo.box(.1,.1,.03),'generatorGreen',[x,H+FR+.04,0],[0,0,0],'Lifting lug');add(frame,geo.cylZ(.022,.034,14),'black',[x,H+FR+.055,0],[0,0,0],'Lifting hole');}
 for(const z of [-1,1])for(let i=0;i<6;i++)add(frame,geo.box(.03,.22,.012),'black',[.3+i*.03,H,z*(FR+.004)],[0,0,z*.3],'Air outlet louvre');
 add(frame,geo.box(.06,.06,.04),'generatorGreen',[-.35,.13,.36],[0,0,0],'Earth terminal boss');
 add(frame,geo.hexX(.02,.012).rotateY(Math.PI/2),'brass',[-.35,.13,.385],[0,0,0],'Earth bolt');

 const shims=part({id:'shims',sv:'Mellanlägg',en:'Shims',explode:[0,-.12,0],
  textSv:'Tunna plåtar under fötterna, för att få generatorn i höjd och linje med dieselmotorn. Uppriktningen görs genom att lägga i eller ta ur mellanlägg.',
  textEn:'Thin plates under the feet, to bring the generator level and in line with the diesel. Alignment is set by adding or removing shims.'});
 for(const z of [-.34,.34])for(const x of [-.4,.4])add(shims,geo.box(.12,.004,.12),'brass',[x,.002,z]);

 const core=part({id:'stator-core',sv:'Statorpaket',en:'Stator core',
  textSv:'Paketet av tunna, isolerade elektroplåtar har 48 spår där lindningen ligger. Plåten är tunn för att hålla nere virvelströmsförlusterna, och pressplåtar i varje ände håller ihop paketet.',
  textEn:'The stack of thin, insulated laminations has 48 slots for the winding. The laminations are thin to keep eddy-current losses down, and clamping plates at each end hold the stack together.'});
 add(core,geo.tubeX(.385,.3,.72,64),'lamination',[0,H,0]);
 const SLOTS=48,pitch=Math.PI*2/SLOTS;
 for(let i=0;i<SLOTS;i++){const a=i*pitch;add(core,geo.sectorX(.262,.301,a+pitch*.2,a+pitch*.8,.72,2),'lamination',[0,H,0],[0,0,0],'Stator tooth');}
 for(const x of [-.37,.37])add(core,geo.tubeX(.385,.3,.02,64),'darkSteel',[x,H,0],[0,0,0],'Clamping plate');

 const winding=part({id:'stator-winding',sv:'Statorlindning (huvudlindning)',en:'Stator winding (main winding)',
  textSv:'Generatorns utgång. Spolarna ligger i statorns spår och binds ihop i lindningshuvudena i varje ände, som är lackade och surrade mot kortslutningskrafter. När polerna sveper förbi induceras en växelspänning i var och en av de tre faserna.',
  textEn:'The generator’s output. The coils lie in the stator slots and come together in the end windings at each end, varnished and lashed against short-circuit forces. As the poles sweep past, an alternating voltage is induced in each of the three phases.'});
 for(let i=0;i<SLOTS;i++){const a=i*pitch;add(winding,geo.sectorX(.266,.296,a-pitch*.18,a+pitch*.18,.74,1),'copper',[0,H,0],[0,0,0],'Slot conductors');}
 for(const s of [-1,1]){
  const prof=[[.37,.27],[.41,.268],[.45,.285],[.475,.305],[.475,.335],[.45,.35],[.41,.355],[.37,.355]].map(([x,r])=>[x*s,r]);
  add(winding,geo.latheX(s>0?prof:[...prof].reverse(),64),'varnish',[0,H,0],[0,0,0],'End winding');
  add(winding,geo.torusX(.32,.006,48),'insulator',[s*.43,H,0],[0,0,0],'Lashing ring');
 }
 for(let i=0;i<4;i++)add(winding,geo.cylY(.012,.25,10),'black',[-.43+i*.05,H+.33,-.1+i*.04],[0,0,0],'Main lead');

 const sensors=part({id:'temperature-sensors',sv:'Temperaturgivare (PT100)',en:'Temperature sensors (PT100)',
  textSv:'Givare inlindade i statorlindningen, en per fas, och ibland i lagren. Ett PT100-element har 100 Ω vid 0 °C, och resistansen stiger med temperaturen. Larmet går innan isolationen tar skada.',
  textEn:'Sensors wound into the stator winding, one per phase, and sometimes in the bearings. A PT100 element measures 100 Ω at 0 °C, and its resistance rises with temperature. The alarm sounds before the insulation is harmed.'});
 for(let i=0;i<3;i++){const [y,z]=at(.33,Math.PI*(.25+i*.25));add(sensors,geo.box(.03,.012,.012),'white',[.45,H+y,z]);add(sensors,geo.cylX(.003,.2,6),'white',[.35,H+y+.005,z],[0,0,0],'Sensor lead');}

 const heater=part({id:'space-heater',sv:'Stilleståndsvärmare',en:'Anti-condensation heater',explode:[0,-.25,0],
  textSv:'Ett värmeelement i botten av huset som slås på när generatorn står still. Det håller lindningen varmare än luften, så att fukt inte kondenserar och sänker isolationsresistansen.',
  textEn:'A heating element in the bottom of the frame, switched on whenever the generator stands still. It keeps the winding warmer than the air, so damp does not condense and lower the insulation resistance.'});
 for(const z of [-.12,.12])add(heater,geo.box(.6,.018,.035),'darkSteel',[0,H-.375,z]);

 // ── The rotating parts (all on the rotor, so they come out with it) ─────
 const rotor=part({id:'rotor',sv:'Rotor med poler',en:'Rotor and poles',explode:[1.45,0,0],
  textSv:'Fyra utpräglade poler av plåt, bultade till navet. Polskorna är böjda så att luftgapet blir jämnt och spänningen sinusformad. Fyra poler är två polpar: varje varv ger två perioder.',
  textEn:'Four salient laminated poles, bolted to the hub. The pole shoes are curved so the air gap is even and the voltage sinusoidal. Four poles are two pole pairs: every turn gives two cycles.'});
 rotor.object.position.set(0,H,0);
 add(rotor,geo.cylX(.11,.76,32),'lamination',[0,0,0],[0,0,0],'Rotor hub');
 const POLE=[0,1,2,3].map(i=>i*Math.PI/2+Math.PI/4);
 for(const a of POLE){
  const [y,z]=turn(a,.165,0);add(rotor,geo.box(.72,.11,.15),'lamination',[0,y,z],[a,0,0],'Pole body');
  add(rotor,geo.sectorX(.218,.257,a-.5,a+.5,.74,10),'lamination',[0,0,0],[0,0,0],'Pole shoe');
 }
 const field=part({id:'field-winding',parent:rotor.object,sv:'Fältlindning',en:'Field winding',
  textSv:'En spole runt varje pol. Den matas med likström från den roterande likriktaren; mer ström ger starkare fält och högre spänning. Polerna kopplas så att de blir omväxlande nord och syd.',
  textEn:'A coil round each pole. It is fed with direct current from the rotating rectifier; more current gives a stronger field and a higher voltage. The poles are connected to be alternately north and south.'});
 for(const a of POLE){
  for(const s of [-1,1]){const [y,z]=turn(a,.168,s*.098);add(field,geo.box(.74,.085,.04),'copper',[0,y,z],[a,0,0],'Field coil side');}
  for(const s of [-1,1]){const [y,z]=turn(a,.168,0);add(field,geo.box(.035,.085,.24),'copper',[s*.388,y,z],[a,0,0],'Field coil end');}
 }
 const damper=part({id:'damper-winding',parent:rotor.object,sv:'Dämplindning',en:'Damper winding',
  textSv:'Kopparstavar i polskorna, kortslutna i ändarna. De dämpar pendlingar när lasten ändras och hjälper generatorer att gå stabilt parallellt.',
  textEn:'Copper bars in the pole faces, shorted at the ends. They damp hunting when the load changes and help generators run steadily in parallel.'});
 for(const a of POLE)for(let k=-2;k<=2;k++){const [y,z]=at(.245,a+k*.17);add(damper,geo.cylX(.007,.78,8),'copper',[0,y,z],[0,0,0],'Damper bar');}

 const shaft=part({id:'shaft',parent:rotor.object,sv:'Axel',en:'Shaft',
  textSv:'Den smidda axeln är svarvad i steg: lagersäten, säten för magnetiseringsmaskinen, likriktaren och PMG:n på N-sidan, och kopplingsänden på D-sidan.',
  textEn:'The forged shaft is turned in steps: bearing seats, seats for the exciter, rectifier and PMG at the non-drive end, and the coupling end at the drive end.'});
 add(shaft,geo.latheX([[-.95,0],[-.95,.045],[-.8,.045],[-.8,.05],[-.6,.05],[-.6,.055],[-.5,.055],[-.5,.1],[.5,.1],[.5,.065],[.64,.065],[.64,.075],[1.0,.075],[1.0,0]],40),'steel');
 add(shaft,geo.box(.2,.012,.022),'darkSteel',[.85,.076,0],[0,0,0],'Key');

 const hub=part({id:'coupling-hub',parent:rotor.object,sv:'Kopplingsnav',en:'Coupling hub',explode:[.3,0,0],
  textSv:'Navet med fläns som dieselmotorns elastiska koppling bultas mot. Uppriktningen mellan motor och generator kontrolleras här, med indikatorklocka på flänsens kant och plan.',
  textEn:'The flanged hub that the diesel’s flexible coupling bolts to. Alignment between engine and generator is checked here, with a dial indicator on the flange’s rim and face.'});
 add(hub,geo.latheX([[.9,0],[.9,.13],[.98,.13],[.98,.22],[1.04,.22],[1.04,0]],48),'darkSteel');
 boltCircle(hub,{x:1.04,r:.18,n:8,size:.018});

 const fan=part({id:'fan',parent:rotor.object,sv:'Fläkt',en:'Cooling fan',explode:[.22,0,0],
  textSv:'En radialfläkt på D-sidan suger kylluften genom generatorn: in genom gallret på N-sidan, förbi magnetiseringsmaskinen och lindningarna, och ut genom jalusierna vid D-sidan.',
  textEn:'A radial fan at the drive end draws the cooling air through the generator: in through the grille at the far end, past the exciter and the windings, and out through the louvres at the drive end.'});
 add(fan,geo.tubeX(.32,.1,.012,64),'aluminium',[.47,0,0],[0,0,0],'Fan back plate');
 add(fan,geo.tubeX(.32,.2,.01,64),'aluminium',[.41,0,0],[0,0,0],'Fan shroud');
 for(let i=0;i<14;i++){const a=i/14*Math.PI*2,[y,z]=at(.255,a);add(fan,geo.box(.06,.13,.006),'aluminium',[.44,y,z],[a,0,0],'Fan blade');}

 const bearingDE=part({id:'bearing-de',parent:rotor.object,sv:'Rullager, D-sida',en:'Roller bearing, drive end',explode:[.32,0,0],
  textSv:'Ett cylindriskt rullager bär rotorns vikt och kraften från kopplingen på D-sidan. Det låter axeln röra sig lite i längdled när den värms.',
  textEn:'A cylindrical roller bearing carries the rotor’s weight and the coupling’s load at the drive end. It lets the shaft move a little lengthways as it warms.'});
 add(bearingDE,geo.tubeX(.115,.098,.045,40),'steel',[.57,0,0],[0,0,0],'Outer ring');
 add(bearingDE,geo.tubeX(.08,.065,.045,40),'steel',[.57,0,0],[0,0,0],'Inner ring');
 for(let i=0;i<16;i++){const [y,z]=at(.089,i/16*Math.PI*2);add(bearingDE,geo.cylX(.0085,.04,8),'darkSteel',[.57,y,z],[0,0,0],'Roller');}

 const bearingNDE=part({id:'bearing-nde',parent:rotor.object,sv:'Kullager, N-sida',en:'Ball bearing, non-drive end',explode:[-.15,0,0],
  textSv:'Ett spårkullager på N-sidan styr axeln i längdled. Lagren smörjs med fett genom nipplar i lagerlocken, med den mängd och det intervall som står på märkskylten.',
  textEn:'A deep-groove ball bearing at the non-drive end locates the shaft lengthways. The bearings are greased through nipples in the bearing caps, with the amount and interval given on the rating plate.'});
 add(bearingNDE,geo.tubeX(.1,.084,.035,40),'steel',[-.55,0,0],[0,0,0],'Outer ring');
 add(bearingNDE,geo.tubeX(.068,.055,.035,40),'steel',[-.55,0,0],[0,0,0],'Inner ring');
 for(let i=0;i<11;i++){const [y,z]=at(.076,i/11*Math.PI*2);add(bearingNDE,geo.sphere(.011,10),'darkSteel',[-.55,y,z],[0,0,0],'Ball');}

 const exciterRotor=part({id:'exciter-rotor',parent:rotor.object,sv:'Magnetiseringsmaskin, rotor',en:'Exciter rotor',
  textSv:'En liten trefasgenerator på samma axel, fast tvärtom: fältet står still och lindningen roterar. Växelspänningen den ger likriktas på axeln.',
  textEn:'A small three-phase generator on the same shaft, the other way round: its field stands still and its winding turns. The alternating voltage it makes is rectified on the shaft.'});
 add(exciterRotor,geo.cylX(.118,.1,40),'lamination',[-.68,0,0]);
 for(const x of [-.74,-.62])add(exciterRotor,geo.torusX(.09,.017,32),'varnish',[x,0,0],[0,0,0],'Exciter armature end winding');

 const rectifier=part({id:'rotating-rectifier',parent:rotor.object,sv:'Roterande likriktare',en:'Rotating rectifier',explode:[-.18,0,0],
  textSv:'Sex dioder på en platta på axeln, i en trefasbrygga: tre framåt och tre bakåt. De gör om magnetiseringsmaskinens växelström till likström för polerna, så att inga släpringar eller borstar behövs. Varistorn i mitten skyddar dioderna mot spänningsspikar.',
  textEn:'Six diodes on a plate on the shaft, in a three-phase bridge: three forward and three reverse. They turn the exciter’s alternating current into direct current for the poles, so no slip rings or brushes are needed. The varistor protects the diodes against voltage spikes.'});
 add(rectifier,geo.tubeX(.16,.05,.014,48),'aluminium',[-.79,0,0],[0,0,0],'Rectifier plate');
 for(let i=0;i<6;i++){const [y,z]=at(.11,i/6*Math.PI*2+.3);add(rectifier,geo.hexX(.028,.012),'brass',[-.803,y,z],[0,0,0],'Diode stud');add(rectifier,geo.cylX(.01,.03,10),i<3?'black':'diode',[-.825,y,z],[0,0,0],'Diode');}
 add(rectifier,geo.cylX(.03,.01,20),'orange',[-.805,.07,-.07],[0,0,0],'Varistor');

 const pmgRotor=part({id:'pmg-rotor',parent:rotor.object,sv:'PMG, rotor (permanentmagneter)',en:'PMG rotor (permanent magnets)',explode:[-.32,0,0],
  textSv:'En ring av permanentmagneter längst ut på axeln. Tillsammans med PMG-statorn är den en egen liten generator som matar AVR:en, så att magnetiseringen fungerar även vid kortslutning och stora motorstarter. Magneterna är kraftiga: håll verktyg borta.',
  textEn:'A ring of permanent magnets at the end of the shaft. With the PMG stator it is a small generator of its own that powers the AVR, so the excitation holds up even during a short circuit or a large motor start. The magnets are strong: keep tools away.'});
 add(pmgRotor,geo.cylX(.075,.06,32),'darkSteel',[-.88,0,0],[0,0,0],'PMG hub');
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2;add(pmgRotor,geo.sectorX(.075,.09,a+.06,a+Math.PI/4-.06,.058,4),i%2?'red':'motorBlue',[-.88,0,0],[0,0,0],'Magnet');}

 // ── Ends, covers and bearings housings ──────────────────────────────────
 const shieldDE=part({id:'end-shield-de',sv:'Lagersköld, D-sida',en:'End shield, drive end',shell:true,explode:[1.95,0,0],
  textSv:'Gaveln mot dieselmotorn bär D-lagret. Kylluften går ut genom skyddsgallret.',
  textEn:'The end shield towards the engine carries the drive-end bearing. The cooling air leaves through its guard.'});
 add(shieldDE,geo.latheX([[.5,.12],[.5,.42],[.53,.42],[.53,.33],[.56,.2],[.6,.13],[.6,.12]],64),'generatorGreen',[0,H,0]);
 add(shieldDE,geo.tubeX(.33,.21,.006,48),'black',[.545,H,0],[0,0,0],'Outlet guard');
 boltCircle(shieldDE,{x:.53,cy:H,r:.395,n:16});
 const capDE=part({id:'bearing-cap-de',sv:'Lagerlock med smörjnippel, D-sida',en:'Bearing cap and grease nipple, drive end',explode:[2.2,0,0],
  textSv:'Locket håller lagret på plats och fettet inne. Nippeln upptill är för påfyllning, och pluggen nedtill släpper ut gammalt fett. Fyll medan generatorn går, och ta ur pluggen så att trycket inte pressar fett in i lindningen.',
  textEn:'The cap holds the bearing and keeps the grease in. The nipple at the top is for filling, the plug below lets old grease out. Grease while running, with the plug out, so pressure does not force grease into the winding.'});
 add(capDE,geo.tubeX(.15,.08,.03,40),'generatorGreen',[.615,H,0]);
 boltCircle(capDE,{x:.63,cy:H,r:.125,n:6,size:.012});
 add(capDE,geo.cylY(.007,.05,8),'brass',[.615,H+.17,0],[0,0,0],'Grease nipple');
 add(capDE,geo.cylY(.012,.03,8),'darkSteel',[.615,H-.16,0],[0,0,0],'Grease outlet plug');

 const shieldNDE=part({id:'end-shield-nde',sv:'Lagersköld, N-sida',en:'End shield, non-drive end',shell:true,explode:[-.55,0,0],
  textSv:'Gaveln på N-sidan bär N-lagret och magnetiseringsmaskinens stator.',
  textEn:'The end shield at the non-drive end carries the non-drive-end bearing and the exciter stator.'});
 add(shieldNDE,geo.latheX([[-.58,.1],[-.58,.18],[-.53,.3],[-.5,.42],[-.47,.42],[-.47,.1]],64),'generatorGreen',[0,H,0]);
 boltCircle(shieldNDE,{x:-.5,cy:H,r:.395,n:16,dir:-1});
 const capNDE=part({id:'bearing-cap-nde',sv:'Lagerlock, N-sida',en:'Bearing cap, non-drive end',explode:[-.8,0,0],
  textSv:'Lagerlocket på N-sidan, med smörjnippel och utloppsplugg som på D-sidan.',
  textEn:'The bearing cap at the non-drive end, with a grease nipple and outlet plug as at the drive end.'});
 add(capNDE,geo.tubeX(.13,.07,.025,40),'generatorGreen',[-.6,H,0]);
 boltCircle(capNDE,{x:-.613,cy:H,r:.105,n:6,size:.011,dir:-1});
 add(capNDE,geo.cylY(.007,.05,8),'brass',[-.6,H+.15,0],[0,0,0],'Grease nipple');

 const exciterStator=part({id:'exciter-stator',sv:'Magnetiseringsmaskin, stator',en:'Exciter stator',explode:[-1.05,0,0],
  textSv:'Den fasta delen av magnetiseringsmaskinen: åtta poler med fältspolar, bultade till gaveln. AVR:en matar dem med en liten likström, och det är så generatorns spänning styrs.',
  textEn:'The fixed part of the exciter: eight poles with field coils, bolted to the end shield. The AVR feeds them a small direct current, and that is how the generator’s voltage is controlled.'});
 add(exciterStator,geo.tubeX(.21,.175,.1,48),'lamination',[-.68,H,0],[0,0,0],'Exciter yoke');
 for(let i=0;i<8;i++){const a=i/8*Math.PI*2,[y,z]=at(.149,a),[cy,cz]=at(.153,a);
  add(exciterStator,geo.box(.1,.052,.045),'lamination',[-.68,H+y,z],[a,0,0],'Exciter pole');
  add(exciterStator,geo.box(.085,.03,.07),'copper',[-.68,H+cy,cz],[a,0,0],'Exciter field coil');}

 const pmgStator=part({id:'pmg-stator',sv:'PMG, stator',en:'PMG stator',explode:[-1.35,0,0],
  textSv:'PMG:ns stator sitter i kåpan runt magnetringen och ger AVR:en en egen, stadig matning.',
  textEn:'The PMG stator sits in the cover round the magnet ring and gives the AVR a steady supply of its own.'});
 add(pmgStator,geo.tubeX(.13,.096,.06,40),'lamination',[-.88,H,0]);
 for(const x of [-.915,-.845])add(pmgStator,geo.torusX(.11,.01,32),'varnish',[x,H,0],[0,0,0],'PMG winding');

 const cover=part({id:'end-cover-nde',sv:'Kåpa, N-sida',en:'End cover, non-drive end',shell:true,explode:[-1.65,0,0],
  textSv:'Kåpan skyddar magnetiseringsmaskinen, likriktaren och PMG:n. Kylluften sugs in genom gallret. Kåpan tas bort för att kontrollera dioderna.',
  textEn:'The cover guards the exciter, the rectifier and the PMG. The cooling air is drawn in through its grille. It comes off to check the diodes.'});
 add(cover,geo.latheX([[-.58,.27],[-.6,.28],[-.95,.28],[-.98,.26],[-.98,.25],[-.95,.27],[-.6,.27]],64),'generatorGreen',[0,H,0]);
 add(cover,geo.cylX(.255,.01,48),'black',[-.975,H,0],[0,0,0],'Air inlet grille');
 for(let i=-4;i<=4;i++)add(cover,geo.box(.012,.012,.48),'generatorGreen',[-.982,H+i*.055,0],[0,0,0],'Grille bar');
 boltCircle(cover,{x:-.6,cy:H,r:.275,n:8,size:.011,dir:-1});

 // ── Terminal box: main terminals, auxiliary terminals and the AVR ───────
 const TB=[-.1,H+FR+.16,0];
 const tbox=part({id:'terminal-box',sv:'Uttagslåda',en:'Terminal box',shell:true,
  textSv:'Lådan på toppen tar emot huvudkablarna till huvudtavlan genom förskruvningar i sidan. Den är stor, för strömmen är stor: omkring 700 A per fas vid full last.',
  textEn:'The box on top takes the main cables to the switchboard through glands in its side. It is large because the current is large: around 700 A per phase at full load.'});
 add(tbox,geo.box(.5,.3,.44),'generatorGreen',TB);
 for(let i=0;i<4;i++)add(tbox,geo.cylZ(.03,.05,16),'black',[TB[0]-.18+i*.12,TB[1]-.06,.24],[0,0,0],'Cable gland');
 const lid=part({id:'terminal-lid',sv:'Lock till uttagslådan',en:'Terminal box lid',shell:true,explode:[0,.55,0],
  textSv:'Locket är bultat runt om. Det får bara tas av när generatorbrytaren är frånskild och låst och generatorn står still: uttagen är spänningsförande så fort rotorn snurrar.',
  textEn:'The lid is bolted all round. Take it off only with the generator breaker isolated and locked and the set at rest: the terminals are live whenever the rotor turns.'});
 add(lid,geo.box(.52,.02,.46),'generatorGreen',[TB[0],TB[1]+.16,0]);
 for(let i=0;i<8;i++){const x=TB[0]+(i%4-1.5)*.15,z=i<4?-.21:.21;add(lid,geo.cylY(.01,.012,6),'darkSteel',[x,TB[1]+.176,z],[0,0,0],'Lid bolt');}

 const mains=part({id:'main-terminals',sv:'Huvuduttag U1, V1, W1, N',en:'Main terminals U1, V1, W1, N',explode:[0,.32,0],
  textSv:'De tre faserna och nollan från lindningarnas stjärnpunkt, på isolatorer. Kablarna kläms mellan brickor med rätt moment; en glapp anslutning blir varm.',
  textEn:'The three phases and the neutral from the winding’s star point, on insulators. The cables are clamped between washers at the right torque; a loose joint runs hot.'});
 add(mains,geo.box(.36,.012,.16),'insulator',[TB[0],TB[1]-.08,-.05]);
 for(let i=0;i<4;i++){const x=TB[0]-.135+i*.09;add(mains,geo.cylY(.018,.06,12),'insulator',[x,TB[1]-.045,-.05],[0,0,0],'Stand-off insulator');
  add(mains,geo.box(.035,.006,.1),'copper',[x,TB[1]-.012,-.05],[0,0,0],'Terminal bar');add(mains,geo.cylY(.007,.04,8),'brass',[x,TB[1],-.05],[0,0,0],'Terminal stud');}
 const aux=part({id:'aux-terminals',sv:'Hjälpplint',en:'Auxiliary terminals',explode:[0,.32,.18],
  textSv:'En rad små plintar för PT100-givarna, stilleståndsvärmaren och AVR:ens mätledningar.',
  textEn:'A row of small terminals for the PT100 sensors, the anti-condensation heater and the AVR’s sensing leads.'});
 for(let i=0;i<10;i++)add(aux,geo.box(.012,.04,.05),i%5===4?'yellow':'cabinet',[TB[0]-.07+i*.016,TB[1]-.1,.13]);
 const avr=part({id:'avr',sv:'AVR (spänningsregulator)',en:'AVR (voltage regulator)',explode:[0,.45,.45],
  textSv:'Den automatiska spänningsregulatorn mäter utspänningen och ändrar magnetiseringsströmmen så att spänningen hålls konstant när lasten ändras. Den sitter på gummidämpare och matas från PMG:n. Potentiometrarna ställer spänning och stabilitet.',
  textEn:'The automatic voltage regulator measures the output voltage and adjusts the excitation current so the voltage holds steady as the load changes. It sits on rubber mounts and is powered by the PMG. Its trimmers set voltage and stability.'});
 add(avr,geo.box(.22,.13,.045),'black',[TB[0]+.1,TB[1]+.02,.19]);
 for(let i=0;i<3;i++)add(avr,geo.cylZ(.008,.012,10),'yellow',[TB[0]+.04+i*.04,TB[1]+.06,.216],[0,0,0],'AVR trimmer');
 for(let i=0;i<8;i++)add(avr,geo.box(.01,.02,.012),'brass',[TB[0]+.02+i*.022,TB[1]-.03,.216],[0,0,0],'AVR terminal');

 const plate=part({id:'rating-plate',sv:'Märkskylt',en:'Rating plate',
  textSv:'Skylten anger skenbar effekt (kVA), spänning, ström, frekvens, varvtal, effektfaktor, isolationsklass, magnetiseringsdata och lagrens fettmängd och smörjintervall.',
  textEn:'The plate gives apparent power (kVA), voltage, current, frequency, speed, power factor, insulation class, excitation data, and the bearings’ grease quantity and interval.'});
 add(plate,geo.box(.14,.09,.003),'plate',[-.2,H+.12,FR+.005],[0,0,0]);

 let running=false,turnAngle=0;
 const lock={sv:'Stoppa aggregatet, öppna generatorbrytaren och lås den i frånskilt läge med eget hänglås och skylt (se huvudtavlans procedur). Spärra start av dieseln.',
  en:'Stop the set, open the generator breaker and lock it in the disconnected position with your own padlock and tag (see the switchboard procedure). Block the diesel from starting.'};
 return kit.finish({
  controls:[{id:'running',type:'toggle',label:{sv:'Kör',en:'Run'},get value(){return running;},set(v){running=!!v;}}],
  update(dt=0){if(!running)return;turnAngle+=dt*Math.PI;rotor.object.rotation.x=turnAngle;},
  procedures:[
   {id:'insulation-test',title:{sv:'Isolationsmätning av huvudlindningen',en:'Insulation test of the main winding'},steps:[
    {...lock,tool:{sv:'Hänglås och skylt',en:'Padlock and tag'}},
    {sv:'Lossa bultarna och lyft av locket till uttagslådan.',en:'Undo the bolts and lift off the terminal box lid.',tool:{sv:'Hylsnyckel',en:'Socket wrench'},remove:['terminal-lid']},
    {sv:'Kontrollera att uttagen är spänningslösa, fas mot fas och fas mot jord. Prova spänningsprovaren mot en känd källa före och efter.',en:'Verify that the terminals are dead, phase to phase and phase to earth. Prove the voltage tester on a known source before and after.',tool:{sv:'Spänningsprovare',en:'Voltage tester'},focus:['main-terminals']},
    {sv:'Koppla bort AVR:ens mätledningar från huvuduttagen, så att AVR:en inte skadas av mätspänningen.',en:'Disconnect the AVR’s sensing leads from the main terminals, so the test voltage does not damage the AVR.',focus:['avr','aux-terminals']},
    {sv:'Mät isolationsresistansen mellan lindningen och stommen med 500 V likspänning. Läs av efter en minut.',en:'Measure the insulation resistance between the winding and the frame at 500 V DC. Read the value after one minute.',tool:{sv:'Isolationsprovare',en:'Insulation tester'},check:{sv:'Jämför med tillverkarens gränsvärde och med tidigare mätningar: trenden säger mest. Ett lågt värde beror ofta på fukt. Kör då stilleståndsvärmaren och mät igen.',en:'Compare with the maker’s limit and with earlier readings: the trend says most. A low value is often damp. Run the anti-condensation heater and measure again.'},focus:['stator-winding','frame']},
    {sv:'Ladda ur lindningen mot jord efter mätningen. Mätspänningen har laddat upp den som en kondensator.',en:'Discharge the winding to earth after the test. The test voltage has charged it like a capacitor.',check:{sv:'Låt den ladda ur minst lika länge som mätningen pågick.',en:'Discharge it for at least as long as the test lasted.'},focus:['stator-winding']},
    {sv:'Anslut AVR:ens mätledningar igen, sätt tillbaka locket, och häv låsningen enligt rutinen.',en:'Reconnect the AVR’s sensing leads, refit the lid, and remove the lock-out by the routine.',focus:['avr','terminal-lid']},
   ]},
   {id:'diode-check',title:{sv:'Kontroll av dioderna i den roterande likriktaren',en:'Checking the rotating rectifier diodes'},steps:[
    {...lock,tool:{sv:'Hänglås och skylt',en:'Padlock and tag'}},
    {sv:'Ta bort kåpan på N-sidan.',en:'Remove the end cover at the non-drive end.',tool:{sv:'Nyckel',en:'Spanner'},remove:['end-cover-nde']},
    {sv:'Ta bort PMG:ns stator och rotor för att komma åt likriktaren. Märk ledningarna först.',en:'Remove the PMG stator and rotor to reach the rectifier. Mark the leads first.',remove:['pmg-stator','pmg-rotor']},
    {sv:'Lossa varje diods anslutningstråd, så att dioderna kan mätas en och en.',en:'Disconnect each diode’s lead, so the diodes can be measured one by one.',focus:['rotating-rectifier']},
    {sv:'Mät varje diod med multimeterns diodläge i båda riktningarna. En hel diod leder åt ena hållet, ungefär 0,4–0,7 V, och spärrar åt det andra.',en:'Test each diode with the multimeter’s diode range in both directions. A good diode conducts one way, about 0.4–0.7 V, and blocks the other.',tool:{sv:'Multimeter',en:'Multimeter'},check:{sv:'Leder åt båda hållen: kortsluten. Leder åt inget håll: avbrott. Båda ska bytas.',en:'Conducts both ways: shorted. Conducts neither way: open. Either must be replaced.'},focus:['rotating-rectifier']},
    {sv:'Titta på varistorn: den ska inte vara svedd eller sprucken. En skadad varistor byts.',en:'Look at the varistor: it must not be scorched or cracked. A damaged one is replaced.',focus:['rotating-rectifier']},
    {sv:'Byt trasig diod mot en med samma polaritet och dra åt med föreskrivet moment. Många tillverkare råder att byta alla sex samtidigt.',en:'Replace a failed diode with one of the same polarity and tighten to the stated torque. Many makers advise changing all six together.',tool:{sv:'Momentnyckel',en:'Torque wrench'},focus:['rotating-rectifier']},
    {sv:'Montera PMG:n och kåpan i omvänd ordning och häv låsningen enligt rutinen.',en:'Refit the PMG and the cover in reverse order and remove the lock-out by the routine.',focus:['pmg-stator','pmg-rotor','end-cover-nde']},
   ]},
   {id:'bearing-nde',title:{sv:'Byte av lager på N-sidan',en:'Changing the non-drive-end bearing'},steps:[
    {...lock,tool:{sv:'Hänglås och skylt',en:'Padlock and tag'}},
    {sv:'Ta bort kåpan på N-sidan.',en:'Remove the end cover at the non-drive end.',remove:['end-cover-nde']},
    {sv:'Ta bort PMG:ns stator och rotor. Märk ledningarna.',en:'Remove the PMG stator and rotor. Mark the leads.',tool:{sv:'Avdragare',en:'Puller'},remove:['pmg-stator','pmg-rotor']},
    {sv:'Stötta rotorn, med lyftblock under axeländen eller en kil i luftgapet, så att den inte vilar på statorn när gaveln släpper.',en:'Support the rotor, with a hoist under the shaft end or a packing in the air gap, so it does not drop onto the stator when the end shield comes free.',tool:{sv:'Lyftblock',en:'Chain hoist'},focus:['rotor','shaft']},
    {sv:'Lossa magnetiseringsmaskinens stator och lagerlocket, och dra av gaveln.',en:'Release the exciter stator and the bearing cap, and draw off the end shield.',remove:['exciter-stator','bearing-cap-nde','end-shield-nde']},
    {sv:'Dra av det gamla lagret med en lageravdragare som tar i innerringen.',en:'Pull off the old bearing with a puller that grips the inner ring.',tool:{sv:'Lageravdragare',en:'Bearing puller'},remove:['bearing-nde']},
    {sv:'Värm det nya lagret med en induktionsvärmare, högst omkring 110 °C, och trä det på axeln. Slå aldrig på lagret.',en:'Heat the new bearing with an induction heater, to no more than about 110 °C, and slide it onto the shaft. Never hammer a bearing.',tool:{sv:'Induktionsvärmare',en:'Induction heater'},focus:['bearing-nde','shaft']},
    {sv:'Fyll fett enligt märkskylten, montera i omvänd ordning, och häv låsningen enligt rutinen.',en:'Grease as the rating plate says, reassemble in reverse order, and remove the lock-out by the routine.',focus:['bearing-cap-nde','rating-plate']},
   ]},
  ],
 });
}
