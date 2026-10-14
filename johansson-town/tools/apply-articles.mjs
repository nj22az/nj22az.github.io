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
 Thao:{friend:'Thuan'},Nhung:{friend:'Reiko'},'Harbour master':{friend:'Mrs Sato'},
 Chin:{role:'Repairman and karaoke champion'},
 Johansson:{role:'Mayor of Minato-chō',place:'The town hall, Minato; home on Kitano-jima',
  islandPersonality:{title:'Practical dreamer',traits:['Curious','dependable','quietly adventurous'],habit:'Tests repaired radios at Chin and Tetsuo’s bench on quiet afternoons.',ambition:'Run the town without losing its small shops, its bath or its working boats.',favourite:'A late supper at Minato'}},
 'Bus driver':{friend:'Grandmother Higa',role:'Master of the Minato Maru',place:'The Minato Maru’s wheelhouse',dailyLife:'I collect passengers and opening sentences. The best stories start on the last crossing.',
  islandPersonality:{title:'Collector of stories',traits:['Friendly','punctual','curious'],habit:'Knows the regulars by the way they wave from the quay.',ambition:'Keep every call on time, and the island connected to the harbour.',favourite:'The last crossing in golden light'}},
 'Mrs Sato':{friend:'Thao',role:'Ramen cook',place:'Sato Ramen'},
 'Grandmother Chinen':{role:'Keeper of the old Chinen house',place:'Kitano hamlet, Kitano-jima',portrait:'assets/images/residents/grandmother-chinen.webp',
  islandPersonality:{title:'The lane’s weather station',traits:['Sharp-eyed','unhurried','generous with vegetables'],habit:'Sweeps the lane in front of her gate at half past six, whatever the weather.',ambition:'See the old house stand through one more typhoon season.',favourite:'The breeze at her gate at three in the afternoon'}},
 'Mr Shimabukuro':{role:'Power house keeper',place:'Town power house'},
 'Miss Higa':{role:'Schoolteacher; keeps the Umi-no-yu bandai in the evenings and at weekends',place:'The island school and the Umi-no-yu bandai',portrait:'assets/images/residents/higa.webp',
  islandPersonality:{title:'Teacher by day, keeper of the bandai by night',traits:['Patient','observant','dry'],habit:'Marks the class’s homework at the bandai between customers.',ambition:'Send every pupil in her class on to the mainland high school able to read, reckon and swim.',favourite:'The rock bath after dark, once the boiler is running sweet'}},
};
const catalogue=Object.entries(ARTICLES).map(([name,article])=>{
 const base={...(byName.get(name)||{name}),...(FIX[name]||{})};
 const photos=article.photos.map((p,i)=>({...p,file:`assets/images/residents/shoot/${slug(name)}-${i+1}.webp`}));
 return {...base,name,bio:article.standfirst,backstory:article.body.join(' '),article:{headline:article.headline,standfirst:article.standfirst,body:article.body,quote:article.quote,photos}};
});
await writeFile(path,JSON.stringify(catalogue,null,1)+'\n');
console.log('Catalogue:',catalogue.length,'residents;',old.length-catalogue.filter(r=>byName.has(r.name)).length,'retired.');
