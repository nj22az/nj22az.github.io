import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../vendor/three.module.js';
import {createSectionInstances} from '../src/render/section-instances.js';
import {createShopStreetView} from '../src/render/shop-street-view.js';
import {createInkPipeline} from '../src/render/ink-pipeline.js';

function renderer({float=false,maxSamples=4}={}){
 return {
  capabilities:{isWebGL2:true,maxSamples},extensions:{has:name=>float&&name==='EXT_color_buffer_float'},
  target:null,targets:[],draws:0,
  getDrawingBufferSize(size){return size.set(800,600);},getRenderTarget(){return this.target;},
  setRenderTarget(target){this.target=target;if(target)this.targets.push(target);},clear(){},
  render(){this.draws++;}
 };
}

test('packed town instances follow a replaced, updated or removed colour palette while stationary',()=>{
 const mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(),new THREE.MeshBasicMaterial(),2);
 mesh.setMatrixAt(0,new THREE.Matrix4());mesh.setMatrixAt(1,new THREE.Matrix4().makeTranslation(10,0,0));
 mesh.setColorAt(0,new THREE.Color('red'));mesh.setColorAt(1,new THREE.Color('green'));mesh.updateMatrixWorld(true);
 const view=createSectionInstances(mesh),near=bounds=>bounds.min.x>5;
 let selected=view.select(near);assert.equal(selected.count,1);
 assert.deepEqual(Array.from(selected.color.array.slice(0,3)),Array.from(mesh.instanceColor.array.slice(3,6)));
 mesh.setColorAt(1,new THREE.Color('blue'));mesh.instanceColor.needsUpdate=true;
 selected=view.select(near);assert.ok(new THREE.Color().fromBufferAttribute(selected.color,0).equals(new THREE.Color('blue')));
 mesh.instanceColor=null;assert.equal(view.select(near).color,null,'Removed palette must not tint the streamed texture');
 mesh.setColorAt(1,new THREE.Color('red'));selected=view.select(near);
 assert.ok(new THREE.Color().fromBufferAttribute(selected.color,0).equals(new THREE.Color('red')));
});

test('a late instance palette is included without invalidating town sections',()=>{
 const mesh=new THREE.InstancedMesh(new THREE.BoxGeometry(),new THREE.MeshBasicMaterial(),2);mesh.updateMatrixWorld(true);
 const view=createSectionInstances(mesh);assert.equal(view.select(()=>true).color,null);
 mesh.setColorAt(0,new THREE.Color('blue'));
 const selected=view.select(()=>true);assert.ok(selected.color);assert.equal(selected.color.getZ(0),1);
});

test('moving props seen through shop glazing keep live bounds and complete geometry',()=>{
 const scene=new THREE.Scene(),town=new THREE.Group(),room=new THREE.Group();scene.add(town,room);town.visible=false;
 const parent=new THREE.Group();parent.userData.dynamicProp=true;town.add(parent);
 const positions=[];for(let i=0;i<1200;i++)positions.push(0,0,0,.1,0,0,0,.1,.1);
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 const moving=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial());moving.position.set(0,1,2);parent.add(moving);
 const direct=moving.clone();direct.userData.dynamicProp=true;direct.position.set(1,1,2);town.add(direct);
 const camera=new THREE.PerspectiveCamera(100,1.6,.07,220);camera.position.set(0,1.7,0);camera.rotation.y=Math.PI;
 const seen=[],draw={autoClear:true,clippingPlanes:[],clearDepth(){},render(){if(town.visible){seen.push([moving.visible,direct.visible]);assert.equal(moving.geometry,geometry);assert.equal(direct.geometry,geometry);}}};
 const view=createShopStreetView(),args={renderer:draw,scene,camera,town,room,frontage:{position:[0,0,0],yaw:0}};
 view.render(args);parent.position.x=40;direct.position.x=40;view.render(args);
 parent.position.x=0;direct.position.x=1;view.render(args);
 assert.deepEqual(seen,[[true,true],[false,false],[true,true]]);
 assert.equal(moving.visible,true);assert.equal(direct.visible,true);
});

test('unsupported half-float colour buffers use safe targets and keep antialiasing',()=>{
 const draw=renderer(),pipeline=createInkPipeline(draw,{superScale:1});pipeline.render(()=>{});
 assert.ok(draw.targets.every(target=>target.texture.type===THREE.UnsignedByteType));
 assert.equal(pipeline.state.samples,4);pipeline.dispose();
 const hdr=renderer({float:true}),supported=createInkPipeline(hdr,{superScale:1});supported.render(()=>{});
 assert.equal(hdr.targets[0].texture.type,THREE.HalfFloatType);supported.dispose();
 const single=renderer({maxSamples:0}),noMSAA=createInkPipeline(single);
 assert.equal(noMSAA.state.samples,0,'A driver advertising zero samples must not be asked for four');noMSAA.dispose();
});

test('every failed post-processing pass restores the previous render target for plain fallback',()=>{
 for(const failAt of [1,2,3]){
  const draw=renderer(),prior={name:'outer framebuffer'};draw.target=prior;
  draw.render=function(){if(++this.draws===failAt)throw Error('GPU pass failed');};
  const pipeline=createInkPipeline(draw,{superScale:1});
  assert.throws(()=>pipeline.render(()=>{}),/GPU pass failed/);
  assert.equal(draw.getRenderTarget(),prior);pipeline.dispose();
 }
});

test('large Retina buffers cannot bypass the render-target pixel ceiling',()=>{
 const draw=renderer();draw.getDrawingBufferSize=size=>size.set(7680,4320);
 const pipeline=createInkPipeline(draw,{superScale:1.25,pixelBudget:4.6e6});
 pipeline.render(()=>{});
 assert.ok(pipeline.width*pipeline.height<=4.6e6);
 assert.ok(pipeline.width<7680&&pipeline.height<4320,'The budget must also apply below native buffer resolution');
 pipeline.dispose();
});
