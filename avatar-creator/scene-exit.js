import * as THREE from '../johansson-town/vendor/three.module.js';

const stages=new WeakMap();
/** An open doorway gives paper-comic flight a destination. This is a Studio prop, without World collisions. */
export function stageComicExit(environment,visible,label='EXIT'){
 let stage=stages.get(environment);
 if(!stage&&visible){
  const root=new THREE.Group(),geometry=[],materials=[];
  root.name='Comic exit doorway';root.position.fromArray(environment.origin);root.position.x+=.9;root.position.z-=.45;
  const material=colour=>{const m=new THREE.MeshBasicMaterial({color:colour});materials.push(m);return m;};
  const ink=material('#30291f'),wood=material('#b69a72'),panel=material('#d5c5a2');
  const box=(parent,x,y,z,w,h,d,mat)=>{const g=new THREE.BoxGeometry(w,h,d);geometry.push(g);const m=new THREE.Mesh(g,mat);m.position.set(x,y,z);parent.add(m);return m;};
  for(const x of [0,.75]){box(root,x,1.05,0,.065,2.1,.09,ink);box(root,x,1.05,.05,.035,2.08,.012,wood);}
  box(root,.375,2.1,0,.82,.065,.09,ink);box(root,.375,.015,.02,.82,.03,.14,ink);
  const hinge=new THREE.Group();hinge.position.set(.75,0,0);hinge.rotation.y=-1.15;root.add(hinge);
  box(hinge,-.36,1.025,0,.72,2.04,.045,ink);box(hinge,-.36,1.025,.028,.66,1.97,.015,panel);box(hinge,-.61,1.02,.055,.07,.035,.04,ink);
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=96;const ctx=canvas.getContext('2d');
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const sign=new THREE.MeshBasicMaterial({map:texture});materials.push(sign);box(root,.375,2.25,.02,.53,.20,.025,sign);
  environment.scene.add(root);stage={root,label:null,paint(value){ctx.fillStyle='#315e49';ctx.fillRect(0,0,256,96);ctx.fillStyle='#fffdf4';let size=62;do{ctx.font=`900 ${size}px sans-serif`;if(ctx.measureText(value).width<=230)break;size-=2;}while(size>14);ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(value,128,49);texture.needsUpdate=true;this.label=value;root.userData.exitLabel=value;},dispose(){root.removeFromParent();for(const g of geometry)g.dispose();for(const m of materials)m.dispose();texture.dispose();}};stages.set(environment,stage);
  const dispose=environment.dispose;environment.dispose=()=>{stage.dispose();dispose?.call(environment);};
 }
 if(stage){stage.root.visible=visible;const value=String(label||'EXIT').slice(0,24);if(stage.label!==value)stage.paint(value);}
}
