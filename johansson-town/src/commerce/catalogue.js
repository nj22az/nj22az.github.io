import {STORE_BRANDS} from './brands.js';
/**
 * Prices are late 1997's, tax included -- consumption tax went to five per cent that
 * April, which is when a can of cola became ¥120 and a rice ball stopped being ¥100.
 */
export const STORE_ITEMS=Object.freeze([
 {id:'tea',jp:'緑茶',name:'Green tea',cost:120,color:0x64835b,text:'A chilled bottle of green tea. Thuan keeps the oldest stock at the front.'},
 {id:'coffee',jp:'缶コーヒー',name:'Canned coffee',cost:120,color:0x815549,text:'A small can of coffee for the walk down to the harbour.'},
 {id:'rice',jp:'おにぎり',name:'Plum rice ball',cost:110,color:0xeee3c3,text:'Rice, a little pickled plum and a strip of nori. Wrapped this afternoon.'},
 {id:'biscuit',jp:'ビスケット',name:'Butter biscuits',cost:100,color:0xc19464,text:'A paper packet of biscuits. The corner is folded closed with care.'},
 {id:'soap',jp:'せっけん',name:'Sakura soap',cost:90,color:0xc8899b,text:'A lightly scented bar wrapped in pale pink paper.'},
 {id:'notebook',jp:'大学ノート',name:'Pocket notebook',cost:80,color:0x878c92,text:'Ruled pages for tide times, errands and things you meant to remember.'},
 {id:'postcard',jp:'絵はがき',name:'Harbour postcard',cost:50,color:0x799aa5,text:'A printed view of the old breakwater. Thuan knows the photographer.'},
 {id:'battery',jp:'乾電池',name:'Radio batteries',cost:180,color:0xb07856,text:'Two dry-cell batteries. Ask before fitting them to the shop radio.'}
].map(item=>({...item,brand:STORE_BRANDS[item.id].name,brandJp:STORE_BRANDS[item.id].jp,text:STORE_BRANDS[item.id].name+' · '+STORE_BRANDS[item.id].jp+'\n'+item.text})));

export const GROCERY_ITEMS=Object.freeze([...STORE_ITEMS,...[
 {id:'cola',name:'Sea breeze cola',jp:'コーラ',cost:120,color:0xb63231,text:'A small bottle of cola.'},
 {id:'water',name:'Spring water',jp:'天然水',cost:110,color:0x8dbfc1,text:'Water from the hills above the harbour.'},
 {id:'beer',name:'Umineko lager',jp:'麦酒',cost:220,color:0xc9ab59,text:'A chilled can of the local fictional lager.'},
 {id:'noodles',name:'Instant shoyu noodles',jp:'カップ麺',cost:150,color:0xd8b46e,text:'A sealed cup of noodles to take home.'},
 {id:'milk',name:'Asamori milk',jp:'牛乳',cost:110,color:0xdbe5df,text:'A small carton of milk.'},
 {id:'chips',name:'Salted potato crisps',jp:STORE_BRANDS.chips.line,cost:100,color:0xe5d9bc,text:'KOGANE · Salted potato crisps'},
 {id:'crackers',name:'Soy rice crackers',jp:STORE_BRANDS.crackers.line,cost:110,color:0xe5d9bc,text:'HAMABE · Soy rice crackers'},
 {id:'chocolate',name:'Milk chocolate',jp:STORE_BRANDS.chocolate.line,cost:100,color:0xe5d9bc,text:'TSUKINO · Milk chocolate'},
 {id:'candy',name:'Fruit sweets',jp:STORE_BRANDS.candy.line,cost:90,color:0xe5d9bc,text:'MARUAME · Fruit sweets'},
 {id:'curry',name:'Curry roux',jp:STORE_BRANDS.curry.line,cost:180,color:0xe5d9bc,text:'HINODE · Curry roux'},
 {id:'soy',name:'Soy sauce',jp:STORE_BRANDS.soy.line,cost:160,color:0xe5d9bc,text:'KAMEJIRUSHI · Soy sauce'},
 {id:'soup',name:'Miso soup sachets',jp:STORE_BRANDS.soup.line,cost:120,color:0xe5d9bc,text:'MISATO · Miso soup sachets'},
 {id:'peaches',name:'Tinned peaches',jp:STORE_BRANDS.peaches.line,cost:190,color:0xe5d9bc,text:'MOMOSATO · Tinned peaches'},
 {id:'tuna',name:'Tinned tuna',jp:STORE_BRANDS.tuna.line,cost:160,color:0xe5d9bc,text:'SHIOHAMA · Tinned tuna'},
 {id:'detergent',name:'Laundry powder',jp:STORE_BRANDS.detergent.line,cost:240,color:0xe5d9bc,text:'SUZUKAZE · Laundry powder'},
 {id:'tissues',name:'Facial tissues',jp:STORE_BRANDS.tissues.line,cost:130,color:0xe5d9bc,text:'KOMACHI · Facial tissues'},
 {id:'toothpaste',name:'Mint toothpaste',jp:STORE_BRANDS.toothpaste.line,cost:180,color:0xe5d9bc,text:'HAKUSEN · Mint toothpaste'},
 {id:'orange',name:'Mandarin juice',jp:STORE_BRANDS.orange.line,cost:120,color:0xe5d9bc,text:'MIKANBI · Mandarin juice'},
 {id:'soda',name:'Ramune soda',jp:STORE_BRANDS.soda.line,cost:100,color:0xe5d9bc,text:'AOZORA · Ramune soda'},
 {id:'yogurt',name:'Plain yogurt',jp:STORE_BRANDS.yogurt.line,cost:110,color:0xe5d9bc,text:'ASAMORI · Plain yogurt'},
 {id:'bread',name:'Milk bread',jp:STORE_BRANDS.bread.line,cost:150,color:0xe5d9bc,text:'KOMUGI · Milk bread'},
 // The daily-delivery top shelf of the cold cabinet. Dearer than the rest of the
 // aisle, because it was made this morning and will not keep.
 {id:'bento',name:'Makunouchi bento',jp:STORE_BRANDS.bento.line,cost:480,color:0xe5d9bc,text:'MINATOYA · Makunouchi bento'},
 {id:'sandwich',name:'Egg sandwiches',jp:STORE_BRANDS.sandwich.line,cost:230,color:0xe5d9bc,text:'KOMUGI · Egg sandwiches'},
 {id:'pudding',name:'Custard pudding',jp:STORE_BRANDS.pudding.line,cost:130,color:0xe5d9bc,text:'ASAMORI · Custard pudding'},
].map(item=>({...item,brand:STORE_BRANDS[item.id].name,brandJp:STORE_BRANDS[item.id].jp}))]);
