import {createKit} from '../kit.js';

/**
 * Three-phase squirrel-cage induction motor (asynkronmotor), IEC frame 160, foot mounted,
 * totally enclosed and fan cooled (IC 411), as on a pump or fan on board.
 *
 * Real frame 160 dimensions where it matters: shaft height 160 mm, shaft end Ø42 × 110 mm.
 * Origin on the floor under the middle of the motor; the drive end (D-sida) faces +X.
 * Controls: running (the rotor, shaft and fan turn) and the terminal links, star or delta.
 */
export const INDUCTION_MOTOR_META=Object.freeze({
 id:'induction-motor',
 title:{sv:'Asynkronmotor, kortsluten, storlek 160',en:'Induction motor, squirrel cage, frame 160'},
 summary:{
  sv:'Fartygets arbetshäst: trefasmotorn som driver pumpar, fläktar och kompressorer. Statorns tre lindningar ger ett roterande magnetfält, och den kortslutna rotorn följer efter, lite långsammare än fältet.',
  en:'The ship’s workhorse: the three-phase motor that drives pumps, fans and compressors. The stator’s three windings make a rotating magnetic field, and the squirrel-cage rotor follows it, a little slower than the field.',
 },
});

export function buildInductionMotor(THREE){
 const kit=createKit(THREE,INDUCTION_MOTOR_META),{part,add,geo}=kit;
 const H=.16,R=.135,LEN=.4;

 const frame=part({id:'frame',sv:'Statorhus med kylflänsar',en:'Frame with cooling fins',shell:true,
  textSv:'Huset bär statorn och leder bort värmen. Kylflänsarna ger mer yta mot luften som fläkten blåser längs dem. Motorn är helt kapslad: kylluften går utanpå, aldrig genom motorn.',
  textEn:'The frame carries the stator and takes the heat away. The fins give more surface for the air the fan blows along them. The motor is totally enclosed: the cooling air passes outside, never through it.'});
 add(frame,geo.tubeX(R,.126,LEN),'motorBlue',[0,H,0]);
 for(let i=0;i<30;i++){const a=i/30*Math.PI*2;if(Math.cos(a)<-.8)continue;
  add(frame,geo.box(LEN-.02,.024,.006),'motorBlue',[0,H+Math.cos(a)*(R+.01),Math.sin(a)*(R+.01)],[a,0,0],'Cooling fin');}
 for(const x of [-.13,.13])for(const z of [-.115,.115]){
  add(frame,geo.box(.07,.026,.06),'motorBlue',[x,.013,z],[0,0,0],'Foot');
  add(frame,geo.box(.07,.07,.02),'motorBlue',[x,.06,z*.88],[0,0,0],'Foot web');
 }
 add(frame,new THREE.TorusGeometry(.022,.007,8,20),'darkSteel',[-.06,H+R+.03,0],[0,Math.PI/2,0],'Lifting eye');

 const core=part({id:'stator-core',sv:'Statorpaket',en:'Stator core',
  textSv:'Ett paket av tunna, isolerade elektroplåtar. Plåten är tunn för att hålla nere virvelströmsförlusterna; ett massivt järnstycke skulle bli varmt.',
  textEn:'A stack of thin, insulated electrical-steel laminations. They are thin to keep eddy-current losses down; a solid piece of iron would run hot.'});
 add(core,geo.tubeX(.125,.072,.28),'lamination',[0,H,0]);

 const winding=part({id:'stator-winding',sv:'Statorlindning',en:'Stator winding',
  textSv:'Tre faslindningar, förskjutna 120° runt statorn. Matade med trefasström ger de tillsammans ett magnetfält som roterar. Lindningshuvudena syns i varje ände av paketet.',
  textEn:'Three phase windings, spaced 120° round the stator. Fed with three-phase current they make a magnetic field that rotates. The end windings show at each end of the core.'});
 for(const x of [-.155,.155])add(winding,geo.torusX(.098,.022),'copper',[x,H,0]);

 const rotor=part({id:'rotor',sv:'Rotor (kortsluten)',en:'Rotor (squirrel cage)',explode:[.52,0,0],
  textSv:'Stavar av aluminium kortsluts av en ring i varje ände, som en ekorrbur. Det roterande fältet inducerar ström i stavarna, och rotorn drar efter fältet men går lite långsammare: eftersläpningen. Därav namnet asynkronmotor.',
  textEn:'Aluminium bars are shorted by a ring at each end, like a squirrel cage. The rotating field induces current in the bars and the rotor is pulled round after it, a little slower: the slip. Hence an asynchronous motor.'});
 rotor.object.position.set(0,H,0);
 add(rotor,geo.cylX(.069,.28,40),'lamination');
 for(const x of [-.145,.145])add(rotor,geo.tubeX(.069,.03,.022),'aluminium',[x,0,0],[0,0,0],'End ring');
 for(let i=0;i<18;i++){const a=i/18*Math.PI*2;add(rotor,geo.box(.28,.007,.009),'aluminium',[0,Math.cos(a)*.066,Math.sin(a)*.066],[a,0,0],'Rotor bar');}

 const shaft=part({id:'shaft',parent:rotor.object,sv:'Axel med kil',en:'Shaft and key',
  textSv:'Axeln för ut vridmomentet. För storlek 160 är axeländen 42 mm grov och 110 mm lång, så motorer från olika tillverkare passar samma koppling.',
  textEn:'The shaft carries the torque out. On frame 160 the shaft end is 42 mm across and 110 mm long, so motors from different makers fit the same coupling.'});
 add(shaft,geo.cylX(.021,.72,24),'steel',[.06,0,0]);
 add(shaft,geo.box(.07,.009,.012),'darkSteel',[.36,.023,0],[0,0,0],'Key');

 const bearingDE=part({id:'bearing-de',parent:rotor.object,sv:'Lager, D-sida',en:'Bearing, drive end',explode:[.08,0,0],
  textSv:'Kullagren bär rotorn så att den går mitt i statorn. Luftgapet mellan rotor och stator är under en millimeter, så ett slitet lager märks snabbt.',
  textEn:'The ball bearings hold the rotor in the middle of the stator. The air gap between rotor and stator is under a millimetre, so a worn bearing soon shows.'});
 add(bearingDE,geo.tubeX(.042,.021,.022),'steel',[.215,0,0]);
 const bearingNDE=part({id:'bearing-nde',parent:rotor.object,sv:'Lager, N-sida',en:'Bearing, non-drive end',explode:[-.06,0,0],
  textSv:'Lagret på N-sidan, bakom fläkten. Det är ofta ett mindre lager än på D-sidan, där remmen eller kopplingen belastar axeln.',
  textEn:'The bearing at the non-drive end, behind the fan. It is often smaller than the drive-end bearing, which takes the load from the belt or coupling.'});
 add(bearingNDE,geo.tubeX(.038,.021,.02),'steel',[-.215,0,0]);

 const shieldDE=part({id:'end-shield-de',sv:'Lagersköld, D-sida',en:'End shield, drive end',shell:true,explode:[.3,0,0],
  textSv:'Gaveln håller lagret och stänger motorn. D-sidan är drivsidan, där axeln går ut.',
  textEn:'The end shield holds the bearing and closes the motor. The drive end is where the shaft comes out.'});
 add(shieldDE,geo.tubeX(.138,.024,.03),'motorBlue',[.215,H,0]);
 add(shieldDE,geo.tubeX(.06,.024,.05),'motorBlue',[.235,H,0],[0,0,0],'Bearing housing');
 const shieldNDE=part({id:'end-shield-nde',sv:'Lagersköld, N-sida',en:'End shield, non-drive end',shell:true,explode:[-.2,0,0],
  textSv:'Gaveln på N-sidan, mot fläkten.',textEn:'The end shield at the non-drive end, towards the fan.'});
 add(shieldNDE,geo.tubeX(.138,.024,.03),'motorBlue',[-.215,H,0]);

 const fan=part({id:'fan',sv:'Fläkt',en:'Cooling fan',explode:[-.3,0,0],
  textSv:'Fläkten sitter på axeln och blåser luft längs kylflänsarna. Den går med motorns varvtal, så en motor som körs långsamt via frekvensomriktare kyls sämre.',
  textEn:'The fan sits on the shaft and blows air along the fins. It runs at motor speed, so a motor run slowly by a frequency converter is cooled less well.'});
 fan.object.position.set(-.27,H,0);
 add(fan,geo.cylX(.03,.04,20),'black');
 for(let i=0;i<9;i++){const a=i/9*Math.PI*2;add(fan,geo.box(.035,.085,.005),'black',[0,Math.cos(a)*.072,Math.sin(a)*.072],[a,0,0],'Fan blade');}

 const cowl=part({id:'fan-cover',sv:'Fläktkåpa',en:'Fan cover',shell:true,explode:[-.44,0,0],
  textSv:'Kåpan skyddar fläkten och leder luften framåt över flänsarna. Gallret måste hållas rent; en igensatt kåpa ger en varm motor.',
  textEn:'The cover guards the fan and guides the air forward over the fins. Its grille must be kept clear; a blocked cover makes a hot motor.'});
 add(cowl,geo.tubeX(.145,.139,.11),'motorBlue',[-.275,H,0]);
 add(cowl,geo.cylX(.145,.006,40),'black',[-.333,H,0],[0,0,0],'Grille');
 for(const r of [.05,.09,.13])add(cowl,geo.torusX(r,.004),'motorBlue',[-.337,H,0],[0,0,0],'Grille ring');

 const box=part({id:'terminal-box',sv:'Kopplingslåda',en:'Terminal box',shell:true,
  textSv:'Här kommer matningskabeln in, genom en förskruvning som tätar och håller kabeln.',
  textEn:'The supply cable comes in here, through a gland that seals and grips the cable.'});
 add(box,geo.box(.16,.05,.16),'motorBlue',[0,H+R+.02,0]);
 add(box,geo.cylZ(.016,.04),'black',[0,H+R+.02,.095],[0,0,0],'Cable gland');
 const lid=part({id:'terminal-lid',sv:'Lock',en:'Terminal box lid',shell:true,explode:[0,.24,0],
  textSv:'Locket skruvas av för att komma åt plinten. Bryt och lås matningen först.',
  textEn:'The lid comes off to reach the terminal board. Isolate and lock off the supply first.'});
 add(lid,geo.box(.17,.016,.17),'motorBlue',[0,H+R+.053,0]);

 const BOARD_Y=H+R+.05;
 const board=part({id:'terminal-board',sv:'Plint U1 V1 W1 / W2 U2 V2',en:'Terminal board U1 V1 W1 / W2 U2 V2',explode:[0,.13,0],
  textSv:'Lindningarnas sex ändar kommer upp här: början U1, V1, W1 i nedre raden och slutet W2, U2, V2 i övre. Raderna är förskjutna, så att blecken kan läggas rakt för D och tvärs för Y.',
  textEn:'The six winding ends come up here: the starts U1, V1, W1 in the lower row and the ends W2, U2, V2 in the upper. The rows are offset so the links lie straight for delta and across for star.'});
 add(board,geo.box(.13,.012,.09),'plate',[0,BOARD_Y,0]);
 const STUD_X=[-.04,0,.04];
 for(const z of [-.025,.025])for(const x of STUD_X)add(board,geo.cylY(.006,.026,12),'brass',[x,BOARD_Y+.016,z],[0,0,0],'Terminal stud');

 const links=part({id:'links',parent:board.object,sv:'Bleck',en:'Terminal links',
  textSv:'Blecken avgör kopplingen. Y (stjärna): ett bleck tvärs över W2–U2–V2. D (triangel): tre bleck rakt, U1–W2, V1–U2 och W1–V2. Märkskylten anger vilken koppling som hör till nätets spänning.',
  textEn:'The links set the connection. Star: one link across W2–U2–V2. Delta: three straight links, U1–W2, V1–U2 and W1–V2. The rating plate says which connection goes with the supply voltage.'});
 const star=add(links,geo.box(.1,.004,.014),'brass',[0,BOARD_Y+.03,-.025],[0,0,0],'Star link');
 const delta=STUD_X.map(x=>add(links,geo.box(.014,.004,.064),'brass',[x,BOARD_Y+.03,0],[0,0,0],'Delta link'));

 const plate=part({id:'rating-plate',sv:'Märkskylt',en:'Rating plate',
  textSv:'Skylten anger märkspänning för Y och D, märkström, effekt, varvtal, cos φ och isolationsklass. Börja alltid där.',
  textEn:'The plate gives the rated voltage for star and delta, rated current, power, speed, power factor and insulation class. Always start there.'});
 add(plate,geo.box(.085,.05,.002),'plate',[0,H+R+.02,.081]);

 let running=false,connection='delta',turn=0;
 const spinning=[rotor,fan];
 const showLinks=()=>{star.visible=connection==='star';for(const d of delta)d.visible=connection==='delta';};showLinks();
 return kit.finish({
  controls:[
   {id:'running',type:'toggle',label:{sv:'Kör',en:'Run'},get value(){return running;},set(v){running=!!v;}},
   {id:'connection',type:'choice',label:{sv:'Koppling',en:'Connection'},options:[{value:'star',label:{sv:'Y',en:'Star (Y)'}},{value:'delta',label:{sv:'D',en:'Delta (Δ)'}}],
    get value(){return connection;},set(v){connection=v==='star'?'star':'delta';showLinks();}},
  ],
  /** Turns the rotor slowly enough to follow by eye; a real 4-pole motor runs about 1,460 rpm. */
  update(dt=0){if(!running)return;turn+=dt*Math.PI*1.2;for(const p of spinning)p.object.rotation.x=turn;},
 });
}
