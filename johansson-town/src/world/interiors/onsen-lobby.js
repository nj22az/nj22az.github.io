import {FURNITURE_HEIGHTS} from '../furniture-standards.js';
import * as THREE from '../../../vendor/three.module.js';
import {ONSEN_SIGNS} from './onsen-signs.js';

/**
 * The front of Umi-no-yu: genkan, getabako, bandai, the lobby and the noren into the
 * changing room. onsen.js builds the shell and the baths; this dresses the part you
 * see first, the way a 1990s bathhouse lobby looks:
 *
 * - hinoki boards underfoot and a pebbled 洗い出し genkan, wooden wainscot to waist
 *   height, a board ceiling, and shoji windows either side of the street door that
 *   glow with the daylight;
 * - a proper getabako with wooden 木札 locks, numbered;
 * - on the bandai: an andon, a brass desk bell (ring it) and a push-button phone (Mrs Higa's
 *   account book is in onsen-props.js);
 * - a raised tatami 小上がり with a chabudai, a kyūsu and cups (sit and pour), zabuton,
 *   and a small CRT on its stand that changes channel when you ask it to;
 * - the old red milk cooler, lit inside, with white, coffee and fruit milk in glass;
 * - two noren into the changing rooms, crimson 女 (women, west) and indigo 男 (men, east), swaying a little;
 * - the 本日の湯 board, which names the day's bath additive by weekday, and a poster.
 *
 * What the signs say, in Japanese, is in onsen-signs.js.
 * Every canvas print has a plain-colour fallback so the room still builds without a
 * page (the room tests run in Node). Room frame as in onsen.js: street door at +z.
 */
/** The noren's cloth: its top under the rod, its drop, and the slit between its two panels. */
const NOREN=Object.freeze({top:2.25,h:.8,slit:.004});// the panels hang edge to edge: the slit opens when somebody parts it
/**
 * The two doorways from the lobby into the changing rooms, either side of a short wall (onsen.js): every town bath of the
 * period was a 男湯 and a 女湯. The women's side is west, by the bandai (their lockers, the three mirrors and dryers, Mrs
 * Higa's rubber plant); the men's side east, on the massage chair's side (the bench, the baskets, the fan, a mirror).
 * `x0`..`x1` is each opening at the lobby wall (z = hall.front); `changeAt` is where a bather of that side goes to
 * change before the bath, so a resident walks in through their own noren and out the same way (indoor-residents.js).
 */
export const ONSEN_DOORWAYS=Object.freeze({// what each side is called in Japanese: ONSEN_SIGNS[sign].bath
 women:Object.freeze({side:'women',sign:'norenWomen',silhouette:'feminine',x0:-.9,x1:-.05,changeAt:Object.freeze([-3.8,0,.2])}),
 men:Object.freeze({side:'men',sign:'norenMen',silhouette:'masculine',x0:.05,x1:.9,changeAt:Object.freeze([4,0,-.5])}),
});
/** Which side of the bath a person changes on: their own body's silhouette (cast.js recipes); anyone else uses the men's side. */
export const onsenSide=recipe=>recipe?.body?.silhouette==='feminine'?'women':'men';
export const LOBBY=Object.freeze({
 koagari:Object.freeze({x:2.45,z:2.45,w:2.4,d:1.4,h:.3}),
 tv:Object.freeze({x:3.3,z:1.95}),
});
/** The day's bath, by weekday (0 = Sunday): its name, and what is in the cotton bag. The board writes it in Japanese (ONSEN_SIGNS.dailyBath). */
export const DAILY_BATH=Object.freeze([
 ["Gettō-yu",'Shell-ginger leaves'],["Yuzu-yu",'Yuzu'],["Fūchibā-yu",'Mugwort (fūchibā, as Okinawa calls it)'],["Hinoki-yu",'Hinoki chips'],
 ["Shio-yu",'Sea salt from the harbour'],["Shōga-yu",'Ginger'],["Shīkwāsā-yu",'Shikwasa'],
]);

/**
 * The lobby television's channels: what is on, and what you notice. The film can pin one
 * (pinLobbyChannel) so a shot always shows the night game; a pin outlasts leaving the
 * room, like the breaker board's levers.
 */
