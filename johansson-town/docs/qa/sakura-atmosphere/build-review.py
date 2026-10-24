from pathlib import Path
from io import BytesIO
import sys,json
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
pdfmetrics.registerFont(TTFont('SakuraRegular','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'))
pdfmetrics.registerFont(TTFont('SakuraBold','/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'))
from reportlab.lib.pagesizes import A4,landscape
from reportlab.lib.utils import ImageReader
from pypdf import PdfReader,PdfWriter
P=Path(__file__).resolve().parent;shots=Path(sys.argv[1]);out=Path(sys.argv[2]);out.parent.mkdir(parents=True,exist_ok=True);D=json.loads((P/'schedule.json').read_text());W,H=landscape(A4);buffer=BytesIO();c=canvas.Canvas(buffer,pagesize=(W,H))
def header(n,title,caption):
 c.setFillColorRGB(.97,.96,.92);c.rect(0,0,W,H,fill=1,stroke=0);c.setFillColorRGB(.14,.27,.21);c.setFont('SakuraBold',19);c.drawString(25,H-35,title);c.setFont('SakuraRegular',10);c.drawString(25,H-54,caption);c.setFont('SakuraRegular',8);c.drawString(25,18,'SAKURA SHOTEN / ATM REV '+D['revision']+' / ACTUAL BUILT GAME / 24 OCT 2026');c.drawRightString(W-25,18,f'{n} / 8')
def image(path,x,y,w,h):
 im=Image.open(path).convert('RGB');im.thumbnail((1200,800));jpg=BytesIO();im.save(jpg,'JPEG',quality=68,optimize=True);jpg.seek(0);iw,ih=im.size;sc=min(w/iw,h/ih);c.drawImage(ImageReader(jpg),x+(w-iw*sc)/2,y+(h-ih*sc)/2,iw*sc,ih*sc)
header(1,'Roof: before and after','Same game camera, clock and weather. The existing exterior box and roof access geometry are retained.')
w=(W-65)/2
for label,path,x in [('BEFORE',P.parent/'sakura-posters-roof/implementation/Sakura-Roof-Tank.jpg',25),('AFTER',shots/'Sakura-Atmosphere-Roof.png',40+w)]:
 c.setFont('SakuraBold',12);c.drawString(x,H-88,label);image(path,x,185,w,275)
c.setFont('SakuraRegular',11);c.drawString(25,135,'32 service tiles, a quiet perimeter finish and subtle contact at the supported tank feet.');c.drawString(25,114,'No new lights, global post-processing effect, roof walking level or hydraulic simulation.');c.showPage()
views=[('Oden','Hot food, original coin tray and a crayon POP tag','The front-counter oden vat remains; the white rear block is now an open handwash basin.'),('Supplies','Everyday utensils in clear acrylic','Existing cups, bags and chopsticks retained; straws and wrapped wet wipes added within the measured worktop.'),('Chiller','A cooler chiller and a real purchase gap','Original packaging and prices. Two rice balls bought through normal checkout; shelf count 24 to 22.'),('Crates','The service yard starts telling a story','Three empty moulded return crates under the stair, with original Sakura / Higa markings.'),('Counter','The familiar counter, with small practical detail','All four approved posters, 20 wall notices and original product / stock IDs retained.')]
for n,(name,title,caption) in enumerate(views,2):
 header(n,title,caption);image(shots/('Sakura-Atmosphere-'+name+'.png'),25,37,W-50,H-108);c.showPage()
c.save();buffer.seek(0);writer=PdfWriter();writer.append(PdfReader(buffer));writer.append(PdfReader(P/'Sakura-Atmosphere-CAD.pdf'));writer.add_metadata({'/Title':'Sakura Shoten - Atmosphere Review','/Subject':'Actual game views, before/after roof and audited CAD. Physical-device and full candidate flicker acceptance remain open.'})
with out.open('wb')as f:writer.write(f)
assert len(PdfReader(out).pages)==8
print(out,out.stat().st_size)
