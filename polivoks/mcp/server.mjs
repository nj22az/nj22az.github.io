#!/usr/bin/env node
/*
 * Johansson PF-82 MCP server: lets an agent write songs for the PF-82 and play it.
 *
 *   node polivoks/mcp/server.mjs        (registered as "pf82" in the repository's .mcp.json)
 *
 * Model Context Protocol over stdio (newline-delimited JSON-RPC 2.0), with no dependencies, so it runs
 * in a fresh checkout without npm install. Tools:
 *   compose  pf82_guide, pf82_list, pf82_check_song, pf82_render (a WAV made by the exact engine),
 *            pf82_share_link (opens the live PF-82 with the song ready)
 *   live     pf82_open serves the PF-82 on 127.0.0.1 with a private token; once a person opens that page,
 *            pf82_state, pf82_set, pf82_play and pf82_stop act in their browser over a same-origin event stream.
 * Nothing listens beyond 127.0.0.1, and nothing is published or uploaded.
 */
import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PolivoksSynth } from '../dsp/polivoks-dsp.js';
import { SONGS, build } from '../songs.js';
import { BUILT_IN_SONGS, GUIDE, JINGLE_SONGS, PARAMS, PATCHES, SHOP_UNIT, patchValues, shareLink, validateParams, validateSong } from '../agent.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '..', '..');
const OUT = path.resolve(process.env.PF82_OUT || path.join(HERE, 'out'));
const VERSION = '1.0.0';
const PROTOCOLS = ['2025-11-25', '2025-06-18', '2025-03-26', '2024-11-05'];

/* ---------------- songs and rendering ---------------- */

const BUILT_INS = [...SONGS, ...JINGLE_SONGS];

function resolveSong(args) {
  if (args.song) return validateSong(args.song);
  const s = BUILT_INS.find((x) => x.id === args.id);
  if (!s) throw new Error(`Give song (your own) or id (one of ${BUILT_INS.map((x) => x.id).join(', ')}).`);
  return s;
}

export function renderSong(song, { grade = 'modern', seed = 1982, quality = 2, fs = 48000 } = {}) {
  const synth = new PolivoksSynth(fs, quality === 4 ? 4 : 2, { ...patchValues(song.patch.base, song.patch.set), 'imp.grade': grade, 'imp.seed': seed });
  const b = build(song);
  synth.message({ t: 'song', ...b });
  const N = 128, L = new Float32Array(N), chunks = [];
  const max = Math.ceil((fs * 11 * 60) / N), tail = Math.ceil((fs * 1.5) / N);
  let blocks = 0, after = 0;
  while (blocks < max && (synth.seq || after < tail)) {
    synth.render(N, L, null, null, null); chunks.push(Float32Array.from(L)); blocks++;
    if (!synth.seq) after++;
  }
  const x = new Float32Array(chunks.length * N);
  chunks.forEach((c, i) => x.set(c, i * N));
  let peak = 0, ss = 0, clipped = 0;
  for (const v of x) { const a = Math.abs(v); peak = Math.max(peak, a); ss += v * v; if (a > 0.92) clipped++; }
  const db = (v) => Math.round(20 * Math.log10(Math.max(v, 1e-9)) * 10) / 10;
  return {
    samples: x, fs,
    stats: { seconds: +(x.length / fs).toFixed(2), notes: b.events.filter((e) => e[1] === 1).length, peakDb: db(peak), rmsDb: db(Math.sqrt(ss / x.length)), clippedPercent: +((100 * clipped) / x.length).toFixed(3) },
  };
}

export function wav(samples, fs) {
  const b = Buffer.alloc(44 + samples.length * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + samples.length * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16);
  b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22); b.writeUInt32LE(fs, 24); b.writeUInt32LE(fs * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34);
  b.write('data', 36); b.writeUInt32LE(samples.length * 2, 40);
  for (let i = 0; i < samples.length; i++) b.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(samples[i] * 32767))), 44 + i * 2);
  return b;
}

const slug = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'song';

/* ---------------- the live bridge ---------------- */

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.webp': 'image/webp', '.ico': 'image/x-icon' };

export class Bridge {
  constructor() { this.token = randomBytes(16).toString('hex'); this.clients = []; this.pending = new Map(); this.next = 1; this.server = null; this.url = null; }

