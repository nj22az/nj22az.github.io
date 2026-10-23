import * as THREE from '../../../vendor/three.module.js';
import {assetURL} from '../../assets.js';
import DATA from './sakura-roof-design.json' with {type:'json'};
import {SAKURA_REBUILD_OFFSET} from './sakura-rebuild-layout.js';

// A2 paper prints on the exact audited wall planes. No catalogue or pricing changes.
export function buildSakuraCampaignPosters(room,{load=url=>new THREE.TextureLoader().loadAsync(url)}={}){
 const group=new THREE.Group();group.name='Sakura A2 campaign posters';room.add(group);
 const records=[],jobs=[];
 for(const p of DATA.posters){
  const east=p.wall==='east',normal=[east?-1:1,0,0],center=[(east?13.9:0)+SAKURA_REBUILD_OFFSET[0]+normal[0]*.009,(p.bottom+p.height/2)/1000,SAKURA_REBUILD_OFFSET[2]-(p.start+p.width/2)/1000];
  const mat=new THREE.MeshBasicMaterial({color:0xfff4de,toneMapped:false});
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(p.width/1000,p.height/1000),mat);mesh.name='Sakura campaign '+p.id;mesh.position.set(...center);mesh.rotation.y=east?-Math.PI/2:Math.PI/2;
  mesh.userData={...p,center,normal};group.add(mesh);records.push(mesh.userData);
  const backing=new THREE.Mesh(new THREE.BoxGeometry(.004,p.height/1000+.008,p.width/1000+.008),new THREE.MeshStandardMaterial({color:0xe5d8b8,roughness:.9}));backing.position.set(...center);backing.position.x-=normal[0]*.004;group.add(backing);
  jobs.push(load(assetURL('graphics/advertising/sakura-campaigns/'+p.asset)).then(texture=>{texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;mat.map=texture;mat.color.set(0xffffff);mat.needsUpdate=true;return {id:p.id,loaded:true};}).catch(()=>({id:p.id,loaded:false})));
 }
 group.userData={revision:DATA.revision,placements:records};
 return {group,placements:records,ready:Promise.all(jobs)};
}
