import {ROUTES,MAP_BOUNDS} from './layout.js';

export function drawTownMap(ctx,w,h,{sites=[],people=[],player={x:0,z:0},yaw=0,visited=[]}={}) {
  const b=MAP_BOUNDS,pad=10,scale=Math.min((w-pad*2)/(b.maxX-b.minX),(h-pad*2)/(b.maxZ-b.minZ));
  const px=x=>pad+(x-b.minX)*scale,pz=z=>h-pad-(z-b.minZ)*scale;
  ctx.fillStyle='#eadfbe';ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#a1b9b3';ctx.fillRect(0,pz(-62),w,h-pz(-62));
  ctx.strokeStyle='#766c50';ctx.lineJoin='round';ctx.lineCap='round';
  for(const route of ROUTES){ctx.lineWidth=Math.max(2,route.width*scale);ctx.beginPath();route.points.forEach(([x,z],i)=>i?ctx.lineTo(px(x),pz(z)):ctx.moveTo(px(x),pz(z)));ctx.stroke();}
  for(const site of sites){ctx.fillStyle=visited.includes(site.id)?'#a65739':'#4d6156';const x=site.x??site.side*11.8;ctx.fillRect(px(x)-2.3,pz(site.z)-3,4.6,6);if(site.id==='izakaya'){ctx.fillStyle='#a94435';ctx.beginPath();ctx.arc(px(x),pz(site.z),4,0,Math.PI*2);ctx.fill();if(w>=300){ctx.font='bold 12px sans-serif';ctx.fillText('MINATO IZAKAYA',px(x)+7,pz(site.z)+4);}}}
  ctx.fillStyle='#9c4b34';for(const p of people.filter(p=>p.g.visible)){ctx.beginPath();ctx.arc(px(p.g.position.x),pz(p.g.position.z),1.5,0,Math.PI*2);ctx.fill();}
  ctx.save();ctx.translate(px(player.x),pz(player.z));ctx.rotate(Math.PI+yaw);ctx.fillStyle='#862f27';ctx.beginPath();ctx.moveTo(0,-5);ctx.lineTo(3.5,4);ctx.lineTo(-3.5,4);ctx.closePath();ctx.fill();ctx.restore();
  ctx.fillStyle='#3b514c';ctx.font='bold '+Math.max(10,w*.048)+'px serif';ctx.fillText('観光案内図',8,15);ctx.font=Math.max(9,w*.037)+'px serif';ctx.fillText('昭和六十三年',8,h-7);
}
