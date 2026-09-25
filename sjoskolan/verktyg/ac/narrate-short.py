import os
os.environ['ORT_DISABLE_TELEMETRY']='1'
import json,subprocess,hashlib,wave,re,argparse
from pathlib import Path
import numpy as np
import onnxruntime as ort
ort.disable_telemetry_events()
from kokoro_onnx import Kokoro
parser=argparse.ArgumentParser();parser.add_argument('--model',type=Path,required=True);parser.add_argument('--voices',type=Path,required=True);parser.add_argument('--work',type=Path,required=True);args=parser.parse_args()
model=args.model;voices=args.voices;args.work.mkdir(parents=True,exist_ok=True)
assert hashlib.sha256(model.read_bytes()).hexdigest()=='beb0d1848dee9a49da392cc3df26958d46cfa35d321edf434f52949153f0df3a'
assert hashlib.sha256(voices.read_bytes()).hexdigest()=='bca610b8308e8d99f32e6fe4197e7ec01679264efed0cac9140fe9c29f1fbf7d'
options=ort.SessionOptions();options.intra_op_num_threads=4;options.inter_op_num_threads=1
session=ort.InferenceSession(str(model),sess_options=options,providers=['CPUExecutionProvider'])
class EnglishKokoro(Kokoro):
 def _create_audio(self,phonemes,style,speed):
  tokens=self.tokenizer.tokenize(phonemes)
  ids=np.array([[0,*tokens,0]],dtype=np.int64)
  values={'input_ids':ids,'tokens':ids,'style':np.asarray(style[len(tokens)],dtype=np.float32),'speed':np.array([speed],dtype=np.float32)}
  return self.sess.run(None,{i.name:values[i.name] for i in self.sess.get_inputs()})[0],24000
voice=EnglishKokoro.from_session(session,str(voices))
course=Path(__file__).resolve().parents[2]/'vecka-40/aktuell';out=course/'film-audio';out.mkdir(exist_ok=True)
data=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {FILM_SPEECH} from './film-manus.mjs';import {LESSONS} from './lektioner.mjs';console.log(JSON.stringify({speech:FILM_SPEECH,lessons:LESSONS}));"],cwd=course))
SR=24000;timeline={}
for lesson in data['lessons']:
 key=lesson['id'];parts=[];scenes=[];start=0
 for i,para in enumerate(data['speech'][key]):
  seg=[]
  for phrase in re.split(r'(?<=[.!?])\s+',para):
   a,sr=voice.create(phrase,voice='bf_emma',speed=.96,lang='en-gb');assert sr==SR and np.isfinite(a).all();seg.extend([a,np.zeros(int(.18*SR),dtype=np.float32)])
  speech=np.concatenate(seg);duration=max(20,len(speech)/SR+1.5);audio=np.pad(speech,(0,round(duration*SR)-len(speech)));parts.append(audio)
  scenes.append({'id':lesson['film'][i],'start':round(start,3),'duration':round(duration,3),'say':para});start+=len(audio)/SR
  print(key,i+1,round(duration,2),flush=True)
 audio=np.concatenate(parts);wav=args.work/f'{key}-short.wav'
 with wave.open(str(wav),'wb') as f:f.setnchannels(1);f.setsampwidth(2);f.setframerate(SR);f.writeframes((np.clip(audio,-1,1)*32767).astype('<i2').tobytes())
 subprocess.run(['ffmpeg','-y','-loglevel','error','-i',str(wav),'-codec:a','libmp3lame','-b:a','96k',str(out/(key+'.mp3'))],check=True)
 timeline[key]={'duration':round(len(audio)/SR,3),'scenes':scenes}
(out/'timeline.json').write_text(json.dumps(timeline,ensure_ascii=False,indent=2))
print('DONE',flush=True)
