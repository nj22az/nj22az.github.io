import {createResultShare} from './social-share.js?v=20261029a';
/** Klondike, draw one: tap a card or ordered run, then its destination.
 * Cards use rank 1–13 and suits 'hearts', 'diamonds', 'clubs', 'spades'.
 * Rendering is supplied by Pocket Camera's shared deck through cardView(card, faceDown).
 */
const isRed=c=>c.suit==='hearts'||c.suit==='diamonds';
export const canStack=(card,top)=>!top?card.rank===13:isRed(card)!==isRed(top)&&card.rank===top.rank-1;
export const canFound=(card,top)=>!top?card.rank===1:card.suit===top.suit&&card.rank===top.rank+1;
export function dealKlondike(cards){
 if(cards.length!==52)throw new Error('Solitaire requires 52 cards');
 const deck=cards.map(c=>({...c,faceUp:false}));
 const tableau=Array.from({length:7},()=>[]);
 for(let col=0;col<7;col++)for(let row=0;row<=col;row++){
  const card=deck.pop();card.faceUp=row===col;tableau[col].push(card);
 }
 return {stock:deck,waste:[],tableau,foundation:Array.from({length:4},()=>[]),moves:0};
}
/** Draw one or recycle the waste in its original order. Returns whether anything changed. */
export function drawStock(g){
 if(g.stock.length){const c=g.stock.pop();c.faceUp=true;g.waste.push(c);g.moves++;return true;}
 if(g.waste.length){while(g.waste.length){const c=g.waste.pop();c.faceUp=false;g.stock.push(c);}g.moves++;return true;}
 return false;
}
function sourceCards(g,src){
 if(src.kind==='waste')return g.waste.length?[g.waste[g.waste.length-1]]:[];
 if(src.kind==='foundation')return g.foundation[src.index]?.slice(-1)||[];
 if(src.kind==='tableau'){
  const p=g.tableau[src.index];if(!p||src.cardIndex<0||src.cardIndex>=p.length||!p[src.cardIndex].faceUp)return [];
  const run=p.slice(src.cardIndex);for(let i=1;i<run.length;i++)if(!run[i].faceUp||!canStack(run[i],run[i-1]))return [];
  return run;
 }
 return [];
}
/** Move an exposed card or ordered run; illegal moves leave the state untouched. */
export function moveKlondike(g,src,dst){
 if(!src||!dst||src.kind===dst.kind&&src.index===dst.index)return false;
 const cards=sourceCards(g,src);if(!cards.length)return false;
 let target;
 if(dst.kind==='foundation'){
  target=g.foundation[dst.index];if(!target||cards.length!==1||!canFound(cards[0],target.at(-1)))return false;
 }else if(dst.kind==='tableau'){
  target=g.tableau[dst.index];if(!target||!canStack(cards[0],target.at(-1)))return false;
 }else return false;
 if(src.kind==='waste')g.waste.pop();
 else if(src.kind==='foundation')g.foundation[src.index].pop();
 else {const p=g.tableau[src.index];p.splice(src.cardIndex);if(p.length)p[p.length-1].faceUp=true;}
 target.push(...cards);g.moves++;return true;
}
export const isKlondikeWon=g=>g.foundation.every(p=>p.length===13);
const rankName=n=>({1:'Ace',11:'Jack',12:'Queen',13:'King'}[n]||String(n));
const cardName=c=>`${rankName(c.rank)} of ${c.suit}`;

