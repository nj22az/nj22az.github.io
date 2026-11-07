// The agent surface: song checking, share links, and the MCP server over stdio with its live bridge.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';
import { DEFAULTS } from '../dsp/polivoks-dsp.js';
import { PARAMS, PATCHES, decodeSong, encodeSong, shareLink, validateParams, validateSong } from '../agent.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const MARCH = { title: 'Little march', bpm: 120, meter: 4, score: 'C4:1 E4 G4 C5 | B4:1/2 A4 G4 F4 E4:2 | D4:1 G4 C4:2 |', patch: 'duo', set: { 'flt.res': 0.8, 'vco1.wave': 'saw' } };

test('songs: a good song passes with its length; a bad bar, note, patch or parameter is named', () => {
  const s = validateSong(MARCH);
  assert.equal(s.stats.bars, 3); assert.equal(s.stats.notes, 12); assert.equal(s.stats.seconds, 6);
  assert.equal(s.patch.base, 'duo'); assert.equal(s.patch.set['vco1.wave'], 'saw');
  const bad = (spec, pattern) => assert.throws(() => validateSong({ ...MARCH, ...spec }), pattern);
  bad({ score: 'C4:1 E4 G4 | C5:4 |' }, /bar 1: 3 beats, but the bar should be 4/);
  bad({ score: 'H4:4 |' }, /Not a note: H4/);
  bad({ patch: 'organ' }, /patch must be one of/);
  bad({ set: { 'flt.res': 2 } }, /flt\.res must be a number from 0 to 1/);
  bad({ set: { 'flt.colour': 1 } }, /Unknown parameter "flt\.colour"/);
  bad({ bpm: 900 }, /bpm/);
});

test('parameters: every DEFAULTS key but line in is settable, and every patch sets known keys only', () => {
  for (const k of Object.keys(DEFAULTS)) if (k !== 'src') assert.ok(PARAMS[k], k);
  for (const [id, [, values]] of Object.entries(PATCHES)) assert.deepEqual(validateParams(values).errors, [], id);
  assert.deepEqual(validateParams({ 'vco1.oct': 3 }).errors.length, 1);
  assert.equal(validateParams({ 'glob.mode': 'duo' }).values['glob.mode'], 'duo');
});

