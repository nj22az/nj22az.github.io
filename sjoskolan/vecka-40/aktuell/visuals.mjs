// Exakta undervisningsdiagram. Normaliserade kurvor jämför tid, inte olika enheters amplituder.
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const C={blue:'#064f91',orange:'#a94d0a',ink:'#163248',line:'#cad8e2',green:'#176844'};
const line=(x1,y1,x2,y2,color=C.line)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.5"/>`;
const text=(x,y,s,anchor='start',color=C.ink,size=14)=>`<text x="${x}" y="${y}" fill="${color}" text-anchor="${anchor}" font-family="Arial,sans-serif" font-size="${size}">${esc(s).replace(/_\{([^{}]*)\}/g,'<tspan baseline-shift="sub" font-size="75%">$1</tspan>')}</text>`;
export function visual(kind,width=760,progress=1){
 const w=Math.max(280,Math.min(1000,width)),h=kind==='meters'?220:270;
 const title={wave:'Fartygets huvudnät, 440 volt RMS och 60 hertz',period:'En period vid 60 hertz tar 16,7 millisekunder',peak:'440 volt RMS har toppen 622 volt',rms:'Multimetern visar effektivvärdet 440 volt, toppen är 622 volt',calibration:'För en ren sinus visar båda mätartyperna kalibratorns effektivvärde',resistor:'Ström och spänning är i fas',rl:'Strömmen släpar efter spänningen i RL-kretsen',triangle:'Impedanstriangel för en fläktmotor: resistansen R 50 ohm, spolens reaktans X L 120 ohm och impedansen Z 130 ohm',power:'Samma aktiva effekt kräver större ström vid lägre effektfaktor',powerTriangle:'Effekttriangel för sinusformad last',meters:'Sinuskalibrerad mätare jämförd med 10 volt true RMS',radianer:'Ett helt varv är 360 grader eller 2 pi radianer. En radian är ungefär 57 grader.'}[kind]||'Undervisningsdiagram';
 let b='';
 if(kind==='radianer'){
  // Hjul med radien 1: kanten som rullats är vinkeln i radianer. Till höger samma varv som tallinje.
  const r=Math.min(h*0.33,w*0.14),cx=16+r+74,cy=h/2+6,P=(v,rr=r)=>[cx+rr*Math.cos(v),cy-rr*Math.sin(v)];
  b+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.ink}" stroke-width="2"/>`;
  const a=Math.min(1,progress<1?progress*2*Math.PI:1),[x1,y1]=P(a);
  b+=`<path d="M${cx+r},${cy} A${r},${r} 0 0 0 ${x1.toFixed(1)},${y1.toFixed(1)}" fill="none" stroke="${C.orange}" stroke-width="7" stroke-linecap="round"/>`;
  b+=line(cx,cy,cx+r,cy,C.blue)+line(cx,cy,x1,y1,C.blue)+`<circle cx="${cx}" cy="${cy}" r="3" fill="${C.ink}"/>`;
  b+=text(cx+r/2,cy+16,'r = 1','middle',C.blue,12);
  if(progress>=1)b+=text(cx+r+8,cy-r*0.55,'1 rad ≈ 57°','start',C.orange,13);
  [[Math.PI/2,'90° = π/2'],[Math.PI,'180° = π'],[3*Math.PI/2,'270° = 3π/2']].forEach(([v,t])=>{const [x,y]=P(v,r+14);b+=text(x,y+4,t,v===Math.PI?'end':'middle',C.ink,12);});
  const x0=cx+r+104,x2=w-46,y=cy,X=v=>x0+v/(2*Math.PI)*(x2-x0);
  if(x2-x0>120){
   b+=line(x0,y,x2,y,C.ink)+text(x0,y-44,'Ett helt varv rullat ut','start',C.ink,13);
   [[0,'0','0°'],[Math.PI/2,'π/2','90°'],[Math.PI,'π','180°'],[3*Math.PI/2,'3π/2','270°'],[2*Math.PI,'2π ≈ 6,28','360°']].forEach(([v,t,g])=>{b+=line(X(v),y-6,X(v),y+6,C.ink)+text(X(v),y-12,t,'middle',C.blue,12)+text(X(v),y+22,g,'middle',C.muted||'#4d6579',12);});
   b+=`<path d="M${x0},${y} L${X(1).toFixed(1)},${y}" stroke="${C.orange}" stroke-width="7" stroke-linecap="round"/>`+text(X(0.5),y+40,'1 rad','middle',C.orange,12);
  }
 }else if(['calibration','meters','power','rms'].includes(kind)){
  const rows=kind==='calibration'?[['True RMS','= U'],['Sinuskalibrerad','= U']]:kind==='meters'?[['Sinus','10,00 V'],['Fyrkant','11,11 V'],['Triangel','9,62 V']]:kind==='rms'?[['Multimeter, true RMS','440 V'],['Kurvans topp','622 V']]:[['PF = 1,00','6,00 A'],['PF = 0,50','12,00 A']];
  const y0=kind==='meters'?46:72;
  b+=text(12,22,kind==='power'?'Pumpmotor: 230 V RMS, P = 1 380 W':kind==='meters'?'10,00 V RMS. Sinuskalibrerad visning:':kind==='calibration'?'Kalibrator: ren sinus med effektivvärdet U':'Fartygets huvudnät, 440 V','start',C.ink,w<420?12:15);
  rows.forEach((row,i)=>{const y=y0+i*57;b+=line(12,y+34,w-12,y+34)+text(14,y+21,row[0],'start',C.ink,w<420?13:16)+text(w-14,y+21,row[1],'end',C.blue,w<420?21:27);});
  if(kind==='power')b+=text(12,235,'U och P hålls oförändrade.');
 }else if(kind==='triangle'||kind==='powerTriangle'){
  const a=kind==='triangle'?50:1380,hojd=kind==='triangle'?120:Math.sqrt(2760**2-1380**2),scale=Math.min((w-105)/a,145/hojd),ox=(w-a*scale)/2,oy=210,rx=ox+a*scale,ry=oy-hojd*scale;
  b+=line(ox,oy,rx,oy,C.ink)+line(rx,oy,rx,ry,C.orange)+`<path d="M${ox},${oy} L${rx},${ry}" fill="none" stroke="${C.blue}" stroke-width="3"/>`;
  b+=text((ox+rx)/2,238,kind==='triangle'?'R = 50 Ω':'P = 1 380 W','middle')+text(rx-4,ry-15,kind==='triangle'?'X_{L} ≈ 120 Ω':'Q ≈ 2 390 var','end',C.orange)+text(ox,55,kind==='triangle'?'|Z| ≈ 130 Ω':'S = 2 760 VA','start',C.blue,20);
 }else{
  const TP=1000/60,SPAN=2*TP,left=46,right=16,top=42,bottom=42,X=t=>left+t/SPAN*(w-left-right),Y=v=>top+(1-v)/2*(h-top-bottom);
  [0,10,20,30].forEach(t=>{b+=line(X(t),top,X(t),h-bottom)+text(X(t),h-bottom+20,String(t),t===0?'start':'middle',C.ink,12);});
  [-1,0,1].forEach(v=>{b+=line(left,Y(v),w-right,Y(v))+text(left-7,Y(v)+4,kind==='resistor'||kind==='rl'?(v===0?'0':v===1?'+1':'−1'):(v===0?'0':v===1?'622':'−622'),'end',C.ink,11);});
  b+=text(left,18,kind==='resistor'||kind==='rl'?'Normaliserad amplitud':'Spänning (V)','start',C.ink,12)+text(w-right,h-3,'Tid (ms)','end',C.ink,12);
  const path=(shift,color,dash='')=>{let d='';for(let n=0;n<=240;n++){const t=SPAN*n/240;d+=(n?'L':'M')+X(t).toFixed(2)+','+Y(Math.sin(2*Math.PI*t/TP-shift)).toFixed(2);}return `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.6"${dash?` stroke-dasharray="${dash}"`:''}/>`;};
  b+=path(0,C.blue);if(kind==='resistor'||kind==='rl'){b+=path(kind==='rl'?Math.atan(120/50):0,C.orange,'7 5');b+=text(left,34,'u: hel linje   i: streckad','start',C.ink,12);}
  if(kind==='period'){b+=line(X(0),Y(0)+26,X(TP),Y(0)+26,C.green)+text(X(TP/2),Y(0)+48,'T ≈ 16,7 ms','middle',C.green,14);}
  if(kind==='peak')b+=text(X(TP/4)+8,top-7,'û ≈ 622 V','start',C.blue,14);
  if(progress<1){const t=SPAN*Math.max(0,progress);b+=`<circle cx="${X(t)}" cy="${Y(Math.sin(2*Math.PI*t/TP))}" r="5" fill="${C.green}"/>`;}
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title><rect width="${w}" height="${h}" fill="white"/>${b}</svg>`;
}
