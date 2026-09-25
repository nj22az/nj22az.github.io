"""Generate British English narration locally with Kokoro-82M / kokoro-onnx.
Install: pip install kokoro-onnx==0.4.9 numpy
Usage: python tools/narrate.py --model /path/kokoro-v1.0.onnx --voices /path/voices-v1.0.bin
No manuscript is sent to a speech service. Completed audio is versioned.
"""
import os
# Full process-lifetime ONNX Runtime telemetry opt-out, set BEFORE any runtime import.
os.environ['ORT_DISABLE_TELEMETRY']='1'
import argparse, hashlib, json, math, re, subprocess, wave
from pathlib import Path
import numpy as np
import onnxruntime as ort
ort.disable_telemetry_events()
from kokoro_onnx import Kokoro
ROOT=Path(__file__).resolve().parents[1]
BUILD=ROOT/'build'; BUILD.mkdir(exist_ok=True)
CACHE=BUILD/'speech-en'; CACHE.mkdir(exist_ok=True)
ASSETS=ROOT/'assets'
p=argparse.ArgumentParser()
p.add_argument('--model',required=True); p.add_argument('--voices',required=True)
p.add_argument('--voice',default='bf_emma'); p.add_argument('--speed',type=float,default=.96)
p.add_argument('--preview',action='store_true')
args=p.parse_args()
model_hash=hashlib.sha256(Path(args.model).read_bytes()).hexdigest()
voices_hash=hashlib.sha256(Path(args.voices).read_bytes()).hexdigest()
options=ort.SessionOptions(); options.intra_op_num_threads=4; options.inter_op_num_threads=1
session=ort.InferenceSession(args.model,sess_options=options,providers=['CPUExecutionProvider'])
class EnglishKokoro(Kokoro):
    def _create_audio(self, phonemes, style, speed):
        # The v1.1 FP32 export uses input_ids with a FLOAT speed input.
        # kokoro-onnx 0.4.9 assumes integer speed for this input name; preserve
        # the requested speaking rate and use the actual model signature.
        tokens=self.tokenizer.tokenize(phonemes)
        assert len(tokens)<=510, 'Speech phrase exceeds model context'
        ids=np.array([[0,*tokens,0]],dtype=np.int64)
        values={'input_ids':ids,'tokens':ids,'style':np.asarray(style[len(tokens)],dtype=np.float32),
                'speed':np.array([speed],dtype=np.float32)}
        audio=self.sess.run(None,{i.name:values[i.name] for i in self.sess.get_inputs()})[0]
        return audio,24000
voice=EnglishKokoro.from_session(session,args.voices)
SR=24000
content=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {scenes,chapters} from './src/content.mjs';console.log(JSON.stringify({scenes,chapters}));"],cwd=ROOT))

def phrases(text):
    # Preserve whole sentences and natural clause boundaries whenever possible.
    # Each generated phrase is also a caption, with measured rather than estimated timing.
    for sentence in re.split(r'(?<=[.!?])\s+',text):
        if len(sentence)<=190:
            yield sentence
            continue
        clauses=re.split(r'(?<=[,;:])\s+',sentence)
        buf=''
        for clause in clauses:
            if buf and len(buf+' '+clause)>190:
                yield buf; buf=''
            if len(clause)>190:
                if buf: yield buf; buf=''
                words=clause.split(); chunk=[]
                for word in words:
                    if len(' '.join(chunk+[word]))>180 and chunk:
                        yield ' '.join(chunk); chunk=[]
                    chunk.append(word)
                buf=' '.join(chunk)
            else: buf=(buf+' '+clause).strip()
        if buf: yield buf

def stamp(sec,sep='.'):
    ms=round(sec*1000);h,ms=divmod(ms,3600000);m,ms=divmod(ms,60000);s,ms=divmod(ms,1000)
    return f'{h:02}:{m:02}:{s:02}{sep}{ms:03}'

