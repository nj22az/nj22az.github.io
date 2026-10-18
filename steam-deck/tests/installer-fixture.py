"""Exercise the real one-file installer with local release transport and isolated home."""
import os,sys,io,json,tarfile,hashlib,tempfile,urllib.request
from pathlib import Path
mode=sys.argv[1]
version=json.loads(Path(__file__).resolve().parents[1].joinpath('package.json').read_text())['version']
source=Path(__file__).resolve().parents[1].joinpath('install.sh').read_text().split("python3 - <<'PY'\n",1)[1].rsplit('\nPY',1)[0]
with tempfile.TemporaryDirectory() as folder:
 home=Path(folder);os.environ['HOME']=folder;os.environ['XDG_DATA_HOME']=str(home/'data');os.environ['TERM']='xterm-256color';os.environ['NO_COLOR']='1'
 base=home/'data/johansson-world';old=base/'versions/v0.2.4';old.mkdir(parents=True)
 (base/'.johansson-world-install').write_text('test');(base/'current').symlink_to(old)
 save=home/'data/saved-progress.json';save.write_text('keep-my-island')
 buffer=io.BytesIO()
 with tarfile.open(fileobj=buffer,mode='w:gz') as t:
  for name,data in [('JohanssonWorld',b'#!/bin/sh\nexit 0\n'),('padding',os.urandom(4096)),('resources/app/site/desktop/icons/johansson-world-512.png',b'png-fixture')]:
   info=tarfile.TarInfo('johansson-world/'+name);info.size=len(data);info.mode=0o755 if name=='JohanssonWorld' else 0o644;t.addfile(info,io.BytesIO(data))
 archive=buffer.getvalue();sha=hashlib.sha256(archive).hexdigest()
 url='https://github.com/nj22az/nj22az.github.io/releases/download/johansson-world-linux-v'+version+'/'
 manifest={'version':version,'archiveUrl':url+'johansson-world-linux-x64.tar.gz','bytes':len(archive),'sha256':'0'*64 if mode=='bad' else sha}
 def fetch(request,timeout=0):
  assert request.full_url in [url+'latest-linux.json',manifest['archiveUrl']]
  return io.BytesIO(json.dumps(manifest).encode() if request.full_url.endswith('.json') else archive)
 urllib.request.urlopen=fetch
 class Output(io.StringIO):
  def isatty(self):return mode!='plain'
 output=Output();original=sys.stdout;sys.stdout=output;failed=False
 try:exec(compile(source,'actual-linux-installer','exec'),{'__name__':'__main__'})
 except SystemExit:failed=True
 finally:sys.stdout=original
 text=output.getvalue()
 assert save.read_text()=='keep-my-island'
 if mode=='bad':
  assert failed and (base/'current').resolve()==old.resolve() and not (base/('versions/v'+version)).exists()
  assert '\x1b[?25h' in text and 'Ding!' not in text
 else:
  assert not failed and (base/'current').resolve()==(base/('versions/v'+version)).resolve()
  assert (base/'previous').resolve()==old.resolve()
  assert os.access(base/'current/JohanssonWorld',os.X_OK)
  assert 'Icon=' in (home/'data/applications/johansson-world.desktop').read_text()
  assert 'Updating Johansson World' in text and 'Ding!' in text
  if mode=='plain':assert '\x1b' not in text
  else:assert '\x1b[?25l' in text and '\x1b[?25h' in text and 'SHA-256' in text
 print(json.dumps({'mode':mode,'passed':True,'transcript':text}))
