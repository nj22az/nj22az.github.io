import {createKit} from '../kit.js';

/**
 * Butterfly valve (vridspjällventil), DN150, lug type, lever operated.
 *
 * Origin at the centre of the bore; the pipe runs along X, the stem stands up along Y.
 * Control: opening, 0° (closed) to 90° (fully open). The lever always lies along the disc,
 * so its position shows the valve's state from across the room, as on a real valve.
 */
export const BUTTERFLY_VALVE_META=Object.freeze({
 id:'butterfly-valve',
 title:{sv:'Vridspjällventil DN150',en:'Butterfly valve DN150'},
 summary:{
  sv:'En kvartsvarvsventil: en skiva i röret vrids 90° mellan stängt och öppet. Vanlig i kylvatten-, ballast- och brandsystem ombord, eftersom den är lätt och kort jämfört med en slussventil.',
  en:'A quarter-turn valve: a disc in the pipe turns 90° between closed and open. Common in cooling-water, ballast and fire systems on board, because it is light and short compared with a gate valve.',
 },
});

export function buildButterflyValve(THREE){
 const kit=createKit(THREE,BUTTERFLY_VALVE_META),{part,add,geo}=kit;
 const BORE=.075,BODY_OUT=.15,WIDTH=.056,NECK_TOP=.27;

 const body=part({id:'body',sv:'Ventilhus',en:'Valve body',shell:true,
  textSv:'Huset av gjutjärn spänns fast mellan två rörflänsar. Öronen är borrade för flänsbultarna, så ventilen kan hålla trycket även när röret på ena sidan tas bort.',
  textEn:'The cast-iron body is clamped between two pipe flanges. Its lugs take the flange bolts, so the valve can hold the line even when the pipe on one side is removed.'});
 add(body,geo.tubeX(BODY_OUT,.083,WIDTH),'valveBody');
 for(let i=0;i<8;i++){const a=(i+.5)/8*Math.PI*2;if(Math.abs(Math.sin(a))>.92&&Math.cos(a)>-.5&&Math.sin(a)>0)continue;
  add(body,geo.box(WIDTH,.036,.036),'valveBody',[0,Math.sin(a)*(BODY_OUT+.012),Math.cos(a)*(BODY_OUT+.012)],[a,0,0],'Lug');}
 add(body,geo.cylY(.028,NECK_TOP-BODY_OUT+.01),'valveBody',[0,(BODY_OUT+NECK_TOP)/2,0],[0,0,0],'Neck');
 add(body,geo.cylY(.024,.035),'valveBody',[0,-BODY_OUT-.012,0],[0,0,0],'Bottom boss');

 const pad=part({id:'top-flange',sv:'Topflans (ISO 5211)',en:'Top flange (ISO 5211)',
  textSv:'Topflansen är standardiserad enligt ISO 5211, så att en växel eller ett manöverdon kan monteras i stället för spaken.',
  textEn:'The top flange follows ISO 5211, so a gearbox or an actuator can be fitted in place of the lever.'});
 add(pad,geo.box(.1,.014,.1),'valveBody',[0,NECK_TOP+.007,0]);

 const seat=part({id:'seat',sv:'Säte (manschett)',en:'Seat liner',explode:[.2,0,0],
  textSv:'En gummimanschett av EPDM klär ut loppet. Klaffens kant pressas mot den när ventilen stängs, och det är den som tätar.',
  textEn:'An EPDM rubber liner lines the bore. The edge of the disc presses into it when the valve closes, and that is what seals.'});
 add(seat,geo.tubeX(.083,BORE,WIDTH+.006),'rubber');

 const disc=part({id:'disc',sv:'Klaff',en:'Disc',explode:[0,-.04,.34],
  textSv:'Skivan vrids ett kvarts varv, 90°, mellan stängt och fullt öppet. Även helt öppen står den kvar mitt i flödet och ger ett litet tryckfall.',
  textEn:'The disc turns a quarter turn, 90°, between closed and fully open. Even fully open it stays in the flow and causes a small pressure drop.'});
 add(disc,geo.cylX(BORE-.001,.016,40),'steel');
 add(disc,geo.cylY(.019,.15,20),'steel',[0,0,0],[0,0,0],'Disc hub');

 const stem=part({id:'stem',sv:'Spindel',en:'Stem',explode:[0,.46,0],
  textSv:'Axeln för vridmomentet från spaken till klaffen. Den går genom klaffens nav och är låst vid den.',
  textEn:'The stem carries the turning force from the lever to the disc. It runs through the disc hub and is locked to it.'});
 add(stem,geo.cylY(.0095,.42,16),'steel',[0,.12,0]);
 add(stem,geo.box(.012,.03,.012),'darkSteel',[0,.315,0],[0,0,0],'Square drive');

 const bushTop=part({id:'bushing-upper',sv:'Övre lagerbussning',en:'Upper bushing',explode:[0,.36,0],
  textSv:'Bussningar av mässing styr spindeln och tar upp kraften när trycket i röret trycker på klaffen.',
  textEn:'Brass bushings guide the stem and take the load when the line pressure pushes on the disc.'});
 add(bushTop,geo.tubeX(.017,.0095,.03,20).rotateZ(Math.PI/2),'brass',[0,.235,0]);
 const bushLow=part({id:'bushing-lower',sv:'Nedre lagerbussning',en:'Lower bushing',explode:[0,-.2,0],
  textSv:'Den nedre bussningen bär spindelns nedre ände i husets botten.',
  textEn:'The lower bushing carries the bottom end of the stem in the base of the body.'});
 add(bushLow,geo.tubeX(.017,.0095,.03,20).rotateZ(Math.PI/2),'brass',[0,-.12,0]);

 const seal=part({id:'stem-seal',sv:'O-ringar (spindeltätning)',en:'Stem seal O-rings',explode:[0,.31,0],
  textSv:'O-ringarna tätar spindeln mot huset, så att mediet inte läcker ut längs axeln.',
  textEn:'The O-rings seal the stem against the body, so nothing leaks out along the shaft.'});
 for(const y of [.255,.263])add(seal,geo.torusY(.011,.0025,24),'rubber',[0,y,0]);

 const notch=part({id:'notch-plate',sv:'Indexplatta',en:'Notch plate',explode:[0,.2,0],
  textSv:'Plattan har hack, så att spaken kan låsas stängd, öppen eller i lägen däremellan för enkel strypning.',
  textEn:'The plate has notches, so the lever can be locked closed, open or in between for simple throttling.'});
 add(notch,geo.box(.17,.006,.05),'darkSteel',[.03,NECK_TOP+.02,.03],[0,-Math.PI/4,0]);
 for(let i=0;i<5;i++){const a=-Math.PI/2+i/4*Math.PI/2;add(notch,geo.box(.012,.012,.012),'darkSteel',[Math.sin(a)*-.075,NECK_TOP+.028,Math.cos(a)*.075],[0,a,0],'Notch');}

 const lever=part({id:'lever',sv:'Spak',en:'Lever',explode:[0,.3,0],
  textSv:'Spaken står i linje med klaffen: tvärs röret är ventilen stängd, längs röret är den öppen. Så ser man läget på håll.',
  textEn:'The lever lies along the disc: across the pipe the valve is closed, along the pipe it is open. You can read its state from a distance.'});
 add(lever,geo.cylY(.02,.04,16),'darkSteel',[0,.315,0],[0,0,0],'Lever hub');
 add(lever,geo.box(.022,.012,.26),'darkSteel',[0,.33,.13],[0,0,0],'Lever arm');
 add(lever,geo.box(.03,.026,.09),'red',[0,.33,.235],[0,0,0],'Lever grip');
 add(lever,geo.box(.01,.03,.014),'darkSteel',[0,.315,.075],[0,0,0],'Latch');

 let opening=0;
 const turning=[disc,stem,lever];
 const model=kit.finish({
  controls:[{id:'opening',label:{sv:'Öppning',en:'Opening'},unit:'°',min:0,max:90,step:1,
   get value(){return opening;},
   set(v){opening=Math.max(0,Math.min(90,Number(v)||0));for(const p of turning)p.object.rotation.y=opening*Math.PI/180;}}],
 });
 return model;
}