def synthesise(phrase):
    # Separate SI prefixes for clear technical pronunciation; captions retain standard spelling.
    spoken=re.sub(r'(?i)megohms?',lambda m:'mega ohms' if m[0].lower().endswith('s') else 'mega ohm',phrase)
    spoken=re.sub(r'(?i)kilohms?',lambda m:'kilo ohms' if m[0].lower().endswith('s') else 'kilo ohm',spoken)
    key=hashlib.sha256(f'{model_hash}:{voices_hash}:{args.voice}:{args.speed}:en-gb:{spoken}'.encode()).hexdigest()[:24]
    cache=CACHE/(key+'.npy')
    if cache.exists(): return np.load(cache)
    audio,sr=voice.create(spoken,voice=args.voice,speed=args.speed,lang='en-gb')
    assert sr==SR and len(audio)>0 and np.isfinite(audio).all()
    np.save(cache,audio)
    return audio

if args.preview:
    text="A sine wave has fifty cycles per second. Its period is twenty milliseconds. Current lags voltage in an ideal inductor. One hundred microfarads is one hundred times ten to the minus six farads. Power factor is active power divided by apparent power."
    parts=[]
    for phrase in phrases(text):parts.extend([synthesise(phrase),np.zeros(round(SR*.22),np.float32)])
    with wave.open(str(BUILD/'english-voice-preview.wav'),'wb') as f:
        f.setparams((1,2,SR,0,'NONE','not compressed'));f.writeframes(np.clip(np.concatenate(parts)*32767,-32768,32767).astype('<i2').tobytes())
    print(json.dumps({'preview':str(BUILD/'english-voice-preview.wav'),'seconds':sum(map(len,parts))/SR}))
    raise SystemExit

timeline=[];captions=[];now=0.;mix=[]
for scene in content['scenes']:
    scene_samples=[np.zeros(round(SR*.5),np.float32)];cursor=.5
    for phrase in phrases(scene['say']):
        if scene.get('pauseBefore') and scene['pauseBefore'] in phrase:
            scene_samples.append(np.zeros(round(SR*6),np.float32));cursor+=6
        audio=synthesise(phrase);dur=len(audio)/SR
        captions.append({'start':now+cursor,'end':now+cursor+dur,'text':phrase,'scene':scene['id']})
        scene_samples.append(audio);cursor+=dur
        gap=.22 if phrase[-1] in '.!?' else .10
        scene_samples.append(np.zeros(round(SR*gap),np.float32));cursor+=gap
    voice_dur=cursor-.5
    tail=2.5 if scene.get('pause') else 1.0
    length=math.ceil((cursor+tail)*2)/2
    track=np.concatenate(scene_samples);track=np.pad(track,(0,round(length*SR)-len(track)))
    timeline.append({**scene,'start':now,'duration':length,'voiceStart':now+.5,'voiceDuration':voice_dur})
    mix.append(track);now+=length
    print(f"{scene['id']}: {length:.1f}s",flush=True)
with wave.open(str(BUILD/'narration-raw.wav'),'wb') as f:
    f.setparams((1,2,SR,0,'NONE','not compressed'))
    for track in mix:f.writeframes(np.clip(track*32767,-32768,32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg','-v','error','-y','-i',str(BUILD/'narration-raw.wav'),'-af','loudnorm=I=-17:TP=-2:LRA=8','-ar','48000','-ac','1',str(BUILD/'narration.wav')],check=True)
subprocess.run(['ffmpeg','-v','error','-y','-i',str(BUILD/'narration.wav'),'-c:a','libmp3lame','-b:a','128k',str(ASSETS/'narration-en.mp3')],check=True)
result={'language':'en-GB','title':'Alternating Current Aboard','fps':30,'bpm':120,'width':1920,'height':1080,'duration':now,'chapters':content['chapters'],'scenes':timeline,'captions':captions,'voice':{'name':args.voice,'engine':'Kokoro-82M / kokoro-onnx 0.4.9 (local)','synthetic':True,'speed':args.speed,'language':'en-gb','modelSHA256':model_hash,'voicesSHA256':voices_hash}}
(ROOT/'src/timeline.json').write_text(json.dumps(result,ensure_ascii=False,indent=2))
vtt=['WEBVTT\n'];srt=[]
for i,c in enumerate(captions,1):
    vtt.append(f"{stamp(c['start'])} --> {stamp(c['end'])}\n{c['text']}\n")
    srt.append(f"{i}\n{stamp(c['start'],',')} --> {stamp(c['end'],',')}\n{c['text']}\n")
(ASSETS/'en.vtt').write_text('\n'.join(vtt));(ASSETS/'en.srt').write_text('\n'.join(srt))
print(json.dumps({'duration':now,'scenes':len(timeline),'captions':len(captions)}))