test('share links: the song travels in the fragment and comes back the same', () => {
  const url = shareLink(MARCH);
  assert.match(url, /^https:\/\/nj22az\.github\.io\/polivoks\/#song=[A-Za-z0-9_-]+$/);
  const back = decodeSong(url.split('#song=')[1]);
  assert.equal(back.id, validateSong(MARCH).id);
  assert.equal(encodeSong({ ...MARCH, title: 'Åsa’s vals 🎹' }).length > 10, true);
  assert.equal(decodeSong(encodeSong({ ...MARCH, title: 'Åsa’s vals 🎹' })).title, 'Åsa’s vals 🎹');
});

/* A minimal MCP client over the server's stdio. */
function startServer(env) {
  const child = spawn(process.execPath, [path.join(HERE, '..', 'mcp', 'server.mjs')], { env: { ...process.env, ...env }, stdio: ['pipe', 'pipe', 'inherit'] });
  let buf = '', next = 1;
  const waiting = new Map();
  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (d) => {
    buf += d;
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const msg = JSON.parse(buf.slice(0, i)); buf = buf.slice(i + 1);
      waiting.get(msg.id)?.(msg); waiting.delete(msg.id);
    }
  });
  const request = (method, params) => new Promise((resolve) => { const id = next++; waiting.set(id, resolve); child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n'); });
  const call = async (name, args = {}) => {
    const r = (await request('tools/call', { name, arguments: args })).result;
    return { error: r.isError ? r.content[0].text : null, data: r.structuredContent };
  };
  return { child, request, call, close: () => { child.stdin.end(); return new Promise((r) => child.on('exit', r)); } };
}

/* A stand-in for the PF-82 page on the bridge: it answers each command like app.js does. */
function fakePage(url, answer) {
  const u = new URL(url), token = u.searchParams.get('agent');
  return new Promise((resolve) => {
    const req = http.get(`${u.origin}/agent/events?token=${token}`, (res) => {
      res.setEncoding('utf8');
      let buf = '';
      res.on('data', (d) => {
        buf += d;
        let i;
        while ((i = buf.indexOf('\n\n')) >= 0) {
          const block = buf.slice(0, i); buf = buf.slice(i + 2);
          if (block.startsWith(': connected')) resolve(req);
          if (!block.startsWith('data: ')) continue;
          const msg = JSON.parse(block.slice(6));
          const body = JSON.stringify({ id: msg.id, ok: true, result: answer(msg) });
          const post = http.request(`${u.origin}/agent/result?token=${token}`, { method: 'POST', headers: { 'Content-Type': 'application/json' } });
          post.end(body);
        }
      });
    });
  });
}

test('MCP server: speaks the protocol, lists its tools, checks, renders and links songs', async () => {
  const out = await mkdtemp(path.join(tmpdir(), 'pf82-'));
  const s = startServer({ PF82_OUT: out, PF82_PORT: '0' });
  try {
    const init = await s.request('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '1' } });
    assert.equal(init.result.protocolVersion, '2025-06-18');
    assert.equal(init.result.serverInfo.name, 'pf82');
    s.child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');
    const names = (await s.request('tools/list', {})).result.tools.map((t) => t.name);
    assert.deepEqual(names, ['pf82_guide', 'pf82_list', 'pf82_check_song', 'pf82_render', 'pf82_share_link', 'pf82_open', 'pf82_state', 'pf82_set', 'pf82_play', 'pf82_stop']);
    assert.match((await s.call('pf82_guide')).data.guide, /NOTE:DURATION/);
    const listed = (await s.call('pf82_list')).data.songs;
  assert.equal(listed.length, 12); assert.equal(listed.filter((x) => x.jingle).length, 5, 'the five Sakura Shōten jingles');
    assert.match((await s.call('pf82_check_song', { song: { ...MARCH, score: 'C4:3 |' } })).error, /bar 1: 3 beats/);
    const r = (await s.call('pf82_render', { song: MARCH })).data;
    const file = await readFile(r.file);
    assert.equal(file.toString('ascii', 0, 4), 'RIFF');
    assert.ok(r.seconds > 6 && r.notes === 12 && r.peakDb > -30 && r.clippedPercent < 1, JSON.stringify(r));
    const link = (await s.call('pf82_share_link', { song: MARCH })).data.url;
    assert.equal(decodeSong(link.split('#song=')[1]).title, 'Little march');
    assert.match((await s.call('pf82_set', { values: { 'flt.res': 0.5 } })).error, /pf82_open/);
    assert.equal((await s.request('nope/nothing', {})).error.code, -32601);
  } finally { await s.close(); await rm(out, { recursive: true, force: true }); }
});

test('MCP server: the live bridge serves the page and carries commands to it and answers back', async () => {
  const s = startServer({ PF82_PORT: '0' });
  try {
    await s.request('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '1' } });
    const { url, connected } = (await s.call('pf82_open')).data;
    assert.equal(connected, false);
    assert.match(url, /^http:\/\/127\.0\.0\.1:\d+\/polivoks\/\?agent=[0-9a-f]{32}$/);
    const page = await fetch(url);
    assert.equal(page.status, 200); assert.match(await page.text(), /Johansson PF-82/);
    assert.equal((await fetch(new URL('/agent/events?token=wrong', url))).status, 403);
    assert.equal((await fetch(new URL('/../../etc/passwd', url))).status, 404);
    const seen = [];
    const req = await fakePage(url, (msg) => { seen.push(msg); return msg.cmd === 'state' ? { power: true } : { done: msg.cmd, args: msg.args }; });
    assert.equal((await s.call('pf82_state')).data.power, true);
    const set = await s.call('pf82_set', { values: { 'flt.frq': 0.7 }, patch: 'growl' });
    assert.deepEqual(set.data.args, { values: { 'flt.frq': 0.7 } });
    const play = await s.call('pf82_play', { song: MARCH });
    assert.equal(play.data.done, 'play'); assert.equal(play.data.args.song.title, 'Little march');
    assert.match((await s.call('pf82_play', { song: { ...MARCH, score: 'C4:3 |' } })).error, /bar 1/);
    assert.equal((await s.call('pf82_stop')).data.done, 'stop');
    assert.deepEqual(seen.map((m) => m.cmd), ['state', 'patch', 'set', 'play', 'stop']);
    req.destroy();
  } finally { await s.close(); }
});
