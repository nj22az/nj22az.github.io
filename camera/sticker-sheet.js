/**
 * A picture of a sticker sheet, cut into its stickers on this device (the owner, 12 November 2026: "can you make a
 * function to add stickers easily?"). Many drawings on one plain ground (white, cream, any flat colour, a chequered
 * "transparent" pattern, or real transparency) come out as one sticker each.
 *
 * It reads a sheet the way tools/cut-sticker-sheet.py does. The ground is the colour of the picture's border; on a
 * light sheet white and pale grey are ground too, so a sheet's own white edges and a chequered ground go with it and
 * stickers whose edges touch are cut apart at their outlines. The ground is flooded in from the edges, with the small
 * gaps a pen leaves in an outline closed first, so the flood does not leak into a figure: what it cannot reach is
 * drawing, and the paper inside a closed outline (a white shirt) stays. What hangs together is one drawing; a small
 * mark near a drawing (motion lines, a "zzz", a note, a puff of dust) is cut with it, nearest first, so a row of z's
 * follows its sleeper. The pieces come back in reading order as see-through pictures; cutout.js gives each its edge.
 */
const WORK=1400,CELL=4,MOST=60;
const pause=()=>new Promise(r=>setTimeout(r,0));

/** 1 where a pixel is ground. */
function groundMask(d,w,h){
 const n=w*h,near=new Uint8Array(n);
 let clear=0;for(let i=3;i<d.length;i+=16)if(d[i]<128)clear++;
 if(clear/(d.length/16)>.05){for(let p=0;p<n;p++)near[p]=d[p*4+3]<128?1:0;return near;}
 const rs=[],gs=[],bs=[],take=p=>{rs.push(d[p*4]);gs.push(d[p*4+1]);bs.push(d[p*4+2]);};
 for(let x=0;x<w;x+=2){take(x);take((h-1)*w+x);}
 for(let y=0;y<h;y+=2){take(y*w);take(y*w+w-1);}
 const median=a=>{a.sort((x,y)=>x-y);return a[a.length>>1];},R=median(rs),G=median(gs),B=median(bs);
 const light=Math.min(R,G,B)>=190,T=18;
 for(let p=0;p<n;p++){
  const r=d[p*4],g=d[p*4+1],b=d[p*4+2],lo=Math.min(r,g,b),hi=Math.max(r,g,b);
  near[p]=(Math.abs(r-R)<=T&&Math.abs(g-G)<=T&&Math.abs(b-B)<=T)||(light&&lo>=120&&hi-lo<=16)?1:0;
 }
 return near;
}
/** 1 where the ground reaches in from the picture's edges. */
function flood(near,w,h){
 const n=w*h,tight=new Uint8Array(n),out=new Uint8Array(n);
 // A gap in an outline two pixels wide does not let the ground through.
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const p=y*w+x;if(!near[p])continue;
  tight[p]=(x<2||near[p-2])&&(x<1||near[p-1])&&(x>w-2||near[p+1])&&(x>w-3||near[p+2])&&(y<2||near[p-2*w])&&(y<1||near[p-w])&&(y>h-2||near[p+w])&&(y>h-3||near[p+2*w])?1:0;
 }
 const stack=new Int32Array(n);let top=0;
 const push=p=>{if(tight[p]&&!out[p]){out[p]=1;stack[top++]=p;}};
 for(let x=0;x<w;x++){push(x);push((h-1)*w+x);}
 for(let y=0;y<h;y++){push(y*w);push(y*w+w-1);}
 while(top){
  const p=stack[--top],x=p%w;
  if(x>0)push(p-1);if(x<w-1)push(p+1);if(p>=w)push(p-w);if(p<n-w)push(p+w);
 }
 // Back out to the drawing's own edge.
 let from=out;
 for(let pass=0;pass<3;pass++){
  const to=from.slice();
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){
   const p=y*w+x;if(from[p]||!near[p])continue;
   if((x>0&&from[p-1])||(x<w-1&&from[p+1])||(y>0&&from[p-w])||(y<h-1&&from[p+w]))to[p]=1;
  }
  from=to;
 }
 return from;
}
const gap=(a,b)=>Math.hypot(Math.max(0,a.x0-b.x1,b.x0-a.x1),Math.max(0,a.y0-b.y1,b.y0-a.y1));

/**
 * The stickers on a sheet: [{blob (PNG, see-through round the drawing), width, height}] in reading order, at most
 * `most`. One or none means the picture is not a sheet.
 */
