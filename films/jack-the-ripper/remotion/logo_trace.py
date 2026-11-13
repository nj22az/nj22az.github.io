"""Trace the owner's logo to vector paths, part by part, with the corrections he asked for on 13 November 2026:
the hand on the anchor has three fingers and a thumb like the other hand, and the outer ring is a true circle on
the inner ring's centre, with an even gap all round."""
import subprocess, numpy as np, re, math, json, sys
from scipy import ndimage
p=sys.argv[1]
w,h=1096,1009
gray=np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',p,'-f','rawvideo','-pix_fmt','gray','-']),np.uint8).reshape(h,w).astype(np.float32)
# the parts are told apart on the drawing as it came, before anything is redrawn
lab,n=ndimage.label(gray<128)

# ---- the hand on the anchor, drawn again in the fist's own manner. As drawn it had four fingers (three dividing
# lines, thick at the palm and fading towards the knuckles, never reaching the outline; four faint bumps on the
# knuckle edge; a tick for the first finger's crease). The fist has three fingers: its outline bumps out once for each,
# and each dividing line grows out of the notch between two bumps, thick where it joins, and curls in to a point.
# So here: the old lines and the tick are taken out; the knuckle edge (the hand's right side) is drawn again with three
# bumps; and two lines come in from the notches between them, thick at the join, curling to a point.
yy,xx=np.mgrid[0:h,0:w]
old=gray<128
TOP,BOT=390.0,446.0; B1,B2=TOP+(BOT-TOP)/3,TOP+2*(BOT-TOP)/3                      # the fingers: three equal parts of the grip
gray[(xx>=735.6)&(xx<=768)&(yy>=396.5)&(yy<=441)]=255                            # the three old lines
gray[(xx>=745.5)&(xx<=750.5)&(yy>=387.6)&(yy<=397.5)]=255                        # the tick
# the old knuckle edge: its middle and thickness, row by row
rows=[]; 
for y in range(393,446):
    xs=np.nonzero(old[y,766:789])[0]+766
    runs=np.split(xs,np.nonzero(np.diff(xs)>1)[0]+1)
    r=[q for q in runs if len(q) and len(q)<=9][-1]
    rows.append((y,r[0],r[-1]))
ys=np.array([r[0] for r in rows],float); mid=np.array([(r[1]+r[2])/2 for r in rows])
base=np.polyval(np.polyfit(ys,mid,3),ys)                                          # the edge without its old ripples
for y,x0,x1 in rows: gray[y,x0-1:x1+4]=255
def knuckle(y):
    for a_,b_ in ((TOP,B1),(B1,B2),(B2,BOT)):
        if a_<=y<=b_: return 2.1*math.sin(math.pi*(y-a_)/(b_-a_))**0.75-0.9        # out in the middle of a finger, in at its ends
    return 0.0
ends=np.clip(np.minimum(ys-ys[0],ys[-1]-ys)/3.0,0,1)                              # the new edge leaves and rejoins the old one smoothly
edge=base+np.array([knuckle(y) for y in ys])*ends
def brush(pts,rad):
    for k in range(len(pts)-1):
        (xa,ya),(xb,yb)=pts[k],pts[k+1]; r_=rad(k/(len(pts)-1))
        dx,dy=xb-xa,yb-ya; L2=dx*dx+dy*dy+1e-9
        t=np.clip(((xx-xa)*dx+(yy-ya)*dy)/L2,0,1); d=np.hypot(xx-(xa+t*dx),yy-(ya+t*dy))
        gray[:]=np.minimum(gray,255*(1-np.clip(r_-d+0.5,0,1)))
brush([(base[0],ys[0]-1.5)]+list(zip(edge,ys))+[(base[-1],ys[-1]+1.5)],lambda u:3.0)
def finger_line(yk):
    xk=float(np.interp(yk,ys,edge))                                               # from the notch on the knuckle edge
    p0=(xk-0.5,yk); p1=(xk-29.0,yk-6.2); pc=(xk-17.0,yk+2.6)                       # in towards the palm, rising a little, in a slow curl
    pts=[((1-u)**2*p0[0]+2*u*(1-u)*pc[0]+u*u*p1[0],(1-u)**2*p0[1]+2*u*(1-u)*pc[1]+u*u*p1[1]) for u in np.linspace(0,1,29)]
    brush(pts,lambda u:2.6 if u<0.4 else 2.6-(2.6-0.35)*((u-0.4)/0.6)**1.2)
