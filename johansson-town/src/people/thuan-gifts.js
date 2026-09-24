/**
 * Giving Thuan something from your bag, and how she takes it.
 *
 * Anything you carry can be given except the rubbish you tidy up around town (that goes
 * back through her till) and the waterlogged book page (it is Yoshiko's to dry). She is
 * delighted the first time in a day; a second present the same day makes her shy.
 */
import {TOWN_FINDS} from '../commerce/sakura-economy.js';
import {GROCERY_ITEMS} from '../commerce/catalogue.js';
import {WORKSHOP_MODELS} from '../workshop/catalogue.js';

const RUBBISH=new Set(TOWN_FINDS.map(item=>item.name));

/** The things in the bag she could be given, each once, in the order they were picked up. */
export function giftableItems(inventory=[]){
 return [...new Set(inventory.filter(name=>typeof name==='string'&&!RUBBISH.has(name)&&!/^Waterlogged page/.test(name)))];
}

/** Takes one of `item` out of the bag. False when it is not there. */
export function takeGift(inventory,item){
 const index=inventory.indexOf(item);
 if(index<0)return false;
 inventory.splice(index,1);
 return true;
}

/**
 * Her reply to a present.
 * @param {string} item
 * @param {{giftsToday?:number}} [context] presents already given today, before this one
 * @returns {{text:string,mood:'happy'|'shy'}}
 */
export function giftReaction(item,{giftsToday=0}={}){
 if(giftsToday>=1)return {mood:'shy',text:'また？ もう…\nAnother one? You are spoiling me. The assistant manager is going to think I have a favourite customer.'};
 if(WORKSHOP_MODELS.some(model=>model.name===item))
  return {mood:'happy',text:'わあ、すごい！\nYou printed this? It is going on the shelf by the till, where everyone can see it. The assistant manager will be jealous.'};
 if(item==='Zenzai')
  return {mood:'happy',text:'ぜんざい！ 溶ける前に！\nZenzai from Nakamura’s! Quick, before it melts — no, you have a spoon too. We share. That is the rule with zenzai.'};
 if(item==='Sata andagi')
  return {mood:'happy',text:'サーターアンダギー！\nStill warm! Arakaki-san’s are the best on the island. My grandmother said they smile when they are done properly. Look — this one is smiling.'};
 if(item==='Awamori miniature')
  return {mood:'shy',text:'泡盛？ もう…\nAwamori? Are you trying to get the shopkeeper drunk? I will keep it for after closing. Maybe we open it together.'};
 if(item==='Sea bream')
  return {mood:'happy',text:'鯛！ 立派！\nA whole sea bream! Supper is solved. I will tell Nao I caught it myself. She will not believe me.'};
 if(item==='Coffee milk')
  return {mood:'happy',text:'コーヒー牛乳！\nCoffee milk! That is the best part of the bath. How did you know?'};
 if(item==='Ice')
  return {mood:'happy',text:'氷？ ふふっ。\nIce? For the hottest shop assistant in the harbour, I suppose. It is going straight in the cooler.'};
 if(GROCERY_ITEMS.some(spec=>spec.name===item))
  return {mood:'happy',text:'私の棚から？ ありがとう！\nFrom my own shelves? Then I know it is good. I will have it on my break and think of you.'};
 return {mood:'happy',text:'私に？ ありがとう！\nFor me? Thank you! Nobody brings the shopkeeper presents. I will keep it behind the counter.'};
}
