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
export function drawStatement(ctx,w,h,text,speaker=.5,headTop=1){
 const words=String(text||'').split(/\s+/).filter(Boolean);if(!words.length)return;
 ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';
 const left=w*.05,right=w*.95,y=h*.025,tailHeight=w*.04,gap=w*.018;
 const ceiling=Number.isFinite(headTop)&&headTop>0?headTop*h-gap:h*.4;
 const available=Math.max(w*.11,Math.min(h*.32,ceiling-y-tailHeight));
 let size=w*.047,lines=[],lh,bh;
 for(let attempt=0;attempt<36;attempt++){
  ctx.font=`700 ${size}px system-ui,sans-serif`;lines=[];let line='';
  for(const word of words){const next=line?line+' '+word:word;if(line&&ctx.measureText(next).width>w*.79){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);
  lh=size*1.24;bh=lines.length*lh+size*1.1;
  if(bh<=available&&lines.every(l=>ctx.measureText(l).width<=w*.79))break;size*=.96;
 }
 const bottom=y+bh,r=Math.min(bh*.43,w*.065),tail=Math.max(.16,Math.min(.84,speaker))*w;
 ctx.fillStyle='#fffdf4';ctx.strokeStyle='#202722';ctx.lineWidth=w*.004;ctx.lineJoin='round';
 // One closed outline: the lower edge opens into the tail, so no border crosses its mouth.
 ctx.beginPath();ctx.moveTo(left+r,y);ctx.lineTo(right-r,y);ctx.quadraticCurveTo(right,y,right,y+r);ctx.lineTo(right,bottom-r);ctx.quadraticCurveTo(right,bottom,right-r,bottom);
 ctx.lineTo(tail+w*.028,bottom);ctx.lineTo(tail,bottom+tailHeight);ctx.lineTo(tail-w*.047,bottom);ctx.lineTo(left+r,bottom);ctx.quadraticCurveTo(left,bottom,left,bottom-r);ctx.lineTo(left,y+r);ctx.quadraticCurveTo(left,y,left+r,y);ctx.closePath();ctx.fill();ctx.stroke();
 ctx.fillStyle='#222';lines.forEach((l,i)=>ctx.fillText(l,w*.5,y+size*.55+lh*(i+.5)));ctx.restore();
 return {bottom:bottom+tailHeight,headTop:headTop*h,fontSize:size,lines};
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
