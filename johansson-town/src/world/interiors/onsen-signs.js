/**
 * Umi-no-yu's printed Japanese: every sign, curtain and caption that is part of the
 * scenery, with what it says in English, where it hangs and why it reads the way it does.
 *
 * The words live here, in one place, so a reader of Japanese can check them at a glance
 * (and the tests can), and so the game, the storyteller and the film letter them the same
 * way. This file is scenery for scripts/english-inventory.mjs: the controls and the
 * narration stay English, the bathhouse speaks Japanese, as a 1990s Okinawan bath would.
 *
 * Period: everything here could have been painted, printed or broadcast between 1985 and
 * 1999. Nothing is a real company's name or mark.
 */
const plain=o=>Object.freeze(o);

export const ONSEN_SIGNS=Object.freeze({
 kanban:plain({jp:'海の湯',mark:'♨',sub:'UMI-NO-YU · HOT SPRING',en:'Umi-no-yu, "the sea bath"',
  where:'The name board over the street door (park-onsen.js, "Umi-no-yu sign").',
  why:'A bathhouse names itself in brushed kanji on a dark board; the romaji line under it is for the visitors off the ferry.'}),
 notice:plain({jp:'海の湯',en:'Umi-no-yu',
  where:'The heading of the notice board by the path ("Umi-no-yu notice"); the hours and prices under it are in English for the ferry visitors.',
  why:'The same name as the board over the door, so you know the notice belongs to this bath.'}),
 noren:plain({jp:'ゆ',mark:'♨',en:'"Hot water": what every bathhouse curtain says',
  where:'The indigo noren over the street door and the one between the lobby and the changing room.',
  why:'ゆ in big hiragana is the sign of a public bath all over Japan; when the noren is hung out, the bath is open.'}),
 doorGlass:plain({jp:'ゆ',en:'"Hot water", left clear in the frosted lower glass of the street doors',
  where:'The lower pane of each of the two wooden sliding doors at the street: inside (onsen-front.js) and on the model outside (park-onsen.js).',
  why:'A bathhouse door of the eighties and nineties had its lower glass frosted, so nobody on the street sees into the genkan, with ゆ left clear in it to read from the street. From the genkan it reads backwards, as it does in every bathhouse.'}),
 lostProperty:plain({jp:'忘れ物',en:'Lost property',
  where:'A paper tag on a string round the crook of the umbrella in the stand by the street door.',
  why:'Higa-san tags whatever is left behind and keeps it where its owner will walk past it.'}),
 fee:plain({lines:Object.freeze(['大人 ¥300','タオル ¥100・牛乳 ¥100']),en:'Adults ¥300 · towel ¥100, milk ¥100',
  where:'On the front of the bandai counter, below the top and facing the genkan ("Fee sign"), where it never stands between Mrs Higa and the people she is talking to.',
  why:'The three things the bandai sells, readable from the shoe lockers while you count your coins.'}),
 milk:plain({jp:'牛乳',price:'各 ¥100',en:'Milk, ¥100 each',
  where:'The header over the red cooler’s glass, in the lobby’s east corner.',
  why:'Bath coolers said 牛乳 over the white, coffee and fruit milk alike; one price for all three, so the coins are easy.'}),
 bathBoard:plain({jp:'本日の湯',en:'Today’s bath',
  where:'The wooden board on the lobby side of the changing-room wall.',
  why:'The day’s additive in the indoor bath, written top to bottom, changed every morning.'}),
 /** The day's bath in Japanese, by weekday (0 = Sunday), as written on the board. */
 dailyBath:Object.freeze(['月桃湯','ゆず湯','よもぎ湯','ヒノキ湯','塩湯','しょうが湯','シークヮーサー湯']),
 poster:plain({title:'南の島 湯めぐり',line:'港の湯・海の湯・森の湯',en:'Southern-island bath tour: Minato-no-yu, Umi-no-yu, Mori-no-yu',
  where:'The travel poster on the lobby side of the changing-room wall.',
  why:'The ferry line’s 1997 poster for the island’s three baths.'}),
 tv:plain({
  nightGame:plain({inning:'7回裏',away:'鹿',home:'沖',score:Object.freeze({away:2,home:3}),count:Object.freeze({balls:2,strikes:1,outs:1}),en:'Bottom of the seventh, Okinawa 3, Kagoshima 2',
   why:'A 1990s baseball broadcast keeps a small score box in the corner: the two teams by one kanji each, the inning, and the ball, strike and out lamps.'}),
  weather:plain({title:'沖縄地方 あすの天気',forecast:'晴れ 31℃',en:'Okinawa region, tomorrow’s weather: sunny, 31 °C',
   why:'The evening forecast card, the way the regional news drew it.'}),
 }),
});
