/**
 * Comics in Pocket Camera: a page of panels, each filled with a photo from the album, one of the photographer's own or
 * one of World's real places as the storyteller photographed them (johansson-town/assets/images/feed/), and then the
 * camera's own editor over the whole page: its Looks, and its stickers and lettering, which may cross a panel's border
 * as a balloon breaks a panel. The owner (29 October 2026): "I think the stamp function is better than the comic
 * builder in Johansson Studio … Bring it to the camera or its own mini app?"
 *
 * The page is drawn in two parts, so the Looks never smudge the paper. composePage() lays the panels' pictures on the
 * page, each running on under the gutters as a printer's bleed (so a Look that blurs or inks finds no false edge at a
 * panel's side); that page goes through the Looks like any photo. drawComicFrame() then lays the paper between the
 * panels and inks every border, after the Looks and before the stickers, as frames.js does for a print's border.
 *
 * The layouts follow the studio's comic-layout rules (nj22az/jojo .claude/skills/comic-layout): gutters about 1.7% of
 * the page's short side and the same everywhere, a margin of about 3.7%, slanted gutters for action, an inset over a
 * splash that bleeds to the edge, borders inked with a pen's small wobble. Panels are read left to right, top to bottom.
 */

const PAPER='#fffdf6',INK='#15120f',EMPTY='#e9e4d8',UNDER='#c9c2b4';
const MARGIN=.037,GUTTER=.017,LINE=.006;
// Where the action layout's gutters cut: two across, leaning, and one down between them, leaning the other way.
const A=x=>.36-.11*x,B=x=>.75-.08*x,AX=.6,BX=.44;
/**
 * Each layout: its page's shape (width / height) and its panels, convex, in the page's inner area (0 to 1 across and
 * down), in reading order. An inset sits over the panel before it; a bleeding layout has no margin and no border at
 * the page's edge.
 */
export const COMIC_LAYOUTS=Object.freeze([
 {id:'one',label:'One',hint:'One panel: a single gag, a cover',aspect:4/5,panels:[rect(0,0,1,1)]},
 {id:'strip',label:'Strip',hint:'Three panels across, as a newspaper strip',aspect:2.6,panels:across(2.6,[0,1/3,2/3,1],(a,b)=>rect(a,0,b,1))},
 {id:'four',label:'Four',hint:'Four panels, two by two',aspect:3/4,panels:[rect(0,0,.5,.5),rect(.5,0,1,.5),rect(0,.5,.5,1),rect(.5,.5,1,1)]},
 {id:'koma',label:'4-koma',hint:'Four panels down: set-up, build-up, the turn, the punchline',aspect:9/16,panels:down(9/16,[0,.25,.5,.75,1],(a,b)=>rect(0,a,1,b))},
 {id:'rows',label:'Three',hint:'Three wide panels, one under another',aspect:3/4,panels:down(3/4,[0,1/3,2/3,1],(a,b)=>rect(0,a,1,b))},
 {id:'hero',label:'Big top',hint:'A big panel, then two: the place, then the moment',aspect:3/4,panels:down(3/4,[0,.6,1],(a,b,i)=>i?[rect(0,a,.5,b),rect(.5,a,1,b)]:[rect(0,a,1,b)]).flat()},
 {id:'action',label:'Action',hint:'Slanted gutters, for a chase, a fall or a panic',aspect:3/4,panels:[
  [[0,0],[1,0],[1,A(1)],[0,A(0)]],
  [[0,A(0)],[AX,A(AX)],[BX,B(BX)],[0,B(0)]],
  [[AX,A(AX)],[1,A(1)],[1,B(1)],[BX,B(BX)]],
  [[0,B(0)],[1,B(1)],[1,1],[0,1]]]},
 {id:'inset',label:'Splash',hint:'One big moment to the page’s edge, and a small reaction over it',aspect:3/4,bleed:true,panels:[rect(0,0,1,1),{inset:true,points:rect(.53,.64,.95,.96)}]},
]);
/**
 * Where the gutters cut an axis of a page's inner area so that the panels between them share what the gutters leave
 * as asked (`shares`, from 0 to 1, ends included): four 4-koma panels exactly the same height, not the outer two a
 * half-gutter taller. `make(from, to, i)` makes the panels between two cuts.
 */
