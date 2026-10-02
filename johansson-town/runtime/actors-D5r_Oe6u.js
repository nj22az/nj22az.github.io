/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const x_=1;const S_=0,w_=1,T_=2;const E_=2;const A_=0;const R_=4;const C_=6;const aa="attached",rh="detached";const P_=303;const L_=1e3,I_=1001,D_=1002,N_=1003,U_=1004,k_=1005,F_=1006,O_=1007,B_=1008,z_=1009;const H_=1014,G_=1015,V_=1016;const W_=1023;const X_=1026;const Y_=2300,q_=2301;const j_=1,K_=2;const J_=3201;const Z_="",Ot="srgb",Pi="srgb-linear",lr="linear",lt="srgb";const $_=35048,la="300 es";class Li{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const i=this._listeners;return i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const s=this._listeners[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const i=this._listeners[e.type];if(i!==void 0){e.target=this;const s=i.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}}const Lt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let ca=1234567;const es=Math.PI/180,wi=180/Math.PI;function jt(){const n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Lt[n&255]+Lt[n>>8&255]+Lt[n>>16&255]+Lt[n>>24&255]+"-"+Lt[e&255]+Lt[e>>8&255]+"-"+Lt[e>>16&15|64]+Lt[e>>24&255]+"-"+Lt[t&63|128]+Lt[t>>8&255]+"-"+Lt[t>>16&255]+Lt[t>>24&255]+Lt[i&255]+Lt[i>>8&255]+Lt[i>>16&255]+Lt[i>>24&255]).toLowerCase()}function Tt(n,e,t){return Math.max(e,Math.min(t,n))}function Do(n,e){return(n%e+e)%e}function oh(n,e,t,i,s){return i+(n-e)*(s-i)/(t-e)}function ah(n,e,t){return n!==e?(t-n)/(e-n):0}function ts(n,e,t){return(1-t)*n+t*e}function lh(n,e,t,i){return ts(n,e,1-Math.exp(-t*i))}function ch(n,e=1){return e-Math.abs(Do(n,e*2)-e)}function hh(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*(3-2*n))}function uh(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*n*(n*(n*6-15)+10))}function dh(n,e){return n+Math.floor(Math.random()*(e-n+1))}function fh(n,e){return n+Math.random()*(e-n)}function ph(n){return n*(.5-Math.random())}function mh(n){n!==void 0&&(ca=n);let e=ca+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function gh(n){return n*es}function _h(n){return n*wi}function yh(n){return(n&n-1)===0&&n!==0}function vh(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function bh(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function Mh(n,e,t,i,s){const r=Math.cos,o=Math.sin,a=r(t/2),l=o(t/2),c=r((e+i)/2),h=o((e+i)/2),u=r((e-i)/2),p=o((e-i)/2),f=r((i-e)/2),g=o((i-e)/2);switch(s){case"XYX":n.set(a*h,l*u,l*p,a*c);break;case"YZY":n.set(l*p,a*h,l*u,a*c);break;case"ZXZ":n.set(l*u,l*p,a*h,a*c);break;case"XZX":n.set(a*h,l*g,l*f,a*c);break;case"YXY":n.set(l*f,a*h,l*g,a*c);break;case"ZYZ":n.set(l*g,l*f,a*h,a*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function en(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function at(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}const Fe={DEG2RAD:es,RAD2DEG:wi,generateUUID:jt,clamp:Tt,euclideanModulo:Do,mapLinear:oh,inverseLerp:ah,lerp:ts,damp:lh,pingpong:ch,smoothstep:hh,smootherstep:uh,randInt:dh,randFloat:fh,randFloatSpread:ph,seededRandom:mh,degToRad:gh,radToDeg:_h,isPowerOfTwo:yh,ceilPowerOfTwo:vh,floorPowerOfTwo:bh,setQuaternionFromProperEuler:Mh,normalize:at,denormalize:en};class ae{constructor(e=0,t=0){ae.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6],this.y=s[1]*t+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(Tt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*i-o*s+e.x,this.y=r*s+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ye{constructor(e,t,i,s,r,o,a,l,c){Ye.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,a,l,c)}set(e,t,i,s,r,o,a,l,c){const h=this.elements;return h[0]=e,h[1]=s,h[2]=a,h[3]=t,h[4]=r,h[5]=l,h[6]=i,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],h=i[4],u=i[7],p=i[2],f=i[5],g=i[8],_=s[0],m=s[3],d=s[6],v=s[1],b=s[4],y=s[7],N=s[2],A=s[5],w=s[8];return r[0]=o*_+a*v+l*N,r[3]=o*m+a*b+l*A,r[6]=o*d+a*y+l*w,r[1]=c*_+h*v+u*N,r[4]=c*m+h*b+u*A,r[7]=c*d+h*y+u*w,r[2]=p*_+f*v+g*N,r[5]=p*m+f*b+g*A,r[8]=p*d+f*y+g*w,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8];return t*o*h-t*a*c-i*r*h+i*a*l+s*r*c-s*o*l}invert(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=h*o-a*c,p=a*l-h*r,f=c*r-o*l,g=t*u+i*p+s*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/g;return e[0]=u*_,e[1]=(s*c-h*i)*_,e[2]=(a*i-s*o)*_,e[3]=p*_,e[4]=(h*t-s*l)*_,e[5]=(s*r-a*t)*_,e[6]=f*_,e[7]=(i*l-c*t)*_,e[8]=(o*t-i*r)*_,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,s,r,o,a){const l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*o+c*a)+o+e,-s*c,s*l,-s*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(Mr.makeScale(e,t)),this}rotate(e){return this.premultiply(Mr.makeRotation(-e)),this}translate(e,t){return this.premultiply(Mr.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let s=0;s<9;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Mr=new Ye;function jl(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function ss(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function xh(){const n=ss("canvas");return n.style.display="block",n}const ha={};function Zi(n){n in ha||(ha[n]=!0,console.warn(n))}function Sh(n,e,t){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}function wh(n){const e=n.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function Th(n){const e=n.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const $e={enabled:!0,workingColorSpace:Pi,spaces:{},convert:function(n,e,t){return this.enabled===!1||e===t||!e||!t||(this.spaces[e].transfer===lt&&(n.r=yn(n.r),n.g=yn(n.g),n.b=yn(n.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(n.applyMatrix3(this.spaces[e].toXYZ),n.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===lt&&(n.r=vi(n.r),n.g=vi(n.g),n.b=vi(n.b))),n},fromWorkingColorSpace:function(n,e){return this.convert(n,this.workingColorSpace,e)},toWorkingColorSpace:function(n,e){return this.convert(n,e,this.workingColorSpace)},getPrimaries:function(n){return this.spaces[n].primaries},getTransfer:function(n){return n===""?lr:this.spaces[n].transfer},getLuminanceCoefficients:function(n,e=this.workingColorSpace){return n.fromArray(this.spaces[e].luminanceCoefficients)},define:function(n){Object.assign(this.spaces,n)},_getMatrix:function(n,e,t){return n.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(n){return this.spaces[n].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(n=this.workingColorSpace){return this.spaces[n].workingColorSpaceConfig.unpackColorSpace}};function yn(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function vi(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}const ua=[.64,.33,.3,.6,.15,.06],da=[.2126,.7152,.0722],fa=[.3127,.329],pa=new Ye().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),ma=new Ye().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);$e.define({[Pi]:{primaries:ua,whitePoint:fa,transfer:lr,toXYZ:pa,fromXYZ:ma,luminanceCoefficients:da,workingColorSpaceConfig:{unpackColorSpace:Ot},outputColorSpaceConfig:{drawingBufferColorSpace:Ot}},[Ot]:{primaries:ua,whitePoint:fa,transfer:lt,toXYZ:pa,fromXYZ:ma,luminanceCoefficients:da,outputColorSpaceConfig:{drawingBufferColorSpace:Ot}}});let Zn;class Eh{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Zn===void 0&&(Zn=ss("canvas")),Zn.width=e.width,Zn.height=e.height;const i=Zn.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),t=Zn}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=ss("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=yn(r[o]/255)*255;return i.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(yn(t[i]/255)*255):t[i]=yn(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Ah=0;class Kl{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Ah++}),this.uuid=jt(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(xr(s[o].image)):r.push(xr(s[o]))}else r=xr(s);i.url=r}return t||(e.images[this.uuid]=i),i}}function xr(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?Eh.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Rh=0;class Ct extends Li{constructor(e=Ct.DEFAULT_IMAGE,t=Ct.DEFAULT_MAPPING,i=1001,s=1001,r=1006,o=1008,a=1023,l=1009,c=Ct.DEFAULT_ANISOTROPY,h=""){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Rh++}),this.uuid=jt(),this.name="",this.source=new Kl(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new ae(0,0),this.repeat=new ae(1,1),this.center=new ae(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ye,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case 1e3:e.x=e.x-Math.floor(e.x);break;case 1001:e.x=e.x<0?0:1;break;case 1002:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case 1e3:e.y=e.y-Math.floor(e.y);break;case 1001:e.y=e.y<0?0:1;break;case 1002:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Ct.DEFAULT_IMAGE=null;Ct.DEFAULT_MAPPING=300;Ct.DEFAULT_ANISOTROPY=1;class tt{constructor(e=0,t=0,i=0,s=1){tt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*i+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*i+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*i+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,s,r;const l=e.elements,c=l[0],h=l[4],u=l[8],p=l[1],f=l[5],g=l[9],_=l[2],m=l[6],d=l[10];if(Math.abs(h-p)<.01&&Math.abs(u-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+p)<.1&&Math.abs(u+_)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+d-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const b=(c+1)/2,y=(f+1)/2,N=(d+1)/2,A=(h+p)/4,w=(u+_)/4,T=(g+m)/4;return b>y&&b>N?b<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(b),s=A/i,r=w/i):y>N?y<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(y),i=A/s,r=T/s):N<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(N),i=w/r,s=T/r),this.set(i,s,r,t),this}let v=Math.sqrt((m-g)*(m-g)+(u-_)*(u-_)+(p-h)*(p-h));return Math.abs(v)<.001&&(v=1),this.x=(m-g)/v,this.y=(u-_)/v,this.z=(p-h)/v,this.w=Math.acos((c+f+d-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Ch extends Li{constructor(e=1,t=1,i={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new tt(0,0,e,t),this.scissorTest=!1,this.viewport=new tt(0,0,e,t);const s={width:e,height:t,depth:1};i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:1006,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},i);const r=new Ct(s,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace);r.flipY=!1,r.generateMipmaps=i.generateMipmaps,r.internalFormat=i.internalFormat,this.textures=[];const o=i.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=i;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let i=0,s=e.textures.length;i<s;i++)this.textures[i]=e.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new Kl(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class jn extends Ch{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class Jl extends Ct{constructor(e=null,t=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class Ph extends Ct{constructor(e=null,t=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class _t{constructor(e=0,t=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=s}static slerpFlat(e,t,i,s,r,o,a){let l=i[s+0],c=i[s+1],h=i[s+2],u=i[s+3];const p=r[o+0],f=r[o+1],g=r[o+2],_=r[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u;return}if(a===1){e[t+0]=p,e[t+1]=f,e[t+2]=g,e[t+3]=_;return}if(u!==_||l!==p||c!==f||h!==g){let m=1-a;const d=l*p+c*f+h*g+u*_,v=d>=0?1:-1,b=1-d*d;if(b>Number.EPSILON){const N=Math.sqrt(b),A=Math.atan2(N,d*v);m=Math.sin(m*A)/N,a=Math.sin(a*A)/N}const y=a*v;if(l=l*m+p*y,c=c*m+f*y,h=h*m+g*y,u=u*m+_*y,m===1-a){const N=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=N,c*=N,h*=N,u*=N}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,i,s,r,o){const a=i[s],l=i[s+1],c=i[s+2],h=i[s+3],u=r[o],p=r[o+1],f=r[o+2],g=r[o+3];return e[t]=a*g+h*u+l*f-c*p,e[t+1]=l*g+h*p+c*u-a*f,e[t+2]=c*g+h*f+a*p-l*u,e[t+3]=h*g-a*u-l*p-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,s){return this._x=e,this._y=t,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(i/2),h=a(s/2),u=a(r/2),p=l(i/2),f=l(s/2),g=l(r/2);switch(o){case"XYZ":this._x=p*h*u+c*f*g,this._y=c*f*u-p*h*g,this._z=c*h*g+p*f*u,this._w=c*h*u-p*f*g;break;case"YXZ":this._x=p*h*u+c*f*g,this._y=c*f*u-p*h*g,this._z=c*h*g-p*f*u,this._w=c*h*u+p*f*g;break;case"ZXY":this._x=p*h*u-c*f*g,this._y=c*f*u+p*h*g,this._z=c*h*g+p*f*u,this._w=c*h*u-p*f*g;break;case"ZYX":this._x=p*h*u-c*f*g,this._y=c*f*u+p*h*g,this._z=c*h*g-p*f*u,this._w=c*h*u+p*f*g;break;case"YZX":this._x=p*h*u+c*f*g,this._y=c*f*u+p*h*g,this._z=c*h*g-p*f*u,this._w=c*h*u-p*f*g;break;case"XZY":this._x=p*h*u-c*f*g,this._y=c*f*u-p*h*g,this._z=c*h*g+p*f*u,this._w=c*h*u+p*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],h=t[6],u=t[10],p=i+a+u;if(p>0){const f=.5/Math.sqrt(p+1);this._w=.25/f,this._x=(h-l)*f,this._y=(r-c)*f,this._z=(o-s)*f}else if(i>a&&i>u){const f=2*Math.sqrt(1+i-a-u);this._w=(h-l)/f,this._x=.25*f,this._y=(s+o)/f,this._z=(r+c)/f}else if(a>u){const f=2*Math.sqrt(1+a-i-u);this._w=(r-c)/f,this._x=(s+o)/f,this._y=.25*f,this._z=(l+h)/f}else{const f=2*Math.sqrt(1+u-i-a);this._w=(o-s)/f,this._x=(r+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Tt(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const s=Math.min(1,t/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,h=t._w;return this._x=i*h+o*a+s*c-r*l,this._y=s*h+o*l+r*a-i*c,this._z=r*h+o*c+i*l-s*a,this._w=o*h-i*a-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const i=this._x,s=this._y,r=this._z,o=this._w;let a=o*e._w+i*e._x+s*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=i,this._y=s,this._z=r,this;const l=1-a*a;if(l<=Number.EPSILON){const f=1-t;return this._w=f*o+t*this._w,this._x=f*i+t*this._x,this._y=f*s+t*this._y,this._z=f*r+t*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,a),u=Math.sin((1-t)*h)/c,p=Math.sin(t*h)/c;return this._w=o*u+this._w*p,this._x=i*u+this._x*p,this._y=s*u+this._y*p,this._z=r*u+this._z*p,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class L{constructor(e=0,t=0,i=0){L.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(ga.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(ga.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*s,this.y=r[1]*t+r[4]*i+r[7]*s,this.z=r[2]*t+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*i+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*i+r[10]*s+r[14])*o,this}applyQuaternion(e){const t=this.x,i=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*s-a*i),h=2*(a*t-r*s),u=2*(r*i-o*t);return this.x=t+l*c+o*u-a*h,this.y=i+l*h+a*c-r*u,this.z=s+l*u+r*h-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*s,this.y=r[1]*t+r[5]*i+r[9]*s,this.z=r[2]*t+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-i*l,this.z=i*a-s*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Sr.copy(this).projectOnVector(e),this.sub(Sr)}reflect(e){return this.sub(Sr.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(Tt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return t*t+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const s=Math.sin(t)*e;return this.x=s*Math.sin(i),this.y=Math.cos(t)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Sr=new L,ga=new _t;class Dn{constructor(e=new L(1/0,1/0,1/0),t=new L(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(Zt.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(Zt.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=Zt.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Zt):Zt.fromBufferAttribute(r,o),Zt.applyMatrix4(e.matrixWorld),this.expandByPoint(Zt);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ds.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),ds.copy(i.boundingBox)),ds.applyMatrix4(e.matrixWorld),this.union(ds)}const s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Zt),Zt.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Bi),fs.subVectors(this.max,Bi),$n.subVectors(e.a,Bi),Qn.subVectors(e.b,Bi),ei.subVectors(e.c,Bi),Sn.subVectors(Qn,$n),wn.subVectors(ei,Qn),Un.subVectors($n,ei);let t=[0,-Sn.z,Sn.y,0,-wn.z,wn.y,0,-Un.z,Un.y,Sn.z,0,-Sn.x,wn.z,0,-wn.x,Un.z,0,-Un.x,-Sn.y,Sn.x,0,-wn.y,wn.x,0,-Un.y,Un.x,0];return!wr(t,$n,Qn,ei,fs)||(t=[1,0,0,0,1,0,0,0,1],!wr(t,$n,Qn,ei,fs))?!1:(ps.crossVectors(Sn,wn),t=[ps.x,ps.y,ps.z],wr(t,$n,Qn,ei,fs))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Zt).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Zt).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(un[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),un[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),un[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),un[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),un[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),un[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),un[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),un[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(un),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const un=[new L,new L,new L,new L,new L,new L,new L,new L],Zt=new L,ds=new Dn,$n=new L,Qn=new L,ei=new L,Sn=new L,wn=new L,Un=new L,Bi=new L,fs=new L,ps=new L,kn=new L;function wr(n,e,t,i,s){for(let r=0,o=n.length-3;r<=o;r+=3){kn.fromArray(n,r);const a=s.x*Math.abs(kn.x)+s.y*Math.abs(kn.y)+s.z*Math.abs(kn.z),l=e.dot(kn),c=t.dot(kn),h=i.dot(kn);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}const Lh=new Dn,zi=new L,Tr=new L;class vn{constructor(e=new L,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):Lh.setFromPoints(e).getCenter(i);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;zi.subVectors(e,this.center);const t=zi.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),s=(i-this.radius)*.5;this.center.addScaledVector(zi,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Tr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(zi.copy(e.center).add(Tr)),this.expandByPoint(zi.copy(e.center).sub(Tr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const dn=new L,Er=new L,ms=new L,Tn=new L,Ar=new L,gs=new L,Rr=new L;class ls{constructor(e=new L,t=new L(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,dn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=dn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(dn.copy(this.origin).addScaledVector(this.direction,t),dn.distanceToSquared(e))}distanceSqToSegment(e,t,i,s){Er.copy(e).add(t).multiplyScalar(.5),ms.copy(t).sub(e).normalize(),Tn.copy(this.origin).sub(Er);const r=e.distanceTo(t)*.5,o=-this.direction.dot(ms),a=Tn.dot(this.direction),l=-Tn.dot(ms),c=Tn.lengthSq(),h=Math.abs(1-o*o);let u,p,f,g;if(h>0)if(u=o*l-a,p=o*a-l,g=r*h,u>=0)if(p>=-g)if(p<=g){const _=1/h;u*=_,p*=_,f=u*(u+o*p+2*a)+p*(o*u+p+2*l)+c}else p=r,u=Math.max(0,-(o*p+a)),f=-u*u+p*(p+2*l)+c;else p=-r,u=Math.max(0,-(o*p+a)),f=-u*u+p*(p+2*l)+c;else p<=-g?(u=Math.max(0,-(-o*r+a)),p=u>0?-r:Math.min(Math.max(-r,-l),r),f=-u*u+p*(p+2*l)+c):p<=g?(u=0,p=Math.min(Math.max(-r,-l),r),f=p*(p+2*l)+c):(u=Math.max(0,-(o*r+a)),p=u>0?r:Math.min(Math.max(-r,-l),r),f=-u*u+p*(p+2*l)+c);else p=o>0?-r:r,u=Math.max(0,-(o*p+a)),f=-u*u+p*(p+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(Er).addScaledVector(ms,p),f}intersectSphere(e,t){dn.subVectors(e.center,this.origin);const i=dn.dot(this.direction),s=dn.dot(dn)-i*i,r=e.radius*e.radius;if(s>r)return null;const o=Math.sqrt(r-s),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,s,r,o,a,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,p=this.origin;return c>=0?(i=(e.min.x-p.x)*c,s=(e.max.x-p.x)*c):(i=(e.max.x-p.x)*c,s=(e.min.x-p.x)*c),h>=0?(r=(e.min.y-p.y)*h,o=(e.max.y-p.y)*h):(r=(e.max.y-p.y)*h,o=(e.min.y-p.y)*h),i>o||r>s||((r>i||isNaN(i))&&(i=r),(o<s||isNaN(s))&&(s=o),u>=0?(a=(e.min.z-p.z)*u,l=(e.max.z-p.z)*u):(a=(e.max.z-p.z)*u,l=(e.min.z-p.z)*u),i>l||a>s)||((a>i||i!==i)&&(i=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,t)}intersectsBox(e){return this.intersectBox(e,dn)!==null}intersectTriangle(e,t,i,s,r){Ar.subVectors(t,e),gs.subVectors(i,e),Rr.crossVectors(Ar,gs);let o=this.direction.dot(Rr),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Tn.subVectors(this.origin,e);const l=a*this.direction.dot(gs.crossVectors(Tn,gs));if(l<0)return null;const c=a*this.direction.dot(Ar.cross(Tn));if(c<0||l+c>o)return null;const h=-a*Tn.dot(Rr);return h<0?null:this.at(h/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Ge{constructor(e,t,i,s,r,o,a,l,c,h,u,p,f,g,_,m){Ge.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,a,l,c,h,u,p,f,g,_,m)}set(e,t,i,s,r,o,a,l,c,h,u,p,f,g,_,m){const d=this.elements;return d[0]=e,d[4]=t,d[8]=i,d[12]=s,d[1]=r,d[5]=o,d[9]=a,d[13]=l,d[2]=c,d[6]=h,d[10]=u,d[14]=p,d[3]=f,d[7]=g,d[11]=_,d[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ge().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,i=e.elements,s=1/ti.setFromMatrixColumn(e,0).length(),r=1/ti.setFromMatrixColumn(e,1).length(),o=1/ti.setFromMatrixColumn(e,2).length();return t[0]=i[0]*s,t[1]=i[1]*s,t[2]=i[2]*s,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,s=e.y,r=e.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){const p=o*h,f=o*u,g=a*h,_=a*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=f+g*c,t[5]=p-_*c,t[9]=-a*l,t[2]=_-p*c,t[6]=g+f*c,t[10]=o*l}else if(e.order==="YXZ"){const p=l*h,f=l*u,g=c*h,_=c*u;t[0]=p+_*a,t[4]=g*a-f,t[8]=o*c,t[1]=o*u,t[5]=o*h,t[9]=-a,t[2]=f*a-g,t[6]=_+p*a,t[10]=o*l}else if(e.order==="ZXY"){const p=l*h,f=l*u,g=c*h,_=c*u;t[0]=p-_*a,t[4]=-o*u,t[8]=g+f*a,t[1]=f+g*a,t[5]=o*h,t[9]=_-p*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){const p=o*h,f=o*u,g=a*h,_=a*u;t[0]=l*h,t[4]=g*c-f,t[8]=p*c+_,t[1]=l*u,t[5]=_*c+p,t[9]=f*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){const p=o*l,f=o*c,g=a*l,_=a*c;t[0]=l*h,t[4]=_-p*u,t[8]=g*u+f,t[1]=u,t[5]=o*h,t[9]=-a*h,t[2]=-c*h,t[6]=f*u+g,t[10]=p-_*u}else if(e.order==="XZY"){const p=o*l,f=o*c,g=a*l,_=a*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=p*u+_,t[5]=o*h,t[9]=f*u-g,t[2]=g*u-f,t[6]=a*h,t[10]=_*u+p}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Ih,e,Dh)}lookAt(e,t,i){const s=this.elements;return Ht.subVectors(e,t),Ht.lengthSq()===0&&(Ht.z=1),Ht.normalize(),En.crossVectors(i,Ht),En.lengthSq()===0&&(Math.abs(i.z)===1?Ht.x+=1e-4:Ht.z+=1e-4,Ht.normalize(),En.crossVectors(i,Ht)),En.normalize(),_s.crossVectors(Ht,En),s[0]=En.x,s[4]=_s.x,s[8]=Ht.x,s[1]=En.y,s[5]=_s.y,s[9]=Ht.y,s[2]=En.z,s[6]=_s.z,s[10]=Ht.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],h=i[1],u=i[5],p=i[9],f=i[13],g=i[2],_=i[6],m=i[10],d=i[14],v=i[3],b=i[7],y=i[11],N=i[15],A=s[0],w=s[4],T=s[8],x=s[12],M=s[1],C=s[5],F=s[9],D=s[13],U=s[2],V=s[6],H=s[10],ee=s[14],K=s[3],R=s[7],X=s[11],xe=s[15];return r[0]=o*A+a*M+l*U+c*K,r[4]=o*w+a*C+l*V+c*R,r[8]=o*T+a*F+l*H+c*X,r[12]=o*x+a*D+l*ee+c*xe,r[1]=h*A+u*M+p*U+f*K,r[5]=h*w+u*C+p*V+f*R,r[9]=h*T+u*F+p*H+f*X,r[13]=h*x+u*D+p*ee+f*xe,r[2]=g*A+_*M+m*U+d*K,r[6]=g*w+_*C+m*V+d*R,r[10]=g*T+_*F+m*H+d*X,r[14]=g*x+_*D+m*ee+d*xe,r[3]=v*A+b*M+y*U+N*K,r[7]=v*w+b*C+y*V+N*R,r[11]=v*T+b*F+y*H+N*X,r[15]=v*x+b*D+y*ee+N*xe,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],h=e[2],u=e[6],p=e[10],f=e[14],g=e[3],_=e[7],m=e[11],d=e[15];return g*(+r*l*u-s*c*u-r*a*p+i*c*p+s*a*f-i*l*f)+_*(+t*l*f-t*c*p+r*o*p-s*o*f+s*c*h-r*l*h)+m*(+t*c*u-t*a*f-r*o*u+i*o*f+r*a*h-i*c*h)+d*(-s*a*h-t*l*u+t*a*p+s*o*u-i*o*p+i*l*h)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=e[9],p=e[10],f=e[11],g=e[12],_=e[13],m=e[14],d=e[15],v=u*m*c-_*p*c+_*l*f-a*m*f-u*l*d+a*p*d,b=g*p*c-h*m*c-g*l*f+o*m*f+h*l*d-o*p*d,y=h*_*c-g*u*c+g*a*f-o*_*f-h*a*d+o*u*d,N=g*u*l-h*_*l-g*a*p+o*_*p+h*a*m-o*u*m,A=t*v+i*b+s*y+r*N;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const w=1/A;return e[0]=v*w,e[1]=(_*p*r-u*m*r-_*s*f+i*m*f+u*s*d-i*p*d)*w,e[2]=(a*m*r-_*l*r+_*s*c-i*m*c-a*s*d+i*l*d)*w,e[3]=(u*l*r-a*p*r-u*s*c+i*p*c+a*s*f-i*l*f)*w,e[4]=b*w,e[5]=(h*m*r-g*p*r+g*s*f-t*m*f-h*s*d+t*p*d)*w,e[6]=(g*l*r-o*m*r-g*s*c+t*m*c+o*s*d-t*l*d)*w,e[7]=(o*p*r-h*l*r+h*s*c-t*p*c-o*s*f+t*l*f)*w,e[8]=y*w,e[9]=(g*u*r-h*_*r-g*i*f+t*_*f+h*i*d-t*u*d)*w,e[10]=(o*_*r-g*a*r+g*i*c-t*_*c-o*i*d+t*a*d)*w,e[11]=(h*a*r-o*u*r-h*i*c+t*u*c+o*i*f-t*a*f)*w,e[12]=N*w,e[13]=(h*_*s-g*u*s+g*i*p-t*_*p-h*i*m+t*u*m)*w,e[14]=(g*a*s-o*_*s-g*i*l+t*_*l+o*i*m-t*a*m)*w,e[15]=(o*u*s-h*a*s+h*i*l-t*u*l-o*i*p+t*a*p)*w,this}scale(e){const t=this.elements,i=e.x,s=e.y,r=e.z;return t[0]*=i,t[4]*=s,t[8]*=r,t[1]*=i,t[5]*=s,t[9]*=r,t[2]*=i,t[6]*=s,t[10]*=r,t[3]*=i,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,s))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),s=Math.sin(t),r=1-i,o=e.x,a=e.y,l=e.z,c=r*o,h=r*a;return this.set(c*o+i,c*a-s*l,c*l+s*a,0,c*a+s*l,h*a+i,h*l-s*o,0,c*l-s*a,h*l+s*o,r*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,s,r,o){return this.set(1,i,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,i){const s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,h=o+o,u=a+a,p=r*c,f=r*h,g=r*u,_=o*h,m=o*u,d=a*u,v=l*c,b=l*h,y=l*u,N=i.x,A=i.y,w=i.z;return s[0]=(1-(_+d))*N,s[1]=(f+y)*N,s[2]=(g-b)*N,s[3]=0,s[4]=(f-y)*A,s[5]=(1-(p+d))*A,s[6]=(m+v)*A,s[7]=0,s[8]=(g+b)*w,s[9]=(m-v)*w,s[10]=(1-(p+_))*w,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,i){const s=this.elements;let r=ti.set(s[0],s[1],s[2]).length();const o=ti.set(s[4],s[5],s[6]).length(),a=ti.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],$t.copy(this);const c=1/r,h=1/o,u=1/a;return $t.elements[0]*=c,$t.elements[1]*=c,$t.elements[2]*=c,$t.elements[4]*=h,$t.elements[5]*=h,$t.elements[6]*=h,$t.elements[8]*=u,$t.elements[9]*=u,$t.elements[10]*=u,t.setFromRotationMatrix($t),i.x=r,i.y=o,i.z=a,this}makePerspective(e,t,i,s,r,o,a=2e3){const l=this.elements,c=2*r/(t-e),h=2*r/(i-s),u=(t+e)/(t-e),p=(i+s)/(i-s);let f,g;if(a===2e3)f=-(o+r)/(o-r),g=-2*o*r/(o-r);else if(a===2001)f=-o/(o-r),g=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=p,l[13]=0,l[2]=0,l[6]=0,l[10]=f,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,s,r,o,a=2e3){const l=this.elements,c=1/(t-e),h=1/(i-s),u=1/(o-r),p=(t+e)*c,f=(i+s)*h;let g,_;if(a===2e3)g=(o+r)*u,_=-2*u;else if(a===2001)g=r*u,_=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-p,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-f,l[2]=0,l[6]=0,l[10]=_,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let s=0;s<16;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}}const ti=new L,$t=new Ge,Ih=new L(0,0,0),Dh=new L(1,1,1),En=new L,_s=new L,Ht=new L,_a=new Ge,ya=new _t;class nn{constructor(e=0,t=0,i=0,s=nn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,s=this._order){return this._x=e,this._y=t,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],h=s[9],u=s[2],p=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(Tt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(p,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Tt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(Tt(p,-1,1)),Math.abs(p)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Tt(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(p,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Tt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-Tt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(p,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return _a.makeRotationFromQuaternion(e),this.setFromRotationMatrix(_a,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return ya.setFromEuler(this),this.setFromQuaternion(ya,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}nn.DEFAULT_ORDER="XYZ";class No{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Nh=0;const va=new L,ni=new _t,fn=new Ge,ys=new L,Hi=new L,Uh=new L,kh=new _t,ba=new L(1,0,0),Ma=new L(0,1,0),xa=new L(0,0,1),Sa={type:"added"},Fh={type:"removed"},ii={type:"childadded",child:null},Cr={type:"childremoved",child:null};class bt extends Li{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Nh++}),this.uuid=jt(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=bt.DEFAULT_UP.clone();const e=new L,t=new nn,i=new _t,s=new L(1,1,1);function r(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Ge},normalMatrix:{value:new Ye}}),this.matrix=new Ge,this.matrixWorld=new Ge,this.matrixAutoUpdate=bt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=bt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new No,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ni.setFromAxisAngle(e,t),this.quaternion.multiply(ni),this}rotateOnWorldAxis(e,t){return ni.setFromAxisAngle(e,t),this.quaternion.premultiply(ni),this}rotateX(e){return this.rotateOnAxis(ba,e)}rotateY(e){return this.rotateOnAxis(Ma,e)}rotateZ(e){return this.rotateOnAxis(xa,e)}translateOnAxis(e,t){return va.copy(e).applyQuaternion(this.quaternion),this.position.add(va.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(ba,e)}translateY(e){return this.translateOnAxis(Ma,e)}translateZ(e){return this.translateOnAxis(xa,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(fn.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?ys.copy(e):ys.set(e,t,i);const s=this.parent;this.updateWorldMatrix(!0,!1),Hi.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?fn.lookAt(Hi,ys,this.up):fn.lookAt(ys,Hi,this.up),this.quaternion.setFromRotationMatrix(fn),s&&(fn.extractRotation(s.matrixWorld),ni.setFromRotationMatrix(fn),this.quaternion.premultiply(ni.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Sa),ii.child=e,this.dispatchEvent(ii),ii.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Fh),Cr.child=e,this.dispatchEvent(Cr),Cr.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),fn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),fn.multiply(e.parent.matrixWorld)),e.applyMatrix4(fn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Sa),ii.child=e,this.dispatchEvent(ii),ii.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,s=this.children.length;i<s;i++){const o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Hi,e,Uh),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Hi,kh,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t){const i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];r(e.shapes,u)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){const a=o(e.geometries),l=o(e.materials),c=o(e.textures),h=o(e.images),u=o(e.shapes),p=o(e.skeletons),f=o(e.animations),g=o(e.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),h.length>0&&(i.images=h),u.length>0&&(i.shapes=u),p.length>0&&(i.skeletons=p),f.length>0&&(i.animations=f),g.length>0&&(i.nodes=g)}return i.object=s,i;function o(a){const l=[];for(const c in a){const h=a[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const s=e.children[i];this.add(s.clone())}return this}}bt.DEFAULT_UP=new L(0,1,0);bt.DEFAULT_MATRIX_AUTO_UPDATE=!0;bt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Qt=new L,pn=new L,Pr=new L,mn=new L,si=new L,ri=new L,wa=new L,Lr=new L,Ir=new L,Dr=new L,Nr=new tt,Ur=new tt,kr=new tt;class qt{constructor(e=new L,t=new L,i=new L){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,s){s.subVectors(i,t),Qt.subVectors(e,t),s.cross(Qt);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,i,s,r){Qt.subVectors(s,t),pn.subVectors(i,t),Pr.subVectors(e,t);const o=Qt.dot(Qt),a=Qt.dot(pn),l=Qt.dot(Pr),c=pn.dot(pn),h=pn.dot(Pr),u=o*c-a*a;if(u===0)return r.set(0,0,0),null;const p=1/u,f=(c*l-a*h)*p,g=(o*h-a*l)*p;return r.set(1-f-g,g,f)}static containsPoint(e,t,i,s){return this.getBarycoord(e,t,i,s,mn)===null?!1:mn.x>=0&&mn.y>=0&&mn.x+mn.y<=1}static getInterpolation(e,t,i,s,r,o,a,l){return this.getBarycoord(e,t,i,s,mn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,mn.x),l.addScaledVector(o,mn.y),l.addScaledVector(a,mn.z),l)}static getInterpolatedAttribute(e,t,i,s,r,o){return Nr.setScalar(0),Ur.setScalar(0),kr.setScalar(0),Nr.fromBufferAttribute(e,t),Ur.fromBufferAttribute(e,i),kr.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(Nr,r.x),o.addScaledVector(Ur,r.y),o.addScaledVector(kr,r.z),o}static isFrontFacing(e,t,i,s){return Qt.subVectors(i,t),pn.subVectors(e,t),Qt.cross(pn).dot(s)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,s){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,i,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Qt.subVectors(this.c,this.b),pn.subVectors(this.a,this.b),Qt.cross(pn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return qt.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return qt.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,s,r){return qt.getInterpolation(e,this.a,this.b,this.c,t,i,s,r)}containsPoint(e){return qt.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return qt.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,s=this.b,r=this.c;let o,a;si.subVectors(s,i),ri.subVectors(r,i),Lr.subVectors(e,i);const l=si.dot(Lr),c=ri.dot(Lr);if(l<=0&&c<=0)return t.copy(i);Ir.subVectors(e,s);const h=si.dot(Ir),u=ri.dot(Ir);if(h>=0&&u<=h)return t.copy(s);const p=l*u-h*c;if(p<=0&&l>=0&&h<=0)return o=l/(l-h),t.copy(i).addScaledVector(si,o);Dr.subVectors(e,r);const f=si.dot(Dr),g=ri.dot(Dr);if(g>=0&&f<=g)return t.copy(r);const _=f*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(i).addScaledVector(ri,a);const m=h*g-f*u;if(m<=0&&u-h>=0&&f-g>=0)return wa.subVectors(r,s),a=(u-h)/(u-h+(f-g)),t.copy(s).addScaledVector(wa,a);const d=1/(m+_+p);return o=_*d,a=p*d,t.copy(i).addScaledVector(si,o).addScaledVector(ri,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Zl={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},An={h:0,s:0,l:0},vs={h:0,s:0,l:0};function Fr(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}class Ne{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Ot){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,$e.toWorkingColorSpace(this,t),this}setRGB(e,t,i,s=$e.workingColorSpace){return this.r=e,this.g=t,this.b=i,$e.toWorkingColorSpace(this,s),this}setHSL(e,t,i,s=$e.workingColorSpace){if(e=Do(e,1),t=Tt(t,0,1),i=Tt(i,0,1),t===0)this.r=this.g=this.b=i;else{const r=i<=.5?i*(1+t):i+t-i*t,o=2*i-r;this.r=Fr(o,r,e+1/3),this.g=Fr(o,r,e),this.b=Fr(o,r,e-1/3)}return $e.toWorkingColorSpace(this,s),this}setStyle(e,t=Ot){function i(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Ot){const i=Zl[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=yn(e.r),this.g=yn(e.g),this.b=yn(e.b),this}copyLinearToSRGB(e){return this.r=vi(e.r),this.g=vi(e.g),this.b=vi(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Ot){return $e.fromWorkingColorSpace(It.copy(this),e),Math.round(Tt(It.r*255,0,255))*65536+Math.round(Tt(It.g*255,0,255))*256+Math.round(Tt(It.b*255,0,255))}getHexString(e=Ot){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=$e.workingColorSpace){$e.fromWorkingColorSpace(It.copy(this),t);const i=It.r,s=It.g,r=It.b,o=Math.max(i,s,r),a=Math.min(i,s,r);let l,c;const h=(a+o)/2;if(a===o)l=0,c=0;else{const u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case i:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-i)/u+2;break;case r:l=(i-s)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=$e.workingColorSpace){return $e.fromWorkingColorSpace(It.copy(this),t),e.r=It.r,e.g=It.g,e.b=It.b,e}getStyle(e=Ot){$e.fromWorkingColorSpace(It.copy(this),e);const t=It.r,i=It.g,s=It.b;return e!==Ot?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(e,t,i){return this.getHSL(An),this.setHSL(An.h+e,An.s+t,An.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(An),e.getHSL(vs);const i=ts(An.h,vs.h,t),s=ts(An.s,vs.s,t),r=ts(An.l,vs.l,t);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*s,this.g=r[1]*t+r[4]*i+r[7]*s,this.b=r[2]*t+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const It=new Ne;Ne.NAMES=Zl;let Oh=0;class bn extends Li{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Oh++}),this.uuid=jt(),this.name="",this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ne(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=7680,this.stencilZFail=7680,this.stencilZPass=7680,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==1&&(i.blending=this.blending),this.side!==0&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==204&&(i.blendSrc=this.blendSrc),this.blendDst!==205&&(i.blendDst=this.blendDst),this.blendEquation!==100&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==3&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==519&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==7680&&(i.stencilFail=this.stencilFail),this.stencilZFail!==7680&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==7680&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){const o=[];for(const a in r){const l=r[a];delete l.metadata,o.push(l)}return o}if(t){const r=s(e.textures),o=s(e.images);r.length>0&&(i.textures=r),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const s=t.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class Uo extends bn{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new Ne(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new nn,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const _n=Bh();function Bh(){const n=new ArrayBuffer(4),e=new Float32Array(n),t=new Uint32Array(n),i=new Uint32Array(512),s=new Uint32Array(512);for(let l=0;l<256;++l){const c=l-127;c<-27?(i[l]=0,i[l|256]=32768,s[l]=24,s[l|256]=24):c<-14?(i[l]=1024>>-c-14,i[l|256]=1024>>-c-14|32768,s[l]=-c-1,s[l|256]=-c-1):c<=15?(i[l]=c+15<<10,i[l|256]=c+15<<10|32768,s[l]=13,s[l|256]=13):c<128?(i[l]=31744,i[l|256]=64512,s[l]=24,s[l|256]=24):(i[l]=31744,i[l|256]=64512,s[l]=13,s[l|256]=13)}const r=new Uint32Array(2048),o=new Uint32Array(64),a=new Uint32Array(64);for(let l=1;l<1024;++l){let c=l<<13,h=0;for(;(c&8388608)===0;)c<<=1,h-=8388608;c&=-8388609,h+=947912704,r[l]=c|h}for(let l=1024;l<2048;++l)r[l]=939524096+(l-1024<<13);for(let l=1;l<31;++l)o[l]=l<<23;o[31]=1199570944,o[32]=2147483648;for(let l=33;l<63;++l)o[l]=2147483648+(l-32<<23);o[63]=3347054592;for(let l=1;l<64;++l)l!==32&&(a[l]=1024);return{floatView:e,uint32View:t,baseTable:i,shiftTable:s,mantissaTable:r,exponentTable:o,offsetTable:a}}function zh(n){Math.abs(n)>65504&&console.warn("THREE.DataUtils.toHalfFloat(): Value out of range."),n=Tt(n,-65504,65504),_n.floatView[0]=n;const e=_n.uint32View[0],t=e>>23&511;return _n.baseTable[t]+((e&8388607)>>_n.shiftTable[t])}function Hh(n){const e=n>>10;return _n.uint32View[0]=_n.mantissaTable[_n.offsetTable[e]+(n&1023)]+_n.exponentTable[e],_n.floatView[0]}const Q_={toHalfFloat:zh,fromHalfFloat:Hh},St=new L,bs=new ae;class Nt{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=35044,this.updateRanges=[],this.gpuType=1015,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)bs.fromBufferAttribute(this,t),bs.applyMatrix3(e),this.setXY(t,bs.x,bs.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)St.fromBufferAttribute(this,t),St.applyMatrix3(e),this.setXYZ(t,St.x,St.y,St.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)St.fromBufferAttribute(this,t),St.applyMatrix4(e),this.setXYZ(t,St.x,St.y,St.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)St.fromBufferAttribute(this,t),St.applyNormalMatrix(e),this.setXYZ(t,St.x,St.y,St.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)St.fromBufferAttribute(this,t),St.transformDirection(e),this.setXYZ(t,St.x,St.y,St.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=en(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=at(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=en(t,this.array)),t}setX(e,t){return this.normalized&&(t=at(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=en(t,this.array)),t}setY(e,t){return this.normalized&&(t=at(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=en(t,this.array)),t}setZ(e,t){return this.normalized&&(t=at(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=en(t,this.array)),t}setW(e,t){return this.normalized&&(t=at(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=at(t,this.array),i=at(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,s){return e*=this.itemSize,this.normalized&&(t=at(t,this.array),i=at(i,this.array),s=at(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e*=this.itemSize,this.normalized&&(t=at(t,this.array),i=at(i,this.array),s=at(s,this.array),r=at(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==35044&&(e.usage=this.usage),e}}class ko extends Nt{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class $l extends Nt{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class qe extends Nt{constructor(e,t,i){super(new Float32Array(e),t,i)}}let Gh=0;const Yt=new Ge,Or=new bt,oi=new L,Gt=new Dn,Gi=new Dn,Rt=new L;class yt extends Li{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Gh++}),this.uuid=jt(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(jl(e)?$l:ko)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const r=new Ye().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Yt.makeRotationFromQuaternion(e),this.applyMatrix4(Yt),this}rotateX(e){return Yt.makeRotationX(e),this.applyMatrix4(Yt),this}rotateY(e){return Yt.makeRotationY(e),this.applyMatrix4(Yt),this}rotateZ(e){return Yt.makeRotationZ(e),this.applyMatrix4(Yt),this}translate(e,t,i){return Yt.makeTranslation(e,t,i),this.applyMatrix4(Yt),this}scale(e,t,i){return Yt.makeScale(e,t,i),this.applyMatrix4(Yt),this}lookAt(e){return Or.lookAt(e),Or.updateMatrix(),this.applyMatrix4(Or.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(oi).negate(),this.translate(oi.x,oi.y,oi.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const i=[];for(let s=0,r=e.length;s<r;s++){const o=e[s];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new qe(i,3))}else{for(let i=0,s=t.count;i<s;i++){const r=e[i];t.setXYZ(i,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Dn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new L(-1/0,-1/0,-1/0),new L(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,s=t.length;i<s;i++){const r=t[i];Gt.setFromBufferAttribute(r),this.morphTargetsRelative?(Rt.addVectors(this.boundingBox.min,Gt.min),this.boundingBox.expandByPoint(Rt),Rt.addVectors(this.boundingBox.max,Gt.max),this.boundingBox.expandByPoint(Rt)):(this.boundingBox.expandByPoint(Gt.min),this.boundingBox.expandByPoint(Gt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new vn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new L,1/0);return}if(e){const i=this.boundingSphere.center;if(Gt.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){const a=t[r];Gi.setFromBufferAttribute(a),this.morphTargetsRelative?(Rt.addVectors(Gt.min,Gi.min),Gt.expandByPoint(Rt),Rt.addVectors(Gt.max,Gi.max),Gt.expandByPoint(Rt)):(Gt.expandByPoint(Gi.min),Gt.expandByPoint(Gi.max))}Gt.getCenter(i);let s=0;for(let r=0,o=e.count;r<o;r++)Rt.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(Rt));if(t)for(let r=0,o=t.length;r<o;r++){const a=t[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)Rt.fromBufferAttribute(a,c),l&&(oi.fromBufferAttribute(e,c),Rt.add(oi)),s=Math.max(s,i.distanceToSquared(Rt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Nt(new Float32Array(4*i.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let T=0;T<i.count;T++)a[T]=new L,l[T]=new L;const c=new L,h=new L,u=new L,p=new ae,f=new ae,g=new ae,_=new L,m=new L;function d(T,x,M){c.fromBufferAttribute(i,T),h.fromBufferAttribute(i,x),u.fromBufferAttribute(i,M),p.fromBufferAttribute(r,T),f.fromBufferAttribute(r,x),g.fromBufferAttribute(r,M),h.sub(c),u.sub(c),f.sub(p),g.sub(p);const C=1/(f.x*g.y-g.x*f.y);isFinite(C)&&(_.copy(h).multiplyScalar(g.y).addScaledVector(u,-f.y).multiplyScalar(C),m.copy(u).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(C),a[T].add(_),a[x].add(_),a[M].add(_),l[T].add(m),l[x].add(m),l[M].add(m))}let v=this.groups;v.length===0&&(v=[{start:0,count:e.count}]);for(let T=0,x=v.length;T<x;++T){const M=v[T],C=M.start,F=M.count;for(let D=C,U=C+F;D<U;D+=3)d(e.getX(D+0),e.getX(D+1),e.getX(D+2))}const b=new L,y=new L,N=new L,A=new L;function w(T){N.fromBufferAttribute(s,T),A.copy(N);const x=a[T];b.copy(x),b.sub(N.multiplyScalar(N.dot(x))).normalize(),y.crossVectors(A,x);const C=y.dot(l[T])<0?-1:1;o.setXYZW(T,b.x,b.y,b.z,C)}for(let T=0,x=v.length;T<x;++T){const M=v[T],C=M.start,F=M.count;for(let D=C,U=C+F;D<U;D+=3)w(e.getX(D+0)),w(e.getX(D+1)),w(e.getX(D+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Nt(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let p=0,f=i.count;p<f;p++)i.setXYZ(p,0,0,0);const s=new L,r=new L,o=new L,a=new L,l=new L,c=new L,h=new L,u=new L;if(e)for(let p=0,f=e.count;p<f;p+=3){const g=e.getX(p+0),_=e.getX(p+1),m=e.getX(p+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,_),o.fromBufferAttribute(t,m),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),a.fromBufferAttribute(i,g),l.fromBufferAttribute(i,_),c.fromBufferAttribute(i,m),a.add(h),l.add(h),c.add(h),i.setXYZ(g,a.x,a.y,a.z),i.setXYZ(_,l.x,l.y,l.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let p=0,f=t.count;p<f;p+=3)s.fromBufferAttribute(t,p+0),r.fromBufferAttribute(t,p+1),o.fromBufferAttribute(t,p+2),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),i.setXYZ(p+0,h.x,h.y,h.z),i.setXYZ(p+1,h.x,h.y,h.z),i.setXYZ(p+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)Rt.fromBufferAttribute(e,t),Rt.normalize(),e.setXYZ(t,Rt.x,Rt.y,Rt.z)}toNonIndexed(){function e(a,l){const c=a.array,h=a.itemSize,u=a.normalized,p=new c.constructor(l.length*h);let f=0,g=0;for(let _=0,m=l.length;_<m;_++){a.isInterleavedBufferAttribute?f=l[_]*a.data.stride+a.offset:f=l[_]*h;for(let d=0;d<h;d++)p[g++]=c[f++]}return new Nt(p,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new yt,i=this.index.array,s=this.attributes;for(const a in s){const l=s[a],c=e(l,i);t.setAttribute(a,c)}const r=this.morphAttributes;for(const a in r){const l=[],c=r[a];for(let h=0,u=c.length;h<u;h++){const p=c[h],f=e(p,i);l.push(f)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const l in i){const c=i[l];e.data.attributes[l]=c.toJSON(e.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,p=c.length;u<p;u++){const f=c[u];h.push(f.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone(t));const s=e.attributes;for(const c in s){const h=s[c];this.setAttribute(c,h.clone(t))}const r=e.morphAttributes;for(const c in r){const h=[],u=r[c];for(let p=0,f=u.length;p<f;p++)h.push(u[p].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let c=0,h=o.length;c<h;c++){const u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Ta=new Ge,Fn=new ls,Ms=new vn,Ea=new L,xs=new L,Ss=new L,ws=new L,Br=new L,Ts=new L,Aa=new L,Es=new L;class ut extends bt{constructor(e=new yt,t=new Uo){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){const i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(s,e);const a=this.morphTargetInfluences;if(r&&a){Ts.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=a[l],u=r[l];h!==0&&(Br.fromBufferAttribute(u,e),o?Ts.addScaledVector(Br,h):Ts.addScaledVector(Br.sub(t),h))}t.add(Ts)}return t}raycast(e,t){const i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Ms.copy(i.boundingSphere),Ms.applyMatrix4(r),Fn.copy(e.ray).recast(e.near),!(Ms.containsPoint(Fn.origin)===!1&&(Fn.intersectSphere(Ms,Ea)===null||Fn.origin.distanceToSquared(Ea)>(e.far-e.near)**2))&&(Ta.copy(r).invert(),Fn.copy(e.ray).applyMatrix4(Ta),!(i.boundingBox!==null&&Fn.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,Fn)))}_computeIntersections(e,t,i){let s;const r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,p=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=p.length;g<_;g++){const m=p[g],d=o[m.materialIndex],v=Math.max(m.start,f.start),b=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let y=v,N=b;y<N;y+=3){const A=a.getX(y),w=a.getX(y+1),T=a.getX(y+2);s=As(this,d,e,i,c,h,u,A,w,T),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,f.start),_=Math.min(a.count,f.start+f.count);for(let m=g,d=_;m<d;m+=3){const v=a.getX(m),b=a.getX(m+1),y=a.getX(m+2);s=As(this,o,e,i,c,h,u,v,b,y),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=p.length;g<_;g++){const m=p[g],d=o[m.materialIndex],v=Math.max(m.start,f.start),b=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let y=v,N=b;y<N;y+=3){const A=y,w=y+1,T=y+2;s=As(this,d,e,i,c,h,u,A,w,T),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,f.start),_=Math.min(l.count,f.start+f.count);for(let m=g,d=_;m<d;m+=3){const v=m,b=m+1,y=m+2;s=As(this,o,e,i,c,h,u,v,b,y),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}}function Vh(n,e,t,i,s,r,o,a){let l;if(e.side===1?l=i.intersectTriangle(o,r,s,!0,a):l=i.intersectTriangle(s,r,o,e.side===0,a),l===null)return null;Es.copy(a),Es.applyMatrix4(n.matrixWorld);const c=t.ray.origin.distanceTo(Es);return c<t.near||c>t.far?null:{distance:c,point:Es.clone(),object:n}}function As(n,e,t,i,s,r,o,a,l,c){n.getVertexPosition(a,xs),n.getVertexPosition(l,Ss),n.getVertexPosition(c,ws);const h=Vh(n,e,t,i,xs,Ss,ws,Aa);if(h){const u=new L;qt.getBarycoord(Aa,xs,Ss,ws,u),s&&(h.uv=qt.getInterpolatedAttribute(s,a,l,c,u,new ae)),r&&(h.uv1=qt.getInterpolatedAttribute(r,a,l,c,u,new ae)),o&&(h.normal=qt.getInterpolatedAttribute(o,a,l,c,u,new L),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));const p={a,b:l,c,normal:new L,materialIndex:0};qt.getNormal(xs,Ss,ws,p.normal),h.face=p,h.barycoord=u}return h}class ht extends yt{constructor(e=1,t=1,i=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:s,heightSegments:r,depthSegments:o};const a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);const l=[],c=[],h=[],u=[];let p=0,f=0;g("z","y","x",-1,-1,i,t,e,o,r,0),g("z","y","x",1,-1,i,t,-e,o,r,1),g("x","z","y",1,1,e,i,t,s,o,2),g("x","z","y",1,-1,e,i,-t,s,o,3),g("x","y","z",1,-1,e,t,i,s,r,4),g("x","y","z",-1,-1,e,t,-i,s,r,5),this.setIndex(l),this.setAttribute("position",new qe(c,3)),this.setAttribute("normal",new qe(h,3)),this.setAttribute("uv",new qe(u,2));function g(_,m,d,v,b,y,N,A,w,T,x){const M=y/w,C=N/T,F=y/2,D=N/2,U=A/2,V=w+1,H=T+1;let ee=0,K=0;const R=new L;for(let X=0;X<H;X++){const xe=X*C-D;for(let Oe=0;Oe<V;Oe++){const Qe=Oe*M-F;R[_]=Qe*v,R[m]=xe*b,R[d]=U,c.push(R.x,R.y,R.z),R[_]=0,R[m]=0,R[d]=A>0?1:-1,h.push(R.x,R.y,R.z),u.push(Oe/w),u.push(1-X/T),ee+=1}}for(let X=0;X<T;X++)for(let xe=0;xe<w;xe++){const Oe=p+xe+V*X,Qe=p+xe+V*(X+1),ne=p+(xe+1)+V*(X+1),ue=p+(xe+1)+V*X;l.push(Oe,Qe,ue),l.push(Qe,ne,ue),K+=6}a.addGroup(f,K,x),f+=K,p+=ee}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ht(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Ti(n){const e={};for(const t in n){e[t]={};for(const i in n[t]){const s=n[t][i];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=s.clone():Array.isArray(s)?e[t][i]=s.slice():e[t][i]=s}}return e}function kt(n){const e={};for(let t=0;t<n.length;t++){const i=Ti(n[t]);for(const s in i)e[s]=i[s]}return e}function Wh(n){const e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function Ql(n){const e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:$e.workingColorSpace}const Xh={clone:Ti,merge:kt};var Yh=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,qh=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Ln extends bn{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Yh,this.fragmentShader=qh,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ti(e.uniforms),this.uniformsGroups=Wh(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}}class ec extends bt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ge,this.projectionMatrix=new Ge,this.projectionMatrixInverse=new Ge,this.coordinateSystem=2e3}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Rn=new L,Ra=new ae,Ca=new ae;class Vt extends ec{constructor(e=50,t=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=wi*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(es*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return wi*2*Math.atan(Math.tan(es*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){Rn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Rn.x,Rn.y).multiplyScalar(-e/Rn.z),Rn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Rn.x,Rn.y).multiplyScalar(-e/Rn.z)}getViewSize(e,t){return this.getViewBounds(e,Ra,Ca),t.subVectors(Ca,Ra)}setViewOffset(e,t,i,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(es*.5*this.fov)/this.zoom,i=2*t,s=this.aspect*i,r=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*i/c,s*=o.width/l,i*=o.height/c}const a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const ai=-90,li=1;class jh extends bt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new Vt(ai,li,e,t);s.layers=this.layers,this.add(s);const r=new Vt(ai,li,e,t);r.layers=this.layers,this.add(r);const o=new Vt(ai,li,e,t);o.layers=this.layers,this.add(o);const a=new Vt(ai,li,e,t);a.layers=this.layers,this.add(a);const l=new Vt(ai,li,e,t);l.layers=this.layers,this.add(l);const c=new Vt(ai,li,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,s,r,o,a,l]=t;for(const c of t)this.remove(c);if(e===2e3)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===2001)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,l,c,h]=this.children,u=e.getRenderTarget(),p=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const _=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,s),e.render(t,r),e.setRenderTarget(i,1,s),e.render(t,o),e.setRenderTarget(i,2,s),e.render(t,a),e.setRenderTarget(i,3,s),e.render(t,l),e.setRenderTarget(i,4,s),e.render(t,c),i.texture.generateMipmaps=_,e.setRenderTarget(i,5,s),e.render(t,h),e.setRenderTarget(u,p,f),e.xr.enabled=g,i.texture.needsPMREMUpdate=!0}}class tc extends Ct{constructor(e,t,i,s,r,o,a,l,c,h){e=e!==void 0?e:[],t=t!==void 0?t:301,super(e,t,i,s,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Kh extends jn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new tc(s,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:1006}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new ht(5,5,5),r=new Ln({name:"CubemapFromEquirect",uniforms:Ti(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:1,blending:0});r.uniforms.tEquirect.value=t;const o=new ut(s,r),a=t.minFilter;return t.minFilter===1008&&(t.minFilter=1006),new jh(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,i,s){const r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,s);e.setRenderTarget(r)}}const zr=new L,Jh=new L,Zh=new Ye;class Gn{constructor(e=new L(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,s){return this.normal.set(e,t,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const s=zr.subVectors(i,t).cross(Jh.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const i=e.delta(zr),s=this.normal.dot(i);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(i,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||Zh.getNormalMatrix(e),s=this.coplanarPoint(zr).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const On=new vn,Rs=new L;class Fo{constructor(e=new Gn,t=new Gn,i=new Gn,s=new Gn,r=new Gn,o=new Gn){this.planes=[e,t,i,s,r,o]}set(e,t,i,s,r,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=2e3){const i=this.planes,s=e.elements,r=s[0],o=s[1],a=s[2],l=s[3],c=s[4],h=s[5],u=s[6],p=s[7],f=s[8],g=s[9],_=s[10],m=s[11],d=s[12],v=s[13],b=s[14],y=s[15];if(i[0].setComponents(l-r,p-c,m-f,y-d).normalize(),i[1].setComponents(l+r,p+c,m+f,y+d).normalize(),i[2].setComponents(l+o,p+h,m+g,y+v).normalize(),i[3].setComponents(l-o,p-h,m-g,y-v).normalize(),i[4].setComponents(l-a,p-u,m-_,y-b).normalize(),t===2e3)i[5].setComponents(l+a,p+u,m+_,y+b).normalize();else if(t===2001)i[5].setComponents(a,u,_,b).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),On.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),On.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(On)}intersectsSprite(e){return On.center.set(0,0,0),On.radius=.7071067811865476,On.applyMatrix4(e.matrixWorld),this.intersectsSphere(On)}intersectsSphere(e){const t=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const s=t[i];if(Rs.x=s.normal.x>0?e.max.x:e.min.x,Rs.y=s.normal.y>0?e.max.y:e.min.y,Rs.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Rs)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function nc(){let n=null,e=!1,t=null,i=null;function s(r,o){t(r,o),i=n.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(s),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){n=r}}}function $h(n){const e=new WeakMap;function t(a,l){const c=a.array,h=a.usage,u=c.byteLength,p=n.createBuffer();n.bindBuffer(l,p),n.bufferData(l,c,h),a.onUploadCallback();let f;if(c instanceof Float32Array)f=n.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=n.HALF_FLOAT:f=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=n.SHORT;else if(c instanceof Uint32Array)f=n.UNSIGNED_INT;else if(c instanceof Int32Array)f=n.INT;else if(c instanceof Int8Array)f=n.BYTE;else if(c instanceof Uint8Array)f=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:p,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function i(a,l,c){const h=l.array,u=l.updateRanges;if(n.bindBuffer(c,a),u.length===0)n.bufferSubData(c,0,h);else{u.sort((f,g)=>f.start-g.start);let p=0;for(let f=1;f<u.length;f++){const g=u[p],_=u[f];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++p,u[p]=_)}u.length=p+1;for(let f=0,g=u.length;f<g;f++){const _=u[f];n.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=e.get(a);l&&(n.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const h=e.get(a);(!h||h.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}class Ei extends yt{constructor(e=1,t=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:s};const r=e/2,o=t/2,a=Math.floor(i),l=Math.floor(s),c=a+1,h=l+1,u=e/a,p=t/l,f=[],g=[],_=[],m=[];for(let d=0;d<h;d++){const v=d*p-o;for(let b=0;b<c;b++){const y=b*u-r;g.push(y,-v,0),_.push(0,0,1),m.push(b/a),m.push(1-d/l)}}for(let d=0;d<l;d++)for(let v=0;v<a;v++){const b=v+c*d,y=v+c*(d+1),N=v+1+c*(d+1),A=v+1+c*d;f.push(b,y,A),f.push(y,N,A)}this.setIndex(f),this.setAttribute("position",new qe(g,3)),this.setAttribute("normal",new qe(_,3)),this.setAttribute("uv",new qe(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ei(e.width,e.height,e.widthSegments,e.heightSegments)}}var Qh=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,eu=`#ifdef USE_ALPHAHASH
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
#endif`,tu=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,nu=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,iu=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,su=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,ru=`#ifdef USE_AOMAP
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
#endif`,ou=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,au=`#ifdef USE_BATCHING
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
#endif`,lu=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,cu=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,hu=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,uu=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,du=`#ifdef USE_IRIDESCENCE
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
#endif`,fu=`#ifdef USE_BUMPMAP
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
#endif`,pu=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,mu=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,gu=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,_u=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,yu=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,vu=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,bu=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Mu=`#if defined( USE_COLOR_ALPHA )
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
#endif`,xu=`#define PI 3.141592653589793
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
} // validated`,Su=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,wu=`vec3 transformedNormal = objectNormal;
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
#endif`,Tu=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Eu=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Au=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Ru=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Cu="gl_FragColor = linearToOutputTexel( gl_FragColor );",Pu=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Lu=`#ifdef USE_ENVMAP
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
#endif`,Iu=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Du=`#ifdef USE_ENVMAP
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
#endif`,Nu=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Uu=`#ifdef USE_ENVMAP
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
#endif`,ku=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Fu=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Ou=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Bu=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,zu=`#ifdef USE_GRADIENTMAP
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
}`,Hu=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Gu=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Vu=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Wu=`uniform bool receiveShadow;
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
#endif`,Xu=`#ifdef USE_ENVMAP
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
#endif`,Yu=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,qu=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,ju=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Ku=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Ju=`PhysicalMaterial material;
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
#endif`,Zu=`struct PhysicalMaterial {
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
}`,$u=`
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
#endif`,Qu=`#if defined( RE_IndirectDiffuse )
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
#endif`,ed=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,td=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,nd=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,id=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,sd=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,rd=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,od=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,ad=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,ld=`#if defined( USE_POINTS_UV )
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
#endif`,cd=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,hd=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,ud=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,dd=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,fd=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,pd=`#ifdef USE_MORPHTARGETS
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
#endif`,md=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,gd=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,_d=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,yd=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,vd=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,bd=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Md=`#ifdef USE_NORMALMAP
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
#endif`,xd=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Sd=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,wd=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Td=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Ed=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Ad=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Rd=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Cd=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Pd=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Ld=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Id=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Dd=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Nd=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Ud=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,kd=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Fd=`float getShadowMask() {
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
}`,Od=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Bd=`#ifdef USE_SKINNING
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
#endif`,zd=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Hd=`#ifdef USE_SKINNING
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
#endif`,Gd=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Vd=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Wd=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Xd=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Yd=`#ifdef USE_TRANSMISSION
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
#endif`,qd=`#ifdef USE_TRANSMISSION
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
#endif`,jd=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Kd=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Jd=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Zd=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const $d=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Qd=`uniform sampler2D t2D;
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
}`,ef=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,tf=`#ifdef ENVMAP_TYPE_CUBE
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
}`,nf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,sf=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,rf=`#include <common>
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
}`,of=`#if DEPTH_PACKING == 3200
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
}`,af=`#define DISTANCE
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
}`,lf=`#define DISTANCE
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
}`,cf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,hf=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,uf=`uniform float scale;
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
}`,df=`uniform vec3 diffuse;
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
}`,ff=`#include <common>
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
}`,pf=`uniform vec3 diffuse;
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
}`,mf=`#define LAMBERT
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
}`,gf=`#define LAMBERT
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
}`,_f=`#define MATCAP
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
}`,yf=`#define MATCAP
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
}`,vf=`#define NORMAL
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
}`,bf=`#define NORMAL
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
}`,Mf=`#define PHONG
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
}`,xf=`#define PHONG
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
}`,Sf=`#define STANDARD
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
}`,wf=`#define STANDARD
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
}`,Tf=`#define TOON
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
}`,Ef=`#define TOON
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
}`,Af=`uniform float size;
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
}`,Rf=`uniform vec3 diffuse;
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
}`,Cf=`#include <common>
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
}`,Pf=`uniform vec3 color;
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
}`,Lf=`uniform float rotation;
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
}`,If=`uniform vec3 diffuse;
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
}`,Ve={alphahash_fragment:Qh,alphahash_pars_fragment:eu,alphamap_fragment:tu,alphamap_pars_fragment:nu,alphatest_fragment:iu,alphatest_pars_fragment:su,aomap_fragment:ru,aomap_pars_fragment:ou,batching_pars_vertex:au,batching_vertex:lu,begin_vertex:cu,beginnormal_vertex:hu,bsdfs:uu,iridescence_fragment:du,bumpmap_pars_fragment:fu,clipping_planes_fragment:pu,clipping_planes_pars_fragment:mu,clipping_planes_pars_vertex:gu,clipping_planes_vertex:_u,color_fragment:yu,color_pars_fragment:vu,color_pars_vertex:bu,color_vertex:Mu,common:xu,cube_uv_reflection_fragment:Su,defaultnormal_vertex:wu,displacementmap_pars_vertex:Tu,displacementmap_vertex:Eu,emissivemap_fragment:Au,emissivemap_pars_fragment:Ru,colorspace_fragment:Cu,colorspace_pars_fragment:Pu,envmap_fragment:Lu,envmap_common_pars_fragment:Iu,envmap_pars_fragment:Du,envmap_pars_vertex:Nu,envmap_physical_pars_fragment:Xu,envmap_vertex:Uu,fog_vertex:ku,fog_pars_vertex:Fu,fog_fragment:Ou,fog_pars_fragment:Bu,gradientmap_pars_fragment:zu,lightmap_pars_fragment:Hu,lights_lambert_fragment:Gu,lights_lambert_pars_fragment:Vu,lights_pars_begin:Wu,lights_toon_fragment:Yu,lights_toon_pars_fragment:qu,lights_phong_fragment:ju,lights_phong_pars_fragment:Ku,lights_physical_fragment:Ju,lights_physical_pars_fragment:Zu,lights_fragment_begin:$u,lights_fragment_maps:Qu,lights_fragment_end:ed,logdepthbuf_fragment:td,logdepthbuf_pars_fragment:nd,logdepthbuf_pars_vertex:id,logdepthbuf_vertex:sd,map_fragment:rd,map_pars_fragment:od,map_particle_fragment:ad,map_particle_pars_fragment:ld,metalnessmap_fragment:cd,metalnessmap_pars_fragment:hd,morphinstance_vertex:ud,morphcolor_vertex:dd,morphnormal_vertex:fd,morphtarget_pars_vertex:pd,morphtarget_vertex:md,normal_fragment_begin:gd,normal_fragment_maps:_d,normal_pars_fragment:yd,normal_pars_vertex:vd,normal_vertex:bd,normalmap_pars_fragment:Md,clearcoat_normal_fragment_begin:xd,clearcoat_normal_fragment_maps:Sd,clearcoat_pars_fragment:wd,iridescence_pars_fragment:Td,opaque_fragment:Ed,packing:Ad,premultiplied_alpha_fragment:Rd,project_vertex:Cd,dithering_fragment:Pd,dithering_pars_fragment:Ld,roughnessmap_fragment:Id,roughnessmap_pars_fragment:Dd,shadowmap_pars_fragment:Nd,shadowmap_pars_vertex:Ud,shadowmap_vertex:kd,shadowmask_pars_fragment:Fd,skinbase_vertex:Od,skinning_pars_vertex:Bd,skinning_vertex:zd,skinnormal_vertex:Hd,specularmap_fragment:Gd,specularmap_pars_fragment:Vd,tonemapping_fragment:Wd,tonemapping_pars_fragment:Xd,transmission_fragment:Yd,transmission_pars_fragment:qd,uv_pars_fragment:jd,uv_pars_vertex:Kd,uv_vertex:Jd,worldpos_vertex:Zd,background_vert:$d,background_frag:Qd,backgroundCube_vert:ef,backgroundCube_frag:tf,cube_vert:nf,cube_frag:sf,depth_vert:rf,depth_frag:of,distanceRGBA_vert:af,distanceRGBA_frag:lf,equirect_vert:cf,equirect_frag:hf,linedashed_vert:uf,linedashed_frag:df,meshbasic_vert:ff,meshbasic_frag:pf,meshlambert_vert:mf,meshlambert_frag:gf,meshmatcap_vert:_f,meshmatcap_frag:yf,meshnormal_vert:vf,meshnormal_frag:bf,meshphong_vert:Mf,meshphong_frag:xf,meshphysical_vert:Sf,meshphysical_frag:wf,meshtoon_vert:Tf,meshtoon_frag:Ef,points_vert:Af,points_frag:Rf,shadow_vert:Cf,shadow_frag:Pf,sprite_vert:Lf,sprite_frag:If},pe={common:{diffuse:{value:new Ne(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ye},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ye}},envmap:{envMap:{value:null},envMapRotation:{value:new Ye},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ye}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ye}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ye},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ye},normalScale:{value:new ae(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ye},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ye}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ye}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ye}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ne(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ne(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0},uvTransform:{value:new Ye}},sprite:{diffuse:{value:new Ne(16777215)},opacity:{value:1},center:{value:new ae(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ye},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0}}},on={basic:{uniforms:kt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.fog]),vertexShader:Ve.meshbasic_vert,fragmentShader:Ve.meshbasic_frag},lambert:{uniforms:kt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new Ne(0)}}]),vertexShader:Ve.meshlambert_vert,fragmentShader:Ve.meshlambert_frag},phong:{uniforms:kt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new Ne(0)},specular:{value:new Ne(1118481)},shininess:{value:30}}]),vertexShader:Ve.meshphong_vert,fragmentShader:Ve.meshphong_frag},standard:{uniforms:kt([pe.common,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.roughnessmap,pe.metalnessmap,pe.fog,pe.lights,{emissive:{value:new Ne(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ve.meshphysical_vert,fragmentShader:Ve.meshphysical_frag},toon:{uniforms:kt([pe.common,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.gradientmap,pe.fog,pe.lights,{emissive:{value:new Ne(0)}}]),vertexShader:Ve.meshtoon_vert,fragmentShader:Ve.meshtoon_frag},matcap:{uniforms:kt([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,{matcap:{value:null}}]),vertexShader:Ve.meshmatcap_vert,fragmentShader:Ve.meshmatcap_frag},points:{uniforms:kt([pe.points,pe.fog]),vertexShader:Ve.points_vert,fragmentShader:Ve.points_frag},dashed:{uniforms:kt([pe.common,pe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ve.linedashed_vert,fragmentShader:Ve.linedashed_frag},depth:{uniforms:kt([pe.common,pe.displacementmap]),vertexShader:Ve.depth_vert,fragmentShader:Ve.depth_frag},normal:{uniforms:kt([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,{opacity:{value:1}}]),vertexShader:Ve.meshnormal_vert,fragmentShader:Ve.meshnormal_frag},sprite:{uniforms:kt([pe.sprite,pe.fog]),vertexShader:Ve.sprite_vert,fragmentShader:Ve.sprite_frag},background:{uniforms:{uvTransform:{value:new Ye},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ve.background_vert,fragmentShader:Ve.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ye}},vertexShader:Ve.backgroundCube_vert,fragmentShader:Ve.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ve.cube_vert,fragmentShader:Ve.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ve.equirect_vert,fragmentShader:Ve.equirect_frag},distanceRGBA:{uniforms:kt([pe.common,pe.displacementmap,{referencePosition:{value:new L},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ve.distanceRGBA_vert,fragmentShader:Ve.distanceRGBA_frag},shadow:{uniforms:kt([pe.lights,pe.fog,{color:{value:new Ne(0)},opacity:{value:1}}]),vertexShader:Ve.shadow_vert,fragmentShader:Ve.shadow_frag}};on.physical={uniforms:kt([on.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ye},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ye},clearcoatNormalScale:{value:new ae(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ye},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ye},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ye},sheen:{value:0},sheenColor:{value:new Ne(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ye},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ye},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ye},transmissionSamplerSize:{value:new ae},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ye},attenuationDistance:{value:0},attenuationColor:{value:new Ne(0)},specularColor:{value:new Ne(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ye},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ye},anisotropyVector:{value:new ae},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ye}}]),vertexShader:Ve.meshphysical_vert,fragmentShader:Ve.meshphysical_frag};const Cs={r:0,b:0,g:0},Bn=new nn,Df=new Ge;function Nf(n,e,t,i,s,r,o){const a=new Ne(0);let l=r===!0?0:1,c,h,u=null,p=0,f=null;function g(v){let b=v.isScene===!0?v.background:null;return b&&b.isTexture&&(b=(v.backgroundBlurriness>0?t:e).get(b)),b}function _(v){let b=!1;const y=g(v);y===null?d(a,l):y&&y.isColor&&(d(y,1),b=!0);const N=n.xr.getEnvironmentBlendMode();N==="additive"?i.buffers.color.setClear(0,0,0,1,o):N==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(n.autoClear||b)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function m(v,b){const y=g(b);y&&(y.isCubeTexture||y.mapping===306)?(h===void 0&&(h=new ut(new ht(1,1,1),new Ln({name:"BackgroundCubeMaterial",uniforms:Ti(on.backgroundCube.uniforms),vertexShader:on.backgroundCube.vertexShader,fragmentShader:on.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(N,A,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),Bn.copy(b.backgroundRotation),Bn.x*=-1,Bn.y*=-1,Bn.z*=-1,y.isCubeTexture&&y.isRenderTargetTexture===!1&&(Bn.y*=-1,Bn.z*=-1),h.material.uniforms.envMap.value=y,h.material.uniforms.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=b.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(Df.makeRotationFromEuler(Bn)),h.material.toneMapped=$e.getTransfer(y.colorSpace)!==lt,(u!==y||p!==y.version||f!==n.toneMapping)&&(h.material.needsUpdate=!0,u=y,p=y.version,f=n.toneMapping),h.layers.enableAll(),v.unshift(h,h.geometry,h.material,0,0,null)):y&&y.isTexture&&(c===void 0&&(c=new ut(new Ei(2,2),new Ln({name:"BackgroundMaterial",uniforms:Ti(on.background.uniforms),vertexShader:on.background.vertexShader,fragmentShader:on.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=y,c.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,c.material.toneMapped=$e.getTransfer(y.colorSpace)!==lt,y.matrixAutoUpdate===!0&&y.updateMatrix(),c.material.uniforms.uvTransform.value.copy(y.matrix),(u!==y||p!==y.version||f!==n.toneMapping)&&(c.material.needsUpdate=!0,u=y,p=y.version,f=n.toneMapping),c.layers.enableAll(),v.unshift(c,c.geometry,c.material,0,0,null))}function d(v,b){v.getRGB(Cs,Ql(n)),i.buffers.color.setClear(Cs.r,Cs.g,Cs.b,b,o)}return{getClearColor:function(){return a},setClearColor:function(v,b=1){a.set(v),l=b,d(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(v){l=v,d(a,l)},render:_,addToRenderList:m}}function Uf(n,e){const t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=p(null);let r=s,o=!1;function a(M,C,F,D,U){let V=!1;const H=u(D,F,C);r!==H&&(r=H,c(r.object)),V=f(M,D,F,U),V&&g(M,D,F,U),U!==null&&e.update(U,n.ELEMENT_ARRAY_BUFFER),(V||o)&&(o=!1,y(M,C,F,D),U!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(U).buffer))}function l(){return n.createVertexArray()}function c(M){return n.bindVertexArray(M)}function h(M){return n.deleteVertexArray(M)}function u(M,C,F){const D=F.wireframe===!0;let U=i[M.id];U===void 0&&(U={},i[M.id]=U);let V=U[C.id];V===void 0&&(V={},U[C.id]=V);let H=V[D];return H===void 0&&(H=p(l()),V[D]=H),H}function p(M){const C=[],F=[],D=[];for(let U=0;U<t;U++)C[U]=0,F[U]=0,D[U]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:C,enabledAttributes:F,attributeDivisors:D,object:M,attributes:{},index:null}}function f(M,C,F,D){const U=r.attributes,V=C.attributes;let H=0;const ee=F.getAttributes();for(const K in ee)if(ee[K].location>=0){const X=U[K];let xe=V[K];if(xe===void 0&&(K==="instanceMatrix"&&M.instanceMatrix&&(xe=M.instanceMatrix),K==="instanceColor"&&M.instanceColor&&(xe=M.instanceColor)),X===void 0||X.attribute!==xe||xe&&X.data!==xe.data)return!0;H++}return r.attributesNum!==H||r.index!==D}function g(M,C,F,D){const U={},V=C.attributes;let H=0;const ee=F.getAttributes();for(const K in ee)if(ee[K].location>=0){let X=V[K];X===void 0&&(K==="instanceMatrix"&&M.instanceMatrix&&(X=M.instanceMatrix),K==="instanceColor"&&M.instanceColor&&(X=M.instanceColor));const xe={};xe.attribute=X,X&&X.data&&(xe.data=X.data),U[K]=xe,H++}r.attributes=U,r.attributesNum=H,r.index=D}function _(){const M=r.newAttributes;for(let C=0,F=M.length;C<F;C++)M[C]=0}function m(M){d(M,0)}function d(M,C){const F=r.newAttributes,D=r.enabledAttributes,U=r.attributeDivisors;F[M]=1,D[M]===0&&(n.enableVertexAttribArray(M),D[M]=1),U[M]!==C&&(n.vertexAttribDivisor(M,C),U[M]=C)}function v(){const M=r.newAttributes,C=r.enabledAttributes;for(let F=0,D=C.length;F<D;F++)C[F]!==M[F]&&(n.disableVertexAttribArray(F),C[F]=0)}function b(M,C,F,D,U,V,H){H===!0?n.vertexAttribIPointer(M,C,F,U,V):n.vertexAttribPointer(M,C,F,D,U,V)}function y(M,C,F,D){_();const U=D.attributes,V=F.getAttributes(),H=C.defaultAttributeValues;for(const ee in V){const K=V[ee];if(K.location>=0){let R=U[ee];if(R===void 0&&(ee==="instanceMatrix"&&M.instanceMatrix&&(R=M.instanceMatrix),ee==="instanceColor"&&M.instanceColor&&(R=M.instanceColor)),R!==void 0){const X=R.normalized,xe=R.itemSize,Oe=e.get(R);if(Oe===void 0)continue;const Qe=Oe.buffer,ne=Oe.type,ue=Oe.bytesPerElement,le=ne===n.INT||ne===n.UNSIGNED_INT||R.gpuType===1013;if(R.isInterleavedBufferAttribute){const W=R.data,ie=W.stride,Le=R.offset;if(W.isInstancedInterleavedBuffer){for(let te=0;te<K.locationSize;te++)d(K.location+te,W.meshPerAttribute);M.isInstancedMesh!==!0&&D._maxInstanceCount===void 0&&(D._maxInstanceCount=W.meshPerAttribute*W.count)}else for(let te=0;te<K.locationSize;te++)m(K.location+te);n.bindBuffer(n.ARRAY_BUFFER,Qe);for(let te=0;te<K.locationSize;te++)b(K.location+te,xe/K.locationSize,ne,X,ie*ue,(Le+xe/K.locationSize*te)*ue,le)}else{if(R.isInstancedBufferAttribute){for(let W=0;W<K.locationSize;W++)d(K.location+W,R.meshPerAttribute);M.isInstancedMesh!==!0&&D._maxInstanceCount===void 0&&(D._maxInstanceCount=R.meshPerAttribute*R.count)}else for(let W=0;W<K.locationSize;W++)m(K.location+W);n.bindBuffer(n.ARRAY_BUFFER,Qe);for(let W=0;W<K.locationSize;W++)b(K.location+W,xe/K.locationSize,ne,X,xe*ue,xe/K.locationSize*W*ue,le)}}else if(H!==void 0){const X=H[ee];if(X!==void 0)switch(X.length){case 2:n.vertexAttrib2fv(K.location,X);break;case 3:n.vertexAttrib3fv(K.location,X);break;case 4:n.vertexAttrib4fv(K.location,X);break;default:n.vertexAttrib1fv(K.location,X)}}}}v()}function N(){T();for(const M in i){const C=i[M];for(const F in C){const D=C[F];for(const U in D)h(D[U].object),delete D[U];delete C[F]}delete i[M]}}function A(M){if(i[M.id]===void 0)return;const C=i[M.id];for(const F in C){const D=C[F];for(const U in D)h(D[U].object),delete D[U];delete C[F]}delete i[M.id]}function w(M){for(const C in i){const F=i[C];if(F[M.id]===void 0)continue;const D=F[M.id];for(const U in D)h(D[U].object),delete D[U];delete F[M.id]}}function T(){x(),o=!0,r!==s&&(r=s,c(r.object))}function x(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:T,resetDefaultState:x,dispose:N,releaseStatesOfGeometry:A,releaseStatesOfProgram:w,initAttributes:_,enableAttribute:m,disableUnusedAttributes:v}}function kf(n,e,t){let i;function s(c){i=c}function r(c,h){n.drawArrays(i,c,h),t.update(h,i,1)}function o(c,h,u){u!==0&&(n.drawArraysInstanced(i,c,h,u),t.update(h,i,u))}function a(c,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,h,0,u);let f=0;for(let g=0;g<u;g++)f+=h[g];t.update(f,i,1)}function l(c,h,u,p){if(u===0)return;const f=e.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<c.length;g++)o(c[g],h[g],p[g]);else{f.multiDrawArraysInstancedWEBGL(i,c,0,h,0,p,0,u);let g=0;for(let _=0;_<u;_++)g+=h[_]*p[_];t.update(g,i,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function Ff(n,e,t,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const w=e.get("EXT_texture_filter_anisotropic");s=n.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(w){return!(w!==1023&&i.convert(w)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(w){const T=w===1016&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(w!==1009&&i.convert(w)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&w!==1015&&!T)}function l(w){if(w==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const u=t.logarithmicDepthBuffer===!0,p=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),f=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),g=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=n.getParameter(n.MAX_TEXTURE_SIZE),m=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),d=n.getParameter(n.MAX_VERTEX_ATTRIBS),v=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),b=n.getParameter(n.MAX_VARYING_VECTORS),y=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),N=g>0,A=n.getParameter(n.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:u,reverseDepthBuffer:p,maxTextures:f,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:m,maxAttributes:d,maxVertexUniforms:v,maxVaryings:b,maxFragmentUniforms:y,vertexTextures:N,maxSamples:A}}function Of(n){const e=this;let t=null,i=0,s=!1,r=!1;const o=new Gn,a=new Ye,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,p){const f=u.length!==0||p||i!==0||s;return s=p,i=u.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,p){t=h(u,p,0)},this.setState=function(u,p,f){const g=u.clippingPlanes,_=u.clipIntersection,m=u.clipShadows,d=n.get(u);if(!s||g===null||g.length===0||r&&!m)r?h(null):c();else{const v=r?0:i,b=v*4;let y=d.clippingState||null;l.value=y,y=h(g,p,b,f);for(let N=0;N!==b;++N)y[N]=t[N];d.clippingState=y,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=v}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function h(u,p,f,g){const _=u!==null?u.length:0;let m=null;if(_!==0){if(m=l.value,g!==!0||m===null){const d=f+_*4,v=p.matrixWorldInverse;a.getNormalMatrix(v),(m===null||m.length<d)&&(m=new Float32Array(d));for(let b=0,y=f;b!==_;++b,y+=4)o.copy(u[b]).applyMatrix4(v,a),o.normal.toArray(m,y),m[y+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,m}}function Bf(n){let e=new WeakMap;function t(o,a){return a===303?o.mapping=301:a===304&&(o.mapping=302),o}function i(o){if(o&&o.isTexture){const a=o.mapping;if(a===303||a===304)if(e.has(o)){const l=e.get(o).texture;return t(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new Kh(l.height);return c.fromEquirectangularTexture(n,o),e.set(o,c),o.addEventListener("dispose",s),t(c.texture,o.mapping)}else return null}}return o}function s(o){const a=o.target;a.removeEventListener("dispose",s);const l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function r(){e=new WeakMap}return{get:i,dispose:r}}class ic extends ec{constructor(e=-1,t=1,i=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=i-e,o=i+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const gi=4,Pa=[.125,.215,.35,.446,.526,.582],Xn=20,Hr=new ic,La=new Ne;let Gr=null,Vr=0,Wr=0,Xr=!1;const Vn=(1+Math.sqrt(5))/2,ci=1/Vn,Ia=[new L(-Vn,ci,0),new L(Vn,ci,0),new L(-ci,0,Vn),new L(ci,0,Vn),new L(0,Vn,-ci),new L(0,Vn,ci),new L(-1,1,-1),new L(1,1,-1),new L(-1,1,1),new L(1,1,1)];class Da{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,s=100){Gr=this._renderer.getRenderTarget(),Vr=this._renderer.getActiveCubeFace(),Wr=this._renderer.getActiveMipmapLevel(),Xr=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(e,i,s,r),t>0&&this._blur(r,0,0,t),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=ka(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Ua(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Gr,Vr,Wr),this._renderer.xr.enabled=Xr,e.scissorTest=!1,Ps(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Gr=this._renderer.getRenderTarget(),Vr=this._renderer.getActiveCubeFace(),Wr=this._renderer.getActiveMipmapLevel(),Xr=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:1006,minFilter:1006,generateMipmaps:!1,type:1016,format:1023,colorSpace:Pi,depthBuffer:!1},s=Na(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Na(e,t,i);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=zf(r)),this._blurMaterial=Hf(r,e,t)}return s}_compileMaterial(e){const t=new ut(this._lodPlanes[0],e);this._renderer.compile(t,Hr)}_sceneToCubeUV(e,t,i,s){const a=new Vt(90,1,t,i),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,p=h.toneMapping;h.getClearColor(La),h.toneMapping=0,h.autoClear=!1;const f=new Uo({name:"PMREM.Background",side:1,depthWrite:!1,depthTest:!1}),g=new ut(new ht,f);let _=!1;const m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,_=!0):(f.color.copy(La),_=!0);for(let d=0;d<6;d++){const v=d%3;v===0?(a.up.set(0,l[d],0),a.lookAt(c[d],0,0)):v===1?(a.up.set(0,0,l[d]),a.lookAt(0,c[d],0)):(a.up.set(0,l[d],0),a.lookAt(0,0,c[d]));const b=this._cubeSize;Ps(s,v*b,d>2?b:0,b,b),h.setRenderTarget(s),_&&h.render(g,a),h.render(e,a)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=p,h.autoClear=u,e.background=m}_textureToCubeUV(e,t){const i=this._renderer,s=e.mapping===301||e.mapping===302;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=ka()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Ua());const r=s?this._cubemapMaterial:this._equirectMaterial,o=new ut(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;const l=this._cubeSize;Ps(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(o,Hr)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const s=this._lodPlanes.length;for(let r=1;r<s;r++){const o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=Ia[(s-r-1)%Ia.length];this._blur(e,r-1,r,o,a)}t.autoClear=i}_blur(e,t,i,s,r){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,i,s,"latitudinal",r),this._halfBlur(o,e,i,i,s,"longitudinal",r)}_halfBlur(e,t,i,s,r,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new ut(this._lodPlanes[s],c),p=c.uniforms,f=this._sizeLods[i]-1,g=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*Xn-1),_=r/g,m=isFinite(r)?1+Math.floor(h*_):Xn;m>Xn&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Xn}`);const d=[];let v=0;for(let w=0;w<Xn;++w){const T=w/_,x=Math.exp(-T*T/2);d.push(x),w===0?v+=x:w<m&&(v+=2*x)}for(let w=0;w<d.length;w++)d[w]=d[w]/v;p.envMap.value=e.texture,p.samples.value=m,p.weights.value=d,p.latitudinal.value=o==="latitudinal",a&&(p.poleAxis.value=a);const{_lodMax:b}=this;p.dTheta.value=g,p.mipInt.value=b-i;const y=this._sizeLods[s],N=3*y*(s>b-gi?s-b+gi:0),A=4*(this._cubeSize-y);Ps(t,N,A,3*y,2*y),l.setRenderTarget(t),l.render(u,Hr)}}function zf(n){const e=[],t=[],i=[];let s=n;const r=n-gi+1+Pa.length;for(let o=0;o<r;o++){const a=Math.pow(2,s);t.push(a);let l=1/a;o>n-gi?l=Pa[o-n+gi-1]:o===0&&(l=0),i.push(l);const c=1/(a-2),h=-c,u=1+c,p=[h,h,u,h,u,u,h,h,u,u,h,u],f=6,g=6,_=3,m=2,d=1,v=new Float32Array(_*g*f),b=new Float32Array(m*g*f),y=new Float32Array(d*g*f);for(let A=0;A<f;A++){const w=A%3*2/3-1,T=A>2?0:-1,x=[w,T,0,w+2/3,T,0,w+2/3,T+1,0,w,T,0,w+2/3,T+1,0,w,T+1,0];v.set(x,_*g*A),b.set(p,m*g*A);const M=[A,A,A,A,A,A];y.set(M,d*g*A)}const N=new yt;N.setAttribute("position",new Nt(v,_)),N.setAttribute("uv",new Nt(b,m)),N.setAttribute("faceIndex",new Nt(y,d)),e.push(N),s>gi&&s--}return{lodPlanes:e,sizeLods:t,sigmas:i}}function Na(n,e,t){const i=new jn(n,e,t);return i.texture.mapping=306,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Ps(n,e,t,i,s){n.viewport.set(e,t,i,s),n.scissor.set(e,t,i,s)}function Hf(n,e,t){const i=new Float32Array(Xn),s=new L(0,1,0);return new Ln({name:"SphericalGaussianBlur",defines:{n:Xn,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Oo(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})}function Ua(){return new Ln({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Oo(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})}function ka(){return new Ln({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Oo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Oo(){return`

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
	`}function Gf(n){let e=new WeakMap,t=null;function i(a){if(a&&a.isTexture){const l=a.mapping,c=l===303||l===304,h=l===301||l===302;if(c||h){let u=e.get(a);const p=u!==void 0?u.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==p)return t===null&&(t=new Da(n)),u=c?t.fromEquirectangular(a,u):t.fromCubemap(a,u),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),u.texture;if(u!==void 0)return u.texture;{const f=a.image;return c&&f&&f.height>0||h&&f&&s(f)?(t===null&&(t=new Da(n)),u=c?t.fromEquirectangular(a):t.fromCubemap(a),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),a.addEventListener("dispose",r),u.texture):null}}}return a}function s(a){let l=0;const c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function r(a){const l=a.target;l.removeEventListener("dispose",r);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:o}}function Vf(n){const e={};function t(i){if(e[i]!==void 0)return e[i];let s;switch(i){case"WEBGL_depth_texture":s=n.getExtension("WEBGL_depth_texture")||n.getExtension("MOZ_WEBGL_depth_texture")||n.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=n.getExtension("EXT_texture_filter_anisotropic")||n.getExtension("MOZ_EXT_texture_filter_anisotropic")||n.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=n.getExtension("WEBGL_compressed_texture_s3tc")||n.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=n.getExtension("WEBGL_compressed_texture_pvrtc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=n.getExtension(i)}return e[i]=s,s}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const s=t(i);return s===null&&Zi("THREE.WebGLRenderer: "+i+" extension not supported."),s}}}function Wf(n,e,t,i){const s={},r=new WeakMap;function o(u){const p=u.target;p.index!==null&&e.remove(p.index);for(const g in p.attributes)e.remove(p.attributes[g]);for(const g in p.morphAttributes){const _=p.morphAttributes[g];for(let m=0,d=_.length;m<d;m++)e.remove(_[m])}p.removeEventListener("dispose",o),delete s[p.id];const f=r.get(p);f&&(e.remove(f),r.delete(p)),i.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,t.memory.geometries--}function a(u,p){return s[p.id]===!0||(p.addEventListener("dispose",o),s[p.id]=!0,t.memory.geometries++),p}function l(u){const p=u.attributes;for(const g in p)e.update(p[g],n.ARRAY_BUFFER);const f=u.morphAttributes;for(const g in f){const _=f[g];for(let m=0,d=_.length;m<d;m++)e.update(_[m],n.ARRAY_BUFFER)}}function c(u){const p=[],f=u.index,g=u.attributes.position;let _=0;if(f!==null){const v=f.array;_=f.version;for(let b=0,y=v.length;b<y;b+=3){const N=v[b+0],A=v[b+1],w=v[b+2];p.push(N,A,A,w,w,N)}}else if(g!==void 0){const v=g.array;_=g.version;for(let b=0,y=v.length/3-1;b<y;b+=3){const N=b+0,A=b+1,w=b+2;p.push(N,A,A,w,w,N)}}else return;const m=new(jl(p)?$l:ko)(p,1);m.version=_;const d=r.get(u);d&&e.remove(d),r.set(u,m)}function h(u){const p=r.get(u);if(p){const f=u.index;f!==null&&p.version<f.version&&c(u)}else c(u);return r.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function Xf(n,e,t){let i;function s(p){i=p}let r,o;function a(p){r=p.type,o=p.bytesPerElement}function l(p,f){n.drawElements(i,f,r,p*o),t.update(f,i,1)}function c(p,f,g){g!==0&&(n.drawElementsInstanced(i,f,r,p*o,g),t.update(f,i,g))}function h(p,f,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,f,0,r,p,0,g);let m=0;for(let d=0;d<g;d++)m+=f[d];t.update(m,i,1)}function u(p,f,g,_){if(g===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let d=0;d<p.length;d++)c(p[d]/o,f[d],_[d]);else{m.multiDrawElementsInstancedWEBGL(i,f,0,r,p,0,_,0,g);let d=0;for(let v=0;v<g;v++)d+=f[v]*_[v];t.update(d,i,1)}}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function Yf(n){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,a){switch(t.calls++,o){case n.TRIANGLES:t.triangles+=a*(r/3);break;case n.LINES:t.lines+=a*(r/2);break;case n.LINE_STRIP:t.lines+=a*(r-1);break;case n.LINE_LOOP:t.lines+=a*r;break;case n.POINTS:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:i}}function qf(n,e,t){const i=new WeakMap,s=new tt;function r(o,a,l){const c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0;let p=i.get(a);if(p===void 0||p.count!==u){let x=function(){w.dispose(),i.delete(a),a.removeEventListener("dispose",x)};p!==void 0&&p.texture.dispose();const f=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,_=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],d=a.morphAttributes.normal||[],v=a.morphAttributes.color||[];let b=0;f===!0&&(b=1),g===!0&&(b=2),_===!0&&(b=3);let y=a.attributes.position.count*b,N=1;y>e.maxTextureSize&&(N=Math.ceil(y/e.maxTextureSize),y=e.maxTextureSize);const A=new Float32Array(y*N*4*u),w=new Jl(A,y,N,u);w.type=1015,w.needsUpdate=!0;const T=b*4;for(let M=0;M<u;M++){const C=m[M],F=d[M],D=v[M],U=y*N*4*M;for(let V=0;V<C.count;V++){const H=V*T;f===!0&&(s.fromBufferAttribute(C,V),A[U+H+0]=s.x,A[U+H+1]=s.y,A[U+H+2]=s.z,A[U+H+3]=0),g===!0&&(s.fromBufferAttribute(F,V),A[U+H+4]=s.x,A[U+H+5]=s.y,A[U+H+6]=s.z,A[U+H+7]=0),_===!0&&(s.fromBufferAttribute(D,V),A[U+H+8]=s.x,A[U+H+9]=s.y,A[U+H+10]=s.z,A[U+H+11]=D.itemSize===4?s.w:1)}}p={count:u,texture:w,size:new ae(y,N)},i.set(a,p),a.addEventListener("dispose",x)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",o.morphTexture,t);else{let f=0;for(let _=0;_<c.length;_++)f+=c[_];const g=a.morphTargetsRelative?1:1-f;l.getUniforms().setValue(n,"morphTargetBaseInfluence",g),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",p.texture,t),l.getUniforms().setValue(n,"morphTargetsTextureSize",p.size)}return{update:r}}function jf(n,e,t,i){let s=new WeakMap;function r(l){const c=i.render.frame,h=l.geometry,u=e.get(l,h);if(s.get(u)!==c&&(e.update(u),s.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(t.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,n.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const p=l.skeleton;s.get(p)!==c&&(p.update(),s.set(p,c))}return u}function o(){s=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:o}}class sc extends Ct{constructor(e,t,i,s,r,o,a,l,c,h=1026){if(h!==1026&&h!==1027)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&h===1026&&(i=1014),i===void 0&&h===1027&&(i=1020),super(null,s,r,o,a,l,h,i,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:1003,this.minFilter=l!==void 0?l:1003,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const rc=new Ct,Fa=new sc(1,1),oc=new Jl,ac=new Ph,lc=new tc,Oa=[],Ba=[],za=new Float32Array(16),Ha=new Float32Array(9),Ga=new Float32Array(4);function Ii(n,e,t){const i=n[0];if(i<=0||i>0)return n;const s=e*t;let r=Oa[s];if(r===void 0&&(r=new Float32Array(s),Oa[s]=r),e!==0){i.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,n[o].toArray(r,a)}return r}function Et(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function At(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function cr(n,e){let t=Ba[e];t===void 0&&(t=new Int32Array(e),Ba[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function Kf(n,e){const t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function Jf(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;n.uniform2fv(this.addr,e),At(t,e)}}function Zf(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Et(t,e))return;n.uniform3fv(this.addr,e),At(t,e)}}function $f(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;n.uniform4fv(this.addr,e),At(t,e)}}function Qf(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Et(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),At(t,e)}else{if(Et(t,i))return;Ga.set(i),n.uniformMatrix2fv(this.addr,!1,Ga),At(t,i)}}function ep(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Et(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),At(t,e)}else{if(Et(t,i))return;Ha.set(i),n.uniformMatrix3fv(this.addr,!1,Ha),At(t,i)}}function tp(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Et(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),At(t,e)}else{if(Et(t,i))return;za.set(i),n.uniformMatrix4fv(this.addr,!1,za),At(t,i)}}function np(n,e){const t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function ip(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;n.uniform2iv(this.addr,e),At(t,e)}}function sp(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Et(t,e))return;n.uniform3iv(this.addr,e),At(t,e)}}function rp(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;n.uniform4iv(this.addr,e),At(t,e)}}function op(n,e){const t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function ap(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;n.uniform2uiv(this.addr,e),At(t,e)}}function lp(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Et(t,e))return;n.uniform3uiv(this.addr,e),At(t,e)}}function cp(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;n.uniform4uiv(this.addr,e),At(t,e)}}function hp(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(Fa.compareFunction=515,r=Fa):r=rc,t.setTexture2D(e||r,s)}function up(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture3D(e||ac,s)}function dp(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTextureCube(e||lc,s)}function fp(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture2DArray(e||oc,s)}function pp(n){switch(n){case 5126:return Kf;case 35664:return Jf;case 35665:return Zf;case 35666:return $f;case 35674:return Qf;case 35675:return ep;case 35676:return tp;case 5124:case 35670:return np;case 35667:case 35671:return ip;case 35668:case 35672:return sp;case 35669:case 35673:return rp;case 5125:return op;case 36294:return ap;case 36295:return lp;case 36296:return cp;case 35678:case 36198:case 36298:case 36306:case 35682:return hp;case 35679:case 36299:case 36307:return up;case 35680:case 36300:case 36308:case 36293:return dp;case 36289:case 36303:case 36311:case 36292:return fp}}function mp(n,e){n.uniform1fv(this.addr,e)}function gp(n,e){const t=Ii(e,this.size,2);n.uniform2fv(this.addr,t)}function _p(n,e){const t=Ii(e,this.size,3);n.uniform3fv(this.addr,t)}function yp(n,e){const t=Ii(e,this.size,4);n.uniform4fv(this.addr,t)}function vp(n,e){const t=Ii(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function bp(n,e){const t=Ii(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function Mp(n,e){const t=Ii(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function xp(n,e){n.uniform1iv(this.addr,e)}function Sp(n,e){n.uniform2iv(this.addr,e)}function wp(n,e){n.uniform3iv(this.addr,e)}function Tp(n,e){n.uniform4iv(this.addr,e)}function Ep(n,e){n.uniform1uiv(this.addr,e)}function Ap(n,e){n.uniform2uiv(this.addr,e)}function Rp(n,e){n.uniform3uiv(this.addr,e)}function Cp(n,e){n.uniform4uiv(this.addr,e)}function Pp(n,e,t){const i=this.cache,s=e.length,r=cr(t,s);Et(i,r)||(n.uniform1iv(this.addr,r),At(i,r));for(let o=0;o!==s;++o)t.setTexture2D(e[o]||rc,r[o])}function Lp(n,e,t){const i=this.cache,s=e.length,r=cr(t,s);Et(i,r)||(n.uniform1iv(this.addr,r),At(i,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||ac,r[o])}function Ip(n,e,t){const i=this.cache,s=e.length,r=cr(t,s);Et(i,r)||(n.uniform1iv(this.addr,r),At(i,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||lc,r[o])}function Dp(n,e,t){const i=this.cache,s=e.length,r=cr(t,s);Et(i,r)||(n.uniform1iv(this.addr,r),At(i,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||oc,r[o])}function Np(n){switch(n){case 5126:return mp;case 35664:return gp;case 35665:return _p;case 35666:return yp;case 35674:return vp;case 35675:return bp;case 35676:return Mp;case 5124:case 35670:return xp;case 35667:case 35671:return Sp;case 35668:case 35672:return wp;case 35669:case 35673:return Tp;case 5125:return Ep;case 36294:return Ap;case 36295:return Rp;case 36296:return Cp;case 35678:case 36198:case 36298:case 36306:case 35682:return Pp;case 35679:case 36299:case 36307:return Lp;case 35680:case 36300:case 36308:case 36293:return Ip;case 36289:case 36303:case 36311:case 36292:return Dp}}class Up{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=pp(t.type)}}class kp{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Np(t.type)}}class Fp{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const s=this.seq;for(let r=0,o=s.length;r!==o;++r){const a=s[r];a.setValue(e,t[a.id],i)}}}const Yr=/(\w+)(\])?(\[|\.)?/g;function Va(n,e){n.seq.push(e),n.map[e.id]=e}function Op(n,e,t){const i=n.name,s=i.length;for(Yr.lastIndex=0;;){const r=Yr.exec(i),o=Yr.lastIndex;let a=r[1];const l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){Va(t,c===void 0?new Up(a,n,e):new kp(a,n,e));break}else{let u=t.map[a];u===void 0&&(u=new Fp(a),Va(t,u)),t=u}}}class Ys{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<i;++s){const r=e.getActiveUniform(t,s),o=e.getUniformLocation(t,r.name);Op(r,o,this)}}setValue(e,t,i,s){const r=this.map[t];r!==void 0&&r.setValue(e,i,s)}setOptional(e,t,i){const s=t[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,t,i,s){for(let r=0,o=t.length;r!==o;++r){const a=t[r],l=i[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){const i=[];for(let s=0,r=e.length;s!==r;++s){const o=e[s];o.id in t&&i.push(o)}return i}}function Wa(n,e,t){const i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}const Bp=37297;let zp=0;function Hp(n,e){const t=n.split(`
`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){const a=o+1;i.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return i.join(`
`)}const Xa=new Ye;function Gp(n){$e._getMatrix(Xa,$e.workingColorSpace,n);const e=`mat3( ${Xa.elements.map(t=>t.toFixed(4))} )`;switch($e.getTransfer(n)){case lr:return[e,"LinearTransferOETF"];case lt:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function Ya(n,e,t){const i=n.getShaderParameter(e,n.COMPILE_STATUS),s=n.getShaderInfoLog(e).trim();if(i&&s==="")return"";const r=/ERROR: 0:(\d+)/.exec(s);if(r){const o=parseInt(r[1]);return t.toUpperCase()+`

`+s+`

`+Hp(n.getShaderSource(e),o)}else return s}function Vp(n,e){const t=Gp(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function Wp(n,e){let t;switch(e){case 1:t="Linear";break;case 2:t="Reinhard";break;case 3:t="Cineon";break;case 4:t="ACESFilmic";break;case 6:t="AgX";break;case 7:t="Neutral";break;case 5:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Ls=new L;function Xp(){$e.getLuminanceCoefficients(Ls);const n=Ls.x.toFixed(4),e=Ls.y.toFixed(4),t=Ls.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Yp(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter($i).join(`
`)}function qp(n){const e=[];for(const t in n){const i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function jp(n,e){const t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){const r=n.getActiveAttrib(e,s),o=r.name;let a=1;r.type===n.FLOAT_MAT2&&(a=2),r.type===n.FLOAT_MAT3&&(a=3),r.type===n.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:n.getAttribLocation(e,o),locationSize:a}}return t}function $i(n){return n!==""}function qa(n,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function ja(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const Kp=/^[ \t]*#include +<([\w\d./]+)>/gm;function fo(n){return n.replace(Kp,Zp)}const Jp=new Map;function Zp(n,e){let t=Ve[e];if(t===void 0){const i=Jp.get(e);if(i!==void 0)t=Ve[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return fo(t)}const $p=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Ka(n){return n.replace($p,Qp)}function Qp(n,e,t,i){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Ja(n){let e=`precision ${n.precision} float;
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
#define LOW_PRECISION`),e}function em(n){let e="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===1?e="SHADOWMAP_TYPE_PCF":n.shadowMapType===2?e="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===3&&(e="SHADOWMAP_TYPE_VSM"),e}function tm(n){let e="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case 301:case 302:e="ENVMAP_TYPE_CUBE";break;case 306:e="ENVMAP_TYPE_CUBE_UV";break}return e}function nm(n){let e="ENVMAP_MODE_REFLECTION";if(n.envMap)switch(n.envMapMode){case 302:e="ENVMAP_MODE_REFRACTION";break}return e}function im(n){let e="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case 0:e="ENVMAP_BLENDING_MULTIPLY";break;case 1:e="ENVMAP_BLENDING_MIX";break;case 2:e="ENVMAP_BLENDING_ADD";break}return e}function sm(n){const e=n.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function rm(n,e,t,i){const s=n.getContext(),r=t.defines;let o=t.vertexShader,a=t.fragmentShader;const l=em(t),c=tm(t),h=nm(t),u=im(t),p=sm(t),f=Yp(t),g=qp(r),_=s.createProgram();let m,d,v=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter($i).join(`
`),m.length>0&&(m+=`
`),d=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter($i).join(`
`),d.length>0&&(d+=`
`)):(m=[Ja(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter($i).join(`
`),d=[Ja(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",p?"#define CUBEUV_TEXEL_WIDTH "+p.texelWidth:"",p?"#define CUBEUV_TEXEL_HEIGHT "+p.texelHeight:"",p?"#define CUBEUV_MAX_MIP "+p.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==0?"#define TONE_MAPPING":"",t.toneMapping!==0?Ve.tonemapping_pars_fragment:"",t.toneMapping!==0?Wp("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ve.colorspace_pars_fragment,Vp("linearToOutputTexel",t.outputColorSpace),Xp(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter($i).join(`
`)),o=fo(o),o=qa(o,t),o=ja(o,t),a=fo(a),a=qa(a,t),a=ja(a,t),o=Ka(o),a=Ka(a),t.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,d=["#define varying in",t.glslVersion===la?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===la?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);const b=v+m+o,y=v+d+a,N=Wa(s,s.VERTEX_SHADER,b),A=Wa(s,s.FRAGMENT_SHADER,y);s.attachShader(_,N),s.attachShader(_,A),t.index0AttributeName!==void 0?s.bindAttribLocation(_,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function w(C){if(n.debug.checkShaderErrors){const F=s.getProgramInfoLog(_).trim(),D=s.getShaderInfoLog(N).trim(),U=s.getShaderInfoLog(A).trim();let V=!0,H=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(V=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,_,N,A);else{const ee=Ya(s,N,"vertex"),K=Ya(s,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+C.name+`
Material Type: `+C.type+`

Program Info Log: `+F+`
`+ee+`
`+K)}else F!==""?console.warn("THREE.WebGLProgram: Program Info Log:",F):(D===""||U==="")&&(H=!1);H&&(C.diagnostics={runnable:V,programLog:F,vertexShader:{log:D,prefix:m},fragmentShader:{log:U,prefix:d}})}s.deleteShader(N),s.deleteShader(A),T=new Ys(s,_),x=jp(s,_)}let T;this.getUniforms=function(){return T===void 0&&w(this),T};let x;this.getAttributes=function(){return x===void 0&&w(this),x};let M=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return M===!1&&(M=s.getProgramParameter(_,Bp)),M},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=zp++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=N,this.fragmentShader=A,this}let om=0;class am{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,i=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(i),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new lm(e),t.set(e,i)),i}}class lm{constructor(e){this.id=om++,this.code=e,this.usedTimes=0}}function cm(n,e,t,i,s,r,o){const a=new No,l=new am,c=new Set,h=[],u=s.logarithmicDepthBuffer,p=s.vertexTextures;let f=s.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(x){return c.add(x),x===0?"uv":`uv${x}`}function m(x,M,C,F,D){const U=F.fog,V=D.geometry,H=x.isMeshStandardMaterial?F.environment:null,ee=(x.isMeshStandardMaterial?t:e).get(x.envMap||H),K=ee&&ee.mapping===306?ee.image.height:null,R=g[x.type];x.precision!==null&&(f=s.getMaxPrecision(x.precision),f!==x.precision&&console.warn("THREE.WebGLProgram.getParameters:",x.precision,"not supported, using",f,"instead."));const X=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,xe=X!==void 0?X.length:0;let Oe=0;V.morphAttributes.position!==void 0&&(Oe=1),V.morphAttributes.normal!==void 0&&(Oe=2),V.morphAttributes.color!==void 0&&(Oe=3);let Qe,ne,ue,le;if(R){const rt=on[R];Qe=rt.vertexShader,ne=rt.fragmentShader}else Qe=x.vertexShader,ne=x.fragmentShader,l.update(x),ue=l.getVertexShaderID(x),le=l.getFragmentShaderID(x);const W=n.getRenderTarget(),ie=n.state.buffers.depth.getReversed(),Le=D.isInstancedMesh===!0,te=D.isBatchedMesh===!0,O=!!x.map,j=!!x.matcap,se=!!ee,I=!!x.aoMap,ce=!!x.lightMap,oe=!!x.bumpMap,_e=!!x.normalMap,fe=!!x.displacementMap,Ue=!!x.emissiveMap,ye=!!x.metalnessMap,P=!!x.roughnessMap,S=x.anisotropy>0,k=x.clearcoat>0,J=x.dispersion>0,Q=x.iridescence>0,Z=x.sheen>0,Ee=x.transmission>0,me=S&&!!x.anisotropyMap,Se=k&&!!x.clearcoatMap,Je=k&&!!x.clearcoatNormalMap,he=k&&!!x.clearcoatRoughnessMap,we=Q&&!!x.iridescenceMap,ke=Q&&!!x.iridescenceThicknessMap,Be=Z&&!!x.sheenColorMap,Te=Z&&!!x.sheenRoughnessMap,Ze=!!x.specularMap,je=!!x.specularColorMap,dt=!!x.specularIntensityMap,B=Ee&&!!x.transmissionMap,ge=Ee&&!!x.thicknessMap,$=!!x.gradientMap,re=!!x.alphaMap,Me=x.alphaTest>0,ve=!!x.alphaHash,We=!!x.extensions;let Mt=0;x.toneMapped&&(W===null||W.isXRRenderTarget===!0)&&(Mt=n.toneMapping);const Pt={shaderID:R,shaderType:x.type,shaderName:x.name,vertexShader:Qe,fragmentShader:ne,defines:x.defines,customVertexShaderID:ue,customFragmentShaderID:le,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:f,batching:te,batchingColor:te&&D._colorsTexture!==null,instancing:Le,instancingColor:Le&&D.instanceColor!==null,instancingMorph:Le&&D.morphTexture!==null,supportsVertexTextures:p,outputColorSpace:W===null?n.outputColorSpace:W.isXRRenderTarget===!0?W.texture.colorSpace:Pi,alphaToCoverage:!!x.alphaToCoverage,map:O,matcap:j,envMap:se,envMapMode:se&&ee.mapping,envMapCubeUVHeight:K,aoMap:I,lightMap:ce,bumpMap:oe,normalMap:_e,displacementMap:p&&fe,emissiveMap:Ue,normalMapObjectSpace:_e&&x.normalMapType===1,normalMapTangentSpace:_e&&x.normalMapType===0,metalnessMap:ye,roughnessMap:P,anisotropy:S,anisotropyMap:me,clearcoat:k,clearcoatMap:Se,clearcoatNormalMap:Je,clearcoatRoughnessMap:he,dispersion:J,iridescence:Q,iridescenceMap:we,iridescenceThicknessMap:ke,sheen:Z,sheenColorMap:Be,sheenRoughnessMap:Te,specularMap:Ze,specularColorMap:je,specularIntensityMap:dt,transmission:Ee,transmissionMap:B,thicknessMap:ge,gradientMap:$,opaque:x.transparent===!1&&x.blending===1&&x.alphaToCoverage===!1,alphaMap:re,alphaTest:Me,alphaHash:ve,combine:x.combine,mapUv:O&&_(x.map.channel),aoMapUv:I&&_(x.aoMap.channel),lightMapUv:ce&&_(x.lightMap.channel),bumpMapUv:oe&&_(x.bumpMap.channel),normalMapUv:_e&&_(x.normalMap.channel),displacementMapUv:fe&&_(x.displacementMap.channel),emissiveMapUv:Ue&&_(x.emissiveMap.channel),metalnessMapUv:ye&&_(x.metalnessMap.channel),roughnessMapUv:P&&_(x.roughnessMap.channel),anisotropyMapUv:me&&_(x.anisotropyMap.channel),clearcoatMapUv:Se&&_(x.clearcoatMap.channel),clearcoatNormalMapUv:Je&&_(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:he&&_(x.clearcoatRoughnessMap.channel),iridescenceMapUv:we&&_(x.iridescenceMap.channel),iridescenceThicknessMapUv:ke&&_(x.iridescenceThicknessMap.channel),sheenColorMapUv:Be&&_(x.sheenColorMap.channel),sheenRoughnessMapUv:Te&&_(x.sheenRoughnessMap.channel),specularMapUv:Ze&&_(x.specularMap.channel),specularColorMapUv:je&&_(x.specularColorMap.channel),specularIntensityMapUv:dt&&_(x.specularIntensityMap.channel),transmissionMapUv:B&&_(x.transmissionMap.channel),thicknessMapUv:ge&&_(x.thicknessMap.channel),alphaMapUv:re&&_(x.alphaMap.channel),vertexTangents:!!V.attributes.tangent&&(_e||S),vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,pointsUvs:D.isPoints===!0&&!!V.attributes.uv&&(O||re),fog:!!U,useFog:x.fog===!0,fogExp2:!!U&&U.isFogExp2,flatShading:x.flatShading===!0,sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:ie,skinning:D.isSkinnedMesh===!0,morphTargets:V.morphAttributes.position!==void 0,morphNormals:V.morphAttributes.normal!==void 0,morphColors:V.morphAttributes.color!==void 0,morphTargetsCount:xe,morphTextureStride:Oe,numDirLights:M.directional.length,numPointLights:M.point.length,numSpotLights:M.spot.length,numSpotLightMaps:M.spotLightMap.length,numRectAreaLights:M.rectArea.length,numHemiLights:M.hemi.length,numDirLightShadows:M.directionalShadowMap.length,numPointLightShadows:M.pointShadowMap.length,numSpotLightShadows:M.spotShadowMap.length,numSpotLightShadowsWithMaps:M.numSpotLightShadowsWithMaps,numLightProbes:M.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:x.dithering,shadowMapEnabled:n.shadowMap.enabled&&C.length>0,shadowMapType:n.shadowMap.type,toneMapping:Mt,decodeVideoTexture:O&&x.map.isVideoTexture===!0&&$e.getTransfer(x.map.colorSpace)===lt,decodeVideoTextureEmissive:Ue&&x.emissiveMap.isVideoTexture===!0&&$e.getTransfer(x.emissiveMap.colorSpace)===lt,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===2,flipSided:x.side===1,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:We&&x.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(We&&x.extensions.multiDraw===!0||te)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return Pt.vertexUv1s=c.has(1),Pt.vertexUv2s=c.has(2),Pt.vertexUv3s=c.has(3),c.clear(),Pt}function d(x){const M=[];if(x.shaderID?M.push(x.shaderID):(M.push(x.customVertexShaderID),M.push(x.customFragmentShaderID)),x.defines!==void 0)for(const C in x.defines)M.push(C),M.push(x.defines[C]);return x.isRawShaderMaterial===!1&&(v(M,x),b(M,x),M.push(n.outputColorSpace)),M.push(x.customProgramCacheKey),M.join()}function v(x,M){x.push(M.precision),x.push(M.outputColorSpace),x.push(M.envMapMode),x.push(M.envMapCubeUVHeight),x.push(M.mapUv),x.push(M.alphaMapUv),x.push(M.lightMapUv),x.push(M.aoMapUv),x.push(M.bumpMapUv),x.push(M.normalMapUv),x.push(M.displacementMapUv),x.push(M.emissiveMapUv),x.push(M.metalnessMapUv),x.push(M.roughnessMapUv),x.push(M.anisotropyMapUv),x.push(M.clearcoatMapUv),x.push(M.clearcoatNormalMapUv),x.push(M.clearcoatRoughnessMapUv),x.push(M.iridescenceMapUv),x.push(M.iridescenceThicknessMapUv),x.push(M.sheenColorMapUv),x.push(M.sheenRoughnessMapUv),x.push(M.specularMapUv),x.push(M.specularColorMapUv),x.push(M.specularIntensityMapUv),x.push(M.transmissionMapUv),x.push(M.thicknessMapUv),x.push(M.combine),x.push(M.fogExp2),x.push(M.sizeAttenuation),x.push(M.morphTargetsCount),x.push(M.morphAttributeCount),x.push(M.numDirLights),x.push(M.numPointLights),x.push(M.numSpotLights),x.push(M.numSpotLightMaps),x.push(M.numHemiLights),x.push(M.numRectAreaLights),x.push(M.numDirLightShadows),x.push(M.numPointLightShadows),x.push(M.numSpotLightShadows),x.push(M.numSpotLightShadowsWithMaps),x.push(M.numLightProbes),x.push(M.shadowMapType),x.push(M.toneMapping),x.push(M.numClippingPlanes),x.push(M.numClipIntersection),x.push(M.depthPacking)}function b(x,M){a.disableAll(),M.supportsVertexTextures&&a.enable(0),M.instancing&&a.enable(1),M.instancingColor&&a.enable(2),M.instancingMorph&&a.enable(3),M.matcap&&a.enable(4),M.envMap&&a.enable(5),M.normalMapObjectSpace&&a.enable(6),M.normalMapTangentSpace&&a.enable(7),M.clearcoat&&a.enable(8),M.iridescence&&a.enable(9),M.alphaTest&&a.enable(10),M.vertexColors&&a.enable(11),M.vertexAlphas&&a.enable(12),M.vertexUv1s&&a.enable(13),M.vertexUv2s&&a.enable(14),M.vertexUv3s&&a.enable(15),M.vertexTangents&&a.enable(16),M.anisotropy&&a.enable(17),M.alphaHash&&a.enable(18),M.batching&&a.enable(19),M.dispersion&&a.enable(20),M.batchingColor&&a.enable(21),x.push(a.mask),a.disableAll(),M.fog&&a.enable(0),M.useFog&&a.enable(1),M.flatShading&&a.enable(2),M.logarithmicDepthBuffer&&a.enable(3),M.reverseDepthBuffer&&a.enable(4),M.skinning&&a.enable(5),M.morphTargets&&a.enable(6),M.morphNormals&&a.enable(7),M.morphColors&&a.enable(8),M.premultipliedAlpha&&a.enable(9),M.shadowMapEnabled&&a.enable(10),M.doubleSided&&a.enable(11),M.flipSided&&a.enable(12),M.useDepthPacking&&a.enable(13),M.dithering&&a.enable(14),M.transmission&&a.enable(15),M.sheen&&a.enable(16),M.opaque&&a.enable(17),M.pointsUvs&&a.enable(18),M.decodeVideoTexture&&a.enable(19),M.decodeVideoTextureEmissive&&a.enable(20),M.alphaToCoverage&&a.enable(21),x.push(a.mask)}function y(x){const M=g[x.type];let C;if(M){const F=on[M];C=Xh.clone(F.uniforms)}else C=x.uniforms;return C}function N(x,M){let C;for(let F=0,D=h.length;F<D;F++){const U=h[F];if(U.cacheKey===M){C=U,++C.usedTimes;break}}return C===void 0&&(C=new rm(n,M,x,r),h.push(C)),C}function A(x){if(--x.usedTimes===0){const M=h.indexOf(x);h[M]=h[h.length-1],h.pop(),x.destroy()}}function w(x){l.remove(x)}function T(){l.dispose()}return{getParameters:m,getProgramCacheKey:d,getUniforms:y,acquireProgram:N,releaseProgram:A,releaseShaderCache:w,programs:h,dispose:T}}function hm(){let n=new WeakMap;function e(o){return n.has(o)}function t(o){let a=n.get(o);return a===void 0&&(a={},n.set(o,a)),a}function i(o){n.delete(o)}function s(o,a,l){n.get(o)[a]=l}function r(){n=new WeakMap}return{has:e,get:t,remove:i,update:s,dispose:r}}function um(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function Za(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function $a(){const n=[];let e=0;const t=[],i=[],s=[];function r(){e=0,t.length=0,i.length=0,s.length=0}function o(u,p,f,g,_,m){let d=n[e];return d===void 0?(d={id:u.id,object:u,geometry:p,material:f,groupOrder:g,renderOrder:u.renderOrder,z:_,group:m},n[e]=d):(d.id=u.id,d.object=u,d.geometry=p,d.material=f,d.groupOrder=g,d.renderOrder=u.renderOrder,d.z=_,d.group=m),e++,d}function a(u,p,f,g,_,m){const d=o(u,p,f,g,_,m);f.transmission>0?i.push(d):f.transparent===!0?s.push(d):t.push(d)}function l(u,p,f,g,_,m){const d=o(u,p,f,g,_,m);f.transmission>0?i.unshift(d):f.transparent===!0?s.unshift(d):t.unshift(d)}function c(u,p){t.length>1&&t.sort(u||um),i.length>1&&i.sort(p||Za),s.length>1&&s.sort(p||Za)}function h(){for(let u=e,p=n.length;u<p;u++){const f=n[u];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:i,transparent:s,init:r,push:a,unshift:l,finish:h,sort:c}}function dm(){let n=new WeakMap;function e(i,s){const r=n.get(i);let o;return r===void 0?(o=new $a,n.set(i,[o])):s>=r.length?(o=new $a,r.push(o)):o=r[s],o}function t(){n=new WeakMap}return{get:e,dispose:t}}function fm(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new L,color:new Ne};break;case"SpotLight":t={position:new L,direction:new L,color:new Ne,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new L,color:new Ne,distance:0,decay:0};break;case"HemisphereLight":t={direction:new L,skyColor:new Ne,groundColor:new Ne};break;case"RectAreaLight":t={color:new Ne,position:new L,halfWidth:new L,halfHeight:new L};break}return n[e.id]=t,t}}}function pm(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ae};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ae};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ae,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}let mm=0;function gm(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function _m(n){const e=new fm,t=pm(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new L);const s=new L,r=new Ge,o=new Ge;function a(c){let h=0,u=0,p=0;for(let x=0;x<9;x++)i.probe[x].set(0,0,0);let f=0,g=0,_=0,m=0,d=0,v=0,b=0,y=0,N=0,A=0,w=0;c.sort(gm);for(let x=0,M=c.length;x<M;x++){const C=c[x],F=C.color,D=C.intensity,U=C.distance,V=C.shadow&&C.shadow.map?C.shadow.map.texture:null;if(C.isAmbientLight)h+=F.r*D,u+=F.g*D,p+=F.b*D;else if(C.isLightProbe){for(let H=0;H<9;H++)i.probe[H].addScaledVector(C.sh.coefficients[H],D);w++}else if(C.isDirectionalLight){const H=e.get(C);if(H.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){const ee=C.shadow,K=t.get(C);K.shadowIntensity=ee.intensity,K.shadowBias=ee.bias,K.shadowNormalBias=ee.normalBias,K.shadowRadius=ee.radius,K.shadowMapSize=ee.mapSize,i.directionalShadow[f]=K,i.directionalShadowMap[f]=V,i.directionalShadowMatrix[f]=C.shadow.matrix,v++}i.directional[f]=H,f++}else if(C.isSpotLight){const H=e.get(C);H.position.setFromMatrixPosition(C.matrixWorld),H.color.copy(F).multiplyScalar(D),H.distance=U,H.coneCos=Math.cos(C.angle),H.penumbraCos=Math.cos(C.angle*(1-C.penumbra)),H.decay=C.decay,i.spot[_]=H;const ee=C.shadow;if(C.map&&(i.spotLightMap[N]=C.map,N++,ee.updateMatrices(C),C.castShadow&&A++),i.spotLightMatrix[_]=ee.matrix,C.castShadow){const K=t.get(C);K.shadowIntensity=ee.intensity,K.shadowBias=ee.bias,K.shadowNormalBias=ee.normalBias,K.shadowRadius=ee.radius,K.shadowMapSize=ee.mapSize,i.spotShadow[_]=K,i.spotShadowMap[_]=V,y++}_++}else if(C.isRectAreaLight){const H=e.get(C);H.color.copy(F).multiplyScalar(D),H.halfWidth.set(C.width*.5,0,0),H.halfHeight.set(0,C.height*.5,0),i.rectArea[m]=H,m++}else if(C.isPointLight){const H=e.get(C);if(H.color.copy(C.color).multiplyScalar(C.intensity),H.distance=C.distance,H.decay=C.decay,C.castShadow){const ee=C.shadow,K=t.get(C);K.shadowIntensity=ee.intensity,K.shadowBias=ee.bias,K.shadowNormalBias=ee.normalBias,K.shadowRadius=ee.radius,K.shadowMapSize=ee.mapSize,K.shadowCameraNear=ee.camera.near,K.shadowCameraFar=ee.camera.far,i.pointShadow[g]=K,i.pointShadowMap[g]=V,i.pointShadowMatrix[g]=C.shadow.matrix,b++}i.point[g]=H,g++}else if(C.isHemisphereLight){const H=e.get(C);H.skyColor.copy(C.color).multiplyScalar(D),H.groundColor.copy(C.groundColor).multiplyScalar(D),i.hemi[d]=H,d++}}m>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=pe.LTC_FLOAT_1,i.rectAreaLTC2=pe.LTC_FLOAT_2):(i.rectAreaLTC1=pe.LTC_HALF_1,i.rectAreaLTC2=pe.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=u,i.ambient[2]=p;const T=i.hash;(T.directionalLength!==f||T.pointLength!==g||T.spotLength!==_||T.rectAreaLength!==m||T.hemiLength!==d||T.numDirectionalShadows!==v||T.numPointShadows!==b||T.numSpotShadows!==y||T.numSpotMaps!==N||T.numLightProbes!==w)&&(i.directional.length=f,i.spot.length=_,i.rectArea.length=m,i.point.length=g,i.hemi.length=d,i.directionalShadow.length=v,i.directionalShadowMap.length=v,i.pointShadow.length=b,i.pointShadowMap.length=b,i.spotShadow.length=y,i.spotShadowMap.length=y,i.directionalShadowMatrix.length=v,i.pointShadowMatrix.length=b,i.spotLightMatrix.length=y+N-A,i.spotLightMap.length=N,i.numSpotLightShadowsWithMaps=A,i.numLightProbes=w,T.directionalLength=f,T.pointLength=g,T.spotLength=_,T.rectAreaLength=m,T.hemiLength=d,T.numDirectionalShadows=v,T.numPointShadows=b,T.numSpotShadows=y,T.numSpotMaps=N,T.numLightProbes=w,i.version=mm++)}function l(c,h){let u=0,p=0,f=0,g=0,_=0;const m=h.matrixWorldInverse;for(let d=0,v=c.length;d<v;d++){const b=c[d];if(b.isDirectionalLight){const y=i.directional[u];y.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),u++}else if(b.isSpotLight){const y=i.spot[f];y.position.setFromMatrixPosition(b.matrixWorld),y.position.applyMatrix4(m),y.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),f++}else if(b.isRectAreaLight){const y=i.rectArea[g];y.position.setFromMatrixPosition(b.matrixWorld),y.position.applyMatrix4(m),o.identity(),r.copy(b.matrixWorld),r.premultiply(m),o.extractRotation(r),y.halfWidth.set(b.width*.5,0,0),y.halfHeight.set(0,b.height*.5,0),y.halfWidth.applyMatrix4(o),y.halfHeight.applyMatrix4(o),g++}else if(b.isPointLight){const y=i.point[p];y.position.setFromMatrixPosition(b.matrixWorld),y.position.applyMatrix4(m),p++}else if(b.isHemisphereLight){const y=i.hemi[_];y.direction.setFromMatrixPosition(b.matrixWorld),y.direction.transformDirection(m),_++}}}return{setup:a,setupView:l,state:i}}function Qa(n){const e=new _m(n),t=[],i=[];function s(h){c.camera=h,t.length=0,i.length=0}function r(h){t.push(h)}function o(h){i.push(h)}function a(){e.setup(t)}function l(h){e.setupView(t,h)}const c={lightsArray:t,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function ym(n){let e=new WeakMap;function t(s,r=0){const o=e.get(s);let a;return o===void 0?(a=new Qa(n),e.set(s,[a])):r>=o.length?(a=new Qa(n),o.push(a)):a=o[r],a}function i(){e=new WeakMap}return{get:t,dispose:i}}class vm extends bn{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=3200,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class bm extends bn{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const Mm=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,xm=`uniform sampler2D shadow_pass;
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
}`;function Sm(n,e,t){let i=new Fo;const s=new ae,r=new ae,o=new tt,a=new vm({depthPacking:3201}),l=new bm,c={},h=t.maxTextureSize,u={0:1,1:0,2:2},p=new Ln({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ae},radius:{value:4}},vertexShader:Mm,fragmentShader:xm}),f=p.clone();f.defines.HORIZONTAL_PASS=1;const g=new yt;g.setAttribute("position",new Nt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new ut(g,p),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let d=this.type;this.render=function(A,w,T){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||A.length===0)return;const x=n.getRenderTarget(),M=n.getActiveCubeFace(),C=n.getActiveMipmapLevel(),F=n.state;F.setBlending(0),F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);const D=d!==3&&this.type===3,U=d===3&&this.type!==3;for(let V=0,H=A.length;V<H;V++){const ee=A[V],K=ee.shadow;if(K===void 0){console.warn("THREE.WebGLShadowMap:",ee,"has no shadow.");continue}if(K.autoUpdate===!1&&K.needsUpdate===!1)continue;s.copy(K.mapSize);const R=K.getFrameExtents();if(s.multiply(R),r.copy(K.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/R.x),s.x=r.x*R.x,K.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/R.y),s.y=r.y*R.y,K.mapSize.y=r.y)),K.map===null||D===!0||U===!0){const xe=this.type!==3?{minFilter:1003,magFilter:1003}:{};K.map!==null&&K.map.dispose(),K.map=new jn(s.x,s.y,xe),K.map.texture.name=ee.name+".shadowMap",K.camera.updateProjectionMatrix()}n.setRenderTarget(K.map),n.clear();const X=K.getViewportCount();for(let xe=0;xe<X;xe++){const Oe=K.getViewport(xe);o.set(r.x*Oe.x,r.y*Oe.y,r.x*Oe.z,r.y*Oe.w),F.viewport(o),K.updateMatrices(ee,xe),i=K.getFrustum(),y(w,T,K.camera,ee,this.type)}K.isPointLightShadow!==!0&&this.type===3&&v(K,T),K.needsUpdate=!1}d=this.type,m.needsUpdate=!1,n.setRenderTarget(x,M,C)};function v(A,w){const T=e.update(_);p.defines.VSM_SAMPLES!==A.blurSamples&&(p.defines.VSM_SAMPLES=A.blurSamples,f.defines.VSM_SAMPLES=A.blurSamples,p.needsUpdate=!0,f.needsUpdate=!0),A.mapPass===null&&(A.mapPass=new jn(s.x,s.y)),p.uniforms.shadow_pass.value=A.map.texture,p.uniforms.resolution.value=A.mapSize,p.uniforms.radius.value=A.radius,n.setRenderTarget(A.mapPass),n.clear(),n.renderBufferDirect(w,null,T,p,_,null),f.uniforms.shadow_pass.value=A.mapPass.texture,f.uniforms.resolution.value=A.mapSize,f.uniforms.radius.value=A.radius,n.setRenderTarget(A.map),n.clear(),n.renderBufferDirect(w,null,T,f,_,null)}function b(A,w,T,x){let M=null;const C=T.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(C!==void 0)M=C;else if(M=T.isPointLight===!0?l:a,n.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0){const F=M.uuid,D=w.uuid;let U=c[F];U===void 0&&(U={},c[F]=U);let V=U[D];V===void 0&&(V=M.clone(),U[D]=V,w.addEventListener("dispose",N)),M=V}if(M.visible=w.visible,M.wireframe=w.wireframe,x===3?M.side=w.shadowSide!==null?w.shadowSide:w.side:M.side=w.shadowSide!==null?w.shadowSide:u[w.side],M.alphaMap=w.alphaMap,M.alphaTest=w.alphaTest,M.map=w.map,M.clipShadows=w.clipShadows,M.clippingPlanes=w.clippingPlanes,M.clipIntersection=w.clipIntersection,M.displacementMap=w.displacementMap,M.displacementScale=w.displacementScale,M.displacementBias=w.displacementBias,M.wireframeLinewidth=w.wireframeLinewidth,M.linewidth=w.linewidth,T.isPointLight===!0&&M.isMeshDistanceMaterial===!0){const F=n.properties.get(M);F.light=T}return M}function y(A,w,T,x,M){if(A.visible===!1)return;if(A.layers.test(w.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&M===3)&&(!A.frustumCulled||i.intersectsObject(A))){A.modelViewMatrix.multiplyMatrices(T.matrixWorldInverse,A.matrixWorld);const D=e.update(A),U=A.material;if(Array.isArray(U)){const V=D.groups;for(let H=0,ee=V.length;H<ee;H++){const K=V[H],R=U[K.materialIndex];if(R&&R.visible){const X=b(A,R,x,M);A.onBeforeShadow(n,A,w,T,D,X,K),n.renderBufferDirect(T,null,D,X,A,K),A.onAfterShadow(n,A,w,T,D,X,K)}}}else if(U.visible){const V=b(A,U,x,M);A.onBeforeShadow(n,A,w,T,D,V,null),n.renderBufferDirect(T,null,D,V,A,null),A.onAfterShadow(n,A,w,T,D,V,null)}}const F=A.children;for(let D=0,U=F.length;D<U;D++)y(F[D],w,T,x,M)}function N(A){A.target.removeEventListener("dispose",N);for(const T in c){const x=c[T],M=A.target.uuid;M in x&&(x[M].dispose(),delete x[M])}}}const wm={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3};function Tm(n,e){function t(){let B=!1;const ge=new tt;let $=null;const re=new tt(0,0,0,0);return{setMask:function(Me){$!==Me&&!B&&(n.colorMask(Me,Me,Me,Me),$=Me)},setLocked:function(Me){B=Me},setClear:function(Me,ve,We,Mt,Pt){Pt===!0&&(Me*=Mt,ve*=Mt,We*=Mt),ge.set(Me,ve,We,Mt),re.equals(ge)===!1&&(n.clearColor(Me,ve,We,Mt),re.copy(ge))},reset:function(){B=!1,$=null,re.set(-1,0,0,0)}}}function i(){let B=!1,ge=!1,$=null,re=null,Me=null;return{setReversed:function(ve){if(ge!==ve){const We=e.get("EXT_clip_control");ge?We.clipControlEXT(We.LOWER_LEFT_EXT,We.ZERO_TO_ONE_EXT):We.clipControlEXT(We.LOWER_LEFT_EXT,We.NEGATIVE_ONE_TO_ONE_EXT);const Mt=Me;Me=null,this.setClear(Mt)}ge=ve},getReversed:function(){return ge},setTest:function(ve){ve?W(n.DEPTH_TEST):ie(n.DEPTH_TEST)},setMask:function(ve){$!==ve&&!B&&(n.depthMask(ve),$=ve)},setFunc:function(ve){if(ge&&(ve=wm[ve]),re!==ve){switch(ve){case 0:n.depthFunc(n.NEVER);break;case 1:n.depthFunc(n.ALWAYS);break;case 2:n.depthFunc(n.LESS);break;case 3:n.depthFunc(n.LEQUAL);break;case 4:n.depthFunc(n.EQUAL);break;case 5:n.depthFunc(n.GEQUAL);break;case 6:n.depthFunc(n.GREATER);break;case 7:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}re=ve}},setLocked:function(ve){B=ve},setClear:function(ve){Me!==ve&&(ge&&(ve=1-ve),n.clearDepth(ve),Me=ve)},reset:function(){B=!1,$=null,re=null,Me=null,ge=!1}}}function s(){let B=!1,ge=null,$=null,re=null,Me=null,ve=null,We=null,Mt=null,Pt=null;return{setTest:function(rt){B||(rt?W(n.STENCIL_TEST):ie(n.STENCIL_TEST))},setMask:function(rt){ge!==rt&&!B&&(n.stencilMask(rt),ge=rt)},setFunc:function(rt,Kt,cn){($!==rt||re!==Kt||Me!==cn)&&(n.stencilFunc(rt,Kt,cn),$=rt,re=Kt,Me=cn)},setOp:function(rt,Kt,cn){(ve!==rt||We!==Kt||Mt!==cn)&&(n.stencilOp(rt,Kt,cn),ve=rt,We=Kt,Mt=cn)},setLocked:function(rt){B=rt},setClear:function(rt){Pt!==rt&&(n.clearStencil(rt),Pt=rt)},reset:function(){B=!1,ge=null,$=null,re=null,Me=null,ve=null,We=null,Mt=null,Pt=null}}}const r=new t,o=new i,a=new s,l=new WeakMap,c=new WeakMap;let h={},u={},p=new WeakMap,f=[],g=null,_=!1,m=null,d=null,v=null,b=null,y=null,N=null,A=null,w=new Ne(0,0,0),T=0,x=!1,M=null,C=null,F=null,D=null,U=null;const V=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let H=!1,ee=0;const K=n.getParameter(n.VERSION);K.indexOf("WebGL")!==-1?(ee=parseFloat(/^WebGL (\d)/.exec(K)[1]),H=ee>=1):K.indexOf("OpenGL ES")!==-1&&(ee=parseFloat(/^OpenGL ES (\d)/.exec(K)[1]),H=ee>=2);let R=null,X={};const xe=n.getParameter(n.SCISSOR_BOX),Oe=n.getParameter(n.VIEWPORT),Qe=new tt().fromArray(xe),ne=new tt().fromArray(Oe);function ue(B,ge,$,re){const Me=new Uint8Array(4),ve=n.createTexture();n.bindTexture(B,ve),n.texParameteri(B,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(B,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let We=0;We<$;We++)B===n.TEXTURE_3D||B===n.TEXTURE_2D_ARRAY?n.texImage3D(ge,0,n.RGBA,1,1,re,0,n.RGBA,n.UNSIGNED_BYTE,Me):n.texImage2D(ge+We,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,Me);return ve}const le={};le[n.TEXTURE_2D]=ue(n.TEXTURE_2D,n.TEXTURE_2D,1),le[n.TEXTURE_CUBE_MAP]=ue(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),le[n.TEXTURE_2D_ARRAY]=ue(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),le[n.TEXTURE_3D]=ue(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),W(n.DEPTH_TEST),o.setFunc(3),oe(!1),_e(1),W(n.CULL_FACE),I(0);function W(B){h[B]!==!0&&(n.enable(B),h[B]=!0)}function ie(B){h[B]!==!1&&(n.disable(B),h[B]=!1)}function Le(B,ge){return u[B]!==ge?(n.bindFramebuffer(B,ge),u[B]=ge,B===n.DRAW_FRAMEBUFFER&&(u[n.FRAMEBUFFER]=ge),B===n.FRAMEBUFFER&&(u[n.DRAW_FRAMEBUFFER]=ge),!0):!1}function te(B,ge){let $=f,re=!1;if(B){$=p.get(ge),$===void 0&&($=[],p.set(ge,$));const Me=B.textures;if($.length!==Me.length||$[0]!==n.COLOR_ATTACHMENT0){for(let ve=0,We=Me.length;ve<We;ve++)$[ve]=n.COLOR_ATTACHMENT0+ve;$.length=Me.length,re=!0}}else $[0]!==n.BACK&&($[0]=n.BACK,re=!0);re&&n.drawBuffers($)}function O(B){return g!==B?(n.useProgram(B),g=B,!0):!1}const j={100:n.FUNC_ADD,101:n.FUNC_SUBTRACT,102:n.FUNC_REVERSE_SUBTRACT};j[103]=n.MIN,j[104]=n.MAX;const se={200:n.ZERO,201:n.ONE,202:n.SRC_COLOR,204:n.SRC_ALPHA,210:n.SRC_ALPHA_SATURATE,208:n.DST_COLOR,206:n.DST_ALPHA,203:n.ONE_MINUS_SRC_COLOR,205:n.ONE_MINUS_SRC_ALPHA,209:n.ONE_MINUS_DST_COLOR,207:n.ONE_MINUS_DST_ALPHA,211:n.CONSTANT_COLOR,212:n.ONE_MINUS_CONSTANT_COLOR,213:n.CONSTANT_ALPHA,214:n.ONE_MINUS_CONSTANT_ALPHA};function I(B,ge,$,re,Me,ve,We,Mt,Pt,rt){if(B===0){_===!0&&(ie(n.BLEND),_=!1);return}if(_===!1&&(W(n.BLEND),_=!0),B!==5){if(B!==m||rt!==x){if((d!==100||y!==100)&&(n.blendEquation(n.FUNC_ADD),d=100,y=100),rt)switch(B){case 1:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case 2:n.blendFunc(n.ONE,n.ONE);break;case 3:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case 4:n.blendFuncSeparate(n.ZERO,n.SRC_COLOR,n.ZERO,n.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",B);break}else switch(B){case 1:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case 2:n.blendFunc(n.SRC_ALPHA,n.ONE);break;case 3:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case 4:n.blendFunc(n.ZERO,n.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",B);break}v=null,b=null,N=null,A=null,w.set(0,0,0),T=0,m=B,x=rt}return}Me=Me||ge,ve=ve||$,We=We||re,(ge!==d||Me!==y)&&(n.blendEquationSeparate(j[ge],j[Me]),d=ge,y=Me),($!==v||re!==b||ve!==N||We!==A)&&(n.blendFuncSeparate(se[$],se[re],se[ve],se[We]),v=$,b=re,N=ve,A=We),(Mt.equals(w)===!1||Pt!==T)&&(n.blendColor(Mt.r,Mt.g,Mt.b,Pt),w.copy(Mt),T=Pt),m=B,x=!1}function ce(B,ge){B.side===2?ie(n.CULL_FACE):W(n.CULL_FACE);let $=B.side===1;ge&&($=!$),oe($),B.blending===1&&B.transparent===!1?I(0):I(B.blending,B.blendEquation,B.blendSrc,B.blendDst,B.blendEquationAlpha,B.blendSrcAlpha,B.blendDstAlpha,B.blendColor,B.blendAlpha,B.premultipliedAlpha),o.setFunc(B.depthFunc),o.setTest(B.depthTest),o.setMask(B.depthWrite),r.setMask(B.colorWrite);const re=B.stencilWrite;a.setTest(re),re&&(a.setMask(B.stencilWriteMask),a.setFunc(B.stencilFunc,B.stencilRef,B.stencilFuncMask),a.setOp(B.stencilFail,B.stencilZFail,B.stencilZPass)),Ue(B.polygonOffset,B.polygonOffsetFactor,B.polygonOffsetUnits),B.alphaToCoverage===!0?W(n.SAMPLE_ALPHA_TO_COVERAGE):ie(n.SAMPLE_ALPHA_TO_COVERAGE)}function oe(B){M!==B&&(B?n.frontFace(n.CW):n.frontFace(n.CCW),M=B)}function _e(B){B!==0?(W(n.CULL_FACE),B!==C&&(B===1?n.cullFace(n.BACK):B===2?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):ie(n.CULL_FACE),C=B}function fe(B){B!==F&&(H&&n.lineWidth(B),F=B)}function Ue(B,ge,$){B?(W(n.POLYGON_OFFSET_FILL),(D!==ge||U!==$)&&(n.polygonOffset(ge,$),D=ge,U=$)):ie(n.POLYGON_OFFSET_FILL)}function ye(B){B?W(n.SCISSOR_TEST):ie(n.SCISSOR_TEST)}function P(B){B===void 0&&(B=n.TEXTURE0+V-1),R!==B&&(n.activeTexture(B),R=B)}function S(B,ge,$){$===void 0&&(R===null?$=n.TEXTURE0+V-1:$=R);let re=X[$];re===void 0&&(re={type:void 0,texture:void 0},X[$]=re),(re.type!==B||re.texture!==ge)&&(R!==$&&(n.activeTexture($),R=$),n.bindTexture(B,ge||le[B]),re.type=B,re.texture=ge)}function k(){const B=X[R];B!==void 0&&B.type!==void 0&&(n.bindTexture(B.type,null),B.type=void 0,B.texture=void 0)}function J(){try{n.compressedTexImage2D.apply(n,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function Q(){try{n.compressedTexImage3D.apply(n,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function Z(){try{n.texSubImage2D.apply(n,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function Ee(){try{n.texSubImage3D.apply(n,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function me(){try{n.compressedTexSubImage2D.apply(n,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function Se(){try{n.compressedTexSubImage3D.apply(n,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function Je(){try{n.texStorage2D.apply(n,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function he(){try{n.texStorage3D.apply(n,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function we(){try{n.texImage2D.apply(n,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function ke(){try{n.texImage3D.apply(n,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function Be(B){Qe.equals(B)===!1&&(n.scissor(B.x,B.y,B.z,B.w),Qe.copy(B))}function Te(B){ne.equals(B)===!1&&(n.viewport(B.x,B.y,B.z,B.w),ne.copy(B))}function Ze(B,ge){let $=c.get(ge);$===void 0&&($=new WeakMap,c.set(ge,$));let re=$.get(B);re===void 0&&(re=n.getUniformBlockIndex(ge,B.name),$.set(B,re))}function je(B,ge){const re=c.get(ge).get(B);l.get(ge)!==re&&(n.uniformBlockBinding(ge,re,B.__bindingPointIndex),l.set(ge,re))}function dt(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),o.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),h={},R=null,X={},u={},p=new WeakMap,f=[],g=null,_=!1,m=null,d=null,v=null,b=null,y=null,N=null,A=null,w=new Ne(0,0,0),T=0,x=!1,M=null,C=null,F=null,D=null,U=null,Qe.set(0,0,n.canvas.width,n.canvas.height),ne.set(0,0,n.canvas.width,n.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:W,disable:ie,bindFramebuffer:Le,drawBuffers:te,useProgram:O,setBlending:I,setMaterial:ce,setFlipSided:oe,setCullFace:_e,setLineWidth:fe,setPolygonOffset:Ue,setScissorTest:ye,activeTexture:P,bindTexture:S,unbindTexture:k,compressedTexImage2D:J,compressedTexImage3D:Q,texImage2D:we,texImage3D:ke,updateUBOMapping:Ze,uniformBlockBinding:je,texStorage2D:Je,texStorage3D:he,texSubImage2D:Z,texSubImage3D:Ee,compressedTexSubImage2D:me,compressedTexSubImage3D:Se,scissor:Be,viewport:Te,reset:dt}}function el(n,e,t,i){const s=Em(i);switch(t){case 1021:return n*e;case 1024:return n*e;case 1025:return n*e*2;case 1028:return n*e/s.components*s.byteLength;case 1029:return n*e/s.components*s.byteLength;case 1030:return n*e*2/s.components*s.byteLength;case 1031:return n*e*2/s.components*s.byteLength;case 1022:return n*e*3/s.components*s.byteLength;case 1023:return n*e*4/s.components*s.byteLength;case 1033:return n*e*4/s.components*s.byteLength;case 33776:case 33777:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case 33778:case 33779:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case 35841:case 35843:return Math.max(n,16)*Math.max(e,8)/4;case 35840:case 35842:return Math.max(n,8)*Math.max(e,8)/2;case 36196:case 37492:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case 37496:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case 37808:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case 37809:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case 37810:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case 37811:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case 37812:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case 37813:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case 37814:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case 37815:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case 37816:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case 37817:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case 37818:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case 37819:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case 37820:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case 37821:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case 36492:case 36494:case 36495:return Math.ceil(n/4)*Math.ceil(e/4)*16;case 36283:case 36284:return Math.ceil(n/4)*Math.ceil(e/4)*8;case 36285:case 36286:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Em(n){switch(n){case 1009:case 1010:return{byteLength:1,components:1};case 1012:case 1011:case 1016:return{byteLength:2,components:1};case 1017:case 1018:return{byteLength:2,components:4};case 1014:case 1013:case 1015:return{byteLength:4,components:1};case 35902:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}function Am(n,e,t,i,s,r,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new ae,h=new WeakMap;let u;const p=new WeakMap;let f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(P,S){return f?new OffscreenCanvas(P,S):ss("canvas")}function _(P,S,k){let J=1;const Q=ye(P);if((Q.width>k||Q.height>k)&&(J=k/Math.max(Q.width,Q.height)),J<1)if(typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&P instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&P instanceof ImageBitmap||typeof VideoFrame<"u"&&P instanceof VideoFrame){const Z=Math.floor(J*Q.width),Ee=Math.floor(J*Q.height);u===void 0&&(u=g(Z,Ee));const me=S?g(Z,Ee):u;return me.width=Z,me.height=Ee,me.getContext("2d").drawImage(P,0,0,Z,Ee),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+Q.width+"x"+Q.height+") to ("+Z+"x"+Ee+")."),me}else return"data"in P&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+Q.width+"x"+Q.height+")."),P;return P}function m(P){return P.generateMipmaps}function d(P){n.generateMipmap(P)}function v(P){return P.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:P.isWebGL3DRenderTarget?n.TEXTURE_3D:P.isWebGLArrayRenderTarget||P.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function b(P,S,k,J,Q=!1){if(P!==null){if(n[P]!==void 0)return n[P];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+P+"'")}let Z=S;if(S===n.RED&&(k===n.FLOAT&&(Z=n.R32F),k===n.HALF_FLOAT&&(Z=n.R16F),k===n.UNSIGNED_BYTE&&(Z=n.R8)),S===n.RED_INTEGER&&(k===n.UNSIGNED_BYTE&&(Z=n.R8UI),k===n.UNSIGNED_SHORT&&(Z=n.R16UI),k===n.UNSIGNED_INT&&(Z=n.R32UI),k===n.BYTE&&(Z=n.R8I),k===n.SHORT&&(Z=n.R16I),k===n.INT&&(Z=n.R32I)),S===n.RG&&(k===n.FLOAT&&(Z=n.RG32F),k===n.HALF_FLOAT&&(Z=n.RG16F),k===n.UNSIGNED_BYTE&&(Z=n.RG8)),S===n.RG_INTEGER&&(k===n.UNSIGNED_BYTE&&(Z=n.RG8UI),k===n.UNSIGNED_SHORT&&(Z=n.RG16UI),k===n.UNSIGNED_INT&&(Z=n.RG32UI),k===n.BYTE&&(Z=n.RG8I),k===n.SHORT&&(Z=n.RG16I),k===n.INT&&(Z=n.RG32I)),S===n.RGB_INTEGER&&(k===n.UNSIGNED_BYTE&&(Z=n.RGB8UI),k===n.UNSIGNED_SHORT&&(Z=n.RGB16UI),k===n.UNSIGNED_INT&&(Z=n.RGB32UI),k===n.BYTE&&(Z=n.RGB8I),k===n.SHORT&&(Z=n.RGB16I),k===n.INT&&(Z=n.RGB32I)),S===n.RGBA_INTEGER&&(k===n.UNSIGNED_BYTE&&(Z=n.RGBA8UI),k===n.UNSIGNED_SHORT&&(Z=n.RGBA16UI),k===n.UNSIGNED_INT&&(Z=n.RGBA32UI),k===n.BYTE&&(Z=n.RGBA8I),k===n.SHORT&&(Z=n.RGBA16I),k===n.INT&&(Z=n.RGBA32I)),S===n.RGB&&k===n.UNSIGNED_INT_5_9_9_9_REV&&(Z=n.RGB9_E5),S===n.RGBA){const Ee=Q?lr:$e.getTransfer(J);k===n.FLOAT&&(Z=n.RGBA32F),k===n.HALF_FLOAT&&(Z=n.RGBA16F),k===n.UNSIGNED_BYTE&&(Z=Ee===lt?n.SRGB8_ALPHA8:n.RGBA8),k===n.UNSIGNED_SHORT_4_4_4_4&&(Z=n.RGBA4),k===n.UNSIGNED_SHORT_5_5_5_1&&(Z=n.RGB5_A1)}return(Z===n.R16F||Z===n.R32F||Z===n.RG16F||Z===n.RG32F||Z===n.RGBA16F||Z===n.RGBA32F)&&e.get("EXT_color_buffer_float"),Z}function y(P,S){let k;return P?S===null||S===1014||S===1020?k=n.DEPTH24_STENCIL8:S===1015?k=n.DEPTH32F_STENCIL8:S===1012&&(k=n.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===1014||S===1020?k=n.DEPTH_COMPONENT24:S===1015?k=n.DEPTH_COMPONENT32F:S===1012&&(k=n.DEPTH_COMPONENT16),k}function N(P,S){return m(P)===!0||P.isFramebufferTexture&&P.minFilter!==1003&&P.minFilter!==1006?Math.log2(Math.max(S.width,S.height))+1:P.mipmaps!==void 0&&P.mipmaps.length>0?P.mipmaps.length:P.isCompressedTexture&&Array.isArray(P.image)?S.mipmaps.length:1}function A(P){const S=P.target;S.removeEventListener("dispose",A),T(S),S.isVideoTexture&&h.delete(S)}function w(P){const S=P.target;S.removeEventListener("dispose",w),M(S)}function T(P){const S=i.get(P);if(S.__webglInit===void 0)return;const k=P.source,J=p.get(k);if(J){const Q=J[S.__cacheKey];Q.usedTimes--,Q.usedTimes===0&&x(P),Object.keys(J).length===0&&p.delete(k)}i.remove(P)}function x(P){const S=i.get(P);n.deleteTexture(S.__webglTexture);const k=P.source,J=p.get(k);delete J[S.__cacheKey],o.memory.textures--}function M(P){const S=i.get(P);if(P.depthTexture&&(P.depthTexture.dispose(),i.remove(P.depthTexture)),P.isWebGLCubeRenderTarget)for(let J=0;J<6;J++){if(Array.isArray(S.__webglFramebuffer[J]))for(let Q=0;Q<S.__webglFramebuffer[J].length;Q++)n.deleteFramebuffer(S.__webglFramebuffer[J][Q]);else n.deleteFramebuffer(S.__webglFramebuffer[J]);S.__webglDepthbuffer&&n.deleteRenderbuffer(S.__webglDepthbuffer[J])}else{if(Array.isArray(S.__webglFramebuffer))for(let J=0;J<S.__webglFramebuffer.length;J++)n.deleteFramebuffer(S.__webglFramebuffer[J]);else n.deleteFramebuffer(S.__webglFramebuffer);if(S.__webglDepthbuffer&&n.deleteRenderbuffer(S.__webglDepthbuffer),S.__webglMultisampledFramebuffer&&n.deleteFramebuffer(S.__webglMultisampledFramebuffer),S.__webglColorRenderbuffer)for(let J=0;J<S.__webglColorRenderbuffer.length;J++)S.__webglColorRenderbuffer[J]&&n.deleteRenderbuffer(S.__webglColorRenderbuffer[J]);S.__webglDepthRenderbuffer&&n.deleteRenderbuffer(S.__webglDepthRenderbuffer)}const k=P.textures;for(let J=0,Q=k.length;J<Q;J++){const Z=i.get(k[J]);Z.__webglTexture&&(n.deleteTexture(Z.__webglTexture),o.memory.textures--),i.remove(k[J])}i.remove(P)}let C=0;function F(){C=0}function D(){const P=C;return P>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+P+" texture units while this GPU supports only "+s.maxTextures),C+=1,P}function U(P){const S=[];return S.push(P.wrapS),S.push(P.wrapT),S.push(P.wrapR||0),S.push(P.magFilter),S.push(P.minFilter),S.push(P.anisotropy),S.push(P.internalFormat),S.push(P.format),S.push(P.type),S.push(P.generateMipmaps),S.push(P.premultiplyAlpha),S.push(P.flipY),S.push(P.unpackAlignment),S.push(P.colorSpace),S.join()}function V(P,S){const k=i.get(P);if(P.isVideoTexture&&fe(P),P.isRenderTargetTexture===!1&&P.version>0&&k.__version!==P.version){const J=P.image;if(J===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(J.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{ne(k,P,S);return}}t.bindTexture(n.TEXTURE_2D,k.__webglTexture,n.TEXTURE0+S)}function H(P,S){const k=i.get(P);if(P.version>0&&k.__version!==P.version){ne(k,P,S);return}t.bindTexture(n.TEXTURE_2D_ARRAY,k.__webglTexture,n.TEXTURE0+S)}function ee(P,S){const k=i.get(P);if(P.version>0&&k.__version!==P.version){ne(k,P,S);return}t.bindTexture(n.TEXTURE_3D,k.__webglTexture,n.TEXTURE0+S)}function K(P,S){const k=i.get(P);if(P.version>0&&k.__version!==P.version){ue(k,P,S);return}t.bindTexture(n.TEXTURE_CUBE_MAP,k.__webglTexture,n.TEXTURE0+S)}const R={1e3:n.REPEAT,1001:n.CLAMP_TO_EDGE,1002:n.MIRRORED_REPEAT},X={1003:n.NEAREST,1004:n.NEAREST_MIPMAP_NEAREST,1005:n.NEAREST_MIPMAP_LINEAR,1006:n.LINEAR,1007:n.LINEAR_MIPMAP_NEAREST,1008:n.LINEAR_MIPMAP_LINEAR},xe={512:n.NEVER,519:n.ALWAYS,513:n.LESS,515:n.LEQUAL,514:n.EQUAL,518:n.GEQUAL,516:n.GREATER,517:n.NOTEQUAL};function Oe(P,S){if(S.type===1015&&e.has("OES_texture_float_linear")===!1&&(S.magFilter===1006||S.magFilter===1007||S.magFilter===1005||S.magFilter===1008||S.minFilter===1006||S.minFilter===1007||S.minFilter===1005||S.minFilter===1008)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(P,n.TEXTURE_WRAP_S,R[S.wrapS]),n.texParameteri(P,n.TEXTURE_WRAP_T,R[S.wrapT]),(P===n.TEXTURE_3D||P===n.TEXTURE_2D_ARRAY)&&n.texParameteri(P,n.TEXTURE_WRAP_R,R[S.wrapR]),n.texParameteri(P,n.TEXTURE_MAG_FILTER,X[S.magFilter]),n.texParameteri(P,n.TEXTURE_MIN_FILTER,X[S.minFilter]),S.compareFunction&&(n.texParameteri(P,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(P,n.TEXTURE_COMPARE_FUNC,xe[S.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===1003||S.minFilter!==1005&&S.minFilter!==1008||S.type===1015&&e.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||i.get(S).__currentAnisotropy){const k=e.get("EXT_texture_filter_anisotropic");n.texParameterf(P,k.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,s.getMaxAnisotropy())),i.get(S).__currentAnisotropy=S.anisotropy}}}function Qe(P,S){let k=!1;P.__webglInit===void 0&&(P.__webglInit=!0,S.addEventListener("dispose",A));const J=S.source;let Q=p.get(J);Q===void 0&&(Q={},p.set(J,Q));const Z=U(S);if(Z!==P.__cacheKey){Q[Z]===void 0&&(Q[Z]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,k=!0),Q[Z].usedTimes++;const Ee=Q[P.__cacheKey];Ee!==void 0&&(Q[P.__cacheKey].usedTimes--,Ee.usedTimes===0&&x(S)),P.__cacheKey=Z,P.__webglTexture=Q[Z].texture}return k}function ne(P,S,k){let J=n.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(J=n.TEXTURE_2D_ARRAY),S.isData3DTexture&&(J=n.TEXTURE_3D);const Q=Qe(P,S),Z=S.source;t.bindTexture(J,P.__webglTexture,n.TEXTURE0+k);const Ee=i.get(Z);if(Z.version!==Ee.__version||Q===!0){t.activeTexture(n.TEXTURE0+k);const me=$e.getPrimaries($e.workingColorSpace),Se=S.colorSpace===""?null:$e.getPrimaries(S.colorSpace),Je=S.colorSpace===""||me===Se?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,S.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,S.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Je);let he=_(S.image,!1,s.maxTextureSize);he=Ue(S,he);const we=r.convert(S.format,S.colorSpace),ke=r.convert(S.type);let Be=b(S.internalFormat,we,ke,S.colorSpace,S.isVideoTexture);Oe(J,S);let Te;const Ze=S.mipmaps,je=S.isVideoTexture!==!0,dt=Ee.__version===void 0||Q===!0,B=Z.dataReady,ge=N(S,he);if(S.isDepthTexture)Be=y(S.format===1027,S.type),dt&&(je?t.texStorage2D(n.TEXTURE_2D,1,Be,he.width,he.height):t.texImage2D(n.TEXTURE_2D,0,Be,he.width,he.height,0,we,ke,null));else if(S.isDataTexture)if(Ze.length>0){je&&dt&&t.texStorage2D(n.TEXTURE_2D,ge,Be,Ze[0].width,Ze[0].height);for(let $=0,re=Ze.length;$<re;$++)Te=Ze[$],je?B&&t.texSubImage2D(n.TEXTURE_2D,$,0,0,Te.width,Te.height,we,ke,Te.data):t.texImage2D(n.TEXTURE_2D,$,Be,Te.width,Te.height,0,we,ke,Te.data);S.generateMipmaps=!1}else je?(dt&&t.texStorage2D(n.TEXTURE_2D,ge,Be,he.width,he.height),B&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,he.width,he.height,we,ke,he.data)):t.texImage2D(n.TEXTURE_2D,0,Be,he.width,he.height,0,we,ke,he.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){je&&dt&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ge,Be,Ze[0].width,Ze[0].height,he.depth);for(let $=0,re=Ze.length;$<re;$++)if(Te=Ze[$],S.format!==1023)if(we!==null)if(je){if(B)if(S.layerUpdates.size>0){const Me=el(Te.width,Te.height,S.format,S.type);for(const ve of S.layerUpdates){const We=Te.data.subarray(ve*Me/Te.data.BYTES_PER_ELEMENT,(ve+1)*Me/Te.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,$,0,0,ve,Te.width,Te.height,1,we,We)}S.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,$,0,0,0,Te.width,Te.height,he.depth,we,Te.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,$,Be,Te.width,Te.height,he.depth,0,Te.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else je?B&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,$,0,0,0,Te.width,Te.height,he.depth,we,ke,Te.data):t.texImage3D(n.TEXTURE_2D_ARRAY,$,Be,Te.width,Te.height,he.depth,0,we,ke,Te.data)}else{je&&dt&&t.texStorage2D(n.TEXTURE_2D,ge,Be,Ze[0].width,Ze[0].height);for(let $=0,re=Ze.length;$<re;$++)Te=Ze[$],S.format!==1023?we!==null?je?B&&t.compressedTexSubImage2D(n.TEXTURE_2D,$,0,0,Te.width,Te.height,we,Te.data):t.compressedTexImage2D(n.TEXTURE_2D,$,Be,Te.width,Te.height,0,Te.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):je?B&&t.texSubImage2D(n.TEXTURE_2D,$,0,0,Te.width,Te.height,we,ke,Te.data):t.texImage2D(n.TEXTURE_2D,$,Be,Te.width,Te.height,0,we,ke,Te.data)}else if(S.isDataArrayTexture)if(je){if(dt&&t.texStorage3D(n.TEXTURE_2D_ARRAY,ge,Be,he.width,he.height,he.depth),B)if(S.layerUpdates.size>0){const $=el(he.width,he.height,S.format,S.type);for(const re of S.layerUpdates){const Me=he.data.subarray(re*$/he.data.BYTES_PER_ELEMENT,(re+1)*$/he.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,re,he.width,he.height,1,we,ke,Me)}S.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,he.width,he.height,he.depth,we,ke,he.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,Be,he.width,he.height,he.depth,0,we,ke,he.data);else if(S.isData3DTexture)je?(dt&&t.texStorage3D(n.TEXTURE_3D,ge,Be,he.width,he.height,he.depth),B&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,he.width,he.height,he.depth,we,ke,he.data)):t.texImage3D(n.TEXTURE_3D,0,Be,he.width,he.height,he.depth,0,we,ke,he.data);else if(S.isFramebufferTexture){if(dt)if(je)t.texStorage2D(n.TEXTURE_2D,ge,Be,he.width,he.height);else{let $=he.width,re=he.height;for(let Me=0;Me<ge;Me++)t.texImage2D(n.TEXTURE_2D,Me,Be,$,re,0,we,ke,null),$>>=1,re>>=1}}else if(Ze.length>0){if(je&&dt){const $=ye(Ze[0]);t.texStorage2D(n.TEXTURE_2D,ge,Be,$.width,$.height)}for(let $=0,re=Ze.length;$<re;$++)Te=Ze[$],je?B&&t.texSubImage2D(n.TEXTURE_2D,$,0,0,we,ke,Te):t.texImage2D(n.TEXTURE_2D,$,Be,we,ke,Te);S.generateMipmaps=!1}else if(je){if(dt){const $=ye(he);t.texStorage2D(n.TEXTURE_2D,ge,Be,$.width,$.height)}B&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,we,ke,he)}else t.texImage2D(n.TEXTURE_2D,0,Be,we,ke,he);m(S)&&d(J),Ee.__version=Z.version,S.onUpdate&&S.onUpdate(S)}P.__version=S.version}function ue(P,S,k){if(S.image.length!==6)return;const J=Qe(P,S),Q=S.source;t.bindTexture(n.TEXTURE_CUBE_MAP,P.__webglTexture,n.TEXTURE0+k);const Z=i.get(Q);if(Q.version!==Z.__version||J===!0){t.activeTexture(n.TEXTURE0+k);const Ee=$e.getPrimaries($e.workingColorSpace),me=S.colorSpace===""?null:$e.getPrimaries(S.colorSpace),Se=S.colorSpace===""||Ee===me?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,S.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,S.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Se);const Je=S.isCompressedTexture||S.image[0].isCompressedTexture,he=S.image[0]&&S.image[0].isDataTexture,we=[];for(let re=0;re<6;re++)!Je&&!he?we[re]=_(S.image[re],!0,s.maxCubemapSize):we[re]=he?S.image[re].image:S.image[re],we[re]=Ue(S,we[re]);const ke=we[0],Be=r.convert(S.format,S.colorSpace),Te=r.convert(S.type),Ze=b(S.internalFormat,Be,Te,S.colorSpace),je=S.isVideoTexture!==!0,dt=Z.__version===void 0||J===!0,B=Q.dataReady;let ge=N(S,ke);Oe(n.TEXTURE_CUBE_MAP,S);let $;if(Je){je&&dt&&t.texStorage2D(n.TEXTURE_CUBE_MAP,ge,Ze,ke.width,ke.height);for(let re=0;re<6;re++){$=we[re].mipmaps;for(let Me=0;Me<$.length;Me++){const ve=$[Me];S.format!==1023?Be!==null?je?B&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,Me,0,0,ve.width,ve.height,Be,ve.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,Me,Ze,ve.width,ve.height,0,ve.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):je?B&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,Me,0,0,ve.width,ve.height,Be,Te,ve.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,Me,Ze,ve.width,ve.height,0,Be,Te,ve.data)}}}else{if($=S.mipmaps,je&&dt){$.length>0&&ge++;const re=ye(we[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,ge,Ze,re.width,re.height)}for(let re=0;re<6;re++)if(he){je?B&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,0,0,0,we[re].width,we[re].height,Be,Te,we[re].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,0,Ze,we[re].width,we[re].height,0,Be,Te,we[re].data);for(let Me=0;Me<$.length;Me++){const We=$[Me].image[re].image;je?B&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,Me+1,0,0,We.width,We.height,Be,Te,We.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,Me+1,Ze,We.width,We.height,0,Be,Te,We.data)}}else{je?B&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,0,0,0,Be,Te,we[re]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,0,Ze,Be,Te,we[re]);for(let Me=0;Me<$.length;Me++){const ve=$[Me];je?B&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,Me+1,0,0,Be,Te,ve.image[re]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+re,Me+1,Ze,Be,Te,ve.image[re])}}}m(S)&&d(n.TEXTURE_CUBE_MAP),Z.__version=Q.version,S.onUpdate&&S.onUpdate(S)}P.__version=S.version}function le(P,S,k,J,Q,Z){const Ee=r.convert(k.format,k.colorSpace),me=r.convert(k.type),Se=b(k.internalFormat,Ee,me,k.colorSpace),Je=i.get(S),he=i.get(k);if(he.__renderTarget=S,!Je.__hasExternalTextures){const we=Math.max(1,S.width>>Z),ke=Math.max(1,S.height>>Z);Q===n.TEXTURE_3D||Q===n.TEXTURE_2D_ARRAY?t.texImage3D(Q,Z,Se,we,ke,S.depth,0,Ee,me,null):t.texImage2D(Q,Z,Se,we,ke,0,Ee,me,null)}t.bindFramebuffer(n.FRAMEBUFFER,P),_e(S)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,J,Q,he.__webglTexture,0,oe(S)):(Q===n.TEXTURE_2D||Q>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&Q<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,J,Q,he.__webglTexture,Z),t.bindFramebuffer(n.FRAMEBUFFER,null)}function W(P,S,k){if(n.bindRenderbuffer(n.RENDERBUFFER,P),S.depthBuffer){const J=S.depthTexture,Q=J&&J.isDepthTexture?J.type:null,Z=y(S.stencilBuffer,Q),Ee=S.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,me=oe(S);_e(S)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,me,Z,S.width,S.height):k?n.renderbufferStorageMultisample(n.RENDERBUFFER,me,Z,S.width,S.height):n.renderbufferStorage(n.RENDERBUFFER,Z,S.width,S.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,Ee,n.RENDERBUFFER,P)}else{const J=S.textures;for(let Q=0;Q<J.length;Q++){const Z=J[Q],Ee=r.convert(Z.format,Z.colorSpace),me=r.convert(Z.type),Se=b(Z.internalFormat,Ee,me,Z.colorSpace),Je=oe(S);k&&_e(S)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,Je,Se,S.width,S.height):_e(S)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Je,Se,S.width,S.height):n.renderbufferStorage(n.RENDERBUFFER,Se,S.width,S.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function ie(P,S){if(S&&S.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(n.FRAMEBUFFER,P),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const J=i.get(S.depthTexture);J.__renderTarget=S,(!J.__webglTexture||S.depthTexture.image.width!==S.width||S.depthTexture.image.height!==S.height)&&(S.depthTexture.image.width=S.width,S.depthTexture.image.height=S.height,S.depthTexture.needsUpdate=!0),V(S.depthTexture,0);const Q=J.__webglTexture,Z=oe(S);if(S.depthTexture.format===1026)_e(S)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,Q,0,Z):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,Q,0);else if(S.depthTexture.format===1027)_e(S)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,Q,0,Z):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,Q,0);else throw new Error("Unknown depthTexture format")}function Le(P){const S=i.get(P),k=P.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==P.depthTexture){const J=P.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),J){const Q=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,J.removeEventListener("dispose",Q)};J.addEventListener("dispose",Q),S.__depthDisposeCallback=Q}S.__boundDepthTexture=J}if(P.depthTexture&&!S.__autoAllocateDepthBuffer){if(k)throw new Error("target.depthTexture not supported in Cube render targets");ie(S.__webglFramebuffer,P)}else if(k){S.__webglDepthbuffer=[];for(let J=0;J<6;J++)if(t.bindFramebuffer(n.FRAMEBUFFER,S.__webglFramebuffer[J]),S.__webglDepthbuffer[J]===void 0)S.__webglDepthbuffer[J]=n.createRenderbuffer(),W(S.__webglDepthbuffer[J],P,!1);else{const Q=P.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Z=S.__webglDepthbuffer[J];n.bindRenderbuffer(n.RENDERBUFFER,Z),n.framebufferRenderbuffer(n.FRAMEBUFFER,Q,n.RENDERBUFFER,Z)}}else if(t.bindFramebuffer(n.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=n.createRenderbuffer(),W(S.__webglDepthbuffer,P,!1);else{const J=P.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Q=S.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,Q),n.framebufferRenderbuffer(n.FRAMEBUFFER,J,n.RENDERBUFFER,Q)}t.bindFramebuffer(n.FRAMEBUFFER,null)}function te(P,S,k){const J=i.get(P);S!==void 0&&le(J.__webglFramebuffer,P,P.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),k!==void 0&&Le(P)}function O(P){const S=P.texture,k=i.get(P),J=i.get(S);P.addEventListener("dispose",w);const Q=P.textures,Z=P.isWebGLCubeRenderTarget===!0,Ee=Q.length>1;if(Ee||(J.__webglTexture===void 0&&(J.__webglTexture=n.createTexture()),J.__version=S.version,o.memory.textures++),Z){k.__webglFramebuffer=[];for(let me=0;me<6;me++)if(S.mipmaps&&S.mipmaps.length>0){k.__webglFramebuffer[me]=[];for(let Se=0;Se<S.mipmaps.length;Se++)k.__webglFramebuffer[me][Se]=n.createFramebuffer()}else k.__webglFramebuffer[me]=n.createFramebuffer()}else{if(S.mipmaps&&S.mipmaps.length>0){k.__webglFramebuffer=[];for(let me=0;me<S.mipmaps.length;me++)k.__webglFramebuffer[me]=n.createFramebuffer()}else k.__webglFramebuffer=n.createFramebuffer();if(Ee)for(let me=0,Se=Q.length;me<Se;me++){const Je=i.get(Q[me]);Je.__webglTexture===void 0&&(Je.__webglTexture=n.createTexture(),o.memory.textures++)}if(P.samples>0&&_e(P)===!1){k.__webglMultisampledFramebuffer=n.createFramebuffer(),k.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,k.__webglMultisampledFramebuffer);for(let me=0;me<Q.length;me++){const Se=Q[me];k.__webglColorRenderbuffer[me]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,k.__webglColorRenderbuffer[me]);const Je=r.convert(Se.format,Se.colorSpace),he=r.convert(Se.type),we=b(Se.internalFormat,Je,he,Se.colorSpace,P.isXRRenderTarget===!0),ke=oe(P);n.renderbufferStorageMultisample(n.RENDERBUFFER,ke,we,P.width,P.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+me,n.RENDERBUFFER,k.__webglColorRenderbuffer[me])}n.bindRenderbuffer(n.RENDERBUFFER,null),P.depthBuffer&&(k.__webglDepthRenderbuffer=n.createRenderbuffer(),W(k.__webglDepthRenderbuffer,P,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(Z){t.bindTexture(n.TEXTURE_CUBE_MAP,J.__webglTexture),Oe(n.TEXTURE_CUBE_MAP,S);for(let me=0;me<6;me++)if(S.mipmaps&&S.mipmaps.length>0)for(let Se=0;Se<S.mipmaps.length;Se++)le(k.__webglFramebuffer[me][Se],P,S,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+me,Se);else le(k.__webglFramebuffer[me],P,S,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+me,0);m(S)&&d(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Ee){for(let me=0,Se=Q.length;me<Se;me++){const Je=Q[me],he=i.get(Je);t.bindTexture(n.TEXTURE_2D,he.__webglTexture),Oe(n.TEXTURE_2D,Je),le(k.__webglFramebuffer,P,Je,n.COLOR_ATTACHMENT0+me,n.TEXTURE_2D,0),m(Je)&&d(n.TEXTURE_2D)}t.unbindTexture()}else{let me=n.TEXTURE_2D;if((P.isWebGL3DRenderTarget||P.isWebGLArrayRenderTarget)&&(me=P.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(me,J.__webglTexture),Oe(me,S),S.mipmaps&&S.mipmaps.length>0)for(let Se=0;Se<S.mipmaps.length;Se++)le(k.__webglFramebuffer[Se],P,S,n.COLOR_ATTACHMENT0,me,Se);else le(k.__webglFramebuffer,P,S,n.COLOR_ATTACHMENT0,me,0);m(S)&&d(me),t.unbindTexture()}P.depthBuffer&&Le(P)}function j(P){const S=P.textures;for(let k=0,J=S.length;k<J;k++){const Q=S[k];if(m(Q)){const Z=v(P),Ee=i.get(Q).__webglTexture;t.bindTexture(Z,Ee),d(Z),t.unbindTexture()}}}const se=[],I=[];function ce(P){if(P.samples>0){if(_e(P)===!1){const S=P.textures,k=P.width,J=P.height;let Q=n.COLOR_BUFFER_BIT;const Z=P.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Ee=i.get(P),me=S.length>1;if(me)for(let Se=0;Se<S.length;Se++)t.bindFramebuffer(n.FRAMEBUFFER,Ee.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Se,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,Ee.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Se,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,Ee.__webglMultisampledFramebuffer),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Ee.__webglFramebuffer);for(let Se=0;Se<S.length;Se++){if(P.resolveDepthBuffer&&(P.depthBuffer&&(Q|=n.DEPTH_BUFFER_BIT),P.stencilBuffer&&P.resolveStencilBuffer&&(Q|=n.STENCIL_BUFFER_BIT)),me){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,Ee.__webglColorRenderbuffer[Se]);const Je=i.get(S[Se]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,Je,0)}n.blitFramebuffer(0,0,k,J,0,0,k,J,Q,n.NEAREST),l===!0&&(se.length=0,I.length=0,se.push(n.COLOR_ATTACHMENT0+Se),P.depthBuffer&&P.resolveDepthBuffer===!1&&(se.push(Z),I.push(Z),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,I)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,se))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),me)for(let Se=0;Se<S.length;Se++){t.bindFramebuffer(n.FRAMEBUFFER,Ee.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Se,n.RENDERBUFFER,Ee.__webglColorRenderbuffer[Se]);const Je=i.get(S[Se]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,Ee.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Se,n.TEXTURE_2D,Je,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Ee.__webglMultisampledFramebuffer)}else if(P.depthBuffer&&P.resolveDepthBuffer===!1&&l){const S=P.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[S])}}}function oe(P){return Math.min(s.maxSamples,P.samples)}function _e(P){const S=i.get(P);return P.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function fe(P){const S=o.render.frame;h.get(P)!==S&&(h.set(P,S),P.update())}function Ue(P,S){const k=P.colorSpace,J=P.format,Q=P.type;return P.isCompressedTexture===!0||P.isVideoTexture===!0||k!==Pi&&k!==""&&($e.getTransfer(k)===lt?(J!==1023||Q!==1009)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",k)),S}function ye(P){return typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement?(c.width=P.naturalWidth||P.width,c.height=P.naturalHeight||P.height):typeof VideoFrame<"u"&&P instanceof VideoFrame?(c.width=P.displayWidth,c.height=P.displayHeight):(c.width=P.width,c.height=P.height),c}this.allocateTextureUnit=D,this.resetTextureUnits=F,this.setTexture2D=V,this.setTexture2DArray=H,this.setTexture3D=ee,this.setTextureCube=K,this.rebindTextures=te,this.setupRenderTarget=O,this.updateRenderTargetMipmap=j,this.updateMultisampleRenderTarget=ce,this.setupDepthRenderbuffer=Le,this.setupFrameBufferTexture=le,this.useMultisampledRTT=_e}function Rm(n,e){function t(i,s=""){let r;const o=$e.getTransfer(s);if(i===1009)return n.UNSIGNED_BYTE;if(i===1017)return n.UNSIGNED_SHORT_4_4_4_4;if(i===1018)return n.UNSIGNED_SHORT_5_5_5_1;if(i===35902)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===1010)return n.BYTE;if(i===1011)return n.SHORT;if(i===1012)return n.UNSIGNED_SHORT;if(i===1013)return n.INT;if(i===1014)return n.UNSIGNED_INT;if(i===1015)return n.FLOAT;if(i===1016)return n.HALF_FLOAT;if(i===1021)return n.ALPHA;if(i===1022)return n.RGB;if(i===1023)return n.RGBA;if(i===1024)return n.LUMINANCE;if(i===1025)return n.LUMINANCE_ALPHA;if(i===1026)return n.DEPTH_COMPONENT;if(i===1027)return n.DEPTH_STENCIL;if(i===1028)return n.RED;if(i===1029)return n.RED_INTEGER;if(i===1030)return n.RG;if(i===1031)return n.RG_INTEGER;if(i===1033)return n.RGBA_INTEGER;if(i===33776||i===33777||i===33778||i===33779)if(o===lt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===33776)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===33777)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===33778)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===33779)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===33776)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===33777)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===33778)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===33779)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===35840||i===35841||i===35842||i===35843)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===35840)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===35841)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===35842)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===35843)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===36196||i===37492||i===37496)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===36196||i===37492)return o===lt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===37496)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===37808||i===37809||i===37810||i===37811||i===37812||i===37813||i===37814||i===37815||i===37816||i===37817||i===37818||i===37819||i===37820||i===37821)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===37808)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===37809)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===37810)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===37811)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===37812)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===37813)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===37814)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===37815)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===37816)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===37817)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===37818)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===37819)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===37820)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===37821)return o===lt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===36492||i===36494||i===36495)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===36492)return o===lt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===36494)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===36495)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===36283||i===36284||i===36285||i===36286)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===36492)return r.COMPRESSED_RED_RGTC1_EXT;if(i===36284)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===36285)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===36286)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===1020?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}class Cm extends Vt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class Wt extends bt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Pm={type:"move"};class qr{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Wt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Wt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new L,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new L),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Wt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new L,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new L),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let s=null,r=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(const _ of e.hand.values()){const m=t.getJointPose(_,i),d=this._getHandJoint(c,_);m!==null&&(d.matrix.fromArray(m.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=m.radius),d.visible=m!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],p=h.position.distanceTo(u.position),f=.02,g=.005;c.inputState.pinching&&p>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&p<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=t.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Pm)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new Wt;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}const Lm=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Im=`
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

}`;class Dm{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,i){if(this.texture===null){const s=new Ct,r=e.properties.get(s);r.__webglTexture=t.texture,(t.depthNear!=i.depthNear||t.depthFar!=i.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=s}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,i=new Ln({vertexShader:Lm,fragmentShader:Im,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new ut(new Ei(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Nm extends Li{constructor(e,t){super();const i=this;let s=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,p=null,f=null,g=null;const _=new Dm,m=t.getContextAttributes();let d=null,v=null;const b=[],y=[],N=new ae;let A=null;const w=new Vt;w.viewport=new tt;const T=new Vt;T.viewport=new tt;const x=[w,T],M=new Cm;let C=null,F=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(ne){let ue=b[ne];return ue===void 0&&(ue=new qr,b[ne]=ue),ue.getTargetRaySpace()},this.getControllerGrip=function(ne){let ue=b[ne];return ue===void 0&&(ue=new qr,b[ne]=ue),ue.getGripSpace()},this.getHand=function(ne){let ue=b[ne];return ue===void 0&&(ue=new qr,b[ne]=ue),ue.getHandSpace()};function D(ne){const ue=y.indexOf(ne.inputSource);if(ue===-1)return;const le=b[ue];le!==void 0&&(le.update(ne.inputSource,ne.frame,c||o),le.dispatchEvent({type:ne.type,data:ne.inputSource}))}function U(){s.removeEventListener("select",D),s.removeEventListener("selectstart",D),s.removeEventListener("selectend",D),s.removeEventListener("squeeze",D),s.removeEventListener("squeezestart",D),s.removeEventListener("squeezeend",D),s.removeEventListener("end",U),s.removeEventListener("inputsourceschange",V);for(let ne=0;ne<b.length;ne++){const ue=y[ne];ue!==null&&(y[ne]=null,b[ne].disconnect(ue))}C=null,F=null,_.reset(),e.setRenderTarget(d),f=null,p=null,u=null,s=null,v=null,Qe.stop(),i.isPresenting=!1,e.setPixelRatio(A),e.setSize(N.width,N.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(ne){r=ne,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(ne){a=ne,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(ne){c=ne},this.getBaseLayer=function(){return p!==null?p:f},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(ne){if(s=ne,s!==null){if(d=e.getRenderTarget(),s.addEventListener("select",D),s.addEventListener("selectstart",D),s.addEventListener("selectend",D),s.addEventListener("squeeze",D),s.addEventListener("squeezestart",D),s.addEventListener("squeezeend",D),s.addEventListener("end",U),s.addEventListener("inputsourceschange",V),m.xrCompatible!==!0&&await t.makeXRCompatible(),A=e.getPixelRatio(),e.getSize(N),s.renderState.layers===void 0){const ue={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,ue),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),v=new jn(f.framebufferWidth,f.framebufferHeight,{format:1023,type:1009,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil})}else{let ue=null,le=null,W=null;m.depth&&(W=m.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ue=m.stencil?1027:1026,le=m.stencil?1020:1014);const ie={colorFormat:t.RGBA8,depthFormat:W,scaleFactor:r};u=new XRWebGLBinding(s,t),p=u.createProjectionLayer(ie),s.updateRenderState({layers:[p]}),e.setPixelRatio(1),e.setSize(p.textureWidth,p.textureHeight,!1),v=new jn(p.textureWidth,p.textureHeight,{format:1023,type:1009,depthTexture:new sc(p.textureWidth,p.textureHeight,le,void 0,void 0,void 0,void 0,void 0,void 0,ue),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:p.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),Qe.setContext(s),Qe.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function V(ne){for(let ue=0;ue<ne.removed.length;ue++){const le=ne.removed[ue],W=y.indexOf(le);W>=0&&(y[W]=null,b[W].disconnect(le))}for(let ue=0;ue<ne.added.length;ue++){const le=ne.added[ue];let W=y.indexOf(le);if(W===-1){for(let Le=0;Le<b.length;Le++)if(Le>=y.length){y.push(le),W=Le;break}else if(y[Le]===null){y[Le]=le,W=Le;break}if(W===-1)break}const ie=b[W];ie&&ie.connect(le)}}const H=new L,ee=new L;function K(ne,ue,le){H.setFromMatrixPosition(ue.matrixWorld),ee.setFromMatrixPosition(le.matrixWorld);const W=H.distanceTo(ee),ie=ue.projectionMatrix.elements,Le=le.projectionMatrix.elements,te=ie[14]/(ie[10]-1),O=ie[14]/(ie[10]+1),j=(ie[9]+1)/ie[5],se=(ie[9]-1)/ie[5],I=(ie[8]-1)/ie[0],ce=(Le[8]+1)/Le[0],oe=te*I,_e=te*ce,fe=W/(-I+ce),Ue=fe*-I;if(ue.matrixWorld.decompose(ne.position,ne.quaternion,ne.scale),ne.translateX(Ue),ne.translateZ(fe),ne.matrixWorld.compose(ne.position,ne.quaternion,ne.scale),ne.matrixWorldInverse.copy(ne.matrixWorld).invert(),ie[10]===-1)ne.projectionMatrix.copy(ue.projectionMatrix),ne.projectionMatrixInverse.copy(ue.projectionMatrixInverse);else{const ye=te+fe,P=O+fe,S=oe-Ue,k=_e+(W-Ue),J=j*O/P*ye,Q=se*O/P*ye;ne.projectionMatrix.makePerspective(S,k,J,Q,ye,P),ne.projectionMatrixInverse.copy(ne.projectionMatrix).invert()}}function R(ne,ue){ue===null?ne.matrixWorld.copy(ne.matrix):ne.matrixWorld.multiplyMatrices(ue.matrixWorld,ne.matrix),ne.matrixWorldInverse.copy(ne.matrixWorld).invert()}this.updateCamera=function(ne){if(s===null)return;let ue=ne.near,le=ne.far;_.texture!==null&&(_.depthNear>0&&(ue=_.depthNear),_.depthFar>0&&(le=_.depthFar)),M.near=T.near=w.near=ue,M.far=T.far=w.far=le,(C!==M.near||F!==M.far)&&(s.updateRenderState({depthNear:M.near,depthFar:M.far}),C=M.near,F=M.far),w.layers.mask=ne.layers.mask|2,T.layers.mask=ne.layers.mask|4,M.layers.mask=w.layers.mask|T.layers.mask;const W=ne.parent,ie=M.cameras;R(M,W);for(let Le=0;Le<ie.length;Le++)R(ie[Le],W);ie.length===2?K(M,w,T):M.projectionMatrix.copy(w.projectionMatrix),X(ne,M,W)};function X(ne,ue,le){le===null?ne.matrix.copy(ue.matrixWorld):(ne.matrix.copy(le.matrixWorld),ne.matrix.invert(),ne.matrix.multiply(ue.matrixWorld)),ne.matrix.decompose(ne.position,ne.quaternion,ne.scale),ne.updateMatrixWorld(!0),ne.projectionMatrix.copy(ue.projectionMatrix),ne.projectionMatrixInverse.copy(ue.projectionMatrixInverse),ne.isPerspectiveCamera&&(ne.fov=wi*2*Math.atan(1/ne.projectionMatrix.elements[5]),ne.zoom=1)}this.getCamera=function(){return M},this.getFoveation=function(){if(!(p===null&&f===null))return l},this.setFoveation=function(ne){l=ne,p!==null&&(p.fixedFoveation=ne),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=ne)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(M)};let xe=null;function Oe(ne,ue){if(h=ue.getViewerPose(c||o),g=ue,h!==null){const le=h.views;f!==null&&(e.setRenderTargetFramebuffer(v,f.framebuffer),e.setRenderTarget(v));let W=!1;le.length!==M.cameras.length&&(M.cameras.length=0,W=!0);for(let Le=0;Le<le.length;Le++){const te=le[Le];let O=null;if(f!==null)O=f.getViewport(te);else{const se=u.getViewSubImage(p,te);O=se.viewport,Le===0&&(e.setRenderTargetTextures(v,se.colorTexture,p.ignoreDepthValues?void 0:se.depthStencilTexture),e.setRenderTarget(v))}let j=x[Le];j===void 0&&(j=new Vt,j.layers.enable(Le),j.viewport=new tt,x[Le]=j),j.matrix.fromArray(te.transform.matrix),j.matrix.decompose(j.position,j.quaternion,j.scale),j.projectionMatrix.fromArray(te.projectionMatrix),j.projectionMatrixInverse.copy(j.projectionMatrix).invert(),j.viewport.set(O.x,O.y,O.width,O.height),Le===0&&(M.matrix.copy(j.matrix),M.matrix.decompose(M.position,M.quaternion,M.scale)),W===!0&&M.cameras.push(j)}const ie=s.enabledFeatures;if(ie&&ie.includes("depth-sensing")){const Le=u.getDepthInformation(le[0]);Le&&Le.isValid&&Le.texture&&_.init(e,Le,s.renderState)}}for(let le=0;le<b.length;le++){const W=y[le],ie=b[le];W!==null&&ie!==void 0&&ie.update(W,ue,c||o)}xe&&xe(ne,ue),ue.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:ue}),g=null}const Qe=new nc;Qe.setAnimationLoop(Oe),this.setAnimationLoop=function(ne){xe=ne},this.dispose=function(){}}}const zn=new nn,Um=new Ge;function km(n,e){function t(m,d){m.matrixAutoUpdate===!0&&m.updateMatrix(),d.value.copy(m.matrix)}function i(m,d){d.color.getRGB(m.fogColor.value,Ql(n)),d.isFog?(m.fogNear.value=d.near,m.fogFar.value=d.far):d.isFogExp2&&(m.fogDensity.value=d.density)}function s(m,d,v,b,y){d.isMeshBasicMaterial||d.isMeshLambertMaterial?r(m,d):d.isMeshToonMaterial?(r(m,d),u(m,d)):d.isMeshPhongMaterial?(r(m,d),h(m,d)):d.isMeshStandardMaterial?(r(m,d),p(m,d),d.isMeshPhysicalMaterial&&f(m,d,y)):d.isMeshMatcapMaterial?(r(m,d),g(m,d)):d.isMeshDepthMaterial?r(m,d):d.isMeshDistanceMaterial?(r(m,d),_(m,d)):d.isMeshNormalMaterial?r(m,d):d.isLineBasicMaterial?(o(m,d),d.isLineDashedMaterial&&a(m,d)):d.isPointsMaterial?l(m,d,v,b):d.isSpriteMaterial?c(m,d):d.isShadowMaterial?(m.color.value.copy(d.color),m.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function r(m,d){m.opacity.value=d.opacity,d.color&&m.diffuse.value.copy(d.color),d.emissive&&m.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(m.map.value=d.map,t(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.bumpMap&&(m.bumpMap.value=d.bumpMap,t(d.bumpMap,m.bumpMapTransform),m.bumpScale.value=d.bumpScale,d.side===1&&(m.bumpScale.value*=-1)),d.normalMap&&(m.normalMap.value=d.normalMap,t(d.normalMap,m.normalMapTransform),m.normalScale.value.copy(d.normalScale),d.side===1&&m.normalScale.value.negate()),d.displacementMap&&(m.displacementMap.value=d.displacementMap,t(d.displacementMap,m.displacementMapTransform),m.displacementScale.value=d.displacementScale,m.displacementBias.value=d.displacementBias),d.emissiveMap&&(m.emissiveMap.value=d.emissiveMap,t(d.emissiveMap,m.emissiveMapTransform)),d.specularMap&&(m.specularMap.value=d.specularMap,t(d.specularMap,m.specularMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest);const v=e.get(d),b=v.envMap,y=v.envMapRotation;b&&(m.envMap.value=b,zn.copy(y),zn.x*=-1,zn.y*=-1,zn.z*=-1,b.isCubeTexture&&b.isRenderTargetTexture===!1&&(zn.y*=-1,zn.z*=-1),m.envMapRotation.value.setFromMatrix4(Um.makeRotationFromEuler(zn)),m.flipEnvMap.value=b.isCubeTexture&&b.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=d.reflectivity,m.ior.value=d.ior,m.refractionRatio.value=d.refractionRatio),d.lightMap&&(m.lightMap.value=d.lightMap,m.lightMapIntensity.value=d.lightMapIntensity,t(d.lightMap,m.lightMapTransform)),d.aoMap&&(m.aoMap.value=d.aoMap,m.aoMapIntensity.value=d.aoMapIntensity,t(d.aoMap,m.aoMapTransform))}function o(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,d.map&&(m.map.value=d.map,t(d.map,m.mapTransform))}function a(m,d){m.dashSize.value=d.dashSize,m.totalSize.value=d.dashSize+d.gapSize,m.scale.value=d.scale}function l(m,d,v,b){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.size.value=d.size*v,m.scale.value=b*.5,d.map&&(m.map.value=d.map,t(d.map,m.uvTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function c(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.rotation.value=d.rotation,d.map&&(m.map.value=d.map,t(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function h(m,d){m.specular.value.copy(d.specular),m.shininess.value=Math.max(d.shininess,1e-4)}function u(m,d){d.gradientMap&&(m.gradientMap.value=d.gradientMap)}function p(m,d){m.metalness.value=d.metalness,d.metalnessMap&&(m.metalnessMap.value=d.metalnessMap,t(d.metalnessMap,m.metalnessMapTransform)),m.roughness.value=d.roughness,d.roughnessMap&&(m.roughnessMap.value=d.roughnessMap,t(d.roughnessMap,m.roughnessMapTransform)),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)}function f(m,d,v){m.ior.value=d.ior,d.sheen>0&&(m.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),m.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(m.sheenColorMap.value=d.sheenColorMap,t(d.sheenColorMap,m.sheenColorMapTransform)),d.sheenRoughnessMap&&(m.sheenRoughnessMap.value=d.sheenRoughnessMap,t(d.sheenRoughnessMap,m.sheenRoughnessMapTransform))),d.clearcoat>0&&(m.clearcoat.value=d.clearcoat,m.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(m.clearcoatMap.value=d.clearcoatMap,t(d.clearcoatMap,m.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,t(d.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(m.clearcoatNormalMap.value=d.clearcoatNormalMap,t(d.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===1&&m.clearcoatNormalScale.value.negate())),d.dispersion>0&&(m.dispersion.value=d.dispersion),d.iridescence>0&&(m.iridescence.value=d.iridescence,m.iridescenceIOR.value=d.iridescenceIOR,m.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(m.iridescenceMap.value=d.iridescenceMap,t(d.iridescenceMap,m.iridescenceMapTransform)),d.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=d.iridescenceThicknessMap,t(d.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),d.transmission>0&&(m.transmission.value=d.transmission,m.transmissionSamplerMap.value=v.texture,m.transmissionSamplerSize.value.set(v.width,v.height),d.transmissionMap&&(m.transmissionMap.value=d.transmissionMap,t(d.transmissionMap,m.transmissionMapTransform)),m.thickness.value=d.thickness,d.thicknessMap&&(m.thicknessMap.value=d.thicknessMap,t(d.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=d.attenuationDistance,m.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(m.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(m.anisotropyMap.value=d.anisotropyMap,t(d.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=d.specularIntensity,m.specularColor.value.copy(d.specularColor),d.specularColorMap&&(m.specularColorMap.value=d.specularColorMap,t(d.specularColorMap,m.specularColorMapTransform)),d.specularIntensityMap&&(m.specularIntensityMap.value=d.specularIntensityMap,t(d.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,d){d.matcap&&(m.matcap.value=d.matcap)}function _(m,d){const v=e.get(d).light;m.referencePosition.value.setFromMatrixPosition(v.matrixWorld),m.nearDistance.value=v.shadow.camera.near,m.farDistance.value=v.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function Fm(n,e,t,i){let s={},r={},o=[];const a=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(v,b){const y=b.program;i.uniformBlockBinding(v,y)}function c(v,b){let y=s[v.id];y===void 0&&(g(v),y=h(v),s[v.id]=y,v.addEventListener("dispose",m));const N=b.program;i.updateUBOMapping(v,N);const A=e.render.frame;r[v.id]!==A&&(p(v),r[v.id]=A)}function h(v){const b=u();v.__bindingPointIndex=b;const y=n.createBuffer(),N=v.__size,A=v.usage;return n.bindBuffer(n.UNIFORM_BUFFER,y),n.bufferData(n.UNIFORM_BUFFER,N,A),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,b,y),y}function u(){for(let v=0;v<a;v++)if(o.indexOf(v)===-1)return o.push(v),v;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function p(v){const b=s[v.id],y=v.uniforms,N=v.__cache;n.bindBuffer(n.UNIFORM_BUFFER,b);for(let A=0,w=y.length;A<w;A++){const T=Array.isArray(y[A])?y[A]:[y[A]];for(let x=0,M=T.length;x<M;x++){const C=T[x];if(f(C,A,x,N)===!0){const F=C.__offset,D=Array.isArray(C.value)?C.value:[C.value];let U=0;for(let V=0;V<D.length;V++){const H=D[V],ee=_(H);typeof H=="number"||typeof H=="boolean"?(C.__data[0]=H,n.bufferSubData(n.UNIFORM_BUFFER,F+U,C.__data)):H.isMatrix3?(C.__data[0]=H.elements[0],C.__data[1]=H.elements[1],C.__data[2]=H.elements[2],C.__data[3]=0,C.__data[4]=H.elements[3],C.__data[5]=H.elements[4],C.__data[6]=H.elements[5],C.__data[7]=0,C.__data[8]=H.elements[6],C.__data[9]=H.elements[7],C.__data[10]=H.elements[8],C.__data[11]=0):(H.toArray(C.__data,U),U+=ee.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,F,C.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function f(v,b,y,N){const A=v.value,w=b+"_"+y;if(N[w]===void 0)return typeof A=="number"||typeof A=="boolean"?N[w]=A:N[w]=A.clone(),!0;{const T=N[w];if(typeof A=="number"||typeof A=="boolean"){if(T!==A)return N[w]=A,!0}else if(T.equals(A)===!1)return T.copy(A),!0}return!1}function g(v){const b=v.uniforms;let y=0;const N=16;for(let w=0,T=b.length;w<T;w++){const x=Array.isArray(b[w])?b[w]:[b[w]];for(let M=0,C=x.length;M<C;M++){const F=x[M],D=Array.isArray(F.value)?F.value:[F.value];for(let U=0,V=D.length;U<V;U++){const H=D[U],ee=_(H),K=y%N,R=K%ee.boundary,X=K+R;y+=R,X!==0&&N-X<ee.storage&&(y+=N-X),F.__data=new Float32Array(ee.storage/Float32Array.BYTES_PER_ELEMENT),F.__offset=y,y+=ee.storage}}}const A=y%N;return A>0&&(y+=N-A),v.__size=y,v.__cache={},this}function _(v){const b={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(b.boundary=4,b.storage=4):v.isVector2?(b.boundary=8,b.storage=8):v.isVector3||v.isColor?(b.boundary=16,b.storage=12):v.isVector4?(b.boundary=16,b.storage=16):v.isMatrix3?(b.boundary=48,b.storage=48):v.isMatrix4?(b.boundary=64,b.storage=64):v.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",v),b}function m(v){const b=v.target;b.removeEventListener("dispose",m);const y=o.indexOf(b.__bindingPointIndex);o.splice(y,1),n.deleteBuffer(s[b.id]),delete s[b.id],delete r[b.id]}function d(){for(const v in s)n.deleteBuffer(s[v]);o=[],s={},r={}}return{bind:l,update:c,dispose:d}}class ey{constructor(e={}){const{canvas:t=xh(),context:i=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reverseDepthBuffer:p=!1}=e;this.isWebGLRenderer=!0;let f;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=i.getContextAttributes().alpha}else f=o;const g=new Uint32Array(4),_=new Int32Array(4);let m=null,d=null;const v=[],b=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Ot,this.toneMapping=0,this.toneMappingExposure=1;const y=this;let N=!1,A=0,w=0,T=null,x=-1,M=null;const C=new tt,F=new tt;let D=null;const U=new Ne(0);let V=0,H=t.width,ee=t.height,K=1,R=null,X=null;const xe=new tt(0,0,H,ee),Oe=new tt(0,0,H,ee);let Qe=!1;const ne=new Fo;let ue=!1,le=!1;const W=new Ge,ie=new Ge,Le=new L,te=new tt,O={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let j=!1;function se(){return T===null?K:1}let I=i;function ce(E,z){return t.getContext(E,z)}try{const E={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine","three.js r170"),t.addEventListener("webglcontextlost",re,!1),t.addEventListener("webglcontextrestored",Me,!1),t.addEventListener("webglcontextcreationerror",ve,!1),I===null){const z="webgl2";if(I=ce(z,E),I===null)throw ce(z)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(E){throw console.error("THREE.WebGLRenderer: "+E.message),E}let oe,_e,fe,Ue,ye,P,S,k,J,Q,Z,Ee,me,Se,Je,he,we,ke,Be,Te,Ze,je,dt,B;function ge(){oe=new Vf(I),oe.init(),je=new Rm(I,oe),_e=new Ff(I,oe,e,je),fe=new Tm(I,oe),_e.reverseDepthBuffer&&p&&fe.buffers.depth.setReversed(!0),Ue=new Yf(I),ye=new hm,P=new Am(I,oe,fe,ye,_e,je,Ue),S=new Bf(y),k=new Gf(y),J=new $h(I),dt=new Uf(I,J),Q=new Wf(I,J,Ue,dt),Z=new jf(I,Q,J,Ue),Be=new qf(I,_e,P),he=new Of(ye),Ee=new cm(y,S,k,oe,_e,dt,he),me=new km(y,ye),Se=new dm,Je=new ym(oe),ke=new Nf(y,S,k,fe,Z,f,l),we=new Sm(y,Z,_e),B=new Fm(I,Ue,_e,fe),Te=new kf(I,oe,Ue),Ze=new Xf(I,oe,Ue),Ue.programs=Ee.programs,y.capabilities=_e,y.extensions=oe,y.properties=ye,y.renderLists=Se,y.shadowMap=we,y.state=fe,y.info=Ue}ge();const $=new Nm(y,I);this.xr=$,this.getContext=function(){return I},this.getContextAttributes=function(){return I.getContextAttributes()},this.forceContextLoss=function(){const E=oe.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){const E=oe.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return K},this.setPixelRatio=function(E){E!==void 0&&(K=E,this.setSize(H,ee,!1))},this.getSize=function(E){return E.set(H,ee)},this.setSize=function(E,z,Y=!0){if($.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}H=E,ee=z,t.width=Math.floor(E*K),t.height=Math.floor(z*K),Y===!0&&(t.style.width=E+"px",t.style.height=z+"px"),this.setViewport(0,0,E,z)},this.getDrawingBufferSize=function(E){return E.set(H*K,ee*K).floor()},this.setDrawingBufferSize=function(E,z,Y){H=E,ee=z,K=Y,t.width=Math.floor(E*Y),t.height=Math.floor(z*Y),this.setViewport(0,0,E,z)},this.getCurrentViewport=function(E){return E.copy(C)},this.getViewport=function(E){return E.copy(xe)},this.setViewport=function(E,z,Y,q){E.isVector4?xe.set(E.x,E.y,E.z,E.w):xe.set(E,z,Y,q),fe.viewport(C.copy(xe).multiplyScalar(K).round())},this.getScissor=function(E){return E.copy(Oe)},this.setScissor=function(E,z,Y,q){E.isVector4?Oe.set(E.x,E.y,E.z,E.w):Oe.set(E,z,Y,q),fe.scissor(F.copy(Oe).multiplyScalar(K).round())},this.getScissorTest=function(){return Qe},this.setScissorTest=function(E){fe.setScissorTest(Qe=E)},this.setOpaqueSort=function(E){R=E},this.setTransparentSort=function(E){X=E},this.getClearColor=function(E){return E.copy(ke.getClearColor())},this.setClearColor=function(){ke.setClearColor.apply(ke,arguments)},this.getClearAlpha=function(){return ke.getClearAlpha()},this.setClearAlpha=function(){ke.setClearAlpha.apply(ke,arguments)},this.clear=function(E=!0,z=!0,Y=!0){let q=0;if(E){let G=!1;if(T!==null){const de=T.texture.format;G=de===1033||de===1031||de===1029}if(G){const de=T.texture.type,be=de===1009||de===1014||de===1012||de===1020||de===1017||de===1018,Re=ke.getClearColor(),Ce=ke.getClearAlpha(),ze=Re.r,Xe=Re.g,Pe=Re.b;be?(g[0]=ze,g[1]=Xe,g[2]=Pe,g[3]=Ce,I.clearBufferuiv(I.COLOR,0,g)):(_[0]=ze,_[1]=Xe,_[2]=Pe,_[3]=Ce,I.clearBufferiv(I.COLOR,0,_))}else q|=I.COLOR_BUFFER_BIT}z&&(q|=I.DEPTH_BUFFER_BIT),Y&&(q|=I.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),I.clear(q)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",re,!1),t.removeEventListener("webglcontextrestored",Me,!1),t.removeEventListener("webglcontextcreationerror",ve,!1),Se.dispose(),Je.dispose(),ye.dispose(),S.dispose(),k.dispose(),Z.dispose(),dt.dispose(),B.dispose(),Ee.dispose(),$.dispose(),$.removeEventListener("sessionstart",Qo),$.removeEventListener("sessionend",ea),Nn.stop()};function re(E){E.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),N=!0}function Me(){console.log("THREE.WebGLRenderer: Context Restored."),N=!1;const E=Ue.autoReset,z=we.enabled,Y=we.autoUpdate,q=we.needsUpdate,G=we.type;ge(),Ue.autoReset=E,we.enabled=z,we.autoUpdate=Y,we.needsUpdate=q,we.type=G}function ve(E){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function We(E){const z=E.target;z.removeEventListener("dispose",We),Mt(z)}function Mt(E){Pt(E),ye.remove(E)}function Pt(E){const z=ye.get(E).programs;z!==void 0&&(z.forEach(function(Y){Ee.releaseProgram(Y)}),E.isShaderMaterial&&Ee.releaseShaderCache(E))}this.renderBufferDirect=function(E,z,Y,q,G,de){z===null&&(z=O);const be=G.isMesh&&G.matrixWorld.determinant()<0,Re=nh(E,z,Y,q,G);fe.setMaterial(q,be);let Ce=Y.index,ze=1;if(q.wireframe===!0){if(Ce=Q.getWireframeAttribute(Y),Ce===void 0)return;ze=2}const Xe=Y.drawRange,Pe=Y.attributes.position;let et=Xe.start*ze,ft=(Xe.start+Xe.count)*ze;de!==null&&(et=Math.max(et,de.start*ze),ft=Math.min(ft,(de.start+de.count)*ze)),Ce!==null?(et=Math.max(et,0),ft=Math.min(ft,Ce.count)):Pe!=null&&(et=Math.max(et,0),ft=Math.min(ft,Pe.count));const mt=ft-et;if(mt<0||mt===1/0)return;dt.setup(G,q,Re,Y,Ce);let Ft,nt=Te;if(Ce!==null&&(Ft=J.get(Ce),nt=Ze,nt.setIndex(Ft)),G.isMesh)q.wireframe===!0?(fe.setLineWidth(q.wireframeLinewidth*se()),nt.setMode(I.LINES)):nt.setMode(I.TRIANGLES);else if(G.isLine){let Ie=q.linewidth;Ie===void 0&&(Ie=1),fe.setLineWidth(Ie*se()),G.isLineSegments?nt.setMode(I.LINES):G.isLineLoop?nt.setMode(I.LINE_LOOP):nt.setMode(I.LINE_STRIP)}else G.isPoints?nt.setMode(I.POINTS):G.isSprite&&nt.setMode(I.TRIANGLES);if(G.isBatchedMesh)if(G._multiDrawInstances!==null)nt.renderMultiDrawInstances(G._multiDrawStarts,G._multiDrawCounts,G._multiDrawCount,G._multiDrawInstances);else if(oe.get("WEBGL_multi_draw"))nt.renderMultiDraw(G._multiDrawStarts,G._multiDrawCounts,G._multiDrawCount);else{const Ie=G._multiDrawStarts,hn=G._multiDrawCounts,it=G._multiDrawCount,Jt=Ce?J.get(Ce).bytesPerElement:1,Jn=ye.get(q).currentProgram.getUniforms();for(let zt=0;zt<it;zt++)Jn.setValue(I,"_gl_DrawID",zt),nt.render(Ie[zt]/Jt,hn[zt])}else if(G.isInstancedMesh)nt.renderInstances(et,mt,G.count);else if(Y.isInstancedBufferGeometry){const Ie=Y._maxInstanceCount!==void 0?Y._maxInstanceCount:1/0,hn=Math.min(Y.instanceCount,Ie);nt.renderInstances(et,mt,hn)}else nt.render(et,mt)};function rt(E,z,Y){E.transparent===!0&&E.side===2&&E.forceSinglePass===!1?(E.side=1,E.needsUpdate=!0,us(E,z,Y),E.side=0,E.needsUpdate=!0,us(E,z,Y),E.side=2):us(E,z,Y)}this.compile=function(E,z,Y=null){Y===null&&(Y=E),d=Je.get(Y),d.init(z),b.push(d),Y.traverseVisible(function(G){G.isLight&&G.layers.test(z.layers)&&(d.pushLight(G),G.castShadow&&d.pushShadow(G))}),E!==Y&&E.traverseVisible(function(G){G.isLight&&G.layers.test(z.layers)&&(d.pushLight(G),G.castShadow&&d.pushShadow(G))}),d.setupLights();const q=new Set;return E.traverse(function(G){if(!(G.isMesh||G.isPoints||G.isLine||G.isSprite))return;const de=G.material;if(de)if(Array.isArray(de))for(let be=0;be<de.length;be++){const Re=de[be];rt(Re,Y,G),q.add(Re)}else rt(de,Y,G),q.add(de)}),b.pop(),d=null,q},this.compileAsync=function(E,z,Y=null){const q=this.compile(E,z,Y);return new Promise(G=>{function de(){if(q.forEach(function(be){ye.get(be).currentProgram.isReady()&&q.delete(be)}),q.size===0){G(E);return}setTimeout(de,10)}oe.get("KHR_parallel_shader_compile")!==null?de():setTimeout(de,10)})};let Kt=null;function cn(E){Kt&&Kt(E)}function Qo(){Nn.stop()}function ea(){Nn.start()}const Nn=new nc;Nn.setAnimationLoop(cn),typeof self<"u"&&Nn.setContext(self),this.setAnimationLoop=function(E){Kt=E,$.setAnimationLoop(E),E===null?Nn.stop():Nn.start()},$.addEventListener("sessionstart",Qo),$.addEventListener("sessionend",ea),this.render=function(E,z){if(z!==void 0&&z.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(N===!0)return;if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),z.parent===null&&z.matrixWorldAutoUpdate===!0&&z.updateMatrixWorld(),$.enabled===!0&&$.isPresenting===!0&&($.cameraAutoUpdate===!0&&$.updateCamera(z),z=$.getCamera()),E.isScene===!0&&E.onBeforeRender(y,E,z,T),d=Je.get(E,b.length),d.init(z),b.push(d),ie.multiplyMatrices(z.projectionMatrix,z.matrixWorldInverse),ne.setFromProjectionMatrix(ie),le=this.localClippingEnabled,ue=he.init(this.clippingPlanes,le),m=Se.get(E,v.length),m.init(),v.push(m),$.enabled===!0&&$.isPresenting===!0){const de=y.xr.getDepthSensingMesh();de!==null&&br(de,z,-1/0,y.sortObjects)}br(E,z,0,y.sortObjects),m.finish(),y.sortObjects===!0&&m.sort(R,X),j=$.enabled===!1||$.isPresenting===!1||$.hasDepthSensing()===!1,j&&ke.addToRenderList(m,E),this.info.render.frame++,ue===!0&&he.beginShadows();const Y=d.state.shadowsArray;we.render(Y,E,z),ue===!0&&he.endShadows(),this.info.autoReset===!0&&this.info.reset();const q=m.opaque,G=m.transmissive;if(d.setupLights(),z.isArrayCamera){const de=z.cameras;if(G.length>0)for(let be=0,Re=de.length;be<Re;be++){const Ce=de[be];na(q,G,E,Ce)}j&&ke.render(E);for(let be=0,Re=de.length;be<Re;be++){const Ce=de[be];ta(m,E,Ce,Ce.viewport)}}else G.length>0&&na(q,G,E,z),j&&ke.render(E),ta(m,E,z);T!==null&&(P.updateMultisampleRenderTarget(T),P.updateRenderTargetMipmap(T)),E.isScene===!0&&E.onAfterRender(y,E,z),dt.resetDefaultState(),x=-1,M=null,b.pop(),b.length>0?(d=b[b.length-1],ue===!0&&he.setGlobalState(y.clippingPlanes,d.state.camera)):d=null,v.pop(),v.length>0?m=v[v.length-1]:m=null};function br(E,z,Y,q){if(E.visible===!1)return;if(E.layers.test(z.layers)){if(E.isGroup)Y=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(z);else if(E.isLight)d.pushLight(E),E.castShadow&&d.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||ne.intersectsSprite(E)){q&&te.setFromMatrixPosition(E.matrixWorld).applyMatrix4(ie);const be=Z.update(E),Re=E.material;Re.visible&&m.push(E,be,Re,Y,te.z,null)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||ne.intersectsObject(E))){const be=Z.update(E),Re=E.material;if(q&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),te.copy(E.boundingSphere.center)):(be.boundingSphere===null&&be.computeBoundingSphere(),te.copy(be.boundingSphere.center)),te.applyMatrix4(E.matrixWorld).applyMatrix4(ie)),Array.isArray(Re)){const Ce=be.groups;for(let ze=0,Xe=Ce.length;ze<Xe;ze++){const Pe=Ce[ze],et=Re[Pe.materialIndex];et&&et.visible&&m.push(E,be,et,Y,te.z,Pe)}}else Re.visible&&m.push(E,be,Re,Y,te.z,null)}}const de=E.children;for(let be=0,Re=de.length;be<Re;be++)br(de[be],z,Y,q)}function ta(E,z,Y,q){const G=E.opaque,de=E.transmissive,be=E.transparent;d.setupLightsView(Y),ue===!0&&he.setGlobalState(y.clippingPlanes,Y),q&&fe.viewport(C.copy(q)),G.length>0&&hs(G,z,Y),de.length>0&&hs(de,z,Y),be.length>0&&hs(be,z,Y),fe.buffers.depth.setTest(!0),fe.buffers.depth.setMask(!0),fe.buffers.color.setMask(!0),fe.setPolygonOffset(!1)}function na(E,z,Y,q){if((Y.isScene===!0?Y.overrideMaterial:null)!==null)return;d.state.transmissionRenderTarget[q.id]===void 0&&(d.state.transmissionRenderTarget[q.id]=new jn(1,1,{generateMipmaps:!0,type:oe.has("EXT_color_buffer_half_float")||oe.has("EXT_color_buffer_float")?1016:1009,minFilter:1008,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:$e.workingColorSpace}));const de=d.state.transmissionRenderTarget[q.id],be=q.viewport||C;de.setSize(be.z,be.w);const Re=y.getRenderTarget();y.setRenderTarget(de),y.getClearColor(U),V=y.getClearAlpha(),V<1&&y.setClearColor(16777215,.5),y.clear(),j&&ke.render(Y);const Ce=y.toneMapping;y.toneMapping=0;const ze=q.viewport;if(q.viewport!==void 0&&(q.viewport=void 0),d.setupLightsView(q),ue===!0&&he.setGlobalState(y.clippingPlanes,q),hs(E,Y,q),P.updateMultisampleRenderTarget(de),P.updateRenderTargetMipmap(de),oe.has("WEBGL_multisampled_render_to_texture")===!1){let Xe=!1;for(let Pe=0,et=z.length;Pe<et;Pe++){const ft=z[Pe],mt=ft.object,Ft=ft.geometry,nt=ft.material,Ie=ft.group;if(nt.side===2&&mt.layers.test(q.layers)){const hn=nt.side;nt.side=1,nt.needsUpdate=!0,ia(mt,Y,q,Ft,nt,Ie),nt.side=hn,nt.needsUpdate=!0,Xe=!0}}Xe===!0&&(P.updateMultisampleRenderTarget(de),P.updateRenderTargetMipmap(de))}y.setRenderTarget(Re),y.setClearColor(U,V),ze!==void 0&&(q.viewport=ze),y.toneMapping=Ce}function hs(E,z,Y){const q=z.isScene===!0?z.overrideMaterial:null;for(let G=0,de=E.length;G<de;G++){const be=E[G],Re=be.object,Ce=be.geometry,ze=q===null?be.material:q,Xe=be.group;Re.layers.test(Y.layers)&&ia(Re,z,Y,Ce,ze,Xe)}}function ia(E,z,Y,q,G,de){E.onBeforeRender(y,z,Y,q,G,de),E.modelViewMatrix.multiplyMatrices(Y.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),G.onBeforeRender(y,z,Y,q,E,de),G.transparent===!0&&G.side===2&&G.forceSinglePass===!1?(G.side=1,G.needsUpdate=!0,y.renderBufferDirect(Y,z,q,G,E,de),G.side=0,G.needsUpdate=!0,y.renderBufferDirect(Y,z,q,G,E,de),G.side=2):y.renderBufferDirect(Y,z,q,G,E,de),E.onAfterRender(y,z,Y,q,G,de)}function us(E,z,Y){z.isScene!==!0&&(z=O);const q=ye.get(E),G=d.state.lights,de=d.state.shadowsArray,be=G.state.version,Re=Ee.getParameters(E,G.state,de,z,Y),Ce=Ee.getProgramCacheKey(Re);let ze=q.programs;q.environment=E.isMeshStandardMaterial?z.environment:null,q.fog=z.fog,q.envMap=(E.isMeshStandardMaterial?k:S).get(E.envMap||q.environment),q.envMapRotation=q.environment!==null&&E.envMap===null?z.environmentRotation:E.envMapRotation,ze===void 0&&(E.addEventListener("dispose",We),ze=new Map,q.programs=ze);let Xe=ze.get(Ce);if(Xe!==void 0){if(q.currentProgram===Xe&&q.lightsStateVersion===be)return ra(E,Re),Xe}else Re.uniforms=Ee.getUniforms(E),E.onBeforeCompile(Re,y),Xe=Ee.acquireProgram(Re,Ce),ze.set(Ce,Xe),q.uniforms=Re.uniforms;const Pe=q.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(Pe.clippingPlanes=he.uniform),ra(E,Re),q.needsLights=sh(E),q.lightsStateVersion=be,q.needsLights&&(Pe.ambientLightColor.value=G.state.ambient,Pe.lightProbe.value=G.state.probe,Pe.directionalLights.value=G.state.directional,Pe.directionalLightShadows.value=G.state.directionalShadow,Pe.spotLights.value=G.state.spot,Pe.spotLightShadows.value=G.state.spotShadow,Pe.rectAreaLights.value=G.state.rectArea,Pe.ltc_1.value=G.state.rectAreaLTC1,Pe.ltc_2.value=G.state.rectAreaLTC2,Pe.pointLights.value=G.state.point,Pe.pointLightShadows.value=G.state.pointShadow,Pe.hemisphereLights.value=G.state.hemi,Pe.directionalShadowMap.value=G.state.directionalShadowMap,Pe.directionalShadowMatrix.value=G.state.directionalShadowMatrix,Pe.spotShadowMap.value=G.state.spotShadowMap,Pe.spotLightMatrix.value=G.state.spotLightMatrix,Pe.spotLightMap.value=G.state.spotLightMap,Pe.pointShadowMap.value=G.state.pointShadowMap,Pe.pointShadowMatrix.value=G.state.pointShadowMatrix),q.currentProgram=Xe,q.uniformsList=null,Xe}function sa(E){if(E.uniformsList===null){const z=E.currentProgram.getUniforms();E.uniformsList=Ys.seqWithValue(z.seq,E.uniforms)}return E.uniformsList}function ra(E,z){const Y=ye.get(E);Y.outputColorSpace=z.outputColorSpace,Y.batching=z.batching,Y.batchingColor=z.batchingColor,Y.instancing=z.instancing,Y.instancingColor=z.instancingColor,Y.instancingMorph=z.instancingMorph,Y.skinning=z.skinning,Y.morphTargets=z.morphTargets,Y.morphNormals=z.morphNormals,Y.morphColors=z.morphColors,Y.morphTargetsCount=z.morphTargetsCount,Y.numClippingPlanes=z.numClippingPlanes,Y.numIntersection=z.numClipIntersection,Y.vertexAlphas=z.vertexAlphas,Y.vertexTangents=z.vertexTangents,Y.toneMapping=z.toneMapping}function nh(E,z,Y,q,G){z.isScene!==!0&&(z=O),P.resetTextureUnits();const de=z.fog,be=q.isMeshStandardMaterial?z.environment:null,Re=T===null?y.outputColorSpace:T.isXRRenderTarget===!0?T.texture.colorSpace:Pi,Ce=(q.isMeshStandardMaterial?k:S).get(q.envMap||be),ze=q.vertexColors===!0&&!!Y.attributes.color&&Y.attributes.color.itemSize===4,Xe=!!Y.attributes.tangent&&(!!q.normalMap||q.anisotropy>0),Pe=!!Y.morphAttributes.position,et=!!Y.morphAttributes.normal,ft=!!Y.morphAttributes.color;let mt=0;q.toneMapped&&(T===null||T.isXRRenderTarget===!0)&&(mt=y.toneMapping);const Ft=Y.morphAttributes.position||Y.morphAttributes.normal||Y.morphAttributes.color,nt=Ft!==void 0?Ft.length:0,Ie=ye.get(q),hn=d.state.lights;if(ue===!0&&(le===!0||E!==M)){const Xt=E===M&&q.id===x;he.setState(q,E,Xt)}let it=!1;q.version===Ie.__version?(Ie.needsLights&&Ie.lightsStateVersion!==hn.state.version||Ie.outputColorSpace!==Re||G.isBatchedMesh&&Ie.batching===!1||!G.isBatchedMesh&&Ie.batching===!0||G.isBatchedMesh&&Ie.batchingColor===!0&&G.colorTexture===null||G.isBatchedMesh&&Ie.batchingColor===!1&&G.colorTexture!==null||G.isInstancedMesh&&Ie.instancing===!1||!G.isInstancedMesh&&Ie.instancing===!0||G.isSkinnedMesh&&Ie.skinning===!1||!G.isSkinnedMesh&&Ie.skinning===!0||G.isInstancedMesh&&Ie.instancingColor===!0&&G.instanceColor===null||G.isInstancedMesh&&Ie.instancingColor===!1&&G.instanceColor!==null||G.isInstancedMesh&&Ie.instancingMorph===!0&&G.morphTexture===null||G.isInstancedMesh&&Ie.instancingMorph===!1&&G.morphTexture!==null||Ie.envMap!==Ce||q.fog===!0&&Ie.fog!==de||Ie.numClippingPlanes!==void 0&&(Ie.numClippingPlanes!==he.numPlanes||Ie.numIntersection!==he.numIntersection)||Ie.vertexAlphas!==ze||Ie.vertexTangents!==Xe||Ie.morphTargets!==Pe||Ie.morphNormals!==et||Ie.morphColors!==ft||Ie.toneMapping!==mt||Ie.morphTargetsCount!==nt)&&(it=!0):(it=!0,Ie.__version=q.version);let Jt=Ie.currentProgram;it===!0&&(Jt=us(q,z,G));let Jn=!1,zt=!1,Fi=!1;const gt=Jt.getUniforms(),sn=Ie.uniforms;if(fe.useProgram(Jt.program)&&(Jn=!0,zt=!0,Fi=!0),q.id!==x&&(x=q.id,zt=!0),Jn||M!==E){fe.buffers.depth.getReversed()?(W.copy(E.projectionMatrix),wh(W),Th(W),gt.setValue(I,"projectionMatrix",W)):gt.setValue(I,"projectionMatrix",E.projectionMatrix),gt.setValue(I,"viewMatrix",E.matrixWorldInverse);const Mn=gt.map.cameraPosition;Mn!==void 0&&Mn.setValue(I,Le.setFromMatrixPosition(E.matrixWorld)),_e.logarithmicDepthBuffer&&gt.setValue(I,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(q.isMeshPhongMaterial||q.isMeshToonMaterial||q.isMeshLambertMaterial||q.isMeshBasicMaterial||q.isMeshStandardMaterial||q.isShaderMaterial)&&gt.setValue(I,"isOrthographic",E.isOrthographicCamera===!0),M!==E&&(M=E,zt=!0,Fi=!0)}if(G.isSkinnedMesh){gt.setOptional(I,G,"bindMatrix"),gt.setOptional(I,G,"bindMatrixInverse");const Xt=G.skeleton;Xt&&(Xt.boneTexture===null&&Xt.computeBoneTexture(),gt.setValue(I,"boneTexture",Xt.boneTexture,P))}G.isBatchedMesh&&(gt.setOptional(I,G,"batchingTexture"),gt.setValue(I,"batchingTexture",G._matricesTexture,P),gt.setOptional(I,G,"batchingIdTexture"),gt.setValue(I,"batchingIdTexture",G._indirectTexture,P),gt.setOptional(I,G,"batchingColorTexture"),G._colorsTexture!==null&&gt.setValue(I,"batchingColorTexture",G._colorsTexture,P));const Oi=Y.morphAttributes;if((Oi.position!==void 0||Oi.normal!==void 0||Oi.color!==void 0)&&Be.update(G,Y,Jt),(zt||Ie.receiveShadow!==G.receiveShadow)&&(Ie.receiveShadow=G.receiveShadow,gt.setValue(I,"receiveShadow",G.receiveShadow)),q.isMeshGouraudMaterial&&q.envMap!==null&&(sn.envMap.value=Ce,sn.flipEnvMap.value=Ce.isCubeTexture&&Ce.isRenderTargetTexture===!1?-1:1),q.isMeshStandardMaterial&&q.envMap===null&&z.environment!==null&&(sn.envMapIntensity.value=z.environmentIntensity),zt&&(gt.setValue(I,"toneMappingExposure",y.toneMappingExposure),Ie.needsLights&&ih(sn,Fi),de&&q.fog===!0&&me.refreshFogUniforms(sn,de),me.refreshMaterialUniforms(sn,q,K,ee,d.state.transmissionRenderTarget[E.id]),Ys.upload(I,sa(Ie),sn,P)),q.isShaderMaterial&&q.uniformsNeedUpdate===!0&&(Ys.upload(I,sa(Ie),sn,P),q.uniformsNeedUpdate=!1),q.isSpriteMaterial&&gt.setValue(I,"center",G.center),gt.setValue(I,"modelViewMatrix",G.modelViewMatrix),gt.setValue(I,"normalMatrix",G.normalMatrix),gt.setValue(I,"modelMatrix",G.matrixWorld),q.isShaderMaterial||q.isRawShaderMaterial){const Xt=q.uniformsGroups;for(let Mn=0,xn=Xt.length;Mn<xn;Mn++){const oa=Xt[Mn];B.update(oa,Jt),B.bind(oa,Jt)}}return Jt}function ih(E,z){E.ambientLightColor.needsUpdate=z,E.lightProbe.needsUpdate=z,E.directionalLights.needsUpdate=z,E.directionalLightShadows.needsUpdate=z,E.pointLights.needsUpdate=z,E.pointLightShadows.needsUpdate=z,E.spotLights.needsUpdate=z,E.spotLightShadows.needsUpdate=z,E.rectAreaLights.needsUpdate=z,E.hemisphereLights.needsUpdate=z}function sh(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return A},this.getActiveMipmapLevel=function(){return w},this.getRenderTarget=function(){return T},this.setRenderTargetTextures=function(E,z,Y){ye.get(E.texture).__webglTexture=z,ye.get(E.depthTexture).__webglTexture=Y;const q=ye.get(E);q.__hasExternalTextures=!0,q.__autoAllocateDepthBuffer=Y===void 0,q.__autoAllocateDepthBuffer||oe.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),q.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(E,z){const Y=ye.get(E);Y.__webglFramebuffer=z,Y.__useDefaultFramebuffer=z===void 0},this.setRenderTarget=function(E,z=0,Y=0){T=E,A=z,w=Y;let q=!0,G=null,de=!1,be=!1;if(E){const Ce=ye.get(E);if(Ce.__useDefaultFramebuffer!==void 0)fe.bindFramebuffer(I.FRAMEBUFFER,null),q=!1;else if(Ce.__webglFramebuffer===void 0)P.setupRenderTarget(E);else if(Ce.__hasExternalTextures)P.rebindTextures(E,ye.get(E.texture).__webglTexture,ye.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){const Pe=E.depthTexture;if(Ce.__boundDepthTexture!==Pe){if(Pe!==null&&ye.has(Pe)&&(E.width!==Pe.image.width||E.height!==Pe.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");P.setupDepthRenderbuffer(E)}}const ze=E.texture;(ze.isData3DTexture||ze.isDataArrayTexture||ze.isCompressedArrayTexture)&&(be=!0);const Xe=ye.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(Xe[z])?G=Xe[z][Y]:G=Xe[z],de=!0):E.samples>0&&P.useMultisampledRTT(E)===!1?G=ye.get(E).__webglMultisampledFramebuffer:Array.isArray(Xe)?G=Xe[Y]:G=Xe,C.copy(E.viewport),F.copy(E.scissor),D=E.scissorTest}else C.copy(xe).multiplyScalar(K).floor(),F.copy(Oe).multiplyScalar(K).floor(),D=Qe;if(fe.bindFramebuffer(I.FRAMEBUFFER,G)&&q&&fe.drawBuffers(E,G),fe.viewport(C),fe.scissor(F),fe.setScissorTest(D),de){const Ce=ye.get(E.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_CUBE_MAP_POSITIVE_X+z,Ce.__webglTexture,Y)}else if(be){const Ce=ye.get(E.texture),ze=z||0;I.framebufferTextureLayer(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,Ce.__webglTexture,Y||0,ze)}x=-1},this.readRenderTargetPixels=function(E,z,Y,q,G,de,be){if(!(E&&E.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Re=ye.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&be!==void 0&&(Re=Re[be]),Re){fe.bindFramebuffer(I.FRAMEBUFFER,Re);try{const Ce=E.texture,ze=Ce.format,Xe=Ce.type;if(!_e.textureFormatReadable(ze)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!_e.textureTypeReadable(Xe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}z>=0&&z<=E.width-q&&Y>=0&&Y<=E.height-G&&I.readPixels(z,Y,q,G,je.convert(ze),je.convert(Xe),de)}finally{const Ce=T!==null?ye.get(T).__webglFramebuffer:null;fe.bindFramebuffer(I.FRAMEBUFFER,Ce)}}},this.readRenderTargetPixelsAsync=async function(E,z,Y,q,G,de,be){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Re=ye.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&be!==void 0&&(Re=Re[be]),Re){const Ce=E.texture,ze=Ce.format,Xe=Ce.type;if(!_e.textureFormatReadable(ze))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!_e.textureTypeReadable(Xe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(z>=0&&z<=E.width-q&&Y>=0&&Y<=E.height-G){fe.bindFramebuffer(I.FRAMEBUFFER,Re);const Pe=I.createBuffer();I.bindBuffer(I.PIXEL_PACK_BUFFER,Pe),I.bufferData(I.PIXEL_PACK_BUFFER,de.byteLength,I.STREAM_READ),I.readPixels(z,Y,q,G,je.convert(ze),je.convert(Xe),0);const et=T!==null?ye.get(T).__webglFramebuffer:null;fe.bindFramebuffer(I.FRAMEBUFFER,et);const ft=I.fenceSync(I.SYNC_GPU_COMMANDS_COMPLETE,0);return I.flush(),await Sh(I,ft,4),I.bindBuffer(I.PIXEL_PACK_BUFFER,Pe),I.getBufferSubData(I.PIXEL_PACK_BUFFER,0,de),I.deleteBuffer(Pe),I.deleteSync(ft),de}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(E,z=null,Y=0){E.isTexture!==!0&&(Zi("WebGLRenderer: copyFramebufferToTexture function signature has changed."),z=arguments[0]||null,E=arguments[1]);const q=Math.pow(2,-Y),G=Math.floor(E.image.width*q),de=Math.floor(E.image.height*q),be=z!==null?z.x:0,Re=z!==null?z.y:0;P.setTexture2D(E,0),I.copyTexSubImage2D(I.TEXTURE_2D,Y,0,0,be,Re,G,de),fe.unbindTexture()},this.copyTextureToTexture=function(E,z,Y=null,q=null,G=0){E.isTexture!==!0&&(Zi("WebGLRenderer: copyTextureToTexture function signature has changed."),q=arguments[0]||null,E=arguments[1],z=arguments[2],G=arguments[3]||0,Y=null);let de,be,Re,Ce,ze,Xe,Pe,et,ft;const mt=E.isCompressedTexture?E.mipmaps[G]:E.image;Y!==null?(de=Y.max.x-Y.min.x,be=Y.max.y-Y.min.y,Re=Y.isBox3?Y.max.z-Y.min.z:1,Ce=Y.min.x,ze=Y.min.y,Xe=Y.isBox3?Y.min.z:0):(de=mt.width,be=mt.height,Re=mt.depth||1,Ce=0,ze=0,Xe=0),q!==null?(Pe=q.x,et=q.y,ft=q.z):(Pe=0,et=0,ft=0);const Ft=je.convert(z.format),nt=je.convert(z.type);let Ie;z.isData3DTexture?(P.setTexture3D(z,0),Ie=I.TEXTURE_3D):z.isDataArrayTexture||z.isCompressedArrayTexture?(P.setTexture2DArray(z,0),Ie=I.TEXTURE_2D_ARRAY):(P.setTexture2D(z,0),Ie=I.TEXTURE_2D),I.pixelStorei(I.UNPACK_FLIP_Y_WEBGL,z.flipY),I.pixelStorei(I.UNPACK_PREMULTIPLY_ALPHA_WEBGL,z.premultiplyAlpha),I.pixelStorei(I.UNPACK_ALIGNMENT,z.unpackAlignment);const hn=I.getParameter(I.UNPACK_ROW_LENGTH),it=I.getParameter(I.UNPACK_IMAGE_HEIGHT),Jt=I.getParameter(I.UNPACK_SKIP_PIXELS),Jn=I.getParameter(I.UNPACK_SKIP_ROWS),zt=I.getParameter(I.UNPACK_SKIP_IMAGES);I.pixelStorei(I.UNPACK_ROW_LENGTH,mt.width),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,mt.height),I.pixelStorei(I.UNPACK_SKIP_PIXELS,Ce),I.pixelStorei(I.UNPACK_SKIP_ROWS,ze),I.pixelStorei(I.UNPACK_SKIP_IMAGES,Xe);const Fi=E.isDataArrayTexture||E.isData3DTexture,gt=z.isDataArrayTexture||z.isData3DTexture;if(E.isRenderTargetTexture||E.isDepthTexture){const sn=ye.get(E),Oi=ye.get(z),Xt=ye.get(sn.__renderTarget),Mn=ye.get(Oi.__renderTarget);fe.bindFramebuffer(I.READ_FRAMEBUFFER,Xt.__webglFramebuffer),fe.bindFramebuffer(I.DRAW_FRAMEBUFFER,Mn.__webglFramebuffer);for(let xn=0;xn<Re;xn++)Fi&&I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,ye.get(E).__webglTexture,G,Xe+xn),E.isDepthTexture?(gt&&I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,ye.get(z).__webglTexture,G,ft+xn),I.blitFramebuffer(Ce,ze,de,be,Pe,et,de,be,I.DEPTH_BUFFER_BIT,I.NEAREST)):gt?I.copyTexSubImage3D(Ie,G,Pe,et,ft+xn,Ce,ze,de,be):I.copyTexSubImage2D(Ie,G,Pe,et,ft+xn,Ce,ze,de,be);fe.bindFramebuffer(I.READ_FRAMEBUFFER,null),fe.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else gt?E.isDataTexture||E.isData3DTexture?I.texSubImage3D(Ie,G,Pe,et,ft,de,be,Re,Ft,nt,mt.data):z.isCompressedArrayTexture?I.compressedTexSubImage3D(Ie,G,Pe,et,ft,de,be,Re,Ft,mt.data):I.texSubImage3D(Ie,G,Pe,et,ft,de,be,Re,Ft,nt,mt):E.isDataTexture?I.texSubImage2D(I.TEXTURE_2D,G,Pe,et,de,be,Ft,nt,mt.data):E.isCompressedTexture?I.compressedTexSubImage2D(I.TEXTURE_2D,G,Pe,et,mt.width,mt.height,Ft,mt.data):I.texSubImage2D(I.TEXTURE_2D,G,Pe,et,de,be,Ft,nt,mt);I.pixelStorei(I.UNPACK_ROW_LENGTH,hn),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,it),I.pixelStorei(I.UNPACK_SKIP_PIXELS,Jt),I.pixelStorei(I.UNPACK_SKIP_ROWS,Jn),I.pixelStorei(I.UNPACK_SKIP_IMAGES,zt),G===0&&z.generateMipmaps&&I.generateMipmap(Ie),fe.unbindTexture()},this.copyTextureToTexture3D=function(E,z,Y=null,q=null,G=0){return E.isTexture!==!0&&(Zi("WebGLRenderer: copyTextureToTexture3D function signature has changed."),Y=arguments[0]||null,q=arguments[1]||null,E=arguments[2],z=arguments[3],G=arguments[4]||0),Zi('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(E,z,Y,q,G)},this.initRenderTarget=function(E){ye.get(E).__webglFramebuffer===void 0&&P.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?P.setTextureCube(E,0):E.isData3DTexture?P.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?P.setTexture2DArray(E,0):P.setTexture2D(E,0),fe.unbindTexture()},this.resetState=function(){A=0,w=0,T=null,fe.reset(),dt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return 2e3}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorspace=$e._getDrawingBufferColorSpace(e),t.unpackColorSpace=$e._getUnpackColorSpace()}}class cc{constructor(e,t=1,i=1e3){this.isFog=!0,this.name="",this.color=new Ne(e),this.near=t,this.far=i}clone(){return new cc(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class ty extends bt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new nn,this.environmentIntensity=1,this.environmentRotation=new nn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Om{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=35044,this.updateRanges=[],this.version=0,this.uuid=jt()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[i+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=jt()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=jt()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const Ut=new L;class Zs{constructor(e,t,i,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=i,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,i=this.data.count;t<i;t++)Ut.fromBufferAttribute(this,t),Ut.applyMatrix4(e),this.setXYZ(t,Ut.x,Ut.y,Ut.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Ut.fromBufferAttribute(this,t),Ut.applyNormalMatrix(e),this.setXYZ(t,Ut.x,Ut.y,Ut.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Ut.fromBufferAttribute(this,t),Ut.transformDirection(e),this.setXYZ(t,Ut.x,Ut.y,Ut.z);return this}getComponent(e,t){let i=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(i=en(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=at(i,this.array)),this.data.array[e*this.data.stride+this.offset+t]=i,this}setX(e,t){return this.normalized&&(t=at(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=at(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=at(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=at(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=en(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=en(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=en(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=en(t,this.array)),t}setXY(e,t,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=at(t,this.array),i=at(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this}setXYZ(e,t,i,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=at(t,this.array),i=at(i,this.array),s=at(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=at(t,this.array),i=at(i,this.array),s=at(s,this.array),r=at(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const s=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new Nt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new Zs(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const s=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class hc extends bn{static get type(){return"SpriteMaterial"}constructor(e){super(),this.isSpriteMaterial=!0,this.color=new Ne(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let hi;const Vi=new L,ui=new L,di=new L,fi=new ae,Wi=new ae,uc=new Ge,Is=new L,Xi=new L,Ds=new L,tl=new ae,jr=new ae,nl=new ae;class Bm extends bt{constructor(e=new hc){if(super(),this.isSprite=!0,this.type="Sprite",hi===void 0){hi=new yt;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new Om(t,5);hi.setIndex([0,1,2,0,2,3]),hi.setAttribute("position",new Zs(i,3,0,!1)),hi.setAttribute("uv",new Zs(i,2,3,!1))}this.geometry=hi,this.material=e,this.center=new ae(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),ui.setFromMatrixScale(this.matrixWorld),uc.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),di.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&ui.multiplyScalar(-di.z);const i=this.material.rotation;let s,r;i!==0&&(r=Math.cos(i),s=Math.sin(i));const o=this.center;Ns(Is.set(-.5,-.5,0),di,o,ui,s,r),Ns(Xi.set(.5,-.5,0),di,o,ui,s,r),Ns(Ds.set(.5,.5,0),di,o,ui,s,r),tl.set(0,0),jr.set(1,0),nl.set(1,1);let a=e.ray.intersectTriangle(Is,Xi,Ds,!1,Vi);if(a===null&&(Ns(Xi.set(-.5,.5,0),di,o,ui,s,r),jr.set(0,1),a=e.ray.intersectTriangle(Is,Ds,Xi,!1,Vi),a===null))return;const l=e.ray.origin.distanceTo(Vi);l<e.near||l>e.far||t.push({distance:l,point:Vi.clone(),uv:qt.getInterpolation(Vi,Is,Xi,Ds,tl,jr,nl,new ae),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function Ns(n,e,t,i,s,r){fi.subVectors(n,t).addScalar(.5).multiply(i),s!==void 0?(Wi.x=r*fi.x-s*fi.y,Wi.y=s*fi.x+r*fi.y):Wi.copy(fi),n.copy(e),n.x+=Wi.x,n.y+=Wi.y,n.applyMatrix4(uc)}const il=new L,sl=new tt,rl=new tt,zm=new L,ol=new Ge,Us=new L,Kr=new vn,al=new Ge,Jr=new ls;class qs extends ut{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=aa,this.bindMatrix=new Ge,this.bindMatrixInverse=new Ge,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Dn),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let i=0;i<t.count;i++)this.getVertexPosition(i,Us),this.boundingBox.expandByPoint(Us)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new vn),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let i=0;i<t.count;i++)this.getVertexPosition(i,Us),this.boundingSphere.expandByPoint(Us)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const i=this.material,s=this.matrixWorld;i!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Kr.copy(this.boundingSphere),Kr.applyMatrix4(s),e.ray.intersectsSphere(Kr)!==!1&&(al.copy(s).invert(),Jr.copy(e.ray).applyMatrix4(al),!(this.boundingBox!==null&&Jr.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Jr)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new tt,t=this.geometry.attributes.skinWeight;for(let i=0,s=t.count;i<s;i++){e.fromBufferAttribute(t,i);const r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(i,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===aa?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===rh?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const i=this.skeleton,s=this.geometry;sl.fromBufferAttribute(s.attributes.skinIndex,e),rl.fromBufferAttribute(s.attributes.skinWeight,e),il.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let r=0;r<4;r++){const o=rl.getComponent(r);if(o!==0){const a=sl.getComponent(r);ol.multiplyMatrices(i.bones[a].matrixWorld,i.boneInverses[a]),t.addScaledVector(zm.copy(il).applyMatrix4(ol),o)}}return t.applyMatrix4(this.bindMatrixInverse)}}class dc extends bt{constructor(){super(),this.isBone=!0,this.type="Bone"}}class hr extends Ct{constructor(e=null,t=1,i=1,s,r,o,a,l,c=1003,h=1003,u,p){super(null,o,a,l,c,h,s,r,u,p),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const ll=new Ge,Hm=new Ge;class Bo{constructor(e=[],t=[]){this.uuid=jt(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let i=0,s=this.bones.length;i<s;i++)this.boneInverses.push(new Ge)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const i=new Ge;this.bones[e]&&i.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(i)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const i=this.bones[e];i&&i.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const i=this.bones[e];i&&(i.parent&&i.parent.isBone?(i.matrix.copy(i.parent.matrixWorld).invert(),i.matrix.multiply(i.matrixWorld)):i.matrix.copy(i.matrixWorld),i.matrix.decompose(i.position,i.quaternion,i.scale))}}update(){const e=this.bones,t=this.boneInverses,i=this.boneMatrices,s=this.boneTexture;for(let r=0,o=e.length;r<o;r++){const a=e[r]?e[r].matrixWorld:Hm;ll.multiplyMatrices(a,t[r]),ll.toArray(i,r*16)}s!==null&&(s.needsUpdate=!0)}clone(){return new Bo(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const i=new hr(t,e,e,1023,1015);return i.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=i,this}getBoneByName(e){for(let t=0,i=this.bones.length;t<i;t++){const s=this.bones[t];if(s.name===e)return s}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let i=0,s=e.bones.length;i<s;i++){const r=e.bones[i];let o=t[r];o===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",r),o=new dc),this.bones.push(o),this.boneInverses.push(new Ge().fromArray(e.boneInverses[i]))}return this.init(),this}toJSON(){const e={metadata:{version:4.6,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,i=this.boneInverses;for(let s=0,r=t.length;s<r;s++){const o=t[s];e.bones.push(o.uuid);const a=i[s];e.boneInverses.push(a.toArray())}return e}}class cl extends Nt{constructor(e,t,i,s=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const pi=new Ge,hl=new Ge,ks=[],ul=new Dn,Gm=new Ge,Yi=new ut,qi=new vn;class ny extends ut{constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new cl(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<i;s++)this.setMatrixAt(s,Gm)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Dn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,pi),ul.copy(e.boundingBox).applyMatrix4(pi),this.boundingBox.union(ul)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new vn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,pi),qi.copy(e.boundingSphere).applyMatrix4(pi),this.boundingSphere.union(qi)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const i=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=i.length+1,o=e*r+1;for(let a=0;a<i.length;a++)i[a]=s[o+a]}raycast(e,t){const i=this.matrixWorld,s=this.count;if(Yi.geometry=this.geometry,Yi.material=this.material,Yi.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),qi.copy(this.boundingSphere),qi.applyMatrix4(i),e.ray.intersectsSphere(qi)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,pi),hl.multiplyMatrices(i,pi),Yi.matrixWorld=hl,Yi.raycast(e,ks);for(let o=0,a=ks.length;o<a;o++){const l=ks[o];l.instanceId=r,l.object=this,t.push(l)}ks.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new cl(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const i=t.morphTargetInfluences,s=i.length+1;this.morphTexture===null&&(this.morphTexture=new hr(new Float32Array(s*this.count),s,this.count,1028,1015));const r=this.morphTexture.source.data.data;let o=0;for(let c=0;c<i.length;c++)o+=i[c];const a=this.geometry.morphTargetsRelative?1:1-o,l=s*e;r[l]=a,r.set(i,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class Vm extends bn{static get type(){return"LineBasicMaterial"}constructor(e){super(),this.isLineBasicMaterial=!0,this.color=new Ne(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const $s=new L,Qs=new L,dl=new Ge,ji=new ls,Fs=new vn,Zr=new L,fl=new L;class fc extends bt{constructor(e=new yt,t=new Vm){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[0];for(let s=1,r=t.count;s<r;s++)$s.fromBufferAttribute(t,s-1),Qs.fromBufferAttribute(t,s),i[s]=i[s-1],i[s]+=$s.distanceTo(Qs);e.setAttribute("lineDistance",new qe(i,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const i=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Fs.copy(i.boundingSphere),Fs.applyMatrix4(s),Fs.radius+=r,e.ray.intersectsSphere(Fs)===!1)return;dl.copy(s).invert(),ji.copy(e.ray).applyMatrix4(dl);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,h=i.index,p=i.attributes.position;if(h!==null){const f=Math.max(0,o.start),g=Math.min(h.count,o.start+o.count);for(let _=f,m=g-1;_<m;_+=c){const d=h.getX(_),v=h.getX(_+1),b=Os(this,e,ji,l,d,v);b&&t.push(b)}if(this.isLineLoop){const _=h.getX(g-1),m=h.getX(f),d=Os(this,e,ji,l,_,m);d&&t.push(d)}}else{const f=Math.max(0,o.start),g=Math.min(p.count,o.start+o.count);for(let _=f,m=g-1;_<m;_+=c){const d=Os(this,e,ji,l,_,_+1);d&&t.push(d)}if(this.isLineLoop){const _=Os(this,e,ji,l,g-1,f);_&&t.push(_)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function Os(n,e,t,i,s,r){const o=n.geometry.attributes.position;if($s.fromBufferAttribute(o,s),Qs.fromBufferAttribute(o,r),t.distanceSqToSegment($s,Qs,Zr,fl)>i)return;Zr.applyMatrix4(n.matrixWorld);const l=e.ray.origin.distanceTo(Zr);if(!(l<e.near||l>e.far))return{distance:l,point:fl.clone().applyMatrix4(n.matrixWorld),index:s,face:null,faceIndex:null,barycoord:null,object:n}}const pl=new L,ml=new L;class iy extends fc{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[];for(let s=0,r=t.count;s<r;s+=2)pl.fromBufferAttribute(t,s),ml.fromBufferAttribute(t,s+1),i[s]=s===0?0:i[s-1],i[s+1]=i[s]+pl.distanceTo(ml);e.setAttribute("lineDistance",new qe(i,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class sy extends fc{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class pc extends bn{static get type(){return"PointsMaterial"}constructor(e){super(),this.isPointsMaterial=!0,this.color=new Ne(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const gl=new Ge,po=new ls,Bs=new vn,zs=new L;class Wm extends bt{constructor(e=new yt,t=new pc){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const i=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Bs.copy(i.boundingSphere),Bs.applyMatrix4(s),Bs.radius+=r,e.ray.intersectsSphere(Bs)===!1)return;gl.copy(s).invert(),po.copy(e.ray).applyMatrix4(gl);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=i.index,u=i.attributes.position;if(c!==null){const p=Math.max(0,o.start),f=Math.min(c.count,o.start+o.count);for(let g=p,_=f;g<_;g++){const m=c.getX(g);zs.fromBufferAttribute(u,m),_l(zs,m,l,s,e,t,this)}}else{const p=Math.max(0,o.start),f=Math.min(u.count,o.start+o.count);for(let g=p,_=f;g<_;g++)zs.fromBufferAttribute(u,g),_l(zs,g,l,s,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function _l(n,e,t,i,s,r,o){const a=po.distanceSqToPoint(n);if(a<t){const l=new L;po.closestPointToPoint(n,l),l.applyMatrix4(i);const c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}class ry extends Ct{constructor(e,t,i,s,r,o,a,l,c){super(e,t,i,s,r,o,a,l,c),this.isVideoTexture=!0,this.minFilter=o!==void 0?o:1006,this.magFilter=r!==void 0?r:1006,this.generateMipmaps=!1;const h=this;function u(){h.needsUpdate=!0,e.requestVideoFrameCallback(u)}"requestVideoFrameCallback"in e&&e.requestVideoFrameCallback(u)}clone(){return new this.constructor(this.image).copy(this)}update(){const e=this.image;"requestVideoFrameCallback"in e===!1&&e.readyState>=e.HAVE_CURRENT_DATA&&(this.needsUpdate=!0)}}class Xm extends Ct{constructor(e,t,i,s,r,o,a,l,c){super(e,t,i,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class an{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){const i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){const t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){const t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let i,s=this.getPoint(0),r=0;t.push(0);for(let o=1;o<=e;o++)i=this.getPoint(o/e),r+=i.distanceTo(s),t.push(r),s=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){const i=this.getLengths();let s=0;const r=i.length;let o;t?o=t:o=e*i[r-1];let a=0,l=r-1,c;for(;a<=l;)if(s=Math.floor(a+(l-a)/2),c=i[s]-o,c<0)a=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,i[s]===o)return s/(r-1);const h=i[s],p=i[s+1]-h,f=(o-h)/p;return(s+f)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);const o=this.getPoint(s),a=this.getPoint(r),l=t||(o.isVector2?new ae:new L);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){const i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t){const i=new L,s=[],r=[],o=[],a=new L,l=new Ge;for(let f=0;f<=e;f++){const g=f/e;s[f]=this.getTangentAt(g,new L)}r[0]=new L,o[0]=new L;let c=Number.MAX_VALUE;const h=Math.abs(s[0].x),u=Math.abs(s[0].y),p=Math.abs(s[0].z);h<=c&&(c=h,i.set(1,0,0)),u<=c&&(c=u,i.set(0,1,0)),p<=c&&i.set(0,0,1),a.crossVectors(s[0],i).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let f=1;f<=e;f++){if(r[f]=r[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(s[f-1],s[f]),a.length()>Number.EPSILON){a.normalize();const g=Math.acos(Tt(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(a,g))}o[f].crossVectors(s[f],r[f])}if(t===!0){let f=Math.acos(Tt(r[0].dot(r[e]),-1,1));f/=e,s[0].dot(a.crossVectors(r[0],r[e]))>0&&(f=-f);for(let g=1;g<=e;g++)r[g].applyMatrix4(l.makeRotationAxis(s[g],f*g)),o[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class zo extends an{constructor(e=0,t=0,i=1,s=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t=new ae){const i=t,s=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);const a=this.aStartAngle+e*r;let l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){const h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),p=l-this.aX,f=c-this.aY;l=p*h-f*u+this.aX,c=p*u+f*h+this.aY}return i.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class Ym extends zo{constructor(e,t,i,s,r,o){super(e,t,i,i,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}}function Ho(){let n=0,e=0,t=0,i=0;function s(r,o,a,l){n=r,e=a,t=-3*r+3*o-2*a-l,i=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){s(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,h,u){let p=(o-r)/c-(a-r)/(c+h)+(a-o)/h,f=(a-o)/h-(l-o)/(h+u)+(l-a)/u;p*=h,f*=h,s(o,a,p,f)},calc:function(r){const o=r*r,a=o*r;return n+e*r+t*o+i*a}}}const Hs=new L,$r=new Ho,Qr=new Ho,eo=new Ho;class qm extends an{constructor(e=[],t=!1,i="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=s}getPoint(e,t=new L){const i=t,s=this.points,r=s.length,o=(r-(this.closed?0:1))*e;let a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,h;this.closed||a>0?c=s[(a-1)%r]:(Hs.subVectors(s[0],s[1]).add(s[0]),c=Hs);const u=s[a%r],p=s[(a+1)%r];if(this.closed||a+2<r?h=s[(a+2)%r]:(Hs.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=Hs),this.curveType==="centripetal"||this.curveType==="chordal"){const f=this.curveType==="chordal"?.5:.25;let g=Math.pow(c.distanceToSquared(u),f),_=Math.pow(u.distanceToSquared(p),f),m=Math.pow(p.distanceToSquared(h),f);_<1e-4&&(_=1),g<1e-4&&(g=_),m<1e-4&&(m=_),$r.initNonuniformCatmullRom(c.x,u.x,p.x,h.x,g,_,m),Qr.initNonuniformCatmullRom(c.y,u.y,p.y,h.y,g,_,m),eo.initNonuniformCatmullRom(c.z,u.z,p.z,h.z,g,_,m)}else this.curveType==="catmullrom"&&($r.initCatmullRom(c.x,u.x,p.x,h.x,this.tension),Qr.initCatmullRom(c.y,u.y,p.y,h.y,this.tension),eo.initCatmullRom(c.z,u.z,p.z,h.z,this.tension));return i.set($r.calc(l),Qr.calc(l),eo.calc(l)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){const s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const s=e.points[t];this.points.push(new L().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function yl(n,e,t,i,s){const r=(i-e)*.5,o=(s-t)*.5,a=n*n,l=n*a;return(2*t-2*i+r+o)*l+(-3*t+3*i-2*r-o)*a+r*n+t}function jm(n,e){const t=1-n;return t*t*e}function Km(n,e){return 2*(1-n)*n*e}function Jm(n,e){return n*n*e}function ns(n,e,t,i){return jm(n,e)+Km(n,t)+Jm(n,i)}function Zm(n,e){const t=1-n;return t*t*t*e}function $m(n,e){const t=1-n;return 3*t*t*n*e}function Qm(n,e){return 3*(1-n)*n*n*e}function e0(n,e){return n*n*n*e}function is(n,e,t,i,s){return Zm(n,e)+$m(n,t)+Qm(n,i)+e0(n,s)}class mc extends an{constructor(e=new ae,t=new ae,i=new ae,s=new ae){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new ae){const i=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return i.set(is(e,s.x,r.x,o.x,a.x),is(e,s.y,r.y,o.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class t0 extends an{constructor(e=new L,t=new L,i=new L,s=new L){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new L){const i=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return i.set(is(e,s.x,r.x,o.x,a.x),is(e,s.y,r.y,o.y,a.y),is(e,s.z,r.z,o.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class gc extends an{constructor(e=new ae,t=new ae){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new ae){const i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new ae){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class n0 extends an{constructor(e=new L,t=new L){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new L){const i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new L){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class _c extends an{constructor(e=new ae,t=new ae,i=new ae){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new ae){const i=t,s=this.v0,r=this.v1,o=this.v2;return i.set(ns(e,s.x,r.x,o.x),ns(e,s.y,r.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class yc extends an{constructor(e=new L,t=new L,i=new L){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new L){const i=t,s=this.v0,r=this.v1,o=this.v2;return i.set(ns(e,s.x,r.x,o.x),ns(e,s.y,r.y,o.y),ns(e,s.z,r.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class vc extends an{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new ae){const i=t,s=this.points,r=(s.length-1)*e,o=Math.floor(r),a=r-o,l=s[o===0?o:o-1],c=s[o],h=s[o>s.length-2?s.length-1:o+1],u=s[o>s.length-3?s.length-1:o+2];return i.set(yl(a,l.x,c.x,h.x,u.x),yl(a,l.y,c.y,h.y,u.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const s=e.points[t];this.points.push(s.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){const s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const s=e.points[t];this.points.push(new ae().fromArray(s))}return this}}var er=Object.freeze({__proto__:null,ArcCurve:Ym,CatmullRomCurve3:qm,CubicBezierCurve:mc,CubicBezierCurve3:t0,EllipseCurve:zo,LineCurve:gc,LineCurve3:n0,QuadraticBezierCurve:_c,QuadraticBezierCurve3:yc,SplineCurve:vc});class i0 extends an{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){const i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new er[i](t,e))}return this}getPoint(e,t){const i=e*this.getLength(),s=this.getCurveLengths();let r=0;for(;r<s.length;){if(s[r]>=i){const o=s[r]-i,a=this.curves[r],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}r++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let i=0,s=this.curves.length;i<s;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let i;for(let s=0,r=this.curves;s<r.length;s++){const o=r[s],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){const h=l[c];i&&i.equals(h)||(t.push(h),i=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){const s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){const s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){const s=e.curves[t];this.curves.push(new er[s.type]().fromJSON(s))}return this}}class mo extends i0{constructor(e){super(),this.type="Path",this.currentPoint=new ae,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const i=new gc(this.currentPoint.clone(),new ae(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,s){const r=new _c(this.currentPoint.clone(),new ae(e,t),new ae(i,s));return this.curves.push(r),this.currentPoint.set(i,s),this}bezierCurveTo(e,t,i,s,r,o){const a=new mc(this.currentPoint.clone(),new ae(e,t),new ae(i,s),new ae(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),i=new vc(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,s,r,o){const a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,i,s,r,o),this}absarc(e,t,i,s,r,o){return this.absellipse(e,t,i,i,s,r,o),this}ellipse(e,t,i,s,r,o,a,l){const c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+c,t+h,i,s,r,o,a,l),this}absellipse(e,t,i,s,r,o,a,l){const c=new zo(e,t,i,s,r,o,a,l);if(this.curves.length>0){const u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);const h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class Ai extends yt{constructor(e=[new ae(0,-.5),new ae(.5,0),new ae(0,.5)],t=12,i=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:i,phiLength:s},t=Math.floor(t),s=Tt(s,0,Math.PI*2);const r=[],o=[],a=[],l=[],c=[],h=1/t,u=new L,p=new ae,f=new L,g=new L,_=new L;let m=0,d=0;for(let v=0;v<=e.length-1;v++)switch(v){case 0:m=e[v+1].x-e[v].x,d=e[v+1].y-e[v].y,f.x=d*1,f.y=-m,f.z=d*0,_.copy(f),f.normalize(),l.push(f.x,f.y,f.z);break;case e.length-1:l.push(_.x,_.y,_.z);break;default:m=e[v+1].x-e[v].x,d=e[v+1].y-e[v].y,f.x=d*1,f.y=-m,f.z=d*0,g.copy(f),f.x+=_.x,f.y+=_.y,f.z+=_.z,f.normalize(),l.push(f.x,f.y,f.z),_.copy(g)}for(let v=0;v<=t;v++){const b=i+v*h*s,y=Math.sin(b),N=Math.cos(b);for(let A=0;A<=e.length-1;A++){u.x=e[A].x*y,u.y=e[A].y,u.z=e[A].x*N,o.push(u.x,u.y,u.z),p.x=v/t,p.y=A/(e.length-1),a.push(p.x,p.y);const w=l[3*A+0]*y,T=l[3*A+1],x=l[3*A+0]*N;c.push(w,T,x)}}for(let v=0;v<t;v++)for(let b=0;b<e.length-1;b++){const y=b+v*e.length,N=y,A=y+e.length,w=y+e.length+1,T=y+1;r.push(N,A,T),r.push(w,T,A)}this.setIndex(r),this.setAttribute("position",new qe(o,3)),this.setAttribute("uv",new qe(a,2)),this.setAttribute("normal",new qe(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ai(e.points,e.segments,e.phiStart,e.phiLength)}}class ur extends Ai{constructor(e=1,t=1,i=4,s=8){const r=new mo;r.absarc(0,-t/2,e,Math.PI*1.5,0),r.absarc(0,t/2,e,0,Math.PI*.5),super(r.getPoints(i),s),this.type="CapsuleGeometry",this.parameters={radius:e,length:t,capSegments:i,radialSegments:s}}static fromJSON(e){return new ur(e.radius,e.length,e.capSegments,e.radialSegments)}}class dr extends yt{constructor(e=1,t=32,i=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:i,thetaLength:s},t=Math.max(3,t);const r=[],o=[],a=[],l=[],c=new L,h=new ae;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let u=0,p=3;u<=t;u++,p+=3){const f=i+u/t*s;c.x=e*Math.cos(f),c.y=e*Math.sin(f),o.push(c.x,c.y,c.z),a.push(0,0,1),h.x=(o[p]/e+1)/2,h.y=(o[p+1]/e+1)/2,l.push(h.x,h.y)}for(let u=1;u<=t;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new qe(o,3)),this.setAttribute("normal",new qe(a,3)),this.setAttribute("uv",new qe(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new dr(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class Ke extends yt{constructor(e=1,t=1,i=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};const c=this;s=Math.floor(s),r=Math.floor(r);const h=[],u=[],p=[],f=[];let g=0;const _=[],m=i/2;let d=0;v(),o===!1&&(e>0&&b(!0),t>0&&b(!1)),this.setIndex(h),this.setAttribute("position",new qe(u,3)),this.setAttribute("normal",new qe(p,3)),this.setAttribute("uv",new qe(f,2));function v(){const y=new L,N=new L;let A=0;const w=(t-e)/i;for(let T=0;T<=r;T++){const x=[],M=T/r,C=M*(t-e)+e;for(let F=0;F<=s;F++){const D=F/s,U=D*l+a,V=Math.sin(U),H=Math.cos(U);N.x=C*V,N.y=-M*i+m,N.z=C*H,u.push(N.x,N.y,N.z),y.set(V,w,H).normalize(),p.push(y.x,y.y,y.z),f.push(D,1-M),x.push(g++)}_.push(x)}for(let T=0;T<s;T++)for(let x=0;x<r;x++){const M=_[x][T],C=_[x+1][T],F=_[x+1][T+1],D=_[x][T+1];(e>0||x!==0)&&(h.push(M,C,D),A+=3),(t>0||x!==r-1)&&(h.push(C,F,D),A+=3)}c.addGroup(d,A,0),d+=A}function b(y){const N=g,A=new ae,w=new L;let T=0;const x=y===!0?e:t,M=y===!0?1:-1;for(let F=1;F<=s;F++)u.push(0,m*M,0),p.push(0,M,0),f.push(.5,.5),g++;const C=g;for(let F=0;F<=s;F++){const U=F/s*l+a,V=Math.cos(U),H=Math.sin(U);w.x=x*H,w.y=m*M,w.z=x*V,u.push(w.x,w.y,w.z),p.push(0,M,0),A.x=V*.5+.5,A.y=H*.5*M+.5,f.push(A.x,A.y),g++}for(let F=0;F<s;F++){const D=N+F,U=C+F;y===!0?h.push(U,U+1,D):h.push(U+1,U,D),T+=3}c.addGroup(d,T,y===!0?1:2),d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ke(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class bi extends Ke{constructor(e=1,t=1,i=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,i,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new bi(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Go extends yt{constructor(e=[],t=[],i=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:i,detail:s};const r=[],o=[];a(s),c(i),h(),this.setAttribute("position",new qe(r,3)),this.setAttribute("normal",new qe(r.slice(),3)),this.setAttribute("uv",new qe(o,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function a(v){const b=new L,y=new L,N=new L;for(let A=0;A<t.length;A+=3)f(t[A+0],b),f(t[A+1],y),f(t[A+2],N),l(b,y,N,v)}function l(v,b,y,N){const A=N+1,w=[];for(let T=0;T<=A;T++){w[T]=[];const x=v.clone().lerp(y,T/A),M=b.clone().lerp(y,T/A),C=A-T;for(let F=0;F<=C;F++)F===0&&T===A?w[T][F]=x:w[T][F]=x.clone().lerp(M,F/C)}for(let T=0;T<A;T++)for(let x=0;x<2*(A-T)-1;x++){const M=Math.floor(x/2);x%2===0?(p(w[T][M+1]),p(w[T+1][M]),p(w[T][M])):(p(w[T][M+1]),p(w[T+1][M+1]),p(w[T+1][M]))}}function c(v){const b=new L;for(let y=0;y<r.length;y+=3)b.x=r[y+0],b.y=r[y+1],b.z=r[y+2],b.normalize().multiplyScalar(v),r[y+0]=b.x,r[y+1]=b.y,r[y+2]=b.z}function h(){const v=new L;for(let b=0;b<r.length;b+=3){v.x=r[b+0],v.y=r[b+1],v.z=r[b+2];const y=m(v)/2/Math.PI+.5,N=d(v)/Math.PI+.5;o.push(y,1-N)}g(),u()}function u(){for(let v=0;v<o.length;v+=6){const b=o[v+0],y=o[v+2],N=o[v+4],A=Math.max(b,y,N),w=Math.min(b,y,N);A>.9&&w<.1&&(b<.2&&(o[v+0]+=1),y<.2&&(o[v+2]+=1),N<.2&&(o[v+4]+=1))}}function p(v){r.push(v.x,v.y,v.z)}function f(v,b){const y=v*3;b.x=e[y+0],b.y=e[y+1],b.z=e[y+2]}function g(){const v=new L,b=new L,y=new L,N=new L,A=new ae,w=new ae,T=new ae;for(let x=0,M=0;x<r.length;x+=9,M+=6){v.set(r[x+0],r[x+1],r[x+2]),b.set(r[x+3],r[x+4],r[x+5]),y.set(r[x+6],r[x+7],r[x+8]),A.set(o[M+0],o[M+1]),w.set(o[M+2],o[M+3]),T.set(o[M+4],o[M+5]),N.copy(v).add(b).add(y).divideScalar(3);const C=m(N);_(A,M+0,v,C),_(w,M+2,b,C),_(T,M+4,y,C)}}function _(v,b,y,N){N<0&&v.x===1&&(o[b]=v.x-1),y.x===0&&y.z===0&&(o[b]=N/2/Math.PI+.5)}function m(v){return Math.atan2(v.z,-v.x)}function d(v){return Math.atan2(-v.y,Math.sqrt(v.x*v.x+v.z*v.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Go(e.vertices,e.indices,e.radius,e.details)}}class Vo extends mo{constructor(e){super(e),this.uuid=jt(),this.type="Shape",this.holes=[]}getPointsHoles(e){const t=[];for(let i=0,s=this.holes.length;i<s;i++)t[i]=this.holes[i].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){const s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){const e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,i=this.holes.length;t<i;t++){const s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){const s=e.holes[t];this.holes.push(new mo().fromJSON(s))}return this}}const s0={triangulate:function(n,e,t=2){const i=e&&e.length,s=i?e[0]*t:n.length;let r=bc(n,0,s,t,!0);const o=[];if(!r||r.next===r.prev)return o;let a,l,c,h,u,p,f;if(i&&(r=c0(n,e,r,t)),n.length>80*t){a=c=n[0],l=h=n[1];for(let g=t;g<s;g+=t)u=n[g],p=n[g+1],u<a&&(a=u),p<l&&(l=p),u>c&&(c=u),p>h&&(h=p);f=Math.max(c-a,h-l),f=f!==0?32767/f:0}return rs(r,o,t,a,l,f,0),o}};function bc(n,e,t,i,s){let r,o;if(s===b0(n,e,t,i)>0)for(r=e;r<t;r+=i)o=vl(r,n[r],n[r+1],o);else for(r=t-i;r>=e;r-=i)o=vl(r,n[r],n[r+1],o);return o&&fr(o,o.next)&&(as(o),o=o.next),o}function Kn(n,e){if(!n)return n;e||(e=n);let t=n,i;do if(i=!1,!t.steiner&&(fr(t,t.next)||vt(t.prev,t,t.next)===0)){if(as(t),t=e=t.prev,t===t.next)break;i=!0}else t=t.next;while(i||t!==e);return e}function rs(n,e,t,i,s,r,o){if(!n)return;!o&&r&&p0(n,i,s,r);let a=n,l,c;for(;n.prev!==n.next;){if(l=n.prev,c=n.next,r?o0(n,i,s,r):r0(n)){e.push(l.i/t|0),e.push(n.i/t|0),e.push(c.i/t|0),as(n),n=c.next,a=c.next;continue}if(n=c,n===a){o?o===1?(n=a0(Kn(n),e,t),rs(n,e,t,i,s,r,2)):o===2&&l0(n,e,t,i,s,r):rs(Kn(n),e,t,i,s,r,1);break}}}function r0(n){const e=n.prev,t=n,i=n.next;if(vt(e,t,i)>=0)return!1;const s=e.x,r=t.x,o=i.x,a=e.y,l=t.y,c=i.y,h=s<r?s<o?s:o:r<o?r:o,u=a<l?a<c?a:c:l<c?l:c,p=s>r?s>o?s:o:r>o?r:o,f=a>l?a>c?a:c:l>c?l:c;let g=i.next;for(;g!==e;){if(g.x>=h&&g.x<=p&&g.y>=u&&g.y<=f&&_i(s,a,r,l,o,c,g.x,g.y)&&vt(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function o0(n,e,t,i){const s=n.prev,r=n,o=n.next;if(vt(s,r,o)>=0)return!1;const a=s.x,l=r.x,c=o.x,h=s.y,u=r.y,p=o.y,f=a<l?a<c?a:c:l<c?l:c,g=h<u?h<p?h:p:u<p?u:p,_=a>l?a>c?a:c:l>c?l:c,m=h>u?h>p?h:p:u>p?u:p,d=go(f,g,e,t,i),v=go(_,m,e,t,i);let b=n.prevZ,y=n.nextZ;for(;b&&b.z>=d&&y&&y.z<=v;){if(b.x>=f&&b.x<=_&&b.y>=g&&b.y<=m&&b!==s&&b!==o&&_i(a,h,l,u,c,p,b.x,b.y)&&vt(b.prev,b,b.next)>=0||(b=b.prevZ,y.x>=f&&y.x<=_&&y.y>=g&&y.y<=m&&y!==s&&y!==o&&_i(a,h,l,u,c,p,y.x,y.y)&&vt(y.prev,y,y.next)>=0))return!1;y=y.nextZ}for(;b&&b.z>=d;){if(b.x>=f&&b.x<=_&&b.y>=g&&b.y<=m&&b!==s&&b!==o&&_i(a,h,l,u,c,p,b.x,b.y)&&vt(b.prev,b,b.next)>=0)return!1;b=b.prevZ}for(;y&&y.z<=v;){if(y.x>=f&&y.x<=_&&y.y>=g&&y.y<=m&&y!==s&&y!==o&&_i(a,h,l,u,c,p,y.x,y.y)&&vt(y.prev,y,y.next)>=0)return!1;y=y.nextZ}return!0}function a0(n,e,t){let i=n;do{const s=i.prev,r=i.next.next;!fr(s,r)&&Mc(s,i,i.next,r)&&os(s,r)&&os(r,s)&&(e.push(s.i/t|0),e.push(i.i/t|0),e.push(r.i/t|0),as(i),as(i.next),i=n=r),i=i.next}while(i!==n);return Kn(i)}function l0(n,e,t,i,s,r){let o=n;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&_0(o,a)){let l=xc(o,a);o=Kn(o,o.next),l=Kn(l,l.next),rs(o,e,t,i,s,r,0),rs(l,e,t,i,s,r,0);return}a=a.next}o=o.next}while(o!==n)}function c0(n,e,t,i){const s=[];let r,o,a,l,c;for(r=0,o=e.length;r<o;r++)a=e[r]*i,l=r<o-1?e[r+1]*i:n.length,c=bc(n,a,l,i,!1),c===c.next&&(c.steiner=!0),s.push(g0(c));for(s.sort(h0),r=0;r<s.length;r++)t=u0(s[r],t);return t}function h0(n,e){return n.x-e.x}function u0(n,e){const t=d0(n,e);if(!t)return e;const i=xc(t,n);return Kn(i,i.next),Kn(t,t.next)}function d0(n,e){let t=e,i=-1/0,s;const r=n.x,o=n.y;do{if(o<=t.y&&o>=t.next.y&&t.next.y!==t.y){const p=t.x+(o-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(p<=r&&p>i&&(i=p,s=t.x<t.next.x?t:t.next,p===r))return s}t=t.next}while(t!==e);if(!s)return null;const a=s,l=s.x,c=s.y;let h=1/0,u;t=s;do r>=t.x&&t.x>=l&&r!==t.x&&_i(o<c?r:i,o,l,c,o<c?i:r,o,t.x,t.y)&&(u=Math.abs(o-t.y)/(r-t.x),os(t,n)&&(u<h||u===h&&(t.x>s.x||t.x===s.x&&f0(s,t)))&&(s=t,h=u)),t=t.next;while(t!==a);return s}function f0(n,e){return vt(n.prev,n,e.prev)<0&&vt(e.next,n,n.next)<0}function p0(n,e,t,i){let s=n;do s.z===0&&(s.z=go(s.x,s.y,e,t,i)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==n);s.prevZ.nextZ=null,s.prevZ=null,m0(s)}function m0(n){let e,t,i,s,r,o,a,l,c=1;do{for(t=n,n=null,r=null,o=0;t;){for(o++,i=t,a=0,e=0;e<c&&(a++,i=i.nextZ,!!i);e++);for(l=c;a>0||l>0&&i;)a!==0&&(l===0||!i||t.z<=i.z)?(s=t,t=t.nextZ,a--):(s=i,i=i.nextZ,l--),r?r.nextZ=s:n=s,s.prevZ=r,r=s;t=i}r.nextZ=null,c*=2}while(o>1);return n}function go(n,e,t,i,s){return n=(n-t)*s|0,e=(e-i)*s|0,n=(n|n<<8)&16711935,n=(n|n<<4)&252645135,n=(n|n<<2)&858993459,n=(n|n<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,n|e<<1}function g0(n){let e=n,t=n;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==n);return t}function _i(n,e,t,i,s,r,o,a){return(s-o)*(e-a)>=(n-o)*(r-a)&&(n-o)*(i-a)>=(t-o)*(e-a)&&(t-o)*(r-a)>=(s-o)*(i-a)}function _0(n,e){return n.next.i!==e.i&&n.prev.i!==e.i&&!y0(n,e)&&(os(n,e)&&os(e,n)&&v0(n,e)&&(vt(n.prev,n,e.prev)||vt(n,e.prev,e))||fr(n,e)&&vt(n.prev,n,n.next)>0&&vt(e.prev,e,e.next)>0)}function vt(n,e,t){return(e.y-n.y)*(t.x-e.x)-(e.x-n.x)*(t.y-e.y)}function fr(n,e){return n.x===e.x&&n.y===e.y}function Mc(n,e,t,i){const s=Vs(vt(n,e,t)),r=Vs(vt(n,e,i)),o=Vs(vt(t,i,n)),a=Vs(vt(t,i,e));return!!(s!==r&&o!==a||s===0&&Gs(n,t,e)||r===0&&Gs(n,i,e)||o===0&&Gs(t,n,i)||a===0&&Gs(t,e,i))}function Gs(n,e,t){return e.x<=Math.max(n.x,t.x)&&e.x>=Math.min(n.x,t.x)&&e.y<=Math.max(n.y,t.y)&&e.y>=Math.min(n.y,t.y)}function Vs(n){return n>0?1:n<0?-1:0}function y0(n,e){let t=n;do{if(t.i!==n.i&&t.next.i!==n.i&&t.i!==e.i&&t.next.i!==e.i&&Mc(t,t.next,n,e))return!0;t=t.next}while(t!==n);return!1}function os(n,e){return vt(n.prev,n,n.next)<0?vt(n,e,n.next)>=0&&vt(n,n.prev,e)>=0:vt(n,e,n.prev)<0||vt(n,n.next,e)<0}function v0(n,e){let t=n,i=!1;const s=(n.x+e.x)/2,r=(n.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(i=!i),t=t.next;while(t!==n);return i}function xc(n,e){const t=new _o(n.i,n.x,n.y),i=new _o(e.i,e.x,e.y),s=n.next,r=e.prev;return n.next=e,e.prev=n,t.next=s,s.prev=t,i.next=t,t.prev=i,r.next=i,i.prev=r,i}function vl(n,e,t,i){const s=new _o(n,e,t);return i?(s.next=i.next,s.prev=i,i.next.prev=s,i.next=s):(s.prev=s,s.next=s),s}function as(n){n.next.prev=n.prev,n.prev.next=n.next,n.prevZ&&(n.prevZ.nextZ=n.nextZ),n.nextZ&&(n.nextZ.prevZ=n.prevZ)}function _o(n,e,t){this.i=n,this.x=e,this.y=t,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function b0(n,e,t,i){let s=0;for(let r=e,o=t-i;r<t;r+=i)s+=(n[o]-n[r])*(n[r+1]+n[o+1]),o=r;return s}class Pn{static area(e){const t=e.length;let i=0;for(let s=t-1,r=0;r<t;s=r++)i+=e[s].x*e[r].y-e[r].x*e[s].y;return i*.5}static isClockWise(e){return Pn.area(e)<0}static triangulateShape(e,t){const i=[],s=[],r=[];bl(e),Ml(i,e);let o=e.length;t.forEach(bl);for(let l=0;l<t.length;l++)s.push(o),o+=t[l].length,Ml(i,t[l]);const a=s0.triangulate(i,s);for(let l=0;l<a.length;l+=3)r.push(a.slice(l,l+3));return r}}function bl(n){const e=n.length;e>2&&n[e-1].equals(n[0])&&n.pop()}function Ml(n,e){for(let t=0;t<e.length;t++)n.push(e[t].x),n.push(e[t].y)}class Sc extends yt{constructor(e=new Vo([new ae(.5,.5),new ae(-.5,.5),new ae(-.5,-.5),new ae(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];const i=this,s=[],r=[];for(let a=0,l=e.length;a<l;a++){const c=e[a];o(c)}this.setAttribute("position",new qe(s,3)),this.setAttribute("uv",new qe(r,2)),this.computeVertexNormals();function o(a){const l=[],c=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,u=t.depth!==void 0?t.depth:1;let p=t.bevelEnabled!==void 0?t.bevelEnabled:!0,f=t.bevelThickness!==void 0?t.bevelThickness:.2,g=t.bevelSize!==void 0?t.bevelSize:f-.1,_=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3;const d=t.extrudePath,v=t.UVGenerator!==void 0?t.UVGenerator:M0;let b,y=!1,N,A,w,T;d&&(b=d.getSpacedPoints(h),y=!0,p=!1,N=d.computeFrenetFrames(h,!1),A=new L,w=new L,T=new L),p||(m=0,f=0,g=0,_=0);const x=a.extractPoints(c);let M=x.shape;const C=x.holes;if(!Pn.isClockWise(M)){M=M.reverse();for(let j=0,se=C.length;j<se;j++){const I=C[j];Pn.isClockWise(I)&&(C[j]=I.reverse())}}const D=Pn.triangulateShape(M,C),U=M;for(let j=0,se=C.length;j<se;j++){const I=C[j];M=M.concat(I)}function V(j,se,I){return se||console.error("THREE.ExtrudeGeometry: vec does not exist"),j.clone().addScaledVector(se,I)}const H=M.length,ee=D.length;function K(j,se,I){let ce,oe,_e;const fe=j.x-se.x,Ue=j.y-se.y,ye=I.x-j.x,P=I.y-j.y,S=fe*fe+Ue*Ue,k=fe*P-Ue*ye;if(Math.abs(k)>Number.EPSILON){const J=Math.sqrt(S),Q=Math.sqrt(ye*ye+P*P),Z=se.x-Ue/J,Ee=se.y+fe/J,me=I.x-P/Q,Se=I.y+ye/Q,Je=((me-Z)*P-(Se-Ee)*ye)/(fe*P-Ue*ye);ce=Z+fe*Je-j.x,oe=Ee+Ue*Je-j.y;const he=ce*ce+oe*oe;if(he<=2)return new ae(ce,oe);_e=Math.sqrt(he/2)}else{let J=!1;fe>Number.EPSILON?ye>Number.EPSILON&&(J=!0):fe<-Number.EPSILON?ye<-Number.EPSILON&&(J=!0):Math.sign(Ue)===Math.sign(P)&&(J=!0),J?(ce=-Ue,oe=fe,_e=Math.sqrt(S)):(ce=fe,oe=Ue,_e=Math.sqrt(S/2))}return new ae(ce/_e,oe/_e)}const R=[];for(let j=0,se=U.length,I=se-1,ce=j+1;j<se;j++,I++,ce++)I===se&&(I=0),ce===se&&(ce=0),R[j]=K(U[j],U[I],U[ce]);const X=[];let xe,Oe=R.concat();for(let j=0,se=C.length;j<se;j++){const I=C[j];xe=[];for(let ce=0,oe=I.length,_e=oe-1,fe=ce+1;ce<oe;ce++,_e++,fe++)_e===oe&&(_e=0),fe===oe&&(fe=0),xe[ce]=K(I[ce],I[_e],I[fe]);X.push(xe),Oe=Oe.concat(xe)}for(let j=0;j<m;j++){const se=j/m,I=f*Math.cos(se*Math.PI/2),ce=g*Math.sin(se*Math.PI/2)+_;for(let oe=0,_e=U.length;oe<_e;oe++){const fe=V(U[oe],R[oe],ce);W(fe.x,fe.y,-I)}for(let oe=0,_e=C.length;oe<_e;oe++){const fe=C[oe];xe=X[oe];for(let Ue=0,ye=fe.length;Ue<ye;Ue++){const P=V(fe[Ue],xe[Ue],ce);W(P.x,P.y,-I)}}}const Qe=g+_;for(let j=0;j<H;j++){const se=p?V(M[j],Oe[j],Qe):M[j];y?(w.copy(N.normals[0]).multiplyScalar(se.x),A.copy(N.binormals[0]).multiplyScalar(se.y),T.copy(b[0]).add(w).add(A),W(T.x,T.y,T.z)):W(se.x,se.y,0)}for(let j=1;j<=h;j++)for(let se=0;se<H;se++){const I=p?V(M[se],Oe[se],Qe):M[se];y?(w.copy(N.normals[j]).multiplyScalar(I.x),A.copy(N.binormals[j]).multiplyScalar(I.y),T.copy(b[j]).add(w).add(A),W(T.x,T.y,T.z)):W(I.x,I.y,u/h*j)}for(let j=m-1;j>=0;j--){const se=j/m,I=f*Math.cos(se*Math.PI/2),ce=g*Math.sin(se*Math.PI/2)+_;for(let oe=0,_e=U.length;oe<_e;oe++){const fe=V(U[oe],R[oe],ce);W(fe.x,fe.y,u+I)}for(let oe=0,_e=C.length;oe<_e;oe++){const fe=C[oe];xe=X[oe];for(let Ue=0,ye=fe.length;Ue<ye;Ue++){const P=V(fe[Ue],xe[Ue],ce);y?W(P.x,P.y+b[h-1].y,b[h-1].x+I):W(P.x,P.y,u+I)}}}ne(),ue();function ne(){const j=s.length/3;if(p){let se=0,I=H*se;for(let ce=0;ce<ee;ce++){const oe=D[ce];ie(oe[2]+I,oe[1]+I,oe[0]+I)}se=h+m*2,I=H*se;for(let ce=0;ce<ee;ce++){const oe=D[ce];ie(oe[0]+I,oe[1]+I,oe[2]+I)}}else{for(let se=0;se<ee;se++){const I=D[se];ie(I[2],I[1],I[0])}for(let se=0;se<ee;se++){const I=D[se];ie(I[0]+H*h,I[1]+H*h,I[2]+H*h)}}i.addGroup(j,s.length/3-j,0)}function ue(){const j=s.length/3;let se=0;le(U,se),se+=U.length;for(let I=0,ce=C.length;I<ce;I++){const oe=C[I];le(oe,se),se+=oe.length}i.addGroup(j,s.length/3-j,1)}function le(j,se){let I=j.length;for(;--I>=0;){const ce=I;let oe=I-1;oe<0&&(oe=j.length-1);for(let _e=0,fe=h+m*2;_e<fe;_e++){const Ue=H*_e,ye=H*(_e+1),P=se+ce+Ue,S=se+oe+Ue,k=se+oe+ye,J=se+ce+ye;Le(P,S,k,J)}}}function W(j,se,I){l.push(j),l.push(se),l.push(I)}function ie(j,se,I){te(j),te(se),te(I);const ce=s.length/3,oe=v.generateTopUV(i,s,ce-3,ce-2,ce-1);O(oe[0]),O(oe[1]),O(oe[2])}function Le(j,se,I,ce){te(j),te(se),te(ce),te(se),te(I),te(ce);const oe=s.length/3,_e=v.generateSideWallUV(i,s,oe-6,oe-3,oe-2,oe-1);O(_e[0]),O(_e[1]),O(_e[3]),O(_e[1]),O(_e[2]),O(_e[3])}function te(j){s.push(l[j*3+0]),s.push(l[j*3+1]),s.push(l[j*3+2])}function O(j){r.push(j.x),r.push(j.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes,i=this.parameters.options;return x0(t,i,e)}static fromJSON(e,t){const i=[];for(let r=0,o=e.shapes.length;r<o;r++){const a=t[e.shapes[r]];i.push(a)}const s=e.options.extrudePath;return s!==void 0&&(e.options.extrudePath=new er[s.type]().fromJSON(s)),new Sc(i,e.options)}}const M0={generateTopUV:function(n,e,t,i,s){const r=e[t*3],o=e[t*3+1],a=e[i*3],l=e[i*3+1],c=e[s*3],h=e[s*3+1];return[new ae(r,o),new ae(a,l),new ae(c,h)]},generateSideWallUV:function(n,e,t,i,s,r){const o=e[t*3],a=e[t*3+1],l=e[t*3+2],c=e[i*3],h=e[i*3+1],u=e[i*3+2],p=e[s*3],f=e[s*3+1],g=e[s*3+2],_=e[r*3],m=e[r*3+1],d=e[r*3+2];return Math.abs(a-h)<Math.abs(o-c)?[new ae(o,1-l),new ae(c,1-u),new ae(p,1-g),new ae(_,1-d)]:[new ae(a,1-l),new ae(h,1-u),new ae(f,1-g),new ae(m,1-d)]}};function x0(n,e,t){if(t.shapes=[],Array.isArray(n))for(let i=0,s=n.length;i<s;i++){const r=n[i];t.shapes.push(r.uuid)}else t.shapes.push(n.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}class wc extends Go{constructor(e=1,t=0){const i=(1+Math.sqrt(5))/2,s=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new wc(e.radius,e.detail)}}class tr extends yt{constructor(e=.5,t=1,i=32,s=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:s,thetaStart:r,thetaLength:o},i=Math.max(3,i),s=Math.max(1,s);const a=[],l=[],c=[],h=[];let u=e;const p=(t-e)/s,f=new L,g=new ae;for(let _=0;_<=s;_++){for(let m=0;m<=i;m++){const d=r+m/i*o;f.x=u*Math.cos(d),f.y=u*Math.sin(d),l.push(f.x,f.y,f.z),c.push(0,0,1),g.x=(f.x/t+1)/2,g.y=(f.y/t+1)/2,h.push(g.x,g.y)}u+=p}for(let _=0;_<s;_++){const m=_*(i+1);for(let d=0;d<i;d++){const v=d+m,b=v,y=v+i+1,N=v+i+2,A=v+1;a.push(b,y,A),a.push(y,N,A)}}this.setIndex(a),this.setAttribute("position",new qe(l,3)),this.setAttribute("normal",new qe(c,3)),this.setAttribute("uv",new qe(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new tr(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class Wo extends yt{constructor(e=new Vo([new ae(0,.5),new ae(-.5,-.5),new ae(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};const i=[],s=[],r=[],o=[];let a=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let h=0;h<e.length;h++)c(e[h]),this.addGroup(a,l,h),a+=l,l=0;this.setIndex(i),this.setAttribute("position",new qe(s,3)),this.setAttribute("normal",new qe(r,3)),this.setAttribute("uv",new qe(o,2));function c(h){const u=s.length/3,p=h.extractPoints(t);let f=p.shape;const g=p.holes;Pn.isClockWise(f)===!1&&(f=f.reverse());for(let m=0,d=g.length;m<d;m++){const v=g[m];Pn.isClockWise(v)===!0&&(g[m]=v.reverse())}const _=Pn.triangulateShape(f,g);for(let m=0,d=g.length;m<d;m++){const v=g[m];f=f.concat(v)}for(let m=0,d=f.length;m<d;m++){const v=f[m];s.push(v.x,v.y,0),r.push(0,0,1),o.push(v.x,v.y)}for(let m=0,d=_.length;m<d;m++){const v=_[m],b=v[0]+u,y=v[1]+u,N=v[2]+u;i.push(b,y,N),l+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes;return S0(t,e)}static fromJSON(e,t){const i=[];for(let s=0,r=e.shapes.length;s<r;s++){const o=t[e.shapes[s]];i.push(o)}return new Wo(i,e.curveSegments)}}function S0(n,e){if(e.shapes=[],Array.isArray(n))for(let t=0,i=n.length;t<i;t++){const s=n[t];e.shapes.push(s.uuid)}else e.shapes.push(n.uuid);return e}class xt extends yt{constructor(e=1,t=32,i=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));const l=Math.min(o+a,Math.PI);let c=0;const h=[],u=new L,p=new L,f=[],g=[],_=[],m=[];for(let d=0;d<=i;d++){const v=[],b=d/i;let y=0;d===0&&o===0?y=.5/t:d===i&&l===Math.PI&&(y=-.5/t);for(let N=0;N<=t;N++){const A=N/t;u.x=-e*Math.cos(s+A*r)*Math.sin(o+b*a),u.y=e*Math.cos(o+b*a),u.z=e*Math.sin(s+A*r)*Math.sin(o+b*a),g.push(u.x,u.y,u.z),p.copy(u).normalize(),_.push(p.x,p.y,p.z),m.push(A+y,1-b),v.push(c++)}h.push(v)}for(let d=0;d<i;d++)for(let v=0;v<t;v++){const b=h[d][v+1],y=h[d][v],N=h[d+1][v],A=h[d+1][v+1];(d!==0||o>0)&&f.push(b,y,A),(d!==i-1||l<Math.PI)&&f.push(y,N,A)}this.setIndex(f),this.setAttribute("position",new qe(g,3)),this.setAttribute("normal",new qe(_,3)),this.setAttribute("uv",new qe(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new xt(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class tn extends yt{constructor(e=1,t=.4,i=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:i,tubularSegments:s,arc:r},i=Math.floor(i),s=Math.floor(s);const o=[],a=[],l=[],c=[],h=new L,u=new L,p=new L;for(let f=0;f<=i;f++)for(let g=0;g<=s;g++){const _=g/s*r,m=f/i*Math.PI*2;u.x=(e+t*Math.cos(m))*Math.cos(_),u.y=(e+t*Math.cos(m))*Math.sin(_),u.z=t*Math.sin(m),a.push(u.x,u.y,u.z),h.x=e*Math.cos(_),h.y=e*Math.sin(_),p.subVectors(u,h).normalize(),l.push(p.x,p.y,p.z),c.push(g/s),c.push(f/i)}for(let f=1;f<=i;f++)for(let g=1;g<=s;g++){const _=(s+1)*f+g-1,m=(s+1)*(f-1)+g-1,d=(s+1)*(f-1)+g,v=(s+1)*f+g;o.push(_,m,v),o.push(m,d,v)}this.setIndex(o),this.setAttribute("position",new qe(a,3)),this.setAttribute("normal",new qe(l,3)),this.setAttribute("uv",new qe(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new tn(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class Tc extends yt{constructor(e=new yc(new L(-1,-1,0),new L(-1,1,0),new L(1,1,0)),t=64,i=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:i,radialSegments:s,closed:r};const o=e.computeFrenetFrames(t,r);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;const a=new L,l=new L,c=new ae;let h=new L;const u=[],p=[],f=[],g=[];_(),this.setIndex(g),this.setAttribute("position",new qe(u,3)),this.setAttribute("normal",new qe(p,3)),this.setAttribute("uv",new qe(f,2));function _(){for(let b=0;b<t;b++)m(b);m(r===!1?t:0),v(),d()}function m(b){h=e.getPointAt(b/t,h);const y=o.normals[b],N=o.binormals[b];for(let A=0;A<=s;A++){const w=A/s*Math.PI*2,T=Math.sin(w),x=-Math.cos(w);l.x=x*y.x+T*N.x,l.y=x*y.y+T*N.y,l.z=x*y.z+T*N.z,l.normalize(),p.push(l.x,l.y,l.z),a.x=h.x+i*l.x,a.y=h.y+i*l.y,a.z=h.z+i*l.z,u.push(a.x,a.y,a.z)}}function d(){for(let b=1;b<=t;b++)for(let y=1;y<=s;y++){const N=(s+1)*(b-1)+(y-1),A=(s+1)*b+(y-1),w=(s+1)*b+y,T=(s+1)*(b-1)+y;g.push(N,A,T),g.push(A,w,T)}}function v(){for(let b=0;b<=t;b++)for(let y=0;y<=s;y++)c.x=b/t,c.y=y/s,f.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new Tc(new er[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}}class wt extends bn{static get type(){return"MeshStandardMaterial"}constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new Ne(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ne(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new ae(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new nn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class oy extends wt{static get type(){return"MeshPhysicalMaterial"}constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new ae(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Tt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Ne(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Ne(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Ne(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class w0 extends bn{static get type(){return"MeshToonMaterial"}constructor(e){super(),this.isMeshToonMaterial=!0,this.defines={TOON:""},this.color=new Ne(16777215),this.map=null,this.gradientMap=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ne(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new ae(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.gradientMap=e.gradientMap,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.alphaMap=e.alphaMap,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}function Ws(n,e,t){return!n||!t&&n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}function T0(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function E0(n){function e(s,r){return n[s]-n[r]}const t=n.length,i=new Array(t);for(let s=0;s!==t;++s)i[s]=s;return i.sort(e),i}function xl(n,e,t){const i=n.length,s=new n.constructor(i);for(let r=0,o=0;o!==i;++r){const a=t[r]*e;for(let l=0;l!==e;++l)s[o++]=n[a+l]}return s}function Ec(n,e,t,i){let s=1,r=n[0];for(;r!==void 0&&r[i]===void 0;)r=n[s++];if(r===void 0)return;let o=r[i];if(o!==void 0)if(Array.isArray(o))do o=r[i],o!==void 0&&(e.push(r.time),t.push.apply(t,o)),r=n[s++];while(r!==void 0);else if(o.toArray!==void 0)do o=r[i],o!==void 0&&(e.push(r.time),o.toArray(t,t.length)),r=n[s++];while(r!==void 0);else do o=r[i],o!==void 0&&(e.push(r.time),t.push(o)),r=n[s++];while(r!==void 0)}class pr{constructor(e,t,i,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let i=this._cachedIndex,s=t[i],r=t[i-1];n:{e:{let o;t:{i:if(!(e<s)){for(let a=i+2;;){if(s===void 0){if(e<r)break i;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(r=s,s=t[++i],e<s)break e}o=t.length;break t}if(!(e>=r)){const a=t[1];e<a&&(i=2,r=a);for(let l=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(s=r,r=t[--i-1],e>=r)break e}o=i,i=0;break t}break n}for(;i<o;){const a=i+o>>>1;e<t[a]?o=a:i=a+1}if(s=t[i],r=t[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,s)}return this.interpolate_(i,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,i=this.sampleValues,s=this.valueSize,r=e*s;for(let o=0;o!==s;++o)t[o]=i[r+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}}class A0 extends pr{constructor(e,t,i,s){super(e,t,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:2400,endingEnd:2400}}intervalChanged_(e,t,i){const s=this.parameterPositions;let r=e-2,o=e+1,a=s[r],l=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case 2401:r=e,a=2*t-i;break;case 2402:r=s.length-2,a=t+s[r]-s[r+1];break;default:r=e,a=i}if(l===void 0)switch(this.getSettings_().endingEnd){case 2401:o=e,l=2*i-t;break;case 2402:o=1,l=i+s[1]-s[0];break;default:o=e-1,l=t}const c=(i-t)*.5,h=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-i),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(e,t,i,s){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=this._offsetPrev,u=this._offsetNext,p=this._weightPrev,f=this._weightNext,g=(i-t)/(s-t),_=g*g,m=_*g,d=-p*m+2*p*_-p*g,v=(1+p)*m+(-1.5-2*p)*_+(-.5+p)*g+1,b=(-1-f)*m+(1.5+f)*_+.5*g,y=f*m-f*_;for(let N=0;N!==a;++N)r[N]=d*o[h+N]+v*o[c+N]+b*o[l+N]+y*o[u+N];return r}}class R0 extends pr{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=(i-t)/(s-t),u=1-h;for(let p=0;p!==a;++p)r[p]=o[c+p]*u+o[l+p]*h;return r}}class C0 extends pr{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e){return this.copySampleValue_(e-1)}}class ln{constructor(e,t,i,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Ws(t,this.TimeBufferType),this.values=Ws(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:Ws(e.times,Array),values:Ws(e.values,Array)};const s=e.getInterpolation();s!==e.DefaultInterpolation&&(i.interpolation=s)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new C0(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new R0(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new A0(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case 2300:t=this.InterpolantFactoryMethodDiscrete;break;case 2301:t=this.InterpolantFactoryMethodLinear;break;case 2302:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){const i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return console.warn("THREE.KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return 2300;case this.InterpolantFactoryMethodLinear:return 2301;case this.InterpolantFactoryMethodSmooth:return 2302}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]*=e}return this}trim(e,t){const i=this.times,s=i.length;let r=0,o=s-1;for(;r!==s&&i[r]<e;)++r;for(;o!==-1&&i[o]>t;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);const a=this.getValueSize();this.times=i.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);const i=this.times,s=this.values,r=i.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){const l=i[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(s!==void 0&&T0(s))for(let a=0,l=s.length;a!==l;++a){const c=s[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===2302,r=e.length-1;let o=1;for(let a=1;a<r;++a){let l=!1;const c=e[a],h=e[a+1];if(c!==h&&(a!==1||c!==e[0]))if(s)l=!0;else{const u=a*i,p=u-i,f=u+i;for(let g=0;g!==i;++g){const _=t[u+g];if(_!==t[p+g]||_!==t[f+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];const u=a*i,p=o*i;for(let f=0;f!==i;++f)t[p+f]=t[u+f]}++o}}if(r>0){e[o]=e[r];for(let a=r*i,l=o*i,c=0;c!==i;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*i)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),i=this.constructor,s=new i(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}}ln.prototype.TimeBufferType=Float32Array;ln.prototype.ValueBufferType=Float32Array;ln.prototype.DefaultInterpolation=2301;class Di extends ln{constructor(e,t,i){super(e,t,i)}}Di.prototype.ValueTypeName="bool";Di.prototype.ValueBufferType=Array;Di.prototype.DefaultInterpolation=2300;Di.prototype.InterpolantFactoryMethodLinear=void 0;Di.prototype.InterpolantFactoryMethodSmooth=void 0;class Ac extends ln{}Ac.prototype.ValueTypeName="color";class nr extends ln{}nr.prototype.ValueTypeName="number";class P0 extends pr{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(i-t)/(s-t);let c=e*a;for(let h=c+a;c!==h;c+=4)_t.slerpFlat(r,0,o,c-a,o,c,l);return r}}class mr extends ln{InterpolantFactoryMethodLinear(e){return new P0(this.times,this.values,this.getValueSize(),e)}}mr.prototype.ValueTypeName="quaternion";mr.prototype.InterpolantFactoryMethodSmooth=void 0;class Ni extends ln{constructor(e,t,i){super(e,t,i)}}Ni.prototype.ValueTypeName="string";Ni.prototype.ValueBufferType=Array;Ni.prototype.DefaultInterpolation=2300;Ni.prototype.InterpolantFactoryMethodLinear=void 0;Ni.prototype.InterpolantFactoryMethodSmooth=void 0;class ir extends ln{}ir.prototype.ValueTypeName="vector";class ay{constructor(e="",t=-1,i=[],s=2500){this.name=e,this.tracks=i,this.duration=t,this.blendMode=s,this.uuid=jt(),this.duration<0&&this.resetDuration()}static parse(e){const t=[],i=e.tracks,s=1/(e.fps||1);for(let o=0,a=i.length;o!==a;++o)t.push(I0(i[o]).scale(s));const r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r}static toJSON(e){const t=[],i=e.tracks,s={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode};for(let r=0,o=i.length;r!==o;++r)t.push(ln.toJSON(i[r]));return s}static CreateFromMorphTargetSequence(e,t,i,s){const r=t.length,o=[];for(let a=0;a<r;a++){let l=[],c=[];l.push((a+r-1)%r,a,(a+1)%r),c.push(0,1,0);const h=E0(l);l=xl(l,1,h),c=xl(c,1,h),!s&&l[0]===0&&(l.push(r),c.push(c[0])),o.push(new nr(".morphTargetInfluences["+t[a].name+"]",l,c).scale(1/i))}return new this(e,-1,o)}static findByName(e,t){let i=e;if(!Array.isArray(e)){const s=e;i=s.geometry&&s.geometry.animations||s.animations}for(let s=0;s<i.length;s++)if(i[s].name===t)return i[s];return null}static CreateClipsFromMorphTargetSequences(e,t,i){const s={},r=/^([\w-]*?)([\d]+)$/;for(let a=0,l=e.length;a<l;a++){const c=e[a],h=c.name.match(r);if(h&&h.length>1){const u=h[1];let p=s[u];p||(s[u]=p=[]),p.push(c)}}const o=[];for(const a in s)o.push(this.CreateFromMorphTargetSequence(a,s[a],t,i));return o}static parseAnimation(e,t){if(!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;const i=function(u,p,f,g,_){if(f.length!==0){const m=[],d=[];Ec(f,m,d,g),m.length!==0&&_.push(new u(p,m,d))}},s=[],r=e.name||"default",o=e.fps||30,a=e.blendMode;let l=e.length||-1;const c=e.hierarchy||[];for(let u=0;u<c.length;u++){const p=c[u].keys;if(!(!p||p.length===0))if(p[0].morphTargets){const f={};let g;for(g=0;g<p.length;g++)if(p[g].morphTargets)for(let _=0;_<p[g].morphTargets.length;_++)f[p[g].morphTargets[_]]=-1;for(const _ in f){const m=[],d=[];for(let v=0;v!==p[g].morphTargets.length;++v){const b=p[g];m.push(b.time),d.push(b.morphTarget===_?1:0)}s.push(new nr(".morphTargetInfluence["+_+"]",m,d))}l=f.length*o}else{const f=".bones["+t[u].name+"]";i(ir,f+".position",p,"pos",s),i(mr,f+".quaternion",p,"rot",s),i(ir,f+".scale",p,"scl",s)}}return s.length===0?null:new this(r,l,s,a)}resetDuration(){const e=this.tracks;let t=0;for(let i=0,s=e.length;i!==s;++i){const r=this.tracks[i];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());return new this.constructor(this.name,this.duration,e,this.blendMode)}toJSON(){return this.constructor.toJSON(this)}}function L0(n){switch(n.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return nr;case"vector":case"vector2":case"vector3":case"vector4":return ir;case"color":return Ac;case"quaternion":return mr;case"bool":case"boolean":return Di;case"string":return Ni}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+n)}function I0(n){if(n.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=L0(n.type);if(n.times===void 0){const t=[],i=[];Ec(n.keys,t,i,"value"),n.times=t,n.values=i}return e.parse!==void 0?e.parse(n):new e(n.name,n.times,n.values,n.interpolation)}const Cn={enabled:!1,files:{},add:function(n,e){this.enabled!==!1&&(this.files[n]=e)},get:function(n){if(this.enabled!==!1)return this.files[n]},remove:function(n){delete this.files[n]},clear:function(){this.files={}}};class D0{constructor(e,t,i){const s=this;let r=!1,o=0,a=0,l;const c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this.itemStart=function(h){a++,r===!1&&s.onStart!==void 0&&s.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,s.onProgress!==void 0&&s.onProgress(h,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){const u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,p=c.length;u<p;u+=2){const f=c[u],g=c[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return g}return null}}}const N0=new D0;class Ui{constructor(e){this.manager=e!==void 0?e:N0,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const i=this;return new Promise(function(s,r){i.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}}Ui.DEFAULT_MATERIAL_NAME="__DEFAULT";const gn={};class U0 extends Error{constructor(e,t){super(e),this.response=t}}class k0 extends Ui{constructor(e){super(e)}load(e,t,i,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=Cn.get(e);if(r!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0),r;if(gn[e]!==void 0){gn[e].push({onLoad:t,onProgress:i,onError:s});return}gn[e]=[],gn[e].push({onLoad:t,onProgress:i,onError:s});const o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin"}),a=this.mimeType,l=this.responseType;fetch(o).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;const h=gn[e],u=c.body.getReader(),p=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),f=p?parseInt(p):0,g=f!==0;let _=0;const m=new ReadableStream({start(d){v();function v(){u.read().then(({done:b,value:y})=>{if(b)d.close();else{_+=y.byteLength;const N=new ProgressEvent("progress",{lengthComputable:g,loaded:_,total:f});for(let A=0,w=h.length;A<w;A++){const T=h[A];T.onProgress&&T.onProgress(N)}d.enqueue(y),v()}},b=>{d.error(b)})}}});return new Response(m)}else throw new U0(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(h=>new DOMParser().parseFromString(h,a));case"json":return c.json();default:if(a===void 0)return c.text();{const u=/charset="?([^;"\s]*)"?/i.exec(a),p=u&&u[1]?u[1].toLowerCase():void 0,f=new TextDecoder(p);return c.arrayBuffer().then(g=>f.decode(g))}}}).then(c=>{Cn.add(e,c);const h=gn[e];delete gn[e];for(let u=0,p=h.length;u<p;u++){const f=h[u];f.onLoad&&f.onLoad(c)}}).catch(c=>{const h=gn[e];if(h===void 0)throw this.manager.itemError(e),c;delete gn[e];for(let u=0,p=h.length;u<p;u++){const f=h[u];f.onError&&f.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}}class F0 extends Ui{constructor(e){super(e)}load(e,t,i,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,o=Cn.get(e);if(o!==void 0)return r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o;const a=ss("img");function l(){h(),Cn.add(e,this),t&&t(this),r.manager.itemEnd(e)}function c(u){h(),s&&s(u),r.manager.itemError(e),r.manager.itemEnd(e)}function h(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),r.manager.itemStart(e),a.src=e,a}}class ly extends Ui{constructor(e){super(e)}load(e,t,i,s){const r=this,o=new hr,a=new k0(this.manager);return a.setResponseType("arraybuffer"),a.setRequestHeader(this.requestHeader),a.setPath(this.path),a.setWithCredentials(r.withCredentials),a.load(e,function(l){let c;try{c=r.parse(l)}catch(h){if(s!==void 0)s(h);else{console.error(h);return}}c.image!==void 0?o.image=c.image:c.data!==void 0&&(o.image.width=c.width,o.image.height=c.height,o.image.data=c.data),o.wrapS=c.wrapS!==void 0?c.wrapS:1001,o.wrapT=c.wrapT!==void 0?c.wrapT:1001,o.magFilter=c.magFilter!==void 0?c.magFilter:1006,o.minFilter=c.minFilter!==void 0?c.minFilter:1006,o.anisotropy=c.anisotropy!==void 0?c.anisotropy:1,c.colorSpace!==void 0&&(o.colorSpace=c.colorSpace),c.flipY!==void 0&&(o.flipY=c.flipY),c.format!==void 0&&(o.format=c.format),c.type!==void 0&&(o.type=c.type),c.mipmaps!==void 0&&(o.mipmaps=c.mipmaps,o.minFilter=1008),c.mipmapCount===1&&(o.minFilter=1006),c.generateMipmaps!==void 0&&(o.generateMipmaps=c.generateMipmaps),o.needsUpdate=!0,t&&t(o,c)},i,s),o}}class O0 extends Ui{constructor(e){super(e)}load(e,t,i,s){const r=new Ct,o=new F0(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},i,s),r}}class gr extends bt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ne(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}class cy extends gr{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(bt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ne(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const to=new Ge,Sl=new L,wl=new L;class Xo{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ae(512,512),this.map=null,this.mapPass=null,this.matrix=new Ge,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Fo,this._frameExtents=new ae(1,1),this._viewportCount=1,this._viewports=[new tt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,i=this.matrix;Sl.setFromMatrixPosition(e.matrixWorld),t.position.copy(Sl),wl.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(wl),t.updateMatrixWorld(),to.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(to),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(to)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class B0 extends Xo{constructor(){super(new Vt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1}updateMatrices(e){const t=this.camera,i=wi*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height,r=e.distance||t.far;(i!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=i,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class hy extends gr{constructor(e,t,i=0,s=Math.PI/3,r=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(bt.DEFAULT_UP),this.updateMatrix(),this.target=new bt,this.distance=i,this.angle=s,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new B0}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}const Tl=new Ge,Ki=new L,no=new L;class z0 extends Xo{constructor(){super(new Vt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new ae(4,2),this._viewportCount=6,this._viewports=[new tt(2,1,1,1),new tt(0,1,1,1),new tt(3,1,1,1),new tt(1,1,1,1),new tt(3,0,1,1),new tt(1,0,1,1)],this._cubeDirections=[new L(1,0,0),new L(-1,0,0),new L(0,0,1),new L(0,0,-1),new L(0,1,0),new L(0,-1,0)],this._cubeUps=[new L(0,1,0),new L(0,1,0),new L(0,1,0),new L(0,1,0),new L(0,0,1),new L(0,0,-1)]}updateMatrices(e,t=0){const i=this.camera,s=this.matrix,r=e.distance||i.far;r!==i.far&&(i.far=r,i.updateProjectionMatrix()),Ki.setFromMatrixPosition(e.matrixWorld),i.position.copy(Ki),no.copy(i.position),no.add(this._cubeDirections[t]),i.up.copy(this._cubeUps[t]),i.lookAt(no),i.updateMatrixWorld(),s.makeTranslation(-Ki.x,-Ki.y,-Ki.z),Tl.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Tl)}}class uy extends gr{constructor(e,t,i=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=s,this.shadow=new z0}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class H0 extends Xo{constructor(){super(new ic(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class dy extends gr{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(bt.DEFAULT_UP),this.updateMatrix(),this.target=new bt,this.shadow=new H0}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class fy{static decodeText(e){if(console.warn("THREE.LoaderUtils: decodeText() has been deprecated with r165 and will be removed with r175. Use TextDecoder instead."),typeof TextDecoder<"u")return new TextDecoder().decode(e);let t="";for(let i=0,s=e.length;i<s;i++)t+=String.fromCharCode(e[i]);try{return decodeURIComponent(escape(t))}catch{return t}}static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}class py extends Ui{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"}}setOptions(e){return this.options=e,this}load(e,t,i,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,o=Cn.get(e);if(o!==void 0){if(r.manager.itemStart(e),o.then){o.then(c=>{t&&t(c),r.manager.itemEnd(e)}).catch(c=>{s&&s(c)});return}return setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o}const a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader;const l=fetch(e,a).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign(r.options,{colorSpaceConversion:"none"}))}).then(function(c){return Cn.add(e,c),t&&t(c),r.manager.itemEnd(e),c}).catch(function(c){s&&s(c),Cn.remove(e),r.manager.itemError(e),r.manager.itemEnd(e)});Cn.add(e,l),r.manager.itemStart(e)}}class my{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=El(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=El();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}function El(){return performance.now()}const Yo="\\[\\]\\.:\\/",G0=new RegExp("["+Yo+"]","g"),qo="[^"+Yo+"]",V0="[^"+Yo.replace("\\.","")+"]",W0=/((?:WC+[\/:])*)/.source.replace("WC",qo),X0=/(WCOD+)?/.source.replace("WCOD",V0),Y0=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",qo),q0=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",qo),j0=new RegExp("^"+W0+X0+Y0+q0+"$"),K0=["material","materials","bones","map"];class J0{constructor(e,t,i){const s=i||ct.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();const i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(e,t)}setValue(e,t){const i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=i.length;s!==r;++s)i[s].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}}class ct{constructor(e,t,i){this.path=t,this.parsedPath=i||ct.parseTrackName(t),this.node=ct.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new ct.Composite(e,t,i):new ct(e,t,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(G0,"")}static parseTrackName(e){const t=j0.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){const r=i.nodeName.substring(s+1);K0.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){const i=function(r){for(let o=0;o<r.length;o++){const a=r[o];if(a.name===t||a.uuid===t)return a;const l=i(a.children);if(l)return l}return null},s=i(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)e[t++]=i[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,i=t.objectName,s=t.propertyName;let r=t.propertyIndex;if(e||(e=ct.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=t.objectIndex;switch(i){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}const o=e[s];if(o===void 0){const c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}ct.Composite=J0;ct.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ct.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ct.prototype.GetterByBindingType=[ct.prototype._getValue_direct,ct.prototype._getValue_array,ct.prototype._getValue_arrayElement,ct.prototype._getValue_toArray];ct.prototype.SetterByBindingTypeAndVersioning=[[ct.prototype._setValue_direct,ct.prototype._setValue_direct_setNeedsUpdate,ct.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ct.prototype._setValue_array,ct.prototype._setValue_array_setNeedsUpdate,ct.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ct.prototype._setValue_arrayElement,ct.prototype._setValue_arrayElement_setNeedsUpdate,ct.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ct.prototype._setValue_fromArray,ct.prototype._setValue_fromArray_setNeedsUpdate,ct.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];const Al=new Ge;class gy{constructor(e,t,i=0,s=1/0){this.ray=new ls(e,t),this.near=i,this.far=s,this.camera=null,this.layers=new No,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Al.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Al),this}intersectObject(e,t=!0,i=[]){return yo(e,this,i,t),i.sort(Rl),i}intersectObjects(e,t=!0,i=[]){for(let s=0,r=e.length;s<r;s++)yo(e[s],this,i,t);return i.sort(Rl),i}}function Rl(n,e){return n.distance-e.distance}function yo(n,e,t,i){let s=!0;if(n.layers.test(e.layers)&&n.raycast(e,t)===!1&&(s=!1),s===!0&&i===!0){const r=n.children;for(let o=0,a=r.length;o<a;o++)yo(r[o],e,t,!0)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"170"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="170");const _y={minX:77,maxX:103,minZ:94,maxZ:134},yy={id:"island-shopping-lane",peninsula:!0,width:6,surface:"asphalt",points:[[89,87],[90,96],[90,128]]},vy=(n,e)=>n>=77&&n<=103&&e>=94&&e<=134,Z0=Object.freeze({top:"jacket",topColour:"#eee8da",pattern:"none",bottom:"skirt",bottomColour:"#9b2834",bottomPattern:"plaid",footwear:"boots",shoes:"#704431",accent:"#e7c887",hat:"none"});function js(n,e=!1){const t=n[0].index!==null,i=new Set(Object.keys(n[0].attributes)),s=new Set(Object.keys(n[0].morphAttributes)),r={},o={},a=n[0].morphTargetsRelative,l=new yt;let c=0;for(let h=0;h<n.length;++h){const u=n[h];let p=0;if(t!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const f in u.attributes){if(!i.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+f+'" attribute exists among all geometries, or in none of them.'),null;r[f]===void 0&&(r[f]=[]),r[f].push(u.attributes[f]),p++}if(p!==i.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(a!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const f in u.morphAttributes){if(!s.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;o[f]===void 0&&(o[f]=[]),o[f].push(u.morphAttributes[f])}if(e){let f;if(t)f=u.index.count;else if(u.attributes.position!==void 0)f=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,f,h),c+=f}}if(t){let h=0;const u=[];for(let p=0;p<n.length;++p){const f=n[p].index;for(let g=0;g<f.count;++g)u.push(f.getX(g)+h);h+=n[p].attributes.position.count}l.setIndex(u)}for(const h in r){const u=Cl(r[h]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,u)}for(const h in o){const u=o[h][0].length;if(u===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let p=0;p<u;++p){const f=[];for(let _=0;_<o[h].length;++_)f.push(o[h][_][p]);const g=Cl(f);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(g)}}return l}function Cl(n){let e,t,i,s=-1,r=0;for(let c=0;c<n.length;++c){const h=n[c];if(e===void 0&&(e=h.array.constructor),e!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=h.itemSize),t!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(i===void 0&&(i=h.normalized),i!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=h.gpuType),s!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.count*t}const o=new e(r),a=new Nt(o,t,i);let l=0;for(let c=0;c<n.length;++c){const h=n[c];if(h.isInterleavedBufferAttribute){const u=l/t;for(let p=0,f=h.count;p<f;p++)for(let g=0;g<t;g++){const _=h.getComponent(p,g);a.setComponent(p+u,g,_)}}else o.set(h.array,l);l+=h.count*t}return s!==void 0&&(a.gpuType=s),a}function by(n,e){if(e===0)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),n;if(e===2||e===1){let t=n.getIndex();if(t===null){const o=[],a=n.getAttribute("position");if(a!==void 0){for(let l=0;l<a.count;l++)o.push(l);n.setIndex(o),t=n.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),n}const i=t.count-2,s=[];if(e===2)for(let o=1;o<=i;o++)s.push(t.getX(0)),s.push(t.getX(o)),s.push(t.getX(o+1));else for(let o=0;o<i;o++)o%2===0?(s.push(t.getX(o)),s.push(t.getX(o+1)),s.push(t.getX(o+2))):(s.push(t.getX(o+2)),s.push(t.getX(o+1)),s.push(t.getX(o)));s.length/3!==i&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");const r=n.clone();return r.setIndex(s),r.clearGroups(),r}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),n}const jo=Object.freeze(["oval","round","square","narrow","heart"]),Pl={oval:[.94,1.08,.22],round:[1.03,1.01,.1],square:[1.03,1.02,-.16],narrow:[.84,1.16,.25],heart:[1.01,1.07,.37]};function $0(n){const[e,t,i]=Pl[n.form]||Pl.oval;return{width:e+(n.shape-.5)*.12,height:t-(n.shape-.5)*.1,taper:i+(n.jaw-.5)*-.22,cheek:(n.cheeks-.5)*.13}}function cs(n,e){const t=n.y,i=Math.max(0,Math.min(1,(-t-.12)/.78)),s=Math.exp(-(((t+.16)/.32)**2))*e.cheek;return n.x*=1-e.taper*i+s,n.z>0&&(n.z*=1-.08*Math.max(0,1-Math.abs(t)*1.4)),n}const Q0=Object.freeze({skin:Object.freeze(["#f7dcc4","#f1cfae","#e8bf98","#dca97e","#c98d62","#b27449","#8f5a38","#6b4029"]),hair:Object.freeze(["#1c1714","#3a2618","#5a3a22","#8a5a2e","#c08a4a","#e0c078","#9a9a96","#d8d6d0","#b8412e","#3d4f8a"]),eyes:Object.freeze(["#2a1d16","#5a3a22","#3d6a8a","#4a7a4a","#6a5a8a","#1c1c24"]),cloth:Object.freeze(["#f4f1ea","#d8342c","#e8742a","#f4d23c","#8fbf4a","#2a8a5a","#3fa0c8","#2f5f9e","#27304d","#8a4ab8","#e98aa6","#9a6a42","#6d7478","#2b2b2b","#c8b48a","#7fb0d8"]),lips:Object.freeze(["#b8544a","#a8433e","#cc3d52","#e06a7a","#d8342c","#8a3a3a"])}),eg=Object.freeze(["child","teen","adult","elder"]),Rc=n=>Number.isFinite(+n)?n<13?"child":n<19?"teen":n>=65?"elder":"adult":"adult",pt=Object.freeze({silhouette:Object.freeze(["neutral","feminine","masculine"]),head:jo,hair:Object.freeze(["crop","sidepart","bob","long","ponytail","braids","bun","spiky","perm","buzz","afro","horseshoe","bald"]),eyes:Object.freeze(["round","dot","almond","sleepy","lashes","narrow","sparkle","gentle"]),brows:Object.freeze(["straight","arched","thick","thin","worried","bushy","none"]),nose:Object.freeze(["button","dot","line","wide","hook","none"]),mouth:Object.freeze(["smile","flat","grin","small","wide","smirk","pout"]),glasses:Object.freeze(["none","round","square","sun","half"]),facial:Object.freeze(["none","moustache","walrus","stubble","beard","goatee"]),top:Object.freeze(["tank","tee","kariyushi","polo","blouse","jacket","apron","smock","sailor","hoodie","cardigan","overalls","sundress","festival","lighthouse","lantern","reef"]),bottom:Object.freeze(["underwear","shorts","trousers","skirt","longskirt","widepants","cropped","culottes","pleatedskirt"]),footwear:Object.freeze(["barefoot","sneakers","sandals","shoes","boots"]),hat:Object.freeze(["none","cap","captain","police","helmet","straw","headband","kerchief","beanie","beret","bucket","ribbon","squid","teapot","sunflower","paperboat","mountain"]),earrings:Object.freeze(["none","studs","hoops"]),neckwear:Object.freeze(["none","pendant","scarf"])}),tg=(n,e=0,t=1)=>Math.min(t,Math.max(e,Number.isFinite(+n)?+n:e)),Dt=(n,e,t)=>n.includes(e)?e:t??n[0],ng=n=>/^#[0-9a-f]{6}$/i.test(String(n))?String(n).toLowerCase():null,ig=Object.freeze({v:1,name:"",age:"adult",body:Object.freeze({height:.5,build:.5,silhouette:"neutral",skin:"#e8bf98"}),head:Object.freeze({size:.5,shape:.5,form:"oval",jaw:.5,cheeks:.5}),hair:Object.freeze({style:"crop",colour:"#1c1714",flip:!1}),eyes:Object.freeze({style:"round",colour:"#2a1d16",size:.5,width:.5,spacing:.5,height:.5,tilt:.5}),brows:Object.freeze({style:"straight",colour:"#1c1714",size:.5,spacing:.5,height:.5,tilt:.5}),nose:Object.freeze({style:"button",size:.5,height:.5,x:.5}),mouth:Object.freeze({style:"smile",colour:"#b8544a",size:.5,width:.5,height:.5,x:.5}),glasses:Object.freeze({style:"none",colour:"#2b2b2b"}),facial:Object.freeze({style:"none",colour:"#1c1714"}),blush:.25,freckles:!1,mole:!1,wrinkles:0,outfit:Object.freeze({top:"tank",topColour:"#f4f1ea",pattern:"none",bottom:"underwear",bottomColour:"#7fb0d8",footwear:"barefoot",shoes:"#6d4a32",hat:"none",hatColour:"#f4f1ea",accent:"#f4d23c"}),accessories:Object.freeze({earrings:"none",neckwear:"none",colour:"#e0b93a",pin:!1}),swim:Object.freeze({colour:"#2f5f9e"}),profile:Object.freeze({pace:.5,talk:.5,show:.5,outlook:.5,pitch:.5,speed:.5,month:7,day:1,favourite:"#3fa0c8",catchphrase:""})});function Bt(n={}){const e=n&&typeof n=="object"?n:{},t=ig,i=(a,l)=>{const c=e[a]&&typeof e[a]=="object"?e[a]:{},h={};for(const[u,p]of Object.entries(l))h[u]=p(c[u],t[a][u]);return h},s=(a,l)=>a===void 0?l:tg(a),r=(a,l)=>ng(a)||l,o=(a,l)=>a===void 0?l:!!a;return{v:1,name:String(e.name||"").slice(0,24),age:Dt(eg,e.age,"adult"),body:i("body",{height:s,build:s,silhouette:a=>Dt(pt.silhouette,a,"neutral"),skin:r}),head:i("head",{size:s,shape:s,form:(a,l)=>Dt(jo,a,l),jaw:s,cheeks:s}),hair:i("hair",{style:(a,l)=>Dt(pt.hair,a,l),colour:r,flip:o}),eyes:i("eyes",{style:(a,l)=>Dt(pt.eyes,a,l),colour:r,size:s,width:s,spacing:s,height:s,tilt:s}),brows:i("brows",{style:(a,l)=>Dt(pt.brows,a,l),colour:r,size:s,spacing:s,height:s,tilt:s}),nose:i("nose",{style:(a,l)=>Dt(pt.nose,a,l),size:s,height:s,x:s}),mouth:i("mouth",{style:(a,l)=>Dt(pt.mouth,a,l),colour:r,size:s,width:s,height:s,x:s}),glasses:i("glasses",{style:(a,l)=>Dt(pt.glasses,a,l),colour:r}),facial:i("facial",{style:(a,l)=>Dt(pt.facial,a,l),colour:r}),blush:s(e.blush,t.blush),freckles:!!e.freckles,mole:!!e.mole,wrinkles:s(e.wrinkles,t.wrinkles),outfit:sg(e.outfit,i("outfit",{top:(a,l)=>Dt(pt.top,a,l),topColour:r,pattern:(a,l)=>["none","flowers","stripes","dots"].includes(a)?a:l,bottom:(a,l)=>Dt(pt.bottom,a,l),bottomColour:r,bottomPattern:a=>a==="plaid"?"plaid":"none",footwear:(a,l)=>Dt(pt.footwear,a,l),shoes:r,hat:(a,l)=>Dt(pt.hat,a,l),hatColour:r,accent:r})),accessories:i("accessories",{earrings:(a,l)=>Dt(pt.earrings,a,l),neckwear:(a,l)=>Dt(pt.neckwear,a,l),colour:r,pin:o}),swim:i("swim",{colour:r}),profile:(()=>{const a=i("profile",{pace:s,talk:s,show:s,outlook:s,pitch:s,speed:s,month:(l,c)=>Number.isInteger(+l)&&+l>=1&&+l<=12?+l:c,day:(l,c)=>Number.isInteger(+l)&&+l>=1&&+l<=31?+l:c,favourite:r,catchphrase:(l,c)=>l===void 0?c:String(l).replace(/[\u0000-\u001f<>]/g,"").slice(0,40)});return a.day=Math.min(a.day,[31,29,31,30,31,30,31,31,30,31,30,31][a.month-1]),a})()}}function sg(n,e){return!n||typeof n!="object"||(n.top===void 0&&(e.top="tee",n.topColour===void 0&&(e.topColour="#3fa0c8")),n.bottom===void 0&&(e.bottom="trousers",n.bottomColour===void 0&&(e.bottomColour="#27304d")),pt.footwear.includes(n.footwear)||(e.footwear="sneakers")),e}function Cc(n){const e=JSON.stringify(Bt(n)),t=new TextEncoder().encode(e);let i="";for(const s of t)i+=String.fromCharCode(s);return btoa(i).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}function Ko(n){try{const e=atob(String(n).replace(/-/g,"+").replace(/_/g,"/")),t=Uint8Array.from(e,i=>i.charCodeAt(0));return Bt(JSON.parse(new TextDecoder().decode(t)))}catch{return null}}function Jo(n=""){let e=2166136261;for(const t of String(n))e=Math.imul(e^t.codePointAt(0),16777619)>>>0;return()=>{e=e+1831565813>>>0;let t=e;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}function My(n=Math.random().toString(36)){const e=Jo(n),t=a=>a[Math.floor(e()*a.length)],i=Q0,s=e()<.3,r=e()<.5,o=t(s?r?["perm","bun","bob"]:["horseshoe","buzz","crop","bald"]:r?["bob","long","ponytail","braids","bun","sidepart"]:["crop","sidepart","spiky","buzz","afro"]);return Bt({body:{height:.3+e()*.5,build:.25+e()*.55,skin:t(i.skin.slice(0,7))},head:{size:.4+e()*.25,shape:e(),form:t(jo),jaw:e(),cheeks:e()},hair:{style:o,colour:t(s?["#9a9a96","#d8d6d0","#5a3a22"]:i.hair.slice(0,6)),flip:e()<.5},eyes:{style:t(pt.eyes),colour:t(i.eyes),size:.3+e()*.5,spacing:.3+e()*.4,height:.4+e()*.2,tilt:.35+e()*.3},brows:{style:t(pt.brows.slice(0,6)),colour:s?"#8a8a86":"#1c1714",size:.4+e()*.3,height:.4+e()*.3,tilt:.3+e()*.4},nose:{style:t(pt.nose.slice(0,5)),size:.3+e()*.5,height:.4+e()*.2},mouth:{style:t(pt.mouth),colour:r&&e()<.5?t(i.lips):"#b8544a",size:.35+e()*.4,height:.4+e()*.2},glasses:{style:e()<.25?t(pt.glasses.slice(1)):"none",colour:t(["#2b2b2b","#8a4a3a","#c8a060","#e06a7a"])},facial:{style:!r&&e()<.3?t(pt.facial.slice(1)):"none",colour:"#3a2618"},blush:r?.3+e()*.4:e()*.2,freckles:e()<.12,mole:e()<.1,wrinkles:s?.5+e()*.5:0,outfit:{top:t(["tee","kariyushi","polo","blouse","jacket"]),topColour:t(i.cloth),pattern:e()<.3?t(["flowers","stripes","dots"]):"none",bottom:r&&e()<.4?t(["skirt","longskirt","widepants","cropped","culottes","pleatedskirt"]):t(["shorts","trousers"]),bottomColour:t(["#27304d","#6d7478","#c8b48a","#2b2b2b","#9a6a42","#2f5f9e"]),shoes:t(["#6d4a32","#2b2b2b","#f4f1ea","#d8342c"]),footwear:t(["sneakers","sandals","shoes","boots"]),hat:"none",hatColour:"#f4f1ea",accent:t(i.cloth)},profile:{pace:e(),talk:e(),show:e(),outlook:e(),pitch:r?.45+e()*.5:e()*.6,speed:e(),month:1+Math.floor(e()*12),day:1+Math.floor(e()*28),favourite:t(i.cloth)}})}const ot=Math.PI*2,rg=Object.freeze(["#b8544a","#a8433e","#9a4a40"]);function Mi(n,e){const t=parseInt(n.slice(1),16),i=s=>Math.max(0,Math.min(255,Math.round(s*e)));return"#"+[i(t>>16),i(t>>8&255),i(t&255)].map(s=>s.toString(16).padStart(2,"0")).join("")}function _r(n){const e=n.eyes,t=n.brows,i=n.nose,s=n.mouth,r=104+(e.height-.5)*-56,o=38+(e.spacing-.5)*36,a=1.16+e.size*.8;return{eyeY:r,spread:o,eyeS:a,eyeW:.85+(e.width??.5)*.7,eyeTilt:(e.tilt-.5)*.85,browY:70+(t.height-.5)*-48,browSpread:o+((t.spacing??.5)-.5)*32,browS:.75+t.size*.6,browTilt:(t.tilt-.5)*.85,noseY:134+(i.height-.5)*-48,noseX:128+((i.x??.5)-.5)*48,noseS:.7+i.size*.7,mouthY:160+(s.height-.5)*-54,mouthX:128+((s.x??.5)-.5)*56,mouthS:1+s.size*.8,mouthW:.65+(s.width??.5)*.7}}const vo=Object.freeze({neutral:{eyes:"open",brow:0,browLift:0,mouth:null,blush:0},smile:{eyes:"smiling",brow:0,browLift:3,mouth:"smile",blush:.15},content:{eyes:"content",brow:0,browLift:1,mouth:"smile",blush:.1},happy:{eyes:"happy",brow:0,browLift:10,mouth:"grin",blush:.4},laugh:{eyes:"happy",brow:0,browLift:14,mouth:"laugh",blush:.55},sad:{eyes:"sad",brow:-1,browLift:3,mouth:"frown",blush:0},worried:{eyes:"worry",brow:-1.35,browLift:10,mouth:"wobble",blush:0},angry:{eyes:"angry",brow:1.4,browLift:-5,mouth:"snarl",blush:.15},grumpy:{eyes:"angry",brow:.6,browLift:-2,mouth:"frown",blush:0},shy:{eyes:"shy",brow:-.4,browLift:3,mouth:"small",blush:1},surprised:{eyes:"wide",brow:0,browLift:20,mouth:"o",blush:0},thinking:{eyes:"side",brow:.3,browLift:0,mouth:"hmm",blush:0},sleep:{eyes:"closed",brow:0,browLift:-1,mouth:"small",blush:0}});Object.freeze(Object.keys(vo));function og(n,e,t={}){const i=t.size||256,s=i/256,r=vo[t.expression]||vo.neutral,o=_r(e),a=e.body.skin,l="#2b2623";if(n.canvas.__skin=a,n.save(),n.setTransform(s,0,0,s,0,0),n.fillStyle=a,n.fillRect(0,0,256,256),n.lineCap="round",n.lineJoin="round",e.wrinkles>.05){n.strokeStyle=Mi(a,.8),n.lineWidth=1.6,n.globalAlpha=Math.min(1,e.wrinkles);for(const f of[-1,1]){const g=128+f*(o.spread+16*o.eyeS);for(let _=0;_<2;_++)n.beginPath(),n.moveTo(g,o.eyeY-4+_*7),n.lineTo(g+f*8,o.eyeY-6+_*9),n.stroke();n.beginPath(),n.arc(128+f*22,o.mouthY-6,14,f>0?-.2:Math.PI-.6,f>0?.6:Math.PI+.2),n.stroke()}for(let f=0;f<2;f++)n.beginPath(),n.moveTo(104,o.browY-14-f*7),n.quadraticCurveTo(128,o.browY-18-f*7,152,o.browY-14-f*7),n.stroke();n.globalAlpha=1}if(e.freckles){n.fillStyle=Mi(a,.72);for(const f of[-1,1])for(let g=0;g<5;g++)n.beginPath(),n.arc(128+f*(o.spread+g%3*5-2),o.noseY-2+Math.floor(g/3)*6,1.5,0,ot),n.fill()}e.mole&&(n.fillStyle="#4a3024",n.beginPath(),n.arc(128+o.spread*.9,o.mouthY-6,2.4,0,ot),n.fill());const c=Math.min(1,e.blush*.8+r.blush);if(c>.02){for(const f of[-1,1]){const g=128+f*(o.spread+8),_=o.noseY+2,m=n.createRadialGradient(g,_,1,g,_,17);m.addColorStop(0,`rgba(236,110,120,${.55*c})`),m.addColorStop(1,"rgba(236,110,120,0)"),n.fillStyle=m,n.beginPath(),n.ellipse(g,_,18,12,0,0,ot),n.fill()}if(r.blush>=.9){n.strokeStyle="rgba(210,80,90,.7)",n.lineWidth=1.6;for(const f of[-1,1])for(let g=0;g<3;g++){const _=128+f*(o.spread+2+g*6);n.beginPath(),n.moveTo(_-2,o.noseY+6),n.lineTo(_+2,o.noseY-2),n.stroke()}}}const u=Math.max(0,Math.min(1,t.blink||0))>.5&&r.eyes!=="happy"?"closed":r.eyes,p=t.look||[0,0];for(const f of[-1,1])Pc(n,128+f*o.spread,o.eyeY,o.eyeS,f,e.eyes,u,p,o.eyeTilt,o.eyeW);if(e.brows.style!=="none")for(const f of[-1,1])Lc(n,128+f*o.browSpread,o.browY-r.browLift,o.browS,f,e.brows,o.browTilt,r.brow);Ic(n,o.noseX,o.noseY,o.noseS,e.nose.style,a),bo(n,o.mouthX,o.mouthY,o.mouthS,e.mouth,r.mouth,t.talk||0,l,o.mouthW),Dc(n,o,e.facial),Nc(n,o,e.glasses),n.restore()}function Pc(n,e,t,i,s,r,o,a,l,c=1){const h=r.style,u="#2b2623";if(n.save(),n.translate(e,t),n.rotate(s*l*-1),n.scale(i*c,i),n.strokeStyle=u,n.fillStyle=u,n.lineWidth=3.2,o==="wide"||o==="worry"){const _=o==="wide"?15:13,m=o==="wide"?19:16;if(n.fillStyle="#fbfaf6",n.beginPath(),n.ellipse(0,0,_,m,0,0,ot),n.fill(),n.stroke(),n.fillStyle=r.colour,n.beginPath(),n.ellipse(a[0]*3,a[1]*3,_*.58,m*.62,0,0,ot),n.fill(),n.fillStyle=u,n.beginPath(),n.ellipse(a[0]*3,a[1]*3,_*.36,m*.42,0,0,ot),n.fill(),n.fillStyle="#fff",n.beginPath(),n.arc(3,-5,3,0,ot),n.fill(),h==="lashes")for(let d=0;d<3;d++)n.beginPath(),n.moveTo(s*_*.8,-9+d*5),n.lineTo(s*(_+6),-12+d*6),n.stroke();n.restore();return}if(o==="closed"||o==="content"){n.beginPath(),n.arc(0,o==="content"?-3:-6,11,Math.PI*.18,Math.PI*.82),n.stroke(),h==="lashes"&&(n.beginPath(),n.moveTo(s*9,2),n.lineTo(s*14,5),n.stroke()),n.restore();return}if(o==="happy"){n.lineWidth=5.2,n.beginPath(),n.moveTo(-13,4),n.quadraticCurveTo(0,-21,13,4),n.stroke(),n.restore();return}const p=o==="wide"?1.3:1,f=(h==="narrow"?12:h==="dot"?6:h==="sparkle"?13:11.5)*p,g=(h==="narrow"?4.2:h==="dot"?9:h==="almond"?9.5:h==="sparkle"?15:13.5)*p;if(["round","gentle","lashes","sleepy"].includes(h)){const _=(h==="sleepy"?6:h==="gentle"?9:12)*p;if(n.save(),n.beginPath(),n.ellipse(a[0]*2,a[1]*2,9*p,_,0,0,ot),n.clip(),n.fill(),n.fillStyle=n.canvas.__skin,o==="angry"||o==="sad"){const m=o==="angry"?-s:s;n.beginPath(),n.moveTo(-14,-_-2),n.lineTo(14,-_-2),n.lineTo(m*14,1),n.closePath(),n.fill()}else o==="shy"?n.fillRect(-14,-_-2,28,_*.7):o==="smiling"&&(n.beginPath(),n.ellipse(0,_+5,15,9,0,0,ot),n.fill());if(n.restore(),["angry","sad","shy"].includes(o)||(n.fillStyle="#fbfaf6",n.beginPath(),n.arc(a[0]*2+2,-_*.35+a[1]*2,1.8,0,ot),n.fill()),h==="lashes"){n.lineWidth=2.8;for(let m=0;m<2;m++)n.beginPath(),n.moveTo(s*5,-5-m*3),n.lineTo(s*(11+m*2),-8-m*4),n.stroke()}}else if(h==="dot")n.beginPath(),n.ellipse(a[0]*2,a[1]*2,f,g,0,0,ot),n.fill(),n.fillStyle="#fff",n.beginPath(),n.arc(2+a[0]*2,-3,2.2,0,ot),n.fill();else if(h==="narrow")n.beginPath(),n.ellipse(0,0,f,g,0,0,ot),n.fill();else{n.fillStyle="#fbfaf6",n.beginPath(),h==="almond"?(n.moveTo(-f,1),n.quadraticCurveTo(-2,-g*1.5,f,-1),n.quadraticCurveTo(0,g*1.3,-f,1)):n.ellipse(0,0,f,g,0,0,ot),n.fill(),n.save(),n.clip();const _=h==="sparkle"?10:7.4,m=a[0]*4,d=a[1]*3+(h==="gentle"?3:1);if(n.fillStyle=r.colour,n.beginPath(),n.arc(m,d,_,0,ot),n.fill(),n.fillStyle="#120c0a",n.beginPath(),n.arc(m,d,_*.5,0,ot),n.fill(),n.fillStyle="#fff",n.beginPath(),n.arc(m+_*.38,d-_*.4,_*.3,0,ot),n.fill(),h==="sparkle"&&(n.beginPath(),n.arc(m-_*.35,d+_*.4,_*.16,0,ot),n.fill()),n.fillStyle=n.canvas.__skin||"#e8bf98",(h==="sleepy"||o==="shy")&&n.fillRect(-f-2,-g-2,f*2+4,g*.9),o==="sad"&&(n.beginPath(),n.moveTo(-f-2,-g-2),n.lineTo(f+2,-g-2),n.lineTo(s*f+2*s,-g*.1),n.closePath(),n.fill()),o==="angry"&&(n.beginPath(),n.moveTo(-f-2,-g-2),n.lineTo(f+2,-g-2),n.lineTo(-s*f-2*s,-g*.05),n.closePath(),n.fill()),n.restore(),n.lineWidth=2.4,n.beginPath(),h==="almond"?(n.moveTo(-f,1),n.quadraticCurveTo(-2,-g*1.5,f,-1),n.stroke()):(n.ellipse(0,0,f,g,0,Math.PI*1.05,Math.PI*1.95),n.stroke()),h==="gentle"&&(n.lineWidth=3,n.beginPath(),n.arc(0,g*.3,f*1.02,Math.PI*1.12,Math.PI*1.88),n.stroke()),h==="lashes"){n.lineWidth=2.2;for(let v=0;v<3;v++){const b=-Math.PI/2+s*(.55+v*.28);n.beginPath(),n.moveTo(Math.cos(b)*f*.95,Math.sin(b)*g*.95),n.lineTo(Math.cos(b)*(f+6),Math.sin(b)*(g+5)),n.stroke()}}}o==="sad"&&(n.strokeStyle="rgba(120,180,230,.7)",n.lineWidth=2.2,n.beginPath(),n.moveTo(s*-4,g),n.lineTo(s*-5,g+8),n.stroke()),n.restore()}function Lc(n,e,t,i,s,r,o,a){n.save(),n.translate(e,t),n.scale(i,i),n.rotate(s*(o*-1+a*.48));const l=Mi(r.colour,.68);n.strokeStyle=l,n.fillStyle=l,n.lineCap="round";const c=r.style,h=c==="thick"||c==="bushy"?7:c==="thin"?2.4:4.2;if(n.lineWidth=h,n.beginPath(),c==="arched")n.moveTo(-13,3),n.quadraticCurveTo(0,-7,13,2);else if(c==="worried")n.moveTo(-13,-3),n.quadraticCurveTo(0,0,13,3);else if(c==="bushy"){n.moveTo(-14,2),n.quadraticCurveTo(0,-5,14,1),n.stroke(),n.lineWidth=2;for(let u=-12;u<=12;u+=4)n.beginPath(),n.moveTo(u,-2),n.lineTo(u+2*s,-7),n.stroke();n.restore();return}else n.moveTo(-13,1),n.quadraticCurveTo(0,-3,13,1);n.stroke(),n.restore()}function Ic(n,e,t,i,s,r,o){if(n.save(),n.translate(e,t),n.scale(i,i),n.strokeStyle=Mi(r,.62),n.fillStyle=Mi(r,.8),n.lineWidth=2.4,s==="button")n.beginPath(),n.ellipse(0,0,7,5.5,0,0,ot),n.fill(),n.fillStyle="rgba(255,255,255,.35)",n.beginPath(),n.arc(-2,-2,2,0,ot),n.fill();else if(s==="dot"){n.fillStyle=Mi(r,.6);for(const a of[-3,3])n.beginPath(),n.arc(a,0,1.6,0,ot),n.fill()}else s==="line"?(n.beginPath(),n.moveTo(1,-12),n.quadraticCurveTo(-2,0,3,4),n.lineTo(-3,4),n.stroke()):s==="wide"?(n.beginPath(),n.moveTo(-10,-2),n.quadraticCurveTo(-11,6,-3,5),n.moveTo(10,-2),n.quadraticCurveTo(11,6,3,5),n.stroke(),n.beginPath(),n.ellipse(0,1,6,4,0,0,ot),n.fill()):s==="hook"&&(n.beginPath(),n.moveTo(-1,-16),n.quadraticCurveTo(8,2,1,6),n.lineTo(-4,4),n.stroke());n.restore()}function bo(n,e,t,i,s,r,o,a,l=1){n.save(),n.translate(e,t),n.scale(i*l,i);const c=s.colour,h=!rg.includes(c.toLowerCase());n.strokeStyle=h?c:a,n.lineWidth=h?3.6:3.4,n.lineCap="round";const u="#2b2623",p="#e07a80",f="#fbfaf6",g=(m,d,v=0)=>{n.fillStyle=u,n.beginPath(),n.moveTo(-m,0),n.quadraticCurveTo(0,-v,m,0),n.quadraticCurveTo(0,d*2,-m,0),n.fill(),n.save(),n.clip(),n.fillStyle=f,n.fillRect(-m,-d,m*2,d*.55+v*.2),n.fillStyle=p,n.beginPath(),n.ellipse(0,d*1.3,m*.55,d*.55,0,0,ot),n.fill(),n.restore(),n.beginPath(),n.moveTo(-m,0),n.quadraticCurveTo(0,-v,m,0),n.quadraticCurveTo(0,d*2,-m,0),n.stroke()},_=o>.5?"talk":r||s.style;switch(n.beginPath(),_){case"talk":{const m=["grin","laugh","o"].includes(r);g(m?19:12,(m?13:7)+o*3,m?6:2);break}case"grin":g(24,15,5);break;case"laugh":g(28,23,7);break;case"o":n.fillStyle=u,n.ellipse(0,3,13,20,0,0,ot),n.fill(),n.stroke();break;case"frown":n.arc(0,12,13,Math.PI*1.2,Math.PI*1.8),n.stroke();break;case"snarl":n.moveTo(-12,4),n.lineTo(-4,0),n.lineTo(4,0),n.lineTo(12,4),n.stroke();break;case"wobble":n.moveTo(-14,1),n.quadraticCurveTo(0,5,14,1),n.moveTo(-14,-4),n.quadraticCurveTo(-10,1,-14,7),n.moveTo(14,-4),n.quadraticCurveTo(10,1,14,7),n.stroke();break;case"hmm":n.moveTo(-8,2),n.lineTo(8,-1),n.stroke();break;case"smile":n.moveTo(-16,-1),n.quadraticCurveTo(0,15,16,-1),n.stroke();break;case"flat":n.moveTo(-11,1),n.lineTo(11,1),n.stroke();break;case"small":n.arc(0,-3,6,Math.PI*.25,Math.PI*.75),n.stroke();break;case"wide":n.arc(0,-10,18,Math.PI*.22,Math.PI*.78),n.stroke();break;case"smirk":n.moveTo(-10,2),n.quadraticCurveTo(2,4,11,-4),n.stroke();break;case"pout":n.fillStyle=c,n.ellipse(0,1,6,4.5,0,0,ot),n.fill();break;default:n.arc(0,-8,13,Math.PI*.2,Math.PI*.8),n.stroke()}h&&["smile","small","wide","flat","smirk","wobble"].includes(_)&&(n.fillStyle=c,n.globalAlpha=.85,n.beginPath(),n.ellipse(0,2,_==="wide"?13:9,3.2,0,0,ot),n.fill(),n.globalAlpha=1),n.restore()}function Dc(n,e,t){if(t.style==="none")return;n.save(),n.fillStyle=t.colour,n.strokeStyle=t.colour;const i=(e.noseY+e.mouthY)/2+2;if(t.style==="moustache")n.beginPath(),n.moveTo(128,i-3),n.quadraticCurveTo(114,i-6,108,i+3),n.quadraticCurveTo(118,i+1,128,i+2),n.quadraticCurveTo(138,i+1,148,i+3),n.quadraticCurveTo(142,i-6,128,i-3),n.fill();else if(t.style==="walrus")n.beginPath(),n.ellipse(128,i+1,24,8,0,0,ot),n.fill();else if(t.style==="stubble"){n.globalAlpha=.35;for(let s=0;s<140;s++){const r=Math.PI*(.1+.8*(s%47)/46),o=46+s*7%11,a=128+Math.cos(r)*o*.95,l=e.mouthY-26+Math.sin(r)*o*.8;l>e.noseY+8&&n.fillRect(a,l,1.6,1.6)}n.globalAlpha=1}else t.style==="beard"?(n.beginPath(),n.moveTo(84,e.noseY),n.quadraticCurveTo(90,e.mouthY+40,128,e.mouthY+42),n.quadraticCurveTo(166,e.mouthY+40,172,e.noseY),n.lineTo(160,e.noseY+4),n.quadraticCurveTo(150,e.mouthY+18,128,e.mouthY+16),n.quadraticCurveTo(106,e.mouthY+18,96,e.noseY+4),n.closePath(),n.fill()):t.style==="goatee"&&(n.beginPath(),n.ellipse(128,e.mouthY+18,9,11,0,0,ot),n.fill());n.restore()}function Nc(n,e,t){if(t.style==="none")return;n.save(),n.strokeStyle=t.colour,n.lineWidth=3.2;const i=15*e.eyeS+2,s=e.eyeY,r=i*e.eyeW;for(const o of[-1,1]){const a=128+o*e.spread;n.beginPath(),t.style==="round"?n.ellipse(a,s,r,i,0,0,ot):t.style==="half"?n.ellipse(a,s-2,r,i,0,Math.PI*.05,Math.PI*.95):n.roundRect?n.roundRect(a-r*1.1,s-i*.8,r*2.2,i*1.6,6):n.rect(a-r*1.1,s-i*.8,r*2.2,i*1.6),t.style==="sun"&&(n.fillStyle="rgba(30,34,40,.9)",n.fill()),n.stroke(),t.style!=="sun"&&(n.save(),n.strokeStyle="rgba(255,255,255,.55)",n.lineWidth=2,n.beginPath(),n.moveTo(a+i*.3,s-i*.55),n.lineTo(a+i*.6,s-i*.25),n.stroke(),n.restore())}n.beginPath(),n.moveTo(128-e.spread+r*(t.style==="round"||t.style==="half"?1:1.1),s-2),n.quadraticCurveTo(128,s-8,128+e.spread-r*(t.style==="round"||t.style==="half"?1:1.1),s-2),n.stroke(),n.restore()}function xy(n,e,t,i=n.canvas.width){const s=e.body.skin,r="#2b2623",o={...e,eyes:{...e.eyes,height:.5,spacing:.5,size:.5,tilt:.5},brows:{...e.brows,height:.5,spacing:.5,size:.5,tilt:.5},nose:{...e.nose,height:.5,x:.5,size:.5},mouth:{...e.mouth,height:.5,x:.5,size:.5,width:.5}},a=_r(o),l={eyes:[128,a.eyeY,1.75],glasses:[128,a.eyeY,1.6],brows:[128,a.browY,2],nose:[128,a.noseY,3.4],mouth:[128,a.mouthY+2,2.7],facial:[128,(a.noseY+a.mouthY)/2+(e.facial.style==="beard"?18:e.facial.style==="goatee"?14:2),e.facial.style==="beard"?1.5:2.2]}[t]||[128,128,1],c=i/256;if(n.save(),n.setTransform(c,0,0,c,0,0),n.canvas.__skin=s,n.fillStyle=s,n.fillRect(0,0,256,256),n.translate(128,128),n.scale(l[2],l[2]),n.translate(-l[0],-l[1]),n.lineCap="round",n.lineJoin="round",t==="eyes"||t==="glasses")for(const u of[-1,1])Pc(n,128+u*a.spread,a.eyeY,a.eyeS,u,o.eyes,"open",[0,0],a.eyeTilt,a.eyeW);if(t==="brows"&&e.brows.style!=="none")for(const u of[-1,1])Lc(n,128+u*a.browSpread,a.browY,a.browS,u,o.brows,a.browTilt,0);t==="nose"&&Ic(n,a.noseX,a.noseY,a.noseS,e.nose.style,s),t==="mouth"&&bo(n,a.mouthX,a.mouthY,a.mouthS,o.mouth,null,0,r,a.mouthW),t==="facial"&&(bo(n,a.mouthX,a.mouthY,a.mouthS,{...o.mouth,style:"flat"},null,0,"rgba(43,38,35,.35)",a.mouthW),Dc(n,a,e.facial)),t==="glasses"&&Nc(n,a,e.glasses),n.restore(),(t==="brows"&&e.brows.style==="none"||t==="nose"&&e.nose.style==="none"||t==="glasses"&&e.glasses.style==="none"||t==="facial"&&e.facial.style==="none")&&(n.save(),n.strokeStyle="rgba(43,38,35,.25)",n.lineWidth=i*.04,n.lineCap="round",n.beginPath(),n.moveTo(i*.3,i*.7),n.lineTo(i*.7,i*.3),n.stroke(),n.restore())}function ag(n,e=2){return n.userData.worldTextureScale=e,n.onBeforeCompile=t=>{t.uniforms.townTileMetres={value:e},t.vertexShader=`uniform float townTileMetres;
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
      #endif`)},n.customProgramCacheKey=()=>"town-world-uv-v1",n}const Ll={2:[96,255],3:[92,178,255],4:[80,142,202,255],soft:[180,255],soft3:[172,214,255]},io=new Map;function lg(n=3){if(io.has(n))return io.get(n);const e=Ll[n]||Ll[3],t=new Uint8Array(e.length*4);for(let s=0;s<e.length;s++)t[s*4]=t[s*4+1]=t[s*4+2]=e[s],t[s*4+3]=255;const i=new hr(t,e.length,1,1023);return i.minFilter=i.magFilter=1003,i.generateMipmaps=!1,i.needsUpdate=!0,io.set(n,i),i}const Uc="lights_toon_pars_fragment",Il="vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;",cg=`
	vec3 celBand = getGradientIrradiance( geometryNormal, directLight.direction );
	vec3 irradiance = celBand * mix( uShadowTint, vec3( 1.0 ), celBand ) * directLight.color;`;let Mo="";{const n=Ve[Uc];n.includes(Il)&&(Mo=`uniform vec3 uShadowTint;
`+n.replace(Il,cg))}const kc="map_fragment",Dl="diffuseColor *= sampledDiffuseColor;",hg=`diffuseColor.rgb *= mix( vec3( 1.0 ), sampledDiffuseColor.rgb, uFlatten );
	diffuseColor.a *= sampledDiffuseColor.a;`,ug=`uniform float uFlatten;
`;let xo="";{const n=Ve[kc];n.includes(Dl)&&(xo=n.replace(Dl,hg))}const dg=.65;function fg(n){return!!(n.normalMap||n.roughnessMap||n.bumpMap||n.aoMap)}function pg(n,e,t=1,{base:i=null,baseKey:s=""}={}){const r=!!Mo,o=!!xo&&t<1&&!!n.map;if(!r&&!o&&!i)return n;const a={value:new Ne(e)},l={value:t};n.userData.shadowTint=a,n.userData.flatten=l,n.onBeforeCompile=(h,u)=>{i?.(h,u),r&&(h.uniforms.uShadowTint=a,h.fragmentShader=h.fragmentShader.replace("#include <"+Uc+">",Mo)),o&&(h.uniforms.uFlatten=l,h.fragmentShader=ug+h.fragmentShader.replace("#include <"+kc+">",xo))};const c=new Ne(e).getHexString();return n.customProgramCacheKey=()=>"cel_"+c+"_"+(o?t:1)+"_"+s,n}const Fc=7102348,mg=.66;function gg(n){return n?n.r*.2126+n.g*.7152+n.b*.0722:0}function _g(n){return gg(n.color)>=mg?"soft3":3}function yg(n,{skinned:e=!1}={}){return e?!0:n.userData?.keepPhysical!==!0?!1:n.userData.keepPhysicalStrict===!0?!0:!!n.transparent&&(n.opacity??1)<.95}const vg=.3,so=new WeakMap;function yr(n,{tint:e=Fc,bands:t=null}={}){if(so.has(n))return so.get(n);const i=new w0({color:n.color?n.color.clone():new Ne(16777215),map:n.map||null,alphaMap:n.alphaMap||null,gradientMap:lg(t??_g(n)),transparent:n.transparent,opacity:n.opacity,side:n.side,alphaTest:n.alphaTest,fog:n.fog,vertexColors:n.vertexColors,emissive:n.emissive?n.emissive.clone():new Ne(0),emissiveMap:n.emissiveMap||null,emissiveIntensity:n.emissiveIntensity??1});i.depthWrite=n.depthWrite,i.depthTest=n.depthTest,i.polygonOffset=n.polygonOffset,i.polygonOffsetFactor=n.polygonOffsetFactor,i.polygonOffsetUnits=n.polygonOffsetUnits,i.name=n.name,i.userData={...n.userData,celFrom:n};const s=n.userData?.worldTextureScale;Number.isFinite(s)&&ag(i,s);const r=typeof i.onBeforeCompile=="function"?i.onBeforeCompile:null,o=Number.isFinite(s)?"worlduv"+s:"",a=n.userData?.keepPhysical===!0;return pg(i,e,fg(n)?a?vg:dg:1,{base:r,baseKey:o}),so.set(n,i),bg(n,i),i}function bg(n,e){n.emissive&&n.emissive.isColor&&(e.emissive=n.emissive);for(const t of["emissiveIntensity","opacity","visible"]){let i=n[t];try{Object.defineProperty(n,t,{configurable:!0,enumerable:!0,get(){return i},set(s){i=s,e[t]=s,t==="opacity"&&(e.needsUpdate=e.needsUpdate)}})}catch{}}}function Mg(n,e){return!n||n.isMeshToonMaterial||!n.isMeshStandardMaterial&&!n.isMeshPhongMaterial&&!n.isMeshLambertMaterial?!0:yg(n,{skinned:e})}function Sy(n,{tint:e=Fc,seen:t=null,force:i=!1,collect:s=null}={}){const r={converted:0,skipped:0,visited:0};return n&&n.traverse(o=>{if(!o.isMesh&&!o.isPoints&&!o.isLine)return;if(!i&&t){if(t.has(o))return;t.add(o)}r.visited++;const a=!!o.isSkinnedMesh,l=c=>{if(Mg(c,a))return r.skipped++,c;r.converted++;const h=yr(c,{tint:e});return s&&h.userData.flatten&&s.add(h.userData.flatten),h};o.material=Array.isArray(o.material)?o.material.map(l):l(o.material)}),r}const So=Object.freeze(["root","hips","spine","chest","neck","head","shoulderL","elbowL","handL","shoulderR","elbowR","handR","thighL","kneeL","footL","thighR","kneeR","footR"]),wo=Object.fromEntries(So.map((n,e)=>[n,e])),Nl=Object.freeze({child:{base:1.12,span:.2,head:1.4},teen:{base:1.4,span:.28,head:1.18},adult:{base:1.36,span:.44,head:1.12},elder:{base:1.33,span:.34,head:1.14}});function Zo(n){const e=Bt(n),t=Nl[e.age]||Nl.adult,i=t.base+e.body.height*t.span,s=i/1.6,r=e.body.build,o=$0(e.head),a=(.19+e.head.size*.055)*s*t.head,l=o.width,c=o.height,h=.055*s,u=i-a*2*c-h,p=u*.47,f=u-p,g=.07*s,_=(p-g)*.5,m=_,d=(.058+r*.024)*s,v=(.045+r*.016)*s,b=e.body.silhouette==="feminine",y=e.body.silhouette==="masculine",N=(.3+r*.15)*s*(b?.94:y?1.08:1),A=(.2+r*.09)*s,w=N*(b?1.13:y?.9:1),T=b?.79:y?.98:.96,x=.22*s,M=.2*s,C=.056*s,F=p,D=F+f*.5,U=F+f,V=U+h;return{H:i,k:s,Rh:a,headSX:l,headSY:c,profile:o,neck:h,torso:f,leg:p,foot:g,thigh:_,shin:m,legR:d,armR:v,width:N,hips:w,waistRatio:T,depth:A,upper:x,fore:M,hand:C,hipY:F,chestY:D,neckY:U,headY:V,headCentre:V+a*c*.94,shoulderX:N/2-v*.2,shoulderY:U-.075*s,hipX:w*.24,seatDrop:d*.95}}function xg(n){return{root:[0,0,0],hips:[0,n.hipY,0],spine:[0,n.hipY+n.torso*.25,0],chest:[0,n.chestY,0],neck:[0,n.neckY,0],head:[0,n.headY,0],shoulderL:[n.shoulderX,n.shoulderY,0],elbowL:[n.shoulderX+.01,n.shoulderY-n.upper,0],handL:[n.shoulderX+.015,n.shoulderY-n.upper-n.fore,0],shoulderR:[-n.shoulderX,n.shoulderY,0],elbowR:[-n.shoulderX-.01,n.shoulderY-n.upper,0],handR:[-n.shoulderX-.015,n.shoulderY-n.upper-n.fore,0],thighL:[n.hipX,n.hipY,0],kneeL:[n.hipX,n.hipY-n.thigh,0],footL:[n.hipX,n.foot,0],thighR:[-n.hipX,n.hipY,0],kneeR:[-n.hipX,n.hipY-n.thigh,0],footR:[-n.hipX,n.foot,0]}}const Sg={hips:"root",spine:"hips",chest:"spine",neck:"chest",head:"neck",shoulderL:"chest",elbowL:"shoulderL",handL:"elbowL",shoulderR:"chest",elbowR:"shoulderR",handR:"elbowR",thighL:"hips",kneeL:"thighL",footL:"kneeL",thighR:"hips",kneeR:"thighR",footR:"kneeR"},Ji=new Ne,Ul=(()=>{const n=new Vo;for(let t=0;t<=40;t++){const i=t/40*Math.PI*2,s=.55+.45*Math.abs(Math.cos(i*2.5)),r=Math.cos(i)*s,o=Math.sin(i)*s;t?n.lineTo(r,o):n.moveTo(r,o)}const e=new Wo(n);return e.userData.keep=!0,e})(),kl=(()=>{const n=new dr(1,10);return n.userData.keep=!0,n})();function mi(n,e){for(let t=1;t<n.length;t++){const[i,s]=n[t-1],[r,o]=n[t];if(e<=o)return i+(r-i)*((e-s)/(o-s||1))}return n.at(-1)[0]}function Ae(n,e,t,i,s){let r=e.index?e.toNonIndexed():e.clone();for(const _ of Object.keys(r.attributes))["position","normal"].includes(_)||r.deleteAttribute(_);s&&r.applyMatrix4(s);const o=r.attributes.position.count,a=new Float32Array(o*3),l=new Uint16Array(o*4),c=new Float32Array(o*4),h=typeof i=="function"?i:null,u=typeof t=="function"?t:null;h||Ji.set(i);const p=new L,f=new L,g=new L;for(let _=0;_<o;_++){if(h&&_%3===0){const v=r.attributes.position;p.fromBufferAttribute(v,_),f.fromBufferAttribute(v,_+1),g.fromBufferAttribute(v,_+2),p.add(f).add(g).multiplyScalar(1/3),Ji.set(h(p))}if(a[_*3]=Ji.r,a[_*3+1]=Ji.g,a[_*3+2]=Ji.b,!u){l[_*4]=wo[t],c[_*4]=1;continue}p.fromBufferAttribute(r.attributes.position,_);const m=u(p).filter(([,v])=>v>.001).slice(0,4),d=m.reduce((v,[,b])=>v+b,0)||1;m.forEach(([v,b],y)=>{l[_*4+y]=wo[v],c[_*4+y]=b/d})}return r.setAttribute("color",new Nt(a,3)),r.setAttribute("skinIndex",new ko(l,4)),r.setAttribute("skinWeight",new Nt(c,4)),n.push(r),e!==r&&!e.userData?.keep&&e.dispose?.(),r}const De=(n=0,e=0,t=0,i=0,s=0,r=0,o=1,a=1,l=1)=>new Ge().compose(new L(n,e,t),new _t().setFromEuler(new nn(i,s,r)),new L(o,a,l));function Wn(n,e,t,i,s,r,o=10){const a=new L(...e),l=new L(...t),c=l.clone().sub(a),h=c.length(),u=new ur(i,Math.max(.001,h),3,o),p=new _t().setFromUnitVectors(new L(0,1,0),c.normalize());Ae(n,u,s,r,new Ge().compose(a.clone().add(l).multiplyScalar(.5),p,new L(1,1,1)))}function Hn(n,e,t,i,s,r,{bone:o,joints:a=[],root:l=null,soft:c=.13,segments:h=14}={}){const u=new L(...e),p=new L(...t),f=p.clone().sub(u),g=f.length(),_=f.clone().normalize(),m=[],d=5,v=12;for(let T=0;T<=d;T++){const x=-Math.PI/2+T/d*Math.PI/2;m.push(new ae(Math.cos(x)*i,-g/2+Math.sin(x)*i))}for(let T=1;T<v;T++)m.push(new ae(i,-g/2+T/v*g));for(let T=0;T<=d;T++){const x=T/d*Math.PI/2;m.push(new ae(Math.cos(x)*i,g/2+Math.sin(x)*i))}m[0].x=m.at(-1).x=0;const b=new Ai(m,h),y=b.attributes.position;for(let T=0;T<y.count;T++){const x=y.getY(T),M=Fe.clamp(.5-x/g,0,1),C=Fe.lerp(i,s,M)/i;y.setXYZ(T,y.getX(T)*C,x+(x>g/2?0:x<-g/2?(x+g/2)*(C-1):0),y.getZ(T)*C)}const N=new _t().setFromUnitVectors(new L(0,-1,0),_),A=new L;Ae(n,b,T=>{const x=A.copy(T).sub(u).dot(_)/g;let M=[[o,1]];for(const[C,F,D]of a){const U=Fe.smoothstep(x,C-c,C+c);M=M.flatMap(([V,H])=>V===F?[[F,H*(1-U)],[D,H*U]]:[[V,H]])}if(l){const C=l[1]*(1-Fe.smoothstep(x,-.04,l[2]??.2));M=M.map(([F,D])=>[F,D*(1-C)]),M.push([l[0],C])}return M},r,new Ge().compose(u.clone().add(p).multiplyScalar(.5),N,new L(1,1,1)))}const He=(n,e,t,i,s,r=[1,1,1],o=12,a=8)=>Ae(n,new xt(e,o,a),i,s,De(t[0],t[1],t[2],0,0,0,...r)),Oc=Object.freeze({crop:{front:.46,side:.02,back:-.5,radius:1.07,faceHalf:.78},sidepart:{front:.4,swoop:.28,side:0,back:-.5,radius:1.08,faceHalf:.78},bob:{front:.24,side:-.62,back:-.66,radius:1.12,faceHalf:.64},long:{front:.3,side:-.62,back:-.7,radius:1.11,faceHalf:.64},ponytail:{front:.44,side:.02,back:-.25,radius:1.08,faceHalf:.78},braids:{front:.4,swoop:.26,side:-.12,back:-.6,radius:1.08,faceHalf:.74},bun:{front:.46,side:.02,back:-.32,radius:1.07,faceHalf:.78},spiky:{front:.5,side:.05,back:-.34,radius:1.08,faceHalf:.78},perm:{front:.42,side:-.12,back:-.44,radius:1.15,faceHalf:.74,bumps:!0},buzz:{front:.52,side:.06,back:-.36,radius:1.025,faceHalf:.8},afro:{front:.48,side:-.12,back:-.5,radius:1.34,faceHalf:.74,lift:.18},horseshoe:{ring:!0,radius:1.03},bald:null});function wg(n,e){const t=Oc[n];if(!t)return null;if(t.ring)return Tg(t);const i=new xt(1,64,44),s=i.attributes.position,r=new L,o=e?-1:1;for(let a=0;a<s.count;a++){r.fromBufferAttribute(s,a);let l=t.front;t.swoop&&(l-=t.swoop*Fe.smoothstep(r.x*o,-.3,.5));const c=Math.max(.18-r.z,Math.abs(r.x)-t.faceHalf,r.y-l),h=Fe.lerp(t.side,t.back,Fe.smoothstep(-r.z,-.2,.7)),u=Math.min(c,r.y-h),p=u>0,f=t.radius*(1+(t.lift&&r.y>0?r.y*t.lift:0)),g=t.radius<1.04?.985:.8,_=Fe.lerp(g,f,Fe.smoothstep(u,-.035,.035));s.setXYZ(a,r.x*_,r.y*_+(t.lift&&p?t.lift*.25:0),r.z*_)}return i.computeVertexNormals(),i}function Tg(n){const i=new xt(n.radius,48,8,Math.PI/2+.95,Math.PI*2-1.9,.1,1),s=i.attributes.position,r=i.attributes.uv;for(let o=0;o<s.count;o++){const a=o%49/48,l=Math.PI/2+.95+a*(Math.PI*2-.95*2),c=Fe.smoothstep(-Math.sin(l),-.3,1),h=(1-Math.abs(Math.sin(a*Math.PI*11)))*.09*c,u=Math.acos(.06+c*.5)+h,p=Math.acos(-.42-c*.12),f=u+(1-r.getY(o))*(p-u),g=Fe.smoothstep(Math.min(a,1-a),0,.08),_=Fe.lerp(p-.12,f,.35+.65*g);s.setXYZ(o,-Math.cos(l)*Math.sin(_)*n.radius,Math.cos(_)*n.radius,Math.sin(l)*Math.sin(_)*n.radius)}return i.computeVertexNormals(),i}function ro(n,e,t){const i=n.length,s=e.hair.colour,r=e.hair.style,o=e.hair.flip?-1:1,a=t.Rh,l=0,c=t.headCentre-t.headY,h=[t.headSX*a,t.headSY*a,a*.98],u=(g,_,m)=>[g,t.headY+_,m],p=wg(r,e.hair.flip);if(p){const g=p.attributes.position,_=new L;for(let m=0;m<g.count;m++)_.fromBufferAttribute(g,m),cs(_,t.profile),g.setXYZ(m,_.x,_.y,_.z);p.computeVertexNormals(),Ae(n,p,"head",s,De(l,t.headY+c,0,0,0,0,...h))}const f=new Ne(s).multiplyScalar(.82).getStyle();if(r==="long"&&He(n,a*.95,u(0,c-a*.72,-a*.55),"head",s,[1.05,1.25,.5]),r==="ponytail"&&(He(n,a*.34,u(0,c+a*.1,-a*1.05),"head",s,[1,1,1]),He(n,a*.3,u(0,c-a*.45,-a*1.18),"head",s,[.9,1.9,.9]),He(n,a*.16,u(0,c+a*.1,-a*1.2),"head",e.outfit.accent)),r==="bun"&&He(n,a*.42,u(0,c+a*.95,-a*.3),"head",s),r==="spiky")for(let g=0;g<9;g++){const _=g/9*Math.PI*2,m=Math.cos(_)*a*.55,d=Math.sin(_)*a*.5-a*.1,v=new bi(a*.2,a*.5,6);Ae(n,v,"head",s,De(m,t.headY+c+a*.88,d,Math.sin(_)*.5,0,-Math.cos(_)*.5))}if(r==="perm")for(let g=0;g<22;g++){const _=g*2.39996,m=.2+.75*(g*.618%1),d=Math.sqrt(1-m*m),v=Math.cos(_)*d,b=Math.sin(_)*d;b>.35&&m<.55||He(n,a*.24,u(v*a*1.1*t.headSX,c+m*a*1.1,b*a*1.05),"head",g%3?s:f,[1,1,1],8,6)}if(r==="braids")for(const g of[-1,1]){const _=g*a*.8,m=-a*.35;let d=c-a*.35;for(let v=0;v<6;v++){const b=a*(.2-v*.012);He(n,b,u(_+g*a*.05,d,m+a*.05*v),"head",v%2?s:f,[1,1.3,1],8,6),d-=b*1.5}He(n,a*.13,u(_+g*a*.05,d+a*.05,m+a*.3),"head",e.outfit.accent,[1.2,.7,1.2],8,6),He(n,a*.12,u(_+g*a*.05,d-a*.12,m+a*.3),"head",s,[1,1.4,1],8,6)}if((r==="sidepart"||r==="braids")&&He(n,a*.34,u(o*a*.5,c+a*.62,a*.62),"head",s,[1.4,.55,.7],10,6),(r==="bob"||r==="long")&&He(n,a*.4,u(0,c+a*.52,a*.72),"head",s,[2,.5,.6],10,6),!["none","headband","ribbon"].includes(e.outfit.hat))for(const g of n.slice(i)){const _=g.attributes.position;g.userData.hatHair={position:_.array.slice(),normal:g.attributes.normal.array.slice()};for(let m=0;m<_.count;m++){const d=_.getX(m)/h[0],v=(_.getY(m)-t.headCentre)/h[1],b=_.getZ(m)/h[2],y=Math.hypot(d,v,b);if(v>.3&&y>1.035){const N=1.035/y;_.setXYZ(m,d*N*h[0],t.headCentre+v*N*h[1],b*N*h[2])}}g.computeVertexNormals()}}function Eg(n,e){const t=Oc[n],i=56,s=new xt(1,i,1,0,Math.PI*2,.5,.5),r=s.attributes.position,o=s.attributes.uv,a=new L;let l=[0,.4,-1];for(let c=0;c<r.count;c++){const h=c%(i+1)/i,u=h*Math.PI*2,p=Math.sin(u),f=Math.cos(u),g=Fe.smoothstep(-f,-.2,1),_=.3+g*.14,m=_+(o.getY(c)-.5)*.14,d=Math.sqrt(1-m*m);a.set(p*d,m,f*d);let v=1.035;if(t&&!t.ring){const b=Math.max(.18-a.z,Math.abs(a.x)-t.faceHalf,a.y-t.front),y=Fe.lerp(t.side,t.back,Fe.smoothstep(-a.z,-.2,.7)),N=Math.min(b,a.y-y),A=t.radius*(1+(t.lift&&a.y>0?a.y*t.lift:0))+.03;v=Fe.lerp(1.035,Math.max(1.035,A),Fe.smoothstep(N,-.06,.06))}else t?.ring&&g>.3&&(v=t.radius+.03);a.multiplyScalar(v),cs(a,e),r.setXYZ(c,a.x,a.y,a.z),Math.abs(h-.5)<1e-6&&o.getY(c)>.5&&(l=[0,a.y-.07,a.z])}return s.computeVertexNormals(),{geometry:s,knot:l}}function Ag(n,e=Zo(n)){return{brimY:e.headCentre+e.Rh*e.headSY*.55,crownHeight:e.Rh*e.headSY*.8}}function Bc(n,e,t){const i=e.outfit.hat,s=e.outfit.hatColour,r=t.Rh;if(t.headCentre+r*t.headSY*.2,i==="none")return;const o=[t.headSX*r,t.headSY*r,r];if(i==="cap"||i==="police"||i==="captain"){const a=new xt(1.1,24,12,0,Math.PI*2,0,Math.PI*.5);Ae(n,a,"head",s,De(0,t.headCentre+r*t.headSY*.23,0,-.08,0,0,o[0],o[1]*(i==="cap"?.9:1.05),o[2])),He(n,r*.68,[0,t.headCentre+r*t.headSY*.25,r*.9],"head",i==="cap"?s:"#1c1c24",[t.headSX*1.4,.07,1],20,8),i!=="cap"&&(Ae(n,new Ke(r*1.12,r*1.12,r*.14,24,1,!0),"head",i==="captain"?"#1c1c24":"#e0b93a",De(0,t.headCentre+r*.26,0,-.08)),He(n,r*.1,[0,t.headCentre+r*.62,r*1.02],"head","#e0b93a",[1,1,.4],8,6))}else if(i==="helmet")i!=="paperboat"&&Ae(n,new xt(1.16,24,12,0,Math.PI*2,0,Math.PI*.52),"head",s,De(0,t.headCentre+r*t.headSY*.35,0,0,0,0,o[0],o[1]*.9,o[2])),Ae(n,new tn(1.16,.045,6,24),"head",s,De(0,t.headCentre+r*t.headSY*.35,0,Math.PI/2,0,0,o[0],o[2],o[1]));else if(i==="straw"){const a=Ag(e,t),l=a.brimY;Ae(n,new tr(r*.98,r*2.1,32),"head",s,De(0,l,0,-Math.PI/2,0,0,t.headSX,1,1)),Ae(n,new tr(r*.98,r*2.1,32),"head",s,De(0,l-.012*t.k,0,Math.PI/2,0,0,t.headSX,1,1)),Ae(n,new Ke(r*.78,r*1.08,a.crownHeight,24,1,!0),"head",s,De(0,l+a.crownHeight/2,0,0,0,0,t.headSX,1,1)),Ae(n,new dr(r*.78,24),"head",s,De(0,l+a.crownHeight,0,-Math.PI/2,0,0,t.headSX,1,1)),Ae(n,new Ke(r*1.045,r*1.09,r*.12*t.headSY,24,1,!0),"head","#d8342c",De(0,l+r*.06*t.headSY,0,0,0,0,t.headSX,1,1))}else if(i==="beanie")Ae(n,new xt(1.17,20,12,0,Math.PI*2,0,Math.PI*.49),"head",s,De(0,t.headCentre+r*.12,0,0,0,0,...o)),Ae(n,new tn(1.14,.09,6,24),"head",s,De(0,t.headCentre+r*.18,0,Math.PI/2,0,0,o[0],o[2],o[1])),He(n,r*.22,[0,t.headCentre+r*t.headSY*1.32,0],"head",s,[1,1,1],10,8);else if(i==="beret")He(n,r,[r*.15,t.headCentre+r*t.headSY*.83,0],"head",s,[t.headSX*1.35,.38,1.25],20,12),Ae(n,new Ke(r*.055,r*.055,r*.15,6),"head",s,De(r*.15,t.headCentre+r*t.headSY*1.2,0));else if(i==="bucket"){const a=t.headCentre+r*t.headSY*.88;Ae(n,new Ke(r*.93,r*1.13,r*.62,20),"head",s,De(0,a,0,0,0,0,t.headSX,1,1)),Ae(n,new Ke(r*1.12,r*1.5,r*.16,24,1,!0),"head",s,De(0,a-r*.33,0,0,0,0,t.headSX,1,1))}else if(["squid","teapot","sunflower","paperboat","mountain"].includes(i)){i!=="paperboat"&&Ae(n,new xt(1.16,24,12,0,Math.PI*2,0,Math.PI*.49),"head",s,De(0,t.headCentre+r*t.headSY*.35,0,0,0,0,o[0],o[1]*.86,o[2]));const a=t.headCentre+r*t.headSY*1.16;if(i==="squid"){He(n,r*.6,[0,a+r*.2,0],"head",s,[1,.9,1],16,12);for(const l of[-1,1]){He(n,r*.12,[l*r*.25,a+r*.2,r*.53],"head","#f4f1ea",[1,1,.45],10,8),He(n,r*.055,[l*r*.25,a+r*.2,r*.59],"head","#27304d",[1,1,.4],8,6);for(const c of[-.45,.05])Wn(n,[l*r*.78,a-r*.18,c*r],[l*r*.96,a-r*.65,c*r],r*.1,"head",s,8)}}else if(i==="teapot")He(n,r*.62,[0,a+r*.14,0],"head",s,[1.15,.72,1],16,12),Ae(n,new tn(r*.38,r*.07,8,18),"head",s,De(-r*.66,a+r*.14,0)),Ae(n,new bi(r*.17,r*.55,12),"head",s,De(r*.69,a+r*.25,0,0,0,-.9)),He(n,r*.12,[0,a+r*.67,0],"head",e.outfit.accent,[1,.6,1],10,8);else if(i==="sunflower"){for(let l=0;l<10;l++){const c=l*Math.PI/5;He(n,r*.25,[Math.cos(c)*r*.45,a+r*.44+Math.sin(c)*r*.45,r*.25],"head","#f4d23c",[1,.65,.25],10,8)}He(n,r*.29,[0,a+r*.44,r*.31],"head","#9a6a42",[1,1,.3],12,10)}else if(i==="mountain")Ae(n,new bi(r*.75,r*.86,12),"head",s,De(0,a+r*.26,0)),Ae(n,new bi(r*.31,r*.38,12),"head","#f4f1ea",De(0,a+r*.69,0));else{for(const l of[-1,1]){const c=new yt;c.setAttribute("position",new qe([-r*1.25,a,l*r*.65,r*1.25,a,l*r*.65,0,a+r*.67,0],3)),c.computeVertexNormals(),Ae(n,c,"head","#f4f1ea")}Ae(n,new ht(r*2.45,r*.16,r*.11),"head",s,De(0,a-r*.02,r*.66))}}else if(i==="ribbon"){const a=r*t.headSX*.68,l=t.headCentre+r*t.headSY*.85,c=r*.52;for(const h of[-1,1])He(n,r*.2,[a+h*r*.16,l,c],"head",s,[1.1,.7,.45],10,8);He(n,r*.09,[a,l,c+r*.04],"head",s,[1,1,.7],8,6)}else if(i==="headband"){const a=Eg(e.hair.style,t.profile);Ae(n,a.geometry,"head",s,De(0,t.headCentre,0,0,0,0,...o)),He(n,r*.13,[0,t.headCentre+a.knot[1]*o[1],a.knot[2]*o[2]-r*.04],"head",s,[1.5,.8,.7],8,6)}else i==="kerchief"&&(Ae(n,new xt(1.1,24,12,0,Math.PI*2,0,Math.PI*.36),"head",s,De(0,t.headCentre+r*.05,-r*.12,-.45,0,0,...o)),He(n,r*.2,[0,t.headCentre+r*.1,-r*1.1],"head",s,[1.3,.9,.9],8,6))}function wy(n,{mode:e="wall",shadows:t=!0}={}){const i=Bt(n);if(i.outfit.hat==="none")return null;const s=[];if(Bc(s,i,Zo(i)),!s.length)return null;const r=js(s,!1);s.forEach(c=>c.dispose());for(const c of["skinIndex","skinWeight"])r.deleteAttribute(c);r.computeBoundingBox();const o=r.boundingBox,a=o.getCenter(new L);r.translate(-a.x,e==="stand"?-o.min.y:-a.y,e==="stand"?-a.z:-o.min.z),r.computeBoundingSphere();const l=new ut(r,yr(new wt({vertexColors:!0}),{bands:"soft3"}));return l.name=(i.name||"Resident")+"’s hat",l.castShadow=t,l.receiveShadow=!0,l.userData.hatProp=!0,l}function Rg(n,e,t){const i=e.accessories,s=t.Rh,r=i.colour;if(i.earrings!=="none")for(const o of[-1,1]){const a=o*s*t.headSX*1.035,l=t.headCentre-s*.21,c=s*.04;i.earrings==="studs"?He(n,s*.085,[a,l,c],"head",r,[1,1,.65],8,6):Ae(n,new tn(s*.16,s*.035,6,14),"head",r,De(a,l-s*.1,c,0,o*.5))}i.neckwear==="pendant"?(Ae(n,new tn(t.width*.3,t.k*.007,5,18),"chest",r,De(0,t.neckY-.035,t.depth*.05,Math.PI/2-.5)),He(n,t.k*.025,[0,t.neckY-.12,t.depth*.53],"chest",r,[.7,1,.35],8,6)):i.neckwear==="scarf"&&(Ae(n,new tn(t.armR*1.7,t.armR*.55,6,18),"chest",r,De(0,t.neckY-.035,0,Math.PI/2)),Ae(n,new ht(t.width*.22,t.torso*.5,.025),"chest",r,De(t.width*.14,t.neckY-t.torso*.28,t.depth*.53,0,0,-.15))),i.pin&&He(n,t.k*.024,[t.width*.22,t.neckY-t.torso*.28,t.depth*.52],"chest",r,[1,1,.3],8,6)}const Cg=n=>n.facial.style==="none"&&(["bob","long","ponytail","braids","bun","perm"].includes(n.hair.style)||n.mouth.colour!=="#b8544a");function oo(n,e,t,i=!1){const s=e.outfit,r=e.body.skin,o=i?r:s.topColour,a=i?e.swim.colour:s.bottomColour,l=t.width,c=t.depth,h=t.hipY,u=!i&&s.top==="tank",p=!i&&s.bottom==="underwear",f=1+(e.body.build-.5)*.12,g=t.hips/l,_=[[0,-.1],[g*.86,-.08],[g,.05],[g,.13],[g,.15],[t.waistRatio*f,.3],[t.waistRatio*(1+(f-1)*.6),.5],[1,.66],[.985,.74],[.95,.8],[.88,.87],[.76,.93],[.58,.98],[.38,1.01],[.19,1.03],[0,1.04]],m=new Ai(_.map(([w,T])=>new ae(w,T)),28),d=h+t.torso*(p?.05:.13),v=s.pattern==="stripes";if(Ae(n,m,"chest",w=>{if(i)return w.y<d?a:r;if(w.y<d)return a;if(u||s.top==="sundress"&&(w.y-h)/t.torso>.78)return r;if(s.top==="kariyushi"&&w.z>c*.18){const T=(w.y-h)/t.torso;if(T>.77&&Math.abs(w.x)<l*.27*Math.min(1,(T-.77)/.25))return r}return v&&Math.floor((w.y-d)/(t.torso*.12))%2?"#f4f1ea":o},De(0,h,0,0,0,0,l/2,t.torso,c/2)),u){const T=_.filter(([,F])=>F>=.05&&F<=.77).concat([[mi(_,.77),.77]]),x=new Ai(T.map(([F,D])=>new ae(F*1.025,D)),28);Ae(n,x,"chest",o,De(0,h,0,0,0,0,l/2,t.torso,c/2));const M=.4,C=F=>{const D=mi(_,F)*1.025;return c/2*Math.sqrt(Math.max(0,D*D-M*M))+.004*t.k};for(const F of[-1,1]){const D=F*l/2*M,U=[.77,.9,1].map(H=>[D,h+t.torso*H,C(H)]);U.push([D,h+t.torso*1.035,0]);const V=U.concat(U.slice(0,-1).reverse().map(([H,ee,K])=>[H,ee,-K]));for(let H=1;H<V.length;H++)Wn(n,V[H-1],V[H],.016*t.k,"chest",o,6)}}if(i&&Cg(e)&&Ae(n,new Ke(l*.52,l*.52,t.torso*.2,16,1,!0),"chest",e.swim.colour,De(0,h+t.torso*.66,0,0,0,0,1,1,c/l)),Wn(n,[0,t.neckY-.02,0],[0,t.headY+.01,0],t.armR*1.2,"neck",r,8),!i&&["polo","kariyushi","smock","jacket","blouse","sailor","cardigan","festival"].includes(s.top)){const w=s.top==="kariyushi",T=w?new Ne(o).multiplyScalar(1.12).getHex():"#f4f1ea",x=M=>c/2*mi(_,(M-h)/t.torso)+.008*t.k;for(const M of[-1,1]){const C=w?[[M*.018*t.k,t.neckY-.012*t.k],[M*.125*t.k,t.neckY-.047*t.k],[M*.067*t.k,t.neckY-.17*t.k]]:[[M*.012*t.k,t.neckY-.012*t.k],[M*.085*t.k,t.neckY-.035*t.k],[M*.055*t.k,t.neckY-.115*t.k]];M>0&&C.reverse();const F=new yt;F.setAttribute("position",new qe(C.flatMap(([D,U])=>[D,U,x(U)+.004*t.k]),3)),F.computeVertexNormals(),Ae(n,F,"chest",T)}if(w){const M=new Ne(o).multiplyScalar(.86).getHex();for(const D of[.24,.4,.56,.72]){const U=h+t.torso*D;Ae(n,new ht(.024*t.k,t.torso*.16,.014*t.k),"chest",M,De(.007*t.k,U,x(U)+.008*t.k))}const C=h+t.torso*.62,F=l*.23;Ae(n,new ht(l*.24,t.torso*.21,.016*t.k),"chest",o,De(F,C,x(C)-.004*t.k)),Ae(n,new ht(l*.25,.008*t.k,.018*t.k),"chest",M,De(F,C+t.torso*.1,x(C)+.004*t.k))}for(const M of w?[.25,.41,.57,.73]:[.4,.56,.72]){const C=h+t.torso*M;He(n,(w?.009:.006)*t.k,[0,C,x(C)],"chest","#f4f1ea",[1,1,.45],8,6)}}if(!i&&["hoodie","cardigan","sailor","festival","overalls","sundress"].includes(s.top)){const w=T=>c/2*mi(_,T)+.015*t.k;if(s.top==="hoodie"){Ae(n,new xt(t.width*.35,16,12,0,Math.PI*2,0,Math.PI*.75),"chest",o,De(0,t.neckY-.045,-c*.32,.9,0,0,1,.7,.55));for(const T of[-.026,.026])Wn(n,[T*t.k,t.neckY-.04,w(.82)],[T*t.k,t.neckY-.2,w(.66)],.004*t.k,"chest",s.accent,5);Ae(n,new ht(l*.48,t.torso*.15,.016*t.k),"chest",new Ne(o).multiplyScalar(.85).getHex(),De(0,h+t.torso*.35,w(.35)))}if(s.top==="cardigan"||s.top==="festival"){for(const T of[-l*.08,l*.08])Ae(n,new ht(l*.07,t.torso*.74,.014*t.k),"chest",s.accent,De(T,h+t.torso*.51,w(.5)));for(let T=0;T<4;T++)He(n,.011*t.k,[0,h+t.torso*(.28+T*.15),w(.28+T*.15)],"chest",s.accent,[1,1,.4],8,6)}if(s.top==="sailor"){Ae(n,new ht(l*.68,t.torso*.2,.015*t.k),"chest",s.accent,De(0,t.neckY-.14,-c*.4));for(const T of[-1,1])Wn(n,[T*l*.2,t.neckY-.055,w(.9)],[0,t.neckY-.26,w(.62)],.016*t.k,"chest",s.accent,6);Ae(n,new ht(l*.1,t.torso*.21,.018*t.k),"chest",s.accent,De(0,t.neckY-.28,w(.55)))}if(s.top==="overalls"||s.top==="sundress"){const T=s.top==="overalls"?a:o;for(const C of[-1,1])Wn(n,[C*l*.25,h+t.torso*.57,w(.57)],[C*l*.25,t.neckY-.055,w(.95)],.022*t.k,"chest",T,8);const x=new Ei(l*.64,t.torso*.47,8,10),M=x.attributes.position;for(let C=0;C<M.count;C++){const F=h+t.torso*.38+M.getY(C),D=M.getX(C);M.setXYZ(C,D,F,w((F-h)/t.torso)*Math.sqrt(Math.max(.1,1-(D/(l*.5))**2))+.012*t.k)}x.computeVertexNormals(),Ae(n,x,"chest",T)}}if(!i&&["lighthouse","lantern","reef"].includes(s.top)){const w=h+t.torso*.52;if(s.top==="lantern"){Ae(n,new xt(1,24,16),"chest",o,De(0,w,0,0,0,0,l*.63,t.torso*.55,c*.68));for(const T of[.12,.9])Ae(n,new Ke(l*.48,l*.48,.026*t.k,24),"chest",s.accent,De(0,h+t.torso*T,0,0,0,0,1,1,c/l));for(const T of[-.9,-.45,0,.45,.9]){const x=[];for(let M=0;M<=10;M++){const C=-1.05+M*.21;x.push([Math.sin(T)*l*.64*Math.cos(C),w+Math.sin(C)*t.torso*.55,Math.cos(T)*c*.69*Math.cos(C)])}for(let M=1;M<x.length;M++)Wn(n,x[M-1],x[M],.007*t.k,"chest",s.accent,5)}}else if(s.top==="lighthouse"){for(const T of[.25,.6])Ae(n,new Ke(l*.51,l*.51,t.torso*.11,24,1,!0),"chest",s.accent,De(0,h+t.torso*T,0,0,0,0,1,1,c/l));Ae(n,new tn(l*.11,.012*t.k,8,18),"chest",s.accent,De(0,h+t.torso*.79,c*.38)),He(n,l*.09,[0,h+t.torso*.79,c*.38],"chest","#7fb0d8",[1,1,.2],12,8)}else{for(const T of[-1,1]){const x=new yt;x.setAttribute("position",new qe([T*l*.42,h+t.torso*.24,-c*.15,T*l*.9,h+t.torso*.49,-c*.15,T*l*.42,h+t.torso*.83,-c*.15],3)),x.computeVertexNormals(),Ae(n,x,"chest",s.accent);const M=x.clone();M.scale(1,1,-1),Ae(n,M,"chest",s.accent)}for(let T=0;T<3;T++)He(n,.026*t.k,[(T-1)*l*.19,w,c*.52],"chest",s.accent,[1,1,.35],8,6)}}if(!i&&s.top==="apron"){const w=h+t.torso*.75,T=h-t.thigh*.78,x=new Ei(l*.7,w-T,8,14);x.translate(0,(w+T)/2,0);const M=x.attributes.position,C=["skirt","longskirt"].includes(s.bottom),F=s.bottom==="longskirt"?t.thigh+t.shin*.85:t.thigh*.9;for(let U=0;U<M.count;U++){const V=M.getY(U),H=(V-h)/t.torso,ee=V>=h?l/2*mi(_,H):C?Fe.lerp(t.hips*.53,t.hips*.66+F*.22,Fe.clamp((h+.03-V)/F,0,1)):l*.52,K=M.getX(U)*(V>h?1-Fe.clamp(H,0,1)*.25:1);M.setXYZ(U,K,V,ee*c/l*Math.sqrt(Math.max(.05,1-(K/ee)**2))+.025*t.k)}x.computeVertexNormals(),Ae(n,x,U=>{if(U.y>h){const ee=Fe.smoothstep(U.y,h,h+t.torso*.35);return[["hips",1-ee],["chest",ee]]}const V=Fe.smoothstep(h-U.y,.02,.12),H=Fe.smoothstep(U.x,-l*.25,l*.25);return[["hips",1-V],["thighL",V*H],["thighR",V*(1-H)]]},new Ne(s.topColour).multiplyScalar(1.12).getHex())}if(!i&&(s.pattern==="flowers"||s.pattern==="dots")){const w=s.pattern==="flowers"?"#f8f6ef":s.accent,T=s.pattern==="flowers"?Ul:kl;for(let x=0;x<18;x++){const M=x*2.39996,C=.2+.62*(x*.37%1),F=h+t.torso*C;if(s.top==="kariyushi"&&Math.cos(M)>.7&&(Math.abs(Math.sin(M))<.13||C>.77))continue;const D=mi(_,C),U=Math.sin(M)*l/2*D*1.012,V=Math.cos(M)*c/2*D*1.012,H=Math.atan2(U/(l/2),V/(c/2)),ee=t.k*(s.pattern==="flowers"?s.top==="kariyushi"?.045:.035:.018);Ae(n,T,"chest",w,De(U,F,V,0,H,x*.7,ee,ee,ee)),s.pattern==="flowers"&&Ae(n,kl,"chest","#f4d23c",De(U*1.004,F,V*1.004,0,H,0,ee*.35,ee*.35,ee*.35))}}const y=!i&&["jacket","smock","hoodie","cardigan","festival","lighthouse","lantern","reef"].includes(s.top),N=t.upper/(t.upper+t.fore);for(const w of["L","R"]){const T=w==="L"?1:-1,x=[T*t.shoulderX,t.shoulderY,0],M=[T*(t.shoulderX+.015),t.shoulderY-t.upper-t.fore,0],C={bone:"shoulder"+w,joints:[[N,"shoulder"+w,"elbow"+w]]};Hn(n,x,M,t.armR*1.04,t.armR*.86,i||!y?r:o,C);const F=D=>{const U=Fe.smoothstep(Math.abs(D.x),t.shoulderX-t.armR*1.1,t.shoulderX+t.armR*.3);return[["chest",1-U],["shoulder"+w,U]]};if(Ae(n,new xt(t.armR*1.3,16,12),F,i||u||s.top==="sundress"?r:o,De(x[0]-T*t.armR*.15,x[1]+t.armR*.05,0,0,0,0,1,.92,Math.min(1.1,c/l*1.6))),!i&&s.top==="kariyushi"){const D=t.upper*.76,U=x[1]-D/2;Ae(n,new Ke(t.armR*1.25,t.armR*1.42,D,16,1,!0),C,o,De(x[0]+T*.008,U,0,0,0,T*.035)),Ae(n,new Ke(t.armR*1.43,t.armR*1.43,.008*t.k,16,1,!0),C,new Ne(o).multiplyScalar(.88).getHex(),De(x[0]+T*.014,x[1]-D,0)),Ae(n,Ul,"shoulder"+w,"#f8f6ef",De(x[0],U,t.armR*1.44,0,0,T*.3,.038*t.k,.038*t.k,.038*t.k))}else!i&&!y&&!u&&s.top!=="sundress"&&Hn(n,x,[x[0]+T*.006,x[1]-t.upper*.58,0],t.armR*1.12,t.armR*1.16,o,{...C,joints:[]});He(n,t.hand,[M[0],M[1]-t.hand*.55,0],"hand"+w,r,[.9,1.15,.78],12,10),He(n,t.hand*.42,[M[0]-T*t.hand*.55,M[1]-t.hand*.35,t.hand*.42],"hand"+w,r,[1,1.2,1],8,6)}const A=i?"swim":s.bottom;for(const w of["L","R"]){const T=w==="L"?1:-1,x=[T*t.hipX,h,0];T*t.hipX,h-t.thigh;const M=[T*t.hipX,t.foot,0],C={bone:"thigh"+w,joints:[[t.thigh/(h-t.foot),"thigh"+w,"knee"+w]]},F=A==="trousers"||A==="widepants";if(Hn(n,x,M,t.legR*(A==="widepants"?1.32:1.02),t.legR*(A==="widepants"?1.28:.86),F?a:r,C),A==="cropped"||A==="culottes"){const U=A==="cropped"?t.foot+t.shin*.35:h-t.thigh*1.12;Hn(n,x,[x[0],U,0],t.legR*(A==="culottes"?1.55:1.12),t.legR*(A==="culottes"?1.7:1.16),a,C)}(A==="shorts"||A==="swim")&&Hn(n,[x[0],x[1]+t.legR*.3,0],[x[0]*1.04,h-t.thigh*(A==="swim"?.22:.55),0],t.legR*1.2,t.legR*1.26,a,{...C,joints:[]}),A==="underwear"&&Hn(n,[x[0],x[1]+t.legR*.3,0],[x[0]*1.02,h-t.thigh*.16,0],t.legR*1.12,t.legR*1.14,a,{...C,joints:[]});const D=i?"barefoot":s.footwear;D==="barefoot"||D==="sandals"?(He(n,t.legR*1.12,[T*t.hipX,t.foot*.55,t.legR*.5],"foot"+w,r,[1,.55,1.7],12,8),D==="sandals"&&(He(n,t.legR*1.24,[T*t.hipX,t.foot*.12,t.legR*.55],"foot"+w,e.age==="elder"?"#6b4a32":"#c8a878",[1,.18,1.8],12,6),He(n,t.legR*.42,[T*t.hipX,t.foot*.55+t.legR*.55,t.legR*.95],"foot"+w,s.shoes,[2.3,.5,.8],10,6))):(He(n,t.legR*1.25,[T*t.hipX,t.foot*.62,t.legR*.55],"foot"+w,s.shoes,[1,.6,D==="shoes"?1.85:1.75],12,8),D==="boots"&&Hn(n,[T*t.hipX,t.foot,0],[T*t.hipX,t.foot+t.shin*.65,0],t.legR*1.08,t.legR*1.05,s.shoes,{bone:"knee"+w,joints:[]}),He(n,t.legR*1.32,[T*t.hipX,t.foot*.16,t.legR*.6],"foot"+w,D==="shoes"?"#2b2622":e.age==="elder"?"#6b4a32":"#f2efe6",[1,.24,1.8],12,6))}if(A==="skirt"||A==="longskirt"||A==="pleatedskirt"){const w=A==="skirt"||A==="pleatedskirt"?t.thigh*.9:t.thigh+t.shin*.85,T=M=>{const C=Fe.smoothstep(h-M.y,.02,.12),F=Fe.smoothstep(M.x,-l*.25,l*.25);return[["hips",1-C],["thighL",C*F],["thighR",C*(1-F)]]},x=new Ke(t.hips*.53,t.hips*.66+w*.22,w,A==="pleatedskirt"?64:24,6,!0);if(A==="pleatedskirt"){const M=x.attributes.position;for(let C=0;C<M.count;C++){const F=M.getX(C),D=M.getZ(C),U=1+.055*Math.cos(Math.atan2(D,F)*16);M.setXYZ(C,F*U,M.getY(C),D*U)}x.computeVertexNormals()}Ae(n,x,T,s.bottomPattern==="plaid"?(M=>{const C=Math.floor(Math.atan2(M.x,M.z)*12/Math.PI)%4===0,F=Math.floor((h-M.y)/(.06*t.k))%4===0;return C||F?s.accent:a}):a,De(0,h+.03-w/2,0,0,0,0,1,1,c/l))}}const Pg=.011,ao=new Map;function Fl({skinned:n=!0,colour:e=null,width:t=Pg}={}){const i=(n?"s":"m")+(e??"v")+t;if(ao.has(i))return ao.get(i);const s=new Uo({color:e??16777215,vertexColors:e==null,side:1});s.name="Shimanchu outline",s.userData.outline=!0;const r={value:t};return s.onBeforeCompile=o=>{o.uniforms.uOutline=r,o.vertexShader=`uniform float uOutline;
`+o.vertexShader.replace("#include <project_vertex>",(n?`vec3 outlineN = normalize( objectNormal );
`:`vec3 outlineN = normalize( position );
`)+`transformed += outlineN * uOutline;
#include <project_vertex>`),e==null&&(o.fragmentShader=o.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
 diffuseColor.rgb *= vec3( 0.32, 0.27, 0.27 );`))},s.customProgramCacheKey=()=>"shimanchu-outline-"+i,ao.set(i,s),s}function lo(n,e,t){const i=t?new qs(e.geometry,Fl({skinned:!0})):new ut(e.geometry,Fl({skinned:!1,colour:4861992}));return i.name=e.name+" outline",i.castShadow=!1,i.receiveShadow=!1,i.frustumCulled=!1,i.userData.outline=!0,t?(i.bind(e.skeleton,e.bindMatrix),n.add(i)):e.add(i),i}function Lg(n,e,t){const i=document.createElement("canvas");i.width=i.height=t;const s=i.getContext("2d"),r=new Xm(i);r.colorSpace=Ot,r.anisotropy=4;let o=new xt(1,36,26);const a=o.attributes.position,l=o.attributes.uv,c=new L,h=Math.PI/2-.95,u=1.9,p=Math.PI*.28,f=Math.PI*.58;for(let A=0;A<a.count;A++){c.fromBufferAttribute(a,A);const w=Math.atan2(c.z,-c.x),T=Math.acos(Fe.clamp(c.y,-1,1));l.setXY(A,Fe.clamp((w-h)/u,.002,.998),Fe.clamp(1-(T-p)/f,.002,.998)),cs(c,e.profile),a.setXYZ(A,c.x,c.y,c.z)}o.scale(e.Rh*e.headSX,e.Rh*e.headSY,e.Rh*.98),o.computeVertexNormals();const g=o.attributes.normal,_=new L,m=new L(0,.4,.92).normalize();for(let A=0;A<g.count;A++)_.fromBufferAttribute(g,A),_.lerp(m,Fe.smoothstep(_.z,-.35,.45)*.7).normalize(),g.setXYZ(A,_.x,_.y,_.z);const d=o;o=d.toNonIndexed(),d.dispose();const v=o.attributes.position,b=o.attributes.uv;for(let A=0;A<v.count;A+=3){const w=[b.getX(A),b.getX(A+1),b.getX(A+2)];if(v.getZ(A)<=0&&v.getZ(A+1)<=0&&v.getZ(A+2)<=0||Math.max(...w)-Math.min(...w)>.5)for(let x=0;x<3;x++)b.setXY(A+x,.002,.002)}const y=yr(new wt({map:r,emissive:16777215,emissiveMap:r,emissiveIntensity:.05}),{bands:"soft3"}),N=new ut(o,y);return N.name="Shimanchu head",N.position.y=e.headCentre-e.headY,{head:N,canvas:i,ctx:s,texture:r}}function co(n,e,t){if(e.nose.style==="none")return;const i=_r(e),s=Math.PI*.28+i.noseY/256*Math.PI*.58,r=Math.PI/2-.95+i.noseX/256*1.9,o=cs(new L(-Math.cos(r)*Math.sin(s),Math.cos(s),Math.sin(r)*Math.sin(s)),t.profile),a=e.nose.style==="hook",l=e.nose.style==="wide",c=t.Rh*(.065+e.nose.size*.055);He(n,c,[o.x*t.Rh*t.headSX,t.headCentre+o.y*t.Rh*t.headSY,o.z*t.Rh*.98+c*.55],"head",e.body.skin,[l?1.45:.85,a?1.55:.85,a?1.65:1.2],12,10)}function To(n,{shadows:e=!0,faceSize:t=256}={}){const i=Bt(n),s=Zo(i),r=xg(s),o={},a=So.map(D=>{const U=new dc;return U.name=D,o[D]=U,U});for(const D of So){const U=o[D],V=r[D],H=Sg[D];if(H){const ee=r[H];U.position.set(V[0]-ee[0],V[1]-ee[1],V[2]-ee[2]),o[H].add(U)}else U.position.set(...V)}const l=[];oo(l,i,s,!1);const c=l.reduce((D,U)=>D+U.attributes.position.count,0);for(const D of["L","R"]){const U=D==="L"?1:-1,V=U*(s.shoulderX+.015),H=s.shoulderY-s.upper-s.fore;for(let ee=0;ee<4;ee++)Ae(l,new ur(s.hand*.105,s.hand*(ee===0||ee===3?.4:.6),3,6),"hand"+D,i.body.skin,De(V+(ee-1.5)*s.hand*.37,H-s.hand*(ee===0||ee===3?1.65:1.85),s.hand*.04,0,0,(ee-1.5)*.16))}const h=l.reduce((D,U)=>D+U.attributes.position.count,0);co(l,i,s);for(const D of[-1,1])He(l,s.Rh*.2,[D*s.Rh*s.headSX*.97,s.headCentre-s.Rh*.08,-s.Rh*.05],"head",i.body.skin,[.55,1,.8],8,6);ro(l,i,s),Rg(l,i,s);const u=l.reduce((D,U)=>D+U.attributes.position.count,0);Bc(l,i,s);const p=[];let f=0;for(const D of l)D.userData.hatHair&&p.push({offset:f,original:D.userData.hatHair,tucked:{position:D.attributes.position.array.slice(),normal:D.attributes.normal.array.slice()}}),f+=D.attributes.position.count*3;let g=!0;const _=js(l,!1);l.forEach(D=>D.dispose());const m=_.attributes.position.count>u;_.computeBoundingSphere();const d=yr(new wt({vertexColors:!0}),{bands:"soft3"}),v=new qs(_,d);v.name="Shimanchu body",v.add(o.root),v.bind(new Bo(a)),v.castShadow=e,v.receiveShadow=!0,v.frustumCulled=!1;let b=null,y=null,N=null;const A=Lg(i,s,t);A.head.castShadow=e,A.head.receiveShadow=!0,o.head.add(A.head);const w=new Wt;w.name="Shimanchu · "+(i.name||"resident"),w.add(v,o.root),w.rotation.y=Math.PI;const T=lo(w,v,!0);lo(A.head,A.head,!1);const x=_.attributes.position.array.slice(c*3,h*3),M=x.slice();for(let D=c;D<h;D++){const U=_.attributes.skinIndex.getX(D)===wo.handL?1:-1,V=(D-c)*3;M[V]=U*(s.shoulderX+.015),M[V+1]=s.shoulderY-s.upper-s.fore-s.hand*.55,M[V+2]=0}_.attributes.position.array.set(M,c*3);let C=!1;const F={recipe:i,measure:s,root:w,body:v,bones:o,face:A,height:s.H,hasHat:m,setOpenHands(D){D=!!D,C!==D&&(C=D,_.attributes.position.array.set(D?x:M,c*3),_.attributes.position.needsUpdate=!0)},setHat(D){if(_.setDrawRange(0,D||!m?1/0:u),g!==!!D){for(const U of p){const V=D?U.tucked:U.original;_.attributes.position.array.set(V.position,U.offset),_.attributes.normal.array.set(V.normal,U.offset)}p.length&&(_.attributes.position.needsUpdate=!0,_.attributes.normal.needsUpdate=!0),g=!!D}},get hatOn(){return m&&_.drawRange.count===1/0},faceState:{expression:"neutral",blink:0,talk:0,look:[0,0]},paintFace(D){const U=F.faceState,V={...U,...D},H=V.expression+"|"+(V.blink>.5?1:0)+"|"+(V.talk>.5?1:0)+"|"+Math.round(V.look[0]*2)+","+Math.round(V.look[1]*2);return H===F.faceKey?!1:(F.faceKey=H,Object.assign(U,V),og(A.ctx,i,{...V,size:A.canvas.width}),A.texture.needsUpdate=!0,!0)},wear(D){if(D==="nozomi"&&!y){const U=Bt({...i,outfit:{...i.outfit,...Z0}}),V=[];oo(V,U,s),co(V,U,s);for(const ee of[-1,1])He(V,s.Rh*.2,[ee*s.Rh*s.headSX*.97,s.headCentre-s.Rh*.08,-s.Rh*.05],"head",i.body.skin,[.55,1,.8],8,6);ro(V,U,s);const H=js(V,!1);V.forEach(ee=>ee.dispose()),y=new qs(H,d),y.name="Thuan · Nozomi-inspired outfit",y.bind(v.skeleton,v.bindMatrix),y.castShadow=e,y.frustumCulled=!1,w.add(y),N=lo(w,y,!0)}if(D==="swim"&&!b){const U=[];oo(U,i,s,!0),co(U,i,s);for(const H of[-1,1])He(U,s.Rh*.2,[H*s.Rh*s.headSX*.97,s.headCentre-s.Rh*.08,-s.Rh*.05],"head",i.body.skin,[.55,1,.8],8,6);ro(U,{...i,outfit:{...i.outfit,hat:"none"}},s);const V=js(U,!1);U.forEach(H=>H.dispose()),b=new qs(V,d),b.name="Shimanchu swimwear",b.bind(v.skeleton,v.bindMatrix),b.castShadow=e,b.frustumCulled=!1,w.add(b)}v.visible=D!=="swim"&&D!=="nozomi",T.visible=v.visible,y&&(y.visible=D==="nozomi",N.visible=y.visible),b&&(b.visible=D==="swim")},dispose(){_.dispose(),d.dispose(),A.texture.dispose(),A.head.geometry.dispose(),A.head.material.dispose(),b?.geometry.dispose(),y?.geometry.dispose()}};return F.paintFace({}),F}const Eo="johansson-town-resident-wardrobes";function Ig(n,e=globalThis.localStorage){try{return Ko(JSON.parse(e?.getItem(Eo)||"{}")[n]||"")}catch{return null}}function Ty(n,e,t=globalThis.localStorage){const i=Bt({...e,name:n});let s={};try{s=JSON.parse(t?.getItem(Eo)||"{}")||{}}catch{}return s[n]=Cc(i),t?.setItem(Eo,JSON.stringify(s)),globalThis.dispatchEvent?.(new Event("johansson-appearance-change")),i}const $o=[{name:"Aya",age:24,role:"bookshop assistant",female:!0,height:1.62,work:[4.3,34],evening:[24,18],home:[-25,-47],top:"#967a99",start:540,close:1110,retire:1210,personality:"Playful mischief",friend:"Emi",look:"Black tank, olive shorts, high ponytail",hairStyle:"pony",outfit:"tank",hello:"Window seat is mine. I bookmark the funny parts — apparently that is not how a lending library works.",gossip:"Emi made a tiny apron for Tama. He has declined every fitting.",clue:"A rain-stained book is drying at the harbour office. Yoshiko knows how to save the pages.",model:"resident-00",build:.88,supperStart:1110,supperEnd:1210,house:{x:-22.4,z:-47,angle:-1.5707963267948966},homeAddress:"1 Willow Alley"},{name:"Kenji",age:32,role:"repairman",female:!1,height:1.76,work:[-3.5,17],evening:[4.5,21],home:[-29,-47],top:"#527d99",start:540,close:1080,retire:1260,personality:"Enthusiastic tinkerer",friend:"Tetsuo",look:"Blue hoodie and tousled ink-black hair",hairStyle:"messy",outfit:"work",hello:"I fixed the kettle. It now whistles in a slightly more confident key.",gossip:"Tetsuo says my repairs are too loud. His radio can be heard from the pier.",clue:"The cabinet outside my workshop runs Star Port. Beat my score and I will show you around.",model:"resident-01",build:.965,supperStart:1092,supperEnd:1207,house:{x:-31.6,z:-47,angle:1.5707963267948966},homeAddress:"2 Willow Alley"},{name:"Mrs Sato",age:68,role:"shopkeeper",female:!0,height:1.55,work:[-4.2,-26],evening:[-26,46],home:[-25,-39],top:"#ad6178",start:540,close:1080,retire:1260,personality:"Affectionately formidable",friend:"Fumiko",look:"Berry apron dress, silver bob and round spectacles",hairStyle:"bun",outfit:"apron",hello:"You look hungry. Yes, I say that to everyone. I am usually right.",gossip:"Fumiko claims she only came for tea. I have saved her the largest bowl.",clue:"Thuan names her plants. The assistant manager by her door is very demanding.",model:"resident-02",build:1.05,supperStart:1104,supperEnd:1234,house:{x:-22.4,z:-39,angle:-1.5707963267948966},homeAddress:"3 Willow Alley"},{name:"Harbour master",age:58,role:"harbour master",female:!1,height:1.74,work:[1.6,-70],evening:[4.2,-48],home:[-29,-39],top:"#405d7e",start:300,close:840,retire:1260,personality:"Dry wit, soft heart",friend:"Mr Fujita",look:"Navy vest, silver hair and round spectacles",hairStyle:"part",outfit:"jacket",hello:"I can predict rain by my knees. The radio insists on taking all the credit.",gossip:"Fujita caught a fish this big. The distance between his hands increases every evening.",clue:"There is a blue-taped folio in the harbour office tray. Take a proper look; it has travelled.",model:"resident-03",build:1.135,supperStart:1020,supperEnd:1120,house:{x:-31.6,z:-39,angle:1.5707963267948966},homeAddress:"4 Willow Alley"},{name:"Bus driver",age:49,role:"bus driver",female:!1,height:1.73,work:[-4.5,44],evening:[-26,46],home:[-25,-32],top:"#498d8b",start:540,close:1080,retire:1260,personality:"Patient storyteller",friend:"Naoko",look:"Navy vest and neat dark hair",hairStyle:"part",outfit:"vest",hello:"I collect passengers and opening sentences. The best stories start at the last stop.",gossip:"Naoko can deliver a letter before I finish reading the address.",clue:"Read the timetable by the stop before you wander down to the water.",model:"resident-04",build:.88,supperStart:1092,supperEnd:1207,house:{x:-22.4,z:-32,angle:-1.5707963267948966},homeAddress:"5 Willow Alley"},{name:"Cold-storage kid",age:19,role:"ice store assistant",female:!1,height:1.69,work:[-8,-55],evening:[-8,-55],home:[-29,-32],top:"#6eaa9b",start:540,close:1080,retire:1260,personality:"Shy, unexpectedly funny",friend:"Kenta",look:"Pale-blue hoodie and chestnut hair",hairStyle:"fringe",outfit:"work",hello:"I work with ice. Breaking it socially is the difficult part.",gossip:"Kenta practises his introduction to Emi in front of the freezer. I try not to applaud.",clue:"Buy ice before you go fishing. The fish appreciate the planning, briefly.",model:"resident-05",build:.965,supperStart:null,supperEnd:130,house:{x:-31.6,z:-32,angle:1.5707963267948966},homeAddress:"6 Willow Alley"},{name:"Officer Mori",age:45,role:"policeman",female:!1,height:1.78,work:[0,49],evening:[-26,46],home:[-25,-25],top:"#4b6e9c",start:1320,close:1800,retire:1800,personality:"Earnest and easily teased",friend:"Reiko",look:"Blue vest and softly greying hair",hairStyle:"crop",outfit:"jacket",hello:"No suspicious activity today. Except someone teaching the cat to ignore me.",gossip:"Reiko asked for a statement. I gave her three pages. She printed the bit about my lunch.",clue:"The river path circles back to the harbour. Keep an eye out for the heron.",model:"resident-06",build:1.05,supperStart:null,supperEnd:null,house:{x:-22.4,z:-25,angle:-1.5707963267948966},homeAddress:"7 Willow Alley"},{name:"Hana",age:17,role:"school pupil",female:!0,height:1.57,work:[43,36],evening:[36,30],home:[-29,-25],top:"#d17b78",start:540,close:1080,retire:1260,personality:"Bold little artist",friend:"Daichi",look:"Coral apron dress and chestnut bob",hairStyle:"bob",outfit:"cardigan",hello:"I sketch everyone while they wait for the bus. Sitting still is their contribution.",gossip:"Daichi says he cannot pose. He has three different heroic expressions prepared.",clue:"The hillside shrine has the best view for drawing roofs.",model:"resident-07",build:1.135,supperStart:null,supperEnd:115,house:{x:-31.6,z:-25,angle:1.5707963267948966},homeAddress:"8 Willow Alley"},{name:"Daichi",age:17,role:"school pupil",female:!1,height:1.7,work:[45,36],evening:[28,50],home:[-25,-20],top:"#cda04f",start:540,close:1080,retire:1260,personality:"Big dreams, gentle nature",friend:"Hana",look:"Ochre hoodie and warm brown hair",hairStyle:"messy",outfit:"sweater",hello:"One day I will pitch a perfect game. Today I am working on finding the ball.",gossip:"Hana drew me as a famous player. She made the ball enormous so I could hit it.",clue:"Hana likes the shrine view. I carry the pencils. It is a specialist position.",model:"resident-08",build:.88,supperStart:null,supperEnd:130,house:{x:-22.4,z:-20,angle:-1.5707963267948966},homeAddress:"9 Willow Alley"},{name:"Mr Fujita",age:73,role:"retired fisherman",female:!1,height:1.64,work:[-38,-60],evening:[-34,39],home:[-29,-20],top:"#73988a",start:540,close:1080,retire:1260,personality:"Cheerful embellisher",friend:"Harbour master",look:"Sea-green vest, white hair and round spectacles",hairStyle:"receding",outfit:"sweater",hello:"The fish was enormous. Ask me tomorrow; I expect it will have grown.",gossip:"The harbour master has heard this story before. He still asks how it ends.",clue:"The outer pier has a bait station. The gulls regard it as their property.",model:"resident-09",build:.965,supperStart:1080,supperEnd:1180,house:{x:-31.6,z:-20,angle:1.5707963267948966},homeAddress:"10 Willow Alley"},{name:"Masaru",age:51,role:"fisherman",female:!1,height:1.72,work:[-38,-74],evening:[24,18],home:[-25,-12],top:"#bd7959",start:540,close:1080,retire:1560,personality:"Boisterous cook-at-heart",friend:"Nao",look:"Rust hoodie and brown hair",hairStyle:"curly",outfit:"work",hello:"A good catch is a good supper. A poor catch is a very long story.",gossip:"Nao lets me suggest specials. She very sensibly ignores most of them.",clue:"Try the grilled skewers at Minato. The last one is always the best one.",model:"resident-10",build:1.05,supperStart:1380,supperEnd:1560,house:{x:-22.4,z:-12,angle:-1.5707963267948966},homeAddress:"11 Willow Alley"},{name:"Yoshiko",age:61,role:"bathhouse keeper",female:!0,height:1.58,work:[-34,39],evening:[-34,39],home:[-29,-12],top:"#9ea66c",start:540,close:1260,retire:1260,personality:"Calm neighbourhood anchor",friend:"Mrs Sato",look:"Sage apron dress and silver bob",hairStyle:"bun",outfit:"apron",hello:"A hot bath, a clean towel, a little patience. Most days need all three.",gossip:"Sato pretends she does not gossip. She just asks exceptionally well-informed questions.",clue:"Bring the waterlogged book to my warm drying rack. Slowly, away from the stove.",model:"resident-11",build:1.135,supperStart:1284,supperEnd:1380,house:{x:-31.6,z:-12,angle:1.5707963267948966},homeAddress:"12 Willow Alley"},{name:"Reiko",age:36,role:"newspaper editor",female:!0,height:1.62,work:[-4,-2],evening:[-4,-2],home:[-25,-5],top:"#a96883",start:540,close:1080,retire:1260,personality:"Curious, loves a scoop",friend:"Officer Mori",look:"Burgundy vest, long dark hair and round spectacles",hairStyle:"bob",outfit:"jacket",hello:"Nothing is off the record until I put my pencil away. There. What did you hear?",gossip:"Mori writes beautiful incident reports. Unfortunately nothing ever happens.",clue:"I left a stack of evening papers outside the press. The corrections are on page two.",model:"resident-12",build:.88,supperStart:1080,supperEnd:1180,house:{x:-22.4,z:-5,angle:-1.5707963267948966},homeAddress:"13 Willow Alley"},{name:"Tetsuo",age:40,role:"radio repairer",female:!1,height:1.7,work:[4,-13],evening:[24,18],home:[-29,-5],top:"#807398",start:540,close:1080,retire:1605,personality:"Deadpan music lover",friend:"Kenji",look:"Aubergine vest, dark hair and round spectacles",hairStyle:"part",outfit:"vest",hello:"Turn it gently. Radios have feelings. Mostly static, but feelings.",gossip:"Kenji has repaired my radio twice. I keep finding extra screws.",clue:"There are three radio stations. Each claims it has the most reliable weather.",model:"resident-13",build:.965,supperStart:1440,supperEnd:1605,house:{x:-31.6,z:-5,angle:1.5707963267948966},homeAddress:"14 Willow Alley"},{name:"Emi",age:29,role:"seamstress",female:!0,height:1.61,work:[38,34],evening:[28,50],home:[-25,2],top:"#d797a2",start:540,close:1080,retire:1260,personality:"Warm, quietly daring",friend:"Aya",look:"Rose dress and chestnut ponytail",hairStyle:"pony",outfit:"blouse",hello:"I keep little fabric scraps. They are not clutter; they are future possibilities.",gossip:"Aya lends me adventure novels. I repay her in pockets deep enough to hide one.",clue:"Thuan has postcards by the biscuits. Ask her which gull looks most important.",model:"resident-14",build:1.05,supperStart:1104,supperEnd:1234,house:{x:-22.4,z:2,angle:-1.5707963267948966},homeAddress:"15 Willow Alley"},{name:"Mr Tanabe",age:66,role:"shrine caretaker",female:!1,height:1.66,work:[20,50],evening:[20,56],home:[-29,2],top:"#bbaa85",start:540,close:1080,retire:1260,personality:"Playful philosopher",friend:"Mr Fujita",look:"Cream vest, silver hair and round spectacles",hairStyle:"receding",outfit:"sweater",hello:"The shrine bell sounds different every day. Or perhaps I am getting better at listening.",gossip:"Fujita says his fish was a sign of good fortune. It was certainly a sign of good appetite.",clue:"Leave an intention at the shrine. Then do one small thing about it.",model:"resident-15",build:1.135,supperStart:1080,supperEnd:1180,house:{x:-31.6,z:2,angle:1.5707963267948966},homeAddress:"16 Willow Alley"},{name:"Naoko",age:33,role:"postal worker",female:!0,height:1.65,work:[4,11],evening:[-26,46],home:[-25,12],top:"#c77465",start:540,close:1080,retire:1260,personality:"Brisk, remembers everyone",friend:"Bus driver",look:"Post-red dress and dark ponytail",hairStyle:"pony",outfit:"jacket",hello:"I know every door in this town. Some of them are more polite than their owners.",gossip:"The bus driver saves stories for me. I deliver the endings to everyone else.",clue:"The postbox collection plate tells you when the next bag leaves.",model:"resident-16",build:.88,supperStart:1092,supperEnd:1207,house:{x:-22.4,z:12,angle:-1.5707963267948966},homeAddress:"17 Willow Alley"},{name:"Hiroshi",age:54,role:"grocer",female:!1,height:1.68,work:[-4,-28],evening:[24,18],home:[-29,12],top:"#7c9959",start:540,close:1080,retire:1260,personality:"Proud amateur singer",friend:"Yoshiko",look:"Moss hoodie and salt-and-pepper hair",hairStyle:"curly",outfit:"apron",hello:"I sing to the vegetables. The aubergines are a difficult audience.",gossip:"Yoshiko says I may sing at the bathhouse if I agree to sing quietly. Negotiations continue.",clue:"Sakura has cold tea. A cup after walking the harbour is an excellent idea.",model:"resident-17",build:.965,supperStart:1104,supperEnd:1234,house:{x:-31.6,z:12,angle:1.5707963267948966},homeAddress:"18 Willow Alley"},{name:"Fumiko",age:77,role:"neighbour",female:!0,height:1.49,work:[-29,50],evening:[-34,39],home:[-25,19],top:"#aa90b4",start:540,close:1080,retire:1260,personality:"Fearless neighbourhood aunt",friend:"Mrs Sato",look:"Lavender apron dress, white bob and round spectacles",hairStyle:"bob",outfit:"cardigan",hello:"At my age you can say almost anything. I am making up for lost time.",gossip:"Sato and I never gossip. We maintain the oral history of the neighbourhood.",clue:"There is a quiet bench by the shops. Sit long enough and the town comes to you.",model:"resident-18",build:1.05,supperStart:1080,supperEnd:1180,house:{x:-22.4,z:19,angle:-1.5707963267948966},homeAddress:"19 Willow Alley"},{name:"Kenta",age:21,role:"apprentice engineer",female:!1,height:1.8,work:[-4.5,17],evening:[24,18],home:[-29,19],top:"#77a5b7",start:540,close:1080,retire:1260,personality:"Sweetly awkward inventor",friend:"Cold-storage kid",look:"Sky-blue hoodie and chestnut hair",hairStyle:"curly",outfit:"work",hello:"I made a machine to save time. Explaining it takes most of the afternoon.",gossip:"The cold-store lad laughs at my jokes. Slowly, but the room is very cold.",clue:"Kenji has a small prototype on display. Pick it up and turn it over.",model:"resident-19",build:1.135,supperStart:1092,supperEnd:1207,house:{x:-31.6,z:19,angle:1.5707963267948966},homeAddress:"20 Willow Alley"},{name:"Nao",age:34,role:"izakaya owner",female:!0,height:1.65,work:[24,20],evening:[24,20],home:[-25,25],start:960,close:1620,retire:1620,top:"#c87d65",personality:"Generous host, wicked timing",friend:"Masaru",look:"Terracotta apron dress and dark bob",hairStyle:"bun",outfit:"apron",hello:"Come in, come in. The spare chair has been expecting you.",gossip:"Masaru called his catch the special of the day. It was so small I nearly served it as garnish.",clue:"Take a seat, order something warm, and listen. This town tells its best stories over supper.",model:"resident-20",build:.88,supperStart:960,supperEnd:1620,house:{x:-22.4,z:25,angle:-1.5707963267948966},homeAddress:"21 Willow Alley"},{name:"Barfly",age:43,role:"Minato regular",female:!1,height:1.72,work:[24,21],evening:[24,21],home:[24,21],top:"#b74e43",start:0,close:0,retire:1440,personality:"Unhurried, permanently thirsty",friend:"Nao",look:"Broad build, short salt-and-pepper hair, red patterned open-collar shirt and wristwatch",hairStyle:"short",outfit:"hawaiian",hello:"Another one? Nao knows my usual. I am staying right here.",gossip:"I have been at this stool long enough to know when the lanterns need trimming.",clue:"Minato stays open late. The regular at the end of the counter has never once caught the last bus.",model:"barfly",build:1.14,supperStart:null,supperEnd:null,house:{x:24,z:21,angle:0},homeAddress:"Minato Izakaya"}],zc={interests:["read","inspect","seat","shop"],snack:"rice",drink:"tea",meal:"rice"},Hc=Object.freeze(Object.fromEntries(Object.entries({Kenji:{source:"casual_2",top:"#477697",trousers:"#334b55",hair:"#24272b",skin:"#bd8b65",width:.96,accessory:"tool-pouch",interests:["arcade","machine","radio","inspect"],snack:"bun",drink:"beer",meal:"yakitori"},"Mrs Sato":{source:"female_formal",top:"#96566d",trousers:"#96566d",hair:"#c5c0ae",skin:"#c69c7c",width:1.06,accessory:"glasses",interests:["read","shop","seat","post"],snack:"tea",drink:"tea",meal:"rice"},"Harbour master":{source:"suit",top:"#455b6b",trousers:"#374653",hair:"#92958d",skin:"#b5805d",width:1.1,accessory:"captain",interests:["office","fish","read","machine","phone"],snack:"rice",drink:"beer",meal:"fish"},Tetsuo:{source:"worker",top:"#698071",trousers:"#4a5146",hair:"#444035",skin:"#ba895d",helmet:"#737768",width:1.03,accessory:"glasses",interests:["radio","machine","arcade","inspect"],snack:"bun",drink:"beer",meal:"yakitori"},"Officer Mori":{source:"suit",top:"#3c5780",trousers:"#303e57",hair:"#202528",skin:"#c79872",width:.98,accessory:"police",interests:["read","phone","post","inspect"],snack:"rice",drink:"tea",meal:"rice"},"Bus driver":{source:"suit",top:"#437f78",trousers:"#3b514e",hair:"#61564b",skin:"#b88968",width:1.04,accessory:"driver",interests:["seat","read","phone","shop"],snack:"tea",drink:"tea",meal:"fish"},Nao:{source:"female_casual",top:"#bd7557",trousers:"#394b58",hair:"#292a30",skin:"#cf9b77",width:.98,accessory:"apron",interests:["shop","post","read","radio"],shopping:"soda",snack:"rice",drink:"tea",meal:"yakitori"},Aya:{source:"female_casual",top:"#424552",trousers:"#74764e",hair:"#24212a",skin:"#d5a17d",width:.91,accessory:"ponytail-satchel",accent:"#ab799e",height:1.62,interests:["read","seat","post","shop"],snack:"tea",drink:"beer",meal:"rice"},Reiko:{source:"female_formal",top:"#a05c75",trousers:"#a05c75",hair:"#44332b",skin:"#d8ae8c",width:.96,accessory:"headband-scarf",accent:"#efe2c3",height:1.62,interests:["read","radio","phone","shop"],snack:"rice",drink:"beer",meal:"fish"},Thuan:{source:"thuan-mh",top:"#d8b23a",trousers:"#27304d",hair:"#1c1612",skin:"#e6c3a8",width:1.02,accessory:"ribbon",interests:["shop","seat","read","post"],snack:"tea",drink:"tea",meal:"rice",height:1.64},"Cold-storage kid":{source:"worker",top:"#87a5b2",trousers:"#495e71",hair:"#664634",skin:"#d4a982",helmet:"#658499",width:.9,accessory:"scarf",accent:"#ddd6ba"},Hana:{source:"female_formal",top:"#c58176",trousers:"#c58176",hair:"#76503e",skin:"#dcb594",width:.92,accessory:"headband",accent:"#eee0ae"},Daichi:{source:"casual_2",top:"#bba153",trousers:"#5d614c",hair:"#634f34",skin:"#cea276",width:.93,accessory:"satchel",accent:"#655337"},"Mr Fujita":{source:"suit",top:"#648a80",trousers:"#455d5c",hair:"#d2ccba",skin:"#b08461",width:1.08,accessory:"glasses"},Masaru:{source:"worker",top:"#a56545",trousers:"#485970",hair:"#514335",skin:"#ac7655",helmet:"#ad9264",width:1.15,accessory:"scarf",accent:"#caba8a"},Yoshiko:{source:"female_formal",top:"#859263",trousers:"#859263",hair:"#b3ada0",skin:"#c59b79",width:1.04,accessory:"bun-apron"},Emi:{source:"female_casual",top:"#c08d97",trousers:"#68657b",hair:"#775746",skin:"#d3a884",width:.95,accessory:"ponytail-satchel",accent:"#ded0ab"},"Mr Tanabe":{source:"suit",top:"#b9aa85",trousers:"#797565",hair:"#aaa998",skin:"#bd936e",width:1.02,accessory:"glasses"},Naoko:{source:"female_casual",top:"#b45a51",trousers:"#484753",hair:"#302f32",skin:"#c89977",width:.98,accessory:"headband-satchel",accent:"#7b5746"},Hiroshi:{source:"casual_2",top:"#778a53",trousers:"#535345",hair:"#79776a",skin:"#bb9269",width:1.12,accessory:"apron"},Fumiko:{source:"female_formal",top:"#9c7fac",trousers:"#9c7fac",hair:"#d6d2c8",skin:"#c69f82",width:1.08,accessory:"glasses"},Kenta:{source:"casual_2",top:"#78a7b8",trousers:"#546679",hair:"#825f44",skin:"#d4ac85",width:.96,accessory:"tool-pouch"},Yui:{source:"female_casual",top:"#66969a",trousers:"#45465e",hair:"#332d31",skin:"#d0a586",width:1.01,accessory:"headband",accent:"#e8cf85"},Barfly:{source:"casual_2",top:"#b74e43",trousers:"#36343a",hair:"#77766f",skin:"#b9825f",width:1.14,accessory:"hawaiian",interests:["seat","drink","radio"],snack:"yakitori",drink:"beer",meal:"yakitori",height:1.72}}).map(([n,e])=>[n,Object.freeze({...zc,...e})]))),Dg=Object.freeze({Aiko:"Aya",Nozomi:"Reiko"}),Ng=n=>Hc[Dg[n]||n]||zc;function Ey(n){const e={};if(!n||typeof n!="object")return e;for(const t of Object.keys(Hc)){const i=n[t];if(!i||!Number.isSafeInteger(i.day)||!Number.isFinite(i.yen))continue;const s={day:i.day,yen:Math.max(0,Math.min(2400,i.yen)),purchases:[],activities:[],meals:{}};Array.isArray(i.purchases)&&(s.purchases=i.purchases.filter(o=>o&&typeof o.id=="string"&&typeof o.item=="string"&&Number.isFinite(o.cost)&&o.cost>=0).slice(-24).map(o=>({id:o.id.slice(0,160),item:o.item.slice(0,160),cost:o.cost}))),Array.isArray(i.activities)&&(s.activities=i.activities.filter(o=>typeof o=="string").slice(-8).map(o=>o.slice(0,180)));for(const o of["market","izakaya","ramen"]){const a=i.meals?.[o];!a||!["bun","rice","tea","ramen","fish","yakitori"].includes(a.item)||(s.meals[o]={stockClaim:a.stockClaim&&["bun","rice","tea"].includes(a.stockClaim.item)&&Number.isSafeInteger(a.stockClaim.unitCost)?{item:a.stockClaim.item,unitCost:a.stockClaim.unitCost}:null,item:a.item,drink:a.drink==="beer"?"beer":"tea",delivered:a.delivered===!0,finished:a.finished===!0,started:Number.isFinite(a.started)?a.started:null,waited:Number.isFinite(a.waited)?Math.max(0,Math.min(45,a.waited)):0,eaten:Number.isFinite(a.eaten)?Math.max(0,Math.min(42,a.eaten)):0})}const r=i.shopping;r&&["browse","pickup","queue","paid","finished"].includes(r.phase)&&Number.isFinite(r.started)&&(["tea","coffee","rice","biscuit","soap","notebook","postcard","battery","cola","water","beer","noodles","milk","bun"].includes(r.item)||r.phase==="browse"&&!r.picked)&&(s.shopping={phase:r.phase,started:r.started,finished:r.finished===!0,item:["tea","coffee","rice","biscuit","soap","notebook","postcard","battery","cola","water","beer","noodles","milk","bun"].includes(r.item)?r.item:null,picked:r.picked===!0,paid:r.paid===!0,timer:Number.isFinite(r.timer)?Math.max(0,Math.min(3,r.timer)):0,position:Array.isArray(r.position)&&r.position.length===3&&r.position.every(o=>Number.isFinite(o)&&Math.abs(o)<7)?r.position:[0,0,5.2]}),e[t]=s}return e}function Ay(n=()=>null){const e={};function t(i,s){const r=n()||e,o=Math.floor(s/1440);r.residentLife??={};let a=r.residentLife[i];return(!a||a.day!==o)&&(a=r.residentLife[i]={day:o,yen:2400,purchases:[],activities:[]}),a}return{account:t,purchase(i,s,r,o,a){const l=t(i,s);return l.purchases.some(c=>c.id===r)?!0:!Number.isFinite(a)||a<0||l.yen<a?!1:(a===0||(l.yen-=a,l.purchases.push({id:r,item:o,cost:a}),l.purchases=l.purchases.slice(-24)),!0)},record(i,s,r){const o=t(i,s);o.activities.push(r),o.activities=o.activities.slice(-8)}}}const Ry=Object.freeze([Object.freeze({key:"pace",label:"Pace",low:"Unhurried",high:"Brisk"}),Object.freeze({key:"talk",label:"Talk",low:"Careful",high:"Frank"}),Object.freeze({key:"show",label:"Feelings",low:"Calm",high:"Lively"}),Object.freeze({key:"outlook",label:"Outlook",low:"Serious",high:"Easygoing"})]),In=8,Ug=Object.freeze([["Lighthouse keeper","Steady and watchful. Keeps a promise to the letter.","#3d6a8a"],["Porch sitter","In no hurry at all. Always has time to listen.","#8a5a2e"],["Old storyteller","Slow to start, but tells it with all their heart.","#8a4ab8"],["Cloud watcher","Drifts happily along with a head full of ideas.","#7fb0d8"],["Quiet craftsman","Few words, all of them meant. Does things properly.","#6d7478"],["Easy neighbour","Plain-spoken and relaxed. Will lend you a ladder.","#8fbf4a"],["Big heart","Laughs loudest, cries at films, says how they feel.","#e98aa6"],["Wanderer","Says what they like and goes where the day takes them.","#2a8a5a"],["Timekeeper","Quick, polite and composed. Has a list for everything.","#2f5f9e"],["Helping hand","First to help, and pleasant about it.","#3fa0c8"],["Rising star","Polished, quick and fond of an audience.","#f4d23c"],["Festival friend","Everywhere at once and friends with all of it.","#e8742a"],["Straight shooter","Fast and blunt. Gets it done.","#27304d"],["Joker","Quick, frank, and always up to something.","#d8342c"],["Firecracker","Quick to flare up, quick to laugh. Big energy.","#c8402e"],["Typhoon","Never still, says everything, enjoys every minute.","#45b7f0"]].map(([n,e,t])=>Object.freeze({name:n,line:e,colour:t}))),Qi=n=>Math.min(1,Math.max(0,Number.isFinite(+n)?+n:.5)),Ri=n=>Math.min(In,1+Math.floor(Qi(n)*In*.9999)),Cy=n=>(Math.min(In,Math.max(1,n))-.5)/In;function Gc(n={}){const e=t=>Ri(n[t])>In/2?1:0;return Ug[e("pace")*8+e("talk")*4+e("show")*2+e("outlook")]}const Ol=[261.6,329.6,349.2,392,493.9,523.3,659.3,698.5,784,987.8,1046.5];function Py(n={}){const e=Qi(n.pitch),t=Qi(n.speed);return{freq:Ol[Math.round(e*(Ol.length-1))],type:Qi(n.talk)>.62?"triangle":"sine",letterMs:Math.round(34-t*20),swing:Qi(n.show)>.5?1.0595:1}}const kg=Object.freeze(["January","February","March","April","May","June","July","August","September","October","November","December"]),Fg=[31,29,31,30,31,30,31,31,30,31,30,31],Og=n=>Fg[Math.min(11,Math.max(0,n-1))],Bg=n=>`${zg(n.month,n.day)} ${kg[(n.month||1)-1]}`;function zg(n,e){return Math.min(Og(n||1),Math.max(1,e|0||1))}function Ly(n){const e=n.name||"your new islander",t=n.profile||{},i=Gc(t),s=t.catchphrase?` ${t.catchphrase}`:"",r=Ri(t.talk)>4?`Hey! I'm ${e}.`:`Hello. My name is ${e}.`,o=Ri(t.show)>4?" I am so happy to be here!":" Nice to meet you.";return`${r}${o}${s}

${i.name} · born ${Bg(t)}`}const Hg=Object.freeze(Object.fromEntries(Object.entries({Johansson:[.3,.7,.7,.8],Thuan:[.7,.35,.75,.75],"Mrs Higa":[.25,.3,.3,.3],Aya:[.6,.65,.4,.75],Kenji:[.7,.4,.75,.7],"Mrs Sato":[.4,.75,.7,.3],"Harbour master":[.3,.7,.3,.65],"Bus driver":[.25,.35,.7,.3],"Cold-storage kid":[.4,.25,.35,.7],"Officer Mori":[.7,.3,.4,.6],Hana:[.7,.75,.75,.4],Daichi:[.3,.3,.7,.7],"Mr Fujita":[.35,.75,.75,.75],Masaru:[.75,.8,.8,.7],Yoshiko:[.25,.4,.25,.6],Reiko:[.75,.7,.65,.6],Tetsuo:[.3,.65,.2,.35],Emi:[.6,.35,.45,.65],"Mr Tanabe":[.25,.3,.65,.75],Naoko:[.8,.35,.35,.35],Hiroshi:[.65,.4,.8,.3],Fumiko:[.7,.85,.4,.3],Kenta:[.4,.25,.6,.65],Nao:[.7,.75,.6,.8],Barfly:[.15,.65,.35,.8]}).map(([n,[e,t,i,s]])=>[n,Object.freeze({pace:e,talk:t,show:i,outlook:s})]))),Vc=["pace","talk","show","outlook"],Gg=n=>!n||Vc.every(e=>n[e]===void 0||n[e]===.5);function Ao(n,e=n?.name){if(!n||!Gg(n.profile))return n;let t=Hg[e];if(!t&&e){let i=2166136261;for(const s of String(e))i=Math.imul(i^s.charCodeAt(0),16777619)>>>0;t=Object.fromEntries(Vc.map((s,r)=>[s,(i>>>r*7&127)/127*.8+.1]))}return t?{...n,profile:{...n.profile||{},...t}}:n}const st=n=>Bt(Ao(n)),Vg=new Set(["Thuan","Mrs Higa","Mina","Grandmother Higa","Mrs Nakamura","Mrs Yonamine","Mrs Miyagi","Mrs Kamiya","Mrs Kinjō"]),Wc=n=>Object.freeze(Object.fromEntries(Object.entries(n).map(([e,t])=>{const i=$o.find(s=>s.name===e)?.female??Vg.has(e);return[e,Bt({...t,body:{...t.body,silhouette:t.body.silhouette==="neutral"?i?"feminine":"masculine":t.body.silhouette}})]}))),Ro=Wc({Johansson:st({name:"Johansson",body:{height:.72,build:.72,silhouette:"masculine",skin:"#dc9d7a"},head:{size:.48,shape:.45,form:"square",jaw:.75,cheeks:.55},hair:{style:"horseshoe",colour:"#b8b4aa"},eyes:{style:"gentle",colour:"#3d6a8a",size:.45,spacing:.52,height:.5,tilt:.45},brows:{style:"bushy",colour:"#a8a49a",size:.6,height:.55,tilt:.45},nose:{style:"wide",size:.6,height:.48},mouth:{style:"smile",colour:"#a8433e",size:.55,height:.5},facial:{style:"stubble",colour:"#b8b4aa"},wrinkles:.7,blush:.35,outfit:{top:"kariyushi",topColour:"#7fb0d8",pattern:"flowers",bottom:"shorts",bottomColour:"#c8b48a",footwear:"sandals",shoes:"#6d4a32",accent:"#f4f1ea"},swim:{colour:"#2f5f9e"}}),Thuan:st({name:"Thuan",accessories:{earrings:"studs",neckwear:"pendant",colour:"#e0b93a"},body:{height:.36,build:.35,silhouette:"feminine",skin:"#f1cfae"},head:{size:.48,shape:.48,form:"heart",jaw:.3,cheeks:.62},hair:{style:"braids",colour:"#1c1714",flip:!1},eyes:{style:"lashes",colour:"#2a1d16",size:.78,spacing:.5,height:.48,tilt:.55},brows:{style:"arched",colour:"#2a1d16",size:.42,height:.55,tilt:.5},nose:{style:"dot",size:.35,height:.5},mouth:{style:"smile",colour:"#cc3d52",size:.42,height:.5},glasses:{style:"round",colour:"#e06a7a"},blush:.65,outfit:{top:"blouse",topColour:"#f4d23c",pattern:"flowers",bottom:"trousers",bottomColour:"#27304d",shoes:"#f4f1ea",accent:"#f4d23c"},swim:{colour:"#e98aa6"}}),Nao:st({name:"Nao",body:{height:.42,build:.45,skin:"#e8bf98"},head:{size:.46,shape:.4,form:"oval",jaw:.35,cheeks:.45},hair:{style:"ponytail",colour:"#292a30"},eyes:{style:"almond",colour:"#2a1d16",size:.55,spacing:.5,height:.5,tilt:.6},brows:{style:"straight",colour:"#292a30",size:.5},nose:{style:"button",size:.4},mouth:{style:"grin",colour:"#b8544a",size:.5},blush:.3,outfit:{top:"apron",topColour:"#bd7557",bottom:"trousers",bottomColour:"#394b58",shoes:"#2b2b2b",hat:"kerchief",hatColour:"#27304d",accent:"#f4f1ea"}}),Aya:st({name:"Aya",accessories:{earrings:"hoops",pin:!0,colour:"#c8a060"},body:{height:.34,build:.38,skin:"#efc9a4"},head:{size:.5,shape:.52,form:"round",jaw:.35,cheeks:.6},hair:{style:"bob",colour:"#2e211b"},eyes:{style:"round",colour:"#3a2a1e",size:.6,spacing:.5,height:.5,tilt:.5},brows:{style:"arched",colour:"#2e211b",size:.45},nose:{style:"button",size:.35},mouth:{style:"small",colour:"#c4485a",size:.45},glasses:{style:"round",colour:"#7a4a2a"},blush:.45,outfit:{hat:"beret",hatColour:"#5f8f6a",top:"jacket",topColour:"#5f8f6a",pattern:"dots",bottom:"longskirt",bottomColour:"#e6d3b0",shoes:"#6b4a2e",accent:"#f4e4c8"}}),Reiko:st({name:"Reiko",accessories:{neckwear:"scarf",colour:"#d8342c"},body:{height:.46,build:.42,skin:"#e8bf98"},head:{size:.47,shape:.44,form:"oval",jaw:.4,cheeks:.4},hair:{style:"ponytail",colour:"#1c1714"},eyes:{style:"almond",colour:"#2a1d16",size:.5,tilt:.6},brows:{style:"straight",colour:"#1c1714",size:.5},nose:{style:"line",size:.4},mouth:{style:"smirk",colour:"#a8433e",size:.45},outfit:{top:"smock",topColour:"#3f5f7a",bottom:"trousers",bottomColour:"#2b2b33",shoes:"#2b2b2b",accent:"#f4f1ea"}}),Kenji:st({name:"Kenji",body:{height:.6,build:.55,skin:"#c98d62"},head:{size:.48,shape:.5,form:"square",jaw:.6,cheeks:.45},hair:{style:"spiky",colour:"#2b1d14"},eyes:{style:"sparkle",colour:"#2a1d16",size:.55},brows:{style:"thick",colour:"#2b1d14",size:.55},nose:{style:"wide",size:.5},mouth:{style:"grin",size:.55},facial:{style:"stubble",colour:"#2b1d14"},outfit:{top:"kariyushi",topColour:"#f2a93b",pattern:"flowers",bottom:"shorts",bottomColour:"#3f5f7a",shoes:"#f4f1ea",accent:"#f4f1ea"}}),Tetsuo:st({name:"Tetsuo",accessories:{pin:!0,colour:"#e0b93a"},body:{height:.44,build:.5,skin:"#dca97e"},head:{size:.5,shape:.5,form:"narrow",jaw:.55,cheeks:.35},hair:{style:"horseshoe",colour:"#8a8680"},eyes:{style:"sleepy",colour:"#2a1d16",size:.45},brows:{style:"bushy",colour:"#8a8680",size:.6},nose:{style:"hook",size:.55},mouth:{style:"flat",size:.5},glasses:{style:"half",colour:"#2b2b2b"},wrinkles:.6,outfit:{top:"jacket",topColour:"#6b6f4a",bottom:"trousers",bottomColour:"#4a4238",shoes:"#3a2a1e",accent:"#e8d7b0"}}),"Mrs Sato":st({name:"Mrs Sato",body:{height:.22,build:.6,skin:"#e2b48c"},head:{size:.5,shape:.56,form:"round",jaw:.4,cheeks:.6},hair:{style:"bun",colour:"#c9c6c0"},eyes:{style:"gentle",colour:"#2a1d16",size:.45},brows:{style:"arched",colour:"#b9b6b0",size:.5},nose:{style:"button",size:.45},mouth:{style:"smile",colour:"#b8544a",size:.5},glasses:{style:"round",colour:"#6b4a2e"},wrinkles:.7,blush:.3,outfit:{top:"apron",topColour:"#ad6178",bottom:"trousers",bottomColour:"#4a4040",shoes:"#2b2b2b",hat:"kerchief",hatColour:"#f4f1ea",accent:"#f4f1ea"}}),"Mrs Higa":st({name:"Mrs Higa",body:{height:.24,build:.58,skin:"#c99a74"},head:{size:.5,shape:.55,form:"round",jaw:.35,cheeks:.6},hair:{style:"perm",colour:"#9a968e"},eyes:{style:"sleepy",colour:"#2a1d16",size:.42},brows:{style:"thin",colour:"#8a8680",size:.45},nose:{style:"button",size:.45},mouth:{style:"small",colour:"#a8433e",size:.45},glasses:{style:"half",colour:"#6b4a2e"},wrinkles:.75,blush:.25,outfit:{top:"blouse",topColour:"#6d8a74",bottom:"skirt",bottomColour:"#3a3a42",shoes:"#2b2b2b",accent:"#f4f1ea"}}),"Harbour master":st({name:"Harbour master",body:{height:.52,build:.68,skin:"#b5805d"},head:{size:.52,shape:.55,form:"round",jaw:.6,cheeks:.5},hair:{style:"horseshoe",colour:"#b9b7b0"},eyes:{style:"gentle",colour:"#2a1d16",size:.45},brows:{style:"bushy",colour:"#cfcdc6",size:.6},nose:{style:"wide",size:.55},mouth:{style:"flat",size:.5},glasses:{style:"round",colour:"#2b2b2b"},facial:{style:"walrus",colour:"#dedbd3"},wrinkles:.55,outfit:{top:"jacket",topColour:"#2c3e5c",bottom:"trousers",bottomColour:"#27304d",shoes:"#1c1c24",hat:"captain",hatColour:"#f4f1ea",accent:"#e0b93a"}}),"Officer Mori":st({name:"Officer Mori",body:{height:.7,build:.48,skin:"#c79872"},head:{size:.48,shape:.46,form:"oval",jaw:.5,cheeks:.4},hair:{style:"crop",colour:"#4a4845"},eyes:{style:"round",colour:"#2a1d16",size:.62},brows:{style:"worried",colour:"#3a3835",size:.55},nose:{style:"button",size:.45},mouth:{style:"smile",size:.45},blush:.2,wrinkles:.2,outfit:{top:"polo",topColour:"#9dbfe0",bottom:"trousers",bottomColour:"#27304d",shoes:"#1c1c24",hat:"police",hatColour:"#27304d",accent:"#e0b93a"}})}),Bl=Wc({Riku:st({body:{silhouette:"masculine",height:.56,build:.55,skin:"#c89a74"},hair:{style:"crop",colour:"#33271f"},eyes:{style:"round"},brows:{style:"thick"},mouth:{style:"smile"},outfit:{top:"polo",topColour:"#587d83",bottom:"trousers",bottomColour:"#505f65",hat:"helmet",hatColour:"#dabb55"}}),"Emi Kado":st({body:{silhouette:"feminine",height:.43,build:.42,skin:"#d1a079"},hair:{style:"ponytail",colour:"#3c2c24"},eyes:{style:"almond"},mouth:{style:"smile"},outfit:{top:"polo",topColour:"#a77e67",bottom:"trousers",bottomColour:"#465d69",hat:"cap",hatColour:"#465d69"}}),Haru:st({head:{form:"square",jaw:.72,cheeks:.4},body:{height:.63,build:.58,skin:"#bf875f"},hair:{style:"crop",colour:"#302419"},eyes:{style:"narrow"},brows:{style:"thick"},nose:{style:"wide"},mouth:{style:"smile"},facial:{style:"stubble",colour:"#302419"},outfit:{top:"polo",topColour:"#607c84",bottom:"shorts",bottomColour:"#7b7155",hat:"cap",hatColour:"#c4b486"}}),Mina:st({head:{form:"oval",jaw:.35,cheeks:.6},body:{height:.4,build:.45,skin:"#d8ac87"},hair:{style:"bun",colour:"#3b2920"},eyes:{style:"gentle",size:.48},brows:{style:"arched"},nose:{style:"button"},mouth:{style:"smile"},outfit:{top:"apron",topColour:"#849267",bottom:"longskirt",bottomColour:"#5c6e75"}}),Jun:st({head:{form:"narrow",jaw:.4,cheeks:.3},body:{height:.53,build:.4,skin:"#dbb393"},hair:{style:"sidepart",colour:"#29241e"},eyes:{style:"almond"},brows:{style:"straight"},nose:{style:"line"},mouth:{style:"small"},glasses:{style:"half",colour:"#5b5c52"},outfit:{top:"polo",topColour:"#e0dac7",bottom:"trousers",bottomColour:"#3e596d"}}),"Grandmother Higa":st({head:{size:.48,shape:.5,form:"round",jaw:.7,cheeks:.85},body:{height:.2,build:.6,skin:"#dca97e"},hair:{style:"perm",colour:"#d8d6d0"},eyes:{style:"gentle",size:.4},brows:{style:"thin",colour:"#9a9a96"},nose:{style:"button",size:.55},mouth:{style:"smile",size:.45},glasses:{style:"half",colour:"#8a4a3a"},wrinkles:1,blush:.4,outfit:{top:"blouse",topColour:"#8a4ab8",pattern:"flowers",bottom:"longskirt",bottomColour:"#6d7478",shoes:"#2b2b2b"}}),"Mr Ōshiro":st({head:{size:.48,shape:.5,form:"narrow",jaw:.45,cheeks:.3},body:{height:.4,build:.4,skin:"#b27449"},hair:{style:"buzz",colour:"#d8d6d0"},eyes:{style:"narrow"},brows:{style:"bushy",colour:"#d8d6d0"},nose:{style:"hook",size:.6},mouth:{style:"flat"},facial:{style:"stubble",colour:"#d8d6d0"},wrinkles:.9,outfit:{top:"tee",topColour:"#f4f1ea",bottom:"trousers",bottomColour:"#6d7478",shoes:"#2b2b2b",hat:"straw",hatColour:"#e0c078"}}),"Uncle Kinjō":st({head:{size:.48,shape:.5,form:"square",jaw:.8,cheeks:.65},body:{height:.55,build:.75,skin:"#c98d62"},hair:{style:"crop",colour:"#5a3a22"},eyes:{style:"dot"},brows:{style:"thick"},nose:{style:"wide"},mouth:{style:"wide"},facial:{style:"moustache",colour:"#3a2618"},wrinkles:.5,outfit:{top:"polo",topColour:"#2a8a5a",bottom:"shorts",bottomColour:"#c8b48a",shoes:"#6d4a32",hat:"cap",hatColour:"#d8342c"}}),"Mrs Nakamura":st({head:{size:.48,shape:.5,form:"round",jaw:.55,cheeks:.8},body:{height:.25,build:.6,skin:"#e8bf98"},hair:{style:"bun",colour:"#5a3a22"},eyes:{style:"round",size:.55},brows:{style:"arched"},nose:{style:"button"},mouth:{style:"grin",colour:"#cc3d52"},blush:.5,wrinkles:.4,outfit:{top:"apron",topColour:"#3fa0c8",bottom:"skirt",bottomColour:"#27304d",shoes:"#f4f1ea",hat:"kerchief",hatColour:"#f4f1ea",accent:"#f4f1ea"}}),"Mr Shimabukuro":st({head:{size:.48,shape:.5,form:"narrow",jaw:.5,cheeks:.35},body:{height:.5,build:.45,skin:"#dca97e"},hair:{style:"sidepart",colour:"#1c1714"},eyes:{style:"almond"},brows:{style:"straight"},nose:{style:"line"},mouth:{style:"smirk"},facial:{style:"moustache",colour:"#1c1714"},wrinkles:.3,outfit:{top:"smock",topColour:"#f4f1ea",bottom:"trousers",bottomColour:"#2b2b2b",shoes:"#2b2b2b"}}),"Mrs Yonamine":st({head:{size:.48,shape:.5,form:"heart",jaw:.3,cheeks:.65},body:{height:.3,build:.55,skin:"#c98d62"},hair:{style:"ponytail",colour:"#3a2618"},eyes:{style:"sparkle"},brows:{style:"thick"},nose:{style:"button"},mouth:{style:"wide"},blush:.3,outfit:{top:"apron",topColour:"#2f5f9e",bottom:"trousers",bottomColour:"#27304d",shoes:"#f4f1ea",hat:"headband",hatColour:"#d8342c",accent:"#f4f1ea"}}),"Mrs Miyagi":st({head:{size:.48,shape:.5,form:"oval",jaw:.35,cheeks:.4},body:{height:.1,build:.4,skin:"#c98d62"},hair:{style:"bun",colour:"#f4f1ea"},eyes:{style:"sleepy"},brows:{style:"thin",colour:"#d8d6d0"},nose:{style:"button"},mouth:{style:"small"},wrinkles:1,outfit:{top:"blouse",topColour:"#f4f1ea",bottom:"longskirt",bottomColour:"#2f5f9e",shoes:"#2b2b2b"}}),"Mr Tamaki":st({head:{size:.48,shape:.5,form:"square",jaw:.7,cheeks:.4},body:{height:.6,build:.7,skin:"#c98d62"},hair:{style:"spiky",colour:"#1c1714"},eyes:{style:"round"},brows:{style:"thick"},nose:{style:"wide"},mouth:{style:"grin"},outfit:{top:"jacket",topColour:"#e8742a",bottom:"trousers",bottomColour:"#27304d",shoes:"#2b2b2b",hat:"headband",hatColour:"#f4f1ea"}}),Kōji:st({head:{size:.48,shape:.5,form:"oval",jaw:.65,cheeks:.4},body:{height:.58,build:.5,skin:"#b27449"},hair:{style:"crop",colour:"#3a2618"},eyes:{style:"dot"},brows:{style:"straight"},nose:{style:"button"},mouth:{style:"grin"},outfit:{top:"tee",topColour:"#d8342c",bottom:"shorts",bottomColour:"#2f5f9e",shoes:"#f4f1ea",hat:"kerchief",hatColour:"#2f5f9e"}}),"Mr Nakasone":st({head:{size:.48,shape:.5,form:"square",jaw:.75,cheeks:.6},body:{height:.42,build:.55,skin:"#dca97e"},hair:{style:"horseshoe",colour:"#d8d6d0"},eyes:{style:"gentle"},brows:{style:"bushy",colour:"#d8d6d0"},nose:{style:"wide"},mouth:{style:"smile"},glasses:{style:"square",colour:"#2b2b2b"},wrinkles:.8,outfit:{top:"polo",topColour:"#d8342c",bottom:"trousers",bottomColour:"#c8b48a",shoes:"#f4f1ea",hat:"cap",hatColour:"#f4f1ea"}}),"Mrs Kamiya":st({head:{size:.48,shape:.5,form:"round",jaw:.5,cheeks:.7},body:{height:.2,build:.5,skin:"#e8bf98"},hair:{style:"perm",colour:"#9a9a96"},eyes:{style:"round",size:.45},brows:{style:"arched",colour:"#9a9a96"},nose:{style:"dot"},mouth:{style:"small",colour:"#e06a7a"},wrinkles:.8,blush:.4,outfit:{top:"polo",topColour:"#3fa0c8",bottom:"trousers",bottomColour:"#f4f1ea",shoes:"#f4f1ea",hat:"straw",hatColour:"#f4f1ea"}}),"Mr Arakaki":st({head:{size:.48,shape:.5,form:"narrow",jaw:.3,cheeks:.25},body:{height:.35,build:.35,skin:"#dca97e"},hair:{style:"bald",colour:"#9a9a96"},eyes:{style:"narrow"},brows:{style:"worried",colour:"#9a9a96"},nose:{style:"hook"},mouth:{style:"flat"},glasses:{style:"round",colour:"#2b2b2b"},wrinkles:.9,outfit:{top:"polo",topColour:"#f4d23c",bottom:"trousers",bottomColour:"#27304d",shoes:"#2b2b2b",hat:"cap",hatColour:"#2f5f9e"}}),"Mrs Kinjō":st({head:{size:.48,shape:.5,form:"heart",jaw:.4,cheeks:.55},body:{height:.32,build:.55,skin:"#dca97e"},hair:{style:"bob",colour:"#3a2618"},eyes:{style:"round"},brows:{style:"arched"},nose:{style:"button"},mouth:{style:"smile",colour:"#b8544a"},blush:.4,wrinkles:.3,outfit:{top:"blouse",topColour:"#e98aa6",pattern:"dots",bottom:"skirt",bottomColour:"#6d7478",shoes:"#9a6a42"}}),"Postman Tōma":st({head:{size:.48,shape:.5,form:"oval",jaw:.5,cheeks:.4},body:{height:.6,build:.4,skin:"#e8bf98"},hair:{style:"sidepart",colour:"#3a2618",flip:!0},eyes:{style:"round"},brows:{style:"straight"},nose:{style:"line"},mouth:{style:"smile"},outfit:{top:"polo",topColour:"#2f5f9e",bottom:"trousers",bottomColour:"#27304d",shoes:"#2b2b2b",hat:"cap",hatColour:"#2f5f9e"}})}),Wg={captain:["captain","#f4f1ea"],police:["police","#27304d"],driver:["cap","#2a8a5a"],apron:["kerchief","#f4f1ea"],"headband-scarf":["headband","#efe2c3"],headband:["headband","#e8cf85"],"headband-satchel":["headband","#7b5746"]},Co=new Map($o.map(n=>[n.name,n.age])),zl=(n,e)=>{const t=Rc(Co.get(e));return Co.has(e)&&n.age!==t?Bt({...n,age:t}):n};function Xg(n=""){const e=Ig(n);if(e)return e;if(Ro[n])return zl(Ro[n],n);if(Bl[n])return zl(Bt(Ao(Bl[n],n)),n);const t=Ng(n),i=Jo(n),s=l=>l[Math.floor(i()*l.length)],r=$o.find(l=>l.name===n)?.female??(/female/.test(t.source||"")||/^(Mrs |Aya|Reiko|Hana|Yoshiko|Emi|Naoko|Fumiko|Yui)/.test(n)),o=/^#[a-f0-9]{6}$/i.test(t.hair||"")&&parseInt(t.hair.slice(1,3),16)>150,a=Wg[t.accessory]||(t.helmet?["helmet",t.helmet]:["none","#f4f1ea"]);return Bt(Ao({name:n,age:Rc(Co.get(n)),body:{silhouette:r?"feminine":"masculine",height:.3+i()*.45,build:.3+(Math.min(1.2,t.width||1)-.85)*1.6,skin:t.skin||"#e8bf98"},head:{size:.38+i()*.22,shape:i(),form:s(pt.head),jaw:.25+i()*.5,cheeks:.25+i()*.5},hair:{style:s(o&&!r?["horseshoe","buzz","crop"]:r?["bob","long","ponytail","bun","sidepart"]:["crop","sidepart","spiky","buzz"]),colour:t.hair||"#1c1714",flip:i()<.5},eyes:{style:s(pt.eyes),size:.35+i()*.35,spacing:.4+i()*.2,tilt:.4+i()*.2},brows:{style:s(pt.brows.slice(0,6)),colour:t.hair||"#1c1714"},nose:{style:s(pt.nose.slice(0,5)),size:.35+i()*.4},mouth:{style:s(pt.mouth),colour:r?"#cc3d52":"#b8544a"},glasses:{style:/glasses/.test(t.accessory||"")?"square":"none",colour:"#2b2b2b"},facial:{style:!r&&i()<.25?s(["moustache","stubble","goatee"]):"none",colour:t.hair||"#1c1714"},blush:r?.4:.15,wrinkles:o?.7:0,outfit:{top:t.accessory==="apron"?"apron":t.accessory==="hawaiian"?"kariyushi":r?"blouse":"polo",topColour:t.top||"#3fa0c8",pattern:t.accessory==="hawaiian"?"flowers":"none",bottom:r&&t.top===t.trousers?"longskirt":"trousers",bottomColour:t.trousers||"#27304d",shoes:"#2b2b2b",hat:a[0],hatColour:a[1],accent:t.accent||"#f4d23c"}}))}const Hl=Object.freeze({x:-25,z:-44,width:8.8,depth:7.4,door:Object.freeze([-25,0,-39.65])}),Iy=Object.freeze({width:8.4,depth:7,bounds:{minX:-4.2,maxX:4.2,minZ:-3.5,maxZ:3.5},doorX:0,spawn:[0,0,2.9],exit:[0,1.1,3.42],yaw:0,staff:{Kenji:[-1.25,0,-1.9],Tetsuo:[1.5,0,-1.9]}}),Xc=Object.freeze({title:"Dock Electrical & Repair Workshop",jp:"Dock Electrical Workshop",sub:"ELECTRICAL · INSTRUMENTS · REPAIRS",industrialWorkshop:!0,x:Hl.x,z:Hl.z,line:"Kenji’s fabrication and Form 3D bench, with Tetsuo’s electrical and instrument repairs.",directions:"On the western quay, beside the harbour warehouse. Look for the blue electrical workshop sign."}),Yc=Object.freeze([{id:"yuri-home",entry:"one",number:"1",residents:["Thuan","Nao"]},{id:"resident-home-aya",entry:"two",number:"2",residents:["Aya","Reiko"]},{id:"resident-home-kenji",entry:"three",number:"3",residents:["Kenji","Tetsuo"]},{id:"resident-home-mrs-sato",entry:"four",number:"4A",residents:["Mrs Sato"]},{id:"resident-home-officer-mori",entry:"four",number:"4B",residents:["Officer Mori"]},{id:"resident-home-harbour-master",entry:"five",number:"5A",residents:["Harbour master"]},{id:"resident-home-bus-driver",entry:"five",number:"5B",residents:["Bus driver"]}].map(n=>Object.freeze({...n,residents:Object.freeze(n.residents),address:n.number+" Main Street",title:n.residents.join(" & ")+"’s home"}))),Yg=Object.freeze({"resident-home-nao":"yuri-home","resident-home-reiko":"resident-home-aya","resident-home-tetsuo":"resident-home-kenji"}),qc=n=>Yg[n]||n,qg=n=>Yc.find(e=>e.residents.includes(n)),jg=n=>Yc.find(e=>e.id===qc(n?.id))||qg(n?.homeOwner),Dy=n=>n?.homeOwners||jg(n)?.residents||(n?.homeOwner?[n.homeOwner]:[]),xi=Object.freeze({LEGACY:"legacy",SHOPPING:"shopping-district",PENINSULA:"peninsula"});let sr=xi.LEGACY;function Ny(n=xi.LEGACY){return sr=Object.values(xi).includes(n)?n:xi.LEGACY,sr}const Uy=()=>sr!==xi.LEGACY,Kg=()=>sr===xi.PENINSULA,ky=Object.freeze({z:1.6,width:8.8,depth:7.4}),Fy=Object.freeze({width:8.4,depth:7,doorX:0,bounds:{minX:-4.2,maxX:4.2,minZ:-3.5,maxZ:3.5},spawn:[0,0,2.9],exit:[0,1.1,3.42],yaw:0,staff:{Aya:[-2.6,0,1.2],Reiko:[-2.6,0,-1.9]}}),jc=Object.freeze({title:"Front-Row Books",jp:"Front-Row Books",sub:"BOOKS · NEWSPAPERS · LOCAL STORIES",bookshop:!0,side:-1,line:"Aya’s small neighbourhood bookshop, with reading copies, second-hand books and Reiko’s evening newspaper.",directions:"On the west pavement, north of Minato Izakaya. A quiet bookshop with a window reading chair and a counter for recommendations."}),Kc=Object.freeze({journal:"frontrow",electronics:"form3d",stepwise:"form3d",career:"office"}),Jg=n=>Kc[n]||n,Oy=n=>n==="form3d",Po=Object.freeze([{id:"frontrow",title:"Front-Row Books & Press",jp:"Maegeru Shobo/Printing",sub:"BOOKS · EVENING PRESS",side:1,z:4,color:7559241,accent:"#8b3f36",line:"Aya’s books and Reiko’s evening paper, under one roof.",directions:"The bookshop and printing desk share the west block, facing Main Street."},{id:"form3d",title:"Kenji & Tetsuo Repairs",jp:"Three-dimensional/electrical workshop",sub:"PATTERNS · RADIOS · INSTRUMENTS",side:1,z:4,color:5663603,accent:"#385f6e",line:"Kenji’s pattern bench and Tetsuo’s radio and instrument repairs.",directions:"The repair workshop is in the east block, across Main Street from the bookshop."},{id:"office",title:"Johansson Harbour Office",jp:"Port Affairs and Technology Office",sub:"MARINE SERVICE · HARBOUR RECORDS",side:1,z:-42,color:6453102,accent:"#49675d",line:"Shipping records, tide tables and Johansson’s marine service files.",directions:"Follow the main street to the quay. The harbour office is on the right, opposite the warehouse."},{id:"market",title:"Sakura Shōten",jp:"Sakura Shop",sub:"DAILY GOODS",side:-1,z:-28,color:10321022,accent:"#a76680",line:"Thuan’s convenience store · tea, snacks and everyday things."}].map(Object.freeze)),Zg=()=>Po.map(n=>({...n})),By=()=>Zg().filter(n=>["market","frontrow","form3d","office"].includes(n.id)).map(n=>n.id==="frontrow"?{...n,...jc}:n.id==="form3d"?{...n,...Xc}:n);function zy(n){const e=new Set(Object.keys(Kc));for(let t=n.length-1;t>=0;t--)e.has(n[t].id)&&n.splice(t,1);for(const t of Po){const i=n.find(s=>s.id===t.id);i&&Object.assign(i,t)}if(Kg()){let t=n.find(s=>s.id==="form3d");t||(t={...Po.find(s=>s.id==="form3d")},n.push(t)),Object.assign(t,Xc);const i=n.find(s=>s.id==="frontrow");i&&Object.assign(i,jc)}return n}function $g(n=[]){return[...new Set(n.map(e=>qc(Jg(e))))]}const rr="johansson-town-1988-v5",Qg=["johansson-town-1988-v4","johansson-town-1988-v3"];function e_(n){const e=t=>typeof t=="string"?t.replace(/\b(?:Yuri|Yui)\b/g,"Thuan"):t;for(const t of["residentLocations","residentLife"]){const i=n[t];if(!(!i||typeof i!="object"||Array.isArray(i)))for(const s of["Yuri","Yui"])Object.hasOwn(i,s)&&(Object.hasOwn(i,"Thuan")||(i.Thuan=i[s]),delete i[s])}Array.isArray(n.notes)&&(n.notes=[...new Set(n.notes.map(e))]);for(const t of Object.values(n.residentLife||{}))Array.isArray(t?.activities)&&(t.activities=t.activities.map(e));if(Array.isArray(n.sakura?.journal))for(const t of n.sakura.journal)t&&typeof t=="object"&&(t.buyer=e(t.buyer));return n}const Jc="johansson-town-players",Ks=Object.freeze({id:"player-1",name:"Visitor"}),t_=n=>n===Ks.id?rr:rr+"@"+n,or=n=>String(n||"").replace(/[\u0000-\u001f<>]/g,"").trim().slice(0,24);function ki(n){let e=null;try{e=JSON.parse(n?.getItem?.(Jc))}catch{}const t=Array.isArray(e?.players)?e.players.filter(s=>s&&typeof s.id=="string"&&/^[\w-]{1,40}$/.test(s.id)).map(s=>({id:s.id,name:or(s.name)||"Visitor",created:Number(s.created)||0,lastPlayed:Number(s.lastPlayed)||0})):[];return t.some(s=>s.id===Ks.id)||t.unshift({...Ks,created:0,lastPlayed:0}),{active:t.some(s=>s.id===e?.active)?e.active:Ks.id,players:t}}function vr(n,e){try{return n.setItem(Jc,JSON.stringify(e)),!0}catch{return!1}}const Hy=n=>{const e=ki(n);return e.players.find(t=>t.id===e.active)};function Gy(n,e,t=Date.now()){const i=ki(n),s="player-"+t.toString(36)+Math.floor(Math.random()*1296).toString(36);return i.players.push({id:s,name:or(e)||"Visitor",created:t,lastPlayed:t}),i.active=s,vr(n,i),s}function Vy(n,e){const t=ki(n);return t.players.some(i=>i.id===e)?(t.active=e,vr(n,t)):!1}function Wy(n,e){const t=ki(n),i=t.players.find(s=>s.id===t.active);return!i||!or(e)?!1:(i.name=or(e),vr(n,t))}function Xy(n,e=Date.now()){const t=ki(n),i=t.players.find(s=>s.id===t.active);i&&(i.lastPlayed=e,vr(n,t))}function Yy(n){const e=t_(ki(n).active);for(const t of e===rr?[rr,...Qg]:[e])try{const i=JSON.parse(n.getItem(t));if(i&&typeof i=="object"&&!Array.isArray(i))return Array.isArray(i.visited)&&(i.visited=$g(i.visited.filter(s=>typeof s=="string"))),e_(i)}catch{}return null}function Js(n){return{scale:Math.max(.5,Math.min(.9,((n.thigh+n.shin)*.94+n.foot-n.seatDrop)/.56)),saddle:.74}}function qy(n,e,t,i,s){const r=Math.sin(t)*.54*i,o=Math.cos(t)*.54*i;return s(n,e,.28)||s(n-r,e-o,.23*i)||s(n+r,e+o,.23*i)}function Gl(n,e,t){const i=n.getWorldPosition(new L),s=e.getWorldPosition(new L).sub(i).normalize(),r=t.clone().sub(i).normalize(),o=new _t().setFromUnitVectors(s,r).multiply(n.getWorldQuaternion(new _t));n.quaternion.copy(n.parent.getWorldQuaternion(new _t).invert().multiply(o)),n.updateWorldMatrix(!1,!0)}function Vl(n,e,t,i,s){const r=n.getWorldPosition(new L),o=e.getWorldPosition(new L),a=t.getWorldPosition(new L),l=r.distanceTo(o),c=o.distanceTo(a),h=i.clone().sub(r),u=Fe.clamp(h.length(),Math.abs(l-c)+1e-4,l+c-1e-4);h.normalize();const p=s.clone().addScaledVector(h,-s.dot(h)).normalize(),f=(l*l-c*c+u*u)/(2*u),g=Math.sqrt(Math.max(0,l*l-f*f));Gl(n,e,r.clone().addScaledVector(h,f).addScaledVector(p,g)),Gl(e,t,r.clone().addScaledVector(h,u))}function n_(n,e=0,t=Js(n.measure)){const{bones:i,measure:s,root:r}=n,o=r.parent,a=t.scale;r.updateWorldMatrix(!0,!0);const l=o?o.getWorldQuaternion(new _t):new _t,c=(p,f,g)=>{const _=new L(p,f,g);return o?o.localToWorld(_):_},h=(p,f,g)=>new L(p,f,g).applyQuaternion(l),u=r.getWorldQuaternion(new _t);for(const[p,f,g]of[["L",-1,Math.PI],["R",1,0]]){const _=e*Math.PI*2+g;Vl(i["thigh"+p],i["knee"+p],i["foot"+p],c(f*.12*a,(.32+Math.sin(_)*.12)*a+s.foot,(.12+Math.cos(_)*.12)*a),h(0,0,-1));const m=i["foot"+p];m.quaternion.copy(m.parent.getWorldQuaternion(new _t).invert().multiply(u)),m.updateWorldMatrix(!1,!0),Vl(i["shoulder"+p],i["elbow"+p],i["hand"+p],c(f*.25*a,1.04*a+s.hand*.55,-.25*a),h(f,-.2,.1));const d=i["hand"+p];d.quaternion.copy(d.parent.getWorldQuaternion(new _t).invert().multiply(l)),d.updateWorldMatrix(!1,!0)}}function i_(n,e=2.4){const t=Fe.clamp(n/e,0,1);return{lift:Fe.smoothstep(t,0,.3)*(1-Fe.smoothstep(t,.7,1)),swallow:Fe.smoothstep(t,.4,.65),done:t>=1}}function Zc(n,e,t=!1){return t?0:-(.55+.2*(1-Fe.clamp(n?.userData?.portion??1,0,1)))*e}function s_(n,e,t=!1){return t?0:-.05*(1-Fe.clamp(n?.userData?.portion??1,0,1))*Fe.smoothstep(e,.5,1)}function Wl(n,e,t){const i=n.getWorldPosition(new L),s=e.getWorldPosition(new L).sub(i).normalize(),r=new _t().setFromUnitVectors(s,t.clone().sub(i).normalize()).multiply(n.getWorldQuaternion(new _t));n.quaternion.copy(n.parent.getWorldQuaternion(new _t).invert().multiply(r)),n.updateWorldMatrix(!1,!0)}function r_(n,e){const t=n.bones,i=t.shoulderR.getWorldPosition(new L),s=i.distanceTo(t.elbowR.getWorldPosition(new L)),r=t.elbowR.getWorldPosition(new L).distanceTo(t.handR.getWorldPosition(new L)),o=e.clone().sub(i),a=Fe.clamp(o.length(),Math.abs(s-r)+1e-4,s+r-1e-4);o.normalize();const l=new L(-1,-.25,0).transformDirection(n.root.matrixWorld);l.addScaledVector(o,-l.dot(o)).normalize();const c=(s*s-r*r+a*a)/(2*a),h=Math.sqrt(Math.max(0,s*s-c*c));Wl(t.shoulderR,t.elbowR,i.clone().addScaledVector(o,c).addScaledVector(l,h)),Wl(t.elbowR,t.handR,i.clone().addScaledVector(o,a))}function o_(n,e,t=!1,i=null){const{root:s,measure:r,bones:o}=n;s.updateWorldMatrix(!0,!0);const a=_r(n.recipe),l=o.head,c=Math.PI*.28+a.mouthY/256*Math.PI*.58,h=Math.PI/2-.95+a.mouthX/256*1.9,u=cs(new L(-Math.cos(h)*Math.sin(c),Math.cos(c),Math.sin(h)*Math.sin(c)),r.profile),p=new L(u.x*r.Rh*r.headSX,r.headCentre-r.headY+u.y*r.Rh*r.headSY,u.z*r.Rh*.98+.025*r.k),f=s.localToWorld(new L(-r.shoulderX,r.shoulderY-r.upper*.75,r.depth*.75+r.fore*.45)),g=s.getWorldQuaternion(new _t).multiply(new _t().setFromAxisAngle(new L(1,0,0),Zc(i,e,t))),_=new L(t?0:-.1*r.k,t?.04:(i?.userData.rimHeight??.15)-.08*r.k,t?.115:.015*r.k).applyQuaternion(g),m=o.shoulderR.getWorldPosition(new L),d=(r.upper+r.fore)*.985;let v=null;for(let b=0;b<12;b++){l.updateWorldMatrix(!0,!1),v=f.clone().lerp(l.localToWorld(p.clone()).sub(_),e);const y=v.distanceTo(m)-d;if(y<=5e-4||e<.01)break;l.rotation.x+=Math.min(.12,y/(r.Rh*1.1))}r_(n,v),o.handR.quaternion.copy(o.handR.parent.getWorldQuaternion(new _t).invert().multiply(g)),o.handR.updateWorldMatrix(!1,!0)}function ar(n,e,t=0,i="R"){const s=!!e.userData.food,r=n.measure,o=n.bones["hand"+i];n.root.updateWorldMatrix(!0,!0);const a=n.root.getWorldQuaternion(new _t).multiply(new _t().setFromAxisAngle(new L(1,0,0),Zc(e,t,s))),l=new L(s?0:(i==="R"?-.1:.1)*r.k,s?0:-.08*r.k,.015*r.k).applyQuaternion(a),c=o.getWorldPosition(new L).add(l),h=new Ge().compose(c,a,new L(1,1,1));e.matrixAutoUpdate=!1,e.matrix.copy(o.matrixWorld).invert().multiply(h),e.matrixWorldNeedsUpdate=!0}const $c=Object.freeze({"Lighthouse keeper":{feel:{happy:"Nod",laugh:"Nod",shy:"Bow"},idle:["LookAround","LookAround","Think"],talk:["Nod","Think"]},"Porch sitter":{feel:{happy:"Nod",laugh:"Laugh",shy:"Fidget"},idle:["Stretch","LookAround"],talk:["Nod","Talk"]},"Old storyteller":{feel:{happy:"Clap",laugh:"Laugh",shy:"Fidget"},idle:["Think","LookAround"],talk:["Talk","Talk","Point","Clap"]},"Cloud watcher":{feel:{happy:"Heart",laugh:"Laugh",shy:"Coy"},idle:["Stretch","LookAround","Coy"],talk:["Coy","Heart","Talk"]},"Quiet craftsman":{feel:{happy:"Nod",laugh:"Nod",shy:"Shrug"},idle:["HandsOnHips","Think"],talk:["Nod","Shrug"]},"Easy neighbour":{feel:{happy:"Laugh",laugh:"Laugh",shy:"Shrug"},idle:["Stretch","HandsOnHips"],talk:["Shrug","Talk","Laugh"]},"Big heart":{feel:{happy:"Heart",laugh:"Laugh",shy:"Fidget",sad:"Slump"},idle:["Heart","Clap","HandsOnHips"],talk:["Heart","Talk","Laugh"]},Wanderer:{feel:{happy:"Tada",laugh:"Laugh",shy:"Shrug"},idle:["Stretch","Kachashi","LookAround"],talk:["Shrug","Laugh","Peace"]},Timekeeper:{feel:{happy:"Bow",laugh:"Nod",shy:"Bow"},idle:["HandsOnHips","LookAround"],talk:["Bow","Nod","Point"]},"Helping hand":{feel:{happy:"Clap",laugh:"Laugh",shy:"Fidget"},idle:["Wave","HandsOnHips"],talk:["Nod","Clap","Point"]},"Rising star":{feel:{happy:"Peace",laugh:"Laugh",shy:"Coy"},idle:["Peace","Coy","HeelKick"],talk:["Peace","Coy","Heart"]},"Festival friend":{feel:{happy:"HeelKick",laugh:"Laugh",shy:"Coy"},idle:["Heart","HeelKick","Kachashi"],talk:["Heart","Peace","Clap"]},"Straight shooter":{feel:{happy:"Nod",laugh:"Laugh",shy:"HandsOnHips"},idle:["HandsOnHips","HandsOnHips","LookAround"],talk:["Point","HandsOnHips","Nod"]},Joker:{feel:{happy:"Peace",laugh:"Laugh",shy:"Shrug"},idle:["Peace","Shrug","Coy"],talk:["Peace","Laugh","Shrug"]},Firecracker:{feel:{happy:"Tada",laugh:"Laugh",shy:"HandsOnHips",angry:"Stomp"},idle:["HandsOnHips","Fist","Tada"],talk:["Point","Fist","HandsOnHips"]},Typhoon:{feel:{happy:"Tada",laugh:"Laugh",shy:"Coy"},idle:["Tada","Kachashi","HeelKick","Cheer"],talk:["Tada","Peace","Laugh"]}}),a_=n=>(Ri(n.show)-1)/(In-1),l_=n=>(Ri(n.pace)-1)/(In-1),c_=n=>(Ri(n.talk)-1)/(In-1);function h_(n={}){const e=Gc(n),t=$c[e.name],i=a_(n),s=l_(n),r=34-i*20-s*6;return{type:e.name,feel:t.feel,idle:t.idle,talk:t.talk,idleEvery:[r*.6,r*1.4],talkChance:Math.min(.85,.3+i*.4+c_(n)*.15)}}Object.freeze([...new Set(Object.values($c).flatMap(n=>[...Object.values(n.feel),...n.idle,...n.talk]))]);function jy(n=""){const e=String(n).toLowerCase();return/\b(ha){2,}|\bhehe|\bahaha|\blol\b|funny|joke|laugh/.test(e)?"laugh":/\bsorry\b|\bsad\b|\bmiss (him|her|them|it)|lonely|\balas\b|passed away|can't sleep|worried/.test(e)?"sad":/\?!|!\?|\breally\?|\bno way\b|\bwhat\?|goodness|\bwow\b/.test(e)?"surprised":/\b(love|wonderful|lovely|great|welcome|thank(s| you)|congratulations|happy|delicious|perfect|yay)\b|!/.test(e)?"happy":/\bhmm+\b|\bwell\.\.\.|let me think|i wonder/.test(e)?"thinking":null}const Xs=["hips","spine","chest","neck","head","shoulderL","elbowL","handL","shoulderR","elbowR","handR","thighL","kneeL","footL","thighR","kneeR","footR"],u_=(n,e)=>n<0||n>e?0:Math.sin(Math.PI*Math.min(1,n/e)),d_=(n,e,t=.25)=>Math.min(1,n/t,(e-n)/t),Si=Object.freeze({Wave:1.6,Bow:1.5,Nod:1.1,HeadShake:1.2,Point:1.6,Shrug:1.3,Clap:1.8,Laugh:2,Think:2.4,LookAround:2.6,Stretch:2.2,PickUp:1.6,Fist:1.4,Jab:.42,JabL:.42,Swipe:.7,Hurt:.5,Jump:.9,Cheer:1.6,Hop:1.2,Gasp:1.6,Stomp:1.4,Slump:2.2,Fidget:2.4,SitEnjoyFood:3.8,SitPresentFood:4.2,SitToast:2.4,SitDrink:2.4,SitEat:2.4,Drink:2.4,Eat:2.4,Heart:2.8,Peace:2.8,Coy:3,Tada:2.4,HandsOnHips:2.6,HeelKick:2.6,Talk:1/0,Kachashi:1/0,Crouch:1/0,Phone:1/0,FishIdle:1/0,Reel:1/0}),f_=Object.freeze({happy:"Hop",laugh:"Laugh",sad:"Slump",angry:"Stomp",shy:"Fidget",surprised:"Gasp",worried:"Think"});function Lo(n,{lively:e=!1,random:t=Math.random}={}){const{bones:i,measure:s}=n,r=h_(n.recipe?.profile||{}),o=le=>le[Math.floor(t()*le.length)],a=()=>r.idleEvery[0]+t()*(r.idleEvery[1]-r.idleEvery[0]);let l=4+a()*.6,c=!1,h=10;const u=Jo(n.recipe.name||JSON.stringify(n.recipe)),p=.92+u()*.16,f=.8+u()*.25,g=(u()-.5)*.055,_=.85+u()*.3,m=Object.fromEntries(Xs.map(le=>[le,new L])),d=Object.fromEntries(Xs.map(le=>[le,new L])),v=new L;let b=0,y=Math.random()*10,N=0,A=0,w=null,T=1+Math.random()*3,x=-1,M=0,C=0,F=[0,0],D=2,U="neutral",V=null,H=0,ee=null,K=0;const R=(le,W=0,ie=0,Le=0)=>d[le].set(W,ie,Le),X=(le,W=0,ie=0,Le=0)=>d[le].add(new L(W,ie,Le));function xe(le,W){return le in Si?(w={name:le,t:0,d:Si[le]===1/0&&W?W:Si[le]},!0):!1}const Oe=le=>xe(le,2.6+t()*1.4),Qe=()=>{w=null};function ne(le,W={}){y+=le;const ie=w?.name||W.pose||W.seat;n.setOpenHands?.(["SitEnjoyFood","SitPresentFood"].includes(ie));const Le=["Eat","EatStanding","SitEat"].includes(ie),te=["Drink","DrinkStanding","SitDrink","SitToast"].includes(ie);if(Le||te){ie!==ee&&(H=0),H+=le;const k=Number.isFinite(W.consumeElapsed)?W.consumeElapsed:w?w.t+le:H%5;V={...i_(k),food:Le,elapsed:H,cycle:Math.floor(H/5)}}else V=null,H=0;ee=ie;for(const k of Xs)d[k].set(0,0,0);let O=0,j=0;const se=W.speed||0,I=se>.08&&!W.seated&&!W.riding;if(R("shoulderL",0,0,.13),R("shoulderR",0,0,-.13),R("elbowL",-.12),R("elbowR",-.12),W.riding){const k=W.ridePhase||0,J=W.bicycleFit||Js(s);O=J.saddle*J.scale-s.hipY+s.seatDrop,R("thighL",-1.05+Math.sin(k*Math.PI*2)*.38),R("kneeL",1.05+Math.cos(k*Math.PI*2)*.4),R("thighR",-1.05-Math.sin(k*Math.PI*2)*.38),R("kneeR",1.05-Math.cos(k*Math.PI*2)*.4),R("chest",.28),R("head",-.18),R("shoulderL",-1.15,0,.18),R("shoulderR",-1.15,0,-.18),R("elbowL",-.35),R("elbowR",-.35)}else if(W.seated){const k=W.seat==="Soak"||W.pose==="Soak";O=(Number.isFinite(W.seatHeight)?W.seatHeight:.45)-s.hipY+s.seatDrop,R("thighL",-1.52,0,.06),R("thighR",-1.52,0,-.06),R("kneeL",1.45),R("kneeR",1.45),R("shoulderL",-.45,0,.15),R("shoulderR",-.45,0,-.15),R("elbowL",-.55),R("elbowR",-.55),X("chest",Math.sin(y*1.5)*.02);const J=W.pose;if(J==="Type")R("shoulderL",-.9,0,.1),R("shoulderR",-.9,0,-.1),R("elbowL",-.7+Math.sin(y*14)*.08),R("elbowR",-.7+Math.sin(y*13+1)*.08),R("head",.15);else if(J==="Eat"||J==="Drink"||W.seat==="SitEat"){const Q=Math.max(0,Math.sin(y*1.4))**4;R("shoulderR",-.6-Q*.9,0,-.25),R("elbowR",-.8-Q*1.3),R("head",.08-Q*.1)}else if(J==="Sleep"||W.sleeping)R("head",.45,0,.15),R("chest",.15);else if(k)R("thighL",-1.3,0,.25),R("thighR",-1.3,0,-.25),R("kneeL",.9),R("kneeR",.9),R("shoulderL",0,0,.9),R("shoulderR",0,0,-.9),R("head",-.1);else if(J==="Wake"){const Q=Math.max(0,Math.sin(y*.8));R("shoulderL",0,0,.4+Q*2.2),R("shoulderR",0,0,-.4-Q*2.2)}}else if(I){const k=W.running||se>2.6,J=s.leg*(k?2.6:1.7)*p;b+=se/J*Math.PI*2*le*.5;const Q=k?.95:Math.min(.62,.25+se*.3),Z=Math.sin(b),Ee=Math.cos(b);R("thighL",-Z*Q),R("thighR",Z*Q),R("kneeL",Math.max(0,Math.sin(b-.9))*Q*1.5+.05),R("kneeR",Math.max(0,Math.sin(b+Math.PI-.9))*Q*1.5+.05),R("footL",Z*Q*.3),R("footR",-Z*Q*.3),R("shoulderL",Z*Q*f,0,.12),R("shoulderR",-Z*Q*f,0,-.12),R("elbowL",k?-1.35:-.25-Math.max(0,-Z)*.3),R("elbowR",k?-1.35:-.25-Math.max(0,Z)*.3),R("hips",0,Z*.14,0),R("chest",k?.22:.05,-Z*.18,0),R("head",k?-.12:-.02,Z*.08,0),j=Math.abs(Ee)*(k?.055:.025)*s.k-(k?.02:0),W.carrying&&(R("shoulderL",-1.15,0,.3),R("shoulderR",-1.15,0,-.3),R("elbowL",-.5),R("elbowR",-.5))}else{X("chest",Math.sin(y*1.6)*.025),R("hips",0,0,Math.sin(y*.45)*.035),X("head",Math.sin(y*.7)*.03,Math.sin(y*.31)*.12,Math.sin(y*.5)*.04),X("thighL",0,0,-Math.sin(y*.45)*.03),X("thighR",0,0,-Math.sin(y*.45)*.03),X("chest",g),X("head",0,Math.sin(y*.31*_)*.035,0),j=Math.sin(y*1.6*_)*.004;const k=W.pose;if(k==="CounterIdle")R("shoulderL",-.5,0,.2),R("shoulderR",-.5,0,-.2),R("elbowL",-.95),R("elbowR",-.95);else if(k==="Interact")R("shoulderL",-.75+Math.sin(y*4.5)*.18,0,.15),R("shoulderR",-.75+Math.sin(y*4.5+1.7)*.18,0,-.15),R("elbowL",-.8),R("elbowR",-.8),X("chest",.12),X("head",.2);else if(k==="DrinkStanding"||k==="Drink"){const J=Math.max(0,Math.sin(y*1.2))**4;R("shoulderR",-.5-J*1.1,0,-.2),R("elbowR",-.9-J*1.2)}else(k==="Sit"||k==="Sleep")&&R("head",.2);W.carrying&&(R("shoulderL",-1.15,0,.3),R("shoulderR",-1.15,0,-.3),R("elbowL",-.5),R("elbowR",-.5))}const ce=Fe.clamp((W.tipsy||0)/2.5,0,1);let oe=0;if(ce>0&&!W.riding&&!W.airborne){const k=Math.sin(y*1.7),J=Math.max(0,Math.sin(y*.43+Math.sin(y*.19)*2))**8;if(W.seated)X("head",.22*ce+Math.sin(y*.6)*.06*ce,Math.sin(y*.37)*.1*ce,Math.sin(y*.5)*.12*ce),X("chest",.08*ce,0,Math.sin(y*.5)*.05*ce);else if(I){const Q=1+Math.sin(b*.5)*.35*ce;d.thighL.x*=Q,d.thighR.x*=2-Q,X("hips",0,0,k*.12*ce),X("chest",.06*ce+J*.25*ce,0,-k*.14*ce),X("head",.1*ce,Math.sin(y*.8)*.15*ce,k*.18*ce),X("shoulderL",0,0,.35*ce),X("shoulderR",0,0,-.35*ce),oe=k*.07*ce+J*Math.sign(Math.sin(y*.21))*.06*ce}else X("hips",0,0,Math.sin(y*.9)*.06*ce),X("chest",.04*ce,0,-Math.sin(y*.9)*.08*ce),X("head",.12*ce,Math.sin(y*.4)*.12*ce,Math.sin(y*.9+.6)*.12*ce),X("thighL",0,0,.05*ce),X("thighR",0,0,-.05*ce),oe=Math.sin(y*.9)*.04*ce}K+=(oe-K)*(1-Math.exp(-le*6)),W.airborne&&!W.seated&&(R("thighL",-.6),R("thighR",-.2),R("kneeL",1),R("kneeR",.6),R("shoulderL",-.3,0,1.6),R("shoulderR",-.3,0,-1.6));const _e=W.expression||"neutral";if(_e!==U){U=_e;const k=r.feel[_e]||f_[_e];k&&!W.seated&&!I&&!w&&Oe(k)}const fe=!!W.talking;if(e){const k=!I&&!W.seated&&!W.riding&&!W.airborne&&!W.sleeping&&!W.carrying&&!V&&(!W.pose||W.pose==="Idle")&&!W.heldProp;fe&&!c&&h>.8&&k&&!w&&t()<r.talkChance&&Oe(o(r.talk)),k&&!fe&&!w?(l-=le,l<=0&&(Oe(o(r.idle)),l=a())):l=Math.max(l,2)}if(h=fe?0:h+le,c=fe,W.waving&&!w&&xe("Wave"),w)if(w.t+=le,w.t>=w.d)w=null;else{const k=ue(w);k?.root!==void 0&&(O+=k.root)}let Ue=null;if(W.gaze&&!W.sleeping){v.set(...W.gaze.isVector3?W.gaze.toArray():W.gaze),n.root.worldToLocal(v);const k=Math.atan2(v.x,v.z),J=-Math.atan2(v.y-s.headCentre,Math.hypot(v.x,v.z));if(Math.abs(k)<2.4){const Q=Fe.clamp(k,-1.35,1.35),Z=Fe.clamp(J,-.45,.4);X("head",Z*.8,Q*.62,0),X("chest",Z*.15,Q*.3,0),Ue=[Fe.clamp((k-Q*.62)*1.6,-1,1),Fe.clamp(Z*.5,-.6,.6)]}}const ye=1-Math.exp(-le*14);for(const k of Xs)m[k].lerp(d[k],ye),i[k].rotation.set(m[k].x,m[k].y,m[k].z);N+=(O-N)*(W.seated||W.riding?1-Math.exp(-le*9):ye),A+=(j-A)*ye,W.riding&&(N=O),n.root.position.x=W.riding?0:K,n.root.position.z=W.riding?.21*(W.bicycleFit||Js(s)).scale:0,n.root.position.y=N+(W.seated||W.riding?0:W.floorHeight||0),i.hips.position.y=s.hipY+(W.riding?0:A),W.riding?n_(n,W.ridePhase||0,W.bicycleFit||Js(s)):V&&(i.head.rotation.x+=s_(W.heldProp,V.lift,V.food),o_(n,V.lift,V.food,W.heldProp)),T-=le,T<=0&&x<0&&(x=0,T=1.8+Math.random()*3.8);let P=0;x>=0&&(x+=le,P=x<.13?1:0,x>=.13&&(x=-1)),W.talking?(M-=le,M<=0&&(M=.09+Math.random()*.12,C=C?0:Math.random()<.8?1:0)):C=0,D-=le,D<=0&&(D=1.2+Math.random()*3,F=Math.random()<.45?[0,0]:[(Math.random()-.5)*1.6,(Math.random()-.5)*.8]);const S=W.sleeping?"sleep":_e;n.paintFace({expression:S,blink:P,talk:C,look:W.look||Ue||(S==="thinking"?[1,-1]:F)})}function ue(le,W){const ie=le.t,Le=le.d,te=Le===1/0?1:u_(ie,Le),O=Le===1/0?Math.min(1,ie/.3):d_(ie,Le);switch(le.name){case"Wave":R("shoulderR",-.2,0,-2.55*O),R("elbowR",0,0,-.45+Math.sin(ie*10)*.45*O),X("head",0,0,.08*O);break;case"Bow":X("chest",.95*te),X("spine",.25*te),X("head",.2*te),R("shoulderL",.1,0,.05),R("shoulderR",.1,0,-.05);break;case"Nod":X("head",Math.sin(ie*9)*.28*te);break;case"HeadShake":X("head",0,Math.sin(ie*11)*.45*te);break;case"Point":R("shoulderR",-1.5*O,.2,-.1),R("elbowR",-.05),X("head",0,-.15*O);break;case"Shrug":R("shoulderL",-.3*te,0,.55*te+.13),R("shoulderR",-.3*te,0,-.55*te-.13),R("elbowL",-1.3*te),R("elbowR",-1.3*te),X("head",0,0,.2*te);break;case"Clap":{const j=Math.abs(Math.sin(ie*9));R("shoulderL",-1.2*O,0,.1+j*.35),R("shoulderR",-1.2*O,0,-.1-j*.35),R("elbowL",-.9*O),R("elbowR",-.9*O);break}case"Laugh":X("chest",-.24*te+Math.sin(ie*16)*.07*te),X("head",-.32*te),R("shoulderL",-.85*te,0,.4),R("shoulderR",-.85*te,0,-.4),R("elbowL",-1.65*te),R("elbowR",-1.65*te);break;case"Gasp":return X("chest",-.18*te),X("head",-.12*te),R("shoulderL",-.7*te,0,.28),R("shoulderR",-.7*te,0,-.28),R("elbowL",-1.9*te),R("elbowR",-1.9*te),{root:Math.sin(Math.PI*ie/Le)*.045};case"Think":R("shoulderR",-1.25*O,0,-.35),R("elbowR",-1.95*O),R("shoulderL",-.4*O,0,.3),R("elbowL",-1.4*O),X("head",.12*O,0,.18*O);break;case"LookAround":X("head",0,Math.sin(ie*2.4)*.75*te),X("chest",0,Math.sin(ie*2.4)*.2*te);break;case"Stretch":R("shoulderL",-.2,0,2.8*te),R("shoulderR",-.2,0,-2.8*te),X("chest",-.25*te),X("head",-.3*te);break;case"PickUp":return X("chest",1.1*te),X("spine",.3*te),R("shoulderR",-1.3*te),R("thighL",-.5*te),R("thighR",-.5*te),R("kneeL",.9*te),R("kneeR",.9*te),{root:-.08*te};case"Fist":R("shoulderR",-2.4*O+Math.sin(ie*8)*.2*O,0,-.1),R("elbowR",-.5*O),X("chest",-.1*O);break;case"Jab":case"JabL":{const j=le.name==="Jab",se=j?"R":"L",I=j?"L":"R",ce=j?1:-1,oe=ie<.1?-(ie/.1)*.3:ie<.2?(ie-.1)/.1:Math.max(0,1-(ie-.2)/.22);return R("shoulder"+se,-.9-.75*oe,0,-ce*.05),R("elbow"+se,-1.9+1.85*oe),R("shoulder"+I,-1.05,0,ce*.18),R("elbow"+I,-2.1),X("chest",.06*oe,-ce*.4*oe),X("head",0,ce*.12*oe),{root:-.02*O}}case"Swipe":{const j=ie<.32?ie/.32:Math.max(0,1-(ie-.32)/.14),se=ie<.32?0:Math.min(1,(ie-.32)/.14)*Math.max(0,1-(ie-.5)/.2);return R("shoulderL",-2.7*j-1.2*se,0,.25),R("shoulderR",-2.7*j-1.2*se,0,-.25),R("elbowL",-.4*j),R("elbowR",-.4*j),X("chest",-.2*j+.45*se),X("head",-.15*j+.2*se),{root:.04*j}}case"Hurt":return R("shoulderL",-.5*te,0,.9*te+.13),R("shoulderR",-.5*te,0,-.9*te-.13),R("elbowL",-.5*te),R("elbowR",-.5*te),X("chest",-.4*te),X("head",-.35*te,Math.sin(ie*20)*.1*te),{root:-.03*te};case"Jump":{const j=ie<.2?-.08:Math.sin(Math.PI*Math.min(1,(ie-.2)/.6))*.25;return R("shoulderL",-.3,0,1.4*O),R("shoulderR",-.3,0,-1.4*O),R("kneeL",ie<.2?.8:.3),R("kneeR",ie<.2?.8:.3),R("thighL",ie<.2?-.5:-.2),R("thighR",ie<.2?-.5:-.2),{root:j}}case"Cheer":return R("shoulderL",-.2,0,2.6*O),R("shoulderR",-.2,0,-2.6*O),R("elbowL",-.3),R("elbowR",-.3),{root:Math.abs(Math.sin(ie*7))*.1*te};case"Hop":return R("shoulderL",-.2,0,.9*te),R("shoulderR",-.2,0,-.9*te),X("head",-.15*te),{root:Math.abs(Math.sin(ie*8))*.12*te};case"Stomp":R("shoulderL",-.2,0,.35),R("shoulderR",-.2,0,-.35),R("elbowL",-1.6*O),R("elbowR",-1.6*O),R("thighL",-.5*Math.max(0,Math.sin(ie*9))*te),R("kneeL",.6*Math.max(0,Math.sin(ie*9))*te),X("head",.18*te,Math.sin(ie*14)*.1*te),X("chest",.12*te);break;case"Slump":return X("chest",.3*te),X("head",.4*te),R("shoulderL",.05,0,.03),R("shoulderR",.05,0,-.03),{root:-.03*te};case"Fidget":R("shoulderL",-.55*O,0,-.2*O),R("shoulderR",-.55*O,0,.2*O),R("elbowL",-.6*O),R("elbowR",-.6*O),X("head",.18*te,0,.25*te),X("hips",0,Math.sin(ie*3)*.12*te);break;case"SitEnjoyFood":{R("shoulderL",-.7*O,.18*O,.62*O),R("shoulderR",-.7*O,-.18*O,-.62*O),R("elbowL",-1.35*O),R("elbowR",-1.35*O),R("handL",-1.25*O,.55*O,.25*O),R("handR",-1.25*O,-.55*O,-.25*O),X("chest",.05*te),X("head",-.06*te,0,.16*te);break}case"SitPresentFood":{R("shoulderL",-1.1*O,0,.22*O),R("shoulderR",-1.1*O,0,-.22*O),R("elbowL",-1.18*O),R("elbowR",-1.18*O),R("handL",-1.45*O,0,.18*O),R("handR",-1.45*O,0,-.18*O),X("head",-.08*te,0,-.1*te);break}case"SitToast":R("shoulderR",-1.9*O,0,-.2),R("elbowR",-.6*O),X("head",-.15*O);break;case"SitDrink":{const j=Math.max(0,Math.sin(ie*2.6))**2;R("shoulderR",-.6-j*1,0,-.25),R("elbowR",-.9-j*1.2);break}case"Heart":return R("shoulderL",-.8*O,0,.5*O),R("elbowL",-.45*O,0,-1.7*O),R("shoulderR",-.8*O,0,-.5*O),R("elbowR",-.45*O,0,1.7*O),X("head",.06*O,0,.22*O+Math.sin(ie*3.2)*.04*O),R("hips",0,0,-.05*O),R("thighR",-.12*O),R("kneeR",.3*O),{root:Math.abs(Math.sin(ie*3.2))*.012*O};case"Peace":{R("shoulderR",-.55*O,0,-1.25*O),R("elbowR",-1.9*O,0,-.2*O),R("shoulderL",.15*O,0,.75*O),R("elbowL",-.3*O,0,-1.5*O),X("head",.06*O,-.1*O,-.24*O),R("hips",0,.15*O,-.07*O),R("thighL",-.15*O),R("kneeL",.4*O);break}case"Coy":{R("shoulderR",-1.15*O,0,-.12*O),R("elbowR",-2.1*O),R("shoulderL",.15*O,0,.75*O),R("elbowL",-.3*O,0,-1.5*O),X("head",.12*O,.2*O,.2*O),X("chest",0,.12*O,-.05*O),R("hips",0,-.2*O,.08*O),R("thighR",-.1*O,0,-.06*O),R("kneeR",.3*O);break}case"Tada":{const j=Math.min(1,ie/.3);return R("shoulderL",-.15*O,0,1.9*O),R("shoulderR",-.15*O,0,-1.9*O),R("elbowL",0,0,.2*O),R("elbowR",0,0,-.2*O),R("thighL",.35*O*j),R("kneeL",1.3*O*j),X("chest",-.12*O),X("head",-.15*O,0,.12*O),{root:.03*O*j}}case"HandsOnHips":R("shoulderL",.15*O,0,.75*O),R("elbowL",-.3*O,0,-1.5*O),R("shoulderR",.15*O,0,-.75*O),R("elbowR",-.3*O,0,1.5*O),X("chest",-.12*O),X("head",-.12*O,0,Math.sin(ie*2.2)*.08*O),R("thighL",0,0,.12*O),R("thighR",0,0,-.12*O);break;case"HeelKick":R("thighR",.45*O),R("kneeR",1.7*O+Math.sin(ie*3)*.08*O),R("shoulderL",-1.2*O,0,-.2*O),R("shoulderR",-1.2*O,0,.2*O),R("elbowL",-1.6*O),R("elbowR",-1.6*O),X("head",.08*O,0,-.25*O),X("chest",.1*O,0,-.06*O);break;case"Talk":R("shoulderR",-.55+Math.sin(ie*3.1)*.25,0,-.2),R("elbowR",-1.1+Math.sin(ie*4.3)*.3),R("shoulderL",-.35+Math.sin(ie*2.3+1)*.2,0,.2),R("elbowL",-1+Math.sin(ie*3.7)*.3),X("head",Math.sin(ie*2.6)*.06);break;case"Kachashi":{const j=Math.sin(ie*5.5),se=Math.sin(ie*2.75);return R("shoulderL",-.4,0,1.9+j*.25),R("shoulderR",-.4,0,-1.9+j*.25),R("elbowL",0,0,1.1+j*.5),R("elbowR",0,0,-1.1+j*.5),R("hips",0,se*.2,se*.08),X("chest",0,-se*.2),X("head",0,se*.15,-se*.1),R("thighL",-Math.max(0,se)*.5),R("kneeL",Math.max(0,se)*.8),R("thighR",-Math.max(0,-se)*.5),R("kneeR",Math.max(0,-se)*.8),{root:Math.abs(se)*.03}}case"Crouch":return R("thighL",-1.7,0,.25),R("thighR",-1.7,0,-.25),R("kneeL",2.3),R("kneeR",2.3),R("footL",-.6),R("footR",-.6),X("chest",.5),R("shoulderL",-.9,0,.1),R("shoulderR",-.9,0,-.1),R("elbowL",-.4),R("elbowR",-.4),{root:-(s.thigh+s.shin)*.72};case"Phone":R("shoulderR",-.4,0,-.5),R("elbowR",-2.2),X("head",0,0,-.15);break;case"FishIdle":R("shoulderL",-1,0,.1),R("shoulderR",-1,0,-.1),R("elbowL",-.6),R("elbowR",-.6);break;case"Reel":R("shoulderL",-1,0,.1),R("elbowL",-.6),R("shoulderR",-1+Math.sin(ie*9)*.25,0,-.2),R("elbowR",-.8+Math.cos(ie*9)*.3);break}return null}return{update:ne,play:xe,stop:Qe,style:r,get gesture(){return w?.name||null},get consumption(){return V}}}const Yn=Object.freeze(Object.fromEntries(["icecream","ramen","onigiri","curry","gyoza"].map(n=>[n,`./assets/food/island-${n}.png`])));function Ky(n){const e=String(n).toLowerCase();return/ice cream/.test(e)?Yn.icecream:/rice ball|onigiri/.test(e)?Yn.onigiri:/ramen/.test(e)?Yn.ramen:/gyoza|dumpling/.test(e)?Yn.gyoza:/curry/.test(e)&&!/pack|box|pouch/.test(e)?Yn.curry:null}const Xl=new Map;function p_(n,e){if(!Yn[e]||typeof Image>"u")return;const t=new Wt;t.name="Food geometry fallback";for(const c of[...n.children])t.add(c);n.add(t);const i=new hc({transparent:!0,alphaTest:.02,depthWrite:!1}),s=new Bm(i);s.name="Original "+e+" food cutout",s.scale.set(.25,.25,1),s.position.y=.105,s.visible=!1,n.add(s);const r=n.userData;r.foodCutout={sprite:s,fallback:t,ready:!1};const o=c=>{s.parent&&(i.map=c,i.needsUpdate=!0,r.foodCutout.ready=!0,t.visible=!1,s.visible=!0)},a=Xl.get(e);if(a){a.then(o);return}const l=new Promise(c=>new O0().load(Yn[e],h=>{h.colorSpace=Ot,c(h)},void 0,()=>{}));Xl.set(e,l),l.then(o)}function m_(n){const e=n.userData,t=e.foodCutout;if(!t?.ready)return;const i=e.portion??1;t.sprite.visible=i>0,t.sprite.material.opacity=Math.min(1,i*1.8);const s=.25*(.65+.35*i);t.sprite.scale.set(s,s,1),t.fallback.visible=i===0}const qn=Object.freeze({draft:Object.freeze({id:"draft",jp:"Orion draught, medium mug",en:"Orion draught, a frosted mug",price:450,sips:6,alcohol:1,pour:4.2,line:"One Orion draught! Cold from the tap."}),bottle:Object.freeze({id:"bottle",jp:"Orion Large bottle",en:"Orion large bottle and a small glass",price:600,sips:8,alcohol:1.4,pour:2,line:"It's a big bottle. Pour for yourself -- or I pour the first one."}),can:Object.freeze({id:"can",jp:"Orion Can",en:"Orion can, 350 ml",price:300,sips:4,alcohol:.8,pour:1.2,line:"Still in the can? Straight from the can, then."}),awamori:Object.freeze({id:"awamori",jp:"Awamori on the rocks",en:"awamori on the rocks",price:250,sips:5,alcohol:1.6,pour:1.8,line:"Awamori. Slowly -- it is older than you think."}),sake:Object.freeze({id:"sake",jp:"Warm sake, one flask",en:"a flask of warm sake",price:220,sips:5,alcohol:1.3,pour:2.4,line:"Hot sake. Careful, the tokkuri is hot."}),oolong:Object.freeze({id:"oolong",jp:"Oolong tea",en:"Oolong tea over ice",price:150,sips:4,alcohol:0,pour:1.6,line:"Oolong tea. Plenty of ice."})}),yi=Object.freeze({yakitori:Object.freeze({id:"yakitori",jp:"Assorted Yakitori",en:"a plate of yakitori",price:180,bites:4,station:"grill",cook:6,line:"Yakitori. Two tare, two salt."}),edamame:Object.freeze({id:"edamame",jp:"Edamame",en:"a bowl of edamame",price:120,bites:3,station:"prep",cook:2,line:"Edamame. Salted while they were hot."}),oden:Object.freeze({id:"oden",jp:"Oden",en:"a bowl of oden",price:260,bites:4,station:"oden",cook:3,line:"Oden. The daikon has been in since four."}),hiyayakko:Object.freeze({id:"hiyayakko",jp:"Cold tofu",en:"cold tofu with ginger",price:150,bites:3,station:"prep",cook:2,line:"It's cold tofu. Ginger and a little soy."}),dashimaki:Object.freeze({id:"dashimaki",jp:"Dashi-rolled egg",en:"a rolled dashi omelette",price:200,bites:3,station:"range",cook:5,line:"Dashi roll. Still warm in the middle."}),hokke:Object.freeze({id:"hokke",jp:"Grilled Atka mackerel",en:"grilled hokke",price:280,bites:4,station:"grill",cook:7,line:"It's Hokke. Lemon on the side."}),sashimi:Object.freeze({id:"sashimi",jp:"Assorted sashimi",en:"the sashimi plate",price:320,bites:4,station:"prep",cook:4,line:"Sashimi. Masaru brought the tuna this morning."}),agedashi:Object.freeze({id:"agedashi",jp:"Fried tofu",en:"agedashi tofu",price:180,bites:3,station:"fryer",cook:5,line:"It's fried. Mind the broth, it is hot."}),karaage:Object.freeze({id:"karaage",jp:"Fried chicken",en:"chicken karaage",price:220,bites:4,station:"fryer",cook:6,line:"It's fried chicken. Straight out of the oil."}),ochazuke:Object.freeze({id:"ochazuke",jp:"Ochazuke",en:"ochazuke to finish",price:180,bites:3,station:"range",cook:4,line:"Ochazuke. The way to end an evening."})});Object.freeze([...Object.values(yi),...Object.values(qn)]);const ho=n=>qn[n]||yi[n]||null,Yl=Object.freeze({grill:[1.7,0,-3.6],oden:[-4.2,0,-3.6],range:[1.4,0,-5.15],fryer:[2.75,0,-5.15],prep:[5.4,0,-5.15]}),uo=Object.freeze([3.5,0,-3.8]),Jy=Object.freeze({table:Object.freeze({id:"table",label:"Sit at the table",position:[3.3,0,.9],stand:[3.3,0,.25],eyeY:1.14,yaw:Math.PI,table:[3.3,.945,1.52],dish:[3.02,.945,1.5],serve:[3.95,0,.3],route:[[3.95,-3.55],[3.95,.3]]}),window:Object.freeze({id:"window",label:"Sit and enjoy the evening",position:[4,0,2.7],stand:[2.95,0,2.7],eyeY:1.2,yaw:Math.PI/2,table:[3.62,.945,2.55],dish:[3.62,.945,2.3],serve:[4,0,1.6],route:[[3.95,-3.55],[3.95,.3],[4,1.6]]}),...Object.fromEntries([-3.8,-2.3,-.8,.7,2.2].map((n,e)=>["counter"+e,Object.freeze({id:"counter"+e,label:"Sit at the counter",counter:!0,position:[n,0,-1.42],stand:[n,0,-.72],eyeY:1.32,yaw:0,table:[n+.15,1.11,-2.2],dish:[n-.12,1.11,-2.24],serve:[n,0,-3.75],route:[[n,-3.75]]})]))});function ql(n,e,t,i,s){const r=e.position.y-i/2,o=10,a=new Float32Array(o*3),l=[];for(let u=0;u<o;u++){const p=u*2.4,f=s*(.25+.7*(u*37%10)/10);a[u*3]=e.position.x+Math.cos(p)*f,a[u*3+1]=r+u*.31%1*i,a[u*3+2]=Math.sin(p)*f,l.push(.012+u*13%7*.004)}const c=new yt;c.setAttribute("position",new Nt(a,3));const h=new Wm(c,new pc({color:16773828,size:.0035,transparent:!0,opacity:.8,depthWrite:!1}));h.name="Beer bubbles",n.add(h),n.userData.pour={liquid:e,head:t,bottom:r,height:i,headHeight:t.geometry.parameters.height,bubbles:h,rise:l}}function g_(n,e){const t=n.pour,i=n.portion,s=t.bottom+t.height*i;t.liquid.scale.y=Math.max(.001,i),t.liquid.position.y=t.bottom+t.height*i/2,t.head.visible=i>.03,t.head.scale.y=.55+.45*i,t.head.position.y=s+t.headHeight*t.head.scale.y/2;const r=t.bubbles.geometry.attributes.position;t.bubbles.visible=i>.05;for(let o=0;o<r.count;o++){let a=r.getY(o)+t.rise[o]*e*(i>.1?1:.3);a>s&&(a=t.bottom+(a-s)%Math.max(.005,s-t.bottom)),r.setY(o,a)}r.needsUpdate=!0}function Qc(n,{held:e=!1}={}){const t=new Wt;t.name="Minato drink · "+n;const i=new wt({color:14674148,roughness:.08,metalness:0,transparent:!0,opacity:.42,depthWrite:!1}),s=new wt({color:14259230,roughness:.3,emissive:4860418,emissiveIntensity:.25}),r=new wt({color:16512486,roughness:.9}),o=(l,c,h=0,u=0,p=0)=>{const f=new ut(l,c);return f.position.set(u,h,p),t.add(f),f},a=new Wt;if(t.add(a),t.userData.level=a,n==="draft"){o(new Ke(.045,.042,.15,20),i,.075);const l=new ut(new Ke(.041,.039,.12,20),s);l.position.y=.063,a.add(l);const c=new ut(new Ke(.043,.041,.025,20),r);c.position.y=.135,a.add(c),ql(t,l,c,.12,.036);const h=o(new tn(.03,.007,8,16,Math.PI),i,.08,.05);h.rotation.z=-Math.PI/2}else if(n==="bottle"){const l=new wt({color:5910032,roughness:.25,transparent:!0,opacity:.48,depthWrite:!1});if(!e){o(new Ke(.038,.038,.2,18),l,.1,-.06),o(new Ke(.013,.036,.08,14),l,.24,-.06),o(new Ke(.034,.034,.05,18),new wt({color:15921384,roughness:.6}),.1,-.06);const p=new ut(new Ke(.034,.034,.185,18),s);p.position.set(-.06,.095,0),a.add(p)}const c=e?0:.05;o(new Ke(.03,.027,.09,16),i,.045,c);const h=new ut(new Ke(.027,.025,.07,16),s);h.position.set(c,.037,0),a.add(h);const u=new ut(new Ke(.028,.027,.012,16),r);u.position.set(c,.078,0),a.add(u),ql(t,h,u,.07,.022)}else if(n==="can")o(new Ke(.033,.033,.122,20),new wt({color:15921902,roughness:.35,metalness:.55}),.061),o(new Ke(.0335,.0335,.045,20),new wt({color:1986460,roughness:.4,metalness:.4}),.07),o(new Ke(.0336,.0336,.008,20),new wt({color:13120042,roughness:.4}),.095);else if(n==="coffee"){const l=new wt({color:16052714,roughness:.35});o(new Ke(.036,.028,.07,20,1,!0),new wt({color:16052714,roughness:.35,side:2}),.035),o(new Ke(.028,.028,.004,20),l,.002);const c=o(new tn(.017,.005,8,14,Math.PI),l,.04,.038);c.rotation.z=-Math.PI/2,e||o(new Ke(.062,.055,.008,24),l,-.004);const h=new ut(new Ke(.033,.028,.055,20),new wt({color:2823690,roughness:.15}));h.position.y=.03,a.add(h)}else{o(new Ke(.036,.032,.11,18),i,.055);const l=new ut(new Ke(.033,.03,.085,18),new wt({color:n==="mugicha"?11036714:8011544,roughness:.25,transparent:!0,opacity:n==="mugicha"?.78:.85}));l.position.y=.045,a.add(l);for(let c=0;c<3;c++){const h=new ut(new ht(.022,.022,.022),i);h.position.set((c-1)*.012,.08,c%2*.01),h.rotation.set(c,c*.7,0),a.add(h)}}return t.userData.portion=1,t.userData.targetPortion=1,t.userData.consumable="drink",t.userData.rimHeight=n==="draft"?.15:n==="bottle"?.09:n==="can"?.122:n==="coffee"?.07:.11,t.traverse(l=>{l.isMesh&&(l.castShadow=!1,l.receiveShadow=!0)}),t}function eh(n){const e=new Wt;e.name="Minato dish · "+n;const t=a=>new wt({color:a,roughness:.6}),i=(a,l,c=0,h=0,u=0,p=e)=>{const f=new ut(a,l);return f.position.set(c,h,u),p.add(f),f},s=new Wt;e.add(s),e.userData.level=s;const r=(a,l,c=3102834)=>i(new ht(a,.014,l),t(c),0,.007),o=(a,l,c=15854816)=>i(new Ke(a,a*.7,l,16,1,!0),new wt({color:c,roughness:.35,side:2}),0,l/2);if(n==="yakitori"||n==="hokke")if(r(.26,.12,15854816),n==="yakitori")for(let a=0;a<4;a++){i(new ht(.22,.006,.006),t(10513474),0,.02,-.04+a*.027,s);for(let l=0;l<4;l++)i(new ht(.03,.024,.024),t(a%2?8142619:14267002),-.07+l*.045,.028,-.04+a*.027,s)}else{const a=i(new ht(.2,.025,.08),t(11565637),0,.027,0,s);a.rotation.y=.1,i(new xt(.018,8,6),t(15917914),.09,.03,.04,s)}else if(n==="sashimi"){r(.24,.16,15854816);for(let a=0;a<6;a++)i(new ht(.04,.018,.1),t([15370844,10366005,15721426][a%3]),-.08+a*.032,.024,0,s).rotation.y=.25;i(new xt(.015,8,6),t(8231749),.1,.025,.05,s)}else if(n==="edamame"||n==="karaage"){o(.07,.045,3102834);for(let a=0;a<(n==="edamame"?9:6);a++){const l=a*2.3,c=.035*(a%3/2+.3);i(n==="edamame"?new ht(.045,.014,.018):new xt(.022,8,6),t(n==="edamame"?8231749:12088366),Math.cos(l)*c,.045,Math.sin(l)*c,s).rotation.y=l}}else if(n==="oden"||n==="agedashi"||n==="ochazuke"||n==="ramen"||n==="rice")if(o(.075,.06,n==="ochazuke"?3102834:9067066),i(new Ke(.068,.068,.004,16),t(n==="ochazuke"?12034908:11039535),0,.045,0,s),n==="oden")i(new Ke(.025,.025,.03,12),t(14930854),-.025,.05,0,s),i(new xt(.02,8,6),t(12159562),.025,.052,.01,s);else if(n==="agedashi")for(let a=0;a<2;a++)i(new ht(.04,.03,.04),t(14132570),-.02+a*.04,.05,0,s);else if(n==="ramen"||n==="rice")for(let a=0;a<6;a++)i(new xt(.016,8,6),t(15257466),(a%3-1)*.025,.052,Math.floor(a/3)*.025-.012,s);else i(new ht(.05,.004,.05),t(2042402),0,.05,0,s);else if(n==="hiyayakko")r(.12,.12,3102834),i(new ht(.07,.04,.07),t(15854816),0,.035,0,s),i(new ht(.02,.01,.02),t(14267226),0,.06,0,s);else if(n==="gyoza"){r(.22,.12,15854816);for(let a=0;a<6;a++)i(new xt(.024,8,6),t(14267002),-.08+a*.032,.022,0,s).scale.set(.8,.6,1.4)}else{r(.2,.1,15854816);for(let a=0;a<4;a++)i(new ht(.035,.035,.06),t(15780170),-.06+a*.04,.03,0,s)}return p_(e,n),e.userData.portion=1,e.userData.targetPortion=1,e.userData.consumable="food",e.traverse(a=>{a.isMesh&&(a.castShadow=!1,a.receiveShadow=!0)}),e}function rn(n,e,{immediate:t=!1}={}){const i=Fe.clamp(Number(e)||0,0,1);n.userData.targetPortion=i,t&&(n.userData.portion=i,Ci(n,0))}function Ci(n,e){const t=n.userData,i=t.level;if(!i)return;const s=t.targetPortion??1,r=t.portion??1;if(t.portion=Math.abs(r-s)<.001?s:Fe.damp(r,s,7,Math.max(0,e)),i.visible=t.portion>0,m_(n),t.consumable==="food"){const o=i.children.length*t.portion;i.children.forEach((a,l)=>{a.visible=l<Math.ceil(o),a.scale.setScalar(Math.min(1,Math.max(0,o-l)))})}else if(t.pour){i.scale.y=1,g_(t,e);for(const o of i.children)o!==t.pour.liquid&&o!==t.pour.head&&(o.userData.baseY??=o.position.y,o.scale.y=Math.max(.001,t.portion),o.position.y=o.userData.baseY*t.portion)}else i.scale.y=Math.max(.001,t.portion)}function __(n){const e=new Wt;e.userData.food=!0,e.userData.consumable="food",e.userData.portion=1,e.userData.targetPortion=1;const t=new wt({color:13214315,roughness:.6});for(const r of[-.008,.008]){const o=new ut(new ht(.005,.005,.16),t);o.position.set(r,.02,.04),e.add(o)}const i=new Wt;e.add(i),e.userData.level=i;const s=new ut(new xt(.018,8,6),new wt({color:n==="edamame"?8231749:n==="sashimi"?15370844:14267002,roughness:.6}));return s.position.set(0,.04,.1),i.add(s),e}function Io(n){if(!n)return;n.removeFromParent();const e=new Set;n.traverse(t=>{if(t.isMesh||t.isSprite){t.isMesh&&t.geometry.dispose();for(const i of Array.isArray(t.material)?t.material:[t.material])e.add(i)}}),e.forEach(t=>t.dispose())}function Zy({room:n,getNao:e,blocked:t,say:i=()=>{}}){let s=null,r=null,o=null,a=0;function l(d){if(d)for(const v of["playerService","heldItem","socialPose","carrying"])delete d.userData[v]}function c(d,v,b){for(;v.length;){const[y,N]=v[0],A=y-d.position.x,w=N-d.position.z,T=Math.hypot(A,w);if(T<.03){v.shift();continue}const x=Math.atan2(-A,-w),M=Math.atan2(Math.sin(x-d.rotation.y),Math.cos(x-d.rotation.y));if(d.rotation.y+=Math.max(-b*5,Math.min(b*5,M)),Math.abs(M)<.9){const C=Math.min(T,b*1.15*(1-Math.abs(M)/1.2));d.position.x+=A/T*C,d.position.z+=w/T*C}return!1}return!0}const h=d=>{d&&(d.prop.removeFromParent(),d.prop.traverse(v=>{v.isMesh&&(v.geometry.dispose(),v.material.dispose?.())}))};function u(){h(r),r=null}function p(){h(o),o=null}const f=(d,v,b)=>{d.rotation.y=Math.atan2(-(v-d.position.x),-(b-d.position.z))},g=()=>[uo[0],uo[2]];function _(d,v){if(qn[d]){u();const b=Qc(d);b.position.set(...v.table),n.add(b),r={kind:d,left:qn[d].sips,prop:b}}else{p();const b=eh(d);b.position.set(...v.dish||v.table),n.add(b),o={kind:d,left:yi[d].bites,prop:b}}a++}function m(d,v){d.left=Math.max(0,d.left-1),rn(d.prop,d.left/v)}return{get pending(){return s?{kind:s.kind,phase:s.phase}:null},get drink(){return r?{kind:r.kind,left:r.left,sips:qn[r.kind].sips}:null},get dish(){return o?{kind:o.kind,left:o.left,bites:yi[o.kind].bites}:null},get served(){return a},order(d,v){const b=ho(d),y=e();if(!b||!v||s||!y)return!1;const N=!!yi[d];return s={kind:d,seat:v,phase:N?"cooking":"pouring",timer:N?b.cook:b.pour,path:N?[[Yl[b.station][0],Yl[b.station][2]]]:null},y.userData.playerService=!0,y.userData.socialPose="Use",y.userData.activity=N?"cooking "+b.en+" for you":"pouring "+b.en.toLowerCase()+" for you",!0},sip(){if(!r||r.left<=0)return null;r.left=Math.max(0,r.left-1);const d=qn[r.kind];r.prop.userData.level,rn(r.prop,r.left/d.sips);const v={kind:r.kind,left:r.left,alcohol:d.alcohol/d.sips};if(r.left===0){const b=r;setTimeout(()=>{r===b&&u()},1500)}return v},bite(){if(!o||o.left<=0)return null;m(o,yi[o.kind].bites);const d={kind:o.kind,left:o.left};if(o.left===0){const v=o;setTimeout(()=>{o===v&&p()},2500)}return d},serveNow(d,v){return!ho(d)||!v?.table?!1:(_(d,v),!0)},update(d){if(r&&Ci(r.prop,d),o&&Ci(o.prop,d),!s)return;const v=e();if(!v){s=null;return}const b=ho(s.kind),{seat:y}=s;if(s.phase==="cooking"){if(s.path.length){delete v.userData.socialPose,c(v,s.path,d);return}v.userData.socialPose="Use",(s.timer-=d)<=0&&(s.path=[...y.counter?[]:[g()],...y.route].map(N=>[...N]),s.phase="carrying",v.userData.heldItem="tray",delete v.userData.socialPose,v.userData.carrying=!0,v.userData.activity="bringing your "+b.en.replace(/^(a|an|the) /,""))}else if(s.phase==="pouring")v.userData.socialPose="Use",(s.timer-=d)<=0&&(s.path=y.route.map(N=>[...N]),s.phase="carrying",v.userData.heldItem=s.kind==="oolong"?"tea":"beer",delete v.userData.socialPose,v.userData.carrying=!0,v.userData.activity="bringing your drink");else if(s.phase==="carrying"){delete v.userData.socialPose;const N=qn[s.kind]?y.table:y.dish||y.table;c(v,s.path,d)&&(f(v,N[0],N[2]),s.phase="placing",s.timer=1.1,v.userData.socialPose="CarryIdle")}else s.phase==="placing"?(s.timer-=d)<=0&&(_(s.kind,y),delete v.userData.heldItem,delete v.userData.carrying,v.userData.socialPose="Greet",i("Nao: "+b.line,4),s.phase="bowing",s.timer=.9):s.phase==="bowing"?(s.timer-=d)<=0&&(delete v.userData.socialPose,s.path=[...y.route.slice(0,-1).reverse(),g()].map(N=>[...N]),s.phase="returning",v.userData.activity="back to the counter"):s.phase==="returning"&&(delete v.userData.socialPose,c(v,s.path,d)&&(v.rotation.set(0,Math.PI,0),l(v),s=null))},clear(){const d=e();s&&d&&(d.position.set(...uo),d.rotation.set(0,Math.PI,0),l(d)),s=null,u(),p()},place(d,v){_(d,v)}}}const th="johansson-town-avatar";function y_(n=globalThis.localStorage){try{const e=n?.getItem(th);if(e){const t=Ko(e);if(t)return t}}catch{}return Ro.Johansson}function v_(n,e=globalThis.localStorage){const t=Cc(n);try{e?.setItem(th,t)}catch{}return t}const b_=.2,M_=["Wake","Sit","Type","Eat","Drink","Sleep","Soak"];function $y(){try{const n=new URL(location.href),e=n.searchParams.get("avatar");if(!e)return null;const t=Ko(e);return n.searchParams.delete("avatar"),history.replaceState(history.state,"",n.href),t&&v_(t),t}catch{return null}}function Qy(n,e,{shadows:t=!1}={}){const i=Xg(e),s=To(i,{shadows:t,faceSize:e==="Thuan"?512:256});for(const r of n.children)r.visible=!1;return n.add(s.root),n.userData.visualReady=!0,n.userData.visualSource="Shimanchu · "+(i.name||e),{isAvatar:!0,avatar:s,animator:Lo(s,{lively:!0}),entity:n,model:s.root,mixer:null,actions:new Map,current:null,last:n.position.clone(),gestureTime:0,speed:0,moving:!1,wasVisible:!0,height:s.height,isThuan:e==="Thuan",outfit:"clothes"}}function ev(n,e,t=performance.now()){const{entity:i,avatar:s}=n,r=i.userData;let o=!0;for(let y=i;y;y=y.parent)if(!y.visible){o=!1;break}if(!o){n.last.copy(i.position),n.speed=0,n.moving=!1,n.wasVisible=!1;return}const a=Math.hypot(i.position.x-n.last.x,i.position.z-n.last.z);n.last.copy(i.position);const l=!n.wasVisible||a>1;n.wasVisible=!0;const c=l||Number.isFinite(r.chairBlend)?0:a/Math.max(e,.001);n.speed=Fe.damp(n.speed,c,20,e),n.moving=n.speed>(n.moving?.03:.07),n.gestureTime=Math.max(0,n.gestureTime-e);const h=r.outfit==="swim"?"swim":n.isThuan?r.alternativeOutfit||"clothes":r.outfit||"clothes";n.outfit!==h&&(s.wear(h),n.outfit=h);const u=!r.hatOff;n.hatOn!==u&&(s.setHat?.(u),n.hatOn=u);const p=!!(r.playerControlled&&n.isThuan),f=!p&&(Number.isFinite(r.seatHeight)&&M_.includes(r.socialPose)||Number.isFinite(r.chairBlend)&&r.chairBlend>.5),g=r.thuanMood,_=r.lineFeeling,m=g&&g.until>t?g.expression:_&&_.until>t?_.expression:null,d=!!(r.playerConversation||r.chat||n.gestureTime),v=Number(r.sleepBlend)>.28||r.sleeping&&!r.roomTransition;n.animator.update(e,{speed:n.moving?n.speed:0,running:n.speed>3.2,seated:f,seatHeight:r.seatHeight,floorHeight:(Number(r.floorHeight)||0)+(r.socialPose==="CounterIdle"?b_:0),pose:r.socialPose,seat:r.socialPose,riding:p,ridePhase:r.bicyclePhase||0,bicycleFit:r.bicycleFit,carrying:!!r.carrying,heldProp:n.heldProp,waving:!!(r.chat?.greeting||n.gestureTime>0&&!n.waved),talking:!!(r.chat?.speaking||r.speakingUntil>t),expression:r.thuanExpression||m||(d?"smile":"neutral"),sleeping:v,gaze:Array.isArray(r.lookTarget)?r.lookTarget:null,consumeElapsed:r.consumeElapsed,tipsy:r.tipsy||0});const b=r.heldItem||(["Drink","DrinkStanding"].includes(r.socialPose)?"beer":r.socialPose==="Eat"?"rice":null);if(n.heldKind!==b){Io(n.heldProp),Io(n.dishProp),n.heldProp=null,n.dishProp=null,n.heldKind=b,n.portion=1,n.consumedCycle=-1;const y={beer:"draft",tea:"oolong",cup:"oolong",coffee:"coffee",mugicha:"mugicha",can:"can",bottle:"bottle",draft:"draft",oolong:"oolong",awamori:"awamori",sake:"sake"},N=["rice","bun","ramen","fish","yakitori","gyoza","edamame","sashimi","oden","hiyayakko","dashimaki","agedashi","karaage","ochazuke","chopsticks"];y[b]?n.heldProp=Qc(y[b],{held:!0}):N.includes(b)&&(n.heldProp=__(b),b!=="bun"&&b!=="chopsticks"&&(n.dishProp=eh(b==="fish"?"hokke":b),n.dishProp.userData.food=!0,s.bones.handL.add(n.dishProp))),n.heldProp&&s.bones.handR.add(n.heldProp),n.heldProp&&Number.isFinite(r.heldPortion)&&rn(n.heldProp,r.heldPortion,{immediate:!0}),n.dishProp&&Number.isFinite(r.foodPortion)&&rn(n.dishProp,r.foodPortion,{immediate:!0})}if(n.heldProp){const y=n.animator.consumption;y&&!Number.isFinite(r.heldPortion)&&y.swallow>.5&&n.consumedCycle!==y.cycle&&(n.consumedCycle=y.cycle,n.portion=Math.max(0,n.portion-(y.food?.25:1/6)),rn(n.heldProp,y.food?0:n.portion),n.dishProp&&rn(n.dishProp,n.portion)),Number.isFinite(r.heldPortion)?rn(n.heldProp,r.heldPortion):y?.food&&y.swallow===0&&n.portion>0&&rn(n.heldProp,1),Ci(n.heldProp,e),ar(s,n.heldProp,y?.lift||0),n.dishProp&&(Number.isFinite(r.foodPortion)&&rn(n.dishProp,r.foodPortion),Ci(n.dishProp,e),ar(s,n.dishProp,0,"L"))}n.gestureTime>0?n.waved=!0:n.waved=!1}function tv(n,e=new L){const t=n.avatar.bones.head,i=n.avatar.measure;return t.getWorldPosition(e),e.y+=(i.headCentre-i.headY)*.95,e}function nv({scene:n,recipe:e=y_()}={}){const t=new Wt;t.name="Johansson (third person)",t.visible=!1,n.add(t);let i=To(e,{shadows:!0,faceSize:512}),s=Lo(i);t.add(i.root);let r="neutral",o=0,a=0,l=0,c="Sit",h="clothes",u=null,p=null,f=null;const g=()=>i.bones.handR,_={root:t,loading:Promise.resolve(!0),get ready(){return!0},get move(){return f},get expression(){return r},get weights(){return{}},get actions(){return[...Object.keys(Si),"Idle","Walk","Run","Sit","SitEat","Soak","Fall"]},get avatar(){return i},play(m,{face:d}={}){f=m,d&&_.express(d,3);const v={Bow:"Bow",Wave:"Wave"};s.play(v[m]||m)||s.play("Nod");const b={Wave:"happy",Clap:"happy",Kachashi:"laugh",Laugh:"laugh",Think:"thinking",Shrug:"worried",HeadShake:"grumpy",Bow:"content",Nod:"content",Stretch:"content",LookAround:"surprised",SitToast:"happy",Heart:"happy",Peace:"laugh",Coy:"smile",Tada:"laugh",HandsOnHips:"content",HeelKick:"happy"};b[m]&&_.express(b[m],(Si[m]===1/0?4:Si[m]||2)+.6)},express(m,d=3){r=m,o=d>0?l+d:0},speak(m=2){a=Math.max(a,l+m)},lookAt(m){p=m?m.clone?.()||m:null},seat(m="Sit"){c=m},wear(m){h=m==="swim"?"swim":"clothes",i.wear(h)},get outfit(){return h},get lens(){const m=i.measure;return{eye:m.H+.14,side:m.Rh*m.headSX+.26,head:m.headCentre}},get sitHip(){const m=i.measure;return m.hipY+.09-m.seatDrop},hold(m){u&&(u.userData.consumable?Io(u):u.removeFromParent()),u=m||null,u&&(u.position.set(0,-i.measure.hand*.4,i.measure.hand*.6),g().add(u),u.userData.consumable&&ar(i,u))},jump(){s.play("Jump")},stop(){s.stop(),f=null},setRecipe(m){const d=Bt(m);i.root.removeFromParent(),i.dispose(),i=To(d,{shadows:!0,faceSize:512}),s=Lo(i),t.add(i.root),i.wear(h),u&&g().add(u)},update(m,d={}){if(l+=m,t.visible=!!d.visible,o&&l>o&&(r="neutral",o=0),s.gesture||(f=null),s.update(m,{speed:d.speed||0,running:!!d.running,seated:!!d.seated,seatHeight:d.seated?i.measure.hipY-i.measure.seatDrop:void 0,seat:c,airborne:!!d.airborne,talking:l<a,expression:r,gaze:p,heldProp:u,tipsy:d.tipsy||0}),d.seated&&(i.root.position.y=0),u?.userData.consumable){const v=s.consumption;v&&u.userData.finishPortion!==void 0&&rn(u,Fe.lerp(u.userData.startPortion,u.userData.finishPortion,v.swallow)),Ci(u,m),ar(i,u,v?.lift||0)}}};return _}export{Yc as $,Wo as A,Dn as B,Ne as C,dy as D,nn as E,qe as F,Wt as G,cy as H,wc as I,ny as J,Ln as K,F_ as L,Uo as M,S_ as N,ic as O,Ei as P,_t as Q,L_ as R,ty as S,Tc as T,tt as U,L as V,ey as W,ae as X,I_ as Y,xt as Z,Kg as _,Ot as a,Y_ as a$,qg as a0,tn as a1,tr as a2,dr as a3,E_ as a4,Wm as a5,vy as a6,Uy as a7,O0 as a8,Z_ as a9,N_ as aA,Ui as aB,fy as aC,k0 as aD,oy as aE,Pi as aF,hy as aG,cl as aH,py as aI,Om as aJ,k_ as aK,O_ as aL,U_ as aM,D_ as aN,pc as aO,bn as aP,Vm as aQ,ct as aR,qs as aS,by as aT,iy as aU,fc as aV,sy as aW,Vt as aX,Bo as aY,ay as aZ,dc as a_,ag as aa,Jg as ab,ky as ac,Hl as ad,zy as ae,$o as af,Lo as ag,Si as ah,Ro as ai,gy as aj,vm as ak,J_ as al,Bt as am,ur as an,uy as ao,mo as ap,hc as aq,Bm as ar,F0 as as,Ai as at,Io as au,rn as av,Qc as aw,eh as ax,Ci as ay,Ct as az,To as b,Hy as b$,q_ as b0,Zs as b1,ir as b2,nr as b3,mr as b4,$e as b5,pr as b6,vn as b7,j_ as b8,K_ as b9,pt as bA,Q0 as bB,jn as bC,My as bD,Cc as bE,Ko as bF,Ly as bG,Py as bH,kg as bI,Ry as bJ,In as bK,Og as bL,Ri as bM,xy as bN,Cy as bO,Yn as bP,Sy as bQ,Ny as bR,Oy as bS,Ey as bT,t_ as bU,ki as bV,Xy as bW,Wy as bX,Vy as bY,Gy as bZ,Ky as b_,Ng as ba,Fy as bb,Iy as bc,Dy as bd,$_ as be,wy as bf,ry as bg,Fo as bh,yi as bi,qn as bj,Jy as bk,Ay as bl,i_ as bm,Gn as bn,Ug as bo,Gc as bp,jy as bq,Hc as br,w_ as bs,ly as bt,V_ as bu,G_ as bv,Q_ as bw,P_ as bx,Zc as by,eg as bz,Yy as c,ho as c0,R_ as c1,tv as c2,ev as c3,Qy as c4,w0 as c5,Ve as c6,z_ as c7,sc as c8,X_ as c9,H_ as ca,ec as cb,A_ as cc,x_ as cd,By as ce,$y as cf,cc as cg,my as ch,C_ as ci,Js as cj,nv as ck,Zy as cl,qy as cm,__ as cn,Ty as co,v_ as cp,yy as d,_y as e,Nt as f,Ge as g,wt as h,ut as i,ht as j,Vo as k,Sc as l,js as m,yt as n,Ke as o,y_ as p,Xm as q,Xg as r,T_ as s,qm as t,bi as u,bt as v,hr as w,W_ as x,B_ as y,Fe as z};
