import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,mkdir,symlink,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {decodeImage,imageType,readImage,validateEdit,MAX_IMAGE_BYTES} from './policy.mjs';
import {TOOLS,callTool} from './tools.mjs';
import {CameraSession} from './session.mjs';
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aX1sAAAAASUVORK5CYII=','base64');
const catalog={looks:[{id:'none'},{id:'crayon'}],papers:[{id:'none'}],frames:[{id:'none'}]};
test('strict image bytes and bounded payloads',()=>{
 assert.equal(decodeImage(png.toString('base64')).mimeType,'image/png');
 for(const value of ['https://example.com/image.png','data:image/png;base64,'+png.toString('base64'),'abcd=','<svg/>'])assert.throws(()=>decodeImage(value));
 assert.throws(()=>imageType(Buffer.alloc(MAX_IMAGE_BYTES+1)));
 assert.throws(()=>imageType(Buffer.from('<svg>not an approved image</svg>')));
});
test('imports stay inside the approved folder, including symlinks',async()=>{
 const root=await mkdtemp(join(tmpdir(),'camera-policy-'));try{
  const input=join(root,'in');await mkdir(input);await writeFile(join(input,'image.png'),png);await writeFile(join(root,'outside.png'),png);
  assert.equal((await readImage(input,'image.png')).mimeType,'image/png');
  await assert.rejects(readImage(input,'../outside.png'),/outside/);
  await symlink(join(root,'outside.png'),join(input,'linked.png'));await assert.rejects(readImage(input,'linked.png'),/outside/);
  await assert.rejects(readImage(null,'image.png'),/CAMERA_MCP_INPUT_DIR/);
 }finally{await rm(root,{recursive:true,force:true});}
});
test('valid edit preserves explicit values',()=>{
 const edit={layers:[{look:'crayon',amount:.65}],adjust:{light:-.2},enhance:0,paper:'none',frame:'none',crop:{x:.1,y:.2,w:.8,h:.7}};
 assert.equal(validateEdit(edit,catalog),edit);
});
test('all invalid edits fail before browser mutation',()=>{
 for(const edit of [{},{foo:1},{layers:[]},{layers:[{look:'invented',amount:1}]},{layers:[{look:'none',amount:NaN}]},{layers:Array(4).fill({look:'none',amount:1})},{adjust:{exposure:1}},{enhance:2},{paper:'alien'},{frame:'alien'},{crop:{x:.9,y:0,w:.2,h:1}},{crop:{x:0,y:0,w:0,h:1}},{crop:{x:0,y:0,w:1}}])assert.throws(()=>validateEdit(edit,catalog));
});
test('tool catalog has strict schemas and no capture/share/delete/eval tools',()=>{
 assert.equal(TOOLS.length,11);assert.equal(new Set(TOOLS.map(t=>t.name)).size,11);
 for(const tool of TOOLS){assert.equal(tool.input.additionalProperties,false);assert.ok(tool.description);}
 assert.ok(!TOOLS.some(t=>/capture|share|delete|eval|publish/.test(t.name)));
});
test('close requires explicit confirmation; dispatch unwraps edits',async()=>{
 let called=false;const session={close:async()=>{called=true;},edit:async e=>e};
 await assert.rejects(callTool('camera_close',{},session),/confirm/);assert.equal(called,false);
 await callTool('camera_close',{confirm:true},session);assert.equal(called,true);
 assert.deepEqual(await callTool('camera_edit',{edit:{enhance:.4}},session),{enhance:.4});
 await assert.rejects(callTool('unknown',{},session),/Unknown/);
});
test('save/export confirmation fails without touching a browser',async()=>{
 const s=new CameraSession();await assert.rejects(s.save(),/confirm/);await assert.rejects(s.exportPhoto({id:'x'}),/confirm/);
 await assert.rejects(s.state(),/camera_open/);await assert.rejects(s.requireEditor(),/camera_open/);
});
test('startup failure closes the preview',async()=>{
 let closed=0;const s=new CameraSession({serve:async()=>({url:'http://127.0.0.1:1234/',close:async()=>{closed++;}}),launch:async()=>{throw Error('launch failed');}});
 await assert.rejects(s.open(),/launch failed/);assert.ok(closed);assert.equal(s.page,null);
});
test('cancellation during launch closes the late browser',async()=>{
 let release,closed=0;const pending=new Promise(resolve=>{release=resolve;});
 const s=new CameraSession({serve:async()=>({url:'http://127.0.0.1:1234/',close:async()=>{}}),launch:()=>pending});
 const opened=s.open();await new Promise(resolve=>setImmediate(resolve));await s.close();
 release({close:async()=>{closed++;}});await assert.rejects(opened,/cancelled/);assert.ok(closed);assert.equal(s.page,null);
});