function cutAxis(aspect,vertical,shares,make){
 const h=1/aspect,s=Math.min(1,h),m=MARGIN*s,g=GUTTER*s,len=(vertical?h:1)-2*m,k=shares.length-2;
 const at=shares.map((c,j)=>j===0||j===shares.length-1?c:(c*(len-k*g)+(j-.5)*g)/len);
 return at.slice(1).map((b,i)=>make(at[i],b,i));
}
function across(aspect,shares,make){return cutAxis(aspect,false,shares,make);}
function down(aspect,shares,make){return cutAxis(aspect,true,shares,make);}
function rect(x0,y0,x1,y1){return [[x0,y0],[x1,y0],[x1,y1],[x0,y1]];}
export const DEFAULT_LAYOUT='hero';
export const comicLayout=id=>COMIC_LAYOUTS.find(l=>l.id===id)||COMIC_LAYOUTS.find(l=>l.id===DEFAULT_LAYOUT);

/** A page's size in pixels for a save: its long side 3000, within what the device can draw. */
export function pageSize(layoutId,limit=3000){
 const a=comicLayout(layoutId).aspect,long=Math.min(3000,limit);
 return a>=1?{width:long,height:Math.round(long/a)}:{width:Math.round(long*a),height:long};
}

/** A comic as the recipe keeps it: its layout, and for each panel what fills it and how it is framed. */
export function normalComic(comic={}){
 const layout=comicLayout(comic?.layout),n=(v,lo,hi,d)=>Number.isFinite(+v)?Math.min(hi,Math.max(lo,+v)):d;
 const given=Array.isArray(comic?.panels)?comic.panels:[];
 return {layout:layout.id,panels:layout.panels.map((_,i)=>{
  const p=given[i]||{},ref=typeof p.ref==='string'&&/^(place:[a-z-]{1,32}\/[a-z]{1,8}|shot:[\w:.-]{1,80}|own)$/.test(p.ref)?p.ref:null;
  return {ref,view:{x:n(p.view?.x,0,1,.5),y:n(p.view?.y,0,1,.5),zoom:n(p.view?.zoom,1,6,1)}};
 })};
}

// ---------- Geometry ----------
/** The polygon moved in along each of its edges by `by(edge)` pixels (convex, either way round). */
function offset(points,by){
 const n=points.length;let area=0;
 for(let i=0;i<n;i++){const [x0,y0]=points[i],[x1,y1]=points[(i+1)%n];area+=x0*y1-x1*y0;}
 const turn=area>0?1:-1,lines=[];
 for(let i=0;i<n;i++){
  const [x0,y0]=points[i],[x1,y1]=points[(i+1)%n],len=Math.hypot(x1-x0,y1-y0)||1;
  // The inward normal, and the edge moved along it.
  const nx=-(y1-y0)/len*turn,ny=(x1-x0)/len*turn,d=by(i);
  lines.push({x:x0+nx*d,y:y0+ny*d,dx:x1-x0,dy:y1-y0});
 }
 return lines.map((l,i)=>{
  const p=lines[(i-1+n)%n],den=p.dx*l.dy-p.dy*l.dx;
  if(Math.abs(den)<1e-9)return [l.x,l.y];
  const t=((l.x-p.x)*l.dy-(l.y-p.y)*l.dx)/den;
  return [p.x+p.dx*t,p.y+p.dy*t];
 });
}
const near=(a,b)=>Math.abs(a-b)<1e-6;
/** Which side of the inner area an edge lies on, if any (0 top, 1 right, 2 bottom, 3 left). */
function side([x0,y0],[x1,y1]){
 if(near(y0,0)&&near(y1,0))return 0;if(near(x0,1)&&near(x1,1))return 1;
 if(near(y0,1)&&near(y1,1))return 2;if(near(x0,0)&&near(x1,0))return 3;return -1;
}
function bounds(points){
 const xs=points.map(p=>p[0]),ys=points.map(p=>p[1]),x=Math.min(...xs),y=Math.min(...ys);
 return {x,y,w:Math.max(...xs)-x,h:Math.max(...ys)-y};
}
const geometryCache=new Map();
/**
 * The page at w×h pixels: each panel's polygon as it shows (inside its gutters), the larger polygon its picture is laid
 * in (on under the gutters and to the page's edge), its box, and whether it is an inset or bleeds.
 */
