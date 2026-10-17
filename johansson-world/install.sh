#!/bin/sh
set -eu
if [ "$(uname -s)" != Linux ] || [ "$(uname -m)" != x86_64 ]; then
 echo 'This installer is for Steam Deck and x86-64 Linux PCs.' >&2; exit 1
fi
command -v python3 >/dev/null 2>&1 || { echo 'Python 3 is required by this installer.' >&2; exit 1; }
python3 - <<'PY'
import os,json,hashlib,urllib.request,tarfile,tempfile,shlex,sys,time,shutil
from pathlib import Path
version='0.2.3'
release='https://github.com/nj22az/nj22az.github.io/releases/download/johansson-world-linux-v'+version+'/'
def get(url):
 try:return urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Johansson-World-Installer'}),timeout=60)
 except Exception as error:raise SystemExit('Download failed: '+str(error)+'. Check your connection and run the installer again.')
print('Johansson World · Linux installer',flush=True)
print('( ^_^)ﾉ  Thuan: Let’s bring the island along!',flush=True)
print('Checking release information…',flush=True)
with get(release+'latest-linux.json') as response:manifest=json.load(response)
expected=release+'johansson-world-linux-x64.tar.gz'
if manifest.get('version')!=version or manifest.get('archiveUrl')!=expected or not isinstance(manifest.get('bytes'),int) or not 1024<manifest['bytes']<700*1024*1024 or len(manifest.get('sha256',''))!=64:
 raise SystemExit('Invalid release manifest. Nothing was installed.')
base=Path(os.environ.get('XDG_DATA_HOME',str(Path.home()/'.local/share')))/'johansson-world'
if base.exists() and not (base/'.johansson-world-install').exists():
 raise SystemExit('An unrecognised folder already exists at '+str(base))
base.mkdir(parents=True,exist_ok=True);(base/'.johansson-world-install').write_text('Johansson World Linux installation\n')
versions=base/'versions';versions.mkdir(exist_ok=True);destination=versions/('v'+version)
animation_lines=0
def progress(label,done,total,started,last,final=False):
 global animation_lines
 now=time.monotonic()
 if not final and now-last[0]<.25:return
 last[0]=now
 fraction=min(1,done/max(1,total));filled=int(fraction*24)
 bar=label+' ['+'#'*filled+'-'*(24-filled)+'] '+f'{fraction:6.1%}'
 if label=='Downloading':
  elapsed=max(.01,now-started);speed=done/elapsed;eta=(total-done)/max(1,speed)
  timing='arrived!' if final else 'calculating time...' if not done else f'~{int(eta//60)}m {int(eta%60):02d}s left'
  details=f'{done/1048576:.1f}/{total/1048576:.1f} MiB  {speed/1048576:.2f} MiB/s  '+timing
 else:details=f'{done}/{total} files unpacked'
 animated=sys.stdout.isatty() and os.environ.get('TERM','')!='dumb'
 if animated:
  columns=max(24,shutil.get_terminal_size((80,24)).columns-1)
  track=min(42,columns);offset=int(fraction*max(0,track-11));space=' '*offset
  lines=['MINATO  >  YOUR STEAM DECK',space+'   |\\',space+' __|_\\__',space+' \\_______/',('~' if int((now-started)*4)%2 else '-')*track,bar,details,('( ^_^)ﾉ  Thuan: We made it!' if final else '(ง •̀_•́)ง  Thuan: All aboard!') if label=='Downloading' else '( •̀ᴗ•́ )و  Johansson: Unpacking!']
  if animation_lines:sys.stdout.write(f'\033[{animation_lines}A')
  for line in lines:sys.stdout.write('\r\033[2K'+line[:columns]+'\n')
  sys.stdout.flush();animation_lines=0 if final else len(lines)
 else:print(bar+'  '+details,flush=True)
print(f"Download size: {manifest['bytes']/1048576:.1f} MiB. Connecting to GitHub…",flush=True)
with tempfile.TemporaryDirectory(prefix='.install-',dir=versions) as work:
 work=Path(work);archive=work/'world.tar.gz';digest=hashlib.sha256();received=0
 with get(expected) as response,archive.open('wb') as output:
  started=time.monotonic();last=[0]
  progress('Downloading',0,manifest['bytes'],started,last)
  while True:
   chunk=response.read(64*1024)
   if not chunk:break
   received+=len(chunk)
   if received>manifest['bytes']:raise SystemExit('Unexpected download size.')
   digest.update(chunk);output.write(chunk)
   progress('Downloading',received,manifest['bytes'],started,last)
 progress('Downloading',received,manifest['bytes'],started,last,final=True)
 print('( •̀ᴗ•́ )و  Johansson: Checking the cargo…',flush=True)
 print('Verifying download checksum…',flush=True)
 if received!=manifest['bytes'] or digest.hexdigest()!=manifest['sha256']:raise SystemExit('Download checksum failed. Your current game is unchanged.')
 if not destination.exists():
  extracted=work/'unpack';extracted.mkdir()
  print('Checksum verified. Extracting game files…',flush=True)
  with tarfile.open(archive) as tar:
   members=tar.getmembers()
   for member in members:
    if (member.name!='johansson-world' and not member.name.startswith('johansson-world/')) or '..' in Path(member.name).parts or member.name.startswith('/'):raise SystemExit('Invalid archive path.')
   started=time.monotonic();last=[0]
   for index,member in enumerate(members,1):
    if hasattr(tarfile,'data_filter'):tar.extract(member,extracted,filter='data')
    else:tar.extract(member,extracted)
    progress('Extracting',index,len(members),started,last,final=index==len(members))
  app=extracted/'johansson-world'
  if not (app/'JohanssonWorld').is_file():raise SystemExit('Incomplete game archive.')
  app.rename(destination)
print('Setting up launcher and Steam shortcut…',flush=True)
current=base/'current'
if current.exists():
 previous=base/'previous'
 if previous.is_symlink():previous.unlink()
 previous.symlink_to(current.resolve())
next_link=base/'current.next'
if next_link.is_symlink():next_link.unlink()
next_link.symlink_to(destination);next_link.replace(current)
bin_dir=Path.home()/'.local/bin';bin_dir.mkdir(parents=True,exist_ok=True)
launcher=bin_dir/'johansson-world'
launcher.write_text('#!/bin/sh\nexport JOHANSSON_INSTALL_ROOT='+shlex.quote(str(base))+'\nexec "$JOHANSSON_INSTALL_ROOT/current/JohanssonWorld" "$@"\n');launcher.chmod(0o755)
apps=Path(os.environ.get('XDG_DATA_HOME',str(Path.home()/'.local/share')))/'applications';apps.mkdir(parents=True,exist_ok=True)
quoted=str(launcher).replace('\\','\\\\').replace('"','\\"').replace('%','%%').replace('$','\\$').replace(chr(96),'\\'+chr(96))
desktop=apps/'johansson-world.desktop'
desktop.write_text('[Desktop Entry]\nType=Application\nName=Johansson World\nComment=Offline island life and Harbour Festival\nExec="'+quoted+'"\nTerminal=false\nCategories=Game;\n');desktop.chmod(0o755)
print('Installation complete. (ﾉ◕ヮ◕)ﾉ*:･ﾟ✧',flush=True)
print('The island is ready. Welcome aboard!',flush=True)
print('Installed:',destination)
print('Steam: Add a Game > Add a Non-Steam Game > Johansson World.')
print('If not listed, Browse to:',launcher)
print('Leave forced Proton disabled. Choose a Gamepad controller layout.')
print('Start opens the pause menu; L3 hides the HUD. Updates are inside the pause menu.')
PY
