/**
 * Which issue of each magazine is on the rack at Sakura on a given town date.
 *
 * Weeklies change on their own on-sale weekday, monthlies on the 1st (and, as Japanese
 * monthlies do, carry next month's date on the cover), the papers every morning. The
 * issue is worked out from the date alone, so every visit on the same day shows the
 * same covers and the rack turns over by itself as the calendar moves on.
 *
 * Plain data and arithmetic: no DOM, no three.js. Drawing is in magazine-art.js.
 */

/** The titles, original to the town. `onSale` is the weekday a weekly changes (0 = Sunday). */
export const MAGAZINE_TITLES=Object.freeze([
 {id:'hayabusa',name:'週刊少年ハヤブサ',en:'Weekly Shōnen Hayabusa',kind:'shonen',cadence:'weekly',onSale:1,price:200,thick:.024,
  heads:['風雲児 最終決戦へ!','新連載 南海の剣士','風雲児 覚醒の刻','読切 島の少年野球'],
  subs:['巻頭カラー40P!!','センターカラー2本立て','全プレ テレカ応募券','人気投票 中間発表']},
 {id:'playwave',name:'PLAY★WAVE',en:'Play★Wave games weekly',kind:'games',cadence:'weekly',onSale:5,price:380,thick:.01,
  heads:['32ビット機 頂上決戦!!','RPG新作 発売日決定','隠しコマンド大全','秋の新作 30本 遊んだ'],
  subs:['袋とじ 裏技マップ','読者投稿 ハイスコア','開発者インタビュー','新作カレンダー']},
 {id:'shimaaruki',name:'島あるき',en:'Shima Aruki — Okinawa guide',kind:'guide',cadence:'monthly',price:350,thick:.012,
  heads:['国際通り 徹底ガイド','秋の離島めぐり','やんばる森あるき','那覇グルメ 冬じたく'],
  subs:['旧盆エイサーMAP','船の時刻表つき','おみやげ100選','路線バス 乗りこなし']},
 {id:'galisland',name:'GAL ISLAND',en:'Gal Island fashion',kind:'fashion',cadence:'monthly',price:420,thick:.008,
  heads:['ルーズソックス宣言!!','厚底サンダル100連発','プリクラ手帳 公開!','秋の茶髪カタログ'],
  subs:['読者モデル大集合','ポケベル暗号 最新版','日焼け止め 夏の陣','着回し30日']},
 {id:'kakuto',name:'週刊格闘ファイト',en:'Weekly Kakutō Fight',kind:'sport',cadence:'weekly',onSale:3,price:360,thick:.008,
  heads:['沖縄大会 激闘!','王者陥落 衝撃の夜','タッグ王座 新時代','覆面の正体 ついに'],
  subs:['時間無制限 一本勝負','巡業日程 完全版','若手 7人の挑戦','カラー写真 32P']},
 {id:'celanime',name:'月刊セルアニメ',en:'Monthly Cel Anime',kind:'anime',cadence:'monthly',price:580,thick:.012,
  heads:['巨大ロボ 大特集','秋の新番組 総まくり','セル画の現場 潜入','声のお仕事 特集'],
  subs:['付録: B2両面ポスター','設定資料 初公開','監督インタビュー','読者イラスト']},
 {id:'tvshima',name:'週刊テレビしま',en:'Weekly TV Shima',kind:'tv',cadence:'weekly',onSale:2,price:150,thick:.006,
  heads:['秋の新ドラマ 総まくり','月9 最終回直前!','プロ野球 中継一覧','特番 先取りガイド'],
  subs:['番組表 7日間','星占い 12星座','クロスワード','視聴者プレゼント']},
 {id:'umikaze',name:'月刊 海風',en:'Monthly Umikaze',kind:'umikaze',cadence:'monthly',price:450,thick:.008,
  heads:['港の夏、灯台めぐり','台風の夜の港','秋の漁港めし','冬の渡し船'],
  subs:['船旅エッセイ','潮の香りの手紙','港町スケッチ','読者の写真館']},
 {id:'hoshizora',name:'週刊 星空',en:'Weekly Hoshizora',kind:'hoshizora',cadence:'weekly',onSale:4,price:280,thick:.008,
  heads:['秋の星座 早見表つき','月の裏側 大特集','流れ星の夜','天の川 撮影入門'],
  subs:['今週の星占い','望遠鏡 選び方','宇宙ニュース','読者の星空写真']},
 {id:'katsuo',name:'釣りと海',en:'Tsuri to Umi — angling',kind:'katsuo',cadence:'monthly',price:450,thick:.01,
  heads:['カツオ一本釣り 同行記','磯釣り はじめの一歩','秋のアオリイカ','冬のタマン狙い'],
  subs:['潮見表つき','仕掛け図解','釣り場MAP','釣果自慢']},
 {id:'minato',name:'みなと新聞',en:'Minato Shimbun (evening)',kind:'paper',cadence:'daily',price:80,paper:true,colour:'#8d3f31',edition:'夕刊',
  heads:['台風 北上の見込み','港に新造船 到着','商店街 秋祭り準備','フェリー増便 決まる','防波堤 補修工事へ','漁協 初セリ活況','バス新路線 試運転'],
  subs:['週明け 船便に影響か','島の大工が手がける','提灯 200個','月末から 1日4便','来春までに完了','カツオ 高値続く','港前から空港へ']},
 {id:'shimaspo',name:'島スポ',en:'Shima Sports',kind:'paper',cadence:'daily',price:110,paper:true,colour:'#1b5fb4',edition:'スポーツ',
  heads:['沖縄水産 劇的勝利!','秋季大会 4強出揃う','空手 世界大会へ','新王者 誕生!','マラソン 大会新記録','ハーリー 優勝は港組'],
  subs:['延長12回 サヨナラ','準決勝は日曜','県勢 3人代表','判定 2-1の激闘','2時間14分','最後の100メートル']},
 {id:'nippo',name:'沖縄日報',en:'Okinawa Nippō (morning)',kind:'paper',cadence:'daily',price:100,paper:true,colour:'#2b2b2b',edition:'朝刊',
  heads:['旧盆 帰省ラッシュ','サトウキビ 収穫期へ','那覇空港 新ターミナル案','離島航路 運賃見直し','台風に備え 点検進む','県産マンゴー 出荷始まる'],
  subs:['那覇空港 混雑ピーク','製糖工場 稼働','2000年代へ構想','住民説明会 来週','電柱・看板 総点検','過去最高の見込み']},
]);
export const MANGA_CHAPTERS=4,MANGA_PAGES=4,ANIME_POSTERS=4;

