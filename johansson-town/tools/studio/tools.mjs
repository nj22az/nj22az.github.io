/**
 * Johansson Studio's tools: one table used by the MCP server (server.mjs) and the command line (cli.mjs), so the
 * same work gets done when the MCP connection is not there. Each tool has a JSON Schema input (zod's fromJSONSchema
 * turns it into the server's input), and its work loads only when it is first called: World's code and the core on
 * the first call, Chromium only for a render.
 *
 * Write tools are dry runs unless called with dryRun:false. None of them commits or pushes.
 */
const NAME={type:'string',minLength:1,maxLength:40,description:'A resident\'s name as World writes it (e.g. "Mr Fujita", "Kōji"), or a Studio character\'s id or name.'};
const SET={type:'object',minProperties:1,maxProperties:80,propertyNames:{pattern:'^[a-z][a-zA-Z]*(\\.[a-z][a-zA-Z]*)?$'},additionalProperties:{type:['string','number','boolean']},
 description:'Fields to change, by path: {"outfit.hat":"captain","hair.colour":"#9a9a96"}. character_get with options:true lists every path and its choices.'};
const NOTE={type:'string',minLength:1,maxLength:500,description:'Why, in at least four words. It is kept with the look and in the change log.'};
const DRY={type:'boolean',default:true,description:'true (the default) only reports what would change; false writes it (never commits).'};
const object=(properties,required=[])=>({type:'object',additionalProperties:false,properties,required});

let core;
/** World's code and Studio's core, loaded on the first call. */
async function load(){
 core??=Promise.all([import('../../src/avatars/cast.js'),import('../../src/avatars/looks.js'),import('../../src/avatars/recipe.js'),
  import('../../src/studio/change.js'),import('../../src/studio/rules.js'),import('../../src/studio/sha256.js'),import('./apply.mjs'),import('./repo.mjs')])
  .then(([cast,looks,recipe,change,rules,sha,apply,repo])=>({cast,looks,recipe,change,rules,sha,apply,repo}));
 return core;
}

/** A file of World's code (always the real checkout, also when a test points the data elsewhere). */
async function codeFile(path){const [{readFile},{resolve},c]=await Promise.all([import('node:fs/promises'),import('node:path'),load()]);return readFile(resolve(c.repo.CODE_ROOT,path),'utf8');}
const slug=s=>String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,30);
const stamp=(made,what)=>`${made.slice(0,19).replace(/:/g,'-')}Z-${slug(what).replace(/^[^a-z0-9]+/,'')||'change'}`;

/** Everything about the people Studio knows, read fresh from the data each call. */
async function people(ctx){
 const c=await load(),{looks}=await c.apply.readData(ctx.repo);
 let guide=[];try{guide=JSON.parse(await codeFile('johansson-town/guide/residents.json'));}catch{}
 const {PROFILES}=await import('../../src/people/profiles.js');
 const roles=new Map([...PROFILES.map(p=>[p.name,p.role]),...guide.map(g=>[g.name,g.role])]);
 const groupOf=name=>Object.entries(c.cast.RESIDENT_GROUPS).find(([,names])=>names.includes(name))?.[0];
 /** A resident by name, or a Studio character by id or name. */
 function find(name){
  if(c.cast.RESIDENT_NAMES.includes(name)){const look=looks.looks[name]||null;
   return {kind:'resident',name,group:groupOf(name),look,recipe:c.change.lookedRecipe(name,look?.set),role:roles.get(name)||''};}
  const id=Object.hasOwn(looks.characters,name)?name:Object.keys(looks.characters).find(k=>looks.characters[k].name===name);
  if(id){const r=looks.characters[id];return {kind:'studio',id,name:r.name,group:'studio',record:r,recipe:r.recipe,role:r.card?.role||''};}
  return null;
 }
 return {c,looks,find,roles,groupOf};
}
const unknown=name=>Object.assign(Error(`Nobody called ${JSON.stringify(name)} lives in World or in Studio. character_list lists everybody.`),{problems:[]});

