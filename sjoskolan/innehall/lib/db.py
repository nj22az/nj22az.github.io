"""Bygger SQLite-databasen ur katalogen. Schemat definieras av migreringar/NNN_*.sql (PRAGMA user_version).

Databasen är en genererad representation. Den byggs om helt vid varje `innehall.py bygg` och redigeras aldrig.
"""
import json
import sqlite3
from pathlib import Path

import katalog as K

MIGRERINGAR = K.ROT / 'migreringar'
DATATABELLER = ['variant', 'svar', 'parameter', 'ovning_mal', 'ovning_teori', 'mal', 'teori', 'alias', 'placering', 'yta', 'skyddat_falt', 'ovning', 'meta']


def migreringar():
    return sorted((int(f.name[:3]), f) for f in MIGRERINGAR.glob('[0-9][0-9][0-9]_*.sql'))


def oppna(fil):
    """Öppnar databasen och kör de migreringar som saknas."""
    Path(fil).parent.mkdir(parents=True, exist_ok=True)
    con = sqlite3.connect(fil)
    con.execute('PRAGMA foreign_keys = ON')
    nu = con.execute('PRAGMA user_version').fetchone()[0]
    for nr, f in migreringar():
        if nr > nu:
            con.executescript(f.read_text(encoding='utf-8'))
            con.execute(f'PRAGMA user_version = {nr}')
    con.commit()
    return con


def bygg(kat, fil):
    """Skriver hela katalogen till databasen. Returnerar anslutningen."""
    con = oppna(fil)
    with con:
        for t in DATATABELLER:
            con.execute(f'DELETE FROM {t}')
        meta = {'schema_version': K.SCHEMA_VERSION, 'db_version': migreringar()[-1][0], 'fingeravtryck': kat.fingeravtryck(),
                'fingeravtryck_publikt': kat.fingeravtryck(bara_publikt=True), 'skyddat': ','.join(sorted(kat.skyddat)) or '-'}
        con.executemany('INSERT INTO meta VALUES (?, ?)', [(k, str(v)) for k, v in meta.items()])
        for m, d in kat.teori['mal'].items():
            con.execute('INSERT INTO mal VALUES (?, ?, ?)', (m, d['text'], d.get('prov')))
        for t, d in kat.teori['teori'].items():
            con.execute('INSERT INTO teori VALUES (?, ?, ?, ?, ?, ?, ?)', (t, d['titel'], d['kalla'], d.get('url'), d.get('kapitel'), d.get('ankare'), d.get('bild')))
        for i, p in kat.poster.items():
            con.execute('INSERT INTO ovning VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                        (i, p['typ'], p['titel'], p['revision'], p['granskning']['status'], p['referenser']['publik'],
                         p['larande'].get('niva'), K.hash_av(p), K.kanonisk(p)))
            _, skyddat = K.dela_skyddat(p)
            for s, d in skyddat.items():
                for falt in (d if p['referenser']['publik'] == 'elev' else {'*': 1}):
                    con.execute('INSERT INTO skyddat_falt VALUES (?, ?, ?)', (i, s, falt))
            for n, t in enumerate(p['larande'].get('teori', []), 1):
                con.execute('INSERT INTO ovning_teori VALUES (?, ?, ?)', (i, t, n))
            for m in p['larande'].get('mal', []):
                con.execute('INSERT INTO ovning_mal VALUES (?, ?)', (i, m))
            for namn, d in (p.get('parametrar') or {}).items():
                con.execute('INSERT INTO parameter VALUES (?, ?, ?, ?)', (i, namn, json.dumps(d['varde']), d.get('enhet')))
            for n, s in enumerate((p.get('losning') or {}).get('svar', []), 1):
                con.execute('INSERT INTO svar VALUES (?, ?, ?, ?, ?, ?)', (i, n, s['storhet'], json.dumps(s.get('varde')), s.get('enhet'), s.get('berakning')))
            for slag in ('fysisk_variant', 'simulerad_variant'):
                v = (p.get('labb') or {}).get(slag)
                if v and v in kat.poster:
                    con.execute('INSERT INTO variant VALUES (?, ?, ?)', (i, slag.split('_')[0], v))
        for namn, y in kat.ytor.items():
            con.execute('INSERT INTO yta VALUES (?, ?, ?, ?)', (namn, y['titel'], y['publik'], y.get('exportor')))
            for pl in y['placeringar']:
                if pl['ovning'] not in kat.poster:
                    continue  # skyddad post som inte är öppnad
                extra = {k: pl[k] for k in ('former', 'kontroll') if k in pl}
                con.execute('INSERT INTO placering (yta, ovning_id, plats, del, ordning, nummer, ankare, bild, stodbild, roll, extra) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
                            (namn, pl['ovning'], pl['plats'], pl.get('del'), pl['ordning'], pl.get('nummer'), pl.get('ankare'), pl.get('bild'), pl.get('stodbild'), pl.get('roll'),
                             json.dumps(extra, ensure_ascii=False) if extra else None))
                for a in pl.get('alias', []):
                    con.execute('INSERT OR IGNORE INTO alias VALUES (?, ?, ?)', (namn, a, pl['ovning']))
    return con
