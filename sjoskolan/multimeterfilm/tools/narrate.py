"""Generate Swedish speech locally with Piper. The manuscript never leaves the host.
Usage: python tools/narrate.py --model /path/to/sv_SE-nst-medium.onnx
Install: pip install piper-tts==1.8.0 numpy
Model: https://huggingface.co/rhasspy/piper-voices/tree/main/sv/sv_SE/nst/medium
The finished narration.mp3 and timeline are versioned; ordinary rerenders need no model.
"""
import argparse,hashlib,json,math,re,subprocess,wave,os
# Official ONNX Runtime full process-lifetime telemetry opt-out, before initialization.
# https://github.com/microsoft/onnxruntime/blob/main/docs/Privacy.md
os.environ["ORT_DISABLE_TELEMETRY"]="1"
from pathlib import Path
import numpy as np
import onnxruntime
onnxruntime.disable_telemetry_events()
from piper import PiperVoice,SynthesisConfig
ROOT=Path(__file__).resolve().parents[1]; BUILD=ROOT/'build'; BUILD.mkdir(exist_ok=True);ASSETS=ROOT/'assets'
a=argparse.ArgumentParser();a.add_argument('--model',required=True);args=a.parse_args()
voice=PiperVoice.load(args.model)
config=SynthesisConfig(length_scale=1.07,noise_scale=0.0,noise_w_scale=0.0)
SR=voice.config.sample_rate
content=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {scenes,chapters} from './src/content.mjs';console.log(JSON.stringify({scenes,chapters}));"],cwd=ROOT))

def phrases(text):
    for sentence in re.split(r'(?<=[.!?])\s+',text):
        if len(sentence)<=160:yield sentence;continue
        words=sentence.split();parts=[];buf=[]
        for word in words:
            if len(' '.join(buf+[word]))>145 and buf:parts.append(' '.join(buf));buf=[]
            buf.append(word)
        if buf:parts.append(' '.join(buf))
        yield from parts

def stamp(sec,sep='.'):
    ms=round(sec*1000);h,ms=divmod(ms,3600000);m,ms=divmod(ms,60000);s,ms=divmod(ms,1000)
    return f'{h:02}:{m:02}:{s:02}{sep}{ms:03}'

timeline=[];captions=[];now=0.;mix=[];phrase_counter=0
for scene in content['scenes']:
    scene_samples=[np.zeros(round(SR*.5),np.float32)];cursor=.5;start=now
    for phrase in phrases(scene['say']):
        key=hashlib.sha256(('nst-medium-v1-zero-noise-1.07'+phrase).encode()).hexdigest()[:20]
        cache=BUILD/(key+'.npy')
        if cache.exists():audio=np.load(cache)
        else:
            chunks=[chunk.audio_float_array for chunk in voice.synthesize(phrase,config)]
            audio=np.concatenate(chunks);np.save(cache,audio)
        dur=len(audio)/SR
        captions.append({'start':now+cursor,'end':now+cursor+dur,'text':phrase,'scene':scene['id']})
        scene_samples.append(audio);cursor+=dur
        scene_samples.append(np.zeros(round(SR*.16),np.float32));cursor+=.16
        phrase_counter+=1
    voice_dur=cursor-.5
    tail=2.5 if scene.get('pause') else 1.0
    length=math.ceil((cursor+tail)*2)/2
    track=np.concatenate(scene_samples)
    track=np.pad(track,(0,round(length*SR)-len(track)))
    timeline.append({**scene,'start':now,'duration':length,'voiceStart':now+.5,'voiceDuration':voice_dur})
    mix.append(track);now+=length
    print(f"{scene['id']}: {length:.1f}s",flush=True)
with wave.open(str(BUILD/'narration-raw.wav'),'wb') as f:
    f.setparams((1,2,SR,0,'NONE','not compressed'))
    for track in mix:f.writeframes(np.clip(track*32767,-32768,32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg','-v','error','-y','-i',str(BUILD/'narration-raw.wav'),'-af','loudnorm=I=-17:TP=-2:LRA=8','-ar','48000','-ac','1',str(BUILD/'narration.wav')],check=True)
subprocess.run(['ffmpeg','-v','error','-y','-i',str(BUILD/'narration.wav'),'-c:a','libmp3lame','-b:a','96k',str(ASSETS/'narration.mp3')],check=True)
result={'fps':30,'bpm':120,'width':1920,'height':1080,'duration':now,'chapters':content['chapters'],'scenes':timeline,'captions':captions,'voice':{'name':'sv_SE-nst-medium','engine':'Piper (local)','synthetic':True,'lengthScale':1.07,'noiseScale':0,'noiseWScale':0}}
(ROOT/'src/timeline.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
vtt=['WEBVTT\n'];srt=[]
for i,c in enumerate(captions,1):
    vtt.append(f"{stamp(c['start'])} --> {stamp(c['end'])}\n{c['text']}\n")
    srt.append(f"{i}\n{stamp(c['start'],',')} --> {stamp(c['end'],',')}\n{c['text']}\n")
(ASSETS/'sv.vtt').write_text('\n'.join(vtt));(ASSETS/'sv.srt').write_text('\n'.join(srt))
print(json.dumps({'duration':now,'scenes':len(timeline),'captions':len(captions)}))
