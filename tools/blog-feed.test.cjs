const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const siteRoot=process.env.BLOG_SITE_ROOT || '.';
const window={addEventListener(){}};
const document={querySelectorAll(){return [];},createElement(){return {set innerHTML(v){this.textContent=v.replace(/<[^>]+>/g,'');},textContent:''};}};
const context={window,document,location:{origin:'https://nj22az.github.io'},URL,Set,Intl};
vm.runInNewContext(fs.readFileSync(siteRoot+'/assets/js/blog-posts.js','utf8'),context);
vm.runInNewContext(fs.readFileSync(siteRoot+'/assets/js/blog-feed.js','utf8'),context);
const posts=window.OFFICE_BLOG_POSTS,merge=window.OfficeBlogFeed.merge;
let list=merge(posts,[{id:81,link:'https://theofficeofnils.wordpress.com/a',title:{rendered:'Duplicate'},date:'2025-11-17'},{id:900,link:'javascript:alert(1)',title:{rendered:'Unsafe'}},{id:901,link:'https://other.example/a',title:{rendered:'Wrong origin'}}]);
assert.equal(list.length,14);assert.equal(list.slice(0,5).map(p=>p.id).join(),'scandic-laajavuori-jyvaskyla,scandic-elmia-jonkoping,scandic-rosendahl-tampere,best-western-plus-hotel-odense,hotel-marina-vedbaek');assert.equal(list[5].id,'the-torn-poster');assert.equal(list[5].date,'2026-10-09');assert.equal(list[6].id,'lanternan-som-lyser-svagt');assert.equal(list[10].id,'pumpen-som-inte-startar');assert.ok(posts.filter(p=>p.topic==='Hotel stay').every(p=>p.hotel&&p.url.startsWith('/blog/')));
list=merge(posts,[{id:999,link:'https://theofficeofnils.wordpress.com/new',title:{rendered:'<b>New post</b>'},excerpt:{rendered:'<p>A new article</p>'},date:'2026-10-28T12:00:00'},{id:999,link:'https://theofficeofnils.wordpress.com/new',title:{rendered:'Duplicate'}}]);
assert.equal(list.length,15);assert.equal(list[0].title,'New post');assert.equal(list.filter(p=>p.wpId===81).length,1);assert.equal(posts.filter(p=>p.svUrl).length,5);assert.ok(posts.filter(p=>p.wpId).every(p=>!p.svUrl));
console.log('PASS: one chronological feed, stable series order, WordPress deduplication, allowed links, English-first catalogue and optional Swedish only');

