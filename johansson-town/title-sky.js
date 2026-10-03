import * as THREE from './vendor/three.module.js';
// A small separate scene keeps the title's soft 3D sky independent of loading the town.
const host=document.querySelector('.title-sky'),start=document.querySelector('#start');
if(host){try{
 const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearColor(0,0);renderer.domElement.setAttribute('aria-hidden','true');host.append(renderer.domElement);host.classList.add('has-3d-sky');
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-10,10,6,-6,.1,40);camera.position.z=20;
 scene.add(new THREE.HemisphereLight(0xffffff,0x8ca9c2,2));const light=new THREE.DirectionalLight(0xfff4da,2);light.position.set(-5,8,10);scene.add(light);
 const ramp=new THREE.DataTexture(new Uint8Array([72,155,255]),3,1,THREE.RedFormat);ramp.minFilter=ramp.magFilter=THREE.NearestFilter;ramp.needsUpdate=true;
 const white=new THREE.MeshToonMaterial({color:0xfff9e9,gradientMap:ramp}),yellow=new THREE.MeshToonMaterial({color:0xffd15c,gradientMap:ramp}),ink=new THREE.MeshBasicMaterial({color:0x956237});
 const sphere=new THREE.SphereGeometry(1,24,16),clouds=[];
 for(const [x,y,s] of [[-7,3.7,1],[-1,4.9,.75],[7,2.4,.8]]){const cloud=new THREE.Group();for(const [dx,dy,r] of [[-1,0,.7],[0,.35,1],[1.1,.1,.8],[.25,-.3,.85]]){const puff=new THREE.Mesh(sphere,white);puff.position.set(dx,dy,0);puff.scale.set(r,r*.75,r*.6);cloud.add(puff);}cloud.position.set(x,y,-1);cloud.scale.setScalar(s);cloud.userData.origin=x;scene.add(cloud);clouds.push(cloud);}
 const sun=new THREE.Group();sun.position.set(5.5,4,0);const globe=new THREE.Mesh(sphere,yellow);globe.scale.setScalar(.85);sun.add(globe);
 for(const x of [-.24,.24]){const eye=new THREE.Mesh(sphere,ink);eye.scale.set(.047,.085,.025);eye.position.set(x,.08,.84);sun.add(eye);}
 const smile=new THREE.Mesh(new THREE.TorusGeometry(.23,.023,6,24,Math.PI),ink);smile.rotation.z=Math.PI;smile.position.set(0,-.04,.84);sun.add(smile);
 for(let i=0;i<10;i++){const angle=i*Math.PI/5,ray=new THREE.Mesh(new THREE.CapsuleGeometry(.07,.28,4,8),yellow);ray.position.set(Math.cos(angle)*1.18,Math.sin(angle)*1.18,0);ray.rotation.z=angle-Math.PI/2;sun.add(ray);}scene.add(sun);
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;let frame=0,last=0;
 function resize(){const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);const a=w/h;camera.left=-6*a;camera.right=6*a;camera.updateProjectionMatrix();sun.position.x=4.2*a;renderer.render(scene,camera);}new ResizeObserver(resize).observe(host);resize();
 function draw(t){frame=0;if(document.hidden||start.classList.contains('hidden')||start.classList.contains('guide-open')||start.classList.contains('booting'))return;if(t-last>50){last=t;const seconds=t/1000;for(const c of clouds)c.position.x=c.userData.origin+(reduced?0:Math.sin(seconds*.045+c.userData.origin)*1.1);sun.rotation.z=reduced?0:Math.sin(seconds*.12)*.025;renderer.render(scene,camera);}if(!reduced)frame=requestAnimationFrame(draw);}
 const wake=()=>{if(!frame)frame=requestAnimationFrame(draw);};new MutationObserver(wake).observe(start,{attributes:true,attributeFilter:['class']});document.addEventListener('visibilitychange',wake);wake();
}catch(error){console.warn('Title sky using its illustrated fallback:',error);}}
