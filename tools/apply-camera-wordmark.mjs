// Sets Johansson World's wordmark and the camera's Japanese stamp into camera/index.html, between its wordmark markers,
// from the outlines tools/draw-camera-wordmark.py wrote (camera/brand/wordmark.json).
//   node tools/apply-camera-wordmark.mjs          write the block
//   node tools/apply-camera-wordmark.mjs --check  fail when the page's block is not the outlines' (CI, the brand suite)
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../',import.meta.url));
const START='<!-- wordmark:start (tools/apply-camera-wordmark.mjs writes this block; do not edit it by hand) -->',END='<!-- wordmark:end -->';
export async function wordmarkBlock(){
 const {wordmark:w,kana:k}=JSON.parse(await readFile(root+'camera/brand/wordmark.json','utf8'));
 return `${START}\n`
  +`      <svg class="world-mark" viewBox="${w.viewBox}" role="img" aria-label="Johansson World"><path class="wm-main" d="${w.main}"/><path class="wm-town" d="${w.town}"/></svg>\n`
  +`      <span class="world-stamp" role="img" aria-label="ポケットカメラ" lang="ja"><svg viewBox="${k.viewBox}" aria-hidden="true"><path d="${k.d}"/></svg></span>\n`
  +`      ${END}`;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const page=await readFile(root+'camera/index.html','utf8'),a=page.indexOf(START),b=page.indexOf(END);
 if(a<0||b<a){console.error('camera/index.html has no wordmark markers');process.exit(1);}
 const next=page.slice(0,a)+await wordmarkBlock()+page.slice(b+END.length);
 if(process.argv.includes('--check')){if(next!==page){console.error('camera/index.html: the wordmark block is not camera/brand/wordmark.json’s; run node tools/apply-camera-wordmark.mjs');process.exit(1);}console.log('wordmark: the page carries the outlines');}
 else{await writeFile(root+'camera/index.html',next);console.log(next===page?'wordmark: unchanged':'wordmark: written into camera/index.html');}
}
