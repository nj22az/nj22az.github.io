// Original fictional packaging for the 1988 town. Stable catalogue IDs/names
// remain the save-game and purchasing keys; brand copy is a presentation layer.
export const STORE_BRANDS=Object.freeze({
 tea:{name:'NAGI',jp:'なぎ',line:'緑茶',paper:'#f5edcf',ink:'#224b35',accent:'#738c43',symbol:'leaf'},
 coffee:{name:'PORT 88',jp:'ポート88',line:'缶コーヒー',paper:'#322823',ink:'#f5e5c1',accent:'#bd4826',symbol:'gull'},
 rice:{name:'SAKURA',jp:'さくら結び',line:'梅おにぎり',paper:'#fff5de',ink:'#354b35',accent:'#ba3d39',symbol:'rice'},
 biscuit:{name:'KOMOREBI',jp:'こもれび',line:'バタービスケット',paper:'#f5e4ad',ink:'#982d24',accent:'#ce9234',symbol:'sun'},
 soap:{name:'HANAMORI',jp:'花もり',line:'せっけん',paper:'#f8dedb',ink:'#944355',accent:'#ba727e',symbol:'flower'},
 notebook:{name:'SHIOFUMI',jp:'潮ふみ',line:'大学ノート',paper:'#e8e1c8',ink:'#364d66',accent:'#63849d',symbol:'wave'},
 postcard:{name:'SHIOFUMI',jp:'潮ふみ',line:'港の絵はがき',paper:'#efe4c8',ink:'#2c5f6e',accent:'#bf633e',symbol:'gull'},
 battery:{name:'HOSHIMARU',jp:'星まる',line:'乾電池 · 単三',paper:'#253f59',ink:'#f9e1a0',accent:'#c15734',symbol:'star'},
 cola:{name:'SHIOSAI',jp:'しおさい',line:'コーラ',paper:'#b63231',ink:'#fff0d3',accent:'#e8b855',symbol:'wave'},
 water:{name:'MIZUNOWA',jp:'みずのわ',line:'天然水',paper:'#d3e5df',ink:'#2e6572',accent:'#6dabae',symbol:'wave'},
 beer:{name:'UMINEKO',jp:'うみねこ',line:'麦酒',paper:'#eddda0',ink:'#38523d',accent:'#9f5433',symbol:'gull'},
 noodles:{name:'YUNAGI',jp:'ゆうなぎ',line:'しょうゆラーメン',paper:'#ecd0a1',ink:'#8d3028',accent:'#394e41',symbol:'sun'},
 milk:{name:'ASAMORI',jp:'あさもり',line:'牛乳',paper:'#f4ebdb',ink:'#356b8b',accent:'#80a4bb',symbol:'sun'},
 stock:{name:'SAKURA',jp:'さくら商店',line:'納品箱 · 取扱注意',paper:'#e5d1ac',ink:'#60523f',accent:'#9d493d',symbol:'flower'},
 buns:{name:'SAKURA',jp:'さくら商店',line:'ほかほか肉まん',paper:'#f3deb6',ink:'#934033',accent:'#d3934c',symbol:'sun'},
 chips:{name:'KOGANE',jp:'こがね',line:'ポテトチップス',paper:'#f8dc7e',ink:'#a42a23',accent:'#bf3928',symbol:'sun'},
 crackers:{name:'HAMABE',jp:'浜べ',line:'しょうゆせんべい',paper:'#f1e2bf',ink:'#233b51',accent:'#ac7840',symbol:'wave'},
 chocolate:{name:'TSUKINO',jp:'月の',line:'ミルクチョコレート',paper:'#67252b',ink:'#f4d48a',accent:'#a07443',symbol:'star'},
 candy:{name:'MARUAME',jp:'まるあめ',line:'フルーツキャンディ',paper:'#f6cd4d',ink:'#315a36',accent:'#e8812b',symbol:'sun'},
 curry:{name:'HINODE',jp:'日の出',line:'カレールウ',paper:'#e7af32',ink:'#7e3024',accent:'#b73c24',symbol:'sun'},
 soy:{name:'KAMEJIRUSHI',jp:'亀じるし',line:'しょうゆ',paper:'#efe2c7',ink:'#722b24',accent:'#ac352b',symbol:'flower'},
 soup:{name:'MISATO',jp:'みさと',line:'みそ汁',paper:'#f1dfbd',ink:'#8e3529',accent:'#b15231',symbol:'sun'},
 peaches:{name:'MOMOSATO',jp:'桃さと',line:'白桃シロップ漬け',paper:'#f5e4c9',ink:'#a95151',accent:'#cd8b7c',symbol:'leaf'},
 tuna:{name:'SHIOHAMA',jp:'潮はま',line:'まぐろフレーク',paper:'#dce4d7',ink:'#265c6b',accent:'#679999',symbol:'gull'},
 detergent:{name:'SUZUKAZE',jp:'すずかぜ',line:'洗たく洗剤',paper:'#eef0df',ink:'#284e81',accent:'#dd7b33',symbol:'wave'},
 tissues:{name:'KOMACHI',jp:'こまち',line:'フェイシャルティッシュ',paper:'#dce5d2',ink:'#c25a58',accent:'#99b6a0',symbol:'flower'},
 toothpaste:{name:'HAKUSEN',jp:'白せん',line:'薬用ハミガキ',paper:'#f2efe5',ink:'#20518a',accent:'#be4038',symbol:'star'},
 orange:{name:'MIKANBI',jp:'みかん日',line:'みかんジュース',paper:'#f1a134',ink:'#28502e',accent:'#db7324',symbol:'sun'},
 soda:{name:'AOZORA',jp:'あおぞら',line:'ラムネ',paper:'#d9eced',ink:'#25557e',accent:'#69aed0',symbol:'wave'},
 yogurt:{name:'ASAMORI',jp:'あさもり',line:'プレーンヨーグルト',paper:'#eef0df',ink:'#32638b',accent:'#81aa7d',symbol:'sun'},
 bread:{name:'KOMUGI',jp:'こむぎ',line:'ミルク食パン',paper:'#f1dcae',ink:'#6f422c',accent:'#c9924c',symbol:'leaf'},
 // Printed matter for the rack under the window. None of it is stock: you read it
 // standing up, the way you do, and the shop never charges for it.
 'magazine-sea':{name:'UMIKAZE',jp:'うみかぜ',line:'月刊 海風',paper:'#d7e5ec',ink:'#20496b',accent:'#3d7fa6',symbol:'wave'},
 'magazine-night':{name:'HOSHIZORA',jp:'ほしぞら',line:'週刊 星空',paper:'#2b3a5c',ink:'#f2e2b0',accent:'#c58a3a',symbol:'star'},
 'magazine-rod':{name:'KATSUO',jp:'かつお',line:'釣りと海',paper:'#f0e3c4',ink:'#2f5c45',accent:'#b5622f',symbol:'gull'},
 newspaper:{name:'MINATO',jp:'みなと新聞',line:'夕刊',paper:'#e8e4d6',ink:'#3a3530',accent:'#8d3f31',symbol:'wave'},
});

export const BRAND_ATLAS_KEYS=Object.freeze(['tea','coffee','rice','biscuit','soap','notebook','postcard','battery','cola','water','beer','noodles','milk','stock','buns','shop','chips','crackers','chocolate','candy','curry','soy','soup','peaches','tuna','detergent','tissues','toothpaste','orange','soda','yogurt','bread','magazine-sea','magazine-night','magazine-rod','newspaper']);
