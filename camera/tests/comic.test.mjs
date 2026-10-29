// Pocket Camera's comics (comic.js) without a browser: every layout's gutters even and its panels whole, a panel found
// under a point, a picture always covering its panel however it is moved, a saved comic read back safely, World's
// places all named, and a resident standing on a place's floor where the storyteller measured it.
// Run from the repository root: node camera/tests/comic.test.mjs
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {COMIC_LAYOUTS,comicLayout,pageSize,pageGeometry,panelAt,panelArea,normalComic,fitPicture,moveView,project,standInPanel,statureOf,PLACE_NAMES,DEFAULT_LAYOUT} from '../comic.js';

const views=JSON.parse(readFileSync(new URL('../../johansson-town/assets/images/feed/views.json',import.meta.url)));
let n=0;const ok=(name,fn)=>{fn();n++;console.log(`ok  ${name}`);};
const box=pts=>{const xs=pts.map(p=>p[0]),ys=pts.map(p=>p[1]);return {x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)};};
// A point inside a convex polygon: on the same side of every edge.
const within=(pts,x,y)=>new Set(pts.map(([x0,y0],i)=>{const [x1,y1]=pts[(i+1)%pts.length];return Math.sign((x1-x0)*(y-y0)-(y1-y0)*(x-x0));})).size===1;