/** Make a change file for some steps, then dry-run or apply it. */
async function change(ctx,{ops,note,dryRun,what}){
 const c=await load(),made=new Date().toISOString(),{fingerprint}=await c.apply.readData(ctx.repo);
 const file={format:'johansson-studio-change',version:1,id:stamp(made,what),made,by:'claude',note,base:{looks:fingerprint.looks},ops};
 const r=await c.apply.applyChange(file,{dryRun,repo:ctx.repo});
 return {...r,change:file};
}
const sentenceList=list=>(list||[]).map(p=>p.sentence);
function report(r,extra={}){
 return {ok:r.ok,applied:r.applied,dryRun:r.dryRun,...extra,results:r.results,problems:sentenceList(r.problems),conflicts:sentenceList(r.conflicts),
  warnings:sentenceList(r.warnings),writes:r.writes,nothing:r.nothing,change:r.change,
  next:!r.ok?'Nothing was written. Fix the problems above and call again.':r.dryRun?'A dry run: nothing was written. Call again with dryRun:false to apply it.':r.applied?'Written to Studio\'s data (not committed). World shows it once the creator says "update World" and it is published.':undefined};
}

export const TOOLS=[
 {name:'character_list',readOnly:true,description:'List the people Studio can draw: World\'s cast, its neighbours, the townsfolk (drawn from their name and personality), and Studio-only characters. Says whose look has been changed in Studio.',
  input:object({group:{enum:['cast','neighbour','townsfolk','studio']},query:{type:'string',maxLength:40,description:'Part of a name or role.'}}),
  async run({group,query},ctx){
   const {c,looks,roles,groupOf}=await people(ctx),q=query?.normalize('NFKC').toLowerCase();
   const all=[...c.cast.RESIDENT_NAMES.map(name=>({name,group:groupOf(name),edited:Object.hasOwn(looks.looks,name),role:roles.get(name)||''})),
    ...Object.entries(looks.characters).map(([id,r])=>({name:r.name,id,group:'studio',edited:true,role:r.card?.role||''}))];
   const list=all.filter(p=>(!group||p.group===group)&&(!q||(p.name+' '+p.role).normalize('NFKC').toLowerCase().includes(q)));
   return {count:list.length,characters:list};
  }},
 {name:'character_get',readOnly:true,description:'One person\'s recipe as World draws them today (with any published Studio look; never this device\'s private wardrobe), their Studio look if any, where the look comes from, and their profile (gait and voice, which a look never changes). options:true adds every field a look may set, with its choices.',
  input:object({name:NAME,options:{type:'boolean',default:false}},['name']),
  async run({name,options},ctx){
   const {c,find}=await people(ctx),who=find(name);if(!who)throw unknown(name);
   const source=who.kind==='studio'?'a Studio-only character (data/studio/looks.json); World does not place them yet':
    {cast:'drawn in src/avatars/cast.js (CAST_RECIPES)',neighbour:'drawn in src/avatars/cast.js (NEIGHBOUR_RECIPES)',townsfolk:'made from their name and personality (cast.js baseRecipe)'}[who.group];
   const {profile,...recipe}=who.recipe;
   return {name:who.name,id:who.id,group:who.group,role:who.role,source,override:who.kind==='resident'?who.look:null,card:who.record?.card,recipe,profile,
    note:'profile (gait and voice) is read-only: a look changes how somebody looks, not who they are.',
    options:options?c.looks.LOOK_FIELDS:undefined};
  }},
 {name:'character_update',description:'Change fields of a resident\'s look (published to World when the creator says "update World") or of a Studio-only character. Numbers outside 0..1 are clamped and reported. Dry run by default.',
  input:object({name:NAME,set:SET,note:NOTE,dryRun:DRY},['name','set','note']),
  async run({name,set,note,dryRun=true},ctx){
   const {c,find}=await people(ctx),who=find(name);if(!who)throw unknown(name);
   const was=Object.fromEntries(Object.keys(set).filter(p=>c.looks.LOOK_PATHS.includes(p)).map(p=>[p,c.looks.readPath(who.recipe,p)]));
   const op=who.kind==='resident'?{op:'look.set',name:who.name,set,was,note}:{op:'character.set',id:who.id,set,was};
   const r=await change(ctx,{ops:[op],note,dryRun,what:`${who.name} look`});
   // The recipe as it is (or, in a dry run, would be) after the change: the steps again over today's data.
   const after=r.ok?c.change.applyOps({looks:(await c.apply.readData(ctx.repo)).looks},c.rules.validateChange(r.change).change.ops,{made:r.change.made}).data.looks:null;
   const now=after&&(who.kind==='resident'?c.change.lookedRecipe(who.name,after.looks[who.name]?.set):after.characters[who.id]?.recipe);
   return report(r,{name:who.name,recipe:now?(({profile,...rest})=>rest)(now):undefined,diff:r.results?.flatMap(x=>x.diff)||[],
    clamped:(r.warnings||[]).filter(w=>w.rule==='clamped').map(w=>w.sentence)});
  }},
 {name:'character_create',description:'Add a Studio-only character, starting from a resident or Studio character (from) or from the plain default, with some fields set. World does not place them: a World resident needs a home, a routine and a personality (an open decision for the creator). Dry run by default.',
  input:object({name:{type:'string',minLength:1,maxLength:24},id:{type:'string',pattern:'^[a-z][a-z0-9-]{1,39}$'},from:NAME,set:{...SET,minProperties:0},
   card:object({role:{type:'string',minLength:1,maxLength:60},why:{type:'string',minLength:1,maxLength:300,description:'Who they are for and why they exist, in at least four words.'}},['role','why']),note:{...NOTE,description:'Why, in at least four words (defaults to the card\'s why).'},dryRun:DRY},['name','card']),
  async run({name,id,from,set={},card,note,dryRun=true},ctx){
   const {c,find}=await people(ctx);let start=c.recipe.DEFAULT_RECIPE;
   if(from){const who=find(from);if(!who)throw unknown(from);start=who.recipe;}
   const checked=c.rules.validateLookSet(set,{allowEmpty:true});
   if(checked.problems.length)return {ok:false,applied:false,problems:sentenceList(checked.problems)};
   const recipe=c.recipe.normalizeRecipe(c.looks.applyLook({...start,name},checked.set));
   // A name in kana or kanji has no letters for an id: it gets one from its fingerprint.
   const cid=id||(/^[a-z][a-z0-9-]{1,39}$/.test(slug(name))?slug(name):'character-'+c.sha.sha256(name).slice(0,8));
   const r=await change(ctx,{ops:[{op:'character.create',id:cid,character:{name,recipe,card}}],note:note||card.why,dryRun,what:`${cid} new`});
   return report(r,{id:cid,name});
  }},
 {name:'character_reset',description:'Take a resident\'s Studio look away, so World draws them as it did before. A resident can never be deleted. Dry run by default.',
  input:object({name:NAME,note:{...NOTE,description:'Why, in at least four words (optional).'},dryRun:DRY},['name']),
  async run({name,note,dryRun=true},ctx){
   const {find}=await people(ctx),who=find(name);if(!who)throw unknown(name);
   if(who.kind!=='resident')throw Error(`${who.name} is a Studio-only character; character_delete removes them.`);
   if(!who.look)return {ok:true,applied:false,dryRun,nothing:`${who.name} has no Studio look: World already draws them as cast.js does.`};
   const r=await change(ctx,{ops:[{op:'look.reset',name:who.name,was:who.look.set}],note:note||`Reset ${who.name}'s look to how World draws them.`,dryRun,what:`${who.name} reset`});
   return report(r,{name:who.name});
  }},
 {name:'character_delete',description:'Delete a Studio-only character. Residents of World are never deleted (character_reset gives back their World look). Dry run by default.',
  input:object({id:{type:'string',minLength:1,maxLength:40,description:'The Studio character\'s id (or name).'},note:{...NOTE,description:'Why, in at least four words (optional).'},dryRun:DRY},['id']),
  async run({id,note,dryRun=true},ctx){
   const {c,find}=await people(ctx),who=find(id);if(!who)throw unknown(id);
   if(who.kind==='resident')throw Error(`${who.name} lives in Johansson World and can never be deleted; character_reset takes away a Studio look.`);
   const r=await change(ctx,{ops:[{op:'character.delete',id:who.id,was:c.sha.recordSha256(who.record)}],note:note||`Delete the Studio character ${who.name}.`,dryRun,what:`${who.id} delete`});
   return report(r,{id:who.id,name:who.name});
  }},
 {name:'render_portrait',readOnly:true,image:true,description:'A PNG portrait drawn in headless Johansson Studio (the iPad\'s own code, at its 1024x1366 viewport): a person by name (with any Studio look) or a recipe. Also saved under output/studio-mcp/portraits/.',
  input:object({name:NAME,recipe:{type:'object',description:'A recipe instead of a name, e.g. a draft from character_get.'},view:{enum:['front','quarter','left','right','back'],default:'front'},
   expression:{type:'string',maxLength:30,default:'smile'},pose:{type:'string',maxLength:40,default:'Idle'},framing:{enum:['full','face'],default:'full'},
   size:{type:'integer',minimum:128,maximum:1024,default:512},background:{type:'string',pattern:'^(#[0-9a-fA-F]{6}|transparent)$',default:'#f3ede2'}}),
  async run({name,recipe,view='front',expression='smile',pose='Idle',framing='full',size=512,background='#f3ede2'},ctx){
   if(!name===!recipe)throw Error('Give either a name or a recipe.');
   const {c,find}=await people(ctx);let who=null;
   if(name){who=find(name);if(!who)throw unknown(name);}
   const drawn=c.recipe.normalizeRecipe(who?who.recipe:recipe),page=await ctx.page();
   const png=await page.renderPortrait(drawn,{view,expression,pose,framing,size,background});
   const path=`${c.repo.PATHS.output}/portraits/${[slug(who?.name||drawn.name)||'recipe',...[view,framing,pose,expression,size].map(slug)].join('-')}.png`;
   await ctx.repo.write(path,png);
   return {image:png.toString('base64'),mimeType:'image/png',data:{name:who?.name||drawn.name||'(recipe)',view,expression,pose,framing,size,path}};
  }},
 {name:'validate',readOnly:true,description:'Check Studio\'s data (looks), the brand rules and the known real-brand uses in World, or a change file, and say in plain words what is wrong.',
  input:object({target:{enum:['all','looks','brands','change'],default:'all'},change:{type:'object',description:'A change file to check (target change).'}}),
  async run({target='all',change:file},ctx){
   const c=await load(),out={};
   if(target==='change'){if(!file)throw Error('Give the change file as change.');const r=c.rules.validateChange(file);return {ok:r.ok,problems:sentenceList(r.problems),warnings:sentenceList(r.warnings)};}
   if(target==='all'||target==='looks'){
    const looks=c.rules.validateLooks(await ctx.repo.readJSON(c.repo.PATHS.looks)),{check}=await import('./build-data.mjs'),fresh=await check(ctx.repo);
    out.looks={ok:looks.ok&&fresh.ok,problems:[...sentenceList(looks.problems),...fresh.stale.map(p=>`${p} does not match its data: run node johansson-town/tools/studio/build-data.mjs.`)]};
   }
   if(target==='all'||target==='brands')out.brands=await brandReport(ctx);
   return {ok:Object.values(out).every(r=>r.ok),...out};
  }},
 {name:'publish_check',readOnly:true,description:'Is Studio\'s work ready to publish to World? Reports: generated modules fresh, data valid, the Studio tests, the runtime build current, the guide portraits current, main merged into the branch, and uncommitted files. It never commits or pushes; publishing happens only when the creator says "update World".',
  input:object({tests:{type:'boolean',default:true,description:'Run the Studio tests (about 20 s).'}}),
  async run({tests=true},ctx){return publishCheck(ctx,{tests});}},
];
export const TOOL_BY_NAME=Object.freeze(Object.fromEntries(TOOLS.map(t=>[t.name,t])));

