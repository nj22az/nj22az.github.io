import {createResultShare} from './social-share.js?v=20261029a';
/**
 * Pocket Camera Blackjack — a friendly, no-stakes game with one 52-card deck.
 * Dealer stands on all 17s, including soft 17. No betting, splitting or insurance.
 *
 * createBlackjack({root, cardView, shuffleDeck})
 *   root: an empty element inside the game screen.
 *   shuffleDeck(): a fresh shuffled deck, array of {rank:1..13 (ace=1, jack=11, queen=12, king=13), suit:string}.
 *   cardView(card, faceDown): returns a DOM element showing the card or its back.
 *   Returns {start(), destroy(), state}; start() deals a fresh hand, destroy() clears the root.
 */
export function blackjackScore(hand){
 let total=0,aces=0;
 for(const card of hand){
  const rank=Number(card.rank);
  if(rank===1){total+=11;aces++;}
  else total+=Math.min(rank,10);
 }
 while(total>21&&aces){total-=10;aces--;}
 return {total,soft:aces>0};
}
export function isBlackjack(hand){return hand.length===2&&blackjackScore(hand).total===21;}

export function createBlackjack({root,cardView,shuffleDeck}){
 if(!root||typeof cardView!=='function'||typeof shuffleDeck!=='function')throw new TypeError('Blackjack requires a root, cardView and shuffleDeck');
 let game=null;
 const el=(tag,className,text)=>{const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;};
 function draw(){
  const card=game.deck.pop();
  if(!card)throw new Error('Blackjack deck ran out of cards');
  return card;
 }
 function settle(){
  const player=blackjackScore(game.player).total;
  if(player>21){game.phase='done';game.message='Bust — the dealer wins.';return;}
  while(blackjackScore(game.dealer).total<17)game.dealer.push(draw());
  const dealer=blackjackScore(game.dealer).total;
  game.phase='done';
  game.message=dealer>21?'Dealer busts — you win!':player>dealer?'You win!':player<dealer?'The dealer wins.':'A draw!';
 }
 function hit(){
  if(game?.phase!=='playing')return;
  game.player.push(draw());
  if(blackjackScore(game.player).total>=21)settle();
  render();
 }
 function stand(){if(game?.phase!=='playing')return;settle();render();}
 function start(){
  const deck=shuffleDeck();
  if(!Array.isArray(deck)||deck.length<52)throw new Error('Blackjack needs a shuffled 52-card deck');
  game={deck:[...deck],player:[],dealer:[],phase:'playing',message:'Hit for another card, or stand.'};
  // Deal alternately; last element is the top of the deck.
  game.player.push(draw());game.dealer.push(draw());game.player.push(draw());game.dealer.push(draw());
  const p=isBlackjack(game.player),d=isBlackjack(game.dealer);
  if(p||d){game.phase='done';game.message=p&&d?'Both have Blackjack — a draw!':p?'Blackjack — you win!':'Dealer has Blackjack.';}
  render();
 }
 function hand(label,cards,hideHole){
  const group=el('section','blackjack-hand');
  const heading=el('h3','blackjack-hand-title',label);
  const score=hideHole?blackjackScore([cards[0]]).total:blackjackScore(cards).total;
  const value=el('span','blackjack-score',hideHole?`${score} + ?`:String(score));heading.append(value);
  const row=el('div','blackjack-cards');row.setAttribute('aria-label',`${label} cards`);
  cards.forEach((card,i)=>row.append(cardView(card,hideHole&&i===1)));
  group.append(heading,row);return group;
 }
 function button(label,action,className=''){
  const b=el('button',`button ${className}`.trim(),label);b.type='button';b.addEventListener('click',action);return b;
 }
 function render(){
  if(!game)return;
  const layout=el('div','blackjack-layout');
  const hint=el('p','blackjack-rules','Get closer to 21 than the dealer. Aces count as 1 or 11; the dealer stands on 17.');
  const table=el('div','blackjack-table');
  table.append(hand('Dealer',game.dealer,game.phase==='playing'),hand('Your hand',game.player,false));
  const status=el('p','blackjack-message',game.message);status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  const actions=el('div','blackjack-actions');
  if(game.phase==='playing')actions.append(button('Hit',hit,'primary'),button('Stand',stand));
  else actions.append(button('Deal again',start,'primary'));
  layout.append(hint,table,status,actions);
  if(game.phase==='done'){layout.className+=' result-ready';layout.append(createResultShare({game:'Blackjack',headline:game.message,detail:`Your hand ${blackjackScore(game.player).total} · Dealer ${blackjackScore(game.dealer).total}`}));}
  root.replaceChildren(layout);
 }
 function destroy(){game=null;root.replaceChildren();}
 return {start,destroy,get state(){return game;}};
}