  async start(port = Number(process.env.PF82_PORT) || 8282) {
    if (this.server) return this.url;
    this.server = createServer((req, res) => this.handle(req, res).catch(() => { res.writeHead(500); res.end(); }));
    await new Promise((resolve, reject) => {
      const tryPort = (p) => {
        this.server.once('error', (e) => (e.code === 'EADDRINUSE' && p !== 0 ? tryPort(0) : reject(e)));
        this.server.listen(p, '127.0.0.1', resolve);
      };
      tryPort(port);
    });
    this.url = `http://127.0.0.1:${this.server.address().port}/polivoks/?agent=${this.token}`;
    this.beat = setInterval(() => { for (const c of this.clients) c.write(': keep-alive\n\n'); }, 15000);
    this.beat.unref();
    return this.url;
  }

  async handle(req, res) {
    const u = new URL(req.url, 'http://127.0.0.1');
    if (u.pathname.startsWith('/agent/')) {
      if (u.searchParams.get('token') !== this.token) { res.writeHead(403); res.end('wrong token'); return; }
      if (u.pathname === '/agent/events' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive' });
        res.write(': connected\n\n');
        this.clients.push(res);
        req.on('close', () => { this.clients = this.clients.filter((c) => c !== res); });
        return;
      }
      if (u.pathname === '/agent/result' && req.method === 'POST') {
        let body = '';
        for await (const chunk of req) { body += chunk; if (body.length > 1e6) break; }
        res.writeHead(204); res.end();
        let msg; try { msg = JSON.parse(body); } catch { return; }
        const p = this.pending.get(msg.id);
        if (p) { this.pending.delete(msg.id); clearTimeout(p.timer); msg.ok ? p.resolve(msg.result) : p.reject(new Error(msg.error || 'The page refused.')); }
        return;
      }
      res.writeHead(404); res.end(); return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405); res.end(); return; }
    let rel = decodeURIComponent(u.pathname);
    if (rel.endsWith('/')) rel += 'index.html';
    const file = path.resolve(REPO, '.' + rel);
    if (!file.startsWith(REPO + path.sep)) { res.writeHead(403); res.end(); return; }
    try {
      const data = await readFile(file);
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch { res.writeHead(404); res.end('not found'); }
  }

  get connected() { return this.clients.length > 0; }

  send(cmd, args = {}, timeout = 8000) {
    if (!this.server) return Promise.reject(new Error('The live PF-82 is not running. Call pf82_open, then ask the person to open the URL.'));
    if (!this.connected) return Promise.reject(new Error(`No PF-82 page is connected. Ask the person to open ${this.url} and keep it open.`));
    const id = this.next++;
    const client = this.clients[this.clients.length - 1];
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error('The page did not answer within 8 seconds.')); }, timeout);
      this.pending.set(id, { resolve, reject, timer });
      client.write(`data: ${JSON.stringify({ id, cmd, args })}\n\n`);
    });
  }

  async stop() {
    clearInterval(this.beat);
    for (const c of this.clients) c.end();
    for (const p of this.pending.values()) { clearTimeout(p.timer); p.reject(new Error('Stopped.')); }
    if (this.server) await new Promise((r) => this.server.close(r));
    this.server = null;
  }
}

/* ---------------- tools ---------------- */

const SONG = {
  type: 'object',
  description: 'Your song. Read pf82_guide first. Example: { "title": "Little march", "bpm": 112, "meter": 4, "score": "C4:1 E4 G4 C5 | B4:2 G4 |", "patch": "duo", "set": { "flt.res": 0.8 } }',
  properties: {
    title: { type: 'string' }, by: { type: 'string' }, note: { type: 'string' },
    bpm: { type: 'number', minimum: 30, maximum: 300 }, meter: { type: 'number', description: 'Beats per bar; 4 for 4/4.' },
    pickup: { type: 'number' }, gate: { type: 'number', minimum: 0.1, maximum: 1 },
    tempo: { type: 'array', items: { type: 'array', items: { type: 'number' } }, description: '[[beat, bpm], …] instead of bpm.' },
    score: { type: 'string', description: 'NOTE:DURATION tokens, "|" between bars, e.g. "A3:1/2 C4 E4 A4 G4:2 |".' },
    parts: { type: 'array', items: { type: 'object', properties: { score: { type: 'string' }, shift: { type: 'integer' } }, required: ['score'] } },
    patch: { type: 'string', enum: Object.keys(PATCHES) },
    set: { type: 'object', description: 'Parameters over the patch, by name (see pf82_list).', additionalProperties: true },
  },
};
const SONG_OR_ID = { type: 'object', properties: { song: SONG, id: { type: 'string', enum: BUILT_INS.map((s) => s.id), description: 'A built-in song or a Sakura Shōten jingle instead.' } } };

