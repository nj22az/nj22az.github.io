/**
 * Memory, the camera's game (the owner, 29 October 2026: "Can you add the mini games … I want memory with our own
 * photos or with the stickers"), as the hand-held cameras had games inside them. Pairs of cards face down; turn two,
 * keep them if they match. The cards are the photographer's own photos from the album, or one of the residents' sticker
 * sheets (Thuan, Johansson, Thao and the cartoon Thuan, Thuan & Nils), or their own die-cut stickers. The board is laid out to give the cards the most
 * room the screen has; moves and time are counted, and the best game for each set of cards and size is kept.
 */
export const PAIRS=Object.freeze([6,8,10,12]);
const CARD_ASPECT=.8,GAP=8,MISS_MS=800;
const shuffled=list=>{const a=[...list];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const clock=ms=>{const s=Math.floor(ms/1000);return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;};

/**
 * The columns and rows that give `n` cards (width/height `aspect`) the largest size inside width × height.
 * Exported for the tests.
 */
export function fitBoard(n,width,height,aspect=CARD_ASPECT,gap=GAP){
 let best=null;
 // Full rows only (every board here has them); a ragged last row only if nothing else fits.
 const even=[...Array(n).keys()].map(i=>i+1).filter(c=>n%c===0);
 for(const cols of even.length?even:[...Array(n).keys()].map(i=>i+1)){
  const rows=Math.ceil(n/cols);
  const w=Math.min((width-gap*(cols-1))/cols,(height-gap*(rows-1))/rows*aspect);
  if(w>0&&(!best||w>best.w+.5||(Math.abs(w-best.w)<=.5&&cols*rows<best.cols*best.rows)))best={cols,rows,w,h:w/aspect};
 }
 return best;
}

/**
 * `root` is the game's screen, holding .memory-setup, .memory-stage (with .memory-board), .memory-status and
 * .memory-win. `sources()` resolves to [{id,name,kind:'photo'|'sticker',items:[{id,url|blob,label}]}]; `cheer()` gives a
 * sticker {url,alt} for the win; `sound(kind)` plays the camera's sounds; `store` keeps the choice and the best games.
 */
export function createMemory(root,{sources,cheer=()=>null,sound=()=>{},store,onPlay=()=>{}}){
 const q=s=>root.querySelector(s);
 const setup=q('.memory-setup'),stage=q('.memory-stage'),board=q('.memory-board'),status=q('.memory-status'),win=q('.memory-win');
 let decks=[],urls=[],game=null,tick=0,missTimer=0;
 const remembered=()=>store.read().memory||{};
 let choice={source:remembered().source||'photos',pairs:PAIRS.includes(remembered().pairs)?remembered().pairs:6};
 const best=key=>store.read().memoryBest?.[key]||null;
 const urlFor=item=>{if(item.url)return item.url;const u=URL.createObjectURL(item.blob);urls.push(u);item.url=u;return u;};
 function release(){clearInterval(tick);clearTimeout(missTimer);for(const u of urls)URL.revokeObjectURL(u);urls=[];for(const d of decks)for(const i of d.items)if(i.blob)delete i.url;}

 // ---- Choosing the cards ----
 async function open(){
  release();game=null;
  decks=await sources();
  if(!decks.some(d=>d.id===choice.source&&d.items.length>=PAIRS[0]))choice.source=decks.find(d=>d.items.length>=PAIRS[0])?.id||choice.source;
  showSetup();
 }
 function showSetup(){
  game=null;clearInterval(tick);
  setup.hidden=false;stage.hidden=true;status.hidden=true;win.hidden=true;root.classList.remove('playing');
  const deck=decks.find(d=>d.id===choice.source),most=deck?deck.items.length:0;
  if(choice.pairs>most)choice.pairs=[...PAIRS].reverse().find(p=>p<=most)||PAIRS[0];
  const title=document.createElement('p');title.className='memory-lead';title.textContent='Turn two cards. Keep them if they match.';
  const label=document.createElement('h3');label.textContent='Play with';
  const decksEl=document.createElement('div');decksEl.className='memory-decks';decksEl.setAttribute('role','radiogroup');decksEl.setAttribute('aria-label','Cards');
  for(const d of decks){
   const ok=d.items.length>=PAIRS[0],b=document.createElement('button');b.type='button';b.className='memory-deck';b.setAttribute('role','radio');
   b.setAttribute('aria-checked',String(d.id===choice.source));b.disabled=!ok;b.dataset.deck=d.id;
   const fan=document.createElement('span');fan.className=`memory-fan deck-${d.kind}`;fan.setAttribute('aria-hidden','true');
   for(const item of d.items.slice(0,3)){const card=document.createElement('i');const img=document.createElement('img');img.alt='';img.decoding='async';img.src=urlFor(item);card.append(img);fan.append(card);}
   if(!d.items.length)fan.classList.add('empty');
   const name=document.createElement('span');name.className='memory-deck-name';name.textContent=d.name;
   const note=document.createElement('span');note.className='memory-deck-note';
   note.textContent=ok?`${d.items.length} ${d.kind==='photo'?(d.items.length===1?'photo':'photos'):'stickers'}`:d.kind==='photo'?`Take ${PAIRS[0]-d.items.length} more`:`Make ${PAIRS[0]-d.items.length} more`;
   b.append(fan,name,note);
   b.addEventListener('click',()=>{sound('tick');choice.source=d.id;remember();showSetup();});
   decksEl.append(b);
  }
  const pairsLabel=document.createElement('h3');pairsLabel.textContent='Pairs';
  const pairs=document.createElement('div');pairs.className='mini-seg memory-pairs';pairs.setAttribute('role','radiogroup');pairs.setAttribute('aria-label','Pairs');
  for(const p of PAIRS){
   const b=document.createElement('button');b.type='button';b.setAttribute('role','radio');b.textContent=p;b.setAttribute('aria-checked',String(p===choice.pairs));b.disabled=p>most;
   b.setAttribute('aria-label',`${p} pairs`);b.addEventListener('click',()=>{sound('tick');choice.pairs=p;remember();showSetup();});pairs.append(b);
  }
  const record=best(`${choice.source}:${choice.pairs}`);
  const bestEl=document.createElement('p');bestEl.className='memory-best';
  bestEl.textContent=record?`Best: ${record.moves} moves · ${clock(record.ms)}`:'No best game yet';
  const play=document.createElement('button');play.type='button';play.className='button primary memory-play';play.textContent='Play';play.disabled=!deck||most<PAIRS[0];
  play.addEventListener('click',()=>start());
  // The choices scroll if they must; Play and the best game stay at the foot, always in reach.
  const choose=document.createElement('div');choose.className='memory-choose';choose.append(title,label,decksEl,pairsLabel,pairs);
  const go=document.createElement('div');go.className='memory-go';go.append(bestEl,play);
  const y=setup.querySelector('.memory-choose')?.scrollTop||0;
  setup.replaceChildren(choose,go);choose.scrollTop=y;
 }
 function remember(){store.write({...store.read(),memory:{source:choice.source,pairs:choice.pairs}});}

 // ---- Playing ----
 function start(){
  const deck=decks.find(d=>d.id===choice.source);if(!deck||deck.items.length<choice.pairs)return;
  sound('tick');onPlay();
  const picked=shuffled(deck.items).slice(0,choice.pairs);
  const cards=shuffled(picked.flatMap((item,i)=>[{pair:i,item},{pair:i,item}]));
  game={deck,pairs:choice.pairs,cards:cards.map((c,i)=>({...c,index:i,up:false,matched:false})),open:[],moves:0,found:0,started:0,ms:0,over:false};
  setup.hidden=true;win.hidden=true;stage.hidden=false;status.hidden=false;root.classList.add('playing');
  board.innerHTML='';board.className=`memory-board deck-${deck.kind}`;
  for(const card of game.cards){
   const b=document.createElement('button');b.type='button';b.className='memory-card';b.dataset.index=card.index;
   b.innerHTML='<span class="memory-inner"><span class="memory-back"></span><span class="memory-face"><img alt="" decoding="async" draggable="false"></span></span>';
   b.querySelector('img').src=urlFor(card.item);
   b.addEventListener('click',()=>turn(card.index));
   card.el=b;board.append(b);
  }
  label();layout();renderStatus();
  board.querySelector('.memory-card')?.focus({preventScroll:true});
 }
 function layout(){
  if(!game||stage.hidden)return;
  const cs=getComputedStyle(stage),w=stage.clientWidth-parseFloat(cs.paddingLeft)-parseFloat(cs.paddingRight),h=stage.clientHeight-parseFloat(cs.paddingTop)-parseFloat(cs.paddingBottom);
  const fit=fitBoard(game.cards.length,w,h);if(!fit)return;
  board.style.gridTemplateColumns=`repeat(${fit.cols},${Math.floor(fit.w)}px)`;board.style.gridAutoRows=`${Math.floor(fit.h)}px`;board.style.gap=`${GAP}px`;
  board.dataset.cols=fit.cols;
 }
 new ResizeObserver(layout).observe(stage);
 function label(){
  if(!game)return;
  for(const c of game.cards)c.el.setAttribute('aria-label',c.up||c.matched?`${c.item.label}${c.matched?', matched':''}`:`Card ${c.index+1}, face down`);
 }
 function renderStatus(){
  if(!game)return;
  const record=best(`${choice.source}:${game.pairs}`);
  status.innerHTML=`<span><b>${game.moves}</b> ${game.moves===1?'move':'moves'}</span><span>${clock(game.ms)}</span><span>${game.found} of ${game.pairs}</span>${record?`<span class="memory-record">Best ${record.moves}</span>`:''}`;
 }
 function hideMiss(){clearTimeout(missTimer);missTimer=0;for(const c of game.open){c.up=false;c.el.classList.remove('up','miss');}game.open=[];label();}
 function turn(index){
  if(!game||game.over)return;
  const card=game.cards[index];if(card.matched||card.up)return;
  // A third card turns the two that did not match back at once, so the game never makes anyone wait.
  if(game.open.length===2)hideMiss();
  if(!game.started){game.started=performance.now();tick=setInterval(()=>{game.ms=performance.now()-game.started;renderStatus();},250);}
  card.up=true;card.el.classList.add('up');game.open.push(card);sound('flip');
  if(game.open.length===2){
   game.moves++;
   const [a,b]=game.open;
   if(a.pair===b.pair){
    a.matched=b.matched=true;a.el.classList.add('matched');b.el.classList.add('matched');game.open=[];game.found++;
    setTimeout(()=>sound('pop'),160);navigator.vibrate?.(10);
    status.setAttribute('aria-label',`Match: ${a.item.label}`);
    if(game.found===game.pairs)finish();
   }else{
    a.el.classList.add('miss');b.el.classList.add('miss');setTimeout(()=>sound('nope'),220);
    missTimer=setTimeout(()=>{if(game?.open.length===2)hideMiss();},MISS_MS);
   }
  }
  label();renderStatus();
 }
 function finish(){
  game.over=true;clearInterval(tick);game.ms=performance.now()-game.started;renderStatus();
  const key=`${choice.source}:${game.pairs}`,record=best(key),better=!record||game.moves<record.moves||(game.moves===record.moves&&game.ms<record.ms);
  if(better){const all=store.read().memoryBest||{};store.write({...store.read(),memoryBest:{...all,[key]:{moves:game.moves,ms:Math.round(game.ms)}}});}
  // The cards take a bow, one after the other, then the residents cheer.
  game.cards.forEach((c,i)=>c.el.animate?.([{transform:'scale(1)'},{transform:'scale(1.08)'},{transform:'scale(1)'}],{duration:360,delay:i*28,easing:'ease-out'}));
  setTimeout(()=>sound('win'),200);
  setTimeout(()=>{
   if(!game?.over)return;
   const s=cheer();
   win.innerHTML='';
   if(s){const img=document.createElement('img');img.className='memory-cheer';img.src=s.url;img.alt=s.alt||'';win.append(img);}
   const h=document.createElement('h3');h.textContent=better&&record?'New best!':`All ${game.pairs} pairs!`;
   const p=document.createElement('p');p.textContent=`${game.moves} moves · ${clock(game.ms)}${better&&record?` (was ${record.moves})`:''}`;
   const again=document.createElement('button');again.type='button';again.className='button primary';again.textContent='Play again';again.addEventListener('click',()=>start());
   const other=document.createElement('button');other.type='button';other.className='button';other.textContent='Other cards';other.addEventListener('click',()=>{sound('tick');showSetup();});
   const buttons=document.createElement('div');buttons.className='memory-win-buttons';buttons.append(again,other);
   win.append(h,p,buttons);win.hidden=false;again.focus({preventScroll:true});
  },700+game.cards.length*28);
 }
 // Arrow keys move along the board as it is laid out; Enter or Space turns the card.
 board.addEventListener('keydown',e=>{
  const cols=Number(board.dataset.cols)||1,i=Number(e.target.closest('.memory-card')?.dataset.index);if(!Number.isFinite(i))return;
  const to={ArrowRight:i+1,ArrowLeft:i-1,ArrowDown:i+cols,ArrowUp:i-cols}[e.key];
  if(to==null||to<0||to>=board.children.length)return;
  e.preventDefault();board.children[to].focus();
 });
 return {
  open,showSetup,start,
  close(){release();game=null;root.classList.remove('playing');},
  get playing(){return !!game&&!game.over;},
  get game(){return game;},
 };
}
