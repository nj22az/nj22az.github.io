/**
 * The photographer's own die-cut stickers, from their own pictures. A picture with a transparent background (a subject
 * lifted from a photo on an iPhone, iPad or Mac, "Copy Subject", then pasted; or any cut-out PNG) is cut round its own
 * outline; any other photo becomes a rounded photo sticker. Either way it gets what the studio's stickers have
 * a narrow white contour following the silhouette, with a restrained shadow. Done here, on this device.
 */
const LONGEST=1024;

/** Whether a picture has a transparent background worth cutting round (more than a twentieth of it see-through). */
function seeThrough(g,w,h){
 const d=g.getImageData(0,0,w,h).data;let clear=0;
 for(let i=3;i<d.length;i+=16)if(d[i]<128)clear++;
 return clear/(d.length/16)>.05;
}

/** A picture file or blob to a die-cut sticker: {blob (PNG), width, height, cut:'outline'|'photo'}. */
export async function makeSticker(file){
 const bitmap=await createImageBitmap(file).catch(async()=>{
  const url=URL.createObjectURL(file);
  try{const img=new Image();img.src=url;await img.decode();return img;}finally{URL.revokeObjectURL(url);}
 });
 const iw=bitmap.width||bitmap.naturalWidth,ih=bitmap.height||bitmap.naturalHeight,k=Math.min(1,LONGEST/Math.max(iw,ih));
 const w=Math.max(1,Math.round(iw*k)),h=Math.max(1,Math.round(ih*k));
 const art=document.createElement('canvas');art.width=w;art.height=h;
 const ag=art.getContext('2d',{willReadFrequently:true});ag.imageSmoothingQuality='high';ag.drawImage(bitmap,0,0,w,h);bitmap.close?.();
 const outline=seeThrough(ag,w,h);
 if(!outline){
  // A rounded photo sticker: the picture with rounded corners, the border round it.
  const r=Math.min(w,h)*.09;
  ag.globalCompositeOperation='destination-in';ag.beginPath();ag.roundRect(0,0,w,h,r);ag.fill();ag.globalCompositeOperation='source-over';
 }
 const m=Math.max(w,h),border=Math.max(1,m*.0045),shadow=Math.max(1,m*.002);
 const pad=Math.ceil(border+shadow*2+1);
 const out=document.createElement('canvas');out.width=w+2*pad;out.height=h+2*pad;
 const g=out.getContext('2d');
 // The shape grown by the border: the picture's own silhouette stamped all round it at the border's reach.
 const shape=(colour,reach)=>{
  const s=document.createElement('canvas');s.width=w;s.height=h;const sg=s.getContext('2d');
  sg.drawImage(art,0,0);sg.globalCompositeOperation='source-in';sg.fillStyle=colour;sg.fillRect(0,0,w,h);
  const grown=document.createElement('canvas');grown.width=out.width;grown.height=out.height;const gg=grown.getContext('2d');
  const rings=[reach,reach*.66,reach*.33];
  for(const r of rings){const n=Math.max(16,Math.round(r*.8));for(let i=0;i<n;i++){const a=i/n*Math.PI*2;gg.drawImage(s,pad+Math.cos(a)*r,pad+Math.sin(a)*r);}}
  gg.drawImage(s,pad,pad);
  return grown;
 };
 const paper=shape('#ffffff',border);
 g.save();g.shadowColor='rgba(0,0,0,.14)';g.shadowBlur=shadow;g.shadowOffsetY=shadow*.35;g.drawImage(paper,0,0);g.restore();
 g.drawImage(art,pad,pad);
 const blob=await new Promise((res,rej)=>out.toBlob(b=>b?res(b):rej(new Error('Encoding failed')),'image/png'));
 const size={width:out.width,height:out.height};
 art.width=art.height=out.width=out.height=0;
 return {blob,...size,cut:outline?'outline':'photo'};
}
