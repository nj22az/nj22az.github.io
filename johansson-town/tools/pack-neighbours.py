"""Compact Blender exports: shared local textures, constant animation keys and palette.

Run after build-neighbours.py. Paths are relative to this script's game directory.
Requires Pillow and numpy. Images keep CC0 provenance; no external runtime URLs.
"""
from pathlib import Path
from io import BytesIO
import hashlib, json, struct
import numpy as np
from PIL import Image, ImageOps

root=Path(__file__).resolve().parents[1]
folder=root/'assets/characters/neighbours'
textures=folder/'textures';textures.mkdir(exist_ok=True)
profiles=json.loads((root/'src/people/profiles.json').read_text())
report=[];images_report={}
previous=json.loads((folder/'manifest.json').read_text()) if (folder/'manifest.json').exists() else {}
component={5121:np.dtype('u1'),5123:np.dtype('<u2'),5125:np.dtype('<u4'),5126:np.dtype('<f4')}
components={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4,'MAT4':16}

for profile in profiles:
    path=folder/(profile['model']+'.glb')
    b=path.read_bytes();length=struct.unpack_from('<I',b,12)[0]
    d=json.loads(b[20:20+length]);binary=b[28+length:]
    if any('uri' in i for i in d.get('images',[])):
        entry=next((m for m in previous.get('models',[]) if m['model']==profile['model']),None)
        if not entry or entry['sha256']!=hashlib.sha256(b).hexdigest():
            raise ValueError('Packed file has no matching receipt; rebuild '+str(path))
        report.append(entry)
        for filename in entry['textures']:
            receipt=previous['textures'][filename]
            if hashlib.sha256((textures/filename).read_bytes()).hexdigest()!=receipt['sha256']:
                raise ValueError('Shared texture differs from receipt: '+filename)
            images_report[filename]=receipt
        continue
    source=json.loads((folder/(profile['model']+'.source.json')).read_text())
    image_sources=[]
    for index, image in enumerate(d.get('images',[])):
        view=d['bufferViews'][image['bufferView']]
        raw=binary[view.get('byteOffset',0):view.get('byteOffset',0)+view['byteLength']]
        im=Image.open(BytesIO(raw));name=image.get('name','')
        clothes='suit' in name and 'diffuse' in name
        normal='normal' in name
        alpha=im.mode=='RGBA' and im.getchannel('A').getextrema()[0]<255
        limit=1024 if 'young_' in name or 'middleage_' in name or 'old_' in name or clothes else 512 if normal or alpha else 256
        im.thumbnail((limit,limit),Image.Resampling.LANCZOS)
        # Preserve cloth folds; fitted vertex colours give each resident their wardrobe.
        if clothes: im=ImageOps.grayscale(im).convert('RGB')
        if alpha and profile['age']>=60 and 'eyebrow' not in name:
            pixels=np.array(im.convert('RGBA'))
            gray=np.asarray(ImageOps.grayscale(im)).astype(np.float32)/255
            shade=(.28+gray*.55)*255
            pixels[:,:,:3]=np.clip(shade[:,:,None]*np.array([1.,.98,.94]),0,255).astype('uint8')
            im=Image.fromarray(pixels)
        stream=BytesIO()
        if alpha: im.save(stream,format='PNG',optimize=True)
        else: im.convert('RGB').save(stream,format='JPEG',quality=86,subsampling=0,optimize=True)
        data=stream.getvalue();digest=hashlib.sha256(data).hexdigest()
        filename=digest[:20]+('.png' if alpha else '.jpg')
        target=textures/filename
        if not target.exists():target.write_bytes(data)
        d['images'][index]={'uri':'textures/'+filename,'name':name}
        image_sources.append(filename)
        images_report[filename]={'sha256':digest,'bytes':len(data),'dimensions':list(im.size),'sourceTexture':name}
    for material in d['materials']:
        material['doubleSided']=False
        if material.get('alphaMode')=='BLEND':
            material['alphaMode']='MASK';material['alphaCutoff']=.38;material['doubleSided']=True
        material.get('extensions',{}).pop('KHR_materials_specular',None)

    original_accessors=d['accessors'];original_views=d['bufferViews']
    def array(index):
        acc=original_accessors[index];view=original_views[acc['bufferView']]
        dtype=component[acc['componentType']];cols=components[acc['type']]
        offset=view.get('byteOffset',0)+acc.get('byteOffset',0)
        return np.ndarray((acc['count'],cols),dtype=dtype,buffer=binary,offset=offset,
          strides=(view.get('byteStride',dtype.itemsize*cols),dtype.itemsize)).copy()

    # Two endpoints suffice for genuinely constant tracks, including seated joints.
    replacements={}
    for animation in d['animations']:
        for sampler in animation['samplers']:
            values=array(sampler['output']);times=array(sampler['input'])
            if len(values)>2 and np.all(np.abs(values-values[0])<1e-6):
                replacements[(id(sampler),'output')]=values[[0,-1]]
                replacements[(id(sampler),'input')]=times[[0,-1]]

    output=bytearray();new_views=[];new_accessors=[];cached={}
    def write_array(data, kind, value_type, normalized=False, bounds=False):
        data=np.ascontiguousarray(data,dtype=component[kind]);raw=data.tobytes()
        key=(kind,value_type,normalized,hashlib.sha256(raw).hexdigest())
        if key in cached:return cached[key]
        output.extend(b'\0'*((-len(output))%4));offset=len(output);output.extend(raw)
        new_views.append({'buffer':0,'byteOffset':offset,'byteLength':len(raw)})
        acc={'bufferView':len(new_views)-1,'componentType':kind,'count':len(data),'type':value_type}
        if normalized:acc['normalized']=True
        if bounds:acc.update(min=data.min(axis=0).tolist(),max=data.max(axis=0).tolist())
        index=len(new_accessors);new_accessors.append(acc);cached[key]=index
        return index
    def copy_accessor(index, data=None):
        acc=original_accessors[index]
        return write_array(array(index) if data is None else data,acc['componentType'],acc['type'],acc.get('normalized',False),'min' in acc)
    for mesh in d['meshes']:
        for primitive in mesh['primitives']:
            positions=array(primitive['attributes']['POSITION'])
            if 'suit' in mesh['name']:
                top=np.array([int(profile['top'][i:i+2],16)/255 for i in (1,3,5)])**2.2
                top=.32+.68*top
                bottom=np.array([.44,.49,.54])
                y=positions[:,1];mix=np.clip((y-(y.min()+.56*(y.max()-y.min())))/.035,0,1)
                colour=(bottom[None,:]*(1-mix[:,None])+top[None,:]*mix[:,None])
                primitive['attributes']['COLOR_0']=write_array(np.rint(colour*255).astype('uint8'),5121,'VEC3',True)
            for key,index in list(primitive['attributes'].items()):
                if key!='COLOR_0': primitive['attributes'][key]=copy_accessor(index)
            if 'indices' in primitive:primitive['indices']=copy_accessor(primitive['indices'])
    for skin in d.get('skins',[]):skin['inverseBindMatrices']=copy_accessor(skin['inverseBindMatrices'])
    for animation in d['animations']:
        for sampler in animation['samplers']:
            for key in ['input','output']:sampler[key]=copy_accessor(sampler[key],replacements.get((id(sampler),key)))
    d['accessors']=new_accessors;d['bufferViews']=new_views
    d['buffers']=[{'byteLength':len(output)}]
    d['extras']={'source':'MakeHuman system assets / MPFB','license':'CC0-1.0','resident':profile['name'],'walkMetresPerCycle':.56/.6,'runMetresPerCycle':.88/.6}
    header=json.dumps(d,separators=(',',':')).encode();header+=b' '*((-len(header))%4)
    output.extend(b'\0'*((-len(output))%4))
    result=struct.pack('<III',0x46546c67,2,28+len(header)+len(output))+struct.pack('<II',len(header),0x4e4f534a)+header+struct.pack('<II',len(output),0x004e4942)+output
    path.write_bytes(result)
    report.append({'name':profile['name'],'model':profile['model'],'bytes':len(result),'triangles':source['triangles'],
      'draws':sum(len(m['primitives']) for m in d['meshes']),'sha256':hashlib.sha256(result).hexdigest(),'textures':image_sources,
      'age':profile['age'],'clothes':source['clothes'],'hair':source['hair'],'skin':source['skin']})
    print(profile['name'],len(result),flush=True)

manifest={'source':'https://files2.makehumancommunity.org/asset_packs/makehuman_system_assets/makehuman_system_assets_cc0.zip',
 'sourceLicense':'CC0-1.0','assetPackSHA256':'b542127a8e25547c7c29c19f2d1d2adb9a664c80396ecd694095dbc8028a0107',
 'authoring':'Blender 4.2.23 LTS / MPFB 2.0.17','mpfbRevision':'437dd513888a92399d1d3200d2e80859fae55abc',
 'changes':['Individual age, build and facial fitting','Fitted blended skin weights','Seven original in-place clips with analytic knee placement and measured sole grounding',
 'Geometry reduction and hidden upper-thigh masking beneath fitted skirts','Shared 256–1024px textures','Neutralised clothing photographs with individual vertex-colour palettes','Grey hair for older residents','Alpha testing for hair'],
 'models':report,'textures':images_report,'modelBytes':sum(r['bytes'] for r in report),'textureBytes':sum(r['bytes'] for r in images_report.values())}
(folder/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
for path in textures.iterdir():
    if path.name not in images_report:path.unlink()
print('PACKED',manifest['modelBytes'],manifest['textureBytes'],len(images_report),'shared textures')
