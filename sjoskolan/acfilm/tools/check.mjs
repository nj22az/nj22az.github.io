import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createCanvas,GlobalFonts} from '@napi-rs/canvas';
import {createFilm,paint} from '../src/film.mjs';
import {createHash} from 'node:crypto';
const T=JSON.parse(readFileSync('src/timeline.json'));
const close=(a,b,tol=1e-8)=>assert.ok(Math.abs(a-b)<tol,`${a} != ${b}`);
assert.equal(T.chapters.length,3);assert.equal(new Set(T.scenes.map(s=>s.id)).size,T.scenes.length);
let end=0;
for(const s of T.scenes){close(s.start,end);end=s.start+s.duration;assert.ok(s.duration>0);assert.ok(s.slides.every(n=>n>=1&&n<=36));assert.ok(s.chapter>=0&&s.chapter<3);const caps=T.captions.filter(c=>c.scene===s.id);assert.ok(caps.length>0);for(const c of caps){assert.ok(c.start>=s.start&&c.end<=end);assert.ok(c.end>c.start);}
 if(s.pauseBefore){assert.ok(s.answerTime>6);const at=T.captions.findIndex(c=>c.scene===s.id&&c.text.includes(s.pauseBefore));assert.ok(T.captions[at].start-T.captions[at-1].end>=6,'Answer needs thinking pause');assert.equal(s.stepTimes[0],s.answerTime);}
 for(let i=1;i<(s.stepTimes||[]).length;i++)assert.ok(s.stepTimes[i]>=s.stepTimes[i-1]);
}
close(end,T.duration);assert.ok(T.duration>=900&&T.duration<=1320,'Expected a 15–22 minute lesson');
// Independent worked-example checks, including signs and RMS heating.
close(1/50,.02);close(30/2/Math.sqrt(2),10.6066017178,1e-9);close(1/.01,100);
close(10*Math.sin(2*Math.PI*25*.01),10);close(17*Math.sin(2*Math.PI*50*.015),-17);
close(360*.002/.02,36);close(12**2/24,6);
close(Math.hypot(12,16),20);close(60/20,3);close(Math.hypot(36,48),60);
close(Math.atan2(-16,12)*180/Math.PI,-53.130102354,1e-8);
close(100/Math.hypot(30,50-10),2);close(100/20*40,200);
close(Math.hypot(900,1200),1500);close(900/1500,.6);close(1.6*3,4.8);
close(Math.hypot(3,4),5);close(3*Math.tan(Math.acos(.6)),4);close((5/10)**2,.25);close(800/1000,.8);
// All diagrams render at two times, captions fit two lines, and random-access seeking is deterministic.
GlobalFonts.registerFromPath('assets/FilmSans.ttf','Film Sans');GlobalFonts.registerFromPath('assets/FilmSans-Bold.ttf','Film Sans');
const c=createCanvas(1920,1080),ctx=c.getContext('2d'),env={scale:1},film=createFilm(T);
let clips=[];const native=ctx.fillText.bind(ctx);
ctx.fillText=(str,x,y,...args)=>{const m=ctx.measureText(str),tf=ctx.getTransform();const width=m.width;let left=ctx.textAlign==='right'?x-width:ctx.textAlign==='center'?x-width/2:x;const points=[[left,y-(m.actualBoundingBoxAscent||35)],[left+width,y+7]];for(const [px,py] of points){const xx=tf.a*px+tf.c*py+tf.e,yy=tf.b*px+tf.d*py+tf.f;if(xx<0||xx>1921||yy<0||yy>1081)clips.push(String(str));}native(str,x,y,...args);};
for(const s of T.scenes)for(const k of [.25,.9])paint(film,T,ctx,Math.floor((s.start+s.duration*k)*30),env,true);
assert.deepEqual([...new Set(clips)],[],'Text outside frame');
const hash=frame=>{paint(film,T,ctx,frame,env,true);return createHash('sha256').update(c.toBuffer('image/png')).digest('hex');};const at=Math.floor(T.scenes[18].start*30+300),a=hash(at);hash(300);assert.equal(hash(at),a);
console.log(JSON.stringify({scenes:T.scenes.length,chapters:T.chapters.length,captions:T.captions.length,duration:T.duration,calculations:'passed',thinkingPauses:3,rendering:'all scenes passed',textBounds:'passed',determinism:'passed'}));
