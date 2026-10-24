import test from 'node:test';
import assert from 'node:assert/strict';
import {saveRoute,deliverFile,createReadyFile,dataURLToBlob,canShareFile} from '../studio-share.mjs';

const png=()=>new File([new Uint8Array([137,80,78,71])],'scene.png',{type:'image/png'});
function fakeDoc(){const clicks=[];return {clicks,body:{append(){}},createElement(){const a={click(){clicks.push({href:a.href,download:a.download});},remove(){}};return a;}};}
function fakeNav({can=true,result=Promise.resolve()}={}){const calls=[];return {calls,canShare:d=>can&&d.files.length===1,share(d){calls.push(d);return result;}};}

test('an iPad gets the share sheet (Save Image), a desktop a download',()=>{
 assert.equal(saveRoute(png(),{nav:fakeNav(),touch:true}),'share');
 assert.equal(saveRoute(png(),{nav:fakeNav(),touch:false}),'download','desktop browsers that can share still download');
 assert.equal(saveRoute(png(),{nav:fakeNav({can:false}),touch:true}),'download');
 assert.equal(canShareFile(png(),{share(){},canShare(){throw Error('no');}}),false);assert.equal(canShareFile(png(),undefined),false);
});
test('the file is handed over synchronously, inside the tap',async()=>{
 const nav=fakeNav(),doc=fakeDoc(),results=[];const file=png();
 assert.equal(deliverFile(file,{nav,doc,touch:true,onResult:r=>results.push(r)}),'share');
 assert.equal(nav.calls.length,1,'share() was called before deliverFile returned');assert.equal(nav.calls[0].files[0],file);assert.equal(doc.clicks.length,0);
 await new Promise(r=>setTimeout(r));assert.deepEqual(results.map(r=>[r.route,r.ok]),[['share',true]]);
 const cancelled=[];deliverFile(file,{nav:fakeNav({result:Promise.reject(Object.assign(Error('closed'),{name:'AbortError'}))}),doc,touch:true,onResult:r=>cancelled.push(r)});
 await new Promise(r=>setTimeout(r));assert.equal(cancelled[0].cancelled,true);
 const down=fakeDoc();assert.equal(deliverFile(file,{url:'blob:ready',nav,doc:down,touch:false}),'download');
 assert.deepEqual(down.clicks,[{href:'blob:ready',download:'scene.png'}],'a real download link clicked in the same tap');
});
test('files are made ahead of time, a change forgets the old one, and a late tap still gets one',async()=>{
 let builds=0,changes=0;const ready=createReadyFile({name:'scene.png',type:'image/png',build:async()=>{builds++;return new Blob(['png'+builds]);},buildNow:()=>new Blob(['now']),onChange:()=>changes++,delay:5});
 assert.equal(ready.ready,false);assert.equal((await ready.now().file.text()),'now','made on the spot before it is ready');
 ready.schedule();await new Promise(r=>setTimeout(r,30));assert.equal(ready.ready,true);assert.equal(ready.file.name,'scene.png');assert.ok(ready.url.startsWith('blob:'));
 assert.equal(await ready.now().file.text(),'png1');
 ready.schedule(50);assert.equal(ready.ready,false,'stale picture never saved');ready.schedule(5);await new Promise(r=>setTimeout(r,80));assert.equal(builds,2,'only the latest change is built');
 ready.invalidate();assert.equal(ready.ready,false);ready.dispose();assert.ok(changes>=3);
});
test('a data URL becomes the same bytes',async()=>{
 const blob=dataURLToBlob('data:image/png;base64,'+Buffer.from('hello').toString('base64'));
 assert.equal(blob.type,'image/png');assert.equal(await blob.text(),'hello');
});
