// Geometry and public event behaviour with a small DOM shim. This is not browser/layout acceptance.
import assert from 'node:assert/strict';
import {test,after} from 'node:test';
import {createMakeupGuide} from '../makeup-guide.js';

class Element{
 constructor(tag){this.tag=tag;this.children=[];this.dataset={};this.style={};this.attributes={};this.listeners=new Map();this.classList={add(){}};this.hidden=false;}
 setAttribute(key,value){this.attributes[key]=value;}
 append(...children){for(const child of children){child.parent=this;this.children.push(child);}}
 addEventListener(type,fn){this.listeners.set(type,fn);}
 closest(){return this.tag==='button'&&this.dataset.handle?this:this.parent?.closest();}
 setPointerCapture(id){this.captured=id;}
 releasePointerCapture(id){if(this.captured===id)this.captured=null;}
 getBoundingClientRect(){return {left:20,top:30,width:400,height:300};}
}
const previousDocument=globalThis.document;
globalThis.document={createElement:tag=>new Element(tag),createElementNS:(_ns,tag)=>new Element(tag)};
after(()=>{if(previousDocument===undefined)delete globalThis.document;else globalThis.document=previousDocument;});

function fixture(){
 const frame=new Element('div');frame.clientWidth=400;frame.clientHeight=300;
 let edit={width:1000,height:750,picture:{},recipe:{crop:{x:.2,y:.1,w:.5,h:.5},makeup:{face:{x:.3,y:.2,w:.3,h:.4,angle:0}}}},changes=0;
 const guide=createMakeupGuide(frame,{edit:()=>edit,changed:()=>changes++}),layer=frame.children[0];
 const handles=new Map(layer.children.filter(e=>e.tag==='button').map(e=>[e.dataset.handle,e]));
 function send(type,name,props={}){
  const event={target:handles.get(name),preventDefault(){this.prevented=true;},stopPropagation(){this.stopped=true;},...props};
  layer.listeners.get(type)(event);return event;
 }
 return {guide,layer,handles,send,get edit(){return edit;},replace(value){edit=value;},get changes(){return changes;}};
}
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-8,`${actual} should equal ${expected}`);
const key=(f,name,key,props={})=>f.send('keydown',name,{key,...props});
const down=(f,name,id=1)=>f.send('pointerdown',name,{pointerId:id,button:0,clientX:180,clientY:190});
const move=(f,name,id=1)=>f.send('pointermove',name,{pointerId:id,clientX:200,clientY:220});

test('guide is opt-in, has five labelled controls, and positions the eye in the current crop',()=>{
 const f=fixture();assert.equal(f.layer.hidden,true);f.guide.active=true;
 assert.equal(f.layer.hidden,false);assert.equal(f.layer.attributes.role,'group');assert.equal(f.handles.size,5);
 for(const handle of f.handles.values())assert.ok(handle.attributes['aria-label']);
 near(parseFloat(f.handles.get('left-eye').style.left),38.6);near(parseFloat(f.handles.get('left-eye').style.top),52);
 assert.ok(!f.layer.children[0].children[0].attributes.d.includes('NaN'));
});

test('dragging an eye changes only its source-space anchor and consumes the gesture',()=>{
 const f=fixture();f.guide.active=true;const original={...f.edit.recipe.makeup.face};
 const start=down(f,'left-eye'),drag=move(f,'left-eye');f.send('pointerup','left-eye',{pointerId:1});
 assert.equal(start.prevented,true);assert.equal(drag.stopped,true);assert.equal(f.changes,1);
 const face=f.edit.recipe.makeup.face;near(face.eyes[0].x,.31+1/12);near(face.eyes[0].y,.525);
 assert.deepEqual(face.eyes[1],{x:.69,y:.4});assert.equal(face.mouth,undefined);
 for(const key of ['x','y','w','h','angle'])assert.equal(face[key],original[key]);
});

test('a second pointer cannot replace or cancel the owned drag',()=>{
 const f=fixture();f.guide.active=true;down(f,'mouth');down(f,'face',2);move(f,'face',2);
 f.send('pointercancel','face',{pointerId:2});assert.equal(f.changes,0);move(f,'mouth');
 assert.equal(f.changes,1);near(f.edit.recipe.makeup.face.mouth.x,.5+1/12);near(f.edit.recipe.makeup.face.mouth.y,.875);
 f.send('pointercancel','mouth',{pointerId:1});move(f,'mouth');assert.equal(f.changes,1);
});

