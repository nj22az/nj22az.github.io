"""Rebuild amplitude-based facial takes and an original, seeded foley mix. No external sound recordings."""
import json,subprocess,wave
from pathlib import Path
import numpy as np
R=Path('production/vy-classroom');SR=48000;FPS=30;DURATION=20
mix=np.zeros((SR*DURATION,2),np.float64);rng=np.random.default_rng(1997);envelopes={}
def decoded(name):
 return np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(R/'audio'/name),'-f','f32le','-ac','1','-ar',str(SR),'-']),np.float32)
def add(x,start,level=1,pan=0):
 n=int(start*SR);length=min(len(x),len(mix)-n);x=x[:length]*level
 mix[n:n+length,0]+=x*np.sqrt((1-pan)/2);mix[n:n+length,1]+=x*np.sqrt((1+pan)/2)
for who,start in [('vy',3.2),('teacher',13.2)]:
 x=decoded(who+'.mp3');add(x,start,.9)
 # Exact audio windows, including silence; visually readable stylised mouth opening, not phoneme lip-sync.
 envelopes[who]=[float(np.clip(np.sqrt(np.mean(x[i:i+SR//FPS]**2)) * 12,0,1)) for i in range(0,len(x),SR//FPS)]
if (R/'audio/scream.mp3').exists():add(decoded('scream.mp3'),10,.65)
def knock(start,duration=.18,level=.12,freq=140,pan=0):
 t=np.arange(int(SR*duration))/SR
 x=(np.sin(2*np.pi*freq*t)+.45*np.sin(2*np.pi*freq*1.73*t)+rng.normal(0,.35,len(t)))*np.exp(-t*25)*np.minimum(t*500,1)
 add(x,start,level,pan)
# Two quiet classroom ticks, chair scrape, desk impact, then shoes. First impact follows the visible tumble.
knock(.5,.08,.035,950);knock(2,.08,.035,950)
t=np.arange(int(.55*SR))/SR;add(rng.normal(0,1,len(t))*np.sin(np.pi*t/.55)**2,10.08,.025,-.3)
knock(10.45,.3,.16,95,-.45);knock(11.166666667,.35,.2,125,-.5)
for i,at in enumerate([10.55,10.85,11.15,11.45,11.75,12.05,12.35,12.65]):knock(at,.1,.045,230,.1+i*.05)
knock(13.2,.10,.035,420,.1)
peak=np.max(np.abs(mix));mix*=min(1,.85/max(peak,1e-8))
with wave.open(str(R/'mix.wav'),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes((mix*32767).astype('<i2').tobytes())
(R/'envelopes.json').write_text(json.dumps(envelopes))
print('Wrote 48 kHz stereo mix and facial envelopes; peak',float(np.max(np.abs(mix))))
