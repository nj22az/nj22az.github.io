import * as THREE from '../../vendor/three.module.js';
import {GLTFLoader} from '../../vendor/GLTFLoader.js';
import {mergeGeometries} from '../../vendor/BufferGeometryUtils.js';
import {assetURL} from '../assets.js';
import {VENDING_AD,VENDING_PRODUCTS} from '../commerce/vending-catalogue.js';

let template,pending;
// Source colours are baked into one opaque mesh. Omit the source glass so the
// small display stays clear on phones and adds no transparency sorting cost.
export function prepareVendingModel(source){
  source.updateMatrixWorld(true);
  const parts=[];
  source.traverse(node=>{
    if(!node.isMesh||node.material.transparent)return;
    const geometry=node.geometry.clone().applyMatrix4(node.matrixWorld);
    for(const key of Object.keys(geometry.attributes))if(!['position','normal'].includes(key))geometry.deleteAttribute(key);
    if(!geometry.attributes.normal)geometry.computeVertexNormals();
    const colors=new Float32Array(geometry.attributes.position.count*3);
    for(let i=0;i<colors.length;i+=3)node.material.color.toArray(colors,i);
    geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));parts.push(geometry);
  });
  if(!parts.length)throw new Error('Vending model has no opaque geometry');
  const geometry=mergeGeometries(parts,false);parts.forEach(part=>part.dispose());
  geometry.rotateY(Math.PI);geometry.computeBoundingBox();
  const bounds=geometry.boundingBox,center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
  const scale=Math.min(1.3/size.x,2.25/size.y,1/size.z);
  geometry.translate(-center.x,-bounds.min.y,-center.z);geometry.scale(scale,scale,scale);
  geometry.computeBoundingBox();geometry.computeBoundingSphere();
  return new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({vertexColors:true,roughness:.68,metalness:.16}));
}
export async function preloadVending(){
  if(template)return true;if(pending)return pending;
  pending=(async()=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),15000);
  try{const response=await fetch(assetURL('models/props/vending-machine.glb'),{signal:controller.signal});if(!response.ok)throw Error(response.status);const gltf=await new GLTFLoader().parseAsync(await response.arrayBuffer(),'');template=prepareVendingModel(gltf.scene);gltf.scene.traverse(node=>{if(node.isMesh){node.geometry.dispose();node.material.dispose();}});return true;}
  catch(error){console.warn('Vending model unavailable; using local fallback.',error);return false;}finally{clearTimeout(timer);}
  })();const task=pending;task.finally(()=>{pending=null;});return task;
}
// The machine is drawn in code now (below), so there is nothing to wait for. The GLB
// loader above is kept for the asset test and anyone who wants the old body back.
export const vendingReady=()=>true;
export async function hydrateVending(){return true;}

function canvasPanel(width,height,W,H,paint,{lit=false}={}){
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({color:0xffffff}));
  if(typeof document==='undefined'||!document.createElement)return mesh;
  const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d');if(!ctx)return mesh;paint(ctx,W,H);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
  mesh.material=lit?new THREE.MeshBasicMaterial({map:texture,toneMapped:false}):new THREE.MeshStandardMaterial({map:texture,roughness:.5});
  return mesh;
}
/**
 * A Japanese drinks machine of the late 1990s, built from boxes and painted panels:
 * a lit window of dummy cans in three rows, each with its price and a push button (blue
 * for cold, red for hot), the brand across the top, a coin and note panel with the
 * return lever on the right, and the take-out flap at the bottom. About 1 m wide, 1.83 m
 * high and 0.7 m deep, the size of the real thing, and fronted on +z.
 */
