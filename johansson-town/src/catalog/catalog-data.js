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
 }
});