/** What a tool works with: the repository (data root) and, made on first use, the headless Studio page. */
export async function context(){
 const {openRepo}=await import('./repo.mjs');let page=null;
 return {repo:openRepo(),page:async()=>page??=new (await import('./page.mjs')).StudioPage(),close:async()=>{await page?.close();page=null;}};
}

/** Run a tool on arguments that already match its input. Errors come back as {error, problems}, never thrown. */
export async function callTool(name,args,ctx){
 const tool=TOOL_BY_NAME[name];
 if(!tool)return {error:`There is no tool called ${JSON.stringify(name)}. Tools: ${TOOLS.map(t=>t.name).join(', ')}.`};
 try{return await tool.run(args,ctx);}catch(e){return {error:e.message,problems:e.problems?.map(p=>p.sentence??p)};}
}

/** The known real-brand uses in World's code: each must still be where brand-rules.json says (else it moved). */
async function brandReport(ctx){
 const c=await load(),rules=await ctx.repo.readJSON(c.repo.PATHS.brands),warnings=[];
 for(const issue of rules.knownIssues){
  const lines=(await codeFile('johansson-town/'+issue.file).catch(()=>'')).split('\n'),line=lines[issue.line-1]||'';
  const still=issue.term==='livery'?/beer/i.test(line):line.toLowerCase().includes(issue.term);
  warnings.push(still?`Known: ${issue.file}:${issue.line} — ${issue.note} (waiting for the creator's choice of a fictional name).`
   :`${issue.file}:${issue.line} no longer has "${issue.term}"; it was fixed or moved. Update knownIssues in data/studio/brand-rules.json.`);
 }
 const problems=[];
 if(!rules.brands.includes('orion'))problems.push('brand-rules.json must list "orion".');
 if(rules.brands.includes('asahi'))problems.push('brand-rules.json lists "asahi", which is a street name here (jojo\'s brandsWhy).');
 return {ok:!problems.length,problems,warnings};
}

