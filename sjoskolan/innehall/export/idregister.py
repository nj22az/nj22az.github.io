"""Publikt id-register: alla permanenta id med revision och placeringar, utan skyddat innehåll.

Skyddade poster listas med id, revision och publik ur katalogens id-register (som alltid är komplett),
så att filen blir densamma oavsett om lösenorden fanns vid bygget.
"""
import json
from pathlib import Path

PUBLIK = 'elev'
REGISTER = Path(__file__).resolve().parents[1] / 'id-register.json'


def filer(a):
    reg = json.loads(REGISTER.read_text(encoding='utf-8'))['poster']
    rader = []
    for i, r in sorted(reg.items()):
        if r['skydd'] != 'elev':
            rader.append({'id': i, 'revision': r['revision'], 'publik': r['skydd']})
            continue
        o = a.con.execute('SELECT titel, typ, status FROM ovning WHERE id = ?', (i,)).fetchone()
        pl = [{'yta': x['yta'], 'plats': x['plats'], 'nummer': x['nummer'], 'ankare': x['ankare']}
              for x in a.con.execute('SELECT * FROM placering WHERE ovning_id = ? ORDER BY yta, plats, ordning', (i,))
              if a.con.execute('SELECT publik FROM yta WHERE namn = ?', (x['yta'],)).fetchone()['publik'] == 'elev']
        rader.append({'id': i, 'revision': r['revision'], 'status': o['status'], 'publik': 'elev', 'titel': o['titel'], 'typ': o['typ'], 'placeringar': pl})
    return {'innehall/ut/id-register.json': json.dumps({'beskrivning': 'Genererat ur sjoskolan/innehall. Skyddade poster visas bara med id, revision och publik.', 'poster': rader}, ensure_ascii=False, indent=1) + '\n'}
