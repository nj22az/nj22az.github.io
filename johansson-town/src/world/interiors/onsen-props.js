import * as THREE from '../../../vendor/three.module.js';
import {mergeGeometries} from '../../../vendor/BufferGeometryUtils.js';
import {FURNITURE_HEIGHTS} from '../furniture-standards.js';
import {ONSEN_SIGNS} from './onsen-signs.js';

/**
 * Umi-no-yu's small things, each with a person who uses it and a reason it is where it is:
 *
 * - the straw jar on top of the milk cooler (who drinks bottled milk through a straw, and
 *   where Tetsuo finds his straws to explain the circuits);
 * - the uchiwa rack on the lobby wall by the tatami (summer fans for people cooling down
 *   after the bath; the giant Hārī fan Fujita takes to the noren);
 * - Mrs Higa's rubber plant in the changing room, by the frosted bath door where the light
 *   from the bath hall's sea glass comes through, a step from the right-hand mirror's dryer;
 * - Mrs Higa's account book, open on the bandai in front of her, with its pencil;
 * - the men's side's small vanity: one mirror on a wall shelf, a bottle of hair tonic and a comb sterilizer
 *   glowing blue (plugged into its own socket on the lobby circuit, onsen-electrics.js).
 *
 * Everything is data first (ONSEN_PROPS): where it stands, what it stands on, who it is
 * for and why, what it is made of in the period. The builder only draws the data, and
 * names every part, so the film can hide what a hand takes (HIDE by name) and the tests
 * can check that each thing rests on its surface and keeps out of the way.
 *
 * Light for phones: flat colours or one small canvas each, parts that never move merged
 * into one mesh per material. Room frame as in onsen.js: street door at +z, sea at -z,
 * metres, floor at y = 0.
 */
const plain=o=>Object.freeze(o);

/** Milk cooler top (onsen-lobby.js): the cabinet's 0.3 m lid box centred at y 1.45. */
const COOLER_TOP=1.6;
/** The lobby face of the wall between the lobby and the changing room (onsen.js: a 0.12 m wall centred on z 1.6). */
const LOBBY_WALL=1.66;
/** The same wall's face on the changing-room side. */
const CHANGING_WALL=1.54;

