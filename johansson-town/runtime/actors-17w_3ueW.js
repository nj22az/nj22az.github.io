/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const n_=1;const i_=0,r_=1,s_=2;const o_=2;const a_=0;const l_=6;const na="attached",Zc="detached";const c_=303;const h_=1e3,u_=1001,d_=1002,f_=1003,p_=1004,m_=1005,g_=1006,__=1007,y_=1008,v_=1009;const b_=1014,M_=1015,x_=1016;const S_=1023;const w_=1026;const T_=2300,E_=2301;const A_=1,R_=2;const C_=3201;const P_="",Ot="srgb",Ai="srgb-linear",ss="linear",lt="srgb";const L_=35048,ia="300 es";class Ri{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const i=this._listeners;return i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const r=this._listeners[e];if(r!==void 0){const s=r.indexOf(t);s!==-1&&r.splice(s,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const i=this._listeners[e.type];if(i!==void 0){e.target=this;const r=i.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,e);e.target=null}}}const Lt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let ra=1234567;const Ji=Math.PI/180,xi=180/Math.PI;function jt(){const n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Lt[n&255]+Lt[n>>8&255]+Lt[n>>16&255]+Lt[n>>24&255]+"-"+Lt[e&255]+Lt[e>>8&255]+"-"+Lt[e>>16&15|64]+Lt[e>>24&255]+"-"+Lt[t&63|128]+Lt[t>>8&255]+"-"+Lt[t>>16&255]+Lt[t>>24&255]+Lt[i&255]+Lt[i>>8&255]+Lt[i>>16&255]+Lt[i>>24&255]).toLowerCase()}function Tt(n,e,t){return Math.max(e,Math.min(t,n))}function Ao(n,e){return(n%e+e)%e}function $c(n,e,t,i,r){return i+(n-e)*(r-i)/(t-e)}function Qc(n,e,t){return n!==e?(t-n)/(e-n):0}function Zi(n,e,t){return(1-t)*n+t*e}function eh(n,e,t,i){return Zi(n,e,1-Math.exp(-t*i))}function th(n,e=1){return e-Math.abs(Ao(n,e*2)-e)}function nh(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*(3-2*n))}function ih(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*n*(n*(n*6-15)+10))}function rh(n,e){return n+Math.floor(Math.random()*(e-n+1))}function sh(n,e){return n+Math.random()*(e-n)}function oh(n){return n*(.5-Math.random())}function ah(n){n!==void 0&&(ra=n);let e=ra+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function lh(n){return n*Ji}function ch(n){return n*xi}function hh(n){return(n&n-1)===0&&n!==0}function uh(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function dh(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function fh(n,e,t,i,r){const s=Math.cos,o=Math.sin,a=s(t/2),l=o(t/2),c=s((e+i)/2),h=o((e+i)/2),u=s((e-i)/2),p=o((e-i)/2),f=s((i-e)/2),g=o((i-e)/2);switch(r){case"XYX":n.set(a*h,l*u,l*p,a*c);break;case"YZY":n.set(l*p,a*h,l*u,a*c);break;case"ZXZ":n.set(l*u,l*p,a*h,a*c);break;case"XZX":n.set(a*h,l*g,l*f,a*c);break;case"YXY":n.set(l*f,a*h,l*g,a*c);break;case"ZYZ":n.set(l*g,l*f,a*h,a*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+r)}}function en(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function at(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}const ke={DEG2RAD:Ji,RAD2DEG:xi,generateUUID:jt,clamp:Tt,euclideanModulo:Ao,mapLinear:$c,inverseLerp:Qc,lerp:Zi,damp:eh,pingpong:th,smoothstep:nh,smootherstep:ih,randInt:rh,randFloat:sh,randFloatSpread:oh,seededRandom:ah,degToRad:lh,radToDeg:ch,isPowerOfTwo:hh,ceilPowerOfTwo:uh,floorPowerOfTwo:dh,setQuaternionFromProperEuler:fh,normalize:at,denormalize:en};class re{constructor(e=0,t=0){re.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6],this.y=r[1]*t+r[4]*i+r[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(Tt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),r=Math.sin(t),s=this.x-e.x,o=this.y-e.y;return this.x=s*i-o*r+e.x,this.y=s*r+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ye{constructor(e,t,i,r,s,o,a,l,c){Ye.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,o,a,l,c)}set(e,t,i,r,s,o,a,l,c){const h=this.elements;return h[0]=e,h[1]=r,h[2]=a,h[3]=t,h[4]=s,h[5]=l,h[6]=i,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,r=t.elements,s=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],h=i[4],u=i[7],p=i[2],f=i[5],g=i[8],_=r[0],m=r[3],d=r[6],v=r[1],M=r[4],x=r[7],D=r[2],R=r[5],A=r[8];return s[0]=o*_+a*v+l*D,s[3]=o*m+a*M+l*R,s[6]=o*d+a*x+l*A,s[1]=c*_+h*v+u*D,s[4]=c*m+h*M+u*R,s[7]=c*d+h*x+u*A,s[2]=p*_+f*v+g*D,s[5]=p*m+f*M+g*R,s[8]=p*d+f*x+g*A,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8];return t*o*h-t*a*c-i*s*h+i*a*l+r*s*c-r*o*l}invert(){const e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=h*o-a*c,p=a*l-h*s,f=c*s-o*l,g=t*u+i*p+r*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/g;return e[0]=u*_,e[1]=(r*c-h*i)*_,e[2]=(a*i-r*o)*_,e[3]=p*_,e[4]=(h*t-r*l)*_,e[5]=(r*s-a*t)*_,e[6]=f*_,e[7]=(i*l-c*t)*_,e[8]=(o*t-i*s)*_,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,r,s,o,a){const l=Math.cos(s),c=Math.sin(s);return this.set(i*l,i*c,-i*(l*o+c*a)+o+e,-r*c,r*l,-r*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(_s.makeScale(e,t)),this}rotate(e){return this.premultiply(_s.makeRotation(-e)),this}translate(e,t){return this.premultiply(_s.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let r=0;r<9;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const _s=new Ye;function Hl(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function tr(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function ph(){const n=tr("canvas");return n.style.display="block",n}const sa={};function ji(n){n in sa||(sa[n]=!0,console.warn(n))}function mh(n,e,t){return new Promise(function(i,r){function s(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:r();break;case n.TIMEOUT_EXPIRED:setTimeout(s,t);break;default:i()}}setTimeout(s,t)})}function gh(n){const e=n.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function _h(n){const e=n.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const Qe={enabled:!0,workingColorSpace:Ai,spaces:{},convert:function(n,e,t){return this.enabled===!1||e===t||!e||!t||(this.spaces[e].transfer===lt&&(n.r=yn(n.r),n.g=yn(n.g),n.b=yn(n.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(n.applyMatrix3(this.spaces[e].toXYZ),n.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===lt&&(n.r=yi(n.r),n.g=yi(n.g),n.b=yi(n.b))),n},fromWorkingColorSpace:function(n,e){return this.convert(n,this.workingColorSpace,e)},toWorkingColorSpace:function(n,e){return this.convert(n,e,this.workingColorSpace)},getPrimaries:function(n){return this.spaces[n].primaries},getTransfer:function(n){return n===""?ss:this.spaces[n].transfer},getLuminanceCoefficients:function(n,e=this.workingColorSpace){return n.fromArray(this.spaces[e].luminanceCoefficients)},define:function(n){Object.assign(this.spaces,n)},_getMatrix:function(n,e,t){return n.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(n){return this.spaces[n].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(n=this.workingColorSpace){return this.spaces[n].workingColorSpaceConfig.unpackColorSpace}};function yn(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function yi(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}const oa=[.64,.33,.3,.6,.15,.06],aa=[.2126,.7152,.0722],la=[.3127,.329],ca=new Ye().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),ha=new Ye().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);Qe.define({[Ai]:{primaries:oa,whitePoint:la,transfer:ss,toXYZ:ca,fromXYZ:ha,luminanceCoefficients:aa,workingColorSpaceConfig:{unpackColorSpace:Ot},outputColorSpaceConfig:{drawingBufferColorSpace:Ot}},[Ot]:{primaries:oa,whitePoint:la,transfer:lt,toXYZ:ca,fromXYZ:ha,luminanceCoefficients:aa,outputColorSpaceConfig:{drawingBufferColorSpace:Ot}}});let Jn;class yh{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{Jn===void 0&&(Jn=tr("canvas")),Jn.width=e.width,Jn.height=e.height;const i=Jn.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),t=Jn}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=tr("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const r=i.getImageData(0,0,e.width,e.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=yn(s[o]/255)*255;return i.putImageData(r,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(yn(t[i]/255)*255):t[i]=yn(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let vh=0;class Wl{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:vh++}),this.uuid=jt(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push(ys(r[o].image)):s.push(ys(r[o]))}else s=ys(r);i.url=s}return t||(e.images[this.uuid]=i),i}}function ys(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?yh.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let bh=0;class Ct extends Ri{constructor(e=Ct.DEFAULT_IMAGE,t=Ct.DEFAULT_MAPPING,i=1001,r=1001,s=1006,o=1008,a=1023,l=1009,c=Ct.DEFAULT_ANISOTROPY,h=""){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:bh++}),this.uuid=jt(),this.name="",this.source=new Wl(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=r,this.magFilter=s,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new re(0,0),this.repeat=new re(1,1),this.center=new re(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ye,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case 1e3:e.x=e.x-Math.floor(e.x);break;case 1001:e.x=e.x<0?0:1;break;case 1002:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case 1e3:e.y=e.y-Math.floor(e.y);break;case 1001:e.y=e.y<0?0:1;break;case 1002:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Ct.DEFAULT_IMAGE=null;Ct.DEFAULT_MAPPING=300;Ct.DEFAULT_ANISOTROPY=1;class tt{constructor(e=0,t=0,i=0,r=1){tt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=r}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,r){return this.x=e,this.y=t,this.z=i,this.w=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,r=this.z,s=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*r+o[12]*s,this.y=o[1]*t+o[5]*i+o[9]*r+o[13]*s,this.z=o[2]*t+o[6]*i+o[10]*r+o[14]*s,this.w=o[3]*t+o[7]*i+o[11]*r+o[15]*s,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,r,s;const l=e.elements,c=l[0],h=l[4],u=l[8],p=l[1],f=l[5],g=l[9],_=l[2],m=l[6],d=l[10];if(Math.abs(h-p)<.01&&Math.abs(u-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+p)<.1&&Math.abs(u+_)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+d-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const M=(c+1)/2,x=(f+1)/2,D=(d+1)/2,R=(h+p)/4,A=(u+_)/4,w=(g+m)/4;return M>x&&M>D?M<.01?(i=0,r=.707106781,s=.707106781):(i=Math.sqrt(M),r=R/i,s=A/i):x>D?x<.01?(i=.707106781,r=0,s=.707106781):(r=Math.sqrt(x),i=R/r,s=w/r):D<.01?(i=.707106781,r=.707106781,s=0):(s=Math.sqrt(D),i=A/s,r=w/s),this.set(i,r,s,t),this}let v=Math.sqrt((m-g)*(m-g)+(u-_)*(u-_)+(p-h)*(p-h));return Math.abs(v)<.001&&(v=1),this.x=(m-g)/v,this.y=(u-_)/v,this.z=(p-h)/v,this.w=Math.acos((c+f+d-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Mh extends Ri{constructor(e=1,t=1,i={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new tt(0,0,e,t),this.scissorTest=!1,this.viewport=new tt(0,0,e,t);const r={width:e,height:t,depth:1};i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:1006,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},i);const s=new Ct(r,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace);s.flipY=!1,s.generateMipmaps=i.generateMipmaps,s.internalFormat=i.internalFormat,this.textures=[];const o=i.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=e,this.textures[r].image.height=t,this.textures[r].image.depth=i;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let i=0,r=e.textures.length;i<r;i++)this.textures[i]=e.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new Wl(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class qn extends Mh{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class Xl extends Ct{constructor(e=null,t=1,i=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class xh extends Ct{constructor(e=null,t=1,i=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:r},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class _t{constructor(e=0,t=0,i=0,r=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=r}static slerpFlat(e,t,i,r,s,o,a){let l=i[r+0],c=i[r+1],h=i[r+2],u=i[r+3];const p=s[o+0],f=s[o+1],g=s[o+2],_=s[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u;return}if(a===1){e[t+0]=p,e[t+1]=f,e[t+2]=g,e[t+3]=_;return}if(u!==_||l!==p||c!==f||h!==g){let m=1-a;const d=l*p+c*f+h*g+u*_,v=d>=0?1:-1,M=1-d*d;if(M>Number.EPSILON){const D=Math.sqrt(M),R=Math.atan2(D,d*v);m=Math.sin(m*R)/D,a=Math.sin(a*R)/D}const x=a*v;if(l=l*m+p*x,c=c*m+f*x,h=h*m+g*x,u=u*m+_*x,m===1-a){const D=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=D,c*=D,h*=D,u*=D}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,i,r,s,o){const a=i[r],l=i[r+1],c=i[r+2],h=i[r+3],u=s[o],p=s[o+1],f=s[o+2],g=s[o+3];return e[t]=a*g+h*u+l*f-c*p,e[t+1]=l*g+h*p+c*u-a*f,e[t+2]=c*g+h*f+a*p-l*u,e[t+3]=h*g-a*u-l*p-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,r){return this._x=e,this._y=t,this._z=i,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,r=e._y,s=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(i/2),h=a(r/2),u=a(s/2),p=l(i/2),f=l(r/2),g=l(s/2);switch(o){case"XYZ":this._x=p*h*u+c*f*g,this._y=c*f*u-p*h*g,this._z=c*h*g+p*f*u,this._w=c*h*u-p*f*g;break;case"YXZ":this._x=p*h*u+c*f*g,this._y=c*f*u-p*h*g,this._z=c*h*g-p*f*u,this._w=c*h*u+p*f*g;break;case"ZXY":this._x=p*h*u-c*f*g,this._y=c*f*u+p*h*g,this._z=c*h*g+p*f*u,this._w=c*h*u-p*f*g;break;case"ZYX":this._x=p*h*u-c*f*g,this._y=c*f*u+p*h*g,this._z=c*h*g-p*f*u,this._w=c*h*u+p*f*g;break;case"YZX":this._x=p*h*u+c*f*g,this._y=c*f*u+p*h*g,this._z=c*h*g-p*f*u,this._w=c*h*u-p*f*g;break;case"XZY":this._x=p*h*u-c*f*g,this._y=c*f*u-p*h*g,this._z=c*h*g+p*f*u,this._w=c*h*u+p*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,r=Math.sin(i);return this._x=e.x*r,this._y=e.y*r,this._z=e.z*r,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],r=t[4],s=t[8],o=t[1],a=t[5],l=t[9],c=t[2],h=t[6],u=t[10],p=i+a+u;if(p>0){const f=.5/Math.sqrt(p+1);this._w=.25/f,this._x=(h-l)*f,this._y=(s-c)*f,this._z=(o-r)*f}else if(i>a&&i>u){const f=2*Math.sqrt(1+i-a-u);this._w=(h-l)/f,this._x=.25*f,this._y=(r+o)/f,this._z=(s+c)/f}else if(a>u){const f=2*Math.sqrt(1+a-i-u);this._w=(s-c)/f,this._x=(r+o)/f,this._y=.25*f,this._z=(l+h)/f}else{const f=2*Math.sqrt(1+u-i-a);this._w=(o-r)/f,this._x=(s+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Tt(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const r=Math.min(1,t/i);return this.slerp(e,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,r=e._y,s=e._z,o=e._w,a=t._x,l=t._y,c=t._z,h=t._w;return this._x=i*h+o*a+r*c-s*l,this._y=r*h+o*l+s*a-i*c,this._z=s*h+o*c+i*l-r*a,this._w=o*h-i*a-r*l-s*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const i=this._x,r=this._y,s=this._z,o=this._w;let a=o*e._w+i*e._x+r*e._y+s*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=i,this._y=r,this._z=s,this;const l=1-a*a;if(l<=Number.EPSILON){const f=1-t;return this._w=f*o+t*this._w,this._x=f*i+t*this._x,this._y=f*r+t*this._y,this._z=f*s+t*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,a),u=Math.sin((1-t)*h)/c,p=Math.sin(t*h)/c;return this._w=o*u+this._w*p,this._x=i*u+this._x*p,this._y=r*u+this._y*p,this._z=s*u+this._z*p,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),r=Math.sqrt(1-i),s=Math.sqrt(i);return this.set(r*Math.sin(e),r*Math.cos(e),s*Math.sin(t),s*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class P{constructor(e=0,t=0,i=0){P.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(ua.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(ua.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6]*r,this.y=s[1]*t+s[4]*i+s[7]*r,this.z=s[2]*t+s[5]*i+s[8]*r,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,r=this.z,s=e.elements,o=1/(s[3]*t+s[7]*i+s[11]*r+s[15]);return this.x=(s[0]*t+s[4]*i+s[8]*r+s[12])*o,this.y=(s[1]*t+s[5]*i+s[9]*r+s[13])*o,this.z=(s[2]*t+s[6]*i+s[10]*r+s[14])*o,this}applyQuaternion(e){const t=this.x,i=this.y,r=this.z,s=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*r-a*i),h=2*(a*t-s*r),u=2*(s*i-o*t);return this.x=t+l*c+o*u-a*h,this.y=i+l*h+a*c-s*u,this.z=r+l*u+s*h-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,r=this.z,s=e.elements;return this.x=s[0]*t+s[4]*i+s[8]*r,this.y=s[1]*t+s[5]*i+s[9]*r,this.z=s[2]*t+s[6]*i+s[10]*r,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,r=e.y,s=e.z,o=t.x,a=t.y,l=t.z;return this.x=r*l-s*a,this.y=s*o-i*l,this.z=i*a-r*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return vs.copy(this).projectOnVector(e),this.sub(vs)}reflect(e){return this.sub(vs.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(Tt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,r=this.z-e.z;return t*t+i*i+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const r=Math.sin(t)*e;return this.x=r*Math.sin(i),this.y=Math.cos(t)*e,this.z=r*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),r=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=r,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const vs=new P,ua=new _t;class In{constructor(e=new P(1/0,1/0,1/0),t=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint(Zt.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint(Zt.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=Zt.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const s=i.getAttribute("position");if(t===!0&&s!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Zt):Zt.fromBufferAttribute(s,o),Zt.applyMatrix4(e.matrixWorld),this.expandByPoint(Zt);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),cr.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),cr.copy(i.boundingBox)),cr.applyMatrix4(e.matrixWorld),this.union(cr)}const r=e.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Zt),Zt.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Fi),hr.subVectors(this.max,Fi),Zn.subVectors(e.a,Fi),$n.subVectors(e.b,Fi),Qn.subVectors(e.c,Fi),Sn.subVectors($n,Zn),wn.subVectors(Qn,$n),Nn.subVectors(Zn,Qn);let t=[0,-Sn.z,Sn.y,0,-wn.z,wn.y,0,-Nn.z,Nn.y,Sn.z,0,-Sn.x,wn.z,0,-wn.x,Nn.z,0,-Nn.x,-Sn.y,Sn.x,0,-wn.y,wn.x,0,-Nn.y,Nn.x,0];return!bs(t,Zn,$n,Qn,hr)||(t=[1,0,0,0,1,0,0,0,1],!bs(t,Zn,$n,Qn,hr))?!1:(ur.crossVectors(Sn,wn),t=[ur.x,ur.y,ur.z],bs(t,Zn,$n,Qn,hr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Zt).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Zt).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(un[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),un[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),un[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),un[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),un[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),un[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),un[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),un[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(un),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const un=[new P,new P,new P,new P,new P,new P,new P,new P],Zt=new P,cr=new In,Zn=new P,$n=new P,Qn=new P,Sn=new P,wn=new P,Nn=new P,Fi=new P,hr=new P,ur=new P,Un=new P;function bs(n,e,t,i,r){for(let s=0,o=n.length-3;s<=o;s+=3){Un.fromArray(n,s);const a=r.x*Math.abs(Un.x)+r.y*Math.abs(Un.y)+r.z*Math.abs(Un.z),l=e.dot(Un),c=t.dot(Un),h=i.dot(Un);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}const Sh=new In,ki=new P,Ms=new P;class vn{constructor(e=new P,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):Sh.setFromPoints(e).getCenter(i);let r=0;for(let s=0,o=e.length;s<o;s++)r=Math.max(r,i.distanceToSquared(e[s]));return this.radius=Math.sqrt(r),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;ki.subVectors(e,this.center);const t=ki.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),r=(i-this.radius)*.5;this.center.addScaledVector(ki,r/i),this.radius+=r}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Ms.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(ki.copy(e.center).add(Ms)),this.expandByPoint(ki.copy(e.center).sub(Ms))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const dn=new P,xs=new P,dr=new P,Tn=new P,Ss=new P,fr=new P,ws=new P;class sr{constructor(e=new P,t=new P(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,dn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=dn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(dn.copy(this.origin).addScaledVector(this.direction,t),dn.distanceToSquared(e))}distanceSqToSegment(e,t,i,r){xs.copy(e).add(t).multiplyScalar(.5),dr.copy(t).sub(e).normalize(),Tn.copy(this.origin).sub(xs);const s=e.distanceTo(t)*.5,o=-this.direction.dot(dr),a=Tn.dot(this.direction),l=-Tn.dot(dr),c=Tn.lengthSq(),h=Math.abs(1-o*o);let u,p,f,g;if(h>0)if(u=o*l-a,p=o*a-l,g=s*h,u>=0)if(p>=-g)if(p<=g){const _=1/h;u*=_,p*=_,f=u*(u+o*p+2*a)+p*(o*u+p+2*l)+c}else p=s,u=Math.max(0,-(o*p+a)),f=-u*u+p*(p+2*l)+c;else p=-s,u=Math.max(0,-(o*p+a)),f=-u*u+p*(p+2*l)+c;else p<=-g?(u=Math.max(0,-(-o*s+a)),p=u>0?-s:Math.min(Math.max(-s,-l),s),f=-u*u+p*(p+2*l)+c):p<=g?(u=0,p=Math.min(Math.max(-s,-l),s),f=p*(p+2*l)+c):(u=Math.max(0,-(o*s+a)),p=u>0?s:Math.min(Math.max(-s,-l),s),f=-u*u+p*(p+2*l)+c);else p=o>0?-s:s,u=Math.max(0,-(o*p+a)),f=-u*u+p*(p+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(xs).addScaledVector(dr,p),f}intersectSphere(e,t){dn.subVectors(e.center,this.origin);const i=dn.dot(this.direction),r=dn.dot(dn)-i*i,s=e.radius*e.radius;if(r>s)return null;const o=Math.sqrt(s-r),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,r,s,o,a,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,p=this.origin;return c>=0?(i=(e.min.x-p.x)*c,r=(e.max.x-p.x)*c):(i=(e.max.x-p.x)*c,r=(e.min.x-p.x)*c),h>=0?(s=(e.min.y-p.y)*h,o=(e.max.y-p.y)*h):(s=(e.max.y-p.y)*h,o=(e.min.y-p.y)*h),i>o||s>r||((s>i||isNaN(i))&&(i=s),(o<r||isNaN(r))&&(r=o),u>=0?(a=(e.min.z-p.z)*u,l=(e.max.z-p.z)*u):(a=(e.max.z-p.z)*u,l=(e.min.z-p.z)*u),i>l||a>r)||((a>i||i!==i)&&(i=a),(l<r||r!==r)&&(r=l),r<0)?null:this.at(i>=0?i:r,t)}intersectsBox(e){return this.intersectBox(e,dn)!==null}intersectTriangle(e,t,i,r,s){Ss.subVectors(t,e),fr.subVectors(i,e),ws.crossVectors(Ss,fr);let o=this.direction.dot(ws),a;if(o>0){if(r)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Tn.subVectors(this.origin,e);const l=a*this.direction.dot(fr.crossVectors(Tn,fr));if(l<0)return null;const c=a*this.direction.dot(Ss.cross(Tn));if(c<0||l+c>o)return null;const h=-a*Tn.dot(ws);return h<0?null:this.at(h/o,s)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Ve{constructor(e,t,i,r,s,o,a,l,c,h,u,p,f,g,_,m){Ve.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,r,s,o,a,l,c,h,u,p,f,g,_,m)}set(e,t,i,r,s,o,a,l,c,h,u,p,f,g,_,m){const d=this.elements;return d[0]=e,d[4]=t,d[8]=i,d[12]=r,d[1]=s,d[5]=o,d[9]=a,d[13]=l,d[2]=c,d[6]=h,d[10]=u,d[14]=p,d[3]=f,d[7]=g,d[11]=_,d[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ve().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,i=e.elements,r=1/ei.setFromMatrixColumn(e,0).length(),s=1/ei.setFromMatrixColumn(e,1).length(),o=1/ei.setFromMatrixColumn(e,2).length();return t[0]=i[0]*r,t[1]=i[1]*r,t[2]=i[2]*r,t[3]=0,t[4]=i[4]*s,t[5]=i[5]*s,t[6]=i[6]*s,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,r=e.y,s=e.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(r),c=Math.sin(r),h=Math.cos(s),u=Math.sin(s);if(e.order==="XYZ"){const p=o*h,f=o*u,g=a*h,_=a*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=f+g*c,t[5]=p-_*c,t[9]=-a*l,t[2]=_-p*c,t[6]=g+f*c,t[10]=o*l}else if(e.order==="YXZ"){const p=l*h,f=l*u,g=c*h,_=c*u;t[0]=p+_*a,t[4]=g*a-f,t[8]=o*c,t[1]=o*u,t[5]=o*h,t[9]=-a,t[2]=f*a-g,t[6]=_+p*a,t[10]=o*l}else if(e.order==="ZXY"){const p=l*h,f=l*u,g=c*h,_=c*u;t[0]=p-_*a,t[4]=-o*u,t[8]=g+f*a,t[1]=f+g*a,t[5]=o*h,t[9]=_-p*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){const p=o*h,f=o*u,g=a*h,_=a*u;t[0]=l*h,t[4]=g*c-f,t[8]=p*c+_,t[1]=l*u,t[5]=_*c+p,t[9]=f*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){const p=o*l,f=o*c,g=a*l,_=a*c;t[0]=l*h,t[4]=_-p*u,t[8]=g*u+f,t[1]=u,t[5]=o*h,t[9]=-a*h,t[2]=-c*h,t[6]=f*u+g,t[10]=p-_*u}else if(e.order==="XZY"){const p=o*l,f=o*c,g=a*l,_=a*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=p*u+_,t[5]=o*h,t[9]=f*u-g,t[2]=g*u-f,t[6]=a*h,t[10]=_*u+p}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(wh,e,Th)}lookAt(e,t,i){const r=this.elements;return zt.subVectors(e,t),zt.lengthSq()===0&&(zt.z=1),zt.normalize(),En.crossVectors(i,zt),En.lengthSq()===0&&(Math.abs(i.z)===1?zt.x+=1e-4:zt.z+=1e-4,zt.normalize(),En.crossVectors(i,zt)),En.normalize(),pr.crossVectors(zt,En),r[0]=En.x,r[4]=pr.x,r[8]=zt.x,r[1]=En.y,r[5]=pr.y,r[9]=zt.y,r[2]=En.z,r[6]=pr.z,r[10]=zt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,r=t.elements,s=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],h=i[1],u=i[5],p=i[9],f=i[13],g=i[2],_=i[6],m=i[10],d=i[14],v=i[3],M=i[7],x=i[11],D=i[15],R=r[0],A=r[4],w=r[8],S=r[12],b=r[1],y=r[5],L=r[9],U=r[13],k=r[2],j=r[6],z=r[10],q=r[14],N=r[3],K=r[7],he=r[11],X=r[15];return s[0]=o*R+a*b+l*k+c*N,s[4]=o*A+a*y+l*j+c*K,s[8]=o*w+a*L+l*z+c*he,s[12]=o*S+a*U+l*q+c*X,s[1]=h*R+u*b+p*k+f*N,s[5]=h*A+u*y+p*j+f*K,s[9]=h*w+u*L+p*z+f*he,s[13]=h*S+u*U+p*q+f*X,s[2]=g*R+_*b+m*k+d*N,s[6]=g*A+_*y+m*j+d*K,s[10]=g*w+_*L+m*z+d*he,s[14]=g*S+_*U+m*q+d*X,s[3]=v*R+M*b+x*k+D*N,s[7]=v*A+M*y+x*j+D*K,s[11]=v*w+M*L+x*z+D*he,s[15]=v*S+M*U+x*q+D*X,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],r=e[8],s=e[12],o=e[1],a=e[5],l=e[9],c=e[13],h=e[2],u=e[6],p=e[10],f=e[14],g=e[3],_=e[7],m=e[11],d=e[15];return g*(+s*l*u-r*c*u-s*a*p+i*c*p+r*a*f-i*l*f)+_*(+t*l*f-t*c*p+s*o*p-r*o*f+r*c*h-s*l*h)+m*(+t*c*u-t*a*f-s*o*u+i*o*f+s*a*h-i*c*h)+d*(-r*a*h-t*l*u+t*a*p+r*o*u-i*o*p+i*l*h)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const r=this.elements;return e.isVector3?(r[12]=e.x,r[13]=e.y,r[14]=e.z):(r[12]=e,r[13]=t,r[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],r=e[2],s=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=e[9],p=e[10],f=e[11],g=e[12],_=e[13],m=e[14],d=e[15],v=u*m*c-_*p*c+_*l*f-a*m*f-u*l*d+a*p*d,M=g*p*c-h*m*c-g*l*f+o*m*f+h*l*d-o*p*d,x=h*_*c-g*u*c+g*a*f-o*_*f-h*a*d+o*u*d,D=g*u*l-h*_*l-g*a*p+o*_*p+h*a*m-o*u*m,R=t*v+i*M+r*x+s*D;if(R===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const A=1/R;return e[0]=v*A,e[1]=(_*p*s-u*m*s-_*r*f+i*m*f+u*r*d-i*p*d)*A,e[2]=(a*m*s-_*l*s+_*r*c-i*m*c-a*r*d+i*l*d)*A,e[3]=(u*l*s-a*p*s-u*r*c+i*p*c+a*r*f-i*l*f)*A,e[4]=M*A,e[5]=(h*m*s-g*p*s+g*r*f-t*m*f-h*r*d+t*p*d)*A,e[6]=(g*l*s-o*m*s-g*r*c+t*m*c+o*r*d-t*l*d)*A,e[7]=(o*p*s-h*l*s+h*r*c-t*p*c-o*r*f+t*l*f)*A,e[8]=x*A,e[9]=(g*u*s-h*_*s-g*i*f+t*_*f+h*i*d-t*u*d)*A,e[10]=(o*_*s-g*a*s+g*i*c-t*_*c-o*i*d+t*a*d)*A,e[11]=(h*a*s-o*u*s-h*i*c+t*u*c+o*i*f-t*a*f)*A,e[12]=D*A,e[13]=(h*_*r-g*u*r+g*i*p-t*_*p-h*i*m+t*u*m)*A,e[14]=(g*a*r-o*_*r-g*i*l+t*_*l+o*i*m-t*a*m)*A,e[15]=(o*u*r-h*a*r+h*i*l-t*u*l-o*i*p+t*a*p)*A,this}scale(e){const t=this.elements,i=e.x,r=e.y,s=e.z;return t[0]*=i,t[4]*=r,t[8]*=s,t[1]*=i,t[5]*=r,t[9]*=s,t[2]*=i,t[6]*=r,t[10]*=s,t[3]*=i,t[7]*=r,t[11]*=s,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],r=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,r))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),r=Math.sin(t),s=1-i,o=e.x,a=e.y,l=e.z,c=s*o,h=s*a;return this.set(c*o+i,c*a-r*l,c*l+r*a,0,c*a+r*l,h*a+i,h*l-r*o,0,c*l-r*a,h*l+r*o,s*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,r,s,o){return this.set(1,i,s,0,e,1,o,0,t,r,1,0,0,0,0,1),this}compose(e,t,i){const r=this.elements,s=t._x,o=t._y,a=t._z,l=t._w,c=s+s,h=o+o,u=a+a,p=s*c,f=s*h,g=s*u,_=o*h,m=o*u,d=a*u,v=l*c,M=l*h,x=l*u,D=i.x,R=i.y,A=i.z;return r[0]=(1-(_+d))*D,r[1]=(f+x)*D,r[2]=(g-M)*D,r[3]=0,r[4]=(f-x)*R,r[5]=(1-(p+d))*R,r[6]=(m+v)*R,r[7]=0,r[8]=(g+M)*A,r[9]=(m-v)*A,r[10]=(1-(p+_))*A,r[11]=0,r[12]=e.x,r[13]=e.y,r[14]=e.z,r[15]=1,this}decompose(e,t,i){const r=this.elements;let s=ei.set(r[0],r[1],r[2]).length();const o=ei.set(r[4],r[5],r[6]).length(),a=ei.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),e.x=r[12],e.y=r[13],e.z=r[14],$t.copy(this);const c=1/s,h=1/o,u=1/a;return $t.elements[0]*=c,$t.elements[1]*=c,$t.elements[2]*=c,$t.elements[4]*=h,$t.elements[5]*=h,$t.elements[6]*=h,$t.elements[8]*=u,$t.elements[9]*=u,$t.elements[10]*=u,t.setFromRotationMatrix($t),i.x=s,i.y=o,i.z=a,this}makePerspective(e,t,i,r,s,o,a=2e3){const l=this.elements,c=2*s/(t-e),h=2*s/(i-r),u=(t+e)/(t-e),p=(i+r)/(i-r);let f,g;if(a===2e3)f=-(o+s)/(o-s),g=-2*o*s/(o-s);else if(a===2001)f=-o/(o-s),g=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=p,l[13]=0,l[2]=0,l[6]=0,l[10]=f,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,r,s,o,a=2e3){const l=this.elements,c=1/(t-e),h=1/(i-r),u=1/(o-s),p=(t+e)*c,f=(i+r)*h;let g,_;if(a===2e3)g=(o+s)*u,_=-2*u;else if(a===2001)g=s*u,_=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-p,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-f,l[2]=0,l[6]=0,l[10]=_,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let r=0;r<16;r++)if(t[r]!==i[r])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}}const ei=new P,$t=new Ve,wh=new P(0,0,0),Th=new P(1,1,1),En=new P,pr=new P,zt=new P,da=new Ve,fa=new _t;class nn{constructor(e=0,t=0,i=0,r=nn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=r}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,r=this._order){return this._x=e,this._y=t,this._z=i,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const r=e.elements,s=r[0],o=r[4],a=r[8],l=r[1],c=r[5],h=r[9],u=r[2],p=r[6],f=r[10];switch(t){case"XYZ":this._y=Math.asin(Tt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(p,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Tt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,s),this._z=0);break;case"ZXY":this._x=Math.asin(Tt(p,-1,1)),Math.abs(p)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-Tt(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(p,f),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Tt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,s)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-Tt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(p,c),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-h,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return da.makeRotationFromQuaternion(e),this.setFromRotationMatrix(da,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return fa.setFromEuler(this),this.setFromQuaternion(fa,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}nn.DEFAULT_ORDER="XYZ";class Ro{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let Eh=0;const pa=new P,ti=new _t,fn=new Ve,mr=new P,Oi=new P,Ah=new P,Rh=new _t,ma=new P(1,0,0),ga=new P(0,1,0),_a=new P(0,0,1),ya={type:"added"},Ch={type:"removed"},ni={type:"childadded",child:null},Ts={type:"childremoved",child:null};class bt extends Ri{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Eh++}),this.uuid=jt(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=bt.DEFAULT_UP.clone();const e=new P,t=new nn,i=new _t,r=new P(1,1,1);function s(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(s),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new Ve},normalMatrix:{value:new Ye}}),this.matrix=new Ve,this.matrixWorld=new Ve,this.matrixAutoUpdate=bt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=bt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ro,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ti.setFromAxisAngle(e,t),this.quaternion.multiply(ti),this}rotateOnWorldAxis(e,t){return ti.setFromAxisAngle(e,t),this.quaternion.premultiply(ti),this}rotateX(e){return this.rotateOnAxis(ma,e)}rotateY(e){return this.rotateOnAxis(ga,e)}rotateZ(e){return this.rotateOnAxis(_a,e)}translateOnAxis(e,t){return pa.copy(e).applyQuaternion(this.quaternion),this.position.add(pa.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(ma,e)}translateY(e){return this.translateOnAxis(ga,e)}translateZ(e){return this.translateOnAxis(_a,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(fn.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?mr.copy(e):mr.set(e,t,i);const r=this.parent;this.updateWorldMatrix(!0,!1),Oi.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?fn.lookAt(Oi,mr,this.up):fn.lookAt(mr,Oi,this.up),this.quaternion.setFromRotationMatrix(fn),r&&(fn.extractRotation(r.matrixWorld),ti.setFromRotationMatrix(fn),this.quaternion.premultiply(ti.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(ya),ni.child=e,this.dispatchEvent(ni),ni.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Ch),Ts.child=e,this.dispatchEvent(Ts),Ts.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),fn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),fn.multiply(e.parent.matrixWorld)),e.applyMatrix4(fn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(ya),ni.child=e,this.dispatchEvent(ni),ni.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,r=this.children.length;i<r;i++){const o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Oi,e,Ah),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Oi,Rh,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,r=t.length;i<r;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t){const i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];s(e.shapes,u)}else s(e.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(e.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(s(e.materials,this.material[l]));r.material=a}else r.material=s(e.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];r.animations.push(s(e.animations,l))}}if(t){const a=o(e.geometries),l=o(e.materials),c=o(e.textures),h=o(e.images),u=o(e.shapes),p=o(e.skeletons),f=o(e.animations),g=o(e.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),h.length>0&&(i.images=h),u.length>0&&(i.shapes=u),p.length>0&&(i.skeletons=p),f.length>0&&(i.animations=f),g.length>0&&(i.nodes=g)}return i.object=r,i;function o(a){const l=[];for(const c in a){const h=a[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const r=e.children[i];this.add(r.clone())}return this}}bt.DEFAULT_UP=new P(0,1,0);bt.DEFAULT_MATRIX_AUTO_UPDATE=!0;bt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Qt=new P,pn=new P,Es=new P,mn=new P,ii=new P,ri=new P,va=new P,As=new P,Rs=new P,Cs=new P,Ps=new tt,Ls=new tt,Is=new tt;class qt{constructor(e=new P,t=new P,i=new P){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,r){r.subVectors(i,t),Qt.subVectors(e,t),r.cross(Qt);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(e,t,i,r,s){Qt.subVectors(r,t),pn.subVectors(i,t),Es.subVectors(e,t);const o=Qt.dot(Qt),a=Qt.dot(pn),l=Qt.dot(Es),c=pn.dot(pn),h=pn.dot(Es),u=o*c-a*a;if(u===0)return s.set(0,0,0),null;const p=1/u,f=(c*l-a*h)*p,g=(o*h-a*l)*p;return s.set(1-f-g,g,f)}static containsPoint(e,t,i,r){return this.getBarycoord(e,t,i,r,mn)===null?!1:mn.x>=0&&mn.y>=0&&mn.x+mn.y<=1}static getInterpolation(e,t,i,r,s,o,a,l){return this.getBarycoord(e,t,i,r,mn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,mn.x),l.addScaledVector(o,mn.y),l.addScaledVector(a,mn.z),l)}static getInterpolatedAttribute(e,t,i,r,s,o){return Ps.setScalar(0),Ls.setScalar(0),Is.setScalar(0),Ps.fromBufferAttribute(e,t),Ls.fromBufferAttribute(e,i),Is.fromBufferAttribute(e,r),o.setScalar(0),o.addScaledVector(Ps,s.x),o.addScaledVector(Ls,s.y),o.addScaledVector(Is,s.z),o}static isFrontFacing(e,t,i,r){return Qt.subVectors(i,t),pn.subVectors(e,t),Qt.cross(pn).dot(r)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,r){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[r]),this}setFromAttributeAndIndices(e,t,i,r){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,r),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Qt.subVectors(this.c,this.b),pn.subVectors(this.a,this.b),Qt.cross(pn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return qt.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return qt.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,r,s){return qt.getInterpolation(e,this.a,this.b,this.c,t,i,r,s)}containsPoint(e){return qt.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return qt.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,r=this.b,s=this.c;let o,a;ii.subVectors(r,i),ri.subVectors(s,i),As.subVectors(e,i);const l=ii.dot(As),c=ri.dot(As);if(l<=0&&c<=0)return t.copy(i);Rs.subVectors(e,r);const h=ii.dot(Rs),u=ri.dot(Rs);if(h>=0&&u<=h)return t.copy(r);const p=l*u-h*c;if(p<=0&&l>=0&&h<=0)return o=l/(l-h),t.copy(i).addScaledVector(ii,o);Cs.subVectors(e,s);const f=ii.dot(Cs),g=ri.dot(Cs);if(g>=0&&f<=g)return t.copy(s);const _=f*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(i).addScaledVector(ri,a);const m=h*g-f*u;if(m<=0&&u-h>=0&&f-g>=0)return va.subVectors(s,r),a=(u-h)/(u-h+(f-g)),t.copy(r).addScaledVector(va,a);const d=1/(m+_+p);return o=_*d,a=p*d,t.copy(i).addScaledVector(ii,o).addScaledVector(ri,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Yl={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},An={h:0,s:0,l:0},gr={h:0,s:0,l:0};function Ds(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}class Ie{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const r=e;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Ot){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Qe.toWorkingColorSpace(this,t),this}setRGB(e,t,i,r=Qe.workingColorSpace){return this.r=e,this.g=t,this.b=i,Qe.toWorkingColorSpace(this,r),this}setHSL(e,t,i,r=Qe.workingColorSpace){if(e=Ao(e,1),t=Tt(t,0,1),i=Tt(i,0,1),t===0)this.r=this.g=this.b=i;else{const s=i<=.5?i*(1+t):i+t-i*t,o=2*i-s;this.r=Ds(o,s,e+1/3),this.g=Ds(o,s,e),this.b=Ds(o,s,e-1/3)}return Qe.toWorkingColorSpace(this,r),this}setStyle(e,t=Ot){function i(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(e)){let s;const o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,t);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,t);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(e)){const s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(s,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Ot){const i=Yl[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=yn(e.r),this.g=yn(e.g),this.b=yn(e.b),this}copyLinearToSRGB(e){return this.r=yi(e.r),this.g=yi(e.g),this.b=yi(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Ot){return Qe.fromWorkingColorSpace(It.copy(this),e),Math.round(Tt(It.r*255,0,255))*65536+Math.round(Tt(It.g*255,0,255))*256+Math.round(Tt(It.b*255,0,255))}getHexString(e=Ot){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Qe.workingColorSpace){Qe.fromWorkingColorSpace(It.copy(this),t);const i=It.r,r=It.g,s=It.b,o=Math.max(i,r,s),a=Math.min(i,r,s);let l,c;const h=(a+o)/2;if(a===o)l=0,c=0;else{const u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case i:l=(r-s)/u+(r<s?6:0);break;case r:l=(s-i)/u+2;break;case s:l=(i-r)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=Qe.workingColorSpace){return Qe.fromWorkingColorSpace(It.copy(this),t),e.r=It.r,e.g=It.g,e.b=It.b,e}getStyle(e=Ot){Qe.fromWorkingColorSpace(It.copy(this),e);const t=It.r,i=It.g,r=It.b;return e!==Ot?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(r*255)})`}offsetHSL(e,t,i){return this.getHSL(An),this.setHSL(An.h+e,An.s+t,An.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(An),e.getHSL(gr);const i=Zi(An.h,gr.h,t),r=Zi(An.s,gr.s,t),s=Zi(An.l,gr.l,t);return this.setHSL(i,r,s),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,r=this.b,s=e.elements;return this.r=s[0]*t+s[3]*i+s[6]*r,this.g=s[1]*t+s[4]*i+s[7]*r,this.b=s[2]*t+s[5]*i+s[8]*r,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const It=new Ie;Ie.NAMES=Yl;let Ph=0;class bn extends Ri{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Ph++}),this.uuid=jt(),this.name="",this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ie(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=7680,this.stencilZFail=7680,this.stencilZPass=7680,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const r=this[t];if(r===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(i):r&&r.isVector3&&i&&i.isVector3?r.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==1&&(i.blending=this.blending),this.side!==0&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==204&&(i.blendSrc=this.blendSrc),this.blendDst!==205&&(i.blendDst=this.blendDst),this.blendEquation!==100&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==3&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==519&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==7680&&(i.stencilFail=this.stencilFail),this.stencilZFail!==7680&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==7680&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function r(s){const o=[];for(const a in s){const l=s[a];delete l.metadata,o.push(l)}return o}if(t){const s=r(e.textures),o=r(e.images);s.length>0&&(i.textures=s),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const r=t.length;i=new Array(r);for(let s=0;s!==r;++s)i[s]=t[s].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class Co extends bn{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new Ie(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new nn,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const _n=Lh();function Lh(){const n=new ArrayBuffer(4),e=new Float32Array(n),t=new Uint32Array(n),i=new Uint32Array(512),r=new Uint32Array(512);for(let l=0;l<256;++l){const c=l-127;c<-27?(i[l]=0,i[l|256]=32768,r[l]=24,r[l|256]=24):c<-14?(i[l]=1024>>-c-14,i[l|256]=1024>>-c-14|32768,r[l]=-c-1,r[l|256]=-c-1):c<=15?(i[l]=c+15<<10,i[l|256]=c+15<<10|32768,r[l]=13,r[l|256]=13):c<128?(i[l]=31744,i[l|256]=64512,r[l]=24,r[l|256]=24):(i[l]=31744,i[l|256]=64512,r[l]=13,r[l|256]=13)}const s=new Uint32Array(2048),o=new Uint32Array(64),a=new Uint32Array(64);for(let l=1;l<1024;++l){let c=l<<13,h=0;for(;(c&8388608)===0;)c<<=1,h-=8388608;c&=-8388609,h+=947912704,s[l]=c|h}for(let l=1024;l<2048;++l)s[l]=939524096+(l-1024<<13);for(let l=1;l<31;++l)o[l]=l<<23;o[31]=1199570944,o[32]=2147483648;for(let l=33;l<63;++l)o[l]=2147483648+(l-32<<23);o[63]=3347054592;for(let l=1;l<64;++l)l!==32&&(a[l]=1024);return{floatView:e,uint32View:t,baseTable:i,shiftTable:r,mantissaTable:s,exponentTable:o,offsetTable:a}}function Ih(n){Math.abs(n)>65504&&console.warn("THREE.DataUtils.toHalfFloat(): Value out of range."),n=Tt(n,-65504,65504),_n.floatView[0]=n;const e=_n.uint32View[0],t=e>>23&511;return _n.baseTable[t]+((e&8388607)>>_n.shiftTable[t])}function Dh(n){const e=n>>10;return _n.uint32View[0]=_n.mantissaTable[_n.offsetTable[e]+(n&1023)]+_n.exponentTable[e],_n.floatView[0]}const I_={toHalfFloat:Ih,fromHalfFloat:Dh},St=new P,_r=new re;class Nt{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=35044,this.updateRanges=[],this.gpuType=1015,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[e+r]=t.array[i+r];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)_r.fromBufferAttribute(this,t),_r.applyMatrix3(e),this.setXY(t,_r.x,_r.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)St.fromBufferAttribute(this,t),St.applyMatrix3(e),this.setXYZ(t,St.x,St.y,St.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)St.fromBufferAttribute(this,t),St.applyMatrix4(e),this.setXYZ(t,St.x,St.y,St.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)St.fromBufferAttribute(this,t),St.applyNormalMatrix(e),this.setXYZ(t,St.x,St.y,St.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)St.fromBufferAttribute(this,t),St.transformDirection(e),this.setXYZ(t,St.x,St.y,St.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=en(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=at(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=en(t,this.array)),t}setX(e,t){return this.normalized&&(t=at(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=en(t,this.array)),t}setY(e,t){return this.normalized&&(t=at(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=en(t,this.array)),t}setZ(e,t){return this.normalized&&(t=at(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=en(t,this.array)),t}setW(e,t){return this.normalized&&(t=at(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=at(t,this.array),i=at(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,r){return e*=this.itemSize,this.normalized&&(t=at(t,this.array),i=at(i,this.array),r=at(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this}setXYZW(e,t,i,r,s){return e*=this.itemSize,this.normalized&&(t=at(t,this.array),i=at(i,this.array),r=at(r,this.array),s=at(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=r,this.array[e+3]=s,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==35044&&(e.usage=this.usage),e}}class Po extends Nt{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class ql extends Nt{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class qe extends Nt{constructor(e,t,i){super(new Float32Array(e),t,i)}}let Nh=0;const Yt=new Ve,Ns=new bt,si=new P,Gt=new In,Bi=new In,Rt=new P;class yt extends Ri{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Nh++}),this.uuid=jt(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Hl(e)?ql:Po)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const s=new Ye().getNormalMatrix(e);i.applyNormalMatrix(s),i.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(e),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return Yt.makeRotationFromQuaternion(e),this.applyMatrix4(Yt),this}rotateX(e){return Yt.makeRotationX(e),this.applyMatrix4(Yt),this}rotateY(e){return Yt.makeRotationY(e),this.applyMatrix4(Yt),this}rotateZ(e){return Yt.makeRotationZ(e),this.applyMatrix4(Yt),this}translate(e,t,i){return Yt.makeTranslation(e,t,i),this.applyMatrix4(Yt),this}scale(e,t,i){return Yt.makeScale(e,t,i),this.applyMatrix4(Yt),this}lookAt(e){return Ns.lookAt(e),Ns.updateMatrix(),this.applyMatrix4(Ns.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(si).negate(),this.translate(si.x,si.y,si.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const i=[];for(let r=0,s=e.length;r<s;r++){const o=e[r];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new qe(i,3))}else{for(let i=0,r=t.count;i<r;i++){const s=e[i];t.setXYZ(i,s.x,s.y,s.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new In);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,r=t.length;i<r;i++){const s=t[i];Gt.setFromBufferAttribute(s),this.morphTargetsRelative?(Rt.addVectors(this.boundingBox.min,Gt.min),this.boundingBox.expandByPoint(Rt),Rt.addVectors(this.boundingBox.max,Gt.max),this.boundingBox.expandByPoint(Rt)):(this.boundingBox.expandByPoint(Gt.min),this.boundingBox.expandByPoint(Gt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new vn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new P,1/0);return}if(e){const i=this.boundingSphere.center;if(Gt.setFromBufferAttribute(e),t)for(let s=0,o=t.length;s<o;s++){const a=t[s];Bi.setFromBufferAttribute(a),this.morphTargetsRelative?(Rt.addVectors(Gt.min,Bi.min),Gt.expandByPoint(Rt),Rt.addVectors(Gt.max,Bi.max),Gt.expandByPoint(Rt)):(Gt.expandByPoint(Bi.min),Gt.expandByPoint(Bi.max))}Gt.getCenter(i);let r=0;for(let s=0,o=e.count;s<o;s++)Rt.fromBufferAttribute(e,s),r=Math.max(r,i.distanceToSquared(Rt));if(t)for(let s=0,o=t.length;s<o;s++){const a=t[s],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)Rt.fromBufferAttribute(a,c),l&&(si.fromBufferAttribute(e,c),Rt.add(si)),r=Math.max(r,i.distanceToSquared(Rt))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,r=t.normal,s=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Nt(new Float32Array(4*i.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let w=0;w<i.count;w++)a[w]=new P,l[w]=new P;const c=new P,h=new P,u=new P,p=new re,f=new re,g=new re,_=new P,m=new P;function d(w,S,b){c.fromBufferAttribute(i,w),h.fromBufferAttribute(i,S),u.fromBufferAttribute(i,b),p.fromBufferAttribute(s,w),f.fromBufferAttribute(s,S),g.fromBufferAttribute(s,b),h.sub(c),u.sub(c),f.sub(p),g.sub(p);const y=1/(f.x*g.y-g.x*f.y);isFinite(y)&&(_.copy(h).multiplyScalar(g.y).addScaledVector(u,-f.y).multiplyScalar(y),m.copy(u).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(y),a[w].add(_),a[S].add(_),a[b].add(_),l[w].add(m),l[S].add(m),l[b].add(m))}let v=this.groups;v.length===0&&(v=[{start:0,count:e.count}]);for(let w=0,S=v.length;w<S;++w){const b=v[w],y=b.start,L=b.count;for(let U=y,k=y+L;U<k;U+=3)d(e.getX(U+0),e.getX(U+1),e.getX(U+2))}const M=new P,x=new P,D=new P,R=new P;function A(w){D.fromBufferAttribute(r,w),R.copy(D);const S=a[w];M.copy(S),M.sub(D.multiplyScalar(D.dot(S))).normalize(),x.crossVectors(R,S);const y=x.dot(l[w])<0?-1:1;o.setXYZW(w,M.x,M.y,M.z,y)}for(let w=0,S=v.length;w<S;++w){const b=v[w],y=b.start,L=b.count;for(let U=y,k=y+L;U<k;U+=3)A(e.getX(U+0)),A(e.getX(U+1)),A(e.getX(U+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Nt(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let p=0,f=i.count;p<f;p++)i.setXYZ(p,0,0,0);const r=new P,s=new P,o=new P,a=new P,l=new P,c=new P,h=new P,u=new P;if(e)for(let p=0,f=e.count;p<f;p+=3){const g=e.getX(p+0),_=e.getX(p+1),m=e.getX(p+2);r.fromBufferAttribute(t,g),s.fromBufferAttribute(t,_),o.fromBufferAttribute(t,m),h.subVectors(o,s),u.subVectors(r,s),h.cross(u),a.fromBufferAttribute(i,g),l.fromBufferAttribute(i,_),c.fromBufferAttribute(i,m),a.add(h),l.add(h),c.add(h),i.setXYZ(g,a.x,a.y,a.z),i.setXYZ(_,l.x,l.y,l.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let p=0,f=t.count;p<f;p+=3)r.fromBufferAttribute(t,p+0),s.fromBufferAttribute(t,p+1),o.fromBufferAttribute(t,p+2),h.subVectors(o,s),u.subVectors(r,s),h.cross(u),i.setXYZ(p+0,h.x,h.y,h.z),i.setXYZ(p+1,h.x,h.y,h.z),i.setXYZ(p+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)Rt.fromBufferAttribute(e,t),Rt.normalize(),e.setXYZ(t,Rt.x,Rt.y,Rt.z)}toNonIndexed(){function e(a,l){const c=a.array,h=a.itemSize,u=a.normalized,p=new c.constructor(l.length*h);let f=0,g=0;for(let _=0,m=l.length;_<m;_++){a.isInterleavedBufferAttribute?f=l[_]*a.data.stride+a.offset:f=l[_]*h;for(let d=0;d<h;d++)p[g++]=c[f++]}return new Nt(p,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new yt,i=this.index.array,r=this.attributes;for(const a in r){const l=r[a],c=e(l,i);t.setAttribute(a,c)}const s=this.morphAttributes;for(const a in s){const l=[],c=s[a];for(let h=0,u=c.length;h<u;h++){const p=c[h],f=e(p,i);l.push(f)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const l in i){const c=i[l];e.data.attributes[l]=c.toJSON(e.data)}const r={};let s=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,p=c.length;u<p;u++){const f=c[u];h.push(f.toJSON(e.data))}h.length>0&&(r[l]=h,s=!0)}s&&(e.data.morphAttributes=r,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone(t));const r=e.attributes;for(const c in r){const h=r[c];this.setAttribute(c,h.clone(t))}const s=e.morphAttributes;for(const c in s){const h=[],u=s[c];for(let p=0,f=u.length;p<f;p++)h.push(u[p].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let c=0,h=o.length;c<h;c++){const u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const ba=new Ve,Fn=new sr,yr=new vn,Ma=new P,vr=new P,br=new P,Mr=new P,Us=new P,xr=new P,xa=new P,Sr=new P;class ut extends bt{constructor(e=new yt,t=new Co){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const r=t[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(e,t){const i=this.geometry,r=i.attributes.position,s=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(r,e);const a=this.morphTargetInfluences;if(s&&a){xr.set(0,0,0);for(let l=0,c=s.length;l<c;l++){const h=a[l],u=s[l];h!==0&&(Us.fromBufferAttribute(u,e),o?xr.addScaledVector(Us,h):xr.addScaledVector(Us.sub(t),h))}t.add(xr)}return t}raycast(e,t){const i=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),yr.copy(i.boundingSphere),yr.applyMatrix4(s),Fn.copy(e.ray).recast(e.near),!(yr.containsPoint(Fn.origin)===!1&&(Fn.intersectSphere(yr,Ma)===null||Fn.origin.distanceToSquared(Ma)>(e.far-e.near)**2))&&(ba.copy(s).invert(),Fn.copy(e.ray).applyMatrix4(ba),!(i.boundingBox!==null&&Fn.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,Fn)))}_computeIntersections(e,t,i){let r;const s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,c=s.attributes.uv,h=s.attributes.uv1,u=s.attributes.normal,p=s.groups,f=s.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=p.length;g<_;g++){const m=p[g],d=o[m.materialIndex],v=Math.max(m.start,f.start),M=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let x=v,D=M;x<D;x+=3){const R=a.getX(x),A=a.getX(x+1),w=a.getX(x+2);r=wr(this,d,e,i,c,h,u,R,A,w),r&&(r.faceIndex=Math.floor(x/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{const g=Math.max(0,f.start),_=Math.min(a.count,f.start+f.count);for(let m=g,d=_;m<d;m+=3){const v=a.getX(m),M=a.getX(m+1),x=a.getX(m+2);r=wr(this,o,e,i,c,h,u,v,M,x),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=p.length;g<_;g++){const m=p[g],d=o[m.materialIndex],v=Math.max(m.start,f.start),M=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let x=v,D=M;x<D;x+=3){const R=x,A=x+1,w=x+2;r=wr(this,d,e,i,c,h,u,R,A,w),r&&(r.faceIndex=Math.floor(x/3),r.face.materialIndex=m.materialIndex,t.push(r))}}else{const g=Math.max(0,f.start),_=Math.min(l.count,f.start+f.count);for(let m=g,d=_;m<d;m+=3){const v=m,M=m+1,x=m+2;r=wr(this,o,e,i,c,h,u,v,M,x),r&&(r.faceIndex=Math.floor(m/3),t.push(r))}}}}function Uh(n,e,t,i,r,s,o,a){let l;if(e.side===1?l=i.intersectTriangle(o,s,r,!0,a):l=i.intersectTriangle(r,s,o,e.side===0,a),l===null)return null;Sr.copy(a),Sr.applyMatrix4(n.matrixWorld);const c=t.ray.origin.distanceTo(Sr);return c<t.near||c>t.far?null:{distance:c,point:Sr.clone(),object:n}}function wr(n,e,t,i,r,s,o,a,l,c){n.getVertexPosition(a,vr),n.getVertexPosition(l,br),n.getVertexPosition(c,Mr);const h=Uh(n,e,t,i,vr,br,Mr,xa);if(h){const u=new P;qt.getBarycoord(xa,vr,br,Mr,u),r&&(h.uv=qt.getInterpolatedAttribute(r,a,l,c,u,new re)),s&&(h.uv1=qt.getInterpolatedAttribute(s,a,l,c,u,new re)),o&&(h.normal=qt.getInterpolatedAttribute(o,a,l,c,u,new P),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));const p={a,b:l,c,normal:new P,materialIndex:0};qt.getNormal(vr,br,Mr,p.normal),h.face=p,h.barycoord=u}return h}class ht extends yt{constructor(e=1,t=1,i=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:r,heightSegments:s,depthSegments:o};const a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);const l=[],c=[],h=[],u=[];let p=0,f=0;g("z","y","x",-1,-1,i,t,e,o,s,0),g("z","y","x",1,-1,i,t,-e,o,s,1),g("x","z","y",1,1,e,i,t,r,o,2),g("x","z","y",1,-1,e,i,-t,r,o,3),g("x","y","z",1,-1,e,t,i,r,s,4),g("x","y","z",-1,-1,e,t,-i,r,s,5),this.setIndex(l),this.setAttribute("position",new qe(c,3)),this.setAttribute("normal",new qe(h,3)),this.setAttribute("uv",new qe(u,2));function g(_,m,d,v,M,x,D,R,A,w,S){const b=x/A,y=D/w,L=x/2,U=D/2,k=R/2,j=A+1,z=w+1;let q=0,N=0;const K=new P;for(let he=0;he<z;he++){const X=he*y-U;for(let Q=0;Q<j;Q++){const we=Q*b-L;K[_]=we*v,K[m]=X*M,K[d]=k,c.push(K.x,K.y,K.z),K[_]=0,K[m]=0,K[d]=R>0?1:-1,h.push(K.x,K.y,K.z),u.push(Q/A),u.push(1-he/w),q+=1}}for(let he=0;he<w;he++)for(let X=0;X<A;X++){const Q=p+X+j*he,we=p+X+j*(he+1),W=p+(X+1)+j*(he+1),oe=p+(X+1)+j*he;l.push(Q,we,oe),l.push(we,W,oe),N+=6}a.addGroup(f,N,S),f+=N,p+=q}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ht(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Si(n){const e={};for(const t in n){e[t]={};for(const i in n[t]){const r=n[t][i];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=r.clone():Array.isArray(r)?e[t][i]=r.slice():e[t][i]=r}}return e}function Ft(n){const e={};for(let t=0;t<n.length;t++){const i=Si(n[t]);for(const r in i)e[r]=i[r]}return e}function Fh(n){const e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function jl(n){const e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Qe.workingColorSpace}const kh={clone:Si,merge:Ft};var Oh=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Bh=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Ln extends bn{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Oh,this.fragmentShader=Bh,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Si(e.uniforms),this.uniformsGroups=Fh(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const r in this.uniforms){const o=this.uniforms[r].value;o&&o.isTexture?t.uniforms[r]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[r]={type:"m4",value:o.toArray()}:t.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const r in this.extensions)this.extensions[r]===!0&&(i[r]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}}class Kl extends bt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ve,this.projectionMatrix=new Ve,this.projectionMatrixInverse=new Ve,this.coordinateSystem=2e3}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Rn=new P,Sa=new re,wa=new re;class Vt extends Kl{constructor(e=50,t=1,i=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=r,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=xi*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Ji*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return xi*2*Math.atan(Math.tan(Ji*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){Rn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Rn.x,Rn.y).multiplyScalar(-e/Rn.z),Rn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Rn.x,Rn.y).multiplyScalar(-e/Rn.z)}getViewSize(e,t){return this.getViewBounds(e,Sa,wa),t.subVectors(wa,Sa)}setViewOffset(e,t,i,r,s,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Ji*.5*this.fov)/this.zoom,i=2*t,r=this.aspect*i,s=-.5*r;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;s+=o.offsetX*r/l,t-=o.offsetY*i/c,r*=o.width/l,i*=o.height/c}const a=this.filmOffset;a!==0&&(s+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,t,t-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const oi=-90,ai=1;class zh extends bt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new Vt(oi,ai,e,t);r.layers=this.layers,this.add(r);const s=new Vt(oi,ai,e,t);s.layers=this.layers,this.add(s);const o=new Vt(oi,ai,e,t);o.layers=this.layers,this.add(o);const a=new Vt(oi,ai,e,t);a.layers=this.layers,this.add(a);const l=new Vt(oi,ai,e,t);l.layers=this.layers,this.add(l);const c=new Vt(oi,ai,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,r,s,o,a,l]=t;for(const c of t)this.remove(c);if(e===2e3)i.up.set(0,1,0),i.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===2001)i.up.set(0,-1,0),i.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:r}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[s,o,a,l,c,h]=this.children,u=e.getRenderTarget(),p=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const _=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,r),e.render(t,s),e.setRenderTarget(i,1,r),e.render(t,o),e.setRenderTarget(i,2,r),e.render(t,a),e.setRenderTarget(i,3,r),e.render(t,l),e.setRenderTarget(i,4,r),e.render(t,c),i.texture.generateMipmaps=_,e.setRenderTarget(i,5,r),e.render(t,h),e.setRenderTarget(u,p,f),e.xr.enabled=g,i.texture.needsPMREMUpdate=!0}}class Jl extends Ct{constructor(e,t,i,r,s,o,a,l,c,h){e=e!==void 0?e:[],t=t!==void 0?t:301,super(e,t,i,r,s,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Gh extends qn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},r=[i,i,i,i,i,i];this.texture=new Jl(r,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:1006}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},r=new ht(5,5,5),s=new Ln({name:"CubemapFromEquirect",uniforms:Si(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:1,blending:0});s.uniforms.tEquirect.value=t;const o=new ut(r,s),a=t.minFilter;return t.minFilter===1008&&(t.minFilter=1006),new zh(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,i,r){const s=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,r);e.setRenderTarget(s)}}const Fs=new P,Vh=new P,Hh=new Ye;class Gn{constructor(e=new P(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,r){return this.normal.set(e,t,i),this.constant=r,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const r=Fs.subVectors(i,t).cross(Vh.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(r,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const i=e.delta(Fs),r=this.normal.dot(i);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const s=-(e.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:t.copy(e.start).addScaledVector(i,s)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||Hh.getNormalMatrix(e),r=this.coplanarPoint(Fs).applyMatrix4(e),s=this.normal.applyMatrix3(i).normalize();return this.constant=-r.dot(s),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const kn=new vn,Tr=new P;class Lo{constructor(e=new Gn,t=new Gn,i=new Gn,r=new Gn,s=new Gn,o=new Gn){this.planes=[e,t,i,r,s,o]}set(e,t,i,r,s,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=2e3){const i=this.planes,r=e.elements,s=r[0],o=r[1],a=r[2],l=r[3],c=r[4],h=r[5],u=r[6],p=r[7],f=r[8],g=r[9],_=r[10],m=r[11],d=r[12],v=r[13],M=r[14],x=r[15];if(i[0].setComponents(l-s,p-c,m-f,x-d).normalize(),i[1].setComponents(l+s,p+c,m+f,x+d).normalize(),i[2].setComponents(l+o,p+h,m+g,x+v).normalize(),i[3].setComponents(l-o,p-h,m-g,x-v).normalize(),i[4].setComponents(l-a,p-u,m-_,x-M).normalize(),t===2e3)i[5].setComponents(l+a,p+u,m+_,x+M).normalize();else if(t===2001)i[5].setComponents(a,u,_,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),kn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),kn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(kn)}intersectsSprite(e){return kn.center.set(0,0,0),kn.radius=.7071067811865476,kn.applyMatrix4(e.matrixWorld),this.intersectsSphere(kn)}intersectsSphere(e){const t=this.planes,i=e.center,r=-e.radius;for(let s=0;s<6;s++)if(t[s].distanceToPoint(i)<r)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const r=t[i];if(Tr.x=r.normal.x>0?e.max.x:e.min.x,Tr.y=r.normal.y>0?e.max.y:e.min.y,Tr.z=r.normal.z>0?e.max.z:e.min.z,r.distanceToPoint(Tr)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Zl(){let n=null,e=!1,t=null,i=null;function r(s,o){t(s,o),i=n.requestAnimationFrame(r)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(r),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(s){t=s},setContext:function(s){n=s}}}function Wh(n){const e=new WeakMap;function t(a,l){const c=a.array,h=a.usage,u=c.byteLength,p=n.createBuffer();n.bindBuffer(l,p),n.bufferData(l,c,h),a.onUploadCallback();let f;if(c instanceof Float32Array)f=n.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=n.HALF_FLOAT:f=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=n.SHORT;else if(c instanceof Uint32Array)f=n.UNSIGNED_INT;else if(c instanceof Int32Array)f=n.INT;else if(c instanceof Int8Array)f=n.BYTE;else if(c instanceof Uint8Array)f=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:p,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function i(a,l,c){const h=l.array,u=l.updateRanges;if(n.bindBuffer(c,a),u.length===0)n.bufferSubData(c,0,h);else{u.sort((f,g)=>f.start-g.start);let p=0;for(let f=1;f<u.length;f++){const g=u[p],_=u[f];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++p,u[p]=_)}u.length=p+1;for(let f=0,g=u.length;f<g;f++){const _=u[f];n.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function r(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function s(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=e.get(a);l&&(n.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const h=e.get(a);(!h||h.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,a,l),c.version=a.version}}return{get:r,remove:s,update:o}}class wi extends yt{constructor(e=1,t=1,i=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:r};const s=e/2,o=t/2,a=Math.floor(i),l=Math.floor(r),c=a+1,h=l+1,u=e/a,p=t/l,f=[],g=[],_=[],m=[];for(let d=0;d<h;d++){const v=d*p-o;for(let M=0;M<c;M++){const x=M*u-s;g.push(x,-v,0),_.push(0,0,1),m.push(M/a),m.push(1-d/l)}}for(let d=0;d<l;d++)for(let v=0;v<a;v++){const M=v+c*d,x=v+c*(d+1),D=v+1+c*(d+1),R=v+1+c*d;f.push(M,x,R),f.push(x,D,R)}this.setIndex(f),this.setAttribute("position",new qe(g,3)),this.setAttribute("normal",new qe(_,3)),this.setAttribute("uv",new qe(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new wi(e.width,e.height,e.widthSegments,e.heightSegments)}}var Xh=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Yh=`#ifdef USE_ALPHAHASH
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
#endif`,qh=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,jh=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Kh=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Jh=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Zh=`#ifdef USE_AOMAP
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
#endif`,$h=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Qh=`#ifdef USE_BATCHING
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
#endif`,eu=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,tu=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,nu=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,iu=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,ru=`#ifdef USE_IRIDESCENCE
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
#endif`,su=`#ifdef USE_BUMPMAP
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
#endif`,ou=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,au=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,lu=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,cu=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,hu=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,uu=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,du=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,fu=`#if defined( USE_COLOR_ALPHA )
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
#endif`,pu=`#define PI 3.141592653589793
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
} // validated`,mu=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,gu=`vec3 transformedNormal = objectNormal;
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
#endif`,_u=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,yu=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,vu=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,bu=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Mu="gl_FragColor = linearToOutputTexel( gl_FragColor );",xu=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Su=`#ifdef USE_ENVMAP
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
#endif`,wu=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Tu=`#ifdef USE_ENVMAP
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
#endif`,Eu=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Au=`#ifdef USE_ENVMAP
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
#endif`,Ru=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Cu=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Pu=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Lu=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Iu=`#ifdef USE_GRADIENTMAP
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
}`,Du=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Nu=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Uu=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Fu=`uniform bool receiveShadow;
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
#endif`,ku=`#ifdef USE_ENVMAP
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
#endif`,Ou=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Bu=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,zu=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Gu=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Vu=`PhysicalMaterial material;
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
#endif`,Hu=`struct PhysicalMaterial {
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
}`,Wu=`
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
#endif`,Xu=`#if defined( RE_IndirectDiffuse )
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
#endif`,Yu=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,qu=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,ju=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ku=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ju=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Zu=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,$u=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Qu=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,ed=`#if defined( USE_POINTS_UV )
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
#endif`,td=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,nd=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,id=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,rd=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,sd=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,od=`#ifdef USE_MORPHTARGETS
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
#endif`,ad=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,ld=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,cd=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,hd=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,ud=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,dd=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,fd=`#ifdef USE_NORMALMAP
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
#endif`,pd=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,md=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,gd=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,_d=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,yd=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,vd=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,bd=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Md=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,xd=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Sd=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,wd=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Td=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Ed=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Ad=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Rd=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Cd=`float getShadowMask() {
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
}`,Pd=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Ld=`#ifdef USE_SKINNING
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
#endif`,Id=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Dd=`#ifdef USE_SKINNING
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
#endif`,Nd=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Ud=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Fd=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,kd=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Od=`#ifdef USE_TRANSMISSION
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
#endif`,Bd=`#ifdef USE_TRANSMISSION
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
#endif`,zd=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Gd=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Vd=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Hd=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Wd=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Xd=`uniform sampler2D t2D;
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
}`,Yd=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,qd=`#ifdef ENVMAP_TYPE_CUBE
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
}`,jd=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Kd=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Jd=`#include <common>
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
}`,Zd=`#if DEPTH_PACKING == 3200
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
}`,$d=`#define DISTANCE
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
}`,Qd=`#define DISTANCE
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
}`,ef=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,tf=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,nf=`uniform float scale;
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
}`,rf=`uniform vec3 diffuse;
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
}`,sf=`#include <common>
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
}`,of=`uniform vec3 diffuse;
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
}`,af=`#define LAMBERT
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
}`,lf=`#define LAMBERT
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
}`,cf=`#define MATCAP
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
}`,hf=`#define MATCAP
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
}`,uf=`#define NORMAL
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
}`,df=`#define NORMAL
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
}`,ff=`#define PHONG
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
}`,pf=`#define PHONG
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
}`,mf=`#define STANDARD
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
}`,gf=`#define STANDARD
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
}`,_f=`#define TOON
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
}`,yf=`#define TOON
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
}`,vf=`uniform float size;
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
}`,bf=`uniform vec3 diffuse;
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
}`,Mf=`#include <common>
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
}`,xf=`uniform vec3 color;
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
}`,Sf=`uniform float rotation;
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
}`,wf=`uniform vec3 diffuse;
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
}`,He={alphahash_fragment:Xh,alphahash_pars_fragment:Yh,alphamap_fragment:qh,alphamap_pars_fragment:jh,alphatest_fragment:Kh,alphatest_pars_fragment:Jh,aomap_fragment:Zh,aomap_pars_fragment:$h,batching_pars_vertex:Qh,batching_vertex:eu,begin_vertex:tu,beginnormal_vertex:nu,bsdfs:iu,iridescence_fragment:ru,bumpmap_pars_fragment:su,clipping_planes_fragment:ou,clipping_planes_pars_fragment:au,clipping_planes_pars_vertex:lu,clipping_planes_vertex:cu,color_fragment:hu,color_pars_fragment:uu,color_pars_vertex:du,color_vertex:fu,common:pu,cube_uv_reflection_fragment:mu,defaultnormal_vertex:gu,displacementmap_pars_vertex:_u,displacementmap_vertex:yu,emissivemap_fragment:vu,emissivemap_pars_fragment:bu,colorspace_fragment:Mu,colorspace_pars_fragment:xu,envmap_fragment:Su,envmap_common_pars_fragment:wu,envmap_pars_fragment:Tu,envmap_pars_vertex:Eu,envmap_physical_pars_fragment:ku,envmap_vertex:Au,fog_vertex:Ru,fog_pars_vertex:Cu,fog_fragment:Pu,fog_pars_fragment:Lu,gradientmap_pars_fragment:Iu,lightmap_pars_fragment:Du,lights_lambert_fragment:Nu,lights_lambert_pars_fragment:Uu,lights_pars_begin:Fu,lights_toon_fragment:Ou,lights_toon_pars_fragment:Bu,lights_phong_fragment:zu,lights_phong_pars_fragment:Gu,lights_physical_fragment:Vu,lights_physical_pars_fragment:Hu,lights_fragment_begin:Wu,lights_fragment_maps:Xu,lights_fragment_end:Yu,logdepthbuf_fragment:qu,logdepthbuf_pars_fragment:ju,logdepthbuf_pars_vertex:Ku,logdepthbuf_vertex:Ju,map_fragment:Zu,map_pars_fragment:$u,map_particle_fragment:Qu,map_particle_pars_fragment:ed,metalnessmap_fragment:td,metalnessmap_pars_fragment:nd,morphinstance_vertex:id,morphcolor_vertex:rd,morphnormal_vertex:sd,morphtarget_pars_vertex:od,morphtarget_vertex:ad,normal_fragment_begin:ld,normal_fragment_maps:cd,normal_pars_fragment:hd,normal_pars_vertex:ud,normal_vertex:dd,normalmap_pars_fragment:fd,clearcoat_normal_fragment_begin:pd,clearcoat_normal_fragment_maps:md,clearcoat_pars_fragment:gd,iridescence_pars_fragment:_d,opaque_fragment:yd,packing:vd,premultiplied_alpha_fragment:bd,project_vertex:Md,dithering_fragment:xd,dithering_pars_fragment:Sd,roughnessmap_fragment:wd,roughnessmap_pars_fragment:Td,shadowmap_pars_fragment:Ed,shadowmap_pars_vertex:Ad,shadowmap_vertex:Rd,shadowmask_pars_fragment:Cd,skinbase_vertex:Pd,skinning_pars_vertex:Ld,skinning_vertex:Id,skinnormal_vertex:Dd,specularmap_fragment:Nd,specularmap_pars_fragment:Ud,tonemapping_fragment:Fd,tonemapping_pars_fragment:kd,transmission_fragment:Od,transmission_pars_fragment:Bd,uv_pars_fragment:zd,uv_pars_vertex:Gd,uv_vertex:Vd,worldpos_vertex:Hd,background_vert:Wd,background_frag:Xd,backgroundCube_vert:Yd,backgroundCube_frag:qd,cube_vert:jd,cube_frag:Kd,depth_vert:Jd,depth_frag:Zd,distanceRGBA_vert:$d,distanceRGBA_frag:Qd,equirect_vert:ef,equirect_frag:tf,linedashed_vert:nf,linedashed_frag:rf,meshbasic_vert:sf,meshbasic_frag:of,meshlambert_vert:af,meshlambert_frag:lf,meshmatcap_vert:cf,meshmatcap_frag:hf,meshnormal_vert:uf,meshnormal_frag:df,meshphong_vert:ff,meshphong_frag:pf,meshphysical_vert:mf,meshphysical_frag:gf,meshtoon_vert:_f,meshtoon_frag:yf,points_vert:vf,points_frag:bf,shadow_vert:Mf,shadow_frag:xf,sprite_vert:Sf,sprite_frag:wf},fe={common:{diffuse:{value:new Ie(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ye},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ye}},envmap:{envMap:{value:null},envMapRotation:{value:new Ye},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ye}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ye}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ye},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ye},normalScale:{value:new re(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ye},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ye}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ye}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ye}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ie(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ie(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0},uvTransform:{value:new Ye}},sprite:{diffuse:{value:new Ie(16777215)},opacity:{value:1},center:{value:new re(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ye},alphaMap:{value:null},alphaMapTransform:{value:new Ye},alphaTest:{value:0}}},on={basic:{uniforms:Ft([fe.common,fe.specularmap,fe.envmap,fe.aomap,fe.lightmap,fe.fog]),vertexShader:He.meshbasic_vert,fragmentShader:He.meshbasic_frag},lambert:{uniforms:Ft([fe.common,fe.specularmap,fe.envmap,fe.aomap,fe.lightmap,fe.emissivemap,fe.bumpmap,fe.normalmap,fe.displacementmap,fe.fog,fe.lights,{emissive:{value:new Ie(0)}}]),vertexShader:He.meshlambert_vert,fragmentShader:He.meshlambert_frag},phong:{uniforms:Ft([fe.common,fe.specularmap,fe.envmap,fe.aomap,fe.lightmap,fe.emissivemap,fe.bumpmap,fe.normalmap,fe.displacementmap,fe.fog,fe.lights,{emissive:{value:new Ie(0)},specular:{value:new Ie(1118481)},shininess:{value:30}}]),vertexShader:He.meshphong_vert,fragmentShader:He.meshphong_frag},standard:{uniforms:Ft([fe.common,fe.envmap,fe.aomap,fe.lightmap,fe.emissivemap,fe.bumpmap,fe.normalmap,fe.displacementmap,fe.roughnessmap,fe.metalnessmap,fe.fog,fe.lights,{emissive:{value:new Ie(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:He.meshphysical_vert,fragmentShader:He.meshphysical_frag},toon:{uniforms:Ft([fe.common,fe.aomap,fe.lightmap,fe.emissivemap,fe.bumpmap,fe.normalmap,fe.displacementmap,fe.gradientmap,fe.fog,fe.lights,{emissive:{value:new Ie(0)}}]),vertexShader:He.meshtoon_vert,fragmentShader:He.meshtoon_frag},matcap:{uniforms:Ft([fe.common,fe.bumpmap,fe.normalmap,fe.displacementmap,fe.fog,{matcap:{value:null}}]),vertexShader:He.meshmatcap_vert,fragmentShader:He.meshmatcap_frag},points:{uniforms:Ft([fe.points,fe.fog]),vertexShader:He.points_vert,fragmentShader:He.points_frag},dashed:{uniforms:Ft([fe.common,fe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:He.linedashed_vert,fragmentShader:He.linedashed_frag},depth:{uniforms:Ft([fe.common,fe.displacementmap]),vertexShader:He.depth_vert,fragmentShader:He.depth_frag},normal:{uniforms:Ft([fe.common,fe.bumpmap,fe.normalmap,fe.displacementmap,{opacity:{value:1}}]),vertexShader:He.meshnormal_vert,fragmentShader:He.meshnormal_frag},sprite:{uniforms:Ft([fe.sprite,fe.fog]),vertexShader:He.sprite_vert,fragmentShader:He.sprite_frag},background:{uniforms:{uvTransform:{value:new Ye},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:He.background_vert,fragmentShader:He.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ye}},vertexShader:He.backgroundCube_vert,fragmentShader:He.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:He.cube_vert,fragmentShader:He.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:He.equirect_vert,fragmentShader:He.equirect_frag},distanceRGBA:{uniforms:Ft([fe.common,fe.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:He.distanceRGBA_vert,fragmentShader:He.distanceRGBA_frag},shadow:{uniforms:Ft([fe.lights,fe.fog,{color:{value:new Ie(0)},opacity:{value:1}}]),vertexShader:He.shadow_vert,fragmentShader:He.shadow_frag}};on.physical={uniforms:Ft([on.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ye},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ye},clearcoatNormalScale:{value:new re(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ye},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ye},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ye},sheen:{value:0},sheenColor:{value:new Ie(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ye},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ye},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ye},transmissionSamplerSize:{value:new re},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ye},attenuationDistance:{value:0},attenuationColor:{value:new Ie(0)},specularColor:{value:new Ie(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ye},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ye},anisotropyVector:{value:new re},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ye}}]),vertexShader:He.meshphysical_vert,fragmentShader:He.meshphysical_frag};const Er={r:0,b:0,g:0},On=new nn,Tf=new Ve;function Ef(n,e,t,i,r,s,o){const a=new Ie(0);let l=s===!0?0:1,c,h,u=null,p=0,f=null;function g(v){let M=v.isScene===!0?v.background:null;return M&&M.isTexture&&(M=(v.backgroundBlurriness>0?t:e).get(M)),M}function _(v){let M=!1;const x=g(v);x===null?d(a,l):x&&x.isColor&&(d(x,1),M=!0);const D=n.xr.getEnvironmentBlendMode();D==="additive"?i.buffers.color.setClear(0,0,0,1,o):D==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(n.autoClear||M)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function m(v,M){const x=g(M);x&&(x.isCubeTexture||x.mapping===306)?(h===void 0&&(h=new ut(new ht(1,1,1),new Ln({name:"BackgroundCubeMaterial",uniforms:Si(on.backgroundCube.uniforms),vertexShader:on.backgroundCube.vertexShader,fragmentShader:on.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(D,R,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(h)),On.copy(M.backgroundRotation),On.x*=-1,On.y*=-1,On.z*=-1,x.isCubeTexture&&x.isRenderTargetTexture===!1&&(On.y*=-1,On.z*=-1),h.material.uniforms.envMap.value=x,h.material.uniforms.flipEnvMap.value=x.isCubeTexture&&x.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(Tf.makeRotationFromEuler(On)),h.material.toneMapped=Qe.getTransfer(x.colorSpace)!==lt,(u!==x||p!==x.version||f!==n.toneMapping)&&(h.material.needsUpdate=!0,u=x,p=x.version,f=n.toneMapping),h.layers.enableAll(),v.unshift(h,h.geometry,h.material,0,0,null)):x&&x.isTexture&&(c===void 0&&(c=new ut(new wi(2,2),new Ln({name:"BackgroundMaterial",uniforms:Si(on.background.uniforms),vertexShader:on.background.vertexShader,fragmentShader:on.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=x,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.toneMapped=Qe.getTransfer(x.colorSpace)!==lt,x.matrixAutoUpdate===!0&&x.updateMatrix(),c.material.uniforms.uvTransform.value.copy(x.matrix),(u!==x||p!==x.version||f!==n.toneMapping)&&(c.material.needsUpdate=!0,u=x,p=x.version,f=n.toneMapping),c.layers.enableAll(),v.unshift(c,c.geometry,c.material,0,0,null))}function d(v,M){v.getRGB(Er,jl(n)),i.buffers.color.setClear(Er.r,Er.g,Er.b,M,o)}return{getClearColor:function(){return a},setClearColor:function(v,M=1){a.set(v),l=M,d(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(v){l=v,d(a,l)},render:_,addToRenderList:m}}function Af(n,e){const t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},r=p(null);let s=r,o=!1;function a(b,y,L,U,k){let j=!1;const z=u(U,L,y);s!==z&&(s=z,c(s.object)),j=f(b,U,L,k),j&&g(b,U,L,k),k!==null&&e.update(k,n.ELEMENT_ARRAY_BUFFER),(j||o)&&(o=!1,x(b,y,L,U),k!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(k).buffer))}function l(){return n.createVertexArray()}function c(b){return n.bindVertexArray(b)}function h(b){return n.deleteVertexArray(b)}function u(b,y,L){const U=L.wireframe===!0;let k=i[b.id];k===void 0&&(k={},i[b.id]=k);let j=k[y.id];j===void 0&&(j={},k[y.id]=j);let z=j[U];return z===void 0&&(z=p(l()),j[U]=z),z}function p(b){const y=[],L=[],U=[];for(let k=0;k<t;k++)y[k]=0,L[k]=0,U[k]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:y,enabledAttributes:L,attributeDivisors:U,object:b,attributes:{},index:null}}function f(b,y,L,U){const k=s.attributes,j=y.attributes;let z=0;const q=L.getAttributes();for(const N in q)if(q[N].location>=0){const he=k[N];let X=j[N];if(X===void 0&&(N==="instanceMatrix"&&b.instanceMatrix&&(X=b.instanceMatrix),N==="instanceColor"&&b.instanceColor&&(X=b.instanceColor)),he===void 0||he.attribute!==X||X&&he.data!==X.data)return!0;z++}return s.attributesNum!==z||s.index!==U}function g(b,y,L,U){const k={},j=y.attributes;let z=0;const q=L.getAttributes();for(const N in q)if(q[N].location>=0){let he=j[N];he===void 0&&(N==="instanceMatrix"&&b.instanceMatrix&&(he=b.instanceMatrix),N==="instanceColor"&&b.instanceColor&&(he=b.instanceColor));const X={};X.attribute=he,he&&he.data&&(X.data=he.data),k[N]=X,z++}s.attributes=k,s.attributesNum=z,s.index=U}function _(){const b=s.newAttributes;for(let y=0,L=b.length;y<L;y++)b[y]=0}function m(b){d(b,0)}function d(b,y){const L=s.newAttributes,U=s.enabledAttributes,k=s.attributeDivisors;L[b]=1,U[b]===0&&(n.enableVertexAttribArray(b),U[b]=1),k[b]!==y&&(n.vertexAttribDivisor(b,y),k[b]=y)}function v(){const b=s.newAttributes,y=s.enabledAttributes;for(let L=0,U=y.length;L<U;L++)y[L]!==b[L]&&(n.disableVertexAttribArray(L),y[L]=0)}function M(b,y,L,U,k,j,z){z===!0?n.vertexAttribIPointer(b,y,L,k,j):n.vertexAttribPointer(b,y,L,U,k,j)}function x(b,y,L,U){_();const k=U.attributes,j=L.getAttributes(),z=y.defaultAttributeValues;for(const q in j){const N=j[q];if(N.location>=0){let K=k[q];if(K===void 0&&(q==="instanceMatrix"&&b.instanceMatrix&&(K=b.instanceMatrix),q==="instanceColor"&&b.instanceColor&&(K=b.instanceColor)),K!==void 0){const he=K.normalized,X=K.itemSize,Q=e.get(K);if(Q===void 0)continue;const we=Q.buffer,W=Q.type,oe=Q.bytesPerElement,se=W===n.INT||W===n.UNSIGNED_INT||K.gpuType===1013;if(K.isInterleavedBufferAttribute){const ae=K.data,Pe=ae.stride,Oe=K.offset;if(ae.isInstancedInterleavedBuffer){for(let De=0;De<N.locationSize;De++)d(N.location+De,ae.meshPerAttribute);b.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=ae.meshPerAttribute*ae.count)}else for(let De=0;De<N.locationSize;De++)m(N.location+De);n.bindBuffer(n.ARRAY_BUFFER,we);for(let De=0;De<N.locationSize;De++)M(N.location+De,X/N.locationSize,W,he,Pe*oe,(Oe+X/N.locationSize*De)*oe,se)}else{if(K.isInstancedBufferAttribute){for(let ae=0;ae<N.locationSize;ae++)d(N.location+ae,K.meshPerAttribute);b.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=K.meshPerAttribute*K.count)}else for(let ae=0;ae<N.locationSize;ae++)m(N.location+ae);n.bindBuffer(n.ARRAY_BUFFER,we);for(let ae=0;ae<N.locationSize;ae++)M(N.location+ae,X/N.locationSize,W,he,X*oe,X/N.locationSize*ae*oe,se)}}else if(z!==void 0){const he=z[q];if(he!==void 0)switch(he.length){case 2:n.vertexAttrib2fv(N.location,he);break;case 3:n.vertexAttrib3fv(N.location,he);break;case 4:n.vertexAttrib4fv(N.location,he);break;default:n.vertexAttrib1fv(N.location,he)}}}}v()}function D(){w();for(const b in i){const y=i[b];for(const L in y){const U=y[L];for(const k in U)h(U[k].object),delete U[k];delete y[L]}delete i[b]}}function R(b){if(i[b.id]===void 0)return;const y=i[b.id];for(const L in y){const U=y[L];for(const k in U)h(U[k].object),delete U[k];delete y[L]}delete i[b.id]}function A(b){for(const y in i){const L=i[y];if(L[b.id]===void 0)continue;const U=L[b.id];for(const k in U)h(U[k].object),delete U[k];delete L[b.id]}}function w(){S(),o=!0,s!==r&&(s=r,c(s.object))}function S(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:a,reset:w,resetDefaultState:S,dispose:D,releaseStatesOfGeometry:R,releaseStatesOfProgram:A,initAttributes:_,enableAttribute:m,disableUnusedAttributes:v}}function Rf(n,e,t){let i;function r(c){i=c}function s(c,h){n.drawArrays(i,c,h),t.update(h,i,1)}function o(c,h,u){u!==0&&(n.drawArraysInstanced(i,c,h,u),t.update(h,i,u))}function a(c,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,h,0,u);let f=0;for(let g=0;g<u;g++)f+=h[g];t.update(f,i,1)}function l(c,h,u,p){if(u===0)return;const f=e.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<c.length;g++)o(c[g],h[g],p[g]);else{f.multiDrawArraysInstancedWEBGL(i,c,0,h,0,p,0,u);let g=0;for(let _=0;_<u;_++)g+=h[_]*p[_];t.update(g,i,1)}}this.setMode=r,this.render=s,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function Cf(n,e,t,i){let r;function s(){if(r!==void 0)return r;if(e.has("EXT_texture_filter_anisotropic")===!0){const A=e.get("EXT_texture_filter_anisotropic");r=n.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function o(A){return!(A!==1023&&i.convert(A)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(A){const w=A===1016&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==1009&&i.convert(A)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&A!==1015&&!w)}function l(A){if(A==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const u=t.logarithmicDepthBuffer===!0,p=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),f=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),g=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=n.getParameter(n.MAX_TEXTURE_SIZE),m=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),d=n.getParameter(n.MAX_VERTEX_ATTRIBS),v=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),M=n.getParameter(n.MAX_VARYING_VECTORS),x=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),D=g>0,R=n.getParameter(n.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:u,reverseDepthBuffer:p,maxTextures:f,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:m,maxAttributes:d,maxVertexUniforms:v,maxVaryings:M,maxFragmentUniforms:x,vertexTextures:D,maxSamples:R}}function Pf(n){const e=this;let t=null,i=0,r=!1,s=!1;const o=new Gn,a=new Ye,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,p){const f=u.length!==0||p||i!==0||r;return r=p,i=u.length,f},this.beginShadows=function(){s=!0,h(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(u,p){t=h(u,p,0)},this.setState=function(u,p,f){const g=u.clippingPlanes,_=u.clipIntersection,m=u.clipShadows,d=n.get(u);if(!r||g===null||g.length===0||s&&!m)s?h(null):c();else{const v=s?0:i,M=v*4;let x=d.clippingState||null;l.value=x,x=h(g,p,M,f);for(let D=0;D!==M;++D)x[D]=t[D];d.clippingState=x,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=v}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function h(u,p,f,g){const _=u!==null?u.length:0;let m=null;if(_!==0){if(m=l.value,g!==!0||m===null){const d=f+_*4,v=p.matrixWorldInverse;a.getNormalMatrix(v),(m===null||m.length<d)&&(m=new Float32Array(d));for(let M=0,x=f;M!==_;++M,x+=4)o.copy(u[M]).applyMatrix4(v,a),o.normal.toArray(m,x),m[x+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,m}}function Lf(n){let e=new WeakMap;function t(o,a){return a===303?o.mapping=301:a===304&&(o.mapping=302),o}function i(o){if(o&&o.isTexture){const a=o.mapping;if(a===303||a===304)if(e.has(o)){const l=e.get(o).texture;return t(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new Gh(l.height);return c.fromEquirectangularTexture(n,o),e.set(o,c),o.addEventListener("dispose",r),t(c.texture,o.mapping)}else return null}}return o}function r(o){const a=o.target;a.removeEventListener("dispose",r);const l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function s(){e=new WeakMap}return{get:i,dispose:s}}class $l extends Kl{constructor(e=-1,t=1,i=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let s=i-e,o=i+e,a=r+t,l=r-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,o=s+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const mi=4,Ta=[.125,.215,.35,.446,.526,.582],Wn=20,ks=new $l,Ea=new Ie;let Os=null,Bs=0,zs=0,Gs=!1;const Vn=(1+Math.sqrt(5))/2,li=1/Vn,Aa=[new P(-Vn,li,0),new P(Vn,li,0),new P(-li,0,Vn),new P(li,0,Vn),new P(0,Vn,-li),new P(0,Vn,li),new P(-1,1,-1),new P(1,1,-1),new P(-1,1,1),new P(1,1,1)];class Ra{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,r=100){Os=this._renderer.getRenderTarget(),Bs=this._renderer.getActiveCubeFace(),zs=this._renderer.getActiveMipmapLevel(),Gs=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(e,i,r,s),t>0&&this._blur(s,0,0,t),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=La(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Pa(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(Os,Bs,zs),this._renderer.xr.enabled=Gs,e.scissorTest=!1,Ar(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Os=this._renderer.getRenderTarget(),Bs=this._renderer.getActiveCubeFace(),zs=this._renderer.getActiveMipmapLevel(),Gs=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:1006,minFilter:1006,generateMipmaps:!1,type:1016,format:1023,colorSpace:Ai,depthBuffer:!1},r=Ca(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Ca(e,t,i);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=If(s)),this._blurMaterial=Df(s,e,t)}return r}_compileMaterial(e){const t=new ut(this._lodPlanes[0],e);this._renderer.compile(t,ks)}_sceneToCubeUV(e,t,i,r){const a=new Vt(90,1,t,i),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,p=h.toneMapping;h.getClearColor(Ea),h.toneMapping=0,h.autoClear=!1;const f=new Co({name:"PMREM.Background",side:1,depthWrite:!1,depthTest:!1}),g=new ut(new ht,f);let _=!1;const m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,_=!0):(f.color.copy(Ea),_=!0);for(let d=0;d<6;d++){const v=d%3;v===0?(a.up.set(0,l[d],0),a.lookAt(c[d],0,0)):v===1?(a.up.set(0,0,l[d]),a.lookAt(0,c[d],0)):(a.up.set(0,l[d],0),a.lookAt(0,0,c[d]));const M=this._cubeSize;Ar(r,v*M,d>2?M:0,M,M),h.setRenderTarget(r),_&&h.render(g,a),h.render(e,a)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=p,h.autoClear=u,e.background=m}_textureToCubeUV(e,t){const i=this._renderer,r=e.mapping===301||e.mapping===302;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=La()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Pa());const s=r?this._cubemapMaterial:this._equirectMaterial,o=new ut(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=e;const l=this._cubeSize;Ar(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(o,ks)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const r=this._lodPlanes.length;for(let s=1;s<r;s++){const o=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),a=Aa[(r-s-1)%Aa.length];this._blur(e,s-1,s,o,a)}t.autoClear=i}_blur(e,t,i,r,s){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,i,r,"latitudinal",s),this._halfBlur(o,e,i,i,r,"longitudinal",s)}_halfBlur(e,t,i,r,s,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new ut(this._lodPlanes[r],c),p=c.uniforms,f=this._sizeLods[i]-1,g=isFinite(s)?Math.PI/(2*f):2*Math.PI/(2*Wn-1),_=s/g,m=isFinite(s)?1+Math.floor(h*_):Wn;m>Wn&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Wn}`);const d=[];let v=0;for(let A=0;A<Wn;++A){const w=A/_,S=Math.exp(-w*w/2);d.push(S),A===0?v+=S:A<m&&(v+=2*S)}for(let A=0;A<d.length;A++)d[A]=d[A]/v;p.envMap.value=e.texture,p.samples.value=m,p.weights.value=d,p.latitudinal.value=o==="latitudinal",a&&(p.poleAxis.value=a);const{_lodMax:M}=this;p.dTheta.value=g,p.mipInt.value=M-i;const x=this._sizeLods[r],D=3*x*(r>M-mi?r-M+mi:0),R=4*(this._cubeSize-x);Ar(t,D,R,3*x,2*x),l.setRenderTarget(t),l.render(u,ks)}}function If(n){const e=[],t=[],i=[];let r=n;const s=n-mi+1+Ta.length;for(let o=0;o<s;o++){const a=Math.pow(2,r);t.push(a);let l=1/a;o>n-mi?l=Ta[o-n+mi-1]:o===0&&(l=0),i.push(l);const c=1/(a-2),h=-c,u=1+c,p=[h,h,u,h,u,u,h,h,u,u,h,u],f=6,g=6,_=3,m=2,d=1,v=new Float32Array(_*g*f),M=new Float32Array(m*g*f),x=new Float32Array(d*g*f);for(let R=0;R<f;R++){const A=R%3*2/3-1,w=R>2?0:-1,S=[A,w,0,A+2/3,w,0,A+2/3,w+1,0,A,w,0,A+2/3,w+1,0,A,w+1,0];v.set(S,_*g*R),M.set(p,m*g*R);const b=[R,R,R,R,R,R];x.set(b,d*g*R)}const D=new yt;D.setAttribute("position",new Nt(v,_)),D.setAttribute("uv",new Nt(M,m)),D.setAttribute("faceIndex",new Nt(x,d)),e.push(D),r>mi&&r--}return{lodPlanes:e,sizeLods:t,sigmas:i}}function Ca(n,e,t){const i=new qn(n,e,t);return i.texture.mapping=306,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Ar(n,e,t,i,r){n.viewport.set(e,t,i,r),n.scissor.set(e,t,i,r)}function Df(n,e,t){const i=new Float32Array(Wn),r=new P(0,1,0);return new Ln({name:"SphericalGaussianBlur",defines:{n:Wn,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:Io(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})}function Pa(){return new Ln({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Io(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})}function La(){return new Ln({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Io(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Io(){return`

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
	`}function Nf(n){let e=new WeakMap,t=null;function i(a){if(a&&a.isTexture){const l=a.mapping,c=l===303||l===304,h=l===301||l===302;if(c||h){let u=e.get(a);const p=u!==void 0?u.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==p)return t===null&&(t=new Ra(n)),u=c?t.fromEquirectangular(a,u):t.fromCubemap(a,u),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),u.texture;if(u!==void 0)return u.texture;{const f=a.image;return c&&f&&f.height>0||h&&f&&r(f)?(t===null&&(t=new Ra(n)),u=c?t.fromEquirectangular(a):t.fromCubemap(a),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),a.addEventListener("dispose",s),u.texture):null}}}return a}function r(a){let l=0;const c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function s(a){const l=a.target;l.removeEventListener("dispose",s);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:o}}function Uf(n){const e={};function t(i){if(e[i]!==void 0)return e[i];let r;switch(i){case"WEBGL_depth_texture":r=n.getExtension("WEBGL_depth_texture")||n.getExtension("MOZ_WEBGL_depth_texture")||n.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=n.getExtension("EXT_texture_filter_anisotropic")||n.getExtension("MOZ_EXT_texture_filter_anisotropic")||n.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=n.getExtension("WEBGL_compressed_texture_s3tc")||n.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=n.getExtension("WEBGL_compressed_texture_pvrtc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=n.getExtension(i)}return e[i]=r,r}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const r=t(i);return r===null&&ji("THREE.WebGLRenderer: "+i+" extension not supported."),r}}}function Ff(n,e,t,i){const r={},s=new WeakMap;function o(u){const p=u.target;p.index!==null&&e.remove(p.index);for(const g in p.attributes)e.remove(p.attributes[g]);for(const g in p.morphAttributes){const _=p.morphAttributes[g];for(let m=0,d=_.length;m<d;m++)e.remove(_[m])}p.removeEventListener("dispose",o),delete r[p.id];const f=s.get(p);f&&(e.remove(f),s.delete(p)),i.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,t.memory.geometries--}function a(u,p){return r[p.id]===!0||(p.addEventListener("dispose",o),r[p.id]=!0,t.memory.geometries++),p}function l(u){const p=u.attributes;for(const g in p)e.update(p[g],n.ARRAY_BUFFER);const f=u.morphAttributes;for(const g in f){const _=f[g];for(let m=0,d=_.length;m<d;m++)e.update(_[m],n.ARRAY_BUFFER)}}function c(u){const p=[],f=u.index,g=u.attributes.position;let _=0;if(f!==null){const v=f.array;_=f.version;for(let M=0,x=v.length;M<x;M+=3){const D=v[M+0],R=v[M+1],A=v[M+2];p.push(D,R,R,A,A,D)}}else if(g!==void 0){const v=g.array;_=g.version;for(let M=0,x=v.length/3-1;M<x;M+=3){const D=M+0,R=M+1,A=M+2;p.push(D,R,R,A,A,D)}}else return;const m=new(Hl(p)?ql:Po)(p,1);m.version=_;const d=s.get(u);d&&e.remove(d),s.set(u,m)}function h(u){const p=s.get(u);if(p){const f=u.index;f!==null&&p.version<f.version&&c(u)}else c(u);return s.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function kf(n,e,t){let i;function r(p){i=p}let s,o;function a(p){s=p.type,o=p.bytesPerElement}function l(p,f){n.drawElements(i,f,s,p*o),t.update(f,i,1)}function c(p,f,g){g!==0&&(n.drawElementsInstanced(i,f,s,p*o,g),t.update(f,i,g))}function h(p,f,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,f,0,s,p,0,g);let m=0;for(let d=0;d<g;d++)m+=f[d];t.update(m,i,1)}function u(p,f,g,_){if(g===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let d=0;d<p.length;d++)c(p[d]/o,f[d],_[d]);else{m.multiDrawElementsInstancedWEBGL(i,f,0,s,p,0,_,0,g);let d=0;for(let v=0;v<g;v++)d+=f[v]*_[v];t.update(d,i,1)}}this.setMode=r,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function Of(n){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,o,a){switch(t.calls++,o){case n.TRIANGLES:t.triangles+=a*(s/3);break;case n.LINES:t.lines+=a*(s/2);break;case n.LINE_STRIP:t.lines+=a*(s-1);break;case n.LINE_LOOP:t.lines+=a*s;break;case n.POINTS:t.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function r(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:r,update:i}}function Bf(n,e,t){const i=new WeakMap,r=new tt;function s(o,a,l){const c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0;let p=i.get(a);if(p===void 0||p.count!==u){let S=function(){A.dispose(),i.delete(a),a.removeEventListener("dispose",S)};p!==void 0&&p.texture.dispose();const f=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,_=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],d=a.morphAttributes.normal||[],v=a.morphAttributes.color||[];let M=0;f===!0&&(M=1),g===!0&&(M=2),_===!0&&(M=3);let x=a.attributes.position.count*M,D=1;x>e.maxTextureSize&&(D=Math.ceil(x/e.maxTextureSize),x=e.maxTextureSize);const R=new Float32Array(x*D*4*u),A=new Xl(R,x,D,u);A.type=1015,A.needsUpdate=!0;const w=M*4;for(let b=0;b<u;b++){const y=m[b],L=d[b],U=v[b],k=x*D*4*b;for(let j=0;j<y.count;j++){const z=j*w;f===!0&&(r.fromBufferAttribute(y,j),R[k+z+0]=r.x,R[k+z+1]=r.y,R[k+z+2]=r.z,R[k+z+3]=0),g===!0&&(r.fromBufferAttribute(L,j),R[k+z+4]=r.x,R[k+z+5]=r.y,R[k+z+6]=r.z,R[k+z+7]=0),_===!0&&(r.fromBufferAttribute(U,j),R[k+z+8]=r.x,R[k+z+9]=r.y,R[k+z+10]=r.z,R[k+z+11]=U.itemSize===4?r.w:1)}}p={count:u,texture:A,size:new re(x,D)},i.set(a,p),a.addEventListener("dispose",S)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",o.morphTexture,t);else{let f=0;for(let _=0;_<c.length;_++)f+=c[_];const g=a.morphTargetsRelative?1:1-f;l.getUniforms().setValue(n,"morphTargetBaseInfluence",g),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",p.texture,t),l.getUniforms().setValue(n,"morphTargetsTextureSize",p.size)}return{update:s}}function zf(n,e,t,i){let r=new WeakMap;function s(l){const c=i.render.frame,h=l.geometry,u=e.get(l,h);if(r.get(u)!==c&&(e.update(u),r.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),r.get(l)!==c&&(t.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,n.ARRAY_BUFFER),r.set(l,c))),l.isSkinnedMesh){const p=l.skeleton;r.get(p)!==c&&(p.update(),r.set(p,c))}return u}function o(){r=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:s,dispose:o}}class Ql extends Ct{constructor(e,t,i,r,s,o,a,l,c,h=1026){if(h!==1026&&h!==1027)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&h===1026&&(i=1014),i===void 0&&h===1027&&(i=1020),super(null,r,s,o,a,l,h,i,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:1003,this.minFilter=l!==void 0?l:1003,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const ec=new Ct,Ia=new Ql(1,1),tc=new Xl,nc=new xh,ic=new Jl,Da=[],Na=[],Ua=new Float32Array(16),Fa=new Float32Array(9),ka=new Float32Array(4);function Ci(n,e,t){const i=n[0];if(i<=0||i>0)return n;const r=e*t;let s=Da[r];if(s===void 0&&(s=new Float32Array(r),Da[r]=s),e!==0){i.toArray(s,0);for(let o=1,a=0;o!==e;++o)a+=t,n[o].toArray(s,a)}return s}function Et(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function At(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function os(n,e){let t=Na[e];t===void 0&&(t=new Int32Array(e),Na[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function Gf(n,e){const t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function Vf(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;n.uniform2fv(this.addr,e),At(t,e)}}function Hf(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Et(t,e))return;n.uniform3fv(this.addr,e),At(t,e)}}function Wf(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;n.uniform4fv(this.addr,e),At(t,e)}}function Xf(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Et(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),At(t,e)}else{if(Et(t,i))return;ka.set(i),n.uniformMatrix2fv(this.addr,!1,ka),At(t,i)}}function Yf(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Et(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),At(t,e)}else{if(Et(t,i))return;Fa.set(i),n.uniformMatrix3fv(this.addr,!1,Fa),At(t,i)}}function qf(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Et(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),At(t,e)}else{if(Et(t,i))return;Ua.set(i),n.uniformMatrix4fv(this.addr,!1,Ua),At(t,i)}}function jf(n,e){const t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function Kf(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;n.uniform2iv(this.addr,e),At(t,e)}}function Jf(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Et(t,e))return;n.uniform3iv(this.addr,e),At(t,e)}}function Zf(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;n.uniform4iv(this.addr,e),At(t,e)}}function $f(n,e){const t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function Qf(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;n.uniform2uiv(this.addr,e),At(t,e)}}function ep(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Et(t,e))return;n.uniform3uiv(this.addr,e),At(t,e)}}function tp(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;n.uniform4uiv(this.addr,e),At(t,e)}}function np(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r);let s;this.type===n.SAMPLER_2D_SHADOW?(Ia.compareFunction=515,s=Ia):s=ec,t.setTexture2D(e||s,r)}function ip(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture3D(e||nc,r)}function rp(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTextureCube(e||ic,r)}function sp(n,e,t){const i=this.cache,r=t.allocateTextureUnit();i[0]!==r&&(n.uniform1i(this.addr,r),i[0]=r),t.setTexture2DArray(e||tc,r)}function op(n){switch(n){case 5126:return Gf;case 35664:return Vf;case 35665:return Hf;case 35666:return Wf;case 35674:return Xf;case 35675:return Yf;case 35676:return qf;case 5124:case 35670:return jf;case 35667:case 35671:return Kf;case 35668:case 35672:return Jf;case 35669:case 35673:return Zf;case 5125:return $f;case 36294:return Qf;case 36295:return ep;case 36296:return tp;case 35678:case 36198:case 36298:case 36306:case 35682:return np;case 35679:case 36299:case 36307:return ip;case 35680:case 36300:case 36308:case 36293:return rp;case 36289:case 36303:case 36311:case 36292:return sp}}function ap(n,e){n.uniform1fv(this.addr,e)}function lp(n,e){const t=Ci(e,this.size,2);n.uniform2fv(this.addr,t)}function cp(n,e){const t=Ci(e,this.size,3);n.uniform3fv(this.addr,t)}function hp(n,e){const t=Ci(e,this.size,4);n.uniform4fv(this.addr,t)}function up(n,e){const t=Ci(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function dp(n,e){const t=Ci(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function fp(n,e){const t=Ci(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function pp(n,e){n.uniform1iv(this.addr,e)}function mp(n,e){n.uniform2iv(this.addr,e)}function gp(n,e){n.uniform3iv(this.addr,e)}function _p(n,e){n.uniform4iv(this.addr,e)}function yp(n,e){n.uniform1uiv(this.addr,e)}function vp(n,e){n.uniform2uiv(this.addr,e)}function bp(n,e){n.uniform3uiv(this.addr,e)}function Mp(n,e){n.uniform4uiv(this.addr,e)}function xp(n,e,t){const i=this.cache,r=e.length,s=os(t,r);Et(i,s)||(n.uniform1iv(this.addr,s),At(i,s));for(let o=0;o!==r;++o)t.setTexture2D(e[o]||ec,s[o])}function Sp(n,e,t){const i=this.cache,r=e.length,s=os(t,r);Et(i,s)||(n.uniform1iv(this.addr,s),At(i,s));for(let o=0;o!==r;++o)t.setTexture3D(e[o]||nc,s[o])}function wp(n,e,t){const i=this.cache,r=e.length,s=os(t,r);Et(i,s)||(n.uniform1iv(this.addr,s),At(i,s));for(let o=0;o!==r;++o)t.setTextureCube(e[o]||ic,s[o])}function Tp(n,e,t){const i=this.cache,r=e.length,s=os(t,r);Et(i,s)||(n.uniform1iv(this.addr,s),At(i,s));for(let o=0;o!==r;++o)t.setTexture2DArray(e[o]||tc,s[o])}function Ep(n){switch(n){case 5126:return ap;case 35664:return lp;case 35665:return cp;case 35666:return hp;case 35674:return up;case 35675:return dp;case 35676:return fp;case 5124:case 35670:return pp;case 35667:case 35671:return mp;case 35668:case 35672:return gp;case 35669:case 35673:return _p;case 5125:return yp;case 36294:return vp;case 36295:return bp;case 36296:return Mp;case 35678:case 36198:case 36298:case 36306:case 35682:return xp;case 35679:case 36299:case 36307:return Sp;case 35680:case 36300:case 36308:case 36293:return wp;case 36289:case 36303:case 36311:case 36292:return Tp}}class Ap{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=op(t.type)}}class Rp{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Ep(t.type)}}class Cp{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const r=this.seq;for(let s=0,o=r.length;s!==o;++s){const a=r[s];a.setValue(e,t[a.id],i)}}}const Vs=/(\w+)(\])?(\[|\.)?/g;function Oa(n,e){n.seq.push(e),n.map[e.id]=e}function Pp(n,e,t){const i=n.name,r=i.length;for(Vs.lastIndex=0;;){const s=Vs.exec(i),o=Vs.lastIndex;let a=s[1];const l=s[2]==="]",c=s[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===r){Oa(t,c===void 0?new Ap(a,n,e):new Rp(a,n,e));break}else{let u=t.map[a];u===void 0&&(u=new Cp(a),Oa(t,u)),t=u}}}class Hr{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let r=0;r<i;++r){const s=e.getActiveUniform(t,r),o=e.getUniformLocation(t,s.name);Pp(s,o,this)}}setValue(e,t,i,r){const s=this.map[t];s!==void 0&&s.setValue(e,i,r)}setOptional(e,t,i){const r=t[i];r!==void 0&&this.setValue(e,i,r)}static upload(e,t,i,r){for(let s=0,o=t.length;s!==o;++s){const a=t[s],l=i[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,r)}}static seqWithValue(e,t){const i=[];for(let r=0,s=e.length;r!==s;++r){const o=e[r];o.id in t&&i.push(o)}return i}}function Ba(n,e,t){const i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}const Lp=37297;let Ip=0;function Dp(n,e){const t=n.split(`
`),i=[],r=Math.max(e-6,0),s=Math.min(e+6,t.length);for(let o=r;o<s;o++){const a=o+1;i.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return i.join(`
`)}const za=new Ye;function Np(n){Qe._getMatrix(za,Qe.workingColorSpace,n);const e=`mat3( ${za.elements.map(t=>t.toFixed(4))} )`;switch(Qe.getTransfer(n)){case ss:return[e,"LinearTransferOETF"];case lt:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function Ga(n,e,t){const i=n.getShaderParameter(e,n.COMPILE_STATUS),r=n.getShaderInfoLog(e).trim();if(i&&r==="")return"";const s=/ERROR: 0:(\d+)/.exec(r);if(s){const o=parseInt(s[1]);return t.toUpperCase()+`

`+r+`

`+Dp(n.getShaderSource(e),o)}else return r}function Up(n,e){const t=Np(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function Fp(n,e){let t;switch(e){case 1:t="Linear";break;case 2:t="Reinhard";break;case 3:t="Cineon";break;case 4:t="ACESFilmic";break;case 6:t="AgX";break;case 7:t="Neutral";break;case 5:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Rr=new P;function kp(){Qe.getLuminanceCoefficients(Rr);const n=Rr.x.toFixed(4),e=Rr.y.toFixed(4),t=Rr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Op(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Ki).join(`
`)}function Bp(n){const e=[];for(const t in n){const i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function zp(n,e){const t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let r=0;r<i;r++){const s=n.getActiveAttrib(e,r),o=s.name;let a=1;s.type===n.FLOAT_MAT2&&(a=2),s.type===n.FLOAT_MAT3&&(a=3),s.type===n.FLOAT_MAT4&&(a=4),t[o]={type:s.type,location:n.getAttribLocation(e,o),locationSize:a}}return t}function Ki(n){return n!==""}function Va(n,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Ha(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const Gp=/^[ \t]*#include +<([\w\d./]+)>/gm;function lo(n){return n.replace(Gp,Hp)}const Vp=new Map;function Hp(n,e){let t=He[e];if(t===void 0){const i=Vp.get(e);if(i!==void 0)t=He[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return lo(t)}const Wp=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Wa(n){return n.replace(Wp,Xp)}function Xp(n,e,t,i){let r="";for(let s=parseInt(e);s<parseInt(t);s++)r+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function Xa(n){let e=`precision ${n.precision} float;
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
#define LOW_PRECISION`),e}function Yp(n){let e="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===1?e="SHADOWMAP_TYPE_PCF":n.shadowMapType===2?e="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===3&&(e="SHADOWMAP_TYPE_VSM"),e}function qp(n){let e="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case 301:case 302:e="ENVMAP_TYPE_CUBE";break;case 306:e="ENVMAP_TYPE_CUBE_UV";break}return e}function jp(n){let e="ENVMAP_MODE_REFLECTION";if(n.envMap)switch(n.envMapMode){case 302:e="ENVMAP_MODE_REFRACTION";break}return e}function Kp(n){let e="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case 0:e="ENVMAP_BLENDING_MULTIPLY";break;case 1:e="ENVMAP_BLENDING_MIX";break;case 2:e="ENVMAP_BLENDING_ADD";break}return e}function Jp(n){const e=n.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function Zp(n,e,t,i){const r=n.getContext(),s=t.defines;let o=t.vertexShader,a=t.fragmentShader;const l=Yp(t),c=qp(t),h=jp(t),u=Kp(t),p=Jp(t),f=Op(t),g=Bp(s),_=r.createProgram();let m,d,v=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Ki).join(`
`),m.length>0&&(m+=`
`),d=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Ki).join(`
`),d.length>0&&(d+=`
`)):(m=[Xa(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Ki).join(`
`),d=[Xa(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",p?"#define CUBEUV_TEXEL_WIDTH "+p.texelWidth:"",p?"#define CUBEUV_TEXEL_HEIGHT "+p.texelHeight:"",p?"#define CUBEUV_MAX_MIP "+p.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==0?"#define TONE_MAPPING":"",t.toneMapping!==0?He.tonemapping_pars_fragment:"",t.toneMapping!==0?Fp("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",He.colorspace_pars_fragment,Up("linearToOutputTexel",t.outputColorSpace),kp(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Ki).join(`
`)),o=lo(o),o=Va(o,t),o=Ha(o,t),a=lo(a),a=Va(a,t),a=Ha(a,t),o=Wa(o),a=Wa(a),t.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,d=["#define varying in",t.glslVersion===ia?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===ia?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);const M=v+m+o,x=v+d+a,D=Ba(r,r.VERTEX_SHADER,M),R=Ba(r,r.FRAGMENT_SHADER,x);r.attachShader(_,D),r.attachShader(_,R),t.index0AttributeName!==void 0?r.bindAttribLocation(_,0,t.index0AttributeName):t.morphTargets===!0&&r.bindAttribLocation(_,0,"position"),r.linkProgram(_);function A(y){if(n.debug.checkShaderErrors){const L=r.getProgramInfoLog(_).trim(),U=r.getShaderInfoLog(D).trim(),k=r.getShaderInfoLog(R).trim();let j=!0,z=!0;if(r.getProgramParameter(_,r.LINK_STATUS)===!1)if(j=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(r,_,D,R);else{const q=Ga(r,D,"vertex"),N=Ga(r,R,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(_,r.VALIDATE_STATUS)+`

Material Name: `+y.name+`
Material Type: `+y.type+`

Program Info Log: `+L+`
`+q+`
`+N)}else L!==""?console.warn("THREE.WebGLProgram: Program Info Log:",L):(U===""||k==="")&&(z=!1);z&&(y.diagnostics={runnable:j,programLog:L,vertexShader:{log:U,prefix:m},fragmentShader:{log:k,prefix:d}})}r.deleteShader(D),r.deleteShader(R),w=new Hr(r,_),S=zp(r,_)}let w;this.getUniforms=function(){return w===void 0&&A(this),w};let S;this.getAttributes=function(){return S===void 0&&A(this),S};let b=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return b===!1&&(b=r.getProgramParameter(_,Lp)),b},this.destroy=function(){i.releaseStatesOfProgram(this),r.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Ip++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=D,this.fragmentShader=R,this}let $p=0;class Qp{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,i=e.fragmentShader,r=this._getShaderStage(t),s=this._getShaderStage(i),o=this._getShaderCacheForMaterial(e);return o.has(r)===!1&&(o.add(r),r.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new em(e),t.set(e,i)),i}}class em{constructor(e){this.id=$p++,this.code=e,this.usedTimes=0}}function tm(n,e,t,i,r,s,o){const a=new Ro,l=new Qp,c=new Set,h=[],u=r.logarithmicDepthBuffer,p=r.vertexTextures;let f=r.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(S){return c.add(S),S===0?"uv":`uv${S}`}function m(S,b,y,L,U){const k=L.fog,j=U.geometry,z=S.isMeshStandardMaterial?L.environment:null,q=(S.isMeshStandardMaterial?t:e).get(S.envMap||z),N=q&&q.mapping===306?q.image.height:null,K=g[S.type];S.precision!==null&&(f=r.getMaxPrecision(S.precision),f!==S.precision&&console.warn("THREE.WebGLProgram.getParameters:",S.precision,"not supported, using",f,"instead."));const he=j.morphAttributes.position||j.morphAttributes.normal||j.morphAttributes.color,X=he!==void 0?he.length:0;let Q=0;j.morphAttributes.position!==void 0&&(Q=1),j.morphAttributes.normal!==void 0&&(Q=2),j.morphAttributes.color!==void 0&&(Q=3);let we,W,oe,se;if(K){const st=on[K];we=st.vertexShader,W=st.fragmentShader}else we=S.vertexShader,W=S.fragmentShader,l.update(S),oe=l.getVertexShaderID(S),se=l.getFragmentShaderID(S);const ae=n.getRenderTarget(),Pe=n.state.buffers.depth.getReversed(),Oe=U.isInstancedMesh===!0,De=U.isBatchedMesh===!0,Je=!!S.map,te=!!S.matcap,Y=!!q,I=!!S.aoMap,ue=!!S.lightMap,ee=!!S.bumpMap,ve=!!S.normalMap,de=!!S.displacementMap,Ue=!!S.emissiveMap,be=!!S.metalnessMap,C=!!S.roughnessMap,T=S.anisotropy>0,G=S.clearcoat>0,Z=S.dispersion>0,ie=S.iridescence>0,$=S.sheen>0,Te=S.transmission>0,pe=T&&!!S.anisotropyMap,Me=G&&!!S.clearcoatMap,Ze=G&&!!S.clearcoatNormalMap,le=G&&!!S.clearcoatRoughnessMap,xe=ie&&!!S.iridescenceMap,Fe=ie&&!!S.iridescenceThicknessMap,Be=$&&!!S.sheenColorMap,Se=$&&!!S.sheenRoughnessMap,$e=!!S.specularMap,je=!!S.specularColorMap,dt=!!S.specularIntensityMap,F=Te&&!!S.transmissionMap,me=Te&&!!S.thicknessMap,J=!!S.gradientMap,ne=!!S.alphaMap,ye=S.alphaTest>0,ge=!!S.alphaHash,We=!!S.extensions;let Mt=0;S.toneMapped&&(ae===null||ae.isXRRenderTarget===!0)&&(Mt=n.toneMapping);const Pt={shaderID:K,shaderType:S.type,shaderName:S.name,vertexShader:we,fragmentShader:W,defines:S.defines,customVertexShaderID:oe,customFragmentShaderID:se,isRawShaderMaterial:S.isRawShaderMaterial===!0,glslVersion:S.glslVersion,precision:f,batching:De,batchingColor:De&&U._colorsTexture!==null,instancing:Oe,instancingColor:Oe&&U.instanceColor!==null,instancingMorph:Oe&&U.morphTexture!==null,supportsVertexTextures:p,outputColorSpace:ae===null?n.outputColorSpace:ae.isXRRenderTarget===!0?ae.texture.colorSpace:Ai,alphaToCoverage:!!S.alphaToCoverage,map:Je,matcap:te,envMap:Y,envMapMode:Y&&q.mapping,envMapCubeUVHeight:N,aoMap:I,lightMap:ue,bumpMap:ee,normalMap:ve,displacementMap:p&&de,emissiveMap:Ue,normalMapObjectSpace:ve&&S.normalMapType===1,normalMapTangentSpace:ve&&S.normalMapType===0,metalnessMap:be,roughnessMap:C,anisotropy:T,anisotropyMap:pe,clearcoat:G,clearcoatMap:Me,clearcoatNormalMap:Ze,clearcoatRoughnessMap:le,dispersion:Z,iridescence:ie,iridescenceMap:xe,iridescenceThicknessMap:Fe,sheen:$,sheenColorMap:Be,sheenRoughnessMap:Se,specularMap:$e,specularColorMap:je,specularIntensityMap:dt,transmission:Te,transmissionMap:F,thicknessMap:me,gradientMap:J,opaque:S.transparent===!1&&S.blending===1&&S.alphaToCoverage===!1,alphaMap:ne,alphaTest:ye,alphaHash:ge,combine:S.combine,mapUv:Je&&_(S.map.channel),aoMapUv:I&&_(S.aoMap.channel),lightMapUv:ue&&_(S.lightMap.channel),bumpMapUv:ee&&_(S.bumpMap.channel),normalMapUv:ve&&_(S.normalMap.channel),displacementMapUv:de&&_(S.displacementMap.channel),emissiveMapUv:Ue&&_(S.emissiveMap.channel),metalnessMapUv:be&&_(S.metalnessMap.channel),roughnessMapUv:C&&_(S.roughnessMap.channel),anisotropyMapUv:pe&&_(S.anisotropyMap.channel),clearcoatMapUv:Me&&_(S.clearcoatMap.channel),clearcoatNormalMapUv:Ze&&_(S.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:le&&_(S.clearcoatRoughnessMap.channel),iridescenceMapUv:xe&&_(S.iridescenceMap.channel),iridescenceThicknessMapUv:Fe&&_(S.iridescenceThicknessMap.channel),sheenColorMapUv:Be&&_(S.sheenColorMap.channel),sheenRoughnessMapUv:Se&&_(S.sheenRoughnessMap.channel),specularMapUv:$e&&_(S.specularMap.channel),specularColorMapUv:je&&_(S.specularColorMap.channel),specularIntensityMapUv:dt&&_(S.specularIntensityMap.channel),transmissionMapUv:F&&_(S.transmissionMap.channel),thicknessMapUv:me&&_(S.thicknessMap.channel),alphaMapUv:ne&&_(S.alphaMap.channel),vertexTangents:!!j.attributes.tangent&&(ve||T),vertexColors:S.vertexColors,vertexAlphas:S.vertexColors===!0&&!!j.attributes.color&&j.attributes.color.itemSize===4,pointsUvs:U.isPoints===!0&&!!j.attributes.uv&&(Je||ne),fog:!!k,useFog:S.fog===!0,fogExp2:!!k&&k.isFogExp2,flatShading:S.flatShading===!0,sizeAttenuation:S.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:Pe,skinning:U.isSkinnedMesh===!0,morphTargets:j.morphAttributes.position!==void 0,morphNormals:j.morphAttributes.normal!==void 0,morphColors:j.morphAttributes.color!==void 0,morphTargetsCount:X,morphTextureStride:Q,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:S.dithering,shadowMapEnabled:n.shadowMap.enabled&&y.length>0,shadowMapType:n.shadowMap.type,toneMapping:Mt,decodeVideoTexture:Je&&S.map.isVideoTexture===!0&&Qe.getTransfer(S.map.colorSpace)===lt,decodeVideoTextureEmissive:Ue&&S.emissiveMap.isVideoTexture===!0&&Qe.getTransfer(S.emissiveMap.colorSpace)===lt,premultipliedAlpha:S.premultipliedAlpha,doubleSided:S.side===2,flipSided:S.side===1,useDepthPacking:S.depthPacking>=0,depthPacking:S.depthPacking||0,index0AttributeName:S.index0AttributeName,extensionClipCullDistance:We&&S.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(We&&S.extensions.multiDraw===!0||De)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:S.customProgramCacheKey()};return Pt.vertexUv1s=c.has(1),Pt.vertexUv2s=c.has(2),Pt.vertexUv3s=c.has(3),c.clear(),Pt}function d(S){const b=[];if(S.shaderID?b.push(S.shaderID):(b.push(S.customVertexShaderID),b.push(S.customFragmentShaderID)),S.defines!==void 0)for(const y in S.defines)b.push(y),b.push(S.defines[y]);return S.isRawShaderMaterial===!1&&(v(b,S),M(b,S),b.push(n.outputColorSpace)),b.push(S.customProgramCacheKey),b.join()}function v(S,b){S.push(b.precision),S.push(b.outputColorSpace),S.push(b.envMapMode),S.push(b.envMapCubeUVHeight),S.push(b.mapUv),S.push(b.alphaMapUv),S.push(b.lightMapUv),S.push(b.aoMapUv),S.push(b.bumpMapUv),S.push(b.normalMapUv),S.push(b.displacementMapUv),S.push(b.emissiveMapUv),S.push(b.metalnessMapUv),S.push(b.roughnessMapUv),S.push(b.anisotropyMapUv),S.push(b.clearcoatMapUv),S.push(b.clearcoatNormalMapUv),S.push(b.clearcoatRoughnessMapUv),S.push(b.iridescenceMapUv),S.push(b.iridescenceThicknessMapUv),S.push(b.sheenColorMapUv),S.push(b.sheenRoughnessMapUv),S.push(b.specularMapUv),S.push(b.specularColorMapUv),S.push(b.specularIntensityMapUv),S.push(b.transmissionMapUv),S.push(b.thicknessMapUv),S.push(b.combine),S.push(b.fogExp2),S.push(b.sizeAttenuation),S.push(b.morphTargetsCount),S.push(b.morphAttributeCount),S.push(b.numDirLights),S.push(b.numPointLights),S.push(b.numSpotLights),S.push(b.numSpotLightMaps),S.push(b.numHemiLights),S.push(b.numRectAreaLights),S.push(b.numDirLightShadows),S.push(b.numPointLightShadows),S.push(b.numSpotLightShadows),S.push(b.numSpotLightShadowsWithMaps),S.push(b.numLightProbes),S.push(b.shadowMapType),S.push(b.toneMapping),S.push(b.numClippingPlanes),S.push(b.numClipIntersection),S.push(b.depthPacking)}function M(S,b){a.disableAll(),b.supportsVertexTextures&&a.enable(0),b.instancing&&a.enable(1),b.instancingColor&&a.enable(2),b.instancingMorph&&a.enable(3),b.matcap&&a.enable(4),b.envMap&&a.enable(5),b.normalMapObjectSpace&&a.enable(6),b.normalMapTangentSpace&&a.enable(7),b.clearcoat&&a.enable(8),b.iridescence&&a.enable(9),b.alphaTest&&a.enable(10),b.vertexColors&&a.enable(11),b.vertexAlphas&&a.enable(12),b.vertexUv1s&&a.enable(13),b.vertexUv2s&&a.enable(14),b.vertexUv3s&&a.enable(15),b.vertexTangents&&a.enable(16),b.anisotropy&&a.enable(17),b.alphaHash&&a.enable(18),b.batching&&a.enable(19),b.dispersion&&a.enable(20),b.batchingColor&&a.enable(21),S.push(a.mask),a.disableAll(),b.fog&&a.enable(0),b.useFog&&a.enable(1),b.flatShading&&a.enable(2),b.logarithmicDepthBuffer&&a.enable(3),b.reverseDepthBuffer&&a.enable(4),b.skinning&&a.enable(5),b.morphTargets&&a.enable(6),b.morphNormals&&a.enable(7),b.morphColors&&a.enable(8),b.premultipliedAlpha&&a.enable(9),b.shadowMapEnabled&&a.enable(10),b.doubleSided&&a.enable(11),b.flipSided&&a.enable(12),b.useDepthPacking&&a.enable(13),b.dithering&&a.enable(14),b.transmission&&a.enable(15),b.sheen&&a.enable(16),b.opaque&&a.enable(17),b.pointsUvs&&a.enable(18),b.decodeVideoTexture&&a.enable(19),b.decodeVideoTextureEmissive&&a.enable(20),b.alphaToCoverage&&a.enable(21),S.push(a.mask)}function x(S){const b=g[S.type];let y;if(b){const L=on[b];y=kh.clone(L.uniforms)}else y=S.uniforms;return y}function D(S,b){let y;for(let L=0,U=h.length;L<U;L++){const k=h[L];if(k.cacheKey===b){y=k,++y.usedTimes;break}}return y===void 0&&(y=new Zp(n,b,S,s),h.push(y)),y}function R(S){if(--S.usedTimes===0){const b=h.indexOf(S);h[b]=h[h.length-1],h.pop(),S.destroy()}}function A(S){l.remove(S)}function w(){l.dispose()}return{getParameters:m,getProgramCacheKey:d,getUniforms:x,acquireProgram:D,releaseProgram:R,releaseShaderCache:A,programs:h,dispose:w}}function nm(){let n=new WeakMap;function e(o){return n.has(o)}function t(o){let a=n.get(o);return a===void 0&&(a={},n.set(o,a)),a}function i(o){n.delete(o)}function r(o,a,l){n.get(o)[a]=l}function s(){n=new WeakMap}return{has:e,get:t,remove:i,update:r,dispose:s}}function im(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function Ya(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function qa(){const n=[];let e=0;const t=[],i=[],r=[];function s(){e=0,t.length=0,i.length=0,r.length=0}function o(u,p,f,g,_,m){let d=n[e];return d===void 0?(d={id:u.id,object:u,geometry:p,material:f,groupOrder:g,renderOrder:u.renderOrder,z:_,group:m},n[e]=d):(d.id=u.id,d.object=u,d.geometry=p,d.material=f,d.groupOrder=g,d.renderOrder=u.renderOrder,d.z=_,d.group=m),e++,d}function a(u,p,f,g,_,m){const d=o(u,p,f,g,_,m);f.transmission>0?i.push(d):f.transparent===!0?r.push(d):t.push(d)}function l(u,p,f,g,_,m){const d=o(u,p,f,g,_,m);f.transmission>0?i.unshift(d):f.transparent===!0?r.unshift(d):t.unshift(d)}function c(u,p){t.length>1&&t.sort(u||im),i.length>1&&i.sort(p||Ya),r.length>1&&r.sort(p||Ya)}function h(){for(let u=e,p=n.length;u<p;u++){const f=n[u];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:i,transparent:r,init:s,push:a,unshift:l,finish:h,sort:c}}function rm(){let n=new WeakMap;function e(i,r){const s=n.get(i);let o;return s===void 0?(o=new qa,n.set(i,[o])):r>=s.length?(o=new qa,s.push(o)):o=s[r],o}function t(){n=new WeakMap}return{get:e,dispose:t}}function sm(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new P,color:new Ie};break;case"SpotLight":t={position:new P,direction:new P,color:new Ie,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new P,color:new Ie,distance:0,decay:0};break;case"HemisphereLight":t={direction:new P,skyColor:new Ie,groundColor:new Ie};break;case"RectAreaLight":t={color:new Ie,position:new P,halfWidth:new P,halfHeight:new P};break}return n[e.id]=t,t}}}function om(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new re};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new re};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new re,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}let am=0;function lm(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function cm(n){const e=new sm,t=om(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new P);const r=new P,s=new Ve,o=new Ve;function a(c){let h=0,u=0,p=0;for(let S=0;S<9;S++)i.probe[S].set(0,0,0);let f=0,g=0,_=0,m=0,d=0,v=0,M=0,x=0,D=0,R=0,A=0;c.sort(lm);for(let S=0,b=c.length;S<b;S++){const y=c[S],L=y.color,U=y.intensity,k=y.distance,j=y.shadow&&y.shadow.map?y.shadow.map.texture:null;if(y.isAmbientLight)h+=L.r*U,u+=L.g*U,p+=L.b*U;else if(y.isLightProbe){for(let z=0;z<9;z++)i.probe[z].addScaledVector(y.sh.coefficients[z],U);A++}else if(y.isDirectionalLight){const z=e.get(y);if(z.color.copy(y.color).multiplyScalar(y.intensity),y.castShadow){const q=y.shadow,N=t.get(y);N.shadowIntensity=q.intensity,N.shadowBias=q.bias,N.shadowNormalBias=q.normalBias,N.shadowRadius=q.radius,N.shadowMapSize=q.mapSize,i.directionalShadow[f]=N,i.directionalShadowMap[f]=j,i.directionalShadowMatrix[f]=y.shadow.matrix,v++}i.directional[f]=z,f++}else if(y.isSpotLight){const z=e.get(y);z.position.setFromMatrixPosition(y.matrixWorld),z.color.copy(L).multiplyScalar(U),z.distance=k,z.coneCos=Math.cos(y.angle),z.penumbraCos=Math.cos(y.angle*(1-y.penumbra)),z.decay=y.decay,i.spot[_]=z;const q=y.shadow;if(y.map&&(i.spotLightMap[D]=y.map,D++,q.updateMatrices(y),y.castShadow&&R++),i.spotLightMatrix[_]=q.matrix,y.castShadow){const N=t.get(y);N.shadowIntensity=q.intensity,N.shadowBias=q.bias,N.shadowNormalBias=q.normalBias,N.shadowRadius=q.radius,N.shadowMapSize=q.mapSize,i.spotShadow[_]=N,i.spotShadowMap[_]=j,x++}_++}else if(y.isRectAreaLight){const z=e.get(y);z.color.copy(L).multiplyScalar(U),z.halfWidth.set(y.width*.5,0,0),z.halfHeight.set(0,y.height*.5,0),i.rectArea[m]=z,m++}else if(y.isPointLight){const z=e.get(y);if(z.color.copy(y.color).multiplyScalar(y.intensity),z.distance=y.distance,z.decay=y.decay,y.castShadow){const q=y.shadow,N=t.get(y);N.shadowIntensity=q.intensity,N.shadowBias=q.bias,N.shadowNormalBias=q.normalBias,N.shadowRadius=q.radius,N.shadowMapSize=q.mapSize,N.shadowCameraNear=q.camera.near,N.shadowCameraFar=q.camera.far,i.pointShadow[g]=N,i.pointShadowMap[g]=j,i.pointShadowMatrix[g]=y.shadow.matrix,M++}i.point[g]=z,g++}else if(y.isHemisphereLight){const z=e.get(y);z.skyColor.copy(y.color).multiplyScalar(U),z.groundColor.copy(y.groundColor).multiplyScalar(U),i.hemi[d]=z,d++}}m>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=fe.LTC_FLOAT_1,i.rectAreaLTC2=fe.LTC_FLOAT_2):(i.rectAreaLTC1=fe.LTC_HALF_1,i.rectAreaLTC2=fe.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=u,i.ambient[2]=p;const w=i.hash;(w.directionalLength!==f||w.pointLength!==g||w.spotLength!==_||w.rectAreaLength!==m||w.hemiLength!==d||w.numDirectionalShadows!==v||w.numPointShadows!==M||w.numSpotShadows!==x||w.numSpotMaps!==D||w.numLightProbes!==A)&&(i.directional.length=f,i.spot.length=_,i.rectArea.length=m,i.point.length=g,i.hemi.length=d,i.directionalShadow.length=v,i.directionalShadowMap.length=v,i.pointShadow.length=M,i.pointShadowMap.length=M,i.spotShadow.length=x,i.spotShadowMap.length=x,i.directionalShadowMatrix.length=v,i.pointShadowMatrix.length=M,i.spotLightMatrix.length=x+D-R,i.spotLightMap.length=D,i.numSpotLightShadowsWithMaps=R,i.numLightProbes=A,w.directionalLength=f,w.pointLength=g,w.spotLength=_,w.rectAreaLength=m,w.hemiLength=d,w.numDirectionalShadows=v,w.numPointShadows=M,w.numSpotShadows=x,w.numSpotMaps=D,w.numLightProbes=A,i.version=am++)}function l(c,h){let u=0,p=0,f=0,g=0,_=0;const m=h.matrixWorldInverse;for(let d=0,v=c.length;d<v;d++){const M=c[d];if(M.isDirectionalLight){const x=i.directional[u];x.direction.setFromMatrixPosition(M.matrixWorld),r.setFromMatrixPosition(M.target.matrixWorld),x.direction.sub(r),x.direction.transformDirection(m),u++}else if(M.isSpotLight){const x=i.spot[f];x.position.setFromMatrixPosition(M.matrixWorld),x.position.applyMatrix4(m),x.direction.setFromMatrixPosition(M.matrixWorld),r.setFromMatrixPosition(M.target.matrixWorld),x.direction.sub(r),x.direction.transformDirection(m),f++}else if(M.isRectAreaLight){const x=i.rectArea[g];x.position.setFromMatrixPosition(M.matrixWorld),x.position.applyMatrix4(m),o.identity(),s.copy(M.matrixWorld),s.premultiply(m),o.extractRotation(s),x.halfWidth.set(M.width*.5,0,0),x.halfHeight.set(0,M.height*.5,0),x.halfWidth.applyMatrix4(o),x.halfHeight.applyMatrix4(o),g++}else if(M.isPointLight){const x=i.point[p];x.position.setFromMatrixPosition(M.matrixWorld),x.position.applyMatrix4(m),p++}else if(M.isHemisphereLight){const x=i.hemi[_];x.direction.setFromMatrixPosition(M.matrixWorld),x.direction.transformDirection(m),_++}}}return{setup:a,setupView:l,state:i}}function ja(n){const e=new cm(n),t=[],i=[];function r(h){c.camera=h,t.length=0,i.length=0}function s(h){t.push(h)}function o(h){i.push(h)}function a(){e.setup(t)}function l(h){e.setupView(t,h)}const c={lightsArray:t,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:r,state:c,setupLights:a,setupLightsView:l,pushLight:s,pushShadow:o}}function hm(n){let e=new WeakMap;function t(r,s=0){const o=e.get(r);let a;return o===void 0?(a=new ja(n),e.set(r,[a])):s>=o.length?(a=new ja(n),o.push(a)):a=o[s],a}function i(){e=new WeakMap}return{get:t,dispose:i}}class um extends bn{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=3200,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class dm extends bn{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const fm=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,pm=`uniform sampler2D shadow_pass;
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
}`;function mm(n,e,t){let i=new Lo;const r=new re,s=new re,o=new tt,a=new um({depthPacking:3201}),l=new dm,c={},h=t.maxTextureSize,u={0:1,1:0,2:2},p=new Ln({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new re},radius:{value:4}},vertexShader:fm,fragmentShader:pm}),f=p.clone();f.defines.HORIZONTAL_PASS=1;const g=new yt;g.setAttribute("position",new Nt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new ut(g,p),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let d=this.type;this.render=function(R,A,w){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||R.length===0)return;const S=n.getRenderTarget(),b=n.getActiveCubeFace(),y=n.getActiveMipmapLevel(),L=n.state;L.setBlending(0),L.buffers.color.setClear(1,1,1,1),L.buffers.depth.setTest(!0),L.setScissorTest(!1);const U=d!==3&&this.type===3,k=d===3&&this.type!==3;for(let j=0,z=R.length;j<z;j++){const q=R[j],N=q.shadow;if(N===void 0){console.warn("THREE.WebGLShadowMap:",q,"has no shadow.");continue}if(N.autoUpdate===!1&&N.needsUpdate===!1)continue;r.copy(N.mapSize);const K=N.getFrameExtents();if(r.multiply(K),s.copy(N.mapSize),(r.x>h||r.y>h)&&(r.x>h&&(s.x=Math.floor(h/K.x),r.x=s.x*K.x,N.mapSize.x=s.x),r.y>h&&(s.y=Math.floor(h/K.y),r.y=s.y*K.y,N.mapSize.y=s.y)),N.map===null||U===!0||k===!0){const X=this.type!==3?{minFilter:1003,magFilter:1003}:{};N.map!==null&&N.map.dispose(),N.map=new qn(r.x,r.y,X),N.map.texture.name=q.name+".shadowMap",N.camera.updateProjectionMatrix()}n.setRenderTarget(N.map),n.clear();const he=N.getViewportCount();for(let X=0;X<he;X++){const Q=N.getViewport(X);o.set(s.x*Q.x,s.y*Q.y,s.x*Q.z,s.y*Q.w),L.viewport(o),N.updateMatrices(q,X),i=N.getFrustum(),x(A,w,N.camera,q,this.type)}N.isPointLightShadow!==!0&&this.type===3&&v(N,w),N.needsUpdate=!1}d=this.type,m.needsUpdate=!1,n.setRenderTarget(S,b,y)};function v(R,A){const w=e.update(_);p.defines.VSM_SAMPLES!==R.blurSamples&&(p.defines.VSM_SAMPLES=R.blurSamples,f.defines.VSM_SAMPLES=R.blurSamples,p.needsUpdate=!0,f.needsUpdate=!0),R.mapPass===null&&(R.mapPass=new qn(r.x,r.y)),p.uniforms.shadow_pass.value=R.map.texture,p.uniforms.resolution.value=R.mapSize,p.uniforms.radius.value=R.radius,n.setRenderTarget(R.mapPass),n.clear(),n.renderBufferDirect(A,null,w,p,_,null),f.uniforms.shadow_pass.value=R.mapPass.texture,f.uniforms.resolution.value=R.mapSize,f.uniforms.radius.value=R.radius,n.setRenderTarget(R.map),n.clear(),n.renderBufferDirect(A,null,w,f,_,null)}function M(R,A,w,S){let b=null;const y=w.isPointLight===!0?R.customDistanceMaterial:R.customDepthMaterial;if(y!==void 0)b=y;else if(b=w.isPointLight===!0?l:a,n.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0){const L=b.uuid,U=A.uuid;let k=c[L];k===void 0&&(k={},c[L]=k);let j=k[U];j===void 0&&(j=b.clone(),k[U]=j,A.addEventListener("dispose",D)),b=j}if(b.visible=A.visible,b.wireframe=A.wireframe,S===3?b.side=A.shadowSide!==null?A.shadowSide:A.side:b.side=A.shadowSide!==null?A.shadowSide:u[A.side],b.alphaMap=A.alphaMap,b.alphaTest=A.alphaTest,b.map=A.map,b.clipShadows=A.clipShadows,b.clippingPlanes=A.clippingPlanes,b.clipIntersection=A.clipIntersection,b.displacementMap=A.displacementMap,b.displacementScale=A.displacementScale,b.displacementBias=A.displacementBias,b.wireframeLinewidth=A.wireframeLinewidth,b.linewidth=A.linewidth,w.isPointLight===!0&&b.isMeshDistanceMaterial===!0){const L=n.properties.get(b);L.light=w}return b}function x(R,A,w,S,b){if(R.visible===!1)return;if(R.layers.test(A.layers)&&(R.isMesh||R.isLine||R.isPoints)&&(R.castShadow||R.receiveShadow&&b===3)&&(!R.frustumCulled||i.intersectsObject(R))){R.modelViewMatrix.multiplyMatrices(w.matrixWorldInverse,R.matrixWorld);const U=e.update(R),k=R.material;if(Array.isArray(k)){const j=U.groups;for(let z=0,q=j.length;z<q;z++){const N=j[z],K=k[N.materialIndex];if(K&&K.visible){const he=M(R,K,S,b);R.onBeforeShadow(n,R,A,w,U,he,N),n.renderBufferDirect(w,null,U,he,R,N),R.onAfterShadow(n,R,A,w,U,he,N)}}}else if(k.visible){const j=M(R,k,S,b);R.onBeforeShadow(n,R,A,w,U,j,null),n.renderBufferDirect(w,null,U,j,R,null),R.onAfterShadow(n,R,A,w,U,j,null)}}const L=R.children;for(let U=0,k=L.length;U<k;U++)x(L[U],A,w,S,b)}function D(R){R.target.removeEventListener("dispose",D);for(const w in c){const S=c[w],b=R.target.uuid;b in S&&(S[b].dispose(),delete S[b])}}}const gm={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3};function _m(n,e){function t(){let F=!1;const me=new tt;let J=null;const ne=new tt(0,0,0,0);return{setMask:function(ye){J!==ye&&!F&&(n.colorMask(ye,ye,ye,ye),J=ye)},setLocked:function(ye){F=ye},setClear:function(ye,ge,We,Mt,Pt){Pt===!0&&(ye*=Mt,ge*=Mt,We*=Mt),me.set(ye,ge,We,Mt),ne.equals(me)===!1&&(n.clearColor(ye,ge,We,Mt),ne.copy(me))},reset:function(){F=!1,J=null,ne.set(-1,0,0,0)}}}function i(){let F=!1,me=!1,J=null,ne=null,ye=null;return{setReversed:function(ge){if(me!==ge){const We=e.get("EXT_clip_control");me?We.clipControlEXT(We.LOWER_LEFT_EXT,We.ZERO_TO_ONE_EXT):We.clipControlEXT(We.LOWER_LEFT_EXT,We.NEGATIVE_ONE_TO_ONE_EXT);const Mt=ye;ye=null,this.setClear(Mt)}me=ge},getReversed:function(){return me},setTest:function(ge){ge?ae(n.DEPTH_TEST):Pe(n.DEPTH_TEST)},setMask:function(ge){J!==ge&&!F&&(n.depthMask(ge),J=ge)},setFunc:function(ge){if(me&&(ge=gm[ge]),ne!==ge){switch(ge){case 0:n.depthFunc(n.NEVER);break;case 1:n.depthFunc(n.ALWAYS);break;case 2:n.depthFunc(n.LESS);break;case 3:n.depthFunc(n.LEQUAL);break;case 4:n.depthFunc(n.EQUAL);break;case 5:n.depthFunc(n.GEQUAL);break;case 6:n.depthFunc(n.GREATER);break;case 7:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}ne=ge}},setLocked:function(ge){F=ge},setClear:function(ge){ye!==ge&&(me&&(ge=1-ge),n.clearDepth(ge),ye=ge)},reset:function(){F=!1,J=null,ne=null,ye=null,me=!1}}}function r(){let F=!1,me=null,J=null,ne=null,ye=null,ge=null,We=null,Mt=null,Pt=null;return{setTest:function(st){F||(st?ae(n.STENCIL_TEST):Pe(n.STENCIL_TEST))},setMask:function(st){me!==st&&!F&&(n.stencilMask(st),me=st)},setFunc:function(st,Kt,cn){(J!==st||ne!==Kt||ye!==cn)&&(n.stencilFunc(st,Kt,cn),J=st,ne=Kt,ye=cn)},setOp:function(st,Kt,cn){(ge!==st||We!==Kt||Mt!==cn)&&(n.stencilOp(st,Kt,cn),ge=st,We=Kt,Mt=cn)},setLocked:function(st){F=st},setClear:function(st){Pt!==st&&(n.clearStencil(st),Pt=st)},reset:function(){F=!1,me=null,J=null,ne=null,ye=null,ge=null,We=null,Mt=null,Pt=null}}}const s=new t,o=new i,a=new r,l=new WeakMap,c=new WeakMap;let h={},u={},p=new WeakMap,f=[],g=null,_=!1,m=null,d=null,v=null,M=null,x=null,D=null,R=null,A=new Ie(0,0,0),w=0,S=!1,b=null,y=null,L=null,U=null,k=null;const j=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let z=!1,q=0;const N=n.getParameter(n.VERSION);N.indexOf("WebGL")!==-1?(q=parseFloat(/^WebGL (\d)/.exec(N)[1]),z=q>=1):N.indexOf("OpenGL ES")!==-1&&(q=parseFloat(/^OpenGL ES (\d)/.exec(N)[1]),z=q>=2);let K=null,he={};const X=n.getParameter(n.SCISSOR_BOX),Q=n.getParameter(n.VIEWPORT),we=new tt().fromArray(X),W=new tt().fromArray(Q);function oe(F,me,J,ne){const ye=new Uint8Array(4),ge=n.createTexture();n.bindTexture(F,ge),n.texParameteri(F,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(F,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let We=0;We<J;We++)F===n.TEXTURE_3D||F===n.TEXTURE_2D_ARRAY?n.texImage3D(me,0,n.RGBA,1,1,ne,0,n.RGBA,n.UNSIGNED_BYTE,ye):n.texImage2D(me+We,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,ye);return ge}const se={};se[n.TEXTURE_2D]=oe(n.TEXTURE_2D,n.TEXTURE_2D,1),se[n.TEXTURE_CUBE_MAP]=oe(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),se[n.TEXTURE_2D_ARRAY]=oe(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),se[n.TEXTURE_3D]=oe(n.TEXTURE_3D,n.TEXTURE_3D,1,1),s.setClear(0,0,0,1),o.setClear(1),a.setClear(0),ae(n.DEPTH_TEST),o.setFunc(3),ee(!1),ve(1),ae(n.CULL_FACE),I(0);function ae(F){h[F]!==!0&&(n.enable(F),h[F]=!0)}function Pe(F){h[F]!==!1&&(n.disable(F),h[F]=!1)}function Oe(F,me){return u[F]!==me?(n.bindFramebuffer(F,me),u[F]=me,F===n.DRAW_FRAMEBUFFER&&(u[n.FRAMEBUFFER]=me),F===n.FRAMEBUFFER&&(u[n.DRAW_FRAMEBUFFER]=me),!0):!1}function De(F,me){let J=f,ne=!1;if(F){J=p.get(me),J===void 0&&(J=[],p.set(me,J));const ye=F.textures;if(J.length!==ye.length||J[0]!==n.COLOR_ATTACHMENT0){for(let ge=0,We=ye.length;ge<We;ge++)J[ge]=n.COLOR_ATTACHMENT0+ge;J.length=ye.length,ne=!0}}else J[0]!==n.BACK&&(J[0]=n.BACK,ne=!0);ne&&n.drawBuffers(J)}function Je(F){return g!==F?(n.useProgram(F),g=F,!0):!1}const te={100:n.FUNC_ADD,101:n.FUNC_SUBTRACT,102:n.FUNC_REVERSE_SUBTRACT};te[103]=n.MIN,te[104]=n.MAX;const Y={200:n.ZERO,201:n.ONE,202:n.SRC_COLOR,204:n.SRC_ALPHA,210:n.SRC_ALPHA_SATURATE,208:n.DST_COLOR,206:n.DST_ALPHA,203:n.ONE_MINUS_SRC_COLOR,205:n.ONE_MINUS_SRC_ALPHA,209:n.ONE_MINUS_DST_COLOR,207:n.ONE_MINUS_DST_ALPHA,211:n.CONSTANT_COLOR,212:n.ONE_MINUS_CONSTANT_COLOR,213:n.CONSTANT_ALPHA,214:n.ONE_MINUS_CONSTANT_ALPHA};function I(F,me,J,ne,ye,ge,We,Mt,Pt,st){if(F===0){_===!0&&(Pe(n.BLEND),_=!1);return}if(_===!1&&(ae(n.BLEND),_=!0),F!==5){if(F!==m||st!==S){if((d!==100||x!==100)&&(n.blendEquation(n.FUNC_ADD),d=100,x=100),st)switch(F){case 1:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case 2:n.blendFunc(n.ONE,n.ONE);break;case 3:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case 4:n.blendFuncSeparate(n.ZERO,n.SRC_COLOR,n.ZERO,n.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",F);break}else switch(F){case 1:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case 2:n.blendFunc(n.SRC_ALPHA,n.ONE);break;case 3:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case 4:n.blendFunc(n.ZERO,n.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",F);break}v=null,M=null,D=null,R=null,A.set(0,0,0),w=0,m=F,S=st}return}ye=ye||me,ge=ge||J,We=We||ne,(me!==d||ye!==x)&&(n.blendEquationSeparate(te[me],te[ye]),d=me,x=ye),(J!==v||ne!==M||ge!==D||We!==R)&&(n.blendFuncSeparate(Y[J],Y[ne],Y[ge],Y[We]),v=J,M=ne,D=ge,R=We),(Mt.equals(A)===!1||Pt!==w)&&(n.blendColor(Mt.r,Mt.g,Mt.b,Pt),A.copy(Mt),w=Pt),m=F,S=!1}function ue(F,me){F.side===2?Pe(n.CULL_FACE):ae(n.CULL_FACE);let J=F.side===1;me&&(J=!J),ee(J),F.blending===1&&F.transparent===!1?I(0):I(F.blending,F.blendEquation,F.blendSrc,F.blendDst,F.blendEquationAlpha,F.blendSrcAlpha,F.blendDstAlpha,F.blendColor,F.blendAlpha,F.premultipliedAlpha),o.setFunc(F.depthFunc),o.setTest(F.depthTest),o.setMask(F.depthWrite),s.setMask(F.colorWrite);const ne=F.stencilWrite;a.setTest(ne),ne&&(a.setMask(F.stencilWriteMask),a.setFunc(F.stencilFunc,F.stencilRef,F.stencilFuncMask),a.setOp(F.stencilFail,F.stencilZFail,F.stencilZPass)),Ue(F.polygonOffset,F.polygonOffsetFactor,F.polygonOffsetUnits),F.alphaToCoverage===!0?ae(n.SAMPLE_ALPHA_TO_COVERAGE):Pe(n.SAMPLE_ALPHA_TO_COVERAGE)}function ee(F){b!==F&&(F?n.frontFace(n.CW):n.frontFace(n.CCW),b=F)}function ve(F){F!==0?(ae(n.CULL_FACE),F!==y&&(F===1?n.cullFace(n.BACK):F===2?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):Pe(n.CULL_FACE),y=F}function de(F){F!==L&&(z&&n.lineWidth(F),L=F)}function Ue(F,me,J){F?(ae(n.POLYGON_OFFSET_FILL),(U!==me||k!==J)&&(n.polygonOffset(me,J),U=me,k=J)):Pe(n.POLYGON_OFFSET_FILL)}function be(F){F?ae(n.SCISSOR_TEST):Pe(n.SCISSOR_TEST)}function C(F){F===void 0&&(F=n.TEXTURE0+j-1),K!==F&&(n.activeTexture(F),K=F)}function T(F,me,J){J===void 0&&(K===null?J=n.TEXTURE0+j-1:J=K);let ne=he[J];ne===void 0&&(ne={type:void 0,texture:void 0},he[J]=ne),(ne.type!==F||ne.texture!==me)&&(K!==J&&(n.activeTexture(J),K=J),n.bindTexture(F,me||se[F]),ne.type=F,ne.texture=me)}function G(){const F=he[K];F!==void 0&&F.type!==void 0&&(n.bindTexture(F.type,null),F.type=void 0,F.texture=void 0)}function Z(){try{n.compressedTexImage2D.apply(n,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function ie(){try{n.compressedTexImage3D.apply(n,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function $(){try{n.texSubImage2D.apply(n,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function Te(){try{n.texSubImage3D.apply(n,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function pe(){try{n.compressedTexSubImage2D.apply(n,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function Me(){try{n.compressedTexSubImage3D.apply(n,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function Ze(){try{n.texStorage2D.apply(n,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function le(){try{n.texStorage3D.apply(n,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function xe(){try{n.texImage2D.apply(n,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function Fe(){try{n.texImage3D.apply(n,arguments)}catch(F){console.error("THREE.WebGLState:",F)}}function Be(F){we.equals(F)===!1&&(n.scissor(F.x,F.y,F.z,F.w),we.copy(F))}function Se(F){W.equals(F)===!1&&(n.viewport(F.x,F.y,F.z,F.w),W.copy(F))}function $e(F,me){let J=c.get(me);J===void 0&&(J=new WeakMap,c.set(me,J));let ne=J.get(F);ne===void 0&&(ne=n.getUniformBlockIndex(me,F.name),J.set(F,ne))}function je(F,me){const ne=c.get(me).get(F);l.get(me)!==ne&&(n.uniformBlockBinding(me,ne,F.__bindingPointIndex),l.set(me,ne))}function dt(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),o.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),h={},K=null,he={},u={},p=new WeakMap,f=[],g=null,_=!1,m=null,d=null,v=null,M=null,x=null,D=null,R=null,A=new Ie(0,0,0),w=0,S=!1,b=null,y=null,L=null,U=null,k=null,we.set(0,0,n.canvas.width,n.canvas.height),W.set(0,0,n.canvas.width,n.canvas.height),s.reset(),o.reset(),a.reset()}return{buffers:{color:s,depth:o,stencil:a},enable:ae,disable:Pe,bindFramebuffer:Oe,drawBuffers:De,useProgram:Je,setBlending:I,setMaterial:ue,setFlipSided:ee,setCullFace:ve,setLineWidth:de,setPolygonOffset:Ue,setScissorTest:be,activeTexture:C,bindTexture:T,unbindTexture:G,compressedTexImage2D:Z,compressedTexImage3D:ie,texImage2D:xe,texImage3D:Fe,updateUBOMapping:$e,uniformBlockBinding:je,texStorage2D:Ze,texStorage3D:le,texSubImage2D:$,texSubImage3D:Te,compressedTexSubImage2D:pe,compressedTexSubImage3D:Me,scissor:Be,viewport:Se,reset:dt}}function Ka(n,e,t,i){const r=ym(i);switch(t){case 1021:return n*e;case 1024:return n*e;case 1025:return n*e*2;case 1028:return n*e/r.components*r.byteLength;case 1029:return n*e/r.components*r.byteLength;case 1030:return n*e*2/r.components*r.byteLength;case 1031:return n*e*2/r.components*r.byteLength;case 1022:return n*e*3/r.components*r.byteLength;case 1023:return n*e*4/r.components*r.byteLength;case 1033:return n*e*4/r.components*r.byteLength;case 33776:case 33777:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case 33778:case 33779:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case 35841:case 35843:return Math.max(n,16)*Math.max(e,8)/4;case 35840:case 35842:return Math.max(n,8)*Math.max(e,8)/2;case 36196:case 37492:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case 37496:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case 37808:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case 37809:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case 37810:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case 37811:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case 37812:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case 37813:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case 37814:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case 37815:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case 37816:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case 37817:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case 37818:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case 37819:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case 37820:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case 37821:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case 36492:case 36494:case 36495:return Math.ceil(n/4)*Math.ceil(e/4)*16;case 36283:case 36284:return Math.ceil(n/4)*Math.ceil(e/4)*8;case 36285:case 36286:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function ym(n){switch(n){case 1009:case 1010:return{byteLength:1,components:1};case 1012:case 1011:case 1016:return{byteLength:2,components:1};case 1017:case 1018:return{byteLength:2,components:4};case 1014:case 1013:case 1015:return{byteLength:4,components:1};case 35902:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}function vm(n,e,t,i,r,s,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new re,h=new WeakMap;let u;const p=new WeakMap;let f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(C,T){return f?new OffscreenCanvas(C,T):tr("canvas")}function _(C,T,G){let Z=1;const ie=be(C);if((ie.width>G||ie.height>G)&&(Z=G/Math.max(ie.width,ie.height)),Z<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){const $=Math.floor(Z*ie.width),Te=Math.floor(Z*ie.height);u===void 0&&(u=g($,Te));const pe=T?g($,Te):u;return pe.width=$,pe.height=Te,pe.getContext("2d").drawImage(C,0,0,$,Te),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ie.width+"x"+ie.height+") to ("+$+"x"+Te+")."),pe}else return"data"in C&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ie.width+"x"+ie.height+")."),C;return C}function m(C){return C.generateMipmaps}function d(C){n.generateMipmap(C)}function v(C){return C.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?n.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function M(C,T,G,Z,ie=!1){if(C!==null){if(n[C]!==void 0)return n[C];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let $=T;if(T===n.RED&&(G===n.FLOAT&&($=n.R32F),G===n.HALF_FLOAT&&($=n.R16F),G===n.UNSIGNED_BYTE&&($=n.R8)),T===n.RED_INTEGER&&(G===n.UNSIGNED_BYTE&&($=n.R8UI),G===n.UNSIGNED_SHORT&&($=n.R16UI),G===n.UNSIGNED_INT&&($=n.R32UI),G===n.BYTE&&($=n.R8I),G===n.SHORT&&($=n.R16I),G===n.INT&&($=n.R32I)),T===n.RG&&(G===n.FLOAT&&($=n.RG32F),G===n.HALF_FLOAT&&($=n.RG16F),G===n.UNSIGNED_BYTE&&($=n.RG8)),T===n.RG_INTEGER&&(G===n.UNSIGNED_BYTE&&($=n.RG8UI),G===n.UNSIGNED_SHORT&&($=n.RG16UI),G===n.UNSIGNED_INT&&($=n.RG32UI),G===n.BYTE&&($=n.RG8I),G===n.SHORT&&($=n.RG16I),G===n.INT&&($=n.RG32I)),T===n.RGB_INTEGER&&(G===n.UNSIGNED_BYTE&&($=n.RGB8UI),G===n.UNSIGNED_SHORT&&($=n.RGB16UI),G===n.UNSIGNED_INT&&($=n.RGB32UI),G===n.BYTE&&($=n.RGB8I),G===n.SHORT&&($=n.RGB16I),G===n.INT&&($=n.RGB32I)),T===n.RGBA_INTEGER&&(G===n.UNSIGNED_BYTE&&($=n.RGBA8UI),G===n.UNSIGNED_SHORT&&($=n.RGBA16UI),G===n.UNSIGNED_INT&&($=n.RGBA32UI),G===n.BYTE&&($=n.RGBA8I),G===n.SHORT&&($=n.RGBA16I),G===n.INT&&($=n.RGBA32I)),T===n.RGB&&G===n.UNSIGNED_INT_5_9_9_9_REV&&($=n.RGB9_E5),T===n.RGBA){const Te=ie?ss:Qe.getTransfer(Z);G===n.FLOAT&&($=n.RGBA32F),G===n.HALF_FLOAT&&($=n.RGBA16F),G===n.UNSIGNED_BYTE&&($=Te===lt?n.SRGB8_ALPHA8:n.RGBA8),G===n.UNSIGNED_SHORT_4_4_4_4&&($=n.RGBA4),G===n.UNSIGNED_SHORT_5_5_5_1&&($=n.RGB5_A1)}return($===n.R16F||$===n.R32F||$===n.RG16F||$===n.RG32F||$===n.RGBA16F||$===n.RGBA32F)&&e.get("EXT_color_buffer_float"),$}function x(C,T){let G;return C?T===null||T===1014||T===1020?G=n.DEPTH24_STENCIL8:T===1015?G=n.DEPTH32F_STENCIL8:T===1012&&(G=n.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):T===null||T===1014||T===1020?G=n.DEPTH_COMPONENT24:T===1015?G=n.DEPTH_COMPONENT32F:T===1012&&(G=n.DEPTH_COMPONENT16),G}function D(C,T){return m(C)===!0||C.isFramebufferTexture&&C.minFilter!==1003&&C.minFilter!==1006?Math.log2(Math.max(T.width,T.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?T.mipmaps.length:1}function R(C){const T=C.target;T.removeEventListener("dispose",R),w(T),T.isVideoTexture&&h.delete(T)}function A(C){const T=C.target;T.removeEventListener("dispose",A),b(T)}function w(C){const T=i.get(C);if(T.__webglInit===void 0)return;const G=C.source,Z=p.get(G);if(Z){const ie=Z[T.__cacheKey];ie.usedTimes--,ie.usedTimes===0&&S(C),Object.keys(Z).length===0&&p.delete(G)}i.remove(C)}function S(C){const T=i.get(C);n.deleteTexture(T.__webglTexture);const G=C.source,Z=p.get(G);delete Z[T.__cacheKey],o.memory.textures--}function b(C){const T=i.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),i.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let Z=0;Z<6;Z++){if(Array.isArray(T.__webglFramebuffer[Z]))for(let ie=0;ie<T.__webglFramebuffer[Z].length;ie++)n.deleteFramebuffer(T.__webglFramebuffer[Z][ie]);else n.deleteFramebuffer(T.__webglFramebuffer[Z]);T.__webglDepthbuffer&&n.deleteRenderbuffer(T.__webglDepthbuffer[Z])}else{if(Array.isArray(T.__webglFramebuffer))for(let Z=0;Z<T.__webglFramebuffer.length;Z++)n.deleteFramebuffer(T.__webglFramebuffer[Z]);else n.deleteFramebuffer(T.__webglFramebuffer);if(T.__webglDepthbuffer&&n.deleteRenderbuffer(T.__webglDepthbuffer),T.__webglMultisampledFramebuffer&&n.deleteFramebuffer(T.__webglMultisampledFramebuffer),T.__webglColorRenderbuffer)for(let Z=0;Z<T.__webglColorRenderbuffer.length;Z++)T.__webglColorRenderbuffer[Z]&&n.deleteRenderbuffer(T.__webglColorRenderbuffer[Z]);T.__webglDepthRenderbuffer&&n.deleteRenderbuffer(T.__webglDepthRenderbuffer)}const G=C.textures;for(let Z=0,ie=G.length;Z<ie;Z++){const $=i.get(G[Z]);$.__webglTexture&&(n.deleteTexture($.__webglTexture),o.memory.textures--),i.remove(G[Z])}i.remove(C)}let y=0;function L(){y=0}function U(){const C=y;return C>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+r.maxTextures),y+=1,C}function k(C){const T=[];return T.push(C.wrapS),T.push(C.wrapT),T.push(C.wrapR||0),T.push(C.magFilter),T.push(C.minFilter),T.push(C.anisotropy),T.push(C.internalFormat),T.push(C.format),T.push(C.type),T.push(C.generateMipmaps),T.push(C.premultiplyAlpha),T.push(C.flipY),T.push(C.unpackAlignment),T.push(C.colorSpace),T.join()}function j(C,T){const G=i.get(C);if(C.isVideoTexture&&de(C),C.isRenderTargetTexture===!1&&C.version>0&&G.__version!==C.version){const Z=C.image;if(Z===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(Z.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{W(G,C,T);return}}t.bindTexture(n.TEXTURE_2D,G.__webglTexture,n.TEXTURE0+T)}function z(C,T){const G=i.get(C);if(C.version>0&&G.__version!==C.version){W(G,C,T);return}t.bindTexture(n.TEXTURE_2D_ARRAY,G.__webglTexture,n.TEXTURE0+T)}function q(C,T){const G=i.get(C);if(C.version>0&&G.__version!==C.version){W(G,C,T);return}t.bindTexture(n.TEXTURE_3D,G.__webglTexture,n.TEXTURE0+T)}function N(C,T){const G=i.get(C);if(C.version>0&&G.__version!==C.version){oe(G,C,T);return}t.bindTexture(n.TEXTURE_CUBE_MAP,G.__webglTexture,n.TEXTURE0+T)}const K={1e3:n.REPEAT,1001:n.CLAMP_TO_EDGE,1002:n.MIRRORED_REPEAT},he={1003:n.NEAREST,1004:n.NEAREST_MIPMAP_NEAREST,1005:n.NEAREST_MIPMAP_LINEAR,1006:n.LINEAR,1007:n.LINEAR_MIPMAP_NEAREST,1008:n.LINEAR_MIPMAP_LINEAR},X={512:n.NEVER,519:n.ALWAYS,513:n.LESS,515:n.LEQUAL,514:n.EQUAL,518:n.GEQUAL,516:n.GREATER,517:n.NOTEQUAL};function Q(C,T){if(T.type===1015&&e.has("OES_texture_float_linear")===!1&&(T.magFilter===1006||T.magFilter===1007||T.magFilter===1005||T.magFilter===1008||T.minFilter===1006||T.minFilter===1007||T.minFilter===1005||T.minFilter===1008)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(C,n.TEXTURE_WRAP_S,K[T.wrapS]),n.texParameteri(C,n.TEXTURE_WRAP_T,K[T.wrapT]),(C===n.TEXTURE_3D||C===n.TEXTURE_2D_ARRAY)&&n.texParameteri(C,n.TEXTURE_WRAP_R,K[T.wrapR]),n.texParameteri(C,n.TEXTURE_MAG_FILTER,he[T.magFilter]),n.texParameteri(C,n.TEXTURE_MIN_FILTER,he[T.minFilter]),T.compareFunction&&(n.texParameteri(C,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(C,n.TEXTURE_COMPARE_FUNC,X[T.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(T.magFilter===1003||T.minFilter!==1005&&T.minFilter!==1008||T.type===1015&&e.has("OES_texture_float_linear")===!1)return;if(T.anisotropy>1||i.get(T).__currentAnisotropy){const G=e.get("EXT_texture_filter_anisotropic");n.texParameterf(C,G.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(T.anisotropy,r.getMaxAnisotropy())),i.get(T).__currentAnisotropy=T.anisotropy}}}function we(C,T){let G=!1;C.__webglInit===void 0&&(C.__webglInit=!0,T.addEventListener("dispose",R));const Z=T.source;let ie=p.get(Z);ie===void 0&&(ie={},p.set(Z,ie));const $=k(T);if($!==C.__cacheKey){ie[$]===void 0&&(ie[$]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,G=!0),ie[$].usedTimes++;const Te=ie[C.__cacheKey];Te!==void 0&&(ie[C.__cacheKey].usedTimes--,Te.usedTimes===0&&S(T)),C.__cacheKey=$,C.__webglTexture=ie[$].texture}return G}function W(C,T,G){let Z=n.TEXTURE_2D;(T.isDataArrayTexture||T.isCompressedArrayTexture)&&(Z=n.TEXTURE_2D_ARRAY),T.isData3DTexture&&(Z=n.TEXTURE_3D);const ie=we(C,T),$=T.source;t.bindTexture(Z,C.__webglTexture,n.TEXTURE0+G);const Te=i.get($);if($.version!==Te.__version||ie===!0){t.activeTexture(n.TEXTURE0+G);const pe=Qe.getPrimaries(Qe.workingColorSpace),Me=T.colorSpace===""?null:Qe.getPrimaries(T.colorSpace),Ze=T.colorSpace===""||pe===Me?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,T.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,T.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ze);let le=_(T.image,!1,r.maxTextureSize);le=Ue(T,le);const xe=s.convert(T.format,T.colorSpace),Fe=s.convert(T.type);let Be=M(T.internalFormat,xe,Fe,T.colorSpace,T.isVideoTexture);Q(Z,T);let Se;const $e=T.mipmaps,je=T.isVideoTexture!==!0,dt=Te.__version===void 0||ie===!0,F=$.dataReady,me=D(T,le);if(T.isDepthTexture)Be=x(T.format===1027,T.type),dt&&(je?t.texStorage2D(n.TEXTURE_2D,1,Be,le.width,le.height):t.texImage2D(n.TEXTURE_2D,0,Be,le.width,le.height,0,xe,Fe,null));else if(T.isDataTexture)if($e.length>0){je&&dt&&t.texStorage2D(n.TEXTURE_2D,me,Be,$e[0].width,$e[0].height);for(let J=0,ne=$e.length;J<ne;J++)Se=$e[J],je?F&&t.texSubImage2D(n.TEXTURE_2D,J,0,0,Se.width,Se.height,xe,Fe,Se.data):t.texImage2D(n.TEXTURE_2D,J,Be,Se.width,Se.height,0,xe,Fe,Se.data);T.generateMipmaps=!1}else je?(dt&&t.texStorage2D(n.TEXTURE_2D,me,Be,le.width,le.height),F&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,le.width,le.height,xe,Fe,le.data)):t.texImage2D(n.TEXTURE_2D,0,Be,le.width,le.height,0,xe,Fe,le.data);else if(T.isCompressedTexture)if(T.isCompressedArrayTexture){je&&dt&&t.texStorage3D(n.TEXTURE_2D_ARRAY,me,Be,$e[0].width,$e[0].height,le.depth);for(let J=0,ne=$e.length;J<ne;J++)if(Se=$e[J],T.format!==1023)if(xe!==null)if(je){if(F)if(T.layerUpdates.size>0){const ye=Ka(Se.width,Se.height,T.format,T.type);for(const ge of T.layerUpdates){const We=Se.data.subarray(ge*ye/Se.data.BYTES_PER_ELEMENT,(ge+1)*ye/Se.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,J,0,0,ge,Se.width,Se.height,1,xe,We)}T.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,J,0,0,0,Se.width,Se.height,le.depth,xe,Se.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,J,Be,Se.width,Se.height,le.depth,0,Se.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else je?F&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,J,0,0,0,Se.width,Se.height,le.depth,xe,Fe,Se.data):t.texImage3D(n.TEXTURE_2D_ARRAY,J,Be,Se.width,Se.height,le.depth,0,xe,Fe,Se.data)}else{je&&dt&&t.texStorage2D(n.TEXTURE_2D,me,Be,$e[0].width,$e[0].height);for(let J=0,ne=$e.length;J<ne;J++)Se=$e[J],T.format!==1023?xe!==null?je?F&&t.compressedTexSubImage2D(n.TEXTURE_2D,J,0,0,Se.width,Se.height,xe,Se.data):t.compressedTexImage2D(n.TEXTURE_2D,J,Be,Se.width,Se.height,0,Se.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):je?F&&t.texSubImage2D(n.TEXTURE_2D,J,0,0,Se.width,Se.height,xe,Fe,Se.data):t.texImage2D(n.TEXTURE_2D,J,Be,Se.width,Se.height,0,xe,Fe,Se.data)}else if(T.isDataArrayTexture)if(je){if(dt&&t.texStorage3D(n.TEXTURE_2D_ARRAY,me,Be,le.width,le.height,le.depth),F)if(T.layerUpdates.size>0){const J=Ka(le.width,le.height,T.format,T.type);for(const ne of T.layerUpdates){const ye=le.data.subarray(ne*J/le.data.BYTES_PER_ELEMENT,(ne+1)*J/le.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,ne,le.width,le.height,1,xe,Fe,ye)}T.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,le.width,le.height,le.depth,xe,Fe,le.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,Be,le.width,le.height,le.depth,0,xe,Fe,le.data);else if(T.isData3DTexture)je?(dt&&t.texStorage3D(n.TEXTURE_3D,me,Be,le.width,le.height,le.depth),F&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,le.width,le.height,le.depth,xe,Fe,le.data)):t.texImage3D(n.TEXTURE_3D,0,Be,le.width,le.height,le.depth,0,xe,Fe,le.data);else if(T.isFramebufferTexture){if(dt)if(je)t.texStorage2D(n.TEXTURE_2D,me,Be,le.width,le.height);else{let J=le.width,ne=le.height;for(let ye=0;ye<me;ye++)t.texImage2D(n.TEXTURE_2D,ye,Be,J,ne,0,xe,Fe,null),J>>=1,ne>>=1}}else if($e.length>0){if(je&&dt){const J=be($e[0]);t.texStorage2D(n.TEXTURE_2D,me,Be,J.width,J.height)}for(let J=0,ne=$e.length;J<ne;J++)Se=$e[J],je?F&&t.texSubImage2D(n.TEXTURE_2D,J,0,0,xe,Fe,Se):t.texImage2D(n.TEXTURE_2D,J,Be,xe,Fe,Se);T.generateMipmaps=!1}else if(je){if(dt){const J=be(le);t.texStorage2D(n.TEXTURE_2D,me,Be,J.width,J.height)}F&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,xe,Fe,le)}else t.texImage2D(n.TEXTURE_2D,0,Be,xe,Fe,le);m(T)&&d(Z),Te.__version=$.version,T.onUpdate&&T.onUpdate(T)}C.__version=T.version}function oe(C,T,G){if(T.image.length!==6)return;const Z=we(C,T),ie=T.source;t.bindTexture(n.TEXTURE_CUBE_MAP,C.__webglTexture,n.TEXTURE0+G);const $=i.get(ie);if(ie.version!==$.__version||Z===!0){t.activeTexture(n.TEXTURE0+G);const Te=Qe.getPrimaries(Qe.workingColorSpace),pe=T.colorSpace===""?null:Qe.getPrimaries(T.colorSpace),Me=T.colorSpace===""||Te===pe?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,T.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,T.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Me);const Ze=T.isCompressedTexture||T.image[0].isCompressedTexture,le=T.image[0]&&T.image[0].isDataTexture,xe=[];for(let ne=0;ne<6;ne++)!Ze&&!le?xe[ne]=_(T.image[ne],!0,r.maxCubemapSize):xe[ne]=le?T.image[ne].image:T.image[ne],xe[ne]=Ue(T,xe[ne]);const Fe=xe[0],Be=s.convert(T.format,T.colorSpace),Se=s.convert(T.type),$e=M(T.internalFormat,Be,Se,T.colorSpace),je=T.isVideoTexture!==!0,dt=$.__version===void 0||Z===!0,F=ie.dataReady;let me=D(T,Fe);Q(n.TEXTURE_CUBE_MAP,T);let J;if(Ze){je&&dt&&t.texStorage2D(n.TEXTURE_CUBE_MAP,me,$e,Fe.width,Fe.height);for(let ne=0;ne<6;ne++){J=xe[ne].mipmaps;for(let ye=0;ye<J.length;ye++){const ge=J[ye];T.format!==1023?Be!==null?je?F&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,ye,0,0,ge.width,ge.height,Be,ge.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,ye,$e,ge.width,ge.height,0,ge.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):je?F&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,ye,0,0,ge.width,ge.height,Be,Se,ge.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,ye,$e,ge.width,ge.height,0,Be,Se,ge.data)}}}else{if(J=T.mipmaps,je&&dt){J.length>0&&me++;const ne=be(xe[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,me,$e,ne.width,ne.height)}for(let ne=0;ne<6;ne++)if(le){je?F&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,0,0,xe[ne].width,xe[ne].height,Be,Se,xe[ne].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,$e,xe[ne].width,xe[ne].height,0,Be,Se,xe[ne].data);for(let ye=0;ye<J.length;ye++){const We=J[ye].image[ne].image;je?F&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,ye+1,0,0,We.width,We.height,Be,Se,We.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,ye+1,$e,We.width,We.height,0,Be,Se,We.data)}}else{je?F&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,0,0,Be,Se,xe[ne]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,0,$e,Be,Se,xe[ne]);for(let ye=0;ye<J.length;ye++){const ge=J[ye];je?F&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,ye+1,0,0,Be,Se,ge.image[ne]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ne,ye+1,$e,Be,Se,ge.image[ne])}}}m(T)&&d(n.TEXTURE_CUBE_MAP),$.__version=ie.version,T.onUpdate&&T.onUpdate(T)}C.__version=T.version}function se(C,T,G,Z,ie,$){const Te=s.convert(G.format,G.colorSpace),pe=s.convert(G.type),Me=M(G.internalFormat,Te,pe,G.colorSpace),Ze=i.get(T),le=i.get(G);if(le.__renderTarget=T,!Ze.__hasExternalTextures){const xe=Math.max(1,T.width>>$),Fe=Math.max(1,T.height>>$);ie===n.TEXTURE_3D||ie===n.TEXTURE_2D_ARRAY?t.texImage3D(ie,$,Me,xe,Fe,T.depth,0,Te,pe,null):t.texImage2D(ie,$,Me,xe,Fe,0,Te,pe,null)}t.bindFramebuffer(n.FRAMEBUFFER,C),ve(T)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,Z,ie,le.__webglTexture,0,ee(T)):(ie===n.TEXTURE_2D||ie>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&ie<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,Z,ie,le.__webglTexture,$),t.bindFramebuffer(n.FRAMEBUFFER,null)}function ae(C,T,G){if(n.bindRenderbuffer(n.RENDERBUFFER,C),T.depthBuffer){const Z=T.depthTexture,ie=Z&&Z.isDepthTexture?Z.type:null,$=x(T.stencilBuffer,ie),Te=T.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,pe=ee(T);ve(T)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,pe,$,T.width,T.height):G?n.renderbufferStorageMultisample(n.RENDERBUFFER,pe,$,T.width,T.height):n.renderbufferStorage(n.RENDERBUFFER,$,T.width,T.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,Te,n.RENDERBUFFER,C)}else{const Z=T.textures;for(let ie=0;ie<Z.length;ie++){const $=Z[ie],Te=s.convert($.format,$.colorSpace),pe=s.convert($.type),Me=M($.internalFormat,Te,pe,$.colorSpace),Ze=ee(T);G&&ve(T)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,Ze,Me,T.width,T.height):ve(T)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Ze,Me,T.width,T.height):n.renderbufferStorage(n.RENDERBUFFER,Me,T.width,T.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function Pe(C,T){if(T&&T.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(n.FRAMEBUFFER,C),!(T.depthTexture&&T.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const Z=i.get(T.depthTexture);Z.__renderTarget=T,(!Z.__webglTexture||T.depthTexture.image.width!==T.width||T.depthTexture.image.height!==T.height)&&(T.depthTexture.image.width=T.width,T.depthTexture.image.height=T.height,T.depthTexture.needsUpdate=!0),j(T.depthTexture,0);const ie=Z.__webglTexture,$=ee(T);if(T.depthTexture.format===1026)ve(T)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,ie,0,$):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,ie,0);else if(T.depthTexture.format===1027)ve(T)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,ie,0,$):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,ie,0);else throw new Error("Unknown depthTexture format")}function Oe(C){const T=i.get(C),G=C.isWebGLCubeRenderTarget===!0;if(T.__boundDepthTexture!==C.depthTexture){const Z=C.depthTexture;if(T.__depthDisposeCallback&&T.__depthDisposeCallback(),Z){const ie=()=>{delete T.__boundDepthTexture,delete T.__depthDisposeCallback,Z.removeEventListener("dispose",ie)};Z.addEventListener("dispose",ie),T.__depthDisposeCallback=ie}T.__boundDepthTexture=Z}if(C.depthTexture&&!T.__autoAllocateDepthBuffer){if(G)throw new Error("target.depthTexture not supported in Cube render targets");Pe(T.__webglFramebuffer,C)}else if(G){T.__webglDepthbuffer=[];for(let Z=0;Z<6;Z++)if(t.bindFramebuffer(n.FRAMEBUFFER,T.__webglFramebuffer[Z]),T.__webglDepthbuffer[Z]===void 0)T.__webglDepthbuffer[Z]=n.createRenderbuffer(),ae(T.__webglDepthbuffer[Z],C,!1);else{const ie=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,$=T.__webglDepthbuffer[Z];n.bindRenderbuffer(n.RENDERBUFFER,$),n.framebufferRenderbuffer(n.FRAMEBUFFER,ie,n.RENDERBUFFER,$)}}else if(t.bindFramebuffer(n.FRAMEBUFFER,T.__webglFramebuffer),T.__webglDepthbuffer===void 0)T.__webglDepthbuffer=n.createRenderbuffer(),ae(T.__webglDepthbuffer,C,!1);else{const Z=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ie=T.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,ie),n.framebufferRenderbuffer(n.FRAMEBUFFER,Z,n.RENDERBUFFER,ie)}t.bindFramebuffer(n.FRAMEBUFFER,null)}function De(C,T,G){const Z=i.get(C);T!==void 0&&se(Z.__webglFramebuffer,C,C.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),G!==void 0&&Oe(C)}function Je(C){const T=C.texture,G=i.get(C),Z=i.get(T);C.addEventListener("dispose",A);const ie=C.textures,$=C.isWebGLCubeRenderTarget===!0,Te=ie.length>1;if(Te||(Z.__webglTexture===void 0&&(Z.__webglTexture=n.createTexture()),Z.__version=T.version,o.memory.textures++),$){G.__webglFramebuffer=[];for(let pe=0;pe<6;pe++)if(T.mipmaps&&T.mipmaps.length>0){G.__webglFramebuffer[pe]=[];for(let Me=0;Me<T.mipmaps.length;Me++)G.__webglFramebuffer[pe][Me]=n.createFramebuffer()}else G.__webglFramebuffer[pe]=n.createFramebuffer()}else{if(T.mipmaps&&T.mipmaps.length>0){G.__webglFramebuffer=[];for(let pe=0;pe<T.mipmaps.length;pe++)G.__webglFramebuffer[pe]=n.createFramebuffer()}else G.__webglFramebuffer=n.createFramebuffer();if(Te)for(let pe=0,Me=ie.length;pe<Me;pe++){const Ze=i.get(ie[pe]);Ze.__webglTexture===void 0&&(Ze.__webglTexture=n.createTexture(),o.memory.textures++)}if(C.samples>0&&ve(C)===!1){G.__webglMultisampledFramebuffer=n.createFramebuffer(),G.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,G.__webglMultisampledFramebuffer);for(let pe=0;pe<ie.length;pe++){const Me=ie[pe];G.__webglColorRenderbuffer[pe]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,G.__webglColorRenderbuffer[pe]);const Ze=s.convert(Me.format,Me.colorSpace),le=s.convert(Me.type),xe=M(Me.internalFormat,Ze,le,Me.colorSpace,C.isXRRenderTarget===!0),Fe=ee(C);n.renderbufferStorageMultisample(n.RENDERBUFFER,Fe,xe,C.width,C.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+pe,n.RENDERBUFFER,G.__webglColorRenderbuffer[pe])}n.bindRenderbuffer(n.RENDERBUFFER,null),C.depthBuffer&&(G.__webglDepthRenderbuffer=n.createRenderbuffer(),ae(G.__webglDepthRenderbuffer,C,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if($){t.bindTexture(n.TEXTURE_CUBE_MAP,Z.__webglTexture),Q(n.TEXTURE_CUBE_MAP,T);for(let pe=0;pe<6;pe++)if(T.mipmaps&&T.mipmaps.length>0)for(let Me=0;Me<T.mipmaps.length;Me++)se(G.__webglFramebuffer[pe][Me],C,T,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+pe,Me);else se(G.__webglFramebuffer[pe],C,T,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+pe,0);m(T)&&d(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Te){for(let pe=0,Me=ie.length;pe<Me;pe++){const Ze=ie[pe],le=i.get(Ze);t.bindTexture(n.TEXTURE_2D,le.__webglTexture),Q(n.TEXTURE_2D,Ze),se(G.__webglFramebuffer,C,Ze,n.COLOR_ATTACHMENT0+pe,n.TEXTURE_2D,0),m(Ze)&&d(n.TEXTURE_2D)}t.unbindTexture()}else{let pe=n.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(pe=C.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(pe,Z.__webglTexture),Q(pe,T),T.mipmaps&&T.mipmaps.length>0)for(let Me=0;Me<T.mipmaps.length;Me++)se(G.__webglFramebuffer[Me],C,T,n.COLOR_ATTACHMENT0,pe,Me);else se(G.__webglFramebuffer,C,T,n.COLOR_ATTACHMENT0,pe,0);m(T)&&d(pe),t.unbindTexture()}C.depthBuffer&&Oe(C)}function te(C){const T=C.textures;for(let G=0,Z=T.length;G<Z;G++){const ie=T[G];if(m(ie)){const $=v(C),Te=i.get(ie).__webglTexture;t.bindTexture($,Te),d($),t.unbindTexture()}}}const Y=[],I=[];function ue(C){if(C.samples>0){if(ve(C)===!1){const T=C.textures,G=C.width,Z=C.height;let ie=n.COLOR_BUFFER_BIT;const $=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Te=i.get(C),pe=T.length>1;if(pe)for(let Me=0;Me<T.length;Me++)t.bindFramebuffer(n.FRAMEBUFFER,Te.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Me,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,Te.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Me,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,Te.__webglMultisampledFramebuffer),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Te.__webglFramebuffer);for(let Me=0;Me<T.length;Me++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(ie|=n.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(ie|=n.STENCIL_BUFFER_BIT)),pe){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,Te.__webglColorRenderbuffer[Me]);const Ze=i.get(T[Me]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,Ze,0)}n.blitFramebuffer(0,0,G,Z,0,0,G,Z,ie,n.NEAREST),l===!0&&(Y.length=0,I.length=0,Y.push(n.COLOR_ATTACHMENT0+Me),C.depthBuffer&&C.resolveDepthBuffer===!1&&(Y.push($),I.push($),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,I)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,Y))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),pe)for(let Me=0;Me<T.length;Me++){t.bindFramebuffer(n.FRAMEBUFFER,Te.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Me,n.RENDERBUFFER,Te.__webglColorRenderbuffer[Me]);const Ze=i.get(T[Me]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,Te.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Me,n.TEXTURE_2D,Ze,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Te.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&l){const T=C.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[T])}}}function ee(C){return Math.min(r.maxSamples,C.samples)}function ve(C){const T=i.get(C);return C.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&T.__useRenderToTexture!==!1}function de(C){const T=o.render.frame;h.get(C)!==T&&(h.set(C,T),C.update())}function Ue(C,T){const G=C.colorSpace,Z=C.format,ie=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||G!==Ai&&G!==""&&(Qe.getTransfer(G)===lt?(Z!==1023||ie!==1009)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",G)),T}function be(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=U,this.resetTextureUnits=L,this.setTexture2D=j,this.setTexture2DArray=z,this.setTexture3D=q,this.setTextureCube=N,this.rebindTextures=De,this.setupRenderTarget=Je,this.updateRenderTargetMipmap=te,this.updateMultisampleRenderTarget=ue,this.setupDepthRenderbuffer=Oe,this.setupFrameBufferTexture=se,this.useMultisampledRTT=ve}function bm(n,e){function t(i,r=""){let s;const o=Qe.getTransfer(r);if(i===1009)return n.UNSIGNED_BYTE;if(i===1017)return n.UNSIGNED_SHORT_4_4_4_4;if(i===1018)return n.UNSIGNED_SHORT_5_5_5_1;if(i===35902)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===1010)return n.BYTE;if(i===1011)return n.SHORT;if(i===1012)return n.UNSIGNED_SHORT;if(i===1013)return n.INT;if(i===1014)return n.UNSIGNED_INT;if(i===1015)return n.FLOAT;if(i===1016)return n.HALF_FLOAT;if(i===1021)return n.ALPHA;if(i===1022)return n.RGB;if(i===1023)return n.RGBA;if(i===1024)return n.LUMINANCE;if(i===1025)return n.LUMINANCE_ALPHA;if(i===1026)return n.DEPTH_COMPONENT;if(i===1027)return n.DEPTH_STENCIL;if(i===1028)return n.RED;if(i===1029)return n.RED_INTEGER;if(i===1030)return n.RG;if(i===1031)return n.RG_INTEGER;if(i===1033)return n.RGBA_INTEGER;if(i===33776||i===33777||i===33778||i===33779)if(o===lt)if(s=e.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(i===33776)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===33777)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===33778)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===33779)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=e.get("WEBGL_compressed_texture_s3tc"),s!==null){if(i===33776)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===33777)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===33778)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===33779)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===35840||i===35841||i===35842||i===35843)if(s=e.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(i===35840)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===35841)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===35842)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===35843)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===36196||i===37492||i===37496)if(s=e.get("WEBGL_compressed_texture_etc"),s!==null){if(i===36196||i===37492)return o===lt?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(i===37496)return o===lt?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===37808||i===37809||i===37810||i===37811||i===37812||i===37813||i===37814||i===37815||i===37816||i===37817||i===37818||i===37819||i===37820||i===37821)if(s=e.get("WEBGL_compressed_texture_astc"),s!==null){if(i===37808)return o===lt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===37809)return o===lt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===37810)return o===lt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===37811)return o===lt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===37812)return o===lt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===37813)return o===lt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===37814)return o===lt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===37815)return o===lt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===37816)return o===lt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===37817)return o===lt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===37818)return o===lt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===37819)return o===lt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===37820)return o===lt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===37821)return o===lt?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===36492||i===36494||i===36495)if(s=e.get("EXT_texture_compression_bptc"),s!==null){if(i===36492)return o===lt?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===36494)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===36495)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===36283||i===36284||i===36285||i===36286)if(s=e.get("EXT_texture_compression_rgtc"),s!==null){if(i===36492)return s.COMPRESSED_RED_RGTC1_EXT;if(i===36284)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===36285)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===36286)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===1020?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}class Mm extends Vt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class Ht extends bt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const xm={type:"move"};class Hs{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ht,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ht,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ht,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let r=null,s=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(const _ of e.hand.values()){const m=t.getJointPose(_,i),d=this._getHandJoint(c,_);m!==null&&(d.matrix.fromArray(m.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=m.radius),d.visible=m!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],p=h.position.distanceTo(u.position),f=.02,g=.005;c.inputState.pinching&&p>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&p<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(s=t.getPose(e.gripSpace,i),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(r=t.getPose(e.targetRaySpace,i),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(xm)))}return a!==null&&(a.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new Ht;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}const Sm=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,wm=`
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

}`;class Tm{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,i){if(this.texture===null){const r=new Ct,s=e.properties.get(r);s.__webglTexture=t.texture,(t.depthNear!=i.depthNear||t.depthFar!=i.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=r}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,i=new Ln({vertexShader:Sm,fragmentShader:wm,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new ut(new wi(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Em extends Ri{constructor(e,t){super();const i=this;let r=null,s=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,p=null,f=null,g=null;const _=new Tm,m=t.getContextAttributes();let d=null,v=null;const M=[],x=[],D=new re;let R=null;const A=new Vt;A.viewport=new tt;const w=new Vt;w.viewport=new tt;const S=[A,w],b=new Mm;let y=null,L=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(W){let oe=M[W];return oe===void 0&&(oe=new Hs,M[W]=oe),oe.getTargetRaySpace()},this.getControllerGrip=function(W){let oe=M[W];return oe===void 0&&(oe=new Hs,M[W]=oe),oe.getGripSpace()},this.getHand=function(W){let oe=M[W];return oe===void 0&&(oe=new Hs,M[W]=oe),oe.getHandSpace()};function U(W){const oe=x.indexOf(W.inputSource);if(oe===-1)return;const se=M[oe];se!==void 0&&(se.update(W.inputSource,W.frame,c||o),se.dispatchEvent({type:W.type,data:W.inputSource}))}function k(){r.removeEventListener("select",U),r.removeEventListener("selectstart",U),r.removeEventListener("selectend",U),r.removeEventListener("squeeze",U),r.removeEventListener("squeezestart",U),r.removeEventListener("squeezeend",U),r.removeEventListener("end",k),r.removeEventListener("inputsourceschange",j);for(let W=0;W<M.length;W++){const oe=x[W];oe!==null&&(x[W]=null,M[W].disconnect(oe))}y=null,L=null,_.reset(),e.setRenderTarget(d),f=null,p=null,u=null,r=null,v=null,we.stop(),i.isPresenting=!1,e.setPixelRatio(R),e.setSize(D.width,D.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(W){s=W,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(W){a=W,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(W){c=W},this.getBaseLayer=function(){return p!==null?p:f},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return r},this.setSession=async function(W){if(r=W,r!==null){if(d=e.getRenderTarget(),r.addEventListener("select",U),r.addEventListener("selectstart",U),r.addEventListener("selectend",U),r.addEventListener("squeeze",U),r.addEventListener("squeezestart",U),r.addEventListener("squeezeend",U),r.addEventListener("end",k),r.addEventListener("inputsourceschange",j),m.xrCompatible!==!0&&await t.makeXRCompatible(),R=e.getPixelRatio(),e.getSize(D),r.renderState.layers===void 0){const oe={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:s};f=new XRWebGLLayer(r,t,oe),r.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),v=new qn(f.framebufferWidth,f.framebufferHeight,{format:1023,type:1009,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil})}else{let oe=null,se=null,ae=null;m.depth&&(ae=m.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,oe=m.stencil?1027:1026,se=m.stencil?1020:1014);const Pe={colorFormat:t.RGBA8,depthFormat:ae,scaleFactor:s};u=new XRWebGLBinding(r,t),p=u.createProjectionLayer(Pe),r.updateRenderState({layers:[p]}),e.setPixelRatio(1),e.setSize(p.textureWidth,p.textureHeight,!1),v=new qn(p.textureWidth,p.textureHeight,{format:1023,type:1009,depthTexture:new Ql(p.textureWidth,p.textureHeight,se,void 0,void 0,void 0,void 0,void 0,void 0,oe),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:p.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await r.requestReferenceSpace(a),we.setContext(r),we.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function j(W){for(let oe=0;oe<W.removed.length;oe++){const se=W.removed[oe],ae=x.indexOf(se);ae>=0&&(x[ae]=null,M[ae].disconnect(se))}for(let oe=0;oe<W.added.length;oe++){const se=W.added[oe];let ae=x.indexOf(se);if(ae===-1){for(let Oe=0;Oe<M.length;Oe++)if(Oe>=x.length){x.push(se),ae=Oe;break}else if(x[Oe]===null){x[Oe]=se,ae=Oe;break}if(ae===-1)break}const Pe=M[ae];Pe&&Pe.connect(se)}}const z=new P,q=new P;function N(W,oe,se){z.setFromMatrixPosition(oe.matrixWorld),q.setFromMatrixPosition(se.matrixWorld);const ae=z.distanceTo(q),Pe=oe.projectionMatrix.elements,Oe=se.projectionMatrix.elements,De=Pe[14]/(Pe[10]-1),Je=Pe[14]/(Pe[10]+1),te=(Pe[9]+1)/Pe[5],Y=(Pe[9]-1)/Pe[5],I=(Pe[8]-1)/Pe[0],ue=(Oe[8]+1)/Oe[0],ee=De*I,ve=De*ue,de=ae/(-I+ue),Ue=de*-I;if(oe.matrixWorld.decompose(W.position,W.quaternion,W.scale),W.translateX(Ue),W.translateZ(de),W.matrixWorld.compose(W.position,W.quaternion,W.scale),W.matrixWorldInverse.copy(W.matrixWorld).invert(),Pe[10]===-1)W.projectionMatrix.copy(oe.projectionMatrix),W.projectionMatrixInverse.copy(oe.projectionMatrixInverse);else{const be=De+de,C=Je+de,T=ee-Ue,G=ve+(ae-Ue),Z=te*Je/C*be,ie=Y*Je/C*be;W.projectionMatrix.makePerspective(T,G,Z,ie,be,C),W.projectionMatrixInverse.copy(W.projectionMatrix).invert()}}function K(W,oe){oe===null?W.matrixWorld.copy(W.matrix):W.matrixWorld.multiplyMatrices(oe.matrixWorld,W.matrix),W.matrixWorldInverse.copy(W.matrixWorld).invert()}this.updateCamera=function(W){if(r===null)return;let oe=W.near,se=W.far;_.texture!==null&&(_.depthNear>0&&(oe=_.depthNear),_.depthFar>0&&(se=_.depthFar)),b.near=w.near=A.near=oe,b.far=w.far=A.far=se,(y!==b.near||L!==b.far)&&(r.updateRenderState({depthNear:b.near,depthFar:b.far}),y=b.near,L=b.far),A.layers.mask=W.layers.mask|2,w.layers.mask=W.layers.mask|4,b.layers.mask=A.layers.mask|w.layers.mask;const ae=W.parent,Pe=b.cameras;K(b,ae);for(let Oe=0;Oe<Pe.length;Oe++)K(Pe[Oe],ae);Pe.length===2?N(b,A,w):b.projectionMatrix.copy(A.projectionMatrix),he(W,b,ae)};function he(W,oe,se){se===null?W.matrix.copy(oe.matrixWorld):(W.matrix.copy(se.matrixWorld),W.matrix.invert(),W.matrix.multiply(oe.matrixWorld)),W.matrix.decompose(W.position,W.quaternion,W.scale),W.updateMatrixWorld(!0),W.projectionMatrix.copy(oe.projectionMatrix),W.projectionMatrixInverse.copy(oe.projectionMatrixInverse),W.isPerspectiveCamera&&(W.fov=xi*2*Math.atan(1/W.projectionMatrix.elements[5]),W.zoom=1)}this.getCamera=function(){return b},this.getFoveation=function(){if(!(p===null&&f===null))return l},this.setFoveation=function(W){l=W,p!==null&&(p.fixedFoveation=W),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=W)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(b)};let X=null;function Q(W,oe){if(h=oe.getViewerPose(c||o),g=oe,h!==null){const se=h.views;f!==null&&(e.setRenderTargetFramebuffer(v,f.framebuffer),e.setRenderTarget(v));let ae=!1;se.length!==b.cameras.length&&(b.cameras.length=0,ae=!0);for(let Oe=0;Oe<se.length;Oe++){const De=se[Oe];let Je=null;if(f!==null)Je=f.getViewport(De);else{const Y=u.getViewSubImage(p,De);Je=Y.viewport,Oe===0&&(e.setRenderTargetTextures(v,Y.colorTexture,p.ignoreDepthValues?void 0:Y.depthStencilTexture),e.setRenderTarget(v))}let te=S[Oe];te===void 0&&(te=new Vt,te.layers.enable(Oe),te.viewport=new tt,S[Oe]=te),te.matrix.fromArray(De.transform.matrix),te.matrix.decompose(te.position,te.quaternion,te.scale),te.projectionMatrix.fromArray(De.projectionMatrix),te.projectionMatrixInverse.copy(te.projectionMatrix).invert(),te.viewport.set(Je.x,Je.y,Je.width,Je.height),Oe===0&&(b.matrix.copy(te.matrix),b.matrix.decompose(b.position,b.quaternion,b.scale)),ae===!0&&b.cameras.push(te)}const Pe=r.enabledFeatures;if(Pe&&Pe.includes("depth-sensing")){const Oe=u.getDepthInformation(se[0]);Oe&&Oe.isValid&&Oe.texture&&_.init(e,Oe,r.renderState)}}for(let se=0;se<M.length;se++){const ae=x[se],Pe=M[se];ae!==null&&Pe!==void 0&&Pe.update(ae,oe,c||o)}X&&X(W,oe),oe.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:oe}),g=null}const we=new Zl;we.setAnimationLoop(Q),this.setAnimationLoop=function(W){X=W},this.dispose=function(){}}}const Bn=new nn,Am=new Ve;function Rm(n,e){function t(m,d){m.matrixAutoUpdate===!0&&m.updateMatrix(),d.value.copy(m.matrix)}function i(m,d){d.color.getRGB(m.fogColor.value,jl(n)),d.isFog?(m.fogNear.value=d.near,m.fogFar.value=d.far):d.isFogExp2&&(m.fogDensity.value=d.density)}function r(m,d,v,M,x){d.isMeshBasicMaterial||d.isMeshLambertMaterial?s(m,d):d.isMeshToonMaterial?(s(m,d),u(m,d)):d.isMeshPhongMaterial?(s(m,d),h(m,d)):d.isMeshStandardMaterial?(s(m,d),p(m,d),d.isMeshPhysicalMaterial&&f(m,d,x)):d.isMeshMatcapMaterial?(s(m,d),g(m,d)):d.isMeshDepthMaterial?s(m,d):d.isMeshDistanceMaterial?(s(m,d),_(m,d)):d.isMeshNormalMaterial?s(m,d):d.isLineBasicMaterial?(o(m,d),d.isLineDashedMaterial&&a(m,d)):d.isPointsMaterial?l(m,d,v,M):d.isSpriteMaterial?c(m,d):d.isShadowMaterial?(m.color.value.copy(d.color),m.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function s(m,d){m.opacity.value=d.opacity,d.color&&m.diffuse.value.copy(d.color),d.emissive&&m.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(m.map.value=d.map,t(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.bumpMap&&(m.bumpMap.value=d.bumpMap,t(d.bumpMap,m.bumpMapTransform),m.bumpScale.value=d.bumpScale,d.side===1&&(m.bumpScale.value*=-1)),d.normalMap&&(m.normalMap.value=d.normalMap,t(d.normalMap,m.normalMapTransform),m.normalScale.value.copy(d.normalScale),d.side===1&&m.normalScale.value.negate()),d.displacementMap&&(m.displacementMap.value=d.displacementMap,t(d.displacementMap,m.displacementMapTransform),m.displacementScale.value=d.displacementScale,m.displacementBias.value=d.displacementBias),d.emissiveMap&&(m.emissiveMap.value=d.emissiveMap,t(d.emissiveMap,m.emissiveMapTransform)),d.specularMap&&(m.specularMap.value=d.specularMap,t(d.specularMap,m.specularMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest);const v=e.get(d),M=v.envMap,x=v.envMapRotation;M&&(m.envMap.value=M,Bn.copy(x),Bn.x*=-1,Bn.y*=-1,Bn.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(Bn.y*=-1,Bn.z*=-1),m.envMapRotation.value.setFromMatrix4(Am.makeRotationFromEuler(Bn)),m.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=d.reflectivity,m.ior.value=d.ior,m.refractionRatio.value=d.refractionRatio),d.lightMap&&(m.lightMap.value=d.lightMap,m.lightMapIntensity.value=d.lightMapIntensity,t(d.lightMap,m.lightMapTransform)),d.aoMap&&(m.aoMap.value=d.aoMap,m.aoMapIntensity.value=d.aoMapIntensity,t(d.aoMap,m.aoMapTransform))}function o(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,d.map&&(m.map.value=d.map,t(d.map,m.mapTransform))}function a(m,d){m.dashSize.value=d.dashSize,m.totalSize.value=d.dashSize+d.gapSize,m.scale.value=d.scale}function l(m,d,v,M){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.size.value=d.size*v,m.scale.value=M*.5,d.map&&(m.map.value=d.map,t(d.map,m.uvTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function c(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.rotation.value=d.rotation,d.map&&(m.map.value=d.map,t(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function h(m,d){m.specular.value.copy(d.specular),m.shininess.value=Math.max(d.shininess,1e-4)}function u(m,d){d.gradientMap&&(m.gradientMap.value=d.gradientMap)}function p(m,d){m.metalness.value=d.metalness,d.metalnessMap&&(m.metalnessMap.value=d.metalnessMap,t(d.metalnessMap,m.metalnessMapTransform)),m.roughness.value=d.roughness,d.roughnessMap&&(m.roughnessMap.value=d.roughnessMap,t(d.roughnessMap,m.roughnessMapTransform)),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)}function f(m,d,v){m.ior.value=d.ior,d.sheen>0&&(m.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),m.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(m.sheenColorMap.value=d.sheenColorMap,t(d.sheenColorMap,m.sheenColorMapTransform)),d.sheenRoughnessMap&&(m.sheenRoughnessMap.value=d.sheenRoughnessMap,t(d.sheenRoughnessMap,m.sheenRoughnessMapTransform))),d.clearcoat>0&&(m.clearcoat.value=d.clearcoat,m.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(m.clearcoatMap.value=d.clearcoatMap,t(d.clearcoatMap,m.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,t(d.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(m.clearcoatNormalMap.value=d.clearcoatNormalMap,t(d.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===1&&m.clearcoatNormalScale.value.negate())),d.dispersion>0&&(m.dispersion.value=d.dispersion),d.iridescence>0&&(m.iridescence.value=d.iridescence,m.iridescenceIOR.value=d.iridescenceIOR,m.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(m.iridescenceMap.value=d.iridescenceMap,t(d.iridescenceMap,m.iridescenceMapTransform)),d.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=d.iridescenceThicknessMap,t(d.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),d.transmission>0&&(m.transmission.value=d.transmission,m.transmissionSamplerMap.value=v.texture,m.transmissionSamplerSize.value.set(v.width,v.height),d.transmissionMap&&(m.transmissionMap.value=d.transmissionMap,t(d.transmissionMap,m.transmissionMapTransform)),m.thickness.value=d.thickness,d.thicknessMap&&(m.thicknessMap.value=d.thicknessMap,t(d.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=d.attenuationDistance,m.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(m.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(m.anisotropyMap.value=d.anisotropyMap,t(d.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=d.specularIntensity,m.specularColor.value.copy(d.specularColor),d.specularColorMap&&(m.specularColorMap.value=d.specularColorMap,t(d.specularColorMap,m.specularColorMapTransform)),d.specularIntensityMap&&(m.specularIntensityMap.value=d.specularIntensityMap,t(d.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,d){d.matcap&&(m.matcap.value=d.matcap)}function _(m,d){const v=e.get(d).light;m.referencePosition.value.setFromMatrixPosition(v.matrixWorld),m.nearDistance.value=v.shadow.camera.near,m.farDistance.value=v.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:r}}function Cm(n,e,t,i){let r={},s={},o=[];const a=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(v,M){const x=M.program;i.uniformBlockBinding(v,x)}function c(v,M){let x=r[v.id];x===void 0&&(g(v),x=h(v),r[v.id]=x,v.addEventListener("dispose",m));const D=M.program;i.updateUBOMapping(v,D);const R=e.render.frame;s[v.id]!==R&&(p(v),s[v.id]=R)}function h(v){const M=u();v.__bindingPointIndex=M;const x=n.createBuffer(),D=v.__size,R=v.usage;return n.bindBuffer(n.UNIFORM_BUFFER,x),n.bufferData(n.UNIFORM_BUFFER,D,R),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,M,x),x}function u(){for(let v=0;v<a;v++)if(o.indexOf(v)===-1)return o.push(v),v;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function p(v){const M=r[v.id],x=v.uniforms,D=v.__cache;n.bindBuffer(n.UNIFORM_BUFFER,M);for(let R=0,A=x.length;R<A;R++){const w=Array.isArray(x[R])?x[R]:[x[R]];for(let S=0,b=w.length;S<b;S++){const y=w[S];if(f(y,R,S,D)===!0){const L=y.__offset,U=Array.isArray(y.value)?y.value:[y.value];let k=0;for(let j=0;j<U.length;j++){const z=U[j],q=_(z);typeof z=="number"||typeof z=="boolean"?(y.__data[0]=z,n.bufferSubData(n.UNIFORM_BUFFER,L+k,y.__data)):z.isMatrix3?(y.__data[0]=z.elements[0],y.__data[1]=z.elements[1],y.__data[2]=z.elements[2],y.__data[3]=0,y.__data[4]=z.elements[3],y.__data[5]=z.elements[4],y.__data[6]=z.elements[5],y.__data[7]=0,y.__data[8]=z.elements[6],y.__data[9]=z.elements[7],y.__data[10]=z.elements[8],y.__data[11]=0):(z.toArray(y.__data,k),k+=q.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,L,y.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function f(v,M,x,D){const R=v.value,A=M+"_"+x;if(D[A]===void 0)return typeof R=="number"||typeof R=="boolean"?D[A]=R:D[A]=R.clone(),!0;{const w=D[A];if(typeof R=="number"||typeof R=="boolean"){if(w!==R)return D[A]=R,!0}else if(w.equals(R)===!1)return w.copy(R),!0}return!1}function g(v){const M=v.uniforms;let x=0;const D=16;for(let A=0,w=M.length;A<w;A++){const S=Array.isArray(M[A])?M[A]:[M[A]];for(let b=0,y=S.length;b<y;b++){const L=S[b],U=Array.isArray(L.value)?L.value:[L.value];for(let k=0,j=U.length;k<j;k++){const z=U[k],q=_(z),N=x%D,K=N%q.boundary,he=N+K;x+=K,he!==0&&D-he<q.storage&&(x+=D-he),L.__data=new Float32Array(q.storage/Float32Array.BYTES_PER_ELEMENT),L.__offset=x,x+=q.storage}}}const R=x%D;return R>0&&(x+=D-R),v.__size=x,v.__cache={},this}function _(v){const M={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(M.boundary=4,M.storage=4):v.isVector2?(M.boundary=8,M.storage=8):v.isVector3||v.isColor?(M.boundary=16,M.storage=12):v.isVector4?(M.boundary=16,M.storage=16):v.isMatrix3?(M.boundary=48,M.storage=48):v.isMatrix4?(M.boundary=64,M.storage=64):v.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",v),M}function m(v){const M=v.target;M.removeEventListener("dispose",m);const x=o.indexOf(M.__bindingPointIndex);o.splice(x,1),n.deleteBuffer(r[M.id]),delete r[M.id],delete s[M.id]}function d(){for(const v in r)n.deleteBuffer(r[v]);o=[],r={},s={}}return{bind:l,update:c,dispose:d}}class D_{constructor(e={}){const{canvas:t=ph(),context:i=null,depth:r=!0,stencil:s=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reverseDepthBuffer:p=!1}=e;this.isWebGLRenderer=!0;let f;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=i.getContextAttributes().alpha}else f=o;const g=new Uint32Array(4),_=new Int32Array(4);let m=null,d=null;const v=[],M=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Ot,this.toneMapping=0,this.toneMappingExposure=1;const x=this;let D=!1,R=0,A=0,w=null,S=-1,b=null;const y=new tt,L=new tt;let U=null;const k=new Ie(0);let j=0,z=t.width,q=t.height,N=1,K=null,he=null;const X=new tt(0,0,z,q),Q=new tt(0,0,z,q);let we=!1;const W=new Lo;let oe=!1,se=!1;const ae=new Ve,Pe=new Ve,Oe=new P,De=new tt,Je={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let te=!1;function Y(){return w===null?N:1}let I=i;function ue(E,O){return t.getContext(E,O)}try{const E={alpha:!0,depth:r,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine","three.js r170"),t.addEventListener("webglcontextlost",ne,!1),t.addEventListener("webglcontextrestored",ye,!1),t.addEventListener("webglcontextcreationerror",ge,!1),I===null){const O="webgl2";if(I=ue(O,E),I===null)throw ue(O)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(E){throw console.error("THREE.WebGLRenderer: "+E.message),E}let ee,ve,de,Ue,be,C,T,G,Z,ie,$,Te,pe,Me,Ze,le,xe,Fe,Be,Se,$e,je,dt,F;function me(){ee=new Uf(I),ee.init(),je=new bm(I,ee),ve=new Cf(I,ee,e,je),de=new _m(I,ee),ve.reverseDepthBuffer&&p&&de.buffers.depth.setReversed(!0),Ue=new Of(I),be=new nm,C=new vm(I,ee,de,be,ve,je,Ue),T=new Lf(x),G=new Nf(x),Z=new Wh(I),dt=new Af(I,Z),ie=new Ff(I,Z,Ue,dt),$=new zf(I,ie,Z,Ue),Be=new Bf(I,ve,C),le=new Pf(be),Te=new tm(x,T,G,ee,ve,dt,le),pe=new Rm(x,be),Me=new rm,Ze=new hm(ee),Fe=new Ef(x,T,G,de,$,f,l),xe=new mm(x,$,ve),F=new Cm(I,Ue,ve,de),Se=new Rf(I,ee,Ue),$e=new kf(I,ee,Ue),Ue.programs=Te.programs,x.capabilities=ve,x.extensions=ee,x.properties=be,x.renderLists=Me,x.shadowMap=xe,x.state=de,x.info=Ue}me();const J=new Em(x,I);this.xr=J,this.getContext=function(){return I},this.getContextAttributes=function(){return I.getContextAttributes()},this.forceContextLoss=function(){const E=ee.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){const E=ee.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return N},this.setPixelRatio=function(E){E!==void 0&&(N=E,this.setSize(z,q,!1))},this.getSize=function(E){return E.set(z,q)},this.setSize=function(E,O,V=!0){if(J.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}z=E,q=O,t.width=Math.floor(E*N),t.height=Math.floor(O*N),V===!0&&(t.style.width=E+"px",t.style.height=O+"px"),this.setViewport(0,0,E,O)},this.getDrawingBufferSize=function(E){return E.set(z*N,q*N).floor()},this.setDrawingBufferSize=function(E,O,V){z=E,q=O,N=V,t.width=Math.floor(E*V),t.height=Math.floor(O*V),this.setViewport(0,0,E,O)},this.getCurrentViewport=function(E){return E.copy(y)},this.getViewport=function(E){return E.copy(X)},this.setViewport=function(E,O,V,H){E.isVector4?X.set(E.x,E.y,E.z,E.w):X.set(E,O,V,H),de.viewport(y.copy(X).multiplyScalar(N).round())},this.getScissor=function(E){return E.copy(Q)},this.setScissor=function(E,O,V,H){E.isVector4?Q.set(E.x,E.y,E.z,E.w):Q.set(E,O,V,H),de.scissor(L.copy(Q).multiplyScalar(N).round())},this.getScissorTest=function(){return we},this.setScissorTest=function(E){de.setScissorTest(we=E)},this.setOpaqueSort=function(E){K=E},this.setTransparentSort=function(E){he=E},this.getClearColor=function(E){return E.copy(Fe.getClearColor())},this.setClearColor=function(){Fe.setClearColor.apply(Fe,arguments)},this.getClearAlpha=function(){return Fe.getClearAlpha()},this.setClearAlpha=function(){Fe.setClearAlpha.apply(Fe,arguments)},this.clear=function(E=!0,O=!0,V=!0){let H=0;if(E){let B=!1;if(w!==null){const ce=w.texture.format;B=ce===1033||ce===1031||ce===1029}if(B){const ce=w.texture.type,_e=ce===1009||ce===1014||ce===1012||ce===1020||ce===1017||ce===1018,Ae=Fe.getClearColor(),Re=Fe.getClearAlpha(),ze=Ae.r,Xe=Ae.g,Ce=Ae.b;_e?(g[0]=ze,g[1]=Xe,g[2]=Ce,g[3]=Re,I.clearBufferuiv(I.COLOR,0,g)):(_[0]=ze,_[1]=Xe,_[2]=Ce,_[3]=Re,I.clearBufferiv(I.COLOR,0,_))}else H|=I.COLOR_BUFFER_BIT}O&&(H|=I.DEPTH_BUFFER_BIT),V&&(H|=I.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),I.clear(H)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",ne,!1),t.removeEventListener("webglcontextrestored",ye,!1),t.removeEventListener("webglcontextcreationerror",ge,!1),Me.dispose(),Ze.dispose(),be.dispose(),T.dispose(),G.dispose(),$.dispose(),dt.dispose(),F.dispose(),Te.dispose(),J.dispose(),J.removeEventListener("sessionstart",jo),J.removeEventListener("sessionend",Ko),Dn.stop()};function ne(E){E.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),D=!0}function ye(){console.log("THREE.WebGLRenderer: Context Restored."),D=!1;const E=Ue.autoReset,O=xe.enabled,V=xe.autoUpdate,H=xe.needsUpdate,B=xe.type;me(),Ue.autoReset=E,xe.enabled=O,xe.autoUpdate=V,xe.needsUpdate=H,xe.type=B}function ge(E){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function We(E){const O=E.target;O.removeEventListener("dispose",We),Mt(O)}function Mt(E){Pt(E),be.remove(E)}function Pt(E){const O=be.get(E).programs;O!==void 0&&(O.forEach(function(V){Te.releaseProgram(V)}),E.isShaderMaterial&&Te.releaseShaderCache(E))}this.renderBufferDirect=function(E,O,V,H,B,ce){O===null&&(O=Je);const _e=B.isMesh&&B.matrixWorld.determinant()<0,Ae=jc(E,O,V,H,B);de.setMaterial(H,_e);let Re=V.index,ze=1;if(H.wireframe===!0){if(Re=ie.getWireframeAttribute(V),Re===void 0)return;ze=2}const Xe=V.drawRange,Ce=V.attributes.position;let et=Xe.start*ze,ft=(Xe.start+Xe.count)*ze;ce!==null&&(et=Math.max(et,ce.start*ze),ft=Math.min(ft,(ce.start+ce.count)*ze)),Re!==null?(et=Math.max(et,0),ft=Math.min(ft,Re.count)):Ce!=null&&(et=Math.max(et,0),ft=Math.min(ft,Ce.count));const mt=ft-et;if(mt<0||mt===1/0)return;dt.setup(B,H,Ae,V,Re);let kt,nt=Se;if(Re!==null&&(kt=Z.get(Re),nt=$e,nt.setIndex(kt)),B.isMesh)H.wireframe===!0?(de.setLineWidth(H.wireframeLinewidth*Y()),nt.setMode(I.LINES)):nt.setMode(I.TRIANGLES);else if(B.isLine){let Le=H.linewidth;Le===void 0&&(Le=1),de.setLineWidth(Le*Y()),B.isLineSegments?nt.setMode(I.LINES):B.isLineLoop?nt.setMode(I.LINE_LOOP):nt.setMode(I.LINE_STRIP)}else B.isPoints?nt.setMode(I.POINTS):B.isSprite&&nt.setMode(I.TRIANGLES);if(B.isBatchedMesh)if(B._multiDrawInstances!==null)nt.renderMultiDrawInstances(B._multiDrawStarts,B._multiDrawCounts,B._multiDrawCount,B._multiDrawInstances);else if(ee.get("WEBGL_multi_draw"))nt.renderMultiDraw(B._multiDrawStarts,B._multiDrawCounts,B._multiDrawCount);else{const Le=B._multiDrawStarts,hn=B._multiDrawCounts,it=B._multiDrawCount,Jt=Re?Z.get(Re).bytesPerElement:1,Kn=be.get(H).currentProgram.getUniforms();for(let Bt=0;Bt<it;Bt++)Kn.setValue(I,"_gl_DrawID",Bt),nt.render(Le[Bt]/Jt,hn[Bt])}else if(B.isInstancedMesh)nt.renderInstances(et,mt,B.count);else if(V.isInstancedBufferGeometry){const Le=V._maxInstanceCount!==void 0?V._maxInstanceCount:1/0,hn=Math.min(V.instanceCount,Le);nt.renderInstances(et,mt,hn)}else nt.render(et,mt)};function st(E,O,V){E.transparent===!0&&E.side===2&&E.forceSinglePass===!1?(E.side=1,E.needsUpdate=!0,lr(E,O,V),E.side=0,E.needsUpdate=!0,lr(E,O,V),E.side=2):lr(E,O,V)}this.compile=function(E,O,V=null){V===null&&(V=E),d=Ze.get(V),d.init(O),M.push(d),V.traverseVisible(function(B){B.isLight&&B.layers.test(O.layers)&&(d.pushLight(B),B.castShadow&&d.pushShadow(B))}),E!==V&&E.traverseVisible(function(B){B.isLight&&B.layers.test(O.layers)&&(d.pushLight(B),B.castShadow&&d.pushShadow(B))}),d.setupLights();const H=new Set;return E.traverse(function(B){if(!(B.isMesh||B.isPoints||B.isLine||B.isSprite))return;const ce=B.material;if(ce)if(Array.isArray(ce))for(let _e=0;_e<ce.length;_e++){const Ae=ce[_e];st(Ae,V,B),H.add(Ae)}else st(ce,V,B),H.add(ce)}),M.pop(),d=null,H},this.compileAsync=function(E,O,V=null){const H=this.compile(E,O,V);return new Promise(B=>{function ce(){if(H.forEach(function(_e){be.get(_e).currentProgram.isReady()&&H.delete(_e)}),H.size===0){B(E);return}setTimeout(ce,10)}ee.get("KHR_parallel_shader_compile")!==null?ce():setTimeout(ce,10)})};let Kt=null;function cn(E){Kt&&Kt(E)}function jo(){Dn.stop()}function Ko(){Dn.start()}const Dn=new Zl;Dn.setAnimationLoop(cn),typeof self<"u"&&Dn.setContext(self),this.setAnimationLoop=function(E){Kt=E,J.setAnimationLoop(E),E===null?Dn.stop():Dn.start()},J.addEventListener("sessionstart",jo),J.addEventListener("sessionend",Ko),this.render=function(E,O){if(O!==void 0&&O.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(D===!0)return;if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),O.parent===null&&O.matrixWorldAutoUpdate===!0&&O.updateMatrixWorld(),J.enabled===!0&&J.isPresenting===!0&&(J.cameraAutoUpdate===!0&&J.updateCamera(O),O=J.getCamera()),E.isScene===!0&&E.onBeforeRender(x,E,O,w),d=Ze.get(E,M.length),d.init(O),M.push(d),Pe.multiplyMatrices(O.projectionMatrix,O.matrixWorldInverse),W.setFromProjectionMatrix(Pe),se=this.localClippingEnabled,oe=le.init(this.clippingPlanes,se),m=Me.get(E,v.length),m.init(),v.push(m),J.enabled===!0&&J.isPresenting===!0){const ce=x.xr.getDepthSensingMesh();ce!==null&&gs(ce,O,-1/0,x.sortObjects)}gs(E,O,0,x.sortObjects),m.finish(),x.sortObjects===!0&&m.sort(K,he),te=J.enabled===!1||J.isPresenting===!1||J.hasDepthSensing()===!1,te&&Fe.addToRenderList(m,E),this.info.render.frame++,oe===!0&&le.beginShadows();const V=d.state.shadowsArray;xe.render(V,E,O),oe===!0&&le.endShadows(),this.info.autoReset===!0&&this.info.reset();const H=m.opaque,B=m.transmissive;if(d.setupLights(),O.isArrayCamera){const ce=O.cameras;if(B.length>0)for(let _e=0,Ae=ce.length;_e<Ae;_e++){const Re=ce[_e];Zo(H,B,E,Re)}te&&Fe.render(E);for(let _e=0,Ae=ce.length;_e<Ae;_e++){const Re=ce[_e];Jo(m,E,Re,Re.viewport)}}else B.length>0&&Zo(H,B,E,O),te&&Fe.render(E),Jo(m,E,O);w!==null&&(C.updateMultisampleRenderTarget(w),C.updateRenderTargetMipmap(w)),E.isScene===!0&&E.onAfterRender(x,E,O),dt.resetDefaultState(),S=-1,b=null,M.pop(),M.length>0?(d=M[M.length-1],oe===!0&&le.setGlobalState(x.clippingPlanes,d.state.camera)):d=null,v.pop(),v.length>0?m=v[v.length-1]:m=null};function gs(E,O,V,H){if(E.visible===!1)return;if(E.layers.test(O.layers)){if(E.isGroup)V=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(O);else if(E.isLight)d.pushLight(E),E.castShadow&&d.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||W.intersectsSprite(E)){H&&De.setFromMatrixPosition(E.matrixWorld).applyMatrix4(Pe);const _e=$.update(E),Ae=E.material;Ae.visible&&m.push(E,_e,Ae,V,De.z,null)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||W.intersectsObject(E))){const _e=$.update(E),Ae=E.material;if(H&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),De.copy(E.boundingSphere.center)):(_e.boundingSphere===null&&_e.computeBoundingSphere(),De.copy(_e.boundingSphere.center)),De.applyMatrix4(E.matrixWorld).applyMatrix4(Pe)),Array.isArray(Ae)){const Re=_e.groups;for(let ze=0,Xe=Re.length;ze<Xe;ze++){const Ce=Re[ze],et=Ae[Ce.materialIndex];et&&et.visible&&m.push(E,_e,et,V,De.z,Ce)}}else Ae.visible&&m.push(E,_e,Ae,V,De.z,null)}}const ce=E.children;for(let _e=0,Ae=ce.length;_e<Ae;_e++)gs(ce[_e],O,V,H)}function Jo(E,O,V,H){const B=E.opaque,ce=E.transmissive,_e=E.transparent;d.setupLightsView(V),oe===!0&&le.setGlobalState(x.clippingPlanes,V),H&&de.viewport(y.copy(H)),B.length>0&&ar(B,O,V),ce.length>0&&ar(ce,O,V),_e.length>0&&ar(_e,O,V),de.buffers.depth.setTest(!0),de.buffers.depth.setMask(!0),de.buffers.color.setMask(!0),de.setPolygonOffset(!1)}function Zo(E,O,V,H){if((V.isScene===!0?V.overrideMaterial:null)!==null)return;d.state.transmissionRenderTarget[H.id]===void 0&&(d.state.transmissionRenderTarget[H.id]=new qn(1,1,{generateMipmaps:!0,type:ee.has("EXT_color_buffer_half_float")||ee.has("EXT_color_buffer_float")?1016:1009,minFilter:1008,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Qe.workingColorSpace}));const ce=d.state.transmissionRenderTarget[H.id],_e=H.viewport||y;ce.setSize(_e.z,_e.w);const Ae=x.getRenderTarget();x.setRenderTarget(ce),x.getClearColor(k),j=x.getClearAlpha(),j<1&&x.setClearColor(16777215,.5),x.clear(),te&&Fe.render(V);const Re=x.toneMapping;x.toneMapping=0;const ze=H.viewport;if(H.viewport!==void 0&&(H.viewport=void 0),d.setupLightsView(H),oe===!0&&le.setGlobalState(x.clippingPlanes,H),ar(E,V,H),C.updateMultisampleRenderTarget(ce),C.updateRenderTargetMipmap(ce),ee.has("WEBGL_multisampled_render_to_texture")===!1){let Xe=!1;for(let Ce=0,et=O.length;Ce<et;Ce++){const ft=O[Ce],mt=ft.object,kt=ft.geometry,nt=ft.material,Le=ft.group;if(nt.side===2&&mt.layers.test(H.layers)){const hn=nt.side;nt.side=1,nt.needsUpdate=!0,$o(mt,V,H,kt,nt,Le),nt.side=hn,nt.needsUpdate=!0,Xe=!0}}Xe===!0&&(C.updateMultisampleRenderTarget(ce),C.updateRenderTargetMipmap(ce))}x.setRenderTarget(Ae),x.setClearColor(k,j),ze!==void 0&&(H.viewport=ze),x.toneMapping=Re}function ar(E,O,V){const H=O.isScene===!0?O.overrideMaterial:null;for(let B=0,ce=E.length;B<ce;B++){const _e=E[B],Ae=_e.object,Re=_e.geometry,ze=H===null?_e.material:H,Xe=_e.group;Ae.layers.test(V.layers)&&$o(Ae,O,V,Re,ze,Xe)}}function $o(E,O,V,H,B,ce){E.onBeforeRender(x,O,V,H,B,ce),E.modelViewMatrix.multiplyMatrices(V.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),B.onBeforeRender(x,O,V,H,E,ce),B.transparent===!0&&B.side===2&&B.forceSinglePass===!1?(B.side=1,B.needsUpdate=!0,x.renderBufferDirect(V,O,H,B,E,ce),B.side=0,B.needsUpdate=!0,x.renderBufferDirect(V,O,H,B,E,ce),B.side=2):x.renderBufferDirect(V,O,H,B,E,ce),E.onAfterRender(x,O,V,H,B,ce)}function lr(E,O,V){O.isScene!==!0&&(O=Je);const H=be.get(E),B=d.state.lights,ce=d.state.shadowsArray,_e=B.state.version,Ae=Te.getParameters(E,B.state,ce,O,V),Re=Te.getProgramCacheKey(Ae);let ze=H.programs;H.environment=E.isMeshStandardMaterial?O.environment:null,H.fog=O.fog,H.envMap=(E.isMeshStandardMaterial?G:T).get(E.envMap||H.environment),H.envMapRotation=H.environment!==null&&E.envMap===null?O.environmentRotation:E.envMapRotation,ze===void 0&&(E.addEventListener("dispose",We),ze=new Map,H.programs=ze);let Xe=ze.get(Re);if(Xe!==void 0){if(H.currentProgram===Xe&&H.lightsStateVersion===_e)return ea(E,Ae),Xe}else Ae.uniforms=Te.getUniforms(E),E.onBeforeCompile(Ae,x),Xe=Te.acquireProgram(Ae,Re),ze.set(Re,Xe),H.uniforms=Ae.uniforms;const Ce=H.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(Ce.clippingPlanes=le.uniform),ea(E,Ae),H.needsLights=Jc(E),H.lightsStateVersion=_e,H.needsLights&&(Ce.ambientLightColor.value=B.state.ambient,Ce.lightProbe.value=B.state.probe,Ce.directionalLights.value=B.state.directional,Ce.directionalLightShadows.value=B.state.directionalShadow,Ce.spotLights.value=B.state.spot,Ce.spotLightShadows.value=B.state.spotShadow,Ce.rectAreaLights.value=B.state.rectArea,Ce.ltc_1.value=B.state.rectAreaLTC1,Ce.ltc_2.value=B.state.rectAreaLTC2,Ce.pointLights.value=B.state.point,Ce.pointLightShadows.value=B.state.pointShadow,Ce.hemisphereLights.value=B.state.hemi,Ce.directionalShadowMap.value=B.state.directionalShadowMap,Ce.directionalShadowMatrix.value=B.state.directionalShadowMatrix,Ce.spotShadowMap.value=B.state.spotShadowMap,Ce.spotLightMatrix.value=B.state.spotLightMatrix,Ce.spotLightMap.value=B.state.spotLightMap,Ce.pointShadowMap.value=B.state.pointShadowMap,Ce.pointShadowMatrix.value=B.state.pointShadowMatrix),H.currentProgram=Xe,H.uniformsList=null,Xe}function Qo(E){if(E.uniformsList===null){const O=E.currentProgram.getUniforms();E.uniformsList=Hr.seqWithValue(O.seq,E.uniforms)}return E.uniformsList}function ea(E,O){const V=be.get(E);V.outputColorSpace=O.outputColorSpace,V.batching=O.batching,V.batchingColor=O.batchingColor,V.instancing=O.instancing,V.instancingColor=O.instancingColor,V.instancingMorph=O.instancingMorph,V.skinning=O.skinning,V.morphTargets=O.morphTargets,V.morphNormals=O.morphNormals,V.morphColors=O.morphColors,V.morphTargetsCount=O.morphTargetsCount,V.numClippingPlanes=O.numClippingPlanes,V.numIntersection=O.numClipIntersection,V.vertexAlphas=O.vertexAlphas,V.vertexTangents=O.vertexTangents,V.toneMapping=O.toneMapping}function jc(E,O,V,H,B){O.isScene!==!0&&(O=Je),C.resetTextureUnits();const ce=O.fog,_e=H.isMeshStandardMaterial?O.environment:null,Ae=w===null?x.outputColorSpace:w.isXRRenderTarget===!0?w.texture.colorSpace:Ai,Re=(H.isMeshStandardMaterial?G:T).get(H.envMap||_e),ze=H.vertexColors===!0&&!!V.attributes.color&&V.attributes.color.itemSize===4,Xe=!!V.attributes.tangent&&(!!H.normalMap||H.anisotropy>0),Ce=!!V.morphAttributes.position,et=!!V.morphAttributes.normal,ft=!!V.morphAttributes.color;let mt=0;H.toneMapped&&(w===null||w.isXRRenderTarget===!0)&&(mt=x.toneMapping);const kt=V.morphAttributes.position||V.morphAttributes.normal||V.morphAttributes.color,nt=kt!==void 0?kt.length:0,Le=be.get(H),hn=d.state.lights;if(oe===!0&&(se===!0||E!==b)){const Xt=E===b&&H.id===S;le.setState(H,E,Xt)}let it=!1;H.version===Le.__version?(Le.needsLights&&Le.lightsStateVersion!==hn.state.version||Le.outputColorSpace!==Ae||B.isBatchedMesh&&Le.batching===!1||!B.isBatchedMesh&&Le.batching===!0||B.isBatchedMesh&&Le.batchingColor===!0&&B.colorTexture===null||B.isBatchedMesh&&Le.batchingColor===!1&&B.colorTexture!==null||B.isInstancedMesh&&Le.instancing===!1||!B.isInstancedMesh&&Le.instancing===!0||B.isSkinnedMesh&&Le.skinning===!1||!B.isSkinnedMesh&&Le.skinning===!0||B.isInstancedMesh&&Le.instancingColor===!0&&B.instanceColor===null||B.isInstancedMesh&&Le.instancingColor===!1&&B.instanceColor!==null||B.isInstancedMesh&&Le.instancingMorph===!0&&B.morphTexture===null||B.isInstancedMesh&&Le.instancingMorph===!1&&B.morphTexture!==null||Le.envMap!==Re||H.fog===!0&&Le.fog!==ce||Le.numClippingPlanes!==void 0&&(Le.numClippingPlanes!==le.numPlanes||Le.numIntersection!==le.numIntersection)||Le.vertexAlphas!==ze||Le.vertexTangents!==Xe||Le.morphTargets!==Ce||Le.morphNormals!==et||Le.morphColors!==ft||Le.toneMapping!==mt||Le.morphTargetsCount!==nt)&&(it=!0):(it=!0,Le.__version=H.version);let Jt=Le.currentProgram;it===!0&&(Jt=lr(H,O,B));let Kn=!1,Bt=!1,Ni=!1;const gt=Jt.getUniforms(),rn=Le.uniforms;if(de.useProgram(Jt.program)&&(Kn=!0,Bt=!0,Ni=!0),H.id!==S&&(S=H.id,Bt=!0),Kn||b!==E){de.buffers.depth.getReversed()?(ae.copy(E.projectionMatrix),gh(ae),_h(ae),gt.setValue(I,"projectionMatrix",ae)):gt.setValue(I,"projectionMatrix",E.projectionMatrix),gt.setValue(I,"viewMatrix",E.matrixWorldInverse);const Mn=gt.map.cameraPosition;Mn!==void 0&&Mn.setValue(I,Oe.setFromMatrixPosition(E.matrixWorld)),ve.logarithmicDepthBuffer&&gt.setValue(I,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(H.isMeshPhongMaterial||H.isMeshToonMaterial||H.isMeshLambertMaterial||H.isMeshBasicMaterial||H.isMeshStandardMaterial||H.isShaderMaterial)&&gt.setValue(I,"isOrthographic",E.isOrthographicCamera===!0),b!==E&&(b=E,Bt=!0,Ni=!0)}if(B.isSkinnedMesh){gt.setOptional(I,B,"bindMatrix"),gt.setOptional(I,B,"bindMatrixInverse");const Xt=B.skeleton;Xt&&(Xt.boneTexture===null&&Xt.computeBoneTexture(),gt.setValue(I,"boneTexture",Xt.boneTexture,C))}B.isBatchedMesh&&(gt.setOptional(I,B,"batchingTexture"),gt.setValue(I,"batchingTexture",B._matricesTexture,C),gt.setOptional(I,B,"batchingIdTexture"),gt.setValue(I,"batchingIdTexture",B._indirectTexture,C),gt.setOptional(I,B,"batchingColorTexture"),B._colorsTexture!==null&&gt.setValue(I,"batchingColorTexture",B._colorsTexture,C));const Ui=V.morphAttributes;if((Ui.position!==void 0||Ui.normal!==void 0||Ui.color!==void 0)&&Be.update(B,V,Jt),(Bt||Le.receiveShadow!==B.receiveShadow)&&(Le.receiveShadow=B.receiveShadow,gt.setValue(I,"receiveShadow",B.receiveShadow)),H.isMeshGouraudMaterial&&H.envMap!==null&&(rn.envMap.value=Re,rn.flipEnvMap.value=Re.isCubeTexture&&Re.isRenderTargetTexture===!1?-1:1),H.isMeshStandardMaterial&&H.envMap===null&&O.environment!==null&&(rn.envMapIntensity.value=O.environmentIntensity),Bt&&(gt.setValue(I,"toneMappingExposure",x.toneMappingExposure),Le.needsLights&&Kc(rn,Ni),ce&&H.fog===!0&&pe.refreshFogUniforms(rn,ce),pe.refreshMaterialUniforms(rn,H,N,q,d.state.transmissionRenderTarget[E.id]),Hr.upload(I,Qo(Le),rn,C)),H.isShaderMaterial&&H.uniformsNeedUpdate===!0&&(Hr.upload(I,Qo(Le),rn,C),H.uniformsNeedUpdate=!1),H.isSpriteMaterial&&gt.setValue(I,"center",B.center),gt.setValue(I,"modelViewMatrix",B.modelViewMatrix),gt.setValue(I,"normalMatrix",B.normalMatrix),gt.setValue(I,"modelMatrix",B.matrixWorld),H.isShaderMaterial||H.isRawShaderMaterial){const Xt=H.uniformsGroups;for(let Mn=0,xn=Xt.length;Mn<xn;Mn++){const ta=Xt[Mn];F.update(ta,Jt),F.bind(ta,Jt)}}return Jt}function Kc(E,O){E.ambientLightColor.needsUpdate=O,E.lightProbe.needsUpdate=O,E.directionalLights.needsUpdate=O,E.directionalLightShadows.needsUpdate=O,E.pointLights.needsUpdate=O,E.pointLightShadows.needsUpdate=O,E.spotLights.needsUpdate=O,E.spotLightShadows.needsUpdate=O,E.rectAreaLights.needsUpdate=O,E.hemisphereLights.needsUpdate=O}function Jc(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return R},this.getActiveMipmapLevel=function(){return A},this.getRenderTarget=function(){return w},this.setRenderTargetTextures=function(E,O,V){be.get(E.texture).__webglTexture=O,be.get(E.depthTexture).__webglTexture=V;const H=be.get(E);H.__hasExternalTextures=!0,H.__autoAllocateDepthBuffer=V===void 0,H.__autoAllocateDepthBuffer||ee.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),H.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(E,O){const V=be.get(E);V.__webglFramebuffer=O,V.__useDefaultFramebuffer=O===void 0},this.setRenderTarget=function(E,O=0,V=0){w=E,R=O,A=V;let H=!0,B=null,ce=!1,_e=!1;if(E){const Re=be.get(E);if(Re.__useDefaultFramebuffer!==void 0)de.bindFramebuffer(I.FRAMEBUFFER,null),H=!1;else if(Re.__webglFramebuffer===void 0)C.setupRenderTarget(E);else if(Re.__hasExternalTextures)C.rebindTextures(E,be.get(E.texture).__webglTexture,be.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){const Ce=E.depthTexture;if(Re.__boundDepthTexture!==Ce){if(Ce!==null&&be.has(Ce)&&(E.width!==Ce.image.width||E.height!==Ce.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");C.setupDepthRenderbuffer(E)}}const ze=E.texture;(ze.isData3DTexture||ze.isDataArrayTexture||ze.isCompressedArrayTexture)&&(_e=!0);const Xe=be.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(Xe[O])?B=Xe[O][V]:B=Xe[O],ce=!0):E.samples>0&&C.useMultisampledRTT(E)===!1?B=be.get(E).__webglMultisampledFramebuffer:Array.isArray(Xe)?B=Xe[V]:B=Xe,y.copy(E.viewport),L.copy(E.scissor),U=E.scissorTest}else y.copy(X).multiplyScalar(N).floor(),L.copy(Q).multiplyScalar(N).floor(),U=we;if(de.bindFramebuffer(I.FRAMEBUFFER,B)&&H&&de.drawBuffers(E,B),de.viewport(y),de.scissor(L),de.setScissorTest(U),ce){const Re=be.get(E.texture);I.framebufferTexture2D(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,I.TEXTURE_CUBE_MAP_POSITIVE_X+O,Re.__webglTexture,V)}else if(_e){const Re=be.get(E.texture),ze=O||0;I.framebufferTextureLayer(I.FRAMEBUFFER,I.COLOR_ATTACHMENT0,Re.__webglTexture,V||0,ze)}S=-1},this.readRenderTargetPixels=function(E,O,V,H,B,ce,_e){if(!(E&&E.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ae=be.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&_e!==void 0&&(Ae=Ae[_e]),Ae){de.bindFramebuffer(I.FRAMEBUFFER,Ae);try{const Re=E.texture,ze=Re.format,Xe=Re.type;if(!ve.textureFormatReadable(ze)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ve.textureTypeReadable(Xe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}O>=0&&O<=E.width-H&&V>=0&&V<=E.height-B&&I.readPixels(O,V,H,B,je.convert(ze),je.convert(Xe),ce)}finally{const Re=w!==null?be.get(w).__webglFramebuffer:null;de.bindFramebuffer(I.FRAMEBUFFER,Re)}}},this.readRenderTargetPixelsAsync=async function(E,O,V,H,B,ce,_e){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ae=be.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&_e!==void 0&&(Ae=Ae[_e]),Ae){const Re=E.texture,ze=Re.format,Xe=Re.type;if(!ve.textureFormatReadable(ze))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ve.textureTypeReadable(Xe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(O>=0&&O<=E.width-H&&V>=0&&V<=E.height-B){de.bindFramebuffer(I.FRAMEBUFFER,Ae);const Ce=I.createBuffer();I.bindBuffer(I.PIXEL_PACK_BUFFER,Ce),I.bufferData(I.PIXEL_PACK_BUFFER,ce.byteLength,I.STREAM_READ),I.readPixels(O,V,H,B,je.convert(ze),je.convert(Xe),0);const et=w!==null?be.get(w).__webglFramebuffer:null;de.bindFramebuffer(I.FRAMEBUFFER,et);const ft=I.fenceSync(I.SYNC_GPU_COMMANDS_COMPLETE,0);return I.flush(),await mh(I,ft,4),I.bindBuffer(I.PIXEL_PACK_BUFFER,Ce),I.getBufferSubData(I.PIXEL_PACK_BUFFER,0,ce),I.deleteBuffer(Ce),I.deleteSync(ft),ce}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(E,O=null,V=0){E.isTexture!==!0&&(ji("WebGLRenderer: copyFramebufferToTexture function signature has changed."),O=arguments[0]||null,E=arguments[1]);const H=Math.pow(2,-V),B=Math.floor(E.image.width*H),ce=Math.floor(E.image.height*H),_e=O!==null?O.x:0,Ae=O!==null?O.y:0;C.setTexture2D(E,0),I.copyTexSubImage2D(I.TEXTURE_2D,V,0,0,_e,Ae,B,ce),de.unbindTexture()},this.copyTextureToTexture=function(E,O,V=null,H=null,B=0){E.isTexture!==!0&&(ji("WebGLRenderer: copyTextureToTexture function signature has changed."),H=arguments[0]||null,E=arguments[1],O=arguments[2],B=arguments[3]||0,V=null);let ce,_e,Ae,Re,ze,Xe,Ce,et,ft;const mt=E.isCompressedTexture?E.mipmaps[B]:E.image;V!==null?(ce=V.max.x-V.min.x,_e=V.max.y-V.min.y,Ae=V.isBox3?V.max.z-V.min.z:1,Re=V.min.x,ze=V.min.y,Xe=V.isBox3?V.min.z:0):(ce=mt.width,_e=mt.height,Ae=mt.depth||1,Re=0,ze=0,Xe=0),H!==null?(Ce=H.x,et=H.y,ft=H.z):(Ce=0,et=0,ft=0);const kt=je.convert(O.format),nt=je.convert(O.type);let Le;O.isData3DTexture?(C.setTexture3D(O,0),Le=I.TEXTURE_3D):O.isDataArrayTexture||O.isCompressedArrayTexture?(C.setTexture2DArray(O,0),Le=I.TEXTURE_2D_ARRAY):(C.setTexture2D(O,0),Le=I.TEXTURE_2D),I.pixelStorei(I.UNPACK_FLIP_Y_WEBGL,O.flipY),I.pixelStorei(I.UNPACK_PREMULTIPLY_ALPHA_WEBGL,O.premultiplyAlpha),I.pixelStorei(I.UNPACK_ALIGNMENT,O.unpackAlignment);const hn=I.getParameter(I.UNPACK_ROW_LENGTH),it=I.getParameter(I.UNPACK_IMAGE_HEIGHT),Jt=I.getParameter(I.UNPACK_SKIP_PIXELS),Kn=I.getParameter(I.UNPACK_SKIP_ROWS),Bt=I.getParameter(I.UNPACK_SKIP_IMAGES);I.pixelStorei(I.UNPACK_ROW_LENGTH,mt.width),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,mt.height),I.pixelStorei(I.UNPACK_SKIP_PIXELS,Re),I.pixelStorei(I.UNPACK_SKIP_ROWS,ze),I.pixelStorei(I.UNPACK_SKIP_IMAGES,Xe);const Ni=E.isDataArrayTexture||E.isData3DTexture,gt=O.isDataArrayTexture||O.isData3DTexture;if(E.isRenderTargetTexture||E.isDepthTexture){const rn=be.get(E),Ui=be.get(O),Xt=be.get(rn.__renderTarget),Mn=be.get(Ui.__renderTarget);de.bindFramebuffer(I.READ_FRAMEBUFFER,Xt.__webglFramebuffer),de.bindFramebuffer(I.DRAW_FRAMEBUFFER,Mn.__webglFramebuffer);for(let xn=0;xn<Ae;xn++)Ni&&I.framebufferTextureLayer(I.READ_FRAMEBUFFER,I.COLOR_ATTACHMENT0,be.get(E).__webglTexture,B,Xe+xn),E.isDepthTexture?(gt&&I.framebufferTextureLayer(I.DRAW_FRAMEBUFFER,I.COLOR_ATTACHMENT0,be.get(O).__webglTexture,B,ft+xn),I.blitFramebuffer(Re,ze,ce,_e,Ce,et,ce,_e,I.DEPTH_BUFFER_BIT,I.NEAREST)):gt?I.copyTexSubImage3D(Le,B,Ce,et,ft+xn,Re,ze,ce,_e):I.copyTexSubImage2D(Le,B,Ce,et,ft+xn,Re,ze,ce,_e);de.bindFramebuffer(I.READ_FRAMEBUFFER,null),de.bindFramebuffer(I.DRAW_FRAMEBUFFER,null)}else gt?E.isDataTexture||E.isData3DTexture?I.texSubImage3D(Le,B,Ce,et,ft,ce,_e,Ae,kt,nt,mt.data):O.isCompressedArrayTexture?I.compressedTexSubImage3D(Le,B,Ce,et,ft,ce,_e,Ae,kt,mt.data):I.texSubImage3D(Le,B,Ce,et,ft,ce,_e,Ae,kt,nt,mt):E.isDataTexture?I.texSubImage2D(I.TEXTURE_2D,B,Ce,et,ce,_e,kt,nt,mt.data):E.isCompressedTexture?I.compressedTexSubImage2D(I.TEXTURE_2D,B,Ce,et,mt.width,mt.height,kt,mt.data):I.texSubImage2D(I.TEXTURE_2D,B,Ce,et,ce,_e,kt,nt,mt);I.pixelStorei(I.UNPACK_ROW_LENGTH,hn),I.pixelStorei(I.UNPACK_IMAGE_HEIGHT,it),I.pixelStorei(I.UNPACK_SKIP_PIXELS,Jt),I.pixelStorei(I.UNPACK_SKIP_ROWS,Kn),I.pixelStorei(I.UNPACK_SKIP_IMAGES,Bt),B===0&&O.generateMipmaps&&I.generateMipmap(Le),de.unbindTexture()},this.copyTextureToTexture3D=function(E,O,V=null,H=null,B=0){return E.isTexture!==!0&&(ji("WebGLRenderer: copyTextureToTexture3D function signature has changed."),V=arguments[0]||null,H=arguments[1]||null,E=arguments[2],O=arguments[3],B=arguments[4]||0),ji('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(E,O,V,H,B)},this.initRenderTarget=function(E){be.get(E).__webglFramebuffer===void 0&&C.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?C.setTextureCube(E,0):E.isData3DTexture?C.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?C.setTexture2DArray(E,0):C.setTexture2D(E,0),de.unbindTexture()},this.resetState=function(){R=0,A=0,w=null,de.reset(),dt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return 2e3}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorspace=Qe._getDrawingBufferColorSpace(e),t.unpackColorSpace=Qe._getUnpackColorSpace()}}class rc{constructor(e,t=1,i=1e3){this.isFog=!0,this.name="",this.color=new Ie(e),this.near=t,this.far=i}clone(){return new rc(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class N_ extends bt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new nn,this.environmentIntensity=1,this.environmentRotation=new nn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Pm{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=35044,this.updateRanges=[],this.version=0,this.uuid=jt()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let r=0,s=this.stride;r<s;r++)this.array[e+r]=t.array[i+r];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=jt()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=jt()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const Ut=new P;class jr{constructor(e,t,i,r=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=i,this.normalized=r}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,i=this.data.count;t<i;t++)Ut.fromBufferAttribute(this,t),Ut.applyMatrix4(e),this.setXYZ(t,Ut.x,Ut.y,Ut.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Ut.fromBufferAttribute(this,t),Ut.applyNormalMatrix(e),this.setXYZ(t,Ut.x,Ut.y,Ut.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Ut.fromBufferAttribute(this,t),Ut.transformDirection(e),this.setXYZ(t,Ut.x,Ut.y,Ut.z);return this}getComponent(e,t){let i=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(i=en(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=at(i,this.array)),this.data.array[e*this.data.stride+this.offset+t]=i,this}setX(e,t){return this.normalized&&(t=at(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=at(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=at(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=at(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=en(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=en(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=en(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=en(t,this.array)),t}setXY(e,t,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=at(t,this.array),i=at(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this}setXYZ(e,t,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=at(t,this.array),i=at(i,this.array),r=at(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=r,this}setXYZW(e,t,i,r,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=at(t,this.array),i=at(i,this.array),r=at(r,this.array),s=at(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=r,this.data.array[e+3]=s,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return new Nt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new jr(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const r=i*this.data.stride+this.offset;for(let s=0;s<this.itemSize;s++)t.push(this.data.array[r+s])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class sc extends bn{static get type(){return"SpriteMaterial"}constructor(e){super(),this.isSpriteMaterial=!0,this.color=new Ie(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let ci;const zi=new P,hi=new P,ui=new P,di=new re,Gi=new re,oc=new Ve,Cr=new P,Vi=new P,Pr=new P,Ja=new re,Ws=new re,Za=new re;class Lm extends bt{constructor(e=new sc){if(super(),this.isSprite=!0,this.type="Sprite",ci===void 0){ci=new yt;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new Pm(t,5);ci.setIndex([0,1,2,0,2,3]),ci.setAttribute("position",new jr(i,3,0,!1)),ci.setAttribute("uv",new jr(i,2,3,!1))}this.geometry=ci,this.material=e,this.center=new re(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),hi.setFromMatrixScale(this.matrixWorld),oc.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),ui.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&hi.multiplyScalar(-ui.z);const i=this.material.rotation;let r,s;i!==0&&(s=Math.cos(i),r=Math.sin(i));const o=this.center;Lr(Cr.set(-.5,-.5,0),ui,o,hi,r,s),Lr(Vi.set(.5,-.5,0),ui,o,hi,r,s),Lr(Pr.set(.5,.5,0),ui,o,hi,r,s),Ja.set(0,0),Ws.set(1,0),Za.set(1,1);let a=e.ray.intersectTriangle(Cr,Vi,Pr,!1,zi);if(a===null&&(Lr(Vi.set(-.5,.5,0),ui,o,hi,r,s),Ws.set(0,1),a=e.ray.intersectTriangle(Cr,Pr,Vi,!1,zi),a===null))return;const l=e.ray.origin.distanceTo(zi);l<e.near||l>e.far||t.push({distance:l,point:zi.clone(),uv:qt.getInterpolation(zi,Cr,Vi,Pr,Ja,Ws,Za,new re),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function Lr(n,e,t,i,r,s){di.subVectors(n,t).addScalar(.5).multiply(i),r!==void 0?(Gi.x=s*di.x-r*di.y,Gi.y=r*di.x+s*di.y):Gi.copy(di),n.copy(e),n.x+=Gi.x,n.y+=Gi.y,n.applyMatrix4(oc)}const $a=new P,Qa=new tt,el=new tt,Im=new P,tl=new Ve,Ir=new P,Xs=new vn,nl=new Ve,Ys=new sr;class Wr extends ut{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=na,this.bindMatrix=new Ve,this.bindMatrixInverse=new Ve,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new In),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let i=0;i<t.count;i++)this.getVertexPosition(i,Ir),this.boundingBox.expandByPoint(Ir)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new vn),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let i=0;i<t.count;i++)this.getVertexPosition(i,Ir),this.boundingSphere.expandByPoint(Ir)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const i=this.material,r=this.matrixWorld;i!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Xs.copy(this.boundingSphere),Xs.applyMatrix4(r),e.ray.intersectsSphere(Xs)!==!1&&(nl.copy(r).invert(),Ys.copy(e.ray).applyMatrix4(nl),!(this.boundingBox!==null&&Ys.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Ys)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new tt,t=this.geometry.attributes.skinWeight;for(let i=0,r=t.count;i<r;i++){e.fromBufferAttribute(t,i);const s=1/e.manhattanLength();s!==1/0?e.multiplyScalar(s):e.set(1,0,0,0),t.setXYZW(i,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===na?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===Zc?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const i=this.skeleton,r=this.geometry;Qa.fromBufferAttribute(r.attributes.skinIndex,e),el.fromBufferAttribute(r.attributes.skinWeight,e),$a.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let s=0;s<4;s++){const o=el.getComponent(s);if(o!==0){const a=Qa.getComponent(s);tl.multiplyMatrices(i.bones[a].matrixWorld,i.boneInverses[a]),t.addScaledVector(Im.copy($a).applyMatrix4(tl),o)}}return t.applyMatrix4(this.bindMatrixInverse)}}class ac extends bt{constructor(){super(),this.isBone=!0,this.type="Bone"}}class as extends Ct{constructor(e=null,t=1,i=1,r,s,o,a,l,c=1003,h=1003,u,p){super(null,o,a,l,c,h,r,s,u,p),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const il=new Ve,Dm=new Ve;class Do{constructor(e=[],t=[]){this.uuid=jt(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let i=0,r=this.bones.length;i<r;i++)this.boneInverses.push(new Ve)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const i=new Ve;this.bones[e]&&i.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(i)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const i=this.bones[e];i&&i.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const i=this.bones[e];i&&(i.parent&&i.parent.isBone?(i.matrix.copy(i.parent.matrixWorld).invert(),i.matrix.multiply(i.matrixWorld)):i.matrix.copy(i.matrixWorld),i.matrix.decompose(i.position,i.quaternion,i.scale))}}update(){const e=this.bones,t=this.boneInverses,i=this.boneMatrices,r=this.boneTexture;for(let s=0,o=e.length;s<o;s++){const a=e[s]?e[s].matrixWorld:Dm;il.multiplyMatrices(a,t[s]),il.toArray(i,s*16)}r!==null&&(r.needsUpdate=!0)}clone(){return new Do(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const i=new as(t,e,e,1023,1015);return i.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=i,this}getBoneByName(e){for(let t=0,i=this.bones.length;t<i;t++){const r=this.bones[t];if(r.name===e)return r}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let i=0,r=e.bones.length;i<r;i++){const s=e.bones[i];let o=t[s];o===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",s),o=new ac),this.bones.push(o),this.boneInverses.push(new Ve().fromArray(e.boneInverses[i]))}return this.init(),this}toJSON(){const e={metadata:{version:4.6,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,i=this.boneInverses;for(let r=0,s=t.length;r<s;r++){const o=t[r];e.bones.push(o.uuid);const a=i[r];e.boneInverses.push(a.toArray())}return e}}class rl extends Nt{constructor(e,t,i,r=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=r}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const fi=new Ve,sl=new Ve,Dr=[],ol=new In,Nm=new Ve,Hi=new ut,Wi=new vn;class U_ extends ut{constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new rl(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let r=0;r<i;r++)this.setMatrixAt(r,Nm)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new In),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,fi),ol.copy(e.boundingBox).applyMatrix4(fi),this.boundingBox.union(ol)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new vn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,fi),Wi.copy(e.boundingSphere).applyMatrix4(fi),this.boundingSphere.union(Wi)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const i=t.morphTargetInfluences,r=this.morphTexture.source.data.data,s=i.length+1,o=e*s+1;for(let a=0;a<i.length;a++)i[a]=r[o+a]}raycast(e,t){const i=this.matrixWorld,r=this.count;if(Hi.geometry=this.geometry,Hi.material=this.material,Hi.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Wi.copy(this.boundingSphere),Wi.applyMatrix4(i),e.ray.intersectsSphere(Wi)!==!1))for(let s=0;s<r;s++){this.getMatrixAt(s,fi),sl.multiplyMatrices(i,fi),Hi.matrixWorld=sl,Hi.raycast(e,Dr);for(let o=0,a=Dr.length;o<a;o++){const l=Dr[o];l.instanceId=s,l.object=this,t.push(l)}Dr.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new rl(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const i=t.morphTargetInfluences,r=i.length+1;this.morphTexture===null&&(this.morphTexture=new as(new Float32Array(r*this.count),r,this.count,1028,1015));const s=this.morphTexture.source.data.data;let o=0;for(let c=0;c<i.length;c++)o+=i[c];const a=this.geometry.morphTargetsRelative?1:1-o,l=r*e;s[l]=a,s.set(i,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class Um extends bn{static get type(){return"LineBasicMaterial"}constructor(e){super(),this.isLineBasicMaterial=!0,this.color=new Ie(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const Kr=new P,Jr=new P,al=new Ve,Xi=new sr,Nr=new vn,qs=new P,ll=new P;class lc extends bt{constructor(e=new yt,t=new Um){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[0];for(let r=1,s=t.count;r<s;r++)Kr.fromBufferAttribute(t,r-1),Jr.fromBufferAttribute(t,r),i[r]=i[r-1],i[r]+=Kr.distanceTo(Jr);e.setAttribute("lineDistance",new qe(i,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const i=this.geometry,r=this.matrixWorld,s=e.params.Line.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Nr.copy(i.boundingSphere),Nr.applyMatrix4(r),Nr.radius+=s,e.ray.intersectsSphere(Nr)===!1)return;al.copy(r).invert(),Xi.copy(e.ray).applyMatrix4(al);const a=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,h=i.index,p=i.attributes.position;if(h!==null){const f=Math.max(0,o.start),g=Math.min(h.count,o.start+o.count);for(let _=f,m=g-1;_<m;_+=c){const d=h.getX(_),v=h.getX(_+1),M=Ur(this,e,Xi,l,d,v);M&&t.push(M)}if(this.isLineLoop){const _=h.getX(g-1),m=h.getX(f),d=Ur(this,e,Xi,l,_,m);d&&t.push(d)}}else{const f=Math.max(0,o.start),g=Math.min(p.count,o.start+o.count);for(let _=f,m=g-1;_<m;_+=c){const d=Ur(this,e,Xi,l,_,_+1);d&&t.push(d)}if(this.isLineLoop){const _=Ur(this,e,Xi,l,g-1,f);_&&t.push(_)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const r=t[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}}function Ur(n,e,t,i,r,s){const o=n.geometry.attributes.position;if(Kr.fromBufferAttribute(o,r),Jr.fromBufferAttribute(o,s),t.distanceSqToSegment(Kr,Jr,qs,ll)>i)return;qs.applyMatrix4(n.matrixWorld);const l=e.ray.origin.distanceTo(qs);if(!(l<e.near||l>e.far))return{distance:l,point:ll.clone().applyMatrix4(n.matrixWorld),index:r,face:null,faceIndex:null,barycoord:null,object:n}}const cl=new P,hl=new P;class F_ extends lc{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[];for(let r=0,s=t.count;r<s;r+=2)cl.fromBufferAttribute(t,r),hl.fromBufferAttribute(t,r+1),i[r]=r===0?0:i[r-1],i[r+1]=i[r]+cl.distanceTo(hl);e.setAttribute("lineDistance",new qe(i,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class k_ extends lc{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class cc extends bn{static get type(){return"PointsMaterial"}constructor(e){super(),this.isPointsMaterial=!0,this.color=new Ie(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const ul=new Ve,co=new sr,Fr=new vn,kr=new P;class Fm extends bt{constructor(e=new yt,t=new cc){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const i=this.geometry,r=this.matrixWorld,s=e.params.Points.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Fr.copy(i.boundingSphere),Fr.applyMatrix4(r),Fr.radius+=s,e.ray.intersectsSphere(Fr)===!1)return;ul.copy(r).invert(),co.copy(e.ray).applyMatrix4(ul);const a=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=i.index,u=i.attributes.position;if(c!==null){const p=Math.max(0,o.start),f=Math.min(c.count,o.start+o.count);for(let g=p,_=f;g<_;g++){const m=c.getX(g);kr.fromBufferAttribute(u,m),dl(kr,m,l,r,e,t,this)}}else{const p=Math.max(0,o.start),f=Math.min(u.count,o.start+o.count);for(let g=p,_=f;g<_;g++)kr.fromBufferAttribute(u,g),dl(kr,g,l,r,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const r=t[i[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}}function dl(n,e,t,i,r,s,o){const a=co.distanceSqToPoint(n);if(a<t){const l=new P;co.closestPointToPoint(n,l),l.applyMatrix4(i);const c=r.ray.origin.distanceTo(l);if(c<r.near||c>r.far)return;s.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}class O_ extends Ct{constructor(e,t,i,r,s,o,a,l,c){super(e,t,i,r,s,o,a,l,c),this.isVideoTexture=!0,this.minFilter=o!==void 0?o:1006,this.magFilter=s!==void 0?s:1006,this.generateMipmaps=!1;const h=this;function u(){h.needsUpdate=!0,e.requestVideoFrameCallback(u)}"requestVideoFrameCallback"in e&&e.requestVideoFrameCallback(u)}clone(){return new this.constructor(this.image).copy(this)}update(){const e=this.image;"requestVideoFrameCallback"in e===!1&&e.readyState>=e.HAVE_CURRENT_DATA&&(this.needsUpdate=!0)}}class km extends Ct{constructor(e,t,i,r,s,o,a,l,c){super(e,t,i,r,s,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class an{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){const i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){const t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){const t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let i,r=this.getPoint(0),s=0;t.push(0);for(let o=1;o<=e;o++)i=this.getPoint(o/e),s+=i.distanceTo(r),t.push(s),r=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){const i=this.getLengths();let r=0;const s=i.length;let o;t?o=t:o=e*i[s-1];let a=0,l=s-1,c;for(;a<=l;)if(r=Math.floor(a+(l-a)/2),c=i[r]-o,c<0)a=r+1;else if(c>0)l=r-1;else{l=r;break}if(r=l,i[r]===o)return r/(s-1);const h=i[r],p=i[r+1]-h,f=(o-h)/p;return(r+f)/(s-1)}getTangent(e,t){let r=e-1e-4,s=e+1e-4;r<0&&(r=0),s>1&&(s=1);const o=this.getPoint(r),a=this.getPoint(s),l=t||(o.isVector2?new re:new P);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){const i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t){const i=new P,r=[],s=[],o=[],a=new P,l=new Ve;for(let f=0;f<=e;f++){const g=f/e;r[f]=this.getTangentAt(g,new P)}s[0]=new P,o[0]=new P;let c=Number.MAX_VALUE;const h=Math.abs(r[0].x),u=Math.abs(r[0].y),p=Math.abs(r[0].z);h<=c&&(c=h,i.set(1,0,0)),u<=c&&(c=u,i.set(0,1,0)),p<=c&&i.set(0,0,1),a.crossVectors(r[0],i).normalize(),s[0].crossVectors(r[0],a),o[0].crossVectors(r[0],s[0]);for(let f=1;f<=e;f++){if(s[f]=s[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(r[f-1],r[f]),a.length()>Number.EPSILON){a.normalize();const g=Math.acos(Tt(r[f-1].dot(r[f]),-1,1));s[f].applyMatrix4(l.makeRotationAxis(a,g))}o[f].crossVectors(r[f],s[f])}if(t===!0){let f=Math.acos(Tt(s[0].dot(s[e]),-1,1));f/=e,r[0].dot(a.crossVectors(s[0],s[e]))>0&&(f=-f);for(let g=1;g<=e;g++)s[g].applyMatrix4(l.makeRotationAxis(r[g],f*g)),o[g].crossVectors(r[g],s[g])}return{tangents:r,normals:s,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class No extends an{constructor(e=0,t=0,i=1,r=1,s=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=r,this.aStartAngle=s,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t=new re){const i=t,r=Math.PI*2;let s=this.aEndAngle-this.aStartAngle;const o=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=r;for(;s>r;)s-=r;s<Number.EPSILON&&(o?s=0:s=r),this.aClockwise===!0&&!o&&(s===r?s=-r:s=s-r);const a=this.aStartAngle+e*s;let l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){const h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),p=l-this.aX,f=c-this.aY;l=p*h-f*u+this.aX,c=p*u+f*h+this.aY}return i.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class Om extends No{constructor(e,t,i,r,s,o){super(e,t,i,i,r,s,o),this.isArcCurve=!0,this.type="ArcCurve"}}function Uo(){let n=0,e=0,t=0,i=0;function r(s,o,a,l){n=s,e=a,t=-3*s+3*o-2*a-l,i=2*s-2*o+a+l}return{initCatmullRom:function(s,o,a,l,c){r(o,a,c*(a-s),c*(l-o))},initNonuniformCatmullRom:function(s,o,a,l,c,h,u){let p=(o-s)/c-(a-s)/(c+h)+(a-o)/h,f=(a-o)/h-(l-o)/(h+u)+(l-a)/u;p*=h,f*=h,r(o,a,p,f)},calc:function(s){const o=s*s,a=o*s;return n+e*s+t*o+i*a}}}const Or=new P,js=new Uo,Ks=new Uo,Js=new Uo;class Bm extends an{constructor(e=[],t=!1,i="centripetal",r=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=r}getPoint(e,t=new P){const i=t,r=this.points,s=r.length,o=(s-(this.closed?0:1))*e;let a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/s)+1)*s:l===0&&a===s-1&&(a=s-2,l=1);let c,h;this.closed||a>0?c=r[(a-1)%s]:(Or.subVectors(r[0],r[1]).add(r[0]),c=Or);const u=r[a%s],p=r[(a+1)%s];if(this.closed||a+2<s?h=r[(a+2)%s]:(Or.subVectors(r[s-1],r[s-2]).add(r[s-1]),h=Or),this.curveType==="centripetal"||this.curveType==="chordal"){const f=this.curveType==="chordal"?.5:.25;let g=Math.pow(c.distanceToSquared(u),f),_=Math.pow(u.distanceToSquared(p),f),m=Math.pow(p.distanceToSquared(h),f);_<1e-4&&(_=1),g<1e-4&&(g=_),m<1e-4&&(m=_),js.initNonuniformCatmullRom(c.x,u.x,p.x,h.x,g,_,m),Ks.initNonuniformCatmullRom(c.y,u.y,p.y,h.y,g,_,m),Js.initNonuniformCatmullRom(c.z,u.z,p.z,h.z,g,_,m)}else this.curveType==="catmullrom"&&(js.initCatmullRom(c.x,u.x,p.x,h.x,this.tension),Ks.initCatmullRom(c.y,u.y,p.y,h.y,this.tension),Js.initCatmullRom(c.z,u.z,p.z,h.z,this.tension));return i.set(js.calc(l),Ks.calc(l),Js.calc(l)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const r=e.points[t];this.points.push(r.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){const r=this.points[t];e.points.push(r.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const r=e.points[t];this.points.push(new P().fromArray(r))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function fl(n,e,t,i,r){const s=(i-e)*.5,o=(r-t)*.5,a=n*n,l=n*a;return(2*t-2*i+s+o)*l+(-3*t+3*i-2*s-o)*a+s*n+t}function zm(n,e){const t=1-n;return t*t*e}function Gm(n,e){return 2*(1-n)*n*e}function Vm(n,e){return n*n*e}function $i(n,e,t,i){return zm(n,e)+Gm(n,t)+Vm(n,i)}function Hm(n,e){const t=1-n;return t*t*t*e}function Wm(n,e){const t=1-n;return 3*t*t*n*e}function Xm(n,e){return 3*(1-n)*n*n*e}function Ym(n,e){return n*n*n*e}function Qi(n,e,t,i,r){return Hm(n,e)+Wm(n,t)+Xm(n,i)+Ym(n,r)}class hc extends an{constructor(e=new re,t=new re,i=new re,r=new re){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=r}getPoint(e,t=new re){const i=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return i.set(Qi(e,r.x,s.x,o.x,a.x),Qi(e,r.y,s.y,o.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class qm extends an{constructor(e=new P,t=new P,i=new P,r=new P){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=r}getPoint(e,t=new P){const i=t,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return i.set(Qi(e,r.x,s.x,o.x,a.x),Qi(e,r.y,s.y,o.y,a.y),Qi(e,r.z,s.z,o.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class uc extends an{constructor(e=new re,t=new re){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new re){const i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new re){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class jm extends an{constructor(e=new P,t=new P){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new P){const i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new P){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class dc extends an{constructor(e=new re,t=new re,i=new re){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new re){const i=t,r=this.v0,s=this.v1,o=this.v2;return i.set($i(e,r.x,s.x,o.x),$i(e,r.y,s.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class fc extends an{constructor(e=new P,t=new P,i=new P){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new P){const i=t,r=this.v0,s=this.v1,o=this.v2;return i.set($i(e,r.x,s.x,o.x),$i(e,r.y,s.y,o.y),$i(e,r.z,s.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class pc extends an{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new re){const i=t,r=this.points,s=(r.length-1)*e,o=Math.floor(s),a=s-o,l=r[o===0?o:o-1],c=r[o],h=r[o>r.length-2?r.length-1:o+1],u=r[o>r.length-3?r.length-1:o+2];return i.set(fl(a,l.x,c.x,h.x,u.x),fl(a,l.y,c.y,h.y,u.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const r=e.points[t];this.points.push(r.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){const r=this.points[t];e.points.push(r.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const r=e.points[t];this.points.push(new re().fromArray(r))}return this}}var Zr=Object.freeze({__proto__:null,ArcCurve:Om,CatmullRomCurve3:Bm,CubicBezierCurve:hc,CubicBezierCurve3:qm,EllipseCurve:No,LineCurve:uc,LineCurve3:jm,QuadraticBezierCurve:dc,QuadraticBezierCurve3:fc,SplineCurve:pc});class Km extends an{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){const i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Zr[i](t,e))}return this}getPoint(e,t){const i=e*this.getLength(),r=this.getCurveLengths();let s=0;for(;s<r.length;){if(r[s]>=i){const o=r[s]-i,a=this.curves[s],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}s++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let i=0,r=this.curves.length;i<r;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let i;for(let r=0,s=this.curves;r<s.length;r++){const o=s[r],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){const h=l[c];i&&i.equals(h)||(t.push(h),i=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){const r=e.curves[t];this.curves.push(r.clone())}return this.autoClose=e.autoClose,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){const r=this.curves[t];e.curves.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){const r=e.curves[t];this.curves.push(new Zr[r.type]().fromJSON(r))}return this}}class ho extends Km{constructor(e){super(),this.type="Path",this.currentPoint=new re,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const i=new uc(this.currentPoint.clone(),new re(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,r){const s=new dc(this.currentPoint.clone(),new re(e,t),new re(i,r));return this.curves.push(s),this.currentPoint.set(i,r),this}bezierCurveTo(e,t,i,r,s,o){const a=new hc(this.currentPoint.clone(),new re(e,t),new re(i,r),new re(s,o));return this.curves.push(a),this.currentPoint.set(s,o),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),i=new pc(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,r,s,o){const a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,i,r,s,o),this}absarc(e,t,i,r,s,o){return this.absellipse(e,t,i,i,r,s,o),this}ellipse(e,t,i,r,s,o,a,l){const c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+c,t+h,i,r,s,o,a,l),this}absellipse(e,t,i,r,s,o,a,l){const c=new No(e,t,i,r,s,o,a,l);if(this.curves.length>0){const u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);const h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class Ti extends yt{constructor(e=[new re(0,-.5),new re(.5,0),new re(0,.5)],t=12,i=0,r=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:i,phiLength:r},t=Math.floor(t),r=Tt(r,0,Math.PI*2);const s=[],o=[],a=[],l=[],c=[],h=1/t,u=new P,p=new re,f=new P,g=new P,_=new P;let m=0,d=0;for(let v=0;v<=e.length-1;v++)switch(v){case 0:m=e[v+1].x-e[v].x,d=e[v+1].y-e[v].y,f.x=d*1,f.y=-m,f.z=d*0,_.copy(f),f.normalize(),l.push(f.x,f.y,f.z);break;case e.length-1:l.push(_.x,_.y,_.z);break;default:m=e[v+1].x-e[v].x,d=e[v+1].y-e[v].y,f.x=d*1,f.y=-m,f.z=d*0,g.copy(f),f.x+=_.x,f.y+=_.y,f.z+=_.z,f.normalize(),l.push(f.x,f.y,f.z),_.copy(g)}for(let v=0;v<=t;v++){const M=i+v*h*r,x=Math.sin(M),D=Math.cos(M);for(let R=0;R<=e.length-1;R++){u.x=e[R].x*x,u.y=e[R].y,u.z=e[R].x*D,o.push(u.x,u.y,u.z),p.x=v/t,p.y=R/(e.length-1),a.push(p.x,p.y);const A=l[3*R+0]*x,w=l[3*R+1],S=l[3*R+0]*D;c.push(A,w,S)}}for(let v=0;v<t;v++)for(let M=0;M<e.length-1;M++){const x=M+v*e.length,D=x,R=x+e.length,A=x+e.length+1,w=x+1;s.push(D,R,w),s.push(A,w,R)}this.setIndex(s),this.setAttribute("position",new qe(o,3)),this.setAttribute("uv",new qe(a,2)),this.setAttribute("normal",new qe(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ti(e.points,e.segments,e.phiStart,e.phiLength)}}class Fo extends Ti{constructor(e=1,t=1,i=4,r=8){const s=new ho;s.absarc(0,-t/2,e,Math.PI*1.5,0),s.absarc(0,t/2,e,0,Math.PI*.5),super(s.getPoints(i),r),this.type="CapsuleGeometry",this.parameters={radius:e,length:t,capSegments:i,radialSegments:r}}static fromJSON(e){return new Fo(e.radius,e.length,e.capSegments,e.radialSegments)}}class ls extends yt{constructor(e=1,t=32,i=0,r=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:i,thetaLength:r},t=Math.max(3,t);const s=[],o=[],a=[],l=[],c=new P,h=new re;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let u=0,p=3;u<=t;u++,p+=3){const f=i+u/t*r;c.x=e*Math.cos(f),c.y=e*Math.sin(f),o.push(c.x,c.y,c.z),a.push(0,0,1),h.x=(o[p]/e+1)/2,h.y=(o[p+1]/e+1)/2,l.push(h.x,h.y)}for(let u=1;u<=t;u++)s.push(u,u+1,0);this.setIndex(s),this.setAttribute("position",new qe(o,3)),this.setAttribute("normal",new qe(a,3)),this.setAttribute("uv",new qe(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ls(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class Ke extends yt{constructor(e=1,t=1,i=1,r=32,s=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:r,heightSegments:s,openEnded:o,thetaStart:a,thetaLength:l};const c=this;r=Math.floor(r),s=Math.floor(s);const h=[],u=[],p=[],f=[];let g=0;const _=[],m=i/2;let d=0;v(),o===!1&&(e>0&&M(!0),t>0&&M(!1)),this.setIndex(h),this.setAttribute("position",new qe(u,3)),this.setAttribute("normal",new qe(p,3)),this.setAttribute("uv",new qe(f,2));function v(){const x=new P,D=new P;let R=0;const A=(t-e)/i;for(let w=0;w<=s;w++){const S=[],b=w/s,y=b*(t-e)+e;for(let L=0;L<=r;L++){const U=L/r,k=U*l+a,j=Math.sin(k),z=Math.cos(k);D.x=y*j,D.y=-b*i+m,D.z=y*z,u.push(D.x,D.y,D.z),x.set(j,A,z).normalize(),p.push(x.x,x.y,x.z),f.push(U,1-b),S.push(g++)}_.push(S)}for(let w=0;w<r;w++)for(let S=0;S<s;S++){const b=_[S][w],y=_[S+1][w],L=_[S+1][w+1],U=_[S][w+1];(e>0||S!==0)&&(h.push(b,y,U),R+=3),(t>0||S!==s-1)&&(h.push(y,L,U),R+=3)}c.addGroup(d,R,0),d+=R}function M(x){const D=g,R=new re,A=new P;let w=0;const S=x===!0?e:t,b=x===!0?1:-1;for(let L=1;L<=r;L++)u.push(0,m*b,0),p.push(0,b,0),f.push(.5,.5),g++;const y=g;for(let L=0;L<=r;L++){const k=L/r*l+a,j=Math.cos(k),z=Math.sin(k);A.x=S*z,A.y=m*b,A.z=S*j,u.push(A.x,A.y,A.z),p.push(0,b,0),R.x=j*.5+.5,R.y=z*.5*b+.5,f.push(R.x,R.y),g++}for(let L=0;L<r;L++){const U=D+L,k=y+L;x===!0?h.push(k,k+1,U):h.push(k+1,k,U),w+=3}c.addGroup(d,w,x===!0?1:2),d+=w}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ke(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class vi extends Ke{constructor(e=1,t=1,i=32,r=1,s=!1,o=0,a=Math.PI*2){super(0,e,t,i,r,s,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:r,openEnded:s,thetaStart:o,thetaLength:a}}static fromJSON(e){return new vi(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class ko extends yt{constructor(e=[],t=[],i=1,r=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:i,detail:r};const s=[],o=[];a(r),c(i),h(),this.setAttribute("position",new qe(s,3)),this.setAttribute("normal",new qe(s.slice(),3)),this.setAttribute("uv",new qe(o,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function a(v){const M=new P,x=new P,D=new P;for(let R=0;R<t.length;R+=3)f(t[R+0],M),f(t[R+1],x),f(t[R+2],D),l(M,x,D,v)}function l(v,M,x,D){const R=D+1,A=[];for(let w=0;w<=R;w++){A[w]=[];const S=v.clone().lerp(x,w/R),b=M.clone().lerp(x,w/R),y=R-w;for(let L=0;L<=y;L++)L===0&&w===R?A[w][L]=S:A[w][L]=S.clone().lerp(b,L/y)}for(let w=0;w<R;w++)for(let S=0;S<2*(R-w)-1;S++){const b=Math.floor(S/2);S%2===0?(p(A[w][b+1]),p(A[w+1][b]),p(A[w][b])):(p(A[w][b+1]),p(A[w+1][b+1]),p(A[w+1][b]))}}function c(v){const M=new P;for(let x=0;x<s.length;x+=3)M.x=s[x+0],M.y=s[x+1],M.z=s[x+2],M.normalize().multiplyScalar(v),s[x+0]=M.x,s[x+1]=M.y,s[x+2]=M.z}function h(){const v=new P;for(let M=0;M<s.length;M+=3){v.x=s[M+0],v.y=s[M+1],v.z=s[M+2];const x=m(v)/2/Math.PI+.5,D=d(v)/Math.PI+.5;o.push(x,1-D)}g(),u()}function u(){for(let v=0;v<o.length;v+=6){const M=o[v+0],x=o[v+2],D=o[v+4],R=Math.max(M,x,D),A=Math.min(M,x,D);R>.9&&A<.1&&(M<.2&&(o[v+0]+=1),x<.2&&(o[v+2]+=1),D<.2&&(o[v+4]+=1))}}function p(v){s.push(v.x,v.y,v.z)}function f(v,M){const x=v*3;M.x=e[x+0],M.y=e[x+1],M.z=e[x+2]}function g(){const v=new P,M=new P,x=new P,D=new P,R=new re,A=new re,w=new re;for(let S=0,b=0;S<s.length;S+=9,b+=6){v.set(s[S+0],s[S+1],s[S+2]),M.set(s[S+3],s[S+4],s[S+5]),x.set(s[S+6],s[S+7],s[S+8]),R.set(o[b+0],o[b+1]),A.set(o[b+2],o[b+3]),w.set(o[b+4],o[b+5]),D.copy(v).add(M).add(x).divideScalar(3);const y=m(D);_(R,b+0,v,y),_(A,b+2,M,y),_(w,b+4,x,y)}}function _(v,M,x,D){D<0&&v.x===1&&(o[M]=v.x-1),x.x===0&&x.z===0&&(o[M]=D/2/Math.PI+.5)}function m(v){return Math.atan2(v.z,-v.x)}function d(v){return Math.atan2(-v.y,Math.sqrt(v.x*v.x+v.z*v.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ko(e.vertices,e.indices,e.radius,e.details)}}class Oo extends ho{constructor(e){super(e),this.uuid=jt(),this.type="Shape",this.holes=[]}getPointsHoles(e){const t=[];for(let i=0,r=this.holes.length;i<r;i++)t[i]=this.holes[i].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){const r=e.holes[t];this.holes.push(r.clone())}return this}toJSON(){const e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,i=this.holes.length;t<i;t++){const r=this.holes[t];e.holes.push(r.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){const r=e.holes[t];this.holes.push(new ho().fromJSON(r))}return this}}const Jm={triangulate:function(n,e,t=2){const i=e&&e.length,r=i?e[0]*t:n.length;let s=mc(n,0,r,t,!0);const o=[];if(!s||s.next===s.prev)return o;let a,l,c,h,u,p,f;if(i&&(s=t0(n,e,s,t)),n.length>80*t){a=c=n[0],l=h=n[1];for(let g=t;g<r;g+=t)u=n[g],p=n[g+1],u<a&&(a=u),p<l&&(l=p),u>c&&(c=u),p>h&&(h=p);f=Math.max(c-a,h-l),f=f!==0?32767/f:0}return nr(s,o,t,a,l,f,0),o}};function mc(n,e,t,i,r){let s,o;if(r===d0(n,e,t,i)>0)for(s=e;s<t;s+=i)o=pl(s,n[s],n[s+1],o);else for(s=t-i;s>=e;s-=i)o=pl(s,n[s],n[s+1],o);return o&&cs(o,o.next)&&(rr(o),o=o.next),o}function jn(n,e){if(!n)return n;e||(e=n);let t=n,i;do if(i=!1,!t.steiner&&(cs(t,t.next)||vt(t.prev,t,t.next)===0)){if(rr(t),t=e=t.prev,t===t.next)break;i=!0}else t=t.next;while(i||t!==e);return e}function nr(n,e,t,i,r,s,o){if(!n)return;!o&&s&&o0(n,i,r,s);let a=n,l,c;for(;n.prev!==n.next;){if(l=n.prev,c=n.next,s?$m(n,i,r,s):Zm(n)){e.push(l.i/t|0),e.push(n.i/t|0),e.push(c.i/t|0),rr(n),n=c.next,a=c.next;continue}if(n=c,n===a){o?o===1?(n=Qm(jn(n),e,t),nr(n,e,t,i,r,s,2)):o===2&&e0(n,e,t,i,r,s):nr(jn(n),e,t,i,r,s,1);break}}}function Zm(n){const e=n.prev,t=n,i=n.next;if(vt(e,t,i)>=0)return!1;const r=e.x,s=t.x,o=i.x,a=e.y,l=t.y,c=i.y,h=r<s?r<o?r:o:s<o?s:o,u=a<l?a<c?a:c:l<c?l:c,p=r>s?r>o?r:o:s>o?s:o,f=a>l?a>c?a:c:l>c?l:c;let g=i.next;for(;g!==e;){if(g.x>=h&&g.x<=p&&g.y>=u&&g.y<=f&&gi(r,a,s,l,o,c,g.x,g.y)&&vt(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function $m(n,e,t,i){const r=n.prev,s=n,o=n.next;if(vt(r,s,o)>=0)return!1;const a=r.x,l=s.x,c=o.x,h=r.y,u=s.y,p=o.y,f=a<l?a<c?a:c:l<c?l:c,g=h<u?h<p?h:p:u<p?u:p,_=a>l?a>c?a:c:l>c?l:c,m=h>u?h>p?h:p:u>p?u:p,d=uo(f,g,e,t,i),v=uo(_,m,e,t,i);let M=n.prevZ,x=n.nextZ;for(;M&&M.z>=d&&x&&x.z<=v;){if(M.x>=f&&M.x<=_&&M.y>=g&&M.y<=m&&M!==r&&M!==o&&gi(a,h,l,u,c,p,M.x,M.y)&&vt(M.prev,M,M.next)>=0||(M=M.prevZ,x.x>=f&&x.x<=_&&x.y>=g&&x.y<=m&&x!==r&&x!==o&&gi(a,h,l,u,c,p,x.x,x.y)&&vt(x.prev,x,x.next)>=0))return!1;x=x.nextZ}for(;M&&M.z>=d;){if(M.x>=f&&M.x<=_&&M.y>=g&&M.y<=m&&M!==r&&M!==o&&gi(a,h,l,u,c,p,M.x,M.y)&&vt(M.prev,M,M.next)>=0)return!1;M=M.prevZ}for(;x&&x.z<=v;){if(x.x>=f&&x.x<=_&&x.y>=g&&x.y<=m&&x!==r&&x!==o&&gi(a,h,l,u,c,p,x.x,x.y)&&vt(x.prev,x,x.next)>=0)return!1;x=x.nextZ}return!0}function Qm(n,e,t){let i=n;do{const r=i.prev,s=i.next.next;!cs(r,s)&&gc(r,i,i.next,s)&&ir(r,s)&&ir(s,r)&&(e.push(r.i/t|0),e.push(i.i/t|0),e.push(s.i/t|0),rr(i),rr(i.next),i=n=s),i=i.next}while(i!==n);return jn(i)}function e0(n,e,t,i,r,s){let o=n;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&c0(o,a)){let l=_c(o,a);o=jn(o,o.next),l=jn(l,l.next),nr(o,e,t,i,r,s,0),nr(l,e,t,i,r,s,0);return}a=a.next}o=o.next}while(o!==n)}function t0(n,e,t,i){const r=[];let s,o,a,l,c;for(s=0,o=e.length;s<o;s++)a=e[s]*i,l=s<o-1?e[s+1]*i:n.length,c=mc(n,a,l,i,!1),c===c.next&&(c.steiner=!0),r.push(l0(c));for(r.sort(n0),s=0;s<r.length;s++)t=i0(r[s],t);return t}function n0(n,e){return n.x-e.x}function i0(n,e){const t=r0(n,e);if(!t)return e;const i=_c(t,n);return jn(i,i.next),jn(t,t.next)}function r0(n,e){let t=e,i=-1/0,r;const s=n.x,o=n.y;do{if(o<=t.y&&o>=t.next.y&&t.next.y!==t.y){const p=t.x+(o-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(p<=s&&p>i&&(i=p,r=t.x<t.next.x?t:t.next,p===s))return r}t=t.next}while(t!==e);if(!r)return null;const a=r,l=r.x,c=r.y;let h=1/0,u;t=r;do s>=t.x&&t.x>=l&&s!==t.x&&gi(o<c?s:i,o,l,c,o<c?i:s,o,t.x,t.y)&&(u=Math.abs(o-t.y)/(s-t.x),ir(t,n)&&(u<h||u===h&&(t.x>r.x||t.x===r.x&&s0(r,t)))&&(r=t,h=u)),t=t.next;while(t!==a);return r}function s0(n,e){return vt(n.prev,n,e.prev)<0&&vt(e.next,n,n.next)<0}function o0(n,e,t,i){let r=n;do r.z===0&&(r.z=uo(r.x,r.y,e,t,i)),r.prevZ=r.prev,r.nextZ=r.next,r=r.next;while(r!==n);r.prevZ.nextZ=null,r.prevZ=null,a0(r)}function a0(n){let e,t,i,r,s,o,a,l,c=1;do{for(t=n,n=null,s=null,o=0;t;){for(o++,i=t,a=0,e=0;e<c&&(a++,i=i.nextZ,!!i);e++);for(l=c;a>0||l>0&&i;)a!==0&&(l===0||!i||t.z<=i.z)?(r=t,t=t.nextZ,a--):(r=i,i=i.nextZ,l--),s?s.nextZ=r:n=r,r.prevZ=s,s=r;t=i}s.nextZ=null,c*=2}while(o>1);return n}function uo(n,e,t,i,r){return n=(n-t)*r|0,e=(e-i)*r|0,n=(n|n<<8)&16711935,n=(n|n<<4)&252645135,n=(n|n<<2)&858993459,n=(n|n<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,n|e<<1}function l0(n){let e=n,t=n;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==n);return t}function gi(n,e,t,i,r,s,o,a){return(r-o)*(e-a)>=(n-o)*(s-a)&&(n-o)*(i-a)>=(t-o)*(e-a)&&(t-o)*(s-a)>=(r-o)*(i-a)}function c0(n,e){return n.next.i!==e.i&&n.prev.i!==e.i&&!h0(n,e)&&(ir(n,e)&&ir(e,n)&&u0(n,e)&&(vt(n.prev,n,e.prev)||vt(n,e.prev,e))||cs(n,e)&&vt(n.prev,n,n.next)>0&&vt(e.prev,e,e.next)>0)}function vt(n,e,t){return(e.y-n.y)*(t.x-e.x)-(e.x-n.x)*(t.y-e.y)}function cs(n,e){return n.x===e.x&&n.y===e.y}function gc(n,e,t,i){const r=zr(vt(n,e,t)),s=zr(vt(n,e,i)),o=zr(vt(t,i,n)),a=zr(vt(t,i,e));return!!(r!==s&&o!==a||r===0&&Br(n,t,e)||s===0&&Br(n,i,e)||o===0&&Br(t,n,i)||a===0&&Br(t,e,i))}function Br(n,e,t){return e.x<=Math.max(n.x,t.x)&&e.x>=Math.min(n.x,t.x)&&e.y<=Math.max(n.y,t.y)&&e.y>=Math.min(n.y,t.y)}function zr(n){return n>0?1:n<0?-1:0}function h0(n,e){let t=n;do{if(t.i!==n.i&&t.next.i!==n.i&&t.i!==e.i&&t.next.i!==e.i&&gc(t,t.next,n,e))return!0;t=t.next}while(t!==n);return!1}function ir(n,e){return vt(n.prev,n,n.next)<0?vt(n,e,n.next)>=0&&vt(n,n.prev,e)>=0:vt(n,e,n.prev)<0||vt(n,n.next,e)<0}function u0(n,e){let t=n,i=!1;const r=(n.x+e.x)/2,s=(n.y+e.y)/2;do t.y>s!=t.next.y>s&&t.next.y!==t.y&&r<(t.next.x-t.x)*(s-t.y)/(t.next.y-t.y)+t.x&&(i=!i),t=t.next;while(t!==n);return i}function _c(n,e){const t=new fo(n.i,n.x,n.y),i=new fo(e.i,e.x,e.y),r=n.next,s=e.prev;return n.next=e,e.prev=n,t.next=r,r.prev=t,i.next=t,t.prev=i,s.next=i,i.prev=s,i}function pl(n,e,t,i){const r=new fo(n,e,t);return i?(r.next=i.next,r.prev=i,i.next.prev=r,i.next=r):(r.prev=r,r.next=r),r}function rr(n){n.next.prev=n.prev,n.prev.next=n.next,n.prevZ&&(n.prevZ.nextZ=n.nextZ),n.nextZ&&(n.nextZ.prevZ=n.prevZ)}function fo(n,e,t){this.i=n,this.x=e,this.y=t,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function d0(n,e,t,i){let r=0;for(let s=e,o=t-i;s<t;s+=i)r+=(n[o]-n[s])*(n[s+1]+n[o+1]),o=s;return r}class Pn{static area(e){const t=e.length;let i=0;for(let r=t-1,s=0;s<t;r=s++)i+=e[r].x*e[s].y-e[s].x*e[r].y;return i*.5}static isClockWise(e){return Pn.area(e)<0}static triangulateShape(e,t){const i=[],r=[],s=[];ml(e),gl(i,e);let o=e.length;t.forEach(ml);for(let l=0;l<t.length;l++)r.push(o),o+=t[l].length,gl(i,t[l]);const a=Jm.triangulate(i,r);for(let l=0;l<a.length;l+=3)s.push(a.slice(l,l+3));return s}}function ml(n){const e=n.length;e>2&&n[e-1].equals(n[0])&&n.pop()}function gl(n,e){for(let t=0;t<e.length;t++)n.push(e[t].x),n.push(e[t].y)}class yc extends yt{constructor(e=new Oo([new re(.5,.5),new re(-.5,.5),new re(-.5,-.5),new re(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];const i=this,r=[],s=[];for(let a=0,l=e.length;a<l;a++){const c=e[a];o(c)}this.setAttribute("position",new qe(r,3)),this.setAttribute("uv",new qe(s,2)),this.computeVertexNormals();function o(a){const l=[],c=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,u=t.depth!==void 0?t.depth:1;let p=t.bevelEnabled!==void 0?t.bevelEnabled:!0,f=t.bevelThickness!==void 0?t.bevelThickness:.2,g=t.bevelSize!==void 0?t.bevelSize:f-.1,_=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3;const d=t.extrudePath,v=t.UVGenerator!==void 0?t.UVGenerator:f0;let M,x=!1,D,R,A,w;d&&(M=d.getSpacedPoints(h),x=!0,p=!1,D=d.computeFrenetFrames(h,!1),R=new P,A=new P,w=new P),p||(m=0,f=0,g=0,_=0);const S=a.extractPoints(c);let b=S.shape;const y=S.holes;if(!Pn.isClockWise(b)){b=b.reverse();for(let te=0,Y=y.length;te<Y;te++){const I=y[te];Pn.isClockWise(I)&&(y[te]=I.reverse())}}const U=Pn.triangulateShape(b,y),k=b;for(let te=0,Y=y.length;te<Y;te++){const I=y[te];b=b.concat(I)}function j(te,Y,I){return Y||console.error("THREE.ExtrudeGeometry: vec does not exist"),te.clone().addScaledVector(Y,I)}const z=b.length,q=U.length;function N(te,Y,I){let ue,ee,ve;const de=te.x-Y.x,Ue=te.y-Y.y,be=I.x-te.x,C=I.y-te.y,T=de*de+Ue*Ue,G=de*C-Ue*be;if(Math.abs(G)>Number.EPSILON){const Z=Math.sqrt(T),ie=Math.sqrt(be*be+C*C),$=Y.x-Ue/Z,Te=Y.y+de/Z,pe=I.x-C/ie,Me=I.y+be/ie,Ze=((pe-$)*C-(Me-Te)*be)/(de*C-Ue*be);ue=$+de*Ze-te.x,ee=Te+Ue*Ze-te.y;const le=ue*ue+ee*ee;if(le<=2)return new re(ue,ee);ve=Math.sqrt(le/2)}else{let Z=!1;de>Number.EPSILON?be>Number.EPSILON&&(Z=!0):de<-Number.EPSILON?be<-Number.EPSILON&&(Z=!0):Math.sign(Ue)===Math.sign(C)&&(Z=!0),Z?(ue=-Ue,ee=de,ve=Math.sqrt(T)):(ue=de,ee=Ue,ve=Math.sqrt(T/2))}return new re(ue/ve,ee/ve)}const K=[];for(let te=0,Y=k.length,I=Y-1,ue=te+1;te<Y;te++,I++,ue++)I===Y&&(I=0),ue===Y&&(ue=0),K[te]=N(k[te],k[I],k[ue]);const he=[];let X,Q=K.concat();for(let te=0,Y=y.length;te<Y;te++){const I=y[te];X=[];for(let ue=0,ee=I.length,ve=ee-1,de=ue+1;ue<ee;ue++,ve++,de++)ve===ee&&(ve=0),de===ee&&(de=0),X[ue]=N(I[ue],I[ve],I[de]);he.push(X),Q=Q.concat(X)}for(let te=0;te<m;te++){const Y=te/m,I=f*Math.cos(Y*Math.PI/2),ue=g*Math.sin(Y*Math.PI/2)+_;for(let ee=0,ve=k.length;ee<ve;ee++){const de=j(k[ee],K[ee],ue);ae(de.x,de.y,-I)}for(let ee=0,ve=y.length;ee<ve;ee++){const de=y[ee];X=he[ee];for(let Ue=0,be=de.length;Ue<be;Ue++){const C=j(de[Ue],X[Ue],ue);ae(C.x,C.y,-I)}}}const we=g+_;for(let te=0;te<z;te++){const Y=p?j(b[te],Q[te],we):b[te];x?(A.copy(D.normals[0]).multiplyScalar(Y.x),R.copy(D.binormals[0]).multiplyScalar(Y.y),w.copy(M[0]).add(A).add(R),ae(w.x,w.y,w.z)):ae(Y.x,Y.y,0)}for(let te=1;te<=h;te++)for(let Y=0;Y<z;Y++){const I=p?j(b[Y],Q[Y],we):b[Y];x?(A.copy(D.normals[te]).multiplyScalar(I.x),R.copy(D.binormals[te]).multiplyScalar(I.y),w.copy(M[te]).add(A).add(R),ae(w.x,w.y,w.z)):ae(I.x,I.y,u/h*te)}for(let te=m-1;te>=0;te--){const Y=te/m,I=f*Math.cos(Y*Math.PI/2),ue=g*Math.sin(Y*Math.PI/2)+_;for(let ee=0,ve=k.length;ee<ve;ee++){const de=j(k[ee],K[ee],ue);ae(de.x,de.y,u+I)}for(let ee=0,ve=y.length;ee<ve;ee++){const de=y[ee];X=he[ee];for(let Ue=0,be=de.length;Ue<be;Ue++){const C=j(de[Ue],X[Ue],ue);x?ae(C.x,C.y+M[h-1].y,M[h-1].x+I):ae(C.x,C.y,u+I)}}}W(),oe();function W(){const te=r.length/3;if(p){let Y=0,I=z*Y;for(let ue=0;ue<q;ue++){const ee=U[ue];Pe(ee[2]+I,ee[1]+I,ee[0]+I)}Y=h+m*2,I=z*Y;for(let ue=0;ue<q;ue++){const ee=U[ue];Pe(ee[0]+I,ee[1]+I,ee[2]+I)}}else{for(let Y=0;Y<q;Y++){const I=U[Y];Pe(I[2],I[1],I[0])}for(let Y=0;Y<q;Y++){const I=U[Y];Pe(I[0]+z*h,I[1]+z*h,I[2]+z*h)}}i.addGroup(te,r.length/3-te,0)}function oe(){const te=r.length/3;let Y=0;se(k,Y),Y+=k.length;for(let I=0,ue=y.length;I<ue;I++){const ee=y[I];se(ee,Y),Y+=ee.length}i.addGroup(te,r.length/3-te,1)}function se(te,Y){let I=te.length;for(;--I>=0;){const ue=I;let ee=I-1;ee<0&&(ee=te.length-1);for(let ve=0,de=h+m*2;ve<de;ve++){const Ue=z*ve,be=z*(ve+1),C=Y+ue+Ue,T=Y+ee+Ue,G=Y+ee+be,Z=Y+ue+be;Oe(C,T,G,Z)}}}function ae(te,Y,I){l.push(te),l.push(Y),l.push(I)}function Pe(te,Y,I){De(te),De(Y),De(I);const ue=r.length/3,ee=v.generateTopUV(i,r,ue-3,ue-2,ue-1);Je(ee[0]),Je(ee[1]),Je(ee[2])}function Oe(te,Y,I,ue){De(te),De(Y),De(ue),De(Y),De(I),De(ue);const ee=r.length/3,ve=v.generateSideWallUV(i,r,ee-6,ee-3,ee-2,ee-1);Je(ve[0]),Je(ve[1]),Je(ve[3]),Je(ve[1]),Je(ve[2]),Je(ve[3])}function De(te){r.push(l[te*3+0]),r.push(l[te*3+1]),r.push(l[te*3+2])}function Je(te){s.push(te.x),s.push(te.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes,i=this.parameters.options;return p0(t,i,e)}static fromJSON(e,t){const i=[];for(let s=0,o=e.shapes.length;s<o;s++){const a=t[e.shapes[s]];i.push(a)}const r=e.options.extrudePath;return r!==void 0&&(e.options.extrudePath=new Zr[r.type]().fromJSON(r)),new yc(i,e.options)}}const f0={generateTopUV:function(n,e,t,i,r){const s=e[t*3],o=e[t*3+1],a=e[i*3],l=e[i*3+1],c=e[r*3],h=e[r*3+1];return[new re(s,o),new re(a,l),new re(c,h)]},generateSideWallUV:function(n,e,t,i,r,s){const o=e[t*3],a=e[t*3+1],l=e[t*3+2],c=e[i*3],h=e[i*3+1],u=e[i*3+2],p=e[r*3],f=e[r*3+1],g=e[r*3+2],_=e[s*3],m=e[s*3+1],d=e[s*3+2];return Math.abs(a-h)<Math.abs(o-c)?[new re(o,1-l),new re(c,1-u),new re(p,1-g),new re(_,1-d)]:[new re(a,1-l),new re(h,1-u),new re(f,1-g),new re(m,1-d)]}};function p0(n,e,t){if(t.shapes=[],Array.isArray(n))for(let i=0,r=n.length;i<r;i++){const s=n[i];t.shapes.push(s.uuid)}else t.shapes.push(n.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}class vc extends ko{constructor(e=1,t=0){const i=(1+Math.sqrt(5))/2,r=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],s=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(r,s,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new vc(e.radius,e.detail)}}class $r extends yt{constructor(e=.5,t=1,i=32,r=1,s=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:r,thetaStart:s,thetaLength:o},i=Math.max(3,i),r=Math.max(1,r);const a=[],l=[],c=[],h=[];let u=e;const p=(t-e)/r,f=new P,g=new re;for(let _=0;_<=r;_++){for(let m=0;m<=i;m++){const d=s+m/i*o;f.x=u*Math.cos(d),f.y=u*Math.sin(d),l.push(f.x,f.y,f.z),c.push(0,0,1),g.x=(f.x/t+1)/2,g.y=(f.y/t+1)/2,h.push(g.x,g.y)}u+=p}for(let _=0;_<r;_++){const m=_*(i+1);for(let d=0;d<i;d++){const v=d+m,M=v,x=v+i+1,D=v+i+2,R=v+1;a.push(M,x,R),a.push(x,D,R)}}this.setIndex(a),this.setAttribute("position",new qe(l,3)),this.setAttribute("normal",new qe(c,3)),this.setAttribute("uv",new qe(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new $r(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class Bo extends yt{constructor(e=new Oo([new re(0,.5),new re(-.5,-.5),new re(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};const i=[],r=[],s=[],o=[];let a=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let h=0;h<e.length;h++)c(e[h]),this.addGroup(a,l,h),a+=l,l=0;this.setIndex(i),this.setAttribute("position",new qe(r,3)),this.setAttribute("normal",new qe(s,3)),this.setAttribute("uv",new qe(o,2));function c(h){const u=r.length/3,p=h.extractPoints(t);let f=p.shape;const g=p.holes;Pn.isClockWise(f)===!1&&(f=f.reverse());for(let m=0,d=g.length;m<d;m++){const v=g[m];Pn.isClockWise(v)===!0&&(g[m]=v.reverse())}const _=Pn.triangulateShape(f,g);for(let m=0,d=g.length;m<d;m++){const v=g[m];f=f.concat(v)}for(let m=0,d=f.length;m<d;m++){const v=f[m];r.push(v.x,v.y,0),s.push(0,0,1),o.push(v.x,v.y)}for(let m=0,d=_.length;m<d;m++){const v=_[m],M=v[0]+u,x=v[1]+u,D=v[2]+u;i.push(M,x,D),l+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes;return m0(t,e)}static fromJSON(e,t){const i=[];for(let r=0,s=e.shapes.length;r<s;r++){const o=t[e.shapes[r]];i.push(o)}return new Bo(i,e.curveSegments)}}function m0(n,e){if(e.shapes=[],Array.isArray(n))for(let t=0,i=n.length;t<i;t++){const r=n[t];e.shapes.push(r.uuid)}else e.shapes.push(n.uuid);return e}class xt extends yt{constructor(e=1,t=32,i=16,r=0,s=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:r,phiLength:s,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));const l=Math.min(o+a,Math.PI);let c=0;const h=[],u=new P,p=new P,f=[],g=[],_=[],m=[];for(let d=0;d<=i;d++){const v=[],M=d/i;let x=0;d===0&&o===0?x=.5/t:d===i&&l===Math.PI&&(x=-.5/t);for(let D=0;D<=t;D++){const R=D/t;u.x=-e*Math.cos(r+R*s)*Math.sin(o+M*a),u.y=e*Math.cos(o+M*a),u.z=e*Math.sin(r+R*s)*Math.sin(o+M*a),g.push(u.x,u.y,u.z),p.copy(u).normalize(),_.push(p.x,p.y,p.z),m.push(R+x,1-M),v.push(c++)}h.push(v)}for(let d=0;d<i;d++)for(let v=0;v<t;v++){const M=h[d][v+1],x=h[d][v],D=h[d+1][v],R=h[d+1][v+1];(d!==0||o>0)&&f.push(M,x,R),(d!==i-1||l<Math.PI)&&f.push(x,D,R)}this.setIndex(f),this.setAttribute("position",new qe(g,3)),this.setAttribute("normal",new qe(_,3)),this.setAttribute("uv",new qe(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new xt(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class tn extends yt{constructor(e=1,t=.4,i=12,r=48,s=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:i,tubularSegments:r,arc:s},i=Math.floor(i),r=Math.floor(r);const o=[],a=[],l=[],c=[],h=new P,u=new P,p=new P;for(let f=0;f<=i;f++)for(let g=0;g<=r;g++){const _=g/r*s,m=f/i*Math.PI*2;u.x=(e+t*Math.cos(m))*Math.cos(_),u.y=(e+t*Math.cos(m))*Math.sin(_),u.z=t*Math.sin(m),a.push(u.x,u.y,u.z),h.x=e*Math.cos(_),h.y=e*Math.sin(_),p.subVectors(u,h).normalize(),l.push(p.x,p.y,p.z),c.push(g/r),c.push(f/i)}for(let f=1;f<=i;f++)for(let g=1;g<=r;g++){const _=(r+1)*f+g-1,m=(r+1)*(f-1)+g-1,d=(r+1)*(f-1)+g,v=(r+1)*f+g;o.push(_,m,v),o.push(m,d,v)}this.setIndex(o),this.setAttribute("position",new qe(a,3)),this.setAttribute("normal",new qe(l,3)),this.setAttribute("uv",new qe(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new tn(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class bc extends yt{constructor(e=new fc(new P(-1,-1,0),new P(-1,1,0),new P(1,1,0)),t=64,i=1,r=8,s=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:i,radialSegments:r,closed:s};const o=e.computeFrenetFrames(t,s);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;const a=new P,l=new P,c=new re;let h=new P;const u=[],p=[],f=[],g=[];_(),this.setIndex(g),this.setAttribute("position",new qe(u,3)),this.setAttribute("normal",new qe(p,3)),this.setAttribute("uv",new qe(f,2));function _(){for(let M=0;M<t;M++)m(M);m(s===!1?t:0),v(),d()}function m(M){h=e.getPointAt(M/t,h);const x=o.normals[M],D=o.binormals[M];for(let R=0;R<=r;R++){const A=R/r*Math.PI*2,w=Math.sin(A),S=-Math.cos(A);l.x=S*x.x+w*D.x,l.y=S*x.y+w*D.y,l.z=S*x.z+w*D.z,l.normalize(),p.push(l.x,l.y,l.z),a.x=h.x+i*l.x,a.y=h.y+i*l.y,a.z=h.z+i*l.z,u.push(a.x,a.y,a.z)}}function d(){for(let M=1;M<=t;M++)for(let x=1;x<=r;x++){const D=(r+1)*(M-1)+(x-1),R=(r+1)*M+(x-1),A=(r+1)*M+x,w=(r+1)*(M-1)+x;g.push(D,R,w),g.push(R,A,w)}}function v(){for(let M=0;M<=t;M++)for(let x=0;x<=r;x++)c.x=M/t,c.y=x/r,f.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new bc(new Zr[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}}class wt extends bn{static get type(){return"MeshStandardMaterial"}constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new Ie(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ie(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new re(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new nn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class B_ extends wt{static get type(){return"MeshPhysicalMaterial"}constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new re(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Tt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Ie(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Ie(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Ie(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class g0 extends bn{static get type(){return"MeshToonMaterial"}constructor(e){super(),this.isMeshToonMaterial=!0,this.defines={TOON:""},this.color=new Ie(16777215),this.map=null,this.gradientMap=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ie(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new re(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.gradientMap=e.gradientMap,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.alphaMap=e.alphaMap,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}function Gr(n,e,t){return!n||!t&&n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}function _0(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function y0(n){function e(r,s){return n[r]-n[s]}const t=n.length,i=new Array(t);for(let r=0;r!==t;++r)i[r]=r;return i.sort(e),i}function _l(n,e,t){const i=n.length,r=new n.constructor(i);for(let s=0,o=0;o!==i;++s){const a=t[s]*e;for(let l=0;l!==e;++l)r[o++]=n[a+l]}return r}function Mc(n,e,t,i){let r=1,s=n[0];for(;s!==void 0&&s[i]===void 0;)s=n[r++];if(s===void 0)return;let o=s[i];if(o!==void 0)if(Array.isArray(o))do o=s[i],o!==void 0&&(e.push(s.time),t.push.apply(t,o)),s=n[r++];while(s!==void 0);else if(o.toArray!==void 0)do o=s[i],o!==void 0&&(e.push(s.time),o.toArray(t,t.length)),s=n[r++];while(s!==void 0);else do o=s[i],o!==void 0&&(e.push(s.time),t.push(o)),s=n[r++];while(s!==void 0)}class hs{constructor(e,t,i,r){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=r!==void 0?r:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let i=this._cachedIndex,r=t[i],s=t[i-1];n:{e:{let o;t:{i:if(!(e<r)){for(let a=i+2;;){if(r===void 0){if(e<s)break i;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(s=r,r=t[++i],e<r)break e}o=t.length;break t}if(!(e>=s)){const a=t[1];e<a&&(i=2,s=a);for(let l=i-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(r=s,s=t[--i-1],e>=s)break e}o=i,i=0;break t}break n}for(;i<o;){const a=i+o>>>1;e<t[a]?o=a:i=a+1}if(r=t[i],s=t[i-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(r===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,s,r)}return this.interpolate_(i,s,e,r)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,i=this.sampleValues,r=this.valueSize,s=e*r;for(let o=0;o!==r;++o)t[o]=i[s+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}}class v0 extends hs{constructor(e,t,i,r){super(e,t,i,r),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:2400,endingEnd:2400}}intervalChanged_(e,t,i){const r=this.parameterPositions;let s=e-2,o=e+1,a=r[s],l=r[o];if(a===void 0)switch(this.getSettings_().endingStart){case 2401:s=e,a=2*t-i;break;case 2402:s=r.length-2,a=t+r[s]-r[s+1];break;default:s=e,a=i}if(l===void 0)switch(this.getSettings_().endingEnd){case 2401:o=e,l=2*i-t;break;case 2402:o=1,l=i+r[1]-r[0];break;default:o=e-1,l=t}const c=(i-t)*.5,h=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-i),this._offsetPrev=s*h,this._offsetNext=o*h}interpolate_(e,t,i,r){const s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=this._offsetPrev,u=this._offsetNext,p=this._weightPrev,f=this._weightNext,g=(i-t)/(r-t),_=g*g,m=_*g,d=-p*m+2*p*_-p*g,v=(1+p)*m+(-1.5-2*p)*_+(-.5+p)*g+1,M=(-1-f)*m+(1.5+f)*_+.5*g,x=f*m-f*_;for(let D=0;D!==a;++D)s[D]=d*o[h+D]+v*o[c+D]+M*o[l+D]+x*o[u+D];return s}}class b0 extends hs{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e,t,i,r){const s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=(i-t)/(r-t),u=1-h;for(let p=0;p!==a;++p)s[p]=o[c+p]*u+o[l+p]*h;return s}}class M0 extends hs{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e){return this.copySampleValue_(e-1)}}class ln{constructor(e,t,i,r){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Gr(t,this.TimeBufferType),this.values=Gr(i,this.ValueBufferType),this.setInterpolation(r||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:Gr(e.times,Array),values:Gr(e.values,Array)};const r=e.getInterpolation();r!==e.DefaultInterpolation&&(i.interpolation=r)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new M0(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new b0(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new v0(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case 2300:t=this.InterpolantFactoryMethodDiscrete;break;case 2301:t=this.InterpolantFactoryMethodLinear;break;case 2302:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){const i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return console.warn("THREE.KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return 2300;case this.InterpolantFactoryMethodLinear:return 2301;case this.InterpolantFactoryMethodSmooth:return 2302}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let i=0,r=t.length;i!==r;++i)t[i]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let i=0,r=t.length;i!==r;++i)t[i]*=e}return this}trim(e,t){const i=this.times,r=i.length;let s=0,o=r-1;for(;s!==r&&i[s]<e;)++s;for(;o!==-1&&i[o]>t;)--o;if(++o,s!==0||o!==r){s>=o&&(o=Math.max(o,1),s=o-1);const a=this.getValueSize();this.times=i.slice(s,o),this.values=this.values.slice(s*a,o*a)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);const i=this.times,r=this.values,s=i.length;s===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==s;a++){const l=i[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(r!==void 0&&_0(r))for(let a=0,l=r.length;a!==l;++a){const c=r[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),r=this.getInterpolation()===2302,s=e.length-1;let o=1;for(let a=1;a<s;++a){let l=!1;const c=e[a],h=e[a+1];if(c!==h&&(a!==1||c!==e[0]))if(r)l=!0;else{const u=a*i,p=u-i,f=u+i;for(let g=0;g!==i;++g){const _=t[u+g];if(_!==t[p+g]||_!==t[f+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];const u=a*i,p=o*i;for(let f=0;f!==i;++f)t[p+f]=t[u+f]}++o}}if(s>0){e[o]=e[s];for(let a=s*i,l=o*i,c=0;c!==i;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*i)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),i=this.constructor,r=new i(this.name,e,t);return r.createInterpolant=this.createInterpolant,r}}ln.prototype.TimeBufferType=Float32Array;ln.prototype.ValueBufferType=Float32Array;ln.prototype.DefaultInterpolation=2301;class Pi extends ln{constructor(e,t,i){super(e,t,i)}}Pi.prototype.ValueTypeName="bool";Pi.prototype.ValueBufferType=Array;Pi.prototype.DefaultInterpolation=2300;Pi.prototype.InterpolantFactoryMethodLinear=void 0;Pi.prototype.InterpolantFactoryMethodSmooth=void 0;class xc extends ln{}xc.prototype.ValueTypeName="color";class Qr extends ln{}Qr.prototype.ValueTypeName="number";class x0 extends hs{constructor(e,t,i,r){super(e,t,i,r)}interpolate_(e,t,i,r){const s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(i-t)/(r-t);let c=e*a;for(let h=c+a;c!==h;c+=4)_t.slerpFlat(s,0,o,c-a,o,c,l);return s}}class us extends ln{InterpolantFactoryMethodLinear(e){return new x0(this.times,this.values,this.getValueSize(),e)}}us.prototype.ValueTypeName="quaternion";us.prototype.InterpolantFactoryMethodSmooth=void 0;class Li extends ln{constructor(e,t,i){super(e,t,i)}}Li.prototype.ValueTypeName="string";Li.prototype.ValueBufferType=Array;Li.prototype.DefaultInterpolation=2300;Li.prototype.InterpolantFactoryMethodLinear=void 0;Li.prototype.InterpolantFactoryMethodSmooth=void 0;class es extends ln{}es.prototype.ValueTypeName="vector";class z_{constructor(e="",t=-1,i=[],r=2500){this.name=e,this.tracks=i,this.duration=t,this.blendMode=r,this.uuid=jt(),this.duration<0&&this.resetDuration()}static parse(e){const t=[],i=e.tracks,r=1/(e.fps||1);for(let o=0,a=i.length;o!==a;++o)t.push(w0(i[o]).scale(r));const s=new this(e.name,e.duration,t,e.blendMode);return s.uuid=e.uuid,s}static toJSON(e){const t=[],i=e.tracks,r={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode};for(let s=0,o=i.length;s!==o;++s)t.push(ln.toJSON(i[s]));return r}static CreateFromMorphTargetSequence(e,t,i,r){const s=t.length,o=[];for(let a=0;a<s;a++){let l=[],c=[];l.push((a+s-1)%s,a,(a+1)%s),c.push(0,1,0);const h=y0(l);l=_l(l,1,h),c=_l(c,1,h),!r&&l[0]===0&&(l.push(s),c.push(c[0])),o.push(new Qr(".morphTargetInfluences["+t[a].name+"]",l,c).scale(1/i))}return new this(e,-1,o)}static findByName(e,t){let i=e;if(!Array.isArray(e)){const r=e;i=r.geometry&&r.geometry.animations||r.animations}for(let r=0;r<i.length;r++)if(i[r].name===t)return i[r];return null}static CreateClipsFromMorphTargetSequences(e,t,i){const r={},s=/^([\w-]*?)([\d]+)$/;for(let a=0,l=e.length;a<l;a++){const c=e[a],h=c.name.match(s);if(h&&h.length>1){const u=h[1];let p=r[u];p||(r[u]=p=[]),p.push(c)}}const o=[];for(const a in r)o.push(this.CreateFromMorphTargetSequence(a,r[a],t,i));return o}static parseAnimation(e,t){if(!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;const i=function(u,p,f,g,_){if(f.length!==0){const m=[],d=[];Mc(f,m,d,g),m.length!==0&&_.push(new u(p,m,d))}},r=[],s=e.name||"default",o=e.fps||30,a=e.blendMode;let l=e.length||-1;const c=e.hierarchy||[];for(let u=0;u<c.length;u++){const p=c[u].keys;if(!(!p||p.length===0))if(p[0].morphTargets){const f={};let g;for(g=0;g<p.length;g++)if(p[g].morphTargets)for(let _=0;_<p[g].morphTargets.length;_++)f[p[g].morphTargets[_]]=-1;for(const _ in f){const m=[],d=[];for(let v=0;v!==p[g].morphTargets.length;++v){const M=p[g];m.push(M.time),d.push(M.morphTarget===_?1:0)}r.push(new Qr(".morphTargetInfluence["+_+"]",m,d))}l=f.length*o}else{const f=".bones["+t[u].name+"]";i(es,f+".position",p,"pos",r),i(us,f+".quaternion",p,"rot",r),i(es,f+".scale",p,"scl",r)}}return r.length===0?null:new this(s,l,r,a)}resetDuration(){const e=this.tracks;let t=0;for(let i=0,r=e.length;i!==r;++i){const s=this.tracks[i];t=Math.max(t,s.times[s.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());return new this.constructor(this.name,this.duration,e,this.blendMode)}toJSON(){return this.constructor.toJSON(this)}}function S0(n){switch(n.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Qr;case"vector":case"vector2":case"vector3":case"vector4":return es;case"color":return xc;case"quaternion":return us;case"bool":case"boolean":return Pi;case"string":return Li}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+n)}function w0(n){if(n.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=S0(n.type);if(n.times===void 0){const t=[],i=[];Mc(n.keys,t,i,"value"),n.times=t,n.values=i}return e.parse!==void 0?e.parse(n):new e(n.name,n.times,n.values,n.interpolation)}const Cn={enabled:!1,files:{},add:function(n,e){this.enabled!==!1&&(this.files[n]=e)},get:function(n){if(this.enabled!==!1)return this.files[n]},remove:function(n){delete this.files[n]},clear:function(){this.files={}}};class T0{constructor(e,t,i){const r=this;let s=!1,o=0,a=0,l;const c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this.itemStart=function(h){a++,s===!1&&r.onStart!==void 0&&r.onStart(h,o,a),s=!0},this.itemEnd=function(h){o++,r.onProgress!==void 0&&r.onProgress(h,o,a),o===a&&(s=!1,r.onLoad!==void 0&&r.onLoad())},this.itemError=function(h){r.onError!==void 0&&r.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){const u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,p=c.length;u<p;u+=2){const f=c[u],g=c[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return g}return null}}}const E0=new T0;class Ii{constructor(e){this.manager=e!==void 0?e:E0,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const i=this;return new Promise(function(r,s){i.load(e,r,t,s)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}}Ii.DEFAULT_MATERIAL_NAME="__DEFAULT";const gn={};class A0 extends Error{constructor(e,t){super(e),this.response=t}}class R0 extends Ii{constructor(e){super(e)}load(e,t,i,r){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=Cn.get(e);if(s!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(s),this.manager.itemEnd(e)},0),s;if(gn[e]!==void 0){gn[e].push({onLoad:t,onProgress:i,onError:r});return}gn[e]=[],gn[e].push({onLoad:t,onProgress:i,onError:r});const o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin"}),a=this.mimeType,l=this.responseType;fetch(o).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;const h=gn[e],u=c.body.getReader(),p=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),f=p?parseInt(p):0,g=f!==0;let _=0;const m=new ReadableStream({start(d){v();function v(){u.read().then(({done:M,value:x})=>{if(M)d.close();else{_+=x.byteLength;const D=new ProgressEvent("progress",{lengthComputable:g,loaded:_,total:f});for(let R=0,A=h.length;R<A;R++){const w=h[R];w.onProgress&&w.onProgress(D)}d.enqueue(x),v()}},M=>{d.error(M)})}}});return new Response(m)}else throw new A0(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(h=>new DOMParser().parseFromString(h,a));case"json":return c.json();default:if(a===void 0)return c.text();{const u=/charset="?([^;"\s]*)"?/i.exec(a),p=u&&u[1]?u[1].toLowerCase():void 0,f=new TextDecoder(p);return c.arrayBuffer().then(g=>f.decode(g))}}}).then(c=>{Cn.add(e,c);const h=gn[e];delete gn[e];for(let u=0,p=h.length;u<p;u++){const f=h[u];f.onLoad&&f.onLoad(c)}}).catch(c=>{const h=gn[e];if(h===void 0)throw this.manager.itemError(e),c;delete gn[e];for(let u=0,p=h.length;u<p;u++){const f=h[u];f.onError&&f.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}}class C0 extends Ii{constructor(e){super(e)}load(e,t,i,r){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,o=Cn.get(e);if(o!==void 0)return s.manager.itemStart(e),setTimeout(function(){t&&t(o),s.manager.itemEnd(e)},0),o;const a=tr("img");function l(){h(),Cn.add(e,this),t&&t(this),s.manager.itemEnd(e)}function c(u){h(),r&&r(u),s.manager.itemError(e),s.manager.itemEnd(e)}function h(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),s.manager.itemStart(e),a.src=e,a}}class G_ extends Ii{constructor(e){super(e)}load(e,t,i,r){const s=this,o=new as,a=new R0(this.manager);return a.setResponseType("arraybuffer"),a.setRequestHeader(this.requestHeader),a.setPath(this.path),a.setWithCredentials(s.withCredentials),a.load(e,function(l){let c;try{c=s.parse(l)}catch(h){if(r!==void 0)r(h);else{console.error(h);return}}c.image!==void 0?o.image=c.image:c.data!==void 0&&(o.image.width=c.width,o.image.height=c.height,o.image.data=c.data),o.wrapS=c.wrapS!==void 0?c.wrapS:1001,o.wrapT=c.wrapT!==void 0?c.wrapT:1001,o.magFilter=c.magFilter!==void 0?c.magFilter:1006,o.minFilter=c.minFilter!==void 0?c.minFilter:1006,o.anisotropy=c.anisotropy!==void 0?c.anisotropy:1,c.colorSpace!==void 0&&(o.colorSpace=c.colorSpace),c.flipY!==void 0&&(o.flipY=c.flipY),c.format!==void 0&&(o.format=c.format),c.type!==void 0&&(o.type=c.type),c.mipmaps!==void 0&&(o.mipmaps=c.mipmaps,o.minFilter=1008),c.mipmapCount===1&&(o.minFilter=1006),c.generateMipmaps!==void 0&&(o.generateMipmaps=c.generateMipmaps),o.needsUpdate=!0,t&&t(o,c)},i,r),o}}class P0 extends Ii{constructor(e){super(e)}load(e,t,i,r){const s=new Ct,o=new C0(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){s.image=a,s.needsUpdate=!0,t!==void 0&&t(s)},i,r),s}}class ds extends bt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ie(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}class V_ extends ds{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(bt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ie(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const Zs=new Ve,yl=new P,vl=new P;class zo{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new re(512,512),this.map=null,this.mapPass=null,this.matrix=new Ve,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Lo,this._frameExtents=new re(1,1),this._viewportCount=1,this._viewports=[new tt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,i=this.matrix;yl.setFromMatrixPosition(e.matrixWorld),t.position.copy(yl),vl.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(vl),t.updateMatrixWorld(),Zs.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Zs),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(Zs)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class L0 extends zo{constructor(){super(new Vt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1}updateMatrices(e){const t=this.camera,i=xi*2*e.angle*this.focus,r=this.mapSize.width/this.mapSize.height,s=e.distance||t.far;(i!==t.fov||r!==t.aspect||s!==t.far)&&(t.fov=i,t.aspect=r,t.far=s,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class H_ extends ds{constructor(e,t,i=0,r=Math.PI/3,s=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(bt.DEFAULT_UP),this.updateMatrix(),this.target=new bt,this.distance=i,this.angle=r,this.penumbra=s,this.decay=o,this.map=null,this.shadow=new L0}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}const bl=new Ve,Yi=new P,$s=new P;class I0 extends zo{constructor(){super(new Vt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new re(4,2),this._viewportCount=6,this._viewports=[new tt(2,1,1,1),new tt(0,1,1,1),new tt(3,1,1,1),new tt(1,1,1,1),new tt(3,0,1,1),new tt(1,0,1,1)],this._cubeDirections=[new P(1,0,0),new P(-1,0,0),new P(0,0,1),new P(0,0,-1),new P(0,1,0),new P(0,-1,0)],this._cubeUps=[new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,0,1),new P(0,0,-1)]}updateMatrices(e,t=0){const i=this.camera,r=this.matrix,s=e.distance||i.far;s!==i.far&&(i.far=s,i.updateProjectionMatrix()),Yi.setFromMatrixPosition(e.matrixWorld),i.position.copy(Yi),$s.copy(i.position),$s.add(this._cubeDirections[t]),i.up.copy(this._cubeUps[t]),i.lookAt($s),i.updateMatrixWorld(),r.makeTranslation(-Yi.x,-Yi.y,-Yi.z),bl.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),this._frustum.setFromProjectionMatrix(bl)}}class W_ extends ds{constructor(e,t,i=0,r=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=r,this.shadow=new I0}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class D0 extends zo{constructor(){super(new $l(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class X_ extends ds{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(bt.DEFAULT_UP),this.updateMatrix(),this.target=new bt,this.shadow=new D0}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class Y_{static decodeText(e){if(console.warn("THREE.LoaderUtils: decodeText() has been deprecated with r165 and will be removed with r175. Use TextDecoder instead."),typeof TextDecoder<"u")return new TextDecoder().decode(e);let t="";for(let i=0,r=e.length;i<r;i++)t+=String.fromCharCode(e[i]);try{return decodeURIComponent(escape(t))}catch{return t}}static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}class q_ extends Ii{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"}}setOptions(e){return this.options=e,this}load(e,t,i,r){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const s=this,o=Cn.get(e);if(o!==void 0){if(s.manager.itemStart(e),o.then){o.then(c=>{t&&t(c),s.manager.itemEnd(e)}).catch(c=>{r&&r(c)});return}return setTimeout(function(){t&&t(o),s.manager.itemEnd(e)},0),o}const a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader;const l=fetch(e,a).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign(s.options,{colorSpaceConversion:"none"}))}).then(function(c){return Cn.add(e,c),t&&t(c),s.manager.itemEnd(e),c}).catch(function(c){r&&r(c),Cn.remove(e),s.manager.itemError(e),s.manager.itemEnd(e)});Cn.add(e,l),s.manager.itemStart(e)}}class j_{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=Ml(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=Ml();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}function Ml(){return performance.now()}const Go="\\[\\]\\.:\\/",N0=new RegExp("["+Go+"]","g"),Vo="[^"+Go+"]",U0="[^"+Go.replace("\\.","")+"]",F0=/((?:WC+[\/:])*)/.source.replace("WC",Vo),k0=/(WCOD+)?/.source.replace("WCOD",U0),O0=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Vo),B0=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Vo),z0=new RegExp("^"+F0+k0+O0+B0+"$"),G0=["material","materials","bones","map"];class V0{constructor(e,t,i){const r=i||ct.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,r)}getValue(e,t){this.bind();const i=this._targetGroup.nCachedObjects_,r=this._bindings[i];r!==void 0&&r.getValue(e,t)}setValue(e,t){const i=this._bindings;for(let r=this._targetGroup.nCachedObjects_,s=i.length;r!==s;++r)i[r].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}}class ct{constructor(e,t,i){this.path=t,this.parsedPath=i||ct.parseTrackName(t),this.node=ct.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new ct.Composite(e,t,i):new ct(e,t,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(N0,"")}static parseTrackName(e){const t=z0.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},r=i.nodeName&&i.nodeName.lastIndexOf(".");if(r!==void 0&&r!==-1){const s=i.nodeName.substring(r+1);G0.indexOf(s)!==-1&&(i.nodeName=i.nodeName.substring(0,r),i.objectName=s)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){const i=function(s){for(let o=0;o<s.length;o++){const a=s[o];if(a.name===t||a.uuid===t)return a;const l=i(a.children);if(l)return l}return null},r=i(e.children);if(r)return r}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)e[t++]=i[r]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const i=this.resolvedProperty;for(let r=0,s=i.length;r!==s;++r)i[r]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,i=t.objectName,r=t.propertyName;let s=t.propertyIndex;if(e||(e=ct.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=t.objectIndex;switch(i){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}const o=e[r];if(o===void 0){const c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+r+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(r==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[s]!==void 0&&(s=e.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=s}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=r;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}ct.Composite=V0;ct.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ct.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ct.prototype.GetterByBindingType=[ct.prototype._getValue_direct,ct.prototype._getValue_array,ct.prototype._getValue_arrayElement,ct.prototype._getValue_toArray];ct.prototype.SetterByBindingTypeAndVersioning=[[ct.prototype._setValue_direct,ct.prototype._setValue_direct_setNeedsUpdate,ct.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ct.prototype._setValue_array,ct.prototype._setValue_array_setNeedsUpdate,ct.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ct.prototype._setValue_arrayElement,ct.prototype._setValue_arrayElement_setNeedsUpdate,ct.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ct.prototype._setValue_fromArray,ct.prototype._setValue_fromArray_setNeedsUpdate,ct.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];const xl=new Ve;class K_{constructor(e,t,i=0,r=1/0){this.ray=new sr(e,t),this.near=i,this.far=r,this.camera=null,this.layers=new Ro,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return xl.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(xl),this}intersectObject(e,t=!0,i=[]){return po(e,this,i,t),i.sort(Sl),i}intersectObjects(e,t=!0,i=[]){for(let r=0,s=e.length;r<s;r++)po(e[r],this,i,t);return i.sort(Sl),i}}function Sl(n,e){return n.distance-e.distance}function po(n,e,t,i){let r=!0;if(n.layers.test(e.layers)&&n.raycast(e,t)===!1&&(r=!1),r===!0&&i===!0){const s=n.children;for(let o=0,a=s.length;o<a;o++)po(s[o],e,t,!0)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"170"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="170");const J_={minX:77,maxX:103,minZ:94,maxZ:134},Z_={id:"island-shopping-lane",peninsula:!0,width:6,surface:"asphalt",points:[[89,87],[90,96],[90,128]]},$_=(n,e)=>n>=77&&n<=103&&e>=94&&e<=134,H0=Object.freeze({top:"jacket",topColour:"#eee8da",pattern:"none",bottom:"skirt",bottomColour:"#9b2834",bottomPattern:"plaid",footwear:"boots",shoes:"#704431",accent:"#e7c887",hat:"none"});function Xr(n,e=!1){const t=n[0].index!==null,i=new Set(Object.keys(n[0].attributes)),r=new Set(Object.keys(n[0].morphAttributes)),s={},o={},a=n[0].morphTargetsRelative,l=new yt;let c=0;for(let h=0;h<n.length;++h){const u=n[h];let p=0;if(t!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const f in u.attributes){if(!i.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+f+'" attribute exists among all geometries, or in none of them.'),null;s[f]===void 0&&(s[f]=[]),s[f].push(u.attributes[f]),p++}if(p!==i.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(a!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const f in u.morphAttributes){if(!r.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;o[f]===void 0&&(o[f]=[]),o[f].push(u.morphAttributes[f])}if(e){let f;if(t)f=u.index.count;else if(u.attributes.position!==void 0)f=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,f,h),c+=f}}if(t){let h=0;const u=[];for(let p=0;p<n.length;++p){const f=n[p].index;for(let g=0;g<f.count;++g)u.push(f.getX(g)+h);h+=n[p].attributes.position.count}l.setIndex(u)}for(const h in s){const u=wl(s[h]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,u)}for(const h in o){const u=o[h][0].length;if(u===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let p=0;p<u;++p){const f=[];for(let _=0;_<o[h].length;++_)f.push(o[h][_][p]);const g=wl(f);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(g)}}return l}function wl(n){let e,t,i,r=-1,s=0;for(let c=0;c<n.length;++c){const h=n[c];if(e===void 0&&(e=h.array.constructor),e!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=h.itemSize),t!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(i===void 0&&(i=h.normalized),i!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(r===-1&&(r=h.gpuType),r!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;s+=h.count*t}const o=new e(s),a=new Nt(o,t,i);let l=0;for(let c=0;c<n.length;++c){const h=n[c];if(h.isInterleavedBufferAttribute){const u=l/t;for(let p=0,f=h.count;p<f;p++)for(let g=0;g<t;g++){const _=h.getComponent(p,g);a.setComponent(p+u,g,_)}}else o.set(h.array,l);l+=h.count*t}return r!==void 0&&(a.gpuType=r),a}function Q_(n,e){if(e===0)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),n;if(e===2||e===1){let t=n.getIndex();if(t===null){const o=[],a=n.getAttribute("position");if(a!==void 0){for(let l=0;l<a.count;l++)o.push(l);n.setIndex(o),t=n.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),n}const i=t.count-2,r=[];if(e===2)for(let o=1;o<=i;o++)r.push(t.getX(0)),r.push(t.getX(o)),r.push(t.getX(o+1));else for(let o=0;o<i;o++)o%2===0?(r.push(t.getX(o)),r.push(t.getX(o+1)),r.push(t.getX(o+2))):(r.push(t.getX(o+2)),r.push(t.getX(o+1)),r.push(t.getX(o)));r.length/3!==i&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");const s=n.clone();return s.setIndex(r),s.clearGroups(),s}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),n}const Ho=Object.freeze(["oval","round","square","narrow","heart"]),Tl={oval:[.94,1.08,.22],round:[1.03,1.01,.1],square:[1.03,1.02,-.16],narrow:[.84,1.16,.25],heart:[1.01,1.07,.37]};function W0(n){const[e,t,i]=Tl[n.form]||Tl.oval;return{width:e+(n.shape-.5)*.12,height:t-(n.shape-.5)*.1,taper:i+(n.jaw-.5)*-.22,cheek:(n.cheeks-.5)*.13}}function or(n,e){const t=n.y,i=Math.max(0,Math.min(1,(-t-.12)/.78)),r=Math.exp(-(((t+.16)/.32)**2))*e.cheek;return n.x*=1-e.taper*i+r,n.z>0&&(n.z*=1-.08*Math.max(0,1-Math.abs(t)*1.4)),n}const X0=Object.freeze({skin:Object.freeze(["#f7dcc4","#f1cfae","#e8bf98","#dca97e","#c98d62","#b27449","#8f5a38","#6b4029"]),hair:Object.freeze(["#1c1714","#3a2618","#5a3a22","#8a5a2e","#c08a4a","#e0c078","#9a9a96","#d8d6d0","#b8412e","#3d4f8a"]),eyes:Object.freeze(["#2a1d16","#5a3a22","#3d6a8a","#4a7a4a","#6a5a8a","#1c1c24"]),cloth:Object.freeze(["#f4f1ea","#d8342c","#e8742a","#f4d23c","#8fbf4a","#2a8a5a","#3fa0c8","#2f5f9e","#27304d","#8a4ab8","#e98aa6","#9a6a42","#6d7478","#2b2b2b","#c8b48a","#7fb0d8"]),lips:Object.freeze(["#b8544a","#a8433e","#cc3d52","#e06a7a","#d8342c","#8a3a3a"])}),Y0=Object.freeze(["child","teen","adult","elder"]),Sc=n=>Number.isFinite(+n)?n<13?"child":n<19?"teen":n>=65?"elder":"adult":"adult",pt=Object.freeze({silhouette:Object.freeze(["neutral","feminine","masculine"]),head:Ho,hair:Object.freeze(["crop","sidepart","bob","long","ponytail","braids","bun","spiky","perm","buzz","afro","horseshoe","bald"]),eyes:Object.freeze(["round","dot","almond","sleepy","lashes","narrow","sparkle","gentle"]),brows:Object.freeze(["straight","arched","thick","thin","worried","bushy","none"]),nose:Object.freeze(["button","dot","line","wide","hook","none"]),mouth:Object.freeze(["smile","flat","grin","small","wide","smirk","pout"]),glasses:Object.freeze(["none","round","square","sun","half"]),facial:Object.freeze(["none","moustache","walrus","stubble","beard","goatee"]),top:Object.freeze(["tank","tee","kariyushi","polo","blouse","jacket","apron","smock","sailor","hoodie","cardigan","overalls","sundress","festival","lighthouse","lantern","reef"]),bottom:Object.freeze(["underwear","shorts","trousers","skirt","longskirt","widepants","cropped","culottes","pleatedskirt"]),footwear:Object.freeze(["barefoot","sneakers","sandals","shoes","boots"]),hat:Object.freeze(["none","cap","captain","police","helmet","straw","headband","kerchief","beanie","beret","bucket","ribbon","squid","teapot","sunflower","paperboat","mountain"]),earrings:Object.freeze(["none","studs","hoops"]),neckwear:Object.freeze(["none","pendant","scarf"])}),q0=(n,e=0,t=1)=>Math.min(t,Math.max(e,Number.isFinite(+n)?+n:e)),Dt=(n,e,t)=>n.includes(e)?e:t??n[0],j0=n=>/^#[0-9a-f]{6}$/i.test(String(n))?String(n).toLowerCase():null,K0=Object.freeze({v:1,name:"",age:"adult",body:Object.freeze({height:.5,build:.5,silhouette:"neutral",skin:"#e8bf98"}),head:Object.freeze({size:.5,shape:.5,form:"oval",jaw:.5,cheeks:.5}),hair:Object.freeze({style:"crop",colour:"#1c1714",flip:!1}),eyes:Object.freeze({style:"round",colour:"#2a1d16",size:.5,width:.5,spacing:.5,height:.5,tilt:.5}),brows:Object.freeze({style:"straight",colour:"#1c1714",size:.5,spacing:.5,height:.5,tilt:.5}),nose:Object.freeze({style:"button",size:.5,height:.5,x:.5}),mouth:Object.freeze({style:"smile",colour:"#b8544a",size:.5,width:.5,height:.5,x:.5}),glasses:Object.freeze({style:"none",colour:"#2b2b2b"}),facial:Object.freeze({style:"none",colour:"#1c1714"}),blush:.25,freckles:!1,mole:!1,wrinkles:0,outfit:Object.freeze({top:"tank",topColour:"#f4f1ea",pattern:"none",bottom:"underwear",bottomColour:"#7fb0d8",footwear:"barefoot",shoes:"#6d4a32",hat:"none",hatColour:"#f4f1ea",accent:"#f4d23c"}),accessories:Object.freeze({earrings:"none",neckwear:"none",colour:"#e0b93a",pin:!1}),swim:Object.freeze({colour:"#2f5f9e"}),profile:Object.freeze({pace:.5,talk:.5,show:.5,outlook:.5,pitch:.5,speed:.5,month:7,day:1,favourite:"#3fa0c8",catchphrase:""})});function Wt(n={}){const e=n&&typeof n=="object"?n:{},t=K0,i=(a,l)=>{const c=e[a]&&typeof e[a]=="object"?e[a]:{},h={};for(const[u,p]of Object.entries(l))h[u]=p(c[u],t[a][u]);return h},r=(a,l)=>a===void 0?l:q0(a),s=(a,l)=>j0(a)||l,o=(a,l)=>a===void 0?l:!!a;return{v:1,name:String(e.name||"").slice(0,24),age:Dt(Y0,e.age,"adult"),body:i("body",{height:r,build:r,silhouette:a=>Dt(pt.silhouette,a,"neutral"),skin:s}),head:i("head",{size:r,shape:r,form:(a,l)=>Dt(Ho,a,l),jaw:r,cheeks:r}),hair:i("hair",{style:(a,l)=>Dt(pt.hair,a,l),colour:s,flip:o}),eyes:i("eyes",{style:(a,l)=>Dt(pt.eyes,a,l),colour:s,size:r,width:r,spacing:r,height:r,tilt:r}),brows:i("brows",{style:(a,l)=>Dt(pt.brows,a,l),colour:s,size:r,spacing:r,height:r,tilt:r}),nose:i("nose",{style:(a,l)=>Dt(pt.nose,a,l),size:r,height:r,x:r}),mouth:i("mouth",{style:(a,l)=>Dt(pt.mouth,a,l),colour:s,size:r,width:r,height:r,x:r}),glasses:i("glasses",{style:(a,l)=>Dt(pt.glasses,a,l),colour:s}),facial:i("facial",{style:(a,l)=>Dt(pt.facial,a,l),colour:s}),blush:r(e.blush,t.blush),freckles:!!e.freckles,mole:!!e.mole,wrinkles:r(e.wrinkles,t.wrinkles),outfit:J0(e.outfit,i("outfit",{top:(a,l)=>Dt(pt.top,a,l),topColour:s,pattern:(a,l)=>["none","flowers","stripes","dots"].includes(a)?a:l,bottom:(a,l)=>Dt(pt.bottom,a,l),bottomColour:s,bottomPattern:a=>a==="plaid"?"plaid":"none",footwear:(a,l)=>Dt(pt.footwear,a,l),shoes:s,hat:(a,l)=>Dt(pt.hat,a,l),hatColour:s,accent:s})),accessories:i("accessories",{earrings:(a,l)=>Dt(pt.earrings,a,l),neckwear:(a,l)=>Dt(pt.neckwear,a,l),colour:s,pin:o}),swim:i("swim",{colour:s}),profile:(()=>{const a=i("profile",{pace:r,talk:r,show:r,outlook:r,pitch:r,speed:r,month:(l,c)=>Number.isInteger(+l)&&+l>=1&&+l<=12?+l:c,day:(l,c)=>Number.isInteger(+l)&&+l>=1&&+l<=31?+l:c,favourite:s,catchphrase:(l,c)=>l===void 0?c:String(l).replace(/[\u0000-\u001f<>]/g,"").slice(0,40)});return a.day=Math.min(a.day,[31,29,31,30,31,30,31,31,30,31,30,31][a.month-1]),a})()}}function J0(n,e){return!n||typeof n!="object"||(n.top===void 0&&(e.top="tee",n.topColour===void 0&&(e.topColour="#3fa0c8")),n.bottom===void 0&&(e.bottom="trousers",n.bottomColour===void 0&&(e.bottomColour="#27304d")),pt.footwear.includes(n.footwear)||(e.footwear="sneakers")),e}function wc(n){const e=JSON.stringify(Wt(n)),t=new TextEncoder().encode(e);let i="";for(const r of t)i+=String.fromCharCode(r);return btoa(i).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}function Wo(n){try{const e=atob(String(n).replace(/-/g,"+").replace(/_/g,"/")),t=Uint8Array.from(e,i=>i.charCodeAt(0));return Wt(JSON.parse(new TextDecoder().decode(t)))}catch{return null}}function Xo(n=""){let e=2166136261;for(const t of String(n))e=Math.imul(e^t.codePointAt(0),16777619)>>>0;return()=>{e=e+1831565813>>>0;let t=e;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}function ey(n=Math.random().toString(36)){const e=Xo(n),t=a=>a[Math.floor(e()*a.length)],i=X0,r=e()<.3,s=e()<.5,o=t(r?s?["perm","bun","bob"]:["horseshoe","buzz","crop","bald"]:s?["bob","long","ponytail","braids","bun","sidepart"]:["crop","sidepart","spiky","buzz","afro"]);return Wt({body:{height:.3+e()*.5,build:.25+e()*.55,skin:t(i.skin.slice(0,7))},head:{size:.4+e()*.25,shape:e(),form:t(Ho),jaw:e(),cheeks:e()},hair:{style:o,colour:t(r?["#9a9a96","#d8d6d0","#5a3a22"]:i.hair.slice(0,6)),flip:e()<.5},eyes:{style:t(pt.eyes),colour:t(i.eyes),size:.3+e()*.5,spacing:.3+e()*.4,height:.4+e()*.2,tilt:.35+e()*.3},brows:{style:t(pt.brows.slice(0,6)),colour:r?"#8a8a86":"#1c1714",size:.4+e()*.3,height:.4+e()*.3,tilt:.3+e()*.4},nose:{style:t(pt.nose.slice(0,5)),size:.3+e()*.5,height:.4+e()*.2},mouth:{style:t(pt.mouth),colour:s&&e()<.5?t(i.lips):"#b8544a",size:.35+e()*.4,height:.4+e()*.2},glasses:{style:e()<.25?t(pt.glasses.slice(1)):"none",colour:t(["#2b2b2b","#8a4a3a","#c8a060","#e06a7a"])},facial:{style:!s&&e()<.3?t(pt.facial.slice(1)):"none",colour:"#3a2618"},blush:s?.3+e()*.4:e()*.2,freckles:e()<.12,mole:e()<.1,wrinkles:r?.5+e()*.5:0,outfit:{top:t(["tee","kariyushi","polo","blouse","jacket"]),topColour:t(i.cloth),pattern:e()<.3?t(["flowers","stripes","dots"]):"none",bottom:s&&e()<.4?t(["skirt","longskirt","widepants","cropped","culottes","pleatedskirt"]):t(["shorts","trousers"]),bottomColour:t(["#27304d","#6d7478","#c8b48a","#2b2b2b","#9a6a42","#2f5f9e"]),shoes:t(["#6d4a32","#2b2b2b","#f4f1ea","#d8342c"]),footwear:t(["sneakers","sandals","shoes","boots"]),hat:"none",hatColour:"#f4f1ea",accent:t(i.cloth)},profile:{pace:e(),talk:e(),show:e(),outlook:e(),pitch:s?.45+e()*.5:e()*.6,speed:e(),month:1+Math.floor(e()*12),day:1+Math.floor(e()*28),favourite:t(i.cloth)}})}const ot=Math.PI*2,Z0=Object.freeze(["#b8544a","#a8433e","#9a4a40"]);function bi(n,e){const t=parseInt(n.slice(1),16),i=r=>Math.max(0,Math.min(255,Math.round(r*e)));return"#"+[i(t>>16),i(t>>8&255),i(t&255)].map(r=>r.toString(16).padStart(2,"0")).join("")}function fs(n){const e=n.eyes,t=n.brows,i=n.nose,r=n.mouth,s=104+(e.height-.5)*-56,o=38+(e.spacing-.5)*36,a=1.16+e.size*.8;return{eyeY:s,spread:o,eyeS:a,eyeW:.85+(e.width??.5)*.7,eyeTilt:(e.tilt-.5)*.85,browY:70+(t.height-.5)*-48,browSpread:o+((t.spacing??.5)-.5)*32,browS:.75+t.size*.6,browTilt:(t.tilt-.5)*.85,noseY:134+(i.height-.5)*-48,noseX:128+((i.x??.5)-.5)*48,noseS:.7+i.size*.7,mouthY:160+(r.height-.5)*-54,mouthX:128+((r.x??.5)-.5)*56,mouthS:1+r.size*.8,mouthW:.65+(r.width??.5)*.7}}const mo=Object.freeze({neutral:{eyes:"open",brow:0,browLift:0,mouth:null,blush:0},smile:{eyes:"smiling",brow:0,browLift:3,mouth:"smile",blush:.15},content:{eyes:"content",brow:0,browLift:1,mouth:"smile",blush:.1},happy:{eyes:"happy",brow:0,browLift:10,mouth:"grin",blush:.4},laugh:{eyes:"happy",brow:0,browLift:14,mouth:"laugh",blush:.55},sad:{eyes:"sad",brow:-1,browLift:3,mouth:"frown",blush:0},worried:{eyes:"worry",brow:-1.35,browLift:10,mouth:"wobble",blush:0},angry:{eyes:"angry",brow:1.4,browLift:-5,mouth:"snarl",blush:.15},grumpy:{eyes:"angry",brow:.6,browLift:-2,mouth:"frown",blush:0},shy:{eyes:"shy",brow:-.4,browLift:3,mouth:"small",blush:1},surprised:{eyes:"wide",brow:0,browLift:20,mouth:"o",blush:0},thinking:{eyes:"side",brow:.3,browLift:0,mouth:"hmm",blush:0},sleep:{eyes:"closed",brow:0,browLift:-1,mouth:"small",blush:0}});Object.freeze(Object.keys(mo));function $0(n,e,t={}){const i=t.size||256,r=i/256,s=mo[t.expression]||mo.neutral,o=fs(e),a=e.body.skin,l="#2b2623";if(n.canvas.__skin=a,n.save(),n.setTransform(r,0,0,r,0,0),n.fillStyle=a,n.fillRect(0,0,256,256),n.lineCap="round",n.lineJoin="round",e.wrinkles>.05){n.strokeStyle=bi(a,.8),n.lineWidth=1.6,n.globalAlpha=Math.min(1,e.wrinkles);for(const f of[-1,1]){const g=128+f*(o.spread+16*o.eyeS);for(let _=0;_<2;_++)n.beginPath(),n.moveTo(g,o.eyeY-4+_*7),n.lineTo(g+f*8,o.eyeY-6+_*9),n.stroke();n.beginPath(),n.arc(128+f*22,o.mouthY-6,14,f>0?-.2:Math.PI-.6,f>0?.6:Math.PI+.2),n.stroke()}for(let f=0;f<2;f++)n.beginPath(),n.moveTo(104,o.browY-14-f*7),n.quadraticCurveTo(128,o.browY-18-f*7,152,o.browY-14-f*7),n.stroke();n.globalAlpha=1}if(e.freckles){n.fillStyle=bi(a,.72);for(const f of[-1,1])for(let g=0;g<5;g++)n.beginPath(),n.arc(128+f*(o.spread+g%3*5-2),o.noseY-2+Math.floor(g/3)*6,1.5,0,ot),n.fill()}e.mole&&(n.fillStyle="#4a3024",n.beginPath(),n.arc(128+o.spread*.9,o.mouthY-6,2.4,0,ot),n.fill());const c=Math.min(1,e.blush*.8+s.blush);if(c>.02){for(const f of[-1,1]){const g=128+f*(o.spread+8),_=o.noseY+2,m=n.createRadialGradient(g,_,1,g,_,17);m.addColorStop(0,`rgba(236,110,120,${.55*c})`),m.addColorStop(1,"rgba(236,110,120,0)"),n.fillStyle=m,n.beginPath(),n.ellipse(g,_,18,12,0,0,ot),n.fill()}if(s.blush>=.9){n.strokeStyle="rgba(210,80,90,.7)",n.lineWidth=1.6;for(const f of[-1,1])for(let g=0;g<3;g++){const _=128+f*(o.spread+2+g*6);n.beginPath(),n.moveTo(_-2,o.noseY+6),n.lineTo(_+2,o.noseY-2),n.stroke()}}}const u=Math.max(0,Math.min(1,t.blink||0))>.5&&s.eyes!=="happy"?"closed":s.eyes,p=t.look||[0,0];for(const f of[-1,1])Tc(n,128+f*o.spread,o.eyeY,o.eyeS,f,e.eyes,u,p,o.eyeTilt,o.eyeW);if(e.brows.style!=="none")for(const f of[-1,1])Ec(n,128+f*o.browSpread,o.browY-s.browLift,o.browS,f,e.brows,o.browTilt,s.brow);Ac(n,o.noseX,o.noseY,o.noseS,e.nose.style,a),go(n,o.mouthX,o.mouthY,o.mouthS,e.mouth,s.mouth,t.talk||0,l,o.mouthW),Rc(n,o,e.facial),Cc(n,o,e.glasses),n.restore()}function Tc(n,e,t,i,r,s,o,a,l,c=1){const h=s.style,u="#2b2623";if(n.save(),n.translate(e,t),n.rotate(r*l*-1),n.scale(i*c,i),n.strokeStyle=u,n.fillStyle=u,n.lineWidth=3.2,o==="wide"||o==="worry"){const _=o==="wide"?15:13,m=o==="wide"?19:16;if(n.fillStyle="#fbfaf6",n.beginPath(),n.ellipse(0,0,_,m,0,0,ot),n.fill(),n.stroke(),n.fillStyle=s.colour,n.beginPath(),n.ellipse(a[0]*3,a[1]*3,_*.58,m*.62,0,0,ot),n.fill(),n.fillStyle=u,n.beginPath(),n.ellipse(a[0]*3,a[1]*3,_*.36,m*.42,0,0,ot),n.fill(),n.fillStyle="#fff",n.beginPath(),n.arc(3,-5,3,0,ot),n.fill(),h==="lashes")for(let d=0;d<3;d++)n.beginPath(),n.moveTo(r*_*.8,-9+d*5),n.lineTo(r*(_+6),-12+d*6),n.stroke();n.restore();return}if(o==="closed"||o==="content"){n.beginPath(),n.arc(0,o==="content"?-3:-6,11,Math.PI*.18,Math.PI*.82),n.stroke(),h==="lashes"&&(n.beginPath(),n.moveTo(r*9,2),n.lineTo(r*14,5),n.stroke()),n.restore();return}if(o==="happy"){n.lineWidth=5.2,n.beginPath(),n.moveTo(-13,4),n.quadraticCurveTo(0,-21,13,4),n.stroke(),n.restore();return}const p=o==="wide"?1.3:1,f=(h==="narrow"?12:h==="dot"?6:h==="sparkle"?13:11.5)*p,g=(h==="narrow"?4.2:h==="dot"?9:h==="almond"?9.5:h==="sparkle"?15:13.5)*p;if(["round","gentle","lashes","sleepy"].includes(h)){const _=(h==="sleepy"?6:h==="gentle"?9:12)*p;if(n.save(),n.beginPath(),n.ellipse(a[0]*2,a[1]*2,9*p,_,0,0,ot),n.clip(),n.fill(),n.fillStyle=n.canvas.__skin,o==="angry"||o==="sad"){const m=o==="angry"?-r:r;n.beginPath(),n.moveTo(-14,-_-2),n.lineTo(14,-_-2),n.lineTo(m*14,1),n.closePath(),n.fill()}else o==="shy"?n.fillRect(-14,-_-2,28,_*.7):o==="smiling"&&(n.beginPath(),n.ellipse(0,_+5,15,9,0,0,ot),n.fill());if(n.restore(),["angry","sad","shy"].includes(o)||(n.fillStyle="#fbfaf6",n.beginPath(),n.arc(a[0]*2+2,-_*.35+a[1]*2,1.8,0,ot),n.fill()),h==="lashes"){n.lineWidth=2.8;for(let m=0;m<2;m++)n.beginPath(),n.moveTo(r*5,-5-m*3),n.lineTo(r*(11+m*2),-8-m*4),n.stroke()}}else if(h==="dot")n.beginPath(),n.ellipse(a[0]*2,a[1]*2,f,g,0,0,ot),n.fill(),n.fillStyle="#fff",n.beginPath(),n.arc(2+a[0]*2,-3,2.2,0,ot),n.fill();else if(h==="narrow")n.beginPath(),n.ellipse(0,0,f,g,0,0,ot),n.fill();else{n.fillStyle="#fbfaf6",n.beginPath(),h==="almond"?(n.moveTo(-f,1),n.quadraticCurveTo(-2,-g*1.5,f,-1),n.quadraticCurveTo(0,g*1.3,-f,1)):n.ellipse(0,0,f,g,0,0,ot),n.fill(),n.save(),n.clip();const _=h==="sparkle"?10:7.4,m=a[0]*4,d=a[1]*3+(h==="gentle"?3:1);if(n.fillStyle=s.colour,n.beginPath(),n.arc(m,d,_,0,ot),n.fill(),n.fillStyle="#120c0a",n.beginPath(),n.arc(m,d,_*.5,0,ot),n.fill(),n.fillStyle="#fff",n.beginPath(),n.arc(m+_*.38,d-_*.4,_*.3,0,ot),n.fill(),h==="sparkle"&&(n.beginPath(),n.arc(m-_*.35,d+_*.4,_*.16,0,ot),n.fill()),n.fillStyle=n.canvas.__skin||"#e8bf98",(h==="sleepy"||o==="shy")&&n.fillRect(-f-2,-g-2,f*2+4,g*.9),o==="sad"&&(n.beginPath(),n.moveTo(-f-2,-g-2),n.lineTo(f+2,-g-2),n.lineTo(r*f+2*r,-g*.1),n.closePath(),n.fill()),o==="angry"&&(n.beginPath(),n.moveTo(-f-2,-g-2),n.lineTo(f+2,-g-2),n.lineTo(-r*f-2*r,-g*.05),n.closePath(),n.fill()),n.restore(),n.lineWidth=2.4,n.beginPath(),h==="almond"?(n.moveTo(-f,1),n.quadraticCurveTo(-2,-g*1.5,f,-1),n.stroke()):(n.ellipse(0,0,f,g,0,Math.PI*1.05,Math.PI*1.95),n.stroke()),h==="gentle"&&(n.lineWidth=3,n.beginPath(),n.arc(0,g*.3,f*1.02,Math.PI*1.12,Math.PI*1.88),n.stroke()),h==="lashes"){n.lineWidth=2.2;for(let v=0;v<3;v++){const M=-Math.PI/2+r*(.55+v*.28);n.beginPath(),n.moveTo(Math.cos(M)*f*.95,Math.sin(M)*g*.95),n.lineTo(Math.cos(M)*(f+6),Math.sin(M)*(g+5)),n.stroke()}}}o==="sad"&&(n.strokeStyle="rgba(120,180,230,.7)",n.lineWidth=2.2,n.beginPath(),n.moveTo(r*-4,g),n.lineTo(r*-5,g+8),n.stroke()),n.restore()}function Ec(n,e,t,i,r,s,o,a){n.save(),n.translate(e,t),n.scale(i,i),n.rotate(r*(o*-1+a*.48));const l=bi(s.colour,.68);n.strokeStyle=l,n.fillStyle=l,n.lineCap="round";const c=s.style,h=c==="thick"||c==="bushy"?7:c==="thin"?2.4:4.2;if(n.lineWidth=h,n.beginPath(),c==="arched")n.moveTo(-13,3),n.quadraticCurveTo(0,-7,13,2);else if(c==="worried")n.moveTo(-13,-3),n.quadraticCurveTo(0,0,13,3);else if(c==="bushy"){n.moveTo(-14,2),n.quadraticCurveTo(0,-5,14,1),n.stroke(),n.lineWidth=2;for(let u=-12;u<=12;u+=4)n.beginPath(),n.moveTo(u,-2),n.lineTo(u+2*r,-7),n.stroke();n.restore();return}else n.moveTo(-13,1),n.quadraticCurveTo(0,-3,13,1);n.stroke(),n.restore()}function Ac(n,e,t,i,r,s,o){if(n.save(),n.translate(e,t),n.scale(i,i),n.strokeStyle=bi(s,.62),n.fillStyle=bi(s,.8),n.lineWidth=2.4,r==="button")n.beginPath(),n.ellipse(0,0,7,5.5,0,0,ot),n.fill(),n.fillStyle="rgba(255,255,255,.35)",n.beginPath(),n.arc(-2,-2,2,0,ot),n.fill();else if(r==="dot"){n.fillStyle=bi(s,.6);for(const a of[-3,3])n.beginPath(),n.arc(a,0,1.6,0,ot),n.fill()}else r==="line"?(n.beginPath(),n.moveTo(1,-12),n.quadraticCurveTo(-2,0,3,4),n.lineTo(-3,4),n.stroke()):r==="wide"?(n.beginPath(),n.moveTo(-10,-2),n.quadraticCurveTo(-11,6,-3,5),n.moveTo(10,-2),n.quadraticCurveTo(11,6,3,5),n.stroke(),n.beginPath(),n.ellipse(0,1,6,4,0,0,ot),n.fill()):r==="hook"&&(n.beginPath(),n.moveTo(-1,-16),n.quadraticCurveTo(8,2,1,6),n.lineTo(-4,4),n.stroke());n.restore()}function go(n,e,t,i,r,s,o,a,l=1){n.save(),n.translate(e,t),n.scale(i*l,i);const c=r.colour,h=!Z0.includes(c.toLowerCase());n.strokeStyle=h?c:a,n.lineWidth=h?3.6:3.4,n.lineCap="round";const u="#2b2623",p="#e07a80",f="#fbfaf6",g=(m,d,v=0)=>{n.fillStyle=u,n.beginPath(),n.moveTo(-m,0),n.quadraticCurveTo(0,-v,m,0),n.quadraticCurveTo(0,d*2,-m,0),n.fill(),n.save(),n.clip(),n.fillStyle=f,n.fillRect(-m,-d,m*2,d*.55+v*.2),n.fillStyle=p,n.beginPath(),n.ellipse(0,d*1.3,m*.55,d*.55,0,0,ot),n.fill(),n.restore(),n.beginPath(),n.moveTo(-m,0),n.quadraticCurveTo(0,-v,m,0),n.quadraticCurveTo(0,d*2,-m,0),n.stroke()},_=o>.5?"talk":s||r.style;switch(n.beginPath(),_){case"talk":{const m=["grin","laugh","o"].includes(s);g(m?19:12,(m?13:7)+o*3,m?6:2);break}case"grin":g(24,15,5);break;case"laugh":g(28,23,7);break;case"o":n.fillStyle=u,n.ellipse(0,3,13,20,0,0,ot),n.fill(),n.stroke();break;case"frown":n.arc(0,12,13,Math.PI*1.2,Math.PI*1.8),n.stroke();break;case"snarl":n.moveTo(-12,4),n.lineTo(-4,0),n.lineTo(4,0),n.lineTo(12,4),n.stroke();break;case"wobble":n.moveTo(-14,1),n.quadraticCurveTo(0,5,14,1),n.moveTo(-14,-4),n.quadraticCurveTo(-10,1,-14,7),n.moveTo(14,-4),n.quadraticCurveTo(10,1,14,7),n.stroke();break;case"hmm":n.moveTo(-8,2),n.lineTo(8,-1),n.stroke();break;case"smile":n.moveTo(-16,-1),n.quadraticCurveTo(0,15,16,-1),n.stroke();break;case"flat":n.moveTo(-11,1),n.lineTo(11,1),n.stroke();break;case"small":n.arc(0,-3,6,Math.PI*.25,Math.PI*.75),n.stroke();break;case"wide":n.arc(0,-10,18,Math.PI*.22,Math.PI*.78),n.stroke();break;case"smirk":n.moveTo(-10,2),n.quadraticCurveTo(2,4,11,-4),n.stroke();break;case"pout":n.fillStyle=c,n.ellipse(0,1,6,4.5,0,0,ot),n.fill();break;default:n.arc(0,-8,13,Math.PI*.2,Math.PI*.8),n.stroke()}h&&["smile","small","wide","flat","smirk","wobble"].includes(_)&&(n.fillStyle=c,n.globalAlpha=.85,n.beginPath(),n.ellipse(0,2,_==="wide"?13:9,3.2,0,0,ot),n.fill(),n.globalAlpha=1),n.restore()}function Rc(n,e,t){if(t.style==="none")return;n.save(),n.fillStyle=t.colour,n.strokeStyle=t.colour;const i=(e.noseY+e.mouthY)/2+2;if(t.style==="moustache")n.beginPath(),n.moveTo(128,i-3),n.quadraticCurveTo(114,i-6,108,i+3),n.quadraticCurveTo(118,i+1,128,i+2),n.quadraticCurveTo(138,i+1,148,i+3),n.quadraticCurveTo(142,i-6,128,i-3),n.fill();else if(t.style==="walrus")n.beginPath(),n.ellipse(128,i+1,24,8,0,0,ot),n.fill();else if(t.style==="stubble"){n.globalAlpha=.35;for(let r=0;r<140;r++){const s=Math.PI*(.1+.8*(r%47)/46),o=46+r*7%11,a=128+Math.cos(s)*o*.95,l=e.mouthY-26+Math.sin(s)*o*.8;l>e.noseY+8&&n.fillRect(a,l,1.6,1.6)}n.globalAlpha=1}else t.style==="beard"?(n.beginPath(),n.moveTo(84,e.noseY),n.quadraticCurveTo(90,e.mouthY+40,128,e.mouthY+42),n.quadraticCurveTo(166,e.mouthY+40,172,e.noseY),n.lineTo(160,e.noseY+4),n.quadraticCurveTo(150,e.mouthY+18,128,e.mouthY+16),n.quadraticCurveTo(106,e.mouthY+18,96,e.noseY+4),n.closePath(),n.fill()):t.style==="goatee"&&(n.beginPath(),n.ellipse(128,e.mouthY+18,9,11,0,0,ot),n.fill());n.restore()}function Cc(n,e,t){if(t.style==="none")return;n.save(),n.strokeStyle=t.colour,n.lineWidth=3.2;const i=15*e.eyeS+2,r=e.eyeY,s=i*e.eyeW;for(const o of[-1,1]){const a=128+o*e.spread;n.beginPath(),t.style==="round"?n.ellipse(a,r,s,i,0,0,ot):t.style==="half"?n.ellipse(a,r-2,s,i,0,Math.PI*.05,Math.PI*.95):n.roundRect?n.roundRect(a-s*1.1,r-i*.8,s*2.2,i*1.6,6):n.rect(a-s*1.1,r-i*.8,s*2.2,i*1.6),t.style==="sun"&&(n.fillStyle="rgba(30,34,40,.9)",n.fill()),n.stroke(),t.style!=="sun"&&(n.save(),n.strokeStyle="rgba(255,255,255,.55)",n.lineWidth=2,n.beginPath(),n.moveTo(a+i*.3,r-i*.55),n.lineTo(a+i*.6,r-i*.25),n.stroke(),n.restore())}n.beginPath(),n.moveTo(128-e.spread+s*(t.style==="round"||t.style==="half"?1:1.1),r-2),n.quadraticCurveTo(128,r-8,128+e.spread-s*(t.style==="round"||t.style==="half"?1:1.1),r-2),n.stroke(),n.restore()}function ty(n,e,t,i=n.canvas.width){const r=e.body.skin,s="#2b2623",o={...e,eyes:{...e.eyes,height:.5,spacing:.5,size:.5,tilt:.5},brows:{...e.brows,height:.5,spacing:.5,size:.5,tilt:.5},nose:{...e.nose,height:.5,x:.5,size:.5},mouth:{...e.mouth,height:.5,x:.5,size:.5,width:.5}},a=fs(o),l={eyes:[128,a.eyeY,1.75],glasses:[128,a.eyeY,1.6],brows:[128,a.browY,2],nose:[128,a.noseY,3.4],mouth:[128,a.mouthY+2,2.7],facial:[128,(a.noseY+a.mouthY)/2+(e.facial.style==="beard"?18:e.facial.style==="goatee"?14:2),e.facial.style==="beard"?1.5:2.2]}[t]||[128,128,1],c=i/256;if(n.save(),n.setTransform(c,0,0,c,0,0),n.canvas.__skin=r,n.fillStyle=r,n.fillRect(0,0,256,256),n.translate(128,128),n.scale(l[2],l[2]),n.translate(-l[0],-l[1]),n.lineCap="round",n.lineJoin="round",t==="eyes"||t==="glasses")for(const u of[-1,1])Tc(n,128+u*a.spread,a.eyeY,a.eyeS,u,o.eyes,"open",[0,0],a.eyeTilt,a.eyeW);if(t==="brows"&&e.brows.style!=="none")for(const u of[-1,1])Ec(n,128+u*a.browSpread,a.browY,a.browS,u,o.brows,a.browTilt,0);t==="nose"&&Ac(n,a.noseX,a.noseY,a.noseS,e.nose.style,r),t==="mouth"&&go(n,a.mouthX,a.mouthY,a.mouthS,o.mouth,null,0,s,a.mouthW),t==="facial"&&(go(n,a.mouthX,a.mouthY,a.mouthS,{...o.mouth,style:"flat"},null,0,"rgba(43,38,35,.35)",a.mouthW),Rc(n,a,e.facial)),t==="glasses"&&Cc(n,a,e.glasses),n.restore(),(t==="brows"&&e.brows.style==="none"||t==="nose"&&e.nose.style==="none"||t==="glasses"&&e.glasses.style==="none"||t==="facial"&&e.facial.style==="none")&&(n.save(),n.strokeStyle="rgba(43,38,35,.25)",n.lineWidth=i*.04,n.lineCap="round",n.beginPath(),n.moveTo(i*.3,i*.7),n.lineTo(i*.7,i*.3),n.stroke(),n.restore())}function Q0(n,e=2){return n.userData.worldTextureScale=e,n.onBeforeCompile=t=>{t.uniforms.townTileMetres={value:e},t.vertexShader=`uniform float townTileMetres;
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
      #endif`)},n.customProgramCacheKey=()=>"town-world-uv-v1",n}const El={2:[96,255],3:[92,178,255],4:[80,142,202,255],soft:[180,255],soft3:[172,214,255]},Qs=new Map;function eg(n=3){if(Qs.has(n))return Qs.get(n);const e=El[n]||El[3],t=new Uint8Array(e.length*4);for(let r=0;r<e.length;r++)t[r*4]=t[r*4+1]=t[r*4+2]=e[r],t[r*4+3]=255;const i=new as(t,e.length,1,1023);return i.minFilter=i.magFilter=1003,i.generateMipmaps=!1,i.needsUpdate=!0,Qs.set(n,i),i}const Pc="lights_toon_pars_fragment",Al="vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;",tg=`
	vec3 celBand = getGradientIrradiance( geometryNormal, directLight.direction );
	vec3 irradiance = celBand * mix( uShadowTint, vec3( 1.0 ), celBand ) * directLight.color;`;let _o="";{const n=He[Pc];n.includes(Al)&&(_o=`uniform vec3 uShadowTint;
`+n.replace(Al,tg))}const Lc="map_fragment",Rl="diffuseColor *= sampledDiffuseColor;",ng=`diffuseColor.rgb *= mix( vec3( 1.0 ), sampledDiffuseColor.rgb, uFlatten );
	diffuseColor.a *= sampledDiffuseColor.a;`,ig=`uniform float uFlatten;
`;let yo="";{const n=He[Lc];n.includes(Rl)&&(yo=n.replace(Rl,ng))}const rg=.65;function sg(n){return!!(n.normalMap||n.roughnessMap||n.bumpMap||n.aoMap)}function og(n,e,t=1,{base:i=null,baseKey:r=""}={}){const s=!!_o,o=!!yo&&t<1&&!!n.map;if(!s&&!o&&!i)return n;const a={value:new Ie(e)},l={value:t};n.userData.shadowTint=a,n.userData.flatten=l,n.onBeforeCompile=(h,u)=>{i?.(h,u),s&&(h.uniforms.uShadowTint=a,h.fragmentShader=h.fragmentShader.replace("#include <"+Pc+">",_o)),o&&(h.uniforms.uFlatten=l,h.fragmentShader=ig+h.fragmentShader.replace("#include <"+Lc+">",yo))};const c=new Ie(e).getHexString();return n.customProgramCacheKey=()=>"cel_"+c+"_"+(o?t:1)+"_"+r,n}const Ic=7102348,ag=.66;function lg(n){return n?n.r*.2126+n.g*.7152+n.b*.0722:0}function cg(n){return lg(n.color)>=ag?"soft3":3}function hg(n,{skinned:e=!1}={}){return e?!0:n.userData?.keepPhysical!==!0?!1:n.userData.keepPhysicalStrict===!0?!0:!!n.transparent&&(n.opacity??1)<.95}const ug=.3,eo=new WeakMap;function ps(n,{tint:e=Ic,bands:t=null}={}){if(eo.has(n))return eo.get(n);const i=new g0({color:n.color?n.color.clone():new Ie(16777215),map:n.map||null,alphaMap:n.alphaMap||null,gradientMap:eg(t??cg(n)),transparent:n.transparent,opacity:n.opacity,side:n.side,alphaTest:n.alphaTest,fog:n.fog,vertexColors:n.vertexColors,emissive:n.emissive?n.emissive.clone():new Ie(0),emissiveMap:n.emissiveMap||null,emissiveIntensity:n.emissiveIntensity??1});i.depthWrite=n.depthWrite,i.depthTest=n.depthTest,i.polygonOffset=n.polygonOffset,i.polygonOffsetFactor=n.polygonOffsetFactor,i.polygonOffsetUnits=n.polygonOffsetUnits,i.name=n.name,i.userData={...n.userData,celFrom:n};const r=n.userData?.worldTextureScale;Number.isFinite(r)&&Q0(i,r);const s=typeof i.onBeforeCompile=="function"?i.onBeforeCompile:null,o=Number.isFinite(r)?"worlduv"+r:"",a=n.userData?.keepPhysical===!0;return og(i,e,sg(n)?a?ug:rg:1,{base:s,baseKey:o}),eo.set(n,i),dg(n,i),i}function dg(n,e){n.emissive&&n.emissive.isColor&&(e.emissive=n.emissive);for(const t of["emissiveIntensity","opacity","visible"]){let i=n[t];try{Object.defineProperty(n,t,{configurable:!0,enumerable:!0,get(){return i},set(r){i=r,e[t]=r,t==="opacity"&&(e.needsUpdate=e.needsUpdate)}})}catch{}}}function fg(n,e){return!n||n.isMeshToonMaterial||!n.isMeshStandardMaterial&&!n.isMeshPhongMaterial&&!n.isMeshLambertMaterial?!0:hg(n,{skinned:e})}function ny(n,{tint:e=Ic,seen:t=null,force:i=!1,collect:r=null}={}){const s={converted:0,skipped:0,visited:0};return n&&n.traverse(o=>{if(!o.isMesh&&!o.isPoints&&!o.isLine)return;if(!i&&t){if(t.has(o))return;t.add(o)}s.visited++;const a=!!o.isSkinnedMesh,l=c=>{if(fg(c,a))return s.skipped++,c;s.converted++;const h=ps(c,{tint:e});return r&&h.userData.flatten&&r.add(h.userData.flatten),h};o.material=Array.isArray(o.material)?o.material.map(l):l(o.material)}),s}const vo=Object.freeze(["root","hips","spine","chest","neck","head","shoulderL","elbowL","handL","shoulderR","elbowR","handR","thighL","kneeL","footL","thighR","kneeR","footR"]),Cl=Object.fromEntries(vo.map((n,e)=>[n,e])),Pl=Object.freeze({child:{base:1.12,span:.2,head:1.4},teen:{base:1.4,span:.28,head:1.18},adult:{base:1.36,span:.44,head:1.12},elder:{base:1.33,span:.34,head:1.14}});function Yo(n){const e=Wt(n),t=Pl[e.age]||Pl.adult,i=t.base+e.body.height*t.span,r=i/1.6,s=e.body.build,o=W0(e.head),a=(.19+e.head.size*.055)*r*t.head,l=o.width,c=o.height,h=.055*r,u=i-a*2*c-h,p=u*.47,f=u-p,g=.07*r,_=(p-g)*.5,m=_,d=(.058+s*.024)*r,v=(.045+s*.016)*r,M=e.body.silhouette==="feminine",x=e.body.silhouette==="masculine",D=(.3+s*.15)*r*(M?.94:x?1.08:1),R=(.2+s*.09)*r,A=D*(M?1.13:x?.9:1),w=M?.79:x?.98:.96,S=.22*r,b=.2*r,y=.056*r,L=p,U=L+f*.5,k=L+f,j=k+h;return{H:i,k:r,Rh:a,headSX:l,headSY:c,profile:o,neck:h,torso:f,leg:p,foot:g,thigh:_,shin:m,legR:d,armR:v,width:D,hips:A,waistRatio:w,depth:R,upper:S,fore:b,hand:y,hipY:L,chestY:U,neckY:k,headY:j,headCentre:j+a*c*.94,shoulderX:D/2-v*.2,shoulderY:k-.075*r,hipX:A*.24,seatDrop:d*.95}}function pg(n){return{root:[0,0,0],hips:[0,n.hipY,0],spine:[0,n.hipY+n.torso*.25,0],chest:[0,n.chestY,0],neck:[0,n.neckY,0],head:[0,n.headY,0],shoulderL:[n.shoulderX,n.shoulderY,0],elbowL:[n.shoulderX+.01,n.shoulderY-n.upper,0],handL:[n.shoulderX+.015,n.shoulderY-n.upper-n.fore,0],shoulderR:[-n.shoulderX,n.shoulderY,0],elbowR:[-n.shoulderX-.01,n.shoulderY-n.upper,0],handR:[-n.shoulderX-.015,n.shoulderY-n.upper-n.fore,0],thighL:[n.hipX,n.hipY,0],kneeL:[n.hipX,n.hipY-n.thigh,0],footL:[n.hipX,n.foot,0],thighR:[-n.hipX,n.hipY,0],kneeR:[-n.hipX,n.hipY-n.thigh,0],footR:[-n.hipX,n.foot,0]}}const mg={hips:"root",spine:"hips",chest:"spine",neck:"chest",head:"neck",shoulderL:"chest",elbowL:"shoulderL",handL:"elbowL",shoulderR:"chest",elbowR:"shoulderR",handR:"elbowR",thighL:"hips",kneeL:"thighL",footL:"kneeL",thighR:"hips",kneeR:"thighR",footR:"kneeR"},qi=new Ie,Ll=(()=>{const n=new Oo;for(let t=0;t<=40;t++){const i=t/40*Math.PI*2,r=.55+.45*Math.abs(Math.cos(i*2.5)),s=Math.cos(i)*r,o=Math.sin(i)*r;t?n.lineTo(s,o):n.moveTo(s,o)}const e=new Bo(n);return e.userData.keep=!0,e})(),Il=(()=>{const n=new ls(1,10);return n.userData.keep=!0,n})();function pi(n,e){for(let t=1;t<n.length;t++){const[i,r]=n[t-1],[s,o]=n[t];if(e<=o)return i+(s-i)*((e-r)/(o-r||1))}return n.at(-1)[0]}function Ee(n,e,t,i,r){let s=e.index?e.toNonIndexed():e.clone();for(const _ of Object.keys(s.attributes))["position","normal"].includes(_)||s.deleteAttribute(_);r&&s.applyMatrix4(r);const o=s.attributes.position.count,a=new Float32Array(o*3),l=new Uint16Array(o*4),c=new Float32Array(o*4),h=typeof i=="function"?i:null,u=typeof t=="function"?t:null;h||qi.set(i);const p=new P,f=new P,g=new P;for(let _=0;_<o;_++){if(h&&_%3===0){const v=s.attributes.position;p.fromBufferAttribute(v,_),f.fromBufferAttribute(v,_+1),g.fromBufferAttribute(v,_+2),p.add(f).add(g).multiplyScalar(1/3),qi.set(h(p))}if(a[_*3]=qi.r,a[_*3+1]=qi.g,a[_*3+2]=qi.b,!u){l[_*4]=Cl[t],c[_*4]=1;continue}p.fromBufferAttribute(s.attributes.position,_);const m=u(p).filter(([,v])=>v>.001).slice(0,4),d=m.reduce((v,[,M])=>v+M,0)||1;m.forEach(([v,M],x)=>{l[_*4+x]=Cl[v],c[_*4+x]=M/d})}return s.setAttribute("color",new Nt(a,3)),s.setAttribute("skinIndex",new Po(l,4)),s.setAttribute("skinWeight",new Nt(c,4)),n.push(s),e!==s&&!e.userData?.keep&&e.dispose?.(),s}const Ne=(n=0,e=0,t=0,i=0,r=0,s=0,o=1,a=1,l=1)=>new Ve().compose(new P(n,e,t),new _t().setFromEuler(new nn(i,r,s)),new P(o,a,l));function Hn(n,e,t,i,r,s,o=10){const a=new P(...e),l=new P(...t),c=l.clone().sub(a),h=c.length(),u=new Fo(i,Math.max(.001,h),3,o),p=new _t().setFromUnitVectors(new P(0,1,0),c.normalize());Ee(n,u,r,s,new Ve().compose(a.clone().add(l).multiplyScalar(.5),p,new P(1,1,1)))}function zn(n,e,t,i,r,s,{bone:o,joints:a=[],root:l=null,soft:c=.13,segments:h=14}={}){const u=new P(...e),p=new P(...t),f=p.clone().sub(u),g=f.length(),_=f.clone().normalize(),m=[],d=5,v=12;for(let w=0;w<=d;w++){const S=-Math.PI/2+w/d*Math.PI/2;m.push(new re(Math.cos(S)*i,-g/2+Math.sin(S)*i))}for(let w=1;w<v;w++)m.push(new re(i,-g/2+w/v*g));for(let w=0;w<=d;w++){const S=w/d*Math.PI/2;m.push(new re(Math.cos(S)*i,g/2+Math.sin(S)*i))}m[0].x=m.at(-1).x=0;const M=new Ti(m,h),x=M.attributes.position;for(let w=0;w<x.count;w++){const S=x.getY(w),b=ke.clamp(.5-S/g,0,1),y=ke.lerp(i,r,b)/i;x.setXYZ(w,x.getX(w)*y,S+(S>g/2?0:S<-g/2?(S+g/2)*(y-1):0),x.getZ(w)*y)}const D=new _t().setFromUnitVectors(new P(0,-1,0),_),R=new P;Ee(n,M,w=>{const S=R.copy(w).sub(u).dot(_)/g;let b=[[o,1]];for(const[y,L,U]of a){const k=ke.smoothstep(S,y-c,y+c);b=b.flatMap(([j,z])=>j===L?[[L,z*(1-k)],[U,z*k]]:[[j,z]])}if(l){const y=l[1]*(1-ke.smoothstep(S,-.04,l[2]??.2));b=b.map(([L,U])=>[L,U*(1-y)]),b.push([l[0],y])}return b},s,new Ve().compose(u.clone().add(p).multiplyScalar(.5),D,new P(1,1,1)))}const Ge=(n,e,t,i,r,s=[1,1,1],o=12,a=8)=>Ee(n,new xt(e,o,a),i,r,Ne(t[0],t[1],t[2],0,0,0,...s)),Dc=Object.freeze({crop:{front:.46,side:.02,back:-.5,radius:1.07,faceHalf:.78},sidepart:{front:.4,swoop:.28,side:0,back:-.5,radius:1.08,faceHalf:.78},bob:{front:.24,side:-.62,back:-.66,radius:1.12,faceHalf:.64},long:{front:.3,side:-.62,back:-.7,radius:1.11,faceHalf:.64},ponytail:{front:.44,side:.02,back:-.25,radius:1.08,faceHalf:.78},braids:{front:.4,swoop:.26,side:-.12,back:-.6,radius:1.08,faceHalf:.74},bun:{front:.46,side:.02,back:-.32,radius:1.07,faceHalf:.78},spiky:{front:.5,side:.05,back:-.34,radius:1.08,faceHalf:.78},perm:{front:.42,side:-.12,back:-.44,radius:1.15,faceHalf:.74,bumps:!0},buzz:{front:.52,side:.06,back:-.36,radius:1.025,faceHalf:.8},afro:{front:.48,side:-.12,back:-.5,radius:1.34,faceHalf:.74,lift:.18},horseshoe:{ring:!0,radius:1.03},bald:null});function gg(n,e){const t=Dc[n];if(!t)return null;if(t.ring)return _g(t);const i=new xt(1,64,44),r=i.attributes.position,s=new P,o=e?-1:1;for(let a=0;a<r.count;a++){s.fromBufferAttribute(r,a);let l=t.front;t.swoop&&(l-=t.swoop*ke.smoothstep(s.x*o,-.3,.5));const c=Math.max(.18-s.z,Math.abs(s.x)-t.faceHalf,s.y-l),h=ke.lerp(t.side,t.back,ke.smoothstep(-s.z,-.2,.7)),u=Math.min(c,s.y-h),p=u>0,f=t.radius*(1+(t.lift&&s.y>0?s.y*t.lift:0)),g=t.radius<1.04?.985:.8,_=ke.lerp(g,f,ke.smoothstep(u,-.035,.035));r.setXYZ(a,s.x*_,s.y*_+(t.lift&&p?t.lift*.25:0),s.z*_)}return i.computeVertexNormals(),i}function _g(n){const i=new xt(n.radius,48,8,Math.PI/2+.95,Math.PI*2-1.9,.1,1),r=i.attributes.position,s=i.attributes.uv;for(let o=0;o<r.count;o++){const a=o%49/48,l=Math.PI/2+.95+a*(Math.PI*2-.95*2),c=ke.smoothstep(-Math.sin(l),-.3,1),h=(1-Math.abs(Math.sin(a*Math.PI*11)))*.09*c,u=Math.acos(.06+c*.5)+h,p=Math.acos(-.42-c*.12),f=u+(1-s.getY(o))*(p-u),g=ke.smoothstep(Math.min(a,1-a),0,.08),_=ke.lerp(p-.12,f,.35+.65*g);r.setXYZ(o,-Math.cos(l)*Math.sin(_)*n.radius,Math.cos(_)*n.radius,Math.sin(l)*Math.sin(_)*n.radius)}return i.computeVertexNormals(),i}function to(n,e,t){const i=n.length,r=e.hair.colour,s=e.hair.style,o=e.hair.flip?-1:1,a=t.Rh,l=0,c=t.headCentre-t.headY,h=[t.headSX*a,t.headSY*a,a*.98],u=(g,_,m)=>[g,t.headY+_,m],p=gg(s,e.hair.flip);if(p){const g=p.attributes.position,_=new P;for(let m=0;m<g.count;m++)_.fromBufferAttribute(g,m),or(_,t.profile),g.setXYZ(m,_.x,_.y,_.z);p.computeVertexNormals(),Ee(n,p,"head",r,Ne(l,t.headY+c,0,0,0,0,...h))}const f=new Ie(r).multiplyScalar(.82).getStyle();if(s==="long"&&Ge(n,a*.95,u(0,c-a*.72,-a*.55),"head",r,[1.05,1.25,.5]),s==="ponytail"&&(Ge(n,a*.34,u(0,c+a*.1,-a*1.05),"head",r,[1,1,1]),Ge(n,a*.3,u(0,c-a*.45,-a*1.18),"head",r,[.9,1.9,.9]),Ge(n,a*.16,u(0,c+a*.1,-a*1.2),"head",e.outfit.accent)),s==="bun"&&Ge(n,a*.42,u(0,c+a*.95,-a*.3),"head",r),s==="spiky")for(let g=0;g<9;g++){const _=g/9*Math.PI*2,m=Math.cos(_)*a*.55,d=Math.sin(_)*a*.5-a*.1,v=new vi(a*.2,a*.5,6);Ee(n,v,"head",r,Ne(m,t.headY+c+a*.88,d,Math.sin(_)*.5,0,-Math.cos(_)*.5))}if(s==="perm")for(let g=0;g<22;g++){const _=g*2.39996,m=.2+.75*(g*.618%1),d=Math.sqrt(1-m*m),v=Math.cos(_)*d,M=Math.sin(_)*d;M>.35&&m<.55||Ge(n,a*.24,u(v*a*1.1*t.headSX,c+m*a*1.1,M*a*1.05),"head",g%3?r:f,[1,1,1],8,6)}if(s==="braids")for(const g of[-1,1]){const _=g*a*.8,m=-a*.35;let d=c-a*.35;for(let v=0;v<6;v++){const M=a*(.2-v*.012);Ge(n,M,u(_+g*a*.05,d,m+a*.05*v),"head",v%2?r:f,[1,1.3,1],8,6),d-=M*1.5}Ge(n,a*.13,u(_+g*a*.05,d+a*.05,m+a*.3),"head",e.outfit.accent,[1.2,.7,1.2],8,6),Ge(n,a*.12,u(_+g*a*.05,d-a*.12,m+a*.3),"head",r,[1,1.4,1],8,6)}if((s==="sidepart"||s==="braids")&&Ge(n,a*.34,u(o*a*.5,c+a*.62,a*.62),"head",r,[1.4,.55,.7],10,6),(s==="bob"||s==="long")&&Ge(n,a*.4,u(0,c+a*.52,a*.72),"head",r,[2,.5,.6],10,6),!["none","headband","ribbon"].includes(e.outfit.hat))for(const g of n.slice(i)){const _=g.attributes.position;g.userData.hatHair={position:_.array.slice(),normal:g.attributes.normal.array.slice()};for(let m=0;m<_.count;m++){const d=_.getX(m)/h[0],v=(_.getY(m)-t.headCentre)/h[1],M=_.getZ(m)/h[2],x=Math.hypot(d,v,M);if(v>.3&&x>1.035){const D=1.035/x;_.setXYZ(m,d*D*h[0],t.headCentre+v*D*h[1],M*D*h[2])}}g.computeVertexNormals()}}function yg(n,e){const t=Dc[n],i=56,r=new xt(1,i,1,0,Math.PI*2,.5,.5),s=r.attributes.position,o=r.attributes.uv,a=new P;let l=[0,.4,-1];for(let c=0;c<s.count;c++){const h=c%(i+1)/i,u=h*Math.PI*2,p=Math.sin(u),f=Math.cos(u),g=ke.smoothstep(-f,-.2,1),_=.3+g*.14,m=_+(o.getY(c)-.5)*.14,d=Math.sqrt(1-m*m);a.set(p*d,m,f*d);let v=1.035;if(t&&!t.ring){const M=Math.max(.18-a.z,Math.abs(a.x)-t.faceHalf,a.y-t.front),x=ke.lerp(t.side,t.back,ke.smoothstep(-a.z,-.2,.7)),D=Math.min(M,a.y-x),R=t.radius*(1+(t.lift&&a.y>0?a.y*t.lift:0))+.03;v=ke.lerp(1.035,Math.max(1.035,R),ke.smoothstep(D,-.06,.06))}else t?.ring&&g>.3&&(v=t.radius+.03);a.multiplyScalar(v),or(a,e),s.setXYZ(c,a.x,a.y,a.z),Math.abs(h-.5)<1e-6&&o.getY(c)>.5&&(l=[0,a.y-.07,a.z])}return r.computeVertexNormals(),{geometry:r,knot:l}}function vg(n,e=Yo(n)){return{brimY:e.headCentre+e.Rh*e.headSY*.55,crownHeight:e.Rh*e.headSY*.8}}function Nc(n,e,t){const i=e.outfit.hat,r=e.outfit.hatColour,s=t.Rh;if(t.headCentre+s*t.headSY*.2,i==="none")return;const o=[t.headSX*s,t.headSY*s,s];if(i==="cap"||i==="police"||i==="captain"){const a=new xt(1.1,24,12,0,Math.PI*2,0,Math.PI*.5);Ee(n,a,"head",r,Ne(0,t.headCentre+s*t.headSY*.23,0,-.08,0,0,o[0],o[1]*(i==="cap"?.9:1.05),o[2])),Ge(n,s*.68,[0,t.headCentre+s*t.headSY*.25,s*.9],"head",i==="cap"?r:"#1c1c24",[t.headSX*1.4,.07,1],20,8),i!=="cap"&&(Ee(n,new Ke(s*1.12,s*1.12,s*.14,24,1,!0),"head",i==="captain"?"#1c1c24":"#e0b93a",Ne(0,t.headCentre+s*.26,0,-.08)),Ge(n,s*.1,[0,t.headCentre+s*.62,s*1.02],"head","#e0b93a",[1,1,.4],8,6))}else if(i==="helmet")Ee(n,new xt(1.16,24,12,0,Math.PI*2,0,Math.PI*.52),"head",r,Ne(0,t.headCentre+s*t.headSY*.35,0,0,0,0,o[0],o[1]*.9,o[2])),Ee(n,new tn(1.16,.045,6,24),"head",r,Ne(0,t.headCentre+s*t.headSY*.35,0,Math.PI/2,0,0,o[0],o[2],o[1]));else if(i==="straw"){const a=vg(e,t),l=a.brimY;Ee(n,new $r(s*.98,s*2.1,32),"head",r,Ne(0,l,0,-Math.PI/2,0,0,t.headSX,1,1)),Ee(n,new $r(s*.98,s*2.1,32),"head",r,Ne(0,l-.012*t.k,0,Math.PI/2,0,0,t.headSX,1,1)),Ee(n,new Ke(s*.78,s*1.08,a.crownHeight,24,1,!0),"head",r,Ne(0,l+a.crownHeight/2,0,0,0,0,t.headSX,1,1)),Ee(n,new ls(s*.78,24),"head",r,Ne(0,l+a.crownHeight,0,-Math.PI/2,0,0,t.headSX,1,1)),Ee(n,new Ke(s*1.045,s*1.09,s*.12*t.headSY,24,1,!0),"head","#d8342c",Ne(0,l+s*.06*t.headSY,0,0,0,0,t.headSX,1,1))}else if(i==="beanie")Ee(n,new xt(1.17,20,12,0,Math.PI*2,0,Math.PI*.49),"head",r,Ne(0,t.headCentre+s*.12,0,0,0,0,...o)),Ee(n,new tn(1.14,.09,6,24),"head",r,Ne(0,t.headCentre+s*.18,0,Math.PI/2,0,0,o[0],o[2],o[1])),Ge(n,s*.22,[0,t.headCentre+s*t.headSY*1.32,0],"head",r,[1,1,1],10,8);else if(i==="beret")Ge(n,s,[s*.15,t.headCentre+s*t.headSY*.83,0],"head",r,[t.headSX*1.35,.38,1.25],20,12),Ee(n,new Ke(s*.055,s*.055,s*.15,6),"head",r,Ne(s*.15,t.headCentre+s*t.headSY*1.2,0));else if(i==="bucket"){const a=t.headCentre+s*t.headSY*.88;Ee(n,new Ke(s*.93,s*1.13,s*.62,20),"head",r,Ne(0,a,0,0,0,0,t.headSX,1,1)),Ee(n,new Ke(s*1.12,s*1.5,s*.16,24,1,!0),"head",r,Ne(0,a-s*.33,0,0,0,0,t.headSX,1,1))}else if(["squid","teapot","sunflower","paperboat","mountain"].includes(i)){Ee(n,new xt(1.16,24,12,0,Math.PI*2,0,Math.PI*.49),"head",r,Ne(0,t.headCentre+s*t.headSY*.35,0,0,0,0,o[0],o[1]*.86,o[2]));const a=t.headCentre+s*t.headSY*1.16;if(i==="squid"){Ge(n,s*.6,[0,a+s*.2,0],"head",r,[1,.9,1],16,12);for(const l of[-1,1]){Ge(n,s*.12,[l*s*.25,a+s*.2,s*.53],"head","#f4f1ea",[1,1,.45],10,8),Ge(n,s*.055,[l*s*.25,a+s*.2,s*.59],"head","#27304d",[1,1,.4],8,6);for(const c of[-.45,.05])Hn(n,[l*s*.78,a-s*.18,c*s],[l*s*.96,a-s*.65,c*s],s*.1,"head",r,8)}}else if(i==="teapot")Ge(n,s*.62,[0,a+s*.14,0],"head",r,[1.15,.72,1],16,12),Ee(n,new tn(s*.38,s*.07,8,18),"head",r,Ne(-s*.66,a+s*.14,0)),Ee(n,new vi(s*.17,s*.55,12),"head",r,Ne(s*.69,a+s*.25,0,0,0,-.9)),Ge(n,s*.12,[0,a+s*.67,0],"head",e.outfit.accent,[1,.6,1],10,8);else if(i==="sunflower"){for(let l=0;l<10;l++){const c=l*Math.PI/5;Ge(n,s*.25,[Math.cos(c)*s*.45,a+s*.44+Math.sin(c)*s*.45,s*.25],"head","#f4d23c",[1,.65,.25],10,8)}Ge(n,s*.29,[0,a+s*.44,s*.31],"head","#9a6a42",[1,1,.3],12,10)}else if(i==="mountain")Ee(n,new vi(s*.75,s*.86,12),"head",r,Ne(0,a+s*.26,0)),Ee(n,new vi(s*.31,s*.38,12),"head","#f4f1ea",Ne(0,a+s*.69,0));else{for(const l of[-1,1]){const c=new yt;c.setAttribute("position",new qe([-s*1.25,a,l*s*.65,s*1.25,a,l*s*.65,0,a+s*.67,0],3)),c.computeVertexNormals(),Ee(n,c,"head","#f4f1ea")}Ee(n,new ht(s*2.45,s*.16,s*.11),"head",r,Ne(0,a-s*.02,s*.66))}}else if(i==="ribbon"){const a=s*t.headSX*.68,l=t.headCentre+s*t.headSY*.85,c=s*.52;for(const h of[-1,1])Ge(n,s*.2,[a+h*s*.16,l,c],"head",r,[1.1,.7,.45],10,8);Ge(n,s*.09,[a,l,c+s*.04],"head",r,[1,1,.7],8,6)}else if(i==="headband"){const a=yg(e.hair.style,t.profile);Ee(n,a.geometry,"head",r,Ne(0,t.headCentre,0,0,0,0,...o)),Ge(n,s*.13,[0,t.headCentre+a.knot[1]*o[1],a.knot[2]*o[2]-s*.04],"head",r,[1.5,.8,.7],8,6)}else i==="kerchief"&&(Ee(n,new xt(1.1,24,12,0,Math.PI*2,0,Math.PI*.36),"head",r,Ne(0,t.headCentre+s*.05,-s*.12,-.45,0,0,...o)),Ge(n,s*.2,[0,t.headCentre+s*.1,-s*1.1],"head",r,[1.3,.9,.9],8,6))}function iy(n,{mode:e="wall",shadows:t=!0}={}){const i=Wt(n);if(i.outfit.hat==="none")return null;const r=[];if(Nc(r,i,Yo(i)),!r.length)return null;const s=Xr(r,!1);r.forEach(c=>c.dispose());for(const c of["skinIndex","skinWeight"])s.deleteAttribute(c);s.computeBoundingBox();const o=s.boundingBox,a=o.getCenter(new P);s.translate(-a.x,e==="stand"?-o.min.y:-a.y,e==="stand"?-a.z:-o.min.z),s.computeBoundingSphere();const l=new ut(s,ps(new wt({vertexColors:!0}),{bands:"soft3"}));return l.name=(i.name||"Resident")+"’s hat",l.castShadow=t,l.receiveShadow=!0,l.userData.hatProp=!0,l}function bg(n,e,t){const i=e.accessories,r=t.Rh,s=i.colour;if(i.earrings!=="none")for(const o of[-1,1]){const a=o*r*t.headSX*1.035,l=t.headCentre-r*.21,c=r*.04;i.earrings==="studs"?Ge(n,r*.085,[a,l,c],"head",s,[1,1,.65],8,6):Ee(n,new tn(r*.16,r*.035,6,14),"head",s,Ne(a,l-r*.1,c,0,o*.5))}i.neckwear==="pendant"?(Ee(n,new tn(t.width*.3,t.k*.007,5,18),"chest",s,Ne(0,t.neckY-.035,t.depth*.05,Math.PI/2-.5)),Ge(n,t.k*.025,[0,t.neckY-.12,t.depth*.53],"chest",s,[.7,1,.35],8,6)):i.neckwear==="scarf"&&(Ee(n,new tn(t.armR*1.7,t.armR*.55,6,18),"chest",s,Ne(0,t.neckY-.035,0,Math.PI/2)),Ee(n,new ht(t.width*.22,t.torso*.5,.025),"chest",s,Ne(t.width*.14,t.neckY-t.torso*.28,t.depth*.53,0,0,-.15))),i.pin&&Ge(n,t.k*.024,[t.width*.22,t.neckY-t.torso*.28,t.depth*.52],"chest",s,[1,1,.3],8,6)}const Mg=n=>n.facial.style==="none"&&(["bob","long","ponytail","braids","bun","perm"].includes(n.hair.style)||n.mouth.colour!=="#b8544a");function no(n,e,t,i=!1){const r=e.outfit,s=e.body.skin,o=i?s:r.topColour,a=i?e.swim.colour:r.bottomColour,l=t.width,c=t.depth,h=t.hipY,u=!i&&r.top==="tank",p=!i&&r.bottom==="underwear",f=1+(e.body.build-.5)*.12,g=t.hips/l,_=[[0,-.1],[g*.86,-.08],[g,.05],[g,.13],[g,.15],[t.waistRatio*f,.3],[t.waistRatio*(1+(f-1)*.6),.5],[1,.66],[.985,.74],[.95,.8],[.88,.87],[.76,.93],[.58,.98],[.38,1.01],[.19,1.03],[0,1.04]],m=new Ti(_.map(([A,w])=>new re(A,w)),28),d=h+t.torso*(p?.05:.13),v=r.pattern==="stripes";if(Ee(n,m,"chest",A=>{if(i)return A.y<d?a:s;if(A.y<d)return a;if(u||r.top==="sundress"&&(A.y-h)/t.torso>.78)return s;if(r.top==="kariyushi"&&A.z>c*.18){const w=(A.y-h)/t.torso;if(w>.77&&Math.abs(A.x)<l*.27*Math.min(1,(w-.77)/.25))return s}return v&&Math.floor((A.y-d)/(t.torso*.12))%2?"#f4f1ea":o},Ne(0,h,0,0,0,0,l/2,t.torso,c/2)),u){const w=_.filter(([,L])=>L>=.05&&L<=.77).concat([[pi(_,.77),.77]]),S=new Ti(w.map(([L,U])=>new re(L*1.025,U)),28);Ee(n,S,"chest",o,Ne(0,h,0,0,0,0,l/2,t.torso,c/2));const b=.4,y=L=>{const U=pi(_,L)*1.025;return c/2*Math.sqrt(Math.max(0,U*U-b*b))+.004*t.k};for(const L of[-1,1]){const U=L*l/2*b,k=[.77,.9,1].map(z=>[U,h+t.torso*z,y(z)]);k.push([U,h+t.torso*1.035,0]);const j=k.concat(k.slice(0,-1).reverse().map(([z,q,N])=>[z,q,-N]));for(let z=1;z<j.length;z++)Hn(n,j[z-1],j[z],.016*t.k,"chest",o,6)}}if(i&&Mg(e)&&Ee(n,new Ke(l*.52,l*.52,t.torso*.2,16,1,!0),"chest",e.swim.colour,Ne(0,h+t.torso*.66,0,0,0,0,1,1,c/l)),Hn(n,[0,t.neckY-.02,0],[0,t.headY+.01,0],t.armR*1.2,"neck",s,8),!i&&["polo","kariyushi","smock","jacket","blouse","sailor","cardigan","festival"].includes(r.top)){const A=r.top==="kariyushi",w=A?new Ie(o).multiplyScalar(1.12).getHex():"#f4f1ea",S=b=>c/2*pi(_,(b-h)/t.torso)+.008*t.k;for(const b of[-1,1]){const y=A?[[b*.018*t.k,t.neckY-.012*t.k],[b*.125*t.k,t.neckY-.047*t.k],[b*.067*t.k,t.neckY-.17*t.k]]:[[b*.012*t.k,t.neckY-.012*t.k],[b*.085*t.k,t.neckY-.035*t.k],[b*.055*t.k,t.neckY-.115*t.k]];b>0&&y.reverse();const L=new yt;L.setAttribute("position",new qe(y.flatMap(([U,k])=>[U,k,S(k)+.004*t.k]),3)),L.computeVertexNormals(),Ee(n,L,"chest",w)}if(A){const b=new Ie(o).multiplyScalar(.86).getHex();for(const U of[.24,.4,.56,.72]){const k=h+t.torso*U;Ee(n,new ht(.024*t.k,t.torso*.16,.014*t.k),"chest",b,Ne(.007*t.k,k,S(k)+.008*t.k))}const y=h+t.torso*.62,L=l*.23;Ee(n,new ht(l*.24,t.torso*.21,.016*t.k),"chest",o,Ne(L,y,S(y)-.004*t.k)),Ee(n,new ht(l*.25,.008*t.k,.018*t.k),"chest",b,Ne(L,y+t.torso*.1,S(y)+.004*t.k))}for(const b of A?[.25,.41,.57,.73]:[.4,.56,.72]){const y=h+t.torso*b;Ge(n,(A?.009:.006)*t.k,[0,y,S(y)],"chest","#f4f1ea",[1,1,.45],8,6)}}if(!i&&["hoodie","cardigan","sailor","festival","overalls","sundress"].includes(r.top)){const A=w=>c/2*pi(_,w)+.015*t.k;if(r.top==="hoodie"){Ee(n,new xt(t.width*.35,16,12,0,Math.PI*2,0,Math.PI*.75),"chest",o,Ne(0,t.neckY-.045,-c*.32,.9,0,0,1,.7,.55));for(const w of[-.026,.026])Hn(n,[w*t.k,t.neckY-.04,A(.82)],[w*t.k,t.neckY-.2,A(.66)],.004*t.k,"chest",r.accent,5);Ee(n,new ht(l*.48,t.torso*.15,.016*t.k),"chest",new Ie(o).multiplyScalar(.85).getHex(),Ne(0,h+t.torso*.35,A(.35)))}if(r.top==="cardigan"||r.top==="festival"){for(const w of[-l*.08,l*.08])Ee(n,new ht(l*.07,t.torso*.74,.014*t.k),"chest",r.accent,Ne(w,h+t.torso*.51,A(.5)));for(let w=0;w<4;w++)Ge(n,.011*t.k,[0,h+t.torso*(.28+w*.15),A(.28+w*.15)],"chest",r.accent,[1,1,.4],8,6)}if(r.top==="sailor"){Ee(n,new ht(l*.68,t.torso*.2,.015*t.k),"chest",r.accent,Ne(0,t.neckY-.14,-c*.4));for(const w of[-1,1])Hn(n,[w*l*.2,t.neckY-.055,A(.9)],[0,t.neckY-.26,A(.62)],.016*t.k,"chest",r.accent,6);Ee(n,new ht(l*.1,t.torso*.21,.018*t.k),"chest",r.accent,Ne(0,t.neckY-.28,A(.55)))}if(r.top==="overalls"||r.top==="sundress"){const w=r.top==="overalls"?a:o;for(const y of[-1,1])Hn(n,[y*l*.25,h+t.torso*.57,A(.57)],[y*l*.25,t.neckY-.055,A(.95)],.022*t.k,"chest",w,8);const S=new wi(l*.64,t.torso*.47,8,10),b=S.attributes.position;for(let y=0;y<b.count;y++){const L=h+t.torso*.38+b.getY(y),U=b.getX(y);b.setXYZ(y,U,L,A((L-h)/t.torso)*Math.sqrt(Math.max(.1,1-(U/(l*.5))**2))+.012*t.k)}S.computeVertexNormals(),Ee(n,S,"chest",w)}}if(!i&&["lighthouse","lantern","reef"].includes(r.top)){const A=h+t.torso*.52;if(r.top==="lantern"){Ee(n,new xt(1,24,16),"chest",o,Ne(0,A,0,0,0,0,l*.63,t.torso*.55,c*.68));for(const w of[.12,.9])Ee(n,new Ke(l*.48,l*.48,.026*t.k,24),"chest",r.accent,Ne(0,h+t.torso*w,0,0,0,0,1,1,c/l));for(const w of[-.9,-.45,0,.45,.9]){const S=[];for(let b=0;b<=10;b++){const y=-1.05+b*.21;S.push([Math.sin(w)*l*.64*Math.cos(y),A+Math.sin(y)*t.torso*.55,Math.cos(w)*c*.69*Math.cos(y)])}for(let b=1;b<S.length;b++)Hn(n,S[b-1],S[b],.007*t.k,"chest",r.accent,5)}}else if(r.top==="lighthouse"){for(const w of[.25,.6])Ee(n,new Ke(l*.51,l*.51,t.torso*.11,24,1,!0),"chest",r.accent,Ne(0,h+t.torso*w,0,0,0,0,1,1,c/l));Ee(n,new tn(l*.11,.012*t.k,8,18),"chest",r.accent,Ne(0,h+t.torso*.79,c*.38)),Ge(n,l*.09,[0,h+t.torso*.79,c*.38],"chest","#7fb0d8",[1,1,.2],12,8)}else{for(const w of[-1,1]){const S=new yt;S.setAttribute("position",new qe([w*l*.42,h+t.torso*.24,-c*.15,w*l*.9,h+t.torso*.49,-c*.15,w*l*.42,h+t.torso*.83,-c*.15],3)),S.computeVertexNormals(),Ee(n,S,"chest",r.accent);const b=S.clone();b.scale(1,1,-1),Ee(n,b,"chest",r.accent)}for(let w=0;w<3;w++)Ge(n,.026*t.k,[(w-1)*l*.19,A,c*.52],"chest",r.accent,[1,1,.35],8,6)}}if(!i&&r.top==="apron"){const A=h+t.torso*.75,w=h-t.thigh*.78,S=new wi(l*.7,A-w,8,14);S.translate(0,(A+w)/2,0);const b=S.attributes.position,y=["skirt","longskirt"].includes(r.bottom),L=r.bottom==="longskirt"?t.thigh+t.shin*.85:t.thigh*.9;for(let k=0;k<b.count;k++){const j=b.getY(k),z=(j-h)/t.torso,q=j>=h?l/2*pi(_,z):y?ke.lerp(t.hips*.53,t.hips*.66+L*.22,ke.clamp((h+.03-j)/L,0,1)):l*.52,N=b.getX(k)*(j>h?1-ke.clamp(z,0,1)*.25:1);b.setXYZ(k,N,j,q*c/l*Math.sqrt(Math.max(.05,1-(N/q)**2))+.025*t.k)}S.computeVertexNormals(),Ee(n,S,k=>{if(k.y>h){const q=ke.smoothstep(k.y,h,h+t.torso*.35);return[["hips",1-q],["chest",q]]}const j=ke.smoothstep(h-k.y,.02,.12),z=ke.smoothstep(k.x,-l*.25,l*.25);return[["hips",1-j],["thighL",j*z],["thighR",j*(1-z)]]},new Ie(r.topColour).multiplyScalar(1.12).getHex())}if(!i&&(r.pattern==="flowers"||r.pattern==="dots")){const A=r.pattern==="flowers"?"#f8f6ef":r.accent,w=r.pattern==="flowers"?Ll:Il;for(let S=0;S<18;S++){const b=S*2.39996,y=.2+.62*(S*.37%1),L=h+t.torso*y;if(r.top==="kariyushi"&&Math.cos(b)>.7&&(Math.abs(Math.sin(b))<.13||y>.77))continue;const U=pi(_,y),k=Math.sin(b)*l/2*U*1.012,j=Math.cos(b)*c/2*U*1.012,z=Math.atan2(k/(l/2),j/(c/2)),q=t.k*(r.pattern==="flowers"?r.top==="kariyushi"?.045:.035:.018);Ee(n,w,"chest",A,Ne(k,L,j,0,z,S*.7,q,q,q)),r.pattern==="flowers"&&Ee(n,Il,"chest","#f4d23c",Ne(k*1.004,L,j*1.004,0,z,0,q*.35,q*.35,q*.35))}}const x=!i&&["jacket","smock","hoodie","cardigan","festival","lighthouse","lantern","reef"].includes(r.top),D=t.upper/(t.upper+t.fore);for(const A of["L","R"]){const w=A==="L"?1:-1,S=[w*t.shoulderX,t.shoulderY,0],b=[w*(t.shoulderX+.015),t.shoulderY-t.upper-t.fore,0],y={bone:"shoulder"+A,joints:[[D,"shoulder"+A,"elbow"+A]]};zn(n,S,b,t.armR*1.04,t.armR*.86,i||!x?s:o,y);const L=U=>{const k=ke.smoothstep(Math.abs(U.x),t.shoulderX-t.armR*1.1,t.shoulderX+t.armR*.3);return[["chest",1-k],["shoulder"+A,k]]};if(Ee(n,new xt(t.armR*1.3,16,12),L,i||u||r.top==="sundress"?s:o,Ne(S[0]-w*t.armR*.15,S[1]+t.armR*.05,0,0,0,0,1,.92,Math.min(1.1,c/l*1.6))),!i&&r.top==="kariyushi"){const U=t.upper*.76,k=S[1]-U/2;Ee(n,new Ke(t.armR*1.25,t.armR*1.42,U,16,1,!0),y,o,Ne(S[0]+w*.008,k,0,0,0,w*.035)),Ee(n,new Ke(t.armR*1.43,t.armR*1.43,.008*t.k,16,1,!0),y,new Ie(o).multiplyScalar(.88).getHex(),Ne(S[0]+w*.014,S[1]-U,0)),Ee(n,Ll,"shoulder"+A,"#f8f6ef",Ne(S[0],k,t.armR*1.44,0,0,w*.3,.038*t.k,.038*t.k,.038*t.k))}else!i&&!x&&!u&&r.top!=="sundress"&&zn(n,S,[S[0]+w*.006,S[1]-t.upper*.58,0],t.armR*1.12,t.armR*1.16,o,{...y,joints:[]});Ge(n,t.hand,[b[0],b[1]-t.hand*.55,0],"hand"+A,s,[.9,1.15,.78],12,10),Ge(n,t.hand*.42,[b[0]-w*t.hand*.55,b[1]-t.hand*.35,t.hand*.42],"hand"+A,s,[1,1.2,1],8,6)}const R=i?"swim":r.bottom;for(const A of["L","R"]){const w=A==="L"?1:-1,S=[w*t.hipX,h,0];w*t.hipX,h-t.thigh;const b=[w*t.hipX,t.foot,0],y={bone:"thigh"+A,joints:[[t.thigh/(h-t.foot),"thigh"+A,"knee"+A]]},L=R==="trousers"||R==="widepants";if(zn(n,S,b,t.legR*(R==="widepants"?1.32:1.02),t.legR*(R==="widepants"?1.28:.86),L?a:s,y),R==="cropped"||R==="culottes"){const k=R==="cropped"?t.foot+t.shin*.35:h-t.thigh*1.12;zn(n,S,[S[0],k,0],t.legR*(R==="culottes"?1.55:1.12),t.legR*(R==="culottes"?1.7:1.16),a,y)}(R==="shorts"||R==="swim")&&zn(n,[S[0],S[1]+t.legR*.3,0],[S[0]*1.04,h-t.thigh*(R==="swim"?.22:.55),0],t.legR*1.2,t.legR*1.26,a,{...y,joints:[]}),R==="underwear"&&zn(n,[S[0],S[1]+t.legR*.3,0],[S[0]*1.02,h-t.thigh*.16,0],t.legR*1.12,t.legR*1.14,a,{...y,joints:[]});const U=i?"barefoot":r.footwear;U==="barefoot"||U==="sandals"?(Ge(n,t.legR*1.12,[w*t.hipX,t.foot*.55,t.legR*.5],"foot"+A,s,[1,.55,1.7],12,8),U==="sandals"&&(Ge(n,t.legR*1.24,[w*t.hipX,t.foot*.12,t.legR*.55],"foot"+A,e.age==="elder"?"#6b4a32":"#c8a878",[1,.18,1.8],12,6),Ge(n,t.legR*.42,[w*t.hipX,t.foot*.55+t.legR*.55,t.legR*.95],"foot"+A,r.shoes,[2.3,.5,.8],10,6))):(Ge(n,t.legR*1.25,[w*t.hipX,t.foot*.62,t.legR*.55],"foot"+A,r.shoes,[1,.6,U==="shoes"?1.85:1.75],12,8),U==="boots"&&zn(n,[w*t.hipX,t.foot,0],[w*t.hipX,t.foot+t.shin*.65,0],t.legR*1.08,t.legR*1.05,r.shoes,{bone:"knee"+A,joints:[]}),Ge(n,t.legR*1.32,[w*t.hipX,t.foot*.16,t.legR*.6],"foot"+A,U==="shoes"?"#2b2622":e.age==="elder"?"#6b4a32":"#f2efe6",[1,.24,1.8],12,6))}if(R==="skirt"||R==="longskirt"||R==="pleatedskirt"){const A=R==="skirt"||R==="pleatedskirt"?t.thigh*.9:t.thigh+t.shin*.85,w=b=>{const y=ke.smoothstep(h-b.y,.02,.12),L=ke.smoothstep(b.x,-l*.25,l*.25);return[["hips",1-y],["thighL",y*L],["thighR",y*(1-L)]]},S=new Ke(t.hips*.53,t.hips*.66+A*.22,A,R==="pleatedskirt"?64:24,6,!0);if(R==="pleatedskirt"){const b=S.attributes.position;for(let y=0;y<b.count;y++){const L=b.getX(y),U=b.getZ(y),k=1+.055*Math.cos(Math.atan2(U,L)*16);b.setXYZ(y,L*k,b.getY(y),U*k)}S.computeVertexNormals()}Ee(n,S,w,r.bottomPattern==="plaid"?(b=>{const y=Math.floor(Math.atan2(b.x,b.z)*12/Math.PI)%4===0,L=Math.floor((h-b.y)/(.06*t.k))%4===0;return y||L?r.accent:a}):a,Ne(0,h+.03-A/2,0,0,0,0,1,1,c/l))}}const xg=.011,io=new Map;function Dl({skinned:n=!0,colour:e=null,width:t=xg}={}){const i=(n?"s":"m")+(e??"v")+t;if(io.has(i))return io.get(i);const r=new Co({color:e??16777215,vertexColors:e==null,side:1});r.name="Shimanchu outline",r.userData.outline=!0;const s={value:t};return r.onBeforeCompile=o=>{o.uniforms.uOutline=s,o.vertexShader=`uniform float uOutline;
`+o.vertexShader.replace("#include <project_vertex>",(n?`vec3 outlineN = normalize( objectNormal );
`:`vec3 outlineN = normalize( position );
`)+`transformed += outlineN * uOutline;
#include <project_vertex>`),e==null&&(o.fragmentShader=o.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
 diffuseColor.rgb *= vec3( 0.32, 0.27, 0.27 );`))},r.customProgramCacheKey=()=>"shimanchu-outline-"+i,io.set(i,r),r}function ro(n,e,t){const i=t?new Wr(e.geometry,Dl({skinned:!0})):new ut(e.geometry,Dl({skinned:!1,colour:4861992}));return i.name=e.name+" outline",i.castShadow=!1,i.receiveShadow=!1,i.frustumCulled=!1,i.userData.outline=!0,t?(i.bind(e.skeleton,e.bindMatrix),n.add(i)):e.add(i),i}function Sg(n,e,t){const i=document.createElement("canvas");i.width=i.height=t;const r=i.getContext("2d"),s=new km(i);s.colorSpace=Ot,s.anisotropy=4;let o=new xt(1,36,26);const a=o.attributes.position,l=o.attributes.uv,c=new P,h=Math.PI/2-.95,u=1.9,p=Math.PI*.28,f=Math.PI*.58;for(let R=0;R<a.count;R++){c.fromBufferAttribute(a,R);const A=Math.atan2(c.z,-c.x),w=Math.acos(ke.clamp(c.y,-1,1));l.setXY(R,ke.clamp((A-h)/u,.002,.998),ke.clamp(1-(w-p)/f,.002,.998)),or(c,e.profile),a.setXYZ(R,c.x,c.y,c.z)}o.scale(e.Rh*e.headSX,e.Rh*e.headSY,e.Rh*.98),o.computeVertexNormals();const g=o.attributes.normal,_=new P,m=new P(0,.4,.92).normalize();for(let R=0;R<g.count;R++)_.fromBufferAttribute(g,R),_.lerp(m,ke.smoothstep(_.z,-.35,.45)*.7).normalize(),g.setXYZ(R,_.x,_.y,_.z);const d=o;o=d.toNonIndexed(),d.dispose();const v=o.attributes.position,M=o.attributes.uv;for(let R=0;R<v.count;R+=3){const A=[M.getX(R),M.getX(R+1),M.getX(R+2)];if(v.getZ(R)<=0&&v.getZ(R+1)<=0&&v.getZ(R+2)<=0||Math.max(...A)-Math.min(...A)>.5)for(let S=0;S<3;S++)M.setXY(R+S,.002,.002)}const x=ps(new wt({map:s,emissive:16777215,emissiveMap:s,emissiveIntensity:.05}),{bands:"soft3"}),D=new ut(o,x);return D.name="Shimanchu head",D.position.y=e.headCentre-e.headY,{head:D,canvas:i,ctx:r,texture:s}}function so(n,e,t){if(e.nose.style==="none")return;const i=fs(e),r=Math.PI*.28+i.noseY/256*Math.PI*.58,s=Math.PI/2-.95+i.noseX/256*1.9,o=or(new P(-Math.cos(s)*Math.sin(r),Math.cos(r),Math.sin(s)*Math.sin(r)),t.profile),a=e.nose.style==="hook",l=e.nose.style==="wide",c=t.Rh*(.065+e.nose.size*.055);Ge(n,c,[o.x*t.Rh*t.headSX,t.headCentre+o.y*t.Rh*t.headSY,o.z*t.Rh*.98+c*.55],"head",e.body.skin,[l?1.45:.85,a?1.55:.85,a?1.65:1.2],12,10)}function bo(n,{shadows:e=!0,faceSize:t=256}={}){const i=Wt(n),r=Yo(i),s=pg(r),o={},a=vo.map(w=>{const S=new ac;return S.name=w,o[w]=S,S});for(const w of vo){const S=o[w],b=s[w],y=mg[w];if(y){const L=s[y];S.position.set(b[0]-L[0],b[1]-L[1],b[2]-L[2]),o[y].add(S)}else S.position.set(...b)}const l=[];no(l,i,r,!1),so(l,i,r);for(const w of[-1,1])Ge(l,r.Rh*.2,[w*r.Rh*r.headSX*.97,r.headCentre-r.Rh*.08,-r.Rh*.05],"head",i.body.skin,[.55,1,.8],8,6);to(l,i,r),bg(l,i,r);const c=l.reduce((w,S)=>w+S.attributes.position.count,0);Nc(l,i,r);const h=[];let u=0;for(const w of l)w.userData.hatHair&&h.push({offset:u,original:w.userData.hatHair,tucked:{position:w.attributes.position.array.slice(),normal:w.attributes.normal.array.slice()}}),u+=w.attributes.position.count*3;let p=!0;const f=Xr(l,!1);l.forEach(w=>w.dispose());const g=f.attributes.position.count>c;f.computeBoundingSphere();const _=ps(new wt({vertexColors:!0}),{bands:"soft3"}),m=new Wr(f,_);m.name="Shimanchu body",m.add(o.root),m.bind(new Do(a)),m.castShadow=e,m.receiveShadow=!0,m.frustumCulled=!1;let d=null,v=null,M=null;const x=Sg(i,r,t);x.head.castShadow=e,x.head.receiveShadow=!0,o.head.add(x.head);const D=new Ht;D.name="Shimanchu · "+(i.name||"resident"),D.add(m,o.root),D.rotation.y=Math.PI;const R=ro(D,m,!0);ro(x.head,x.head,!1);const A={recipe:i,measure:r,root:D,body:m,bones:o,face:x,height:r.H,hasHat:g,setHat(w){if(f.setDrawRange(0,w||!g?1/0:c),p!==!!w){for(const S of h){const b=w?S.tucked:S.original;f.attributes.position.array.set(b.position,S.offset),f.attributes.normal.array.set(b.normal,S.offset)}h.length&&(f.attributes.position.needsUpdate=!0,f.attributes.normal.needsUpdate=!0),p=!!w}},get hatOn(){return g&&f.drawRange.count===1/0},faceState:{expression:"neutral",blink:0,talk:0,look:[0,0]},paintFace(w){const S=A.faceState,b={...S,...w},y=b.expression+"|"+(b.blink>.5?1:0)+"|"+(b.talk>.5?1:0)+"|"+Math.round(b.look[0]*2)+","+Math.round(b.look[1]*2);return y===A.faceKey?!1:(A.faceKey=y,Object.assign(S,b),$0(x.ctx,i,{...b,size:x.canvas.width}),x.texture.needsUpdate=!0,!0)},wear(w){if(w==="nozomi"&&!v){const S=Wt({...i,outfit:{...i.outfit,...H0}}),b=[];no(b,S,r),so(b,S,r);for(const L of[-1,1])Ge(b,r.Rh*.2,[L*r.Rh*r.headSX*.97,r.headCentre-r.Rh*.08,-r.Rh*.05],"head",i.body.skin,[.55,1,.8],8,6);to(b,S,r);const y=Xr(b,!1);b.forEach(L=>L.dispose()),v=new Wr(y,_),v.name="Thuan · Nozomi-inspired outfit",v.bind(m.skeleton,m.bindMatrix),v.castShadow=e,v.frustumCulled=!1,D.add(v),M=ro(D,v,!0)}if(w==="swim"&&!d){const S=[];no(S,i,r,!0),so(S,i,r);for(const y of[-1,1])Ge(S,r.Rh*.2,[y*r.Rh*r.headSX*.97,r.headCentre-r.Rh*.08,-r.Rh*.05],"head",i.body.skin,[.55,1,.8],8,6);to(S,{...i,outfit:{...i.outfit,hat:"none"}},r);const b=Xr(S,!1);S.forEach(y=>y.dispose()),d=new Wr(b,_),d.name="Shimanchu swimwear",d.bind(m.skeleton,m.bindMatrix),d.castShadow=e,d.frustumCulled=!1,D.add(d)}m.visible=w!=="swim"&&w!=="nozomi",R.visible=m.visible,v&&(v.visible=w==="nozomi",M.visible=v.visible),d&&(d.visible=w==="swim")},dispose(){f.dispose(),_.dispose(),x.texture.dispose(),x.head.geometry.dispose(),x.head.material.dispose(),d?.geometry.dispose(),v?.geometry.dispose()}};return A.paintFace({}),A}const Mo="johansson-town-resident-wardrobes";function wg(n,e=globalThis.localStorage){try{return Wo(JSON.parse(e?.getItem(Mo)||"{}")[n]||"")}catch{return null}}function ry(n,e,t=globalThis.localStorage){const i=Wt({...e,name:n});let r={};try{r=JSON.parse(t?.getItem(Mo)||"{}")||{}}catch{}return r[n]=wc(i),t?.setItem(Mo,JSON.stringify(r)),globalThis.dispatchEvent?.(new Event("johansson-appearance-change")),i}const qo=[{name:"Aya",age:24,role:"bookshop assistant",female:!0,height:1.62,work:[4.3,34],evening:[24,18],home:[-25,-47],top:"#967a99",start:540,close:1110,retire:1210,personality:"Playful mischief",friend:"Emi",look:"Black tank, olive shorts, high ponytail",hairStyle:"pony",outfit:"tank",hello:"Window seat is mine. I bookmark the funny parts — apparently that is not how a lending library works.",gossip:"Emi made a tiny apron for Tama. He has declined every fitting.",clue:"A rain-stained book is drying at the harbour office. Yoshiko knows how to save the pages.",model:"resident-00",build:.88,supperStart:1110,supperEnd:1210,house:{x:-22.4,z:-47,angle:-1.5707963267948966},homeAddress:"1 Willow Alley"},{name:"Kenji",age:32,role:"repairman",female:!1,height:1.76,work:[-3.5,17],evening:[4.5,21],home:[-29,-47],top:"#527d99",start:540,close:1080,retire:1260,personality:"Enthusiastic tinkerer",friend:"Tetsuo",look:"Blue hoodie and tousled ink-black hair",hairStyle:"messy",outfit:"work",hello:"I fixed the kettle. It now whistles in a slightly more confident key.",gossip:"Tetsuo says my repairs are too loud. His radio can be heard from the pier.",clue:"The cabinet outside my workshop runs Star Port. Beat my score and I will show you around.",model:"resident-01",build:.965,supperStart:1092,supperEnd:1207,house:{x:-31.6,z:-47,angle:1.5707963267948966},homeAddress:"2 Willow Alley"},{name:"Mrs Sato",age:68,role:"shopkeeper",female:!0,height:1.55,work:[-4.2,-26],evening:[-26,46],home:[-25,-39],top:"#ad6178",start:540,close:1080,retire:1260,personality:"Affectionately formidable",friend:"Fumiko",look:"Berry apron dress, silver bob and round spectacles",hairStyle:"bun",outfit:"apron",hello:"You look hungry. Yes, I say that to everyone. I am usually right.",gossip:"Fumiko claims she only came for tea. I have saved her the largest bowl.",clue:"Thuan names her plants. The assistant manager by her door is very demanding.",model:"resident-02",build:1.05,supperStart:1104,supperEnd:1234,house:{x:-22.4,z:-39,angle:-1.5707963267948966},homeAddress:"3 Willow Alley"},{name:"Harbour master",age:58,role:"harbour master",female:!1,height:1.74,work:[1.6,-70],evening:[4.2,-48],home:[-29,-39],top:"#405d7e",start:300,close:840,retire:1260,personality:"Dry wit, soft heart",friend:"Mr Fujita",look:"Navy vest, silver hair and round spectacles",hairStyle:"part",outfit:"jacket",hello:"I can predict rain by my knees. The radio insists on taking all the credit.",gossip:"Fujita caught a fish this big. The distance between his hands increases every evening.",clue:"There is a blue-taped folio in the harbour office tray. Take a proper look; it has travelled.",model:"resident-03",build:1.135,supperStart:1020,supperEnd:1120,house:{x:-31.6,z:-39,angle:1.5707963267948966},homeAddress:"4 Willow Alley"},{name:"Bus driver",age:49,role:"bus driver",female:!1,height:1.73,work:[-4.5,44],evening:[-26,46],home:[-25,-32],top:"#498d8b",start:540,close:1080,retire:1260,personality:"Patient storyteller",friend:"Naoko",look:"Navy vest and neat dark hair",hairStyle:"part",outfit:"vest",hello:"I collect passengers and opening sentences. The best stories start at the last stop.",gossip:"Naoko can deliver a letter before I finish reading the address.",clue:"Read the timetable by the stop before you wander down to the water.",model:"resident-04",build:.88,supperStart:1092,supperEnd:1207,house:{x:-22.4,z:-32,angle:-1.5707963267948966},homeAddress:"5 Willow Alley"},{name:"Cold-storage kid",age:19,role:"ice store assistant",female:!1,height:1.69,work:[-8,-55],evening:[-8,-55],home:[-29,-32],top:"#6eaa9b",start:540,close:1080,retire:1260,personality:"Shy, unexpectedly funny",friend:"Kenta",look:"Pale-blue hoodie and chestnut hair",hairStyle:"fringe",outfit:"work",hello:"I work with ice. Breaking it socially is the difficult part.",gossip:"Kenta practises his introduction to Emi in front of the freezer. I try not to applaud.",clue:"Buy ice before you go fishing. The fish appreciate the planning, briefly.",model:"resident-05",build:.965,supperStart:null,supperEnd:130,house:{x:-31.6,z:-32,angle:1.5707963267948966},homeAddress:"6 Willow Alley"},{name:"Officer Mori",age:45,role:"policeman",female:!1,height:1.78,work:[0,49],evening:[-26,46],home:[-25,-25],top:"#4b6e9c",start:1320,close:1800,retire:1800,personality:"Earnest and easily teased",friend:"Reiko",look:"Blue vest and softly greying hair",hairStyle:"crop",outfit:"jacket",hello:"No suspicious activity today. Except someone teaching the cat to ignore me.",gossip:"Reiko asked for a statement. I gave her three pages. She printed the bit about my lunch.",clue:"The river path circles back to the harbour. Keep an eye out for the heron.",model:"resident-06",build:1.05,supperStart:null,supperEnd:null,house:{x:-22.4,z:-25,angle:-1.5707963267948966},homeAddress:"7 Willow Alley"},{name:"Hana",age:17,role:"school pupil",female:!0,height:1.57,work:[43,36],evening:[36,30],home:[-29,-25],top:"#d17b78",start:540,close:1080,retire:1260,personality:"Bold little artist",friend:"Daichi",look:"Coral apron dress and chestnut bob",hairStyle:"bob",outfit:"cardigan",hello:"I sketch everyone while they wait for the bus. Sitting still is their contribution.",gossip:"Daichi says he cannot pose. He has three different heroic expressions prepared.",clue:"The hillside shrine has the best view for drawing roofs.",model:"resident-07",build:1.135,supperStart:null,supperEnd:115,house:{x:-31.6,z:-25,angle:1.5707963267948966},homeAddress:"8 Willow Alley"},{name:"Daichi",age:17,role:"school pupil",female:!1,height:1.7,work:[45,36],evening:[28,50],home:[-25,-20],top:"#cda04f",start:540,close:1080,retire:1260,personality:"Big dreams, gentle nature",friend:"Hana",look:"Ochre hoodie and warm brown hair",hairStyle:"messy",outfit:"sweater",hello:"One day I will pitch a perfect game. Today I am working on finding the ball.",gossip:"Hana drew me as a famous player. She made the ball enormous so I could hit it.",clue:"Hana likes the shrine view. I carry the pencils. It is a specialist position.",model:"resident-08",build:.88,supperStart:null,supperEnd:130,house:{x:-22.4,z:-20,angle:-1.5707963267948966},homeAddress:"9 Willow Alley"},{name:"Mr Fujita",age:73,role:"retired fisherman",female:!1,height:1.64,work:[-38,-60],evening:[-34,39],home:[-29,-20],top:"#73988a",start:540,close:1080,retire:1260,personality:"Cheerful embellisher",friend:"Harbour master",look:"Sea-green vest, white hair and round spectacles",hairStyle:"receding",outfit:"sweater",hello:"The fish was enormous. Ask me tomorrow; I expect it will have grown.",gossip:"The harbour master has heard this story before. He still asks how it ends.",clue:"The outer pier has a bait station. The gulls regard it as their property.",model:"resident-09",build:.965,supperStart:1080,supperEnd:1180,house:{x:-31.6,z:-20,angle:1.5707963267948966},homeAddress:"10 Willow Alley"},{name:"Masaru",age:51,role:"fisherman",female:!1,height:1.72,work:[-38,-74],evening:[24,18],home:[-25,-12],top:"#bd7959",start:540,close:1080,retire:1560,personality:"Boisterous cook-at-heart",friend:"Nao",look:"Rust hoodie and brown hair",hairStyle:"curly",outfit:"work",hello:"A good catch is a good supper. A poor catch is a very long story.",gossip:"Nao lets me suggest specials. She very sensibly ignores most of them.",clue:"Try the grilled skewers at Minato. The last one is always the best one.",model:"resident-10",build:1.05,supperStart:1380,supperEnd:1560,house:{x:-22.4,z:-12,angle:-1.5707963267948966},homeAddress:"11 Willow Alley"},{name:"Yoshiko",age:61,role:"bathhouse keeper",female:!0,height:1.58,work:[-34,39],evening:[-34,39],home:[-29,-12],top:"#9ea66c",start:540,close:1260,retire:1260,personality:"Calm neighbourhood anchor",friend:"Mrs Sato",look:"Sage apron dress and silver bob",hairStyle:"bun",outfit:"apron",hello:"A hot bath, a clean towel, a little patience. Most days need all three.",gossip:"Sato pretends she does not gossip. She just asks exceptionally well-informed questions.",clue:"Bring the waterlogged book to my warm drying rack. Slowly, away from the stove.",model:"resident-11",build:1.135,supperStart:1284,supperEnd:1380,house:{x:-31.6,z:-12,angle:1.5707963267948966},homeAddress:"12 Willow Alley"},{name:"Reiko",age:36,role:"newspaper editor",female:!0,height:1.62,work:[-4,-2],evening:[-4,-2],home:[-25,-5],top:"#a96883",start:540,close:1080,retire:1260,personality:"Curious, loves a scoop",friend:"Officer Mori",look:"Burgundy vest, long dark hair and round spectacles",hairStyle:"bob",outfit:"jacket",hello:"Nothing is off the record until I put my pencil away. There. What did you hear?",gossip:"Mori writes beautiful incident reports. Unfortunately nothing ever happens.",clue:"I left a stack of evening papers outside the press. The corrections are on page two.",model:"resident-12",build:.88,supperStart:1080,supperEnd:1180,house:{x:-22.4,z:-5,angle:-1.5707963267948966},homeAddress:"13 Willow Alley"},{name:"Tetsuo",age:40,role:"radio repairer",female:!1,height:1.7,work:[4,-13],evening:[24,18],home:[-29,-5],top:"#807398",start:540,close:1080,retire:1605,personality:"Deadpan music lover",friend:"Kenji",look:"Aubergine vest, dark hair and round spectacles",hairStyle:"part",outfit:"vest",hello:"Turn it gently. Radios have feelings. Mostly static, but feelings.",gossip:"Kenji has repaired my radio twice. I keep finding extra screws.",clue:"There are three radio stations. Each claims it has the most reliable weather.",model:"resident-13",build:.965,supperStart:1440,supperEnd:1605,house:{x:-31.6,z:-5,angle:1.5707963267948966},homeAddress:"14 Willow Alley"},{name:"Emi",age:29,role:"seamstress",female:!0,height:1.61,work:[38,34],evening:[28,50],home:[-25,2],top:"#d797a2",start:540,close:1080,retire:1260,personality:"Warm, quietly daring",friend:"Aya",look:"Rose dress and chestnut ponytail",hairStyle:"pony",outfit:"blouse",hello:"I keep little fabric scraps. They are not clutter; they are future possibilities.",gossip:"Aya lends me adventure novels. I repay her in pockets deep enough to hide one.",clue:"Thuan has postcards by the biscuits. Ask her which gull looks most important.",model:"resident-14",build:1.05,supperStart:1104,supperEnd:1234,house:{x:-22.4,z:2,angle:-1.5707963267948966},homeAddress:"15 Willow Alley"},{name:"Mr Tanabe",age:66,role:"shrine caretaker",female:!1,height:1.66,work:[20,50],evening:[20,56],home:[-29,2],top:"#bbaa85",start:540,close:1080,retire:1260,personality:"Playful philosopher",friend:"Mr Fujita",look:"Cream vest, silver hair and round spectacles",hairStyle:"receding",outfit:"sweater",hello:"The shrine bell sounds different every day. Or perhaps I am getting better at listening.",gossip:"Fujita says his fish was a sign of good fortune. It was certainly a sign of good appetite.",clue:"Leave an intention at the shrine. Then do one small thing about it.",model:"resident-15",build:1.135,supperStart:1080,supperEnd:1180,house:{x:-31.6,z:2,angle:1.5707963267948966},homeAddress:"16 Willow Alley"},{name:"Naoko",age:33,role:"postal worker",female:!0,height:1.65,work:[4,11],evening:[-26,46],home:[-25,12],top:"#c77465",start:540,close:1080,retire:1260,personality:"Brisk, remembers everyone",friend:"Bus driver",look:"Post-red dress and dark ponytail",hairStyle:"pony",outfit:"jacket",hello:"I know every door in this town. Some of them are more polite than their owners.",gossip:"The bus driver saves stories for me. I deliver the endings to everyone else.",clue:"The postbox collection plate tells you when the next bag leaves.",model:"resident-16",build:.88,supperStart:1092,supperEnd:1207,house:{x:-22.4,z:12,angle:-1.5707963267948966},homeAddress:"17 Willow Alley"},{name:"Hiroshi",age:54,role:"grocer",female:!1,height:1.68,work:[-4,-28],evening:[24,18],home:[-29,12],top:"#7c9959",start:540,close:1080,retire:1260,personality:"Proud amateur singer",friend:"Yoshiko",look:"Moss hoodie and salt-and-pepper hair",hairStyle:"curly",outfit:"apron",hello:"I sing to the vegetables. The aubergines are a difficult audience.",gossip:"Yoshiko says I may sing at the bathhouse if I agree to sing quietly. Negotiations continue.",clue:"Sakura has cold tea. A cup after walking the harbour is an excellent idea.",model:"resident-17",build:.965,supperStart:1104,supperEnd:1234,house:{x:-31.6,z:12,angle:1.5707963267948966},homeAddress:"18 Willow Alley"},{name:"Fumiko",age:77,role:"neighbour",female:!0,height:1.49,work:[-29,50],evening:[-34,39],home:[-25,19],top:"#aa90b4",start:540,close:1080,retire:1260,personality:"Fearless neighbourhood aunt",friend:"Mrs Sato",look:"Lavender apron dress, white bob and round spectacles",hairStyle:"bob",outfit:"cardigan",hello:"At my age you can say almost anything. I am making up for lost time.",gossip:"Sato and I never gossip. We maintain the oral history of the neighbourhood.",clue:"There is a quiet bench by the shops. Sit long enough and the town comes to you.",model:"resident-18",build:1.05,supperStart:1080,supperEnd:1180,house:{x:-22.4,z:19,angle:-1.5707963267948966},homeAddress:"19 Willow Alley"},{name:"Kenta",age:21,role:"apprentice engineer",female:!1,height:1.8,work:[-4.5,17],evening:[24,18],home:[-29,19],top:"#77a5b7",start:540,close:1080,retire:1260,personality:"Sweetly awkward inventor",friend:"Cold-storage kid",look:"Sky-blue hoodie and chestnut hair",hairStyle:"curly",outfit:"work",hello:"I made a machine to save time. Explaining it takes most of the afternoon.",gossip:"The cold-store lad laughs at my jokes. Slowly, but the room is very cold.",clue:"Kenji has a small prototype on display. Pick it up and turn it over.",model:"resident-19",build:1.135,supperStart:1092,supperEnd:1207,house:{x:-31.6,z:19,angle:1.5707963267948966},homeAddress:"20 Willow Alley"},{name:"Nao",age:34,role:"izakaya owner",female:!0,height:1.65,work:[24,20],evening:[24,20],home:[-25,25],start:960,close:1620,retire:1620,top:"#c87d65",personality:"Generous host, wicked timing",friend:"Masaru",look:"Terracotta apron dress and dark bob",hairStyle:"bun",outfit:"apron",hello:"Come in, come in. The spare chair has been expecting you.",gossip:"Masaru called his catch the special of the day. It was so small I nearly served it as garnish.",clue:"Take a seat, order something warm, and listen. This town tells its best stories over supper.",model:"resident-20",build:.88,supperStart:960,supperEnd:1620,house:{x:-22.4,z:25,angle:-1.5707963267948966},homeAddress:"21 Willow Alley"},{name:"Barfly",age:43,role:"Minato regular",female:!1,height:1.72,work:[24,21],evening:[24,21],home:[24,21],top:"#b74e43",start:0,close:0,retire:1440,personality:"Unhurried, permanently thirsty",friend:"Nao",look:"Broad build, short salt-and-pepper hair, red patterned open-collar shirt and wristwatch",hairStyle:"short",outfit:"hawaiian",hello:"Another one? Nao knows my usual. I am staying right here.",gossip:"I have been at this stool long enough to know when the lanterns need trimming.",clue:"Minato stays open late. The regular at the end of the counter has never once caught the last bus.",model:"barfly",build:1.14,supperStart:null,supperEnd:null,house:{x:24,z:21,angle:0},homeAddress:"Minato Izakaya"}],Uc={interests:["read","inspect","seat","shop"],snack:"rice",drink:"tea",meal:"rice"},Fc=Object.freeze(Object.fromEntries(Object.entries({Kenji:{source:"casual_2",top:"#477697",trousers:"#334b55",hair:"#24272b",skin:"#bd8b65",width:.96,accessory:"tool-pouch",interests:["arcade","machine","radio","inspect"],snack:"bun",drink:"beer",meal:"yakitori"},"Mrs Sato":{source:"female_formal",top:"#96566d",trousers:"#96566d",hair:"#c5c0ae",skin:"#c69c7c",width:1.06,accessory:"glasses",interests:["read","shop","seat","post"],snack:"tea",drink:"tea",meal:"rice"},"Harbour master":{source:"suit",top:"#455b6b",trousers:"#374653",hair:"#92958d",skin:"#b5805d",width:1.1,accessory:"captain",interests:["office","fish","read","machine","phone"],snack:"rice",drink:"beer",meal:"fish"},Tetsuo:{source:"worker",top:"#698071",trousers:"#4a5146",hair:"#444035",skin:"#ba895d",helmet:"#737768",width:1.03,accessory:"glasses",interests:["radio","machine","arcade","inspect"],snack:"bun",drink:"beer",meal:"yakitori"},"Officer Mori":{source:"suit",top:"#3c5780",trousers:"#303e57",hair:"#202528",skin:"#c79872",width:.98,accessory:"police",interests:["read","phone","post","inspect"],snack:"rice",drink:"tea",meal:"rice"},"Bus driver":{source:"suit",top:"#437f78",trousers:"#3b514e",hair:"#61564b",skin:"#b88968",width:1.04,accessory:"driver",interests:["seat","read","phone","shop"],snack:"tea",drink:"tea",meal:"fish"},Nao:{source:"female_casual",top:"#bd7557",trousers:"#394b58",hair:"#292a30",skin:"#cf9b77",width:.98,accessory:"apron",interests:["shop","post","read","radio"],shopping:"soda",snack:"rice",drink:"tea",meal:"yakitori"},Aya:{source:"female_casual",top:"#424552",trousers:"#74764e",hair:"#24212a",skin:"#d5a17d",width:.91,accessory:"ponytail-satchel",accent:"#ab799e",height:1.62,interests:["read","seat","post","shop"],snack:"tea",drink:"beer",meal:"rice"},Reiko:{source:"female_formal",top:"#a05c75",trousers:"#a05c75",hair:"#44332b",skin:"#d8ae8c",width:.96,accessory:"headband-scarf",accent:"#efe2c3",height:1.62,interests:["read","radio","phone","shop"],snack:"rice",drink:"beer",meal:"fish"},Thuan:{source:"thuan-mh",top:"#d8b23a",trousers:"#27304d",hair:"#1c1612",skin:"#e6c3a8",width:1.02,accessory:"ribbon",interests:["shop","seat","read","post"],snack:"tea",drink:"tea",meal:"rice",height:1.64},"Cold-storage kid":{source:"worker",top:"#87a5b2",trousers:"#495e71",hair:"#664634",skin:"#d4a982",helmet:"#658499",width:.9,accessory:"scarf",accent:"#ddd6ba"},Hana:{source:"female_formal",top:"#c58176",trousers:"#c58176",hair:"#76503e",skin:"#dcb594",width:.92,accessory:"headband",accent:"#eee0ae"},Daichi:{source:"casual_2",top:"#bba153",trousers:"#5d614c",hair:"#634f34",skin:"#cea276",width:.93,accessory:"satchel",accent:"#655337"},"Mr Fujita":{source:"suit",top:"#648a80",trousers:"#455d5c",hair:"#d2ccba",skin:"#b08461",width:1.08,accessory:"glasses"},Masaru:{source:"worker",top:"#a56545",trousers:"#485970",hair:"#514335",skin:"#ac7655",helmet:"#ad9264",width:1.15,accessory:"scarf",accent:"#caba8a"},Yoshiko:{source:"female_formal",top:"#859263",trousers:"#859263",hair:"#b3ada0",skin:"#c59b79",width:1.04,accessory:"bun-apron"},Emi:{source:"female_casual",top:"#c08d97",trousers:"#68657b",hair:"#775746",skin:"#d3a884",width:.95,accessory:"ponytail-satchel",accent:"#ded0ab"},"Mr Tanabe":{source:"suit",top:"#b9aa85",trousers:"#797565",hair:"#aaa998",skin:"#bd936e",width:1.02,accessory:"glasses"},Naoko:{source:"female_casual",top:"#b45a51",trousers:"#484753",hair:"#302f32",skin:"#c89977",width:.98,accessory:"headband-satchel",accent:"#7b5746"},Hiroshi:{source:"casual_2",top:"#778a53",trousers:"#535345",hair:"#79776a",skin:"#bb9269",width:1.12,accessory:"apron"},Fumiko:{source:"female_formal",top:"#9c7fac",trousers:"#9c7fac",hair:"#d6d2c8",skin:"#c69f82",width:1.08,accessory:"glasses"},Kenta:{source:"casual_2",top:"#78a7b8",trousers:"#546679",hair:"#825f44",skin:"#d4ac85",width:.96,accessory:"tool-pouch"},Yui:{source:"female_casual",top:"#66969a",trousers:"#45465e",hair:"#332d31",skin:"#d0a586",width:1.01,accessory:"headband",accent:"#e8cf85"},Barfly:{source:"casual_2",top:"#b74e43",trousers:"#36343a",hair:"#77766f",skin:"#b9825f",width:1.14,accessory:"hawaiian",interests:["seat","drink","radio"],snack:"yakitori",drink:"beer",meal:"yakitori",height:1.72}}).map(([n,e])=>[n,Object.freeze({...Uc,...e})]))),Tg=Object.freeze({Aiko:"Aya",Nozomi:"Reiko"}),Eg=n=>Fc[Tg[n]||n]||Uc;function sy(n){const e={};if(!n||typeof n!="object")return e;for(const t of Object.keys(Fc)){const i=n[t];if(!i||!Number.isSafeInteger(i.day)||!Number.isFinite(i.yen))continue;const r={day:i.day,yen:Math.max(0,Math.min(2400,i.yen)),purchases:[],activities:[],meals:{}};Array.isArray(i.purchases)&&(r.purchases=i.purchases.filter(o=>o&&typeof o.id=="string"&&typeof o.item=="string"&&Number.isFinite(o.cost)&&o.cost>=0).slice(-24).map(o=>({id:o.id.slice(0,160),item:o.item.slice(0,160),cost:o.cost}))),Array.isArray(i.activities)&&(r.activities=i.activities.filter(o=>typeof o=="string").slice(-8).map(o=>o.slice(0,180)));for(const o of["market","izakaya","ramen"]){const a=i.meals?.[o];!a||!["bun","rice","tea","ramen","fish","yakitori"].includes(a.item)||(r.meals[o]={stockClaim:a.stockClaim&&["bun","rice","tea"].includes(a.stockClaim.item)&&Number.isSafeInteger(a.stockClaim.unitCost)?{item:a.stockClaim.item,unitCost:a.stockClaim.unitCost}:null,item:a.item,drink:a.drink==="beer"?"beer":"tea",delivered:a.delivered===!0,finished:a.finished===!0,started:Number.isFinite(a.started)?a.started:null,waited:Number.isFinite(a.waited)?Math.max(0,Math.min(45,a.waited)):0,eaten:Number.isFinite(a.eaten)?Math.max(0,Math.min(42,a.eaten)):0})}const s=i.shopping;s&&["browse","pickup","queue","paid","finished"].includes(s.phase)&&Number.isFinite(s.started)&&(["tea","coffee","rice","biscuit","soap","notebook","postcard","battery","cola","water","beer","noodles","milk","bun"].includes(s.item)||s.phase==="browse"&&!s.picked)&&(r.shopping={phase:s.phase,started:s.started,finished:s.finished===!0,item:["tea","coffee","rice","biscuit","soap","notebook","postcard","battery","cola","water","beer","noodles","milk","bun"].includes(s.item)?s.item:null,picked:s.picked===!0,paid:s.paid===!0,timer:Number.isFinite(s.timer)?Math.max(0,Math.min(3,s.timer)):0,position:Array.isArray(s.position)&&s.position.length===3&&s.position.every(o=>Number.isFinite(o)&&Math.abs(o)<7)?s.position:[0,0,5.2]}),e[t]=r}return e}function oy(n=()=>null){const e={};function t(i,r){const s=n()||e,o=Math.floor(r/1440);s.residentLife??={};let a=s.residentLife[i];return(!a||a.day!==o)&&(a=s.residentLife[i]={day:o,yen:2400,purchases:[],activities:[]}),a}return{account:t,purchase(i,r,s,o,a){const l=t(i,r);return l.purchases.some(c=>c.id===s)?!0:!Number.isFinite(a)||a<0||l.yen<a?!1:(a===0||(l.yen-=a,l.purchases.push({id:s,item:o,cost:a}),l.purchases=l.purchases.slice(-24)),!0)},record(i,r,s){const o=t(i,r);o.activities.push(s),o.activities=o.activities.slice(-8)}}}const rt=n=>Wt(n),Ag=new Set(["Thuan","Mrs Higa","Mina","Grandmother Higa","Mrs Nakamura","Mrs Yonamine","Mrs Miyagi","Mrs Kamiya","Mrs Kinjō"]),kc=n=>Object.freeze(Object.fromEntries(Object.entries(n).map(([e,t])=>{const i=qo.find(r=>r.name===e)?.female??Ag.has(e);return[e,Wt({...t,body:{...t.body,silhouette:t.body.silhouette==="neutral"?i?"feminine":"masculine":t.body.silhouette}})]}))),xo=kc({Johansson:rt({name:"Johansson",body:{height:.72,build:.72,silhouette:"masculine",skin:"#dc9d7a"},head:{size:.48,shape:.45,form:"square",jaw:.75,cheeks:.55},hair:{style:"horseshoe",colour:"#b8b4aa"},eyes:{style:"gentle",colour:"#3d6a8a",size:.45,spacing:.52,height:.5,tilt:.45},brows:{style:"bushy",colour:"#a8a49a",size:.6,height:.55,tilt:.45},nose:{style:"wide",size:.6,height:.48},mouth:{style:"smile",colour:"#a8433e",size:.55,height:.5},facial:{style:"stubble",colour:"#b8b4aa"},wrinkles:.7,blush:.35,outfit:{top:"kariyushi",topColour:"#7fb0d8",pattern:"flowers",bottom:"shorts",bottomColour:"#c8b48a",footwear:"sandals",shoes:"#6d4a32",accent:"#f4f1ea"},swim:{colour:"#2f5f9e"}}),Thuan:rt({name:"Thuan",accessories:{earrings:"studs",neckwear:"pendant",colour:"#e0b93a"},body:{height:.36,build:.35,silhouette:"feminine",skin:"#f1cfae"},head:{size:.48,shape:.48,form:"heart",jaw:.3,cheeks:.62},hair:{style:"braids",colour:"#1c1714",flip:!1},eyes:{style:"lashes",colour:"#2a1d16",size:.78,spacing:.5,height:.48,tilt:.55},brows:{style:"arched",colour:"#2a1d16",size:.42,height:.55,tilt:.5},nose:{style:"dot",size:.35,height:.5},mouth:{style:"smile",colour:"#cc3d52",size:.42,height:.5},glasses:{style:"round",colour:"#e06a7a"},blush:.65,outfit:{top:"blouse",topColour:"#f4d23c",pattern:"flowers",bottom:"trousers",bottomColour:"#27304d",shoes:"#f4f1ea",accent:"#f4d23c"},swim:{colour:"#e98aa6"}}),Nao:rt({name:"Nao",body:{height:.42,build:.45,skin:"#e8bf98"},head:{size:.46,shape:.4,form:"oval",jaw:.35,cheeks:.45},hair:{style:"ponytail",colour:"#292a30"},eyes:{style:"almond",colour:"#2a1d16",size:.55,spacing:.5,height:.5,tilt:.6},brows:{style:"straight",colour:"#292a30",size:.5},nose:{style:"button",size:.4},mouth:{style:"grin",colour:"#b8544a",size:.5},blush:.3,outfit:{top:"apron",topColour:"#bd7557",bottom:"trousers",bottomColour:"#394b58",shoes:"#2b2b2b",hat:"kerchief",hatColour:"#27304d",accent:"#f4f1ea"}}),Aya:rt({name:"Aya",accessories:{earrings:"hoops",pin:!0,colour:"#c8a060"},body:{height:.34,build:.38,skin:"#efc9a4"},head:{size:.5,shape:.52,form:"round",jaw:.35,cheeks:.6},hair:{style:"bob",colour:"#2e211b"},eyes:{style:"round",colour:"#3a2a1e",size:.6,spacing:.5,height:.5,tilt:.5},brows:{style:"arched",colour:"#2e211b",size:.45},nose:{style:"button",size:.35},mouth:{style:"small",colour:"#c4485a",size:.45},glasses:{style:"round",colour:"#7a4a2a"},blush:.45,outfit:{hat:"beret",hatColour:"#5f8f6a",top:"jacket",topColour:"#5f8f6a",pattern:"dots",bottom:"longskirt",bottomColour:"#e6d3b0",shoes:"#6b4a2e",accent:"#f4e4c8"}}),Reiko:rt({name:"Reiko",accessories:{neckwear:"scarf",colour:"#d8342c"},body:{height:.46,build:.42,skin:"#e8bf98"},head:{size:.47,shape:.44,form:"oval",jaw:.4,cheeks:.4},hair:{style:"ponytail",colour:"#1c1714"},eyes:{style:"almond",colour:"#2a1d16",size:.5,tilt:.6},brows:{style:"straight",colour:"#1c1714",size:.5},nose:{style:"line",size:.4},mouth:{style:"smirk",colour:"#a8433e",size:.45},outfit:{top:"smock",topColour:"#3f5f7a",bottom:"trousers",bottomColour:"#2b2b33",shoes:"#2b2b2b",accent:"#f4f1ea"}}),Kenji:rt({name:"Kenji",body:{height:.6,build:.55,skin:"#c98d62"},head:{size:.48,shape:.5,form:"square",jaw:.6,cheeks:.45},hair:{style:"spiky",colour:"#2b1d14"},eyes:{style:"sparkle",colour:"#2a1d16",size:.55},brows:{style:"thick",colour:"#2b1d14",size:.55},nose:{style:"wide",size:.5},mouth:{style:"grin",size:.55},facial:{style:"stubble",colour:"#2b1d14"},outfit:{top:"kariyushi",topColour:"#f2a93b",pattern:"flowers",bottom:"shorts",bottomColour:"#3f5f7a",shoes:"#f4f1ea",accent:"#f4f1ea"}}),Tetsuo:rt({name:"Tetsuo",accessories:{pin:!0,colour:"#e0b93a"},body:{height:.44,build:.5,skin:"#dca97e"},head:{size:.5,shape:.5,form:"narrow",jaw:.55,cheeks:.35},hair:{style:"horseshoe",colour:"#8a8680"},eyes:{style:"sleepy",colour:"#2a1d16",size:.45},brows:{style:"bushy",colour:"#8a8680",size:.6},nose:{style:"hook",size:.55},mouth:{style:"flat",size:.5},glasses:{style:"half",colour:"#2b2b2b"},wrinkles:.6,outfit:{top:"jacket",topColour:"#6b6f4a",bottom:"trousers",bottomColour:"#4a4238",shoes:"#3a2a1e",accent:"#e8d7b0"}}),"Mrs Sato":rt({name:"Mrs Sato",body:{height:.22,build:.6,skin:"#e2b48c"},head:{size:.5,shape:.56,form:"round",jaw:.4,cheeks:.6},hair:{style:"bun",colour:"#c9c6c0"},eyes:{style:"gentle",colour:"#2a1d16",size:.45},brows:{style:"arched",colour:"#b9b6b0",size:.5},nose:{style:"button",size:.45},mouth:{style:"smile",colour:"#b8544a",size:.5},glasses:{style:"round",colour:"#6b4a2e"},wrinkles:.7,blush:.3,outfit:{top:"apron",topColour:"#ad6178",bottom:"trousers",bottomColour:"#4a4040",shoes:"#2b2b2b",hat:"kerchief",hatColour:"#f4f1ea",accent:"#f4f1ea"}}),"Mrs Higa":rt({name:"Mrs Higa",body:{height:.24,build:.58,skin:"#c99a74"},head:{size:.5,shape:.55,form:"round",jaw:.35,cheeks:.6},hair:{style:"perm",colour:"#9a968e"},eyes:{style:"sleepy",colour:"#2a1d16",size:.42},brows:{style:"thin",colour:"#8a8680",size:.45},nose:{style:"button",size:.45},mouth:{style:"small",colour:"#a8433e",size:.45},glasses:{style:"half",colour:"#6b4a2e"},wrinkles:.75,blush:.25,outfit:{top:"blouse",topColour:"#6d8a74",bottom:"skirt",bottomColour:"#3a3a42",shoes:"#2b2b2b",accent:"#f4f1ea"}}),"Harbour master":rt({name:"Harbour master",body:{height:.52,build:.68,skin:"#b5805d"},head:{size:.52,shape:.55,form:"round",jaw:.6,cheeks:.5},hair:{style:"horseshoe",colour:"#b9b7b0"},eyes:{style:"gentle",colour:"#2a1d16",size:.45},brows:{style:"bushy",colour:"#cfcdc6",size:.6},nose:{style:"wide",size:.55},mouth:{style:"flat",size:.5},glasses:{style:"round",colour:"#2b2b2b"},facial:{style:"walrus",colour:"#dedbd3"},wrinkles:.55,outfit:{top:"jacket",topColour:"#2c3e5c",bottom:"trousers",bottomColour:"#27304d",shoes:"#1c1c24",hat:"captain",hatColour:"#f4f1ea",accent:"#e0b93a"}}),"Officer Mori":rt({name:"Officer Mori",body:{height:.7,build:.48,skin:"#c79872"},head:{size:.48,shape:.46,form:"oval",jaw:.5,cheeks:.4},hair:{style:"crop",colour:"#4a4845"},eyes:{style:"round",colour:"#2a1d16",size:.62},brows:{style:"worried",colour:"#3a3835",size:.55},nose:{style:"button",size:.45},mouth:{style:"smile",size:.45},blush:.2,wrinkles:.2,outfit:{top:"polo",topColour:"#9dbfe0",bottom:"trousers",bottomColour:"#27304d",shoes:"#1c1c24",hat:"police",hatColour:"#27304d",accent:"#e0b93a"}})}),Nl=kc({Riku:rt({body:{silhouette:"masculine",height:.56,build:.55,skin:"#c89a74"},hair:{style:"crop",colour:"#33271f"},eyes:{style:"round"},brows:{style:"thick"},mouth:{style:"smile"},outfit:{top:"polo",topColour:"#587d83",bottom:"trousers",bottomColour:"#505f65",hat:"helmet",hatColour:"#dabb55"}}),"Emi Kado":rt({body:{silhouette:"feminine",height:.43,build:.42,skin:"#d1a079"},hair:{style:"ponytail",colour:"#3c2c24"},eyes:{style:"almond"},mouth:{style:"smile"},outfit:{top:"polo",topColour:"#a77e67",bottom:"trousers",bottomColour:"#465d69",hat:"cap",hatColour:"#465d69"}}),Haru:rt({head:{form:"square",jaw:.72,cheeks:.4},body:{height:.63,build:.58,skin:"#bf875f"},hair:{style:"crop",colour:"#302419"},eyes:{style:"narrow"},brows:{style:"thick"},nose:{style:"wide"},mouth:{style:"smile"},facial:{style:"stubble",colour:"#302419"},outfit:{top:"polo",topColour:"#607c84",bottom:"shorts",bottomColour:"#7b7155",hat:"cap",hatColour:"#c4b486"}}),Mina:rt({head:{form:"oval",jaw:.35,cheeks:.6},body:{height:.4,build:.45,skin:"#d8ac87"},hair:{style:"bun",colour:"#3b2920"},eyes:{style:"gentle",size:.48},brows:{style:"arched"},nose:{style:"button"},mouth:{style:"smile"},outfit:{top:"apron",topColour:"#849267",bottom:"longskirt",bottomColour:"#5c6e75"}}),Jun:rt({head:{form:"narrow",jaw:.4,cheeks:.3},body:{height:.53,build:.4,skin:"#dbb393"},hair:{style:"sidepart",colour:"#29241e"},eyes:{style:"almond"},brows:{style:"straight"},nose:{style:"line"},mouth:{style:"small"},glasses:{style:"half",colour:"#5b5c52"},outfit:{top:"polo",topColour:"#e0dac7",bottom:"trousers",bottomColour:"#3e596d"}}),"Grandmother Higa":rt({head:{size:.48,shape:.5,form:"round",jaw:.7,cheeks:.85},body:{height:.2,build:.6,skin:"#dca97e"},hair:{style:"perm",colour:"#d8d6d0"},eyes:{style:"gentle",size:.4},brows:{style:"thin",colour:"#9a9a96"},nose:{style:"button",size:.55},mouth:{style:"smile",size:.45},glasses:{style:"half",colour:"#8a4a3a"},wrinkles:1,blush:.4,outfit:{top:"blouse",topColour:"#8a4ab8",pattern:"flowers",bottom:"longskirt",bottomColour:"#6d7478",shoes:"#2b2b2b"}}),"Mr Ōshiro":rt({head:{size:.48,shape:.5,form:"narrow",jaw:.45,cheeks:.3},body:{height:.4,build:.4,skin:"#b27449"},hair:{style:"buzz",colour:"#d8d6d0"},eyes:{style:"narrow"},brows:{style:"bushy",colour:"#d8d6d0"},nose:{style:"hook",size:.6},mouth:{style:"flat"},facial:{style:"stubble",colour:"#d8d6d0"},wrinkles:.9,outfit:{top:"tee",topColour:"#f4f1ea",bottom:"trousers",bottomColour:"#6d7478",shoes:"#2b2b2b",hat:"straw",hatColour:"#e0c078"}}),"Uncle Kinjō":rt({head:{size:.48,shape:.5,form:"square",jaw:.8,cheeks:.65},body:{height:.55,build:.75,skin:"#c98d62"},hair:{style:"crop",colour:"#5a3a22"},eyes:{style:"dot"},brows:{style:"thick"},nose:{style:"wide"},mouth:{style:"wide"},facial:{style:"moustache",colour:"#3a2618"},wrinkles:.5,outfit:{top:"polo",topColour:"#2a8a5a",bottom:"shorts",bottomColour:"#c8b48a",shoes:"#6d4a32",hat:"cap",hatColour:"#d8342c"}}),"Mrs Nakamura":rt({head:{size:.48,shape:.5,form:"round",jaw:.55,cheeks:.8},body:{height:.25,build:.6,skin:"#e8bf98"},hair:{style:"bun",colour:"#5a3a22"},eyes:{style:"round",size:.55},brows:{style:"arched"},nose:{style:"button"},mouth:{style:"grin",colour:"#cc3d52"},blush:.5,wrinkles:.4,outfit:{top:"apron",topColour:"#3fa0c8",bottom:"skirt",bottomColour:"#27304d",shoes:"#f4f1ea",hat:"kerchief",hatColour:"#f4f1ea",accent:"#f4f1ea"}}),"Mr Shimabukuro":rt({head:{size:.48,shape:.5,form:"narrow",jaw:.5,cheeks:.35},body:{height:.5,build:.45,skin:"#dca97e"},hair:{style:"sidepart",colour:"#1c1714"},eyes:{style:"almond"},brows:{style:"straight"},nose:{style:"line"},mouth:{style:"smirk"},facial:{style:"moustache",colour:"#1c1714"},wrinkles:.3,outfit:{top:"smock",topColour:"#f4f1ea",bottom:"trousers",bottomColour:"#2b2b2b",shoes:"#2b2b2b"}}),"Mrs Yonamine":rt({head:{size:.48,shape:.5,form:"heart",jaw:.3,cheeks:.65},body:{height:.3,build:.55,skin:"#c98d62"},hair:{style:"ponytail",colour:"#3a2618"},eyes:{style:"sparkle"},brows:{style:"thick"},nose:{style:"button"},mouth:{style:"wide"},blush:.3,outfit:{top:"apron",topColour:"#2f5f9e",bottom:"trousers",bottomColour:"#27304d",shoes:"#f4f1ea",hat:"headband",hatColour:"#d8342c",accent:"#f4f1ea"}}),"Mrs Miyagi":rt({head:{size:.48,shape:.5,form:"oval",jaw:.35,cheeks:.4},body:{height:.1,build:.4,skin:"#c98d62"},hair:{style:"bun",colour:"#f4f1ea"},eyes:{style:"sleepy"},brows:{style:"thin",colour:"#d8d6d0"},nose:{style:"button"},mouth:{style:"small"},wrinkles:1,outfit:{top:"blouse",topColour:"#f4f1ea",bottom:"longskirt",bottomColour:"#2f5f9e",shoes:"#2b2b2b"}}),"Mr Tamaki":rt({head:{size:.48,shape:.5,form:"square",jaw:.7,cheeks:.4},body:{height:.6,build:.7,skin:"#c98d62"},hair:{style:"spiky",colour:"#1c1714"},eyes:{style:"round"},brows:{style:"thick"},nose:{style:"wide"},mouth:{style:"grin"},outfit:{top:"jacket",topColour:"#e8742a",bottom:"trousers",bottomColour:"#27304d",shoes:"#2b2b2b",hat:"headband",hatColour:"#f4f1ea"}}),Kōji:rt({head:{size:.48,shape:.5,form:"oval",jaw:.65,cheeks:.4},body:{height:.58,build:.5,skin:"#b27449"},hair:{style:"crop",colour:"#3a2618"},eyes:{style:"dot"},brows:{style:"straight"},nose:{style:"button"},mouth:{style:"grin"},outfit:{top:"tee",topColour:"#d8342c",bottom:"shorts",bottomColour:"#2f5f9e",shoes:"#f4f1ea",hat:"kerchief",hatColour:"#2f5f9e"}}),"Mr Nakasone":rt({head:{size:.48,shape:.5,form:"square",jaw:.75,cheeks:.6},body:{height:.42,build:.55,skin:"#dca97e"},hair:{style:"horseshoe",colour:"#d8d6d0"},eyes:{style:"gentle"},brows:{style:"bushy",colour:"#d8d6d0"},nose:{style:"wide"},mouth:{style:"smile"},glasses:{style:"square",colour:"#2b2b2b"},wrinkles:.8,outfit:{top:"polo",topColour:"#d8342c",bottom:"trousers",bottomColour:"#c8b48a",shoes:"#f4f1ea",hat:"cap",hatColour:"#f4f1ea"}}),"Mrs Kamiya":rt({head:{size:.48,shape:.5,form:"round",jaw:.5,cheeks:.7},body:{height:.2,build:.5,skin:"#e8bf98"},hair:{style:"perm",colour:"#9a9a96"},eyes:{style:"round",size:.45},brows:{style:"arched",colour:"#9a9a96"},nose:{style:"dot"},mouth:{style:"small",colour:"#e06a7a"},wrinkles:.8,blush:.4,outfit:{top:"polo",topColour:"#3fa0c8",bottom:"trousers",bottomColour:"#f4f1ea",shoes:"#f4f1ea",hat:"straw",hatColour:"#f4f1ea"}}),"Mr Arakaki":rt({head:{size:.48,shape:.5,form:"narrow",jaw:.3,cheeks:.25},body:{height:.35,build:.35,skin:"#dca97e"},hair:{style:"bald",colour:"#9a9a96"},eyes:{style:"narrow"},brows:{style:"worried",colour:"#9a9a96"},nose:{style:"hook"},mouth:{style:"flat"},glasses:{style:"round",colour:"#2b2b2b"},wrinkles:.9,outfit:{top:"polo",topColour:"#f4d23c",bottom:"trousers",bottomColour:"#27304d",shoes:"#2b2b2b",hat:"cap",hatColour:"#2f5f9e"}}),"Mrs Kinjō":rt({head:{size:.48,shape:.5,form:"heart",jaw:.4,cheeks:.55},body:{height:.32,build:.55,skin:"#dca97e"},hair:{style:"bob",colour:"#3a2618"},eyes:{style:"round"},brows:{style:"arched"},nose:{style:"button"},mouth:{style:"smile",colour:"#b8544a"},blush:.4,wrinkles:.3,outfit:{top:"blouse",topColour:"#e98aa6",pattern:"dots",bottom:"skirt",bottomColour:"#6d7478",shoes:"#9a6a42"}}),"Postman Tōma":rt({head:{size:.48,shape:.5,form:"oval",jaw:.5,cheeks:.4},body:{height:.6,build:.4,skin:"#e8bf98"},hair:{style:"sidepart",colour:"#3a2618",flip:!0},eyes:{style:"round"},brows:{style:"straight"},nose:{style:"line"},mouth:{style:"smile"},outfit:{top:"polo",topColour:"#2f5f9e",bottom:"trousers",bottomColour:"#27304d",shoes:"#2b2b2b",hat:"cap",hatColour:"#2f5f9e"}})}),Rg={captain:["captain","#f4f1ea"],police:["police","#27304d"],driver:["cap","#2a8a5a"],apron:["kerchief","#f4f1ea"],"headband-scarf":["headband","#efe2c3"],headband:["headband","#e8cf85"],"headband-satchel":["headband","#7b5746"]},So=new Map(qo.map(n=>[n.name,n.age])),Ul=(n,e)=>{const t=Sc(So.get(e));return So.has(e)&&n.age!==t?Wt({...n,age:t}):n};function Cg(n=""){const e=wg(n);if(e)return e;if(xo[n])return Ul(xo[n],n);if(Nl[n])return Ul(Nl[n],n);const t=Eg(n),i=Xo(n),r=l=>l[Math.floor(i()*l.length)],s=qo.find(l=>l.name===n)?.female??(/female/.test(t.source||"")||/^(Mrs |Aya|Reiko|Hana|Yoshiko|Emi|Naoko|Fumiko|Yui)/.test(n)),o=/^#[a-f0-9]{6}$/i.test(t.hair||"")&&parseInt(t.hair.slice(1,3),16)>150,a=Rg[t.accessory]||(t.helmet?["helmet",t.helmet]:["none","#f4f1ea"]);return Wt({name:n,age:Sc(So.get(n)),body:{silhouette:s?"feminine":"masculine",height:.3+i()*.45,build:.3+(Math.min(1.2,t.width||1)-.85)*1.6,skin:t.skin||"#e8bf98"},head:{size:.38+i()*.22,shape:i(),form:r(pt.head),jaw:.25+i()*.5,cheeks:.25+i()*.5},hair:{style:r(o&&!s?["horseshoe","buzz","crop"]:s?["bob","long","ponytail","bun","sidepart"]:["crop","sidepart","spiky","buzz"]),colour:t.hair||"#1c1714",flip:i()<.5},eyes:{style:r(pt.eyes),size:.35+i()*.35,spacing:.4+i()*.2,tilt:.4+i()*.2},brows:{style:r(pt.brows.slice(0,6)),colour:t.hair||"#1c1714"},nose:{style:r(pt.nose.slice(0,5)),size:.35+i()*.4},mouth:{style:r(pt.mouth),colour:s?"#cc3d52":"#b8544a"},glasses:{style:/glasses/.test(t.accessory||"")?"square":"none",colour:"#2b2b2b"},facial:{style:!s&&i()<.25?r(["moustache","stubble","goatee"]):"none",colour:t.hair||"#1c1714"},blush:s?.4:.15,wrinkles:o?.7:0,outfit:{top:t.accessory==="apron"?"apron":t.accessory==="hawaiian"?"kariyushi":s?"blouse":"polo",topColour:t.top||"#3fa0c8",pattern:t.accessory==="hawaiian"?"flowers":"none",bottom:s&&t.top===t.trousers?"longskirt":"trousers",bottomColour:t.trousers||"#27304d",shoes:"#2b2b2b",hat:a[0],hatColour:a[1],accent:t.accent||"#f4d23c"}})}const Fl=Object.freeze({x:-25,z:-44,width:8.8,depth:7.4,door:Object.freeze([-25,0,-39.65])}),ay=Object.freeze({width:8.4,depth:7,bounds:{minX:-4.2,maxX:4.2,minZ:-3.5,maxZ:3.5},doorX:0,spawn:[0,0,2.9],exit:[0,1.1,3.42],yaw:0,staff:{Kenji:[-1.25,0,-1.9],Tetsuo:[1.5,0,-1.9]}}),Oc=Object.freeze({title:"Dock Electrical & Repair Workshop",jp:"Dock Electrical Workshop",sub:"ELECTRICAL · INSTRUMENTS · REPAIRS",industrialWorkshop:!0,x:Fl.x,z:Fl.z,line:"Kenji’s fabrication and Form 3D bench, with Tetsuo’s electrical and instrument repairs.",directions:"On the western quay, beside the harbour warehouse. Look for the blue electrical workshop sign."}),Bc=Object.freeze([{id:"yuri-home",entry:"one",number:"1",residents:["Thuan","Nao"]},{id:"resident-home-aya",entry:"two",number:"2",residents:["Aya","Reiko"]},{id:"resident-home-kenji",entry:"three",number:"3",residents:["Kenji","Tetsuo"]},{id:"resident-home-mrs-sato",entry:"four",number:"4A",residents:["Mrs Sato"]},{id:"resident-home-officer-mori",entry:"four",number:"4B",residents:["Officer Mori"]},{id:"resident-home-harbour-master",entry:"five",number:"5A",residents:["Harbour master"]},{id:"resident-home-bus-driver",entry:"five",number:"5B",residents:["Bus driver"]}].map(n=>Object.freeze({...n,residents:Object.freeze(n.residents),address:n.number+" Main Street",title:n.residents.join(" & ")+"’s home"}))),Pg=Object.freeze({"resident-home-nao":"yuri-home","resident-home-reiko":"resident-home-aya","resident-home-tetsuo":"resident-home-kenji"}),zc=n=>Pg[n]||n,Lg=n=>Bc.find(e=>e.residents.includes(n)),Ig=n=>Bc.find(e=>e.id===zc(n?.id))||Lg(n?.homeOwner),ly=n=>n?.homeOwners||Ig(n)?.residents||(n?.homeOwner?[n.homeOwner]:[]),Mi=Object.freeze({LEGACY:"legacy",SHOPPING:"shopping-district",PENINSULA:"peninsula"});let ts=Mi.LEGACY;function cy(n=Mi.LEGACY){return ts=Object.values(Mi).includes(n)?n:Mi.LEGACY,ts}const hy=()=>ts!==Mi.LEGACY,Dg=()=>ts===Mi.PENINSULA,uy=Object.freeze({z:1.6,width:8.8,depth:7.4}),dy=Object.freeze({width:8.4,depth:7,doorX:0,bounds:{minX:-4.2,maxX:4.2,minZ:-3.5,maxZ:3.5},spawn:[0,0,2.9],exit:[0,1.1,3.42],yaw:0,staff:{Aya:[-2.6,0,1.2],Reiko:[-2.6,0,-1.9]}}),Gc=Object.freeze({title:"Front-Row Books",jp:"Front-Row Books",sub:"BOOKS · NEWSPAPERS · LOCAL STORIES",bookshop:!0,side:-1,line:"Aya’s small neighbourhood bookshop, with reading copies, second-hand books and Reiko’s evening newspaper.",directions:"On the west pavement, north of Minato Izakaya. A quiet bookshop with a window reading chair and a counter for recommendations."}),Vc=Object.freeze({journal:"frontrow",electronics:"form3d",stepwise:"form3d",career:"office"}),Ng=n=>Vc[n]||n,fy=n=>n==="form3d",wo=Object.freeze([{id:"frontrow",title:"Front-Row Books & Press",jp:"Maegeru Shobo/Printing",sub:"BOOKS · EVENING PRESS",side:1,z:4,color:7559241,accent:"#8b3f36",line:"Aya’s books and Reiko’s evening paper, under one roof.",directions:"The bookshop and printing desk share the west block, facing Main Street."},{id:"form3d",title:"Kenji & Tetsuo Repairs",jp:"Three-dimensional/electrical workshop",sub:"PATTERNS · RADIOS · INSTRUMENTS",side:1,z:4,color:5663603,accent:"#385f6e",line:"Kenji’s pattern bench and Tetsuo’s radio and instrument repairs.",directions:"The repair workshop is in the east block, across Main Street from the bookshop."},{id:"office",title:"Johansson Harbour Office",jp:"Port Affairs and Technology Office",sub:"MARINE SERVICE · HARBOUR RECORDS",side:1,z:-42,color:6453102,accent:"#49675d",line:"Shipping records, tide tables and Johansson’s marine service files.",directions:"Follow the main street to the quay. The harbour office is on the right, opposite the warehouse."},{id:"market",title:"Sakura Shōten",jp:"Sakura Shop",sub:"DAILY GOODS",side:-1,z:-28,color:10321022,accent:"#a76680",line:"Thuan’s convenience store · tea, snacks and everyday things."}].map(Object.freeze)),Ug=()=>wo.map(n=>({...n})),py=()=>Ug().filter(n=>["market","frontrow","form3d","office"].includes(n.id)).map(n=>n.id==="frontrow"?{...n,...Gc}:n.id==="form3d"?{...n,...Oc}:n);function my(n){const e=new Set(Object.keys(Vc));for(let t=n.length-1;t>=0;t--)e.has(n[t].id)&&n.splice(t,1);for(const t of wo){const i=n.find(r=>r.id===t.id);i&&Object.assign(i,t)}if(Dg()){let t=n.find(r=>r.id==="form3d");t||(t={...wo.find(r=>r.id==="form3d")},n.push(t)),Object.assign(t,Oc);const i=n.find(r=>r.id==="frontrow");i&&Object.assign(i,Gc)}return n}function Fg(n=[]){return[...new Set(n.map(e=>zc(Ng(e))))]}const ns="johansson-town-1988-v5",kg=["johansson-town-1988-v4","johansson-town-1988-v3"];function Og(n){const e=t=>typeof t=="string"?t.replace(/\b(?:Yuri|Yui)\b/g,"Thuan"):t;for(const t of["residentLocations","residentLife"]){const i=n[t];if(!(!i||typeof i!="object"||Array.isArray(i)))for(const r of["Yuri","Yui"])Object.hasOwn(i,r)&&(Object.hasOwn(i,"Thuan")||(i.Thuan=i[r]),delete i[r])}Array.isArray(n.notes)&&(n.notes=[...new Set(n.notes.map(e))]);for(const t of Object.values(n.residentLife||{}))Array.isArray(t?.activities)&&(t.activities=t.activities.map(e));if(Array.isArray(n.sakura?.journal))for(const t of n.sakura.journal)t&&typeof t=="object"&&(t.buyer=e(t.buyer));return n}const Hc="johansson-town-players",Yr=Object.freeze({id:"player-1",name:"Visitor"}),Bg=n=>n===Yr.id?ns:ns+"@"+n,is=n=>String(n||"").replace(/[\u0000-\u001f<>]/g,"").trim().slice(0,24);function Di(n){let e=null;try{e=JSON.parse(n?.getItem?.(Hc))}catch{}const t=Array.isArray(e?.players)?e.players.filter(r=>r&&typeof r.id=="string"&&/^[\w-]{1,40}$/.test(r.id)).map(r=>({id:r.id,name:is(r.name)||"Visitor",created:Number(r.created)||0,lastPlayed:Number(r.lastPlayed)||0})):[];return t.some(r=>r.id===Yr.id)||t.unshift({...Yr,created:0,lastPlayed:0}),{active:t.some(r=>r.id===e?.active)?e.active:Yr.id,players:t}}function ms(n,e){try{return n.setItem(Hc,JSON.stringify(e)),!0}catch{return!1}}const gy=n=>{const e=Di(n);return e.players.find(t=>t.id===e.active)};function _y(n,e,t=Date.now()){const i=Di(n),r="player-"+t.toString(36)+Math.floor(Math.random()*1296).toString(36);return i.players.push({id:r,name:is(e)||"Visitor",created:t,lastPlayed:t}),i.active=r,ms(n,i),r}function yy(n,e){const t=Di(n);return t.players.some(i=>i.id===e)?(t.active=e,ms(n,t)):!1}function vy(n,e){const t=Di(n),i=t.players.find(r=>r.id===t.active);return!i||!is(e)?!1:(i.name=is(e),ms(n,t))}function by(n,e=Date.now()){const t=Di(n),i=t.players.find(r=>r.id===t.active);i&&(i.lastPlayed=e,ms(n,t))}function My(n){const e=Bg(Di(n).active);for(const t of e===ns?[ns,...kg]:[e])try{const i=JSON.parse(n.getItem(t));if(i&&typeof i=="object"&&!Array.isArray(i))return Array.isArray(i.visited)&&(i.visited=Fg(i.visited.filter(r=>typeof r=="string"))),Og(i)}catch{}return null}function qr(n){return{scale:Math.max(.5,Math.min(.9,((n.thigh+n.shin)*.94+n.foot-n.seatDrop)/.56)),saddle:.74}}function xy(n,e,t,i,r){const s=Math.sin(t)*.54*i,o=Math.cos(t)*.54*i;return r(n,e,.28)||r(n-s,e-o,.23*i)||r(n+s,e+o,.23*i)}function kl(n,e,t){const i=n.getWorldPosition(new P),r=e.getWorldPosition(new P).sub(i).normalize(),s=t.clone().sub(i).normalize(),o=new _t().setFromUnitVectors(r,s).multiply(n.getWorldQuaternion(new _t));n.quaternion.copy(n.parent.getWorldQuaternion(new _t).invert().multiply(o)),n.updateWorldMatrix(!1,!0)}function Ol(n,e,t,i,r){const s=n.getWorldPosition(new P),o=e.getWorldPosition(new P),a=t.getWorldPosition(new P),l=s.distanceTo(o),c=o.distanceTo(a),h=i.clone().sub(s),u=ke.clamp(h.length(),Math.abs(l-c)+1e-4,l+c-1e-4);h.normalize();const p=r.clone().addScaledVector(h,-r.dot(h)).normalize(),f=(l*l-c*c+u*u)/(2*u),g=Math.sqrt(Math.max(0,l*l-f*f));kl(n,e,s.clone().addScaledVector(h,f).addScaledVector(p,g)),kl(e,t,s.clone().addScaledVector(h,u))}function zg(n,e=0,t=qr(n.measure)){const{bones:i,measure:r,root:s}=n,o=s.parent,a=t.scale;s.updateWorldMatrix(!0,!0);const l=o?o.getWorldQuaternion(new _t):new _t,c=(p,f,g)=>{const _=new P(p,f,g);return o?o.localToWorld(_):_},h=(p,f,g)=>new P(p,f,g).applyQuaternion(l),u=s.getWorldQuaternion(new _t);for(const[p,f,g]of[["L",-1,Math.PI],["R",1,0]]){const _=e*Math.PI*2+g;Ol(i["thigh"+p],i["knee"+p],i["foot"+p],c(f*.12*a,(.32+Math.sin(_)*.12)*a+r.foot,(.12+Math.cos(_)*.12)*a),h(0,0,-1));const m=i["foot"+p];m.quaternion.copy(m.parent.getWorldQuaternion(new _t).invert().multiply(u)),m.updateWorldMatrix(!1,!0),Ol(i["shoulder"+p],i["elbow"+p],i["hand"+p],c(f*.25*a,1.04*a+r.hand*.55,-.25*a),h(f,-.2,.1));const d=i["hand"+p];d.quaternion.copy(d.parent.getWorldQuaternion(new _t).invert().multiply(l)),d.updateWorldMatrix(!1,!0)}}function Gg(n,e=2.4){const t=ke.clamp(n/e,0,1);return{lift:ke.smoothstep(t,0,.3)*(1-ke.smoothstep(t,.7,1)),swallow:ke.smoothstep(t,.4,.65),done:t>=1}}function Wc(n,e,t=!1){return t?0:-(.55+.2*(1-ke.clamp(n?.userData?.portion??1,0,1)))*e}function Vg(n,e,t=!1){return t?0:-.05*(1-ke.clamp(n?.userData?.portion??1,0,1))*ke.smoothstep(e,.5,1)}function Bl(n,e,t){const i=n.getWorldPosition(new P),r=e.getWorldPosition(new P).sub(i).normalize(),s=new _t().setFromUnitVectors(r,t.clone().sub(i).normalize()).multiply(n.getWorldQuaternion(new _t));n.quaternion.copy(n.parent.getWorldQuaternion(new _t).invert().multiply(s)),n.updateWorldMatrix(!1,!0)}function Hg(n,e){const t=n.bones,i=t.shoulderR.getWorldPosition(new P),r=i.distanceTo(t.elbowR.getWorldPosition(new P)),s=t.elbowR.getWorldPosition(new P).distanceTo(t.handR.getWorldPosition(new P)),o=e.clone().sub(i),a=ke.clamp(o.length(),Math.abs(r-s)+1e-4,r+s-1e-4);o.normalize();const l=new P(-1,-.25,0).transformDirection(n.root.matrixWorld);l.addScaledVector(o,-l.dot(o)).normalize();const c=(r*r-s*s+a*a)/(2*a),h=Math.sqrt(Math.max(0,r*r-c*c));Bl(t.shoulderR,t.elbowR,i.clone().addScaledVector(o,c).addScaledVector(l,h)),Bl(t.elbowR,t.handR,i.clone().addScaledVector(o,a))}function Wg(n,e,t=!1,i=null){const{root:r,measure:s,bones:o}=n;r.updateWorldMatrix(!0,!0);const a=fs(n.recipe),l=o.head,c=Math.PI*.28+a.mouthY/256*Math.PI*.58,h=Math.PI/2-.95+a.mouthX/256*1.9,u=or(new P(-Math.cos(h)*Math.sin(c),Math.cos(c),Math.sin(h)*Math.sin(c)),s.profile),p=new P(u.x*s.Rh*s.headSX,s.headCentre-s.headY+u.y*s.Rh*s.headSY,u.z*s.Rh*.98+.025*s.k),f=r.localToWorld(new P(-s.shoulderX,s.shoulderY-s.upper*.75,s.depth*.75+s.fore*.45)),g=r.getWorldQuaternion(new _t).multiply(new _t().setFromAxisAngle(new P(1,0,0),Wc(i,e,t))),_=new P(t?0:-.1*s.k,t?.04:(i?.userData.rimHeight??.15)-.08*s.k,t?.115:.015*s.k).applyQuaternion(g),m=o.shoulderR.getWorldPosition(new P),d=(s.upper+s.fore)*.985;let v=null;for(let M=0;M<12;M++){l.updateWorldMatrix(!0,!1),v=f.clone().lerp(l.localToWorld(p.clone()).sub(_),e);const x=v.distanceTo(m)-d;if(x<=5e-4||e<.01)break;l.rotation.x+=Math.min(.12,x/(s.Rh*1.1))}Hg(n,v),o.handR.quaternion.copy(o.handR.parent.getWorldQuaternion(new _t).invert().multiply(g)),o.handR.updateWorldMatrix(!1,!0)}function rs(n,e,t=0,i="R"){const r=!!e.userData.food,s=n.measure,o=n.bones["hand"+i];n.root.updateWorldMatrix(!0,!0);const a=n.root.getWorldQuaternion(new _t).multiply(new _t().setFromAxisAngle(new P(1,0,0),Wc(e,t,r))),l=new P(r?0:(i==="R"?-.1:.1)*s.k,r?0:-.08*s.k,.015*s.k).applyQuaternion(a),c=o.getWorldPosition(new P).add(l),h=new Ve().compose(c,a,new P(1,1,1));e.matrixAutoUpdate=!1,e.matrix.copy(o.matrixWorld).invert().multiply(h),e.matrixWorldNeedsUpdate=!0}const Vr=["hips","spine","chest","neck","head","shoulderL","elbowL","handL","shoulderR","elbowR","handR","thighL","kneeL","footL","thighR","kneeR","footR"],Xg=(n,e)=>n<0||n>e?0:Math.sin(Math.PI*Math.min(1,n/e)),Yg=(n,e,t=.25)=>Math.min(1,n/t,(e-n)/t),er=Object.freeze({Wave:1.6,Bow:1.5,Nod:1.1,HeadShake:1.2,Point:1.6,Shrug:1.3,Clap:1.8,Laugh:2,Think:2.4,LookAround:2.6,Stretch:2.2,PickUp:1.6,Fist:1.4,Jab:.42,JabL:.42,Swipe:.7,Hurt:.5,Jump:.9,Cheer:1.6,Hop:1.2,Gasp:1.6,Stomp:1.4,Slump:2.2,Fidget:2.4,SitEnjoyFood:3.8,SitPresentFood:4.2,SitToast:2.4,SitDrink:2.4,SitEat:2.4,Drink:2.4,Eat:2.4,Talk:1/0,Kachashi:1/0,Crouch:1/0,Phone:1/0,FishIdle:1/0,Reel:1/0}),qg=Object.freeze({happy:"Hop",laugh:"Laugh",sad:"Slump",angry:"Stomp",shy:"Fidget",surprised:"Gasp",worried:"Think"});function To(n){const{bones:e,measure:t}=n,i=Xo(n.recipe.name||JSON.stringify(n.recipe)),r=.92+i()*.16,s=.8+i()*.25,o=(i()-.5)*.055,a=.85+i()*.3,l=Object.fromEntries(Vr.map(q=>[q,new P])),c=Object.fromEntries(Vr.map(q=>[q,new P])),h=new P;let u=0,p=Math.random()*10,f=0,g=0,_=null,m=1+Math.random()*3,d=-1,v=0,M=0,x=[0,0],D=2,R="neutral",A=null,w=0,S=null,b=0;const y=(q,N=0,K=0,he=0)=>c[q].set(N,K,he),L=(q,N=0,K=0,he=0)=>c[q].add(new P(N,K,he));function U(q){return q in er?(_={name:q,t:0,d:er[q]},!0):!1}const k=()=>{_=null};function j(q,N={}){p+=q;const K=_?.name||N.pose||N.seat,he=["Eat","EatStanding","SitEat"].includes(K),X=["Drink","DrinkStanding","SitDrink","SitToast"].includes(K);if(he||X){K!==S&&(w=0),w+=q;const Y=Number.isFinite(N.consumeElapsed)?N.consumeElapsed:_?_.t+q:w%5;A={...Gg(Y),food:he,elapsed:w,cycle:Math.floor(w/5)}}else A=null,w=0;S=K;for(const Y of Vr)c[Y].set(0,0,0);let Q=0,we=0;const W=N.speed||0,oe=W>.08&&!N.seated&&!N.riding;if(y("shoulderL",0,0,.13),y("shoulderR",0,0,-.13),y("elbowL",-.12),y("elbowR",-.12),N.riding){const Y=N.ridePhase||0,I=N.bicycleFit||qr(t);Q=I.saddle*I.scale-t.hipY+t.seatDrop,y("thighL",-1.05+Math.sin(Y*Math.PI*2)*.38),y("kneeL",1.05+Math.cos(Y*Math.PI*2)*.4),y("thighR",-1.05-Math.sin(Y*Math.PI*2)*.38),y("kneeR",1.05-Math.cos(Y*Math.PI*2)*.4),y("chest",.28),y("head",-.18),y("shoulderL",-1.15,0,.18),y("shoulderR",-1.15,0,-.18),y("elbowL",-.35),y("elbowR",-.35)}else if(N.seated){const Y=N.seat==="Soak"||N.pose==="Soak";Q=(Number.isFinite(N.seatHeight)?N.seatHeight:.45)-t.hipY+t.seatDrop,y("thighL",-1.52,0,.06),y("thighR",-1.52,0,-.06),y("kneeL",1.45),y("kneeR",1.45),y("shoulderL",-.45,0,.15),y("shoulderR",-.45,0,-.15),y("elbowL",-.55),y("elbowR",-.55),L("chest",Math.sin(p*1.5)*.02);const I=N.pose;if(I==="Type")y("shoulderL",-.9,0,.1),y("shoulderR",-.9,0,-.1),y("elbowL",-.7+Math.sin(p*14)*.08),y("elbowR",-.7+Math.sin(p*13+1)*.08),y("head",.15);else if(I==="Eat"||I==="Drink"||N.seat==="SitEat"){const ue=Math.max(0,Math.sin(p*1.4))**4;y("shoulderR",-.6-ue*.9,0,-.25),y("elbowR",-.8-ue*1.3),y("head",.08-ue*.1)}else if(I==="Sleep"||N.sleeping)y("head",.45,0,.15),y("chest",.15);else if(Y)y("thighL",-1.3,0,.25),y("thighR",-1.3,0,-.25),y("kneeL",.9),y("kneeR",.9),y("shoulderL",0,0,.9),y("shoulderR",0,0,-.9),y("head",-.1);else if(I==="Wake"){const ue=Math.max(0,Math.sin(p*.8));y("shoulderL",0,0,.4+ue*2.2),y("shoulderR",0,0,-.4-ue*2.2)}}else if(oe){const Y=N.running||W>2.6,I=t.leg*(Y?2.6:1.7)*r;u+=W/I*Math.PI*2*q*.5;const ue=Y?.95:Math.min(.62,.25+W*.3),ee=Math.sin(u),ve=Math.cos(u);y("thighL",-ee*ue),y("thighR",ee*ue),y("kneeL",Math.max(0,Math.sin(u-.9))*ue*1.5+.05),y("kneeR",Math.max(0,Math.sin(u+Math.PI-.9))*ue*1.5+.05),y("footL",ee*ue*.3),y("footR",-ee*ue*.3),y("shoulderL",ee*ue*s,0,.12),y("shoulderR",-ee*ue*s,0,-.12),y("elbowL",Y?-1.35:-.25-Math.max(0,-ee)*.3),y("elbowR",Y?-1.35:-.25-Math.max(0,ee)*.3),y("hips",0,ee*.14,0),y("chest",Y?.22:.05,-ee*.18,0),y("head",Y?-.12:-.02,ee*.08,0),we=Math.abs(ve)*(Y?.055:.025)*t.k-(Y?.02:0),N.carrying&&(y("shoulderL",-1.15,0,.3),y("shoulderR",-1.15,0,-.3),y("elbowL",-.5),y("elbowR",-.5))}else{L("chest",Math.sin(p*1.6)*.025),y("hips",0,0,Math.sin(p*.45)*.035),L("head",Math.sin(p*.7)*.03,Math.sin(p*.31)*.12,Math.sin(p*.5)*.04),L("thighL",0,0,-Math.sin(p*.45)*.03),L("thighR",0,0,-Math.sin(p*.45)*.03),L("chest",o),L("head",0,Math.sin(p*.31*a)*.035,0),we=Math.sin(p*1.6*a)*.004;const Y=N.pose;if(Y==="CounterIdle")y("shoulderL",-.5,0,.2),y("shoulderR",-.5,0,-.2),y("elbowL",-.95),y("elbowR",-.95);else if(Y==="Interact")y("shoulderL",-.75+Math.sin(p*4.5)*.18,0,.15),y("shoulderR",-.75+Math.sin(p*4.5+1.7)*.18,0,-.15),y("elbowL",-.8),y("elbowR",-.8),L("chest",.12),L("head",.2);else if(Y==="DrinkStanding"||Y==="Drink"){const I=Math.max(0,Math.sin(p*1.2))**4;y("shoulderR",-.5-I*1.1,0,-.2),y("elbowR",-.9-I*1.2)}else(Y==="Sit"||Y==="Sleep")&&y("head",.2);N.carrying&&(y("shoulderL",-1.15,0,.3),y("shoulderR",-1.15,0,-.3),y("elbowL",-.5),y("elbowR",-.5))}const se=ke.clamp((N.tipsy||0)/2.5,0,1);let ae=0;if(se>0&&!N.riding&&!N.airborne){const Y=Math.sin(p*1.7),I=Math.max(0,Math.sin(p*.43+Math.sin(p*.19)*2))**8;if(N.seated)L("head",.22*se+Math.sin(p*.6)*.06*se,Math.sin(p*.37)*.1*se,Math.sin(p*.5)*.12*se),L("chest",.08*se,0,Math.sin(p*.5)*.05*se);else if(oe){const ue=1+Math.sin(u*.5)*.35*se;c.thighL.x*=ue,c.thighR.x*=2-ue,L("hips",0,0,Y*.12*se),L("chest",.06*se+I*.25*se,0,-Y*.14*se),L("head",.1*se,Math.sin(p*.8)*.15*se,Y*.18*se),L("shoulderL",0,0,.35*se),L("shoulderR",0,0,-.35*se),ae=Y*.07*se+I*Math.sign(Math.sin(p*.21))*.06*se}else L("hips",0,0,Math.sin(p*.9)*.06*se),L("chest",.04*se,0,-Math.sin(p*.9)*.08*se),L("head",.12*se,Math.sin(p*.4)*.12*se,Math.sin(p*.9+.6)*.12*se),L("thighL",0,0,.05*se),L("thighR",0,0,-.05*se),ae=Math.sin(p*.9)*.04*se}b+=(ae-b)*(1-Math.exp(-q*6)),N.airborne&&!N.seated&&(y("thighL",-.6),y("thighR",-.2),y("kneeL",1),y("kneeR",.6),y("shoulderL",-.3,0,1.6),y("shoulderR",-.3,0,-1.6));const Pe=N.expression||"neutral";if(Pe!==R){R=Pe;const Y=qg[Pe];Y&&!N.seated&&!oe&&!_&&U(Y)}if(N.waving&&!_&&U("Wave"),_)if(_.t+=q,_.t>=_.d)_=null;else{const Y=z(_);Y?.root!==void 0&&(Q+=Y.root)}let Oe=null;if(N.gaze&&!N.sleeping){h.set(...N.gaze.isVector3?N.gaze.toArray():N.gaze),n.root.worldToLocal(h);const Y=Math.atan2(h.x,h.z),I=-Math.atan2(h.y-t.headCentre,Math.hypot(h.x,h.z));if(Math.abs(Y)<2.4){const ue=ke.clamp(Y,-1.35,1.35),ee=ke.clamp(I,-.45,.4);L("head",ee*.8,ue*.62,0),L("chest",ee*.15,ue*.3,0),Oe=[ke.clamp((Y-ue*.62)*1.6,-1,1),ke.clamp(ee*.5,-.6,.6)]}}const De=1-Math.exp(-q*14);for(const Y of Vr)l[Y].lerp(c[Y],De),e[Y].rotation.set(l[Y].x,l[Y].y,l[Y].z);f+=(Q-f)*(N.seated||N.riding?1-Math.exp(-q*9):De),g+=(we-g)*De,N.riding&&(f=Q),n.root.position.x=N.riding?0:b,n.root.position.z=N.riding?.21*(N.bicycleFit||qr(t)).scale:0,n.root.position.y=f+(N.seated||N.riding?0:N.floorHeight||0),e.hips.position.y=t.hipY+(N.riding?0:g),N.riding?zg(n,N.ridePhase||0,N.bicycleFit||qr(t)):A&&(e.head.rotation.x+=Vg(N.heldProp,A.lift,A.food),Wg(n,A.lift,A.food,N.heldProp)),m-=q,m<=0&&d<0&&(d=0,m=1.8+Math.random()*3.8);let Je=0;d>=0&&(d+=q,Je=d<.13?1:0,d>=.13&&(d=-1)),N.talking?(v-=q,v<=0&&(v=.09+Math.random()*.12,M=M?0:Math.random()<.8?1:0)):M=0,D-=q,D<=0&&(D=1.2+Math.random()*3,x=Math.random()<.45?[0,0]:[(Math.random()-.5)*1.6,(Math.random()-.5)*.8]);const te=N.sleeping?"sleep":Pe;n.paintFace({expression:te,blink:Je,talk:M,look:N.look||Oe||(te==="thinking"?[1,-1]:x)})}function z(q,N){const K=q.t,he=q.d,X=he===1/0?1:Xg(K,he),Q=he===1/0?Math.min(1,K/.3):Yg(K,he);switch(q.name){case"Wave":y("shoulderR",-.2,0,-2.55*Q),y("elbowR",0,0,-.45+Math.sin(K*10)*.45*Q),L("head",0,0,.08*Q);break;case"Bow":L("chest",.95*X),L("spine",.25*X),L("head",.2*X),y("shoulderL",.1,0,.05),y("shoulderR",.1,0,-.05);break;case"Nod":L("head",Math.sin(K*9)*.28*X);break;case"HeadShake":L("head",0,Math.sin(K*11)*.45*X);break;case"Point":y("shoulderR",-1.5*Q,.2,-.1),y("elbowR",-.05),L("head",0,-.15*Q);break;case"Shrug":y("shoulderL",-.3*X,0,.55*X+.13),y("shoulderR",-.3*X,0,-.55*X-.13),y("elbowL",-1.3*X),y("elbowR",-1.3*X),L("head",0,0,.2*X);break;case"Clap":{const we=Math.abs(Math.sin(K*9));y("shoulderL",-1.2*Q,0,.1+we*.35),y("shoulderR",-1.2*Q,0,-.1-we*.35),y("elbowL",-.9*Q),y("elbowR",-.9*Q);break}case"Laugh":L("chest",-.24*X+Math.sin(K*16)*.07*X),L("head",-.32*X),y("shoulderL",-.85*X,0,.4),y("shoulderR",-.85*X,0,-.4),y("elbowL",-1.65*X),y("elbowR",-1.65*X);break;case"Gasp":return L("chest",-.18*X),L("head",-.12*X),y("shoulderL",-.7*X,0,.28),y("shoulderR",-.7*X,0,-.28),y("elbowL",-1.9*X),y("elbowR",-1.9*X),{root:Math.sin(Math.PI*K/he)*.045};case"Think":y("shoulderR",-1.25*Q,0,-.35),y("elbowR",-1.95*Q),y("shoulderL",-.4*Q,0,.3),y("elbowL",-1.4*Q),L("head",.12*Q,0,.18*Q);break;case"LookAround":L("head",0,Math.sin(K*2.4)*.75*X),L("chest",0,Math.sin(K*2.4)*.2*X);break;case"Stretch":y("shoulderL",-.2,0,2.8*X),y("shoulderR",-.2,0,-2.8*X),L("chest",-.25*X),L("head",-.3*X);break;case"PickUp":return L("chest",1.1*X),L("spine",.3*X),y("shoulderR",-1.3*X),y("thighL",-.5*X),y("thighR",-.5*X),y("kneeL",.9*X),y("kneeR",.9*X),{root:-.08*X};case"Fist":y("shoulderR",-2.4*Q+Math.sin(K*8)*.2*Q,0,-.1),y("elbowR",-.5*Q),L("chest",-.1*Q);break;case"Jab":case"JabL":{const we=q.name==="Jab",W=we?"R":"L",oe=we?"L":"R",se=we?1:-1,ae=K<.1?-(K/.1)*.3:K<.2?(K-.1)/.1:Math.max(0,1-(K-.2)/.22);return y("shoulder"+W,-.9-.75*ae,0,-se*.05),y("elbow"+W,-1.9+1.85*ae),y("shoulder"+oe,-1.05,0,se*.18),y("elbow"+oe,-2.1),L("chest",.06*ae,-se*.4*ae),L("head",0,se*.12*ae),{root:-.02*Q}}case"Swipe":{const we=K<.32?K/.32:Math.max(0,1-(K-.32)/.14),W=K<.32?0:Math.min(1,(K-.32)/.14)*Math.max(0,1-(K-.5)/.2);return y("shoulderL",-2.7*we-1.2*W,0,.25),y("shoulderR",-2.7*we-1.2*W,0,-.25),y("elbowL",-.4*we),y("elbowR",-.4*we),L("chest",-.2*we+.45*W),L("head",-.15*we+.2*W),{root:.04*we}}case"Hurt":return y("shoulderL",-.5*X,0,.9*X+.13),y("shoulderR",-.5*X,0,-.9*X-.13),y("elbowL",-.5*X),y("elbowR",-.5*X),L("chest",-.4*X),L("head",-.35*X,Math.sin(K*20)*.1*X),{root:-.03*X};case"Jump":{const we=K<.2?-.08:Math.sin(Math.PI*Math.min(1,(K-.2)/.6))*.25;return y("shoulderL",-.3,0,1.4*Q),y("shoulderR",-.3,0,-1.4*Q),y("kneeL",K<.2?.8:.3),y("kneeR",K<.2?.8:.3),y("thighL",K<.2?-.5:-.2),y("thighR",K<.2?-.5:-.2),{root:we}}case"Cheer":return y("shoulderL",-.2,0,2.6*Q),y("shoulderR",-.2,0,-2.6*Q),y("elbowL",-.3),y("elbowR",-.3),{root:Math.abs(Math.sin(K*7))*.1*X};case"Hop":return y("shoulderL",-.2,0,.9*X),y("shoulderR",-.2,0,-.9*X),L("head",-.15*X),{root:Math.abs(Math.sin(K*8))*.12*X};case"Stomp":y("shoulderL",-.2,0,.35),y("shoulderR",-.2,0,-.35),y("elbowL",-1.6*Q),y("elbowR",-1.6*Q),y("thighL",-.5*Math.max(0,Math.sin(K*9))*X),y("kneeL",.6*Math.max(0,Math.sin(K*9))*X),L("head",.18*X,Math.sin(K*14)*.1*X),L("chest",.12*X);break;case"Slump":return L("chest",.3*X),L("head",.4*X),y("shoulderL",.05,0,.03),y("shoulderR",.05,0,-.03),{root:-.03*X};case"Fidget":y("shoulderL",-.55*Q,0,-.2*Q),y("shoulderR",-.55*Q,0,.2*Q),y("elbowL",-.6*Q),y("elbowR",-.6*Q),L("head",.18*X,0,.25*X),L("hips",0,Math.sin(K*3)*.12*X);break;case"SitEnjoyFood":{y("shoulderL",-.7*Q,.18*Q,.62*Q),y("shoulderR",-.7*Q,-.18*Q,-.62*Q),y("elbowL",-1.35*Q),y("elbowR",-1.35*Q),y("handL",-1.25*Q,.55*Q,.25*Q),y("handR",-1.25*Q,-.55*Q,-.25*Q),L("chest",.05*X),L("head",-.06*X,0,.16*X);break}case"SitPresentFood":{y("shoulderL",-1.1*Q,0,.22*Q),y("shoulderR",-1.1*Q,0,-.22*Q),y("elbowL",-1.18*Q),y("elbowR",-1.18*Q),y("handL",-1.45*Q,0,.18*Q),y("handR",-1.45*Q,0,-.18*Q),L("head",-.08*X,0,-.1*X);break}case"SitToast":y("shoulderR",-1.9*Q,0,-.2),y("elbowR",-.6*Q),L("head",-.15*Q);break;case"SitDrink":{const we=Math.max(0,Math.sin(K*2.6))**2;y("shoulderR",-.6-we*1,0,-.25),y("elbowR",-.9-we*1.2);break}case"Talk":y("shoulderR",-.55+Math.sin(K*3.1)*.25,0,-.2),y("elbowR",-1.1+Math.sin(K*4.3)*.3),y("shoulderL",-.35+Math.sin(K*2.3+1)*.2,0,.2),y("elbowL",-1+Math.sin(K*3.7)*.3),L("head",Math.sin(K*2.6)*.06);break;case"Kachashi":{const we=Math.sin(K*5.5),W=Math.sin(K*2.75);return y("shoulderL",-.4,0,1.9+we*.25),y("shoulderR",-.4,0,-1.9+we*.25),y("elbowL",0,0,1.1+we*.5),y("elbowR",0,0,-1.1+we*.5),y("hips",0,W*.2,W*.08),L("chest",0,-W*.2),L("head",0,W*.15,-W*.1),y("thighL",-Math.max(0,W)*.5),y("kneeL",Math.max(0,W)*.8),y("thighR",-Math.max(0,-W)*.5),y("kneeR",Math.max(0,-W)*.8),{root:Math.abs(W)*.03}}case"Crouch":return y("thighL",-1.7,0,.25),y("thighR",-1.7,0,-.25),y("kneeL",2.3),y("kneeR",2.3),y("footL",-.6),y("footR",-.6),L("chest",.5),y("shoulderL",-.9,0,.1),y("shoulderR",-.9,0,-.1),y("elbowL",-.4),y("elbowR",-.4),{root:-(t.thigh+t.shin)*.72};case"Phone":y("shoulderR",-.4,0,-.5),y("elbowR",-2.2),L("head",0,0,-.15);break;case"FishIdle":y("shoulderL",-1,0,.1),y("shoulderR",-1,0,-.1),y("elbowL",-.6),y("elbowR",-.6);break;case"Reel":y("shoulderL",-1,0,.1),y("elbowL",-.6),y("shoulderR",-1+Math.sin(K*9)*.25,0,-.2),y("elbowR",-.8+Math.cos(K*9)*.3);break}return null}return{update:j,play:U,stop:k,get gesture(){return _?.name||null},get consumption(){return A}}}const Xn=Object.freeze(Object.fromEntries(["icecream","ramen","onigiri","curry","gyoza"].map(n=>[n,`./assets/food/island-${n}.png`])));function Sy(n){const e=String(n).toLowerCase();return/ice cream/.test(e)?Xn.icecream:/rice ball|onigiri/.test(e)?Xn.onigiri:/ramen/.test(e)?Xn.ramen:/gyoza|dumpling/.test(e)?Xn.gyoza:/curry/.test(e)&&!/pack|box|pouch/.test(e)?Xn.curry:null}const zl=new Map;function jg(n,e){if(!Xn[e]||typeof Image>"u")return;const t=new Ht;t.name="Food geometry fallback";for(const c of[...n.children])t.add(c);n.add(t);const i=new sc({transparent:!0,alphaTest:.02,depthWrite:!1}),r=new Lm(i);r.name="Original "+e+" food cutout",r.scale.set(.25,.25,1),r.position.y=.105,r.visible=!1,n.add(r);const s=n.userData;s.foodCutout={sprite:r,fallback:t,ready:!1};const o=c=>{r.parent&&(i.map=c,i.needsUpdate=!0,s.foodCutout.ready=!0,t.visible=!1,r.visible=!0)},a=zl.get(e);if(a){a.then(o);return}const l=new Promise(c=>new P0().load(Xn[e],h=>{h.colorSpace=Ot,c(h)},void 0,()=>{}));zl.set(e,l),l.then(o)}function Kg(n){const e=n.userData,t=e.foodCutout;if(!t?.ready)return;const i=e.portion??1;t.sprite.visible=i>0,t.sprite.material.opacity=Math.min(1,i*1.8);const r=.25*(.65+.35*i);t.sprite.scale.set(r,r,1),t.fallback.visible=i===0}const Yn=Object.freeze({draft:Object.freeze({id:"draft",jp:"Orion draught, medium mug",en:"Orion draught, a frosted mug",price:450,sips:6,alcohol:1,pour:4.2,line:"One Orion draught! Cold from the tap."}),bottle:Object.freeze({id:"bottle",jp:"Orion Large bottle",en:"Orion large bottle and a small glass",price:600,sips:8,alcohol:1.4,pour:2,line:"It's a big bottle. Pour for yourself -- or I pour the first one."}),can:Object.freeze({id:"can",jp:"Orion Can",en:"Orion can, 350 ml",price:300,sips:4,alcohol:.8,pour:1.2,line:"Still in the can? Straight from the can, then."}),awamori:Object.freeze({id:"awamori",jp:"Awamori on the rocks",en:"awamori on the rocks",price:250,sips:5,alcohol:1.6,pour:1.8,line:"Awamori. Slowly -- it is older than you think."}),sake:Object.freeze({id:"sake",jp:"Warm sake, one flask",en:"a flask of warm sake",price:220,sips:5,alcohol:1.3,pour:2.4,line:"Hot sake. Careful, the tokkuri is hot."}),oolong:Object.freeze({id:"oolong",jp:"Oolong tea",en:"Oolong tea over ice",price:150,sips:4,alcohol:0,pour:1.6,line:"Oolong tea. Plenty of ice."})}),_i=Object.freeze({yakitori:Object.freeze({id:"yakitori",jp:"Assorted Yakitori",en:"a plate of yakitori",price:180,bites:4,station:"grill",cook:6,line:"Yakitori. Two tare, two salt."}),edamame:Object.freeze({id:"edamame",jp:"Edamame",en:"a bowl of edamame",price:120,bites:3,station:"prep",cook:2,line:"Edamame. Salted while they were hot."}),oden:Object.freeze({id:"oden",jp:"Oden",en:"a bowl of oden",price:260,bites:4,station:"oden",cook:3,line:"Oden. The daikon has been in since four."}),hiyayakko:Object.freeze({id:"hiyayakko",jp:"Cold tofu",en:"cold tofu with ginger",price:150,bites:3,station:"prep",cook:2,line:"It's cold tofu. Ginger and a little soy."}),dashimaki:Object.freeze({id:"dashimaki",jp:"Dashi-rolled egg",en:"a rolled dashi omelette",price:200,bites:3,station:"range",cook:5,line:"Dashi roll. Still warm in the middle."}),hokke:Object.freeze({id:"hokke",jp:"Grilled Atka mackerel",en:"grilled hokke",price:280,bites:4,station:"grill",cook:7,line:"It's Hokke. Lemon on the side."}),sashimi:Object.freeze({id:"sashimi",jp:"Assorted sashimi",en:"the sashimi plate",price:320,bites:4,station:"prep",cook:4,line:"Sashimi. Masaru brought the tuna this morning."}),agedashi:Object.freeze({id:"agedashi",jp:"Fried tofu",en:"agedashi tofu",price:180,bites:3,station:"fryer",cook:5,line:"It's fried. Mind the broth, it is hot."}),karaage:Object.freeze({id:"karaage",jp:"Fried chicken",en:"chicken karaage",price:220,bites:4,station:"fryer",cook:6,line:"It's fried chicken. Straight out of the oil."}),ochazuke:Object.freeze({id:"ochazuke",jp:"Ochazuke",en:"ochazuke to finish",price:180,bites:3,station:"range",cook:4,line:"Ochazuke. The way to end an evening."})});Object.freeze([...Object.values(_i),...Object.values(Yn)]);const oo=n=>Yn[n]||_i[n]||null,Gl=Object.freeze({grill:[1.7,0,-3.6],oden:[-4.2,0,-3.6],range:[1.4,0,-5.15],fryer:[2.75,0,-5.15],prep:[5.4,0,-5.15]}),ao=Object.freeze([3.5,0,-3.8]),wy=Object.freeze({table:Object.freeze({id:"table",label:"Sit at the table",position:[3.3,0,.9],stand:[3.3,0,.25],eyeY:1.14,yaw:Math.PI,table:[3.3,.945,1.52],dish:[3.02,.945,1.5],serve:[3.95,0,.3],route:[[3.95,-3.55],[3.95,.3]]}),window:Object.freeze({id:"window",label:"Sit and enjoy the evening",position:[4,0,2.7],stand:[2.95,0,2.7],eyeY:1.2,yaw:Math.PI/2,table:[3.62,.945,2.55],dish:[3.62,.945,2.3],serve:[4,0,1.6],route:[[3.95,-3.55],[3.95,.3],[4,1.6]]}),...Object.fromEntries([-3.8,-2.3,-.8,.7,2.2].map((n,e)=>["counter"+e,Object.freeze({id:"counter"+e,label:"Sit at the counter",counter:!0,position:[n,0,-1.42],stand:[n,0,-.72],eyeY:1.32,yaw:0,table:[n+.15,1.11,-2.2],dish:[n-.12,1.11,-2.24],serve:[n,0,-3.75],route:[[n,-3.75]]})]))});function Vl(n,e,t,i,r){const s=e.position.y-i/2,o=10,a=new Float32Array(o*3),l=[];for(let u=0;u<o;u++){const p=u*2.4,f=r*(.25+.7*(u*37%10)/10);a[u*3]=e.position.x+Math.cos(p)*f,a[u*3+1]=s+u*.31%1*i,a[u*3+2]=Math.sin(p)*f,l.push(.012+u*13%7*.004)}const c=new yt;c.setAttribute("position",new Nt(a,3));const h=new Fm(c,new cc({color:16773828,size:.0035,transparent:!0,opacity:.8,depthWrite:!1}));h.name="Beer bubbles",n.add(h),n.userData.pour={liquid:e,head:t,bottom:s,height:i,headHeight:t.geometry.parameters.height,bubbles:h,rise:l}}function Jg(n,e){const t=n.pour,i=n.portion,r=t.bottom+t.height*i;t.liquid.scale.y=Math.max(.001,i),t.liquid.position.y=t.bottom+t.height*i/2,t.head.visible=i>.03,t.head.scale.y=.55+.45*i,t.head.position.y=r+t.headHeight*t.head.scale.y/2;const s=t.bubbles.geometry.attributes.position;t.bubbles.visible=i>.05;for(let o=0;o<s.count;o++){let a=s.getY(o)+t.rise[o]*e*(i>.1?1:.3);a>r&&(a=t.bottom+(a-r)%Math.max(.005,r-t.bottom)),s.setY(o,a)}s.needsUpdate=!0}function Xc(n,{held:e=!1}={}){const t=new Ht;t.name="Minato drink · "+n;const i=new wt({color:14674148,roughness:.08,metalness:0,transparent:!0,opacity:.42,depthWrite:!1}),r=new wt({color:14259230,roughness:.3,emissive:4860418,emissiveIntensity:.25}),s=new wt({color:16512486,roughness:.9}),o=(l,c,h=0,u=0,p=0)=>{const f=new ut(l,c);return f.position.set(u,h,p),t.add(f),f},a=new Ht;if(t.add(a),t.userData.level=a,n==="draft"){o(new Ke(.045,.042,.15,20),i,.075);const l=new ut(new Ke(.041,.039,.12,20),r);l.position.y=.063,a.add(l);const c=new ut(new Ke(.043,.041,.025,20),s);c.position.y=.135,a.add(c),Vl(t,l,c,.12,.036);const h=o(new tn(.03,.007,8,16,Math.PI),i,.08,.05);h.rotation.z=-Math.PI/2}else if(n==="bottle"){const l=new wt({color:5910032,roughness:.25,transparent:!0,opacity:.48,depthWrite:!1});if(!e){o(new Ke(.038,.038,.2,18),l,.1,-.06),o(new Ke(.013,.036,.08,14),l,.24,-.06),o(new Ke(.034,.034,.05,18),new wt({color:15921384,roughness:.6}),.1,-.06);const p=new ut(new Ke(.034,.034,.185,18),r);p.position.set(-.06,.095,0),a.add(p)}const c=e?0:.05;o(new Ke(.03,.027,.09,16),i,.045,c);const h=new ut(new Ke(.027,.025,.07,16),r);h.position.set(c,.037,0),a.add(h);const u=new ut(new Ke(.028,.027,.012,16),s);u.position.set(c,.078,0),a.add(u),Vl(t,h,u,.07,.022)}else if(n==="can")o(new Ke(.033,.033,.122,20),new wt({color:15921902,roughness:.35,metalness:.55}),.061),o(new Ke(.0335,.0335,.045,20),new wt({color:1986460,roughness:.4,metalness:.4}),.07),o(new Ke(.0336,.0336,.008,20),new wt({color:13120042,roughness:.4}),.095);else if(n==="coffee"){const l=new wt({color:16052714,roughness:.35});o(new Ke(.036,.028,.07,20,1,!0),new wt({color:16052714,roughness:.35,side:2}),.035),o(new Ke(.028,.028,.004,20),l,.002);const c=o(new tn(.017,.005,8,14,Math.PI),l,.04,.038);c.rotation.z=-Math.PI/2,e||o(new Ke(.062,.055,.008,24),l,-.004);const h=new ut(new Ke(.033,.028,.055,20),new wt({color:2823690,roughness:.15}));h.position.y=.03,a.add(h)}else{o(new Ke(.036,.032,.11,18),i,.055);const l=new ut(new Ke(.033,.03,.085,18),new wt({color:n==="mugicha"?11036714:8011544,roughness:.25,transparent:!0,opacity:n==="mugicha"?.78:.85}));l.position.y=.045,a.add(l);for(let c=0;c<3;c++){const h=new ut(new ht(.022,.022,.022),i);h.position.set((c-1)*.012,.08,c%2*.01),h.rotation.set(c,c*.7,0),a.add(h)}}return t.userData.portion=1,t.userData.targetPortion=1,t.userData.consumable="drink",t.userData.rimHeight=n==="draft"?.15:n==="bottle"?.09:n==="can"?.122:n==="coffee"?.07:.11,t.traverse(l=>{l.isMesh&&(l.castShadow=!1,l.receiveShadow=!0)}),t}function Yc(n){const e=new Ht;e.name="Minato dish · "+n;const t=a=>new wt({color:a,roughness:.6}),i=(a,l,c=0,h=0,u=0,p=e)=>{const f=new ut(a,l);return f.position.set(c,h,u),p.add(f),f},r=new Ht;e.add(r),e.userData.level=r;const s=(a,l,c=3102834)=>i(new ht(a,.014,l),t(c),0,.007),o=(a,l,c=15854816)=>i(new Ke(a,a*.7,l,16,1,!0),new wt({color:c,roughness:.35,side:2}),0,l/2);if(n==="yakitori"||n==="hokke")if(s(.26,.12,15854816),n==="yakitori")for(let a=0;a<4;a++){i(new ht(.22,.006,.006),t(10513474),0,.02,-.04+a*.027,r);for(let l=0;l<4;l++)i(new ht(.03,.024,.024),t(a%2?8142619:14267002),-.07+l*.045,.028,-.04+a*.027,r)}else{const a=i(new ht(.2,.025,.08),t(11565637),0,.027,0,r);a.rotation.y=.1,i(new xt(.018,8,6),t(15917914),.09,.03,.04,r)}else if(n==="sashimi"){s(.24,.16,15854816);for(let a=0;a<6;a++)i(new ht(.04,.018,.1),t([15370844,10366005,15721426][a%3]),-.08+a*.032,.024,0,r).rotation.y=.25;i(new xt(.015,8,6),t(8231749),.1,.025,.05,r)}else if(n==="edamame"||n==="karaage"){o(.07,.045,3102834);for(let a=0;a<(n==="edamame"?9:6);a++){const l=a*2.3,c=.035*(a%3/2+.3);i(n==="edamame"?new ht(.045,.014,.018):new xt(.022,8,6),t(n==="edamame"?8231749:12088366),Math.cos(l)*c,.045,Math.sin(l)*c,r).rotation.y=l}}else if(n==="oden"||n==="agedashi"||n==="ochazuke"||n==="ramen"||n==="rice")if(o(.075,.06,n==="ochazuke"?3102834:9067066),i(new Ke(.068,.068,.004,16),t(n==="ochazuke"?12034908:11039535),0,.045,0,r),n==="oden")i(new Ke(.025,.025,.03,12),t(14930854),-.025,.05,0,r),i(new xt(.02,8,6),t(12159562),.025,.052,.01,r);else if(n==="agedashi")for(let a=0;a<2;a++)i(new ht(.04,.03,.04),t(14132570),-.02+a*.04,.05,0,r);else if(n==="ramen"||n==="rice")for(let a=0;a<6;a++)i(new xt(.016,8,6),t(15257466),(a%3-1)*.025,.052,Math.floor(a/3)*.025-.012,r);else i(new ht(.05,.004,.05),t(2042402),0,.05,0,r);else if(n==="hiyayakko")s(.12,.12,3102834),i(new ht(.07,.04,.07),t(15854816),0,.035,0,r),i(new ht(.02,.01,.02),t(14267226),0,.06,0,r);else if(n==="gyoza"){s(.22,.12,15854816);for(let a=0;a<6;a++)i(new xt(.024,8,6),t(14267002),-.08+a*.032,.022,0,r).scale.set(.8,.6,1.4)}else{s(.2,.1,15854816);for(let a=0;a<4;a++)i(new ht(.035,.035,.06),t(15780170),-.06+a*.04,.03,0,r)}return jg(e,n),e.userData.portion=1,e.userData.targetPortion=1,e.userData.consumable="food",e.traverse(a=>{a.isMesh&&(a.castShadow=!1,a.receiveShadow=!0)}),e}function sn(n,e,{immediate:t=!1}={}){const i=ke.clamp(Number(e)||0,0,1);n.userData.targetPortion=i,t&&(n.userData.portion=i,Ei(n,0))}function Ei(n,e){const t=n.userData,i=t.level;if(!i)return;const r=t.targetPortion??1,s=t.portion??1;if(t.portion=Math.abs(s-r)<.001?r:ke.damp(s,r,7,Math.max(0,e)),i.visible=t.portion>0,Kg(n),t.consumable==="food"){const o=i.children.length*t.portion;i.children.forEach((a,l)=>{a.visible=l<Math.ceil(o),a.scale.setScalar(Math.min(1,Math.max(0,o-l)))})}else if(t.pour){i.scale.y=1,Jg(t,e);for(const o of i.children)o!==t.pour.liquid&&o!==t.pour.head&&(o.userData.baseY??=o.position.y,o.scale.y=Math.max(.001,t.portion),o.position.y=o.userData.baseY*t.portion)}else i.scale.y=Math.max(.001,t.portion)}function Zg(n){const e=new Ht;e.userData.food=!0,e.userData.consumable="food",e.userData.portion=1,e.userData.targetPortion=1;const t=new wt({color:13214315,roughness:.6});for(const s of[-.008,.008]){const o=new ut(new ht(.005,.005,.16),t);o.position.set(s,.02,.04),e.add(o)}const i=new Ht;e.add(i),e.userData.level=i;const r=new ut(new xt(.018,8,6),new wt({color:n==="edamame"?8231749:n==="sashimi"?15370844:14267002,roughness:.6}));return r.position.set(0,.04,.1),i.add(r),e}function Eo(n){if(!n)return;n.removeFromParent();const e=new Set;n.traverse(t=>{if(t.isMesh||t.isSprite){t.isMesh&&t.geometry.dispose();for(const i of Array.isArray(t.material)?t.material:[t.material])e.add(i)}}),e.forEach(t=>t.dispose())}function Ty({room:n,getNao:e,blocked:t,say:i=()=>{}}){let r=null,s=null,o=null,a=0;function l(d){if(d)for(const v of["playerService","heldItem","socialPose","carrying"])delete d.userData[v]}function c(d,v,M){for(;v.length;){const[x,D]=v[0],R=x-d.position.x,A=D-d.position.z,w=Math.hypot(R,A);if(w<.03){v.shift();continue}const S=Math.atan2(-R,-A),b=Math.atan2(Math.sin(S-d.rotation.y),Math.cos(S-d.rotation.y));if(d.rotation.y+=Math.max(-M*5,Math.min(M*5,b)),Math.abs(b)<.9){const y=Math.min(w,M*1.15*(1-Math.abs(b)/1.2));d.position.x+=R/w*y,d.position.z+=A/w*y}return!1}return!0}const h=d=>{d&&(d.prop.removeFromParent(),d.prop.traverse(v=>{v.isMesh&&(v.geometry.dispose(),v.material.dispose?.())}))};function u(){h(s),s=null}function p(){h(o),o=null}const f=(d,v,M)=>{d.rotation.y=Math.atan2(-(v-d.position.x),-(M-d.position.z))},g=()=>[ao[0],ao[2]];function _(d,v){if(Yn[d]){u();const M=Xc(d);M.position.set(...v.table),n.add(M),s={kind:d,left:Yn[d].sips,prop:M}}else{p();const M=Yc(d);M.position.set(...v.dish||v.table),n.add(M),o={kind:d,left:_i[d].bites,prop:M}}a++}function m(d,v){d.left=Math.max(0,d.left-1),sn(d.prop,d.left/v)}return{get pending(){return r?{kind:r.kind,phase:r.phase}:null},get drink(){return s?{kind:s.kind,left:s.left,sips:Yn[s.kind].sips}:null},get dish(){return o?{kind:o.kind,left:o.left,bites:_i[o.kind].bites}:null},get served(){return a},order(d,v){const M=oo(d),x=e();if(!M||!v||r||!x)return!1;const D=!!_i[d];return r={kind:d,seat:v,phase:D?"cooking":"pouring",timer:D?M.cook:M.pour,path:D?[[Gl[M.station][0],Gl[M.station][2]]]:null},x.userData.playerService=!0,x.userData.socialPose="Use",x.userData.activity=D?"cooking "+M.en+" for you":"pouring "+M.en.toLowerCase()+" for you",!0},sip(){if(!s||s.left<=0)return null;s.left=Math.max(0,s.left-1);const d=Yn[s.kind];s.prop.userData.level,sn(s.prop,s.left/d.sips);const v={kind:s.kind,left:s.left,alcohol:d.alcohol/d.sips};if(s.left===0){const M=s;setTimeout(()=>{s===M&&u()},1500)}return v},bite(){if(!o||o.left<=0)return null;m(o,_i[o.kind].bites);const d={kind:o.kind,left:o.left};if(o.left===0){const v=o;setTimeout(()=>{o===v&&p()},2500)}return d},serveNow(d,v){return!oo(d)||!v?.table?!1:(_(d,v),!0)},update(d){if(s&&Ei(s.prop,d),o&&Ei(o.prop,d),!r)return;const v=e();if(!v){r=null;return}const M=oo(r.kind),{seat:x}=r;if(r.phase==="cooking"){if(r.path.length){delete v.userData.socialPose,c(v,r.path,d);return}v.userData.socialPose="Use",(r.timer-=d)<=0&&(r.path=[...x.counter?[]:[g()],...x.route].map(D=>[...D]),r.phase="carrying",v.userData.heldItem="tray",delete v.userData.socialPose,v.userData.carrying=!0,v.userData.activity="bringing your "+M.en.replace(/^(a|an|the) /,""))}else if(r.phase==="pouring")v.userData.socialPose="Use",(r.timer-=d)<=0&&(r.path=x.route.map(D=>[...D]),r.phase="carrying",v.userData.heldItem=r.kind==="oolong"?"tea":"beer",delete v.userData.socialPose,v.userData.carrying=!0,v.userData.activity="bringing your drink");else if(r.phase==="carrying"){delete v.userData.socialPose;const D=Yn[r.kind]?x.table:x.dish||x.table;c(v,r.path,d)&&(f(v,D[0],D[2]),r.phase="placing",r.timer=1.1,v.userData.socialPose="CarryIdle")}else r.phase==="placing"?(r.timer-=d)<=0&&(_(r.kind,x),delete v.userData.heldItem,delete v.userData.carrying,v.userData.socialPose="Greet",i("Nao: "+M.line,4),r.phase="bowing",r.timer=.9):r.phase==="bowing"?(r.timer-=d)<=0&&(delete v.userData.socialPose,r.path=[...x.route.slice(0,-1).reverse(),g()].map(D=>[...D]),r.phase="returning",v.userData.activity="back to the counter"):r.phase==="returning"&&(delete v.userData.socialPose,c(v,r.path,d)&&(v.rotation.set(0,Math.PI,0),l(v),r=null))},clear(){const d=e();r&&d&&(d.position.set(...ao),d.rotation.set(0,Math.PI,0),l(d)),r=null,u(),p()},place(d,v){_(d,v)}}}const qc="johansson-town-avatar";function $g(n=globalThis.localStorage){try{const e=n?.getItem(qc);if(e){const t=Wo(e);if(t)return t}}catch{}return xo.Johansson}function Qg(n,e=globalThis.localStorage){const t=wc(n);try{e?.setItem(qc,t)}catch{}return t}const e_=.2,t_=["Wake","Sit","Type","Eat","Drink","Sleep","Soak"];function Ey(){try{const n=new URL(location.href),e=n.searchParams.get("avatar");if(!e)return null;const t=Wo(e);return n.searchParams.delete("avatar"),history.replaceState(history.state,"",n.href),t&&Qg(t),t}catch{return null}}function Ay(n,e,{shadows:t=!1}={}){const i=Cg(e),r=bo(i,{shadows:t,faceSize:e==="Thuan"?512:256});for(const s of n.children)s.visible=!1;return n.add(r.root),n.userData.visualReady=!0,n.userData.visualSource="Shimanchu · "+(i.name||e),{isAvatar:!0,avatar:r,animator:To(r),entity:n,model:r.root,mixer:null,actions:new Map,current:null,last:n.position.clone(),gestureTime:0,speed:0,moving:!1,wasVisible:!0,height:r.height,isThuan:e==="Thuan",outfit:"clothes"}}function Ry(n,e,t=performance.now()){const{entity:i,avatar:r}=n,s=i.userData;let o=!0;for(let M=i;M;M=M.parent)if(!M.visible){o=!1;break}if(!o){n.last.copy(i.position),n.speed=0,n.moving=!1,n.wasVisible=!1;return}const a=Math.hypot(i.position.x-n.last.x,i.position.z-n.last.z);n.last.copy(i.position);const l=!n.wasVisible||a>1;n.wasVisible=!0;const c=l||Number.isFinite(s.chairBlend)?0:a/Math.max(e,.001);n.speed=ke.damp(n.speed,c,20,e),n.moving=n.speed>(n.moving?.03:.07),n.gestureTime=Math.max(0,n.gestureTime-e);const h=s.outfit==="swim"?"swim":n.isThuan?s.alternativeOutfit||"clothes":s.outfit||"clothes";n.outfit!==h&&(r.wear(h),n.outfit=h);const u=!s.hatOff;n.hatOn!==u&&(r.setHat?.(u),n.hatOn=u);const p=!!(s.playerControlled&&n.isThuan),f=!p&&(Number.isFinite(s.seatHeight)&&t_.includes(s.socialPose)||Number.isFinite(s.chairBlend)&&s.chairBlend>.5),g=s.thuanMood,_=g&&g.until>t?g.expression:null,m=!!(s.playerConversation||s.chat||n.gestureTime),d=Number(s.sleepBlend)>.28||s.sleeping&&!s.roomTransition;n.animator.update(e,{speed:n.moving?n.speed:0,running:n.speed>3.2,seated:f,seatHeight:s.seatHeight,floorHeight:(Number(s.floorHeight)||0)+(s.socialPose==="CounterIdle"?e_:0),pose:s.socialPose,seat:s.socialPose,riding:p,ridePhase:s.bicyclePhase||0,bicycleFit:s.bicycleFit,carrying:!!s.carrying,heldProp:n.heldProp,waving:!!(s.chat?.greeting||n.gestureTime>0&&!n.waved),talking:!!(s.chat?.speaking||s.speakingUntil>t),expression:s.thuanExpression||_||(m?"smile":"neutral"),sleeping:d,gaze:Array.isArray(s.lookTarget)?s.lookTarget:null,consumeElapsed:s.consumeElapsed,tipsy:s.tipsy||0});const v=s.heldItem||(["Drink","DrinkStanding"].includes(s.socialPose)?"beer":s.socialPose==="Eat"?"rice":null);if(n.heldKind!==v){Eo(n.heldProp),Eo(n.dishProp),n.heldProp=null,n.dishProp=null,n.heldKind=v,n.portion=1,n.consumedCycle=-1;const M={beer:"draft",tea:"oolong",cup:"oolong",coffee:"coffee",mugicha:"mugicha",can:"can",bottle:"bottle",draft:"draft",oolong:"oolong",awamori:"awamori",sake:"sake"},x=["rice","bun","ramen","fish","yakitori","gyoza","edamame","sashimi","oden","hiyayakko","dashimaki","agedashi","karaage","ochazuke","chopsticks"];M[v]?n.heldProp=Xc(M[v],{held:!0}):x.includes(v)&&(n.heldProp=Zg(v),v!=="bun"&&v!=="chopsticks"&&(n.dishProp=Yc(v==="fish"?"hokke":v),n.dishProp.userData.food=!0,r.bones.handL.add(n.dishProp))),n.heldProp&&r.bones.handR.add(n.heldProp),n.heldProp&&Number.isFinite(s.heldPortion)&&sn(n.heldProp,s.heldPortion,{immediate:!0}),n.dishProp&&Number.isFinite(s.foodPortion)&&sn(n.dishProp,s.foodPortion,{immediate:!0})}if(n.heldProp){const M=n.animator.consumption;M&&!Number.isFinite(s.heldPortion)&&M.swallow>.5&&n.consumedCycle!==M.cycle&&(n.consumedCycle=M.cycle,n.portion=Math.max(0,n.portion-(M.food?.25:1/6)),sn(n.heldProp,M.food?0:n.portion),n.dishProp&&sn(n.dishProp,n.portion)),Number.isFinite(s.heldPortion)?sn(n.heldProp,s.heldPortion):M?.food&&M.swallow===0&&n.portion>0&&sn(n.heldProp,1),Ei(n.heldProp,e),rs(r,n.heldProp,M?.lift||0),n.dishProp&&(Number.isFinite(s.foodPortion)&&sn(n.dishProp,s.foodPortion),Ei(n.dishProp,e),rs(r,n.dishProp,0,"L"))}n.gestureTime>0?n.waved=!0:n.waved=!1}function Cy(n,e=new P){const t=n.avatar.bones.head,i=n.avatar.measure;return t.getWorldPosition(e),e.y+=(i.headCentre-i.headY)*.95,e}function Py({scene:n,recipe:e=$g()}={}){const t=new Ht;t.name="Johansson (third person)",t.visible=!1,n.add(t);let i=bo(e,{shadows:!0,faceSize:512}),r=To(i);t.add(i.root);let s="neutral",o=0,a=0,l=0,c="Sit",h="clothes",u=null,p=null,f=null;const g=()=>i.bones.handR,_={root:t,loading:Promise.resolve(!0),get ready(){return!0},get move(){return f},get expression(){return s},get weights(){return{}},get actions(){return[...Object.keys(er),"Idle","Walk","Run","Sit","SitEat","Soak","Fall"]},get avatar(){return i},play(m,{face:d}={}){f=m,d&&_.express(d,3);const v={Bow:"Bow",Wave:"Wave"};r.play(v[m]||m)||r.play("Nod");const M={Wave:"happy",Clap:"happy",Kachashi:"laugh",Laugh:"laugh",Think:"thinking",Shrug:"worried",HeadShake:"grumpy",Bow:"content",Nod:"content",Stretch:"content",LookAround:"surprised",SitToast:"happy"};M[m]&&_.express(M[m],(er[m]===1/0?4:er[m]||2)+.6)},express(m,d=3){s=m,o=d>0?l+d:0},speak(m=2){a=Math.max(a,l+m)},lookAt(m){p=m?m.clone?.()||m:null},seat(m="Sit"){c=m},wear(m){h=m==="swim"?"swim":"clothes",i.wear(h)},get outfit(){return h},get lens(){const m=i.measure;return{eye:m.H+.14,side:m.Rh*m.headSX+.26,head:m.headCentre}},get sitHip(){const m=i.measure;return m.hipY+.09-m.seatDrop},hold(m){u&&(u.userData.consumable?Eo(u):u.removeFromParent()),u=m||null,u&&(u.position.set(0,-i.measure.hand*.4,i.measure.hand*.6),g().add(u),u.userData.consumable&&rs(i,u))},jump(){r.play("Jump")},stop(){r.stop(),f=null},setRecipe(m){const d=Wt(m);i.root.removeFromParent(),i.dispose(),i=bo(d,{shadows:!0,faceSize:512}),r=To(i),t.add(i.root),i.wear(h),u&&g().add(u)},update(m,d={}){if(l+=m,t.visible=!!d.visible,o&&l>o&&(s="neutral",o=0),r.gesture||(f=null),r.update(m,{speed:d.speed||0,running:!!d.running,seated:!!d.seated,seatHeight:d.seated?i.measure.hipY-i.measure.seatDrop:void 0,seat:c,airborne:!!d.airborne,talking:l<a,expression:s,gaze:p,heldProp:u,tipsy:d.tipsy||0}),d.seated&&(i.root.position.y=0),u?.userData.consumable){const v=r.consumption;v&&u.userData.finishPortion!==void 0&&sn(u,ke.lerp(u.userData.startPortion,u.userData.finishPortion,v.swallow)),Ei(u,m),rs(i,u,v?.lift||0)}}};return _}export{tn as $,U_ as A,ht as B,Ie as C,X_ as D,yc as E,i_ as F,Ht as G,V_ as H,vc as I,as as J,S_ as K,g_ as L,ut as M,y_ as N,$l as O,wi as P,_t as Q,h_ as R,N_ as S,bc as T,ke as U,re as V,D_ as W,Bo as X,Dg as Y,Bc as Z,Lg as _,Ot as a,E_ as a$,$r as a0,ls as a1,o_ as a2,Fm as a3,$_ as a4,hy as a5,P0 as a6,P_ as a7,Q0 as a8,Ng as a9,Ii as aA,Y_ as aB,R0 as aC,B_ as aD,Ai as aE,H_ as aF,rl as aG,q_ as aH,Pm as aI,m_ as aJ,__ as aK,p_ as aL,d_ as aM,cc as aN,bn as aO,Um as aP,ct as aQ,Wr as aR,Q_ as aS,F_ as aT,lc as aU,k_ as aV,Vt as aW,Do as aX,z_ as aY,ac as aZ,T_ as a_,uy as aa,Fl as ab,my as ac,qo as ad,To as ae,er as af,xo as ag,K_ as ah,um as ai,C_ as aj,Wt as ak,Fo as al,W_ as am,ho as an,sc as ao,Lm as ap,u_ as aq,C0 as ar,Ti as as,Eo as at,sn as au,Xc as av,Yc as aw,Ei as ax,Ct as ay,f_ as az,bo as b,Kl as b$,jr as b0,es as b1,Qr as b2,us as b3,Qe as b4,hs as b5,In as b6,vn as b7,A_ as b8,R_ as b9,ey as bA,wc as bB,Wo as bC,ty as bD,Xn as bE,ny as bF,cy as bG,fy as bH,sy as bI,Bg as bJ,Di as bK,by as bL,vy as bM,yy as bN,_y as bO,Sy as bP,gy as bQ,oo as bR,Cy as bS,Ry as bT,Ay as bU,g0 as bV,He as bW,v_ as bX,Ql as bY,w_ as bZ,b_,Eg as ba,dy as bb,ay as bc,ly as bd,L_ as be,iy as bf,O_ as bg,Lo as bh,_i as bi,Yn as bj,wy as bk,oy as bl,Gg as bm,Gn as bn,Fc as bo,r_ as bp,G_ as bq,x_ as br,M_ as bs,I_ as bt,c_ as bu,Wc as bv,Y0 as bw,pt as bx,X0 as by,qn as bz,My as c,a_ as c0,n_ as c1,py as c2,Ey as c3,rc as c4,j_ as c5,l_ as c6,qr as c7,Py as c8,Ty as c9,xy as ca,Zg as cb,ry as cc,Qg as cd,Ln as d,P as e,wt as f,Ke as g,xt as h,s_ as i,vi as j,Oo as k,km as l,Co as m,bt as n,Z_ as o,$g as p,J_ as q,Cg as r,Ve as s,nn as t,Xr as u,yt as v,qe as w,Nt as x,Bm as y,fc as z};