export function makeTools(bridge) {
  return [
    {
      name: 'pf82_guide', title: 'How to write for the PF-82', readOnly: true,
      description: 'Read first: the song notation, how bars and durations work, the patches and the sounds worth trying.',
      inputSchema: { type: 'object', properties: {} },
      run: () => ({ guide: GUIDE }),
    },
    {
      name: 'pf82_list', title: 'Songs, patches and parameters', readOnly: true,
      description: 'The built-in public-domain songs, the patches and every parameter with its range and meaning.',
      inputSchema: { type: 'object', properties: {} },
      run: () => ({ songs: BUILT_IN_SONGS, patches: Object.fromEntries(Object.entries(PATCHES).map(([k, v]) => [k, { name: v[0], sets: v[1] }])), parameters: PARAMS }),
    },
    {
      name: 'pf82_check_song', title: 'Check a song', readOnly: true,
      description: 'Checks a song: every bar must add up, notes in range, a known patch, valid parameters. Returns its length and range, or every problem by bar.',
      inputSchema: { type: 'object', properties: { song: SONG }, required: ['song'] },
      run: ({ song }) => { const s = validateSong(song); return { ok: true, id: s.id, title: s.title, stats: s.stats }; },
    },
    {
      name: 'pf82_render', title: 'Render a song to a WAV file',
      description: 'Plays a song through the exact PF-82 engine offline and writes a 48 kHz WAV on this computer. Reports length, peak and loudness so levels can be balanced (the built-in songs sit near −22 dBFS rms).',
      inputSchema: { ...SONG_OR_ID, properties: { ...SONG_OR_ID.properties, grade: { type: 'string', enum: ['ideal', 'modern', 'vintage'], description: 'How the unit was built. Default modern.' }, seed: { type: 'integer', minimum: 1, maximum: 99999, description: 'Serial number of the unit. Default 1982; a Sakura Shōten jingle defaults to the shop\'s unit, 13715.' }, quality: { type: 'integer', enum: [2, 4], description: 'Oversampling. Default 2.' } } },
      run: async (args) => {
        const song = resolveSong(args);
        const shop = song.jingle && args.grade === undefined && args.seed === undefined ? SHOP_UNIT : {};
        const r = renderSong(song, { grade: args.grade ?? shop.grade, seed: args.seed ?? shop.seed, quality: args.quality });
        await mkdir(OUT, { recursive: true });
        const file = path.join(OUT, `${slug(song.title)}-${song.id}.wav`);
        await writeFile(file, wav(r.samples, r.fs));
        return { file, ...r.stats };
      },
    },
    {
      name: 'pf82_share_link', title: 'Link that opens the song on the live PF-82', readOnly: true,
      description: 'A link to the live PF-82 with the song in the address (after #, so it never reaches a server). Whoever opens it presses Power, then Play.',
      inputSchema: { type: 'object', properties: { song: SONG }, required: ['song'] },
      run: ({ song }) => ({ url: shareLink(song), local: bridge.url ? `${bridge.url.split('?')[0]}#song=${shareLink(song).split('#song=')[1]}` : undefined }),
    },
    {
      name: 'pf82_open', title: 'Serve the PF-82 for live control',
      description: 'Serves the PF-82 on 127.0.0.1 and returns a private URL. Ask the person to open it in their browser and press Power; then pf82_set, pf82_play and pf82_stop act on that page.',
      inputSchema: { type: 'object', properties: {} },
      run: async () => ({ url: await bridge.start(), connected: bridge.connected, next: bridge.connected ? 'A page is connected.' : 'Ask the person to open the URL and press Power (browsers only start sound after a click).' }),
    },
    {
      name: 'pf82_state', title: 'What the open PF-82 is doing', readOnly: true,
      description: 'The connected page: power, every parameter, the patch, the song playing and the circuit readouts.',
      inputSchema: { type: 'object', properties: {} },
      run: async () => (bridge.connected ? bridge.send('state') : { connected: false, url: bridge.url || null, next: bridge.url ? `Ask the person to open ${bridge.url}.` : 'Call pf82_open first.' }),
    },
    {
      name: 'pf82_set', title: 'Turn knobs on the open PF-82',
      description: 'Sets parameters on the connected page, by name (see pf82_list), e.g. { "values": { "flt.frq": 0.7, "flt.res": 0.9 } }.',
      inputSchema: { type: 'object', properties: { values: { type: 'object', additionalProperties: true }, patch: { type: 'string', enum: Object.keys(PATCHES), description: 'Load a patch first.' } } },
      run: async ({ values = {}, patch }) => {
        const { errors } = validateParams(values);
        if (errors.length) throw new Error(errors.join('\n'));
        if (patch) await bridge.send('patch', { id: patch });
        return bridge.send('set', { values });
      },
    },
    {
      name: 'pf82_play', title: 'Play a song on the open PF-82',
      description: 'Plays your song (or a built-in one by id) on the connected page, with its patch. If Power is off it waits there until the person presses it.',
      inputSchema: SONG_OR_ID,
      run: async (args) => { const song = args.song ? (validateSong(args.song), args.song) : undefined; if (!song) resolveSong(args); return bridge.send('play', { song, id: args.id }); },
    },
    {
      name: 'pf82_stop', title: 'Stop the song', inputSchema: { type: 'object', properties: {} },
      description: 'Stops the song playing on the connected page.',
      run: async () => bridge.send('stop'),
    },
  ];
}

