/** Unboxed comic shouting. Wraps to the panel, reserves the top third for readable acting. */
export function drawShout(ctx,w,h,text){
 const words=String(text||'').toUpperCase().split(/\s+/).filter(Boolean);if(!words.length)return;
 ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#171716';ctx.strokeStyle='#faf7ee';ctx.lineJoin='round';
 let size=w*(words.length<3?.15:.096),lines=[];
 for(let attempt=0;attempt<20;attempt++){
  ctx.font=`900 ${size}px Impact, 'DejaVu Sans Condensed', sans-serif`;lines=[];let line='';
  for(const word of words){const next=line?line+' '+word:word;if(line&&(ctx.measureText(next).width>w*.93||word==='ONE')){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);
  if(lines.length*size*1.08<h*(words.length<3?.35:.43)&&lines.every(l=>ctx.measureText(l).width<w*.95))break;size*=.93;
 }
 const y=h*.045+size*.5;ctx.lineWidth=size*.10;
 lines.forEach((line,i)=>{
  ctx.save();ctx.translate(w*.5,y+i*size*1.08);const total=ctx.measureText(line).width;let x=-total/2;
  ctx.textAlign='left';const scream=words.length<3,emphasis=line.startsWith('ONE LIFE');
  for(let j=0;j<line.length;j++){const ch=line[j],advance=ctx.measureText(ch).width;ctx.save();ctx.translate(x,(j%3-1)*size*(scream?.055:.018));ctx.rotate(((j*7+i*3)%5-2)*(scream?.045:.009));ctx.scale(1,emphasis?1.15:1+((j%3)-1)*(scream?.13:.025));ctx.strokeText(ch,0,0);ctx.fillText(ch,0,0);ctx.restore();x+=advance;}ctx.restore();
 });ctx.restore();
}

/** A large, complete speech bubble above the action, with a tail towards the speaker. */
export function drawStatement(ctx,w,h,text,speaker=.5){
 ctx.save();ctx.font=`700 ${w*.047}px system-ui,sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
 const words=String(text||'').split(/\s+/).filter(Boolean),lines=[];let line='';
 for(const word of words){const next=line?line+' '+word:word;if(line&&ctx.measureText(next).width>w*.80){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);
 const x=w*.5,y=h*.035,bw=w*.9,lh=w*.059,bh=lines.length*lh+w*.07;
 ctx.fillStyle='#fffdf4';ctx.strokeStyle='#202722';ctx.lineWidth=w*.004;ctx.lineJoin='round';
 ctx.beginPath();ctx.moveTo(x-bw*.45,y+bh*.08);ctx.bezierCurveTo(x-bw*.2,y-bh*.08,x+bw*.37,y-bh*.04,x+bw*.48,y+bh*.15);ctx.bezierCurveTo(x+bw*.54,y+bh*.4,x+bw*.5,y+bh*.88,x+bw*.39,y+bh*.95);ctx.bezierCurveTo(x+bw*.1,y+bh*1.04,x-bw*.37,y+bh*1.03,x-bw*.48,y+bh*.82);ctx.bezierCurveTo(x-bw*.53,y+bh*.6,x-bw*.53,y+bh*.2,x-bw*.45,y+bh*.08);ctx.closePath();ctx.fill();ctx.stroke();
 const tail=Math.max(.12,Math.min(.88,speaker))*w;
 ctx.beginPath();ctx.moveTo(tail-w*.065,y+bh-2);ctx.lineTo(tail,y+bh+w*.05);ctx.lineTo(tail+w*.025,y+bh-2);ctx.fill();ctx.stroke();
 ctx.fillStyle='#222';lines.forEach((l,i)=>ctx.fillText(l,x,y+w*.035+lh*(i+.5)));ctx.restore();
}

/** Ink accents on the paper layer: tumbling sheets, impact arcs and panic droplets. */
export function drawComicChaos(ctx,w,h,heads=[],escaping=false){
 ctx.save();ctx.strokeStyle='#211e19';ctx.fillStyle='#fffdf6';ctx.lineWidth=w*.006;ctx.lineCap='round';
 for(const [x,y,r] of [[.12,.39,-.5],[escaping?.29:.38,escaping?.70:.58,.8],[.25,.86,.35]]){ctx.save();ctx.translate(x*w,y*h);ctx.rotate(r);ctx.beginPath();ctx.moveTo(-w*.034,-h*.025);ctx.lineTo(w*.034,-h*.025);ctx.lineTo(w*.027,h*.025);ctx.lineTo(-w*.038,h*.02);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
 for(const [x,y,r] of [[.13,.48,-.3],[.27,.76,.6],[.41,.43,.3]]){ctx.save();ctx.translate(x*w,y*h);ctx.rotate(r);ctx.beginPath();ctx.moveTo(-w*.055,0);ctx.quadraticCurveTo(-w*.12,-h*.08,w*.015,-h*.07);ctx.stroke();ctx.restore();}
 ctx.lineWidth=w*.004;for(let i=0;i<6;i++){const y=h*(.52+i*.043);ctx.beginPath();ctx.moveTo(w*((escaping?.25:.39)+i%2*.02),y);ctx.lineTo(w*((escaping?.38:.50)+i%3*.025),y-h*.012);ctx.stroke();}
 for(const head of heads){const x=(head.x+1)*w*.5,y=(1-head.y)*h*.5;for(let i=0;i<3;i++){const dx=w*(-.12+i*.07),dy=h*(-.09-Math.abs(i-1)*.015);ctx.beginPath();ctx.moveTo(x+dx,y+dy);ctx.quadraticCurveTo(x+dx-w*.025,y+dy-h*.038,x+dx-w*.027,y+dy-h*.008);ctx.quadraticCurveTo(x+dx-w*.025,y+dy+h*.004,x+dx,y+dy);ctx.stroke();}}
 ctx.restore();
}
