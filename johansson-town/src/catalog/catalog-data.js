// Generated from assets/catalog by tools/catalog/build-catalog.mjs: do not edit. Change the asset in Johansson Studio,
// publish it (python3 -m townstudio.assets publish <id> --site <this repo>), then run node tools/catalog/build-catalog.mjs.
const freeze=o=>{if(o&&typeof o==='object'){for(const v of Object.values(o))freeze(v);Object.freeze(o);}return o;};
/** Johansson World's asset catalogue, by id (src/catalog/catalog.js places them). */
export const CATALOG=freeze({
 "massage-chair": {
  "id": "massage-chair",
  "name": "Coin massage chair",
  "kind": "furniture",
  "version": 1,
  "purpose": {
   "for": "Bathers resting after the bath in Umi-no-yu's lobby: the regulars cooling down in their after-bath clothes, and Mr Fujita, whose back is always stiff from the boat.",
   "why": "Ten minutes of kneading for a ¥100 coin after a 42-degree soak; a sentō's lobby kept one so the regulars stayed for a coffee milk and the night game.",
   "where": "In the Umi-no-yu lobby by the milk cooler, its back to the east wall on the men's side, facing the room: where the onsen's chair stands now (onsen.js)."
  },
  "size": [0.9,1.14,0.73],
  "colours": {
   "upholstery": "#3fa0c8",
   "piping": "#2f5f9e",
   "shell": "#f4f1ea",
   "base": "#6d7478",
   "steel": "#6d7478",
   "plate": "#9aa3a8",
   "slot": "#2b2b2b",
   "start": "#2a8a5a",
   "stop": "#d8342c",
   "lamp": "#ff4a2a",
   "sticker": "#f4d23c",
   "screen": "#27304d",
   "cord": "#2b2b2b",
   "plug": "#f4f1ea"
  },
  "tags": ["onsen","lobby","1990s","coin-operated","seat","massage","Fujita's Back"],
  "checked": "2026-10-10T20:55:37.389Z",
  "colliders": [
   {
    "name": "body",
    "x": 0,
    "z": 0,
    "w": 0.9,
    "d": 0.61,
    "yaw": 0,
    "minY": 0,
    "height": 1.14
   },
   {
    "name": "leg rest",
    "x": 0,
    "z": 0.365,
    "w": 0.43,
    "d": 0.12,
    "yaw": 0,
    "minY": 0,
    "height": 0.33
   }
  ],
  "seats": [
   {
    "id": "seat",
    "label": "Sit in the massage chair (¥100)",
    "position": [0,0,0.255],
    "stand": [0,0,1.105],
    "yaw": 3.1416,
    "surfaceY": 0.5,
    "eyeY": 1.12,
    "front": 0.05
   }
  ],
  "spots": [
   {
    "id": "coin",
    "kind": "stand",
    "position": [-0.25,0,0.785],
    "yaw": 0.2908,
    "label": "Put a ¥100 coin in",
    "note": "Where Fujita stands bent double to feed the coin box (the film's panel 4b, room x 3.72, z 3.3)."
   }
  ],
  "action": {
   "kind": "seat",
   "label": "Sit in the massage chair (¥100)",
   "price": 100,
   "minutes": 10
  },
  "anchors": {
   "coin-slot": [-0.384,0.655,0.305],
   "timer-display": [-0.411,0.616,0.3005],
   "running-lamp": [-0.428,0.655,0.304],
   "cord": [-0.36,0.03,-0.288],
   "remote": [0.405,0.74,0.155],
   "right-arm-top": [-0.405,0.71,0.05],
   "roller-track": [0,0.76,-0.125]
  },
  "parts": [
   {
    "name": "Coin massage chair",
    "loose": false,
    "note": ""
   },
   {
    "name": "Massage chair seat",
    "loose": false,
    "note": ""
   },
   {
    "name": "Massage chair back",
    "loose": false,
    "note": ""
   },
   {
    "name": "Massage chair rollers",
    "loose": false,
    "note": ""
   },
   {
    "name": "Massage chair coin box",
    "loose": false,
    "note": ""
   },
   {
    "name": "Massage chair lamp",
    "loose": false,
    "note": ""
   },
   {
    "name": "Massage chair remote",
    "loose": false,
    "note": ""
   },
   {
    "name": "Massage chair cord",
    "loose": true,
    "note": "Lies on the floor beside the chair. A room that wires the chair itself (Umi-no-yu draws its own cord to the 1994 socket) hides this part and starts its cord at the cord anchor."
   }
  ],
  "model": "massage-chair/model.glb",
  "modelSha": "b998a9186734",
  "hero": "massage-chair/hero.png",
  "measured": {
   "size": [0.9,1.14,0.73],
   "body": {
    "min": [-0.45,0,-0.305],
    "max": [0.45,1.14,0.425]
   },
   "all": {
    "min": [-0.7307,-0.0004,-0.3706],
    "max": [0.45,1.14,0.425]
   },
   "triangles": 6574,
   "materials": 6,
   "meshes": 13
  },
  "budget": {
   "triangles": 7000,
   "materials": 6
  },
  "published": "2026-10-11"
 },
 "seagulls-cap": {
  "id": "seagulls-cap",
  "name": "Seagulls cap",
  "kind": "prop",
  "version": 1,
  "purpose": {
   "for": "Islanders who work bare-headed under the Okinawan sun on the quay and the boats (Kōji at the catch tables first; Haru, Masaru and Uncle Kinjō), and the Minato Seagulls' fans who follow the autumn fixtures from the izakaya counter (Daichi, who dreams of a perfect game).",
   "why": "A peak against the glare off the water at the morning catch, cloth that breathes in the heat, a strap that fits any head; and the home team's gull, the same night navy as the jersey on the wall at Sato Ramen, so the whole counter can see whose side you are on.",
   "where": "On the cap rack at Sakura Shōten, hung on its pegs by the strap, a season line near the window where the walk from the door to the till passes it; and on the heads of whoever bought one (src/avatars/hat-assets.js fits it to any head)."
  },
  "size": [0.4811,0.2928,0.6657],
  "colours": {
   "cloth": "#27304d",
   "undervisor": "#2f5a3e",
   "sweatband": "#cfc8b8",
   "button": "#f4f1ea",
   "strap": "#2b2b2b",
   "gull": "#f8f6ef",
   "gull-edge": "#27304d",
   "wingtips": "#2b2623",
   "bill": "#e8b83e"
  },
  "tags": ["cap","baseball cap","snapback","Minato Seagulls","Seagulls","baseball","sun","quay","1990s","wearable","Sakura Shōten"],
  "checked": "2026-10-14T04:48:32.859Z",
  "colliders": [
   {
    "name": "body",
    "x": 0,
    "z": 0.075,
    "w": 0.481,
    "d": 0.666,
    "yaw": 0,
    "minY": 0,
    "height": 0.293
   }
  ],
  "seats": [],
  "spots": [],
  "action": {
   "kind": "buy",
   "label": "Buy the Seagulls cap (¥1,800)",
   "price": 1800
  },
  "anchors": {
   "head-centre": [0,-0.0088,0],
   "head-top": [0,0.251,0],
   "head-left": [0.2261,-0.0088,0],
   "head-front": [0,-0.0088,0.2357],
   "peg": [0,0.0613,-0.2465],
   "crown-top": [0,0.2925,0],
   "bill-tip": [0,0.076,0.4028],
   "band-front": [0,0.0951,0.239]
  },
  "parts": [],
  "model": "seagulls-cap/model.glb",
  "modelSha": "dea5609ef74f",
  "hero": "seagulls-cap/hero.png",
  "measured": {
   "size": [0.4811,0.2928,0.6657],
   "body": {
    "min": [-0.2406,0,-0.2576],
    "max": [0.2406,0.2928,0.4081]
   },
   "all": {
    "min": [-0.2406,0,-0.2576],
    "max": [0.2406,0.2928,0.4081]
   },
   "triangles": 2956,
   "materials": 3,
   "meshes": 10
  },
  "budget": {
   "triangles": 3000,
   "materials": 3
  },
  "published": "2026-10-14"
 }
});
