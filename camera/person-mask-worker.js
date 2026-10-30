// Classic worker: the unmodified CommonJS bundle writes to `exports`. No picture leaves this device.
self.exports={};
// TFLite writes this successful CPU initialisation to stderr; retain real diagnostics as errors.
const reportError=console.error.bind(console);
console.error=(...args)=>{if(String(args[0]).startsWith('INFO: Created TensorFlow Lite XNNPACK delegate'))console.info(...args);else reportError(...args);};
let task;
self.onmessage=async({data:{id,image}})=>{
 try{
  if(!task){
   importScripts('./vendor/person-mask/vision_bundle.js');
   task=await exports.ImageSegmenter.createFromOptions({
    wasmLoaderPath:new URL('./vendor/person-mask/vision_wasm_internal.js',self.location).href,
    wasmBinaryPath:new URL('./vendor/person-mask/vision_wasm_internal.wasm',self.location).href,
   },{baseOptions:{modelAssetPath:new URL('./vendor/person-mask/selfie_segmenter.tflite',self.location).href,delegate:'CPU'},
    canvas:new OffscreenCanvas(256,256),runningMode:'IMAGE',outputConfidenceMasks:true,outputCategoryMask:false});
  }
  const started=performance.now();
  task.segment(image,result=>{
   const mask=result.confidenceMasks[0],values=new Float32Array(mask.getAsFloat32Array());
   self.postMessage({id,width:mask.width,height:mask.height,values,ms:performance.now()-started},[values.buffer]);
  });
 }catch(error){self.postMessage({id,error:String(error.message||error)});}
 finally{image.close();}
};
