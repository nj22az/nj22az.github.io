/** A staging handoff to the existing jojo/remotion engine; no second movie renderer. */
export function filmStaging({scene,camera,origin,cast,image}){
 const finite=v=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite);
 if(!scene)throw Error('Invalid film staging scene.');
 if(!finite(camera?.pos)||!finite(camera?.at))throw Error('Invalid film staging camera position or target.');
 if(!finite(origin))throw Error('Invalid film staging origin: '+JSON.stringify(origin));
 if(!Array.isArray(camera.size)||camera.size.length!==2||!camera.size.every(n=>Number.isInteger(n)&&n>0&&n<=4096))throw Error('Invalid film staging frame size.');
 if(!Number.isFinite(camera.fov)||camera.fov<=0||camera.fov>=180)throw Error('Invalid film staging camera field of view.');
 if(!Array.isArray(cast)||cast.length>6)throw Error('Invalid film staging cast.');
 const warnings=[],names=new Set();for(const actor of cast){if(typeof actor.name!=='string'||!finite(actor.position))throw Error('Invalid staged actor.');if(names.has(actor.name))warnings.push('Duplicate cast name: '+actor.name);names.add(actor.name);if(actor.size!==1)warnings.push(actor.name+': scene scale differs from canonical film height.');if(Math.abs(actor.position[1]-origin[1])>.02)warnings.push(actor.name+': elevated/sloping floor needs a matching film support rule.');if(actor.take)warnings.push(actor.name+': captured performance take requires mapping to film animation tracks.');}
 if(image!==undefined&&(typeof image!=='string'||image.length>8*1024*1024||!/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(image)))throw Error('Invalid staging plate.');
 return {format:'johansson-film-staging',version:1,pipeline:'nj22az/jojo/remotion',scene:structuredClone(scene),camera:structuredClone(camera),origin:[...origin],cast:structuredClone(cast),...(image?{image}:{}),warnings,
  next:'Use this clean plate and camera/marks with jojo/remotion. Map the cast into the episode, retain depth/occlusion and World collision checks, then draft-comic, preview and review. This packet is not an approved episode or a complete film project.'};
}