finger_line(B1); finger_line(B2)
redrawn=(gray<128)&(xx>=724)&(xx<=794)&(yy>=384)&(yy<=452)                        # the hand as it now is
GROUPS={'title':[1,2,3,4],'prop_l':[13],'prop_r':[14],'anchor_l':[17],'anchor_r':[18],
        'bottom':[27,23,36,28,24,35,21,29,30,20,33,31,32,26,25,34],'copy_mark':[37,51],'copy_name':list(range(38,51))}
used=set(sum(GROUPS.values(),[]))
GROUPS['mark']=[i for i in range(1,n+1) if i not in used and i!=11]          # 11 is a piece of the old outer ring
def mask(ids): return np.isin(lab,ids)

# ---- the rings. Read off the drawing: the inner ring's centre (583.7, 387.6), radius 197; the outer ring's centre
# (581.7, 371.0), radius 276, ten thick: 17 higher than the inner, so the gap between them was 53 below and 63 beside.
IN=(583.7,387.6,197.0); OLD=(581.7,371.0,276.0,10.0)
GAP=56.0; NEW_R=IN[2]+GAP+OLD[3]                                               # the new outer ring's outer edge
mk=mask(GROUPS['mark']).copy(); gone=np.zeros_like(mk)
rs=np.arange(250,300,0.25)
for a in np.radians(np.arange(0,360,0.1)):
    xs=np.round(OLD[0]+rs*math.cos(a)).astype(int); ys=np.round(OLD[1]+rs*math.sin(a)).astype(int)
    ok=(xs>=0)&(xs<w)&(ys>=0)&(ys<h); v=np.zeros(len(rs),bool); v[ok]=mk[ys[ok],xs[ok]]
    mid=int((OLD[2]-OLD[3]/2-250)/0.25)
    if not v[mid-12:mid+13].any(): continue
    k=mid-12+int(np.argmax(v[mid-12:mid+13])); i0=k
    while i0>0 and v[i0-1]: i0-=1
    i1=k
    while i1<len(rs)-1 and v[i1+1]: i1+=1
    if (i1-i0)*0.25<=16.5 and abs((rs[i0]+rs[i1])/2-(OLD[2]-OLD[3]/2))<=5:      # a run as thick as the ring, where the ring is
        gone[ys[i0:i1+1],xs[i0:i1+1]]=True
gone=ndimage.binary_dilation(gone,iterations=1)&mk
mk&=~gone
l2,n2=ndimage.label(mk); sizes=ndimage.sum(mk,l2,range(1,n2+1))
for i,sz in enumerate(sizes):
    if sz<30: mk[l2==i+1]=False                                                # crumbs of the old ring
    elif sz<700:                                                               # slivers of it left beside the lettering:
        py,px=np.nonzero(l2==i+1)                                              # small pieces wholly outside the inner ring
        if np.hypot(px-IN[0],py-IN[1]).min()>IN[2]+12: mk[l2==i+1]=False
mk|=redrawn
print('old outer ring: %d pixels taken out; mark keeps %d'%(gone.sum(),mk.sum()))
json.dump({'cx':IN[0],'cy':IN[1],'r_in':IN[2],'ring_r':NEW_R-OLD[3]/2,'ring_w':OLD[3],'r':NEW_R},open('measure.json','w'))

S=4; big=ndimage.zoom(gray,S,order=3)
def trace(name,m,fill_holes=False):
    mm=ndimage.binary_dilation(m,iterations=2)
    mm=ndimage.zoom(mm.astype(np.float32),S,order=1)>0.5
    bw=np.where(mm,big,255.0)<128
    if fill_holes: bw=ndimage.binary_fill_holes(bw)
    H,W=bw.shape
    open(name+'.pbm','wb').write(b'P4\n%d %d\n'%(W,H)+np.packbits(bw,axis=1).tobytes())
    subprocess.run(['potrace','-s','-t','8','-a','1.1','-O','0.4','-o',name+'.svg',name+'.pbm'],check=True)
    s=open(name+'.svg').read()
    return re.search(r'<g transform="([^"]+)"',s).group(1), ''.join(re.findall(r'<path d="[^"]+"/>',s,flags=re.S))
out={}
for name,ids in GROUPS.items():
    if name!='mark': out[name]=trace(name,mask(ids))
out['mark']=trace('mark',mk); out['mark_back']=trace('mark_back',mk,True)
out['title_back']=trace('title_back',mask(GROUPS['title']),True)
json.dump(out,open('paths.json','w'))
print({k:len(v[1]) for k,v in out.items()})
