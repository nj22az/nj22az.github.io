const FONT='SakuraJP, Figtree, sans-serif';
// Original deterministic wax-pencil lettering shared by shelf and counter POP.
export function crayon(c,text,x,y,size,ink){
 const layer=document.createElement('canvas');layer.width=320;layer.height=128;const p=layer.getContext('2d');p.font=`800 ${size}px ${FONT}`;p.fillStyle=ink;
 const widths=[...text].map(ch=>p.measureText(ch).width),scale=Math.min(1,205/widths.reduce((a,b)=>a+b,0));let cursor=x-widths.reduce((a,b)=>a+b,0)*scale/2;
 [...text].forEach((ch,i)=>{p.save();p.translate(cursor+widths[i]*scale/2,y+Math.sin(i*2.3)*1.3);p.rotate(Math.sin(i*1.7)*.045);p.scale(scale,1);p.textAlign='center';p.fillText(ch,0,0);p.restore();cursor+=widths[i]*scale;});
 p.globalCompositeOperation='destination-out';p.fillStyle='rgba(0,0,0,.32)';for(let i=0;i<360;i++){const xx=(i*73)%320,yy=(i*37)%128;p.fillRect(xx,yy,1+(i%3),.7);}
 c.drawImage(layer,0,0);
}