export function createVendingMachine({shadows=false}={}){
  const group=new THREE.Group();group.name='Harbour vending machine';
  const W=1.0,H=1.83,D=.7,front=D/2;
  const body=new THREE.MeshStandardMaterial({color:0xc8202a,roughness:.45,metalness:.1});
  const white=new THREE.MeshStandardMaterial({color:0xf4f2ec,roughness:.5});
  const dark=new THREE.MeshStandardMaterial({color:0x2b2f33,roughness:.5,metalness:.3});
  const steel=new THREE.MeshStandardMaterial({color:0xb7bdc0,roughness:.35,metalness:.6});
  const box=(w,h,d,x,y,z,mat,name)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=shadows;m.receiveShadow=true;if(name)m.name=name;group.add(m);return m;};
  box(W,H,D,0,H/2,0,body,'Vending cabinet');
  box(W+.02,.06,D+.02,0,H+.03,0,dark,'Vending cabinet top');
  box(W-.06,.1,D-.06,0,.05,0,dark,'Vending plinth');
  // The front door: a white face with the display window in its upper half.

  // Brand strip.
  const brand=canvasPanel(W-.12,.16,1024,160,(ctx,w,h)=>{
    ctx.fillStyle=VENDING_AD.background;ctx.fillRect(0,0,w,h);ctx.fillStyle=VENDING_AD.foreground;ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.font='bold 84px sans-serif';ctx.fillText(VENDING_AD.brand,w/2,h*.42);ctx.font='32px sans-serif';ctx.fillText(VENDING_AD.tagline,w/2,h*.82);
  },{lit:true});
  brand.position.set(0,H-.13,front+.022);brand.name='Vending brand strip';group.add(brand);
  // The display: three rows of dummy cans behind glass, lit from inside. The door is
  // four white panels round an open window, so the cans are seen, not covered.
  const rows=3,cols=Math.min(6,VENDING_PRODUCTS.length),winW=W-.14,winH=.78,winY=H-.26-winH/2,doorTop=H-.04,doorBottom=.12;
  const z0=front+.01;
  box(W-.08,doorTop-(winY+winH/2),.02,0,(doorTop+winY+winH/2)/2,z0,white,'Vending door');
  box(W-.08,(winY-winH/2)-doorBottom,.02,0,(winY-winH/2+doorBottom)/2,z0,white,'Vending door');
  for(const sx of [-1,1])box((W-.08-winW)/2,winH,.02,sx*(winW/2+(W-.08-winW)/4),winY,z0,white,'Vending door');
  const back=canvasPanel(winW,winH,512,400,(ctx,w,h)=>{const g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'#fbfbf6');g.addColorStop(1,'#e2e6e6');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);ctx.fillStyle='#c9cfd0';for(let r=1;r<rows;r++)ctx.fillRect(0,h*r/rows-3,w,6);},{lit:true});
  back.position.set(0,winY,front+.005);group.add(back);
  const canGeo=new THREE.CylinderGeometry(.033,.033,.12,14),capGeo=new THREE.CylinderGeometry(.028,.033,.012,14),cz=front+.05;
  for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){
    const product=VENDING_PRODUCTS[(c+r*2)%VENDING_PRODUCTS.length],x=-winW/2+winW*(c+.5)/cols,y=winY+winH/2-winH*(r+.5)/rows+.02;
    const can=new THREE.Mesh(canGeo,new THREE.MeshStandardMaterial({color:product.color,roughness:.35,metalness:.35,emissive:product.color,emissiveIntensity:.18}));can.position.set(x,y,cz);group.add(can);
    const top=new THREE.Mesh(capGeo,steel);top.position.set(x,y+.066,cz);group.add(top);
    const band=new THREE.Mesh(new THREE.CylinderGeometry(.0335,.0335,.03,14),white);band.position.set(x,y-.01,cz);group.add(band);
    // Price tag and button on the shelf lip under each can.
    const tag=canvasPanel(.09,.03,128,44,(ctx,w,h)=>{ctx.fillStyle='#111';ctx.fillRect(0,0,w,h);ctx.fillStyle='#ffd23f';ctx.font='bold 30px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('¥'+product.price,w/2,h/2+1);},{lit:true});
    tag.position.set(x,y-.083,cz+.04);tag.userData.tag={width:128,height:44};group.add(tag);
    const button=new THREE.Mesh(new THREE.BoxGeometry(.05,.022,.012),new THREE.MeshStandardMaterial({color:product.hot?0xd8342c:0x2f6fd0,emissive:product.hot?0xd8342c:0x2f6fd0,emissiveIntensity:.45,roughness:.4}));
    button.position.set(x,y-.108,cz+.042);group.add(button);
  }
  // Shelf lips across each row, and a frame round the glass.
  for(let r=0;r<rows;r++){const y=winY+winH/2-winH*(r+1)/rows+.01;box(winW,.012,.09,0,y,front+.05,new THREE.MeshStandardMaterial({color:0xdfe3e3,roughness:.4}),'Vending shelf');}
  for(const [w,h,x,y] of [[winW+.04,.025,0,winY+winH/2+.012],[winW+.04,.025,0,winY-winH/2-.012],[.025,winH,-winW/2-.012,winY],[.025,winH,winW/2+.012,winY]])box(w,h,.1,x,y,front+.06,dark,'Vending display frame');
  const glass=new THREE.Mesh(new THREE.PlaneGeometry(winW,winH),new THREE.MeshStandardMaterial({color:0xdfeff3,transparent:true,opacity:.12,roughness:.05,depthWrite:false}));
  glass.position.set(0,winY,front+.105);glass.name='Vending glass';group.add(glass);
  // Lower front: a product poster on the left, the money panel on the right.
  const poster=canvasPanel(.56,.42,512,384,(ctx,w,h)=>{
    const p=VENDING_PRODUCTS[0];ctx.fillStyle=p.color;ctx.fillRect(0,0,w,h);ctx.fillStyle='#fff8e8';ctx.textAlign='center';ctx.textBaseline='middle';
    ctx.font='bold 120px serif';ctx.fillText(p.mark,w*.26,h*.45);ctx.font='bold 54px sans-serif';ctx.fillText(p.brand,w*.66,h*.38);ctx.font='34px sans-serif';ctx.fillText('つめた〜い · Ice cold',w*.66,h*.6);ctx.fillText('¥'+p.price,w*.66,h*.78);
  });
  poster.position.set(-.18,.66,front+.022);poster.scale.set(1,.62,1);group.add(poster);
  box(.26,.3,.04,.33,.66,front+.03,steel,'Vending money panel');
  box(.12,.018,.02,.33,.76,front+.055,dark,'Coin slot');
  box(.16,.04,.02,.33,.69,front+.055,dark,'Note slot');
  const lever=box(.04,.05,.04,.33,.61,front+.065,new THREE.MeshStandardMaterial({color:0xd8342c,roughness:.4}),'Coin return lever');
  box(.08,.05,.03,.33,.55,front+.055,dark,'Change cup');
  // The take-out flap: a dark pocket with a hinged clear flap across it.
  box(W-.2,.2,.05,0,.3,front+.02,dark,'Take-out pocket');
  const flap=canvasPanel(W-.24,.16,512,84,(ctx,w,h)=>{ctx.fillStyle='#3a4044';ctx.fillRect(0,0,w,h);ctx.fillStyle='#e8e8e2';ctx.font='bold 34px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('とりだし口 · TAKE OUT',w/2,h/2);});
  flap.position.set(0,.3,front+.048);group.add(flap);
  // Side panels: the brand, big, for anyone coming along the pavement.
  for(const s of [-1,1]){const side=canvasPanel(D-.08,1.0,320,460,(ctx,w,h)=>{ctx.fillStyle='#c8202a';ctx.fillRect(0,0,w,h);ctx.fillStyle='#fff8e8';ctx.textAlign='center';ctx.font='bold 70px sans-serif';ctx.fillText('MINATO',w/2,h*.4);ctx.fillText('DRINKS',w/2,h*.57);ctx.font='30px sans-serif';ctx.fillText('つめた〜い · あったか〜い',w/2,h*.75);});
    side.position.set(s*(W/2+.004),1.15,0);side.rotation.y=s*Math.PI/2;group.add(side);}
  group.userData.lever=lever;
  return drawAsFew(group,lever);
}

/**
 * Built piece by piece above (about a hundred meshes: every can, cap, band, button and
 * tag), drawn as about ten. Every plain painted part becomes one vertex-coloured mesh
 * (a can's glow is folded into its colour) and the price tags share one texture. The
 * coin-return lever stays its own piece. What the machine is made of is kept in
 * userData.parts, by name.
 */
function drawAsFew(group,keep){
  group.updateMatrix();
  const plain=[],tags=[],parts=[];
  for(const m of group.children){
    if(m.name)parts.push(m.name);
    if(m.geometry?.type==='CylinderGeometry'&&m.geometry.parameters.height===.12)parts.push('can');
    if(m===keep||!m.isMesh)continue;
    const mat=m.material;
    if(mat.isMeshStandardMaterial&&!mat.map&&!mat.transparent)plain.push(m);
    else if(mat.isMeshBasicMaterial&&mat.map&&m.userData.tag)tags.push(m);
  }
  if(plain.length>1){
    const pieces=plain.map(m=>{
      m.updateMatrix();const g=(m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone()).applyMatrix4(m.matrix);
      for(const k of Object.keys(g.attributes))if(!['position','normal'].includes(k))g.deleteAttribute(k);
      const c=m.material.color.clone().add(m.material.emissive.clone().multiplyScalar(m.material.emissiveIntensity)),col=new Float32Array(g.attributes.position.count*3);
      for(let i=0;i<col.length;i+=3)c.toArray(col,i);g.setAttribute('color',new THREE.BufferAttribute(col,3));return g;
    });
    const body=new THREE.Mesh(mergeGeometries(pieces,false),new THREE.MeshStandardMaterial({vertexColors:true,roughness:.45,metalness:.2}));
    pieces.forEach(g=>g.dispose());body.name='Vending machine body';body.castShadow=plain[0].castShadow;body.receiveShadow=true;
    for(const m of plain){m.removeFromParent();m.geometry.dispose();}
    group.add(body);
  }
  if(tags.length>1&&typeof document!=='undefined'&&document.createElement){
    // One strip of every tag's canvas, top to bottom, and the tags' planes mapped onto it.
    const w=tags[0].userData.tag.width,h=tags[0].userData.tag.height,canvas=document.createElement('canvas');canvas.width=w;canvas.height=h*tags.length;
    const ctx=canvas.getContext('2d');
    if(ctx){
      const pieces=tags.map((m,i)=>{ctx.drawImage(m.material.map.image,0,i*h);m.updateMatrix();const g=m.geometry.clone().applyMatrix4(m.matrix),uv=g.attributes.uv;
        for(let k=0;k<uv.count;k++)uv.setY(k,1-(i+1-uv.getY(k))/tags.length);return g;});
      const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
      const strip=new THREE.Mesh(mergeGeometries(pieces,false),new THREE.MeshBasicMaterial({map:texture,toneMapped:false}));strip.name='Vending price tags';
      pieces.forEach(g=>g.dispose());
      for(const m of tags){m.removeFromParent();m.geometry.dispose();m.material.map.dispose();m.material.dispose();}
      group.add(strip);
    }
  }
  group.userData.parts=parts;
  return group;
}