export async function cutSheet(file,{most=MOST}={}){
 const bitmap=await createImageBitmap(file).catch(async()=>{
  const url=URL.createObjectURL(file);
  try{const img=new Image();img.src=url;await img.decode();return img;}finally{URL.revokeObjectURL(url);}
 });
 const iw=bitmap.width||bitmap.naturalWidth,ih=bitmap.height||bitmap.naturalHeight,k=Math.min(1,WORK/Math.max(iw,ih));
 const w=Math.max(1,Math.round(iw*k)),h=Math.max(1,Math.round(ih*k));
 const sheet=document.createElement('canvas');sheet.width=w;sheet.height=h;
 const sg=sheet.getContext('2d',{willReadFrequently:true});sg.imageSmoothingQuality='high';sg.drawImage(bitmap,0,0,w,h);bitmap.close?.();
 const d=sg.getImageData(0,0,w,h).data;sheet.width=sheet.height=0;
 const near=groundMask(d,w,h);
 // A sheet has its ground all round it; a photograph does not, and is no sheet.
 let edge=0,ground=0;
 for(let x=0;x<w;x++){edge+=2;ground+=near[x]+near[(h-1)*w+x];}
 for(let y=0;y<h;y++){edge+=2;ground+=near[y*w]+near[y*w+w-1];}
 if(ground<edge*.85)return [];
 const outside=flood(near,w,h);
 await pause();
 // What hangs together, on a coarser grid so strokes a few pixels apart are one drawing.
 const gw=Math.ceil(w/CELL),gh=Math.ceil(h/CELL),grid=new Uint8Array(gw*gh);
 for(let y=0;y<h;y++){const row=(y/CELL|0)*gw;for(let x=0;x<w;x++)if(!outside[y*w+x])grid[row+(x/CELL|0)]=1;}
 const label=new Int32Array(gw*gh),parts=[],stack=new Int32Array(gw*gh);
 for(let start=0;start<grid.length;start++){
  if(!grid[start]||label[start])continue;
  const id=parts.length+1,part={id,area:0,x0:gw,y0:gh,x1:0,y1:0};let top=0;stack[top++]=start;label[start]=id;
  while(top){
   const p=stack[--top],x=p%gw,y=p/gw|0;
   part.area++;if(x<part.x0)part.x0=x;if(x>part.x1)part.x1=x;if(y<part.y0)part.y0=y;if(y>part.y1)part.y1=y;
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=gw||ny>=gh)continue;
    const q=ny*gw+nx;if(grid[q]&&!label[q]){label[q]=id;stack[top++]=q;}
   }
  }
  parts.push(part);
 }
 await pause();
 // Drawings, and the marks that belong to them.
 const cells=gw*gh,large=parts.filter(p=>p.area>=cells*.0012).map(p=>p.area).sort((a,b)=>a-b);
 const whole=(large.length?large[large.length>>1]:0)*.4;
 const groups=[],owner=new Int32Array(parts.length+1);
 for(const p of parts)if(p.area>=Math.max(whole,cells*.0003)){owner[p.id]=p.id;groups.push({id:p.id,members:[p]});}
 let loose=parts.filter(p=>!owner[p.id]&&p.area>=Math.max(2,cells*.00004));
 for(const limit of [gw*.018,gw*.045]){
  let moved=groups.length>0;
  while(moved&&loose.length){
   moved=false;
   for(const p of [...loose]){
    let best=null,dist=Infinity;
    for(const g of groups)for(const m of g.members){const v=gap(p,m);if(v<dist){dist=v;best=g;}}
    if(best&&dist<=limit){best.members.push(p);owner[p.id]=best.id;loose=loose.filter(x=>x!==p);moved=true;}
   }
  }
 }
 for(const p of loose)if(p.area>=cells*.0003){owner[p.id]=p.id;groups.push({id:p.id,members:[p]});}
 for(const g of groups){g.x0=Math.min(...g.members.map(m=>m.x0));g.y0=Math.min(...g.members.map(m=>m.y0));g.x1=Math.max(...g.members.map(m=>m.x1));g.y1=Math.max(...g.members.map(m=>m.y1));}
 // Reading order: rows from the top, each from the left.
 groups.sort((a,b)=>(a.y0+a.y1)-(b.y0+b.y1));
 const heights=groups.map(g=>g.y1-g.y0).sort((a,b)=>a-b),tall=heights[heights.length>>1]||0,rows=[];
 for(const g of groups){
  const mid=(g.y0+g.y1)/2,row=rows[rows.length-1];
  if(row&&Math.abs(mid-row.reduce((s,x)=>s+(x.y0+x.y1)/2,0)/row.length)<tall*.5)row.push(g);else rows.push([g]);
 }
 const ordered=rows.flatMap(row=>row.sort((a,b)=>a.x0-b.x0)).slice(0,most),pieces=[];
 for(const g of ordered){
  const x0=g.x0*CELL,y0=g.y0*CELL,pw=Math.min(w,(g.x1+1)*CELL)-x0,ph=Math.min(h,(g.y1+1)*CELL)-y0;
  const c=document.createElement('canvas');c.width=pw;c.height=ph;const cg=c.getContext('2d'),img=cg.createImageData(pw,ph);
  for(let y=0;y<ph;y++){
   const row=((y0+y)/CELL|0)*gw;
   for(let x=0;x<pw;x++){
    const p=(y0+y)*w+x0+x;
    if(outside[p]||owner[label[row+((x0+x)/CELL|0)]]!==g.id)continue;
    const o=(y*pw+x)*4;img.data[o]=d[p*4];img.data[o+1]=d[p*4+1];img.data[o+2]=d[p*4+2];img.data[o+3]=255;
   }
  }
  cg.putImageData(img,0,0);
  const blob=await new Promise((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error('Encoding failed')),'image/png'));
  c.width=c.height=0;pieces.push({blob,width:pw,height:ph});
  await pause();
 }
 return pieces;
}
