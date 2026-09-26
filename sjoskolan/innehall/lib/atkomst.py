"""Åtkomstlagret. Alla exportörer hämtar innehåll härifrån, aldrig direkt ur JSON-filerna.

Åtkomsten öppnas för en publik. En elevyta får bara elevinnehåll: lärar- och bokfält tas bort här,
så att en exportör inte av misstag kan skriva skyddat innehåll till en öppen fil.
"""
import json
import sqlite3

import katalog as K

PUBLIKER = {'elev': {'elev'}, 'larare': {'elev', 'larare'}, 'bok': {'elev', 'bok'}, 'alla': {'elev', 'larare', 'bok'}}


class Atkomstfel(Exception):
    pass


class Atkomst:
    def __init__(self, con, publik='elev'):
        if isinstance(con, str):
            con = sqlite3.connect(con)
        self.con = con
        self.con.row_factory = sqlite3.Row
        self.publik = publik
        self.tillatet = PUBLIKER[publik]
        self.meta = dict(self.con.execute('SELECT nyckel, varde FROM meta').fetchall())
        oppnat = set(self.meta.get('skyddat', '-').split(',')) - {'-'}
        saknas = (self.tillatet - {'elev'}) - oppnat
        if saknas:
            raise Atkomstfel(f'databasen är byggd utan {", ".join(sorted(saknas))}-innehåll (lösenordet saknades vid bygget)')

    # ------------------------------------------------------------------ övningar
    def ovning(self, id_):
        r = self.con.execute('SELECT data FROM ovning WHERE id = ?', (id_,)).fetchone()
        if r is None:
            raise Atkomstfel(f'okänd övning {id_}')
        return self._filtrera(json.loads(r['data']))

    def _filtrera(self, p):
        publik = p['referenser']['publik']
        if publik not in self.tillatet:
            raise Atkomstfel(f'{p["id"]} har publik {publik} och får inte visas för {self.publik}')
        pub, skyddat = K.dela_skyddat(p)
        ut = pub if pub is not None else p
        for s, d in skyddat.items():
            if s in self.tillatet and publik == 'elev':
                ut = K.djup_merge(ut, d)
        return ut

    def finns(self, id_):
        return self.con.execute('SELECT 1 FROM ovning WHERE id = ?', (id_,)).fetchone() is not None

    def alla(self, typ=None):
        q = 'SELECT data FROM ovning' + (' WHERE typ = ?' if typ else '') + ' ORDER BY id'
        ut = []
        for r in self.con.execute(q, (typ,) if typ else ()):
            p = json.loads(r['data'])
            if p['referenser']['publik'] in self.tillatet:
                ut.append(self._filtrera(p))
        return ut

    # ------------------------------------------------------------------ placeringar
    def placeringar(self, yta, plats=None, del_=None, roll=None):
        """Placeringar på en yta i visningsordning, som (placering, övning)."""
        y = self.con.execute('SELECT publik FROM yta WHERE namn = ?', (yta,)).fetchone()
        if y is None:
            raise Atkomstfel(f'okänd yta {yta}')
        if y['publik'] not in self.tillatet:
            raise Atkomstfel(f'ytan {yta} har publik {y["publik"]}')
        q, a = 'SELECT * FROM placering WHERE yta = ?', [yta]
        for k, v in (('plats', plats), ('del', del_), ('roll', roll)):
            if v is not None:
                q += f' AND {k} = ?'
                a.append(v)
        rader = self.con.execute(q + ' ORDER BY plats, del, ordning', a).fetchall()
        ut = []
        for r in rader:
            pl = dict(r)
            pl['alias'] = [x['alias'] for x in self.con.execute('SELECT alias FROM alias WHERE yta = ? AND ovning_id = ?', (yta, r['ovning_id']))]
            ut.append((pl, self.ovning(r['ovning_id'])))
        return ut

    def platser(self, yta):
        return [r[0] for r in self.con.execute('SELECT DISTINCT plats FROM placering WHERE yta = ? ORDER BY plats', (yta,))]

    def delar(self, yta, plats=None):
        q, a = 'SELECT DISTINCT del FROM placering WHERE yta = ?', [yta]
        if plats:
            q += ' AND plats = ?'
            a.append(plats)
        return [r[0] for r in self.con.execute(q + ' ORDER BY del', a)]

    def placering_for(self, id_, yta):
        r = self.con.execute('SELECT * FROM placering WHERE ovning_id = ? AND yta = ? ORDER BY ordning', (id_, yta)).fetchone()
        return dict(r) if r else None

    def alias(self, yta):
        return {r['alias']: r['ovning_id'] for r in self.con.execute('SELECT alias, ovning_id FROM alias WHERE yta = ?', (yta,))}

    # ------------------------------------------------------------------ teori och mål
    def teori(self, id_):
        r = self.con.execute('SELECT * FROM teori WHERE id = ?', (id_,)).fetchone()
        return dict(r) if r else None

    def mal(self, id_):
        r = self.con.execute('SELECT * FROM mal WHERE id = ?', (id_,)).fetchone()
        return dict(r) if r else None

    @property
    def utgava(self):
        """Utgåvans fingeravtryck för den här publiken (skyddade ändringar syns inte i elevutgåvan)."""
        return self.meta['fingeravtryck_publikt' if self.publik == 'elev' else 'fingeravtryck'][:12]
