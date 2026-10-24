from pathlib import Path
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4,landscape
from reportlab.lib.utils import ImageReader
from pypdf import PdfReader,PdfWriter
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
for n,f in [("R","DejaVuSans.ttf"),("B","DejaVuSans-Bold.ttf")]:pdfmetrics.registerFont(TTFont(n,"/usr/share/fonts/truetype/dejavu/"+f))
P=Path(__file__).resolve().parent
shots=[('Counter overview','Sakura-Operations-Counter','Four supported additions; retained till, coin tray, scanner, gum and oden remain.'),('Paperwork and tethered pen','Sakura-Operations-Paperwork','Three stepped trays; pen and tether remain within the measured worktop envelope.'),('Harbour cat charity box','Sakura-Operations-Cats','Original illustrated acrylic box with coin slot. Environmental dressing only.'),('Karashi beside the oden','Sakura-Operations-Mustard','Eight mustard sachets in a staff-served holder. Live hand contacts remain unverified.')]
W,H=landscape(A4);temp=P/'implementation/review-pages.pdf';c=canvas.Canvas(str(temp),pagesize=(W,H))
for i,(title,stem,caption) in enumerate(shots):
 im=Image.open(P/'implementation'/f'{stem}.png').convert('RGB');dest=P/'implementation'/f'{stem}.jpg';im.save(dest,quality=80,optimize=True)
 c.setFillColorRGB(.97,.96,.92);c.rect(0,0,W,H,fill=1,stroke=0);c.setFillColorRGB(.13,.27,.21);c.setFont('B',22);c.drawString(28,H-38,title)
 c.setFont('R',10);c.drawString(28,H-57,'Sakura counter operations / 24 October 2026 / actual built game / opt-in candidate')
 iw=min(W-56,(H-160)*1280/800);c.drawImage(str(dest),(W-iw)/2,76,width=iw,height=iw*800/1280)
 c.setFont('R',10);c.drawString(28,43,caption);c.setFont('R',9);c.drawString(28,26,f'{i+1} / 6  |  Software Chromium capture; no physical-device or FPS acceptance')
 c.showPage()
c.save();writer=PdfWriter()
for path in [temp,P/'Sakura-Counter-Operations-CAD.pdf',P.parent/'sakura-stair-chain/Sakura-Stair-Chain-CAD.pdf']:writer.append(PdfReader(path))
with (P/'Sakura-Counter-Operations-Review.pdf').open('wb') as f:writer.write(f)
temp.unlink()
print((P/'Sakura-Counter-Operations-Review.pdf').stat().st_size)