export function pageGeometry(layoutId,w,h){
 const key=`${layoutId}|${w}|${h}`;if(geometryCache.has(key))return geometryCache.get(key);
 const layout=comicLayout(layoutId),s=Math.min(w,h),gutter=GUTTER*s,margin=layout.bleed?0:MARGIN*s;
 const iw=w-2*margin,ih=h-2*margin,px=([u,v])=>[margin+u*iw,margin+v*ih];
 const panels=layout.panels.map(def=>{
  const inset=!Array.isArray(def),cell=inset?def.points:def,points=cell.map(px);
  if(inset){
   const ring=gutter*1.25;
   return {inset:true,points,bleed:offset(points,()=>-ring),ring:offset(points,()=>-ring),box:bounds(points),border:true};
  }
  const sides=cell.map((p,i)=>side(p,cell[(i+1)%cell.length]));
  // A gutter is shared, half on each side; the page's edge has no gutter, and the picture bleeds out to it.
  const shown=offset(points,i=>sides[i]<0?gutter/2:0),bleed=offset(points,i=>sides[i]<0?0:-margin-1);
  return {inset:false,points:shown,bleed,box:bounds(shown),border:!layout.bleed};
 });
 const g={layout:layout.id,width:w,height:h,gutter,margin,panels};
 if(geometryCache.size>40)geometryCache.clear();
 geometryCache.set(key,g);return g;
}
function inside(points,x,y){
 let sign=0;
 for(let i=0;i<points.length;i++){
  const [x0,y0]=points[i],[x1,y1]=points[(i+1)%points.length],c=(x1-x0)*(y-y0)-(y1-y0)*(x-x0);
  if(Math.abs(c)<1e-9)continue;const s=c>0?1:-1;if(sign&&s!==sign)return false;sign=s;
 }
 return true;
}
/** The panel under a point of the page (pixels), insets first; -1 in a gutter or the margin. */
export function panelAt(layoutId,w,h,x,y){
 const {panels}=pageGeometry(layoutId,w,h);
 for(let i=panels.length-1;i>=0;i--)if(panels[i].inset&&inside(panels[i].points,x,y))return i;
 for(let i=0;i<panels.length;i++)if(!panels[i].inset&&inside(panels[i].points,x,y))return i;
 return -1;
}
/** A panel's box as shares of the page (where a new sticker for it goes). */
export function panelArea(layoutId,i,w=1000,h=1000/comicLayout(layoutId).aspect){
 const b=pageGeometry(layoutId,w,h).panels[i]?.box;
 return b?{x:b.x/w,y:b.y/h,w:b.w/w,h:b.h/h}:{x:0,y:0,w:1,h:1};
}

// ---------- A picture in its panel ----------
/**
 * How a picture of iw×ih sits in a panel's box: covering it at `zoom` 1, larger with zoom, its point view.x, view.y at
 * the box's middle, held so the box is always covered. Returns the scale and the picture's point at the box's corner.
 */
