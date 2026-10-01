import * as THREE from '../../../vendor/three.module.js';

/**
 * The magazine rack under Sakura's west window.
 *
 * The model's rack was a four-metre gondola holding three titles, fifteen identical
 * copies to a shelf, stood bolt upright. It is replaced (REMOVED_SHELVING in
 * sakura-layout.js) by one slim two-metre rack of the kind konbini kept from the
 * seventies: cream enamel tube frame, a laminate plinth on casters, three stepped wire
 * tiers with the covers leaning back on their rails, yellowed price strips, and a pink
 * header sign. The folded papers ride on the top tier; the weeklies and monthlies
 * below, ten titles, each with a couple of copies behind the one on show.
 *
 * Every cover is drawn once into one atlas, and each title is one instanced draw. The
 * back of the rack faces the street through the window, so it carries a print too.
 */
export const MAGAZINE_RACK=Object.freeze({x:-4.3,z:3.52,width:1.96,depth:.56,height:1.6});

const MARU='"Hiragino Maru Gothic ProN","M PLUS Rounded 1c","Yu Gothic","Noto Sans CJK JP",sans-serif';
const COLS=4,ROWS=4,CW=320,CH=440;
const hash=(i,s=0)=>{const n=Math.sin(i*127.1+s*311.7)*43758.5453;return n-Math.floor(n);};

/** The titles, original to the town, in the order their covers sit in the atlas. */
export const RACK_TITLES=Object.freeze([
 {id:'hayabusa',name:'週刊少年ハヤブサ',kind:'shonen',thick:.024},
 {id:'playwave',name:'PLAY★WAVE',kind:'games',thick:.01},
 {id:'shimaaruki',name:'島あるき',kind:'guide',thick:.012},
 {id:'galisland',name:'GAL ISLAND',kind:'fashion',thick:.008},
 {id:'kakuto',name:'週刊格闘ファイト',kind:'sport',thick:.008},
 {id:'celanime',name:'月刊セルアニメ',kind:'anime',thick:.012},
 {id:'tvshima',name:'週刊テレビしま',kind:'tv',thick:.006},
 {id:'umikaze',name:'月刊 海風',kind:'umikaze',thick:.008},
 {id:'hoshizora',name:'週刊 星空',kind:'hoshizora',thick:.008},
 {id:'katsuo',name:'釣りと海',kind:'katsuo',thick:.01},
 {id:'minato',name:'みなと新聞',kind:'paper',paper:true},
 {id:'shimaspo',name:'島スポ',kind:'paper',paper:true},
 {id:'nippo',name:'沖縄日報',kind:'paper',paper:true},
]);
const BACK_AD=13,EDGES=15;

