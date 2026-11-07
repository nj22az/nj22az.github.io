/**
 * Conservative, on-device spot suggestions. This finds compact contrast changes surrounded by a fairly smooth
 * patch, not people or semantic objects. A suggestion is never an instruction to remove a facial feature: the user
 * reviews and taps each one. Keep the input at <=512 pixels per side; no models, uploads or image-sized history.
 */
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

/** Coordinates and radius are shares of the supplied image (radius uses its shorter side). */
export function findSpots({data,width,height},{limit=12}={}){
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<16||height<16||width>512||height>512||data?.length!==width*height*4)return [];
 const stride=width+1,n=stride*(height+1),channels=Array.from({length:5},()=>new Float64Array(n));
 for(let y=0;y<height;y++){
  const row=new Float64Array(5);
  for(let x=0;x<width;x++){
   const i=(y*width+x)*4,R=data[i],G=data[i+1],B=data[i+2],A=data[i+3],values=[R,G,B,(R*R+G*G+B*B)/3,A];
   const p=(y+1)*stride+x+1;
   for(let c=0;c<5;c++){row[c]+=values[c];channels[c][p]=channels[c][p-stride]+row[c];}
  }
 }
 const sum=(t,x0,y0,x1,y1)=>t[y1*stride+x1]-t[y0*stride+x1]-t[y1*stride+x0]+t[y0*stride+x0];
 const candidates=[],short=Math.min(width,height),scales=[1,2,3,5].filter(r=>r*9<short);
 for(const r of scales){
  const inner=r,guard=r+2,outer=3*r+4,innerArea=(2*inner+1)**2,guardArea=(2*guard+1)**2,ringArea=(2*outer+1)**2-guardArea;
  for(let y=outer+1;y<height-outer-1;y+=2)for(let x=outer+1;x<width-outer-1;x+=2){
   const ring=[],middle=[];
   for(let c=0;c<5;c++){
    ring[c]=(sum(channels[c],x-outer,y-outer,x+outer+1,y+outer+1)-sum(channels[c],x-guard,y-guard,x+guard+1,y+guard+1))/ringArea;
    middle[c]=sum(channels[c],x-inner,y-inner,x+inner+1,y+inner+1)/innerArea;
   }
   if(ring[4]<254||middle[4]<254)continue;
   const noise=Math.sqrt(Math.max(0,ring[3]-(ring[0]**2+ring[1]**2+ring[2]**2)/3));
   const contrast=Math.hypot(middle[0]-ring[0],middle[1]-ring[1],middle[2]-ring[2])/Math.sqrt(3);
   if(noise>10||contrast<Math.max(22,noise*4))continue;
   // The inner patch must be consistently different, rather than a thin edge or a few noisy samples.
   const innerNoise=Math.sqrt(Math.max(0,middle[3]-(middle[0]**2+middle[1]**2+middle[2]**2)/3));
   if(innerNoise>contrast*.8)continue;
   candidates.push({x:(x+.5)/width,y:(y+.5)/height,r:(guard+1)/short,score:contrast/(8+noise+innerNoise*.2)});
  }
 }
 candidates.sort((a,b)=>b.score-a.score||b.r-a.r||a.y-b.y||a.x-b.x);
 const spots=[];
 for(const s of candidates){
  if(spots.some(q=>Math.hypot((s.x-q.x)*width,(s.y-q.y)*height)<(s.r+q.r)*short*1.8))continue;
  // The larger supported radius at the same centre covers the whole spot, not only its darkest pixel.
  let radius=s.r;
  for(const q of candidates)if(q.r>radius&&Math.hypot((s.x-q.x)*width,(s.y-q.y)*height)<s.r*short*.6&&q.score>=s.score*.75)radius=q.r;
  spots.push({...s,r:clamp(radius,3/short,.045)});
  if(spots.length>=clamp(Math.floor(limit)||12,1,24))break;
 }
 return spots;
}
