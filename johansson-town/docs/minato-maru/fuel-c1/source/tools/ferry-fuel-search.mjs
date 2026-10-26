/** Offline candidate search. Result must be revalidated, not trusted as a construction spool. */
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {FERRY_INTERIOR as I,FERRY_ENGINE_ROOM as E} from '../src/world/ferry-interior.js';
import {FERRY_SHIP as S} from '../src/world/ferry-ship.js';
import {FERRY_PIPING as P} from '../src/world/ferry-piping.js';
import {routeFuelDesign} from '../src/world/ferry-fuel-design.js';
globalThis.FUEL_SEARCH_LOG=true;
globalThis.FUEL_SEARCH_SEED=fs.existsSync('/tmp/fuel-c1-checkpoint.json')?JSON.parse(fs.readFileSync('/tmp/fuel-c1-checkpoint.json')):{};
const checkpoint={};globalThis.FUEL_SEARCH_CHECKPOINT=(key,result)=>{checkpoint[key]=result;fs.writeFileSync('/tmp/fuel-c1-checkpoint.json',JSON.stringify(checkpoint));};
const baselinePath=process.argv[2]||fileURLToPath(new URL('../docs/minato-maru/cad-revb/Minato_Maru_RevB/data/ferry_source_snapshot.json',import.meta.url));
const raw=JSON.parse(fs.readFileSync(baselinePath,'utf8'));
const baseline={routes:raw.routes||raw.interior.engineeringPipes};
const obstacles=I.boxes.filter(b=>b.solid&&b.name&&!/side|deckhead|bulkhead|trunk|casing|partition|escape|plates/.test(b.name));
const design=routeFuelDesign(P.find(s=>s.id==='fuel'),I.anchors,E,S.length/2,S.draft,obstacles,baseline.routes.filter(r=>r.system!=='fuel'));
fs.writeFileSync('/tmp/fuel-c1-search.json',JSON.stringify(design,null,2));
console.log(design.routes.length,'clear',design.issues.length,'open');
