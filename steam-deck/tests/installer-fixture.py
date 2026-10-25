"""Exercise the real one-file installer with local release transport and isolated home."""
import os,sys,io,json,tarfile,hashlib,tempfile,urllib.request
from pathlib import Path
mode=sys.argv[1]
version=json.loads(Path(__file__).resolve().parents[1].joinpath('package.json').read_text())['version']
source=Path(__file__).resolve().parents[1].joinpath('install.sh').read_text().split("python3 - \"$@\" <<'PY'\n",1)[1].rsplit('\nPY',1)[0]
with tempfile.TemporaryDirectory() as folder:
 home=Path(folder);os.environ['HOME']=folder;os.environ['XDG_DATA_HOME']=str(home/'data');os.environ['TERM']='xterm-256color';os.environ['NO_COLOR']='1'
 base=home/'data/johansson-world';old=base/'versions/v0.2.4';old.mkdir(parents=True)
 (base/'.johansson-world-install').write_text('test');(base/'current').symlink_to(old)
 save=home/'data/saved-progress.json';save.write_text('keep-my-island')
 # A Steam account that already has another non-Steam game; Steam is not running in the fixture.
 steam_config=home/'.local/share/Steam/userdata/12345/config';steam_config.mkdir(parents=True)
 other=b'\x00shortcuts\x00\x000\x00\x02appid\x00\x01\x00\x00\x80\x01AppName\x00Other Game\x00\x01Exe\x00"/opt/other"\x00\x00tags\x00\x08\x08\x08\x08'
 (steam_config/'shortcuts.vdf').write_bytes(other)
 layouts=home/'.local/share/Steam/steamapps/common/Steam Controller Configs/12345/config';layouts.mkdir(parents=True)
 layout_before='"controller_config"\n{\n\t"284160"\n\t{\n\t\t"template"\t\t"controller_neptune_gamepad_fps.vdf"\n\t}\n}\n'
 (layouts/'configset_controller_neptune.vdf').write_text(layout_before)
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
  assert 'Updating Johansson World '+version in text and 'Downloading Johansson World '+version in text and 'Ding!' in text
  if mode=='plain':assert '\x1b' not in text
  else:assert '\x1b[?25l' in text and '\x1b[?25h' in text and 'SHA-256' in text
  # The Library entry sits beside the other game, once, even after a second run with --steam.
  vdf=steam_config/'shortcuts.vdf';assert (steam_config/'shortcuts.vdf.before-johansson-world').read_bytes()==other
  def entries():
   g={};exec(compile(source.split("\nbase=Path(",1)[0],'installer-functions','exec'),g);top=g['steam_vdf_read'](vdf.read_bytes())
   return [{k:v for k,t,v in fields if t==1} for _,_,fields in top[0][2]]
  first=entries();assert [e['AppName'] for e in first]==['Other Game','Johansson World'],first
  assert first[1]['Exe']=='"'+str(home/'.local/bin/johansson-world')+'"' and first[1]['icon'].endswith('johansson-world-512.png')
  assert 'Added Johansson World to your Steam Library' in text
  def layout():
   g={};exec(compile(source.split("\nbase=Path(",1)[0],'installer-functions','exec'),g)
   return g['steam_text_read']((layouts/'configset_controller_neptune.vdf').read_text())
  assert layout()==[('controller_config',[('284160',[('template','controller_neptune_gamepad_fps.vdf')]),('johansson world',[('template','controller_neptune_johansson_world.vdf')])])],layout()
  assert (layouts/'configset_controller_neptune.vdf.before-johansson-world').read_text()==layout_before
  assert 'Steam Input set to Johansson World - Steam Deck' in text
  template=home/'.local/share/Steam/controller_base/templates/controller_neptune_johansson_world.vdf'
  g={};exec(compile(source.split("\nbase=Path(",1)[0],'installer-functions','exec'),g)
  assert template.read_text()==g['STEAM_DECK_LAYOUT_DATA']
  mapping=g['steam_text_read'](template.read_text())[0][1]
  groups={dict(v)['id']:dict(v) for k,v in mapping if k=='group'}
  bindings=dict(dict(next(v for k,v in mapping if k=='preset'))['group_source_bindings'])
  for i,input_source,out,source_mode in [('2','joystick','1','joystick_move'),('3','right_joystick','2','joystick_move'),('7','left_trackpad','1','joystick_move'),('8','right_trackpad','2','mouse_joystick')]:
   assert bindings[i]==input_source+' active'
   assert groups[i]['mode']==source_mode and dict(groups[i]['settings'])['output_joystick']==out
  assert dict(groups['4']['settings'])['output_trigger']=='1' and dict(groups['5']['settings'])['output_trigger']=='2'
  assert len(bindings)==9 and dict(mapping)['controller_type']=='controller_neptune'
  template_before=template.read_text()
  sys.argv=['-','--steam'];sys.stdout=io.StringIO()
  try:exec(compile(source,'actual-linux-installer','exec'),{'__name__':'__main__'})
  except SystemExit as done:assert not done.code,done.code
  finally:sys.stdout=original
  assert template.read_text()==template_before,'Layout installation is idempotent'
  assert entries()==first,'A second run does not duplicate the Library entry'
  assert [k for k,_ in layout()[0][1]]==['284160','johansson world'],'nor the controller layout'
 print(json.dumps({'mode':mode,'passed':True,'transcript':text}))
