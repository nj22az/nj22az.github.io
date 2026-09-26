"""Publikt id-register: alla permanenta id med status och placeringar, utan skyddat innehåll."""
import json

PUBLIK = 'elev'


def filer(a):
    rader = []
    for r in a.con.execute('SELECT id, titel, typ, revision, status, publik FROM ovning ORDER BY id'):
        pub = r['publik'] == 'elev'
        pl = [{'yta': x['yta'], 'plats': x['plats'], 'nummer': x['nummer'], 'ankare': x['ankare']}
              for x in a.con.execute('SELECT * FROM placering WHERE ovning_id = ? ORDER BY yta, plats, ordning', (r['id'],))
              if pub and a.con.execute('SELECT publik FROM yta WHERE namn = ?', (x['yta'],)).fetchone()['publik'] == 'elev']
        rader.append({'id': r['id'], 'revision': r['revision'], 'status': r['status'], 'publik': r['publik'],
                      **({'titel': r['titel'], 'typ': r['typ'], 'placeringar': pl} if pub else {})})
    return {'innehall/ut/id-register.json': json.dumps({'beskrivning': 'Genererat ur sjoskolan/innehall. Skyddade poster visas bara med id och status.', 'poster': rader}, ensure_ascii=False, indent=1) + '\n'}
