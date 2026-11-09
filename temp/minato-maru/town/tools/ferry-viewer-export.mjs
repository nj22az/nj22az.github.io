#!/usr/bin/env node
/**
 * The ferry viewer's data, written for the Office's viewer page (nj22az.github.io, /ferry/). The owner, 9 November 2026:
 * "I want a ferry viewer on my website", "a stand alone ferry viewer that can show the whole ferry in an exploded view".
 *
 * The ship shown is the Christina (the owner, the same day: "I think you should call this ship the Christina , it's not
 * the same as Minato Maru", "We can rebuild Minato maru later from what we learn from building this ship"). She is the
 * lead ship: for now she is drawn by the Minato Maru's builders and renamed in the page module, and the World's ferry is
 * not replaced or changed.
 *
 *   node tools/ferry-viewer-export.mjs --out=<Office checkout>/ferry/data [--report=<file.json>]
 *
 * She is built in headless Chromium by the game's own modules (tools/ferry-viewer-export.page.js), because her plates,
 * dials and signs are drawn on canvases, and posed as the game poses her with someone below deck: the engine room shown,
 * its Blender model loaded by the game's own loader. Nothing here changes the game.
 *
 * Writes `ferry.bin.gz` (a JMF1 container: a JSON header and quantised geometry, see the page module) and
 * `ferry-atlas.webp` (every plate, dial and sign on one picture).
 */
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {execSync} from 'node:child_process';
import {gzipSync} from 'node:zlib';
import {join,resolve,extname,dirname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const args=Object.fromEntries(process.argv.slice(2).map(a=>{const m=a.match(/^--([^=]+)(?:=(.*))?$/);return m?[m[1],m[2]??true]:[a,true];}));
if(typeof args.out!=='string'){console.error('usage: node tools/ferry-viewer-export.mjs --out=<Office checkout>/ferry/data [--report=<file.json>]');process.exit(2);}
const OUT=resolve(args.out),PAGE='/johansson-town/__ferry-viewer-export';
const TYPES={'.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.glb':'model/gltf-binary','.html':'text/html','.png':'image/png','.webp':'image/webp'};

/** What the page posts back, by name. */
const posted=new Map();
const server=createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(req.method==='POST'&&url.pathname.startsWith('/__out/')){const chunks=[];for await(const c of req)chunks.push(c);posted.set(url.pathname.slice(7),Buffer.concat(chunks));res.writeHead(204).end();return;}
 if(url.pathname===PAGE){res.writeHead(200,{'content-type':'text/html'}).end('<!doctype html><meta charset="utf-8"><title>Ferry viewer export</title><script type="module" src="/johansson-town/tools/ferry-viewer-export.page.js"></script>');return;}
 // The page lives at /johansson-town/, as the game does, so `assets/…` resolves as it does in the game.
 if(url.pathname.startsWith('/johansson-town/')){
  const file=resolve(ROOT,decodeURIComponent(url.pathname.slice('/johansson-town/'.length)));
  if(!file.startsWith(ROOT+sep)){res.writeHead(403).end();return;}
  try{const body=await readFile(file);res.writeHead(200,{'content-type':TYPES[extname(file)]||'application/octet-stream'}).end(body);}catch{res.writeHead(404).end();}
  return;
 }
 res.writeHead(404).end();
});
await new Promise(done=>server.listen(0,'127.0.0.1',done));
const port=server.address().port;

const req=createRequire(import.meta.url);let chromium;
try{({chromium}=req(join(execSync('npm root -g').toString().trim(),'playwright')));}catch{({chromium}=await import('playwright'));}
const browser=await chromium.launch(),page=await browser.newPage();
page.on('console',m=>console.log(m.text()));
page.on('pageerror',e=>console.error('page error: '+(e.stack||e.message)));
let failed=null;
try{
 await page.goto(`http://127.0.0.1:${port}${PAGE}`);
 await page.waitForFunction('globalThis.__exportDone||globalThis.__exportError',null,{timeout:300000});
 failed=await page.evaluate('globalThis.__exportError||null');
}catch(e){failed=e.message;}
await browser.close();server.close();
if(failed){console.error('export failed: '+failed);process.exit(1);}

const git=cmd=>{try{return execSync('git '+cmd,{cwd:ROOT,stdio:['ignore','pipe','ignore']}).toString().trim();}catch{return '';}};
const header=JSON.parse(posted.get('header.json').toString('utf8')),bin=posted.get('data.bin');
// Which Town source she was built from: the viewer shows it, so a stale picture can be told from the game.
header.source={repository:'nj22az/johansson-town',commit:git('rev-parse --short HEAD'),uncommitted:git('status --porcelain --untracked-files=no')!=='',generator:'tools/ferry-viewer-export.mjs'};
let head=Buffer.from(JSON.stringify(header),'utf8');
if(head.length%4)head=Buffer.concat([head,Buffer.alloc(4-head.length%4,0x20)]);
const lead=Buffer.alloc(8);lead.write('JMF1',0,'latin1');lead.writeUInt32LE(head.length,4);
const file=Buffer.concat([lead,head,bin]),gz=gzipSync(file,{level:9});
await mkdir(OUT,{recursive:true});
await writeFile(join(OUT,'ferry.bin.gz'),gz);
await writeFile(join(OUT,'ferry-atlas.webp'),posted.get('atlas.webp'));
if(typeof args.report==='string')await writeFile(resolve(args.report),posted.get('report.json'));
const kb=n=>(n/1024).toFixed(0)+' kB';
console.log(`ferry.bin.gz ${kb(gz.length)} (${kb(file.length)} unpacked), ferry-atlas.webp ${kb(posted.get('atlas.webp').length)} → ${OUT}`);
