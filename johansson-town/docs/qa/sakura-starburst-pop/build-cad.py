from pathlib import Path
import json,math,html,os
from fontTools.pens.svgPathPen import SVGPathPen
import ezdxf
from fontTools.ttLib import TTFont
P=Path(__file__).resolve().parent
ROOT=P.parents[2]
cards=json.loads((ROOT/'src/world/interiors/sakura-starburst-pop.json').read_text())
old=json.loads((ROOT/'docs/qa/sakura-shelf-stickers/capture-report.json').read_text())['stickers']
font_path=os.environ.get('SAKURA_JP_FONT','/dev/shm/SakuraJapanese.ttf');original=TTFont(font_path);glyphs=original.getGlyphSet();cmap=original.getBestCmap();units=original['head'].unitsPerEm;

doc=ezdxf.new('R2010',setup=True);doc.units=4
for n,c in [('CUT',3),('MESSAGE_SAFE',4),('DIMENSIONS',8),('TEXT',7)]:doc.layers.new(n,dxfattribs={'color':c})
ms=doc.modelspace();parts=[]
def text(x,y,t,size=3,color='#344e48',anchor='start',font='DejaVu Sans'):
 if font=='POP':
  scale=size/units;total=sum(glyphs[cmap[ord(ch)]].width for ch in t)*scale;cursor=x-total/2
  for i,ch in enumerate(t):
   name=cmap[ord(ch)];pen=SVGPathPen(glyphs);glyphs[name].draw(pen)
   parts.append(f'<path d="{pen.getCommands()}" fill="{color}" stroke="{color}" stroke-width="25" stroke-linejoin="round" transform="translate({cursor},{y+math.sin(i*2.3)*.25}) rotate({math.sin(i*1.7)*2}) scale({scale},{-scale})"/>');cursor+=glyphs[name].width*scale
  return
 parts.append(f'<text x="{x}" y="{y}" font-family="{font}" font-size="{size}" fill="{color}" text-anchor="{anchor}">{html.escape(t)}</text>')
def line(x,y,x2,y2):parts.append(f'<path d="M{x},{y} L{x2},{y2}" stroke="#899a90" stroke-width=".25"/>')
def dim(x,y,w,label):
 line(x,y,x+w,y)
 for a in [x,x+w]:line(a,y-1.5,a,y+1.5)
 text(x+w/2,y-1.5,label,2.5,anchor='middle')
parts.append('<rect width="420" height="297" fill="#fbfaf5"/>');line(12,12,408,12)
text(16,25,'SAKURA / HANDWRITTEN STARBURST POP',6)
text(16,34,'JW-SAK-POP-01  /  REV A  /  23 OCT 2026  /  A3 at 100%  /  profiles 1:2',3)
placements=[]
for i,c in enumerate(cards):
 cx=76+(i%3)*134;cy=83+(i//3)*98;w,h=c['width_mm'],c['height_mm'];pts=[]
 for k in range(24):
  a=k*math.pi/12-math.pi/2;r=1 if k%2==0 else .72;pts.append([round(math.cos(a)*w/2*r,3),round(math.sin(a)*h/2*r,3)])
 c['outline_mm']=pts
 parts.append('<polygon points="'+' '.join(f'{cx+x*.5},{cy+y*.5}' for x,y in pts)+f'" fill="{c["paper"]}" stroke="{c["ink"]}" stroke-width=".4"/>')
 text(cx,cy-2,c['lines'][0],5,c['ink'],'middle','POP');text(cx,cy+5,c['lines'][1],5,c['ink'],'middle','POP')
 dim(cx-w/4,cy+h/4+7,w/2,f'{w} x {h} mm')
 text(cx,cy+h/4+15,c['code']+' / '+c['id'].upper(),3.5,anchor='middle');text(cx,cy+h/4+21,c['message'],2.8,anchor='middle')
 ox=(i%3)*260;oy=-(i//3)*220;ms.add_lwpolyline([(ox+x,oy-y) for x,y in pts],close=True,dxfattribs={'layer':'CUT'})
 ms.add_lwpolyline([(ox-w*.29,oy-h*.22),(ox+w*.29,oy-h*.22),(ox+w*.29,oy+h*.22),(ox-w*.29,oy+h*.22)],close=True,dxfattribs={'layer':'MESSAGE_SAFE'})
 ms.add_text(c['code']+' '+c['message'],dxfattribs={'height':6,'insert':(ox-w/2,oy-h/2-28),'layer':'TEXT'})
 ms.add_linear_dim(base=(ox-w/2,oy-h/2-12),p1=(ox-w/2,oy-h/2),p2=(ox+w/2,oy-h/2),dimstyle='EZDXF',dxfattribs={'layer':'DIMENSIONS'}).render()
 prev=next(l for l in old if l['id']==c['id'] and l['kind']=='decoration');shelf=next(l for l in old if l['id']==c['id'] and l['kind']=='price')
 along=prev['along']+prev['width']/2-w/2000;pos=[round(prev['position'][0]+math.cos(prev['yaw'])*(along-prev['along']),5),round(shelf['level']-.0075-h/2000,5),round(prev['position'][2]-math.sin(prev['yaw'])*(along-prev['along']),5)]
 placements.append({**c,'room_center_m':pos,'yaw':prev['yaw'],'shelf_level_m':shelf['level']+.35 if c['id'] in ['rice','bento','pudding'] else shelf['level']+.32,'mount':'Two tape tabs on shelf lip; top 7.5 mm below selected middle deck. Price ticket stays separate.'})
 # Correct level selection: old decoration record already identifies the middle deck.
 placements[-1]['shelf_level_m']=prev['level'];placements[-1]['room_center_m'][1]=round(prev['level']-.0075-h/2000,5)
line(16,245,404,245);text(16,255,'SHELF MOUNT: 2 small tape tabs. Top of card 7.5 mm below deck; no aisle stalk.',3)
text(16,263,'Six starbursts replace six rectangular cards. Keep the 96 ordinary price tickets readable.',3)
text(16,271,'No discount or limited-stock claim. Crayon text stays within the inner safe area.',3)
text(16,284,'CAD profiles in mm, model space 1:1. Shelf positions in the placement JSON. Candidate branch only.',2.7)
svg='<svg xmlns="http://www.w3.org/2000/svg" width="420mm" height="297mm" viewBox="0 0 420 297">'+''.join(parts)+'</svg>'
(P/'Sakura-Starburst-POP-CAD.svg').write_text(svg);doc.saveas(P/'Sakura-Starburst-POP-CAD.dxf')
(ROOT/'src/world/interiors/sakura-starburst-pop.json').write_text(json.dumps(cards,ensure_ascii=False,indent=2)+'\n')
(P/'placements.json').write_text(json.dumps(placements,ensure_ascii=False,indent=2)+'\n')
assert len(placements)==6
assert not ezdxf.readfile(P/'Sakura-Starburst-POP-CAD.dxf').audit().has_errors
print('CAD FIRST: six closed cut profiles, DXF audit zero errors, A3 SVG and measured placement schedule.')
