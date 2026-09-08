import * as THREE from '../../vendor/three.module.js';

// Original low-cost cloud backdrop. One opaque draw, no fog or transparent veil.
export function createTownSky(scene){
 const width=512,height=256,data=new Uint8Array(width*height*4);
 const hash=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);};
 const noise=(x,y)=>{const ix=Math.floor(x),iy=Math.floor(y);let u=x-ix,v=y-iy;u=u*u*(3-2*u);v=v*v*(3-2*v);return THREE.MathUtils.lerp(THREE.MathUtils.lerp(hash(ix,iy),hash(ix+1,iy),u),THREE.MathUtils.lerp(hash(ix,iy+1),hash(ix+1,iy+1),u),v);};
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const latitude=y/(height-1),horizon=Math.max(0,1-Math.abs(latitude-.5)*2);
  // Blend at the longitude seam so there is no visible vertical join.
  const cloudAt=u=>noise(u*12,latitude*10)*.57+noise(u*25,latitude*23)*.28+noise(u*53,latitude*47)*.15;
  const u=x/(width-1),n=THREE.MathUtils.lerp(cloudAt(u),cloudAt(u-1),THREE.MathUtils.smoothstep(u,.88,1));
  const cloud=THREE.MathUtils.smoothstep(n,.48,.72)*THREE.MathUtils.smoothstep(latitude,.48,.6)*(1-THREE.MathUtils.smoothstep(latitude,.88,1));
  const base=[92+105*horizon,150+69*horizon,204+26*horizon],i=(y*width+x)*4;
  for(let c=0;c<3;c++)data[i+c]=Math.round(THREE.MathUtils.lerp(base[c],244,cloud*.86));
  data[i+3]=255;
 }
 const texture=new THREE.DataTexture(data,width,height,THREE.RGBAFormat);texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=texture.minFilter=THREE.LinearFilter;texture.needsUpdate=true;
 const material=new THREE.MeshBasicMaterial({map:texture,side:THREE.BackSide,depthWrite:false,fog:false,toneMapped:false});
 const mesh=new THREE.Mesh(new THREE.SphereGeometry(180,32,16),material);mesh.name='Open harbour sky';mesh.renderOrder=-1000;mesh.frustumCulled=false;scene.add(mesh);
 const night=new THREE.Color(0x33465e),daylight=new THREE.Color(0xffffff),wet=new THREE.Color(0xa7b2bc);
 return {mesh,update(camera,day,rain,inside){mesh.visible=!inside;mesh.position.copy(camera.position);material.color.copy(night).lerp(daylight,day);if(rain)material.color.multiply(wet);}};
}