export function fitPicture(box,iw,ih,view){
 const s=Math.max(box.w/iw,box.h/ih)*Math.max(1,view.zoom||1),hw=box.w/s/2,hh=box.h/s/2;
 const cx=Math.min(iw-hw,Math.max(hw,(view.x??.5)*iw)),cy=Math.min(ih-hh,Math.max(hh,(view.y??.5)*ih));
 return {s,x0:cx-hw,y0:cy-hh,view:{x:cx/iw,y:cy/ih,zoom:Math.max(1,view.zoom||1)}};
}
/** A view moved by dx, dy page pixels (a drag) and zoomed by k about a page point (a pinch). */
export function moveView(box,iw,ih,view,{dx=0,dy=0,k=1,at=null}={}){
 const f=fitPicture(box,iw,ih,view),zoom=Math.min(6,Math.max(1,f.view.zoom*k)),s2=Math.max(box.w/iw,box.h/ih)*zoom;
 // The picture's point under the pinch stays under it.
 const ax=at?at.x:box.x+box.w/2,ay=at?at.y:box.y+box.h/2;
 const px=f.x0+(ax-box.x)/f.s,py=f.y0+(ay-box.y)/f.s;
 const cx=px-(ax-box.x-box.w/2)/s2-dx/s2,cy=py-(ay-box.y-box.h/2)/s2-dy/s2;
 return fitPicture(box,iw,ih,{x:cx/iw,y:cy/ih,zoom}).view;
}

// ---------- Drawing ----------
function path(g,points){g.moveTo(...points[0]);for(let i=1;i<points.length;i++)g.lineTo(...points[i]);g.closePath();}
/**
 * The page's pictures: each panel's picture laid in its panel and on under its gutters, an empty panel left blank.
 * `pictures[i]` is {image, width, height, view} or null. This is what the Looks are drawn over.
 */
export function composePage(g,layoutId,w,h,pictures){
 const geo=pageGeometry(layoutId,w,h);
 g.save();g.fillStyle=UNDER;g.fillRect(0,0,w,h);
 geo.panels.forEach((p,i)=>{
  const pic=pictures[i];
  g.save();g.beginPath();path(g,p.bleed);g.clip();
  if(!pic?.image){g.fillStyle=EMPTY;g.fillRect(0,0,w,h);g.restore();return;}
  const f=fitPicture(p.box,pic.width,pic.height,pic.view||{});
  g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  // The whole picture, placed: what lies beyond the box shows under the gutter, and is covered by its paper.
  g.drawImage(pic.image,0,0,pic.width,pic.height,p.box.x-f.x0*f.s,p.box.y-f.y0*f.s,pic.width*f.s,pic.height*f.s);
  g.restore();
 });
 g.restore();
}
// The pen's small wobble along an edge, the same every time for the same page.
function inked(g,points,m){
 const wobble=(i,j)=>Math.sin(i*12.9898+j*78.233)*.0009*m;
 g.moveTo(...points[0]);
 points.forEach(([x0,y0],k)=>{
  const [x1,y1]=points[(k+1)%points.length],len=Math.hypot(x1-x0,y1-y0),steps=Math.max(3,Math.round(len/(.08*m)));
  const nx=-(y1-y0)/(len||1),ny=(x1-x0)/(len||1);
  for(let i=1;i<=steps;i++){const t=i/steps,o=i===steps?0:wobble(k+1,i);g.lineTo(x0+(x1-x0)*t+nx*o,y0+(y1-y0)*t+ny*o);}
 });
 g.closePath();
}
/** The paper between the panels and every panel's inked border, over the page after its Looks. */
export function drawComicFrame(g,layoutId,w,h){
 const geo=pageGeometry(layoutId,w,h),m=Math.min(w,h);
 g.save();
 g.beginPath();g.rect(0,0,w,h);for(const p of geo.panels)if(!p.inset)path(g,p.points);
 g.fillStyle=PAPER;g.fill('evenodd');
 g.strokeStyle=INK;g.lineWidth=LINE*m;g.lineJoin='miter';g.miterLimit=6;
 for(const p of geo.panels)if(!p.inset&&p.border){g.beginPath();inked(g,p.points,m);g.stroke();}
 for(const p of geo.panels)if(p.inset){
  g.beginPath();path(g,p.ring);path(g,p.points);g.fill('evenodd');
  g.beginPath();inked(g,p.points,m);g.stroke();
 }
 g.restore();
}
/** A layout's small picture for its button: the page's panels in outline. */
export function layoutIcon(layoutId,size=44){
 const layout=comicLayout(layoutId),a=layout.aspect,w=a>=1?size:Math.round(size*a),h=a>=1?Math.round(size/a):size;
 const geo=pageGeometry(layout.id,w*4,h*4),pts=p=>p.map(([x,y])=>`${(x/4).toFixed(2)},${(y/4).toFixed(2)}`).join(' ');
 return `<svg class="layout-icon" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true"><rect x=".5" y=".5" width="${w-1}" height="${h-1}" rx="1.5" class="page"/>`
  +geo.panels.map(p=>`<polygon points="${pts(p.points)}" class="cell"/>`).join('')+'</svg>';
}

