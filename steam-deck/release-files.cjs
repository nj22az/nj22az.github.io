// Shared by the release builder and updater. A patch is a complete, verifiable
// target file list plus only the files whose bytes/mode changed from its base.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const hash=data=>crypto.createHash('sha256').update(data).digest('hex');
const validPath=name=>typeof name==='string'&&name.length<1024&&!name.includes('\\')&&!/[\x00-\x1f\x7f]/.test(name)&&!name.startsWith('/')&&name.split('/').every(p=>p&&p!=='.'&&p!=='..');
const tree=files=>hash(JSON.stringify(Object.entries(files).sort(([a],[b])=>(a<b?-1:a>b?1:0))));
const runtimeFile=name=>!name.startsWith('resources/app/')&&!['README.md','install.sh'].includes(name);
function inventory(root,version){
 const files=Object.create(null);
 function walk(dir,prefix=''){for(const entry of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>(a.name<b.name?-1:a.name>b.name?1:0))){const name=prefix+entry.name,file=path.join(dir,entry.name);if(name==='bundle-manifest.json')continue;if(!validPath(name)||entry.isSymbolicLink())throw Error('Unsupported release path: '+name);if(entry.isDirectory())walk(file,name+'/');else if(entry.isFile()){const stat=fs.statSync(file);files[name]={sha256:hash(fs.readFileSync(file)),bytes:stat.size,mode:stat.mode&0o777};}else throw Error('Unsupported release file: '+name);}}
 walk(root);return {format:1,version,tree:tree(files),runtime:tree(Object.fromEntries(Object.entries(files).filter(([name])=>runtimeFile(name)))),files};
}
function validateInventory(m){
 if(!m||m.format!==1||!/^\d+\.\d+\.\d+$/.test(m.version)||!m.files||Array.isArray(m.files)||Object.keys(m.files).length>30000)throw Error('Invalid release file list');
 for(const [name,f] of Object.entries(m.files))if(!validPath(name)||!f||!/^[a-f0-9]{64}$/.test(f.sha256)||!Number.isSafeInteger(f.bytes)||f.bytes<0||!Number.isInteger(f.mode)||f.mode<0||f.mode>0o777)throw Error('Invalid release file entry');
 if(m.tree!==tree(m.files)||m.runtime!==tree(Object.fromEntries(Object.entries(m.files).filter(([name])=>runtimeFile(name)))))throw Error('Release file list checksum failed');
 return m;
}
function verify(root,m){const actual=inventory(root,m.version);if(actual.tree!==validateInventory(m).tree)throw Error('Installed files do not match the release. Use the full download to repair them.');}
module.exports={inventory,validateInventory,verify,validPath,runtimeFile};
