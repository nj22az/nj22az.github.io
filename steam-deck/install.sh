#!/bin/sh
set -eu
if [ "$(uname -s)" != Linux ] || [ "$(uname -m)" != x86_64 ]; then
 echo 'This installer is for Steam Deck and x86-64 Linux PCs.' >&2; exit 1
fi
command -v python3 >/dev/null 2>&1 || { echo 'Python 3 is required by this installer.' >&2; exit 1; }
python3 - <<'PY'
import os,json,hashlib,urllib.request,tarfile,tempfile,shlex
from pathlib import Path
version='0.2.2'
release='https://github.com/nj22az/nj22az.github.io/releases/download/johansson-world-linux-v'+version+'/'
def get(url):
 return urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Johansson-World-Installer'}),timeout=60)
print('Downloading Johansson World offline Linux edition…',flush=True)
with get(release+'latest-linux.json') as response:manifest=json.load(response)
expected=release+'johansson-world-linux-x64.tar.gz'
if manifest.get('version')!=version or manifest.get('archiveUrl')!=expected or not isinstance(manifest.get('bytes'),int) or not 1024<manifest['bytes']<700*1024*1024 or len(manifest.get('sha256',''))!=64:
 raise SystemExit('Invalid release manifest. Nothing was installed.')
base=Path(os.environ.get('XDG_DATA_HOME',str(Path.home()/'.local/share')))/'johansson-world'
if base.exists() and not (base/'.johansson-world-install').exists():
 raise SystemExit('An unrecognised folder already exists at '+str(base))
base.mkdir(parents=True,exist_ok=True);(base/'.johansson-world-install').write_text('Johansson World Linux installation\n')
versions=base/'versions';versions.mkdir(exist_ok=True);destination=versions/('v'+version)
with tempfile.TemporaryDirectory(prefix='.install-',dir=versions) as work:
 work=Path(work);archive=work/'world.tar.gz';digest=hashlib.sha256();received=0
 with get(expected) as response,archive.open('wb') as output:
  while True:
   chunk=response.read(1024*1024)
   if not chunk:break
   received+=len(chunk)
   if received>manifest['bytes']:raise SystemExit('Unexpected download size.')
   digest.update(chunk);output.write(chunk)
 if received!=manifest['bytes'] or digest.hexdigest()!=manifest['sha256']:raise SystemExit('Download checksum failed. Your current game is unchanged.')
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
print('Installed:',destination)
print('Steam: Add a Game > Add a Non-Steam Game > Johansson World.')
print('If not listed, Browse to:',launcher)
print('Leave forced Proton disabled. Choose a Gamepad controller layout.')
print('Start opens the pause menu; L3 hides the HUD. Updates are inside the pause menu.')
PY
