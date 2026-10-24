#!/bin/sh
set -eu
if [ "$(uname -s)" != Linux ] || [ "$(uname -m)" != x86_64 ]; then
 echo 'This installer is for Steam Deck and x86-64 Linux PCs.' >&2; exit 1
fi
command -v python3 >/dev/null 2>&1 || { echo 'Python 3 is required by this installer.' >&2; exit 1; }
python3 - "$@" <<'PY'
import os,json,hashlib,urllib.request,tarfile,tempfile,shlex,sys,threading,shutil
from pathlib import Path
version='0.2.19'
release='https://github.com/nj22az/nj22az.github.io/releases/download/johansson-world-linux-v'+version+'/'
def get(url):
 return urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Johansson-World-Installer'}),timeout=60)
class Progress:
 def __init__(self,title):
  self.title=title;self.label='Checking the release';self.total=0;self.received=0;self.done=threading.Event();self.lock=threading.Lock()
  self.animated=sys.stdout.isatty() and os.environ.get('TERM','')!='dumb' and not os.environ.get('JOHANSSON_NO_ANIMATION')
 def draw(self,tick=0):
  with self.lock:
   lamps=['O o o','o O o','o o O','o O o'][tick%4]
   detail=(f'  {min(100,self.received*100//self.total):3d}%  {self.received/1048576:.1f}/{self.total/1048576:.1f} MB' if self.total else '')
   line=f'  [{lamps}]  [_]  {self.label}{detail}'
   width=max(12,shutil.get_terminal_size((80,24)).columns-1)
   colour='' if os.environ.get('NO_COLOR') else '\033[38;5;81m'
   reset='' if not colour else '\033[0m'
   sys.stdout.write('\r\033[2K'+colour+line[:width]+reset);sys.stdout.flush()
 def spin(self):
  tick=0
  while not self.done.wait(.12):tick+=1;self.draw(tick)
 def __enter__(self):
  print(self.title,flush=True)
  if self.animated:
   sys.stdout.write('\033[?25l');self.draw();self.thread=threading.Thread(target=self.spin,daemon=True);self.thread.start()
  return self
 def stage(self,label,total=0):
  with self.lock:self.label=label;self.total=total;self.received=0
  if self.animated:self.draw()
  else:print(label+'…',flush=True)
 def advance(self,received):
  with self.lock:self.received=received
 def __exit__(self,kind,value,traceback):
  self.done.set()
  if self.animated:
   self.thread.join()
   with self.lock:sys.stdout.write('\r\033[2K\033[?25h');sys.stdout.flush()
  if kind is None:print('  [o o o]  [_]  Ding! Your island is ready.',flush=True)
  return False

# Steam's Library: Johansson World as a non-Steam game, so it is there in Gaming Mode (the owner, 24 October 2026).
def steam_vdf_read(data):
 # Steam's binary KeyValues: 0 map, 1 string, 2 int32, 3 float, 7 uint64, 8 end of map.
 pos=0
 def text():
  nonlocal pos
  end=data.index(b'\0',pos);value=data[pos:end].decode('utf-8','replace');pos=end+1;return value
 def table():
  nonlocal pos
  out=[]
  while True:
   kind=data[pos];pos+=1
   if kind==8:return out
   key=text()
   if kind==0:out.append((key,0,table()))
   elif kind==1:out.append((key,1,text()))
   elif kind in (2,3):out.append((key,kind,data[pos:pos+4]));pos+=4
   elif kind==7:out.append((key,7,data[pos:pos+8]));pos+=8
   else:raise ValueError('Unknown Steam shortcut field')
 return table()
def steam_vdf_write(items):
 out=bytearray()
 for key,kind,value in items:
  out.append(kind);out+=key.encode()+b'\0'
  if kind==0:out+=steam_vdf_write(value)
  elif kind==1:out+=value.encode()+b'\0'
  else:out+=value
 return bytes(out)+b'\x08'
def steam_running():
 for proc in Path('/proc').glob('[0-9]*'):
  try:
   if (proc/'comm').read_text().strip()=='steam':return True
  except OSError:pass
 return False
def steam_text_read(text):
 # Steam's text KeyValues: "key" "value" pairs and "key" { ... } blocks.
 import re
 tokens=re.findall(r'"((?:[^"\\]|\\.)*)"|([{}])',text);pos=0
 def block():
  nonlocal pos
  out=[]
  while pos<len(tokens):
   word,brace=tokens[pos];pos+=1
   if brace=='}':return out
   if brace=='{':raise ValueError('Unexpected { in Steam settings')
   nxt_word,nxt_brace=tokens[pos];pos+=1
   out.append((word,block() if nxt_brace=='{' else nxt_word))
  return out
 return block()
def steam_text_write(items,depth=0):
 pad='\t'*depth;out=''
 for key,value in items:
  if isinstance(value,list):out+=pad+'"'+key+'"\n'+pad+'{\n'+steam_text_write(value,depth+1)+pad+'}\n'
  else:out+=pad+'"'+key+'"\t\t"'+value+'"\n'
 return out