/** The publish_check report: every item {check, ok, detail}, and whether all of them pass. */
async function publishCheck(ctx,{tests}){
 const c=await load(),{execFile}=await import('node:child_process'),{promisify}=await import('node:util'),run=promisify(execFile);
 const {resolve}=await import('node:path'),{readFile,stat}=await import('node:fs/promises'),code=c.repo.CODE_ROOT,town=resolve(code,'johansson-town');
 const git=async(...args)=>(await run('git',args,{cwd:code,maxBuffer:4e6})).stdout;
 const items=[],add=(check,ok,detail)=>items.push({check,ok,detail});
 const {check}=await import('./build-data.mjs'),fresh=await check(ctx.repo);
 add('generated modules',fresh.ok,fresh.ok?'looks-data.js matches data/studio/looks.json.':`Out of date: ${fresh.stale.join(', ')}. Run node johansson-town/tools/studio/build-data.mjs.`);
 const looks=c.rules.validateLooks(await ctx.repo.readJSON(c.repo.PATHS.looks)),brands=await brandReport(ctx);
 add('data',looks.ok&&brands.ok,[...sentenceList(looks.problems),...brands.problems].join(' ')||`looks.json is valid. ${brands.warnings.length} known real-brand uses in World wait for the creator (validate target:"brands").`);
 if(tests){
  const files=['tests/looks-data.test.mjs','tests/studio-apply.test.mjs','tests/studio-data.test.mjs','tests/studio-mcp.test.mjs','tests/resident-guide.test.mjs'];
  const {NODE_TEST_CONTEXT,...env}=process.env;
  const r=await run(process.execPath,['--test',...files],{cwd:town,env,timeout:180000,maxBuffer:2e7}).then(x=>({out:x.stdout,ok:true}),e=>({out:String(e.stdout||e.message),ok:false}));
  const count=k=>Number(r.out.match(new RegExp(`^# ${k} (\\d+)`,'m'))?.[1]??NaN);
  add('tests',r.ok&&count('fail')===0,`${count('pass')} passed, ${count('fail')} failed (${files.join(', ')}).`);
 }
 const {runtimeSourceHash}=await import('../../scripts/runtime-source.mjs');
 const recorded=JSON.parse(await readFile(resolve(town,'runtime/source.json'),'utf8')).sha256,current=await runtimeSourceHash(town);
 add('runtime build',recorded===current,recorded===current?'runtime/ matches the source.':'runtime/ is older than the source: run npm run build:runtime in johansson-town before publishing (the coordinator does this).');
 const manifest=JSON.parse(await readFile(resolve(town,'guide/portraits.json'),'utf8')),{createHash}=await import('node:crypto'),hash=createHash('sha256');
 for(const path of manifest.sourceFiles)hash.update(path+'\0').update(await readFile(resolve(town,path))).update('\0');
 const portraits=hash.digest('hex')===manifest.sha256;
 add('guide portraits',portraits,portraits?'The resident guide\'s portraits match the avatar source.':'The guide portraits are older than the avatar source or the looks: run node johansson-town/tools/render-resident-guide.mjs.');
 try{
  const main=(await git('rev-parse','--verify','origin/main')).trim(),merged=await run('git',['merge-base','--is-ancestor',main,'HEAD'],{cwd:code}).then(()=>true,()=>false);
  const fetched=await stat(resolve(code,'.git/FETCH_HEAD')).then(s=>s.mtime.toISOString(),()=>'never');
  add('main merged',merged,merged?`origin/main (as last fetched, ${fetched}) is merged into this branch.`:`origin/main (as last fetched, ${fetched}) has commits this branch does not: git fetch origin main, then merge it before pushing.`);
 }catch(e){add('main merged',false,`Could not read origin/main: ${e.message}`);}
 const dirty=(await git('status','--porcelain','--untracked-files=all','--','johansson-town','avatar-creator','.mcp.json')).split('\n').filter(Boolean).map(l=>l.slice(3));
 const own=dirty.filter(p=>/^johansson-town\/(data\/studio\/|src\/avatars\/looks-data\.js|src\/commerce\/products-data\.js|assets\/graphics\/labels\/)/.test(p));
 add('uncommitted',!own.length,own.length?`Studio's changes to commit: ${own.join(', ')}.`:'Studio\'s data is committed.');
 return {ready:items.every(i=>i.ok),items,otherUncommitted:dirty.filter(p=>!own.includes(p)),
  next:'Only when the creator says "update World": commit Studio\'s files, git fetch origin main and merge it, push the branch, then check the johansson-town-live.yml run (gh api repos/nj22az/nj22az.github.io/actions/workflows/johansson-town-live.yml/runs?per_page=3). It is live only after that run succeeds.'};
}
