#!/usr/bin/env python3
"""Build a reproducible portable demo from the glibc 2.17 x86-64 build."""
import gzip
import hashlib
import io
import tarfile
from pathlib import Path

root = Path(__file__).resolve().parents[1]
out = root / 'demo'
out.mkdir(exist_ok=True)
name = 'Ferry-Deck-Fighters-Linux-Demo.tar.gz'
files = {
    'bin/ferry-deck-fighters': root/'build/demo-x86/ferry-deck-fighters',
    'Launch-Ferry-Deck-Fighters.sh': root/'packaging/linux/Launch-Ferry-Deck-Fighters.sh',
    'README.txt': root/'packaging/linux/README.txt',
}
for path in (root/'assets').rglob('*'):
    if path.is_file() and path.suffix in ('.gz', '.json'):
        files[str(path.relative_to(root))] = path
with (out/name).open('wb') as stream, gzip.GzipFile(filename='', fileobj=stream, mode='wb', mtime=0) as compressed:
    with tarfile.open(fileobj=compressed, mode='w') as archive:
        for dest, path in sorted(files.items()):
            data = path.read_bytes()
            info = tarfile.TarInfo('ferry-deck-fighters/'+dest)
            info.size = len(data)
            info.mode = 0o755 if dest.startswith('bin/') or dest.endswith('.sh') else 0o644
            info.mtime = 0
            archive.addfile(info, io.BytesIO(data))
digest = hashlib.sha256((out/name).read_bytes()).hexdigest()
(out/(name+'.sha256')).write_text(digest+'  '+name+'\n')
print(digest, name, (out/name).stat().st_size)