function drawCover(ctx,kind,id,w,h){
 const t=(s,x,y,size,colour,weight=900,align='center')=>{ctx.fillStyle=colour;ctx.font=`${weight} ${size}px ${MARU}`;ctx.textAlign=align;ctx.textBaseline='middle';ctx.fillText(s,x,y);};
 const band=(y,hh,colour)=>{ctx.fillStyle=colour;ctx.fillRect(0,y,w,hh);};
 const barcode=(x,y)=>{ctx.fillStyle='#fff';ctx.fillRect(x,y,92,40);ctx.fillStyle='#111';let bx=x+6;for(let i=0;i<24&&bx<x+86;i++){const b=hash(i,id.length)>.5?3:1.5;ctx.fillRect(bx,y+4,b,26);bx+=b+2;}};
 const price=(p,colour='#fff')=>t(p,w-16,h-24,22,colour,800,'right');
 const ink=(lw=5)=>{ctx.lineWidth=lw;ctx.strokeStyle='#17141a';};
 if(kind==='shonen'){
  const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#f8862b');g.addColorStop(.5,'#e8432f');g.addColorStop(1,'#8c1d1d');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  ctx.save();ctx.translate(w/2,250);ctx.fillStyle='rgba(255,240,150,.28)';for(let a=0;a<24;a++){ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,400,a*Math.PI/12,a*Math.PI/12+.13);ctx.fill();}ctx.restore();
  ctx.fillStyle='#ffe066';ctx.beginPath();const sp=[[160,180],[120,95],[140,170],[80,130],[118,200],[70,215],[130,235],[190,220],[250,235],[190,200],[242,130],[180,170],[200,95]];ctx.moveTo(...sp[0]);for(const p of sp)ctx.lineTo(...p);ctx.closePath();ctx.fill();ink();ctx.stroke();
  ctx.fillStyle='#ffe2c4';ctx.fillRect(122,218,76,92);ctx.strokeRect(122,218,76,92);
  ctx.fillStyle='#17141a';ctx.beginPath();ctx.moveTo(132,245);ctx.lineTo(154,256);ctx.lineTo(132,260);ctx.fill();ctx.beginPath();ctx.moveTo(188,245);ctx.lineTo(166,256);ctx.lineTo(188,260);ctx.fill();
  ctx.fillStyle='#ffd93b';ctx.fillRect(10,12,w-20,74);ink(5);ctx.strokeRect(10,12,w-20,74);t('少年ハヤブサ',w/2,50,42,'#17141a');
  ctx.fillStyle='#d42a2a';ctx.fillRect(14,94,120,26);t('週刊 36号',74,107,17,'#fff',800);
  t('巻頭カラー40P!!',w/2,342,30,'#fff');band(362,44,'#1b78c4');t('風雲児 最終決戦へ!',w/2,384,22,'#fff',800);
  barcode(14,h-46);price('¥200');
 }else if(kind==='games'){
  ctx.fillStyle='#10162e';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#19b8d4';ctx.lineWidth=2;
  for(let y=200;y<h;y+=22){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}for(let x=-w;x<w*2;x+=40){ctx.beginPath();ctx.moveTo(w/2,170);ctx.lineTo(x,h);ctx.stroke();}
  band(0,84,'#ec4899');t('PLAY★WAVE',w/2,44,40,'#fff');
  ctx.save();ctx.translate(w/2,205);ctx.fillStyle='#3bc4f2';ctx.beginPath();ctx.moveTo(0,-80);ctx.lineTo(74,-14);ctx.lineTo(46,62);ctx.lineTo(-46,62);ctx.lineTo(-74,-14);ctx.closePath();ctx.fill();ink(5);ctx.stroke();
  ctx.fillStyle='#ffe066';ctx.beginPath();ctx.arc(-24,-4,11,0,Math.PI*2);ctx.arc(24,-4,11,0,Math.PI*2);ctx.fill();ctx.restore();
  t('32ビット機',w/2,312,26,'#ffe066');t('頂上決戦!!',w/2,346,34,'#ffe066');band(372,34,'#10b981');t('隠しコマンド大全',w/2,389,19,'#fff',800);
  barcode(14,h-46);price('¥380');
 }else if(kind==='guide'){
  ctx.fillStyle='#fde66b';ctx.fillRect(0,0,w,h);band(12,76,'#d7263d');t('島あるき',w/2,50,46,'#fff');t('OKINAWA 9月号',w/2,104,18,'#7a1c1c',800);
  ctx.fillStyle='#4fb7e8';ctx.fillRect(24,122,w-48,170);ctx.fillStyle='#ffffff';ctx.fillRect(24,232,w-48,60);ctx.fillStyle='#2a8fcc';ctx.fillRect(24,262,w-48,30);
  // A red-tiled gate roof over the sea.
  ctx.fillStyle='#c0392b';ctx.beginPath();ctx.moveTo(90,190);ctx.quadraticCurveTo(160,140,230,190);ctx.lineTo(220,200);ctx.lineTo(100,200);ctx.closePath();ctx.fill();ctx.fillStyle='#8a2a1c';ctx.fillRect(110,200,14,40);ctx.fillRect(196,200,14,40);
  ink(4);ctx.strokeRect(24,122,w-48,170);
  t('国際通り 徹底ガイド',w/2,320,22,'#17141a');band(342,40,'#9b59b6');t('★ 旧盆エイサーMAP ★',w/2,362,20,'#fff',800);
  barcode(14,h-46);price('¥350','#17141a');
 }else if(kind==='fashion'){
  ctx.fillStyle='#f2557a';ctx.fillRect(0,0,w,h);ctx.fillStyle='#ff8fa8';for(let i=0;i<40;i++){ctx.beginPath();ctx.arc(hash(i,3)*w,hash(i,4)*h,10+hash(i,5)*8,0,Math.PI*2);ctx.fill();}
  ctx.lineWidth=7;ctx.strokeStyle='#17141a';ctx.font=`900 46px ${MARU}`;ctx.textAlign='center';ctx.strokeText('GAL ISLAND',w/2,58);t('GAL ISLAND',w/2,58,46,'#ffe066');
  for(const [x,y,r] of [[30,100,-.06],[170,118,.05]]){ctx.save();ctx.translate(x,y);ctx.rotate(r);ctx.fillStyle='#fff';ctx.fillRect(0,0,120,160);ctx.fillStyle='#fbcfe8';ctx.fillRect(8,8,104,120);ctx.fillStyle='#6b3a2a';ctx.beginPath();ctx.arc(60,62,30,Math.PI,0);ctx.fill();ctx.fillStyle='#ffd8bf';ctx.beginPath();ctx.arc(60,72,22,0,Math.PI*2);ctx.fill();t('♡',60,145,20,'#f2557a');ctx.restore();}
  band(300,48,'#ffe066');t('ルーズソックス宣言!!',w/2,324,24,'#17141a');t('厚底サンダル 100連発',w/2,374,20,'#fff',800);
  barcode(14,h-46);price('¥420');
 }else if(kind==='sport'){
  const g=ctx.createRadialGradient(w/2,230,20,w/2,230,280);g.addColorStop(0,'#f98a2b');g.addColorStop(.6,'#b8231d');g.addColorStop(1,'#1c1917');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  t('格闘ファイト',w/2,48,40,'#fff');t('週刊',40,90,18,'#ffe066',800);
  ctx.fillStyle='#120d0c';ctx.beginPath();ctx.arc(w/2,180,52,0,Math.PI*2);ctx.fill();ctx.fillRect(w/2-70,226,140,100);ctx.fillRect(w/2-120,236,60,26);ctx.fillRect(w/2+60,236,60,26);
  t('沖縄大会 激闘!',w/2,346,30,'#ffe066');t('時間無制限 一本勝負',w/2,384,19,'#fff',800);
  barcode(14,h-46);price('¥360');
 }else if(kind==='anime'){
  ctx.fillStyle='#2e2a7a';ctx.fillRect(0,0,w,h);ctx.fillStyle='#3d3896';for(let i=0;i<6;i++)ctx.fillRect(0,110+i*48,w,22);
  t('月刊',36,30,18,'#7fe3f5',800);t('セルアニメ',w/2,58,40,'#7fe3f5');
  ctx.fillStyle='#9b5de5';ctx.beginPath();ctx.moveTo(w/2,104);ctx.lineTo(w/2+62,206);ctx.lineTo(w/2+40,296);ctx.lineTo(w/2-40,296);ctx.lineTo(w/2-62,206);ctx.closePath();ctx.fill();ink(5);ctx.stroke();
  ctx.fillStyle='#5ef08a';ctx.fillRect(w/2-10,170,20,48);ctx.fillStyle='#ffe066';ctx.beginPath();ctx.moveTo(w/2,104);ctx.lineTo(w/2-8,78);ctx.lineTo(w/2+8,78);ctx.fill();
  t('巨大ロボ 大特集',w/2,330,28,'#ffe066');t('付録: B2 両面ポスター',w/2,370,18,'#e2e8f0',800);
  barcode(14,h-46);price('¥580');
 }else if(kind==='tv'){
  ctx.fillStyle='#ffffff';ctx.fillRect(0,0,w,h);band(0,80,'#2a8fcc');t('テレビしま',w/2,42,40,'#fff');t('週刊',30,98,16,'#2a8fcc',800);
  ctx.fillStyle='#ffd93b';ctx.beginPath();ctx.arc(w/2,200,78,0,Math.PI*2);ctx.fill();ctx.fillStyle='#17141a';ctx.fillRect(w/2-50,170,100,66);ctx.fillStyle='#7fd1f0';ctx.fillRect(w/2-42,178,84,50);
  ctx.strokeStyle='#17141a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(w/2-20,170);ctx.lineTo(w/2-40,138);ctx.moveTo(w/2+20,170);ctx.lineTo(w/2+40,138);ctx.stroke();
  ctx.strokeStyle='#c9c4b6';ctx.lineWidth=1.5;for(let i=0;i<5;i++){const y=296+i*16;ctx.beginPath();ctx.moveTo(16,y);ctx.lineTo(w-16,y);ctx.stroke();}
  t('9/13 → 9/19 番組表',w/2,300-14,20,'#d7263d');t('秋の新ドラマ 総まくり',w/2,380,19,'#17141a',800);
  barcode(14,h-46);price('¥150','#17141a');
 }else if(kind==='umikaze'||kind==='hoshizora'||kind==='katsuo'){
  const look={umikaze:['#d7e5ec','#20496b','#3d7fa6','うみかぜ','月刊 海風','港の夏、灯台めぐり'],hoshizora:['#2b3a5c','#f2e2b0','#c58a3a','ほしぞら','週刊 星空','秋の星座 早見表つき'],katsuo:['#f0e3c4','#2f5c45','#b5622f','かつお','釣りと海','カツオ一本釣り 同行記']}[kind];
  const [paper,inkC,accent,jp,line,lead]=look;ctx.fillStyle=paper;ctx.fillRect(0,0,w,h);
  t(line,w/2,56,42,inkC);t(jp,w/2,100,20,accent,800);
  ctx.fillStyle=accent;ctx.fillRect(24,124,w-48,190);
  if(kind==='hoshizora'){ctx.fillStyle='#f2e2b0';for(let i=0;i<30;i++){ctx.beginPath();ctx.arc(30+hash(i,8)*(w-60),130+hash(i,9)*170,1.5+hash(i,1)*2.5,0,Math.PI*2);ctx.fill();}ctx.beginPath();ctx.arc(230,170,24,0,Math.PI*2);ctx.fill();}
  else if(kind==='umikaze'){ctx.fillStyle='#ffffff';ctx.fillRect(150,150,20,110);ctx.fillStyle='#d7263d';ctx.fillRect(150,170,20,16);ctx.fillRect(150,210,20,16);ctx.fillStyle='#20496b';ctx.fillRect(24,260,w-48,54);}
  else {ctx.fillStyle='#2f5c45';ctx.fillRect(24,250,w-48,64);ctx.fillStyle='#d9e2e8';ctx.beginPath();ctx.ellipse(160,200,70,22,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(220,200);ctx.lineTo(250,180);ctx.lineTo(250,220);ctx.fill();}
  t(lead,w/2,344,21,inkC,800);barcode(14,h-46);price(kind==='hoshizora'?'¥280':'¥450',inkC);
 }else if(kind==='paper'){
  ctx.fillStyle='#ebe7d9';ctx.fillRect(0,0,w,h);
  const mast={minato:['みなと新聞','夕刊','#8d3f31'],shimaspo:['島スポ','スポーツ','#1b5fb4'],nippo:['沖縄日報','朝刊','#2b2b2b']}[id];
  ctx.fillStyle=mast[2];ctx.fillRect(14,14,w-28,70);t(mast[0],w/2-20,50,38,'#fff');t(mast[1],w-40,50,16,'#fff',800);
  t('平成9年9月13日(土)',w/2,100,15,'#3a3530',700);
  const head={minato:['台風16号 北上','週明け 船便に影響か'],shimaspo:['沖縄水産 劇的勝利!','秋季大会 4強へ'],nippo:['旧盆 帰省ラッシュ','那覇空港 混雑ピーク']}[id];
  ctx.fillStyle=id==='shimaspo'?'#d7263d':'#17141a';ctx.font=`900 36px ${MARU}`;ctx.textAlign='center';ctx.fillText(head[0],w/2,148);t(head[1],w/2,192,22,'#3a3530');
  ctx.fillStyle='#a8a296';ctx.fillRect(18,216,140,108);ctx.fillStyle='#57524a';for(let c=0;c<6;c++)for(let y=220;y<322;y+=12)ctx.fillRect(170+c*22,y,16,6);
  ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,h-6);ctx.lineTo(w,h-6);ctx.stroke();
  for(let y=340;y<h-16;y+=12){ctx.fillStyle='#6e695f';ctx.fillRect(18,y,w-36,5);}
 }
 ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=4;ctx.strokeRect(2,2,w-4,h-4);
}

