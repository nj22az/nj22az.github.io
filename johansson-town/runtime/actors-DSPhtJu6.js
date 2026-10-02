/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const C_=1;const P_=0,L_=1,I_=2;const D_=2;const N_=0;const U_=4;const k_=6;const la="attached",hh="detached";const F_=303;const O_=1e3,B_=1001,z_=1002,H_=1003,V_=1004,G_=1005,W_=1006,X_=1007,Y_=1008,q_=1009;const j_=1014,K_=1015,J_=1016;const Z_=1023;const $_=1026;const Q_=2300,ey=2301;const ty=1,ny=2;const iy=3201;const sy="",Ft="srgb",Ci="srgb-linear",ur="linear",lt="srgb";const ry=35048,ca="300 es";class Pi{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const i=this._listeners;return i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const s=this._listeners[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const i=this._listeners[e.type];if(i!==void 0){e.target=this;const s=i.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}}const It=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let ha=1234567;const es=Math.PI/180,wi=180/Math.PI;function Kt(){const n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(It[n&255]+It[n>>8&255]+It[n>>16&255]+It[n>>24&255]+"-"+It[e&255]+It[e>>8&255]+"-"+It[e>>16&15|64]+It[e>>24&255]+"-"+It[t&63|128]+It[t>>8&255]+"-"+It[t>>16&255]+It[t>>24&255]+It[i&255]+It[i>>8&255]+It[i>>16&255]+It[i>>24&255]).toLowerCase()}function Tt(n,e,t){return Math.max(e,Math.min(t,n))}function Uo(n,e){return(n%e+e)%e}function uh(n,e,t,i,s){return i+(n-e)*(s-i)/(t-e)}function dh(n,e,t){return n!==e?(t-n)/(e-n):0}function ts(n,e,t){return(1-t)*n+t*e}function fh(n,e,t,i){return ts(n,e,1-Math.exp(-t*i))}function ph(n,e=1){return e-Math.abs(Uo(n,e*2)-e)}function mh(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*(3-2*n))}function gh(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*n*(n*(n*6-15)+10))}function _h(n,e){return n+Math.floor(Math.random()*(e-n+1))}function yh(n,e){return n+Math.random()*(e-n)}function vh(n){return n*(.5-Math.random())}function bh(n){n!==void 0&&(ha=n);let e=ha+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Mh(n){return n*es}function xh(n){return n*wi}function Sh(n){return(n&n-1)===0&&n!==0}function wh(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function Th(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function Eh(n,e,t,i,s){const r=Math.cos,o=Math.sin,a=r(t/2),l=o(t/2),c=r((e+i)/2),h=o((e+i)/2),u=r((e-i)/2),p=o((e-i)/2),f=r((i-e)/2),g=o((i-e)/2);switch(s){case"XYX":n.set(a*h,l*u,l*p,a*c);break;case"YZY":n.set(l*p,a*h,l*u,a*c);break;case"ZXZ":n.set(l*u,l*p,a*h,a*c);break;case"XZX":n.set(a*h,l*g,l*f,a*c);break;case"YXY":n.set(l*f,a*h,l*g,a*c);break;case"ZYZ":n.set(l*g,l*f,a*h,a*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function tn(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function at(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}const Ue={DEG2RAD:es,RAD2DEG:wi,generateUUID:Kt,clamp:Tt,euclideanModulo:Uo,mapLinear:uh,inverseLerp:dh,lerp:ts,damp:fh,pingpong:ph,smoothstep:mh,smootherstep:gh,randInt:_h,randFloat:yh,randFloatSpread:vh,seededRandom:bh,degToRad:Mh,radToDeg:xh,isPowerOfTwo:Sh,ceilPowerOfTwo:wh,floorPowerOfTwo:Th,setQuaternionFromProperEuler:Eh,normalize:at,denormalize:tn};class ce{constructor(e=0,t=0){ce.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6],this.y=s[1]*t+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(Tt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*i-o*s+e.x,this.y=r*s+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class qe{constructor(e,t,i,s,r,o,a,l,c){qe.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,a,l,c)}set(e,t,i,s,r,o,a,l,c){const h=this.elements;return h[0]=e,h[1]=s,h[2]=a,h[3]=t,h[4]=r,h[5]=l,h[6]=i,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],h=i[4],u=i[7],p=i[2],f=i[5],g=i[8],y=s[0],m=s[3],d=s[6],b=s[1],v=s[4],_=s[7],R=s[2],w=s[5],A=s[8];return r[0]=o*y+a*b+l*R,r[3]=o*m+a*v+l*w,r[6]=o*d+a*_+l*A,r[1]=c*y+h*b+u*R,r[4]=c*m+h*v+u*w,r[7]=c*d+h*_+u*A,r[2]=p*y+f*b+g*R,r[5]=p*m+f*v+g*w,r[8]=p*d+f*_+g*A,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8];return t*o*h-t*a*c-i*r*h+i*a*l+s*r*c-s*o*l}invert(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=h*o-a*c,p=a*l-h*r,f=c*r-o*l,g=t*u+i*p+s*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const y=1/g;return e[0]=u*y,e[1]=(s*c-h*i)*y,e[2]=(a*i-s*o)*y,e[3]=p*y,e[4]=(h*t-s*l)*y,e[5]=(s*r-a*t)*y,e[6]=f*y,e[7]=(i*l-c*t)*y,e[8]=(o*t-i*r)*y,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,s,r,o,a){const l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*o+c*a)+o+e,-s*c,s*l,-s*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(Sr.makeScale(e,t)),this}rotate(e){return this.premultiply(Sr.makeRotation(-e)),this}translate(e,t){return this.premultiply(Sr.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let s=0;s<9;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Sr=new qe;function Kl(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function ss(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function Ah(){const n=ss("canvas");return n.style.display="block",n}const ua={};function Zi(n){n in ua||(ua[n]=!0,console.warn(n))}function Rh(n,e,t){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}function Ch(n){const e=n.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function Ph(n){const e=n.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const Qe={enabled:!0,workingColorSpace:Ci,spaces:{},convert:function(n,e,t){return this.enabled===!1||e===t||!e||!t||(this.spaces[e].transfer===lt&&(n.r=vn(n.r),n.g=vn(n.g),n.b=vn(n.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(n.applyMatrix3(this.spaces[e].toXYZ),n.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===lt&&(n.r=vi(n.r),n.g=vi(n.g),n.b=vi(n.b))),n},fromWorkingColorSpace:function(n,e){return this.convert(n,this.workingColorSpace,e)},toWorkingColorSpace:function(n,e){return this.convert(n,e,this.workingColorSpace)},getPrimaries:function(n){return this.spaces[n].primaries},getTransfer:function(n){return n===""?ur:this.spaces[n].transfer},getLuminanceCoefficients:function(n,e=this.workingColorSpace){return n.fromArray(this.spaces[e].luminanceCoefficients)},define:function(n){Object.assign(this.spaces,n)},_getMatrix:function(n,e,t){return n.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(n){return this.spaces[n].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(n=this.workingColorSpace){return this.spaces[n].workingColorSpaceConfig.unpackColorSpace}};function vn(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function vi(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}const da=[.64,.33,.3,.6,.15,.06],fa=[.2126,.7152,.0722],pa=[.3127,.329],ma=new qe().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),ga=new qe().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);Qe.define({[Ci]:{primaries:da,whitePoint:pa,transfer:ur,toXYZ:ma,fromXYZ:ga,luminanceCoefficients:fa,workingColorSpaceConfig:{unpackColorSpace:Ft},outputColorSpaceConfig:{drawingBufferColorSpace:Ft}},[Ft]:{primaries:da,whitePoint:pa,transfer:lt,toXYZ:ma,fromXYZ:ga,luminanceCoefficients:fa,outputColorSpaceConfig:{drawingBufferColorSpace:Ft}}});let $n;class Lh{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{$n===void 0&&($n=ss("canvas")),$n.width=e.width,$n.height=e.height;const i=$n.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),t=$n}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=ss("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=vn(r[o]/255)*255;return i.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(vn(t[i]/255)*255):t[i]=vn(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Ih=0;class Jl{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Ih++}),this.uuid=Kt(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(wr(s[o].image)):r.push(wr(s[o]))}else r=wr(s);i.url=r}return t||(e.images[this.uuid]=i),i}}function wr(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?Lh.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Dh=0;class Ct extends Pi{constructor(e=Ct.DEFAULT_IMAGE,t=Ct.DEFAULT_MAPPING,i=1001,s=1001,r=1006,o=1008,a=1023,l=1009,c=Ct.DEFAULT_ANISOTROPY,h=""){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Dh++}),this.uuid=Kt(),this.name="",this.source=new Jl(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new ce(0,0),this.repeat=new ce(1,1),this.center=new ce(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new qe,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case 1e3:e.x=e.x-Math.floor(e.x);break;case 1001:e.x=e.x<0?0:1;break;case 1002:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case 1e3:e.y=e.y-Math.floor(e.y);break;case 1001:e.y=e.y<0?0:1;break;case 1002:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Ct.DEFAULT_IMAGE=null;Ct.DEFAULT_MAPPING=300;Ct.DEFAULT_ANISOTROPY=1;class tt{constructor(e=0,t=0,i=0,s=1){tt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*i+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*i+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*i+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,s,r;const l=e.elements,c=l[0],h=l[4],u=l[8],p=l[1],f=l[5],g=l[9],y=l[2],m=l[6],d=l[10];if(Math.abs(h-p)<.01&&Math.abs(u-y)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+p)<.1&&Math.abs(u+y)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+d-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const v=(c+1)/2,_=(f+1)/2,R=(d+1)/2,w=(h+p)/4,A=(u+y)/4,C=(g+m)/4;return v>_&&v>R?v<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(v),s=w/i,r=A/i):_>R?_<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(_),i=w/s,r=C/s):R<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(R),i=A/r,s=C/r),this.set(i,s,r,t),this}let b=Math.sqrt((m-g)*(m-g)+(u-y)*(u-y)+(p-h)*(p-h));return Math.abs(b)<.001&&(b=1),this.x=(m-g)/b,this.y=(u-y)/b,this.z=(p-h)/b,this.w=Math.acos((c+f+d-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Nh extends Pi{constructor(e=1,t=1,i={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new tt(0,0,e,t),this.scissorTest=!1,this.viewport=new tt(0,0,e,t);const s={width:e,height:t,depth:1};i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:1006,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},i);const r=new Ct(s,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace);r.flipY=!1,r.generateMipmaps=i.generateMipmaps,r.internalFormat=i.internalFormat,this.textures=[];const o=i.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=i;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let i=0,s=e.textures.length;i<s;i++)this.textures[i]=e.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new Jl(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Kn extends Nh{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class Zl extends Ct{constructor(e=null,t=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Uh extends Ct{constructor(e=null,t=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class gt{constructor(e=0,t=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=s}static slerpFlat(e,t,i,s,r,o,a){let l=i[s+0],c=i[s+1],h=i[s+2],u=i[s+3];const p=r[o+0],f=r[o+1],g=r[o+2],y=r[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u;return}if(a===1){e[t+0]=p,e[t+1]=f,e[t+2]=g,e[t+3]=y;return}if(u!==y||l!==p||c!==f||h!==g){let m=1-a;const d=l*p+c*f+h*g+u*y,b=d>=0?1:-1,v=1-d*d;if(v>Number.EPSILON){const R=Math.sqrt(v),w=Math.atan2(R,d*b);m=Math.sin(m*w)/R,a=Math.sin(a*w)/R}const _=a*b;if(l=l*m+p*_,c=c*m+f*_,h=h*m+g*_,u=u*m+y*_,m===1-a){const R=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=R,c*=R,h*=R,u*=R}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,i,s,r,o){const a=i[s],l=i[s+1],c=i[s+2],h=i[s+3],u=r[o],p=r[o+1],f=r[o+2],g=r[o+3];return e[t]=a*g+h*u+l*f-c*p,e[t+1]=l*g+h*p+c*u-a*f,e[t+2]=c*g+h*f+a*p-l*u,e[t+3]=h*g-a*u-l*p-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,s){return this._x=e,this._y=t,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(i/2),h=a(s/2),u=a(r/2),p=l(i/2),f=l(s/2),g=l(r/2);switch(o){case"XYZ":this._x=p*h*u+c*f*g,this._y=c*f*u-p*h*g,this._z=c*h*g+p*f*u,this._w=c*h*u-p*f*g;break;case"YXZ":this._x=p*h*u+c*f*g,this._y=c*f*u-p*h*g,this._z=c*h*g-p*f*u,this._w=c*h*u+p*f*g;break;case"ZXY":this._x=p*h*u-c*f*g,this._y=c*f*u+p*h*g,this._z=c*h*g+p*f*u,this._w=c*h*u-p*f*g;break;case"ZYX":this._x=p*h*u-c*f*g,this._y=c*f*u+p*h*g,this._z=c*h*g-p*f*u,this._w=c*h*u+p*f*g;break;case"YZX":this._x=p*h*u+c*f*g,this._y=c*f*u+p*h*g,this._z=c*h*g-p*f*u,this._w=c*h*u-p*f*g;break;case"XZY":this._x=p*h*u-c*f*g,this._y=c*f*u-p*h*g,this._z=c*h*g+p*f*u,this._w=c*h*u+p*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],h=t[6],u=t[10],p=i+a+u;if(p>0){const f=.5/Math.sqrt(p+1);this._w=.25/f,this._x=(h-l)*f,this._y=(r-c)*f,this._z=(o-s)*f}else if(i>a&&i>u){const f=2*Math.sqrt(1+i-a-u);this._w=(h-l)/f,this._x=.25*f,this._y=(s+o)/f,this._z=(r+c)/f}else if(a>u){const f=2*Math.sqrt(1+a-i-u);this._w=(r-c)/f,this._x=(s+o)/f,this._y=.25*f,this._z=(l+h)/f}else{const f=2*Math.sqrt(1+u-i-a);this._w=(o-s)/f,this._x=(r+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Tt(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const s=Math.min(1,t/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,h=t._w;return this._x=i*h+o*a+s*c-r*l,this._y=s*h+o*l+r*a-i*c,this._z=r*h+o*c+i*l-s*a,this._w=o*h-i*a-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const i=this._x,s=this._y,r=this._z,o=this._w;let a=o*e._w+i*e._x+s*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=i,this._y=s,this._z=r,this;const l=1-a*a;if(l<=Number.EPSILON){const f=1-t;return this._w=f*o+t*this._w,this._x=f*i+t*this._x,this._y=f*s+t*this._y,this._z=f*r+t*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,a),u=Math.sin((1-t)*h)/c,p=Math.sin(t*h)/c;return this._w=o*u+this._w*p,this._x=i*u+this._x*p,this._y=s*u+this._y*p,this._z=r*u+this._z*p,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class L{constructor(e=0,t=0,i=0){L.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(_a.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(_a.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*s,this.y=r[1]*t+r[4]*i+r[7]*s,this.z=r[2]*t+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*i+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*i+r[10]*s+r[14])*o,this}applyQuaternion(e){const t=this.x,i=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*s-a*i),h=2*(a*t-r*s),u=2*(r*i-o*t);return this.x=t+l*c+o*u-a*h,this.y=i+l*h+a*c-r*u,this.z=s+l*u+r*h-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*s,this.y=r[1]*t+r[5]*i+r[9]*s,this.z=r[2]*t+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-i*l,this.z=i*a-s*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Tr.copy(this).projectOnVector(e),this.sub(Tr)}reflect(e){return this.sub(Tr.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(Tt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return t*t+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const s=Math.sin(t)*e;return this.x=s*Math.sin(i),this.y=Math.cos(t)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Tr=new L,_a=new gt;class Un{constructor(e=new L(1/0,1/0,1/0),t=new L(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint($t.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint($t.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=$t.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,$t):$t.fromBufferAttribute(r,o),$t.applyMatrix4(e.matrixWorld),this.expandByPoint($t);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),fs.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),fs.copy(i.boundingBox)),fs.applyMatrix4(e.matrixWorld),this.union(fs)}const s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,$t),$t.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Oi),ps.subVectors(this.max,Oi),Qn.subVectors(e.a,Oi),ei.subVectors(e.b,Oi),ti.subVectors(e.c,Oi),wn.subVectors(ei,Qn),Tn.subVectors(ti,ei),Fn.subVectors(Qn,ti);let t=[0,-wn.z,wn.y,0,-Tn.z,Tn.y,0,-Fn.z,Fn.y,wn.z,0,-wn.x,Tn.z,0,-Tn.x,Fn.z,0,-Fn.x,-wn.y,wn.x,0,-Tn.y,Tn.x,0,-Fn.y,Fn.x,0];return!Er(t,Qn,ei,ti,ps)||(t=[1,0,0,0,1,0,0,0,1],!Er(t,Qn,ei,ti,ps))?!1:(ms.crossVectors(wn,Tn),t=[ms.x,ms.y,ms.z],Er(t,Qn,ei,ti,ps))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,$t).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize($t).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(dn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),dn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),dn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),dn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),dn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),dn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),dn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),dn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(dn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const dn=[new L,new L,new L,new L,new L,new L,new L,new L],$t=new L,fs=new Un,Qn=new L,ei=new L,ti=new L,wn=new L,Tn=new L,Fn=new L,Oi=new L,ps=new L,ms=new L,On=new L;function Er(n,e,t,i,s){for(let r=0,o=n.length-3;r<=o;r+=3){On.fromArray(n,r);const a=s.x*Math.abs(On.x)+s.y*Math.abs(On.y)+s.z*Math.abs(On.z),l=e.dot(On),c=t.dot(On),h=i.dot(On);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}const kh=new Un,Bi=new L,Ar=new L;class bn{constructor(e=new L,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):kh.setFromPoints(e).getCenter(i);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Bi.subVectors(e,this.center);const t=Bi.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),s=(i-this.radius)*.5;this.center.addScaledVector(Bi,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Ar.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Bi.copy(e.center).add(Ar)),this.expandByPoint(Bi.copy(e.center).sub(Ar))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const fn=new L,Rr=new L,gs=new L,En=new L,Cr=new L,_s=new L,Pr=new L;class ls{constructor(e=new L,t=new L(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,fn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=fn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(fn.copy(this.origin).addScaledVector(this.direction,t),fn.distanceToSquared(e))}distanceSqToSegment(e,t,i,s){Rr.copy(e).add(t).multiplyScalar(.5),gs.copy(t).sub(e).normalize(),En.copy(this.origin).sub(Rr);const r=e.distanceTo(t)*.5,o=-this.direction.dot(gs),a=En.dot(this.direction),l=-En.dot(gs),c=En.lengthSq(),h=Math.abs(1-o*o);let u,p,f,g;if(h>0)if(u=o*l-a,p=o*a-l,g=r*h,u>=0)if(p>=-g)if(p<=g){const y=1/h;u*=y,p*=y,f=u*(u+o*p+2*a)+p*(o*u+p+2*l)+c}else p=r,u=Math.max(0,-(o*p+a)),f=-u*u+p*(p+2*l)+c;else p=-r,u=Math.max(0,-(o*p+a)),f=-u*u+p*(p+2*l)+c;else p<=-g?(u=Math.max(0,-(-o*r+a)),p=u>0?-r:Math.min(Math.max(-r,-l),r),f=-u*u+p*(p+2*l)+c):p<=g?(u=0,p=Math.min(Math.max(-r,-l),r),f=p*(p+2*l)+c):(u=Math.max(0,-(o*r+a)),p=u>0?r:Math.min(Math.max(-r,-l),r),f=-u*u+p*(p+2*l)+c);else p=o>0?-r:r,u=Math.max(0,-(o*p+a)),f=-u*u+p*(p+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(Rr).addScaledVector(gs,p),f}intersectSphere(e,t){fn.subVectors(e.center,this.origin);const i=fn.dot(this.direction),s=fn.dot(fn)-i*i,r=e.radius*e.radius;if(s>r)return null;const o=Math.sqrt(r-s),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,s,r,o,a,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,p=this.origin;return c>=0?(i=(e.min.x-p.x)*c,s=(e.max.x-p.x)*c):(i=(e.max.x-p.x)*c,s=(e.min.x-p.x)*c),h>=0?(r=(e.min.y-p.y)*h,o=(e.max.y-p.y)*h):(r=(e.max.y-p.y)*h,o=(e.min.y-p.y)*h),i>o||r>s||((r>i||isNaN(i))&&(i=r),(o<s||isNaN(s))&&(s=o),u>=0?(a=(e.min.z-p.z)*u,l=(e.max.z-p.z)*u):(a=(e.max.z-p.z)*u,l=(e.min.z-p.z)*u),i>l||a>s)||((a>i||i!==i)&&(i=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,t)}intersectsBox(e){return this.intersectBox(e,fn)!==null}intersectTriangle(e,t,i,s,r){Cr.subVectors(t,e),_s.subVectors(i,e),Pr.crossVectors(Cr,_s);let o=this.direction.dot(Pr),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;En.subVectors(this.origin,e);const l=a*this.direction.dot(_s.crossVectors(En,_s));if(l<0)return null;const c=a*this.direction.dot(Cr.cross(En));if(c<0||l+c>o)return null;const h=-a*En.dot(Pr);return h<0?null:this.at(h/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class He{constructor(e,t,i,s,r,o,a,l,c,h,u,p,f,g,y,m){He.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,a,l,c,h,u,p,f,g,y,m)}set(e,t,i,s,r,o,a,l,c,h,u,p,f,g,y,m){const d=this.elements;return d[0]=e,d[4]=t,d[8]=i,d[12]=s,d[1]=r,d[5]=o,d[9]=a,d[13]=l,d[2]=c,d[6]=h,d[10]=u,d[14]=p,d[3]=f,d[7]=g,d[11]=y,d[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new He().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,i=e.elements,s=1/ni.setFromMatrixColumn(e,0).length(),r=1/ni.setFromMatrixColumn(e,1).length(),o=1/ni.setFromMatrixColumn(e,2).length();return t[0]=i[0]*s,t[1]=i[1]*s,t[2]=i[2]*s,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,s=e.y,r=e.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){const p=o*h,f=o*u,g=a*h,y=a*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=f+g*c,t[5]=p-y*c,t[9]=-a*l,t[2]=y-p*c,t[6]=g+f*c,t[10]=o*l}else if(e.order==="YXZ"){const p=l*h,f=l*u,g=c*h,y=c*u;t[0]=p+y*a,t[4]=g*a-f,t[8]=o*c,t[1]=o*u,t[5]=o*h,t[9]=-a,t[2]=f*a-g,t[6]=y+p*a,t[10]=o*l}else if(e.order==="ZXY"){const p=l*h,f=l*u,g=c*h,y=c*u;t[0]=p-y*a,t[4]=-o*u,t[8]=g+f*a,t[1]=f+g*a,t[5]=o*h,t[9]=y-p*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){const p=o*h,f=o*u,g=a*h,y=a*u;t[0]=l*h,t[4]=g*c-f,t[8]=p*c+y,t[1]=l*u,t[5]=y*c+p,t[9]=f*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){const p=o*l,f=o*c,g=a*l,y=a*c;t[0]=l*h,t[4]=y-p*u,t[8]=g*u+f,t[1]=u,t[5]=o*h,t[9]=-a*h,t[2]=-c*h,t[6]=f*u+g,t[10]=p-y*u}else if(e.order==="XZY"){const p=o*l,f=o*c,g=a*l,y=a*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=p*u+y,t[5]=o*h,t[9]=f*u-g,t[2]=g*u-f,t[6]=a*h,t[10]=y*u+p}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Fh,e,Oh)}lookAt(e,t,i){const s=this.elements;return Vt.subVectors(e,t),Vt.lengthSq()===0&&(Vt.z=1),Vt.normalize(),An.crossVectors(i,Vt),An.lengthSq()===0&&(Math.abs(i.z)===1?Vt.x+=1e-4:Vt.z+=1e-4,Vt.normalize(),An.crossVectors(i,Vt)),An.normalize(),ys.crossVectors(Vt,An),s[0]=An.x,s[4]=ys.x,s[8]=Vt.x,s[1]=An.y,s[5]=ys.y,s[9]=Vt.y,s[2]=An.z,s[6]=ys.z,s[10]=Vt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],h=i[1],u=i[5],p=i[9],f=i[13],g=i[2],y=i[6],m=i[10],d=i[14],b=i[3],v=i[7],_=i[11],R=i[15],w=s[0],A=s[4],C=s[8],S=s[12],M=s[1],I=s[5],z=s[9],N=s[13],O=s[2],X=s[6],Y=s[10],se=s[14],U=s[3],x=s[7],F=s[11],oe=s[15];return r[0]=o*w+a*M+l*O+c*U,r[4]=o*A+a*I+l*X+c*x,r[8]=o*C+a*z+l*Y+c*F,r[12]=o*S+a*N+l*se+c*oe,r[1]=h*w+u*M+p*O+f*U,r[5]=h*A+u*I+p*X+f*x,r[9]=h*C+u*z+p*Y+f*F,r[13]=h*S+u*N+p*se+f*oe,r[2]=g*w+y*M+m*O+d*U,r[6]=g*A+y*I+m*X+d*x,r[10]=g*C+y*z+m*Y+d*F,r[14]=g*S+y*N+m*se+d*oe,r[3]=b*w+v*M+_*O+R*U,r[7]=b*A+v*I+_*X+R*x,r[11]=b*C+v*z+_*Y+R*F,r[15]=b*S+v*N+_*se+R*oe,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],h=e[2],u=e[6],p=e[10],f=e[14],g=e[3],y=e[7],m=e[11],d=e[15];return g*(+r*l*u-s*c*u-r*a*p+i*c*p+s*a*f-i*l*f)+y*(+t*l*f-t*c*p+r*o*p-s*o*f+s*c*h-r*l*h)+m*(+t*c*u-t*a*f-r*o*u+i*o*f+r*a*h-i*c*h)+d*(-s*a*h-t*l*u+t*a*p+s*o*u-i*o*p+i*l*h)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=e[9],p=e[10],f=e[11],g=e[12],y=e[13],m=e[14],d=e[15],b=u*m*c-y*p*c+y*l*f-a*m*f-u*l*d+a*p*d,v=g*p*c-h*m*c-g*l*f+o*m*f+h*l*d-o*p*d,_=h*y*c-g*u*c+g*a*f-o*y*f-h*a*d+o*u*d,R=g*u*l-h*y*l-g*a*p+o*y*p+h*a*m-o*u*m,w=t*b+i*v+s*_+r*R;if(w===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const A=1/w;return e[0]=b*A,e[1]=(y*p*r-u*m*r-y*s*f+i*m*f+u*s*d-i*p*d)*A,e[2]=(a*m*r-y*l*r+y*s*c-i*m*c-a*s*d+i*l*d)*A,e[3]=(u*l*r-a*p*r-u*s*c+i*p*c+a*s*f-i*l*f)*A,e[4]=v*A,e[5]=(h*m*r-g*p*r+g*s*f-t*m*f-h*s*d+t*p*d)*A,e[6]=(g*l*r-o*m*r-g*s*c+t*m*c+o*s*d-t*l*d)*A,e[7]=(o*p*r-h*l*r+h*s*c-t*p*c-o*s*f+t*l*f)*A,e[8]=_*A,e[9]=(g*u*r-h*y*r-g*i*f+t*y*f+h*i*d-t*u*d)*A,e[10]=(o*y*r-g*a*r+g*i*c-t*y*c-o*i*d+t*a*d)*A,e[11]=(h*a*r-o*u*r-h*i*c+t*u*c+o*i*f-t*a*f)*A,e[12]=R*A,e[13]=(h*y*s-g*u*s+g*i*p-t*y*p-h*i*m+t*u*m)*A,e[14]=(g*a*s-o*y*s-g*i*l+t*y*l+o*i*m-t*a*m)*A,e[15]=(o*u*s-h*a*s+h*i*l-t*u*l-o*i*p+t*a*p)*A,this}scale(e){const t=this.elements,i=e.x,s=e.y,r=e.z;return t[0]*=i,t[4]*=s,t[8]*=r,t[1]*=i,t[5]*=s,t[9]*=r,t[2]*=i,t[6]*=s,t[10]*=r,t[3]*=i,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,s))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),s=Math.sin(t),r=1-i,o=e.x,a=e.y,l=e.z,c=r*o,h=r*a;return this.set(c*o+i,c*a-s*l,c*l+s*a,0,c*a+s*l,h*a+i,h*l-s*o,0,c*l-s*a,h*l+s*o,r*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,s,r,o){return this.set(1,i,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,i){const s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,h=o+o,u=a+a,p=r*c,f=r*h,g=r*u,y=o*h,m=o*u,d=a*u,b=l*c,v=l*h,_=l*u,R=i.x,w=i.y,A=i.z;return s[0]=(1-(y+d))*R,s[1]=(f+_)*R,s[2]=(g-v)*R,s[3]=0,s[4]=(f-_)*w,s[5]=(1-(p+d))*w,s[6]=(m+b)*w,s[7]=0,s[8]=(g+v)*A,s[9]=(m-b)*A,s[10]=(1-(p+y))*A,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,i){const s=this.elements;let r=ni.set(s[0],s[1],s[2]).length();const o=ni.set(s[4],s[5],s[6]).length(),a=ni.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],Qt.copy(this);const c=1/r,h=1/o,u=1/a;return Qt.elements[0]*=c,Qt.elements[1]*=c,Qt.elements[2]*=c,Qt.elements[4]*=h,Qt.elements[5]*=h,Qt.elements[6]*=h,Qt.elements[8]*=u,Qt.elements[9]*=u,Qt.elements[10]*=u,t.setFromRotationMatrix(Qt),i.x=r,i.y=o,i.z=a,this}makePerspective(e,t,i,s,r,o,a=2e3){const l=this.elements,c=2*r/(t-e),h=2*r/(i-s),u=(t+e)/(t-e),p=(i+s)/(i-s);let f,g;if(a===2e3)f=-(o+r)/(o-r),g=-2*o*r/(o-r);else if(a===2001)f=-o/(o-r),g=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=p,l[13]=0,l[2]=0,l[6]=0,l[10]=f,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,s,r,o,a=2e3){const l=this.elements,c=1/(t-e),h=1/(i-s),u=1/(o-r),p=(t+e)*c,f=(i+s)*h;let g,y;if(a===2e3)g=(o+r)*u,y=-2*u;else if(a===2001)g=r*u,y=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-p,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-f,l[2]=0,l[6]=0,l[10]=y,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let s=0;s<16;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}}const ni=new L,Qt=new He,Fh=new L(0,0,0),Oh=new L(1,1,1),An=new L,ys=new L,Vt=new L,ya=new He,va=new gt;class sn{constructor(e=0,t=0,i=0,s=sn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,s=this._order){return this._x=e,this._y=t,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],h=s[9],u=s[2],p=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(Tt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(p,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Tt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(Tt(p,-1,1)),Math.abs(p)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Tt(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(p,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Tt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-Tt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(p,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return ya.makeRotationFromQuaternion(e),this.setFromRotationMatrix(ya,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return va.setFromEuler(this),this.setFromQuaternion(va,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}sn.DEFAULT_ORDER="XYZ";class ko{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Bh=0;const ba=new L,ii=new gt,pn=new He,vs=new L,zi=new L,zh=new L,Hh=new gt,Ma=new L(1,0,0),xa=new L(0,1,0),Sa=new L(0,0,1),wa={type:"added"},Vh={type:"removed"},si={type:"childadded",child:null},Lr={type:"childremoved",child:null};class vt extends Pi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Bh++}),this.uuid=Kt(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=vt.DEFAULT_UP.clone();const e=new L,t=new sn,i=new gt,s=new L(1,1,1);function r(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new He},normalMatrix:{value:new qe}}),this.matrix=new He,this.matrixWorld=new He,this.matrixAutoUpdate=vt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=vt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ko,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ii.setFromAxisAngle(e,t),this.quaternion.multiply(ii),this}rotateOnWorldAxis(e,t){return ii.setFromAxisAngle(e,t),this.quaternion.premultiply(ii),this}rotateX(e){return this.rotateOnAxis(Ma,e)}rotateY(e){return this.rotateOnAxis(xa,e)}rotateZ(e){return this.rotateOnAxis(Sa,e)}translateOnAxis(e,t){return ba.copy(e).applyQuaternion(this.quaternion),this.position.add(ba.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Ma,e)}translateY(e){return this.translateOnAxis(xa,e)}translateZ(e){return this.translateOnAxis(Sa,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(pn.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?vs.copy(e):vs.set(e,t,i);const s=this.parent;this.updateWorldMatrix(!0,!1),zi.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?pn.lookAt(zi,vs,this.up):pn.lookAt(vs,zi,this.up),this.quaternion.setFromRotationMatrix(pn),s&&(pn.extractRotation(s.matrixWorld),ii.setFromRotationMatrix(pn),this.quaternion.premultiply(ii.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(wa),si.child=e,this.dispatchEvent(si),si.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Vh),Lr.child=e,this.dispatchEvent(Lr),Lr.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),pn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),pn.multiply(e.parent.matrixWorld)),e.applyMatrix4(pn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(wa),si.child=e,this.dispatchEvent(si),si.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,s=this.children.length;i<s;i++){const o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(zi,e,zh),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(zi,Hh,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t){const i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];r(e.shapes,u)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){const a=o(e.geometries),l=o(e.materials),c=o(e.textures),h=o(e.images),u=o(e.shapes),p=o(e.skeletons),f=o(e.animations),g=o(e.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),h.length>0&&(i.images=h),u.length>0&&(i.shapes=u),p.length>0&&(i.skeletons=p),f.length>0&&(i.animations=f),g.length>0&&(i.nodes=g)}return i.object=s,i;function o(a){const l=[];for(const c in a){const h=a[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const s=e.children[i];this.add(s.clone())}return this}}vt.DEFAULT_UP=new L(0,1,0);vt.DEFAULT_MATRIX_AUTO_UPDATE=!0;vt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const en=new L,mn=new L,Ir=new L,gn=new L,ri=new L,oi=new L,Ta=new L,Dr=new L,Nr=new L,Ur=new L,kr=new tt,Fr=new tt,Or=new tt;class jt{constructor(e=new L,t=new L,i=new L){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,s){s.subVectors(i,t),en.subVectors(e,t),s.cross(en);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,i,s,r){en.subVectors(s,t),mn.subVectors(i,t),Ir.subVectors(e,t);const o=en.dot(en),a=en.dot(mn),l=en.dot(Ir),c=mn.dot(mn),h=mn.dot(Ir),u=o*c-a*a;if(u===0)return r.set(0,0,0),null;const p=1/u,f=(c*l-a*h)*p,g=(o*h-a*l)*p;return r.set(1-f-g,g,f)}static containsPoint(e,t,i,s){return this.getBarycoord(e,t,i,s,gn)===null?!1:gn.x>=0&&gn.y>=0&&gn.x+gn.y<=1}static getInterpolation(e,t,i,s,r,o,a,l){return this.getBarycoord(e,t,i,s,gn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,gn.x),l.addScaledVector(o,gn.y),l.addScaledVector(a,gn.z),l)}static getInterpolatedAttribute(e,t,i,s,r,o){return kr.setScalar(0),Fr.setScalar(0),Or.setScalar(0),kr.fromBufferAttribute(e,t),Fr.fromBufferAttribute(e,i),Or.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(kr,r.x),o.addScaledVector(Fr,r.y),o.addScaledVector(Or,r.z),o}static isFrontFacing(e,t,i,s){return en.subVectors(i,t),mn.subVectors(e,t),en.cross(mn).dot(s)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,s){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,i,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return en.subVectors(this.c,this.b),mn.subVectors(this.a,this.b),en.cross(mn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return jt.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return jt.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,s,r){return jt.getInterpolation(e,this.a,this.b,this.c,t,i,s,r)}containsPoint(e){return jt.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return jt.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,s=this.b,r=this.c;let o,a;ri.subVectors(s,i),oi.subVectors(r,i),Dr.subVectors(e,i);const l=ri.dot(Dr),c=oi.dot(Dr);if(l<=0&&c<=0)return t.copy(i);Nr.subVectors(e,s);const h=ri.dot(Nr),u=oi.dot(Nr);if(h>=0&&u<=h)return t.copy(s);const p=l*u-h*c;if(p<=0&&l>=0&&h<=0)return o=l/(l-h),t.copy(i).addScaledVector(ri,o);Ur.subVectors(e,r);const f=ri.dot(Ur),g=oi.dot(Ur);if(g>=0&&f<=g)return t.copy(r);const y=f*c-l*g;if(y<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(i).addScaledVector(oi,a);const m=h*g-f*u;if(m<=0&&u-h>=0&&f-g>=0)return Ta.subVectors(r,s),a=(u-h)/(u-h+(f-g)),t.copy(s).addScaledVector(Ta,a);const d=1/(m+y+p);return o=y*d,a=p*d,t.copy(i).addScaledVector(ri,o).addScaledVector(oi,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const $l={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Rn={h:0,s:0,l:0},bs={h:0,s:0,l:0};function Br(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}class Ne{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Ft){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Qe.toWorkingColorSpace(this,t),this}setRGB(e,t,i,s=Qe.workingColorSpace){return this.r=e,this.g=t,this.b=i,Qe.toWorkingColorSpace(this,s),this}setHSL(e,t,i,s=Qe.workingColorSpace){if(e=Uo(e,1),t=Tt(t,0,1),i=Tt(i,0,1),t===0)this.r=this.g=this.b=i;else{const r=i<=.5?i*(1+t):i+t-i*t,o=2*i-r;this.r=Br(o,r,e+1/3),this.g=Br(o,r,e),this.b=Br(o,r,e-1/3)}return Qe.toWorkingColorSpace(this,s),this}setStyle(e,t=Ft){function i(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Ft){const i=$l[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=vn(e.r),this.g=vn(e.g),this.b=vn(e.b),this}copyLinearToSRGB(e){return this.r=vi(e.r),this.g=vi(e.g),this.b=vi(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Ft){return Qe.fromWorkingColorSpace(Dt.copy(this),e),Math.round(Tt(Dt.r*255,0,255))*65536+Math.round(Tt(Dt.g*255,0,255))*256+Math.round(Tt(Dt.b*255,0,255))}getHexString(e=Ft){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Qe.workingColorSpace){Qe.fromWorkingColorSpace(Dt.copy(this),t);const i=Dt.r,s=Dt.g,r=Dt.b,o=Math.max(i,s,r),a=Math.min(i,s,r);let l,c;const h=(a+o)/2;if(a===o)l=0,c=0;else{const u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case i:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-i)/u+2;break;case r:l=(i-s)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=Qe.workingColorSpace){return Qe.fromWorkingColorSpace(Dt.copy(this),t),e.r=Dt.r,e.g=Dt.g,e.b=Dt.b,e}getStyle(e=Ft){Qe.fromWorkingColorSpace(Dt.copy(this),e);const t=Dt.r,i=Dt.g,s=Dt.b;return e!==Ft?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(e,t,i){return this.getHSL(Rn),this.setHSL(Rn.h+e,Rn.s+t,Rn.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Rn),e.getHSL(bs);const i=ts(Rn.h,bs.h,t),s=ts(Rn.s,bs.s,t),r=ts(Rn.l,bs.l,t);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*s,this.g=r[1]*t+r[4]*i+r[7]*s,this.b=r[2]*t+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Dt=new Ne;Ne.NAMES=$l;let Gh=0;class Mn extends Pi{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Gh++}),this.uuid=Kt(),this.name="",this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ne(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=7680,this.stencilZFail=7680,this.stencilZPass=7680,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==1&&(i.blending=this.blending),this.side!==0&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==204&&(i.blendSrc=this.blendSrc),this.blendDst!==205&&(i.blendDst=this.blendDst),this.blendEquation!==100&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==3&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==519&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==7680&&(i.stencilFail=this.stencilFail),this.stencilZFail!==7680&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==7680&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){const o=[];for(const a in r){const l=r[a];delete l.metadata,o.push(l)}return o}if(t){const r=s(e.textures),o=s(e.images);r.length>0&&(i.textures=r),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const s=t.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class Fo extends Mn{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new Ne(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new sn,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const yn=Wh();function Wh(){const n=new ArrayBuffer(4),e=new Float32Array(n),t=new Uint32Array(n),i=new Uint32Array(512),s=new Uint32Array(512);for(let l=0;l<256;++l){const c=l-127;c<-27?(i[l]=0,i[l|256]=32768,s[l]=24,s[l|256]=24):c<-14?(i[l]=1024>>-c-14,i[l|256]=1024>>-c-14|32768,s[l]=-c-1,s[l|256]=-c-1):c<=15?(i[l]=c+15<<10,i[l|256]=c+15<<10|32768,s[l]=13,s[l|256]=13):c<128?(i[l]=31744,i[l|256]=64512,s[l]=24,s[l|256]=24):(i[l]=31744,i[l|256]=64512,s[l]=13,s[l|256]=13)}const r=new Uint32Array(2048),o=new Uint32Array(64),a=new Uint32Array(64);for(let l=1;l<1024;++l){let c=l<<13,h=0;for(;(c&8388608)===0;)c<<=1,h-=8388608;c&=-8388609,h+=947912704,r[l]=c|h}for(let l=1024;l<2048;++l)r[l]=939524096+(l-1024<<13);for(let l=1;l<31;++l)o[l]=l<<23;o[31]=1199570944,o[32]=2147483648;for(let l=33;l<63;++l)o[l]=2147483648+(l-32<<23);o[63]=3347054592;for(let l=1;l<64;++l)l!==32&&(a[l]=1024);return{floatView:e,uint32View:t,baseTable:i,shiftTable:s,mantissaTable:r,exponentTable:o,offsetTable:a}}function Xh(n){Math.abs(n)>65504&&console.warn("THREE.DataUtils.toHalfFloat(): Value out of range."),n=Tt(n,-65504,65504),yn.floatView[0]=n;const e=yn.uint32View[0],t=e>>23&511;return yn.baseTable[t]+((e&8388607)>>yn.shiftTable[t])}function Yh(n){const e=n>>10;return yn.uint32View[0]=yn.mantissaTable[yn.offsetTable[e]+(n&1023)]+yn.exponentTable[e],yn.floatView[0]}const oy={toHalfFloat:Xh,fromHalfFloat:Yh},xt=new L,Ms=new ce;class Pt{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=35044,this.updateRanges=[],this.gpuType=1015,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Ms.fromBufferAttribute(this,t),Ms.applyMatrix3(e),this.setXY(t,Ms.x,Ms.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)xt.fromBufferAttribute(this,t),xt.applyMatrix3(e),this.setXYZ(t,xt.x,xt.y,xt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)xt.fromBufferAttribute(this,t),xt.applyMatrix4(e),this.setXYZ(t,xt.x,xt.y,xt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)xt.fromBufferAttribute(this,t),xt.applyNormalMatrix(e),this.setXYZ(t,xt.x,xt.y,xt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)xt.fromBufferAttribute(this,t),xt.transformDirection(e),this.setXYZ(t,xt.x,xt.y,xt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=tn(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=at(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=tn(t,this.array)),t}setX(e,t){return this.normalized&&(t=at(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=tn(t,this.array)),t}setY(e,t){return this.normalized&&(t=at(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=tn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=at(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=tn(t,this.array)),t}setW(e,t){return this.normalized&&(t=at(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=at(t,this.array),i=at(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,s){return e*=this.itemSize,this.normalized&&(t=at(t,this.array),i=at(i,this.array),s=at(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e*=this.itemSize,this.normalized&&(t=at(t,this.array),i=at(i,this.array),s=at(s,this.array),r=at(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==35044&&(e.usage=this.usage),e}}class Oo extends Pt{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class Ql extends Pt{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class Ke extends Pt{constructor(e,t,i){super(new Float32Array(e),t,i)}}let qh=0;const qt=new He,zr=new vt,ai=new L,Gt=new Un,Hi=new Un,Rt=new L;class _t extends Pi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:qh++}),this.uuid=Kt(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Kl(e)?Ql:Oo)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const r=new qe().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return qt.makeRotationFromQuaternion(e),this.applyMatrix4(qt),this}rotateX(e){return qt.makeRotationX(e),this.applyMatrix4(qt),this}rotateY(e){return qt.makeRotationY(e),this.applyMatrix4(qt),this}rotateZ(e){return qt.makeRotationZ(e),this.applyMatrix4(qt),this}translate(e,t,i){return qt.makeTranslation(e,t,i),this.applyMatrix4(qt),this}scale(e,t,i){return qt.makeScale(e,t,i),this.applyMatrix4(qt),this}lookAt(e){return zr.lookAt(e),zr.updateMatrix(),this.applyMatrix4(zr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ai).negate(),this.translate(ai.x,ai.y,ai.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const i=[];for(let s=0,r=e.length;s<r;s++){const o=e[s];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Ke(i,3))}else{for(let i=0,s=t.count;i<s;i++){const r=e[i];t.setXYZ(i,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Un);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new L(-1/0,-1/0,-1/0),new L(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,s=t.length;i<s;i++){const r=t[i];Gt.setFromBufferAttribute(r),this.morphTargetsRelative?(Rt.addVectors(this.boundingBox.min,Gt.min),this.boundingBox.expandByPoint(Rt),Rt.addVectors(this.boundingBox.max,Gt.max),this.boundingBox.expandByPoint(Rt)):(this.boundingBox.expandByPoint(Gt.min),this.boundingBox.expandByPoint(Gt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new bn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new L,1/0);return}if(e){const i=this.boundingSphere.center;if(Gt.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){const a=t[r];Hi.setFromBufferAttribute(a),this.morphTargetsRelative?(Rt.addVectors(Gt.min,Hi.min),Gt.expandByPoint(Rt),Rt.addVectors(Gt.max,Hi.max),Gt.expandByPoint(Rt)):(Gt.expandByPoint(Hi.min),Gt.expandByPoint(Hi.max))}Gt.getCenter(i);let s=0;for(let r=0,o=e.count;r<o;r++)Rt.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(Rt));if(t)for(let r=0,o=t.length;r<o;r++){const a=t[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)Rt.fromBufferAttribute(a,c),l&&(ai.fromBufferAttribute(e,c),Rt.add(ai)),s=Math.max(s,i.distanceToSquared(Rt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Pt(new Float32Array(4*i.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let C=0;C<i.count;C++)a[C]=new L,l[C]=new L;const c=new L,h=new L,u=new L,p=new ce,f=new ce,g=new ce,y=new L,m=new L;function d(C,S,M){c.fromBufferAttribute(i,C),h.fromBufferAttribute(i,S),u.fromBufferAttribute(i,M),p.fromBufferAttribute(r,C),f.fromBufferAttribute(r,S),g.fromBufferAttribute(r,M),h.sub(c),u.sub(c),f.sub(p),g.sub(p);const I=1/(f.x*g.y-g.x*f.y);isFinite(I)&&(y.copy(h).multiplyScalar(g.y).addScaledVector(u,-f.y).multiplyScalar(I),m.copy(u).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(I),a[C].add(y),a[S].add(y),a[M].add(y),l[C].add(m),l[S].add(m),l[M].add(m))}let b=this.groups;b.length===0&&(b=[{start:0,count:e.count}]);for(let C=0,S=b.length;C<S;++C){const M=b[C],I=M.start,z=M.count;for(let N=I,O=I+z;N<O;N+=3)d(e.getX(N+0),e.getX(N+1),e.getX(N+2))}const v=new L,_=new L,R=new L,w=new L;function A(C){R.fromBufferAttribute(s,C),w.copy(R);const S=a[C];v.copy(S),v.sub(R.multiplyScalar(R.dot(S))).normalize(),_.crossVectors(w,S);const I=_.dot(l[C])<0?-1:1;o.setXYZW(C,v.x,v.y,v.z,I)}for(let C=0,S=b.length;C<S;++C){const M=b[C],I=M.start,z=M.count;for(let N=I,O=I+z;N<O;N+=3)A(e.getX(N+0)),A(e.getX(N+1)),A(e.getX(N+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Pt(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let p=0,f=i.count;p<f;p++)i.setXYZ(p,0,0,0);const s=new L,r=new L,o=new L,a=new L,l=new L,c=new L,h=new L,u=new L;if(e)for(let p=0,f=e.count;p<f;p+=3){const g=e.getX(p+0),y=e.getX(p+1),m=e.getX(p+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,y),o.fromBufferAttribute(t,m),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),a.fromBufferAttribute(i,g),l.fromBufferAttribute(i,y),c.fromBufferAttribute(i,m),a.add(h),l.add(h),c.add(h),i.setXYZ(g,a.x,a.y,a.z),i.setXYZ(y,l.x,l.y,l.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let p=0,f=t.count;p<f;p+=3)s.fromBufferAttribute(t,p+0),r.fromBufferAttribute(t,p+1),o.fromBufferAttribute(t,p+2),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),i.setXYZ(p+0,h.x,h.y,h.z),i.setXYZ(p+1,h.x,h.y,h.z),i.setXYZ(p+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)Rt.fromBufferAttribute(e,t),Rt.normalize(),e.setXYZ(t,Rt.x,Rt.y,Rt.z)}toNonIndexed(){function e(a,l){const c=a.array,h=a.itemSize,u=a.normalized,p=new c.constructor(l.length*h);let f=0,g=0;for(let y=0,m=l.length;y<m;y++){a.isInterleavedBufferAttribute?f=l[y]*a.data.stride+a.offset:f=l[y]*h;for(let d=0;d<h;d++)p[g++]=c[f++]}return new Pt(p,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new _t,i=this.index.array,s=this.attributes;for(const a in s){const l=s[a],c=e(l,i);t.setAttribute(a,c)}const r=this.morphAttributes;for(const a in r){const l=[],c=r[a];for(let h=0,u=c.length;h<u;h++){const p=c[h],f=e(p,i);l.push(f)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const l in i){const c=i[l];e.data.attributes[l]=c.toJSON(e.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,p=c.length;u<p;u++){const f=c[u];h.push(f.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone(t));const s=e.attributes;for(const c in s){const h=s[c];this.setAttribute(c,h.clone(t))}const r=e.morphAttributes;for(const c in r){const h=[],u=r[c];for(let p=0,f=u.length;p<f;p++)h.push(u[p].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let c=0,h=o.length;c<h;c++){const u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Ea=new He,Bn=new ls,xs=new bn,Aa=new L,Ss=new L,ws=new L,Ts=new L,Hr=new L,Es=new L,Ra=new L,As=new L;class ht extends vt{constructor(e=new _t,t=new Fo){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){const i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(s,e);const a=this.morphTargetInfluences;if(r&&a){Es.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=a[l],u=r[l];h!==0&&(Hr.fromBufferAttribute(u,e),o?Es.addScaledVector(Hr,h):Es.addScaledVector(Hr.sub(t),h))}t.add(Es)}return t}raycast(e,t){const i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),xs.copy(i.boundingSphere),xs.applyMatrix4(r),Bn.copy(e.ray).recast(e.near),!(xs.containsPoint(Bn.origin)===!1&&(Bn.intersectSphere(xs,Aa)===null||Bn.origin.distanceToSquared(Aa)>(e.far-e.near)**2))&&(Ea.copy(r).invert(),Bn.copy(e.ray).applyMatrix4(Ea),!(i.boundingBox!==null&&Bn.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,Bn)))}_computeIntersections(e,t,i){let s;const r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,p=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,y=p.length;g<y;g++){const m=p[g],d=o[m.materialIndex],b=Math.max(m.start,f.start),v=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let _=b,R=v;_<R;_+=3){const w=a.getX(_),A=a.getX(_+1),C=a.getX(_+2);s=Rs(this,d,e,i,c,h,u,w,A,C),s&&(s.faceIndex=Math.floor(_/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,f.start),y=Math.min(a.count,f.start+f.count);for(let m=g,d=y;m<d;m+=3){const b=a.getX(m),v=a.getX(m+1),_=a.getX(m+2);s=Rs(this,o,e,i,c,h,u,b,v,_),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,y=p.length;g<y;g++){const m=p[g],d=o[m.materialIndex],b=Math.max(m.start,f.start),v=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let _=b,R=v;_<R;_+=3){const w=_,A=_+1,C=_+2;s=Rs(this,d,e,i,c,h,u,w,A,C),s&&(s.faceIndex=Math.floor(_/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,f.start),y=Math.min(l.count,f.start+f.count);for(let m=g,d=y;m<d;m+=3){const b=m,v=m+1,_=m+2;s=Rs(this,o,e,i,c,h,u,b,v,_),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}}function jh(n,e,t,i,s,r,o,a){let l;if(e.side===1?l=i.intersectTriangle(o,r,s,!0,a):l=i.intersectTriangle(s,r,o,e.side===0,a),l===null)return null;As.copy(a),As.applyMatrix4(n.matrixWorld);const c=t.ray.origin.distanceTo(As);return c<t.near||c>t.far?null:{distance:c,point:As.clone(),object:n}}function Rs(n,e,t,i,s,r,o,a,l,c){n.getVertexPosition(a,Ss),n.getVertexPosition(l,ws),n.getVertexPosition(c,Ts);const h=jh(n,e,t,i,Ss,ws,Ts,Ra);if(h){const u=new L;jt.getBarycoord(Ra,Ss,ws,Ts,u),s&&(h.uv=jt.getInterpolatedAttribute(s,a,l,c,u,new ce)),r&&(h.uv1=jt.getInterpolatedAttribute(r,a,l,c,u,new ce)),o&&(h.normal=jt.getInterpolatedAttribute(o,a,l,c,u,new L),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));const p={a,b:l,c,normal:new L,materialIndex:0};jt.getNormal(Ss,ws,Ts,p.normal),h.face=p,h.barycoord=u}return h}class wt extends _t{constructor(e=1,t=1,i=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:s,heightSegments:r,depthSegments:o};const a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);const l=[],c=[],h=[],u=[];let p=0,f=0;g("z","y","x",-1,-1,i,t,e,o,r,0),g("z","y","x",1,-1,i,t,-e,o,r,1),g("x","z","y",1,1,e,i,t,s,o,2),g("x","z","y",1,-1,e,i,-t,s,o,3),g("x","y","z",1,-1,e,t,i,s,r,4),g("x","y","z",-1,-1,e,t,-i,s,r,5),this.setIndex(l),this.setAttribute("position",new Ke(c,3)),this.setAttribute("normal",new Ke(h,3)),this.setAttribute("uv",new Ke(u,2));function g(y,m,d,b,v,_,R,w,A,C,S){const M=_/A,I=R/C,z=_/2,N=R/2,O=w/2,X=A+1,Y=C+1;let se=0,U=0;const x=new L;for(let F=0;F<Y;F++){const oe=F*I-N;for(let we=0;we<X;we++){const Fe=we*M-z;x[y]=Fe*b,x[m]=oe*v,x[d]=O,c.push(x.x,x.y,x.z),x[y]=0,x[m]=0,x[d]=w>0?1:-1,h.push(x.x,x.y,x.z),u.push(we/A),u.push(1-F/C),se+=1}}for(let F=0;F<C;F++)for(let oe=0;oe<A;oe++){const we=p+oe+X*F,Fe=p+oe+X*(F+1),$=p+(oe+1)+X*(F+1),he=p+(oe+1)+X*F;l.push(we,Fe,he),l.push(Fe,$,he),U+=6}a.addGroup(f,U,S),f+=U,p+=se}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new wt(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Ti(n){const e={};for(const t in n){e[t]={};for(const i in n[t]){const s=n[t][i];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=s.clone():Array.isArray(s)?e[t][i]=s.slice():e[t][i]=s}}return e}function kt(n){const e={};for(let t=0;t<n.length;t++){const i=Ti(n[t]);for(const s in i)e[s]=i[s]}return e}function Kh(n){const e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function ec(n){const e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Qe.workingColorSpace}const Jh={clone:Ti,merge:kt};var Zh=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,$h=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Dn extends Mn{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Zh,this.fragmentShader=$h,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ti(e.uniforms),this.uniformsGroups=Kh(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}}class tc extends vt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new He,this.projectionMatrix=new He,this.projectionMatrixInverse=new He,this.coordinateSystem=2e3}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Cn=new L,Ca=new ce,Pa=new ce;class Wt extends tc{constructor(e=50,t=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=wi*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(es*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return wi*2*Math.atan(Math.tan(es*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){Cn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Cn.x,Cn.y).multiplyScalar(-e/Cn.z),Cn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Cn.x,Cn.y).multiplyScalar(-e/Cn.z)}getViewSize(e,t){return this.getViewBounds(e,Ca,Pa),t.subVectors(Pa,Ca)}setViewOffset(e,t,i,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(es*.5*this.fov)/this.zoom,i=2*t,s=this.aspect*i,r=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*i/c,s*=o.width/l,i*=o.height/c}const a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const li=-90,ci=1;class Qh extends vt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new Wt(li,ci,e,t);s.layers=this.layers,this.add(s);const r=new Wt(li,ci,e,t);r.layers=this.layers,this.add(r);const o=new Wt(li,ci,e,t);o.layers=this.layers,this.add(o);const a=new Wt(li,ci,e,t);a.layers=this.layers,this.add(a);const l=new Wt(li,ci,e,t);l.layers=this.layers,this.add(l);const c=new Wt(li,ci,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,s,r,o,a,l]=t;for(const c of t)this.remove(c);if(e===2e3)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===2001)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,l,c,h]=this.children,u=e.getRenderTarget(),p=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const y=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,s),e.render(t,r),e.setRenderTarget(i,1,s),e.render(t,o),e.setRenderTarget(i,2,s),e.render(t,a),e.setRenderTarget(i,3,s),e.render(t,l),e.setRenderTarget(i,4,s),e.render(t,c),i.texture.generateMipmaps=y,e.setRenderTarget(i,5,s),e.render(t,h),e.setRenderTarget(u,p,f),e.xr.enabled=g,i.texture.needsPMREMUpdate=!0}}class nc extends Ct{constructor(e,t,i,s,r,o,a,l,c,h){e=e!==void 0?e:[],t=t!==void 0?t:301,super(e,t,i,s,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class eu extends Kn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new nc(s,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:1006}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new wt(5,5,5),r=new Dn({name:"CubemapFromEquirect",uniforms:Ti(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:1,blending:0});r.uniforms.tEquirect.value=t;const o=new ht(s,r),a=t.minFilter;return t.minFilter===1008&&(t.minFilter=1006),new Qh(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,i,s){const r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,s);e.setRenderTarget(r)}}const Vr=new L,tu=new L,nu=new qe;class Wn{constructor(e=new L(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,s){return this.normal.set(e,t,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const s=Vr.subVectors(i,t).cross(tu.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const i=e.delta(Vr),s=this.normal.dot(i);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(i,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||nu.getNormalMatrix(e),s=this.coplanarPoint(Vr).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const zn=new bn,Cs=new L;class Bo{constructor(e=new Wn,t=new Wn,i=new Wn,s=new Wn,r=new Wn,o=new Wn){this.planes=[e,t,i,s,r,o]}set(e,t,i,s,r,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=2e3){const i=this.planes,s=e.elements,r=s[0],o=s[1],a=s[2],l=s[3],c=s[4],h=s[5],u=s[6],p=s[7],f=s[8],g=s[9],y=s[10],m=s[11],d=s[12],b=s[13],v=s[14],_=s[15];if(i[0].setComponents(l-r,p-c,m-f,_-d).normalize(),i[1].setComponents(l+r,p+c,m+f,_+d).normalize(),i[2].setComponents(l+o,p+h,m+g,_+b).normalize(),i[3].setComponents(l-o,p-h,m-g,_-b).normalize(),i[4].setComponents(l-a,p-u,m-y,_-v).normalize(),t===2e3)i[5].setComponents(l+a,p+u,m+y,_+v).normalize();else if(t===2001)i[5].setComponents(a,u,y,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),zn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),zn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(zn)}intersectsSprite(e){return zn.center.set(0,0,0),zn.radius=.7071067811865476,zn.applyMatrix4(e.matrixWorld),this.intersectsSphere(zn)}intersectsSphere(e){const t=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const s=t[i];if(Cs.x=s.normal.x>0?e.max.x:e.min.x,Cs.y=s.normal.y>0?e.max.y:e.min.y,Cs.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Cs)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function ic(){let n=null,e=!1,t=null,i=null;function s(r,o){t(r,o),i=n.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(s),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){n=r}}}function iu(n){const e=new WeakMap;function t(a,l){const c=a.array,h=a.usage,u=c.byteLength,p=n.createBuffer();n.bindBuffer(l,p),n.bufferData(l,c,h),a.onUploadCallback();let f;if(c instanceof Float32Array)f=n.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=n.HALF_FLOAT:f=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=n.SHORT;else if(c instanceof Uint32Array)f=n.UNSIGNED_INT;else if(c instanceof Int32Array)f=n.INT;else if(c instanceof Int8Array)f=n.BYTE;else if(c instanceof Uint8Array)f=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:p,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function i(a,l,c){const h=l.array,u=l.updateRanges;if(n.bindBuffer(c,a),u.length===0)n.bufferSubData(c,0,h);else{u.sort((f,g)=>f.start-g.start);let p=0;for(let f=1;f<u.length;f++){const g=u[p],y=u[f];y.start<=g.start+g.count+1?g.count=Math.max(g.count,y.start+y.count-g.start):(++p,u[p]=y)}u.length=p+1;for(let f=0,g=u.length;f<g;f++){const y=u[f];n.bufferSubData(c,y.start*h.BYTES_PER_ELEMENT,h,y.start,y.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=e.get(a);l&&(n.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const h=e.get(a);(!h||h.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}class cs extends _t{constructor(e=1,t=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:s};const r=e/2,o=t/2,a=Math.floor(i),l=Math.floor(s),c=a+1,h=l+1,u=e/a,p=t/l,f=[],g=[],y=[],m=[];for(let d=0;d<h;d++){const b=d*p-o;for(let v=0;v<c;v++){const _=v*u-r;g.push(_,-b,0),y.push(0,0,1),m.push(v/a),m.push(1-d/l)}}for(let d=0;d<l;d++)for(let b=0;b<a;b++){const v=b+c*d,_=b+c*(d+1),R=b+1+c*(d+1),w=b+1+c*d;f.push(v,_,w),f.push(_,R,w)}this.setIndex(f),this.setAttribute("position",new Ke(g,3)),this.setAttribute("normal",new Ke(y,3)),this.setAttribute("uv",new Ke(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new cs(e.width,e.height,e.widthSegments,e.heightSegments)}}var su=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,ru=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,ou=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,au=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,lu=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,cu=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,hu=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,uu=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,du=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,fu=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,pu=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,mu=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,gu=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,_u=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,yu=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,vu=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,bu=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Mu=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,xu=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Su=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,wu=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Tu=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Eu=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Au=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Ru=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Cu=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Pu=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Lu=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Iu=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Du=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Nu="gl_FragColor = linearToOutputTexel( gl_FragColor );",Uu=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,ku=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Fu=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Ou=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Bu=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,zu=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Hu=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Vu=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Gu=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Wu=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Xu=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Yu=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,qu=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,ju=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Ku=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Ju=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Zu=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,$u=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Qu=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,ed=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,td=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,nd=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,id=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,sd=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,rd=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,od=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,ad=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ld=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,cd=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,hd=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,ud=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,dd=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,fd=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,pd=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,md=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,gd=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,_d=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,yd=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,vd=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,bd=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Md=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,xd=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Sd=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,wd=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Td=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Ed=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Ad=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Rd=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Cd=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Pd=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Ld=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Id=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Dd=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Nd=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Ud=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,kd=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Fd=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Od=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Bd=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,zd=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Hd=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Vd=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Gd=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Wd=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Xd=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Yd=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,qd=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,jd=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Kd=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Jd=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Zd=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,$d=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Qd=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,ef=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,tf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,nf=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const sf=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,rf=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,of=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,af=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,lf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cf=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,hf=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,uf=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,df=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,ff=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,pf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,mf=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,gf=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,_f=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,yf=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,vf=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,bf=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Mf=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,xf=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Sf=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,wf=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Tf=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Ef=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Af=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Rf=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Cf=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Pf=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Lf=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,If=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Df=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Nf=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Uf=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,kf=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Ff=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ve={alphahash_fragment:su,alphahash_pars_fragment:ru,alphamap_fragment:ou,alphamap_pars_fragment:au,alphatest_fragment:lu,alphatest_pars_fragment:cu,aomap_fragment:hu,aomap_pars_fragment:uu,batching_pars_vertex:du,batching_vertex:fu,begin_vertex:pu,beginnormal_vertex:mu,bsdfs:gu,iridescence_fragment:_u,bumpmap_pars_fragment:yu,clipping_planes_fragment:vu,clipping_planes_pars_fragment:bu,clipping_planes_pars_vertex:Mu,clipping_planes_vertex:xu,color_fragment:Su,color_pars_fragment:wu,color_pars_vertex:Tu,color_vertex:Eu,common:Au,cube_uv_reflection_fragment:Ru,defaultnormal_vertex:Cu,displacementmap_pars_vertex:Pu,displacementmap_vertex:Lu,emissivemap_fragment:Iu,emissivemap_pars_fragment:Du,colorspace_fragment:Nu,colorspace_pars_fragment:Uu,envmap_fragment:ku,envmap_common_pars_fragment:Fu,envmap_pars_fragment:Ou,envmap_pars_vertex:Bu,envmap_physical_pars_fragment:Ju,envmap_vertex:zu,fog_vertex:Hu,fog_pars_vertex:Vu,fog_fragment:Gu,fog_pars_fragment:Wu,gradientmap_pars_fragment:Xu,lightmap_pars_fragment:Yu,lights_lambert_fragment:qu,lights_lambert_pars_fragment:ju,lights_pars_begin:Ku,lights_toon_fragment:Zu,lights_toon_pars_fragment:$u,lights_phong_fragment:Qu,lights_phong_pars_fragment:ed,lights_physical_fragment:td,lights_physical_pars_fragment:nd,lights_fragment_begin:id,lights_fragment_maps:sd,lights_fragment_end:rd,logdepthbuf_fragment:od,logdepthbuf_pars_fragment:ad,logdepthbuf_pars_vertex:ld,logdepthbuf_vertex:cd,map_fragment:hd,map_pars_fragment:ud,map_particle_fragment:dd,map_particle_pars_fragment:fd,metalnessmap_fragment:pd,metalnessmap_pars_fragment:md,morphinstance_vertex:gd,morphcolor_vertex:_d,morphnormal_vertex:yd,morphtarget_pars_vertex:vd,morphtarget_vertex:bd,normal_fragment_begin:Md,normal_fragment_maps:xd,normal_pars_fragment:Sd,normal_pars_vertex:wd,normal_vertex:Td,normalmap_pars_fragment:Ed,clearcoat_normal_fragment_begin:Ad,clearcoat_normal_fragment_maps:Rd,clearcoat_pars_fragment:Cd,iridescence_pars_fragment:Pd,opaque_fragment:Ld,packing:Id,premultiplied_alpha_fragment:Dd,project_vertex:Nd,dithering_fragment:Ud,dithering_pars_fragment:kd,roughnessmap_fragment:Fd,roughnessmap_pars_fragment:Od,shadowmap_pars_fragment:Bd,shadowmap_pars_vertex:zd,shadowmap_vertex:Hd,shadowmask_pars_fragment:Vd,skinbase_vertex:Gd,skinning_pars_vertex:Wd,skinning_vertex:Xd,skinnormal_vertex:Yd,specularmap_fragment:qd,specularmap_pars_fragment:jd,tonemapping_fragment:Kd,tonemapping_pars_fragment:Jd,transmission_fragment:Zd,transmission_pars_fragment:$d,uv_pars_fragment:Qd,uv_pars_vertex:ef,uv_vertex:tf,worldpos_vertex:nf,background_vert:sf,background_frag:rf,backgroundCube_vert:of,backgroundCube_frag:af,cube_vert:lf,cube_frag:cf,depth_vert:hf,depth_frag:uf,distanceRGBA_vert:df,distanceRGBA_frag:ff,equirect_vert:pf,equirect_frag:mf,linedashed_vert:gf,linedashed_frag:_f,meshbasic_vert:yf,meshbasic_frag:vf,meshlambert_vert:bf,meshlambert_frag:Mf,meshmatcap_vert:xf,meshmatcap_frag:Sf,meshnormal_vert:wf,meshnormal_frag:Tf,meshphong_vert:Ef,meshphong_frag:Af,meshphysical_vert:Rf,meshphysical_frag:Cf,meshtoon_vert:Pf,meshtoon_frag:Lf,points_vert:If,points_frag:Df,shadow_vert:Nf,shadow_frag:Uf,sprite_vert:kf,sprite_frag:Ff},me={common:{diffuse:{value:new Ne(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new qe},alphaMap:{value:null},alphaMapTransform:{value:new qe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new qe}},envmap:{envMap:{value:null},envMapRotation:{value:new qe},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new qe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new qe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new qe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new qe},normalScale:{value:new ce(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new qe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new qe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new qe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new qe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ne(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ne(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new qe},alphaTest:{value:0},uvTransform:{value:new qe}},sprite:{diffuse:{value:new Ne(16777215)},opacity:{value:1},center:{value:new ce(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new qe},alphaMap:{value:null},alphaMapTransform:{value:new qe},alphaTest:{value:0}}},an={basic:{uniforms:kt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.fog]),vertexShader:Ve.meshbasic_vert,fragmentShader:Ve.meshbasic_frag},lambert:{uniforms:kt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.fog,me.lights,{emissive:{value:new Ne(0)}}]),vertexShader:Ve.meshlambert_vert,fragmentShader:Ve.meshlambert_frag},phong:{uniforms:kt([me.common,me.specularmap,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.fog,me.lights,{emissive:{value:new Ne(0)},specular:{value:new Ne(1118481)},shininess:{value:30}}]),vertexShader:Ve.meshphong_vert,fragmentShader:Ve.meshphong_frag},standard:{uniforms:kt([me.common,me.envmap,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.roughnessmap,me.metalnessmap,me.fog,me.lights,{emissive:{value:new Ne(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ve.meshphysical_vert,fragmentShader:Ve.meshphysical_frag},toon:{uniforms:kt([me.common,me.aomap,me.lightmap,me.emissivemap,me.bumpmap,me.normalmap,me.displacementmap,me.gradientmap,me.fog,me.lights,{emissive:{value:new Ne(0)}}]),vertexShader:Ve.meshtoon_vert,fragmentShader:Ve.meshtoon_frag},matcap:{uniforms:kt([me.common,me.bumpmap,me.normalmap,me.displacementmap,me.fog,{matcap:{value:null}}]),vertexShader:Ve.meshmatcap_vert,fragmentShader:Ve.meshmatcap_frag},points:{uniforms:kt([me.points,me.fog]),vertexShader:Ve.points_vert,fragmentShader:Ve.points_frag},dashed:{uniforms:kt([me.common,me.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ve.linedashed_vert,fragmentShader:Ve.linedashed_frag},depth:{uniforms:kt([me.common,me.displacementmap]),vertexShader:Ve.depth_vert,fragmentShader:Ve.depth_frag},normal:{uniforms:kt([me.common,me.bumpmap,me.normalmap,me.displacementmap,{opacity:{value:1}}]),vertexShader:Ve.meshnormal_vert,fragmentShader:Ve.meshnormal_frag},sprite:{uniforms:kt([me.sprite,me.fog]),vertexShader:Ve.sprite_vert,fragmentShader:Ve.sprite_frag},background:{uniforms:{uvTransform:{value:new qe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ve.background_vert,fragmentShader:Ve.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new qe}},vertexShader:Ve.backgroundCube_vert,fragmentShader:Ve.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ve.cube_vert,fragmentShader:Ve.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ve.equirect_vert,fragmentShader:Ve.equirect_frag},distanceRGBA:{uniforms:kt([me.common,me.displacementmap,{referencePosition:{value:new L},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ve.distanceRGBA_vert,fragmentShader:Ve.distanceRGBA_frag},shadow:{uniforms:kt([me.lights,me.fog,{color:{value:new Ne(0)},opacity:{value:1}}]),vertexShader:Ve.shadow_vert,fragmentShader:Ve.shadow_frag}};an.physical={uniforms:kt([an.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new qe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new qe},clearcoatNormalScale:{value:new ce(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new qe},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new qe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new qe},sheen:{value:0},sheenColor:{value:new Ne(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new qe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new qe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new qe},transmissionSamplerSize:{value:new ce},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new qe},attenuationDistance:{value:0},attenuationColor:{value:new Ne(0)},specularColor:{value:new Ne(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new qe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new qe},anisotropyVector:{value:new ce},anisotropyMap:{value:null},anisotropyMapTransform:{value:new qe}}]),vertexShader:Ve.meshphysical_vert,fragmentShader:Ve.meshphysical_frag};const Ps={r:0,b:0,g:0},Hn=new sn,Of=new He;function Bf(n,e,t,i,s,r,o){const a=new Ne(0);let l=r===!0?0:1,c,h,u=null,p=0,f=null;function g(b){let v=b.isScene===!0?b.background:null;return v&&v.isTexture&&(v=(b.backgroundBlurriness>0?t:e).get(v)),v}function y(b){let v=!1;const _=g(b);_===null?d(a,l):_&&_.isColor&&(d(_,1),v=!0);const R=n.xr.getEnvironmentBlendMode();R==="additive"?i.buffers.color.setClear(0,0,0,1,o):R==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(n.autoClear||v)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function m(b,v){const _=g(v);_&&(_.isCubeTexture||_.mapping===306)?(h===void 0&&(h=new ht(new wt(1,1,1),new Dn({name:"BackgroundCubeMaterial",uniforms:Ti(an.backgroundCube.uniforms),vertexShader:an.backgroundCube.vertexShader,fragmentShader:an.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(R,w,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),Hn.copy(v.backgroundRotation),Hn.x*=-1,Hn.y*=-1,Hn.z*=-1,_.isCubeTexture&&_.isRenderTargetTexture===!1&&(Hn.y*=-1,Hn.z*=-1),h.material.uniforms.envMap.value=_,h.material.uniforms.flipEnvMap.value=_.isCubeTexture&&_.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=v.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(Of.makeRotationFromEuler(Hn)),h.material.toneMapped=Qe.getTransfer(_.colorSpace)!==lt,(u!==_||p!==_.version||f!==n.toneMapping)&&(h.material.needsUpdate=!0,u=_,p=_.version,f=n.toneMapping),h.layers.enableAll(),b.unshift(h,h.geometry,h.material,0,0,null)):_&&_.isTexture&&(c===void 0&&(c=new ht(new cs(2,2),new Dn({name:"BackgroundMaterial",uniforms:Ti(an.background.uniforms),vertexShader:an.background.vertexShader,fragmentShader:an.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=_,c.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,c.material.toneMapped=Qe.getTransfer(_.colorSpace)!==lt,_.matrixAutoUpdate===!0&&_.updateMatrix(),c.material.uniforms.uvTransform.value.copy(_.matrix),(u!==_||p!==_.version||f!==n.toneMapping)&&(c.material.needsUpdate=!0,u=_,p=_.version,f=n.toneMapping),c.layers.enableAll(),b.unshift(c,c.geometry,c.material,0,0,null))}function d(b,v){b.getRGB(Ps,ec(n)),i.buffers.color.setClear(Ps.r,Ps.g,Ps.b,v,o)}return{getClearColor:function(){return a},setClearColor:function(b,v=1){a.set(b),l=v,d(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(b){l=b,d(a,l)},render:y,addToRenderList:m}}function zf(n,e){const t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=p(null);let r=s,o=!1;function a(M,I,z,N,O){let X=!1;const Y=u(N,z,I);r!==Y&&(r=Y,c(r.object)),X=f(M,N,z,O),X&&g(M,N,z,O),O!==null&&e.update(O,n.ELEMENT_ARRAY_BUFFER),(X||o)&&(o=!1,_(M,I,z,N),O!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(O).buffer))}function l(){return n.createVertexArray()}function c(M){return n.bindVertexArray(M)}function h(M){return n.deleteVertexArray(M)}function u(M,I,z){const N=z.wireframe===!0;let O=i[M.id];O===void 0&&(O={},i[M.id]=O);let X=O[I.id];X===void 0&&(X={},O[I.id]=X);let Y=X[N];return Y===void 0&&(Y=p(l()),X[N]=Y),Y}function p(M){const I=[],z=[],N=[];for(let O=0;O<t;O++)I[O]=0,z[O]=0,N[O]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:I,enabledAttributes:z,attributeDivisors:N,object:M,attributes:{},index:null}}function f(M,I,z,N){const O=r.attributes,X=I.attributes;let Y=0;const se=z.getAttributes();for(const U in se)if(se[U].location>=0){const F=O[U];let oe=X[U];if(oe===void 0&&(U==="instanceMatrix"&&M.instanceMatrix&&(oe=M.instanceMatrix),U==="instanceColor"&&M.instanceColor&&(oe=M.instanceColor)),F===void 0||F.attribute!==oe||oe&&F.data!==oe.data)return!0;Y++}return r.attributesNum!==Y||r.index!==N}function g(M,I,z,N){const O={},X=I.attributes;let Y=0;const se=z.getAttributes();for(const U in se)if(se[U].location>=0){let F=X[U];F===void 0&&(U==="instanceMatrix"&&M.instanceMatrix&&(F=M.instanceMatrix),U==="instanceColor"&&M.instanceColor&&(F=M.instanceColor));const oe={};oe.attribute=F,F&&F.data&&(oe.data=F.data),O[U]=oe,Y++}r.attributes=O,r.attributesNum=Y,r.index=N}function y(){const M=r.newAttributes;for(let I=0,z=M.length;I<z;I++)M[I]=0}function m(M){d(M,0)}function d(M,I){const z=r.newAttributes,N=r.enabledAttributes,O=r.attributeDivisors;z[M]=1,N[M]===0&&(n.enableVertexAttribArray(M),N[M]=1),O[M]!==I&&(n.vertexAttribDivisor(M,I),O[M]=I)}function b(){const M=r.newAttributes,I=r.enabledAttributes;for(let z=0,N=I.length;z<N;z++)I[z]!==M[z]&&(n.disableVertexAttribArray(z),I[z]=0)}function v(M,I,z,N,O,X,Y){Y===!0?n.vertexAttribIPointer(M,I,z,O,X):n.vertexAttribPointer(M,I,z,N,O,X)}function _(M,I,z,N){y();const O=N.attributes,X=z.getAttributes(),Y=I.defaultAttributeValues;for(const se in X){const U=X[se];if(U.location>=0){let x=O[se];if(x===void 0&&(se==="instanceMatrix"&&M.instanceMatrix&&(x=M.instanceMatrix),se==="instanceColor"&&M.instanceColor&&(x=M.instanceColor)),x!==void 0){const F=x.normalized,oe=x.itemSize,we=e.get(x);if(we===void 0)continue;const Fe=we.buffer,$=we.type,he=we.bytesPerElement,ie=$===n.INT||$===n.UNSIGNED_INT||x.gpuType===1013;if(x.isInterleavedBufferAttribute){const W=x.data,ne=W.stride,Re=x.offset;if(W.isInstancedInterleavedBuffer){for(let te=0;te<U.locationSize;te++)d(U.location+te,W.meshPerAttribute);M.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=W.meshPerAttribute*W.count)}else for(let te=0;te<U.locationSize;te++)m(U.location+te);n.bindBuffer(n.ARRAY_BUFFER,Fe);for(let te=0;te<U.locationSize;te++)v(U.location+te,oe/U.locationSize,$,F,ne*he,(Re+oe/U.locationSize*te)*he,ie)}else{if(x.isInstancedBufferAttribute){for(let W=0;W<U.locationSize;W++)d(U.location+W,x.meshPerAttribute);M.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=x.meshPerAttribute*x.count)}else for(let W=0;W<U.locationSize;W++)m(U.location+W);n.bindBuffer(n.ARRAY_BUFFER,Fe);for(let W=0;W<U.locationSize;W++)v(U.location+W,oe/U.locationSize,$,F,oe*he,oe/U.locationSize*W*he,ie)}}else if(Y!==void 0){const F=Y[se];if(F!==void 0)switch(F.length){case 2:n.vertexAttrib2fv(U.location,F);break;case 3:n.vertexAttrib3fv(U.location,F);break;case 4:n.vertexAttrib4fv(U.location,F);break;default:n.vertexAttrib1fv(U.location,F)}}}}b()}function R(){C();for(const M in i){const I=i[M];for(const z in I){const N=I[z];for(const O in N)h(N[O].object),delete N[O];delete I[z]}delete i[M]}}function w(M){if(i[M.id]===void 0)return;const I=i[M.id];for(const z in I){const N=I[z];for(const O in N)h(N[O].object),delete N[O];delete I[z]}delete i[M.id]}function A(M){for(const I in i){const z=i[I];if(z[M.id]===void 0)continue;const N=z[M.id];for(const O in N)h(N[O].object),delete N[O];delete z[M.id]}}function C(){S(),o=!0,r!==s&&(r=s,c(r.object))}function S(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:C,resetDefaultState:S,dispose:R,releaseStatesOfGeometry:w,releaseStatesOfProgram:A,initAttributes:y,enableAttribute:m,disableUnusedAttributes:b}}function Hf(n,e,t){let i;function s(c){i=c}function r(c,h){n.drawArrays(i,c,h),t.update(h,i,1)}function o(c,h,u){u!==0&&(n.drawArraysInstanced(i,c,h,u),t.update(h,i,u))}function a(c,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,h,0,u);let f=0;for(let g=0;g<u;g++)f+=h[g];t.update(f,i,1)}function l(c,h,u,p){if(u===0)return;const f=e.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<c.length;g++)o(c[g],h[g],p[g]);else{f.multiDrawArraysInstancedWEBGL(i,c,0,h,0,p,0,u);let g=0;for(let y=0;y<u;y++)g+=h[y]*p[y];t.update(g,i,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function Vf(n,e,t,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const A=e.get("EXT_texture_filter_anisotropic");s=n.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(A){return!(A!==1023&&i.convert(A)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(A){const C=A===1016&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==1009&&i.convert(A)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==1015&&!C)}function l(A){if(A==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const u=t.logarithmicDepthBuffer===!0,p=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),f=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),g=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=n.getParameter(n.MAX_TEXTURE_SIZE),m=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),d=n.getParameter(n.MAX_VERTEX_ATTRIBS),b=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),v=n.getParameter(n.MAX_VARYING_VECTORS),_=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),R=g>0,w=n.getParameter(n.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:u,reverseDepthBuffer:p,maxTextures:f,maxVertexTextures:g,maxTextureSize:y,maxCubemapSize:m,maxAttributes:d,maxVertexUniforms:b,maxVaryings:v,maxFragmentUniforms:_,vertexTextures:R,maxSamples:w}}function Gf(n){const e=this;let t=null,i=0,s=!1,r=!1;const o=new Wn,a=new qe,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,p){const f=u.length!==0||p||i!==0||s;return s=p,i=u.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,p){t=h(u,p,0)},this.setState=function(u,p,f){const g=u.clippingPlanes,y=u.clipIntersection,m=u.clipShadows,d=n.get(u);if(!s||g===null||g.length===0||r&&!m)r?h(null):c();else{const b=r?0:i,v=b*4;let _=d.clippingState||null;l.value=_,_=h(g,p,v,f);for(let R=0;R!==v;++R)_[R]=t[R];d.clippingState=_,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=b}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function h(u,p,f,g){const y=u!==null?u.length:0;let m=null;if(y!==0){if(m=l.value,g!==!0||m===null){const d=f+y*4,b=p.matrixWorldInverse;a.getNormalMatrix(b),(m===null||m.length<d)&&(m=new Float32Array(d));for(let v=0,_=f;v!==y;++v,_+=4)o.copy(u[v]).applyMatrix4(b,a),o.normal.toArray(m,_),m[_+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=y,e.numIntersection=0,m}}function Wf(n){let e=new WeakMap;function t(o,a){return a===303?o.mapping=301:a===304&&(o.mapping=302),o}function i(o){if(o&&o.isTexture){const a=o.mapping;if(a===303||a===304)if(e.has(o)){const l=e.get(o).texture;return t(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new eu(l.height);return c.fromEquirectangularTexture(n,o),e.set(o,c),o.addEventListener("dispose",s),t(c.texture,o.mapping)}else return null}}return o}function s(o){const a=o.target;a.removeEventListener("dispose",s);const l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function r(){e=new WeakMap}return{get:i,dispose:r}}class sc extends tc{constructor(e=-1,t=1,i=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=i-e,o=i+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const gi=4,La=[.125,.215,.35,.446,.526,.582],Yn=20,Gr=new sc,Ia=new Ne;let Wr=null,Xr=0,Yr=0,qr=!1;const Xn=(1+Math.sqrt(5))/2,hi=1/Xn,Da=[new L(-Xn,hi,0),new L(Xn,hi,0),new L(-hi,0,Xn),new L(hi,0,Xn),new L(0,Xn,-hi),new L(0,Xn,hi),new L(-1,1,-1),new L(1,1,-1),new L(-1,1,1),new L(1,1,1)];class Na{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,s=100){Wr=this._renderer.getRenderTarget(),Xr=this._renderer.getActiveCubeFace(),Yr=this._renderer.getActiveMipmapLevel(),qr=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(e,i,s,r),t>0&&this._blur(r,0,0,t),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Fa(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=ka(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Wr,Xr,Yr),this._renderer.xr.enabled=qr,e.scissorTest=!1,Ls(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Wr=this._renderer.getRenderTarget(),Xr=this._renderer.getActiveCubeFace(),Yr=this._renderer.getActiveMipmapLevel(),qr=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:1006,minFilter:1006,generateMipmaps:!1,type:1016,format:1023,colorSpace:Ci,depthBuffer:!1},s=Ua(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Ua(e,t,i);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Xf(r)),this._blurMaterial=Yf(r,e,t)}return s}_compileMaterial(e){const t=new ht(this._lodPlanes[0],e);this._renderer.compile(t,Gr)}_sceneToCubeUV(e,t,i,s){const a=new Wt(90,1,t,i),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,p=h.toneMapping;h.getClearColor(Ia),h.toneMapping=0,h.autoClear=!1;const f=new Fo({name:"PMREM.Background",side:1,depthWrite:!1,depthTest:!1}),g=new ht(new wt,f);let y=!1;const m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,y=!0):(f.color.copy(Ia),y=!0);for(let d=0;d<6;d++){const b=d%3;b===0?(a.up.set(0,l[d],0),a.lookAt(c[d],0,0)):b===1?(a.up.set(0,0,l[d]),a.lookAt(0,c[d],0)):(a.up.set(0,l[d],0),a.lookAt(0,0,c[d]));const v=this._cubeSize;Ls(s,b*v,d>2?v:0,v,v),h.setRenderTarget(s),y&&h.render(g,a),h.render(e,a)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=p,h.autoClear=u,e.background=m}_textureToCubeUV(e,t){const i=this._renderer,s=e.mapping===301||e.mapping===302;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Fa()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=ka());const r=s?this._cubemapMaterial:this._equirectMaterial,o=new ht(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;const l=this._cubeSize;Ls(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(o,Gr)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const s=this._lodPlanes.length;for(let r=1;r<s;r++){const o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=Da[(s-r-1)%Da.length];this._blur(e,r-1,r,o,a)}t.autoClear=i}_blur(e,t,i,s,r){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,i,s,"latitudinal",r),this._halfBlur(o,e,i,i,s,"longitudinal",r)}_halfBlur(e,t,i,s,r,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new ht(this._lodPlanes[s],c),p=c.uniforms,f=this._sizeLods[i]-1,g=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*Yn-1),y=r/g,m=isFinite(r)?1+Math.floor(h*y):Yn;m>Yn&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Yn}`);const d=[];let b=0;for(let A=0;A<Yn;++A){const C=A/y,S=Math.exp(-C*C/2);d.push(S),A===0?b+=S:A<m&&(b+=2*S)}for(let A=0;A<d.length;A++)d[A]=d[A]/b;p.envMap.value=e.texture,p.samples.value=m,p.weights.value=d,p.latitudinal.value=o==="latitudinal",a&&(p.poleAxis.value=a);const{_lodMax:v}=this;p.dTheta.value=g,p.mipInt.value=v-i;const _=this._sizeLods[s],R=3*_*(s>v-gi?s-v+gi:0),w=4*(this._cubeSize-_);Ls(t,R,w,3*_,2*_),l.setRenderTarget(t),l.render(u,Gr)}}function Xf(n){const e=[],t=[],i=[];let s=n;const r=n-gi+1+La.length;for(let o=0;o<r;o++){const a=Math.pow(2,s);t.push(a);let l=1/a;o>n-gi?l=La[o-n+gi-1]:o===0&&(l=0),i.push(l);const c=1/(a-2),h=-c,u=1+c,p=[h,h,u,h,u,u,h,h,u,u,h,u],f=6,g=6,y=3,m=2,d=1,b=new Float32Array(y*g*f),v=new Float32Array(m*g*f),_=new Float32Array(d*g*f);for(let w=0;w<f;w++){const A=w%3*2/3-1,C=w>2?0:-1,S=[A,C,0,A+2/3,C,0,A+2/3,C+1,0,A,C,0,A+2/3,C+1,0,A,C+1,0];b.set(S,y*g*w),v.set(p,m*g*w);const M=[w,w,w,w,w,w];_.set(M,d*g*w)}const R=new _t;R.setAttribute("position",new Pt(b,y)),R.setAttribute("uv",new Pt(v,m)),R.setAttribute("faceIndex",new Pt(_,d)),e.push(R),s>gi&&s--}return{lodPlanes:e,sizeLods:t,sigmas:i}}function Ua(n,e,t){const i=new Kn(n,e,t);return i.texture.mapping=306,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Ls(n,e,t,i,s){n.viewport.set(e,t,i,s),n.scissor.set(e,t,i,s)}function Yf(n,e,t){const i=new Float32Array(Yn),s=new L(0,1,0);return new Dn({name:"SphericalGaussianBlur",defines:{n:Yn,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:zo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function ka(){return new Dn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:zo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Fa(){return new Dn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:zo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function zo(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function qf(n){let e=new WeakMap,t=null;function i(a){if(a&&a.isTexture){const l=a.mapping,c=l===303||l===304,h=l===301||l===302;if(c||h){let u=e.get(a);const p=u!==void 0?u.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==p)return t===null&&(t=new Na(n)),u=c?t.fromEquirectangular(a,u):t.fromCubemap(a,u),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),u.texture;if(u!==void 0)return u.texture;{const f=a.image;return c&&f&&f.height>0||h&&f&&s(f)?(t===null&&(t=new Na(n)),u=c?t.fromEquirectangular(a):t.fromCubemap(a),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),a.addEventListener("dispose",r),u.texture):null}}}return a}function s(a){let l=0;const c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function r(a){const l=a.target;l.removeEventListener("dispose",r);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:o}}function jf(n){const e={};function t(i){if(e[i]!==void 0)return e[i];let s;switch(i){case"WEBGL_depth_texture":s=n.getExtension("WEBGL_depth_texture")||n.getExtension("MOZ_WEBGL_depth_texture")||n.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=n.getExtension("EXT_texture_filter_anisotropic")||n.getExtension("MOZ_EXT_texture_filter_anisotropic")||n.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=n.getExtension("WEBGL_compressed_texture_s3tc")||n.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=n.getExtension("WEBGL_compressed_texture_pvrtc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=n.getExtension(i)}return e[i]=s,s}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const s=t(i);return s===null&&Zi("THREE.WebGLRenderer: "+i+" extension not supported."),s}}}function Kf(n,e,t,i){const s={},r=new WeakMap;function o(u){const p=u.target;p.index!==null&&e.remove(p.index);for(const g in p.attributes)e.remove(p.attributes[g]);for(const g in p.morphAttributes){const y=p.morphAttributes[g];for(let m=0,d=y.length;m<d;m++)e.remove(y[m])}p.removeEventListener("dispose",o),delete s[p.id];const f=r.get(p);f&&(e.remove(f),r.delete(p)),i.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,t.memory.geometries--}function a(u,p){return s[p.id]===!0||(p.addEventListener("dispose",o),s[p.id]=!0,t.memory.geometries++),p}function l(u){const p=u.attributes;for(const g in p)e.update(p[g],n.ARRAY_BUFFER);const f=u.morphAttributes;for(const g in f){const y=f[g];for(let m=0,d=y.length;m<d;m++)e.update(y[m],n.ARRAY_BUFFER)}}function c(u){const p=[],f=u.index,g=u.attributes.position;let y=0;if(f!==null){const b=f.array;y=f.version;for(let v=0,_=b.length;v<_;v+=3){const R=b[v+0],w=b[v+1],A=b[v+2];p.push(R,w,w,A,A,R)}}else if(g!==void 0){const b=g.array;y=g.version;for(let v=0,_=b.length/3-1;v<_;v+=3){const R=v+0,w=v+1,A=v+2;p.push(R,w,w,A,A,R)}}else return;const m=new(Kl(p)?Ql:Oo)(p,1);m.version=y;const d=r.get(u);d&&e.remove(d),r.set(u,m)}function h(u){const p=r.get(u);if(p){const f=u.index;f!==null&&p.version<f.version&&c(u)}else c(u);return r.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function Jf(n,e,t){let i;function s(p){i=p}let r,o;function a(p){r=p.type,o=p.bytesPerElement}function l(p,f){n.drawElements(i,f,r,p*o),t.update(f,i,1)}function c(p,f,g){g!==0&&(n.drawElementsInstanced(i,f,r,p*o,g),t.update(f,i,g))}function h(p,f,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,f,0,r,p,0,g);let m=0;for(let d=0;d<g;d++)m+=f[d];t.update(m,i,1)}function u(p,f,g,y){if(g===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let d=0;d<p.length;d++)c(p[d]/o,f[d],y[d]);else{m.multiDrawElementsInstancedWEBGL(i,f,0,r,p,0,y,0,g);let d=0;for(let b=0;b<g;b++)d+=f[b]*y[b];t.update(d,i,1)}}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function Zf(n){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,a){switch(t.calls++,o){case n.TRIANGLES:t.triangles+=a*(r/3);break;case n.LINES:t.lines+=a*(r/2);break;case n.LINE_STRIP:t.lines+=a*(r-1);break;case n.LINE_LOOP:t.lines+=a*r;break;case n.POINTS:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:i}}function $f(n,e,t){const i=new WeakMap,s=new tt;function r(o,a,l){const c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0;let p=i.get(a);if(p===void 0||p.count!==u){let S=function(){A.dispose(),i.delete(a),a.removeEventListener("dispose",S)};p!==void 0&&p.texture.dispose();const f=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,y=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],d=a.morphAttributes.normal||[],b=a.morphAttributes.color||[];let v=0;f===!0&&(v=1),g===!0&&(v=2),y===!0&&(v=3);let _=a.attributes.position.count*v,R=1;_>e.maxTextureSize&&(R=Math.ceil(_/e.maxTextureSize),_=e.maxTextureSize);const w=new Float32Array(_*R*4*u),A=new Zl(w,_,R,u);A.type=1015,A.needsUpdate=!0;const C=v*4;for(let M=0;M<u;M++){const I=m[M],z=d[M],N=b[M],O=_*R*4*M;for(let X=0;X<I.count;X++){const Y=X*C;f===!0&&(s.fromBufferAttribute(I,X),w[O+Y+0]=s.x,w[O+Y+1]=s.y,w[O+Y+2]=s.z,w[O+Y+3]=0),g===!0&&(s.fromBufferAttribute(z,X),w[O+Y+4]=s.x,w[O+Y+5]=s.y,w[O+Y+6]=s.z,w[O+Y+7]=0),y===!0&&(s.fromBufferAttribute(N,X),w[O+Y+8]=s.x,w[O+Y+9]=s.y,w[O+Y+10]=s.z,w[O+Y+11]=N.itemSize===4?s.w:1)}}p={count:u,texture:A,size:new ce(_,R)},i.set(a,p),a.addEventListener("dispose",S)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",o.morphTexture,t);else{let f=0;for(let y=0;y<c.length;y++)f+=c[y];const g=a.morphTargetsRelative?1:1-f;l.getUniforms().setValue(n,"morphTargetBaseInfluence",g),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",p.texture,t),l.getUniforms().setValue(n,"morphTargetsTextureSize",p.size)}return{update:r}}function Qf(n,e,t,i){let s=new WeakMap;function r(l){const c=i.render.frame,h=l.geometry,u=e.get(l,h);if(s.get(u)!==c&&(e.update(u),s.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(t.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,n.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const p=l.skeleton;s.get(p)!==c&&(p.update(),s.set(p,c))}return u}function o(){s=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:o}}class rc extends Ct{constructor(e,t,i,s,r,o,a,l,c,h=1026){if(h!==1026&&h!==1027)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&h===1026&&(i=1014),i===void 0&&h===1027&&(i=1020),super(null,s,r,o,a,l,h,i,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:1003,this.minFilter=l!==void 0?l:1003,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const oc=new Ct,Oa=new rc(1,1),ac=new Zl,lc=new Uh,cc=new nc,Ba=[],za=[],Ha=new Float32Array(16),Va=new Float32Array(9),Ga=new Float32Array(4);function Li(n,e,t){const i=n[0];if(i<=0||i>0)return n;const s=e*t;let r=Ba[s];if(r===void 0&&(r=new Float32Array(s),Ba[s]=r),e!==0){i.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,n[o].toArray(r,a)}return r}function Et(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function At(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function dr(n,e){let t=za[e];t===void 0&&(t=new Int32Array(e),za[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function ep(n,e){const t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function tp(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;n.uniform2fv(this.addr,e),At(t,e)}}function np(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Et(t,e))return;n.uniform3fv(this.addr,e),At(t,e)}}function ip(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;n.uniform4fv(this.addr,e),At(t,e)}}function sp(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Et(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),At(t,e)}else{if(Et(t,i))return;Ga.set(i),n.uniformMatrix2fv(this.addr,!1,Ga),At(t,i)}}function rp(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Et(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),At(t,e)}else{if(Et(t,i))return;Va.set(i),n.uniformMatrix3fv(this.addr,!1,Va),At(t,i)}}function op(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Et(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),At(t,e)}else{if(Et(t,i))return;Ha.set(i),n.uniformMatrix4fv(this.addr,!1,Ha),At(t,i)}}function ap(n,e){const t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function lp(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;n.uniform2iv(this.addr,e),At(t,e)}}function cp(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Et(t,e))return;n.uniform3iv(this.addr,e),At(t,e)}}function hp(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;n.uniform4iv(this.addr,e),At(t,e)}}function up(n,e){const t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function dp(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;n.uniform2uiv(this.addr,e),At(t,e)}}function fp(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Et(t,e))return;n.uniform3uiv(this.addr,e),At(t,e)}}function pp(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;n.uniform4uiv(this.addr,e),At(t,e)}}function mp(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(Oa.compareFunction=515,r=Oa):r=oc,t.setTexture2D(e||r,s)}function gp(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture3D(e||lc,s)}function _p(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTextureCube(e||cc,s)}function yp(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture2DArray(e||ac,s)}function vp(n){switch(n){case 5126:return ep;case 35664:return tp;case 35665:return np;case 35666:return ip;case 35674:return sp;case 35675:return rp;case 35676:return op;case 5124:case 35670:return ap;case 35667:case 35671:return lp;case 35668:case 35672:return cp;case 35669:case 35673:return hp;case 5125:return up;case 36294:return dp;case 36295:return fp;case 36296:return pp;case 35678:case 36198:case 36298:case 36306:case 35682:return mp;case 35679:case 36299:case 36307:return gp;case 35680:case 36300:case 36308:case 36293:return _p;case 36289:case 36303:case 36311:case 36292:return yp}}function bp(n,e){n.uniform1fv(this.addr,e)}function Mp(n,e){const t=Li(e,this.size,2);n.uniform2fv(this.addr,t)}function xp(n,e){const t=Li(e,this.size,3);n.uniform3fv(this.addr,t)}function Sp(n,e){const t=Li(e,this.size,4);n.uniform4fv(this.addr,t)}function wp(n,e){const t=Li(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function Tp(n,e){const t=Li(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function Ep(n,e){const t=Li(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function Ap(n,e){n.uniform1iv(this.addr,e)}function Rp(n,e){n.uniform2iv(this.addr,e)}function Cp(n,e){n.uniform3iv(this.addr,e)}function Pp(n,e){n.uniform4iv(this.addr,e)}function Lp(n,e){n.uniform1uiv(this.addr,e)}function Ip(n,e){n.uniform2uiv(this.addr,e)}function Dp(n,e){n.uniform3uiv(this.addr,e)}function Np(n,e){n.uniform4uiv(this.addr,e)}function Up(n,e,t){const i=this.cache,s=e.length,r=dr(t,s);Et(i,r)||(n.uniform1iv(this.addr,r),At(i,r));for(let o=0;o!==s;++o)t.setTexture2D(e[o]||oc,r[o])}function kp(n,e,t){const i=this.cache,s=e.length,r=dr(t,s);Et(i,r)||(n.uniform1iv(this.addr,r),At(i,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||lc,r[o])}function Fp(n,e,t){const i=this.cache,s=e.length,r=dr(t,s);Et(i,r)||(n.uniform1iv(this.addr,r),At(i,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||cc,r[o])}function Op(n,e,t){const i=this.cache,s=e.length,r=dr(t,s);Et(i,r)||(n.uniform1iv(this.addr,r),At(i,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||ac,r[o])}function Bp(n){switch(n){case 5126:return bp;case 35664:return Mp;case 35665:return xp;case 35666:return Sp;case 35674:return wp;case 35675:return Tp;case 35676:return Ep;case 5124:case 35670:return Ap;case 35667:case 35671:return Rp;case 35668:case 35672:return Cp;case 35669:case 35673:return Pp;case 5125:return Lp;case 36294:return Ip;case 36295:return Dp;case 36296:return Np;case 35678:case 36198:case 36298:case 36306:case 35682:return Up;case 35679:case 36299:case 36307:return kp;case 35680:case 36300:case 36308:case 36293:return Fp;case 36289:case 36303:case 36311:case 36292:return Op}}class zp{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=vp(t.type)}}class Hp{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Bp(t.type)}}class Vp{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const s=this.seq;for(let r=0,o=s.length;r!==o;++r){const a=s[r];a.setValue(e,t[a.id],i)}}}const jr=/(\w+)(\])?(\[|\.)?/g;function Wa(n,e){n.seq.push(e),n.map[e.id]=e}function Gp(n,e,t){const i=n.name,s=i.length;for(jr.lastIndex=0;;){const r=jr.exec(i),o=jr.lastIndex;let a=r[1];const l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){Wa(t,c===void 0?new zp(a,n,e):new Hp(a,n,e));break}else{let u=t.map[a];u===void 0&&(u=new Vp(a),Wa(t,u)),t=u}}}class qs{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<i;++s){const r=e.getActiveUniform(t,s),o=e.getUniformLocation(t,r.name);Gp(r,o,this)}}setValue(e,t,i,s){const r=this.map[t];r!==void 0&&r.setValue(e,i,s)}setOptional(e,t,i){const s=t[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,t,i,s){for(let r=0,o=t.length;r!==o;++r){const a=t[r],l=i[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){const i=[];for(let s=0,r=e.length;s!==r;++s){const o=e[s];o.id in t&&i.push(o)}return i}}function Xa(n,e,t){const i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}const Wp=37297;let Xp=0;function Yp(n,e){const t=n.split(`
`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){const a=o+1;i.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return i.join(`
`)}const Ya=new qe;function qp(n){Qe._getMatrix(Ya,Qe.workingColorSpace,n);const e=`mat3( ${Ya.elements.map(t=>t.toFixed(4))} )`;switch(Qe.getTransfer(n)){case ur:return[e,"LinearTransferOETF"];case lt:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function qa(n,e,t){const i=n.getShaderParameter(e,n.COMPILE_STATUS),s=n.getShaderInfoLog(e).trim();if(i&&s==="")return"";const r=/ERROR: 0:(\d+)/.exec(s);if(r){const o=parseInt(r[1]);return t.toUpperCase()+`

`+s+`

`+Yp(n.getShaderSource(e),o)}else return s}function jp(n,e){const t=qp(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function Kp(n,e){let t;switch(e){case 1:t="Linear";break;case 2:t="Reinhard";break;case 3:t="Cineon";break;case 4:t="ACESFilmic";break;case 6:t="AgX";break;case 7:t="Neutral";break;case 5:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Is=new L;function Jp(){Qe.getLuminanceCoefficients(Is);const n=Is.x.toFixed(4),e=Is.y.toFixed(4),t=Is.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Zp(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter($i).join(`
`)}function $p(n){const e=[];for(const t in n){const i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function Qp(n,e){const t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){const r=n.getActiveAttrib(e,s),o=r.name;let a=1;r.type===n.FLOAT_MAT2&&(a=2),r.type===n.FLOAT_MAT3&&(a=3),r.type===n.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:n.getAttribLocation(e,o),locationSize:a}}return t}function $i(n){return n!==""}function ja(n,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Ka(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const em=/^[ \t]*#include +<([\w\d./]+)>/gm;function mo(n){return n.replace(em,nm)}const tm=new Map;function nm(n,e){let t=Ve[e];if(t===void 0){const i=tm.get(e);if(i!==void 0)t=Ve[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return mo(t)}const im=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Ja(n){return n.replace(im,sm)}function sm(n,e,t,i){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Za(n){let e=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?e+=`
#define HIGH_PRECISION`:n.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function rm(n){let e="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===1?e="SHADOWMAP_TYPE_PCF":n.shadowMapType===2?e="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===3&&(e="SHADOWMAP_TYPE_VSM"),e}function om(n){let e="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case 301:case 302:e="ENVMAP_TYPE_CUBE";break;case 306:e="ENVMAP_TYPE_CUBE_UV";break}return e}function am(n){let e="ENVMAP_MODE_REFLECTION";if(n.envMap)switch(n.envMapMode){case 302:e="ENVMAP_MODE_REFRACTION";break}return e}function lm(n){let e="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case 0:e="ENVMAP_BLENDING_MULTIPLY";break;case 1:e="ENVMAP_BLENDING_MIX";break;case 2:e="ENVMAP_BLENDING_ADD";break}return e}function cm(n){const e=n.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function hm(n,e,t,i){const s=n.getContext(),r=t.defines;let o=t.vertexShader,a=t.fragmentShader;const l=rm(t),c=om(t),h=am(t),u=lm(t),p=cm(t),f=Zp(t),g=$p(r),y=s.createProgram();let m,d,b=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter($i).join(`
`),m.length>0&&(m+=`
`),d=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter($i).join(`
`),d.length>0&&(d+=`
`)):(m=[Za(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter($i).join(`
`),d=[Za(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",p?"#define CUBEUV_TEXEL_WIDTH "+p.texelWidth:"",p?"#define CUBEUV_TEXEL_HEIGHT "+p.texelHeight:"",p?"#define CUBEUV_MAX_MIP "+p.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==0?"#define TONE_MAPPING":"",t.toneMapping!==0?Ve.tonemapping_pars_fragment:"",t.toneMapping!==0?Kp("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ve.colorspace_pars_fragment,jp("linearToOutputTexel",t.outputColorSpace),Jp(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter($i).join(`
`)),o=mo(o),o=ja(o,t),o=Ka(o,t),a=mo(a),a=ja(a,t),a=Ka(a,t),o=Ja(o),a=Ja(a),t.isRawShaderMaterial!==!0&&(b=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,d=["#define varying in",t.glslVersion===ca?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===ca?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);const v=b+m+o,_=b+d+a,R=Xa(s,s.VERTEX_SHADER,v),w=Xa(s,s.FRAGMENT_SHADER,_);s.attachShader(y,R),s.attachShader(y,w),t.index0AttributeName!==void 0?s.bindAttribLocation(y,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(y,0,"position"),s.linkProgram(y);function A(I){if(n.debug.checkShaderErrors){const z=s.getProgramInfoLog(y).trim(),N=s.getShaderInfoLog(R).trim(),O=s.getShaderInfoLog(w).trim();let X=!0,Y=!0;if(s.getProgramParameter(y,s.LINK_STATUS)===!1)if(X=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,y,R,w);else{const se=qa(s,R,"vertex"),U=qa(s,w,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(y,s.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+z+`
`+se+`
`+U)}else z!==""?console.warn("THREE.WebGLProgram: Program Info Log:",z):(N===""||O==="")&&(Y=!1);Y&&(I.diagnostics={runnable:X,programLog:z,vertexShader:{log:N,prefix:m},fragmentShader:{log:O,prefix:d}})}s.deleteShader(R),s.deleteShader(w),C=new qs(s,y),S=Qp(s,y)}let C;this.getUniforms=function(){return C===void 0&&A(this),C};let S;this.getAttributes=function(){return S===void 0&&A(this),S};let M=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return M===!1&&(M=s.getProgramParameter(y,Wp)),M},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(y),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Xp++,this.cacheKey=e,this.usedTimes=1,this.program=y,this.vertexShader=R,this.fragmentShader=w,this}let um=0;class dm{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,i=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(i),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new fm(e),t.set(e,i)),i}}class fm{constructor(e){this.id=um++,this.code=e,this.usedTimes=0}}function pm(n,e,t,i,s,r,o){const a=new ko,l=new dm,c=new Set,h=[],u=s.logarithmicDepthBuffer,p=s.vertexTextures;let f=s.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function y(S){return c.add(S),S===0?"uv":`uv${S}`}function m(S,M,I,z,N){const O=z.fog,X=N.geometry,Y=S.isMeshStandardMaterial?z.environment:null,se=(S.isMeshStandardMaterial?t:e).get(S.envMap||Y),U=se&&se.mapping===306?se.image.height:null,x=g[S.type];S.precision!==null&&(f=s.getMaxPrecision(S.precision),f!==S.precision&&console.warn("THREE.WebGLProgram.getParameters:",S.precision,"not supported, using",f,"instead."));const F=X.morphAttributes.position||X.morphAttributes.normal||X.morphAttributes.color,oe=F!==void 0?F.length:0;let we=0;X.morphAttributes.position!==void 0&&(we=1),X.morphAttributes.normal!==void 0&&(we=2),X.morphAttributes.color!==void 0&&(we=3);let Fe,$,he,ie;if(x){const rt=an[x];Fe=rt.vertexShader,$=rt.fragmentShader}else Fe=S.vertexShader,$=S.fragmentShader,l.update(S),he=l.getVertexShaderID(S),ie=l.getFragmentShaderID(S);const W=n.getRenderTarget(),ne=n.state.buffers.depth.getReversed(),Re=N.isInstancedMesh===!0,te=N.isBatchedMesh===!0,B=!!S.map,K=!!S.matcap,re=!!se,D=!!S.aoMap,ue=!!S.lightMap,le=!!S.bumpMap,ye=!!S.normalMap,pe=!!S.displacementMap,De=!!S.emissiveMap,ve=!!S.metalnessMap,P=!!S.roughnessMap,T=S.anisotropy>0,k=S.clearcoat>0,J=S.dispersion>0,ee=S.iridescence>0,Z=S.sheen>0,Ae=S.transmission>0,ge=T&&!!S.anisotropyMap,Se=k&&!!S.clearcoatMap,Je=k&&!!S.clearcoatNormalMap,de=k&&!!S.clearcoatRoughnessMap,Te=ee&&!!S.iridescenceMap,ke=ee&&!!S.iridescenceThicknessMap,Be=Z&&!!S.sheenColorMap,Ee=Z&&!!S.sheenRoughnessMap,$e=!!S.specularMap,je=!!S.specularColorMap,ut=!!S.specularIntensityMap,H=Ae&&!!S.transmissionMap,_e=Ae&&!!S.thicknessMap,Q=!!S.gradientMap,ae=!!S.alphaMap,xe=S.alphaTest>0,be=!!S.alphaHash,We=!!S.extensions;let bt=0;S.toneMapped&&(W===null||W.isXRRenderTarget===!0)&&(bt=n.toneMapping);const Lt={shaderID:x,shaderType:S.type,shaderName:S.name,vertexShader:Fe,fragmentShader:$,defines:S.defines,customVertexShaderID:he,customFragmentShaderID:ie,isRawShaderMaterial:S.isRawShaderMaterial===!0,glslVersion:S.glslVersion,precision:f,batching:te,batchingColor:te&&N._colorsTexture!==null,instancing:Re,instancingColor:Re&&N.instanceColor!==null,instancingMorph:Re&&N.morphTexture!==null,supportsVertexTextures:p,outputColorSpace:W===null?n.outputColorSpace:W.isXRRenderTarget===!0?W.texture.colorSpace:Ci,alphaToCoverage:!!S.alphaToCoverage,map:B,matcap:K,envMap:re,envMapMode:re&&se.mapping,envMapCubeUVHeight:U,aoMap:D,lightMap:ue,bumpMap:le,normalMap:ye,displacementMap:p&&pe,emissiveMap:De,normalMapObjectSpace:ye&&S.normalMapType===1,normalMapTangentSpace:ye&&S.normalMapType===0,metalnessMap:ve,roughnessMap:P,anisotropy:T,anisotropyMap:ge,clearcoat:k,clearcoatMap:Se,clearcoatNormalMap:Je,clearcoatRoughnessMap:de,dispersion:J,iridescence:ee,iridescenceMap:Te,iridescenceThicknessMap:ke,sheen:Z,sheenColorMap:Be,sheenRoughnessMap:Ee,specularMap:$e,specularColorMap:je,specularIntensityMap:ut,transmission:Ae,transmissionMap:H,thicknessMap:_e,gradientMap:Q,opaque:S.transparent===!1&&S.blending===1&&S.alphaToCoverage===!1,alphaMap:ae,alphaTest:xe,alphaHash:be,combine:S.combine,mapUv:B&&y(S.map.channel),aoMapUv:D&&y(S.aoMap.channel),lightMapUv:ue&&y(S.lightMap.channel),bumpMapUv:le&&y(S.bumpMap.channel),normalMapUv:ye&&y(S.normalMap.channel),displacementMapUv:pe&&y(S.displacementMap.channel),emissiveMapUv:De&&y(S.emissiveMap.channel),metalnessMapUv:ve&&y(S.metalnessMap.channel),roughnessMapUv:P&&y(S.roughnessMap.channel),anisotropyMapUv:ge&&y(S.anisotropyMap.channel),clearcoatMapUv:Se&&y(S.clearcoatMap.channel),clearcoatNormalMapUv:Je&&y(S.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:de&&y(S.clearcoatRoughnessMap.channel),iridescenceMapUv:Te&&y(S.iridescenceMap.channel),iridescenceThicknessMapUv:ke&&y(S.iridescenceThicknessMap.channel),sheenColorMapUv:Be&&y(S.sheenColorMap.channel),sheenRoughnessMapUv:Ee&&y(S.sheenRoughnessMap.channel),specularMapUv:$e&&y(S.specularMap.channel),specularColorMapUv:je&&y(S.specularColorMap.channel),specularIntensityMapUv:ut&&y(S.specularIntensityMap.channel),transmissionMapUv:H&&y(S.transmissionMap.channel),thicknessMapUv:_e&&y(S.thicknessMap.channel),alphaMapUv:ae&&y(S.alphaMap.channel),vertexTangents:!!X.attributes.tangent&&(ye||T),vertexColors:S.vertexColors,vertexAlphas:S.vertexColors===!0&&!!X.attributes.color&&X.attributes.color.itemSize===4,pointsUvs:N.isPoints===!0&&!!X.attributes.uv&&(B||ae),fog:!!O,useFog:S.fog===!0,fogExp2:!!O&&O.isFogExp2,flatShading:S.flatShading===!0,sizeAttenuation:S.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:ne,skinning:N.isSkinnedMesh===!0,morphTargets:X.morphAttributes.position!==void 0,morphNormals:X.morphAttributes.normal!==void 0,morphColors:X.morphAttributes.color!==void 0,morphTargetsCount:oe,morphTextureStride:we,numDirLights:M.directional.length,numPointLights:M.point.length,numSpotLights:M.spot.length,numSpotLightMaps:M.spotLightMap.length,numRectAreaLights:M.rectArea.length,numHemiLights:M.hemi.length,numDirLightShadows:M.directionalShadowMap.length,numPointLightShadows:M.pointShadowMap.length,numSpotLightShadows:M.spotShadowMap.length,numSpotLightShadowsWithMaps:M.numSpotLightShadowsWithMaps,numLightProbes:M.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:S.dithering,shadowMapEnabled:n.shadowMap.enabled&&I.length>0,shadowMapType:n.shadowMap.type,toneMapping:bt,decodeVideoTexture:B&&S.map.isVideoTexture===!0&&Qe.getTransfer(S.map.colorSpace)===lt,decodeVideoTextureEmissive:De&&S.emissiveMap.isVideoTexture===!0&&Qe.getTransfer(S.emissiveMap.colorSpace)===lt,premultipliedAlpha:S.premultipliedAlpha,doubleSided:S.side===2,flipSided:S.side===1,useDepthPacking:S.depthPacking>=0,depthPacking:S.depthPacking||0,index0AttributeName:S.index0AttributeName,extensionClipCullDistance:We&&S.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(We&&S.extensions.multiDraw===!0||te)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:S.customProgramCacheKey()};return Lt.vertexUv1s=c.has(1),Lt.vertexUv2s=c.has(2),Lt.vertexUv3s=c.has(3),c.clear(),Lt}function d(S){const M=[];if(S.shaderID?M.push(S.shaderID):(M.push(S.customVertexShaderID),M.push(S.customFragmentShaderID)),S.defines!==void 0)for(const I in S.defines)M.push(I),M.push(S.defines[I]);return S.isRawShaderMaterial===!1&&(b(M,S),v(M,S),M.push(n.outputColorSpace)),M.push(S.customProgramCacheKey),M.join()}function b(S,M){S.push(M.precision),S.push(M.outputColorSpace),S.push(M.envMapMode),S.push(M.envMapCubeUVHeight),S.push(M.mapUv),S.push(M.alphaMapUv),S.push(M.lightMapUv),S.push(M.aoMapUv),S.push(M.bumpMapUv),S.push(M.normalMapUv),S.push(M.displacementMapUv),S.push(M.emissiveMapUv),S.push(M.metalnessMapUv),S.push(M.roughnessMapUv),S.push(M.anisotropyMapUv),S.push(M.clearcoatMapUv),S.push(M.clearcoatNormalMapUv),S.push(M.clearcoatRoughnessMapUv),S.push(M.iridescenceMapUv),S.push(M.iridescenceThicknessMapUv),S.push(M.sheenColorMapUv),S.push(M.sheenRoughnessMapUv),S.push(M.specularMapUv),S.push(M.specularColorMapUv),S.push(M.specularIntensityMapUv),S.push(M.transmissionMapUv),S.push(M.thicknessMapUv),S.push(M.combine),S.push(M.fogExp2),S.push(M.sizeAttenuation),S.push(M.morphTargetsCount),S.push(M.morphAttributeCount),S.push(M.numDirLights),S.push(M.numPointLights),S.push(M.numSpotLights),S.push(M.numSpotLightMaps),S.push(M.numHemiLights),S.push(M.numRectAreaLights),S.push(M.numDirLightShadows),S.push(M.numPointLightShadows),S.push(M.numSpotLightShadows),S.push(M.numSpotLightShadowsWithMaps),S.push(M.numLightProbes),S.push(M.shadowMapType),S.push(M.toneMapping),S.push(M.numClippingPlanes),S.push(M.numClipIntersection),S.push(M.depthPacking)}function v(S,M){a.disableAll(),M.supportsVertexTextures&&a.enable(0),M.instancing&&a.enable(1),M.instancingColor&&a.enable(2),M.instancingMorph&&a.enable(3),M.matcap&&a.enable(4),M.envMap&&a.enable(5),M.normalMapObjectSpace&&a.enable(6),M.normalMapTangentSpace&&a.enable(7),M.clearcoat&&a.enable(8),M.iridescence&&a.enable(9),M.alphaTest&&a.enable(10),M.vertexColors&&a.enable(11),M.vertexAlphas&&a.enable(12),M.vertexUv1s&&a.enable(13),M.vertexUv2s&&a.enable(14),M.vertexUv3s&&a.enable(15),M.vertexTangents&&a.enable(16),M.anisotropy&&a.enable(17),M.alphaHash&&a.enable(18),M.batching&&a.enable(19),M.dispersion&&a.enable(20),M.batchingColor&&a.enable(21),S.push(a.mask),a.disableAll(),M.fog&&a.enable(0),M.useFog&&a.enable(1),M.flatShading&&a.enable(2),M.logarithmicDepthBuffer&&a.enable(3),M.reverseDepthBuffer&&a.enable(4),M.skinning&&a.enable(5),M.morphTargets&&a.enable(6),M.morphNormals&&a.enable(7),M.morphColors&&a.enable(8),M.premultipliedAlpha&&a.enable(9),M.shadowMapEnabled&&a.enable(10),M.doubleSided&&a.enable(11),M.flipSided&&a.enable(12),M.useDepthPacking&&a.enable(13),M.dithering&&a.enable(14),M.transmission&&a.enable(15),M.sheen&&a.enable(16),M.opaque&&a.enable(17),M.pointsUvs&&a.enable(18),M.decodeVideoTexture&&a.enable(19),M.decodeVideoTextureEmissive&&a.enable(20),M.alphaToCoverage&&a.enable(21),S.push(a.mask)}function _(S){const M=g[S.type];let I;if(M){const z=an[M];I=Jh.clone(z.uniforms)}else I=S.uniforms;return I}function R(S,M){let I;for(let z=0,N=h.length;z<N;z++){const O=h[z];if(O.cacheKey===M){I=O,++I.usedTimes;break}}return I===void 0&&(I=new hm(n,M,S,r),h.push(I)),I}function w(S){if(--S.usedTimes===0){const M=h.indexOf(S);h[M]=h[h.length-1],h.pop(),S.destroy()}}function A(S){l.remove(S)}function C(){l.dispose()}return{getParameters:m,getProgramCacheKey:d,getUniforms:_,acquireProgram:R,releaseProgram:w,releaseShaderCache:A,programs:h,dispose:C}}function mm(){let n=new WeakMap;function e(o){return n.has(o)}function t(o){let a=n.get(o);return a===void 0&&(a={},n.set(o,a)),a}function i(o){n.delete(o)}function s(o,a,l){n.get(o)[a]=l}function r(){n=new WeakMap}return{has:e,get:t,remove:i,update:s,dispose:r}}function gm(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function $a(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function Qa(){const n=[];let e=0;const t=[],i=[],s=[];function r(){e=0,t.length=0,i.length=0,s.length=0}function o(u,p,f,g,y,m){let d=n[e];return d===void 0?(d={id:u.id,object:u,geometry:p,material:f,groupOrder:g,renderOrder:u.renderOrder,z:y,group:m},n[e]=d):(d.id=u.id,d.object=u,d.geometry=p,d.material=f,d.groupOrder=g,d.renderOrder=u.renderOrder,d.z=y,d.group=m),e++,d}function a(u,p,f,g,y,m){const d=o(u,p,f,g,y,m);f.transmission>0?i.push(d):f.transparent===!0?s.push(d):t.push(d)}function l(u,p,f,g,y,m){const d=o(u,p,f,g,y,m);f.transmission>0?i.unshift(d):f.transparent===!0?s.unshift(d):t.unshift(d)}function c(u,p){t.length>1&&t.sort(u||gm),i.length>1&&i.sort(p||$a),s.length>1&&s.sort(p||$a)}function h(){for(let u=e,p=n.length;u<p;u++){const f=n[u];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:i,transparent:s,init:r,push:a,unshift:l,finish:h,sort:c}}function _m(){let n=new WeakMap;function e(i,s){const r=n.get(i);let o;return r===void 0?(o=new Qa,n.set(i,[o])):s>=r.length?(o=new Qa,r.push(o)):o=r[s],o}function t(){n=new WeakMap}return{get:e,dispose:t}}function ym(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new L,color:new Ne};break;case"SpotLight":t={position:new L,direction:new L,color:new Ne,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new L,color:new Ne,distance:0,decay:0};break;case"HemisphereLight":t={direction:new L,skyColor:new Ne,groundColor:new Ne};break;case"RectAreaLight":t={color:new Ne,position:new L,halfWidth:new L,halfHeight:new L};break}return n[e.id]=t,t}}}function vm(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ce};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ce};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ce,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}let bm=0;function Mm(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function xm(n){const e=new ym,t=vm(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new L);const s=new L,r=new He,o=new He;function a(c){let h=0,u=0,p=0;for(let S=0;S<9;S++)i.probe[S].set(0,0,0);let f=0,g=0,y=0,m=0,d=0,b=0,v=0,_=0,R=0,w=0,A=0;c.sort(Mm);for(let S=0,M=c.length;S<M;S++){const I=c[S],z=I.color,N=I.intensity,O=I.distance,X=I.shadow&&I.shadow.map?I.shadow.map.texture:null;if(I.isAmbientLight)h+=z.r*N,u+=z.g*N,p+=z.b*N;else if(I.isLightProbe){for(let Y=0;Y<9;Y++)i.probe[Y].addScaledVector(I.sh.coefficients[Y],N);A++}else if(I.isDirectionalLight){const Y=e.get(I);if(Y.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){const se=I.shadow,U=t.get(I);U.shadowIntensity=se.intensity,U.shadowBias=se.bias,U.shadowNormalBias=se.normalBias,U.shadowRadius=se.radius,U.shadowMapSize=se.mapSize,i.directionalShadow[f]=U,i.directionalShadowMap[f]=X,i.directionalShadowMatrix[f]=I.shadow.matrix,b++}i.directional[f]=Y,f++}else if(I.isSpotLight){const Y=e.get(I);Y.position.setFromMatrixPosition(I.matrixWorld),Y.color.copy(z).multiplyScalar(N),Y.distance=O,Y.coneCos=Math.cos(I.angle),Y.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),Y.decay=I.decay,i.spot[y]=Y;const se=I.shadow;if(I.map&&(i.spotLightMap[R]=I.map,R++,se.updateMatrices(I),I.castShadow&&w++),i.spotLightMatrix[y]=se.matrix,I.castShadow){const U=t.get(I);U.shadowIntensity=se.intensity,U.shadowBias=se.bias,U.shadowNormalBias=se.normalBias,U.shadowRadius=se.radius,U.shadowMapSize=se.mapSize,i.spotShadow[y]=U,i.spotShadowMap[y]=X,_++}y++}else if(I.isRectAreaLight){const Y=e.get(I);Y.color.copy(z).multiplyScalar(N),Y.halfWidth.set(I.width*.5,0,0),Y.halfHeight.set(0,I.height*.5,0),i.rectArea[m]=Y,m++}else if(I.isPointLight){const Y=e.get(I);if(Y.color.copy(I.color).multiplyScalar(I.intensity),Y.distance=I.distance,Y.decay=I.decay,I.castShadow){const se=I.shadow,U=t.get(I);U.shadowIntensity=se.intensity,U.shadowBias=se.bias,U.shadowNormalBias=se.normalBias,U.shadowRadius=se.radius,U.shadowMapSize=se.mapSize,U.shadowCameraNear=se.camera.near,U.shadowCameraFar=se.camera.far,i.pointShadow[g]=U,i.pointShadowMap[g]=X,i.pointShadowMatrix[g]=I.shadow.matrix,v++}i.point[g]=Y,g++}else if(I.isHemisphereLight){const Y=e.get(I);Y.skyColor.copy(I.color).multiplyScalar(N),Y.groundColor.copy(I.groundColor).multiplyScalar(N),i.hemi[d]=Y,d++}}m>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=me.LTC_FLOAT_1,i.rectAreaLTC2=me.LTC_FLOAT_2):(i.rectAreaLTC1=me.LTC_HALF_1,i.rectAreaLTC2=me.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=u,i.ambient[2]=p;const C=i.hash;(C.directionalLength!==f||C.pointLength!==g||C.spotLength!==y||C.rectAreaLength!==m||C.hemiLength!==d||C.numDirectionalShadows!==b||C.numPointShadows!==v||C.numSpotShadows!==_||C.numSpotMaps!==R||C.numLightProbes!==A)&&(i.directional.length=f,i.spot.length=y,i.rectArea.length=m,i.point.length=g,i.hemi.length=d,i.directionalShadow.length=b,i.directionalShadowMap.length=b,i.pointShadow.length=v,i.pointShadowMap.length=v,i.spotShadow.length=_,i.spotShadowMap.length=_,i.directionalShadowMatrix.length=b,i.pointShadowMatrix.length=v,i.spotLightMatrix.length=_+R-w,i.spotLightMap.length=R,i.numSpotLightShadowsWithMaps=w,i.numLightProbes=A,C.directionalLength=f,C.pointLength=g,C.spotLength=y,C.rectAreaLength=m,C.hemiLength=d,C.numDirectionalShadows=b,C.numPointShadows=v,C.numSpotShadows=_,C.numSpotMaps=R,C.numLightProbes=A,i.version=bm++)}function l(c,h){let u=0,p=0,f=0,g=0,y=0;const m=h.matrixWorldInverse;for(let d=0,b=c.length;d<b;d++){const v=c[d];if(v.isDirectionalLight){const _=i.directional[u];_.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),_.direction.sub(s),_.direction.transformDirection(m),u++}else if(v.isSpotLight){const _=i.spot[f];_.position.setFromMatrixPosition(v.matrixWorld),_.position.applyMatrix4(m),_.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),_.direction.sub(s),_.direction.transformDirection(m),f++}else if(v.isRectAreaLight){const _=i.rectArea[g];_.position.setFromMatrixPosition(v.matrixWorld),_.position.applyMatrix4(m),o.identity(),r.copy(v.matrixWorld),r.premultiply(m),o.extractRotation(r),_.halfWidth.set(v.width*.5,0,0),_.halfHeight.set(0,v.height*.5,0),_.halfWidth.applyMatrix4(o),_.halfHeight.applyMatrix4(o),g++}else if(v.isPointLight){const _=i.point[p];_.position.setFromMatrixPosition(v.matrixWorld),_.position.applyMatrix4(m),p++}else if(v.isHemisphereLight){const _=i.hemi[y];_.direction.setFromMatrixPosition(v.matrixWorld),_.direction.transformDirection(m),y++}}}return{setup:a,setupView:l,state:i}}function el(n){const e=new xm(n),t=[],i=[];function s(h){c.camera=h,t.length=0,i.length=0}function r(h){t.push(h)}function o(h){i.push(h)}function a(){e.setup(t)}function l(h){e.setupView(t,h)}const c={lightsArray:t,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function Sm(n){let e=new WeakMap;function t(s,r=0){const o=e.get(s);let a;return o===void 0?(a=new el(n),e.set(s,[a])):r>=o.length?(a=new el(n),o.push(a)):a=o[r],a}function i(){e=new WeakMap}return{get:t,dispose:i}}class wm extends Mn{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=3200,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Tm extends Mn{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const Em=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Am=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function Rm(n,e,t){let i=new Bo;const s=new ce,r=new ce,o=new tt,a=new wm({depthPacking:3201}),l=new Tm,c={},h=t.maxTextureSize,u={0:1,1:0,2:2},p=new Dn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ce},radius:{value:4}},vertexShader:Em,fragmentShader:Am}),f=p.clone();f.defines.HORIZONTAL_PASS=1;const g=new _t;g.setAttribute("position",new Pt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const y=new ht(g,p),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let d=this.type;this.render=function(w,A,C){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||w.length===0)return;const S=n.getRenderTarget(),M=n.getActiveCubeFace(),I=n.getActiveMipmapLevel(),z=n.state;z.setBlending(0),z.buffers.color.setClear(1,1,1,1),z.buffers.depth.setTest(!0),z.setScissorTest(!1);const N=d!==3&&this.type===3,O=d===3&&this.type!==3;for(let X=0,Y=w.length;X<Y;X++){const se=w[X],U=se.shadow;if(U===void 0){console.warn("THREE.WebGLShadowMap:",se,"has no shadow.");continue}if(U.autoUpdate===!1&&U.needsUpdate===!1)continue;s.copy(U.mapSize);const x=U.getFrameExtents();if(s.multiply(x),r.copy(U.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/x.x),s.x=r.x*x.x,U.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/x.y),s.y=r.y*x.y,U.mapSize.y=r.y)),U.map===null||N===!0||O===!0){const oe=this.type!==3?{minFilter:1003,magFilter:1003}:{};U.map!==null&&U.map.dispose(),U.map=new Kn(s.x,s.y,oe),U.map.texture.name=se.name+".shadowMap",U.camera.updateProjectionMatrix()}n.setRenderTarget(U.map),n.clear();const F=U.getViewportCount();for(let oe=0;oe<F;oe++){const we=U.getViewport(oe);o.set(r.x*we.x,r.y*we.y,r.x*we.z,r.y*we.w),z.viewport(o),U.updateMatrices(se,oe),i=U.getFrustum(),_(A,C,U.camera,se,this.type)}U.isPointLightShadow!==!0&&this.type===3&&b(U,C),U.needsUpdate=!1}d=this.type,m.needsUpdate=!1,n.setRenderTarget(S,M,I)};function b(w,A){const C=e.update(y);p.defines.VSM_SAMPLES!==w.blurSamples&&(p.defines.VSM_SAMPLES=w.blurSamples,f.defines.VSM_SAMPLES=w.blurSamples,p.needsUpdate=!0,f.needsUpdate=!0),w.mapPass===null&&(w.mapPass=new Kn(s.x,s.y)),p.uniforms.shadow_pass.value=w.map.texture,p.uniforms.resolution.value=w.mapSize,p.uniforms.radius.value=w.radius,n.setRenderTarget(w.mapPass),n.clear(),n.renderBufferDirect(A,null,C,p,y,null),f.uniforms.shadow_pass.value=w.mapPass.texture,f.uniforms.resolution.value=w.mapSize,f.uniforms.radius.value=w.radius,n.setRenderTarget(w.map),n.clear(),n.renderBufferDirect(A,null,C,f,y,null)}function v(w,A,C,S){let M=null;const I=C.isPointLight===!0?w.customDistanceMaterial:w.customDepthMaterial;if(I!==void 0)M=I;else if(M=C.isPointLight===!0?l:a,n.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){const z=M.uuid,N=A.uuid;let O=c[z];O===void 0&&(O={},c[z]=O);let X=O[N];X===void 0&&(X=M.clone(),O[N]=X,A.addEventListener("dispose",R)),M=X}if(M.visible=A.visible,M.wireframe=A.wireframe,S===3?M.side=A.shadowSide!==null?A.shadowSide:A.side:M.side=A.shadowSide!==null?A.shadowSide:u[A.side],M.alphaMap=A.alphaMap,M.alphaTest=A.alphaTest,M.map=A.map,M.clipShadows=A.clipShadows,M.clippingPlanes=A.clippingPlanes,M.clipIntersection=A.clipIntersection,M.displacementMap=A.displacementMap,M.displacementScale=A.displacementScale,M.displacementBias=A.displacementBias,M.wireframeLinewidth=A.wireframeLinewidth,M.linewidth=A.linewidth,C.isPointLight===!0&&M.isMeshDistanceMaterial===!0){const z=n.properties.get(M);z.light=C}return M}function _(w,A,C,S,M){if(w.visible===!1)return;if(w.layers.test(A.layers)&&(w.isMesh||w.isLine||w.isPoints)&&(w.castShadow||w.receiveShadow&&M===3)&&(!w.frustumCulled||i.intersectsObject(w))){w.modelViewMatrix.multiplyMatrices(C.matrixWorldInverse,w.matrixWorld);const N=e.update(w),O=w.material;if(Array.isArray(O)){const X=N.groups;for(let Y=0,se=X.length;Y<se;Y++){const U=X[Y],x=O[U.materialIndex];if(x&&x.visible){const F=v(w,x,S,M);w.onBeforeShadow(n,w,A,C,N,F,U),n.renderBufferDirect(C,null,N,F,w,U),w.onAfterShadow(n,w,A,C,N,F,U)}}}else if(O.visible){const X=v(w,O,S,M);w.onBeforeShadow(n,w,A,C,N,X,null),n.renderBufferDirect(C,null,N,X,w,null),w.onAfterShadow(n,w,A,C,N,X,null)}}const z=w.children;for(let N=0,O=z.length;N<O;N++)_(z[N],A,C,S,M)}function R(w){w.target.removeEventListener("dispose",R);for(const C in c){const S=c[C],M=w.target.uuid;M in S&&(S[M].dispose(),delete S[M])}}}const Cm={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3};function Pm(n,e){function t(){let H=!1;const _e=new tt;let Q=null;const ae=new tt(0,0,0,0);return{setMask:function(xe){Q!==xe&&!H&&(n.colorMask(xe,xe,xe,xe),Q=xe)},setLocked:function(xe){H=xe},setClear:function(xe,be,We,bt,Lt){Lt===!0&&(xe*=bt,be*=bt,We*=bt),_e.set(xe,be,We,bt),ae.equals(_e)===!1&&(n.clearColor(xe,be,We,bt),ae.copy(_e))},reset:function(){H=!1,Q=null,ae.set(-1,0,0,0)}}}function i(){let H=!1,_e=!1,Q=null,ae=null,xe=null;return{setReversed:function(be){if(_e!==be){const We=e.get("EXT_clip_control");_e?We.clipControlEXT(We.LOWER_LEFT_EXT,We.ZERO_TO_ONE_EXT):We.clipControlEXT(We.LOWER_LEFT_EXT,We.NEGATIVE_ONE_TO_ONE_EXT);const bt=xe;xe=null,this.setClear(bt)}_e=be},getReversed:function(){return _e},setTest:function(be){be?W(n.DEPTH_TEST):ne(n.DEPTH_TEST)},setMask:function(be){Q!==be&&!H&&(n.depthMask(be),Q=be)},setFunc:function(be){if(_e&&(be=Cm[be]),ae!==be){switch(be){case 0:n.depthFunc(n.NEVER);break;case 1:n.depthFunc(n.ALWAYS);break;case 2:n.depthFunc(n.LESS);break;case 3:n.depthFunc(n.LEQUAL);break;case 4:n.depthFunc(n.EQUAL);break;case 5:n.depthFunc(n.GEQUAL);break;case 6:n.depthFunc(n.GREATER);break;case 7:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}ae=be}},setLocked:function(be){H=be},setClear:function(be){xe!==be&&(_e&&(be=1-be),n.clearDepth(be),xe=be)},reset:function(){H=!1,Q=null,ae=null,xe=null,_e=!1}}}function s(){let H=!1,_e=null,Q=null,ae=null,xe=null,be=null,We=null,bt=null,Lt=null;return{setTest:function(rt){H||(rt?W(n.STENCIL_TEST):ne(n.STENCIL_TEST))},setMask:function(rt){_e!==rt&&!H&&(n.stencilMask(rt),_e=rt)},setFunc:function(rt,Jt,hn){(Q!==rt||ae!==Jt||xe!==hn)&&(n.stencilFunc(rt,Jt,hn),Q=rt,ae=Jt,xe=hn)},setOp:function(rt,Jt,hn){(be!==rt||We!==Jt||bt!==hn)&&(n.stencilOp(rt,Jt,hn),be=rt,We=Jt,bt=hn)},setLocked:function(rt){H=rt},setClear:function(rt){Lt!==rt&&(n.clearStencil(rt),Lt=rt)},reset:function(){H=!1,_e=null,Q=null,ae=null,xe=null,be=null,We=null,bt=null,Lt=null}}}const r=new t,o=new i,a=new s,l=new WeakMap,c=new WeakMap;let h={},u={},p=new WeakMap,f=[],g=null,y=!1,m=null,d=null,b=null,v=null,_=null,R=null,w=null,A=new Ne(0,0,0),C=0,S=!1,M=null,I=null,z=null,N=null,O=null;const X=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let Y=!1,se=0;const U=n.getParameter(n.VERSION);U.indexOf("WebGL")!==-1?(se=parseFloat(/^WebGL (\d)/.exec(U)[1]),Y=se>=1):U.indexOf("OpenGL ES")!==-1&&(se=parseFloat(/^OpenGL ES (\d)/.exec(U)[1]),Y=se>=2);let x=null,F={};const oe=n.getParameter(n.SCISSOR_BOX),we=n.getParameter(n.VIEWPORT),Fe=new tt().fromArray(oe),$=new tt().fromArray(we);function he(H,_e,Q,ae){const xe=new Uint8Array(4),be=n.createTexture();n.bindTexture(H,be),n.texParameteri(H,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(H,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let We=0;We<Q;We++)H===n.TEXTURE_3D||H===n.TEXTURE_2D_ARRAY?n.texImage3D(_e,0,n.RGBA,1,1,ae,0,n.RGBA,n.UNSIGNED_BYTE,xe):n.texImage2D(_e+We,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,xe);return be}const ie={};ie[n.TEXTURE_2D]=he(n.TEXTURE_2D,n.TEXTURE_2D,1),ie[n.TEXTURE_CUBE_MAP]=he(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),ie[n.TEXTURE_2D_ARRAY]=he(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),ie[n.TEXTURE_3D]=he(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),W(n.DEPTH_TEST),o.setFunc(3),le(!1),ye(1),W(n.CULL_FACE),D(0);function W(H){h[H]!==!0&&(n.enable(H),h[H]=!0)}function ne(H){h[H]!==!1&&(n.disable(H),h[H]=!1)}function Re(H,_e){return u[H]!==_e?(n.bindFramebuffer(H,_e),u[H]=_e,H===n.DRAW_FRAMEBUFFER&&(u[n.FRAMEBUFFER]=_e),H===n.FRAMEBUFFER&&(u[n.DRAW_FRAMEBUFFER]=_e),!0):!1}function te(H,_e){let Q=f,ae=!1;if(H){Q=p.get(_e),Q===void 0&&(Q=[],p.set(_e,Q));const xe=H.textures;if(Q.length!==xe.length||Q[0]!==n.COLOR_ATTACHMENT0){for(let be=0,We=xe.length;be<We;be++)Q[be]=n.COLOR_ATTACHMENT0+be;Q.length=xe.length,ae=!0}}else Q[0]!==n.BACK&&(Q[0]=n.BACK,ae=!0);ae&&n.drawBuffers(Q)}function B(H){return g!==H?(n.useProgram(H),g=H,!0):!1}const K={100:n.FUNC_ADD,101:n.FUNC_SUBTRACT,102:n.FUNC_REVERSE_SUBTRACT};K[103]=n.MIN,K[104]=n.MAX;const re={200:n.ZERO,201:n.ONE,202:n.SRC_COLOR,204:n.SRC_ALPHA,210:n.SRC_ALPHA_SATURATE,208:n.DST_COLOR,206:n.DST_ALPHA,203:n.ONE_MINUS_SRC_COLOR,205:n.ONE_MINUS_SRC_ALPHA,209:n.ONE_MINUS_DST_COLOR,207:n.ONE_MINUS_DST_ALPHA,211:n.CONSTANT_COLOR,212:n.ONE_MINUS_CONSTANT_COLOR,213:n.CONSTANT_ALPHA,214:n.ONE_MINUS_CONSTANT_ALPHA};function D(H,_e,Q,ae,xe,be,We,bt,Lt,rt){if(H===0){y===!0&&(ne(n.BLEND),y=!1);return}if(y===!1&&(W(n.BLEND),y=!0),H!==5){if(H!==m||rt!==S){if((d!==100||_!==100)&&(n.blendEquation(n.FUNC_ADD),d=100,_=100),rt)switch(H){case 1:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case 2:n.blendFunc(n.ONE,n.ONE);break;case 3:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case 4:n.blendFuncSeparate(n.ZERO,n.SRC_COLOR,n.ZERO,n.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",H);break}else switch(H){case 1:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case 2:n.blendFunc(n.SRC_ALPHA,n.ONE);break;case 3:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case 4:n.blendFunc(n.ZERO,n.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",H);break}b=null,v=null,R=null,w=null,A.set(0,0,0),C=0,m=H,S=rt}return}xe=xe||_e,be=be||Q,We=We||ae,(_e!==d||xe!==_)&&(n.blendEquationSeparate(K[_e],K[xe]),d=_e,_=xe),(Q!==b||ae!==v||be!==R||We!==w)&&(n.blendFuncSeparate(re[Q],re[ae],re[be],re[We]),b=Q,v=ae,R=be,w=We),(bt.equals(A)===!1||Lt!==C)&&(n.blendColor(bt.r,bt.g,bt.b,Lt),A.copy(bt),C=Lt),m=H,S=!1}function ue(H,_e){H.side===2?ne(n.CULL_FACE):W(n.CULL_FACE);let Q=H.side===1;_e&&(Q=!Q),le(Q),H.blending===1&&H.transparent===!1?D(0):D(H.blending,H.blendEquation,H.blendSrc,H.blendDst,H.blendEquationAlpha,H.blendSrcAlpha,H.blendDstAlpha,H.blendColor,H.blendAlpha,H.premultipliedAlpha),o.setFunc(H.depthFunc),o.setTest(H.depthTest),o.setMask(H.depthWrite),r.setMask(H.colorWrite);const ae=H.stencilWrite;a.setTest(ae),ae&&(a.setMask(H.stencilWriteMask),a.setFunc(H.stencilFunc,H.stencilRef,H.stencilFuncMask),a.setOp(H.stencilFail,H.stencilZFail,H.stencilZPass)),De(H.polygonOffset,H.polygonOffsetFactor,H.polygonOffsetUnits),H.alphaToCoverage===!0?W(n.SAMPLE_ALPHA_TO_COVERAGE):ne(n.SAMPLE_ALPHA_TO_COVERAGE)}function le(H){M!==H&&(H?n.frontFace(n.CW):n.frontFace(n.CCW),M=H)}function ye(H){H!==0?(W(n.CULL_FACE),H!==I&&(H===1?n.cullFace(n.BACK):H===2?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):ne(n.CULL_FACE),I=H}function pe(H){H!==z&&(Y&&n.lineWidth(H),z=H)}function De(H,_e,Q){H?(W(n.POLYGON_OFFSET_FILL),(N!==_e||O!==Q)&&(n.polygonOffset(_e,Q),N=_e,O=Q)):ne(n.POLYGON_OFFSET_FILL)}function ve(H){H?W(n.SCISSOR_TEST):ne(n.SCISSOR_TEST)}function P(H){H===void 0&&(H=n.TEXTURE0+X-1),x!==H&&(n.activeTexture(H),x=H)}function T(H,_e,Q){Q===void 0&&(x===null?Q=n.TEXTURE0+X-1:Q=x);let ae=F[Q];ae===void 0&&(ae={type:void 0,texture:void 0},F[Q]=ae),(ae.type!==H||ae.texture!==_e)&&(x!==Q&&(n.activeTexture(Q),x=Q),n.bindTexture(H,_e||ie[H]),ae.type=H,ae.texture=_e)}function k(){const H=F[x];H!==void 0&&H.type!==void 0&&(n.bindTexture(H.type,null),H.type=void 0,H.texture=void 0)}function J(){try{n.compressedTexImage2D.apply(n,arguments)}catch(H){console.error("THREE.WebGLState:",H)}}function ee(){try{n.compressedTexImage3D.apply(n,arguments)}catch(H){console.error("THREE.WebGLState:",H)}}function Z(){try{n.texSubImage2D.apply(n,arguments)}catch(H){console.error("THREE.WebGLState:",H)}}function Ae(){try{n.texSubImage3D.apply(n,arguments)}catch(H){console.error("THREE.WebGLState:",H)}}function ge(){try{n.compressedTexSubImage2D.apply(n,arguments)}catch(H){console.error("THREE.WebGLState:",H)}}function Se(){try{n.compressedTexSubImage3D.apply(n,arguments)}catch(H){console.error("THREE.WebGLState:",H)}}function Je(){try{n.texStorage2D.apply(n,arguments)}catch(H){console.error("THREE.WebGLState:",H)}}function de(){try{n.texStorage3D.apply(n,arguments)}catch(H){console.error("THREE.WebGLState:",H)}}function Te(){try{n.texImage2D.apply(n,arguments)}catch(H){console.error("THREE.WebGLState:",H)}}function ke(){try{n.texImage3D.apply(n,arguments)}catch(H){console.error("THREE.WebGLState:",H)}}function Be(H){Fe.equals(H)===!1&&(n.scissor(H.x,H.y,H.z,H.w),Fe.copy(H))}function Ee(H){$.equals(H)===!1&&(n.viewport(H.x,H.y,H.z,H.w),$.copy(H))}function $e(H,_e){let Q=c.get(_e);Q===void 0&&(Q=new WeakMap,c.set(_e,Q));let ae=Q.get(H);ae===void 0&&(ae=n.getUniformBlockIndex(_e,H.name),Q.set(H,ae))}function je(H,_e){const ae=c.get(_e).get(H);l.get(_e)!==ae&&(n.uniformBlockBinding(_e,ae,H.__bindingPointIndex),l.set(_e,ae))}function ut(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),o.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),h={},x=null,F={},u={},p=new WeakMap,f=[],g=null,y=!1,m=null,d=null,b=null,v=null,_=null,R=null,w=null,A=new Ne(0,0,0),C=0,S=!1,M=null,I=null,z=null,N=null,O=null,Fe.set(0,0,n.canvas.width,n.canvas.height),$.set(0,0,n.canvas.width,n.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:W,disable:ne,bindFramebuffer:Re,drawBuffers:te,useProgram:B,setBlending:D,setMaterial:ue,setFlipSided:le,setCullFace:ye,setLineWidth:pe,setPolygonOffset:De,setScissorTest:ve,activeTexture:P,bindTexture:T,unbindTexture:k,compressedTexImage2D:J,compressedTexImage3D:ee,texImage2D:Te,texImage3D:ke,updateUBOMapping:$e,uniformBlockBinding:je,texStorage2D:Je,texStorage3D:de,texSubImage2D:Z,texSubImage3D:Ae,compressedTexSubImage2D:ge,compressedTexSubImage3D:Se,scissor:Be,viewport:Ee,reset:ut}}function tl(n,e,t,i){const s=Lm(i);switch(t){case 1021:return n*e;case 1024:return n*e;case 1025:return n*e*2;case 1028:return n*e/s.components*s.byteLength;case 1029:return n*e/s.components*s.byteLength;case 1030:return n*e*2/s.components*s.byteLength;case 1031:return n*e*2/s.components*s.byteLength;case 1022:return n*e*3/s.components*s.byteLength;case 1023:return n*e*4/s.components*s.byteLength;case 1033:return n*e*4/s.components*s.byteLength;case 33776:case 33777:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case 33778:case 33779:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case 35841:case 35843:return Math.max(n,16)*Math.max(e,8)/4;case 35840:case 35842:return Math.max(n,8)*Math.max(e,8)/2;case 36196:case 37492:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case 37496:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case 37808:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case 37809:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case 37810:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case 37811:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case 37812:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case 37813:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case 37814:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case 37815:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case 37816:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case 37817:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case 37818:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case 37819:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case 37820:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case 37821:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case 36492:case 36494:case 36495:return Math.ceil(n/4)*Math.ceil(e/4)*16;case 36283:case 36284:return Math.ceil(n/4)*Math.ceil(e/4)*8;case 36285:case 36286:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Lm(n){switch(n){case 1009:case 1010:return{byteLength:1,components:1};case 1012:case 1011:case 1016:return{byteLength:2,components:1};case 1017:case 1018:return{byteLength:2,components:4};case 1014:case 1013:case 1015:return{byteLength:4,components:1};case 35902:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}function Im(n,e,t,i,s,r,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new ce,h=new WeakMap;let u;const p=new WeakMap;let f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(P,T){return f?new OffscreenCanvas(P,T):ss("canvas")}function y(P,T,k){let J=1;const ee=ve(P);if((ee.width>k||ee.height>k)&&(J=k/Math.max(ee.width,ee.height)),J<1)if(typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&P instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&P instanceof ImageBitmap||typeof VideoFrame<"u"&&P instanceof VideoFrame){const Z=Math.floor(J*ee.width),Ae=Math.floor(J*ee.height);u===void 0&&(u=g(Z,Ae));const ge=T?g(Z,Ae):u;return ge.width=Z,ge.height=Ae,ge.getContext("2d").drawImage(P,0,0,Z,Ae),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ee.width+"x"+ee.height+") to ("+Z+"x"+Ae+")."),ge}else return"data"in P&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ee.width+"x"+ee.height+")."),P;return P}function m(P){return P.generateMipmaps}function d(P){n.generateMipmap(P)}function b(P){return P.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:P.isWebGL3DRenderTarget?n.TEXTURE_3D:P.isWebGLArrayRenderTarget||P.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function v(P,T,k,J,ee=!1){if(P!==null){if(n[P]!==void 0)return n[P];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+P+"'")}let Z=T;if(T===n.RED&&(k===n.FLOAT&&(Z=n.R32F),k===n.HALF_FLOAT&&(Z=n.R16F),k===n.UNSIGNED_BYTE&&(Z=n.R8)),T===n.RED_INTEGER&&(k===n.UNSIGNED_BYTE&&(Z=n.R8UI),k===n.UNSIGNED_SHORT&&(Z=n.R16UI),k===n.UNSIGNED_INT&&(Z=n.R32UI),k===n.BYTE&&(Z=n.R8I),k===n.SHORT&&(Z=n.R16I),k===n.INT&&(Z=n.R32I)),T===n.RG&&(k===n.FLOAT&&(Z=n.RG32F),k===n.HALF_FLOAT&&(Z=n.RG16F),k===n.UNSIGNED_BYTE&&(Z=n.RG8)),T===n.RG_INTEGER&&(k===n.UNSIGNED_BYTE&&(Z=n.RG8UI),k===n.UNSIGNED_SHORT&&(Z=n.RG16UI),k===n.UNSIGNED_INT&&(Z=n.RG32UI),k===n.BYTE&&(Z=n.RG8I),k===n.SHORT&&(Z=n.RG16I),k===n.INT&&(Z=n.RG32I)),T===n.RGB_INTEGER&&(k===n.UNSIGNED_BYTE&&(Z=n.RGB8UI),k===n.UNSIGNED_SHORT&&(Z=n.RGB16UI),k===n.UNSIGNED_INT&&(Z=n.RGB32UI),k===n.BYTE&&(Z=n.RGB8I),k===n.SHORT&&(Z=n.RGB16I),k===n.INT&&(Z=n.RGB32I)),T===n.RGBA_INTEGER&&(k===n.UNSIGNED_BYTE&&(Z=n.RGBA8UI),k===n.UNSIGNED_SHORT&&(Z=n.RGBA16UI),k===n.UNSIGNED_INT&&(Z=n.RGBA32UI),k===n.BYTE&&(Z=n.RGBA8I),k===n.SHORT&&(Z=n.RGBA16I),k===n.INT&&(Z=n.RGBA32I)),T===n.RGB&&k===n.UNSIGNED_INT_5_9_9_9_REV&&(Z=n.RGB9_E5),T===n.RGBA){const Ae=ee?ur:Qe.getTransfer(J);k===n.FLOAT&&(Z=n.RGBA32F),k===n.HALF_FLOAT&&(Z=n.RGBA16F),k===n.UNSIGNED_BYTE&&(Z=Ae===lt?n.SRGB8_ALPHA8:n.RGBA8),k===n.UNSIGNED_SHORT_4_4_4_4&&(Z=n.RGBA4),k===n.UNSIGNED_SHORT_5_5_5_1&&(Z=n.RGB5_A1)}return(Z===n.R16F||Z===n.R32F||Z===n.RG16F||Z===n.RG32F||Z===n.RGBA16F||Z===n.RGBA32F)&&e.get("EXT_color_buffer_float"),Z}function _(P,T){let k;return P?T===null||T===1014||T===1020?k=n.DEPTH24_STENCIL8:T===1015?k=n.DEPTH32F_STENCIL8:T===1012&&(k=n.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):T===null||T===1014||T===1020?k=n.DEPTH_COMPONENT24:T===1015?k=n.DEPTH_COMPONENT32F:T===1012&&(k=n.DEPTH_COMPONENT16),k}function R(P,T){return m(P)===!0||P.isFramebufferTexture&&P.minFilter!==1003&&P.minFilter!==1006?Math.log2(Math.max(T.width,T.height))+1:P.mipmaps!==void 0&&P.mipmaps.length>0?P.mipmaps.length:P.isCompressedTexture&&Array.isArray(P.image)?T.mipmaps.length:1}function w(P){const T=P.target;T.removeEventListener("dispose",w),C(T),T.isVideoTexture&&h.delete(T)}function A(P){const T=P.target;T.removeEventListener("dispose",A),M(T)}function C(P){const T=i.get(P);if(T.__webglInit===void 0)return;const k=P.source,J=p.get(k);if(J){const ee=J[T.__cacheKey];ee.usedTimes--,ee.usedTimes===0&&S(P),Object.keys(J).length===0&&p.delete(k)}i.remove(P)}function S(P){const T=i.get(P);n.deleteTexture(T.__webglTexture);const k=P.source,J=p.get(k);delete J[T.__cacheKey],o.memory.textures--}function M(P){const T=i.get(P);if(P.depthTexture&&(P.depthTexture.dispose(),i.remove(P.depthTexture)),P.isWebGLCubeRenderTarget)for(let J=0;J<6;J++){if(Array.isArray(T.__webglFramebuffer[J]))for(let ee=0;ee<T.__webglFramebuffer[J].length;ee++)n.deleteFramebuffer(T.__webglFramebuffer[J][ee]);else n.deleteFramebuffer(T.__webglFramebuffer[J]);T.__webglDepthbuffer&&n.deleteRenderbuffer(T.__webglDepthbuffer[J])}else{if(Array.isArray(T.__webglFramebuffer))for(let J=0;J<T.__webglFramebuffer.length;J++)n.deleteFramebuffer(T.__webglFramebuffer[J]);else n.deleteFramebuffer(T.__webglFramebuffer);if(T.__webglDepthbuffer&&n.deleteRenderbuffer(T.__webglDepthbuffer),T.__webglMultisampledFramebuffer&&n.deleteFramebuffer(T.__webglMultisampledFramebuffer),T.__webglColorRenderbuffer)for(let J=0;J<T.__webglColorRenderbuffer.length;J++)T.__webglColorRenderbuffer[J]&&n.deleteRenderbuffer(T.__webglColorRenderbuffer[J]);T.__webglDepthRenderbuffer&&n.deleteRenderbuffer(T.__webglDepthRenderbuffer)}const k=P.textures;for(let J=0,ee=k.length;J<ee;J++){const Z=i.get(k[J]);Z.__webglTexture&&(n.deleteTexture(Z.__webglTexture),o.memory.textures--),i.remove(k[J])}i.remove(P)}let I=0;function z(){I=0}function N(){const P=I;return P>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+P+" texture units while this GPU supports only "+s.maxTextures),I+=1,P}function O(P){const T=[];return T.push(P.wrapS),T.push(P.wrapT),T.push(P.wrapR||0),T.push(P.magFilter),T.push(P.minFilter),T.push(P.anisotropy),T.push(P.internalFormat),T.push(P.format),T.push(P.type),T.push(P.generateMipmaps),T.push(P.premultiplyAlpha),T.push(P.flipY),T.push(P.unpackAlignment),T.push(P.colorSpace),T.join()}function X(P,T){const k=i.get(P);if(P.isVideoTexture&&pe(P),P.isRenderTargetTexture===!1&&P.version>0&&k.__version!==P.version){const J=P.image;if(J===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(J.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{$(k,P,T);return}}t.bindTexture(n.TEXTURE_2D,k.__webglTexture,n.TEXTURE0+T)}function Y(P,T){const k=i.get(P);if(P.version>0&&k.__version!==P.version){$(k,P,T);return}t.bindTexture(n.TEXTURE_2D_ARRAY,k.__webglTexture,n.TEXTURE0+T)}function se(P,T){const k=i.get(P);if(P.version>0&&k.__version!==P.version){$(k,P,T);return}t.bindTexture(n.TEXTURE_3D,k.__webglTexture,n.TEXTURE0+T)}function U(P,T){const k=i.get(P);if(P.version>0&&k.__version!==P.version){he(k,P,T);return}t.bindTexture(n.TEXTURE_CUBE_MAP,k.__webglTexture,n.TEXTURE0+T)}const x={1e3:n.REPEAT,1001:n.CLAMP_TO_EDGE,1002:n.MIRRORED_REPEAT},F={1003:n.NEAREST,1004:n.NEAREST_MIPMAP_NEAREST,1005:n.NEAREST_MIPMAP_LINEAR,1006:n.LINEAR,1007:n.LINEAR_MIPMAP_NEAREST,1008:n.LINEAR_MIPMAP_LINEAR},oe={512:n.NEVER,519:n.ALWAYS,513:n.LESS,515:n.LEQUAL,514:n.EQUAL,518:n.GEQUAL,516:n.GREATER,517:n.NOTEQUAL};function we(P,T){if(T.type===1015&&e.has("OES_texture_float_linear")===!1&&(T.magFilter===1006||T.magFilter===1007||T.magFilter===1005||T.magFilter===1008||T.minFilter===1006||T.minFilter===1007||T.minFilter===1005||T.minFilter===1008)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(P,n.TEXTURE_WRAP_S,x[T.wrapS]),n.texParameteri(P,n.TEXTURE_WRAP_T,x[T.wrapT]),(P===n.TEXTURE_3D||P===n.TEXTURE_2D_ARRAY)&&n.texParameteri(P,n.TEXTURE_WRAP_R,x[T.wrapR]),n.texParameteri(P,n.TEXTURE_MAG_FILTER,F[T.magFilter]),n.texParameteri(P,n.TEXTURE_MIN_FILTER,F[T.minFilter]),T.compareFunction&&(n.texParameteri(P,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(P,n.TEXTURE_COMPARE_FUNC,oe[T.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(T.magFilter===1003||T.minFilter!==1005&&T.minFilter!==1008||T.type===1015&&e.has("OES_texture_float_linear")===!1)return;if(T.anisotropy>1||i.get(T).__currentAnisotropy){const k=e.get("EXT_texture_filter_anisotropic");n.texParameterf(P,k.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(T.anisotropy,s.getMaxAnisotropy())),i.get(T).__currentAnisotropy=T.anisotropy}}}function Fe(P,T){let k=!1;P.__webglInit===void 0&&(P.__webglInit=!0,T.addEventListener("dispose",w));const J=T.source;let ee=p.get(J);ee===void 0&&(ee={},p.set(J,ee));const Z=O(T);if(Z!==P.__cacheKey){ee[Z]===void 0&&(ee[Z]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,k=!0),ee[Z].usedTimes++;const Ae=ee[P.__cacheKey];Ae!==void 0&&(ee[P.__cacheKey].usedTimes--,Ae.usedTimes===0&&S(T)),P.__cacheKey=Z,P.__webglTexture=ee[Z].texture}return k}function $(P,T,k){let J=n.TEXTURE_2D;(T.isDataArrayTexture||T.isCompressedArrayTexture)&&(J=n.TEXTURE_2D_ARRAY),T.isData3DTexture&&(J=n.TEXTURE_3D);const ee=Fe(P,T),Z=T.source;t.bindTexture(J,P.__webglTexture,n.TEXTURE0+k);const Ae=i.get(Z);if(Z.version!==Ae.__version||ee===!0){t.activeTexture(n.TEXTURE0+k);const ge=Qe.getPrimaries(Qe.workingColorSpace),Se=T.colorSpace===""?null:Qe.getPrimaries(T.colorSpace),Je=T.colorSpace===""||ge===Se?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,T.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,T.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Je);let de=y(T.image,!1,s.maxTextureSize);de=De(T,de);const Te=r.convert(T.format,T.colorSpace),ke=r.convert(T.type);let Be=v(T.internalFormat,Te,ke,T.colorSpace,T.isVideoTexture);we(J,T);let Ee;const $e=T.mipmaps,je=T.isVideoTexture!==!0,ut=Ae.__version===void 0||ee===!0,H=Z.dataReady,_e=R(T,de);if(T.isDepthTexture)Be=_(T.format===1027,T.type),ut&&(je?t.texStorage2D(n.TEXTURE_2D,1,Be,de.width,de.height):t.texImage2D(n.TEXTURE_2D,0,Be,de.width,de.height,0,Te,ke,null));else if(T.isDataTexture)if($e.length>0){je&&ut&&t.texStorage2D(n.TEXTURE_2D,_e,Be,$e[0].width,$e[0].height);for(let Q=0,ae=$e.length;Q<ae;Q++)Ee=$e[Q],je?H&&t.texSubImage2D(n.TEXTURE_2D,Q,0,0,Ee.width,Ee.height,Te,ke,Ee.data):t.texImage2D(n.TEXTURE_2D,Q,Be,Ee.width,Ee.height,0,Te,ke,Ee.data);T.generateMipmaps=!1}else je?(ut&&t.texStorage2D(n.TEXTURE_2D,_e,Be,de.width,de.height),H&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,de.width,de.height,Te,ke,de.data)):t.texImage2D(n.TEXTURE_2D,0,Be,de.width,de.height,0,Te,ke,de.data);else if(T.isCompressedTexture)if(T.isCompressedArrayTexture){je&&ut&&t.texStorage3D(n.TEXTURE_2D_ARRAY,_e,Be,$e[0].width,$e[0].height,de.depth);for(let Q=0,ae=$e.length;Q<ae;Q++)if(Ee=$e[Q],T.format!==1023)if(Te!==null)if(je){if(H)if(T.layerUpdates.size>0){const xe=tl(Ee.width,Ee.height,T.format,T.type);for(const be of T.layerUpdates){const We=Ee.data.subarray(be*xe/Ee.data.BYTES_PER_ELEMENT,(be+1)*xe/Ee.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,Q,0,0,be,Ee.width,Ee.height,1,Te,We)}T.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,Q,0,0,0,Ee.width,Ee.height,de.depth,Te,Ee.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,Q,Be,Ee.width,Ee.height,de.depth,0,Ee.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else je?H&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,Q,0,0,0,Ee.width,Ee.height,de.depth,Te,ke,Ee.data):t.texImage3D(n.TEXTURE_2D_ARRAY,Q,Be,Ee.width,Ee.height,de.depth,0,Te,ke,Ee.data)}else{je&&ut&&t.texStorage2D(n.TEXTURE_2D,_e,Be,$e[0].width,$e[0].height);for(let Q=0,ae=$e.length;Q<ae;Q++)Ee=$e[Q],T.format!==1023?Te!==null?je?H&&t.compressedTexSubImage2D(n.TEXTURE_2D,Q,0,0,Ee.width,Ee.height,Te,Ee.data):t.compressedTexImage2D(n.TEXTURE_2D,Q,Be,Ee.width,Ee.height,0,Ee.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):je?H&&t.texSubImage2D(n.TEXTURE_2D,Q,0,0,Ee.width,Ee.height,Te,ke,Ee.data):t.texImage2D(n.TEXTURE_2D,Q,Be,Ee.width,Ee.height,0,Te,ke,Ee.data)}else if(T.isDataArrayTexture)if(je){if(ut&&t.texStorage3D(n.TEXTURE_2D_ARRAY,_e,Be,de.width,de.height,de.depth),H)if(T.layerUpdates.size>0){const Q=tl(de.width,de.height,T.format,T.type);for(const ae of T.layerUpdates){const xe=de.data.subarray(ae*Q/de.data.BYTES_PER_ELEMENT,(ae+1)*Q/de.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,ae,de.width,de.height,1,Te,ke,xe)}T.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,de.width,de.height,de.depth,Te,ke,de.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,Be,de.width,de.height,de.depth,0,Te,ke,de.data);else if(T.isData3DTexture)je?(ut&&t.texStorage3D(n.TEXTURE_3D,_e,Be,de.width,de.height,de.depth),H&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,de.width,de.height,de.depth,Te,ke,de.data)):t.texImage3D(n.TEXTURE_3D,0,Be,de.width,de.height,de.depth,0,Te,ke,de.data);else if(T.isFramebufferTexture){if(ut)if(je)t.texStorage2D(n.TEXTURE_2D,_e,Be,de.width,de.height);else{let Q=de.width,ae=de.height;for(let xe=0;xe<_e;xe++)t.texImage2D(n.TEXTURE_2D,xe,Be,Q,ae,0,Te,ke,null),Q>>=1,ae>>=1}}else if($e.length>0){if(je&&ut){const Q=ve($e[0]);t.texStorage2D(n.TEXTURE_2D,_e,Be,Q.width,Q.height)}for(let Q=0,ae=$e.length;Q<ae;Q++)Ee=$e[Q],je?H&&t.texSubImage2D(n.TEXTURE_2D,Q,0,0,Te,ke,Ee):t.texImage2D(n.TEXTURE_2D,Q,Be,Te,ke,Ee);T.generateMipmaps=!1}else if(je){if(ut){const Q=ve(de);t.texStorage2D(n.TEXTURE_2D,_e,Be,Q.width,Q.height)}H&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,Te,ke,de)}else t.texImage2D(n.TEXTURE_2D,0,Be,Te,ke,de);m(T)&&d(J),Ae.__version=Z.version,T.onUpdate&&T.onUpdate(T)}P.__version=T.version}function he(P,T,k){if(T.image.length!==6)return;const J=Fe(P,T),ee=T.source;t.bindTexture(n.TEXTURE_CUBE_MAP,P.__webglTexture,n.TEXTURE0+k);const Z=i.get(ee);if(ee.version!==Z.__version||J===!0){t.activeTexture(n.TEXTURE0+k);const Ae=Qe.getPrimaries(Qe.workingColorSpace),ge=T.colorSpace===""?null:Qe.getPrimaries(T.colorSpace),Se=T.colorSpace===""||Ae===ge?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,T.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,T.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Se);const Je=T.isCompressedTexture||T.image[0].isCompressedTexture,de=T.image[0]&&T.image[0].isDataTexture,Te=[];for(let ae=0;ae<6;ae++)!Je&&!de?Te[ae]=y(T.image[ae],!0,s.maxCubemapSize):Te[ae]=de?T.image[ae].image:T.image[ae],Te[ae]=De(T,Te[ae]);const ke=Te[0],Be=r.convert(T.format,T.colorSpace),Ee=r.convert(T.type),$e=v(T.internalFormat,Be,Ee,T.colorSpace),je=T.isVideoTexture!==!0,ut=Z.__version===void 0||J===!0,H=ee.dataReady;let _e=R(T,ke);we(n.TEXTURE_CUBE_MAP,T);let Q;if(Je){je&&ut&&t.texStorage2D(n.TEXTURE_CUBE_MAP,_e,$e,ke.width,ke.height);for(let ae=0;ae<6;ae++){Q=Te[ae].mipmaps;for(let xe=0;xe<Q.length;xe++){const be=Q[xe];T.format!==1023?Be!==null?je?H&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ae,xe,0,0,be.width,be.height,Be,be.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ae,xe,$e,be.width,be.height,0,be.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):je?H&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ae,xe,0,0,be.width,be.height,Be,Ee,be.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ae,xe,$e,be.width,be.height,0,Be,Ee,be.data)}}}else{if(Q=T.mipmaps,je&&ut){Q.length>0&&_e++;const ae=ve(Te[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,_e,$e,ae.width,ae.height)}for(let ae=0;ae<6;ae++)if(de){je?H&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,0,0,Te[ae].width,Te[ae].height,Be,Ee,Te[ae].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,$e,Te[ae].width,Te[ae].height,0,Be,Ee,Te[ae].data);for(let xe=0;xe<Q.length;xe++){const We=Q[xe].image[ae].image;je?H&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ae,xe+1,0,0,We.width,We.height,Be,Ee,We.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ae,xe+1,$e,We.width,We.height,0,Be,Ee,We.data)}}else{je?H&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,0,0,Be,Ee,Te[ae]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,$e,Be,Ee,Te[ae]);for(let xe=0;xe<Q.length;xe++){const be=Q[xe];je?H&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ae,xe+1,0,0,Be,Ee,be.image[ae]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ae,xe+1,$e,Be,Ee,be.image[ae])}}}m(T)&&d(n.TEXTURE_CUBE_MAP),Z.__version=ee.version,T.onUpdate&&T.onUpdate(T)}P.__version=T.version}function ie(P,T,k,J,ee,Z){const Ae=r.convert(k.format,k.colorSpace),ge=r.convert(k.type),Se=v(k.internalFormat,Ae,ge,k.colorSpace),Je=i.get(T),de=i.get(k);if(de.__renderTarget=T,!Je.__hasExternalTextures){const Te=Math.max(1,T.width>>Z),ke=Math.max(1,T.height>>Z);ee===n.TEXTURE_3D||ee===n.TEXTURE_2D_ARRAY?t.texImage3D(ee,Z,Se,Te,ke,T.depth,0,Ae,ge,null):t.texImage2D(ee,Z,Se,Te,ke,0,Ae,ge,null)}t.bindFramebuffer(n.FRAMEBUFFER,P),ye(T)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,J,ee,de.__webglTexture,0,le(T)):(ee===n.TEXTURE_2D||ee>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&ee<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,J,ee,de.__webglTexture,Z),t.bindFramebuffer(n.FRAMEBUFFER,null)}function W(P,T,k){if(n.bindRenderbuffer(n.RENDERBUFFER,P),T.depthBuffer){const J=T.depthTexture,ee=J&&J.isDepthTexture?J.type:null,Z=_(T.stencilBuffer,ee),Ae=T.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ge=le(T);ye(T)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,ge,Z,T.width,T.height):k?n.renderbufferStorageMultisample(n.RENDERBUFFER,ge,Z,T.width,T.height):n.renderbufferStorage(n.RENDERBUFFER,Z,T.width,T.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,Ae,n.RENDERBUFFER,P)}else{const J=T.textures;for(let ee=0;ee<J.length;ee++){const Z=J[ee],Ae=r.convert(Z.format,Z.colorSpace),ge=r.convert(Z.type),Se=v(Z.internalFormat,Ae,ge,Z.colorSpace),Je=le(T);k&&ye(T)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,Je,Se,T.width,T.height):ye(T)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Je,Se,T.width,T.height):n.renderbufferStorage(n.RENDERBUFFER,Se,T.width,T.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function ne(P,T){if(T&&T.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(n.FRAMEBUFFER,P),!(T.depthTexture&&T.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const J=i.get(T.depthTexture);J.__renderTarget=T,(!J.__webglTexture||T.depthTexture.image.width!==T.width||T.depthTexture.image.height!==T.height)&&(T.depthTexture.image.width=T.width,T.depthTexture.image.height=T.height,T.depthTexture.needsUpdate=!0),X(T.depthTexture,0);const ee=J.__webglTexture,Z=le(T);if(T.depthTexture.format===1026)ye(T)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,ee,0,Z):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,ee,0);else if(T.depthTexture.format===1027)ye(T)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,ee,0,Z):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,ee,0);else throw new Error("Unknown depthTexture format")}function Re(P){const T=i.get(P),k=P.isWebGLCubeRenderTarget===!0;if(T.__boundDepthTexture!==P.depthTexture){const J=P.depthTexture;if(T.__depthDisposeCallback&&T.__depthDisposeCallback(),J){const ee=()=>{delete T.__boundDepthTexture,delete T.__depthDisposeCallback,J.removeEventListener("dispose",ee)};J.addEventListener("dispose",ee),T.__depthDisposeCallback=ee}T.__boundDepthTexture=J}if(P.depthTexture&&!T.__autoAllocateDepthBuffer){if(k)throw new Error("target.depthTexture not supported in Cube render targets");ne(T.__webglFramebuffer,P)}else if(k){T.__webglDepthbuffer=[];for(let J=0;J<6;J++)if(t.bindFramebuffer(n.FRAMEBUFFER,T.__webglFramebuffer[J]),T.__webglDepthbuffer[J]===void 0)T.__webglDepthbuffer[J]=n.createRenderbuffer(),W(T.__webglDepthbuffer[J],P,!1);else{const ee=P.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Z=T.__webglDepthbuffer[J];n.bindRenderbuffer(n.RENDERBUFFER,Z),n.framebufferRenderbuffer(n.FRAMEBUFFER,ee,n.RENDERBUFFER,Z)}}else if(t.bindFramebuffer(n.FRAMEBUFFER,T.__webglFramebuffer),T.__webglDepthbuffer===void 0)T.__webglDepthbuffer=n.createRenderbuffer(),W(T.__webglDepthbuffer,P,!1);else{const J=P.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ee=T.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,ee),n.framebufferRenderbuffer(n.FRAMEBUFFER,J,n.RENDERBUFFER,ee)}t.bindFramebuffer(n.FRAMEBUFFER,null)}function te(P,T,k){const J=i.get(P);T!==void 0&&ie(J.__webglFramebuffer,P,P.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),k!==void 0&&Re(P)}function B(P){const T=P.texture,k=i.get(P),J=i.get(T);P.addEventListener("dispose",A);const ee=P.textures,Z=P.isWebGLCubeRenderTarget===!0,Ae=ee.length>1;if(Ae||(J.__webglTexture===void 0&&(J.__webglTexture=n.createTexture()),J.__version=T.version,o.memory.textures++),Z){k.__webglFramebuffer=[];for(let ge=0;ge<6;ge++)if(T.mipmaps&&T.mipmaps.length>0){k.__webglFramebuffer[ge]=[];for(let Se=0;Se<T.mipmaps.length;Se++)k.__webglFramebuffer[ge][Se]=n.createFramebuffer()}else k.__webglFramebuffer[ge]=n.createFramebuffer()}else{if(T.mipmaps&&T.mipmaps.length>0){k.__webglFramebuffer=[];for(let ge=0;ge<T.mipmaps.length;ge++)k.__webglFramebuffer[ge]=n.createFramebuffer()}else k.__webglFramebuffer=n.createFramebuffer();if(Ae)for(let ge=0,Se=ee.length;ge<Se;ge++){const Je=i.get(ee[ge]);Je.__webglTexture===void 0&&(Je.__webglTexture=n.createTexture(),o.memory.textures++)}if(P.samples>0&&ye(P)===!1){k.__webglMultisampledFramebuffer=n.createFramebuffer(),k.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,k.__webglMultisampledFramebuffer);for(let ge=0;ge<ee.length;ge++){const Se=ee[ge];k.__webglColorRenderbuffer[ge]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,k.__webglColorRenderbuffer[ge]);const Je=r.convert(Se.format,Se.colorSpace),de=r.convert(Se.type),Te=v(Se.internalFormat,Je,de,Se.colorSpace,P.isXRRenderTarget===!0),ke=le(P);n.renderbufferStorageMultisample(n.RENDERBUFFER,ke,Te,P.width,P.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ge,n.RENDERBUFFER,k.__webglColorRenderbuffer[ge])}n.bindRenderbuffer(n.RENDERBUFFER,null),P.depthBuffer&&(k.__webglDepthRenderbuffer=n.createRenderbuffer(),W(k.__webglDepthRenderbuffer,P,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(Z){t.bindTexture(n.TEXTURE_CUBE_MAP,J.__webglTexture),we(n.TEXTURE_CUBE_MAP,T);for(let ge=0;ge<6;ge++)if(T.mipmaps&&T.mipmaps.length>0)for(let Se=0;Se<T.mipmaps.length;Se++)ie(k.__webglFramebuffer[ge][Se],P,T,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ge,Se);else ie(k.__webglFramebuffer[ge],P,T,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ge,0);m(T)&&d(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Ae){for(let ge=0,Se=ee.length;ge<Se;ge++){const Je=ee[ge],de=i.get(Je);t.bindTexture(n.TEXTURE_2D,de.__webglTexture),we(n.TEXTURE_2D,Je),ie(k.__webglFramebuffer,P,Je,n.COLOR_ATTACHMENT0+ge,n.TEXTURE_2D,0),m(Je)&&d(n.TEXTURE_2D)}t.unbindTexture()}else{let ge=n.TEXTURE_2D;if((P.isWebGL3DRenderTarget||P.isWebGLArrayRenderTarget)&&(ge=P.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(ge,J.__webglTexture),we(ge,T),T.mipmaps&&T.mipmaps.length>0)for(let Se=0;Se<T.mipmaps.length;Se++)ie(k.__webglFramebuffer[Se],P,T,n.COLOR_ATTACHMENT0,ge,Se);else ie(k.__webglFramebuffer,P,T,n.COLOR_ATTACHMENT0,ge,0);m(T)&&d(ge),t.unbindTexture()}P.depthBuffer&&Re(P)}function K(P){const T=P.textures;for(let k=0,J=T.length;k<J;k++){const ee=T[k];if(m(ee)){const Z=b(P),Ae=i.get(ee).__webglTexture;t.bindTexture(Z,Ae),d(Z),t.unbindTexture()}}}const re=[],D=[];function ue(P){if(P.samples>0){if(ye(P)===!1){const T=P.textures,k=P.width,J=P.height;let ee=n.COLOR_BUFFER_BIT;const Z=P.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Ae=i.get(P),ge=T.length>1;if(ge)for(let Se=0;Se<T.length;Se++)t.bindFramebuffer(n.FRAMEBUFFER,Ae.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Se,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,Ae.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Se,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,Ae.__webglMultisampledFramebuffer),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Ae.__webglFramebuffer);for(let Se=0;Se<T.length;Se++){if(P.resolveDepthBuffer&&(P.depthBuffer&&(ee|=n.DEPTH_BUFFER_BIT),P.stencilBuffer&&P.resolveStencilBuffer&&(ee|=n.STENCIL_BUFFER_BIT)),ge){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,Ae.__webglColorRenderbuffer[Se]);const Je=i.get(T[Se]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,Je,0)}n.blitFramebuffer(0,0,k,J,0,0,k,J,ee,n.NEAREST),l===!0&&(re.length=0,D.length=0,re.push(n.COLOR_ATTACHMENT0+Se),P.depthBuffer&&P.resolveDepthBuffer===!1&&(re.push(Z),D.push(Z),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,D)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,re))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),ge)for(let Se=0;Se<T.length;Se++){t.bindFramebuffer(n.FRAMEBUFFER,Ae.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Se,n.RENDERBUFFER,Ae.__webglColorRenderbuffer[Se]);const Je=i.get(T[Se]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,Ae.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Se,n.TEXTURE_2D,Je,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Ae.__webglMultisampledFramebuffer)}else if(P.depthBuffer&&P.resolveDepthBuffer===!1&&l){const T=P.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[T])}}}function le(P){return Math.min(s.maxSamples,P.samples)}function ye(P){const T=i.get(P);return P.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&T.__useRenderToTexture!==!1}function pe(P){const T=o.render.frame;h.get(P)!==T&&(h.set(P,T),P.update())}function De(P,T){const k=P.colorSpace,J=P.format,ee=P.type;return P.isCompressedTexture===!0||P.isVideoTexture===!0||k!==Ci&&k!==""&&(Qe.getTransfer(k)===lt?(J!==1023||ee!==1009)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",k)),T}function ve(P){return typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement?(c.width=P.naturalWidth||P.width,c.height=P.naturalHeight||P.height):typeof VideoFrame<"u"&&P instanceof VideoFrame?(c.width=P.displayWidth,c.height=P.displayHeight):(c.width=P.width,c.height=P.height),c}this.allocateTextureUnit=N,this.resetTextureUnits=z,this.setTexture2D=X,this.setTexture2DArray=Y,this.setTexture3D=se,this.setTextureCube=U,this.rebindTextures=te,this.setupRenderTarget=B,this.updateRenderTargetMipmap=K,this.updateMultisampleRenderTarget=ue,this.setupDepthRenderbuffer=Re,this.setupFrameBufferTexture=ie,this.useMultisampledRTT=ye}function Dm(n,e){function t(i,s=""){let r;const o=Qe.getTransfer(s);if(i===1009)return n.UNSIGNED_BYTE;if(i===1017)return n.UNSIGNED_SHORT_4_4_4_4;if(i===1018)return n.UNSIGNED_SHORT_5_5_5_1;if(i===35902)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===1010)return n.BYTE;if(i===1011)return n.SHORT;if(i===1012)return n.UNSIGNED_SHORT;if(i===1013)return n.INT;if(i===1014)return n.UNSIGNED_INT;if(i===1015)return n.FLOAT;if(i===1016)return n.HALF_FLOAT;if(i===1021)return n.ALPHA;if(i===1022)return n.RGB;if(i===1023)return n.RGBA;if(i===1024)return n.LUMINANCE;if(i===1025)return n.LUMINANCE_ALPHA;if(i===1026)return n.DEPTH_COMPONENT;if(i===1027)return n.DEPTH_STENCIL;if(i===1028)return n.RED;if(i===1029)return n.RED_INTEGER;if(i===1030)return n.RG;if(i===1031)return n.RG_INTEGER;if(i===1033)return n.RGBA_INTEGER;if(i===33776||i===33777||i===33778||i===33779)if(o===lt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===33776)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===33777)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===33778)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===33779)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===33776)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===33777)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===33778)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===33779)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===35840||i===35841||i===35842||i===35843)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===35840)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===35841)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===35842)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===35843)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===36196||i===37492||i===37496)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===36196||i===37492)return o===lt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===37496)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===37808||i===37809||i===37810||i===37811||i===37812||i===37813||i===37814||i===37815||i===37816||i===37817||i===37818||i===37819||i===37820||i===37821)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===37808)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===37809)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===37810)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===37811)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===37812)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===37813)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===37814)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===37815)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===37816)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===37817)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===37818)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===37819)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===37820)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===37821)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===36492||i===36494||i===36495)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===36492)return o===lt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===36494)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===36495)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===36283||i===36284||i===36285||i===36286)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===36492)return r.COMPRESSED_RED_RGTC1_EXT;if(i===36284)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===36285)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===36286)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===1020?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}class Nm extends Wt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class Xt extends vt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Um={type:"move"};class Kr{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Xt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Xt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new L,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new L),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Xt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new L,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new L),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let s=null,r=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(const y of e.hand.values()){const m=t.getJointPose(y,i),d=this._getHandJoint(c,y);m!==null&&(d.matrix.fromArray(m.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=m.radius),d.visible=m!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],p=h.position.distanceTo(u.position),f=.02,g=.005;c.inputState.pinching&&p>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&p<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=t.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Um)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new Xt;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}const km=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Fm=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class Om{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,i){if(this.texture===null){const s=new Ct,r=e.properties.get(s);r.__webglTexture=t.texture,(t.depthNear!=i.depthNear||t.depthFar!=i.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=s}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,i=new Dn({vertexShader:km,fragmentShader:Fm,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new ht(new cs(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Bm extends Pi{constructor(e,t){super();const i=this;let s=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,p=null,f=null,g=null;const y=new Om,m=t.getContextAttributes();let d=null,b=null;const v=[],_=[],R=new ce;let w=null;const A=new Wt;A.viewport=new tt;const C=new Wt;C.viewport=new tt;const S=[A,C],M=new Nm;let I=null,z=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function($){let he=v[$];return he===void 0&&(he=new Kr,v[$]=he),he.getTargetRaySpace()},this.getControllerGrip=function($){let he=v[$];return he===void 0&&(he=new Kr,v[$]=he),he.getGripSpace()},this.getHand=function($){let he=v[$];return he===void 0&&(he=new Kr,v[$]=he),he.getHandSpace()};function N($){const he=_.indexOf($.inputSource);if(he===-1)return;const ie=v[he];ie!==void 0&&(ie.update($.inputSource,$.frame,c||o),ie.dispatchEvent({type:$.type,data:$.inputSource}))}function O(){s.removeEventListener("select",N),s.removeEventListener("selectstart",N),s.removeEventListener("selectend",N),s.removeEventListener("squeeze",N),s.removeEventListener("squeezestart",N),s.removeEventListener("squeezeend",N),s.removeEventListener("end",O),s.removeEventListener("inputsourceschange",X);for(let $=0;$<v.length;$++){const he=_[$];he!==null&&(_[$]=null,v[$].disconnect(he))}I=null,z=null,y.reset(),e.setRenderTarget(d),f=null,p=null,u=null,s=null,b=null,Fe.stop(),i.isPresenting=!1,e.setPixelRatio(w),e.setSize(R.width,R.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function($){r=$,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function($){a=$,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function($){c=$},this.getBaseLayer=function(){return p!==null?p:f},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function($){if(s=$,s!==null){if(d=e.getRenderTarget(),s.addEventListener("select",N),s.addEventListener("selectstart",N),s.addEventListener("selectend",N),s.addEventListener("squeeze",N),s.addEventListener("squeezestart",N),s.addEventListener("squeezeend",N),s.addEventListener("end",O),s.addEventListener("inputsourceschange",X),m.xrCompatible!==!0&&await t.makeXRCompatible(),w=e.getPixelRatio(),e.getSize(R),s.renderState.layers===void 0){const he={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,he),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),b=new Kn(f.framebufferWidth,f.framebufferHeight,{format:1023,type:1009,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil})}else{let he=null,ie=null,W=null;m.depth&&(W=m.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,he=m.stencil?1027:1026,ie=m.stencil?1020:1014);const ne={colorFormat:t.RGBA8,depthFormat:W,scaleFactor:r};u=new XRWebGLBinding(s,t),p=u.createProjectionLayer(ne),s.updateRenderState({layers:[p]}),e.setPixelRatio(1),e.setSize(p.textureWidth,p.textureHeight,!1),b=new Kn(p.textureWidth,p.textureHeight,{format:1023,type:1009,depthTexture:new rc(p.textureWidth,p.textureHeight,ie,void 0,void 0,void 0,void 0,void 0,void 0,he),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:p.ignoreDepthValues===!1})}b.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),Fe.setContext(s),Fe.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return y.getDepthTexture()};function X($){for(let he=0;he<$.removed.length;he++){const ie=$.removed[he],W=_.indexOf(ie);W>=0&&(_[W]=null,v[W].disconnect(ie))}for(let he=0;he<$.added.length;he++){const ie=$.added[he];let W=_.indexOf(ie);if(W===-1){for(let Re=0;Re<v.length;Re++)if(Re>=_.length){_.push(ie),W=Re;break}else if(_[Re]===null){_[Re]=ie,W=Re;break}if(W===-1)break}const ne=v[W];ne&&ne.connect(ie)}}const Y=new L,se=new L;function U($,he,ie){Y.setFromMatrixPosition(he.matrixWorld),se.setFromMatrixPosition(ie.matrixWorld);const W=Y.distanceTo(se),ne=he.projectionMatrix.elements,Re=ie.projectionMatrix.elements,te=ne[14]/(ne[10]-1),B=ne[14]/(ne[10]+1),K=(ne[9]+1)/ne[5],re=(ne[9]-1)/ne[5],D=(ne[8]-1)/ne[0],ue=(Re[8]+1)/Re[0],le=te*D,ye=te*ue,pe=W/(-D+ue),De=pe*-D;if(he.matrixWorld.decompose($.position,$.quaternion,$.scale),$.translateX(De),$.translateZ(pe),$.matrixWorld.compose($.position,$.quaternion,$.scale),$.matrixWorldInverse.copy($.matrixWorld).invert(),ne[10]===-1)$.projectionMatrix.copy(he.projectionMatrix),$.projectionMatrixInverse.copy(he.projectionMatrixInverse);else{const ve=te+pe,P=B+pe,T=le-De,k=ye+(W-De),J=K*B/P*ve,ee=re*B/P*ve;$.projectionMatrix.makePerspective(T,k,J,ee,ve,P),$.projectionMatrixInverse.copy($.projectionMatrix).invert()}}function x($,he){he===null?$.matrixWorld.copy($.matrix):$.matrixWorld.multiplyMatrices(he.matrixWorld,$.matrix),$.matrixWorldInverse.copy($.matrixWorld).invert()}this.updateCamera=function($){if(s===null)return;let he=$.near,ie=$.far;y.texture!==null&&(y.depthNear>0&&(he=y.depthNear),y.depthFar>0&&(ie=y.depthFar)),M.near=C.near=A.near=he,M.far=C.far=A.far=ie,(I!==M.near||z!==M.far)&&(s.updateRenderState({depthNear:M.near,depthFar:M.far}),I=M.near,z=M.far),A.layers.mask=$.layers.mask|2,C.layers.mask=$.layers.mask|4,M.layers.mask=A.layers.mask|C.layers.mask;const W=$.parent,ne=M.cameras;x(M,W);for(let Re=0;Re<ne.length;Re++)x(ne[Re],W);ne.length===2?U(M,A,C):M.projectionMatrix.copy(A.projectionMatrix),F($,M,W)};function F($,he,ie){ie===null?$.matrix.copy(he.matrixWorld):($.matrix.copy(ie.matrixWorld),$.matrix.invert(),$.matrix.multiply(he.matrixWorld)),$.matrix.decompose($.position,$.quaternion,$.scale),$.updateMatrixWorld(!0),$.projectionMatrix.copy(he.projectionMatrix),$.projectionMatrixInverse.copy(he.projectionMatrixInverse),$.isPerspectiveCamera&&($.fov=wi*2*Math.atan(1/$.projectionMatrix.elements[5]),$.zoom=1)}this.getCamera=function(){return M},this.getFoveation=function(){if(!(p===null&&f===null))return l},this.setFoveation=function($){l=$,p!==null&&(p.fixedFoveation=$),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=$)},this.hasDepthSensing=function(){return y.texture!==null},this.getDepthSensingMesh=function(){return y.getMesh(M)};let oe=null;function we($,he){if(h=he.getViewerPose(c||o),g=he,h!==null){const ie=h.views;f!==null&&(e.setRenderTargetFramebuffer(b,f.framebuffer),e.setRenderTarget(b));let W=!1;ie.length!==M.cameras.length&&(M.cameras.length=0,W=!0);for(let Re=0;Re<ie.length;Re++){const te=ie[Re];let B=null;if(f!==null)B=f.getViewport(te);else{const re=u.getViewSubImage(p,te);B=re.viewport,Re===0&&(e.setRenderTargetTextures(b,re.colorTexture,p.ignoreDepthValues?void 0:re.depthStencilTexture),e.setRenderTarget(b))}let K=S[Re];K===void 0&&(K=new Wt,K.layers.enable(Re),K.viewport=new tt,S[Re]=K),K.matrix.fromArray(te.transform.matrix),K.matrix.decompose(K.position,K.quaternion,K.scale),K.projectionMatrix.fromArray(te.projectionMatrix),K.projectionMatrixInverse.copy(K.projectionMatrix).invert(),K.viewport.set(B.x,B.y,B.width,B.height),Re===0&&(M.matrix.copy(K.matrix),M.matrix.decompose(M.position,M.quaternion,M.scale)),W===!0&&M.cameras.push(K)}const ne=s.enabledFeatures;if(ne&&ne.includes("depth-sensing")){const Re=u.getDepthInformation(ie[0]);Re&&Re.isValid&&Re.texture&&y.init(e,Re,s.renderState)}}for(let ie=0;ie<v.length;ie++){const W=_[ie],ne=v[ie];W!==null&&ne!==void 0&&ne.update(W,he,c||o)}oe&&oe($,he),he.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:he}),g=null}const Fe=new ic;Fe.setAnimationLoop(we),this.setAnimationLoop=function($){oe=$},this.dispose=function(){}}}const Vn=new sn,zm=new He;function Hm(n,e){function t(m,d){m.matrixAutoUpdate===!0&&m.updateMatrix(),d.value.copy(m.matrix)}function i(m,d){d.color.getRGB(m.fogColor.value,ec(n)),d.isFog?(m.fogNear.value=d.near,m.fogFar.value=d.far):d.isFogExp2&&(m.fogDensity.value=d.density)}function s(m,d,b,v,_){d.isMeshBasicMaterial||d.isMeshLambertMaterial?r(m,d):d.isMeshToonMaterial?(r(m,d),u(m,d)):d.isMeshPhongMaterial?(r(m,d),h(m,d)):d.isMeshStandardMaterial?(r(m,d),p(m,d),d.isMeshPhysicalMaterial&&f(m,d,_)):d.isMeshMatcapMaterial?(r(m,d),g(m,d)):d.isMeshDepthMaterial?r(m,d):d.isMeshDistanceMaterial?(r(m,d),y(m,d)):d.isMeshNormalMaterial?r(m,d):d.isLineBasicMaterial?(o(m,d),d.isLineDashedMaterial&&a(m,d)):d.isPointsMaterial?l(m,d,b,v):d.isSpriteMaterial?c(m,d):d.isShadowMaterial?(m.color.value.copy(d.color),m.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function r(m,d){m.opacity.value=d.opacity,d.color&&m.diffuse.value.copy(d.color),d.emissive&&m.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(m.map.value=d.map,t(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.bumpMap&&(m.bumpMap.value=d.bumpMap,t(d.bumpMap,m.bumpMapTransform),m.bumpScale.value=d.bumpScale,d.side===1&&(m.bumpScale.value*=-1)),d.normalMap&&(m.normalMap.value=d.normalMap,t(d.normalMap,m.normalMapTransform),m.normalScale.value.copy(d.normalScale),d.side===1&&m.normalScale.value.negate()),d.displacementMap&&(m.displacementMap.value=d.displacementMap,t(d.displacementMap,m.displacementMapTransform),m.displacementScale.value=d.displacementScale,m.displacementBias.value=d.displacementBias),d.emissiveMap&&(m.emissiveMap.value=d.emissiveMap,t(d.emissiveMap,m.emissiveMapTransform)),d.specularMap&&(m.specularMap.value=d.specularMap,t(d.specularMap,m.specularMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest);const b=e.get(d),v=b.envMap,_=b.envMapRotation;v&&(m.envMap.value=v,Vn.copy(_),Vn.x*=-1,Vn.y*=-1,Vn.z*=-1,v.isCubeTexture&&v.isRenderTargetTexture===!1&&(Vn.y*=-1,Vn.z*=-1),m.envMapRotation.value.setFromMatrix4(zm.makeRotationFromEuler(Vn)),m.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=d.reflectivity,m.ior.value=d.ior,m.refractionRatio.value=d.refractionRatio),d.lightMap&&(m.lightMap.value=d.lightMap,m.lightMapIntensity.value=d.lightMapIntensity,t(d.lightMap,m.lightMapTransform)),d.aoMap&&(m.aoMap.value=d.aoMap,m.aoMapIntensity.value=d.aoMapIntensity,t(d.aoMap,m.aoMapTransform))}function o(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,d.map&&(m.map.value=d.map,t(d.map,m.mapTransform))}function a(m,d){m.dashSize.value=d.dashSize,m.totalSize.value=d.dashSize+d.gapSize,m.scale.value=d.scale}function l(m,d,b,v){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.size.value=d.size*b,m.scale.value=v*.5,d.map&&(m.map.value=d.map,t(d.map,m.uvTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function c(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.rotation.value=d.rotation,d.map&&(m.map.value=d.map,t(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function h(m,d){m.specular.value.copy(d.specular),m.shininess.value=Math.max(d.shininess,1e-4)}function u(m,d){d.gradientMap&&(m.gradientMap.value=d.gradientMap)}function p(m,d){m.metalness.value=d.metalness,d.metalnessMap&&(m.metalnessMap.value=d.metalnessMap,t(d.metalnessMap,m.metalnessMapTransform)),m.roughness.value=d.roughness,d.roughnessMap&&(m.roughnessMap.value=d.roughnessMap,t(d.roughnessMap,m.roughnessMapTransform)),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)}function f(m,d,b){m.ior.value=d.ior,d.sheen>0&&(m.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),m.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(m.sheenColorMap.value=d.sheenColorMap,t(d.sheenColorMap,m.sheenColorMapTransform)),d.sheenRoughnessMap&&(m.sheenRoughnessMap.value=d.sheenRoughnessMap,t(d.sheenRoughnessMap,m.sheenRoughnessMapTransform))),d.clearcoat>0&&(m.clearcoat.value=d.clearcoat,m.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(m.clearcoatMap.value=d.clearcoatMap,t(d.clearcoatMap,m.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,t(d.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(m.clearcoatNormalMap.value=d.clearcoatNormalMap,t(d.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===1&&m.clearcoatNormalScale.value.negate())),d.dispersion>0&&(m.dispersion.value=d.dispersion),d.iridescence>0&&(m.iridescence.value=d.iridescence,m.iridescenceIOR.value=d.iridescenceIOR,m.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(m.iridescenceMap.value=d.iridescenceMap,t(d.iridescenceMap,m.iridescenceMapTransform)),d.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=d.iridescenceThicknessMap,t(d.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),d.transmission>0&&(m.transmission.value=d.transmission,m.transmissionSamplerMap.value=b.texture,m.transmissionSamplerSize.value.set(b.width,b.height),d.transmissionMap&&(m.transmissionMap.value=d.transmissionMap,t(d.transmissionMap,m.transmissionMapTransform)),m.thickness.value=d.thickness,d.thicknessMap&&(m.thicknessMap.value=d.thicknessMap,t(d.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=d.attenuationDistance,m.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(m.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(m.anisotropyMap.value=d.anisotropyMap,t(d.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=d.specularIntensity,m.specularColor.value.copy(d.specularColor),d.specularColorMap&&(m.specularColorMap.value=d.specularColorMap,t(d.specularColorMap,m.specularColorMapTransform)),d.specularIntensityMap&&(m.specularIntensityMap.value=d.specularIntensityMap,t(d.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,d){d.matcap&&(m.matcap.value=d.matcap)}function y(m,d){const b=e.get(d).light;m.referencePosition.value.setFromMatrixPosition(b.matrixWorld),m.nearDistance.value=b.shadow.camera.near,m.farDistance.value=b.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function Vm(n,e,t,i){let s={},r={},o=[];const a=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(b,v){const _=v.program;i.uniformBlockBinding(b,_)}function c(b,v){let _=s[b.id];_===void 0&&(g(b),_=h(b),s[b.id]=_,b.addEventListener("dispose",m));const R=v.program;i.updateUBOMapping(b,R);const w=e.render.frame;r[b.id]!==w&&(p(b),r[b.id]=w)}function h(b){const v=u();b.__bindingPointIndex=v;const _=n.createBuffer(),R=b.__size,w=b.usage;return n.bindBuffer(n.UNIFORM_BUFFER,_),n.bufferData(n.UNIFORM_BUFFER,R,w),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,v,_),_}function u(){for(let b=0;b<a;b++)if(o.indexOf(b)===-1)return o.push(b),b;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function p(b){const v=s[b.id],_=b.uniforms,R=b.__cache;n.bindBuffer(n.UNIFORM_BUFFER,v);for(let w=0,A=_.length;w<A;w++){const C=Array.isArray(_[w])?_[w]:[_[w]];for(let S=0,M=C.length;S<M;S++){const I=C[S];if(f(I,w,S,R)===!0){const z=I.__offset,N=Array.isArray(I.value)?I.value:[I.value];let O=0;for(let X=0;X<N.length;X++){const Y=N[X],se=y(Y);typeof Y=="number"||typeof Y=="boolean"?(I.__data[0]=Y,n.bufferSubData(n.UNIFORM_BUFFER,z+O,I.__data)):Y.isMatrix3?(I.__data[0]=Y.elements[0],I.__data[1]=Y.elements[1],I.__data[2]=Y.elements[2],I.__data[3]=0,I.__data[4]=Y.elements[3],I.__data[5]=Y.elements[4],I.__data[6]=Y.elements[5],I.__data[7]=0,I.__data[8]=Y.elements[6],I.__data[9]=Y.elements[7],I.__data[10]=Y.elements[8],I.__data[11]=0):(Y.toArray(I.__data,O),O+=se.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,z,I.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function f(b,v,_,R){const w=b.value,A=v+"_"+_;if(R[A]===void 0)return typeof w=="number"||typeof w=="boolean"?R[A]=w:R[A]=w.clone(),!0;{const C=R[A];if(typeof w=="number"||typeof w=="boolean"){if(C!==w)return R[A]=w,!0}else if(C.equals(w)===!1)return C.copy(w),!0}return!1}function g(b){const v=b.uniforms;let _=0;const R=16;for(let A=0,C=v.length;A<C;A++){const S=Array.isArray(v[A])?v[A]:[v[A]];for(let M=0,I=S.length;M<I;M++){const z=S[M],N=Array.isArray(z.value)?z.value:[z.value];for(let O=0,X=N.length;O<X;O++){const Y=N[O],se=y(Y),U=_%R,x=U%se.boundary,F=U+x;_+=x,F!==0&&R-F<se.storage&&(_+=R-F),z.__data=new Float32Array(se.storage/Float32Array.BYTES_PER_ELEMENT),z.__offset=_,_+=se.storage}}}const w=_%R;return w>0&&(_+=R-w),b.__size=_,b.__cache={},this}function y(b){const v={boundary:0,storage:0};return typeof b=="number"||typeof b=="boolean"?(v.boundary=4,v.storage=4):b.isVector2?(v.boundary=8,v.storage=8):b.isVector3||b.isColor?(v.boundary=16,v.storage=12):b.isVector4?(v.boundary=16,v.storage=16):b.isMatrix3?(v.boundary=48,v.storage=48):b.isMatrix4?(v.boundary=64,v.storage=64):b.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",b),v}function m(b){const v=b.target;v.removeEventListener("dispose",m);const _=o.indexOf(v.__bindingPointIndex);o.splice(_,1),n.deleteBuffer(s[v.id]),delete s[v.id],delete r[v.id]}function d(){for(const b in s)n.deleteBuffer(s[b]);o=[],s={},r={}}return{bind:l,update:c,dispose:d}}class ay{constructor(e={}){const{canvas:t=Ah(),context:i=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reverseDepthBuffer:p=!1}=e;this.isWebGLRenderer=!0;let f;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=i.getContextAttributes().alpha}else f=o;const g=new Uint32Array(4),y=new Int32Array(4);let m=null,d=null;const b=[],v=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Ft,this.toneMapping=0,this.toneMappingExposure=1;const _=this;let R=!1,w=0,A=0,C=null,S=-1,M=null;const I=new tt,z=new tt;let N=null;const O=new Ne(0);let X=0,Y=t.width,se=t.height,U=1,x=null,F=null;const oe=new tt(0,0,Y,se),we=new tt(0,0,Y,se);let Fe=!1;const $=new Bo;let he=!1,ie=!1;const W=new He,ne=new He,Re=new L,te=new tt,B={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let K=!1;function re(){return C===null?U:1}let D=i;function ue(E,V){return t.getContext(E,V)}try{const E={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine","three.js r170"),t.addEventListener("webglcontextlost",ae,!1),t.addEventListener("webglcontextrestored",xe,!1),t.addEventListener("webglcontextcreationerror",be,!1),D===null){const V="webgl2";if(D=ue(V,E),D===null)throw ue(V)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(E){throw console.error("THREE.WebGLRenderer: "+E.message),E}let le,ye,pe,De,ve,P,T,k,J,ee,Z,Ae,ge,Se,Je,de,Te,ke,Be,Ee,$e,je,ut,H;function _e(){le=new jf(D),le.init(),je=new Dm(D,le),ye=new Vf(D,le,e,je),pe=new Pm(D,le),ye.reverseDepthBuffer&&p&&pe.buffers.depth.setReversed(!0),De=new Zf(D),ve=new mm,P=new Im(D,le,pe,ve,ye,je,De),T=new Wf(_),k=new qf(_),J=new iu(D),ut=new zf(D,J),ee=new Kf(D,J,De,ut),Z=new Qf(D,ee,J,De),Be=new $f(D,ye,P),de=new Gf(ve),Ae=new pm(_,T,k,le,ye,ut,de),ge=new Hm(_,ve),Se=new _m,Je=new Sm(le),ke=new Bf(_,T,k,pe,Z,f,l),Te=new Rm(_,Z,ye),H=new Vm(D,De,ye,pe),Ee=new Hf(D,le,De),$e=new Jf(D,le,De),De.programs=Ae.programs,_.capabilities=ye,_.extensions=le,_.properties=ve,_.renderLists=Se,_.shadowMap=Te,_.state=pe,_.info=De}_e();const Q=new Bm(_,D);this.xr=Q,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){const E=le.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){const E=le.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return U},this.setPixelRatio=function(E){E!==void 0&&(U=E,this.setSize(Y,se,!1))},this.getSize=function(E){return E.set(Y,se)},this.setSize=function(E,V,q=!0){if(Q.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}Y=E,se=V,t.width=Math.floor(E*U),t.height=Math.floor(V*U),q===!0&&(t.style.width=E+"px",t.style.height=V+"px"),this.setViewport(0,0,E,V)},this.getDrawingBufferSize=function(E){return E.set(Y*U,se*U).floor()},this.setDrawingBufferSize=function(E,V,q){Y=E,se=V,U=q,t.width=Math.floor(E*q),t.height=Math.floor(V*q),this.setViewport(0,0,E,V)},this.getCurrentViewport=function(E){return E.copy(I)},this.getViewport=function(E){return E.copy(oe)},this.setViewport=function(E,V,q,j){E.isVector4?oe.set(E.x,E.y,E.z,E.w):oe.set(E,V,q,j),pe.viewport(I.copy(oe).multiplyScalar(U).round())},this.getScissor=function(E){return E.copy(we)},this.setScissor=function(E,V,q,j){E.isVector4?we.set(E.x,E.y,E.z,E.w):we.set(E,V,q,j),pe.scissor(z.copy(we).multiplyScalar(U).round())},this.getScissorTest=function(){return Fe},this.setScissorTest=function(E){pe.setScissorTest(Fe=E)},this.setOpaqueSort=function(E){x=E},this.setTransparentSort=function(E){F=E},this.getClearColor=function(E){return E.copy(ke.getClearColor())},this.setClearColor=function(){ke.setClearColor.apply(ke,arguments)},this.getClearAlpha=function(){return ke.getClearAlpha()},this.setClearAlpha=function(){ke.setClearAlpha.apply(ke,arguments)},this.clear=function(E=!0,V=!0,q=!0){let j=0;if(E){let G=!1;if(C!==null){const fe=C.texture.format;G=fe===1033||fe===1031||fe===1029}if(G){const fe=C.texture.type,Me=fe===1009||fe===1014||fe===1012||fe===1020||fe===1017||fe===1018,Ce=ke.getClearColor(),Pe=ke.getClearAlpha(),ze=Ce.r,Xe=Ce.g,Le=Ce.b;Me?(g[0]=ze,g[1]=Xe,g[2]=Le,g[3]=Pe,D.clearBufferuiv(D.COLOR,0,g)):(y[0]=ze,y[1]=Xe,y[2]=Le,y[3]=Pe,D.clearBufferiv(D.COLOR,0,y))}else j|=D.COLOR_BUFFER_BIT}V&&(j|=D.DEPTH_BUFFER_BIT),q&&(j|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),D.clear(j)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",ae,!1),t.removeEventListener("webglcontextrestored",xe,!1),t.removeEventListener("webglcontextcreationerror",be,!1),Se.dispose(),Je.dispose(),ve.dispose(),T.dispose(),k.dispose(),Z.dispose(),ut.dispose(),H.dispose(),Ae.dispose(),Q.dispose(),Q.removeEventListener("sessionstart",ea),Q.removeEventListener("sessionend",ta),kn.stop()};function ae(E){E.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),R=!0}function xe(){console.log("THREE.WebGLRenderer: Context Restored."),R=!1;const E=De.autoReset,V=Te.enabled,q=Te.autoUpdate,j=Te.needsUpdate,G=Te.type;_e(),De.autoReset=E,Te.enabled=V,Te.autoUpdate=q,Te.needsUpdate=j,Te.type=G}function be(E){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function We(E){const V=E.target;V.removeEventListener("dispose",We),bt(V)}function bt(E){Lt(E),ve.remove(E)}function Lt(E){const V=ve.get(E).programs;V!==void 0&&(V.forEach(function(q){Ae.releaseProgram(q)}),E.isShaderMaterial&&Ae.releaseShaderCache(E))}this.renderBufferDirect=function(E,V,q,j,G,fe){V===null&&(V=B);const Me=G.isMesh&&G.matrixWorld.determinant()<0,Ce=ah(E,V,q,j,G);pe.setMaterial(j,Me);let Pe=q.index,ze=1;if(j.wireframe===!0){if(Pe=ee.getWireframeAttribute(q),Pe===void 0)return;ze=2}const Xe=q.drawRange,Le=q.attributes.position;let et=Xe.start*ze,dt=(Xe.start+Xe.count)*ze;fe!==null&&(et=Math.max(et,fe.start*ze),dt=Math.min(dt,(fe.start+fe.count)*ze)),Pe!==null?(et=Math.max(et,0),dt=Math.min(dt,Pe.count)):Le!=null&&(et=Math.max(et,0),dt=Math.min(dt,Le.count));const pt=dt-et;if(pt<0||pt===1/0)return;ut.setup(G,j,Ce,q,Pe);let Bt,nt=Ee;if(Pe!==null&&(Bt=J.get(Pe),nt=$e,nt.setIndex(Bt)),G.isMesh)j.wireframe===!0?(pe.setLineWidth(j.wireframeLinewidth*re()),nt.setMode(D.LINES)):nt.setMode(D.TRIANGLES);else if(G.isLine){let Ie=j.linewidth;Ie===void 0&&(Ie=1),pe.setLineWidth(Ie*re()),G.isLineSegments?nt.setMode(D.LINES):G.isLineLoop?nt.setMode(D.LINE_LOOP):nt.setMode(D.LINE_STRIP)}else G.isPoints?nt.setMode(D.POINTS):G.isSprite&&nt.setMode(D.TRIANGLES);if(G.isBatchedMesh)if(G._multiDrawInstances!==null)nt.renderMultiDrawInstances(G._multiDrawStarts,G._multiDrawCounts,G._multiDrawCount,G._multiDrawInstances);else if(le.get("WEBGL_multi_draw"))nt.renderMultiDraw(G._multiDrawStarts,G._multiDrawCounts,G._multiDrawCount);else{const Ie=G._multiDrawStarts,un=G._multiDrawCounts,it=G._multiDrawCount,Zt=Pe?J.get(Pe).bytesPerElement:1,Zn=ve.get(j).currentProgram.getUniforms();for(let Ht=0;Ht<it;Ht++)Zn.setValue(D,"_gl_DrawID",Ht),nt.render(Ie[Ht]/Zt,un[Ht])}else if(G.isInstancedMesh)nt.renderInstances(et,pt,G.count);else if(q.isInstancedBufferGeometry){const Ie=q._maxInstanceCount!==void 0?q._maxInstanceCount:1/0,un=Math.min(q.instanceCount,Ie);nt.renderInstances(et,pt,un)}else nt.render(et,pt)};function rt(E,V,q){E.transparent===!0&&E.side===2&&E.forceSinglePass===!1?(E.side=1,E.needsUpdate=!0,ds(E,V,q),E.side=0,E.needsUpdate=!0,ds(E,V,q),E.side=2):ds(E,V,q)}this.compile=function(E,V,q=null){q===null&&(q=E),d=Je.get(q),d.init(V),v.push(d),q.traverseVisible(function(G){G.isLight&&G.layers.test(V.layers)&&(d.pushLight(G),G.castShadow&&d.pushShadow(G))}),E!==q&&E.traverseVisible(function(G){G.isLight&&G.layers.test(V.layers)&&(d.pushLight(G),G.castShadow&&d.pushShadow(G))}),d.setupLights();const j=new Set;return E.traverse(function(G){if(!(G.isMesh||G.isPoints||G.isLine||G.isSprite))return;const fe=G.material;if(fe)if(Array.isArray(fe))for(let Me=0;Me<fe.length;Me++){const Ce=fe[Me];rt(Ce,q,G),j.add(Ce)}else rt(fe,q,G),j.add(fe)}),v.pop(),d=null,j},this.compileAsync=function(E,V,q=null){const j=this.compile(E,V,q);return new Promise(G=>{function fe(){if(j.forEach(function(Me){ve.get(Me).currentProgram.isReady()&&j.delete(Me)}),j.size===0){G(E);return}setTimeout(fe,10)}le.get("KHR_parallel_shader_compile")!==null?fe():setTimeout(fe,10)})};let Jt=null;function hn(E){Jt&&Jt(E)}function ea(){kn.stop()}function ta(){kn.start()}const kn=new ic;kn.setAnimationLoop(hn),typeof self<"u"&&kn.setContext(self),this.setAnimationLoop=function(E){Jt=E,Q.setAnimationLoop(E),E===null?kn.stop():kn.start()},Q.addEventListener("sessionstart",ea),Q.addEventListener("sessionend",ta),this.render=function(E,V){if(V!==void 0&&V.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(R===!0)return;if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),V.parent===null&&V.matrixWorldAutoUpdate===!0&&V.updateMatrixWorld(),Q.enabled===!0&&Q.isPresenting===!0&&(Q.cameraAutoUpdate===!0&&Q.updateCamera(V),V=Q.getCamera()),E.isScene===!0&&E.onBeforeRender(_,E,V,C),d=Je.get(E,v.length),d.init(V),v.push(d),ne.multiplyMatrices(V.projectionMatrix,V.matrixWorldInverse),$.setFromProjectionMatrix(ne),ie=this.localClippingEnabled,he=de.init(this.clippingPlanes,ie),m=Se.get(E,b.length),m.init(),b.push(m),Q.enabled===!0&&Q.isPresenting===!0){const fe=_.xr.getDepthSensingMesh();fe!==null&&xr(fe,V,-1/0,_.sortObjects)}xr(E,V,0,_.sortObjects),m.finish(),_.sortObjects===!0&&m.sort(x,F),K=Q.enabled===!1||Q.isPresenting===!1||Q.hasDepthSensing()===!1,K&&ke.addToRenderList(m,E),this.info.render.frame++,he===!0&&de.beginShadows();const q=d.state.shadowsArray;Te.render(q,E,V),he===!0&&de.endShadows(),this.info.autoReset===!0&&this.info.reset();const j=m.opaque,G=m.transmissive;if(d.setupLights(),V.isArrayCamera){const fe=V.cameras;if(G.length>0)for(let Me=0,Ce=fe.length;Me<Ce;Me++){const Pe=fe[Me];ia(j,G,E,Pe)}K&&ke.render(E);for(let Me=0,Ce=fe.length;Me<Ce;Me++){const Pe=fe[Me];na(m,E,Pe,Pe.viewport)}}else G.length>0&&ia(j,G,E,V),K&&ke.render(E),na(m,E,V);C!==null&&(P.updateMultisampleRenderTarget(C),P.updateRenderTargetMipmap(C)),E.isScene===!0&&E.onAfterRender(_,E,V),ut.resetDefaultState(),S=-1,M=null,v.pop(),v.length>0?(d=v[v.length-1],he===!0&&de.setGlobalState(_.clippingPlanes,d.state.camera)):d=null,b.pop(),b.length>0?m=b[b.length-1]:m=null};function xr(E,V,q,j){if(E.visible===!1)return;if(E.layers.test(V.layers)){if(E.isGroup)q=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(V);else if(E.isLight)d.pushLight(E),E.castShadow&&d.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||$.intersectsSprite(E)){j&&te.setFromMatrixPosition(E.matrixWorld).applyMatrix4(ne);const Me=Z.update(E),Ce=E.material;Ce.visible&&m.push(E,Me,Ce,q,te.z,null)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||$.intersectsObject(E))){const Me=Z.update(E),Ce=E.material;if(j&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),te.copy(E.boundingSphere.center)):(Me.boundingSphere===null&&Me.computeBoundingSphere(),te.copy(Me.boundingSphere.center)),te.applyMatrix4(E.matrixWorld).applyMatrix4(ne)),Array.isArray(Ce)){const Pe=Me.groups;for(let ze=0,Xe=Pe.length;ze<Xe;ze++){const Le=Pe[ze],et=Ce[Le.materialIndex];et&&et.visible&&m.push(E,Me,et,q,te.z,Le)}}else Ce.visible&&m.push(E,Me,Ce,q,te.z,null)}}const fe=E.children;for(let Me=0,Ce=fe.length;Me<Ce;Me++)xr(fe[Me],V,q,j)}function na(E,V,q,j){const G=E.opaque,fe=E.transmissive,Me=E.transparent;d.setupLightsView(q),he===!0&&de.setGlobalState(_.clippingPlanes,q),j&&pe.viewport(I.copy(j)),G.length>0&&us(G,V,q),fe.length>0&&us(fe,V,q),Me.length>0&&us(Me,V,q),pe.buffers.depth.setTest(!0),pe.buffers.depth.setMask(!0),pe.buffers.color.setMask(!0),pe.setPolygonOffset(!1)}function ia(E,V,q,j){if((q.isScene===!0?q.overrideMaterial:null)!==null)return;d.state.transmissionRenderTarget[j.id]===void 0&&(d.state.transmissionRenderTarget[j.id]=new Kn(1,1,{generateMipmaps:!0,type:le.has("EXT_color_buffer_half_float")||le.has("EXT_color_buffer_float")?1016:1009,minFilter:1008,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Qe.workingColorSpace}));const fe=d.state.transmissionRenderTarget[j.id],Me=j.viewport||I;fe.setSize(Me.z,Me.w);const Ce=_.getRenderTarget();_.setRenderTarget(fe),_.getClearColor(O),X=_.getClearAlpha(),X<1&&_.setClearColor(16777215,.5),_.clear(),K&&ke.render(q);const Pe=_.toneMapping;_.toneMapping=0;const ze=j.viewport;if(j.viewport!==void 0&&(j.viewport=void 0),d.setupLightsView(j),he===!0&&de.setGlobalState(_.clippingPlanes,j),us(E,q,j),P.updateMultisampleRenderTarget(fe),P.updateRenderTargetMipmap(fe),le.has("WEBGL_multisampled_render_to_texture")===!1){let Xe=!1;for(let Le=0,et=V.length;Le<et;Le++){const dt=V[Le],pt=dt.object,Bt=dt.geometry,nt=dt.material,Ie=dt.group;if(nt.side===2&&pt.layers.test(j.layers)){const un=nt.side;nt.side=1,nt.needsUpdate=!0,sa(pt,q,j,Bt,nt,Ie),nt.side=un,nt.needsUpdate=!0,Xe=!0}}Xe===!0&&(P.updateMultisampleRenderTarget(fe),P.updateRenderTargetMipmap(fe))}_.setRenderTarget(Ce),_.setClearColor(O,X),ze!==void 0&&(j.viewport=ze),_.toneMapping=Pe}function us(E,V,q){const j=V.isScene===!0?V.overrideMaterial:null;for(let G=0,fe=E.length;G<fe;G++){const Me=E[G],Ce=Me.object,Pe=Me.geometry,ze=j===null?Me.material:j,Xe=Me.group;Ce.layers.test(q.layers)&&sa(Ce,V,q,Pe,ze,Xe)}}function sa(E,V,q,j,G,fe){E.onBeforeRender(_,V,q,j,G,fe),E.modelViewMatrix.multiplyMatrices(q.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),G.onBeforeRender(_,V,q,j,E,fe),G.transparent===!0&&G.side===2&&G.forceSinglePass===!1?(G.side=1,G.needsUpdate=!0,_.renderBufferDirect(q,V,j,G,E,fe),G.side=0,G.needsUpdate=!0,_.renderBufferDirect(q,V,j,G,E,fe),G.side=2):_.renderBufferDirect(q,V,j,G,E,fe),E.onAfterRender(_,V,q,j,G,fe)}function ds(E,V,q){V.isScene!==!0&&(V=B);const j=ve.get(E),G=d.state.lights,fe=d.state.shadowsArray,Me=G.state.version,Ce=Ae.getParameters(E,G.state,fe,V,q),Pe=Ae.getProgramCacheKey(Ce);let ze=j.programs;j.environment=E.isMeshStandardMaterial?V.environment:null,j.fog=V.fog,j.envMap=(E.isMeshStandardMaterial?k:T).get(E.envMap||j.environment),j.envMapRotation=j.environment!==null&&E.envMap===null?V.environmentRotation:E.envMapRotation,ze===void 0&&(E.addEventListener("dispose",We),ze=new Map,j.programs=ze);let Xe=ze.get(Pe);if(Xe!==void 0){if(j.currentProgram===Xe&&j.lightsStateVersion===Me)return oa(E,Ce),Xe}else Ce.uniforms=Ae.getUniforms(E),E.onBeforeCompile(Ce,_),Xe=Ae.acquireProgram(Ce,Pe),ze.set(Pe,Xe),j.uniforms=Ce.uniforms;const Le=j.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(Le.clippingPlanes=de.uniform),oa(E,Ce),j.needsLights=ch(E),j.lightsStateVersion=Me,j.needsLights&&(Le.ambientLightColor.value=G.state.ambient,Le.lightProbe.value=G.state.probe,Le.directionalLights.value=G.state.directional,Le.directionalLightShadows.value=G.state.directionalShadow,Le.spotLights.value=G.state.spot,Le.spotLightShadows.value=G.state.spotShadow,Le.rectAreaLights.value=G.state.rectArea,Le.ltc_1.value=G.state.rectAreaLTC1,Le.ltc_2.value=G.state.rectAreaLTC2,Le.pointLights.value=G.state.point,Le.pointLightShadows.value=G.state.pointShadow,Le.hemisphereLights.value=G.state.hemi,Le.directionalShadowMap.value=G.state.directionalShadowMap,Le.directionalShadowMatrix.value=G.state.directionalShadowMatrix,Le.spotShadowMap.value=G.state.spotShadowMap,Le.spotLightMatrix.value=G.state.spotLightMatrix,Le.spotLightMap.value=G.state.spotLightMap,Le.pointShadowMap.value=G.state.pointShadowMap,Le.pointShadowMatrix.value=G.state.pointShadowMatrix),j.currentProgram=Xe,j.uniformsList=null,Xe}function ra(E){if(E.uniformsList===null){const V=E.currentProgram.getUniforms();E.uniformsList=qs.seqWithValue(V.seq,E.uniforms)}return E.uniformsList}function oa(E,V){const q=ve.get(E);q.outputColorSpace=V.outputColorSpace,q.batching=V.batching,q.batchingColor=V.batchingColor,q.instancing=V.instancing,q.instancingColor=V.instancingColor,q.instancingMorph=V.instancingMorph,q.skinning=V.skinning,q.morphTargets=V.morphTargets,q.morphNormals=V.morphNormals,q.morphColors=V.morphColors,q.morphTargetsCount=V.morphTargetsCount,q.numClippingPlanes=V.numClippingPlanes,q.numIntersection=V.numClipIntersection,q.vertexAlphas=V.vertexAlphas,q.vertexTangents=V.vertexTangents,q.toneMapping=V.toneMapping}function ah(E,V,q,j,G){V.isScene!==!0&&(V=B),P.resetTextureUnits();const fe=V.fog,Me=j.isMeshStandardMaterial?V.environment:null,Ce=C===null?_.outputColorSpace:C.isXRRenderTarget===!0?C.texture.colorSpace:Ci,Pe=(j.isMeshStandardMaterial?k:T).get(j.envMap||Me),ze=j.vertexColors===!0&&!!q.attributes.color&&q.attributes.color.itemSize===4,Xe=!!q.attributes.tangent&&(!!j.normalMap||j.anisotropy>0),Le=!!q.morphAttributes.position,et=!!q.morphAttributes.normal,dt=!!q.morphAttributes.color;let pt=0;j.toneMapped&&(C===null||C.isXRRenderTarget===!0)&&(pt=_.toneMapping);const Bt=q.morphAttributes.position||q.morphAttributes.normal||q.morphAttributes.color,nt=Bt!==void 0?Bt.length:0,Ie=ve.get(j),un=d.state.lights;if(he===!0&&(ie===!0||E!==M)){const Yt=E===M&&j.id===S;de.setState(j,E,Yt)}let it=!1;j.version===Ie.__version?(Ie.needsLights&&Ie.lightsStateVersion!==un.state.version||Ie.outputColorSpace!==Ce||G.isBatchedMesh&&Ie.batching===!1||!G.isBatchedMesh&&Ie.batching===!0||G.isBatchedMesh&&Ie.batchingColor===!0&&G.colorTexture===null||G.isBatchedMesh&&Ie.batchingColor===!1&&G.colorTexture!==null||G.isInstancedMesh&&Ie.instancing===!1||!G.isInstancedMesh&&Ie.instancing===!0||G.isSkinnedMesh&&Ie.skinning===!1||!G.isSkinnedMesh&&Ie.skinning===!0||G.isInstancedMesh&&Ie.instancingColor===!0&&G.instanceColor===null||G.isInstancedMesh&&Ie.instancingColor===!1&&G.instanceColor!==null||G.isInstancedMesh&&Ie.instancingMorph===!0&&G.morphTexture===null||G.isInstancedMesh&&Ie.instancingMorph===!1&&G.morphTexture!==null||Ie.envMap!==Pe||j.fog===!0&&Ie.fog!==fe||Ie.numClippingPlanes!==void 0&&(Ie.numClippingPlanes!==de.numPlanes||Ie.numIntersection!==de.numIntersection)||Ie.vertexAlphas!==ze||Ie.vertexTangents!==Xe||Ie.morphTargets!==Le||Ie.morphNormals!==et||Ie.morphColors!==dt||Ie.toneMapping!==pt||Ie.morphTargetsCount!==nt)&&(it=!0):(it=!0,Ie.__version=j.version);let Zt=Ie.currentProgram;it===!0&&(Zt=ds(j,V,G));let Zn=!1,Ht=!1,ki=!1;const mt=Zt.getUniforms(),rn=Ie.uniforms;if(pe.useProgram(Zt.program)&&(Zn=!0,Ht=!0,ki=!0),j.id!==S&&(S=j.id,Ht=!0),Zn||M!==E){pe.buffers.depth.getReversed()?(W.copy(E.projectionMatrix),Ch(W),Ph(W),mt.setValue(D,"projectionMatrix",W)):mt.setValue(D,"projectionMatrix",E.projectionMatrix),mt.setValue(D,"viewMatrix",E.matrixWorldInverse);const xn=mt.map.cameraPosition;xn!==void 0&&xn.setValue(D,Re.setFromMatrixPosition(E.matrixWorld)),ye.logarithmicDepthBuffer&&mt.setValue(D,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(j.isMeshPhongMaterial||j.isMeshToonMaterial||j.isMeshLambertMaterial||j.isMeshBasicMaterial||j.isMeshStandardMaterial||j.isShaderMaterial)&&mt.setValue(D,"isOrthographic",E.isOrthographicCamera===!0),M!==E&&(M=E,Ht=!0,ki=!0)}if(G.isSkinnedMesh){mt.setOptional(D,G,"bindMatrix"),mt.setOptional(D,G,"bindMatrixInverse");const Yt=G.skeleton;Yt&&(Yt.boneTexture===null&&Yt.computeBoneTexture(),mt.setValue(D,"boneTexture",Yt.boneTexture,P))}G.isBatchedMesh&&(mt.setOptional(D,G,"batchingTexture"),mt.setValue(D,"batchingTexture",G._matricesTexture,P),mt.setOptional(D,G,"batchingIdTexture"),mt.setValue(D,"batchingIdTexture",G._indirectTexture,P),mt.setOptional(D,G,"batchingColorTexture"),G._colorsTexture!==null&&mt.setValue(D,"batchingColorTexture",G._colorsTexture,P));const Fi=q.morphAttributes;if((Fi.position!==void 0||Fi.normal!==void 0||Fi.color!==void 0)&&Be.update(G,q,Zt),(Ht||Ie.receiveShadow!==G.receiveShadow)&&(Ie.receiveShadow=G.receiveShadow,mt.setValue(D,"receiveShadow",G.receiveShadow)),j.isMeshGouraudMaterial&&j.envMap!==null&&(rn.envMap.value=Pe,rn.flipEnvMap.value=Pe.isCubeTexture&&Pe.isRenderTargetTexture===!1?-1:1),j.isMeshStandardMaterial&&j.envMap===null&&V.environment!==null&&(rn.envMapIntensity.value=V.environmentIntensity),Ht&&(mt.setValue(D,"toneMappingExposure",_.toneMappingExposure),Ie.needsLights&&lh(rn,ki),fe&&j.fog===!0&&ge.refreshFogUniforms(rn,fe),ge.refreshMaterialUniforms(rn,j,U,se,d.state.transmissionRenderTarget[E.id]),qs.upload(D,ra(Ie),rn,P)),j.isShaderMaterial&&j.uniformsNeedUpdate===!0&&(qs.upload(D,ra(Ie),rn,P),j.uniformsNeedUpdate=!1),j.isSpriteMaterial&&mt.setValue(D,"center",G.center),mt.setValue(D,"modelViewMatrix",G.modelViewMatrix),mt.setValue(D,"normalMatrix",G.normalMatrix),mt.setValue(D,"modelMatrix",G.matrixWorld),j.isShaderMaterial||j.isRawShaderMaterial){const Yt=j.uniformsGroups;for(let xn=0,Sn=Yt.length;xn<Sn;xn++){const aa=Yt[xn];H.update(aa,Zt),H.bind(aa,Zt)}}return Zt}function lh(E,V){E.ambientLightColor.needsUpdate=V,E.lightProbe.needsUpdate=V,E.directionalLights.needsUpdate=V,E.directionalLightShadows.needsUpdate=V,E.pointLights.needsUpdate=V,E.pointLightShadows.needsUpdate=V,E.spotLights.needsUpdate=V,E.spotLightShadows.needsUpdate=V,E.rectAreaLights.needsUpdate=V,E.hemisphereLights.needsUpdate=V}function ch(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return w},this.getActiveMipmapLevel=function(){return A},this.getRenderTarget=function(){return C},this.setRenderTargetTextures=function(E,V,q){ve.get(E.texture).__webglTexture=V,ve.get(E.depthTexture).__webglTexture=q;const j=ve.get(E);j.__hasExternalTextures=!0,j.__autoAllocateDepthBuffer=q===void 0,j.__autoAllocateDepthBuffer||le.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),j.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(E,V){const q=ve.get(E);q.__webglFramebuffer=V,q.__useDefaultFramebuffer=V===void 0},this.setRenderTarget=function(E,V=0,q=0){C=E,w=V,A=q;let j=!0,G=null,fe=!1,Me=!1;if(E){const Pe=ve.get(E);if(Pe.__useDefaultFramebuffer!==void 0)pe.bindFramebuffer(D.FRAMEBUFFER,null),j=!1;else if(Pe.__webglFramebuffer===void 0)P.setupRenderTarget(E);else if(Pe.__hasExternalTextures)P.rebindTextures(E,ve.get(E.texture).__webglTexture,ve.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){const Le=E.depthTexture;if(Pe.__boundDepthTexture!==Le){if(Le!==null&&ve.has(Le)&&(E.width!==Le.image.width||E.height!==Le.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");P.setupDepthRenderbuffer(E)}}const ze=E.texture;(ze.isData3DTexture||ze.isDataArrayTexture||ze.isCompressedArrayTexture)&&(Me=!0);const Xe=ve.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(Xe[V])?G=Xe[V][q]:G=Xe[V],fe=!0):E.samples>0&&P.useMultisampledRTT(E)===!1?G=ve.get(E).__webglMultisampledFramebuffer:Array.isArray(Xe)?G=Xe[q]:G=Xe,I.copy(E.viewport),z.copy(E.scissor),N=E.scissorTest}else I.copy(oe).multiplyScalar(U).floor(),z.copy(we).multiplyScalar(U).floor(),N=Fe;if(pe.bindFramebuffer(D.FRAMEBUFFER,G)&&j&&pe.drawBuffers(E,G),pe.viewport(I),pe.scissor(z),pe.setScissorTest(N),fe){const Pe=ve.get(E.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+V,Pe.__webglTexture,q)}else if(Me){const Pe=ve.get(E.texture),ze=V||0;D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,Pe.__webglTexture,q||0,ze)}S=-1},this.readRenderTargetPixels=function(E,V,q,j,G,fe,Me){if(!(E&&E.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ce=ve.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&Me!==void 0&&(Ce=Ce[Me]),Ce){pe.bindFramebuffer(D.FRAMEBUFFER,Ce);try{const Pe=E.texture,ze=Pe.format,Xe=Pe.type;if(!ye.textureFormatReadable(ze)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ye.textureTypeReadable(Xe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}V>=0&&V<=E.width-j&&q>=0&&q<=E.height-G&&D.readPixels(V,q,j,G,je.convert(ze),je.convert(Xe),fe)}finally{const Pe=C!==null?ve.get(C).__webglFramebuffer:null;pe.bindFramebuffer(D.FRAMEBUFFER,Pe)}}},this.readRenderTargetPixelsAsync=async function(E,V,q,j,G,fe,Me){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ce=ve.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&Me!==void 0&&(Ce=Ce[Me]),Ce){const Pe=E.texture,ze=Pe.format,Xe=Pe.type;if(!ye.textureFormatReadable(ze))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ye.textureTypeReadable(Xe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(V>=0&&V<=E.width-j&&q>=0&&q<=E.height-G){pe.bindFramebuffer(D.FRAMEBUFFER,Ce);const Le=D.createBuffer();D.bindBuffer(D.PIXEL_PACK_BUFFER,Le),D.bufferData(D.PIXEL_PACK_BUFFER,fe.byteLength,D.STREAM_READ),D.readPixels(V,q,j,G,je.convert(ze),je.convert(Xe),0);const et=C!==null?ve.get(C).__webglFramebuffer:null;pe.bindFramebuffer(D.FRAMEBUFFER,et);const dt=D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE,0);return D.flush(),await Rh(D,dt,4),D.bindBuffer(D.PIXEL_PACK_BUFFER,Le),D.getBufferSubData(D.PIXEL_PACK_BUFFER,0,fe),D.deleteBuffer(Le),D.deleteSync(dt),fe}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(E,V=null,q=0){E.isTexture!==!0&&(Zi("WebGLRenderer: copyFramebufferToTexture function signature has changed."),V=arguments[0]||null,E=arguments[1]);const j=Math.pow(2,-q),G=Math.floor(E.image.width*j),fe=Math.floor(E.image.height*j),Me=V!==null?V.x:0,Ce=V!==null?V.y:0;P.setTexture2D(E,0),D.copyTexSubImage2D(D.TEXTURE_2D,q,0,0,Me,Ce,G,fe),pe.unbindTexture()},this.copyTextureToTexture=function(E,V,q=null,j=null,G=0){E.isTexture!==!0&&(Zi("WebGLRenderer: copyTextureToTexture function signature has changed."),j=arguments[0]||null,E=arguments[1],V=arguments[2],G=arguments[3]||0,q=null);let fe,Me,Ce,Pe,ze,Xe,Le,et,dt;const pt=E.isCompressedTexture?E.mipmaps[G]:E.image;q!==null?(fe=q.max.x-q.min.x,Me=q.max.y-q.min.y,Ce=q.isBox3?q.max.z-q.min.z:1,Pe=q.min.x,ze=q.min.y,Xe=q.isBox3?q.min.z:0):(fe=pt.width,Me=pt.height,Ce=pt.depth||1,Pe=0,ze=0,Xe=0),j!==null?(Le=j.x,et=j.y,dt=j.z):(Le=0,et=0,dt=0);const Bt=je.convert(V.format),nt=je.convert(V.type);let Ie;V.isData3DTexture?(P.setTexture3D(V,0),Ie=D.TEXTURE_3D):V.isDataArrayTexture||V.isCompressedArrayTexture?(P.setTexture2DArray(V,0),Ie=D.TEXTURE_2D_ARRAY):(P.setTexture2D(V,0),Ie=D.TEXTURE_2D),D.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,V.flipY),D.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,V.premultiplyAlpha),D.pixelStorei(D.UNPACK_ALIGNMENT,V.unpackAlignment);const un=D.getParameter(D.UNPACK_ROW_LENGTH),it=D.getParameter(D.UNPACK_IMAGE_HEIGHT),Zt=D.getParameter(D.UNPACK_SKIP_PIXELS),Zn=D.getParameter(D.UNPACK_SKIP_ROWS),Ht=D.getParameter(D.UNPACK_SKIP_IMAGES);D.pixelStorei(D.UNPACK_ROW_LENGTH,pt.width),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,pt.height),D.pixelStorei(D.UNPACK_SKIP_PIXELS,Pe),D.pixelStorei(D.UNPACK_SKIP_ROWS,ze),D.pixelStorei(D.UNPACK_SKIP_IMAGES,Xe);const ki=E.isDataArrayTexture||E.isData3DTexture,mt=V.isDataArrayTexture||V.isData3DTexture;if(E.isRenderTargetTexture||E.isDepthTexture){const rn=ve.get(E),Fi=ve.get(V),Yt=ve.get(rn.__renderTarget),xn=ve.get(Fi.__renderTarget);pe.bindFramebuffer(D.READ_FRAMEBUFFER,Yt.__webglFramebuffer),pe.bindFramebuffer(D.DRAW_FRAMEBUFFER,xn.__webglFramebuffer);for(let Sn=0;Sn<Ce;Sn++)ki&&D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,ve.get(E).__webglTexture,G,Xe+Sn),E.isDepthTexture?(mt&&D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,ve.get(V).__webglTexture,G,dt+Sn),D.blitFramebuffer(Pe,ze,fe,Me,Le,et,fe,Me,D.DEPTH_BUFFER_BIT,D.NEAREST)):mt?D.copyTexSubImage3D(Ie,G,Le,et,dt+Sn,Pe,ze,fe,Me):D.copyTexSubImage2D(Ie,G,Le,et,dt+Sn,Pe,ze,fe,Me);pe.bindFramebuffer(D.READ_FRAMEBUFFER,null),pe.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else mt?E.isDataTexture||E.isData3DTexture?D.texSubImage3D(Ie,G,Le,et,dt,fe,Me,Ce,Bt,nt,pt.data):V.isCompressedArrayTexture?D.compressedTexSubImage3D(Ie,G,Le,et,dt,fe,Me,Ce,Bt,pt.data):D.texSubImage3D(Ie,G,Le,et,dt,fe,Me,Ce,Bt,nt,pt):E.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,G,Le,et,fe,Me,Bt,nt,pt.data):E.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,G,Le,et,pt.width,pt.height,Bt,pt.data):D.texSubImage2D(D.TEXTURE_2D,G,Le,et,fe,Me,Bt,nt,pt);D.pixelStorei(D.UNPACK_ROW_LENGTH,un),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,it),D.pixelStorei(D.UNPACK_SKIP_PIXELS,Zt),D.pixelStorei(D.UNPACK_SKIP_ROWS,Zn),D.pixelStorei(D.UNPACK_SKIP_IMAGES,Ht),G===0&&V.generateMipmaps&&D.generateMipmap(Ie),pe.unbindTexture()},this.copyTextureToTexture3D=function(E,V,q=null,j=null,G=0){return E.isTexture!==!0&&(Zi("WebGLRenderer: copyTextureToTexture3D function signature has changed."),q=arguments[0]||null,j=arguments[1]||null,E=arguments[2],V=arguments[3],G=arguments[4]||0),Zi('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(E,V,q,j,G)},this.initRenderTarget=function(E){ve.get(E).__webglFramebuffer===void 0&&P.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?P.setTextureCube(E,0):E.isData3DTexture?P.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?P.setTexture2DArray(E,0):P.setTexture2D(E,0),pe.unbindTexture()},this.resetState=function(){w=0,A=0,C=null,pe.reset(),ut.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return 2e3}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorspace=Qe._getDrawingBufferColorSpace(e),t.unpackColorSpace=Qe._getUnpackColorSpace()}}class hc{constructor(e,t=1,i=1e3){this.isFog=!0,this.name="",this.color=new Ne(e),this.near=t,this.far=i}clone(){return new hc(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class ly extends vt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new sn,this.environmentIntensity=1,this.environmentRotation=new sn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Gm{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=35044,this.updateRanges=[],this.version=0,this.uuid=Kt()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[i+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Kt()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Kt()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const Ut=new L;class er{constructor(e,t,i,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=i,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,i=this.data.count;t<i;t++)Ut.fromBufferAttribute(this,t),Ut.applyMatrix4(e),this.setXYZ(t,Ut.x,Ut.y,Ut.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Ut.fromBufferAttribute(this,t),Ut.applyNormalMatrix(e),this.setXYZ(t,Ut.x,Ut.y,Ut.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Ut.fromBufferAttribute(this,t),Ut.transformDirection(e),this.setXYZ(t,Ut.x,Ut.y,Ut.z);return this}getComponent(e,t){let i=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(i=tn(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=at(i,this.array)),this.data.array[e*this.data.stride+this.offset+t]=i,this}setX(e,t){return this.normalized&&(t=at(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=at(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=at(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=at(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=tn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=tn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=tn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=tn(t,this.array)),t}setXY(e,t,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=at(t,this.array),i=at(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this}setXYZ(e,t,i,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=at(t,this.array),i=at(i,this.array),s=at(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=at(t,this.array),i=at(i,this.array),s=at(s,this.array),r=at(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const s=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new Pt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new er(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const s=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class uc extends Mn{static get type(){return"SpriteMaterial"}constructor(e){super(),this.isSpriteMaterial=!0,this.color=new Ne(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let ui;const Vi=new L,di=new L,fi=new L,pi=new ce,Gi=new ce,dc=new He,Ds=new L,Wi=new L,Ns=new L,nl=new ce,Jr=new ce,il=new ce;class Wm extends vt{constructor(e=new uc){if(super(),this.isSprite=!0,this.type="Sprite",ui===void 0){ui=new _t;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new Gm(t,5);ui.setIndex([0,1,2,0,2,3]),ui.setAttribute("position",new er(i,3,0,!1)),ui.setAttribute("uv",new er(i,2,3,!1))}this.geometry=ui,this.material=e,this.center=new ce(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),di.setFromMatrixScale(this.matrixWorld),dc.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),fi.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&di.multiplyScalar(-fi.z);const i=this.material.rotation;let s,r;i!==0&&(r=Math.cos(i),s=Math.sin(i));const o=this.center;Us(Ds.set(-.5,-.5,0),fi,o,di,s,r),Us(Wi.set(.5,-.5,0),fi,o,di,s,r),Us(Ns.set(.5,.5,0),fi,o,di,s,r),nl.set(0,0),Jr.set(1,0),il.set(1,1);let a=e.ray.intersectTriangle(Ds,Wi,Ns,!1,Vi);if(a===null&&(Us(Wi.set(-.5,.5,0),fi,o,di,s,r),Jr.set(0,1),a=e.ray.intersectTriangle(Ds,Ns,Wi,!1,Vi),a===null))return;const l=e.ray.origin.distanceTo(Vi);l<e.near||l>e.far||t.push({distance:l,point:Vi.clone(),uv:jt.getInterpolation(Vi,Ds,Wi,Ns,nl,Jr,il,new ce),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function Us(n,e,t,i,s,r){pi.subVectors(n,t).addScalar(.5).multiply(i),s!==void 0?(Gi.x=r*pi.x-s*pi.y,Gi.y=s*pi.x+r*pi.y):Gi.copy(pi),n.copy(e),n.x+=Gi.x,n.y+=Gi.y,n.applyMatrix4(dc)}const sl=new L,rl=new tt,ol=new tt,Xm=new L,al=new He,ks=new L,Zr=new bn,ll=new He,$r=new ls;class js extends ht{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=la,this.bindMatrix=new He,this.bindMatrixInverse=new He,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Un),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let i=0;i<t.count;i++)this.getVertexPosition(i,ks),this.boundingBox.expandByPoint(ks)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new bn),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let i=0;i<t.count;i++)this.getVertexPosition(i,ks),this.boundingSphere.expandByPoint(ks)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const i=this.material,s=this.matrixWorld;i!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Zr.copy(this.boundingSphere),Zr.applyMatrix4(s),e.ray.intersectsSphere(Zr)!==!1&&(ll.copy(s).invert(),$r.copy(e.ray).applyMatrix4(ll),!(this.boundingBox!==null&&$r.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,$r)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new tt,t=this.geometry.attributes.skinWeight;for(let i=0,s=t.count;i<s;i++){e.fromBufferAttribute(t,i);const r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(i,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===la?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===hh?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const i=this.skeleton,s=this.geometry;rl.fromBufferAttribute(s.attributes.skinIndex,e),ol.fromBufferAttribute(s.attributes.skinWeight,e),sl.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let r=0;r<4;r++){const o=ol.getComponent(r);if(o!==0){const a=rl.getComponent(r);al.multiplyMatrices(i.bones[a].matrixWorld,i.boneInverses[a]),t.addScaledVector(Xm.copy(sl).applyMatrix4(al),o)}}return t.applyMatrix4(this.bindMatrixInverse)}}class fc extends vt{constructor(){super(),this.isBone=!0,this.type="Bone"}}class fr extends Ct{constructor(e=null,t=1,i=1,s,r,o,a,l,c=1003,h=1003,u,p){super(null,o,a,l,c,h,s,r,u,p),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const cl=new He,Ym=new He;class Ho{constructor(e=[],t=[]){this.uuid=Kt(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let i=0,s=this.bones.length;i<s;i++)this.boneInverses.push(new He)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const i=new He;this.bones[e]&&i.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(i)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const i=this.bones[e];i&&i.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const i=this.bones[e];i&&(i.parent&&i.parent.isBone?(i.matrix.copy(i.parent.matrixWorld).invert(),i.matrix.multiply(i.matrixWorld)):i.matrix.copy(i.matrixWorld),i.matrix.decompose(i.position,i.quaternion,i.scale))}}update(){const e=this.bones,t=this.boneInverses,i=this.boneMatrices,s=this.boneTexture;for(let r=0,o=e.length;r<o;r++){const a=e[r]?e[r].matrixWorld:Ym;cl.multiplyMatrices(a,t[r]),cl.toArray(i,r*16)}s!==null&&(s.needsUpdate=!0)}clone(){return new Ho(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const i=new fr(t,e,e,1023,1015);return i.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=i,this}getBoneByName(e){for(let t=0,i=this.bones.length;t<i;t++){const s=this.bones[t];if(s.name===e)return s}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let i=0,s=e.bones.length;i<s;i++){const r=e.bones[i];let o=t[r];o===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",r),o=new fc),this.bones.push(o),this.boneInverses.push(new He().fromArray(e.boneInverses[i]))}return this.init(),this}toJSON(){const e={metadata:{version:4.6,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,i=this.boneInverses;for(let s=0,r=t.length;s<r;s++){const o=t[s];e.bones.push(o.uuid);const a=i[s];e.boneInverses.push(a.toArray())}return e}}class hl extends Pt{constructor(e,t,i,s=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const mi=new He,ul=new He,Fs=[],dl=new Un,qm=new He,Xi=new ht,Yi=new bn;class cy extends ht{constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new hl(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<i;s++)this.setMatrixAt(s,qm)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Un),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,mi),dl.copy(e.boundingBox).applyMatrix4(mi),this.boundingBox.union(dl)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new bn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,mi),Yi.copy(e.boundingSphere).applyMatrix4(mi),this.boundingSphere.union(Yi)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const i=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=i.length+1,o=e*r+1;for(let a=0;a<i.length;a++)i[a]=s[o+a]}raycast(e,t){const i=this.matrixWorld,s=this.count;if(Xi.geometry=this.geometry,Xi.material=this.material,Xi.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Yi.copy(this.boundingSphere),Yi.applyMatrix4(i),e.ray.intersectsSphere(Yi)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,mi),ul.multiplyMatrices(i,mi),Xi.matrixWorld=ul,Xi.raycast(e,Fs);for(let o=0,a=Fs.length;o<a;o++){const l=Fs[o];l.instanceId=r,l.object=this,t.push(l)}Fs.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new hl(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const i=t.morphTargetInfluences,s=i.length+1;this.morphTexture===null&&(this.morphTexture=new fr(new Float32Array(s*this.count),s,this.count,1028,1015));const r=this.morphTexture.source.data.data;let o=0;for(let c=0;c<i.length;c++)o+=i[c];const a=this.geometry.morphTargetsRelative?1:1-o,l=s*e;r[l]=a,r.set(i,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class jm extends Mn{static get type(){return"LineBasicMaterial"}constructor(e){super(),this.isLineBasicMaterial=!0,this.color=new Ne(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const tr=new L,nr=new L,fl=new He,qi=new ls,Os=new bn,Qr=new L,pl=new L;class pc extends vt{constructor(e=new _t,t=new jm){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[0];for(let s=1,r=t.count;s<r;s++)tr.fromBufferAttribute(t,s-1),nr.fromBufferAttribute(t,s),i[s]=i[s-1],i[s]+=tr.distanceTo(nr);e.setAttribute("lineDistance",new Ke(i,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const i=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Os.copy(i.boundingSphere),Os.applyMatrix4(s),Os.radius+=r,e.ray.intersectsSphere(Os)===!1)return;fl.copy(s).invert(),qi.copy(e.ray).applyMatrix4(fl);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,h=i.index,p=i.attributes.position;if(h!==null){const f=Math.max(0,o.start),g=Math.min(h.count,o.start+o.count);for(let y=f,m=g-1;y<m;y+=c){const d=h.getX(y),b=h.getX(y+1),v=Bs(this,e,qi,l,d,b);v&&t.push(v)}if(this.isLineLoop){const y=h.getX(g-1),m=h.getX(f),d=Bs(this,e,qi,l,y,m);d&&t.push(d)}}else{const f=Math.max(0,o.start),g=Math.min(p.count,o.start+o.count);for(let y=f,m=g-1;y<m;y+=c){const d=Bs(this,e,qi,l,y,y+1);d&&t.push(d)}if(this.isLineLoop){const y=Bs(this,e,qi,l,g-1,f);y&&t.push(y)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function Bs(n,e,t,i,s,r){const o=n.geometry.attributes.position;if(tr.fromBufferAttribute(o,s),nr.fromBufferAttribute(o,r),t.distanceSqToSegment(tr,nr,Qr,pl)>i)return;Qr.applyMatrix4(n.matrixWorld);const l=e.ray.origin.distanceTo(Qr);if(!(l<e.near||l>e.far))return{distance:l,point:pl.clone().applyMatrix4(n.matrixWorld),index:s,face:null,faceIndex:null,barycoord:null,object:n}}const ml=new L,gl=new L;class hy extends pc{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[];for(let s=0,r=t.count;s<r;s+=2)ml.fromBufferAttribute(t,s),gl.fromBufferAttribute(t,s+1),i[s]=s===0?0:i[s-1],i[s+1]=i[s]+ml.distanceTo(gl);e.setAttribute("lineDistance",new Ke(i,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class uy extends pc{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class mc extends Mn{static get type(){return"PointsMaterial"}constructor(e){super(),this.isPointsMaterial=!0,this.color=new Ne(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const _l=new He,go=new ls,zs=new bn,Hs=new L;class Km extends vt{constructor(e=new _t,t=new mc){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const i=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),zs.copy(i.boundingSphere),zs.applyMatrix4(s),zs.radius+=r,e.ray.intersectsSphere(zs)===!1)return;_l.copy(s).invert(),go.copy(e.ray).applyMatrix4(_l);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=i.index,u=i.attributes.position;if(c!==null){const p=Math.max(0,o.start),f=Math.min(c.count,o.start+o.count);for(let g=p,y=f;g<y;g++){const m=c.getX(g);Hs.fromBufferAttribute(u,m),yl(Hs,m,l,s,e,t,this)}}else{const p=Math.max(0,o.start),f=Math.min(u.count,o.start+o.count);for(let g=p,y=f;g<y;g++)Hs.fromBufferAttribute(u,g),yl(Hs,g,l,s,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function yl(n,e,t,i,s,r,o){const a=go.distanceSqToPoint(n);if(a<t){const l=new L;go.closestPointToPoint(n,l),l.applyMatrix4(i);const c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}class dy extends Ct{constructor(e,t,i,s,r,o,a,l,c){super(e,t,i,s,r,o,a,l,c),this.isVideoTexture=!0,this.minFilter=o!==void 0?o:1006,this.magFilter=r!==void 0?r:1006,this.generateMipmaps=!1;const h=this;function u(){h.needsUpdate=!0,e.requestVideoFrameCallback(u)}"requestVideoFrameCallback"in e&&e.requestVideoFrameCallback(u)}clone(){return new this.constructor(this.image).copy(this)}update(){const e=this.image;"requestVideoFrameCallback"in e===!1&&e.readyState>=e.HAVE_CURRENT_DATA&&(this.needsUpdate=!0)}}class gc extends Ct{constructor(e,t,i,s,r,o,a,l,c){super(e,t,i,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class ln{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){const i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){const t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){const t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let i,s=this.getPoint(0),r=0;t.push(0);for(let o=1;o<=e;o++)i=this.getPoint(o/e),r+=i.distanceTo(s),t.push(r),s=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){const i=this.getLengths();let s=0;const r=i.length;let o;t?o=t:o=e*i[r-1];let a=0,l=r-1,c;for(;a<=l;)if(s=Math.floor(a+(l-a)/2),c=i[s]-o,c<0)a=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,i[s]===o)return s/(r-1);const h=i[s],p=i[s+1]-h,f=(o-h)/p;return(s+f)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);const o=this.getPoint(s),a=this.getPoint(r),l=t||(o.isVector2?new ce:new L);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){const i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t){const i=new L,s=[],r=[],o=[],a=new L,l=new He;for(let f=0;f<=e;f++){const g=f/e;s[f]=this.getTangentAt(g,new L)}r[0]=new L,o[0]=new L;let c=Number.MAX_VALUE;const h=Math.abs(s[0].x),u=Math.abs(s[0].y),p=Math.abs(s[0].z);h<=c&&(c=h,i.set(1,0,0)),u<=c&&(c=u,i.set(0,1,0)),p<=c&&i.set(0,0,1),a.crossVectors(s[0],i).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let f=1;f<=e;f++){if(r[f]=r[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(s[f-1],s[f]),a.length()>Number.EPSILON){a.normalize();const g=Math.acos(Tt(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(a,g))}o[f].crossVectors(s[f],r[f])}if(t===!0){let f=Math.acos(Tt(r[0].dot(r[e]),-1,1));f/=e,s[0].dot(a.crossVectors(r[0],r[e]))>0&&(f=-f);for(let g=1;g<=e;g++)r[g].applyMatrix4(l.makeRotationAxis(s[g],f*g)),o[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class Vo extends ln{constructor(e=0,t=0,i=1,s=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t=new ce){const i=t,s=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);const a=this.aStartAngle+e*r;let l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){const h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),p=l-this.aX,f=c-this.aY;l=p*h-f*u+this.aX,c=p*u+f*h+this.aY}return i.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class Jm extends Vo{constructor(e,t,i,s,r,o){super(e,t,i,i,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}}function Go(){let n=0,e=0,t=0,i=0;function s(r,o,a,l){n=r,e=a,t=-3*r+3*o-2*a-l,i=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){s(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,h,u){let p=(o-r)/c-(a-r)/(c+h)+(a-o)/h,f=(a-o)/h-(l-o)/(h+u)+(l-a)/u;p*=h,f*=h,s(o,a,p,f)},calc:function(r){const o=r*r,a=o*r;return n+e*r+t*o+i*a}}}const Vs=new L,eo=new Go,to=new Go,no=new Go;class Zm extends ln{constructor(e=[],t=!1,i="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=s}getPoint(e,t=new L){const i=t,s=this.points,r=s.length,o=(r-(this.closed?0:1))*e;let a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,h;this.closed||a>0?c=s[(a-1)%r]:(Vs.subVectors(s[0],s[1]).add(s[0]),c=Vs);const u=s[a%r],p=s[(a+1)%r];if(this.closed||a+2<r?h=s[(a+2)%r]:(Vs.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=Vs),this.curveType==="centripetal"||this.curveType==="chordal"){const f=this.curveType==="chordal"?.5:.25;let g=Math.pow(c.distanceToSquared(u),f),y=Math.pow(u.distanceToSquared(p),f),m=Math.pow(p.distanceToSquared(h),f);y<1e-4&&(y=1),g<1e-4&&(g=y),m<1e-4&&(m=y),eo.initNonuniformCatmullRom(c.x,u.x,p.x,h.x,g,y,m),to.initNonuniformCatmullRom(c.y,u.y,p.y,h.y,g,y,m),no.initNonuniformCatmullRom(c.z,u.z,p.z,h.z,g,y,m)}else this.curveType==="catmullrom"&&(eo.initCatmullRom(c.x,u.x,p.x,h.x,this.tension),to.initCatmullRom(c.y,u.y,p.y,h.y,this.tension),no.initCatmullRom(c.z,u.z,p.z,h.z,this.tension));return i.set(eo.calc(l),to.calc(l),no.calc(l)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){const s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const s=e.points[t];this.points.push(new L().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function vl(n,e,t,i,s){const r=(i-e)*.5,o=(s-t)*.5,a=n*n,l=n*a;return(2*t-2*i+r+o)*l+(-3*t+3*i-2*r-o)*a+r*n+t}function $m(n,e){const t=1-n;return t*t*e}function Qm(n,e){return 2*(1-n)*n*e}function e0(n,e){return n*n*e}function ns(n,e,t,i){return $m(n,e)+Qm(n,t)+e0(n,i)}function t0(n,e){const t=1-n;return t*t*t*e}function n0(n,e){const t=1-n;return 3*t*t*n*e}function i0(n,e){return 3*(1-n)*n*n*e}function s0(n,e){return n*n*n*e}function is(n,e,t,i,s){return t0(n,e)+n0(n,t)+i0(n,i)+s0(n,s)}class _c extends ln{constructor(e=new ce,t=new ce,i=new ce,s=new ce){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new ce){const i=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return i.set(is(e,s.x,r.x,o.x,a.x),is(e,s.y,r.y,o.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class r0 extends ln{constructor(e=new L,t=new L,i=new L,s=new L){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new L){const i=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return i.set(is(e,s.x,r.x,o.x,a.x),is(e,s.y,r.y,o.y,a.y),is(e,s.z,r.z,o.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class yc extends ln{constructor(e=new ce,t=new ce){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new ce){const i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new ce){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class o0 extends ln{constructor(e=new L,t=new L){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new L){const i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new L){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class vc extends ln{constructor(e=new ce,t=new ce,i=new ce){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new ce){const i=t,s=this.v0,r=this.v1,o=this.v2;return i.set(ns(e,s.x,r.x,o.x),ns(e,s.y,r.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class bc extends ln{constructor(e=new L,t=new L,i=new L){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new L){const i=t,s=this.v0,r=this.v1,o=this.v2;return i.set(ns(e,s.x,r.x,o.x),ns(e,s.y,r.y,o.y),ns(e,s.z,r.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Mc extends ln{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new ce){const i=t,s=this.points,r=(s.length-1)*e,o=Math.floor(r),a=r-o,l=s[o===0?o:o-1],c=s[o],h=s[o>s.length-2?s.length-1:o+1],u=s[o>s.length-3?s.length-1:o+2];return i.set(vl(a,l.x,c.x,h.x,u.x),vl(a,l.y,c.y,h.y,u.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const s=e.points[t];this.points.push(s.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){const s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const s=e.points[t];this.points.push(new ce().fromArray(s))}return this}}var ir=Object.freeze({__proto__:null,ArcCurve:Jm,CatmullRomCurve3:Zm,CubicBezierCurve:_c,CubicBezierCurve3:r0,EllipseCurve:Vo,LineCurve:yc,LineCurve3:o0,QuadraticBezierCurve:vc,QuadraticBezierCurve3:bc,SplineCurve:Mc});class a0 extends ln{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){const i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new ir[i](t,e))}return this}getPoint(e,t){const i=e*this.getLength(),s=this.getCurveLengths();let r=0;for(;r<s.length;){if(s[r]>=i){const o=s[r]-i,a=this.curves[r],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}r++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let i=0,s=this.curves.length;i<s;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let i;for(let s=0,r=this.curves;s<r.length;s++){const o=r[s],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){const h=l[c];i&&i.equals(h)||(t.push(h),i=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){const s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){const s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){const s=e.curves[t];this.curves.push(new ir[s.type]().fromJSON(s))}return this}}class _o extends a0{constructor(e){super(),this.type="Path",this.currentPoint=new ce,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const i=new yc(this.currentPoint.clone(),new ce(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,s){const r=new vc(this.currentPoint.clone(),new ce(e,t),new ce(i,s));return this.curves.push(r),this.currentPoint.set(i,s),this}bezierCurveTo(e,t,i,s,r,o){const a=new _c(this.currentPoint.clone(),new ce(e,t),new ce(i,s),new ce(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),i=new Mc(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,s,r,o){const a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,i,s,r,o),this}absarc(e,t,i,s,r,o){return this.absellipse(e,t,i,i,s,r,o),this}ellipse(e,t,i,s,r,o,a,l){const c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+c,t+h,i,s,r,o,a,l),this}absellipse(e,t,i,s,r,o,a,l){const c=new Vo(e,t,i,s,r,o,a,l);if(this.curves.length>0){const u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);const h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class Ei extends _t{constructor(e=[new ce(0,-.5),new ce(.5,0),new ce(0,.5)],t=12,i=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:i,phiLength:s},t=Math.floor(t),s=Tt(s,0,Math.PI*2);const r=[],o=[],a=[],l=[],c=[],h=1/t,u=new L,p=new ce,f=new L,g=new L,y=new L;let m=0,d=0;for(let b=0;b<=e.length-1;b++)switch(b){case 0:m=e[b+1].x-e[b].x,d=e[b+1].y-e[b].y,f.x=d*1,f.y=-m,f.z=d*0,y.copy(f),f.normalize(),l.push(f.x,f.y,f.z);break;case e.length-1:l.push(y.x,y.y,y.z);break;default:m=e[b+1].x-e[b].x,d=e[b+1].y-e[b].y,f.x=d*1,f.y=-m,f.z=d*0,g.copy(f),f.x+=y.x,f.y+=y.y,f.z+=y.z,f.normalize(),l.push(f.x,f.y,f.z),y.copy(g)}for(let b=0;b<=t;b++){const v=i+b*h*s,_=Math.sin(v),R=Math.cos(v);for(let w=0;w<=e.length-1;w++){u.x=e[w].x*_,u.y=e[w].y,u.z=e[w].x*R,o.push(u.x,u.y,u.z),p.x=b/t,p.y=w/(e.length-1),a.push(p.x,p.y);const A=l[3*w+0]*_,C=l[3*w+1],S=l[3*w+0]*R;c.push(A,C,S)}}for(let b=0;b<t;b++)for(let v=0;v<e.length-1;v++){const _=v+b*e.length,R=_,w=_+e.length,A=_+e.length+1,C=_+1;r.push(R,w,C),r.push(A,C,w)}this.setIndex(r),this.setAttribute("position",new Ke(o,3)),this.setAttribute("uv",new Ke(a,2)),this.setAttribute("normal",new Ke(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ei(e.points,e.segments,e.phiStart,e.phiLength)}}class pr extends Ei{constructor(e=1,t=1,i=4,s=8){const r=new _o;r.absarc(0,-t/2,e,Math.PI*1.5,0),r.absarc(0,t/2,e,0,Math.PI*.5),super(r.getPoints(i),s),this.type="CapsuleGeometry",this.parameters={radius:e,length:t,capSegments:i,radialSegments:s}}static fromJSON(e){return new pr(e.radius,e.length,e.capSegments,e.radialSegments)}}class Wo extends _t{constructor(e=1,t=32,i=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:i,thetaLength:s},t=Math.max(3,t);const r=[],o=[],a=[],l=[],c=new L,h=new ce;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let u=0,p=3;u<=t;u++,p+=3){const f=i+u/t*s;c.x=e*Math.cos(f),c.y=e*Math.sin(f),o.push(c.x,c.y,c.z),a.push(0,0,1),h.x=(o[p]/e+1)/2,h.y=(o[p+1]/e+1)/2,l.push(h.x,h.y)}for(let u=1;u<=t;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new Ke(o,3)),this.setAttribute("normal",new Ke(a,3)),this.setAttribute("uv",new Ke(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Wo(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class Ze extends _t{constructor(e=1,t=1,i=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};const c=this;s=Math.floor(s),r=Math.floor(r);const h=[],u=[],p=[],f=[];let g=0;const y=[],m=i/2;let d=0;b(),o===!1&&(e>0&&v(!0),t>0&&v(!1)),this.setIndex(h),this.setAttribute("position",new Ke(u,3)),this.setAttribute("normal",new Ke(p,3)),this.setAttribute("uv",new Ke(f,2));function b(){const _=new L,R=new L;let w=0;const A=(t-e)/i;for(let C=0;C<=r;C++){const S=[],M=C/r,I=M*(t-e)+e;for(let z=0;z<=s;z++){const N=z/s,O=N*l+a,X=Math.sin(O),Y=Math.cos(O);R.x=I*X,R.y=-M*i+m,R.z=I*Y,u.push(R.x,R.y,R.z),_.set(X,A,Y).normalize(),p.push(_.x,_.y,_.z),f.push(N,1-M),S.push(g++)}y.push(S)}for(let C=0;C<s;C++)for(let S=0;S<r;S++){const M=y[S][C],I=y[S+1][C],z=y[S+1][C+1],N=y[S][C+1];(e>0||S!==0)&&(h.push(M,I,N),w+=3),(t>0||S!==r-1)&&(h.push(I,z,N),w+=3)}c.addGroup(d,w,0),d+=w}function v(_){const R=g,w=new ce,A=new L;let C=0;const S=_===!0?e:t,M=_===!0?1:-1;for(let z=1;z<=s;z++)u.push(0,m*M,0),p.push(0,M,0),f.push(.5,.5),g++;const I=g;for(let z=0;z<=s;z++){const O=z/s*l+a,X=Math.cos(O),Y=Math.sin(O);A.x=S*Y,A.y=m*M,A.z=S*X,u.push(A.x,A.y,A.z),p.push(0,M,0),w.x=X*.5+.5,w.y=Y*.5*M+.5,f.push(w.x,w.y),g++}for(let z=0;z<s;z++){const N=R+z,O=I+z;_===!0?h.push(O,O+1,N):h.push(O+1,O,N),C+=3}c.addGroup(d,C,_===!0?1:2),d+=C}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ze(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class bi extends Ze{constructor(e=1,t=1,i=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,i,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new bi(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Xo extends _t{constructor(e=[],t=[],i=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:i,detail:s};const r=[],o=[];a(s),c(i),h(),this.setAttribute("position",new Ke(r,3)),this.setAttribute("normal",new Ke(r.slice(),3)),this.setAttribute("uv",new Ke(o,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function a(b){const v=new L,_=new L,R=new L;for(let w=0;w<t.length;w+=3)f(t[w+0],v),f(t[w+1],_),f(t[w+2],R),l(v,_,R,b)}function l(b,v,_,R){const w=R+1,A=[];for(let C=0;C<=w;C++){A[C]=[];const S=b.clone().lerp(_,C/w),M=v.clone().lerp(_,C/w),I=w-C;for(let z=0;z<=I;z++)z===0&&C===w?A[C][z]=S:A[C][z]=S.clone().lerp(M,z/I)}for(let C=0;C<w;C++)for(let S=0;S<2*(w-C)-1;S++){const M=Math.floor(S/2);S%2===0?(p(A[C][M+1]),p(A[C+1][M]),p(A[C][M])):(p(A[C][M+1]),p(A[C+1][M+1]),p(A[C+1][M]))}}function c(b){const v=new L;for(let _=0;_<r.length;_+=3)v.x=r[_+0],v.y=r[_+1],v.z=r[_+2],v.normalize().multiplyScalar(b),r[_+0]=v.x,r[_+1]=v.y,r[_+2]=v.z}function h(){const b=new L;for(let v=0;v<r.length;v+=3){b.x=r[v+0],b.y=r[v+1],b.z=r[v+2];const _=m(b)/2/Math.PI+.5,R=d(b)/Math.PI+.5;o.push(_,1-R)}g(),u()}function u(){for(let b=0;b<o.length;b+=6){const v=o[b+0],_=o[b+2],R=o[b+4],w=Math.max(v,_,R),A=Math.min(v,_,R);w>.9&&A<.1&&(v<.2&&(o[b+0]+=1),_<.2&&(o[b+2]+=1),R<.2&&(o[b+4]+=1))}}function p(b){r.push(b.x,b.y,b.z)}function f(b,v){const _=b*3;v.x=e[_+0],v.y=e[_+1],v.z=e[_+2]}function g(){const b=new L,v=new L,_=new L,R=new L,w=new ce,A=new ce,C=new ce;for(let S=0,M=0;S<r.length;S+=9,M+=6){b.set(r[S+0],r[S+1],r[S+2]),v.set(r[S+3],r[S+4],r[S+5]),_.set(r[S+6],r[S+7],r[S+8]),w.set(o[M+0],o[M+1]),A.set(o[M+2],o[M+3]),C.set(o[M+4],o[M+5]),R.copy(b).add(v).add(_).divideScalar(3);const I=m(R);y(w,M+0,b,I),y(A,M+2,v,I),y(C,M+4,_,I)}}function y(b,v,_,R){R<0&&b.x===1&&(o[v]=b.x-1),_.x===0&&_.z===0&&(o[v]=R/2/Math.PI+.5)}function m(b){return Math.atan2(b.z,-b.x)}function d(b){return Math.atan2(-b.y,Math.sqrt(b.x*b.x+b.z*b.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Xo(e.vertices,e.indices,e.radius,e.details)}}class xc extends _o{constructor(e){super(e),this.uuid=Kt(),this.type="Shape",this.holes=[]}getPointsHoles(e){const t=[];for(let i=0,s=this.holes.length;i<s;i++)t[i]=this.holes[i].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){const s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){const e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,i=this.holes.length;t<i;t++){const s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){const s=e.holes[t];this.holes.push(new _o().fromJSON(s))}return this}}const l0={triangulate:function(n,e,t=2){const i=e&&e.length,s=i?e[0]*t:n.length;let r=Sc(n,0,s,t,!0);const o=[];if(!r||r.next===r.prev)return o;let a,l,c,h,u,p,f;if(i&&(r=f0(n,e,r,t)),n.length>80*t){a=c=n[0],l=h=n[1];for(let g=t;g<s;g+=t)u=n[g],p=n[g+1],u<a&&(a=u),p<l&&(l=p),u>c&&(c=u),p>h&&(h=p);f=Math.max(c-a,h-l),f=f!==0?32767/f:0}return rs(r,o,t,a,l,f,0),o}};function Sc(n,e,t,i,s){let r,o;if(s===w0(n,e,t,i)>0)for(r=e;r<t;r+=i)o=bl(r,n[r],n[r+1],o);else for(r=t-i;r>=e;r-=i)o=bl(r,n[r],n[r+1],o);return o&&mr(o,o.next)&&(as(o),o=o.next),o}function Jn(n,e){if(!n)return n;e||(e=n);let t=n,i;do if(i=!1,!t.steiner&&(mr(t,t.next)||yt(t.prev,t,t.next)===0)){if(as(t),t=e=t.prev,t===t.next)break;i=!0}else t=t.next;while(i||t!==e);return e}function rs(n,e,t,i,s,r,o){if(!n)return;!o&&r&&y0(n,i,s,r);let a=n,l,c;for(;n.prev!==n.next;){if(l=n.prev,c=n.next,r?h0(n,i,s,r):c0(n)){e.push(l.i/t|0),e.push(n.i/t|0),e.push(c.i/t|0),as(n),n=c.next,a=c.next;continue}if(n=c,n===a){o?o===1?(n=u0(Jn(n),e,t),rs(n,e,t,i,s,r,2)):o===2&&d0(n,e,t,i,s,r):rs(Jn(n),e,t,i,s,r,1);break}}}function c0(n){const e=n.prev,t=n,i=n.next;if(yt(e,t,i)>=0)return!1;const s=e.x,r=t.x,o=i.x,a=e.y,l=t.y,c=i.y,h=s<r?s<o?s:o:r<o?r:o,u=a<l?a<c?a:c:l<c?l:c,p=s>r?s>o?s:o:r>o?r:o,f=a>l?a>c?a:c:l>c?l:c;let g=i.next;for(;g!==e;){if(g.x>=h&&g.x<=p&&g.y>=u&&g.y<=f&&_i(s,a,r,l,o,c,g.x,g.y)&&yt(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function h0(n,e,t,i){const s=n.prev,r=n,o=n.next;if(yt(s,r,o)>=0)return!1;const a=s.x,l=r.x,c=o.x,h=s.y,u=r.y,p=o.y,f=a<l?a<c?a:c:l<c?l:c,g=h<u?h<p?h:p:u<p?u:p,y=a>l?a>c?a:c:l>c?l:c,m=h>u?h>p?h:p:u>p?u:p,d=yo(f,g,e,t,i),b=yo(y,m,e,t,i);let v=n.prevZ,_=n.nextZ;for(;v&&v.z>=d&&_&&_.z<=b;){if(v.x>=f&&v.x<=y&&v.y>=g&&v.y<=m&&v!==s&&v!==o&&_i(a,h,l,u,c,p,v.x,v.y)&&yt(v.prev,v,v.next)>=0||(v=v.prevZ,_.x>=f&&_.x<=y&&_.y>=g&&_.y<=m&&_!==s&&_!==o&&_i(a,h,l,u,c,p,_.x,_.y)&&yt(_.prev,_,_.next)>=0))return!1;_=_.nextZ}for(;v&&v.z>=d;){if(v.x>=f&&v.x<=y&&v.y>=g&&v.y<=m&&v!==s&&v!==o&&_i(a,h,l,u,c,p,v.x,v.y)&&yt(v.prev,v,v.next)>=0)return!1;v=v.prevZ}for(;_&&_.z<=b;){if(_.x>=f&&_.x<=y&&_.y>=g&&_.y<=m&&_!==s&&_!==o&&_i(a,h,l,u,c,p,_.x,_.y)&&yt(_.prev,_,_.next)>=0)return!1;_=_.nextZ}return!0}function u0(n,e,t){let i=n;do{const s=i.prev,r=i.next.next;!mr(s,r)&&wc(s,i,i.next,r)&&os(s,r)&&os(r,s)&&(e.push(s.i/t|0),e.push(i.i/t|0),e.push(r.i/t|0),as(i),as(i.next),i=n=r),i=i.next}while(i!==n);return Jn(i)}function d0(n,e,t,i,s,r){let o=n;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&M0(o,a)){let l=Tc(o,a);o=Jn(o,o.next),l=Jn(l,l.next),rs(o,e,t,i,s,r,0),rs(l,e,t,i,s,r,0);return}a=a.next}o=o.next}while(o!==n)}function f0(n,e,t,i){const s=[];let r,o,a,l,c;for(r=0,o=e.length;r<o;r++)a=e[r]*i,l=r<o-1?e[r+1]*i:n.length,c=Sc(n,a,l,i,!1),c===c.next&&(c.steiner=!0),s.push(b0(c));for(s.sort(p0),r=0;r<s.length;r++)t=m0(s[r],t);return t}function p0(n,e){return n.x-e.x}function m0(n,e){const t=g0(n,e);if(!t)return e;const i=Tc(t,n);return Jn(i,i.next),Jn(t,t.next)}function g0(n,e){let t=e,i=-1/0,s;const r=n.x,o=n.y;do{if(o<=t.y&&o>=t.next.y&&t.next.y!==t.y){const p=t.x+(o-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(p<=r&&p>i&&(i=p,s=t.x<t.next.x?t:t.next,p===r))return s}t=t.next}while(t!==e);if(!s)return null;const a=s,l=s.x,c=s.y;let h=1/0,u;t=s;do r>=t.x&&t.x>=l&&r!==t.x&&_i(o<c?r:i,o,l,c,o<c?i:r,o,t.x,t.y)&&(u=Math.abs(o-t.y)/(r-t.x),os(t,n)&&(u<h||u===h&&(t.x>s.x||t.x===s.x&&_0(s,t)))&&(s=t,h=u)),t=t.next;while(t!==a);return s}function _0(n,e){return yt(n.prev,n,e.prev)<0&&yt(e.next,n,n.next)<0}function y0(n,e,t,i){let s=n;do s.z===0&&(s.z=yo(s.x,s.y,e,t,i)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==n);s.prevZ.nextZ=null,s.prevZ=null,v0(s)}function v0(n){let e,t,i,s,r,o,a,l,c=1;do{for(t=n,n=null,r=null,o=0;t;){for(o++,i=t,a=0,e=0;e<c&&(a++,i=i.nextZ,!!i);e++);for(l=c;a>0||l>0&&i;)a!==0&&(l===0||!i||t.z<=i.z)?(s=t,t=t.nextZ,a--):(s=i,i=i.nextZ,l--),r?r.nextZ=s:n=s,s.prevZ=r,r=s;t=i}r.nextZ=null,c*=2}while(o>1);return n}function yo(n,e,t,i,s){return n=(n-t)*s|0,e=(e-i)*s|0,n=(n|n<<8)&16711935,n=(n|n<<4)&252645135,n=(n|n<<2)&858993459,n=(n|n<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,n|e<<1}function b0(n){let e=n,t=n;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==n);return t}function _i(n,e,t,i,s,r,o,a){return(s-o)*(e-a)>=(n-o)*(r-a)&&(n-o)*(i-a)>=(t-o)*(e-a)&&(t-o)*(r-a)>=(s-o)*(i-a)}function M0(n,e){return n.next.i!==e.i&&n.prev.i!==e.i&&!x0(n,e)&&(os(n,e)&&os(e,n)&&S0(n,e)&&(yt(n.prev,n,e.prev)||yt(n,e.prev,e))||mr(n,e)&&yt(n.prev,n,n.next)>0&&yt(e.prev,e,e.next)>0)}function yt(n,e,t){return(e.y-n.y)*(t.x-e.x)-(e.x-n.x)*(t.y-e.y)}function mr(n,e){return n.x===e.x&&n.y===e.y}function wc(n,e,t,i){const s=Ws(yt(n,e,t)),r=Ws(yt(n,e,i)),o=Ws(yt(t,i,n)),a=Ws(yt(t,i,e));return!!(s!==r&&o!==a||s===0&&Gs(n,t,e)||r===0&&Gs(n,i,e)||o===0&&Gs(t,n,i)||a===0&&Gs(t,e,i))}function Gs(n,e,t){return e.x<=Math.max(n.x,t.x)&&e.x>=Math.min(n.x,t.x)&&e.y<=Math.max(n.y,t.y)&&e.y>=Math.min(n.y,t.y)}function Ws(n){return n>0?1:n<0?-1:0}function x0(n,e){let t=n;do{if(t.i!==n.i&&t.next.i!==n.i&&t.i!==e.i&&t.next.i!==e.i&&wc(t,t.next,n,e))return!0;t=t.next}while(t!==n);return!1}function os(n,e){return yt(n.prev,n,n.next)<0?yt(n,e,n.next)>=0&&yt(n,n.prev,e)>=0:yt(n,e,n.prev)<0||yt(n,n.next,e)<0}function S0(n,e){let t=n,i=!1;const s=(n.x+e.x)/2,r=(n.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(i=!i),t=t.next;while(t!==n);return i}function Tc(n,e){const t=new vo(n.i,n.x,n.y),i=new vo(e.i,e.x,e.y),s=n.next,r=e.prev;return n.next=e,e.prev=n,t.next=s,s.prev=t,i.next=t,t.prev=i,r.next=i,i.prev=r,i}function bl(n,e,t,i){const s=new vo(n,e,t);return i?(s.next=i.next,s.prev=i,i.next.prev=s,i.next=s):(s.prev=s,s.next=s),s}function as(n){n.next.prev=n.prev,n.prev.next=n.next,n.prevZ&&(n.prevZ.nextZ=n.nextZ),n.nextZ&&(n.nextZ.prevZ=n.prevZ)}function vo(n,e,t){this.i=n,this.x=e,this.y=t,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function w0(n,e,t,i){let s=0;for(let r=e,o=t-i;r<t;r+=i)s+=(n[o]-n[r])*(n[r+1]+n[o+1]),o=r;return s}class In{static area(e){const t=e.length;let i=0;for(let s=t-1,r=0;r<t;s=r++)i+=e[s].x*e[r].y-e[r].x*e[s].y;return i*.5}static isClockWise(e){return In.area(e)<0}static triangulateShape(e,t){const i=[],s=[],r=[];Ml(e),xl(i,e);let o=e.length;t.forEach(Ml);for(let l=0;l<t.length;l++)s.push(o),o+=t[l].length,xl(i,t[l]);const a=l0.triangulate(i,s);for(let l=0;l<a.length;l+=3)r.push(a.slice(l,l+3));return r}}function Ml(n){const e=n.length;e>2&&n[e-1].equals(n[0])&&n.pop()}function xl(n,e){for(let t=0;t<e.length;t++)n.push(e[t].x),n.push(e[t].y)}class Ec extends _t{constructor(e=new xc([new ce(.5,.5),new ce(-.5,.5),new ce(-.5,-.5),new ce(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];const i=this,s=[],r=[];for(let a=0,l=e.length;a<l;a++){const c=e[a];o(c)}this.setAttribute("position",new Ke(s,3)),this.setAttribute("uv",new Ke(r,2)),this.computeVertexNormals();function o(a){const l=[],c=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,u=t.depth!==void 0?t.depth:1;let p=t.bevelEnabled!==void 0?t.bevelEnabled:!0,f=t.bevelThickness!==void 0?t.bevelThickness:.2,g=t.bevelSize!==void 0?t.bevelSize:f-.1,y=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3;const d=t.extrudePath,b=t.UVGenerator!==void 0?t.UVGenerator:T0;let v,_=!1,R,w,A,C;d&&(v=d.getSpacedPoints(h),_=!0,p=!1,R=d.computeFrenetFrames(h,!1),w=new L,A=new L,C=new L),p||(m=0,f=0,g=0,y=0);const S=a.extractPoints(c);let M=S.shape;const I=S.holes;if(!In.isClockWise(M)){M=M.reverse();for(let K=0,re=I.length;K<re;K++){const D=I[K];In.isClockWise(D)&&(I[K]=D.reverse())}}const N=In.triangulateShape(M,I),O=M;for(let K=0,re=I.length;K<re;K++){const D=I[K];M=M.concat(D)}function X(K,re,D){return re||console.error("THREE.ExtrudeGeometry: vec does not exist"),K.clone().addScaledVector(re,D)}const Y=M.length,se=N.length;function U(K,re,D){let ue,le,ye;const pe=K.x-re.x,De=K.y-re.y,ve=D.x-K.x,P=D.y-K.y,T=pe*pe+De*De,k=pe*P-De*ve;if(Math.abs(k)>Number.EPSILON){const J=Math.sqrt(T),ee=Math.sqrt(ve*ve+P*P),Z=re.x-De/J,Ae=re.y+pe/J,ge=D.x-P/ee,Se=D.y+ve/ee,Je=((ge-Z)*P-(Se-Ae)*ve)/(pe*P-De*ve);ue=Z+pe*Je-K.x,le=Ae+De*Je-K.y;const de=ue*ue+le*le;if(de<=2)return new ce(ue,le);ye=Math.sqrt(de/2)}else{let J=!1;pe>Number.EPSILON?ve>Number.EPSILON&&(J=!0):pe<-Number.EPSILON?ve<-Number.EPSILON&&(J=!0):Math.sign(De)===Math.sign(P)&&(J=!0),J?(ue=-De,le=pe,ye=Math.sqrt(T)):(ue=pe,le=De,ye=Math.sqrt(T/2))}return new ce(ue/ye,le/ye)}const x=[];for(let K=0,re=O.length,D=re-1,ue=K+1;K<re;K++,D++,ue++)D===re&&(D=0),ue===re&&(ue=0),x[K]=U(O[K],O[D],O[ue]);const F=[];let oe,we=x.concat();for(let K=0,re=I.length;K<re;K++){const D=I[K];oe=[];for(let ue=0,le=D.length,ye=le-1,pe=ue+1;ue<le;ue++,ye++,pe++)ye===le&&(ye=0),pe===le&&(pe=0),oe[ue]=U(D[ue],D[ye],D[pe]);F.push(oe),we=we.concat(oe)}for(let K=0;K<m;K++){const re=K/m,D=f*Math.cos(re*Math.PI/2),ue=g*Math.sin(re*Math.PI/2)+y;for(let le=0,ye=O.length;le<ye;le++){const pe=X(O[le],x[le],ue);W(pe.x,pe.y,-D)}for(let le=0,ye=I.length;le<ye;le++){const pe=I[le];oe=F[le];for(let De=0,ve=pe.length;De<ve;De++){const P=X(pe[De],oe[De],ue);W(P.x,P.y,-D)}}}const Fe=g+y;for(let K=0;K<Y;K++){const re=p?X(M[K],we[K],Fe):M[K];_?(A.copy(R.normals[0]).multiplyScalar(re.x),w.copy(R.binormals[0]).multiplyScalar(re.y),C.copy(v[0]).add(A).add(w),W(C.x,C.y,C.z)):W(re.x,re.y,0)}for(let K=1;K<=h;K++)for(let re=0;re<Y;re++){const D=p?X(M[re],we[re],Fe):M[re];_?(A.copy(R.normals[K]).multiplyScalar(D.x),w.copy(R.binormals[K]).multiplyScalar(D.y),C.copy(v[K]).add(A).add(w),W(C.x,C.y,C.z)):W(D.x,D.y,u/h*K)}for(let K=m-1;K>=0;K--){const re=K/m,D=f*Math.cos(re*Math.PI/2),ue=g*Math.sin(re*Math.PI/2)+y;for(let le=0,ye=O.length;le<ye;le++){const pe=X(O[le],x[le],ue);W(pe.x,pe.y,u+D)}for(let le=0,ye=I.length;le<ye;le++){const pe=I[le];oe=F[le];for(let De=0,ve=pe.length;De<ve;De++){const P=X(pe[De],oe[De],ue);_?W(P.x,P.y+v[h-1].y,v[h-1].x+D):W(P.x,P.y,u+D)}}}$(),he();function $(){const K=s.length/3;if(p){let re=0,D=Y*re;for(let ue=0;ue<se;ue++){const le=N[ue];ne(le[2]+D,le[1]+D,le[0]+D)}re=h+m*2,D=Y*re;for(let ue=0;ue<se;ue++){const le=N[ue];ne(le[0]+D,le[1]+D,le[2]+D)}}else{for(let re=0;re<se;re++){const D=N[re];ne(D[2],D[1],D[0])}for(let re=0;re<se;re++){const D=N[re];ne(D[0]+Y*h,D[1]+Y*h,D[2]+Y*h)}}i.addGroup(K,s.length/3-K,0)}function he(){const K=s.length/3;let re=0;ie(O,re),re+=O.length;for(let D=0,ue=I.length;D<ue;D++){const le=I[D];ie(le,re),re+=le.length}i.addGroup(K,s.length/3-K,1)}function ie(K,re){let D=K.length;for(;--D>=0;){const ue=D;let le=D-1;le<0&&(le=K.length-1);for(let ye=0,pe=h+m*2;ye<pe;ye++){const De=Y*ye,ve=Y*(ye+1),P=re+ue+De,T=re+le+De,k=re+le+ve,J=re+ue+ve;Re(P,T,k,J)}}}function W(K,re,D){l.push(K),l.push(re),l.push(D)}function ne(K,re,D){te(K),te(re),te(D);const ue=s.length/3,le=b.generateTopUV(i,s,ue-3,ue-2,ue-1);B(le[0]),B(le[1]),B(le[2])}function Re(K,re,D,ue){te(K),te(re),te(ue),te(re),te(D),te(ue);const le=s.length/3,ye=b.generateSideWallUV(i,s,le-6,le-3,le-2,le-1);B(ye[0]),B(ye[1]),B(ye[3]),B(ye[1]),B(ye[2]),B(ye[3])}function te(K){s.push(l[K*3+0]),s.push(l[K*3+1]),s.push(l[K*3+2])}function B(K){r.push(K.x),r.push(K.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes,i=this.parameters.options;return E0(t,i,e)}static fromJSON(e,t){const i=[];for(let r=0,o=e.shapes.length;r<o;r++){const a=t[e.shapes[r]];i.push(a)}const s=e.options.extrudePath;return s!==void 0&&(e.options.extrudePath=new ir[s.type]().fromJSON(s)),new Ec(i,e.options)}}const T0={generateTopUV:function(n,e,t,i,s){const r=e[t*3],o=e[t*3+1],a=e[i*3],l=e[i*3+1],c=e[s*3],h=e[s*3+1];return[new ce(r,o),new ce(a,l),new ce(c,h)]},generateSideWallUV:function(n,e,t,i,s,r){const o=e[t*3],a=e[t*3+1],l=e[t*3+2],c=e[i*3],h=e[i*3+1],u=e[i*3+2],p=e[s*3],f=e[s*3+1],g=e[s*3+2],y=e[r*3],m=e[r*3+1],d=e[r*3+2];return Math.abs(a-h)<Math.abs(o-c)?[new ce(o,1-l),new ce(c,1-u),new ce(p,1-g),new ce(y,1-d)]:[new ce(a,1-l),new ce(h,1-u),new ce(f,1-g),new ce(m,1-d)]}};function E0(n,e,t){if(t.shapes=[],Array.isArray(n))for(let i=0,s=n.length;i<s;i++){const r=n[i];t.shapes.push(r.uuid)}else t.shapes.push(n.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}class Ac extends Xo{constructor(e=1,t=0){const i=(1+Math.sqrt(5))/2,s=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new Ac(e.radius,e.detail)}}class sr extends _t{constructor(e=.5,t=1,i=32,s=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:s,thetaStart:r,thetaLength:o},i=Math.max(3,i),s=Math.max(1,s);const a=[],l=[],c=[],h=[];let u=e;const p=(t-e)/s,f=new L,g=new ce;for(let y=0;y<=s;y++){for(let m=0;m<=i;m++){const d=r+m/i*o;f.x=u*Math.cos(d),f.y=u*Math.sin(d),l.push(f.x,f.y,f.z),c.push(0,0,1),g.x=(f.x/t+1)/2,g.y=(f.y/t+1)/2,h.push(g.x,g.y)}u+=p}for(let y=0;y<s;y++){const m=y*(i+1);for(let d=0;d<i;d++){const b=d+m,v=b,_=b+i+1,R=b+i+2,w=b+1;a.push(v,_,w),a.push(_,R,w)}}this.setIndex(a),this.setAttribute("position",new Ke(l,3)),this.setAttribute("normal",new Ke(c,3)),this.setAttribute("uv",new Ke(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new sr(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class Rc extends _t{constructor(e=new xc([new ce(0,.5),new ce(-.5,-.5),new ce(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};const i=[],s=[],r=[],o=[];let a=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let h=0;h<e.length;h++)c(e[h]),this.addGroup(a,l,h),a+=l,l=0;this.setIndex(i),this.setAttribute("position",new Ke(s,3)),this.setAttribute("normal",new Ke(r,3)),this.setAttribute("uv",new Ke(o,2));function c(h){const u=s.length/3,p=h.extractPoints(t);let f=p.shape;const g=p.holes;In.isClockWise(f)===!1&&(f=f.reverse());for(let m=0,d=g.length;m<d;m++){const b=g[m];In.isClockWise(b)===!0&&(g[m]=b.reverse())}const y=In.triangulateShape(f,g);for(let m=0,d=g.length;m<d;m++){const b=g[m];f=f.concat(b)}for(let m=0,d=f.length;m<d;m++){const b=f[m];s.push(b.x,b.y,0),r.push(0,0,1),o.push(b.x,b.y)}for(let m=0,d=y.length;m<d;m++){const b=y[m],v=b[0]+u,_=b[1]+u,R=b[2]+u;i.push(v,_,R),l+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes;return A0(t,e)}static fromJSON(e,t){const i=[];for(let s=0,r=e.shapes.length;s<r;s++){const o=t[e.shapes[s]];i.push(o)}return new Rc(i,e.curveSegments)}}function A0(n,e){if(e.shapes=[],Array.isArray(n))for(let t=0,i=n.length;t<i;t++){const s=n[t];e.shapes.push(s.uuid)}else e.shapes.push(n.uuid);return e}class Mt extends _t{constructor(e=1,t=32,i=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));const l=Math.min(o+a,Math.PI);let c=0;const h=[],u=new L,p=new L,f=[],g=[],y=[],m=[];for(let d=0;d<=i;d++){const b=[],v=d/i;let _=0;d===0&&o===0?_=.5/t:d===i&&l===Math.PI&&(_=-.5/t);for(let R=0;R<=t;R++){const w=R/t;u.x=-e*Math.cos(s+w*r)*Math.sin(o+v*a),u.y=e*Math.cos(o+v*a),u.z=e*Math.sin(s+w*r)*Math.sin(o+v*a),g.push(u.x,u.y,u.z),p.copy(u).normalize(),y.push(p.x,p.y,p.z),m.push(w+_,1-v),b.push(c++)}h.push(b)}for(let d=0;d<i;d++)for(let b=0;b<t;b++){const v=h[d][b+1],_=h[d][b],R=h[d+1][b],w=h[d+1][b+1];(d!==0||o>0)&&f.push(v,_,w),(d!==i-1||l<Math.PI)&&f.push(_,R,w)}this.setIndex(f),this.setAttribute("position",new Ke(g,3)),this.setAttribute("normal",new Ke(y,3)),this.setAttribute("uv",new Ke(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Mt(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class nn extends _t{constructor(e=1,t=.4,i=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:i,tubularSegments:s,arc:r},i=Math.floor(i),s=Math.floor(s);const o=[],a=[],l=[],c=[],h=new L,u=new L,p=new L;for(let f=0;f<=i;f++)for(let g=0;g<=s;g++){const y=g/s*r,m=f/i*Math.PI*2;u.x=(e+t*Math.cos(m))*Math.cos(y),u.y=(e+t*Math.cos(m))*Math.sin(y),u.z=t*Math.sin(m),a.push(u.x,u.y,u.z),h.x=e*Math.cos(y),h.y=e*Math.sin(y),p.subVectors(u,h).normalize(),l.push(p.x,p.y,p.z),c.push(g/s),c.push(f/i)}for(let f=1;f<=i;f++)for(let g=1;g<=s;g++){const y=(s+1)*f+g-1,m=(s+1)*(f-1)+g-1,d=(s+1)*(f-1)+g,b=(s+1)*f+g;o.push(y,m,b),o.push(m,d,b)}this.setIndex(o),this.setAttribute("position",new Ke(a,3)),this.setAttribute("normal",new Ke(l,3)),this.setAttribute("uv",new Ke(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new nn(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class Cc extends _t{constructor(e=new bc(new L(-1,-1,0),new L(-1,1,0),new L(1,1,0)),t=64,i=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:i,radialSegments:s,closed:r};const o=e.computeFrenetFrames(t,r);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;const a=new L,l=new L,c=new ce;let h=new L;const u=[],p=[],f=[],g=[];y(),this.setIndex(g),this.setAttribute("position",new Ke(u,3)),this.setAttribute("normal",new Ke(p,3)),this.setAttribute("uv",new Ke(f,2));function y(){for(let v=0;v<t;v++)m(v);m(r===!1?t:0),b(),d()}function m(v){h=e.getPointAt(v/t,h);const _=o.normals[v],R=o.binormals[v];for(let w=0;w<=s;w++){const A=w/s*Math.PI*2,C=Math.sin(A),S=-Math.cos(A);l.x=S*_.x+C*R.x,l.y=S*_.y+C*R.y,l.z=S*_.z+C*R.z,l.normalize(),p.push(l.x,l.y,l.z),a.x=h.x+i*l.x,a.y=h.y+i*l.y,a.z=h.z+i*l.z,u.push(a.x,a.y,a.z)}}function d(){for(let v=1;v<=t;v++)for(let _=1;_<=s;_++){const R=(s+1)*(v-1)+(_-1),w=(s+1)*v+(_-1),A=(s+1)*v+_,C=(s+1)*(v-1)+_;g.push(R,w,C),g.push(w,A,C)}}function b(){for(let v=0;v<=t;v++)for(let _=0;_<=s;_++)c.x=v/t,c.y=_/s,f.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new Cc(new ir[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}}class St extends Mn{static get type(){return"MeshStandardMaterial"}constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new Ne(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ne(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new ce(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new sn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class fy extends St{static get type(){return"MeshPhysicalMaterial"}constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new ce(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Tt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Ne(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Ne(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Ne(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class R0 extends Mn{static get type(){return"MeshToonMaterial"}constructor(e){super(),this.isMeshToonMaterial=!0,this.defines={TOON:""},this.color=new Ne(16777215),this.map=null,this.gradientMap=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ne(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new ce(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.gradientMap=e.gradientMap,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.alphaMap=e.alphaMap,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}function Xs(n,e,t){return!n||!t&&n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}function C0(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function P0(n){function e(s,r){return n[s]-n[r]}const t=n.length,i=new Array(t);for(let s=0;s!==t;++s)i[s]=s;return i.sort(e),i}function Sl(n,e,t){const i=n.length,s=new n.constructor(i);for(let r=0,o=0;o!==i;++r){const a=t[r]*e;for(let l=0;l!==e;++l)s[o++]=n[a+l]}return s}function Pc(n,e,t,i){let s=1,r=n[0];for(;r!==void 0&&r[i]===void 0;)r=n[s++];if(r===void 0)return;let o=r[i];if(o!==void 0)if(Array.isArray(o))do o=r[i],o!==void 0&&(e.push(r.time),t.push.apply(t,o)),r=n[s++];while(r!==void 0);else if(o.toArray!==void 0)do o=r[i],o!==void 0&&(e.push(r.time),o.toArray(t,t.length)),r=n[s++];while(r!==void 0);else do o=r[i],o!==void 0&&(e.push(r.time),t.push(o)),r=n[s++];while(r!==void 0)}class gr{constructor(e,t,i,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let i=this._cachedIndex,s=t[i],r=t[i-1];n:{e:{let o;t:{i:if(!(e<s)){for(let a=i+2;;){if(s===void 0){if(e<r)break i;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(r=s,s=t[++i],e<s)break e}o=t.length;break t}if(!(e>=r)){const a=t[1];e<a&&(i=2,r=a);for(let l=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(s=r,r=t[--i-1],e>=r)break e}o=i,i=0;break t}break n}for(;i<o;){const a=i+o>>>1;e<t[a]?o=a:i=a+1}if(s=t[i],r=t[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,s)}return this.interpolate_(i,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,i=this.sampleValues,s=this.valueSize,r=e*s;for(let o=0;o!==s;++o)t[o]=i[r+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}}class L0 extends gr{constructor(e,t,i,s){super(e,t,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:2400,endingEnd:2400}}intervalChanged_(e,t,i){const s=this.parameterPositions;let r=e-2,o=e+1,a=s[r],l=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case 2401:r=e,a=2*t-i;break;case 2402:r=s.length-2,a=t+s[r]-s[r+1];break;default:r=e,a=i}if(l===void 0)switch(this.getSettings_().endingEnd){case 2401:o=e,l=2*i-t;break;case 2402:o=1,l=i+s[1]-s[0];break;default:o=e-1,l=t}const c=(i-t)*.5,h=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-i),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(e,t,i,s){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=this._offsetPrev,u=this._offsetNext,p=this._weightPrev,f=this._weightNext,g=(i-t)/(s-t),y=g*g,m=y*g,d=-p*m+2*p*y-p*g,b=(1+p)*m+(-1.5-2*p)*y+(-.5+p)*g+1,v=(-1-f)*m+(1.5+f)*y+.5*g,_=f*m-f*y;for(let R=0;R!==a;++R)r[R]=d*o[h+R]+b*o[c+R]+v*o[l+R]+_*o[u+R];return r}}class I0 extends gr{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=(i-t)/(s-t),u=1-h;for(let p=0;p!==a;++p)r[p]=o[c+p]*u+o[l+p]*h;return r}}class D0 extends gr{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e){return this.copySampleValue_(e-1)}}class cn{constructor(e,t,i,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Xs(t,this.TimeBufferType),this.values=Xs(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:Xs(e.times,Array),values:Xs(e.values,Array)};const s=e.getInterpolation();s!==e.DefaultInterpolation&&(i.interpolation=s)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new D0(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new I0(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new L0(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case 2300:t=this.InterpolantFactoryMethodDiscrete;break;case 2301:t=this.InterpolantFactoryMethodLinear;break;case 2302:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){const i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return console.warn("THREE.KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return 2300;case this.InterpolantFactoryMethodLinear:return 2301;case this.InterpolantFactoryMethodSmooth:return 2302}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]*=e}return this}trim(e,t){const i=this.times,s=i.length;let r=0,o=s-1;for(;r!==s&&i[r]<e;)++r;for(;o!==-1&&i[o]>t;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);const a=this.getValueSize();this.times=i.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);const i=this.times,s=this.values,r=i.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){const l=i[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(s!==void 0&&C0(s))for(let a=0,l=s.length;a!==l;++a){const c=s[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===2302,r=e.length-1;let o=1;for(let a=1;a<r;++a){let l=!1;const c=e[a],h=e[a+1];if(c!==h&&(a!==1||c!==e[0]))if(s)l=!0;else{const u=a*i,p=u-i,f=u+i;for(let g=0;g!==i;++g){const y=t[u+g];if(y!==t[p+g]||y!==t[f+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];const u=a*i,p=o*i;for(let f=0;f!==i;++f)t[p+f]=t[u+f]}++o}}if(r>0){e[o]=e[r];for(let a=r*i,l=o*i,c=0;c!==i;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*i)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),i=this.constructor,s=new i(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}}cn.prototype.TimeBufferType=Float32Array;cn.prototype.ValueBufferType=Float32Array;cn.prototype.DefaultInterpolation=2301;class Ii extends cn{constructor(e,t,i){super(e,t,i)}}Ii.prototype.ValueTypeName="bool";Ii.prototype.ValueBufferType=Array;Ii.prototype.DefaultInterpolation=2300;Ii.prototype.InterpolantFactoryMethodLinear=void 0;Ii.prototype.InterpolantFactoryMethodSmooth=void 0;class Lc extends cn{}Lc.prototype.ValueTypeName="color";class rr extends cn{}rr.prototype.ValueTypeName="number";class N0 extends gr{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(i-t)/(s-t);let c=e*a;for(let h=c+a;c!==h;c+=4)gt.slerpFlat(r,0,o,c-a,o,c,l);return r}}class _r extends cn{InterpolantFactoryMethodLinear(e){return new N0(this.times,this.values,this.getValueSize(),e)}}_r.prototype.ValueTypeName="quaternion";_r.prototype.InterpolantFactoryMethodSmooth=void 0;class Di extends cn{constructor(e,t,i){super(e,t,i)}}Di.prototype.ValueTypeName="string";Di.prototype.ValueBufferType=Array;Di.prototype.DefaultInterpolation=2300;Di.prototype.InterpolantFactoryMethodLinear=void 0;Di.prototype.InterpolantFactoryMethodSmooth=void 0;class or extends cn{}or.prototype.ValueTypeName="vector";class py{constructor(e="",t=-1,i=[],s=2500){this.name=e,this.tracks=i,this.duration=t,this.blendMode=s,this.uuid=Kt(),this.duration<0&&this.resetDuration()}static parse(e){const t=[],i=e.tracks,s=1/(e.fps||1);for(let o=0,a=i.length;o!==a;++o)t.push(k0(i[o]).scale(s));const r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r}static toJSON(e){const t=[],i=e.tracks,s={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode};for(let r=0,o=i.length;r!==o;++r)t.push(cn.toJSON(i[r]));return s}static CreateFromMorphTargetSequence(e,t,i,s){const r=t.length,o=[];for(let a=0;a<r;a++){let l=[],c=[];l.push((a+r-1)%r,a,(a+1)%r),c.push(0,1,0);const h=P0(l);l=Sl(l,1,h),c=Sl(c,1,h),!s&&l[0]===0&&(l.push(r),c.push(c[0])),o.push(new rr(".morphTargetInfluences["+t[a].name+"]",l,c).scale(1/i))}return new this(e,-1,o)}static findByName(e,t){let i=e;if(!Array.isArray(e)){const s=e;i=s.geometry&&s.geometry.animations||s.animations}for(let s=0;s<i.length;s++)if(i[s].name===t)return i[s];return null}static CreateClipsFromMorphTargetSequences(e,t,i){const s={},r=/^([\w-]*?)([\d]+)$/;for(let a=0,l=e.length;a<l;a++){const c=e[a],h=c.name.match(r);if(h&&h.length>1){const u=h[1];let p=s[u];p||(s[u]=p=[]),p.push(c)}}const o=[];for(const a in s)o.push(this.CreateFromMorphTargetSequence(a,s[a],t,i));return o}static parseAnimation(e,t){if(!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;const i=function(u,p,f,g,y){if(f.length!==0){const m=[],d=[];Pc(f,m,d,g),m.length!==0&&y.push(new u(p,m,d))}},s=[],r=e.name||"default",o=e.fps||30,a=e.blendMode;let l=e.length||-1;const c=e.hierarchy||[];for(let u=0;u<c.length;u++){const p=c[u].keys;if(!(!p||p.length===0))if(p[0].morphTargets){const f={};let g;for(g=0;g<p.length;g++)if(p[g].morphTargets)for(let y=0;y<p[g].morphTargets.length;y++)f[p[g].morphTargets[y]]=-1;for(const y in f){const m=[],d=[];for(let b=0;b!==p[g].morphTargets.length;++b){const v=p[g];m.push(v.time),d.push(v.morphTarget===y?1:0)}s.push(new rr(".morphTargetInfluence["+y+"]",m,d))}l=f.length*o}else{const f=".bones["+t[u].name+"]";i(or,f+".position",p,"pos",s),i(_r,f+".quaternion",p,"rot",s),i(or,f+".scale",p,"scl",s)}}return s.length===0?null:new this(r,l,s,a)}resetDuration(){const e=this.tracks;let t=0;for(let i=0,s=e.length;i!==s;++i){const r=this.tracks[i];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());return new this.constructor(this.name,this.duration,e,this.blendMode)}toJSON(){return this.constructor.toJSON(this)}}function U0(n){switch(n.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return rr;case"vector":case"vector2":case"vector3":case"vector4":return or;case"color":return Lc;case"quaternion":return _r;case"bool":case"boolean":return Ii;case"string":return Di}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+n)}function k0(n){if(n.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=U0(n.type);if(n.times===void 0){const t=[],i=[];Pc(n.keys,t,i,"value"),n.times=t,n.values=i}return e.parse!==void 0?e.parse(n):new e(n.name,n.times,n.values,n.interpolation)}const Ln={enabled:!1,files:{},add:function(n,e){this.enabled!==!1&&(this.files[n]=e)},get:function(n){if(this.enabled!==!1)return this.files[n]},remove:function(n){delete this.files[n]},clear:function(){this.files={}}};class F0{constructor(e,t,i){const s=this;let r=!1,o=0,a=0,l;const c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this.itemStart=function(h){a++,r===!1&&s.onStart!==void 0&&s.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,s.onProgress!==void 0&&s.onProgress(h,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){const u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,p=c.length;u<p;u+=2){const f=c[u],g=c[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return g}return null}}}const O0=new F0;class Ni{constructor(e){this.manager=e!==void 0?e:O0,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const i=this;return new Promise(function(s,r){i.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}}Ni.DEFAULT_MATERIAL_NAME="__DEFAULT";const _n={};class B0 extends Error{constructor(e,t){super(e),this.response=t}}class z0 extends Ni{constructor(e){super(e)}load(e,t,i,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=Ln.get(e);if(r!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0),r;if(_n[e]!==void 0){_n[e].push({onLoad:t,onProgress:i,onError:s});return}_n[e]=[],_n[e].push({onLoad:t,onProgress:i,onError:s});const o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin"}),a=this.mimeType,l=this.responseType;fetch(o).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;const h=_n[e],u=c.body.getReader(),p=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),f=p?parseInt(p):0,g=f!==0;let y=0;const m=new ReadableStream({start(d){b();function b(){u.read().then(({done:v,value:_})=>{if(v)d.close();else{y+=_.byteLength;const R=new ProgressEvent("progress",{lengthComputable:g,loaded:y,total:f});for(let w=0,A=h.length;w<A;w++){const C=h[w];C.onProgress&&C.onProgress(R)}d.enqueue(_),b()}},v=>{d.error(v)})}}});return new Response(m)}else throw new B0(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(h=>new DOMParser().parseFromString(h,a));case"json":return c.json();default:if(a===void 0)return c.text();{const u=/charset="?([^;"\s]*)"?/i.exec(a),p=u&&u[1]?u[1].toLowerCase():void 0,f=new TextDecoder(p);return c.arrayBuffer().then(g=>f.decode(g))}}}).then(c=>{Ln.add(e,c);const h=_n[e];delete _n[e];for(let u=0,p=h.length;u<p;u++){const f=h[u];f.onLoad&&f.onLoad(c)}}).catch(c=>{const h=_n[e];if(h===void 0)throw this.manager.itemError(e),c;delete _n[e];for(let u=0,p=h.length;u<p;u++){const f=h[u];f.onError&&f.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}}class H0 extends Ni{constructor(e){super(e)}load(e,t,i,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,o=Ln.get(e);if(o!==void 0)return r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o;const a=ss("img");function l(){h(),Ln.add(e,this),t&&t(this),r.manager.itemEnd(e)}function c(u){h(),s&&s(u),r.manager.itemError(e),r.manager.itemEnd(e)}function h(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),r.manager.itemStart(e),a.src=e,a}}class my extends Ni{constructor(e){super(e)}load(e,t,i,s){const r=this,o=new fr,a=new z0(this.manager);return a.setResponseType("arraybuffer"),a.setRequestHeader(this.requestHeader),a.setPath(this.path),a.setWithCredentials(r.withCredentials),a.load(e,function(l){let c;try{c=r.parse(l)}catch(h){if(s!==void 0)s(h);else{console.error(h);return}}c.image!==void 0?o.image=c.image:c.data!==void 0&&(o.image.width=c.width,o.image.height=c.height,o.image.data=c.data),o.wrapS=c.wrapS!==void 0?c.wrapS:1001,o.wrapT=c.wrapT!==void 0?c.wrapT:1001,o.magFilter=c.magFilter!==void 0?c.magFilter:1006,o.minFilter=c.minFilter!==void 0?c.minFilter:1006,o.anisotropy=c.anisotropy!==void 0?c.anisotropy:1,c.colorSpace!==void 0&&(o.colorSpace=c.colorSpace),c.flipY!==void 0&&(o.flipY=c.flipY),c.format!==void 0&&(o.format=c.format),c.type!==void 0&&(o.type=c.type),c.mipmaps!==void 0&&(o.mipmaps=c.mipmaps,o.minFilter=1008),c.mipmapCount===1&&(o.minFilter=1006),c.generateMipmaps!==void 0&&(o.generateMipmaps=c.generateMipmaps),o.needsUpdate=!0,t&&t(o,c)},i,s),o}}class V0 extends Ni{constructor(e){super(e)}load(e,t,i,s){const r=new Ct,o=new H0(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},i,s),r}}class yr extends vt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ne(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}class gy extends yr{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(vt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ne(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const io=new He,wl=new L,Tl=new L;class Yo{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ce(512,512),this.map=null,this.mapPass=null,this.matrix=new He,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Bo,this._frameExtents=new ce(1,1),this._viewportCount=1,this._viewports=[new tt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,i=this.matrix;wl.setFromMatrixPosition(e.matrixWorld),t.position.copy(wl),Tl.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Tl),t.updateMatrixWorld(),io.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(io),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(io)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class G0 extends Yo{constructor(){super(new Wt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1}updateMatrices(e){const t=this.camera,i=wi*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height,r=e.distance||t.far;(i!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=i,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class _y extends yr{constructor(e,t,i=0,s=Math.PI/3,r=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(vt.DEFAULT_UP),this.updateMatrix(),this.target=new vt,this.distance=i,this.angle=s,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new G0}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}const El=new He,ji=new L,so=new L;class W0 extends Yo{constructor(){super(new Wt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new ce(4,2),this._viewportCount=6,this._viewports=[new tt(2,1,1,1),new tt(0,1,1,1),new tt(3,1,1,1),new tt(1,1,1,1),new tt(3,0,1,1),new tt(1,0,1,1)],this._cubeDirections=[new L(1,0,0),new L(-1,0,0),new L(0,0,1),new L(0,0,-1),new L(0,1,0),new L(0,-1,0)],this._cubeUps=[new L(0,1,0),new L(0,1,0),new L(0,1,0),new L(0,1,0),new L(0,0,1),new L(0,0,-1)]}updateMatrices(e,t=0){const i=this.camera,s=this.matrix,r=e.distance||i.far;r!==i.far&&(i.far=r,i.updateProjectionMatrix()),ji.setFromMatrixPosition(e.matrixWorld),i.position.copy(ji),so.copy(i.position),so.add(this._cubeDirections[t]),i.up.copy(this._cubeUps[t]),i.lookAt(so),i.updateMatrixWorld(),s.makeTranslation(-ji.x,-ji.y,-ji.z),El.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),this._frustum.setFromProjectionMatrix(El)}}class yy extends yr{constructor(e,t,i=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=s,this.shadow=new W0}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class X0 extends Yo{constructor(){super(new sc(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class vy extends yr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(vt.DEFAULT_UP),this.updateMatrix(),this.target=new vt,this.shadow=new X0}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class by{static decodeText(e){if(console.warn("THREE.LoaderUtils: decodeText() has been deprecated with r165 and will be removed with r175. Use TextDecoder instead."),typeof TextDecoder<"u")return new TextDecoder().decode(e);let t="";for(let i=0,s=e.length;i<s;i++)t+=String.fromCharCode(e[i]);try{return decodeURIComponent(escape(t))}catch{return t}}static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}class My extends Ni{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"}}setOptions(e){return this.options=e,this}load(e,t,i,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,o=Ln.get(e);if(o!==void 0){if(r.manager.itemStart(e),o.then){o.then(c=>{t&&t(c),r.manager.itemEnd(e)}).catch(c=>{s&&s(c)});return}return setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o}const a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader;const l=fetch(e,a).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign(r.options,{colorSpaceConversion:"none"}))}).then(function(c){return Ln.add(e,c),t&&t(c),r.manager.itemEnd(e),c}).catch(function(c){s&&s(c),Ln.remove(e),r.manager.itemError(e),r.manager.itemEnd(e)});Ln.add(e,l),r.manager.itemStart(e)}}class xy{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=Al(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=Al();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}function Al(){return performance.now()}const qo="\\[\\]\\.:\\/",Y0=new RegExp("["+qo+"]","g"),jo="[^"+qo+"]",q0="[^"+qo.replace("\\.","")+"]",j0=/((?:WC+[\/:])*)/.source.replace("WC",jo),K0=/(WCOD+)?/.source.replace("WCOD",q0),J0=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",jo),Z0=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",jo),$0=new RegExp("^"+j0+K0+J0+Z0+"$"),Q0=["material","materials","bones","map"];class eg{constructor(e,t,i){const s=i||ct.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();const i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(e,t)}setValue(e,t){const i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=i.length;s!==r;++s)i[s].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}}class ct{constructor(e,t,i){this.path=t,this.parsedPath=i||ct.parseTrackName(t),this.node=ct.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new ct.Composite(e,t,i):new ct(e,t,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Y0,"")}static parseTrackName(e){const t=$0.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){const r=i.nodeName.substring(s+1);Q0.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){const i=function(r){for(let o=0;o<r.length;o++){const a=r[o];if(a.name===t||a.uuid===t)return a;const l=i(a.children);if(l)return l}return null},s=i(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)e[t++]=i[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,i=t.objectName,s=t.propertyName;let r=t.propertyIndex;if(e||(e=ct.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=t.objectIndex;switch(i){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}const o=e[s];if(o===void 0){const c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}ct.Composite=eg;ct.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ct.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ct.prototype.GetterByBindingType=[ct.prototype._getValue_direct,ct.prototype._getValue_array,ct.prototype._getValue_arrayElement,ct.prototype._getValue_toArray];ct.prototype.SetterByBindingTypeAndVersioning=[[ct.prototype._setValue_direct,ct.prototype._setValue_direct_setNeedsUpdate,ct.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ct.prototype._setValue_array,ct.prototype._setValue_array_setNeedsUpdate,ct.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ct.prototype._setValue_arrayElement,ct.prototype._setValue_arrayElement_setNeedsUpdate,ct.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ct.prototype._setValue_fromArray,ct.prototype._setValue_fromArray_setNeedsUpdate,ct.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];const Rl=new He;class Sy{constructor(e,t,i=0,s=1/0){this.ray=new ls(e,t),this.near=i,this.far=s,this.camera=null,this.layers=new ko,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Rl.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Rl),this}intersectObject(e,t=!0,i=[]){return bo(e,this,i,t),i.sort(Cl),i}intersectObjects(e,t=!0,i=[]){for(let s=0,r=e.length;s<r;s++)bo(e[s],this,i,t);return i.sort(Cl),i}}function Cl(n,e){return n.distance-e.distance}function bo(n,e,t,i){let s=!0;if(n.layers.test(e.layers)&&n.raycast(e,t)===!1&&(s=!1),s===!0&&i===!0){const r=n.children;for(let o=0,a=r.length;o<a;o++)bo(r[o],e,t,!0)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"170"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="170");const wy={minX:77,maxX:103,minZ:94,maxZ:134},Ty={id:"island-shopping-lane",peninsula:!0,width:6,surface:"asphalt",points:[[89,87],[90,96],[90,128]]},Ey=(n,e)=>n>=77&&n<=103&&e>=94&&e<=134,tg=Object.freeze({top:"jacket",topColour:"#eee8da",pattern:"none",bottom:"skirt",bottomColour:"#9b2834",bottomPattern:"plaid",footwear:"boots",shoes:"#704431",accent:"#e7c887",hat:"none"});function Ks(n,e=!1){const t=n[0].index!==null,i=new Set(Object.keys(n[0].attributes)),s=new Set(Object.keys(n[0].morphAttributes)),r={},o={},a=n[0].morphTargetsRelative,l=new _t;let c=0;for(let h=0;h<n.length;++h){const u=n[h];let p=0;if(t!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const f in u.attributes){if(!i.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+f+'" attribute exists among all geometries, or in none of them.'),null;r[f]===void 0&&(r[f]=[]),r[f].push(u.attributes[f]),p++}if(p!==i.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(a!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const f in u.morphAttributes){if(!s.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;o[f]===void 0&&(o[f]=[]),o[f].push(u.morphAttributes[f])}if(e){let f;if(t)f=u.index.count;else if(u.attributes.position!==void 0)f=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,f,h),c+=f}}if(t){let h=0;const u=[];for(let p=0;p<n.length;++p){const f=n[p].index;for(let g=0;g<f.count;++g)u.push(f.getX(g)+h);h+=n[p].attributes.position.count}l.setIndex(u)}for(const h in r){const u=Pl(r[h]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,u)}for(const h in o){const u=o[h][0].length;if(u===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let p=0;p<u;++p){const f=[];for(let y=0;y<o[h].length;++y)f.push(o[h][y][p]);const g=Pl(f);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(g)}}return l}function Pl(n){let e,t,i,s=-1,r=0;for(let c=0;c<n.length;++c){const h=n[c];if(e===void 0&&(e=h.array.constructor),e!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=h.itemSize),t!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(i===void 0&&(i=h.normalized),i!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=h.gpuType),s!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.count*t}const o=new e(r),a=new Pt(o,t,i);let l=0;for(let c=0;c<n.length;++c){const h=n[c];if(h.isInterleavedBufferAttribute){const u=l/t;for(let p=0,f=h.count;p<f;p++)for(let g=0;g<t;g++){const y=h.getComponent(p,g);a.setComponent(p+u,g,y)}}else o.set(h.array,l);l+=h.count*t}return s!==void 0&&(a.gpuType=s),a}function Ay(n,e){if(e===0)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),n;if(e===2||e===1){let t=n.getIndex();if(t===null){const o=[],a=n.getAttribute("position");if(a!==void 0){for(let l=0;l<a.count;l++)o.push(l);n.setIndex(o),t=n.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),n}const i=t.count-2,s=[];if(e===2)for(let o=1;o<=i;o++)s.push(t.getX(0)),s.push(t.getX(o)),s.push(t.getX(o+1));else for(let o=0;o<i;o++)o%2===0?(s.push(t.getX(o)),s.push(t.getX(o+1)),s.push(t.getX(o+2))):(s.push(t.getX(o+2)),s.push(t.getX(o+1)),s.push(t.getX(o)));s.length/3!==i&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");const r=n.clone();return r.setIndex(s),r.clearGroups(),r}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),n}const Ko=Object.freeze(["oval","round","square","narrow","heart"]),Ll={oval:[.94,1.08,.22],round:[1.03,1.01,.1],square:[1.03,1.02,-.16],narrow:[.84,1.16,.25],heart:[1.01,1.07,.37]};function ng(n){const[e,t,i]=Ll[n.form]||Ll.oval;return{width:e+(n.shape-.5)*.12,height:t-(n.shape-.5)*.1,taper:i+(n.jaw-.5)*-.22,cheek:(n.cheeks-.5)*.13}}function hs(n,e){const t=n.y,i=Math.max(0,Math.min(1,(-t-.12)/.78)),s=Math.exp(-(((t+.16)/.32)**2))*e.cheek;return n.x*=1-e.taper*i+s,n.z>0&&(n.z*=1-.08*Math.max(0,1-Math.abs(t)*1.4)),n}const ig=Object.freeze({skin:Object.freeze(["#f7dcc4","#f1cfae","#e8bf98","#dca97e","#c98d62","#b27449","#8f5a38","#6b4029"]),hair:Object.freeze(["#1c1714","#3a2618","#5a3a22","#8a5a2e","#c08a4a","#e0c078","#9a9a96","#d8d6d0","#b8412e","#3d4f8a"]),eyes:Object.freeze(["#2a1d16","#5a3a22","#3d6a8a","#4a7a4a","#6a5a8a","#1c1c24"]),cloth:Object.freeze(["#f4f1ea","#d8342c","#e8742a","#f4d23c","#8fbf4a","#2a8a5a","#3fa0c8","#2f5f9e","#27304d","#8a4ab8","#e98aa6","#9a6a42","#6d7478","#2b2b2b","#c8b48a","#7fb0d8"]),lips:Object.freeze(["#b8544a","#a8433e","#cc3d52","#e06a7a","#d8342c","#8a3a3a"])}),sg=Object.freeze(["child","teen","adult","elder"]),Ic=n=>Number.isFinite(+n)?n<13?"child":n<19?"teen":n>=65?"elder":"adult":"adult",ft=Object.freeze({silhouette:Object.freeze(["neutral","feminine","masculine"]),head:Ko,hair:Object.freeze(["crop","sidepart","bob","long","ponytail","braids","bun","spiky","perm","buzz","afro","horseshoe","bald"]),eyes:Object.freeze(["round","dot","almond","sleepy","lashes","narrow","sparkle","gentle"]),brows:Object.freeze(["straight","arched","thick","thin","worried","bushy","none"]),nose:Object.freeze(["button","dot","line","wide","hook","none"]),mouth:Object.freeze(["smile","flat","grin","small","wide","smirk","pout"]),glasses:Object.freeze(["none","round","square","sun","half"]),facial:Object.freeze(["none","moustache","walrus","stubble","beard","goatee"]),top:Object.freeze(["tank","tee","kariyushi","polo","blouse","jacket","apron","smock","sailor","hoodie","cardigan","overalls","sundress","festival","lighthouse","lantern","reef"]),bottom:Object.freeze(["underwear","shorts","trousers","skirt","longskirt","widepants","cropped","culottes","pleatedskirt"]),footwear:Object.freeze(["barefoot","sneakers","sandals","shoes","boots"]),hat:Object.freeze(["none","cap","captain","police","helmet","straw","headband","kerchief","beanie","beret","bucket","ribbon","squid","teapot","sunflower","paperboat","mountain"]),earrings:Object.freeze(["none","studs","hoops"]),neckwear:Object.freeze(["none","pendant","scarf"])}),rg=(n,e=0,t=1)=>Math.min(t,Math.max(e,Number.isFinite(+n)?+n:e)),Nt=(n,e,t)=>n.includes(e)?e:t??n[0],og=n=>/^#[0-9a-f]{6}$/i.test(String(n))?String(n).toLowerCase():null,ag=Object.freeze({v:1,name:"",age:"adult",body:Object.freeze({height:.5,build:.5,silhouette:"neutral",skin:"#e8bf98"}),head:Object.freeze({size:.5,shape:.5,form:"oval",jaw:.5,cheeks:.5}),hair:Object.freeze({style:"crop",colour:"#1c1714",flip:!1}),eyes:Object.freeze({style:"round",colour:"#2a1d16",size:.5,width:.5,spacing:.5,height:.5,tilt:.5}),brows:Object.freeze({style:"straight",colour:"#1c1714",size:.5,spacing:.5,height:.5,tilt:.5}),nose:Object.freeze({style:"button",size:.5,height:.5,x:.5}),mouth:Object.freeze({style:"smile",colour:"#b8544a",size:.5,width:.5,height:.5,x:.5}),glasses:Object.freeze({style:"none",colour:"#2b2b2b"}),facial:Object.freeze({style:"none",colour:"#1c1714"}),blush:.25,freckles:!1,mole:!1,wrinkles:0,outfit:Object.freeze({top:"tank",topColour:"#f4f1ea",pattern:"none",bottom:"underwear",bottomColour:"#7fb0d8",footwear:"barefoot",shoes:"#6d4a32",hat:"none",hatColour:"#f4f1ea",accent:"#f4d23c"}),accessories:Object.freeze({earrings:"none",neckwear:"none",colour:"#e0b93a",pin:!1}),swim:Object.freeze({colour:"#2f5f9e"}),profile:Object.freeze({pace:.5,talk:.5,show:.5,outlook:.5,pitch:.5,speed:.5,month:7,day:1,favourite:"#3fa0c8",catchphrase:""})});function Ot(n={}){const e=n&&typeof n=="object"?n:{},t=ag,i=(a,l)=>{const c=e[a]&&typeof e[a]=="object"?e[a]:{},h={};for(const[u,p]of Object.entries(l))h[u]=p(c[u],t[a][u]);return h},s=(a,l)=>a===void 0?l:rg(a),r=(a,l)=>og(a)||l,o=(a,l)=>a===void 0?l:!!a;return{v:1,name:String(e.name||"").slice(0,24),age:Nt(sg,e.age,"adult"),body:i("body",{height:s,build:s,silhouette:a=>Nt(ft.silhouette,a,"neutral"),skin:r}),head:i("head",{size:s,shape:s,form:(a,l)=>Nt(Ko,a,l),jaw:s,cheeks:s}),hair:i("hair",{style:(a,l)=>Nt(ft.hair,a,l),colour:r,flip:o}),eyes:i("eyes",{style:(a,l)=>Nt(ft.eyes,a,l),colour:r,size:s,width:s,spacing:s,height:s,tilt:s}),brows:i("brows",{style:(a,l)=>Nt(ft.brows,a,l),colour:r,size:s,spacing:s,height:s,tilt:s}),nose:i("nose",{style:(a,l)=>Nt(ft.nose,a,l),size:s,height:s,x:s}),mouth:i("mouth",{style:(a,l)=>Nt(ft.mouth,a,l),colour:r,size:s,width:s,height:s,x:s}),glasses:i("glasses",{style:(a,l)=>Nt(ft.glasses,a,l),colour:r}),facial:i("facial",{style:(a,l)=>Nt(ft.facial,a,l),colour:r}),blush:s(e.blush,t.blush),freckles:!!e.freckles,mole:!!e.mole,wrinkles:s(e.wrinkles,t.wrinkles),outfit:lg(e.outfit,i("outfit",{top:(a,l)=>Nt(ft.top,a,l),topColour:r,pattern:(a,l)=>["none","flowers","stripes","dots"].includes(a)?a:l,bottom:(a,l)=>Nt(ft.bottom,a,l),bottomColour:r,bottomPattern:a=>a==="plaid"?"plaid":"none",footwear:(a,l)=>Nt(ft.footwear,a,l),shoes:r,hat:(a,l)=>Nt(ft.hat,a,l),hatColour:r,accent:r})),accessories:i("accessories",{earrings:(a,l)=>Nt(ft.earrings,a,l),neckwear:(a,l)=>Nt(ft.neckwear,a,l),colour:r,pin:o}),swim:i("swim",{colour:r}),profile:(()=>{const a=i("profile",{pace:s,talk:s,show:s,outlook:s,pitch:s,speed:s,month:(l,c)=>Number.isInteger(+l)&&+l>=1&&+l<=12?+l:c,day:(l,c)=>Number.isInteger(+l)&&+l>=1&&+l<=31?+l:c,favourite:r,catchphrase:(l,c)=>l===void 0?c:String(l).replace(/[\u0000-\u001f<>]/g,"").slice(0,40)});return a.day=Math.min(a.day,[31,29,31,30,31,30,31,31,30,31,30,31][a.month-1]),a})()}}function lg(n,e){return!n||typeof n!="object"||(n.top===void 0&&(e.top="tee",n.topColour===void 0&&(e.topColour="#3fa0c8")),n.bottom===void 0&&(e.bottom="trousers",n.bottomColour===void 0&&(e.bottomColour="#27304d")),ft.footwear.includes(n.footwear)||(e.footwear="sneakers")),e}function Dc(n){const e=JSON.stringify(Ot(n)),t=new TextEncoder().encode(e);let i="";for(const s of t)i+=String.fromCharCode(s);return btoa(i).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}function Jo(n){try{const e=atob(String(n).replace(/-/g,"+").replace(/_/g,"/")),t=Uint8Array.from(e,i=>i.charCodeAt(0));return Ot(JSON.parse(new TextDecoder().decode(t)))}catch{return null}}function Zo(n=""){let e=2166136261;for(const t of String(n))e=Math.imul(e^t.codePointAt(0),16777619)>>>0;return()=>{e=e+1831565813>>>0;let t=e;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}function Ry(n=Math.random().toString(36)){const e=Zo(n),t=a=>a[Math.floor(e()*a.length)],i=ig,s=e()<.3,r=e()<.5,o=t(s?r?["perm","bun","bob"]:["horseshoe","buzz","crop","bald"]:r?["bob","long","ponytail","braids","bun","sidepart"]:["crop","sidepart","spiky","buzz","afro"]);return Ot({body:{height:.3+e()*.5,build:.25+e()*.55,skin:t(i.skin.slice(0,7))},head:{size:.4+e()*.25,shape:e(),form:t(Ko),jaw:e(),cheeks:e()},hair:{style:o,colour:t(s?["#9a9a96","#d8d6d0","#5a3a22"]:i.hair.slice(0,6)),flip:e()<.5},eyes:{style:t(ft.eyes),colour:t(i.eyes),size:.3+e()*.5,spacing:.3+e()*.4,height:.4+e()*.2,tilt:.35+e()*.3},brows:{style:t(ft.brows.slice(0,6)),colour:s?"#8a8a86":"#1c1714",size:.4+e()*.3,height:.4+e()*.3,tilt:.3+e()*.4},nose:{style:t(ft.nose.slice(0,5)),size:.3+e()*.5,height:.4+e()*.2},mouth:{style:t(ft.mouth),colour:r&&e()<.5?t(i.lips):"#b8544a",size:.35+e()*.4,height:.4+e()*.2},glasses:{style:e()<.25?t(ft.glasses.slice(1)):"none",colour:t(["#2b2b2b","#8a4a3a","#c8a060","#e06a7a"])},facial:{style:!r&&e()<.3?t(ft.facial.slice(1)):"none",colour:"#3a2618"},blush:r?.3+e()*.4:e()*.2,freckles:e()<.12,mole:e()<.1,wrinkles:s?.5+e()*.5:0,outfit:{top:t(["tee","kariyushi","polo","blouse","jacket"]),topColour:t(i.cloth),pattern:e()<.3?t(["flowers","stripes","dots"]):"none",bottom:r&&e()<.4?t(["skirt","longskirt","widepants","cropped","culottes","pleatedskirt"]):t(["shorts","trousers"]),bottomColour:t(["#27304d","#6d7478","#c8b48a","#2b2b2b","#9a6a42","#2f5f9e"]),shoes:t(["#6d4a32","#2b2b2b","#f4f1ea","#d8342c"]),footwear:t(["sneakers","sandals","shoes","boots"]),hat:"none",hatColour:"#f4f1ea",accent:t(i.cloth)},profile:{pace:e(),talk:e(),show:e(),outlook:e(),pitch:r?.45+e()*.5:e()*.6,speed:e(),month:1+Math.floor(e()*12),day:1+Math.floor(e()*28),favourite:t(i.cloth)}})}const ot=Math.PI*2,cg=Object.freeze(["#b8544a","#a8433e","#9a4a40"]);function Mi(n,e){const t=parseInt(n.slice(1),16),i=s=>Math.max(0,Math.min(255,Math.round(s*e)));return"#"+[i(t>>16),i(t>>8&255),i(t&255)].map(s=>s.toString(16).padStart(2,"0")).join("")}function vr(n){const e=n.eyes,t=n.brows,i=n.nose,s=n.mouth,r=104+(e.height-.5)*-56,o=38+(e.spacing-.5)*36,a=1.16+e.size*.8;return{eyeY:r,spread:o,eyeS:a,eyeW:.85+(e.width??.5)*.7,eyeTilt:(e.tilt-.5)*.85,browY:70+(t.height-.5)*-48,browSpread:o+((t.spacing??.5)-.5)*32,browS:.75+t.size*.6,browTilt:(t.tilt-.5)*.85,noseY:134+(i.height-.5)*-48,noseX:128+((i.x??.5)-.5)*48,noseS:.7+i.size*.7,mouthY:160+(s.height-.5)*-54,mouthX:128+((s.x??.5)-.5)*56,mouthS:1+s.size*.8,mouthW:.65+(s.width??.5)*.7}}const Mo=Object.freeze({neutral:{eyes:"open",brow:0,browLift:0,mouth:null,blush:0},smile:{eyes:"smiling",brow:0,browLift:3,mouth:"smile",blush:.15},content:{eyes:"content",brow:0,browLift:1,mouth:"smile",blush:.1},happy:{eyes:"happy",brow:0,browLift:10,mouth:"grin",blush:.4},laugh:{eyes:"happy",brow:0,browLift:14,mouth:"laugh",blush:.55},sad:{eyes:"sad",brow:-1,browLift:3,mouth:"frown",blush:0},worried:{eyes:"worry",brow:-1.35,browLift:10,mouth:"wobble",blush:0},angry:{eyes:"angry",brow:1.4,browLift:-5,mouth:"snarl",blush:.15},grumpy:{eyes:"angry",brow:.6,browLift:-2,mouth:"frown",blush:0},shy:{eyes:"shy",brow:-.4,browLift:3,mouth:"small",blush:1},surprised:{eyes:"wide",brow:0,browLift:20,mouth:"o",blush:0},thinking:{eyes:"side",brow:.3,browLift:0,mouth:"hmm",blush:0},sleep:{eyes:"closed",brow:0,browLift:-1,mouth:"small",blush:0}});Object.freeze(Object.keys(Mo));function hg(n,e,t={}){const i=t.size||256,s=i/256,r=Mo[t.expression]||Mo.neutral,o=vr(e),a=e.body.skin,l="#2b2623";if(n.canvas.__skin=a,n.save(),n.setTransform(s,0,0,s,0,0),n.fillStyle=a,n.fillRect(0,0,256,256),n.lineCap="round",n.lineJoin="round",e.wrinkles>.05){n.strokeStyle=Mi(a,.8),n.lineWidth=1.6,n.globalAlpha=Math.min(1,e.wrinkles);for(const f of[-1,1]){const g=128+f*(o.spread+16*o.eyeS);for(let y=0;y<2;y++)n.beginPath(),n.moveTo(g,o.eyeY-4+y*7),n.lineTo(g+f*8,o.eyeY-6+y*9),n.stroke();n.beginPath(),n.arc(128+f*22,o.mouthY-6,14,f>0?-.2:Math.PI-.6,f>0?.6:Math.PI+.2),n.stroke()}for(let f=0;f<2;f++)n.beginPath(),n.moveTo(104,o.browY-14-f*7),n.quadraticCurveTo(128,o.browY-18-f*7,152,o.browY-14-f*7),n.stroke();n.globalAlpha=1}if(e.freckles){n.fillStyle=Mi(a,.72);for(const f of[-1,1])for(let g=0;g<5;g++)n.beginPath(),n.arc(128+f*(o.spread+g%3*5-2),o.noseY-2+Math.floor(g/3)*6,1.5,0,ot),n.fill()}e.mole&&(n.fillStyle="#4a3024",n.beginPath(),n.arc(128+o.spread*.9,o.mouthY-6,2.4,0,ot),n.fill());const c=Math.min(1,e.blush*.8+r.blush);if(c>.02){for(const f of[-1,1]){const g=128+f*(o.spread+8),y=o.noseY+2,m=n.createRadialGradient(g,y,1,g,y,17);m.addColorStop(0,`rgba(236,110,120,${.55*c})`),m.addColorStop(1,"rgba(236,110,120,0)"),n.fillStyle=m,n.beginPath(),n.ellipse(g,y,18,12,0,0,ot),n.fill()}if(r.blush>=.9){n.strokeStyle="rgba(210,80,90,.7)",n.lineWidth=1.6;for(const f of[-1,1])for(let g=0;g<3;g++){const y=128+f*(o.spread+2+g*6);n.beginPath(),n.moveTo(y-2,o.noseY+6),n.lineTo(y+2,o.noseY-2),n.stroke()}}}const u=Math.max(0,Math.min(1,t.blink||0))>.5&&r.eyes!=="happy"?"closed":r.eyes,p=t.look||[0,0];for(const f of[-1,1])Nc(n,128+f*o.spread,o.eyeY,o.eyeS,f,e.eyes,u,p,o.eyeTilt,o.eyeW);if(e.brows.style!=="none")for(const f of[-1,1])Uc(n,128+f*o.browSpread,o.browY-r.browLift,o.browS,f,e.brows,o.browTilt,r.brow);kc(n,o.noseX,o.noseY,o.noseS,e.nose.style,a),xo(n,o.mouthX,o.mouthY,o.mouthS,e.mouth,r.mouth,t.talk||0,l,o.mouthW),Fc(n,o,e.facial),Oc(n,o,e.glasses),n.restore()}function Nc(n,e,t,i,s,r,o,a,l,c=1){const h=r.style,u="#2b2623";if(n.save(),n.translate(e,t),n.rotate(s*l*-1),n.scale(i*c,i),n.strokeStyle=u,n.fillStyle=u,n.lineWidth=3.2,o==="wide"||o==="worry"){const y=o==="wide"?15:13,m=o==="wide"?19:16;if(n.fillStyle="#fbfaf6",n.beginPath(),n.ellipse(0,0,y,m,0,0,ot),n.fill(),n.stroke(),n.fillStyle=r.colour,n.beginPath(),n.ellipse(a[0]*3,a[1]*3,y*.58,m*.62,0,0,ot),n.fill(),n.fillStyle=u,n.beginPath(),n.ellipse(a[0]*3,a[1]*3,y*.36,m*.42,0,0,ot),n.fill(),n.fillStyle="#fff",n.beginPath(),n.arc(3,-5,3,0,ot),n.fill(),h==="lashes")for(let d=0;d<3;d++)n.beginPath(),n.moveTo(s*y*.8,-9+d*5),n.lineTo(s*(y+6),-12+d*6),n.stroke();n.restore();return}if(o==="closed"||o==="content"){n.beginPath(),n.arc(0,o==="content"?-3:-6,11,Math.PI*.18,Math.PI*.82),n.stroke(),h==="lashes"&&(n.beginPath(),n.moveTo(s*9,2),n.lineTo(s*14,5),n.stroke()),n.restore();return}if(o==="happy"){n.lineWidth=5.2,n.beginPath(),n.moveTo(-13,4),n.quadraticCurveTo(0,-21,13,4),n.stroke(),n.restore();return}const p=o==="wide"?1.3:1,f=(h==="narrow"?12:h==="dot"?6:h==="sparkle"?13:11.5)*p,g=(h==="narrow"?4.2:h==="dot"?9:h==="almond"?9.5:h==="sparkle"?15:13.5)*p;if(["round","gentle","lashes","sleepy"].includes(h)){const y=(h==="sleepy"?6:h==="gentle"?9:12)*p;if(n.save(),n.beginPath(),n.ellipse(a[0]*2,a[1]*2,9*p,y,0,0,ot),n.clip(),n.fill(),n.fillStyle=n.canvas.__skin,o==="angry"||o==="sad"){const m=o==="angry"?-s:s;n.beginPath(),n.moveTo(-14,-y-2),n.lineTo(14,-y-2),n.lineTo(m*14,1),n.closePath(),n.fill()}else o==="shy"?n.fillRect(-14,-y-2,28,y*.7):o==="smiling"&&(n.beginPath(),n.ellipse(0,y+5,15,9,0,0,ot),n.fill());if(n.restore(),["angry","sad","shy"].includes(o)||(n.fillStyle="#fbfaf6",n.beginPath(),n.arc(a[0]*2+2,-y*.35+a[1]*2,1.8,0,ot),n.fill()),h==="lashes"){n.lineWidth=2.8;for(let m=0;m<2;m++)n.beginPath(),n.moveTo(s*5,-5-m*3),n.lineTo(s*(11+m*2),-8-m*4),n.stroke()}}else if(h==="dot")n.beginPath(),n.ellipse(a[0]*2,a[1]*2,f,g,0,0,ot),n.fill(),n.fillStyle="#fff",n.beginPath(),n.arc(2+a[0]*2,-3,2.2,0,ot),n.fill();else if(h==="narrow")n.beginPath(),n.ellipse(0,0,f,g,0,0,ot),n.fill();else{n.fillStyle="#fbfaf6",n.beginPath(),h==="almond"?(n.moveTo(-f,1),n.quadraticCurveTo(-2,-g*1.5,f,-1),n.quadraticCurveTo(0,g*1.3,-f,1)):n.ellipse(0,0,f,g,0,0,ot),n.fill(),n.save(),n.clip();const y=h==="sparkle"?10:7.4,m=a[0]*4,d=a[1]*3+(h==="gentle"?3:1);if(n.fillStyle=r.colour,n.beginPath(),n.arc(m,d,y,0,ot),n.fill(),n.fillStyle="#120c0a",n.beginPath(),n.arc(m,d,y*.5,0,ot),n.fill(),n.fillStyle="#fff",n.beginPath(),n.arc(m+y*.38,d-y*.4,y*.3,0,ot),n.fill(),h==="sparkle"&&(n.beginPath(),n.arc(m-y*.35,d+y*.4,y*.16,0,ot),n.fill()),n.fillStyle=n.canvas.__skin||"#e8bf98",(h==="sleepy"||o==="shy")&&n.fillRect(-f-2,-g-2,f*2+4,g*.9),o==="sad"&&(n.beginPath(),n.moveTo(-f-2,-g-2),n.lineTo(f+2,-g-2),n.lineTo(s*f+2*s,-g*.1),n.closePath(),n.fill()),o==="angry"&&(n.beginPath(),n.moveTo(-f-2,-g-2),n.lineTo(f+2,-g-2),n.lineTo(-s*f-2*s,-g*.05),n.closePath(),n.fill()),n.restore(),n.lineWidth=2.4,n.beginPath(),h==="almond"?(n.moveTo(-f,1),n.quadraticCurveTo(-2,-g*1.5,f,-1),n.stroke()):(n.ellipse(0,0,f,g,0,Math.PI*1.05,Math.PI*1.95),n.stroke()),h==="gentle"&&(n.lineWidth=3,n.beginPath(),n.arc(0,g*.3,f*1.02,Math.PI*1.12,Math.PI*1.88),n.stroke()),h==="lashes"){n.lineWidth=2.2;for(let b=0;b<3;b++){const v=-Math.PI/2+s*(.55+b*.28);n.beginPath(),n.moveTo(Math.cos(v)*f*.95,Math.sin(v)*g*.95),n.lineTo(Math.cos(v)*(f+6),Math.sin(v)*(g+5)),n.stroke()}}}o==="sad"&&(n.strokeStyle="rgba(120,180,230,.7)",n.lineWidth=2.2,n.beginPath(),n.moveTo(s*-4,g),n.lineTo(s*-5,g+8),n.stroke()),n.restore()}function Uc(n,e,t,i,s,r,o,a){n.save(),n.translate(e,t),n.scale(i,i),n.rotate(s*(o*-1+a*.48));const l=Mi(r.colour,.68);n.strokeStyle=l,n.fillStyle=l,n.lineCap="round";const c=r.style,h=c==="thick"||c==="bushy"?7:c==="thin"?2.4:4.2;if(n.lineWidth=h,n.beginPath(),c==="arched")n.moveTo(-13,3),n.quadraticCurveTo(0,-7,13,2);else if(c==="worried")n.moveTo(-13,-3),n.quadraticCurveTo(0,0,13,3);else if(c==="bushy"){n.moveTo(-14,2),n.quadraticCurveTo(0,-5,14,1),n.stroke(),n.lineWidth=2;for(let u=-12;u<=12;u+=4)n.beginPath(),n.moveTo(u,-2),n.lineTo(u+2*s,-7),n.stroke();n.restore();return}else n.moveTo(-13,1),n.quadraticCurveTo(0,-3,13,1);n.stroke(),n.restore()}function kc(n,e,t,i,s,r,o){if(n.save(),n.translate(e,t),n.scale(i,i),n.strokeStyle=Mi(r,.62),n.fillStyle=Mi(r,.8),n.lineWidth=2.4,s==="button")n.beginPath(),n.ellipse(0,0,7,5.5,0,0,ot),n.fill(),n.fillStyle="rgba(255,255,255,.35)",n.beginPath(),n.arc(-2,-2,2,0,ot),n.fill();else if(s==="dot"){n.fillStyle=Mi(r,.6);for(const a of[-3,3])n.beginPath(),n.arc(a,0,1.6,0,ot),n.fill()}else s==="line"?(n.beginPath(),n.moveTo(1,-12),n.quadraticCurveTo(-2,0,3,4),n.lineTo(-3,4),n.stroke()):s==="wide"?(n.beginPath(),n.moveTo(-10,-2),n.quadraticCurveTo(-11,6,-3,5),n.moveTo(10,-2),n.quadraticCurveTo(11,6,3,5),n.stroke(),n.beginPath(),n.ellipse(0,1,6,4,0,0,ot),n.fill()):s==="hook"&&(n.beginPath(),n.moveTo(-1,-16),n.quadraticCurveTo(8,2,1,6),n.lineTo(-4,4),n.stroke());n.restore()}function xo(n,e,t,i,s,r,o,a,l=1){n.save(),n.translate(e,t),n.scale(i*l,i);const c=s.colour,h=!cg.includes(c.toLowerCase());n.strokeStyle=h?c:a,n.lineWidth=h?3.6:3.4,n.lineCap="round";const u="#2b2623",p="#e07a80",f="#fbfaf6",g=(m,d,b=0)=>{n.fillStyle=u,n.beginPath(),n.moveTo(-m,0),n.quadraticCurveTo(0,-b,m,0),n.quadraticCurveTo(0,d*2,-m,0),n.fill(),n.save(),n.clip(),n.fillStyle=f,n.fillRect(-m,-d,m*2,d*.55+b*.2),n.fillStyle=p,n.beginPath(),n.ellipse(0,d*1.3,m*.55,d*.55,0,0,ot),n.fill(),n.restore(),n.beginPath(),n.moveTo(-m,0),n.quadraticCurveTo(0,-b,m,0),n.quadraticCurveTo(0,d*2,-m,0),n.stroke()},y=o>.5?"talk":r||s.style;switch(n.beginPath(),y){case"talk":{const m=["grin","laugh","o"].includes(r);g(m?19:12,(m?13:7)+o*3,m?6:2);break}case"grin":g(24,15,5);break;case"laugh":g(28,23,7);break;case"o":n.fillStyle=u,n.ellipse(0,3,13,20,0,0,ot),n.fill(),n.stroke();break;case"frown":n.arc(0,12,13,Math.PI*1.2,Math.PI*1.8),n.stroke();break;case"snarl":n.moveTo(-12,4),n.lineTo(-4,0),n.lineTo(4,0),n.lineTo(12,4),n.stroke();break;case"wobble":n.moveTo(-14,1),n.quadraticCurveTo(0,5,14,1),n.moveTo(-14,-4),n.quadraticCurveTo(-10,1,-14,7),n.moveTo(14,-4),n.quadraticCurveTo(10,1,14,7),n.stroke();break;case"hmm":n.moveTo(-8,2),n.lineTo(8,-1),n.stroke();break;case"smile":n.moveTo(-16,-1),n.quadraticCurveTo(0,15,16,-1),n.stroke();break;case"flat":n.moveTo(-11,1),n.lineTo(11,1),n.stroke();break;case"small":n.arc(0,-3,6,Math.PI*.25,Math.PI*.75),n.stroke();break;case"wide":n.arc(0,-10,18,Math.PI*.22,Math.PI*.78),n.stroke();break;case"smirk":n.moveTo(-10,2),n.quadraticCurveTo(2,4,11,-4),n.stroke();break;case"pout":n.fillStyle=c,n.ellipse(0,1,6,4.5,0,0,ot),n.fill();break;default:n.arc(0,-8,13,Math.PI*.2,Math.PI*.8),n.stroke()}h&&["smile","small","wide","flat","smirk","wobble"].includes(y)&&(n.fillStyle=c,n.globalAlpha=.85,n.beginPath(),n.ellipse(0,2,y==="wide"?13:9,3.2,0,0,ot),n.fill(),n.globalAlpha=1),n.restore()}function Fc(n,e,t){if(t.style==="none")return;n.save(),n.fillStyle=t.colour,n.strokeStyle=t.colour;const i=(e.noseY+e.mouthY)/2+2;if(t.style==="moustache")n.beginPath(),n.moveTo(128,i-3),n.quadraticCurveTo(114,i-6,108,i+3),n.quadraticCurveTo(118,i+1,128,i+2),n.quadraticCurveTo(138,i+1,148,i+3),n.quadraticCurveTo(142,i-6,128,i-3),n.fill();else if(t.style==="walrus")n.beginPath(),n.ellipse(128,i+1,24,8,0,0,ot),n.fill();else if(t.style==="stubble"){n.globalAlpha=.35;for(let s=0;s<140;s++){const r=Math.PI*(.1+.8*(s%47)/46),o=46+s*7%11,a=128+Math.cos(r)*o*.95,l=e.mouthY-26+Math.sin(r)*o*.8;l>e.noseY+8&&n.fillRect(a,l,1.6,1.6)}n.globalAlpha=1}else t.style==="beard"?(n.beginPath(),n.moveTo(84,e.noseY),n.quadraticCurveTo(90,e.mouthY+40,128,e.mouthY+42),n.quadraticCurveTo(166,e.mouthY+40,172,e.noseY),n.lineTo(160,e.noseY+4),n.quadraticCurveTo(150,e.mouthY+18,128,e.mouthY+16),n.quadraticCurveTo(106,e.mouthY+18,96,e.noseY+4),n.closePath(),n.fill()):t.style==="goatee"&&(n.beginPath(),n.ellipse(128,e.mouthY+18,9,11,0,0,ot),n.fill());n.restore()}function Oc(n,e,t){if(t.style==="none")return;n.save(),n.strokeStyle=t.colour,n.lineWidth=3.2;const i=15*e.eyeS+2,s=e.eyeY,r=i*e.eyeW;for(const o of[-1,1]){const a=128+o*e.spread;n.beginPath(),t.style==="round"?n.ellipse(a,s,r,i,0,0,ot):t.style==="half"?n.ellipse(a,s-2,r,i,0,Math.PI*.05,Math.PI*.95):n.roundRect?n.roundRect(a-r*1.1,s-i*.8,r*2.2,i*1.6,6):n.rect(a-r*1.1,s-i*.8,r*2.2,i*1.6),t.style==="sun"&&(n.fillStyle="rgba(30,34,40,.9)",n.fill()),n.stroke(),t.style!=="sun"&&(n.save(),n.strokeStyle="rgba(255,255,255,.55)",n.lineWidth=2,n.beginPath(),n.moveTo(a+i*.3,s-i*.55),n.lineTo(a+i*.6,s-i*.25),n.stroke(),n.restore())}n.beginPath(),n.moveTo(128-e.spread+r*(t.style==="round"||t.style==="half"?1:1.1),s-2),n.quadraticCurveTo(128,s-8,128+e.spread-r*(t.style==="round"||t.style==="half"?1:1.1),s-2),n.stroke(),n.restore()}function Cy(n,e,t,i=n.canvas.width){const s=e.body.skin,r="#2b2623",o={...e,eyes:{...e.eyes,height:.5,spacing:.5,size:.5,tilt:.5},brows:{...e.brows,height:.5,spacing:.5,size:.5,tilt:.5},nose:{...e.nose,height:.5,x:.5,size:.5},mouth:{...e.mouth,height:.5,x:.5,size:.5,width:.5}},a=vr(o),l={eyes:[128,a.eyeY,1.75],glasses:[128,a.eyeY,1.6],brows:[128,a.browY,2],nose:[128,a.noseY,3.4],mouth:[128,a.mouthY+2,2.7],facial:[128,(a.noseY+a.mouthY)/2+(e.facial.style==="beard"?18:e.facial.style==="goatee"?14:2),e.facial.style==="beard"?1.5:2.2]}[t]||[128,128,1],c=i/256;if(n.save(),n.setTransform(c,0,0,c,0,0),n.canvas.__skin=s,n.fillStyle=s,n.fillRect(0,0,256,256),n.translate(128,128),n.scale(l[2],l[2]),n.translate(-l[0],-l[1]),n.lineCap="round",n.lineJoin="round",t==="eyes"||t==="glasses")for(const u of[-1,1])Nc(n,128+u*a.spread,a.eyeY,a.eyeS,u,o.eyes,"open",[0,0],a.eyeTilt,a.eyeW);if(t==="brows"&&e.brows.style!=="none")for(const u of[-1,1])Uc(n,128+u*a.browSpread,a.browY,a.browS,u,o.brows,a.browTilt,0);t==="nose"&&kc(n,a.noseX,a.noseY,a.noseS,e.nose.style,s),t==="mouth"&&xo(n,a.mouthX,a.mouthY,a.mouthS,o.mouth,null,0,r,a.mouthW),t==="facial"&&(xo(n,a.mouthX,a.mouthY,a.mouthS,{...o.mouth,style:"flat"},null,0,"rgba(43,38,35,.35)",a.mouthW),Fc(n,a,e.facial)),t==="glasses"&&Oc(n,a,e.glasses),n.restore(),(t==="brows"&&e.brows.style==="none"||t==="nose"&&e.nose.style==="none"||t==="glasses"&&e.glasses.style==="none"||t==="facial"&&e.facial.style==="none")&&(n.save(),n.strokeStyle="rgba(43,38,35,.25)",n.lineWidth=i*.04,n.lineCap="round",n.beginPath(),n.moveTo(i*.3,i*.7),n.lineTo(i*.7,i*.3),n.stroke(),n.restore())}function ug(n,e=2){return n.userData.worldTextureScale=e,n.onBeforeCompile=t=>{t.uniforms.townTileMetres={value:e},t.vertexShader=`uniform float townTileMetres;
`+t.vertexShader,t.vertexShader=t.vertexShader.replace("#include <worldpos_vertex>",`#include <worldpos_vertex>
      vec4 townPosition=vec4(transformed,1.0);
      #ifdef USE_BATCHING
        townPosition=batchingMatrix*townPosition;
      #endif
      #ifdef USE_INSTANCING
        townPosition=instanceMatrix*townPosition;
      #endif
      townPosition=modelMatrix*townPosition;
      vec3 townNormal=inverseTransformDirection(transformedNormal,viewMatrix);
      vec3 townAxis=abs(townNormal);
      vec2 townUV=townAxis.y>=townAxis.x && townAxis.y>=townAxis.z ? townPosition.xz :
        townAxis.x>townAxis.z ? vec2(townPosition.z*sign(townNormal.x),townPosition.y) :
        vec2(-townPosition.x*sign(townNormal.z),townPosition.y);
      townUV/=townTileMetres;
      #ifdef USE_MAP
        vMapUv=(mapTransform*vec3(townUV,1.0)).xy;
      #endif
      #ifdef USE_NORMALMAP
        vNormalMapUv=(normalMapTransform*vec3(townUV,1.0)).xy;
      #endif
      #ifdef USE_ROUGHNESSMAP
        vRoughnessMapUv=(roughnessMapTransform*vec3(townUV,1.0)).xy;
      #endif
      #ifdef USE_AOMAP
        vAoMapUv=(aoMapTransform*vec3(townUV,1.0)).xy;
      #endif
      #ifdef USE_BUMPMAP
        vBumpMapUv=(bumpMapTransform*vec3(townUV,1.0)).xy;
      #endif`)},n.customProgramCacheKey=()=>"town-world-uv-v1",n}const Il={2:[96,255],3:[92,178,255],4:[80,142,202,255],soft:[180,255],soft3:[172,214,255]},ro=new Map;function dg(n=3){if(ro.has(n))return ro.get(n);const e=Il[n]||Il[3],t=new Uint8Array(e.length*4);for(let s=0;s<e.length;s++)t[s*4]=t[s*4+1]=t[s*4+2]=e[s],t[s*4+3]=255;const i=new fr(t,e.length,1,1023);return i.minFilter=i.magFilter=1003,i.generateMipmaps=!1,i.needsUpdate=!0,ro.set(n,i),i}const Bc="lights_toon_pars_fragment",Dl="vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;",fg=`
	vec3 celBand = getGradientIrradiance( geometryNormal, directLight.direction );
	vec3 irradiance = celBand * mix( uShadowTint, vec3( 1.0 ), celBand ) * directLight.color;`;let So="";{const n=Ve[Bc];n.includes(Dl)&&(So=`uniform vec3 uShadowTint;
`+n.replace(Dl,fg))}const zc="map_fragment",Nl="diffuseColor *= sampledDiffuseColor;",pg=`diffuseColor.rgb *= mix( vec3( 1.0 ), sampledDiffuseColor.rgb, uFlatten );
	diffuseColor.a *= sampledDiffuseColor.a;`,mg=`uniform float uFlatten;
`;let wo="";{const n=Ve[zc];n.includes(Nl)&&(wo=n.replace(Nl,pg))}const gg=.65;function _g(n){return!!(n.normalMap||n.roughnessMap||n.bumpMap||n.aoMap)}function yg(n,e,t=1,{base:i=null,baseKey:s=""}={}){const r=!!So,o=!!wo&&t<1&&!!n.map;if(!r&&!o&&!i)return n;const a={value:new Ne(e)},l={value:t};n.userData.shadowTint=a,n.userData.flatten=l,n.onBeforeCompile=(h,u)=>{i?.(h,u),r&&(h.uniforms.uShadowTint=a,h.fragmentShader=h.fragmentShader.replace("#include <"+Bc+">",So)),o&&(h.uniforms.uFlatten=l,h.fragmentShader=mg+h.fragmentShader.replace("#include <"+zc+">",wo))};const c=new Ne(e).getHexString();return n.customProgramCacheKey=()=>"cel_"+c+"_"+(o?t:1)+"_"+s,n}const Hc=7102348,vg=.66;function bg(n){return n?n.r*.2126+n.g*.7152+n.b*.0722:0}function Mg(n){return bg(n.color)>=vg?"soft3":3}function xg(n,{skinned:e=!1}={}){return e?!0:n.userData?.keepPhysical!==!0?!1:n.userData.keepPhysicalStrict===!0?!0:!!n.transparent&&(n.opacity??1)<.95}const Sg=.3,oo=new WeakMap;function br(n,{tint:e=Hc,bands:t=null}={}){if(oo.has(n))return oo.get(n);const i=new R0({color:n.color?n.color.clone():new Ne(16777215),map:n.map||null,alphaMap:n.alphaMap||null,gradientMap:dg(t??Mg(n)),transparent:n.transparent,opacity:n.opacity,side:n.side,alphaTest:n.alphaTest,fog:n.fog,vertexColors:n.vertexColors,emissive:n.emissive?n.emissive.clone():new Ne(0),emissiveMap:n.emissiveMap||null,emissiveIntensity:n.emissiveIntensity??1});i.depthWrite=n.depthWrite,i.depthTest=n.depthTest,i.polygonOffset=n.polygonOffset,i.polygonOffsetFactor=n.polygonOffsetFactor,i.polygonOffsetUnits=n.polygonOffsetUnits,i.name=n.name,i.userData={...n.userData,celFrom:n};const s=n.userData?.worldTextureScale;Number.isFinite(s)&&ug(i,s);const r=typeof i.onBeforeCompile=="function"?i.onBeforeCompile:null,o=Number.isFinite(s)?"worlduv"+s:"",a=n.userData?.keepPhysical===!0;return yg(i,e,_g(n)?a?Sg:gg:1,{base:r,baseKey:o}),oo.set(n,i),wg(n,i),i}function wg(n,e){n.emissive&&n.emissive.isColor&&(e.emissive=n.emissive);for(const t of["emissiveIntensity","opacity","visible"]){let i=n[t];try{Object.defineProperty(n,t,{configurable:!0,enumerable:!0,get(){return i},set(s){i=s,e[t]=s,t==="opacity"&&(e.needsUpdate=e.needsUpdate)}})}catch{}}}function Tg(n,e){return!n||n.isMeshToonMaterial||!n.isMeshStandardMaterial&&!n.isMeshPhongMaterial&&!n.isMeshLambertMaterial?!0:xg(n,{skinned:e})}function Py(n,{tint:e=Hc,seen:t=null,force:i=!1,collect:s=null}={}){const r={converted:0,skipped:0,visited:0};return n&&n.traverse(o=>{if(!o.isMesh&&!o.isPoints&&!o.isLine)return;if(!i&&t){if(t.has(o))return;t.add(o)}r.visited++;const a=!!o.isSkinnedMesh,l=c=>{if(Tg(c,a))return r.skipped++,c;r.converted++;const h=br(c,{tint:e});return s&&h.userData.flatten&&s.add(h.userData.flatten),h};o.material=Array.isArray(o.material)?o.material.map(l):l(o.material)}),r}const Pn=Object.freeze({width:512,height:256,V0:.06,T0:-.1,T1:1.05}),Ul=Object.freeze([.5,.02]);function Eg(n,e){const t=.5+Math.atan2(n.x/(e.width/2),n.z/(e.depth/2))/(Math.PI*2),i=(n.y-e.hipY)/e.torso;return[t,Pn.V0+(1-Pn.V0)*Ue.clamp((i-Pn.T0)/(Pn.T1-Pn.T0),0,1)]}const zt=(n,e)=>"#"+new Ne(n).multiplyScalar(e).getHexString(),Ki=(n,e)=>"#"+new Ne(n).lerp(new Ne("#ffffff"),e).getHexString(),Ag=["polo","blouse","kariyushi","jacket","smock","cardigan"];function Rg(n,e,t,i){const{width:s,height:r,V0:o,T0:a,T1:l}=Pn,c=e.outfit,h=c.topColour,u=[];n.clearRect(0,0,s,r);const p=t.width,f=t.depth,g=U=>(1-(o+(1-o)*(U-a)/(l-a)))*r,y=(U,x)=>Math.asin(Ue.clamp(U/(p/2*Math.max(.05,i(x))),-1,1)),m=(U,x,F=!1)=>{const oe=y(U,x);return(.5+(F?Math.PI-oe:oe)/(Math.PI*2))*s},d=(1-o)*r/((l-a)*t.torso),b=(U,x)=>s/(Math.PI*2)/(Math.max(.05,i(x))*Math.hypot(p/2*Math.cos(U),f/2*Math.sin(U))),v=zt(h,.5),_=Math.max(1.5,s/300),R=(U,x)=>{x(),U&&(n.save(),n.translate(-s,0),x(),n.restore())},w=(U,x,{stroke:F=v,back:oe=!1,width:we=_}={})=>R(oe,()=>{n.beginPath(),U.forEach(([Fe,$],he)=>{const ie=m(Fe,$,oe),W=g($);he?n.lineTo(ie,W):n.moveTo(ie,W)}),n.closePath(),x&&(n.fillStyle=x,n.fill()),F&&(n.strokeStyle=F,n.lineWidth=we,n.lineJoin="round",n.stroke())}),A=(U,x,F=_,oe=!1)=>{n.beginPath(),U.forEach(([we,Fe],$)=>{const he=m(we,Fe,oe),ie=g(Fe);$?n.lineTo(he,ie):n.moveTo(he,ie)}),n.strokeStyle=x,n.lineWidth=F,n.lineCap="round",n.lineJoin="round",n.stroke()},C=(U,x,F,oe,we=null)=>{const Fe=y(U,x);n.beginPath(),n.ellipse(m(U,x),g(x),F*b(Fe,x),F*d,0,0,Math.PI*2),oe&&(n.fillStyle=oe,n.fill()),we&&(n.strokeStyle=we,n.lineWidth=_*.8,n.stroke())},S=(U,x,F)=>{for(const oe of U)C(0,oe,x*t.k,F,zt(F,.6));u.push("buttons:"+U.length)},M=t.k,I=.92,z=.15;if(c.pattern==="stripes"&&!["tank","overalls","sundress"].includes(c.top)){const U=t.torso*.12*d,x=g(1),F=g(z);n.fillStyle="#f4f1ea";for(let oe=F-U;oe>x;oe-=U*2)n.fillRect(0,Math.max(x,oe-U),s,Math.min(U,oe-x));u.push("stripes")}if(c.pattern==="flowers"||c.pattern==="dots"){const U=c.pattern==="flowers",x=c.top==="kariyushi",F=M*(U?x?.05:.036:.016),oe=U?"#f8f6ef":c.accent,we="#f4c83c",Fe=U?x?7:8:14,$=U?x?4:5:9,he=[];for(let ie=0;ie<$;ie++)for(let W=0;W<Fe;W++){const ne=Math.abs(Math.sin(ie*12.9898+W*78.233)*43758.5453)%1;he.push([(W+ie%2*.5+ne*.18)/Fe*Math.PI*2-Math.PI,z+.07+(ie+.5+ne*.15)/$*(I-z-.1),ie*Fe+W])}for(const[ie,W,ne]of he){if(Ag.includes(c.top)&&Math.abs(ie)<.2)continue;const Re=(.5+ie/(Math.PI*2))*s,te=g(W),B=F*b(ie,W),K=F*d;for(const re of[0,-s,s]){if(n.save(),n.translate(Re+re,te),n.scale(B,K),n.rotate(ne*.7),U){n.fillStyle=oe;for(let D=0;D<5;D++)n.beginPath(),n.ellipse(Math.cos(D*1.2566)*.5,Math.sin(D*1.2566)*.5,.42,.42,0,0,Math.PI*2),n.fill();n.fillStyle=we,n.beginPath(),n.arc(0,0,.28,0,Math.PI*2),n.fill()}else n.fillStyle=oe,n.beginPath(),n.arc(0,0,1,0,Math.PI*2),n.fill();n.restore()}}u.push(c.pattern)}const N=(U=zt(h,.86))=>{n.fillStyle=U,n.fillRect(0,g(1.03),s,g(.985)-g(1.03)),n.strokeStyle=v,n.lineWidth=_*.8,n.beginPath(),n.moveTo(0,g(.985)),n.lineTo(s,g(.985)),n.stroke(),u.push("neckline")},O=(U,{drop:x=.84,spread:F=.115,round:oe=!1}={})=>{for(const we of[-1,1])if(oe){const Fe=[];for(let $=0;$<=10;$++){const he=$/10*Math.PI;Fe.push([we*(.012+Math.sin(he)*F*.62)*M,1-(1-Math.cos(he))*.5*(1-x)*1.2])}Fe.push([we*.012*M,1]),w(Fe,U)}else w([[we*.008*M,.99],[we*F*M,1],[we*F*.9*M,.95],[we*.03*M,x]],U);n.fillStyle=U,n.fillRect(0,g(1.035),s,g(.975)-g(1.035)),n.fillRect(m(-.012*M,.99),g(1.035),m(.012*M,.99)-m(-.012*M,.99),g(.985)-g(1.035)),n.strokeStyle=v,n.lineWidth=_*.8,n.beginPath(),n.moveTo(0,g(.975)),n.lineTo(m(-F*M,1),g(.975)),n.moveTo(m(F*M,1),g(.975)),n.lineTo(s,g(.975)),n.stroke(),u.push("collar")},X=(U,x,F=.022)=>{w([[-F*M,U],[F*M,U],[F*M,x],[-F*M,x]],null,{width:_*.8}),u.push("placket")},Y=(U,x,F,oe,we=null)=>{w([[U-F/2,x+oe/2],[U+F/2,x+oe/2],[U+F/2,x-oe/2],[U-F/2,x-oe/2]],we,{width:_*.8}),A([[U-F/2,x+oe/2-.035],[U+F/2,x+oe/2-.035]],v,_*.6),u.push("pocket")},se=()=>{n.strokeStyle=zt(h,.72),n.lineWidth=_*.7,n.beginPath(),n.moveTo(0,g(z+.035)),n.lineTo(s,g(z+.035)),n.stroke()};switch(c.top){case"tee":N(),se();break;case"hoodie":{N(zt(h,.9));const U=p*.36,x=.36;w([[-U,x+.13],[U,x+.13],[U*1.12,x-.12],[-U*1.12,x-.12]],zt(h,.93));for(const F of[-1,1])A([[F*.024*M,.97],[F*.03*M,.74]],c.accent,_*1.6),C(F*.03*M,.73,.007*M,c.accent);u.push("pocket","drawstrings"),se();break}case"polo":O(Ki(h,.12)),X(.97,.78),S([.9,.82],.0075,Ki(h,.5)),se();break;case"blouse":O("#f8f6ef",{drop:.88,spread:.1,round:!0}),X(.97,z+.04,.018),S([.85,.69,.53,.37],.007,"#f8f6ef");break;case"smock":O("#f8f6ef",{drop:.88,spread:.1,round:!0}),Y(0,.42,p*.5,.16,zt(h,.94)),se();break;case"kariyushi":{const U=e.body.skin;w([[-.07*M,1],[.07*M,1],[0,.8]],U,{stroke:null});const x=Ki(h,.22);u.push("lapels");for(const F of[-1,1])w([[F*.012*M,1],[F*.14*M,.995],[F*.12*M,.9],[F*.012*M,.79]],x,{width:_*1.2});n.fillStyle=x,n.fillRect(0,g(1.035),s,g(.975)-g(1.035)),X(.8,z+.03,.02),S([.72,.58,.44,.3],.0085,"#f8f6ef"),Y(p*.25,.62,p*.22,.17,h),se();break}case"jacket":{w([[-.06*M,1],[.06*M,1],[0,.66]],"#f4f1ea",{stroke:null});for(const U of[-1,1])w([[U*.01*M,1],[U*.12*M,.99],[U*.13*M,.86],[U*.09*M,.84],[U*.1*M,.78],[U*.012*M,.62]],zt(h,.88));A([[0,.62],[0,z]],v,_*.8),S([.52,.4],.009,zt(h,.7));for(const U of[-1,1])A([[U*p*.16,.32],[U*p*.36,.32]],v,_);u.push("lapels","pocket");break}case"cardigan":{w([[-.05*M,1],[.05*M,1],[.02*M,.7],[-.02*M,.7]],Ki(h,.7),{stroke:null});for(const U of[-1,1])w([[U*.012*M,1],[U*.06*M,1],[U*.035*M,.7],[U*.035*M,z],[U*.008*M,z],[U*.008*M,.7]],c.accent,{width:_*.8});S([.62,.5,.38,.26],.008,zt(c.accent,.8)),n.fillStyle=c.accent,n.fillRect(0,g(z+.05),s,g(z)-g(z+.05)),u.push("bands");break}case"festival":{for(const U of[-1,1])w([[U*.13*M,1],[U*.07*M,1],[-U*.06*M,.45],[-U*.13*M,.45]],c.accent);n.fillStyle=zt(c.accent,.85),n.fillRect(0,g(.4),s,g(.3)-g(.4)),u.push("bands","sash");break}case"sailor":{const U=c.accent,x=Ki(U,.85);R(!0,()=>{n.fillStyle=U,n.fillRect(m(-p*.3,.75,!0),g(1.03),m(p*.3,.75,!0)-m(-p*.3,.75,!0),g(.72)-g(1.03)),n.strokeStyle=x,n.lineWidth=_*1.4,n.strokeRect(m(-p*.26,.75,!0),g(1),m(p*.26,.75,!0)-m(-p*.26,.75,!0),g(.76)-g(1))});for(const F of[-1,1])w([[F*.012*M,1],[F*.16*M,1],[F*.03*M,.66],[F*0*M,.66]],U),A([[F*.13*M,.985],[F*.02*M,.69]],x,_*1.2);w([[-.045*M,.7],[.045*M,.7],[0,.56]],"#d8342c"),u.push("collar","scarf");break}case"overalls":{const U=c.bottomColour,x=p*.3,F=.74;w([[-x,F],[x,F],[x*1.05,z],[-x*1.05,z]],U),Y(0,.58,x*.9,.14,zt(U,.94));for(const oe of[-1,1])w([[oe*x*.95,F],[oe*x*.55,F],[oe*p*.18,1],[oe*p*.32,1]],U,{width:_*.8}),w([[oe*p*.32,1],[oe*p*.18,1],[-oe*p*.1,.5],[-oe*p*.25,.5]],U,{back:!0,width:_*.8}),C(oe*x*.75,F-.03,.012*M,"#e2b84a",zt("#e2b84a",.6));u.push("bib","straps");break}case"sundress":for(const U of[-1,1])w([[U*p*.3,.8],[U*p*.18,.8],[U*p*.16,1.02],[U*p*.28,1.02]],h,{width:_*.8}),w([[U*p*.3,.8],[U*p*.18,.8],[U*p*.16,1.02],[U*p*.28,1.02]],h,{back:!0,width:_*.8});n.fillStyle=zt(h,.7),n.fillRect(0,g(.795),s,_*.8),u.push("straps");break;case"apron":O("#f8f6ef",{drop:.88,spread:.1,round:!0});break}return u}const To=Object.freeze(["root","hips","spine","chest","neck","head","shoulderL","elbowL","handL","shoulderR","elbowR","handR","thighL","kneeL","footL","thighR","kneeR","footR"]),Eo=Object.fromEntries(To.map((n,e)=>[n,e])),kl=Object.freeze({child:{base:1.12,span:.2,head:1.4},teen:{base:1.4,span:.28,head:1.18},adult:{base:1.36,span:.44,head:1.12},elder:{base:1.33,span:.34,head:1.14}});function $o(n){const e=Ot(n),t=kl[e.age]||kl.adult,i=t.base+e.body.height*t.span,s=i/1.6,r=e.body.build,o=ng(e.head),a=(.19+e.head.size*.055)*s*t.head,l=o.width,c=o.height,h=.055*s,u=i-a*2*c-h,p=u*.47,f=u-p,g=.07*s,y=(p-g)*.5,m=y,d=(.058+r*.024)*s,b=(.045+r*.016)*s,v=e.body.silhouette==="feminine",_=e.body.silhouette==="masculine",R=(.3+r*.15)*s*(v?.94:_?1.08:1),w=(.2+r*.09)*s,A=R*(v?1.13:_?.9:1),C=v?.79:_?.98:.96,S=.22*s,M=.2*s,I=.056*s,z=p,N=z+f*.5,O=z+f,X=O+h;return{H:i,k:s,Rh:a,headSX:l,headSY:c,profile:o,neck:h,torso:f,leg:p,foot:g,thigh:y,shin:m,legR:d,armR:b,width:R,hips:A,waistRatio:C,depth:w,upper:S,fore:M,hand:I,hipY:z,chestY:N,neckY:O,headY:X,headCentre:X+a*c*.94,shoulderX:R/2-b*.2,shoulderY:O-.075*s,hipX:A*.24,seatDrop:d*.95}}function Cg(n){return{root:[0,0,0],hips:[0,n.hipY,0],spine:[0,n.hipY+n.torso*.25,0],chest:[0,n.chestY,0],neck:[0,n.neckY,0],head:[0,n.headY,0],shoulderL:[n.shoulderX,n.shoulderY,0],elbowL:[n.shoulderX+.01,n.shoulderY-n.upper,0],handL:[n.shoulderX+.015,n.shoulderY-n.upper-n.fore,0],shoulderR:[-n.shoulderX,n.shoulderY,0],elbowR:[-n.shoulderX-.01,n.shoulderY-n.upper,0],handR:[-n.shoulderX-.015,n.shoulderY-n.upper-n.fore,0],thighL:[n.hipX,n.hipY,0],kneeL:[n.hipX,n.hipY-n.thigh,0],footL:[n.hipX,n.foot,0],thighR:[-n.hipX,n.hipY,0],kneeR:[-n.hipX,n.hipY-n.thigh,0],footR:[-n.hipX,n.foot,0]}}const Pg={hips:"root",spine:"hips",chest:"spine",neck:"chest",head:"neck",shoulderL:"chest",elbowL:"shoulderL",handL:"elbowL",shoulderR:"chest",elbowR:"shoulderR",handR:"elbowR",thighL:"hips",kneeL:"thighL",footL:"kneeL",thighR:"hips",kneeR:"thighR",footR:"kneeR"},Ji=new Ne;function Js(n,e){for(let t=1;t<n.length;t++){const[i,s]=n[t-1],[r,o]=n[t];if(e<=o)return i+(r-i)*((e-s)/(o-s||1))}return n.at(-1)[0]}function Oe(n,e,t,i,s,r=null){let o=e.index?e.toNonIndexed():e.clone();for(const d of Object.keys(o.attributes))["position","normal"].includes(d)||o.deleteAttribute(d);s&&o.applyMatrix4(s);const a=o.attributes.position.count,l=new Float32Array(a*2);if(r){const d=o.attributes.position,b=new L;for(let v=0;v<a;v++){b.fromBufferAttribute(d,v);const[_,R]=r(b);l[v*2]=_,l[v*2+1]=R}for(let v=0;v<a;v+=3){const _=[l[v*2],l[v*2+2],l[v*2+4]];if(Math.max(..._)-Math.min(..._)>.5)for(let R=0;R<3;R++)l[(v+R)*2]<.5&&(l[(v+R)*2]+=1)}}else for(let d=0;d<a;d++)l[d*2]=Ul[0],l[d*2+1]=Ul[1];o.setAttribute("uv",new Pt(l,2));const c=new Float32Array(a*3),h=new Uint16Array(a*4),u=new Float32Array(a*4),p=typeof i=="function"?i:null,f=typeof t=="function"?t:null;p||Ji.set(i);const g=new L,y=new L,m=new L;for(let d=0;d<a;d++){if(p&&d%3===0){const _=o.attributes.position;g.fromBufferAttribute(_,d),y.fromBufferAttribute(_,d+1),m.fromBufferAttribute(_,d+2),g.add(y).add(m).multiplyScalar(1/3),Ji.set(p(g))}if(c[d*3]=Ji.r,c[d*3+1]=Ji.g,c[d*3+2]=Ji.b,!f){h[d*4]=Eo[t],u[d*4]=1;continue}g.fromBufferAttribute(o.attributes.position,d);const b=f(g).filter(([,_])=>_>.001).slice(0,4),v=b.reduce((_,[,R])=>_+R,0)||1;b.forEach(([_,R],w)=>{h[d*4+w]=Eo[_],u[d*4+w]=R/v})}return o.setAttribute("color",new Pt(c,3)),o.setAttribute("skinIndex",new Oo(h,4)),o.setAttribute("skinWeight",new Pt(u,4)),n.push(o),e!==o&&!e.userData?.keep&&e.dispose?.(),o}const Ye=(n=0,e=0,t=0,i=0,s=0,r=0,o=1,a=1,l=1)=>new He().compose(new L(n,e,t),new gt().setFromEuler(new sn(i,s,r)),new L(o,a,l));function Zs(n,e,t,i,s,r,o=10){const a=new L(...e),l=new L(...t),c=l.clone().sub(a),h=c.length(),u=new pr(i,Math.max(.001,h),3,o),p=new gt().setFromUnitVectors(new L(0,1,0),c.normalize());Oe(n,u,s,r,new He().compose(a.clone().add(l).multiplyScalar(.5),p,new L(1,1,1)))}function Gn(n,e,t,i,s,r,{bone:o,joints:a=[],root:l=null,soft:c=.13,segments:h=14}={}){const u=new L(...e),p=new L(...t),f=p.clone().sub(u),g=f.length(),y=f.clone().normalize(),m=[],d=5,b=12;for(let C=0;C<=d;C++){const S=-Math.PI/2+C/d*Math.PI/2;m.push(new ce(Math.cos(S)*i,-g/2+Math.sin(S)*i))}for(let C=1;C<b;C++)m.push(new ce(i,-g/2+C/b*g));for(let C=0;C<=d;C++){const S=C/d*Math.PI/2;m.push(new ce(Math.cos(S)*i,g/2+Math.sin(S)*i))}m[0].x=m.at(-1).x=0;const v=new Ei(m,h),_=v.attributes.position;for(let C=0;C<_.count;C++){const S=_.getY(C),M=Ue.clamp(.5-S/g,0,1),I=Ue.lerp(i,s,M)/i;_.setXYZ(C,_.getX(C)*I,S+(S>g/2?0:S<-g/2?(S+g/2)*(I-1):0),_.getZ(C)*I)}const R=new gt().setFromUnitVectors(new L(0,-1,0),y),w=new L;Oe(n,v,C=>{const S=w.copy(C).sub(u).dot(y)/g;let M=[[o,1]];for(const[I,z,N]of a){const O=Ue.smoothstep(S,I-c,I+c);M=M.flatMap(([X,Y])=>X===z?[[z,Y*(1-O)],[N,Y*O]]:[[X,Y]])}if(l){const I=l[1]*(1-Ue.smoothstep(S,-.04,l[2]??.2));M=M.map(([z,N])=>[z,N*(1-I)]),M.push([l[0],I])}return M},r,new He().compose(u.clone().add(p).multiplyScalar(.5),R,new L(1,1,1)))}const Ge=(n,e,t,i,s,r=[1,1,1],o=12,a=8)=>Oe(n,new Mt(e,o,a),i,s,Ye(t[0],t[1],t[2],0,0,0,...r)),Vc=Object.freeze({crop:{front:.46,side:.02,back:-.5,radius:1.07,faceHalf:.78},sidepart:{front:.4,swoop:.28,side:0,back:-.5,radius:1.08,faceHalf:.78},bob:{front:.24,side:-.62,back:-.66,radius:1.12,faceHalf:.64},long:{front:.3,side:-.62,back:-.7,radius:1.11,faceHalf:.64},ponytail:{front:.44,side:.02,back:-.25,radius:1.08,faceHalf:.78},braids:{front:.4,swoop:.26,side:-.12,back:-.6,radius:1.08,faceHalf:.74},bun:{front:.46,side:.02,back:-.32,radius:1.07,faceHalf:.78},spiky:{front:.5,side:.05,back:-.34,radius:1.08,faceHalf:.78},perm:{front:.42,side:-.12,back:-.44,radius:1.15,faceHalf:.74,bumps:!0},buzz:{front:.52,side:.06,back:-.36,radius:1.025,faceHalf:.8},afro:{front:.48,side:-.12,back:-.5,radius:1.34,faceHalf:.74,lift:.18},horseshoe:{ring:!0,radius:1.03},bald:null});function Lg(n,e){const t=Vc[n];if(!t)return null;if(t.ring)return Ig(t);const i=new Mt(1,64,44),s=i.attributes.position,r=new L,o=e?-1:1;for(let a=0;a<s.count;a++){r.fromBufferAttribute(s,a);let l=t.front;t.swoop&&(l-=t.swoop*Ue.smoothstep(r.x*o,-.3,.5));const c=Math.max(.18-r.z,Math.abs(r.x)-t.faceHalf,r.y-l),h=Ue.lerp(t.side,t.back,Ue.smoothstep(-r.z,-.2,.7)),u=Math.min(c,r.y-h),p=u>0,f=t.radius*(1+(t.lift&&r.y>0?r.y*t.lift:0)),g=t.radius<1.04?.985:.8,y=Ue.lerp(g,f,Ue.smoothstep(u,-.035,.035));s.setXYZ(a,r.x*y,r.y*y+(t.lift&&p?t.lift*.25:0),r.z*y)}return i.computeVertexNormals(),i}function Ig(n){const i=new Mt(n.radius,48,8,Math.PI/2+.95,Math.PI*2-1.9,.1,1),s=i.attributes.position,r=i.attributes.uv;for(let o=0;o<s.count;o++){const a=o%49/48,l=Math.PI/2+.95+a*(Math.PI*2-.95*2),c=Ue.smoothstep(-Math.sin(l),-.3,1),h=(1-Math.abs(Math.sin(a*Math.PI*11)))*.09*c,u=Math.acos(.06+c*.5)+h,p=Math.acos(-.42-c*.12),f=u+(1-r.getY(o))*(p-u),g=Ue.smoothstep(Math.min(a,1-a),0,.08),y=Ue.lerp(p-.12,f,.35+.65*g);s.setXYZ(o,-Math.cos(l)*Math.sin(y)*n.radius,Math.cos(y)*n.radius,Math.sin(l)*Math.sin(y)*n.radius)}return i.computeVertexNormals(),i}function ao(n,e,t){const i=n.length,s=e.hair.colour,r=e.hair.style,o=e.hair.flip?-1:1,a=t.Rh,l=0,c=t.headCentre-t.headY,h=[t.headSX*a,t.headSY*a,a*.98],u=(g,y,m)=>[g,t.headY+y,m],p=Lg(r,e.hair.flip);if(p){const g=p.attributes.position,y=new L;for(let m=0;m<g.count;m++)y.fromBufferAttribute(g,m),hs(y,t.profile),g.setXYZ(m,y.x,y.y,y.z);p.computeVertexNormals(),Oe(n,p,"head",s,Ye(l,t.headY+c,0,0,0,0,...h))}const f=new Ne(s).multiplyScalar(.82).getStyle();if(r==="long"&&Ge(n,a*.95,u(0,c-a*.72,-a*.55),"head",s,[1.05,1.25,.5]),r==="ponytail"&&(Ge(n,a*.34,u(0,c+a*.1,-a*1.05),"head",s,[1,1,1]),Ge(n,a*.3,u(0,c-a*.45,-a*1.18),"head",s,[.9,1.9,.9]),Ge(n,a*.16,u(0,c+a*.1,-a*1.2),"head",e.outfit.accent)),r==="bun"&&Ge(n,a*.42,u(0,c+a*.95,-a*.3),"head",s),r==="spiky")for(let g=0;g<9;g++){const y=g/9*Math.PI*2,m=Math.cos(y)*a*.55,d=Math.sin(y)*a*.5-a*.1,b=new bi(a*.2,a*.5,6);Oe(n,b,"head",s,Ye(m,t.headY+c+a*.88,d,Math.sin(y)*.5,0,-Math.cos(y)*.5))}if(r==="perm")for(let g=0;g<22;g++){const y=g*2.39996,m=.2+.75*(g*.618%1),d=Math.sqrt(1-m*m),b=Math.cos(y)*d,v=Math.sin(y)*d;v>.35&&m<.55||Ge(n,a*.24,u(b*a*1.1*t.headSX,c+m*a*1.1,v*a*1.05),"head",g%3?s:f,[1,1,1],8,6)}if(r==="braids")for(const g of[-1,1]){const y=g*a*.8,m=-a*.35;let d=c-a*.35;for(let b=0;b<6;b++){const v=a*(.2-b*.012);Ge(n,v,u(y+g*a*.05,d,m+a*.05*b),"head",b%2?s:f,[1,1.3,1],8,6),d-=v*1.5}Ge(n,a*.13,u(y+g*a*.05,d+a*.05,m+a*.3),"head",e.outfit.accent,[1.2,.7,1.2],8,6),Ge(n,a*.12,u(y+g*a*.05,d-a*.12,m+a*.3),"head",s,[1,1.4,1],8,6)}if((r==="sidepart"||r==="braids")&&Ge(n,a*.34,u(o*a*.5,c+a*.62,a*.62),"head",s,[1.4,.55,.7],10,6),(r==="bob"||r==="long")&&Ge(n,a*.4,u(0,c+a*.52,a*.72),"head",s,[2,.5,.6],10,6),!["none","headband","ribbon"].includes(e.outfit.hat))for(const g of n.slice(i)){const y=g.attributes.position;g.userData.hatHair={position:y.array.slice(),normal:g.attributes.normal.array.slice()};for(let m=0;m<y.count;m++){const d=y.getX(m)/h[0],b=(y.getY(m)-t.headCentre)/h[1],v=y.getZ(m)/h[2],_=Math.hypot(d,b,v);if(b>.3&&_>1.035){const R=1.035/_;y.setXYZ(m,d*R*h[0],t.headCentre+b*R*h[1],v*R*h[2])}}g.computeVertexNormals()}}function Dg(n,e){const t=Vc[n],i=56,s=new Mt(1,i,1,0,Math.PI*2,.5,.5),r=s.attributes.position,o=s.attributes.uv,a=new L;let l=[0,.4,-1];for(let c=0;c<r.count;c++){const h=c%(i+1)/i,u=h*Math.PI*2,p=Math.sin(u),f=Math.cos(u),g=Ue.smoothstep(-f,-.2,1),y=.3+g*.14,m=y+(o.getY(c)-.5)*.14,d=Math.sqrt(1-m*m);a.set(p*d,m,f*d);let b=1.035;if(t&&!t.ring){const v=Math.max(.18-a.z,Math.abs(a.x)-t.faceHalf,a.y-t.front),_=Ue.lerp(t.side,t.back,Ue.smoothstep(-a.z,-.2,.7)),R=Math.min(v,a.y-_),w=t.radius*(1+(t.lift&&a.y>0?a.y*t.lift:0))+.03;b=Ue.lerp(1.035,Math.max(1.035,w),Ue.smoothstep(R,-.06,.06))}else t?.ring&&g>.3&&(b=t.radius+.03);a.multiplyScalar(b),hs(a,e),r.setXYZ(c,a.x,a.y,a.z),Math.abs(h-.5)<1e-6&&o.getY(c)>.5&&(l=[0,a.y-.07,a.z])}return s.computeVertexNormals(),{geometry:s,knot:l}}function Ng(n,e=$o(n)){return{brimY:e.headCentre+e.Rh*e.headSY*.55,crownHeight:e.Rh*e.headSY*.8}}function Gc(n,e,t){const i=e.outfit.hat,s=e.outfit.hatColour,r=t.Rh;if(t.headCentre+r*t.headSY*.2,i==="none")return;const o=[t.headSX*r,t.headSY*r,r];if(i==="cap"||i==="police"||i==="captain"){const a=new Mt(1.1,24,12,0,Math.PI*2,0,Math.PI*.5);Oe(n,a,"head",s,Ye(0,t.headCentre+r*t.headSY*.23,0,-.08,0,0,o[0],o[1]*(i==="cap"?.9:1.05),o[2])),Ge(n,r*.68,[0,t.headCentre+r*t.headSY*.25,r*.9],"head",i==="cap"?s:"#1c1c24",[t.headSX*1.4,.07,1],20,8),i!=="cap"&&(Oe(n,new Ze(r*1.12,r*1.12,r*.14,24,1,!0),"head",i==="captain"?"#1c1c24":"#e0b93a",Ye(0,t.headCentre+r*.26,0,-.08)),Ge(n,r*.1,[0,t.headCentre+r*.62,r*1.02],"head","#e0b93a",[1,1,.4],8,6))}else if(i==="helmet")i!=="paperboat"&&Oe(n,new Mt(1.16,24,12,0,Math.PI*2,0,Math.PI*.52),"head",s,Ye(0,t.headCentre+r*t.headSY*.35,0,0,0,0,o[0],o[1]*.9,o[2])),Oe(n,new nn(1.16,.045,6,24),"head",s,Ye(0,t.headCentre+r*t.headSY*.35,0,Math.PI/2,0,0,o[0],o[2],o[1]));else if(i==="straw"){const a=Ng(e,t),l=a.brimY;Oe(n,new sr(r*.98,r*2.1,32),"head",s,Ye(0,l,0,-Math.PI/2,0,0,t.headSX,1,1)),Oe(n,new sr(r*.98,r*2.1,32),"head",s,Ye(0,l-.012*t.k,0,Math.PI/2,0,0,t.headSX,1,1)),Oe(n,new Ze(r*.78,r*1.08,a.crownHeight,24,1,!0),"head",s,Ye(0,l+a.crownHeight/2,0,0,0,0,t.headSX,1,1)),Oe(n,new Wo(r*.78,24),"head",s,Ye(0,l+a.crownHeight,0,-Math.PI/2,0,0,t.headSX,1,1)),Oe(n,new Ze(r*1.045,r*1.09,r*.12*t.headSY,24,1,!0),"head","#d8342c",Ye(0,l+r*.06*t.headSY,0,0,0,0,t.headSX,1,1))}else if(i==="beanie")Oe(n,new Mt(1.17,20,12,0,Math.PI*2,0,Math.PI*.49),"head",s,Ye(0,t.headCentre+r*.12,0,0,0,0,...o)),Oe(n,new nn(1.14,.09,6,24),"head",s,Ye(0,t.headCentre+r*.18,0,Math.PI/2,0,0,o[0],o[2],o[1])),Ge(n,r*.22,[0,t.headCentre+r*t.headSY*1.32,0],"head",s,[1,1,1],10,8);else if(i==="beret")Ge(n,r,[r*.15,t.headCentre+r*t.headSY*.83,0],"head",s,[t.headSX*1.35,.38,1.25],20,12),Oe(n,new Ze(r*.055,r*.055,r*.15,6),"head",s,Ye(r*.15,t.headCentre+r*t.headSY*1.2,0));else if(i==="bucket"){const a=t.headCentre+r*t.headSY*.88;Oe(n,new Ze(r*.93,r*1.13,r*.62,20),"head",s,Ye(0,a,0,0,0,0,t.headSX,1,1)),Oe(n,new Ze(r*1.12,r*1.5,r*.16,24,1,!0),"head",s,Ye(0,a-r*.33,0,0,0,0,t.headSX,1,1))}else if(["squid","teapot","sunflower","paperboat","mountain"].includes(i)){i!=="paperboat"&&Oe(n,new Mt(1.16,24,12,0,Math.PI*2,0,Math.PI*.49),"head",s,Ye(0,t.headCentre+r*t.headSY*.35,0,0,0,0,o[0],o[1]*.86,o[2]));const a=t.headCentre+r*t.headSY*1.16;if(i==="squid"){Ge(n,r*.6,[0,a+r*.2,0],"head",s,[1,.9,1],16,12);for(const l of[-1,1]){Ge(n,r*.12,[l*r*.25,a+r*.2,r*.53],"head","#f4f1ea",[1,1,.45],10,8),Ge(n,r*.055,[l*r*.25,a+r*.2,r*.59],"head","#27304d",[1,1,.4],8,6);for(const c of[-.45,.05])Zs(n,[l*r*.78,a-r*.18,c*r],[l*r*.96,a-r*.65,c*r],r*.1,"head",s,8)}}else if(i==="teapot")Ge(n,r*.62,[0,a+r*.14,0],"head",s,[1.15,.72,1],16,12),Oe(n,new nn(r*.38,r*.07,8,18),"head",s,Ye(-r*.66,a+r*.14,0)),Oe(n,new bi(r*.17,r*.55,12),"head",s,Ye(r*.69,a+r*.25,0,0,0,-.9)),Ge(n,r*.12,[0,a+r*.67,0],"head",e.outfit.accent,[1,.6,1],10,8);else if(i==="sunflower"){for(let l=0;l<10;l++){const c=l*Math.PI/5;Ge(n,r*.25,[Math.cos(c)*r*.45,a+r*.44+Math.sin(c)*r*.45,r*.25],"head","#f4d23c",[1,.65,.25],10,8)}Ge(n,r*.29,[0,a+r*.44,r*.31],"head","#9a6a42",[1,1,.3],12,10)}else if(i==="mountain")Oe(n,new bi(r*.75,r*.86,12),"head",s,Ye(0,a+r*.26,0)),Oe(n,new bi(r*.31,r*.38,12),"head","#f4f1ea",Ye(0,a+r*.69,0));else{for(const l of[-1,1]){const c=new _t;c.setAttribute("position",new Ke([-r*1.25,a,l*r*.65,r*1.25,a,l*r*.65,0,a+r*.67,0],3)),c.computeVertexNormals(),Oe(n,c,"head","#f4f1ea")}Oe(n,new wt(r*2.45,r*.16,r*.11),"head",s,Ye(0,a-r*.02,r*.66))}}else if(i==="ribbon"){const a=r*t.headSX*.68,l=t.headCentre+r*t.headSY*.85,c=r*.52;for(const h of[-1,1])Ge(n,r*.2,[a+h*r*.16,l,c],"head",s,[1.1,.7,.45],10,8);Ge(n,r*.09,[a,l,c+r*.04],"head",s,[1,1,.7],8,6)}else if(i==="headband"){const a=Dg(e.hair.style,t.profile);Oe(n,a.geometry,"head",s,Ye(0,t.headCentre,0,0,0,0,...o)),Ge(n,r*.13,[0,t.headCentre+a.knot[1]*o[1],a.knot[2]*o[2]-r*.04],"head",s,[1.5,.8,.7],8,6)}else i==="kerchief"&&(Oe(n,new Mt(1.1,24,12,0,Math.PI*2,0,Math.PI*.36),"head",s,Ye(0,t.headCentre+r*.05,-r*.12,-.45,0,0,...o)),Ge(n,r*.2,[0,t.headCentre+r*.1,-r*1.1],"head",s,[1.3,.9,.9],8,6))}function Ly(n,{mode:e="wall",shadows:t=!0}={}){const i=Ot(n);if(i.outfit.hat==="none")return null;const s=[];if(Gc(s,i,$o(i)),!s.length)return null;const r=Ks(s,!1);s.forEach(c=>c.dispose());for(const c of["skinIndex","skinWeight"])r.deleteAttribute(c);r.computeBoundingBox();const o=r.boundingBox,a=o.getCenter(new L);r.translate(-a.x,e==="stand"?-o.min.y:-a.y,e==="stand"?-a.z:-o.min.z),r.computeBoundingSphere();const l=new ht(r,br(new St({vertexColors:!0}),{bands:"soft3"}));return l.name=(i.name||"Resident")+"’s hat",l.castShadow=t,l.receiveShadow=!0,l.userData.hatProp=!0,l}function Ug(n,e,t){const i=e.accessories,s=t.Rh,r=i.colour;if(i.earrings!=="none")for(const o of[-1,1]){const a=o*s*t.headSX*1.035,l=t.headCentre-s*.21,c=s*.04;i.earrings==="studs"?Ge(n,s*.085,[a,l,c],"head",r,[1,1,.65],8,6):Oe(n,new nn(s*.16,s*.035,6,14),"head",r,Ye(a,l-s*.1,c,0,o*.5))}i.neckwear==="pendant"?(Oe(n,new nn(t.width*.3,t.k*.007,5,18),"chest",r,Ye(0,t.neckY-.035,t.depth*.05,Math.PI/2-.5)),Ge(n,t.k*.025,[0,t.neckY-.12,t.depth*.53],"chest",r,[.7,1,.35],8,6)):i.neckwear==="scarf"&&(Oe(n,new nn(t.armR*1.7,t.armR*.55,6,18),"chest",r,Ye(0,t.neckY-.035,0,Math.PI/2)),Oe(n,new wt(t.width*.22,t.torso*.5,.025),"chest",r,Ye(t.width*.14,t.neckY-t.torso*.28,t.depth*.53,0,0,-.15))),i.pin&&Ge(n,t.k*.024,[t.width*.22,t.neckY-t.torso*.28,t.depth*.52],"chest",r,[1,1,.3],8,6)}const kg=n=>n.facial.style==="none"&&(["bob","long","ponytail","braids","bun","perm"].includes(n.hair.style)||n.mouth.colour!=="#b8544a");function Wc(n,e){const t=1+(n.body.build-.5)*.12,i=e.hips/e.width;return[[0,-.1],[i*.86,-.08],[i,.05],[i,.13],[i,.15],[e.waistRatio*t,.3],[e.waistRatio*(1+(t-1)*.6),.5],[1,.66],[.985,.74],[.95,.8],[.88,.87],[.76,.93],[.58,.98],[.38,1.01],[.19,1.03],[0,1.04]]}function Fl(n,e){const t=document.createElement("canvas");t.width=Pn.width,t.height=Pn.height;const i=t.getContext("2d"),s=Wc(n,e),r=Rg(i,n,e,h=>Js(s,h))||[],o=new gc(t);o.colorSpace=Ft,o.wrapS=1e3,o.generateMipmaps=!1,o.minFilter=1006,o.anisotropy=4;const a=br(new St({vertexColors:!0}),{bands:"soft3"});a.map=o;const l=a.onBeforeCompile,c=a.customProgramCacheKey?.bind(a);return a.onBeforeCompile=(h,u)=>{l?.call(a,h,u),h.fragmentShader=h.fragmentShader.replace("#include <map_fragment>","").replace("#include <color_fragment>",`#include <color_fragment>
#ifdef USE_MAP
 vec4 garment = texture2D( map, vMapUv );
 diffuseColor.rgb = mix( diffuseColor.rgb, garment.rgb, garment.a );
#endif`)},a.customProgramCacheKey=()=>"garment_"+(c?c():""),a.userData.garment={canvas:t,texture:o,marks:r},a}function lo(n,e,t,i=!1){const s=e.outfit,r=e.body.skin,o=i?r:s.topColour,a=i?e.swim.colour:s.bottomColour,l=t.width,c=t.depth,h=t.hipY,u=!i&&s.top==="tank",p=!i&&s.bottom==="underwear",f=Wc(e,t),g=new Ei(f.map(([_,R])=>new ce(_,R)),28),y=h+t.torso*(p?.05:.13);if(Oe(n,g,"chest",_=>i?_.y<y?a:r:_.y<y?a:u||s.top==="sundress"&&(_.y-h)/t.torso>.78?r:o,Ye(0,h,0,0,0,0,l/2,t.torso,c/2),i?null:_=>Eg(_,t)),u){const R=f.filter(([,S])=>S>=.05&&S<=.77).concat([[Js(f,.77),.77]]),w=new Ei(R.map(([S,M])=>new ce(S*1.025,M)),28);Oe(n,w,"chest",o,Ye(0,h,0,0,0,0,l/2,t.torso,c/2));const A=.4,C=S=>{const M=Js(f,S)*1.025;return c/2*Math.sqrt(Math.max(0,M*M-A*A))+.004*t.k};for(const S of[-1,1]){const M=S*l/2*A,I=[.77,.9,1].map(N=>[M,h+t.torso*N,C(N)]);I.push([M,h+t.torso*1.035,0]);const z=I.concat(I.slice(0,-1).reverse().map(([N,O,X])=>[N,O,-X]));for(let N=1;N<z.length;N++)Zs(n,z[N-1],z[N],.016*t.k,"chest",o,6)}}if(i&&kg(e)&&Oe(n,new Ze(l*.52,l*.52,t.torso*.2,16,1,!0),"chest",e.swim.colour,Ye(0,h+t.torso*.66,0,0,0,0,1,1,c/l)),Zs(n,[0,t.neckY-.02,0],[0,t.headY+.01,0],t.armR*1.2,"neck",r,8),!i&&s.top==="hoodie"&&Oe(n,new Mt(t.width*.35,16,12,0,Math.PI*2,0,Math.PI*.75),"chest",o,Ye(0,t.neckY-.045,-c*.32,.9,0,0,1,.7,.55)),!i&&["lighthouse","lantern","reef"].includes(s.top)){const _=h+t.torso*.52;if(s.top==="lantern"){Oe(n,new Mt(1,24,16),"chest",o,Ye(0,_,0,0,0,0,l*.63,t.torso*.55,c*.68));for(const R of[.12,.9])Oe(n,new Ze(l*.48,l*.48,.026*t.k,24),"chest",s.accent,Ye(0,h+t.torso*R,0,0,0,0,1,1,c/l));for(const R of[-.9,-.45,0,.45,.9]){const w=[];for(let A=0;A<=10;A++){const C=-1.05+A*.21;w.push([Math.sin(R)*l*.64*Math.cos(C),_+Math.sin(C)*t.torso*.55,Math.cos(R)*c*.69*Math.cos(C)])}for(let A=1;A<w.length;A++)Zs(n,w[A-1],w[A],.007*t.k,"chest",s.accent,5)}}else if(s.top==="lighthouse"){for(const R of[.25,.6])Oe(n,new Ze(l*.51,l*.51,t.torso*.11,24,1,!0),"chest",s.accent,Ye(0,h+t.torso*R,0,0,0,0,1,1,c/l));Oe(n,new nn(l*.11,.012*t.k,8,18),"chest",s.accent,Ye(0,h+t.torso*.79,c*.38)),Ge(n,l*.09,[0,h+t.torso*.79,c*.38],"chest","#7fb0d8",[1,1,.2],12,8)}else{for(const R of[-1,1]){const w=new _t;w.setAttribute("position",new Ke([R*l*.42,h+t.torso*.24,-c*.15,R*l*.9,h+t.torso*.49,-c*.15,R*l*.42,h+t.torso*.83,-c*.15],3)),w.computeVertexNormals(),Oe(n,w,"chest",s.accent);const A=w.clone();A.scale(1,1,-1),Oe(n,A,"chest",s.accent)}for(let R=0;R<3;R++)Ge(n,.026*t.k,[(R-1)*l*.19,_,c*.52],"chest",s.accent,[1,1,.35],8,6)}}if(!i&&s.top==="apron"){const _=h+t.torso*.75,R=h-t.thigh*.78,w=new cs(l*.7,_-R,8,14);w.translate(0,(_+R)/2,0);const A=w.attributes.position,C=["skirt","longskirt"].includes(s.bottom),S=s.bottom==="longskirt"?t.thigh+t.shin*.85:t.thigh*.9;for(let I=0;I<A.count;I++){const z=A.getY(I),N=(z-h)/t.torso,O=z>=h?l/2*Js(f,N):C?Ue.lerp(t.hips*.53,t.hips*.66+S*.22,Ue.clamp((h+.03-z)/S,0,1)):l*.52,X=A.getX(I)*(z>h?1-Ue.clamp(N,0,1)*.25:1);A.setXYZ(I,X,z,O*c/l*Math.sqrt(Math.max(.05,1-(X/O)**2))+.025*t.k)}w.computeVertexNormals(),Oe(n,w,I=>{if(I.y>h){const O=Ue.smoothstep(I.y,h,h+t.torso*.35);return[["hips",1-O],["chest",O]]}const z=Ue.smoothstep(h-I.y,.02,.12),N=Ue.smoothstep(I.x,-l*.25,l*.25);return[["hips",1-z],["thighL",z*N],["thighR",z*(1-N)]]},new Ne(s.topColour).multiplyScalar(1.12).getHex())}const d=!i&&["jacket","smock","hoodie","cardigan","festival","lighthouse","lantern","reef"].includes(s.top),b=t.upper/(t.upper+t.fore);for(const _ of["L","R"]){const R=_==="L"?1:-1,w=[R*t.shoulderX,t.shoulderY,0],A=[R*(t.shoulderX+.015),t.shoulderY-t.upper-t.fore,0],C={bone:"shoulder"+_,joints:[[b,"shoulder"+_,"elbow"+_]]};Gn(n,w,A,t.armR*1.04,t.armR*.86,i||!d?r:o,C);const S=M=>{const I=Ue.smoothstep(Math.abs(M.x),t.shoulderX-t.armR*1.1,t.shoulderX+t.armR*.3);return[["chest",1-I],["shoulder"+_,I]]};if(Oe(n,new Mt(t.armR*1.14,16,12),S,i||u||s.top==="sundress"?r:o,Ye(w[0]-R*t.armR*.15,w[1]+t.armR*.05,0,0,0,0,1,.92,Math.min(1.1,c/l*1.6))),!i&&s.top==="kariyushi"){const M=t.upper*.76,I=w[1]-M/2;Oe(n,new Ze(t.armR*1.2,t.armR*1.3,M,16,1,!0),C,o,Ye(w[0]+R*.008,I,0,0,0,R*.035))}else!i&&!d&&!u&&s.top!=="sundress"&&Gn(n,w,[w[0]+R*.006,w[1]-t.upper*.58,0],t.armR*1.12,t.armR*1.16,o,{...C,joints:[]});Ge(n,t.hand,[A[0],A[1]-t.hand*.55,0],"hand"+_,r,[.9,1.15,.78],12,10),Ge(n,t.hand*.42,[A[0]-R*t.hand*.55,A[1]-t.hand*.35,t.hand*.42],"hand"+_,r,[1,1.2,1],8,6)}const v=i?"swim":s.bottom;for(const _ of["L","R"]){const R=_==="L"?1:-1,w=[R*t.hipX,h,0];R*t.hipX,h-t.thigh;const A=[R*t.hipX,t.foot,0],C={bone:"thigh"+_,joints:[[t.thigh/(h-t.foot),"thigh"+_,"knee"+_]]},S=v==="trousers"||v==="widepants";if(Gn(n,w,A,t.legR*(v==="widepants"?1.32:1.02),t.legR*(v==="widepants"?1.28:.86),S?a:r,C),v==="cropped"||v==="culottes"){const I=v==="cropped"?t.foot+t.shin*.35:h-t.thigh*1.12;Gn(n,w,[w[0],I,0],t.legR*(v==="culottes"?1.55:1.12),t.legR*(v==="culottes"?1.7:1.16),a,C)}(v==="shorts"||v==="swim")&&Gn(n,[w[0],w[1]+t.legR*.3,0],[w[0]*1.04,h-t.thigh*(v==="swim"?.22:.55),0],t.legR*1.2,t.legR*1.26,a,{...C,joints:[]}),v==="underwear"&&Gn(n,[w[0],w[1]+t.legR*.3,0],[w[0]*1.02,h-t.thigh*.16,0],t.legR*1.12,t.legR*1.14,a,{...C,joints:[]});const M=i?"barefoot":s.footwear;M==="barefoot"||M==="sandals"?(Ge(n,t.legR*1.12,[R*t.hipX,t.foot*.55,t.legR*.5],"foot"+_,r,[1,.55,1.7],12,8),M==="sandals"&&(Ge(n,t.legR*1.24,[R*t.hipX,t.foot*.12,t.legR*.55],"foot"+_,e.age==="elder"?"#6b4a32":"#c8a878",[1,.18,1.8],12,6),Ge(n,t.legR*.42,[R*t.hipX,t.foot*.55+t.legR*.55,t.legR*.95],"foot"+_,s.shoes,[2.3,.5,.8],10,6))):(Ge(n,t.legR*1.25,[R*t.hipX,t.foot*.62,t.legR*.55],"foot"+_,s.shoes,[1,.6,M==="shoes"?1.85:1.75],12,8),M==="boots"&&Gn(n,[R*t.hipX,t.foot,0],[R*t.hipX,t.foot+t.shin*.65,0],t.legR*1.08,t.legR*1.05,s.shoes,{bone:"knee"+_,joints:[]}),Ge(n,t.legR*1.32,[R*t.hipX,t.foot*.16,t.legR*.6],"foot"+_,M==="shoes"?"#2b2622":e.age==="elder"?"#6b4a32":"#f2efe6",[1,.24,1.8],12,6))}if(v==="skirt"||v==="longskirt"||v==="pleatedskirt"){const _=v==="skirt"||v==="pleatedskirt"?t.thigh*.9:t.thigh+t.shin*.85,R=A=>{const C=Ue.smoothstep(h-A.y,.02,.12),S=Ue.smoothstep(A.x,-l*.25,l*.25);return[["hips",1-C],["thighL",C*S],["thighR",C*(1-S)]]},w=new Ze(t.hips*.53,t.hips*.66+_*.22,_,v==="pleatedskirt"?64:24,6,!0);if(v==="pleatedskirt"){const A=w.attributes.position;for(let C=0;C<A.count;C++){const S=A.getX(C),M=A.getZ(C),I=1+.055*Math.cos(Math.atan2(M,S)*16);A.setXYZ(C,S*I,A.getY(C),M*I)}w.computeVertexNormals()}Oe(n,w,R,s.bottomPattern==="plaid"?(A=>{const C=Math.floor(Math.atan2(A.x,A.z)*12/Math.PI)%4===0,S=Math.floor((h-A.y)/(.06*t.k))%4===0;return C||S?s.accent:a}):a,Ye(0,h+.03-_/2,0,0,0,0,1,1,c/l))}}const Fg=.011,co=new Map;function Ol({skinned:n=!0,colour:e=null,width:t=Fg}={}){const i=(n?"s":"m")+(e??"v")+t;if(co.has(i))return co.get(i);const s=new Fo({color:e??16777215,vertexColors:e==null,side:1});s.name="Shimanchu outline",s.userData.outline=!0;const r={value:t};return s.onBeforeCompile=o=>{o.uniforms.uOutline=r,o.vertexShader=`uniform float uOutline;
`+o.vertexShader.replace("#include <project_vertex>",(n?`vec3 outlineN = normalize( objectNormal );
`:`vec3 outlineN = normalize( position );
`)+`transformed += outlineN * uOutline;
#include <project_vertex>`),e==null&&(o.fragmentShader=o.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
 diffuseColor.rgb *= vec3( 0.32, 0.27, 0.27 );`))},s.customProgramCacheKey=()=>"shimanchu-outline-"+i,co.set(i,s),s}function ho(n,e,t){const i=t?new js(e.geometry,Ol({skinned:!0})):new ht(e.geometry,Ol({skinned:!1,colour:4861992}));return i.name=e.name+" outline",i.castShadow=!1,i.receiveShadow=!1,i.frustumCulled=!1,i.userData.outline=!0,t?(i.bind(e.skeleton,e.bindMatrix),n.add(i)):e.add(i),i}function Og(n,e,t){const i=document.createElement("canvas");i.width=i.height=t;const s=i.getContext("2d"),r=new gc(i);r.colorSpace=Ft,r.anisotropy=4;let o=new Mt(1,36,26);const a=o.attributes.position,l=o.attributes.uv,c=new L,h=Math.PI/2-.95,u=1.9,p=Math.PI*.28,f=Math.PI*.58;for(let w=0;w<a.count;w++){c.fromBufferAttribute(a,w);const A=Math.atan2(c.z,-c.x),C=Math.acos(Ue.clamp(c.y,-1,1));l.setXY(w,Ue.clamp((A-h)/u,.002,.998),Ue.clamp(1-(C-p)/f,.002,.998)),hs(c,e.profile),a.setXYZ(w,c.x,c.y,c.z)}o.scale(e.Rh*e.headSX,e.Rh*e.headSY,e.Rh*.98),o.computeVertexNormals();const g=o.attributes.normal,y=new L,m=new L(0,.4,.92).normalize();for(let w=0;w<g.count;w++)y.fromBufferAttribute(g,w),y.lerp(m,Ue.smoothstep(y.z,-.35,.45)*.7).normalize(),g.setXYZ(w,y.x,y.y,y.z);const d=o;o=d.toNonIndexed(),d.dispose();const b=o.attributes.position,v=o.attributes.uv;for(let w=0;w<b.count;w+=3){const A=[v.getX(w),v.getX(w+1),v.getX(w+2)];if(b.getZ(w)<=0&&b.getZ(w+1)<=0&&b.getZ(w+2)<=0||Math.max(...A)-Math.min(...A)>.5)for(let S=0;S<3;S++)v.setXY(w+S,.002,.002)}const _=br(new St({map:r,emissive:16777215,emissiveMap:r,emissiveIntensity:.05}),{bands:"soft3"}),R=new ht(o,_);return R.name="Shimanchu head",R.position.y=e.headCentre-e.headY,{head:R,canvas:i,ctx:s,texture:r}}function uo(n,e,t){if(e.nose.style==="none")return;const i=vr(e),s=Math.PI*.28+i.noseY/256*Math.PI*.58,r=Math.PI/2-.95+i.noseX/256*1.9,o=hs(new L(-Math.cos(r)*Math.sin(s),Math.cos(s),Math.sin(r)*Math.sin(s)),t.profile),a=e.nose.style==="hook",l=e.nose.style==="wide",c=t.Rh*(.065+e.nose.size*.055);Ge(n,c,[o.x*t.Rh*t.headSX,t.headCentre+o.y*t.Rh*t.headSY,o.z*t.Rh*.98+c*.55],"head",e.body.skin,[l?1.45:.85,a?1.55:.85,a?1.65:1.2],12,10)}function Ao(n,{shadows:e=!0,faceSize:t=256}={}){const i=Ot(n),s=$o(i),r=Cg(s),o={},a=To.map(N=>{const O=new fc;return O.name=N,o[N]=O,O});for(const N of To){const O=o[N],X=r[N],Y=Pg[N];if(Y){const se=r[Y];O.position.set(X[0]-se[0],X[1]-se[1],X[2]-se[2]),o[Y].add(O)}else O.position.set(...X)}const l=[];lo(l,i,s,!1);const c=l.reduce((N,O)=>N+O.attributes.position.count,0);for(const N of["L","R"]){const O=N==="L"?1:-1,X=O*(s.shoulderX+.015),Y=s.shoulderY-s.upper-s.fore;for(let se=0;se<4;se++)Oe(l,new pr(s.hand*.105,s.hand*(se===0||se===3?.4:.6),3,6),"hand"+N,i.body.skin,Ye(X+(se-1.5)*s.hand*.37,Y-s.hand*(se===0||se===3?1.65:1.85),s.hand*.04,0,0,(se-1.5)*.16))}const h=l.reduce((N,O)=>N+O.attributes.position.count,0);uo(l,i,s);for(const N of[-1,1])Ge(l,s.Rh*.2,[N*s.Rh*s.headSX*.97,s.headCentre-s.Rh*.08,-s.Rh*.05],"head",i.body.skin,[.55,1,.8],8,6);ao(l,i,s),Ug(l,i,s);const u=l.reduce((N,O)=>N+O.attributes.position.count,0);Gc(l,i,s);const p=[];let f=0;for(const N of l)N.userData.hatHair&&p.push({offset:f,original:N.userData.hatHair,tucked:{position:N.attributes.position.array.slice(),normal:N.attributes.normal.array.slice()}}),f+=N.attributes.position.count*3;let g=!0;const y=Ks(l,!1);l.forEach(N=>N.dispose());const m=y.attributes.position.count>u;y.computeBoundingSphere();const d=Fl(i,s),b=new js(y,d);b.name="Shimanchu body",b.add(o.root),b.bind(new Ho(a)),b.castShadow=e,b.receiveShadow=!0,b.frustumCulled=!1;let v=null,_=null,R=null;const w=Og(i,s,t);w.head.castShadow=e,w.head.receiveShadow=!0,o.head.add(w.head);const A=new Xt;A.name="Shimanchu · "+(i.name||"resident"),A.add(b,o.root),A.rotation.y=Math.PI;const C=ho(A,b,!0);ho(w.head,w.head,!1);const S=y.attributes.position.array.slice(c*3,h*3),M=S.slice();for(let N=c;N<h;N++){const O=y.attributes.skinIndex.getX(N)===Eo.handL?1:-1,X=(N-c)*3;M[X]=O*(s.shoulderX+.015),M[X+1]=s.shoulderY-s.upper-s.fore-s.hand*.55,M[X+2]=0}y.attributes.position.array.set(M,c*3);let I=!1;const z={recipe:i,measure:s,root:A,body:b,bones:o,face:w,height:s.H,hasHat:m,garment:d.userData.garment,setOpenHands(N){N=!!N,I!==N&&(I=N,y.attributes.position.array.set(N?S:M,c*3),y.attributes.position.needsUpdate=!0)},setHat(N){if(y.setDrawRange(0,N||!m?1/0:u),g!==!!N){for(const O of p){const X=N?O.tucked:O.original;y.attributes.position.array.set(X.position,O.offset),y.attributes.normal.array.set(X.normal,O.offset)}p.length&&(y.attributes.position.needsUpdate=!0,y.attributes.normal.needsUpdate=!0),g=!!N}},get hatOn(){return m&&y.drawRange.count===1/0},faceState:{expression:"neutral",blink:0,talk:0,look:[0,0]},paintFace(N){const O=z.faceState,X={...O,...N},Y=X.expression+"|"+(X.blink>.5?1:0)+"|"+(X.talk>.5?1:0)+"|"+Math.round(X.look[0]*2)+","+Math.round(X.look[1]*2);return Y===z.faceKey?!1:(z.faceKey=Y,Object.assign(O,X),hg(w.ctx,i,{...X,size:w.canvas.width}),w.texture.needsUpdate=!0,!0)},wear(N){if(N==="nozomi"&&!_){const O=Ot({...i,outfit:{...i.outfit,...tg}}),X=[];lo(X,O,s),uo(X,O,s);for(const se of[-1,1])Ge(X,s.Rh*.2,[se*s.Rh*s.headSX*.97,s.headCentre-s.Rh*.08,-s.Rh*.05],"head",i.body.skin,[.55,1,.8],8,6);ao(X,O,s);const Y=Ks(X,!1);X.forEach(se=>se.dispose()),_=new js(Y,Fl(O,s)),_.name="Thuan · Nozomi-inspired outfit",_.bind(b.skeleton,b.bindMatrix),_.castShadow=e,_.frustumCulled=!1,A.add(_),R=ho(A,_,!0)}if(N==="swim"&&!v){const O=[];lo(O,i,s,!0),uo(O,i,s);for(const Y of[-1,1])Ge(O,s.Rh*.2,[Y*s.Rh*s.headSX*.97,s.headCentre-s.Rh*.08,-s.Rh*.05],"head",i.body.skin,[.55,1,.8],8,6);ao(O,{...i,outfit:{...i.outfit,hat:"none"}},s);const X=Ks(O,!1);O.forEach(Y=>Y.dispose()),v=new js(X,d),v.name="Shimanchu swimwear",v.bind(b.skeleton,b.bindMatrix),v.castShadow=e,v.frustumCulled=!1,A.add(v)}b.visible=N!=="swim"&&N!=="nozomi",C.visible=b.visible,_&&(_.visible=N==="nozomi",R.visible=_.visible),v&&(v.visible=N==="swim")},dispose(){y.dispose(),d.dispose(),d.map?.dispose(),_&&(_.material.map?.dispose(),_.material.dispose()),w.texture.dispose(),w.head.geometry.dispose(),w.head.material.dispose(),v?.geometry.dispose(),_?.geometry.dispose()}};return z.paintFace({}),z}const Ro="johansson-town-resident-wardrobes";function Bg(n,e=globalThis.localStorage){try{return Jo(JSON.parse(e?.getItem(Ro)||"{}")[n]||"")}catch{return null}}function Iy(n,e,t=globalThis.localStorage){const i=Ot({...e,name:n});let s={};try{s=JSON.parse(t?.getItem(Ro)||"{}")||{}}catch{}return s[n]=Dc(i),t?.setItem(Ro,JSON.stringify(s)),globalThis.dispatchEvent?.(new Event("johansson-appearance-change")),i}const Qo=[{name:"Aya",age:24,role:"bookshop assistant",female:!0,height:1.62,work:[4.3,34],evening:[24,18],home:[-25,-47],top:"#967a99",start:540,close:1110,retire:1210,personality:"Playful mischief",friend:"Emi",look:"Black tank, olive shorts, high ponytail",hairStyle:"pony",outfit:"tank",hello:"Window seat is mine. I bookmark the funny parts — apparently that is not how a lending library works.",gossip:"Emi made a tiny apron for Tama. He has declined every fitting.",clue:"A rain-stained book is drying at the harbour office. Yoshiko knows how to save the pages.",model:"resident-00",build:.88,supperStart:1110,supperEnd:1210,house:{x:-22.4,z:-47,angle:-1.5707963267948966},homeAddress:"1 Willow Alley"},{name:"Kenji",age:32,role:"repairman",female:!1,height:1.76,work:[-3.5,17],evening:[4.5,21],home:[-29,-47],top:"#527d99",start:540,close:1080,retire:1260,personality:"Enthusiastic tinkerer",friend:"Tetsuo",look:"Blue hoodie and tousled ink-black hair",hairStyle:"messy",outfit:"work",hello:"I fixed the kettle. It now whistles in a slightly more confident key.",gossip:"Tetsuo says my repairs are too loud. His radio can be heard from the pier.",clue:"The cabinet outside my workshop runs Star Port. Beat my score and I will show you around.",model:"resident-01",build:.965,supperStart:1092,supperEnd:1207,house:{x:-31.6,z:-47,angle:1.5707963267948966},homeAddress:"2 Willow Alley"},{name:"Mrs Sato",age:68,role:"shopkeeper",female:!0,height:1.55,work:[-4.2,-26],evening:[-26,46],home:[-25,-39],top:"#ad6178",start:540,close:1080,retire:1260,personality:"Affectionately formidable",friend:"Fumiko",look:"Berry apron dress, silver bob and round spectacles",hairStyle:"bun",outfit:"apron",hello:"You look hungry. Yes, I say that to everyone. I am usually right.",gossip:"Fumiko claims she only came for tea. I have saved her the largest bowl.",clue:"Thuan names her plants. The assistant manager by her door is very demanding.",model:"resident-02",build:1.05,supperStart:1104,supperEnd:1234,house:{x:-22.4,z:-39,angle:-1.5707963267948966},homeAddress:"3 Willow Alley"},{name:"Harbour master",age:58,role:"harbour master",female:!1,height:1.74,work:[1.6,-70],evening:[4.2,-48],home:[-29,-39],top:"#405d7e",start:300,close:840,retire:1260,personality:"Dry wit, soft heart",friend:"Mr Fujita",look:"Navy vest, silver hair and round spectacles",hairStyle:"part",outfit:"jacket",hello:"I can predict rain by my knees. The radio insists on taking all the credit.",gossip:"Fujita caught a fish this big. The distance between his hands increases every evening.",clue:"There is a blue-taped folio in the harbour office tray. Take a proper look; it has travelled.",model:"resident-03",build:1.135,supperStart:1020,supperEnd:1120,house:{x:-31.6,z:-39,angle:1.5707963267948966},homeAddress:"4 Willow Alley"},{name:"Bus driver",age:49,role:"bus driver",female:!1,height:1.73,work:[-4.5,44],evening:[-26,46],home:[-25,-32],top:"#498d8b",start:540,close:1080,retire:1260,personality:"Patient storyteller",friend:"Naoko",look:"Navy vest and neat dark hair",hairStyle:"part",outfit:"vest",hello:"I collect passengers and opening sentences. The best stories start at the last stop.",gossip:"Naoko can deliver a letter before I finish reading the address.",clue:"Read the timetable by the stop before you wander down to the water.",model:"resident-04",build:.88,supperStart:1092,supperEnd:1207,house:{x:-22.4,z:-32,angle:-1.5707963267948966},homeAddress:"5 Willow Alley"},{name:"Cold-storage kid",age:19,role:"ice store assistant",female:!1,height:1.69,work:[-8,-55],evening:[-8,-55],home:[-29,-32],top:"#6eaa9b",start:540,close:1080,retire:1260,personality:"Shy, unexpectedly funny",friend:"Kenta",look:"Pale-blue hoodie and chestnut hair",hairStyle:"fringe",outfit:"work",hello:"I work with ice. Breaking it socially is the difficult part.",gossip:"Kenta practises his introduction to Emi in front of the freezer. I try not to applaud.",clue:"Buy ice before you go fishing. The fish appreciate the planning, briefly.",model:"resident-05",build:.965,supperStart:null,supperEnd:130,house:{x:-31.6,z:-32,angle:1.5707963267948966},homeAddress:"6 Willow Alley"},{name:"Officer Mori",age:45,role:"policeman",female:!1,height:1.78,work:[0,49],evening:[-26,46],home:[-25,-25],top:"#4b6e9c",start:1320,close:1800,retire:1800,personality:"Earnest and easily teased",friend:"Reiko",look:"Blue vest and softly greying hair",hairStyle:"crop",outfit:"jacket",hello:"No suspicious activity today. Except someone teaching the cat to ignore me.",gossip:"Reiko asked for a statement. I gave her three pages. She printed the bit about my lunch.",clue:"The river path circles back to the harbour. Keep an eye out for the heron.",model:"resident-06",build:1.05,supperStart:null,supperEnd:null,house:{x:-22.4,z:-25,angle:-1.5707963267948966},homeAddress:"7 Willow Alley"},{name:"Hana",age:17,role:"school pupil",female:!0,height:1.57,work:[43,36],evening:[36,30],home:[-29,-25],top:"#d17b78",start:540,close:1080,retire:1260,personality:"Bold little artist",friend:"Daichi",look:"Coral apron dress and chestnut bob",hairStyle:"bob",outfit:"cardigan",hello:"I sketch everyone while they wait for the bus. Sitting still is their contribution.",gossip:"Daichi says he cannot pose. He has three different heroic expressions prepared.",clue:"The hillside shrine has the best view for drawing roofs.",model:"resident-07",build:1.135,supperStart:null,supperEnd:115,house:{x:-31.6,z:-25,angle:1.5707963267948966},homeAddress:"8 Willow Alley"},{name:"Daichi",age:17,role:"school pupil",female:!1,height:1.7,work:[45,36],evening:[28,50],home:[-25,-20],top:"#cda04f",start:540,close:1080,retire:1260,personality:"Big dreams, gentle nature",friend:"Hana",look:"Ochre hoodie and warm brown hair",hairStyle:"messy",outfit:"sweater",hello:"One day I will pitch a perfect game. Today I am working on finding the ball.",gossip:"Hana drew me as a famous player. She made the ball enormous so I could hit it.",clue:"Hana likes the shrine view. I carry the pencils. It is a specialist position.",model:"resident-08",build:.88,supperStart:null,supperEnd:130,house:{x:-22.4,z:-20,angle:-1.5707963267948966},homeAddress:"9 Willow Alley"},{name:"Mr Fujita",age:73,role:"retired fisherman",female:!1,height:1.64,work:[-38,-60],evening:[-34,39],home:[-29,-20],top:"#73988a",start:540,close:1080,retire:1260,personality:"Cheerful embellisher",friend:"Harbour master",look:"Sea-green vest, white hair and round spectacles",hairStyle:"receding",outfit:"sweater",hello:"The fish was enormous. Ask me tomorrow; I expect it will have grown.",gossip:"The harbour master has heard this story before. He still asks how it ends.",clue:"The outer pier has a bait station. The gulls regard it as their property.",model:"resident-09",build:.965,supperStart:1080,supperEnd:1180,house:{x:-31.6,z:-20,angle:1.5707963267948966},homeAddress:"10 Willow Alley"},{name:"Masaru",age:51,role:"fisherman",female:!1,height:1.72,work:[-38,-74],evening:[24,18],home:[-25,-12],top:"#bd7959",start:540,close:1080,retire:1560,personality:"Boisterous cook-at-heart",friend:"Nao",look:"Rust hoodie and brown hair",hairStyle:"curly",outfit:"work",hello:"A good catch is a good supper. A poor catch is a very long story.",gossip:"Nao lets me suggest specials. She very sensibly ignores most of them.",clue:"Try the grilled skewers at Minato. The last one is always the best one.",model:"resident-10",build:1.05,supperStart:1380,supperEnd:1560,house:{x:-22.4,z:-12,angle:-1.5707963267948966},homeAddress:"11 Willow Alley"},{name:"Yoshiko",age:61,role:"bathhouse keeper",female:!0,height:1.58,work:[-34,39],evening:[-34,39],home:[-29,-12],top:"#9ea66c",start:540,close:1260,retire:1260,personality:"Calm neighbourhood anchor",friend:"Mrs Sato",look:"Sage apron dress and silver bob",hairStyle:"bun",outfit:"apron",hello:"A hot bath, a clean towel, a little patience. Most days need all three.",gossip:"Sato pretends she does not gossip. She just asks exceptionally well-informed questions.",clue:"Bring the waterlogged book to my warm drying rack. Slowly, away from the stove.",model:"resident-11",build:1.135,supperStart:1284,supperEnd:1380,house:{x:-31.6,z:-12,angle:1.5707963267948966},homeAddress:"12 Willow Alley"},{name:"Reiko",age:36,role:"newspaper editor",female:!0,height:1.62,work:[-4,-2],evening:[-4,-2],home:[-25,-5],top:"#a96883",start:540,close:1080,retire:1260,personality:"Curious, loves a scoop",friend:"Officer Mori",look:"Burgundy vest, long dark hair and round spectacles",hairStyle:"bob",outfit:"jacket",hello:"Nothing is off the record until I put my pencil away. There. What did you hear?",gossip:"Mori writes beautiful incident reports. Unfortunately nothing ever happens.",clue:"I left a stack of evening papers outside the press. The corrections are on page two.",model:"resident-12",build:.88,supperStart:1080,supperEnd:1180,house:{x:-22.4,z:-5,angle:-1.5707963267948966},homeAddress:"13 Willow Alley"},{name:"Tetsuo",age:40,role:"radio repairer",female:!1,height:1.7,work:[4,-13],evening:[24,18],home:[-29,-5],top:"#807398",start:540,close:1080,retire:1605,personality:"Deadpan music lover",friend:"Kenji",look:"Aubergine vest, dark hair and round spectacles",hairStyle:"part",outfit:"vest",hello:"Turn it gently. Radios have feelings. Mostly static, but feelings.",gossip:"Kenji has repaired my radio twice. I keep finding extra screws.",clue:"There are three radio stations. Each claims it has the most reliable weather.",model:"resident-13",build:.965,supperStart:1440,supperEnd:1605,house:{x:-31.6,z:-5,angle:1.5707963267948966},homeAddress:"14 Willow Alley"},{name:"Emi",age:29,role:"seamstress",female:!0,height:1.61,work:[38,34],evening:[28,50],home:[-25,2],top:"#d797a2",start:540,close:1080,retire:1260,personality:"Warm, quietly daring",friend:"Aya",look:"Rose dress and chestnut ponytail",hairStyle:"pony",outfit:"blouse",hello:"I keep little fabric scraps. They are not clutter; they are future possibilities.",gossip:"Aya lends me adventure novels. I repay her in pockets deep enough to hide one.",clue:"Thuan has postcards by the biscuits. Ask her which gull looks most important.",model:"resident-14",build:1.05,supperStart:1104,supperEnd:1234,house:{x:-22.4,z:2,angle:-1.5707963267948966},homeAddress:"15 Willow Alley"},{name:"Mr Tanabe",age:66,role:"shrine caretaker",female:!1,height:1.66,work:[20,50],evening:[20,56],home:[-29,2],top:"#bbaa85",start:540,close:1080,retire:1260,personality:"Playful philosopher",friend:"Mr Fujita",look:"Cream vest, silver hair and round spectacles",hairStyle:"receding",outfit:"sweater",hello:"The shrine bell sounds different every day. Or perhaps I am getting better at listening.",gossip:"Fujita says his fish was a sign of good fortune. It was certainly a sign of good appetite.",clue:"Leave an intention at the shrine. Then do one small thing about it.",model:"resident-15",build:1.135,supperStart:1080,supperEnd:1180,house:{x:-31.6,z:2,angle:1.5707963267948966},homeAddress:"16 Willow Alley"},{name:"Naoko",age:33,role:"postal worker",female:!0,height:1.65,work:[4,11],evening:[-26,46],home:[-25,12],top:"#c77465",start:540,close:1080,retire:1260,personality:"Brisk, remembers everyone",friend:"Bus driver",look:"Post-red dress and dark ponytail",hairStyle:"pony",outfit:"jacket",hello:"I know every door in this town. Some of them are more polite than their owners.",gossip:"The bus driver saves stories for me. I deliver the endings to everyone else.",clue:"The postbox collection plate tells you when the next bag leaves.",model:"resident-16",build:.88,supperStart:1092,supperEnd:1207,house:{x:-22.4,z:12,angle:-1.5707963267948966},homeAddress:"17 Willow Alley"},{name:"Hiroshi",age:54,role:"grocer",female:!1,height:1.68,work:[-4,-28],evening:[24,18],home:[-29,12],top:"#7c9959",start:540,close:1080,retire:1260,personality:"Proud amateur singer",friend:"Yoshiko",look:"Moss hoodie and salt-and-pepper hair",hairStyle:"curly",outfit:"apron",hello:"I sing to the vegetables. The aubergines are a difficult audience.",gossip:"Yoshiko says I may sing at the bathhouse if I agree to sing quietly. Negotiations continue.",clue:"Sakura has cold tea. A cup after walking the harbour is an excellent idea.",model:"resident-17",build:.965,supperStart:1104,supperEnd:1234,house:{x:-31.6,z:12,angle:1.5707963267948966},homeAddress:"18 Willow Alley"},{name:"Fumiko",age:77,role:"neighbour",female:!0,height:1.49,work:[-29,50],evening:[-34,39],home:[-25,19],top:"#aa90b4",start:540,close:1080,retire:1260,personality:"Fearless neighbourhood aunt",friend:"Mrs Sato",look:"Lavender apron dress, white bob and round spectacles",hairStyle:"bob",outfit:"cardigan",hello:"At my age you can say almost anything. I am making up for lost time.",gossip:"Sato and I never gossip. We maintain the oral history of the neighbourhood.",clue:"There is a quiet bench by the shops. Sit long enough and the town comes to you.",model:"resident-18",build:1.05,supperStart:1080,supperEnd:1180,house:{x:-22.4,z:19,angle:-1.5707963267948966},homeAddress:"19 Willow Alley"},{name:"Kenta",age:21,role:"apprentice engineer",female:!1,height:1.8,work:[-4.5,17],evening:[24,18],home:[-29,19],top:"#77a5b7",start:540,close:1080,retire:1260,personality:"Sweetly awkward inventor",friend:"Cold-storage kid",look:"Sky-blue hoodie and chestnut hair",hairStyle:"curly",outfit:"work",hello:"I made a machine to save time. Explaining it takes most of the afternoon.",gossip:"The cold-store lad laughs at my jokes. Slowly, but the room is very cold.",clue:"Kenji has a small prototype on display. Pick it up and turn it over.",model:"resident-19",build:1.135,supperStart:1092,supperEnd:1207,house:{x:-31.6,z:19,angle:1.5707963267948966},homeAddress:"20 Willow Alley"},{name:"Nao",age:34,role:"izakaya owner",female:!0,height:1.65,work:[24,20],evening:[24,20],home:[-25,25],start:960,close:1620,retire:1620,top:"#c87d65",personality:"Generous host, wicked timing",friend:"Masaru",look:"Terracotta apron dress and dark bob",hairStyle:"bun",outfit:"apron",hello:"Come in, come in. The spare chair has been expecting you.",gossip:"Masaru called his catch the special of the day. It was so small I nearly served it as garnish.",clue:"Take a seat, order something warm, and listen. This town tells its best stories over supper.",model:"resident-20",build:.88,supperStart:960,supperEnd:1620,house:{x:-22.4,z:25,angle:-1.5707963267948966},homeAddress:"21 Willow Alley"},{name:"Barfly",age:43,role:"Minato regular",female:!1,height:1.72,work:[24,21],evening:[24,21],home:[24,21],top:"#b74e43",start:0,close:0,retire:1440,personality:"Unhurried, permanently thirsty",friend:"Nao",look:"Broad build, short salt-and-pepper hair, red patterned open-collar shirt and wristwatch",hairStyle:"short",outfit:"hawaiian",hello:"Another one? Nao knows my usual. I am staying right here.",gossip:"I have been at this stool long enough to know when the lanterns need trimming.",clue:"Minato stays open late. The regular at the end of the counter has never once caught the last bus.",model:"barfly",build:1.14,supperStart:null,supperEnd:null,house:{x:24,z:21,angle:0},homeAddress:"Minato Izakaya"}],Xc={interests:["read","inspect","seat","shop"],snack:"rice",drink:"tea",meal:"rice"},Yc=Object.freeze(Object.fromEntries(Object.entries({Kenji:{source:"casual_2",top:"#477697",trousers:"#334b55",hair:"#24272b",skin:"#bd8b65",width:.96,accessory:"tool-pouch",interests:["arcade","machine","radio","inspect"],snack:"bun",drink:"beer",meal:"yakitori"},"Mrs Sato":{source:"female_formal",top:"#96566d",trousers:"#96566d",hair:"#c5c0ae",skin:"#c69c7c",width:1.06,accessory:"glasses",interests:["read","shop","seat","post"],snack:"tea",drink:"tea",meal:"rice"},"Harbour master":{source:"suit",top:"#455b6b",trousers:"#374653",hair:"#92958d",skin:"#b5805d",width:1.1,accessory:"captain",interests:["office","fish","read","machine","phone"],snack:"rice",drink:"beer",meal:"fish"},Tetsuo:{source:"worker",top:"#698071",trousers:"#4a5146",hair:"#444035",skin:"#ba895d",helmet:"#737768",width:1.03,accessory:"glasses",interests:["radio","machine","arcade","inspect"],snack:"bun",drink:"beer",meal:"yakitori"},"Officer Mori":{source:"suit",top:"#3c5780",trousers:"#303e57",hair:"#202528",skin:"#c79872",width:.98,accessory:"police",interests:["read","phone","post","inspect"],snack:"rice",drink:"tea",meal:"rice"},"Bus driver":{source:"suit",top:"#437f78",trousers:"#3b514e",hair:"#61564b",skin:"#b88968",width:1.04,accessory:"driver",interests:["seat","read","phone","shop"],snack:"tea",drink:"tea",meal:"fish"},Nao:{source:"female_casual",top:"#bd7557",trousers:"#394b58",hair:"#292a30",skin:"#cf9b77",width:.98,accessory:"apron",interests:["shop","post","read","radio"],shopping:"soda",snack:"rice",drink:"tea",meal:"yakitori"},Aya:{source:"female_casual",top:"#424552",trousers:"#74764e",hair:"#24212a",skin:"#d5a17d",width:.91,accessory:"ponytail-satchel",accent:"#ab799e",height:1.62,interests:["read","seat","post","shop"],snack:"tea",drink:"beer",meal:"rice"},Reiko:{source:"female_formal",top:"#a05c75",trousers:"#a05c75",hair:"#44332b",skin:"#d8ae8c",width:.96,accessory:"headband-scarf",accent:"#efe2c3",height:1.62,interests:["read","radio","phone","shop"],snack:"rice",drink:"beer",meal:"fish"},Thuan:{source:"thuan-mh",top:"#d8b23a",trousers:"#27304d",hair:"#1c1612",skin:"#e6c3a8",width:1.02,accessory:"ribbon",interests:["shop","seat","read","post"],snack:"tea",drink:"tea",meal:"rice",height:1.64},"Cold-storage kid":{source:"worker",top:"#87a5b2",trousers:"#495e71",hair:"#664634",skin:"#d4a982",helmet:"#658499",width:.9,accessory:"scarf",accent:"#ddd6ba"},Hana:{source:"female_formal",top:"#c58176",trousers:"#c58176",hair:"#76503e",skin:"#dcb594",width:.92,accessory:"headband",accent:"#eee0ae"},Daichi:{source:"casual_2",top:"#bba153",trousers:"#5d614c",hair:"#634f34",skin:"#cea276",width:.93,accessory:"satchel",accent:"#655337"},"Mr Fujita":{source:"suit",top:"#648a80",trousers:"#455d5c",hair:"#d2ccba",skin:"#b08461",width:1.08,accessory:"glasses"},Masaru:{source:"worker",top:"#a56545",trousers:"#485970",hair:"#514335",skin:"#ac7655",helmet:"#ad9264",width:1.15,accessory:"scarf",accent:"#caba8a"},Yoshiko:{source:"female_formal",top:"#859263",trousers:"#859263",hair:"#b3ada0",skin:"#c59b79",width:1.04,accessory:"bun-apron"},Emi:{source:"female_casual",top:"#c08d97",trousers:"#68657b",hair:"#775746",skin:"#d3a884",width:.95,accessory:"ponytail-satchel",accent:"#ded0ab"},"Mr Tanabe":{source:"suit",top:"#b9aa85",trousers:"#797565",hair:"#aaa998",skin:"#bd936e",width:1.02,accessory:"glasses"},Naoko:{source:"female_casual",top:"#b45a51",trousers:"#484753",hair:"#302f32",skin:"#c89977",width:.98,accessory:"headband-satchel",accent:"#7b5746"},Hiroshi:{source:"casual_2",top:"#778a53",trousers:"#535345",hair:"#79776a",skin:"#bb9269",width:1.12,accessory:"apron"},Fumiko:{source:"female_formal",top:"#9c7fac",trousers:"#9c7fac",hair:"#d6d2c8",skin:"#c69f82",width:1.08,accessory:"glasses"},Kenta:{source:"casual_2",top:"#78a7b8",trousers:"#546679",hair:"#825f44",skin:"#d4ac85",width:.96,accessory:"tool-pouch"},Yui:{source:"female_casual",top:"#66969a",trousers:"#45465e",hair:"#332d31",skin:"#d0a586",width:1.01,accessory:"headband",accent:"#e8cf85"},Barfly:{source:"casual_2",top:"#b74e43",trousers:"#36343a",hair:"#77766f",skin:"#b9825f",width:1.14,accessory:"hawaiian",interests:["seat","drink","radio"],snack:"yakitori",drink:"beer",meal:"yakitori",height:1.72}}).map(([n,e])=>[n,Object.freeze({...Xc,...e})]))),zg=Object.freeze({Aiko:"Aya",Nozomi:"Reiko"}),Hg=n=>Yc[zg[n]||n]||Xc;function Dy(n){const e={};if(!n||typeof n!="object")return e;for(const t of Object.keys(Yc)){const i=n[t];if(!i||!Number.isSafeInteger(i.day)||!Number.isFinite(i.yen))continue;const s={day:i.day,yen:Math.max(0,Math.min(2400,i.yen)),purchases:[],activities:[],meals:{}};Array.isArray(i.purchases)&&(s.purchases=i.purchases.filter(o=>o&&typeof o.id=="string"&&typeof o.item=="string"&&Number.isFinite(o.cost)&&o.cost>=0).slice(-24).map(o=>({id:o.id.slice(0,160),item:o.item.slice(0,160),cost:o.cost}))),Array.isArray(i.activities)&&(s.activities=i.activities.filter(o=>typeof o=="string").slice(-8).map(o=>o.slice(0,180)));for(const o of["market","izakaya","ramen"]){const a=i.meals?.[o];!a||!["bun","rice","tea","ramen","fish","yakitori"].includes(a.item)||(s.meals[o]={stockClaim:a.stockClaim&&["bun","rice","tea"].includes(a.stockClaim.item)&&Number.isSafeInteger(a.stockClaim.unitCost)?{item:a.stockClaim.item,unitCost:a.stockClaim.unitCost}:null,item:a.item,drink:a.drink==="beer"?"beer":"tea",delivered:a.delivered===!0,finished:a.finished===!0,started:Number.isFinite(a.started)?a.started:null,waited:Number.isFinite(a.waited)?Math.max(0,Math.min(45,a.waited)):0,eaten:Number.isFinite(a.eaten)?Math.max(0,Math.min(42,a.eaten)):0})}const r=i.shopping;r&&["browse","pickup","queue","paid","finished"].includes(r.phase)&&Number.isFinite(r.started)&&(["tea","coffee","rice","biscuit","soap","notebook","postcard","battery","cola","water","beer","noodles","milk","bun"].includes(r.item)||r.phase==="browse"&&!r.picked)&&(s.shopping={phase:r.phase,started:r.started,finished:r.finished===!0,item:["tea","coffee","rice","biscuit","soap","notebook","postcard","battery","cola","water","beer","noodles","milk","bun"].includes(r.item)?r.item:null,picked:r.picked===!0,paid:r.paid===!0,timer:Number.isFinite(r.timer)?Math.max(0,Math.min(3,r.timer)):0,position:Array.isArray(r.position)&&r.position.length===3&&r.position.every(o=>Number.isFinite(o)&&Math.abs(o)<7)?r.position:[0,0,5.2]}),e[t]=s}return e}function Ny(n=()=>null){const e={};function t(i,s){const r=n()||e,o=Math.floor(s/1440);r.residentLife??={};let a=r.residentLife[i];return(!a||a.day!==o)&&(a=r.residentLife[i]={day:o,yen:2400,purchases:[],activities:[]}),a}return{account:t,purchase(i,s,r,o,a){const l=t(i,s);return l.purchases.some(c=>c.id===r)?!0:!Number.isFinite(a)||a<0||l.yen<a?!1:(a===0||(l.yen-=a,l.purchases.push({id:r,item:o,cost:a}),l.purchases=l.purchases.slice(-24)),!0)},record(i,s,r){const o=t(i,s);o.activities.push(r),o.activities=o.activities.slice(-8)}}}const Uy=Object.freeze([Object.freeze({key:"pace",label:"Pace",low:"Unhurried",high:"Brisk"}),Object.freeze({key:"talk",label:"Talk",low:"Careful",high:"Frank"}),Object.freeze({key:"show",label:"Feelings",low:"Calm",high:"Lively"}),Object.freeze({key:"outlook",label:"Outlook",low:"Serious",high:"Easygoing"})]),Nn=8,Vg=Object.freeze([["Lighthouse keeper","Steady and watchful. Keeps a promise to the letter.","#3d6a8a"],["Porch sitter","In no hurry at all. Always has time to listen.","#8a5a2e"],["Old storyteller","Slow to start, but tells it with all their heart.","#8a4ab8"],["Cloud watcher","Drifts happily along with a head full of ideas.","#7fb0d8"],["Quiet craftsman","Few words, all of them meant. Does things properly.","#6d7478"],["Easy neighbour","Plain-spoken and relaxed. Will lend you a ladder.","#8fbf4a"],["Big heart","Laughs loudest, cries at films, says how they feel.","#e98aa6"],["Wanderer","Says what they like and goes where the day takes them.","#2a8a5a"],["Timekeeper","Quick, polite and composed. Has a list for everything.","#2f5f9e"],["Helping hand","First to help, and pleasant about it.","#3fa0c8"],["Rising star","Polished, quick and fond of an audience.","#f4d23c"],["Festival friend","Everywhere at once and friends with all of it.","#e8742a"],["Straight shooter","Fast and blunt. Gets it done.","#27304d"],["Joker","Quick, frank, and always up to something.","#d8342c"],["Firecracker","Quick to flare up, quick to laugh. Big energy.","#c8402e"],["Typhoon","Never still, says everything, enjoys every minute.","#45b7f0"]].map(([n,e,t])=>Object.freeze({name:n,line:e,colour:t}))),Qi=n=>Math.min(1,Math.max(0,Number.isFinite(+n)?+n:.5)),Ai=n=>Math.min(Nn,1+Math.floor(Qi(n)*Nn*.9999)),ky=n=>(Math.min(Nn,Math.max(1,n))-.5)/Nn;function qc(n={}){const e=t=>Ai(n[t])>Nn/2?1:0;return Vg[e("pace")*8+e("talk")*4+e("show")*2+e("outlook")]}const Bl=[261.6,329.6,349.2,392,493.9,523.3,659.3,698.5,784,987.8,1046.5];function Fy(n={}){const e=Qi(n.pitch),t=Qi(n.speed);return{freq:Bl[Math.round(e*(Bl.length-1))],type:Qi(n.talk)>.62?"triangle":"sine",letterMs:Math.round(34-t*20),swing:Qi(n.show)>.5?1.0595:1}}const Gg=Object.freeze(["January","February","March","April","May","June","July","August","September","October","November","December"]),Wg=[31,29,31,30,31,30,31,31,30,31,30,31],Xg=n=>Wg[Math.min(11,Math.max(0,n-1))],Yg=n=>`${qg(n.month,n.day)} ${Gg[(n.month||1)-1]}`;function qg(n,e){return Math.min(Xg(n||1),Math.max(1,e|0||1))}function Oy(n){const e=n.name||"your new islander",t=n.profile||{},i=qc(t),s=t.catchphrase?` ${t.catchphrase}`:"",r=Ai(t.talk)>4?`Hey! I'm ${e}.`:`Hello. My name is ${e}.`,o=Ai(t.show)>4?" I am so happy to be here!":" Nice to meet you.";return`${r}${o}${s}

${i.name} · born ${Yg(t)}`}const jg=Object.freeze(Object.fromEntries(Object.entries({Johansson:[.3,.7,.7,.8],Thuan:[.7,.35,.75,.75],"Mrs Higa":[.25,.3,.3,.3],Aya:[.6,.65,.4,.75],Kenji:[.7,.4,.75,.7],"Mrs Sato":[.4,.75,.7,.3],"Harbour master":[.3,.7,.3,.65],"Bus driver":[.25,.35,.7,.3],"Cold-storage kid":[.4,.25,.35,.7],"Officer Mori":[.7,.3,.4,.6],Hana:[.7,.75,.75,.4],Daichi:[.3,.3,.7,.7],"Mr Fujita":[.35,.75,.75,.75],Masaru:[.75,.8,.8,.7],Yoshiko:[.25,.4,.25,.6],Reiko:[.75,.7,.65,.6],Tetsuo:[.3,.65,.2,.35],Emi:[.6,.35,.45,.65],"Mr Tanabe":[.25,.3,.65,.75],Naoko:[.8,.35,.35,.35],Hiroshi:[.65,.4,.8,.3],Fumiko:[.7,.85,.4,.3],Kenta:[.4,.25,.6,.65],Nao:[.7,.75,.6,.8],Barfly:[.15,.65,.35,.8]}).map(([n,[e,t,i,s]])=>[n,Object.freeze({pace:e,talk:t,show:i,outlook:s})]))),jc=["pace","talk","show","outlook"],Kg=n=>!n||jc.every(e=>n[e]===void 0||n[e]===.5);function Co(n,e=n?.name){if(!n||!Kg(n.profile))return n;let t=jg[e];if(!t&&e){let i=2166136261;for(const s of String(e))i=Math.imul(i^s.charCodeAt(0),16777619)>>>0;t=Object.fromEntries(jc.map((s,r)=>[s,(i>>>r*7&127)/127*.8+.1]))}return t?{...n,profile:{...n.profile||{},...t}}:n}const st=n=>Ot(Co(n)),Jg=new Set(["Thuan","Mrs Higa","Mina","Grandmother Higa","Mrs Nakamura","Mrs Yonamine","Mrs Miyagi","Mrs Kamiya","Mrs Kinjō"]),Kc=n=>Object.freeze(Object.fromEntries(Object.entries(n).map(([e,t])=>{const i=Qo.find(s=>s.name===e)?.female??Jg.has(e);return[e,Ot({...t,body:{...t.body,silhouette:t.body.silhouette==="neutral"?i?"feminine":"masculine":t.body.silhouette}})]}))),Po=Kc({Johansson:st({name:"Johansson",body:{height:.72,build:.72,silhouette:"masculine",skin:"#dc9d7a"},head:{size:.48,shape:.45,form:"square",jaw:.75,cheeks:.55},hair:{style:"horseshoe",colour:"#b8b4aa"},eyes:{style:"gentle",colour:"#3d6a8a",size:.45,spacing:.52,height:.5,tilt:.45},brows:{style:"bushy",colour:"#a8a49a",size:.6,height:.55,tilt:.45},nose:{style:"wide",size:.6,height:.48},mouth:{style:"smile",colour:"#a8433e",size:.55,height:.5},facial:{style:"stubble",colour:"#b8b4aa"},wrinkles:.7,blush:.35,outfit:{top:"kariyushi",topColour:"#7fb0d8",pattern:"flowers",bottom:"shorts",bottomColour:"#c8b48a",footwear:"sandals",shoes:"#6d4a32",accent:"#f4f1ea"},swim:{colour:"#2f5f9e"}}),Thuan:st({name:"Thuan",accessories:{earrings:"studs",neckwear:"pendant",colour:"#e0b93a"},body:{height:.36,build:.35,silhouette:"feminine",skin:"#f1cfae"},head:{size:.48,shape:.48,form:"heart",jaw:.3,cheeks:.62},hair:{style:"braids",colour:"#1c1714",flip:!1},eyes:{style:"lashes",colour:"#2a1d16",size:.78,spacing:.5,height:.48,tilt:.55},brows:{style:"arched",colour:"#2a1d16",size:.42,height:.55,tilt:.5},nose:{style:"dot",size:.35,height:.5},mouth:{style:"smile",colour:"#cc3d52",size:.42,height:.5},glasses:{style:"round",colour:"#e06a7a"},blush:.65,outfit:{top:"blouse",topColour:"#f4d23c",pattern:"flowers",bottom:"trousers",bottomColour:"#27304d",shoes:"#f4f1ea",accent:"#f4d23c"},swim:{colour:"#e98aa6"}}),Nao:st({name:"Nao",body:{height:.42,build:.45,skin:"#e8bf98"},head:{size:.46,shape:.4,form:"oval",jaw:.35,cheeks:.45},hair:{style:"ponytail",colour:"#292a30"},eyes:{style:"almond",colour:"#2a1d16",size:.55,spacing:.5,height:.5,tilt:.6},brows:{style:"straight",colour:"#292a30",size:.5},nose:{style:"button",size:.4},mouth:{style:"grin",colour:"#b8544a",size:.5},blush:.3,outfit:{top:"apron",topColour:"#bd7557",bottom:"trousers",bottomColour:"#394b58",shoes:"#2b2b2b",hat:"kerchief",hatColour:"#27304d",accent:"#f4f1ea"}}),Aya:st({name:"Aya",accessories:{earrings:"hoops",pin:!0,colour:"#c8a060"},body:{height:.34,build:.38,skin:"#efc9a4"},head:{size:.5,shape:.52,form:"round",jaw:.35,cheeks:.6},hair:{style:"bob",colour:"#2e211b"},eyes:{style:"round",colour:"#3a2a1e",size:.6,spacing:.5,height:.5,tilt:.5},brows:{style:"arched",colour:"#2e211b",size:.45},nose:{style:"button",size:.35},mouth:{style:"small",colour:"#c4485a",size:.45},glasses:{style:"round",colour:"#7a4a2a"},blush:.45,outfit:{hat:"beret",hatColour:"#5f8f6a",top:"jacket",topColour:"#5f8f6a",pattern:"dots",bottom:"longskirt",bottomColour:"#e6d3b0",shoes:"#6b4a2e",accent:"#f4e4c8"}}),Reiko:st({name:"Reiko",accessories:{neckwear:"scarf",colour:"#d8342c"},body:{height:.46,build:.42,skin:"#e8bf98"},head:{size:.47,shape:.44,form:"oval",jaw:.4,cheeks:.4},hair:{style:"ponytail",colour:"#1c1714"},eyes:{style:"almond",colour:"#2a1d16",size:.5,tilt:.6},brows:{style:"straight",colour:"#1c1714",size:.5},nose:{style:"line",size:.4},mouth:{style:"smirk",colour:"#a8433e",size:.45},outfit:{top:"smock",topColour:"#3f5f7a",bottom:"trousers",bottomColour:"#2b2b33",shoes:"#2b2b2b",accent:"#f4f1ea"}}),Kenji:st({name:"Kenji",body:{height:.6,build:.55,skin:"#c98d62"},head:{size:.48,shape:.5,form:"square",jaw:.6,cheeks:.45},hair:{style:"spiky",colour:"#2b1d14"},eyes:{style:"sparkle",colour:"#2a1d16",size:.55},brows:{style:"thick",colour:"#2b1d14",size:.55},nose:{style:"wide",size:.5},mouth:{style:"grin",size:.55},facial:{style:"stubble",colour:"#2b1d14"},outfit:{top:"kariyushi",topColour:"#f2a93b",pattern:"flowers",bottom:"shorts",bottomColour:"#3f5f7a",shoes:"#f4f1ea",accent:"#f4f1ea"}}),Tetsuo:st({name:"Tetsuo",accessories:{pin:!0,colour:"#e0b93a"},body:{height:.44,build:.5,skin:"#dca97e"},head:{size:.5,shape:.5,form:"narrow",jaw:.55,cheeks:.35},hair:{style:"horseshoe",colour:"#8a8680"},eyes:{style:"sleepy",colour:"#2a1d16",size:.45},brows:{style:"bushy",colour:"#8a8680",size:.6},nose:{style:"hook",size:.55},mouth:{style:"flat",size:.5},glasses:{style:"half",colour:"#2b2b2b"},wrinkles:.6,outfit:{top:"jacket",topColour:"#6b6f4a",bottom:"trousers",bottomColour:"#4a4238",shoes:"#3a2a1e",accent:"#e8d7b0"}}),"Mrs Sato":st({name:"Mrs Sato",body:{height:.22,build:.6,skin:"#e2b48c"},head:{size:.5,shape:.56,form:"round",jaw:.4,cheeks:.6},hair:{style:"bun",colour:"#c9c6c0"},eyes:{style:"gentle",colour:"#2a1d16",size:.45},brows:{style:"arched",colour:"#b9b6b0",size:.5},nose:{style:"button",size:.45},mouth:{style:"smile",colour:"#b8544a",size:.5},glasses:{style:"round",colour:"#6b4a2e"},wrinkles:.7,blush:.3,outfit:{top:"apron",topColour:"#ad6178",bottom:"trousers",bottomColour:"#4a4040",shoes:"#2b2b2b",hat:"kerchief",hatColour:"#f4f1ea",accent:"#f4f1ea"}}),"Mrs Higa":st({name:"Mrs Higa",body:{height:.24,build:.58,skin:"#c99a74"},head:{size:.5,shape:.55,form:"round",jaw:.35,cheeks:.6},hair:{style:"perm",colour:"#9a968e"},eyes:{style:"sleepy",colour:"#2a1d16",size:.42},brows:{style:"thin",colour:"#8a8680",size:.45},nose:{style:"button",size:.45},mouth:{style:"small",colour:"#a8433e",size:.45},glasses:{style:"half",colour:"#6b4a2e"},wrinkles:.75,blush:.25,outfit:{top:"blouse",topColour:"#6d8a74",bottom:"skirt",bottomColour:"#3a3a42",shoes:"#2b2b2b",accent:"#f4f1ea"}}),"Harbour master":st({name:"Harbour master",body:{height:.52,build:.68,skin:"#b5805d"},head:{size:.52,shape:.55,form:"round",jaw:.6,cheeks:.5},hair:{style:"horseshoe",colour:"#b9b7b0"},eyes:{style:"gentle",colour:"#2a1d16",size:.45},brows:{style:"bushy",colour:"#cfcdc6",size:.6},nose:{style:"wide",size:.55},mouth:{style:"flat",size:.5},glasses:{style:"round",colour:"#2b2b2b"},facial:{style:"walrus",colour:"#dedbd3"},wrinkles:.55,outfit:{top:"jacket",topColour:"#2c3e5c",bottom:"trousers",bottomColour:"#27304d",shoes:"#1c1c24",hat:"captain",hatColour:"#f4f1ea",accent:"#e0b93a"}}),"Officer Mori":st({name:"Officer Mori",body:{height:.7,build:.48,skin:"#c79872"},head:{size:.48,shape:.46,form:"oval",jaw:.5,cheeks:.4},hair:{style:"crop",colour:"#4a4845"},eyes:{style:"round",colour:"#2a1d16",size:.62},brows:{style:"worried",colour:"#3a3835",size:.55},nose:{style:"button",size:.45},mouth:{style:"smile",size:.45},blush:.2,wrinkles:.2,outfit:{top:"polo",topColour:"#9dbfe0",bottom:"trousers",bottomColour:"#27304d",shoes:"#1c1c24",hat:"police",hatColour:"#27304d",accent:"#e0b93a"}})}),zl=Kc({Riku:st({body:{silhouette:"masculine",height:.56,build:.55,skin:"#c89a74"},hair:{style:"crop",colour:"#33271f"},eyes:{style:"round"},brows:{style:"thick"},mouth:{style:"smile"},outfit:{top:"polo",topColour:"#587d83",bottom:"trousers",bottomColour:"#505f65",hat:"helmet",hatColour:"#dabb55"}}),"Emi Kado":st({body:{silhouette:"feminine",height:.43,build:.42,skin:"#d1a079"},hair:{style:"ponytail",colour:"#3c2c24"},eyes:{style:"almond"},mouth:{style:"smile"},outfit:{top:"polo",topColour:"#a77e67",bottom:"trousers",bottomColour:"#465d69",hat:"cap",hatColour:"#465d69"}}),Haru:st({head:{form:"square",jaw:.72,cheeks:.4},body:{height:.63,build:.58,skin:"#bf875f"},hair:{style:"crop",colour:"#302419"},eyes:{style:"narrow"},brows:{style:"thick"},nose:{style:"wide"},mouth:{style:"smile"},facial:{style:"stubble",colour:"#302419"},outfit:{top:"polo",topColour:"#607c84",bottom:"shorts",bottomColour:"#7b7155",hat:"cap",hatColour:"#c4b486"}}),Mina:st({head:{form:"oval",jaw:.35,cheeks:.6},body:{height:.4,build:.45,skin:"#d8ac87"},hair:{style:"bun",colour:"#3b2920"},eyes:{style:"gentle",size:.48},brows:{style:"arched"},nose:{style:"button"},mouth:{style:"smile"},outfit:{top:"apron",topColour:"#849267",bottom:"longskirt",bottomColour:"#5c6e75"}}),Jun:st({head:{form:"narrow",jaw:.4,cheeks:.3},body:{height:.53,build:.4,skin:"#dbb393"},hair:{style:"sidepart",colour:"#29241e"},eyes:{style:"almond"},brows:{style:"straight"},nose:{style:"line"},mouth:{style:"small"},glasses:{style:"half",colour:"#5b5c52"},outfit:{top:"polo",topColour:"#e0dac7",bottom:"trousers",bottomColour:"#3e596d"}}),"Grandmother Higa":st({head:{size:.48,shape:.5,form:"round",jaw:.7,cheeks:.85},body:{height:.2,build:.6,skin:"#dca97e"},hair:{style:"perm",colour:"#d8d6d0"},eyes:{style:"gentle",size:.4},brows:{style:"thin",colour:"#9a9a96"},nose:{style:"button",size:.55},mouth:{style:"smile",size:.45},glasses:{style:"half",colour:"#8a4a3a"},wrinkles:1,blush:.4,outfit:{top:"blouse",topColour:"#8a4ab8",pattern:"flowers",bottom:"longskirt",bottomColour:"#6d7478",shoes:"#2b2b2b"}}),"Mr Ōshiro":st({head:{size:.48,shape:.5,form:"narrow",jaw:.45,cheeks:.3},body:{height:.4,build:.4,skin:"#b27449"},hair:{style:"buzz",colour:"#d8d6d0"},eyes:{style:"narrow"},brows:{style:"bushy",colour:"#d8d6d0"},nose:{style:"hook",size:.6},mouth:{style:"flat"},facial:{style:"stubble",colour:"#d8d6d0"},wrinkles:.9,outfit:{top:"tee",topColour:"#f4f1ea",bottom:"trousers",bottomColour:"#6d7478",shoes:"#2b2b2b",hat:"straw",hatColour:"#e0c078"}}),"Uncle Kinjō":st({head:{size:.48,shape:.5,form:"square",jaw:.8,cheeks:.65},body:{height:.55,build:.75,skin:"#c98d62"},hair:{style:"crop",colour:"#5a3a22"},eyes:{style:"dot"},brows:{style:"thick"},nose:{style:"wide"},mouth:{style:"wide"},facial:{style:"moustache",colour:"#3a2618"},wrinkles:.5,outfit:{top:"polo",topColour:"#2a8a5a",bottom:"shorts",bottomColour:"#c8b48a",shoes:"#6d4a32",hat:"cap",hatColour:"#d8342c"}}),"Mrs Nakamura":st({head:{size:.48,shape:.5,form:"round",jaw:.55,cheeks:.8},body:{height:.25,build:.6,skin:"#e8bf98"},hair:{style:"bun",colour:"#5a3a22"},eyes:{style:"round",size:.55},brows:{style:"arched"},nose:{style:"button"},mouth:{style:"grin",colour:"#cc3d52"},blush:.5,wrinkles:.4,outfit:{top:"apron",topColour:"#3fa0c8",bottom:"skirt",bottomColour:"#27304d",shoes:"#f4f1ea",hat:"kerchief",hatColour:"#f4f1ea",accent:"#f4f1ea"}}),"Mr Shimabukuro":st({head:{size:.48,shape:.5,form:"narrow",jaw:.5,cheeks:.35},body:{height:.5,build:.45,skin:"#dca97e"},hair:{style:"sidepart",colour:"#1c1714"},eyes:{style:"almond"},brows:{style:"straight"},nose:{style:"line"},mouth:{style:"smirk"},facial:{style:"moustache",colour:"#1c1714"},wrinkles:.3,outfit:{top:"smock",topColour:"#f4f1ea",bottom:"trousers",bottomColour:"#2b2b2b",shoes:"#2b2b2b"}}),"Mrs Yonamine":st({head:{size:.48,shape:.5,form:"heart",jaw:.3,cheeks:.65},body:{height:.3,build:.55,skin:"#c98d62"},hair:{style:"ponytail",colour:"#3a2618"},eyes:{style:"sparkle"},brows:{style:"thick"},nose:{style:"button"},mouth:{style:"wide"},blush:.3,outfit:{top:"apron",topColour:"#2f5f9e",bottom:"trousers",bottomColour:"#27304d",shoes:"#f4f1ea",hat:"headband",hatColour:"#d8342c",accent:"#f4f1ea"}}),"Mrs Miyagi":st({head:{size:.48,shape:.5,form:"oval",jaw:.35,cheeks:.4},body:{height:.1,build:.4,skin:"#c98d62"},hair:{style:"bun",colour:"#f4f1ea"},eyes:{style:"sleepy"},brows:{style:"thin",colour:"#d8d6d0"},nose:{style:"button"},mouth:{style:"small"},wrinkles:1,outfit:{top:"blouse",topColour:"#f4f1ea",bottom:"longskirt",bottomColour:"#2f5f9e",shoes:"#2b2b2b"}}),"Mr Tamaki":st({head:{size:.48,shape:.5,form:"square",jaw:.7,cheeks:.4},body:{height:.6,build:.7,skin:"#c98d62"},hair:{style:"spiky",colour:"#1c1714"},eyes:{style:"round"},brows:{style:"thick"},nose:{style:"wide"},mouth:{style:"grin"},outfit:{top:"jacket",topColour:"#e8742a",bottom:"trousers",bottomColour:"#27304d",shoes:"#2b2b2b",hat:"headband",hatColour:"#f4f1ea"}}),Kōji:st({head:{size:.48,shape:.5,form:"oval",jaw:.65,cheeks:.4},body:{height:.58,build:.5,skin:"#b27449"},hair:{style:"crop",colour:"#3a2618"},eyes:{style:"dot"},brows:{style:"straight"},nose:{style:"button"},mouth:{style:"grin"},outfit:{top:"tee",topColour:"#d8342c",bottom:"shorts",bottomColour:"#2f5f9e",shoes:"#f4f1ea",hat:"kerchief",hatColour:"#2f5f9e"}}),"Mr Nakasone":st({head:{size:.48,shape:.5,form:"square",jaw:.75,cheeks:.6},body:{height:.42,build:.55,skin:"#dca97e"},hair:{style:"horseshoe",colour:"#d8d6d0"},eyes:{style:"gentle"},brows:{style:"bushy",colour:"#d8d6d0"},nose:{style:"wide"},mouth:{style:"smile"},glasses:{style:"square",colour:"#2b2b2b"},wrinkles:.8,outfit:{top:"polo",topColour:"#d8342c",bottom:"trousers",bottomColour:"#c8b48a",shoes:"#f4f1ea",hat:"cap",hatColour:"#f4f1ea"}}),"Mrs Kamiya":st({head:{size:.48,shape:.5,form:"round",jaw:.5,cheeks:.7},body:{height:.2,build:.5,skin:"#e8bf98"},hair:{style:"perm",colour:"#9a9a96"},eyes:{style:"round",size:.45},brows:{style:"arched",colour:"#9a9a96"},nose:{style:"dot"},mouth:{style:"small",colour:"#e06a7a"},wrinkles:.8,blush:.4,outfit:{top:"polo",topColour:"#3fa0c8",bottom:"trousers",bottomColour:"#f4f1ea",shoes:"#f4f1ea",hat:"straw",hatColour:"#f4f1ea"}}),"Mr Arakaki":st({head:{size:.48,shape:.5,form:"narrow",jaw:.3,cheeks:.25},body:{height:.35,build:.35,skin:"#dca97e"},hair:{style:"bald",colour:"#9a9a96"},eyes:{style:"narrow"},brows:{style:"worried",colour:"#9a9a96"},nose:{style:"hook"},mouth:{style:"flat"},glasses:{style:"round",colour:"#2b2b2b"},wrinkles:.9,outfit:{top:"polo",topColour:"#f4d23c",bottom:"trousers",bottomColour:"#27304d",shoes:"#2b2b2b",hat:"cap",hatColour:"#2f5f9e"}}),"Mrs Kinjō":st({head:{size:.48,shape:.5,form:"heart",jaw:.4,cheeks:.55},body:{height:.32,build:.55,skin:"#dca97e"},hair:{style:"bob",colour:"#3a2618"},eyes:{style:"round"},brows:{style:"arched"},nose:{style:"button"},mouth:{style:"smile",colour:"#b8544a"},blush:.4,wrinkles:.3,outfit:{top:"blouse",topColour:"#e98aa6",pattern:"dots",bottom:"skirt",bottomColour:"#6d7478",shoes:"#9a6a42"}}),"Postman Tōma":st({head:{size:.48,shape:.5,form:"oval",jaw:.5,cheeks:.4},body:{height:.6,build:.4,skin:"#e8bf98"},hair:{style:"sidepart",colour:"#3a2618",flip:!0},eyes:{style:"round"},brows:{style:"straight"},nose:{style:"line"},mouth:{style:"smile"},outfit:{top:"polo",topColour:"#2f5f9e",bottom:"trousers",bottomColour:"#27304d",shoes:"#2b2b2b",hat:"cap",hatColour:"#2f5f9e"}})}),Zg={captain:["captain","#f4f1ea"],police:["police","#27304d"],driver:["cap","#2a8a5a"],apron:["kerchief","#f4f1ea"],"headband-scarf":["headband","#efe2c3"],headband:["headband","#e8cf85"],"headband-satchel":["headband","#7b5746"]},Lo=new Map(Qo.map(n=>[n.name,n.age])),Hl=(n,e)=>{const t=Ic(Lo.get(e));return Lo.has(e)&&n.age!==t?Ot({...n,age:t}):n};function $g(n=""){const e=Bg(n);if(e)return e;if(Po[n])return Hl(Po[n],n);if(zl[n])return Hl(Ot(Co(zl[n],n)),n);const t=Hg(n),i=Zo(n),s=c=>c[Math.floor(i()*c.length)],r=Qo.find(c=>c.name===n)?.female??(/female/.test(t.source||"")||/^(Mrs |Aya|Reiko|Hana|Yoshiko|Emi|Naoko|Fumiko|Yui)/.test(n)),o=/^#[a-f0-9]{6}$/i.test(t.hair||"")&&parseInt(t.hair.slice(1,3),16)>150,a=Zg[t.accessory]||(t.helmet?["helmet",t.helmet]:["none","#f4f1ea"]),l=Ot(Co({name:n,age:Ic(Lo.get(n)),body:{silhouette:r?"feminine":"masculine",height:.3+i()*.45,build:.3+(Math.min(1.2,t.width||1)-.85)*1.6,skin:t.skin||"#e8bf98"},head:{size:.38+i()*.22,shape:i(),form:s(ft.head),jaw:.25+i()*.5,cheeks:.25+i()*.5},hair:{style:s(o&&!r?["horseshoe","buzz","crop"]:r?["bob","long","ponytail","bun","sidepart"]:["crop","sidepart","spiky","buzz"]),colour:t.hair||"#1c1714",flip:i()<.5},eyes:{style:s(ft.eyes),size:.35+i()*.35,spacing:.4+i()*.2,tilt:.4+i()*.2},brows:{style:s(ft.brows.slice(0,6)),colour:t.hair||"#1c1714"},nose:{style:s(ft.nose.slice(0,5)),size:.35+i()*.4},mouth:{style:s(ft.mouth),colour:r?"#cc3d52":"#b8544a"},glasses:{style:/glasses/.test(t.accessory||"")?"square":"none",colour:"#2b2b2b"},facial:{style:!r&&i()<.25?s(["moustache","stubble","goatee"]):"none",colour:t.hair||"#1c1714"},blush:r?.4:.15,wrinkles:o?.7:0,outfit:{top:t.accessory==="apron"?"apron":t.accessory==="hawaiian"?"kariyushi":r?"blouse":"polo",topColour:t.top||"#3fa0c8",pattern:t.accessory==="hawaiian"?"flowers":"none",bottom:r&&t.top===t.trousers?"longskirt":"trousers",bottomColour:t.trousers||"#27304d",shoes:"#2b2b2b",hat:a[0],hatColour:a[1],accent:t.accent||"#f4d23c"}}));return n==="Hana"?Ot({...l,outfit:{...l.outfit,top:"sailor",topColour:"#f3ecd9",bottom:"pleatedskirt",bottomColour:"#343959",footwear:"shoes",shoes:"#483b36",hat:"none",accent:"#428b88",pattern:"none"}}):l}const Vl=Object.freeze({x:-25,z:-44,width:8.8,depth:7.4,door:Object.freeze([-25,0,-39.65])}),By=Object.freeze({width:8.4,depth:7,bounds:{minX:-4.2,maxX:4.2,minZ:-3.5,maxZ:3.5},doorX:0,spawn:[0,0,2.9],exit:[0,1.1,3.42],yaw:0,staff:{Kenji:[-1.25,0,-1.9],Tetsuo:[1.5,0,-1.9]}}),Jc=Object.freeze({title:"Dock Electrical & Repair Workshop",jp:"Dock Electrical Workshop",sub:"ELECTRICAL · INSTRUMENTS · REPAIRS",industrialWorkshop:!0,x:Vl.x,z:Vl.z,line:"Kenji’s fabrication and Form 3D bench, with Tetsuo’s electrical and instrument repairs.",directions:"On the western quay, beside the harbour warehouse. Look for the blue electrical workshop sign."}),Zc=Object.freeze([{id:"yuri-home",entry:"one",number:"1",residents:["Thuan","Nao"]},{id:"resident-home-aya",entry:"two",number:"2",residents:["Aya","Reiko"]},{id:"resident-home-kenji",entry:"three",number:"3",residents:["Kenji","Tetsuo"]},{id:"resident-home-mrs-sato",entry:"four",number:"4A",residents:["Mrs Sato"]},{id:"resident-home-officer-mori",entry:"four",number:"4B",residents:["Officer Mori"]},{id:"resident-home-harbour-master",entry:"five",number:"5A",residents:["Harbour master"]},{id:"resident-home-bus-driver",entry:"five",number:"5B",residents:["Bus driver"]}].map(n=>Object.freeze({...n,residents:Object.freeze(n.residents),address:n.number+" Main Street",title:n.residents.join(" & ")+"’s home"}))),Qg=Object.freeze({"resident-home-nao":"yuri-home","resident-home-reiko":"resident-home-aya","resident-home-tetsuo":"resident-home-kenji"}),$c=n=>Qg[n]||n,e_=n=>Zc.find(e=>e.residents.includes(n)),t_=n=>Zc.find(e=>e.id===$c(n?.id))||e_(n?.homeOwner),zy=n=>n?.homeOwners||t_(n)?.residents||(n?.homeOwner?[n.homeOwner]:[]),xi=Object.freeze({LEGACY:"legacy",SHOPPING:"shopping-district",PENINSULA:"peninsula"});let ar=xi.LEGACY;function Hy(n=xi.LEGACY){return ar=Object.values(xi).includes(n)?n:xi.LEGACY,ar}const Vy=()=>ar!==xi.LEGACY,n_=()=>ar===xi.PENINSULA,Gy=Object.freeze({z:1.6,width:8.8,depth:7.4}),Wy=Object.freeze({width:8.4,depth:7,doorX:0,bounds:{minX:-4.2,maxX:4.2,minZ:-3.5,maxZ:3.5},spawn:[0,0,2.9],exit:[0,1.1,3.42],yaw:0,staff:{Aya:[-2.6,0,1.2],Reiko:[-2.6,0,-1.9]}}),Qc=Object.freeze({title:"Front-Row Books",jp:"Front-Row Books",sub:"BOOKS · NEWSPAPERS · LOCAL STORIES",bookshop:!0,side:-1,line:"Aya’s small neighbourhood bookshop, with reading copies, second-hand books and Reiko’s evening newspaper.",directions:"On the west pavement, north of Minato Izakaya. A quiet bookshop with a window reading chair and a counter for recommendations."}),eh=Object.freeze({journal:"frontrow",electronics:"form3d",stepwise:"form3d",career:"office"}),i_=n=>eh[n]||n,Xy=n=>n==="form3d",Io=Object.freeze([{id:"frontrow",title:"Front-Row Books & Press",jp:"Maegeru Shobo/Printing",sub:"BOOKS · EVENING PRESS",side:1,z:4,color:7559241,accent:"#8b3f36",line:"Aya’s books and Reiko’s evening paper, under one roof.",directions:"The bookshop and printing desk share the west block, facing Main Street."},{id:"form3d",title:"Kenji & Tetsuo Repairs",jp:"Three-dimensional/electrical workshop",sub:"PATTERNS · RADIOS · INSTRUMENTS",side:1,z:4,color:5663603,accent:"#385f6e",line:"Kenji’s pattern bench and Tetsuo’s radio and instrument repairs.",directions:"The repair workshop is in the east block, across Main Street from the bookshop."},{id:"office",title:"Johansson Harbour Office",jp:"Port Affairs and Technology Office",sub:"MARINE SERVICE · HARBOUR RECORDS",side:1,z:-42,color:6453102,accent:"#49675d",line:"Shipping records, tide tables and Johansson’s marine service files.",directions:"Follow the main street to the quay. The harbour office is on the right, opposite the warehouse."},{id:"market",title:"Sakura Shōten",jp:"Sakura Shop",sub:"DAILY GOODS",side:-1,z:-28,color:10321022,accent:"#a76680",line:"Thuan’s convenience store · tea, snacks and everyday things."}].map(Object.freeze)),s_=()=>Io.map(n=>({...n})),Yy=()=>s_().filter(n=>["market","frontrow","form3d","office"].includes(n.id)).map(n=>n.id==="frontrow"?{...n,...Qc}:n.id==="form3d"?{...n,...Jc}:n);function qy(n){const e=new Set(Object.keys(eh));for(let t=n.length-1;t>=0;t--)e.has(n[t].id)&&n.splice(t,1);for(const t of Io){const i=n.find(s=>s.id===t.id);i&&Object.assign(i,t)}if(n_()){let t=n.find(s=>s.id==="form3d");t||(t={...Io.find(s=>s.id==="form3d")},n.push(t)),Object.assign(t,Jc);const i=n.find(s=>s.id==="frontrow");i&&Object.assign(i,Qc)}return n}function r_(n=[]){return[...new Set(n.map(e=>$c(i_(e))))]}const lr="johansson-town-1988-v5",o_=["johansson-town-1988-v4","johansson-town-1988-v3"];function a_(n){const e=t=>typeof t=="string"?t.replace(/\b(?:Yuri|Yui)\b/g,"Thuan"):t;for(const t of["residentLocations","residentLife"]){const i=n[t];if(!(!i||typeof i!="object"||Array.isArray(i)))for(const s of["Yuri","Yui"])Object.hasOwn(i,s)&&(Object.hasOwn(i,"Thuan")||(i.Thuan=i[s]),delete i[s])}Array.isArray(n.notes)&&(n.notes=[...new Set(n.notes.map(e))]);for(const t of Object.values(n.residentLife||{}))Array.isArray(t?.activities)&&(t.activities=t.activities.map(e));if(Array.isArray(n.sakura?.journal))for(const t of n.sakura.journal)t&&typeof t=="object"&&(t.buyer=e(t.buyer));return n}const th="johansson-town-players",$s=Object.freeze({id:"player-1",name:"Visitor"}),l_=n=>n===$s.id?lr:lr+"@"+n,cr=n=>String(n||"").replace(/[\u0000-\u001f<>]/g,"").trim().slice(0,24);function Ui(n){let e=null;try{e=JSON.parse(n?.getItem?.(th))}catch{}const t=Array.isArray(e?.players)?e.players.filter(s=>s&&typeof s.id=="string"&&/^[\w-]{1,40}$/.test(s.id)).map(s=>({id:s.id,name:cr(s.name)||"Visitor",created:Number(s.created)||0,lastPlayed:Number(s.lastPlayed)||0})):[];return t.some(s=>s.id===$s.id)||t.unshift({...$s,created:0,lastPlayed:0}),{active:t.some(s=>s.id===e?.active)?e.active:$s.id,players:t}}function Mr(n,e){try{return n.setItem(th,JSON.stringify(e)),!0}catch{return!1}}const jy=n=>{const e=Ui(n);return e.players.find(t=>t.id===e.active)};function Ky(n,e,t=Date.now()){const i=Ui(n),s="player-"+t.toString(36)+Math.floor(Math.random()*1296).toString(36);return i.players.push({id:s,name:cr(e)||"Visitor",created:t,lastPlayed:t}),i.active=s,Mr(n,i),s}function Jy(n,e){const t=Ui(n);return t.players.some(i=>i.id===e)?(t.active=e,Mr(n,t)):!1}function Zy(n,e){const t=Ui(n),i=t.players.find(s=>s.id===t.active);return!i||!cr(e)?!1:(i.name=cr(e),Mr(n,t))}function $y(n,e=Date.now()){const t=Ui(n),i=t.players.find(s=>s.id===t.active);i&&(i.lastPlayed=e,Mr(n,t))}function Qy(n){const e=l_(Ui(n).active);for(const t of e===lr?[lr,...o_]:[e])try{const i=JSON.parse(n.getItem(t));if(i&&typeof i=="object"&&!Array.isArray(i))return Array.isArray(i.visited)&&(i.visited=r_(i.visited.filter(s=>typeof s=="string"))),a_(i)}catch{}return null}function Qs(n){return{scale:Math.max(.5,Math.min(.9,((n.thigh+n.shin)*.94+n.foot-n.seatDrop)/.56)),saddle:.74}}function ev(n,e,t,i,s){const r=Math.sin(t)*.54*i,o=Math.cos(t)*.54*i;return s(n,e,.28)||s(n-r,e-o,.23*i)||s(n+r,e+o,.23*i)}function Gl(n,e,t){const i=n.getWorldPosition(new L),s=e.getWorldPosition(new L).sub(i).normalize(),r=t.clone().sub(i).normalize(),o=new gt().setFromUnitVectors(s,r).multiply(n.getWorldQuaternion(new gt));n.quaternion.copy(n.parent.getWorldQuaternion(new gt).invert().multiply(o)),n.updateWorldMatrix(!1,!0)}function Wl(n,e,t,i,s){const r=n.getWorldPosition(new L),o=e.getWorldPosition(new L),a=t.getWorldPosition(new L),l=r.distanceTo(o),c=o.distanceTo(a),h=i.clone().sub(r),u=Ue.clamp(h.length(),Math.abs(l-c)+1e-4,l+c-1e-4);h.normalize();const p=s.clone().addScaledVector(h,-s.dot(h)).normalize(),f=(l*l-c*c+u*u)/(2*u),g=Math.sqrt(Math.max(0,l*l-f*f));Gl(n,e,r.clone().addScaledVector(h,f).addScaledVector(p,g)),Gl(e,t,r.clone().addScaledVector(h,u))}function c_(n,e=0,t=Qs(n.measure)){const{bones:i,measure:s,root:r}=n,o=r.parent,a=t.scale;r.updateWorldMatrix(!0,!0);const l=o?o.getWorldQuaternion(new gt):new gt,c=(p,f,g)=>{const y=new L(p,f,g);return o?o.localToWorld(y):y},h=(p,f,g)=>new L(p,f,g).applyQuaternion(l),u=r.getWorldQuaternion(new gt);for(const[p,f,g]of[["L",-1,Math.PI],["R",1,0]]){const y=e*Math.PI*2+g;Wl(i["thigh"+p],i["knee"+p],i["foot"+p],c(f*.12*a,(.32+Math.sin(y)*.12)*a+s.foot,(.12+Math.cos(y)*.12)*a),h(0,0,-1));const m=i["foot"+p];m.quaternion.copy(m.parent.getWorldQuaternion(new gt).invert().multiply(u)),m.updateWorldMatrix(!1,!0),Wl(i["shoulder"+p],i["elbow"+p],i["hand"+p],c(f*.25*a,1.04*a+s.hand*.55,-.25*a),h(f,-.2,.1));const d=i["hand"+p];d.quaternion.copy(d.parent.getWorldQuaternion(new gt).invert().multiply(l)),d.updateWorldMatrix(!1,!0)}}function h_(n,e=2.4){const t=Ue.clamp(n/e,0,1);return{lift:Ue.smoothstep(t,0,.3)*(1-Ue.smoothstep(t,.7,1)),swallow:Ue.smoothstep(t,.4,.65),done:t>=1}}function nh(n,e,t=!1){return t?0:-(.55+.2*(1-Ue.clamp(n?.userData?.portion??1,0,1)))*e}function u_(n,e,t=!1){return t?0:-.05*(1-Ue.clamp(n?.userData?.portion??1,0,1))*Ue.smoothstep(e,.5,1)}function Xl(n,e,t){const i=n.getWorldPosition(new L),s=e.getWorldPosition(new L).sub(i).normalize(),r=new gt().setFromUnitVectors(s,t.clone().sub(i).normalize()).multiply(n.getWorldQuaternion(new gt));n.quaternion.copy(n.parent.getWorldQuaternion(new gt).invert().multiply(r)),n.updateWorldMatrix(!1,!0)}function d_(n,e){const t=n.bones,i=t.shoulderR.getWorldPosition(new L),s=i.distanceTo(t.elbowR.getWorldPosition(new L)),r=t.elbowR.getWorldPosition(new L).distanceTo(t.handR.getWorldPosition(new L)),o=e.clone().sub(i),a=Ue.clamp(o.length(),Math.abs(s-r)+1e-4,s+r-1e-4);o.normalize();const l=new L(-1,-.25,0).transformDirection(n.root.matrixWorld);l.addScaledVector(o,-l.dot(o)).normalize();const c=(s*s-r*r+a*a)/(2*a),h=Math.sqrt(Math.max(0,s*s-c*c));Xl(t.shoulderR,t.elbowR,i.clone().addScaledVector(o,c).addScaledVector(l,h)),Xl(t.elbowR,t.handR,i.clone().addScaledVector(o,a))}function f_(n,e,t=!1,i=null){const{root:s,measure:r,bones:o}=n;s.updateWorldMatrix(!0,!0);const a=vr(n.recipe),l=o.head,c=Math.PI*.28+a.mouthY/256*Math.PI*.58,h=Math.PI/2-.95+a.mouthX/256*1.9,u=hs(new L(-Math.cos(h)*Math.sin(c),Math.cos(c),Math.sin(h)*Math.sin(c)),r.profile),p=new L(u.x*r.Rh*r.headSX,r.headCentre-r.headY+u.y*r.Rh*r.headSY,u.z*r.Rh*.98+.025*r.k),f=s.localToWorld(new L(-r.shoulderX,r.shoulderY-r.upper*.75,r.depth*.75+r.fore*.45)),g=s.getWorldQuaternion(new gt).multiply(new gt().setFromAxisAngle(new L(1,0,0),nh(i,e,t))),y=new L(t?0:-.1*r.k,t?.04:(i?.userData.rimHeight??.15)-.08*r.k,t?.115:.015*r.k).applyQuaternion(g),m=o.shoulderR.getWorldPosition(new L),d=(r.upper+r.fore)*.985;let b=null;for(let v=0;v<12;v++){l.updateWorldMatrix(!0,!1),b=f.clone().lerp(l.localToWorld(p.clone()).sub(y),e);const _=b.distanceTo(m)-d;if(_<=5e-4||e<.01)break;l.rotation.x+=Math.min(.12,_/(r.Rh*1.1))}d_(n,b),o.handR.quaternion.copy(o.handR.parent.getWorldQuaternion(new gt).invert().multiply(g)),o.handR.updateWorldMatrix(!1,!0)}function hr(n,e,t=0,i="R"){const s=!!e.userData.food,r=n.measure,o=n.bones["hand"+i];n.root.updateWorldMatrix(!0,!0);const a=n.root.getWorldQuaternion(new gt).multiply(new gt().setFromAxisAngle(new L(1,0,0),nh(e,t,s))),l=new L(s?0:(i==="R"?-.1:.1)*r.k,s?0:-.08*r.k,.015*r.k).applyQuaternion(a),c=o.getWorldPosition(new L).add(l),h=new He().compose(c,a,new L(1,1,1));e.matrixAutoUpdate=!1,e.matrix.copy(o.matrixWorld).invert().multiply(h),e.matrixWorldNeedsUpdate=!0}const ih=Object.freeze({"Lighthouse keeper":{feel:{happy:"Nod",laugh:"Nod",shy:"Bow"},idle:["LookAround","LookAround","Think"],talk:["Nod","Think"]},"Porch sitter":{feel:{happy:"Nod",laugh:"Laugh",shy:"Fidget"},idle:["Stretch","LookAround"],talk:["Nod","Talk"]},"Old storyteller":{feel:{happy:"Clap",laugh:"Laugh",shy:"Fidget"},idle:["Think","LookAround"],talk:["Talk","Talk","Point","Clap"]},"Cloud watcher":{feel:{happy:"Heart",laugh:"Laugh",shy:"Coy"},idle:["Stretch","LookAround","Coy"],talk:["Coy","Heart","Talk"]},"Quiet craftsman":{feel:{happy:"Nod",laugh:"Nod",shy:"Shrug"},idle:["HandsOnHips","Think"],talk:["Nod","Shrug"]},"Easy neighbour":{feel:{happy:"Laugh",laugh:"Laugh",shy:"Shrug"},idle:["Stretch","HandsOnHips"],talk:["Shrug","Talk","Laugh"]},"Big heart":{feel:{happy:"Heart",laugh:"Laugh",shy:"Fidget",sad:"Slump"},idle:["Heart","Clap","HandsOnHips"],talk:["Heart","Talk","Laugh"]},Wanderer:{feel:{happy:"Tada",laugh:"Laugh",shy:"Shrug"},idle:["Stretch","Kachashi","LookAround"],talk:["Shrug","Laugh","Peace"]},Timekeeper:{feel:{happy:"Bow",laugh:"Nod",shy:"Bow"},idle:["HandsOnHips","LookAround"],talk:["Bow","Nod","Point"]},"Helping hand":{feel:{happy:"Clap",laugh:"Laugh",shy:"Fidget"},idle:["Wave","HandsOnHips"],talk:["Nod","Clap","Point"]},"Rising star":{feel:{happy:"Peace",laugh:"Laugh",shy:"Coy"},idle:["Peace","Coy","HeelKick"],talk:["Peace","Coy","Heart"]},"Festival friend":{feel:{happy:"HeelKick",laugh:"Laugh",shy:"Coy"},idle:["Heart","HeelKick","Kachashi"],talk:["Heart","Peace","Clap"]},"Straight shooter":{feel:{happy:"Nod",laugh:"Laugh",shy:"HandsOnHips"},idle:["HandsOnHips","HandsOnHips","LookAround"],talk:["Point","HandsOnHips","Nod"]},Joker:{feel:{happy:"Peace",laugh:"Laugh",shy:"Shrug"},idle:["Peace","Shrug","Coy"],talk:["Peace","Laugh","Shrug"]},Firecracker:{feel:{happy:"Tada",laugh:"Laugh",shy:"HandsOnHips",angry:"Stomp"},idle:["HandsOnHips","Fist","Tada"],talk:["Point","Fist","HandsOnHips"]},Typhoon:{feel:{happy:"Tada",laugh:"Laugh",shy:"Coy"},idle:["Tada","Kachashi","HeelKick","Cheer"],talk:["Tada","Peace","Laugh"]}}),p_=n=>(Ai(n.show)-1)/(Nn-1),m_=n=>(Ai(n.pace)-1)/(Nn-1),g_=n=>(Ai(n.talk)-1)/(Nn-1);function __(n={}){const e=qc(n),t=ih[e.name],i=p_(n),s=m_(n),r=34-i*20-s*6;return{type:e.name,feel:t.feel,idle:t.idle,talk:t.talk,idleEvery:[r*.6,r*1.4],talkChance:Math.min(.85,.3+i*.4+g_(n)*.15)}}Object.freeze([...new Set(Object.values(ih).flatMap(n=>[...Object.values(n.feel),...n.idle,...n.talk]))]);function tv(n=""){const e=String(n).toLowerCase();return/\b(ha){2,}|\bhehe|\bahaha|\blol\b|funny|joke|laugh/.test(e)?"laugh":/\bsorry\b|\bsad\b|\bmiss (him|her|them|it)|lonely|\balas\b|passed away|can't sleep|worried/.test(e)?"sad":/\?!|!\?|\breally\?|\bno way\b|\bwhat\?|goodness|\bwow\b/.test(e)?"surprised":/\b(love|wonderful|lovely|great|welcome|thank(s| you)|congratulations|happy|delicious|perfect|yay)\b|!/.test(e)?"happy":/\bhmm+\b|\bwell\.\.\.|let me think|i wonder/.test(e)?"thinking":null}const Ys=["hips","spine","chest","neck","head","shoulderL","elbowL","handL","shoulderR","elbowR","handR","thighL","kneeL","footL","thighR","kneeR","footR"],y_=(n,e)=>n<0||n>e?0:Math.sin(Math.PI*Math.min(1,n/e)),v_=(n,e,t=.25)=>Math.min(1,n/t,(e-n)/t),Si=Object.freeze({Wave:1.6,Bow:1.5,Nod:1.1,HeadShake:1.2,Point:1.6,Shrug:1.3,Clap:1.8,Laugh:2,Think:2.4,LookAround:2.6,Stretch:2.2,PickUp:1.6,Fist:1.4,Jab:.42,JabL:.42,Swipe:.7,Hurt:.5,Jump:.9,Cheer:1.6,Hop:1.2,Gasp:1.6,Stomp:1.4,Slump:2.2,Fidget:2.4,SitEnjoyFood:3.8,SitPresentFood:4.2,SitToast:2.4,SitDrink:2.4,SitEat:2.4,Drink:2.4,Eat:2.4,Heart:2.8,Peace:2.8,Coy:3,Tada:2.4,HandsOnHips:2.6,HeelKick:2.6,Talk:1/0,Kachashi:1/0,Crouch:1/0,Phone:1/0,FishIdle:1/0,Reel:1/0}),b_=Object.freeze({happy:"Hop",laugh:"Laugh",sad:"Slump",angry:"Stomp",shy:"Fidget",surprised:"Gasp",worried:"Think"});function Do(n,{lively:e=!1,random:t=Math.random}={}){const{bones:i,measure:s}=n,r=__(n.recipe?.profile||{}),o=ie=>ie[Math.floor(t()*ie.length)],a=()=>r.idleEvery[0]+t()*(r.idleEvery[1]-r.idleEvery[0]);let l=4+a()*.6,c=!1,h=10;const u=Zo(n.recipe.name||JSON.stringify(n.recipe)),p=.92+u()*.16,f=.8+u()*.25,g=(u()-.5)*.055,y=.85+u()*.3,m=Object.fromEntries(Ys.map(ie=>[ie,new L])),d=Object.fromEntries(Ys.map(ie=>[ie,new L])),b=new L;let v=0,_=Math.random()*10,R=0,w=0,A=null,C=1+Math.random()*3,S=-1,M=0,I=0,z=[0,0],N=2,O="neutral",X=null,Y=0,se=null,U=0;const x=(ie,W=0,ne=0,Re=0)=>d[ie].set(W,ne,Re),F=(ie,W=0,ne=0,Re=0)=>d[ie].add(new L(W,ne,Re));function oe(ie,W){return ie in Si?(A={name:ie,t:0,d:Si[ie]===1/0&&W?W:Si[ie]},!0):!1}const we=ie=>oe(ie,2.6+t()*1.4),Fe=()=>{A=null};function $(ie,W={}){_+=ie;const ne=A?.name||W.pose||W.seat;n.setOpenHands?.(["SitEnjoyFood","SitPresentFood"].includes(ne));const Re=["Eat","EatStanding","SitEat"].includes(ne),te=["Drink","DrinkStanding","SitDrink","SitToast"].includes(ne);if(Re||te){ne!==se&&(Y=0),Y+=ie;const k=Number.isFinite(W.consumeElapsed)?W.consumeElapsed:A?A.t+ie:Y%5;X={...h_(k),food:Re,elapsed:Y,cycle:Math.floor(Y/5)}}else X=null,Y=0;se=ne;for(const k of Ys)d[k].set(0,0,0);let B=0,K=0;const re=W.speed||0,D=re>.08&&!W.seated&&!W.riding;if(x("shoulderL",0,0,.13),x("shoulderR",0,0,-.13),x("elbowL",-.12),x("elbowR",-.12),W.riding){const k=W.ridePhase||0,J=W.bicycleFit||Qs(s);B=J.saddle*J.scale-s.hipY+s.seatDrop,x("thighL",-1.05+Math.sin(k*Math.PI*2)*.38),x("kneeL",1.05+Math.cos(k*Math.PI*2)*.4),x("thighR",-1.05-Math.sin(k*Math.PI*2)*.38),x("kneeR",1.05-Math.cos(k*Math.PI*2)*.4),x("chest",.28),x("head",-.18),x("shoulderL",-1.15,0,.18),x("shoulderR",-1.15,0,-.18),x("elbowL",-.35),x("elbowR",-.35)}else if(W.seated){const k=W.seat==="Soak"||W.pose==="Soak";B=(Number.isFinite(W.seatHeight)?W.seatHeight:.45)-s.hipY+s.seatDrop,x("thighL",-1.52,0,.06),x("thighR",-1.52,0,-.06),x("kneeL",1.45),x("kneeR",1.45),x("shoulderL",-.45,0,.15),x("shoulderR",-.45,0,-.15),x("elbowL",-.55),x("elbowR",-.55),F("chest",Math.sin(_*1.5)*.02);const J=W.pose;if(J==="Type")x("shoulderL",-.9,0,.1),x("shoulderR",-.9,0,-.1),x("elbowL",-.7+Math.sin(_*14)*.08),x("elbowR",-.7+Math.sin(_*13+1)*.08),x("head",.15);else if(J==="Eat"||J==="Drink"||W.seat==="SitEat"){const ee=Math.max(0,Math.sin(_*1.4))**4;x("shoulderR",-.6-ee*.9,0,-.25),x("elbowR",-.8-ee*1.3),x("head",.08-ee*.1)}else if(J==="Sleep"||W.sleeping)x("head",.45,0,.15),x("chest",.15);else if(k)x("thighL",-1.3,0,.25),x("thighR",-1.3,0,-.25),x("kneeL",.9),x("kneeR",.9),x("shoulderL",0,0,.9),x("shoulderR",0,0,-.9),x("head",-.1);else if(J==="Wake"){const ee=Math.max(0,Math.sin(_*.8));x("shoulderL",0,0,.4+ee*2.2),x("shoulderR",0,0,-.4-ee*2.2)}}else if(D){const k=W.running||re>2.6,J=s.leg*(k?2.6:1.7)*p;v+=re/J*Math.PI*2*ie*.5;const ee=k?.95:Math.min(.62,.25+re*.3),Z=Math.sin(v),Ae=Math.cos(v);x("thighL",-Z*ee),x("thighR",Z*ee),x("kneeL",Math.max(0,Math.sin(v-.9))*ee*1.5+.05),x("kneeR",Math.max(0,Math.sin(v+Math.PI-.9))*ee*1.5+.05),x("footL",Z*ee*.3),x("footR",-Z*ee*.3),x("shoulderL",Z*ee*f,0,.12),x("shoulderR",-Z*ee*f,0,-.12),x("elbowL",k?-1.35:-.25-Math.max(0,-Z)*.3),x("elbowR",k?-1.35:-.25-Math.max(0,Z)*.3),x("hips",0,Z*.14,0),x("chest",k?.22:.05,-Z*.18,0),x("head",k?-.12:-.02,Z*.08,0),K=Math.abs(Ae)*(k?.055:.025)*s.k-(k?.02:0),W.carrying&&(x("shoulderL",-1.15,0,.3),x("shoulderR",-1.15,0,-.3),x("elbowL",-.5),x("elbowR",-.5))}else{F("chest",Math.sin(_*1.6)*.025),x("hips",0,0,Math.sin(_*.45)*.035),F("head",Math.sin(_*.7)*.03,Math.sin(_*.31)*.12,Math.sin(_*.5)*.04),F("thighL",0,0,-Math.sin(_*.45)*.03),F("thighR",0,0,-Math.sin(_*.45)*.03),F("chest",g),F("head",0,Math.sin(_*.31*y)*.035,0),K=Math.sin(_*1.6*y)*.004;const k=W.pose;if(k==="CounterIdle")x("shoulderL",-.5,0,.2),x("shoulderR",-.5,0,-.2),x("elbowL",-.95),x("elbowR",-.95);else if(k==="Interact")x("shoulderL",-.75+Math.sin(_*4.5)*.18,0,.15),x("shoulderR",-.75+Math.sin(_*4.5+1.7)*.18,0,-.15),x("elbowL",-.8),x("elbowR",-.8),F("chest",.12),F("head",.2);else if(k==="DrinkStanding"||k==="Drink"){const J=Math.max(0,Math.sin(_*1.2))**4;x("shoulderR",-.5-J*1.1,0,-.2),x("elbowR",-.9-J*1.2)}else(k==="Sit"||k==="Sleep")&&x("head",.2);W.carrying&&(x("shoulderL",-1.15,0,.3),x("shoulderR",-1.15,0,-.3),x("elbowL",-.5),x("elbowR",-.5))}const ue=Ue.clamp((W.tipsy||0)/2.5,0,1);let le=0;if(ue>0&&!W.riding&&!W.airborne){const k=Math.sin(_*1.7),J=Math.max(0,Math.sin(_*.43+Math.sin(_*.19)*2))**8;if(W.seated)F("head",.22*ue+Math.sin(_*.6)*.06*ue,Math.sin(_*.37)*.1*ue,Math.sin(_*.5)*.12*ue),F("chest",.08*ue,0,Math.sin(_*.5)*.05*ue);else if(D){const ee=1+Math.sin(v*.5)*.35*ue;d.thighL.x*=ee,d.thighR.x*=2-ee,F("hips",0,0,k*.12*ue),F("chest",.06*ue+J*.25*ue,0,-k*.14*ue),F("head",.1*ue,Math.sin(_*.8)*.15*ue,k*.18*ue),F("shoulderL",0,0,.35*ue),F("shoulderR",0,0,-.35*ue),le=k*.07*ue+J*Math.sign(Math.sin(_*.21))*.06*ue}else F("hips",0,0,Math.sin(_*.9)*.06*ue),F("chest",.04*ue,0,-Math.sin(_*.9)*.08*ue),F("head",.12*ue,Math.sin(_*.4)*.12*ue,Math.sin(_*.9+.6)*.12*ue),F("thighL",0,0,.05*ue),F("thighR",0,0,-.05*ue),le=Math.sin(_*.9)*.04*ue}U+=(le-U)*(1-Math.exp(-ie*6)),W.airborne&&!W.seated&&(x("thighL",-.6),x("thighR",-.2),x("kneeL",1),x("kneeR",.6),x("shoulderL",-.3,0,1.6),x("shoulderR",-.3,0,-1.6));const ye=W.expression||"neutral";if(ye!==O){O=ye;const k=r.feel[ye]||b_[ye];k&&!W.seated&&!D&&!A&&we(k)}const pe=!!W.talking;if(e){const k=!D&&!W.seated&&!W.riding&&!W.airborne&&!W.sleeping&&!W.carrying&&!X&&(!W.pose||W.pose==="Idle")&&!W.heldProp;pe&&!c&&h>.8&&k&&!A&&t()<r.talkChance&&we(o(r.talk)),k&&!pe&&!A?(l-=ie,l<=0&&(we(o(r.idle)),l=a())):l=Math.max(l,2)}if(h=pe?0:h+ie,c=pe,W.waving&&!A&&oe("Wave"),A)if(A.t+=ie,A.t>=A.d)A=null;else{const k=he(A);k?.root!==void 0&&(B+=k.root)}let De=null;if(W.gaze&&!W.sleeping){b.set(...W.gaze.isVector3?W.gaze.toArray():W.gaze),n.root.worldToLocal(b);const k=Math.atan2(b.x,b.z),J=-Math.atan2(b.y-s.headCentre,Math.hypot(b.x,b.z));if(Math.abs(k)<2.4){const ee=Ue.clamp(k,-1.35,1.35),Z=Ue.clamp(J,-.45,.4);F("head",Z*.8,ee*.62,0),F("chest",Z*.15,ee*.3,0),De=[Ue.clamp((k-ee*.62)*1.6,-1,1),Ue.clamp(Z*.5,-.6,.6)]}}const ve=1-Math.exp(-ie*14);for(const k of Ys)m[k].lerp(d[k],ve),i[k].rotation.set(m[k].x,m[k].y,m[k].z);R+=(B-R)*(W.seated||W.riding?1-Math.exp(-ie*9):ve),w+=(K-w)*ve,W.riding&&(R=B),n.root.position.x=W.riding?0:U,n.root.position.z=W.riding?.21*(W.bicycleFit||Qs(s)).scale:0,n.root.position.y=R+(W.seated||W.riding?0:W.floorHeight||0),i.hips.position.y=s.hipY+(W.riding?0:w),W.riding?c_(n,W.ridePhase||0,W.bicycleFit||Qs(s)):X&&(i.head.rotation.x+=u_(W.heldProp,X.lift,X.food),f_(n,X.lift,X.food,W.heldProp)),C-=ie,C<=0&&S<0&&(S=0,C=1.8+Math.random()*3.8);let P=0;S>=0&&(S+=ie,P=S<.13?1:0,S>=.13&&(S=-1)),W.talking?(M-=ie,M<=0&&(M=.09+Math.random()*.12,I=I?0:Math.random()<.8?1:0)):I=0,N-=ie,N<=0&&(N=1.2+Math.random()*3,z=Math.random()<.45?[0,0]:[(Math.random()-.5)*1.6,(Math.random()-.5)*.8]);const T=W.sleeping?"sleep":ye;n.paintFace({expression:T,blink:P,talk:I,look:W.look||De||(T==="thinking"?[1,-1]:z)})}function he(ie,W){const ne=ie.t,Re=ie.d,te=Re===1/0?1:y_(ne,Re),B=Re===1/0?Math.min(1,ne/.3):v_(ne,Re);switch(ie.name){case"Wave":x("shoulderR",-.2,0,-2.55*B),x("elbowR",0,0,-.45+Math.sin(ne*10)*.45*B),F("head",0,0,.08*B);break;case"Bow":F("chest",.95*te),F("spine",.25*te),F("head",.2*te),x("shoulderL",.1,0,.05),x("shoulderR",.1,0,-.05);break;case"Nod":F("head",Math.sin(ne*9)*.28*te);break;case"HeadShake":F("head",0,Math.sin(ne*11)*.45*te);break;case"Point":x("shoulderR",-1.5*B,.2,-.1),x("elbowR",-.05),F("head",0,-.15*B);break;case"Shrug":x("shoulderL",-.3*te,0,.55*te+.13),x("shoulderR",-.3*te,0,-.55*te-.13),x("elbowL",-1.3*te),x("elbowR",-1.3*te),F("head",0,0,.2*te);break;case"Clap":{const K=Math.abs(Math.sin(ne*9));x("shoulderL",-1.2*B,0,.1+K*.35),x("shoulderR",-1.2*B,0,-.1-K*.35),x("elbowL",-.9*B),x("elbowR",-.9*B);break}case"Laugh":F("chest",-.24*te+Math.sin(ne*16)*.07*te),F("head",-.32*te),x("shoulderL",-.85*te,0,.4),x("shoulderR",-.85*te,0,-.4),x("elbowL",-1.65*te),x("elbowR",-1.65*te);break;case"Gasp":return F("chest",-.18*te),F("head",-.12*te),x("shoulderL",-.7*te,0,.28),x("shoulderR",-.7*te,0,-.28),x("elbowL",-1.9*te),x("elbowR",-1.9*te),{root:Math.sin(Math.PI*ne/Re)*.045};case"Think":x("shoulderR",-1.25*B,0,-.35),x("elbowR",-1.95*B),x("shoulderL",-.4*B,0,.3),x("elbowL",-1.4*B),F("head",.12*B,0,.18*B);break;case"LookAround":F("head",0,Math.sin(ne*2.4)*.75*te),F("chest",0,Math.sin(ne*2.4)*.2*te);break;case"Stretch":x("shoulderL",-.2,0,2.8*te),x("shoulderR",-.2,0,-2.8*te),F("chest",-.25*te),F("head",-.3*te);break;case"PickUp":return F("chest",1.1*te),F("spine",.3*te),x("shoulderR",-1.3*te),x("thighL",-.5*te),x("thighR",-.5*te),x("kneeL",.9*te),x("kneeR",.9*te),{root:-.08*te};case"Fist":x("shoulderR",-2.4*B+Math.sin(ne*8)*.2*B,0,-.1),x("elbowR",-.5*B),F("chest",-.1*B);break;case"Jab":case"JabL":{const K=ie.name==="Jab",re=K?"R":"L",D=K?"L":"R",ue=K?1:-1,le=ne<.1?-(ne/.1)*.3:ne<.2?(ne-.1)/.1:Math.max(0,1-(ne-.2)/.22);return x("shoulder"+re,-.9-.75*le,0,-ue*.05),x("elbow"+re,-1.9+1.85*le),x("shoulder"+D,-1.05,0,ue*.18),x("elbow"+D,-2.1),F("chest",.06*le,-ue*.4*le),F("head",0,ue*.12*le),{root:-.02*B}}case"Swipe":{const K=ne<.32?ne/.32:Math.max(0,1-(ne-.32)/.14),re=ne<.32?0:Math.min(1,(ne-.32)/.14)*Math.max(0,1-(ne-.5)/.2);return x("shoulderL",-2.7*K-1.2*re,0,.25),x("shoulderR",-2.7*K-1.2*re,0,-.25),x("elbowL",-.4*K),x("elbowR",-.4*K),F("chest",-.2*K+.45*re),F("head",-.15*K+.2*re),{root:.04*K}}case"Hurt":return x("shoulderL",-.5*te,0,.9*te+.13),x("shoulderR",-.5*te,0,-.9*te-.13),x("elbowL",-.5*te),x("elbowR",-.5*te),F("chest",-.4*te),F("head",-.35*te,Math.sin(ne*20)*.1*te),{root:-.03*te};case"Jump":{const K=ne<.2?-.08:Math.sin(Math.PI*Math.min(1,(ne-.2)/.6))*.25;return x("shoulderL",-.3,0,1.4*B),x("shoulderR",-.3,0,-1.4*B),x("kneeL",ne<.2?.8:.3),x("kneeR",ne<.2?.8:.3),x("thighL",ne<.2?-.5:-.2),x("thighR",ne<.2?-.5:-.2),{root:K}}case"Cheer":return x("shoulderL",-.2,0,2.6*B),x("shoulderR",-.2,0,-2.6*B),x("elbowL",-.3),x("elbowR",-.3),{root:Math.abs(Math.sin(ne*7))*.1*te};case"Hop":return x("shoulderL",-.2,0,.9*te),x("shoulderR",-.2,0,-.9*te),F("head",-.15*te),{root:Math.abs(Math.sin(ne*8))*.12*te};case"Stomp":x("shoulderL",-.2,0,.35),x("shoulderR",-.2,0,-.35),x("elbowL",-1.6*B),x("elbowR",-1.6*B),x("thighL",-.5*Math.max(0,Math.sin(ne*9))*te),x("kneeL",.6*Math.max(0,Math.sin(ne*9))*te),F("head",.18*te,Math.sin(ne*14)*.1*te),F("chest",.12*te);break;case"Slump":return F("chest",.3*te),F("head",.4*te),x("shoulderL",.05,0,.03),x("shoulderR",.05,0,-.03),{root:-.03*te};case"Fidget":x("shoulderL",-.55*B,0,-.2*B),x("shoulderR",-.55*B,0,.2*B),x("elbowL",-.6*B),x("elbowR",-.6*B),F("head",.18*te,0,.25*te),F("hips",0,Math.sin(ne*3)*.12*te);break;case"SitEnjoyFood":{x("shoulderL",-.7*B,.18*B,.62*B),x("shoulderR",-.7*B,-.18*B,-.62*B),x("elbowL",-1.35*B),x("elbowR",-1.35*B),x("handL",-1.25*B,.55*B,.25*B),x("handR",-1.25*B,-.55*B,-.25*B),F("chest",.05*te),F("head",-.06*te,0,.16*te);break}case"SitPresentFood":{x("shoulderL",-1.1*B,0,.22*B),x("shoulderR",-1.1*B,0,-.22*B),x("elbowL",-1.18*B),x("elbowR",-1.18*B),x("handL",-1.45*B,0,.18*B),x("handR",-1.45*B,0,-.18*B),F("head",-.08*te,0,-.1*te);break}case"SitToast":x("shoulderR",-1.9*B,0,-.2),x("elbowR",-.6*B),F("head",-.15*B);break;case"SitDrink":{const K=Math.max(0,Math.sin(ne*2.6))**2;x("shoulderR",-.6-K*1,0,-.25),x("elbowR",-.9-K*1.2);break}case"Heart":return x("shoulderL",-.8*B,0,.5*B),x("elbowL",-.45*B,0,-1.7*B),x("shoulderR",-.8*B,0,-.5*B),x("elbowR",-.45*B,0,1.7*B),F("head",.06*B,0,.22*B+Math.sin(ne*3.2)*.04*B),x("hips",0,0,-.05*B),x("thighR",-.12*B),x("kneeR",.3*B),{root:Math.abs(Math.sin(ne*3.2))*.012*B};case"Peace":{x("shoulderR",-.55*B,0,-1.25*B),x("elbowR",-1.9*B,0,-.2*B),x("shoulderL",.15*B,0,.75*B),x("elbowL",-.3*B,0,-1.5*B),F("head",.06*B,-.1*B,-.24*B),x("hips",0,.15*B,-.07*B),x("thighL",-.15*B),x("kneeL",.4*B);break}case"Coy":{x("shoulderR",-1.15*B,0,-.12*B),x("elbowR",-2.1*B),x("shoulderL",.15*B,0,.75*B),x("elbowL",-.3*B,0,-1.5*B),F("head",.12*B,.2*B,.2*B),F("chest",0,.12*B,-.05*B),x("hips",0,-.2*B,.08*B),x("thighR",-.1*B,0,-.06*B),x("kneeR",.3*B);break}case"Tada":{const K=Math.min(1,ne/.3);return x("shoulderL",-.15*B,0,1.9*B),x("shoulderR",-.15*B,0,-1.9*B),x("elbowL",0,0,.2*B),x("elbowR",0,0,-.2*B),x("thighL",.35*B*K),x("kneeL",1.3*B*K),F("chest",-.12*B),F("head",-.15*B,0,.12*B),{root:.03*B*K}}case"HandsOnHips":x("shoulderL",.15*B,0,.75*B),x("elbowL",-.3*B,0,-1.5*B),x("shoulderR",.15*B,0,-.75*B),x("elbowR",-.3*B,0,1.5*B),F("chest",-.12*B),F("head",-.12*B,0,Math.sin(ne*2.2)*.08*B),x("thighL",0,0,.12*B),x("thighR",0,0,-.12*B);break;case"HeelKick":x("thighR",.45*B),x("kneeR",1.7*B+Math.sin(ne*3)*.08*B),x("shoulderL",-1.2*B,0,-.2*B),x("shoulderR",-1.2*B,0,.2*B),x("elbowL",-1.6*B),x("elbowR",-1.6*B),F("head",.08*B,0,-.25*B),F("chest",.1*B,0,-.06*B);break;case"Talk":x("shoulderR",-.55+Math.sin(ne*3.1)*.25,0,-.2),x("elbowR",-1.1+Math.sin(ne*4.3)*.3),x("shoulderL",-.35+Math.sin(ne*2.3+1)*.2,0,.2),x("elbowL",-1+Math.sin(ne*3.7)*.3),F("head",Math.sin(ne*2.6)*.06);break;case"Kachashi":{const K=Math.sin(ne*5.5),re=Math.sin(ne*2.75);return x("shoulderL",-.4,0,1.9+K*.25),x("shoulderR",-.4,0,-1.9+K*.25),x("elbowL",0,0,1.1+K*.5),x("elbowR",0,0,-1.1+K*.5),x("hips",0,re*.2,re*.08),F("chest",0,-re*.2),F("head",0,re*.15,-re*.1),x("thighL",-Math.max(0,re)*.5),x("kneeL",Math.max(0,re)*.8),x("thighR",-Math.max(0,-re)*.5),x("kneeR",Math.max(0,-re)*.8),{root:Math.abs(re)*.03}}case"Crouch":return x("thighL",-1.7,0,.25),x("thighR",-1.7,0,-.25),x("kneeL",2.3),x("kneeR",2.3),x("footL",-.6),x("footR",-.6),F("chest",.5),x("shoulderL",-.9,0,.1),x("shoulderR",-.9,0,-.1),x("elbowL",-.4),x("elbowR",-.4),{root:-(s.thigh+s.shin)*.72};case"Phone":x("shoulderR",-.4,0,-.5),x("elbowR",-2.2),F("head",0,0,-.15);break;case"FishIdle":x("shoulderL",-1,0,.1),x("shoulderR",-1,0,-.1),x("elbowL",-.6),x("elbowR",-.6);break;case"Reel":x("shoulderL",-1,0,.1),x("elbowL",-.6),x("shoulderR",-1+Math.sin(ne*9)*.25,0,-.2),x("elbowR",-.8+Math.cos(ne*9)*.3);break}return null}return{update:$,play:oe,stop:Fe,style:r,get gesture(){return A?.name||null},get consumption(){return X}}}const qn=Object.freeze(Object.fromEntries(["icecream","ramen","onigiri","curry","gyoza"].map(n=>[n,`./assets/food/island-${n}.png`])));function nv(n){const e=String(n).toLowerCase();return/ice cream/.test(e)?qn.icecream:/rice ball|onigiri/.test(e)?qn.onigiri:/ramen/.test(e)?qn.ramen:/gyoza|dumpling/.test(e)?qn.gyoza:/curry/.test(e)&&!/pack|box|pouch/.test(e)?qn.curry:null}const Yl=new Map;function M_(n,e){if(!qn[e]||typeof Image>"u")return;const t=new Xt;t.name="Food geometry fallback";for(const c of[...n.children])t.add(c);n.add(t);const i=new uc({transparent:!0,alphaTest:.02,depthWrite:!1}),s=new Wm(i);s.name="Original "+e+" food cutout",s.scale.set(.25,.25,1),s.position.y=.105,s.visible=!1,n.add(s);const r=n.userData;r.foodCutout={sprite:s,fallback:t,ready:!1};const o=c=>{s.parent&&(i.map=c,i.needsUpdate=!0,r.foodCutout.ready=!0,t.visible=!1,s.visible=!0)},a=Yl.get(e);if(a){a.then(o);return}const l=new Promise(c=>new V0().load(qn[e],h=>{h.colorSpace=Ft,c(h)},void 0,()=>{}));Yl.set(e,l),l.then(o)}function x_(n){const e=n.userData,t=e.foodCutout;if(!t?.ready)return;const i=e.portion??1;t.sprite.visible=i>0,t.sprite.material.opacity=Math.min(1,i*1.8);const s=.25*(.65+.35*i);t.sprite.scale.set(s,s,1),t.fallback.visible=i===0}const jn=Object.freeze({draft:Object.freeze({id:"draft",jp:"Orion draught, medium mug",en:"Orion draught, a frosted mug",price:450,sips:6,alcohol:1,pour:4.2,line:"One Orion draught! Cold from the tap."}),bottle:Object.freeze({id:"bottle",jp:"Orion Large bottle",en:"Orion large bottle and a small glass",price:600,sips:8,alcohol:1.4,pour:2,line:"It's a big bottle. Pour for yourself -- or I pour the first one."}),can:Object.freeze({id:"can",jp:"Orion Can",en:"Orion can, 350 ml",price:300,sips:4,alcohol:.8,pour:1.2,line:"Still in the can? Straight from the can, then."}),awamori:Object.freeze({id:"awamori",jp:"Awamori on the rocks",en:"awamori on the rocks",price:250,sips:5,alcohol:1.6,pour:1.8,line:"Awamori. Slowly -- it is older than you think."}),sake:Object.freeze({id:"sake",jp:"Warm sake, one flask",en:"a flask of warm sake",price:220,sips:5,alcohol:1.3,pour:2.4,line:"Hot sake. Careful, the tokkuri is hot."}),oolong:Object.freeze({id:"oolong",jp:"Oolong tea",en:"Oolong tea over ice",price:150,sips:4,alcohol:0,pour:1.6,line:"Oolong tea. Plenty of ice."})}),yi=Object.freeze({yakitori:Object.freeze({id:"yakitori",jp:"Assorted Yakitori",en:"a plate of yakitori",price:180,bites:4,station:"grill",cook:6,line:"Yakitori. Two tare, two salt."}),edamame:Object.freeze({id:"edamame",jp:"Edamame",en:"a bowl of edamame",price:120,bites:3,station:"prep",cook:2,line:"Edamame. Salted while they were hot."}),oden:Object.freeze({id:"oden",jp:"Oden",en:"a bowl of oden",price:260,bites:4,station:"oden",cook:3,line:"Oden. The daikon has been in since four."}),hiyayakko:Object.freeze({id:"hiyayakko",jp:"Cold tofu",en:"cold tofu with ginger",price:150,bites:3,station:"prep",cook:2,line:"It's cold tofu. Ginger and a little soy."}),dashimaki:Object.freeze({id:"dashimaki",jp:"Dashi-rolled egg",en:"a rolled dashi omelette",price:200,bites:3,station:"range",cook:5,line:"Dashi roll. Still warm in the middle."}),hokke:Object.freeze({id:"hokke",jp:"Grilled Atka mackerel",en:"grilled hokke",price:280,bites:4,station:"grill",cook:7,line:"It's Hokke. Lemon on the side."}),sashimi:Object.freeze({id:"sashimi",jp:"Assorted sashimi",en:"the sashimi plate",price:320,bites:4,station:"prep",cook:4,line:"Sashimi. Masaru brought the tuna this morning."}),agedashi:Object.freeze({id:"agedashi",jp:"Fried tofu",en:"agedashi tofu",price:180,bites:3,station:"fryer",cook:5,line:"It's fried. Mind the broth, it is hot."}),karaage:Object.freeze({id:"karaage",jp:"Fried chicken",en:"chicken karaage",price:220,bites:4,station:"fryer",cook:6,line:"It's fried chicken. Straight out of the oil."}),ochazuke:Object.freeze({id:"ochazuke",jp:"Ochazuke",en:"ochazuke to finish",price:180,bites:3,station:"range",cook:4,line:"Ochazuke. The way to end an evening."})});Object.freeze([...Object.values(yi),...Object.values(jn)]);const fo=n=>jn[n]||yi[n]||null,ql=Object.freeze({grill:[1.7,0,-3.6],oden:[-4.2,0,-3.6],range:[1.4,0,-5.15],fryer:[2.75,0,-5.15],prep:[5.4,0,-5.15]}),po=Object.freeze([3.5,0,-3.8]),iv=Object.freeze({table:Object.freeze({id:"table",label:"Sit at the table",position:[3.3,0,.9],stand:[3.3,0,.25],eyeY:1.14,yaw:Math.PI,table:[3.3,.945,1.52],dish:[3.02,.945,1.5],serve:[3.95,0,.3],route:[[3.95,-3.55],[3.95,.3]]}),window:Object.freeze({id:"window",label:"Sit and enjoy the evening",position:[4,0,2.7],stand:[2.95,0,2.7],eyeY:1.2,yaw:Math.PI/2,table:[3.62,.945,2.55],dish:[3.62,.945,2.3],serve:[4,0,1.6],route:[[3.95,-3.55],[3.95,.3],[4,1.6]]}),...Object.fromEntries([-3.8,-2.3,-.8,.7,2.2].map((n,e)=>["counter"+e,Object.freeze({id:"counter"+e,label:"Sit at the counter",counter:!0,position:[n,0,-1.42],stand:[n,0,-.72],eyeY:1.32,yaw:0,table:[n+.15,1.11,-2.2],dish:[n-.12,1.11,-2.24],serve:[n,0,-3.75],route:[[n,-3.75]]})]))});function jl(n,e,t,i,s){const r=e.position.y-i/2,o=10,a=new Float32Array(o*3),l=[];for(let u=0;u<o;u++){const p=u*2.4,f=s*(.25+.7*(u*37%10)/10);a[u*3]=e.position.x+Math.cos(p)*f,a[u*3+1]=r+u*.31%1*i,a[u*3+2]=Math.sin(p)*f,l.push(.012+u*13%7*.004)}const c=new _t;c.setAttribute("position",new Pt(a,3));const h=new Km(c,new mc({color:16773828,size:.0035,transparent:!0,opacity:.8,depthWrite:!1}));h.name="Beer bubbles",n.add(h),n.userData.pour={liquid:e,head:t,bottom:r,height:i,headHeight:t.geometry.parameters.height,bubbles:h,rise:l}}function S_(n,e){const t=n.pour,i=n.portion,s=t.bottom+t.height*i;t.liquid.scale.y=Math.max(.001,i),t.liquid.position.y=t.bottom+t.height*i/2,t.head.visible=i>.03,t.head.scale.y=.55+.45*i,t.head.position.y=s+t.headHeight*t.head.scale.y/2;const r=t.bubbles.geometry.attributes.position;t.bubbles.visible=i>.05;for(let o=0;o<r.count;o++){let a=r.getY(o)+t.rise[o]*e*(i>.1?1:.3);a>s&&(a=t.bottom+(a-s)%Math.max(.005,s-t.bottom)),r.setY(o,a)}r.needsUpdate=!0}function sh(n,{held:e=!1}={}){const t=new Xt;t.name="Minato drink · "+n;const i=new St({color:14674148,roughness:.08,metalness:0,transparent:!0,opacity:.42,depthWrite:!1}),s=new St({color:14259230,roughness:.3,emissive:4860418,emissiveIntensity:.25}),r=new St({color:16512486,roughness:.9}),o=(l,c,h=0,u=0,p=0)=>{const f=new ht(l,c);return f.position.set(u,h,p),t.add(f),f},a=new Xt;if(t.add(a),t.userData.level=a,n==="draft"){o(new Ze(.045,.042,.15,20),i,.075);const l=new ht(new Ze(.041,.039,.12,20),s);l.position.y=.063,a.add(l);const c=new ht(new Ze(.043,.041,.025,20),r);c.position.y=.135,a.add(c),jl(t,l,c,.12,.036);const h=o(new nn(.03,.007,8,16,Math.PI),i,.08,.05);h.rotation.z=-Math.PI/2}else if(n==="bottle"){const l=new St({color:5910032,roughness:.25,transparent:!0,opacity:.48,depthWrite:!1});if(!e){o(new Ze(.038,.038,.2,18),l,.1,-.06),o(new Ze(.013,.036,.08,14),l,.24,-.06),o(new Ze(.034,.034,.05,18),new St({color:15921384,roughness:.6}),.1,-.06);const p=new ht(new Ze(.034,.034,.185,18),s);p.position.set(-.06,.095,0),a.add(p)}const c=e?0:.05;o(new Ze(.03,.027,.09,16),i,.045,c);const h=new ht(new Ze(.027,.025,.07,16),s);h.position.set(c,.037,0),a.add(h);const u=new ht(new Ze(.028,.027,.012,16),r);u.position.set(c,.078,0),a.add(u),jl(t,h,u,.07,.022)}else if(n==="can")o(new Ze(.033,.033,.122,20),new St({color:15921902,roughness:.35,metalness:.55}),.061),o(new Ze(.0335,.0335,.045,20),new St({color:1986460,roughness:.4,metalness:.4}),.07),o(new Ze(.0336,.0336,.008,20),new St({color:13120042,roughness:.4}),.095);else if(n==="coffee"){const l=new St({color:16052714,roughness:.35});o(new Ze(.036,.028,.07,20,1,!0),new St({color:16052714,roughness:.35,side:2}),.035),o(new Ze(.028,.028,.004,20),l,.002);const c=o(new nn(.017,.005,8,14,Math.PI),l,.04,.038);c.rotation.z=-Math.PI/2,e||o(new Ze(.062,.055,.008,24),l,-.004);const h=new ht(new Ze(.033,.028,.055,20),new St({color:2823690,roughness:.15}));h.position.y=.03,a.add(h)}else{o(new Ze(.036,.032,.11,18),i,.055);const l=new ht(new Ze(.033,.03,.085,18),new St({color:n==="mugicha"?11036714:8011544,roughness:.25,transparent:!0,opacity:n==="mugicha"?.78:.85}));l.position.y=.045,a.add(l);for(let c=0;c<3;c++){const h=new ht(new wt(.022,.022,.022),i);h.position.set((c-1)*.012,.08,c%2*.01),h.rotation.set(c,c*.7,0),a.add(h)}}return t.userData.portion=1,t.userData.targetPortion=1,t.userData.consumable="drink",t.userData.rimHeight=n==="draft"?.15:n==="bottle"?.09:n==="can"?.122:n==="coffee"?.07:.11,t.traverse(l=>{l.isMesh&&(l.castShadow=!1,l.receiveShadow=!0)}),t}function rh(n){const e=new Xt;e.name="Minato dish · "+n;const t=a=>new St({color:a,roughness:.6}),i=(a,l,c=0,h=0,u=0,p=e)=>{const f=new ht(a,l);return f.position.set(c,h,u),p.add(f),f},s=new Xt;e.add(s),e.userData.level=s;const r=(a,l,c=3102834)=>i(new wt(a,.014,l),t(c),0,.007),o=(a,l,c=15854816)=>i(new Ze(a,a*.7,l,16,1,!0),new St({color:c,roughness:.35,side:2}),0,l/2);if(n==="yakitori"||n==="hokke")if(r(.26,.12,15854816),n==="yakitori")for(let a=0;a<4;a++){i(new wt(.22,.006,.006),t(10513474),0,.02,-.04+a*.027,s);for(let l=0;l<4;l++)i(new wt(.03,.024,.024),t(a%2?8142619:14267002),-.07+l*.045,.028,-.04+a*.027,s)}else{const a=i(new wt(.2,.025,.08),t(11565637),0,.027,0,s);a.rotation.y=.1,i(new Mt(.018,8,6),t(15917914),.09,.03,.04,s)}else if(n==="sashimi"){r(.24,.16,15854816);for(let a=0;a<6;a++)i(new wt(.04,.018,.1),t([15370844,10366005,15721426][a%3]),-.08+a*.032,.024,0,s).rotation.y=.25;i(new Mt(.015,8,6),t(8231749),.1,.025,.05,s)}else if(n==="edamame"||n==="karaage"){o(.07,.045,3102834);for(let a=0;a<(n==="edamame"?9:6);a++){const l=a*2.3,c=.035*(a%3/2+.3);i(n==="edamame"?new wt(.045,.014,.018):new Mt(.022,8,6),t(n==="edamame"?8231749:12088366),Math.cos(l)*c,.045,Math.sin(l)*c,s).rotation.y=l}}else if(n==="oden"||n==="agedashi"||n==="ochazuke"||n==="ramen"||n==="rice")if(o(.075,.06,n==="ochazuke"?3102834:9067066),i(new Ze(.068,.068,.004,16),t(n==="ochazuke"?12034908:11039535),0,.045,0,s),n==="oden")i(new Ze(.025,.025,.03,12),t(14930854),-.025,.05,0,s),i(new Mt(.02,8,6),t(12159562),.025,.052,.01,s);else if(n==="agedashi")for(let a=0;a<2;a++)i(new wt(.04,.03,.04),t(14132570),-.02+a*.04,.05,0,s);else if(n==="ramen"||n==="rice")for(let a=0;a<6;a++)i(new Mt(.016,8,6),t(15257466),(a%3-1)*.025,.052,Math.floor(a/3)*.025-.012,s);else i(new wt(.05,.004,.05),t(2042402),0,.05,0,s);else if(n==="hiyayakko")r(.12,.12,3102834),i(new wt(.07,.04,.07),t(15854816),0,.035,0,s),i(new wt(.02,.01,.02),t(14267226),0,.06,0,s);else if(n==="gyoza"){r(.22,.12,15854816);for(let a=0;a<6;a++)i(new Mt(.024,8,6),t(14267002),-.08+a*.032,.022,0,s).scale.set(.8,.6,1.4)}else{r(.2,.1,15854816);for(let a=0;a<4;a++)i(new wt(.035,.035,.06),t(15780170),-.06+a*.04,.03,0,s)}return M_(e,n),e.userData.portion=1,e.userData.targetPortion=1,e.userData.consumable="food",e.traverse(a=>{a.isMesh&&(a.castShadow=!1,a.receiveShadow=!0)}),e}function on(n,e,{immediate:t=!1}={}){const i=Ue.clamp(Number(e)||0,0,1);n.userData.targetPortion=i,t&&(n.userData.portion=i,Ri(n,0))}function Ri(n,e){const t=n.userData,i=t.level;if(!i)return;const s=t.targetPortion??1,r=t.portion??1;if(t.portion=Math.abs(r-s)<.001?s:Ue.damp(r,s,7,Math.max(0,e)),i.visible=t.portion>0,x_(n),t.consumable==="food"){const o=i.children.length*t.portion;i.children.forEach((a,l)=>{a.visible=l<Math.ceil(o),a.scale.setScalar(Math.min(1,Math.max(0,o-l)))})}else if(t.pour){i.scale.y=1,S_(t,e);for(const o of i.children)o!==t.pour.liquid&&o!==t.pour.head&&(o.userData.baseY??=o.position.y,o.scale.y=Math.max(.001,t.portion),o.position.y=o.userData.baseY*t.portion)}else i.scale.y=Math.max(.001,t.portion)}function w_(n){const e=new Xt;e.userData.food=!0,e.userData.consumable="food",e.userData.portion=1,e.userData.targetPortion=1;const t=new St({color:13214315,roughness:.6});for(const r of[-.008,.008]){const o=new ht(new wt(.005,.005,.16),t);o.position.set(r,.02,.04),e.add(o)}const i=new Xt;e.add(i),e.userData.level=i;const s=new ht(new Mt(.018,8,6),new St({color:n==="edamame"?8231749:n==="sashimi"?15370844:14267002,roughness:.6}));return s.position.set(0,.04,.1),i.add(s),e}function No(n){if(!n)return;n.removeFromParent();const e=new Set;n.traverse(t=>{if(t.isMesh||t.isSprite){t.isMesh&&t.geometry.dispose();for(const i of Array.isArray(t.material)?t.material:[t.material])e.add(i)}}),e.forEach(t=>t.dispose())}function sv({room:n,getNao:e,blocked:t,say:i=()=>{}}){let s=null,r=null,o=null,a=0;function l(d){if(d)for(const b of["playerService","heldItem","socialPose","carrying"])delete d.userData[b]}function c(d,b,v){for(;b.length;){const[_,R]=b[0],w=_-d.position.x,A=R-d.position.z,C=Math.hypot(w,A);if(C<.03){b.shift();continue}const S=Math.atan2(-w,-A),M=Math.atan2(Math.sin(S-d.rotation.y),Math.cos(S-d.rotation.y));if(d.rotation.y+=Math.max(-v*5,Math.min(v*5,M)),Math.abs(M)<.9){const I=Math.min(C,v*1.15*(1-Math.abs(M)/1.2));d.position.x+=w/C*I,d.position.z+=A/C*I}return!1}return!0}const h=d=>{d&&(d.prop.removeFromParent(),d.prop.traverse(b=>{b.isMesh&&(b.geometry.dispose(),b.material.dispose?.())}))};function u(){h(r),r=null}function p(){h(o),o=null}const f=(d,b,v)=>{d.rotation.y=Math.atan2(-(b-d.position.x),-(v-d.position.z))},g=()=>[po[0],po[2]];function y(d,b){if(jn[d]){u();const v=sh(d);v.position.set(...b.table),n.add(v),r={kind:d,left:jn[d].sips,prop:v}}else{p();const v=rh(d);v.position.set(...b.dish||b.table),n.add(v),o={kind:d,left:yi[d].bites,prop:v}}a++}function m(d,b){d.left=Math.max(0,d.left-1),on(d.prop,d.left/b)}return{get pending(){return s?{kind:s.kind,phase:s.phase}:null},get drink(){return r?{kind:r.kind,left:r.left,sips:jn[r.kind].sips}:null},get dish(){return o?{kind:o.kind,left:o.left,bites:yi[o.kind].bites}:null},get served(){return a},order(d,b){const v=fo(d),_=e();if(!v||!b||s||!_)return!1;const R=!!yi[d];return s={kind:d,seat:b,phase:R?"cooking":"pouring",timer:R?v.cook:v.pour,path:R?[[ql[v.station][0],ql[v.station][2]]]:null},_.userData.playerService=!0,_.userData.socialPose="Use",_.userData.activity=R?"cooking "+v.en+" for you":"pouring "+v.en.toLowerCase()+" for you",!0},sip(){if(!r||r.left<=0)return null;r.left=Math.max(0,r.left-1);const d=jn[r.kind];r.prop.userData.level,on(r.prop,r.left/d.sips);const b={kind:r.kind,left:r.left,alcohol:d.alcohol/d.sips};if(r.left===0){const v=r;setTimeout(()=>{r===v&&u()},1500)}return b},bite(){if(!o||o.left<=0)return null;m(o,yi[o.kind].bites);const d={kind:o.kind,left:o.left};if(o.left===0){const b=o;setTimeout(()=>{o===b&&p()},2500)}return d},serveNow(d,b){return!fo(d)||!b?.table?!1:(y(d,b),!0)},update(d){if(r&&Ri(r.prop,d),o&&Ri(o.prop,d),!s)return;const b=e();if(!b){s=null;return}const v=fo(s.kind),{seat:_}=s;if(s.phase==="cooking"){if(s.path.length){delete b.userData.socialPose,c(b,s.path,d);return}b.userData.socialPose="Use",(s.timer-=d)<=0&&(s.path=[..._.counter?[]:[g()],..._.route].map(R=>[...R]),s.phase="carrying",b.userData.heldItem="tray",delete b.userData.socialPose,b.userData.carrying=!0,b.userData.activity="bringing your "+v.en.replace(/^(a|an|the) /,""))}else if(s.phase==="pouring")b.userData.socialPose="Use",(s.timer-=d)<=0&&(s.path=_.route.map(R=>[...R]),s.phase="carrying",b.userData.heldItem=s.kind==="oolong"?"tea":"beer",delete b.userData.socialPose,b.userData.carrying=!0,b.userData.activity="bringing your drink");else if(s.phase==="carrying"){delete b.userData.socialPose;const R=jn[s.kind]?_.table:_.dish||_.table;c(b,s.path,d)&&(f(b,R[0],R[2]),s.phase="placing",s.timer=1.1,b.userData.socialPose="CarryIdle")}else s.phase==="placing"?(s.timer-=d)<=0&&(y(s.kind,_),delete b.userData.heldItem,delete b.userData.carrying,b.userData.socialPose="Greet",i("Nao: "+v.line,4),s.phase="bowing",s.timer=.9):s.phase==="bowing"?(s.timer-=d)<=0&&(delete b.userData.socialPose,s.path=[..._.route.slice(0,-1).reverse(),g()].map(R=>[...R]),s.phase="returning",b.userData.activity="back to the counter"):s.phase==="returning"&&(delete b.userData.socialPose,c(b,s.path,d)&&(b.rotation.set(0,Math.PI,0),l(b),s=null))},clear(){const d=e();s&&d&&(d.position.set(...po),d.rotation.set(0,Math.PI,0),l(d)),s=null,u(),p()},place(d,b){y(d,b)}}}const oh="johansson-town-avatar";function T_(n=globalThis.localStorage){try{const e=n?.getItem(oh);if(e){const t=Jo(e);if(t)return t}}catch{}return Po.Johansson}function E_(n,e=globalThis.localStorage){const t=Dc(n);try{e?.setItem(oh,t)}catch{}return t}const A_=.2,R_=["Wake","Sit","Type","Eat","Drink","Sleep","Soak"];function rv(){try{const n=new URL(location.href),e=n.searchParams.get("avatar");if(!e)return null;const t=Jo(e);return n.searchParams.delete("avatar"),history.replaceState(history.state,"",n.href),t&&E_(t),t}catch{return null}}function ov(n,e,{shadows:t=!1}={}){const i=$g(e),s=Ao(i,{shadows:t,faceSize:e==="Thuan"?512:256});for(const r of n.children)r.visible=!1;return n.add(s.root),n.userData.visualReady=!0,n.userData.visualSource="Shimanchu · "+(i.name||e),{isAvatar:!0,avatar:s,animator:Do(s,{lively:!0}),entity:n,model:s.root,mixer:null,actions:new Map,current:null,last:n.position.clone(),gestureTime:0,speed:0,moving:!1,wasVisible:!0,height:s.height,isThuan:e==="Thuan",outfit:"clothes"}}function av(n,e,t=performance.now()){const{entity:i,avatar:s}=n,r=i.userData;let o=!0;for(let _=i;_;_=_.parent)if(!_.visible){o=!1;break}if(!o){n.last.copy(i.position),n.speed=0,n.moving=!1,n.wasVisible=!1;return}const a=Math.hypot(i.position.x-n.last.x,i.position.z-n.last.z);n.last.copy(i.position);const l=!n.wasVisible||a>1;n.wasVisible=!0;const c=l||Number.isFinite(r.chairBlend)?0:a/Math.max(e,.001);n.speed=Ue.damp(n.speed,c,20,e),n.moving=n.speed>(n.moving?.03:.07),n.gestureTime=Math.max(0,n.gestureTime-e);const h=r.outfit==="swim"?"swim":n.isThuan?r.alternativeOutfit||"clothes":r.outfit||"clothes";n.outfit!==h&&(s.wear(h),n.outfit=h);const u=!r.hatOff;n.hatOn!==u&&(s.setHat?.(u),n.hatOn=u);const p=!!(r.playerControlled&&n.isThuan),f=!p&&(Number.isFinite(r.seatHeight)&&R_.includes(r.socialPose)||Number.isFinite(r.chairBlend)&&r.chairBlend>.5),g=r.thuanMood,y=r.lineFeeling,m=g&&g.until>t?g.expression:y&&y.until>t?y.expression:null,d=!!(r.playerConversation||r.chat||n.gestureTime),b=Number(r.sleepBlend)>.28||r.sleeping&&!r.roomTransition;n.animator.update(e,{speed:n.moving?n.speed:0,running:n.speed>3.2,seated:f,seatHeight:r.seatHeight,floorHeight:(Number(r.floorHeight)||0)+(r.socialPose==="CounterIdle"?A_:0),pose:r.socialPose,seat:r.socialPose,riding:p,ridePhase:r.bicyclePhase||0,bicycleFit:r.bicycleFit,carrying:!!r.carrying,heldProp:n.heldProp,waving:!!(r.chat?.greeting||n.gestureTime>0&&!n.waved),talking:!!(r.chat?.speaking||r.speakingUntil>t),expression:r.thuanExpression||m||(d?"smile":"neutral"),sleeping:b,gaze:Array.isArray(r.lookTarget)?r.lookTarget:null,consumeElapsed:r.consumeElapsed,tipsy:r.tipsy||0});const v=r.heldItem||(["Drink","DrinkStanding"].includes(r.socialPose)?"beer":r.socialPose==="Eat"?"rice":null);if(n.heldKind!==v){No(n.heldProp),No(n.dishProp),n.heldProp=null,n.dishProp=null,n.heldKind=v,n.portion=1,n.consumedCycle=-1;const _={beer:"draft",tea:"oolong",cup:"oolong",coffee:"coffee",mugicha:"mugicha",can:"can",bottle:"bottle",draft:"draft",oolong:"oolong",awamori:"awamori",sake:"sake"},R=["rice","bun","ramen","fish","yakitori","gyoza","edamame","sashimi","oden","hiyayakko","dashimaki","agedashi","karaage","ochazuke","chopsticks"];_[v]?n.heldProp=sh(_[v],{held:!0}):R.includes(v)&&(n.heldProp=w_(v),v!=="bun"&&v!=="chopsticks"&&(n.dishProp=rh(v==="fish"?"hokke":v),n.dishProp.userData.food=!0,s.bones.handL.add(n.dishProp))),n.heldProp&&s.bones.handR.add(n.heldProp),n.heldProp&&Number.isFinite(r.heldPortion)&&on(n.heldProp,r.heldPortion,{immediate:!0}),n.dishProp&&Number.isFinite(r.foodPortion)&&on(n.dishProp,r.foodPortion,{immediate:!0})}if(n.heldProp){const _=n.animator.consumption;_&&!Number.isFinite(r.heldPortion)&&_.swallow>.5&&n.consumedCycle!==_.cycle&&(n.consumedCycle=_.cycle,n.portion=Math.max(0,n.portion-(_.food?.25:1/6)),on(n.heldProp,_.food?0:n.portion),n.dishProp&&on(n.dishProp,n.portion)),Number.isFinite(r.heldPortion)?on(n.heldProp,r.heldPortion):_?.food&&_.swallow===0&&n.portion>0&&on(n.heldProp,1),Ri(n.heldProp,e),hr(s,n.heldProp,_?.lift||0),n.dishProp&&(Number.isFinite(r.foodPortion)&&on(n.dishProp,r.foodPortion),Ri(n.dishProp,e),hr(s,n.dishProp,0,"L"))}n.gestureTime>0?n.waved=!0:n.waved=!1}function lv(n,e=new L){const t=n.avatar.bones.head,i=n.avatar.measure;return t.getWorldPosition(e),e.y+=(i.headCentre-i.headY)*.95,e}function cv({scene:n,recipe:e=T_()}={}){const t=new Xt;t.name="Johansson (third person)",t.visible=!1,n.add(t);let i=Ao(e,{shadows:!0,faceSize:512}),s=Do(i);t.add(i.root);let r="neutral",o=0,a=0,l=0,c="Sit",h="clothes",u=null,p=null,f=null;const g=()=>i.bones.handR,y={root:t,loading:Promise.resolve(!0),get ready(){return!0},get move(){return f},get expression(){return r},get weights(){return{}},get actions(){return[...Object.keys(Si),"Idle","Walk","Run","Sit","SitEat","Soak","Fall"]},get avatar(){return i},play(m,{face:d}={}){f=m,d&&y.express(d,3);const b={Bow:"Bow",Wave:"Wave"};s.play(b[m]||m)||s.play("Nod");const v={Wave:"happy",Clap:"happy",Kachashi:"laugh",Laugh:"laugh",Think:"thinking",Shrug:"worried",HeadShake:"grumpy",Bow:"content",Nod:"content",Stretch:"content",LookAround:"surprised",SitToast:"happy",Heart:"happy",Peace:"laugh",Coy:"smile",Tada:"laugh",HandsOnHips:"content",HeelKick:"happy"};v[m]&&y.express(v[m],(Si[m]===1/0?4:Si[m]||2)+.6)},express(m,d=3){r=m,o=d>0?l+d:0},speak(m=2){a=Math.max(a,l+m)},lookAt(m){p=m?m.clone?.()||m:null},seat(m="Sit"){c=m},wear(m){h=m==="swim"?"swim":"clothes",i.wear(h)},get outfit(){return h},get lens(){const m=i.measure;return{eye:m.H+.14,side:m.Rh*m.headSX+.26,head:m.headCentre}},get sitHip(){const m=i.measure;return m.hipY+.09-m.seatDrop},hold(m){u&&(u.userData.consumable?No(u):u.removeFromParent()),u=m||null,u&&(u.position.set(0,-i.measure.hand*.4,i.measure.hand*.6),g().add(u),u.userData.consumable&&hr(i,u))},jump(){s.play("Jump")},stop(){s.stop(),f=null},setRecipe(m){const d=Ot(m);i.root.removeFromParent(),i.dispose(),i=Ao(d,{shadows:!0,faceSize:512}),s=Do(i),t.add(i.root),i.wear(h),u&&g().add(u)},update(m,d={}){if(l+=m,t.visible=!!d.visible,o&&l>o&&(r="neutral",o=0),s.gesture||(f=null),s.update(m,{speed:d.speed||0,running:!!d.running,seated:!!d.seated,seatHeight:d.seated?i.measure.hipY-i.measure.seatDrop:void 0,seat:c,airborne:!!d.airborne,talking:l<a,expression:r,gaze:p,heldProp:u,tipsy:d.tipsy||0}),d.seated&&(i.root.position.y=0),u?.userData.consumable){const b=s.consumption;b&&u.userData.finishPortion!==void 0&&on(u,Ue.lerp(u.userData.startPortion,u.userData.finishPortion,b.swallow)),Ri(u,m),hr(i,u,b?.lift||0)}}};return y}export{Zc as $,Rc as A,Un as B,Ne as C,vy as D,sn as E,Ke as F,Xt as G,gy as H,Ac as I,cy as J,Dn as K,W_ as L,Fo as M,P_ as N,sc as O,cs as P,gt as Q,O_ as R,ly as S,Cc as T,tt as U,L as V,ay as W,ce as X,B_ as Y,Mt as Z,n_ as _,Ft as a,py as a$,e_ as a0,nn as a1,sr as a2,Wo as a3,D_ as a4,Km as a5,Ey as a6,Vy as a7,V0 as a8,sy as a9,Ri as aA,Ct as aB,H_ as aC,Ni as aD,by as aE,z0 as aF,fy as aG,Ci as aH,_y as aI,hl as aJ,My as aK,Gm as aL,G_ as aM,X_ as aN,V_ as aO,z_ as aP,mc as aQ,Mn as aR,jm as aS,ct as aT,js as aU,Ay as aV,hy as aW,pc as aX,uy as aY,Wt as aZ,Ho as a_,ug as aa,i_ as ab,Gy as ac,Vl as ad,qy as ae,Qo as af,L_ as ag,ft as ah,Do as ai,Si as aj,Po as ak,Sy as al,wm as am,iy as an,Ot as ao,pr as ap,yy as aq,_o as ar,uc as as,Wm as at,H0 as au,Ei as av,No as aw,on as ax,sh as ay,rh as az,Ao as b,Ky as b$,fc as b0,Q_ as b1,ey as b2,er as b3,or as b4,rr as b5,_r as b6,Qe as b7,gr as b8,bn as b9,sg as bA,ig as bB,Kn as bC,Ry as bD,Dc as bE,Jo as bF,Oy as bG,Fy as bH,Gg as bI,Uy as bJ,Nn as bK,Xg as bL,Ai as bM,Cy as bN,ky as bO,qn as bP,Py as bQ,ov as bR,av as bS,Hy as bT,Xy as bU,Dy as bV,l_ as bW,Ui as bX,$y as bY,Zy as bZ,Jy as b_,ty as ba,ny as bb,Hg as bc,Wy as bd,By as be,zy as bf,ry as bg,Ly as bh,dy as bi,Bo as bj,yi as bk,jn as bl,iv as bm,Ny as bn,h_ as bo,Wn as bp,Vg as bq,qc as br,tv as bs,Yc as bt,my as bu,J_ as bv,K_ as bw,oy as bx,F_ as by,nh as bz,Qy as c,nv as c0,jy as c1,fo as c2,U_ as c3,lv as c4,R0 as c5,Ve as c6,q_ as c7,rc as c8,$_ as c9,j_ as ca,tc as cb,N_ as cc,C_ as cd,Yy as ce,rv as cf,hc as cg,xy as ch,k_ as ci,Qs as cj,cv as ck,sv as cl,ev as cm,w_ as cn,Iy as co,E_ as cp,Pt as d,He as e,St as f,ht as g,wt as h,xc as i,Ec as j,_t as k,Ze as l,Ks as m,gc as n,I_ as o,T_ as p,Zm as q,$g as r,Ty as s,wy as t,bi as u,vt as v,fr as w,Z_ as x,Y_ as y,Ue as z};
