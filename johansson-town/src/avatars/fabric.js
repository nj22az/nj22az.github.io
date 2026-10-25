/** Portable 16 × 16 fabric tiles. Dots reveal the garment colour; 0–f index
 * at most sixteen sRGB colours. No image URLs, data URLs or external fetches. */
export const FABRIC_SIZE=16;
export const FABRIC_PALETTE=Object.freeze(['#f4f1ea','#27304d','#c8473a','#8cc4b4','#e8b83e','#d9668a','#476a79','#6e4a33','#2b2b2b','#8fbfe0','#4f7a4f','#b2a2ce']);
export function normalizeFabric(value){
 if(!value||typeof value!=='object'||!Array.isArray(value.palette)||value.palette.length<1||value.palette.length>16)return null;
 if(!value.palette.every(c=>typeof c==='string'&&/^#[0-9a-f]{6}$/i.test(c)))return null;
 if(typeof value.pixels!=='string'||value.pixels.length!==256||!/^[.0-9a-f]+$/i.test(value.pixels))return null;
 const pixels=value.pixels.toLowerCase();
 if([...pixels].some(c=>c!=='.'&&parseInt(c,16)>=value.palette.length))return null;
 const repeat=Number(value.repeat);
 return {palette:value.palette.map(c=>c.toLowerCase()),pixels,repeat:Number.isFinite(repeat)?Math.max(2,Math.min(8,Math.round(repeat))):4};
}
export const blankFabric=()=>({palette:[...FABRIC_PALETTE],pixels:'.'.repeat(256),repeat:4});
export function fabricColour(tile,u,v,base){
 const x=((Math.floor(u*16)%16)+16)%16,y=((Math.floor(v*16)%16)+16)%16,c=tile.pixels[y*16+x];
 return c==='.'?base:tile.palette[parseInt(c,16)];
}
/** Flood fill with four-way adjacency; bounded even on a wholly empty tile. */
export function fillFabric(pixels,index,colour){
 if(index<0||index>=256||pixels[index]===colour)return pixels;
 const a=[...pixels],old=a[index],todo=[index];a[index]=colour;
 while(todo.length){const i=todo.pop(),x=i%16,y=Math.floor(i/16);for(const n of [x?i-1:-1,x<15?i+1:-1,y?i-16:-1,y<15?i+16:-1])if(n>=0&&a[n]===old){a[n]=colour;todo.push(n);}}
 return a.join('');
}
/** Continuous pointer strokes must not leave gaps when the browser coalesces events. */
export function strokeFabric(pixels,from,to,colour){
 const a=[...pixels],x=from%16,y=Math.floor(from/16),dx=to%16-x,dy=Math.floor(to/16)-y,n=Math.max(Math.abs(dx),Math.abs(dy),1);
 for(let i=0;i<=n;i++)a[Math.round(y+dy*i/n)*16+Math.round(x+dx*i/n)]=colour;
 return a.join('');
}
/** Paint repeated cloth into a UV region, below collars/cuffs and other details. */
export function paintFabric(ctx,tile,base,x,y,w,h){
 if(!tile)return;
 const cols=tile.repeat*16,rows=tile.repeat*16;
 ctx.save();ctx.beginPath();ctx.rect(x,y,w,h);ctx.clip();
 for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
  ctx.fillStyle=fabricColour(tile,i/16,j/16,base);
  const x0=x+Math.floor(i*w/cols),y0=y+Math.floor(j*h/rows);
  ctx.fillRect(x0,y0,Math.ceil((i+1)*w/cols)-Math.floor(i*w/cols),Math.ceil((j+1)*h/rows)-Math.floor(j*h/rows));
 }
 ctx.restore();
}
