/** Merges guide/articles.mjs into guide/residents.json: the live cast only, each with its article.
 * node tools/apply-articles.mjs  (then tools/render-resident-shoot.mjs and tools/render-resident-guide.mjs)
 */
import {readFile,writeFile} from 'node:fs/promises';
import {ARTICLES} from '../guide/articles.mjs';
const path=new URL('../guide/residents.json',import.meta.url);
const old=JSON.parse(await readFile(path,'utf8')),byName=new Map(old.map(r=>[r.name,r]));
// Residents renamed in the game (src/people/renamed.js) keep their old facts under the new name,
// unless a newer catalogue entry for them is supplied: node tools/apply-articles.mjs newer.json
import {RENAMED_RESIDENTS} from '../src/people/renamed.js';
for(const [was,now] of Object.entries(RENAMED_RESIDENTS))if(byName.has(was)&&!byName.has(now))byName.set(now,{...byName.get(was),name:now});
if(process.argv[2])for(const r of JSON.parse(await readFile(process.argv[2],'utf8')))if(!byName.has(r.name)||Object.values(RENAMED_RESIDENTS).includes(r.name))byName.set(r.name,{...byName.get(r.name),...r});
const slug=name=>name.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
// Facts that changed in the game since the old catalogue was written.
const FIX={
 Thao:{friend:'Thuan'},Nhung:{friend:'Reiko'},'Mrs Sato':{friend:'Thao'},'Harbour master':{friend:'Mrs Sato'},'Bus driver':{friend:'Grandmother Higa'},
 Chin:{role:'Repairman and karaoke champion'},
 'Mr Shimabukuro':{role:'Power house keeper',place:'Town power house'},
 'Mrs Higa':{role:'Bathhouse attendant',place:'Umi-no-yu bandai',portrait:'assets/images/residents/higa.webp',
  islandPersonality:{title:'Keeper of the bandai',traits:['Unflappable','observant','dry'],habit:'Finishes the crossword clue before taking your coins.',ambition:'Keep Umi-no-yu a family bath for another thirty years.',favourite:'The rock bath after dark'}},
};
const catalogue=Object.entries(ARTICLES).map(([name,article])=>{
 const base={...(byName.get(name)||{name}),...(FIX[name]||{})};
 const photos=article.photos.map((p,i)=>({...p,file:`assets/images/residents/shoot/${slug(name)}-${i+1}.webp`}));
 return {...base,name,bio:article.standfirst,backstory:article.body.join(' '),article:{headline:article.headline,standfirst:article.standfirst,body:article.body,quote:article.quote,photos}};
});
await writeFile(path,JSON.stringify(catalogue,null,1)+'\n');
console.log('Catalogue:',catalogue.length,'residents;',old.length-catalogue.filter(r=>byName.has(r.name)).length,'retired.');
