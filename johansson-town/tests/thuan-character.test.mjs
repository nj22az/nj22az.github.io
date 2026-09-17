import test from 'node:test';
import assert from 'node:assert/strict';
import {createThuanFaceController,findMorphTargets,EXPRESSIONS} from '../src/people/thuan-face-controller.js';
import {createThuanVoice,selectVoice} from '../src/people/thuan-voice.js';
import {parseReply,detectWebGPU,createThuanMind,SYSTEM_PROMPT,MODEL_ID} from '../src/people/thuan-mind.js';

/** A stand-in for the procedural face: records the last weights it was handed. */
const recorder=()=>{const seen=[];return {seen,apply:w=>seen.push({...w})};};
/** Runs the controller for a stretch of simulated time at a fixed step. */
const run=(controller,seconds,step=1/60,from=0)=>{
 let elapsed=from;
 for(let t=0;t<seconds;t+=step){elapsed+=step;controller.update(step,elapsed);}
 return elapsed;
};

test('a rig with no morph targets falls back to the procedural face',()=>{
 // This is the shipped model: yuri-merged.glb is a body rig with zero blendshapes.
 const bare={traverse(fn){fn({isMesh:true});}};
 assert.equal(findMorphTargets(bare),null);
 assert.equal(findMorphTargets(null),null);
 const face=recorder();
 const controller=createThuanFaceController({model:bare,face});
 assert.equal(controller.usingMorphTargets,false);
 controller.update(1/60,1);
 assert.equal(face.seen.length,1,'The procedural face is driven instead');
});

test('an ARKit rig is driven by blendshape name, and missing shapes are skipped',()=>{
 // Only some of the 52 are present: a partial export must not throw.
 const influences=[0,0,0,0];
 const mesh={isMesh:true,morphTargetDictionary:{eyeBlinkLeft:0,eyeBlinkRight:1,jawOpen:2,mouthSmileLeft:3},
  morphTargetInfluences:influences};
 const model={traverse(fn){fn(mesh);}};
 const found=findMorphTargets(model);
 assert.deepEqual(found.indices.blink,[0,1]);
 assert.deepEqual(found.indices.mouthOpen,[2]);
 assert.equal(found.indices.browInner,undefined,'browInnerUp is absent from this rig');
 const controller=createThuanFaceController({model,random:()=>0});
 assert.equal(controller.usingMorphTargets,true);
 controller.setExpression('smile');
 run(controller,2);
 assert.ok(influences[3]>.5,'mouthSmileLeft follows the smile weight');
 assert.ok(influences.every(v=>v>=0&&v<=1),'Every influence stays in range');
});

test('blinking is randomised between 2.5 and 6 seconds and closes on a sine',()=>{
 // A fixed source pins the interval to its minimum so the test is deterministic.
 const face=recorder();
 const controller=createThuanFaceController({face,random:()=>0});
 let elapsed=0,peak=0,shut=0;
 for(let t=0;t<2.4;t+=1/60){elapsed+=1/60;controller.update(1/60,elapsed);peak=Math.max(peak,controller.weights.blink);}
 assert.equal(peak,0,'No blink before the minimum interval has passed');
 for(let t=0;t<.4;t+=1/240){elapsed+=1/240;controller.update(1/240,elapsed);
  peak=Math.max(peak,controller.weights.blink);if(controller.weights.blink>.9)shut++;}
 assert.ok(peak>.98,'The lid reaches fully shut');
 assert.ok(shut>0&&shut<60,'It is a blink, not a stare: shut only briefly');
 assert.equal(controller.weights.blink,0,'and it opens again');
 // The longest interval must still fire within its window.
 const slow=createThuanFaceController({face:recorder(),random:()=>1});
 let seen=0,clock=0;
 for(let t=0;t<6.4;t+=1/60){clock+=1/60;slow.update(1/60,clock);if(slow.weights.blink>.9)seen++;}
 assert.ok(seen>0,'A blink still arrives at the top of the range');
});

test('sleep holds the lids shut through the blink cycle',()=>{
 const controller=createThuanFaceController({face:recorder(),random:()=>0});
 controller.setAsleep(true);
 let elapsed=0,lowest=1;
 for(let t=0;t<8;t+=1/60){elapsed+=1/60;controller.update(1/60,elapsed);lowest=Math.min(lowest,controller.weights.blink);}
 assert.equal(lowest,1,'Eyes stay closed while asleep');
 controller.setAsleep(false);
 run(controller,.5);
 assert.ok(controller.weights.blink<1,'and open again on waking');
});

