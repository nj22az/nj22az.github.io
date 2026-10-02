import {createKit} from '../kit.js';

/**
 * Flexible jaw coupling (klokoppling) between an induction motor and a pump: two hubs with
 * three jaws each, and an elastomer spider between them. It carries the torque, takes up a
 * little misalignment and damps shocks, but it is not a cure for poor alignment.
 *
 * Origin on the floor under the coupling; the motor shaft comes in from -X, the pump shaft
 * from +X. Controls: parallel offset and angular misalignment of the pump shaft (drawn ten
 * times enlarged), and running. The dial indicator's rim reading follows the offset.
 * Procedures: shaft alignment.
 */
export const SHAFT_COUPLING_META=Object.freeze({
 id:'shaft-coupling',
 title:{sv:'Axelkoppling, elastisk klokoppling',en:'Shaft coupling, flexible jaw type'},
 summary:{
  sv:'Kopplingen för vridmomentet från motor till pump. Den elastiska stjärnan mellan klorna tar upp små fel i uppriktningen och dämpar stötar, men slits fort om axlarna inte står i linje. Därför riktas axlarna upp, med mellanlägg under motorns fötter.',
  en:'The coupling carries the torque from motor to pump. The elastic spider between the jaws takes up small alignment errors and damps shocks, but wears fast if the shafts are not in line. So the shafts are aligned, with shims under the motor’s feet.',
 },
});
/** How much the misalignment is enlarged in the drawing, so a tenth of a millimetre shows. */
export const MISALIGNMENT_SCALE=10;

