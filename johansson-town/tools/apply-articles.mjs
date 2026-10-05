/** Merges guide/articles.mjs into guide/residents.json: the live cast only, each with its article.
 * node tools/apply-articles.mjs  (then tools/render-resident-shoot.mjs and tools/render-resident-guide.mjs)
 */
import {readFile,writeFile} from 'node:fs/promises';
import {ARTICLES} from '../guide/articles.mjs';
const path=new URL('../guide/residents.json',import.meta.url);
const old=JSON.parse(await readFile(path,'utf8')),byName=new Map(old.map(r=>[r.name,r]));
const slug=name=>name.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
// Facts that changed in the game since the old catalogue was written.
const FIX={
 Nao:{friend:'Thuan'},Aya:{friend:'Reiko'},'Mrs Sato':{friend:'Nao'},'Harbour master':{friend:'Mrs Sato'},'Bus driver':{friend:'Grandmother Higa'},
 Kenji:{role:'Repairman and karaoke champion'},
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
