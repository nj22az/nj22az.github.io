# Enkla SVG-scheman för riggdokumentet. Koordinater i px, viewBox anges per schema.
INK='#163248'; RED='#b8323c'; BLUE='#1763a3'; GRAY='#6b7f90'; GREEN='#0e7c5a'; BROWN='#7a4a24'; NBLUE='#2f6fb3'
BOLD=' font-weight="700"'
def da(d): return f' stroke-dasharray="{d}"' if d else ''
def esc(t): return str(t).replace('&','&amp;').replace('<','&lt;')
class S:
    def __init__(s,w,h,title): s.w,s.h,s.t,s.b=w,h,title,[]
    def line(s,pts,c=INK,w=2.5,dash=None):
        d=' '.join(('M' if i==0 else 'L')+f'{x} {y}' for i,(x,y) in enumerate(pts))
        s.b.append(f'<path d="{d}" fill="none" stroke="{c}" stroke-width="{w}" stroke-linejoin="round"{da(dash)}/>')
    def text(s,x,y,t,size=13,c=INK,anchor='middle',bold=False):
        s.b.append(f'<text x="{x}" y="{y}" font-size="{size}" fill="{c}" text-anchor="{anchor}"{BOLD if bold else ""}>{esc(t)}</text>')
    def box(s,x,y,w,h,t=None,sub=None,fill='#f3f6f9',dash=None):
        s.b.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{fill}" stroke="{INK}" stroke-width="2"{da(dash)}/>')
        if t: s.text(x+w/2,y+22,t,14,bold=True)
        if sub:
            for i,l in enumerate(sub.split('\n')): s.text(x+w/2,y+40+15*i,l,12,GRAY)
    def jack(s,x,y,label,c=INK,pos='above'):
        s.b.append(f'<circle cx="{x}" cy="{y}" r="7" fill="#fff" stroke="{c}" stroke-width="3"/>')
        dy={'above':-14,'below':24}[pos]; s.text(x,y+dy,label,13,c,bold=True)
    def dot(s,x,y,c=INK): s.b.append(f'<circle cx="{x}" cy="{y}" r="4" fill="{c}"/>')
    def res(s,x,y,label=None,vert=False,c=INK,lx=None,ly=None):
        if vert: s.b.append(f'<rect x="{x-9}" y="{y-24}" width="18" height="48" fill="#fff" stroke="{c}" stroke-width="2.5"/>')
        else: s.b.append(f'<rect x="{x-24}" y="{y-9}" width="48" height="18" fill="#fff" stroke="{c}" stroke-width="2.5"/>')
        if label:
            for i,l in enumerate(label.split('\n')): s.text(lx if lx is not None else (x+18 if vert else x), (ly if ly is not None else (y-4 if vert else y-16))+14*i, l, 12, anchor='start' if vert else 'middle')
    def fuse(s,x,y,label,vert=False):
        if vert: s.b.append(f'<rect x="{x-7}" y="{y-16}" width="14" height="32" fill="#fff" stroke="{INK}" stroke-width="2"/><path d="M{x} {y-16} V{y+16}" stroke="{INK}" stroke-width="1.5"/>'); s.text(x+14,y+4,label,12,anchor='start')
        else: s.b.append(f'<rect x="{x-16}" y="{y-7}" width="32" height="14" fill="#fff" stroke="{INK}" stroke-width="2"/><path d="M{x-16} {y} H{x+16}" stroke="{INK}" stroke-width="1.5"/>'); s.text(x,y-13,label,12)
    def link(s,x1,y,x2,label='länk'):
        s.b.append(f'<path d="M{x1} {y} V{y-18} H{x2} V{y}" fill="none" stroke="{INK}" stroke-width="4"/>'); s.text((x1+x2)/2,y-24,label,12,GRAY)
    def svg(s,id_):
        return f'<figure class="rig-fig"><svg viewBox="0 0 {s.w} {s.h}" role="img" aria-labelledby="{id_}"><title id="{id_}">{esc(s.t)}</title>{"".join(s.b)}</svg></figure>'
