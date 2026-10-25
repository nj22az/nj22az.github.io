"""CPU garment-fit sheet from actual game triangles. Not a WebGL screenshot."""
from pathlib import Path
import sys,json,math
import numpy as np
from PIL import Image,ImageDraw,ImageFont
cases=json.loads(Path(sys.argv[1]).read_text())['cases'];out=Path(sys.argv[2]);out.parent.mkdir(parents=True,exist_ok=True)
font='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';title=ImageFont.truetype(font,22);body=ImageFont.truetype(font,17);small=ImageFont.truetype(font,13)
W,H=340,470;im=Image.new('RGB',(W*3,H*2+80),'#f4f1e9');d=ImageDraw.Draw(im);d.text((20,12),'Shared swimwear fit',fill='#25423d',font=title);d.text((20,45),'Actual CPU geometry and vertex colours · neckline to feet · not a game screenshot.',fill='#596962',font=small)
az=math.radians(12);el=math.radians(5);R=np.array([math.cos(az),0,-math.sin(az)]);N=np.array([math.sin(az)*math.cos(el),math.sin(el),math.cos(az)*math.cos(el)]);U=np.cross(N,R);light=np.array([-.4,.7,.6]);light/=np.linalg.norm(light)
labels={'trunks':'Swimming trunks','onepiece':'One-piece swimsuit','skirted':'Skirted swimsuit'}
for i,c in enumerate(cases):
 x=(i%3)*W;y=80+(i//3)*H;scale=330/max(c['neck'],.1);polys=[]
 for t in c['triangles']:
  a=np.asarray(t['v']);n=np.cross(a[1]-a[0],a[2]-a[0]);mag=np.linalg.norm(n)
  if mag<1e-10:continue
  shade=.72+.28*abs(np.dot(n/mag,light));xy=np.stack([a@R,-a@U],axis=1)*scale+np.array([x+W/2,y+H-25]);polys.append((float(np.mean(a@N)),[tuple(v) for v in xy],tuple((np.array(t['c'])*shade).astype(int))))
 for _,xy,rgb in sorted(polys,key=lambda t:t[0]):d.polygon(xy,fill=rgb)
 d.text((x+18,y+10),c['name'],fill='#25423d',font=body);d.text((x+18,y+35),labels[c['style']],fill='#596962',font=small)
im.save(out);print(out)