# Steam Input: the Deck's built-in "Gamepad with Camera Controls" layout, so the sticks and buttons reach the game as a
# gamepad. Without it Steam may guess a keyboard-and-mouse layout for a non-Steam game, and only the touch screen works.
STEAM_DECK_LAYOUT='controller_neptune_gamepad_fps.vdf'
def steam_gamepad_layout(root,account,name):
 configs=root/'steamapps/common/Steam Controller Configs'/account/'config'
 if not (root/'steamapps').is_dir():return False
 path=configs/'configset_controller_neptune.vdf';key=name.lower()
 if path.exists():
  raw=path.read_text(encoding='utf-8',errors='replace')
  try:top=steam_text_read(raw)
  except (ValueError,IndexError):print('Could not read',path,'- the controller layout was left unchanged.');return False
  if len(top)!=1 or not isinstance(top[0][1],list):print('Unexpected',path,'- the controller layout was left unchanged.');return False
  backup=configs/'configset_controller_neptune.vdf.before-johansson-world'
  if not backup.exists():backup.write_text(raw,encoding='utf-8')
  root_key,games=top[0]
 else:
  configs.mkdir(parents=True,exist_ok=True);root_key,games='controller_config',[]
 games=[(k,v) for k,v in games if k.lower()!=key]+[(key,[('template',STEAM_DECK_LAYOUT)])]
 temp=path.with_name('configset_controller_neptune.vdf.johansson-tmp');temp.write_text(steam_text_write([(root_key,games)]),encoding='utf-8');temp.replace(path)
 return True