function buildAtlas(){
 const canvas=document.createElement('canvas');canvas.width=COLS*CW;canvas.height=ROWS*CH;
 const ctx=canvas.getContext('2d');
 RACK_TITLES.forEach((title,i)=>{ctx.save();ctx.translate((i%COLS)*CW,Math.floor(i/COLS)*CH);ctx.beginPath();ctx.rect(0,0,CW,CH);ctx.clip();drawCover(ctx,title.kind,title.id,CW,CH);ctx.restore();});
 // The back cover: the shop's own PORT 88 canned-coffee advertisement.
 ctx.save();ctx.translate((BACK_AD%COLS)*CW,Math.floor(BACK_AD/COLS)*CH);
 ctx.fillStyle='#322823';ctx.fillRect(0,0,CW,CH);ctx.fillStyle='#bd4826';ctx.fillRect(0,CH-90,CW,90);
 ctx.fillStyle='#f5e5c1';ctx.fillRect(130,90,60,170);ctx.fillStyle='#bd4826';ctx.fillRect(130,150,60,50);
 ctx.font=`900 40px ${MARU}`;ctx.textAlign='center';ctx.fillStyle='#f5e5c1';ctx.fillText('PORT 88',CW/2,320);ctx.font=`800 22px ${MARU}`;ctx.fillText('港の朝に、一本。',CW/2,CH-46);ctx.restore();
 // Page edges: newsprint cream, and the green recycled stock of the shōnen weekly.
 ctx.save();ctx.translate((EDGES%COLS)*CW,Math.floor(EDGES/COLS)*CH);ctx.fillStyle='#efe8d4';ctx.fillRect(0,0,CW,CH/2);ctx.fillStyle='#d3e6cc';ctx.fillRect(0,CH/2,CW,CH/2);ctx.restore();
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=8;return texture;
}

