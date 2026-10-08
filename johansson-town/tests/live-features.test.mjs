import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {decoratorEnabled,LIVE_HOSTS} from '../src/features.js';

const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');

test('the decorator is off on the live site and on everywhere else',()=>{
 for(const hostname of LIVE_HOSTS)assert.equal(decoratorEnabled({hostname}),false,hostname);
 assert.equal(decoratorEnabled({hostname:'NJ22AZ.GITHUB.IO'}),false);
 for(const hostname of ['localhost','127.0.0.1',''])assert.equal(decoratorEnabled({hostname}),true,hostname||'(file)');
 assert.equal(decoratorEnabled(undefined),true,'tests and tools without a location');
});

test('every way into the decorator asks first',async()=>{
 const game=await read('src/game.js'),title=await read('title-menu.js'),html=await read('index.html');
 assert.match(game,/decoratorEnabled\(\)&&new URLSearchParams\(location\.search\)\.has\('build'\)/,'the ?build town builder');
 assert.match(game,/arrange:decoratorEnabled\(\)\?arranging\.open:null/,'Arrange furniture at home');
 assert.match(game,/__JOHANSSON_MODE__==='build'&&decoratorEnabled\(\)/,'the title screen BUILD mode');
 assert.match(title,/if\(!decoratorEnabled\(\)\)build\.remove\(\)/,'no BUILD button online');
 assert.doesNotMatch(html,/const items = /,'the title menu reads its buttons each time, so a removed BUILD is never focused');
});
