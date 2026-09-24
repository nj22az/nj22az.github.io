import test from 'node:test';
import assert from 'node:assert/strict';
import {actionFor,itemIcon,svg,iconUrl,ICON_NAMES} from '../src/ui/icons.js';

test('the action button shows the icon for what you are facing',()=>{
 const cases={
  'Talk to Thuan':['talk','TALK'],'E · Talk to Nao':['talk','TALK'],
  'Enter Front-Row Books & Workshop':['door','ENTER'],'Ring service bell':['bell','RING'],
  'Open refrigerated drinks and dairy':['basket','SHOP'],'Browse mail-order catalogue':['basket','SHOP'],
  'Pick up returnable glass bottle':['hand','TAKE'],'Read Sakura sales ledger':['book','READ'],
  'dismount Thuan’s bicycle':['bike','GET OFF'],'Stand':['stand','STAND'],'Sit on the bench':['chair','SIT'],
  'Order food · Stand':['bowl','EAT'],'Greet Tama':['cat','GREET'],'Something odd':['eye','LOOK']
 };
 for(const [label,[icon,verb]] of Object.entries(cases))assert.deepEqual(actionFor(label),{icon,verb},label);
});

test('things in the bag get an icon by what they are',()=>{
 assert.equal(itemIcon('Green tea'),'cup');assert.equal(itemIcon('Canned coffee'),'cup');
 assert.equal(itemIcon('Sea bream'),'fish');assert.equal(itemIcon('Ice'),'ice');
 assert.equal(itemIcon('Plum rice ball'),'food');assert.equal(itemIcon('Returnable glass bottle'),'recycle');
 assert.equal(itemIcon('Anything',{printed:true}),'cube');assert.equal(itemIcon('Mystery'),'box');
});

test('every icon draws, and unknown names fall back rather than break',()=>{
 for(const name of ICON_NAMES){assert.match(svg(name),/^<svg[^>]*viewBox="0 0 24 24"/);assert.match(iconUrl(name),/^url\("data:image\/svg\+xml,/);}
 assert.equal(svg('no-such-icon'),svg('box'));
 assert.match(svg('bag',{label:'Bag "full"'}),/aria-label="Bag &quot;full&quot;"/);
});
