import {paint} from './kit.js';

/**
 * Hand-painted signs, drawn on canvases the way Sakura Crossing's textures.js draws its
 * plates: flat colour, a thick painted border, the name in big characters and a line of
 * small print. Okinawan shop signs of the nineties were sign-painter work, so each one
 * is a little off-square and none of them match.
 */
const SERIF='"Hiragino Mincho ProN","Yu Mincho","Noto Serif CJK JP",serif';
const SANS='"Hiragino Kaku Gothic ProN","Yu Gothic","Noto Sans CJK JP",sans-serif';

/** The long board over a shopfront. */
export function fascia({jp,en,bg='#f3ead2',ink='#23313a',accent='#b8432f',mark=''}={}){
 return paint(1024,192,(ctx,w,h)=>{
  ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
  // Sun and salt: a paler band along the top edge, and a few rust runs from the fixings.
  ctx.fillStyle='rgba(255,255,255,.18)';ctx.fillRect(0,0,w,h*.22);
  ctx.fillStyle='rgba(120,70,40,.22)';for(const x of [40,w-44])ctx.fillRect(x,8,5,h*.55);
  ctx.strokeStyle=accent;ctx.lineWidth=12;ctx.strokeRect(10,10,w-20,h-20);
  ctx.fillStyle=ink;ctx.textBaseline='middle';ctx.textAlign='center';
  const left=mark?120:0;
  if(mark){ctx.fillStyle=accent;ctx.beginPath();ctx.arc(96,h/2,58,0,Math.PI*2);ctx.fill();
   ctx.fillStyle=bg;ctx.font=`bold 70px ${SANS}`;ctx.fillText(mark,96,h/2+3);ctx.fillStyle=ink;}
  ctx.font=`bold ${Math.min(104,Math.floor((w-left-80)/Math.max(1,[...jp].length)*.92))}px ${SERIF}`;
  ctx.fillText(jp,(w+left)/2,h*.44);
  if(en){ctx.font=`bold 26px ${SANS}`;ctx.fillStyle=accent;ctx.fillText(en.toUpperCase(),(w+left)/2,h*.84);}
 });
}

/** A tall board on the corner of a building, read from up the street. */
export function vertical({jp,bg='#b8432f',ink='#fff6e0'}={}){
 return paint(128,512,(ctx,w,h)=>{
  ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
  ctx.strokeStyle=ink;ctx.lineWidth=6;ctx.strokeRect(8,8,w-16,h-16);
  const chars=[...jp],size=Math.min(96,Math.floor((h-60)/chars.length*.9));
  ctx.fillStyle=ink;ctx.font=`bold ${size}px ${SERIF}`;ctx.textAlign='center';ctx.textBaseline='middle';
  chars.forEach((c,i)=>ctx.fillText(c,w/2,30+(i+.5)*(h-60)/chars.length));
 });
}

/** A family's name on a small wooden plate by the gate (表札). */
export function nameplate(family,romaji){
 return paint(256,128,(ctx,w,h)=>{
  const g=ctx.createLinearGradient(0,0,w,0);g.addColorStop(0,'#c9a877');g.addColorStop(1,'#b8925f');
  ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='rgba(90,60,30,.35)';ctx.lineWidth=2;
  for(let y=14;y<h;y+=17){ctx.beginPath();ctx.moveTo(0,y);ctx.bezierCurveTo(w*.3,y+4,w*.6,y-4,w,y+2);ctx.stroke();}
  ctx.fillStyle='#2a1e14';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.font=`bold 64px ${SERIF}`;ctx.fillText(family,w/2,h*.42);
  ctx.font=`bold 18px ${SANS}`;ctx.fillText(romaji.toUpperCase(),w/2,h*.86);
 });
}

/** The shaved-ice flag: 氷 in red on white over blue waves. */
export function iceFlag(){
 return paint(128,384,(ctx,w,h)=>{
  ctx.fillStyle='#fbf8f0';ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#2f6fb8';
  for(let i=0;i<4;i++){const y=h*.72+i*18;ctx.beginPath();ctx.moveTo(0,y);
   for(let x=0;x<=w;x+=16)ctx.quadraticCurveTo(x+8,y-12,x+16,y);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();}
  ctx.fillStyle='#d42a2a';ctx.font=`bold 104px ${SERIF}`;ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('氷',w/2,h*.32);
  ctx.fillStyle='#2f6fb8';ctx.font=`bold 26px ${SANS}`;ctx.fillText('ぜんざい',w/2,h*.56);
 });
}

