#!/usr/bin/env python3
"""Arbetsmapp för boken *Elteknik och ellära för sjöfart och industri*.

Bokens redigerbara källa finns inte i något repository. Den publicerade EPUB-filen (elteknik/files/bok.epub.enc) är en
strukturerad, regenererbar form och används som arbetskopia. Klartexten ligger i bok/.bok/ (i .gitignore) och checkas aldrig in.

    BOKLOSEN=… python3 sjoskolan/innehall/bok/bok.py packa-upp     dekryptera och packa upp EPUB (och PDF) till bok/.bok/
    BOKLOSEN=… python3 sjoskolan/innehall/bok/bok.py granska       jämför bokens övningar med databasen, skriv ANDRINGAR.md
    BOKLOSEN=… python3 sjoskolan/innehall/bok/bok.py packa         packa EPUB ur bok/.bok/epub/ och kryptera tillbaka

PDF:en (7×10-tums sättning) kan inte byggas om härifrån: sättningsverktyget finns inte i repot. Efter ändringar i EPUB:en
måste PDF:en sättas om utanför repot. Se README.md.
"""
import json
import os
import shutil
import sys
import zipfile
from pathlib import Path

HAR = Path(__file__).resolve().parent
ROT = HAR.parent
REPO = ROT.parents[1]
ARB = HAR / '.bok'
FILER = REPO / 'elteknik' / 'files'
sys.path[:0] = [str(ROT / 'lib'), str(ROT / 'migrering')]
import krypto  # noqa: E402


def losen():
    p = os.environ.get('BOKLOSEN')
    if not p:
        raise SystemExit('Ange bokens lösenord i miljövariabeln BOKLOSEN.')
    return p


def packa_upp():
    ARB.mkdir(exist_ok=True)
    for namn in ('bok.epub', 'bok.pdf'):
        (ARB / namn).write_bytes(krypto.dekryptera(FILER / f'{namn}.enc', losen()))
    if (ARB / 'epub').exists():
        shutil.rmtree(ARB / 'epub')
    with zipfile.ZipFile(ARB / 'bok.epub') as z:
        z.extractall(ARB / 'epub')
    print(f'uppackad: {ARB}/epub (ligger i .gitignore, checka aldrig in)')


def packa():
    rot = ARB / 'epub'
    if not rot.exists():
        raise SystemExit('kör packa-upp först')
    ut = ARB / 'bok.ny.epub'
    with zipfile.ZipFile(ut, 'w') as z:
        z.write(rot / 'mimetype', 'mimetype', compress_type=zipfile.ZIP_STORED)  # EPUB kräver mimetype först, okomprimerad
        for f in sorted(rot.rglob('*')):
            if f.is_file() and f.name != 'mimetype':
                z.write(f, f.relative_to(rot).as_posix(), compress_type=zipfile.ZIP_DEFLATED)
    # Oförändrat innehåll ger oförändrad fil, även om zip-arkivets byte skulle skilja sig (tidsstämplar, ordning).
    if (ARB / 'bok.epub').exists() and innehall(ARB / 'bok.epub') == innehall(ut):
        ut.unlink()
        print('boken är oförändrad, inget skrivs')
        return
    ut.replace(ARB / 'bok.epub')
    data = (ARB / 'bok.epub').read_bytes()
    skrev = krypto.kryptera(data, FILER / 'bok.epub.enc', losen())
    m = json.loads((FILER / 'manifest.json').read_text(encoding='utf-8'))
    m['epub_bytes'] = len(data)
    (FILER / 'manifest.json').write_text(json.dumps(m, indent=2) + '\n', encoding='utf-8')
    print('bok.epub.enc ' + ('uppdaterad' if skrev else 'oförändrad') + f', {len(data)} byte. PDF:en måste sättas om separat.')


def innehall(epub):
    with zipfile.ZipFile(epub) as z:
        return {n: z.read(n) for n in z.namelist()}


def granska():
    """Skillnader mellan bokens övningstext och databasens poster: det som ska rättas i boken."""
    os.environ['BOK_EPUB_DIR'] = str(ARB / 'epub')
    import kallor
    import katalog as K
    import text as T
    kat = K.Katalog()
    bok = kallor.bok_ovningar()
    N = T.normalisera
    rader = []
    for b in bok.values():
        i = f'EL-{(b["kapitel"] - 1) * 10 + b["nr"]:06d}'
        p = kat.poster.get(i)
        if p is None:
            continue
        u = p['uppgift']
        jf = [('titel', N(b['titel']), p['titel']), ('uppgift', N(b['fraga']), u['fraga']),
              ('samband', ' '.join(N(x) for x in (b['samband_rader'] or [])), ' '.join(u.get('samband', []))),
              ('förutsättningar', N(b['givet']), u.get('givet')),
              ('metod', N(b['metod']), ' '.join(l['text'] for l in p.get('ledtradar', []) if l.get('i_bok', True)))]
        for falt, gammal, ny in jf:
            if (gammal or '') != (ny or ''):
                rader.append((i, f'{b["kapitel"]}.{b["nr"]}', falt, gammal, ny))
        if p['granskning']['status'] == 'att-granska':
            rader.append((i, f'{b["kapitel"]}.{b["nr"]}', 'svar (granskning)', N(b['svar']), p['granskning'].get('kommentar')))
    md = ['# Ändringar som boken behöver', '', f'Genererat av `bok.py granska` mot databasen ({len(kat.poster)} poster). '
          'Databasen är källan; raderna nedan är vad EPUB:en fortfarande har i äldre form. Bokexportören (`innehall.py bygg bok`) skriver in dem i EPUB:en.', '',
          f'{len(rader)} fält i {len({r[0] for r in rader})} övningar.', '']
    for i, nr, falt, gammal, ny in rader:
        md += [f'## {nr} · {i} · {falt}', '', f'- Boken: {gammal}', f'- Databasen: {ny}', '']
    (HAR / 'ANDRINGAR.md').write_text('\n'.join(md), encoding='utf-8')
    print(f'{len(rader)} skillnader, se {HAR / "ANDRINGAR.md"}')


if __name__ == '__main__':
    {'packa-upp': packa_upp, 'packa': packa, 'granska': granska}[sys.argv[1]]()