test('expressions blend toward their preset rather than snapping',()=>{
 const controller=createThuanFaceController({face:recorder(),random:()=>0});
 assert.equal(controller.expression,'neutral');
 controller.setExpression('surprise');
 const first=controller.update(1/60,1).browOuter;
 assert.ok(first>0&&first<EXPRESSIONS.surprise.browOuter*.5,'One frame moves part of the way, not all');
 run(controller,3);
 for(const key of ['smile','browOuter','browInner','eyeWide']){
  assert.ok(Math.abs(controller.weights[key]-EXPRESSIONS.surprise[key])<.02,key+' settles on the preset');
 }
 controller.setExpression('concern');
 run(controller,3);
 assert.ok(controller.weights.browInner>.6&&controller.weights.smile<.1,'Concern raises the inner brow and drops the mouth');
 assert.equal(controller.setExpression('smirk'),'concern','An unknown expression is refused, not applied');
});

test('speech opens the jaw and returns it to rest when the line ends',()=>{
 const controller=createThuanFaceController({face:recorder(),random:()=>0});
 controller.setSpeaking(true);
 let elapsed=0,peak=0,changes=new Set();
 for(let t=0;t<2;t+=1/60){elapsed+=1/60;controller.update(1/60,elapsed);
  peak=Math.max(peak,controller.weights.mouthOpen);changes.add(controller.weights.mouthOpen.toFixed(3));}
 assert.ok(peak>.2,'The jaw actually opens');
 assert.ok(changes.size>20,'and moves continuously rather than sitting at one value');
 assert.ok(controller.weights.mouthFunnel>0,'Lips round while speaking');
 controller.setSpeaking(false);
 run(controller,2);
 assert.ok(controller.weights.mouthOpen<.02&&controller.weights.mouthFunnel<.02,'Both return to zero afterwards');
});

test('a long frame cannot jolt the face, and dispose leaves it at rest',()=>{
 const face=recorder();
 const controller=createThuanFaceController({face,random:()=>0});
 controller.setExpression('surprise');
 controller.update(30,30);   // a backgrounded tab returning
 assert.ok(controller.weights.eyeWide<EXPRESSIONS.surprise.eyeWide,'A 30s frame is clamped, not applied whole');
 controller.dispose();
 assert.ok(Object.values(controller.weights).every(v=>v===0),'Everything returns to zero');
 const before=face.seen.length;
 controller.update(1/60,1);
 assert.equal(face.seen.length,before,'and the rig is left alone after disposal');
});

test('voice selection prefers her own language, then a known voice',()=>{
 const voices=[
  {name:'Daniel',lang:'en-GB',localService:true},
  {name:'Linh',lang:'vi-VN',localService:true},
  {name:'Kyoko',lang:'ja-JP',localService:true}
 ];
 assert.equal(selectVoice(voices).name,'Linh','Vietnamese wins for a Vietnamese shopkeeper');
 assert.equal(selectVoice([{name:'Daniel',lang:'en-GB'},{name:'Kyoko',lang:'ja-JP'}]).name,'Kyoko');
 assert.equal(selectVoice([]),null,'No voices is not a crash');
 assert.equal(selectVoice(null),null);
});

test('speech always settles, whether it succeeds, fails or never starts',async()=>{
 const spoken=[];
 class Utterance{constructor(text){this.text=text;}}
 const synth={
  getVoices:()=>[{name:'Linh',lang:'vi-VN',localService:true}],
  speak(u){spoken.push(u.text);queueMicrotask(()=>{u.onstart?.();u.onend?.();});},
  cancel(){},addEventListener(){},removeEventListener(){}
 };
 globalThis.SpeechSynthesisUtterance=Utterance;
 const face={speaking:[],setSpeaking(v){this.speaking.push(v);}};
 const voice=createThuanVoice({face,synth});
 assert.equal(voice.supported,true);
 assert.equal(voice.voice.name,'Linh');
 assert.deepEqual(await voice.speak('Cold tea, back of the cooler.'),{spoken:true});
 assert.deepEqual(face.speaking,[true,false],'The face is told when the line starts and stops');
 assert.deepEqual(await voice.speak('   '),{spoken:false,reason:'empty'});

 // A synthesiser that accepts the line and then says nothing, as iOS does outside a gesture.
 const silent={getVoices:()=>[],speak(){},cancel(){},addEventListener(){},removeEventListener(){}};
 const quiet=createThuanVoice({face:null,synth:silent,maxChars:10});
 const pending=quiet.speak('hello');
 quiet.cancel();
 assert.deepEqual(await pending,{spoken:false,reason:'cancelled'},'Cancelling settles the promise');

 // No speechSynthesis at all must not stop a conversation.
 const none=createThuanVoice({synth:undefined});
 assert.equal(none.supported,false);
 assert.deepEqual(await none.speak('anything'),{spoken:false,reason:'unsupported'});
 delete globalThis.SpeechSynthesisUtterance;
});

