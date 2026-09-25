/** Multimetern ombord — original marker-comic artwork, entirely Canvas paths.
 * Cel shadows and heavy navy contours; light comes from upper left.
 * Reference: the Sjöskolan teaching meter and editable circuit in the source deck.
 * Pure drawing: time is an argument, no clocks, random calls, or DOM access.
 */
export const W=1920,H=1080;
export const C={paper:'#f7f1e5',ink:'#102a43',blue:'#1554a2',light:'#e6edf1',teal:'#087d83',mint:'#bbdfce',gold:'#f4c744',red:'#c44940',white:'#fffdf7',grey:'#61717c',lcd:'#cfddba',shadow:'#d7cebd'};
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
const TAU=Math.PI*2;
export function txt(c,t,x,y,size=36,color=C.ink,weight=400,align='left'){
 c.fillStyle=color;c.font=`${weight} ${size}px "Film Sans", "DejaVu Sans", sans-serif`;c.textAlign=align;c.textBaseline='alphabetic';c.fillText(t,x,y);
}
export function wrap(c,t,x,y,max=1000,size=34,color=C.ink,weight=400,line=1.36){
 c.font=`${weight} ${size}px "Film Sans", "DejaVu Sans", sans-serif`;
 const lines=[];let s='';for(const word of t.split(/\s+/)){const next=s?s+' '+word:word;if(c.measureText(next).width>max&&s){lines.push(s);s=word}else s=next}if(s)lines.push(s);
 lines.forEach((l,i)=>txt(c,l,x,y+i*size*line,size,color,weight));return lines.length*size*line;
}
export function box(c,x,y,w,h,r,fill,stroke=null,lw=3){c.beginPath();c.roundRect(x,y,w,h,r);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke()}}
export function line(c,points,color=C.ink,width=6,progress=1){
 if(progress<=0)return;const lengths=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));let left=lengths.reduce((a,b)=>a+b,0)*clamp(progress);
 c.beginPath();c.moveTo(...points[0]);for(let i=1;i<points.length;i++){const d=lengths[i-1];if(left>=d){c.lineTo(...points[i]);left-=d}else{const k=left/d;c.lineTo(points[i-1][0]+(points[i][0]-points[i-1][0])*k,points[i-1][1]+(points[i][1]-points[i-1][1])*k);break}}c.strokeStyle=color;c.lineWidth=width;c.lineCap='round';c.lineJoin='round';c.stroke();
}
function disc(c,x,y,r,fill,stroke=C.ink,lw=4){c.beginPath();c.arc(x,y,r,0,TAU);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke()}}
function shape(c,cmd,fill,stroke=C.ink,lw=5){c.beginPath();cmd(c);if(fill){c.fillStyle=fill;c.fill()}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.lineJoin='round';c.lineCap='round';c.stroke()}}
export function arrow(c,x1,y1,x2,y2,color=C.teal,w=7){line(c,[[x1,y1],[x2,y2]],color,w);let a=Math.atan2(y2-y1,x2-x1);line(c,[[x2-Math.cos(a-.6)*20,y2-Math.sin(a-.6)*20],[x2,y2],[x2-Math.cos(a+.6)*20,y2-Math.sin(a+.6)*20]],color,w)}
function stream(c,points,t,color=C.teal,spacing=80){
 const ls=points.slice(1).map((p,i)=>Math.hypot(p[0]-points[i][0],p[1]-points[i][1]));const total=ls.reduce((a,b)=>a+b,0);
 for(let d=(t*85)%spacing;d<total;d+=spacing){let q=d;for(let i=0;i<ls.length;i++){if(q<=ls[i]){const a=points[i],b=points[i+1],k=q/ls[i];disc(c,a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,7,color,null);break}q-=ls[i]}}
}
function node(c,x,y,label,dx=20,dy=-18){disc(c,x,y,8,C.white);if(label)txt(c,label,x+dx,y+dy,28,C.ink,700)}
function resistor(c,x,y,w=150,h=58,label='120 Ω'){line(c,[[x-25,y],[x,y]]);box(c,x,y-h/2,w,h,2,C.white,C.ink,5);line(c,[[x+w,y],[x+w+25,y]]);if(label)txt(c,label,x+w/2,y-48,32,C.ink,700,'center')}
function battery(c,x,y,on=false,value=12){c.fillStyle=C.paper;c.fillRect(x-48,y-43,96,53);line(c,[[x,y-108],[x,y-35]]);line(c,[[x-43,y-35],[x+43,y-35]],C.ink,7);line(c,[[x-26,y+2],[x+26,y+2]],C.ink,7);line(c,[[x,y+2],[x,y+110]]);txt(c,'+',x-80,y-25,34,C.red,700);txt(c,'−',x-76,y+17,34);txt(c,`${value} V`,x-68,y+72,35,C.ink,700,'right');txt(c,on?'PÅ':'AV',x-68,y+108,25,on?C.teal:C.grey,700,'right')}
function lamp(c,x,y,on,t,r=54){if(on){c.save();c.globalAlpha=.16+.025*Math.sin(t*3);disc(c,x,y,r+24,C.gold,null);c.restore()}disc(c,x,y,r,on?'#ffe595':C.white);line(c,[[x-r*.52,y-r*.52],[x+r*.52,y+r*.52]]);line(c,[[x+r*.52,y-r*.52],[x-r*.52,y+r*.52]]);}
export function sailor(c,x,y,s,t,point=false){
 c.save();c.translate(x,y+Math.sin(t*2.1)*3);c.scale(s,s);
 c.save();c.globalAlpha=.18;c.beginPath();c.ellipse(0,4,87,16,0,0,TAU);c.fillStyle=C.ink;c.fill();c.restore();
 // Boots and bent trousers.
 shape(c,q=>{q.moveTo(-51,-104);q.lineTo(-44,-15);q.quadraticCurveTo(-70,-17,-70,-2);q.lineTo(-8,-2);q.lineTo(0,-92);q.lineTo(15,-5);q.lineTo(70,-5);q.quadraticCurveTo(75,-19,44,-22);q.lineTo(54,-107);q.closePath()},C.ink);
 shape(c,q=>{q.moveTo(-43,-209);q.bezierCurveTo(-70,-192,-72,-144,-61,-100);q.quadraticCurveTo(-5,-82,54,-103);q.lineTo(58,-181);q.lineTo(34,-208);q.closePath()},C.blue);
 shape(c,q=>{q.moveTo(17,-202);q.lineTo(49,-186);q.lineTo(48,-106);q.lineTo(30,-102);q.closePath()},'#103e79',null);
 // Arm: a gesture is authored from shoulder, elbow and wrist, rather than a rotating capsule.
 const reach=point?Math.sin(t*1.2)*5:16+Math.sin(t*1.7)*10;
 shape(c,q=>{q.moveTo(48,-192);q.quadraticCurveTo(74,-186,84,-170);q.lineTo(126,-196+reach);q.lineTo(135,-176+reach);q.quadraticCurveTo(89,-131,70,-140);q.lineTo(49,-157)},C.blue);
 shape(c,q=>{q.moveTo(126,-195+reach);q.quadraticCurveTo(131,-217+reach,139,-212+reach);q.lineTo(144,-198+reach);q.quadraticCurveTo(160,-204+reach,158,-192+reach);q.quadraticCurveTo(152,-176+reach,135,-176+reach);q.closePath()},'#e9b18c');
 shape(c,q=>{q.moveTo(-49,-192);q.quadraticCurveTo(-91,-160,-84,-127);q.quadraticCurveTo(-75,-111,-62,-124);q.lineTo(-49,-150)},C.blue);
 disc(c,-73,-119,13,'#e9b18c');
 // Neck, face, swept hair and cap.
 box(c,-19,-237,38,40,10,'#e9b18c',C.ink,4);
 shape(c,q=>{q.moveTo(-46,-277);q.bezierCurveTo(-52,-322,33,-331,48,-278);q.lineTo(43,-244);q.quadraticCurveTo(16,-208,-19,-226);q.quadraticCurveTo(-47,-236,-46,-277)},'#efbc97');
 shape(c,q=>{q.moveTo(-49,-273);q.quadraticCurveTo(-62,-313,-18,-329);q.quadraticCurveTo(28,-342,52,-302);q.lineTo(44,-270);q.lineTo(28,-292);q.quadraticCurveTo(0,-270,-40,-278);q.closePath()},'#694931');
 disc(c,-46,-258,11,'#efbc97');
 const blink=(t%4.7)>4.53;[-15,22].forEach(ex=>{if(blink)line(c,[[ex-5,-265],[ex+5,-265]],C.ink,3);else{disc(c,ex,-265,5,C.ink,null);disc(c,ex+1,-267,1.8,C.white,null)}});
 line(c,[[7,-260],[11,-248],[3,-246]],'#ae7457',3);
 shape(c,q=>{q.moveTo(-6,-236);q.quadraticCurveTo(10,-226-Math.abs(Math.sin(t*8))*3,22,-239)},null,C.ink,3);
 shape(c,q=>{q.moveTo(-57,-309);q.quadraticCurveTo(-46,-354,17,-347);q.quadraticCurveTo(47,-344,57,-307);q.closePath()},C.white);
 box(c,-60,-316,119,22,7,C.blue,C.ink,4);shape(c,q=>{q.moveTo(-15,-298);q.quadraticCurveTo(49,-310,78,-294);q.quadraticCurveTo(57,-280,17,-288);q.closePath()},C.ink);
 txt(c,'⚓',-5,-323,24,C.blue,700,'center');
 shape(c,q=>{q.moveTo(-26,-213);q.lineTo(-1,-192);q.lineTo(30,-213);q.lineTo(18,-187);q.lineTo(-1,-170);q.lineTo(-19,-185);q.closePath()},'#df6b52');
 line(c,[[-45,-173],[-33,-160]],C.white,4);line(c,[[-48,-162],[-36,-149]],C.white,4);
 c.restore();
}
export function gull(c,x,y,s,t,fly=false){
 c.save();c.translate(x,y+Math.sin(t*2.6)*5);c.scale(s,s);
 if(!fly){line(c,[[-15,-17],[-18,2],[-39,6]],'#d99c28',7);line(c,[[21,-17],[24,2],[45,5]],'#d99c28',7)}
 // Curved breast, raised cheek and asymmetric folded tail.
 shape(c,q=>{q.moveTo(-63,-53);q.quadraticCurveTo(-27,-23,19,-32);q.bezierCurveTo(78,-49,59,-131,16,-143);q.bezierCurveTo(-28,-160,-50,-120,-39,-100);q.quadraticCurveTo(-76,-99,-92,-80);q.lineTo(-105,-64);q.lineTo(-65,-72);q.closePath()},C.white);
 shape(c,q=>{q.moveTo(-42,-96);q.quadraticCurveTo(14,-114,23,-66);q.quadraticCurveTo(-7,-51,-63,-69);q.closePath()},'#cedbe2');
 if(fly){shape(c,q=>{q.moveTo(-27,-99);q.quadraticCurveTo(-89,-136-Math.sin(t*7)*36,-122,-106-Math.sin(t*7)*30);q.quadraticCurveTo(-67,-78,-15,-78)},C.white)}
 shape(c,q=>{q.moveTo(39,-120);q.lineTo(87,-105);q.quadraticCurveTo(62,-93,44,-96);q.closePath()},C.gold);
 line(c,[[49,-108],[75,-105]],C.ink,2);disc(c,22,-124,5,C.ink,null);disc(c,24,-126,1.6,C.white,null);
 shape(c,q=>{q.moveTo(-6,-148);q.quadraticCurveTo(3,-164,14,-153)},null,C.ink,4);
 c.restore();
}
export function meter(c,x,y,scale,t,{mode='dc',reading='12,00',unit='V',jack='v',rotate=true,highlight=null}={}){
 c.save();c.translate(x,y);c.scale(scale,scale);
 box(c,12,17,340,586,51,'#d5c8aa');box(c,0,0,340,586,48,C.gold,C.ink,6);
 shape(c,q=>{q.moveTo(306,30);q.quadraticCurveTo(334,44,332,95);q.lineTo(327,533);q.quadraticCurveTo(321,573,288,576);q.lineTo(286,41);q.closePath()},'#d69e28',null);
 box(c,20,22,300,537,31,'#273844',C.ink,4);
 txt(c,'SJÖSKOLAN',170,59,22,C.white,700,'center');
 box(c,35,83,270,132,12,'#0a1b25');box(c,44,94,252,109,6,C.lcd);
 txt(c,mode==='dc'?'DC':mode==='ac'?'AC':mode==='current'?'DC':mode==='off'?'OFF':'',57,116,14,'#324436',700);
 txt(c,mode==='off'?'':reading,279,173,46,'#1c312a',500,'right');txt(c,mode==='off'?'':unit,278,194,16,'#324436',700,'right');
 const labs=['OFF','V DC','V ~','Ω','PIP','A DC'], modes=['off','dc','ac','ohm','continuity','current'];
 const angles=[-120,-72,-24,24,72,120]; const mi=modes.indexOf(mode);
 angles.forEach((a,i)=>{let q=a*Math.PI/180;let lx=170+Math.sin(q)*121,ly=356-Math.cos(q)*121;txt(c,labs[i],lx,ly+8,(i===4||i===1||i===5)?17:22,i===mi?C.gold:C.white,700,'center');line(c,[[170+Math.sin(q)*96,356-Math.cos(q)*96],[170+Math.sin(q)*106,356-Math.cos(q)*106]],i===mi?C.gold:'#bdc4c8',3)});
 disc(c,170,356,86,'#0b1923','#4c5c66',4);disc(c,170,356,75,'#30434f','#070f17',4);
 const a=(rotate?(-120+(angles[Math.max(0,mi)]+120)*ease(t/1.4)):angles[Math.max(0,mi)])*Math.PI/180;
 c.save();c.translate(170,356);c.rotate(a);box(c,-24,-73,48,141,14,'#172731','#07131c',4);line(c,[[-9,-46],[0,-64],[9,-46]],C.gold,6);for(let yy=-17;yy<=40;yy+=12)line(c,[[-13,yy],[13,yy]],'#5d707a',3);c.restore();
 const jx=[58,131,207,282], jl=['10 A','mA','COM','VΩ'];
 jx.forEach((q,i)=>{disc(c,q,492,23,'#070f18',i===2?'#b8c1c8':C.red,4);disc(c,q,492,10,'#354047',null);txt(c,jl[i],q,458,19,i===2?C.white:C.gold,700,'center')});
 [2,jack==='a'?0:jack==='ma'?1:3].forEach((i,k)=>{disc(c,jx[i],492,15,k?C.red:'#10171c',k?'#ff8577':'#73808a',3);line(c,[[jx[i],495],[jx[i],563]],k?C.red:'#111f2c',13)});
 if(highlight){const target=highlight==='jack'?[jx[jack==='a'?0:jack==='ma'?1:3],492,33]:[170,356,94];c.save();c.globalAlpha=.55+.3*Math.sin(t*5);c.setLineDash([12,8]);disc(c,target[0],target[1],target[2],'rgba(0,0,0,0)',C.gold,5);c.restore()}
 txt(c,'UNDERVISNINGSMODELL',170,574,13,C.ink,700,'center');c.restore();
 return {black:[x+207*scale,y+563*scale],red:[x+(jack==='a'?58:jack==='ma'?131:282)*scale,y+563*scale]};
}
function lead(c,from,to,color,progress=1,bend=70){
 const sx=from[0],sy=from[1],tx=to[0],ty=to[1];
 c.save();c.beginPath();c.moveTo(sx,sy);c.bezierCurveTo(sx,sy+bend,tx+130,sy+bend,tx+48,ty+26);c.lineTo(tx,ty);c.strokeStyle=color;c.lineWidth=7;c.lineCap='round';
 if(progress<1){c.setLineDash([1500*progress,1800]);}c.stroke();c.restore();
 if(progress>.96){const a=Math.atan2(ty-(ty+26),tx-(tx+48));c.save();c.translate(tx,ty);c.rotate(a);line(c,[[-47,0],[-12,0]],color,12);line(c,[[-12,0],[0,0]],'#a9b2b7',5);c.restore()}
}
function seriesLead(c,from,to,color,black,progress=1){
 c.save();c.beginPath();c.moveTo(...from);
 if(black){c.bezierCurveTo(from[0],850,1200,886,1200,550);c.bezierCurveTo(1200,326,1110,217,909,265);c.lineTo(...to);}
 else{c.bezierCurveTo(from[0],858,1040,860,838,684);c.bezierCurveTo(746,585,730,430,742,345);c.lineTo(...to);}
 c.strokeStyle=color;c.lineWidth=7;c.lineCap='round';if(progress<1)c.setLineDash([1600*progress,1800]);c.stroke();c.restore();
 if(progress>.96){const b=black?[909,265]:[742,345];const a=Math.atan2(to[1]-b[1],to[0]-b[0]);c.save();c.translate(...to);c.rotate(a);line(c,[[-49,0],[-12,0]],color,12);line(c,[[-12,0],[0,0]],'#a9b2b7',5);c.restore();}
}
function rig(c,t,{powered=false,series=false,cut=false,reversed=false,showLeads=false,drawMeter=true}={}){
 const x=310,top=300,bottom=665,lx=1000,ly=475;
 battery(c,x,465,powered);
 line(c,[[x,357],[x,top],[440,top]]);box(c,440,282,82,36,3,C.white,C.ink,4);txt(c,'F1',480,260,28,C.ink,700,'center');line(c,[[522,top],[620,top]]);
 disc(c,620,top,6,C.white);disc(c,716,top,6,C.white);line(c,[[620,top],[powered?716:699,powered?top:top-49]]);txt(c,'S1',660,353,28,C.ink,700,'center');
 if(series||cut){line(c,[[716,top],[774,top]]);line(c,[[861,top],[lx,top],[lx,ly-54]]);node(c,774,top,'K1',-30,57);node(c,861,top,'K2',0,57)}else line(c,[[716,top],[lx,top],[lx,ly-54]]);
 line(c,[[lx,ly+54],[lx,bottom],[x,bottom],[x,575]]);lamp(c,lx,ly,powered,t);txt(c,'H1',lx-85,ly+12,32,C.ink,700,'right');node(c,lx,370,'P1');node(c,lx,580,'P2');
 if(powered){const paths=series?[[[x,380],[x,top],[774,top]],[[861,top],[lx,top],[lx,ly-58]],[[lx,ly+58],[lx,bottom],[x,bottom],[x,545]]]:[[[x,380],[x,top],[lx,top],[lx,ly-58]],[[lx,ly+58],[lx,bottom],[x,bottom],[x,545]]];paths.forEach(p=>stream(c,p,t))}
 if(drawMeter){const m=meter(c,1378,250,.95,t,{mode:series?'current':'dc',reading:powered?(series?'0,10':reversed?'−12,00':'12,00'):'—',unit:series?'A':'V',jack:series?'a':'v'});
 if(showLeads){if(series){seriesLead(c,m.black,[861,300],C.ink,true,ease(t/2));seriesLead(c,m.red,[774,300],C.red,false,ease((t-.7)/2));}else{lead(c,m.black,[lx,reversed?370:580],C.ink,ease(t/2));lead(c,m.red,[lx,reversed?580:370],C.red,ease((t-.7)/2),105)}}}
}
function sectionBase(c,s,t){
 c.fillStyle=C.paper;c.fillRect(0,0,W,H);
 // Paper grain: deterministic strokes fixed to the page, never screen noise.
 c.strokeStyle='#e8dfcc';c.lineWidth=1;for(let i=0;i<35;i++){let x=(i*193+71)%1920,y=(i*251+39)%910;line(c,[[x,y],[x+12+(i%4)*7,y-1]],'#e8dfcc',1)}
 txt(c,'SJÖSKOLAN',82,61,24,C.blue,800);txt(c,'MULTIMETERN OMBORD',1838,61,22,C.grey,600,'right');
 line(c,[[82,87],[1838,87]],'#d9cfbd',2);txt(c,String(s.chapter+1).padStart(2,'0')+'  /  '+s.chapterName.toUpperCase(),84,137,22,C.teal,700);
 let sz=58;c.font=`700 ${sz}px "Film Sans"`;while(c.measureText(s.title).width>1750&&sz>43){sz--;c.font=`700 ${sz}px "Film Sans"`}txt(c,s.title,82,211,sz,C.ink,700);
 let ks=31;c.font=`600 ${ks}px "Film Sans"`;while(c.measureText(s.key).width>1748&&ks>24){ks--;c.font=`600 ${ks}px "Film Sans"`}txt(c,s.key,84,890,ks,C.blue,600);
 txt(c,`PowerPoint bild ${s.slides.length>1?s.slides[0]+'–'+s.slides.at(-1):s.slides[0]}`,1836,925,20,C.grey,400,'right');
}
function row(c,label,value,y,width=1430){txt(c,label,150,y,30,C.grey);txt(c,value,610,y,34,C.ink,600);line(c,[[150,y+20],[width,y+20]],'#d8cfbc',2)}
function formula(c,lines,t,x=170,y=365,size=48,gap=105){lines.forEach((v,i)=>{const a=ease((t-i*1.8)/.7);c.save();c.globalAlpha=a;txt(c,v,x,y+i*gap,size,i===lines.length-1?C.blue:C.ink,i===lines.length-1?700:500);c.restore()})}
function numberline(c,{min,max,a,b,center,x=180,y=570,width=1410,color=C.teal,t=5,label=''}){
 const pos=v=>x+(v-min)/(max-min)*width;line(c,[[x,y],[x+width,y]],C.ink,4);for(let j=0;j<=8;j++){const v=min+(max-min)*j/8,px=pos(v);line(c,[[px,y-10],[px,y+10]],C.ink,3);txt(c,v.toFixed(2).replace('.',','),px,y+50,24,C.grey,400,'center')}
 box(c,pos(a),y-27,(pos(b)-pos(a))*ease(t/1.5),54,6,color);if(center!=null){line(c,[[pos(center),y-42],[pos(center),y+42]],C.ink,5)}if(label)txt(c,label,pos((a+b)/2),y-60,31,C.ink,700,'center');
}
export function drawScene(c,s,t,env){
 c.setTransform(env.scale,0,0,env.scale,0,0);sectionBase(c,s,t);
 const p=clamp(t/s.duration),v=s.visual;
 if(v==='intro'||v==='outro'){
  // Cabin porthole, desk and recurring lamp; author-drawn scenery, not an asset.
  const end=v==='outro';disc(c,1447,464,171,C.blue,C.ink,10);disc(c,1447,464,145,'#b8dbdb',C.ink,5);
  c.save();c.beginPath();c.arc(1447,464,142,0,TAU);c.clip();c.fillStyle='#2a7398';c.fillRect(1260,494,380,140);for(let j=0;j<4;j++){const pts=[];for(let k=0;k<=24;k++)pts.push([1270+k*16,513+j*26+Math.sin(k*.7+t*1.3+j)*7]);line(c,pts,'#badde1',4)}c.restore();
  line(c,[[222,763],[1689,763]],C.ink,10);box(c,480,659,353,105,8,C.white,C.ink,5);line(c,[[655,659],[655,497]],C.ink,9);lamp(c,655,445,end,t,72);
  sailor(c,342,760,1.27,t,true);gull(c,1130,762,1.4,t);
  wrap(c,end?'En mätning som går att förklara.':'Fråga först. Mät sedan.',1305,707,480,29,C.ink,700);
  if(end){box(c,840,362,352,245,7,C.white,C.ink,4);txt(c,'MÄTPROTOKOLL',862,405,27,C.blue,700);['P1–P2 · V DC','11,80 V ±0,08 V','Krav: 11,40–12,60 V'].forEach((a,i)=>txt(c,a,862,457+i*45,24));}
  else {txt(c,'Saga',332,821,27,C.blue,700,'center');txt(c,'Måsen',1128,821,27,C.blue,700,'center');txt(c,'12 V',655,733,39,C.blue,700,'center')}
 } else if(v==='quantity'){
  const q=s.quantity;txt(c,q,135,610,270,C.blue,700);txt(c,q==='U'?'volt':q==='I'?'ampere':'ohm',267,701,47,C.ink,700,'center');
  let pts=[[680,384],[1310,384],[1310,660],[680,660],[680,384]];line(c,pts,C.ink,7,ease(t/1.5));resistor(c,922,384,176,62,q==='R'?'120 Ω':'R');battery(c,680,526,true);
  if(q==='U'){node(c,1310,384,'P1');node(c,1310,660,'P2');arrow(c,1430,625,1430,420,C.red);txt(c,'12 V',1470,534,45,C.red,700)}
  if(q==='I'){stream(c,pts,t);txt(c,'Laddning per sekund',835,527,43,C.teal,700);arrow(c,1140,315,1290,315)}
  if(q==='R'){stream(c,pts,t,C.teal,135);txt(c,'12 V / 120 Ω = 0,10 A',828,550,43,C.teal,700)}
  gull(c,1670,791,1.1,t);
 }else if(v==='rig'||v==='voltage'||v==='current'){
  rig(c,t,{powered:!!s.powered,series:v==='current',showLeads:v!=='rig',drawMeter:v!=='rig',reversed:s.reversed});
  if(v==='rig'){sailor(c,1510,783,1.12,t,true);gull(c,1785,784,.8,t);txt(c,'SELV · skyddande avskiljning',255,767,33,C.blue,700)}
  else txt(c,s.powered?'MATNING PÅ EFTER KONTROLL':'MATNING AV VID OMKOPPLING',275,780,27,s.powered?C.teal:C.grey,700);
 }else if(v==='meter'||v==='restore'||v==='wrong'){
  let mode=v==='meter'?(t<6?'dc':t<9?'ac':t<12?'ohm':'dc'):'dc',jack=v==='wrong'?'a':v==='restore'&&t<5?'a':'v';
  meter(c,355,252,1.0,t,{mode,reading:v==='meter'?'12,00':'—',jack,highlight:v==='meter'?null:'jack'});
  const labels=v==='meter'?['Display: tal + enhet + läge','Vred: mätfunktion','COM: svart ledning','VΩ eller A/mA: röd ledning']:v==='restore'?['1  Bryt matningen','2  Återställ strömvägen','3  Flytta röd till VΩ']:['Vredet står på V DC.','Röd sitter i A. Vad måste ändras?','Strömingången kan kortsluta källan.'];
  labels.forEach((l,i)=>wrap(c,l,840,335+i*112,870,37,i===2&&v==='wrong'?C.red:C.ink,600));
  if(v==='wrong'){gull(c,1100,798,1.2,t);txt(c,t<7?'PAUSA OCH FUNDERA':'FLYTTA RÖD TILL VΩ',1340,750,25,C.red,700)}
  else sailor(c,1665,793,.86,t,true);
 }else if(v==='check'){
  ['Vad och var ska du mäta?','Är instrument och ledningar hela?','Stämmer funktion, uttag och område?','Är kopplingen kontrollerad?'].forEach((l,i)=>{txt(c,String(i+1),177,339+i*130,49,C.blue,700);wrap(c,l,262,339+i*130,1180,40,C.ink,600);line(c,[[260,371+i*130],[1350,371+i*130]],'#d8cfbc',2,ease((t-i*.8)/1.0))});sailor(c,1627,795,1.15,t,true);
 }else if(v==='ohm'||v==='continuity'||v==='parallel'){
  const phase=v==='continuity'?(t<8?0:t<16?1:2):v==='parallel'&&t>14?1:0;
  const value=v==='ohm'?'1,000':v==='parallel'?(phase?'1 000':'500'):phase===2?'OL':'0,3';
  const m=meter(c,1400,253,.94,t,{mode:v==='continuity'?'continuity':'ohm',reading:value,unit:v==='ohm'?'kΩ':phase===2&&v==='continuity'?'':'Ω'});
  if(v==='ohm'){
   resistor(c,620,473,264,95,'R₁ = 1 kΩ');line(c,[[490,473],[595,473]]);line(c,[[909,473],[1010,473]]);node(c,490,473,'');node(c,1010,473,'');lead(c,m.black,[490,473],C.ink);lead(c,m.red,[1010,473],C.red);txt(c,'Isolerad komponent',570,344,37,C.ink,700);
  }else if(v==='continuity'){
   txt(c,phase===0?'Spetsar mot varandra':phase===1?'Hel, uttagen säkring':'Bruten väg',345,337,40,C.ink,700);
   if(phase===0){lead(c,m.black,[751,479],C.ink);lead(c,m.red,[751,479],C.red)}else{box(c,530,428,398,106,30,'#d9e2e6',C.ink,5);box(c,565,438,323,86,17,C.white,C.ink,3);if(phase===1)line(c,[[530,481],[930,481]],C.teal,8);else{line(c,[[530,481],[689,481]],C.grey,7);line(c,[[755,481],[930,481]],C.grey,7)}lead(c,m.black,[530,481],C.ink);lead(c,m.red,[930,481],C.red)}
   if(phase!==2){[0,1,2].forEach(i=>{const r=24+((t*36+i*18)%62);c.save();c.globalAlpha=1-(r-24)/62;c.beginPath();c.arc(1060,460,r,-.9,.9);c.lineWidth=5;c.strokeStyle=C.teal;c.stroke();c.restore()});txt(c,'PIP',1063,565,38,C.teal,700)}else txt(c,'OL ≠ bevis på spänningslöshet',280,745,34,C.red,700);
  }else{
   const a=[450,470],b=[1070,470];line(c,[[450,470],[450,360],[590,360]]);resistor(c,615,360,250,68,'1 kΩ');line(c,[[890,360],[1070,360],[1070,470]]);line(c,[[450,470],[450,618],[590,618]]);resistor(c,615,618,250,68,'1 kΩ');line(c,[[890,618],[phase?1005:1070,618]]);if(phase){line(c,[[1020,590],[1070,563],[1070,470]],C.grey,5)}else line(c,[[1070,618],[1070,470]]);lead(c,m.black,a,C.ink);lead(c,m.red,b,C.red);
   if(!phase){stream(c,[[450,470],[450,360],[1070,360],[1070,470]],t);stream(c,[[450,470],[450,618],[1070,618],[1070,470]],t)}else stream(c,[[450,470],[450,360],[1070,360],[1070,470]],t);
   txt(c,phase?'En gren lossad: 1 000 Ω':'(1 000 · 1 000) / (1 000 + 1 000) = 500 Ω',242,774,34,C.blue,700);
  }
 }else if(v==='transient'){
  line(c,[[195,683],[1360,683]],C.ink,4);line(c,[[195,683],[195,300]],C.ink,4);txt(c,'Spänning',172,290,28,C.ink,600);txt(c,'Tid',1390,694,28,C.ink,600);
  const pts=[];for(let i=0;i<=240;i++){const x=205+i*4.7;const spike=245*Math.exp(-(((i-137)/3.3)**2));pts.push([x,573-34*Math.sin(i*.18)-spike]);}line(c,pts,C.red,6,ease(t/2));
  txt(c,'Kort transient',950,317,37,C.red,700);arrow(c,985,343,858,381,C.red,4);txt(c,'Driftspänning',345,758,35,C.ink,600);sailor(c,1633,787,1.05,t,true);
 }else if(v==='categories'){
  const cols=[310,876,1432];
  ['CAT II','CAT III','CAT IV'].forEach((label,i)=>{
   const x=cols[i];txt(c,label,x,330,57,[C.teal,C.blue,C.red][i],800,'center');
   if(i===0){box(c,x-81,432,161,179,20,C.white,C.ink,5);disc(c,x,519,51,C.paper,C.ink,4);line(c,[[x+81,563],[x+127,563],[x+127,634],[x+187,634]],C.ink,7);line(c,[[x+190,621],[x+190,647]],C.ink,7);line(c,[[x+190,627],[x+208,627]],C.ink,5);line(c,[[x+190,640],[x+208,640]],C.ink,5)}
   if(i===1){box(c,x-116,410,231,238,8,C.light,C.ink,6);for(let k=0;k<3;k++){box(c,x-81+k*60,469,44,84,3,C.white,C.ink,3);line(c,[[x-61+k*60,488],[x-61+k*60,515]],C.blue,11)}line(c,[[x-81,594],[x+79,594]],C.ink,4)}
   if(i===2){line(c,[[x-66,413],[x-66,646],[x+70,646],[x+70,413]],C.ink,8);box(c,x-107,492,215,102,6,C.white,C.ink,4);txt(c,'SERVIS',x,553,28,C.ink,700,'center');for(let k=0;k<3;k++){line(c,[[x-54+k*55,360],[x-54+k*55,486]],C.red,5)}}
   txt(c,['Apparater','Fast installation','Matningspunkt'][i],x,730,36,C.ink,700,'center');txt(c,['Förbrukarsidan','Även enfas','Lågspänningsinstallation'][i],x,781,27,C.grey,400,'center');
  });txt(c,'Äldre CAT I: utan direkt nätanslutning. Tillverkarens gränser gäller.',230,838,26,C.grey);
 }else if(v==='ratings'){
  meter(c,288,257,.98,t,{reading:'—'});txt(c,'CAT III 1 000 V',899,389,65,C.blue,700);txt(c,'CAT IV 600 V',899,505,65,C.blue,700);
  wrap(c,'Två kombinationer som ett och samma instrument kan vara märkt för.',900,592,760,34);wrap(c,'Kontrollera också spänning till jord och mellan uttagen.',900,724,760,32,C.ink,600);
 }else if(v==='impulse'){
  const xs=[160,714,1275];['MÄRKNING','KORT PROVIMPULS','PROVKÄLLA'].forEach((l,i)=>txt(c,l,xs[i],321,26,C.grey,700));
  [['CAT II 1 000 V','6 000 V','12 Ω'],['CAT III 600 V','6 000 V','2 Ω'],['CAT IV 600 V','8 000 V','2 Ω']].forEach((r,i)=>{r.forEach((a,j)=>txt(c,a,xs[j],422+i*114,43,j?C.ink:C.blue,700));line(c,[[160,457+i*114],[1690,457+i*114]],'#d8cfbc',2)});
  txt(c,'Pedagogiskt urval av transientprov. Inte en fullständig standardtabell.',160,793,28,C.grey);
 }else if(v==='choose'){
  txt(c,'Krav i arbetsplanen: CAT III 600 V',200,330,46,C.ink,700);
  [['A','CAT II 1 000 V'],['B','CAT III 600 V']].forEach((r,i)=>{const x=300+i*810;txt(c,r[0],x,492,108,i?C.teal:C.grey,800);txt(c,r[1],x,585,55,i?C.teal:C.ink,700);if(t>7&&i)line(c,[[x-40,625],[x+565,625]],C.teal,9,ease((t-7)/1.2));});
  txt(c,t<7?'Pausa och välj. Motivera båda delarna.':'B uppfyller kategori och spänning.',300,723,40,C.blue,700);gull(c,1670,798,.8,t);
 }else if(v==='resolution'){
  ['12,00','12,01'].forEach((a,i)=>{box(c,194+i*790,325,559,180,15,C.lcd,C.ink,6);txt(c,a+' V',713+i*790,458,88,C.ink,500,'right')});arrow(c,820,421,896,421,C.blue,6);txt(c,'Ett steg = 0,01 V',940,617,61,C.blue,700,'center');
  ['Upplösning: steget','Felgräns: specificerad avvikelse','Tolerans: tillåtet område'].forEach((a,i)=>txt(c,a,200+i*565,749,i===1?29:32,C.ink,600));
 }else if(v==='accuracy'){
  const e=s.example;const percent=e===8?'1':'0,5',digits=e===8?3:2,part=e===8?'0,08':e===24?'0,12':'0,06',step=e===8?'0,03':'0,02',sum=e===8?'0,11':e===24?'0,14':'0,08';
  txt(c,`Specifikation: ±(${percent} % av visningen + ${digits} siffror)`,150,305,35,C.grey,600);
  formula(c,[`${percent} % av ${e},00 V = ${part} V`,`${digits} · 0,01 V = ${step} V`,`Felgräns: ±(${part} + ${step}) V = ±${sum} V`],t,150,406,46,95);
  const err=Number(sum.replace(',','.'));numberline(c,{min:e-.2,max:e+.2,a:e-err,b:e+err,center:e,x:230,y:745,width:1220,color:C.mint,t:t-4,label:`${(e-err).toFixed(2).replace('.',',')}–${(e+err).toFixed(2).replace('.',',')} V`});gull(c,1725,805,.9,t);
 }else if(v==='tolerance'){
  txt(c,'Krav: 12,0 V ±5 % = 12,0 V ±0,60 V',169,322,41,C.ink,600);
  numberline(c,{min:11.2,max:12.8,a:11.4,b:12.6,x:230,y:480,width:1410,color:C.mint,t,label:'Tillåtet: 11,40–12,60 V'});
  const pos=v=>230+(v-11.2)/1.6*1410;box(c,pos(11.4),621,(pos(11.6)-pos(11.4))*ease((t-2)/1.5),47,5,C.blue);
  line(c,[[pos(11.4),535],[pos(11.4),706]],C.grey,2);txt(c,'Mätning: 11,50 V ±0,10 V',700,655,39,C.blue,700);
  txt(c,'Hela intervallet ryms. Gränsvärdena är tillåtna i övningen.',230,778,35,C.ink,600);
 }else if(v==='protocol'){
  txt(c,'FIKTIVT IFYLLT EXEMPEL',150,285,23,C.teal,700);
  [['Mätpunkt och tillstånd','P1–P2 över H1. S1 sluten, matning på.'],['Instrument och område','DMM-01 · V DC · 20 V · steg 0,01 V'],['Specifikation','±(0,5 % av visning + 2 siffror)'],['Resultat','11,80 V ±0,08 V → 11,72–11,88 V'],['Krav och slutsats','11,40–12,60 V. Hela intervallet ryms.'],['Datum och utförare','2026-09-24 kl. 10.15 · Elev A']].forEach((r,i)=>row(c,r[0],r[1],355+i*82,1730));
 }else if(v==='divider'){
  const n=s.source===9?2:1,src=s.source||10,has=s.rm>0;const rm=s.rm||Infinity,rp=n*rm/(n+rm),u=has?src*rp/(n+rp):src/2;
  battery(c,250,520,true,src);line(c,[[250,412],[250,295],[740,295],[740,355]]);box(c,711,355,58,128,2,C.white,C.ink,5);txt(c,`R₁ = ${n} MΩ`,805,426,33,C.ink,700);line(c,[[740,483],[740,555]]);node(c,740,520,'');box(c,711,555,58,128,2,C.white,C.ink,5);txt(c,`R₂ = ${n} MΩ`,481,628,33,C.ink,700,'right');line(c,[[740,683],[740,745],[250,745],[250,630]]);
  if(has){line(c,[[740,520],[1070,520],[1070,555]],C.blue,5,ease(t/1.4));box(c,1041,555,58,128,2,'#d7e4ef',C.blue,5);line(c,[[1070,683],[1070,745],[740,745]],C.blue,5,ease(t/1.4));txt(c,`Rₘ = ${s.rm} MΩ`,1140,624,33,C.blue,700);stream(c,[[740,520],[1070,520],[1070,745],[740,745]],t,C.blue,100);}
  else{arrow(c,959,699,959,560,C.blue,6);txt(c,'5,000 V',1060,635,65,C.blue,700)}
  if(has){const result=src===9?'3,0 V':s.rm===10?'4,762 V':'3,333 V';txt(c,result,1450,397,66,C.blue,700,'center');txt(c,'beräknad spänning',1450,445,25,C.grey,400,'center');
   txt(c,`Rₚ = ${src===9?'1':s.rm===10?'0,909':'0,5'} MΩ`,1356,726,33,C.ink,700);txt(c,`Uₘ = ${src} · Rₚ / (${n} + Rₚ)`,1314,787,29,C.blue,600)}
 }else if(v==='loadingError'){
  const vals=[5,4.762,3.333];const labels=['Utan mätare','Rₘ = 10 MΩ','Rₘ = 1 MΩ'];
  vals.forEach((value,i)=>{const x=320+i*510;const h=310*(value/5)*ease(t/1.5);box(c,x,680-h,260,h,4,[C.ink,C.blue,C.teal][i]);txt(c,value.toFixed(3).replace('.',',')+' V',x+130,680-h-30,44,C.ink,700,'center');txt(c,labels[i],x+130,740,31,C.ink,600,'center')});
  txt(c,'Referens: spänningen innan mätaren anslöts.',235,816,30,C.grey);
 }else if(v==='burden'){
  const pts=[[230,335],[1360,335],[1360,664],[230,664],[230,335]];line(c,pts);battery(c,230,500,true);resistor(c,480,335,236,69,'Last: 120 Ω');resistor(c,991,335,164,69,'Mätare: 1 Ω');stream(c,pts,t);
  formula(c,['Utan mätare: 12 / 120 = 0,100 A','Med mätare: 12 / (120 + 1) ≈ 0,0992 A'],t,342,474,41,105);txt(c,'Mätarens spänningsfall: U = I · R ≈ 0,0992 V',300,775,37,C.blue,700);gull(c,1660,779,1.1,t);
 }else if(v==='recap'){
  const labels=[['V','Parallellt','COM + VΩ'],['A','I serie','COM + rätt A-ingång'],['Ω / PIP','Frånskilt och urladdat','COM + VΩ']];
  labels.forEach((a,i)=>{const y=368+i*165;txt(c,a[0],165,y,60,C.blue,700);txt(c,a[1],545,y,43,C.ink,700);txt(c,a[2],1220,y,35,C.grey,600);line(c,[[165,y+41],[1710,y+41]],'#d8cfbc',2,ease((t-i)/1.2))});
 }else if(v==='credits'){
  const list=['Underlag: Multimeter och mätfel, 70 bilder','Tekniska referenser: Hioki, Fluke och instrumentmanualen','Animation: original kod, Anidoodle och Helios','Musik: egen komposition och syntes i kod','Svensk berättarröst: lokal talsyntes, Piper NST'];
  list.forEach((a,i)=>wrap(c,a,180,338+i*97,1480,36,i===0?C.blue:C.ink,500));sailor(c,1744,817,.64,t,true);
 }
 // A small recurring character stays alive beside the diagram during explanation.
 if(['rig','voltage','current','ohm','continuity','parallel','categories','ratings','impulse','protocol','divider','recap','resolution','tolerance','loadingError'].includes(v))gull(c,1815,832,.52,t);
}
export function drawCaptions(c,captions,time,scale=1){
 const cue=captions.find(q=>time>=q.start&&time<q.end);c.save();c.setTransform(scale,0,0,scale,0,0);c.fillStyle=C.ink;c.fillRect(0,944,W,136);
 if(cue){const lines=wrap(c,cue.text,128,996,1664,33,C.white,500,1.33);}
 c.restore();
}