// ---------- World's places ----------
const FEED=new URL('../johansson-town/assets/images/feed/',import.meta.url);
// The places by the storyteller's backdrop names (views.json), as the camera names them.
export const PLACE_NAMES=Object.freeze({
 sakura:'Sakura Shōten','sakura-street':'Outside Sakura',minato:'Minato Izakaya','sato-ramen':'Sato Ramen',books:'Front-Row',
 onsen:'Umi-no-yu','town-hall':'Community Hall',school:'School',clinic:'Clinic',harbour:'Harbour',pier:'Outer pier',
 ferry:'Minato Maru',park:'Harbour Park',garden:'Park pond',rainflower:'Rainflower Lane','fumoto-square':'Fumoto Square',
 'aoba-utaki':'Aoba Utaki','coral-bay':'Coral Bay','dock-workshop':'Chin & Tetsuo Repairs',
});
export const VIEW_NAMES=Object.freeze({wide:'Wide',push:'Close',low:'Low',high:'High',one:'Wide'});
let places;
/**
 * World's places as the storyteller photographed them: each with its views (Wide, Close, Low, High), their pictures
 * (1600×1200) and what the storyteller measured there (the camera, the floor a resident can stand on). The workshop
 * has one picture and no measures.
 */
export function loadPlaces(){
 places??=fetch(new URL('views.json',FEED)).then(r=>{if(!r.ok)throw new Error('No places');return r.json();}).then(views=>{
  const list=Object.entries(views).map(([id,v])=>({id,name:PLACE_NAMES[id]||id,thumb:new URL(`${id}.webp`,FEED).href,
   views:['wide','push','low','high'].filter(k=>v[k]).map(k=>({id:k,name:VIEW_NAMES[k],url:new URL(`${id}-${k}.webp`,FEED).href,camera:v[k].camera,stand:v[k].spots?.stand||[]}))}));
  list.push({id:'dock-workshop',name:PLACE_NAMES['dock-workshop'],thumb:new URL('dock-workshop.webp',FEED).href,views:[{id:'one',name:'Wide',url:new URL('dock-workshop.webp',FEED).href,camera:null,stand:[]}]});
  return list.sort((a,b)=>order(a.id)-order(b.id));
 }).catch(err=>{places=null;throw err;});
 return places;
}
const order=id=>{const i=Object.keys(PLACE_NAMES).indexOf(id);return i<0?99:i;};
export async function placeView(ref){
 const m=/^place:([a-z-]+)\/([a-z]+)$/.exec(ref||'');if(!m)return null;
 const place=(await loadPlaces()).find(p=>p.id===m[1]);
 return place?{place,view:place.views.find(v=>v.id===m[2])||place.views[0]}:null;
}

