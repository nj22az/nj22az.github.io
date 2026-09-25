// Exakta undervisningsdiagram. Normaliserade kurvor jämför tid, inte olika enheters amplituder.
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const C={blue:'#064f91',orange:'#a94d0a',ink:'#163248',line:'#cad8e2',green:'#176844'};
const line=(x1,y1,x2,y2,color=C.line)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="1.5"/>`;
const text=(x,y,s,anchor='start',color=C.ink,size=14)=>`<text x="${x}" y="${y}" fill="${color}" text-anchor="${anchor}" font-family="Arial,sans-serif" font-size="${size}">${esc(s)}</text>`;
export function visual(kind,width=760,progress=1){
 const w=Math.max(280,Math.min(1000,width)),h=kind==='meters'?220:270;
 const title={wave:'Sinus, 12 volt RMS och 50 hertz',period:'En period tar 20 millisekunder',peak:'Sinusens topp är 16,97 volt',rms:'Multimetern visar 12 volt RMS',calibration:'Båda ideala mätarna visar 10 volt för kalibratorns sinus',resistor:'Ström och spänning är i fas',rl:'Strömmen släpar efter spänningen i RL-kretsen',triangle:'Impedanstriangel: R 40 ohm, XL 30 ohm och Z 50 ohm',power:'Samma aktiva effekt kräver större ström vid lägre effektfaktor',powerTriangle:'Effekttriangel för sinusformad last',meters:'Sinuskalibrerad mätare jämförd med 12 volt true RMS'}[kind]||'Undervisningsdiagram';
 let b='';
 if(['calibration','meters','power','rms'].includes(kind)){
  const rows=kind==='calibration'?[['True RMS','10,00 V'],['Sinuskalibrerad','10,00 V']]:kind==='meters'?[['Sinus','12,00 V'],['Fyrkant','13,33 V'],['Triangel','11,54 V']]:kind==='rms'?[['Multimeter, true RMS','12,00 V'],['Kurvans topp','16,97 V']]:[['PF = 1,00','5,00 A'],['PF = 0,50','10,00 A']];
  const y0=kind==='meters'?46:72;
  b+=text(12,22,kind==='power'?'Enfas: 230 V RMS, P = 1 150 W':kind==='meters'?'12,00 V RMS. Sinuskalibrerad visning:':kind==='calibration'?'Kalibrator: 10,00 V sinus, 50 Hz':'En sinus, olika mätstorheter','start',C.ink,w<420?12:15);
  rows.forEach((row,i)=>{const y=y0+i*57;b+=line(12,y+34,w-12,y+34)+text(14,y+21,row[0],'start',C.ink,w<420?13:16)+text(w-14,y+21,row[1],'end',C.blue,w<420?21:27);});
  if(kind==='power')b+=text(12,235,'U och P hålls oförändrade.');
 }else if(kind==='triangle'||kind==='powerTriangle'){
  const a=kind==='triangle'?40:1150,b=kind==='triangle'?30:Math.sqrt(2300**2-1150**2),scale=Math.min((w-105)/a,145/b),ox=(w-a*scale)/2,oy=210,rx=ox+a*scale,ry=oy-b*scale;
  b+=line(ox,oy,rx,oy,C.ink)+line(rx,oy,rx,ry,C.orange)+`<path d="M${ox},${oy} L${rx},${ry}" fill="none" stroke="${C.blue}" stroke-width="3"/>`;
  b+=text((ox+rx)/2,238,kind==='triangle'?'R = 40 Ω':'P = 1 150 W','middle')+text(rx-4,ry-15,kind==='triangle'?'XL ≈ 30 Ω':'Q ≈ 1 992 var','end',C.orange)+text(ox,55,kind==='triangle'?'|Z| ≈ 50 Ω':'S = 2 300 VA','start',C.blue,20);
 }else{
  const left=46,right=16,top=42,bottom=42,X=t=>left+t/40*(w-left-right),Y=v=>top+(1-v)/2*(h-top-bottom);
  [0,20,40].forEach(t=>{b+=line(X(t),top,X(t),h-bottom)+text(X(t),h-bottom+20,String(t),t===0?'start':t===40?'end':'middle',C.ink,12);});
  [-1,0,1].forEach(v=>{b+=line(left,Y(v),w-right,Y(v))+text(left-7,Y(v)+4,kind==='resistor'||kind==='rl'?(v===0?'0':v===1?'+1':'−1'):(v===0?'0':v===1?'16,97':'−16,97'),'end',C.ink,11);});
  b+=text(left,18,kind==='resistor'||kind==='rl'?'Normaliserad amplitud':'Spänning (V)','start',C.ink,12)+text(w-right,h-3,'Tid (ms)','end',C.ink,12);
  const path=(shift,color,dash='')=>{let d='';for(let n=0;n<=240;n++){const t=40*n/240;d+=(n?'L':'M')+X(t).toFixed(2)+','+Y(Math.sin(2*Math.PI*t/20-shift)).toFixed(2);}return `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.6"${dash?` stroke-dasharray="${dash}"`:''}/>`;};
  b+=path(0,C.blue);if(kind==='resistor'||kind==='rl'){b+=path(kind==='rl'?Math.atan(30/40):0,C.orange,'7 5');b+=text(left,34,'u: hel linje   i: streckad','start',C.ink,12);}
  if(kind==='period'){b+=line(X(0),Y(0)+26,X(20),Y(0)+26,C.green)+text(X(10),Y(0)+48,'T = 20 ms','middle',C.green,14);}
  if(kind==='peak')b+=text(X(5)+8,top-7,'û = 16,97 V','start',C.blue,14);
  if(progress<1){const t=40*Math.max(0,progress);b+=`<circle cx="${X(t)}" cy="${Y(Math.sin(2*Math.PI*t/20))}" r="5" fill="${C.green}"/>`;}
 }
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(title)}"><title>${esc(title)}</title><rect width="${w}" height="${h}" fill="white"/>${b}</svg>`;
}