export const ONSEN_PROPS=Object.freeze({
 strawJar:plain({id:'straw-jar',name:'Straw jar',jp:'ストロー',
  at:Object.freeze([4.47,COOLER_TOP,2.45]),on:'Milk cooler top',r:.042,h:.11,
  for:'Children, who drink their fruit milk through a straw, and the old regulars with dentures; anyone who wants their coffee milk slowly.',
  why:'On the cooler’s lid, at the back corner by the wall: you take a bottle and a straw in one movement, and nobody knocks the jar over reaching for the door.',
  period:'A squat glass jar, the kind jam came in, full of striped plastic straws: by the 1980s Japanese straws were plastic, not paper (a box of them came in paper sleeves, which Mrs Higa throws away). The thin ones for milk, a few thin stirrer straws from the coffee counter at Sakura Shōten, and two fat milkshake straws left over from a summer.',
  straws:Object.freeze([
   plain({kind:'thin',count:8,r:.0032,len:.21,stripe:'red',en:'Ordinary 6 mm straws, red-striped'}),
   plain({kind:'thinner',count:3,r:.0021,len:.18,stripe:'green',en:'Thin 4 mm stirrer straws, green-striped'}),
   plain({kind:'fat',count:2,r:.006,len:.23,stripe:'blue',en:'Fat 12 mm milkshake straws, blue-striped'}),
  ]),
  // Page 8 of "Fujita's Ten Minutes of Heaven": three thin (a dryer each, 12 A), one thinner (the chair, 2 A), one fat
  // (the main). They stand together in the jar as "Straws Tetsuo takes", so the film hides them in one word once he has them.
  takes:plain({thin:3,thinner:1,fat:1,group:'Straws Tetsuo takes',
   why:'Tetsuo shows the circuits with straws: a straw carries only so much, like a wire. The second fat straw stays in the jar.'})}),

 uchiwaRack:plain({id:'uchiwa-rack',name:'Uchiwa rack',jp:'うちわ差し',
  // The pocket: its back on the wall, its bottom above the wainscot rail (top at y 0.945).
  pocket:plain({x:1.23,y:1.02,wallZ:LOBBY_WALL,w:.3,h:.15,d:.07}),
  fan:plain({r:.115,handle:.16}),
  // Where each fan's handle stands on the pocket's floor (x), its lean in the wall's plane, and its distance off the wall.
  fans:Object.freeze([['goldfish',1.14,.24,.022],['asagao',1.2,.08,.032],['hanabi',1.26,-.08,.042],['sakura-ad',1.32,-.24,.052]].map(([id,x,lean,off])=>plain({id,x,lean,off}))),
  // The giant one rests on two pegs, its face against the wall.
  giant:plain({id:'harii',name:'Giant uchiwa',x:1.8,y:1.78,r:.23,handle:.3,off:.015,pegs:Object.freeze([-140,-40])}),
  for:'Bathers cooling down after a 42-degree bath: on the tatami, in the massage chair, standing with a coffee milk.',
  why:'On the lobby wall at the tatami’s end, above the wainscot, between the noren and the travel poster: in reach from the tatami and from the way out, and flat to the wall, so it is in nobody’s path and nobody sits under it.',
  period:'A bamboo wall pocket for fans (うちわ差し) was in every 1980s house and shop; in summer the bathhouse filled it with free fans: prints of goldfish, morning glories and fireworks, and the shops’ giveaway fans with their names on.'}),

 plant:plain({id:'rubber-plant',name:'Rubber plant',jp:'ゴムの木',
  at:Object.freeze([-1.19,0,-.9]),on:'Umi-no-yu floor',pot:plain({r0:.1,r1:.13,h:.26}),saucer:plain({r:.15,h:.02}),stem:.95,spread:.2,
  for:'Mrs Higa, who has kept it alive for twelve years; and, one evening, Thuan.',
  why:'The changing room has no window to the street (it is the middle of the house), so the brightest place is beside the frosted bath door, where the light of the bath hall’s sea glass comes through. That puts it a step from the right-hand mirror’s dryer, out of the doorway and clear of the vanity and its mirrors.',
  period:'The rubber plant (インドゴムの木) in a glazed pot on a saucer was the houseplant of Shōwa homes, offices and bathhouses: it survives steam, neglect and the occasional hair dryer. The pot is Okinawan yachimun, green glaze from the Tsuboya kilns.'}),

 menVanity:plain({id:'men-vanity',name:'Men’s vanity',jp:'洗面台',
  // A mirror over a wall shelf on the men's side of the bandai wall, between the noren and the fan.
  wallZ:CHANGING_WALL,x:2.95,mirror:plain({w:.6,h:.75,y:1.42}),shelf:plain({w:.9,d:.2,y:1,t:.03}),
  tonic:plain({x:2.66,r:.03,h:.17,jp:'ヘアトニック',brand:'潮風',en:'Shiokaze hair tonic'}),
  sterilizer:plain({x:3.1,w:.2,h:.12,d:.1,jp:'くし消毒器',en:'Comb sterilizer'}),
  socket:plain({x:3.33,y:1.12,name:'Men’s vanity socket'}),
  for:'The men after the bath: a comb through the hair and a splash of tonic before they go back out to the lobby and the night game.',
  why:'On the men’s side of the bandai wall, beside the doorway and out of the walk from the noren to the baskets and the bath door: one mirror is enough for the men’s side (the women’s side has three, with the dryers). Its socket is a spur off the television’s through the wall, on the lobby circuit, like the fan’s, so the sterilizer never shares the dryers’ breaker.',
  period:'A Shōwa men’s changing room had a mirror, a big bottle of green hair tonic for anyone to use, and a small ultraviolet comb sterilizer (くし消毒器) with a blue window and the house combs standing in it. The tonic is an invented island brand, 潮風 (sea breeze).'}),

 accountBook:plain({id:'account-book',name:'Account book',jp:ONSEN_SIGNS.ledger.jp,
  at:Object.freeze([-3.98,FURNITURE_HEIGHTS.serviceCounter,2.62]),on:'Bandai top',yaw:-.08,w:.19,d:.28,
  for:'Mrs Higa, who does the day’s takings on the bandai every evening and never looks up from it.',
  why:'Open on the counter right in front of her stool, the top of the page away from her: within reach of her pencil and the ticket tray, under the andon’s light, and too low to come between her face and the people paying.',
  period:'A cloth-bound cash book (金銭出納帳) with columns for date, item, in, out and balance, written in pencil; a green-painted pencil sharpened with a knife.'}),
});

