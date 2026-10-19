/** Sync canonical addresses and authored guide copy without rebuilding unchanged portraits.
 * Run after editing guide/residents.json or the home registry: node scripts/sync-resident-guide.mjs.
 * The previous portrait fingerprint must still match all rendering sources and subjects.
 */
import {readFile,writeFile} from 'node:fs/promises';
import {portraitSourceHash} from './portrait-source.mjs';
import {homeForResident,secondaryHomesFor} from '../src/people/island-households.js';
const root=new URL('../',import.meta.url),read=path=>readFile(new URL(path,root),'utf8');
const guide=JSON.parse(await read('guide/residents.json')),oldScript=await read('resident-guide.js');
const marker='window.JOHANSSON_RESIDENT_GUIDE = ',start=oldScript.indexOf(marker);
if(start<0)throw Error('The existing guide data could not be read.');
const previous=JSON.parse(oldScript.slice(start+marker.length).replace(/;\s*$/,''));
const subjects=records=>JSON.stringify(records.map(({name,portrait})=>({name,portrait})));
if(subjects(previous)!==subjects(guide))throw Error('Portrait subjects changed. Regenerate their portraits with tools/render-resident-guide.mjs.');
const manifest=JSON.parse(await read('guide/portraits.json'));
if(await portraitSourceHash(root,manifest.sourceFiles,JSON.stringify(previous,null,1)+'\n')!==manifest.sha256)throw Error('Avatar rendering sources changed. Regenerate portraits before syncing guide metadata.');
const home=h=>h?{id:h.home,address:h.address,residents:[...h.residents],...(h.unitNumber?{unitNumber:h.unitNumber}:{}),island:h.island,entranceSiteId:h.entranceSiteId}:null;
for(const resident of guide){resident.home=home(homeForResident(resident.name));resident.secondaryHomes=secondaryHomesFor(resident.name).map(home);}
const json=JSON.stringify(guide,null,1)+'\n';
const generated='// Generated from guide/residents.json; sync copy and canonical homes with scripts/sync-resident-guide.mjs.\n'+marker+JSON.stringify(guide)+';\n';
manifest.sha256=await portraitSourceHash(root,manifest.sourceFiles,json);
await writeFile(new URL('guide/residents.json',root),json);
await writeFile(new URL('resident-guide.js',root),generated);
await writeFile(new URL('guide/portraits.json',root),JSON.stringify(manifest,null,2)+'\n');
console.log('Synced '+guide.length+' guide entries with canonical homes; portrait rendering inputs are unchanged.');
