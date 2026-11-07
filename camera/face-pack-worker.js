/**
 * Finds every face in a picture, off the page's thread: MediaPipe's Face Landmarker (vendor/mediapipe, Apache-2.0),
 * 478 points per face and its expression scores, run once per picture. The picture stays in this worker and is
 * discarded; only numbers go back. Nothing is uploaded.
 */
let landmarker=null,loading=null,files=null,segmenter=null,segLoading=null;
// The runtime prints its "INFO: Created TensorFlow Lite XNNPACK delegate" line through console.error; it is information.
const consoleError=console.error.bind(console);console.error=(...args)=>(/^INFO:/.test(String(args[0]))?console.info:consoleError)(...args);
const base=new URL('./vendor/mediapipe/',self.location.href).href.replace(/\/$/,'');
function load(){
 if(!loading)loading=(async()=>{
  // The runtime is a classic script that writes to `exports`.
  self.exports={};importScripts(base+'/vision_bundle.js');
  const {FaceLandmarker,FilesetResolver}=self.exports;files=await FilesetResolver.forVisionTasks(base);
  landmarker=await FaceLandmarker.createFromOptions(files,{runningMode:'IMAGE',numFaces:6,outputFaceBlendshapes:true,outputFacialTransformationMatrixes:false,
   baseOptions:{modelAssetPath:base+'/face_landmarker.task',delegate:'CPU'}});
 })().catch(error=>{loading=null;throw error;});
 return loading;
}
// The person segmenter (Remove background, background.js): the same runtime, its own small model, loaded on first use.
function loadSegmenter(){
 if(!segLoading)segLoading=(async()=>{
  await load();const {ImageSegmenter}=self.exports;
  segmenter=await ImageSegmenter.createFromOptions(files,{runningMode:'IMAGE',outputCategoryMask:false,outputConfidenceMasks:true,baseOptions:{modelAssetPath:base+'/selfie_segmenter.tflite',delegate:'CPU'}});
 })().catch(error=>{segLoading=null;throw error;});
 return segLoading;
}
self.onmessage=async({data})=>{
 const {id}=data;
 try{
  if(data.type==='warm'){await load();self.postMessage({id,type:'ready'});return;}
  if(data.type==='segment'){
   await loadSegmenter();
   const t0=performance.now(),result=segmenter.segment(data.bitmap),masks=result.confidenceMasks||[];
   // The selfie model gives one mask per category (background, person) or one for the person alone; the main thread
   // settles which way round it is by the picture's corners.
   const m=masks[masks.length>1?1:0],mask=m?new Float32Array(m.getAsFloat32Array()):new Float32Array(0);
   const out={id,type:'mask',mask,width:m?.width||0,height:m?.height||0,count:masks.length,ms:performance.now()-t0};
   result.close?.();self.postMessage(out,[mask.buffer]);return;
  }
  if(data.type!=='find')return;
  await load();
  const t0=performance.now(),result=landmarker.detect(data.bitmap),ms=performance.now()-t0;
  const faces=result.faceLandmarks.map((points,i)=>{
   const flat=new Float32Array(points.length*2);for(let k=0;k<points.length;k++){flat[2*k]=points[k].x;flat[2*k+1]=points[k].y;}
   const scores={};for(const c of result.faceBlendshapes?.[i]?.categories||[])scores[c.categoryName]=Math.round(c.score*1000)/1000;
   return {points:flat,scores};
  });
  self.postMessage({id,type:'faces',faces,ms},faces.map(f=>f.points.buffer));
 }catch(error){self.postMessage({id,type:'error',message:String(error?.message||error)});}
 finally{data.bitmap?.close?.();}
};
