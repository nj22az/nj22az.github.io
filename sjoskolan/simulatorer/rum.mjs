// Maskinrummet: golv, skott, generatoruppställning, tavlor, pump och motor, gångbana och elverkstadens bänk.
// Samma rum i alla stationer (Station A, Station B …). Bara presentation: inga elektriska värden räknas här.
// box, cyl och label kommer från stationens scen, så att material och geometrier frigörs med scenen.
export function buildRoom({box,cyl,label}){
  const colliders=[];
  box(9,.12,8,'#94a6ab',0,-.06,0);box(9,3.8,.12,'#b9cbce',0,1.9,-4);box(.12,3.8,8,'#a9bec3',-4.5,1.9,0);
  for(let i=-4;i<=4;i++)box(.035,.012,8,'#7f959b',i,.008,0);
  for(let z=-3;z<=3;z+=1.5)box(9,.012,.025,'#7f959b',0,.009,z);
  // Green gangway and guarded machinery: walking collisions match the equipment footprints.
  box(1.4,.014,6.8,'#779b94',0,.015,0);for(const x of [-.77,.77])box(.04,.018,6.8,'#edd47b',x,.017,0);
  for(let z=-3.5;z<=3.5;z+=1.75)box(.12,.16,8,'#7c949d',z,3.5,0);
  for(const x of [-3.3,3.3]){const pipe=cyl(.09,7.5,'#b76355',x,2.95,0);pipe.rotation.x=Math.PI/2;}
  for(const z of [-2.7,0,2.7]){box(2.3,.04,.25,'#e9efdd',0,3.25,z);box(2.4,.08,.3,'#677a81',0,3.31,z);}
  colliders.push(...[[-3.9,-1.5,-2.7,1.4],[1.5,3.9,-3.45,-2.1],[1.9,3.8,.1,2.0],[-.72,.72,-1.38,-.63]]);
  // Port generator set.
  box(2.1,.28,3.4,'#51636a',-2.7,.18,-.65);box(1.55,1.15,2.45,'#477d78',-2.7,.9,-.5);
  for(let z=-1.4;z<=.6;z+=.4){box(1.62,.07,.07,'#305855',-2.7,1.35,z);cyl(.13,.16,'#aab7b4',-2.7,1.57,z);}
  const alternator=cyl(.6,1.05,'#477d78',-2.7,.86,1);alternator.rotation.x=Math.PI/2;
  for(let x=-3.4;x<-2;x+=.18)box(.04,.5,.02,'#273f46',x,.9,1.55);
  box(.12,.8,.08,'#c7ab53',-1.5,.45,.6);box(2.6,.07,.07,'#c7ab53',-2.7,.85,.6);label('GENERATOR',[ -2.7,2,-.1],1.8);
  // Starboard distribution board and motor/pump.
  for(let x=1.7;x<=3.8;x+=.7){box(.65,2.2,.7,'#bdc7c8',x,1.12,-2.8);box(.54,1.8,.035,'#d7e1dd',x,1.19,-2.43);box(.14,.14,.025,'#253e49',x,1.75,-2.4);cyl(.045,.03,'#b64c40',x,1.38,-2.4).rotation.x=Math.PI/2;box(.025,.32,.03,'#677c83',x+.2,1.2,-2.38);}
  label('DISTRIBUTION',[2.7,2.55,-2.45],2);
  box(1.6,.16,1.55,'#5d6e72',2.8,.12,1);const pump=cyl(.4,.85,'#577b98',2.8,.65,1);pump.rotation.z=Math.PI/2;
  box(.6,.25,.5,'#829ea9',2.8,1.05,1);const out=cyl(.12,1.4,'#6c998c',3.4,1.1,1);box(.7,.15,.15,'#6c998c',3.1,1.8,1);label('PUMP & MOTOR',[2.8,2.1,1],1.8);
  label('ELVERKSTAD · SELV',[0,2,-1.4],2);label('MASKINRUM',[0,2.8,-3.9],2.6);
  // Bench surface, safe DC components and marked physical sockets.
  box(1.4,.09,.75,'#d4c5a7',0,1.02,-1);for(const x of [-.56,.56])box(.08,1,.08,'#5e7780',x,.5,-1);
  return colliders;
}