export function buildShaftCoupling(THREE){
 const kit=createKit(THREE,SHAFT_COUPLING_META),{part,add,geo}=kit;
 const H=.18,R=.05;
 const jaw=(rec,x,a,dir)=>add(rec,geo.sectorX(.022,R,a-Math.PI/12,a+Math.PI/12,.03,4),'darkSteel',[x+dir*.015,H,0],[0,0,0],'Jaw');

 const motorShaft=part({id:'motor-shaft',sv:'Motoraxel',en:'Motor shaft',
  textSv:'Motorns axelände med kil. Motorn är den maskin man flyttar vid uppriktning; pumpen sitter fast på sina rör.',
  textEn:'The motor’s shaft end with its key. The motor is the machine you move when aligning; the pump is held by its pipes.'});
 add(motorShaft,geo.cylX(.019,.26,24),'steel',[-.2,H,0]);
 add(motorShaft,geo.latheX([[-.36,0],[-.36,.14],[-.33,.14],[-.33,.03],[-.3,.03],[-.3,0]],40),'motorBlue',[0,H,0],[0,0,0],'Motor end shield');

 const motorHub=part({id:'motor-hub',sv:'Nav, motorsidan',en:'Hub, motor side',explode:[-.12,0,0],
  textSv:'Navet sitter på motoraxeln med kil och låsskruv. Klorna griper in mellan stjärnans armar.',
  textEn:'The hub sits on the motor shaft with a key and a set screw. Its jaws reach in between the spider’s arms.'});
 add(motorHub,geo.cylX(R,.055,40),'darkSteel',[-.0425,H,0],[0,0,0],'Hub body');
 for(const a of [0,2,4])jaw(motorHub,0,a*Math.PI/3,0);

 const spider=part({id:'spider',sv:'Elastisk stjärna',en:'Elastomer spider',explode:[0,.12,0],
  textSv:'Stjärnan av polyuretan sitter mellan klorna och för över vridmomentet genom tryck. Den tål små vinkel- och höjdfel och dämpar stötar. Sprickor, smulor under kopplingen eller en tillplattad stjärna betyder att den ska bytas, och oftast att uppriktningen är fel.',
  textEn:'The polyurethane spider sits between the jaws and carries the torque in compression. It tolerates small angular and offset errors and damps shocks. Cracks, crumbs under the coupling or a flattened spider mean it must be changed, and usually that the alignment is wrong.'});
 add(spider,geo.tubeX(.024,.014,.03,24),'polyurethane',[0,H,0],[0,0,0],'Spider centre');
 for(let k=0;k<6;k++){const a=Math.PI/6+k*Math.PI/3;add(spider,geo.sectorX(.014,R-.002,a-Math.PI/14,a+Math.PI/14,.028,4),'polyurethane',[0,H,0],[0,0,0],'Spider arm');}

 // The pump side moves together when it is out of line.
 // It pivots about the coupling's centre: a group at shaft height holding one back at the floor.
 const pivot=new THREE.Group();pivot.name='Pump side pivot';pivot.position.set(0,H,0);kit.root.add(pivot);
 const pumpSide=new THREE.Group();pumpSide.name='Pump side';pumpSide.position.set(0,-H,0);pivot.add(pumpSide);
 const pumpHub=part({id:'pump-hub',parent:pumpSide,sv:'Nav, pumpsidan',en:'Hub, pump side',explode:[.12,0,0],
  textSv:'Pumpaxelns nav, likadant men vänt åt andra hållet. Klorna sitter förskjutna 60° mot motornavets.',
  textEn:'The pump shaft’s hub, the same but facing the other way. Its jaws sit 60° round from the motor hub’s.'});
 add(pumpHub,geo.cylX(R,.055,40),'darkSteel',[.0425,H,0],[0,0,0],'Hub body');
 for(const a of [1,3,5])jaw(pumpHub,0,a*Math.PI/3,0);
 const pumpShaft=part({id:'pump-shaft',parent:pumpSide,sv:'Pumpaxel',en:'Pump shaft',
  textSv:'Pumpens axelände, som går in i lagerbocken.',textEn:'The pump’s shaft end, running into its bearing bracket.'});
 add(pumpShaft,geo.cylX(.019,.26,24),'steel',[.2,H,0]);
 add(pumpShaft,geo.latheX([[.3,0],[.3,.03],[.33,.03],[.33,.09],[.36,.09],[.36,0]],40),'castIron',[0,H,0],[0,0,0],'Bearing bracket end');

 const keys=part({id:'keys',sv:'Kilar',en:'Keys',explode:[0,.08,0],
  textSv:'Kilarna i axlarnas kilspår för över vridmomentet till naven. En kil som sitter löst slår ut spåret.',
  textEn:'The keys in the shaft keyways carry the torque into the hubs. A loose key hammers out its keyway.'});
 add(keys,geo.box(.05,.006,.008),'brass',[-.045,H+.02,0]);
 const screws=part({id:'set-screws',sv:'Låsskruvar',en:'Set screws',explode:[0,.1,0],
  textSv:'Låsskruven trycker mot kilen och hindrar navet från att vandra på axeln. Den låses med gänglåsning.',
  textEn:'The set screw bears on the key and stops the hub creeping along the shaft. It is secured with thread-locker.'});
 add(screws,geo.cylY(.005,.018,8),'black',[-.045,H+.052,0]);

 const guard=part({id:'guard',sv:'Kopplingsskydd',en:'Coupling guard',shell:true,explode:[0,.35,0],
  textSv:'Skyddet täcker den roterande kopplingen. Maskinen får inte köras utan det; en ärm eller en trasa som fastnar dras in direkt.',
  textEn:'The guard covers the turning coupling. The machine must never run without it; a sleeve or rag that catches is drawn in at once.'});
 // Expanded-metal mesh, as many guards are: you can see the coupling turn, but not reach it.
 add(guard,geo.sectorX(.085,.088,-Math.PI/2-.3,Math.PI/2+.3,.5,20),guard.finish('yellow',{transparent:true,opacity:.4,depthWrite:false}),[0,H,0]);
 for(const z of [-1,1])add(guard,geo.box(.5,.01,.03),'yellow',[0,H-.03,z*.087],[0,0,0],'Guard flange');

 const dial=part({id:'dial-indicator',sv:'Indikatorklocka',en:'Dial indicator',explode:[0,.1,-.15],
  textSv:'Klockan spänns fast på motornavet med mätstiftet mot pumpnavets mantel. När båda axlarna vrids ett varv visar den hur mycket pumpaxeln ligger fel. Avläsningen på manteln är dubbla höjdfelet.',
  textEn:'The indicator is clamped to the motor hub with its plunger on the pump hub’s rim. Turning both shafts a full turn shows how far out the pump shaft is. The rim reading is twice the offset.'});
 add(dial,geo.box(.012,.08,.012),'steel',[-.03,H+.09,0],[0,0,0],'Indicator bar');
 add(dial,geo.box(.07,.012,.012),'steel',[.005,H+.13,0],[0,0,0],'Indicator arm');
 add(dial,geo.cylZ(.025,.015,24),'steel',[.04,H+.115,0],[0,0,0],'Indicator body');
 add(dial,geo.cylZ(.021,.002,24),'white',[.04,H+.115,.009],[0,0,0],'Indicator face');
 add(dial,geo.cylY(.003,.04,6),'steel',[.04,H+.075,0],[0,0,0],'Plunger');

 let offset=0,angle=0,running=false,turnAngle=0;
 function place(){
  pivot.position.set(0,H+offset/1000*MISALIGNMENT_SCALE,0);
  pivot.rotation.z=angle/1000*MISALIGNMENT_SCALE;
 }
 const spinning=[motorHub,motorShaft];
 return kit.finish({
  misalignmentScale:MISALIGNMENT_SCALE,
  /** What the indicator shows on the rim over half a turn, mm: twice the offset. */
  rimReading:()=>Math.round(offset*2*100)/100,
  controls:[
   {id:'offset',label:{sv:'Höjdfel',en:'Parallel offset'},unit:' mm',min:0,max:1,step:.01,get value(){return offset;},set(v){offset=Math.max(0,Math.min(1,Number(v)||0));place();}},
   {id:'angle',label:{sv:'Vinkelfel',en:'Angular error'},unit:' mm/m',min:0,max:1,step:.01,get value(){return angle;},set(v){angle=Math.max(0,Math.min(1,Number(v)||0));place();}},
   {id:'running',type:'toggle',label:{sv:'Kör',en:'Run'},get value(){return running;},set(v){running=!!v;}},
  ],
  update(dt=0){if(!running)return;turnAngle+=dt*Math.PI*1.2;for(const p of spinning)p.object.rotation.x=turnAngle;pumpHub.object.rotation.x=turnAngle;pumpShaft.object.rotation.x=turnAngle;},
  procedures:[
   {id:'alignment',title:{sv:'Uppriktning av motor och pump',en:'Aligning motor and pump'},initial:[['offset',.4],['angle',.3]],steps:[
    {sv:'Bryt och lås motorns matning med eget hänglås och skylt.',en:'Isolate and lock off the motor supply with your own padlock and tag.',tool:{sv:'Hänglås och skylt',en:'Padlock and tag'}},
    {sv:'Ta bort kopplingsskyddet.',en:'Remove the coupling guard.',remove:['guard']},
    {sv:'Kontrollera mjuk fot: lossa en motorfot i taget med en indikator på foten. Om foten lyfter mer än några hundradelar, lägg i mellanlägg tills den inte gör det.',en:'Check for soft foot: slacken one motor foot at a time with an indicator on it. If the foot rises more than a few hundredths of a millimetre, shim it until it does not.',tool:{sv:'Indikatorklocka och mellanlägg',en:'Dial indicator and shims'},focus:['motor-shaft']},
    {sv:'Spänn fast indikatorklockan på motornavet med mätstiftet mot pumpnavets mantel, och nollställ den högst upp.',en:'Clamp the dial indicator to the motor hub with its plunger on the pump hub’s rim, and zero it at the top.',focus:['dial-indicator','pump-hub']},
    {sv:'Vrid båda axlarna tillsammans och läs av vid 90°, 180° och 270°.',en:'Turn both shafts together and read at 90°, 180° and 270°.',check:{sv:'Höjdfelet är halva avläsningen vid 180°. Sidfelet är halva skillnaden mellan 90° och 270°.',en:'The vertical offset is half the reading at 180°. The side offset is half the difference between 90° and 270°.'},focus:['dial-indicator']},
    {sv:'Mät vinkelfelet: gapet mellan navens plana ytor upptill och nedtill, med bladmått, eller med klockan mot navets plan.',en:'Measure the angular error: the gap between the hub faces at top and bottom with feeler gauges, or with the indicator on the hub face.',tool:{sv:'Bladmått',en:'Feeler gauges'},focus:['motor-hub','pump-hub']},
    {sv:'Rätta höjden med mellanlägg under motorns fötter och sidan med motorns justerskruvar. Dra åt fötterna och mät igen.',en:'Correct the height with shims under the motor’s feet and the side with the motor’s jacking screws. Tighten the feet and measure again.',check:{sv:'Följ kopplingstillverkarens och pumptillverkarens toleranser. Lagren och tätningen vill ha snävare uppriktning än kopplingen tål.',en:'Follow the coupling and pump makers’ tolerances. The bearings and seal want tighter alignment than the coupling can stand.'},set:{offset:0,angle:0},focus:['motor-shaft']},
    {sv:'Ta bort klockan, sätt tillbaka kopplingsskyddet och häv låsningen.',en:'Remove the indicator, refit the guard, and remove the lock-out.',remove:['dial-indicator'],focus:['guard']},
   ]},
  ],
 });
}