export const LOBBY_CHANNELS=Object.freeze([
 Object.freeze({id:'night-game',en:'The night game, Okinawa v Kagoshima',note:'The radio commentary is a beat ahead of the picture.',
  why:'Mrs Higa keeps the lobby set on the night game in the season: people cooling down on the tatami ask for the score.'}),
 Object.freeze({id:'weather',en:'Island weather',note:'A typhoon is sitting a long way south. Not yet.',why:'Fishermen and ferry crews check tomorrow before they go home.'}),
 Object.freeze({id:'jidaigeki',en:'Historical drama',note:'Somebody in a topknot is about to be very sorry.',why:'The eight o’clock samurai drama, for the grandparents.'}),
 Object.freeze({id:'snow',en:'Snow',note:'Snow. Higa-san reaches over and thumps the set, and it does not help.',why:'Between stations the rabbit ears find nothing.'}),
]);
let pinnedChannel=null;
const channelIndex=id=>{const i=LOBBY_CHANNELS.findIndex(c=>c.id===id);if(i<0)throw new Error('No such channel on the lobby television: '+id);return i;};
/** Pin the lobby television to a channel (by id), or unpin it with null. */
export function pinLobbyChannel(id){pinnedChannel=id==null?null:LOBBY_CHANNELS[channelIndex(id)].id;return pinnedChannel;}
/** The pinned channel's id, or null when the set is free to change. */
export const lobbyChannelPin=()=>pinnedChannel;

const MINCHO='"Hiragino Mincho ProN","Yu Mincho","Noto Serif CJK JP",serif';
const GOTHIC='"Hiragino Maru Gothic ProN","M PLUS Rounded 1c","Yu Gothic","Noto Sans CJK JP",sans-serif';
const hash=(i,s=0)=>{const n=Math.sin(i*127.1+s*311.7)*43758.5453;return n-Math.floor(n);};

/** A canvas texture, or null where there is no page to draw it on. */
function paint(w,h,draw,{repeat=null}={}){
 if(typeof document==='undefined'||!document.createElement)return null;
 const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext?.('2d');if(!ctx||!ctx.fillRect)return null;
 draw(ctx,w,h);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;
 if(repeat){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(...repeat);}
 t.userData.canvas=c;return t;
}
const textured=(tex,color,extra={})=>new THREE.MeshStandardMaterial(tex?{map:tex,roughness:.7,...extra}:{color,roughness:.7,...extra});

