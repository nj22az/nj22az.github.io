/* Original stereo celesta score synthesizer. Java 17, no external Java dependencies.
 * Synthesis recipe informed by Anidoodle (Apache-2.0); original implementation and score.
 * Each note has a 2 ms attack, exponential decay, no sustain or reverberation tail.
 * Instrument 0 celesta, 1 plucked bass, 2/3 quiet tick/tock, 4 final tonic bell.
 */
import javax.sound.sampled.*;
import java.io.*;
import java.nio.file.*;
import java.util.*;
public class MusicScore {
  static final int SR=48000; static final double TAU=2*Math.PI;
  public static void main(String[] args) throws Exception {
    double duration=Double.parseDouble(args[0]); int n=(int)Math.round(duration*SR);
    float[] left=new float[n],right=new float[n];
    for(String row:Files.readAllLines(Path.of(args[1]))){
      if(row.isBlank())continue;String[] p=row.split("\\t");
      int frame=Integer.parseInt(p[0]),midi=Integer.parseInt(p[1]),inst=Integer.parseInt(p[3]);
      double vel=Double.parseDouble(p[2]),pan=Double.parseDouble(p[4]);
      int begin=(int)Math.round(frame/30.0*SR);
      double freq=440*Math.pow(2,(midi-69)/12.0),tau=inst==4?1.2:.45*Math.sqrt(440/freq);
      int count=(int)(Math.min(2.6,tau*6)*SR);if(inst==2||inst==3)count=384;
      double lg=Math.sqrt((1-pan)*.5),rg=Math.sqrt((1+pan)*.5);
      for(int i=0;i<count && begin+i<n;i++){
        double t=i/(double)SR,env=Math.min(1,t/.002),signal;
        if(inst==2||inst==3){
          double f=inst==2?3000:2000;
          signal=Math.sin(TAU*f*t)*Math.exp(-t/.0015)*.25;
        }else{
          double a=TAU*freq*t;
          signal=(Math.sin(a)+.35*Math.sin(2*a)+(inst==1?0:.12*Math.sin(3*a)))*Math.exp(-t/tau);
          if(inst!=1)signal+=.08*Math.sin(5.4*a)*Math.exp(-t/.06);
          if(inst==4)signal+=.10*Math.sin(4.2*a)*Math.exp(-t/.7);
        }
        double value=signal*env*vel*.30;
        left[begin+i]+=value*lg;right[begin+i]+=value*rg;
        int echo=begin+i+1440;
        if(echo<n){left[echo]+=value*lg*.20;right[echo]+=value*rg*.20;}
      }
    }
    List<double[]> spans=new ArrayList<>();for(String row:Files.readAllLines(Path.of(args[2]))){String[] p=row.split("\\t");spans.add(new double[]{Double.parseDouble(p[0]),Double.parseDouble(p[1])});}
    // Narration-first mix: smooth gain changes around the exact local speech spans.
    int span=0;double peak=0,sum=0;
    Path raw=Path.of(args[3]+".pcm");
    try(OutputStream out=new BufferedOutputStream(Files.newOutputStream(raw),1<<20)){
      for(int i=0;i<n;i++){
        double t=i/(double)SR;while(span<spans.size()-1&&t>spans.get(span)[1]+.8)span++;
        double a=spans.get(span)[0],b=spans.get(span)[1];
        double duck=t<a?Math.max(0,1-(a-t)/.35):t<=b?1:Math.max(0,1-(t-b)/.65);
        double gain=.33*(1-duck)+.095*duck;
        gain*=Math.min(1,t/.25)*Math.min(1,(duration-t)/2.2);
        for(double v:new double[]{left[i],right[i]}){
          v=Math.tanh(v)*gain;peak=Math.max(peak,Math.abs(v));sum+=v*v;
          int sample=(int)Math.round(v*32767);out.write(sample&255);out.write((sample>>8)&255);
        }
      }
    }
    AudioFormat f=new AudioFormat(SR,16,2,true,false);
    try(AudioInputStream in=new AudioInputStream(Files.newInputStream(raw),f,n)){AudioSystem.write(in,AudioFileFormat.Type.WAVE,Path.of(args[3]).toFile());}
    Files.delete(raw);
    System.out.printf(Locale.ROOT,"Java score: %.1f s, peak %.1f dBFS, RMS %.1f dBFS%n",duration,20*Math.log10(peak),10*Math.log10(sum/(n*2.0)));
  }
}