/** A cell of the atlas as UV bounds, inset a little so neighbours never bleed in. */
function cell(index,inset=.004){
 const c=index%COLS,r=Math.floor(index/COLS);
 return [c/COLS+inset,1-(r+1)/ROWS+inset,(c+1)/COLS-inset,1-r/ROWS-inset];
}
function remapFace(geometry,face,[u0,v0,u1,v1]){
 const uv=geometry.attributes.uv;
 for(let i=face*4;i<face*4+4;i++)uv.setXY(i,u0+uv.getX(i)*(u1-u0),v0+uv.getY(i)*(v1-v0));
}
/** One title's geometry: its cover on +z, the ad on the back, page edges round the sides. */
function titleGeometry(title,index){
 const w=title.paper?.27:.2,h=title.paper?.37:.27,d=title.paper?.014:title.thick;
 const g=new THREE.BoxGeometry(w,h,d);g.translate(0,h/2,-d/2);
 const ec=cell(EDGES),edge=title.kind==='shonen'?[ec[0]+.05,ec[1]+.02,ec[2]-.05,(ec[1]+ec[3])/2-.02]:[ec[0]+.05,(ec[1]+ec[3])/2+.02,ec[2]-.05,ec[3]-.02];
 for(const face of [0,1,2,3])remapFace(g,face,edge);
 remapFace(g,4,cell(index));remapFace(g,5,title.paper?cell(index):cell(BACK_AD));
 return g;
}

