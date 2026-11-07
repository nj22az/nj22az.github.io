/** The cut-out edge refined off the page's thread (matte.js refineMask); the pixels stay here and only the mask goes back. */
import {refineMask} from './matte.js?v=20261104ui1';
self.onmessage=({data})=>{
 const {id,rgba,w,h,coarse,cw,ch}=data;
 try{const mask=refineMask(new Uint8ClampedArray(rgba),w,h,coarse,cw,ch);self.postMessage({id,mask},[mask.buffer]);}
 catch(error){self.postMessage({id,error:String(error?.message||error)});}
};
