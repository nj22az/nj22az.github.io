import test from 'node:test';
import assert from 'node:assert/strict';
import {translationSegments,verbatim} from '../browser-translation.mjs';
test('translation preserves exact legal identifiers, signs, decimal limits and units',()=>{const text='Review AFS 2023:5: PS 0.5 bar, TS −20 °C, DN 100 mm and 2014/68/EU.';const parts=translationSegments(text);assert.equal(parts.map(x=>x.text).join(''),text);for(const token of ['AFS 2023:5','PS','0.5 bar','TS','−20 °C','DN','100 mm','2014/68/EU'])assert.ok(parts.some(x=>x.protected&&x.text===token),token);});
test('normal interface instructions remain available to browser translation',()=>{assert.deepEqual(translationSegments('Review documents before operation.'),[{text:'Review documents before operation.',protected:false}]);});
test('asset identifiers are escaped as text rather than executable markup',()=>{assert.equal(verbatim('TAG-<01>'),'<span translate="no">TAG-&lt;01&gt;</span>');});
