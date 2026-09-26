-- Sjöskolan · innehållsdatabas, grundschema. Databasen genereras ur katalogen och redigeras aldrig direkt.
CREATE TABLE meta (nyckel TEXT PRIMARY KEY, varde TEXT NOT NULL);
CREATE TABLE ovning (
  id TEXT PRIMARY KEY CHECK (id GLOB 'EL-[0-9][0-9][0-9][0-9][0-9][0-9]'),
  typ TEXT NOT NULL, titel TEXT NOT NULL, revision INTEGER NOT NULL CHECK (revision >= 1),
  status TEXT NOT NULL, publik TEXT NOT NULL CHECK (publik IN ('elev', 'larare', 'bok')),
  niva TEXT, hash TEXT NOT NULL, data TEXT NOT NULL
);
CREATE TABLE skyddat_falt (ovning_id TEXT NOT NULL REFERENCES ovning(id), skydd TEXT NOT NULL, falt TEXT NOT NULL, PRIMARY KEY (ovning_id, skydd, falt));
CREATE TABLE yta (namn TEXT PRIMARY KEY, titel TEXT NOT NULL, publik TEXT NOT NULL, exportor TEXT);
CREATE TABLE placering (
  nr INTEGER PRIMARY KEY, yta TEXT NOT NULL REFERENCES yta(namn), ovning_id TEXT NOT NULL REFERENCES ovning(id),
  plats TEXT NOT NULL, del TEXT, ordning INTEGER NOT NULL, nummer TEXT, ankare TEXT, bild INTEGER, stodbild INTEGER, roll TEXT
);
CREATE TABLE alias (yta TEXT NOT NULL, alias TEXT NOT NULL, ovning_id TEXT NOT NULL REFERENCES ovning(id), PRIMARY KEY (yta, alias));
CREATE TABLE teori (id TEXT PRIMARY KEY, titel TEXT NOT NULL, kalla TEXT NOT NULL, url TEXT, kapitel INTEGER, ankare TEXT, bild INTEGER);
CREATE TABLE mal (id TEXT PRIMARY KEY, text TEXT NOT NULL, prov TEXT);
CREATE TABLE ovning_teori (ovning_id TEXT NOT NULL REFERENCES ovning(id), teori_id TEXT NOT NULL REFERENCES teori(id), ordning INTEGER NOT NULL, PRIMARY KEY (ovning_id, teori_id));
CREATE TABLE ovning_mal (ovning_id TEXT NOT NULL REFERENCES ovning(id), mal_id TEXT NOT NULL REFERENCES mal(id), PRIMARY KEY (ovning_id, mal_id));
CREATE TABLE parameter (ovning_id TEXT NOT NULL REFERENCES ovning(id), namn TEXT NOT NULL, varde TEXT NOT NULL, enhet TEXT, PRIMARY KEY (ovning_id, namn));
CREATE TABLE svar (ovning_id TEXT NOT NULL REFERENCES ovning(id), ordning INTEGER NOT NULL, storhet TEXT NOT NULL, varde TEXT, enhet TEXT, berakning TEXT, PRIMARY KEY (ovning_id, ordning));
CREATE TABLE variant (ovning_id TEXT NOT NULL REFERENCES ovning(id), slag TEXT NOT NULL, variant_id TEXT NOT NULL, PRIMARY KEY (ovning_id, slag));
CREATE INDEX placering_yta ON placering (yta, plats, del, ordning);
CREATE INDEX placering_ovning ON placering (ovning_id);
