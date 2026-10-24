"""Byt upphöjda indexbokstäver (Xᴸ, Xᶜ, Uᴿ, Uꜰ) mot riktigt nedsänkt text (X_L ...) i alla bilder.
Användning: subscripts.py fil.pptx [fler.pptx]  (skriver över filerna)"""
import sys, copy, re
from pptx import Presentation
from pptx.oxml.ns import qn
MAP = {"ᴸ": "L", "ᶜ": "C", "ᴿ": "R", "ꜰ": "F"}
PAT = re.compile("([ᴸᶜᴿꜰ]+)")

def split_run(r):
    t = r.find(qn("a:t"))
    if t is None or not t.text or not PAT.search(t.text): return 0
    parts = [p for p in PAT.split(t.text) if p]
    rpr = r.find(qn("a:rPr"))
    prev = r
    for i, part in enumerate(parts):
        nr = copy.deepcopy(r)
        nt = nr.find(qn("a:t")); nt.text = "".join(MAP.get(ch, ch) for ch in part) if PAT.fullmatch(part) else part
        if PAT.fullmatch(part):
            pr = nr.find(qn("a:rPr"))
            if pr is None:
                pr = nr.makeelement(qn("a:rPr"), {}); nr.insert(0, pr)
            pr.set("baseline", "-25000")
        prev.addnext(nr); prev = nr
    r.getparent().remove(r)
    return 1

for f in sys.argv[1:]:
    prs = Presentation(f); n = 0
    for s in prs.slides:
        for r in list(s._element.iter(qn("a:r"))):
            n += split_run(r)
        for el in s._element.iter(qn("p:cNvPr")):  # formnamn: skriv index som vanliga bokstäver
            for attr in ("name", "descr"):
                v = el.get(attr)
                if v and PAT.search(v): el.set(attr, "".join(MAP.get(ch, ch) for ch in v))
    prs.save(f); print(f.split("/")[-1], n, "körningar")
