"""Compact actual-game review; run after tools/sakura-rebuild-review.mjs --posters."""
from pathlib import Path
from io import BytesIO
import sys
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import landscape,A4
from reportlab.lib.utils import ImageReader
from pypdf import PdfReader,PdfWriter
p=Path(__file__).resolve().parent
shots=Path(sys.argv[1]);out=Path(sys.argv[2]);out.parent.mkdir(parents=True,exist_ok=True)
w,h=landscape(A4);buf=BytesIO();c=canvas.Canvas(buf,pagesize=(w,h))
views=[('Sakura-Campaign-Counter','Playful campaigns at the counter','Three A2 prints; original 48-slot dispenser, hot food and notices retained.'),('Sakura-Tissue-Diva','Tissue Diva at the magazine corner','The absurd tissue advertisement sits above magazines, before the fresh-food chiller.'),('Sakura-Roof-Exterior','One storey, seen in the actual town','Old upper shell and escape ladder removed in this review candidate.'),('Sakura-Roof-Tank','Tank, supports and separate pipe routes','1200 mm tank body on a 350 mm stand; fill, supply, overflow, scour and vent geometry.'),('Sakura-Rear-Stair','Roof-only service stair on the existing apron','22 equal rises; 1000 mm treads, 956 mm between rails; outer passage 855 mm including steel.'),('Sakura-Front-Exterior','The retained family-shop frontage','Cream walls, timber sign, tiled hood, awning and original street dressing.'),('Sakura-Campaign-Mobile','Portrait viewport check','390 x 844 software Chromium capture; this is not physical iPad or FPS acceptance.')]
for i,(name,title,caption) in enumerate(views):
 c.setFillColorRGB(.97,.96,.92);c.rect(0,0,w,h,fill=1,stroke=0);c.setFillColorRGB(.12,.25,.2)
 c.setFont('Helvetica-Bold',19);c.drawString(25,h-35,title);c.setFont('Helvetica',10);c.drawString(25,h-55,caption)
 im=Image.open(shots/(name+'.png')).convert('RGB');im.thumbnail((1280,844));jpg=BytesIO();im.save(jpg,'JPEG',quality=72,optimize=True);jpg.seek(0)
 iw,ih=im.size;scale=min((w-50)/iw,(h-108)/ih);c.drawImage(ImageReader(jpg),(w-iw*scale)/2,39+(h-108-ih*scale)/2,iw*scale,ih*scale)
 c.setFont('Helvetica',8);c.drawString(25,19,'SAKURA SHOTEN / ACTUAL BUILT GAME / DRAFT PR #378 / 23 OCT 2026');c.drawRightString(w-25,19,f'{i+1} / 8');c.showPage()
c.save();buf.seek(0);writer=PdfWriter();writer.append(PdfReader(buf));writer.append(PdfReader(p/'Sakura-Site-Correction-Rev-C.pdf'))
writer.add_metadata({'/Title':'Sakura Shoten - Poster and Roof Implementation Review','/Subject':'Actual-game captures and CAD correction. Roof/stair are scenery; no traversal, real engineering or physical-device acceptance.'})
with out.open('wb') as f:writer.write(f)
assert len(PdfReader(out).pages)==8
print(str(out),out.stat().st_size)
