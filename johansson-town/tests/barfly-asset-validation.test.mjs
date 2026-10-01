import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validateGLB} from '../art/characters/minato-barfly/validate_glb.mjs';
function fixture({emptyWeight=false,zeroMorph=false,wrongName=false}={}){
 const fingers=['L','R'].flatMap(side=>['thumb','index','middle','ring','pinky'].flatMap(f=>Array.from({length:f==='thumb'?2:3},(_,i)=>`finger.${f}.${side}.${i+1}`)));
 const chunks=[],views=[],accessors=[];let offset=0;
 function add(array,type,componentType,count){const b=Buffer.from(array.buffer);views.push({buffer:0,byteOffset:offset,byteLength:b.length});chunks.push(b);offset+=b.length;accessors.push({bufferView:views.length-1,componentType,count,type});return accessors.length-1;}
 const positions=add(new Float32Array(28*3),'VEC3',5126,28),joints=add(new Uint16Array(fingers.flatMap((_,i)=>[i,0,0,0])),'VEC4',5123,28),weights=add(new Float32Array(fingers.flatMap((_,i)=>[emptyWeight&&i===27?0:1,0,0,0])),'VEC4',5126,28),times=add(new Float32Array([0,1]),'SCALAR',5126,2);
 const index=add(new Uint32Array([0]),'SCALAR',5125,1),delta=add(new Float32Array([zeroMorph?0:.02,0,0]),'VEC3',5126,1);
 accessors.push({componentType:5126,count:28,type:'VEC3',sparse:{count:1,indices:{bufferView:accessors[index].bufferView,componentType:5125},values:{bufferView:accessors[delta].bufferView}}});
 const targets=Array.from({length:5},()=>({POSITION:accessors.length-1}));
 const g={asset:{version:'2.0'},buffers:[{byteLength:offset}],bufferViews:views,accessors,nodes:[...fingers.map(name=>({name})),{mesh:0,skin:0}],skins:[{joints:fingers.map((_,i)=>i)}],meshes:[{extras:{targetNames:['Smile','Frown','JawOpen','Blink.L','Blink.R']},primitives:[{attributes:{POSITION:positions,JOINTS_0:joints,WEIGHTS_0:weights},targets}]}],animations:['Barfly_Drink_Loop','Barfly_Sleep_Loop'].map(name=>({name:wrongName?'wrong':name,channels:[{}],samplers:[{input:times}]}))};
 let json=Buffer.from(JSON.stringify(g));json=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,32)]);const bin=Buffer.concat(chunks),header=Buffer.alloc(20),bh=Buffer.alloc(8);header.writeUInt32LE(0x46546c67);header.writeUInt32LE(2,4);header.writeUInt32LE(28+json.length+bin.length,8);header.writeUInt32LE(json.length,12);header.writeUInt32LE(0x4e4f534a,16);bh.writeUInt32LE(bin.length);bh.writeUInt32LE(0x004e4942,4);return Buffer.concat([header,json,bh,bin]);
}
test('export audit reads sparse facial deltas and all 28 effective finger weights',()=>{const report=validateGLB(fixture());assert.equal(report.passed,true);assert.equal(report.weightedFingerCount,28);});
test('a finger group with no effective exported weight fails validation',()=>{const report=validateGLB(fixture({emptyWeight:true}));assert.equal(report.passed,false);assert.deepEqual(report.missingFingerWeights,['finger.pinky.R.3']);});
test('named but inert morph targets fail validation',()=>{assert.equal(validateGLB(fixture({zeroMorph:true})).passed,false);});
test('incorrect NLA export names fail validation',()=>{assert.equal(validateGLB(fixture({wrongName:true})).passed,false);});
