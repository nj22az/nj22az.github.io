import {strict as assert} from 'node:assert';
import {backendURL} from '../image-generator.js';
assert.equal(backendURL('https://example.com/'),'https://example.com');
assert.equal(backendURL('https://example.com/api/'),'https://example.com/api');
assert.equal(backendURL('http://localhost:8000'),'http://localhost:8000');
for(const url of ['','http://192.168.1.3:8000','http://example.com','https://user:password@example.com','https://example.com/?token=secret','javascript:alert(1)'])assert.throws(()=>backendURL(url));
console.log('Image generator server URL checks passed');
