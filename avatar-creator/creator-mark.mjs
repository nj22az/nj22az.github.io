/** A small editable artist wordmark; it never enters the scene's shader or lettering. */
export const CREATOR_MARK_KEY='johansson-studio-creator-mark';
export function normalCreatorMark(mark={}){return {enabled:mark?.enabled!==false,text:Array.from(String(mark?.text??'Johansson').replace(/[\u0000-\u001f]/g,' ')).slice(0,40).join(''),corner:mark?.corner==='left'?'left':'right',opacity:Number.isFinite(mark?.opacity)?Math.min(.9,Math.max(.2,mark.opacity)):.58};}
export const projectCreatorMark=project=>normalCreatorMark(project?.creatorMark??{enabled:false});
export function drawCreatorMark(ctx,rect,mark,{caption=false,look='manga'}={}){
 const m=normalCreatorMark(mark);if(!m.enabled||!m.text.trim()||!rect)return;
 const size=rect.w*.027,x=rect.x+rect.w*(m.corner==='left'?.035:.965),y=rect.y+rect.h*(caption?.79:.955);
 ctx.save();ctx.font=`italic 600 ${size}px Georgia, 'Times New Roman', serif`;ctx.textAlign=m.corner==='left'?'left':'right';ctx.textBaseline='alphabetic';ctx.globalAlpha=m.opacity;
 ctx.strokeStyle='#fffdf4';ctx.lineWidth=size*.09;ctx.lineJoin='round';ctx.fillStyle=look==='stamp'?'#7d1729':look==='riso'?'#274b58':'#272622';
 ctx.strokeText(m.text,x,y,rect.w*.22);ctx.fillText(m.text,x,y,rect.w*.22);
 const width=Math.min(ctx.measureText(m.text).width,rect.w*.22),start=m.corner==='left'?x:x-width;
 ctx.beginPath();ctx.moveTo(start,y+size*.10);ctx.quadraticCurveTo(start+width*.55,y+size*.25,start+width,y+size*.07);ctx.lineWidth=Math.max(.7,size*.045);ctx.strokeStyle=ctx.fillStyle;ctx.stroke();ctx.restore();
 return {x,y,width,fontSize:size};
}