const DAY=86400000;
const dayNumber=date=>Math.floor(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate())/DAY);
const WEEKDAYS='日月火水木金土';
const fmt=date=>`${date.getMonth()+1}月${date.getDate()}日`;

/** The issue of `title` on sale on `date`: its number, cover date, headline and so on. */
export function issueFor(title,date){
 const year=date.getFullYear(),heisei=year-1988;
 if(title.cadence==='daily'){
  // Shifted one each time round, so the same weekday a week later has different news.
  const n=dayNumber(date),len=title.heads.length,i=(((n+Math.floor(n/len))%len)+len)%len;
  return {key:title.id+':'+n,number:n-dayNumber(new Date(year,0,1))+1,
   dateLine:`平成${heisei}年${date.getMonth()+1}月${date.getDate()}日(${WEEKDAYS[date.getDay()]})`,head:title.heads[i],sub:title.subs[i],variant:i,saleDate:date};
 }
 if(title.cadence==='monthly'){
  // Monthlies are dated a month ahead: what goes on sale in September says 10月号.
  const cover=new Date(year,date.getMonth()+1,1),m=year*12+date.getMonth(),i=m%title.heads.length;
  return {key:title.id+':'+m,number:cover.getMonth()+1,dateLine:`${cover.getMonth()+1}月号`,head:title.heads[i],sub:title.subs[i],variant:i,
   saleDate:new Date(year,date.getMonth(),1)};
 }
 // A weekly: the issue that went on sale on the most recent on-sale weekday.
 const back=(date.getDay()-title.onSale+7)%7,sale=new Date(year,date.getMonth(),date.getDate()-back);
 const week=Math.floor((dayNumber(sale)+4)/7),i=((week%title.heads.length)+title.heads.length)%title.heads.length;
 const first=new Date(sale.getFullYear(),0,1),number=Math.floor((dayNumber(sale)-dayNumber(first))/7)+1;
 return {key:title.id+':'+week,number,dateLine:`${sale.getFullYear()}年 ${number}号`,head:title.heads[i],sub:title.subs[i],variant:i,saleDate:sale,
  until:fmt(new Date(sale.getFullYear(),sale.getMonth(),sale.getDate()+6)),chapter:i%MANGA_CHAPTERS};
}

/** Every title's current issue, plus one key that changes whenever any cover would. */
export function rackIssues(date){
 const issues=MAGAZINE_TITLES.map(title=>({title,issue:issueFor(title,date)}));
 return {issues,key:issues.map(({issue})=>issue.key).join('|')};
}
export {fmt as shortDate,WEEKDAYS};