test('a reply is coerced into the documented shape, or refused',()=>{
 assert.deepEqual(parseReply('{"dialogue":"Cold tea.","expression":"smile","gesture":"point"}'),
  {dialogue:'Cold tea.',expression:'smile',gesture:'point'});
 // Small models wrap JSON in prose, add trailing commas and invent enum values.
 assert.deepEqual(parseReply('Sure! {"dialogue":"Back of the cooler.","expression":"grumpy","gesture":"dance",}'),
  {dialogue:'Back of the cooler.',expression:'neutral',gesture:'idle'});
 assert.equal(parseReply('{"dialogue":"  "}'),null,'An empty line is no reply');
 for(const bad of ['','not json','[]','{}','{"expression":"smile"}',null,undefined,42])
  assert.equal(parseReply(bad),null,'Refused: '+JSON.stringify(bad));
 assert.equal(parseReply({dialogue:'x'.repeat(500)}).dialogue.length,300,'Runaway output is bounded');
 assert.equal(parseReply({dialogue:'a\n\n  b'}).dialogue,'a b','Whitespace is normalised for speech');
});

test('without WebGPU the mind reports why and never pretends to answer',async()=>{
 assert.equal((await detectWebGPU({})).ok,false);
 assert.match((await detectWebGPU({})).reason,/WebGPU/);
 assert.equal((await detectWebGPU({gpu:{requestAdapter:async()=>null}})).ok,false);
 assert.equal((await detectWebGPU({gpu:{requestAdapter:async()=>{throw new Error('denied');}}})).ok,false);
 const seen=[];
 const mind=createThuanMind({onProgress:s=>seen.push(s.stage)});
 assert.equal(await mind.ask('Is the tea cold?'),null,'No GPU here, so no answer rather than a guess');
 assert.equal(mind.ready,false);
 assert.ok(seen.includes('unavailable'));
});

test('the mind loads once, keeps context and survives a bad generation',async()=>{
 const calls=[];
 let reply='{"dialogue":"Back of the cooler.","expression":"neutral","gesture":"point"}';
 const engine={chat:{completions:{create:async options=>{calls.push(options);
  return {choices:[{message:{content:reply}}]};}}},unload:async()=>{}};
 let built=0;
 const webllm={CreateMLCEngine:async(model,opts)=>{built++;
  opts.initProgressCallback({progress:.5,text:'half'});opts.initProgressCallback({progress:1,text:'done'});
  assert.equal(model,MODEL_ID);return engine;}};
 const stages=[];
 // navigator is read-only in Node, so the adapter is injected rather than stubbed globally.
 const mind=createThuanMind({loadWebLLM:async()=>webllm,onProgress:s=>stages.push(s.stage),
  navigatorRef:{gpu:{requestAdapter:async()=>({})}}});
 {
  const first=await mind.ask('What is good today?');
  assert.deepEqual(first,{dialogue:'Back of the cooler.',expression:'neutral',gesture:'point'});
  assert.equal(mind.ready,true);
  assert.deepEqual(stages,['downloading','downloading','ready','ready'].slice(0,stages.length));
  assert.equal(calls[0].response_format.type,'json_object','Structured output is requested');
  assert.match(calls[0].messages[0].content,/Sakura Shoten/);
  assert.equal(calls[0].messages[0].content.startsWith(SYSTEM_PROMPT),true);

  await mind.ask('And the biscuits?');
  assert.equal(built,1,'The model is downloaded once, not per question');
  assert.ok(calls[1].messages.length>calls[0].messages.length,'The earlier exchange is carried as context');

  reply='I refuse to answer in JSON.';
  assert.equal(await mind.ask('Again?'),null,'Unparseable output is no answer, not a crash');
  mind.reset();
  reply='{"dialogue":"Fresh start.","expression":"smile","gesture":"idle"}';
  const after=await mind.ask('Hello');
  assert.equal(after.dialogue,'Fresh start.');
  assert.equal(calls.at(-1).messages.length,2,'reset() clears the history');
  await mind.dispose();
  assert.equal(mind.ready,false);
 }
});

