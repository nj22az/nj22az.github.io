/* A fixed section theme must not consume or overwrite the homepage preference. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require('node:path').join(__dirname, '../theme-bootstrap.js'), 'utf8');
const themes = ['cobalt','mossy','cute','colorgrid','crimson','inkcraft','clarity','horizon','swift','botanical','popwave'];
function boot(path, previous, lock) {
  const values = new Map(previous ? [['nj-theme', previous]] : []);
  const attrs = new Map(lock ? [['data-theme-lock', lock]] : []);
  const storage = {getItem:k=>values.get(k)||null, setItem:(k,v)=>values.set(k,v)};
  let randomCalls = 0;
  const context = {document:{documentElement:{getAttribute:k=>attrs.get(k)||null,setAttribute:(k,v)=>attrs.set(k,v)}},location:{pathname:path},localStorage:storage,window:{crypto:{getRandomValues:a=>{randomCalls++;a[0]=2;return a;}}},Uint32Array,Math};
  vm.runInNewContext(source, context);
  return {context, attrs, values, randomCalls};
}
for (const previous of [...themes, null]) {
  const state = boot('/hotels/',previous,'clarity');
  assert.equal(state.attrs.get('data-theme'),'clarity');
  assert.equal(state.context.window.NJThemeVisit.get(),'clarity');
  state.context.window.NJThemeVisit.remember('popwave');
  assert.equal(state.context.window.NJThemeVisit.get(),'clarity');
  assert.equal(state.values.get('nj-theme'),previous||undefined);
  assert.equal(state.randomCalls,0);
}
const home=boot('/','cobalt',null);
assert.notEqual(home.attrs.get('data-theme'),'cobalt');
assert.equal(home.randomCalls,1);
const blog=boot('/blog/','popwave',null);
assert.equal(blog.attrs.get('data-theme'),'popwave');
assert.equal(blog.randomCalls,0);
console.log('PASS: hotel lock across 11 saved themes and empty storage; remember cannot override it; homepage randomisation and other-page inheritance preserved');