// ---------- Standing in the room ----------
// How tall the residents stand, by their sticker sheets (World's measures, about); a pair is as tall as its taller.
const STATURE={'johansson-pixar':1.78,'thuan-nils':1.78,thuan:1.55,'thuan-pixar':1.55,'thuan-blender':1.55,'thao-pixar':1.55};
export const statureOf=stickerId=>STATURE[String(stickerId).split('/')[0]]||null;
// In a sticker's picture the figure's head is about 4% from the top and its soles about 95.5% down (the die-cut edge
// and the shadow beyond them); measured on every sheet.
const FIGURE=.91,SOLE=.955;
/** A point in the room to the place's picture, as shares of its width and height (top first). */
export function project(camera,[x,y,z]){
 const [px,py,pz]=camera.position,[qx,qy,qz,qw]=camera.quaternion,P=camera.projection;
 // Into the camera's own frame: turned by the camera's rotation, backwards.
 const vx=x-px,vy=y-py,vz=z-pz,ix=-qx,iy=-qy,iz=-qz;
 const tx=2*(iy*vz-iz*vy),ty=2*(iz*vx-ix*vz),tz=2*(ix*vy-iy*vx);
 const cx=vx+qw*tx+(iy*tz-iz*ty),cy=vy+qw*ty+(iz*tx-ix*tz),cz=vz+qw*tz+(ix*ty-iy*tx);
 const X=P[0]*cx+P[4]*cy+P[8]*cz+P[12],Y=P[1]*cx+P[5]*cy+P[9]*cz+P[13],W=P[3]*cx+P[7]*cy+P[11]*cz+P[15];
 if(W<=1e-6)return null;
 return {x:(X/W+1)/2,y:(1-Y/W)/2};
}
/**
 * Where a resident's sticker stands in a panel showing one of World's places: on a spot of open floor the storyteller
 * found in that view, seen whole inside the panel, at the size a person of their height is there; away from the
 * residents already in the panel (`taken`: their feet, page shares). Null when no spot fits (then the sticker goes in
 * as anywhere else). Returns the sticker's centre and size as shares of the page (stickers.js).
 */
export function standInPanel({geometry,index,picture,view,stature,aspect=.5,taken=[]}){
 const p=geometry.panels[index];if(!p||!view?.camera||!view.stand?.length||!stature)return null;
 const {width:W,height:H}=geometry,f=fitPicture(p.box,picture.width,picture.height,picture.view||{});
 const toPage=pt=>({x:p.box.x+(pt.x*picture.width-f.x0)*f.s,y:p.box.y+(pt.y*picture.height-f.y0)*f.s});
 const options=[];
 for(const [x,y,z] of view.stand){
  const foot=project(view.camera,[x,y,z]),head=project(view.camera,[x,y+stature,z]);if(!foot||!head)continue;
  const a=toPage(foot),b=toPage(head),tall=a.y-b.y;if(tall<=0)continue;
  const size=tall/FIGURE,half=size*aspect/2;
  // Whole in the panel: the feet and the head inside, the sticker's sides too.
  if(!inside(p.points,a.x,a.y-tall*.02)||!inside(p.points,a.x,b.y)||!inside(p.points,a.x-half*.7,a.y-tall/2)||!inside(p.points,a.x+half*.7,a.y-tall/2))continue;
  const share=tall/p.box.h;if(share<.3||share>.92)continue;
  const apart=taken.reduce((d,t)=>Math.min(d,Math.abs(t.x*W-a.x)/(half*2)),Infinity);
  if(apart<.9)continue;
  // Liked: about two thirds of the panel's height, near the middle across, clear of the others.
  options.push({score:Math.abs(share-.66)*2+Math.abs((a.x-p.box.x)/p.box.w-.5)-Math.min(apart,3)*.05,a,size});
 }
 if(!options.length)return null;
 const best=options.sort((m,n)=>m.score-n.score)[0];
 return {x:best.a.x/W,y:(best.a.y-best.size*(SOLE-.5))/H,size:best.size/H};
}