ok('eight layouts, each with a page shape and panels; the default is one of them',()=>{
 assert.deepEqual(COMIC_LAYOUTS.map(l=>l.id),['one','strip','four','koma','rows','hero','action','inset']);
 assert.equal(comicLayout('nonsense').id,DEFAULT_LAYOUT);assert.ok(COMIC_LAYOUTS.some(l=>l.id===DEFAULT_LAYOUT));
});
ok('a page is saved at 3000 pixels on its long side, its own shape',()=>{
 for(const l of COMIC_LAYOUTS){const s=pageSize(l.id);assert.equal(Math.max(s.width,s.height),3000);assert.ok(Math.abs(s.width/s.height-l.aspect)<.002,l.id);}
 assert.deepEqual(pageSize('hero',2048),{width:1536,height:2048});
});
ok('equal panels are equal, and every gutter between straight panels is the same width',()=>{
 const equal={strip:[0,1,2],four:[0,1,2,3],koma:[0,1,2,3],rows:[0,1,2],hero:[1,2]};
 for(const [id,list] of Object.entries(equal)){
  const {width,height}=pageSize(id),g=pageGeometry(id,width,height),sizes=list.map(i=>g.panels[i].box);
  for(const b of sizes){assert.ok(Math.abs(b.w-sizes[0].w)<.5&&Math.abs(b.h-sizes[0].h)<.5,`${id}: ${sizes.map(s=>`${s.w.toFixed(1)}×${s.h.toFixed(1)}`)}`);}
 }
 for(const id of ['strip','four','koma','rows','hero']){
  const {width,height}=pageSize(id),g=pageGeometry(id,width,height),gaps=[];
  for(const a of g.panels)for(const b of g.panels){
   if(a===b)continue;
   const across=b.box.x-(a.box.x+a.box.w),down=b.box.y-(a.box.y+a.box.h);
   const overlapY=Math.min(a.box.y+a.box.h,b.box.y+b.box.h)-Math.max(a.box.y,b.box.y),overlapX=Math.min(a.box.x+a.box.w,b.box.x+b.box.w)-Math.max(a.box.x,b.box.x);
   if(across>0&&overlapY>0&&across<g.gutter*3)gaps.push(across);
   if(down>0&&overlapX>0&&down<g.gutter*3)gaps.push(down);
  }
  assert.ok(gaps.length>0,id);for(const d of gaps)assert.ok(Math.abs(d-g.gutter)<.5,`${id}: gutter ${d.toFixed(2)} not ${g.gutter.toFixed(2)}`);
 }
});
ok('the panels stay inside the page and its margin, and do not overlap (an inset sits over its splash)',()=>{
 for(const l of COMIC_LAYOUTS){
  const {width,height}=pageSize(l.id),g=pageGeometry(l.id,width,height);
  for(const p of g.panels)for(const [x,y] of p.points)assert.ok(x>=g.margin-.01&&x<=width-g.margin+.01&&y>=g.margin-.01&&y<=height-g.margin+.01,l.id);
  // A grid of points: none is in two panels that are not an inset over its splash (each panel asked on its own), and
  // every panel holds some of them.
  const found=g.panels.map(()=>0);
  for(let y=5;y<height;y+=97)for(let x=5;x<width;x+=97){
   const holding=g.panels.map((p,i)=>!p.inset&&within(p.points,x,y)?i:-1).filter(i=>i>=0);holding.forEach(i=>found[i]++);
   assert.ok(holding.length<=1,`${l.id}: (${x}, ${y}) is in ${holding.length} panels`);
  }
  g.panels.forEach((p,i)=>assert.ok(p.inset||found[i]>0,`${l.id}: the grid finds panel ${i+1}`));
 }
});
ok('a point in a panel finds it, insets first; a gutter finds none',()=>{
 for(const l of COMIC_LAYOUTS){
  const {width,height}=pageSize(l.id),g=pageGeometry(l.id,width,height);
  g.panels.forEach((p,i)=>{const b=p.box;assert.equal(panelAt(l.id,width,height,b.x+b.w/2,b.y+b.h/2),i,`${l.id} panel ${i}`);});
 }
 const {width,height}=pageSize('four'),g=pageGeometry('four',width,height),b=g.panels[0].box;
 assert.equal(panelAt('four',width,height,b.x+b.w+g.gutter/2,b.y+b.h/2),-1,'the gutter between two panels');
 assert.equal(panelAt('four',width,height,2,2),-1,'the margin');
 const a=panelArea('inset',1);assert.ok(a.x>.5&&a.y>.6&&a.w<.45,'the inset’s area as shares of the page');
});
ok('a picture covers its panel however it is dragged or pinched',()=>{
 const b={x:100,y:50,w:400,h:300};
 for(const [iw,ih] of [[1600,1200],[1200,1600],[3000,800]]){
  let v={x:.5,y:.5,zoom:1};
  for(const m of [{dx:5000},{dy:-5000},{k:3,at:{x:110,y:60}},{dx:-9000,dy:9000},{k:.1},{k:40}]){
   v=moveView(b,iw,ih,v,m);const f=fitPicture(b,iw,ih,v);
   assert.ok(v.zoom>=1&&v.zoom<=6);
   assert.ok(f.x0>=-1e-6&&f.y0>=-1e-6&&f.x0+b.w/f.s<=iw+1e-6&&f.y0+b.h/f.s<=ih+1e-6,`${iw}×${ih} ${JSON.stringify(m)}: the box stays covered`);
  }
 }
 // Pinching about a point keeps that point of the picture under the fingers.
 const v=moveView(b,1600,1200,{x:.5,y:.5,zoom:1.5},{k:2,at:{x:300,y:200}}),f0=fitPicture(b,1600,1200,{x:.5,y:.5,zoom:1.5}),f1=fitPicture(b,1600,1200,v);
 assert.ok(Math.abs((f0.x0+(300-b.x)/f0.s)-(f1.x0+(300-b.x)/f1.s))<1e-6);
});
ok('a saved comic is read back safely: unknown layouts, refs and views are made harmless',()=>{
 const c=normalComic({layout:'four',panels:[{ref:'place:sakura/wide',view:{x:2,zoom:99}},{ref:'javascript:alert(1)'},{ref:'shot:abc-12'},{ref:'own',view:{y:-1}}]});
 assert.equal(c.layout,'four');assert.equal(c.panels.length,4);
 assert.deepEqual(c.panels.map(p=>p.ref),['place:sakura/wide',null,'shot:abc-12','own']);
 assert.deepEqual(c.panels[0].view,{x:1,y:.5,zoom:6});assert.equal(c.panels[3].view.y,0);
 assert.equal(normalComic({layout:'nope'}).layout,DEFAULT_LAYOUT);assert.equal(normalComic(null).panels.length,comicLayout(DEFAULT_LAYOUT).panels.length);
});
ok('every one of World’s places has a name in the camera',()=>{
 for(const id of Object.keys(views))assert.ok(PLACE_NAMES[id],`${id} has no name in comic.js PLACE_NAMES`);
});
ok('the places’ cameras are rebuilt: each floor spot lands where the storyteller measured it',()=>{
 let worst=0,count=0;
 for(const v of Object.values(views))for(const view of Object.values(v))for(const s of view.spots?.stand||[]){
  const q=project(view.camera,s.slice(0,3));worst=Math.max(worst,Math.hypot(q.x-s[3],q.y-s[4]));count++;
 }
 assert.ok(count>1000);assert.ok(worst<.002,`worst ${worst}`);
});
ok('a resident stands on a place’s floor, whole inside the panel, upright and at their height there',()=>{
 assert.equal(statureOf('johansson-pixar/Wave'),1.78);assert.equal(statureOf('thuan-blender/v-wave'),1.55);assert.equal(statureOf('mine:abc'),null);
 const {width,height}=pageSize('hero'),geometry=pageGeometry('hero',width,height);
 let stood=0;
 for(const [id,v] of Object.entries(views)){
  // As loadPlaces() hands a view on: its camera and its standing spots.
  const view=v.wide&&{camera:v.wide.camera,stand:v.wide.spots.stand};if(!view)continue;
  const picture={width:1600,height:1200,view:{x:.5,y:.5,zoom:1}};
  const s=standInPanel({geometry,index:0,picture,view,stature:1.55,aspect:.5});if(!s)continue;stood++;
  const p=geometry.panels[0].box,foot=(s.y+s.size*(.955-.5))*height,top=(s.y-s.size/2)*height;
  assert.ok(foot<=p.y+p.h+1&&top>=p.y-1,`${id}: inside the panel`);
  // The sticker's feet are on one of the measured spots.
  const f=fitPicture(p,1600,1200,picture.view);
  const onSpot=view.stand.some(([x,y,z])=>{const q=project(view.camera,[x,y,z]);return Math.abs(p.x+(q.x*1600-f.x0)*f.s-s.x*width)<1&&Math.abs(p.y+(q.y*1200-f.y0)*f.s-foot)<1;});
  assert.ok(onSpot,`${id}: the feet on a measured spot`);
  // Two residents in one panel stand apart.
  const t=standInPanel({geometry,index:0,picture,view,stature:1.78,aspect:.5,taken:[{x:s.x}]});
  if(t)assert.ok(Math.abs(t.x-s.x)*width>s.size*height*.5*.9,`${id}: apart`);
 }
 assert.ok(stood>=12,`${stood} of the places have a spot for a resident in a big panel`);
 assert.equal(standInPanel({geometry,index:0,picture:{width:1600,height:1200,view:{}},view:{camera:null,stand:[]},stature:1.55}),null,'no measures, no standing');
});
console.log(`${n} comic checks pass`);
