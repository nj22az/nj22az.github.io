"""Original fitted ribbon dress. Blender source; run with blender -b --python this-file.
The photograph establishes the bodice only; the matching A-line skirt is our design.
Design coordinates: X=half chest width, Y=torso height above hip, Z=half chest depth.
Runtime fits those coordinates to each avatar's own torso profile and skirt dimensions.
"""
import bpy, math, json
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'assets/models/wardrobe/ribbon-dress';OUT.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
parts=[]
def mesh(name,verts,faces,mode='surface',tone='cloth'):
    m=bpy.data.meshes.new(name);m.from_pydata(verts,[],faces);m.update()
    obj=bpy.data.objects.new(name,m);bpy.context.collection.objects.link(obj)
    for p in m.polygons:p.use_smooth=True
    obj['fit_mode']=mode;obj['tone']=tone;parts.append(obj);return obj

def grid(name,rows,closed=False,mode='surface',tone='cloth'):
    n=len(rows[0]);verts=[p for row in rows for p in row];faces=[]
    for j in range(len(rows)-1):
        for i in range(n if closed else n-1):
            k=(i+1)%n;faces.append((j*n+i,j*n+k,(j+1)*n+k,(j+1)*n+i))
    return mesh(name,verts,faces,mode,tone)

N=64
# Fitted shell with a subtle centre dip at the neckline; a turned inner edge.
def neckline(a):
    front=max(0,math.cos(a));return .785-.055*front**12
rows=[]
for j in range(13):
    f=j/12;rows.append([(math.sin(a)*(1.035+.007*math.sin(12*a)*math.sin(f*math.pi)),.105+(neckline(a)-.105)*f,math.cos(a)*(1.035+.007*math.sin(12*a)*math.sin(f*math.pi))) for a in [i*math.tau/N for i in range(N)]])
# bottom-to-top rings have outward facing normals with X=sin(a), Z=cos(a).
rows.append([(math.sin(i*math.tau/N)*1.02,neckline(i*math.tau/N)-.012,math.cos(i*math.tau/N)*1.02) for i in range(N)])
grid('Bodice - fitted cotton shell',rows,True,'radial')
# Wide flat shoulder straps, no cylindrical ropes. Project onto the torso at runtime.
for side in [-1,1]:
    rows=[]
    path=[(.77,.83),(.86,.72),(.94,.53),(1.0,.26),(1.035,0),(1.0,-.26),(.94,-.53),(.86,-.72),(.775,-.83)]
    for y,z in path:rows.append([(side*.61+u,y,z) for u in [-.115,0,.115]])
    # surface projection interprets z as signed radial position on front/back.
    grid('Shoulder strap '+str(side),rows,False,'strap')
# Ribbon-threaded trim follows the front of the bodice. Scallops are mesh, not a square texture.
rows=[]
for k in [0,1,2]:
    row=[]
    for i in range(65):
        x=-.90+1.8*i/64;y=.705+k*.018+(.005*math.cos(i*math.pi/2) if k!=1 else 0)
        row.append((x,y,1.05))
    rows.append(row)
grid('Scalloped eyelet ribbon band',rows,False,'front','lace')
for side in [-1,1]:
    for i in range(1,7):
        x=side*(.11+i*.115)
        grid('Threaded black ribbon %s %s'%(side,i),[[(x-.037,.719,1.065),(x+.037,.719,1.065)],[(x-.037,.735,1.065),(x+.037,.735,1.065)]],False,'front','ribbon')
# Flat sewn ribbon, modelled as strips along editable sampled Bezier-like paths.
def ribbon(name,points,width):
    rows=[]
    for i,p in enumerate(points):
        before=Vector(points[max(0,i-1)]);after=Vector(points[min(len(points)-1,i+1)])
        d=(after-before).normalized();n=Vector((-d.y,d.x,0));v=Vector(p)
        rows.append([tuple(v+n*width/2),tuple(v-n*width/2)])
    grid(name,rows,False,'front','ribbon')
for side in [-1,1]:
    pts=[]
    for i in range(41):
        t=i/40;pts.append((side*(.19*(1-math.cos(math.tau*t))+.05*math.sin(math.tau*t)),.704-.12*(1-math.cos(math.tau*t))+.065*math.sin(math.tau*t),1.105+.025*math.sin(math.pi*t)))
    ribbon('Bow loop '+str(side),pts,.028)
    pts=[(side*(.018+.04*t+.025*math.sin(math.pi*t)),.705-.39*t,1.10+.012*math.sin(math.tau*t)) for t in [i/24 for i in range(25)]]
    ribbon('Bow tail '+str(side),pts,.028)
grid('Centre ribbon knot',[[(-.038,.69,1.12),(.038,.69,1.12)],[(-.031,.735,1.12),(.031,.735,1.12)]],False,'front','ribbon')
# A-line extension: original matching skirt, softly gathered below the hip.
rows=[]
for j in range(13):
    f=j/12;rows.append([(math.sin(a)*(1+.012*math.cos(12*a)*f*f),f,math.cos(a)*(1+.012*math.cos(12*a)*f*f)) for a in [i*math.tau/N for i in range(N)]])
# Short turned under hem, preserving the open skirt, no disk through the legs.
rows.append([(math.sin(i*math.tau/N)*.985,.99,math.cos(i*math.tau/N)*.985) for i in range(N)])
grid('Matching A-line skirt',list(reversed(rows)),True,'skirt')
# Export evaluated triangle topology straight from Blender; no runtime re-creation of the bow.
data=[]
for obj in parts:
    m=obj.data;m.calc_loop_triangles()
    data.append(dict(name=obj.name,mode=obj['fit_mode'],tone=obj['tone'],position=[round(c,6) for v in m.vertices for c in v.co],index=[i for tri in m.loop_triangles for i in tri.vertices]))
(ROOT/'src/avatars/ribbon-dress-data.js').write_text('// Generated in Blender by tools/blender/build-ribbon-dress.py. Original Johansson garment.\nexport const RIBBON_DRESS = '+json.dumps(data,separators=(',',':'))+';\n')
# Keep editable source in design coordinates with labelled collections/materials.
for tone,col in [('cloth',(0.80,.47,.60,1)),('lace',(.93,.68,.78,1)),('ribbon',(.016,.019,.026,1))]:
    mat=bpy.data.materials.new(tone);mat.diffuse_color=col;mat.use_nodes=True
    bs=mat.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=col;bs.inputs['Roughness'].default_value=.78
    for o in parts:
        if o['tone']==tone:o.data.materials.append(mat)
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'ribbon-dress.blend'),compress=True)
(OUT/'mesh-audit.json').write_text(json.dumps({'authoring':'Blender '+bpy.app.version_string,'vertices':sum(len(o.data.vertices) for o in parts),'triangles':sum(len(o.data.loop_triangles) for o in parts),'pieces':len(parts),'source':'Owner photograph, bodice only; matching skirt is original design','coordinate_system':'X half-width, Y torso fraction, Z half-depth; skirt Y is normalized drop','notes':['Open neckline and hem','Flat wide straps','Scalloped mesh band and threaded black ribbon','No earrings included']},indent=2))
print('RIBBON_DRESS_EXPORTED',len(parts))
