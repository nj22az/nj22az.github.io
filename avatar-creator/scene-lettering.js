/** Unboxed comic shouting. Wraps to the panel, reserves the top third for readable acting. */
export function drawShout(ctx,w,h,text){
 const words=String(text||'').toUpperCase().split(/\s+/).filter(Boolean);if(!words.length)return;
 ctx.save();ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#171716';ctx.strokeStyle='#faf7ee';ctx.lineJoin='round';
 let size=w*(words.length<3?.15:.096),lines=[];
 for(let attempt=0;attempt<20;attempt++){
  ctx.font=`900 ${size}px Impact, 'DejaVu Sans Condensed', sans-serif`;lines=[];let line='';
  for(const word of words){const next=line?line+' '+word:word;if(line&&ctx.measureText(next).width>w*.93){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);
  if(lines.length*size*1.08<h*.35&&lines.every(l=>ctx.measureText(l).width<w*.95))break;size*=.93;
 }
 const y=h*.045+size*.5;ctx.lineWidth=size*.10;
 lines.forEach((line,i)=>{ctx.save();ctx.translate(w*.5,y+i*size*1.08);ctx.rotate((i%2?.007:-.007));ctx.strokeText(line,0,0);ctx.fillText(line,0,0);ctx.restore();});ctx.restore();
}