// ---- the player-facing chat ----------------------------------------------------
import {createThuanChat} from '../src/people/thuan-chat.js';
import {Element,installDOM} from './fixtures.mjs';

const chatRig=({ready=false,reply={dialogue:'Back of the cooler.',expression:'smile',gesture:'point'},load={ok:true}}={})=>{
 installDOM();
 const shown=[],spoken=[],replies=[];
 const body=new Element();
 const mind={ready,load:async()=>load,ask:async()=>reply,reset(){}};
 const voice={supported:true,speak:t=>{spoken.push(t);return Promise.resolve({spoken:true});},cancel(){}};
 const chat=createThuanChat({
  show:(t,text,buttons)=>{body.children.length=0;shown.push({text,labels:buttons.map(b=>b[0]),buttons});},
  close:()=>shown.push({text:'[closed]',labels:[]}),
  body,mind,voice,onReply:r=>replies.push(r),getContext:()=>'It is 19:40.'
 });
 return {chat,shown,spoken,replies,body};
};
const press=(shown,label)=>shown.at(-1).buttons.find(b=>b[0]===label)[1]();

test('nothing downloads until the player has been told the size and agreed',async()=>{
 const {chat,shown}=chatRig();
 chat.open();
 assert.match(shown[0].text,/672MB/,'The download size is stated up front');
 assert.match(shown[0].text,/written conversation does not need it/,'and that the scripted dialogue is unaffected');
 assert.deepEqual(shown[0].labels,['Download and start','Not now']);
 // Declining must not start anything.
 press(shown,'Not now');
 assert.equal(shown.at(-1).text,'[closed]');
});

test('a device without WebGPU is told why, and keeps its written dialogue',async()=>{
 const {chat,shown}=chatRig({load:{ok:false,reason:'WebGPU is present but no graphics adapter answered.'}});
 chat.open();
 await press(shown,'Download and start');
 assert.match(shown.at(-1).text,/no graphics adapter/,'The actual reason is passed through');
 assert.match(shown.at(-1).text,/written conversation still works/);
 assert.deepEqual(shown.at(-1).labels,['Download and start','Not now'],'and she can be retried');
});

test('a question is answered, spoken, and handed to the face',async()=>{
 const {chat,shown,spoken,replies,body}=chatRig({ready:true});
 chat.open();
 assert.equal(shown.at(-1).text,'Ask her something.','A resident model skips the offer');
 await chat.send('What is good today?');
 assert.deepEqual(chat.transcript,[
  {role:'you',text:'What is good today?'},
  {role:'thuan',text:'Back of the cooler.'}
 ]);
 assert.deepEqual(spoken,['Back of the cooler.'],'The reply is spoken aloud');
 assert.deepEqual(replies,[{dialogue:'Back of the cooler.',expression:'smile',gesture:'point'}],
  'Expression and gesture reach the scene');
 // The transcript and a usable input are both rendered.
 const flatten=node=>[node.textContent||'',...(node.children||[]).flatMap(flatten)].join(' ');
 assert.match(flatten({children:body.children}),/Back of the cooler/,'The answer is in the transcript');
 assert.match(flatten({children:body.children}),/Thuan/);
 assert.ok(body.children.some(c=>c.className==='chat-input'),'The input is redrawn after the answer');
});

test('an empty question is ignored and an unusable answer is admitted',async()=>{
 const {chat,shown}=chatRig({ready:true});
 chat.open();
 await chat.send('   ');
 assert.deepEqual(chat.transcript,[],'Blank input asks nothing');
 const {chat:broken,shown:brokenShown}=chatRig({ready:true,reply:null});
 broken.open();
 await broken.send('Anything?');
 assert.match(brokenShown.at(-1).text,/did not follow that/,'A failed generation says so rather than inventing');
 assert.equal(broken.transcript.at(-1).text,'…');
});
