# gd_dialog port for Johansson Town

Johansson Town is Three.js in the browser. [gd_dialog](https://github.com/QueenChristina/gd_dialog) is Godot. This folder is a **JavaScript port of the JSON runtime**, not a copy of the Godot scenes.

Credit: dialogue system design by Qin Tina (MIT). Town lines remain original Johansson writing.

## What landed

| File | Role |
| --- | --- |
| `src/dialogue/gd-dialog.js` | Engine: nodes, choices, `next` conditions, actions, `&` name token, `\|` pauses |
| `src/dialogue/town-dialogue.json` | First graphs: Thuan and Kenji |
| `src/dialogue/activity-bridge.js` | Maps town save flags (yen, notes, inventory, clock) onto the engine and draws frames with the existing `#activity` `show` / `close` helpers |
| `tests/gd-dialog.test.mjs` | Runtime tests (`npm test`) |

Existing `activities.js` topic menus are **unchanged**. The port is ready to call without replacing the current conversation UI.

## Hook (one branch in `resident`)

```js
import {playTownDialog} from './src/dialogue/activity-bridge.js';

function resident(name){
  if (playTownDialog(name, {show, close, state, getMinutes, note, say, onEscort})) return;
  // existing Thuan / DIALOGUE / legacyResident path
}
```

`playTownDialog` returns `false` for speakers without a start id, so everyone else keeps the current menus.

## JSON shape (same as gd_dialog)

```json
"node_id": {
  "name": "Thuan",
  "voice": "thuan",
  "text": ["Line one.", "Line two with a s|t|utter."],
  "choices": [
    {"text": "Agree", "next": "other_id", "action": ["flag agreed"]},
    {"text": "Only if printed", "next": "print_id", "show_only_if": "flag printed model"}
  ],
  "next": [{"id": "return_id", "if": "flag met_thuan"}, "menu_id"],
  "action": ["note Met Thuan."]
}
```

Built-in conditions: `flag NAME`, `not …`, `shops open`, `after hours`, `evening`, `yen >= N`, `has ITEM`.

Built-in actions: `flag NAME`, `note …`, `yen add N`, `escort kenji`, `say …`.

Add more in `activity-bridge.js` `execute`.
