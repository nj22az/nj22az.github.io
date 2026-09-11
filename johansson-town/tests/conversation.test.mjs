import test from 'node:test';
import assert from 'node:assert/strict';
import {conversationViewport} from '../src/conversation-layout.js';
import {createActivities} from '../activities.js?snappy=1';
import {installDOM} from './fixtures.mjs';

test('conversation reserves a separate scene area on phones, tablets and desktop',()=>{
 for(const [width,height] of [[390,844],[844,390],[1024,768],[1440,900]]){
  const view=conversationViewport(width,height,true);
  assert.ok(view.width>0&&view.height>0);
  if(width<720){assert.equal(view.width,width);assert.ok(view.height+height*.48<=height);}
  else{assert.equal(view.height,height);assert.equal(view.width+Math.min(420,Math.max(300,width*.36)),width);}
  assert.deepEqual(conversationViewport(width,height,false),{width,height});
 }
});
test('Yuri topics and resident quest replies retain bubbles; notebook and close restore the scene',()=>{
 const dom=installDOM(),speakers=[];
 const acts=createActivities({say(){},onWeather(){},onTime(){},onConversation:name=>speakers.push(name)});
 const modal=document.querySelector('#activity');
 acts.action('resident','Yuri');assert.equal(speakers.at(-1),'Yuri');assert.ok(modal.classList.contains('conversation'));
 dom.button('I like your ribbon');assert.equal(speakers.at(-1),'Yuri');
 acts.close();assert.equal(speakers.at(-1),null);assert.ok(!document.body.classList.contains('conversation-open'));
 acts.action('resident','Aya');dom.button('About Tama');assert.equal(speakers.at(-1),'Aya');
 assert.ok(modal.classList.contains('conversation'));
 acts.inventory();assert.equal(speakers.at(-1),null);assert.ok(!modal.classList.contains('conversation'));acts.close();
});
