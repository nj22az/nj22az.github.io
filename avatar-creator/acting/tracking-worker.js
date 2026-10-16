// Images stay in this worker and are discarded after inference. Only numeric face parameters are returned.
const RUNTIME='https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21';
let detector;
self.onmessage=async({data})=>{
 if(data.type==='init'){
  try{const r=await fetch(RUNTIME+'/vision_bundle.cjs');if(!r.ok)throw Error('runtime');
   const url=URL.createObjectURL(new Blob([await r.text()],{type:'text/javascript'}));self.exports={};try{self.importScripts(url);}finally{URL.revokeObjectURL(url);}
   const {FaceLandmarker,FilesetResolver}=self.exports,files=await FilesetResolver.forVisionTasks(RUNTIME+'/wasm');
   detector=await FaceLandmarker.createFromOptions(files,{runningMode:'VIDEO',numFaces:1,outputFaceBlendshapes:true,outputFacialTransformationMatrixes:true,baseOptions:{modelAssetPath:new URL('./vendor/face_landmarker.task',self.location.href).href,delegate:'CPU'}});
   self.postMessage({type:'ready'});
  }catch{self.postMessage({type:'error',message:'Face tracking could not load. Check your connection and restart the camera.'});}
 }else if(data.type==='frame'){
  try{const r=detector.detectForVideo(data.frame,data.time);self.postMessage({type:'result',result:{faceLandmarks:r.faceLandmarks.length?[[]]:[],faceBlendshapes:r.faceBlendshapes,facialTransformationMatrixes:r.facialTransformationMatrixes}});}
  catch{self.postMessage({type:'error',message:'Face tracking stopped. Restart the camera to try again.'});}
  finally{data.frame.close();self.postMessage({type:'consumed'});}
 }
};