/* ---------------- MCP over stdio ---------------- */

export function createServer_(output = (line) => process.stdout.write(line + '\n')) {
  const bridge = new Bridge();
  const tools = makeTools(bridge);
  const send = (msg) => output(JSON.stringify({ jsonrpc: '2.0', ...msg }));
  async function handle(msg) {
    const { id, method, params = {} } = msg;
    const reply = (result) => id !== undefined && send({ id, result });
    const fail = (code, message) => id !== undefined && send({ id, error: { code, message } });
    if (method === 'initialize') {
      const asked = params.protocolVersion;
      return reply({
        protocolVersion: PROTOCOLS.includes(asked) ? asked : PROTOCOLS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo: { name: 'pf82', title: 'Johansson PF-82', version: VERSION },
        instructions: 'Write and play songs on the Johansson PF-82 synthesiser. Read pf82_guide, check with pf82_check_song, then pf82_render, pf82_share_link, or pf82_open for live control in the person’s browser.',
      });
    }
    if (method === 'ping') return reply({});
    if (method === 'tools/list') return reply({ tools: tools.map((t) => ({ name: t.name, title: t.title, description: t.description, inputSchema: t.inputSchema, annotations: { readOnlyHint: !!t.readOnly, destructiveHint: false, openWorldHint: false } })) });
    if (method === 'tools/call') {
      const tool = tools.find((t) => t.name === params.name);
      if (!tool) return fail(-32602, `Unknown tool ${params.name}`);
      try {
        const result = await tool.run(params.arguments || {});
        return reply({ content: [{ type: 'text', text: JSON.stringify(result, null, 2) }], structuredContent: result });
      } catch (e) {
        return reply({ content: [{ type: 'text', text: e.message }], isError: true });
      }
    }
    if (method && method.startsWith('notifications/')) return undefined;
    return fail(-32601, `Method not found: ${method}`);
  }
  return { handle, bridge, tools };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { handle, bridge } = createServer_();
  let buf = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    buf += chunk;
    let i;
    while ((i = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, i).trim(); buf = buf.slice(i + 1);
      if (!line) continue;
      let msg; try { msg = JSON.parse(line); } catch { process.stdout.write(JSON.stringify({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'Parse error' } }) + '\n'); continue; }
      handle(msg).catch((e) => process.stderr.write(`pf82: ${e.stack}\n`));
    }
  });
  process.stdin.on('end', () => { void bridge.stop().then(() => process.exit(0)); });
}
