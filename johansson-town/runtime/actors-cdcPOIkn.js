/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Jg=1;const Zg=0,$g=1,Qg=2;const e_=2;const t_=0;const n_=6;const ea="attached",jc="detached";const i_=303;const r_=1e3,s_=1001,o_=1002,a_=1003,l_=1004,c_=1005,h_=1006,u_=1007,d_=1008,f_=1009;const p_=1014,m_=1015,g_=1016;const __=1023;const y_=1026;const v_=2300,b_=2301;const M_=1,x_=2;const S_=3201;const w_="",Gt="srgb",xi="srgb-linear",ns="linear",at="srgb";const T_=35048,ta="300 es";class Si{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const i=this._listeners;return i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const r=this._listeners[e];if(r!==void 0){const s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const i=this._listeners[e.type];if(i!==void 0){e.target=this;const r=i.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,e);e.target=null}}}const Lt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let na=1234567;const Yi=Math.PI/180,yi=180/Math.PI;function jt(){const n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Lt[n&255]+Lt[n>>8&255]+Lt[n>>16&255]+Lt[n>>24&255]+"-"+Lt[e&255]+Lt[e>>8&255]+"-"+Lt[e>>16&15|64]+Lt[e>>24&255]+"-"+Lt[t&63|128]+Lt[t>>8&255]+"-"+Lt[t>>16&255]+Lt[t>>24&255]+Lt[i&255]+Lt[i>>8&255]+Lt[i>>16&255]+Lt[i>>24&255]).toLowerCase()}function wt(n,e,t){return Math.max(e,Math.min(t,n))}function wo(n,e){return(n%e+e)%e}function Kc(n,e,t,i,r){return i+(n-e)*(r-i)/(t-e)}function Jc(n,e,t){return n!==e?(t-n)/(e-n):0}function qi(n,e,t){return(1-t)*n+t*e}function Zc(n,e,t,i){return qi(n,e,1-Math.exp(-t*i))}function $c(n,e=1){return e-Math.abs(wo(n,e*2)-e)}function Qc(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*(3-2*n))}function eh(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*n*(n*(n*6-15)+10))}function th(n,e){return n+Math.floor(Math.random()*(e-n+1))}function nh(n,e){return n+Math.random()*(e-n)}function ih(n){return n*(.5-Math.random())}function rh(n){n!==void 0&&(na=n);let e=na+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function sh(n){return n*Yi}function oh(n){return n*yi}function ah(n){return(n&n-1)===0&&n!==0}function lh(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function ch(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function hh(n,e,t,i,r){const s=Math.cos,o=Math.sin,a=s(t/2),l=o(t/2),c=s((e+i)/2),h=o((e+i)/2),u=s((e-i)/2),p=o((e-i)/2),f=s((i-e)/2),g=o((i-e)/2);switch(r){case"XYX":n.set(a*h,l*u,l*p,a*c);break;case"YZY":n.set(l*p,a*h,l*u,a*c);break;case"ZXZ":n.set(l*u,l*p,a*h,a*c);break;case"XZX":n.set(a*h,l*g,l*f,a*c);break;case"YXY":n.set(l*f,a*h,l*g,a*c);break;case"ZYZ":n.set(l*g,l*f,a*h,a*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+r)}}function en(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function ot(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}const Ue={DEG2RAD:Yi,RAD2DEG:yi,generateUUID:jt,clamp:wt,euclideanModulo:wo,mapLinear:Kc,inverseLerp:Jc,lerp:qi,damp:Zc,pingpong:$c,smoothstep:Qc,smootherstep:eh,randInt:th,randFloat:nh,randFloatSpread:ih,seededRandom:rh,degToRad:sh,radToDeg:oh,isPowerOfTwo:ah,ceilPowerOfTwo:lh,floorPowerOfTwo:ch,setQuaternionFromProperEuler:hh,normalize:ot,denormalize:en};class ie{constructor(e=0,t=0){ie.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6],this.y=r[1]*t+r[4]*i+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(wt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),r=Math.sin(t),s=this.x-e.x,o=this.y-e.y;return this.x=s*i-o*r+e.x,this.y=s*r+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class He{constructor(e,t,i,r,s,o,a,l,c){He.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,o,a,l,c)}set(e,t,i,r,s,o,a,l,c){const h=this.elements;return h[0]=e,h[1]=r,h[2]=a,h[3]=t,h[4]=s,h[5]=l,h[6]=i,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,r=t.elements,s=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],h=i[4],u=i[7],p=i[2],f=i[5],g=i[8],_=r[0],m=r[3],d=r[6],y=r[1],b=r[4],M=r[7],D=r[2],R=r[5],A=r[8];return s[0]=o*_+a*y+l*D,s[3]=o*m+a*b+l*R,s[6]=o*d+a*M+l*A,s[1]=c*_+h*y+u*D,s[4]=c*m+h*b+u*R,s[7]=c*d+h*M+u*A,s[2]=p*_+f*y+g*D,s[5]=p*m+f*b+g*R,s[8]=p*d+f*M+g*A,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8];return t*o*h-t*a*c-i*s*h+i*a*l+r*s*c-r*o*l}invert(){const e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=h*o-a*c,p=a*l-h*s,f=c*s-o*l,g=t*u+i*p+r*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/g;return e[0]=u*_,e[1]=(r*c-h*i)*_,e[2]=(a*i-r*o)*_,e[3]=p*_,e[4]=(h*t-r*l)*_,e[5]=(r*s-a*t)*_,e[6]=f*_,e[7]=(i*l-c*t)*_,e[8]=(o*t-i*s)*_,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,r,s,o,a){const l=Math.cos(s),c=Math.sin(s);return this.set(i*l,i*c,-i*(l*o+c*a)+o+e,-r*c,r*l,-r*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(ps.makeScale(e,t)),this}rotate(e){return this.premultiply(ps.makeRotation(-e)),this}translate(e,t){return this.premultiply(ps.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let r=0;r<9;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const ps=new He;function Gl(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function Zi(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function uh(){const n=Zi("canvas");return n.style.display="block",n}const ia={};function Wi(n){n in ia||(ia[n]=!0,console.warn(n))}function dh(n,e,t){return new Promise(function(i,r){function s(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:r();break;case n.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:i()}}setTimeout(s,t)})}function fh(n){const e=n.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function ph(n){const e=n.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const Qe={enabled:!0,workingColorSpace:xi,spaces:{},convert:function(n,e,t){return this.enabled===!1||e===t||!e||!t||(this.spaces[e].transfer===at&&(n.r=_n(n.r),n.g=_n(n.g),n.b=_n(n.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(n.applyMatrix3(this.spaces[e].toXYZ),n.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===at&&(n.r=mi(n.r),n.g=mi(n.g),n.b=mi(n.b))),n},fromWorkingColorSpace:function(n,e){return this.convert(n,this.workingColorSpace,e)},toWorkingColorSpace:function(n,e){return this.convert(n,e,this.workingColorSpace)},getPrimaries:function(n){return this.spaces[n].primaries},getTransfer:function(n){return n===""?ns:this.spaces[n].transfer},getLuminanceCoefficients:function(n,e=this.workingColorSpace){return n.fromArray(this.spaces[e].luminanceCoefficients)},define:function(n){Object.assign(this.spaces,n)},_getMatrix:function(n,e,t){return n.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(n){return this.spaces[n].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(n=this.workingColorSpace){return this.spaces[n].workingColorSpaceConfig.unpackColorSpace}};function _n(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function mi(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}const ra=[.64,.33,.3,.6,.15,.06],sa=[.2126,.7152,.0722],oa=[.3127,.329],aa=new He().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),la=new He().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);Qe.define({[xi]:{primaries:ra,whitePoint:oa,transfer:ns,toXYZ:aa,fromXYZ:la,luminanceCoefficients:sa,workingColorSpaceConfig:{unpackColorSpace:Gt},outputColorSpaceConfig:{drawingBufferColorSpace:Gt}},[Gt]:{primaries:ra,whitePoint:oa,transfer:at,toXYZ:aa,fromXYZ:la,luminanceCoefficients:sa,outputColorSpaceConfig:{drawingBufferColorSpace:Gt}}});let qn;class mh{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{qn===void 0&&(qn=Zi("canvas")),qn.width=e.width,qn.height=e.height;const i=qn.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),t=qn}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Zi("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const r=i.getImageData(0,0,e.width,e.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=_n(s[o]/255)*255;return i.putImageData(r,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(_n(t[i]/255)*255):t[i]=_n(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let gh=0;class Vl{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:gh++}),this.uuid=jt(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push(ms(r[o].image)):s.push(ms(r[o]))}else s=ms(r);i.url=s}return t||(e.images[this.uuid]=i),i}}function ms(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?mh.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let _h=0;class Ct extends Si{constructor(e=Ct.DEFAULT_IMAGE,t=Ct.DEFAULT_MAPPING,i=1001,r=1001,s=1006,o=1008,a=1023,l=1009,c=Ct.DEFAULT_ANISOTROPY,h=""){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:_h++}),this.uuid=jt(),this.name="",this.source=new Vl(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=s,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new ie(0,0),this.repeat=new ie(1,1),this.center=new ie(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new He,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case 1e3:e.x=e.x-Math.floor(e.x);break;case 1001:e.x=e.x<0?0:1;break;case 1002:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case 1e3:e.y=e.y-Math.floor(e.y);break;case 1001:e.y=e.y<0?0:1;break;case 1002:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Ct.DEFAULT_IMAGE=null;Ct.DEFAULT_MAPPING=300;Ct.DEFAULT_ANISOTROPY=1;class tt{constructor(e=0,t=0,i=0,r=1){tt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,r){return this.x=e,this.y=t,this.z=i,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,r=this.z,s=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*r+o[12]*s,this.y=o[1]*t+o[5]*i+o[9]*r+o[13]*s,this.z=o[2]*t+o[6]*i+o[10]*r+o[14]*s,this.w=o[3]*t+o[7]*i+o[11]*r+o[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,r,s;const l=e.elements,c=l[0],h=l[4],u=l[8],p=l[1],f=l[5],g=l[9],_=l[2],m=l[6],d=l[10];if(Math.abs(h-p)<.01&&Math.abs(u-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+p)<.1&&Math.abs(u+_)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+d-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const b=(c+1)/2,M=(f+1)/2,D=(d+1)/2,R=(h+p)/4,A=(u+_)/4,T=(g+m)/4;return b>M&&b>D?b<.01?(i=0,r=.707106781,s=.707106781):(i=Math.sqrt(b),r=R/i,s=A/i):M>D?M<.01?(i=.707106781,r=0,s=.707106781):(r=Math.sqrt(M),i=R/r,s=T/r):D<.01?(i=.707106781,r=.707106781,s=0):(s=Math.sqrt(D),i=A/s,r=T/s),this.set(i,r,s,t),this}let y=Math.sqrt((m-g)*(m-g)+(u-_)*(u-_)+(p-h)*(p-h));return Math.abs(y)<.001&&(y=1),this.x=(m-g)/y,this.y=(u-_)/y,this.z=(p-h)/y,this.w=Math.acos((c+f+d-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class yh extends Si{constructor(e=1,t=1,i={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new tt(0,0,e,t),this.scissorTest=!1,this.viewport=new tt(0,0,e,t);const r={width:e,height:t,depth:1};i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:1006,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},i);const s=new Ct(r,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace);s.flipY=!1,s.generateMipmaps=i.generateMipmaps,s.internalFormat=i.internalFormat,this.textures=[];const o=i.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=i;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let i=0,r=e.textures.length;i<r;i++)this.textures[i]=e.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new Vl(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Wn extends yh{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class Hl extends Ct{constructor(e=null,t=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class vh extends Ct{constructor(e=null,t=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class gt{constructor(e=0,t=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=r}static slerpFlat(e,t,i,r,s,o,a){let l=i[r+0],c=i[r+1],h=i[r+2],u=i[r+3];const p=s[o+0],f=s[o+1],g=s[o+2],_=s[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u;return}if(a===1){e[t+0]=p,e[t+1]=f,e[t+2]=g,e[t+3]=_;return}if(u!==_||l!==p||c!==f||h!==g){let m=1-a;const d=l*p+c*f+h*g+u*_,y=d>=0?1:-1,b=1-d*d;if(b>Number.EPSILON){const D=Math.sqrt(b),R=Math.atan2(D,d*y);m=Math.sin(m*R)/D,a=Math.sin(a*R)/D}const M=a*y;if(l=l*m+p*M,c=c*m+f*M,h=h*m+g*M,u=u*m+_*M,m===1-a){const D=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=D,c*=D,h*=D,u*=D}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,i,r,s,o){const a=i[r],l=i[r+1],c=i[r+2],h=i[r+3],u=s[o],p=s[o+1],f=s[o+2],g=s[o+3];return e[t]=a*g+h*u+l*f-c*p,e[t+1]=l*g+h*p+c*u-a*f,e[t+2]=c*g+h*f+a*p-l*u,e[t+3]=h*g-a*u-l*p-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,r){return this._x=e,this._y=t,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,r=e._y,s=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(i/2),h=a(r/2),u=a(s/2),p=l(i/2),f=l(r/2),g=l(s/2);switch(o){case"XYZ":this._x=p*h*u+c*f*g,this._y=c*f*u-p*h*g,this._z=c*h*g+p*f*u,this._w=c*h*u-p*f*g;break;case"YXZ":this._x=p*h*u+c*f*g,this._y=c*f*u-p*h*g,this._z=c*h*g-p*f*u,this._w=c*h*u+p*f*g;break;case"ZXY":this._x=p*h*u-c*f*g,this._y=c*f*u+p*h*g,this._z=c*h*g+p*f*u,this._w=c*h*u-p*f*g;break;case"ZYX":this._x=p*h*u-c*f*g,this._y=c*f*u+p*h*g,this._z=c*h*g-p*f*u,this._w=c*h*u+p*f*g;break;case"YZX":this._x=p*h*u+c*f*g,this._y=c*f*u+p*h*g,this._z=c*h*g-p*f*u,this._w=c*h*u-p*f*g;break;case"XZY":this._x=p*h*u-c*f*g,this._y=c*f*u-p*h*g,this._z=c*h*g+p*f*u,this._w=c*h*u+p*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],r=t[4],s=t[8],o=t[1],a=t[5],l=t[9],c=t[2],h=t[6],u=t[10],p=i+a+u;if(p>0){const f=.5/Math.sqrt(p+1);this._w=.25/f,this._x=(h-l)*f,this._y=(s-c)*f,this._z=(o-r)*f}else if(i>a&&i>u){const f=2*Math.sqrt(1+i-a-u);this._w=(h-l)/f,this._x=.25*f,this._y=(r+o)/f,this._z=(s+c)/f}else if(a>u){const f=2*Math.sqrt(1+a-i-u);this._w=(s-c)/f,this._x=(r+o)/f,this._y=.25*f,this._z=(l+h)/f}else{const f=2*Math.sqrt(1+u-i-a);this._w=(o-r)/f,this._x=(s+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(wt(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const r=Math.min(1,t/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,r=e._y,s=e._z,o=e._w,a=t._x,l=t._y,c=t._z,h=t._w;return this._x=i*h+o*a+r*c-s*l,this._y=r*h+o*l+s*a-i*c,this._z=s*h+o*c+i*l-r*a,this._w=o*h-i*a-r*l-s*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const i=this._x,r=this._y,s=this._z,o=this._w;let a=o*e._w+i*e._x+r*e._y+s*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=i,this._y=r,this._z=s,this;const l=1-a*a;if(l<=Number.EPSILON){const f=1-t;return this._w=f*o+t*this._w,this._x=f*i+t*this._x,this._y=f*r+t*this._y,this._z=f*s+t*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,a),u=Math.sin((1-t)*h)/c,p=Math.sin(t*h)/c;return this._w=o*u+this._w*p,this._x=i*u+this._x*p,this._y=r*u+this._y*p,this._z=s*u+this._z*p,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),r=Math.sqrt(1-i),s=Math.sqrt(i);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class P{constructor(e=0,t=0,i=0){P.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(ca.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(ca.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6]*r,this.y=s[1]*t+s[4]*i+s[7]*r,this.z=s[2]*t+s[5]*i+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,r=this.z,s=e.elements,o=1/(s[3]*t+s[7]*i+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*i+s[8]*r+s[12])*o,this.y=(s[1]*t+s[5]*i+s[9]*r+s[13])*o,this.z=(s[2]*t+s[6]*i+s[10]*r+s[14])*o,this}applyQuaternion(e){const t=this.x,i=this.y,r=this.z,s=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*r-a*i),h=2*(a*t-s*r),u=2*(s*i-o*t);return this.x=t+l*c+o*u-a*h,this.y=i+l*h+a*c-s*u,this.z=r+l*u+s*h-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*i+s[8]*r,this.y=s[1]*t+s[5]*i+s[9]*r,this.z=s[2]*t+s[6]*i+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,r=e.y,s=e.z,o=t.x,a=t.y,l=t.z;return this.x=r*l-s*a,this.y=s*o-i*l,this.z=i*a-r*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return gs.copy(this).projectOnVector(e),this.sub(gs)}reflect(e){return this.sub(gs.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(wt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,r=this.z-e.z;return t*t+i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const r=Math.sin(t)*e;return this.x=r*Math.sin(i),this.y=Math.cos(t)*e,this.z=r*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const gs=new P,ca=new gt;class In{constructor(e=new P(1/0,1/0,1/0),t=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(Zt.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(Zt.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=Zt.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const s=i.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Zt):Zt.fromBufferAttribute(s,o),Zt.applyMatrix4(e.matrixWorld),this.expandByPoint(Zt);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),or.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),or.copy(i.boundingBox)),or.applyMatrix4(e.matrixWorld),this.union(or)}const r=e.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Zt),Zt.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Li),ar.subVectors(this.max,Li),jn.subVectors(e.a,Li),Kn.subVectors(e.b,Li),Jn.subVectors(e.c,Li),Sn.subVectors(Kn,jn),wn.subVectors(Jn,Kn),Nn.subVectors(jn,Jn);let t=[0,-Sn.z,Sn.y,0,-wn.z,wn.y,0,-Nn.z,Nn.y,Sn.z,0,-Sn.x,wn.z,0,-wn.x,Nn.z,0,-Nn.x,-Sn.y,Sn.x,0,-wn.y,wn.x,0,-Nn.y,Nn.x,0];return!_s(t,jn,Kn,Jn,ar)||(t=[1,0,0,0,1,0,0,0,1],!_s(t,jn,Kn,Jn,ar))?!1:(lr.crossVectors(Sn,wn),t=[lr.x,lr.y,lr.z],_s(t,jn,Kn,Jn,ar))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Zt).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Zt).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(hn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),hn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),hn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),hn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),hn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),hn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),hn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),hn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(hn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const hn=[new P,new P,new P,new P,new P,new P,new P,new P],Zt=new P,or=new In,jn=new P,Kn=new P,Jn=new P,Sn=new P,wn=new P,Nn=new P,Li=new P,ar=new P,lr=new P,Un=new P;function _s(n,e,t,i,r){for(let s=0,o=n.length-3;s<=o;s+=3){Un.fromArray(n,s);const a=r.x*Math.abs(Un.x)+r.y*Math.abs(Un.y)+r.z*Math.abs(Un.z),l=e.dot(Un),c=t.dot(Un),h=i.dot(Un);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}const bh=new In,Ii=new P,ys=new P;class vn{constructor(e=new P,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):bh.setFromPoints(e).getCenter(i);let r=0;for(let s=0,o=e.length;s<o;s++)r=Math.max(r,i.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Ii.subVectors(e,this.center);const t=Ii.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),r=(i-this.radius)*.5;this.center.addScaledVector(Ii,r/i),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(ys.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Ii.copy(e.center).add(ys)),this.expandByPoint(Ii.copy(e.center).sub(ys))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const un=new P,vs=new P,cr=new P,Tn=new P,bs=new P,hr=new P,Ms=new P;class tr{constructor(e=new P,t=new P(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,un)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=un.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(un.copy(this.origin).addScaledVector(this.direction,t),un.distanceToSquared(e))}distanceSqToSegment(e,t,i,r){vs.copy(e).add(t).multiplyScalar(.5),cr.copy(t).sub(e).normalize(),Tn.copy(this.origin).sub(vs);const s=e.distanceTo(t)*.5,o=-this.direction.dot(cr),a=Tn.dot(this.direction),l=-Tn.dot(cr),c=Tn.lengthSq(),h=Math.abs(1-o*o);let u,p,f,g;if(h>0)if(u=o*l-a,p=o*a-l,g=s*h,u>=0)if(p>=-g)if(p<=g){const _=1/h;u*=_,p*=_,f=u*(u+o*p+2*a)+p*(o*u+p+2*l)+c}else p=s,u=Math.max(0,-(o*p+a)),f=-u*u+p*(p+2*l)+c;else p=-s,u=Math.max(0,-(o*p+a)),f=-u*u+p*(p+2*l)+c;else p<=-g?(u=Math.max(0,-(-o*s+a)),p=u>0?-s:Math.min(Math.max(-s,-l),s),f=-u*u+p*(p+2*l)+c):p<=g?(u=0,p=Math.min(Math.max(-s,-l),s),f=p*(p+2*l)+c):(u=Math.max(0,-(o*s+a)),p=u>0?s:Math.min(Math.max(-s,-l),s),f=-u*u+p*(p+2*l)+c);else p=o>0?-s:s,u=Math.max(0,-(o*p+a)),f=-u*u+p*(p+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(vs).addScaledVector(cr,p),f}intersectSphere(e,t){un.subVectors(e.center,this.origin);const i=un.dot(this.direction),r=un.dot(un)-i*i,s=e.radius*e.radius;if(r>s)return null;const o=Math.sqrt(s-r),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,r,s,o,a,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,p=this.origin;return c>=0?(i=(e.min.x-p.x)*c,r=(e.max.x-p.x)*c):(i=(e.max.x-p.x)*c,r=(e.min.x-p.x)*c),h>=0?(s=(e.min.y-p.y)*h,o=(e.max.y-p.y)*h):(s=(e.max.y-p.y)*h,o=(e.min.y-p.y)*h),i>o||s>r||((s>i||isNaN(i))&&(i=s),(o<r||isNaN(r))&&(r=o),u>=0?(a=(e.min.z-p.z)*u,l=(e.max.z-p.z)*u):(a=(e.max.z-p.z)*u,l=(e.min.z-p.z)*u),i>l||a>r)||((a>i||i!==i)&&(i=a),(l<r||r!==r)&&(r=l),r<0)?null:this.at(i>=0?i:r,t)}intersectsBox(e){return this.intersectBox(e,un)!==null}intersectTriangle(e,t,i,r,s){bs.subVectors(t,e),hr.subVectors(i,e),Ms.crossVectors(bs,hr);let o=this.direction.dot(Ms),a;if(o>0){if(r)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Tn.subVectors(this.origin,e);const l=a*this.direction.dot(hr.crossVectors(Tn,hr));if(l<0)return null;const c=a*this.direction.dot(bs.cross(Tn));if(c<0||l+c>o)return null;const h=-a*Tn.dot(Ms);return h<0?null:this.at(h/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Be{constructor(e,t,i,r,s,o,a,l,c,h,u,p,f,g,_,m){Be.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,o,a,l,c,h,u,p,f,g,_,m)}set(e,t,i,r,s,o,a,l,c,h,u,p,f,g,_,m){const d=this.elements;return d[0]=e,d[4]=t,d[8]=i,d[12]=r,d[1]=s,d[5]=o,d[9]=a,d[13]=l,d[2]=c,d[6]=h,d[10]=u,d[14]=p,d[3]=f,d[7]=g,d[11]=_,d[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Be().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,i=e.elements,r=1/Zn.setFromMatrixColumn(e,0).length(),s=1/Zn.setFromMatrixColumn(e,1).length(),o=1/Zn.setFromMatrixColumn(e,2).length();return t[0]=i[0]*r,t[1]=i[1]*r,t[2]=i[2]*r,t[3]=0,t[4]=i[4]*s,t[5]=i[5]*s,t[6]=i[6]*s,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,r=e.y,s=e.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(r),c=Math.sin(r),h=Math.cos(s),u=Math.sin(s);if(e.order==="XYZ"){const p=o*h,f=o*u,g=a*h,_=a*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=f+g*c,t[5]=p-_*c,t[9]=-a*l,t[2]=_-p*c,t[6]=g+f*c,t[10]=o*l}else if(e.order==="YXZ"){const p=l*h,f=l*u,g=c*h,_=c*u;t[0]=p+_*a,t[4]=g*a-f,t[8]=o*c,t[1]=o*u,t[5]=o*h,t[9]=-a,t[2]=f*a-g,t[6]=_+p*a,t[10]=o*l}else if(e.order==="ZXY"){const p=l*h,f=l*u,g=c*h,_=c*u;t[0]=p-_*a,t[4]=-o*u,t[8]=g+f*a,t[1]=f+g*a,t[5]=o*h,t[9]=_-p*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){const p=o*h,f=o*u,g=a*h,_=a*u;t[0]=l*h,t[4]=g*c-f,t[8]=p*c+_,t[1]=l*u,t[5]=_*c+p,t[9]=f*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){const p=o*l,f=o*c,g=a*l,_=a*c;t[0]=l*h,t[4]=_-p*u,t[8]=g*u+f,t[1]=u,t[5]=o*h,t[9]=-a*h,t[2]=-c*h,t[6]=f*u+g,t[10]=p-_*u}else if(e.order==="XZY"){const p=o*l,f=o*c,g=a*l,_=a*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=p*u+_,t[5]=o*h,t[9]=f*u-g,t[2]=g*u-f,t[6]=a*h,t[10]=_*u+p}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Mh,e,xh)}lookAt(e,t,i){const r=this.elements;return Bt.subVectors(e,t),Bt.lengthSq()===0&&(Bt.z=1),Bt.normalize(),En.crossVectors(i,Bt),En.lengthSq()===0&&(Math.abs(i.z)===1?Bt.x+=1e-4:Bt.z+=1e-4,Bt.normalize(),En.crossVectors(i,Bt)),En.normalize(),ur.crossVectors(Bt,En),r[0]=En.x,r[4]=ur.x,r[8]=Bt.x,r[1]=En.y,r[5]=ur.y,r[9]=Bt.y,r[2]=En.z,r[6]=ur.z,r[10]=Bt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,r=t.elements,s=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],h=i[1],u=i[5],p=i[9],f=i[13],g=i[2],_=i[6],m=i[10],d=i[14],y=i[3],b=i[7],M=i[11],D=i[15],R=r[0],A=r[4],T=r[8],S=r[12],x=r[1],v=r[5],I=r[9],U=r[13],B=r[2],q=r[6],z=r[10],Y=r[14],N=r[3],j=r[7],he=r[11],K=r[15];return s[0]=o*R+a*x+l*B+c*N,s[4]=o*A+a*v+l*q+c*j,s[8]=o*T+a*I+l*z+c*he,s[12]=o*S+a*U+l*Y+c*K,s[1]=h*R+u*x+p*B+f*N,s[5]=h*A+u*v+p*q+f*j,s[9]=h*T+u*I+p*z+f*he,s[13]=h*S+u*U+p*Y+f*K,s[2]=g*R+_*x+m*B+d*N,s[6]=g*A+_*v+m*q+d*j,s[10]=g*T+_*I+m*z+d*he,s[14]=g*S+_*U+m*Y+d*K,s[3]=y*R+b*x+M*B+D*N,s[7]=y*A+b*v+M*q+D*j,s[11]=y*T+b*I+M*z+D*he,s[15]=y*S+b*U+M*Y+D*K,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],r=e[8],s=e[12],o=e[1],a=e[5],l=e[9],c=e[13],h=e[2],u=e[6],p=e[10],f=e[14],g=e[3],_=e[7],m=e[11],d=e[15];return g*(+s*l*u-r*c*u-s*a*p+i*c*p+r*a*f-i*l*f)+_*(+t*l*f-t*c*p+s*o*p-r*o*f+r*c*h-s*l*h)+m*(+t*c*u-t*a*f-s*o*u+i*o*f+s*a*h-i*c*h)+d*(-r*a*h-t*l*u+t*a*p+r*o*u-i*o*p+i*l*h)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=e[9],p=e[10],f=e[11],g=e[12],_=e[13],m=e[14],d=e[15],y=u*m*c-_*p*c+_*l*f-a*m*f-u*l*d+a*p*d,b=g*p*c-h*m*c-g*l*f+o*m*f+h*l*d-o*p*d,M=h*_*c-g*u*c+g*a*f-o*_*f-h*a*d+o*u*d,D=g*u*l-h*_*l-g*a*p+o*_*p+h*a*m-o*u*m,R=t*y+i*b+r*M+s*D;if(R===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const A=1/R;return e[0]=y*A,e[1]=(_*p*s-u*m*s-_*r*f+i*m*f+u*r*d-i*p*d)*A,e[2]=(a*m*s-_*l*s+_*r*c-i*m*c-a*r*d+i*l*d)*A,e[3]=(u*l*s-a*p*s-u*r*c+i*p*c+a*r*f-i*l*f)*A,e[4]=b*A,e[5]=(h*m*s-g*p*s+g*r*f-t*m*f-h*r*d+t*p*d)*A,e[6]=(g*l*s-o*m*s-g*r*c+t*m*c+o*r*d-t*l*d)*A,e[7]=(o*p*s-h*l*s+h*r*c-t*p*c-o*r*f+t*l*f)*A,e[8]=M*A,e[9]=(g*u*s-h*_*s-g*i*f+t*_*f+h*i*d-t*u*d)*A,e[10]=(o*_*s-g*a*s+g*i*c-t*_*c-o*i*d+t*a*d)*A,e[11]=(h*a*s-o*u*s-h*i*c+t*u*c+o*i*f-t*a*f)*A,e[12]=D*A,e[13]=(h*_*r-g*u*r+g*i*p-t*_*p-h*i*m+t*u*m)*A,e[14]=(g*a*r-o*_*r-g*i*l+t*_*l+o*i*m-t*a*m)*A,e[15]=(o*u*r-h*a*r+h*i*l-t*u*l-o*i*p+t*a*p)*A,this}scale(e){const t=this.elements,i=e.x,r=e.y,s=e.z;return t[0]*=i,t[4]*=r,t[8]*=s,t[1]*=i,t[5]*=r,t[9]*=s,t[2]*=i,t[6]*=r,t[10]*=s,t[3]*=i,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,r))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),r=Math.sin(t),s=1-i,o=e.x,a=e.y,l=e.z,c=s*o,h=s*a;return this.set(c*o+i,c*a-r*l,c*l+r*a,0,c*a+r*l,h*a+i,h*l-r*o,0,c*l-r*a,h*l+r*o,s*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,r,s,o){return this.set(1,i,s,0,e,1,o,0,t,r,1,0,0,0,0,1),this}compose(e,t,i){const r=this.elements,s=t._x,o=t._y,a=t._z,l=t._w,c=s+s,h=o+o,u=a+a,p=s*c,f=s*h,g=s*u,_=o*h,m=o*u,d=a*u,y=l*c,b=l*h,M=l*u,D=i.x,R=i.y,A=i.z;return r[0]=(1-(_+d))*D,r[1]=(f+M)*D,r[2]=(g-b)*D,r[3]=0,r[4]=(f-M)*R,r[5]=(1-(p+d))*R,r[6]=(m+y)*R,r[7]=0,r[8]=(g+b)*A,r[9]=(m-y)*A,r[10]=(1-(p+_))*A,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,i){const r=this.elements;let s=Zn.set(r[0],r[1],r[2]).length();const o=Zn.set(r[4],r[5],r[6]).length(),a=Zn.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],$t.copy(this);const c=1/s,h=1/o,u=1/a;return $t.elements[0]*=c,$t.elements[1]*=c,$t.elements[2]*=c,$t.elements[4]*=h,$t.elements[5]*=h,$t.elements[6]*=h,$t.elements[8]*=u,$t.elements[9]*=u,$t.elements[10]*=u,t.setFromRotationMatrix($t),i.x=s,i.y=o,i.z=a,this}makePerspective(e,t,i,r,s,o,a=2e3){const l=this.elements,c=2*s/(t-e),h=2*s/(i-r),u=(t+e)/(t-e),p=(i+r)/(i-r);let f,g;if(a===2e3)f=-(o+s)/(o-s),g=-2*o*s/(o-s);else if(a===2001)f=-o/(o-s),g=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=p,l[13]=0,l[2]=0,l[6]=0,l[10]=f,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,r,s,o,a=2e3){const l=this.elements,c=1/(t-e),h=1/(i-r),u=1/(o-s),p=(t+e)*c,f=(i+r)*h;let g,_;if(a===2e3)g=(o+s)*u,_=-2*u;else if(a===2001)g=s*u,_=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-p,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-f,l[2]=0,l[6]=0,l[10]=_,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let r=0;r<16;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}}const Zn=new P,$t=new Be,Mh=new P(0,0,0),xh=new P(1,1,1),En=new P,ur=new P,Bt=new P,ha=new Be,ua=new gt;class tn{constructor(e=0,t=0,i=0,r=tn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,r=this._order){return this._x=e,this._y=t,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const r=e.elements,s=r[0],o=r[4],a=r[8],l=r[1],c=r[5],h=r[9],u=r[2],p=r[6],f=r[10];switch(t){case"XYZ":this._y=Math.asin(wt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(p,c),this._z=0);break;case"YXZ":this._x=Math.asin(-wt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,s),this._z=0);break;case"ZXY":this._x=Math.asin(wt(p,-1,1)),Math.abs(p)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-wt(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(p,f),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(wt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,s)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-wt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(p,c),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-h,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return ha.makeRotationFromQuaternion(e),this.setFromRotationMatrix(ha,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return ua.setFromEuler(this),this.setFromQuaternion(ua,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}tn.DEFAULT_ORDER="XYZ";class To{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Sh=0;const da=new P,$n=new gt,dn=new Be,dr=new P,Di=new P,wh=new P,Th=new gt,fa=new P(1,0,0),pa=new P(0,1,0),ma=new P(0,0,1),ga={type:"added"},Eh={type:"removed"},Qn={type:"childadded",child:null},xs={type:"childremoved",child:null};class yt extends Si{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Sh++}),this.uuid=jt(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=yt.DEFAULT_UP.clone();const e=new P,t=new tn,i=new gt,r=new P(1,1,1);function s(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(s),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new Be},normalMatrix:{value:new He}}),this.matrix=new Be,this.matrixWorld=new Be,this.matrixAutoUpdate=yt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=yt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new To,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return $n.setFromAxisAngle(e,t),this.quaternion.multiply($n),this}rotateOnWorldAxis(e,t){return $n.setFromAxisAngle(e,t),this.quaternion.premultiply($n),this}rotateX(e){return this.rotateOnAxis(fa,e)}rotateY(e){return this.rotateOnAxis(pa,e)}rotateZ(e){return this.rotateOnAxis(ma,e)}translateOnAxis(e,t){return da.copy(e).applyQuaternion(this.quaternion),this.position.add(da.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(fa,e)}translateY(e){return this.translateOnAxis(pa,e)}translateZ(e){return this.translateOnAxis(ma,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(dn.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?dr.copy(e):dr.set(e,t,i);const r=this.parent;this.updateWorldMatrix(!0,!1),Di.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?dn.lookAt(Di,dr,this.up):dn.lookAt(dr,Di,this.up),this.quaternion.setFromRotationMatrix(dn),r&&(dn.extractRotation(r.matrixWorld),$n.setFromRotationMatrix(dn),this.quaternion.premultiply($n.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(ga),Qn.child=e,this.dispatchEvent(Qn),Qn.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Eh),xs.child=e,this.dispatchEvent(xs),xs.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),dn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),dn.multiply(e.parent.matrixWorld)),e.applyMatrix4(dn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(ga),Qn.child=e,this.dispatchEvent(Qn),Qn.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,r=this.children.length;i<r;i++){const o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Di,e,wh),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Di,Th,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t){const i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];s(e.shapes,u)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(s(e.materials,this.material[l]));r.material=a}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];r.animations.push(s(e.animations,l))}}if(t){const a=o(e.geometries),l=o(e.materials),c=o(e.textures),h=o(e.images),u=o(e.shapes),p=o(e.skeletons),f=o(e.animations),g=o(e.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),h.length>0&&(i.images=h),u.length>0&&(i.shapes=u),p.length>0&&(i.skeletons=p),f.length>0&&(i.animations=f),g.length>0&&(i.nodes=g)}return i.object=r,i;function o(a){const l=[];for(const c in a){const h=a[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const r=e.children[i];this.add(r.clone())}return this}}yt.DEFAULT_UP=new P(0,1,0);yt.DEFAULT_MATRIX_AUTO_UPDATE=!0;yt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Qt=new P,fn=new P,Ss=new P,pn=new P,ei=new P,ti=new P,_a=new P,ws=new P,Ts=new P,Es=new P,As=new tt,Rs=new tt,Cs=new tt;class Yt{constructor(e=new P,t=new P,i=new P){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,r){r.subVectors(i,t),Qt.subVectors(e,t),r.cross(Qt);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,i,r,s){Qt.subVectors(r,t),fn.subVectors(i,t),Ss.subVectors(e,t);const o=Qt.dot(Qt),a=Qt.dot(fn),l=Qt.dot(Ss),c=fn.dot(fn),h=fn.dot(Ss),u=o*c-a*a;if(u===0)return s.set(0,0,0),null;const p=1/u,f=(c*l-a*h)*p,g=(o*h-a*l)*p;return s.set(1-f-g,g,f)}static containsPoint(e,t,i,r){return this.getBarycoord(e,t,i,r,pn)===null?!1:pn.x>=0&&pn.y>=0&&pn.x+pn.y<=1}static getInterpolation(e,t,i,r,s,o,a,l){return this.getBarycoord(e,t,i,r,pn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,pn.x),l.addScaledVector(o,pn.y),l.addScaledVector(a,pn.z),l)}static getInterpolatedAttribute(e,t,i,r,s,o){return As.setScalar(0),Rs.setScalar(0),Cs.setScalar(0),As.fromBufferAttribute(e,t),Rs.fromBufferAttribute(e,i),Cs.fromBufferAttribute(e,r),o.setScalar(0),o.addScaledVector(As,s.x),o.addScaledVector(Rs,s.y),o.addScaledVector(Cs,s.z),o}static isFrontFacing(e,t,i,r){return Qt.subVectors(i,t),fn.subVectors(e,t),Qt.cross(fn).dot(r)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,r){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,i,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Qt.subVectors(this.c,this.b),fn.subVectors(this.a,this.b),Qt.cross(fn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Yt.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Yt.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,r,s){return Yt.getInterpolation(e,this.a,this.b,this.c,t,i,r,s)}containsPoint(e){return Yt.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Yt.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,r=this.b,s=this.c;let o,a;ei.subVectors(r,i),ti.subVectors(s,i),ws.subVectors(e,i);const l=ei.dot(ws),c=ti.dot(ws);if(l<=0&&c<=0)return t.copy(i);Ts.subVectors(e,r);const h=ei.dot(Ts),u=ti.dot(Ts);if(h>=0&&u<=h)return t.copy(r);const p=l*u-h*c;if(p<=0&&l>=0&&h<=0)return o=l/(l-h),t.copy(i).addScaledVector(ei,o);Es.subVectors(e,s);const f=ei.dot(Es),g=ti.dot(Es);if(g>=0&&f<=g)return t.copy(s);const _=f*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(i).addScaledVector(ti,a);const m=h*g-f*u;if(m<=0&&u-h>=0&&f-g>=0)return _a.subVectors(s,r),a=(u-h)/(u-h+(f-g)),t.copy(r).addScaledVector(_a,a);const d=1/(m+_+p);return o=_*d,a=p*d,t.copy(i).addScaledVector(ei,o).addScaledVector(ti,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Wl={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},An={h:0,s:0,l:0},fr={h:0,s:0,l:0};function Ps(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}class Ie{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Gt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Qe.toWorkingColorSpace(this,t),this}setRGB(e,t,i,r=Qe.workingColorSpace){return this.r=e,this.g=t,this.b=i,Qe.toWorkingColorSpace(this,r),this}setHSL(e,t,i,r=Qe.workingColorSpace){if(e=wo(e,1),t=wt(t,0,1),i=wt(i,0,1),t===0)this.r=this.g=this.b=i;else{const s=i<=.5?i*(1+t):i+t-i*t,o=2*i-s;this.r=Ps(o,s,e+1/3),this.g=Ps(o,s,e),this.b=Ps(o,s,e-1/3)}return Qe.toWorkingColorSpace(this,r),this}setStyle(e,t=Gt){function i(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Gt){const i=Wl[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=_n(e.r),this.g=_n(e.g),this.b=_n(e.b),this}copyLinearToSRGB(e){return this.r=mi(e.r),this.g=mi(e.g),this.b=mi(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Gt){return Qe.fromWorkingColorSpace(It.copy(this),e),Math.round(wt(It.r*255,0,255))*65536+Math.round(wt(It.g*255,0,255))*256+Math.round(wt(It.b*255,0,255))}getHexString(e=Gt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Qe.workingColorSpace){Qe.fromWorkingColorSpace(It.copy(this),t);const i=It.r,r=It.g,s=It.b,o=Math.max(i,r,s),a=Math.min(i,r,s);let l,c;const h=(a+o)/2;if(a===o)l=0,c=0;else{const u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case i:l=(r-s)/u+(r<s?6:0);break;case r:l=(s-i)/u+2;break;case s:l=(i-r)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=Qe.workingColorSpace){return Qe.fromWorkingColorSpace(It.copy(this),t),e.r=It.r,e.g=It.g,e.b=It.b,e}getStyle(e=Gt){Qe.fromWorkingColorSpace(It.copy(this),e);const t=It.r,i=It.g,r=It.b;return e!==Gt?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,t,i){return this.getHSL(An),this.setHSL(An.h+e,An.s+t,An.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(An),e.getHSL(fr);const i=qi(An.h,fr.h,t),r=qi(An.s,fr.s,t),s=qi(An.l,fr.l,t);return this.setHSL(i,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*i+s[6]*r,this.g=s[1]*t+s[4]*i+s[7]*r,this.b=s[2]*t+s[5]*i+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const It=new Ie;Ie.NAMES=Wl;let Ah=0;class bn extends Si{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Ah++}),this.uuid=jt(),this.name="",this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ie(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=7680,this.stencilZFail=7680,this.stencilZPass=7680,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==1&&(i.blending=this.blending),this.side!==0&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==204&&(i.blendSrc=this.blendSrc),this.blendDst!==205&&(i.blendDst=this.blendDst),this.blendEquation!==100&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==3&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==519&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==7680&&(i.stencilFail=this.stencilFail),this.stencilZFail!==7680&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==7680&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(s){const o=[];for(const a in s){const l=s[a];delete l.metadata,o.push(l)}return o}if(t){const s=r(e.textures),o=r(e.images);s.length>0&&(i.textures=s),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const r=t.length;i=new Array(r);for(let s=0;s!==r;++s)i[s]=t[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class Eo extends bn{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new Ie(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new tn,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const gn=Rh();function Rh(){const n=new ArrayBuffer(4),e=new Float32Array(n),t=new Uint32Array(n),i=new Uint32Array(512),r=new Uint32Array(512);for(let l=0;l<256;++l){const c=l-127;c<-27?(i[l]=0,i[l|256]=32768,r[l]=24,r[l|256]=24):c<-14?(i[l]=1024>>-c-14,i[l|256]=1024>>-c-14|32768,r[l]=-c-1,r[l|256]=-c-1):c<=15?(i[l]=c+15<<10,i[l|256]=c+15<<10|32768,r[l]=13,r[l|256]=13):c<128?(i[l]=31744,i[l|256]=64512,r[l]=24,r[l|256]=24):(i[l]=31744,i[l|256]=64512,r[l]=13,r[l|256]=13)}const s=new Uint32Array(2048),o=new Uint32Array(64),a=new Uint32Array(64);for(let l=1;l<1024;++l){let c=l<<13,h=0;for(;(c&8388608)===0;)c<<=1,h-=8388608;c&=-8388609,h+=947912704,s[l]=c|h}for(let l=1024;l<2048;++l)s[l]=939524096+(l-1024<<13);for(let l=1;l<31;++l)o[l]=l<<23;o[31]=1199570944,o[32]=2147483648;for(let l=33;l<63;++l)o[l]=2147483648+(l-32<<23);o[63]=3347054592;for(let l=1;l<64;++l)l!==32&&(a[l]=1024);return{floatView:e,uint32View:t,baseTable:i,shiftTable:r,mantissaTable:s,exponentTable:o,offsetTable:a}}function Ch(n){Math.abs(n)>65504&&console.warn("THREE.DataUtils.toHalfFloat(): Value out of range."),n=wt(n,-65504,65504),gn.floatView[0]=n;const e=gn.uint32View[0],t=e>>23&511;return gn.baseTable[t]+((e&8388607)>>gn.shiftTable[t])}function Ph(n){const e=n>>10;return gn.uint32View[0]=gn.mantissaTable[gn.offsetTable[e]+(n&1023)]+gn.exponentTable[e],gn.floatView[0]}const E_={toHalfFloat:Ch,fromHalfFloat:Ph},xt=new P,pr=new ie;class Nt{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=35044,this.updateRanges=[],this.gpuType=1015,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)pr.fromBufferAttribute(this,t),pr.applyMatrix3(e),this.setXY(t,pr.x,pr.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)xt.fromBufferAttribute(this,t),xt.applyMatrix3(e),this.setXYZ(t,xt.x,xt.y,xt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)xt.fromBufferAttribute(this,t),xt.applyMatrix4(e),this.setXYZ(t,xt.x,xt.y,xt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)xt.fromBufferAttribute(this,t),xt.applyNormalMatrix(e),this.setXYZ(t,xt.x,xt.y,xt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)xt.fromBufferAttribute(this,t),xt.transformDirection(e),this.setXYZ(t,xt.x,xt.y,xt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=en(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=ot(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=en(t,this.array)),t}setX(e,t){return this.normalized&&(t=ot(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=en(t,this.array)),t}setY(e,t){return this.normalized&&(t=ot(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=en(t,this.array)),t}setZ(e,t){return this.normalized&&(t=ot(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=en(t,this.array)),t}setW(e,t){return this.normalized&&(t=ot(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=ot(t,this.array),i=ot(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,r){return e*=this.itemSize,this.normalized&&(t=ot(t,this.array),i=ot(i,this.array),r=ot(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,t,i,r,s){return e*=this.itemSize,this.normalized&&(t=ot(t,this.array),i=ot(i,this.array),r=ot(r,this.array),s=ot(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==35044&&(e.usage=this.usage),e}}class Ao extends Nt{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class Xl extends Nt{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class Ye extends Nt{constructor(e,t,i){super(new Float32Array(e),t,i)}}let Lh=0;const Xt=new Be,Ls=new yt,ni=new P,zt=new In,Ni=new In,Rt=new P;class vt extends Si{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Lh++}),this.uuid=jt(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Gl(e)?Xl:Ao)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const s=new He().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Xt.makeRotationFromQuaternion(e),this.applyMatrix4(Xt),this}rotateX(e){return Xt.makeRotationX(e),this.applyMatrix4(Xt),this}rotateY(e){return Xt.makeRotationY(e),this.applyMatrix4(Xt),this}rotateZ(e){return Xt.makeRotationZ(e),this.applyMatrix4(Xt),this}translate(e,t,i){return Xt.makeTranslation(e,t,i),this.applyMatrix4(Xt),this}scale(e,t,i){return Xt.makeScale(e,t,i),this.applyMatrix4(Xt),this}lookAt(e){return Ls.lookAt(e),Ls.updateMatrix(),this.applyMatrix4(Ls.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ni).negate(),this.translate(ni.x,ni.y,ni.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const i=[];for(let r=0,s=e.length;r<s;r++){const o=e[r];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Ye(i,3))}else{for(let i=0,r=t.count;i<r;i++){const s=e[i];t.setXYZ(i,s.x,s.y,s.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new In);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,r=t.length;i<r;i++){const s=t[i];zt.setFromBufferAttribute(s),this.morphTargetsRelative?(Rt.addVectors(this.boundingBox.min,zt.min),this.boundingBox.expandByPoint(Rt),Rt.addVectors(this.boundingBox.max,zt.max),this.boundingBox.expandByPoint(Rt)):(this.boundingBox.expandByPoint(zt.min),this.boundingBox.expandByPoint(zt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new vn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new P,1/0);return}if(e){const i=this.boundingSphere.center;if(zt.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){const a=t[s];Ni.setFromBufferAttribute(a),this.morphTargetsRelative?(Rt.addVectors(zt.min,Ni.min),zt.expandByPoint(Rt),Rt.addVectors(zt.max,Ni.max),zt.expandByPoint(Rt)):(zt.expandByPoint(Ni.min),zt.expandByPoint(Ni.max))}zt.getCenter(i);let r=0;for(let s=0,o=e.count;s<o;s++)Rt.fromBufferAttribute(e,s),r=Math.max(r,i.distanceToSquared(Rt));if(t)for(let s=0,o=t.length;s<o;s++){const a=t[s],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)Rt.fromBufferAttribute(a,c),l&&(ni.fromBufferAttribute(e,c),Rt.add(ni)),r=Math.max(r,i.distanceToSquared(Rt))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,r=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Nt(new Float32Array(4*i.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let T=0;T<i.count;T++)a[T]=new P,l[T]=new P;const c=new P,h=new P,u=new P,p=new ie,f=new ie,g=new ie,_=new P,m=new P;function d(T,S,x){c.fromBufferAttribute(i,T),h.fromBufferAttribute(i,S),u.fromBufferAttribute(i,x),p.fromBufferAttribute(s,T),f.fromBufferAttribute(s,S),g.fromBufferAttribute(s,x),h.sub(c),u.sub(c),f.sub(p),g.sub(p);const v=1/(f.x*g.y-g.x*f.y);isFinite(v)&&(_.copy(h).multiplyScalar(g.y).addScaledVector(u,-f.y).multiplyScalar(v),m.copy(u).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(v),a[T].add(_),a[S].add(_),a[x].add(_),l[T].add(m),l[S].add(m),l[x].add(m))}let y=this.groups;y.length===0&&(y=[{start:0,count:e.count}]);for(let T=0,S=y.length;T<S;++T){const x=y[T],v=x.start,I=x.count;for(let U=v,B=v+I;U<B;U+=3)d(e.getX(U+0),e.getX(U+1),e.getX(U+2))}const b=new P,M=new P,D=new P,R=new P;function A(T){D.fromBufferAttribute(r,T),R.copy(D);const S=a[T];b.copy(S),b.sub(D.multiplyScalar(D.dot(S))).normalize(),M.crossVectors(R,S);const v=M.dot(l[T])<0?-1:1;o.setXYZW(T,b.x,b.y,b.z,v)}for(let T=0,S=y.length;T<S;++T){const x=y[T],v=x.start,I=x.count;for(let U=v,B=v+I;U<B;U+=3)A(e.getX(U+0)),A(e.getX(U+1)),A(e.getX(U+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Nt(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let p=0,f=i.count;p<f;p++)i.setXYZ(p,0,0,0);const r=new P,s=new P,o=new P,a=new P,l=new P,c=new P,h=new P,u=new P;if(e)for(let p=0,f=e.count;p<f;p+=3){const g=e.getX(p+0),_=e.getX(p+1),m=e.getX(p+2);r.fromBufferAttribute(t,g),s.fromBufferAttribute(t,_),o.fromBufferAttribute(t,m),h.subVectors(o,s),u.subVectors(r,s),h.cross(u),a.fromBufferAttribute(i,g),l.fromBufferAttribute(i,_),c.fromBufferAttribute(i,m),a.add(h),l.add(h),c.add(h),i.setXYZ(g,a.x,a.y,a.z),i.setXYZ(_,l.x,l.y,l.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let p=0,f=t.count;p<f;p+=3)r.fromBufferAttribute(t,p+0),s.fromBufferAttribute(t,p+1),o.fromBufferAttribute(t,p+2),h.subVectors(o,s),u.subVectors(r,s),h.cross(u),i.setXYZ(p+0,h.x,h.y,h.z),i.setXYZ(p+1,h.x,h.y,h.z),i.setXYZ(p+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)Rt.fromBufferAttribute(e,t),Rt.normalize(),e.setXYZ(t,Rt.x,Rt.y,Rt.z)}toNonIndexed(){function e(a,l){const c=a.array,h=a.itemSize,u=a.normalized,p=new c.constructor(l.length*h);let f=0,g=0;for(let _=0,m=l.length;_<m;_++){a.isInterleavedBufferAttribute?f=l[_]*a.data.stride+a.offset:f=l[_]*h;for(let d=0;d<h;d++)p[g++]=c[f++]}return new Nt(p,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new vt,i=this.index.array,r=this.attributes;for(const a in r){const l=r[a],c=e(l,i);t.setAttribute(a,c)}const s=this.morphAttributes;for(const a in s){const l=[],c=s[a];for(let h=0,u=c.length;h<u;h++){const p=c[h],f=e(p,i);l.push(f)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const l in i){const c=i[l];e.data.attributes[l]=c.toJSON(e.data)}const r={};let s=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,p=c.length;u<p;u++){const f=c[u];h.push(f.toJSON(e.data))}h.length>0&&(r[l]=h,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone(t));const r=e.attributes;for(const c in r){const h=r[c];this.setAttribute(c,h.clone(t))}const s=e.morphAttributes;for(const c in s){const h=[],u=s[c];for(let p=0,f=u.length;p<f;p++)h.push(u[p].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let c=0,h=o.length;c<h;c++){const u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const ya=new Be,Fn=new tr,mr=new vn,va=new P,gr=new P,_r=new P,yr=new P,Is=new P,vr=new P,ba=new P,br=new P;class ht extends yt{constructor(e=new vt,t=new Eo){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const r=t[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){const i=this.geometry,r=i.attributes.position,s=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(r,e);const a=this.morphTargetInfluences;if(s&&a){vr.set(0,0,0);for(let l=0,c=s.length;l<c;l++){const h=a[l],u=s[l];h!==0&&(Is.fromBufferAttribute(u,e),o?vr.addScaledVector(Is,h):vr.addScaledVector(Is.sub(t),h))}t.add(vr)}return t}raycast(e,t){const i=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),mr.copy(i.boundingSphere),mr.applyMatrix4(s),Fn.copy(e.ray).recast(e.near),!(mr.containsPoint(Fn.origin)===!1&&(Fn.intersectSphere(mr,va)===null||Fn.origin.distanceToSquared(va)>(e.far-e.near)**2))&&(ya.copy(s).invert(),Fn.copy(e.ray).applyMatrix4(ya),!(i.boundingBox!==null&&Fn.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,Fn)))}_computeIntersections(e,t,i){let r;const s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,c=s.attributes.uv,h=s.attributes.uv1,u=s.attributes.normal,p=s.groups,f=s.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=p.length;g<_;g++){const m=p[g],d=o[m.materialIndex],y=Math.max(m.start,f.start),b=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let M=y,D=b;M<D;M+=3){const R=a.getX(M),A=a.getX(M+1),T=a.getX(M+2);r=Mr(this,d,e,i,c,h,u,R,A,T),r&&(r.faceIndex=Math.floor(M/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{const g=Math.max(0,f.start),_=Math.min(a.count,f.start+f.count);for(let m=g,d=_;m<d;m+=3){const y=a.getX(m),b=a.getX(m+1),M=a.getX(m+2);r=Mr(this,o,e,i,c,h,u,y,b,M),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=p.length;g<_;g++){const m=p[g],d=o[m.materialIndex],y=Math.max(m.start,f.start),b=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let M=y,D=b;M<D;M+=3){const R=M,A=M+1,T=M+2;r=Mr(this,d,e,i,c,h,u,R,A,T),r&&(r.faceIndex=Math.floor(M/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{const g=Math.max(0,f.start),_=Math.min(l.count,f.start+f.count);for(let m=g,d=_;m<d;m+=3){const y=m,b=m+1,M=m+2;r=Mr(this,o,e,i,c,h,u,y,b,M),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}}}function Ih(n,e,t,i,r,s,o,a){let l;if(e.side===1?l=i.intersectTriangle(o,s,r,!0,a):l=i.intersectTriangle(r,s,o,e.side===0,a),l===null)return null;br.copy(a),br.applyMatrix4(n.matrixWorld);const c=t.ray.origin.distanceTo(br);return c<t.near||c>t.far?null:{distance:c,point:br.clone(),object:n}}function Mr(n,e,t,i,r,s,o,a,l,c){n.getVertexPosition(a,gr),n.getVertexPosition(l,_r),n.getVertexPosition(c,yr);const h=Ih(n,e,t,i,gr,_r,yr,ba);if(h){const u=new P;Yt.getBarycoord(ba,gr,_r,yr,u),r&&(h.uv=Yt.getInterpolatedAttribute(r,a,l,c,u,new ie)),s&&(h.uv1=Yt.getInterpolatedAttribute(s,a,l,c,u,new ie)),o&&(h.normal=Yt.getInterpolatedAttribute(o,a,l,c,u,new P),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));const p={a,b:l,c,normal:new P,materialIndex:0};Yt.getNormal(gr,_r,yr,p.normal),h.face=p,h.barycoord=u}return h}class Mt extends vt{constructor(e=1,t=1,i=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:r,heightSegments:s,depthSegments:o};const a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);const l=[],c=[],h=[],u=[];let p=0,f=0;g("z","y","x",-1,-1,i,t,e,o,s,0),g("z","y","x",1,-1,i,t,-e,o,s,1),g("x","z","y",1,1,e,i,t,r,o,2),g("x","z","y",1,-1,e,i,-t,r,o,3),g("x","y","z",1,-1,e,t,i,r,s,4),g("x","y","z",-1,-1,e,t,-i,r,s,5),this.setIndex(l),this.setAttribute("position",new Ye(c,3)),this.setAttribute("normal",new Ye(h,3)),this.setAttribute("uv",new Ye(u,2));function g(_,m,d,y,b,M,D,R,A,T,S){const x=M/A,v=D/T,I=M/2,U=D/2,B=R/2,q=A+1,z=T+1;let Y=0,N=0;const j=new P;for(let he=0;he<z;he++){const K=he*v-U;for(let ce=0;ce<q;ce++){const we=ce*x-I;j[_]=we*y,j[m]=K*b,j[d]=B,c.push(j.x,j.y,j.z),j[_]=0,j[m]=0,j[d]=R>0?1:-1,h.push(j.x,j.y,j.z),u.push(ce/A),u.push(1-he/T),Y+=1}}for(let he=0;he<T;he++)for(let K=0;K<A;K++){const ce=p+K+q*he,we=p+K+q*(he+1),W=p+(K+1)+q*(he+1),se=p+(K+1)+q*he;l.push(ce,we,se),l.push(we,W,se),N+=6}a.addGroup(f,N,S),f+=N,p+=Y}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Mt(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function vi(n){const e={};for(const t in n){e[t]={};for(const i in n[t]){const r=n[t][i];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=r.clone():Array.isArray(r)?e[t][i]=r.slice():e[t][i]=r}}return e}function Ft(n){const e={};for(let t=0;t<n.length;t++){const i=vi(n[t]);for(const r in i)e[r]=i[r]}return e}function Dh(n){const e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function Yl(n){const e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Qe.workingColorSpace}const Nh={clone:vi,merge:Ft};var Uh=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Fh=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Ln extends bn{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Uh,this.fragmentShader=Fh,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=vi(e.uniforms),this.uniformsGroups=Dh(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const r in this.uniforms){const o=this.uniforms[r].value;o&&o.isTexture?t.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[r]={type:"m4",value:o.toArray()}:t.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}}class ql extends yt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Be,this.projectionMatrix=new Be,this.projectionMatrixInverse=new Be,this.coordinateSystem=2e3}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Rn=new P,Ma=new ie,xa=new ie;class Vt extends ql{constructor(e=50,t=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=yi*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Yi*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return yi*2*Math.atan(Math.tan(Yi*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){Rn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Rn.x,Rn.y).multiplyScalar(-e/Rn.z),Rn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Rn.x,Rn.y).multiplyScalar(-e/Rn.z)}getViewSize(e,t){return this.getViewBounds(e,Ma,xa),t.subVectors(xa,Ma)}setViewOffset(e,t,i,r,s,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Yi*.5*this.fov)/this.zoom,i=2*t,r=this.aspect*i,s=-.5*r;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;s+=o.offsetX*r/l,t-=o.offsetY*i/c,r*=o.width/l,i*=o.height/c}const a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const ii=-90,ri=1;class kh extends yt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new Vt(ii,ri,e,t);r.layers=this.layers,this.add(r);const s=new Vt(ii,ri,e,t);s.layers=this.layers,this.add(s);const o=new Vt(ii,ri,e,t);o.layers=this.layers,this.add(o);const a=new Vt(ii,ri,e,t);a.layers=this.layers,this.add(a);const l=new Vt(ii,ri,e,t);l.layers=this.layers,this.add(l);const c=new Vt(ii,ri,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,r,s,o,a,l]=t;for(const c of t)this.remove(c);if(e===2e3)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===2001)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,o,a,l,c,h]=this.children,u=e.getRenderTarget(),p=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const _=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,r),e.render(t,s),e.setRenderTarget(i,1,r),e.render(t,o),e.setRenderTarget(i,2,r),e.render(t,a),e.setRenderTarget(i,3,r),e.render(t,l),e.setRenderTarget(i,4,r),e.render(t,c),i.texture.generateMipmaps=_,e.setRenderTarget(i,5,r),e.render(t,h),e.setRenderTarget(u,p,f),e.xr.enabled=g,i.texture.needsPMREMUpdate=!0}}class jl extends Ct{constructor(e,t,i,r,s,o,a,l,c,h){e=e!==void 0?e:[],t=t!==void 0?t:301,super(e,t,i,r,s,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Oh extends Wn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];this.texture=new jl(r,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:1006}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new Mt(5,5,5),s=new Ln({name:"CubemapFromEquirect",uniforms:vi(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:1,blending:0});s.uniforms.tEquirect.value=t;const o=new ht(r,s),a=t.minFilter;return t.minFilter===1008&&(t.minFilter=1006),new kh(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,i,r){const s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,r);e.setRenderTarget(s)}}const Ds=new P,Bh=new P,zh=new He;class zn{constructor(e=new P(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,r){return this.normal.set(e,t,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const r=Ds.subVectors(i,t).cross(Bh.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const i=e.delta(Ds),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:t.copy(e.start).addScaledVector(i,s)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||zh.getNormalMatrix(e),r=this.coplanarPoint(Ds).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const kn=new vn,xr=new P;class Ro{constructor(e=new zn,t=new zn,i=new zn,r=new zn,s=new zn,o=new zn){this.planes=[e,t,i,r,s,o]}set(e,t,i,r,s,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=2e3){const i=this.planes,r=e.elements,s=r[0],o=r[1],a=r[2],l=r[3],c=r[4],h=r[5],u=r[6],p=r[7],f=r[8],g=r[9],_=r[10],m=r[11],d=r[12],y=r[13],b=r[14],M=r[15];if(i[0].setComponents(l-s,p-c,m-f,M-d).normalize(),i[1].setComponents(l+s,p+c,m+f,M+d).normalize(),i[2].setComponents(l+o,p+h,m+g,M+y).normalize(),i[3].setComponents(l-o,p-h,m-g,M-y).normalize(),i[4].setComponents(l-a,p-u,m-_,M-b).normalize(),t===2e3)i[5].setComponents(l+a,p+u,m+_,M+b).normalize();else if(t===2001)i[5].setComponents(a,u,_,b).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),kn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),kn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(kn)}intersectsSprite(e){return kn.center.set(0,0,0),kn.radius=.7071067811865476,kn.applyMatrix4(e.matrixWorld),this.intersectsSphere(kn)}intersectsSphere(e){const t=this.planes,i=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const r=t[i];if(xr.x=r.normal.x>0?e.max.x:e.min.x,xr.y=r.normal.y>0?e.max.y:e.min.y,xr.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(xr)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Kl(){let n=null,e=!1,t=null,i=null;function r(s,o){t(s,o),i=n.requestAnimationFrame(r)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(r),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){n=s}}}function Gh(n){const e=new WeakMap;function t(a,l){const c=a.array,h=a.usage,u=c.byteLength,p=n.createBuffer();n.bindBuffer(l,p),n.bufferData(l,c,h),a.onUploadCallback();let f;if(c instanceof Float32Array)f=n.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=n.HALF_FLOAT:f=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=n.SHORT;else if(c instanceof Uint32Array)f=n.UNSIGNED_INT;else if(c instanceof Int32Array)f=n.INT;else if(c instanceof Int8Array)f=n.BYTE;else if(c instanceof Uint8Array)f=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:p,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function i(a,l,c){const h=l.array,u=l.updateRanges;if(n.bindBuffer(c,a),u.length===0)n.bufferSubData(c,0,h);else{u.sort((f,g)=>f.start-g.start);let p=0;for(let f=1;f<u.length;f++){const g=u[p],_=u[f];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++p,u[p]=_)}u.length=p+1;for(let f=0,g=u.length;f<g;f++){const _=u[f];n.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function s(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=e.get(a);l&&(n.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const h=e.get(a);(!h||h.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,a,l),c.version=a.version}}return{get:r,remove:s,update:o}}class nr extends vt{constructor(e=1,t=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:r};const s=e/2,o=t/2,a=Math.floor(i),l=Math.floor(r),c=a+1,h=l+1,u=e/a,p=t/l,f=[],g=[],_=[],m=[];for(let d=0;d<h;d++){const y=d*p-o;for(let b=0;b<c;b++){const M=b*u-s;g.push(M,-y,0),_.push(0,0,1),m.push(b/a),m.push(1-d/l)}}for(let d=0;d<l;d++)for(let y=0;y<a;y++){const b=y+c*d,M=y+c*(d+1),D=y+1+c*(d+1),R=y+1+c*d;f.push(b,M,R),f.push(M,D,R)}this.setIndex(f),this.setAttribute("position",new Ye(g,3)),this.setAttribute("normal",new Ye(_,3)),this.setAttribute("uv",new Ye(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new nr(e.width,e.height,e.widthSegments,e.heightSegments)}}var Vh=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Hh=`#ifdef USE_ALPHAHASH
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
#endif`,Wh=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Xh=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Yh=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,qh=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,jh=`#ifdef USE_AOMAP
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
#endif`,Kh=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Jh=`#ifdef USE_BATCHING
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
#endif`,Zh=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,$h=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Qh=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,eu=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,tu=`#ifdef USE_IRIDESCENCE
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
#endif`,nu=`#ifdef USE_BUMPMAP
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
#endif`,iu=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,ru=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,su=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,ou=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,au=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,lu=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,cu=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,hu=`#if defined( USE_COLOR_ALPHA )
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
#endif`,uu=`#define PI 3.141592653589793
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
} // validated`,du=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,fu=`vec3 transformedNormal = objectNormal;
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
#endif`,pu=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,mu=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,gu=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,_u=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,yu="gl_FragColor = linearToOutputTexel( gl_FragColor );",vu=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,bu=`#ifdef USE_ENVMAP
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
#endif`,Mu=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,xu=`#ifdef USE_ENVMAP
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
#endif`,Su=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,wu=`#ifdef USE_ENVMAP
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
#endif`,Tu=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Eu=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Au=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Ru=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Cu=`#ifdef USE_GRADIENTMAP
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
}`,Pu=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Lu=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Iu=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Du=`uniform bool receiveShadow;
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
#endif`,Nu=`#ifdef USE_ENVMAP
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
#endif`,Uu=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Fu=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,ku=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Ou=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Bu=`PhysicalMaterial material;
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
#endif`,zu=`struct PhysicalMaterial {
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
}`,Gu=`
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
#endif`,Vu=`#if defined( RE_IndirectDiffuse )
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
#endif`,Hu=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Wu=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Xu=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Yu=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,qu=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,ju=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Ku=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Ju=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Zu=`#if defined( USE_POINTS_UV )
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
#endif`,$u=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Qu=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,ed=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,td=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,nd=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,id=`#ifdef USE_MORPHTARGETS
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
#endif`,rd=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,sd=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,od=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,ad=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,ld=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,cd=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,hd=`#ifdef USE_NORMALMAP
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
#endif`,ud=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,dd=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,fd=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,pd=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,md=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,gd=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,_d=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,yd=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,vd=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,bd=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Md=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,xd=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Sd=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,wd=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Td=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Ed=`float getShadowMask() {
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
}`,Ad=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Rd=`#ifdef USE_SKINNING
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
#endif`,Cd=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Pd=`#ifdef USE_SKINNING
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
#endif`,Ld=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Id=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Dd=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Nd=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Ud=`#ifdef USE_TRANSMISSION
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
#endif`,Fd=`#ifdef USE_TRANSMISSION
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
#endif`,kd=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Od=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Bd=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,zd=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Gd=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Vd=`uniform sampler2D t2D;
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
}`,Hd=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Wd=`#ifdef ENVMAP_TYPE_CUBE
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
}`,Xd=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Yd=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,qd=`#include <common>
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
}`,jd=`#if DEPTH_PACKING == 3200
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
}`,Kd=`#define DISTANCE
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
}`,Jd=`#define DISTANCE
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
}`,Zd=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,$d=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Qd=`uniform float scale;
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
}`,ef=`uniform vec3 diffuse;
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
}`,tf=`#include <common>
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
}`,nf=`uniform vec3 diffuse;
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
}`,rf=`#define LAMBERT
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
}`,sf=`#define LAMBERT
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
}`,of=`#define MATCAP
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
}`,af=`#define MATCAP
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
}`,lf=`#define NORMAL
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
}`,cf=`#define NORMAL
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
}`,hf=`#define PHONG
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
}`,uf=`#define PHONG
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
}`,df=`#define STANDARD
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
}`,ff=`#define STANDARD
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
}`,pf=`#define TOON
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
}`,mf=`#define TOON
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
}`,gf=`uniform float size;
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
}`,_f=`uniform vec3 diffuse;
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
}`,yf=`#include <common>
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
}`,vf=`uniform vec3 color;
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
}`,bf=`uniform float rotation;
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
}`,Mf=`uniform vec3 diffuse;
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
}`,ze={alphahash_fragment:Vh,alphahash_pars_fragment:Hh,alphamap_fragment:Wh,alphamap_pars_fragment:Xh,alphatest_fragment:Yh,alphatest_pars_fragment:qh,aomap_fragment:jh,aomap_pars_fragment:Kh,batching_pars_vertex:Jh,batching_vertex:Zh,begin_vertex:$h,beginnormal_vertex:Qh,bsdfs:eu,iridescence_fragment:tu,bumpmap_pars_fragment:nu,clipping_planes_fragment:iu,clipping_planes_pars_fragment:ru,clipping_planes_pars_vertex:su,clipping_planes_vertex:ou,color_fragment:au,color_pars_fragment:lu,color_pars_vertex:cu,color_vertex:hu,common:uu,cube_uv_reflection_fragment:du,defaultnormal_vertex:fu,displacementmap_pars_vertex:pu,displacementmap_vertex:mu,emissivemap_fragment:gu,emissivemap_pars_fragment:_u,colorspace_fragment:yu,colorspace_pars_fragment:vu,envmap_fragment:bu,envmap_common_pars_fragment:Mu,envmap_pars_fragment:xu,envmap_pars_vertex:Su,envmap_physical_pars_fragment:Nu,envmap_vertex:wu,fog_vertex:Tu,fog_pars_vertex:Eu,fog_fragment:Au,fog_pars_fragment:Ru,gradientmap_pars_fragment:Cu,lightmap_pars_fragment:Pu,lights_lambert_fragment:Lu,lights_lambert_pars_fragment:Iu,lights_pars_begin:Du,lights_toon_fragment:Uu,lights_toon_pars_fragment:Fu,lights_phong_fragment:ku,lights_phong_pars_fragment:Ou,lights_physical_fragment:Bu,lights_physical_pars_fragment:zu,lights_fragment_begin:Gu,lights_fragment_maps:Vu,lights_fragment_end:Hu,logdepthbuf_fragment:Wu,logdepthbuf_pars_fragment:Xu,logdepthbuf_pars_vertex:Yu,logdepthbuf_vertex:qu,map_fragment:ju,map_pars_fragment:Ku,map_particle_fragment:Ju,map_particle_pars_fragment:Zu,metalnessmap_fragment:$u,metalnessmap_pars_fragment:Qu,morphinstance_vertex:ed,morphcolor_vertex:td,morphnormal_vertex:nd,morphtarget_pars_vertex:id,morphtarget_vertex:rd,normal_fragment_begin:sd,normal_fragment_maps:od,normal_pars_fragment:ad,normal_pars_vertex:ld,normal_vertex:cd,normalmap_pars_fragment:hd,clearcoat_normal_fragment_begin:ud,clearcoat_normal_fragment_maps:dd,clearcoat_pars_fragment:fd,iridescence_pars_fragment:pd,opaque_fragment:md,packing:gd,premultiplied_alpha_fragment:_d,project_vertex:yd,dithering_fragment:vd,dithering_pars_fragment:bd,roughnessmap_fragment:Md,roughnessmap_pars_fragment:xd,shadowmap_pars_fragment:Sd,shadowmap_pars_vertex:wd,shadowmap_vertex:Td,shadowmask_pars_fragment:Ed,skinbase_vertex:Ad,skinning_pars_vertex:Rd,skinning_vertex:Cd,skinnormal_vertex:Pd,specularmap_fragment:Ld,specularmap_pars_fragment:Id,tonemapping_fragment:Dd,tonemapping_pars_fragment:Nd,transmission_fragment:Ud,transmission_pars_fragment:Fd,uv_pars_fragment:kd,uv_pars_vertex:Od,uv_vertex:Bd,worldpos_vertex:zd,background_vert:Gd,background_frag:Vd,backgroundCube_vert:Hd,backgroundCube_frag:Wd,cube_vert:Xd,cube_frag:Yd,depth_vert:qd,depth_frag:jd,distanceRGBA_vert:Kd,distanceRGBA_frag:Jd,equirect_vert:Zd,equirect_frag:$d,linedashed_vert:Qd,linedashed_frag:ef,meshbasic_vert:tf,meshbasic_frag:nf,meshlambert_vert:rf,meshlambert_frag:sf,meshmatcap_vert:of,meshmatcap_frag:af,meshnormal_vert:lf,meshnormal_frag:cf,meshphong_vert:hf,meshphong_frag:uf,meshphysical_vert:df,meshphysical_frag:ff,meshtoon_vert:pf,meshtoon_frag:mf,points_vert:gf,points_frag:_f,shadow_vert:yf,shadow_frag:vf,sprite_vert:bf,sprite_frag:Mf},fe={common:{diffuse:{value:new Ie(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new He},alphaMap:{value:null},alphaMapTransform:{value:new He},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new He}},envmap:{envMap:{value:null},envMapRotation:{value:new He},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new He}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new He}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new He},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new He},normalScale:{value:new ie(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new He},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new He}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new He}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new He}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ie(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ie(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new He},alphaTest:{value:0},uvTransform:{value:new He}},sprite:{diffuse:{value:new Ie(16777215)},opacity:{value:1},center:{value:new ie(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new He},alphaMap:{value:null},alphaMapTransform:{value:new He},alphaTest:{value:0}}},sn={basic:{uniforms:Ft([fe.common,fe.specularmap,fe.envmap,fe.aomap,fe.lightmap,fe.fog]),vertexShader:ze.meshbasic_vert,fragmentShader:ze.meshbasic_frag},lambert:{uniforms:Ft([fe.common,fe.specularmap,fe.envmap,fe.aomap,fe.lightmap,fe.emissivemap,fe.bumpmap,fe.normalmap,fe.displacementmap,fe.fog,fe.lights,{emissive:{value:new Ie(0)}}]),vertexShader:ze.meshlambert_vert,fragmentShader:ze.meshlambert_frag},phong:{uniforms:Ft([fe.common,fe.specularmap,fe.envmap,fe.aomap,fe.lightmap,fe.emissivemap,fe.bumpmap,fe.normalmap,fe.displacementmap,fe.fog,fe.lights,{emissive:{value:new Ie(0)},specular:{value:new Ie(1118481)},shininess:{value:30}}]),vertexShader:ze.meshphong_vert,fragmentShader:ze.meshphong_frag},standard:{uniforms:Ft([fe.common,fe.envmap,fe.aomap,fe.lightmap,fe.emissivemap,fe.bumpmap,fe.normalmap,fe.displacementmap,fe.roughnessmap,fe.metalnessmap,fe.fog,fe.lights,{emissive:{value:new Ie(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ze.meshphysical_vert,fragmentShader:ze.meshphysical_frag},toon:{uniforms:Ft([fe.common,fe.aomap,fe.lightmap,fe.emissivemap,fe.bumpmap,fe.normalmap,fe.displacementmap,fe.gradientmap,fe.fog,fe.lights,{emissive:{value:new Ie(0)}}]),vertexShader:ze.meshtoon_vert,fragmentShader:ze.meshtoon_frag},matcap:{uniforms:Ft([fe.common,fe.bumpmap,fe.normalmap,fe.displacementmap,fe.fog,{matcap:{value:null}}]),vertexShader:ze.meshmatcap_vert,fragmentShader:ze.meshmatcap_frag},points:{uniforms:Ft([fe.points,fe.fog]),vertexShader:ze.points_vert,fragmentShader:ze.points_frag},dashed:{uniforms:Ft([fe.common,fe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ze.linedashed_vert,fragmentShader:ze.linedashed_frag},depth:{uniforms:Ft([fe.common,fe.displacementmap]),vertexShader:ze.depth_vert,fragmentShader:ze.depth_frag},normal:{uniforms:Ft([fe.common,fe.bumpmap,fe.normalmap,fe.displacementmap,{opacity:{value:1}}]),vertexShader:ze.meshnormal_vert,fragmentShader:ze.meshnormal_frag},sprite:{uniforms:Ft([fe.sprite,fe.fog]),vertexShader:ze.sprite_vert,fragmentShader:ze.sprite_frag},background:{uniforms:{uvTransform:{value:new He},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ze.background_vert,fragmentShader:ze.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new He}},vertexShader:ze.backgroundCube_vert,fragmentShader:ze.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ze.cube_vert,fragmentShader:ze.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ze.equirect_vert,fragmentShader:ze.equirect_frag},distanceRGBA:{uniforms:Ft([fe.common,fe.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ze.distanceRGBA_vert,fragmentShader:ze.distanceRGBA_frag},shadow:{uniforms:Ft([fe.lights,fe.fog,{color:{value:new Ie(0)},opacity:{value:1}}]),vertexShader:ze.shadow_vert,fragmentShader:ze.shadow_frag}};sn.physical={uniforms:Ft([sn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new He},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new He},clearcoatNormalScale:{value:new ie(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new He},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new He},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new He},sheen:{value:0},sheenColor:{value:new Ie(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new He},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new He},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new He},transmissionSamplerSize:{value:new ie},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new He},attenuationDistance:{value:0},attenuationColor:{value:new Ie(0)},specularColor:{value:new Ie(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new He},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new He},anisotropyVector:{value:new ie},anisotropyMap:{value:null},anisotropyMapTransform:{value:new He}}]),vertexShader:ze.meshphysical_vert,fragmentShader:ze.meshphysical_frag};const Sr={r:0,b:0,g:0},On=new tn,xf=new Be;function Sf(n,e,t,i,r,s,o){const a=new Ie(0);let l=s===!0?0:1,c,h,u=null,p=0,f=null;function g(y){let b=y.isScene===!0?y.background:null;return b&&b.isTexture&&(b=(y.backgroundBlurriness>0?t:e).get(b)),b}function _(y){let b=!1;const M=g(y);M===null?d(a,l):M&&M.isColor&&(d(M,1),b=!0);const D=n.xr.getEnvironmentBlendMode();D==="additive"?i.buffers.color.setClear(0,0,0,1,o):D==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(n.autoClear||b)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function m(y,b){const M=g(b);M&&(M.isCubeTexture||M.mapping===306)?(h===void 0&&(h=new ht(new Mt(1,1,1),new Ln({name:"BackgroundCubeMaterial",uniforms:vi(sn.backgroundCube.uniforms),vertexShader:sn.backgroundCube.vertexShader,fragmentShader:sn.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(D,R,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(h)),On.copy(b.backgroundRotation),On.x*=-1,On.y*=-1,On.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(On.y*=-1,On.z*=-1),h.material.uniforms.envMap.value=M,h.material.uniforms.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=b.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(xf.makeRotationFromEuler(On)),h.material.toneMapped=Qe.getTransfer(M.colorSpace)!==at,(u!==M||p!==M.version||f!==n.toneMapping)&&(h.material.needsUpdate=!0,u=M,p=M.version,f=n.toneMapping),h.layers.enableAll(),y.unshift(h,h.geometry,h.material,0,0,null)):M&&M.isTexture&&(c===void 0&&(c=new ht(new nr(2,2),new Ln({name:"BackgroundMaterial",uniforms:vi(sn.background.uniforms),vertexShader:sn.background.vertexShader,fragmentShader:sn.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=M,c.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,c.material.toneMapped=Qe.getTransfer(M.colorSpace)!==at,M.matrixAutoUpdate===!0&&M.updateMatrix(),c.material.uniforms.uvTransform.value.copy(M.matrix),(u!==M||p!==M.version||f!==n.toneMapping)&&(c.material.needsUpdate=!0,u=M,p=M.version,f=n.toneMapping),c.layers.enableAll(),y.unshift(c,c.geometry,c.material,0,0,null))}function d(y,b){y.getRGB(Sr,Yl(n)),i.buffers.color.setClear(Sr.r,Sr.g,Sr.b,b,o)}return{getClearColor:function(){return a},setClearColor:function(y,b=1){a.set(y),l=b,d(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(y){l=y,d(a,l)},render:_,addToRenderList:m}}function wf(n,e){const t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},r=p(null);let s=r,o=!1;function a(x,v,I,U,B){let q=!1;const z=u(U,I,v);s!==z&&(s=z,c(s.object)),q=f(x,U,I,B),q&&g(x,U,I,B),B!==null&&e.update(B,n.ELEMENT_ARRAY_BUFFER),(q||o)&&(o=!1,M(x,v,I,U),B!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(B).buffer))}function l(){return n.createVertexArray()}function c(x){return n.bindVertexArray(x)}function h(x){return n.deleteVertexArray(x)}function u(x,v,I){const U=I.wireframe===!0;let B=i[x.id];B===void 0&&(B={},i[x.id]=B);let q=B[v.id];q===void 0&&(q={},B[v.id]=q);let z=q[U];return z===void 0&&(z=p(l()),q[U]=z),z}function p(x){const v=[],I=[],U=[];for(let B=0;B<t;B++)v[B]=0,I[B]=0,U[B]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:v,enabledAttributes:I,attributeDivisors:U,object:x,attributes:{},index:null}}function f(x,v,I,U){const B=s.attributes,q=v.attributes;let z=0;const Y=I.getAttributes();for(const N in Y)if(Y[N].location>=0){const he=B[N];let K=q[N];if(K===void 0&&(N==="instanceMatrix"&&x.instanceMatrix&&(K=x.instanceMatrix),N==="instanceColor"&&x.instanceColor&&(K=x.instanceColor)),he===void 0||he.attribute!==K||K&&he.data!==K.data)return!0;z++}return s.attributesNum!==z||s.index!==U}function g(x,v,I,U){const B={},q=v.attributes;let z=0;const Y=I.getAttributes();for(const N in Y)if(Y[N].location>=0){let he=q[N];he===void 0&&(N==="instanceMatrix"&&x.instanceMatrix&&(he=x.instanceMatrix),N==="instanceColor"&&x.instanceColor&&(he=x.instanceColor));const K={};K.attribute=he,he&&he.data&&(K.data=he.data),B[N]=K,z++}s.attributes=B,s.attributesNum=z,s.index=U}function _(){const x=s.newAttributes;for(let v=0,I=x.length;v<I;v++)x[v]=0}function m(x){d(x,0)}function d(x,v){const I=s.newAttributes,U=s.enabledAttributes,B=s.attributeDivisors;I[x]=1,U[x]===0&&(n.enableVertexAttribArray(x),U[x]=1),B[x]!==v&&(n.vertexAttribDivisor(x,v),B[x]=v)}function y(){const x=s.newAttributes,v=s.enabledAttributes;for(let I=0,U=v.length;I<U;I++)v[I]!==x[I]&&(n.disableVertexAttribArray(I),v[I]=0)}function b(x,v,I,U,B,q,z){z===!0?n.vertexAttribIPointer(x,v,I,B,q):n.vertexAttribPointer(x,v,I,U,B,q)}function M(x,v,I,U){_();const B=U.attributes,q=I.getAttributes(),z=v.defaultAttributeValues;for(const Y in q){const N=q[Y];if(N.location>=0){let j=B[Y];if(j===void 0&&(Y==="instanceMatrix"&&x.instanceMatrix&&(j=x.instanceMatrix),Y==="instanceColor"&&x.instanceColor&&(j=x.instanceColor)),j!==void 0){const he=j.normalized,K=j.itemSize,ce=e.get(j);if(ce===void 0)continue;const we=ce.buffer,W=ce.type,se=ce.bytesPerElement,re=W===n.INT||W===n.UNSIGNED_INT||j.gpuType===1013;if(j.isInterleavedBufferAttribute){const oe=j.data,Ce=oe.stride,Fe=j.offset;if(oe.isInstancedInterleavedBuffer){for(let Le=0;Le<N.locationSize;Le++)d(N.location+Le,oe.meshPerAttribute);x.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=oe.meshPerAttribute*oe.count)}else for(let Le=0;Le<N.locationSize;Le++)m(N.location+Le);n.bindBuffer(n.ARRAY_BUFFER,we);for(let Le=0;Le<N.locationSize;Le++)b(N.location+Le,K/N.locationSize,W,he,Ce*se,(Fe+K/N.locationSize*Le)*se,re)}else{if(j.isInstancedBufferAttribute){for(let oe=0;oe<N.locationSize;oe++)d(N.location+oe,j.meshPerAttribute);x.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=j.meshPerAttribute*j.count)}else for(let oe=0;oe<N.locationSize;oe++)m(N.location+oe);n.bindBuffer(n.ARRAY_BUFFER,we);for(let oe=0;oe<N.locationSize;oe++)b(N.location+oe,K/N.locationSize,W,he,K*se,K/N.locationSize*oe*se,re)}}else if(z!==void 0){const he=z[Y];if(he!==void 0)switch(he.length){case 2:n.vertexAttrib2fv(N.location,he);break;case 3:n.vertexAttrib3fv(N.location,he);break;case 4:n.vertexAttrib4fv(N.location,he);break;default:n.vertexAttrib1fv(N.location,he)}}}}y()}function D(){T();for(const x in i){const v=i[x];for(const I in v){const U=v[I];for(const B in U)h(U[B].object),delete U[B];delete v[I]}delete i[x]}}function R(x){if(i[x.id]===void 0)return;const v=i[x.id];for(const I in v){const U=v[I];for(const B in U)h(U[B].object),delete U[B];delete v[I]}delete i[x.id]}function A(x){for(const v in i){const I=i[v];if(I[x.id]===void 0)continue;const U=I[x.id];for(const B in U)h(U[B].object),delete U[B];delete I[x.id]}}function T(){S(),o=!0,s!==r&&(s=r,c(s.object))}function S(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:a,reset:T,resetDefaultState:S,dispose:D,releaseStatesOfGeometry:R,releaseStatesOfProgram:A,initAttributes:_,enableAttribute:m,disableUnusedAttributes:y}}function Tf(n,e,t){let i;function r(c){i=c}function s(c,h){n.drawArrays(i,c,h),t.update(h,i,1)}function o(c,h,u){u!==0&&(n.drawArraysInstanced(i,c,h,u),t.update(h,i,u))}function a(c,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,h,0,u);let f=0;for(let g=0;g<u;g++)f+=h[g];t.update(f,i,1)}function l(c,h,u,p){if(u===0)return;const f=e.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<c.length;g++)o(c[g],h[g],p[g]);else{f.multiDrawArraysInstancedWEBGL(i,c,0,h,0,p,0,u);let g=0;for(let _=0;_<u;_++)g+=h[_]*p[_];t.update(g,i,1)}}this.setMode=r,this.render=s,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function Ef(n,e,t,i){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){const A=e.get("EXT_texture_filter_anisotropic");r=n.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function o(A){return!(A!==1023&&i.convert(A)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(A){const T=A===1016&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==1009&&i.convert(A)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==1015&&!T)}function l(A){if(A==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const u=t.logarithmicDepthBuffer===!0,p=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),f=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),g=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=n.getParameter(n.MAX_TEXTURE_SIZE),m=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),d=n.getParameter(n.MAX_VERTEX_ATTRIBS),y=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),b=n.getParameter(n.MAX_VARYING_VECTORS),M=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),D=g>0,R=n.getParameter(n.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:u,reverseDepthBuffer:p,maxTextures:f,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:m,maxAttributes:d,maxVertexUniforms:y,maxVaryings:b,maxFragmentUniforms:M,vertexTextures:D,maxSamples:R}}function Af(n){const e=this;let t=null,i=0,r=!1,s=!1;const o=new zn,a=new He,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,p){const f=u.length!==0||p||i!==0||r;return r=p,i=u.length,f},this.beginShadows=function(){s=!0,h(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(u,p){t=h(u,p,0)},this.setState=function(u,p,f){const g=u.clippingPlanes,_=u.clipIntersection,m=u.clipShadows,d=n.get(u);if(!r||g===null||g.length===0||s&&!m)s?h(null):c();else{const y=s?0:i,b=y*4;let M=d.clippingState||null;l.value=M,M=h(g,p,b,f);for(let D=0;D!==b;++D)M[D]=t[D];d.clippingState=M,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=y}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function h(u,p,f,g){const _=u!==null?u.length:0;let m=null;if(_!==0){if(m=l.value,g!==!0||m===null){const d=f+_*4,y=p.matrixWorldInverse;a.getNormalMatrix(y),(m===null||m.length<d)&&(m=new Float32Array(d));for(let b=0,M=f;b!==_;++b,M+=4)o.copy(u[b]).applyMatrix4(y,a),o.normal.toArray(m,M),m[M+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,m}}function Rf(n){let e=new WeakMap;function t(o,a){return a===303?o.mapping=301:a===304&&(o.mapping=302),o}function i(o){if(o&&o.isTexture){const a=o.mapping;if(a===303||a===304)if(e.has(o)){const l=e.get(o).texture;return t(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new Oh(l.height);return c.fromEquirectangularTexture(n,o),e.set(o,c),o.addEventListener("dispose",r),t(c.texture,o.mapping)}else return null}}return o}function r(o){const a=o.target;a.removeEventListener("dispose",r);const l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function s(){e=new WeakMap}return{get:i,dispose:s}}class Jl extends ql{constructor(e=-1,t=1,i=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let s=i-e,o=i+e,a=r+t,l=r-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,o=s+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const di=4,Sa=[.125,.215,.35,.446,.526,.582],Vn=20,Ns=new Jl,wa=new Ie;let Us=null,Fs=0,ks=0,Os=!1;const Gn=(1+Math.sqrt(5))/2,si=1/Gn,Ta=[new P(-Gn,si,0),new P(Gn,si,0),new P(-si,0,Gn),new P(si,0,Gn),new P(0,Gn,-si),new P(0,Gn,si),new P(-1,1,-1),new P(1,1,-1),new P(-1,1,1),new P(1,1,1)];class Ea{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,r=100){Us=this._renderer.getRenderTarget(),Fs=this._renderer.getActiveCubeFace(),ks=this._renderer.getActiveMipmapLevel(),Os=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,i,r,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Ca(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Ra(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Us,Fs,ks),this._renderer.xr.enabled=Os,e.scissorTest=!1,wr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Us=this._renderer.getRenderTarget(),Fs=this._renderer.getActiveCubeFace(),ks=this._renderer.getActiveMipmapLevel(),Os=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:1006,minFilter:1006,generateMipmaps:!1,type:1016,format:1023,colorSpace:xi,depthBuffer:!1},r=Aa(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Aa(e,t,i);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Cf(s)),this._blurMaterial=Pf(s,e,t)}return r}_compileMaterial(e){const t=new ht(this._lodPlanes[0],e);this._renderer.compile(t,Ns)}_sceneToCubeUV(e,t,i,r){const a=new Vt(90,1,t,i),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,p=h.toneMapping;h.getClearColor(wa),h.toneMapping=0,h.autoClear=!1;const f=new Eo({name:"PMREM.Background",side:1,depthWrite:!1,depthTest:!1}),g=new ht(new Mt,f);let _=!1;const m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,_=!0):(f.color.copy(wa),_=!0);for(let d=0;d<6;d++){const y=d%3;y===0?(a.up.set(0,l[d],0),a.lookAt(c[d],0,0)):y===1?(a.up.set(0,0,l[d]),a.lookAt(0,c[d],0)):(a.up.set(0,l[d],0),a.lookAt(0,0,c[d]));const b=this._cubeSize;wr(r,y*b,d>2?b:0,b,b),h.setRenderTarget(r),_&&h.render(g,a),h.render(e,a)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=p,h.autoClear=u,e.background=m}_textureToCubeUV(e,t){const i=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=Ca()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Ra());const s=r?this._cubemapMaterial:this._equirectMaterial,o=new ht(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=e;const l=this._cubeSize;wr(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(o,Ns)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const r=this._lodPlanes.length;for(let s=1;s<r;s++){const o=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),a=Ta[(r-s-1)%Ta.length];this._blur(e,s-1,s,o,a)}t.autoClear=i}_blur(e,t,i,r,s){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,i,r,"latitudinal",s),this._halfBlur(o,e,i,i,r,"longitudinal",s)}_halfBlur(e,t,i,r,s,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new ht(this._lodPlanes[r],c),p=c.uniforms,f=this._sizeLods[i]-1,g=isFinite(s)?Math.PI/(2*f):2*Math.PI/(2*Vn-1),_=s/g,m=isFinite(s)?1+Math.floor(h*_):Vn;m>Vn&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Vn}`);const d=[];let y=0;for(let A=0;A<Vn;++A){const T=A/_,S=Math.exp(-T*T/2);d.push(S),A===0?y+=S:A<m&&(y+=2*S)}for(let A=0;A<d.length;A++)d[A]=d[A]/y;p.envMap.value=e.texture,p.samples.value=m,p.weights.value=d,p.latitudinal.value=o==="latitudinal",a&&(p.poleAxis.value=a);const{_lodMax:b}=this;p.dTheta.value=g,p.mipInt.value=b-i;const M=this._sizeLods[r],D=3*M*(r>b-di?r-b+di:0),R=4*(this._cubeSize-M);wr(t,D,R,3*M,2*M),l.setRenderTarget(t),l.render(u,Ns)}}function Cf(n){const e=[],t=[],i=[];let r=n;const s=n-di+1+Sa.length;for(let o=0;o<s;o++){const a=Math.pow(2,r);t.push(a);let l=1/a;o>n-di?l=Sa[o-n+di-1]:o===0&&(l=0),i.push(l);const c=1/(a-2),h=-c,u=1+c,p=[h,h,u,h,u,u,h,h,u,u,h,u],f=6,g=6,_=3,m=2,d=1,y=new Float32Array(_*g*f),b=new Float32Array(m*g*f),M=new Float32Array(d*g*f);for(let R=0;R<f;R++){const A=R%3*2/3-1,T=R>2?0:-1,S=[A,T,0,A+2/3,T,0,A+2/3,T+1,0,A,T,0,A+2/3,T+1,0,A,T+1,0];y.set(S,_*g*R),b.set(p,m*g*R);const x=[R,R,R,R,R,R];M.set(x,d*g*R)}const D=new vt;D.setAttribute("position",new Nt(y,_)),D.setAttribute("uv",new Nt(b,m)),D.setAttribute("faceIndex",new Nt(M,d)),e.push(D),r>di&&r--}return{lodPlanes:e,sizeLods:t,sigmas:i}}function Aa(n,e,t){const i=new Wn(n,e,t);return i.texture.mapping=306,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function wr(n,e,t,i,r){n.viewport.set(e,t,i,r),n.scissor.set(e,t,i,r)}function Pf(n,e,t){const i=new Float32Array(Vn),r=new P(0,1,0);return new Ln({name:"SphericalGaussianBlur",defines:{n:Vn,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:Co(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})}function Ra(){return new Ln({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Co(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})}function Ca(){return new Ln({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Co(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Co(){return`

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
	`}function Lf(n){let e=new WeakMap,t=null;function i(a){if(a&&a.isTexture){const l=a.mapping,c=l===303||l===304,h=l===301||l===302;if(c||h){let u=e.get(a);const p=u!==void 0?u.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==p)return t===null&&(t=new Ea(n)),u=c?t.fromEquirectangular(a,u):t.fromCubemap(a,u),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),u.texture;if(u!==void 0)return u.texture;{const f=a.image;return c&&f&&f.height>0||h&&f&&r(f)?(t===null&&(t=new Ea(n)),u=c?t.fromEquirectangular(a):t.fromCubemap(a),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),a.addEventListener("dispose",s),u.texture):null}}}return a}function r(a){let l=0;const c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function s(a){const l=a.target;l.removeEventListener("dispose",s);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:o}}function If(n){const e={};function t(i){if(e[i]!==void 0)return e[i];let r;switch(i){case"WEBGL_depth_texture":r=n.getExtension("WEBGL_depth_texture")||n.getExtension("MOZ_WEBGL_depth_texture")||n.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=n.getExtension("EXT_texture_filter_anisotropic")||n.getExtension("MOZ_EXT_texture_filter_anisotropic")||n.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=n.getExtension("WEBGL_compressed_texture_s3tc")||n.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=n.getExtension("WEBGL_compressed_texture_pvrtc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=n.getExtension(i)}return e[i]=r,r}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const r=t(i);return r===null&&Wi("THREE.WebGLRenderer: "+i+" extension not supported."),r}}}function Df(n,e,t,i){const r={},s=new WeakMap;function o(u){const p=u.target;p.index!==null&&e.remove(p.index);for(const g in p.attributes)e.remove(p.attributes[g]);for(const g in p.morphAttributes){const _=p.morphAttributes[g];for(let m=0,d=_.length;m<d;m++)e.remove(_[m])}p.removeEventListener("dispose",o),delete r[p.id];const f=s.get(p);f&&(e.remove(f),s.delete(p)),i.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,t.memory.geometries--}function a(u,p){return r[p.id]===!0||(p.addEventListener("dispose",o),r[p.id]=!0,t.memory.geometries++),p}function l(u){const p=u.attributes;for(const g in p)e.update(p[g],n.ARRAY_BUFFER);const f=u.morphAttributes;for(const g in f){const _=f[g];for(let m=0,d=_.length;m<d;m++)e.update(_[m],n.ARRAY_BUFFER)}}function c(u){const p=[],f=u.index,g=u.attributes.position;let _=0;if(f!==null){const y=f.array;_=f.version;for(let b=0,M=y.length;b<M;b+=3){const D=y[b+0],R=y[b+1],A=y[b+2];p.push(D,R,R,A,A,D)}}else if(g!==void 0){const y=g.array;_=g.version;for(let b=0,M=y.length/3-1;b<M;b+=3){const D=b+0,R=b+1,A=b+2;p.push(D,R,R,A,A,D)}}else return;const m=new(Gl(p)?Xl:Ao)(p,1);m.version=_;const d=s.get(u);d&&e.remove(d),s.set(u,m)}function h(u){const p=s.get(u);if(p){const f=u.index;f!==null&&p.version<f.version&&c(u)}else c(u);return s.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function Nf(n,e,t){let i;function r(p){i=p}let s,o;function a(p){s=p.type,o=p.bytesPerElement}function l(p,f){n.drawElements(i,f,s,p*o),t.update(f,i,1)}function c(p,f,g){g!==0&&(n.drawElementsInstanced(i,f,s,p*o,g),t.update(f,i,g))}function h(p,f,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,f,0,s,p,0,g);let m=0;for(let d=0;d<g;d++)m+=f[d];t.update(m,i,1)}function u(p,f,g,_){if(g===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let d=0;d<p.length;d++)c(p[d]/o,f[d],_[d]);else{m.multiDrawElementsInstancedWEBGL(i,f,0,s,p,0,_,0,g);let d=0;for(let y=0;y<g;y++)d+=f[y]*_[y];t.update(d,i,1)}}this.setMode=r,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function Uf(n){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,o,a){switch(t.calls++,o){case n.TRIANGLES:t.triangles+=a*(s/3);break;case n.LINES:t.lines+=a*(s/2);break;case n.LINE_STRIP:t.lines+=a*(s-1);break;case n.LINE_LOOP:t.lines+=a*s;break;case n.POINTS:t.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:i}}function Ff(n,e,t){const i=new WeakMap,r=new tt;function s(o,a,l){const c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0;let p=i.get(a);if(p===void 0||p.count!==u){let S=function(){A.dispose(),i.delete(a),a.removeEventListener("dispose",S)};p!==void 0&&p.texture.dispose();const f=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,_=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],d=a.morphAttributes.normal||[],y=a.morphAttributes.color||[];let b=0;f===!0&&(b=1),g===!0&&(b=2),_===!0&&(b=3);let M=a.attributes.position.count*b,D=1;M>e.maxTextureSize&&(D=Math.ceil(M/e.maxTextureSize),M=e.maxTextureSize);const R=new Float32Array(M*D*4*u),A=new Hl(R,M,D,u);A.type=1015,A.needsUpdate=!0;const T=b*4;for(let x=0;x<u;x++){const v=m[x],I=d[x],U=y[x],B=M*D*4*x;for(let q=0;q<v.count;q++){const z=q*T;f===!0&&(r.fromBufferAttribute(v,q),R[B+z+0]=r.x,R[B+z+1]=r.y,R[B+z+2]=r.z,R[B+z+3]=0),g===!0&&(r.fromBufferAttribute(I,q),R[B+z+4]=r.x,R[B+z+5]=r.y,R[B+z+6]=r.z,R[B+z+7]=0),_===!0&&(r.fromBufferAttribute(U,q),R[B+z+8]=r.x,R[B+z+9]=r.y,R[B+z+10]=r.z,R[B+z+11]=U.itemSize===4?r.w:1)}}p={count:u,texture:A,size:new ie(M,D)},i.set(a,p),a.addEventListener("dispose",S)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",o.morphTexture,t);else{let f=0;for(let _=0;_<c.length;_++)f+=c[_];const g=a.morphTargetsRelative?1:1-f;l.getUniforms().setValue(n,"morphTargetBaseInfluence",g),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",p.texture,t),l.getUniforms().setValue(n,"morphTargetsTextureSize",p.size)}return{update:s}}function kf(n,e,t,i){let r=new WeakMap;function s(l){const c=i.render.frame,h=l.geometry,u=e.get(l,h);if(r.get(u)!==c&&(e.update(u),r.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),r.get(l)!==c&&(t.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,n.ARRAY_BUFFER),r.set(l,c))),l.isSkinnedMesh){const p=l.skeleton;r.get(p)!==c&&(p.update(),r.set(p,c))}return u}function o(){r=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:s,dispose:o}}class Zl extends Ct{constructor(e,t,i,r,s,o,a,l,c,h=1026){if(h!==1026&&h!==1027)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&h===1026&&(i=1014),i===void 0&&h===1027&&(i=1020),super(null,r,s,o,a,l,h,i,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:1003,this.minFilter=l!==void 0?l:1003,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const $l=new Ct,Pa=new Zl(1,1),Ql=new Hl,ec=new vh,tc=new jl,La=[],Ia=[],Da=new Float32Array(16),Na=new Float32Array(9),Ua=new Float32Array(4);function wi(n,e,t){const i=n[0];if(i<=0||i>0)return n;const r=e*t;let s=La[r];if(s===void 0&&(s=new Float32Array(r),La[r]=s),e!==0){i.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=t,n[o].toArray(s,a)}return s}function Et(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function At(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function is(n,e){let t=Ia[e];t===void 0&&(t=new Int32Array(e),Ia[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function Of(n,e){const t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function Bf(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;n.uniform2fv(this.addr,e),At(t,e)}}function zf(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Et(t,e))return;n.uniform3fv(this.addr,e),At(t,e)}}function Gf(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;n.uniform4fv(this.addr,e),At(t,e)}}function Vf(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Et(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),At(t,e)}else{if(Et(t,i))return;Ua.set(i),n.uniformMatrix2fv(this.addr,!1,Ua),At(t,i)}}function Hf(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Et(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),At(t,e)}else{if(Et(t,i))return;Na.set(i),n.uniformMatrix3fv(this.addr,!1,Na),At(t,i)}}function Wf(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Et(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),At(t,e)}else{if(Et(t,i))return;Da.set(i),n.uniformMatrix4fv(this.addr,!1,Da),At(t,i)}}function Xf(n,e){const t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function Yf(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;n.uniform2iv(this.addr,e),At(t,e)}}function qf(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Et(t,e))return;n.uniform3iv(this.addr,e),At(t,e)}}function jf(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;n.uniform4iv(this.addr,e),At(t,e)}}function Kf(n,e){const t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function Jf(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;n.uniform2uiv(this.addr,e),At(t,e)}}function Zf(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Et(t,e))return;n.uniform3uiv(this.addr,e),At(t,e)}}function $f(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;n.uniform4uiv(this.addr,e),At(t,e)}}function Qf(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r);let s;this.type===n.SAMPLER_2D_SHADOW?(Pa.compareFunction=515,s=Pa):s=$l,t.setTexture2D(e||s,r)}function ep(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture3D(e||ec,r)}function tp(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTextureCube(e||tc,r)}function np(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture2DArray(e||Ql,r)}function ip(n){switch(n){case 5126:return Of;case 35664:return Bf;case 35665:return zf;case 35666:return Gf;case 35674:return Vf;case 35675:return Hf;case 35676:return Wf;case 5124:case 35670:return Xf;case 35667:case 35671:return Yf;case 35668:case 35672:return qf;case 35669:case 35673:return jf;case 5125:return Kf;case 36294:return Jf;case 36295:return Zf;case 36296:return $f;case 35678:case 36198:case 36298:case 36306:case 35682:return Qf;case 35679:case 36299:case 36307:return ep;case 35680:case 36300:case 36308:case 36293:return tp;case 36289:case 36303:case 36311:case 36292:return np}}function rp(n,e){n.uniform1fv(this.addr,e)}function sp(n,e){const t=wi(e,this.size,2);n.uniform2fv(this.addr,t)}function op(n,e){const t=wi(e,this.size,3);n.uniform3fv(this.addr,t)}function ap(n,e){const t=wi(e,this.size,4);n.uniform4fv(this.addr,t)}function lp(n,e){const t=wi(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function cp(n,e){const t=wi(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function hp(n,e){const t=wi(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function up(n,e){n.uniform1iv(this.addr,e)}function dp(n,e){n.uniform2iv(this.addr,e)}function fp(n,e){n.uniform3iv(this.addr,e)}function pp(n,e){n.uniform4iv(this.addr,e)}function mp(n,e){n.uniform1uiv(this.addr,e)}function gp(n,e){n.uniform2uiv(this.addr,e)}function _p(n,e){n.uniform3uiv(this.addr,e)}function yp(n,e){n.uniform4uiv(this.addr,e)}function vp(n,e,t){const i=this.cache,r=e.length,s=is(t,r);Et(i,s)||(n.uniform1iv(this.addr,s),At(i,s));for(let o=0;o!==r;++o)t.setTexture2D(e[o]||$l,s[o])}function bp(n,e,t){const i=this.cache,r=e.length,s=is(t,r);Et(i,s)||(n.uniform1iv(this.addr,s),At(i,s));for(let o=0;o!==r;++o)t.setTexture3D(e[o]||ec,s[o])}function Mp(n,e,t){const i=this.cache,r=e.length,s=is(t,r);Et(i,s)||(n.uniform1iv(this.addr,s),At(i,s));for(let o=0;o!==r;++o)t.setTextureCube(e[o]||tc,s[o])}function xp(n,e,t){const i=this.cache,r=e.length,s=is(t,r);Et(i,s)||(n.uniform1iv(this.addr,s),At(i,s));for(let o=0;o!==r;++o)t.setTexture2DArray(e[o]||Ql,s[o])}function Sp(n){switch(n){case 5126:return rp;case 35664:return sp;case 35665:return op;case 35666:return ap;case 35674:return lp;case 35675:return cp;case 35676:return hp;case 5124:case 35670:return up;case 35667:case 35671:return dp;case 35668:case 35672:return fp;case 35669:case 35673:return pp;case 5125:return mp;case 36294:return gp;case 36295:return _p;case 36296:return yp;case 35678:case 36198:case 36298:case 36306:case 35682:return vp;case 35679:case 36299:case 36307:return bp;case 35680:case 36300:case 36308:case 36293:return Mp;case 36289:case 36303:case 36311:case 36292:return xp}}class wp{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=ip(t.type)}}class Tp{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Sp(t.type)}}class Ep{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const r=this.seq;for(let s=0,o=r.length;s!==o;++s){const a=r[s];a.setValue(e,t[a.id],i)}}}const Bs=/(\w+)(\])?(\[|\.)?/g;function Fa(n,e){n.seq.push(e),n.map[e.id]=e}function Ap(n,e,t){const i=n.name,r=i.length;for(Bs.lastIndex=0;;){const s=Bs.exec(i),o=Bs.lastIndex;let a=s[1];const l=s[2]==="]",c=s[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===r){Fa(t,c===void 0?new wp(a,n,e):new Tp(a,n,e));break}else{let u=t.map[a];u===void 0&&(u=new Ep(a),Fa(t,u)),t=u}}}class zr{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){const s=e.getActiveUniform(t,r),o=e.getUniformLocation(t,s.name);Ap(s,o,this)}}setValue(e,t,i,r){const s=this.map[t];s!==void 0&&s.setValue(e,i,r)}setOptional(e,t,i){const r=t[i];r!==void 0&&this.setValue(e,i,r)}static upload(e,t,i,r){for(let s=0,o=t.length;s!==o;++s){const a=t[s],l=i[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,r)}}static seqWithValue(e,t){const i=[];for(let r=0,s=e.length;r!==s;++r){const o=e[r];o.id in t&&i.push(o)}return i}}function ka(n,e,t){const i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}const Rp=37297;let Cp=0;function Pp(n,e){const t=n.split(`
`),i=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let o=r;o<s;o++){const a=o+1;i.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return i.join(`
`)}const Oa=new He;function Lp(n){Qe._getMatrix(Oa,Qe.workingColorSpace,n);const e=`mat3( ${Oa.elements.map(t=>t.toFixed(4))} )`;switch(Qe.getTransfer(n)){case ns:return[e,"LinearTransferOETF"];case at:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function Ba(n,e,t){const i=n.getShaderParameter(e,n.COMPILE_STATUS),r=n.getShaderInfoLog(e).trim();if(i&&r==="")return"";const s=/ERROR: 0:(\d+)/.exec(r);if(s){const o=parseInt(s[1]);return t.toUpperCase()+`

`+r+`

`+Pp(n.getShaderSource(e),o)}else return r}function Ip(n,e){const t=Lp(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function Dp(n,e){let t;switch(e){case 1:t="Linear";break;case 2:t="Reinhard";break;case 3:t="Cineon";break;case 4:t="ACESFilmic";break;case 6:t="AgX";break;case 7:t="Neutral";break;case 5:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Tr=new P;function Np(){Qe.getLuminanceCoefficients(Tr);const n=Tr.x.toFixed(4),e=Tr.y.toFixed(4),t=Tr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Up(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Xi).join(`
`)}function Fp(n){const e=[];for(const t in n){const i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function kp(n,e){const t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){const s=n.getActiveAttrib(e,r),o=s.name;let a=1;s.type===n.FLOAT_MAT2&&(a=2),s.type===n.FLOAT_MAT3&&(a=3),s.type===n.FLOAT_MAT4&&(a=4),t[o]={type:s.type,location:n.getAttribLocation(e,o),locationSize:a}}return t}function Xi(n){return n!==""}function za(n,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Ga(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const Op=/^[ \t]*#include +<([\w\d./]+)>/gm;function so(n){return n.replace(Op,zp)}const Bp=new Map;function zp(n,e){let t=ze[e];if(t===void 0){const i=Bp.get(e);if(i!==void 0)t=ze[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return so(t)}const Gp=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Va(n){return n.replace(Gp,Vp)}function Vp(n,e,t,i){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function Ha(n){let e=`precision ${n.precision} float;
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
#define LOW_PRECISION`),e}function Hp(n){let e="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===1?e="SHADOWMAP_TYPE_PCF":n.shadowMapType===2?e="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===3&&(e="SHADOWMAP_TYPE_VSM"),e}function Wp(n){let e="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case 301:case 302:e="ENVMAP_TYPE_CUBE";break;case 306:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Xp(n){let e="ENVMAP_MODE_REFLECTION";if(n.envMap)switch(n.envMapMode){case 302:e="ENVMAP_MODE_REFRACTION";break}return e}function Yp(n){let e="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case 0:e="ENVMAP_BLENDING_MULTIPLY";break;case 1:e="ENVMAP_BLENDING_MIX";break;case 2:e="ENVMAP_BLENDING_ADD";break}return e}function qp(n){const e=n.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function jp(n,e,t,i){const r=n.getContext(),s=t.defines;let o=t.vertexShader,a=t.fragmentShader;const l=Hp(t),c=Wp(t),h=Xp(t),u=Yp(t),p=qp(t),f=Up(t),g=Fp(s),_=r.createProgram();let m,d,y=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Xi).join(`
`),m.length>0&&(m+=`
`),d=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Xi).join(`
`),d.length>0&&(d+=`
`)):(m=[Ha(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Xi).join(`
`),d=[Ha(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",p?"#define CUBEUV_TEXEL_WIDTH "+p.texelWidth:"",p?"#define CUBEUV_TEXEL_HEIGHT "+p.texelHeight:"",p?"#define CUBEUV_MAX_MIP "+p.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==0?"#define TONE_MAPPING":"",t.toneMapping!==0?ze.tonemapping_pars_fragment:"",t.toneMapping!==0?Dp("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",ze.colorspace_pars_fragment,Ip("linearToOutputTexel",t.outputColorSpace),Np(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Xi).join(`
`)),o=so(o),o=za(o,t),o=Ga(o,t),a=so(a),a=za(a,t),a=Ga(a,t),o=Va(o),a=Va(a),t.isRawShaderMaterial!==!0&&(y=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,d=["#define varying in",t.glslVersion===ta?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===ta?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);const b=y+m+o,M=y+d+a,D=ka(r,r.VERTEX_SHADER,b),R=ka(r,r.FRAGMENT_SHADER,M);r.attachShader(_,D),r.attachShader(_,R),t.index0AttributeName!==void 0?r.bindAttribLocation(_,0,t.index0AttributeName):t.morphTargets===!0&&r.bindAttribLocation(_,0,"position"),r.linkProgram(_);function A(v){if(n.debug.checkShaderErrors){const I=r.getProgramInfoLog(_).trim(),U=r.getShaderInfoLog(D).trim(),B=r.getShaderInfoLog(R).trim();let q=!0,z=!0;if(r.getProgramParameter(_,r.LINK_STATUS)===!1)if(q=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(r,_,D,R);else{const Y=Ba(r,D,"vertex"),N=Ba(r,R,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(_,r.VALIDATE_STATUS)+`

Material Name: `+v.name+`
Material Type: `+v.type+`

Program Info Log: `+I+`
`+Y+`
`+N)}else I!==""?console.warn("THREE.WebGLProgram: Program Info Log:",I):(U===""||B==="")&&(z=!1);z&&(v.diagnostics={runnable:q,programLog:I,vertexShader:{log:U,prefix:m},fragmentShader:{log:B,prefix:d}})}r.deleteShader(D),r.deleteShader(R),T=new zr(r,_),S=kp(r,_)}let T;this.getUniforms=function(){return T===void 0&&A(this),T};let S;this.getAttributes=function(){return S===void 0&&A(this),S};let x=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return x===!1&&(x=r.getProgramParameter(_,Rp)),x},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Cp++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=D,this.fragmentShader=R,this}let Kp=0;class Jp{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,i=e.fragmentShader,r=this._getShaderStage(t),s=this._getShaderStage(i),o=this._getShaderCacheForMaterial(e);return o.has(r)===!1&&(o.add(r),r.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new Zp(e),t.set(e,i)),i}}class Zp{constructor(e){this.id=Kp++,this.code=e,this.usedTimes=0}}function $p(n,e,t,i,r,s,o){const a=new To,l=new Jp,c=new Set,h=[],u=r.logarithmicDepthBuffer,p=r.vertexTextures;let f=r.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(S){return c.add(S),S===0?"uv":`uv${S}`}function m(S,x,v,I,U){const B=I.fog,q=U.geometry,z=S.isMeshStandardMaterial?I.environment:null,Y=(S.isMeshStandardMaterial?t:e).get(S.envMap||z),N=Y&&Y.mapping===306?Y.image.height:null,j=g[S.type];S.precision!==null&&(f=r.getMaxPrecision(S.precision),f!==S.precision&&console.warn("THREE.WebGLProgram.getParameters:",S.precision,"not supported, using",f,"instead."));const he=q.morphAttributes.position||q.morphAttributes.normal||q.morphAttributes.color,K=he!==void 0?he.length:0;let ce=0;q.morphAttributes.position!==void 0&&(ce=1),q.morphAttributes.normal!==void 0&&(ce=2),q.morphAttributes.color!==void 0&&(ce=3);let we,W,se,re;if(j){const rt=sn[j];we=rt.vertexShader,W=rt.fragmentShader}else we=S.vertexShader,W=S.fragmentShader,l.update(S),se=l.getVertexShaderID(S),re=l.getFragmentShaderID(S);const oe=n.getRenderTarget(),Ce=n.state.buffers.depth.getReversed(),Fe=U.isInstancedMesh===!0,Le=U.isBatchedMesh===!0,qe=!!S.map,ee=!!S.matcap,X=!!Y,L=!!S.aoMap,ue=!!S.lightMap,Q=!!S.bumpMap,ve=!!S.normalMap,de=!!S.displacementMap,De=!!S.emissiveMap,be=!!S.metalnessMap,C=!!S.roughnessMap,w=S.anisotropy>0,G=S.clearcoat>0,Z=S.dispersion>0,ne=S.iridescence>0,$=S.sheen>0,Te=S.transmission>0,pe=w&&!!S.anisotropyMap,Me=G&&!!S.clearcoatMap,je=G&&!!S.clearcoatNormalMap,ae=G&&!!S.clearcoatRoughnessMap,xe=ne&&!!S.iridescenceMap,Ne=ne&&!!S.iridescenceThicknessMap,ke=$&&!!S.sheenColorMap,Se=$&&!!S.sheenRoughnessMap,Ze=!!S.specularMap,We=!!S.specularColorMap,ut=!!S.specularIntensityMap,F=Te&&!!S.transmissionMap,me=Te&&!!S.thicknessMap,J=!!S.gradientMap,te=!!S.alphaMap,ye=S.alphaTest>0,ge=!!S.alphaHash,Ge=!!S.extensions;let bt=0;S.toneMapped&&(oe===null||oe.isXRRenderTarget===!0)&&(bt=n.toneMapping);const Pt={shaderID:j,shaderType:S.type,shaderName:S.name,vertexShader:we,fragmentShader:W,defines:S.defines,customVertexShaderID:se,customFragmentShaderID:re,isRawShaderMaterial:S.isRawShaderMaterial===!0,glslVersion:S.glslVersion,precision:f,batching:Le,batchingColor:Le&&U._colorsTexture!==null,instancing:Fe,instancingColor:Fe&&U.instanceColor!==null,instancingMorph:Fe&&U.morphTexture!==null,supportsVertexTextures:p,outputColorSpace:oe===null?n.outputColorSpace:oe.isXRRenderTarget===!0?oe.texture.colorSpace:xi,alphaToCoverage:!!S.alphaToCoverage,map:qe,matcap:ee,envMap:X,envMapMode:X&&Y.mapping,envMapCubeUVHeight:N,aoMap:L,lightMap:ue,bumpMap:Q,normalMap:ve,displacementMap:p&&de,emissiveMap:De,normalMapObjectSpace:ve&&S.normalMapType===1,normalMapTangentSpace:ve&&S.normalMapType===0,metalnessMap:be,roughnessMap:C,anisotropy:w,anisotropyMap:pe,clearcoat:G,clearcoatMap:Me,clearcoatNormalMap:je,clearcoatRoughnessMap:ae,dispersion:Z,iridescence:ne,iridescenceMap:xe,iridescenceThicknessMap:Ne,sheen:$,sheenColorMap:ke,sheenRoughnessMap:Se,specularMap:Ze,specularColorMap:We,specularIntensityMap:ut,transmission:Te,transmissionMap:F,thicknessMap:me,gradientMap:J,opaque:S.transparent===!1&&S.blending===1&&S.alphaToCoverage===!1,alphaMap:te,alphaTest:ye,alphaHash:ge,combine:S.combine,mapUv:qe&&_(S.map.channel),aoMapUv:L&&_(S.aoMap.channel),lightMapUv:ue&&_(S.lightMap.channel),bumpMapUv:Q&&_(S.bumpMap.channel),normalMapUv:ve&&_(S.normalMap.channel),displacementMapUv:de&&_(S.displacementMap.channel),emissiveMapUv:De&&_(S.emissiveMap.channel),metalnessMapUv:be&&_(S.metalnessMap.channel),roughnessMapUv:C&&_(S.roughnessMap.channel),anisotropyMapUv:pe&&_(S.anisotropyMap.channel),clearcoatMapUv:Me&&_(S.clearcoatMap.channel),clearcoatNormalMapUv:je&&_(S.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ae&&_(S.clearcoatRoughnessMap.channel),iridescenceMapUv:xe&&_(S.iridescenceMap.channel),iridescenceThicknessMapUv:Ne&&_(S.iridescenceThicknessMap.channel),sheenColorMapUv:ke&&_(S.sheenColorMap.channel),sheenRoughnessMapUv:Se&&_(S.sheenRoughnessMap.channel),specularMapUv:Ze&&_(S.specularMap.channel),specularColorMapUv:We&&_(S.specularColorMap.channel),specularIntensityMapUv:ut&&_(S.specularIntensityMap.channel),transmissionMapUv:F&&_(S.transmissionMap.channel),thicknessMapUv:me&&_(S.thicknessMap.channel),alphaMapUv:te&&_(S.alphaMap.channel),vertexTangents:!!q.attributes.tangent&&(ve||w),vertexColors:S.vertexColors,vertexAlphas:S.vertexColors===!0&&!!q.attributes.color&&q.attributes.color.itemSize===4,pointsUvs:U.isPoints===!0&&!!q.attributes.uv&&(qe||te),fog:!!B,useFog:S.fog===!0,fogExp2:!!B&&B.isFogExp2,flatShading:S.flatShading===!0,sizeAttenuation:S.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:Ce,skinning:U.isSkinnedMesh===!0,morphTargets:q.morphAttributes.position!==void 0,morphNormals:q.morphAttributes.normal!==void 0,morphColors:q.morphAttributes.color!==void 0,morphTargetsCount:K,morphTextureStride:ce,numDirLights:x.directional.length,numPointLights:x.point.length,numSpotLights:x.spot.length,numSpotLightMaps:x.spotLightMap.length,numRectAreaLights:x.rectArea.length,numHemiLights:x.hemi.length,numDirLightShadows:x.directionalShadowMap.length,numPointLightShadows:x.pointShadowMap.length,numSpotLightShadows:x.spotShadowMap.length,numSpotLightShadowsWithMaps:x.numSpotLightShadowsWithMaps,numLightProbes:x.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:S.dithering,shadowMapEnabled:n.shadowMap.enabled&&v.length>0,shadowMapType:n.shadowMap.type,toneMapping:bt,decodeVideoTexture:qe&&S.map.isVideoTexture===!0&&Qe.getTransfer(S.map.colorSpace)===at,decodeVideoTextureEmissive:De&&S.emissiveMap.isVideoTexture===!0&&Qe.getTransfer(S.emissiveMap.colorSpace)===at,premultipliedAlpha:S.premultipliedAlpha,doubleSided:S.side===2,flipSided:S.side===1,useDepthPacking:S.depthPacking>=0,depthPacking:S.depthPacking||0,index0AttributeName:S.index0AttributeName,extensionClipCullDistance:Ge&&S.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ge&&S.extensions.multiDraw===!0||Le)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:S.customProgramCacheKey()};return Pt.vertexUv1s=c.has(1),Pt.vertexUv2s=c.has(2),Pt.vertexUv3s=c.has(3),c.clear(),Pt}function d(S){const x=[];if(S.shaderID?x.push(S.shaderID):(x.push(S.customVertexShaderID),x.push(S.customFragmentShaderID)),S.defines!==void 0)for(const v in S.defines)x.push(v),x.push(S.defines[v]);return S.isRawShaderMaterial===!1&&(y(x,S),b(x,S),x.push(n.outputColorSpace)),x.push(S.customProgramCacheKey),x.join()}function y(S,x){S.push(x.precision),S.push(x.outputColorSpace),S.push(x.envMapMode),S.push(x.envMapCubeUVHeight),S.push(x.mapUv),S.push(x.alphaMapUv),S.push(x.lightMapUv),S.push(x.aoMapUv),S.push(x.bumpMapUv),S.push(x.normalMapUv),S.push(x.displacementMapUv),S.push(x.emissiveMapUv),S.push(x.metalnessMapUv),S.push(x.roughnessMapUv),S.push(x.anisotropyMapUv),S.push(x.clearcoatMapUv),S.push(x.clearcoatNormalMapUv),S.push(x.clearcoatRoughnessMapUv),S.push(x.iridescenceMapUv),S.push(x.iridescenceThicknessMapUv),S.push(x.sheenColorMapUv),S.push(x.sheenRoughnessMapUv),S.push(x.specularMapUv),S.push(x.specularColorMapUv),S.push(x.specularIntensityMapUv),S.push(x.transmissionMapUv),S.push(x.thicknessMapUv),S.push(x.combine),S.push(x.fogExp2),S.push(x.sizeAttenuation),S.push(x.morphTargetsCount),S.push(x.morphAttributeCount),S.push(x.numDirLights),S.push(x.numPointLights),S.push(x.numSpotLights),S.push(x.numSpotLightMaps),S.push(x.numHemiLights),S.push(x.numRectAreaLights),S.push(x.numDirLightShadows),S.push(x.numPointLightShadows),S.push(x.numSpotLightShadows),S.push(x.numSpotLightShadowsWithMaps),S.push(x.numLightProbes),S.push(x.shadowMapType),S.push(x.toneMapping),S.push(x.numClippingPlanes),S.push(x.numClipIntersection),S.push(x.depthPacking)}function b(S,x){a.disableAll(),x.supportsVertexTextures&&a.enable(0),x.instancing&&a.enable(1),x.instancingColor&&a.enable(2),x.instancingMorph&&a.enable(3),x.matcap&&a.enable(4),x.envMap&&a.enable(5),x.normalMapObjectSpace&&a.enable(6),x.normalMapTangentSpace&&a.enable(7),x.clearcoat&&a.enable(8),x.iridescence&&a.enable(9),x.alphaTest&&a.enable(10),x.vertexColors&&a.enable(11),x.vertexAlphas&&a.enable(12),x.vertexUv1s&&a.enable(13),x.vertexUv2s&&a.enable(14),x.vertexUv3s&&a.enable(15),x.vertexTangents&&a.enable(16),x.anisotropy&&a.enable(17),x.alphaHash&&a.enable(18),x.batching&&a.enable(19),x.dispersion&&a.enable(20),x.batchingColor&&a.enable(21),S.push(a.mask),a.disableAll(),x.fog&&a.enable(0),x.useFog&&a.enable(1),x.flatShading&&a.enable(2),x.logarithmicDepthBuffer&&a.enable(3),x.reverseDepthBuffer&&a.enable(4),x.skinning&&a.enable(5),x.morphTargets&&a.enable(6),x.morphNormals&&a.enable(7),x.morphColors&&a.enable(8),x.premultipliedAlpha&&a.enable(9),x.shadowMapEnabled&&a.enable(10),x.doubleSided&&a.enable(11),x.flipSided&&a.enable(12),x.useDepthPacking&&a.enable(13),x.dithering&&a.enable(14),x.transmission&&a.enable(15),x.sheen&&a.enable(16),x.opaque&&a.enable(17),x.pointsUvs&&a.enable(18),x.decodeVideoTexture&&a.enable(19),x.decodeVideoTextureEmissive&&a.enable(20),x.alphaToCoverage&&a.enable(21),S.push(a.mask)}function M(S){const x=g[S.type];let v;if(x){const I=sn[x];v=Nh.clone(I.uniforms)}else v=S.uniforms;return v}function D(S,x){let v;for(let I=0,U=h.length;I<U;I++){const B=h[I];if(B.cacheKey===x){v=B,++v.usedTimes;break}}return v===void 0&&(v=new jp(n,x,S,s),h.push(v)),v}function R(S){if(--S.usedTimes===0){const x=h.indexOf(S);h[x]=h[h.length-1],h.pop(),S.destroy()}}function A(S){l.remove(S)}function T(){l.dispose()}return{getParameters:m,getProgramCacheKey:d,getUniforms:M,acquireProgram:D,releaseProgram:R,releaseShaderCache:A,programs:h,dispose:T}}function Qp(){let n=new WeakMap;function e(o){return n.has(o)}function t(o){let a=n.get(o);return a===void 0&&(a={},n.set(o,a)),a}function i(o){n.delete(o)}function r(o,a,l){n.get(o)[a]=l}function s(){n=new WeakMap}return{has:e,get:t,remove:i,update:r,dispose:s}}function em(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function Wa(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function Xa(){const n=[];let e=0;const t=[],i=[],r=[];function s(){e=0,t.length=0,i.length=0,r.length=0}function o(u,p,f,g,_,m){let d=n[e];return d===void 0?(d={id:u.id,object:u,geometry:p,material:f,groupOrder:g,renderOrder:u.renderOrder,z:_,group:m},n[e]=d):(d.id=u.id,d.object=u,d.geometry=p,d.material=f,d.groupOrder=g,d.renderOrder=u.renderOrder,d.z=_,d.group=m),e++,d}function a(u,p,f,g,_,m){const d=o(u,p,f,g,_,m);f.transmission>0?i.push(d):f.transparent===!0?r.push(d):t.push(d)}function l(u,p,f,g,_,m){const d=o(u,p,f,g,_,m);f.transmission>0?i.unshift(d):f.transparent===!0?r.unshift(d):t.unshift(d)}function c(u,p){t.length>1&&t.sort(u||em),i.length>1&&i.sort(p||Wa),r.length>1&&r.sort(p||Wa)}function h(){for(let u=e,p=n.length;u<p;u++){const f=n[u];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:i,transparent:r,init:s,push:a,unshift:l,finish:h,sort:c}}function tm(){let n=new WeakMap;function e(i,r){const s=n.get(i);let o;return s===void 0?(o=new Xa,n.set(i,[o])):r>=s.length?(o=new Xa,s.push(o)):o=s[r],o}function t(){n=new WeakMap}return{get:e,dispose:t}}function nm(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new P,color:new Ie};break;case"SpotLight":t={position:new P,direction:new P,color:new Ie,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new P,color:new Ie,distance:0,decay:0};break;case"HemisphereLight":t={direction:new P,skyColor:new Ie,groundColor:new Ie};break;case"RectAreaLight":t={color:new Ie,position:new P,halfWidth:new P,halfHeight:new P};break}return n[e.id]=t,t}}}function im(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ie};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ie};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ie,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}let rm=0;function sm(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function om(n){const e=new nm,t=im(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new P);const r=new P,s=new Be,o=new Be;function a(c){let h=0,u=0,p=0;for(let S=0;S<9;S++)i.probe[S].set(0,0,0);let f=0,g=0,_=0,m=0,d=0,y=0,b=0,M=0,D=0,R=0,A=0;c.sort(sm);for(let S=0,x=c.length;S<x;S++){const v=c[S],I=v.color,U=v.intensity,B=v.distance,q=v.shadow&&v.shadow.map?v.shadow.map.texture:null;if(v.isAmbientLight)h+=I.r*U,u+=I.g*U,p+=I.b*U;else if(v.isLightProbe){for(let z=0;z<9;z++)i.probe[z].addScaledVector(v.sh.coefficients[z],U);A++}else if(v.isDirectionalLight){const z=e.get(v);if(z.color.copy(v.color).multiplyScalar(v.intensity),v.castShadow){const Y=v.shadow,N=t.get(v);N.shadowIntensity=Y.intensity,N.shadowBias=Y.bias,N.shadowNormalBias=Y.normalBias,N.shadowRadius=Y.radius,N.shadowMapSize=Y.mapSize,i.directionalShadow[f]=N,i.directionalShadowMap[f]=q,i.directionalShadowMatrix[f]=v.shadow.matrix,y++}i.directional[f]=z,f++}else if(v.isSpotLight){const z=e.get(v);z.position.setFromMatrixPosition(v.matrixWorld),z.color.copy(I).multiplyScalar(U),z.distance=B,z.coneCos=Math.cos(v.angle),z.penumbraCos=Math.cos(v.angle*(1-v.penumbra)),z.decay=v.decay,i.spot[_]=z;const Y=v.shadow;if(v.map&&(i.spotLightMap[D]=v.map,D++,Y.updateMatrices(v),v.castShadow&&R++),i.spotLightMatrix[_]=Y.matrix,v.castShadow){const N=t.get(v);N.shadowIntensity=Y.intensity,N.shadowBias=Y.bias,N.shadowNormalBias=Y.normalBias,N.shadowRadius=Y.radius,N.shadowMapSize=Y.mapSize,i.spotShadow[_]=N,i.spotShadowMap[_]=q,M++}_++}else if(v.isRectAreaLight){const z=e.get(v);z.color.copy(I).multiplyScalar(U),z.halfWidth.set(v.width*.5,0,0),z.halfHeight.set(0,v.height*.5,0),i.rectArea[m]=z,m++}else if(v.isPointLight){const z=e.get(v);if(z.color.copy(v.color).multiplyScalar(v.intensity),z.distance=v.distance,z.decay=v.decay,v.castShadow){const Y=v.shadow,N=t.get(v);N.shadowIntensity=Y.intensity,N.shadowBias=Y.bias,N.shadowNormalBias=Y.normalBias,N.shadowRadius=Y.radius,N.shadowMapSize=Y.mapSize,N.shadowCameraNear=Y.camera.near,N.shadowCameraFar=Y.camera.far,i.pointShadow[g]=N,i.pointShadowMap[g]=q,i.pointShadowMatrix[g]=v.shadow.matrix,b++}i.point[g]=z,g++}else if(v.isHemisphereLight){const z=e.get(v);z.skyColor.copy(v.color).multiplyScalar(U),z.groundColor.copy(v.groundColor).multiplyScalar(U),i.hemi[d]=z,d++}}m>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=fe.LTC_FLOAT_1,i.rectAreaLTC2=fe.LTC_FLOAT_2):(i.rectAreaLTC1=fe.LTC_HALF_1,i.rectAreaLTC2=fe.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=u,i.ambient[2]=p;const T=i.hash;(T.directionalLength!==f||T.pointLength!==g||T.spotLength!==_||T.rectAreaLength!==m||T.hemiLength!==d||T.numDirectionalShadows!==y||T.numPointShadows!==b||T.numSpotShadows!==M||T.numSpotMaps!==D||T.numLightProbes!==A)&&(i.directional.length=f,i.spot.length=_,i.rectArea.length=m,i.point.length=g,i.hemi.length=d,i.directionalShadow.length=y,i.directionalShadowMap.length=y,i.pointShadow.length=b,i.pointShadowMap.length=b,i.spotShadow.length=M,i.spotShadowMap.length=M,i.directionalShadowMatrix.length=y,i.pointShadowMatrix.length=b,i.spotLightMatrix.length=M+D-R,i.spotLightMap.length=D,i.numSpotLightShadowsWithMaps=R,i.numLightProbes=A,T.directionalLength=f,T.pointLength=g,T.spotLength=_,T.rectAreaLength=m,T.hemiLength=d,T.numDirectionalShadows=y,T.numPointShadows=b,T.numSpotShadows=M,T.numSpotMaps=D,T.numLightProbes=A,i.version=rm++)}function l(c,h){let u=0,p=0,f=0,g=0,_=0;const m=h.matrixWorldInverse;for(let d=0,y=c.length;d<y;d++){const b=c[d];if(b.isDirectionalLight){const M=i.directional[u];M.direction.setFromMatrixPosition(b.matrixWorld),r.setFromMatrixPosition(b.target.matrixWorld),M.direction.sub(r),M.direction.transformDirection(m),u++}else if(b.isSpotLight){const M=i.spot[f];M.position.setFromMatrixPosition(b.matrixWorld),M.position.applyMatrix4(m),M.direction.setFromMatrixPosition(b.matrixWorld),r.setFromMatrixPosition(b.target.matrixWorld),M.direction.sub(r),M.direction.transformDirection(m),f++}else if(b.isRectAreaLight){const M=i.rectArea[g];M.position.setFromMatrixPosition(b.matrixWorld),M.position.applyMatrix4(m),o.identity(),s.copy(b.matrixWorld),s.premultiply(m),o.extractRotation(s),M.halfWidth.set(b.width*.5,0,0),M.halfHeight.set(0,b.height*.5,0),M.halfWidth.applyMatrix4(o),M.halfHeight.applyMatrix4(o),g++}else if(b.isPointLight){const M=i.point[p];M.position.setFromMatrixPosition(b.matrixWorld),M.position.applyMatrix4(m),p++}else if(b.isHemisphereLight){const M=i.hemi[_];M.direction.setFromMatrixPosition(b.matrixWorld),M.direction.transformDirection(m),_++}}}return{setup:a,setupView:l,state:i}}function Ya(n){const e=new om(n),t=[],i=[];function r(h){c.camera=h,t.length=0,i.length=0}function s(h){t.push(h)}function o(h){i.push(h)}function a(){e.setup(t)}function l(h){e.setupView(t,h)}const c={lightsArray:t,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:r,state:c,setupLights:a,setupLightsView:l,pushLight:s,pushShadow:o}}function am(n){let e=new WeakMap;function t(r,s=0){const o=e.get(r);let a;return o===void 0?(a=new Ya(n),e.set(r,[a])):s>=o.length?(a=new Ya(n),o.push(a)):a=o[s],a}function i(){e=new WeakMap}return{get:t,dispose:i}}class lm extends bn{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=3200,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class cm extends bn{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const hm=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,um=`uniform sampler2D shadow_pass;
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
}`;function dm(n,e,t){let i=new Ro;const r=new ie,s=new ie,o=new tt,a=new lm({depthPacking:3201}),l=new cm,c={},h=t.maxTextureSize,u={0:1,1:0,2:2},p=new Ln({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ie},radius:{value:4}},vertexShader:hm,fragmentShader:um}),f=p.clone();f.defines.HORIZONTAL_PASS=1;const g=new vt;g.setAttribute("position",new Nt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new ht(g,p),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let d=this.type;this.render=function(R,A,T){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||R.length===0)return;const S=n.getRenderTarget(),x=n.getActiveCubeFace(),v=n.getActiveMipmapLevel(),I=n.state;I.setBlending(0),I.buffers.color.setClear(1,1,1,1),I.buffers.depth.setTest(!0),I.setScissorTest(!1);const U=d!==3&&this.type===3,B=d===3&&this.type!==3;for(let q=0,z=R.length;q<z;q++){const Y=R[q],N=Y.shadow;if(N===void 0){console.warn("THREE.WebGLShadowMap:",Y,"has no shadow.");continue}if(N.autoUpdate===!1&&N.needsUpdate===!1)continue;r.copy(N.mapSize);const j=N.getFrameExtents();if(r.multiply(j),s.copy(N.mapSize),(r.x>h||r.y>h)&&(r.x>h&&(s.x=Math.floor(h/j.x),r.x=s.x*j.x,N.mapSize.x=s.x),r.y>h&&(s.y=Math.floor(h/j.y),r.y=s.y*j.y,N.mapSize.y=s.y)),N.map===null||U===!0||B===!0){const K=this.type!==3?{minFilter:1003,magFilter:1003}:{};N.map!==null&&N.map.dispose(),N.map=new Wn(r.x,r.y,K),N.map.texture.name=Y.name+".shadowMap",N.camera.updateProjectionMatrix()}n.setRenderTarget(N.map),n.clear();const he=N.getViewportCount();for(let K=0;K<he;K++){const ce=N.getViewport(K);o.set(s.x*ce.x,s.y*ce.y,s.x*ce.z,s.y*ce.w),I.viewport(o),N.updateMatrices(Y,K),i=N.getFrustum(),M(A,T,N.camera,Y,this.type)}N.isPointLightShadow!==!0&&this.type===3&&y(N,T),N.needsUpdate=!1}d=this.type,m.needsUpdate=!1,n.setRenderTarget(S,x,v)};function y(R,A){const T=e.update(_);p.defines.VSM_SAMPLES!==R.blurSamples&&(p.defines.VSM_SAMPLES=R.blurSamples,f.defines.VSM_SAMPLES=R.blurSamples,p.needsUpdate=!0,f.needsUpdate=!0),R.mapPass===null&&(R.mapPass=new Wn(r.x,r.y)),p.uniforms.shadow_pass.value=R.map.texture,p.uniforms.resolution.value=R.mapSize,p.uniforms.radius.value=R.radius,n.setRenderTarget(R.mapPass),n.clear(),n.renderBufferDirect(A,null,T,p,_,null),f.uniforms.shadow_pass.value=R.mapPass.texture,f.uniforms.resolution.value=R.mapSize,f.uniforms.radius.value=R.radius,n.setRenderTarget(R.map),n.clear(),n.renderBufferDirect(A,null,T,f,_,null)}function b(R,A,T,S){let x=null;const v=T.isPointLight===!0?R.customDistanceMaterial:R.customDepthMaterial;if(v!==void 0)x=v;else if(x=T.isPointLight===!0?l:a,n.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){const I=x.uuid,U=A.uuid;let B=c[I];B===void 0&&(B={},c[I]=B);let q=B[U];q===void 0&&(q=x.clone(),B[U]=q,A.addEventListener("dispose",D)),x=q}if(x.visible=A.visible,x.wireframe=A.wireframe,S===3?x.side=A.shadowSide!==null?A.shadowSide:A.side:x.side=A.shadowSide!==null?A.shadowSide:u[A.side],x.alphaMap=A.alphaMap,x.alphaTest=A.alphaTest,x.map=A.map,x.clipShadows=A.clipShadows,x.clippingPlanes=A.clippingPlanes,x.clipIntersection=A.clipIntersection,x.displacementMap=A.displacementMap,x.displacementScale=A.displacementScale,x.displacementBias=A.displacementBias,x.wireframeLinewidth=A.wireframeLinewidth,x.linewidth=A.linewidth,T.isPointLight===!0&&x.isMeshDistanceMaterial===!0){const I=n.properties.get(x);I.light=T}return x}function M(R,A,T,S,x){if(R.visible===!1)return;if(R.layers.test(A.layers)&&(R.isMesh||R.isLine||R.isPoints)&&(R.castShadow||R.receiveShadow&&x===3)&&(!R.frustumCulled||i.intersectsObject(R))){R.modelViewMatrix.multiplyMatrices(T.matrixWorldInverse,R.matrixWorld);const U=e.update(R),B=R.material;if(Array.isArray(B)){const q=U.groups;for(let z=0,Y=q.length;z<Y;z++){const N=q[z],j=B[N.materialIndex];if(j&&j.visible){const he=b(R,j,S,x);R.onBeforeShadow(n,R,A,T,U,he,N),n.renderBufferDirect(T,null,U,he,R,N),R.onAfterShadow(n,R,A,T,U,he,N)}}}else if(B.visible){const q=b(R,B,S,x);R.onBeforeShadow(n,R,A,T,U,q,null),n.renderBufferDirect(T,null,U,q,R,null),R.onAfterShadow(n,R,A,T,U,q,null)}}const I=R.children;for(let U=0,B=I.length;U<B;U++)M(I[U],A,T,S,x)}function D(R){R.target.removeEventListener("dispose",D);for(const T in c){const S=c[T],x=R.target.uuid;x in S&&(S[x].dispose(),delete S[x])}}}const fm={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3};function pm(n,e){function t(){let F=!1;const me=new tt;let J=null;const te=new tt(0,0,0,0);return{setMask:function(ye){J!==ye&&!F&&(n.colorMask(ye,ye,ye,ye),J=ye)},setLocked:function(ye){F=ye},setClear:function(ye,ge,Ge,bt,Pt){Pt===!0&&(ye*=bt,ge*=bt,Ge*=bt),me.set(ye,ge,Ge,bt),te.equals(me)===!1&&(n.clearColor(ye,ge,Ge,bt),te.copy(me))},reset:function(){F=!1,J=null,te.set(-1,0,0,0)}}}function i(){let F=!1,me=!1,J=null,te=null,ye=null;return{setReversed:function(ge){if(me!==ge){const Ge=e.get("EXT_clip_control");me?Ge.clipControlEXT(Ge.LOWER_LEFT_EXT,Ge.ZERO_TO_ONE_EXT):Ge.clipControlEXT(Ge.LOWER_LEFT_EXT,Ge.NEGATIVE_ONE_TO_ONE_EXT);const bt=ye;ye=null,this.setClear(bt)}me=ge},getReversed:function(){return me},setTest:function(ge){ge?oe(n.DEPTH_TEST):Ce(n.DEPTH_TEST)},setMask:function(ge){J!==ge&&!F&&(n.depthMask(ge),J=ge)},setFunc:function(ge){if(me&&(ge=fm[ge]),te!==ge){switch(ge){case 0:n.depthFunc(n.NEVER);break;case 1:n.depthFunc(n.ALWAYS);break;case 2:n.depthFunc(n.LESS);break;case 3:n.depthFunc(n.LEQUAL);break;case 4:n.depthFunc(n.EQUAL);break;case 5:n.depthFunc(n.GEQUAL);break;case 6:n.depthFunc(n.GREATER);break;case 7:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}te=ge}},setLocked:function(ge){F=ge},setClear:function(ge){ye!==ge&&(me&&(ge=1-ge),n.clearDepth(ge),ye=ge)},reset:function(){F=!1,J=null,te=null,ye=null,me=!1}}}function r(){let F=!1,me=null,J=null,te=null,ye=null,ge=null,Ge=null,bt=null,Pt=null;return{setTest:function(rt){F||(rt?oe(n.STENCIL_TEST):Ce(n.STENCIL_TEST))},setMask:function(rt){me!==rt&&!F&&(n.stencilMask(rt),me=rt)},setFunc:function(rt,Kt,ln){(J!==rt||te!==Kt||ye!==ln)&&(n.stencilFunc(rt,Kt,ln),J=rt,te=Kt,ye=ln)},setOp:function(rt,Kt,ln){(ge!==rt||Ge!==Kt||bt!==ln)&&(n.stencilOp(rt,Kt,ln),ge=rt,Ge=Kt,bt=ln)},setLocked:function(rt){F=rt},setClear:function(rt){Pt!==rt&&(n.clearStencil(rt),Pt=rt)},reset:function(){F=!1,me=null,J=null,te=null,ye=null,ge=null,Ge=null,bt=null,Pt=null}}}const s=new t,o=new i,a=new r,l=new WeakMap,c=new WeakMap;let h={},u={},p=new WeakMap,f=[],g=null,_=!1,m=null,d=null,y=null,b=null,M=null,D=null,R=null,A=new Ie(0,0,0),T=0,S=!1,x=null,v=null,I=null,U=null,B=null;const q=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let z=!1,Y=0;const N=n.getParameter(n.VERSION);N.indexOf("WebGL")!==-1?(Y=parseFloat(/^WebGL (\d)/.exec(N)[1]),z=Y>=1):N.indexOf("OpenGL ES")!==-1&&(Y=parseFloat(/^OpenGL ES (\d)/.exec(N)[1]),z=Y>=2);let j=null,he={};const K=n.getParameter(n.SCISSOR_BOX),ce=n.getParameter(n.VIEWPORT),we=new tt().fromArray(K),W=new tt().fromArray(ce);function se(F,me,J,te){const ye=new Uint8Array(4),ge=n.createTexture();n.bindTexture(F,ge),n.texParameteri(F,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(F,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Ge=0;Ge<J;Ge++)F===n.TEXTURE_3D||F===n.TEXTURE_2D_ARRAY?n.texImage3D(me,0,n.RGBA,1,1,te,0,n.RGBA,n.UNSIGNED_BYTE,ye):n.texImage2D(me+Ge,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,ye);return ge}const re={};re[n.TEXTURE_2D]=se(n.TEXTURE_2D,n.TEXTURE_2D,1),re[n.TEXTURE_CUBE_MAP]=se(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),re[n.TEXTURE_2D_ARRAY]=se(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),re[n.TEXTURE_3D]=se(n.TEXTURE_3D,n.TEXTURE_3D,1,1),s.setClear(0,0,0,1),o.setClear(1),a.setClear(0),oe(n.DEPTH_TEST),o.setFunc(3),Q(!1),ve(1),oe(n.CULL_FACE),L(0);function oe(F){h[F]!==!0&&(n.enable(F),h[F]=!0)}function Ce(F){h[F]!==!1&&(n.disable(F),h[F]=!1)}function Fe(F,me){return u[F]!==me?(n.bindFramebuffer(F,me),u[F]=me,F===n.DRAW_FRAMEBUFFER&&(u[n.FRAMEBUFFER]=me),F===n.FRAMEBUFFER&&(u[n.DRAW_FRAMEBUFFER]=me),!0):!1}function Le(F,me){let J=f,te=!1;if(F){J=p.get(me),J===void 0&&(J=[],p.set(me,J));const ye=F.textures;if(J.length!==ye.length||J[0]!==n.COLOR_ATTACHMENT0){for(let ge=0,Ge=ye.length;ge<Ge;ge++)J[ge]=n.COLOR_ATTACHMENT0+ge;J.length=ye.length,te=!0}}else J[0]!==n.BACK&&(J[0]=n.BACK,te=!0);te&&n.drawBuffers(J)}function qe(F){return g!==F?(n.useProgram(F),g=F,!0):!1}const ee={100:n.FUNC_ADD,101:n.FUNC_SUBTRACT,102:n.FUNC_REVERSE_SUBTRACT};ee[103]=n.MIN,ee[104]=n.MAX;const X={200:n.ZERO,201:n.ONE,202:n.SRC_COLOR,204:n.SRC_ALPHA,210:n.SRC_ALPHA_SATURATE,208:n.DST_COLOR,206:n.DST_ALPHA,203:n.ONE_MINUS_SRC_COLOR,205:n.ONE_MINUS_SRC_ALPHA,209:n.ONE_MINUS_DST_COLOR,207:n.ONE_MINUS_DST_ALPHA,211:n.CONSTANT_COLOR,212:n.ONE_MINUS_CONSTANT_COLOR,213:n.CONSTANT_ALPHA,214:n.ONE_MINUS_CONSTANT_ALPHA};function L(F,me,J,te,ye,ge,Ge,bt,Pt,rt){if(F===0){_===!0&&(Ce(n.BLEND),_=!1);return}if(_===!1&&(oe(n.BLEND),_=!0),F!==5){if(F!==m||rt!==S){if((d!==100||M!==100)&&(n.blendEquation(n.FUNC_ADD),d=100,M=100),rt)switch(F){case 1:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case 2:n.blendFunc(n.ONE,n.ONE);break;case 3:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case 4:n.blendFuncSeparate(n.ZERO,n.SRC_COLOR,n.ZERO,n.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",F);break}else switch(F){case 1:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case 2:n.blendFunc(n.SRC_ALPHA,n.ONE);break;case 3:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case 4:n.blendFunc(n.ZERO,n.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",F);break}y=null,b=null,D=null,R=null,A.set(0,0,0),T=0,m=F,S=rt}return}ye=ye||me,ge=ge||J,Ge=Ge||te,(me!==d||ye!==M)&&(n.blendEquationSeparate(ee[me],ee[ye]),d=me,M=ye),(J!==y||te!==b||ge!==D||Ge!==R)&&(n.blendFuncSeparate(X[J],X[te],X[ge],X[Ge]),y=J,b=te,D=ge,R=Ge),(bt.equals(A)===!1||Pt!==T)&&(n.blendColor(bt.r,bt.g,bt.b,Pt),A.copy(bt),T=Pt),m=F,S=!1}function ue(F,me){F.side===2?Ce(n.CULL_FACE):oe(n.CULL_FACE);let J=F.side===1;me&&(J=!J),Q(J),F.blending===1&&F.transparent===!1?L(0):L(F.blending,F.blendEquation,F.blendSrc,F.blendDst,F.blendEquationAlpha,F.blendSrcAlpha,F.blendDstAlpha,F.blendColor,F.blendAlpha,F.premultipliedAlpha),o.setFunc(F.depthFunc),o.setTest(F.depthTest),o.setMask(F.depthWrite),s.setMask(F.colorWrite);const te=F.stencilWrite;a.setTest(te),te&&(a.setMask(F.stencilWriteMask),a.setFunc(F.stencilFunc,F.stencilRef,F.stencilFuncMask),a.setOp(F.stencilFail,F.stencilZFail,F.stencilZPass)),De(F.polygonOffset,F.polygonOffsetFactor,F.polygonOffsetUnits),F.alphaToCoverage===!0?oe(n.SAMPLE_ALPHA_TO_COVERAGE):Ce(n.SAMPLE_ALPHA_TO_COVERAGE)}function Q(F){x!==F&&(F?n.frontFace(n.CW):n.frontFace(n.CCW),x=F)}function ve(F){F!==0?(oe(n.CULL_FACE),F!==v&&(F===1?n.cullFace(n.BACK):F===2?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):Ce(n.CULL_FACE),v=F}function de(F){F!==I&&(z&&n.lineWidth(F),I=F)}function De(F,me,J){F?(oe(n.POLYGON_OFFSET_FILL),(U!==me||B!==J)&&(n.polygonOffset(me,J),U=me,B=J)):Ce(n.POLYGON_OFFSET_FILL)}function be(F){F?oe(n.SCISSOR_TEST):Ce(n.SCISSOR_TEST)}function C(F){F===void 0&&(F=n.TEXTURE0+q-1),j!==F&&(n.activeTexture(F),j=F)}function w(F,me,J){J===void 0&&(j===null?J=n.TEXTURE0+q-1:J=j);let te=he[J];te===void 0&&(te={type:void 0,texture:void 0},he[J]=te),(te.type!==F||te.texture!==me)&&(j!==J&&(n.activeTexture(J),j=J),n.bindTexture(F,me||re[F]),te.type=F,te.texture=me)}function G(){const F=he[j];F!==void 0&&F.type!==void 0&&(n.bindTexture(F.type,null),F.type=void 0,F.texture=void 0)}function Z(){try{n.compressedTexImage2D.apply(n,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function ne(){try{n.compressedTexImage3D.apply(n,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function $(){try{n.texSubImage2D.apply(n,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function Te(){try{n.texSubImage3D.apply(n,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function pe(){try{n.compressedTexSubImage2D.apply(n,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function Me(){try{n.compressedTexSubImage3D.apply(n,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function je(){try{n.texStorage2D.apply(n,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function ae(){try{n.texStorage3D.apply(n,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function xe(){try{n.texImage2D.apply(n,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function Ne(){try{n.texImage3D.apply(n,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function ke(F){we.equals(F)===!1&&(n.scissor(F.x,F.y,F.z,F.w),we.copy(F))}function Se(F){W.equals(F)===!1&&(n.viewport(F.x,F.y,F.z,F.w),W.copy(F))}function Ze(F,me){let J=c.get(me);J===void 0&&(J=new WeakMap,c.set(me,J));let te=J.get(F);te===void 0&&(te=n.getUniformBlockIndex(me,F.name),J.set(F,te))}function We(F,me){const te=c.get(me).get(F);l.get(me)!==te&&(n.uniformBlockBinding(me,te,F.__bindingPointIndex),l.set(me,te))}function ut(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),o.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),h={},j=null,he={},u={},p=new WeakMap,f=[],g=null,_=!1,m=null,d=null,y=null,b=null,M=null,D=null,R=null,A=new Ie(0,0,0),T=0,S=!1,x=null,v=null,I=null,U=null,B=null,we.set(0,0,n.canvas.width,n.canvas.height),W.set(0,0,n.canvas.width,n.canvas.height),s.reset(),o.reset(),a.reset()}return{buffers:{color:s,depth:o,stencil:a},enable:oe,disable:Ce,bindFramebuffer:Fe,drawBuffers:Le,useProgram:qe,setBlending:L,setMaterial:ue,setFlipSided:Q,setCullFace:ve,setLineWidth:de,setPolygonOffset:De,setScissorTest:be,activeTexture:C,bindTexture:w,unbindTexture:G,compressedTexImage2D:Z,compressedTexImage3D:ne,texImage2D:xe,texImage3D:Ne,updateUBOMapping:Ze,uniformBlockBinding:We,texStorage2D:je,texStorage3D:ae,texSubImage2D:$,texSubImage3D:Te,compressedTexSubImage2D:pe,compressedTexSubImage3D:Me,scissor:ke,viewport:Se,reset:ut}}function qa(n,e,t,i){const r=mm(i);switch(t){case 1021:return n*e;case 1024:return n*e;case 1025:return n*e*2;case 1028:return n*e/r.components*r.byteLength;case 1029:return n*e/r.components*r.byteLength;case 1030:return n*e*2/r.components*r.byteLength;case 1031:return n*e*2/r.components*r.byteLength;case 1022:return n*e*3/r.components*r.byteLength;case 1023:return n*e*4/r.components*r.byteLength;case 1033:return n*e*4/r.components*r.byteLength;case 33776:case 33777:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case 33778:case 33779:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case 35841:case 35843:return Math.max(n,16)*Math.max(e,8)/4;case 35840:case 35842:return Math.max(n,8)*Math.max(e,8)/2;case 36196:case 37492:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case 37496:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case 37808:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case 37809:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case 37810:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case 37811:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case 37812:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case 37813:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case 37814:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case 37815:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case 37816:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case 37817:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case 37818:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case 37819:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case 37820:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case 37821:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case 36492:case 36494:case 36495:return Math.ceil(n/4)*Math.ceil(e/4)*16;case 36283:case 36284:return Math.ceil(n/4)*Math.ceil(e/4)*8;case 36285:case 36286:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function mm(n){switch(n){case 1009:case 1010:return{byteLength:1,components:1};case 1012:case 1011:case 1016:return{byteLength:2,components:1};case 1017:case 1018:return{byteLength:2,components:4};case 1014:case 1013:case 1015:return{byteLength:4,components:1};case 35902:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}function gm(n,e,t,i,r,s,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new ie,h=new WeakMap;let u;const p=new WeakMap;let f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(C,w){return f?new OffscreenCanvas(C,w):Zi("canvas")}function _(C,w,G){let Z=1;const ne=be(C);if((ne.width>G||ne.height>G)&&(Z=G/Math.max(ne.width,ne.height)),Z<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){const $=Math.floor(Z*ne.width),Te=Math.floor(Z*ne.height);u===void 0&&(u=g($,Te));const pe=w?g($,Te):u;return pe.width=$,pe.height=Te,pe.getContext("2d").drawImage(C,0,0,$,Te),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ne.width+"x"+ne.height+") to ("+$+"x"+Te+")."),pe}else return"data"in C&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ne.width+"x"+ne.height+")."),C;return C}function m(C){return C.generateMipmaps}function d(C){n.generateMipmap(C)}function y(C){return C.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?n.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function b(C,w,G,Z,ne=!1){if(C!==null){if(n[C]!==void 0)return n[C];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let $=w;if(w===n.RED&&(G===n.FLOAT&&($=n.R32F),G===n.HALF_FLOAT&&($=n.R16F),G===n.UNSIGNED_BYTE&&($=n.R8)),w===n.RED_INTEGER&&(G===n.UNSIGNED_BYTE&&($=n.R8UI),G===n.UNSIGNED_SHORT&&($=n.R16UI),G===n.UNSIGNED_INT&&($=n.R32UI),G===n.BYTE&&($=n.R8I),G===n.SHORT&&($=n.R16I),G===n.INT&&($=n.R32I)),w===n.RG&&(G===n.FLOAT&&($=n.RG32F),G===n.HALF_FLOAT&&($=n.RG16F),G===n.UNSIGNED_BYTE&&($=n.RG8)),w===n.RG_INTEGER&&(G===n.UNSIGNED_BYTE&&($=n.RG8UI),G===n.UNSIGNED_SHORT&&($=n.RG16UI),G===n.UNSIGNED_INT&&($=n.RG32UI),G===n.BYTE&&($=n.RG8I),G===n.SHORT&&($=n.RG16I),G===n.INT&&($=n.RG32I)),w===n.RGB_INTEGER&&(G===n.UNSIGNED_BYTE&&($=n.RGB8UI),G===n.UNSIGNED_SHORT&&($=n.RGB16UI),G===n.UNSIGNED_INT&&($=n.RGB32UI),G===n.BYTE&&($=n.RGB8I),G===n.SHORT&&($=n.RGB16I),G===n.INT&&($=n.RGB32I)),w===n.RGBA_INTEGER&&(G===n.UNSIGNED_BYTE&&($=n.RGBA8UI),G===n.UNSIGNED_SHORT&&($=n.RGBA16UI),G===n.UNSIGNED_INT&&($=n.RGBA32UI),G===n.BYTE&&($=n.RGBA8I),G===n.SHORT&&($=n.RGBA16I),G===n.INT&&($=n.RGBA32I)),w===n.RGB&&G===n.UNSIGNED_INT_5_9_9_9_REV&&($=n.RGB9_E5),w===n.RGBA){const Te=ne?ns:Qe.getTransfer(Z);G===n.FLOAT&&($=n.RGBA32F),G===n.HALF_FLOAT&&($=n.RGBA16F),G===n.UNSIGNED_BYTE&&($=Te===at?n.SRGB8_ALPHA8:n.RGBA8),G===n.UNSIGNED_SHORT_4_4_4_4&&($=n.RGBA4),G===n.UNSIGNED_SHORT_5_5_5_1&&($=n.RGB5_A1)}return($===n.R16F||$===n.R32F||$===n.RG16F||$===n.RG32F||$===n.RGBA16F||$===n.RGBA32F)&&e.get("EXT_color_buffer_float"),$}function M(C,w){let G;return C?w===null||w===1014||w===1020?G=n.DEPTH24_STENCIL8:w===1015?G=n.DEPTH32F_STENCIL8:w===1012&&(G=n.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):w===null||w===1014||w===1020?G=n.DEPTH_COMPONENT24:w===1015?G=n.DEPTH_COMPONENT32F:w===1012&&(G=n.DEPTH_COMPONENT16),G}function D(C,w){return m(C)===!0||C.isFramebufferTexture&&C.minFilter!==1003&&C.minFilter!==1006?Math.log2(Math.max(w.width,w.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?w.mipmaps.length:1}function R(C){const w=C.target;w.removeEventListener("dispose",R),T(w),w.isVideoTexture&&h.delete(w)}function A(C){const w=C.target;w.removeEventListener("dispose",A),x(w)}function T(C){const w=i.get(C);if(w.__webglInit===void 0)return;const G=C.source,Z=p.get(G);if(Z){const ne=Z[w.__cacheKey];ne.usedTimes--,ne.usedTimes===0&&S(C),Object.keys(Z).length===0&&p.delete(G)}i.remove(C)}function S(C){const w=i.get(C);n.deleteTexture(w.__webglTexture);const G=C.source,Z=p.get(G);delete Z[w.__cacheKey],o.memory.textures--}function x(C){const w=i.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),i.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let Z=0;Z<6;Z++){if(Array.isArray(w.__webglFramebuffer[Z]))for(let ne=0;ne<w.__webglFramebuffer[Z].length;ne++)n.deleteFramebuffer(w.__webglFramebuffer[Z][ne]);else n.deleteFramebuffer(w.__webglFramebuffer[Z]);w.__webglDepthbuffer&&n.deleteRenderbuffer(w.__webglDepthbuffer[Z])}else{if(Array.isArray(w.__webglFramebuffer))for(let Z=0;Z<w.__webglFramebuffer.length;Z++)n.deleteFramebuffer(w.__webglFramebuffer[Z]);else n.deleteFramebuffer(w.__webglFramebuffer);if(w.__webglDepthbuffer&&n.deleteRenderbuffer(w.__webglDepthbuffer),w.__webglMultisampledFramebuffer&&n.deleteFramebuffer(w.__webglMultisampledFramebuffer),w.__webglColorRenderbuffer)for(let Z=0;Z<w.__webglColorRenderbuffer.length;Z++)w.__webglColorRenderbuffer[Z]&&n.deleteRenderbuffer(w.__webglColorRenderbuffer[Z]);w.__webglDepthRenderbuffer&&n.deleteRenderbuffer(w.__webglDepthRenderbuffer)}const G=C.textures;for(let Z=0,ne=G.length;Z<ne;Z++){const $=i.get(G[Z]);$.__webglTexture&&(n.deleteTexture($.__webglTexture),o.memory.textures--),i.remove(G[Z])}i.remove(C)}let v=0;function I(){v=0}function U(){const C=v;return C>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+r.maxTextures),v+=1,C}function B(C){const w=[];return w.push(C.wrapS),w.push(C.wrapT),w.push(C.wrapR||0),w.push(C.magFilter),w.push(C.minFilter),w.push(C.anisotropy),w.push(C.internalFormat),w.push(C.format),w.push(C.type),w.push(C.generateMipmaps),w.push(C.premultiplyAlpha),w.push(C.flipY),w.push(C.unpackAlignment),w.push(C.colorSpace),w.join()}function q(C,w){const G=i.get(C);if(C.isVideoTexture&&de(C),C.isRenderTargetTexture===!1&&C.version>0&&G.__version!==C.version){const Z=C.image;if(Z===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(Z.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{W(G,C,w);return}}t.bindTexture(n.TEXTURE_2D,G.__webglTexture,n.TEXTURE0+w)}function z(C,w){const G=i.get(C);if(C.version>0&&G.__version!==C.version){W(G,C,w);return}t.bindTexture(n.TEXTURE_2D_ARRAY,G.__webglTexture,n.TEXTURE0+w)}function Y(C,w){const G=i.get(C);if(C.version>0&&G.__version!==C.version){W(G,C,w);return}t.bindTexture(n.TEXTURE_3D,G.__webglTexture,n.TEXTURE0+w)}function N(C,w){const G=i.get(C);if(C.version>0&&G.__version!==C.version){se(G,C,w);return}t.bindTexture(n.TEXTURE_CUBE_MAP,G.__webglTexture,n.TEXTURE0+w)}const j={1e3:n.REPEAT,1001:n.CLAMP_TO_EDGE,1002:n.MIRRORED_REPEAT},he={1003:n.NEAREST,1004:n.NEAREST_MIPMAP_NEAREST,1005:n.NEAREST_MIPMAP_LINEAR,1006:n.LINEAR,1007:n.LINEAR_MIPMAP_NEAREST,1008:n.LINEAR_MIPMAP_LINEAR},K={512:n.NEVER,519:n.ALWAYS,513:n.LESS,515:n.LEQUAL,514:n.EQUAL,518:n.GEQUAL,516:n.GREATER,517:n.NOTEQUAL};function ce(C,w){if(w.type===1015&&e.has("OES_texture_float_linear")===!1&&(w.magFilter===1006||w.magFilter===1007||w.magFilter===1005||w.magFilter===1008||w.minFilter===1006||w.minFilter===1007||w.minFilter===1005||w.minFilter===1008)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(C,n.TEXTURE_WRAP_S,j[w.wrapS]),n.texParameteri(C,n.TEXTURE_WRAP_T,j[w.wrapT]),(C===n.TEXTURE_3D||C===n.TEXTURE_2D_ARRAY)&&n.texParameteri(C,n.TEXTURE_WRAP_R,j[w.wrapR]),n.texParameteri(C,n.TEXTURE_MAG_FILTER,he[w.magFilter]),n.texParameteri(C,n.TEXTURE_MIN_FILTER,he[w.minFilter]),w.compareFunction&&(n.texParameteri(C,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(C,n.TEXTURE_COMPARE_FUNC,K[w.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(w.magFilter===1003||w.minFilter!==1005&&w.minFilter!==1008||w.type===1015&&e.has("OES_texture_float_linear")===!1)return;if(w.anisotropy>1||i.get(w).__currentAnisotropy){const G=e.get("EXT_texture_filter_anisotropic");n.texParameterf(C,G.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(w.anisotropy,r.getMaxAnisotropy())),i.get(w).__currentAnisotropy=w.anisotropy}}}function we(C,w){let G=!1;C.__webglInit===void 0&&(C.__webglInit=!0,w.addEventListener("dispose",R));const Z=w.source;let ne=p.get(Z);ne===void 0&&(ne={},p.set(Z,ne));const $=B(w);if($!==C.__cacheKey){ne[$]===void 0&&(ne[$]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,G=!0),ne[$].usedTimes++;const Te=ne[C.__cacheKey];Te!==void 0&&(ne[C.__cacheKey].usedTimes--,Te.usedTimes===0&&S(w)),C.__cacheKey=$,C.__webglTexture=ne[$].texture}return G}function W(C,w,G){let Z=n.TEXTURE_2D;(w.isDataArrayTexture||w.isCompressedArrayTexture)&&(Z=n.TEXTURE_2D_ARRAY),w.isData3DTexture&&(Z=n.TEXTURE_3D);const ne=we(C,w),$=w.source;t.bindTexture(Z,C.__webglTexture,n.TEXTURE0+G);const Te=i.get($);if($.version!==Te.__version||ne===!0){t.activeTexture(n.TEXTURE0+G);const pe=Qe.getPrimaries(Qe.workingColorSpace),Me=w.colorSpace===""?null:Qe.getPrimaries(w.colorSpace),je=w.colorSpace===""||pe===Me?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,w.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,w.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,je);let ae=_(w.image,!1,r.maxTextureSize);ae=De(w,ae);const xe=s.convert(w.format,w.colorSpace),Ne=s.convert(w.type);let ke=b(w.internalFormat,xe,Ne,w.colorSpace,w.isVideoTexture);ce(Z,w);let Se;const Ze=w.mipmaps,We=w.isVideoTexture!==!0,ut=Te.__version===void 0||ne===!0,F=$.dataReady,me=D(w,ae);if(w.isDepthTexture)ke=M(w.format===1027,w.type),ut&&(We?t.texStorage2D(n.TEXTURE_2D,1,ke,ae.width,ae.height):t.texImage2D(n.TEXTURE_2D,0,ke,ae.width,ae.height,0,xe,Ne,null));else if(w.isDataTexture)if(Ze.length>0){We&&ut&&t.texStorage2D(n.TEXTURE_2D,me,ke,Ze[0].width,Ze[0].height);for(let J=0,te=Ze.length;J<te;J++)Se=Ze[J],We?F&&t.texSubImage2D(n.TEXTURE_2D,J,0,0,Se.width,Se.height,xe,Ne,Se.data):t.texImage2D(n.TEXTURE_2D,J,ke,Se.width,Se.height,0,xe,Ne,Se.data);w.generateMipmaps=!1}else We?(ut&&t.texStorage2D(n.TEXTURE_2D,me,ke,ae.width,ae.height),F&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,ae.width,ae.height,xe,Ne,ae.data)):t.texImage2D(n.TEXTURE_2D,0,ke,ae.width,ae.height,0,xe,Ne,ae.data);else if(w.isCompressedTexture)if(w.isCompressedArrayTexture){We&&ut&&t.texStorage3D(n.TEXTURE_2D_ARRAY,me,ke,Ze[0].width,Ze[0].height,ae.depth);for(let J=0,te=Ze.length;J<te;J++)if(Se=Ze[J],w.format!==1023)if(xe!==null)if(We){if(F)if(w.layerUpdates.size>0){const ye=qa(Se.width,Se.height,w.format,w.type);for(const ge of w.layerUpdates){const Ge=Se.data.subarray(ge*ye/Se.data.BYTES_PER_ELEMENT,(ge+1)*ye/Se.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,J,0,0,ge,Se.width,Se.height,1,xe,Ge)}w.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,J,0,0,0,Se.width,Se.height,ae.depth,xe,Se.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,J,ke,Se.width,Se.height,ae.depth,0,Se.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else We?F&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,J,0,0,0,Se.width,Se.height,ae.depth,xe,Ne,Se.data):t.texImage3D(n.TEXTURE_2D_ARRAY,J,ke,Se.width,Se.height,ae.depth,0,xe,Ne,Se.data)}else{We&&ut&&t.texStorage2D(n.TEXTURE_2D,me,ke,Ze[0].width,Ze[0].height);for(let J=0,te=Ze.length;J<te;J++)Se=Ze[J],w.format!==1023?xe!==null?We?F&&t.compressedTexSubImage2D(n.TEXTURE_2D,J,0,0,Se.width,Se.height,xe,Se.data):t.compressedTexImage2D(n.TEXTURE_2D,J,ke,Se.width,Se.height,0,Se.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):We?F&&t.texSubImage2D(n.TEXTURE_2D,J,0,0,Se.width,Se.height,xe,Ne,Se.data):t.texImage2D(n.TEXTURE_2D,J,ke,Se.width,Se.height,0,xe,Ne,Se.data)}else if(w.isDataArrayTexture)if(We){if(ut&&t.texStorage3D(n.TEXTURE_2D_ARRAY,me,ke,ae.width,ae.height,ae.depth),F)if(w.layerUpdates.size>0){const J=qa(ae.width,ae.height,w.format,w.type);for(const te of w.layerUpdates){const ye=ae.data.subarray(te*J/ae.data.BYTES_PER_ELEMENT,(te+1)*J/ae.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,te,ae.width,ae.height,1,xe,Ne,ye)}w.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,ae.width,ae.height,ae.depth,xe,Ne,ae.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,ke,ae.width,ae.height,ae.depth,0,xe,Ne,ae.data);else if(w.isData3DTexture)We?(ut&&t.texStorage3D(n.TEXTURE_3D,me,ke,ae.width,ae.height,ae.depth),F&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,ae.width,ae.height,ae.depth,xe,Ne,ae.data)):t.texImage3D(n.TEXTURE_3D,0,ke,ae.width,ae.height,ae.depth,0,xe,Ne,ae.data);else if(w.isFramebufferTexture){if(ut)if(We)t.texStorage2D(n.TEXTURE_2D,me,ke,ae.width,ae.height);else{let J=ae.width,te=ae.height;for(let ye=0;ye<me;ye++)t.texImage2D(n.TEXTURE_2D,ye,ke,J,te,0,xe,Ne,null),J>>=1,te>>=1}}else if(Ze.length>0){if(We&&ut){const J=be(Ze[0]);t.texStorage2D(n.TEXTURE_2D,me,ke,J.width,J.height)}for(let J=0,te=Ze.length;J<te;J++)Se=Ze[J],We?F&&t.texSubImage2D(n.TEXTURE_2D,J,0,0,xe,Ne,Se):t.texImage2D(n.TEXTURE_2D,J,ke,xe,Ne,Se);w.generateMipmaps=!1}else if(We){if(ut){const J=be(ae);t.texStorage2D(n.TEXTURE_2D,me,ke,J.width,J.height)}F&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,xe,Ne,ae)}else t.texImage2D(n.TEXTURE_2D,0,ke,xe,Ne,ae);m(w)&&d(Z),Te.__version=$.version,w.onUpdate&&w.onUpdate(w)}C.__version=w.version}function se(C,w,G){if(w.image.length!==6)return;const Z=we(C,w),ne=w.source;t.bindTexture(n.TEXTURE_CUBE_MAP,C.__webglTexture,n.TEXTURE0+G);const $=i.get(ne);if(ne.version!==$.__version||Z===!0){t.activeTexture(n.TEXTURE0+G);const Te=Qe.getPrimaries(Qe.workingColorSpace),pe=w.colorSpace===""?null:Qe.getPrimaries(w.colorSpace),Me=w.colorSpace===""||Te===pe?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,w.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,w.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Me);const je=w.isCompressedTexture||w.image[0].isCompressedTexture,ae=w.image[0]&&w.image[0].isDataTexture,xe=[];for(let te=0;te<6;te++)!je&&!ae?xe[te]=_(w.image[te],!0,r.maxCubemapSize):xe[te]=ae?w.image[te].image:w.image[te],xe[te]=De(w,xe[te]);const Ne=xe[0],ke=s.convert(w.format,w.colorSpace),Se=s.convert(w.type),Ze=b(w.internalFormat,ke,Se,w.colorSpace),We=w.isVideoTexture!==!0,ut=$.__version===void 0||Z===!0,F=ne.dataReady;let me=D(w,Ne);ce(n.TEXTURE_CUBE_MAP,w);let J;if(je){We&&ut&&t.texStorage2D(n.TEXTURE_CUBE_MAP,me,Ze,Ne.width,Ne.height);for(let te=0;te<6;te++){J=xe[te].mipmaps;for(let ye=0;ye<J.length;ye++){const ge=J[ye];w.format!==1023?ke!==null?We?F&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,ye,0,0,ge.width,ge.height,ke,ge.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,ye,Ze,ge.width,ge.height,0,ge.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):We?F&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,ye,0,0,ge.width,ge.height,ke,Se,ge.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,ye,Ze,ge.width,ge.height,0,ke,Se,ge.data)}}}else{if(J=w.mipmaps,We&&ut){J.length>0&&me++;const te=be(xe[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,me,Ze,te.width,te.height)}for(let te=0;te<6;te++)if(ae){We?F&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,0,0,0,xe[te].width,xe[te].height,ke,Se,xe[te].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,0,Ze,xe[te].width,xe[te].height,0,ke,Se,xe[te].data);for(let ye=0;ye<J.length;ye++){const Ge=J[ye].image[te].image;We?F&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,ye+1,0,0,Ge.width,Ge.height,ke,Se,Ge.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,ye+1,Ze,Ge.width,Ge.height,0,ke,Se,Ge.data)}}else{We?F&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,0,0,0,ke,Se,xe[te]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,0,Ze,ke,Se,xe[te]);for(let ye=0;ye<J.length;ye++){const ge=J[ye];We?F&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,ye+1,0,0,ke,Se,ge.image[te]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+te,ye+1,Ze,ke,Se,ge.image[te])}}}m(w)&&d(n.TEXTURE_CUBE_MAP),$.__version=ne.version,w.onUpdate&&w.onUpdate(w)}C.__version=w.version}function re(C,w,G,Z,ne,$){const Te=s.convert(G.format,G.colorSpace),pe=s.convert(G.type),Me=b(G.internalFormat,Te,pe,G.colorSpace),je=i.get(w),ae=i.get(G);if(ae.__renderTarget=w,!je.__hasExternalTextures){const xe=Math.max(1,w.width>>$),Ne=Math.max(1,w.height>>$);ne===n.TEXTURE_3D||ne===n.TEXTURE_2D_ARRAY?t.texImage3D(ne,$,Me,xe,Ne,w.depth,0,Te,pe,null):t.texImage2D(ne,$,Me,xe,Ne,0,Te,pe,null)}t.bindFramebuffer(n.FRAMEBUFFER,C),ve(w)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,Z,ne,ae.__webglTexture,0,Q(w)):(ne===n.TEXTURE_2D||ne>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&ne<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,Z,ne,ae.__webglTexture,$),t.bindFramebuffer(n.FRAMEBUFFER,null)}function oe(C,w,G){if(n.bindRenderbuffer(n.RENDERBUFFER,C),w.depthBuffer){const Z=w.depthTexture,ne=Z&&Z.isDepthTexture?Z.type:null,$=M(w.stencilBuffer,ne),Te=w.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,pe=Q(w);ve(w)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,pe,$,w.width,w.height):G?n.renderbufferStorageMultisample(n.RENDERBUFFER,pe,$,w.width,w.height):n.renderbufferStorage(n.RENDERBUFFER,$,w.width,w.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,Te,n.RENDERBUFFER,C)}else{const Z=w.textures;for(let ne=0;ne<Z.length;ne++){const $=Z[ne],Te=s.convert($.format,$.colorSpace),pe=s.convert($.type),Me=b($.internalFormat,Te,pe,$.colorSpace),je=Q(w);G&&ve(w)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,je,Me,w.width,w.height):ve(w)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,je,Me,w.width,w.height):n.renderbufferStorage(n.RENDERBUFFER,Me,w.width,w.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function Ce(C,w){if(w&&w.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(n.FRAMEBUFFER,C),!(w.depthTexture&&w.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const Z=i.get(w.depthTexture);Z.__renderTarget=w,(!Z.__webglTexture||w.depthTexture.image.width!==w.width||w.depthTexture.image.height!==w.height)&&(w.depthTexture.image.width=w.width,w.depthTexture.image.height=w.height,w.depthTexture.needsUpdate=!0),q(w.depthTexture,0);const ne=Z.__webglTexture,$=Q(w);if(w.depthTexture.format===1026)ve(w)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,ne,0,$):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,ne,0);else if(w.depthTexture.format===1027)ve(w)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,ne,0,$):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,ne,0);else throw new Error("Unknown depthTexture format")}function Fe(C){const w=i.get(C),G=C.isWebGLCubeRenderTarget===!0;if(w.__boundDepthTexture!==C.depthTexture){const Z=C.depthTexture;if(w.__depthDisposeCallback&&w.__depthDisposeCallback(),Z){const ne=()=>{delete w.__boundDepthTexture,delete w.__depthDisposeCallback,Z.removeEventListener("dispose",ne)};Z.addEventListener("dispose",ne),w.__depthDisposeCallback=ne}w.__boundDepthTexture=Z}if(C.depthTexture&&!w.__autoAllocateDepthBuffer){if(G)throw new Error("target.depthTexture not supported in Cube render targets");Ce(w.__webglFramebuffer,C)}else if(G){w.__webglDepthbuffer=[];for(let Z=0;Z<6;Z++)if(t.bindFramebuffer(n.FRAMEBUFFER,w.__webglFramebuffer[Z]),w.__webglDepthbuffer[Z]===void 0)w.__webglDepthbuffer[Z]=n.createRenderbuffer(),oe(w.__webglDepthbuffer[Z],C,!1);else{const ne=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,$=w.__webglDepthbuffer[Z];n.bindRenderbuffer(n.RENDERBUFFER,$),n.framebufferRenderbuffer(n.FRAMEBUFFER,ne,n.RENDERBUFFER,$)}}else if(t.bindFramebuffer(n.FRAMEBUFFER,w.__webglFramebuffer),w.__webglDepthbuffer===void 0)w.__webglDepthbuffer=n.createRenderbuffer(),oe(w.__webglDepthbuffer,C,!1);else{const Z=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ne=w.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,ne),n.framebufferRenderbuffer(n.FRAMEBUFFER,Z,n.RENDERBUFFER,ne)}t.bindFramebuffer(n.FRAMEBUFFER,null)}function Le(C,w,G){const Z=i.get(C);w!==void 0&&re(Z.__webglFramebuffer,C,C.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),G!==void 0&&Fe(C)}function qe(C){const w=C.texture,G=i.get(C),Z=i.get(w);C.addEventListener("dispose",A);const ne=C.textures,$=C.isWebGLCubeRenderTarget===!0,Te=ne.length>1;if(Te||(Z.__webglTexture===void 0&&(Z.__webglTexture=n.createTexture()),Z.__version=w.version,o.memory.textures++),$){G.__webglFramebuffer=[];for(let pe=0;pe<6;pe++)if(w.mipmaps&&w.mipmaps.length>0){G.__webglFramebuffer[pe]=[];for(let Me=0;Me<w.mipmaps.length;Me++)G.__webglFramebuffer[pe][Me]=n.createFramebuffer()}else G.__webglFramebuffer[pe]=n.createFramebuffer()}else{if(w.mipmaps&&w.mipmaps.length>0){G.__webglFramebuffer=[];for(let pe=0;pe<w.mipmaps.length;pe++)G.__webglFramebuffer[pe]=n.createFramebuffer()}else G.__webglFramebuffer=n.createFramebuffer();if(Te)for(let pe=0,Me=ne.length;pe<Me;pe++){const je=i.get(ne[pe]);je.__webglTexture===void 0&&(je.__webglTexture=n.createTexture(),o.memory.textures++)}if(C.samples>0&&ve(C)===!1){G.__webglMultisampledFramebuffer=n.createFramebuffer(),G.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,G.__webglMultisampledFramebuffer);for(let pe=0;pe<ne.length;pe++){const Me=ne[pe];G.__webglColorRenderbuffer[pe]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,G.__webglColorRenderbuffer[pe]);const je=s.convert(Me.format,Me.colorSpace),ae=s.convert(Me.type),xe=b(Me.internalFormat,je,ae,Me.colorSpace,C.isXRRenderTarget===!0),Ne=Q(C);n.renderbufferStorageMultisample(n.RENDERBUFFER,Ne,xe,C.width,C.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+pe,n.RENDERBUFFER,G.__webglColorRenderbuffer[pe])}n.bindRenderbuffer(n.RENDERBUFFER,null),C.depthBuffer&&(G.__webglDepthRenderbuffer=n.createRenderbuffer(),oe(G.__webglDepthRenderbuffer,C,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if($){t.bindTexture(n.TEXTURE_CUBE_MAP,Z.__webglTexture),ce(n.TEXTURE_CUBE_MAP,w);for(let pe=0;pe<6;pe++)if(w.mipmaps&&w.mipmaps.length>0)for(let Me=0;Me<w.mipmaps.length;Me++)re(G.__webglFramebuffer[pe][Me],C,w,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+pe,Me);else re(G.__webglFramebuffer[pe],C,w,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+pe,0);m(w)&&d(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Te){for(let pe=0,Me=ne.length;pe<Me;pe++){const je=ne[pe],ae=i.get(je);t.bindTexture(n.TEXTURE_2D,ae.__webglTexture),ce(n.TEXTURE_2D,je),re(G.__webglFramebuffer,C,je,n.COLOR_ATTACHMENT0+pe,n.TEXTURE_2D,0),m(je)&&d(n.TEXTURE_2D)}t.unbindTexture()}else{let pe=n.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(pe=C.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(pe,Z.__webglTexture),ce(pe,w),w.mipmaps&&w.mipmaps.length>0)for(let Me=0;Me<w.mipmaps.length;Me++)re(G.__webglFramebuffer[Me],C,w,n.COLOR_ATTACHMENT0,pe,Me);else re(G.__webglFramebuffer,C,w,n.COLOR_ATTACHMENT0,pe,0);m(w)&&d(pe),t.unbindTexture()}C.depthBuffer&&Fe(C)}function ee(C){const w=C.textures;for(let G=0,Z=w.length;G<Z;G++){const ne=w[G];if(m(ne)){const $=y(C),Te=i.get(ne).__webglTexture;t.bindTexture($,Te),d($),t.unbindTexture()}}}const X=[],L=[];function ue(C){if(C.samples>0){if(ve(C)===!1){const w=C.textures,G=C.width,Z=C.height;let ne=n.COLOR_BUFFER_BIT;const $=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Te=i.get(C),pe=w.length>1;if(pe)for(let Me=0;Me<w.length;Me++)t.bindFramebuffer(n.FRAMEBUFFER,Te.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Me,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,Te.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Me,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,Te.__webglMultisampledFramebuffer),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Te.__webglFramebuffer);for(let Me=0;Me<w.length;Me++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(ne|=n.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(ne|=n.STENCIL_BUFFER_BIT)),pe){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,Te.__webglColorRenderbuffer[Me]);const je=i.get(w[Me]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,je,0)}n.blitFramebuffer(0,0,G,Z,0,0,G,Z,ne,n.NEAREST),l===!0&&(X.length=0,L.length=0,X.push(n.COLOR_ATTACHMENT0+Me),C.depthBuffer&&C.resolveDepthBuffer===!1&&(X.push($),L.push($),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,L)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,X))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),pe)for(let Me=0;Me<w.length;Me++){t.bindFramebuffer(n.FRAMEBUFFER,Te.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Me,n.RENDERBUFFER,Te.__webglColorRenderbuffer[Me]);const je=i.get(w[Me]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,Te.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Me,n.TEXTURE_2D,je,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Te.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&l){const w=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[w])}}}function Q(C){return Math.min(r.maxSamples,C.samples)}function ve(C){const w=i.get(C);return C.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&w.__useRenderToTexture!==!1}function de(C){const w=o.render.frame;h.get(C)!==w&&(h.set(C,w),C.update())}function De(C,w){const G=C.colorSpace,Z=C.format,ne=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||G!==xi&&G!==""&&(Qe.getTransfer(G)===at?(Z!==1023||ne!==1009)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",G)),w}function be(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=U,this.resetTextureUnits=I,this.setTexture2D=q,this.setTexture2DArray=z,this.setTexture3D=Y,this.setTextureCube=N,this.rebindTextures=Le,this.setupRenderTarget=qe,this.updateRenderTargetMipmap=ee,this.updateMultisampleRenderTarget=ue,this.setupDepthRenderbuffer=Fe,this.setupFrameBufferTexture=re,this.useMultisampledRTT=ve}function _m(n,e){function t(i,r=""){let s;const o=Qe.getTransfer(r);if(i===1009)return n.UNSIGNED_BYTE;if(i===1017)return n.UNSIGNED_SHORT_4_4_4_4;if(i===1018)return n.UNSIGNED_SHORT_5_5_5_1;if(i===35902)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===1010)return n.BYTE;if(i===1011)return n.SHORT;if(i===1012)return n.UNSIGNED_SHORT;if(i===1013)return n.INT;if(i===1014)return n.UNSIGNED_INT;if(i===1015)return n.FLOAT;if(i===1016)return n.HALF_FLOAT;if(i===1021)return n.ALPHA;if(i===1022)return n.RGB;if(i===1023)return n.RGBA;if(i===1024)return n.LUMINANCE;if(i===1025)return n.LUMINANCE_ALPHA;if(i===1026)return n.DEPTH_COMPONENT;if(i===1027)return n.DEPTH_STENCIL;if(i===1028)return n.RED;if(i===1029)return n.RED_INTEGER;if(i===1030)return n.RG;if(i===1031)return n.RG_INTEGER;if(i===1033)return n.RGBA_INTEGER;if(i===33776||i===33777||i===33778||i===33779)if(o===at)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(i===33776)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===33777)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===33778)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===33779)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(i===33776)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===33777)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===33778)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===33779)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===35840||i===35841||i===35842||i===35843)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(i===35840)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===35841)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===35842)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===35843)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===36196||i===37492||i===37496)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(i===36196||i===37492)return o===at?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(i===37496)return o===at?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===37808||i===37809||i===37810||i===37811||i===37812||i===37813||i===37814||i===37815||i===37816||i===37817||i===37818||i===37819||i===37820||i===37821)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(i===37808)return o===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===37809)return o===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===37810)return o===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===37811)return o===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===37812)return o===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===37813)return o===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===37814)return o===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===37815)return o===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===37816)return o===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===37817)return o===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===37818)return o===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===37819)return o===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===37820)return o===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===37821)return o===at?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===36492||i===36494||i===36495)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(i===36492)return o===at?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===36494)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===36495)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===36283||i===36284||i===36285||i===36286)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(i===36492)return s.COMPRESSED_RED_RGTC1_EXT;if(i===36284)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===36285)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===36286)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===1020?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}class ym extends Vt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class qt extends yt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const vm={type:"move"};class zs{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new qt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new qt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new qt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let r=null,s=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(const _ of e.hand.values()){const m=t.getJointPose(_,i),d=this._getHandJoint(c,_);m!==null&&(d.matrix.fromArray(m.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=m.radius),d.visible=m!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],p=h.position.distanceTo(u.position),f=.02,g=.005;c.inputState.pinching&&p>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&p<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,i),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(r=t.getPose(e.targetRaySpace,i),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(vm)))}return a!==null&&(a.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new qt;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}const bm=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Mm=`
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

}`;class xm{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,i){if(this.texture===null){const r=new Ct,s=e.properties.get(r);s.__webglTexture=t.texture,(t.depthNear!=i.depthNear||t.depthFar!=i.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=r}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,i=new Ln({vertexShader:bm,fragmentShader:Mm,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new ht(new nr(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Sm extends Si{constructor(e,t){super();const i=this;let r=null,s=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,p=null,f=null,g=null;const _=new xm,m=t.getContextAttributes();let d=null,y=null;const b=[],M=[],D=new ie;let R=null;const A=new Vt;A.viewport=new tt;const T=new Vt;T.viewport=new tt;const S=[A,T],x=new ym;let v=null,I=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(W){let se=b[W];return se===void 0&&(se=new zs,b[W]=se),se.getTargetRaySpace()},this.getControllerGrip=function(W){let se=b[W];return se===void 0&&(se=new zs,b[W]=se),se.getGripSpace()},this.getHand=function(W){let se=b[W];return se===void 0&&(se=new zs,b[W]=se),se.getHandSpace()};function U(W){const se=M.indexOf(W.inputSource);if(se===-1)return;const re=b[se];re!==void 0&&(re.update(W.inputSource,W.frame,c||o),re.dispatchEvent({type:W.type,data:W.inputSource}))}function B(){r.removeEventListener("select",U),r.removeEventListener("selectstart",U),r.removeEventListener("selectend",U),r.removeEventListener("squeeze",U),r.removeEventListener("squeezestart",U),r.removeEventListener("squeezeend",U),r.removeEventListener("end",B),r.removeEventListener("inputsourceschange",q);for(let W=0;W<b.length;W++){const se=M[W];se!==null&&(M[W]=null,b[W].disconnect(se))}v=null,I=null,_.reset(),e.setRenderTarget(d),f=null,p=null,u=null,r=null,y=null,we.stop(),i.isPresenting=!1,e.setPixelRatio(R),e.setSize(D.width,D.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(W){s=W,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(W){a=W,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(W){c=W},this.getBaseLayer=function(){return p!==null?p:f},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return r},this.setSession=async function(W){if(r=W,r!==null){if(d=e.getRenderTarget(),r.addEventListener("select",U),r.addEventListener("selectstart",U),r.addEventListener("selectend",U),r.addEventListener("squeeze",U),r.addEventListener("squeezestart",U),r.addEventListener("squeezeend",U),r.addEventListener("end",B),r.addEventListener("inputsourceschange",q),m.xrCompatible!==!0&&await t.makeXRCompatible(),R=e.getPixelRatio(),e.getSize(D),r.renderState.layers===void 0){const se={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:s};f=new XRWebGLLayer(r,t,se),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new Wn(f.framebufferWidth,f.framebufferHeight,{format:1023,type:1009,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil})}else{let se=null,re=null,oe=null;m.depth&&(oe=m.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,se=m.stencil?1027:1026,re=m.stencil?1020:1014);const Ce={colorFormat:t.RGBA8,depthFormat:oe,scaleFactor:s};u=new XRWebGLBinding(r,t),p=u.createProjectionLayer(Ce),r.updateRenderState({layers:[p]}),e.setPixelRatio(1),e.setSize(p.textureWidth,p.textureHeight,!1),y=new Wn(p.textureWidth,p.textureHeight,{format:1023,type:1009,depthTexture:new Zl(p.textureWidth,p.textureHeight,re,void 0,void 0,void 0,void 0,void 0,void 0,se),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:p.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await r.requestReferenceSpace(a),we.setContext(r),we.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function q(W){for(let se=0;se<W.removed.length;se++){const re=W.removed[se],oe=M.indexOf(re);oe>=0&&(M[oe]=null,b[oe].disconnect(re))}for(let se=0;se<W.added.length;se++){const re=W.added[se];let oe=M.indexOf(re);if(oe===-1){for(let Fe=0;Fe<b.length;Fe++)if(Fe>=M.length){M.push(re),oe=Fe;break}else if(M[Fe]===null){M[Fe]=re,oe=Fe;break}if(oe===-1)break}const Ce=b[oe];Ce&&Ce.connect(re)}}const z=new P,Y=new P;function N(W,se,re){z.setFromMatrixPosition(se.matrixWorld),Y.setFromMatrixPosition(re.matrixWorld);const oe=z.distanceTo(Y),Ce=se.projectionMatrix.elements,Fe=re.projectionMatrix.elements,Le=Ce[14]/(Ce[10]-1),qe=Ce[14]/(Ce[10]+1),ee=(Ce[9]+1)/Ce[5],X=(Ce[9]-1)/Ce[5],L=(Ce[8]-1)/Ce[0],ue=(Fe[8]+1)/Fe[0],Q=Le*L,ve=Le*ue,de=oe/(-L+ue),De=de*-L;if(se.matrixWorld.decompose(W.position,W.quaternion,W.scale),W.translateX(De),W.translateZ(de),W.matrixWorld.compose(W.position,W.quaternion,W.scale),W.matrixWorldInverse.copy(W.matrixWorld).invert(),Ce[10]===-1)W.projectionMatrix.copy(se.projectionMatrix),W.projectionMatrixInverse.copy(se.projectionMatrixInverse);else{const be=Le+de,C=qe+de,w=Q-De,G=ve+(oe-De),Z=ee*qe/C*be,ne=X*qe/C*be;W.projectionMatrix.makePerspective(w,G,Z,ne,be,C),W.projectionMatrixInverse.copy(W.projectionMatrix).invert()}}function j(W,se){se===null?W.matrixWorld.copy(W.matrix):W.matrixWorld.multiplyMatrices(se.matrixWorld,W.matrix),W.matrixWorldInverse.copy(W.matrixWorld).invert()}this.updateCamera=function(W){if(r===null)return;let se=W.near,re=W.far;_.texture!==null&&(_.depthNear>0&&(se=_.depthNear),_.depthFar>0&&(re=_.depthFar)),x.near=T.near=A.near=se,x.far=T.far=A.far=re,(v!==x.near||I!==x.far)&&(r.updateRenderState({depthNear:x.near,depthFar:x.far}),v=x.near,I=x.far),A.layers.mask=W.layers.mask|2,T.layers.mask=W.layers.mask|4,x.layers.mask=A.layers.mask|T.layers.mask;const oe=W.parent,Ce=x.cameras;j(x,oe);for(let Fe=0;Fe<Ce.length;Fe++)j(Ce[Fe],oe);Ce.length===2?N(x,A,T):x.projectionMatrix.copy(A.projectionMatrix),he(W,x,oe)};function he(W,se,re){re===null?W.matrix.copy(se.matrixWorld):(W.matrix.copy(re.matrixWorld),W.matrix.invert(),W.matrix.multiply(se.matrixWorld)),W.matrix.decompose(W.position,W.quaternion,W.scale),W.updateMatrixWorld(!0),W.projectionMatrix.copy(se.projectionMatrix),W.projectionMatrixInverse.copy(se.projectionMatrixInverse),W.isPerspectiveCamera&&(W.fov=yi*2*Math.atan(1/W.projectionMatrix.elements[5]),W.zoom=1)}this.getCamera=function(){return x},this.getFoveation=function(){if(!(p===null&&f===null))return l},this.setFoveation=function(W){l=W,p!==null&&(p.fixedFoveation=W),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=W)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(x)};let K=null;function ce(W,se){if(h=se.getViewerPose(c||o),g=se,h!==null){const re=h.views;f!==null&&(e.setRenderTargetFramebuffer(y,f.framebuffer),e.setRenderTarget(y));let oe=!1;re.length!==x.cameras.length&&(x.cameras.length=0,oe=!0);for(let Fe=0;Fe<re.length;Fe++){const Le=re[Fe];let qe=null;if(f!==null)qe=f.getViewport(Le);else{const X=u.getViewSubImage(p,Le);qe=X.viewport,Fe===0&&(e.setRenderTargetTextures(y,X.colorTexture,p.ignoreDepthValues?void 0:X.depthStencilTexture),e.setRenderTarget(y))}let ee=S[Fe];ee===void 0&&(ee=new Vt,ee.layers.enable(Fe),ee.viewport=new tt,S[Fe]=ee),ee.matrix.fromArray(Le.transform.matrix),ee.matrix.decompose(ee.position,ee.quaternion,ee.scale),ee.projectionMatrix.fromArray(Le.projectionMatrix),ee.projectionMatrixInverse.copy(ee.projectionMatrix).invert(),ee.viewport.set(qe.x,qe.y,qe.width,qe.height),Fe===0&&(x.matrix.copy(ee.matrix),x.matrix.decompose(x.position,x.quaternion,x.scale)),oe===!0&&x.cameras.push(ee)}const Ce=r.enabledFeatures;if(Ce&&Ce.includes("depth-sensing")){const Fe=u.getDepthInformation(re[0]);Fe&&Fe.isValid&&Fe.texture&&_.init(e,Fe,r.renderState)}}for(let re=0;re<b.length;re++){const oe=M[re],Ce=b[re];oe!==null&&Ce!==void 0&&Ce.update(oe,se,c||o)}K&&K(W,se),se.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:se}),g=null}const we=new Kl;we.setAnimationLoop(ce),this.setAnimationLoop=function(W){K=W},this.dispose=function(){}}}const Bn=new tn,wm=new Be;function Tm(n,e){function t(m,d){m.matrixAutoUpdate===!0&&m.updateMatrix(),d.value.copy(m.matrix)}function i(m,d){d.color.getRGB(m.fogColor.value,Yl(n)),d.isFog?(m.fogNear.value=d.near,m.fogFar.value=d.far):d.isFogExp2&&(m.fogDensity.value=d.density)}function r(m,d,y,b,M){d.isMeshBasicMaterial||d.isMeshLambertMaterial?s(m,d):d.isMeshToonMaterial?(s(m,d),u(m,d)):d.isMeshPhongMaterial?(s(m,d),h(m,d)):d.isMeshStandardMaterial?(s(m,d),p(m,d),d.isMeshPhysicalMaterial&&f(m,d,M)):d.isMeshMatcapMaterial?(s(m,d),g(m,d)):d.isMeshDepthMaterial?s(m,d):d.isMeshDistanceMaterial?(s(m,d),_(m,d)):d.isMeshNormalMaterial?s(m,d):d.isLineBasicMaterial?(o(m,d),d.isLineDashedMaterial&&a(m,d)):d.isPointsMaterial?l(m,d,y,b):d.isSpriteMaterial?c(m,d):d.isShadowMaterial?(m.color.value.copy(d.color),m.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function s(m,d){m.opacity.value=d.opacity,d.color&&m.diffuse.value.copy(d.color),d.emissive&&m.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(m.map.value=d.map,t(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.bumpMap&&(m.bumpMap.value=d.bumpMap,t(d.bumpMap,m.bumpMapTransform),m.bumpScale.value=d.bumpScale,d.side===1&&(m.bumpScale.value*=-1)),d.normalMap&&(m.normalMap.value=d.normalMap,t(d.normalMap,m.normalMapTransform),m.normalScale.value.copy(d.normalScale),d.side===1&&m.normalScale.value.negate()),d.displacementMap&&(m.displacementMap.value=d.displacementMap,t(d.displacementMap,m.displacementMapTransform),m.displacementScale.value=d.displacementScale,m.displacementBias.value=d.displacementBias),d.emissiveMap&&(m.emissiveMap.value=d.emissiveMap,t(d.emissiveMap,m.emissiveMapTransform)),d.specularMap&&(m.specularMap.value=d.specularMap,t(d.specularMap,m.specularMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest);const y=e.get(d),b=y.envMap,M=y.envMapRotation;b&&(m.envMap.value=b,Bn.copy(M),Bn.x*=-1,Bn.y*=-1,Bn.z*=-1,b.isCubeTexture&&b.isRenderTargetTexture===!1&&(Bn.y*=-1,Bn.z*=-1),m.envMapRotation.value.setFromMatrix4(wm.makeRotationFromEuler(Bn)),m.flipEnvMap.value=b.isCubeTexture&&b.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=d.reflectivity,m.ior.value=d.ior,m.refractionRatio.value=d.refractionRatio),d.lightMap&&(m.lightMap.value=d.lightMap,m.lightMapIntensity.value=d.lightMapIntensity,t(d.lightMap,m.lightMapTransform)),d.aoMap&&(m.aoMap.value=d.aoMap,m.aoMapIntensity.value=d.aoMapIntensity,t(d.aoMap,m.aoMapTransform))}function o(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,d.map&&(m.map.value=d.map,t(d.map,m.mapTransform))}function a(m,d){m.dashSize.value=d.dashSize,m.totalSize.value=d.dashSize+d.gapSize,m.scale.value=d.scale}function l(m,d,y,b){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.size.value=d.size*y,m.scale.value=b*.5,d.map&&(m.map.value=d.map,t(d.map,m.uvTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function c(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.rotation.value=d.rotation,d.map&&(m.map.value=d.map,t(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function h(m,d){m.specular.value.copy(d.specular),m.shininess.value=Math.max(d.shininess,1e-4)}function u(m,d){d.gradientMap&&(m.gradientMap.value=d.gradientMap)}function p(m,d){m.metalness.value=d.metalness,d.metalnessMap&&(m.metalnessMap.value=d.metalnessMap,t(d.metalnessMap,m.metalnessMapTransform)),m.roughness.value=d.roughness,d.roughnessMap&&(m.roughnessMap.value=d.roughnessMap,t(d.roughnessMap,m.roughnessMapTransform)),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)}function f(m,d,y){m.ior.value=d.ior,d.sheen>0&&(m.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),m.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(m.sheenColorMap.value=d.sheenColorMap,t(d.sheenColorMap,m.sheenColorMapTransform)),d.sheenRoughnessMap&&(m.sheenRoughnessMap.value=d.sheenRoughnessMap,t(d.sheenRoughnessMap,m.sheenRoughnessMapTransform))),d.clearcoat>0&&(m.clearcoat.value=d.clearcoat,m.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(m.clearcoatMap.value=d.clearcoatMap,t(d.clearcoatMap,m.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,t(d.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(m.clearcoatNormalMap.value=d.clearcoatNormalMap,t(d.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===1&&m.clearcoatNormalScale.value.negate())),d.dispersion>0&&(m.dispersion.value=d.dispersion),d.iridescence>0&&(m.iridescence.value=d.iridescence,m.iridescenceIOR.value=d.iridescenceIOR,m.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(m.iridescenceMap.value=d.iridescenceMap,t(d.iridescenceMap,m.iridescenceMapTransform)),d.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=d.iridescenceThicknessMap,t(d.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),d.transmission>0&&(m.transmission.value=d.transmission,m.transmissionSamplerMap.value=y.texture,m.transmissionSamplerSize.value.set(y.width,y.height),d.transmissionMap&&(m.transmissionMap.value=d.transmissionMap,t(d.transmissionMap,m.transmissionMapTransform)),m.thickness.value=d.thickness,d.thicknessMap&&(m.thicknessMap.value=d.thicknessMap,t(d.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=d.attenuationDistance,m.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(m.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(m.anisotropyMap.value=d.anisotropyMap,t(d.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=d.specularIntensity,m.specularColor.value.copy(d.specularColor),d.specularColorMap&&(m.specularColorMap.value=d.specularColorMap,t(d.specularColorMap,m.specularColorMapTransform)),d.specularIntensityMap&&(m.specularIntensityMap.value=d.specularIntensityMap,t(d.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,d){d.matcap&&(m.matcap.value=d.matcap)}function _(m,d){const y=e.get(d).light;m.referencePosition.value.setFromMatrixPosition(y.matrixWorld),m.nearDistance.value=y.shadow.camera.near,m.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function Em(n,e,t,i){let r={},s={},o=[];const a=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,b){const M=b.program;i.uniformBlockBinding(y,M)}function c(y,b){let M=r[y.id];M===void 0&&(g(y),M=h(y),r[y.id]=M,y.addEventListener("dispose",m));const D=b.program;i.updateUBOMapping(y,D);const R=e.render.frame;s[y.id]!==R&&(p(y),s[y.id]=R)}function h(y){const b=u();y.__bindingPointIndex=b;const M=n.createBuffer(),D=y.__size,R=y.usage;return n.bindBuffer(n.UNIFORM_BUFFER,M),n.bufferData(n.UNIFORM_BUFFER,D,R),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,b,M),M}function u(){for(let y=0;y<a;y++)if(o.indexOf(y)===-1)return o.push(y),y;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function p(y){const b=r[y.id],M=y.uniforms,D=y.__cache;n.bindBuffer(n.UNIFORM_BUFFER,b);for(let R=0,A=M.length;R<A;R++){const T=Array.isArray(M[R])?M[R]:[M[R]];for(let S=0,x=T.length;S<x;S++){const v=T[S];if(f(v,R,S,D)===!0){const I=v.__offset,U=Array.isArray(v.value)?v.value:[v.value];let B=0;for(let q=0;q<U.length;q++){const z=U[q],Y=_(z);typeof z=="number"||typeof z=="boolean"?(v.__data[0]=z,n.bufferSubData(n.UNIFORM_BUFFER,I+B,v.__data)):z.isMatrix3?(v.__data[0]=z.elements[0],v.__data[1]=z.elements[1],v.__data[2]=z.elements[2],v.__data[3]=0,v.__data[4]=z.elements[3],v.__data[5]=z.elements[4],v.__data[6]=z.elements[5],v.__data[7]=0,v.__data[8]=z.elements[6],v.__data[9]=z.elements[7],v.__data[10]=z.elements[8],v.__data[11]=0):(z.toArray(v.__data,B),B+=Y.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,I,v.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function f(y,b,M,D){const R=y.value,A=b+"_"+M;if(D[A]===void 0)return typeof R=="number"||typeof R=="boolean"?D[A]=R:D[A]=R.clone(),!0;{const T=D[A];if(typeof R=="number"||typeof R=="boolean"){if(T!==R)return D[A]=R,!0}else if(T.equals(R)===!1)return T.copy(R),!0}return!1}function g(y){const b=y.uniforms;let M=0;const D=16;for(let A=0,T=b.length;A<T;A++){const S=Array.isArray(b[A])?b[A]:[b[A]];for(let x=0,v=S.length;x<v;x++){const I=S[x],U=Array.isArray(I.value)?I.value:[I.value];for(let B=0,q=U.length;B<q;B++){const z=U[B],Y=_(z),N=M%D,j=N%Y.boundary,he=N+j;M+=j,he!==0&&D-he<Y.storage&&(M+=D-he),I.__data=new Float32Array(Y.storage/Float32Array.BYTES_PER_ELEMENT),I.__offset=M,M+=Y.storage}}}const R=M%D;return R>0&&(M+=D-R),y.__size=M,y.__cache={},this}function _(y){const b={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(b.boundary=4,b.storage=4):y.isVector2?(b.boundary=8,b.storage=8):y.isVector3||y.isColor?(b.boundary=16,b.storage=12):y.isVector4?(b.boundary=16,b.storage=16):y.isMatrix3?(b.boundary=48,b.storage=48):y.isMatrix4?(b.boundary=64,b.storage=64):y.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",y),b}function m(y){const b=y.target;b.removeEventListener("dispose",m);const M=o.indexOf(b.__bindingPointIndex);o.splice(M,1),n.deleteBuffer(r[b.id]),delete r[b.id],delete s[b.id]}function d(){for(const y in r)n.deleteBuffer(r[y]);o=[],r={},s={}}return{bind:l,update:c,dispose:d}}class A_{constructor(e={}){const{canvas:t=uh(),context:i=null,depth:r=!0,stencil:s=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reverseDepthBuffer:p=!1}=e;this.isWebGLRenderer=!0;let f;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=i.getContextAttributes().alpha}else f=o;const g=new Uint32Array(4),_=new Int32Array(4);let m=null,d=null;const y=[],b=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Gt,this.toneMapping=0,this.toneMappingExposure=1;const M=this;let D=!1,R=0,A=0,T=null,S=-1,x=null;const v=new tt,I=new tt;let U=null;const B=new Ie(0);let q=0,z=t.width,Y=t.height,N=1,j=null,he=null;const K=new tt(0,0,z,Y),ce=new tt(0,0,z,Y);let we=!1;const W=new Ro;let se=!1,re=!1;const oe=new Be,Ce=new Be,Fe=new P,Le=new tt,qe={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let ee=!1;function X(){return T===null?N:1}let L=i;function ue(E,k){return t.getContext(E,k)}try{const E={alpha:!0,depth:r,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine","three.js r170"),t.addEventListener("webglcontextlost",te,!1),t.addEventListener("webglcontextrestored",ye,!1),t.addEventListener("webglcontextcreationerror",ge,!1),L===null){const k="webgl2";if(L=ue(k,E),L===null)throw ue(k)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(E){throw console.error("THREE.WebGLRenderer: "+E.message),E}let Q,ve,de,De,be,C,w,G,Z,ne,$,Te,pe,Me,je,ae,xe,Ne,ke,Se,Ze,We,ut,F;function me(){Q=new If(L),Q.init(),We=new _m(L,Q),ve=new Ef(L,Q,e,We),de=new pm(L,Q),ve.reverseDepthBuffer&&p&&de.buffers.depth.setReversed(!0),De=new Uf(L),be=new Qp,C=new gm(L,Q,de,be,ve,We,De),w=new Rf(M),G=new Lf(M),Z=new Gh(L),ut=new wf(L,Z),ne=new Df(L,Z,De,ut),$=new kf(L,ne,Z,De),ke=new Ff(L,ve,C),ae=new Af(be),Te=new $p(M,w,G,Q,ve,ut,ae),pe=new Tm(M,be),Me=new tm,je=new am(Q),Ne=new Sf(M,w,G,de,$,f,l),xe=new dm(M,$,ve),F=new Em(L,De,ve,de),Se=new Tf(L,Q,De),Ze=new Nf(L,Q,De),De.programs=Te.programs,M.capabilities=ve,M.extensions=Q,M.properties=be,M.renderLists=Me,M.shadowMap=xe,M.state=de,M.info=De}me();const J=new Sm(M,L);this.xr=J,this.getContext=function(){return L},this.getContextAttributes=function(){return L.getContextAttributes()},this.forceContextLoss=function(){const E=Q.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){const E=Q.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return N},this.setPixelRatio=function(E){E!==void 0&&(N=E,this.setSize(z,Y,!1))},this.getSize=function(E){return E.set(z,Y)},this.setSize=function(E,k,V=!0){if(J.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}z=E,Y=k,t.width=Math.floor(E*N),t.height=Math.floor(k*N),V===!0&&(t.style.width=E+"px",t.style.height=k+"px"),this.setViewport(0,0,E,k)},this.getDrawingBufferSize=function(E){return E.set(z*N,Y*N).floor()},this.setDrawingBufferSize=function(E,k,V){z=E,Y=k,N=V,t.width=Math.floor(E*V),t.height=Math.floor(k*V),this.setViewport(0,0,E,k)},this.getCurrentViewport=function(E){return E.copy(v)},this.getViewport=function(E){return E.copy(K)},this.setViewport=function(E,k,V,H){E.isVector4?K.set(E.x,E.y,E.z,E.w):K.set(E,k,V,H),de.viewport(v.copy(K).multiplyScalar(N).round())},this.getScissor=function(E){return E.copy(ce)},this.setScissor=function(E,k,V,H){E.isVector4?ce.set(E.x,E.y,E.z,E.w):ce.set(E,k,V,H),de.scissor(I.copy(ce).multiplyScalar(N).round())},this.getScissorTest=function(){return we},this.setScissorTest=function(E){de.setScissorTest(we=E)},this.setOpaqueSort=function(E){j=E},this.setTransparentSort=function(E){he=E},this.getClearColor=function(E){return E.copy(Ne.getClearColor())},this.setClearColor=function(){Ne.setClearColor.apply(Ne,arguments)},this.getClearAlpha=function(){return Ne.getClearAlpha()},this.setClearAlpha=function(){Ne.setClearAlpha.apply(Ne,arguments)},this.clear=function(E=!0,k=!0,V=!0){let H=0;if(E){let O=!1;if(T!==null){const le=T.texture.format;O=le===1033||le===1031||le===1029}if(O){const le=T.texture.type,_e=le===1009||le===1014||le===1012||le===1020||le===1017||le===1018,Ee=Ne.getClearColor(),Ae=Ne.getClearAlpha(),Oe=Ee.r,Ve=Ee.g,Re=Ee.b;_e?(g[0]=Oe,g[1]=Ve,g[2]=Re,g[3]=Ae,L.clearBufferuiv(L.COLOR,0,g)):(_[0]=Oe,_[1]=Ve,_[2]=Re,_[3]=Ae,L.clearBufferiv(L.COLOR,0,_))}else H|=L.COLOR_BUFFER_BIT}k&&(H|=L.DEPTH_BUFFER_BIT),V&&(H|=L.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),L.clear(H)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",te,!1),t.removeEventListener("webglcontextrestored",ye,!1),t.removeEventListener("webglcontextcreationerror",ge,!1),Me.dispose(),je.dispose(),be.dispose(),w.dispose(),G.dispose(),$.dispose(),ut.dispose(),F.dispose(),Te.dispose(),J.dispose(),J.removeEventListener("sessionstart",Yo),J.removeEventListener("sessionend",qo),Dn.stop()};function te(E){E.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),D=!0}function ye(){console.log("THREE.WebGLRenderer: Context Restored."),D=!1;const E=De.autoReset,k=xe.enabled,V=xe.autoUpdate,H=xe.needsUpdate,O=xe.type;me(),De.autoReset=E,xe.enabled=k,xe.autoUpdate=V,xe.needsUpdate=H,xe.type=O}function ge(E){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function Ge(E){const k=E.target;k.removeEventListener("dispose",Ge),bt(k)}function bt(E){Pt(E),be.remove(E)}function Pt(E){const k=be.get(E).programs;k!==void 0&&(k.forEach(function(V){Te.releaseProgram(V)}),E.isShaderMaterial&&Te.releaseShaderCache(E))}this.renderBufferDirect=function(E,k,V,H,O,le){k===null&&(k=qe);const _e=O.isMesh&&O.matrixWorld.determinant()<0,Ee=Xc(E,k,V,H,O);de.setMaterial(H,_e);let Ae=V.index,Oe=1;if(H.wireframe===!0){if(Ae=ne.getWireframeAttribute(V),Ae===void 0)return;Oe=2}const Ve=V.drawRange,Re=V.attributes.position;let et=Ve.start*Oe,dt=(Ve.start+Ve.count)*Oe;le!==null&&(et=Math.max(et,le.start*Oe),dt=Math.min(dt,(le.start+le.count)*Oe)),Ae!==null?(et=Math.max(et,0),dt=Math.min(dt,Ae.count)):Re!=null&&(et=Math.max(et,0),dt=Math.min(dt,Re.count));const pt=dt-et;if(pt<0||pt===1/0)return;ut.setup(O,H,Ee,V,Ae);let kt,nt=Se;if(Ae!==null&&(kt=Z.get(Ae),nt=Ze,nt.setIndex(kt)),O.isMesh)H.wireframe===!0?(de.setLineWidth(H.wireframeLinewidth*X()),nt.setMode(L.LINES)):nt.setMode(L.TRIANGLES);else if(O.isLine){let Pe=H.linewidth;Pe===void 0&&(Pe=1),de.setLineWidth(Pe*X()),O.isLineSegments?nt.setMode(L.LINES):O.isLineLoop?nt.setMode(L.LINE_LOOP):nt.setMode(L.LINE_STRIP)}else O.isPoints?nt.setMode(L.POINTS):O.isSprite&&nt.setMode(L.TRIANGLES);if(O.isBatchedMesh)if(O._multiDrawInstances!==null)nt.renderMultiDrawInstances(O._multiDrawStarts,O._multiDrawCounts,O._multiDrawCount,O._multiDrawInstances);else if(Q.get("WEBGL_multi_draw"))nt.renderMultiDraw(O._multiDrawStarts,O._multiDrawCounts,O._multiDrawCount);else{const Pe=O._multiDrawStarts,cn=O._multiDrawCounts,it=O._multiDrawCount,Jt=Ae?Z.get(Ae).bytesPerElement:1,Yn=be.get(H).currentProgram.getUniforms();for(let Ot=0;Ot<it;Ot++)Yn.setValue(L,"_gl_DrawID",Ot),nt.render(Pe[Ot]/Jt,cn[Ot])}else if(O.isInstancedMesh)nt.renderInstances(et,pt,O.count);else if(V.isInstancedBufferGeometry){const Pe=V._maxInstanceCount!==void 0?V._maxInstanceCount:1/0,cn=Math.min(V.instanceCount,Pe);nt.renderInstances(et,pt,cn)}else nt.render(et,pt)};function rt(E,k,V){E.transparent===!0&&E.side===2&&E.forceSinglePass===!1?(E.side=1,E.needsUpdate=!0,sr(E,k,V),E.side=0,E.needsUpdate=!0,sr(E,k,V),E.side=2):sr(E,k,V)}this.compile=function(E,k,V=null){V===null&&(V=E),d=je.get(V),d.init(k),b.push(d),V.traverseVisible(function(O){O.isLight&&O.layers.test(k.layers)&&(d.pushLight(O),O.castShadow&&d.pushShadow(O))}),E!==V&&E.traverseVisible(function(O){O.isLight&&O.layers.test(k.layers)&&(d.pushLight(O),O.castShadow&&d.pushShadow(O))}),d.setupLights();const H=new Set;return E.traverse(function(O){if(!(O.isMesh||O.isPoints||O.isLine||O.isSprite))return;const le=O.material;if(le)if(Array.isArray(le))for(let _e=0;_e<le.length;_e++){const Ee=le[_e];rt(Ee,V,O),H.add(Ee)}else rt(le,V,O),H.add(le)}),b.pop(),d=null,H},this.compileAsync=function(E,k,V=null){const H=this.compile(E,k,V);return new Promise(O=>{function le(){if(H.forEach(function(_e){be.get(_e).currentProgram.isReady()&&H.delete(_e)}),H.size===0){O(E);return}setTimeout(le,10)}Q.get("KHR_parallel_shader_compile")!==null?le():setTimeout(le,10)})};let Kt=null;function ln(E){Kt&&Kt(E)}function Yo(){Dn.stop()}function qo(){Dn.start()}const Dn=new Kl;Dn.setAnimationLoop(ln),typeof self<"u"&&Dn.setContext(self),this.setAnimationLoop=function(E){Kt=E,J.setAnimationLoop(E),E===null?Dn.stop():Dn.start()},J.addEventListener("sessionstart",Yo),J.addEventListener("sessionend",qo),this.render=function(E,k){if(k!==void 0&&k.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(D===!0)return;if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),k.parent===null&&k.matrixWorldAutoUpdate===!0&&k.updateMatrixWorld(),J.enabled===!0&&J.isPresenting===!0&&(J.cameraAutoUpdate===!0&&J.updateCamera(k),k=J.getCamera()),E.isScene===!0&&E.onBeforeRender(M,E,k,T),d=je.get(E,b.length),d.init(k),b.push(d),Ce.multiplyMatrices(k.projectionMatrix,k.matrixWorldInverse),W.setFromProjectionMatrix(Ce),re=this.localClippingEnabled,se=ae.init(this.clippingPlanes,re),m=Me.get(E,y.length),m.init(),y.push(m),J.enabled===!0&&J.isPresenting===!0){const le=M.xr.getDepthSensingMesh();le!==null&&fs(le,k,-1/0,M.sortObjects)}fs(E,k,0,M.sortObjects),m.finish(),M.sortObjects===!0&&m.sort(j,he),ee=J.enabled===!1||J.isPresenting===!1||J.hasDepthSensing()===!1,ee&&Ne.addToRenderList(m,E),this.info.render.frame++,se===!0&&ae.beginShadows();const V=d.state.shadowsArray;xe.render(V,E,k),se===!0&&ae.endShadows(),this.info.autoReset===!0&&this.info.reset();const H=m.opaque,O=m.transmissive;if(d.setupLights(),k.isArrayCamera){const le=k.cameras;if(O.length>0)for(let _e=0,Ee=le.length;_e<Ee;_e++){const Ae=le[_e];Ko(H,O,E,Ae)}ee&&Ne.render(E);for(let _e=0,Ee=le.length;_e<Ee;_e++){const Ae=le[_e];jo(m,E,Ae,Ae.viewport)}}else O.length>0&&Ko(H,O,E,k),ee&&Ne.render(E),jo(m,E,k);T!==null&&(C.updateMultisampleRenderTarget(T),C.updateRenderTargetMipmap(T)),E.isScene===!0&&E.onAfterRender(M,E,k),ut.resetDefaultState(),S=-1,x=null,b.pop(),b.length>0?(d=b[b.length-1],se===!0&&ae.setGlobalState(M.clippingPlanes,d.state.camera)):d=null,y.pop(),y.length>0?m=y[y.length-1]:m=null};function fs(E,k,V,H){if(E.visible===!1)return;if(E.layers.test(k.layers)){if(E.isGroup)V=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(k);else if(E.isLight)d.pushLight(E),E.castShadow&&d.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||W.intersectsSprite(E)){H&&Le.setFromMatrixPosition(E.matrixWorld).applyMatrix4(Ce);const _e=$.update(E),Ee=E.material;Ee.visible&&m.push(E,_e,Ee,V,Le.z,null)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||W.intersectsObject(E))){const _e=$.update(E),Ee=E.material;if(H&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),Le.copy(E.boundingSphere.center)):(_e.boundingSphere===null&&_e.computeBoundingSphere(),Le.copy(_e.boundingSphere.center)),Le.applyMatrix4(E.matrixWorld).applyMatrix4(Ce)),Array.isArray(Ee)){const Ae=_e.groups;for(let Oe=0,Ve=Ae.length;Oe<Ve;Oe++){const Re=Ae[Oe],et=Ee[Re.materialIndex];et&&et.visible&&m.push(E,_e,et,V,Le.z,Re)}}else Ee.visible&&m.push(E,_e,Ee,V,Le.z,null)}}const le=E.children;for(let _e=0,Ee=le.length;_e<Ee;_e++)fs(le[_e],k,V,H)}function jo(E,k,V,H){const O=E.opaque,le=E.transmissive,_e=E.transparent;d.setupLightsView(V),se===!0&&ae.setGlobalState(M.clippingPlanes,V),H&&de.viewport(v.copy(H)),O.length>0&&rr(O,k,V),le.length>0&&rr(le,k,V),_e.length>0&&rr(_e,k,V),de.buffers.depth.setTest(!0),de.buffers.depth.setMask(!0),de.buffers.color.setMask(!0),de.setPolygonOffset(!1)}function Ko(E,k,V,H){if((V.isScene===!0?V.overrideMaterial:null)!==null)return;d.state.transmissionRenderTarget[H.id]===void 0&&(d.state.transmissionRenderTarget[H.id]=new Wn(1,1,{generateMipmaps:!0,type:Q.has("EXT_color_buffer_half_float")||Q.has("EXT_color_buffer_float")?1016:1009,minFilter:1008,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Qe.workingColorSpace}));const le=d.state.transmissionRenderTarget[H.id],_e=H.viewport||v;le.setSize(_e.z,_e.w);const Ee=M.getRenderTarget();M.setRenderTarget(le),M.getClearColor(B),q=M.getClearAlpha(),q<1&&M.setClearColor(16777215,.5),M.clear(),ee&&Ne.render(V);const Ae=M.toneMapping;M.toneMapping=0;const Oe=H.viewport;if(H.viewport!==void 0&&(H.viewport=void 0),d.setupLightsView(H),se===!0&&ae.setGlobalState(M.clippingPlanes,H),rr(E,V,H),C.updateMultisampleRenderTarget(le),C.updateRenderTargetMipmap(le),Q.has("WEBGL_multisampled_render_to_texture")===!1){let Ve=!1;for(let Re=0,et=k.length;Re<et;Re++){const dt=k[Re],pt=dt.object,kt=dt.geometry,nt=dt.material,Pe=dt.group;if(nt.side===2&&pt.layers.test(H.layers)){const cn=nt.side;nt.side=1,nt.needsUpdate=!0,Jo(pt,V,H,kt,nt,Pe),nt.side=cn,nt.needsUpdate=!0,Ve=!0}}Ve===!0&&(C.updateMultisampleRenderTarget(le),C.updateRenderTargetMipmap(le))}M.setRenderTarget(Ee),M.setClearColor(B,q),Oe!==void 0&&(H.viewport=Oe),M.toneMapping=Ae}function rr(E,k,V){const H=k.isScene===!0?k.overrideMaterial:null;for(let O=0,le=E.length;O<le;O++){const _e=E[O],Ee=_e.object,Ae=_e.geometry,Oe=H===null?_e.material:H,Ve=_e.group;Ee.layers.test(V.layers)&&Jo(Ee,k,V,Ae,Oe,Ve)}}function Jo(E,k,V,H,O,le){E.onBeforeRender(M,k,V,H,O,le),E.modelViewMatrix.multiplyMatrices(V.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),O.onBeforeRender(M,k,V,H,E,le),O.transparent===!0&&O.side===2&&O.forceSinglePass===!1?(O.side=1,O.needsUpdate=!0,M.renderBufferDirect(V,k,H,O,E,le),O.side=0,O.needsUpdate=!0,M.renderBufferDirect(V,k,H,O,E,le),O.side=2):M.renderBufferDirect(V,k,H,O,E,le),E.onAfterRender(M,k,V,H,O,le)}function sr(E,k,V){k.isScene!==!0&&(k=qe);const H=be.get(E),O=d.state.lights,le=d.state.shadowsArray,_e=O.state.version,Ee=Te.getParameters(E,O.state,le,k,V),Ae=Te.getProgramCacheKey(Ee);let Oe=H.programs;H.environment=E.isMeshStandardMaterial?k.environment:null,H.fog=k.fog,H.envMap=(E.isMeshStandardMaterial?G:w).get(E.envMap||H.environment),H.envMapRotation=H.environment!==null&&E.envMap===null?k.environmentRotation:E.envMapRotation,Oe===void 0&&(E.addEventListener("dispose",Ge),Oe=new Map,H.programs=Oe);let Ve=Oe.get(Ae);if(Ve!==void 0){if(H.currentProgram===Ve&&H.lightsStateVersion===_e)return $o(E,Ee),Ve}else Ee.uniforms=Te.getUniforms(E),E.onBeforeCompile(Ee,M),Ve=Te.acquireProgram(Ee,Ae),Oe.set(Ae,Ve),H.uniforms=Ee.uniforms;const Re=H.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(Re.clippingPlanes=ae.uniform),$o(E,Ee),H.needsLights=qc(E),H.lightsStateVersion=_e,H.needsLights&&(Re.ambientLightColor.value=O.state.ambient,Re.lightProbe.value=O.state.probe,Re.directionalLights.value=O.state.directional,Re.directionalLightShadows.value=O.state.directionalShadow,Re.spotLights.value=O.state.spot,Re.spotLightShadows.value=O.state.spotShadow,Re.rectAreaLights.value=O.state.rectArea,Re.ltc_1.value=O.state.rectAreaLTC1,Re.ltc_2.value=O.state.rectAreaLTC2,Re.pointLights.value=O.state.point,Re.pointLightShadows.value=O.state.pointShadow,Re.hemisphereLights.value=O.state.hemi,Re.directionalShadowMap.value=O.state.directionalShadowMap,Re.directionalShadowMatrix.value=O.state.directionalShadowMatrix,Re.spotShadowMap.value=O.state.spotShadowMap,Re.spotLightMatrix.value=O.state.spotLightMatrix,Re.spotLightMap.value=O.state.spotLightMap,Re.pointShadowMap.value=O.state.pointShadowMap,Re.pointShadowMatrix.value=O.state.pointShadowMatrix),H.currentProgram=Ve,H.uniformsList=null,Ve}function Zo(E){if(E.uniformsList===null){const k=E.currentProgram.getUniforms();E.uniformsList=zr.seqWithValue(k.seq,E.uniforms)}return E.uniformsList}function $o(E,k){const V=be.get(E);V.outputColorSpace=k.outputColorSpace,V.batching=k.batching,V.batchingColor=k.batchingColor,V.instancing=k.instancing,V.instancingColor=k.instancingColor,V.instancingMorph=k.instancingMorph,V.skinning=k.skinning,V.morphTargets=k.morphTargets,V.morphNormals=k.morphNormals,V.morphColors=k.morphColors,V.morphTargetsCount=k.morphTargetsCount,V.numClippingPlanes=k.numClippingPlanes,V.numIntersection=k.numClipIntersection,V.vertexAlphas=k.vertexAlphas,V.vertexTangents=k.vertexTangents,V.toneMapping=k.toneMapping}function Xc(E,k,V,H,O){k.isScene!==!0&&(k=qe),C.resetTextureUnits();const le=k.fog,_e=H.isMeshStandardMaterial?k.environment:null,Ee=T===null?M.outputColorSpace:T.isXRRenderTarget===!0?T.texture.colorSpace:xi,Ae=(H.isMeshStandardMaterial?G:w).get(H.envMap||_e),Oe=H.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,Ve=!!V.attributes.tangent&&(!!H.normalMap||H.anisotropy>0),Re=!!V.morphAttributes.position,et=!!V.morphAttributes.normal,dt=!!V.morphAttributes.color;let pt=0;H.toneMapped&&(T===null||T.isXRRenderTarget===!0)&&(pt=M.toneMapping);const kt=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,nt=kt!==void 0?kt.length:0,Pe=be.get(H),cn=d.state.lights;if(se===!0&&(re===!0||E!==x)){const Wt=E===x&&H.id===S;ae.setState(H,E,Wt)}let it=!1;H.version===Pe.__version?(Pe.needsLights&&Pe.lightsStateVersion!==cn.state.version||Pe.outputColorSpace!==Ee||O.isBatchedMesh&&Pe.batching===!1||!O.isBatchedMesh&&Pe.batching===!0||O.isBatchedMesh&&Pe.batchingColor===!0&&O.colorTexture===null||O.isBatchedMesh&&Pe.batchingColor===!1&&O.colorTexture!==null||O.isInstancedMesh&&Pe.instancing===!1||!O.isInstancedMesh&&Pe.instancing===!0||O.isSkinnedMesh&&Pe.skinning===!1||!O.isSkinnedMesh&&Pe.skinning===!0||O.isInstancedMesh&&Pe.instancingColor===!0&&O.instanceColor===null||O.isInstancedMesh&&Pe.instancingColor===!1&&O.instanceColor!==null||O.isInstancedMesh&&Pe.instancingMorph===!0&&O.morphTexture===null||O.isInstancedMesh&&Pe.instancingMorph===!1&&O.morphTexture!==null||Pe.envMap!==Ae||H.fog===!0&&Pe.fog!==le||Pe.numClippingPlanes!==void 0&&(Pe.numClippingPlanes!==ae.numPlanes||Pe.numIntersection!==ae.numIntersection)||Pe.vertexAlphas!==Oe||Pe.vertexTangents!==Ve||Pe.morphTargets!==Re||Pe.morphNormals!==et||Pe.morphColors!==dt||Pe.toneMapping!==pt||Pe.morphTargetsCount!==nt)&&(it=!0):(it=!0,Pe.__version=H.version);let Jt=Pe.currentProgram;it===!0&&(Jt=sr(H,k,O));let Yn=!1,Ot=!1,Ci=!1;const mt=Jt.getUniforms(),nn=Pe.uniforms;if(de.useProgram(Jt.program)&&(Yn=!0,Ot=!0,Ci=!0),H.id!==S&&(S=H.id,Ot=!0),Yn||x!==E){de.buffers.depth.getReversed()?(oe.copy(E.projectionMatrix),fh(oe),ph(oe),mt.setValue(L,"projectionMatrix",oe)):mt.setValue(L,"projectionMatrix",E.projectionMatrix),mt.setValue(L,"viewMatrix",E.matrixWorldInverse);const Mn=mt.map.cameraPosition;Mn!==void 0&&Mn.setValue(L,Fe.setFromMatrixPosition(E.matrixWorld)),ve.logarithmicDepthBuffer&&mt.setValue(L,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(H.isMeshPhongMaterial||H.isMeshToonMaterial||H.isMeshLambertMaterial||H.isMeshBasicMaterial||H.isMeshStandardMaterial||H.isShaderMaterial)&&mt.setValue(L,"isOrthographic",E.isOrthographicCamera===!0),x!==E&&(x=E,Ot=!0,Ci=!0)}if(O.isSkinnedMesh){mt.setOptional(L,O,"bindMatrix"),mt.setOptional(L,O,"bindMatrixInverse");const Wt=O.skeleton;Wt&&(Wt.boneTexture===null&&Wt.computeBoneTexture(),mt.setValue(L,"boneTexture",Wt.boneTexture,C))}O.isBatchedMesh&&(mt.setOptional(L,O,"batchingTexture"),mt.setValue(L,"batchingTexture",O._matricesTexture,C),mt.setOptional(L,O,"batchingIdTexture"),mt.setValue(L,"batchingIdTexture",O._indirectTexture,C),mt.setOptional(L,O,"batchingColorTexture"),O._colorsTexture!==null&&mt.setValue(L,"batchingColorTexture",O._colorsTexture,C));const Pi=V.morphAttributes;if((Pi.position!==void 0||Pi.normal!==void 0||Pi.color!==void 0)&&ke.update(O,V,Jt),(Ot||Pe.receiveShadow!==O.receiveShadow)&&(Pe.receiveShadow=O.receiveShadow,mt.setValue(L,"receiveShadow",O.receiveShadow)),H.isMeshGouraudMaterial&&H.envMap!==null&&(nn.envMap.value=Ae,nn.flipEnvMap.value=Ae.isCubeTexture&&Ae.isRenderTargetTexture===!1?-1:1),H.isMeshStandardMaterial&&H.envMap===null&&k.environment!==null&&(nn.envMapIntensity.value=k.environmentIntensity),Ot&&(mt.setValue(L,"toneMappingExposure",M.toneMappingExposure),Pe.needsLights&&Yc(nn,Ci),le&&H.fog===!0&&pe.refreshFogUniforms(nn,le),pe.refreshMaterialUniforms(nn,H,N,Y,d.state.transmissionRenderTarget[E.id]),zr.upload(L,Zo(Pe),nn,C)),H.isShaderMaterial&&H.uniformsNeedUpdate===!0&&(zr.upload(L,Zo(Pe),nn,C),H.uniformsNeedUpdate=!1),H.isSpriteMaterial&&mt.setValue(L,"center",O.center),mt.setValue(L,"modelViewMatrix",O.modelViewMatrix),mt.setValue(L,"normalMatrix",O.normalMatrix),mt.setValue(L,"modelMatrix",O.matrixWorld),H.isShaderMaterial||H.isRawShaderMaterial){const Wt=H.uniformsGroups;for(let Mn=0,xn=Wt.length;Mn<xn;Mn++){const Qo=Wt[Mn];F.update(Qo,Jt),F.bind(Qo,Jt)}}return Jt}function Yc(E,k){E.ambientLightColor.needsUpdate=k,E.lightProbe.needsUpdate=k,E.directionalLights.needsUpdate=k,E.directionalLightShadows.needsUpdate=k,E.pointLights.needsUpdate=k,E.pointLightShadows.needsUpdate=k,E.spotLights.needsUpdate=k,E.spotLightShadows.needsUpdate=k,E.rectAreaLights.needsUpdate=k,E.hemisphereLights.needsUpdate=k}function qc(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return R},this.getActiveMipmapLevel=function(){return A},this.getRenderTarget=function(){return T},this.setRenderTargetTextures=function(E,k,V){be.get(E.texture).__webglTexture=k,be.get(E.depthTexture).__webglTexture=V;const H=be.get(E);H.__hasExternalTextures=!0,H.__autoAllocateDepthBuffer=V===void 0,H.__autoAllocateDepthBuffer||Q.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),H.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(E,k){const V=be.get(E);V.__webglFramebuffer=k,V.__useDefaultFramebuffer=k===void 0},this.setRenderTarget=function(E,k=0,V=0){T=E,R=k,A=V;let H=!0,O=null,le=!1,_e=!1;if(E){const Ae=be.get(E);if(Ae.__useDefaultFramebuffer!==void 0)de.bindFramebuffer(L.FRAMEBUFFER,null),H=!1;else if(Ae.__webglFramebuffer===void 0)C.setupRenderTarget(E);else if(Ae.__hasExternalTextures)C.rebindTextures(E,be.get(E.texture).__webglTexture,be.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){const Re=E.depthTexture;if(Ae.__boundDepthTexture!==Re){if(Re!==null&&be.has(Re)&&(E.width!==Re.image.width||E.height!==Re.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");C.setupDepthRenderbuffer(E)}}const Oe=E.texture;(Oe.isData3DTexture||Oe.isDataArrayTexture||Oe.isCompressedArrayTexture)&&(_e=!0);const Ve=be.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(Ve[k])?O=Ve[k][V]:O=Ve[k],le=!0):E.samples>0&&C.useMultisampledRTT(E)===!1?O=be.get(E).__webglMultisampledFramebuffer:Array.isArray(Ve)?O=Ve[V]:O=Ve,v.copy(E.viewport),I.copy(E.scissor),U=E.scissorTest}else v.copy(K).multiplyScalar(N).floor(),I.copy(ce).multiplyScalar(N).floor(),U=we;if(de.bindFramebuffer(L.FRAMEBUFFER,O)&&H&&de.drawBuffers(E,O),de.viewport(v),de.scissor(I),de.setScissorTest(U),le){const Ae=be.get(E.texture);L.framebufferTexture2D(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,L.TEXTURE_CUBE_MAP_POSITIVE_X+k,Ae.__webglTexture,V)}else if(_e){const Ae=be.get(E.texture),Oe=k||0;L.framebufferTextureLayer(L.FRAMEBUFFER,L.COLOR_ATTACHMENT0,Ae.__webglTexture,V||0,Oe)}S=-1},this.readRenderTargetPixels=function(E,k,V,H,O,le,_e){if(!(E&&E.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ee=be.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&_e!==void 0&&(Ee=Ee[_e]),Ee){de.bindFramebuffer(L.FRAMEBUFFER,Ee);try{const Ae=E.texture,Oe=Ae.format,Ve=Ae.type;if(!ve.textureFormatReadable(Oe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ve.textureTypeReadable(Ve)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}k>=0&&k<=E.width-H&&V>=0&&V<=E.height-O&&L.readPixels(k,V,H,O,We.convert(Oe),We.convert(Ve),le)}finally{const Ae=T!==null?be.get(T).__webglFramebuffer:null;de.bindFramebuffer(L.FRAMEBUFFER,Ae)}}},this.readRenderTargetPixelsAsync=async function(E,k,V,H,O,le,_e){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ee=be.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&_e!==void 0&&(Ee=Ee[_e]),Ee){const Ae=E.texture,Oe=Ae.format,Ve=Ae.type;if(!ve.textureFormatReadable(Oe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ve.textureTypeReadable(Ve))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(k>=0&&k<=E.width-H&&V>=0&&V<=E.height-O){de.bindFramebuffer(L.FRAMEBUFFER,Ee);const Re=L.createBuffer();L.bindBuffer(L.PIXEL_PACK_BUFFER,Re),L.bufferData(L.PIXEL_PACK_BUFFER,le.byteLength,L.STREAM_READ),L.readPixels(k,V,H,O,We.convert(Oe),We.convert(Ve),0);const et=T!==null?be.get(T).__webglFramebuffer:null;de.bindFramebuffer(L.FRAMEBUFFER,et);const dt=L.fenceSync(L.SYNC_GPU_COMMANDS_COMPLETE,0);return L.flush(),await dh(L,dt,4),L.bindBuffer(L.PIXEL_PACK_BUFFER,Re),L.getBufferSubData(L.PIXEL_PACK_BUFFER,0,le),L.deleteBuffer(Re),L.deleteSync(dt),le}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(E,k=null,V=0){E.isTexture!==!0&&(Wi("WebGLRenderer: copyFramebufferToTexture function signature has changed."),k=arguments[0]||null,E=arguments[1]);const H=Math.pow(2,-V),O=Math.floor(E.image.width*H),le=Math.floor(E.image.height*H),_e=k!==null?k.x:0,Ee=k!==null?k.y:0;C.setTexture2D(E,0),L.copyTexSubImage2D(L.TEXTURE_2D,V,0,0,_e,Ee,O,le),de.unbindTexture()},this.copyTextureToTexture=function(E,k,V=null,H=null,O=0){E.isTexture!==!0&&(Wi("WebGLRenderer: copyTextureToTexture function signature has changed."),H=arguments[0]||null,E=arguments[1],k=arguments[2],O=arguments[3]||0,V=null);let le,_e,Ee,Ae,Oe,Ve,Re,et,dt;const pt=E.isCompressedTexture?E.mipmaps[O]:E.image;V!==null?(le=V.max.x-V.min.x,_e=V.max.y-V.min.y,Ee=V.isBox3?V.max.z-V.min.z:1,Ae=V.min.x,Oe=V.min.y,Ve=V.isBox3?V.min.z:0):(le=pt.width,_e=pt.height,Ee=pt.depth||1,Ae=0,Oe=0,Ve=0),H!==null?(Re=H.x,et=H.y,dt=H.z):(Re=0,et=0,dt=0);const kt=We.convert(k.format),nt=We.convert(k.type);let Pe;k.isData3DTexture?(C.setTexture3D(k,0),Pe=L.TEXTURE_3D):k.isDataArrayTexture||k.isCompressedArrayTexture?(C.setTexture2DArray(k,0),Pe=L.TEXTURE_2D_ARRAY):(C.setTexture2D(k,0),Pe=L.TEXTURE_2D),L.pixelStorei(L.UNPACK_FLIP_Y_WEBGL,k.flipY),L.pixelStorei(L.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),L.pixelStorei(L.UNPACK_ALIGNMENT,k.unpackAlignment);const cn=L.getParameter(L.UNPACK_ROW_LENGTH),it=L.getParameter(L.UNPACK_IMAGE_HEIGHT),Jt=L.getParameter(L.UNPACK_SKIP_PIXELS),Yn=L.getParameter(L.UNPACK_SKIP_ROWS),Ot=L.getParameter(L.UNPACK_SKIP_IMAGES);L.pixelStorei(L.UNPACK_ROW_LENGTH,pt.width),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,pt.height),L.pixelStorei(L.UNPACK_SKIP_PIXELS,Ae),L.pixelStorei(L.UNPACK_SKIP_ROWS,Oe),L.pixelStorei(L.UNPACK_SKIP_IMAGES,Ve);const Ci=E.isDataArrayTexture||E.isData3DTexture,mt=k.isDataArrayTexture||k.isData3DTexture;if(E.isRenderTargetTexture||E.isDepthTexture){const nn=be.get(E),Pi=be.get(k),Wt=be.get(nn.__renderTarget),Mn=be.get(Pi.__renderTarget);de.bindFramebuffer(L.READ_FRAMEBUFFER,Wt.__webglFramebuffer),de.bindFramebuffer(L.DRAW_FRAMEBUFFER,Mn.__webglFramebuffer);for(let xn=0;xn<Ee;xn++)Ci&&L.framebufferTextureLayer(L.READ_FRAMEBUFFER,L.COLOR_ATTACHMENT0,be.get(E).__webglTexture,O,Ve+xn),E.isDepthTexture?(mt&&L.framebufferTextureLayer(L.DRAW_FRAMEBUFFER,L.COLOR_ATTACHMENT0,be.get(k).__webglTexture,O,dt+xn),L.blitFramebuffer(Ae,Oe,le,_e,Re,et,le,_e,L.DEPTH_BUFFER_BIT,L.NEAREST)):mt?L.copyTexSubImage3D(Pe,O,Re,et,dt+xn,Ae,Oe,le,_e):L.copyTexSubImage2D(Pe,O,Re,et,dt+xn,Ae,Oe,le,_e);de.bindFramebuffer(L.READ_FRAMEBUFFER,null),de.bindFramebuffer(L.DRAW_FRAMEBUFFER,null)}else mt?E.isDataTexture||E.isData3DTexture?L.texSubImage3D(Pe,O,Re,et,dt,le,_e,Ee,kt,nt,pt.data):k.isCompressedArrayTexture?L.compressedTexSubImage3D(Pe,O,Re,et,dt,le,_e,Ee,kt,pt.data):L.texSubImage3D(Pe,O,Re,et,dt,le,_e,Ee,kt,nt,pt):E.isDataTexture?L.texSubImage2D(L.TEXTURE_2D,O,Re,et,le,_e,kt,nt,pt.data):E.isCompressedTexture?L.compressedTexSubImage2D(L.TEXTURE_2D,O,Re,et,pt.width,pt.height,kt,pt.data):L.texSubImage2D(L.TEXTURE_2D,O,Re,et,le,_e,kt,nt,pt);L.pixelStorei(L.UNPACK_ROW_LENGTH,cn),L.pixelStorei(L.UNPACK_IMAGE_HEIGHT,it),L.pixelStorei(L.UNPACK_SKIP_PIXELS,Jt),L.pixelStorei(L.UNPACK_SKIP_ROWS,Yn),L.pixelStorei(L.UNPACK_SKIP_IMAGES,Ot),O===0&&k.generateMipmaps&&L.generateMipmap(Pe),de.unbindTexture()},this.copyTextureToTexture3D=function(E,k,V=null,H=null,O=0){return E.isTexture!==!0&&(Wi("WebGLRenderer: copyTextureToTexture3D function signature has changed."),V=arguments[0]||null,H=arguments[1]||null,E=arguments[2],k=arguments[3],O=arguments[4]||0),Wi('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(E,k,V,H,O)},this.initRenderTarget=function(E){be.get(E).__webglFramebuffer===void 0&&C.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?C.setTextureCube(E,0):E.isData3DTexture?C.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?C.setTexture2DArray(E,0):C.setTexture2D(E,0),de.unbindTexture()},this.resetState=function(){R=0,A=0,T=null,de.reset(),ut.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return 2e3}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorspace=Qe._getDrawingBufferColorSpace(e),t.unpackColorSpace=Qe._getUnpackColorSpace()}}class nc{constructor(e,t=1,i=1e3){this.isFog=!0,this.name="",this.color=new Ie(e),this.near=t,this.far=i}clone(){return new nc(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class R_ extends yt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new tn,this.environmentIntensity=1,this.environmentRotation=new tn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Am{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=35044,this.updateRanges=[],this.version=0,this.uuid=jt()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let r=0,s=this.stride;r<s;r++)this.array[e+r]=t.array[i+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=jt()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=jt()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const Ut=new P;class Xr{constructor(e,t,i,r=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=i,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,i=this.data.count;t<i;t++)Ut.fromBufferAttribute(this,t),Ut.applyMatrix4(e),this.setXYZ(t,Ut.x,Ut.y,Ut.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Ut.fromBufferAttribute(this,t),Ut.applyNormalMatrix(e),this.setXYZ(t,Ut.x,Ut.y,Ut.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Ut.fromBufferAttribute(this,t),Ut.transformDirection(e),this.setXYZ(t,Ut.x,Ut.y,Ut.z);return this}getComponent(e,t){let i=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(i=en(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=ot(i,this.array)),this.data.array[e*this.data.stride+this.offset+t]=i,this}setX(e,t){return this.normalized&&(t=ot(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=ot(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=ot(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=ot(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=en(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=en(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=en(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=en(t,this.array)),t}setXY(e,t,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=ot(t,this.array),i=ot(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this}setXYZ(e,t,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=ot(t,this.array),i=ot(i,this.array),r=ot(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=r,this}setXYZW(e,t,i,r,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=ot(t,this.array),i=ot(i,this.array),r=ot(r,this.array),s=ot(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=r,this.data.array[e+3]=s,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return new Nt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new Xr(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class Rm extends bn{static get type(){return"SpriteMaterial"}constructor(e){super(),this.isSpriteMaterial=!0,this.color=new Ie(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let oi;const Ui=new P,ai=new P,li=new P,ci=new ie,Fi=new ie,ic=new Be,Er=new P,ki=new P,Ar=new P,ja=new ie,Gs=new ie,Ka=new ie;class C_ extends yt{constructor(e=new Rm){if(super(),this.isSprite=!0,this.type="Sprite",oi===void 0){oi=new vt;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new Am(t,5);oi.setIndex([0,1,2,0,2,3]),oi.setAttribute("position",new Xr(i,3,0,!1)),oi.setAttribute("uv",new Xr(i,2,3,!1))}this.geometry=oi,this.material=e,this.center=new ie(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),ai.setFromMatrixScale(this.matrixWorld),ic.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),li.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&ai.multiplyScalar(-li.z);const i=this.material.rotation;let r,s;i!==0&&(s=Math.cos(i),r=Math.sin(i));const o=this.center;Rr(Er.set(-.5,-.5,0),li,o,ai,r,s),Rr(ki.set(.5,-.5,0),li,o,ai,r,s),Rr(Ar.set(.5,.5,0),li,o,ai,r,s),ja.set(0,0),Gs.set(1,0),Ka.set(1,1);let a=e.ray.intersectTriangle(Er,ki,Ar,!1,Ui);if(a===null&&(Rr(ki.set(-.5,.5,0),li,o,ai,r,s),Gs.set(0,1),a=e.ray.intersectTriangle(Er,Ar,ki,!1,Ui),a===null))return;const l=e.ray.origin.distanceTo(Ui);l<e.near||l>e.far||t.push({distance:l,point:Ui.clone(),uv:Yt.getInterpolation(Ui,Er,ki,Ar,ja,Gs,Ka,new ie),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function Rr(n,e,t,i,r,s){ci.subVectors(n,t).addScalar(.5).multiply(i),r!==void 0?(Fi.x=s*ci.x-r*ci.y,Fi.y=r*ci.x+s*ci.y):Fi.copy(ci),n.copy(e),n.x+=Fi.x,n.y+=Fi.y,n.applyMatrix4(ic)}const Ja=new P,Za=new tt,$a=new tt,Cm=new P,Qa=new Be,Cr=new P,Vs=new vn,el=new Be,Hs=new tr;class Gr extends ht{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=ea,this.bindMatrix=new Be,this.bindMatrixInverse=new Be,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new In),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let i=0;i<t.count;i++)this.getVertexPosition(i,Cr),this.boundingBox.expandByPoint(Cr)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new vn),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let i=0;i<t.count;i++)this.getVertexPosition(i,Cr),this.boundingSphere.expandByPoint(Cr)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const i=this.material,r=this.matrixWorld;i!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Vs.copy(this.boundingSphere),Vs.applyMatrix4(r),e.ray.intersectsSphere(Vs)!==!1&&(el.copy(r).invert(),Hs.copy(e.ray).applyMatrix4(el),!(this.boundingBox!==null&&Hs.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Hs)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new tt,t=this.geometry.attributes.skinWeight;for(let i=0,r=t.count;i<r;i++){e.fromBufferAttribute(t,i);const s=1/e.manhattanLength();s!==1/0?e.multiplyScalar(s):e.set(1,0,0,0),t.setXYZW(i,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===ea?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===jc?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const i=this.skeleton,r=this.geometry;Za.fromBufferAttribute(r.attributes.skinIndex,e),$a.fromBufferAttribute(r.attributes.skinWeight,e),Ja.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let s=0;s<4;s++){const o=$a.getComponent(s);if(o!==0){const a=Za.getComponent(s);Qa.multiplyMatrices(i.bones[a].matrixWorld,i.boneInverses[a]),t.addScaledVector(Cm.copy(Ja).applyMatrix4(Qa),o)}}return t.applyMatrix4(this.bindMatrixInverse)}}class rc extends yt{constructor(){super(),this.isBone=!0,this.type="Bone"}}class rs extends Ct{constructor(e=null,t=1,i=1,r,s,o,a,l,c=1003,h=1003,u,p){super(null,o,a,l,c,h,r,s,u,p),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const tl=new Be,Pm=new Be;class Po{constructor(e=[],t=[]){this.uuid=jt(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let i=0,r=this.bones.length;i<r;i++)this.boneInverses.push(new Be)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const i=new Be;this.bones[e]&&i.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(i)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const i=this.bones[e];i&&i.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const i=this.bones[e];i&&(i.parent&&i.parent.isBone?(i.matrix.copy(i.parent.matrixWorld).invert(),i.matrix.multiply(i.matrixWorld)):i.matrix.copy(i.matrixWorld),i.matrix.decompose(i.position,i.quaternion,i.scale))}}update(){const e=this.bones,t=this.boneInverses,i=this.boneMatrices,r=this.boneTexture;for(let s=0,o=e.length;s<o;s++){const a=e[s]?e[s].matrixWorld:Pm;tl.multiplyMatrices(a,t[s]),tl.toArray(i,s*16)}r!==null&&(r.needsUpdate=!0)}clone(){return new Po(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const i=new rs(t,e,e,1023,1015);return i.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=i,this}getBoneByName(e){for(let t=0,i=this.bones.length;t<i;t++){const r=this.bones[t];if(r.name===e)return r}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let i=0,r=e.bones.length;i<r;i++){const s=e.bones[i];let o=t[s];o===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",s),o=new rc),this.bones.push(o),this.boneInverses.push(new Be().fromArray(e.boneInverses[i]))}return this.init(),this}toJSON(){const e={metadata:{version:4.6,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,i=this.boneInverses;for(let r=0,s=t.length;r<s;r++){const o=t[r];e.bones.push(o.uuid);const a=i[r];e.boneInverses.push(a.toArray())}return e}}class nl extends Nt{constructor(e,t,i,r=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const hi=new Be,il=new Be,Pr=[],rl=new In,Lm=new Be,Oi=new ht,Bi=new vn;class P_ extends ht{constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new nl(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let r=0;r<i;r++)this.setMatrixAt(r,Lm)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new In),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,hi),rl.copy(e.boundingBox).applyMatrix4(hi),this.boundingBox.union(rl)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new vn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,hi),Bi.copy(e.boundingSphere).applyMatrix4(hi),this.boundingSphere.union(Bi)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const i=t.morphTargetInfluences,r=this.morphTexture.source.data.data,s=i.length+1,o=e*s+1;for(let a=0;a<i.length;a++)i[a]=r[o+a]}raycast(e,t){const i=this.matrixWorld,r=this.count;if(Oi.geometry=this.geometry,Oi.material=this.material,Oi.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Bi.copy(this.boundingSphere),Bi.applyMatrix4(i),e.ray.intersectsSphere(Bi)!==!1))for(let s=0;s<r;s++){this.getMatrixAt(s,hi),il.multiplyMatrices(i,hi),Oi.matrixWorld=il,Oi.raycast(e,Pr);for(let o=0,a=Pr.length;o<a;o++){const l=Pr[o];l.instanceId=s,l.object=this,t.push(l)}Pr.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new nl(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const i=t.morphTargetInfluences,r=i.length+1;this.morphTexture===null&&(this.morphTexture=new rs(new Float32Array(r*this.count),r,this.count,1028,1015));const s=this.morphTexture.source.data.data;let o=0;for(let c=0;c<i.length;c++)o+=i[c];const a=this.geometry.morphTargetsRelative?1:1-o,l=r*e;s[l]=a,s.set(i,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class Im extends bn{static get type(){return"LineBasicMaterial"}constructor(e){super(),this.isLineBasicMaterial=!0,this.color=new Ie(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Yr=new P,qr=new P,sl=new Be,zi=new tr,Lr=new vn,Ws=new P,ol=new P;class sc extends yt{constructor(e=new vt,t=new Im){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[0];for(let r=1,s=t.count;r<s;r++)Yr.fromBufferAttribute(t,r-1),qr.fromBufferAttribute(t,r),i[r]=i[r-1],i[r]+=Yr.distanceTo(qr);e.setAttribute("lineDistance",new Ye(i,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const i=this.geometry,r=this.matrixWorld,s=e.params.Line.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Lr.copy(i.boundingSphere),Lr.applyMatrix4(r),Lr.radius+=s,e.ray.intersectsSphere(Lr)===!1)return;sl.copy(r).invert(),zi.copy(e.ray).applyMatrix4(sl);const a=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,h=i.index,p=i.attributes.position;if(h!==null){const f=Math.max(0,o.start),g=Math.min(h.count,o.start+o.count);for(let _=f,m=g-1;_<m;_+=c){const d=h.getX(_),y=h.getX(_+1),b=Ir(this,e,zi,l,d,y);b&&t.push(b)}if(this.isLineLoop){const _=h.getX(g-1),m=h.getX(f),d=Ir(this,e,zi,l,_,m);d&&t.push(d)}}else{const f=Math.max(0,o.start),g=Math.min(p.count,o.start+o.count);for(let _=f,m=g-1;_<m;_+=c){const d=Ir(this,e,zi,l,_,_+1);d&&t.push(d)}if(this.isLineLoop){const _=Ir(this,e,zi,l,g-1,f);_&&t.push(_)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const r=t[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}}function Ir(n,e,t,i,r,s){const o=n.geometry.attributes.position;if(Yr.fromBufferAttribute(o,r),qr.fromBufferAttribute(o,s),t.distanceSqToSegment(Yr,qr,Ws,ol)>i)return;Ws.applyMatrix4(n.matrixWorld);const l=e.ray.origin.distanceTo(Ws);if(!(l<e.near||l>e.far))return{distance:l,point:ol.clone().applyMatrix4(n.matrixWorld),index:r,face:null,faceIndex:null,barycoord:null,object:n}}const al=new P,ll=new P;class L_ extends sc{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[];for(let r=0,s=t.count;r<s;r+=2)al.fromBufferAttribute(t,r),ll.fromBufferAttribute(t,r+1),i[r]=r===0?0:i[r-1],i[r+1]=i[r]+al.distanceTo(ll);e.setAttribute("lineDistance",new Ye(i,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class I_ extends sc{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class oc extends bn{static get type(){return"PointsMaterial"}constructor(e){super(),this.isPointsMaterial=!0,this.color=new Ie(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const cl=new Be,oo=new tr,Dr=new vn,Nr=new P;class Dm extends yt{constructor(e=new vt,t=new oc){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const i=this.geometry,r=this.matrixWorld,s=e.params.Points.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Dr.copy(i.boundingSphere),Dr.applyMatrix4(r),Dr.radius+=s,e.ray.intersectsSphere(Dr)===!1)return;cl.copy(r).invert(),oo.copy(e.ray).applyMatrix4(cl);const a=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=i.index,u=i.attributes.position;if(c!==null){const p=Math.max(0,o.start),f=Math.min(c.count,o.start+o.count);for(let g=p,_=f;g<_;g++){const m=c.getX(g);Nr.fromBufferAttribute(u,m),hl(Nr,m,l,r,e,t,this)}}else{const p=Math.max(0,o.start),f=Math.min(u.count,o.start+o.count);for(let g=p,_=f;g<_;g++)Nr.fromBufferAttribute(u,g),hl(Nr,g,l,r,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const r=t[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}}function hl(n,e,t,i,r,s,o){const a=oo.distanceSqToPoint(n);if(a<t){const l=new P;oo.closestPointToPoint(n,l),l.applyMatrix4(i);const c=r.ray.origin.distanceTo(l);if(c<r.near||c>r.far)return;s.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}class D_ extends Ct{constructor(e,t,i,r,s,o,a,l,c){super(e,t,i,r,s,o,a,l,c),this.isVideoTexture=!0,this.minFilter=o!==void 0?o:1006,this.magFilter=s!==void 0?s:1006,this.generateMipmaps=!1;const h=this;function u(){h.needsUpdate=!0,e.requestVideoFrameCallback(u)}"requestVideoFrameCallback"in e&&e.requestVideoFrameCallback(u)}clone(){return new this.constructor(this.image).copy(this)}update(){const e=this.image;"requestVideoFrameCallback"in e===!1&&e.readyState>=e.HAVE_CURRENT_DATA&&(this.needsUpdate=!0)}}class Nm extends Ct{constructor(e,t,i,r,s,o,a,l,c){super(e,t,i,r,s,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class on{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){const i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){const t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){const t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let i,r=this.getPoint(0),s=0;t.push(0);for(let o=1;o<=e;o++)i=this.getPoint(o/e),s+=i.distanceTo(r),t.push(s),r=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){const i=this.getLengths();let r=0;const s=i.length;let o;t?o=t:o=e*i[s-1];let a=0,l=s-1,c;for(;a<=l;)if(r=Math.floor(a+(l-a)/2),c=i[r]-o,c<0)a=r+1;else if(c>0)l=r-1;else{l=r;break}if(r=l,i[r]===o)return r/(s-1);const h=i[r],p=i[r+1]-h,f=(o-h)/p;return(r+f)/(s-1)}getTangent(e,t){let r=e-1e-4,s=e+1e-4;r<0&&(r=0),s>1&&(s=1);const o=this.getPoint(r),a=this.getPoint(s),l=t||(o.isVector2?new ie:new P);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){const i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t){const i=new P,r=[],s=[],o=[],a=new P,l=new Be;for(let f=0;f<=e;f++){const g=f/e;r[f]=this.getTangentAt(g,new P)}s[0]=new P,o[0]=new P;let c=Number.MAX_VALUE;const h=Math.abs(r[0].x),u=Math.abs(r[0].y),p=Math.abs(r[0].z);h<=c&&(c=h,i.set(1,0,0)),u<=c&&(c=u,i.set(0,1,0)),p<=c&&i.set(0,0,1),a.crossVectors(r[0],i).normalize(),s[0].crossVectors(r[0],a),o[0].crossVectors(r[0],s[0]);for(let f=1;f<=e;f++){if(s[f]=s[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(r[f-1],r[f]),a.length()>Number.EPSILON){a.normalize();const g=Math.acos(wt(r[f-1].dot(r[f]),-1,1));s[f].applyMatrix4(l.makeRotationAxis(a,g))}o[f].crossVectors(r[f],s[f])}if(t===!0){let f=Math.acos(wt(s[0].dot(s[e]),-1,1));f/=e,r[0].dot(a.crossVectors(s[0],s[e]))>0&&(f=-f);for(let g=1;g<=e;g++)s[g].applyMatrix4(l.makeRotationAxis(r[g],f*g)),o[g].crossVectors(r[g],s[g])}return{tangents:r,normals:s,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class Lo extends on{constructor(e=0,t=0,i=1,r=1,s=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=r,this.aStartAngle=s,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t=new ie){const i=t,r=Math.PI*2;let s=this.aEndAngle-this.aStartAngle;const o=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=r;for(;s>r;)s-=r;s<Number.EPSILON&&(o?s=0:s=r),this.aClockwise===!0&&!o&&(s===r?s=-r:s=s-r);const a=this.aStartAngle+e*s;let l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){const h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),p=l-this.aX,f=c-this.aY;l=p*h-f*u+this.aX,c=p*u+f*h+this.aY}return i.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class Um extends Lo{constructor(e,t,i,r,s,o){super(e,t,i,i,r,s,o),this.isArcCurve=!0,this.type="ArcCurve"}}function Io(){let n=0,e=0,t=0,i=0;function r(s,o,a,l){n=s,e=a,t=-3*s+3*o-2*a-l,i=2*s-2*o+a+l}return{initCatmullRom:function(s,o,a,l,c){r(o,a,c*(a-s),c*(l-o))},initNonuniformCatmullRom:function(s,o,a,l,c,h,u){let p=(o-s)/c-(a-s)/(c+h)+(a-o)/h,f=(a-o)/h-(l-o)/(h+u)+(l-a)/u;p*=h,f*=h,r(o,a,p,f)},calc:function(s){const o=s*s,a=o*s;return n+e*s+t*o+i*a}}}const Ur=new P,Xs=new Io,Ys=new Io,qs=new Io;class Fm extends on{constructor(e=[],t=!1,i="centripetal",r=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=r}getPoint(e,t=new P){const i=t,r=this.points,s=r.length,o=(s-(this.closed?0:1))*e;let a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/s)+1)*s:l===0&&a===s-1&&(a=s-2,l=1);let c,h;this.closed||a>0?c=r[(a-1)%s]:(Ur.subVectors(r[0],r[1]).add(r[0]),c=Ur);const u=r[a%s],p=r[(a+1)%s];if(this.closed||a+2<s?h=r[(a+2)%s]:(Ur.subVectors(r[s-1],r[s-2]).add(r[s-1]),h=Ur),this.curveType==="centripetal"||this.curveType==="chordal"){const f=this.curveType==="chordal"?.5:.25;let g=Math.pow(c.distanceToSquared(u),f),_=Math.pow(u.distanceToSquared(p),f),m=Math.pow(p.distanceToSquared(h),f);_<1e-4&&(_=1),g<1e-4&&(g=_),m<1e-4&&(m=_),Xs.initNonuniformCatmullRom(c.x,u.x,p.x,h.x,g,_,m),Ys.initNonuniformCatmullRom(c.y,u.y,p.y,h.y,g,_,m),qs.initNonuniformCatmullRom(c.z,u.z,p.z,h.z,g,_,m)}else this.curveType==="catmullrom"&&(Xs.initCatmullRom(c.x,u.x,p.x,h.x,this.tension),Ys.initCatmullRom(c.y,u.y,p.y,h.y,this.tension),qs.initCatmullRom(c.z,u.z,p.z,h.z,this.tension));return i.set(Xs.calc(l),Ys.calc(l),qs.calc(l)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const r=e.points[t];this.points.push(r.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){const r=this.points[t];e.points.push(r.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const r=e.points[t];this.points.push(new P().fromArray(r))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function ul(n,e,t,i,r){const s=(i-e)*.5,o=(r-t)*.5,a=n*n,l=n*a;return(2*t-2*i+s+o)*l+(-3*t+3*i-2*s-o)*a+s*n+t}function km(n,e){const t=1-n;return t*t*e}function Om(n,e){return 2*(1-n)*n*e}function Bm(n,e){return n*n*e}function ji(n,e,t,i){return km(n,e)+Om(n,t)+Bm(n,i)}function zm(n,e){const t=1-n;return t*t*t*e}function Gm(n,e){const t=1-n;return 3*t*t*n*e}function Vm(n,e){return 3*(1-n)*n*n*e}function Hm(n,e){return n*n*n*e}function Ki(n,e,t,i,r){return zm(n,e)+Gm(n,t)+Vm(n,i)+Hm(n,r)}class ac extends on{constructor(e=new ie,t=new ie,i=new ie,r=new ie){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=r}getPoint(e,t=new ie){const i=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return i.set(Ki(e,r.x,s.x,o.x,a.x),Ki(e,r.y,s.y,o.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class Wm extends on{constructor(e=new P,t=new P,i=new P,r=new P){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=r}getPoint(e,t=new P){const i=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return i.set(Ki(e,r.x,s.x,o.x,a.x),Ki(e,r.y,s.y,o.y,a.y),Ki(e,r.z,s.z,o.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class lc extends on{constructor(e=new ie,t=new ie){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new ie){const i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new ie){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Xm extends on{constructor(e=new P,t=new P){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new P){const i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new P){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class cc extends on{constructor(e=new ie,t=new ie,i=new ie){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new ie){const i=t,r=this.v0,s=this.v1,o=this.v2;return i.set(ji(e,r.x,s.x,o.x),ji(e,r.y,s.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class hc extends on{constructor(e=new P,t=new P,i=new P){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new P){const i=t,r=this.v0,s=this.v1,o=this.v2;return i.set(ji(e,r.x,s.x,o.x),ji(e,r.y,s.y,o.y),ji(e,r.z,s.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class uc extends on{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new ie){const i=t,r=this.points,s=(r.length-1)*e,o=Math.floor(s),a=s-o,l=r[o===0?o:o-1],c=r[o],h=r[o>r.length-2?r.length-1:o+1],u=r[o>r.length-3?r.length-1:o+2];return i.set(ul(a,l.x,c.x,h.x,u.x),ul(a,l.y,c.y,h.y,u.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const r=e.points[t];this.points.push(r.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){const r=this.points[t];e.points.push(r.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const r=e.points[t];this.points.push(new ie().fromArray(r))}return this}}var jr=Object.freeze({__proto__:null,ArcCurve:Um,CatmullRomCurve3:Fm,CubicBezierCurve:ac,CubicBezierCurve3:Wm,EllipseCurve:Lo,LineCurve:lc,LineCurve3:Xm,QuadraticBezierCurve:cc,QuadraticBezierCurve3:hc,SplineCurve:uc});class Ym extends on{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){const i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new jr[i](t,e))}return this}getPoint(e,t){const i=e*this.getLength(),r=this.getCurveLengths();let s=0;for(;s<r.length;){if(r[s]>=i){const o=r[s]-i,a=this.curves[s],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}s++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let i=0,r=this.curves.length;i<r;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let i;for(let r=0,s=this.curves;r<s.length;r++){const o=s[r],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){const h=l[c];i&&i.equals(h)||(t.push(h),i=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){const r=e.curves[t];this.curves.push(r.clone())}return this.autoClose=e.autoClose,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){const r=this.curves[t];e.curves.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){const r=e.curves[t];this.curves.push(new jr[r.type]().fromJSON(r))}return this}}class ao extends Ym{constructor(e){super(),this.type="Path",this.currentPoint=new ie,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const i=new lc(this.currentPoint.clone(),new ie(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,r){const s=new cc(this.currentPoint.clone(),new ie(e,t),new ie(i,r));return this.curves.push(s),this.currentPoint.set(i,r),this}bezierCurveTo(e,t,i,r,s,o){const a=new ac(this.currentPoint.clone(),new ie(e,t),new ie(i,r),new ie(s,o));return this.curves.push(a),this.currentPoint.set(s,o),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),i=new uc(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,r,s,o){const a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,i,r,s,o),this}absarc(e,t,i,r,s,o){return this.absellipse(e,t,i,i,r,s,o),this}ellipse(e,t,i,r,s,o,a,l){const c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+c,t+h,i,r,s,o,a,l),this}absellipse(e,t,i,r,s,o,a,l){const c=new Lo(e,t,i,r,s,o,a,l);if(this.curves.length>0){const u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);const h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class bi extends vt{constructor(e=[new ie(0,-.5),new ie(.5,0),new ie(0,.5)],t=12,i=0,r=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:i,phiLength:r},t=Math.floor(t),r=wt(r,0,Math.PI*2);const s=[],o=[],a=[],l=[],c=[],h=1/t,u=new P,p=new ie,f=new P,g=new P,_=new P;let m=0,d=0;for(let y=0;y<=e.length-1;y++)switch(y){case 0:m=e[y+1].x-e[y].x,d=e[y+1].y-e[y].y,f.x=d*1,f.y=-m,f.z=d*0,_.copy(f),f.normalize(),l.push(f.x,f.y,f.z);break;case e.length-1:l.push(_.x,_.y,_.z);break;default:m=e[y+1].x-e[y].x,d=e[y+1].y-e[y].y,f.x=d*1,f.y=-m,f.z=d*0,g.copy(f),f.x+=_.x,f.y+=_.y,f.z+=_.z,f.normalize(),l.push(f.x,f.y,f.z),_.copy(g)}for(let y=0;y<=t;y++){const b=i+y*h*r,M=Math.sin(b),D=Math.cos(b);for(let R=0;R<=e.length-1;R++){u.x=e[R].x*M,u.y=e[R].y,u.z=e[R].x*D,o.push(u.x,u.y,u.z),p.x=y/t,p.y=R/(e.length-1),a.push(p.x,p.y);const A=l[3*R+0]*M,T=l[3*R+1],S=l[3*R+0]*D;c.push(A,T,S)}}for(let y=0;y<t;y++)for(let b=0;b<e.length-1;b++){const M=b+y*e.length,D=M,R=M+e.length,A=M+e.length+1,T=M+1;s.push(D,R,T),s.push(A,T,R)}this.setIndex(s),this.setAttribute("position",new Ye(o,3)),this.setAttribute("uv",new Ye(a,2)),this.setAttribute("normal",new Ye(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new bi(e.points,e.segments,e.phiStart,e.phiLength)}}class Do extends bi{constructor(e=1,t=1,i=4,r=8){const s=new ao;s.absarc(0,-t/2,e,Math.PI*1.5,0),s.absarc(0,t/2,e,0,Math.PI*.5),super(s.getPoints(i),r),this.type="CapsuleGeometry",this.parameters={radius:e,length:t,capSegments:i,radialSegments:r}}static fromJSON(e){return new Do(e.radius,e.length,e.capSegments,e.radialSegments)}}class ss extends vt{constructor(e=1,t=32,i=0,r=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:i,thetaLength:r},t=Math.max(3,t);const s=[],o=[],a=[],l=[],c=new P,h=new ie;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let u=0,p=3;u<=t;u++,p+=3){const f=i+u/t*r;c.x=e*Math.cos(f),c.y=e*Math.sin(f),o.push(c.x,c.y,c.z),a.push(0,0,1),h.x=(o[p]/e+1)/2,h.y=(o[p+1]/e+1)/2,l.push(h.x,h.y)}for(let u=1;u<=t;u++)s.push(u,u+1,0);this.setIndex(s),this.setAttribute("position",new Ye(o,3)),this.setAttribute("normal",new Ye(a,3)),this.setAttribute("uv",new Ye(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ss(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class Je extends vt{constructor(e=1,t=1,i=1,r=32,s=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:r,heightSegments:s,openEnded:o,thetaStart:a,thetaLength:l};const c=this;r=Math.floor(r),s=Math.floor(s);const h=[],u=[],p=[],f=[];let g=0;const _=[],m=i/2;let d=0;y(),o===!1&&(e>0&&b(!0),t>0&&b(!1)),this.setIndex(h),this.setAttribute("position",new Ye(u,3)),this.setAttribute("normal",new Ye(p,3)),this.setAttribute("uv",new Ye(f,2));function y(){const M=new P,D=new P;let R=0;const A=(t-e)/i;for(let T=0;T<=s;T++){const S=[],x=T/s,v=x*(t-e)+e;for(let I=0;I<=r;I++){const U=I/r,B=U*l+a,q=Math.sin(B),z=Math.cos(B);D.x=v*q,D.y=-x*i+m,D.z=v*z,u.push(D.x,D.y,D.z),M.set(q,A,z).normalize(),p.push(M.x,M.y,M.z),f.push(U,1-x),S.push(g++)}_.push(S)}for(let T=0;T<r;T++)for(let S=0;S<s;S++){const x=_[S][T],v=_[S+1][T],I=_[S+1][T+1],U=_[S][T+1];(e>0||S!==0)&&(h.push(x,v,U),R+=3),(t>0||S!==s-1)&&(h.push(v,I,U),R+=3)}c.addGroup(d,R,0),d+=R}function b(M){const D=g,R=new ie,A=new P;let T=0;const S=M===!0?e:t,x=M===!0?1:-1;for(let I=1;I<=r;I++)u.push(0,m*x,0),p.push(0,x,0),f.push(.5,.5),g++;const v=g;for(let I=0;I<=r;I++){const B=I/r*l+a,q=Math.cos(B),z=Math.sin(B);A.x=S*z,A.y=m*x,A.z=S*q,u.push(A.x,A.y,A.z),p.push(0,x,0),R.x=q*.5+.5,R.y=z*.5*x+.5,f.push(R.x,R.y),g++}for(let I=0;I<r;I++){const U=D+I,B=v+I;M===!0?h.push(B,B+1,U):h.push(B+1,B,U),T+=3}c.addGroup(d,T,M===!0?1:2),d+=T}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Je(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class No extends Je{constructor(e=1,t=1,i=32,r=1,s=!1,o=0,a=Math.PI*2){super(0,e,t,i,r,s,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:r,openEnded:s,thetaStart:o,thetaLength:a}}static fromJSON(e){return new No(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Uo extends vt{constructor(e=[],t=[],i=1,r=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:i,detail:r};const s=[],o=[];a(r),c(i),h(),this.setAttribute("position",new Ye(s,3)),this.setAttribute("normal",new Ye(s.slice(),3)),this.setAttribute("uv",new Ye(o,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function a(y){const b=new P,M=new P,D=new P;for(let R=0;R<t.length;R+=3)f(t[R+0],b),f(t[R+1],M),f(t[R+2],D),l(b,M,D,y)}function l(y,b,M,D){const R=D+1,A=[];for(let T=0;T<=R;T++){A[T]=[];const S=y.clone().lerp(M,T/R),x=b.clone().lerp(M,T/R),v=R-T;for(let I=0;I<=v;I++)I===0&&T===R?A[T][I]=S:A[T][I]=S.clone().lerp(x,I/v)}for(let T=0;T<R;T++)for(let S=0;S<2*(R-T)-1;S++){const x=Math.floor(S/2);S%2===0?(p(A[T][x+1]),p(A[T+1][x]),p(A[T][x])):(p(A[T][x+1]),p(A[T+1][x+1]),p(A[T+1][x]))}}function c(y){const b=new P;for(let M=0;M<s.length;M+=3)b.x=s[M+0],b.y=s[M+1],b.z=s[M+2],b.normalize().multiplyScalar(y),s[M+0]=b.x,s[M+1]=b.y,s[M+2]=b.z}function h(){const y=new P;for(let b=0;b<s.length;b+=3){y.x=s[b+0],y.y=s[b+1],y.z=s[b+2];const M=m(y)/2/Math.PI+.5,D=d(y)/Math.PI+.5;o.push(M,1-D)}g(),u()}function u(){for(let y=0;y<o.length;y+=6){const b=o[y+0],M=o[y+2],D=o[y+4],R=Math.max(b,M,D),A=Math.min(b,M,D);R>.9&&A<.1&&(b<.2&&(o[y+0]+=1),M<.2&&(o[y+2]+=1),D<.2&&(o[y+4]+=1))}}function p(y){s.push(y.x,y.y,y.z)}function f(y,b){const M=y*3;b.x=e[M+0],b.y=e[M+1],b.z=e[M+2]}function g(){const y=new P,b=new P,M=new P,D=new P,R=new ie,A=new ie,T=new ie;for(let S=0,x=0;S<s.length;S+=9,x+=6){y.set(s[S+0],s[S+1],s[S+2]),b.set(s[S+3],s[S+4],s[S+5]),M.set(s[S+6],s[S+7],s[S+8]),R.set(o[x+0],o[x+1]),A.set(o[x+2],o[x+3]),T.set(o[x+4],o[x+5]),D.copy(y).add(b).add(M).divideScalar(3);const v=m(D);_(R,x+0,y,v),_(A,x+2,b,v),_(T,x+4,M,v)}}function _(y,b,M,D){D<0&&y.x===1&&(o[b]=y.x-1),M.x===0&&M.z===0&&(o[b]=D/2/Math.PI+.5)}function m(y){return Math.atan2(y.z,-y.x)}function d(y){return Math.atan2(-y.y,Math.sqrt(y.x*y.x+y.z*y.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Uo(e.vertices,e.indices,e.radius,e.details)}}class Fo extends ao{constructor(e){super(e),this.uuid=jt(),this.type="Shape",this.holes=[]}getPointsHoles(e){const t=[];for(let i=0,r=this.holes.length;i<r;i++)t[i]=this.holes[i].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){const r=e.holes[t];this.holes.push(r.clone())}return this}toJSON(){const e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,i=this.holes.length;t<i;t++){const r=this.holes[t];e.holes.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){const r=e.holes[t];this.holes.push(new ao().fromJSON(r))}return this}}const qm={triangulate:function(n,e,t=2){const i=e&&e.length,r=i?e[0]*t:n.length;let s=dc(n,0,r,t,!0);const o=[];if(!s||s.next===s.prev)return o;let a,l,c,h,u,p,f;if(i&&(s=$m(n,e,s,t)),n.length>80*t){a=c=n[0],l=h=n[1];for(let g=t;g<r;g+=t)u=n[g],p=n[g+1],u<a&&(a=u),p<l&&(l=p),u>c&&(c=u),p>h&&(h=p);f=Math.max(c-a,h-l),f=f!==0?32767/f:0}return $i(s,o,t,a,l,f,0),o}};function dc(n,e,t,i,r){let s,o;if(r===c0(n,e,t,i)>0)for(s=e;s<t;s+=i)o=dl(s,n[s],n[s+1],o);else for(s=t-i;s>=e;s-=i)o=dl(s,n[s],n[s+1],o);return o&&os(o,o.next)&&(er(o),o=o.next),o}function Xn(n,e){if(!n)return n;e||(e=n);let t=n,i;do if(i=!1,!t.steiner&&(os(t,t.next)||_t(t.prev,t,t.next)===0)){if(er(t),t=e=t.prev,t===t.next)break;i=!0}else t=t.next;while(i||t!==e);return e}function $i(n,e,t,i,r,s,o){if(!n)return;!o&&s&&i0(n,i,r,s);let a=n,l,c;for(;n.prev!==n.next;){if(l=n.prev,c=n.next,s?Km(n,i,r,s):jm(n)){e.push(l.i/t|0),e.push(n.i/t|0),e.push(c.i/t|0),er(n),n=c.next,a=c.next;continue}if(n=c,n===a){o?o===1?(n=Jm(Xn(n),e,t),$i(n,e,t,i,r,s,2)):o===2&&Zm(n,e,t,i,r,s):$i(Xn(n),e,t,i,r,s,1);break}}}function jm(n){const e=n.prev,t=n,i=n.next;if(_t(e,t,i)>=0)return!1;const r=e.x,s=t.x,o=i.x,a=e.y,l=t.y,c=i.y,h=r<s?r<o?r:o:s<o?s:o,u=a<l?a<c?a:c:l<c?l:c,p=r>s?r>o?r:o:s>o?s:o,f=a>l?a>c?a:c:l>c?l:c;let g=i.next;for(;g!==e;){if(g.x>=h&&g.x<=p&&g.y>=u&&g.y<=f&&fi(r,a,s,l,o,c,g.x,g.y)&&_t(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function Km(n,e,t,i){const r=n.prev,s=n,o=n.next;if(_t(r,s,o)>=0)return!1;const a=r.x,l=s.x,c=o.x,h=r.y,u=s.y,p=o.y,f=a<l?a<c?a:c:l<c?l:c,g=h<u?h<p?h:p:u<p?u:p,_=a>l?a>c?a:c:l>c?l:c,m=h>u?h>p?h:p:u>p?u:p,d=lo(f,g,e,t,i),y=lo(_,m,e,t,i);let b=n.prevZ,M=n.nextZ;for(;b&&b.z>=d&&M&&M.z<=y;){if(b.x>=f&&b.x<=_&&b.y>=g&&b.y<=m&&b!==r&&b!==o&&fi(a,h,l,u,c,p,b.x,b.y)&&_t(b.prev,b,b.next)>=0||(b=b.prevZ,M.x>=f&&M.x<=_&&M.y>=g&&M.y<=m&&M!==r&&M!==o&&fi(a,h,l,u,c,p,M.x,M.y)&&_t(M.prev,M,M.next)>=0))return!1;M=M.nextZ}for(;b&&b.z>=d;){if(b.x>=f&&b.x<=_&&b.y>=g&&b.y<=m&&b!==r&&b!==o&&fi(a,h,l,u,c,p,b.x,b.y)&&_t(b.prev,b,b.next)>=0)return!1;b=b.prevZ}for(;M&&M.z<=y;){if(M.x>=f&&M.x<=_&&M.y>=g&&M.y<=m&&M!==r&&M!==o&&fi(a,h,l,u,c,p,M.x,M.y)&&_t(M.prev,M,M.next)>=0)return!1;M=M.nextZ}return!0}function Jm(n,e,t){let i=n;do{const r=i.prev,s=i.next.next;!os(r,s)&&fc(r,i,i.next,s)&&Qi(r,s)&&Qi(s,r)&&(e.push(r.i/t|0),e.push(i.i/t|0),e.push(s.i/t|0),er(i),er(i.next),i=n=s),i=i.next}while(i!==n);return Xn(i)}function Zm(n,e,t,i,r,s){let o=n;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&o0(o,a)){let l=pc(o,a);o=Xn(o,o.next),l=Xn(l,l.next),$i(o,e,t,i,r,s,0),$i(l,e,t,i,r,s,0);return}a=a.next}o=o.next}while(o!==n)}function $m(n,e,t,i){const r=[];let s,o,a,l,c;for(s=0,o=e.length;s<o;s++)a=e[s]*i,l=s<o-1?e[s+1]*i:n.length,c=dc(n,a,l,i,!1),c===c.next&&(c.steiner=!0),r.push(s0(c));for(r.sort(Qm),s=0;s<r.length;s++)t=e0(r[s],t);return t}function Qm(n,e){return n.x-e.x}function e0(n,e){const t=t0(n,e);if(!t)return e;const i=pc(t,n);return Xn(i,i.next),Xn(t,t.next)}function t0(n,e){let t=e,i=-1/0,r;const s=n.x,o=n.y;do{if(o<=t.y&&o>=t.next.y&&t.next.y!==t.y){const p=t.x+(o-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(p<=s&&p>i&&(i=p,r=t.x<t.next.x?t:t.next,p===s))return r}t=t.next}while(t!==e);if(!r)return null;const a=r,l=r.x,c=r.y;let h=1/0,u;t=r;do s>=t.x&&t.x>=l&&s!==t.x&&fi(o<c?s:i,o,l,c,o<c?i:s,o,t.x,t.y)&&(u=Math.abs(o-t.y)/(s-t.x),Qi(t,n)&&(u<h||u===h&&(t.x>r.x||t.x===r.x&&n0(r,t)))&&(r=t,h=u)),t=t.next;while(t!==a);return r}function n0(n,e){return _t(n.prev,n,e.prev)<0&&_t(e.next,n,n.next)<0}function i0(n,e,t,i){let r=n;do r.z===0&&(r.z=lo(r.x,r.y,e,t,i)),r.prevZ=r.prev,r.nextZ=r.next,r=r.next;while(r!==n);r.prevZ.nextZ=null,r.prevZ=null,r0(r)}function r0(n){let e,t,i,r,s,o,a,l,c=1;do{for(t=n,n=null,s=null,o=0;t;){for(o++,i=t,a=0,e=0;e<c&&(a++,i=i.nextZ,!!i);e++);for(l=c;a>0||l>0&&i;)a!==0&&(l===0||!i||t.z<=i.z)?(r=t,t=t.nextZ,a--):(r=i,i=i.nextZ,l--),s?s.nextZ=r:n=r,r.prevZ=s,s=r;t=i}s.nextZ=null,c*=2}while(o>1);return n}function lo(n,e,t,i,r){return n=(n-t)*r|0,e=(e-i)*r|0,n=(n|n<<8)&16711935,n=(n|n<<4)&252645135,n=(n|n<<2)&858993459,n=(n|n<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,n|e<<1}function s0(n){let e=n,t=n;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==n);return t}function fi(n,e,t,i,r,s,o,a){return(r-o)*(e-a)>=(n-o)*(s-a)&&(n-o)*(i-a)>=(t-o)*(e-a)&&(t-o)*(s-a)>=(r-o)*(i-a)}function o0(n,e){return n.next.i!==e.i&&n.prev.i!==e.i&&!a0(n,e)&&(Qi(n,e)&&Qi(e,n)&&l0(n,e)&&(_t(n.prev,n,e.prev)||_t(n,e.prev,e))||os(n,e)&&_t(n.prev,n,n.next)>0&&_t(e.prev,e,e.next)>0)}function _t(n,e,t){return(e.y-n.y)*(t.x-e.x)-(e.x-n.x)*(t.y-e.y)}function os(n,e){return n.x===e.x&&n.y===e.y}function fc(n,e,t,i){const r=kr(_t(n,e,t)),s=kr(_t(n,e,i)),o=kr(_t(t,i,n)),a=kr(_t(t,i,e));return!!(r!==s&&o!==a||r===0&&Fr(n,t,e)||s===0&&Fr(n,i,e)||o===0&&Fr(t,n,i)||a===0&&Fr(t,e,i))}function Fr(n,e,t){return e.x<=Math.max(n.x,t.x)&&e.x>=Math.min(n.x,t.x)&&e.y<=Math.max(n.y,t.y)&&e.y>=Math.min(n.y,t.y)}function kr(n){return n>0?1:n<0?-1:0}function a0(n,e){let t=n;do{if(t.i!==n.i&&t.next.i!==n.i&&t.i!==e.i&&t.next.i!==e.i&&fc(t,t.next,n,e))return!0;t=t.next}while(t!==n);return!1}function Qi(n,e){return _t(n.prev,n,n.next)<0?_t(n,e,n.next)>=0&&_t(n,n.prev,e)>=0:_t(n,e,n.prev)<0||_t(n,n.next,e)<0}function l0(n,e){let t=n,i=!1;const r=(n.x+e.x)/2,s=(n.y+e.y)/2;do t.y>s!=t.next.y>s&&t.next.y!==t.y&&r<(t.next.x-t.x)*(s-t.y)/(t.next.y-t.y)+t.x&&(i=!i),t=t.next;while(t!==n);return i}function pc(n,e){const t=new co(n.i,n.x,n.y),i=new co(e.i,e.x,e.y),r=n.next,s=e.prev;return n.next=e,e.prev=n,t.next=r,r.prev=t,i.next=t,t.prev=i,s.next=i,i.prev=s,i}function dl(n,e,t,i){const r=new co(n,e,t);return i?(r.next=i.next,r.prev=i,i.next.prev=r,i.next=r):(r.prev=r,r.next=r),r}function er(n){n.next.prev=n.prev,n.prev.next=n.next,n.prevZ&&(n.prevZ.nextZ=n.nextZ),n.nextZ&&(n.nextZ.prevZ=n.prevZ)}function co(n,e,t){this.i=n,this.x=e,this.y=t,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function c0(n,e,t,i){let r=0;for(let s=e,o=t-i;s<t;s+=i)r+=(n[o]-n[s])*(n[s+1]+n[o+1]),o=s;return r}class Pn{static area(e){const t=e.length;let i=0;for(let r=t-1,s=0;s<t;r=s++)i+=e[r].x*e[s].y-e[s].x*e[r].y;return i*.5}static isClockWise(e){return Pn.area(e)<0}static triangulateShape(e,t){const i=[],r=[],s=[];fl(e),pl(i,e);let o=e.length;t.forEach(fl);for(let l=0;l<t.length;l++)r.push(o),o+=t[l].length,pl(i,t[l]);const a=qm.triangulate(i,r);for(let l=0;l<a.length;l+=3)s.push(a.slice(l,l+3));return s}}function fl(n){const e=n.length;e>2&&n[e-1].equals(n[0])&&n.pop()}function pl(n,e){for(let t=0;t<e.length;t++)n.push(e[t].x),n.push(e[t].y)}class mc extends vt{constructor(e=new Fo([new ie(.5,.5),new ie(-.5,.5),new ie(-.5,-.5),new ie(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];const i=this,r=[],s=[];for(let a=0,l=e.length;a<l;a++){const c=e[a];o(c)}this.setAttribute("position",new Ye(r,3)),this.setAttribute("uv",new Ye(s,2)),this.computeVertexNormals();function o(a){const l=[],c=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,u=t.depth!==void 0?t.depth:1;let p=t.bevelEnabled!==void 0?t.bevelEnabled:!0,f=t.bevelThickness!==void 0?t.bevelThickness:.2,g=t.bevelSize!==void 0?t.bevelSize:f-.1,_=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3;const d=t.extrudePath,y=t.UVGenerator!==void 0?t.UVGenerator:h0;let b,M=!1,D,R,A,T;d&&(b=d.getSpacedPoints(h),M=!0,p=!1,D=d.computeFrenetFrames(h,!1),R=new P,A=new P,T=new P),p||(m=0,f=0,g=0,_=0);const S=a.extractPoints(c);let x=S.shape;const v=S.holes;if(!Pn.isClockWise(x)){x=x.reverse();for(let ee=0,X=v.length;ee<X;ee++){const L=v[ee];Pn.isClockWise(L)&&(v[ee]=L.reverse())}}const U=Pn.triangulateShape(x,v),B=x;for(let ee=0,X=v.length;ee<X;ee++){const L=v[ee];x=x.concat(L)}function q(ee,X,L){return X||console.error("THREE.ExtrudeGeometry: vec does not exist"),ee.clone().addScaledVector(X,L)}const z=x.length,Y=U.length;function N(ee,X,L){let ue,Q,ve;const de=ee.x-X.x,De=ee.y-X.y,be=L.x-ee.x,C=L.y-ee.y,w=de*de+De*De,G=de*C-De*be;if(Math.abs(G)>Number.EPSILON){const Z=Math.sqrt(w),ne=Math.sqrt(be*be+C*C),$=X.x-De/Z,Te=X.y+de/Z,pe=L.x-C/ne,Me=L.y+be/ne,je=((pe-$)*C-(Me-Te)*be)/(de*C-De*be);ue=$+de*je-ee.x,Q=Te+De*je-ee.y;const ae=ue*ue+Q*Q;if(ae<=2)return new ie(ue,Q);ve=Math.sqrt(ae/2)}else{let Z=!1;de>Number.EPSILON?be>Number.EPSILON&&(Z=!0):de<-Number.EPSILON?be<-Number.EPSILON&&(Z=!0):Math.sign(De)===Math.sign(C)&&(Z=!0),Z?(ue=-De,Q=de,ve=Math.sqrt(w)):(ue=de,Q=De,ve=Math.sqrt(w/2))}return new ie(ue/ve,Q/ve)}const j=[];for(let ee=0,X=B.length,L=X-1,ue=ee+1;ee<X;ee++,L++,ue++)L===X&&(L=0),ue===X&&(ue=0),j[ee]=N(B[ee],B[L],B[ue]);const he=[];let K,ce=j.concat();for(let ee=0,X=v.length;ee<X;ee++){const L=v[ee];K=[];for(let ue=0,Q=L.length,ve=Q-1,de=ue+1;ue<Q;ue++,ve++,de++)ve===Q&&(ve=0),de===Q&&(de=0),K[ue]=N(L[ue],L[ve],L[de]);he.push(K),ce=ce.concat(K)}for(let ee=0;ee<m;ee++){const X=ee/m,L=f*Math.cos(X*Math.PI/2),ue=g*Math.sin(X*Math.PI/2)+_;for(let Q=0,ve=B.length;Q<ve;Q++){const de=q(B[Q],j[Q],ue);oe(de.x,de.y,-L)}for(let Q=0,ve=v.length;Q<ve;Q++){const de=v[Q];K=he[Q];for(let De=0,be=de.length;De<be;De++){const C=q(de[De],K[De],ue);oe(C.x,C.y,-L)}}}const we=g+_;for(let ee=0;ee<z;ee++){const X=p?q(x[ee],ce[ee],we):x[ee];M?(A.copy(D.normals[0]).multiplyScalar(X.x),R.copy(D.binormals[0]).multiplyScalar(X.y),T.copy(b[0]).add(A).add(R),oe(T.x,T.y,T.z)):oe(X.x,X.y,0)}for(let ee=1;ee<=h;ee++)for(let X=0;X<z;X++){const L=p?q(x[X],ce[X],we):x[X];M?(A.copy(D.normals[ee]).multiplyScalar(L.x),R.copy(D.binormals[ee]).multiplyScalar(L.y),T.copy(b[ee]).add(A).add(R),oe(T.x,T.y,T.z)):oe(L.x,L.y,u/h*ee)}for(let ee=m-1;ee>=0;ee--){const X=ee/m,L=f*Math.cos(X*Math.PI/2),ue=g*Math.sin(X*Math.PI/2)+_;for(let Q=0,ve=B.length;Q<ve;Q++){const de=q(B[Q],j[Q],ue);oe(de.x,de.y,u+L)}for(let Q=0,ve=v.length;Q<ve;Q++){const de=v[Q];K=he[Q];for(let De=0,be=de.length;De<be;De++){const C=q(de[De],K[De],ue);M?oe(C.x,C.y+b[h-1].y,b[h-1].x+L):oe(C.x,C.y,u+L)}}}W(),se();function W(){const ee=r.length/3;if(p){let X=0,L=z*X;for(let ue=0;ue<Y;ue++){const Q=U[ue];Ce(Q[2]+L,Q[1]+L,Q[0]+L)}X=h+m*2,L=z*X;for(let ue=0;ue<Y;ue++){const Q=U[ue];Ce(Q[0]+L,Q[1]+L,Q[2]+L)}}else{for(let X=0;X<Y;X++){const L=U[X];Ce(L[2],L[1],L[0])}for(let X=0;X<Y;X++){const L=U[X];Ce(L[0]+z*h,L[1]+z*h,L[2]+z*h)}}i.addGroup(ee,r.length/3-ee,0)}function se(){const ee=r.length/3;let X=0;re(B,X),X+=B.length;for(let L=0,ue=v.length;L<ue;L++){const Q=v[L];re(Q,X),X+=Q.length}i.addGroup(ee,r.length/3-ee,1)}function re(ee,X){let L=ee.length;for(;--L>=0;){const ue=L;let Q=L-1;Q<0&&(Q=ee.length-1);for(let ve=0,de=h+m*2;ve<de;ve++){const De=z*ve,be=z*(ve+1),C=X+ue+De,w=X+Q+De,G=X+Q+be,Z=X+ue+be;Fe(C,w,G,Z)}}}function oe(ee,X,L){l.push(ee),l.push(X),l.push(L)}function Ce(ee,X,L){Le(ee),Le(X),Le(L);const ue=r.length/3,Q=y.generateTopUV(i,r,ue-3,ue-2,ue-1);qe(Q[0]),qe(Q[1]),qe(Q[2])}function Fe(ee,X,L,ue){Le(ee),Le(X),Le(ue),Le(X),Le(L),Le(ue);const Q=r.length/3,ve=y.generateSideWallUV(i,r,Q-6,Q-3,Q-2,Q-1);qe(ve[0]),qe(ve[1]),qe(ve[3]),qe(ve[1]),qe(ve[2]),qe(ve[3])}function Le(ee){r.push(l[ee*3+0]),r.push(l[ee*3+1]),r.push(l[ee*3+2])}function qe(ee){s.push(ee.x),s.push(ee.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes,i=this.parameters.options;return u0(t,i,e)}static fromJSON(e,t){const i=[];for(let s=0,o=e.shapes.length;s<o;s++){const a=t[e.shapes[s]];i.push(a)}const r=e.options.extrudePath;return r!==void 0&&(e.options.extrudePath=new jr[r.type]().fromJSON(r)),new mc(i,e.options)}}const h0={generateTopUV:function(n,e,t,i,r){const s=e[t*3],o=e[t*3+1],a=e[i*3],l=e[i*3+1],c=e[r*3],h=e[r*3+1];return[new ie(s,o),new ie(a,l),new ie(c,h)]},generateSideWallUV:function(n,e,t,i,r,s){const o=e[t*3],a=e[t*3+1],l=e[t*3+2],c=e[i*3],h=e[i*3+1],u=e[i*3+2],p=e[r*3],f=e[r*3+1],g=e[r*3+2],_=e[s*3],m=e[s*3+1],d=e[s*3+2];return Math.abs(a-h)<Math.abs(o-c)?[new ie(o,1-l),new ie(c,1-u),new ie(p,1-g),new ie(_,1-d)]:[new ie(a,1-l),new ie(h,1-u),new ie(f,1-g),new ie(m,1-d)]}};function u0(n,e,t){if(t.shapes=[],Array.isArray(n))for(let i=0,r=n.length;i<r;i++){const s=n[i];t.shapes.push(s.uuid)}else t.shapes.push(n.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}class gc extends Uo{constructor(e=1,t=0){const i=(1+Math.sqrt(5))/2,r=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],s=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(r,s,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new gc(e.radius,e.detail)}}class Kr extends vt{constructor(e=.5,t=1,i=32,r=1,s=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:r,thetaStart:s,thetaLength:o},i=Math.max(3,i),r=Math.max(1,r);const a=[],l=[],c=[],h=[];let u=e;const p=(t-e)/r,f=new P,g=new ie;for(let _=0;_<=r;_++){for(let m=0;m<=i;m++){const d=s+m/i*o;f.x=u*Math.cos(d),f.y=u*Math.sin(d),l.push(f.x,f.y,f.z),c.push(0,0,1),g.x=(f.x/t+1)/2,g.y=(f.y/t+1)/2,h.push(g.x,g.y)}u+=p}for(let _=0;_<r;_++){const m=_*(i+1);for(let d=0;d<i;d++){const y=d+m,b=y,M=y+i+1,D=y+i+2,R=y+1;a.push(b,M,R),a.push(M,D,R)}}this.setIndex(a),this.setAttribute("position",new Ye(l,3)),this.setAttribute("normal",new Ye(c,3)),this.setAttribute("uv",new Ye(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Kr(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class ko extends vt{constructor(e=new Fo([new ie(0,.5),new ie(-.5,-.5),new ie(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};const i=[],r=[],s=[],o=[];let a=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let h=0;h<e.length;h++)c(e[h]),this.addGroup(a,l,h),a+=l,l=0;this.setIndex(i),this.setAttribute("position",new Ye(r,3)),this.setAttribute("normal",new Ye(s,3)),this.setAttribute("uv",new Ye(o,2));function c(h){const u=r.length/3,p=h.extractPoints(t);let f=p.shape;const g=p.holes;Pn.isClockWise(f)===!1&&(f=f.reverse());for(let m=0,d=g.length;m<d;m++){const y=g[m];Pn.isClockWise(y)===!0&&(g[m]=y.reverse())}const _=Pn.triangulateShape(f,g);for(let m=0,d=g.length;m<d;m++){const y=g[m];f=f.concat(y)}for(let m=0,d=f.length;m<d;m++){const y=f[m];r.push(y.x,y.y,0),s.push(0,0,1),o.push(y.x,y.y)}for(let m=0,d=_.length;m<d;m++){const y=_[m],b=y[0]+u,M=y[1]+u,D=y[2]+u;i.push(b,M,D),l+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes;return d0(t,e)}static fromJSON(e,t){const i=[];for(let r=0,s=e.shapes.length;r<s;r++){const o=t[e.shapes[r]];i.push(o)}return new ko(i,e.curveSegments)}}function d0(n,e){if(e.shapes=[],Array.isArray(n))for(let t=0,i=n.length;t<i;t++){const r=n[t];e.shapes.push(r.uuid)}else e.shapes.push(n.uuid);return e}class Tt extends vt{constructor(e=1,t=32,i=16,r=0,s=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:r,phiLength:s,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));const l=Math.min(o+a,Math.PI);let c=0;const h=[],u=new P,p=new P,f=[],g=[],_=[],m=[];for(let d=0;d<=i;d++){const y=[],b=d/i;let M=0;d===0&&o===0?M=.5/t:d===i&&l===Math.PI&&(M=-.5/t);for(let D=0;D<=t;D++){const R=D/t;u.x=-e*Math.cos(r+R*s)*Math.sin(o+b*a),u.y=e*Math.cos(o+b*a),u.z=e*Math.sin(r+R*s)*Math.sin(o+b*a),g.push(u.x,u.y,u.z),p.copy(u).normalize(),_.push(p.x,p.y,p.z),m.push(R+M,1-b),y.push(c++)}h.push(y)}for(let d=0;d<i;d++)for(let y=0;y<t;y++){const b=h[d][y+1],M=h[d][y],D=h[d+1][y],R=h[d+1][y+1];(d!==0||o>0)&&f.push(b,M,R),(d!==i-1||l<Math.PI)&&f.push(M,D,R)}this.setIndex(f),this.setAttribute("position",new Ye(g,3)),this.setAttribute("normal",new Ye(_,3)),this.setAttribute("uv",new Ye(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Tt(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class yn extends vt{constructor(e=1,t=.4,i=12,r=48,s=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:i,tubularSegments:r,arc:s},i=Math.floor(i),r=Math.floor(r);const o=[],a=[],l=[],c=[],h=new P,u=new P,p=new P;for(let f=0;f<=i;f++)for(let g=0;g<=r;g++){const _=g/r*s,m=f/i*Math.PI*2;u.x=(e+t*Math.cos(m))*Math.cos(_),u.y=(e+t*Math.cos(m))*Math.sin(_),u.z=t*Math.sin(m),a.push(u.x,u.y,u.z),h.x=e*Math.cos(_),h.y=e*Math.sin(_),p.subVectors(u,h).normalize(),l.push(p.x,p.y,p.z),c.push(g/r),c.push(f/i)}for(let f=1;f<=i;f++)for(let g=1;g<=r;g++){const _=(r+1)*f+g-1,m=(r+1)*(f-1)+g-1,d=(r+1)*(f-1)+g,y=(r+1)*f+g;o.push(_,m,y),o.push(m,d,y)}this.setIndex(o),this.setAttribute("position",new Ye(a,3)),this.setAttribute("normal",new Ye(l,3)),this.setAttribute("uv",new Ye(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new yn(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class _c extends vt{constructor(e=new hc(new P(-1,-1,0),new P(-1,1,0),new P(1,1,0)),t=64,i=1,r=8,s=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:i,radialSegments:r,closed:s};const o=e.computeFrenetFrames(t,s);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;const a=new P,l=new P,c=new ie;let h=new P;const u=[],p=[],f=[],g=[];_(),this.setIndex(g),this.setAttribute("position",new Ye(u,3)),this.setAttribute("normal",new Ye(p,3)),this.setAttribute("uv",new Ye(f,2));function _(){for(let b=0;b<t;b++)m(b);m(s===!1?t:0),y(),d()}function m(b){h=e.getPointAt(b/t,h);const M=o.normals[b],D=o.binormals[b];for(let R=0;R<=r;R++){const A=R/r*Math.PI*2,T=Math.sin(A),S=-Math.cos(A);l.x=S*M.x+T*D.x,l.y=S*M.y+T*D.y,l.z=S*M.z+T*D.z,l.normalize(),p.push(l.x,l.y,l.z),a.x=h.x+i*l.x,a.y=h.y+i*l.y,a.z=h.z+i*l.z,u.push(a.x,a.y,a.z)}}function d(){for(let b=1;b<=t;b++)for(let M=1;M<=r;M++){const D=(r+1)*(b-1)+(M-1),R=(r+1)*b+(M-1),A=(r+1)*b+M,T=(r+1)*(b-1)+M;g.push(D,R,T),g.push(R,A,T)}}function y(){for(let b=0;b<=t;b++)for(let M=0;M<=r;M++)c.x=b/t,c.y=M/r,f.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new _c(new jr[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}}class St extends bn{static get type(){return"MeshStandardMaterial"}constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new Ie(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ie(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new ie(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new tn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class N_ extends St{static get type(){return"MeshPhysicalMaterial"}constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new ie(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return wt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Ie(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Ie(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Ie(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class f0 extends bn{static get type(){return"MeshToonMaterial"}constructor(e){super(),this.isMeshToonMaterial=!0,this.defines={TOON:""},this.color=new Ie(16777215),this.map=null,this.gradientMap=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ie(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new ie(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.gradientMap=e.gradientMap,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.alphaMap=e.alphaMap,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}function Or(n,e,t){return!n||!t&&n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}function p0(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function m0(n){function e(r,s){return n[r]-n[s]}const t=n.length,i=new Array(t);for(let r=0;r!==t;++r)i[r]=r;return i.sort(e),i}function ml(n,e,t){const i=n.length,r=new n.constructor(i);for(let s=0,o=0;o!==i;++s){const a=t[s]*e;for(let l=0;l!==e;++l)r[o++]=n[a+l]}return r}function yc(n,e,t,i){let r=1,s=n[0];for(;s!==void 0&&s[i]===void 0;)s=n[r++];if(s===void 0)return;let o=s[i];if(o!==void 0)if(Array.isArray(o))do o=s[i],o!==void 0&&(e.push(s.time),t.push.apply(t,o)),s=n[r++];while(s!==void 0);else if(o.toArray!==void 0)do o=s[i],o!==void 0&&(e.push(s.time),o.toArray(t,t.length)),s=n[r++];while(s!==void 0);else do o=s[i],o!==void 0&&(e.push(s.time),t.push(o)),s=n[r++];while(s!==void 0)}class as{constructor(e,t,i,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r!==void 0?r:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let i=this._cachedIndex,r=t[i],s=t[i-1];n:{e:{let o;t:{i:if(!(e<r)){for(let a=i+2;;){if(r===void 0){if(e<s)break i;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(s=r,r=t[++i],e<r)break e}o=t.length;break t}if(!(e>=s)){const a=t[1];e<a&&(i=2,s=a);for(let l=i-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(r=s,s=t[--i-1],e>=s)break e}o=i,i=0;break t}break n}for(;i<o;){const a=i+o>>>1;e<t[a]?o=a:i=a+1}if(r=t[i],s=t[i-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,s,r)}return this.interpolate_(i,s,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,i=this.sampleValues,r=this.valueSize,s=e*r;for(let o=0;o!==r;++o)t[o]=i[s+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}}class g0 extends as{constructor(e,t,i,r){super(e,t,i,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:2400,endingEnd:2400}}intervalChanged_(e,t,i){const r=this.parameterPositions;let s=e-2,o=e+1,a=r[s],l=r[o];if(a===void 0)switch(this.getSettings_().endingStart){case 2401:s=e,a=2*t-i;break;case 2402:s=r.length-2,a=t+r[s]-r[s+1];break;default:s=e,a=i}if(l===void 0)switch(this.getSettings_().endingEnd){case 2401:o=e,l=2*i-t;break;case 2402:o=1,l=i+r[1]-r[0];break;default:o=e-1,l=t}const c=(i-t)*.5,h=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-i),this._offsetPrev=s*h,this._offsetNext=o*h}interpolate_(e,t,i,r){const s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=this._offsetPrev,u=this._offsetNext,p=this._weightPrev,f=this._weightNext,g=(i-t)/(r-t),_=g*g,m=_*g,d=-p*m+2*p*_-p*g,y=(1+p)*m+(-1.5-2*p)*_+(-.5+p)*g+1,b=(-1-f)*m+(1.5+f)*_+.5*g,M=f*m-f*_;for(let D=0;D!==a;++D)s[D]=d*o[h+D]+y*o[c+D]+b*o[l+D]+M*o[u+D];return s}}class _0 extends as{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e,t,i,r){const s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=(i-t)/(r-t),u=1-h;for(let p=0;p!==a;++p)s[p]=o[c+p]*u+o[l+p]*h;return s}}class y0 extends as{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e){return this.copySampleValue_(e-1)}}class an{constructor(e,t,i,r){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Or(t,this.TimeBufferType),this.values=Or(i,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:Or(e.times,Array),values:Or(e.values,Array)};const r=e.getInterpolation();r!==e.DefaultInterpolation&&(i.interpolation=r)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new y0(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new _0(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new g0(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case 2300:t=this.InterpolantFactoryMethodDiscrete;break;case 2301:t=this.InterpolantFactoryMethodLinear;break;case 2302:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){const i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return console.warn("THREE.KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return 2300;case this.InterpolantFactoryMethodLinear:return 2301;case this.InterpolantFactoryMethodSmooth:return 2302}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let i=0,r=t.length;i!==r;++i)t[i]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let i=0,r=t.length;i!==r;++i)t[i]*=e}return this}trim(e,t){const i=this.times,r=i.length;let s=0,o=r-1;for(;s!==r&&i[s]<e;)++s;for(;o!==-1&&i[o]>t;)--o;if(++o,s!==0||o!==r){s>=o&&(o=Math.max(o,1),s=o-1);const a=this.getValueSize();this.times=i.slice(s,o),this.values=this.values.slice(s*a,o*a)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);const i=this.times,r=this.values,s=i.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==s;a++){const l=i[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(r!==void 0&&p0(r))for(let a=0,l=r.length;a!==l;++a){const c=r[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),r=this.getInterpolation()===2302,s=e.length-1;let o=1;for(let a=1;a<s;++a){let l=!1;const c=e[a],h=e[a+1];if(c!==h&&(a!==1||c!==e[0]))if(r)l=!0;else{const u=a*i,p=u-i,f=u+i;for(let g=0;g!==i;++g){const _=t[u+g];if(_!==t[p+g]||_!==t[f+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];const u=a*i,p=o*i;for(let f=0;f!==i;++f)t[p+f]=t[u+f]}++o}}if(s>0){e[o]=e[s];for(let a=s*i,l=o*i,c=0;c!==i;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*i)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),i=this.constructor,r=new i(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}}an.prototype.TimeBufferType=Float32Array;an.prototype.ValueBufferType=Float32Array;an.prototype.DefaultInterpolation=2301;class Ti extends an{constructor(e,t,i){super(e,t,i)}}Ti.prototype.ValueTypeName="bool";Ti.prototype.ValueBufferType=Array;Ti.prototype.DefaultInterpolation=2300;Ti.prototype.InterpolantFactoryMethodLinear=void 0;Ti.prototype.InterpolantFactoryMethodSmooth=void 0;class vc extends an{}vc.prototype.ValueTypeName="color";class Jr extends an{}Jr.prototype.ValueTypeName="number";class v0 extends as{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e,t,i,r){const s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(i-t)/(r-t);let c=e*a;for(let h=c+a;c!==h;c+=4)gt.slerpFlat(s,0,o,c-a,o,c,l);return s}}class ls extends an{InterpolantFactoryMethodLinear(e){return new v0(this.times,this.values,this.getValueSize(),e)}}ls.prototype.ValueTypeName="quaternion";ls.prototype.InterpolantFactoryMethodSmooth=void 0;class Ei extends an{constructor(e,t,i){super(e,t,i)}}Ei.prototype.ValueTypeName="string";Ei.prototype.ValueBufferType=Array;Ei.prototype.DefaultInterpolation=2300;Ei.prototype.InterpolantFactoryMethodLinear=void 0;Ei.prototype.InterpolantFactoryMethodSmooth=void 0;class Zr extends an{}Zr.prototype.ValueTypeName="vector";class U_{constructor(e="",t=-1,i=[],r=2500){this.name=e,this.tracks=i,this.duration=t,this.blendMode=r,this.uuid=jt(),this.duration<0&&this.resetDuration()}static parse(e){const t=[],i=e.tracks,r=1/(e.fps||1);for(let o=0,a=i.length;o!==a;++o)t.push(M0(i[o]).scale(r));const s=new this(e.name,e.duration,t,e.blendMode);return s.uuid=e.uuid,s}static toJSON(e){const t=[],i=e.tracks,r={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode};for(let s=0,o=i.length;s!==o;++s)t.push(an.toJSON(i[s]));return r}static CreateFromMorphTargetSequence(e,t,i,r){const s=t.length,o=[];for(let a=0;a<s;a++){let l=[],c=[];l.push((a+s-1)%s,a,(a+1)%s),c.push(0,1,0);const h=m0(l);l=ml(l,1,h),c=ml(c,1,h),!r&&l[0]===0&&(l.push(s),c.push(c[0])),o.push(new Jr(".morphTargetInfluences["+t[a].name+"]",l,c).scale(1/i))}return new this(e,-1,o)}static findByName(e,t){let i=e;if(!Array.isArray(e)){const r=e;i=r.geometry&&r.geometry.animations||r.animations}for(let r=0;r<i.length;r++)if(i[r].name===t)return i[r];return null}static CreateClipsFromMorphTargetSequences(e,t,i){const r={},s=/^([\w-]*?)([\d]+)$/;for(let a=0,l=e.length;a<l;a++){const c=e[a],h=c.name.match(s);if(h&&h.length>1){const u=h[1];let p=r[u];p||(r[u]=p=[]),p.push(c)}}const o=[];for(const a in r)o.push(this.CreateFromMorphTargetSequence(a,r[a],t,i));return o}static parseAnimation(e,t){if(!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;const i=function(u,p,f,g,_){if(f.length!==0){const m=[],d=[];yc(f,m,d,g),m.length!==0&&_.push(new u(p,m,d))}},r=[],s=e.name||"default",o=e.fps||30,a=e.blendMode;let l=e.length||-1;const c=e.hierarchy||[];for(let u=0;u<c.length;u++){const p=c[u].keys;if(!(!p||p.length===0))if(p[0].morphTargets){const f={};let g;for(g=0;g<p.length;g++)if(p[g].morphTargets)for(let _=0;_<p[g].morphTargets.length;_++)f[p[g].morphTargets[_]]=-1;for(const _ in f){const m=[],d=[];for(let y=0;y!==p[g].morphTargets.length;++y){const b=p[g];m.push(b.time),d.push(b.morphTarget===_?1:0)}r.push(new Jr(".morphTargetInfluence["+_+"]",m,d))}l=f.length*o}else{const f=".bones["+t[u].name+"]";i(Zr,f+".position",p,"pos",r),i(ls,f+".quaternion",p,"rot",r),i(Zr,f+".scale",p,"scl",r)}}return r.length===0?null:new this(s,l,r,a)}resetDuration(){const e=this.tracks;let t=0;for(let i=0,r=e.length;i!==r;++i){const s=this.tracks[i];t=Math.max(t,s.times[s.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());return new this.constructor(this.name,this.duration,e,this.blendMode)}toJSON(){return this.constructor.toJSON(this)}}function b0(n){switch(n.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Jr;case"vector":case"vector2":case"vector3":case"vector4":return Zr;case"color":return vc;case"quaternion":return ls;case"bool":case"boolean":return Ti;case"string":return Ei}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+n)}function M0(n){if(n.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=b0(n.type);if(n.times===void 0){const t=[],i=[];yc(n.keys,t,i,"value"),n.times=t,n.values=i}return e.parse!==void 0?e.parse(n):new e(n.name,n.times,n.values,n.interpolation)}const Cn={enabled:!1,files:{},add:function(n,e){this.enabled!==!1&&(this.files[n]=e)},get:function(n){if(this.enabled!==!1)return this.files[n]},remove:function(n){delete this.files[n]},clear:function(){this.files={}}};class x0{constructor(e,t,i){const r=this;let s=!1,o=0,a=0,l;const c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this.itemStart=function(h){a++,s===!1&&r.onStart!==void 0&&r.onStart(h,o,a),s=!0},this.itemEnd=function(h){o++,r.onProgress!==void 0&&r.onProgress(h,o,a),o===a&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(h){r.onError!==void 0&&r.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){const u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,p=c.length;u<p;u+=2){const f=c[u],g=c[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return g}return null}}}const S0=new x0;class Ai{constructor(e){this.manager=e!==void 0?e:S0,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const i=this;return new Promise(function(r,s){i.load(e,r,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}}Ai.DEFAULT_MATERIAL_NAME="__DEFAULT";const mn={};class w0 extends Error{constructor(e,t){super(e),this.response=t}}class T0 extends Ai{constructor(e){super(e)}load(e,t,i,r){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=Cn.get(e);if(s!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(s),this.manager.itemEnd(e)},0),s;if(mn[e]!==void 0){mn[e].push({onLoad:t,onProgress:i,onError:r});return}mn[e]=[],mn[e].push({onLoad:t,onProgress:i,onError:r});const o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin"}),a=this.mimeType,l=this.responseType;fetch(o).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;const h=mn[e],u=c.body.getReader(),p=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),f=p?parseInt(p):0,g=f!==0;let _=0;const m=new ReadableStream({start(d){y();function y(){u.read().then(({done:b,value:M})=>{if(b)d.close();else{_+=M.byteLength;const D=new ProgressEvent("progress",{lengthComputable:g,loaded:_,total:f});for(let R=0,A=h.length;R<A;R++){const T=h[R];T.onProgress&&T.onProgress(D)}d.enqueue(M),y()}},b=>{d.error(b)})}}});return new Response(m)}else throw new w0(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(h=>new DOMParser().parseFromString(h,a));case"json":return c.json();default:if(a===void 0)return c.text();{const u=/charset="?([^;"\s]*)"?/i.exec(a),p=u&&u[1]?u[1].toLowerCase():void 0,f=new TextDecoder(p);return c.arrayBuffer().then(g=>f.decode(g))}}}).then(c=>{Cn.add(e,c);const h=mn[e];delete mn[e];for(let u=0,p=h.length;u<p;u++){const f=h[u];f.onLoad&&f.onLoad(c)}}).catch(c=>{const h=mn[e];if(h===void 0)throw this.manager.itemError(e),c;delete mn[e];for(let u=0,p=h.length;u<p;u++){const f=h[u];f.onError&&f.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}}class E0 extends Ai{constructor(e){super(e)}load(e,t,i,r){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,o=Cn.get(e);if(o!==void 0)return s.manager.itemStart(e),setTimeout(function(){t&&t(o),s.manager.itemEnd(e)},0),o;const a=Zi("img");function l(){h(),Cn.add(e,this),t&&t(this),s.manager.itemEnd(e)}function c(u){h(),r&&r(u),s.manager.itemError(e),s.manager.itemEnd(e)}function h(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),s.manager.itemStart(e),a.src=e,a}}class F_ extends Ai{constructor(e){super(e)}load(e,t,i,r){const s=this,o=new rs,a=new T0(this.manager);return a.setResponseType("arraybuffer"),a.setRequestHeader(this.requestHeader),a.setPath(this.path),a.setWithCredentials(s.withCredentials),a.load(e,function(l){let c;try{c=s.parse(l)}catch(h){if(r!==void 0)r(h);else{console.error(h);return}}c.image!==void 0?o.image=c.image:c.data!==void 0&&(o.image.width=c.width,o.image.height=c.height,o.image.data=c.data),o.wrapS=c.wrapS!==void 0?c.wrapS:1001,o.wrapT=c.wrapT!==void 0?c.wrapT:1001,o.magFilter=c.magFilter!==void 0?c.magFilter:1006,o.minFilter=c.minFilter!==void 0?c.minFilter:1006,o.anisotropy=c.anisotropy!==void 0?c.anisotropy:1,c.colorSpace!==void 0&&(o.colorSpace=c.colorSpace),c.flipY!==void 0&&(o.flipY=c.flipY),c.format!==void 0&&(o.format=c.format),c.type!==void 0&&(o.type=c.type),c.mipmaps!==void 0&&(o.mipmaps=c.mipmaps,o.minFilter=1008),c.mipmapCount===1&&(o.minFilter=1006),c.generateMipmaps!==void 0&&(o.generateMipmaps=c.generateMipmaps),o.needsUpdate=!0,t&&t(o,c)},i,r),o}}class k_ extends Ai{constructor(e){super(e)}load(e,t,i,r){const s=new Ct,o=new E0(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){s.image=a,s.needsUpdate=!0,t!==void 0&&t(s)},i,r),s}}class cs extends yt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ie(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}class O_ extends cs{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(yt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ie(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const js=new Be,gl=new P,_l=new P;class Oo{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ie(512,512),this.map=null,this.mapPass=null,this.matrix=new Be,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ro,this._frameExtents=new ie(1,1),this._viewportCount=1,this._viewports=[new tt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,i=this.matrix;gl.setFromMatrixPosition(e.matrixWorld),t.position.copy(gl),_l.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(_l),t.updateMatrixWorld(),js.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(js),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(js)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class A0 extends Oo{constructor(){super(new Vt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1}updateMatrices(e){const t=this.camera,i=yi*2*e.angle*this.focus,r=this.mapSize.width/this.mapSize.height,s=e.distance||t.far;(i!==t.fov||r!==t.aspect||s!==t.far)&&(t.fov=i,t.aspect=r,t.far=s,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class B_ extends cs{constructor(e,t,i=0,r=Math.PI/3,s=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(yt.DEFAULT_UP),this.updateMatrix(),this.target=new yt,this.distance=i,this.angle=r,this.penumbra=s,this.decay=o,this.map=null,this.shadow=new A0}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}const yl=new Be,Gi=new P,Ks=new P;class R0 extends Oo{constructor(){super(new Vt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new ie(4,2),this._viewportCount=6,this._viewports=[new tt(2,1,1,1),new tt(0,1,1,1),new tt(3,1,1,1),new tt(1,1,1,1),new tt(3,0,1,1),new tt(1,0,1,1)],this._cubeDirections=[new P(1,0,0),new P(-1,0,0),new P(0,0,1),new P(0,0,-1),new P(0,1,0),new P(0,-1,0)],this._cubeUps=[new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,0,1),new P(0,0,-1)]}updateMatrices(e,t=0){const i=this.camera,r=this.matrix,s=e.distance||i.far;s!==i.far&&(i.far=s,i.updateProjectionMatrix()),Gi.setFromMatrixPosition(e.matrixWorld),i.position.copy(Gi),Ks.copy(i.position),Ks.add(this._cubeDirections[t]),i.up.copy(this._cubeUps[t]),i.lookAt(Ks),i.updateMatrixWorld(),r.makeTranslation(-Gi.x,-Gi.y,-Gi.z),yl.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),this._frustum.setFromProjectionMatrix(yl)}}class z_ extends cs{constructor(e,t,i=0,r=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=r,this.shadow=new R0}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class C0 extends Oo{constructor(){super(new Jl(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class G_ extends cs{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(yt.DEFAULT_UP),this.updateMatrix(),this.target=new yt,this.shadow=new C0}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class V_{static decodeText(e){if(console.warn("THREE.LoaderUtils: decodeText() has been deprecated with r165 and will be removed with r175. Use TextDecoder instead."),typeof TextDecoder<"u")return new TextDecoder().decode(e);let t="";for(let i=0,r=e.length;i<r;i++)t+=String.fromCharCode(e[i]);try{return decodeURIComponent(escape(t))}catch{return t}}static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}class H_ extends Ai{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"}}setOptions(e){return this.options=e,this}load(e,t,i,r){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,o=Cn.get(e);if(o!==void 0){if(s.manager.itemStart(e),o.then){o.then(c=>{t&&t(c),s.manager.itemEnd(e)}).catch(c=>{r&&r(c)});return}return setTimeout(function(){t&&t(o),s.manager.itemEnd(e)},0),o}const a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader;const l=fetch(e,a).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign(s.options,{colorSpaceConversion:"none"}))}).then(function(c){return Cn.add(e,c),t&&t(c),s.manager.itemEnd(e),c}).catch(function(c){r&&r(c),Cn.remove(e),s.manager.itemError(e),s.manager.itemEnd(e)});Cn.add(e,l),s.manager.itemStart(e)}}class W_{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=vl(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=vl();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}function vl(){return performance.now()}const Bo="\\[\\]\\.:\\/",P0=new RegExp("["+Bo+"]","g"),zo="[^"+Bo+"]",L0="[^"+Bo.replace("\\.","")+"]",I0=/((?:WC+[\/:])*)/.source.replace("WC",zo),D0=/(WCOD+)?/.source.replace("WCOD",L0),N0=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",zo),U0=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",zo),F0=new RegExp("^"+I0+D0+N0+U0+"$"),k0=["material","materials","bones","map"];class O0{constructor(e,t,i){const r=i||ct.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();const i=this._targetGroup.nCachedObjects_,r=this._bindings[i];r!==void 0&&r.getValue(e,t)}setValue(e,t){const i=this._bindings;for(let r=this._targetGroup.nCachedObjects_,s=i.length;r!==s;++r)i[r].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}}class ct{constructor(e,t,i){this.path=t,this.parsedPath=i||ct.parseTrackName(t),this.node=ct.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new ct.Composite(e,t,i):new ct(e,t,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(P0,"")}static parseTrackName(e){const t=F0.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=i.nodeName&&i.nodeName.lastIndexOf(".");if(r!==void 0&&r!==-1){const s=i.nodeName.substring(r+1);k0.indexOf(s)!==-1&&(i.nodeName=i.nodeName.substring(0,r),i.objectName=s)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){const i=function(s){for(let o=0;o<s.length;o++){const a=s[o];if(a.name===t||a.uuid===t)return a;const l=i(a.children);if(l)return l}return null},r=i(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)e[t++]=i[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,i=t.objectName,r=t.propertyName;let s=t.propertyIndex;if(e||(e=ct.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=t.objectIndex;switch(i){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}const o=e[r];if(o===void 0){const c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+r+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(r==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=s}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=r;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}ct.Composite=O0;ct.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ct.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ct.prototype.GetterByBindingType=[ct.prototype._getValue_direct,ct.prototype._getValue_array,ct.prototype._getValue_arrayElement,ct.prototype._getValue_toArray];ct.prototype.SetterByBindingTypeAndVersioning=[[ct.prototype._setValue_direct,ct.prototype._setValue_direct_setNeedsUpdate,ct.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ct.prototype._setValue_array,ct.prototype._setValue_array_setNeedsUpdate,ct.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ct.prototype._setValue_arrayElement,ct.prototype._setValue_arrayElement_setNeedsUpdate,ct.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ct.prototype._setValue_fromArray,ct.prototype._setValue_fromArray_setNeedsUpdate,ct.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];const bl=new Be;class X_{constructor(e,t,i=0,r=1/0){this.ray=new tr(e,t),this.near=i,this.far=r,this.camera=null,this.layers=new To,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return bl.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(bl),this}intersectObject(e,t=!0,i=[]){return ho(e,this,i,t),i.sort(Ml),i}intersectObjects(e,t=!0,i=[]){for(let r=0,s=e.length;r<s;r++)ho(e[r],this,i,t);return i.sort(Ml),i}}function Ml(n,e){return n.distance-e.distance}function ho(n,e,t,i){let r=!0;if(n.layers.test(e.layers)&&n.raycast(e,t)===!1&&(r=!1),r===!0&&i===!0){const s=n.children;for(let o=0,a=s.length;o<a;o++)ho(s[o],e,t,!0)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"170"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="170");const Y_={minX:77,maxX:103,minZ:94,maxZ:134},q_={id:"island-shopping-lane",peninsula:!0,width:6,surface:"asphalt",points:[[89,87],[90,96],[90,128]]},j_=(n,e)=>n>=77&&n<=103&&e>=94&&e<=134,B0=Object.freeze({top:"jacket",topColour:"#eee8da",pattern:"none",bottom:"skirt",bottomColour:"#9b2834",bottomPattern:"plaid",footwear:"boots",shoes:"#704431",accent:"#e7c887",hat:"none"});function Vr(n,e=!1){const t=n[0].index!==null,i=new Set(Object.keys(n[0].attributes)),r=new Set(Object.keys(n[0].morphAttributes)),s={},o={},a=n[0].morphTargetsRelative,l=new vt;let c=0;for(let h=0;h<n.length;++h){const u=n[h];let p=0;if(t!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const f in u.attributes){if(!i.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+f+'" attribute exists among all geometries, or in none of them.'),null;s[f]===void 0&&(s[f]=[]),s[f].push(u.attributes[f]),p++}if(p!==i.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(a!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const f in u.morphAttributes){if(!r.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;o[f]===void 0&&(o[f]=[]),o[f].push(u.morphAttributes[f])}if(e){let f;if(t)f=u.index.count;else if(u.attributes.position!==void 0)f=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,f,h),c+=f}}if(t){let h=0;const u=[];for(let p=0;p<n.length;++p){const f=n[p].index;for(let g=0;g<f.count;++g)u.push(f.getX(g)+h);h+=n[p].attributes.position.count}l.setIndex(u)}for(const h in s){const u=xl(s[h]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,u)}for(const h in o){const u=o[h][0].length;if(u===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let p=0;p<u;++p){const f=[];for(let _=0;_<o[h].length;++_)f.push(o[h][_][p]);const g=xl(f);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(g)}}return l}function xl(n){let e,t,i,r=-1,s=0;for(let c=0;c<n.length;++c){const h=n[c];if(e===void 0&&(e=h.array.constructor),e!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=h.itemSize),t!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(i===void 0&&(i=h.normalized),i!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(r===-1&&(r=h.gpuType),r!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;s+=h.count*t}const o=new e(s),a=new Nt(o,t,i);let l=0;for(let c=0;c<n.length;++c){const h=n[c];if(h.isInterleavedBufferAttribute){const u=l/t;for(let p=0,f=h.count;p<f;p++)for(let g=0;g<t;g++){const _=h.getComponent(p,g);a.setComponent(p+u,g,_)}}else o.set(h.array,l);l+=h.count*t}return r!==void 0&&(a.gpuType=r),a}function K_(n,e){if(e===0)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),n;if(e===2||e===1){let t=n.getIndex();if(t===null){const o=[],a=n.getAttribute("position");if(a!==void 0){for(let l=0;l<a.count;l++)o.push(l);n.setIndex(o),t=n.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),n}const i=t.count-2,r=[];if(e===2)for(let o=1;o<=i;o++)r.push(t.getX(0)),r.push(t.getX(o)),r.push(t.getX(o+1));else for(let o=0;o<i;o++)o%2===0?(r.push(t.getX(o)),r.push(t.getX(o+1)),r.push(t.getX(o+2))):(r.push(t.getX(o+2)),r.push(t.getX(o+1)),r.push(t.getX(o)));r.length/3!==i&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");const s=n.clone();return s.setIndex(r),s.clearGroups(),s}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),n}const Go=Object.freeze(["oval","round","square","narrow","heart"]),Sl={oval:[.94,1.08,.22],round:[1.03,1.01,.1],square:[1.03,1.02,-.16],narrow:[.84,1.16,.25],heart:[1.01,1.07,.37]};function z0(n){const[e,t,i]=Sl[n.form]||Sl.oval;return{width:e+(n.shape-.5)*.12,height:t-(n.shape-.5)*.1,taper:i+(n.jaw-.5)*-.22,cheek:(n.cheeks-.5)*.13}}function ir(n,e){const t=n.y,i=Math.max(0,Math.min(1,(-t-.12)/.78)),r=Math.exp(-(((t+.16)/.32)**2))*e.cheek;return n.x*=1-e.taper*i+r,n.z>0&&(n.z*=1-.08*Math.max(0,1-Math.abs(t)*1.4)),n}const G0=Object.freeze({skin:Object.freeze(["#f7dcc4","#f1cfae","#e8bf98","#dca97e","#c98d62","#b27449","#8f5a38","#6b4029"]),hair:Object.freeze(["#1c1714","#3a2618","#5a3a22","#8a5a2e","#c08a4a","#e0c078","#9a9a96","#d8d6d0","#b8412e","#3d4f8a"]),eyes:Object.freeze(["#2a1d16","#5a3a22","#3d6a8a","#4a7a4a","#6a5a8a","#1c1c24"]),cloth:Object.freeze(["#f4f1ea","#d8342c","#e8742a","#f4d23c","#8fbf4a","#2a8a5a","#3fa0c8","#2f5f9e","#27304d","#8a4ab8","#e98aa6","#9a6a42","#6d7478","#2b2b2b","#c8b48a","#7fb0d8"]),lips:Object.freeze(["#b8544a","#a8433e","#cc3d52","#e06a7a","#d8342c","#8a3a3a"])}),V0=Object.freeze(["child","teen","adult","elder"]),bc=n=>Number.isFinite(+n)?n<13?"child":n<19?"teen":n>=65?"elder":"adult":"adult",ft=Object.freeze({silhouette:Object.freeze(["neutral","feminine","masculine"]),head:Go,hair:Object.freeze(["crop","sidepart","bob","long","ponytail","braids","bun","spiky","perm","buzz","afro","horseshoe","bald"]),eyes:Object.freeze(["round","dot","almond","sleepy","lashes","narrow","sparkle","gentle"]),brows:Object.freeze(["straight","arched","thick","thin","worried","bushy","none"]),nose:Object.freeze(["button","dot","line","wide","hook","none"]),mouth:Object.freeze(["smile","flat","grin","small","wide","smirk","pout"]),glasses:Object.freeze(["none","round","square","sun","half"]),facial:Object.freeze(["none","moustache","walrus","stubble","beard","goatee"]),top:Object.freeze(["tank","tee","kariyushi","polo","blouse","jacket","apron","smock"]),bottom:Object.freeze(["underwear","shorts","trousers","skirt","longskirt"]),footwear:Object.freeze(["barefoot","sneakers","sandals","shoes","boots"]),hat:Object.freeze(["none","cap","captain","police","helmet","straw","headband","kerchief","beanie","beret","bucket","ribbon"]),earrings:Object.freeze(["none","studs","hoops"]),neckwear:Object.freeze(["none","pendant","scarf"])}),H0=(n,e=0,t=1)=>Math.min(t,Math.max(e,Number.isFinite(+n)?+n:e)),Dt=(n,e,t)=>n.includes(e)?e:t??n[0],W0=n=>/^#[0-9a-f]{6}$/i.test(String(n))?String(n).toLowerCase():null,X0=Object.freeze({v:1,name:"",age:"adult",body:Object.freeze({height:.5,build:.5,silhouette:"neutral",skin:"#e8bf98"}),head:Object.freeze({size:.5,shape:.5,form:"oval",jaw:.5,cheeks:.5}),hair:Object.freeze({style:"crop",colour:"#1c1714",flip:!1}),eyes:Object.freeze({style:"round",colour:"#2a1d16",size:.5,width:.5,spacing:.5,height:.5,tilt:.5}),brows:Object.freeze({style:"straight",colour:"#1c1714",size:.5,spacing:.5,height:.5,tilt:.5}),nose:Object.freeze({style:"button",size:.5,height:.5,x:.5}),mouth:Object.freeze({style:"smile",colour:"#b8544a",size:.5,width:.5,height:.5,x:.5}),glasses:Object.freeze({style:"none",colour:"#2b2b2b"}),facial:Object.freeze({style:"none",colour:"#1c1714"}),blush:.25,freckles:!1,mole:!1,wrinkles:0,outfit:Object.freeze({top:"tank",topColour:"#f4f1ea",pattern:"none",bottom:"underwear",bottomColour:"#7fb0d8",footwear:"barefoot",shoes:"#6d4a32",hat:"none",hatColour:"#f4f1ea",accent:"#f4d23c"}),accessories:Object.freeze({earrings:"none",neckwear:"none",colour:"#e0b93a",pin:!1}),swim:Object.freeze({colour:"#2f5f9e"}),profile:Object.freeze({pace:.5,talk:.5,show:.5,outlook:.5,pitch:.5,speed:.5,month:7,day:1,favourite:"#3fa0c8",catchphrase:""})});function Ht(n={}){const e=n&&typeof n=="object"?n:{},t=X0,i=(a,l)=>{const c=e[a]&&typeof e[a]=="object"?e[a]:{},h={};for(const[u,p]of Object.entries(l))h[u]=p(c[u],t[a][u]);return h},r=(a,l)=>a===void 0?l:H0(a),s=(a,l)=>W0(a)||l,o=(a,l)=>a===void 0?l:!!a;return{v:1,name:String(e.name||"").slice(0,24),age:Dt(V0,e.age,"adult"),body:i("body",{height:r,build:r,silhouette:a=>Dt(ft.silhouette,a,"neutral"),skin:s}),head:i("head",{size:r,shape:r,form:(a,l)=>Dt(Go,a,l),jaw:r,cheeks:r}),hair:i("hair",{style:(a,l)=>Dt(ft.hair,a,l),colour:s,flip:o}),eyes:i("eyes",{style:(a,l)=>Dt(ft.eyes,a,l),colour:s,size:r,width:r,spacing:r,height:r,tilt:r}),brows:i("brows",{style:(a,l)=>Dt(ft.brows,a,l),colour:s,size:r,spacing:r,height:r,tilt:r}),nose:i("nose",{style:(a,l)=>Dt(ft.nose,a,l),size:r,height:r,x:r}),mouth:i("mouth",{style:(a,l)=>Dt(ft.mouth,a,l),colour:s,size:r,width:r,height:r,x:r}),glasses:i("glasses",{style:(a,l)=>Dt(ft.glasses,a,l),colour:s}),facial:i("facial",{style:(a,l)=>Dt(ft.facial,a,l),colour:s}),blush:r(e.blush,t.blush),freckles:!!e.freckles,mole:!!e.mole,wrinkles:r(e.wrinkles,t.wrinkles),outfit:Y0(e.outfit,i("outfit",{top:(a,l)=>Dt(ft.top,a,l),topColour:s,pattern:(a,l)=>["none","flowers","stripes","dots"].includes(a)?a:l,bottom:(a,l)=>Dt(ft.bottom,a,l),bottomColour:s,bottomPattern:a=>a==="plaid"?"plaid":"none",footwear:(a,l)=>Dt(ft.footwear,a,l),shoes:s,hat:(a,l)=>Dt(ft.hat,a,l),hatColour:s,accent:s})),accessories:i("accessories",{earrings:(a,l)=>Dt(ft.earrings,a,l),neckwear:(a,l)=>Dt(ft.neckwear,a,l),colour:s,pin:o}),swim:i("swim",{colour:s}),profile:(()=>{const a=i("profile",{pace:r,talk:r,show:r,outlook:r,pitch:r,speed:r,month:(l,c)=>Number.isInteger(+l)&&+l>=1&&+l<=12?+l:c,day:(l,c)=>Number.isInteger(+l)&&+l>=1&&+l<=31?+l:c,favourite:s,catchphrase:(l,c)=>l===void 0?c:String(l).replace(/[\u0000-\u001f<>]/g,"").slice(0,40)});return a.day=Math.min(a.day,[31,29,31,30,31,30,31,31,30,31,30,31][a.month-1]),a})()}}function Y0(n,e){return!n||typeof n!="object"||(n.top===void 0&&(e.top="tee",n.topColour===void 0&&(e.topColour="#3fa0c8")),n.bottom===void 0&&(e.bottom="trousers",n.bottomColour===void 0&&(e.bottomColour="#27304d")),ft.footwear.includes(n.footwear)||(e.footwear="sneakers")),e}function Mc(n){const e=JSON.stringify(Ht(n)),t=new TextEncoder().encode(e);let i="";for(const r of t)i+=String.fromCharCode(r);return btoa(i).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}function Vo(n){try{const e=atob(String(n).replace(/-/g,"+").replace(/_/g,"/")),t=Uint8Array.from(e,i=>i.charCodeAt(0));return Ht(JSON.parse(new TextDecoder().decode(t)))}catch{return null}}function Ho(n=""){let e=2166136261;for(const t of String(n))e=Math.imul(e^t.codePointAt(0),16777619)>>>0;return()=>{e=e+1831565813>>>0;let t=e;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}function J_(n=Math.random().toString(36)){const e=Ho(n),t=a=>a[Math.floor(e()*a.length)],i=G0,r=e()<.3,s=e()<.5,o=t(r?s?["perm","bun","bob"]:["horseshoe","buzz","crop","bald"]:s?["bob","long","ponytail","braids","bun","sidepart"]:["crop","sidepart","spiky","buzz","afro"]);return Ht({body:{height:.3+e()*.5,build:.25+e()*.55,skin:t(i.skin.slice(0,7))},head:{size:.4+e()*.25,shape:e(),form:t(Go),jaw:e(),cheeks:e()},hair:{style:o,colour:t(r?["#9a9a96","#d8d6d0","#5a3a22"]:i.hair.slice(0,6)),flip:e()<.5},eyes:{style:t(ft.eyes),colour:t(i.eyes),size:.3+e()*.5,spacing:.3+e()*.4,height:.4+e()*.2,tilt:.35+e()*.3},brows:{style:t(ft.brows.slice(0,6)),colour:r?"#8a8a86":"#1c1714",size:.4+e()*.3,height:.4+e()*.3,tilt:.3+e()*.4},nose:{style:t(ft.nose.slice(0,5)),size:.3+e()*.5,height:.4+e()*.2},mouth:{style:t(ft.mouth),colour:s&&e()<.5?t(i.lips):"#b8544a",size:.35+e()*.4,height:.4+e()*.2},glasses:{style:e()<.25?t(ft.glasses.slice(1)):"none",colour:t(["#2b2b2b","#8a4a3a","#c8a060","#e06a7a"])},facial:{style:!s&&e()<.3?t(ft.facial.slice(1)):"none",colour:"#3a2618"},blush:s?.3+e()*.4:e()*.2,freckles:e()<.12,mole:e()<.1,wrinkles:r?.5+e()*.5:0,outfit:{top:t(["tee","kariyushi","polo","blouse","jacket"]),topColour:t(i.cloth),pattern:e()<.3?t(["flowers","stripes","dots"]):"none",bottom:s&&e()<.4?t(["skirt","longskirt"]):t(["shorts","trousers"]),bottomColour:t(["#27304d","#6d7478","#c8b48a","#2b2b2b","#9a6a42","#2f5f9e"]),shoes:t(["#6d4a32","#2b2b2b","#f4f1ea","#d8342c"]),footwear:t(["sneakers","sandals","shoes","boots"]),hat:"none",hatColour:"#f4f1ea",accent:t(i.cloth)},profile:{pace:e(),talk:e(),show:e(),outlook:e(),pitch:s?.45+e()*.5:e()*.6,speed:e(),month:1+Math.floor(e()*12),day:1+Math.floor(e()*28),favourite:t(i.cloth)}})}const st=Math.PI*2,q0=Object.freeze(["#b8544a","#a8433e","#9a4a40"]);function gi(n,e){const t=parseInt(n.slice(1),16),i=r=>Math.max(0,Math.min(255,Math.round(r*e)));return"#"+[i(t>>16),i(t>>8&255),i(t&255)].map(r=>r.toString(16).padStart(2,"0")).join("")}function hs(n){const e=n.eyes,t=n.brows,i=n.nose,r=n.mouth,s=104+(e.height-.5)*-56,o=38+(e.spacing-.5)*36,a=1.16+e.size*.8;return{eyeY:s,spread:o,eyeS:a,eyeW:.85+(e.width??.5)*.7,eyeTilt:(e.tilt-.5)*.85,browY:70+(t.height-.5)*-48,browSpread:o+((t.spacing??.5)-.5)*32,browS:.75+t.size*.6,browTilt:(t.tilt-.5)*.85,noseY:134+(i.height-.5)*-48,noseX:128+((i.x??.5)-.5)*48,noseS:.7+i.size*.7,mouthY:160+(r.height-.5)*-54,mouthX:128+((r.x??.5)-.5)*56,mouthS:1+r.size*.8,mouthW:.65+(r.width??.5)*.7}}const uo=Object.freeze({neutral:{eyes:"open",brow:0,browLift:0,mouth:null,blush:0},smile:{eyes:"smiling",brow:0,browLift:3,mouth:"smile",blush:.15},content:{eyes:"content",brow:0,browLift:1,mouth:"smile",blush:.1},happy:{eyes:"happy",brow:0,browLift:10,mouth:"grin",blush:.4},laugh:{eyes:"happy",brow:0,browLift:14,mouth:"laugh",blush:.55},sad:{eyes:"sad",brow:-1,browLift:3,mouth:"frown",blush:0},worried:{eyes:"worry",brow:-1.35,browLift:10,mouth:"wobble",blush:0},angry:{eyes:"angry",brow:1.4,browLift:-5,mouth:"snarl",blush:.15},grumpy:{eyes:"angry",brow:.6,browLift:-2,mouth:"frown",blush:0},shy:{eyes:"shy",brow:-.4,browLift:3,mouth:"small",blush:1},surprised:{eyes:"wide",brow:0,browLift:20,mouth:"o",blush:0},thinking:{eyes:"side",brow:.3,browLift:0,mouth:"hmm",blush:0},sleep:{eyes:"closed",brow:0,browLift:-1,mouth:"small",blush:0}});Object.freeze(Object.keys(uo));function j0(n,e,t={}){const i=t.size||256,r=i/256,s=uo[t.expression]||uo.neutral,o=hs(e),a=e.body.skin,l="#2b2623";if(n.canvas.__skin=a,n.save(),n.setTransform(r,0,0,r,0,0),n.fillStyle=a,n.fillRect(0,0,256,256),n.lineCap="round",n.lineJoin="round",e.wrinkles>.05){n.strokeStyle=gi(a,.8),n.lineWidth=1.6,n.globalAlpha=Math.min(1,e.wrinkles);for(const f of[-1,1]){const g=128+f*(o.spread+16*o.eyeS);for(let _=0;_<2;_++)n.beginPath(),n.moveTo(g,o.eyeY-4+_*7),n.lineTo(g+f*8,o.eyeY-6+_*9),n.stroke();n.beginPath(),n.arc(128+f*22,o.mouthY-6,14,f>0?-.2:Math.PI-.6,f>0?.6:Math.PI+.2),n.stroke()}for(let f=0;f<2;f++)n.beginPath(),n.moveTo(104,o.browY-14-f*7),n.quadraticCurveTo(128,o.browY-18-f*7,152,o.browY-14-f*7),n.stroke();n.globalAlpha=1}if(e.freckles){n.fillStyle=gi(a,.72);for(const f of[-1,1])for(let g=0;g<5;g++)n.beginPath(),n.arc(128+f*(o.spread+g%3*5-2),o.noseY-2+Math.floor(g/3)*6,1.5,0,st),n.fill()}e.mole&&(n.fillStyle="#4a3024",n.beginPath(),n.arc(128+o.spread*.9,o.mouthY-6,2.4,0,st),n.fill());const c=Math.min(1,e.blush*.8+s.blush);if(c>.02){for(const f of[-1,1]){const g=128+f*(o.spread+8),_=o.noseY+2,m=n.createRadialGradient(g,_,1,g,_,17);m.addColorStop(0,`rgba(236,110,120,${.55*c})`),m.addColorStop(1,"rgba(236,110,120,0)"),n.fillStyle=m,n.beginPath(),n.ellipse(g,_,18,12,0,0,st),n.fill()}if(s.blush>=.9){n.strokeStyle="rgba(210,80,90,.7)",n.lineWidth=1.6;for(const f of[-1,1])for(let g=0;g<3;g++){const _=128+f*(o.spread+2+g*6);n.beginPath(),n.moveTo(_-2,o.noseY+6),n.lineTo(_+2,o.noseY-2),n.stroke()}}}const u=Math.max(0,Math.min(1,t.blink||0))>.5&&s.eyes!=="happy"?"closed":s.eyes,p=t.look||[0,0];for(const f of[-1,1])xc(n,128+f*o.spread,o.eyeY,o.eyeS,f,e.eyes,u,p,o.eyeTilt,o.eyeW);if(e.brows.style!=="none")for(const f of[-1,1])Sc(n,128+f*o.browSpread,o.browY-s.browLift,o.browS,f,e.brows,o.browTilt,s.brow);wc(n,o.noseX,o.noseY,o.noseS,e.nose.style,a),fo(n,o.mouthX,o.mouthY,o.mouthS,e.mouth,s.mouth,t.talk||0,l,o.mouthW),Tc(n,o,e.facial),Ec(n,o,e.glasses),n.restore()}function xc(n,e,t,i,r,s,o,a,l,c=1){const h=s.style,u="#2b2623";if(n.save(),n.translate(e,t),n.rotate(r*l*-1),n.scale(i*c,i),n.strokeStyle=u,n.fillStyle=u,n.lineWidth=3.2,o==="wide"||o==="worry"){const _=o==="wide"?15:13,m=o==="wide"?19:16;if(n.fillStyle="#fbfaf6",n.beginPath(),n.ellipse(0,0,_,m,0,0,st),n.fill(),n.stroke(),n.fillStyle=s.colour,n.beginPath(),n.ellipse(a[0]*3,a[1]*3,_*.58,m*.62,0,0,st),n.fill(),n.fillStyle=u,n.beginPath(),n.ellipse(a[0]*3,a[1]*3,_*.36,m*.42,0,0,st),n.fill(),n.fillStyle="#fff",n.beginPath(),n.arc(3,-5,3,0,st),n.fill(),h==="lashes")for(let d=0;d<3;d++)n.beginPath(),n.moveTo(r*_*.8,-9+d*5),n.lineTo(r*(_+6),-12+d*6),n.stroke();n.restore();return}if(o==="closed"||o==="content"){n.beginPath(),n.arc(0,o==="content"?-3:-6,11,Math.PI*.18,Math.PI*.82),n.stroke(),h==="lashes"&&(n.beginPath(),n.moveTo(r*9,2),n.lineTo(r*14,5),n.stroke()),n.restore();return}if(o==="happy"){n.lineWidth=5.2,n.beginPath(),n.moveTo(-13,4),n.quadraticCurveTo(0,-21,13,4),n.stroke(),n.restore();return}const p=o==="wide"?1.3:1,f=(h==="narrow"?12:h==="dot"?6:h==="sparkle"?13:11.5)*p,g=(h==="narrow"?4.2:h==="dot"?9:h==="almond"?9.5:h==="sparkle"?15:13.5)*p;if(["round","gentle","lashes","sleepy"].includes(h)){const _=(h==="sleepy"?6:h==="gentle"?9:12)*p;if(n.save(),n.beginPath(),n.ellipse(a[0]*2,a[1]*2,9*p,_,0,0,st),n.clip(),n.fill(),n.fillStyle=n.canvas.__skin,o==="angry"||o==="sad"){const m=o==="angry"?-r:r;n.beginPath(),n.moveTo(-14,-_-2),n.lineTo(14,-_-2),n.lineTo(m*14,1),n.closePath(),n.fill()}else o==="shy"?n.fillRect(-14,-_-2,28,_*.7):o==="smiling"&&(n.beginPath(),n.ellipse(0,_+5,15,9,0,0,st),n.fill());if(n.restore(),["angry","sad","shy"].includes(o)||(n.fillStyle="#fbfaf6",n.beginPath(),n.arc(a[0]*2+2,-_*.35+a[1]*2,1.8,0,st),n.fill()),h==="lashes"){n.lineWidth=2.8;for(let m=0;m<2;m++)n.beginPath(),n.moveTo(r*5,-5-m*3),n.lineTo(r*(11+m*2),-8-m*4),n.stroke()}}else if(h==="dot")n.beginPath(),n.ellipse(a[0]*2,a[1]*2,f,g,0,0,st),n.fill(),n.fillStyle="#fff",n.beginPath(),n.arc(2+a[0]*2,-3,2.2,0,st),n.fill();else if(h==="narrow")n.beginPath(),n.ellipse(0,0,f,g,0,0,st),n.fill();else{n.fillStyle="#fbfaf6",n.beginPath(),h==="almond"?(n.moveTo(-f,1),n.quadraticCurveTo(-2,-g*1.5,f,-1),n.quadraticCurveTo(0,g*1.3,-f,1)):n.ellipse(0,0,f,g,0,0,st),n.fill(),n.save(),n.clip();const _=h==="sparkle"?10:7.4,m=a[0]*4,d=a[1]*3+(h==="gentle"?3:1);if(n.fillStyle=s.colour,n.beginPath(),n.arc(m,d,_,0,st),n.fill(),n.fillStyle="#120c0a",n.beginPath(),n.arc(m,d,_*.5,0,st),n.fill(),n.fillStyle="#fff",n.beginPath(),n.arc(m+_*.38,d-_*.4,_*.3,0,st),n.fill(),h==="sparkle"&&(n.beginPath(),n.arc(m-_*.35,d+_*.4,_*.16,0,st),n.fill()),n.fillStyle=n.canvas.__skin||"#e8bf98",(h==="sleepy"||o==="shy")&&n.fillRect(-f-2,-g-2,f*2+4,g*.9),o==="sad"&&(n.beginPath(),n.moveTo(-f-2,-g-2),n.lineTo(f+2,-g-2),n.lineTo(r*f+2*r,-g*.1),n.closePath(),n.fill()),o==="angry"&&(n.beginPath(),n.moveTo(-f-2,-g-2),n.lineTo(f+2,-g-2),n.lineTo(-r*f-2*r,-g*.05),n.closePath(),n.fill()),n.restore(),n.lineWidth=2.4,n.beginPath(),h==="almond"?(n.moveTo(-f,1),n.quadraticCurveTo(-2,-g*1.5,f,-1),n.stroke()):(n.ellipse(0,0,f,g,0,Math.PI*1.05,Math.PI*1.95),n.stroke()),h==="gentle"&&(n.lineWidth=3,n.beginPath(),n.arc(0,g*.3,f*1.02,Math.PI*1.12,Math.PI*1.88),n.stroke()),h==="lashes"){n.lineWidth=2.2;for(let y=0;y<3;y++){const b=-Math.PI/2+r*(.55+y*.28);n.beginPath(),n.moveTo(Math.cos(b)*f*.95,Math.sin(b)*g*.95),n.lineTo(Math.cos(b)*(f+6),Math.sin(b)*(g+5)),n.stroke()}}}o==="sad"&&(n.strokeStyle="rgba(120,180,230,.7)",n.lineWidth=2.2,n.beginPath(),n.moveTo(r*-4,g),n.lineTo(r*-5,g+8),n.stroke()),n.restore()}function Sc(n,e,t,i,r,s,o,a){n.save(),n.translate(e,t),n.scale(i,i),n.rotate(r*(o*-1+a*.48));const l=gi(s.colour,.68);n.strokeStyle=l,n.fillStyle=l,n.lineCap="round";const c=s.style,h=c==="thick"||c==="bushy"?7:c==="thin"?2.4:4.2;if(n.lineWidth=h,n.beginPath(),c==="arched")n.moveTo(-13,3),n.quadraticCurveTo(0,-7,13,2);else if(c==="worried")n.moveTo(-13,-3),n.quadraticCurveTo(0,0,13,3);else if(c==="bushy"){n.moveTo(-14,2),n.quadraticCurveTo(0,-5,14,1),n.stroke(),n.lineWidth=2;for(let u=-12;u<=12;u+=4)n.beginPath(),n.moveTo(u,-2),n.lineTo(u+2*r,-7),n.stroke();n.restore();return}else n.moveTo(-13,1),n.quadraticCurveTo(0,-3,13,1);n.stroke(),n.restore()}function wc(n,e,t,i,r,s,o){if(n.save(),n.translate(e,t),n.scale(i,i),n.strokeStyle=gi(s,.62),n.fillStyle=gi(s,.8),n.lineWidth=2.4,r==="button")n.beginPath(),n.ellipse(0,0,7,5.5,0,0,st),n.fill(),n.fillStyle="rgba(255,255,255,.35)",n.beginPath(),n.arc(-2,-2,2,0,st),n.fill();else if(r==="dot"){n.fillStyle=gi(s,.6);for(const a of[-3,3])n.beginPath(),n.arc(a,0,1.6,0,st),n.fill()}else r==="line"?(n.beginPath(),n.moveTo(1,-12),n.quadraticCurveTo(-2,0,3,4),n.lineTo(-3,4),n.stroke()):r==="wide"?(n.beginPath(),n.moveTo(-10,-2),n.quadraticCurveTo(-11,6,-3,5),n.moveTo(10,-2),n.quadraticCurveTo(11,6,3,5),n.stroke(),n.beginPath(),n.ellipse(0,1,6,4,0,0,st),n.fill()):r==="hook"&&(n.beginPath(),n.moveTo(-1,-16),n.quadraticCurveTo(8,2,1,6),n.lineTo(-4,4),n.stroke());n.restore()}function fo(n,e,t,i,r,s,o,a,l=1){n.save(),n.translate(e,t),n.scale(i*l,i);const c=r.colour,h=!q0.includes(c.toLowerCase());n.strokeStyle=h?c:a,n.lineWidth=h?3.6:3.4,n.lineCap="round";const u="#2b2623",p="#e07a80",f="#fbfaf6",g=(m,d,y=0)=>{n.fillStyle=u,n.beginPath(),n.moveTo(-m,0),n.quadraticCurveTo(0,-y,m,0),n.quadraticCurveTo(0,d*2,-m,0),n.fill(),n.save(),n.clip(),n.fillStyle=f,n.fillRect(-m,-d,m*2,d*.55+y*.2),n.fillStyle=p,n.beginPath(),n.ellipse(0,d*1.3,m*.55,d*.55,0,0,st),n.fill(),n.restore(),n.beginPath(),n.moveTo(-m,0),n.quadraticCurveTo(0,-y,m,0),n.quadraticCurveTo(0,d*2,-m,0),n.stroke()},_=o>.5?"talk":s||r.style;switch(n.beginPath(),_){case"talk":{const m=["grin","laugh","o"].includes(s);g(m?19:12,(m?13:7)+o*3,m?6:2);break}case"grin":g(24,15,5);break;case"laugh":g(28,23,7);break;case"o":n.fillStyle=u,n.ellipse(0,3,13,20,0,0,st),n.fill(),n.stroke();break;case"frown":n.arc(0,12,13,Math.PI*1.2,Math.PI*1.8),n.stroke();break;case"snarl":n.moveTo(-12,4),n.lineTo(-4,0),n.lineTo(4,0),n.lineTo(12,4),n.stroke();break;case"wobble":n.moveTo(-14,1),n.quadraticCurveTo(0,5,14,1),n.moveTo(-14,-4),n.quadraticCurveTo(-10,1,-14,7),n.moveTo(14,-4),n.quadraticCurveTo(10,1,14,7),n.stroke();break;case"hmm":n.moveTo(-8,2),n.lineTo(8,-1),n.stroke();break;case"smile":n.moveTo(-16,-1),n.quadraticCurveTo(0,15,16,-1),n.stroke();break;case"flat":n.moveTo(-11,1),n.lineTo(11,1),n.stroke();break;case"small":n.arc(0,-3,6,Math.PI*.25,Math.PI*.75),n.stroke();break;case"wide":n.arc(0,-10,18,Math.PI*.22,Math.PI*.78),n.stroke();break;case"smirk":n.moveTo(-10,2),n.quadraticCurveTo(2,4,11,-4),n.stroke();break;case"pout":n.fillStyle=c,n.ellipse(0,1,6,4.5,0,0,st),n.fill();break;default:n.arc(0,-8,13,Math.PI*.2,Math.PI*.8),n.stroke()}h&&["smile","small","wide","flat","smirk","wobble"].includes(_)&&(n.fillStyle=c,n.globalAlpha=.85,n.beginPath(),n.ellipse(0,2,_==="wide"?13:9,3.2,0,0,st),n.fill(),n.globalAlpha=1),n.restore()}function Tc(n,e,t){if(t.style==="none")return;n.save(),n.fillStyle=t.colour,n.strokeStyle=t.colour;const i=(e.noseY+e.mouthY)/2+2;if(t.style==="moustache")n.beginPath(),n.moveTo(128,i-3),n.quadraticCurveTo(114,i-6,108,i+3),n.quadraticCurveTo(118,i+1,128,i+2),n.quadraticCurveTo(138,i+1,148,i+3),n.quadraticCurveTo(142,i-6,128,i-3),n.fill();else if(t.style==="walrus")n.beginPath(),n.ellipse(128,i+1,24,8,0,0,st),n.fill();else if(t.style==="stubble"){n.globalAlpha=.35;for(let r=0;r<140;r++){const s=Math.PI*(.1+.8*(r%47)/46),o=46+r*7%11,a=128+Math.cos(s)*o*.95,l=e.mouthY-26+Math.sin(s)*o*.8;l>e.noseY+8&&n.fillRect(a,l,1.6,1.6)}n.globalAlpha=1}else t.style==="beard"?(n.beginPath(),n.moveTo(84,e.noseY),n.quadraticCurveTo(90,e.mouthY+40,128,e.mouthY+42),n.quadraticCurveTo(166,e.mouthY+40,172,e.noseY),n.lineTo(160,e.noseY+4),n.quadraticCurveTo(150,e.mouthY+18,128,e.mouthY+16),n.quadraticCurveTo(106,e.mouthY+18,96,e.noseY+4),n.closePath(),n.fill()):t.style==="goatee"&&(n.beginPath(),n.ellipse(128,e.mouthY+18,9,11,0,0,st),n.fill());n.restore()}function Ec(n,e,t){if(t.style==="none")return;n.save(),n.strokeStyle=t.colour,n.lineWidth=3.2;const i=15*e.eyeS+2,r=e.eyeY,s=i*e.eyeW;for(const o of[-1,1]){const a=128+o*e.spread;n.beginPath(),t.style==="round"?n.ellipse(a,r,s,i,0,0,st):t.style==="half"?n.ellipse(a,r-2,s,i,0,Math.PI*.05,Math.PI*.95):n.roundRect?n.roundRect(a-s*1.1,r-i*.8,s*2.2,i*1.6,6):n.rect(a-s*1.1,r-i*.8,s*2.2,i*1.6),t.style==="sun"&&(n.fillStyle="rgba(30,34,40,.9)",n.fill()),n.stroke(),t.style!=="sun"&&(n.save(),n.strokeStyle="rgba(255,255,255,.55)",n.lineWidth=2,n.beginPath(),n.moveTo(a+i*.3,r-i*.55),n.lineTo(a+i*.6,r-i*.25),n.stroke(),n.restore())}n.beginPath(),n.moveTo(128-e.spread+s*(t.style==="round"||t.style==="half"?1:1.1),r-2),n.quadraticCurveTo(128,r-8,128+e.spread-s*(t.style==="round"||t.style==="half"?1:1.1),r-2),n.stroke(),n.restore()}function Z_(n,e,t,i=n.canvas.width){const r=e.body.skin,s="#2b2623",o={...e,eyes:{...e.eyes,height:.5,spacing:.5,size:.5,tilt:.5},brows:{...e.brows,height:.5,spacing:.5,size:.5,tilt:.5},nose:{...e.nose,height:.5,x:.5,size:.5},mouth:{...e.mouth,height:.5,x:.5,size:.5,width:.5}},a=hs(o),l={eyes:[128,a.eyeY,1.75],glasses:[128,a.eyeY,1.6],brows:[128,a.browY,2],nose:[128,a.noseY,3.4],mouth:[128,a.mouthY+2,2.7],facial:[128,(a.noseY+a.mouthY)/2+(e.facial.style==="beard"?18:e.facial.style==="goatee"?14:2),e.facial.style==="beard"?1.5:2.2]}[t]||[128,128,1],c=i/256;if(n.save(),n.setTransform(c,0,0,c,0,0),n.canvas.__skin=r,n.fillStyle=r,n.fillRect(0,0,256,256),n.translate(128,128),n.scale(l[2],l[2]),n.translate(-l[0],-l[1]),n.lineCap="round",n.lineJoin="round",t==="eyes"||t==="glasses")for(const u of[-1,1])xc(n,128+u*a.spread,a.eyeY,a.eyeS,u,o.eyes,"open",[0,0],a.eyeTilt,a.eyeW);if(t==="brows"&&e.brows.style!=="none")for(const u of[-1,1])Sc(n,128+u*a.browSpread,a.browY,a.browS,u,o.brows,a.browTilt,0);t==="nose"&&wc(n,a.noseX,a.noseY,a.noseS,e.nose.style,r),t==="mouth"&&fo(n,a.mouthX,a.mouthY,a.mouthS,o.mouth,null,0,s,a.mouthW),t==="facial"&&(fo(n,a.mouthX,a.mouthY,a.mouthS,{...o.mouth,style:"flat"},null,0,"rgba(43,38,35,.35)",a.mouthW),Tc(n,a,e.facial)),t==="glasses"&&Ec(n,a,e.glasses),n.restore(),(t==="brows"&&e.brows.style==="none"||t==="nose"&&e.nose.style==="none"||t==="glasses"&&e.glasses.style==="none"||t==="facial"&&e.facial.style==="none")&&(n.save(),n.strokeStyle="rgba(43,38,35,.25)",n.lineWidth=i*.04,n.lineCap="round",n.beginPath(),n.moveTo(i*.3,i*.7),n.lineTo(i*.7,i*.3),n.stroke(),n.restore())}function K0(n,e=2){return n.userData.worldTextureScale=e,n.onBeforeCompile=t=>{t.uniforms.townTileMetres={value:e},t.vertexShader=`uniform float townTileMetres;
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
      #endif`)},n.customProgramCacheKey=()=>"town-world-uv-v1",n}const wl={2:[96,255],3:[92,178,255],4:[80,142,202,255],soft:[180,255],soft3:[172,214,255]},Js=new Map;function J0(n=3){if(Js.has(n))return Js.get(n);const e=wl[n]||wl[3],t=new Uint8Array(e.length*4);for(let r=0;r<e.length;r++)t[r*4]=t[r*4+1]=t[r*4+2]=e[r],t[r*4+3]=255;const i=new rs(t,e.length,1,1023);return i.minFilter=i.magFilter=1003,i.generateMipmaps=!1,i.needsUpdate=!0,Js.set(n,i),i}const Ac="lights_toon_pars_fragment",Tl="vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;",Z0=`
	vec3 celBand = getGradientIrradiance( geometryNormal, directLight.direction );
	vec3 irradiance = celBand * mix( uShadowTint, vec3( 1.0 ), celBand ) * directLight.color;`;let po="";{const n=ze[Ac];n.includes(Tl)&&(po=`uniform vec3 uShadowTint;
`+n.replace(Tl,Z0))}const Rc="map_fragment",El="diffuseColor *= sampledDiffuseColor;",$0=`diffuseColor.rgb *= mix( vec3( 1.0 ), sampledDiffuseColor.rgb, uFlatten );
	diffuseColor.a *= sampledDiffuseColor.a;`,Q0=`uniform float uFlatten;
`;let mo="";{const n=ze[Rc];n.includes(El)&&(mo=n.replace(El,$0))}const eg=.65;function tg(n){return!!(n.normalMap||n.roughnessMap||n.bumpMap||n.aoMap)}function ng(n,e,t=1,{base:i=null,baseKey:r=""}={}){const s=!!po,o=!!mo&&t<1&&!!n.map;if(!s&&!o&&!i)return n;const a={value:new Ie(e)},l={value:t};n.userData.shadowTint=a,n.userData.flatten=l,n.onBeforeCompile=(h,u)=>{i?.(h,u),s&&(h.uniforms.uShadowTint=a,h.fragmentShader=h.fragmentShader.replace("#include <"+Ac+">",po)),o&&(h.uniforms.uFlatten=l,h.fragmentShader=Q0+h.fragmentShader.replace("#include <"+Rc+">",mo))};const c=new Ie(e).getHexString();return n.customProgramCacheKey=()=>"cel_"+c+"_"+(o?t:1)+"_"+r,n}const Cc=7102348,ig=.66;function rg(n){return n?n.r*.2126+n.g*.7152+n.b*.0722:0}function sg(n){return rg(n.color)>=ig?"soft3":3}function og(n,{skinned:e=!1}={}){return e?!0:n.userData?.keepPhysical!==!0?!1:n.userData.keepPhysicalStrict===!0?!0:!!n.transparent&&(n.opacity??1)<.95}const ag=.3,Zs=new WeakMap;function us(n,{tint:e=Cc,bands:t=null}={}){if(Zs.has(n))return Zs.get(n);const i=new f0({color:n.color?n.color.clone():new Ie(16777215),map:n.map||null,alphaMap:n.alphaMap||null,gradientMap:J0(t??sg(n)),transparent:n.transparent,opacity:n.opacity,side:n.side,alphaTest:n.alphaTest,fog:n.fog,vertexColors:n.vertexColors,emissive:n.emissive?n.emissive.clone():new Ie(0),emissiveMap:n.emissiveMap||null,emissiveIntensity:n.emissiveIntensity??1});i.depthWrite=n.depthWrite,i.depthTest=n.depthTest,i.polygonOffset=n.polygonOffset,i.polygonOffsetFactor=n.polygonOffsetFactor,i.polygonOffsetUnits=n.polygonOffsetUnits,i.name=n.name,i.userData={...n.userData,celFrom:n};const r=n.userData?.worldTextureScale;Number.isFinite(r)&&K0(i,r);const s=typeof i.onBeforeCompile=="function"?i.onBeforeCompile:null,o=Number.isFinite(r)?"worlduv"+r:"",a=n.userData?.keepPhysical===!0;return ng(i,e,tg(n)?a?ag:eg:1,{base:s,baseKey:o}),Zs.set(n,i),lg(n,i),i}function lg(n,e){n.emissive&&n.emissive.isColor&&(e.emissive=n.emissive);for(const t of["emissiveIntensity","opacity","visible"]){let i=n[t];try{Object.defineProperty(n,t,{configurable:!0,enumerable:!0,get(){return i},set(r){i=r,e[t]=r,t==="opacity"&&(e.needsUpdate=e.needsUpdate)}})}catch{}}}function cg(n,e){return!n||n.isMeshToonMaterial||!n.isMeshStandardMaterial&&!n.isMeshPhongMaterial&&!n.isMeshLambertMaterial?!0:og(n,{skinned:e})}function $_(n,{tint:e=Cc,seen:t=null,force:i=!1,collect:r=null}={}){const s={converted:0,skipped:0,visited:0};return n&&n.traverse(o=>{if(!o.isMesh&&!o.isPoints&&!o.isLine)return;if(!i&&t){if(t.has(o))return;t.add(o)}s.visited++;const a=!!o.isSkinnedMesh,l=c=>{if(cg(c,a))return s.skipped++,c;s.converted++;const h=us(c,{tint:e});return r&&h.userData.flatten&&r.add(h.userData.flatten),h};o.material=Array.isArray(o.material)?o.material.map(l):l(o.material)}),s}const go=Object.freeze(["root","hips","spine","chest","neck","head","shoulderL","elbowL","handL","shoulderR","elbowR","handR","thighL","kneeL","footL","thighR","kneeR","footR"]),Al=Object.fromEntries(go.map((n,e)=>[n,e])),Rl=Object.freeze({child:{base:1.12,span:.2,head:1.4},teen:{base:1.4,span:.28,head:1.18},adult:{base:1.36,span:.44,head:1.12},elder:{base:1.33,span:.34,head:1.14}});function Wo(n){const e=Ht(n),t=Rl[e.age]||Rl.adult,i=t.base+e.body.height*t.span,r=i/1.6,s=e.body.build,o=z0(e.head),a=(.19+e.head.size*.055)*r*t.head,l=o.width,c=o.height,h=.055*r,u=i-a*2*c-h,p=u*.47,f=u-p,g=.07*r,_=(p-g)*.5,m=_,d=(.058+s*.024)*r,y=(.045+s*.016)*r,b=e.body.silhouette==="feminine",M=e.body.silhouette==="masculine",D=(.3+s*.15)*r*(b?.94:M?1.08:1),R=(.2+s*.09)*r,A=D*(b?1.13:M?.9:1),T=b?.79:M?.98:.96,S=.22*r,x=.2*r,v=.056*r,I=p,U=I+f*.5,B=I+f,q=B+h;return{H:i,k:r,Rh:a,headSX:l,headSY:c,profile:o,neck:h,torso:f,leg:p,foot:g,thigh:_,shin:m,legR:d,armR:y,width:D,hips:A,waistRatio:T,depth:R,upper:S,fore:x,hand:v,hipY:I,chestY:U,neckY:B,headY:q,headCentre:q+a*c*.94,shoulderX:D/2-y*.2,shoulderY:B-.075*r,hipX:A*.24,seatDrop:d*.95}}function hg(n){return{root:[0,0,0],hips:[0,n.hipY,0],spine:[0,n.hipY+n.torso*.25,0],chest:[0,n.chestY,0],neck:[0,n.neckY,0],head:[0,n.headY,0],shoulderL:[n.shoulderX,n.shoulderY,0],elbowL:[n.shoulderX+.01,n.shoulderY-n.upper,0],handL:[n.shoulderX+.015,n.shoulderY-n.upper-n.fore,0],shoulderR:[-n.shoulderX,n.shoulderY,0],elbowR:[-n.shoulderX-.01,n.shoulderY-n.upper,0],handR:[-n.shoulderX-.015,n.shoulderY-n.upper-n.fore,0],thighL:[n.hipX,n.hipY,0],kneeL:[n.hipX,n.hipY-n.thigh,0],footL:[n.hipX,n.foot,0],thighR:[-n.hipX,n.hipY,0],kneeR:[-n.hipX,n.hipY-n.thigh,0],footR:[-n.hipX,n.foot,0]}}const ug={hips:"root",spine:"hips",chest:"spine",neck:"chest",head:"neck",shoulderL:"chest",elbowL:"shoulderL",handL:"elbowL",shoulderR:"chest",elbowR:"shoulderR",handR:"elbowR",thighL:"hips",kneeL:"thighL",footL:"kneeL",thighR:"hips",kneeR:"thighR",footR:"kneeR"},Vi=new Ie,Cl=(()=>{const n=new Fo;for(let t=0;t<=40;t++){const i=t/40*Math.PI*2,r=.55+.45*Math.abs(Math.cos(i*2.5)),s=Math.cos(i)*r,o=Math.sin(i)*r;t?n.lineTo(s,o):n.moveTo(s,o)}const e=new ko(n);return e.userData.keep=!0,e})(),Pl=(()=>{const n=new ss(1,10);return n.userData.keep=!0,n})();function Hi(n,e){for(let t=1;t<n.length;t++){const[i,r]=n[t-1],[s,o]=n[t];if(e<=o)return i+(s-i)*((e-r)/(o-r||1))}return n.at(-1)[0]}function Xe(n,e,t,i,r){let s=e.index?e.toNonIndexed():e.clone();for(const _ of Object.keys(s.attributes))["position","normal"].includes(_)||s.deleteAttribute(_);r&&s.applyMatrix4(r);const o=s.attributes.position.count,a=new Float32Array(o*3),l=new Uint16Array(o*4),c=new Float32Array(o*4),h=typeof i=="function"?i:null,u=typeof t=="function"?t:null;h||Vi.set(i);const p=new P,f=new P,g=new P;for(let _=0;_<o;_++){if(h&&_%3===0){const y=s.attributes.position;p.fromBufferAttribute(y,_),f.fromBufferAttribute(y,_+1),g.fromBufferAttribute(y,_+2),p.add(f).add(g).multiplyScalar(1/3),Vi.set(h(p))}if(a[_*3]=Vi.r,a[_*3+1]=Vi.g,a[_*3+2]=Vi.b,!u){l[_*4]=Al[t],c[_*4]=1;continue}p.fromBufferAttribute(s.attributes.position,_);const m=u(p).filter(([,y])=>y>.001).slice(0,4),d=m.reduce((y,[,b])=>y+b,0)||1;m.forEach(([y,b],M)=>{l[_*4+M]=Al[y],c[_*4+M]=b/d})}return s.setAttribute("color",new Nt(a,3)),s.setAttribute("skinIndex",new Ao(l,4)),s.setAttribute("skinWeight",new Nt(c,4)),n.push(s),e!==s&&!e.userData?.keep&&e.dispose?.(),s}const Ke=(n=0,e=0,t=0,i=0,r=0,s=0,o=1,a=1,l=1)=>new Be().compose(new P(n,e,t),new gt().setFromEuler(new tn(i,r,s)),new P(o,a,l));function Ll(n,e,t,i,r,s,o=10){const a=new P(...e),l=new P(...t),c=l.clone().sub(a),h=c.length(),u=new Do(i,Math.max(.001,h),3,o),p=new gt().setFromUnitVectors(new P(0,1,0),c.normalize());Xe(n,u,r,s,new Be().compose(a.clone().add(l).multiplyScalar(.5),p,new P(1,1,1)))}function ui(n,e,t,i,r,s,{bone:o,joints:a=[],root:l=null,soft:c=.13,segments:h=14}={}){const u=new P(...e),p=new P(...t),f=p.clone().sub(u),g=f.length(),_=f.clone().normalize(),m=[],d=5,y=12;for(let T=0;T<=d;T++){const S=-Math.PI/2+T/d*Math.PI/2;m.push(new ie(Math.cos(S)*i,-g/2+Math.sin(S)*i))}for(let T=1;T<y;T++)m.push(new ie(i,-g/2+T/y*g));for(let T=0;T<=d;T++){const S=T/d*Math.PI/2;m.push(new ie(Math.cos(S)*i,g/2+Math.sin(S)*i))}m[0].x=m.at(-1).x=0;const b=new bi(m,h),M=b.attributes.position;for(let T=0;T<M.count;T++){const S=M.getY(T),x=Ue.clamp(.5-S/g,0,1),v=Ue.lerp(i,r,x)/i;M.setXYZ(T,M.getX(T)*v,S+(S>g/2?0:S<-g/2?(S+g/2)*(v-1):0),M.getZ(T)*v)}const D=new gt().setFromUnitVectors(new P(0,-1,0),_),R=new P;Xe(n,b,T=>{const S=R.copy(T).sub(u).dot(_)/g;let x=[[o,1]];for(const[v,I,U]of a){const B=Ue.smoothstep(S,v-c,v+c);x=x.flatMap(([q,z])=>q===I?[[I,z*(1-B)],[U,z*B]]:[[q,z]])}if(l){const v=l[1]*(1-Ue.smoothstep(S,-.04,l[2]??.2));x=x.map(([I,U])=>[I,U*(1-v)]),x.push([l[0],v])}return x},s,new Be().compose(u.clone().add(p).multiplyScalar(.5),D,new P(1,1,1)))}const $e=(n,e,t,i,r,s=[1,1,1],o=12,a=8)=>Xe(n,new Tt(e,o,a),i,r,Ke(t[0],t[1],t[2],0,0,0,...s)),Pc=Object.freeze({crop:{front:.46,side:.02,back:-.5,radius:1.07,faceHalf:.78},sidepart:{front:.4,swoop:.28,side:0,back:-.5,radius:1.08,faceHalf:.78},bob:{front:.24,side:-.62,back:-.66,radius:1.12,faceHalf:.64},long:{front:.3,side:-.62,back:-.7,radius:1.11,faceHalf:.64},ponytail:{front:.44,side:.02,back:-.25,radius:1.08,faceHalf:.78},braids:{front:.4,swoop:.26,side:-.12,back:-.6,radius:1.08,faceHalf:.74},bun:{front:.46,side:.02,back:-.32,radius:1.07,faceHalf:.78},spiky:{front:.5,side:.05,back:-.34,radius:1.08,faceHalf:.78},perm:{front:.42,side:-.12,back:-.44,radius:1.15,faceHalf:.74,bumps:!0},buzz:{front:.52,side:.06,back:-.36,radius:1.025,faceHalf:.8},afro:{front:.48,side:-.12,back:-.5,radius:1.34,faceHalf:.74,lift:.18},horseshoe:{ring:!0,radius:1.03},bald:null});function dg(n,e){const t=Pc[n];if(!t)return null;if(t.ring)return fg(t);const i=new Tt(1,64,44),r=i.attributes.position,s=new P,o=e?-1:1;for(let a=0;a<r.count;a++){s.fromBufferAttribute(r,a);let l=t.front;t.swoop&&(l-=t.swoop*Ue.smoothstep(s.x*o,-.3,.5));const c=Math.max(.18-s.z,Math.abs(s.x)-t.faceHalf,s.y-l),h=Ue.lerp(t.side,t.back,Ue.smoothstep(-s.z,-.2,.7)),u=Math.min(c,s.y-h),p=u>0,f=t.radius*(1+(t.lift&&s.y>0?s.y*t.lift:0)),g=t.radius<1.04?.985:.8,_=Ue.lerp(g,f,Ue.smoothstep(u,-.035,.035));r.setXYZ(a,s.x*_,s.y*_+(t.lift&&p?t.lift*.25:0),s.z*_)}return i.computeVertexNormals(),i}function fg(n){const i=new Tt(n.radius,48,8,Math.PI/2+.95,Math.PI*2-1.9,.1,1),r=i.attributes.position,s=i.attributes.uv;for(let o=0;o<r.count;o++){const a=o%49/48,l=Math.PI/2+.95+a*(Math.PI*2-.95*2),c=Ue.smoothstep(-Math.sin(l),-.3,1),h=(1-Math.abs(Math.sin(a*Math.PI*11)))*.09*c,u=Math.acos(.06+c*.5)+h,p=Math.acos(-.42-c*.12),f=u+(1-s.getY(o))*(p-u),g=Ue.smoothstep(Math.min(a,1-a),0,.08),_=Ue.lerp(p-.12,f,.35+.65*g);r.setXYZ(o,-Math.cos(l)*Math.sin(_)*n.radius,Math.cos(_)*n.radius,Math.sin(l)*Math.sin(_)*n.radius)}return i.computeVertexNormals(),i}function $s(n,e,t){const i=n.length,r=e.hair.colour,s=e.hair.style,o=e.hair.flip?-1:1,a=t.Rh,l=0,c=t.headCentre-t.headY,h=[t.headSX*a,t.headSY*a,a*.98],u=(g,_,m)=>[g,t.headY+_,m],p=dg(s,e.hair.flip);if(p){const g=p.attributes.position,_=new P;for(let m=0;m<g.count;m++)_.fromBufferAttribute(g,m),ir(_,t.profile),g.setXYZ(m,_.x,_.y,_.z);p.computeVertexNormals(),Xe(n,p,"head",r,Ke(l,t.headY+c,0,0,0,0,...h))}const f=new Ie(r).multiplyScalar(.82).getStyle();if(s==="long"&&$e(n,a*.95,u(0,c-a*.72,-a*.55),"head",r,[1.05,1.25,.5]),s==="ponytail"&&($e(n,a*.34,u(0,c+a*.1,-a*1.05),"head",r,[1,1,1]),$e(n,a*.3,u(0,c-a*.45,-a*1.18),"head",r,[.9,1.9,.9]),$e(n,a*.16,u(0,c+a*.1,-a*1.2),"head",e.outfit.accent)),s==="bun"&&$e(n,a*.42,u(0,c+a*.95,-a*.3),"head",r),s==="spiky")for(let g=0;g<9;g++){const _=g/9*Math.PI*2,m=Math.cos(_)*a*.55,d=Math.sin(_)*a*.5-a*.1,y=new No(a*.2,a*.5,6);Xe(n,y,"head",r,Ke(m,t.headY+c+a*.88,d,Math.sin(_)*.5,0,-Math.cos(_)*.5))}if(s==="perm")for(let g=0;g<22;g++){const _=g*2.39996,m=.2+.75*(g*.618%1),d=Math.sqrt(1-m*m),y=Math.cos(_)*d,b=Math.sin(_)*d;b>.35&&m<.55||$e(n,a*.24,u(y*a*1.1*t.headSX,c+m*a*1.1,b*a*1.05),"head",g%3?r:f,[1,1,1],8,6)}if(s==="braids")for(const g of[-1,1]){const _=g*a*.8,m=-a*.35;let d=c-a*.35;for(let y=0;y<6;y++){const b=a*(.2-y*.012);$e(n,b,u(_+g*a*.05,d,m+a*.05*y),"head",y%2?r:f,[1,1.3,1],8,6),d-=b*1.5}$e(n,a*.13,u(_+g*a*.05,d+a*.05,m+a*.3),"head",e.outfit.accent,[1.2,.7,1.2],8,6),$e(n,a*.12,u(_+g*a*.05,d-a*.12,m+a*.3),"head",r,[1,1.4,1],8,6)}if((s==="sidepart"||s==="braids")&&$e(n,a*.34,u(o*a*.5,c+a*.62,a*.62),"head",r,[1.4,.55,.7],10,6),(s==="bob"||s==="long")&&$e(n,a*.4,u(0,c+a*.52,a*.72),"head",r,[2,.5,.6],10,6),!["none","headband","ribbon"].includes(e.outfit.hat))for(const g of n.slice(i)){const _=g.attributes.position;g.userData.hatHair={position:_.array.slice(),normal:g.attributes.normal.array.slice()};for(let m=0;m<_.count;m++){const d=_.getX(m)/h[0],y=(_.getY(m)-t.headCentre)/h[1],b=_.getZ(m)/h[2],M=Math.hypot(d,y,b);if(y>.3&&M>1.035){const D=1.035/M;_.setXYZ(m,d*D*h[0],t.headCentre+y*D*h[1],b*D*h[2])}}g.computeVertexNormals()}}function pg(n,e){const t=Pc[n],i=56,r=new Tt(1,i,1,0,Math.PI*2,.5,.5),s=r.attributes.position,o=r.attributes.uv,a=new P;let l=[0,.4,-1];for(let c=0;c<s.count;c++){const h=c%(i+1)/i,u=h*Math.PI*2,p=Math.sin(u),f=Math.cos(u),g=Ue.smoothstep(-f,-.2,1),_=.3+g*.14,m=_+(o.getY(c)-.5)*.14,d=Math.sqrt(1-m*m);a.set(p*d,m,f*d);let y=1.035;if(t&&!t.ring){const b=Math.max(.18-a.z,Math.abs(a.x)-t.faceHalf,a.y-t.front),M=Ue.lerp(t.side,t.back,Ue.smoothstep(-a.z,-.2,.7)),D=Math.min(b,a.y-M),R=t.radius*(1+(t.lift&&a.y>0?a.y*t.lift:0))+.03;y=Ue.lerp(1.035,Math.max(1.035,R),Ue.smoothstep(D,-.06,.06))}else t?.ring&&g>.3&&(y=t.radius+.03);a.multiplyScalar(y),ir(a,e),s.setXYZ(c,a.x,a.y,a.z),Math.abs(h-.5)<1e-6&&o.getY(c)>.5&&(l=[0,a.y-.07,a.z])}return r.computeVertexNormals(),{geometry:r,knot:l}}function mg(n,e=Wo(n)){return{brimY:e.headCentre+e.Rh*e.headSY*.55,crownHeight:e.Rh*e.headSY*.8}}function Lc(n,e,t){const i=e.outfit.hat,r=e.outfit.hatColour,s=t.Rh;if(t.headCentre+s*t.headSY*.2,i==="none")return;const o=[t.headSX*s,t.headSY*s,s];if(i==="cap"||i==="police"||i==="captain"){const a=new Tt(1.1,24,12,0,Math.PI*2,0,Math.PI*.5);Xe(n,a,"head",r,Ke(0,t.headCentre+s*t.headSY*.23,0,-.08,0,0,o[0],o[1]*(i==="cap"?.9:1.05),o[2])),$e(n,s*.68,[0,t.headCentre+s*t.headSY*.25,s*.9],"head",i==="cap"?r:"#1c1c24",[t.headSX*1.4,.07,1],20,8),i!=="cap"&&(Xe(n,new Je(s*1.12,s*1.12,s*.14,24,1,!0),"head",i==="captain"?"#1c1c24":"#e0b93a",Ke(0,t.headCentre+s*.26,0,-.08)),$e(n,s*.1,[0,t.headCentre+s*.62,s*1.02],"head","#e0b93a",[1,1,.4],8,6))}else if(i==="helmet")Xe(n,new Tt(1.16,24,12,0,Math.PI*2,0,Math.PI*.52),"head",r,Ke(0,t.headCentre+s*t.headSY*.35,0,0,0,0,o[0],o[1]*.9,o[2])),Xe(n,new yn(1.16,.045,6,24),"head",r,Ke(0,t.headCentre+s*t.headSY*.35,0,Math.PI/2,0,0,o[0],o[2],o[1]));else if(i==="straw"){const a=mg(e,t),l=a.brimY;Xe(n,new Kr(s*.98,s*2.1,32),"head",r,Ke(0,l,0,-Math.PI/2,0,0,t.headSX,1,1)),Xe(n,new Kr(s*.98,s*2.1,32),"head",r,Ke(0,l-.012*t.k,0,Math.PI/2,0,0,t.headSX,1,1)),Xe(n,new Je(s*.78,s*1.08,a.crownHeight,24,1,!0),"head",r,Ke(0,l+a.crownHeight/2,0,0,0,0,t.headSX,1,1)),Xe(n,new ss(s*.78,24),"head",r,Ke(0,l+a.crownHeight,0,-Math.PI/2,0,0,t.headSX,1,1)),Xe(n,new Je(s*1.045,s*1.09,s*.12*t.headSY,24,1,!0),"head","#d8342c",Ke(0,l+s*.06*t.headSY,0,0,0,0,t.headSX,1,1))}else if(i==="beanie")Xe(n,new Tt(1.17,20,12,0,Math.PI*2,0,Math.PI*.49),"head",r,Ke(0,t.headCentre+s*.12,0,0,0,0,...o)),Xe(n,new yn(1.14,.09,6,24),"head",r,Ke(0,t.headCentre+s*.18,0,Math.PI/2,0,0,o[0],o[2],o[1])),$e(n,s*.22,[0,t.headCentre+s*t.headSY*1.32,0],"head",r,[1,1,1],10,8);else if(i==="beret")$e(n,s,[s*.15,t.headCentre+s*t.headSY*.83,0],"head",r,[t.headSX*1.35,.38,1.25],20,12),Xe(n,new Je(s*.055,s*.055,s*.15,6),"head",r,Ke(s*.15,t.headCentre+s*t.headSY*1.2,0));else if(i==="bucket"){const a=t.headCentre+s*t.headSY*.88;Xe(n,new Je(s*.93,s*1.13,s*.62,20),"head",r,Ke(0,a,0,0,0,0,t.headSX,1,1)),Xe(n,new Je(s*1.12,s*1.5,s*.16,24,1,!0),"head",r,Ke(0,a-s*.33,0,0,0,0,t.headSX,1,1))}else if(i==="ribbon"){const a=s*t.headSX*.68,l=t.headCentre+s*t.headSY*.85,c=s*.52;for(const h of[-1,1])$e(n,s*.2,[a+h*s*.16,l,c],"head",r,[1.1,.7,.45],10,8);$e(n,s*.09,[a,l,c+s*.04],"head",r,[1,1,.7],8,6)}else if(i==="headband"){const a=pg(e.hair.style,t.profile);Xe(n,a.geometry,"head",r,Ke(0,t.headCentre,0,0,0,0,...o)),$e(n,s*.13,[0,t.headCentre+a.knot[1]*o[1],a.knot[2]*o[2]-s*.04],"head",r,[1.5,.8,.7],8,6)}else i==="kerchief"&&(Xe(n,new Tt(1.1,24,12,0,Math.PI*2,0,Math.PI*.36),"head",r,Ke(0,t.headCentre+s*.05,-s*.12,-.45,0,0,...o)),$e(n,s*.2,[0,t.headCentre+s*.1,-s*1.1],"head",r,[1.3,.9,.9],8,6))}function Q_(n,{mode:e="wall",shadows:t=!0}={}){const i=Ht(n);if(i.outfit.hat==="none")return null;const r=[];if(Lc(r,i,Wo(i)),!r.length)return null;const s=Vr(r,!1);r.forEach(c=>c.dispose());for(const c of["skinIndex","skinWeight"])s.deleteAttribute(c);s.computeBoundingBox();const o=s.boundingBox,a=o.getCenter(new P);s.translate(-a.x,e==="stand"?-o.min.y:-a.y,e==="stand"?-a.z:-o.min.z),s.computeBoundingSphere();const l=new ht(s,us(new St({vertexColors:!0}),{bands:"soft3"}));return l.name=(i.name||"Resident")+"’s hat",l.castShadow=t,l.receiveShadow=!0,l.userData.hatProp=!0,l}function gg(n,e,t){const i=e.accessories,r=t.Rh,s=i.colour;if(i.earrings!=="none")for(const o of[-1,1]){const a=o*r*t.headSX*1.035,l=t.headCentre-r*.21,c=r*.04;i.earrings==="studs"?$e(n,r*.085,[a,l,c],"head",s,[1,1,.65],8,6):Xe(n,new yn(r*.16,r*.035,6,14),"head",s,Ke(a,l-r*.1,c,0,o*.5))}i.neckwear==="pendant"?(Xe(n,new yn(t.width*.3,t.k*.007,5,18),"chest",s,Ke(0,t.neckY-.035,t.depth*.05,Math.PI/2-.5)),$e(n,t.k*.025,[0,t.neckY-.12,t.depth*.53],"chest",s,[.7,1,.35],8,6)):i.neckwear==="scarf"&&(Xe(n,new yn(t.armR*1.7,t.armR*.55,6,18),"chest",s,Ke(0,t.neckY-.035,0,Math.PI/2)),Xe(n,new Mt(t.width*.22,t.torso*.5,.025),"chest",s,Ke(t.width*.14,t.neckY-t.torso*.28,t.depth*.53,0,0,-.15))),i.pin&&$e(n,t.k*.024,[t.width*.22,t.neckY-t.torso*.28,t.depth*.52],"chest",s,[1,1,.3],8,6)}const _g=n=>n.facial.style==="none"&&(["bob","long","ponytail","braids","bun","perm"].includes(n.hair.style)||n.mouth.colour!=="#b8544a");function Qs(n,e,t,i=!1){const r=e.outfit,s=e.body.skin,o=i?s:r.topColour,a=i?e.swim.colour:r.bottomColour,l=t.width,c=t.depth,h=t.hipY,u=!i&&r.top==="tank",p=!i&&r.bottom==="underwear",f=1+(e.body.build-.5)*.12,g=t.hips/l,_=[[0,-.1],[g*.86,-.08],[g,.05],[g,.13],[g,.15],[t.waistRatio*f,.3],[t.waistRatio*(1+(f-1)*.6),.5],[1,.66],[.985,.74],[.95,.8],[.88,.87],[.76,.93],[.58,.98],[.38,1.01],[.19,1.03],[0,1.04]],m=new bi(_.map(([A,T])=>new ie(A,T)),28),d=h+t.torso*(p?.05:.13),y=r.pattern==="stripes";if(Xe(n,m,"chest",A=>{if(i)return A.y<d?a:s;if(A.y<d)return a;if(u)return s;if(r.top==="kariyushi"&&A.z>c*.18){const T=(A.y-h)/t.torso;if(T>.77&&Math.abs(A.x)<l*.27*Math.min(1,(T-.77)/.25))return s}return y&&Math.floor((A.y-d)/(t.torso*.12))%2?"#f4f1ea":o},Ke(0,h,0,0,0,0,l/2,t.torso,c/2)),u){const T=_.filter(([,I])=>I>=.05&&I<=.77).concat([[Hi(_,.77),.77]]),S=new bi(T.map(([I,U])=>new ie(I*1.025,U)),28);Xe(n,S,"chest",o,Ke(0,h,0,0,0,0,l/2,t.torso,c/2));const x=.4,v=I=>{const U=Hi(_,I)*1.025;return c/2*Math.sqrt(Math.max(0,U*U-x*x))+.004*t.k};for(const I of[-1,1]){const U=I*l/2*x,B=[.77,.9,1].map(z=>[U,h+t.torso*z,v(z)]);B.push([U,h+t.torso*1.035,0]);const q=B.concat(B.slice(0,-1).reverse().map(([z,Y,N])=>[z,Y,-N]));for(let z=1;z<q.length;z++)Ll(n,q[z-1],q[z],.016*t.k,"chest",o,6)}}if(i&&_g(e)&&Xe(n,new Je(l*.52,l*.52,t.torso*.2,16,1,!0),"chest",e.swim.colour,Ke(0,h+t.torso*.66,0,0,0,0,1,1,c/l)),Ll(n,[0,t.neckY-.02,0],[0,t.headY+.01,0],t.armR*1.2,"neck",s,8),!i&&["polo","kariyushi","smock","jacket","blouse"].includes(r.top)){const A=r.top==="kariyushi",T=A?new Ie(o).multiplyScalar(1.12).getHex():"#f4f1ea",S=x=>c/2*Hi(_,(x-h)/t.torso)+.008*t.k;for(const x of[-1,1]){const v=A?[[x*.018*t.k,t.neckY-.012*t.k],[x*.125*t.k,t.neckY-.047*t.k],[x*.067*t.k,t.neckY-.17*t.k]]:[[x*.012*t.k,t.neckY-.012*t.k],[x*.085*t.k,t.neckY-.035*t.k],[x*.055*t.k,t.neckY-.115*t.k]];x>0&&v.reverse();const I=new vt;I.setAttribute("position",new Ye(v.flatMap(([U,B])=>[U,B,S(B)+.004*t.k]),3)),I.computeVertexNormals(),Xe(n,I,"chest",T)}if(A){const x=new Ie(o).multiplyScalar(.86).getHex();for(const U of[.24,.4,.56,.72]){const B=h+t.torso*U;Xe(n,new Mt(.024*t.k,t.torso*.16,.014*t.k),"chest",x,Ke(.007*t.k,B,S(B)+.008*t.k))}const v=h+t.torso*.62,I=l*.23;Xe(n,new Mt(l*.24,t.torso*.21,.016*t.k),"chest",o,Ke(I,v,S(v)-.004*t.k)),Xe(n,new Mt(l*.25,.008*t.k,.018*t.k),"chest",x,Ke(I,v+t.torso*.1,S(v)+.004*t.k))}for(const x of A?[.25,.41,.57,.73]:[.4,.56,.72]){const v=h+t.torso*x;$e(n,(A?.009:.006)*t.k,[0,v,S(v)],"chest","#f4f1ea",[1,1,.45],8,6)}}if(!i&&r.top==="apron"){const A=h+t.torso*.75,T=h-t.thigh*.78,S=new nr(l*.7,A-T,8,14);S.translate(0,(A+T)/2,0);const x=S.attributes.position,v=["skirt","longskirt"].includes(r.bottom),I=r.bottom==="longskirt"?t.thigh+t.shin*.85:t.thigh*.9;for(let B=0;B<x.count;B++){const q=x.getY(B),z=(q-h)/t.torso,Y=q>=h?l/2*Hi(_,z):v?Ue.lerp(t.hips*.53,t.hips*.66+I*.22,Ue.clamp((h+.03-q)/I,0,1)):l*.52,N=x.getX(B)*(q>h?1-Ue.clamp(z,0,1)*.25:1);x.setXYZ(B,N,q,Y*c/l*Math.sqrt(Math.max(.05,1-(N/Y)**2))+.025*t.k)}S.computeVertexNormals(),Xe(n,S,B=>{if(B.y>h){const Y=Ue.smoothstep(B.y,h,h+t.torso*.35);return[["hips",1-Y],["chest",Y]]}const q=Ue.smoothstep(h-B.y,.02,.12),z=Ue.smoothstep(B.x,-l*.25,l*.25);return[["hips",1-q],["thighL",q*z],["thighR",q*(1-z)]]},new Ie(r.topColour).multiplyScalar(1.12).getHex())}if(!i&&(r.pattern==="flowers"||r.pattern==="dots")){const A=r.pattern==="flowers"?"#f8f6ef":r.accent,T=r.pattern==="flowers"?Cl:Pl;for(let S=0;S<18;S++){const x=S*2.39996,v=.2+.62*(S*.37%1),I=h+t.torso*v;if(r.top==="kariyushi"&&Math.cos(x)>.7&&(Math.abs(Math.sin(x))<.13||v>.77))continue;const U=Hi(_,v),B=Math.sin(x)*l/2*U*1.012,q=Math.cos(x)*c/2*U*1.012,z=Math.atan2(B/(l/2),q/(c/2)),Y=t.k*(r.pattern==="flowers"?r.top==="kariyushi"?.045:.035:.018);Xe(n,T,"chest",A,Ke(B,I,q,0,z,S*.7,Y,Y,Y)),r.pattern==="flowers"&&Xe(n,Pl,"chest","#f4d23c",Ke(B*1.004,I,q*1.004,0,z,0,Y*.35,Y*.35,Y*.35))}}const M=!i&&["jacket","smock"].includes(r.top),D=t.upper/(t.upper+t.fore);for(const A of["L","R"]){const T=A==="L"?1:-1,S=[T*t.shoulderX,t.shoulderY,0],x=[T*(t.shoulderX+.015),t.shoulderY-t.upper-t.fore,0],v={bone:"shoulder"+A,joints:[[D,"shoulder"+A,"elbow"+A]]};ui(n,S,x,t.armR*1.04,t.armR*.86,i||!M?s:o,v);const I=U=>{const B=Ue.smoothstep(Math.abs(U.x),t.shoulderX-t.armR*1.1,t.shoulderX+t.armR*.3);return[["chest",1-B],["shoulder"+A,B]]};if(Xe(n,new Tt(t.armR*1.3,16,12),I,i||u?s:o,Ke(S[0]-T*t.armR*.15,S[1]+t.armR*.05,0,0,0,0,1,.92,Math.min(1.1,c/l*1.6))),!i&&r.top==="kariyushi"){const U=t.upper*.76,B=S[1]-U/2;Xe(n,new Je(t.armR*1.25,t.armR*1.42,U,16,1,!0),v,o,Ke(S[0]+T*.008,B,0,0,0,T*.035)),Xe(n,new Je(t.armR*1.43,t.armR*1.43,.008*t.k,16,1,!0),v,new Ie(o).multiplyScalar(.88).getHex(),Ke(S[0]+T*.014,S[1]-U,0)),Xe(n,Cl,"shoulder"+A,"#f8f6ef",Ke(S[0],B,t.armR*1.44,0,0,T*.3,.038*t.k,.038*t.k,.038*t.k))}else!i&&!M&&!u&&ui(n,S,[S[0]+T*.006,S[1]-t.upper*.58,0],t.armR*1.12,t.armR*1.16,o,{...v,joints:[]});$e(n,t.hand,[x[0],x[1]-t.hand*.55,0],"hand"+A,s,[.9,1.15,.78],12,10),$e(n,t.hand*.42,[x[0]-T*t.hand*.55,x[1]-t.hand*.35,t.hand*.42],"hand"+A,s,[1,1.2,1],8,6)}const R=i?"swim":r.bottom;for(const A of["L","R"]){const T=A==="L"?1:-1,S=[T*t.hipX,h,0];T*t.hipX,h-t.thigh;const x=[T*t.hipX,t.foot,0],v={bone:"thigh"+A,joints:[[t.thigh/(h-t.foot),"thigh"+A,"knee"+A]]},I=R==="trousers";ui(n,S,x,t.legR*1.02,t.legR*.86,I?a:s,v),(R==="shorts"||R==="swim")&&ui(n,[S[0],S[1]+t.legR*.3,0],[S[0]*1.04,h-t.thigh*(R==="swim"?.22:.55),0],t.legR*1.2,t.legR*1.26,a,{...v,joints:[]}),R==="underwear"&&ui(n,[S[0],S[1]+t.legR*.3,0],[S[0]*1.02,h-t.thigh*.16,0],t.legR*1.12,t.legR*1.14,a,{...v,joints:[]});const U=i?"barefoot":r.footwear;U==="barefoot"||U==="sandals"?($e(n,t.legR*1.12,[T*t.hipX,t.foot*.55,t.legR*.5],"foot"+A,s,[1,.55,1.7],12,8),U==="sandals"&&($e(n,t.legR*1.24,[T*t.hipX,t.foot*.12,t.legR*.55],"foot"+A,e.age==="elder"?"#6b4a32":"#c8a878",[1,.18,1.8],12,6),$e(n,t.legR*.42,[T*t.hipX,t.foot*.55+t.legR*.55,t.legR*.95],"foot"+A,r.shoes,[2.3,.5,.8],10,6))):($e(n,t.legR*1.25,[T*t.hipX,t.foot*.62,t.legR*.55],"foot"+A,r.shoes,[1,.6,U==="shoes"?1.85:1.75],12,8),U==="boots"&&ui(n,[T*t.hipX,t.foot,0],[T*t.hipX,t.foot+t.shin*.65,0],t.legR*1.08,t.legR*1.05,r.shoes,{bone:"knee"+A,joints:[]}),$e(n,t.legR*1.32,[T*t.hipX,t.foot*.16,t.legR*.6],"foot"+A,U==="shoes"?"#2b2622":e.age==="elder"?"#6b4a32":"#f2efe6",[1,.24,1.8],12,6))}if(R==="skirt"||R==="longskirt"){const A=R==="skirt"?t.thigh*.9:t.thigh+t.shin*.85,T=S=>{const x=Ue.smoothstep(h-S.y,.02,.12),v=Ue.smoothstep(S.x,-l*.25,l*.25);return[["hips",1-x],["thighL",x*v],["thighR",x*(1-v)]]};Xe(n,new Je(t.hips*.53,t.hips*.66+A*.22,A,24,6,!0),T,r.bottomPattern==="plaid"?(S=>{const x=Math.floor(Math.atan2(S.x,S.z)*12/Math.PI)%4===0,v=Math.floor((h-S.y)/(.06*t.k))%4===0;return x||v?r.accent:a}):a,Ke(0,h+.03-A/2,0,0,0,0,1,1,c/l))}}const yg=.011,eo=new Map;function Il({skinned:n=!0,colour:e=null,width:t=yg}={}){const i=(n?"s":"m")+(e??"v")+t;if(eo.has(i))return eo.get(i);const r=new Eo({color:e??16777215,vertexColors:e==null,side:1});r.name="Shimanchu outline",r.userData.outline=!0;const s={value:t};return r.onBeforeCompile=o=>{o.uniforms.uOutline=s,o.vertexShader=`uniform float uOutline;
`+o.vertexShader.replace("#include <project_vertex>",(n?`vec3 outlineN = normalize( objectNormal );
`:`vec3 outlineN = normalize( position );
`)+`transformed += outlineN * uOutline;
#include <project_vertex>`),e==null&&(o.fragmentShader=o.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
 diffuseColor.rgb *= vec3( 0.32, 0.27, 0.27 );`))},r.customProgramCacheKey=()=>"shimanchu-outline-"+i,eo.set(i,r),r}function to(n,e,t){const i=t?new Gr(e.geometry,Il({skinned:!0})):new ht(e.geometry,Il({skinned:!1,colour:4861992}));return i.name=e.name+" outline",i.castShadow=!1,i.receiveShadow=!1,i.frustumCulled=!1,i.userData.outline=!0,t?(i.bind(e.skeleton,e.bindMatrix),n.add(i)):e.add(i),i}function vg(n,e,t){const i=document.createElement("canvas");i.width=i.height=t;const r=i.getContext("2d"),s=new Nm(i);s.colorSpace=Gt,s.anisotropy=4;let o=new Tt(1,36,26);const a=o.attributes.position,l=o.attributes.uv,c=new P,h=Math.PI/2-.95,u=1.9,p=Math.PI*.28,f=Math.PI*.58;for(let R=0;R<a.count;R++){c.fromBufferAttribute(a,R);const A=Math.atan2(c.z,-c.x),T=Math.acos(Ue.clamp(c.y,-1,1));l.setXY(R,Ue.clamp((A-h)/u,.002,.998),Ue.clamp(1-(T-p)/f,.002,.998)),ir(c,e.profile),a.setXYZ(R,c.x,c.y,c.z)}o.scale(e.Rh*e.headSX,e.Rh*e.headSY,e.Rh*.98),o.computeVertexNormals();const g=o.attributes.normal,_=new P,m=new P(0,.4,.92).normalize();for(let R=0;R<g.count;R++)_.fromBufferAttribute(g,R),_.lerp(m,Ue.smoothstep(_.z,-.35,.45)*.7).normalize(),g.setXYZ(R,_.x,_.y,_.z);const d=o;o=d.toNonIndexed(),d.dispose();const y=o.attributes.position,b=o.attributes.uv;for(let R=0;R<y.count;R+=3){const A=[b.getX(R),b.getX(R+1),b.getX(R+2)];if(y.getZ(R)<=0&&y.getZ(R+1)<=0&&y.getZ(R+2)<=0||Math.max(...A)-Math.min(...A)>.5)for(let S=0;S<3;S++)b.setXY(R+S,.002,.002)}const M=us(new St({map:s,emissive:16777215,emissiveMap:s,emissiveIntensity:.05}),{bands:"soft3"}),D=new ht(o,M);return D.name="Shimanchu head",D.position.y=e.headCentre-e.headY,{head:D,canvas:i,ctx:r,texture:s}}function no(n,e,t){if(e.nose.style==="none")return;const i=hs(e),r=Math.PI*.28+i.noseY/256*Math.PI*.58,s=Math.PI/2-.95+i.noseX/256*1.9,o=ir(new P(-Math.cos(s)*Math.sin(r),Math.cos(r),Math.sin(s)*Math.sin(r)),t.profile),a=e.nose.style==="hook",l=e.nose.style==="wide",c=t.Rh*(.065+e.nose.size*.055);$e(n,c,[o.x*t.Rh*t.headSX,t.headCentre+o.y*t.Rh*t.headSY,o.z*t.Rh*.98+c*.55],"head",e.body.skin,[l?1.45:.85,a?1.55:.85,a?1.65:1.2],12,10)}function _o(n,{shadows:e=!0,faceSize:t=256}={}){const i=Ht(n),r=Wo(i),s=hg(r),o={},a=go.map(T=>{const S=new rc;return S.name=T,o[T]=S,S});for(const T of go){const S=o[T],x=s[T],v=ug[T];if(v){const I=s[v];S.position.set(x[0]-I[0],x[1]-I[1],x[2]-I[2]),o[v].add(S)}else S.position.set(...x)}const l=[];Qs(l,i,r,!1),no(l,i,r);for(const T of[-1,1])$e(l,r.Rh*.2,[T*r.Rh*r.headSX*.97,r.headCentre-r.Rh*.08,-r.Rh*.05],"head",i.body.skin,[.55,1,.8],8,6);$s(l,i,r),gg(l,i,r);const c=l.reduce((T,S)=>T+S.attributes.position.count,0);Lc(l,i,r);const h=[];let u=0;for(const T of l)T.userData.hatHair&&h.push({offset:u,original:T.userData.hatHair,tucked:{position:T.attributes.position.array.slice(),normal:T.attributes.normal.array.slice()}}),u+=T.attributes.position.count*3;let p=!0;const f=Vr(l,!1);l.forEach(T=>T.dispose());const g=f.attributes.position.count>c;f.computeBoundingSphere();const _=us(new St({vertexColors:!0}),{bands:"soft3"}),m=new Gr(f,_);m.name="Shimanchu body",m.add(o.root),m.bind(new Po(a)),m.castShadow=e,m.receiveShadow=!0,m.frustumCulled=!1;let d=null,y=null,b=null;const M=vg(i,r,t);M.head.castShadow=e,M.head.receiveShadow=!0,o.head.add(M.head);const D=new qt;D.name="Shimanchu · "+(i.name||"resident"),D.add(m,o.root),D.rotation.y=Math.PI;const R=to(D,m,!0);to(M.head,M.head,!1);const A={recipe:i,measure:r,root:D,body:m,bones:o,face:M,height:r.H,hasHat:g,setHat(T){if(f.setDrawRange(0,T||!g?1/0:c),p!==!!T){for(const S of h){const x=T?S.tucked:S.original;f.attributes.position.array.set(x.position,S.offset),f.attributes.normal.array.set(x.normal,S.offset)}h.length&&(f.attributes.position.needsUpdate=!0,f.attributes.normal.needsUpdate=!0),p=!!T}},get hatOn(){return g&&f.drawRange.count===1/0},faceState:{expression:"neutral",blink:0,talk:0,look:[0,0]},paintFace(T){const S=A.faceState,x={...S,...T},v=x.expression+"|"+(x.blink>.5?1:0)+"|"+(x.talk>.5?1:0)+"|"+Math.round(x.look[0]*2)+","+Math.round(x.look[1]*2);return v===A.faceKey?!1:(A.faceKey=v,Object.assign(S,x),j0(M.ctx,i,{...x,size:M.canvas.width}),M.texture.needsUpdate=!0,!0)},wear(T){if(T==="nozomi"&&!y){const S=Ht({...i,outfit:{...i.outfit,...B0}}),x=[];Qs(x,S,r),no(x,S,r);for(const I of[-1,1])$e(x,r.Rh*.2,[I*r.Rh*r.headSX*.97,r.headCentre-r.Rh*.08,-r.Rh*.05],"head",i.body.skin,[.55,1,.8],8,6);$s(x,S,r);const v=Vr(x,!1);x.forEach(I=>I.dispose()),y=new Gr(v,_),y.name="Thuan · Nozomi-inspired outfit",y.bind(m.skeleton,m.bindMatrix),y.castShadow=e,y.frustumCulled=!1,D.add(y),b=to(D,y,!0)}if(T==="swim"&&!d){const S=[];Qs(S,i,r,!0),no(S,i,r);for(const v of[-1,1])$e(S,r.Rh*.2,[v*r.Rh*r.headSX*.97,r.headCentre-r.Rh*.08,-r.Rh*.05],"head",i.body.skin,[.55,1,.8],8,6);$s(S,{...i,outfit:{...i.outfit,hat:"none"}},r);const x=Vr(S,!1);S.forEach(v=>v.dispose()),d=new Gr(x,_),d.name="Shimanchu swimwear",d.bind(m.skeleton,m.bindMatrix),d.castShadow=e,d.frustumCulled=!1,D.add(d)}m.visible=T!=="swim"&&T!=="nozomi",R.visible=m.visible,y&&(y.visible=T==="nozomi",b.visible=y.visible),d&&(d.visible=T==="swim")},dispose(){f.dispose(),_.dispose(),M.texture.dispose(),M.head.geometry.dispose(),M.head.material.dispose(),d?.geometry.dispose(),y?.geometry.dispose()}};return A.paintFace({}),A}const yo="johansson-town-resident-wardrobes";function bg(n,e=globalThis.localStorage){try{return Vo(JSON.parse(e?.getItem(yo)||"{}")[n]||"")}catch{return null}}function ey(n,e,t=globalThis.localStorage){const i=Ht({...e,name:n});let r={};try{r=JSON.parse(t?.getItem(yo)||"{}")||{}}catch{}return r[n]=Mc(i),t?.setItem(yo,JSON.stringify(r)),globalThis.dispatchEvent?.(new Event("johansson-appearance-change")),i}const Xo=[{name:"Aya",age:24,role:"bookshop assistant",female:!0,height:1.62,work:[4.3,34],evening:[24,18],home:[-25,-47],top:"#967a99",start:540,close:1110,retire:1210,personality:"Playful mischief",friend:"Emi",look:"Black tank, olive shorts, high ponytail",hairStyle:"pony",outfit:"tank",hello:"Window seat is mine. I bookmark the funny parts — apparently that is not how a lending library works.",gossip:"Emi made a tiny apron for Tama. He has declined every fitting.",clue:"A rain-stained book is drying at the harbour office. Yoshiko knows how to save the pages.",model:"resident-00",build:.88,supperStart:1110,supperEnd:1210,house:{x:-22.4,z:-47,angle:-1.5707963267948966},homeAddress:"1 Willow Alley"},{name:"Kenji",age:32,role:"repairman",female:!1,height:1.76,work:[-3.5,17],evening:[4.5,21],home:[-29,-47],top:"#527d99",start:540,close:1080,retire:1260,personality:"Enthusiastic tinkerer",friend:"Tetsuo",look:"Blue hoodie and tousled ink-black hair",hairStyle:"messy",outfit:"work",hello:"I fixed the kettle. It now whistles in a slightly more confident key.",gossip:"Tetsuo says my repairs are too loud. His radio can be heard from the pier.",clue:"The cabinet outside my workshop runs Star Port. Beat my score and I will show you around.",model:"resident-01",build:.965,supperStart:1092,supperEnd:1207,house:{x:-31.6,z:-47,angle:1.5707963267948966},homeAddress:"2 Willow Alley"},{name:"Mrs Sato",age:68,role:"shopkeeper",female:!0,height:1.55,work:[-4.2,-26],evening:[-26,46],home:[-25,-39],top:"#ad6178",start:540,close:1080,retire:1260,personality:"Affectionately formidable",friend:"Fumiko",look:"Berry apron dress, silver bob and round spectacles",hairStyle:"bun",outfit:"apron",hello:"You look hungry. Yes, I say that to everyone. I am usually right.",gossip:"Fumiko claims she only came for tea. I have saved her the largest bowl.",clue:"Thuan names her plants. The assistant manager by her door is very demanding.",model:"resident-02",build:1.05,supperStart:1104,supperEnd:1234,house:{x:-22.4,z:-39,angle:-1.5707963267948966},homeAddress:"3 Willow Alley"},{name:"Harbour master",age:58,role:"harbour master",female:!1,height:1.74,work:[1.6,-70],evening:[4.2,-48],home:[-29,-39],top:"#405d7e",start:300,close:840,retire:1260,personality:"Dry wit, soft heart",friend:"Mr Fujita",look:"Navy vest, silver hair and round spectacles",hairStyle:"part",outfit:"jacket",hello:"I can predict rain by my knees. The radio insists on taking all the credit.",gossip:"Fujita caught a fish this big. The distance between his hands increases every evening.",clue:"There is a blue-taped folio in the harbour office tray. Take a proper look; it has travelled.",model:"resident-03",build:1.135,supperStart:1020,supperEnd:1120,house:{x:-31.6,z:-39,angle:1.5707963267948966},homeAddress:"4 Willow Alley"},{name:"Bus driver",age:49,role:"bus driver",female:!1,height:1.73,work:[-4.5,44],evening:[-26,46],home:[-25,-32],top:"#498d8b",start:540,close:1080,retire:1260,personality:"Patient storyteller",friend:"Naoko",look:"Navy vest and neat dark hair",hairStyle:"part",outfit:"vest",hello:"I collect passengers and opening sentences. The best stories start at the last stop.",gossip:"Naoko can deliver a letter before I finish reading the address.",clue:"Read the timetable by the stop before you wander down to the water.",model:"resident-04",build:.88,supperStart:1092,supperEnd:1207,house:{x:-22.4,z:-32,angle:-1.5707963267948966},homeAddress:"5 Willow Alley"},{name:"Cold-storage kid",age:19,role:"ice store assistant",female:!1,height:1.69,work:[-8,-55],evening:[-8,-55],home:[-29,-32],top:"#6eaa9b",start:540,close:1080,retire:1260,personality:"Shy, unexpectedly funny",friend:"Kenta",look:"Pale-blue hoodie and chestnut hair",hairStyle:"fringe",outfit:"work",hello:"I work with ice. Breaking it socially is the difficult part.",gossip:"Kenta practises his introduction to Emi in front of the freezer. I try not to applaud.",clue:"Buy ice before you go fishing. The fish appreciate the planning, briefly.",model:"resident-05",build:.965,supperStart:null,supperEnd:130,house:{x:-31.6,z:-32,angle:1.5707963267948966},homeAddress:"6 Willow Alley"},{name:"Officer Mori",age:45,role:"policeman",female:!1,height:1.78,work:[0,49],evening:[-26,46],home:[-25,-25],top:"#4b6e9c",start:1320,close:1800,retire:1800,personality:"Earnest and easily teased",friend:"Reiko",look:"Blue vest and softly greying hair",hairStyle:"crop",outfit:"jacket",hello:"No suspicious activity today. Except someone teaching the cat to ignore me.",gossip:"Reiko asked for a statement. I gave her three pages. She printed the bit about my lunch.",clue:"The river path circles back to the harbour. Keep an eye out for the heron.",model:"resident-06",build:1.05,supperStart:null,supperEnd:null,house:{x:-22.4,z:-25,angle:-1.5707963267948966},homeAddress:"7 Willow Alley"},{name:"Hana",age:17,role:"school pupil",female:!0,height:1.57,work:[43,36],evening:[36,30],home:[-29,-25],top:"#d17b78",start:540,close:1080,retire:1260,personality:"Bold little artist",friend:"Daichi",look:"Coral apron dress and chestnut bob",hairStyle:"bob",outfit:"cardigan",hello:"I sketch everyone while they wait for the bus. Sitting still is their contribution.",gossip:"Daichi says he cannot pose. He has three different heroic expressions prepared.",clue:"The hillside shrine has the best view for drawing roofs.",model:"resident-07",build:1.135,supperStart:null,supperEnd:115,house:{x:-31.6,z:-25,angle:1.5707963267948966},homeAddress:"8 Willow Alley"},{name:"Daichi",age:17,role:"school pupil",female:!1,height:1.7,work:[45,36],evening:[28,50],home:[-25,-20],top:"#cda04f",start:540,close:1080,retire:1260,personality:"Big dreams, gentle nature",friend:"Hana",look:"Ochre hoodie and warm brown hair",hairStyle:"messy",outfit:"sweater",hello:"One day I will pitch a perfect game. Today I am working on finding the ball.",gossip:"Hana drew me as a famous player. She made the ball enormous so I could hit it.",clue:"Hana likes the shrine view. I carry the pencils. It is a specialist position.",model:"resident-08",build:.88,supperStart:null,supperEnd:130,house:{x:-22.4,z:-20,angle:-1.5707963267948966},homeAddress:"9 Willow Alley"},{name:"Mr Fujita",age:73,role:"retired fisherman",female:!1,height:1.64,work:[-38,-60],evening:[-34,39],home:[-29,-20],top:"#73988a",start:540,close:1080,retire:1260,personality:"Cheerful embellisher",friend:"Harbour master",look:"Sea-green vest, white hair and round spectacles",hairStyle:"receding",outfit:"sweater",hello:"The fish was enormous. Ask me tomorrow; I expect it will have grown.",gossip:"The harbour master has heard this story before. He still asks how it ends.",clue:"The outer pier has a bait station. The gulls regard it as their property.",model:"resident-09",build:.965,supperStart:1080,supperEnd:1180,house:{x:-31.6,z:-20,angle:1.5707963267948966},homeAddress:"10 Willow Alley"},{name:"Masaru",age:51,role:"fisherman",female:!1,height:1.72,work:[-38,-74],evening:[24,18],home:[-25,-12],top:"#bd7959",start:540,close:1080,retire:1560,personality:"Boisterous cook-at-heart",friend:"Nao",look:"Rust hoodie and brown hair",hairStyle:"curly",outfit:"work",hello:"A good catch is a good supper. A poor catch is a very long story.",gossip:"Nao lets me suggest specials. She very sensibly ignores most of them.",clue:"Try the grilled skewers at Minato. The last one is always the best one.",model:"resident-10",build:1.05,supperStart:1380,supperEnd:1560,house:{x:-22.4,z:-12,angle:-1.5707963267948966},homeAddress:"11 Willow Alley"},{name:"Yoshiko",age:61,role:"bathhouse keeper",female:!0,height:1.58,work:[-34,39],evening:[-34,39],home:[-29,-12],top:"#9ea66c",start:540,close:1260,retire:1260,personality:"Calm neighbourhood anchor",friend:"Mrs Sato",look:"Sage apron dress and silver bob",hairStyle:"bun",outfit:"apron",hello:"A hot bath, a clean towel, a little patience. Most days need all three.",gossip:"Sato pretends she does not gossip. She just asks exceptionally well-informed questions.",clue:"Bring the waterlogged book to my warm drying rack. Slowly, away from the stove.",model:"resident-11",build:1.135,supperStart:1284,supperEnd:1380,house:{x:-31.6,z:-12,angle:1.5707963267948966},homeAddress:"12 Willow Alley"},{name:"Reiko",age:36,role:"newspaper editor",female:!0,height:1.62,work:[-4,-2],evening:[-4,-2],home:[-25,-5],top:"#a96883",start:540,close:1080,retire:1260,personality:"Curious, loves a scoop",friend:"Officer Mori",look:"Burgundy vest, long dark hair and round spectacles",hairStyle:"bob",outfit:"jacket",hello:"Nothing is off the record until I put my pencil away. There. What did you hear?",gossip:"Mori writes beautiful incident reports. Unfortunately nothing ever happens.",clue:"I left a stack of evening papers outside the press. The corrections are on page two.",model:"resident-12",build:.88,supperStart:1080,supperEnd:1180,house:{x:-22.4,z:-5,angle:-1.5707963267948966},homeAddress:"13 Willow Alley"},{name:"Tetsuo",age:40,role:"radio repairer",female:!1,height:1.7,work:[4,-13],evening:[24,18],home:[-29,-5],top:"#807398",start:540,close:1080,retire:1605,personality:"Deadpan music lover",friend:"Kenji",look:"Aubergine vest, dark hair and round spectacles",hairStyle:"part",outfit:"vest",hello:"Turn it gently. Radios have feelings. Mostly static, but feelings.",gossip:"Kenji has repaired my radio twice. I keep finding extra screws.",clue:"There are three radio stations. Each claims it has the most reliable weather.",model:"resident-13",build:.965,supperStart:1440,supperEnd:1605,house:{x:-31.6,z:-5,angle:1.5707963267948966},homeAddress:"14 Willow Alley"},{name:"Emi",age:29,role:"seamstress",female:!0,height:1.61,work:[38,34],evening:[28,50],home:[-25,2],top:"#d797a2",start:540,close:1080,retire:1260,personality:"Warm, quietly daring",friend:"Aya",look:"Rose dress and chestnut ponytail",hairStyle:"pony",outfit:"blouse",hello:"I keep little fabric scraps. They are not clutter; they are future possibilities.",gossip:"Aya lends me adventure novels. I repay her in pockets deep enough to hide one.",clue:"Thuan has postcards by the biscuits. Ask her which gull looks most important.",model:"resident-14",build:1.05,supperStart:1104,supperEnd:1234,house:{x:-22.4,z:2,angle:-1.5707963267948966},homeAddress:"15 Willow Alley"},{name:"Mr Tanabe",age:66,role:"shrine caretaker",female:!1,height:1.66,work:[20,50],evening:[20,56],home:[-29,2],top:"#bbaa85",start:540,close:1080,retire:1260,personality:"Playful philosopher",friend:"Mr Fujita",look:"Cream vest, silver hair and round spectacles",hairStyle:"receding",outfit:"sweater",hello:"The shrine bell sounds different every day. Or perhaps I am getting better at listening.",gossip:"Fujita says his fish was a sign of good fortune. It was certainly a sign of good appetite.",clue:"Leave an intention at the shrine. Then do one small thing about it.",model:"resident-15",build:1.135,supperStart:1080,supperEnd:1180,house:{x:-31.6,z:2,angle:1.5707963267948966},homeAddress:"16 Willow Alley"},{name:"Naoko",age:33,role:"postal worker",female:!0,height:1.65,work:[4,11],evening:[-26,46],home:[-25,12],top:"#c77465",start:540,close:1080,retire:1260,personality:"Brisk, remembers everyone",friend:"Bus driver",look:"Post-red dress and dark ponytail",hairStyle:"pony",outfit:"jacket",hello:"I know every door in this town. Some of them are more polite than their owners.",gossip:"The bus driver saves stories for me. I deliver the endings to everyone else.",clue:"The postbox collection plate tells you when the next bag leaves.",model:"resident-16",build:.88,supperStart:1092,supperEnd:1207,house:{x:-22.4,z:12,angle:-1.5707963267948966},homeAddress:"17 Willow Alley"},{name:"Hiroshi",age:54,role:"grocer",female:!1,height:1.68,work:[-4,-28],evening:[24,18],home:[-29,12],top:"#7c9959",start:540,close:1080,retire:1260,personality:"Proud amateur singer",friend:"Yoshiko",look:"Moss hoodie and salt-and-pepper hair",hairStyle:"curly",outfit:"apron",hello:"I sing to the vegetables. The aubergines are a difficult audience.",gossip:"Yoshiko says I may sing at the bathhouse if I agree to sing quietly. Negotiations continue.",clue:"Sakura has cold tea. A cup after walking the harbour is an excellent idea.",model:"resident-17",build:.965,supperStart:1104,supperEnd:1234,house:{x:-31.6,z:12,angle:1.5707963267948966},homeAddress:"18 Willow Alley"},{name:"Fumiko",age:77,role:"neighbour",female:!0,height:1.49,work:[-29,50],evening:[-34,39],home:[-25,19],top:"#aa90b4",start:540,close:1080,retire:1260,personality:"Fearless neighbourhood aunt",friend:"Mrs Sato",look:"Lavender apron dress, white bob and round spectacles",hairStyle:"bob",outfit:"cardigan",hello:"At my age you can say almost anything. I am making up for lost time.",gossip:"Sato and I never gossip. We maintain the oral history of the neighbourhood.",clue:"There is a quiet bench by the shops. Sit long enough and the town comes to you.",model:"resident-18",build:1.05,supperStart:1080,supperEnd:1180,house:{x:-22.4,z:19,angle:-1.5707963267948966},homeAddress:"19 Willow Alley"},{name:"Kenta",age:21,role:"apprentice engineer",female:!1,height:1.8,work:[-4.5,17],evening:[24,18],home:[-29,19],top:"#77a5b7",start:540,close:1080,retire:1260,personality:"Sweetly awkward inventor",friend:"Cold-storage kid",look:"Sky-blue hoodie and chestnut hair",hairStyle:"curly",outfit:"work",hello:"I made a machine to save time. Explaining it takes most of the afternoon.",gossip:"The cold-store lad laughs at my jokes. Slowly, but the room is very cold.",clue:"Kenji has a small prototype on display. Pick it up and turn it over.",model:"resident-19",build:1.135,supperStart:1092,supperEnd:1207,house:{x:-31.6,z:19,angle:1.5707963267948966},homeAddress:"20 Willow Alley"},{name:"Nao",age:34,role:"izakaya owner",female:!0,height:1.65,work:[24,20],evening:[24,20],home:[-25,25],start:960,close:1620,retire:1620,top:"#c87d65",personality:"Generous host, wicked timing",friend:"Masaru",look:"Terracotta apron dress and dark bob",hairStyle:"bun",outfit:"apron",hello:"Come in, come in. The spare chair has been expecting you.",gossip:"Masaru called his catch the special of the day. It was so small I nearly served it as garnish.",clue:"Take a seat, order something warm, and listen. This town tells its best stories over supper.",model:"resident-20",build:.88,supperStart:960,supperEnd:1620,house:{x:-22.4,z:25,angle:-1.5707963267948966},homeAddress:"21 Willow Alley"},{name:"Barfly",age:43,role:"Minato regular",female:!1,height:1.72,work:[24,21],evening:[24,21],home:[24,21],top:"#b74e43",start:0,close:0,retire:1440,personality:"Unhurried, permanently thirsty",friend:"Nao",look:"Broad build, short salt-and-pepper hair, red patterned open-collar shirt and wristwatch",hairStyle:"short",outfit:"hawaiian",hello:"Another one? Nao knows my usual. I am staying right here.",gossip:"I have been at this stool long enough to know when the lanterns need trimming.",clue:"Minato stays open late. The regular at the end of the counter has never once caught the last bus.",model:"barfly",build:1.14,supperStart:null,supperEnd:null,house:{x:24,z:21,angle:0},homeAddress:"Minato Izakaya"}],Ic={interests:["read","inspect","seat","shop"],snack:"rice",drink:"tea",meal:"rice"},Dc=Object.freeze(Object.fromEntries(Object.entries({Kenji:{source:"casual_2",top:"#477697",trousers:"#334b55",hair:"#24272b",skin:"#bd8b65",width:.96,accessory:"tool-pouch",interests:["arcade","machine","radio","inspect"],snack:"bun",drink:"beer",meal:"yakitori"},"Mrs Sato":{source:"female_formal",top:"#96566d",trousers:"#96566d",hair:"#c5c0ae",skin:"#c69c7c",width:1.06,accessory:"glasses",interests:["read","shop","seat","post"],snack:"tea",drink:"tea",meal:"rice"},"Harbour master":{source:"suit",top:"#455b6b",trousers:"#374653",hair:"#92958d",skin:"#b5805d",width:1.1,accessory:"captain",interests:["office","fish","read","machine","phone"],snack:"rice",drink:"beer",meal:"fish"},Tetsuo:{source:"worker",top:"#698071",trousers:"#4a5146",hair:"#444035",skin:"#ba895d",helmet:"#737768",width:1.03,accessory:"glasses",interests:["radio","machine","arcade","inspect"],snack:"bun",drink:"beer",meal:"yakitori"},"Officer Mori":{source:"suit",top:"#3c5780",trousers:"#303e57",hair:"#202528",skin:"#c79872",width:.98,accessory:"police",interests:["read","phone","post","inspect"],snack:"rice",drink:"tea",meal:"rice"},"Bus driver":{source:"suit",top:"#437f78",trousers:"#3b514e",hair:"#61564b",skin:"#b88968",width:1.04,accessory:"driver",interests:["seat","read","phone","shop"],snack:"tea",drink:"tea",meal:"fish"},Nao:{source:"female_casual",top:"#bd7557",trousers:"#394b58",hair:"#292a30",skin:"#cf9b77",width:.98,accessory:"apron",interests:["shop","post","read","radio"],shopping:"soda",snack:"rice",drink:"tea",meal:"yakitori"},Aya:{source:"female_casual",top:"#424552",trousers:"#74764e",hair:"#24212a",skin:"#d5a17d",width:.91,accessory:"ponytail-satchel",accent:"#ab799e",height:1.62,interests:["read","seat","post","shop"],snack:"tea",drink:"beer",meal:"rice"},Reiko:{source:"female_formal",top:"#a05c75",trousers:"#a05c75",hair:"#44332b",skin:"#d8ae8c",width:.96,accessory:"headband-scarf",accent:"#efe2c3",height:1.62,interests:["read","radio","phone","shop"],snack:"rice",drink:"beer",meal:"fish"},Thuan:{source:"thuan-mh",top:"#d8b23a",trousers:"#27304d",hair:"#1c1612",skin:"#e6c3a8",width:1.02,accessory:"ribbon",interests:["shop","seat","read","post"],snack:"tea",drink:"tea",meal:"rice",height:1.64},"Cold-storage kid":{source:"worker",top:"#87a5b2",trousers:"#495e71",hair:"#664634",skin:"#d4a982",helmet:"#658499",width:.9,accessory:"scarf",accent:"#ddd6ba"},Hana:{source:"female_formal",top:"#c58176",trousers:"#c58176",hair:"#76503e",skin:"#dcb594",width:.92,accessory:"headband",accent:"#eee0ae"},Daichi:{source:"casual_2",top:"#bba153",trousers:"#5d614c",hair:"#634f34",skin:"#cea276",width:.93,accessory:"satchel",accent:"#655337"},"Mr Fujita":{source:"suit",top:"#648a80",trousers:"#455d5c",hair:"#d2ccba",skin:"#b08461",width:1.08,accessory:"glasses"},Masaru:{source:"worker",top:"#a56545",trousers:"#485970",hair:"#514335",skin:"#ac7655",helmet:"#ad9264",width:1.15,accessory:"scarf",accent:"#caba8a"},Yoshiko:{source:"female_formal",top:"#859263",trousers:"#859263",hair:"#b3ada0",skin:"#c59b79",width:1.04,accessory:"bun-apron"},Emi:{source:"female_casual",top:"#c08d97",trousers:"#68657b",hair:"#775746",skin:"#d3a884",width:.95,accessory:"ponytail-satchel",accent:"#ded0ab"},"Mr Tanabe":{source:"suit",top:"#b9aa85",trousers:"#797565",hair:"#aaa998",skin:"#bd936e",width:1.02,accessory:"glasses"},Naoko:{source:"female_casual",top:"#b45a51",trousers:"#484753",hair:"#302f32",skin:"#c89977",width:.98,accessory:"headband-satchel",accent:"#7b5746"},Hiroshi:{source:"casual_2",top:"#778a53",trousers:"#535345",hair:"#79776a",skin:"#bb9269",width:1.12,accessory:"apron"},Fumiko:{source:"female_formal",top:"#9c7fac",trousers:"#9c7fac",hair:"#d6d2c8",skin:"#c69f82",width:1.08,accessory:"glasses"},Kenta:{source:"casual_2",top:"#78a7b8",trousers:"#546679",hair:"#825f44",skin:"#d4ac85",width:.96,accessory:"tool-pouch"},Yui:{source:"female_casual",top:"#66969a",trousers:"#45465e",hair:"#332d31",skin:"#d0a586",width:1.01,accessory:"headband",accent:"#e8cf85"},Barfly:{source:"casual_2",top:"#b74e43",trousers:"#36343a",hair:"#77766f",skin:"#b9825f",width:1.14,accessory:"hawaiian",interests:["seat","drink","radio"],snack:"yakitori",drink:"beer",meal:"yakitori",height:1.72}}).map(([n,e])=>[n,Object.freeze({...Ic,...e})]))),Mg=Object.freeze({Aiko:"Aya",Nozomi:"Reiko"}),xg=n=>Dc[Mg[n]||n]||Ic;function ty(n){const e={};if(!n||typeof n!="object")return e;for(const t of Object.keys(Dc)){const i=n[t];if(!i||!Number.isSafeInteger(i.day)||!Number.isFinite(i.yen))continue;const r={day:i.day,yen:Math.max(0,Math.min(2400,i.yen)),purchases:[],activities:[],meals:{}};Array.isArray(i.purchases)&&(r.purchases=i.purchases.filter(o=>o&&typeof o.id=="string"&&typeof o.item=="string"&&Number.isFinite(o.cost)&&o.cost>=0).slice(-24).map(o=>({id:o.id.slice(0,160),item:o.item.slice(0,160),cost:o.cost}))),Array.isArray(i.activities)&&(r.activities=i.activities.filter(o=>typeof o=="string").slice(-8).map(o=>o.slice(0,180)));for(const o of["market","izakaya","ramen"]){const a=i.meals?.[o];!a||!["bun","rice","tea","ramen","fish","yakitori"].includes(a.item)||(r.meals[o]={stockClaim:a.stockClaim&&["bun","rice","tea"].includes(a.stockClaim.item)&&Number.isSafeInteger(a.stockClaim.unitCost)?{item:a.stockClaim.item,unitCost:a.stockClaim.unitCost}:null,item:a.item,drink:a.drink==="beer"?"beer":"tea",delivered:a.delivered===!0,finished:a.finished===!0,started:Number.isFinite(a.started)?a.started:null,waited:Number.isFinite(a.waited)?Math.max(0,Math.min(45,a.waited)):0,eaten:Number.isFinite(a.eaten)?Math.max(0,Math.min(42,a.eaten)):0})}const s=i.shopping;s&&["browse","pickup","queue","paid","finished"].includes(s.phase)&&Number.isFinite(s.started)&&(["tea","coffee","rice","biscuit","soap","notebook","postcard","battery","cola","water","beer","noodles","milk","bun"].includes(s.item)||s.phase==="browse"&&!s.picked)&&(r.shopping={phase:s.phase,started:s.started,finished:s.finished===!0,item:["tea","coffee","rice","biscuit","soap","notebook","postcard","battery","cola","water","beer","noodles","milk","bun"].includes(s.item)?s.item:null,picked:s.picked===!0,paid:s.paid===!0,timer:Number.isFinite(s.timer)?Math.max(0,Math.min(3,s.timer)):0,position:Array.isArray(s.position)&&s.position.length===3&&s.position.every(o=>Number.isFinite(o)&&Math.abs(o)<7)?s.position:[0,0,5.2]}),e[t]=r}return e}function ny(n=()=>null){const e={};function t(i,r){const s=n()||e,o=Math.floor(r/1440);s.residentLife??={};let a=s.residentLife[i];return(!a||a.day!==o)&&(a=s.residentLife[i]={day:o,yen:2400,purchases:[],activities:[]}),a}return{account:t,purchase(i,r,s,o,a){const l=t(i,r);return l.purchases.some(c=>c.id===s)?!0:!Number.isFinite(a)||a<0||l.yen<a?!1:(a===0||(l.yen-=a,l.purchases.push({id:s,item:o,cost:a}),l.purchases=l.purchases.slice(-24)),!0)},record(i,r,s){const o=t(i,r);o.activities.push(s),o.activities=o.activities.slice(-8)}}}const lt=n=>Ht(n),Sg=new Set(["Thuan","Mrs Higa","Mina","Grandmother Higa","Mrs Nakamura","Mrs Yonamine","Mrs Miyagi","Mrs Kamiya","Mrs Kinjō"]),Nc=n=>Object.freeze(Object.fromEntries(Object.entries(n).map(([e,t])=>{const i=Xo.find(r=>r.name===e)?.female??Sg.has(e);return[e,Ht({...t,body:{...t.body,silhouette:t.body.silhouette==="neutral"?i?"feminine":"masculine":t.body.silhouette}})]}))),vo=Nc({Johansson:lt({name:"Johansson",body:{height:.72,build:.72,silhouette:"masculine",skin:"#dc9d7a"},head:{size:.48,shape:.45,form:"square",jaw:.75,cheeks:.55},hair:{style:"horseshoe",colour:"#b8b4aa"},eyes:{style:"gentle",colour:"#3d6a8a",size:.45,spacing:.52,height:.5,tilt:.45},brows:{style:"bushy",colour:"#a8a49a",size:.6,height:.55,tilt:.45},nose:{style:"wide",size:.6,height:.48},mouth:{style:"smile",colour:"#a8433e",size:.55,height:.5},facial:{style:"stubble",colour:"#b8b4aa"},wrinkles:.7,blush:.35,outfit:{top:"kariyushi",topColour:"#7fb0d8",pattern:"flowers",bottom:"shorts",bottomColour:"#c8b48a",footwear:"sandals",shoes:"#6d4a32",accent:"#f4f1ea"},swim:{colour:"#2f5f9e"}}),Thuan:lt({name:"Thuan",accessories:{earrings:"studs",neckwear:"pendant",colour:"#e0b93a"},body:{height:.36,build:.35,silhouette:"feminine",skin:"#f1cfae"},head:{size:.48,shape:.48,form:"heart",jaw:.3,cheeks:.62},hair:{style:"braids",colour:"#1c1714",flip:!1},eyes:{style:"lashes",colour:"#2a1d16",size:.78,spacing:.5,height:.48,tilt:.55},brows:{style:"arched",colour:"#2a1d16",size:.42,height:.55,tilt:.5},nose:{style:"dot",size:.35,height:.5},mouth:{style:"smile",colour:"#cc3d52",size:.42,height:.5},glasses:{style:"round",colour:"#e06a7a"},blush:.65,outfit:{top:"blouse",topColour:"#f4d23c",pattern:"flowers",bottom:"trousers",bottomColour:"#27304d",shoes:"#f4f1ea",accent:"#f4d23c"},swim:{colour:"#e98aa6"}}),Nao:lt({name:"Nao",body:{height:.42,build:.45,skin:"#e8bf98"},head:{size:.46,shape:.4,form:"oval",jaw:.35,cheeks:.45},hair:{style:"ponytail",colour:"#292a30"},eyes:{style:"almond",colour:"#2a1d16",size:.55,spacing:.5,height:.5,tilt:.6},brows:{style:"straight",colour:"#292a30",size:.5},nose:{style:"button",size:.4},mouth:{style:"grin",colour:"#b8544a",size:.5},blush:.3,outfit:{top:"apron",topColour:"#bd7557",bottom:"trousers",bottomColour:"#394b58",shoes:"#2b2b2b",hat:"kerchief",hatColour:"#27304d",accent:"#f4f1ea"}}),Aya:lt({name:"Aya",accessories:{earrings:"hoops",pin:!0,colour:"#c8a060"},body:{height:.34,build:.38,skin:"#efc9a4"},head:{size:.5,shape:.52,form:"round",jaw:.35,cheeks:.6},hair:{style:"bob",colour:"#2e211b"},eyes:{style:"round",colour:"#3a2a1e",size:.6,spacing:.5,height:.5,tilt:.5},brows:{style:"arched",colour:"#2e211b",size:.45},nose:{style:"button",size:.35},mouth:{style:"small",colour:"#c4485a",size:.45},glasses:{style:"round",colour:"#7a4a2a"},blush:.45,outfit:{hat:"beret",hatColour:"#5f8f6a",top:"jacket",topColour:"#5f8f6a",pattern:"dots",bottom:"longskirt",bottomColour:"#e6d3b0",shoes:"#6b4a2e",accent:"#f4e4c8"}}),Reiko:lt({name:"Reiko",accessories:{neckwear:"scarf",colour:"#d8342c"},body:{height:.46,build:.42,skin:"#e8bf98"},head:{size:.47,shape:.44,form:"oval",jaw:.4,cheeks:.4},hair:{style:"ponytail",colour:"#1c1714"},eyes:{style:"almond",colour:"#2a1d16",size:.5,tilt:.6},brows:{style:"straight",colour:"#1c1714",size:.5},nose:{style:"line",size:.4},mouth:{style:"smirk",colour:"#a8433e",size:.45},outfit:{top:"smock",topColour:"#3f5f7a",bottom:"trousers",bottomColour:"#2b2b33",shoes:"#2b2b2b",accent:"#f4f1ea"}}),Kenji:lt({name:"Kenji",body:{height:.6,build:.55,skin:"#c98d62"},head:{size:.48,shape:.5,form:"square",jaw:.6,cheeks:.45},hair:{style:"spiky",colour:"#2b1d14"},eyes:{style:"sparkle",colour:"#2a1d16",size:.55},brows:{style:"thick",colour:"#2b1d14",size:.55},nose:{style:"wide",size:.5},mouth:{style:"grin",size:.55},facial:{style:"stubble",colour:"#2b1d14"},outfit:{top:"kariyushi",topColour:"#f2a93b",pattern:"flowers",bottom:"shorts",bottomColour:"#3f5f7a",shoes:"#f4f1ea",accent:"#f4f1ea"}}),Tetsuo:lt({name:"Tetsuo",accessories:{pin:!0,colour:"#e0b93a"},body:{height:.44,build:.5,skin:"#dca97e"},head:{size:.5,shape:.5,form:"narrow",jaw:.55,cheeks:.35},hair:{style:"horseshoe",colour:"#8a8680"},eyes:{style:"sleepy",colour:"#2a1d16",size:.45},brows:{style:"bushy",colour:"#8a8680",size:.6},nose:{style:"hook",size:.55},mouth:{style:"flat",size:.5},glasses:{style:"half",colour:"#2b2b2b"},wrinkles:.6,outfit:{top:"jacket",topColour:"#6b6f4a",bottom:"trousers",bottomColour:"#4a4238",shoes:"#3a2a1e",accent:"#e8d7b0"}}),"Mrs Sato":lt({name:"Mrs Sato",body:{height:.22,build:.6,skin:"#e2b48c"},head:{size:.5,shape:.56,form:"round",jaw:.4,cheeks:.6},hair:{style:"bun",colour:"#c9c6c0"},eyes:{style:"gentle",colour:"#2a1d16",size:.45},brows:{style:"arched",colour:"#b9b6b0",size:.5},nose:{style:"button",size:.45},mouth:{style:"smile",colour:"#b8544a",size:.5},glasses:{style:"round",colour:"#6b4a2e"},wrinkles:.7,blush:.3,outfit:{top:"apron",topColour:"#ad6178",bottom:"trousers",bottomColour:"#4a4040",shoes:"#2b2b2b",hat:"kerchief",hatColour:"#f4f1ea",accent:"#f4f1ea"}}),"Mrs Higa":lt({name:"Mrs Higa",body:{height:.24,build:.58,skin:"#c99a74"},head:{size:.5,shape:.55,form:"round",jaw:.35,cheeks:.6},hair:{style:"perm",colour:"#9a968e"},eyes:{style:"sleepy",colour:"#2a1d16",size:.42},brows:{style:"thin",colour:"#8a8680",size:.45},nose:{style:"button",size:.45},mouth:{style:"small",colour:"#a8433e",size:.45},glasses:{style:"half",colour:"#6b4a2e"},wrinkles:.75,blush:.25,outfit:{top:"blouse",topColour:"#6d8a74",bottom:"skirt",bottomColour:"#3a3a42",shoes:"#2b2b2b",accent:"#f4f1ea"}}),"Harbour master":lt({name:"Harbour master",body:{height:.52,build:.68,skin:"#b5805d"},head:{size:.52,shape:.55,form:"round",jaw:.6,cheeks:.5},hair:{style:"horseshoe",colour:"#b9b7b0"},eyes:{style:"gentle",colour:"#2a1d16",size:.45},brows:{style:"bushy",colour:"#cfcdc6",size:.6},nose:{style:"wide",size:.55},mouth:{style:"flat",size:.5},glasses:{style:"round",colour:"#2b2b2b"},facial:{style:"walrus",colour:"#dedbd3"},wrinkles:.55,outfit:{top:"jacket",topColour:"#2c3e5c",bottom:"trousers",bottomColour:"#27304d",shoes:"#1c1c24",hat:"captain",hatColour:"#f4f1ea",accent:"#e0b93a"}}),"Officer Mori":lt({name:"Officer Mori",body:{height:.7,build:.48,skin:"#c79872"},head:{size:.48,shape:.46,form:"oval",jaw:.5,cheeks:.4},hair:{style:"crop",colour:"#4a4845"},eyes:{style:"round",colour:"#2a1d16",size:.62},brows:{style:"worried",colour:"#3a3835",size:.55},nose:{style:"button",size:.45},mouth:{style:"smile",size:.45},blush:.2,wrinkles:.2,outfit:{top:"polo",topColour:"#9dbfe0",bottom:"trousers",bottomColour:"#27304d",shoes:"#1c1c24",hat:"police",hatColour:"#27304d",accent:"#e0b93a"}})}),Dl=Nc({Haru:lt({head:{form:"square",jaw:.72,cheeks:.4},body:{height:.63,build:.58,skin:"#bf875f"},hair:{style:"crop",colour:"#302419"},eyes:{style:"narrow"},brows:{style:"thick"},nose:{style:"wide"},mouth:{style:"smile"},facial:{style:"stubble",colour:"#302419"},outfit:{top:"polo",topColour:"#607c84",bottom:"shorts",bottomColour:"#7b7155",hat:"cap",hatColour:"#c4b486"}}),Mina:lt({head:{form:"oval",jaw:.35,cheeks:.6},body:{height:.4,build:.45,skin:"#d8ac87"},hair:{style:"bun",colour:"#3b2920"},eyes:{style:"gentle",size:.48},brows:{style:"arched"},nose:{style:"button"},mouth:{style:"smile"},outfit:{top:"apron",topColour:"#849267",bottom:"longskirt",bottomColour:"#5c6e75"}}),Jun:lt({head:{form:"narrow",jaw:.4,cheeks:.3},body:{height:.53,build:.4,skin:"#dbb393"},hair:{style:"sidepart",colour:"#29241e"},eyes:{style:"almond"},brows:{style:"straight"},nose:{style:"line"},mouth:{style:"small"},glasses:{style:"half",colour:"#5b5c52"},outfit:{top:"polo",topColour:"#e0dac7",bottom:"trousers",bottomColour:"#3e596d"}}),"Grandmother Higa":lt({head:{size:.48,shape:.5,form:"round",jaw:.7,cheeks:.85},body:{height:.2,build:.6,skin:"#dca97e"},hair:{style:"perm",colour:"#d8d6d0"},eyes:{style:"gentle",size:.4},brows:{style:"thin",colour:"#9a9a96"},nose:{style:"button",size:.55},mouth:{style:"smile",size:.45},glasses:{style:"half",colour:"#8a4a3a"},wrinkles:1,blush:.4,outfit:{top:"blouse",topColour:"#8a4ab8",pattern:"flowers",bottom:"longskirt",bottomColour:"#6d7478",shoes:"#2b2b2b"}}),"Mr Ōshiro":lt({head:{size:.48,shape:.5,form:"narrow",jaw:.45,cheeks:.3},body:{height:.4,build:.4,skin:"#b27449"},hair:{style:"buzz",colour:"#d8d6d0"},eyes:{style:"narrow"},brows:{style:"bushy",colour:"#d8d6d0"},nose:{style:"hook",size:.6},mouth:{style:"flat"},facial:{style:"stubble",colour:"#d8d6d0"},wrinkles:.9,outfit:{top:"tee",topColour:"#f4f1ea",bottom:"trousers",bottomColour:"#6d7478",shoes:"#2b2b2b",hat:"straw",hatColour:"#e0c078"}}),"Uncle Kinjō":lt({head:{size:.48,shape:.5,form:"square",jaw:.8,cheeks:.65},body:{height:.55,build:.75,skin:"#c98d62"},hair:{style:"crop",colour:"#5a3a22"},eyes:{style:"dot"},brows:{style:"thick"},nose:{style:"wide"},mouth:{style:"wide"},facial:{style:"moustache",colour:"#3a2618"},wrinkles:.5,outfit:{top:"polo",topColour:"#2a8a5a",bottom:"shorts",bottomColour:"#c8b48a",shoes:"#6d4a32",hat:"cap",hatColour:"#d8342c"}}),"Mrs Nakamura":lt({head:{size:.48,shape:.5,form:"round",jaw:.55,cheeks:.8},body:{height:.25,build:.6,skin:"#e8bf98"},hair:{style:"bun",colour:"#5a3a22"},eyes:{style:"round",size:.55},brows:{style:"arched"},nose:{style:"button"},mouth:{style:"grin",colour:"#cc3d52"},blush:.5,wrinkles:.4,outfit:{top:"apron",topColour:"#3fa0c8",bottom:"skirt",bottomColour:"#27304d",shoes:"#f4f1ea",hat:"kerchief",hatColour:"#f4f1ea",accent:"#f4f1ea"}}),"Mr Shimabukuro":lt({head:{size:.48,shape:.5,form:"narrow",jaw:.5,cheeks:.35},body:{height:.5,build:.45,skin:"#dca97e"},hair:{style:"sidepart",colour:"#1c1714"},eyes:{style:"almond"},brows:{style:"straight"},nose:{style:"line"},mouth:{style:"smirk"},facial:{style:"moustache",colour:"#1c1714"},wrinkles:.3,outfit:{top:"smock",topColour:"#f4f1ea",bottom:"trousers",bottomColour:"#2b2b2b",shoes:"#2b2b2b"}}),"Mrs Yonamine":lt({head:{size:.48,shape:.5,form:"heart",jaw:.3,cheeks:.65},body:{height:.3,build:.55,skin:"#c98d62"},hair:{style:"ponytail",colour:"#3a2618"},eyes:{style:"sparkle"},brows:{style:"thick"},nose:{style:"button"},mouth:{style:"wide"},blush:.3,outfit:{top:"apron",topColour:"#2f5f9e",bottom:"trousers",bottomColour:"#27304d",shoes:"#f4f1ea",hat:"headband",hatColour:"#d8342c",accent:"#f4f1ea"}}),"Mrs Miyagi":lt({head:{size:.48,shape:.5,form:"oval",jaw:.35,cheeks:.4},body:{height:.1,build:.4,skin:"#c98d62"},hair:{style:"bun",colour:"#f4f1ea"},eyes:{style:"sleepy"},brows:{style:"thin",colour:"#d8d6d0"},nose:{style:"button"},mouth:{style:"small"},wrinkles:1,outfit:{top:"blouse",topColour:"#f4f1ea",bottom:"longskirt",bottomColour:"#2f5f9e",shoes:"#2b2b2b"}}),"Mr Tamaki":lt({head:{size:.48,shape:.5,form:"square",jaw:.7,cheeks:.4},body:{height:.6,build:.7,skin:"#c98d62"},hair:{style:"spiky",colour:"#1c1714"},eyes:{style:"round"},brows:{style:"thick"},nose:{style:"wide"},mouth:{style:"grin"},outfit:{top:"jacket",topColour:"#e8742a",bottom:"trousers",bottomColour:"#27304d",shoes:"#2b2b2b",hat:"headband",hatColour:"#f4f1ea"}}),Kōji:lt({head:{size:.48,shape:.5,form:"oval",jaw:.65,cheeks:.4},body:{height:.58,build:.5,skin:"#b27449"},hair:{style:"crop",colour:"#3a2618"},eyes:{style:"dot"},brows:{style:"straight"},nose:{style:"button"},mouth:{style:"grin"},outfit:{top:"tee",topColour:"#d8342c",bottom:"shorts",bottomColour:"#2f5f9e",shoes:"#f4f1ea",hat:"kerchief",hatColour:"#2f5f9e"}}),"Mr Nakasone":lt({head:{size:.48,shape:.5,form:"square",jaw:.75,cheeks:.6},body:{height:.42,build:.55,skin:"#dca97e"},hair:{style:"horseshoe",colour:"#d8d6d0"},eyes:{style:"gentle"},brows:{style:"bushy",colour:"#d8d6d0"},nose:{style:"wide"},mouth:{style:"smile"},glasses:{style:"square",colour:"#2b2b2b"},wrinkles:.8,outfit:{top:"polo",topColour:"#d8342c",bottom:"trousers",bottomColour:"#c8b48a",shoes:"#f4f1ea",hat:"cap",hatColour:"#f4f1ea"}}),"Mrs Kamiya":lt({head:{size:.48,shape:.5,form:"round",jaw:.5,cheeks:.7},body:{height:.2,build:.5,skin:"#e8bf98"},hair:{style:"perm",colour:"#9a9a96"},eyes:{style:"round",size:.45},brows:{style:"arched",colour:"#9a9a96"},nose:{style:"dot"},mouth:{style:"small",colour:"#e06a7a"},wrinkles:.8,blush:.4,outfit:{top:"polo",topColour:"#3fa0c8",bottom:"trousers",bottomColour:"#f4f1ea",shoes:"#f4f1ea",hat:"straw",hatColour:"#f4f1ea"}}),"Mr Arakaki":lt({head:{size:.48,shape:.5,form:"narrow",jaw:.3,cheeks:.25},body:{height:.35,build:.35,skin:"#dca97e"},hair:{style:"bald",colour:"#9a9a96"},eyes:{style:"narrow"},brows:{style:"worried",colour:"#9a9a96"},nose:{style:"hook"},mouth:{style:"flat"},glasses:{style:"round",colour:"#2b2b2b"},wrinkles:.9,outfit:{top:"polo",topColour:"#f4d23c",bottom:"trousers",bottomColour:"#27304d",shoes:"#2b2b2b",hat:"cap",hatColour:"#2f5f9e"}}),"Mrs Kinjō":lt({head:{size:.48,shape:.5,form:"heart",jaw:.4,cheeks:.55},body:{height:.32,build:.55,skin:"#dca97e"},hair:{style:"bob",colour:"#3a2618"},eyes:{style:"round"},brows:{style:"arched"},nose:{style:"button"},mouth:{style:"smile",colour:"#b8544a"},blush:.4,wrinkles:.3,outfit:{top:"blouse",topColour:"#e98aa6",pattern:"dots",bottom:"skirt",bottomColour:"#6d7478",shoes:"#9a6a42"}}),"Postman Tōma":lt({head:{size:.48,shape:.5,form:"oval",jaw:.5,cheeks:.4},body:{height:.6,build:.4,skin:"#e8bf98"},hair:{style:"sidepart",colour:"#3a2618",flip:!0},eyes:{style:"round"},brows:{style:"straight"},nose:{style:"line"},mouth:{style:"smile"},outfit:{top:"polo",topColour:"#2f5f9e",bottom:"trousers",bottomColour:"#27304d",shoes:"#2b2b2b",hat:"cap",hatColour:"#2f5f9e"}})}),wg={captain:["captain","#f4f1ea"],police:["police","#27304d"],driver:["cap","#2a8a5a"],apron:["kerchief","#f4f1ea"],"headband-scarf":["headband","#efe2c3"],headband:["headband","#e8cf85"],"headband-satchel":["headband","#7b5746"]},bo=new Map(Xo.map(n=>[n.name,n.age])),Nl=(n,e)=>{const t=bc(bo.get(e));return bo.has(e)&&n.age!==t?Ht({...n,age:t}):n};function Tg(n=""){const e=bg(n);if(e)return e;if(vo[n])return Nl(vo[n],n);if(Dl[n])return Nl(Dl[n],n);const t=xg(n),i=Ho(n),r=l=>l[Math.floor(i()*l.length)],s=Xo.find(l=>l.name===n)?.female??(/female/.test(t.source||"")||/^(Mrs |Aya|Reiko|Hana|Yoshiko|Emi|Naoko|Fumiko|Yui)/.test(n)),o=/^#[a-f0-9]{6}$/i.test(t.hair||"")&&parseInt(t.hair.slice(1,3),16)>150,a=wg[t.accessory]||(t.helmet?["helmet",t.helmet]:["none","#f4f1ea"]);return Ht({name:n,age:bc(bo.get(n)),body:{silhouette:s?"feminine":"masculine",height:.3+i()*.45,build:.3+(Math.min(1.2,t.width||1)-.85)*1.6,skin:t.skin||"#e8bf98"},head:{size:.38+i()*.22,shape:i(),form:r(ft.head),jaw:.25+i()*.5,cheeks:.25+i()*.5},hair:{style:r(o&&!s?["horseshoe","buzz","crop"]:s?["bob","long","ponytail","bun","sidepart"]:["crop","sidepart","spiky","buzz"]),colour:t.hair||"#1c1714",flip:i()<.5},eyes:{style:r(ft.eyes),size:.35+i()*.35,spacing:.4+i()*.2,tilt:.4+i()*.2},brows:{style:r(ft.brows.slice(0,6)),colour:t.hair||"#1c1714"},nose:{style:r(ft.nose.slice(0,5)),size:.35+i()*.4},mouth:{style:r(ft.mouth),colour:s?"#cc3d52":"#b8544a"},glasses:{style:/glasses/.test(t.accessory||"")?"square":"none",colour:"#2b2b2b"},facial:{style:!s&&i()<.25?r(["moustache","stubble","goatee"]):"none",colour:t.hair||"#1c1714"},blush:s?.4:.15,wrinkles:o?.7:0,outfit:{top:t.accessory==="apron"?"apron":t.accessory==="hawaiian"?"kariyushi":s?"blouse":"polo",topColour:t.top||"#3fa0c8",pattern:t.accessory==="hawaiian"?"flowers":"none",bottom:s&&t.top===t.trousers?"longskirt":"trousers",bottomColour:t.trousers||"#27304d",shoes:"#2b2b2b",hat:a[0],hatColour:a[1],accent:t.accent||"#f4d23c"}})}const Ul=Object.freeze({x:-25,z:-44,width:8.8,depth:7.4,door:Object.freeze([-25,0,-39.65])}),iy=Object.freeze({width:8.4,depth:7,bounds:{minX:-4.2,maxX:4.2,minZ:-3.5,maxZ:3.5},doorX:0,spawn:[0,0,2.9],exit:[0,1.1,3.42],yaw:0,staff:{Kenji:[-1.25,0,-1.9],Tetsuo:[1.5,0,-1.9]}}),Uc=Object.freeze({title:"Dock Electrical & Repair Workshop",jp:"Dock Electrical Workshop",sub:"ELECTRICAL · INSTRUMENTS · REPAIRS",industrialWorkshop:!0,x:Ul.x,z:Ul.z,line:"Kenji’s fabrication and Form 3D bench, with Tetsuo’s electrical and instrument repairs.",directions:"On the western quay, beside the harbour warehouse. Look for the blue electrical workshop sign."}),Fc=Object.freeze([{id:"yuri-home",entry:"one",number:"1",residents:["Thuan","Nao"]},{id:"resident-home-aya",entry:"two",number:"2",residents:["Aya","Reiko"]},{id:"resident-home-kenji",entry:"three",number:"3",residents:["Kenji","Tetsuo"]},{id:"resident-home-mrs-sato",entry:"four",number:"4A",residents:["Mrs Sato"]},{id:"resident-home-officer-mori",entry:"four",number:"4B",residents:["Officer Mori"]},{id:"resident-home-harbour-master",entry:"five",number:"5A",residents:["Harbour master"]},{id:"resident-home-bus-driver",entry:"five",number:"5B",residents:["Bus driver"]}].map(n=>Object.freeze({...n,residents:Object.freeze(n.residents),address:n.number+" Main Street",title:n.residents.join(" & ")+"’s home"}))),Eg=Object.freeze({"resident-home-nao":"yuri-home","resident-home-reiko":"resident-home-aya","resident-home-tetsuo":"resident-home-kenji"}),kc=n=>Eg[n]||n,Ag=n=>Fc.find(e=>e.residents.includes(n)),Rg=n=>Fc.find(e=>e.id===kc(n?.id))||Ag(n?.homeOwner),ry=n=>n?.homeOwners||Rg(n)?.residents||(n?.homeOwner?[n.homeOwner]:[]),_i=Object.freeze({LEGACY:"legacy",SHOPPING:"shopping-district",PENINSULA:"peninsula"});let $r=_i.LEGACY;function sy(n=_i.LEGACY){return $r=Object.values(_i).includes(n)?n:_i.LEGACY,$r}const oy=()=>$r!==_i.LEGACY,Cg=()=>$r===_i.PENINSULA,ay=Object.freeze({z:1.6,width:8.8,depth:7.4}),ly=Object.freeze({width:8.4,depth:7,doorX:0,bounds:{minX:-4.2,maxX:4.2,minZ:-3.5,maxZ:3.5},spawn:[0,0,2.9],exit:[0,1.1,3.42],yaw:0,staff:{Aya:[-2.6,0,1.2],Reiko:[-2.6,0,-1.9]}}),Oc=Object.freeze({title:"Front-Row Books",jp:"Front-Row Books",sub:"BOOKS · NEWSPAPERS · LOCAL STORIES",bookshop:!0,side:-1,line:"Aya’s small neighbourhood bookshop, with reading copies, second-hand books and Reiko’s evening newspaper.",directions:"On the west pavement, north of Minato Izakaya. A quiet bookshop with a window reading chair and a counter for recommendations."}),Bc=Object.freeze({journal:"frontrow",electronics:"form3d",stepwise:"form3d",career:"office"}),Pg=n=>Bc[n]||n,cy=n=>n==="form3d",Mo=Object.freeze([{id:"frontrow",title:"Front-Row Books & Press",jp:"Maegeru Shobo/Printing",sub:"BOOKS · EVENING PRESS",side:1,z:4,color:7559241,accent:"#8b3f36",line:"Aya’s books and Reiko’s evening paper, under one roof.",directions:"The bookshop and printing desk share the west block, facing Main Street."},{id:"form3d",title:"Kenji & Tetsuo Repairs",jp:"Three-dimensional/electrical workshop",sub:"PATTERNS · RADIOS · INSTRUMENTS",side:1,z:4,color:5663603,accent:"#385f6e",line:"Kenji’s pattern bench and Tetsuo’s radio and instrument repairs.",directions:"The repair workshop is in the east block, across Main Street from the bookshop."},{id:"office",title:"Johansson Harbour Office",jp:"Port Affairs and Technology Office",sub:"MARINE SERVICE · HARBOUR RECORDS",side:1,z:-42,color:6453102,accent:"#49675d",line:"Shipping records, tide tables and Johansson’s marine service files.",directions:"Follow the main street to the quay. The harbour office is on the right, opposite the warehouse."},{id:"market",title:"Sakura Shōten",jp:"Sakura Shop",sub:"DAILY GOODS",side:-1,z:-28,color:10321022,accent:"#a76680",line:"Thuan’s convenience store · tea, snacks and everyday things."}].map(Object.freeze)),Lg=()=>Mo.map(n=>({...n})),hy=()=>Lg().filter(n=>["market","frontrow","form3d","office"].includes(n.id)).map(n=>n.id==="frontrow"?{...n,...Oc}:n.id==="form3d"?{...n,...Uc}:n);function uy(n){const e=new Set(Object.keys(Bc));for(let t=n.length-1;t>=0;t--)e.has(n[t].id)&&n.splice(t,1);for(const t of Mo){const i=n.find(r=>r.id===t.id);i&&Object.assign(i,t)}if(Cg()){let t=n.find(r=>r.id==="form3d");t||(t={...Mo.find(r=>r.id==="form3d")},n.push(t)),Object.assign(t,Uc);const i=n.find(r=>r.id==="frontrow");i&&Object.assign(i,Oc)}return n}function Ig(n=[]){return[...new Set(n.map(e=>kc(Pg(e))))]}const Qr="johansson-town-1988-v5",Dg=["johansson-town-1988-v4","johansson-town-1988-v3"];function Ng(n){const e=t=>typeof t=="string"?t.replace(/\b(?:Yuri|Yui)\b/g,"Thuan"):t;for(const t of["residentLocations","residentLife"]){const i=n[t];if(!(!i||typeof i!="object"||Array.isArray(i)))for(const r of["Yuri","Yui"])Object.hasOwn(i,r)&&(Object.hasOwn(i,"Thuan")||(i.Thuan=i[r]),delete i[r])}Array.isArray(n.notes)&&(n.notes=[...new Set(n.notes.map(e))]);for(const t of Object.values(n.residentLife||{}))Array.isArray(t?.activities)&&(t.activities=t.activities.map(e));if(Array.isArray(n.sakura?.journal))for(const t of n.sakura.journal)t&&typeof t=="object"&&(t.buyer=e(t.buyer));return n}const zc="johansson-town-players",Hr=Object.freeze({id:"player-1",name:"Visitor"}),Ug=n=>n===Hr.id?Qr:Qr+"@"+n,es=n=>String(n||"").replace(/[\u0000-\u001f<>]/g,"").trim().slice(0,24);function Ri(n){let e=null;try{e=JSON.parse(n?.getItem?.(zc))}catch{}const t=Array.isArray(e?.players)?e.players.filter(r=>r&&typeof r.id=="string"&&/^[\w-]{1,40}$/.test(r.id)).map(r=>({id:r.id,name:es(r.name)||"Visitor",created:Number(r.created)||0,lastPlayed:Number(r.lastPlayed)||0})):[];return t.some(r=>r.id===Hr.id)||t.unshift({...Hr,created:0,lastPlayed:0}),{active:t.some(r=>r.id===e?.active)?e.active:Hr.id,players:t}}function ds(n,e){try{return n.setItem(zc,JSON.stringify(e)),!0}catch{return!1}}const dy=n=>{const e=Ri(n);return e.players.find(t=>t.id===e.active)};function fy(n,e,t=Date.now()){const i=Ri(n),r="player-"+t.toString(36)+Math.floor(Math.random()*1296).toString(36);return i.players.push({id:r,name:es(e)||"Visitor",created:t,lastPlayed:t}),i.active=r,ds(n,i),r}function py(n,e){const t=Ri(n);return t.players.some(i=>i.id===e)?(t.active=e,ds(n,t)):!1}function my(n,e){const t=Ri(n),i=t.players.find(r=>r.id===t.active);return!i||!es(e)?!1:(i.name=es(e),ds(n,t))}function gy(n,e=Date.now()){const t=Ri(n),i=t.players.find(r=>r.id===t.active);i&&(i.lastPlayed=e,ds(n,t))}function _y(n){const e=Ug(Ri(n).active);for(const t of e===Qr?[Qr,...Dg]:[e])try{const i=JSON.parse(n.getItem(t));if(i&&typeof i=="object"&&!Array.isArray(i))return Array.isArray(i.visited)&&(i.visited=Ig(i.visited.filter(r=>typeof r=="string"))),Ng(i)}catch{}return null}function Wr(n){return{scale:Math.max(.5,Math.min(.9,((n.thigh+n.shin)*.94+n.foot-n.seatDrop)/.56)),saddle:.74}}function yy(n,e,t,i,r){const s=Math.sin(t)*.54*i,o=Math.cos(t)*.54*i;return r(n,e,.28)||r(n-s,e-o,.23*i)||r(n+s,e+o,.23*i)}function Fl(n,e,t){const i=n.getWorldPosition(new P),r=e.getWorldPosition(new P).sub(i).normalize(),s=t.clone().sub(i).normalize(),o=new gt().setFromUnitVectors(r,s).multiply(n.getWorldQuaternion(new gt));n.quaternion.copy(n.parent.getWorldQuaternion(new gt).invert().multiply(o)),n.updateWorldMatrix(!1,!0)}function kl(n,e,t,i,r){const s=n.getWorldPosition(new P),o=e.getWorldPosition(new P),a=t.getWorldPosition(new P),l=s.distanceTo(o),c=o.distanceTo(a),h=i.clone().sub(s),u=Ue.clamp(h.length(),Math.abs(l-c)+1e-4,l+c-1e-4);h.normalize();const p=r.clone().addScaledVector(h,-r.dot(h)).normalize(),f=(l*l-c*c+u*u)/(2*u),g=Math.sqrt(Math.max(0,l*l-f*f));Fl(n,e,s.clone().addScaledVector(h,f).addScaledVector(p,g)),Fl(e,t,s.clone().addScaledVector(h,u))}function Fg(n,e=0,t=Wr(n.measure)){const{bones:i,measure:r,root:s}=n,o=s.parent,a=t.scale;s.updateWorldMatrix(!0,!0);const l=o?o.getWorldQuaternion(new gt):new gt,c=(p,f,g)=>{const _=new P(p,f,g);return o?o.localToWorld(_):_},h=(p,f,g)=>new P(p,f,g).applyQuaternion(l),u=s.getWorldQuaternion(new gt);for(const[p,f,g]of[["L",-1,Math.PI],["R",1,0]]){const _=e*Math.PI*2+g;kl(i["thigh"+p],i["knee"+p],i["foot"+p],c(f*.12*a,(.32+Math.sin(_)*.12)*a+r.foot,(.12+Math.cos(_)*.12)*a),h(0,0,-1));const m=i["foot"+p];m.quaternion.copy(m.parent.getWorldQuaternion(new gt).invert().multiply(u)),m.updateWorldMatrix(!1,!0),kl(i["shoulder"+p],i["elbow"+p],i["hand"+p],c(f*.25*a,1.04*a+r.hand*.55,-.25*a),h(f,-.2,.1));const d=i["hand"+p];d.quaternion.copy(d.parent.getWorldQuaternion(new gt).invert().multiply(l)),d.updateWorldMatrix(!1,!0)}}function kg(n,e=2.4){const t=Ue.clamp(n/e,0,1);return{lift:Ue.smoothstep(t,0,.3)*(1-Ue.smoothstep(t,.7,1)),swallow:Ue.smoothstep(t,.4,.65),done:t>=1}}function Gc(n,e,t=!1){return t?0:-(.55+.2*(1-Ue.clamp(n?.userData?.portion??1,0,1)))*e}function Og(n,e,t=!1){return t?0:-.05*(1-Ue.clamp(n?.userData?.portion??1,0,1))*Ue.smoothstep(e,.5,1)}function Ol(n,e,t){const i=n.getWorldPosition(new P),r=e.getWorldPosition(new P).sub(i).normalize(),s=new gt().setFromUnitVectors(r,t.clone().sub(i).normalize()).multiply(n.getWorldQuaternion(new gt));n.quaternion.copy(n.parent.getWorldQuaternion(new gt).invert().multiply(s)),n.updateWorldMatrix(!1,!0)}function Bg(n,e){const t=n.bones,i=t.shoulderR.getWorldPosition(new P),r=i.distanceTo(t.elbowR.getWorldPosition(new P)),s=t.elbowR.getWorldPosition(new P).distanceTo(t.handR.getWorldPosition(new P)),o=e.clone().sub(i),a=Ue.clamp(o.length(),Math.abs(r-s)+1e-4,r+s-1e-4);o.normalize();const l=new P(-1,-.25,0).transformDirection(n.root.matrixWorld);l.addScaledVector(o,-l.dot(o)).normalize();const c=(r*r-s*s+a*a)/(2*a),h=Math.sqrt(Math.max(0,r*r-c*c));Ol(t.shoulderR,t.elbowR,i.clone().addScaledVector(o,c).addScaledVector(l,h)),Ol(t.elbowR,t.handR,i.clone().addScaledVector(o,a))}function zg(n,e,t=!1,i=null){const{root:r,measure:s,bones:o}=n;r.updateWorldMatrix(!0,!0);const a=hs(n.recipe),l=o.head,c=Math.PI*.28+a.mouthY/256*Math.PI*.58,h=Math.PI/2-.95+a.mouthX/256*1.9,u=ir(new P(-Math.cos(h)*Math.sin(c),Math.cos(c),Math.sin(h)*Math.sin(c)),s.profile),p=new P(u.x*s.Rh*s.headSX,s.headCentre-s.headY+u.y*s.Rh*s.headSY,u.z*s.Rh*.98+.025*s.k),f=r.localToWorld(new P(-s.shoulderX,s.shoulderY-s.upper*.75,s.depth*.75+s.fore*.45)),g=r.getWorldQuaternion(new gt).multiply(new gt().setFromAxisAngle(new P(1,0,0),Gc(i,e,t))),_=new P(t?0:-.1*s.k,t?.04:(i?.userData.rimHeight??.15)-.08*s.k,t?.115:.015*s.k).applyQuaternion(g),m=o.shoulderR.getWorldPosition(new P),d=(s.upper+s.fore)*.985;let y=null;for(let b=0;b<12;b++){l.updateWorldMatrix(!0,!1),y=f.clone().lerp(l.localToWorld(p.clone()).sub(_),e);const M=y.distanceTo(m)-d;if(M<=5e-4||e<.01)break;l.rotation.x+=Math.min(.12,M/(s.Rh*1.1))}Bg(n,y),o.handR.quaternion.copy(o.handR.parent.getWorldQuaternion(new gt).invert().multiply(g)),o.handR.updateWorldMatrix(!1,!0)}function ts(n,e,t=0,i="R"){const r=!!e.userData.food,s=n.measure,o=n.bones["hand"+i];n.root.updateWorldMatrix(!0,!0);const a=n.root.getWorldQuaternion(new gt).multiply(new gt().setFromAxisAngle(new P(1,0,0),Gc(e,t,r))),l=new P(r?0:(i==="R"?-.1:.1)*s.k,r?0:-.08*s.k,.015*s.k).applyQuaternion(a),c=o.getWorldPosition(new P).add(l),h=new Be().compose(c,a,new P(1,1,1));e.matrixAutoUpdate=!1,e.matrix.copy(o.matrixWorld).invert().multiply(h),e.matrixWorldNeedsUpdate=!0}const Br=["hips","spine","chest","neck","head","shoulderL","elbowL","handL","shoulderR","elbowR","handR","thighL","kneeL","footL","thighR","kneeR","footR"],Gg=(n,e)=>n<0||n>e?0:Math.sin(Math.PI*Math.min(1,n/e)),Vg=(n,e,t=.25)=>Math.min(1,n/t,(e-n)/t),Ji=Object.freeze({Wave:1.6,Bow:1.5,Nod:1.1,HeadShake:1.2,Point:1.6,Shrug:1.3,Clap:1.8,Laugh:2,Think:2.4,LookAround:2.6,Stretch:2.2,PickUp:1.6,Fist:1.4,Jab:.42,JabL:.42,Swipe:.7,Hurt:.5,Jump:.9,Cheer:1.6,Hop:1.2,Gasp:1.6,Stomp:1.4,Slump:2.2,Fidget:2.4,SitToast:2.4,SitDrink:2.4,SitEat:2.4,Drink:2.4,Eat:2.4,Talk:1/0,Kachashi:1/0,Crouch:1/0,Phone:1/0,FishIdle:1/0,Reel:1/0}),Hg=Object.freeze({happy:"Hop",laugh:"Laugh",sad:"Slump",angry:"Stomp",shy:"Fidget",surprised:"Gasp",worried:"Think"});function xo(n){const{bones:e,measure:t}=n,i=Ho(n.recipe.name||JSON.stringify(n.recipe)),r=.92+i()*.16,s=.8+i()*.25,o=(i()-.5)*.055,a=.85+i()*.3,l=Object.fromEntries(Br.map(Y=>[Y,new P])),c=Object.fromEntries(Br.map(Y=>[Y,new P])),h=new P;let u=0,p=Math.random()*10,f=0,g=0,_=null,m=1+Math.random()*3,d=-1,y=0,b=0,M=[0,0],D=2,R="neutral",A=null,T=0,S=null,x=0;const v=(Y,N=0,j=0,he=0)=>c[Y].set(N,j,he),I=(Y,N=0,j=0,he=0)=>c[Y].add(new P(N,j,he));function U(Y){return Y in Ji?(_={name:Y,t:0,d:Ji[Y]},!0):!1}const B=()=>{_=null};function q(Y,N={}){p+=Y;const j=_?.name||N.pose||N.seat,he=["Eat","EatStanding","SitEat"].includes(j),K=["Drink","DrinkStanding","SitDrink","SitToast"].includes(j);if(he||K){j!==S&&(T=0),T+=Y;const X=Number.isFinite(N.consumeElapsed)?N.consumeElapsed:_?_.t+Y:T%5;A={...kg(X),food:he,elapsed:T,cycle:Math.floor(T/5)}}else A=null,T=0;S=j;for(const X of Br)c[X].set(0,0,0);let ce=0,we=0;const W=N.speed||0,se=W>.08&&!N.seated&&!N.riding;if(v("shoulderL",0,0,.13),v("shoulderR",0,0,-.13),v("elbowL",-.12),v("elbowR",-.12),N.riding){const X=N.ridePhase||0,L=N.bicycleFit||Wr(t);ce=L.saddle*L.scale-t.hipY+t.seatDrop,v("thighL",-1.05+Math.sin(X*Math.PI*2)*.38),v("kneeL",1.05+Math.cos(X*Math.PI*2)*.4),v("thighR",-1.05-Math.sin(X*Math.PI*2)*.38),v("kneeR",1.05-Math.cos(X*Math.PI*2)*.4),v("chest",.28),v("head",-.18),v("shoulderL",-1.15,0,.18),v("shoulderR",-1.15,0,-.18),v("elbowL",-.35),v("elbowR",-.35)}else if(N.seated){const X=N.seat==="Soak"||N.pose==="Soak";ce=(Number.isFinite(N.seatHeight)?N.seatHeight:.45)-t.hipY+t.seatDrop,v("thighL",-1.52,0,.06),v("thighR",-1.52,0,-.06),v("kneeL",1.45),v("kneeR",1.45),v("shoulderL",-.45,0,.15),v("shoulderR",-.45,0,-.15),v("elbowL",-.55),v("elbowR",-.55),I("chest",Math.sin(p*1.5)*.02);const L=N.pose;if(L==="Type")v("shoulderL",-.9,0,.1),v("shoulderR",-.9,0,-.1),v("elbowL",-.7+Math.sin(p*14)*.08),v("elbowR",-.7+Math.sin(p*13+1)*.08),v("head",.15);else if(L==="Eat"||L==="Drink"||N.seat==="SitEat"){const ue=Math.max(0,Math.sin(p*1.4))**4;v("shoulderR",-.6-ue*.9,0,-.25),v("elbowR",-.8-ue*1.3),v("head",.08-ue*.1)}else if(L==="Sleep"||N.sleeping)v("head",.45,0,.15),v("chest",.15);else if(X)v("thighL",-1.3,0,.25),v("thighR",-1.3,0,-.25),v("kneeL",.9),v("kneeR",.9),v("shoulderL",0,0,.9),v("shoulderR",0,0,-.9),v("head",-.1);else if(L==="Wake"){const ue=Math.max(0,Math.sin(p*.8));v("shoulderL",0,0,.4+ue*2.2),v("shoulderR",0,0,-.4-ue*2.2)}}else if(se){const X=N.running||W>2.6,L=t.leg*(X?2.6:1.7)*r;u+=W/L*Math.PI*2*Y*.5;const ue=X?.95:Math.min(.62,.25+W*.3),Q=Math.sin(u),ve=Math.cos(u);v("thighL",-Q*ue),v("thighR",Q*ue),v("kneeL",Math.max(0,Math.sin(u-.9))*ue*1.5+.05),v("kneeR",Math.max(0,Math.sin(u+Math.PI-.9))*ue*1.5+.05),v("footL",Q*ue*.3),v("footR",-Q*ue*.3),v("shoulderL",Q*ue*s,0,.12),v("shoulderR",-Q*ue*s,0,-.12),v("elbowL",X?-1.35:-.25-Math.max(0,-Q)*.3),v("elbowR",X?-1.35:-.25-Math.max(0,Q)*.3),v("hips",0,Q*.14,0),v("chest",X?.22:.05,-Q*.18,0),v("head",X?-.12:-.02,Q*.08,0),we=Math.abs(ve)*(X?.055:.025)*t.k-(X?.02:0),N.carrying&&(v("shoulderL",-1.15,0,.3),v("shoulderR",-1.15,0,-.3),v("elbowL",-.5),v("elbowR",-.5))}else{I("chest",Math.sin(p*1.6)*.025),v("hips",0,0,Math.sin(p*.45)*.035),I("head",Math.sin(p*.7)*.03,Math.sin(p*.31)*.12,Math.sin(p*.5)*.04),I("thighL",0,0,-Math.sin(p*.45)*.03),I("thighR",0,0,-Math.sin(p*.45)*.03),I("chest",o),I("head",0,Math.sin(p*.31*a)*.035,0),we=Math.sin(p*1.6*a)*.004;const X=N.pose;if(X==="CounterIdle")v("shoulderL",-.5,0,.2),v("shoulderR",-.5,0,-.2),v("elbowL",-.95),v("elbowR",-.95);else if(X==="Interact")v("shoulderL",-.75+Math.sin(p*4.5)*.18,0,.15),v("shoulderR",-.75+Math.sin(p*4.5+1.7)*.18,0,-.15),v("elbowL",-.8),v("elbowR",-.8),I("chest",.12),I("head",.2);else if(X==="DrinkStanding"||X==="Drink"){const L=Math.max(0,Math.sin(p*1.2))**4;v("shoulderR",-.5-L*1.1,0,-.2),v("elbowR",-.9-L*1.2)}else(X==="Sit"||X==="Sleep")&&v("head",.2);N.carrying&&(v("shoulderL",-1.15,0,.3),v("shoulderR",-1.15,0,-.3),v("elbowL",-.5),v("elbowR",-.5))}const re=Ue.clamp((N.tipsy||0)/2.5,0,1);let oe=0;if(re>0&&!N.riding&&!N.airborne){const X=Math.sin(p*1.7),L=Math.max(0,Math.sin(p*.43+Math.sin(p*.19)*2))**8;if(N.seated)I("head",.22*re+Math.sin(p*.6)*.06*re,Math.sin(p*.37)*.1*re,Math.sin(p*.5)*.12*re),I("chest",.08*re,0,Math.sin(p*.5)*.05*re);else if(se){const ue=1+Math.sin(u*.5)*.35*re;c.thighL.x*=ue,c.thighR.x*=2-ue,I("hips",0,0,X*.12*re),I("chest",.06*re+L*.25*re,0,-X*.14*re),I("head",.1*re,Math.sin(p*.8)*.15*re,X*.18*re),I("shoulderL",0,0,.35*re),I("shoulderR",0,0,-.35*re),oe=X*.07*re+L*Math.sign(Math.sin(p*.21))*.06*re}else I("hips",0,0,Math.sin(p*.9)*.06*re),I("chest",.04*re,0,-Math.sin(p*.9)*.08*re),I("head",.12*re,Math.sin(p*.4)*.12*re,Math.sin(p*.9+.6)*.12*re),I("thighL",0,0,.05*re),I("thighR",0,0,-.05*re),oe=Math.sin(p*.9)*.04*re}x+=(oe-x)*(1-Math.exp(-Y*6)),N.airborne&&!N.seated&&(v("thighL",-.6),v("thighR",-.2),v("kneeL",1),v("kneeR",.6),v("shoulderL",-.3,0,1.6),v("shoulderR",-.3,0,-1.6));const Ce=N.expression||"neutral";if(Ce!==R){R=Ce;const X=Hg[Ce];X&&!N.seated&&!se&&!_&&U(X)}if(N.waving&&!_&&U("Wave"),_)if(_.t+=Y,_.t>=_.d)_=null;else{const X=z(_);X?.root!==void 0&&(ce+=X.root)}let Fe=null;if(N.gaze&&!N.sleeping){h.set(...N.gaze.isVector3?N.gaze.toArray():N.gaze),n.root.worldToLocal(h);const X=Math.atan2(h.x,h.z),L=-Math.atan2(h.y-t.headCentre,Math.hypot(h.x,h.z));if(Math.abs(X)<2.4){const ue=Ue.clamp(X,-1.35,1.35),Q=Ue.clamp(L,-.45,.4);I("head",Q*.8,ue*.62,0),I("chest",Q*.15,ue*.3,0),Fe=[Ue.clamp((X-ue*.62)*1.6,-1,1),Ue.clamp(Q*.5,-.6,.6)]}}const Le=1-Math.exp(-Y*14);for(const X of Br)l[X].lerp(c[X],Le),e[X].rotation.set(l[X].x,l[X].y,l[X].z);f+=(ce-f)*(N.seated||N.riding?1-Math.exp(-Y*9):Le),g+=(we-g)*Le,N.riding&&(f=ce),n.root.position.x=N.riding?0:x,n.root.position.z=N.riding?.21*(N.bicycleFit||Wr(t)).scale:0,n.root.position.y=f+(N.seated||N.riding?0:N.floorHeight||0),e.hips.position.y=t.hipY+(N.riding?0:g),N.riding?Fg(n,N.ridePhase||0,N.bicycleFit||Wr(t)):A&&(e.head.rotation.x+=Og(N.heldProp,A.lift,A.food),zg(n,A.lift,A.food,N.heldProp)),m-=Y,m<=0&&d<0&&(d=0,m=1.8+Math.random()*3.8);let qe=0;d>=0&&(d+=Y,qe=d<.13?1:0,d>=.13&&(d=-1)),N.talking?(y-=Y,y<=0&&(y=.09+Math.random()*.12,b=b?0:Math.random()<.8?1:0)):b=0,D-=Y,D<=0&&(D=1.2+Math.random()*3,M=Math.random()<.45?[0,0]:[(Math.random()-.5)*1.6,(Math.random()-.5)*.8]);const ee=N.sleeping?"sleep":Ce;n.paintFace({expression:ee,blink:qe,talk:b,look:N.look||Fe||(ee==="thinking"?[1,-1]:M)})}function z(Y,N){const j=Y.t,he=Y.d,K=he===1/0?1:Gg(j,he),ce=he===1/0?Math.min(1,j/.3):Vg(j,he);switch(Y.name){case"Wave":v("shoulderR",-.2,0,-2.55*ce),v("elbowR",0,0,-.45+Math.sin(j*10)*.45*ce),I("head",0,0,.08*ce);break;case"Bow":I("chest",.95*K),I("spine",.25*K),I("head",.2*K),v("shoulderL",.1,0,.05),v("shoulderR",.1,0,-.05);break;case"Nod":I("head",Math.sin(j*9)*.28*K);break;case"HeadShake":I("head",0,Math.sin(j*11)*.45*K);break;case"Point":v("shoulderR",-1.5*ce,.2,-.1),v("elbowR",-.05),I("head",0,-.15*ce);break;case"Shrug":v("shoulderL",-.3*K,0,.55*K+.13),v("shoulderR",-.3*K,0,-.55*K-.13),v("elbowL",-1.3*K),v("elbowR",-1.3*K),I("head",0,0,.2*K);break;case"Clap":{const we=Math.abs(Math.sin(j*9));v("shoulderL",-1.2*ce,0,.1+we*.35),v("shoulderR",-1.2*ce,0,-.1-we*.35),v("elbowL",-.9*ce),v("elbowR",-.9*ce);break}case"Laugh":I("chest",-.24*K+Math.sin(j*16)*.07*K),I("head",-.32*K),v("shoulderL",-.85*K,0,.4),v("shoulderR",-.85*K,0,-.4),v("elbowL",-1.65*K),v("elbowR",-1.65*K);break;case"Gasp":return I("chest",-.18*K),I("head",-.12*K),v("shoulderL",-.7*K,0,.28),v("shoulderR",-.7*K,0,-.28),v("elbowL",-1.9*K),v("elbowR",-1.9*K),{root:Math.sin(Math.PI*j/he)*.045};case"Think":v("shoulderR",-1.25*ce,0,-.35),v("elbowR",-1.95*ce),v("shoulderL",-.4*ce,0,.3),v("elbowL",-1.4*ce),I("head",.12*ce,0,.18*ce);break;case"LookAround":I("head",0,Math.sin(j*2.4)*.75*K),I("chest",0,Math.sin(j*2.4)*.2*K);break;case"Stretch":v("shoulderL",-.2,0,2.8*K),v("shoulderR",-.2,0,-2.8*K),I("chest",-.25*K),I("head",-.3*K);break;case"PickUp":return I("chest",1.1*K),I("spine",.3*K),v("shoulderR",-1.3*K),v("thighL",-.5*K),v("thighR",-.5*K),v("kneeL",.9*K),v("kneeR",.9*K),{root:-.08*K};case"Fist":v("shoulderR",-2.4*ce+Math.sin(j*8)*.2*ce,0,-.1),v("elbowR",-.5*ce),I("chest",-.1*ce);break;case"Jab":case"JabL":{const we=Y.name==="Jab",W=we?"R":"L",se=we?"L":"R",re=we?1:-1,oe=j<.1?-(j/.1)*.3:j<.2?(j-.1)/.1:Math.max(0,1-(j-.2)/.22);return v("shoulder"+W,-.9-.75*oe,0,-re*.05),v("elbow"+W,-1.9+1.85*oe),v("shoulder"+se,-1.05,0,re*.18),v("elbow"+se,-2.1),I("chest",.06*oe,-re*.4*oe),I("head",0,re*.12*oe),{root:-.02*ce}}case"Swipe":{const we=j<.32?j/.32:Math.max(0,1-(j-.32)/.14),W=j<.32?0:Math.min(1,(j-.32)/.14)*Math.max(0,1-(j-.5)/.2);return v("shoulderL",-2.7*we-1.2*W,0,.25),v("shoulderR",-2.7*we-1.2*W,0,-.25),v("elbowL",-.4*we),v("elbowR",-.4*we),I("chest",-.2*we+.45*W),I("head",-.15*we+.2*W),{root:.04*we}}case"Hurt":return v("shoulderL",-.5*K,0,.9*K+.13),v("shoulderR",-.5*K,0,-.9*K-.13),v("elbowL",-.5*K),v("elbowR",-.5*K),I("chest",-.4*K),I("head",-.35*K,Math.sin(j*20)*.1*K),{root:-.03*K};case"Jump":{const we=j<.2?-.08:Math.sin(Math.PI*Math.min(1,(j-.2)/.6))*.25;return v("shoulderL",-.3,0,1.4*ce),v("shoulderR",-.3,0,-1.4*ce),v("kneeL",j<.2?.8:.3),v("kneeR",j<.2?.8:.3),v("thighL",j<.2?-.5:-.2),v("thighR",j<.2?-.5:-.2),{root:we}}case"Cheer":return v("shoulderL",-.2,0,2.6*ce),v("shoulderR",-.2,0,-2.6*ce),v("elbowL",-.3),v("elbowR",-.3),{root:Math.abs(Math.sin(j*7))*.1*K};case"Hop":return v("shoulderL",-.2,0,.9*K),v("shoulderR",-.2,0,-.9*K),I("head",-.15*K),{root:Math.abs(Math.sin(j*8))*.12*K};case"Stomp":v("shoulderL",-.2,0,.35),v("shoulderR",-.2,0,-.35),v("elbowL",-1.6*ce),v("elbowR",-1.6*ce),v("thighL",-.5*Math.max(0,Math.sin(j*9))*K),v("kneeL",.6*Math.max(0,Math.sin(j*9))*K),I("head",.18*K,Math.sin(j*14)*.1*K),I("chest",.12*K);break;case"Slump":return I("chest",.3*K),I("head",.4*K),v("shoulderL",.05,0,.03),v("shoulderR",.05,0,-.03),{root:-.03*K};case"Fidget":v("shoulderL",-.55*ce,0,-.2*ce),v("shoulderR",-.55*ce,0,.2*ce),v("elbowL",-.6*ce),v("elbowR",-.6*ce),I("head",.18*K,0,.25*K),I("hips",0,Math.sin(j*3)*.12*K);break;case"SitToast":v("shoulderR",-1.9*ce,0,-.2),v("elbowR",-.6*ce),I("head",-.15*ce);break;case"SitDrink":{const we=Math.max(0,Math.sin(j*2.6))**2;v("shoulderR",-.6-we*1,0,-.25),v("elbowR",-.9-we*1.2);break}case"Talk":v("shoulderR",-.55+Math.sin(j*3.1)*.25,0,-.2),v("elbowR",-1.1+Math.sin(j*4.3)*.3),v("shoulderL",-.35+Math.sin(j*2.3+1)*.2,0,.2),v("elbowL",-1+Math.sin(j*3.7)*.3),I("head",Math.sin(j*2.6)*.06);break;case"Kachashi":{const we=Math.sin(j*5.5),W=Math.sin(j*2.75);return v("shoulderL",-.4,0,1.9+we*.25),v("shoulderR",-.4,0,-1.9+we*.25),v("elbowL",0,0,1.1+we*.5),v("elbowR",0,0,-1.1+we*.5),v("hips",0,W*.2,W*.08),I("chest",0,-W*.2),I("head",0,W*.15,-W*.1),v("thighL",-Math.max(0,W)*.5),v("kneeL",Math.max(0,W)*.8),v("thighR",-Math.max(0,-W)*.5),v("kneeR",Math.max(0,-W)*.8),{root:Math.abs(W)*.03}}case"Crouch":return v("thighL",-1.7,0,.25),v("thighR",-1.7,0,-.25),v("kneeL",2.3),v("kneeR",2.3),v("footL",-.6),v("footR",-.6),I("chest",.5),v("shoulderL",-.9,0,.1),v("shoulderR",-.9,0,-.1),v("elbowL",-.4),v("elbowR",-.4),{root:-(t.thigh+t.shin)*.72};case"Phone":v("shoulderR",-.4,0,-.5),v("elbowR",-2.2),I("head",0,0,-.15);break;case"FishIdle":v("shoulderL",-1,0,.1),v("shoulderR",-1,0,-.1),v("elbowL",-.6),v("elbowR",-.6);break;case"Reel":v("shoulderL",-1,0,.1),v("elbowL",-.6),v("shoulderR",-1+Math.sin(j*9)*.25,0,-.2),v("elbowR",-.8+Math.cos(j*9)*.3);break}return null}return{update:q,play:U,stop:B,get gesture(){return _?.name||null},get consumption(){return A}}}const Hn=Object.freeze({draft:Object.freeze({id:"draft",jp:"Orion draught, medium mug",en:"Orion draught, a frosted mug",price:450,sips:6,alcohol:1,pour:4.2,line:"One Orion draught! Cold from the tap."}),bottle:Object.freeze({id:"bottle",jp:"Orion Large bottle",en:"Orion large bottle and a small glass",price:600,sips:8,alcohol:1.4,pour:2,line:"It's a big bottle. Pour for yourself -- or I pour the first one."}),can:Object.freeze({id:"can",jp:"Orion Can",en:"Orion can, 350 ml",price:300,sips:4,alcohol:.8,pour:1.2,line:"Still in the can? Straight from the can, then."}),awamori:Object.freeze({id:"awamori",jp:"Awamori on the rocks",en:"awamori on the rocks",price:250,sips:5,alcohol:1.6,pour:1.8,line:"Awamori. Slowly -- it is older than you think."}),sake:Object.freeze({id:"sake",jp:"Warm sake, one flask",en:"a flask of warm sake",price:220,sips:5,alcohol:1.3,pour:2.4,line:"Hot sake. Careful, the tokkuri is hot."}),oolong:Object.freeze({id:"oolong",jp:"Oolong tea",en:"Oolong tea over ice",price:150,sips:4,alcohol:0,pour:1.6,line:"Oolong tea. Plenty of ice."})}),pi=Object.freeze({yakitori:Object.freeze({id:"yakitori",jp:"Assorted Yakitori",en:"a plate of yakitori",price:180,bites:4,station:"grill",cook:6,line:"Yakitori. Two tare, two salt."}),edamame:Object.freeze({id:"edamame",jp:"Edamame",en:"a bowl of edamame",price:120,bites:3,station:"prep",cook:2,line:"Edamame. Salted while they were hot."}),oden:Object.freeze({id:"oden",jp:"Oden",en:"a bowl of oden",price:260,bites:4,station:"oden",cook:3,line:"Oden. The daikon has been in since four."}),hiyayakko:Object.freeze({id:"hiyayakko",jp:"Cold tofu",en:"cold tofu with ginger",price:150,bites:3,station:"prep",cook:2,line:"It's cold tofu. Ginger and a little soy."}),dashimaki:Object.freeze({id:"dashimaki",jp:"Dashi-rolled egg",en:"a rolled dashi omelette",price:200,bites:3,station:"range",cook:5,line:"Dashi roll. Still warm in the middle."}),hokke:Object.freeze({id:"hokke",jp:"Grilled Atka mackerel",en:"grilled hokke",price:280,bites:4,station:"grill",cook:7,line:"It's Hokke. Lemon on the side."}),sashimi:Object.freeze({id:"sashimi",jp:"Assorted sashimi",en:"the sashimi plate",price:320,bites:4,station:"prep",cook:4,line:"Sashimi. Masaru brought the tuna this morning."}),agedashi:Object.freeze({id:"agedashi",jp:"Fried tofu",en:"agedashi tofu",price:180,bites:3,station:"fryer",cook:5,line:"It's fried. Mind the broth, it is hot."}),karaage:Object.freeze({id:"karaage",jp:"Fried chicken",en:"chicken karaage",price:220,bites:4,station:"fryer",cook:6,line:"It's fried chicken. Straight out of the oil."}),ochazuke:Object.freeze({id:"ochazuke",jp:"Ochazuke",en:"ochazuke to finish",price:180,bites:3,station:"range",cook:4,line:"Ochazuke. The way to end an evening."})});Object.freeze([...Object.values(pi),...Object.values(Hn)]);const io=n=>Hn[n]||pi[n]||null,Bl=Object.freeze({grill:[1.7,0,-3.6],oden:[-4.2,0,-3.6],range:[1.4,0,-5.15],fryer:[2.75,0,-5.15],prep:[5.4,0,-5.15]}),ro=Object.freeze([3.5,0,-3.8]),vy=Object.freeze({table:Object.freeze({id:"table",label:"Sit at the table",position:[3.3,0,.9],stand:[3.3,0,.25],eyeY:1.14,yaw:Math.PI,table:[3.3,.945,1.52],dish:[3.02,.945,1.5],serve:[3.95,0,.3],route:[[3.95,-3.55],[3.95,.3]]}),window:Object.freeze({id:"window",label:"Sit and enjoy the evening",position:[4,0,2.7],stand:[2.95,0,2.7],eyeY:1.2,yaw:Math.PI/2,table:[3.62,.945,2.55],dish:[3.62,.945,2.3],serve:[4,0,1.6],route:[[3.95,-3.55],[3.95,.3],[4,1.6]]}),...Object.fromEntries([-3.8,-2.3,-.8,.7,2.2].map((n,e)=>["counter"+e,Object.freeze({id:"counter"+e,label:"Sit at the counter",counter:!0,position:[n,0,-1.42],stand:[n,0,-.72],eyeY:1.32,yaw:0,table:[n+.15,1.11,-2.2],dish:[n-.12,1.11,-2.24],serve:[n,0,-3.75],route:[[n,-3.75]]})]))});function zl(n,e,t,i,r){const s=e.position.y-i/2,o=10,a=new Float32Array(o*3),l=[];for(let u=0;u<o;u++){const p=u*2.4,f=r*(.25+.7*(u*37%10)/10);a[u*3]=e.position.x+Math.cos(p)*f,a[u*3+1]=s+u*.31%1*i,a[u*3+2]=Math.sin(p)*f,l.push(.012+u*13%7*.004)}const c=new vt;c.setAttribute("position",new Nt(a,3));const h=new Dm(c,new oc({color:16773828,size:.0035,transparent:!0,opacity:.8,depthWrite:!1}));h.name="Beer bubbles",n.add(h),n.userData.pour={liquid:e,head:t,bottom:s,height:i,headHeight:t.geometry.parameters.height,bubbles:h,rise:l}}function Wg(n,e){const t=n.pour,i=n.portion,r=t.bottom+t.height*i;t.liquid.scale.y=Math.max(.001,i),t.liquid.position.y=t.bottom+t.height*i/2,t.head.visible=i>.03,t.head.scale.y=.55+.45*i,t.head.position.y=r+t.headHeight*t.head.scale.y/2;const s=t.bubbles.geometry.attributes.position;t.bubbles.visible=i>.05;for(let o=0;o<s.count;o++){let a=s.getY(o)+t.rise[o]*e*(i>.1?1:.3);a>r&&(a=t.bottom+(a-r)%Math.max(.005,r-t.bottom)),s.setY(o,a)}s.needsUpdate=!0}function Vc(n,{held:e=!1}={}){const t=new qt;t.name="Minato drink · "+n;const i=new St({color:14674148,roughness:.08,metalness:0,transparent:!0,opacity:.42,depthWrite:!1}),r=new St({color:14259230,roughness:.3,emissive:4860418,emissiveIntensity:.25}),s=new St({color:16512486,roughness:.9}),o=(l,c,h=0,u=0,p=0)=>{const f=new ht(l,c);return f.position.set(u,h,p),t.add(f),f},a=new qt;if(t.add(a),t.userData.level=a,n==="draft"){o(new Je(.045,.042,.15,20),i,.075);const l=new ht(new Je(.041,.039,.12,20),r);l.position.y=.063,a.add(l);const c=new ht(new Je(.043,.041,.025,20),s);c.position.y=.135,a.add(c),zl(t,l,c,.12,.036);const h=o(new yn(.03,.007,8,16,Math.PI),i,.08,.05);h.rotation.z=-Math.PI/2}else if(n==="bottle"){const l=new St({color:5910032,roughness:.25,transparent:!0,opacity:.48,depthWrite:!1});if(!e){o(new Je(.038,.038,.2,18),l,.1,-.06),o(new Je(.013,.036,.08,14),l,.24,-.06),o(new Je(.034,.034,.05,18),new St({color:15921384,roughness:.6}),.1,-.06);const p=new ht(new Je(.034,.034,.185,18),r);p.position.set(-.06,.095,0),a.add(p)}const c=e?0:.05;o(new Je(.03,.027,.09,16),i,.045,c);const h=new ht(new Je(.027,.025,.07,16),r);h.position.set(c,.037,0),a.add(h);const u=new ht(new Je(.028,.027,.012,16),s);u.position.set(c,.078,0),a.add(u),zl(t,h,u,.07,.022)}else if(n==="can")o(new Je(.033,.033,.122,20),new St({color:15921902,roughness:.35,metalness:.55}),.061),o(new Je(.0335,.0335,.045,20),new St({color:1986460,roughness:.4,metalness:.4}),.07),o(new Je(.0336,.0336,.008,20),new St({color:13120042,roughness:.4}),.095);else if(n==="coffee"){const l=new St({color:16052714,roughness:.35});o(new Je(.036,.028,.07,20,1,!0),new St({color:16052714,roughness:.35,side:2}),.035),o(new Je(.028,.028,.004,20),l,.002);const c=o(new yn(.017,.005,8,14,Math.PI),l,.04,.038);c.rotation.z=-Math.PI/2,e||o(new Je(.062,.055,.008,24),l,-.004);const h=new ht(new Je(.033,.028,.055,20),new St({color:2823690,roughness:.15}));h.position.y=.03,a.add(h)}else{o(new Je(.036,.032,.11,18),i,.055);const l=new ht(new Je(.033,.03,.085,18),new St({color:n==="mugicha"?11036714:8011544,roughness:.25,transparent:!0,opacity:n==="mugicha"?.78:.85}));l.position.y=.045,a.add(l);for(let c=0;c<3;c++){const h=new ht(new Mt(.022,.022,.022),i);h.position.set((c-1)*.012,.08,c%2*.01),h.rotation.set(c,c*.7,0),a.add(h)}}return t.userData.portion=1,t.userData.targetPortion=1,t.userData.consumable="drink",t.userData.rimHeight=n==="draft"?.15:n==="bottle"?.09:n==="can"?.122:n==="coffee"?.07:.11,t.traverse(l=>{l.isMesh&&(l.castShadow=!1,l.receiveShadow=!0)}),t}function Hc(n){const e=new qt;e.name="Minato dish · "+n;const t=a=>new St({color:a,roughness:.6}),i=(a,l,c=0,h=0,u=0,p=e)=>{const f=new ht(a,l);return f.position.set(c,h,u),p.add(f),f},r=new qt;e.add(r),e.userData.level=r;const s=(a,l,c=3102834)=>i(new Mt(a,.014,l),t(c),0,.007),o=(a,l,c=15854816)=>i(new Je(a,a*.7,l,16,1,!0),new St({color:c,roughness:.35,side:2}),0,l/2);if(n==="yakitori"||n==="hokke")if(s(.26,.12,15854816),n==="yakitori")for(let a=0;a<4;a++){i(new Mt(.22,.006,.006),t(10513474),0,.02,-.04+a*.027,r);for(let l=0;l<4;l++)i(new Mt(.03,.024,.024),t(a%2?8142619:14267002),-.07+l*.045,.028,-.04+a*.027,r)}else{const a=i(new Mt(.2,.025,.08),t(11565637),0,.027,0,r);a.rotation.y=.1,i(new Tt(.018,8,6),t(15917914),.09,.03,.04,r)}else if(n==="sashimi"){s(.24,.16,15854816);for(let a=0;a<6;a++)i(new Mt(.04,.018,.1),t([15370844,10366005,15721426][a%3]),-.08+a*.032,.024,0,r).rotation.y=.25;i(new Tt(.015,8,6),t(8231749),.1,.025,.05,r)}else if(n==="edamame"||n==="karaage"){o(.07,.045,3102834);for(let a=0;a<(n==="edamame"?9:6);a++){const l=a*2.3,c=.035*(a%3/2+.3);i(n==="edamame"?new Mt(.045,.014,.018):new Tt(.022,8,6),t(n==="edamame"?8231749:12088366),Math.cos(l)*c,.045,Math.sin(l)*c,r).rotation.y=l}}else if(n==="oden"||n==="agedashi"||n==="ochazuke"||n==="ramen"||n==="rice")if(o(.075,.06,n==="ochazuke"?3102834:9067066),i(new Je(.068,.068,.004,16),t(n==="ochazuke"?12034908:11039535),0,.045,0,r),n==="oden")i(new Je(.025,.025,.03,12),t(14930854),-.025,.05,0,r),i(new Tt(.02,8,6),t(12159562),.025,.052,.01,r);else if(n==="agedashi")for(let a=0;a<2;a++)i(new Mt(.04,.03,.04),t(14132570),-.02+a*.04,.05,0,r);else if(n==="ramen"||n==="rice")for(let a=0;a<6;a++)i(new Tt(.016,8,6),t(15257466),(a%3-1)*.025,.052,Math.floor(a/3)*.025-.012,r);else i(new Mt(.05,.004,.05),t(2042402),0,.05,0,r);else if(n==="hiyayakko")s(.12,.12,3102834),i(new Mt(.07,.04,.07),t(15854816),0,.035,0,r),i(new Mt(.02,.01,.02),t(14267226),0,.06,0,r);else if(n==="gyoza"){s(.22,.12,15854816);for(let a=0;a<6;a++)i(new Tt(.024,8,6),t(14267002),-.08+a*.032,.022,0,r).scale.set(.8,.6,1.4)}else{s(.2,.1,15854816);for(let a=0;a<4;a++)i(new Mt(.035,.035,.06),t(15780170),-.06+a*.04,.03,0,r)}return e.userData.portion=1,e.userData.targetPortion=1,e.userData.consumable="food",e.traverse(a=>{a.isMesh&&(a.castShadow=!1,a.receiveShadow=!0)}),e}function rn(n,e,{immediate:t=!1}={}){const i=Ue.clamp(Number(e)||0,0,1);n.userData.targetPortion=i,t&&(n.userData.portion=i,Mi(n,0))}function Mi(n,e){const t=n.userData,i=t.level;if(!i)return;const r=t.targetPortion??1,s=t.portion??1;if(t.portion=Math.abs(s-r)<.001?r:Ue.damp(s,r,7,Math.max(0,e)),i.visible=t.portion>0,t.consumable==="food"){const o=i.children.length*t.portion;i.children.forEach((a,l)=>{a.visible=l<Math.ceil(o),a.scale.setScalar(Math.min(1,Math.max(0,o-l)))})}else if(t.pour){i.scale.y=1,Wg(t,e);for(const o of i.children)o!==t.pour.liquid&&o!==t.pour.head&&(o.userData.baseY??=o.position.y,o.scale.y=Math.max(.001,t.portion),o.position.y=o.userData.baseY*t.portion)}else i.scale.y=Math.max(.001,t.portion)}function Xg(n){const e=new qt;e.userData.food=!0,e.userData.consumable="food",e.userData.portion=1,e.userData.targetPortion=1;const t=new St({color:13214315,roughness:.6});for(const s of[-.008,.008]){const o=new ht(new Mt(.005,.005,.16),t);o.position.set(s,.02,.04),e.add(o)}const i=new qt;e.add(i),e.userData.level=i;const r=new ht(new Tt(.018,8,6),new St({color:n==="edamame"?8231749:n==="sashimi"?15370844:14267002,roughness:.6}));return r.position.set(0,.04,.1),i.add(r),e}function So(n){if(!n)return;n.removeFromParent();const e=new Set;n.traverse(t=>{if(t.isMesh){t.geometry.dispose();for(const i of Array.isArray(t.material)?t.material:[t.material])e.add(i)}}),e.forEach(t=>t.dispose())}function by({room:n,getNao:e,blocked:t,say:i=()=>{}}){let r=null,s=null,o=null,a=0;function l(d){if(d)for(const y of["playerService","heldItem","socialPose","carrying"])delete d.userData[y]}function c(d,y,b){for(;y.length;){const[M,D]=y[0],R=M-d.position.x,A=D-d.position.z,T=Math.hypot(R,A);if(T<.03){y.shift();continue}const S=Math.atan2(-R,-A),x=Math.atan2(Math.sin(S-d.rotation.y),Math.cos(S-d.rotation.y));if(d.rotation.y+=Math.max(-b*5,Math.min(b*5,x)),Math.abs(x)<.9){const v=Math.min(T,b*1.15*(1-Math.abs(x)/1.2));d.position.x+=R/T*v,d.position.z+=A/T*v}return!1}return!0}const h=d=>{d&&(d.prop.removeFromParent(),d.prop.traverse(y=>{y.isMesh&&(y.geometry.dispose(),y.material.dispose?.())}))};function u(){h(s),s=null}function p(){h(o),o=null}const f=(d,y,b)=>{d.rotation.y=Math.atan2(-(y-d.position.x),-(b-d.position.z))},g=()=>[ro[0],ro[2]];function _(d,y){if(Hn[d]){u();const b=Vc(d);b.position.set(...y.table),n.add(b),s={kind:d,left:Hn[d].sips,prop:b}}else{p();const b=Hc(d);b.position.set(...y.dish||y.table),n.add(b),o={kind:d,left:pi[d].bites,prop:b}}a++}function m(d,y){d.left=Math.max(0,d.left-1),rn(d.prop,d.left/y)}return{get pending(){return r?{kind:r.kind,phase:r.phase}:null},get drink(){return s?{kind:s.kind,left:s.left,sips:Hn[s.kind].sips}:null},get dish(){return o?{kind:o.kind,left:o.left,bites:pi[o.kind].bites}:null},get served(){return a},order(d,y){const b=io(d),M=e();if(!b||!y||r||!M)return!1;const D=!!pi[d];return r={kind:d,seat:y,phase:D?"cooking":"pouring",timer:D?b.cook:b.pour,path:D?[[Bl[b.station][0],Bl[b.station][2]]]:null},M.userData.playerService=!0,M.userData.socialPose="Use",M.userData.activity=D?"cooking "+b.en+" for you":"pouring "+b.en.toLowerCase()+" for you",!0},sip(){if(!s||s.left<=0)return null;s.left=Math.max(0,s.left-1);const d=Hn[s.kind];s.prop.userData.level,rn(s.prop,s.left/d.sips);const y={kind:s.kind,left:s.left,alcohol:d.alcohol/d.sips};if(s.left===0){const b=s;setTimeout(()=>{s===b&&u()},1500)}return y},bite(){if(!o||o.left<=0)return null;m(o,pi[o.kind].bites);const d={kind:o.kind,left:o.left};if(o.left===0){const y=o;setTimeout(()=>{o===y&&p()},2500)}return d},serveNow(d,y){return!io(d)||!y?.table?!1:(_(d,y),!0)},update(d){if(s&&Mi(s.prop,d),o&&Mi(o.prop,d),!r)return;const y=e();if(!y){r=null;return}const b=io(r.kind),{seat:M}=r;if(r.phase==="cooking"){if(r.path.length){delete y.userData.socialPose,c(y,r.path,d);return}y.userData.socialPose="Use",(r.timer-=d)<=0&&(r.path=[...M.counter?[]:[g()],...M.route].map(D=>[...D]),r.phase="carrying",y.userData.heldItem="tray",delete y.userData.socialPose,y.userData.carrying=!0,y.userData.activity="bringing your "+b.en.replace(/^(a|an|the) /,""))}else if(r.phase==="pouring")y.userData.socialPose="Use",(r.timer-=d)<=0&&(r.path=M.route.map(D=>[...D]),r.phase="carrying",y.userData.heldItem=r.kind==="oolong"?"tea":"beer",delete y.userData.socialPose,y.userData.carrying=!0,y.userData.activity="bringing your drink");else if(r.phase==="carrying"){delete y.userData.socialPose;const D=Hn[r.kind]?M.table:M.dish||M.table;c(y,r.path,d)&&(f(y,D[0],D[2]),r.phase="placing",r.timer=1.1,y.userData.socialPose="CarryIdle")}else r.phase==="placing"?(r.timer-=d)<=0&&(_(r.kind,M),delete y.userData.heldItem,delete y.userData.carrying,y.userData.socialPose="Greet",i("Nao: "+b.line,4),r.phase="bowing",r.timer=.9):r.phase==="bowing"?(r.timer-=d)<=0&&(delete y.userData.socialPose,r.path=[...M.route.slice(0,-1).reverse(),g()].map(D=>[...D]),r.phase="returning",y.userData.activity="back to the counter"):r.phase==="returning"&&(delete y.userData.socialPose,c(y,r.path,d)&&(y.rotation.set(0,Math.PI,0),l(y),r=null))},clear(){const d=e();r&&d&&(d.position.set(...ro),d.rotation.set(0,Math.PI,0),l(d)),r=null,u(),p()},place(d,y){_(d,y)}}}const Wc="johansson-town-avatar";function Yg(n=globalThis.localStorage){try{const e=n?.getItem(Wc);if(e){const t=Vo(e);if(t)return t}}catch{}return vo.Johansson}function qg(n,e=globalThis.localStorage){const t=Mc(n);try{e?.setItem(Wc,t)}catch{}return t}const jg=.2,Kg=["Wake","Sit","Type","Eat","Drink","Sleep","Soak"];function My(){try{const n=new URL(location.href),e=n.searchParams.get("avatar");if(!e)return null;const t=Vo(e);return n.searchParams.delete("avatar"),history.replaceState(history.state,"",n.href),t&&qg(t),t}catch{return null}}function xy(n,e,{shadows:t=!1}={}){const i=Tg(e),r=_o(i,{shadows:t,faceSize:e==="Thuan"?512:256});for(const s of n.children)s.visible=!1;return n.add(r.root),n.userData.visualReady=!0,n.userData.visualSource="Shimanchu · "+(i.name||e),{isAvatar:!0,avatar:r,animator:xo(r),entity:n,model:r.root,mixer:null,actions:new Map,current:null,last:n.position.clone(),gestureTime:0,speed:0,moving:!1,wasVisible:!0,height:r.height,isThuan:e==="Thuan",outfit:"clothes"}}function Sy(n,e,t=performance.now()){const{entity:i,avatar:r}=n,s=i.userData;let o=!0;for(let b=i;b;b=b.parent)if(!b.visible){o=!1;break}if(!o){n.last.copy(i.position),n.speed=0,n.moving=!1,n.wasVisible=!1;return}const a=Math.hypot(i.position.x-n.last.x,i.position.z-n.last.z);n.last.copy(i.position);const l=!n.wasVisible||a>1;n.wasVisible=!0;const c=l||Number.isFinite(s.chairBlend)?0:a/Math.max(e,.001);n.speed=Ue.damp(n.speed,c,20,e),n.moving=n.speed>(n.moving?.03:.07),n.gestureTime=Math.max(0,n.gestureTime-e);const h=s.outfit==="swim"?"swim":n.isThuan?s.alternativeOutfit||"clothes":s.outfit||"clothes";n.outfit!==h&&(r.wear(h),n.outfit=h);const u=!s.hatOff;n.hatOn!==u&&(r.setHat?.(u),n.hatOn=u);const p=!!(s.playerControlled&&n.isThuan),f=!p&&(Number.isFinite(s.seatHeight)&&Kg.includes(s.socialPose)||Number.isFinite(s.chairBlend)&&s.chairBlend>.5),g=s.thuanMood,_=g&&g.until>t?g.expression:null,m=!!(s.playerConversation||s.chat||n.gestureTime),d=Number(s.sleepBlend)>.28||s.sleeping&&!s.roomTransition;n.animator.update(e,{speed:n.moving?n.speed:0,running:n.speed>3.2,seated:f,seatHeight:s.seatHeight,floorHeight:(Number(s.floorHeight)||0)+(s.socialPose==="CounterIdle"?jg:0),pose:s.socialPose,seat:s.socialPose,riding:p,ridePhase:s.bicyclePhase||0,bicycleFit:s.bicycleFit,carrying:!!s.carrying,heldProp:n.heldProp,waving:!!(s.chat?.greeting||n.gestureTime>0&&!n.waved),talking:!!(s.chat?.speaking||s.speakingUntil>t),expression:s.thuanExpression||_||(m?"smile":"neutral"),sleeping:d,gaze:Array.isArray(s.lookTarget)?s.lookTarget:null,consumeElapsed:s.consumeElapsed,tipsy:s.tipsy||0});const y=s.heldItem||(["Drink","DrinkStanding"].includes(s.socialPose)?"beer":s.socialPose==="Eat"?"rice":null);if(n.heldKind!==y){So(n.heldProp),So(n.dishProp),n.heldProp=null,n.dishProp=null,n.heldKind=y,n.portion=1,n.consumedCycle=-1;const b={beer:"draft",tea:"oolong",cup:"oolong",coffee:"coffee",mugicha:"mugicha",can:"can",bottle:"bottle",draft:"draft",oolong:"oolong",awamori:"awamori",sake:"sake"},M=["rice","bun","ramen","fish","yakitori","gyoza","edamame","sashimi","oden","hiyayakko","dashimaki","agedashi","karaage","ochazuke","chopsticks"];b[y]?n.heldProp=Vc(b[y],{held:!0}):M.includes(y)&&(n.heldProp=Xg(y),y!=="bun"&&y!=="chopsticks"&&(n.dishProp=Hc(y==="fish"?"hokke":y),n.dishProp.userData.food=!0,r.bones.handL.add(n.dishProp))),n.heldProp&&r.bones.handR.add(n.heldProp),n.heldProp&&Number.isFinite(s.heldPortion)&&rn(n.heldProp,s.heldPortion,{immediate:!0}),n.dishProp&&Number.isFinite(s.foodPortion)&&rn(n.dishProp,s.foodPortion,{immediate:!0})}if(n.heldProp){const b=n.animator.consumption;b&&!Number.isFinite(s.heldPortion)&&b.swallow>.5&&n.consumedCycle!==b.cycle&&(n.consumedCycle=b.cycle,n.portion=Math.max(0,n.portion-(b.food?.25:1/6)),rn(n.heldProp,b.food?0:n.portion),n.dishProp&&rn(n.dishProp,n.portion)),Number.isFinite(s.heldPortion)?rn(n.heldProp,s.heldPortion):b?.food&&b.swallow===0&&n.portion>0&&rn(n.heldProp,1),Mi(n.heldProp,e),ts(r,n.heldProp,b?.lift||0),n.dishProp&&(Number.isFinite(s.foodPortion)&&rn(n.dishProp,s.foodPortion),Mi(n.dishProp,e),ts(r,n.dishProp,0,"L"))}n.gestureTime>0?n.waved=!0:n.waved=!1}function wy(n,e=new P){const t=n.avatar.bones.head,i=n.avatar.measure;return t.getWorldPosition(e),e.y+=(i.headCentre-i.headY)*.95,e}function Ty({scene:n,recipe:e=Yg()}={}){const t=new qt;t.name="Johansson (third person)",t.visible=!1,n.add(t);let i=_o(e,{shadows:!0,faceSize:512}),r=xo(i);t.add(i.root);let s="neutral",o=0,a=0,l=0,c="Sit",h="clothes",u=null,p=null,f=null;const g=()=>i.bones.handR,_={root:t,loading:Promise.resolve(!0),get ready(){return!0},get move(){return f},get expression(){return s},get weights(){return{}},get actions(){return[...Object.keys(Ji),"Idle","Walk","Run","Sit","SitEat","Soak","Fall"]},get avatar(){return i},play(m,{face:d}={}){f=m,d&&_.express(d,3);const y={Bow:"Bow",Wave:"Wave"};r.play(y[m]||m)||r.play("Nod");const b={Wave:"happy",Clap:"happy",Kachashi:"laugh",Laugh:"laugh",Think:"thinking",Shrug:"worried",HeadShake:"grumpy",Bow:"content",Nod:"content",Stretch:"content",LookAround:"surprised",SitToast:"happy"};b[m]&&_.express(b[m],(Ji[m]===1/0?4:Ji[m]||2)+.6)},express(m,d=3){s=m,o=d>0?l+d:0},speak(m=2){a=Math.max(a,l+m)},lookAt(m){p=m?m.clone?.()||m:null},seat(m="Sit"){c=m},wear(m){h=m==="swim"?"swim":"clothes",i.wear(h)},get outfit(){return h},get lens(){const m=i.measure;return{eye:m.H+.14,side:m.Rh*m.headSX+.26,head:m.headCentre}},get sitHip(){const m=i.measure;return m.hipY+.09-m.seatDrop},hold(m){u&&(u.userData.consumable?So(u):u.removeFromParent()),u=m||null,u&&(u.position.set(0,-i.measure.hand*.4,i.measure.hand*.6),g().add(u),u.userData.consumable&&ts(i,u))},jump(){r.play("Jump")},stop(){r.stop(),f=null},setRecipe(m){const d=Ht(m);i.root.removeFromParent(),i.dispose(),i=_o(d,{shadows:!0,faceSize:512}),r=xo(i),t.add(i.root),i.wear(h),u&&g().add(u)},update(m,d={}){if(l+=m,t.visible=!!d.visible,o&&l>o&&(s="neutral",o=0),r.gesture||(f=null),r.update(m,{speed:d.speed||0,running:!!d.running,seated:!!d.seated,seatHeight:d.seated?i.measure.hipY-i.measure.seatDrop:void 0,seat:c,airborne:!!d.airborne,talking:l<a,expression:s,gaze:p,heldProp:u,tipsy:d.tipsy||0}),d.seated&&(i.root.position.y=0),u?.userData.consumable){const y=r.consumption;y&&u.userData.finishPortion!==void 0&&rn(u,Ue.lerp(u.userData.startPortion,u.userData.finishPortion,y.swallow)),Mi(u,m),ts(i,u,y?.lift||0)}}};return _}export{yn as $,P_ as A,Mt as B,Ie as C,G_ as D,mc as E,Zg as F,qt as G,O_ as H,gc as I,rs as J,__ as K,h_ as L,ht as M,d_ as N,Jl as O,nr as P,gt as Q,r_ as R,R_ as S,_c as T,Ue as U,ie as V,A_ as W,ko as X,Cg as Y,Fc as Z,Ag as _,Gt as a,Xr as a$,Kr as a0,ss as a1,e_ as a2,Dm as a3,j_ as a4,oy as a5,k_ as a6,w_ as a7,K0 as a8,Pg as a9,V_ as aA,T0 as aB,N_ as aC,xi as aD,B_ as aE,nl as aF,H_ as aG,Am as aH,c_ as aI,u_ as aJ,l_ as aK,o_ as aL,oc as aM,bn as aN,Im as aO,ct as aP,Gr as aQ,K_ as aR,L_ as aS,sc as aT,I_ as aU,Vt as aV,Po as aW,U_ as aX,rc as aY,v_ as aZ,b_ as a_,ay as aa,Ul as ab,uy as ac,Xo as ad,xo as ae,Ji as af,vo as ag,X_ as ah,lm as ai,S_ as aj,Ht as ak,Do as al,z_ as am,ao as an,Rm as ao,C_ as ap,s_ as aq,E0 as ar,bi as as,So as at,rn as au,Vc as av,Hc as aw,Mi as ax,a_ as ay,Ai as az,_o as b,Jg as b$,Ct as b0,Zr as b1,Jr as b2,ls as b3,Qe as b4,as as b5,In as b6,vn as b7,M_ as b8,x_ as b9,J_ as bA,Mc as bB,Vo as bC,Z_ as bD,$_ as bE,sy as bF,cy as bG,ty as bH,Ug as bI,Ri as bJ,gy as bK,my as bL,py as bM,fy as bN,dy as bO,io as bP,wy as bQ,Sy as bR,xy as bS,f0 as bT,ze as bU,f_ as bV,Zl as bW,y_ as bX,p_ as bY,ql as bZ,t_ as b_,xg as ba,ly as bb,iy as bc,ry as bd,T_ as be,Q_ as bf,D_ as bg,Ro as bh,pi as bi,Hn as bj,vy as bk,ny as bl,kg as bm,zn as bn,Dc as bo,$g as bp,F_ as bq,g_ as br,m_ as bs,E_ as bt,i_ as bu,Gc as bv,V0 as bw,ft as bx,G0 as by,Wn as bz,_y as c,hy as c0,My as c1,nc as c2,W_ as c3,n_ as c4,Wr as c5,Ty as c6,by as c7,yy as c8,Xg as c9,ey as ca,qg as cb,Ln as d,P as e,St as f,Je as g,Tt as h,Qg as i,No as j,Fo as k,Nm as l,Eo as m,yt as n,q_ as o,Yg as p,Y_ as q,Tg as r,Be as s,tn as t,Vr as u,vt as v,Ye as w,Nt as x,Fm as y,hc as z};
