import {canonicalHomeId} from '../people/households.js';
import {peninsulaActive} from './town-mode.js';
import {BOOKSHOP_WORKSHOP} from './bookshop-workshop-layout.js';
// Stable destinations: old save references resolve to the surviving business.
export const BUSINESS_ALIASES=Object.freeze({journal:'frontrow',electronics:'form3d',stepwise:'form3d',career:'office'});
export const businessId=id=>{const canonical=BUSINESS_ALIASES[id]||id;return peninsulaActive()&&canonical==='form3d'?'frontrow':canonical;};
export const isWorkshopSite=id=>id==='form3d'||peninsulaActive()&&id==='frontrow';
export const CORE_BUSINESSES=Object.freeze([
 {id:'frontrow',title:'Front-Row Books & Press',jp:'前列書房・印刷',sub:'BOOKS · EVENING PRESS',side:1,z:4,color:0x735849,accent:'#8b3f36',line:'Aya’s books and Reiko’s evening paper, under one roof.',directions:'The bookshop and printing desk share the west block, facing Main Street.'},
 {id:'form3d',title:'Kenji & Tetsuo Repairs',jp:'立体・電気工房',sub:'PATTERNS · RADIOS · INSTRUMENTS',side:1,z:4,color:0x566b73,accent:'#385f6e',line:'Kenji’s pattern bench and Tetsuo’s radio and instrument repairs.',directions:'The repair workshop is in the east block, across Main Street from the bookshop.'},
 {id:'office',title:'Johansson Harbour Office',jp:'港務・技術事務所',sub:'MARINE SERVICE · HARBOUR RECORDS',side:1,z:-42,color:0x62776e,accent:'#49675d',line:'Shipping records, tide tables and Johansson’s marine service files.',directions:'Follow the main street to the quay. The harbour office is on the right, opposite the warehouse.'},
 {id:'market',title:'Sakura Shōten',jp:'桜商店',sub:'DAILY GOODS',side:-1,z:-28,color:0x9d7c7e,accent:'#a76680',line:'Thuan’s convenience store · tea, snacks and everyday things.'},
].map(Object.freeze));
export const createBusinesses=()=>CORE_BUSINESSES.map(site=>({...site}));
export const createPeninsulaBusinesses=()=>createBusinesses().filter(site=>['market','frontrow','office'].includes(site.id)).map(site=>site.id==='frontrow'?{...site,...BOOKSHOP_WORKSHOP}:site);
export function consolidateBusinesses(sites){
 const retired=new Set(Object.keys(BUSINESS_ALIASES));
 // Also accept callers carrying the older eight-shop catalogue.
 for(let i=sites.length-1;i>=0;i--)if(retired.has(sites[i].id))sites.splice(i,1);
 for(const definition of CORE_BUSINESSES){const site=sites.find(s=>s.id===definition.id);if(site)Object.assign(site,definition);}
 if(peninsulaActive()){
  for(let i=sites.length-1;i>=0;i--)if(sites[i].id==='form3d')sites.splice(i,1);
  const books=sites.find(s=>s.id==='frontrow');if(books)Object.assign(books,BOOKSHOP_WORKSHOP);
 }
 return sites;
}
export function migratedVisits(visits=[]){return [...new Set(visits.map(id=>canonicalHomeId(businessId(id))))];}
