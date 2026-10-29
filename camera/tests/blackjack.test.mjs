import assert from 'node:assert/strict';
import {blackjackScore,isBlackjack,createBlackjack} from '../blackjack.js';
const c=(rank,suit='hearts')=>({rank,suit});
assert.deepEqual(blackjackScore([c(1),c(1),c(9)]),{total:21,soft:true});
assert.deepEqual(blackjackScore([c(1),c(1),c(9),c(13)]),{total:21,soft:false});
assert.equal(isBlackjack([c(1),c(11)]),true);
assert.equal(isBlackjack([c(1),c(5),c(5)]),false);
class Element {
 constructor(tag){this.tag=tag;this.children=[];this.events={};this.attrs={};}
 append(...els){this.children.push(...els);}
 replaceChildren(...els){this.children=els;}
 setAttribute(k,v){this.attrs[k]=v;}
 addEventListener(k,fn){this.events[k]=fn;}
}
globalThis.document={createElement:tag=>new Element(tag)};
const getButtons=e=>[...(e.tag==='button'?[e]:[]),...e.children.flatMap(getButtons)];
const play=(root,label)=>{const button=getButtons(root).find(b=>b.textContent===label);assert.ok(button,`No ${label} button`);button.events.click();};
// Provide draw order with first item drawn first (underlying deck is popped).
const shuffled=(...draws)=>()=>[...Array.from({length:52-draws.length},()=>c(2)),...draws.reverse().map(x=>c(x))];
const view=(card,down)=>Object.assign(new Element('card'),{card,down});
let root=new Element('main');let game=createBlackjack({root,cardView:view,shuffleDeck:shuffled(1,9,13,7)});game.start();assert.equal(game.state.message,'Blackjack — you win!');assert.equal(game.state.phase,'done');
root=new Element('main');game=createBlackjack({root,cardView:view,shuffleDeck:shuffled(10,1,7,6,5)});game.start();play(root,'Stand');assert.equal(game.state.dealer.length,2,'dealer stands on soft 17');assert.equal(game.state.message,'A draw!');
root=new Element('main');game=createBlackjack({root,cardView:view,shuffleDeck:shuffled(10,9,6,7,8)});game.start();play(root,'Hit');assert.equal(game.state.message,'Bust — the dealer wins.');assert.equal(game.state.dealer.length,2,'dealer does not draw after player busts');play(root,'Deal again');assert.equal(game.state.phase,'playing');game.destroy();assert.equal(root.children.length,0);
root=new Element('main');game=createBlackjack({root,cardView:view,shuffleDeck:shuffled(10,9,9,6,8)});game.start();play(root,'Stand');assert.equal(game.state.message,'Dealer busts — you win!');
console.log('Blackjack score and play checks passed');
