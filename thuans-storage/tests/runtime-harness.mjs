import vm from 'node:vm';
import { readFile } from 'node:fs/promises';
import { buildCode } from '../scripts/build-runtime.mjs';

export async function runtime() {
  const callbacks = new Map();
  const events = () => ({
    addEventListener(name,fn){if(!callbacks.has(name))callbacks.set(name,new Set());callbacks.get(name).add(fn);},
    removeEventListener(name,fn){callbacks.get(name)?.delete(fn);},
    dispatch(name,event={}){for(const fn of callbacks.get(name)??[])fn({preventDefault(){},...event});},
  });
  const context2d = new Proxy({}, {get(obj,key){return obj[key] ?? (()=>({addColorStop(){}}));},set(obj,key,value){obj[key]=value;return true;}});
  const canvas=()=>({width:800,height:600,clientWidth:800,clientHeight:600,style:{},...events(),getContext:()=>context2d,setPointerCapture(){},releasePointerCapture(){}});
  const document={...events(),hidden:false,createElement:tag=>tag==='link'?{relList:{supports:()=>true}}:canvas(),createElementNS:()=>canvas(),querySelectorAll:()=>[],pointerLockElement:null};
  const window={...events(),devicePixelRatio:1,matchMedia:()=>({matches:false}),localStorage:{getItem:()=>null,setItem(){}},setTimeout,clearTimeout};
  let clock=0,frame=null,rendered=null;
  class Renderer {
    setPixelRatio(){} setSize(){} dispose(){}
    setAnimationLoop(fn){frame=fn;}
    render(scene,camera){scene.updateMatrixWorld(true);rendered={scene,camera,character:scene.getObjectByName('Thuan')};}
  }
  const logs=[];
  const ctx=vm.createContext({document,window,navigator:{getGamepads:()=>[]},console:{log(){},warn:(...args)=>logs.push(args.join(' ')),error:(...args)=>logs.push(args.join(' '))},setTimeout:()=>0,clearTimeout,TextDecoder,TextEncoder,URL,fetch,Request,Response,Headers,AbortController,AbortSignal,Blob,ProgressEvent:class{constructor(type,props){Object.assign(this,props);}},performance:{now:()=>clock},ResizeObserver:class{observe(){}disconnect(){}},TestRenderer:Renderer});
  let code=await buildCode();
  code=code.slice(0,code.lastIndexOf('(0, M.createRoot)'));
  vm.runInContext(code+`\nthis.api={hd,gd,md,vd,yd,Ed,wd,Td,storageRoute,moveStoragePlayer,kd,xd,createCharacter:$f,GLTFLoader:Id,Vector3:G,Yp};
    rd=TestRenderer; id=()=>({unlock(){},pickup(){},footstep(){},win(){},setMuted(){},dispose(){}}); this.api.createGame=om;`,ctx);
  return {api:ctx.api,canvas,window,document,logs,advance(seconds,step=1/60){const frames=Math.ceil(seconds/step);for(let i=0;i<frames;i++){clock+=step*1000;frame?.();}return rendered;},rendered:()=>rendered};
}

export async function loadThuan(api) {
  const bytes=await readFile(new URL('../models/thuan.glb',import.meta.url));
  const jsonLength=bytes.readUInt32LE(12),json=JSON.parse(bytes.subarray(20,20+jsonLength).toString());
  const binary=bytes.subarray(28+jsonLength);
  // Retain the real skin, geometry, joints and all animation data. GPU textures
  // are excluded only because these numerical tests do not run a WebGL context.
  json.buffers[0].uri='data:application/octet-stream;base64,'+binary.toString('base64');
  json.images=[];json.textures=[];json.materials=[];
  for(const mesh of json.meshes)for(const primitive of mesh.primitives)delete primitive.material;
  return new api.GLTFLoader().parseAsync(JSON.stringify(json),'');
}
