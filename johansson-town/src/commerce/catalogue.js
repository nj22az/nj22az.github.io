import {STORE_BRANDS} from './brands.js';
export const STORE_ITEMS=Object.freeze([
 {id:'tea',jp:'緑茶',name:'Green tea',cost:120,color:0x64835b,text:'A chilled bottle of green tea. Yuri keeps the oldest stock at the front.'},
 {id:'coffee',jp:'缶コーヒー',name:'Canned coffee',cost:120,color:0x815549,text:'A small can of coffee for the walk down to the harbour.'},
 {id:'rice',jp:'おにぎり',name:'Plum rice ball',cost:80,color:0xeee3c3,text:'Rice, a little pickled plum and a strip of nori. Wrapped this afternoon.'},
 {id:'biscuit',jp:'ビスケット',name:'Butter biscuits',cost:100,color:0xc19464,text:'A paper packet of biscuits. The corner is folded closed with care.'},
 {id:'soap',jp:'せっけん',name:'Sakura soap',cost:90,color:0xc8899b,text:'A lightly scented bar wrapped in pale pink paper.'},
 {id:'notebook',jp:'大学ノート',name:'Pocket notebook',cost:80,color:0x878c92,text:'Ruled pages for tide times, errands and things you meant to remember.'},
 {id:'postcard',jp:'絵はがき',name:'Harbour postcard',cost:50,color:0x799aa5,text:'A printed view of the old breakwater. Yuri knows the photographer.'},
 {id:'battery',jp:'乾電池',name:'Radio batteries',cost:180,color:0xb07856,text:'Two dry-cell batteries. Ask before fitting them to the shop radio.'}
].map(item=>({...item,brand:STORE_BRANDS[item.id].name,brandJp:STORE_BRANDS[item.id].jp,text:STORE_BRANDS[item.id].name+' · '+STORE_BRANDS[item.id].jp+'\n'+item.text})));
