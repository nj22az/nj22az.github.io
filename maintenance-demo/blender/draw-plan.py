"""Illustrative bounding-envelope review; not manufacturer or pressure-design CAD."""
import json
from pathlib import Path
root=Path(__file__).resolve().parent
items=json.loads((root/'catalogue.json').read_text())
rows=[]
for i,a in enumerate(items):
 w,d,h=a['envelopeMm']; y=80+i*190;scale=min(400/w,115/h)
 rows.append(f'<g transform="translate(30,{y})"><text y="0" font-size="18">{a["label"]}</text><rect x="0" y="20" width="{w*scale}" height="{h*scale}" fill="#edf4fc" stroke="#1d1d1f"/><text x="10" y="45">Front envelope</text><text x="10" y="{h*scale+44}" font-size="14">W {w} × D {d} × H {h} mm · illustrative</text><rect x="460" y="20" width="{w*scale}" height="{d*scale}" fill="#f5f5f7" stroke="#1d1d1f"/><text x="470" y="45">Plan envelope</text></g>')
(root/'equipment-envelopes.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" width="940" height="880" viewBox="0 0 940 880"><rect width="940" height="880" fill="white"/><g font-family="sans-serif" fill="#1d1d1f"><text x="30" y="35" font-size="22">Equipment illustration envelopes · revision A</text><text x="30" y="60" font-size="14">Illustrative equipment only. No nameplate data, pressure design or manufacturer dimensions.</text>'+''.join(rows)+'</g></svg>')
assert len({a['id'] for a in items})==len(items)
assert all(all(isinstance(n,(int,float)) and n>0 for n in a['envelopeMm']) for a in items)
(root/'ENVELOPE-REVIEW.md').write_text('# Illustration envelope review A\n\nFour generic equipment types. Millimetre envelopes are declared visual budgets, not real measurements. Pump: shared base aligns motor, guarded coupling and pump shaft; both flanges remain exposed. Compressor: receiver supported above feet, motor/pump on mounting deck, drain/gauge/outlet visible. Generator: common skid, enclosed alternator/coupling and side access to controls; exhaust is illustrative. Probe: readout, connector, flexible lead and probe distinguish the assembly. No building, installation, clearance or pressure-design approval is represented.\n\nThe exporter records actual mesh bounds and triangle totals for checking against these envelopes. Models contain no inferred PS, TS, volume, fluid group, category, inspection interval or legal decision. Review actual Blender renders before delivery.\n')
