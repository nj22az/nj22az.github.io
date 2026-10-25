"""Render exported CPU triangles for inspection, not a WebGL screenshot.
python avatar-creator/render-skirt-motion-diagnostic.py before.json after.json output-directory
"""
import json,sys,math
from pathlib import Path
import numpy as np
from PIL import Image,ImageDraw,ImageFont
before=json.loads(Path(sys.argv[1]).read_text());after=json.loads(Path(sys.argv[2]).read_text());out=Path(sys.argv[3]);out.mkdir(parents=True,exist_ok=True)
font_path='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
font=ImageFont.truetype(font_path,17);small=ImageFont.truetype(font_path,13);title=ImageFont.truetype(font_path,21)
az=math.radians(25);el=math.radians(9);R=np.array([math.cos(az),0,-math.sin(az)]);N=np.array([math.sin(az)*math.cos(el),math.sin(el),math.cos(az)*math.cos(el)]);U=np.cross(N,R);light=np.array([-.4,.7,.6]);light/=np.linalg.norm(light)
W,H=480,570;scale=580;centreY=.34

def picture(frame,label):
 im=Image.new('RGB',(W,H),'#f4f1e9');d=ImageDraw.Draw(im);d.text((20,18),label,fill='#25423d',font=title)
 triangles=[]
 for kind,colour in [('body',np.array([160,164,159])),('cloth',np.array([48,75,99]))]:
  for face in frame[kind]:
   a=np.asarray(face);normal=np.cross(a[1]-a[0],a[2]-a[0]);mag=np.linalg.norm(normal)
   if mag<1e-10:continue
   shade=.65+.35*abs(np.dot(normal/mag,light));xy=np.stack([a@R,-(a@U-centreY)],axis=1)*scale+np.array([W/2,H/2+30]);triangles.append((float(np.mean(a@N)),[tuple(x) for x in xy],tuple((colour*shade).astype(int))))
 for _,xy,c in sorted(triangles,key=lambda t:t[0]):d.polygon(xy,fill=c)
 d.rectangle((0,0,W,65),fill='#f4f1e9');d.text((20,18),label,fill='#25423d',font=title)
 d.text((20,H-37),'Shared skirt, hips and legs · calculated triangles',fill='#596962',font=small)
 return im
frames=[]
for a,b in zip(before['frames'],after['frames']):
 im=Image.new('RGB',(W*2,H+64),'#f4f1e9');im.paste(picture(a,'Before · averaged stride'),(0,64));im.paste(picture(b,'After · per-leg follow'),(W,64));d=ImageDraw.Draw(im);d.text((20,10),'Skirt movement diagnostic',fill='#25423d',font=title);d.text((20,37),'CPU geometry comparison; not a game screenshot or shader review.',fill='#596962',font=small);d.line((W,75,W,H+40),fill='#b9c5bc',width=1);frames.append(im)
frames[3].save(out/'skirt-motion-comparison.png');frames[0].save(out/'skirt-motion-comparison.gif',save_all=True,append_images=frames[1:],duration=167,loop=0,optimize=True)
# Four paired samples at half scale, in timeline order.
sheet=Image.new('RGB',(960,634),'#f4f1e9')
for j,i in enumerate([0,3,6,9]):sheet.paste(frames[i].resize((480,317)),((j%2)*480,(j//2)*317))
sheet.save(out/'skirt-motion-contact.png')
print(json.dumps({'frames':len(frames),'size':[W*2,H+64],'files':[p.name for p in out.glob('skirt-motion-comparison.*')]}))