export function hinokiTexture(repeat){
 return paint(256,256,(ctx,w,h)=>{
  ctx.fillStyle='#c9a06a';ctx.fillRect(0,0,w,h);
  for(let i=0;i<500;i++){ctx.fillStyle=hash(i,1)>.5?'rgba(120,80,40,.10)':'rgba(240,210,160,.10)';ctx.fillRect(0,hash(i,2)*h,w,1+hash(i,3)*2);}
  ctx.strokeStyle='rgba(70,40,18,.45)';ctx.lineWidth=2;for(let y=0;y<=h;y+=32){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  for(let r=0;r<8;r++){const x=hash(r,9)*w;ctx.beginPath();ctx.moveTo(x,r*32);ctx.lineTo(x,r*32+32);ctx.stroke();}
 },{repeat});
}

export function buildOnsenLobby({room,R,box,cyl,rect,mat,anchor,seat,action,seats}){
 const group=new THREE.Group();group.name='Umi-no-yu lobby';room.add(group);
 const add=(geometry,material,x,y,z,name='Umi-no-yu lobby')=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.name=name;m.castShadow=m.receiveShadow=true;group.add(m);return m;};
 const darkWood=textured(paint(128,128,(ctx,w,h)=>{ctx.fillStyle='#4a2f1c';ctx.fillRect(0,0,w,h);for(let i=0;i<200;i++){ctx.fillStyle=hash(i,4)>.5?'rgba(20,10,5,.18)':'rgba(120,80,50,.14)';ctx.fillRect(0,hash(i,5)*h,w,1+hash(i,6)*2);}}),0x4a2f1c,{roughness:.5});
 const brass=new THREE.MeshStandardMaterial({color:0xd8b25e,roughness:.28,metalness:.85});

 // ---- Surfaces: wainscot on the lobby walls, a pebbled genkan, a board ceiling.
 const wainscot=textured(paint(256,128,(ctx,w,h)=>{ctx.fillStyle='#8a6340';ctx.fillRect(0,0,w,h);ctx.strokeStyle='rgba(40,22,10,.55)';ctx.lineWidth=3;for(let x=0;x<=w;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}for(let i=0;i<160;i++){ctx.fillStyle='rgba(30,15,5,.08)';ctx.fillRect(hash(i,7)*w,0,1,h);}},{repeat:[6,1]}),0x8a6340);
 const panel=(len,x,z,yaw)=>{const p=add(new THREE.BoxGeometry(len,.9,.03),wainscot,x,.45,z,'Lobby wainscot');p.rotation.y=yaw;add(new THREE.BoxGeometry(len,.05,.05),darkWood,x,.92,z,'Wainscot rail').rotation.y=yaw;};
 // Front wall (inside face z 4.94) either side of the door; the lobby side of the changing-room wall.
 panel(3.9,-2.95,4.92,0);panel(3.9,2.95,4.92,0);
 panel(3.95,-2.95,R.hall.front+.12,0);panel(3.95,2.95,R.hall.front+.12,0);
 for(const x of [-4.92,4.92])panel(3.3,x,3.25,Math.PI/2);
 const pebbles=paint(256,256,(ctx,w,h)=>{ctx.fillStyle='#8f8a80';ctx.fillRect(0,0,w,h);for(let i=0;i<1400;i++){const c=110+Math.floor(hash(i,8)*90);ctx.fillStyle=`rgb(${c},${c-4},${c-10})`;ctx.beginPath();ctx.ellipse(hash(i,1)*w,hash(i,2)*h,2+hash(i,3)*4,2+hash(i,4)*3,hash(i,5)*3,0,Math.PI*2);ctx.fill();}},{repeat:[5,1]});
 if(pebbles){const g=add(new THREE.PlaneGeometry(10,1.36),new THREE.MeshStandardMaterial({map:pebbles,roughness:.95,polygonOffset:true,polygonOffsetFactor:-2}),0,.003,4.3,'Genkan arai-dashi');g.rotation.x=-Math.PI/2;g.castShadow=false;}

 // ---- Shoji windows either side of the street door, lit by the day outside.
 const shojiTex=paint(256,256,(ctx,w,h)=>{ctx.fillStyle='#f6f0e2';ctx.fillRect(0,0,w,h);ctx.fillStyle='rgba(170,150,120,.15)';for(let i=0;i<300;i++)ctx.fillRect(hash(i,3)*w,hash(i,4)*h,4,1);
  ctx.strokeStyle='#5a3a20';ctx.lineWidth=12;ctx.strokeRect(0,0,w,h);ctx.lineWidth=5;for(let x=64;x<w;x+=64){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}for(let y=43;y<h;y+=43){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}});
 const shoji=new THREE.MeshStandardMaterial(shojiTex?{map:shojiTex,emissiveMap:shojiTex,emissive:0xfff2d8,emissiveIntensity:.6,roughness:.9}:{color:0xf6f0e2,emissive:0xfff2d8,emissiveIntensity:.6});
 for(const x of [-3.1,3.1]){add(new THREE.PlaneGeometry(1.5,.95),shoji,x,1.62,4.93,'Shoji window').rotation.y=Math.PI;add(new THREE.BoxGeometry(1.6,.06,.08),darkWood,x,1.12,4.9,'Shoji sill');}

 // ---- Getabako: wooden shoe lockers with numbered 木札 locks. Same footprint as before.
 add(new THREE.BoxGeometry(.4,1.42,1.05),darkWood,-4.8,.71,4.51,'Getabako');
 const tagTex=paint(256,256,(ctx,w,h)=>{ctx.fillStyle='#d8b98a';ctx.fillRect(0,0,w,h);for(let i=0;i<12;i++){const cx=(i%4)*64+32,cy=Math.floor(i/4)*85+42;ctx.fillStyle='#ead2a6';ctx.fillRect(cx-22,cy-34,44,68);ctx.strokeStyle='#5a3a20';ctx.lineWidth=3;ctx.strokeRect(cx-22,cy-34,44,68);ctx.fillStyle='#2b1a0e';ctx.font=`bold 30px ${MINCHO}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(i+1),cx,cy);}});
 for(let c=0;c<3;c++)for(let r=0;r<4;r++){
  const z=4.85-c*.34,y=.2+r*.33;
  add(new THREE.BoxGeometry(.02,.28,.3),darkWood,-4.59,y,z,'Getabako door');
  const tag=add(new THREE.PlaneGeometry(.06,.1),tagTex?new THREE.MeshStandardMaterial({map:tagTex,roughness:.7}):brass,-4.575,y+.04,z+.08,'Getabako tag');tag.rotation.y=Math.PI/2;
  if(tagTex){const i=c*4+r,uv=tag.geometry.attributes.uv,u0=(i%4)/4,v0=1-(Math.floor(i/4)+1)/3;for(let k=0;k<uv.count;k++)uv.setXY(k,u0+uv.getX(k)/4,v0+uv.getY(k)/3);}
 }

 // ---- The bandai's counter top: andon, desk bell, push-button phone (the account book: onsen-props.js).
 const andonPaper=new THREE.MeshStandardMaterial({color:0xfff2d8,emissive:0xffb766,emissiveIntensity:.8,roughness:.9});
 add(new THREE.BoxGeometry(.2,.03,.2),darkWood,-3.95,FURNITURE_HEIGHTS.serviceCounter+.015,1.86,'Andon base');add(new THREE.BoxGeometry(.16,.3,.16),andonPaper,-3.95,FURNITURE_HEIGHTS.serviceCounter+.18,1.86,'Andon');add(new THREE.BoxGeometry(.22,.03,.22),darkWood,-3.95,FURNITURE_HEIGHTS.serviceCounter+.345,1.86,'Andon top');
 const bell=new THREE.Group();bell.position.set(-3.62,FURNITURE_HEIGHTS.serviceCounter,3.15);bell.name='Desk bell';group.add(bell);
 const bellBase=new THREE.Mesh(new THREE.CylinderGeometry(.05,.055,.015,16),new THREE.MeshStandardMaterial({color:0x2a2420,roughness:.5}));bellBase.position.y=.008;bell.add(bellBase);
 const dome=new THREE.Mesh(new THREE.SphereGeometry(.045,16,8,0,Math.PI*2,0,Math.PI/2),brass);dome.position.y=.015;bell.add(dome);
 const plunger=new THREE.Mesh(new THREE.CylinderGeometry(.008,.008,.03,8),brass);plunger.position.y=.07;bell.add(plunger);
 let rangAt=-9;
 anchor([-3.62,1.25,3.15],'Ring the desk bell',()=>{rangAt=time;action('inspect',"The desk bell",
  'Ting. Higa-san looks up over her glasses, finds you are standing right in front of her, and goes back to her account book. "I saw you come in, dear."');});
 const phone=new THREE.Group();phone.position.set(-3.9,FURNITURE_HEIGHTS.serviceCounter,3.2);phone.rotation.y=.3;phone.name='Push-button phone';group.add(phone);
 const ivory=new THREE.MeshStandardMaterial({color:0xddd2bc,roughness:.45});
 const pb=new THREE.Mesh(new THREE.BoxGeometry(.2,.05,.17),ivory);pb.position.y=.025;phone.add(pb);
 const hs=new THREE.Mesh(new THREE.BoxGeometry(.05,.04,.22),ivory);hs.position.set(-.06,.065,0);hs.name='Push-button phone handset';phone.add(hs);
 for(let i=0;i<12;i++){const k=new THREE.Mesh(new THREE.BoxGeometry(.016,.006,.012),new THREE.MeshStandardMaterial({color:0x6b6458}));k.position.set(.02+(i%3)*.022,.053,-.04+Math.floor(i/3)*.022);phone.add(k);}

 // ---- 小上がり: a raised tatami corner with a chabudai, tea and a small television.
 const K=LOBBY.koagari;
 add(new THREE.BoxGeometry(K.w,K.h,K.d),darkWood,K.x,K.h/2,K.z,'Koagari');rect(K.x,K.z,K.w,K.d,K.h);
 const tatami=paint(256,256,(ctx,w,h)=>{ctx.fillStyle='#b5a76d';ctx.fillRect(0,0,w,h);ctx.fillStyle='rgba(90,78,42,.16)';for(let x=0;x<w;x+=4)for(let y=0;y<h;y+=8)if((x/4+y/8)%2===0)ctx.fillRect(x,y,4,8);ctx.fillStyle='#22301f';ctx.fillRect(0,0,w,14);ctx.fillRect(0,h-14,w,14);});
 for(const dx of [-.6,.6]){const m=add(new THREE.PlaneGeometry(1.15,K.d-.08),textured(tatami,0xb5a76d,{roughness:.9}),K.x+dx,K.h+.004,K.z,'Tatami');m.rotation.x=-Math.PI/2;m.rotation.z=Math.PI/2;m.castShadow=false;}
 add(new THREE.BoxGeometry(K.w+.04,.05,.06),darkWood,K.x,K.h-.02,K.z+K.d/2,'Koagari edge');
 const T={x:K.x-.25,z:K.z+.05,y:K.h};
 add(new THREE.CylinderGeometry(.42,.42,.04,24),darkWood,T.x,T.y+.3,T.z,'Chabudai');
 for(let i=0;i<4;i++){const a=i*Math.PI/2+Math.PI/4;add(new THREE.CylinderGeometry(.025,.02,.28,8),darkWood,T.x+Math.cos(a)*.28,T.y+.14,T.z+Math.sin(a)*.28,'Chabudai leg');}
 const ceramic=new THREE.MeshStandardMaterial({color:0x8a5a3a,roughness:.4}),cupMat=new THREE.MeshStandardMaterial({color:0xece6d6,roughness:.35});
 const pot=add(new THREE.SphereGeometry(.07,14,10),ceramic,T.x-.08,T.y+.38,T.z,'Kyusu');pot.scale.y=.85;
 add(new THREE.CylinderGeometry(.012,.02,.07,8),ceramic,T.x-.01,T.y+.38,T.z+.02,'Kyusu spout').rotation.z=-1.1;
 add(new THREE.CylinderGeometry(.012,.012,.1,8),darkWood,T.x-.16,T.y+.38,T.z,'Kyusu handle').rotation.z=Math.PI/2;
 for(const [dx,dz] of [[.12,.1],[.16,-.1]])add(new THREE.CylinderGeometry(.03,.024,.05,12),cupMat,T.x+dx,T.y+.345,T.z+dz,'Yunomi');
 add(new THREE.CylinderGeometry(.05,.05,.035,12),new THREE.MeshStandardMaterial({color:0xb0302a,roughness:.5}),T.x+.02,T.y+.337,T.z-.2,'Senbei tin');
 const zabuton=new THREE.MeshStandardMaterial({color:0x8a2f3a,roughness:.85});
 for(const [dx,dz] of [[0,.5],[-.62,0]])add(new THREE.BoxGeometry(.5,.07,.5),zabuton,T.x+dx,T.y+.035,T.z+dz,'Zabuton');
 seat(seats.tatami,"Tatami corner",'You slip your slippers off at the edge and sit on the zabuton. The kyūsu is still warm. Somebody has left half a packet of senbei and the evening paper.');
 anchor([T.x,T.y+.6,T.z],'Pour a cup of tea',()=>action('inspect',"Tea",'You pour from the kyūsu: genmaicha, a little stewed, exactly as it should be after a bath. Higa-san calls over without looking: "Help yourself, it is free."'));
 // The small television on its own stand in the back corner of the tatami.
 const TV=LOBBY.tv,tv=new THREE.Group();tv.position.set(TV.x,K.h,TV.z);tv.rotation.y=-Math.PI*.18;tv.name='Lobby CRT';group.add(tv);
 const tvStand=new THREE.Mesh(new THREE.BoxGeometry(.6,.3,.42),darkWood);tvStand.position.y=.15;tv.add(tvStand);
 const housing=new THREE.Mesh(new THREE.BoxGeometry(.5,.42,.42),new THREE.MeshStandardMaterial({color:0x3a3632,roughness:.5}));housing.position.y=.51;tv.add(housing);
 const screenCanvas=typeof document!=='undefined'&&document.createElement?document.createElement('canvas'):null;
 let screenTex=null,screenCtx=null;
 if(screenCanvas){screenCanvas.width=160;screenCanvas.height=120;screenCtx=screenCanvas.getContext?.('2d')||null;if(screenCtx?.fillRect){screenTex=new THREE.CanvasTexture(screenCanvas);screenTex.colorSpace=THREE.SRGBColorSpace;}else screenCtx=null;}
 const screen=new THREE.Mesh(new THREE.PlaneGeometry(.38,.29),new THREE.MeshBasicMaterial(screenTex?{map:screenTex,toneMapped:false}:{color:0x203040}));screen.position.set(0,.52,.212);tv.add(screen);
 for(const s of [-1,1]){const ant=new THREE.Mesh(new THREE.CylinderGeometry(.004,.004,.36,6),brass);ant.position.set(s*.08,.85,-.05);ant.rotation.z=-s*.35;tv.add(ant);}
 // A switched-off CRT is dark green-grey glass, not a hole: it shows when the set has no power.
 const deadGlass=new THREE.Mesh(new THREE.PlaneGeometry(.38,.29),new THREE.MeshStandardMaterial({color:0x2c3330,roughness:.25,metalness:.1}));deadGlass.position.set(0,.52,.2105);deadGlass.name='Lobby CRT glass';tv.add(deadGlass);
 const TVS=ONSEN_SIGNS.tv;
 let tuned=0,drawn=-1,drawnAt=-1;
 const current=()=>pinnedChannel?channelIndex(pinnedChannel):tuned;
 function drawScreen(t){
  if(!screenCtx)return;const c=screenCtx,w=160,h=120,channel=current();
  if(channel===0){const G=TVS.nightGame;c.fillStyle='#2f7a3a';c.fillRect(0,0,w,h);c.fillStyle='#c9a46a';c.beginPath();c.moveTo(80,40);c.lineTo(130,90);c.lineTo(80,118);c.lineTo(30,90);c.closePath();c.fill();
   c.fillStyle='#fff';c.fillRect(78+Math.sin(t*2)*30,70+Math.cos(t*3)*10,3,3);
   // The score box in the corner: away over home, the inning, and the ball/strike/out lamps.
   c.fillStyle='rgba(10,16,30,.82)';c.fillRect(4,4,96,34);c.textBaseline='middle';c.textAlign='left';c.font=`bold 12px ${GOTHIC}`;
   c.fillStyle='#fff';c.fillText(G.away,9,13);c.fillText(G.home,9,29);c.textAlign='right';c.fillStyle='#ffd23f';c.fillText(String(G.score.away),36,13);c.fillText(String(G.score.home),36,29);
   c.textAlign='left';c.fillStyle='#fff';c.font=`bold 11px ${GOTHIC}`;c.fillText(G.inning,44,13);
   // B S O: three ball lamps, two strike, two out; the lit ones in colour, the rest dim.
   let x=47;for(const [slots,lit,col] of [[3,G.count.balls,'#3ec46d'],[2,G.count.strikes,'#ffd23f'],[2,G.count.outs,'#ff5a3c']]){for(let i=0;i<slots;i++){c.fillStyle=i<lit?col:'rgba(255,255,255,.18)';c.beginPath();c.arc(x,29,2.5,0,Math.PI*2);c.fill();x+=7;}x+=4;}
   c.textBaseline='alphabetic';}
  else if(channel===1){const W=TVS.weather;c.fillStyle='#0b2a5a';c.fillRect(0,0,w,h);c.fillStyle='#ffd23f';c.font=`bold 13px ${GOTHIC}`;c.fillText(W.title,8,20);
   c.fillStyle='#e8f0d8';c.beginPath();c.ellipse(70,70,34,18,-.5,0,Math.PI*2);c.fill();c.fillStyle='#ff5a3c';c.beginPath();c.arc(120,64,13,0,Math.PI*2);c.fill();c.fillStyle='#fff';c.font=`bold 12px ${GOTHIC}`;c.fillText(W.forecast,96,104);}
  else if(channel===2){c.fillStyle='#4a3826';c.fillRect(0,0,w,h);c.fillStyle='#d9b07a';c.fillRect(0,80,w,40);c.fillStyle='#1c1410';c.fillRect(50+Math.sin(t)*8,36,18,46);c.fillRect(96-Math.sin(t)*8,40,18,42);c.fillStyle='#ddd';c.fillRect(66+Math.sin(t)*8,50,30,2);}
  else {const img=c.createImageData?.(w,h);if(img){for(let i=0;i<img.data.length;i+=4){const v=Math.random()*255;img.data[i]=img.data[i+1]=img.data[i+2]=v;img.data[i+3]=255;}c.putImageData(img,0,0);}}
  c.fillStyle='rgba(0,0,0,.22)';for(let y=0;y<h;y+=3)c.fillRect(0,y,w,1);
  screenTex.needsUpdate=true;
 }
 anchor([TV.x,K.h+.75,TV.z],'Change the channel',()=>{
  if(pinnedChannel){const ch=LOBBY_CHANNELS[current()];action('inspect','Television · '+ch.en,ch.en+'. Somebody on the tatami is watching it, so you leave it where it is. '+ch.note);return;}
  tuned=(tuned+1)%LOBBY_CHANNELS.length;drawnAt=-1;const ch=LOBBY_CHANNELS[tuned];action('inspect',"Television · Channel "+(tuned+1),ch.en+'. '+ch.note);});

 // ---- The milk cooler: an old red cabinet, lit inside, glass bottles with paper caps.
 const red=new THREE.MeshStandardMaterial({color:0xb8342e,roughness:.4});
 // A hollow cabinet (back, sides, top and plinth) so the bottles show through the glass.
 add(new THREE.BoxGeometry(.06,1.6,.6),red,4.88,.8,2.3,'Milk cooler');
 for(const z of [2.03,2.57])add(new THREE.BoxGeometry(.62,1.6,.06),red,4.6,.8,z,'Milk cooler side');
 add(new THREE.BoxGeometry(.62,.3,.6),red,4.6,1.45,2.3,'Milk cooler top');add(new THREE.BoxGeometry(.62,.26,.6),red,4.6,.13,2.3,'Milk cooler plinth');
 const header=paint(256,96,(ctx,w,h)=>{ctx.fillStyle='#f5ecd6';ctx.fillRect(0,0,w,h);ctx.fillStyle='#b8342e';ctx.font=`bold 44px ${MINCHO}`;ctx.textAlign='center';ctx.textBaseline='middle';const M=ONSEN_SIGNS.milk;[...M.jp].forEach((ch,i,all)=>ctx.fillText(ch,w/2+(i-(all.length-1)/2)*58,40));ctx.font=`bold 18px ${GOTHIC}`;ctx.fillText(M.price,w/2,78);});
 add(new THREE.PlaneGeometry(.55,.2),textured(header,0xf5ecd6),4.285,1.45,2.3,'Milk cooler sign').rotation.y=-Math.PI/2;
 add(new THREE.PlaneGeometry(.48,1.04),new THREE.MeshStandardMaterial({color:0xe9f6ff,emissive:0xd8f0ff,emissiveIntensity:.9,roughness:.6}),4.845,.82,2.3,'Milk cooler light').rotation.y=-Math.PI/2;
 add(new THREE.BoxGeometry(.02,1.04,.48),new THREE.MeshStandardMaterial({color:0xdfeff2,roughness:.08,transparent:true,opacity:.2,depthWrite:false}),4.3,.82,2.3,'Milk cooler glass');
 const kinds=[[0xf6f2e6,0x2f6fd0],[0x9b6a3c,0xd88a2a],[0xf3d98a,0xe0566a]];
 for(let r=0;r<3;r++){add(new THREE.BoxGeometry(.52,.015,.48),new THREE.MeshStandardMaterial({color:0x9aa3a8,metalness:.6,roughness:.3}),4.58,.42+r*.32,2.3,'Cooler shelf');
  for(let c=0;c<4;c++){const [body,cap]=kinds[(r+c)%3],z=2.12+c*.12;add(new THREE.CylinderGeometry(.03,.03,.13,10),new THREE.MeshStandardMaterial({color:body,roughness:.25}),4.4,.5+r*.32,z,'Milk bottle');
   add(new THREE.CylinderGeometry(.022,.028,.04,10),new THREE.MeshStandardMaterial({color:body,roughness:.25}),4.4,.585+r*.32,z,'Milk bottle neck');add(new THREE.CylinderGeometry(.023,.023,.01,10),new THREE.MeshStandardMaterial({color:cap,roughness:.6}),4.4,.61+r*.32,z,'Milk cap');}}

 // ---- The two noren into the changing rooms (ONSEN_DOORWAYS): crimson 女 over the women's doorway, indigo 男 over the
 // men's, ゆ small at the top, the hem stitched. Each is two panels with a slit down the middle (the gap both armies
 // peek through); the big kanji runs across the slit, as it does on a real noren.
 const noren=[];
 for(const D of Object.values(ONSEN_DOORWAYS)){
  const sign=ONSEN_SIGNS[D.sign],w=D.x1-D.x0,cx=(D.x0+D.x1)/2,panel=(w-NOREN.slit)/2;
  const tex=paint(256,256,(ctx,W,H)=>{ctx.fillStyle=sign.colour;ctx.fillRect(0,0,W,H);ctx.fillStyle='rgba(255,255,255,.04)';for(let i=0;i<900;i++)ctx.fillRect(hash(i,1)*W,hash(i,2)*H,2,2);
   ctx.fillStyle='#f3efe4';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`bold 50px ${MINCHO}`;ctx.fillText(sign.mark,W/2,40);ctx.font=`bold 138px ${MINCHO}`;ctx.fillText(sign.jp,W/2,150);
   ctx.strokeStyle='rgba(243,239,228,.75)';ctx.lineWidth=3;ctx.setLineDash?.([8,6]);ctx.beginPath();ctx.moveTo(14,H-18);ctx.lineTo(W-14,H-18);ctx.stroke();});
  const m=new THREE.MeshStandardMaterial(tex?{map:tex,roughness:.9,side:THREE.DoubleSide}:{color:new THREE.Color(sign.colour),roughness:.9,side:THREE.DoubleSide});
  for(let k=0;k<2;k++){
   // Each panel shows its own half of the cloth's print.
   const g=new THREE.PlaneGeometry(panel,NOREN.h),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,(uv.getX(i)*panel+k*(panel+NOREN.slit))/w);
   const pivot=new THREE.Group();pivot.position.set(D.x0+panel/2+k*(panel+NOREN.slit),NOREN.top,R.hall.front);pivot.name=sign.side==='women'?'Women’s noren':'Men’s noren';pivot.userData.side=sign.side;group.add(pivot);
   const p=new THREE.Mesh(g,m);p.position.y=-NOREN.h/2;p.name='Noren';p.userData.side=sign.side;pivot.add(p);noren.push(pivot);}
  add(new THREE.CylinderGeometry(.02,.02,w-.02,8),darkWood,cx,NOREN.top+.01,R.hall.front,'Noren rod').rotation.z=Math.PI/2;
 }
 // A man at the crimson noren: Mrs Higa sends him to the indigo one without looking up.
 {const W=ONSEN_DOORWAYS.women;anchor([(W.x0+W.x1)/2,1.4,R.hall.front+.35],'Women’s side',()=>action('inspect','The women’s side',
  'The crimson noren with the kanji for woman on it is the women’s side: their lockers, the mirrors and the hair dryers. Higa-san, without looking up from her account book: “Gentlemen through the indigo one, dear. Man is the kanji with the rice field and the strength in it.”'));}

 // ---- 本日の湯 board and a travel poster on the changing-room wall.
 const bathCanvas=typeof document!=='undefined'&&document.createElement?document.createElement('canvas'):null;
 let bathCtx=null,bathTex=null,bathDay=-1;
 if(bathCanvas){bathCanvas.width=192;bathCanvas.height=320;bathCtx=bathCanvas.getContext?.('2d')||null;if(bathCtx?.fillRect){bathTex=new THREE.CanvasTexture(bathCanvas);bathTex.colorSpace=THREE.SRGBColorSpace;}else bathCtx=null;}
 const board=add(new THREE.PlaneGeometry(.36,.6),bathTex?new THREE.MeshStandardMaterial({map:bathTex,roughness:.8}):darkWood,-1.6,1.55,R.hall.front+.12,'Today’s bath board');
 add(new THREE.BoxGeometry(.4,.64,.02),darkWood,-1.6,1.55,R.hall.front+.105,'Board frame');
 function drawBathBoard(weekday){
  if(!bathCtx||weekday===bathDay)return;bathDay=weekday;const c=bathCtx,w=192,h=320,jp=ONSEN_SIGNS.dailyBath[weekday];
  c.fillStyle='#e9d6ae';c.fillRect(0,0,w,h);c.strokeStyle='#5a3a20';c.lineWidth=8;c.strokeRect(4,4,w-8,h-8);
  c.fillStyle='#8a2f22';c.font=`bold 26px ${MINCHO}`;c.textAlign='center';c.textBaseline='middle';c.fillText(ONSEN_SIGNS.bathBoard.jp,w/2,36);
  c.fillStyle='#2b1a0e';c.font=`bold 38px ${MINCHO}`;[...jp].forEach((ch,i)=>c.fillText(ch==='ー'?'｜':ch,w/2,84+i*(200/Math.max(3,jp.length))));
  bathTex.needsUpdate=true;
 }
 anchor([-1.6,1.4,R.hall.front+.3],'Read today’s bath',()=>{const [name,en]=DAILY_BATH[bathDay<0?0:bathDay];action('inspect',"Today’s bath · "+name,`Today the indoor bath is ${name}: ${en.toLowerCase()} in a cotton bag, floating at the spout end. A different one every day of the week.`);});
 const poster=paint(192,288,(ctx,w,h)=>{const g=ctx.createLinearGradient(0,0,0,h*.62);g.addColorStop(0,'#f2a03d');g.addColorStop(.7,'#e05a5a');g.addColorStop(1,'#3f7fb0');ctx.fillStyle='#efe2c4';ctx.fillRect(0,0,w,h);ctx.fillStyle=g;ctx.fillRect(10,10,w-20,h*.6);
  ctx.fillStyle='#fff6d8';ctx.beginPath();ctx.arc(w/2,h*.3,22,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2d5f86';ctx.fillRect(10,h*.48,w-20,h*.14);ctx.fillStyle='#1f3f2a';ctx.beginPath();ctx.moveTo(20,h*.5);ctx.quadraticCurveTo(60,h*.36,110,h*.5);ctx.fill();
  ctx.fillStyle='#3a2012';ctx.font=`bold 20px ${MINCHO}`;ctx.textAlign='center';ctx.fillText(ONSEN_SIGNS.poster.title,w/2,h*.74);ctx.font=`12px ${GOTHIC}`;ctx.fillStyle='#664532';ctx.fillText(ONSEN_SIGNS.poster.line,w/2,h*.83);ctx.font='10px monospace';ctx.fillText('HARBOUR LINE · 1997',w/2,h*.92);});
 add(new THREE.PlaneGeometry(.46,.69),textured(poster,0xefe2c4,{roughness:.6}),2.6,1.6,R.hall.front+.12,'Travel poster');

 let time=0;
 return {tick(dt,minutes,day,weekday){
  time+=dt;
  shoji.emissiveIntensity=.15+day*.75;
  bell.position.y=FURNITURE_HEIGHTS.serviceCounter-(time-rangAt<.12?.01:0);
  for(const [i,p] of noren.entries())p.rotation.x=Math.sin(time*1.1+i*1.7)*.035;
  const ch=current();if(screenTex&&(ch!==drawn||time-drawnAt>(ch===3?.08:.25))){drawn=ch;drawnAt=time;drawScreen(time);}
  drawBathBoard(weekday);
 },tv:{get channel(){return LOBBY_CHANNELS[current()].id;},screen,deadGlass}};
}
