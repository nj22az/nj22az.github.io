import {test} from 'node:test';
import assert from 'node:assert/strict';
import {installDOM} from './fixtures.mjs';
import {createActivities} from '../activities.js';

test('Yuri offers selectable topics, remembers an introduction and never charges for conversation',()=>{
 const dom=installDOM(),options={say(){},onWeather(){},onTime(){},onCamera(){},getMinutes:()=>1002};
 const acts=createActivities(options),yen=acts.state.yen;
 let greetings=0;window.__JOHANSSON_CHARACTER_CONTROL__={gesture(name){assert.equal(name,'Yuri');greetings++;}};
 acts.action('resident','Yuri');
 assert.match(document.querySelector('#activityBody').firstChild.textContent,/I am Yuri/);
 dom.button('You make this place lovely');
 assert.match(document.querySelector('#activityBody').firstChild.textContent,/Thank you/);
 dom.button('Tell me something else');
 assert.match(document.querySelector('#activityBody').firstChild.textContent,/You are back/);
 dom.button('Tell me a shop secret');
 assert.match(document.querySelector('#activityBody').firstChild.textContent,/assistant manager/);
 dom.button('Tell me something else');dom.button('Give me a little challenge');
 assert.match(document.querySelector('#activityBody').firstChild.textContent,/seagull/);
 dom.button('Tell me something else');dom.button('Do you sing along to the radio?');
 assert.match(document.querySelector('#activityBody').firstChild.textContent,/concert hall/);
 assert.equal(greetings,1,'Changing topics must not keep waving');
 assert.equal(acts.state.yen,yen);acts.close();
 const restored=createActivities(options);restored.action('resident','Yuri');
 assert.match(document.querySelector('#activityBody').firstChild.textContent,/You are back/);
 assert.equal(greetings,2,'A new conversation can greet again');
 restored.close();
 delete window.__JOHANSSON_CHARACTER_CONTROL__;
});
