/** The original Johansson World deck: numeric ranks and four familiar suits. */
export const SUITS=Object.freeze(['hearts','diamonds','clubs','spades']);
export function shuffleDeck(random=Math.random){
 const cards=SUITS.flatMap(suit=>Array.from({length:13},(_,i)=>({rank:i+1,suit})));
 for(let i=cards.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]];}
 return cards;
}
const faceUrl=new URL('./cards/playing-cards.png',import.meta.url).href;
const backUrl=new URL('./cards/playing-card-back.png',import.meta.url).href;
export function cardView(card,faceDown=false){
 const span=document.createElement('span');span.className='playing-card';
 if(faceDown){span.style.backgroundImage=`url("${backUrl}")`;span.style.backgroundSize='100% 100%';span.setAttribute('aria-label','Face-down card');}
 else{
  const suit=SUITS.indexOf(card.suit),rank=Number(card.rank);
  if(suit<0||rank<1||rank>13||!Number.isInteger(rank))throw new RangeError('Invalid playing card');
  span.style.backgroundImage=`url("${faceUrl}")`;span.style.backgroundSize='1300% 400%';span.style.backgroundPosition=`${(rank-1)/12*100}% ${suit/3*100}%`;
  const name=({1:'Ace',11:'Jack',12:'Queen',13:'King'})[rank]||rank;span.setAttribute('aria-label',`${name} of ${card.suit}`);
 }
 return span;
}