test('keyboard arrows adjust face and feature anchors, without leaking into Look shortcuts',()=>{
 const f=fixture();f.guide.active=true;const handled=key(f,'face','ArrowDown');
 assert.equal(handled.prevented,true);assert.equal(handled.stopped,true);near(f.edit.recipe.makeup.face.y,.2025);
 key(f,'left-eye','ArrowRight');near(f.edit.recipe.makeup.face.eyes[0].x,.31+.0025/.3);
 key(f,'mouth','ArrowLeft',{shiftKey:true});near(f.edit.recipe.makeup.face.mouth.x,.45);
 const ignored=key(f,'face','a');assert.equal(ignored.prevented,undefined);assert.equal(f.changes,3);
});

test('resize preserves centre and aspect and remains inside the source image',()=>{
 const f=fixture();f.guide.active=true;key(f,'resize','ArrowRight');
 let face=f.edit.recipe.makeup.face;near(face.x+face.w/2,.45);near(face.y+face.h/2,.4);near(face.w/.3,face.h/.4);
 for(let i=0;i<80;i++)key(f,'resize','ArrowRight',{shiftKey:true});
 face=f.edit.recipe.makeup.face;assert.ok(face.x>=0&&face.y>=0&&face.x+face.w<=1&&face.y+face.h<=1);
 near(face.w/.3,face.h/.4);
});

test('a rotated face is positioned in physical source pixels before cropping',()=>{
 const f=fixture();f.edit.recipe.makeup.face.angle=30;f.guide.active=true;
 // Independent 30-degree rotation of source point (393,270) about (450,300), then the supplied crop.
 const x=450-57*Math.sqrt(3)/2+15,y=300-28.5-15*Math.sqrt(3);
 near(parseFloat(f.handles.get('left-eye').style.left),(x/1000-.2)/.5*100);
 near(parseFloat(f.handles.get('left-eye').style.top),(y/750-.1)/.5*100);
});

test('the visible mouth boundary follows lip width, height, position, crop and physical angle',()=>{
 const f=fixture();f.guide.active=true;const mouth=f.layer.children[0].children[1];
 const points=()=>[...mouth.attributes.d.matchAll(/[ML](-?[\d.]+) (-?[\d.]+)/g)].map(m=>[+m[1],+m[2]]);
 let p=points();assert.deepEqual(p[0],[156.8,240]);assert.deepEqual(p[32],[243.2,240]);
 const bounds=()=>{const p=points();return {w:Math.max(...p.map(p=>p[0]))-Math.min(...p.map(p=>p[0])),h:Math.max(...p.map(p=>p[1]))-Math.min(...p.map(p=>p[1]))};};
 const before=bounds();f.edit.recipe.makeup.face.mouth={x:.5,y:.75,w:.18,h:.16};f.guide.render();
 const after=bounds();assert.ok(Math.abs(after.w-before.w/2)<.02);assert.ok(Math.abs(after.h-before.h*2)<.03);
 f.edit.recipe.makeup.face.angle=30;f.guide.render();p=points();
 // The resized left mouth corner is source (423,375), rotated about source face centre (450,300).
 const x=450-27*Math.sqrt(3)/2-37.5,y=300-13.5+75*Math.sqrt(3)/2;
 assert.ok(Math.abs(p[0][0]-(x/1000-.2)/.5*400)<.01);assert.ok(Math.abs(p[0][1]-(y/750-.1)/.5*300)<.01);
 assert.equal(mouth.style.strokeDasharray,'none');
});

test('source replacement, editor replacement and saving cancel pending pointer edits',()=>{
 for(const change of [f=>{f.edit.picture={};},f=>{f.replace({...f.edit});},f=>{f.edit.saving=true;}]){
  const f=fixture();f.guide.active=true;down(f,'left-eye');const original=JSON.stringify(f.edit.recipe);
  change(f);move(f,'left-eye');assert.equal(JSON.stringify(f.edit.recipe),original);assert.equal(f.changes,0);
 }
});

test('reset cancels a drag and hides the guide; no face yields no visible guide',()=>{
 const f=fixture();f.guide.active=true;down(f,'mouth');f.guide.reset();move(f,'mouth');
 assert.equal(f.layer.hidden,true);assert.equal(f.guide.active,false);assert.equal(f.changes,0);
 f.edit.recipe.makeup.face=null;f.guide.active=true;assert.equal(f.layer.hidden,true);
});
