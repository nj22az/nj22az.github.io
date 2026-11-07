"""Hash public release resources against this exact worktree (no browser claim)."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import urllib.request,json,hashlib
ROOT=Path(__file__).resolve().parents[2]
WORLD=ROOT/'johansson-town'
COMMIT='ebe94688d88a3553605107672e141ae85430418d'
manifest=json.loads((WORLD/'runtime/.vite/manifest.json').read_text())
boot=manifest['src/boot.js']['file']
compiled=[p for p in (WORLD/'runtime').glob('*.js')if b'navigation-feeder-v2.glb' in p.read_bytes()]
assert len(compiled)==1
paths=['index.html','sw.js','runtime/source.json','assets/models/ferry-bridge/navigation-feeder-v2.glb','assets/models/ferry-bridge/bridge-wipers-v1.glb','src/world/ferry-model.js','src/world/ferry-bridge-lantern.js','src/world/ferry-bridge-lantern-plan.js','runtime/'+boot,'runtime/'+compiled[0].name]
def check(path):
 expected=hashlib.sha256((WORLD/path).read_bytes()).hexdigest();url='https://nj22az.github.io/johansson-town/'+path+'?release='+COMMIT
 row={'path':path,'url':url,'expectedSha256':expected}
 try:
  request=urllib.request.Request(url,headers={'Cache-Control':'no-cache'})
  with urllib.request.urlopen(request,timeout=40)as response:data=response.read();row.update(status=response.status,bytes=len(data),actualSha256=hashlib.sha256(data).hexdigest())
  row['matches']=row['actualSha256']==expected
 except Exception as e:row.update(matches=False,error=type(e).__name__+': '+str(e))
 return row
with ThreadPoolExecutor(max_workers=5)as pool:rows=list(pool.map(check,paths))
result={'implementationCommit':COMMIT,'scope':'Public resource byte verification with release query; not a browser/device test','matches':sum(r['matches']for r in rows),'total':len(rows),'resources':rows}
Path(__file__).with_name('live-byte-verification.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({'matches':result['matches'],'total':len(rows),'failures':[r for r in rows if not r['matches']]}))
