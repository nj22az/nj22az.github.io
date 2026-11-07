# PF-82 MCP server: let an agent write songs and play the PF-82

The owner, 3 November 2026: "can you add MCP Wiring, so for instance I can control this app with an Agent and make
my own song?"

`server.mjs` is a Model Context Protocol server over stdio with **no dependencies** (plain Node 20+; it speaks
JSON-RPC itself), so it starts in a fresh checkout without `npm install`. It is registered as `pf82` in the
repository's `.mcp.json`, so Claude Code opened in this repository offers its tools.

## What an agent can do

| Tool | Does |
| --- | --- |
| `pf82_guide` | The song notation and sound tips. Agents read this first |
| `pf82_list` | The seven built-in songs and Sakura Shōten's five jingles (`jingle: true`), the patches (ready-made sounds) and every parameter with its range and meaning |
| `pf82_check_song` | Checks a song: every bar adds up, notes in range, valid sound settings. Names the bar that is wrong |
| `pf82_render` | Plays the song through the exact PF-82 engine and writes a WAV (`polivoks/mcp/out/`, or `PF82_OUT`) with its length and levels; a jingle renders on the shop's unit (serial 13715) unless `seed` or `grade` is given |
| `pf82_share_link` | A link to the live PF-82 with the song in the address: open it, press Power, it plays |
| `pf82_open` | Serves the PF-82 on `127.0.0.1` with a private token for live control |
| `pf82_state` · `pf82_set` · `pf82_play` · `pf82_stop` | Read, turn knobs, play and stop on that open page, in your own browser |

A song is plain JSON, for example:

```json
{ "title": "Little march", "bpm": 120, "meter": 4,
  "score": "C4:1 E4 G4 C5 | B4:1/2 A4 G4 F4 E4:2 | D4:1 G4 C4:2 |",
  "patch": "duo", "set": { "flt.res": 0.8 } }
```

## Try it

In Claude Code in this repository, ask for example: *"Use the pf82 tools: write a 16-bar sea shanty in D minor for
the scream lead, check it, and give me a share link."* Or for live control: *"Open the PF-82 for live control, then
play my song and slowly open the filter."* `pf82_open` returns a `http://127.0.0.1:…/polivoks/?agent=…` address:
open it, press **Power** once (browsers only start sound after a click), and the agent plays there.

For another MCP client (Claude Desktop and others), add a stdio server:

```json
{ "mcpServers": { "pf82": { "command": "node", "args": ["/absolute/path/to/nj22az.github.io/polivoks/mcp/server.mjs"] } } }
```

Songs an agent plays, and songs opened from links, are kept in that browser under **Your songs** in the song menu
(at most 20). In a browser-driving agent, the open page also offers the same commands as `window.PF82`
(`state()`, `set({ values })`, `patch({ id })`, `play({ song })`, `stop()`).

## Safety

- The bridge listens on `127.0.0.1` only. Its commands need the random token in the address; static files are served
  read-only from the repository folder, with no path outside it.
- Share links carry the song after `#`, which browsers never send to a server.
- The server never publishes, uploads or touches the network; renders go to `out/` (ignored by Git).

## Tests

`polivoks/tests/agent.test.mjs` runs the real server over stdio: the protocol, all ten tools, a render, a share link
round trip, and the live bridge against a stand-in page. An end-to-end run with the real page in Chromium (agent
connects, plays a song after Power, turns knobs, reads state, stops; a share link opens and plays) passed on
3 November 2026; it lives in the session record, not in CI, which has no browser.
