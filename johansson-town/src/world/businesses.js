// Stable destinations: old save references resolve to the surviving business.
export const BUSINESS_ALIASES=Object.freeze({journal:'frontrow',electronics:'form3d',stepwise:'form3d',career:'office'});
export const businessId=id=>BUSINESS_ALIASES[id]||id;
export const CORE_BUSINESSES=Object.freeze([
 {id:'frontrow',title:'Front-Row Books & Press',jp:'前列書房・印刷',sub:'BOOKS · EVENING PRESS',side:1,z:4,color:0x735849,accent:'#8b3f36',line:'Aya’s books and Reiko’s evening paper, under one roof.',directions:'Take the narrow eastern alley. The bookshop and printing desk share the southern frontage.'},
 {id:'form3d',title:'Kenji & Tetsuo Repairs',jp:'立体・電気工房',sub:'PATTERNS · RADIOS · INSTRUMENTS',side:1,z:4,color:0x566b73,accent:'#385f6e',line:'Kenji’s pattern bench and Tetsuo’s radio and instrument repairs.',directions:'Enter the eastern shopping alley. The shared repair workshop faces the bookshop.'},
 {id:'office',title:'Johansson Harbour Office',jp:'港務・技術事務所',sub:'MARINE SERVICE · HARBOUR RECORDS',side:1,z:-42,color:0x62776e,accent:'#49675d',line:'Shipping records, tide tables and Johansson’s marine service files.',directions:'Follow the main street to the quay. The harbour office is on the right, opposite the warehouse.'},
 {id:'market',title:'Sakura Shōten',jp:'桜商店',sub:'DAILY GOODS',side:-1,z:-28,color:0x9d7c7e,accent:'#a76680',line:'Yuri’s convenience store · tea, snacks and everyday things.'},
].map(Object.freeze));
export const createBusinesses=()=>CORE_BUSINESSES.map(site=>({...site}));
export function consolidateBusinesses(sites){
 const retired=new Set(Object.keys(BUSINESS_ALIASES));
 // Also accept callers carrying the older eight-shop catalogue.
 for(let i=sites.length-1;i>=0;i--)if(retired.has(sites[i].id))sites.splice(i,1);
 for(const definition of CORE_BUSINESSES){const site=sites.find(s=>s.id===definition.id);if(site)Object.assign(site,definition);}
 return sites;
}
export function migratedVisits(visits=[]){return [...new Set(visits.map(businessId))];}
