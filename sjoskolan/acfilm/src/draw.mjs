/** Week 40: deterministic educational diagrams and recurring Sjöskolan mascots.
 * Wave traces and phasors use the same phase convention: phi = phase(U)-phase(I).
 * Animation is deliberately slowed; plotted time axes retain physical units.
 */
import {W,H,C,txt,wrap,box,line,arrow,sailor,gull,meter,ease,clamp} from './art.mjs';
export function drawCaptions(c,captions,time,scale=1){
 const cue=captions.find(q=>time>=q.start&&time<q.end);c.save();c.setTransform(scale,0,0,scale,0,0);c.fillStyle=C.ink;c.fillRect(0,944,W,136);
 if(cue){let size=33,lines=[];do{c.font=`500 ${size}px "Film Sans"`;lines=[];let row='';for(const w of cue.text.split(/\s+/)){const n=row?row+' '+w:w;if(c.measureText(n).width>1664&&row){lines.push(row);row=w;}else row=n;}if(row)lines.push(row);if(lines.length<=2)break;size--;}while(size>24);lines.forEach((l,i)=>txt(c,l,128,996+i*43,size,C.white,500));}c.restore();
}
const TAU=2*Math.PI;
const dot=(c,x,y,r=7,col=C.blue)=>{c.beginPath();c.arc(x,y,r,0,TAU);c.fillStyle=col;c.fill();};
const circle=(c,x,y,r,col=C.grey,w=3)=>{c.beginPath();c.arc(x,y,r,0,TAU);c.strokeStyle=col;c.lineWidth=w;c.stroke();};
function label(c,text,x,y,size=30,color=C.ink,weight=500){txt(c,text,x,y,size,color,weight);}
function panel(c,x,y,w,h){box(c,x,y,w,h,22,C.white,'#d9d9cf',2);}
function formula(c,str,y=800){let size=37;c.font=`700 ${size}px "Film Sans"`;while(c.measureText(str).width>1570&&size>24){size--;c.font=`700 ${size}px "Film Sans"`;}label(c,str,170,y,size,C.blue,700);}
function dashed(c,points,color=C.grey){c.save();c.setLineDash([10,9]);line(c,points,color,2);c.restore();}
function base(c,s,t){
 c.fillStyle=C.paper;c.fillRect(0,0,W,H);
 label(c,'SJÖSKOLAN',82,61,24,C.blue,700);txt(c,'ALTERNATING CURRENT ABOARD',1838,61,22,C.grey,500,'right');
 line(c,[[82,87],[1838,87]],'#d9cfbd',2);
 label(c,`0${s.chapter+1}  /  ${s.chapterName.toUpperCase()}`,84,136,22,C.teal,700);
 let size=57;c.font=`700 ${size}px "Film Sans"`;while(c.measureText(s.title).width>1730&&size>40){size--;c.font=`700 ${size}px "Film Sans"`;}label(c,s.title,82,212,size,C.ink,700);
 let ks=30;c.font=`700 ${ks}px "Film Sans"`;while(c.measureText(s.key).width>1750&&ks>22){ks--;c.font=`700 ${ks}px "Film Sans"`;}label(c,s.key,84,886,ks,C.blue,700);
 txt(c,`Lesson ${s.chapter+1} · PowerPoint ${s.slides[0]}${s.slides.length>1?'–'+s.slides.at(-1):''}`,1836,925,20,C.grey,400,'right');
 line(c,[[84,918],[84+1000*clamp(t/s.duration),918]],C.gold,5);
}
function axes(c,{x=180,y=330,w=1240,h=380,cycles=1,period=20,unit='V',ticks=true}={}){
 const mid=y+h/2,amp=h*.42;
 for(let j=0;j<=4*cycles;j++){let xx=x+w*j/(4*cycles);line(c,[[xx,y],[xx,y+h]],'#e0e5e3',2);if(ticks)txt(c,(period*j/4).toFixed(period===20?0:1),xx,y+h+33,22,C.grey,400,'center');}
 for(let k=-1;k<=1;k++)line(c,[[x,mid+k*amp],[x+w,mid+k*amp]],'#e0e5e3',2);
 arrow(c,x,mid,x+w+24,mid,C.grey,3);arrow(c,x,y+h,x,y-18,C.grey,3);
 label(c,unit,x-40,y-30,23,C.grey);if(ticks)label(c,'time (ms)',x+w-88,y+h+65,23,C.grey);
 return {x,y,w,h,mid,amp,cycles};
}
function trace(c,p,fn,color=C.blue,width=6){const pts=[];for(let j=0;j<=400;j++){let q=j/400;pts.push([p.x+p.w*q,p.mid-p.amp*fn(q)]);}line(c,pts,color,width);}
function moving(c,p,fn,t,color=C.gold){const q=(t*.12)%1;const x=p.x+p.w*q,y=p.mid-p.amp*fn(q);dashed(c,[[x,p.y],[x,p.y+p.h]],'#c1b59a');dot(c,x,y,11,color);}
function sine(c,s,t){
 panel(c,125,278,1470,535);const p=axes(c,{w:1280,h:335,y:350});trace(c,p,q=>Math.sin(TAU*q));moving(c,p,q=>Math.sin(TAU*q),t);
 if(['values','mains'].includes(s.wave)){
  dashed(c,[[p.x,p.mid-p.amp],[p.x+p.w,p.mid-p.amp]],C.red);dashed(c,[[p.x,p.mid+p.amp],[p.x+p.w,p.mid+p.amp]],C.red);
  label(c,s.wave==='mains'?'+325 V':'+û',180,324,26,C.red,700);label(c,s.wave==='mains'?'−325 V':'−û',1450,708,24,C.red,700);
  arrow(c,1490,p.mid-p.amp,1490,p.mid+p.amp,C.teal,4);label(c,'U_{pp}',1500,p.mid+8,24,C.teal,700);
  if(s.wave==='mains'){dashed(c,[[p.x,p.mid-p.amp/Math.sqrt(2)],[p.x+p.w,p.mid-p.amp/Math.sqrt(2)]],C.teal);label(c,'230 V RMS',760,396,26,C.teal,700);}
 }else if(s.wave==='mean'){
  for(let q=0;q<1;q+=.01){c.globalAlpha=.23;line(c,[[p.x+p.w*q,p.mid],[p.x+p.w*q,p.mid-p.amp*Math.sin(TAU*q)]],q<.5?C.blue:C.red,12);}c.globalAlpha=1;
  label(c,'Positive area',355,321,28,C.blue,700);label(c,'Negative area',1000,321,28,C.red,700);
 }else if(s.wave==='period'){
  arrow(c,190,309,1440,309,C.teal,4);label(c,'one complete cycle = 20 ms',550,302,28,C.teal,700);
 }else label(c,'50 Hz · motion slowed for explanation',850,321,23,C.grey);
 formula(c,s.formula,789);sailor(c,1730,801,.6,t,true);gull(c,1640,817,.34,t);
}
function phasor(c,phi,t,x=410,y=512,r=166){
 circle(c,x,y,r,'#d6dfdf',2);line(c,[[x-r-30,y],[x+r+30,y]],'#c4cecf',2);line(c,[[x,y-r-30],[x,y+r+30]],'#c4cecf',2);
 const theta=t*TAU*.12;arrow(c,x,y,x+r*Math.cos(theta),y-r*Math.sin(theta),C.blue,7);arrow(c,x,y,x+r*.78*Math.cos(theta-phi),y-r*.78*Math.sin(theta-phi),C.red,7);
 label(c,'Voltage U',x-145,y+r+75,27,C.blue,700);label(c,'Current I',x+35,y+r+75,27,C.red,700);label(c,'Rotating reference arrows',x-170,y-r-50,26,C.grey);
}
function phasePlot(c,s,t){
 const phi=s.phase||0;panel(c,123,275,560,536);panel(c,710,275,1087,536);phasor(c,phi,t);
 const p=axes(c,{x:772,y:382,w:930,h:288,cycles:1,unit:''});
 trace(c,p,q=>Math.sin(TAU*q),C.blue);trace(c,p,q=>.73*Math.sin(TAU*q-phi),C.red);moving(c,p,q=>Math.sin(TAU*q),t,C.blue);
 label(c,phi===0?'Peaks occur together':phi>0?'Voltage first → current later':'Current first → voltage later',820,318,28,C.ink,700);
 if(s.visual==='phase'){label(c,'Δt = 5 ms  /  T = 20 ms  =  ¼ cycle',820,787,28,C.teal,700);}else{label(c,s.formula,810,787,34,C.blue,700);}
 label(c,'Separate amplitude scales; compare timing.',785,742,22,C.grey);
}
function triangle(c,s,t){
 panel(c,126,275,1470,552);
 const a=s.a,b=s.b;const scale=400/Math.max(a,Math.abs(b));const x=365,y=b<0?350:680,dx=a*scale,dy=-b*scale;
 arrow(c,x,y,x+dx,y,C.blue,7);arrow(c,x+dx,y,x+dx,y+dy,C.red,7);arrow(c,x,y,x+dx,y+dy,C.teal,9);
 dashed(c,[[x+dx,y],[x+dx-22,y],[x+dx-22,y+(b<0?22:-22)],[x+dx,y+(b<0?22:-22)]],C.grey);
 label(c,s.labels[0],x+20,y+(b<0?-28:53),31,C.blue,700);
 label(c,s.labels[1],x+dx+26,y+dy*.5,31,C.red,700);
 c.save();c.translate(x+dx*.5-33,y+dy*.5-25);c.rotate(Math.atan2(dy,dx));label(c,s.labels[2],-55,0,32,C.teal,700);c.restore();
 c.beginPath();c.arc(x,y,100,b<0?0:Math.atan2(dy,dx),b<0?Math.atan2(dy,dx):0);c.strokeStyle=C.gold;c.lineWidth=5;c.stroke();label(c,'φ',x+120,y+(b<0?45:-40),35,C.ink,700);
 label(c,s.triangle==='power'?'POWER':s.triangle==='voltage'?'VOLTAGE':'IMPEDANCE',1140,369,26,C.grey,700);
 wrap(c,s.triangle==='power'?'Sinusoidal conditions':s.triangle==='capacitive'?'Negative X: current leads voltage':s.triangle==='voltage'?'Add voltage vectors':'Positive X: current lags voltage',1120,428,400,32,C.ink,500,1.45);
 if(s.triangle!=='power')label(c,'Reference: current →',1120,649,28,C.grey);
 formula(c,s.formula,801);sailor(c,1720,800,.66,t,true);
}
function calculation(c,s,t){
 panel(c,126,274,1470,548);label(c,s.given,177,348,33,C.grey,700);
 const hidden=s.visual==='question'&&t<(s.answerTime??999);
 if(hidden){
  label(c,'PAUSE & CALCULATE',180,476,46,C.blue,700);
  wrap(c,'Write the relationship, substitute values and check the units.',180,550,1100,36,C.ink,400);
  label(c,'Continue when you have your answer.',180,701,30,C.teal,700);
 }else s.steps.forEach((v,i)=>{
  const at=s.stepTimes?.[i]??(1.5+i*2);const alpha=ease((t-at)/.55);c.save();c.globalAlpha=alpha;
  box(c,170,398+i*119,62,62,31,i===s.steps.length-1?C.teal:C.blue);txt(c,String(i+1),201,440+i*119,30,C.white,700,'center');
  let size=39;c.font=`700 ${size}px "Film Sans"`;while(c.measureText(v).width>1275&&size>24){size--;c.font=`700 ${size}px "Film Sans"`;}label(c,v,263,442+i*119,size,i===s.steps.length-1?C.teal:C.ink,700);c.restore();
 });
 sailor(c,1730,810,.75,t,true);gull(c,1630,825,.45,t);
}
function resistor(c,x,y,w=100){line(c,[[x-40,y],[x,y]]);box(c,x,y-23,w,46,2,C.white,C.ink,5);line(c,[[x+w,y],[x+w+40,y]]);}
function capacitor(c,x,y){line(c,[[x-75,y],[x-15,y]]);line(c,[[x-15,y-48],[x-15,y+48]]);line(c,[[x+15,y-48],[x+15,y+48]]);line(c,[[x+15,y],[x+75,y]]);}
function coil(c,x,y){line(c,[[x-85,y],[x-60,y]]);c.beginPath();c.moveTo(x-60,y);for(let i=0;i<4;i++)c.arc(x-45+i*30,y,15,Math.PI,0);c.strokeStyle=C.ink;c.lineWidth=5;c.stroke();line(c,[[x+60,y],[x+85,y]]);}
function components(c,s,t){
 const xs=[150,716,1282],titles=['RESISTOR','INDUCTOR','CAPACITOR'],symbols=['R  /  Ω','L  /  H','C  /  F'];
 xs.forEach((x,i)=>{panel(c,x,294,489,469);label(c,titles[i],x+42,361,31,C.blue,700);if(i===0)resistor(c,x+196,457);if(i===1)coil(c,x+245,457);if(i===2)capacitor(c,x+245,457);label(c,symbols[i],x+43,565,40,C.ink,700);wrap(c,['Converts energy to heat','Stores magnetic energy','Stores electric energy'][i],x+43,632,400,29,C.grey);});
 formula(c,s.formula,815);
}
function rms(c,s,t){
 [150,885].forEach((x,i)=>{panel(c,x,292,675,510);label(c,i?'12 V RMS sine wave':'12 V DC',x+40,352,36,C.blue,700);resistor(c,x+275,548);label(c,'24 Ω',x+270,499,29,C.grey);const heat=.65+.15*Math.sin(t*2);for(let k=0;k<5;k++){let xx=x+263+k*31;c.save();c.globalAlpha=heat;line(c,[[xx,607],[xx-8,625],[xx+8,645],[xx,668]],C.red,5);c.restore();}label(c,'Average heating: 6 W',x+73,748,35,C.teal,700);
 const p={x:x+55,w:560,mid:418,amp:30};trace(c,p,q=>i?Math.sin(TAU*q*2):.71,C.blue,4);});
 sailor(c,1740,810,.6,t);formula(c,'P = U²/R = 12²/24 = 6 W',836);
}
function square(c,s,t){
 [140,950].forEach((x,i)=>{panel(c,x,295,765,484);label(c,i?'SYMMETRIC SQUARE WAVE':'SINE WAVE',x+38,354,28,C.blue,700);const p=axes(c,{x:x+70,y:405,w:610,h:246,ticks:false});trace(c,p,q=>i?(q<.5?1:-1):Math.sin(TAU*q),i?C.red:C.blue);label(c,'+12 V',x+19,406,22,C.grey);label(c,'−12 V',x+19,676,22,C.grey);label(c,'Mean = 0 V',x+260,740,30,C.teal,700);});formula(c,s.formula,831);
}
function frequency(c,s,t){
 panel(c,126,280,1465,547);const x=236,y=707,w=1000,h=345;
 arrow(c,x,y,x+w+35,y,C.grey,3);arrow(c,x,y,x,y-h-30,C.grey,3);
 label(c,'Reactance magnitude (Ω)',183,320,28,C.grey);label(c,'Frequency (Hz)',1090,769,25,C.grey);
 const L=.1,cap=.0001,max=180,fmin=20,fmax=100,fx=f=>x+w*(f-fmin)/(fmax-fmin),fy=v=>y-h*v/max;
 [20,40,60,80,100].forEach(f=>{line(c,[[fx(f),y],[fx(f),y-h]],'#e0e5e3',2);txt(c,String(f),fx(f),y+32,23,C.grey,400,'center')});[0,50,100,150].forEach(v=>{line(c,[[x,fy(v)],[x+w,fy(v)]],'#e0e5e3',2);txt(c,String(v),x-17,fy(v)+8,23,C.grey,400,'right')});
 const plots=[[],[]];for(let i=0;i<=200;i++){let f=fmin+(fmax-fmin)*i/200;plots[0].push([fx(f),fy(TAU*f*L)]);plots[1].push([fx(f),fy(1/(TAU*f*cap))]);}line(c,plots[0],C.blue,6);line(c,plots[1],C.red,6);
 const f=20+80*(.5-.5*Math.cos(t*.22)),xl=TAU*f*L,xc=1/(TAU*f*cap);dashed(c,[[fx(f),y],[fx(f),y-h]],C.teal);dot(c,fx(f),fy(xl),10,C.blue);dot(c,fx(f),fy(xc),10,C.red);
 label(c,'X_{L}',1320,398,32,C.blue,700);label(c,'X_{C}',1320,451,32,C.red,700);label(c,'L = 0.10 H',1295,580,26,C.grey);label(c,'C = 100 μF',1295,623,26,C.grey);
 formula(c,`f = ${f.toFixed(0)} Hz     X_{L} = ${xl.toFixed(1)} Ω     X_{C} = ${xc.toFixed(1)} Ω`,805);sailor(c,1740,809,.6,t,true);
}
function resonance(c,s,t){
 panel(c,126,275,1470,550);const x=420,y=685;
 arrow(c,x,y,x+170,y,C.blue,8);arrow(c,x+170,y,x+170,y-340,C.red,8);arrow(c,x+235,y-340,x+235,y,C.teal,8);
 label(c,'U_{R} = U = 100 V',x-110,y+54,33,C.blue,700);label(c,'U_{L} = +j200 V',x+80,315,30,C.red,700);label(c,'U_{C} = −j200 V',x+310,443,30,C.teal,700);
 label(c,'R = 20 Ω',1150,566,30,C.ink,700);label(c,'X_{L} = X_{C} = 40 Ω',1150,621,30,C.ink,700);label(c,'I = 5 A RMS',1150,680,33,C.teal,700);
 label(c,'Opposing reactive voltages',997,756,27,C.grey);formula(c,s.formula,807);gull(c,1740,800,.8,t);
}
function power(c,s,t){
 panel(c,127,280,1470,545);const phi=Math.acos(.8),p=axes(c,{x:222,y:405,w:1190,h:265,unit:s.mode==='active'?'power (W)':'relative amplitude',ticks:true});
 if(s.mode==='active'){
  // Product of peak-scaled sinusoidal U and I, divided by S. Mean is cos(phi).
  const fn=q=>2*Math.sin(TAU*q)*Math.sin(TAU*q-phi)/2;
  trace(c,p,fn,C.teal,6);dashed(c,[[p.x,p.mid-p.amp*.4],[p.x+p.w,p.mid-p.amp*.4]],C.blue);
  label(c,'Average P = 1,840 W',924,392,30,C.blue,700);label(c,'p(t) = u(t) × i(t)',244,330,30,C.teal,700);
  label(c,'0',180,p.mid+8,22,C.grey);label(c,'4,600',140,p.mid-p.amp+8,22,C.grey);label(c,'−4,600',130,p.mid+p.amp+8,22,C.grey);
 }else{trace(c,p,q=>Math.sin(TAU*q),C.blue);trace(c,p,q=>.75*Math.sin(TAU*q-phi),C.red);label(c,'U = 230 V RMS',220,330,29,C.blue,700);label(c,'I = 10 A RMS',800,330,29,C.red,700);label(c,'Timing comparison · separate amplitude scales',440,748,25,C.grey);}
 formula(c,s.formula,805);sailor(c,1740,810,.6,t,true);
}
function energy(c,s,t){
 panel(c,129,279,1465,545);box(c,214,360,360,236,24,C.light,C.ink,4);label(c,'AC SOURCE',274,435,36,C.blue,700);label(c,'Energy supplied',248,526,28,C.grey);
 box(c,1118,360,360,236,24,C.mint,C.ink,4);coil(c,1300,440);label(c,'Magnetic field',1180,545,28,C.teal,700);
 const theta=t*.8,stored=Math.sin(theta)**2,incoming=Math.sin(2*theta)>=0;
 arrow(c,incoming?630:1060,475,incoming?1060:630,475,incoming?C.blue:C.teal,8);
 const q=(t*.7)%1;dot(c,incoming?630+q*430:1060-q*430,475,15,C.gold);
 label(c,incoming?'STORING ENERGY':'RETURNING ENERGY',645,388,28,C.ink,700);
 box(c,1118,639,360,35,8,C.light);box(c,1118,639,360*stored,35,8,C.teal);label(c,'Stored energy (relative)',1124,718,25,C.grey);
 label(c,'Ideal inductor: net energy per cycle = 0',229,744,29,C.grey);formula(c,s.formula,805);gull(c,1730,805,.7,t);
}
function correction(c,s,t){
 panel(c,129,280,1470,545);const k=ease((t-(s.revealTime||6))/6),P=3,Q=4*(1-k),S=Math.hypot(P,Q),x=348,y=672,unit=88;
 arrow(c,x,y,x+P*unit,y,C.blue,7);if(Q>.03)arrow(c,x+P*unit,y,x+P*unit,y-Q*unit,C.red,7);arrow(c,x,y,x+P*unit,y-Q*unit,C.teal,8);
 label(c,'P = 3 kW (unchanged)',235,735,33,C.blue,700);label(c,`Supply S = ${S.toFixed(2)} kVA`,875,358,34,C.teal,700);label(c,`Supply Q = +${Q.toFixed(2)} kvar`,875,426,32,C.red,700);
 capacitor(c,1080,551);label(c,`Capacitor Q_{C} = −${(4*k).toFixed(2)} kvar`,883,661,30,C.ink,700);
 formula(c,s.formula,805);sailor(c,1740,810,.63,t,true);
}
function loss(c,s,t){
 panel(c,127,279,1468,545);const y=718,hh=300;
 box(c,315,y-hh,280,hh,8,C.red);box(c,934,y-hh/4,280,hh/4,8,C.teal);
 label(c,'10 A',405,371,40,C.ink,700);label(c,'5 A',1038,371,40,C.ink,700);
 label(c,'100% cable loss',301,771,30,C.red,700);label(c,'25% remains',930,771,30,C.teal,700);
 label(c,'Same cable resistance',599,319,30,C.grey);formula(c,s.formula,819);gull(c,1750,805,.85,t);
}
function harmonics(c,s,t){
 panel(c,127,279,1468,543);const p=axes(c,{x:207,y:399,w:1190,h:280,unit:'relative amplitude'});
 trace(c,p,q=>Math.sin(TAU*q),C.blue);const phi=Math.acos(.95);trace(c,p,q=>(Math.sin(TAU*q-phi)+.42*Math.sin(3*TAU*q-phi))*.68,C.red);
 label(c,'Voltage: sine wave',210,323,28,C.blue,700);label(c,'Current: distorted',811,323,28,C.red,700);label(c,'Illustrative waveform, not a fit to the meter readings below.',291,747,25,C.grey);formula(c,s.formula,805);sailor(c,1740,810,.62,t,true);
}
function bookends(c,s,t){
 if(s.visual==='intro'){
  panel(c,127,286,1105,514);label(c,'WEEK 40',180,362,27,C.teal,700);
  ['01   Follow the waveform','02   Understand impedance','03   Explain AC power'].forEach((v,i)=>label(c,v,183,458+i*113,43,C.ink,700));
  circle(c,1462,416,190,'#d7decb',4);sailor(c,1475,824,1.42,t,true);gull(c,1720,826,.94,t);
 }else{
  panel(c,128,286,1300,513);(s.steps||[]).forEach((v,i)=>{box(c,177,344+i*127,65,65,32,C.blue);txt(c,String(i+1),209,390+i*127,32,C.white,700,'center');wrap(c,v,284,390+i*127,1070,37,C.ink,700);});sailor(c,1635,813,1.03,t,true);gull(c,1780,817,.55,t);
 }
}
export function drawScene(c,s,t,env){
 c.setTransform(env.scale,0,0,env.scale,0,0);base(c,s,t);
 switch(s.visual){
 case 'intro':case 'outro':case 'recap':bookends(c,s,t);break;
 case 'wave':sine(c,s,t);break;
 case 'phase':case 'component':phasePlot(c,s,t);break;
 case 'calculation':case 'question':calculation(c,s,t);break;
 case 'components':components(c,s,t);break;
 case 'rms':rms(c,s,t);break;
 case 'square':square(c,s,t);break;
 case 'triangle':triangle(c,s,t);break;
 case 'frequency':frequency(c,s,t);break;
 case 'resonance':resonance(c,s,t);break;
 case 'power':power(c,s,t);break;
 case 'energy':energy(c,s,t);break;
 case 'correction':correction(c,s,t);break;
 case 'loss':loss(c,s,t);break;
 case 'harmonics':harmonics(c,s,t);break;
 default:throw Error(`Unknown visual ${s.visual}`);
 }
}
