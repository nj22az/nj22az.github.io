import assert from 'node:assert/strict';
import {normalCrop,cropAtAspect,cropZoom,cropFaceToWindow} from '../crop.js';
import {normalRecipe} from '../looks-gl.js';

assert.deepEqual(normalRecipe().crop,{x:0,y:0,w:1,h:1},'existing albums show the whole source');
assert.deepEqual(normalCrop({x:2,y:-1,w:.5,h:.25}),{x:.5,y:0,w:.5,h:.25});
assert.deepEqual(normalCrop({x:NaN,y:Infinity,w:'bad',h:null}),{x:0,y:0,w:1,h:1});
const stored={x:.12,y:.21,w:.4,h:.5};
assert.deepEqual(normalRecipe(JSON.parse(JSON.stringify({crop:stored}))).crop,stored,'album recipe keeps the source rectangle');
for(const [width,height] of [[4000,3000],[3000,4000],[640,480]])for(const aspect of [1,4/3,3/4,16/9,9/16,width/height])for(const zoom of [1,2,4]){
 const c=cropAtAspect(width,height,aspect,zoom,.9,.1);
 assert.ok(Math.abs(c.w*width/(c.h*height)-aspect)<1e-9,'shape keeps its proportions');
 assert.ok(c.x>=0&&c.y>=0&&c.x+c.w<=1.000001&&c.y+c.h<=1.000001,'crop stays inside the source');
 assert.ok(Math.abs(cropZoom(width,height,c)-zoom)<1e-9,'zoom survives a saved recipe');
}
// A face brought to a window (a face cutout's hole): where the face lands, as shares of the window.
const landed=(width,height,c,face,win)=>({
 dx:((face.x+face.w/2-c.x)/c.w-(win.x+win.w/2))/win.w,dy:((face.y+face.h/2-c.y)/c.h-(win.y+win.h/2))/win.h,
 tall:face.h/c.h/win.h,wide:face.w/c.w/win.w,shape:c.w*width/(c.h*height),zoom:cropZoom(width,height,c),
 inside:c.x>=0&&c.y>=0&&c.x+c.w<=1.000001&&c.y+c.h<=1.000001});
const win={x:.28,y:.2,w:.44,h:.33};
for(const [width,height] of [[4000,3000],[3000,4000],[640,960]])for(const shape of [width/height,1,16/9,3/4]){
 const from=cropAtAspect(width,height,shape);
 // A small face in the middle of the photo: exactly `fill` of the window's height (or as wide as the window lets it), at its middle.
 const small={x:.45,y:.4,w:.07*height/width,h:.09},a=landed(width,height,cropFaceToWindow(width,height,from,small,win),small,win);
 assert.ok(Math.abs(a.dx)<1e-9&&Math.abs(a.dy)<1e-9,`a small face is at the window's middle ${JSON.stringify(a)}`);
 assert.ok(Math.abs(Math.max(a.tall/.86,a.wide/.94)-1)<1e-9,`and fills it as asked ${JSON.stringify(a)}`);
 assert.ok(a.inside&&Math.abs(a.shape-shape)<1e-9,'the crop keeps its shape, inside the photo');
 // A face too big for the window (a close portrait): centred as far as the photo lets it, brows to mouth still in the window.
 const big={x:.3,y:.2,w:.4*Math.min(1,height/width),h:.45},b=landed(width,height,cropFaceToWindow(width,height,from,big,win),big,win);
 assert.ok(b.inside&&Math.abs(b.shape-shape)<1e-9&&b.zoom>=1-1e-9&&b.zoom<=4+1e-9,JSON.stringify(b));
 const least=landed(width,height,from,big,win);   // against the largest crop of this shape, which nothing can better
 assert.ok(b.tall<=Math.max(1.5,least.tall)+1e-9&&b.wide<=Math.max(1.25,least.wide)+1e-9,`a big face is not brought in past what the window shows of it: ${JSON.stringify(b)}`);
 // A speck of a face: the Crop tab's own limit holds; a face in a corner: the crop stops at the photo's edge.
 const speck={x:.5,y:.5,w:.01,h:.012};assert.ok(Math.abs(cropZoom(width,height,cropFaceToWindow(width,height,from,speck,win))-4)<1e-9);
 // A face a tap pointed out (its size a guess) is at the window's middle whenever the Crop tab's zoom reaches that far.
 for(const [x,y] of [[.33,.66],[.5,.5],[.7,.3],[.25,.4]]){
  const tapped={x:x-.18,y:y-.15,w:.36,h:.3},t=landed(width,height,cropFaceToWindow(width,height,from,tapped,win,{measured:false}),tapped,win);
  assert.ok(t.inside&&Math.abs(t.shape-shape)<1e-9&&(t.zoom>4-1e-9||(Math.abs(t.dx)<1e-9&&Math.abs(t.dy)<1e-9)),`a tapped face: ${JSON.stringify(t)}`);
 }
 const corner={x:.9,y:.02,w:.08*height/width,h:.1},d=landed(width,height,cropFaceToWindow(width,height,from,corner,win),corner,win);
 assert.ok(d.inside&&d.zoom<=4+1e-9,JSON.stringify(d));
}
// The portrait the editor is tested with: a face of 45% by 36% of 640×960, off to the right; the frog's hole.
{const face={x:.372392,y:.233072,w:.453816,h:.359856},hole={x:.5-16/72,y:.5+(43.6-50-17.6)/72*640/960,w:32/72,h:35.2/72*640/960};
 const a=landed(640,960,cropFaceToWindow(640,960,{x:0,y:0,w:1,h:1},face,hole),face,hole);
 // Brought in until the face is one and a quarter of the hole's width; the photo's right edge then stops it a hair short of the middle.
 assert.ok(Math.abs(a.dx)<.03&&Math.abs(a.dy)<.03&&a.tall>1&&a.tall<=1.5+1e-9&&a.wide<=1.25+1e-9&&a.zoom>1,`the portrait's face comes to the frog's hole: ${JSON.stringify(a)}`);}
console.log('crop: existing recipes, bounds, aspect ratios, zoom round trips and a face brought to a window pass');