export function buildMagazineRack(room,{anchor,action}={}){
 const R=MAGAZINE_RACK,group=new THREE.Group();group.name='Sakura magazine rack';
 // Built facing +z and turned to face the shop; the back stands to the window.
 group.position.set(R.x,0,R.z);group.rotation.y=Math.PI;room.add(group);
 const enamel=new THREE.MeshStandardMaterial({color:0xece4d2,roughness:.42,metalness:.15});
 const wire=new THREE.MeshStandardMaterial({color:0xbdb8ad,roughness:.35,metalness:.55});
 const laminate=new THREE.MeshStandardMaterial({color:0x5a3a28,roughness:.7});
 const dark=new THREE.MeshStandardMaterial({color:0x22252a,roughness:.8});
 const add=(geometry,material,x,y,z,label='Sakura magazine rack')=>{const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);m.name=label;group.add(m);return m;};
 const W=R.width,D=R.depth,halfW=W/2-.02;
 // Plinth on four little casters.
 add(new THREE.BoxGeometry(W,.1,D),laminate,0,.1,0);
 for(const sx of [-1,1])for(const sz of [-1,1]){const c=add(new THREE.CylinderGeometry(.03,.03,.025,12),dark,sx*(W/2-.08),.03,sz*(D/2-.08));c.rotation.z=Math.PI/2;}
 // Tube frame: front and back uprights each side, joined over the top.
 const tube=(len)=>new THREE.CylinderGeometry(.015,.015,len,10);
 for(const sx of [-1,1]){
  add(tube(1.3),enamel,sx*halfW,.8,-D/2+.04);add(tube(.52),enamel,sx*halfW,.41,D/2-.06);
  const brace=add(tube(.6),enamel,sx*halfW,.6,0);brace.rotation.x=-.95;
  add(tube(D-.1),enamel,sx*halfW,1.45,-.02).rotation.x=Math.PI/2;
 }
 add(tube(W-.04),enamel,0,1.45,-D/2+.04).rotation.z=Math.PI/2;
 // Back panel, with a print for the street on its far side.
 const backPrint=new THREE.CanvasTexture((()=>{const c=document.createElement('canvas');c.width=1024;c.height=512;const x=c.getContext('2d');x.fillStyle='#f6eadf';x.fillRect(0,0,1024,512);x.fillStyle='#f06b9a';x.fillRect(0,0,1024,120);x.fillStyle='#d7263d';x.fillRect(0,120,1024,14);
  x.fillStyle='#fff';x.font=`900 72px ${MARU}`;x.textAlign='center';x.textBaseline='middle';x.fillText('本・雑誌・新聞',512,62);x.fillStyle='#b5455f';x.font=`800 54px ${MARU}`;x.fillText('BOOKS & MAGAZINES',512,260);x.font=`700 40px ${MARU}`;x.fillText('毎朝入荷 · サクラ商店',512,360);return c;})());
 backPrint.colorSpace=THREE.SRGBColorSpace;
 add(new THREE.BoxGeometry(W-.06,1.2,.012),[enamel,enamel,enamel,enamel,enamel,new THREE.MeshStandardMaterial({map:backPrint,roughness:.6})],0,.78,-D/2+.04,'Magazine rack back panel');
 // Three stepped tiers: the papers on top, the magazines below, each leaning on a rail.
 const TIERS=[{y:.26,z:.21},{y:.62,z:.07},{y:.98,z:-.07}];
 const LEAN=.27,priceStrip=new THREE.CanvasTexture((()=>{const c=document.createElement('canvas');c.width=1024;c.height=48;const x=c.getContext('2d');x.fillStyle='#f3e3a0';x.fillRect(0,0,1024,48);x.fillStyle='#7a5a1c';x.font=`800 26px ${MARU}`;x.textBaseline='middle';
  ['¥200','¥380','¥350','¥420','¥360','¥580','¥150','¥450'].forEach((p,i)=>x.fillText(p,22+i*126,25));return c;})());
 priceStrip.colorSpace=THREE.SRGBColorSpace;const stripMat=new THREE.MeshStandardMaterial({map:priceStrip,roughness:.5});
 for(const tier of TIERS){
  const tray=add(new THREE.BoxGeometry(W-.06,.012,.3),wire,0,tier.y,tier.z-.12);tray.rotation.x=.12;
  add(new THREE.BoxGeometry(W-.06,.03,.012),stripMat,0,tier.y-.012,tier.z+.03,'Magazine rack price strip');
  add(tube(W-.06).clone().scale(.35,1,.35),wire,0,tier.y+.075,tier.z-.065).rotation.z=Math.PI/2;
  for(let i=-3;i<=3;i++)add(new THREE.CylinderGeometry(.004,.004,.1,6),wire,i*.27,tier.y+.04,tier.z-.06);
 }
 // The header sign, in the shop's pink.
 const signTex=new THREE.CanvasTexture((()=>{const c=document.createElement('canvas');c.width=1024;c.height=128;const x=c.getContext('2d');x.fillStyle='#f06b9a';x.fillRect(0,0,1024,128);x.fillStyle='#d7263d';x.fillRect(0,108,1024,20);
  x.fillStyle='#fff';x.font=`900 58px ${MARU}`;x.textAlign='center';x.textBaseline='middle';x.fillText('雑誌・新聞',330,56);x.fillStyle='#fff6c8';x.font=`800 32px ${MARU}`;x.fillText('★ 毎朝入荷 · 立ち読み歓迎 ★',740,56);return c;})());
 signTex.colorSpace=THREE.SRGBColorSpace;const signMat=new THREE.MeshStandardMaterial({map:signTex,roughness:.5,emissive:0xffffff,emissiveMap:signTex,emissiveIntensity:.25});
 add(new THREE.BoxGeometry(1.7,.2,.025),[enamel,enamel,enamel,enamel,signMat,signMat],0,1.57,-D/2+.04,'Magazine rack sign');
 for(const sx of [-.7,.7])add(tube(.12),enamel,sx,1.43+.06,-D/2+.04);
 // The stock. Each title is one instanced draw over the shared atlas.
 const atlas=buildAtlas(),material=new THREE.MeshStandardMaterial({map:atlas,roughness:.5});
 const placed=RACK_TITLES.map(()=>[]),dummy=new THREE.Object3D();
 const magazines=RACK_TITLES.map((t,i)=>i).filter(i=>!RACK_TITLES[i].paper),papers=RACK_TITLES.map((t,i)=>i).filter(i=>RACK_TITLES[i].paper);
 const row=(tier,list,count,width,copies)=>{
  const gap=(W-.12-count*width)/(count-1);
  for(let k=0;k<count;k++){
   const index=list[k%list.length],t=RACK_TITLES[index],x=-W/2+.06+width/2+k*(width+gap);
   for(let c=0;c<copies;c++){
    const d=t.paper?.014:t.thick,z=tier.z-.03-c*(d+.002)*Math.cos(LEAN);
    placed[index].push([x+(hash(k,c)-.5)*.006,tier.y+.006+c*.004,z,LEAN+(hash(k,c+3)-.5)*.02,(hash(k,c+7)-.5)*.03]);
   }
  }
 };
 // Papers across the top, magazines on the two tiers below, no title twice side by side.
 row(TIERS[2],papers,6,.27,3);
 row(TIERS[1],magazines.slice(0,8),8,.2,3);
 row(TIERS[0],[...magazines.slice(5),...magazines.slice(0,5)],8,.2,3);
 placed.forEach((list,index)=>{
  if(!list.length)return;
  const mesh=new THREE.InstancedMesh(titleGeometry(RACK_TITLES[index],index),material,list.length);mesh.name='Sakura rack '+RACK_TITLES[index].id;
  list.forEach(([x,y,z,lean,tilt],i)=>{dummy.position.set(x,y,z);dummy.rotation.set(-lean,0,tilt);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});
  mesh.computeBoundingSphere();group.add(mesh);
 });
 if(anchor&&action){
  anchor([R.x,1.35,R.z-.5],'Read the magazines',()=>action('inspect','Sakura · 雑誌・新聞',
   'The old cream rack under the window. 週刊少年ハヤブサ, PLAY★WAVE, 島あるき, GAL ISLAND, 格闘ファイト, セルアニメ, テレビしま, 海風, 星空 and 釣りと海 — and on top, みなと新聞, 島スポ and 沖縄日報, folded at the headlines.\nThe card says 立ち読み歓迎. Nobody minds how long you stand here.'));
 }
 return group;
}