/** Mount inside a screen. call start() each time it is opened; destroy() clears it. */
export function createSolitaire({root,cardView,shuffleDeck}){
 let game,selected=null,message='Tap a card, then its destination.';
 function text(tag,cls,value){const el=document.createElement(tag);el.className=cls;el.textContent=value;return el;}
 function button(cls,label,action){const b=document.createElement('button');b.type='button';b.className=cls;b.setAttribute('aria-label',label);b.addEventListener('click',action);return b;}
 function art(card,back=false){const el=cardView(card,back);if(el instanceof Node)return el;const fallback=document.createElement('span');fallback.textContent=back?'◆':cardName(card);return fallback;}
 function choose(src){
  const same=selected&&selected.kind===src.kind&&selected.index===src.index&&selected.cardIndex===src.cardIndex;
  selected=same?null:src;message=selected?`${cardName(sourceCards(game,src)[0])} selected. Choose a destination.`:'Selection cleared.';render();
 }
 function destination(dst,fallback){
  if(selected&&moveKlondike(game,selected,dst)){
   selected=null;message=isKlondikeWon(game)?'All suits complete. You won!':'Card moved.';render();return;
  }
  if(fallback){choose(fallback);return;}
  if(selected){message='That card cannot be placed there.';render();}
 }
 function render(){
  const priorScroll=root.querySelector('.sol-scroll');
  const scroll=priorScroll?.scrollTop||0,scrollLeft=priorScroll?.scrollLeft||0;
  const active=root.contains(document.activeElement)?document.activeElement?.dataset.focusKey:null;
  root.replaceChildren();root.classList.add('solitaire-game');
  const toolbar=text('div','sol-toolbar','');
  const instructions=text('p','sol-instructions','Build down in alternating colours; move each suit from Ace to King.');
  const reset=button('sol-reset','Start a new Solitaire game',start);reset.textContent='New game';toolbar.append(instructions,reset);
  const region=document.createElement('div');region.className='sol-scroll';region.setAttribute('aria-label','Solitaire board');
  const board=document.createElement('div');board.className='sol-board';
  const top=document.createElement('div');top.className='sol-top';
  const stock=button('sol-card-button sol-stock',game.stock.length?`Draw a card from stock, ${game.stock.length} remaining`:'Turn over the waste to reuse the stock',()=>{selected=null;if(drawStock(game))message=game.stock.length?'Drew a card.':'Stock is empty.';else message='No cards left to draw.';render();});
  stock.dataset.focusKey='stock';
  if(game.stock.length)stock.append(art(game.stock.at(-1),true));else stock.append(text('span','sol-placeholder','↻'));
  const waste=button('sol-card-button sol-waste',game.waste.length?`${cardName(game.waste.at(-1))}, waste`:'Empty waste',()=>{if(game.waste.length)choose({kind:'waste'});});
  waste.dataset.focusKey='waste';
  if(game.waste.length)waste.append(art(game.waste.at(-1)));else waste.append(text('span','sol-placeholder','Waste'));
  if(selected?.kind==='waste')waste.classList.add('is-selected');top.append(stock,waste);
  const gap=document.createElement('div');gap.className='sol-top-gap';top.append(gap);
  for(let i=0;i<4;i++){
   const pile=game.foundation[i],card=pile.at(-1);
   const b=button('sol-card-button sol-foundation',card?`${cardName(card)}, foundation ${i+1}`:`Empty foundation ${i+1}`,()=>destination({kind:'foundation',index:i},card?{kind:'foundation',index:i}:null));
   b.dataset.focusKey=`foundation-${i}`;
   if(card)b.append(art(card));else b.append(text('span','sol-placeholder','A'));
   if(selected?.kind==='foundation'&&selected.index===i)b.classList.add('is-selected');top.append(b);
  }
  board.append(top);
  const cols=document.createElement('div');cols.className='sol-columns';
  for(let i=0;i<7;i++){
   const col=document.createElement('div');col.className='sol-column';const pile=game.tableau[i];
   if(!pile.length){const slot=button('sol-card-button sol-empty',`Empty column ${i+1}`,()=>destination({kind:'tableau',index:i}));slot.dataset.focusKey=`column-${i}`;slot.append(text('span','sol-placeholder','K'));col.append(slot);}
   pile.forEach((card,j)=>{
    const src={kind:'tableau',index:i,cardIndex:j};
    const b=button('sol-card-button sol-tableau-card',card.faceUp?`${cardName(card)}, column ${i+1}`:`Face-down card, column ${i+1}`,()=>destination({kind:'tableau',index:i},card.faceUp?src:null));
    b.dataset.focusKey=`column-${i}-${j}`;b.disabled=!card.faceUp;b.append(art(card,!card.faceUp));
    if(selected?.kind==='tableau'&&selected.index===i&&selected.cardIndex===j)b.classList.add('is-selected');col.append(b);
   });cols.append(col);
  }
  board.append(cols);region.append(board);
  const status=text('p','sol-status',`${message} ${game.moves} ${game.moves===1?'move':'moves'}.`);status.setAttribute('role','status');status.setAttribute('aria-live','polite');
  root.append(toolbar,region,status);
  if(isKlondikeWon(game))root.append(createResultShare({game:'Solitaire',headline:'All suits complete!',detail:`${game.moves} moves`}));
  region.scrollTop=scroll;region.scrollLeft=scrollLeft;
  if(active){const next=[...root.querySelectorAll('[data-focus-key]')].find(el=>el.dataset.focusKey===active&&!el.disabled);next?.focus({preventScroll:true});}
 }
 function start(){game=dealKlondike(shuffleDeck());selected=null;message='Tap a card, then its destination.';render();}
 function destroy(){game=null;selected=null;root.replaceChildren();root.classList.remove('solitaire-game');}
 return {start,destroy};
}
