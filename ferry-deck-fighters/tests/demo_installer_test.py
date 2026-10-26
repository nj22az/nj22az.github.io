from pathlib import Path
import tempfile,subprocess,os,shlex
root=Path.cwd();package=root/'ferry-deck-fighters/demo/Ferry-Deck-Fighters-Linux-Demo.tar.gz'
with tempfile.TemporaryDirectory(prefix='ferry-installer-') as temp:
 t=Path(temp);home=t/'home with spaces';home.mkdir();stubs=t/'commands';stubs.mkdir()
 curl=stubs/'curl';curl.write_text('#!/bin/sh\nwhile [ "$#" -gt 0 ]; do\n if [ "$1" = -o ]; then cp "$DEMO_TEST_PACKAGE" "$2"; exit; fi\n shift\ndone\nexit 1\n');curl.chmod(0o755)
 env=dict(os.environ,HOME=str(home),PATH=str(stubs)+':'+os.environ['PATH'],XDG_DATA_HOME=str(home/'data'),XDG_STATE_HOME=str(home/'state'),DEMO_TEST_PACKAGE=str(package))
 for i in range(2):subprocess.run(['sh',str(root/'install-ferry-demo.sh')],env=env,check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
 app=home/'data/applications/ferry-deck-fighters.desktop';assert app.exists();line=next(l[5:] for l in app.read_text().splitlines() if l.startswith('Exec='));launcher=shlex.split(line)[0];assert Path(launcher).is_file()
 env.update(SDL_VIDEODRIVER='offscreen',SDL_AUDIODRIVER='dummy',SDL_VIDEO_GL_DRIVER='libGL.so.1',MESA_GLES_VERSION_OVERRIDE='2.0')
 subprocess.run(['sh',launcher,'--pose','arena','--frames','1'],env=env,cwd='/tmp',check=True)
 bad=t/'bad.tar.gz';bad.write_bytes(b'invalid');env['DEMO_TEST_PACKAGE']=str(bad)
 check=subprocess.run(['sh',str(root/'install-ferry-demo.sh')],env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE);assert check.returncode!=0
 print('PASS clean install, repeat install, spaced user path, desktop launcher, native GLES2 run and checksum rejection')
