/** Inventory World source assets without loading textures or duplicating game geometry. */
import {readFile,writeFile,readdir,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {join,relative} from 'node:path';
import {PROP_REGISTRY,propPurpose} from '../../johansson-town/src/studio/prop-registry.js';
import {HOME_FURNITURE} from '../../johansson-town/src/build/home-furniture.js';
import {BUILD_CATALOGUE} from '../../johansson-town/src/build/catalogue.js';
import {RESIDENT_NAMES} from '../../johansson-town/src/avatars/cast.js';
import {PROFILES} from '../../johansson-town/src/people/profiles.js';
import {LOCATIONS} from '../scene-model.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url)),town=join(root,'johansson-town');
async function walk(folder){const out=[];for(const e of await readdir(folder,{withFileTypes:true})){const p=join(folder,e.name);if(e.isDirectory())out.push(...await walk(p));else if(e.isFile())out.push(p);}return out.sort();}
const sourceFiles=(await walk(join(town,'src'))).filter(p=>p.endsWith('.js')&&!p.includes('/studio/'));
const sources=await Promise.all(sourceFiles.map(async p=>({path:relative(root,p),text:await readFile(p,'utf8')})));
const entries=[];const purpose=p=>typeof p==='string'?{who:'',why:p,where:''}:{who:p?.for||p?.who||'',why:p?.why||'',where:p?.where||''};
function add(e){e.purpose=purpose(e.purpose);e.refs=[];const needles=e.match||[];
 for(const s of sources){if(s.path===e.source)continue;const lines=s.text.split('\n');for(let i=0;i<lines.length;i++)if(needles.some(n=>n&&lines[i].includes(n))){e.refs.push({file:s.path,line:i+1});if(e.refs.length>=20)break;}if(e.refs.length>=20)break;}
 delete e.match;entries.push(e);
}
for(const e of PROP_REGISTRY)add({id:'registry:'+e.id,name:e.name,kind:e.kind,source:'johansson-town/src/'+e.source.split(' ')[0],purpose:await propPurpose(e.id),access:'model',match:[e.source.split(' ')[1]?.split('(')[0]]});
for(const e of HOME_FURNITURE)add({id:'home:'+e.id,name:e.name,kind:'furniture',source:'johansson-town/src/build/home-furniture.js',purpose:e.purpose,access:'model',match:["'"+e.id+"'",'"'+e.id+'"']});
for(const e of BUILD_CATALOGUE)add({id:'build:'+e.id,name:e.name,kind:'street furniture',source:'johansson-town/prop-factory.js',purpose:{why:e.purpose,where:e.ground},access:'source',match:[e.make+'(']});
const catalog=JSON.parse(await readFile(join(town,'assets/catalog/index.json'),'utf8'));
for(const [id,c] of (Array.isArray(catalog.assets)?catalog.assets.map(c=>[c.id,c]):Object.entries(catalog.assets||catalog))){if(!c||typeof c!=='object'||Array.isArray(c))continue;const p=join(town,'assets/catalog',id,'asset.json');try{const a=JSON.parse(await readFile(p,'utf8'));add({id:'catalogue:'+id,name:a.name,kind:a.kind,source:relative(root,p),purpose:a.purpose,access:'model',match:[id]});}catch{}}
for(const name of RESIDENT_NAMES){const p=PROFILES.find(p=>p.name===name);add({id:'character:'+name,name,kind:'character',source:'johansson-town/src/avatars/cast.js',purpose:{who:name,why:p?.role||'',where:''},access:'character',match:["'"+name+"'",'"'+name+'"']});}
for(const [id,name] of LOCATIONS)add({id:'location:'+id,name,kind:'location',source:'johansson-town/src/scene/scene-world.js',purpose:null,access:'scene',match:["'"+id+"'",'"'+id+'"']});
for(const file of await walk(join(town,'assets'))){const path=relative(root,file),ext=file.split('.').at(-1).toLowerCase();if(!['glb','gltf','blend','png','webp','jpg','jpeg','svg','ogg','mp3','wav','mp4'].includes(ext))continue;
 const kind=['ogg','mp3','wav'].includes(ext)?'audio':ext==='mp4'?'video':['glb','gltf','blend'].includes(ext)?'model file':'image';
 add({id:'file:'+path,name:relative(join(town,'assets'),file),kind,source:path,bytes:(await stat(file)).size,purpose:null,access:ext==='glb'?'glb':'file',match:[relative(join(town,'assets'),file),file.split('/').at(-1)]});}
for(const s of sources){if(!/\/(world|build|okinawa)\//.test(s.path))continue;for(const m of s.text.matchAll(/export\s+(?:async\s+)?function\s+((?:build|create)[A-Z]\w*)/g))add({id:'builder:'+s.path+'#'+m[1],name:m[1],kind:'code-built scenery',source:s.path,purpose:null,access:'source',match:[m[1]+'(']});}
const output={format:'johansson-world-library',version:1,scope:'World asset files, registered model builders, exported scenery builders, resident cast and current Studio locations. Source references are evidence, not a runtime placement census. Instances, inline geometry and generated audio still need adapters.',entries};
await writeFile(join(root,'avatar-creator/world-library.json'),JSON.stringify(output));console.log(`${entries.length} World library entries; ${entries.filter(e=>e.purpose.why).length} documented purposes.`);
