import test from 'node:test';
import assert from 'node:assert/strict';
import {findSpots} from '../retouch-analysis.js';
const image=(w=256,h=192)=>{const data=new Uint8ClampedArray(w*h*4);for(let i=0;i<data.length;i+=4)data.set([194,163,139,255],i);return {data,width:w,height:h};};
const dot=(im,cx,cy,r,colour=[105,65,45])=>{for(let y=0;y<im.height;y++)for(let x=0;x<im.width;x++)if(Math.hypot(x-cx,y-cy)<=r)im.data.set([...colour,255],(y*im.width+x)*4);};

test('flat fields and a smooth exposure gradient are not suggested',()=>{
 assert.deepEqual(findSpots(image()),[]);
 const im=image();for(let y=0;y<im.height;y++)for(let x=0;x<im.width;x++){const i=(y*im.width+x)*4;im.data[i]+=x*.15;im.data[i+1]+=x*.15;im.data[i+2]+=x*.15;}
 assert.deepEqual(findSpots(im),[]);
});
test('compact contrasting spots are found without changing source bytes',()=>{
 const im=image();dot(im,128,96,4);const before=new Uint8ClampedArray(im.data),spots=findSpots(im);
 assert.ok(spots.length);assert.ok(Math.hypot(spots[0].x*256-128,spots[0].y*192-96)<4);
 assert.ok(spots[0].r*192>=4);assert.deepEqual(im.data,before);
 assert.ok(spots.every(s=>s.x>0&&s.x<1&&s.y>0&&s.y<1&&s.r<=.045));
});
test('texture and strong continuous edges do not turn into dozens of suggestions',()=>{
 const im=image();for(let y=0;y<im.height;y++)for(let x=0;x<im.width;x++){const i=(y*im.width+x)*4,v=(x+y)%2?35:-35;for(let c=0;c<3;c++)im.data[i+c]+=v;}
 assert.deepEqual(findSpots(im),[]);
 const edge=image();for(let y=0;y<edge.height;y++)for(let x=128;x<256;x++)edge.data.set([80,70,60,255],(y*256+x)*4);
 assert.deepEqual(findSpots(edge),[]);
});
test('transparent areas, borders and large shapes are excluded',()=>{
 const im=image();dot(im,128,96,30);dot(im,2,2,2);assert.deepEqual(findSpots(im),[]);
 const transparent=image();dot(transparent,128,96,3);for(let i=3;i<transparent.data.length;i+=4)transparent.data[i]=0;
 assert.deepEqual(findSpots(transparent),[]);
});
test('suggestions are deterministic, separated and bounded',()=>{
 const im=image();for(let y=25;y<180;y+=40)for(let x=25;x<240;x+=40)dot(im,x,y,2);
 const spots=findSpots(im,{limit:4});assert.equal(spots.length,4);assert.deepEqual(findSpots(im,{limit:4}),spots);
 for(let i=0;i<spots.length;i++)for(let j=i+1;j<spots.length;j++)assert.ok(Math.hypot((spots[i].x-spots[j].x)*256,(spots[i].y-spots[j].y)*192)>10);
});
test('invalid and oversized images are refused before allocation',()=>{
 for(const im of [{data:[],width:5000,height:5000},{data:[],width:-1,height:20},{data:[],width:20,height:20}])assert.deepEqual(findSpots(im),[]);
});
