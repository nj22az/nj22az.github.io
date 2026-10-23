/**
 * The Town book opens on a home screen of big icon tiles: every tool, and Settings, Map and Places beside them.
 * Settings, Map and Places are each a page of their own, with a back arrow (the owner, 23 October 2026: "when I'm in
 * the menu I want the menu to be more icon based, too much tapping and looking for what I want").
 *
 * The sections stay the <details> elements they were, so everything that opens one by its summary (webmcp.js, the
 * MCP audit session, the layout audits) still works: opening a section shows its page, and closing it, by its header,
 * the back arrow or the book closing, goes home. town-book.css draws both states from #directory[data-page].
 */
import {iconUrl} from './icons.js';

/** Short names for the tool tiles: the icon carries the meaning, the word only confirms it. */
const SHORT=Object.freeze({photoButton:'Photo',cleanViewButton:'Clean view',freeCameraButton:'Free camera',
 movesButton:'Moves',residentRecordsButton:'Residents',ferryOperationsButton:'Ferry',playerButton:'Save',cameraButton:'Controls'});
const SECTIONS=Object.freeze([['menu-settings','settings','gear'],['menu-map','map','map'],['menu-places','places','home']]);

export function setupTownBookHome({doc=globalThis.document,onClose=()=>{}}={}){
 const directory=doc.getElementById('directory');
 if(!directory)return {home(){}};
 const tools=directory.querySelector('#townTools');
 // The tools are the home screen itself: always unfolded.
 if(tools){tools.open=true;tools.addEventListener?.('toggle',()=>{if(!tools.open)tools.open=true;});}
 for(const [id,label] of Object.entries(SHORT)){const b=doc.getElementById(id);if(b?.classList.contains('app-tile')&&!b.querySelector('*'))b.textContent=label;}
 const sections=SECTIONS.map(([cls,page,icon])=>{
  const details=directory.querySelector('.'+cls);if(!details)return null;
  const summary=details.querySelector?.('summary');
  summary?.style?.setProperty?.('--icon',iconUrl(icon));
  summary?.style?.setProperty?.('--back',iconUrl('arrow-left'));
  return {details,page};
 }).filter(Boolean);
 const show=page=>{if(directory.dataset)directory.dataset.page=page;};
 for(const {details,page} of sections){
  details.addEventListener?.('toggle',()=>{
   if(details.open){for(const other of sections)if(other.details!==details)other.details.open=false;show(page);directory.querySelector('.directory-card')?.scrollTo?.(0,0);}
   else if(!sections.some(s=>s.details.open))show('home');
  });
 }
 function home(){for(const s of sections)s.details.open=false;show('home');}
 // A tap on the dimmed town around the book closes it, as the × does.
 directory.addEventListener?.('click',e=>{if(e.target===directory)onClose();});
 home();
 return {home};
}