def add_to_steam(launcher,icon):
 import struct,subprocess,time,zlib
 home=Path.home()
 roots=[home/'.local/share/Steam',home/'.steam/steam',home/'.var/app/com.valvesoftware.Steam/.local/share/Steam']
 configs=[]
 for root in roots:
  for user in sorted((root/'userdata').glob('[0-9]*')) if (root/'userdata').is_dir() else []:
   config=user/'config'
   if user.name!='0' and config.is_dir() and config.resolve() not in [c.resolve() for c in configs]:configs.append(config)
 manual='Steam: Add a Game > Add a Non-Steam Game > Johansson World (or Browse to '+str(launcher)+').'
 if not configs:print('Steam is not set up on this computer yet.',manual);return False
 if steam_running():
  print('Closing Steam for a moment to add Johansson World to your Library…',flush=True)
  try:subprocess.run(['steam','-shutdown'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,timeout=30)
  except (OSError,subprocess.SubprocessError):pass
  for _ in range(60):
   if not steam_running():break
   time.sleep(1)
  if steam_running():print('Steam is still open, so the Library entry was not added.',manual);return False
 name='Johansson World';exe='"'+str(launcher)+'"'
 appid=zlib.crc32((exe+name).encode())|0x80000000
 entry=[('appid',2,struct.pack('<I',appid)),('AppName',1,name),('Exe',1,exe),('StartDir',1,'"'+str(launcher.parent)+'"'),
  ('icon',1,str(icon)),('ShortcutPath',1,''),('LaunchOptions',1,''),('IsHidden',2,struct.pack('<i',0)),
  ('AllowDesktopConfig',2,struct.pack('<i',1)),('AllowOverlay',2,struct.pack('<i',1)),('OpenVR',2,struct.pack('<i',0)),
  ('Devkit',2,struct.pack('<i',0)),('DevkitGameID',1,''),('DevkitOverrideAppID',2,struct.pack('<i',0)),
  ('LastPlayTime',2,struct.pack('<i',0)),('FlatpakAppID',1,''),('tags',0,[])]
 added=layouts=0
 for config in configs:
  path=config/'shortcuts.vdf';shortcuts=[]
  if path.exists():
   raw=path.read_bytes()
   try:
    top=steam_vdf_read(raw)
    shortcuts=next(v for k,t,v in top if k.lower()=='shortcuts' and t==0)
   except (ValueError,IndexError,StopIteration):print('Could not read',path,'- it was left unchanged.',manual);continue
   backup=config/'shortcuts.vdf.before-johansson-world'
   if not backup.exists():backup.write_bytes(raw)
  def ours(fields):
   values={k:v for k,t,v in fields if t==1}
   return values.get('AppName',values.get('appname'))==name or values.get('Exe',values.get('exe'))==exe
  kept=[fields for k,t,fields in shortcuts if t==0 and not ours(fields)]
  kept.append(entry)
  data=steam_vdf_write([('shortcuts',0,[(str(i),0,fields) for i,fields in enumerate(kept)])])
  temp=path.with_name('shortcuts.vdf.johansson-tmp');temp.write_bytes(data);temp.replace(path);added+=1
  if steam_gamepad_layout(config.parent.parent.parent,config.parent.name,name):layouts+=1
 if added:print('Added Johansson World to your Steam Library. In Gaming Mode it is under Library > Non-Steam.')
 if layouts:print('Steam Input set to the Gamepad layout for Johansson World, so the sticks and buttons work in Gaming Mode.')
 return added>0

base=Path(os.environ.get('XDG_DATA_HOME',str(Path.home()/'.local/share')))/'johansson-world'
launcher=Path.home()/'.local/bin/johansson-world'
icon=base/'current/resources/app/site/desktop/icons/johansson-world-512.png'
if '--steam' in sys.argv[1:]:
 # Only the Steam Library entry, for a game that is already installed: sh install.sh --steam
 if not (base/'current').is_symlink() or not launcher.exists():raise SystemExit('Install Johansson World first, then run this again with --steam.')
 add_to_steam(launcher,icon);raise SystemExit(0)
if base.exists() and not (base/'.johansson-world-install').exists():
 raise SystemExit('An unrecognised folder already exists at '+str(base))
updating=(base/'current').is_symlink()
with Progress(('Updating' if updating else 'Installing')+' Johansson World '+version+' · a little island delivery') as progress:
 with get(release+'latest-linux.json') as response:manifest=json.load(response)
 expected=release+'johansson-world-linux-x64.tar.gz'
 if manifest.get('version')!=version or manifest.get('archiveUrl')!=expected or not isinstance(manifest.get('bytes'),int) or not 1024<manifest['bytes']<700*1024*1024 or len(manifest.get('sha256',''))!=64:
  raise SystemExit('Invalid release manifest. Nothing was installed.')
 base.mkdir(parents=True,exist_ok=True);(base/'.johansson-world-install').write_text('Johansson World Linux installation\n')
 versions=base/'versions';versions.mkdir(exist_ok=True);destination=versions/('v'+version)
 with tempfile.TemporaryDirectory(prefix='.install-',dir=versions) as work:
  work=Path(work);archive=work/'world.tar.gz';digest=hashlib.sha256();received=0
  progress.stage('Downloading Johansson World '+version,manifest['bytes'])
  with get(expected) as response,archive.open('wb') as output:
   while True:
    chunk=response.read(1024*1024)
    if not chunk:break
    received+=len(chunk)
    if received>manifest['bytes']:raise SystemExit('Unexpected download size.')
    digest.update(chunk);output.write(chunk);progress.advance(received)
  progress.stage('Checking the delivery · SHA-256')
  if received!=manifest['bytes'] or digest.hexdigest()!=manifest['sha256']:raise SystemExit('Download checksum failed. Your current game is unchanged.')
  progress.stage('Unpacking the island')
  if not destination.exists():
   extracted=work/'unpack';extracted.mkdir()
   with tarfile.open(archive) as tar:
    for member in tar.getmembers():
     if (member.name!='johansson-world' and not member.name.startswith('johansson-world/')) or '..' in Path(member.name).parts or member.name.startswith('/'):raise SystemExit('Invalid archive path.')
    if hasattr(tarfile,'data_filter'):tar.extractall(extracted,filter='data')
    else:tar.extractall(extracted)
   app=extracted/'johansson-world'
   if not (app/'JohanssonWorld').is_file():raise SystemExit('Incomplete game archive.')
   app.rename(destination)
 progress.stage('Switching to the new island')
 current=base/'current'
 if current.exists():
  previous=base/'previous'
  if previous.is_symlink():previous.unlink()
  previous.symlink_to(current.resolve())
 next_link=base/'current.next'
 if next_link.is_symlink():next_link.unlink()
 next_link.symlink_to(destination);next_link.replace(current)
 bin_dir=launcher.parent;bin_dir.mkdir(parents=True,exist_ok=True)
 launcher.write_text('#!/bin/sh\nexport JOHANSSON_INSTALL_ROOT='+shlex.quote(str(base))+'\nexec "$JOHANSSON_INSTALL_ROOT/current/JohanssonWorld" "$@"\n');launcher.chmod(0o755)
 apps=Path(os.environ.get('XDG_DATA_HOME',str(Path.home()/'.local/share')))/'applications';apps.mkdir(parents=True,exist_ok=True)
 quoted=str(launcher).replace('\\','\\\\').replace('"','\\"').replace('%','%%').replace('$','\\$').replace(chr(96),'\\'+chr(96))
 desktop=apps/'johansson-world.desktop'
 desktop.write_text('[Desktop Entry]\nType=Application\nName=Johansson World\nComment=Offline island life\nIcon='+str(icon)+'\nExec="'+quoted+'"\nTerminal=false\nCategories=Game;\n');desktop.chmod(0o755)
print('Installed Johansson World '+version+':',destination)
if os.environ.get('JOHANSSON_NO_STEAM') or not add_to_steam(launcher,icon):
 print('Steam shortcut artwork PNG:',icon)
print('Return to Gaming Mode to play. Leave forced Proton disabled; choose a Gamepad controller layout.')
print('Menu opens pause. Updates are in Settings > Check for updates.')
PY
