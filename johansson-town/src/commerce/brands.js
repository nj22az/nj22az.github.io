// Original fictional packaging for the 1997 town. Stable catalogue IDs/names
// remain the save-game and purchasing keys; brand copy is a presentation layer.
export const STORE_BRANDS=Object.freeze({
 tea:{name:'NAGI',jp:"Nagi",line:"Green tea",paper:'#f5edcf',ink:'#224b35',accent:'#738c43',symbol:'leaf'},
 coffee:{name:'PORT 88',jp:"Port88",line:"Canned coffee",paper:'#322823',ink:'#f5e5c1',accent:'#bd4826',symbol:'gull'},
 rice:{name:'SAKURA',jp:"Sakura knot",line:"Plum rice ball",paper:'#fff5de',ink:'#354b35',accent:'#ba3d39',symbol:'rice'},
 biscuit:{name:'KOMOREBI',jp:"Komorebi",line:"Butter biscuit",paper:'#f5e4ad',ink:'#982d24',accent:'#ce9234',symbol:'sun'},
 soap:{name:'HANAMORI',jp:"Hanamori",line:"Soap",paper:'#f8dedb',ink:'#944355',accent:'#ba727e',symbol:'flower'},
 notebook:{name:'SHIOFUMI',jp:"Shiofumi",line:"University Notes",paper:'#e8e1c8',ink:'#364d66',accent:'#63849d',symbol:'wave'},
 postcard:{name:'SHIOFUMI',jp:"Shiofumi",line:"Port postcard",paper:'#efe4c8',ink:'#2c5f6e',accent:'#bf633e',symbol:'gull'},
 battery:{name:'HOSHIMARU',jp:"Hoshimaru",line:"Dry battery · AA",paper:'#253f59',ink:'#f9e1a0',accent:'#c15734',symbol:'star'},
 cola:{name:'SHIOSAI',jp:"Shiosai",line:"Cola",paper:'#b63231',ink:'#fff0d3',accent:'#e8b855',symbol:'wave'},
 water:{name:'MIZUNOWA',jp:"Mizunowa",line:"Natural water",paper:'#d3e5df',ink:'#2e6572',accent:'#6dabae',symbol:'wave'},
 beer:{name:'UMINEKO',jp:"Umineko",line:"Beer",paper:'#eddda0',ink:'#38523d',accent:'#9f5433',symbol:'gull'},
 noodles:{name:'YUNAGI',jp:"Yuunagi",line:"Soy sauce ramen",paper:'#ecd0a1',ink:'#8d3028',accent:'#394e41',symbol:'sun'},
 milk:{name:'ASAMORI',jp:"Asamori",line:"Milk",paper:'#f4ebdb',ink:'#356b8b',accent:'#80a4bb',symbol:'sun'},
 stock:{name:'SAKURA',jp:"Sakura Shop",line:"Delivery box · Handle with care",paper:'#e5d1ac',ink:'#60523f',accent:'#9d493d',symbol:'flower'},
 buns:{name:'SAKURA',jp:"Sakura Shop",line:"Other meat buns",paper:'#f3deb6',ink:'#934033',accent:'#d3934c',symbol:'sun'},
 chips:{name:'KOGANE',jp:"Kogane",line:"Potato chips",paper:'#f8dc7e',ink:'#a42a23',accent:'#bf3928',symbol:'sun'},
 crackers:{name:'HAMABE',jp:"Hamabe",line:"Soy sauce cracker",paper:'#f1e2bf',ink:'#233b51',accent:'#ac7840',symbol:'wave'},
 chocolate:{name:'TSUKINO',jp:"Moon",line:"Milk chocolate",paper:'#67252b',ink:'#f4d48a',accent:'#a07443',symbol:'star'},
 candy:{name:'MARUAME',jp:"Maruame",line:"Fruit candy",paper:'#f6cd4d',ink:'#315a36',accent:'#e8812b',symbol:'sun'},
 curry:{name:'HINODE',jp:"Sunrise",line:"Curry roux",paper:'#e7af32',ink:'#7e3024',accent:'#b73c24',symbol:'sun'},
 soy:{name:'KAMEJIRUSHI',jp:"Turtle",line:"Soy sauce",paper:'#efe2c7',ink:'#722b24',accent:'#ac352b',symbol:'flower'},
 soup:{name:'MISATO',jp:"Misato",line:"Miso soup",paper:'#f1dfbd',ink:'#8e3529',accent:'#b15231',symbol:'sun'},
 peaches:{name:'MOMOSATO',jp:"Momosato",line:"White peach pickled in syrup",paper:'#f5e4c9',ink:'#a95151',accent:'#cd8b7c',symbol:'leaf'},
 tuna:{name:'SHIOHAMA',jp:"Ushiohama",line:"Tuna flakes",paper:'#dce4d7',ink:'#265c6b',accent:'#679999',symbol:'gull'},
 detergent:{name:'SUZUKAZE',jp:"Suzukaze",line:"Washing detergent",paper:'#eef0df',ink:'#284e81',accent:'#dd7b33',symbol:'wave'},
 tissues:{name:'KOMACHI',jp:"Komachi",line:"Facial tissue",paper:'#dce5d2',ink:'#c25a58',accent:'#99b6a0',symbol:'flower'},
 toothpaste:{name:'HAKUSEN',jp:"White rice",line:"Medicinal toothpaste",paper:'#f2efe5',ink:'#20518a',accent:'#be4038',symbol:'star'},
 orange:{name:'MIKANBI',jp:"Orange day",line:"Orange juice",paper:'#f1a134',ink:'#28502e',accent:'#db7324',symbol:'sun'},
 soda:{name:'AOZORA',jp:"Blue sky",line:"Ramune",paper:'#d9eced',ink:'#25557e',accent:'#69aed0',symbol:'wave'},
 yogurt:{name:'ASAMORI',jp:"Asamori",line:"Plain yogurt",paper:'#eef0df',ink:'#32638b',accent:'#81aa7d',symbol:'sun'},
 bread:{name:'KOMUGI',jp:"Komugi",line:"Milk bread",paper:'#f1dcae',ink:'#6f422c',accent:'#c9924c',symbol:'leaf'},
 // The chilled top shelf. A konbini's cold cabinet runs to the ceiling and the top
 // level is where the made-up-this-morning food goes: the bento, the sandwiches and
 // the puddings, all delivered daily and all gone by evening.
 bento:{name:'MINATOYA',jp:"Minatoya",line:"Makunouchi bento",paper:'#e4d7b6',ink:'#4a3a2a',accent:'#9d4a34',symbol:'rice'},
 sandwich:{name:'KOMUGI',jp:"Komugi",line:"Egg sandwich",paper:'#f4ecd8',ink:'#6f422c',accent:'#c9924c',symbol:'leaf'},
 pudding:{name:'ASAMORI',jp:"Asamori",line:"Custard Pudding",paper:'#f6e0ab',ink:'#8a5a24',accent:'#c98f3c',symbol:'sun'},
 // Printed matter for the rack under the window. None of it is stock: you read it
 // standing up, the way you do, and the shop never charges for it.
 'magazine-sea':{name:'UMIKAZE',jp:"Sea breeze",line:"Monthly Sea breeze",paper:'#d7e5ec',ink:'#20496b',accent:'#3d7fa6',symbol:'wave'},
 'magazine-night':{name:'HOSHIZORA',jp:"Starzora",line:"Weekly Starry sky",paper:'#2b3a5c',ink:'#f2e2b0',accent:'#c58a3a',symbol:'star'},
 'magazine-rod':{name:'KATSUO',jp:"Bonito",line:"Fishing and the sea",paper:'#f0e3c4',ink:'#2f5c45',accent:'#b5622f',symbol:'gull'},
 newspaper:{name:'MINATO',jp:"Minato Shimbun",line:"Evening edition",paper:'#e8e4d6',ink:'#3a3530',accent:'#8d3f31',symbol:'wave'},
});

export const BRAND_ATLAS_KEYS=Object.freeze(['tea','coffee','rice','biscuit','soap','notebook','postcard','battery','cola','water','beer','noodles','milk','stock','buns','shop','chips','crackers','chocolate','candy','curry','soy','soup','peaches','tuna','detergent','tissues','toothpaste','orange','soda','yogurt','bread','bento','sandwich','pudding','magazine-sea','magazine-night','magazine-rod','newspaper']);
