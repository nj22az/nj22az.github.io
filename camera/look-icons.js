// Camera's own effect symbols. They describe the medium, not a scene or a console brand.
const p=d=>`<path d="${d}"/>`,r=(x,y,w,h,rx=0)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`,c=(x,y,n,fill)=>`<circle cx="${x}" cy="${y}" r="${n}"${fill?` fill="${fill}" stroke="none"`:''}/>`;
const code=(n,y=14)=>`<text x="12" y="${y}" text-anchor="middle" fill="currentColor" stroke="none" font-family="system-ui,sans-serif" font-weight="800" font-size="8">${n}</text>`;
const ink=(a,b,shape='circles')=>shape==='bars'?r(3,4,8,16,1).replace('/>',` fill="${a}" stroke="none"/>`)+r(13,4,8,16,1).replace('/>',` fill="${b}" stroke="none"/>`):c(9,10,6,a)+c(15,14,6,b);
export const LOOK_ICONS=Object.freeze({
 none:p('M3 6h5l2-2h4l2 2h5v14H3z')+c(12,13,4),
 mono:c(12,12,9)+p('M12 3a9 9 0 0 0 0 18z').replace('/>',' fill="currentColor"/>'),
 sepia:r(4,3,16,18,2)+c(9,8,1.5)+p('m5 17 5-5 4 4 3-2 2 3M7 1v4M17 1v4'),
 pocket:r(5,2,14,20,2)+r(8,5,8,7,1)+p('M8 17h4M10 15v4M15 17h.01M17 16h.01'),
 snes:p('M5 3h14v18H5zM8 3v3h8V3M8 18h8')+code('16'),
 lines:p('M3 18 9 7l4 8 3-5 5 8M3 21h18M4 4h7'),
 crt:r(2,6,20,15,3)+p('m7 2 5 4 5-4M17 10v7M5 10h8v7H5zM20 10h.01M20 16h.01'),
 manga:p('M3 3h18v14h-8l-5 4v-4H3zM6 7l3 5 3-5 3 5 3-5'),
 crayon:p('m4 17 10-13 5 4L8 21H3zM12 7l5 4M5 16l4 3M15 3l5 4'),
 tilt:p('M3 7h18M3 17h18M7 14v-4l5-4 5 4v4M10 14v-3h4v3'),
 print:r(3,3,18,18,1)+p('m5 14 5-5 4 4 5-7M5 17h14M5 19h14M5 5h8'),
 watercolour:p('M8 3s-5 6-5 10a5 5 0 0 0 10 0c0-4-5-10-5-10zM17 4l4 2-5 11M14 16c-3 0-3 4-1 5 4 0 5-2 3-4'),
 flat:p('m12 2 9 6-3 11-6 3-6-3L3 8zM3 8h18M6 19l6-11 6 11'),
 oil:p('M12 3a9 9 0 1 0 0 18h2c3 0 3-4 1-5-2-1-1-3 1-3h2c6 0 2-10-6-10z')+c(7,9,1)+c(11,6,1)+c(16,7,1)+c(6,14,1),
 sketchbook:p('M12 5c-4-3-8-2-10-1v16c3-2 6-2 10 0 4-2 7-2 10 0V4c-3-1-6-2-10 1v15M5 8h4M5 12h4M15 9h4M15 13h4'),
 riso:ink('#ef6b65','#5bb9b5')+p('M4 20h16'),
 pencilManga:p('m3 19 2-6L16 2l5 5L10 18zM5 13l5 5M12 18l2 3M16 15l2 3M19 12l2 3'),
 brushOil:p('m14 2 7 4-9 11-5-3zM8 15c-5-2-7 2-5 7 6 1 10-2 9-6M15 6l3 2'),
 stamp:p('M8 13V9c-5-8 13-8 8 0v4l5 3v3H3v-3zM3 22h18M8 13h8'),
 adventureInk:p('m12 2 8 6v8l-8 6-8-6V8zM12 5l3 7-3 7-3-7zM4 8l5 4M15 12l5 4'),
 instant:r(3,2,18,20,1)+r(6,5,12,11)+c(15,8,1)+p('m7 14 3-4 3 3 2-2 2 3M9 19h6'),
 camcorder:r(2,7,14,13,2)+p('m16 11 6-3v11l-6-3M4 3h10')+c(6,6,3)+c(12,6,3),
 halftone:[5,12,19].flatMap((y,i)=>[5,12,19].map((x,j)=>c(x,y,1+(i+j)*.3,'currentColor'))).join(''),
 cyanotype:p('M4 20 12 3l8 17M7 14h10M10 7h4M12 2v20M3 18h18')+c(12,12,5),
 nightVision:p('M3 6h18v12H3zM5 21h14M8 18v3M16 18v3')+c(8,12,3)+c(16,12,3),
 colourHandheld:r(5,2,14,20,3)+r(8,5,8,7,1)+c(9,8,1.5,'#ff7375')+c(14,9,1.5,'#71baff')+p('M8 17h4M10 15v4M16 16h.01M16 19h.01'),
 redVisor:p('M2 7c6-4 14-4 20 0v10h-6l-4-4-4 4H2zM5 9h4v3H5zM15 9h4v3h-4zM7 4V2M17 4V2'),
 eightBit:r(2,6,20,13,3)+p('M4 11h4M6 9v4M18 11h.01M20 14h.01')+code('8',16),
 thirtyTwoBit:c(12,12,10)+c(12,12,2)+p('M6 5l3 3M15 16l3 3')+code('32',8),
 risoPinkBlue:ink('#f46bb5','#5f9fef'),
 risoRedNavy:ink('#e75b58','#547199','bars'),
 risoBlackPink:p('M3 4h12v16H3z').replace('/>',' fill="#a7a9ae" stroke="none"/>')+c(16,12,6,'#ee7db8'),
 risoThree:c(8,8,5,'#f4d66b')+c(16,8,5,'#e577b5')+c(12,16,5,'#6fa3e9'),
 sixtyFourBit:p('M3 4h18v17H3zM7 4v3h10V4M7 18h10')+code('64'),
});
export function lookIcon(name){
 const id=Object.hasOwn(LOOK_ICONS,name)?name:'none';
 return `<svg class="look-symbol" data-look="${id}" aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round">${LOOK_ICONS[id]}</svg>`;
}