/** A poster or notice: a coloured sheet with a headline, pinned to a wall. */
export function poster({title,lines=[],bg='#f4e7c4',ink='#2b2b2b',band='#d0572f'}={}){
 return paint(256,360,(ctx,w,h)=>{
  ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
  ctx.fillStyle=band;ctx.fillRect(0,0,w,70);
  ctx.fillStyle='#fff';ctx.font=`bold 40px ${SANS}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(title,w/2,36);
  ctx.fillStyle=ink;ctx.font=`bold 24px ${SANS}`;
  lines.forEach((line,i)=>ctx.fillText(line,w/2,112+i*40));
 });
}

/**
 * Coral stone as it is laid in Okinawan walls: irregular blocks, dry-fitted, in pale
 * greys and creams with dark shadowed joints and a fine pitted face.
 */
export function coralStone(){
 return paint(256,256,(ctx,w,h)=>{
  ctx.fillStyle='#6f6858';ctx.fillRect(0,0,w,h);                       // the joints
  let seed=7;const r=()=>(seed=seed*16807%2147483647)/2147483647;
  const rows=5,rowH=h/rows;
  for(let row=0;row<rows;row++){
   let x=-r()*30;
   while(x<w){
    const bw=34+r()*38,y0=row*rowH+2+r()*3,y1=(row+1)*rowH-2-r()*3;
    const t=196+Math.floor(r()*36),warm=Math.floor(r()*10);
    ctx.fillStyle=`rgb(${t+warm},${t+warm-4},${t-18})`;
    // An irregular polygon, so the courses are rough rather than bricklaid.
    ctx.beginPath();
    ctx.moveTo(x+2+r()*4,y0+r()*4);ctx.lineTo(x+bw-2-r()*4,y0+r()*3);
    ctx.lineTo(x+bw-1-r()*3,(y0+y1)/2+(r()-.5)*6);ctx.lineTo(x+bw-3-r()*4,y1-r()*3);
    ctx.lineTo(x+3+r()*4,y1-r()*4);ctx.lineTo(x+1+r()*3,(y0+y1)/2+(r()-.5)*6);ctx.closePath();ctx.fill();
    // Light from above: a paler top edge and a darker foot to every stone.
    ctx.fillStyle='rgba(255,255,245,.25)';ctx.fillRect(x+4,y0+2,bw-8,3);
    ctx.fillStyle='rgba(60,50,35,.18)';ctx.fillRect(x+4,y1-5,bw-8,4);
    // The fine pits of old coral.
    for(let i=0;i<9;i++){ctx.fillStyle=`rgba(90,82,66,${.2+r()*.25})`;ctx.fillRect(x+4+r()*(bw-8),y0+4+r()*(y1-y0-8),1+r()*2,1+r()*2);}
    x+=bw;
   }
  }
 });
}

/** Red pantiles in rows, with the white lime pointing between them. */
export function roofTile(){
 return paint(128,128,(ctx,w,h)=>{
  ctx.fillStyle='#f0ebe0';ctx.fillRect(0,0,w,h);
  for(let row=0;row<4;row++)for(let col=0;col<4;col++){
   const x=col*32+(row%2)*16,y=row*32;
   ctx.fillStyle=(row+col)%3?'#cf6446':'#c05a3e';
   ctx.beginPath();ctx.ellipse(x+16,y+17,14,13,0,0,Math.PI*2);ctx.fill();
   ctx.fillStyle='rgba(255,220,190,.35)';ctx.beginPath();ctx.ellipse(x+12,y+12,6,4,-.4,0,Math.PI*2);ctx.fill();
   if(x+16>w){ctx.fillStyle=(row+col)%3?'#cf6446':'#c05a3e';ctx.beginPath();ctx.ellipse(x+16-w,y+17,14,13,0,0,Math.PI*2);ctx.fill();}
  }
 });
}

/** Flower blocks (hana-burokku): a grid of pierced concrete blocks. */
export function flowerBlock(){
 return paint(128,128,(ctx,w,h)=>{
  ctx.fillStyle='#e6e0d2';ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='#bdb5a4';ctx.lineWidth=3;ctx.strokeRect(1,1,w-2,h-2);
  ctx.fillStyle='#4a4a44';
  for(const [x,y] of [[32,32],[96,32],[32,96],[96,96]]){
   ctx.beginPath();ctx.arc(x,y,17,0,Math.PI*2);ctx.fill();
  }
  ctx.fillStyle='#e6e0d2';
  for(const [x,y] of [[32,32],[96,32],[32,96],[96,96]]){ctx.beginPath();ctx.arc(x,y,6,0,Math.PI*2);ctx.fill();}
 });
}

/** Packed sand and crushed coral: the ground of a yard or lane. */
export function coralSand(){
 return paint(256,256,(ctx,w,h)=>{
  ctx.fillStyle='#d9d0b8';ctx.fillRect(0,0,w,h);
  let seed=11;const r=()=>(seed=seed*16807%2147483647)/2147483647;
  for(let i=0;i<1400;i++){const t=190+Math.floor(r()*50);ctx.fillStyle=`rgba(${t},${t-6},${t-28},.8)`;ctx.fillRect(r()*w,r()*h,1+r()*3,1+r()*3);}
  for(let i=0;i<120;i++){ctx.fillStyle='rgba(120,110,90,.35)';ctx.beginPath();ctx.arc(r()*w,r()*h,1+r()*2,0,Math.PI*2);ctx.fill();}
 });
}

/** A painted wall advert for island ice cream, the kind every shop side wall had. */
export function iceMural(){
 return paint(1024,300,(ctx,w,h)=>{
  const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#2d7fb8');g.addColorStop(1,'#1f5f94');
  ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  ctx.fillStyle='rgba(255,255,255,.12)';for(let i=0;i<6;i++){ctx.beginPath();ctx.arc(90+i*170,h+40,120,0,Math.PI*2);ctx.fill();}
  // The cone and three scoops.
  ctx.fillStyle='#d9a45a';ctx.beginPath();ctx.moveTo(110,150);ctx.lineTo(190,150);ctx.lineTo(150,285);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#a8763a';ctx.lineWidth=3;for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(118+i*16,150);ctx.lineTo(150,280);ctx.stroke();}
  for(const [x,y,c] of [[130,135,'#f6efe0'],[172,132,'#e98aa6'],[151,95,'#8a5a3c']]){ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,34,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='#fff';ctx.textAlign='left';ctx.textBaseline='middle';
  ctx.font='bold 92px "Hiragino Kaku Gothic ProN","Yu Gothic","Noto Sans CJK JP",sans-serif';ctx.fillText('ブルーコーラル',250,105);
  ctx.font='bold 54px "Hiragino Kaku Gothic ProN","Yu Gothic","Noto Sans CJK JP",sans-serif';ctx.fillText('アイスクリーム',254,190);
  ctx.fillStyle='#ffd45a';ctx.font='bold 30px sans-serif';ctx.fillText('BLUE CORAL ICE CREAM · OKINAWA · SINCE 1963',254,256);
  ctx.strokeStyle='#f3ead2';ctx.lineWidth=10;ctx.strokeRect(8,8,w-16,h-16);
 });
}

/** An enamel tin advert, rusting at the corners. */
export function enamel({jp,en,bg='#f1e6c8',ink='#b8302a'}={}){
 return paint(256,384,(ctx,w,h)=>{
  ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
  ctx.strokeStyle=ink;ctx.lineWidth=10;ctx.strokeRect(12,12,w-24,h-24);
  const chars=[...jp],size=Math.min(84,Math.floor((h-110)/chars.length*.92));
  ctx.fillStyle=ink;ctx.font=`bold ${size}px "Hiragino Mincho ProN","Yu Mincho","Noto Serif CJK JP",serif`;ctx.textAlign='center';ctx.textBaseline='middle';
  chars.forEach((c,i)=>ctx.fillText(c,w/2,40+(i+.5)*(h-110)/chars.length));
  ctx.font='bold 20px sans-serif';ctx.fillText(en.toUpperCase(),w/2,h-44);
  ctx.fillStyle='rgba(120,60,30,.55)';for(const [x,y] of [[16,16],[w-26,20],[20,h-28],[w-30,h-24]]){ctx.beginPath();ctx.arc(x,y,10,0,Math.PI*2);ctx.fill();}
 });
}

/** A tairyō-bata, the big-catch flag a boat flies coming home: loud colours, a crane. */
export function catchFlag(seed=0){
 const palettes=[['#d8342c','#f4d23c','#1f5fa8'],['#1f5fa8','#f4f0e4','#d8342c'],['#f4d23c','#d8342c','#2a8a5a']];
 const [a,b,c]=palettes[seed%palettes.length];
 return paint(384,256,(ctx,w,h)=>{
  ctx.fillStyle=a;ctx.fillRect(0,0,w,h);
  ctx.fillStyle=b;ctx.beginPath();ctx.arc(w*.72,h*.42,70,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=c;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(0,h*.7+i*18);for(let x=0;x<=w;x+=24)ctx.quadraticCurveTo(x+12,h*.62+i*18,x+24,h*.7+i*18);ctx.lineTo(w,h);ctx.lineTo(0,h);ctx.fill();}
  ctx.fillStyle='#fff';ctx.font='bold 76px "Hiragino Mincho ProN","Yu Mincho","Noto Serif CJK JP",serif';ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText('大漁',w*.34,h*.4);
 });
}