/** A small canvas texture, or null without a page (the room tests), when the plain colour stands in. */
function paint(w,h,draw){
 if(typeof document==='undefined'||!document.createElement)return null;
 const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext?.('2d');if(!ctx||!ctx.fillRect)return null;
 draw(ctx,w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return t;
}
const MINCHO='"Hiragino Mincho ProN","Yu Mincho","Noto Serif CJK JP",serif';
const GOTHIC='"Hiragino Maru Gothic ProN","M PLUS Rounded 1c","Yu Gothic","Noto Sans CJK JP",sans-serif';
const HAND='"Klee One","Hiragino Maru Gothic ProN","Yu Gothic","Noto Sans CJK JP",sans-serif';

/** The fans' faces in one 512 x 256 atlas: the giant Hārī fan on the left half, the four hand fans in the right half's quarters. */
const FAN_CELLS={harii:[0,0,.5,1],goldfish:[.5,.5,.25,.5],asagao:[.75,.5,.25,.5],hanabi:[.5,0,.25,.5],'sakura-ad':[.75,0,.25,.5]};
function fanAtlas(){
 const S=ONSEN_SIGNS.uchiwa,sign=id=>S.find(s=>s.id===id);
 return paint(512,256,(ctx)=>{
  const face=(x0,y0,size,bg,draw)=>{const cx=x0+size/2,cy=y0+size/2,r=size/2-2;ctx.save();ctx.fillStyle=bg;ctx.fillRect(x0,y0,size,size);ctx.translate(cx,cy);draw(r);
   // The bamboo ribs show through the paper, and the rim is bound with a paper strip.
   ctx.strokeStyle='rgba(120,90,40,.22)';ctx.lineWidth=1;for(let i=0;i<24;i++){const a=Math.PI*(.15+.7*i/23);ctx.beginPath();ctx.moveTo(0,r*.86);ctx.lineTo(-Math.cos(a)*r,r*.86-Math.sin(a)*r*1.86);ctx.stroke();}
   ctx.strokeStyle='rgba(60,40,20,.55)';ctx.lineWidth=Math.max(3,size*.03);ctx.beginPath();ctx.arc(0,0,r-ctx.lineWidth/2,0,Math.PI*2);ctx.stroke();ctx.restore();};
  const text=(t,x,y,px,color,font=MINCHO)=>{ctx.fillStyle=color;ctx.font=`bold ${px}px ${font}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(t,x,y);};
  // Giant: red, a white sun, a dragon boat on the waves, ハーリー, and the sponsor's line.
  face(0,0,256,'#c8382e',r=>{ctx.fillStyle='#f6efe0';ctx.beginPath();ctx.arc(0,-r*.32,r*.36,0,Math.PI*2);ctx.fill();
   ctx.fillStyle='#1f3558';ctx.beginPath();ctx.moveTo(-r*.62,r*.1);ctx.quadraticCurveTo(0,r*.32,r*.62,r*.1);ctx.lineTo(r*.5,r*.02);ctx.lineTo(-r*.5,r*.02);ctx.closePath();ctx.fill();
   ctx.fillStyle='#f2c14e';ctx.beginPath();ctx.moveTo(r*.5,r*.02);ctx.lineTo(r*.72,-r*.16);ctx.lineTo(r*.62,r*.1);ctx.closePath();ctx.fill();
   for(let i=0;i<5;i++){ctx.fillStyle='#f6efe0';ctx.beginPath();ctx.arc(-r*.36+i*r*.17,-r*.02,r*.045,0,Math.PI*2);ctx.fill();}
   ctx.strokeStyle='#f6efe0';ctx.lineWidth=4;for(const y of [.24,.36]){ctx.beginPath();for(let x=-.7;x<=.7;x+=.05)ctx.lineTo(x*r,(y+Math.sin(x*14)*.025)*r);ctx.stroke();}
   const g=sign('harii');text(g.jp,0,-r*.32,r*.2,'#c8382e');text(g.sub,0,r*.58,r*.13,'#f6efe0',GOTHIC);});
  // Goldfish: two red fish and bubbles in pale water.
  face(256,0,128,'#cfe8ee',r=>{for(const [x,y,s,flip] of [[-.25,-.15,1,1],[.22,.22,.8,-1]]){ctx.save();ctx.translate(x*r,y*r);ctx.scale(flip*s,s);ctx.fillStyle='#e0452c';ctx.beginPath();ctx.ellipse(0,0,r*.24,r*.14,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.moveTo(r*.18,0);ctx.lineTo(r*.42,-r*.16);ctx.lineTo(r*.38,r*.16);ctx.closePath();ctx.fill();ctx.fillStyle='#1d1d1d';ctx.beginPath();ctx.arc(-r*.13,-r*.03,r*.025,0,Math.PI*2);ctx.fill();ctx.restore();}
   ctx.strokeStyle='#8ab6c4';ctx.lineWidth=2;for(const [x,y,s] of [[-.5,-.5,.05],[-.42,-.62,.035],[.4,-.4,.04]]){ctx.beginPath();ctx.arc(x*r,y*r,s*r,0,Math.PI*2);ctx.stroke();}});
  // Morning glories: indigo and violet trumpets with pale throats, heart leaves.
  face(384,0,128,'#f6f1e4',r=>{ctx.fillStyle='#5f8a4a';for(const [x,y] of [[.35,.3],[-.4,.35],[.05,-.5]]){ctx.beginPath();ctx.ellipse(x*r,y*r,r*.16,r*.11,.6,0,Math.PI*2);ctx.fill();}
   for(const [x,y,c] of [[-.22,-.12,'#3b4fa8'],[.25,-.05,'#7a4aa8'],[-.02,.32,'#3b4fa8']]){ctx.fillStyle=c;ctx.beginPath();ctx.arc(x*r,y*r,r*.24,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f6f1e4';ctx.beginPath();ctx.arc(x*r,y*r,r*.08,0,Math.PI*2);ctx.fill();}});
  // Fireworks: three bursts over a dark harbour.
  face(256,128,128,'#1c2747',r=>{for(const [x,y,s,c] of [[-.25,-.25,.32,'#f2c14e'],[.3,-.05,.26,'#ee6a8a'],[-.05,.35,.22,'#9fe0e8']]){ctx.strokeStyle=c;ctx.lineWidth=2.5;for(let i=0;i<14;i++){const a=i/14*Math.PI*2;ctx.beginPath();ctx.moveTo((x+Math.cos(a)*s*.25)*r,(y+Math.sin(a)*s*.25)*r);ctx.lineTo((x+Math.cos(a)*s)*r,(y+Math.sin(a)*s)*r);ctx.stroke();}}});
  // Sakura Shōten's giveaway: cream, a red band, the shop's name and what it sells.
  face(384,128,128,'#f5ecd6',r=>{const g=sign('sakura-ad');ctx.fillStyle='#c8382e';ctx.fillRect(-r,-r*.34,r*2,r*.62);ctx.fillStyle='#f5ecd6';ctx.beginPath();ctx.arc(0,-r*.62,r*.16,0,Math.PI*2);ctx.fill();
   text(g.jp,0,-r*.03,r*.3,'#f5ecd6');text(g.sub,0,r*.5,r*.17,'#7a2a22',GOTHIC);});
 });
}

/** A fan's head: a disc of radius r with its bottom flattened where the handle joins, lying in the xy plane, its bottom edge at y 0. */
function fanHead(r,cell){
 const g=new THREE.CircleGeometry(r,18),p=g.attributes.position,uv=g.attributes.uv,flat=-.86*r;
 for(let i=0;i<p.count;i++){if(p.getY(i)<flat)p.setY(i,flat);p.setY(i,p.getY(i)-flat);}
 const [u0,v0,su,sv]=cell;for(let i=0;i<uv.count;i++)uv.setXY(i,u0+uv.getX(i)*su,v0+uv.getY(i)*sv);
 g.computeBoundingBox();return g;
}

/** Striped straws: one 128 x 128 canvas, a stripe colour per quarter (the straw's UVs pick its quarter). */
const STRIPES=['red','green','blue','plain'],STRIPE_HEX={red:'#d2382e',green:'#3f9a5a',blue:'#2f6fd0',plain:'#ffffff'};
function strawTexture(){
 const t=paint(128,128,(ctx)=>{ctx.fillStyle='#fbfaf4';ctx.fillRect(0,0,128,128);
  STRIPES.forEach((s,i)=>{ctx.fillStyle=STRIPE_HEX[s];for(let y=-32;y<128;y+=16){ctx.beginPath();ctx.moveTo(i*32,y);ctx.lineTo(i*32+32,y+12);ctx.lineTo(i*32+32,y+19);ctx.lineTo(i*32,y+7);ctx.closePath();ctx.fill();}});
  });
 if(t)t.wrapS=t.wrapT=THREE.RepeatWrapping;return t;
}

/** The cash-book spread: two ruled pages, each with the five columns; the top of the page at the texture's top. */
const LEDGER_COLUMNS=[[0,.12],[.12,.55],[.55,.7],[.7,.85],[.85,1]];
function ledgerTexture(){
 const L=ONSEN_SIGNS.ledger;
 return paint(768,512,(ctx,w,h)=>{
  ctx.fillStyle='#f4eedd';ctx.fillRect(0,0,w,h);ctx.fillStyle='rgba(120,100,70,.2)';ctx.fillRect(w/2-8,0,16,h);
  const pw=w/2-40,cols=x0=>LEDGER_COLUMNS.map(([a,b])=>[x0+pw*a,x0+pw*b]);
  for(const x0 of [20,w/2+20]){
   ctx.strokeStyle='#8fa9c9';ctx.lineWidth=1.5;for(let y=104;y<h-20;y+=32){ctx.beginPath();ctx.moveTo(x0,y);ctx.lineTo(x0+pw,y);ctx.stroke();}
   ctx.strokeStyle='#d0675a';ctx.lineWidth=2;for(const [a] of cols(x0).slice(1)){ctx.beginPath();ctx.moveTo(a,64);ctx.lineTo(a,h-20);ctx.stroke();}
   ctx.beginPath();ctx.moveTo(x0,64);ctx.lineTo(x0+pw,64);ctx.moveTo(x0,100);ctx.lineTo(x0+pw,100);ctx.stroke();
   ctx.fillStyle='#b5463a';ctx.font=`bold 17px ${MINCHO}`;ctx.textAlign='center';ctx.textBaseline='middle';
   cols(x0).forEach(([a,b],i)=>ctx.fillText(L.columns[i],(a+b)/2,82));}
  ctx.fillStyle='#2b2520';ctx.font=`bold 30px ${MINCHO}`;ctx.textAlign='left';ctx.textBaseline='middle';ctx.fillText(L.jp,24,32);
  // Today's takings in pencil: baths, towels and milk in; the soap from Sakura Shōten out. The right-hand page is tomorrow's.
  ctx.fillStyle='#4a4a4e';
  L.rows.forEach((r,i)=>{const y=120+i*32;cols(20).forEach(([a,b],k)=>{if(!r[k])return;ctx.font=`${k===1?18:15}px ${HAND}`;ctx.textAlign=k===1?'left':'right';ctx.fillText(r[k],k===1?a+6:b-4,y);});});
 });
}

/**
 * Builds the props into the room. `rect` adds a collider (only for what really blocks a walker), `anchor` a prompt.
 * Returns the group and, by id, the parts the film and the room switch.
 */
export function buildOnsenProps({room,rect,anchor=null,action=()=>{}}){
 const group=new THREE.Group();group.name='Umi-no-yu props';room.add(group);
 const add=(geometry,material,x,y,z,name,parent=group)=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.name=name;m.castShadow=m.receiveShadow=true;m.userData.staticProp=true;parent.add(m);return m;};
 const node=(name,x,y,z,parent=group)=>{const g=new THREE.Group();g.name=name;g.position.set(x,y,z);parent.add(g);return g;};
 const std=(color,roughness=.7,extra={})=>new THREE.MeshStandardMaterial({color,roughness,...extra});
 const bamboo=std(0xc2a466,.75),darkBamboo=std(0x7a5a32,.8),wood=std(0x8a6340,.7);

 // ---- The straw jar on the milk cooler's lid.
 const J=ONSEN_PROPS.strawJar,jar=node(J.name,...J.at);jar.userData.prop=J.id;
 const glass=std(0xd9eef0,.08,{transparent:true,opacity:.32,depthWrite:false,side:THREE.DoubleSide});
 const jarGlass=add(new THREE.CylinderGeometry(J.r*.9,J.r,J.h,16,1,true),glass,0,J.h/2,0,'Straw jar glass',jar);jarGlass.renderOrder=2;jarGlass.castShadow=false;
 const base=add(new THREE.CylinderGeometry(J.r*.99,J.r*.99,.006,16),std(0xc9e2e4,.1,{transparent:true,opacity:.6}),0,.003,0,'Straw jar base',jar);base.userData.restsOn=J.on;
 add(new THREE.TorusGeometry(J.r*.9,.003,4,16).rotateX(Math.PI/2),glass,0,J.h,0,'Straw jar rim',jar).castShadow=false;
 const strawTex=strawTexture(),strawMat=strawTex?new THREE.MeshStandardMaterial({map:strawTex,roughness:.45}):std(0xfbfaf4,.45);
 // Each straw leans out from near the middle of the jar's floor, so it stays inside the glass up to the rim.
 const straw=(s,i)=>{const a=i*2.39996+(s.kind==='fat'?1:s.kind==='thinner'?2:0),lean=.14+.16*((i*37)%5)/4,foot=.012+.01*((i*53)%7)/6;
  const g=new THREE.CylinderGeometry(s.r,s.r,s.len,8,1,true),uv=g.attributes.uv,q=STRIPES.indexOf(s.stripe);
  for(let k=0;k<uv.count;k++)uv.setXY(k,(q+uv.getX(k))/4,uv.getY(k)*s.len*4);
  g.translate(0,s.len/2,0).rotateX(lean).rotateY(a).translate(-Math.sin(a)*foot,.006,-Math.cos(a)*foot);return g;};
 const taken=node(J.takes.group,0,0,0,jar),rest=[];let k=0;
 for(const s of J.straws)for(let i=0;i<s.count;i++,k++){const g=straw(s,k);
  if(i<J.takes[s.kind]){const m=add(g,strawMat,0,0,0,`Straw ${s.kind} ${i+1}`,taken);m.userData.straw=s.kind;m.castShadow=false;}else rest.push(g);}
 const restMesh=add(mergeGeometries(rest,false),strawMat,0,0,0,'Straw jar straws',jar);restMesh.castShadow=false;rest.forEach(g=>g.dispose());

 // ---- The uchiwa rack on the lobby wall, by the tatami.
 const U=ONSEN_PROPS.uchiwaRack,P=U.pocket,rack=node(U.name,P.x,P.y,P.wallZ);rack.userData.prop=U.id;
 {const t=.01,parts=[
   new THREE.BoxGeometry(P.w,P.h+.06,t).translate(0,(P.h+.06)/2,t/2),                       // back board, a little taller, nailed to the wall
   new THREE.BoxGeometry(P.w,P.h,t).translate(0,P.h/2,P.d-t/2),                              // front
   new THREE.BoxGeometry(t,P.h,P.d-2*t).translate(-P.w/2+t/2,P.h/2,P.d/2),new THREE.BoxGeometry(t,P.h,P.d-2*t).translate(P.w/2-t/2,P.h/2,P.d/2),
   new THREE.BoxGeometry(P.w-2*t,t,P.d-2*t).translate(0,t/2,P.d/2)];                         // floor
  const pocket=add(mergeGeometries(parts,false),bamboo,0,0,0,'Uchiwa rack pocket',rack);pocket.userData.hangsOn='Umi-no-yu wall';parts.forEach(g=>g.dispose());
  // Two dark cane bindings across the front, the way a woven pocket is finished.
  const bands=[.03,P.h-.03].map(y=>new THREE.BoxGeometry(P.w+.004,.012,.004).translate(0,y,P.d+.002));
  add(mergeGeometries(bands,false),darkBamboo,0,0,0,'Uchiwa rack binding',rack).castShadow=false;bands.forEach(g=>g.dispose());}
 const atlas=fanAtlas(),paper=atlas?new THREE.MeshStandardMaterial({map:atlas,roughness:.85,side:THREE.DoubleSide}):std(0xf2e6c8,.85,{side:THREE.DoubleSide});
 // The four hand fans stand in the pocket, their handles on its floor, leaning apart so every face shows.
 const F=U.fan,heads=[],handles=[];
 for(const f of U.fans){const m=new THREE.Matrix4().makeRotationZ(f.lean).setPosition(f.x-P.x,.01+.009*Math.sin(Math.abs(f.lean)),f.off); // the leaning handle stands on its corner
  heads.push(fanHead(F.r,FAN_CELLS[f.id]).translate(0,F.handle,0).applyMatrix4(m));
  handles.push(new THREE.BoxGeometry(.018,F.handle+.03,.008).translate(0,(F.handle+.03)/2,0).applyMatrix4(m));}
 const fans=add(mergeGeometries(heads,false),paper,0,0,0,'Uchiwa',rack);fans.castShadow=false;fans.userData.fans=U.fans.map(f=>f.id);
 add(mergeGeometries(handles,false),bamboo,0,0,0,'Uchiwa handles',rack);heads.concat(handles).forEach(g=>g.dispose());
 // The giant Hārī fan, resting on two pegs with its face to the room: a group of its own, so the film can take it down.
 const G=U.giant,giant=node(G.name,G.x,G.y,P.wallZ+G.off);giant.userData.prop=G.id;
 const giantHead=fanHead(G.r,FAN_CELLS.harii).translate(0,-.86*G.r,0);
 add(giantHead,paper,0,0,0,'Giant uchiwa face',giant).castShadow=false;
 add(new THREE.BoxGeometry(.03,G.handle+.06,.012).translate(0,-.86*G.r-(G.handle-.06)/2,0),bamboo,0,0,0,'Giant uchiwa handle',giant);
 const pegs=G.pegs.map(deg=>{const a=deg*Math.PI/180;return new THREE.CylinderGeometry(.008,.008,.05,8).rotateX(Math.PI/2).translate(G.x+Math.cos(a)*G.r,G.y+Math.sin(a)*G.r-.0085,P.wallZ+.025);});
 const pegMesh=add(mergeGeometries(pegs,false),wood,0,0,0,'Uchiwa pegs');pegMesh.userData.hangsOn='Umi-no-yu wall';pegs.forEach(g=>g.dispose());
 if(anchor)anchor([P.x+.3,1.35,P.wallZ+.4],'Take an uchiwa',()=>action('inspect','Uchiwa',
  'You take the goldfish one and fan yourself. After forty-two degrees it is the best wind in the world. The giant Hārī fan on the pegs is for show, Higa-san says without looking up, and for emergencies.'));

 // ---- Mrs Higa's rubber plant, by the frosted bath door.
 const Pl=ONSEN_PROPS.plant,plant=node(Pl.name,...Pl.at);plant.userData.prop=Pl.id;
 const glaze=std(0x35568c,.25),soil=std(0x3a2a1e,.95),leaf=std(0x2c5233,.3),stem=std(0x5e5a3a,.8);
 const S=Pl.saucer,Pt=Pl.pot;
 const saucer=add(new THREE.CylinderGeometry(S.r,S.r*.9,S.h,14),glaze,0,S.h/2,0,'Rubber plant saucer',plant);saucer.userData.restsOn=Pl.on;
 const potShape=[[0,0],[Pt.r0,0],[Pt.r0+.006,.02],[Pt.r1-.012,Pt.h-.035],[Pt.r1,Pt.h-.02],[Pt.r1,Pt.h],[Pt.r1-.012,Pt.h],[Pt.r1-.014,Pt.h-.03]].map(([x,y])=>new THREE.Vector2(x,y));
 const pot=add(new THREE.LatheGeometry(potShape,14),glaze,0,S.h,0,'Rubber plant pot',plant);pot.userData.restsOn='Rubber plant saucer';
 add(new THREE.CircleGeometry(Pt.r1-.014,14).rotateX(-Math.PI/2),soil,0,S.h+Pt.h-.025,0,'Rubber plant soil',plant).castShadow=false;
 const top=Pl.stem,lean=.04;
 add(new THREE.CylinderGeometry(.012,.017,top-S.h-Pt.h+.06,6).translate(0,(top-S.h-Pt.h+.06)/2,0).rotateZ(-lean),stem,0,S.h+Pt.h-.04,0,'Rubber plant stem',plant);
 // Big oval leaves up the stem, each on its own side (the golden angle), the lower ones flatter; turned so none reaches the wall.
 const leaves=[],stemAt=y=>new THREE.Vector3(Math.sin(lean)*(y-(S.h+Pt.h-.04)),y,0);
 for(let i=0;i<12;i++){const y=S.h+Pt.h+.16+i*(top-S.h-Pt.h-.2)/11,a=i*2.39996+.6,len=.08+.008*Math.sin(i*1.7)-.002*Math.max(0,i-8),pitch=-.12+i*.06,p=stemAt(y);
  leaves.push(new THREE.SphereGeometry(1,8,4).scale(len*.62,.008,len).translate(0,0,len*.85).rotateX(-pitch).rotateY(a).translate(p.x,p.y,p.z));}
 add(mergeGeometries(leaves,false),leaf,0,0,0,'Rubber plant leaves',plant);leaves.forEach(g=>g.dispose());
 // The new leaf comes out of a pink sheath at the tip, as a rubber plant's does.
 {const p=stemAt(top);add(new THREE.ConeGeometry(.012,.07,6),std(0xc0566a,.5),p.x,p.y+.03,p.z,'Rubber plant sheath',plant);}
 rect(Pl.at[0],Pl.at[2],2*S.r+.04,2*S.r+.04,top);
 if(anchor)anchor([Pl.at[0],1.1,Pl.at[2]],'Look at the rubber plant',()=>action('inspect','Rubber plant',
  'Higa-san’s rubber plant, twelve years old, in a green Tsuboya pot. It stands by the bath door for the light through the frosted glass. A card in the soil says, in her handwriting: please do not dry me.'));

 // ---- Mrs Higa's account book, open on the bandai, the pencil on the right-hand page.
 const A=ONSEN_PROPS.accountBook,book=node(A.name,...A.at);book.rotation.y=A.yaw;book.userData.prop=A.id;
 // Spine along x (away from her), pages either side in z; u runs left to right for a reader facing +x (+z is her right).
 const cover=add(new THREE.BoxGeometry(A.w+.012,.006,A.d+.014),std(0x2b3346,.8),0,.003,0,'Account book cover',book);cover.userData.restsOn=A.on;
 const pages=add(new THREE.BoxGeometry(A.w,.008,A.d),std(0xf1ead6,.9),0,.006+.004,0,'Account book pages',book);pages.userData.restsOn='Account book cover';
 const sheet=ledgerTexture(),spread=add(new THREE.PlaneGeometry(A.d-.004,A.w-.004).rotateX(-Math.PI/2).rotateY(-Math.PI/2),sheet?new THREE.MeshStandardMaterial({map:sheet,roughness:.9}):std(0xf4eedd,.9),0,.0145,0,'Account book spread',book);
 spread.castShadow=false;spread.userData.restsOn='Account book pages';
 const pr=.0038,pencil=node('Account book pencil',.01,.0145+pr,A.d*.28,book);pencil.rotation.y=.5;
 const body=add(new THREE.CylinderGeometry(pr,pr,.15,6).rotateZ(Math.PI/2),std(0x2f6a45,.5),0,0,0,'Account book pencil body',pencil);body.userData.restsOn='Account book spread';
 add(new THREE.ConeGeometry(pr,.02,6).rotateZ(-Math.PI/2),std(0xd9b78a,.7),.085,0,0,'Account book pencil tip',pencil);

 // ---- The men's vanity: mirror, shelf, tonic, comb sterilizer and its socket.
 const V=ONSEN_PROPS.menVanity,vanity=node(V.name,0,0,0);vanity.userData.prop=V.id;
 {const M=V.mirror,S=V.shelf,top=S.y,shelfZ=V.wallZ-S.d/2;
  const mir=add(new THREE.BoxGeometry(M.w,M.h,.02),std(0xcfd8da,.05,{metalness:.9}),V.x,M.y,V.wallZ-.01,'Men’s mirror',vanity);mir.userData.hangsOn='Umi-no-yu wall';
  add(new THREE.BoxGeometry(M.w+.04,M.h+.04,.012),wood,V.x,M.y,V.wallZ-.006,'Men’s mirror frame',vanity).userData.hangsOn='Umi-no-yu wall';
  const shelf=add(new THREE.BoxGeometry(S.w,S.t,S.d),wood,V.x,top-S.t/2,shelfZ,'Men’s vanity shelf',vanity);shelf.userData.hangsOn='Umi-no-yu wall';
  rect(V.x,shelfZ,S.w,S.d,top);// a hanging shelf at hip height: nobody walks through it
  for(const dx of [-.35,.35])add(new THREE.BoxGeometry(.03,.14,S.d-.02),wood,V.x+dx,top-S.t-.07,shelfZ+.01,'Men’s vanity bracket',vanity).userData.hangsOn='Umi-no-yu wall';
  // The tonic: a tall green bottle with a red cap and a paper label facing the room.
  const T=V.tonic,bottle=add(new THREE.CylinderGeometry(T.r*.9,T.r,T.h,14),std(0x3f8f5a,.15,{transparent:true,opacity:.85}),T.x,top+T.h/2,shelfZ,'Hair tonic bottle',vanity);bottle.userData.restsOn='Men’s vanity shelf';
  add(new THREE.CylinderGeometry(.016,.016,.03,10),std(0xb8342e,.5),T.x,top+T.h+.015,shelfZ,'Hair tonic cap',vanity).userData.restsOn='Hair tonic bottle';
  const tonicTex=paint(128,160,(ctx,w,h)=>{ctx.fillStyle='#f4efdf';ctx.fillRect(0,0,w,h);ctx.fillStyle='#2f6a45';ctx.fillRect(0,0,w,22);ctx.fillRect(0,h-16,w,16);ctx.fillStyle='#1f3558';ctx.textAlign='center';ctx.textBaseline='middle';
   ctx.font=`bold 40px ${MINCHO}`;ctx.fillText(T.brand,w/2,62);ctx.font=`bold 17px ${GOTHIC}`;ctx.fillText(T.jp,w/2,112);});
  const label=add(new THREE.PlaneGeometry(.042,.055),tonicTex?new THREE.MeshStandardMaterial({map:tonicTex,roughness:.8}):std(0xf4efdf,.8),T.x,top+T.h*.45,shelfZ-T.r*.96-.002,'Hair tonic label',vanity);label.rotation.y=Math.PI;label.castShadow=false;
  // The comb sterilizer: a cream box with a blue ultraviolet window, the combs standing in the light.
  const C=V.sterilizer,cz=shelfZ+.02;
  add(new THREE.BoxGeometry(C.w,C.h,C.d),std(0xe8e0cc,.5),C.x,top+C.h/2,cz,'Comb sterilizer',vanity).userData.restsOn='Men’s vanity shelf';
  const uv=paint(128,64,(ctx,w,h)=>{ctx.fillStyle='#9fdcff';ctx.fillRect(0,0,w,h);ctx.fillStyle='#2b3a52';for(let i=0;i<4;i++){const x=18+i*28;ctx.fillRect(x,14,20,6);for(let t=0;t<6;t++)ctx.fillRect(x+1+t*3.2,20,1.6,26);}});
  const lamp=add(new THREE.PlaneGeometry(C.w*.7,C.h*.5),new THREE.MeshStandardMaterial(uv?{map:uv,emissiveMap:uv,emissive:0x9fdcff,emissiveIntensity:1.1,roughness:.3}:{color:0x9fdcff,emissive:0x9fdcff,emissiveIntensity:1.1,roughness:.3}),C.x,top+C.h*.55,cz-C.d/2-.001,'Comb sterilizer lamp',vanity);lamp.rotation.y=Math.PI;lamp.castShadow=false;
  const tag=paint(128,32,(ctx,w,h)=>{ctx.fillStyle='#e8e0cc';ctx.fillRect(0,0,w,h);ctx.fillStyle='#3a3f3c';ctx.font=`bold 18px ${GOTHIC}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(C.jp,w/2,h/2);});
  const tg=add(new THREE.PlaneGeometry(C.w*.7,C.h*.17),tag?new THREE.MeshStandardMaterial({map:tag,roughness:.6}):std(0xe8e0cc,.6),C.x,top+C.h*.12,cz-C.d/2-.001,'Comb sterilizer tag',vanity);tg.rotation.y=Math.PI;tg.castShadow=false;
  // Its socket on the wall above the shelf's end, and the cord down the side of the box.
  const K=V.socket,sock=node(K.name,K.x,K.y,V.wallZ,vanity);sock.rotation.y=Math.PI;
  add(new THREE.BoxGeometry(.07,.11,.012),std(0xeeece4,.45),0,0,.006,K.name+' plate',sock);add(new THREE.BoxGeometry(.035,.04,.022),std(0xc9cbc4,.5),0,-.02,.023,K.name+' plug',sock);
  const pts=[[C.x+C.w/2,top+.03,cz],[C.x+C.w/2+.06,top+.02,cz+.03],[K.x-.004,top+.03,V.wallZ-.025],[K.x,top+.07,V.wallZ-.023],[K.x,K.y-.04,V.wallZ-.023]].map(p=>new THREE.Vector3(...p));
  const cord=add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),10,.0035,5),std(0xf2f0ea,.6),0,0,0,'Comb sterilizer cord',vanity);cord.castShadow=false;
  if(anchor)anchor([V.x,1.35,V.wallZ-.45],'Look in the men’s mirror',()=>action('inspect','The men’s mirror',
   'One mirror, a bottle of 潮風 hair tonic for anyone who wants it, and the comb sterilizer humming blue with the house combs standing in its light. You comb your hair. It is the best it has looked all week.'));}

 return {group,jar,taken,rack,giant,plant,book,vanity};
}
