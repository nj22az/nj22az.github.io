/** Shared Sjöskolan artwork — original marker-comic artwork, entirely Canvas paths.
 * Cel shadows and heavy navy contours; light comes from upper left.
 * Reference: the Sjöskolan teaching meter and editable circuit in the source deck.
 * Pure drawing: time is an argument, no clocks, random calls, or DOM access.
 */
export const W=1920,H=1080;
export const C={paper:'#f7f1e5',ink:'#102a43',blue:'#1554a2',light:'#e6edf1',teal:'#087d83',mint:'#bbdfce',gold:'#f4c744',red:'#c44940',white:'#fffdf7',grey:'#61717c',lcd:'#cfddba',shadow:'#d7cebd'};
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
const TAU=Math.PI*2;
// Index are written with course markup, U_{pp}, and drawn as true subscripts (smaller, lowered).
export function txt(c,t,x,y,size=36,color=C.ink,weight=400,align='left'){
 const font=(z)=>`${weight} ${z}px "Film Sans", "DejaVu Sans", sans-serif`;
 c.fillStyle=color;c.font=font(size);c.textBaseline='alphabetic';
 if(!String(t).includes('_{')){c.textAlign=align;c.fillText(t,x,y);return;}
 const sub=Math.round(size*.68),parts=String(t).split(/(_\{[^{}]*\})/).filter(Boolean).map(p=>p.startsWith('_{')?{t:p.slice(2,-1),z:sub,dy:size*.24}:{t:p,z:size,dy:0});
 let width=0;for(const p of parts){c.font=font(p.z);p.w=c.measureText(p.t).width;width+=p.w;}
 let cx=align==='center'?x-width/2:align==='right'?x-width:x;c.textAlign='left';
 for(const p of parts){c.font=font(p.z);c.fillText(p.t,cx,y+p.dy);cx+=p.w;}
 c.font=font(size);
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
function battery(c,x,y,on=false,value=12){c.fillStyle=C.paper;c.fillRect(x-48,y-43,96,53);line(c,[[x,y-108],[x,y-35]]);line(c,[[x-43,y-35],[x+43,y-35]],C.ink,7);line(c,[[x-26,y+2],[x+26,y+2]],C.ink,7);line(c,[[x,y+2],[x,y+110]]);txt(c,'+',x-80,y-25,34,C.red,700);txt(c,'−',x-76,y+17,34);txt(c,`${value} V`,x-68,y+72,35,C.ink,700,'right');txt(c,on?'ON':'OFF',x-68,y+108,25,on?C.teal:C.grey,700,'right')}
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
export function meter(c,x,y,scale,t,{mode='dc',reading='12.00',unit='V',jack='v',rotate=true,highlight=null}={}){
 c.save();c.translate(x,y);c.scale(scale,scale);
 box(c,12,17,340,586,51,'#d5c8aa');box(c,0,0,340,586,48,C.gold,C.ink,6);
 shape(c,q=>{q.moveTo(306,30);q.quadraticCurveTo(334,44,332,95);q.lineTo(327,533);q.quadraticCurveTo(321,573,288,576);q.lineTo(286,41);q.closePath()},'#d69e28',null);
 box(c,20,22,300,537,31,'#273844',C.ink,4);
 txt(c,'SJÖSKOLAN',170,59,22,C.white,700,'center');
 box(c,35,83,270,132,12,'#0a1b25');box(c,44,94,252,109,6,C.lcd);
 txt(c,mode==='dc'?'DC':mode==='ac'?'AC':mode==='current'?'DC':mode==='off'?'OFF':'',57,116,14,'#324436',700);
 txt(c,mode==='off'?'':reading,279,173,46,'#1c312a',500,'right');txt(c,mode==='off'?'':unit,278,194,16,'#324436',700,'right');
 const labs=['OFF','V DC','V ~','Ω','BEEP','A DC'], modes=['off','dc','ac','ohm','continuity','current'];
 const angles=[-120,-72,-24,24,72,120]; const mi=modes.indexOf(mode);
 angles.forEach((a,i)=>{let q=a*Math.PI/180;let lx=170+Math.sin(q)*121,ly=356-Math.cos(q)*121;txt(c,labs[i],lx,ly+8,(i===4||i===1||i===5)?17:22,i===mi?C.gold:C.white,700,'center');line(c,[[170+Math.sin(q)*96,356-Math.cos(q)*96],[170+Math.sin(q)*106,356-Math.cos(q)*106]],i===mi?C.gold:'#bdc4c8',3)});
 disc(c,170,356,86,'#0b1923','#4c5c66',4);disc(c,170,356,75,'#30434f','#070f17',4);
 const a=(rotate?(-120+(angles[Math.max(0,mi)]+120)*ease(t/1.4)):angles[Math.max(0,mi)])*Math.PI/180;
 c.save();c.translate(170,356);c.rotate(a);box(c,-24,-73,48,141,14,'#172731','#07131c',4);line(c,[[-9,-46],[0,-64],[9,-46]],C.gold,6);for(let yy=-17;yy<=40;yy+=12)line(c,[[-13,yy],[13,yy]],'#5d707a',3);c.restore();
 const jx=[58,131,207,282], jl=['10 A','mA','COM','VΩ'];
 jx.forEach((q,i)=>{disc(c,q,492,23,'#070f18',i===2?'#b8c1c8':C.red,4);disc(c,q,492,10,'#354047',null);txt(c,jl[i],q,458,19,i===2?C.white:C.gold,700,'center')});
 [2,jack==='a'?0:jack==='ma'?1:3].forEach((i,k)=>{disc(c,jx[i],492,15,k?C.red:'#10171c',k?'#ff8577':'#73808a',3);line(c,[[jx[i],495],[jx[i],563]],k?C.red:'#111f2c',13)});
 if(highlight){const target=highlight==='jack'?[jx[jack==='a'?0:jack==='ma'?1:3],492,33]:[170,356,94];c.save();c.globalAlpha=.55+.3*Math.sin(t*5);c.setLineDash([12,8]);disc(c,target[0],target[1],target[2],'rgba(0,0,0,0)',C.gold,5);c.restore()}
 txt(c,'TEACHING MODEL',170,574,13,C.ink,700,'center');c.restore();
 return {black:[x+207*scale,y+563*scale],red:[x+(jack==='a'?58:jack==='ma'?131:282)*scale,y+563*scale]};
}
export function drawCaptions(c,captions,time,scale=1){
 const cue=captions.find(q=>time>=q.start&&time<q.end);c.save();c.setTransform(scale,0,0,scale,0,0);c.fillStyle=C.ink;c.fillRect(0,944,W,136);
 if(cue){const lines=wrap(c,cue.text,128,996,1664,33,C.white,500,1.33);}
 c.restore();
}
