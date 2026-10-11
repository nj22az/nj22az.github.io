"""Kryptering av skyddade innehållsfiler (NJENC1), via lib/krypto.mjs och Node."""
import os
import subprocess
import tempfile
from pathlib import Path

MJS = Path(__file__).with_name('krypto.mjs')


class Losenordsfel(Exception):
    pass


def dekryptera(fil, losen):
    r = subprocess.run(['node', str(MJS), 'dekryptera', str(fil)], env={**os.environ, 'LOSEN': losen}, capture_output=True)
    if r.returncode:
        raise Losenordsfel(r.stderr.decode().strip() or 'dekryptering misslyckades')
    return r.stdout


def kryptera(data, fil, losen):
    """Krypterar data (bytes) till fil. Filen lämnas orörd om klartexten inte har ändrats. Returnerar True om filen skrevs."""
    with tempfile.NamedTemporaryFile(delete=False) as t:
        t.write(data)
    try:
        r = subprocess.run(['node', str(MJS), 'kryptera', t.name, str(fil)], env={**os.environ, 'LOSEN': losen}, capture_output=True, text=True)
    finally:
        os.unlink(t.name)
    if r.returncode:
        raise Losenordsfel(r.stderr.strip())
    return r.stdout.strip() == 'krypterad'
