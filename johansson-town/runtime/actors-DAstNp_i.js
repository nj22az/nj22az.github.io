/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const iy=1;const sy=0,ry=1,oy=2;const ay=2;const ly=0;const cy=4;const hy=6;const _a="attached",Nh="detached";const uy=303;const dy=1e3,fy=1001,py=1002,my=1003,gy=1004,_y=1005,yy=1006,vy=1007,by=1008,My=1009;const xy=1014,Sy=1015,wy=1016;const Ty=1023;const Ey=1026;const Ay=2300,Ry=2301;const Cy=1,Py=2;const Iy=3201;const Ly="",Bt="srgb",Ni="srgb-linear",vr="linear",ht="srgb";const Dy=35048,ya="300 es";class ti{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[e]===void 0&&(i[e]=[]),i[e].indexOf(t)===-1&&i[e].push(t)}hasEventListener(e,t){if(this._listeners===void 0)return!1;const i=this._listeners;return i[e]!==void 0&&i[e].indexOf(t)!==-1}removeEventListener(e,t){if(this._listeners===void 0)return;const s=this._listeners[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const i=this._listeners[e.type];if(i!==void 0){e.target=this;const s=i.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}}const Nt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let va=1234567;const rs=Math.PI/180,Pi=180/Math.PI;function Kt(){const n=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Nt[n&255]+Nt[n>>8&255]+Nt[n>>16&255]+Nt[n>>24&255]+"-"+Nt[e&255]+Nt[e>>8&255]+"-"+Nt[e>>16&15|64]+Nt[e>>24&255]+"-"+Nt[t&63|128]+Nt[t>>8&255]+"-"+Nt[t>>16&255]+Nt[t>>24&255]+Nt[i&255]+Nt[i>>8&255]+Nt[i>>16&255]+Nt[i>>24&255]).toLowerCase()}function Tt(n,e,t){return Math.max(e,Math.min(t,n))}function Xo(n,e){return(n%e+e)%e}function kh(n,e,t,i,s){return i+(n-e)*(s-i)/(t-e)}function Uh(n,e,t){return n!==e?(t-n)/(e-n):0}function os(n,e,t){return(1-t)*n+t*e}function Fh(n,e,t,i){return os(n,e,1-Math.exp(-t*i))}function Oh(n,e=1){return e-Math.abs(Xo(n,e*2)-e)}function Bh(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*(3-2*n))}function zh(n,e,t){return n<=e?0:n>=t?1:(n=(n-e)/(t-e),n*n*n*(n*(n*6-15)+10))}function Hh(n,e){return n+Math.floor(Math.random()*(e-n+1))}function Vh(n,e){return n+Math.random()*(e-n)}function Gh(n){return n*(.5-Math.random())}function Wh(n){n!==void 0&&(va=n);let e=va+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Xh(n){return n*rs}function Yh(n){return n*Pi}function qh(n){return(n&n-1)===0&&n!==0}function jh(n){return Math.pow(2,Math.ceil(Math.log(n)/Math.LN2))}function Kh(n){return Math.pow(2,Math.floor(Math.log(n)/Math.LN2))}function Jh(n,e,t,i,s){const r=Math.cos,o=Math.sin,a=r(t/2),l=o(t/2),c=r((e+i)/2),h=o((e+i)/2),u=r((e-i)/2),p=o((e-i)/2),f=r((i-e)/2),g=o((i-e)/2);switch(s){case"XYX":n.set(a*h,l*u,l*p,a*c);break;case"YZY":n.set(l*p,a*h,l*u,a*c);break;case"ZXZ":n.set(l*u,l*p,a*h,a*c);break;case"XZX":n.set(a*h,l*g,l*f,a*c);break;case"YXY":n.set(l*f,a*h,l*g,a*c);break;case"ZYZ":n.set(l*g,l*f,a*h,a*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function tn(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function lt(n,e){switch(e.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}const ke={DEG2RAD:rs,RAD2DEG:Pi,generateUUID:Kt,clamp:Tt,euclideanModulo:Xo,mapLinear:kh,inverseLerp:Uh,lerp:os,damp:Fh,pingpong:Oh,smoothstep:Bh,smootherstep:zh,randInt:Hh,randFloat:Vh,randFloatSpread:Gh,seededRandom:Wh,degToRad:Xh,radToDeg:Yh,isPowerOfTwo:qh,ceilPowerOfTwo:jh,floorPowerOfTwo:Kh,setQuaternionFromProperEuler:Jh,normalize:lt,denormalize:tn};class he{constructor(e=0,t=0){he.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,i=this.y,s=e.elements;return this.x=s[0]*t+s[3]*i+s[6],this.y=s[1]*t+s[4]*i+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(Tt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y;return t*t+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const i=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*i-o*s+e.x,this.y=r*s+o*i+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class qe{constructor(e,t,i,s,r,o,a,l,c){qe.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,a,l,c)}set(e,t,i,s,r,o,a,l,c){const h=this.elements;return h[0]=e,h[1]=s,h[2]=a,h[3]=t,h[4]=r,h[5]=l,h[6]=i,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],this}extractBasis(e,t,i){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],h=i[4],u=i[7],p=i[2],f=i[5],g=i[8],y=s[0],m=s[3],d=s[6],v=s[1],b=s[4],_=s[7],E=s[2],w=s[5],R=s[8];return r[0]=o*y+a*v+l*E,r[3]=o*m+a*b+l*w,r[6]=o*d+a*_+l*R,r[1]=c*y+h*v+u*E,r[4]=c*m+h*b+u*w,r[7]=c*d+h*_+u*R,r[2]=p*y+f*v+g*E,r[5]=p*m+f*b+g*w,r[8]=p*d+f*_+g*R,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8];return t*o*h-t*a*c-i*r*h+i*a*l+s*r*c-s*o*l}invert(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=h*o-a*c,p=a*l-h*r,f=c*r-o*l,g=t*u+i*p+s*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const y=1/g;return e[0]=u*y,e[1]=(s*c-h*i)*y,e[2]=(a*i-s*o)*y,e[3]=p*y,e[4]=(h*t-s*l)*y,e[5]=(s*r-a*t)*y,e[6]=f*y,e[7]=(i*l-c*t)*y,e[8]=(o*t-i*r)*y,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,i,s,r,o,a){const l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*o+c*a)+o+e,-s*c,s*l,-s*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(Ir.makeScale(e,t)),this}rotate(e){return this.premultiply(Ir.makeRotation(-e)),this}translate(e,t){return this.premultiply(Ir.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,i,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,i=e.elements;for(let s=0;s<9;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<9;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Ir=new qe;function fc(n){for(let e=n.length-1;e>=0;--e)if(n[e]>=65535)return!0;return!1}function cs(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function Zh(){const n=cs("canvas");return n.style.display="block",n}const ba={};function ts(n){n in ba||(ba[n]=!0,console.warn(n))}function $h(n,e,t){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(e,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:i()}}setTimeout(r,t)})}function Qh(n){const e=n.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function eu(n){const e=n.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const Qe={enabled:!0,workingColorSpace:Ni,spaces:{},convert:function(n,e,t){return this.enabled===!1||e===t||!e||!t||(this.spaces[e].transfer===ht&&(n.r=bn(n.r),n.g=bn(n.g),n.b=bn(n.b)),this.spaces[e].primaries!==this.spaces[t].primaries&&(n.applyMatrix3(this.spaces[e].toXYZ),n.applyMatrix3(this.spaces[t].fromXYZ)),this.spaces[t].transfer===ht&&(n.r=Ti(n.r),n.g=Ti(n.g),n.b=Ti(n.b))),n},fromWorkingColorSpace:function(n,e){return this.convert(n,this.workingColorSpace,e)},toWorkingColorSpace:function(n,e){return this.convert(n,e,this.workingColorSpace)},getPrimaries:function(n){return this.spaces[n].primaries},getTransfer:function(n){return n===""?vr:this.spaces[n].transfer},getLuminanceCoefficients:function(n,e=this.workingColorSpace){return n.fromArray(this.spaces[e].luminanceCoefficients)},define:function(n){Object.assign(this.spaces,n)},_getMatrix:function(n,e,t){return n.copy(this.spaces[e].toXYZ).multiply(this.spaces[t].fromXYZ)},_getDrawingBufferColorSpace:function(n){return this.spaces[n].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(n=this.workingColorSpace){return this.spaces[n].workingColorSpaceConfig.unpackColorSpace}};function bn(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function Ti(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}const Ma=[.64,.33,.3,.6,.15,.06],xa=[.2126,.7152,.0722],Sa=[.3127,.329],wa=new qe().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Ta=new qe().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);Qe.define({[Ni]:{primaries:Ma,whitePoint:Sa,transfer:vr,toXYZ:wa,fromXYZ:Ta,luminanceCoefficients:xa,workingColorSpaceConfig:{unpackColorSpace:Bt},outputColorSpaceConfig:{drawingBufferColorSpace:Bt}},[Bt]:{primaries:Ma,whitePoint:Sa,transfer:ht,toXYZ:wa,fromXYZ:Ta,luminanceCoefficients:xa,outputColorSpaceConfig:{drawingBufferColorSpace:Bt}}});let ii;class tu{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let t;if(e instanceof HTMLCanvasElement)t=e;else{ii===void 0&&(ii=cs("canvas")),ii.width=e.width,ii.height=e.height;const i=ii.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),t=ii}return t.width>2048||t.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),t.toDataURL("image/jpeg",.6)):t.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=cs("canvas");t.width=e.width,t.height=e.height;const i=t.getContext("2d");i.drawImage(e,0,0,e.width,e.height);const s=i.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=bn(r[o]/255)*255;return i.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let i=0;i<t.length;i++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[i]=Math.floor(bn(t[i]/255)*255):t[i]=bn(t[i]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let nu=0;class pc{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:nu++}),this.uuid=Kt(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(Lr(s[o].image)):r.push(Lr(s[o]))}else r=Lr(s);i.url=r}return t||(e.images[this.uuid]=i),i}}function Lr(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?tu.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let iu=0;class Pt extends ti{constructor(e=Pt.DEFAULT_IMAGE,t=Pt.DEFAULT_MAPPING,i=1001,s=1001,r=1006,o=1008,a=1023,l=1009,c=Pt.DEFAULT_ANISOTROPY,h=""){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:iu++}),this.uuid=Kt(),this.name="",this.source=new pc(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new he(0,0),this.repeat=new he(1,1),this.center=new he(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new qe,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const i={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),t||(e.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==300)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case 1e3:e.x=e.x-Math.floor(e.x);break;case 1001:e.x=e.x<0?0:1;break;case 1002:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case 1e3:e.y=e.y-Math.floor(e.y);break;case 1001:e.y=e.y<0?0:1;break;case 1002:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Pt.DEFAULT_IMAGE=null;Pt.DEFAULT_MAPPING=300;Pt.DEFAULT_ANISOTROPY=1;class tt{constructor(e=0,t=0,i=0,s=1){tt.prototype.isVector4=!0,this.x=e,this.y=t,this.z=i,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,i,s){return this.x=e,this.y=t,this.z=i,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,i=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*i+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*i+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*i+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*i+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,i,s,r;const l=e.elements,c=l[0],h=l[4],u=l[8],p=l[1],f=l[5],g=l[9],y=l[2],m=l[6],d=l[10];if(Math.abs(h-p)<.01&&Math.abs(u-y)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+p)<.1&&Math.abs(u+y)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+d-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const b=(c+1)/2,_=(f+1)/2,E=(d+1)/2,w=(h+p)/4,R=(u+y)/4,I=(g+m)/4;return b>_&&b>E?b<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(b),s=w/i,r=R/i):_>E?_<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(_),i=w/s,r=I/s):E<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(E),i=R/r,s=I/r),this.set(i,s,r,t),this}let v=Math.sqrt((m-g)*(m-g)+(u-y)*(u-y)+(p-h)*(p-h));return Math.abs(v)<.001&&(v=1),this.x=(m-g)/v,this.y=(u-y)/v,this.z=(p-h)/v,this.w=Math.acos((c+f+d-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this.w=Math.max(e.w,Math.min(t.w,this.w)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this.w=Math.max(e,Math.min(t,this.w)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this.w=e.w+(t.w-e.w)*i,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class su extends ti{constructor(e=1,t=1,i={}){super(),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=1,this.scissor=new tt(0,0,e,t),this.scissorTest=!1,this.viewport=new tt(0,0,e,t);const s={width:e,height:t,depth:1};i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:1006,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},i);const r=new Pt(s,i.mapping,i.wrapS,i.wrapT,i.magFilter,i.minFilter,i.format,i.type,i.anisotropy,i.colorSpace);r.flipY=!1,r.generateMipmaps=i.generateMipmaps,r.internalFormat=i.internalFormat,this.textures=[];const o=i.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.depthTexture=i.depthTexture,this.samples=i.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}setSize(e,t,i=1){if(this.width!==e||this.height!==t||this.depth!==i){this.width=e,this.height=t,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=i;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let i=0,s=e.textures.length;i<s;i++)this.textures[i]=e.textures[i].clone(),this.textures[i].isRenderTargetTexture=!0;const t=Object.assign({},e.texture.image);return this.texture.source=new pc(t),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Qn extends su{constructor(e=1,t=1,i={}){super(e,t,i),this.isWebGLRenderTarget=!0}}class mc extends Pt{constructor(e=null,t=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class ru extends Pt{constructor(e=null,t=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:i,depth:s},this.magFilter=1003,this.minFilter=1003,this.wrapR=1001,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class rt{constructor(e=0,t=0,i=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=i,this._w=s}static slerpFlat(e,t,i,s,r,o,a){let l=i[s+0],c=i[s+1],h=i[s+2],u=i[s+3];const p=r[o+0],f=r[o+1],g=r[o+2],y=r[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u;return}if(a===1){e[t+0]=p,e[t+1]=f,e[t+2]=g,e[t+3]=y;return}if(u!==y||l!==p||c!==f||h!==g){let m=1-a;const d=l*p+c*f+h*g+u*y,v=d>=0?1:-1,b=1-d*d;if(b>Number.EPSILON){const E=Math.sqrt(b),w=Math.atan2(E,d*v);m=Math.sin(m*w)/E,a=Math.sin(a*w)/E}const _=a*v;if(l=l*m+p*_,c=c*m+f*_,h=h*m+g*_,u=u*m+y*_,m===1-a){const E=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=E,c*=E,h*=E,u*=E}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,i,s,r,o){const a=i[s],l=i[s+1],c=i[s+2],h=i[s+3],u=r[o],p=r[o+1],f=r[o+2],g=r[o+3];return e[t]=a*g+h*u+l*f-c*p,e[t+1]=l*g+h*p+c*u-a*f,e[t+2]=c*g+h*f+a*p-l*u,e[t+3]=h*g-a*u-l*p-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,i,s){return this._x=e,this._y=t,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const i=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(i/2),h=a(s/2),u=a(r/2),p=l(i/2),f=l(s/2),g=l(r/2);switch(o){case"XYZ":this._x=p*h*u+c*f*g,this._y=c*f*u-p*h*g,this._z=c*h*g+p*f*u,this._w=c*h*u-p*f*g;break;case"YXZ":this._x=p*h*u+c*f*g,this._y=c*f*u-p*h*g,this._z=c*h*g-p*f*u,this._w=c*h*u+p*f*g;break;case"ZXY":this._x=p*h*u-c*f*g,this._y=c*f*u+p*h*g,this._z=c*h*g+p*f*u,this._w=c*h*u-p*f*g;break;case"ZYX":this._x=p*h*u-c*f*g,this._y=c*f*u+p*h*g,this._z=c*h*g-p*f*u,this._w=c*h*u+p*f*g;break;case"YZX":this._x=p*h*u+c*f*g,this._y=c*f*u+p*h*g,this._z=c*h*g-p*f*u,this._w=c*h*u-p*f*g;break;case"XZY":this._x=p*h*u-c*f*g,this._y=c*f*u-p*h*g,this._z=c*h*g+p*f*u,this._w=c*h*u+p*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const i=t/2,s=Math.sin(i);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,i=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],h=t[6],u=t[10],p=i+a+u;if(p>0){const f=.5/Math.sqrt(p+1);this._w=.25/f,this._x=(h-l)*f,this._y=(r-c)*f,this._z=(o-s)*f}else if(i>a&&i>u){const f=2*Math.sqrt(1+i-a-u);this._w=(h-l)/f,this._x=.25*f,this._y=(s+o)/f,this._z=(r+c)/f}else if(a>u){const f=2*Math.sqrt(1+a-i-u);this._w=(r-c)/f,this._x=(s+o)/f,this._y=.25*f,this._z=(l+h)/f}else{const f=2*Math.sqrt(1+u-i-a);this._w=(o-s)/f,this._x=(r+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let i=e.dot(t)+1;return i<Number.EPSILON?(i=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=i):(this._x=0,this._y=-e.z,this._z=e.y,this._w=i)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=i),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Tt(this.dot(e),-1,1)))}rotateTowards(e,t){const i=this.angleTo(e);if(i===0)return this;const s=Math.min(1,t/i);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const i=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,h=t._w;return this._x=i*h+o*a+s*c-r*l,this._y=s*h+o*l+r*a-i*c,this._z=r*h+o*c+i*l-s*a,this._w=o*h-i*a-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const i=this._x,s=this._y,r=this._z,o=this._w;let a=o*e._w+i*e._x+s*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=i,this._y=s,this._z=r,this;const l=1-a*a;if(l<=Number.EPSILON){const f=1-t;return this._w=f*o+t*this._w,this._x=f*i+t*this._x,this._y=f*s+t*this._y,this._z=f*r+t*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,a),u=Math.sin((1-t)*h)/c,p=Math.sin(t*h)/c;return this._w=o*u+this._w*p,this._x=i*u+this._x*p,this._y=s*u+this._y*p,this._z=r*u+this._z*p,this._onChangeCallback(),this}slerpQuaternions(e,t,i){return this.copy(e).slerp(t,i)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class P{constructor(e=0,t=0,i=0){P.prototype.isVector3=!0,this.x=e,this.y=t,this.z=i}set(e,t,i){return i===void 0&&(i=this.z),this.x=e,this.y=t,this.z=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Ea.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Ea.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*i+r[6]*s,this.y=r[1]*t+r[4]*i+r[7]*s,this.z=r[2]*t+r[5]*i+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,i=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*i+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*i+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*i+r[10]*s+r[14])*o,this}applyQuaternion(e){const t=this.x,i=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*s-a*i),h=2*(a*t-r*s),u=2*(r*i-o*t);return this.x=t+l*c+o*u-a*h,this.y=i+l*h+a*c-r*u,this.z=s+l*u+r*h-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,i=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*i+r[8]*s,this.y=r[1]*t+r[5]*i+r[9]*s,this.z=r[2]*t+r[6]*i+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Math.max(e.x,Math.min(t.x,this.x)),this.y=Math.max(e.y,Math.min(t.y,this.y)),this.z=Math.max(e.z,Math.min(t.z,this.z)),this}clampScalar(e,t){return this.x=Math.max(e,Math.min(t,this.x)),this.y=Math.max(e,Math.min(t,this.y)),this.z=Math.max(e,Math.min(t,this.z)),this}clampLength(e,t){const i=this.length();return this.divideScalar(i||1).multiplyScalar(Math.max(e,Math.min(t,i)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,i){return this.x=e.x+(t.x-e.x)*i,this.y=e.y+(t.y-e.y)*i,this.z=e.z+(t.z-e.z)*i,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const i=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-i*l,this.z=i*a-s*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const i=e.dot(this)/t;return this.copy(e).multiplyScalar(i)}projectOnPlane(e){return Dr.copy(this).projectOnVector(e),this.sub(Dr)}reflect(e){return this.sub(Dr.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const i=this.dot(e)/t;return Math.acos(Tt(i,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,i=this.y-e.y,s=this.z-e.z;return t*t+i*i+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,i){const s=Math.sin(t)*e;return this.x=s*Math.sin(i),this.y=Math.cos(t)*e,this.z=s*Math.cos(i),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,i){return this.x=e*Math.sin(t),this.y=i,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),i=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=i,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,i=Math.sqrt(1-t*t);return this.x=i*Math.cos(e),this.y=t,this.z=i*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Dr=new P,Ea=new rt;class On{constructor(e=new P(1/0,1/0,1/0),t=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t+=3)this.expandByPoint($t.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,i=e.count;t<i;t++)this.expandByPoint($t.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,i=e.length;t<i;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const i=$t.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(i),this.max.copy(e).add(i),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const i=e.geometry;if(i!==void 0){const r=i.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,$t):$t.fromBufferAttribute(r,o),$t.applyMatrix4(e.matrixWorld),this.expandByPoint($t);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),ys.copy(e.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),ys.copy(i.boundingBox)),ys.applyMatrix4(e.matrixWorld),this.union(ys)}const s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,$t),$t.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,i;return e.normal.x>0?(t=e.normal.x*this.min.x,i=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,i=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,i+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,i+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,i+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,i+=e.normal.z*this.min.z),t<=-e.constant&&i>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Vi),vs.subVectors(this.max,Vi),si.subVectors(e.a,Vi),ri.subVectors(e.b,Vi),oi.subVectors(e.c,Vi),Tn.subVectors(ri,si),En.subVectors(oi,ri),zn.subVectors(si,oi);let t=[0,-Tn.z,Tn.y,0,-En.z,En.y,0,-zn.z,zn.y,Tn.z,0,-Tn.x,En.z,0,-En.x,zn.z,0,-zn.x,-Tn.y,Tn.x,0,-En.y,En.x,0,-zn.y,zn.x,0];return!Nr(t,si,ri,oi,vs)||(t=[1,0,0,0,1,0,0,0,1],!Nr(t,si,ri,oi,vs))?!1:(bs.crossVectors(Tn,En),t=[bs.x,bs.y,bs.z],Nr(t,si,ri,oi,vs))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,$t).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize($t).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(fn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),fn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),fn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),fn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),fn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),fn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),fn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),fn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(fn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const fn=[new P,new P,new P,new P,new P,new P,new P,new P],$t=new P,ys=new On,si=new P,ri=new P,oi=new P,Tn=new P,En=new P,zn=new P,Vi=new P,vs=new P,bs=new P,Hn=new P;function Nr(n,e,t,i,s){for(let r=0,o=n.length-3;r<=o;r+=3){Hn.fromArray(n,r);const a=s.x*Math.abs(Hn.x)+s.y*Math.abs(Hn.y)+s.z*Math.abs(Hn.z),l=e.dot(Hn),c=t.dot(Hn),h=i.dot(Hn);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}const ou=new On,Gi=new P,kr=new P;class Mn{constructor(e=new P,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const i=this.center;t!==void 0?i.copy(t):ou.setFromPoints(e).getCenter(i);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,i.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const i=this.center.distanceToSquared(e);return t.copy(e),i>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Gi.subVectors(e,this.center);const t=Gi.lengthSq();if(t>this.radius*this.radius){const i=Math.sqrt(t),s=(i-this.radius)*.5;this.center.addScaledVector(Gi,s/i),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(kr.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Gi.copy(e.center).add(kr)),this.expandByPoint(Gi.copy(e.center).sub(kr))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const pn=new P,Ur=new P,Ms=new P,An=new P,Fr=new P,xs=new P,Or=new P;class fs{constructor(e=new P,t=new P(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,pn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const i=t.dot(this.direction);return i<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=pn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(pn.copy(this.origin).addScaledVector(this.direction,t),pn.distanceToSquared(e))}distanceSqToSegment(e,t,i,s){Ur.copy(e).add(t).multiplyScalar(.5),Ms.copy(t).sub(e).normalize(),An.copy(this.origin).sub(Ur);const r=e.distanceTo(t)*.5,o=-this.direction.dot(Ms),a=An.dot(this.direction),l=-An.dot(Ms),c=An.lengthSq(),h=Math.abs(1-o*o);let u,p,f,g;if(h>0)if(u=o*l-a,p=o*a-l,g=r*h,u>=0)if(p>=-g)if(p<=g){const y=1/h;u*=y,p*=y,f=u*(u+o*p+2*a)+p*(o*u+p+2*l)+c}else p=r,u=Math.max(0,-(o*p+a)),f=-u*u+p*(p+2*l)+c;else p=-r,u=Math.max(0,-(o*p+a)),f=-u*u+p*(p+2*l)+c;else p<=-g?(u=Math.max(0,-(-o*r+a)),p=u>0?-r:Math.min(Math.max(-r,-l),r),f=-u*u+p*(p+2*l)+c):p<=g?(u=0,p=Math.min(Math.max(-r,-l),r),f=p*(p+2*l)+c):(u=Math.max(0,-(o*r+a)),p=u>0?r:Math.min(Math.max(-r,-l),r),f=-u*u+p*(p+2*l)+c);else p=o>0?-r:r,u=Math.max(0,-(o*p+a)),f=-u*u+p*(p+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(Ur).addScaledVector(Ms,p),f}intersectSphere(e,t){pn.subVectors(e.center,this.origin);const i=pn.dot(this.direction),s=pn.dot(pn)-i*i,r=e.radius*e.radius;if(s>r)return null;const o=Math.sqrt(r-s),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(e.normal)+e.constant)/t;return i>=0?i:null}intersectPlane(e,t){const i=this.distanceToPlane(e);return i===null?null:this.at(i,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let i,s,r,o,a,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,p=this.origin;return c>=0?(i=(e.min.x-p.x)*c,s=(e.max.x-p.x)*c):(i=(e.max.x-p.x)*c,s=(e.min.x-p.x)*c),h>=0?(r=(e.min.y-p.y)*h,o=(e.max.y-p.y)*h):(r=(e.max.y-p.y)*h,o=(e.min.y-p.y)*h),i>o||r>s||((r>i||isNaN(i))&&(i=r),(o<s||isNaN(s))&&(s=o),u>=0?(a=(e.min.z-p.z)*u,l=(e.max.z-p.z)*u):(a=(e.max.z-p.z)*u,l=(e.min.z-p.z)*u),i>l||a>s)||((a>i||i!==i)&&(i=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,t)}intersectsBox(e){return this.intersectBox(e,pn)!==null}intersectTriangle(e,t,i,s,r){Fr.subVectors(t,e),xs.subVectors(i,e),Or.crossVectors(Fr,xs);let o=this.direction.dot(Or),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;An.subVectors(this.origin,e);const l=a*this.direction.dot(xs.crossVectors(An,xs));if(l<0)return null;const c=a*this.direction.dot(Fr.cross(An));if(c<0||l+c>o)return null;const h=-a*An.dot(Or);return h<0?null:this.at(h/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class He{constructor(e,t,i,s,r,o,a,l,c,h,u,p,f,g,y,m){He.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,i,s,r,o,a,l,c,h,u,p,f,g,y,m)}set(e,t,i,s,r,o,a,l,c,h,u,p,f,g,y,m){const d=this.elements;return d[0]=e,d[4]=t,d[8]=i,d[12]=s,d[1]=r,d[5]=o,d[9]=a,d[13]=l,d[2]=c,d[6]=h,d[10]=u,d[14]=p,d[3]=f,d[7]=g,d[11]=y,d[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new He().fromArray(this.elements)}copy(e){const t=this.elements,i=e.elements;return t[0]=i[0],t[1]=i[1],t[2]=i[2],t[3]=i[3],t[4]=i[4],t[5]=i[5],t[6]=i[6],t[7]=i[7],t[8]=i[8],t[9]=i[9],t[10]=i[10],t[11]=i[11],t[12]=i[12],t[13]=i[13],t[14]=i[14],t[15]=i[15],this}copyPosition(e){const t=this.elements,i=e.elements;return t[12]=i[12],t[13]=i[13],t[14]=i[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,i){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(e,t,i){return this.set(e.x,t.x,i.x,0,e.y,t.y,i.y,0,e.z,t.z,i.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,i=e.elements,s=1/ai.setFromMatrixColumn(e,0).length(),r=1/ai.setFromMatrixColumn(e,1).length(),o=1/ai.setFromMatrixColumn(e,2).length();return t[0]=i[0]*s,t[1]=i[1]*s,t[2]=i[2]*s,t[3]=0,t[4]=i[4]*r,t[5]=i[5]*r,t[6]=i[6]*r,t[7]=0,t[8]=i[8]*o,t[9]=i[9]*o,t[10]=i[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,i=e.x,s=e.y,r=e.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){const p=o*h,f=o*u,g=a*h,y=a*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=f+g*c,t[5]=p-y*c,t[9]=-a*l,t[2]=y-p*c,t[6]=g+f*c,t[10]=o*l}else if(e.order==="YXZ"){const p=l*h,f=l*u,g=c*h,y=c*u;t[0]=p+y*a,t[4]=g*a-f,t[8]=o*c,t[1]=o*u,t[5]=o*h,t[9]=-a,t[2]=f*a-g,t[6]=y+p*a,t[10]=o*l}else if(e.order==="ZXY"){const p=l*h,f=l*u,g=c*h,y=c*u;t[0]=p-y*a,t[4]=-o*u,t[8]=g+f*a,t[1]=f+g*a,t[5]=o*h,t[9]=y-p*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){const p=o*h,f=o*u,g=a*h,y=a*u;t[0]=l*h,t[4]=g*c-f,t[8]=p*c+y,t[1]=l*u,t[5]=y*c+p,t[9]=f*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){const p=o*l,f=o*c,g=a*l,y=a*c;t[0]=l*h,t[4]=y-p*u,t[8]=g*u+f,t[1]=u,t[5]=o*h,t[9]=-a*h,t[2]=-c*h,t[6]=f*u+g,t[10]=p-y*u}else if(e.order==="XZY"){const p=o*l,f=o*c,g=a*l,y=a*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=p*u+y,t[5]=o*h,t[9]=f*u-g,t[2]=g*u-f,t[6]=a*h,t[10]=y*u+p}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(au,e,lu)}lookAt(e,t,i){const s=this.elements;return Vt.subVectors(e,t),Vt.lengthSq()===0&&(Vt.z=1),Vt.normalize(),Rn.crossVectors(i,Vt),Rn.lengthSq()===0&&(Math.abs(i.z)===1?Vt.x+=1e-4:Vt.z+=1e-4,Vt.normalize(),Rn.crossVectors(i,Vt)),Rn.normalize(),Ss.crossVectors(Vt,Rn),s[0]=Rn.x,s[4]=Ss.x,s[8]=Vt.x,s[1]=Rn.y,s[5]=Ss.y,s[9]=Vt.y,s[2]=Rn.z,s[6]=Ss.z,s[10]=Vt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const i=e.elements,s=t.elements,r=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],h=i[1],u=i[5],p=i[9],f=i[13],g=i[2],y=i[6],m=i[10],d=i[14],v=i[3],b=i[7],_=i[11],E=i[15],w=s[0],R=s[4],I=s[8],S=s[12],x=s[1],A=s[5],O=s[9],U=s[13],V=s[2],F=s[6],H=s[10],Q=s[14],Y=s[3],M=s[7],N=s[11],Z=s[15];return r[0]=o*w+a*x+l*V+c*Y,r[4]=o*R+a*A+l*F+c*M,r[8]=o*I+a*O+l*H+c*N,r[12]=o*S+a*U+l*Q+c*Z,r[1]=h*w+u*x+p*V+f*Y,r[5]=h*R+u*A+p*F+f*M,r[9]=h*I+u*O+p*H+f*N,r[13]=h*S+u*U+p*Q+f*Z,r[2]=g*w+y*x+m*V+d*Y,r[6]=g*R+y*A+m*F+d*M,r[10]=g*I+y*O+m*H+d*N,r[14]=g*S+y*U+m*Q+d*Z,r[3]=v*w+b*x+_*V+E*Y,r[7]=v*R+b*A+_*F+E*M,r[11]=v*I+b*O+_*H+E*N,r[15]=v*S+b*U+_*Q+E*Z,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],i=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],h=e[2],u=e[6],p=e[10],f=e[14],g=e[3],y=e[7],m=e[11],d=e[15];return g*(+r*l*u-s*c*u-r*a*p+i*c*p+s*a*f-i*l*f)+y*(+t*l*f-t*c*p+r*o*p-s*o*f+s*c*h-r*l*h)+m*(+t*c*u-t*a*f-r*o*u+i*o*f+r*a*h-i*c*h)+d*(-s*a*h-t*l*u+t*a*p+s*o*u-i*o*p+i*l*h)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,i){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=i),this}invert(){const e=this.elements,t=e[0],i=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=e[9],p=e[10],f=e[11],g=e[12],y=e[13],m=e[14],d=e[15],v=u*m*c-y*p*c+y*l*f-a*m*f-u*l*d+a*p*d,b=g*p*c-h*m*c-g*l*f+o*m*f+h*l*d-o*p*d,_=h*y*c-g*u*c+g*a*f-o*y*f-h*a*d+o*u*d,E=g*u*l-h*y*l-g*a*p+o*y*p+h*a*m-o*u*m,w=t*v+i*b+s*_+r*E;if(w===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const R=1/w;return e[0]=v*R,e[1]=(y*p*r-u*m*r-y*s*f+i*m*f+u*s*d-i*p*d)*R,e[2]=(a*m*r-y*l*r+y*s*c-i*m*c-a*s*d+i*l*d)*R,e[3]=(u*l*r-a*p*r-u*s*c+i*p*c+a*s*f-i*l*f)*R,e[4]=b*R,e[5]=(h*m*r-g*p*r+g*s*f-t*m*f-h*s*d+t*p*d)*R,e[6]=(g*l*r-o*m*r-g*s*c+t*m*c+o*s*d-t*l*d)*R,e[7]=(o*p*r-h*l*r+h*s*c-t*p*c-o*s*f+t*l*f)*R,e[8]=_*R,e[9]=(g*u*r-h*y*r-g*i*f+t*y*f+h*i*d-t*u*d)*R,e[10]=(o*y*r-g*a*r+g*i*c-t*y*c-o*i*d+t*a*d)*R,e[11]=(h*a*r-o*u*r-h*i*c+t*u*c+o*i*f-t*a*f)*R,e[12]=E*R,e[13]=(h*y*s-g*u*s+g*i*p-t*y*p-h*i*m+t*u*m)*R,e[14]=(g*a*s-o*y*s-g*i*l+t*y*l+o*i*m-t*a*m)*R,e[15]=(o*u*s-h*a*s+h*i*l-t*u*l-o*i*p+t*a*p)*R,this}scale(e){const t=this.elements,i=e.x,s=e.y,r=e.z;return t[0]*=i,t[4]*=s,t[8]*=r,t[1]*=i,t[5]*=s,t[9]*=r,t[2]*=i,t[6]*=s,t[10]*=r,t[3]*=i,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],i=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,i,s))}makeTranslation(e,t,i){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,i,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),i=Math.sin(e);return this.set(1,0,0,0,0,t,-i,0,0,i,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,0,i,0,0,1,0,0,-i,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),i=Math.sin(e);return this.set(t,-i,0,0,i,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const i=Math.cos(t),s=Math.sin(t),r=1-i,o=e.x,a=e.y,l=e.z,c=r*o,h=r*a;return this.set(c*o+i,c*a-s*l,c*l+s*a,0,c*a+s*l,h*a+i,h*l-s*o,0,c*l-s*a,h*l+s*o,r*l*l+i,0,0,0,0,1),this}makeScale(e,t,i){return this.set(e,0,0,0,0,t,0,0,0,0,i,0,0,0,0,1),this}makeShear(e,t,i,s,r,o){return this.set(1,i,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,i){const s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,h=o+o,u=a+a,p=r*c,f=r*h,g=r*u,y=o*h,m=o*u,d=a*u,v=l*c,b=l*h,_=l*u,E=i.x,w=i.y,R=i.z;return s[0]=(1-(y+d))*E,s[1]=(f+_)*E,s[2]=(g-b)*E,s[3]=0,s[4]=(f-_)*w,s[5]=(1-(p+d))*w,s[6]=(m+v)*w,s[7]=0,s[8]=(g+b)*R,s[9]=(m-v)*R,s[10]=(1-(p+y))*R,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,i){const s=this.elements;let r=ai.set(s[0],s[1],s[2]).length();const o=ai.set(s[4],s[5],s[6]).length(),a=ai.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],Qt.copy(this);const c=1/r,h=1/o,u=1/a;return Qt.elements[0]*=c,Qt.elements[1]*=c,Qt.elements[2]*=c,Qt.elements[4]*=h,Qt.elements[5]*=h,Qt.elements[6]*=h,Qt.elements[8]*=u,Qt.elements[9]*=u,Qt.elements[10]*=u,t.setFromRotationMatrix(Qt),i.x=r,i.y=o,i.z=a,this}makePerspective(e,t,i,s,r,o,a=2e3){const l=this.elements,c=2*r/(t-e),h=2*r/(i-s),u=(t+e)/(t-e),p=(i+s)/(i-s);let f,g;if(a===2e3)f=-(o+r)/(o-r),g=-2*o*r/(o-r);else if(a===2001)f=-o/(o-r),g=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=p,l[13]=0,l[2]=0,l[6]=0,l[10]=f,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,i,s,r,o,a=2e3){const l=this.elements,c=1/(t-e),h=1/(i-s),u=1/(o-r),p=(t+e)*c,f=(i+s)*h;let g,y;if(a===2e3)g=(o+r)*u,y=-2*u;else if(a===2001)g=r*u,y=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-p,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-f,l[2]=0,l[6]=0,l[10]=y,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,i=e.elements;for(let s=0;s<16;s++)if(t[s]!==i[s])return!1;return!0}fromArray(e,t=0){for(let i=0;i<16;i++)this.elements[i]=e[i+t];return this}toArray(e=[],t=0){const i=this.elements;return e[t]=i[0],e[t+1]=i[1],e[t+2]=i[2],e[t+3]=i[3],e[t+4]=i[4],e[t+5]=i[5],e[t+6]=i[6],e[t+7]=i[7],e[t+8]=i[8],e[t+9]=i[9],e[t+10]=i[10],e[t+11]=i[11],e[t+12]=i[12],e[t+13]=i[13],e[t+14]=i[14],e[t+15]=i[15],e}}const ai=new P,Qt=new He,au=new P(0,0,0),lu=new P(1,1,1),Rn=new P,Ss=new P,Vt=new P,Aa=new He,Ra=new rt;class rn{constructor(e=0,t=0,i=0,s=rn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=i,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,i,s=this._order){return this._x=e,this._y=t,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,i=!0){const s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],h=s[9],u=s[2],p=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(Tt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(p,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Tt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(Tt(p,-1,1)),Math.abs(p)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Tt(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(p,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Tt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-Tt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(p,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,i===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,i){return Aa.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Aa,t,i)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Ra.setFromEuler(this),this.setFromQuaternion(Ra,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}rn.DEFAULT_ORDER="XYZ";class Yo{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let cu=0;const Ca=new P,li=new rt,mn=new He,ws=new P,Wi=new P,hu=new P,uu=new rt,Pa=new P(1,0,0),Ia=new P(0,1,0),La=new P(0,0,1),Da={type:"added"},du={type:"removed"},ci={type:"childadded",child:null},Br={type:"childremoved",child:null};class vt extends ti{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:cu++}),this.uuid=Kt(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=vt.DEFAULT_UP.clone();const e=new P,t=new rn,i=new rt,s=new P(1,1,1);function r(){i.setFromEuler(t,!1)}function o(){t.setFromQuaternion(i,void 0,!1)}t._onChange(r),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new He},normalMatrix:{value:new qe}}),this.matrix=new He,this.matrixWorld=new He,this.matrixAutoUpdate=vt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=vt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Yo,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return li.setFromAxisAngle(e,t),this.quaternion.multiply(li),this}rotateOnWorldAxis(e,t){return li.setFromAxisAngle(e,t),this.quaternion.premultiply(li),this}rotateX(e){return this.rotateOnAxis(Pa,e)}rotateY(e){return this.rotateOnAxis(Ia,e)}rotateZ(e){return this.rotateOnAxis(La,e)}translateOnAxis(e,t){return Ca.copy(e).applyQuaternion(this.quaternion),this.position.add(Ca.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Pa,e)}translateY(e){return this.translateOnAxis(Ia,e)}translateZ(e){return this.translateOnAxis(La,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(mn.copy(this.matrixWorld).invert())}lookAt(e,t,i){e.isVector3?ws.copy(e):ws.set(e,t,i);const s=this.parent;this.updateWorldMatrix(!0,!1),Wi.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?mn.lookAt(Wi,ws,this.up):mn.lookAt(ws,Wi,this.up),this.quaternion.setFromRotationMatrix(mn),s&&(mn.extractRotation(s.matrixWorld),li.setFromRotationMatrix(mn),this.quaternion.premultiply(li.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Da),ci.child=e,this.dispatchEvent(ci),ci.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(du),Br.child=e,this.dispatchEvent(Br),Br.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),mn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),mn.multiply(e.parent.matrixWorld)),e.applyMatrix4(mn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Da),ci.child=e,this.dispatchEvent(ci),ci.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let i=0,s=this.children.length;i<s;i++){const o=this.children[i].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,i=[]){this[e]===t&&i.push(this);const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,i);return i}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Wi,e,hu),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Wi,uu,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let i=0,s=t.length;i<s;i++)t[i].updateMatrixWorld(e)}updateWorldMatrix(e,t){const i=this.parent;if(e===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",i={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.visibility=this._visibility,s.active=this._active,s.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.geometryCount=this._geometryCount,s.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere={center:s.boundingSphere.center.toArray(),radius:s.boundingSphere.radius}),this.boundingBox!==null&&(s.boundingBox={min:s.boundingBox.min.toArray(),max:s.boundingBox.max.toArray()}));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];r(e.shapes,u)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){const a=o(e.geometries),l=o(e.materials),c=o(e.textures),h=o(e.images),u=o(e.shapes),p=o(e.skeletons),f=o(e.animations),g=o(e.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),h.length>0&&(i.images=h),u.length>0&&(i.shapes=u),p.length>0&&(i.skeletons=p),f.length>0&&(i.animations=f),g.length>0&&(i.nodes=g)}return i.object=s,i;function o(a){const l=[];for(const c in a){const h=a[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let i=0;i<e.children.length;i++){const s=e.children[i];this.add(s.clone())}return this}}vt.DEFAULT_UP=new P(0,1,0);vt.DEFAULT_MATRIX_AUTO_UPDATE=!0;vt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const en=new P,gn=new P,zr=new P,_n=new P,hi=new P,ui=new P,Na=new P,Hr=new P,Vr=new P,Gr=new P,Wr=new tt,Xr=new tt,Yr=new tt;class jt{constructor(e=new P,t=new P,i=new P){this.a=e,this.b=t,this.c=i}static getNormal(e,t,i,s){s.subVectors(i,t),en.subVectors(e,t),s.cross(en);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,i,s,r){en.subVectors(s,t),gn.subVectors(i,t),zr.subVectors(e,t);const o=en.dot(en),a=en.dot(gn),l=en.dot(zr),c=gn.dot(gn),h=gn.dot(zr),u=o*c-a*a;if(u===0)return r.set(0,0,0),null;const p=1/u,f=(c*l-a*h)*p,g=(o*h-a*l)*p;return r.set(1-f-g,g,f)}static containsPoint(e,t,i,s){return this.getBarycoord(e,t,i,s,_n)===null?!1:_n.x>=0&&_n.y>=0&&_n.x+_n.y<=1}static getInterpolation(e,t,i,s,r,o,a,l){return this.getBarycoord(e,t,i,s,_n)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,_n.x),l.addScaledVector(o,_n.y),l.addScaledVector(a,_n.z),l)}static getInterpolatedAttribute(e,t,i,s,r,o){return Wr.setScalar(0),Xr.setScalar(0),Yr.setScalar(0),Wr.fromBufferAttribute(e,t),Xr.fromBufferAttribute(e,i),Yr.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(Wr,r.x),o.addScaledVector(Xr,r.y),o.addScaledVector(Yr,r.z),o}static isFrontFacing(e,t,i,s){return en.subVectors(i,t),gn.subVectors(e,t),en.cross(gn).dot(s)<0}set(e,t,i){return this.a.copy(e),this.b.copy(t),this.c.copy(i),this}setFromPointsAndIndices(e,t,i,s){return this.a.copy(e[t]),this.b.copy(e[i]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,i,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,i),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return en.subVectors(this.c,this.b),gn.subVectors(this.a,this.b),en.cross(gn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return jt.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return jt.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,i,s,r){return jt.getInterpolation(e,this.a,this.b,this.c,t,i,s,r)}containsPoint(e){return jt.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return jt.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const i=this.a,s=this.b,r=this.c;let o,a;hi.subVectors(s,i),ui.subVectors(r,i),Hr.subVectors(e,i);const l=hi.dot(Hr),c=ui.dot(Hr);if(l<=0&&c<=0)return t.copy(i);Vr.subVectors(e,s);const h=hi.dot(Vr),u=ui.dot(Vr);if(h>=0&&u<=h)return t.copy(s);const p=l*u-h*c;if(p<=0&&l>=0&&h<=0)return o=l/(l-h),t.copy(i).addScaledVector(hi,o);Gr.subVectors(e,r);const f=hi.dot(Gr),g=ui.dot(Gr);if(g>=0&&f<=g)return t.copy(r);const y=f*c-l*g;if(y<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(i).addScaledVector(ui,a);const m=h*g-f*u;if(m<=0&&u-h>=0&&f-g>=0)return Na.subVectors(r,s),a=(u-h)/(u-h+(f-g)),t.copy(s).addScaledVector(Na,a);const d=1/(m+y+p);return o=y*d,a=p*d,t.copy(i).addScaledVector(hi,o).addScaledVector(ui,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const gc={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Cn={h:0,s:0,l:0},Ts={h:0,s:0,l:0};function qr(n,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?n+(e-n)*6*t:t<1/2?e:t<2/3?n+(e-n)*6*(2/3-t):n}class Ue{constructor(e,t,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,i)}set(e,t,i){if(t===void 0&&i===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,i);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Bt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Qe.toWorkingColorSpace(this,t),this}setRGB(e,t,i,s=Qe.workingColorSpace){return this.r=e,this.g=t,this.b=i,Qe.toWorkingColorSpace(this,s),this}setHSL(e,t,i,s=Qe.workingColorSpace){if(e=Xo(e,1),t=Tt(t,0,1),i=Tt(i,0,1),t===0)this.r=this.g=this.b=i;else{const r=i<=.5?i*(1+t):i+t-i*t,o=2*i-r;this.r=qr(o,r,e+1/3),this.g=qr(o,r,e),this.b=qr(o,r,e-1/3)}return Qe.toWorkingColorSpace(this,s),this}setStyle(e,t=Bt){function i(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Bt){const i=gc[e.toLowerCase()];return i!==void 0?this.setHex(i,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=bn(e.r),this.g=bn(e.g),this.b=bn(e.b),this}copyLinearToSRGB(e){return this.r=Ti(e.r),this.g=Ti(e.g),this.b=Ti(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Bt){return Qe.fromWorkingColorSpace(kt.copy(this),e),Math.round(Tt(kt.r*255,0,255))*65536+Math.round(Tt(kt.g*255,0,255))*256+Math.round(Tt(kt.b*255,0,255))}getHexString(e=Bt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=Qe.workingColorSpace){Qe.fromWorkingColorSpace(kt.copy(this),t);const i=kt.r,s=kt.g,r=kt.b,o=Math.max(i,s,r),a=Math.min(i,s,r);let l,c;const h=(a+o)/2;if(a===o)l=0,c=0;else{const u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case i:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-i)/u+2;break;case r:l=(i-s)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=Qe.workingColorSpace){return Qe.fromWorkingColorSpace(kt.copy(this),t),e.r=kt.r,e.g=kt.g,e.b=kt.b,e}getStyle(e=Bt){Qe.fromWorkingColorSpace(kt.copy(this),e);const t=kt.r,i=kt.g,s=kt.b;return e!==Bt?`color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(e,t,i){return this.getHSL(Cn),this.setHSL(Cn.h+e,Cn.s+t,Cn.l+i)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,i){return this.r=e.r+(t.r-e.r)*i,this.g=e.g+(t.g-e.g)*i,this.b=e.b+(t.b-e.b)*i,this}lerpHSL(e,t){this.getHSL(Cn),e.getHSL(Ts);const i=os(Cn.h,Ts.h,t),s=os(Cn.s,Ts.s,t),r=os(Cn.l,Ts.l,t);return this.setHSL(i,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,i=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*i+r[6]*s,this.g=r[1]*t+r[4]*i+r[7]*s,this.b=r[2]*t+r[5]*i+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const kt=new Ue;Ue.NAMES=gc;let fu=0;class xn extends ti{static get type(){return"Material"}get type(){return this.constructor.type}set type(e){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:fu++}),this.uuid=Kt(),this.name="",this.blending=1,this.side=0,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=204,this.blendDst=205,this.blendEquation=100,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ue(0,0,0),this.blendAlpha=0,this.depthFunc=3,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=519,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=7680,this.stencilZFail=7680,this.stencilZPass=7680,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const i=e[t];if(i===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[t]=i}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const i={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(e).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(e).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(e).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(e).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(e).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==1&&(i.blending=this.blending),this.side!==0&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==204&&(i.blendSrc=this.blendSrc),this.blendDst!==205&&(i.blendDst=this.blendDst),this.blendEquation!==100&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==3&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==519&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==7680&&(i.stencilFail=this.stencilFail),this.stencilZFail!==7680&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==7680&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){const o=[];for(const a in r){const l=r[a];delete l.metadata,o.push(l)}return o}if(t){const r=s(e.textures),o=s(e.images);r.length>0&&(i.textures=r),o.length>0&&(i.images=o)}return i}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let i=null;if(t!==null){const s=t.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=t[r].clone()}return this.clippingPlanes=i,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class qo extends xn{static get type(){return"MeshBasicMaterial"}constructor(e){super(),this.isMeshBasicMaterial=!0,this.color=new Ue(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new rn,this.combine=0,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const vn=pu();function pu(){const n=new ArrayBuffer(4),e=new Float32Array(n),t=new Uint32Array(n),i=new Uint32Array(512),s=new Uint32Array(512);for(let l=0;l<256;++l){const c=l-127;c<-27?(i[l]=0,i[l|256]=32768,s[l]=24,s[l|256]=24):c<-14?(i[l]=1024>>-c-14,i[l|256]=1024>>-c-14|32768,s[l]=-c-1,s[l|256]=-c-1):c<=15?(i[l]=c+15<<10,i[l|256]=c+15<<10|32768,s[l]=13,s[l|256]=13):c<128?(i[l]=31744,i[l|256]=64512,s[l]=24,s[l|256]=24):(i[l]=31744,i[l|256]=64512,s[l]=13,s[l|256]=13)}const r=new Uint32Array(2048),o=new Uint32Array(64),a=new Uint32Array(64);for(let l=1;l<1024;++l){let c=l<<13,h=0;for(;(c&8388608)===0;)c<<=1,h-=8388608;c&=-8388609,h+=947912704,r[l]=c|h}for(let l=1024;l<2048;++l)r[l]=939524096+(l-1024<<13);for(let l=1;l<31;++l)o[l]=l<<23;o[31]=1199570944,o[32]=2147483648;for(let l=33;l<63;++l)o[l]=2147483648+(l-32<<23);o[63]=3347054592;for(let l=1;l<64;++l)l!==32&&(a[l]=1024);return{floatView:e,uint32View:t,baseTable:i,shiftTable:s,mantissaTable:r,exponentTable:o,offsetTable:a}}function mu(n){Math.abs(n)>65504&&console.warn("THREE.DataUtils.toHalfFloat(): Value out of range."),n=Tt(n,-65504,65504),vn.floatView[0]=n;const e=vn.uint32View[0],t=e>>23&511;return vn.baseTable[t]+((e&8388607)>>vn.shiftTable[t])}function gu(n){const e=n>>10;return vn.uint32View[0]=vn.mantissaTable[vn.offsetTable[e]+(n&1023)]+vn.exponentTable[e],vn.floatView[0]}const Ny={toHalfFloat:mu,fromHalfFloat:gu},xt=new P,Es=new he;class Ct{constructor(e,t,i=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=i,this.usage=35044,this.updateRanges=[],this.gpuType=1015,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,i){e*=this.itemSize,i*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[i+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,i=this.count;t<i;t++)Es.fromBufferAttribute(this,t),Es.applyMatrix3(e),this.setXY(t,Es.x,Es.y);else if(this.itemSize===3)for(let t=0,i=this.count;t<i;t++)xt.fromBufferAttribute(this,t),xt.applyMatrix3(e),this.setXYZ(t,xt.x,xt.y,xt.z);return this}applyMatrix4(e){for(let t=0,i=this.count;t<i;t++)xt.fromBufferAttribute(this,t),xt.applyMatrix4(e),this.setXYZ(t,xt.x,xt.y,xt.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)xt.fromBufferAttribute(this,t),xt.applyNormalMatrix(e),this.setXYZ(t,xt.x,xt.y,xt.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)xt.fromBufferAttribute(this,t),xt.transformDirection(e),this.setXYZ(t,xt.x,xt.y,xt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let i=this.array[e*this.itemSize+t];return this.normalized&&(i=tn(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=lt(i,this.array)),this.array[e*this.itemSize+t]=i,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=tn(t,this.array)),t}setX(e,t){return this.normalized&&(t=lt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=tn(t,this.array)),t}setY(e,t){return this.normalized&&(t=lt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=tn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=lt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=tn(t,this.array)),t}setW(e,t){return this.normalized&&(t=lt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,i){return e*=this.itemSize,this.normalized&&(t=lt(t,this.array),i=lt(i,this.array)),this.array[e+0]=t,this.array[e+1]=i,this}setXYZ(e,t,i,s){return e*=this.itemSize,this.normalized&&(t=lt(t,this.array),i=lt(i,this.array),s=lt(s,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e*=this.itemSize,this.normalized&&(t=lt(t,this.array),i=lt(i,this.array),s=lt(s,this.array),r=lt(r,this.array)),this.array[e+0]=t,this.array[e+1]=i,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==35044&&(e.usage=this.usage),e}}class jo extends Ct{constructor(e,t,i){super(new Uint16Array(e),t,i)}}class _c extends Ct{constructor(e,t,i){super(new Uint32Array(e),t,i)}}class Ke extends Ct{constructor(e,t,i){super(new Float32Array(e),t,i)}}let _u=0;const qt=new He,jr=new vt,di=new P,Gt=new On,Xi=new On,Rt=new P;class _t extends ti{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:_u++}),this.uuid=Kt(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(fc(e)?_c:jo)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,i=0){this.groups.push({start:e,count:t,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const r=new qe().getNormalMatrix(e);i.applyNormalMatrix(r),i.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return qt.makeRotationFromQuaternion(e),this.applyMatrix4(qt),this}rotateX(e){return qt.makeRotationX(e),this.applyMatrix4(qt),this}rotateY(e){return qt.makeRotationY(e),this.applyMatrix4(qt),this}rotateZ(e){return qt.makeRotationZ(e),this.applyMatrix4(qt),this}translate(e,t,i){return qt.makeTranslation(e,t,i),this.applyMatrix4(qt),this}scale(e,t,i){return qt.makeScale(e,t,i),this.applyMatrix4(qt),this}lookAt(e){return jr.lookAt(e),jr.updateMatrix(),this.applyMatrix4(jr.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(di).negate(),this.translate(di.x,di.y,di.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const i=[];for(let s=0,r=e.length;s<r;s++){const o=e[s];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Ke(i,3))}else{for(let i=0,s=t.count;i<s;i++){const r=e[i];t.setXYZ(i,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new On);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let i=0,s=t.length;i<s;i++){const r=t[i];Gt.setFromBufferAttribute(r),this.morphTargetsRelative?(Rt.addVectors(this.boundingBox.min,Gt.min),this.boundingBox.expandByPoint(Rt),Rt.addVectors(this.boundingBox.max,Gt.max),this.boundingBox.expandByPoint(Rt)):(this.boundingBox.expandByPoint(Gt.min),this.boundingBox.expandByPoint(Gt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Mn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new P,1/0);return}if(e){const i=this.boundingSphere.center;if(Gt.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){const a=t[r];Xi.setFromBufferAttribute(a),this.morphTargetsRelative?(Rt.addVectors(Gt.min,Xi.min),Gt.expandByPoint(Rt),Rt.addVectors(Gt.max,Xi.max),Gt.expandByPoint(Rt)):(Gt.expandByPoint(Xi.min),Gt.expandByPoint(Xi.max))}Gt.getCenter(i);let s=0;for(let r=0,o=e.count;r<o;r++)Rt.fromBufferAttribute(e,r),s=Math.max(s,i.distanceToSquared(Rt));if(t)for(let r=0,o=t.length;r<o;r++){const a=t[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)Rt.fromBufferAttribute(a,c),l&&(di.fromBufferAttribute(e,c),Rt.add(di)),s=Math.max(s,i.distanceToSquared(Rt))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Ct(new Float32Array(4*i.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let I=0;I<i.count;I++)a[I]=new P,l[I]=new P;const c=new P,h=new P,u=new P,p=new he,f=new he,g=new he,y=new P,m=new P;function d(I,S,x){c.fromBufferAttribute(i,I),h.fromBufferAttribute(i,S),u.fromBufferAttribute(i,x),p.fromBufferAttribute(r,I),f.fromBufferAttribute(r,S),g.fromBufferAttribute(r,x),h.sub(c),u.sub(c),f.sub(p),g.sub(p);const A=1/(f.x*g.y-g.x*f.y);isFinite(A)&&(y.copy(h).multiplyScalar(g.y).addScaledVector(u,-f.y).multiplyScalar(A),m.copy(u).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(A),a[I].add(y),a[S].add(y),a[x].add(y),l[I].add(m),l[S].add(m),l[x].add(m))}let v=this.groups;v.length===0&&(v=[{start:0,count:e.count}]);for(let I=0,S=v.length;I<S;++I){const x=v[I],A=x.start,O=x.count;for(let U=A,V=A+O;U<V;U+=3)d(e.getX(U+0),e.getX(U+1),e.getX(U+2))}const b=new P,_=new P,E=new P,w=new P;function R(I){E.fromBufferAttribute(s,I),w.copy(E);const S=a[I];b.copy(S),b.sub(E.multiplyScalar(E.dot(S))).normalize(),_.crossVectors(w,S);const A=_.dot(l[I])<0?-1:1;o.setXYZW(I,b.x,b.y,b.z,A)}for(let I=0,S=v.length;I<S;++I){const x=v[I],A=x.start,O=x.count;for(let U=A,V=A+O;U<V;U+=3)R(e.getX(U+0)),R(e.getX(U+1)),R(e.getX(U+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new Ct(new Float32Array(t.count*3),3),this.setAttribute("normal",i);else for(let p=0,f=i.count;p<f;p++)i.setXYZ(p,0,0,0);const s=new P,r=new P,o=new P,a=new P,l=new P,c=new P,h=new P,u=new P;if(e)for(let p=0,f=e.count;p<f;p+=3){const g=e.getX(p+0),y=e.getX(p+1),m=e.getX(p+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,y),o.fromBufferAttribute(t,m),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),a.fromBufferAttribute(i,g),l.fromBufferAttribute(i,y),c.fromBufferAttribute(i,m),a.add(h),l.add(h),c.add(h),i.setXYZ(g,a.x,a.y,a.z),i.setXYZ(y,l.x,l.y,l.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let p=0,f=t.count;p<f;p+=3)s.fromBufferAttribute(t,p+0),r.fromBufferAttribute(t,p+1),o.fromBufferAttribute(t,p+2),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),i.setXYZ(p+0,h.x,h.y,h.z),i.setXYZ(p+1,h.x,h.y,h.z),i.setXYZ(p+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,i=e.count;t<i;t++)Rt.fromBufferAttribute(e,t),Rt.normalize(),e.setXYZ(t,Rt.x,Rt.y,Rt.z)}toNonIndexed(){function e(a,l){const c=a.array,h=a.itemSize,u=a.normalized,p=new c.constructor(l.length*h);let f=0,g=0;for(let y=0,m=l.length;y<m;y++){a.isInterleavedBufferAttribute?f=l[y]*a.data.stride+a.offset:f=l[y]*h;for(let d=0;d<h;d++)p[g++]=c[f++]}return new Ct(p,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new _t,i=this.index.array,s=this.attributes;for(const a in s){const l=s[a],c=e(l,i);t.setAttribute(a,c)}const r=this.morphAttributes;for(const a in r){const l=[],c=r[a];for(let h=0,u=c.length;h<u;h++){const p=c[h],f=e(p,i);l.push(f)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const i=this.attributes;for(const l in i){const c=i[l];e.data.attributes[l]=c.toJSON(e.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,p=c.length;u<p;u++){const f=c[u];h.push(f.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const i=e.index;i!==null&&this.setIndex(i.clone(t));const s=e.attributes;for(const c in s){const h=s[c];this.setAttribute(c,h.clone(t))}const r=e.morphAttributes;for(const c in r){const h=[],u=r[c];for(let p=0,f=u.length;p<f;p++)h.push(u[p].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let c=0,h=o.length;c<h;c++){const u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const ka=new He,Vn=new fs,As=new Mn,Ua=new P,Rs=new P,Cs=new P,Ps=new P,Kr=new P,Is=new P,Fa=new P,Ls=new P;class ut extends vt{constructor(e=new _t,t=new qo){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){const i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,o=i.morphTargetsRelative;t.fromBufferAttribute(s,e);const a=this.morphTargetInfluences;if(r&&a){Is.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=a[l],u=r[l];h!==0&&(Kr.fromBufferAttribute(u,e),o?Is.addScaledVector(Kr,h):Is.addScaledVector(Kr.sub(t),h))}t.add(Is)}return t}raycast(e,t){const i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),As.copy(i.boundingSphere),As.applyMatrix4(r),Vn.copy(e.ray).recast(e.near),!(As.containsPoint(Vn.origin)===!1&&(Vn.intersectSphere(As,Ua)===null||Vn.origin.distanceToSquared(Ua)>(e.far-e.near)**2))&&(ka.copy(r).invert(),Vn.copy(e.ray).applyMatrix4(ka),!(i.boundingBox!==null&&Vn.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(e,t,Vn)))}_computeIntersections(e,t,i){let s;const r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,p=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,y=p.length;g<y;g++){const m=p[g],d=o[m.materialIndex],v=Math.max(m.start,f.start),b=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let _=v,E=b;_<E;_+=3){const w=a.getX(_),R=a.getX(_+1),I=a.getX(_+2);s=Ds(this,d,e,i,c,h,u,w,R,I),s&&(s.faceIndex=Math.floor(_/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,f.start),y=Math.min(a.count,f.start+f.count);for(let m=g,d=y;m<d;m+=3){const v=a.getX(m),b=a.getX(m+1),_=a.getX(m+2);s=Ds(this,o,e,i,c,h,u,v,b,_),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,y=p.length;g<y;g++){const m=p[g],d=o[m.materialIndex],v=Math.max(m.start,f.start),b=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let _=v,E=b;_<E;_+=3){const w=_,R=_+1,I=_+2;s=Ds(this,d,e,i,c,h,u,w,R,I),s&&(s.faceIndex=Math.floor(_/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{const g=Math.max(0,f.start),y=Math.min(l.count,f.start+f.count);for(let m=g,d=y;m<d;m+=3){const v=m,b=m+1,_=m+2;s=Ds(this,o,e,i,c,h,u,v,b,_),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}}function yu(n,e,t,i,s,r,o,a){let l;if(e.side===1?l=i.intersectTriangle(o,r,s,!0,a):l=i.intersectTriangle(s,r,o,e.side===0,a),l===null)return null;Ls.copy(a),Ls.applyMatrix4(n.matrixWorld);const c=t.ray.origin.distanceTo(Ls);return c<t.near||c>t.far?null:{distance:c,point:Ls.clone(),object:n}}function Ds(n,e,t,i,s,r,o,a,l,c){n.getVertexPosition(a,Rs),n.getVertexPosition(l,Cs),n.getVertexPosition(c,Ps);const h=yu(n,e,t,i,Rs,Cs,Ps,Fa);if(h){const u=new P;jt.getBarycoord(Fa,Rs,Cs,Ps,u),s&&(h.uv=jt.getInterpolatedAttribute(s,a,l,c,u,new he)),r&&(h.uv1=jt.getInterpolatedAttribute(r,a,l,c,u,new he)),o&&(h.normal=jt.getInterpolatedAttribute(o,a,l,c,u,new P),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));const p={a,b:l,c,normal:new P,materialIndex:0};jt.getNormal(Rs,Cs,Ps,p.normal),h.face=p,h.barycoord=u}return h}class wt extends _t{constructor(e=1,t=1,i=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:i,widthSegments:s,heightSegments:r,depthSegments:o};const a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);const l=[],c=[],h=[],u=[];let p=0,f=0;g("z","y","x",-1,-1,i,t,e,o,r,0),g("z","y","x",1,-1,i,t,-e,o,r,1),g("x","z","y",1,1,e,i,t,s,o,2),g("x","z","y",1,-1,e,i,-t,s,o,3),g("x","y","z",1,-1,e,t,i,s,r,4),g("x","y","z",-1,-1,e,t,-i,s,r,5),this.setIndex(l),this.setAttribute("position",new Ke(c,3)),this.setAttribute("normal",new Ke(h,3)),this.setAttribute("uv",new Ke(u,2));function g(y,m,d,v,b,_,E,w,R,I,S){const x=_/R,A=E/I,O=_/2,U=E/2,V=w/2,F=R+1,H=I+1;let Q=0,Y=0;const M=new P;for(let N=0;N<H;N++){const Z=N*A-U;for(let ce=0;ce<F;ce++){const Ce=ce*x-O;M[y]=Ce*v,M[m]=Z*b,M[d]=V,c.push(M.x,M.y,M.z),M[y]=0,M[m]=0,M[d]=w>0?1:-1,h.push(M.x,M.y,M.z),u.push(ce/R),u.push(1-N/I),Q+=1}}for(let N=0;N<I;N++)for(let Z=0;Z<R;Z++){const ce=p+Z+F*N,Ce=p+Z+F*(N+1),J=p+(Z+1)+F*(N+1),ue=p+(Z+1)+F*N;l.push(ce,Ce,ue),l.push(Ce,J,ue),Y+=6}a.addGroup(f,Y,S),f+=Y,p+=Q}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new wt(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Ii(n){const e={};for(const t in n){e[t]={};for(const i in n[t]){const s=n[t][i];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][i]=null):e[t][i]=s.clone():Array.isArray(s)?e[t][i]=s.slice():e[t][i]=s}}return e}function Ot(n){const e={};for(let t=0;t<n.length;t++){const i=Ii(n[t]);for(const s in i)e[s]=i[s]}return e}function vu(n){const e=[];for(let t=0;t<n.length;t++)e.push(n[t].clone());return e}function yc(n){const e=n.getRenderTarget();return e===null?n.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Qe.workingColorSpace}const bu={clone:Ii,merge:Ot};var Mu=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,xu=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Un extends xn{static get type(){return"ShaderMaterial"}constructor(e){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Mu,this.fragmentShader=xu,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ii(e.uniforms),this.uniformsGroups=vu(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const i={};for(const s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(t.extensions=i),t}}class vc extends vt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new He,this.projectionMatrix=new He,this.projectionMatrixInverse=new He,this.coordinateSystem=2e3}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Pn=new P,Oa=new he,Ba=new he;class Wt extends vc{constructor(e=50,t=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Pi*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(rs*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Pi*2*Math.atan(Math.tan(rs*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,i){Pn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Pn.x,Pn.y).multiplyScalar(-e/Pn.z),Pn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(Pn.x,Pn.y).multiplyScalar(-e/Pn.z)}getViewSize(e,t){return this.getViewBounds(e,Oa,Ba),t.subVectors(Ba,Oa)}setViewOffset(e,t,i,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(rs*.5*this.fov)/this.zoom,i=2*t,s=this.aspect*i,r=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*i/c,s*=o.width/l,i*=o.height/c}const a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-i,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const fi=-90,pi=1;class Su extends vt{constructor(e,t,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new Wt(fi,pi,e,t);s.layers=this.layers,this.add(s);const r=new Wt(fi,pi,e,t);r.layers=this.layers,this.add(r);const o=new Wt(fi,pi,e,t);o.layers=this.layers,this.add(o);const a=new Wt(fi,pi,e,t);a.layers=this.layers,this.add(a);const l=new Wt(fi,pi,e,t);l.layers=this.layers,this.add(l);const c=new Wt(fi,pi,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[i,s,r,o,a,l]=t;for(const c of t)this.remove(c);if(e===2e3)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===2001)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,l,c,h]=this.children,u=e.getRenderTarget(),p=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const y=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,e.setRenderTarget(i,0,s),e.render(t,r),e.setRenderTarget(i,1,s),e.render(t,o),e.setRenderTarget(i,2,s),e.render(t,a),e.setRenderTarget(i,3,s),e.render(t,l),e.setRenderTarget(i,4,s),e.render(t,c),i.texture.generateMipmaps=y,e.setRenderTarget(i,5,s),e.render(t,h),e.setRenderTarget(u,p,f),e.xr.enabled=g,i.texture.needsPMREMUpdate=!0}}class bc extends Pt{constructor(e,t,i,s,r,o,a,l,c,h){e=e!==void 0?e:[],t=t!==void 0?t:301,super(e,t,i,s,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class wu extends Qn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const i={width:e,height:e,depth:1},s=[i,i,i,i,i,i];this.texture=new bc(s,t.mapping,t.wrapS,t.wrapT,t.magFilter,t.minFilter,t.format,t.type,t.anisotropy,t.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=t.generateMipmaps!==void 0?t.generateMipmaps:!1,this.texture.minFilter=t.minFilter!==void 0?t.minFilter:1006}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new wt(5,5,5),r=new Un({name:"CubemapFromEquirect",uniforms:Ii(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:1,blending:0});r.uniforms.tEquirect.value=t;const o=new ut(s,r),a=t.minFilter;return t.minFilter===1008&&(t.minFilter=1006),new Su(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t,i,s){const r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,i,s);e.setRenderTarget(r)}}const Jr=new P,Tu=new P,Eu=new qe;class qn{constructor(e=new P(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,i,s){return this.normal.set(e,t,i),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,i){const s=Jr.subVectors(i,t).cross(Tu.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const i=e.delta(Jr),s=this.normal.dot(i);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(i,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),i=this.distanceToPoint(e.end);return t<0&&i>0||i<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const i=t||Eu.getNormalMatrix(e),s=this.coplanarPoint(Jr).applyMatrix4(e),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Gn=new Mn,Ns=new P;class Ko{constructor(e=new qn,t=new qn,i=new qn,s=new qn,r=new qn,o=new qn){this.planes=[e,t,i,s,r,o]}set(e,t,i,s,r,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(i),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){const t=this.planes;for(let i=0;i<6;i++)t[i].copy(e.planes[i]);return this}setFromProjectionMatrix(e,t=2e3){const i=this.planes,s=e.elements,r=s[0],o=s[1],a=s[2],l=s[3],c=s[4],h=s[5],u=s[6],p=s[7],f=s[8],g=s[9],y=s[10],m=s[11],d=s[12],v=s[13],b=s[14],_=s[15];if(i[0].setComponents(l-r,p-c,m-f,_-d).normalize(),i[1].setComponents(l+r,p+c,m+f,_+d).normalize(),i[2].setComponents(l+o,p+h,m+g,_+v).normalize(),i[3].setComponents(l-o,p-h,m-g,_-v).normalize(),i[4].setComponents(l-a,p-u,m-y,_-b).normalize(),t===2e3)i[5].setComponents(l+a,p+u,m+y,_+b).normalize();else if(t===2001)i[5].setComponents(a,u,y,b).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Gn.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Gn.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Gn)}intersectsSprite(e){return Gn.center.set(0,0,0),Gn.radius=.7071067811865476,Gn.applyMatrix4(e.matrixWorld),this.intersectsSphere(Gn)}intersectsSphere(e){const t=this.planes,i=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let i=0;i<6;i++){const s=t[i];if(Ns.x=s.normal.x>0?e.max.x:e.min.x,Ns.y=s.normal.y>0?e.max.y:e.min.y,Ns.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Ns)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let i=0;i<6;i++)if(t[i].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Mc(){let n=null,e=!1,t=null,i=null;function s(r,o){t(r,o),i=n.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(i=n.requestAnimationFrame(s),e=!0)},stop:function(){n.cancelAnimationFrame(i),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){n=r}}}function Au(n){const e=new WeakMap;function t(a,l){const c=a.array,h=a.usage,u=c.byteLength,p=n.createBuffer();n.bindBuffer(l,p),n.bufferData(l,c,h),a.onUploadCallback();let f;if(c instanceof Float32Array)f=n.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=n.HALF_FLOAT:f=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=n.SHORT;else if(c instanceof Uint32Array)f=n.UNSIGNED_INT;else if(c instanceof Int32Array)f=n.INT;else if(c instanceof Int8Array)f=n.BYTE;else if(c instanceof Uint8Array)f=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:p,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function i(a,l,c){const h=l.array,u=l.updateRanges;if(n.bindBuffer(c,a),u.length===0)n.bufferSubData(c,0,h);else{u.sort((f,g)=>f.start-g.start);let p=0;for(let f=1;f<u.length;f++){const g=u[p],y=u[f];y.start<=g.start+g.count+1?g.count=Math.max(g.count,y.start+y.count-g.start):(++p,u[p]=y)}u.length=p+1;for(let f=0,g=u.length;f<g;f++){const y=u[f];n.bufferSubData(c,y.start*h.BYTES_PER_ELEMENT,h,y.start,y.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=e.get(a);l&&(n.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const h=e.get(a);(!h||h.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}class ps extends _t{constructor(e=1,t=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:i,heightSegments:s};const r=e/2,o=t/2,a=Math.floor(i),l=Math.floor(s),c=a+1,h=l+1,u=e/a,p=t/l,f=[],g=[],y=[],m=[];for(let d=0;d<h;d++){const v=d*p-o;for(let b=0;b<c;b++){const _=b*u-r;g.push(_,-v,0),y.push(0,0,1),m.push(b/a),m.push(1-d/l)}}for(let d=0;d<l;d++)for(let v=0;v<a;v++){const b=v+c*d,_=v+c*(d+1),E=v+1+c*(d+1),w=v+1+c*d;f.push(b,_,w),f.push(_,E,w)}this.setIndex(f),this.setAttribute("position",new Ke(g,3)),this.setAttribute("normal",new Ke(y,3)),this.setAttribute("uv",new Ke(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ps(e.width,e.height,e.widthSegments,e.heightSegments)}}var Ru=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Cu=`#ifdef USE_ALPHAHASH
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
#endif`,Pu=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Iu=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Lu=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Du=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Nu=`#ifdef USE_AOMAP
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
#endif`,ku=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Uu=`#ifdef USE_BATCHING
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
#endif`,Fu=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Ou=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Bu=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,zu=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Hu=`#ifdef USE_IRIDESCENCE
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
#endif`,Vu=`#ifdef USE_BUMPMAP
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
#endif`,Gu=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Wu=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Xu=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Yu=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,qu=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,ju=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Ku=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Ju=`#if defined( USE_COLOR_ALPHA )
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
#endif`,Zu=`#define PI 3.141592653589793
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
} // validated`,$u=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Qu=`vec3 transformedNormal = objectNormal;
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
#endif`,ed=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,td=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,nd=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,id=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,sd="gl_FragColor = linearToOutputTexel( gl_FragColor );",rd=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,od=`#ifdef USE_ENVMAP
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
#endif`,ad=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,ld=`#ifdef USE_ENVMAP
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
#endif`,cd=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,hd=`#ifdef USE_ENVMAP
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
#endif`,ud=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,dd=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,fd=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,pd=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,md=`#ifdef USE_GRADIENTMAP
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
}`,gd=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,_d=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,yd=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,vd=`uniform bool receiveShadow;
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
#endif`,bd=`#ifdef USE_ENVMAP
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
#endif`,Md=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,xd=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Sd=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,wd=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Td=`PhysicalMaterial material;
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
#endif`,Ed=`struct PhysicalMaterial {
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
}`,Ad=`
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
#endif`,Rd=`#if defined( RE_IndirectDiffuse )
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
#endif`,Cd=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Pd=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Id=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ld=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Dd=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Nd=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,kd=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Ud=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Fd=`#if defined( USE_POINTS_UV )
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
#endif`,Od=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Bd=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,zd=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Hd=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Vd=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Gd=`#ifdef USE_MORPHTARGETS
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
#endif`,Wd=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Xd=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Yd=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,qd=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,jd=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Kd=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Jd=`#ifdef USE_NORMALMAP
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
#endif`,Zd=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,$d=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Qd=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,ef=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,tf=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,nf=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,sf=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,rf=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,of=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,af=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,lf=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,cf=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,hf=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,uf=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,df=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,ff=`float getShadowMask() {
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
}`,pf=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,mf=`#ifdef USE_SKINNING
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
#endif`,gf=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,_f=`#ifdef USE_SKINNING
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
#endif`,yf=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,vf=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,bf=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Mf=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,xf=`#ifdef USE_TRANSMISSION
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
#endif`,Sf=`#ifdef USE_TRANSMISSION
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
#endif`,wf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Tf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Ef=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Af=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Rf=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Cf=`uniform sampler2D t2D;
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
}`,Pf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,If=`#ifdef ENVMAP_TYPE_CUBE
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
}`,Lf=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Df=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Nf=`#include <common>
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
}`,kf=`#if DEPTH_PACKING == 3200
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
}`,Uf=`#define DISTANCE
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
}`,Ff=`#define DISTANCE
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
}`,Of=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Bf=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,zf=`uniform float scale;
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
}`,Hf=`uniform vec3 diffuse;
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
}`,Vf=`#include <common>
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
}`,Gf=`uniform vec3 diffuse;
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
}`,Wf=`#define LAMBERT
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
}`,Xf=`#define LAMBERT
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
}`,Yf=`#define MATCAP
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
}`,qf=`#define MATCAP
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
}`,jf=`#define NORMAL
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
}`,Kf=`#define NORMAL
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
}`,Jf=`#define PHONG
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
}`,Zf=`#define PHONG
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
}`,$f=`#define STANDARD
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
}`,Qf=`#define STANDARD
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
}`,ep=`#define TOON
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
}`,tp=`#define TOON
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
}`,np=`uniform float size;
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
}`,ip=`uniform vec3 diffuse;
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
}`,sp=`#include <common>
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
}`,rp=`uniform vec3 color;
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
}`,op=`uniform float rotation;
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
}`,ap=`uniform vec3 diffuse;
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
}`,Ge={alphahash_fragment:Ru,alphahash_pars_fragment:Cu,alphamap_fragment:Pu,alphamap_pars_fragment:Iu,alphatest_fragment:Lu,alphatest_pars_fragment:Du,aomap_fragment:Nu,aomap_pars_fragment:ku,batching_pars_vertex:Uu,batching_vertex:Fu,begin_vertex:Ou,beginnormal_vertex:Bu,bsdfs:zu,iridescence_fragment:Hu,bumpmap_pars_fragment:Vu,clipping_planes_fragment:Gu,clipping_planes_pars_fragment:Wu,clipping_planes_pars_vertex:Xu,clipping_planes_vertex:Yu,color_fragment:qu,color_pars_fragment:ju,color_pars_vertex:Ku,color_vertex:Ju,common:Zu,cube_uv_reflection_fragment:$u,defaultnormal_vertex:Qu,displacementmap_pars_vertex:ed,displacementmap_vertex:td,emissivemap_fragment:nd,emissivemap_pars_fragment:id,colorspace_fragment:sd,colorspace_pars_fragment:rd,envmap_fragment:od,envmap_common_pars_fragment:ad,envmap_pars_fragment:ld,envmap_pars_vertex:cd,envmap_physical_pars_fragment:bd,envmap_vertex:hd,fog_vertex:ud,fog_pars_vertex:dd,fog_fragment:fd,fog_pars_fragment:pd,gradientmap_pars_fragment:md,lightmap_pars_fragment:gd,lights_lambert_fragment:_d,lights_lambert_pars_fragment:yd,lights_pars_begin:vd,lights_toon_fragment:Md,lights_toon_pars_fragment:xd,lights_phong_fragment:Sd,lights_phong_pars_fragment:wd,lights_physical_fragment:Td,lights_physical_pars_fragment:Ed,lights_fragment_begin:Ad,lights_fragment_maps:Rd,lights_fragment_end:Cd,logdepthbuf_fragment:Pd,logdepthbuf_pars_fragment:Id,logdepthbuf_pars_vertex:Ld,logdepthbuf_vertex:Dd,map_fragment:Nd,map_pars_fragment:kd,map_particle_fragment:Ud,map_particle_pars_fragment:Fd,metalnessmap_fragment:Od,metalnessmap_pars_fragment:Bd,morphinstance_vertex:zd,morphcolor_vertex:Hd,morphnormal_vertex:Vd,morphtarget_pars_vertex:Gd,morphtarget_vertex:Wd,normal_fragment_begin:Xd,normal_fragment_maps:Yd,normal_pars_fragment:qd,normal_pars_vertex:jd,normal_vertex:Kd,normalmap_pars_fragment:Jd,clearcoat_normal_fragment_begin:Zd,clearcoat_normal_fragment_maps:$d,clearcoat_pars_fragment:Qd,iridescence_pars_fragment:ef,opaque_fragment:tf,packing:nf,premultiplied_alpha_fragment:sf,project_vertex:rf,dithering_fragment:of,dithering_pars_fragment:af,roughnessmap_fragment:lf,roughnessmap_pars_fragment:cf,shadowmap_pars_fragment:hf,shadowmap_pars_vertex:uf,shadowmap_vertex:df,shadowmask_pars_fragment:ff,skinbase_vertex:pf,skinning_pars_vertex:mf,skinning_vertex:gf,skinnormal_vertex:_f,specularmap_fragment:yf,specularmap_pars_fragment:vf,tonemapping_fragment:bf,tonemapping_pars_fragment:Mf,transmission_fragment:xf,transmission_pars_fragment:Sf,uv_pars_fragment:wf,uv_pars_vertex:Tf,uv_vertex:Ef,worldpos_vertex:Af,background_vert:Rf,background_frag:Cf,backgroundCube_vert:Pf,backgroundCube_frag:If,cube_vert:Lf,cube_frag:Df,depth_vert:Nf,depth_frag:kf,distanceRGBA_vert:Uf,distanceRGBA_frag:Ff,equirect_vert:Of,equirect_frag:Bf,linedashed_vert:zf,linedashed_frag:Hf,meshbasic_vert:Vf,meshbasic_frag:Gf,meshlambert_vert:Wf,meshlambert_frag:Xf,meshmatcap_vert:Yf,meshmatcap_frag:qf,meshnormal_vert:jf,meshnormal_frag:Kf,meshphong_vert:Jf,meshphong_frag:Zf,meshphysical_vert:$f,meshphysical_frag:Qf,meshtoon_vert:ep,meshtoon_frag:tp,points_vert:np,points_frag:ip,shadow_vert:sp,shadow_frag:rp,sprite_vert:op,sprite_frag:ap},_e={common:{diffuse:{value:new Ue(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new qe},alphaMap:{value:null},alphaMapTransform:{value:new qe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new qe}},envmap:{envMap:{value:null},envMapRotation:{value:new qe},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new qe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new qe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new qe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new qe},normalScale:{value:new he(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new qe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new qe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new qe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new qe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ue(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ue(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new qe},alphaTest:{value:0},uvTransform:{value:new qe}},sprite:{diffuse:{value:new Ue(16777215)},opacity:{value:1},center:{value:new he(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new qe},alphaMap:{value:null},alphaMapTransform:{value:new qe},alphaTest:{value:0}}},ln={basic:{uniforms:Ot([_e.common,_e.specularmap,_e.envmap,_e.aomap,_e.lightmap,_e.fog]),vertexShader:Ge.meshbasic_vert,fragmentShader:Ge.meshbasic_frag},lambert:{uniforms:Ot([_e.common,_e.specularmap,_e.envmap,_e.aomap,_e.lightmap,_e.emissivemap,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.fog,_e.lights,{emissive:{value:new Ue(0)}}]),vertexShader:Ge.meshlambert_vert,fragmentShader:Ge.meshlambert_frag},phong:{uniforms:Ot([_e.common,_e.specularmap,_e.envmap,_e.aomap,_e.lightmap,_e.emissivemap,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.fog,_e.lights,{emissive:{value:new Ue(0)},specular:{value:new Ue(1118481)},shininess:{value:30}}]),vertexShader:Ge.meshphong_vert,fragmentShader:Ge.meshphong_frag},standard:{uniforms:Ot([_e.common,_e.envmap,_e.aomap,_e.lightmap,_e.emissivemap,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.roughnessmap,_e.metalnessmap,_e.fog,_e.lights,{emissive:{value:new Ue(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ge.meshphysical_vert,fragmentShader:Ge.meshphysical_frag},toon:{uniforms:Ot([_e.common,_e.aomap,_e.lightmap,_e.emissivemap,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.gradientmap,_e.fog,_e.lights,{emissive:{value:new Ue(0)}}]),vertexShader:Ge.meshtoon_vert,fragmentShader:Ge.meshtoon_frag},matcap:{uniforms:Ot([_e.common,_e.bumpmap,_e.normalmap,_e.displacementmap,_e.fog,{matcap:{value:null}}]),vertexShader:Ge.meshmatcap_vert,fragmentShader:Ge.meshmatcap_frag},points:{uniforms:Ot([_e.points,_e.fog]),vertexShader:Ge.points_vert,fragmentShader:Ge.points_frag},dashed:{uniforms:Ot([_e.common,_e.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ge.linedashed_vert,fragmentShader:Ge.linedashed_frag},depth:{uniforms:Ot([_e.common,_e.displacementmap]),vertexShader:Ge.depth_vert,fragmentShader:Ge.depth_frag},normal:{uniforms:Ot([_e.common,_e.bumpmap,_e.normalmap,_e.displacementmap,{opacity:{value:1}}]),vertexShader:Ge.meshnormal_vert,fragmentShader:Ge.meshnormal_frag},sprite:{uniforms:Ot([_e.sprite,_e.fog]),vertexShader:Ge.sprite_vert,fragmentShader:Ge.sprite_frag},background:{uniforms:{uvTransform:{value:new qe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ge.background_vert,fragmentShader:Ge.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new qe}},vertexShader:Ge.backgroundCube_vert,fragmentShader:Ge.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ge.cube_vert,fragmentShader:Ge.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ge.equirect_vert,fragmentShader:Ge.equirect_frag},distanceRGBA:{uniforms:Ot([_e.common,_e.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ge.distanceRGBA_vert,fragmentShader:Ge.distanceRGBA_frag},shadow:{uniforms:Ot([_e.lights,_e.fog,{color:{value:new Ue(0)},opacity:{value:1}}]),vertexShader:Ge.shadow_vert,fragmentShader:Ge.shadow_frag}};ln.physical={uniforms:Ot([ln.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new qe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new qe},clearcoatNormalScale:{value:new he(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new qe},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new qe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new qe},sheen:{value:0},sheenColor:{value:new Ue(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new qe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new qe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new qe},transmissionSamplerSize:{value:new he},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new qe},attenuationDistance:{value:0},attenuationColor:{value:new Ue(0)},specularColor:{value:new Ue(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new qe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new qe},anisotropyVector:{value:new he},anisotropyMap:{value:null},anisotropyMapTransform:{value:new qe}}]),vertexShader:Ge.meshphysical_vert,fragmentShader:Ge.meshphysical_frag};const ks={r:0,b:0,g:0},Wn=new rn,lp=new He;function cp(n,e,t,i,s,r,o){const a=new Ue(0);let l=r===!0?0:1,c,h,u=null,p=0,f=null;function g(v){let b=v.isScene===!0?v.background:null;return b&&b.isTexture&&(b=(v.backgroundBlurriness>0?t:e).get(b)),b}function y(v){let b=!1;const _=g(v);_===null?d(a,l):_&&_.isColor&&(d(_,1),b=!0);const E=n.xr.getEnvironmentBlendMode();E==="additive"?i.buffers.color.setClear(0,0,0,1,o):E==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,o),(n.autoClear||b)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function m(v,b){const _=g(b);_&&(_.isCubeTexture||_.mapping===306)?(h===void 0&&(h=new ut(new wt(1,1,1),new Un({name:"BackgroundCubeMaterial",uniforms:Ii(ln.backgroundCube.uniforms),vertexShader:ln.backgroundCube.vertexShader,fragmentShader:ln.backgroundCube.fragmentShader,side:1,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(E,w,R){this.matrixWorld.copyPosition(R.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),Wn.copy(b.backgroundRotation),Wn.x*=-1,Wn.y*=-1,Wn.z*=-1,_.isCubeTexture&&_.isRenderTargetTexture===!1&&(Wn.y*=-1,Wn.z*=-1),h.material.uniforms.envMap.value=_,h.material.uniforms.flipEnvMap.value=_.isCubeTexture&&_.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=b.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(lp.makeRotationFromEuler(Wn)),h.material.toneMapped=Qe.getTransfer(_.colorSpace)!==ht,(u!==_||p!==_.version||f!==n.toneMapping)&&(h.material.needsUpdate=!0,u=_,p=_.version,f=n.toneMapping),h.layers.enableAll(),v.unshift(h,h.geometry,h.material,0,0,null)):_&&_.isTexture&&(c===void 0&&(c=new ut(new ps(2,2),new Un({name:"BackgroundMaterial",uniforms:Ii(ln.background.uniforms),vertexShader:ln.background.vertexShader,fragmentShader:ln.background.fragmentShader,side:0,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=_,c.material.uniforms.backgroundIntensity.value=b.backgroundIntensity,c.material.toneMapped=Qe.getTransfer(_.colorSpace)!==ht,_.matrixAutoUpdate===!0&&_.updateMatrix(),c.material.uniforms.uvTransform.value.copy(_.matrix),(u!==_||p!==_.version||f!==n.toneMapping)&&(c.material.needsUpdate=!0,u=_,p=_.version,f=n.toneMapping),c.layers.enableAll(),v.unshift(c,c.geometry,c.material,0,0,null))}function d(v,b){v.getRGB(ks,yc(n)),i.buffers.color.setClear(ks.r,ks.g,ks.b,b,o)}return{getClearColor:function(){return a},setClearColor:function(v,b=1){a.set(v),l=b,d(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(v){l=v,d(a,l)},render:y,addToRenderList:m}}function hp(n,e){const t=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=p(null);let r=s,o=!1;function a(x,A,O,U,V){let F=!1;const H=u(U,O,A);r!==H&&(r=H,c(r.object)),F=f(x,U,O,V),F&&g(x,U,O,V),V!==null&&e.update(V,n.ELEMENT_ARRAY_BUFFER),(F||o)&&(o=!1,_(x,A,O,U),V!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,e.get(V).buffer))}function l(){return n.createVertexArray()}function c(x){return n.bindVertexArray(x)}function h(x){return n.deleteVertexArray(x)}function u(x,A,O){const U=O.wireframe===!0;let V=i[x.id];V===void 0&&(V={},i[x.id]=V);let F=V[A.id];F===void 0&&(F={},V[A.id]=F);let H=F[U];return H===void 0&&(H=p(l()),F[U]=H),H}function p(x){const A=[],O=[],U=[];for(let V=0;V<t;V++)A[V]=0,O[V]=0,U[V]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:A,enabledAttributes:O,attributeDivisors:U,object:x,attributes:{},index:null}}function f(x,A,O,U){const V=r.attributes,F=A.attributes;let H=0;const Q=O.getAttributes();for(const Y in Q)if(Q[Y].location>=0){const N=V[Y];let Z=F[Y];if(Z===void 0&&(Y==="instanceMatrix"&&x.instanceMatrix&&(Z=x.instanceMatrix),Y==="instanceColor"&&x.instanceColor&&(Z=x.instanceColor)),N===void 0||N.attribute!==Z||Z&&N.data!==Z.data)return!0;H++}return r.attributesNum!==H||r.index!==U}function g(x,A,O,U){const V={},F=A.attributes;let H=0;const Q=O.getAttributes();for(const Y in Q)if(Q[Y].location>=0){let N=F[Y];N===void 0&&(Y==="instanceMatrix"&&x.instanceMatrix&&(N=x.instanceMatrix),Y==="instanceColor"&&x.instanceColor&&(N=x.instanceColor));const Z={};Z.attribute=N,N&&N.data&&(Z.data=N.data),V[Y]=Z,H++}r.attributes=V,r.attributesNum=H,r.index=U}function y(){const x=r.newAttributes;for(let A=0,O=x.length;A<O;A++)x[A]=0}function m(x){d(x,0)}function d(x,A){const O=r.newAttributes,U=r.enabledAttributes,V=r.attributeDivisors;O[x]=1,U[x]===0&&(n.enableVertexAttribArray(x),U[x]=1),V[x]!==A&&(n.vertexAttribDivisor(x,A),V[x]=A)}function v(){const x=r.newAttributes,A=r.enabledAttributes;for(let O=0,U=A.length;O<U;O++)A[O]!==x[O]&&(n.disableVertexAttribArray(O),A[O]=0)}function b(x,A,O,U,V,F,H){H===!0?n.vertexAttribIPointer(x,A,O,V,F):n.vertexAttribPointer(x,A,O,U,V,F)}function _(x,A,O,U){y();const V=U.attributes,F=O.getAttributes(),H=A.defaultAttributeValues;for(const Q in F){const Y=F[Q];if(Y.location>=0){let M=V[Q];if(M===void 0&&(Q==="instanceMatrix"&&x.instanceMatrix&&(M=x.instanceMatrix),Q==="instanceColor"&&x.instanceColor&&(M=x.instanceColor)),M!==void 0){const N=M.normalized,Z=M.itemSize,ce=e.get(M);if(ce===void 0)continue;const Ce=ce.buffer,J=ce.type,ue=ce.bytesPerElement,oe=J===n.INT||J===n.UNSIGNED_INT||M.gpuType===1013;if(M.isInterleavedBufferAttribute){const X=M.data,ne=X.stride,ge=M.offset;if(X.isInstancedInterleavedBuffer){for(let ee=0;ee<Y.locationSize;ee++)d(Y.location+ee,X.meshPerAttribute);x.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=X.meshPerAttribute*X.count)}else for(let ee=0;ee<Y.locationSize;ee++)m(Y.location+ee);n.bindBuffer(n.ARRAY_BUFFER,Ce);for(let ee=0;ee<Y.locationSize;ee++)b(Y.location+ee,Z/Y.locationSize,J,N,ne*ue,(ge+Z/Y.locationSize*ee)*ue,oe)}else{if(M.isInstancedBufferAttribute){for(let X=0;X<Y.locationSize;X++)d(Y.location+X,M.meshPerAttribute);x.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=M.meshPerAttribute*M.count)}else for(let X=0;X<Y.locationSize;X++)m(Y.location+X);n.bindBuffer(n.ARRAY_BUFFER,Ce);for(let X=0;X<Y.locationSize;X++)b(Y.location+X,Z/Y.locationSize,J,N,Z*ue,Z/Y.locationSize*X*ue,oe)}}else if(H!==void 0){const N=H[Q];if(N!==void 0)switch(N.length){case 2:n.vertexAttrib2fv(Y.location,N);break;case 3:n.vertexAttrib3fv(Y.location,N);break;case 4:n.vertexAttrib4fv(Y.location,N);break;default:n.vertexAttrib1fv(Y.location,N)}}}}v()}function E(){I();for(const x in i){const A=i[x];for(const O in A){const U=A[O];for(const V in U)h(U[V].object),delete U[V];delete A[O]}delete i[x]}}function w(x){if(i[x.id]===void 0)return;const A=i[x.id];for(const O in A){const U=A[O];for(const V in U)h(U[V].object),delete U[V];delete A[O]}delete i[x.id]}function R(x){for(const A in i){const O=i[A];if(O[x.id]===void 0)continue;const U=O[x.id];for(const V in U)h(U[V].object),delete U[V];delete O[x.id]}}function I(){S(),o=!0,r!==s&&(r=s,c(r.object))}function S(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:I,resetDefaultState:S,dispose:E,releaseStatesOfGeometry:w,releaseStatesOfProgram:R,initAttributes:y,enableAttribute:m,disableUnusedAttributes:v}}function up(n,e,t){let i;function s(c){i=c}function r(c,h){n.drawArrays(i,c,h),t.update(h,i,1)}function o(c,h,u){u!==0&&(n.drawArraysInstanced(i,c,h,u),t.update(h,i,u))}function a(c,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,h,0,u);let f=0;for(let g=0;g<u;g++)f+=h[g];t.update(f,i,1)}function l(c,h,u,p){if(u===0)return;const f=e.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<c.length;g++)o(c[g],h[g],p[g]);else{f.multiDrawArraysInstancedWEBGL(i,c,0,h,0,p,0,u);let g=0;for(let y=0;y<u;y++)g+=h[y]*p[y];t.update(g,i,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function dp(n,e,t,i){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const R=e.get("EXT_texture_filter_anisotropic");s=n.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(R){return!(R!==1023&&i.convert(R)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(R){const I=R===1016&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(R!==1009&&i.convert(R)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&R!==1015&&!I)}function l(R){if(R==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";R="mediump"}return R==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const u=t.logarithmicDepthBuffer===!0,p=t.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),f=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),g=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=n.getParameter(n.MAX_TEXTURE_SIZE),m=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),d=n.getParameter(n.MAX_VERTEX_ATTRIBS),v=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),b=n.getParameter(n.MAX_VARYING_VECTORS),_=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),E=g>0,w=n.getParameter(n.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:u,reverseDepthBuffer:p,maxTextures:f,maxVertexTextures:g,maxTextureSize:y,maxCubemapSize:m,maxAttributes:d,maxVertexUniforms:v,maxVaryings:b,maxFragmentUniforms:_,vertexTextures:E,maxSamples:w}}function fp(n){const e=this;let t=null,i=0,s=!1,r=!1;const o=new qn,a=new qe,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,p){const f=u.length!==0||p||i!==0||s;return s=p,i=u.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,p){t=h(u,p,0)},this.setState=function(u,p,f){const g=u.clippingPlanes,y=u.clipIntersection,m=u.clipShadows,d=n.get(u);if(!s||g===null||g.length===0||r&&!m)r?h(null):c();else{const v=r?0:i,b=v*4;let _=d.clippingState||null;l.value=_,_=h(g,p,b,f);for(let E=0;E!==b;++E)_[E]=t[E];d.clippingState=_,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=v}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=i>0),e.numPlanes=i,e.numIntersection=0}function h(u,p,f,g){const y=u!==null?u.length:0;let m=null;if(y!==0){if(m=l.value,g!==!0||m===null){const d=f+y*4,v=p.matrixWorldInverse;a.getNormalMatrix(v),(m===null||m.length<d)&&(m=new Float32Array(d));for(let b=0,_=f;b!==y;++b,_+=4)o.copy(u[b]).applyMatrix4(v,a),o.normal.toArray(m,_),m[_+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=y,e.numIntersection=0,m}}function pp(n){let e=new WeakMap;function t(o,a){return a===303?o.mapping=301:a===304&&(o.mapping=302),o}function i(o){if(o&&o.isTexture){const a=o.mapping;if(a===303||a===304)if(e.has(o)){const l=e.get(o).texture;return t(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new wu(l.height);return c.fromEquirectangularTexture(n,o),e.set(o,c),o.addEventListener("dispose",s),t(c.texture,o.mapping)}else return null}}return o}function s(o){const a=o.target;a.removeEventListener("dispose",s);const l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function r(){e=new WeakMap}return{get:i,dispose:r}}class xc extends vc{constructor(e=-1,t=1,i=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=i,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,i,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=i-e,o=i+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}const xi=4,za=[.125,.215,.35,.446,.526,.582],Kn=20,Zr=new xc,Ha=new Ue;let $r=null,Qr=0,eo=0,to=!1;const jn=(1+Math.sqrt(5))/2,mi=1/jn,Va=[new P(-jn,mi,0),new P(jn,mi,0),new P(-mi,0,jn),new P(mi,0,jn),new P(0,jn,-mi),new P(0,jn,mi),new P(-1,1,-1),new P(1,1,-1),new P(-1,1,1),new P(1,1,1)];class Ga{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,i=.1,s=100){$r=this._renderer.getRenderTarget(),Qr=this._renderer.getActiveCubeFace(),eo=this._renderer.getActiveMipmapLevel(),to=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(e,i,s,r),t>0&&this._blur(r,0,0,t),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Ya(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Xa(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget($r,Qr,eo),this._renderer.xr.enabled=to,e.scissorTest=!1,Us(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===301||e.mapping===302?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),$r=this._renderer.getRenderTarget(),Qr=this._renderer.getActiveCubeFace(),eo=this._renderer.getActiveMipmapLevel(),to=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=t||this._allocateTargets();return this._textureToCubeUV(e,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,i={magFilter:1006,minFilter:1006,generateMipmaps:!1,type:1016,format:1023,colorSpace:Ni,depthBuffer:!1},s=Wa(e,t,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Wa(e,t,i);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=mp(r)),this._blurMaterial=gp(r,e,t)}return s}_compileMaterial(e){const t=new ut(this._lodPlanes[0],e);this._renderer.compile(t,Zr)}_sceneToCubeUV(e,t,i,s){const a=new Wt(90,1,t,i),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,p=h.toneMapping;h.getClearColor(Ha),h.toneMapping=0,h.autoClear=!1;const f=new qo({name:"PMREM.Background",side:1,depthWrite:!1,depthTest:!1}),g=new ut(new wt,f);let y=!1;const m=e.background;m?m.isColor&&(f.color.copy(m),e.background=null,y=!0):(f.color.copy(Ha),y=!0);for(let d=0;d<6;d++){const v=d%3;v===0?(a.up.set(0,l[d],0),a.lookAt(c[d],0,0)):v===1?(a.up.set(0,0,l[d]),a.lookAt(0,c[d],0)):(a.up.set(0,l[d],0),a.lookAt(0,0,c[d]));const b=this._cubeSize;Us(s,v*b,d>2?b:0,b,b),h.setRenderTarget(s),y&&h.render(g,a),h.render(e,a)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=p,h.autoClear=u,e.background=m}_textureToCubeUV(e,t){const i=this._renderer,s=e.mapping===301||e.mapping===302;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Ya()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Xa());const r=s?this._cubemapMaterial:this._equirectMaterial,o=new ut(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;const l=this._cubeSize;Us(t,0,0,3*l,2*l),i.setRenderTarget(t),i.render(o,Zr)}_applyPMREM(e){const t=this._renderer,i=t.autoClear;t.autoClear=!1;const s=this._lodPlanes.length;for(let r=1;r<s;r++){const o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=Va[(s-r-1)%Va.length];this._blur(e,r-1,r,o,a)}t.autoClear=i}_blur(e,t,i,s,r){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,i,s,"latitudinal",r),this._halfBlur(o,e,i,i,s,"longitudinal",r)}_halfBlur(e,t,i,s,r,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new ut(this._lodPlanes[s],c),p=c.uniforms,f=this._sizeLods[i]-1,g=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*Kn-1),y=r/g,m=isFinite(r)?1+Math.floor(h*y):Kn;m>Kn&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Kn}`);const d=[];let v=0;for(let R=0;R<Kn;++R){const I=R/y,S=Math.exp(-I*I/2);d.push(S),R===0?v+=S:R<m&&(v+=2*S)}for(let R=0;R<d.length;R++)d[R]=d[R]/v;p.envMap.value=e.texture,p.samples.value=m,p.weights.value=d,p.latitudinal.value=o==="latitudinal",a&&(p.poleAxis.value=a);const{_lodMax:b}=this;p.dTheta.value=g,p.mipInt.value=b-i;const _=this._sizeLods[s],E=3*_*(s>b-xi?s-b+xi:0),w=4*(this._cubeSize-_);Us(t,E,w,3*_,2*_),l.setRenderTarget(t),l.render(u,Zr)}}function mp(n){const e=[],t=[],i=[];let s=n;const r=n-xi+1+za.length;for(let o=0;o<r;o++){const a=Math.pow(2,s);t.push(a);let l=1/a;o>n-xi?l=za[o-n+xi-1]:o===0&&(l=0),i.push(l);const c=1/(a-2),h=-c,u=1+c,p=[h,h,u,h,u,u,h,h,u,u,h,u],f=6,g=6,y=3,m=2,d=1,v=new Float32Array(y*g*f),b=new Float32Array(m*g*f),_=new Float32Array(d*g*f);for(let w=0;w<f;w++){const R=w%3*2/3-1,I=w>2?0:-1,S=[R,I,0,R+2/3,I,0,R+2/3,I+1,0,R,I,0,R+2/3,I+1,0,R,I+1,0];v.set(S,y*g*w),b.set(p,m*g*w);const x=[w,w,w,w,w,w];_.set(x,d*g*w)}const E=new _t;E.setAttribute("position",new Ct(v,y)),E.setAttribute("uv",new Ct(b,m)),E.setAttribute("faceIndex",new Ct(_,d)),e.push(E),s>xi&&s--}return{lodPlanes:e,sizeLods:t,sigmas:i}}function Wa(n,e,t){const i=new Qn(n,e,t);return i.texture.mapping=306,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Us(n,e,t,i,s){n.viewport.set(e,t,i,s),n.scissor.set(e,t,i,s)}function gp(n,e,t){const i=new Float32Array(Kn),s=new P(0,1,0);return new Un({name:"SphericalGaussianBlur",defines:{n:Kn,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Jo(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})}function Xa(){return new Un({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Jo(),fragmentShader:`

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
		`,blending:0,depthTest:!1,depthWrite:!1})}function Ya(){return new Un({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Jo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:0,depthTest:!1,depthWrite:!1})}function Jo(){return`

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
	`}function _p(n){let e=new WeakMap,t=null;function i(a){if(a&&a.isTexture){const l=a.mapping,c=l===303||l===304,h=l===301||l===302;if(c||h){let u=e.get(a);const p=u!==void 0?u.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==p)return t===null&&(t=new Ga(n)),u=c?t.fromEquirectangular(a,u):t.fromCubemap(a,u),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),u.texture;if(u!==void 0)return u.texture;{const f=a.image;return c&&f&&f.height>0||h&&f&&s(f)?(t===null&&(t=new Ga(n)),u=c?t.fromEquirectangular(a):t.fromCubemap(a),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),a.addEventListener("dispose",r),u.texture):null}}}return a}function s(a){let l=0;const c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function r(a){const l=a.target;l.removeEventListener("dispose",r);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:i,dispose:o}}function yp(n){const e={};function t(i){if(e[i]!==void 0)return e[i];let s;switch(i){case"WEBGL_depth_texture":s=n.getExtension("WEBGL_depth_texture")||n.getExtension("MOZ_WEBGL_depth_texture")||n.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=n.getExtension("EXT_texture_filter_anisotropic")||n.getExtension("MOZ_EXT_texture_filter_anisotropic")||n.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=n.getExtension("WEBGL_compressed_texture_s3tc")||n.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=n.getExtension("WEBGL_compressed_texture_pvrtc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=n.getExtension(i)}return e[i]=s,s}return{has:function(i){return t(i)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(i){const s=t(i);return s===null&&ts("THREE.WebGLRenderer: "+i+" extension not supported."),s}}}function vp(n,e,t,i){const s={},r=new WeakMap;function o(u){const p=u.target;p.index!==null&&e.remove(p.index);for(const g in p.attributes)e.remove(p.attributes[g]);for(const g in p.morphAttributes){const y=p.morphAttributes[g];for(let m=0,d=y.length;m<d;m++)e.remove(y[m])}p.removeEventListener("dispose",o),delete s[p.id];const f=r.get(p);f&&(e.remove(f),r.delete(p)),i.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,t.memory.geometries--}function a(u,p){return s[p.id]===!0||(p.addEventListener("dispose",o),s[p.id]=!0,t.memory.geometries++),p}function l(u){const p=u.attributes;for(const g in p)e.update(p[g],n.ARRAY_BUFFER);const f=u.morphAttributes;for(const g in f){const y=f[g];for(let m=0,d=y.length;m<d;m++)e.update(y[m],n.ARRAY_BUFFER)}}function c(u){const p=[],f=u.index,g=u.attributes.position;let y=0;if(f!==null){const v=f.array;y=f.version;for(let b=0,_=v.length;b<_;b+=3){const E=v[b+0],w=v[b+1],R=v[b+2];p.push(E,w,w,R,R,E)}}else if(g!==void 0){const v=g.array;y=g.version;for(let b=0,_=v.length/3-1;b<_;b+=3){const E=b+0,w=b+1,R=b+2;p.push(E,w,w,R,R,E)}}else return;const m=new(fc(p)?_c:jo)(p,1);m.version=y;const d=r.get(u);d&&e.remove(d),r.set(u,m)}function h(u){const p=r.get(u);if(p){const f=u.index;f!==null&&p.version<f.version&&c(u)}else c(u);return r.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function bp(n,e,t){let i;function s(p){i=p}let r,o;function a(p){r=p.type,o=p.bytesPerElement}function l(p,f){n.drawElements(i,f,r,p*o),t.update(f,i,1)}function c(p,f,g){g!==0&&(n.drawElementsInstanced(i,f,r,p*o,g),t.update(f,i,g))}function h(p,f,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,f,0,r,p,0,g);let m=0;for(let d=0;d<g;d++)m+=f[d];t.update(m,i,1)}function u(p,f,g,y){if(g===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let d=0;d<p.length;d++)c(p[d]/o,f[d],y[d]);else{m.multiDrawElementsInstancedWEBGL(i,f,0,r,p,0,y,0,g);let d=0;for(let v=0;v<g;v++)d+=f[v]*y[v];t.update(d,i,1)}}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function Mp(n){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,a){switch(t.calls++,o){case n.TRIANGLES:t.triangles+=a*(r/3);break;case n.LINES:t.lines+=a*(r/2);break;case n.LINE_STRIP:t.lines+=a*(r-1);break;case n.LINE_LOOP:t.lines+=a*r;break;case n.POINTS:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:i}}function xp(n,e,t){const i=new WeakMap,s=new tt;function r(o,a,l){const c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0;let p=i.get(a);if(p===void 0||p.count!==u){let S=function(){R.dispose(),i.delete(a),a.removeEventListener("dispose",S)};p!==void 0&&p.texture.dispose();const f=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,y=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],d=a.morphAttributes.normal||[],v=a.morphAttributes.color||[];let b=0;f===!0&&(b=1),g===!0&&(b=2),y===!0&&(b=3);let _=a.attributes.position.count*b,E=1;_>e.maxTextureSize&&(E=Math.ceil(_/e.maxTextureSize),_=e.maxTextureSize);const w=new Float32Array(_*E*4*u),R=new mc(w,_,E,u);R.type=1015,R.needsUpdate=!0;const I=b*4;for(let x=0;x<u;x++){const A=m[x],O=d[x],U=v[x],V=_*E*4*x;for(let F=0;F<A.count;F++){const H=F*I;f===!0&&(s.fromBufferAttribute(A,F),w[V+H+0]=s.x,w[V+H+1]=s.y,w[V+H+2]=s.z,w[V+H+3]=0),g===!0&&(s.fromBufferAttribute(O,F),w[V+H+4]=s.x,w[V+H+5]=s.y,w[V+H+6]=s.z,w[V+H+7]=0),y===!0&&(s.fromBufferAttribute(U,F),w[V+H+8]=s.x,w[V+H+9]=s.y,w[V+H+10]=s.z,w[V+H+11]=U.itemSize===4?s.w:1)}}p={count:u,texture:R,size:new he(_,E)},i.set(a,p),a.addEventListener("dispose",S)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",o.morphTexture,t);else{let f=0;for(let y=0;y<c.length;y++)f+=c[y];const g=a.morphTargetsRelative?1:1-f;l.getUniforms().setValue(n,"morphTargetBaseInfluence",g),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",p.texture,t),l.getUniforms().setValue(n,"morphTargetsTextureSize",p.size)}return{update:r}}function Sp(n,e,t,i){let s=new WeakMap;function r(l){const c=i.render.frame,h=l.geometry,u=e.get(l,h);if(s.get(u)!==c&&(e.update(u),s.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(t.update(l.instanceMatrix,n.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,n.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const p=l.skeleton;s.get(p)!==c&&(p.update(),s.set(p,c))}return u}function o(){s=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:o}}class Sc extends Pt{constructor(e,t,i,s,r,o,a,l,c,h=1026){if(h!==1026&&h!==1027)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");i===void 0&&h===1026&&(i=1014),i===void 0&&h===1027&&(i=1020),super(null,s,r,o,a,l,h,i,c),this.isDepthTexture=!0,this.image={width:e,height:t},this.magFilter=a!==void 0?a:1003,this.minFilter=l!==void 0?l:1003,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}const wc=new Pt,qa=new Sc(1,1),Tc=new mc,Ec=new ru,Ac=new bc,ja=[],Ka=[],Ja=new Float32Array(16),Za=new Float32Array(9),$a=new Float32Array(4);function ki(n,e,t){const i=n[0];if(i<=0||i>0)return n;const s=e*t;let r=ja[s];if(r===void 0&&(r=new Float32Array(s),ja[s]=r),e!==0){i.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,n[o].toArray(r,a)}return r}function Et(n,e){if(n.length!==e.length)return!1;for(let t=0,i=n.length;t<i;t++)if(n[t]!==e[t])return!1;return!0}function At(n,e){for(let t=0,i=e.length;t<i;t++)n[t]=e[t]}function br(n,e){let t=Ka[e];t===void 0&&(t=new Int32Array(e),Ka[e]=t);for(let i=0;i!==e;++i)t[i]=n.allocateTextureUnit();return t}function wp(n,e){const t=this.cache;t[0]!==e&&(n.uniform1f(this.addr,e),t[0]=e)}function Tp(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;n.uniform2fv(this.addr,e),At(t,e)}}function Ep(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(n.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Et(t,e))return;n.uniform3fv(this.addr,e),At(t,e)}}function Ap(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;n.uniform4fv(this.addr,e),At(t,e)}}function Rp(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Et(t,e))return;n.uniformMatrix2fv(this.addr,!1,e),At(t,e)}else{if(Et(t,i))return;$a.set(i),n.uniformMatrix2fv(this.addr,!1,$a),At(t,i)}}function Cp(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Et(t,e))return;n.uniformMatrix3fv(this.addr,!1,e),At(t,e)}else{if(Et(t,i))return;Za.set(i),n.uniformMatrix3fv(this.addr,!1,Za),At(t,i)}}function Pp(n,e){const t=this.cache,i=e.elements;if(i===void 0){if(Et(t,e))return;n.uniformMatrix4fv(this.addr,!1,e),At(t,e)}else{if(Et(t,i))return;Ja.set(i),n.uniformMatrix4fv(this.addr,!1,Ja),At(t,i)}}function Ip(n,e){const t=this.cache;t[0]!==e&&(n.uniform1i(this.addr,e),t[0]=e)}function Lp(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;n.uniform2iv(this.addr,e),At(t,e)}}function Dp(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Et(t,e))return;n.uniform3iv(this.addr,e),At(t,e)}}function Np(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;n.uniform4iv(this.addr,e),At(t,e)}}function kp(n,e){const t=this.cache;t[0]!==e&&(n.uniform1ui(this.addr,e),t[0]=e)}function Up(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(n.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Et(t,e))return;n.uniform2uiv(this.addr,e),At(t,e)}}function Fp(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(n.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Et(t,e))return;n.uniform3uiv(this.addr,e),At(t,e)}}function Op(n,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(n.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Et(t,e))return;n.uniform4uiv(this.addr,e),At(t,e)}}function Bp(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(qa.compareFunction=515,r=qa):r=wc,t.setTexture2D(e||r,s)}function zp(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture3D(e||Ec,s)}function Hp(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTextureCube(e||Ac,s)}function Vp(n,e,t){const i=this.cache,s=t.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),t.setTexture2DArray(e||Tc,s)}function Gp(n){switch(n){case 5126:return wp;case 35664:return Tp;case 35665:return Ep;case 35666:return Ap;case 35674:return Rp;case 35675:return Cp;case 35676:return Pp;case 5124:case 35670:return Ip;case 35667:case 35671:return Lp;case 35668:case 35672:return Dp;case 35669:case 35673:return Np;case 5125:return kp;case 36294:return Up;case 36295:return Fp;case 36296:return Op;case 35678:case 36198:case 36298:case 36306:case 35682:return Bp;case 35679:case 36299:case 36307:return zp;case 35680:case 36300:case 36308:case 36293:return Hp;case 36289:case 36303:case 36311:case 36292:return Vp}}function Wp(n,e){n.uniform1fv(this.addr,e)}function Xp(n,e){const t=ki(e,this.size,2);n.uniform2fv(this.addr,t)}function Yp(n,e){const t=ki(e,this.size,3);n.uniform3fv(this.addr,t)}function qp(n,e){const t=ki(e,this.size,4);n.uniform4fv(this.addr,t)}function jp(n,e){const t=ki(e,this.size,4);n.uniformMatrix2fv(this.addr,!1,t)}function Kp(n,e){const t=ki(e,this.size,9);n.uniformMatrix3fv(this.addr,!1,t)}function Jp(n,e){const t=ki(e,this.size,16);n.uniformMatrix4fv(this.addr,!1,t)}function Zp(n,e){n.uniform1iv(this.addr,e)}function $p(n,e){n.uniform2iv(this.addr,e)}function Qp(n,e){n.uniform3iv(this.addr,e)}function em(n,e){n.uniform4iv(this.addr,e)}function tm(n,e){n.uniform1uiv(this.addr,e)}function nm(n,e){n.uniform2uiv(this.addr,e)}function im(n,e){n.uniform3uiv(this.addr,e)}function sm(n,e){n.uniform4uiv(this.addr,e)}function rm(n,e,t){const i=this.cache,s=e.length,r=br(t,s);Et(i,r)||(n.uniform1iv(this.addr,r),At(i,r));for(let o=0;o!==s;++o)t.setTexture2D(e[o]||wc,r[o])}function om(n,e,t){const i=this.cache,s=e.length,r=br(t,s);Et(i,r)||(n.uniform1iv(this.addr,r),At(i,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||Ec,r[o])}function am(n,e,t){const i=this.cache,s=e.length,r=br(t,s);Et(i,r)||(n.uniform1iv(this.addr,r),At(i,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||Ac,r[o])}function lm(n,e,t){const i=this.cache,s=e.length,r=br(t,s);Et(i,r)||(n.uniform1iv(this.addr,r),At(i,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||Tc,r[o])}function cm(n){switch(n){case 5126:return Wp;case 35664:return Xp;case 35665:return Yp;case 35666:return qp;case 35674:return jp;case 35675:return Kp;case 35676:return Jp;case 5124:case 35670:return Zp;case 35667:case 35671:return $p;case 35668:case 35672:return Qp;case 35669:case 35673:return em;case 5125:return tm;case 36294:return nm;case 36295:return im;case 36296:return sm;case 35678:case 36198:case 36298:case 36306:case 35682:return rm;case 35679:case 36299:case 36307:return om;case 35680:case 36300:case 36308:case 36293:return am;case 36289:case 36303:case 36311:case 36292:return lm}}class hm{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.setValue=Gp(t.type)}}class um{constructor(e,t,i){this.id=e,this.addr=i,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=cm(t.type)}}class dm{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,i){const s=this.seq;for(let r=0,o=s.length;r!==o;++r){const a=s[r];a.setValue(e,t[a.id],i)}}}const no=/(\w+)(\])?(\[|\.)?/g;function Qa(n,e){n.seq.push(e),n.map[e.id]=e}function fm(n,e,t){const i=n.name,s=i.length;for(no.lastIndex=0;;){const r=no.exec(i),o=no.lastIndex;let a=r[1];const l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){Qa(t,c===void 0?new hm(a,n,e):new um(a,n,e));break}else{let u=t.map[a];u===void 0&&(u=new dm(a),Qa(t,u)),t=u}}}class er{constructor(e,t){this.seq=[],this.map={};const i=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<i;++s){const r=e.getActiveUniform(t,s),o=e.getUniformLocation(t,r.name);fm(r,o,this)}}setValue(e,t,i,s){const r=this.map[t];r!==void 0&&r.setValue(e,i,s)}setOptional(e,t,i){const s=t[i];s!==void 0&&this.setValue(e,i,s)}static upload(e,t,i,s){for(let r=0,o=t.length;r!==o;++r){const a=t[r],l=i[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){const i=[];for(let s=0,r=e.length;s!==r;++s){const o=e[s];o.id in t&&i.push(o)}return i}}function el(n,e,t){const i=n.createShader(e);return n.shaderSource(i,t),n.compileShader(i),i}const pm=37297;let mm=0;function gm(n,e){const t=n.split(`
`),i=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){const a=o+1;i.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return i.join(`
`)}const tl=new qe;function _m(n){Qe._getMatrix(tl,Qe.workingColorSpace,n);const e=`mat3( ${tl.elements.map(t=>t.toFixed(4))} )`;switch(Qe.getTransfer(n)){case vr:return[e,"LinearTransferOETF"];case ht:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",n),[e,"LinearTransferOETF"]}}function nl(n,e,t){const i=n.getShaderParameter(e,n.COMPILE_STATUS),s=n.getShaderInfoLog(e).trim();if(i&&s==="")return"";const r=/ERROR: 0:(\d+)/.exec(s);if(r){const o=parseInt(r[1]);return t.toUpperCase()+`

`+s+`

`+gm(n.getShaderSource(e),o)}else return s}function ym(n,e){const t=_m(e);return[`vec4 ${n}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function vm(n,e){let t;switch(e){case 1:t="Linear";break;case 2:t="Reinhard";break;case 3:t="Cineon";break;case 4:t="ACESFilmic";break;case 6:t="AgX";break;case 7:t="Neutral";break;case 5:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+n+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Fs=new P;function bm(){Qe.getLuminanceCoefficients(Fs);const n=Fs.x.toFixed(4),e=Fs.y.toFixed(4),t=Fs.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Mm(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(ns).join(`
`)}function xm(n){const e=[];for(const t in n){const i=n[t];i!==!1&&e.push("#define "+t+" "+i)}return e.join(`
`)}function Sm(n,e){const t={},i=n.getProgramParameter(e,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){const r=n.getActiveAttrib(e,s),o=r.name;let a=1;r.type===n.FLOAT_MAT2&&(a=2),r.type===n.FLOAT_MAT3&&(a=3),r.type===n.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:n.getAttribLocation(e,o),locationSize:a}}return t}function ns(n){return n!==""}function il(n,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function sl(n,e){return n.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const wm=/^[ \t]*#include +<([\w\d./]+)>/gm;function So(n){return n.replace(wm,Em)}const Tm=new Map;function Em(n,e){let t=Ge[e];if(t===void 0){const i=Tm.get(e);if(i!==void 0)t=Ge[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,i);else throw new Error("Can not resolve #include <"+e+">")}return So(t)}const Am=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function rl(n){return n.replace(Am,Rm)}function Rm(n,e,t,i){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function ol(n){let e=`precision ${n.precision} float;
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
#define LOW_PRECISION`),e}function Cm(n){let e="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===1?e="SHADOWMAP_TYPE_PCF":n.shadowMapType===2?e="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===3&&(e="SHADOWMAP_TYPE_VSM"),e}function Pm(n){let e="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case 301:case 302:e="ENVMAP_TYPE_CUBE";break;case 306:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Im(n){let e="ENVMAP_MODE_REFLECTION";if(n.envMap)switch(n.envMapMode){case 302:e="ENVMAP_MODE_REFRACTION";break}return e}function Lm(n){let e="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case 0:e="ENVMAP_BLENDING_MULTIPLY";break;case 1:e="ENVMAP_BLENDING_MIX";break;case 2:e="ENVMAP_BLENDING_ADD";break}return e}function Dm(n){const e=n.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,i=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:i,maxMip:t}}function Nm(n,e,t,i){const s=n.getContext(),r=t.defines;let o=t.vertexShader,a=t.fragmentShader;const l=Cm(t),c=Pm(t),h=Im(t),u=Lm(t),p=Dm(t),f=Mm(t),g=xm(r),y=s.createProgram();let m,d,v=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(ns).join(`
`),m.length>0&&(m+=`
`),d=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(ns).join(`
`),d.length>0&&(d+=`
`)):(m=[ol(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(ns).join(`
`),d=[ol(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",p?"#define CUBEUV_TEXEL_WIDTH "+p.texelWidth:"",p?"#define CUBEUV_TEXEL_HEIGHT "+p.texelHeight:"",p?"#define CUBEUV_MAX_MIP "+p.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",t.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==0?"#define TONE_MAPPING":"",t.toneMapping!==0?Ge.tonemapping_pars_fragment:"",t.toneMapping!==0?vm("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ge.colorspace_pars_fragment,ym("linearToOutputTexel",t.outputColorSpace),bm(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(ns).join(`
`)),o=So(o),o=il(o,t),o=sl(o,t),a=So(a),a=il(a,t),a=sl(a,t),o=rl(o),a=rl(a),t.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,d=["#define varying in",t.glslVersion===ya?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===ya?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);const b=v+m+o,_=v+d+a,E=el(s,s.VERTEX_SHADER,b),w=el(s,s.FRAGMENT_SHADER,_);s.attachShader(y,E),s.attachShader(y,w),t.index0AttributeName!==void 0?s.bindAttribLocation(y,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(y,0,"position"),s.linkProgram(y);function R(A){if(n.debug.checkShaderErrors){const O=s.getProgramInfoLog(y).trim(),U=s.getShaderInfoLog(E).trim(),V=s.getShaderInfoLog(w).trim();let F=!0,H=!0;if(s.getProgramParameter(y,s.LINK_STATUS)===!1)if(F=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,y,E,w);else{const Q=nl(s,E,"vertex"),Y=nl(s,w,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(y,s.VALIDATE_STATUS)+`

Material Name: `+A.name+`
Material Type: `+A.type+`

Program Info Log: `+O+`
`+Q+`
`+Y)}else O!==""?console.warn("THREE.WebGLProgram: Program Info Log:",O):(U===""||V==="")&&(H=!1);H&&(A.diagnostics={runnable:F,programLog:O,vertexShader:{log:U,prefix:m},fragmentShader:{log:V,prefix:d}})}s.deleteShader(E),s.deleteShader(w),I=new er(s,y),S=Sm(s,y)}let I;this.getUniforms=function(){return I===void 0&&R(this),I};let S;this.getAttributes=function(){return S===void 0&&R(this),S};let x=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return x===!1&&(x=s.getProgramParameter(y,pm)),x},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(y),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=mm++,this.cacheKey=e,this.usedTimes=1,this.program=y,this.vertexShader=E,this.fragmentShader=w,this}let km=0;class Um{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,i=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(i),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const i of t)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let i=t.get(e);return i===void 0&&(i=new Set,t.set(e,i)),i}_getShaderStage(e){const t=this.shaderCache;let i=t.get(e);return i===void 0&&(i=new Fm(e),t.set(e,i)),i}}class Fm{constructor(e){this.id=km++,this.code=e,this.usedTimes=0}}function Om(n,e,t,i,s,r,o){const a=new Yo,l=new Um,c=new Set,h=[],u=s.logarithmicDepthBuffer,p=s.vertexTextures;let f=s.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function y(S){return c.add(S),S===0?"uv":`uv${S}`}function m(S,x,A,O,U){const V=O.fog,F=U.geometry,H=S.isMeshStandardMaterial?O.environment:null,Q=(S.isMeshStandardMaterial?t:e).get(S.envMap||H),Y=Q&&Q.mapping===306?Q.image.height:null,M=g[S.type];S.precision!==null&&(f=s.getMaxPrecision(S.precision),f!==S.precision&&console.warn("THREE.WebGLProgram.getParameters:",S.precision,"not supported, using",f,"instead."));const N=F.morphAttributes.position||F.morphAttributes.normal||F.morphAttributes.color,Z=N!==void 0?N.length:0;let ce=0;F.morphAttributes.position!==void 0&&(ce=1),F.morphAttributes.normal!==void 0&&(ce=2),F.morphAttributes.color!==void 0&&(ce=3);let Ce,J,ue,oe;if(M){const ot=ln[M];Ce=ot.vertexShader,J=ot.fragmentShader}else Ce=S.vertexShader,J=S.fragmentShader,l.update(S),ue=l.getVertexShaderID(S),oe=l.getFragmentShaderID(S);const X=n.getRenderTarget(),ne=n.state.buffers.depth.getReversed(),ge=U.isInstancedMesh===!0,ee=U.isBatchedMesh===!0,B=!!S.map,q=!!S.matcap,re=!!Q,D=!!S.aoMap,de=!!S.lightMap,le=!!S.bumpMap,ye=!!S.normalMap,pe=!!S.displacementMap,De=!!S.emissiveMap,Me=!!S.metalnessMap,L=!!S.roughnessMap,T=S.anisotropy>0,k=S.clearcoat>0,$=S.dispersion>0,se=S.iridescence>0,te=S.sheen>0,Re=S.transmission>0,ve=T&&!!S.anisotropyMap,Te=k&&!!S.clearcoatMap,Ze=k&&!!S.clearcoatNormalMap,fe=k&&!!S.clearcoatRoughnessMap,Ee=se&&!!S.iridescenceMap,Oe=se&&!!S.iridescenceThicknessMap,Be=te&&!!S.sheenColorMap,Ae=te&&!!S.sheenRoughnessMap,$e=!!S.specularMap,je=!!S.specularColorMap,dt=!!S.specularIntensityMap,z=Re&&!!S.transmissionMap,be=Re&&!!S.thicknessMap,ie=!!S.gradientMap,ae=!!S.alphaMap,we=S.alphaTest>0,xe=!!S.alphaHash,Xe=!!S.extensions;let bt=0;S.toneMapped&&(X===null||X.isXRRenderTarget===!0)&&(bt=n.toneMapping);const Dt={shaderID:M,shaderType:S.type,shaderName:S.name,vertexShader:Ce,fragmentShader:J,defines:S.defines,customVertexShaderID:ue,customFragmentShaderID:oe,isRawShaderMaterial:S.isRawShaderMaterial===!0,glslVersion:S.glslVersion,precision:f,batching:ee,batchingColor:ee&&U._colorsTexture!==null,instancing:ge,instancingColor:ge&&U.instanceColor!==null,instancingMorph:ge&&U.morphTexture!==null,supportsVertexTextures:p,outputColorSpace:X===null?n.outputColorSpace:X.isXRRenderTarget===!0?X.texture.colorSpace:Ni,alphaToCoverage:!!S.alphaToCoverage,map:B,matcap:q,envMap:re,envMapMode:re&&Q.mapping,envMapCubeUVHeight:Y,aoMap:D,lightMap:de,bumpMap:le,normalMap:ye,displacementMap:p&&pe,emissiveMap:De,normalMapObjectSpace:ye&&S.normalMapType===1,normalMapTangentSpace:ye&&S.normalMapType===0,metalnessMap:Me,roughnessMap:L,anisotropy:T,anisotropyMap:ve,clearcoat:k,clearcoatMap:Te,clearcoatNormalMap:Ze,clearcoatRoughnessMap:fe,dispersion:$,iridescence:se,iridescenceMap:Ee,iridescenceThicknessMap:Oe,sheen:te,sheenColorMap:Be,sheenRoughnessMap:Ae,specularMap:$e,specularColorMap:je,specularIntensityMap:dt,transmission:Re,transmissionMap:z,thicknessMap:be,gradientMap:ie,opaque:S.transparent===!1&&S.blending===1&&S.alphaToCoverage===!1,alphaMap:ae,alphaTest:we,alphaHash:xe,combine:S.combine,mapUv:B&&y(S.map.channel),aoMapUv:D&&y(S.aoMap.channel),lightMapUv:de&&y(S.lightMap.channel),bumpMapUv:le&&y(S.bumpMap.channel),normalMapUv:ye&&y(S.normalMap.channel),displacementMapUv:pe&&y(S.displacementMap.channel),emissiveMapUv:De&&y(S.emissiveMap.channel),metalnessMapUv:Me&&y(S.metalnessMap.channel),roughnessMapUv:L&&y(S.roughnessMap.channel),anisotropyMapUv:ve&&y(S.anisotropyMap.channel),clearcoatMapUv:Te&&y(S.clearcoatMap.channel),clearcoatNormalMapUv:Ze&&y(S.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:fe&&y(S.clearcoatRoughnessMap.channel),iridescenceMapUv:Ee&&y(S.iridescenceMap.channel),iridescenceThicknessMapUv:Oe&&y(S.iridescenceThicknessMap.channel),sheenColorMapUv:Be&&y(S.sheenColorMap.channel),sheenRoughnessMapUv:Ae&&y(S.sheenRoughnessMap.channel),specularMapUv:$e&&y(S.specularMap.channel),specularColorMapUv:je&&y(S.specularColorMap.channel),specularIntensityMapUv:dt&&y(S.specularIntensityMap.channel),transmissionMapUv:z&&y(S.transmissionMap.channel),thicknessMapUv:be&&y(S.thicknessMap.channel),alphaMapUv:ae&&y(S.alphaMap.channel),vertexTangents:!!F.attributes.tangent&&(ye||T),vertexColors:S.vertexColors,vertexAlphas:S.vertexColors===!0&&!!F.attributes.color&&F.attributes.color.itemSize===4,pointsUvs:U.isPoints===!0&&!!F.attributes.uv&&(B||ae),fog:!!V,useFog:S.fog===!0,fogExp2:!!V&&V.isFogExp2,flatShading:S.flatShading===!0,sizeAttenuation:S.sizeAttenuation===!0,logarithmicDepthBuffer:u,reverseDepthBuffer:ne,skinning:U.isSkinnedMesh===!0,morphTargets:F.morphAttributes.position!==void 0,morphNormals:F.morphAttributes.normal!==void 0,morphColors:F.morphAttributes.color!==void 0,morphTargetsCount:Z,morphTextureStride:ce,numDirLights:x.directional.length,numPointLights:x.point.length,numSpotLights:x.spot.length,numSpotLightMaps:x.spotLightMap.length,numRectAreaLights:x.rectArea.length,numHemiLights:x.hemi.length,numDirLightShadows:x.directionalShadowMap.length,numPointLightShadows:x.pointShadowMap.length,numSpotLightShadows:x.spotShadowMap.length,numSpotLightShadowsWithMaps:x.numSpotLightShadowsWithMaps,numLightProbes:x.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:S.dithering,shadowMapEnabled:n.shadowMap.enabled&&A.length>0,shadowMapType:n.shadowMap.type,toneMapping:bt,decodeVideoTexture:B&&S.map.isVideoTexture===!0&&Qe.getTransfer(S.map.colorSpace)===ht,decodeVideoTextureEmissive:De&&S.emissiveMap.isVideoTexture===!0&&Qe.getTransfer(S.emissiveMap.colorSpace)===ht,premultipliedAlpha:S.premultipliedAlpha,doubleSided:S.side===2,flipSided:S.side===1,useDepthPacking:S.depthPacking>=0,depthPacking:S.depthPacking||0,index0AttributeName:S.index0AttributeName,extensionClipCullDistance:Xe&&S.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Xe&&S.extensions.multiDraw===!0||ee)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:S.customProgramCacheKey()};return Dt.vertexUv1s=c.has(1),Dt.vertexUv2s=c.has(2),Dt.vertexUv3s=c.has(3),c.clear(),Dt}function d(S){const x=[];if(S.shaderID?x.push(S.shaderID):(x.push(S.customVertexShaderID),x.push(S.customFragmentShaderID)),S.defines!==void 0)for(const A in S.defines)x.push(A),x.push(S.defines[A]);return S.isRawShaderMaterial===!1&&(v(x,S),b(x,S),x.push(n.outputColorSpace)),x.push(S.customProgramCacheKey),x.join()}function v(S,x){S.push(x.precision),S.push(x.outputColorSpace),S.push(x.envMapMode),S.push(x.envMapCubeUVHeight),S.push(x.mapUv),S.push(x.alphaMapUv),S.push(x.lightMapUv),S.push(x.aoMapUv),S.push(x.bumpMapUv),S.push(x.normalMapUv),S.push(x.displacementMapUv),S.push(x.emissiveMapUv),S.push(x.metalnessMapUv),S.push(x.roughnessMapUv),S.push(x.anisotropyMapUv),S.push(x.clearcoatMapUv),S.push(x.clearcoatNormalMapUv),S.push(x.clearcoatRoughnessMapUv),S.push(x.iridescenceMapUv),S.push(x.iridescenceThicknessMapUv),S.push(x.sheenColorMapUv),S.push(x.sheenRoughnessMapUv),S.push(x.specularMapUv),S.push(x.specularColorMapUv),S.push(x.specularIntensityMapUv),S.push(x.transmissionMapUv),S.push(x.thicknessMapUv),S.push(x.combine),S.push(x.fogExp2),S.push(x.sizeAttenuation),S.push(x.morphTargetsCount),S.push(x.morphAttributeCount),S.push(x.numDirLights),S.push(x.numPointLights),S.push(x.numSpotLights),S.push(x.numSpotLightMaps),S.push(x.numHemiLights),S.push(x.numRectAreaLights),S.push(x.numDirLightShadows),S.push(x.numPointLightShadows),S.push(x.numSpotLightShadows),S.push(x.numSpotLightShadowsWithMaps),S.push(x.numLightProbes),S.push(x.shadowMapType),S.push(x.toneMapping),S.push(x.numClippingPlanes),S.push(x.numClipIntersection),S.push(x.depthPacking)}function b(S,x){a.disableAll(),x.supportsVertexTextures&&a.enable(0),x.instancing&&a.enable(1),x.instancingColor&&a.enable(2),x.instancingMorph&&a.enable(3),x.matcap&&a.enable(4),x.envMap&&a.enable(5),x.normalMapObjectSpace&&a.enable(6),x.normalMapTangentSpace&&a.enable(7),x.clearcoat&&a.enable(8),x.iridescence&&a.enable(9),x.alphaTest&&a.enable(10),x.vertexColors&&a.enable(11),x.vertexAlphas&&a.enable(12),x.vertexUv1s&&a.enable(13),x.vertexUv2s&&a.enable(14),x.vertexUv3s&&a.enable(15),x.vertexTangents&&a.enable(16),x.anisotropy&&a.enable(17),x.alphaHash&&a.enable(18),x.batching&&a.enable(19),x.dispersion&&a.enable(20),x.batchingColor&&a.enable(21),S.push(a.mask),a.disableAll(),x.fog&&a.enable(0),x.useFog&&a.enable(1),x.flatShading&&a.enable(2),x.logarithmicDepthBuffer&&a.enable(3),x.reverseDepthBuffer&&a.enable(4),x.skinning&&a.enable(5),x.morphTargets&&a.enable(6),x.morphNormals&&a.enable(7),x.morphColors&&a.enable(8),x.premultipliedAlpha&&a.enable(9),x.shadowMapEnabled&&a.enable(10),x.doubleSided&&a.enable(11),x.flipSided&&a.enable(12),x.useDepthPacking&&a.enable(13),x.dithering&&a.enable(14),x.transmission&&a.enable(15),x.sheen&&a.enable(16),x.opaque&&a.enable(17),x.pointsUvs&&a.enable(18),x.decodeVideoTexture&&a.enable(19),x.decodeVideoTextureEmissive&&a.enable(20),x.alphaToCoverage&&a.enable(21),S.push(a.mask)}function _(S){const x=g[S.type];let A;if(x){const O=ln[x];A=bu.clone(O.uniforms)}else A=S.uniforms;return A}function E(S,x){let A;for(let O=0,U=h.length;O<U;O++){const V=h[O];if(V.cacheKey===x){A=V,++A.usedTimes;break}}return A===void 0&&(A=new Nm(n,x,S,r),h.push(A)),A}function w(S){if(--S.usedTimes===0){const x=h.indexOf(S);h[x]=h[h.length-1],h.pop(),S.destroy()}}function R(S){l.remove(S)}function I(){l.dispose()}return{getParameters:m,getProgramCacheKey:d,getUniforms:_,acquireProgram:E,releaseProgram:w,releaseShaderCache:R,programs:h,dispose:I}}function Bm(){let n=new WeakMap;function e(o){return n.has(o)}function t(o){let a=n.get(o);return a===void 0&&(a={},n.set(o,a)),a}function i(o){n.delete(o)}function s(o,a,l){n.get(o)[a]=l}function r(){n=new WeakMap}return{has:e,get:t,remove:i,update:s,dispose:r}}function zm(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.material.id!==e.material.id?n.material.id-e.material.id:n.z!==e.z?n.z-e.z:n.id-e.id}function al(n,e){return n.groupOrder!==e.groupOrder?n.groupOrder-e.groupOrder:n.renderOrder!==e.renderOrder?n.renderOrder-e.renderOrder:n.z!==e.z?e.z-n.z:n.id-e.id}function ll(){const n=[];let e=0;const t=[],i=[],s=[];function r(){e=0,t.length=0,i.length=0,s.length=0}function o(u,p,f,g,y,m){let d=n[e];return d===void 0?(d={id:u.id,object:u,geometry:p,material:f,groupOrder:g,renderOrder:u.renderOrder,z:y,group:m},n[e]=d):(d.id=u.id,d.object=u,d.geometry=p,d.material=f,d.groupOrder=g,d.renderOrder=u.renderOrder,d.z=y,d.group=m),e++,d}function a(u,p,f,g,y,m){const d=o(u,p,f,g,y,m);f.transmission>0?i.push(d):f.transparent===!0?s.push(d):t.push(d)}function l(u,p,f,g,y,m){const d=o(u,p,f,g,y,m);f.transmission>0?i.unshift(d):f.transparent===!0?s.unshift(d):t.unshift(d)}function c(u,p){t.length>1&&t.sort(u||zm),i.length>1&&i.sort(p||al),s.length>1&&s.sort(p||al)}function h(){for(let u=e,p=n.length;u<p;u++){const f=n[u];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:i,transparent:s,init:r,push:a,unshift:l,finish:h,sort:c}}function Hm(){let n=new WeakMap;function e(i,s){const r=n.get(i);let o;return r===void 0?(o=new ll,n.set(i,[o])):s>=r.length?(o=new ll,r.push(o)):o=r[s],o}function t(){n=new WeakMap}return{get:e,dispose:t}}function Vm(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new P,color:new Ue};break;case"SpotLight":t={position:new P,direction:new P,color:new Ue,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new P,color:new Ue,distance:0,decay:0};break;case"HemisphereLight":t={direction:new P,skyColor:new Ue,groundColor:new Ue};break;case"RectAreaLight":t={color:new Ue,position:new P,halfWidth:new P,halfHeight:new P};break}return n[e.id]=t,t}}}function Gm(){const n={};return{get:function(e){if(n[e.id]!==void 0)return n[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new he};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new he};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new he,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[e.id]=t,t}}}let Wm=0;function Xm(n,e){return(e.castShadow?2:0)-(n.castShadow?2:0)+(e.map?1:0)-(n.map?1:0)}function Ym(n){const e=new Vm,t=Gm(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new P);const s=new P,r=new He,o=new He;function a(c){let h=0,u=0,p=0;for(let S=0;S<9;S++)i.probe[S].set(0,0,0);let f=0,g=0,y=0,m=0,d=0,v=0,b=0,_=0,E=0,w=0,R=0;c.sort(Xm);for(let S=0,x=c.length;S<x;S++){const A=c[S],O=A.color,U=A.intensity,V=A.distance,F=A.shadow&&A.shadow.map?A.shadow.map.texture:null;if(A.isAmbientLight)h+=O.r*U,u+=O.g*U,p+=O.b*U;else if(A.isLightProbe){for(let H=0;H<9;H++)i.probe[H].addScaledVector(A.sh.coefficients[H],U);R++}else if(A.isDirectionalLight){const H=e.get(A);if(H.color.copy(A.color).multiplyScalar(A.intensity),A.castShadow){const Q=A.shadow,Y=t.get(A);Y.shadowIntensity=Q.intensity,Y.shadowBias=Q.bias,Y.shadowNormalBias=Q.normalBias,Y.shadowRadius=Q.radius,Y.shadowMapSize=Q.mapSize,i.directionalShadow[f]=Y,i.directionalShadowMap[f]=F,i.directionalShadowMatrix[f]=A.shadow.matrix,v++}i.directional[f]=H,f++}else if(A.isSpotLight){const H=e.get(A);H.position.setFromMatrixPosition(A.matrixWorld),H.color.copy(O).multiplyScalar(U),H.distance=V,H.coneCos=Math.cos(A.angle),H.penumbraCos=Math.cos(A.angle*(1-A.penumbra)),H.decay=A.decay,i.spot[y]=H;const Q=A.shadow;if(A.map&&(i.spotLightMap[E]=A.map,E++,Q.updateMatrices(A),A.castShadow&&w++),i.spotLightMatrix[y]=Q.matrix,A.castShadow){const Y=t.get(A);Y.shadowIntensity=Q.intensity,Y.shadowBias=Q.bias,Y.shadowNormalBias=Q.normalBias,Y.shadowRadius=Q.radius,Y.shadowMapSize=Q.mapSize,i.spotShadow[y]=Y,i.spotShadowMap[y]=F,_++}y++}else if(A.isRectAreaLight){const H=e.get(A);H.color.copy(O).multiplyScalar(U),H.halfWidth.set(A.width*.5,0,0),H.halfHeight.set(0,A.height*.5,0),i.rectArea[m]=H,m++}else if(A.isPointLight){const H=e.get(A);if(H.color.copy(A.color).multiplyScalar(A.intensity),H.distance=A.distance,H.decay=A.decay,A.castShadow){const Q=A.shadow,Y=t.get(A);Y.shadowIntensity=Q.intensity,Y.shadowBias=Q.bias,Y.shadowNormalBias=Q.normalBias,Y.shadowRadius=Q.radius,Y.shadowMapSize=Q.mapSize,Y.shadowCameraNear=Q.camera.near,Y.shadowCameraFar=Q.camera.far,i.pointShadow[g]=Y,i.pointShadowMap[g]=F,i.pointShadowMatrix[g]=A.shadow.matrix,b++}i.point[g]=H,g++}else if(A.isHemisphereLight){const H=e.get(A);H.skyColor.copy(A.color).multiplyScalar(U),H.groundColor.copy(A.groundColor).multiplyScalar(U),i.hemi[d]=H,d++}}m>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=_e.LTC_FLOAT_1,i.rectAreaLTC2=_e.LTC_FLOAT_2):(i.rectAreaLTC1=_e.LTC_HALF_1,i.rectAreaLTC2=_e.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=u,i.ambient[2]=p;const I=i.hash;(I.directionalLength!==f||I.pointLength!==g||I.spotLength!==y||I.rectAreaLength!==m||I.hemiLength!==d||I.numDirectionalShadows!==v||I.numPointShadows!==b||I.numSpotShadows!==_||I.numSpotMaps!==E||I.numLightProbes!==R)&&(i.directional.length=f,i.spot.length=y,i.rectArea.length=m,i.point.length=g,i.hemi.length=d,i.directionalShadow.length=v,i.directionalShadowMap.length=v,i.pointShadow.length=b,i.pointShadowMap.length=b,i.spotShadow.length=_,i.spotShadowMap.length=_,i.directionalShadowMatrix.length=v,i.pointShadowMatrix.length=b,i.spotLightMatrix.length=_+E-w,i.spotLightMap.length=E,i.numSpotLightShadowsWithMaps=w,i.numLightProbes=R,I.directionalLength=f,I.pointLength=g,I.spotLength=y,I.rectAreaLength=m,I.hemiLength=d,I.numDirectionalShadows=v,I.numPointShadows=b,I.numSpotShadows=_,I.numSpotMaps=E,I.numLightProbes=R,i.version=Wm++)}function l(c,h){let u=0,p=0,f=0,g=0,y=0;const m=h.matrixWorldInverse;for(let d=0,v=c.length;d<v;d++){const b=c[d];if(b.isDirectionalLight){const _=i.directional[u];_.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),_.direction.sub(s),_.direction.transformDirection(m),u++}else if(b.isSpotLight){const _=i.spot[f];_.position.setFromMatrixPosition(b.matrixWorld),_.position.applyMatrix4(m),_.direction.setFromMatrixPosition(b.matrixWorld),s.setFromMatrixPosition(b.target.matrixWorld),_.direction.sub(s),_.direction.transformDirection(m),f++}else if(b.isRectAreaLight){const _=i.rectArea[g];_.position.setFromMatrixPosition(b.matrixWorld),_.position.applyMatrix4(m),o.identity(),r.copy(b.matrixWorld),r.premultiply(m),o.extractRotation(r),_.halfWidth.set(b.width*.5,0,0),_.halfHeight.set(0,b.height*.5,0),_.halfWidth.applyMatrix4(o),_.halfHeight.applyMatrix4(o),g++}else if(b.isPointLight){const _=i.point[p];_.position.setFromMatrixPosition(b.matrixWorld),_.position.applyMatrix4(m),p++}else if(b.isHemisphereLight){const _=i.hemi[y];_.direction.setFromMatrixPosition(b.matrixWorld),_.direction.transformDirection(m),y++}}}return{setup:a,setupView:l,state:i}}function cl(n){const e=new Ym(n),t=[],i=[];function s(h){c.camera=h,t.length=0,i.length=0}function r(h){t.push(h)}function o(h){i.push(h)}function a(){e.setup(t)}function l(h){e.setupView(t,h)}const c={lightsArray:t,shadowsArray:i,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function qm(n){let e=new WeakMap;function t(s,r=0){const o=e.get(s);let a;return o===void 0?(a=new cl(n),e.set(s,[a])):r>=o.length?(a=new cl(n),o.push(a)):a=o[r],a}function i(){e=new WeakMap}return{get:t,dispose:i}}class jm extends xn{static get type(){return"MeshDepthMaterial"}constructor(e){super(),this.isMeshDepthMaterial=!0,this.depthPacking=3200,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class Km extends xn{static get type(){return"MeshDistanceMaterial"}constructor(e){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}const Jm=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Zm=`uniform sampler2D shadow_pass;
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
}`;function $m(n,e,t){let i=new Ko;const s=new he,r=new he,o=new tt,a=new jm({depthPacking:3201}),l=new Km,c={},h=t.maxTextureSize,u={0:1,1:0,2:2},p=new Un({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new he},radius:{value:4}},vertexShader:Jm,fragmentShader:Zm}),f=p.clone();f.defines.HORIZONTAL_PASS=1;const g=new _t;g.setAttribute("position",new Ct(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const y=new ut(g,p),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=1;let d=this.type;this.render=function(w,R,I){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||w.length===0)return;const S=n.getRenderTarget(),x=n.getActiveCubeFace(),A=n.getActiveMipmapLevel(),O=n.state;O.setBlending(0),O.buffers.color.setClear(1,1,1,1),O.buffers.depth.setTest(!0),O.setScissorTest(!1);const U=d!==3&&this.type===3,V=d===3&&this.type!==3;for(let F=0,H=w.length;F<H;F++){const Q=w[F],Y=Q.shadow;if(Y===void 0){console.warn("THREE.WebGLShadowMap:",Q,"has no shadow.");continue}if(Y.autoUpdate===!1&&Y.needsUpdate===!1)continue;s.copy(Y.mapSize);const M=Y.getFrameExtents();if(s.multiply(M),r.copy(Y.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/M.x),s.x=r.x*M.x,Y.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/M.y),s.y=r.y*M.y,Y.mapSize.y=r.y)),Y.map===null||U===!0||V===!0){const Z=this.type!==3?{minFilter:1003,magFilter:1003}:{};Y.map!==null&&Y.map.dispose(),Y.map=new Qn(s.x,s.y,Z),Y.map.texture.name=Q.name+".shadowMap",Y.camera.updateProjectionMatrix()}n.setRenderTarget(Y.map),n.clear();const N=Y.getViewportCount();for(let Z=0;Z<N;Z++){const ce=Y.getViewport(Z);o.set(r.x*ce.x,r.y*ce.y,r.x*ce.z,r.y*ce.w),O.viewport(o),Y.updateMatrices(Q,Z),i=Y.getFrustum(),_(R,I,Y.camera,Q,this.type)}Y.isPointLightShadow!==!0&&this.type===3&&v(Y,I),Y.needsUpdate=!1}d=this.type,m.needsUpdate=!1,n.setRenderTarget(S,x,A)};function v(w,R){const I=e.update(y);p.defines.VSM_SAMPLES!==w.blurSamples&&(p.defines.VSM_SAMPLES=w.blurSamples,f.defines.VSM_SAMPLES=w.blurSamples,p.needsUpdate=!0,f.needsUpdate=!0),w.mapPass===null&&(w.mapPass=new Qn(s.x,s.y)),p.uniforms.shadow_pass.value=w.map.texture,p.uniforms.resolution.value=w.mapSize,p.uniforms.radius.value=w.radius,n.setRenderTarget(w.mapPass),n.clear(),n.renderBufferDirect(R,null,I,p,y,null),f.uniforms.shadow_pass.value=w.mapPass.texture,f.uniforms.resolution.value=w.mapSize,f.uniforms.radius.value=w.radius,n.setRenderTarget(w.map),n.clear(),n.renderBufferDirect(R,null,I,f,y,null)}function b(w,R,I,S){let x=null;const A=I.isPointLight===!0?w.customDistanceMaterial:w.customDepthMaterial;if(A!==void 0)x=A;else if(x=I.isPointLight===!0?l:a,n.localClippingEnabled&&R.clipShadows===!0&&Array.isArray(R.clippingPlanes)&&R.clippingPlanes.length!==0||R.displacementMap&&R.displacementScale!==0||R.alphaMap&&R.alphaTest>0||R.map&&R.alphaTest>0){const O=x.uuid,U=R.uuid;let V=c[O];V===void 0&&(V={},c[O]=V);let F=V[U];F===void 0&&(F=x.clone(),V[U]=F,R.addEventListener("dispose",E)),x=F}if(x.visible=R.visible,x.wireframe=R.wireframe,S===3?x.side=R.shadowSide!==null?R.shadowSide:R.side:x.side=R.shadowSide!==null?R.shadowSide:u[R.side],x.alphaMap=R.alphaMap,x.alphaTest=R.alphaTest,x.map=R.map,x.clipShadows=R.clipShadows,x.clippingPlanes=R.clippingPlanes,x.clipIntersection=R.clipIntersection,x.displacementMap=R.displacementMap,x.displacementScale=R.displacementScale,x.displacementBias=R.displacementBias,x.wireframeLinewidth=R.wireframeLinewidth,x.linewidth=R.linewidth,I.isPointLight===!0&&x.isMeshDistanceMaterial===!0){const O=n.properties.get(x);O.light=I}return x}function _(w,R,I,S,x){if(w.visible===!1)return;if(w.layers.test(R.layers)&&(w.isMesh||w.isLine||w.isPoints)&&(w.castShadow||w.receiveShadow&&x===3)&&(!w.frustumCulled||i.intersectsObject(w))){w.modelViewMatrix.multiplyMatrices(I.matrixWorldInverse,w.matrixWorld);const U=e.update(w),V=w.material;if(Array.isArray(V)){const F=U.groups;for(let H=0,Q=F.length;H<Q;H++){const Y=F[H],M=V[Y.materialIndex];if(M&&M.visible){const N=b(w,M,S,x);w.onBeforeShadow(n,w,R,I,U,N,Y),n.renderBufferDirect(I,null,U,N,w,Y),w.onAfterShadow(n,w,R,I,U,N,Y)}}}else if(V.visible){const F=b(w,V,S,x);w.onBeforeShadow(n,w,R,I,U,F,null),n.renderBufferDirect(I,null,U,F,w,null),w.onAfterShadow(n,w,R,I,U,F,null)}}const O=w.children;for(let U=0,V=O.length;U<V;U++)_(O[U],R,I,S,x)}function E(w){w.target.removeEventListener("dispose",E);for(const I in c){const S=c[I],x=w.target.uuid;x in S&&(S[x].dispose(),delete S[x])}}}const Qm={0:1,2:6,4:7,3:5,1:0,6:2,7:4,5:3};function e0(n,e){function t(){let z=!1;const be=new tt;let ie=null;const ae=new tt(0,0,0,0);return{setMask:function(we){ie!==we&&!z&&(n.colorMask(we,we,we,we),ie=we)},setLocked:function(we){z=we},setClear:function(we,xe,Xe,bt,Dt){Dt===!0&&(we*=bt,xe*=bt,Xe*=bt),be.set(we,xe,Xe,bt),ae.equals(be)===!1&&(n.clearColor(we,xe,Xe,bt),ae.copy(be))},reset:function(){z=!1,ie=null,ae.set(-1,0,0,0)}}}function i(){let z=!1,be=!1,ie=null,ae=null,we=null;return{setReversed:function(xe){if(be!==xe){const Xe=e.get("EXT_clip_control");be?Xe.clipControlEXT(Xe.LOWER_LEFT_EXT,Xe.ZERO_TO_ONE_EXT):Xe.clipControlEXT(Xe.LOWER_LEFT_EXT,Xe.NEGATIVE_ONE_TO_ONE_EXT);const bt=we;we=null,this.setClear(bt)}be=xe},getReversed:function(){return be},setTest:function(xe){xe?X(n.DEPTH_TEST):ne(n.DEPTH_TEST)},setMask:function(xe){ie!==xe&&!z&&(n.depthMask(xe),ie=xe)},setFunc:function(xe){if(be&&(xe=Qm[xe]),ae!==xe){switch(xe){case 0:n.depthFunc(n.NEVER);break;case 1:n.depthFunc(n.ALWAYS);break;case 2:n.depthFunc(n.LESS);break;case 3:n.depthFunc(n.LEQUAL);break;case 4:n.depthFunc(n.EQUAL);break;case 5:n.depthFunc(n.GEQUAL);break;case 6:n.depthFunc(n.GREATER);break;case 7:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}ae=xe}},setLocked:function(xe){z=xe},setClear:function(xe){we!==xe&&(be&&(xe=1-xe),n.clearDepth(xe),we=xe)},reset:function(){z=!1,ie=null,ae=null,we=null,be=!1}}}function s(){let z=!1,be=null,ie=null,ae=null,we=null,xe=null,Xe=null,bt=null,Dt=null;return{setTest:function(ot){z||(ot?X(n.STENCIL_TEST):ne(n.STENCIL_TEST))},setMask:function(ot){be!==ot&&!z&&(n.stencilMask(ot),be=ot)},setFunc:function(ot,Jt,un){(ie!==ot||ae!==Jt||we!==un)&&(n.stencilFunc(ot,Jt,un),ie=ot,ae=Jt,we=un)},setOp:function(ot,Jt,un){(xe!==ot||Xe!==Jt||bt!==un)&&(n.stencilOp(ot,Jt,un),xe=ot,Xe=Jt,bt=un)},setLocked:function(ot){z=ot},setClear:function(ot){Dt!==ot&&(n.clearStencil(ot),Dt=ot)},reset:function(){z=!1,be=null,ie=null,ae=null,we=null,xe=null,Xe=null,bt=null,Dt=null}}}const r=new t,o=new i,a=new s,l=new WeakMap,c=new WeakMap;let h={},u={},p=new WeakMap,f=[],g=null,y=!1,m=null,d=null,v=null,b=null,_=null,E=null,w=null,R=new Ue(0,0,0),I=0,S=!1,x=null,A=null,O=null,U=null,V=null;const F=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let H=!1,Q=0;const Y=n.getParameter(n.VERSION);Y.indexOf("WebGL")!==-1?(Q=parseFloat(/^WebGL (\d)/.exec(Y)[1]),H=Q>=1):Y.indexOf("OpenGL ES")!==-1&&(Q=parseFloat(/^OpenGL ES (\d)/.exec(Y)[1]),H=Q>=2);let M=null,N={};const Z=n.getParameter(n.SCISSOR_BOX),ce=n.getParameter(n.VIEWPORT),Ce=new tt().fromArray(Z),J=new tt().fromArray(ce);function ue(z,be,ie,ae){const we=new Uint8Array(4),xe=n.createTexture();n.bindTexture(z,xe),n.texParameteri(z,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(z,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Xe=0;Xe<ie;Xe++)z===n.TEXTURE_3D||z===n.TEXTURE_2D_ARRAY?n.texImage3D(be,0,n.RGBA,1,1,ae,0,n.RGBA,n.UNSIGNED_BYTE,we):n.texImage2D(be+Xe,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,we);return xe}const oe={};oe[n.TEXTURE_2D]=ue(n.TEXTURE_2D,n.TEXTURE_2D,1),oe[n.TEXTURE_CUBE_MAP]=ue(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),oe[n.TEXTURE_2D_ARRAY]=ue(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),oe[n.TEXTURE_3D]=ue(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),X(n.DEPTH_TEST),o.setFunc(3),le(!1),ye(1),X(n.CULL_FACE),D(0);function X(z){h[z]!==!0&&(n.enable(z),h[z]=!0)}function ne(z){h[z]!==!1&&(n.disable(z),h[z]=!1)}function ge(z,be){return u[z]!==be?(n.bindFramebuffer(z,be),u[z]=be,z===n.DRAW_FRAMEBUFFER&&(u[n.FRAMEBUFFER]=be),z===n.FRAMEBUFFER&&(u[n.DRAW_FRAMEBUFFER]=be),!0):!1}function ee(z,be){let ie=f,ae=!1;if(z){ie=p.get(be),ie===void 0&&(ie=[],p.set(be,ie));const we=z.textures;if(ie.length!==we.length||ie[0]!==n.COLOR_ATTACHMENT0){for(let xe=0,Xe=we.length;xe<Xe;xe++)ie[xe]=n.COLOR_ATTACHMENT0+xe;ie.length=we.length,ae=!0}}else ie[0]!==n.BACK&&(ie[0]=n.BACK,ae=!0);ae&&n.drawBuffers(ie)}function B(z){return g!==z?(n.useProgram(z),g=z,!0):!1}const q={100:n.FUNC_ADD,101:n.FUNC_SUBTRACT,102:n.FUNC_REVERSE_SUBTRACT};q[103]=n.MIN,q[104]=n.MAX;const re={200:n.ZERO,201:n.ONE,202:n.SRC_COLOR,204:n.SRC_ALPHA,210:n.SRC_ALPHA_SATURATE,208:n.DST_COLOR,206:n.DST_ALPHA,203:n.ONE_MINUS_SRC_COLOR,205:n.ONE_MINUS_SRC_ALPHA,209:n.ONE_MINUS_DST_COLOR,207:n.ONE_MINUS_DST_ALPHA,211:n.CONSTANT_COLOR,212:n.ONE_MINUS_CONSTANT_COLOR,213:n.CONSTANT_ALPHA,214:n.ONE_MINUS_CONSTANT_ALPHA};function D(z,be,ie,ae,we,xe,Xe,bt,Dt,ot){if(z===0){y===!0&&(ne(n.BLEND),y=!1);return}if(y===!1&&(X(n.BLEND),y=!0),z!==5){if(z!==m||ot!==S){if((d!==100||_!==100)&&(n.blendEquation(n.FUNC_ADD),d=100,_=100),ot)switch(z){case 1:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case 2:n.blendFunc(n.ONE,n.ONE);break;case 3:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case 4:n.blendFuncSeparate(n.ZERO,n.SRC_COLOR,n.ZERO,n.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",z);break}else switch(z){case 1:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case 2:n.blendFunc(n.SRC_ALPHA,n.ONE);break;case 3:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case 4:n.blendFunc(n.ZERO,n.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",z);break}v=null,b=null,E=null,w=null,R.set(0,0,0),I=0,m=z,S=ot}return}we=we||be,xe=xe||ie,Xe=Xe||ae,(be!==d||we!==_)&&(n.blendEquationSeparate(q[be],q[we]),d=be,_=we),(ie!==v||ae!==b||xe!==E||Xe!==w)&&(n.blendFuncSeparate(re[ie],re[ae],re[xe],re[Xe]),v=ie,b=ae,E=xe,w=Xe),(bt.equals(R)===!1||Dt!==I)&&(n.blendColor(bt.r,bt.g,bt.b,Dt),R.copy(bt),I=Dt),m=z,S=!1}function de(z,be){z.side===2?ne(n.CULL_FACE):X(n.CULL_FACE);let ie=z.side===1;be&&(ie=!ie),le(ie),z.blending===1&&z.transparent===!1?D(0):D(z.blending,z.blendEquation,z.blendSrc,z.blendDst,z.blendEquationAlpha,z.blendSrcAlpha,z.blendDstAlpha,z.blendColor,z.blendAlpha,z.premultipliedAlpha),o.setFunc(z.depthFunc),o.setTest(z.depthTest),o.setMask(z.depthWrite),r.setMask(z.colorWrite);const ae=z.stencilWrite;a.setTest(ae),ae&&(a.setMask(z.stencilWriteMask),a.setFunc(z.stencilFunc,z.stencilRef,z.stencilFuncMask),a.setOp(z.stencilFail,z.stencilZFail,z.stencilZPass)),De(z.polygonOffset,z.polygonOffsetFactor,z.polygonOffsetUnits),z.alphaToCoverage===!0?X(n.SAMPLE_ALPHA_TO_COVERAGE):ne(n.SAMPLE_ALPHA_TO_COVERAGE)}function le(z){x!==z&&(z?n.frontFace(n.CW):n.frontFace(n.CCW),x=z)}function ye(z){z!==0?(X(n.CULL_FACE),z!==A&&(z===1?n.cullFace(n.BACK):z===2?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):ne(n.CULL_FACE),A=z}function pe(z){z!==O&&(H&&n.lineWidth(z),O=z)}function De(z,be,ie){z?(X(n.POLYGON_OFFSET_FILL),(U!==be||V!==ie)&&(n.polygonOffset(be,ie),U=be,V=ie)):ne(n.POLYGON_OFFSET_FILL)}function Me(z){z?X(n.SCISSOR_TEST):ne(n.SCISSOR_TEST)}function L(z){z===void 0&&(z=n.TEXTURE0+F-1),M!==z&&(n.activeTexture(z),M=z)}function T(z,be,ie){ie===void 0&&(M===null?ie=n.TEXTURE0+F-1:ie=M);let ae=N[ie];ae===void 0&&(ae={type:void 0,texture:void 0},N[ie]=ae),(ae.type!==z||ae.texture!==be)&&(M!==ie&&(n.activeTexture(ie),M=ie),n.bindTexture(z,be||oe[z]),ae.type=z,ae.texture=be)}function k(){const z=N[M];z!==void 0&&z.type!==void 0&&(n.bindTexture(z.type,null),z.type=void 0,z.texture=void 0)}function $(){try{n.compressedTexImage2D.apply(n,arguments)}catch(z){console.error("THREE.WebGLState:",z)}}function se(){try{n.compressedTexImage3D.apply(n,arguments)}catch(z){console.error("THREE.WebGLState:",z)}}function te(){try{n.texSubImage2D.apply(n,arguments)}catch(z){console.error("THREE.WebGLState:",z)}}function Re(){try{n.texSubImage3D.apply(n,arguments)}catch(z){console.error("THREE.WebGLState:",z)}}function ve(){try{n.compressedTexSubImage2D.apply(n,arguments)}catch(z){console.error("THREE.WebGLState:",z)}}function Te(){try{n.compressedTexSubImage3D.apply(n,arguments)}catch(z){console.error("THREE.WebGLState:",z)}}function Ze(){try{n.texStorage2D.apply(n,arguments)}catch(z){console.error("THREE.WebGLState:",z)}}function fe(){try{n.texStorage3D.apply(n,arguments)}catch(z){console.error("THREE.WebGLState:",z)}}function Ee(){try{n.texImage2D.apply(n,arguments)}catch(z){console.error("THREE.WebGLState:",z)}}function Oe(){try{n.texImage3D.apply(n,arguments)}catch(z){console.error("THREE.WebGLState:",z)}}function Be(z){Ce.equals(z)===!1&&(n.scissor(z.x,z.y,z.z,z.w),Ce.copy(z))}function Ae(z){J.equals(z)===!1&&(n.viewport(z.x,z.y,z.z,z.w),J.copy(z))}function $e(z,be){let ie=c.get(be);ie===void 0&&(ie=new WeakMap,c.set(be,ie));let ae=ie.get(z);ae===void 0&&(ae=n.getUniformBlockIndex(be,z.name),ie.set(z,ae))}function je(z,be){const ae=c.get(be).get(z);l.get(be)!==ae&&(n.uniformBlockBinding(be,ae,z.__bindingPointIndex),l.set(be,ae))}function dt(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),o.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),h={},M=null,N={},u={},p=new WeakMap,f=[],g=null,y=!1,m=null,d=null,v=null,b=null,_=null,E=null,w=null,R=new Ue(0,0,0),I=0,S=!1,x=null,A=null,O=null,U=null,V=null,Ce.set(0,0,n.canvas.width,n.canvas.height),J.set(0,0,n.canvas.width,n.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:X,disable:ne,bindFramebuffer:ge,drawBuffers:ee,useProgram:B,setBlending:D,setMaterial:de,setFlipSided:le,setCullFace:ye,setLineWidth:pe,setPolygonOffset:De,setScissorTest:Me,activeTexture:L,bindTexture:T,unbindTexture:k,compressedTexImage2D:$,compressedTexImage3D:se,texImage2D:Ee,texImage3D:Oe,updateUBOMapping:$e,uniformBlockBinding:je,texStorage2D:Ze,texStorage3D:fe,texSubImage2D:te,texSubImage3D:Re,compressedTexSubImage2D:ve,compressedTexSubImage3D:Te,scissor:Be,viewport:Ae,reset:dt}}function hl(n,e,t,i){const s=t0(i);switch(t){case 1021:return n*e;case 1024:return n*e;case 1025:return n*e*2;case 1028:return n*e/s.components*s.byteLength;case 1029:return n*e/s.components*s.byteLength;case 1030:return n*e*2/s.components*s.byteLength;case 1031:return n*e*2/s.components*s.byteLength;case 1022:return n*e*3/s.components*s.byteLength;case 1023:return n*e*4/s.components*s.byteLength;case 1033:return n*e*4/s.components*s.byteLength;case 33776:case 33777:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case 33778:case 33779:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case 35841:case 35843:return Math.max(n,16)*Math.max(e,8)/4;case 35840:case 35842:return Math.max(n,8)*Math.max(e,8)/2;case 36196:case 37492:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*8;case 37496:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case 37808:return Math.floor((n+3)/4)*Math.floor((e+3)/4)*16;case 37809:return Math.floor((n+4)/5)*Math.floor((e+3)/4)*16;case 37810:return Math.floor((n+4)/5)*Math.floor((e+4)/5)*16;case 37811:return Math.floor((n+5)/6)*Math.floor((e+4)/5)*16;case 37812:return Math.floor((n+5)/6)*Math.floor((e+5)/6)*16;case 37813:return Math.floor((n+7)/8)*Math.floor((e+4)/5)*16;case 37814:return Math.floor((n+7)/8)*Math.floor((e+5)/6)*16;case 37815:return Math.floor((n+7)/8)*Math.floor((e+7)/8)*16;case 37816:return Math.floor((n+9)/10)*Math.floor((e+4)/5)*16;case 37817:return Math.floor((n+9)/10)*Math.floor((e+5)/6)*16;case 37818:return Math.floor((n+9)/10)*Math.floor((e+7)/8)*16;case 37819:return Math.floor((n+9)/10)*Math.floor((e+9)/10)*16;case 37820:return Math.floor((n+11)/12)*Math.floor((e+9)/10)*16;case 37821:return Math.floor((n+11)/12)*Math.floor((e+11)/12)*16;case 36492:case 36494:case 36495:return Math.ceil(n/4)*Math.ceil(e/4)*16;case 36283:case 36284:return Math.ceil(n/4)*Math.ceil(e/4)*8;case 36285:case 36286:return Math.ceil(n/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function t0(n){switch(n){case 1009:case 1010:return{byteLength:1,components:1};case 1012:case 1011:case 1016:return{byteLength:2,components:1};case 1017:case 1018:return{byteLength:2,components:4};case 1014:case 1013:case 1015:return{byteLength:4,components:1};case 35902:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}function n0(n,e,t,i,s,r,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new he,h=new WeakMap;let u;const p=new WeakMap;let f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(L,T){return f?new OffscreenCanvas(L,T):cs("canvas")}function y(L,T,k){let $=1;const se=Me(L);if((se.width>k||se.height>k)&&($=k/Math.max(se.width,se.height)),$<1)if(typeof HTMLImageElement<"u"&&L instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&L instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&L instanceof ImageBitmap||typeof VideoFrame<"u"&&L instanceof VideoFrame){const te=Math.floor($*se.width),Re=Math.floor($*se.height);u===void 0&&(u=g(te,Re));const ve=T?g(te,Re):u;return ve.width=te,ve.height=Re,ve.getContext("2d").drawImage(L,0,0,te,Re),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+se.width+"x"+se.height+") to ("+te+"x"+Re+")."),ve}else return"data"in L&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+se.width+"x"+se.height+")."),L;return L}function m(L){return L.generateMipmaps}function d(L){n.generateMipmap(L)}function v(L){return L.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:L.isWebGL3DRenderTarget?n.TEXTURE_3D:L.isWebGLArrayRenderTarget||L.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function b(L,T,k,$,se=!1){if(L!==null){if(n[L]!==void 0)return n[L];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+L+"'")}let te=T;if(T===n.RED&&(k===n.FLOAT&&(te=n.R32F),k===n.HALF_FLOAT&&(te=n.R16F),k===n.UNSIGNED_BYTE&&(te=n.R8)),T===n.RED_INTEGER&&(k===n.UNSIGNED_BYTE&&(te=n.R8UI),k===n.UNSIGNED_SHORT&&(te=n.R16UI),k===n.UNSIGNED_INT&&(te=n.R32UI),k===n.BYTE&&(te=n.R8I),k===n.SHORT&&(te=n.R16I),k===n.INT&&(te=n.R32I)),T===n.RG&&(k===n.FLOAT&&(te=n.RG32F),k===n.HALF_FLOAT&&(te=n.RG16F),k===n.UNSIGNED_BYTE&&(te=n.RG8)),T===n.RG_INTEGER&&(k===n.UNSIGNED_BYTE&&(te=n.RG8UI),k===n.UNSIGNED_SHORT&&(te=n.RG16UI),k===n.UNSIGNED_INT&&(te=n.RG32UI),k===n.BYTE&&(te=n.RG8I),k===n.SHORT&&(te=n.RG16I),k===n.INT&&(te=n.RG32I)),T===n.RGB_INTEGER&&(k===n.UNSIGNED_BYTE&&(te=n.RGB8UI),k===n.UNSIGNED_SHORT&&(te=n.RGB16UI),k===n.UNSIGNED_INT&&(te=n.RGB32UI),k===n.BYTE&&(te=n.RGB8I),k===n.SHORT&&(te=n.RGB16I),k===n.INT&&(te=n.RGB32I)),T===n.RGBA_INTEGER&&(k===n.UNSIGNED_BYTE&&(te=n.RGBA8UI),k===n.UNSIGNED_SHORT&&(te=n.RGBA16UI),k===n.UNSIGNED_INT&&(te=n.RGBA32UI),k===n.BYTE&&(te=n.RGBA8I),k===n.SHORT&&(te=n.RGBA16I),k===n.INT&&(te=n.RGBA32I)),T===n.RGB&&k===n.UNSIGNED_INT_5_9_9_9_REV&&(te=n.RGB9_E5),T===n.RGBA){const Re=se?vr:Qe.getTransfer($);k===n.FLOAT&&(te=n.RGBA32F),k===n.HALF_FLOAT&&(te=n.RGBA16F),k===n.UNSIGNED_BYTE&&(te=Re===ht?n.SRGB8_ALPHA8:n.RGBA8),k===n.UNSIGNED_SHORT_4_4_4_4&&(te=n.RGBA4),k===n.UNSIGNED_SHORT_5_5_5_1&&(te=n.RGB5_A1)}return(te===n.R16F||te===n.R32F||te===n.RG16F||te===n.RG32F||te===n.RGBA16F||te===n.RGBA32F)&&e.get("EXT_color_buffer_float"),te}function _(L,T){let k;return L?T===null||T===1014||T===1020?k=n.DEPTH24_STENCIL8:T===1015?k=n.DEPTH32F_STENCIL8:T===1012&&(k=n.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):T===null||T===1014||T===1020?k=n.DEPTH_COMPONENT24:T===1015?k=n.DEPTH_COMPONENT32F:T===1012&&(k=n.DEPTH_COMPONENT16),k}function E(L,T){return m(L)===!0||L.isFramebufferTexture&&L.minFilter!==1003&&L.minFilter!==1006?Math.log2(Math.max(T.width,T.height))+1:L.mipmaps!==void 0&&L.mipmaps.length>0?L.mipmaps.length:L.isCompressedTexture&&Array.isArray(L.image)?T.mipmaps.length:1}function w(L){const T=L.target;T.removeEventListener("dispose",w),I(T),T.isVideoTexture&&h.delete(T)}function R(L){const T=L.target;T.removeEventListener("dispose",R),x(T)}function I(L){const T=i.get(L);if(T.__webglInit===void 0)return;const k=L.source,$=p.get(k);if($){const se=$[T.__cacheKey];se.usedTimes--,se.usedTimes===0&&S(L),Object.keys($).length===0&&p.delete(k)}i.remove(L)}function S(L){const T=i.get(L);n.deleteTexture(T.__webglTexture);const k=L.source,$=p.get(k);delete $[T.__cacheKey],o.memory.textures--}function x(L){const T=i.get(L);if(L.depthTexture&&(L.depthTexture.dispose(),i.remove(L.depthTexture)),L.isWebGLCubeRenderTarget)for(let $=0;$<6;$++){if(Array.isArray(T.__webglFramebuffer[$]))for(let se=0;se<T.__webglFramebuffer[$].length;se++)n.deleteFramebuffer(T.__webglFramebuffer[$][se]);else n.deleteFramebuffer(T.__webglFramebuffer[$]);T.__webglDepthbuffer&&n.deleteRenderbuffer(T.__webglDepthbuffer[$])}else{if(Array.isArray(T.__webglFramebuffer))for(let $=0;$<T.__webglFramebuffer.length;$++)n.deleteFramebuffer(T.__webglFramebuffer[$]);else n.deleteFramebuffer(T.__webglFramebuffer);if(T.__webglDepthbuffer&&n.deleteRenderbuffer(T.__webglDepthbuffer),T.__webglMultisampledFramebuffer&&n.deleteFramebuffer(T.__webglMultisampledFramebuffer),T.__webglColorRenderbuffer)for(let $=0;$<T.__webglColorRenderbuffer.length;$++)T.__webglColorRenderbuffer[$]&&n.deleteRenderbuffer(T.__webglColorRenderbuffer[$]);T.__webglDepthRenderbuffer&&n.deleteRenderbuffer(T.__webglDepthRenderbuffer)}const k=L.textures;for(let $=0,se=k.length;$<se;$++){const te=i.get(k[$]);te.__webglTexture&&(n.deleteTexture(te.__webglTexture),o.memory.textures--),i.remove(k[$])}i.remove(L)}let A=0;function O(){A=0}function U(){const L=A;return L>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+L+" texture units while this GPU supports only "+s.maxTextures),A+=1,L}function V(L){const T=[];return T.push(L.wrapS),T.push(L.wrapT),T.push(L.wrapR||0),T.push(L.magFilter),T.push(L.minFilter),T.push(L.anisotropy),T.push(L.internalFormat),T.push(L.format),T.push(L.type),T.push(L.generateMipmaps),T.push(L.premultiplyAlpha),T.push(L.flipY),T.push(L.unpackAlignment),T.push(L.colorSpace),T.join()}function F(L,T){const k=i.get(L);if(L.isVideoTexture&&pe(L),L.isRenderTargetTexture===!1&&L.version>0&&k.__version!==L.version){const $=L.image;if($===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if($.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{J(k,L,T);return}}t.bindTexture(n.TEXTURE_2D,k.__webglTexture,n.TEXTURE0+T)}function H(L,T){const k=i.get(L);if(L.version>0&&k.__version!==L.version){J(k,L,T);return}t.bindTexture(n.TEXTURE_2D_ARRAY,k.__webglTexture,n.TEXTURE0+T)}function Q(L,T){const k=i.get(L);if(L.version>0&&k.__version!==L.version){J(k,L,T);return}t.bindTexture(n.TEXTURE_3D,k.__webglTexture,n.TEXTURE0+T)}function Y(L,T){const k=i.get(L);if(L.version>0&&k.__version!==L.version){ue(k,L,T);return}t.bindTexture(n.TEXTURE_CUBE_MAP,k.__webglTexture,n.TEXTURE0+T)}const M={1e3:n.REPEAT,1001:n.CLAMP_TO_EDGE,1002:n.MIRRORED_REPEAT},N={1003:n.NEAREST,1004:n.NEAREST_MIPMAP_NEAREST,1005:n.NEAREST_MIPMAP_LINEAR,1006:n.LINEAR,1007:n.LINEAR_MIPMAP_NEAREST,1008:n.LINEAR_MIPMAP_LINEAR},Z={512:n.NEVER,519:n.ALWAYS,513:n.LESS,515:n.LEQUAL,514:n.EQUAL,518:n.GEQUAL,516:n.GREATER,517:n.NOTEQUAL};function ce(L,T){if(T.type===1015&&e.has("OES_texture_float_linear")===!1&&(T.magFilter===1006||T.magFilter===1007||T.magFilter===1005||T.magFilter===1008||T.minFilter===1006||T.minFilter===1007||T.minFilter===1005||T.minFilter===1008)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(L,n.TEXTURE_WRAP_S,M[T.wrapS]),n.texParameteri(L,n.TEXTURE_WRAP_T,M[T.wrapT]),(L===n.TEXTURE_3D||L===n.TEXTURE_2D_ARRAY)&&n.texParameteri(L,n.TEXTURE_WRAP_R,M[T.wrapR]),n.texParameteri(L,n.TEXTURE_MAG_FILTER,N[T.magFilter]),n.texParameteri(L,n.TEXTURE_MIN_FILTER,N[T.minFilter]),T.compareFunction&&(n.texParameteri(L,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(L,n.TEXTURE_COMPARE_FUNC,Z[T.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(T.magFilter===1003||T.minFilter!==1005&&T.minFilter!==1008||T.type===1015&&e.has("OES_texture_float_linear")===!1)return;if(T.anisotropy>1||i.get(T).__currentAnisotropy){const k=e.get("EXT_texture_filter_anisotropic");n.texParameterf(L,k.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(T.anisotropy,s.getMaxAnisotropy())),i.get(T).__currentAnisotropy=T.anisotropy}}}function Ce(L,T){let k=!1;L.__webglInit===void 0&&(L.__webglInit=!0,T.addEventListener("dispose",w));const $=T.source;let se=p.get($);se===void 0&&(se={},p.set($,se));const te=V(T);if(te!==L.__cacheKey){se[te]===void 0&&(se[te]={texture:n.createTexture(),usedTimes:0},o.memory.textures++,k=!0),se[te].usedTimes++;const Re=se[L.__cacheKey];Re!==void 0&&(se[L.__cacheKey].usedTimes--,Re.usedTimes===0&&S(T)),L.__cacheKey=te,L.__webglTexture=se[te].texture}return k}function J(L,T,k){let $=n.TEXTURE_2D;(T.isDataArrayTexture||T.isCompressedArrayTexture)&&($=n.TEXTURE_2D_ARRAY),T.isData3DTexture&&($=n.TEXTURE_3D);const se=Ce(L,T),te=T.source;t.bindTexture($,L.__webglTexture,n.TEXTURE0+k);const Re=i.get(te);if(te.version!==Re.__version||se===!0){t.activeTexture(n.TEXTURE0+k);const ve=Qe.getPrimaries(Qe.workingColorSpace),Te=T.colorSpace===""?null:Qe.getPrimaries(T.colorSpace),Ze=T.colorSpace===""||ve===Te?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,T.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,T.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Ze);let fe=y(T.image,!1,s.maxTextureSize);fe=De(T,fe);const Ee=r.convert(T.format,T.colorSpace),Oe=r.convert(T.type);let Be=b(T.internalFormat,Ee,Oe,T.colorSpace,T.isVideoTexture);ce($,T);let Ae;const $e=T.mipmaps,je=T.isVideoTexture!==!0,dt=Re.__version===void 0||se===!0,z=te.dataReady,be=E(T,fe);if(T.isDepthTexture)Be=_(T.format===1027,T.type),dt&&(je?t.texStorage2D(n.TEXTURE_2D,1,Be,fe.width,fe.height):t.texImage2D(n.TEXTURE_2D,0,Be,fe.width,fe.height,0,Ee,Oe,null));else if(T.isDataTexture)if($e.length>0){je&&dt&&t.texStorage2D(n.TEXTURE_2D,be,Be,$e[0].width,$e[0].height);for(let ie=0,ae=$e.length;ie<ae;ie++)Ae=$e[ie],je?z&&t.texSubImage2D(n.TEXTURE_2D,ie,0,0,Ae.width,Ae.height,Ee,Oe,Ae.data):t.texImage2D(n.TEXTURE_2D,ie,Be,Ae.width,Ae.height,0,Ee,Oe,Ae.data);T.generateMipmaps=!1}else je?(dt&&t.texStorage2D(n.TEXTURE_2D,be,Be,fe.width,fe.height),z&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,fe.width,fe.height,Ee,Oe,fe.data)):t.texImage2D(n.TEXTURE_2D,0,Be,fe.width,fe.height,0,Ee,Oe,fe.data);else if(T.isCompressedTexture)if(T.isCompressedArrayTexture){je&&dt&&t.texStorage3D(n.TEXTURE_2D_ARRAY,be,Be,$e[0].width,$e[0].height,fe.depth);for(let ie=0,ae=$e.length;ie<ae;ie++)if(Ae=$e[ie],T.format!==1023)if(Ee!==null)if(je){if(z)if(T.layerUpdates.size>0){const we=hl(Ae.width,Ae.height,T.format,T.type);for(const xe of T.layerUpdates){const Xe=Ae.data.subarray(xe*we/Ae.data.BYTES_PER_ELEMENT,(xe+1)*we/Ae.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,ie,0,0,xe,Ae.width,Ae.height,1,Ee,Xe)}T.clearLayerUpdates()}else t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,ie,0,0,0,Ae.width,Ae.height,fe.depth,Ee,Ae.data)}else t.compressedTexImage3D(n.TEXTURE_2D_ARRAY,ie,Be,Ae.width,Ae.height,fe.depth,0,Ae.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else je?z&&t.texSubImage3D(n.TEXTURE_2D_ARRAY,ie,0,0,0,Ae.width,Ae.height,fe.depth,Ee,Oe,Ae.data):t.texImage3D(n.TEXTURE_2D_ARRAY,ie,Be,Ae.width,Ae.height,fe.depth,0,Ee,Oe,Ae.data)}else{je&&dt&&t.texStorage2D(n.TEXTURE_2D,be,Be,$e[0].width,$e[0].height);for(let ie=0,ae=$e.length;ie<ae;ie++)Ae=$e[ie],T.format!==1023?Ee!==null?je?z&&t.compressedTexSubImage2D(n.TEXTURE_2D,ie,0,0,Ae.width,Ae.height,Ee,Ae.data):t.compressedTexImage2D(n.TEXTURE_2D,ie,Be,Ae.width,Ae.height,0,Ae.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):je?z&&t.texSubImage2D(n.TEXTURE_2D,ie,0,0,Ae.width,Ae.height,Ee,Oe,Ae.data):t.texImage2D(n.TEXTURE_2D,ie,Be,Ae.width,Ae.height,0,Ee,Oe,Ae.data)}else if(T.isDataArrayTexture)if(je){if(dt&&t.texStorage3D(n.TEXTURE_2D_ARRAY,be,Be,fe.width,fe.height,fe.depth),z)if(T.layerUpdates.size>0){const ie=hl(fe.width,fe.height,T.format,T.type);for(const ae of T.layerUpdates){const we=fe.data.subarray(ae*ie/fe.data.BYTES_PER_ELEMENT,(ae+1)*ie/fe.data.BYTES_PER_ELEMENT);t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,ae,fe.width,fe.height,1,Ee,Oe,we)}T.clearLayerUpdates()}else t.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,fe.width,fe.height,fe.depth,Ee,Oe,fe.data)}else t.texImage3D(n.TEXTURE_2D_ARRAY,0,Be,fe.width,fe.height,fe.depth,0,Ee,Oe,fe.data);else if(T.isData3DTexture)je?(dt&&t.texStorage3D(n.TEXTURE_3D,be,Be,fe.width,fe.height,fe.depth),z&&t.texSubImage3D(n.TEXTURE_3D,0,0,0,0,fe.width,fe.height,fe.depth,Ee,Oe,fe.data)):t.texImage3D(n.TEXTURE_3D,0,Be,fe.width,fe.height,fe.depth,0,Ee,Oe,fe.data);else if(T.isFramebufferTexture){if(dt)if(je)t.texStorage2D(n.TEXTURE_2D,be,Be,fe.width,fe.height);else{let ie=fe.width,ae=fe.height;for(let we=0;we<be;we++)t.texImage2D(n.TEXTURE_2D,we,Be,ie,ae,0,Ee,Oe,null),ie>>=1,ae>>=1}}else if($e.length>0){if(je&&dt){const ie=Me($e[0]);t.texStorage2D(n.TEXTURE_2D,be,Be,ie.width,ie.height)}for(let ie=0,ae=$e.length;ie<ae;ie++)Ae=$e[ie],je?z&&t.texSubImage2D(n.TEXTURE_2D,ie,0,0,Ee,Oe,Ae):t.texImage2D(n.TEXTURE_2D,ie,Be,Ee,Oe,Ae);T.generateMipmaps=!1}else if(je){if(dt){const ie=Me(fe);t.texStorage2D(n.TEXTURE_2D,be,Be,ie.width,ie.height)}z&&t.texSubImage2D(n.TEXTURE_2D,0,0,0,Ee,Oe,fe)}else t.texImage2D(n.TEXTURE_2D,0,Be,Ee,Oe,fe);m(T)&&d($),Re.__version=te.version,T.onUpdate&&T.onUpdate(T)}L.__version=T.version}function ue(L,T,k){if(T.image.length!==6)return;const $=Ce(L,T),se=T.source;t.bindTexture(n.TEXTURE_CUBE_MAP,L.__webglTexture,n.TEXTURE0+k);const te=i.get(se);if(se.version!==te.__version||$===!0){t.activeTexture(n.TEXTURE0+k);const Re=Qe.getPrimaries(Qe.workingColorSpace),ve=T.colorSpace===""?null:Qe.getPrimaries(T.colorSpace),Te=T.colorSpace===""||Re===ve?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,T.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,T.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,Te);const Ze=T.isCompressedTexture||T.image[0].isCompressedTexture,fe=T.image[0]&&T.image[0].isDataTexture,Ee=[];for(let ae=0;ae<6;ae++)!Ze&&!fe?Ee[ae]=y(T.image[ae],!0,s.maxCubemapSize):Ee[ae]=fe?T.image[ae].image:T.image[ae],Ee[ae]=De(T,Ee[ae]);const Oe=Ee[0],Be=r.convert(T.format,T.colorSpace),Ae=r.convert(T.type),$e=b(T.internalFormat,Be,Ae,T.colorSpace),je=T.isVideoTexture!==!0,dt=te.__version===void 0||$===!0,z=se.dataReady;let be=E(T,Oe);ce(n.TEXTURE_CUBE_MAP,T);let ie;if(Ze){je&&dt&&t.texStorage2D(n.TEXTURE_CUBE_MAP,be,$e,Oe.width,Oe.height);for(let ae=0;ae<6;ae++){ie=Ee[ae].mipmaps;for(let we=0;we<ie.length;we++){const xe=ie[we];T.format!==1023?Be!==null?je?z&&t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ae,we,0,0,xe.width,xe.height,Be,xe.data):t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ae,we,$e,xe.width,xe.height,0,xe.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):je?z&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ae,we,0,0,xe.width,xe.height,Be,Ae,xe.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ae,we,$e,xe.width,xe.height,0,Be,Ae,xe.data)}}}else{if(ie=T.mipmaps,je&&dt){ie.length>0&&be++;const ae=Me(Ee[0]);t.texStorage2D(n.TEXTURE_CUBE_MAP,be,$e,ae.width,ae.height)}for(let ae=0;ae<6;ae++)if(fe){je?z&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,0,0,Ee[ae].width,Ee[ae].height,Be,Ae,Ee[ae].data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,$e,Ee[ae].width,Ee[ae].height,0,Be,Ae,Ee[ae].data);for(let we=0;we<ie.length;we++){const Xe=ie[we].image[ae].image;je?z&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ae,we+1,0,0,Xe.width,Xe.height,Be,Ae,Xe.data):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ae,we+1,$e,Xe.width,Xe.height,0,Be,Ae,Xe.data)}}else{je?z&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,0,0,Be,Ae,Ee[ae]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,$e,Be,Ae,Ee[ae]);for(let we=0;we<ie.length;we++){const xe=ie[we];je?z&&t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ae,we+1,0,0,Be,Ae,xe.image[ae]):t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+ae,we+1,$e,Be,Ae,xe.image[ae])}}}m(T)&&d(n.TEXTURE_CUBE_MAP),te.__version=se.version,T.onUpdate&&T.onUpdate(T)}L.__version=T.version}function oe(L,T,k,$,se,te){const Re=r.convert(k.format,k.colorSpace),ve=r.convert(k.type),Te=b(k.internalFormat,Re,ve,k.colorSpace),Ze=i.get(T),fe=i.get(k);if(fe.__renderTarget=T,!Ze.__hasExternalTextures){const Ee=Math.max(1,T.width>>te),Oe=Math.max(1,T.height>>te);se===n.TEXTURE_3D||se===n.TEXTURE_2D_ARRAY?t.texImage3D(se,te,Te,Ee,Oe,T.depth,0,Re,ve,null):t.texImage2D(se,te,Te,Ee,Oe,0,Re,ve,null)}t.bindFramebuffer(n.FRAMEBUFFER,L),ye(T)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,$,se,fe.__webglTexture,0,le(T)):(se===n.TEXTURE_2D||se>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&se<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,$,se,fe.__webglTexture,te),t.bindFramebuffer(n.FRAMEBUFFER,null)}function X(L,T,k){if(n.bindRenderbuffer(n.RENDERBUFFER,L),T.depthBuffer){const $=T.depthTexture,se=$&&$.isDepthTexture?$.type:null,te=_(T.stencilBuffer,se),Re=T.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ve=le(T);ye(T)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,ve,te,T.width,T.height):k?n.renderbufferStorageMultisample(n.RENDERBUFFER,ve,te,T.width,T.height):n.renderbufferStorage(n.RENDERBUFFER,te,T.width,T.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,Re,n.RENDERBUFFER,L)}else{const $=T.textures;for(let se=0;se<$.length;se++){const te=$[se],Re=r.convert(te.format,te.colorSpace),ve=r.convert(te.type),Te=b(te.internalFormat,Re,ve,te.colorSpace),Ze=le(T);k&&ye(T)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,Ze,Te,T.width,T.height):ye(T)?a.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,Ze,Te,T.width,T.height):n.renderbufferStorage(n.RENDERBUFFER,Te,T.width,T.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function ne(L,T){if(T&&T.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(n.FRAMEBUFFER,L),!(T.depthTexture&&T.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const $=i.get(T.depthTexture);$.__renderTarget=T,(!$.__webglTexture||T.depthTexture.image.width!==T.width||T.depthTexture.image.height!==T.height)&&(T.depthTexture.image.width=T.width,T.depthTexture.image.height=T.height,T.depthTexture.needsUpdate=!0),F(T.depthTexture,0);const se=$.__webglTexture,te=le(T);if(T.depthTexture.format===1026)ye(T)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,se,0,te):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,se,0);else if(T.depthTexture.format===1027)ye(T)?a.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,se,0,te):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,se,0);else throw new Error("Unknown depthTexture format")}function ge(L){const T=i.get(L),k=L.isWebGLCubeRenderTarget===!0;if(T.__boundDepthTexture!==L.depthTexture){const $=L.depthTexture;if(T.__depthDisposeCallback&&T.__depthDisposeCallback(),$){const se=()=>{delete T.__boundDepthTexture,delete T.__depthDisposeCallback,$.removeEventListener("dispose",se)};$.addEventListener("dispose",se),T.__depthDisposeCallback=se}T.__boundDepthTexture=$}if(L.depthTexture&&!T.__autoAllocateDepthBuffer){if(k)throw new Error("target.depthTexture not supported in Cube render targets");ne(T.__webglFramebuffer,L)}else if(k){T.__webglDepthbuffer=[];for(let $=0;$<6;$++)if(t.bindFramebuffer(n.FRAMEBUFFER,T.__webglFramebuffer[$]),T.__webglDepthbuffer[$]===void 0)T.__webglDepthbuffer[$]=n.createRenderbuffer(),X(T.__webglDepthbuffer[$],L,!1);else{const se=L.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,te=T.__webglDepthbuffer[$];n.bindRenderbuffer(n.RENDERBUFFER,te),n.framebufferRenderbuffer(n.FRAMEBUFFER,se,n.RENDERBUFFER,te)}}else if(t.bindFramebuffer(n.FRAMEBUFFER,T.__webglFramebuffer),T.__webglDepthbuffer===void 0)T.__webglDepthbuffer=n.createRenderbuffer(),X(T.__webglDepthbuffer,L,!1);else{const $=L.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,se=T.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,se),n.framebufferRenderbuffer(n.FRAMEBUFFER,$,n.RENDERBUFFER,se)}t.bindFramebuffer(n.FRAMEBUFFER,null)}function ee(L,T,k){const $=i.get(L);T!==void 0&&oe($.__webglFramebuffer,L,L.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),k!==void 0&&ge(L)}function B(L){const T=L.texture,k=i.get(L),$=i.get(T);L.addEventListener("dispose",R);const se=L.textures,te=L.isWebGLCubeRenderTarget===!0,Re=se.length>1;if(Re||($.__webglTexture===void 0&&($.__webglTexture=n.createTexture()),$.__version=T.version,o.memory.textures++),te){k.__webglFramebuffer=[];for(let ve=0;ve<6;ve++)if(T.mipmaps&&T.mipmaps.length>0){k.__webglFramebuffer[ve]=[];for(let Te=0;Te<T.mipmaps.length;Te++)k.__webglFramebuffer[ve][Te]=n.createFramebuffer()}else k.__webglFramebuffer[ve]=n.createFramebuffer()}else{if(T.mipmaps&&T.mipmaps.length>0){k.__webglFramebuffer=[];for(let ve=0;ve<T.mipmaps.length;ve++)k.__webglFramebuffer[ve]=n.createFramebuffer()}else k.__webglFramebuffer=n.createFramebuffer();if(Re)for(let ve=0,Te=se.length;ve<Te;ve++){const Ze=i.get(se[ve]);Ze.__webglTexture===void 0&&(Ze.__webglTexture=n.createTexture(),o.memory.textures++)}if(L.samples>0&&ye(L)===!1){k.__webglMultisampledFramebuffer=n.createFramebuffer(),k.__webglColorRenderbuffer=[],t.bindFramebuffer(n.FRAMEBUFFER,k.__webglMultisampledFramebuffer);for(let ve=0;ve<se.length;ve++){const Te=se[ve];k.__webglColorRenderbuffer[ve]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,k.__webglColorRenderbuffer[ve]);const Ze=r.convert(Te.format,Te.colorSpace),fe=r.convert(Te.type),Ee=b(Te.internalFormat,Ze,fe,Te.colorSpace,L.isXRRenderTarget===!0),Oe=le(L);n.renderbufferStorageMultisample(n.RENDERBUFFER,Oe,Ee,L.width,L.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ve,n.RENDERBUFFER,k.__webglColorRenderbuffer[ve])}n.bindRenderbuffer(n.RENDERBUFFER,null),L.depthBuffer&&(k.__webglDepthRenderbuffer=n.createRenderbuffer(),X(k.__webglDepthRenderbuffer,L,!0)),t.bindFramebuffer(n.FRAMEBUFFER,null)}}if(te){t.bindTexture(n.TEXTURE_CUBE_MAP,$.__webglTexture),ce(n.TEXTURE_CUBE_MAP,T);for(let ve=0;ve<6;ve++)if(T.mipmaps&&T.mipmaps.length>0)for(let Te=0;Te<T.mipmaps.length;Te++)oe(k.__webglFramebuffer[ve][Te],L,T,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ve,Te);else oe(k.__webglFramebuffer[ve],L,T,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+ve,0);m(T)&&d(n.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Re){for(let ve=0,Te=se.length;ve<Te;ve++){const Ze=se[ve],fe=i.get(Ze);t.bindTexture(n.TEXTURE_2D,fe.__webglTexture),ce(n.TEXTURE_2D,Ze),oe(k.__webglFramebuffer,L,Ze,n.COLOR_ATTACHMENT0+ve,n.TEXTURE_2D,0),m(Ze)&&d(n.TEXTURE_2D)}t.unbindTexture()}else{let ve=n.TEXTURE_2D;if((L.isWebGL3DRenderTarget||L.isWebGLArrayRenderTarget)&&(ve=L.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),t.bindTexture(ve,$.__webglTexture),ce(ve,T),T.mipmaps&&T.mipmaps.length>0)for(let Te=0;Te<T.mipmaps.length;Te++)oe(k.__webglFramebuffer[Te],L,T,n.COLOR_ATTACHMENT0,ve,Te);else oe(k.__webglFramebuffer,L,T,n.COLOR_ATTACHMENT0,ve,0);m(T)&&d(ve),t.unbindTexture()}L.depthBuffer&&ge(L)}function q(L){const T=L.textures;for(let k=0,$=T.length;k<$;k++){const se=T[k];if(m(se)){const te=v(L),Re=i.get(se).__webglTexture;t.bindTexture(te,Re),d(te),t.unbindTexture()}}}const re=[],D=[];function de(L){if(L.samples>0){if(ye(L)===!1){const T=L.textures,k=L.width,$=L.height;let se=n.COLOR_BUFFER_BIT;const te=L.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Re=i.get(L),ve=T.length>1;if(ve)for(let Te=0;Te<T.length;Te++)t.bindFramebuffer(n.FRAMEBUFFER,Re.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Te,n.RENDERBUFFER,null),t.bindFramebuffer(n.FRAMEBUFFER,Re.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Te,n.TEXTURE_2D,null,0);t.bindFramebuffer(n.READ_FRAMEBUFFER,Re.__webglMultisampledFramebuffer),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Re.__webglFramebuffer);for(let Te=0;Te<T.length;Te++){if(L.resolveDepthBuffer&&(L.depthBuffer&&(se|=n.DEPTH_BUFFER_BIT),L.stencilBuffer&&L.resolveStencilBuffer&&(se|=n.STENCIL_BUFFER_BIT)),ve){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,Re.__webglColorRenderbuffer[Te]);const Ze=i.get(T[Te]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,Ze,0)}n.blitFramebuffer(0,0,k,$,0,0,k,$,se,n.NEAREST),l===!0&&(re.length=0,D.length=0,re.push(n.COLOR_ATTACHMENT0+Te),L.depthBuffer&&L.resolveDepthBuffer===!1&&(re.push(te),D.push(te),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,D)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,re))}if(t.bindFramebuffer(n.READ_FRAMEBUFFER,null),t.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),ve)for(let Te=0;Te<T.length;Te++){t.bindFramebuffer(n.FRAMEBUFFER,Re.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Te,n.RENDERBUFFER,Re.__webglColorRenderbuffer[Te]);const Ze=i.get(T[Te]).__webglTexture;t.bindFramebuffer(n.FRAMEBUFFER,Re.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+Te,n.TEXTURE_2D,Ze,0)}t.bindFramebuffer(n.DRAW_FRAMEBUFFER,Re.__webglMultisampledFramebuffer)}else if(L.depthBuffer&&L.resolveDepthBuffer===!1&&l){const T=L.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[T])}}}function le(L){return Math.min(s.maxSamples,L.samples)}function ye(L){const T=i.get(L);return L.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&T.__useRenderToTexture!==!1}function pe(L){const T=o.render.frame;h.get(L)!==T&&(h.set(L,T),L.update())}function De(L,T){const k=L.colorSpace,$=L.format,se=L.type;return L.isCompressedTexture===!0||L.isVideoTexture===!0||k!==Ni&&k!==""&&(Qe.getTransfer(k)===ht?($!==1023||se!==1009)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",k)),T}function Me(L){return typeof HTMLImageElement<"u"&&L instanceof HTMLImageElement?(c.width=L.naturalWidth||L.width,c.height=L.naturalHeight||L.height):typeof VideoFrame<"u"&&L instanceof VideoFrame?(c.width=L.displayWidth,c.height=L.displayHeight):(c.width=L.width,c.height=L.height),c}this.allocateTextureUnit=U,this.resetTextureUnits=O,this.setTexture2D=F,this.setTexture2DArray=H,this.setTexture3D=Q,this.setTextureCube=Y,this.rebindTextures=ee,this.setupRenderTarget=B,this.updateRenderTargetMipmap=q,this.updateMultisampleRenderTarget=de,this.setupDepthRenderbuffer=ge,this.setupFrameBufferTexture=oe,this.useMultisampledRTT=ye}function i0(n,e){function t(i,s=""){let r;const o=Qe.getTransfer(s);if(i===1009)return n.UNSIGNED_BYTE;if(i===1017)return n.UNSIGNED_SHORT_4_4_4_4;if(i===1018)return n.UNSIGNED_SHORT_5_5_5_1;if(i===35902)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===1010)return n.BYTE;if(i===1011)return n.SHORT;if(i===1012)return n.UNSIGNED_SHORT;if(i===1013)return n.INT;if(i===1014)return n.UNSIGNED_INT;if(i===1015)return n.FLOAT;if(i===1016)return n.HALF_FLOAT;if(i===1021)return n.ALPHA;if(i===1022)return n.RGB;if(i===1023)return n.RGBA;if(i===1024)return n.LUMINANCE;if(i===1025)return n.LUMINANCE_ALPHA;if(i===1026)return n.DEPTH_COMPONENT;if(i===1027)return n.DEPTH_STENCIL;if(i===1028)return n.RED;if(i===1029)return n.RED_INTEGER;if(i===1030)return n.RG;if(i===1031)return n.RG_INTEGER;if(i===1033)return n.RGBA_INTEGER;if(i===33776||i===33777||i===33778||i===33779)if(o===ht)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===33776)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===33777)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===33778)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===33779)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===33776)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===33777)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===33778)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===33779)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===35840||i===35841||i===35842||i===35843)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===35840)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===35841)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===35842)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===35843)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===36196||i===37492||i===37496)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(i===36196||i===37492)return o===ht?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===37496)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===37808||i===37809||i===37810||i===37811||i===37812||i===37813||i===37814||i===37815||i===37816||i===37817||i===37818||i===37819||i===37820||i===37821)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(i===37808)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===37809)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===37810)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===37811)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===37812)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===37813)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===37814)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===37815)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===37816)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===37817)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===37818)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===37819)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===37820)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===37821)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===36492||i===36494||i===36495)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(i===36492)return o===ht?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===36494)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===36495)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===36283||i===36284||i===36285||i===36286)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(i===36492)return r.COMPRESSED_RED_RGTC1_EXT;if(i===36284)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===36285)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===36286)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===1020?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:t}}class s0 extends Wt{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}class Xt extends vt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const r0={type:"move"};class io{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Xt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Xt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Xt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const i of e.hand.values())this._getHandJoint(t,i)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,i){let s=null,r=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(const y of e.hand.values()){const m=t.getJointPose(y,i),d=this._getHandJoint(c,y);m!==null&&(d.matrix.fromArray(m.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=m.radius),d.visible=m!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],p=h.position.distanceTo(u.position),f=.02,g=.005;c.inputState.pinching&&p>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&p<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=t.getPose(e.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(r0)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const i=new Xt;i.matrixAutoUpdate=!1,i.visible=!1,e.joints[t.jointName]=i,e.add(i)}return e.joints[t.jointName]}}const o0=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,a0=`
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

}`;class l0{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t,i){if(this.texture===null){const s=new Pt,r=e.properties.get(s);r.__webglTexture=t.texture,(t.depthNear!=i.depthNear||t.depthFar!=i.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=s}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,i=new Un({vertexShader:o0,fragmentShader:a0,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new ut(new ps(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class c0 extends ti{constructor(e,t){super();const i=this;let s=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,p=null,f=null,g=null;const y=new l0,m=t.getContextAttributes();let d=null,v=null;const b=[],_=[],E=new he;let w=null;const R=new Wt;R.viewport=new tt;const I=new Wt;I.viewport=new tt;const S=[R,I],x=new s0;let A=null,O=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(J){let ue=b[J];return ue===void 0&&(ue=new io,b[J]=ue),ue.getTargetRaySpace()},this.getControllerGrip=function(J){let ue=b[J];return ue===void 0&&(ue=new io,b[J]=ue),ue.getGripSpace()},this.getHand=function(J){let ue=b[J];return ue===void 0&&(ue=new io,b[J]=ue),ue.getHandSpace()};function U(J){const ue=_.indexOf(J.inputSource);if(ue===-1)return;const oe=b[ue];oe!==void 0&&(oe.update(J.inputSource,J.frame,c||o),oe.dispatchEvent({type:J.type,data:J.inputSource}))}function V(){s.removeEventListener("select",U),s.removeEventListener("selectstart",U),s.removeEventListener("selectend",U),s.removeEventListener("squeeze",U),s.removeEventListener("squeezestart",U),s.removeEventListener("squeezeend",U),s.removeEventListener("end",V),s.removeEventListener("inputsourceschange",F);for(let J=0;J<b.length;J++){const ue=_[J];ue!==null&&(_[J]=null,b[J].disconnect(ue))}A=null,O=null,y.reset(),e.setRenderTarget(d),f=null,p=null,u=null,s=null,v=null,Ce.stop(),i.isPresenting=!1,e.setPixelRatio(w),e.setSize(E.width,E.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(J){r=J,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(J){a=J,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(J){c=J},this.getBaseLayer=function(){return p!==null?p:f},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(J){if(s=J,s!==null){if(d=e.getRenderTarget(),s.addEventListener("select",U),s.addEventListener("selectstart",U),s.addEventListener("selectend",U),s.addEventListener("squeeze",U),s.addEventListener("squeezestart",U),s.addEventListener("squeezeend",U),s.addEventListener("end",V),s.addEventListener("inputsourceschange",F),m.xrCompatible!==!0&&await t.makeXRCompatible(),w=e.getPixelRatio(),e.getSize(E),s.renderState.layers===void 0){const ue={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,ue),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),v=new Qn(f.framebufferWidth,f.framebufferHeight,{format:1023,type:1009,colorSpace:e.outputColorSpace,stencilBuffer:m.stencil})}else{let ue=null,oe=null,X=null;m.depth&&(X=m.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ue=m.stencil?1027:1026,oe=m.stencil?1020:1014);const ne={colorFormat:t.RGBA8,depthFormat:X,scaleFactor:r};u=new XRWebGLBinding(s,t),p=u.createProjectionLayer(ne),s.updateRenderState({layers:[p]}),e.setPixelRatio(1),e.setSize(p.textureWidth,p.textureHeight,!1),v=new Qn(p.textureWidth,p.textureHeight,{format:1023,type:1009,depthTexture:new Sc(p.textureWidth,p.textureHeight,oe,void 0,void 0,void 0,void 0,void 0,void 0,ue),stencilBuffer:m.stencil,colorSpace:e.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:p.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),Ce.setContext(s),Ce.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return y.getDepthTexture()};function F(J){for(let ue=0;ue<J.removed.length;ue++){const oe=J.removed[ue],X=_.indexOf(oe);X>=0&&(_[X]=null,b[X].disconnect(oe))}for(let ue=0;ue<J.added.length;ue++){const oe=J.added[ue];let X=_.indexOf(oe);if(X===-1){for(let ge=0;ge<b.length;ge++)if(ge>=_.length){_.push(oe),X=ge;break}else if(_[ge]===null){_[ge]=oe,X=ge;break}if(X===-1)break}const ne=b[X];ne&&ne.connect(oe)}}const H=new P,Q=new P;function Y(J,ue,oe){H.setFromMatrixPosition(ue.matrixWorld),Q.setFromMatrixPosition(oe.matrixWorld);const X=H.distanceTo(Q),ne=ue.projectionMatrix.elements,ge=oe.projectionMatrix.elements,ee=ne[14]/(ne[10]-1),B=ne[14]/(ne[10]+1),q=(ne[9]+1)/ne[5],re=(ne[9]-1)/ne[5],D=(ne[8]-1)/ne[0],de=(ge[8]+1)/ge[0],le=ee*D,ye=ee*de,pe=X/(-D+de),De=pe*-D;if(ue.matrixWorld.decompose(J.position,J.quaternion,J.scale),J.translateX(De),J.translateZ(pe),J.matrixWorld.compose(J.position,J.quaternion,J.scale),J.matrixWorldInverse.copy(J.matrixWorld).invert(),ne[10]===-1)J.projectionMatrix.copy(ue.projectionMatrix),J.projectionMatrixInverse.copy(ue.projectionMatrixInverse);else{const Me=ee+pe,L=B+pe,T=le-De,k=ye+(X-De),$=q*B/L*Me,se=re*B/L*Me;J.projectionMatrix.makePerspective(T,k,$,se,Me,L),J.projectionMatrixInverse.copy(J.projectionMatrix).invert()}}function M(J,ue){ue===null?J.matrixWorld.copy(J.matrix):J.matrixWorld.multiplyMatrices(ue.matrixWorld,J.matrix),J.matrixWorldInverse.copy(J.matrixWorld).invert()}this.updateCamera=function(J){if(s===null)return;let ue=J.near,oe=J.far;y.texture!==null&&(y.depthNear>0&&(ue=y.depthNear),y.depthFar>0&&(oe=y.depthFar)),x.near=I.near=R.near=ue,x.far=I.far=R.far=oe,(A!==x.near||O!==x.far)&&(s.updateRenderState({depthNear:x.near,depthFar:x.far}),A=x.near,O=x.far),R.layers.mask=J.layers.mask|2,I.layers.mask=J.layers.mask|4,x.layers.mask=R.layers.mask|I.layers.mask;const X=J.parent,ne=x.cameras;M(x,X);for(let ge=0;ge<ne.length;ge++)M(ne[ge],X);ne.length===2?Y(x,R,I):x.projectionMatrix.copy(R.projectionMatrix),N(J,x,X)};function N(J,ue,oe){oe===null?J.matrix.copy(ue.matrixWorld):(J.matrix.copy(oe.matrixWorld),J.matrix.invert(),J.matrix.multiply(ue.matrixWorld)),J.matrix.decompose(J.position,J.quaternion,J.scale),J.updateMatrixWorld(!0),J.projectionMatrix.copy(ue.projectionMatrix),J.projectionMatrixInverse.copy(ue.projectionMatrixInverse),J.isPerspectiveCamera&&(J.fov=Pi*2*Math.atan(1/J.projectionMatrix.elements[5]),J.zoom=1)}this.getCamera=function(){return x},this.getFoveation=function(){if(!(p===null&&f===null))return l},this.setFoveation=function(J){l=J,p!==null&&(p.fixedFoveation=J),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=J)},this.hasDepthSensing=function(){return y.texture!==null},this.getDepthSensingMesh=function(){return y.getMesh(x)};let Z=null;function ce(J,ue){if(h=ue.getViewerPose(c||o),g=ue,h!==null){const oe=h.views;f!==null&&(e.setRenderTargetFramebuffer(v,f.framebuffer),e.setRenderTarget(v));let X=!1;oe.length!==x.cameras.length&&(x.cameras.length=0,X=!0);for(let ge=0;ge<oe.length;ge++){const ee=oe[ge];let B=null;if(f!==null)B=f.getViewport(ee);else{const re=u.getViewSubImage(p,ee);B=re.viewport,ge===0&&(e.setRenderTargetTextures(v,re.colorTexture,p.ignoreDepthValues?void 0:re.depthStencilTexture),e.setRenderTarget(v))}let q=S[ge];q===void 0&&(q=new Wt,q.layers.enable(ge),q.viewport=new tt,S[ge]=q),q.matrix.fromArray(ee.transform.matrix),q.matrix.decompose(q.position,q.quaternion,q.scale),q.projectionMatrix.fromArray(ee.projectionMatrix),q.projectionMatrixInverse.copy(q.projectionMatrix).invert(),q.viewport.set(B.x,B.y,B.width,B.height),ge===0&&(x.matrix.copy(q.matrix),x.matrix.decompose(x.position,x.quaternion,x.scale)),X===!0&&x.cameras.push(q)}const ne=s.enabledFeatures;if(ne&&ne.includes("depth-sensing")){const ge=u.getDepthInformation(oe[0]);ge&&ge.isValid&&ge.texture&&y.init(e,ge,s.renderState)}}for(let oe=0;oe<b.length;oe++){const X=_[oe],ne=b[oe];X!==null&&ne!==void 0&&ne.update(X,ue,c||o)}Z&&Z(J,ue),ue.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:ue}),g=null}const Ce=new Mc;Ce.setAnimationLoop(ce),this.setAnimationLoop=function(J){Z=J},this.dispose=function(){}}}const Xn=new rn,h0=new He;function u0(n,e){function t(m,d){m.matrixAutoUpdate===!0&&m.updateMatrix(),d.value.copy(m.matrix)}function i(m,d){d.color.getRGB(m.fogColor.value,yc(n)),d.isFog?(m.fogNear.value=d.near,m.fogFar.value=d.far):d.isFogExp2&&(m.fogDensity.value=d.density)}function s(m,d,v,b,_){d.isMeshBasicMaterial||d.isMeshLambertMaterial?r(m,d):d.isMeshToonMaterial?(r(m,d),u(m,d)):d.isMeshPhongMaterial?(r(m,d),h(m,d)):d.isMeshStandardMaterial?(r(m,d),p(m,d),d.isMeshPhysicalMaterial&&f(m,d,_)):d.isMeshMatcapMaterial?(r(m,d),g(m,d)):d.isMeshDepthMaterial?r(m,d):d.isMeshDistanceMaterial?(r(m,d),y(m,d)):d.isMeshNormalMaterial?r(m,d):d.isLineBasicMaterial?(o(m,d),d.isLineDashedMaterial&&a(m,d)):d.isPointsMaterial?l(m,d,v,b):d.isSpriteMaterial?c(m,d):d.isShadowMaterial?(m.color.value.copy(d.color),m.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function r(m,d){m.opacity.value=d.opacity,d.color&&m.diffuse.value.copy(d.color),d.emissive&&m.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(m.map.value=d.map,t(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.bumpMap&&(m.bumpMap.value=d.bumpMap,t(d.bumpMap,m.bumpMapTransform),m.bumpScale.value=d.bumpScale,d.side===1&&(m.bumpScale.value*=-1)),d.normalMap&&(m.normalMap.value=d.normalMap,t(d.normalMap,m.normalMapTransform),m.normalScale.value.copy(d.normalScale),d.side===1&&m.normalScale.value.negate()),d.displacementMap&&(m.displacementMap.value=d.displacementMap,t(d.displacementMap,m.displacementMapTransform),m.displacementScale.value=d.displacementScale,m.displacementBias.value=d.displacementBias),d.emissiveMap&&(m.emissiveMap.value=d.emissiveMap,t(d.emissiveMap,m.emissiveMapTransform)),d.specularMap&&(m.specularMap.value=d.specularMap,t(d.specularMap,m.specularMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest);const v=e.get(d),b=v.envMap,_=v.envMapRotation;b&&(m.envMap.value=b,Xn.copy(_),Xn.x*=-1,Xn.y*=-1,Xn.z*=-1,b.isCubeTexture&&b.isRenderTargetTexture===!1&&(Xn.y*=-1,Xn.z*=-1),m.envMapRotation.value.setFromMatrix4(h0.makeRotationFromEuler(Xn)),m.flipEnvMap.value=b.isCubeTexture&&b.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=d.reflectivity,m.ior.value=d.ior,m.refractionRatio.value=d.refractionRatio),d.lightMap&&(m.lightMap.value=d.lightMap,m.lightMapIntensity.value=d.lightMapIntensity,t(d.lightMap,m.lightMapTransform)),d.aoMap&&(m.aoMap.value=d.aoMap,m.aoMapIntensity.value=d.aoMapIntensity,t(d.aoMap,m.aoMapTransform))}function o(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,d.map&&(m.map.value=d.map,t(d.map,m.mapTransform))}function a(m,d){m.dashSize.value=d.dashSize,m.totalSize.value=d.dashSize+d.gapSize,m.scale.value=d.scale}function l(m,d,v,b){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.size.value=d.size*v,m.scale.value=b*.5,d.map&&(m.map.value=d.map,t(d.map,m.uvTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function c(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.rotation.value=d.rotation,d.map&&(m.map.value=d.map,t(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function h(m,d){m.specular.value.copy(d.specular),m.shininess.value=Math.max(d.shininess,1e-4)}function u(m,d){d.gradientMap&&(m.gradientMap.value=d.gradientMap)}function p(m,d){m.metalness.value=d.metalness,d.metalnessMap&&(m.metalnessMap.value=d.metalnessMap,t(d.metalnessMap,m.metalnessMapTransform)),m.roughness.value=d.roughness,d.roughnessMap&&(m.roughnessMap.value=d.roughnessMap,t(d.roughnessMap,m.roughnessMapTransform)),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)}function f(m,d,v){m.ior.value=d.ior,d.sheen>0&&(m.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),m.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(m.sheenColorMap.value=d.sheenColorMap,t(d.sheenColorMap,m.sheenColorMapTransform)),d.sheenRoughnessMap&&(m.sheenRoughnessMap.value=d.sheenRoughnessMap,t(d.sheenRoughnessMap,m.sheenRoughnessMapTransform))),d.clearcoat>0&&(m.clearcoat.value=d.clearcoat,m.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(m.clearcoatMap.value=d.clearcoatMap,t(d.clearcoatMap,m.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,t(d.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(m.clearcoatNormalMap.value=d.clearcoatNormalMap,t(d.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===1&&m.clearcoatNormalScale.value.negate())),d.dispersion>0&&(m.dispersion.value=d.dispersion),d.iridescence>0&&(m.iridescence.value=d.iridescence,m.iridescenceIOR.value=d.iridescenceIOR,m.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(m.iridescenceMap.value=d.iridescenceMap,t(d.iridescenceMap,m.iridescenceMapTransform)),d.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=d.iridescenceThicknessMap,t(d.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),d.transmission>0&&(m.transmission.value=d.transmission,m.transmissionSamplerMap.value=v.texture,m.transmissionSamplerSize.value.set(v.width,v.height),d.transmissionMap&&(m.transmissionMap.value=d.transmissionMap,t(d.transmissionMap,m.transmissionMapTransform)),m.thickness.value=d.thickness,d.thicknessMap&&(m.thicknessMap.value=d.thicknessMap,t(d.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=d.attenuationDistance,m.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(m.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(m.anisotropyMap.value=d.anisotropyMap,t(d.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=d.specularIntensity,m.specularColor.value.copy(d.specularColor),d.specularColorMap&&(m.specularColorMap.value=d.specularColorMap,t(d.specularColorMap,m.specularColorMapTransform)),d.specularIntensityMap&&(m.specularIntensityMap.value=d.specularIntensityMap,t(d.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,d){d.matcap&&(m.matcap.value=d.matcap)}function y(m,d){const v=e.get(d).light;m.referencePosition.value.setFromMatrixPosition(v.matrixWorld),m.nearDistance.value=v.shadow.camera.near,m.farDistance.value=v.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function d0(n,e,t,i){let s={},r={},o=[];const a=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(v,b){const _=b.program;i.uniformBlockBinding(v,_)}function c(v,b){let _=s[v.id];_===void 0&&(g(v),_=h(v),s[v.id]=_,v.addEventListener("dispose",m));const E=b.program;i.updateUBOMapping(v,E);const w=e.render.frame;r[v.id]!==w&&(p(v),r[v.id]=w)}function h(v){const b=u();v.__bindingPointIndex=b;const _=n.createBuffer(),E=v.__size,w=v.usage;return n.bindBuffer(n.UNIFORM_BUFFER,_),n.bufferData(n.UNIFORM_BUFFER,E,w),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,b,_),_}function u(){for(let v=0;v<a;v++)if(o.indexOf(v)===-1)return o.push(v),v;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function p(v){const b=s[v.id],_=v.uniforms,E=v.__cache;n.bindBuffer(n.UNIFORM_BUFFER,b);for(let w=0,R=_.length;w<R;w++){const I=Array.isArray(_[w])?_[w]:[_[w]];for(let S=0,x=I.length;S<x;S++){const A=I[S];if(f(A,w,S,E)===!0){const O=A.__offset,U=Array.isArray(A.value)?A.value:[A.value];let V=0;for(let F=0;F<U.length;F++){const H=U[F],Q=y(H);typeof H=="number"||typeof H=="boolean"?(A.__data[0]=H,n.bufferSubData(n.UNIFORM_BUFFER,O+V,A.__data)):H.isMatrix3?(A.__data[0]=H.elements[0],A.__data[1]=H.elements[1],A.__data[2]=H.elements[2],A.__data[3]=0,A.__data[4]=H.elements[3],A.__data[5]=H.elements[4],A.__data[6]=H.elements[5],A.__data[7]=0,A.__data[8]=H.elements[6],A.__data[9]=H.elements[7],A.__data[10]=H.elements[8],A.__data[11]=0):(H.toArray(A.__data,V),V+=Q.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,O,A.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function f(v,b,_,E){const w=v.value,R=b+"_"+_;if(E[R]===void 0)return typeof w=="number"||typeof w=="boolean"?E[R]=w:E[R]=w.clone(),!0;{const I=E[R];if(typeof w=="number"||typeof w=="boolean"){if(I!==w)return E[R]=w,!0}else if(I.equals(w)===!1)return I.copy(w),!0}return!1}function g(v){const b=v.uniforms;let _=0;const E=16;for(let R=0,I=b.length;R<I;R++){const S=Array.isArray(b[R])?b[R]:[b[R]];for(let x=0,A=S.length;x<A;x++){const O=S[x],U=Array.isArray(O.value)?O.value:[O.value];for(let V=0,F=U.length;V<F;V++){const H=U[V],Q=y(H),Y=_%E,M=Y%Q.boundary,N=Y+M;_+=M,N!==0&&E-N<Q.storage&&(_+=E-N),O.__data=new Float32Array(Q.storage/Float32Array.BYTES_PER_ELEMENT),O.__offset=_,_+=Q.storage}}}const w=_%E;return w>0&&(_+=E-w),v.__size=_,v.__cache={},this}function y(v){const b={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(b.boundary=4,b.storage=4):v.isVector2?(b.boundary=8,b.storage=8):v.isVector3||v.isColor?(b.boundary=16,b.storage=12):v.isVector4?(b.boundary=16,b.storage=16):v.isMatrix3?(b.boundary=48,b.storage=48):v.isMatrix4?(b.boundary=64,b.storage=64):v.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",v),b}function m(v){const b=v.target;b.removeEventListener("dispose",m);const _=o.indexOf(b.__bindingPointIndex);o.splice(_,1),n.deleteBuffer(s[b.id]),delete s[b.id],delete r[b.id]}function d(){for(const v in s)n.deleteBuffer(s[v]);o=[],s={},r={}}return{bind:l,update:c,dispose:d}}class ky{constructor(e={}){const{canvas:t=Zh(),context:i=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reverseDepthBuffer:p=!1}=e;this.isWebGLRenderer=!0;let f;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=i.getContextAttributes().alpha}else f=o;const g=new Uint32Array(4),y=new Int32Array(4);let m=null,d=null;const v=[],b=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Bt,this.toneMapping=0,this.toneMappingExposure=1;const _=this;let E=!1,w=0,R=0,I=null,S=-1,x=null;const A=new tt,O=new tt;let U=null;const V=new Ue(0);let F=0,H=t.width,Q=t.height,Y=1,M=null,N=null;const Z=new tt(0,0,H,Q),ce=new tt(0,0,H,Q);let Ce=!1;const J=new Ko;let ue=!1,oe=!1;const X=new He,ne=new He,ge=new P,ee=new tt,B={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let q=!1;function re(){return I===null?Y:1}let D=i;function de(C,G){return t.getContext(C,G)}try{const C={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine","three.js r170"),t.addEventListener("webglcontextlost",ae,!1),t.addEventListener("webglcontextrestored",we,!1),t.addEventListener("webglcontextcreationerror",xe,!1),D===null){const G="webgl2";if(D=de(G,C),D===null)throw de(G)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(C){throw console.error("THREE.WebGLRenderer: "+C.message),C}let le,ye,pe,De,Me,L,T,k,$,se,te,Re,ve,Te,Ze,fe,Ee,Oe,Be,Ae,$e,je,dt,z;function be(){le=new yp(D),le.init(),je=new i0(D,le),ye=new dp(D,le,e,je),pe=new e0(D,le),ye.reverseDepthBuffer&&p&&pe.buffers.depth.setReversed(!0),De=new Mp(D),Me=new Bm,L=new n0(D,le,pe,Me,ye,je,De),T=new pp(_),k=new _p(_),$=new Au(D),dt=new hp(D,$),se=new vp(D,$,De,dt),te=new Sp(D,se,$,De),Be=new xp(D,ye,L),fe=new fp(Me),Re=new Om(_,T,k,le,ye,dt,fe),ve=new u0(_,Me),Te=new Hm,Ze=new qm(le),Oe=new cp(_,T,k,pe,te,f,l),Ee=new $m(_,te,ye),z=new d0(D,De,ye,pe),Ae=new up(D,le,De),$e=new bp(D,le,De),De.programs=Re.programs,_.capabilities=ye,_.extensions=le,_.properties=Me,_.renderLists=Te,_.shadowMap=Ee,_.state=pe,_.info=De}be();const ie=new c0(_,D);this.xr=ie,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){const C=le.get("WEBGL_lose_context");C&&C.loseContext()},this.forceContextRestore=function(){const C=le.get("WEBGL_lose_context");C&&C.restoreContext()},this.getPixelRatio=function(){return Y},this.setPixelRatio=function(C){C!==void 0&&(Y=C,this.setSize(H,Q,!1))},this.getSize=function(C){return C.set(H,Q)},this.setSize=function(C,G,j=!0){if(ie.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}H=C,Q=G,t.width=Math.floor(C*Y),t.height=Math.floor(G*Y),j===!0&&(t.style.width=C+"px",t.style.height=G+"px"),this.setViewport(0,0,C,G)},this.getDrawingBufferSize=function(C){return C.set(H*Y,Q*Y).floor()},this.setDrawingBufferSize=function(C,G,j){H=C,Q=G,Y=j,t.width=Math.floor(C*j),t.height=Math.floor(G*j),this.setViewport(0,0,C,G)},this.getCurrentViewport=function(C){return C.copy(A)},this.getViewport=function(C){return C.copy(Z)},this.setViewport=function(C,G,j,K){C.isVector4?Z.set(C.x,C.y,C.z,C.w):Z.set(C,G,j,K),pe.viewport(A.copy(Z).multiplyScalar(Y).round())},this.getScissor=function(C){return C.copy(ce)},this.setScissor=function(C,G,j,K){C.isVector4?ce.set(C.x,C.y,C.z,C.w):ce.set(C,G,j,K),pe.scissor(O.copy(ce).multiplyScalar(Y).round())},this.getScissorTest=function(){return Ce},this.setScissorTest=function(C){pe.setScissorTest(Ce=C)},this.setOpaqueSort=function(C){M=C},this.setTransparentSort=function(C){N=C},this.getClearColor=function(C){return C.copy(Oe.getClearColor())},this.setClearColor=function(){Oe.setClearColor.apply(Oe,arguments)},this.getClearAlpha=function(){return Oe.getClearAlpha()},this.setClearAlpha=function(){Oe.setClearAlpha.apply(Oe,arguments)},this.clear=function(C=!0,G=!0,j=!0){let K=0;if(C){let W=!1;if(I!==null){const me=I.texture.format;W=me===1033||me===1031||me===1029}if(W){const me=I.texture.type,Se=me===1009||me===1014||me===1012||me===1020||me===1017||me===1018,Pe=Oe.getClearColor(),Ie=Oe.getClearAlpha(),ze=Pe.r,Ye=Pe.g,Le=Pe.b;Se?(g[0]=ze,g[1]=Ye,g[2]=Le,g[3]=Ie,D.clearBufferuiv(D.COLOR,0,g)):(y[0]=ze,y[1]=Ye,y[2]=Le,y[3]=Ie,D.clearBufferiv(D.COLOR,0,y))}else K|=D.COLOR_BUFFER_BIT}G&&(K|=D.DEPTH_BUFFER_BIT),j&&(K|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),D.clear(K)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",ae,!1),t.removeEventListener("webglcontextrestored",we,!1),t.removeEventListener("webglcontextcreationerror",xe,!1),Te.dispose(),Ze.dispose(),Me.dispose(),T.dispose(),k.dispose(),te.dispose(),dt.dispose(),z.dispose(),Re.dispose(),ie.dispose(),ie.removeEventListener("sessionstart",ca),ie.removeEventListener("sessionend",ha),Bn.stop()};function ae(C){C.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),E=!0}function we(){console.log("THREE.WebGLRenderer: Context Restored."),E=!1;const C=De.autoReset,G=Ee.enabled,j=Ee.autoUpdate,K=Ee.needsUpdate,W=Ee.type;be(),De.autoReset=C,Ee.enabled=G,Ee.autoUpdate=j,Ee.needsUpdate=K,Ee.type=W}function xe(C){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",C.statusMessage)}function Xe(C){const G=C.target;G.removeEventListener("dispose",Xe),bt(G)}function bt(C){Dt(C),Me.remove(C)}function Dt(C){const G=Me.get(C).programs;G!==void 0&&(G.forEach(function(j){Re.releaseProgram(j)}),C.isShaderMaterial&&Re.releaseShaderCache(C))}this.renderBufferDirect=function(C,G,j,K,W,me){G===null&&(G=B);const Se=W.isMesh&&W.matrixWorld.determinant()<0,Pe=Ih(C,G,j,K,W);pe.setMaterial(K,Se);let Ie=j.index,ze=1;if(K.wireframe===!0){if(Ie=se.getWireframeAttribute(j),Ie===void 0)return;ze=2}const Ye=j.drawRange,Le=j.attributes.position;let et=Ye.start*ze,ft=(Ye.start+Ye.count)*ze;me!==null&&(et=Math.max(et,me.start*ze),ft=Math.min(ft,(me.start+me.count)*ze)),Ie!==null?(et=Math.max(et,0),ft=Math.min(ft,Ie.count)):Le!=null&&(et=Math.max(et,0),ft=Math.min(ft,Le.count));const mt=ft-et;if(mt<0||mt===1/0)return;dt.setup(W,K,Pe,j,Ie);let zt,nt=Ae;if(Ie!==null&&(zt=$.get(Ie),nt=$e,nt.setIndex(zt)),W.isMesh)K.wireframe===!0?(pe.setLineWidth(K.wireframeLinewidth*re()),nt.setMode(D.LINES)):nt.setMode(D.TRIANGLES);else if(W.isLine){let Ne=K.linewidth;Ne===void 0&&(Ne=1),pe.setLineWidth(Ne*re()),W.isLineSegments?nt.setMode(D.LINES):W.isLineLoop?nt.setMode(D.LINE_LOOP):nt.setMode(D.LINE_STRIP)}else W.isPoints?nt.setMode(D.POINTS):W.isSprite&&nt.setMode(D.TRIANGLES);if(W.isBatchedMesh)if(W._multiDrawInstances!==null)nt.renderMultiDrawInstances(W._multiDrawStarts,W._multiDrawCounts,W._multiDrawCount,W._multiDrawInstances);else if(le.get("WEBGL_multi_draw"))nt.renderMultiDraw(W._multiDrawStarts,W._multiDrawCounts,W._multiDrawCount);else{const Ne=W._multiDrawStarts,dn=W._multiDrawCounts,it=W._multiDrawCount,Zt=Ie?$.get(Ie).bytesPerElement:1,ni=Me.get(K).currentProgram.getUniforms();for(let Ht=0;Ht<it;Ht++)ni.setValue(D,"_gl_DrawID",Ht),nt.render(Ne[Ht]/Zt,dn[Ht])}else if(W.isInstancedMesh)nt.renderInstances(et,mt,W.count);else if(j.isInstancedBufferGeometry){const Ne=j._maxInstanceCount!==void 0?j._maxInstanceCount:1/0,dn=Math.min(j.instanceCount,Ne);nt.renderInstances(et,mt,dn)}else nt.render(et,mt)};function ot(C,G,j){C.transparent===!0&&C.side===2&&C.forceSinglePass===!1?(C.side=1,C.needsUpdate=!0,_s(C,G,j),C.side=0,C.needsUpdate=!0,_s(C,G,j),C.side=2):_s(C,G,j)}this.compile=function(C,G,j=null){j===null&&(j=C),d=Ze.get(j),d.init(G),b.push(d),j.traverseVisible(function(W){W.isLight&&W.layers.test(G.layers)&&(d.pushLight(W),W.castShadow&&d.pushShadow(W))}),C!==j&&C.traverseVisible(function(W){W.isLight&&W.layers.test(G.layers)&&(d.pushLight(W),W.castShadow&&d.pushShadow(W))}),d.setupLights();const K=new Set;return C.traverse(function(W){if(!(W.isMesh||W.isPoints||W.isLine||W.isSprite))return;const me=W.material;if(me)if(Array.isArray(me))for(let Se=0;Se<me.length;Se++){const Pe=me[Se];ot(Pe,j,W),K.add(Pe)}else ot(me,j,W),K.add(me)}),b.pop(),d=null,K},this.compileAsync=function(C,G,j=null){const K=this.compile(C,G,j);return new Promise(W=>{function me(){if(K.forEach(function(Se){Me.get(Se).currentProgram.isReady()&&K.delete(Se)}),K.size===0){W(C);return}setTimeout(me,10)}le.get("KHR_parallel_shader_compile")!==null?me():setTimeout(me,10)})};let Jt=null;function un(C){Jt&&Jt(C)}function ca(){Bn.stop()}function ha(){Bn.start()}const Bn=new Mc;Bn.setAnimationLoop(un),typeof self<"u"&&Bn.setContext(self),this.setAnimationLoop=function(C){Jt=C,ie.setAnimationLoop(C),C===null?Bn.stop():Bn.start()},ie.addEventListener("sessionstart",ca),ie.addEventListener("sessionend",ha),this.render=function(C,G){if(G!==void 0&&G.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(E===!0)return;if(C.matrixWorldAutoUpdate===!0&&C.updateMatrixWorld(),G.parent===null&&G.matrixWorldAutoUpdate===!0&&G.updateMatrixWorld(),ie.enabled===!0&&ie.isPresenting===!0&&(ie.cameraAutoUpdate===!0&&ie.updateCamera(G),G=ie.getCamera()),C.isScene===!0&&C.onBeforeRender(_,C,G,I),d=Ze.get(C,b.length),d.init(G),b.push(d),ne.multiplyMatrices(G.projectionMatrix,G.matrixWorldInverse),J.setFromProjectionMatrix(ne),oe=this.localClippingEnabled,ue=fe.init(this.clippingPlanes,oe),m=Te.get(C,v.length),m.init(),v.push(m),ie.enabled===!0&&ie.isPresenting===!0){const me=_.xr.getDepthSensingMesh();me!==null&&Pr(me,G,-1/0,_.sortObjects)}Pr(C,G,0,_.sortObjects),m.finish(),_.sortObjects===!0&&m.sort(M,N),q=ie.enabled===!1||ie.isPresenting===!1||ie.hasDepthSensing()===!1,q&&Oe.addToRenderList(m,C),this.info.render.frame++,ue===!0&&fe.beginShadows();const j=d.state.shadowsArray;Ee.render(j,C,G),ue===!0&&fe.endShadows(),this.info.autoReset===!0&&this.info.reset();const K=m.opaque,W=m.transmissive;if(d.setupLights(),G.isArrayCamera){const me=G.cameras;if(W.length>0)for(let Se=0,Pe=me.length;Se<Pe;Se++){const Ie=me[Se];da(K,W,C,Ie)}q&&Oe.render(C);for(let Se=0,Pe=me.length;Se<Pe;Se++){const Ie=me[Se];ua(m,C,Ie,Ie.viewport)}}else W.length>0&&da(K,W,C,G),q&&Oe.render(C),ua(m,C,G);I!==null&&(L.updateMultisampleRenderTarget(I),L.updateRenderTargetMipmap(I)),C.isScene===!0&&C.onAfterRender(_,C,G),dt.resetDefaultState(),S=-1,x=null,b.pop(),b.length>0?(d=b[b.length-1],ue===!0&&fe.setGlobalState(_.clippingPlanes,d.state.camera)):d=null,v.pop(),v.length>0?m=v[v.length-1]:m=null};function Pr(C,G,j,K){if(C.visible===!1)return;if(C.layers.test(G.layers)){if(C.isGroup)j=C.renderOrder;else if(C.isLOD)C.autoUpdate===!0&&C.update(G);else if(C.isLight)d.pushLight(C),C.castShadow&&d.pushShadow(C);else if(C.isSprite){if(!C.frustumCulled||J.intersectsSprite(C)){K&&ee.setFromMatrixPosition(C.matrixWorld).applyMatrix4(ne);const Se=te.update(C),Pe=C.material;Pe.visible&&m.push(C,Se,Pe,j,ee.z,null)}}else if((C.isMesh||C.isLine||C.isPoints)&&(!C.frustumCulled||J.intersectsObject(C))){const Se=te.update(C),Pe=C.material;if(K&&(C.boundingSphere!==void 0?(C.boundingSphere===null&&C.computeBoundingSphere(),ee.copy(C.boundingSphere.center)):(Se.boundingSphere===null&&Se.computeBoundingSphere(),ee.copy(Se.boundingSphere.center)),ee.applyMatrix4(C.matrixWorld).applyMatrix4(ne)),Array.isArray(Pe)){const Ie=Se.groups;for(let ze=0,Ye=Ie.length;ze<Ye;ze++){const Le=Ie[ze],et=Pe[Le.materialIndex];et&&et.visible&&m.push(C,Se,et,j,ee.z,Le)}}else Pe.visible&&m.push(C,Se,Pe,j,ee.z,null)}}const me=C.children;for(let Se=0,Pe=me.length;Se<Pe;Se++)Pr(me[Se],G,j,K)}function ua(C,G,j,K){const W=C.opaque,me=C.transmissive,Se=C.transparent;d.setupLightsView(j),ue===!0&&fe.setGlobalState(_.clippingPlanes,j),K&&pe.viewport(A.copy(K)),W.length>0&&gs(W,G,j),me.length>0&&gs(me,G,j),Se.length>0&&gs(Se,G,j),pe.buffers.depth.setTest(!0),pe.buffers.depth.setMask(!0),pe.buffers.color.setMask(!0),pe.setPolygonOffset(!1)}function da(C,G,j,K){if((j.isScene===!0?j.overrideMaterial:null)!==null)return;d.state.transmissionRenderTarget[K.id]===void 0&&(d.state.transmissionRenderTarget[K.id]=new Qn(1,1,{generateMipmaps:!0,type:le.has("EXT_color_buffer_half_float")||le.has("EXT_color_buffer_float")?1016:1009,minFilter:1008,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Qe.workingColorSpace}));const me=d.state.transmissionRenderTarget[K.id],Se=K.viewport||A;me.setSize(Se.z,Se.w);const Pe=_.getRenderTarget();_.setRenderTarget(me),_.getClearColor(V),F=_.getClearAlpha(),F<1&&_.setClearColor(16777215,.5),_.clear(),q&&Oe.render(j);const Ie=_.toneMapping;_.toneMapping=0;const ze=K.viewport;if(K.viewport!==void 0&&(K.viewport=void 0),d.setupLightsView(K),ue===!0&&fe.setGlobalState(_.clippingPlanes,K),gs(C,j,K),L.updateMultisampleRenderTarget(me),L.updateRenderTargetMipmap(me),le.has("WEBGL_multisampled_render_to_texture")===!1){let Ye=!1;for(let Le=0,et=G.length;Le<et;Le++){const ft=G[Le],mt=ft.object,zt=ft.geometry,nt=ft.material,Ne=ft.group;if(nt.side===2&&mt.layers.test(K.layers)){const dn=nt.side;nt.side=1,nt.needsUpdate=!0,fa(mt,j,K,zt,nt,Ne),nt.side=dn,nt.needsUpdate=!0,Ye=!0}}Ye===!0&&(L.updateMultisampleRenderTarget(me),L.updateRenderTargetMipmap(me))}_.setRenderTarget(Pe),_.setClearColor(V,F),ze!==void 0&&(K.viewport=ze),_.toneMapping=Ie}function gs(C,G,j){const K=G.isScene===!0?G.overrideMaterial:null;for(let W=0,me=C.length;W<me;W++){const Se=C[W],Pe=Se.object,Ie=Se.geometry,ze=K===null?Se.material:K,Ye=Se.group;Pe.layers.test(j.layers)&&fa(Pe,G,j,Ie,ze,Ye)}}function fa(C,G,j,K,W,me){C.onBeforeRender(_,G,j,K,W,me),C.modelViewMatrix.multiplyMatrices(j.matrixWorldInverse,C.matrixWorld),C.normalMatrix.getNormalMatrix(C.modelViewMatrix),W.onBeforeRender(_,G,j,K,C,me),W.transparent===!0&&W.side===2&&W.forceSinglePass===!1?(W.side=1,W.needsUpdate=!0,_.renderBufferDirect(j,G,K,W,C,me),W.side=0,W.needsUpdate=!0,_.renderBufferDirect(j,G,K,W,C,me),W.side=2):_.renderBufferDirect(j,G,K,W,C,me),C.onAfterRender(_,G,j,K,W,me)}function _s(C,G,j){G.isScene!==!0&&(G=B);const K=Me.get(C),W=d.state.lights,me=d.state.shadowsArray,Se=W.state.version,Pe=Re.getParameters(C,W.state,me,G,j),Ie=Re.getProgramCacheKey(Pe);let ze=K.programs;K.environment=C.isMeshStandardMaterial?G.environment:null,K.fog=G.fog,K.envMap=(C.isMeshStandardMaterial?k:T).get(C.envMap||K.environment),K.envMapRotation=K.environment!==null&&C.envMap===null?G.environmentRotation:C.envMapRotation,ze===void 0&&(C.addEventListener("dispose",Xe),ze=new Map,K.programs=ze);let Ye=ze.get(Ie);if(Ye!==void 0){if(K.currentProgram===Ye&&K.lightsStateVersion===Se)return ma(C,Pe),Ye}else Pe.uniforms=Re.getUniforms(C),C.onBeforeCompile(Pe,_),Ye=Re.acquireProgram(Pe,Ie),ze.set(Ie,Ye),K.uniforms=Pe.uniforms;const Le=K.uniforms;return(!C.isShaderMaterial&&!C.isRawShaderMaterial||C.clipping===!0)&&(Le.clippingPlanes=fe.uniform),ma(C,Pe),K.needsLights=Dh(C),K.lightsStateVersion=Se,K.needsLights&&(Le.ambientLightColor.value=W.state.ambient,Le.lightProbe.value=W.state.probe,Le.directionalLights.value=W.state.directional,Le.directionalLightShadows.value=W.state.directionalShadow,Le.spotLights.value=W.state.spot,Le.spotLightShadows.value=W.state.spotShadow,Le.rectAreaLights.value=W.state.rectArea,Le.ltc_1.value=W.state.rectAreaLTC1,Le.ltc_2.value=W.state.rectAreaLTC2,Le.pointLights.value=W.state.point,Le.pointLightShadows.value=W.state.pointShadow,Le.hemisphereLights.value=W.state.hemi,Le.directionalShadowMap.value=W.state.directionalShadowMap,Le.directionalShadowMatrix.value=W.state.directionalShadowMatrix,Le.spotShadowMap.value=W.state.spotShadowMap,Le.spotLightMatrix.value=W.state.spotLightMatrix,Le.spotLightMap.value=W.state.spotLightMap,Le.pointShadowMap.value=W.state.pointShadowMap,Le.pointShadowMatrix.value=W.state.pointShadowMatrix),K.currentProgram=Ye,K.uniformsList=null,Ye}function pa(C){if(C.uniformsList===null){const G=C.currentProgram.getUniforms();C.uniformsList=er.seqWithValue(G.seq,C.uniforms)}return C.uniformsList}function ma(C,G){const j=Me.get(C);j.outputColorSpace=G.outputColorSpace,j.batching=G.batching,j.batchingColor=G.batchingColor,j.instancing=G.instancing,j.instancingColor=G.instancingColor,j.instancingMorph=G.instancingMorph,j.skinning=G.skinning,j.morphTargets=G.morphTargets,j.morphNormals=G.morphNormals,j.morphColors=G.morphColors,j.morphTargetsCount=G.morphTargetsCount,j.numClippingPlanes=G.numClippingPlanes,j.numIntersection=G.numClipIntersection,j.vertexAlphas=G.vertexAlphas,j.vertexTangents=G.vertexTangents,j.toneMapping=G.toneMapping}function Ih(C,G,j,K,W){G.isScene!==!0&&(G=B),L.resetTextureUnits();const me=G.fog,Se=K.isMeshStandardMaterial?G.environment:null,Pe=I===null?_.outputColorSpace:I.isXRRenderTarget===!0?I.texture.colorSpace:Ni,Ie=(K.isMeshStandardMaterial?k:T).get(K.envMap||Se),ze=K.vertexColors===!0&&!!j.attributes.color&&j.attributes.color.itemSize===4,Ye=!!j.attributes.tangent&&(!!K.normalMap||K.anisotropy>0),Le=!!j.morphAttributes.position,et=!!j.morphAttributes.normal,ft=!!j.morphAttributes.color;let mt=0;K.toneMapped&&(I===null||I.isXRRenderTarget===!0)&&(mt=_.toneMapping);const zt=j.morphAttributes.position||j.morphAttributes.normal||j.morphAttributes.color,nt=zt!==void 0?zt.length:0,Ne=Me.get(K),dn=d.state.lights;if(ue===!0&&(oe===!0||C!==x)){const Yt=C===x&&K.id===S;fe.setState(K,C,Yt)}let it=!1;K.version===Ne.__version?(Ne.needsLights&&Ne.lightsStateVersion!==dn.state.version||Ne.outputColorSpace!==Pe||W.isBatchedMesh&&Ne.batching===!1||!W.isBatchedMesh&&Ne.batching===!0||W.isBatchedMesh&&Ne.batchingColor===!0&&W.colorTexture===null||W.isBatchedMesh&&Ne.batchingColor===!1&&W.colorTexture!==null||W.isInstancedMesh&&Ne.instancing===!1||!W.isInstancedMesh&&Ne.instancing===!0||W.isSkinnedMesh&&Ne.skinning===!1||!W.isSkinnedMesh&&Ne.skinning===!0||W.isInstancedMesh&&Ne.instancingColor===!0&&W.instanceColor===null||W.isInstancedMesh&&Ne.instancingColor===!1&&W.instanceColor!==null||W.isInstancedMesh&&Ne.instancingMorph===!0&&W.morphTexture===null||W.isInstancedMesh&&Ne.instancingMorph===!1&&W.morphTexture!==null||Ne.envMap!==Ie||K.fog===!0&&Ne.fog!==me||Ne.numClippingPlanes!==void 0&&(Ne.numClippingPlanes!==fe.numPlanes||Ne.numIntersection!==fe.numIntersection)||Ne.vertexAlphas!==ze||Ne.vertexTangents!==Ye||Ne.morphTargets!==Le||Ne.morphNormals!==et||Ne.morphColors!==ft||Ne.toneMapping!==mt||Ne.morphTargetsCount!==nt)&&(it=!0):(it=!0,Ne.__version=K.version);let Zt=Ne.currentProgram;it===!0&&(Zt=_s(K,G,W));let ni=!1,Ht=!1,zi=!1;const gt=Zt.getUniforms(),on=Ne.uniforms;if(pe.useProgram(Zt.program)&&(ni=!0,Ht=!0,zi=!0),K.id!==S&&(S=K.id,Ht=!0),ni||x!==C){pe.buffers.depth.getReversed()?(X.copy(C.projectionMatrix),Qh(X),eu(X),gt.setValue(D,"projectionMatrix",X)):gt.setValue(D,"projectionMatrix",C.projectionMatrix),gt.setValue(D,"viewMatrix",C.matrixWorldInverse);const Sn=gt.map.cameraPosition;Sn!==void 0&&Sn.setValue(D,ge.setFromMatrixPosition(C.matrixWorld)),ye.logarithmicDepthBuffer&&gt.setValue(D,"logDepthBufFC",2/(Math.log(C.far+1)/Math.LN2)),(K.isMeshPhongMaterial||K.isMeshToonMaterial||K.isMeshLambertMaterial||K.isMeshBasicMaterial||K.isMeshStandardMaterial||K.isShaderMaterial)&&gt.setValue(D,"isOrthographic",C.isOrthographicCamera===!0),x!==C&&(x=C,Ht=!0,zi=!0)}if(W.isSkinnedMesh){gt.setOptional(D,W,"bindMatrix"),gt.setOptional(D,W,"bindMatrixInverse");const Yt=W.skeleton;Yt&&(Yt.boneTexture===null&&Yt.computeBoneTexture(),gt.setValue(D,"boneTexture",Yt.boneTexture,L))}W.isBatchedMesh&&(gt.setOptional(D,W,"batchingTexture"),gt.setValue(D,"batchingTexture",W._matricesTexture,L),gt.setOptional(D,W,"batchingIdTexture"),gt.setValue(D,"batchingIdTexture",W._indirectTexture,L),gt.setOptional(D,W,"batchingColorTexture"),W._colorsTexture!==null&&gt.setValue(D,"batchingColorTexture",W._colorsTexture,L));const Hi=j.morphAttributes;if((Hi.position!==void 0||Hi.normal!==void 0||Hi.color!==void 0)&&Be.update(W,j,Zt),(Ht||Ne.receiveShadow!==W.receiveShadow)&&(Ne.receiveShadow=W.receiveShadow,gt.setValue(D,"receiveShadow",W.receiveShadow)),K.isMeshGouraudMaterial&&K.envMap!==null&&(on.envMap.value=Ie,on.flipEnvMap.value=Ie.isCubeTexture&&Ie.isRenderTargetTexture===!1?-1:1),K.isMeshStandardMaterial&&K.envMap===null&&G.environment!==null&&(on.envMapIntensity.value=G.environmentIntensity),Ht&&(gt.setValue(D,"toneMappingExposure",_.toneMappingExposure),Ne.needsLights&&Lh(on,zi),me&&K.fog===!0&&ve.refreshFogUniforms(on,me),ve.refreshMaterialUniforms(on,K,Y,Q,d.state.transmissionRenderTarget[C.id]),er.upload(D,pa(Ne),on,L)),K.isShaderMaterial&&K.uniformsNeedUpdate===!0&&(er.upload(D,pa(Ne),on,L),K.uniformsNeedUpdate=!1),K.isSpriteMaterial&&gt.setValue(D,"center",W.center),gt.setValue(D,"modelViewMatrix",W.modelViewMatrix),gt.setValue(D,"normalMatrix",W.normalMatrix),gt.setValue(D,"modelMatrix",W.matrixWorld),K.isShaderMaterial||K.isRawShaderMaterial){const Yt=K.uniformsGroups;for(let Sn=0,wn=Yt.length;Sn<wn;Sn++){const ga=Yt[Sn];z.update(ga,Zt),z.bind(ga,Zt)}}return Zt}function Lh(C,G){C.ambientLightColor.needsUpdate=G,C.lightProbe.needsUpdate=G,C.directionalLights.needsUpdate=G,C.directionalLightShadows.needsUpdate=G,C.pointLights.needsUpdate=G,C.pointLightShadows.needsUpdate=G,C.spotLights.needsUpdate=G,C.spotLightShadows.needsUpdate=G,C.rectAreaLights.needsUpdate=G,C.hemisphereLights.needsUpdate=G}function Dh(C){return C.isMeshLambertMaterial||C.isMeshToonMaterial||C.isMeshPhongMaterial||C.isMeshStandardMaterial||C.isShadowMaterial||C.isShaderMaterial&&C.lights===!0}this.getActiveCubeFace=function(){return w},this.getActiveMipmapLevel=function(){return R},this.getRenderTarget=function(){return I},this.setRenderTargetTextures=function(C,G,j){Me.get(C.texture).__webglTexture=G,Me.get(C.depthTexture).__webglTexture=j;const K=Me.get(C);K.__hasExternalTextures=!0,K.__autoAllocateDepthBuffer=j===void 0,K.__autoAllocateDepthBuffer||le.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),K.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(C,G){const j=Me.get(C);j.__webglFramebuffer=G,j.__useDefaultFramebuffer=G===void 0},this.setRenderTarget=function(C,G=0,j=0){I=C,w=G,R=j;let K=!0,W=null,me=!1,Se=!1;if(C){const Ie=Me.get(C);if(Ie.__useDefaultFramebuffer!==void 0)pe.bindFramebuffer(D.FRAMEBUFFER,null),K=!1;else if(Ie.__webglFramebuffer===void 0)L.setupRenderTarget(C);else if(Ie.__hasExternalTextures)L.rebindTextures(C,Me.get(C.texture).__webglTexture,Me.get(C.depthTexture).__webglTexture);else if(C.depthBuffer){const Le=C.depthTexture;if(Ie.__boundDepthTexture!==Le){if(Le!==null&&Me.has(Le)&&(C.width!==Le.image.width||C.height!==Le.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");L.setupDepthRenderbuffer(C)}}const ze=C.texture;(ze.isData3DTexture||ze.isDataArrayTexture||ze.isCompressedArrayTexture)&&(Se=!0);const Ye=Me.get(C).__webglFramebuffer;C.isWebGLCubeRenderTarget?(Array.isArray(Ye[G])?W=Ye[G][j]:W=Ye[G],me=!0):C.samples>0&&L.useMultisampledRTT(C)===!1?W=Me.get(C).__webglMultisampledFramebuffer:Array.isArray(Ye)?W=Ye[j]:W=Ye,A.copy(C.viewport),O.copy(C.scissor),U=C.scissorTest}else A.copy(Z).multiplyScalar(Y).floor(),O.copy(ce).multiplyScalar(Y).floor(),U=Ce;if(pe.bindFramebuffer(D.FRAMEBUFFER,W)&&K&&pe.drawBuffers(C,W),pe.viewport(A),pe.scissor(O),pe.setScissorTest(U),me){const Ie=Me.get(C.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+G,Ie.__webglTexture,j)}else if(Se){const Ie=Me.get(C.texture),ze=G||0;D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,Ie.__webglTexture,j||0,ze)}S=-1},this.readRenderTargetPixels=function(C,G,j,K,W,me,Se){if(!(C&&C.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Pe=Me.get(C).__webglFramebuffer;if(C.isWebGLCubeRenderTarget&&Se!==void 0&&(Pe=Pe[Se]),Pe){pe.bindFramebuffer(D.FRAMEBUFFER,Pe);try{const Ie=C.texture,ze=Ie.format,Ye=Ie.type;if(!ye.textureFormatReadable(ze)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ye.textureTypeReadable(Ye)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}G>=0&&G<=C.width-K&&j>=0&&j<=C.height-W&&D.readPixels(G,j,K,W,je.convert(ze),je.convert(Ye),me)}finally{const Ie=I!==null?Me.get(I).__webglFramebuffer:null;pe.bindFramebuffer(D.FRAMEBUFFER,Ie)}}},this.readRenderTargetPixelsAsync=async function(C,G,j,K,W,me,Se){if(!(C&&C.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Pe=Me.get(C).__webglFramebuffer;if(C.isWebGLCubeRenderTarget&&Se!==void 0&&(Pe=Pe[Se]),Pe){const Ie=C.texture,ze=Ie.format,Ye=Ie.type;if(!ye.textureFormatReadable(ze))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ye.textureTypeReadable(Ye))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(G>=0&&G<=C.width-K&&j>=0&&j<=C.height-W){pe.bindFramebuffer(D.FRAMEBUFFER,Pe);const Le=D.createBuffer();D.bindBuffer(D.PIXEL_PACK_BUFFER,Le),D.bufferData(D.PIXEL_PACK_BUFFER,me.byteLength,D.STREAM_READ),D.readPixels(G,j,K,W,je.convert(ze),je.convert(Ye),0);const et=I!==null?Me.get(I).__webglFramebuffer:null;pe.bindFramebuffer(D.FRAMEBUFFER,et);const ft=D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE,0);return D.flush(),await $h(D,ft,4),D.bindBuffer(D.PIXEL_PACK_BUFFER,Le),D.getBufferSubData(D.PIXEL_PACK_BUFFER,0,me),D.deleteBuffer(Le),D.deleteSync(ft),me}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(C,G=null,j=0){C.isTexture!==!0&&(ts("WebGLRenderer: copyFramebufferToTexture function signature has changed."),G=arguments[0]||null,C=arguments[1]);const K=Math.pow(2,-j),W=Math.floor(C.image.width*K),me=Math.floor(C.image.height*K),Se=G!==null?G.x:0,Pe=G!==null?G.y:0;L.setTexture2D(C,0),D.copyTexSubImage2D(D.TEXTURE_2D,j,0,0,Se,Pe,W,me),pe.unbindTexture()},this.copyTextureToTexture=function(C,G,j=null,K=null,W=0){C.isTexture!==!0&&(ts("WebGLRenderer: copyTextureToTexture function signature has changed."),K=arguments[0]||null,C=arguments[1],G=arguments[2],W=arguments[3]||0,j=null);let me,Se,Pe,Ie,ze,Ye,Le,et,ft;const mt=C.isCompressedTexture?C.mipmaps[W]:C.image;j!==null?(me=j.max.x-j.min.x,Se=j.max.y-j.min.y,Pe=j.isBox3?j.max.z-j.min.z:1,Ie=j.min.x,ze=j.min.y,Ye=j.isBox3?j.min.z:0):(me=mt.width,Se=mt.height,Pe=mt.depth||1,Ie=0,ze=0,Ye=0),K!==null?(Le=K.x,et=K.y,ft=K.z):(Le=0,et=0,ft=0);const zt=je.convert(G.format),nt=je.convert(G.type);let Ne;G.isData3DTexture?(L.setTexture3D(G,0),Ne=D.TEXTURE_3D):G.isDataArrayTexture||G.isCompressedArrayTexture?(L.setTexture2DArray(G,0),Ne=D.TEXTURE_2D_ARRAY):(L.setTexture2D(G,0),Ne=D.TEXTURE_2D),D.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,G.flipY),D.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,G.premultiplyAlpha),D.pixelStorei(D.UNPACK_ALIGNMENT,G.unpackAlignment);const dn=D.getParameter(D.UNPACK_ROW_LENGTH),it=D.getParameter(D.UNPACK_IMAGE_HEIGHT),Zt=D.getParameter(D.UNPACK_SKIP_PIXELS),ni=D.getParameter(D.UNPACK_SKIP_ROWS),Ht=D.getParameter(D.UNPACK_SKIP_IMAGES);D.pixelStorei(D.UNPACK_ROW_LENGTH,mt.width),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,mt.height),D.pixelStorei(D.UNPACK_SKIP_PIXELS,Ie),D.pixelStorei(D.UNPACK_SKIP_ROWS,ze),D.pixelStorei(D.UNPACK_SKIP_IMAGES,Ye);const zi=C.isDataArrayTexture||C.isData3DTexture,gt=G.isDataArrayTexture||G.isData3DTexture;if(C.isRenderTargetTexture||C.isDepthTexture){const on=Me.get(C),Hi=Me.get(G),Yt=Me.get(on.__renderTarget),Sn=Me.get(Hi.__renderTarget);pe.bindFramebuffer(D.READ_FRAMEBUFFER,Yt.__webglFramebuffer),pe.bindFramebuffer(D.DRAW_FRAMEBUFFER,Sn.__webglFramebuffer);for(let wn=0;wn<Pe;wn++)zi&&D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Me.get(C).__webglTexture,W,Ye+wn),C.isDepthTexture?(gt&&D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Me.get(G).__webglTexture,W,ft+wn),D.blitFramebuffer(Ie,ze,me,Se,Le,et,me,Se,D.DEPTH_BUFFER_BIT,D.NEAREST)):gt?D.copyTexSubImage3D(Ne,W,Le,et,ft+wn,Ie,ze,me,Se):D.copyTexSubImage2D(Ne,W,Le,et,ft+wn,Ie,ze,me,Se);pe.bindFramebuffer(D.READ_FRAMEBUFFER,null),pe.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else gt?C.isDataTexture||C.isData3DTexture?D.texSubImage3D(Ne,W,Le,et,ft,me,Se,Pe,zt,nt,mt.data):G.isCompressedArrayTexture?D.compressedTexSubImage3D(Ne,W,Le,et,ft,me,Se,Pe,zt,mt.data):D.texSubImage3D(Ne,W,Le,et,ft,me,Se,Pe,zt,nt,mt):C.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,W,Le,et,me,Se,zt,nt,mt.data):C.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,W,Le,et,mt.width,mt.height,zt,mt.data):D.texSubImage2D(D.TEXTURE_2D,W,Le,et,me,Se,zt,nt,mt);D.pixelStorei(D.UNPACK_ROW_LENGTH,dn),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,it),D.pixelStorei(D.UNPACK_SKIP_PIXELS,Zt),D.pixelStorei(D.UNPACK_SKIP_ROWS,ni),D.pixelStorei(D.UNPACK_SKIP_IMAGES,Ht),W===0&&G.generateMipmaps&&D.generateMipmap(Ne),pe.unbindTexture()},this.copyTextureToTexture3D=function(C,G,j=null,K=null,W=0){return C.isTexture!==!0&&(ts("WebGLRenderer: copyTextureToTexture3D function signature has changed."),j=arguments[0]||null,K=arguments[1]||null,C=arguments[2],G=arguments[3],W=arguments[4]||0),ts('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(C,G,j,K,W)},this.initRenderTarget=function(C){Me.get(C).__webglFramebuffer===void 0&&L.setupRenderTarget(C)},this.initTexture=function(C){C.isCubeTexture?L.setTextureCube(C,0):C.isData3DTexture?L.setTexture3D(C,0):C.isDataArrayTexture||C.isCompressedArrayTexture?L.setTexture2DArray(C,0):L.setTexture2D(C,0),pe.unbindTexture()},this.resetState=function(){w=0,R=0,I=null,pe.reset(),dt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return 2e3}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorspace=Qe._getDrawingBufferColorSpace(e),t.unpackColorSpace=Qe._getUnpackColorSpace()}}class Rc{constructor(e,t=1,i=1e3){this.isFog=!0,this.name="",this.color=new Ue(e),this.near=t,this.far=i}clone(){return new Rc(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class Uy extends vt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new rn,this.environmentIntensity=1,this.environmentRotation=new rn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class f0{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=35044,this.updateRanges=[],this.version=0,this.uuid=Kt()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,i){e*=this.stride,i*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[i+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Kt()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),i=new this.constructor(t,this.stride);return i.setUsage(this.usage),i}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Kt()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const Ft=new P;class or{constructor(e,t,i,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=i,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,i=this.data.count;t<i;t++)Ft.fromBufferAttribute(this,t),Ft.applyMatrix4(e),this.setXYZ(t,Ft.x,Ft.y,Ft.z);return this}applyNormalMatrix(e){for(let t=0,i=this.count;t<i;t++)Ft.fromBufferAttribute(this,t),Ft.applyNormalMatrix(e),this.setXYZ(t,Ft.x,Ft.y,Ft.z);return this}transformDirection(e){for(let t=0,i=this.count;t<i;t++)Ft.fromBufferAttribute(this,t),Ft.transformDirection(e),this.setXYZ(t,Ft.x,Ft.y,Ft.z);return this}getComponent(e,t){let i=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(i=tn(i,this.array)),i}setComponent(e,t,i){return this.normalized&&(i=lt(i,this.array)),this.data.array[e*this.data.stride+this.offset+t]=i,this}setX(e,t){return this.normalized&&(t=lt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=lt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=lt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=lt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=tn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=tn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=tn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=tn(t,this.array)),t}setXY(e,t,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=lt(t,this.array),i=lt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this}setXYZ(e,t,i,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=lt(t,this.array),i=lt(i,this.array),s=lt(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=s,this}setXYZW(e,t,i,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=lt(t,this.array),i=lt(i,this.array),s=lt(s,this.array),r=lt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=i,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const s=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new Ct(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new or(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let i=0;i<this.count;i++){const s=i*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class Cc extends xn{static get type(){return"SpriteMaterial"}constructor(e){super(),this.isSpriteMaterial=!0,this.color=new Ue(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let gi;const Yi=new P,_i=new P,yi=new P,vi=new he,qi=new he,Pc=new He,Os=new P,ji=new P,Bs=new P,ul=new he,so=new he,dl=new he;class p0 extends vt{constructor(e=new Cc){if(super(),this.isSprite=!0,this.type="Sprite",gi===void 0){gi=new _t;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),i=new f0(t,5);gi.setIndex([0,1,2,0,2,3]),gi.setAttribute("position",new or(i,3,0,!1)),gi.setAttribute("uv",new or(i,2,3,!1))}this.geometry=gi,this.material=e,this.center=new he(.5,.5)}raycast(e,t){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),_i.setFromMatrixScale(this.matrixWorld),Pc.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),yi.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&_i.multiplyScalar(-yi.z);const i=this.material.rotation;let s,r;i!==0&&(r=Math.cos(i),s=Math.sin(i));const o=this.center;zs(Os.set(-.5,-.5,0),yi,o,_i,s,r),zs(ji.set(.5,-.5,0),yi,o,_i,s,r),zs(Bs.set(.5,.5,0),yi,o,_i,s,r),ul.set(0,0),so.set(1,0),dl.set(1,1);let a=e.ray.intersectTriangle(Os,ji,Bs,!1,Yi);if(a===null&&(zs(ji.set(-.5,.5,0),yi,o,_i,s,r),so.set(0,1),a=e.ray.intersectTriangle(Os,Bs,ji,!1,Yi),a===null))return;const l=e.ray.origin.distanceTo(Yi);l<e.near||l>e.far||t.push({distance:l,point:Yi.clone(),uv:jt.getInterpolation(Yi,Os,ji,Bs,ul,so,dl,new he),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function zs(n,e,t,i,s,r){vi.subVectors(n,t).addScalar(.5).multiply(i),s!==void 0?(qi.x=r*vi.x-s*vi.y,qi.y=s*vi.x+r*vi.y):qi.copy(vi),n.copy(e),n.x+=qi.x,n.y+=qi.y,n.applyMatrix4(Pc)}const fl=new P,pl=new tt,ml=new tt,m0=new P,gl=new He,Hs=new P,ro=new Mn,_l=new He,oo=new fs;class tr extends ut{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=_a,this.bindMatrix=new He,this.bindMatrixInverse=new He,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new On),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let i=0;i<t.count;i++)this.getVertexPosition(i,Hs),this.boundingBox.expandByPoint(Hs)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new Mn),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let i=0;i<t.count;i++)this.getVertexPosition(i,Hs),this.boundingSphere.expandByPoint(Hs)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const i=this.material,s=this.matrixWorld;i!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),ro.copy(this.boundingSphere),ro.applyMatrix4(s),e.ray.intersectsSphere(ro)!==!1&&(_l.copy(s).invert(),oo.copy(e.ray).applyMatrix4(_l),!(this.boundingBox!==null&&oo.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,oo)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new tt,t=this.geometry.attributes.skinWeight;for(let i=0,s=t.count;i<s;i++){e.fromBufferAttribute(t,i);const r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(i,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===_a?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===Nh?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const i=this.skeleton,s=this.geometry;pl.fromBufferAttribute(s.attributes.skinIndex,e),ml.fromBufferAttribute(s.attributes.skinWeight,e),fl.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let r=0;r<4;r++){const o=ml.getComponent(r);if(o!==0){const a=pl.getComponent(r);gl.multiplyMatrices(i.bones[a].matrixWorld,i.boneInverses[a]),t.addScaledVector(m0.copy(fl).applyMatrix4(gl),o)}}return t.applyMatrix4(this.bindMatrixInverse)}}class Ic extends vt{constructor(){super(),this.isBone=!0,this.type="Bone"}}class Mr extends Pt{constructor(e=null,t=1,i=1,s,r,o,a,l,c=1003,h=1003,u,p){super(null,o,a,l,c,h,s,r,u,p),this.isDataTexture=!0,this.image={data:e,width:t,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const yl=new He,g0=new He;class Zo{constructor(e=[],t=[]){this.uuid=Kt(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let i=0,s=this.bones.length;i<s;i++)this.boneInverses.push(new He)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const i=new He;this.bones[e]&&i.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(i)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const i=this.bones[e];i&&i.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const i=this.bones[e];i&&(i.parent&&i.parent.isBone?(i.matrix.copy(i.parent.matrixWorld).invert(),i.matrix.multiply(i.matrixWorld)):i.matrix.copy(i.matrixWorld),i.matrix.decompose(i.position,i.quaternion,i.scale))}}update(){const e=this.bones,t=this.boneInverses,i=this.boneMatrices,s=this.boneTexture;for(let r=0,o=e.length;r<o;r++){const a=e[r]?e[r].matrixWorld:g0;yl.multiplyMatrices(a,t[r]),yl.toArray(i,r*16)}s!==null&&(s.needsUpdate=!0)}clone(){return new Zo(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const i=new Mr(t,e,e,1023,1015);return i.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=i,this}getBoneByName(e){for(let t=0,i=this.bones.length;t<i;t++){const s=this.bones[t];if(s.name===e)return s}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let i=0,s=e.bones.length;i<s;i++){const r=e.bones[i];let o=t[r];o===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",r),o=new Ic),this.bones.push(o),this.boneInverses.push(new He().fromArray(e.boneInverses[i]))}return this.init(),this}toJSON(){const e={metadata:{version:4.6,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,i=this.boneInverses;for(let s=0,r=t.length;s<r;s++){const o=t[s];e.bones.push(o.uuid);const a=i[s];e.boneInverses.push(a.toArray())}return e}}class vl extends Ct{constructor(e,t,i,s=1){super(e,t,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const bi=new He,bl=new He,Vs=[],Ml=new On,_0=new He,Ki=new ut,Ji=new Mn;class Fy extends ut{constructor(e,t,i){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new vl(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<i;s++)this.setMatrixAt(s,_0)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new On),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,bi),Ml.copy(e.boundingBox).applyMatrix4(bi),this.boundingBox.union(Ml)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new Mn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<t;i++)this.getMatrixAt(i,bi),Ji.copy(e.boundingSphere).applyMatrix4(bi),this.boundingSphere.union(Ji)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const i=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=i.length+1,o=e*r+1;for(let a=0;a<i.length;a++)i[a]=s[o+a]}raycast(e,t){const i=this.matrixWorld,s=this.count;if(Ki.geometry=this.geometry,Ki.material=this.material,Ki.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ji.copy(this.boundingSphere),Ji.applyMatrix4(i),e.ray.intersectsSphere(Ji)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,bi),bl.multiplyMatrices(i,bi),Ki.matrixWorld=bl,Ki.raycast(e,Vs);for(let o=0,a=Vs.length;o<a;o++){const l=Vs[o];l.instanceId=r,l.object=this,t.push(l)}Vs.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new vl(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const i=t.morphTargetInfluences,s=i.length+1;this.morphTexture===null&&(this.morphTexture=new Mr(new Float32Array(s*this.count),s,this.count,1028,1015));const r=this.morphTexture.source.data.data;let o=0;for(let c=0;c<i.length;c++)o+=i[c];const a=this.geometry.morphTargetsRelative?1:1-o,l=s*e;r[l]=a,r.set(i,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class y0 extends xn{static get type(){return"LineBasicMaterial"}constructor(e){super(),this.isLineBasicMaterial=!0,this.color=new Ue(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const ar=new P,lr=new P,xl=new He,Zi=new fs,Gs=new Mn,ao=new P,Sl=new P;class Lc extends vt{constructor(e=new _t,t=new y0){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[0];for(let s=1,r=t.count;s<r;s++)ar.fromBufferAttribute(t,s-1),lr.fromBufferAttribute(t,s),i[s]=i[s-1],i[s]+=ar.distanceTo(lr);e.setAttribute("lineDistance",new Ke(i,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const i=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Gs.copy(i.boundingSphere),Gs.applyMatrix4(s),Gs.radius+=r,e.ray.intersectsSphere(Gs)===!1)return;xl.copy(s).invert(),Zi.copy(e.ray).applyMatrix4(xl);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,h=i.index,p=i.attributes.position;if(h!==null){const f=Math.max(0,o.start),g=Math.min(h.count,o.start+o.count);for(let y=f,m=g-1;y<m;y+=c){const d=h.getX(y),v=h.getX(y+1),b=Ws(this,e,Zi,l,d,v);b&&t.push(b)}if(this.isLineLoop){const y=h.getX(g-1),m=h.getX(f),d=Ws(this,e,Zi,l,y,m);d&&t.push(d)}}else{const f=Math.max(0,o.start),g=Math.min(p.count,o.start+o.count);for(let y=f,m=g-1;y<m;y+=c){const d=Ws(this,e,Zi,l,y,y+1);d&&t.push(d)}if(this.isLineLoop){const y=Ws(this,e,Zi,l,g-1,f);y&&t.push(y)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function Ws(n,e,t,i,s,r){const o=n.geometry.attributes.position;if(ar.fromBufferAttribute(o,s),lr.fromBufferAttribute(o,r),t.distanceSqToSegment(ar,lr,ao,Sl)>i)return;ao.applyMatrix4(n.matrixWorld);const l=e.ray.origin.distanceTo(ao);if(!(l<e.near||l>e.far))return{distance:l,point:Sl.clone().applyMatrix4(n.matrixWorld),index:s,face:null,faceIndex:null,barycoord:null,object:n}}const wl=new P,Tl=new P;class Oy extends Lc{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,i=[];for(let s=0,r=t.count;s<r;s+=2)wl.fromBufferAttribute(t,s),Tl.fromBufferAttribute(t,s+1),i[s]=s===0?0:i[s-1],i[s+1]=i[s]+wl.distanceTo(Tl);e.setAttribute("lineDistance",new Ke(i,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class By extends Lc{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class Dc extends xn{static get type(){return"PointsMaterial"}constructor(e){super(),this.isPointsMaterial=!0,this.color=new Ue(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const El=new He,wo=new fs,Xs=new Mn,Ys=new P;class v0 extends vt{constructor(e=new _t,t=new Dc){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const i=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Xs.copy(i.boundingSphere),Xs.applyMatrix4(s),Xs.radius+=r,e.ray.intersectsSphere(Xs)===!1)return;El.copy(s).invert(),wo.copy(e.ray).applyMatrix4(El);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=i.index,u=i.attributes.position;if(c!==null){const p=Math.max(0,o.start),f=Math.min(c.count,o.start+o.count);for(let g=p,y=f;g<y;g++){const m=c.getX(g);Ys.fromBufferAttribute(u,m),Al(Ys,m,l,s,e,t,this)}}else{const p=Math.max(0,o.start),f=Math.min(u.count,o.start+o.count);for(let g=p,y=f;g<y;g++)Ys.fromBufferAttribute(u,g),Al(Ys,g,l,s,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,i=Object.keys(t);if(i.length>0){const s=t[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function Al(n,e,t,i,s,r,o){const a=wo.distanceSqToPoint(n);if(a<t){const l=new P;wo.closestPointToPoint(n,l),l.applyMatrix4(i);const c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}class zy extends Pt{constructor(e,t,i,s,r,o,a,l,c){super(e,t,i,s,r,o,a,l,c),this.isVideoTexture=!0,this.minFilter=o!==void 0?o:1006,this.magFilter=r!==void 0?r:1006,this.generateMipmaps=!1;const h=this;function u(){h.needsUpdate=!0,e.requestVideoFrameCallback(u)}"requestVideoFrameCallback"in e&&e.requestVideoFrameCallback(u)}clone(){return new this.constructor(this.image).copy(this)}update(){const e=this.image;"requestVideoFrameCallback"in e===!1&&e.readyState>=e.HAVE_CURRENT_DATA&&(this.needsUpdate=!0)}}class Nc extends Pt{constructor(e,t,i,s,r,o,a,l,c){super(e,t,i,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class cn{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(e,t){const i=this.getUtoTmapping(e);return this.getPoint(i,t)}getPoints(e=5){const t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return t}getSpacedPoints(e=5){const t=[];for(let i=0;i<=e;i++)t.push(this.getPointAt(i/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let i,s=this.getPoint(0),r=0;t.push(0);for(let o=1;o<=e;o++)i=this.getPoint(o/e),r+=i.distanceTo(s),t.push(r),s=i;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t){const i=this.getLengths();let s=0;const r=i.length;let o;t?o=t:o=e*i[r-1];let a=0,l=r-1,c;for(;a<=l;)if(s=Math.floor(a+(l-a)/2),c=i[s]-o,c<0)a=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,i[s]===o)return s/(r-1);const h=i[s],p=i[s+1]-h,f=(o-h)/p;return(s+f)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);const o=this.getPoint(s),a=this.getPoint(r),l=t||(o.isVector2?new he:new P);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){const i=this.getUtoTmapping(e);return this.getTangent(i,t)}computeFrenetFrames(e,t){const i=new P,s=[],r=[],o=[],a=new P,l=new He;for(let f=0;f<=e;f++){const g=f/e;s[f]=this.getTangentAt(g,new P)}r[0]=new P,o[0]=new P;let c=Number.MAX_VALUE;const h=Math.abs(s[0].x),u=Math.abs(s[0].y),p=Math.abs(s[0].z);h<=c&&(c=h,i.set(1,0,0)),u<=c&&(c=u,i.set(0,1,0)),p<=c&&i.set(0,0,1),a.crossVectors(s[0],i).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let f=1;f<=e;f++){if(r[f]=r[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(s[f-1],s[f]),a.length()>Number.EPSILON){a.normalize();const g=Math.acos(Tt(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(a,g))}o[f].crossVectors(s[f],r[f])}if(t===!0){let f=Math.acos(Tt(r[0].dot(r[e]),-1,1));f/=e,s[0].dot(a.crossVectors(r[0],r[e]))>0&&(f=-f);for(let g=1;g<=e;g++)r[g].applyMatrix4(l.makeRotationAxis(s[g],f*g)),o[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class $o extends cn{constructor(e=0,t=0,i=1,s=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=i,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t=new he){const i=t,s=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);const a=this.aStartAngle+e*r;let l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){const h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),p=l-this.aX,f=c-this.aY;l=p*h-f*u+this.aX,c=p*u+f*h+this.aY}return i.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class b0 extends $o{constructor(e,t,i,s,r,o){super(e,t,i,i,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}}function Qo(){let n=0,e=0,t=0,i=0;function s(r,o,a,l){n=r,e=a,t=-3*r+3*o-2*a-l,i=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){s(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,h,u){let p=(o-r)/c-(a-r)/(c+h)+(a-o)/h,f=(a-o)/h-(l-o)/(h+u)+(l-a)/u;p*=h,f*=h,s(o,a,p,f)},calc:function(r){const o=r*r,a=o*r;return n+e*r+t*o+i*a}}}const qs=new P,lo=new Qo,co=new Qo,ho=new Qo;class M0 extends cn{constructor(e=[],t=!1,i="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=i,this.tension=s}getPoint(e,t=new P){const i=t,s=this.points,r=s.length,o=(r-(this.closed?0:1))*e;let a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,h;this.closed||a>0?c=s[(a-1)%r]:(qs.subVectors(s[0],s[1]).add(s[0]),c=qs);const u=s[a%r],p=s[(a+1)%r];if(this.closed||a+2<r?h=s[(a+2)%r]:(qs.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=qs),this.curveType==="centripetal"||this.curveType==="chordal"){const f=this.curveType==="chordal"?.5:.25;let g=Math.pow(c.distanceToSquared(u),f),y=Math.pow(u.distanceToSquared(p),f),m=Math.pow(p.distanceToSquared(h),f);y<1e-4&&(y=1),g<1e-4&&(g=y),m<1e-4&&(m=y),lo.initNonuniformCatmullRom(c.x,u.x,p.x,h.x,g,y,m),co.initNonuniformCatmullRom(c.y,u.y,p.y,h.y,g,y,m),ho.initNonuniformCatmullRom(c.z,u.z,p.z,h.z,g,y,m)}else this.curveType==="catmullrom"&&(lo.initCatmullRom(c.x,u.x,p.x,h.x,this.tension),co.initCatmullRom(c.y,u.y,p.y,h.y,this.tension),ho.initCatmullRom(c.z,u.z,p.z,h.z,this.tension));return i.set(lo.calc(l),co.calc(l),ho.calc(l)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){const s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const s=e.points[t];this.points.push(new P().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function Rl(n,e,t,i,s){const r=(i-e)*.5,o=(s-t)*.5,a=n*n,l=n*a;return(2*t-2*i+r+o)*l+(-3*t+3*i-2*r-o)*a+r*n+t}function x0(n,e){const t=1-n;return t*t*e}function S0(n,e){return 2*(1-n)*n*e}function w0(n,e){return n*n*e}function as(n,e,t,i){return x0(n,e)+S0(n,t)+w0(n,i)}function T0(n,e){const t=1-n;return t*t*t*e}function E0(n,e){const t=1-n;return 3*t*t*n*e}function A0(n,e){return 3*(1-n)*n*n*e}function R0(n,e){return n*n*n*e}function ls(n,e,t,i,s){return T0(n,e)+E0(n,t)+A0(n,i)+R0(n,s)}class kc extends cn{constructor(e=new he,t=new he,i=new he,s=new he){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new he){const i=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return i.set(ls(e,s.x,r.x,o.x,a.x),ls(e,s.y,r.y,o.y,a.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class C0 extends cn{constructor(e=new P,t=new P,i=new P,s=new P){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=i,this.v3=s}getPoint(e,t=new P){const i=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return i.set(ls(e,s.x,r.x,o.x,a.x),ls(e,s.y,r.y,o.y,a.y),ls(e,s.z,r.z,o.z,a.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class Uc extends cn{constructor(e=new he,t=new he){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new he){const i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new he){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class P0 extends cn{constructor(e=new P,t=new P){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new P){const i=t;return e===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(e).add(this.v1)),i}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new P){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Fc extends cn{constructor(e=new he,t=new he,i=new he){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new he){const i=t,s=this.v0,r=this.v1,o=this.v2;return i.set(as(e,s.x,r.x,o.x),as(e,s.y,r.y,o.y)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Oc extends cn{constructor(e=new P,t=new P,i=new P){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=i}getPoint(e,t=new P){const i=t,s=this.v0,r=this.v1,o=this.v2;return i.set(as(e,s.x,r.x,o.x),as(e,s.y,r.y,o.y),as(e,s.z,r.z,o.z)),i}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Bc extends cn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new he){const i=t,s=this.points,r=(s.length-1)*e,o=Math.floor(r),a=r-o,l=s[o===0?o:o-1],c=s[o],h=s[o>s.length-2?s.length-1:o+1],u=s[o>s.length-3?s.length-1:o+2];return i.set(Rl(a,l.x,c.x,h.x,u.x),Rl(a,l.y,c.y,h.y,u.y)),i}copy(e){super.copy(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const s=e.points[t];this.points.push(s.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,i=this.points.length;t<i;t++){const s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,i=e.points.length;t<i;t++){const s=e.points[t];this.points.push(new he().fromArray(s))}return this}}var cr=Object.freeze({__proto__:null,ArcCurve:b0,CatmullRomCurve3:M0,CubicBezierCurve:kc,CubicBezierCurve3:C0,EllipseCurve:$o,LineCurve:Uc,LineCurve3:P0,QuadraticBezierCurve:Fc,QuadraticBezierCurve3:Oc,SplineCurve:Bc});class I0 extends cn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){const i=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new cr[i](t,e))}return this}getPoint(e,t){const i=e*this.getLength(),s=this.getCurveLengths();let r=0;for(;r<s.length;){if(s[r]>=i){const o=s[r]-i,a=this.curves[r],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}r++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let i=0,s=this.curves.length;i<s;i++)t+=this.curves[i].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let i=0;i<=e;i++)t.push(this.getPoint(i/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let i;for(let s=0,r=this.curves;s<r.length;s++){const o=r[s],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){const h=l[c];i&&i.equals(h)||(t.push(h),i=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){const s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,i=this.curves.length;t<i;t++){const s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,i=e.curves.length;t<i;t++){const s=e.curves[t];this.curves.push(new cr[s.type]().fromJSON(s))}return this}}class To extends I0{constructor(e){super(),this.type="Path",this.currentPoint=new he,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,i=e.length;t<i;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const i=new Uc(this.currentPoint.clone(),new he(e,t));return this.curves.push(i),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,i,s){const r=new Fc(this.currentPoint.clone(),new he(e,t),new he(i,s));return this.curves.push(r),this.currentPoint.set(i,s),this}bezierCurveTo(e,t,i,s,r,o){const a=new kc(this.currentPoint.clone(),new he(e,t),new he(i,s),new he(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),i=new Bc(t);return this.curves.push(i),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,i,s,r,o){const a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,i,s,r,o),this}absarc(e,t,i,s,r,o){return this.absellipse(e,t,i,i,s,r,o),this}ellipse(e,t,i,s,r,o,a,l){const c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+c,t+h,i,s,r,o,a,l),this}absellipse(e,t,i,s,r,o,a,l){const c=new $o(e,t,i,s,r,o,a,l);if(this.curves.length>0){const u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);const h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class $n extends _t{constructor(e=[new he(0,-.5),new he(.5,0),new he(0,.5)],t=12,i=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:i,phiLength:s},t=Math.floor(t),s=Tt(s,0,Math.PI*2);const r=[],o=[],a=[],l=[],c=[],h=1/t,u=new P,p=new he,f=new P,g=new P,y=new P;let m=0,d=0;for(let v=0;v<=e.length-1;v++)switch(v){case 0:m=e[v+1].x-e[v].x,d=e[v+1].y-e[v].y,f.x=d*1,f.y=-m,f.z=d*0,y.copy(f),f.normalize(),l.push(f.x,f.y,f.z);break;case e.length-1:l.push(y.x,y.y,y.z);break;default:m=e[v+1].x-e[v].x,d=e[v+1].y-e[v].y,f.x=d*1,f.y=-m,f.z=d*0,g.copy(f),f.x+=y.x,f.y+=y.y,f.z+=y.z,f.normalize(),l.push(f.x,f.y,f.z),y.copy(g)}for(let v=0;v<=t;v++){const b=i+v*h*s,_=Math.sin(b),E=Math.cos(b);for(let w=0;w<=e.length-1;w++){u.x=e[w].x*_,u.y=e[w].y,u.z=e[w].x*E,o.push(u.x,u.y,u.z),p.x=v/t,p.y=w/(e.length-1),a.push(p.x,p.y);const R=l[3*w+0]*_,I=l[3*w+1],S=l[3*w+0]*E;c.push(R,I,S)}}for(let v=0;v<t;v++)for(let b=0;b<e.length-1;b++){const _=b+v*e.length,E=_,w=_+e.length,R=_+e.length+1,I=_+1;r.push(E,w,I),r.push(R,I,w)}this.setIndex(r),this.setAttribute("position",new Ke(o,3)),this.setAttribute("uv",new Ke(a,2)),this.setAttribute("normal",new Ke(c,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new $n(e.points,e.segments,e.phiStart,e.phiLength)}}class xr extends $n{constructor(e=1,t=1,i=4,s=8){const r=new To;r.absarc(0,-t/2,e,Math.PI*1.5,0),r.absarc(0,t/2,e,0,Math.PI*.5),super(r.getPoints(i),s),this.type="CapsuleGeometry",this.parameters={radius:e,length:t,capSegments:i,radialSegments:s}}static fromJSON(e){return new xr(e.radius,e.length,e.capSegments,e.radialSegments)}}class hr extends _t{constructor(e=1,t=32,i=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:i,thetaLength:s},t=Math.max(3,t);const r=[],o=[],a=[],l=[],c=new P,h=new he;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let u=0,p=3;u<=t;u++,p+=3){const f=i+u/t*s;c.x=e*Math.cos(f),c.y=e*Math.sin(f),o.push(c.x,c.y,c.z),a.push(0,0,1),h.x=(o[p]/e+1)/2,h.y=(o[p+1]/e+1)/2,l.push(h.x,h.y)}for(let u=1;u<=t;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new Ke(o,3)),this.setAttribute("normal",new Ke(a,3)),this.setAttribute("uv",new Ke(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new hr(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class Je extends _t{constructor(e=1,t=1,i=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:i,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};const c=this;s=Math.floor(s),r=Math.floor(r);const h=[],u=[],p=[],f=[];let g=0;const y=[],m=i/2;let d=0;v(),o===!1&&(e>0&&b(!0),t>0&&b(!1)),this.setIndex(h),this.setAttribute("position",new Ke(u,3)),this.setAttribute("normal",new Ke(p,3)),this.setAttribute("uv",new Ke(f,2));function v(){const _=new P,E=new P;let w=0;const R=(t-e)/i;for(let I=0;I<=r;I++){const S=[],x=I/r,A=x*(t-e)+e;for(let O=0;O<=s;O++){const U=O/s,V=U*l+a,F=Math.sin(V),H=Math.cos(V);E.x=A*F,E.y=-x*i+m,E.z=A*H,u.push(E.x,E.y,E.z),_.set(F,R,H).normalize(),p.push(_.x,_.y,_.z),f.push(U,1-x),S.push(g++)}y.push(S)}for(let I=0;I<s;I++)for(let S=0;S<r;S++){const x=y[S][I],A=y[S+1][I],O=y[S+1][I+1],U=y[S][I+1];(e>0||S!==0)&&(h.push(x,A,U),w+=3),(t>0||S!==r-1)&&(h.push(A,O,U),w+=3)}c.addGroup(d,w,0),d+=w}function b(_){const E=g,w=new he,R=new P;let I=0;const S=_===!0?e:t,x=_===!0?1:-1;for(let O=1;O<=s;O++)u.push(0,m*x,0),p.push(0,x,0),f.push(.5,.5),g++;const A=g;for(let O=0;O<=s;O++){const V=O/s*l+a,F=Math.cos(V),H=Math.sin(V);R.x=S*H,R.y=m*x,R.z=S*F,u.push(R.x,R.y,R.z),p.push(0,x,0),w.x=F*.5+.5,w.y=H*.5*x+.5,f.push(w.x,w.y),g++}for(let O=0;O<s;O++){const U=E+O,V=A+O;_===!0?h.push(V,V+1,U):h.push(V+1,V,U),I+=3}c.addGroup(d,I,_===!0?1:2),d+=I}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Je(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Ei extends Je{constructor(e=1,t=1,i=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,i,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:i,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new Ei(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class ea extends _t{constructor(e=[],t=[],i=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:i,detail:s};const r=[],o=[];a(s),c(i),h(),this.setAttribute("position",new Ke(r,3)),this.setAttribute("normal",new Ke(r.slice(),3)),this.setAttribute("uv",new Ke(o,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function a(v){const b=new P,_=new P,E=new P;for(let w=0;w<t.length;w+=3)f(t[w+0],b),f(t[w+1],_),f(t[w+2],E),l(b,_,E,v)}function l(v,b,_,E){const w=E+1,R=[];for(let I=0;I<=w;I++){R[I]=[];const S=v.clone().lerp(_,I/w),x=b.clone().lerp(_,I/w),A=w-I;for(let O=0;O<=A;O++)O===0&&I===w?R[I][O]=S:R[I][O]=S.clone().lerp(x,O/A)}for(let I=0;I<w;I++)for(let S=0;S<2*(w-I)-1;S++){const x=Math.floor(S/2);S%2===0?(p(R[I][x+1]),p(R[I+1][x]),p(R[I][x])):(p(R[I][x+1]),p(R[I+1][x+1]),p(R[I+1][x]))}}function c(v){const b=new P;for(let _=0;_<r.length;_+=3)b.x=r[_+0],b.y=r[_+1],b.z=r[_+2],b.normalize().multiplyScalar(v),r[_+0]=b.x,r[_+1]=b.y,r[_+2]=b.z}function h(){const v=new P;for(let b=0;b<r.length;b+=3){v.x=r[b+0],v.y=r[b+1],v.z=r[b+2];const _=m(v)/2/Math.PI+.5,E=d(v)/Math.PI+.5;o.push(_,1-E)}g(),u()}function u(){for(let v=0;v<o.length;v+=6){const b=o[v+0],_=o[v+2],E=o[v+4],w=Math.max(b,_,E),R=Math.min(b,_,E);w>.9&&R<.1&&(b<.2&&(o[v+0]+=1),_<.2&&(o[v+2]+=1),E<.2&&(o[v+4]+=1))}}function p(v){r.push(v.x,v.y,v.z)}function f(v,b){const _=v*3;b.x=e[_+0],b.y=e[_+1],b.z=e[_+2]}function g(){const v=new P,b=new P,_=new P,E=new P,w=new he,R=new he,I=new he;for(let S=0,x=0;S<r.length;S+=9,x+=6){v.set(r[S+0],r[S+1],r[S+2]),b.set(r[S+3],r[S+4],r[S+5]),_.set(r[S+6],r[S+7],r[S+8]),w.set(o[x+0],o[x+1]),R.set(o[x+2],o[x+3]),I.set(o[x+4],o[x+5]),E.copy(v).add(b).add(_).divideScalar(3);const A=m(E);y(w,x+0,v,A),y(R,x+2,b,A),y(I,x+4,_,A)}}function y(v,b,_,E){E<0&&v.x===1&&(o[b]=v.x-1),_.x===0&&_.z===0&&(o[b]=E/2/Math.PI+.5)}function m(v){return Math.atan2(v.z,-v.x)}function d(v){return Math.atan2(-v.y,Math.sqrt(v.x*v.x+v.z*v.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ea(e.vertices,e.indices,e.radius,e.details)}}class zc extends To{constructor(e){super(e),this.uuid=Kt(),this.type="Shape",this.holes=[]}getPointsHoles(e){const t=[];for(let i=0,s=this.holes.length;i<s;i++)t[i]=this.holes[i].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){const s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){const e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,i=this.holes.length;t<i;t++){const s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,i=e.holes.length;t<i;t++){const s=e.holes[t];this.holes.push(new To().fromJSON(s))}return this}}const L0={triangulate:function(n,e,t=2){const i=e&&e.length,s=i?e[0]*t:n.length;let r=Hc(n,0,s,t,!0);const o=[];if(!r||r.next===r.prev)return o;let a,l,c,h,u,p,f;if(i&&(r=F0(n,e,r,t)),n.length>80*t){a=c=n[0],l=h=n[1];for(let g=t;g<s;g+=t)u=n[g],p=n[g+1],u<a&&(a=u),p<l&&(l=p),u>c&&(c=u),p>h&&(h=p);f=Math.max(c-a,h-l),f=f!==0?32767/f:0}return hs(r,o,t,a,l,f,0),o}};function Hc(n,e,t,i,s){let r,o;if(s===j0(n,e,t,i)>0)for(r=e;r<t;r+=i)o=Cl(r,n[r],n[r+1],o);else for(r=t-i;r>=e;r-=i)o=Cl(r,n[r],n[r+1],o);return o&&Sr(o,o.next)&&(ds(o),o=o.next),o}function ei(n,e){if(!n)return n;e||(e=n);let t=n,i;do if(i=!1,!t.steiner&&(Sr(t,t.next)||yt(t.prev,t,t.next)===0)){if(ds(t),t=e=t.prev,t===t.next)break;i=!0}else t=t.next;while(i||t!==e);return e}function hs(n,e,t,i,s,r,o){if(!n)return;!o&&r&&V0(n,i,s,r);let a=n,l,c;for(;n.prev!==n.next;){if(l=n.prev,c=n.next,r?N0(n,i,s,r):D0(n)){e.push(l.i/t|0),e.push(n.i/t|0),e.push(c.i/t|0),ds(n),n=c.next,a=c.next;continue}if(n=c,n===a){o?o===1?(n=k0(ei(n),e,t),hs(n,e,t,i,s,r,2)):o===2&&U0(n,e,t,i,s,r):hs(ei(n),e,t,i,s,r,1);break}}}function D0(n){const e=n.prev,t=n,i=n.next;if(yt(e,t,i)>=0)return!1;const s=e.x,r=t.x,o=i.x,a=e.y,l=t.y,c=i.y,h=s<r?s<o?s:o:r<o?r:o,u=a<l?a<c?a:c:l<c?l:c,p=s>r?s>o?s:o:r>o?r:o,f=a>l?a>c?a:c:l>c?l:c;let g=i.next;for(;g!==e;){if(g.x>=h&&g.x<=p&&g.y>=u&&g.y<=f&&Si(s,a,r,l,o,c,g.x,g.y)&&yt(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function N0(n,e,t,i){const s=n.prev,r=n,o=n.next;if(yt(s,r,o)>=0)return!1;const a=s.x,l=r.x,c=o.x,h=s.y,u=r.y,p=o.y,f=a<l?a<c?a:c:l<c?l:c,g=h<u?h<p?h:p:u<p?u:p,y=a>l?a>c?a:c:l>c?l:c,m=h>u?h>p?h:p:u>p?u:p,d=Eo(f,g,e,t,i),v=Eo(y,m,e,t,i);let b=n.prevZ,_=n.nextZ;for(;b&&b.z>=d&&_&&_.z<=v;){if(b.x>=f&&b.x<=y&&b.y>=g&&b.y<=m&&b!==s&&b!==o&&Si(a,h,l,u,c,p,b.x,b.y)&&yt(b.prev,b,b.next)>=0||(b=b.prevZ,_.x>=f&&_.x<=y&&_.y>=g&&_.y<=m&&_!==s&&_!==o&&Si(a,h,l,u,c,p,_.x,_.y)&&yt(_.prev,_,_.next)>=0))return!1;_=_.nextZ}for(;b&&b.z>=d;){if(b.x>=f&&b.x<=y&&b.y>=g&&b.y<=m&&b!==s&&b!==o&&Si(a,h,l,u,c,p,b.x,b.y)&&yt(b.prev,b,b.next)>=0)return!1;b=b.prevZ}for(;_&&_.z<=v;){if(_.x>=f&&_.x<=y&&_.y>=g&&_.y<=m&&_!==s&&_!==o&&Si(a,h,l,u,c,p,_.x,_.y)&&yt(_.prev,_,_.next)>=0)return!1;_=_.nextZ}return!0}function k0(n,e,t){let i=n;do{const s=i.prev,r=i.next.next;!Sr(s,r)&&Vc(s,i,i.next,r)&&us(s,r)&&us(r,s)&&(e.push(s.i/t|0),e.push(i.i/t|0),e.push(r.i/t|0),ds(i),ds(i.next),i=n=r),i=i.next}while(i!==n);return ei(i)}function U0(n,e,t,i,s,r){let o=n;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&X0(o,a)){let l=Gc(o,a);o=ei(o,o.next),l=ei(l,l.next),hs(o,e,t,i,s,r,0),hs(l,e,t,i,s,r,0);return}a=a.next}o=o.next}while(o!==n)}function F0(n,e,t,i){const s=[];let r,o,a,l,c;for(r=0,o=e.length;r<o;r++)a=e[r]*i,l=r<o-1?e[r+1]*i:n.length,c=Hc(n,a,l,i,!1),c===c.next&&(c.steiner=!0),s.push(W0(c));for(s.sort(O0),r=0;r<s.length;r++)t=B0(s[r],t);return t}function O0(n,e){return n.x-e.x}function B0(n,e){const t=z0(n,e);if(!t)return e;const i=Gc(t,n);return ei(i,i.next),ei(t,t.next)}function z0(n,e){let t=e,i=-1/0,s;const r=n.x,o=n.y;do{if(o<=t.y&&o>=t.next.y&&t.next.y!==t.y){const p=t.x+(o-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(p<=r&&p>i&&(i=p,s=t.x<t.next.x?t:t.next,p===r))return s}t=t.next}while(t!==e);if(!s)return null;const a=s,l=s.x,c=s.y;let h=1/0,u;t=s;do r>=t.x&&t.x>=l&&r!==t.x&&Si(o<c?r:i,o,l,c,o<c?i:r,o,t.x,t.y)&&(u=Math.abs(o-t.y)/(r-t.x),us(t,n)&&(u<h||u===h&&(t.x>s.x||t.x===s.x&&H0(s,t)))&&(s=t,h=u)),t=t.next;while(t!==a);return s}function H0(n,e){return yt(n.prev,n,e.prev)<0&&yt(e.next,n,n.next)<0}function V0(n,e,t,i){let s=n;do s.z===0&&(s.z=Eo(s.x,s.y,e,t,i)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==n);s.prevZ.nextZ=null,s.prevZ=null,G0(s)}function G0(n){let e,t,i,s,r,o,a,l,c=1;do{for(t=n,n=null,r=null,o=0;t;){for(o++,i=t,a=0,e=0;e<c&&(a++,i=i.nextZ,!!i);e++);for(l=c;a>0||l>0&&i;)a!==0&&(l===0||!i||t.z<=i.z)?(s=t,t=t.nextZ,a--):(s=i,i=i.nextZ,l--),r?r.nextZ=s:n=s,s.prevZ=r,r=s;t=i}r.nextZ=null,c*=2}while(o>1);return n}function Eo(n,e,t,i,s){return n=(n-t)*s|0,e=(e-i)*s|0,n=(n|n<<8)&16711935,n=(n|n<<4)&252645135,n=(n|n<<2)&858993459,n=(n|n<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,n|e<<1}function W0(n){let e=n,t=n;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==n);return t}function Si(n,e,t,i,s,r,o,a){return(s-o)*(e-a)>=(n-o)*(r-a)&&(n-o)*(i-a)>=(t-o)*(e-a)&&(t-o)*(r-a)>=(s-o)*(i-a)}function X0(n,e){return n.next.i!==e.i&&n.prev.i!==e.i&&!Y0(n,e)&&(us(n,e)&&us(e,n)&&q0(n,e)&&(yt(n.prev,n,e.prev)||yt(n,e.prev,e))||Sr(n,e)&&yt(n.prev,n,n.next)>0&&yt(e.prev,e,e.next)>0)}function yt(n,e,t){return(e.y-n.y)*(t.x-e.x)-(e.x-n.x)*(t.y-e.y)}function Sr(n,e){return n.x===e.x&&n.y===e.y}function Vc(n,e,t,i){const s=Ks(yt(n,e,t)),r=Ks(yt(n,e,i)),o=Ks(yt(t,i,n)),a=Ks(yt(t,i,e));return!!(s!==r&&o!==a||s===0&&js(n,t,e)||r===0&&js(n,i,e)||o===0&&js(t,n,i)||a===0&&js(t,e,i))}function js(n,e,t){return e.x<=Math.max(n.x,t.x)&&e.x>=Math.min(n.x,t.x)&&e.y<=Math.max(n.y,t.y)&&e.y>=Math.min(n.y,t.y)}function Ks(n){return n>0?1:n<0?-1:0}function Y0(n,e){let t=n;do{if(t.i!==n.i&&t.next.i!==n.i&&t.i!==e.i&&t.next.i!==e.i&&Vc(t,t.next,n,e))return!0;t=t.next}while(t!==n);return!1}function us(n,e){return yt(n.prev,n,n.next)<0?yt(n,e,n.next)>=0&&yt(n,n.prev,e)>=0:yt(n,e,n.prev)<0||yt(n,n.next,e)<0}function q0(n,e){let t=n,i=!1;const s=(n.x+e.x)/2,r=(n.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(i=!i),t=t.next;while(t!==n);return i}function Gc(n,e){const t=new Ao(n.i,n.x,n.y),i=new Ao(e.i,e.x,e.y),s=n.next,r=e.prev;return n.next=e,e.prev=n,t.next=s,s.prev=t,i.next=t,t.prev=i,r.next=i,i.prev=r,i}function Cl(n,e,t,i){const s=new Ao(n,e,t);return i?(s.next=i.next,s.prev=i,i.next.prev=s,i.next=s):(s.prev=s,s.next=s),s}function ds(n){n.next.prev=n.prev,n.prev.next=n.next,n.prevZ&&(n.prevZ.nextZ=n.nextZ),n.nextZ&&(n.nextZ.prevZ=n.prevZ)}function Ao(n,e,t){this.i=n,this.x=e,this.y=t,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function j0(n,e,t,i){let s=0;for(let r=e,o=t-i;r<t;r+=i)s+=(n[o]-n[r])*(n[r+1]+n[o+1]),o=r;return s}class kn{static area(e){const t=e.length;let i=0;for(let s=t-1,r=0;r<t;s=r++)i+=e[s].x*e[r].y-e[r].x*e[s].y;return i*.5}static isClockWise(e){return kn.area(e)<0}static triangulateShape(e,t){const i=[],s=[],r=[];Pl(e),Il(i,e);let o=e.length;t.forEach(Pl);for(let l=0;l<t.length;l++)s.push(o),o+=t[l].length,Il(i,t[l]);const a=L0.triangulate(i,s);for(let l=0;l<a.length;l+=3)r.push(a.slice(l,l+3));return r}}function Pl(n){const e=n.length;e>2&&n[e-1].equals(n[0])&&n.pop()}function Il(n,e){for(let t=0;t<e.length;t++)n.push(e[t].x),n.push(e[t].y)}class Wc extends _t{constructor(e=new zc([new he(.5,.5),new he(-.5,.5),new he(-.5,-.5),new he(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];const i=this,s=[],r=[];for(let a=0,l=e.length;a<l;a++){const c=e[a];o(c)}this.setAttribute("position",new Ke(s,3)),this.setAttribute("uv",new Ke(r,2)),this.computeVertexNormals();function o(a){const l=[],c=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,u=t.depth!==void 0?t.depth:1;let p=t.bevelEnabled!==void 0?t.bevelEnabled:!0,f=t.bevelThickness!==void 0?t.bevelThickness:.2,g=t.bevelSize!==void 0?t.bevelSize:f-.1,y=t.bevelOffset!==void 0?t.bevelOffset:0,m=t.bevelSegments!==void 0?t.bevelSegments:3;const d=t.extrudePath,v=t.UVGenerator!==void 0?t.UVGenerator:K0;let b,_=!1,E,w,R,I;d&&(b=d.getSpacedPoints(h),_=!0,p=!1,E=d.computeFrenetFrames(h,!1),w=new P,R=new P,I=new P),p||(m=0,f=0,g=0,y=0);const S=a.extractPoints(c);let x=S.shape;const A=S.holes;if(!kn.isClockWise(x)){x=x.reverse();for(let q=0,re=A.length;q<re;q++){const D=A[q];kn.isClockWise(D)&&(A[q]=D.reverse())}}const U=kn.triangulateShape(x,A),V=x;for(let q=0,re=A.length;q<re;q++){const D=A[q];x=x.concat(D)}function F(q,re,D){return re||console.error("THREE.ExtrudeGeometry: vec does not exist"),q.clone().addScaledVector(re,D)}const H=x.length,Q=U.length;function Y(q,re,D){let de,le,ye;const pe=q.x-re.x,De=q.y-re.y,Me=D.x-q.x,L=D.y-q.y,T=pe*pe+De*De,k=pe*L-De*Me;if(Math.abs(k)>Number.EPSILON){const $=Math.sqrt(T),se=Math.sqrt(Me*Me+L*L),te=re.x-De/$,Re=re.y+pe/$,ve=D.x-L/se,Te=D.y+Me/se,Ze=((ve-te)*L-(Te-Re)*Me)/(pe*L-De*Me);de=te+pe*Ze-q.x,le=Re+De*Ze-q.y;const fe=de*de+le*le;if(fe<=2)return new he(de,le);ye=Math.sqrt(fe/2)}else{let $=!1;pe>Number.EPSILON?Me>Number.EPSILON&&($=!0):pe<-Number.EPSILON?Me<-Number.EPSILON&&($=!0):Math.sign(De)===Math.sign(L)&&($=!0),$?(de=-De,le=pe,ye=Math.sqrt(T)):(de=pe,le=De,ye=Math.sqrt(T/2))}return new he(de/ye,le/ye)}const M=[];for(let q=0,re=V.length,D=re-1,de=q+1;q<re;q++,D++,de++)D===re&&(D=0),de===re&&(de=0),M[q]=Y(V[q],V[D],V[de]);const N=[];let Z,ce=M.concat();for(let q=0,re=A.length;q<re;q++){const D=A[q];Z=[];for(let de=0,le=D.length,ye=le-1,pe=de+1;de<le;de++,ye++,pe++)ye===le&&(ye=0),pe===le&&(pe=0),Z[de]=Y(D[de],D[ye],D[pe]);N.push(Z),ce=ce.concat(Z)}for(let q=0;q<m;q++){const re=q/m,D=f*Math.cos(re*Math.PI/2),de=g*Math.sin(re*Math.PI/2)+y;for(let le=0,ye=V.length;le<ye;le++){const pe=F(V[le],M[le],de);X(pe.x,pe.y,-D)}for(let le=0,ye=A.length;le<ye;le++){const pe=A[le];Z=N[le];for(let De=0,Me=pe.length;De<Me;De++){const L=F(pe[De],Z[De],de);X(L.x,L.y,-D)}}}const Ce=g+y;for(let q=0;q<H;q++){const re=p?F(x[q],ce[q],Ce):x[q];_?(R.copy(E.normals[0]).multiplyScalar(re.x),w.copy(E.binormals[0]).multiplyScalar(re.y),I.copy(b[0]).add(R).add(w),X(I.x,I.y,I.z)):X(re.x,re.y,0)}for(let q=1;q<=h;q++)for(let re=0;re<H;re++){const D=p?F(x[re],ce[re],Ce):x[re];_?(R.copy(E.normals[q]).multiplyScalar(D.x),w.copy(E.binormals[q]).multiplyScalar(D.y),I.copy(b[q]).add(R).add(w),X(I.x,I.y,I.z)):X(D.x,D.y,u/h*q)}for(let q=m-1;q>=0;q--){const re=q/m,D=f*Math.cos(re*Math.PI/2),de=g*Math.sin(re*Math.PI/2)+y;for(let le=0,ye=V.length;le<ye;le++){const pe=F(V[le],M[le],de);X(pe.x,pe.y,u+D)}for(let le=0,ye=A.length;le<ye;le++){const pe=A[le];Z=N[le];for(let De=0,Me=pe.length;De<Me;De++){const L=F(pe[De],Z[De],de);_?X(L.x,L.y+b[h-1].y,b[h-1].x+D):X(L.x,L.y,u+D)}}}J(),ue();function J(){const q=s.length/3;if(p){let re=0,D=H*re;for(let de=0;de<Q;de++){const le=U[de];ne(le[2]+D,le[1]+D,le[0]+D)}re=h+m*2,D=H*re;for(let de=0;de<Q;de++){const le=U[de];ne(le[0]+D,le[1]+D,le[2]+D)}}else{for(let re=0;re<Q;re++){const D=U[re];ne(D[2],D[1],D[0])}for(let re=0;re<Q;re++){const D=U[re];ne(D[0]+H*h,D[1]+H*h,D[2]+H*h)}}i.addGroup(q,s.length/3-q,0)}function ue(){const q=s.length/3;let re=0;oe(V,re),re+=V.length;for(let D=0,de=A.length;D<de;D++){const le=A[D];oe(le,re),re+=le.length}i.addGroup(q,s.length/3-q,1)}function oe(q,re){let D=q.length;for(;--D>=0;){const de=D;let le=D-1;le<0&&(le=q.length-1);for(let ye=0,pe=h+m*2;ye<pe;ye++){const De=H*ye,Me=H*(ye+1),L=re+de+De,T=re+le+De,k=re+le+Me,$=re+de+Me;ge(L,T,k,$)}}}function X(q,re,D){l.push(q),l.push(re),l.push(D)}function ne(q,re,D){ee(q),ee(re),ee(D);const de=s.length/3,le=v.generateTopUV(i,s,de-3,de-2,de-1);B(le[0]),B(le[1]),B(le[2])}function ge(q,re,D,de){ee(q),ee(re),ee(de),ee(re),ee(D),ee(de);const le=s.length/3,ye=v.generateSideWallUV(i,s,le-6,le-3,le-2,le-1);B(ye[0]),B(ye[1]),B(ye[3]),B(ye[1]),B(ye[2]),B(ye[3])}function ee(q){s.push(l[q*3+0]),s.push(l[q*3+1]),s.push(l[q*3+2])}function B(q){r.push(q.x),r.push(q.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes,i=this.parameters.options;return J0(t,i,e)}static fromJSON(e,t){const i=[];for(let r=0,o=e.shapes.length;r<o;r++){const a=t[e.shapes[r]];i.push(a)}const s=e.options.extrudePath;return s!==void 0&&(e.options.extrudePath=new cr[s.type]().fromJSON(s)),new Wc(i,e.options)}}const K0={generateTopUV:function(n,e,t,i,s){const r=e[t*3],o=e[t*3+1],a=e[i*3],l=e[i*3+1],c=e[s*3],h=e[s*3+1];return[new he(r,o),new he(a,l),new he(c,h)]},generateSideWallUV:function(n,e,t,i,s,r){const o=e[t*3],a=e[t*3+1],l=e[t*3+2],c=e[i*3],h=e[i*3+1],u=e[i*3+2],p=e[s*3],f=e[s*3+1],g=e[s*3+2],y=e[r*3],m=e[r*3+1],d=e[r*3+2];return Math.abs(a-h)<Math.abs(o-c)?[new he(o,1-l),new he(c,1-u),new he(p,1-g),new he(y,1-d)]:[new he(a,1-l),new he(h,1-u),new he(f,1-g),new he(m,1-d)]}};function J0(n,e,t){if(t.shapes=[],Array.isArray(n))for(let i=0,s=n.length;i<s;i++){const r=n[i];t.shapes.push(r.uuid)}else t.shapes.push(n.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}class Xc extends ea{constructor(e=1,t=0){const i=(1+Math.sqrt(5))/2,s=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new Xc(e.radius,e.detail)}}class ur extends _t{constructor(e=.5,t=1,i=32,s=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:i,phiSegments:s,thetaStart:r,thetaLength:o},i=Math.max(3,i),s=Math.max(1,s);const a=[],l=[],c=[],h=[];let u=e;const p=(t-e)/s,f=new P,g=new he;for(let y=0;y<=s;y++){for(let m=0;m<=i;m++){const d=r+m/i*o;f.x=u*Math.cos(d),f.y=u*Math.sin(d),l.push(f.x,f.y,f.z),c.push(0,0,1),g.x=(f.x/t+1)/2,g.y=(f.y/t+1)/2,h.push(g.x,g.y)}u+=p}for(let y=0;y<s;y++){const m=y*(i+1);for(let d=0;d<i;d++){const v=d+m,b=v,_=v+i+1,E=v+i+2,w=v+1;a.push(b,_,w),a.push(_,E,w)}}this.setIndex(a),this.setAttribute("position",new Ke(l,3)),this.setAttribute("normal",new Ke(c,3)),this.setAttribute("uv",new Ke(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ur(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class Yc extends _t{constructor(e=new zc([new he(0,.5),new he(-.5,-.5),new he(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};const i=[],s=[],r=[],o=[];let a=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let h=0;h<e.length;h++)c(e[h]),this.addGroup(a,l,h),a+=l,l=0;this.setIndex(i),this.setAttribute("position",new Ke(s,3)),this.setAttribute("normal",new Ke(r,3)),this.setAttribute("uv",new Ke(o,2));function c(h){const u=s.length/3,p=h.extractPoints(t);let f=p.shape;const g=p.holes;kn.isClockWise(f)===!1&&(f=f.reverse());for(let m=0,d=g.length;m<d;m++){const v=g[m];kn.isClockWise(v)===!0&&(g[m]=v.reverse())}const y=kn.triangulateShape(f,g);for(let m=0,d=g.length;m<d;m++){const v=g[m];f=f.concat(v)}for(let m=0,d=f.length;m<d;m++){const v=f[m];s.push(v.x,v.y,0),r.push(0,0,1),o.push(v.x,v.y)}for(let m=0,d=y.length;m<d;m++){const v=y[m],b=v[0]+u,_=v[1]+u,E=v[2]+u;i.push(b,_,E),l+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes;return Z0(t,e)}static fromJSON(e,t){const i=[];for(let s=0,r=e.shapes.length;s<r;s++){const o=t[e.shapes[s]];i.push(o)}return new Yc(i,e.curveSegments)}}function Z0(n,e){if(e.shapes=[],Array.isArray(n))for(let t=0,i=n.length;t<i;t++){const s=n[t];e.shapes.push(s.uuid)}else e.shapes.push(n.uuid);return e}class Mt extends _t{constructor(e=1,t=32,i=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:i,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),i=Math.max(2,Math.floor(i));const l=Math.min(o+a,Math.PI);let c=0;const h=[],u=new P,p=new P,f=[],g=[],y=[],m=[];for(let d=0;d<=i;d++){const v=[],b=d/i;let _=0;d===0&&o===0?_=.5/t:d===i&&l===Math.PI&&(_=-.5/t);for(let E=0;E<=t;E++){const w=E/t;u.x=-e*Math.cos(s+w*r)*Math.sin(o+b*a),u.y=e*Math.cos(o+b*a),u.z=e*Math.sin(s+w*r)*Math.sin(o+b*a),g.push(u.x,u.y,u.z),p.copy(u).normalize(),y.push(p.x,p.y,p.z),m.push(w+_,1-b),v.push(c++)}h.push(v)}for(let d=0;d<i;d++)for(let v=0;v<t;v++){const b=h[d][v+1],_=h[d][v],E=h[d+1][v],w=h[d+1][v+1];(d!==0||o>0)&&f.push(b,_,w),(d!==i-1||l<Math.PI)&&f.push(_,E,w)}this.setIndex(f),this.setAttribute("position",new Ke(g,3)),this.setAttribute("normal",new Ke(y,3)),this.setAttribute("uv",new Ke(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Mt(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class sn extends _t{constructor(e=1,t=.4,i=12,s=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:i,tubularSegments:s,arc:r},i=Math.floor(i),s=Math.floor(s);const o=[],a=[],l=[],c=[],h=new P,u=new P,p=new P;for(let f=0;f<=i;f++)for(let g=0;g<=s;g++){const y=g/s*r,m=f/i*Math.PI*2;u.x=(e+t*Math.cos(m))*Math.cos(y),u.y=(e+t*Math.cos(m))*Math.sin(y),u.z=t*Math.sin(m),a.push(u.x,u.y,u.z),h.x=e*Math.cos(y),h.y=e*Math.sin(y),p.subVectors(u,h).normalize(),l.push(p.x,p.y,p.z),c.push(g/s),c.push(f/i)}for(let f=1;f<=i;f++)for(let g=1;g<=s;g++){const y=(s+1)*f+g-1,m=(s+1)*(f-1)+g-1,d=(s+1)*(f-1)+g,v=(s+1)*f+g;o.push(y,m,v),o.push(m,d,v)}this.setIndex(o),this.setAttribute("position",new Ke(a,3)),this.setAttribute("normal",new Ke(l,3)),this.setAttribute("uv",new Ke(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new sn(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class qc extends _t{constructor(e=new Oc(new P(-1,-1,0),new P(-1,1,0),new P(1,1,0)),t=64,i=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:i,radialSegments:s,closed:r};const o=e.computeFrenetFrames(t,r);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;const a=new P,l=new P,c=new he;let h=new P;const u=[],p=[],f=[],g=[];y(),this.setIndex(g),this.setAttribute("position",new Ke(u,3)),this.setAttribute("normal",new Ke(p,3)),this.setAttribute("uv",new Ke(f,2));function y(){for(let b=0;b<t;b++)m(b);m(r===!1?t:0),v(),d()}function m(b){h=e.getPointAt(b/t,h);const _=o.normals[b],E=o.binormals[b];for(let w=0;w<=s;w++){const R=w/s*Math.PI*2,I=Math.sin(R),S=-Math.cos(R);l.x=S*_.x+I*E.x,l.y=S*_.y+I*E.y,l.z=S*_.z+I*E.z,l.normalize(),p.push(l.x,l.y,l.z),a.x=h.x+i*l.x,a.y=h.y+i*l.y,a.z=h.z+i*l.z,u.push(a.x,a.y,a.z)}}function d(){for(let b=1;b<=t;b++)for(let _=1;_<=s;_++){const E=(s+1)*(b-1)+(_-1),w=(s+1)*b+(_-1),R=(s+1)*b+_,I=(s+1)*(b-1)+_;g.push(E,w,I),g.push(w,R,I)}}function v(){for(let b=0;b<=t;b++)for(let _=0;_<=s;_++)c.x=b/t,c.y=_/s,f.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new qc(new cr[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}}class St extends xn{static get type(){return"MeshStandardMaterial"}constructor(e){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new Ue(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ue(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new he(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new rn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Hy extends St{static get type(){return"MeshPhysicalMaterial"}constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new he(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Tt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Ue(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Ue(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Ue(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class $0 extends xn{static get type(){return"MeshToonMaterial"}constructor(e){super(),this.isMeshToonMaterial=!0,this.defines={TOON:""},this.color=new Ue(16777215),this.map=null,this.gradientMap=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ue(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=0,this.normalScale=new he(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.gradientMap=e.gradientMap,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.alphaMap=e.alphaMap,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}function Js(n,e,t){return!n||!t&&n.constructor===e?n:typeof e.BYTES_PER_ELEMENT=="number"?new e(n):Array.prototype.slice.call(n)}function Q0(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function eg(n){function e(s,r){return n[s]-n[r]}const t=n.length,i=new Array(t);for(let s=0;s!==t;++s)i[s]=s;return i.sort(e),i}function Ll(n,e,t){const i=n.length,s=new n.constructor(i);for(let r=0,o=0;o!==i;++r){const a=t[r]*e;for(let l=0;l!==e;++l)s[o++]=n[a+l]}return s}function jc(n,e,t,i){let s=1,r=n[0];for(;r!==void 0&&r[i]===void 0;)r=n[s++];if(r===void 0)return;let o=r[i];if(o!==void 0)if(Array.isArray(o))do o=r[i],o!==void 0&&(e.push(r.time),t.push.apply(t,o)),r=n[s++];while(r!==void 0);else if(o.toArray!==void 0)do o=r[i],o!==void 0&&(e.push(r.time),o.toArray(t,t.length)),r=n[s++];while(r!==void 0);else do o=r[i],o!==void 0&&(e.push(r.time),t.push(o)),r=n[s++];while(r!==void 0)}class wr{constructor(e,t,i,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(i),this.sampleValues=t,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let i=this._cachedIndex,s=t[i],r=t[i-1];e:{t:{let o;n:{i:if(!(e<s)){for(let a=i+2;;){if(s===void 0){if(e<r)break i;return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(r=s,s=t[++i],e<s)break t}o=t.length;break n}if(!(e>=r)){const a=t[1];e<a&&(i=2,r=a);for(let l=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(s=r,r=t[--i-1],e>=r)break t}o=i,i=0;break n}break e}for(;i<o;){const a=i+o>>>1;e<t[a]?o=a:i=a+1}if(s=t[i],r=t[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=t.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,s)}return this.interpolate_(i,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,i=this.sampleValues,s=this.valueSize,r=e*s;for(let o=0;o!==s;++o)t[o]=i[r+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}}class tg extends wr{constructor(e,t,i,s){super(e,t,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:2400,endingEnd:2400}}intervalChanged_(e,t,i){const s=this.parameterPositions;let r=e-2,o=e+1,a=s[r],l=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case 2401:r=e,a=2*t-i;break;case 2402:r=s.length-2,a=t+s[r]-s[r+1];break;default:r=e,a=i}if(l===void 0)switch(this.getSettings_().endingEnd){case 2401:o=e,l=2*i-t;break;case 2402:o=1,l=i+s[1]-s[0];break;default:o=e-1,l=t}const c=(i-t)*.5,h=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-i),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(e,t,i,s){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=this._offsetPrev,u=this._offsetNext,p=this._weightPrev,f=this._weightNext,g=(i-t)/(s-t),y=g*g,m=y*g,d=-p*m+2*p*y-p*g,v=(1+p)*m+(-1.5-2*p)*y+(-.5+p)*g+1,b=(-1-f)*m+(1.5+f)*y+.5*g,_=f*m-f*y;for(let E=0;E!==a;++E)r[E]=d*o[h+E]+v*o[c+E]+b*o[l+E]+_*o[u+E];return r}}class Kc extends wr{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=(i-t)/(s-t),u=1-h;for(let p=0;p!==a;++p)r[p]=o[c+p]*u+o[l+p]*h;return r}}class ng extends wr{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e){return this.copySampleValue_(e-1)}}class hn{constructor(e,t,i,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Js(t,this.TimeBufferType),this.values=Js(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let i;if(t.toJSON!==this.toJSON)i=t.toJSON(e);else{i={name:e.name,times:Js(e.times,Array),values:Js(e.values,Array)};const s=e.getInterpolation();s!==e.DefaultInterpolation&&(i.interpolation=s)}return i.type=e.ValueTypeName,i}InterpolantFactoryMethodDiscrete(e){return new ng(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Kc(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new tg(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case 2300:t=this.InterpolantFactoryMethodDiscrete;break;case 2301:t=this.InterpolantFactoryMethodLinear;break;case 2302:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){const i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return console.warn("THREE.KeyframeTrack:",i),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return 2300;case this.InterpolantFactoryMethodLinear:return 2301;case this.InterpolantFactoryMethodSmooth:return 2302}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let i=0,s=t.length;i!==s;++i)t[i]*=e}return this}trim(e,t){const i=this.times,s=i.length;let r=0,o=s-1;for(;r!==s&&i[r]<e;)++r;for(;o!==-1&&i[o]>t;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);const a=this.getValueSize();this.times=i.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);const i=this.times,s=this.values,r=i.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){const l=i[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(s!==void 0&&Q0(s))for(let a=0,l=s.length;a!==l;++a){const c=s[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===2302,r=e.length-1;let o=1;for(let a=1;a<r;++a){let l=!1;const c=e[a],h=e[a+1];if(c!==h&&(a!==1||c!==e[0]))if(s)l=!0;else{const u=a*i,p=u-i,f=u+i;for(let g=0;g!==i;++g){const y=t[u+g];if(y!==t[p+g]||y!==t[f+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];const u=a*i,p=o*i;for(let f=0;f!==i;++f)t[p+f]=t[u+f]}++o}}if(r>0){e[o]=e[r];for(let a=r*i,l=o*i,c=0;c!==i;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*i)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),i=this.constructor,s=new i(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}}hn.prototype.TimeBufferType=Float32Array;hn.prototype.ValueBufferType=Float32Array;hn.prototype.DefaultInterpolation=2301;class Ui extends hn{constructor(e,t,i){super(e,t,i)}}Ui.prototype.ValueTypeName="bool";Ui.prototype.ValueBufferType=Array;Ui.prototype.DefaultInterpolation=2300;Ui.prototype.InterpolantFactoryMethodLinear=void 0;Ui.prototype.InterpolantFactoryMethodSmooth=void 0;class Jc extends hn{}Jc.prototype.ValueTypeName="color";class dr extends hn{}dr.prototype.ValueTypeName="number";class ig extends wr{constructor(e,t,i,s){super(e,t,i,s)}interpolate_(e,t,i,s){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(i-t)/(s-t);let c=e*a;for(let h=c+a;c!==h;c+=4)rt.slerpFlat(r,0,o,c-a,o,c,l);return r}}class Tr extends hn{InterpolantFactoryMethodLinear(e){return new ig(this.times,this.values,this.getValueSize(),e)}}Tr.prototype.ValueTypeName="quaternion";Tr.prototype.InterpolantFactoryMethodSmooth=void 0;class Fi extends hn{constructor(e,t,i){super(e,t,i)}}Fi.prototype.ValueTypeName="string";Fi.prototype.ValueBufferType=Array;Fi.prototype.DefaultInterpolation=2300;Fi.prototype.InterpolantFactoryMethodLinear=void 0;Fi.prototype.InterpolantFactoryMethodSmooth=void 0;class fr extends hn{}fr.prototype.ValueTypeName="vector";class Dl{constructor(e="",t=-1,i=[],s=2500){this.name=e,this.tracks=i,this.duration=t,this.blendMode=s,this.uuid=Kt(),this.duration<0&&this.resetDuration()}static parse(e){const t=[],i=e.tracks,s=1/(e.fps||1);for(let o=0,a=i.length;o!==a;++o)t.push(rg(i[o]).scale(s));const r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r}static toJSON(e){const t=[],i=e.tracks,s={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode};for(let r=0,o=i.length;r!==o;++r)t.push(hn.toJSON(i[r]));return s}static CreateFromMorphTargetSequence(e,t,i,s){const r=t.length,o=[];for(let a=0;a<r;a++){let l=[],c=[];l.push((a+r-1)%r,a,(a+1)%r),c.push(0,1,0);const h=eg(l);l=Ll(l,1,h),c=Ll(c,1,h),!s&&l[0]===0&&(l.push(r),c.push(c[0])),o.push(new dr(".morphTargetInfluences["+t[a].name+"]",l,c).scale(1/i))}return new this(e,-1,o)}static findByName(e,t){let i=e;if(!Array.isArray(e)){const s=e;i=s.geometry&&s.geometry.animations||s.animations}for(let s=0;s<i.length;s++)if(i[s].name===t)return i[s];return null}static CreateClipsFromMorphTargetSequences(e,t,i){const s={},r=/^([\w-]*?)([\d]+)$/;for(let a=0,l=e.length;a<l;a++){const c=e[a],h=c.name.match(r);if(h&&h.length>1){const u=h[1];let p=s[u];p||(s[u]=p=[]),p.push(c)}}const o=[];for(const a in s)o.push(this.CreateFromMorphTargetSequence(a,s[a],t,i));return o}static parseAnimation(e,t){if(!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;const i=function(u,p,f,g,y){if(f.length!==0){const m=[],d=[];jc(f,m,d,g),m.length!==0&&y.push(new u(p,m,d))}},s=[],r=e.name||"default",o=e.fps||30,a=e.blendMode;let l=e.length||-1;const c=e.hierarchy||[];for(let u=0;u<c.length;u++){const p=c[u].keys;if(!(!p||p.length===0))if(p[0].morphTargets){const f={};let g;for(g=0;g<p.length;g++)if(p[g].morphTargets)for(let y=0;y<p[g].morphTargets.length;y++)f[p[g].morphTargets[y]]=-1;for(const y in f){const m=[],d=[];for(let v=0;v!==p[g].morphTargets.length;++v){const b=p[g];m.push(b.time),d.push(b.morphTarget===y?1:0)}s.push(new dr(".morphTargetInfluence["+y+"]",m,d))}l=f.length*o}else{const f=".bones["+t[u].name+"]";i(fr,f+".position",p,"pos",s),i(Tr,f+".quaternion",p,"rot",s),i(fr,f+".scale",p,"scl",s)}}return s.length===0?null:new this(r,l,s,a)}resetDuration(){const e=this.tracks;let t=0;for(let i=0,s=e.length;i!==s;++i){const r=this.tracks[i];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let t=0;t<this.tracks.length;t++)e.push(this.tracks[t].clone());return new this.constructor(this.name,this.duration,e,this.blendMode)}toJSON(){return this.constructor.toJSON(this)}}function sg(n){switch(n.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return dr;case"vector":case"vector2":case"vector3":case"vector4":return fr;case"color":return Jc;case"quaternion":return Tr;case"bool":case"boolean":return Ui;case"string":return Fi}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+n)}function rg(n){if(n.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=sg(n.type);if(n.times===void 0){const t=[],i=[];jc(n.keys,t,i,"value"),n.times=t,n.values=i}return e.parse!==void 0?e.parse(n):new e(n.name,n.times,n.values,n.interpolation)}const Dn={enabled:!1,files:{},add:function(n,e){this.enabled!==!1&&(this.files[n]=e)},get:function(n){if(this.enabled!==!1)return this.files[n]},remove:function(n){delete this.files[n]},clear:function(){this.files={}}};class og{constructor(e,t,i){const s=this;let r=!1,o=0,a=0,l;const c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=i,this.itemStart=function(h){a++,r===!1&&s.onStart!==void 0&&s.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,s.onProgress!==void 0&&s.onProgress(h,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){const u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,p=c.length;u<p;u+=2){const f=c[u],g=c[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return g}return null}}}const ag=new og;class Oi{constructor(e){this.manager=e!==void 0?e:ag,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const i=this;return new Promise(function(s,r){i.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}}Oi.DEFAULT_MATERIAL_NAME="__DEFAULT";const yn={};class lg extends Error{constructor(e,t){super(e),this.response=t}}class cg extends Oi{constructor(e){super(e)}load(e,t,i,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=Dn.get(e);if(r!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0),r;if(yn[e]!==void 0){yn[e].push({onLoad:t,onProgress:i,onError:s});return}yn[e]=[],yn[e].push({onLoad:t,onProgress:i,onError:s});const o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin"}),a=this.mimeType,l=this.responseType;fetch(o).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;const h=yn[e],u=c.body.getReader(),p=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),f=p?parseInt(p):0,g=f!==0;let y=0;const m=new ReadableStream({start(d){v();function v(){u.read().then(({done:b,value:_})=>{if(b)d.close();else{y+=_.byteLength;const E=new ProgressEvent("progress",{lengthComputable:g,loaded:y,total:f});for(let w=0,R=h.length;w<R;w++){const I=h[w];I.onProgress&&I.onProgress(E)}d.enqueue(_),v()}},b=>{d.error(b)})}}});return new Response(m)}else throw new lg(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(h=>new DOMParser().parseFromString(h,a));case"json":return c.json();default:if(a===void 0)return c.text();{const u=/charset="?([^;"\s]*)"?/i.exec(a),p=u&&u[1]?u[1].toLowerCase():void 0,f=new TextDecoder(p);return c.arrayBuffer().then(g=>f.decode(g))}}}).then(c=>{Dn.add(e,c);const h=yn[e];delete yn[e];for(let u=0,p=h.length;u<p;u++){const f=h[u];f.onLoad&&f.onLoad(c)}}).catch(c=>{const h=yn[e];if(h===void 0)throw this.manager.itemError(e),c;delete yn[e];for(let u=0,p=h.length;u<p;u++){const f=h[u];f.onError&&f.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}}class hg extends Oi{constructor(e){super(e)}load(e,t,i,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,o=Dn.get(e);if(o!==void 0)return r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o;const a=cs("img");function l(){h(),Dn.add(e,this),t&&t(this),r.manager.itemEnd(e)}function c(u){h(),s&&s(u),r.manager.itemError(e),r.manager.itemEnd(e)}function h(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),r.manager.itemStart(e),a.src=e,a}}class Vy extends Oi{constructor(e){super(e)}load(e,t,i,s){const r=this,o=new Mr,a=new cg(this.manager);return a.setResponseType("arraybuffer"),a.setRequestHeader(this.requestHeader),a.setPath(this.path),a.setWithCredentials(r.withCredentials),a.load(e,function(l){let c;try{c=r.parse(l)}catch(h){if(s!==void 0)s(h);else{console.error(h);return}}c.image!==void 0?o.image=c.image:c.data!==void 0&&(o.image.width=c.width,o.image.height=c.height,o.image.data=c.data),o.wrapS=c.wrapS!==void 0?c.wrapS:1001,o.wrapT=c.wrapT!==void 0?c.wrapT:1001,o.magFilter=c.magFilter!==void 0?c.magFilter:1006,o.minFilter=c.minFilter!==void 0?c.minFilter:1006,o.anisotropy=c.anisotropy!==void 0?c.anisotropy:1,c.colorSpace!==void 0&&(o.colorSpace=c.colorSpace),c.flipY!==void 0&&(o.flipY=c.flipY),c.format!==void 0&&(o.format=c.format),c.type!==void 0&&(o.type=c.type),c.mipmaps!==void 0&&(o.mipmaps=c.mipmaps,o.minFilter=1008),c.mipmapCount===1&&(o.minFilter=1006),c.generateMipmaps!==void 0&&(o.generateMipmaps=c.generateMipmaps),o.needsUpdate=!0,t&&t(o,c)},i,s),o}}class ug extends Oi{constructor(e){super(e)}load(e,t,i,s){const r=new Pt,o=new hg(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},i,s),r}}class Er extends vt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ue(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}class Gy extends Er{constructor(e,t,i){super(e,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(vt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ue(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const uo=new He,Nl=new P,kl=new P;class ta{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new he(512,512),this.map=null,this.mapPass=null,this.matrix=new He,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Ko,this._frameExtents=new he(1,1),this._viewportCount=1,this._viewports=[new tt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,i=this.matrix;Nl.setFromMatrixPosition(e.matrixWorld),t.position.copy(Nl),kl.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(kl),t.updateMatrixWorld(),uo.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(uo),i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(uo)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class dg extends ta{constructor(){super(new Wt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1}updateMatrices(e){const t=this.camera,i=Pi*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height,r=e.distance||t.far;(i!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=i,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class Wy extends Er{constructor(e,t,i=0,s=Math.PI/3,r=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(vt.DEFAULT_UP),this.updateMatrix(),this.target=new vt,this.distance=i,this.angle=s,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new dg}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}const Ul=new He,$i=new P,fo=new P;class fg extends ta{constructor(){super(new Wt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new he(4,2),this._viewportCount=6,this._viewports=[new tt(2,1,1,1),new tt(0,1,1,1),new tt(3,1,1,1),new tt(1,1,1,1),new tt(3,0,1,1),new tt(1,0,1,1)],this._cubeDirections=[new P(1,0,0),new P(-1,0,0),new P(0,0,1),new P(0,0,-1),new P(0,1,0),new P(0,-1,0)],this._cubeUps=[new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,0,1),new P(0,0,-1)]}updateMatrices(e,t=0){const i=this.camera,s=this.matrix,r=e.distance||i.far;r!==i.far&&(i.far=r,i.updateProjectionMatrix()),$i.setFromMatrixPosition(e.matrixWorld),i.position.copy($i),fo.copy(i.position),fo.add(this._cubeDirections[t]),i.up.copy(this._cubeUps[t]),i.lookAt(fo),i.updateMatrixWorld(),s.makeTranslation(-$i.x,-$i.y,-$i.z),Ul.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Ul)}}class Xy extends Er{constructor(e,t,i=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=s,this.shadow=new fg}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class pg extends ta{constructor(){super(new xc(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Yy extends Er{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(vt.DEFAULT_UP),this.updateMatrix(),this.target=new vt,this.shadow=new pg}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class qy{static decodeText(e){if(console.warn("THREE.LoaderUtils: decodeText() has been deprecated with r165 and will be removed with r175. Use TextDecoder instead."),typeof TextDecoder<"u")return new TextDecoder().decode(e);let t="";for(let i=0,s=e.length;i<s;i++)t+=String.fromCharCode(e[i]);try{return decodeURIComponent(escape(t))}catch{return t}}static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}class jy extends Oi{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"}}setOptions(e){return this.options=e,this}load(e,t,i,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,o=Dn.get(e);if(o!==void 0){if(r.manager.itemStart(e),o.then){o.then(c=>{t&&t(c),r.manager.itemEnd(e)}).catch(c=>{s&&s(c)});return}return setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o}const a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader;const l=fetch(e,a).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign(r.options,{colorSpaceConversion:"none"}))}).then(function(c){return Dn.add(e,c),t&&t(c),r.manager.itemEnd(e),c}).catch(function(c){s&&s(c),Dn.remove(e),r.manager.itemError(e),r.manager.itemEnd(e)});Dn.add(e,l),r.manager.itemStart(e)}}class Ky{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=Fl(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=Fl();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}function Fl(){return performance.now()}class mg{constructor(e,t,i){this.binding=e,this.valueSize=i;let s,r,o;switch(t){case"quaternion":s=this._slerp,r=this._slerpAdditive,o=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(i*6),this._workIndex=5;break;case"string":case"bool":s=this._select,r=this._select,o=this._setAdditiveIdentityOther,this.buffer=new Array(i*5);break;default:s=this._lerp,r=this._lerpAdditive,o=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(i*5)}this._mixBufferRegion=s,this._mixBufferRegionAdditive=r,this._setIdentity=o,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(e,t){const i=this.buffer,s=this.valueSize,r=e*s+s;let o=this.cumulativeWeight;if(o===0){for(let a=0;a!==s;++a)i[r+a]=i[a];o=t}else{o+=t;const a=t/o;this._mixBufferRegion(i,r,0,a,s)}this.cumulativeWeight=o}accumulateAdditive(e){const t=this.buffer,i=this.valueSize,s=i*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(t,s,0,e,i),this.cumulativeWeightAdditive+=e}apply(e){const t=this.valueSize,i=this.buffer,s=e*t+t,r=this.cumulativeWeight,o=this.cumulativeWeightAdditive,a=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,r<1){const l=t*this._origIndex;this._mixBufferRegion(i,s,l,1-r,t)}o>0&&this._mixBufferRegionAdditive(i,s,this._addIndex*t,1,t);for(let l=t,c=t+t;l!==c;++l)if(i[l]!==i[l+t]){a.setValue(i,s);break}}saveOriginalState(){const e=this.binding,t=this.buffer,i=this.valueSize,s=i*this._origIndex;e.getValue(t,s);for(let r=i,o=s;r!==o;++r)t[r]=t[s+r%i];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){const e=this.valueSize*3;this.binding.setValue(this.buffer,e)}_setAdditiveIdentityNumeric(){const e=this._addIndex*this.valueSize,t=e+this.valueSize;for(let i=e;i<t;i++)this.buffer[i]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){const e=this._origIndex*this.valueSize,t=this._addIndex*this.valueSize;for(let i=0;i<this.valueSize;i++)this.buffer[t+i]=this.buffer[e+i]}_select(e,t,i,s,r){if(s>=.5)for(let o=0;o!==r;++o)e[t+o]=e[i+o]}_slerp(e,t,i,s){rt.slerpFlat(e,t,e,t,e,i,s)}_slerpAdditive(e,t,i,s,r){const o=this._workIndex*r;rt.multiplyQuaternionsFlat(e,o,e,t,e,i),rt.slerpFlat(e,t,e,t,e,o,s)}_lerp(e,t,i,s,r){const o=1-s;for(let a=0;a!==r;++a){const l=t+a;e[l]=e[l]*o+e[i+a]*s}}_lerpAdditive(e,t,i,s,r){for(let o=0;o!==r;++o){const a=t+o;e[a]=e[a]+e[i+o]*s}}}const na="\\[\\]\\.:\\/",gg=new RegExp("["+na+"]","g"),ia="[^"+na+"]",_g="[^"+na.replace("\\.","")+"]",yg=/((?:WC+[\/:])*)/.source.replace("WC",ia),vg=/(WCOD+)?/.source.replace("WCOD",_g),bg=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",ia),Mg=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",ia),xg=new RegExp("^"+yg+vg+bg+Mg+"$"),Sg=["material","materials","bones","map"];class wg{constructor(e,t,i){const s=i||ct.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();const i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(e,t)}setValue(e,t){const i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=i.length;s!==r;++s)i[s].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,i=e.length;t!==i;++t)e[t].unbind()}}class ct{constructor(e,t,i){this.path=t,this.parsedPath=i||ct.parseTrackName(t),this.node=ct.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,i){return e&&e.isAnimationObjectGroup?new ct.Composite(e,t,i):new ct(e,t,i)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(gg,"")}static parseTrackName(e){const t=xg.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const i={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){const r=i.nodeName.substring(s+1);Sg.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return i}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const i=e.skeleton.getBoneByName(t);if(i!==void 0)return i}if(e.children){const i=function(r){for(let o=0;o<r.length;o++){const a=r[o];if(a.name===t||a.uuid===t)return a;const l=i(a.children);if(l)return l}return null},s=i(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)e[t++]=i[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,i=t.objectName,s=t.propertyName;let r=t.propertyIndex;if(e||(e=ct.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=t.objectIndex;switch(i){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[i]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[i]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}const o=e[s];if(o===void 0){const c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:e.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}ct.Composite=wg;ct.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ct.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ct.prototype.GetterByBindingType=[ct.prototype._getValue_direct,ct.prototype._getValue_array,ct.prototype._getValue_arrayElement,ct.prototype._getValue_toArray];ct.prototype.SetterByBindingTypeAndVersioning=[[ct.prototype._setValue_direct,ct.prototype._setValue_direct_setNeedsUpdate,ct.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ct.prototype._setValue_array,ct.prototype._setValue_array_setNeedsUpdate,ct.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ct.prototype._setValue_arrayElement,ct.prototype._setValue_arrayElement_setNeedsUpdate,ct.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ct.prototype._setValue_fromArray,ct.prototype._setValue_fromArray_setNeedsUpdate,ct.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];class Tg{constructor(e,t,i=null,s=t.blendMode){this._mixer=e,this._clip=t,this._localRoot=i,this.blendMode=s;const r=t.tracks,o=r.length,a=new Array(o),l={endingStart:2400,endingEnd:2400};for(let c=0;c!==o;++c){const h=r[c].createInterpolant(null);a[c]=h,h.settings=l}this._interpolantSettings=l,this._interpolants=a,this._propertyBindings=new Array(o),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._weightInterpolant=null,this.loop=2201,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(e){return this._startTime=e,this}setLoop(e,t){return this.loop=e,this.repetitions=t,this}setEffectiveWeight(e){return this.weight=e,this._effectiveWeight=this.enabled?e:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(e){return this._scheduleFading(e,0,1)}fadeOut(e){return this._scheduleFading(e,1,0)}crossFadeFrom(e,t,i){if(e.fadeOut(t),this.fadeIn(t),i){const s=this._clip.duration,r=e._clip.duration,o=r/s,a=s/r;e.warp(1,o,t),this.warp(a,1,t)}return this}crossFadeTo(e,t,i){return e.crossFadeFrom(this,t,i)}stopFading(){const e=this._weightInterpolant;return e!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}setEffectiveTimeScale(e){return this.timeScale=e,this._effectiveTimeScale=this.paused?0:e,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(e){return this.timeScale=this._clip.duration/e,this.stopWarping()}syncWith(e){return this.time=e.time,this.timeScale=e.timeScale,this.stopWarping()}halt(e){return this.warp(this._effectiveTimeScale,0,e)}warp(e,t,i){const s=this._mixer,r=s.time,o=this.timeScale;let a=this._timeScaleInterpolant;a===null&&(a=s._lendControlInterpolant(),this._timeScaleInterpolant=a);const l=a.parameterPositions,c=a.sampleValues;return l[0]=r,l[1]=r+i,c[0]=e/o,c[1]=t/o,this}stopWarping(){const e=this._timeScaleInterpolant;return e!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(e,t,i,s){if(!this.enabled){this._updateWeight(e);return}const r=this._startTime;if(r!==null){const l=(e-r)*i;l<0||i===0?t=0:(this._startTime=null,t=i*l)}t*=this._updateTimeScale(e);const o=this._updateTime(t),a=this._updateWeight(e);if(a>0){const l=this._interpolants,c=this._propertyBindings;switch(this.blendMode){case 2501:for(let h=0,u=l.length;h!==u;++h)l[h].evaluate(o),c[h].accumulateAdditive(a);break;case 2500:default:for(let h=0,u=l.length;h!==u;++h)l[h].evaluate(o),c[h].accumulate(s,a)}}}_updateWeight(e){let t=0;if(this.enabled){t=this.weight;const i=this._weightInterpolant;if(i!==null){const s=i.evaluate(e)[0];t*=s,e>i.parameterPositions[1]&&(this.stopFading(),s===0&&(this.enabled=!1))}}return this._effectiveWeight=t,t}_updateTimeScale(e){let t=0;if(!this.paused){t=this.timeScale;const i=this._timeScaleInterpolant;if(i!==null){const s=i.evaluate(e)[0];t*=s,e>i.parameterPositions[1]&&(this.stopWarping(),t===0?this.paused=!0:this.timeScale=t)}}return this._effectiveTimeScale=t,t}_updateTime(e){const t=this._clip.duration,i=this.loop;let s=this.time+e,r=this._loopCount;const o=i===2202;if(e===0)return r===-1?s:o&&(r&1)===1?t-s:s;if(i===2200){r===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));e:{if(s>=t)s=t;else if(s<0)s=0;else{this.time=s;break e}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=s,this._mixer.dispatchEvent({type:"finished",action:this,direction:e<0?-1:1})}}else{if(r===-1&&(e>=0?(r=0,this._setEndings(!0,this.repetitions===0,o)):this._setEndings(this.repetitions===0,!0,o)),s>=t||s<0){const a=Math.floor(s/t);s-=t*a,r+=Math.abs(a);const l=this.repetitions-r;if(l<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,s=e>0?t:0,this.time=s,this._mixer.dispatchEvent({type:"finished",action:this,direction:e>0?1:-1});else{if(l===1){const c=e<0;this._setEndings(c,!c,o)}else this._setEndings(!1,!1,o);this._loopCount=r,this.time=s,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:a})}}else this.time=s;if(o&&(r&1)===1)return t-s}return s}_setEndings(e,t,i){const s=this._interpolantSettings;i?(s.endingStart=2401,s.endingEnd=2401):(e?s.endingStart=this.zeroSlopeAtStart?2401:2400:s.endingStart=2402,t?s.endingEnd=this.zeroSlopeAtEnd?2401:2400:s.endingEnd=2402)}_scheduleFading(e,t,i){const s=this._mixer,r=s.time;let o=this._weightInterpolant;o===null&&(o=s._lendControlInterpolant(),this._weightInterpolant=o);const a=o.parameterPositions,l=o.sampleValues;return a[0]=r,l[0]=t,a[1]=r+e,l[1]=i,this}}const Eg=new Float32Array(1);class Jy extends ti{constructor(e){super(),this._root=e,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1}_bindAction(e,t){const i=e._localRoot||this._root,s=e._clip.tracks,r=s.length,o=e._propertyBindings,a=e._interpolants,l=i.uuid,c=this._bindingsByRootAndName;let h=c[l];h===void 0&&(h={},c[l]=h);for(let u=0;u!==r;++u){const p=s[u],f=p.name;let g=h[f];if(g!==void 0)++g.referenceCount,o[u]=g;else{if(g=o[u],g!==void 0){g._cacheIndex===null&&(++g.referenceCount,this._addInactiveBinding(g,l,f));continue}const y=t&&t._propertyBindings[u].binding.parsedPath;g=new mg(ct.create(i,f,y),p.ValueTypeName,p.getValueSize()),++g.referenceCount,this._addInactiveBinding(g,l,f),o[u]=g}a[u].resultBuffer=g.buffer}}_activateAction(e){if(!this._isActiveAction(e)){if(e._cacheIndex===null){const i=(e._localRoot||this._root).uuid,s=e._clip.uuid,r=this._actionsByClip[s];this._bindAction(e,r&&r.knownActions[0]),this._addInactiveAction(e,s,i)}const t=e._propertyBindings;for(let i=0,s=t.length;i!==s;++i){const r=t[i];r.useCount++===0&&(this._lendBinding(r),r.saveOriginalState())}this._lendAction(e)}}_deactivateAction(e){if(this._isActiveAction(e)){const t=e._propertyBindings;for(let i=0,s=t.length;i!==s;++i){const r=t[i];--r.useCount===0&&(r.restoreOriginalState(),this._takeBackBinding(r))}this._takeBackAction(e)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;const e=this;this.stats={actions:{get total(){return e._actions.length},get inUse(){return e._nActiveActions}},bindings:{get total(){return e._bindings.length},get inUse(){return e._nActiveBindings}},controlInterpolants:{get total(){return e._controlInterpolants.length},get inUse(){return e._nActiveControlInterpolants}}}}_isActiveAction(e){const t=e._cacheIndex;return t!==null&&t<this._nActiveActions}_addInactiveAction(e,t,i){const s=this._actions,r=this._actionsByClip;let o=r[t];if(o===void 0)o={knownActions:[e],actionByRoot:{}},e._byClipCacheIndex=0,r[t]=o;else{const a=o.knownActions;e._byClipCacheIndex=a.length,a.push(e)}e._cacheIndex=s.length,s.push(e),o.actionByRoot[i]=e}_removeInactiveAction(e){const t=this._actions,i=t[t.length-1],s=e._cacheIndex;i._cacheIndex=s,t[s]=i,t.pop(),e._cacheIndex=null;const r=e._clip.uuid,o=this._actionsByClip,a=o[r],l=a.knownActions,c=l[l.length-1],h=e._byClipCacheIndex;c._byClipCacheIndex=h,l[h]=c,l.pop(),e._byClipCacheIndex=null;const u=a.actionByRoot,p=(e._localRoot||this._root).uuid;delete u[p],l.length===0&&delete o[r],this._removeInactiveBindingsForAction(e)}_removeInactiveBindingsForAction(e){const t=e._propertyBindings;for(let i=0,s=t.length;i!==s;++i){const r=t[i];--r.referenceCount===0&&this._removeInactiveBinding(r)}}_lendAction(e){const t=this._actions,i=e._cacheIndex,s=this._nActiveActions++,r=t[s];e._cacheIndex=s,t[s]=e,r._cacheIndex=i,t[i]=r}_takeBackAction(e){const t=this._actions,i=e._cacheIndex,s=--this._nActiveActions,r=t[s];e._cacheIndex=s,t[s]=e,r._cacheIndex=i,t[i]=r}_addInactiveBinding(e,t,i){const s=this._bindingsByRootAndName,r=this._bindings;let o=s[t];o===void 0&&(o={},s[t]=o),o[i]=e,e._cacheIndex=r.length,r.push(e)}_removeInactiveBinding(e){const t=this._bindings,i=e.binding,s=i.rootNode.uuid,r=i.path,o=this._bindingsByRootAndName,a=o[s],l=t[t.length-1],c=e._cacheIndex;l._cacheIndex=c,t[c]=l,t.pop(),delete a[r],Object.keys(a).length===0&&delete o[s]}_lendBinding(e){const t=this._bindings,i=e._cacheIndex,s=this._nActiveBindings++,r=t[s];e._cacheIndex=s,t[s]=e,r._cacheIndex=i,t[i]=r}_takeBackBinding(e){const t=this._bindings,i=e._cacheIndex,s=--this._nActiveBindings,r=t[s];e._cacheIndex=s,t[s]=e,r._cacheIndex=i,t[i]=r}_lendControlInterpolant(){const e=this._controlInterpolants,t=this._nActiveControlInterpolants++;let i=e[t];return i===void 0&&(i=new Kc(new Float32Array(2),new Float32Array(2),1,Eg),i.__cacheIndex=t,e[t]=i),i}_takeBackControlInterpolant(e){const t=this._controlInterpolants,i=e.__cacheIndex,s=--this._nActiveControlInterpolants,r=t[s];e.__cacheIndex=s,t[s]=e,r.__cacheIndex=i,t[i]=r}clipAction(e,t,i){const s=t||this._root,r=s.uuid;let o=typeof e=="string"?Dl.findByName(s,e):e;const a=o!==null?o.uuid:e,l=this._actionsByClip[a];let c=null;if(i===void 0&&(o!==null?i=o.blendMode:i=2500),l!==void 0){const u=l.actionByRoot[r];if(u!==void 0&&u.blendMode===i)return u;c=l.knownActions[0],o===null&&(o=c._clip)}if(o===null)return null;const h=new Tg(this,o,t,i);return this._bindAction(h,c),this._addInactiveAction(h,a,r),h}existingAction(e,t){const i=t||this._root,s=i.uuid,r=typeof e=="string"?Dl.findByName(i,e):e,o=r?r.uuid:e,a=this._actionsByClip[o];return a!==void 0&&a.actionByRoot[s]||null}stopAllAction(){const e=this._actions,t=this._nActiveActions;for(let i=t-1;i>=0;--i)e[i].stop();return this}update(e){e*=this.timeScale;const t=this._actions,i=this._nActiveActions,s=this.time+=e,r=Math.sign(e),o=this._accuIndex^=1;for(let c=0;c!==i;++c)t[c]._update(s,e,r,o);const a=this._bindings,l=this._nActiveBindings;for(let c=0;c!==l;++c)a[c].apply(o);return this}setTime(e){this.time=0;for(let t=0;t<this._actions.length;t++)this._actions[t].time=0;return this.update(e)}getRoot(){return this._root}uncacheClip(e){const t=this._actions,i=e.uuid,s=this._actionsByClip,r=s[i];if(r!==void 0){const o=r.knownActions;for(let a=0,l=o.length;a!==l;++a){const c=o[a];this._deactivateAction(c);const h=c._cacheIndex,u=t[t.length-1];c._cacheIndex=null,c._byClipCacheIndex=null,u._cacheIndex=h,t[h]=u,t.pop(),this._removeInactiveBindingsForAction(c)}delete s[i]}}uncacheRoot(e){const t=e.uuid,i=this._actionsByClip;for(const o in i){const a=i[o].actionByRoot,l=a[t];l!==void 0&&(this._deactivateAction(l),this._removeInactiveAction(l))}const s=this._bindingsByRootAndName,r=s[t];if(r!==void 0)for(const o in r){const a=r[o];a.restoreOriginalState(),this._removeInactiveBinding(a)}}uncacheAction(e,t){const i=this.existingAction(e,t);i!==null&&(this._deactivateAction(i),this._removeInactiveAction(i))}}const Ol=new He;class Zy{constructor(e,t,i=0,s=1/0){this.ray=new fs(e,t),this.near=i,this.far=s,this.camera=null,this.layers=new Yo,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):console.error("THREE.Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Ol.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Ol),this}intersectObject(e,t=!0,i=[]){return Ro(e,this,i,t),i.sort(Bl),i}intersectObjects(e,t=!0,i=[]){for(let s=0,r=e.length;s<r;s++)Ro(e[s],this,i,t);return i.sort(Bl),i}}function Bl(n,e){return n.distance-e.distance}function Ro(n,e,t,i){let s=!0;if(n.layers.test(e.layers)&&n.raycast(e,t)===!1&&(s=!1),s===!0&&i===!0){const r=n.children;for(let o=0,a=r.length;o<a;o++)Ro(r[o],e,t,!0)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"170"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="170");const Co=Object.freeze({top:"sailorlong",topColour:"#283760",bottom:"pleatedskirt",bottomColour:"#283760",footwear:"boots",shoes:"#30292b",accent:"#c64951",pattern:"none",hat:"none"}),$y=Object.freeze([{name:"Harbour academy sailor",outfit:Co},{name:"Minato police uniform",outfit:{top:"police",topColour:"#273858",bottom:"trousers",bottomColour:"#273858",footwear:"shoes",shoes:"#25262d",accent:"#c7ad64",pattern:"none",hat:"police",hatColour:"#273858"}},{name:"Cape café bow blouse",outfit:{top:"blouse",topColour:"#f2dfc5",bottom:"pleatedskirt",bottomColour:"#667d86",footwear:"shoes",shoes:"#543e34",accent:"#94525c",pattern:"none"}},{name:"Harbour Sunday jacket",outfit:{top:"jacket",topColour:"#486874",bottom:"trousers",bottomColour:"#3f4951",footwear:"shoes",shoes:"#4e3931",accent:"#f1e7cf",pattern:"none"}},{name:"Rainflower knitted layers",outfit:{top:"cardigan",topColour:"#718b68",bottom:"longskirt",bottomColour:"#956c59",footwear:"boots",shoes:"#554237",accent:"#f1dfbb",pattern:"none"}},{name:"Harbour day shift",outfit:{top:"overalls",topColour:"#f4f1ea",bottom:"widepants",bottomColour:"#476a79",footwear:"boots",shoes:"#473b2f",accent:"#dabb55",pattern:"none"}},{name:"Sea-school sailor",outfit:{top:"sailor",topColour:"#f4f1ea",bottom:"pleatedskirt",bottomColour:"#27304d",footwear:"shoes",shoes:"#2b2b2b",accent:"#2f5f9e",pattern:"none"}},{name:"Wildflower Sunday",outfit:{top:"sundress",topColour:"#e98aa6",bottom:"longskirt",bottomColour:"#e98aa6",footwear:"sandals",shoes:"#8a5a2e",accent:"#f4f1ea",pattern:"flowers"}},{name:"Raincloud rambler",outfit:{top:"hoodie",topColour:"#7fb0d8",bottom:"cropped",bottomColour:"#6d7478",footwear:"sneakers",shoes:"#f4f1ea",accent:"#f4d23c",pattern:"none"}},{name:"Bookshop afternoon",outfit:{top:"cardigan",topColour:"#9a6a42",bottom:"culottes",bottomColour:"#c8b48a",footwear:"shoes",shoes:"#473b2f",accent:"#e0c078",pattern:"none"}},{name:"Island festival coat",outfit:{top:"festival",topColour:"#2f5f9e",bottom:"shorts",bottomColour:"#27304d",footwear:"sandals",shoes:"#c8b48a",accent:"#f4f1ea",pattern:"none"}},{name:"Cloud café uniform",outfit:{top:"blouse",topColour:"#b2a2ce",bottom:"pleatedskirt",bottomColour:"#58687b",footwear:"shoes",shoes:"#f4f1ea",accent:"#f4f1ea",pattern:"none"}}]),Qy=Object.freeze([{name:"Aoba lighthouse keeper",outfit:{top:"lighthouse",topColour:"#f4f1ea",bottom:"trousers",bottomColour:"#f4f1ea",footwear:"boots",shoes:"#d8342c",accent:"#d8342c",pattern:"none"}},{name:"Harbour lantern sprite",outfit:{top:"lantern",topColour:"#e8742a",bottom:"cropped",bottomColour:"#27304d",footwear:"sandals",shoes:"#9a6a42",accent:"#f4d23c",pattern:"none"}},{name:"Reef ribbon explorer",outfit:{top:"reef",topColour:"#3fa0c8",bottom:"trousers",bottomColour:"#3fa0c8",footwear:"boots",shoes:"#2f5f9e",accent:"#e98aa6",pattern:"none"}}]),Zc=Object.freeze(["skirt","longskirt","pleatedskirt"]);function ev(n,e){return n!=="Johansson"||e.top!=="sundress"&&!Zc.includes(e.bottom)}function $c(n,e){return n==="Johansson"?{...e,top:e.top==="sundress"?"kariyushi":e.top,bottom:Zc.includes(e.bottom)?"trousers":e.bottom}:{...e}}const Ag=Object.freeze(["hairA","hairB","braidL1","braidL2","braidR1","braidR2","skirtF","skirtB","skirtL","skirtR"]),Rg=Object.freeze({hairA:"head",hairB:"hairA",braidL1:"head",braidL2:"braidL1",braidR1:"head",braidR2:"braidR1",skirtF:"hips",skirtB:"hips",skirtL:"hips",skirtR:"hips"}),Nn=Object.freeze({hair:Object.freeze({stiffness:.1,damping:.14,gravity:1.2,limit:40,radius:.025}),braid:Object.freeze({stiffness:.09,damping:.12,gravity:1.6,limit:50,radius:.03}),skirt:Object.freeze({stiffness:.22,damping:.22,gravity:0,limit:20,radius:.02}),hem:Object.freeze({stiffness:.3,damping:.24,gravity:0,limit:14,radius:.015}),step:1/60});function pr(n,e){const t=n.outfit,i=e.hipY,s=i+e.torso*(t.bottom==="underwear"?.05:.13);if(["skirt","longskirt","pleatedskirt"].includes(t.bottom)){const r=t.bottom==="longskirt"?e.thigh+e.shin*.85:e.thigh*.9,o=e.hips*.66+r*.22;return{kind:"skirt",waist:s,length:r,rx:o,rz:o*e.depth/e.width}}if(t.top==="kariyushi"){const r=.1*e.k;return{kind:"hem",waist:s+e.torso*.08,length:r+e.torso*.08,rx:e.hips*.56,rz:e.hips*.56*e.depth/e.width}}return null}function Po(n,e){const t=e.Rh,i=e.headCentre-e.headY,s=f=>e.headY+i+f,r=n.hair.style,o={},a=[],l=r==="ponytail"?[[0,s(t*.1),-t*1.12],[0,s(-t*.45),-t*1.18],[0,s(-t*1.02),-t*1.2]]:r==="long"?[[0,s(-t*.05),-t*.55],[0,s(-t*.7),-t*.58],[0,s(-t*1.38),-t*.55]]:[[0,s(0),-t*.5],[0,s(-t*.3),-t*.5],[0,s(-t*.6),-t*.5]];o.hairA=l[0],o.hairB=l[1],(r==="ponytail"||r==="long")&&a.push({bones:["hairA","hairB"],tip:l[2],...Nn.hair,kind:"hair"});for(const[f,g]of[[1,"L"],[-1,"R"]]){const y=f*t*.85;o["braid"+g+"1"]=[y,s(-t*.3),-t*.35],o["braid"+g+"2"]=[y,s(-t*1.05),-t*.2],r==="braids"&&a.push({bones:["braid"+g+"1","braid"+g+"2"],tip:[y,s(-t*1.98),-t*.05],...Nn.braid,kind:"braid"})}const c=pr(n,e),h=c?.waist??e.hipY+e.torso*.13,u=Math.max(c?.length??.2,.24*e.k),p={skirtF:[0,h-u,c?.rz??e.depth*.4],skirtB:[0,h-u,-(c?.rz??e.depth*.4)],skirtL:[c?.rx??e.hips*.5,h-u,0],skirtR:[-(c?.rx??e.hips*.5),h-u,0]};for(const f of["skirtF","skirtB","skirtL","skirtR"])o[f]=[0,h,0],c&&a.push({bones:[f],tip:p[f],...c.kind==="skirt"?Nn.skirt:Nn.hem,kind:c.kind});return{rest:o,chains:a,hem:c}}function zl(n,e,t){const i=new P(...t[0]),s=new P(...t.at(-1)),r=s.clone().sub(i),o=r.lengthSq()||1,a=t.slice(1,-1).map(c=>new P(...c).sub(i).dot(r)/o),l=new P;return c=>{const h=l.copy(c).sub(i).dot(r)/o,u=ke.smoothstep(h,-.05,.18),p=[[n,1-u]];let f=u;return e.forEach((g,y)=>{const m=y<a.length?ke.smoothstep(h,a[y]-.1,a[y]+.1):0;p.push([g,f*(1-m)]),f*=m}),p}}function Hl(n,e){return t=>{const i=Math.atan2(t.x/n.rx,t.z/n.rz),s=ke.smoothstep(n.waist-t.y,0,n.length*.7),r=[["skirtF",Math.max(0,Math.cos(i))],["skirtL",Math.max(0,Math.sin(i))],["skirtB",Math.max(0,-Math.cos(i))],["skirtR",Math.max(0,-Math.sin(i))]],o=r.reduce((c,[,h])=>c+h,0)||1,a=e(t),l=[];for(const[c,h]of a)if(c==="hips"){l.push(["hips",h*(1-s)]);for(const[u,p]of r)l.push([u,h*s*p/o])}else l.push([c,h]);return l}}const In=new P,Ln=new P,Zs=new P,Mi=new rt,$s=new rt;function Vl(n){const{bones:e,measure:t}=n,i=n.springSetup,s=[];for(const g of i.chains){const y=[...g.bones.map(m=>i.rest[m]),g.tip];g.bones.forEach((m,d)=>{const v=y[d],b=y[d+1];s.push({bone:e[m],chain:g,end:new P(b[0]-v[0],b[1]-v[1],b[2]-v[2]),len:Math.hypot(b[0]-v[0],b[1]-v[1],b[2]-v[2]),p:new P,q:new P,ready:!1})})}const r=[[e.head,new P(0,t.headCentre-t.headY,0),t.Rh*Math.max(t.headSX,1)*.98],[e.chest,new P(0,t.torso*.2,0),t.width*.42],[e.neck,new P(0,0,0),t.width*.3],[e.thighL,new P(0,-t.thigh*.55,0),t.legR*1.15],[e.thighR,new P(0,-t.thigh*.55,0),t.legR*1.15],[e.kneeL,new P(0,-t.shin*.4,0),t.legR*1.05],[e.kneeR,new P(0,-t.shin*.4,0),t.legR*1.05]].map(([g,y,m])=>({bone:g,offset:y,radius:m,at:new P})),o=new P,a=new P,l=new P(0,-1,0);let c=0,h=null;const u=new P;function p(g){for(const y of r)y.at.copy(y.offset).applyMatrix4(y.bone.matrixWorld);for(const y of s){const m=y.bone;m.quaternion.identity(),m.updateMatrixWorld(!0),m.getWorldPosition(o),a.copy(y.end).applyMatrix4(m.matrixWorld),m.matrixWorld.decompose(Zs,Mi,u);const d=y.len*u.x;y.ready||(y.p.copy(a),y.q.copy(a),y.ready=!0);const v=y.chain;In.subVectors(y.p,y.q).multiplyScalar(1-v.damping),y.q.copy(y.p),y.p.add(In).addScaledVector(l,v.gravity*g*g),y.p.lerp(a,v.stiffness);for(const E of r){Ln.subVectors(y.p,E.at);const w=Ln.length(),R=E.radius*u.x+v.radius*u.x;w<R&&w>1e-6&&y.p.copy(E.at).addScaledVector(Ln,R/w)}In.subVectors(y.p,o).normalize(),Ln.subVectors(a,o).normalize();const b=In.angleTo(Ln),_=v.limit*Math.PI/180;b>_&&($s.setFromUnitVectors(Ln,In),Mi.identity().slerp($s,_/b),In.copy(Ln).applyQuaternion(Mi)),y.p.copy(o).addScaledVector(In,d),$s.setFromUnitVectors(Ln,In),m.parent.getWorldQuaternion(Mi),m.quaternion.copy(Mi).invert().multiply($s).multiply(Mi),m.updateMatrixWorld(!0)}}return{get active(){return s.length>0},links:s,reset(){for(const g of s)g.ready=!1,g.bone.quaternion.identity();c=0,h=null},update(g){if(s.length){if(n.root.updateWorldMatrix(!0,!0),n.root.getWorldPosition(Zs),h&&Zs.distanceTo(h)>1.5)for(const y of s)y.ready=!1;for((h??=new P).copy(Zs),c=Math.min(c+Math.min(g,.25),Nn.step*4);c>=Nn.step;)p(Nn.step),c-=Nn.step}}}}const Gl=18,Qc=new P,eh={set:!1};function tv(n){n&&(Qc.copy(n),eh.set=!0)}function Cg(n,e=!1){return e||!eh.set||n.distanceToSquared(Qc)<Gl*Gl}const nv={minX:77,maxX:103,minZ:94,maxZ:134},iv={id:"island-shopping-lane",peninsula:!0,width:6,surface:"asphalt",points:[[89,87],[90,96],[90,128]]},sv=(n,e)=>n>=77&&n<=103&&e>=94&&e<=134,Wl=Object.freeze({top:"jacket",topColour:"#eee8da",pattern:"none",bottom:"skirt",bottomColour:"#9b2834",bottomPattern:"plaid",footwear:"boots",shoes:"#704431",accent:"#e7c887",hat:"none"});function nr(n,e=!1){const t=n[0].index!==null,i=new Set(Object.keys(n[0].attributes)),s=new Set(Object.keys(n[0].morphAttributes)),r={},o={},a=n[0].morphTargetsRelative,l=new _t;let c=0;for(let h=0;h<n.length;++h){const u=n[h];let p=0;if(t!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const f in u.attributes){if(!i.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+f+'" attribute exists among all geometries, or in none of them.'),null;r[f]===void 0&&(r[f]=[]),r[f].push(u.attributes[f]),p++}if(p!==i.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(a!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const f in u.morphAttributes){if(!s.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;o[f]===void 0&&(o[f]=[]),o[f].push(u.morphAttributes[f])}if(e){let f;if(t)f=u.index.count;else if(u.attributes.position!==void 0)f=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,f,h),c+=f}}if(t){let h=0;const u=[];for(let p=0;p<n.length;++p){const f=n[p].index;for(let g=0;g<f.count;++g)u.push(f.getX(g)+h);h+=n[p].attributes.position.count}l.setIndex(u)}for(const h in r){const u=Xl(r[h]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,u)}for(const h in o){const u=o[h][0].length;if(u===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let p=0;p<u;++p){const f=[];for(let y=0;y<o[h].length;++y)f.push(o[h][y][p]);const g=Xl(f);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(g)}}return l}function Xl(n){let e,t,i,s=-1,r=0;for(let c=0;c<n.length;++c){const h=n[c];if(e===void 0&&(e=h.array.constructor),e!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=h.itemSize),t!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(i===void 0&&(i=h.normalized),i!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(s===-1&&(s=h.gpuType),s!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.count*t}const o=new e(r),a=new Ct(o,t,i);let l=0;for(let c=0;c<n.length;++c){const h=n[c];if(h.isInterleavedBufferAttribute){const u=l/t;for(let p=0,f=h.count;p<f;p++)for(let g=0;g<t;g++){const y=h.getComponent(p,g);a.setComponent(p+u,g,y)}}else o.set(h.array,l);l+=h.count*t}return s!==void 0&&(a.gpuType=s),a}function rv(n,e){if(e===0)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),n;if(e===2||e===1){let t=n.getIndex();if(t===null){const o=[],a=n.getAttribute("position");if(a!==void 0){for(let l=0;l<a.count;l++)o.push(l);n.setIndex(o),t=n.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),n}const i=t.count-2,s=[];if(e===2)for(let o=1;o<=i;o++)s.push(t.getX(0)),s.push(t.getX(o)),s.push(t.getX(o+1));else for(let o=0;o<i;o++)o%2===0?(s.push(t.getX(o)),s.push(t.getX(o+1)),s.push(t.getX(o+2))):(s.push(t.getX(o+2)),s.push(t.getX(o+1)),s.push(t.getX(o)));s.length/3!==i&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");const r=n.clone();return r.setIndex(s),r.clearGroups(),r}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),n}const sa=Object.freeze(["oval","round","square","narrow","heart","soft-square","oblong","diamond","pear","wide","soft-round","teardrop"]),Yl={oval:[.94,1.08,.22],round:[1.03,1.01,.1],square:[1.03,1.02,-.16],narrow:[.84,1.16,.25],heart:[1.01,1.07,.37],"soft-square":[1.01,1.04,-.07,.02],oblong:[.9,1.17,.08,-.02],diamond:[.95,1.1,.36,.11],pear:[.97,1.04,-.18,.07],wide:[1.13,.96,.1,.01],"soft-round":[1.06,1.03,.2,.08],teardrop:[.92,1.1,.35,-.03]};function Pg(n){const[e,t,i,s=0]=Yl[n.form]||Yl.oval;return{width:e+(n.shape-.5)*.12,height:t-(n.shape-.5)*.1,taper:i+(n.jaw-.5)*-.22,cheek:s+(n.cheeks-.5)*.13}}function ms(n,e){const t=n.y,i=Math.max(0,Math.min(1,(-t-.12)/.78)),s=Math.exp(-(((t+.16)/.32)**2))*e.cheek;return n.x*=1-e.taper*i+s,n.z>0&&(n.z*=1-.08*Math.max(0,1-Math.abs(t)*1.4)),n}const Ig=Object.freeze({skin:Object.freeze(["#f7dcc4","#f1cfae","#e8bf98","#dca97e","#c98d62","#b27449","#8f5a38","#6b4029"]),hair:Object.freeze(["#1c1714","#3a2618","#5a3a22","#8a5a2e","#c08a4a","#e0c078","#9a9a96","#d8d6d0","#b8412e","#3d4f8a"]),eyes:Object.freeze(["#2a1d16","#5a3a22","#3d6a8a","#4a7a4a","#6a5a8a","#1c1c24"]),cloth:Object.freeze(["#f4f1ea","#d8342c","#e8742a","#f4d23c","#8fbf4a","#2a8a5a","#3fa0c8","#2f5f9e","#27304d","#8a4ab8","#e98aa6","#9a6a42","#6d7478","#2b2b2b","#c8b48a","#7fb0d8"]),lips:Object.freeze(["#b8544a","#a8433e","#cc3d52","#e06a7a","#d8342c","#8a3a3a"])}),Lg=Object.freeze(["child","teen","adult","elder"]),th=n=>Number.isFinite(+n)?n<13?"child":n<19?"teen":n>=65?"elder":"adult":"adult",pt=Object.freeze({silhouette:Object.freeze(["neutral","feminine","masculine"]),head:sa,hair:Object.freeze(["crop","sidepart","bob","long","ponytail","braids","bun","spiky","perm","buzz","afro","horseshoe","bald"]),eyes:Object.freeze(["round","dot","almond","sleepy","lashes","narrow","sparkle","gentle"]),brows:Object.freeze(["straight","arched","thick","thin","worried","bushy","none"]),nose:Object.freeze(["button","dot","line","wide","hook","none"]),mouth:Object.freeze(["smile","flat","grin","small","wide","smirk","pout"]),glasses:Object.freeze(["none","round","square","sun","half"]),facial:Object.freeze(["none","moustache","walrus","stubble","beard","goatee"]),top:Object.freeze(["tank","tee","kariyushi","polo","blouse","jacket","apron","smock","sailor","sailorlong","police","hoodie","cardigan","overalls","sundress","festival","lighthouse","lantern","reef"]),bottom:Object.freeze(["underwear","shorts","trousers","skirt","longskirt","widepants","cropped","culottes","pleatedskirt"]),footwear:Object.freeze(["barefoot","sneakers","sandals","shoes","boots"]),hat:Object.freeze(["none","cap","captain","police","helmet","straw","headband","kerchief","beanie","beret","bucket","ribbon","squid","teapot","sunflower","paperboat","mountain"]),earrings:Object.freeze(["none","studs","hoops"]),neckwear:Object.freeze(["none","pendant","scarf"])}),Dg=(n,e=0,t=1)=>Math.min(t,Math.max(e,Number.isFinite(+n)?+n:e)),It=(n,e,t)=>n.includes(e)?e:t??n[0],Ng=n=>/^#[0-9a-f]{6}$/i.test(String(n))?String(n).toLowerCase():null,kg=Object.freeze({v:1,name:"",age:"adult",body:Object.freeze({height:.5,build:.5,proportion:"classic",silhouette:"neutral",skin:"#e8bf98"}),head:Object.freeze({size:.5,shape:.5,form:"oval",jaw:.5,cheeks:.5}),hair:Object.freeze({style:"crop",colour:"#1c1714",flip:!1}),eyes:Object.freeze({style:"round",colour:"#2a1d16",size:.5,width:.5,spacing:.5,height:.5,tilt:.5}),brows:Object.freeze({style:"straight",colour:"#1c1714",size:.5,spacing:.5,height:.5,tilt:.5}),nose:Object.freeze({style:"button",size:.5,height:.5,x:.5}),mouth:Object.freeze({style:"smile",colour:"#b8544a",size:.5,width:.5,height:.5,x:.5}),glasses:Object.freeze({style:"none",colour:"#2b2b2b"}),facial:Object.freeze({style:"none",colour:"#1c1714"}),blush:.25,freckles:!1,mole:!1,wrinkles:0,outfit:Object.freeze({top:"tank",topColour:"#f4f1ea",pattern:"none",bottom:"underwear",bottomColour:"#7fb0d8",footwear:"barefoot",shoes:"#6d4a32",hat:"none",hatColour:"#f4f1ea",accent:"#f4d23c"}),accessories:Object.freeze({earrings:"none",neckwear:"none",colour:"#e0b93a",pin:!1}),swim:Object.freeze({colour:"#2f5f9e"}),profile:Object.freeze({pace:.5,talk:.5,show:.5,outlook:.5,pitch:.5,speed:.5,month:7,day:1,favourite:"#3fa0c8",catchphrase:""})});function Ut(n={}){const e=n&&typeof n=="object"?n:{},t=kg,i=(a,l)=>{const c=e[a]&&typeof e[a]=="object"?e[a]:{},h={};for(const[u,p]of Object.entries(l))h[u]=p(c[u],t[a][u]);return h},s=(a,l)=>a===void 0?l:Dg(a),r=(a,l)=>Ng(a)||l,o=(a,l)=>a===void 0?l:!!a;return{v:1,name:String(e.name||"").slice(0,24),age:It(Lg,e.age,"adult"),body:i("body",{height:s,build:s,proportion:a=>It(["classic","rounded"],a,"classic"),silhouette:a=>It(pt.silhouette,a,"neutral"),skin:r}),head:i("head",{size:s,shape:s,form:(a,l)=>It(sa,a,l),jaw:s,cheeks:s}),hair:i("hair",{style:(a,l)=>It(pt.hair,a,l),colour:r,flip:o}),eyes:i("eyes",{style:(a,l)=>It(pt.eyes,a,l),colour:r,size:s,width:s,spacing:s,height:s,tilt:s}),brows:i("brows",{style:(a,l)=>It(pt.brows,a,l),colour:r,size:s,spacing:s,height:s,tilt:s}),nose:i("nose",{style:(a,l)=>It(pt.nose,a,l),size:s,height:s,x:s}),mouth:i("mouth",{style:(a,l)=>It(pt.mouth,a,l),colour:r,size:s,width:s,height:s,x:s}),glasses:i("glasses",{style:(a,l)=>It(pt.glasses,a,l),colour:r}),facial:i("facial",{style:(a,l)=>It(pt.facial,a,l),colour:r}),blush:s(e.blush,t.blush),freckles:!!e.freckles,mole:!!e.mole,wrinkles:s(e.wrinkles,t.wrinkles),outfit:Ug(e.outfit,i("outfit",{top:(a,l)=>It(pt.top,a,l),topColour:r,pattern:(a,l)=>["none","flowers","stripes","dots"].includes(a)?a:l,bottom:(a,l)=>It(pt.bottom,a,l),bottomColour:r,bottomPattern:a=>a==="plaid"?"plaid":"none",footwear:(a,l)=>It(pt.footwear,a,l),shoes:r,hat:(a,l)=>It(pt.hat,a,l),hatColour:r,accent:r})),accessories:i("accessories",{earrings:(a,l)=>It(pt.earrings,a,l),neckwear:(a,l)=>It(pt.neckwear,a,l),colour:r,pin:o}),swim:i("swim",{colour:r}),profile:(()=>{const a=i("profile",{pace:s,talk:s,show:s,outlook:s,pitch:s,speed:s,month:(l,c)=>Number.isInteger(+l)&&+l>=1&&+l<=12?+l:c,day:(l,c)=>Number.isInteger(+l)&&+l>=1&&+l<=31?+l:c,favourite:r,catchphrase:(l,c)=>l===void 0?c:String(l).replace(/[\u0000-\u001f<>]/g,"").slice(0,40)});return a.day=Math.min(a.day,[31,29,31,30,31,30,31,31,30,31,30,31][a.month-1]),a})()}}function Ug(n,e){return!n||typeof n!="object"||(n.top===void 0&&(e.top="tee",n.topColour===void 0&&(e.topColour="#3fa0c8")),n.bottom===void 0&&(e.bottom="trousers",n.bottomColour===void 0&&(e.bottomColour="#27304d")),pt.footwear.includes(n.footwear)||(e.footwear="sneakers")),e}function nh(n){const e=JSON.stringify(Ut(n)),t=new TextEncoder().encode(e);let i="";for(const s of t)i+=String.fromCharCode(s);return btoa(i).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}function ra(n){try{const e=atob(String(n).replace(/-/g,"+").replace(/_/g,"/")),t=Uint8Array.from(e,i=>i.charCodeAt(0));return Ut(JSON.parse(new TextDecoder().decode(t)))}catch{return null}}function oa(n=""){let e=2166136261;for(const t of String(n))e=Math.imul(e^t.codePointAt(0),16777619)>>>0;return()=>{e=e+1831565813>>>0;let t=e;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}}function ov(n=Math.random().toString(36)){const e=oa(n),t=a=>a[Math.floor(e()*a.length)],i=Ig,s=e()<.3,r=e()<.5,o=t(s?r?["perm","bun","bob"]:["horseshoe","buzz","crop","bald"]:r?["bob","long","ponytail","braids","bun","sidepart"]:["crop","sidepart","spiky","buzz","afro"]);return Ut({body:{height:.3+e()*.5,build:.25+e()*.55,skin:t(i.skin.slice(0,7))},head:{size:.4+e()*.25,shape:e(),form:t(sa),jaw:e(),cheeks:e()},hair:{style:o,colour:t(s?["#9a9a96","#d8d6d0","#5a3a22"]:i.hair.slice(0,6)),flip:e()<.5},eyes:{style:t(pt.eyes),colour:t(i.eyes),size:.3+e()*.5,spacing:.3+e()*.4,height:.4+e()*.2,tilt:.35+e()*.3},brows:{style:t(pt.brows.slice(0,6)),colour:s?"#8a8a86":"#1c1714",size:.4+e()*.3,height:.4+e()*.3,tilt:.3+e()*.4},nose:{style:t(pt.nose.slice(0,5)),size:.3+e()*.5,height:.4+e()*.2},mouth:{style:t(pt.mouth),colour:r&&e()<.5?t(i.lips):"#b8544a",size:.35+e()*.4,height:.4+e()*.2},glasses:{style:e()<.25?t(pt.glasses.slice(1)):"none",colour:t(["#2b2b2b","#8a4a3a","#c8a060","#e06a7a"])},facial:{style:!r&&e()<.3?t(pt.facial.slice(1)):"none",colour:"#3a2618"},blush:r?.3+e()*.4:e()*.2,freckles:e()<.12,mole:e()<.1,wrinkles:s?.5+e()*.5:0,outfit:{top:t(["tee","kariyushi","polo","blouse","jacket"]),topColour:t(i.cloth),pattern:e()<.3?t(["flowers","stripes","dots"]):"none",bottom:r&&e()<.4?t(["skirt","longskirt","widepants","cropped","culottes","pleatedskirt"]):t(["shorts","trousers"]),bottomColour:t(["#27304d","#6d7478","#c8b48a","#2b2b2b","#9a6a42","#2f5f9e"]),shoes:t(["#6d4a32","#2b2b2b","#f4f1ea","#d8342c"]),footwear:t(["sneakers","sandals","shoes","boots"]),hat:"none",hatColour:"#f4f1ea",accent:t(i.cloth)},profile:{pace:e(),talk:e(),show:e(),outlook:e(),pitch:r?.45+e()*.5:e()*.6,speed:e(),month:1+Math.floor(e()*12),day:1+Math.floor(e()*28),favourite:t(i.cloth)}})}const at=Math.PI*2,Fg=Object.freeze(["#b8544a","#a8433e","#9a4a40"]);function Ai(n,e){const t=parseInt(n.slice(1),16),i=s=>Math.max(0,Math.min(255,Math.round(s*e)));return"#"+[i(t>>16),i(t>>8&255),i(t&255)].map(s=>s.toString(16).padStart(2,"0")).join("")}function Ar(n){const e=n.eyes,t=n.brows,i=n.nose,s=n.mouth,r=104+(e.height-.5)*-56,o=38+(e.spacing-.5)*36,a=1.16+e.size*.8;return{eyeY:r,spread:o,eyeS:a,eyeW:.85+(e.width??.5)*.7,eyeTilt:(e.tilt-.5)*.85,browY:70+(t.height-.5)*-48,browSpread:o+((t.spacing??.5)-.5)*32,browS:.75+t.size*.6,browTilt:(t.tilt-.5)*.85,noseY:134+(i.height-.5)*-48,noseX:128+((i.x??.5)-.5)*48,noseS:.7+i.size*.7,mouthY:160+(s.height-.5)*-54,mouthX:128+((s.x??.5)-.5)*56,mouthS:1+s.size*.8,mouthW:.65+(s.width??.5)*.7}}const Io=Object.freeze({neutral:{eyes:"open",brow:0,browLift:0,mouth:null,blush:0},smile:{eyes:"smiling",brow:0,browLift:3,mouth:"smile",blush:.15},content:{eyes:"content",brow:0,browLift:1,mouth:"smile",blush:.1},happy:{eyes:"happy",brow:0,browLift:10,mouth:"grin",blush:.4},laugh:{eyes:"happy",brow:0,browLift:14,mouth:"laugh",blush:.55},sad:{eyes:"sad",brow:-1,browLift:3,mouth:"frown",blush:0},worried:{eyes:"worry",brow:-1.35,browLift:10,mouth:"wobble",blush:0},angry:{eyes:"angry",brow:1.4,browLift:-5,mouth:"snarl",blush:.15},grumpy:{eyes:"angry",brow:.6,browLift:-2,mouth:"frown",blush:0},shy:{eyes:"shy",brow:-.4,browLift:3,mouth:"small",blush:1},surprised:{eyes:"wide",brow:0,browLift:20,mouth:"o",blush:0},thinking:{eyes:"side",brow:.3,browLift:0,mouth:"hmm",blush:0},sleep:{eyes:"closed",brow:0,browLift:-1,mouth:"small",blush:0}});Object.freeze(Object.keys(Io));function Og(n,e,t={}){const i=t.size||256,s=i/256,r=Io[t.expression]||Io.neutral,o=Ar(e),a=e.body.skin,l="#2b2623";if(n.canvas.__skin=a,n.save(),n.setTransform(s,0,0,s,0,0),n.fillStyle=a,n.fillRect(0,0,256,256),n.lineCap="round",n.lineJoin="round",e.wrinkles>.05){n.strokeStyle=Ai(a,.8),n.lineWidth=1.6,n.globalAlpha=Math.min(1,e.wrinkles);for(const f of[-1,1]){const g=128+f*(o.spread+16*o.eyeS);for(let y=0;y<2;y++)n.beginPath(),n.moveTo(g,o.eyeY-4+y*7),n.lineTo(g+f*8,o.eyeY-6+y*9),n.stroke();n.beginPath(),n.arc(128+f*22,o.mouthY-6,14,f>0?-.2:Math.PI-.6,f>0?.6:Math.PI+.2),n.stroke()}for(let f=0;f<2;f++)n.beginPath(),n.moveTo(104,o.browY-14-f*7),n.quadraticCurveTo(128,o.browY-18-f*7,152,o.browY-14-f*7),n.stroke();n.globalAlpha=1}if(e.freckles){n.fillStyle=Ai(a,.72);for(const f of[-1,1])for(let g=0;g<5;g++)n.beginPath(),n.arc(128+f*(o.spread+g%3*5-2),o.noseY-2+Math.floor(g/3)*6,1.5,0,at),n.fill()}e.mole&&(n.fillStyle="#4a3024",n.beginPath(),n.arc(128+o.spread*.9,o.mouthY-6,2.4,0,at),n.fill());const c=Math.min(1,e.blush*.8+r.blush);if(c>.02){for(const f of[-1,1]){const g=128+f*(o.spread+8),y=o.noseY+2,m=n.createRadialGradient(g,y,1,g,y,17);m.addColorStop(0,`rgba(236,110,120,${.55*c})`),m.addColorStop(1,"rgba(236,110,120,0)"),n.fillStyle=m,n.beginPath(),n.ellipse(g,y,18,12,0,0,at),n.fill()}if(r.blush>=.9){n.strokeStyle="rgba(210,80,90,.7)",n.lineWidth=1.6;for(const f of[-1,1])for(let g=0;g<3;g++){const y=128+f*(o.spread+2+g*6);n.beginPath(),n.moveTo(y-2,o.noseY+6),n.lineTo(y+2,o.noseY-2),n.stroke()}}}const u=Math.max(0,Math.min(1,t.blink||0))>.5&&r.eyes!=="happy"?"closed":r.eyes,p=t.look||[0,0];for(const f of[-1,1])ih(n,128+f*o.spread,o.eyeY,o.eyeS,f,e.eyes,u,p,o.eyeTilt,o.eyeW);if(e.brows.style!=="none")for(const f of[-1,1])sh(n,128+f*o.browSpread,o.browY-r.browLift,o.browS,f,e.brows,o.browTilt,r.brow);rh(n,o.noseX,o.noseY,o.noseS,e.nose.style,a),Lo(n,o.mouthX,o.mouthY,o.mouthS,e.mouth,r.mouth,t.talk||0,l,o.mouthW),oh(n,o,e.facial),ah(n,o,e.glasses),n.restore()}function ih(n,e,t,i,s,r,o,a,l,c=1){const h=r.style,u="#2b2623";if(n.save(),n.translate(e,t),n.rotate(s*l*-1),n.scale(i*c,i),n.strokeStyle=u,n.fillStyle=u,n.lineWidth=3.2,o==="wide"||o==="worry"){const y=o==="wide"?15:13,m=o==="wide"?19:16;if(n.fillStyle="#fbfaf6",n.beginPath(),n.ellipse(0,0,y,m,0,0,at),n.fill(),n.stroke(),n.fillStyle=r.colour,n.beginPath(),n.ellipse(a[0]*3,a[1]*3,y*.58,m*.62,0,0,at),n.fill(),n.fillStyle=u,n.beginPath(),n.ellipse(a[0]*3,a[1]*3,y*.36,m*.42,0,0,at),n.fill(),n.fillStyle="#fff",n.beginPath(),n.arc(3,-5,3,0,at),n.fill(),h==="lashes")for(let d=0;d<3;d++)n.beginPath(),n.moveTo(s*y*.8,-9+d*5),n.lineTo(s*(y+6),-12+d*6),n.stroke();n.restore();return}if(o==="closed"||o==="content"){n.beginPath(),n.arc(0,o==="content"?-3:-6,11,Math.PI*.18,Math.PI*.82),n.stroke(),h==="lashes"&&(n.beginPath(),n.moveTo(s*9,2),n.lineTo(s*14,5),n.stroke()),n.restore();return}if(o==="happy"){n.lineWidth=5.2,n.beginPath(),n.moveTo(-13,4),n.quadraticCurveTo(0,-21,13,4),n.stroke(),n.restore();return}const p=o==="wide"?1.3:1,f=(h==="narrow"?12:h==="dot"?6:h==="sparkle"?13:11.5)*p,g=(h==="narrow"?4.2:h==="dot"?9:h==="almond"?9.5:h==="sparkle"?15:13.5)*p;if(["round","gentle","lashes","sleepy"].includes(h)){const y=(h==="sleepy"?6:h==="gentle"?9:12)*p;if(n.save(),n.beginPath(),n.ellipse(a[0]*2,a[1]*2,9*p,y,0,0,at),n.clip(),n.fill(),n.fillStyle=n.canvas.__skin,o==="angry"||o==="sad"){const m=o==="angry"?-s:s;n.beginPath(),n.moveTo(-14,-y-2),n.lineTo(14,-y-2),n.lineTo(m*14,1),n.closePath(),n.fill()}else o==="shy"?n.fillRect(-14,-y-2,28,y*.7):o==="smiling"&&(n.beginPath(),n.ellipse(0,y+5,15,9,0,0,at),n.fill());if(n.restore(),["angry","sad","shy"].includes(o)||(n.fillStyle="#fbfaf6",n.beginPath(),n.arc(a[0]*2+2,-y*.35+a[1]*2,1.8,0,at),n.fill()),h==="lashes"){n.lineWidth=2.8;for(let m=0;m<2;m++)n.beginPath(),n.moveTo(s*5,-5-m*3),n.lineTo(s*(11+m*2),-8-m*4),n.stroke()}}else if(h==="dot")n.beginPath(),n.ellipse(a[0]*2,a[1]*2,f,g,0,0,at),n.fill(),n.fillStyle="#fff",n.beginPath(),n.arc(2+a[0]*2,-3,2.2,0,at),n.fill();else if(h==="narrow")n.beginPath(),n.ellipse(0,0,f,g,0,0,at),n.fill();else{n.fillStyle="#fbfaf6",n.beginPath(),h==="almond"?(n.moveTo(-f,1),n.quadraticCurveTo(-2,-g*1.5,f,-1),n.quadraticCurveTo(0,g*1.3,-f,1)):n.ellipse(0,0,f,g,0,0,at),n.fill(),n.save(),n.clip();const y=h==="sparkle"?10:7.4,m=a[0]*4,d=a[1]*3+(h==="gentle"?3:1);if(n.fillStyle=r.colour,n.beginPath(),n.arc(m,d,y,0,at),n.fill(),n.fillStyle="#120c0a",n.beginPath(),n.arc(m,d,y*.5,0,at),n.fill(),n.fillStyle="#fff",n.beginPath(),n.arc(m+y*.38,d-y*.4,y*.3,0,at),n.fill(),h==="sparkle"&&(n.beginPath(),n.arc(m-y*.35,d+y*.4,y*.16,0,at),n.fill()),n.fillStyle=n.canvas.__skin||"#e8bf98",(h==="sleepy"||o==="shy")&&n.fillRect(-f-2,-g-2,f*2+4,g*.9),o==="sad"&&(n.beginPath(),n.moveTo(-f-2,-g-2),n.lineTo(f+2,-g-2),n.lineTo(s*f+2*s,-g*.1),n.closePath(),n.fill()),o==="angry"&&(n.beginPath(),n.moveTo(-f-2,-g-2),n.lineTo(f+2,-g-2),n.lineTo(-s*f-2*s,-g*.05),n.closePath(),n.fill()),n.restore(),n.lineWidth=2.4,n.beginPath(),h==="almond"?(n.moveTo(-f,1),n.quadraticCurveTo(-2,-g*1.5,f,-1),n.stroke()):(n.ellipse(0,0,f,g,0,Math.PI*1.05,Math.PI*1.95),n.stroke()),h==="gentle"&&(n.lineWidth=3,n.beginPath(),n.arc(0,g*.3,f*1.02,Math.PI*1.12,Math.PI*1.88),n.stroke()),h==="lashes"){n.lineWidth=2.2;for(let v=0;v<3;v++){const b=-Math.PI/2+s*(.55+v*.28);n.beginPath(),n.moveTo(Math.cos(b)*f*.95,Math.sin(b)*g*.95),n.lineTo(Math.cos(b)*(f+6),Math.sin(b)*(g+5)),n.stroke()}}}o==="sad"&&(n.strokeStyle="rgba(120,180,230,.7)",n.lineWidth=2.2,n.beginPath(),n.moveTo(s*-4,g),n.lineTo(s*-5,g+8),n.stroke()),n.restore()}function sh(n,e,t,i,s,r,o,a){n.save(),n.translate(e,t),n.scale(i,i),n.rotate(s*(o*-1+a*.48));const l=Ai(r.colour,.68);n.strokeStyle=l,n.fillStyle=l,n.lineCap="round";const c=r.style,h=c==="thick"||c==="bushy"?7:c==="thin"?2.4:4.2;if(n.lineWidth=h,n.beginPath(),c==="arched")n.moveTo(-13,3),n.quadraticCurveTo(0,-7,13,2);else if(c==="worried")n.moveTo(-13,-3),n.quadraticCurveTo(0,0,13,3);else if(c==="bushy"){n.moveTo(-14,2),n.quadraticCurveTo(0,-5,14,1),n.stroke(),n.lineWidth=2;for(let u=-12;u<=12;u+=4)n.beginPath(),n.moveTo(u,-2),n.lineTo(u+2*s,-7),n.stroke();n.restore();return}else n.moveTo(-13,1),n.quadraticCurveTo(0,-3,13,1);n.stroke(),n.restore()}function rh(n,e,t,i,s,r,o){if(n.save(),n.translate(e,t),n.scale(i,i),n.strokeStyle=Ai(r,.62),n.fillStyle=Ai(r,.8),n.lineWidth=2.4,s==="button")n.beginPath(),n.ellipse(0,0,7,5.5,0,0,at),n.fill(),n.fillStyle="rgba(255,255,255,.35)",n.beginPath(),n.arc(-2,-2,2,0,at),n.fill();else if(s==="dot"){n.fillStyle=Ai(r,.6);for(const a of[-3,3])n.beginPath(),n.arc(a,0,1.6,0,at),n.fill()}else s==="line"?(n.beginPath(),n.moveTo(1,-12),n.quadraticCurveTo(-2,0,3,4),n.lineTo(-3,4),n.stroke()):s==="wide"?(n.beginPath(),n.moveTo(-10,-2),n.quadraticCurveTo(-11,6,-3,5),n.moveTo(10,-2),n.quadraticCurveTo(11,6,3,5),n.stroke(),n.beginPath(),n.ellipse(0,1,6,4,0,0,at),n.fill()):s==="hook"&&(n.beginPath(),n.moveTo(-1,-16),n.quadraticCurveTo(8,2,1,6),n.lineTo(-4,4),n.stroke());n.restore()}function Lo(n,e,t,i,s,r,o,a,l=1){n.save(),n.translate(e,t),n.scale(i*l,i);const c=s.colour,h=!Fg.includes(c.toLowerCase());n.strokeStyle=h?c:a,n.lineWidth=h?3.6:3.4,n.lineCap="round";const u="#2b2623",p="#e07a80",f="#fbfaf6",g=(m,d,v=0)=>{n.fillStyle=u,n.beginPath(),n.moveTo(-m,0),n.quadraticCurveTo(0,-v,m,0),n.quadraticCurveTo(0,d*2,-m,0),n.fill(),n.save(),n.clip(),n.fillStyle=f,n.fillRect(-m,-d,m*2,d*.55+v*.2),n.fillStyle=p,n.beginPath(),n.ellipse(0,d*1.3,m*.55,d*.55,0,0,at),n.fill(),n.restore(),n.beginPath(),n.moveTo(-m,0),n.quadraticCurveTo(0,-v,m,0),n.quadraticCurveTo(0,d*2,-m,0),n.stroke()},y=o>.5?"talk":r||s.style;switch(n.beginPath(),y){case"talk":{const m=["grin","laugh","o"].includes(r);g(m?19:12,(m?13:7)+o*3,m?6:2);break}case"grin":g(24,15,5);break;case"laugh":g(28,23,7);break;case"o":n.fillStyle=u,n.ellipse(0,3,13,20,0,0,at),n.fill(),n.stroke();break;case"frown":n.arc(0,12,13,Math.PI*1.2,Math.PI*1.8),n.stroke();break;case"snarl":n.moveTo(-12,4),n.lineTo(-4,0),n.lineTo(4,0),n.lineTo(12,4),n.stroke();break;case"wobble":n.moveTo(-14,1),n.quadraticCurveTo(0,5,14,1),n.moveTo(-14,-4),n.quadraticCurveTo(-10,1,-14,7),n.moveTo(14,-4),n.quadraticCurveTo(10,1,14,7),n.stroke();break;case"hmm":n.moveTo(-8,2),n.lineTo(8,-1),n.stroke();break;case"smile":n.moveTo(-16,-1),n.quadraticCurveTo(0,15,16,-1),n.stroke();break;case"flat":n.moveTo(-11,1),n.lineTo(11,1),n.stroke();break;case"small":n.arc(0,-3,6,Math.PI*.25,Math.PI*.75),n.stroke();break;case"wide":n.arc(0,-10,18,Math.PI*.22,Math.PI*.78),n.stroke();break;case"smirk":n.moveTo(-10,2),n.quadraticCurveTo(2,4,11,-4),n.stroke();break;case"pout":n.fillStyle=c,n.ellipse(0,1,6,4.5,0,0,at),n.fill();break;default:n.arc(0,-8,13,Math.PI*.2,Math.PI*.8),n.stroke()}h&&["smile","small","wide","flat","smirk","wobble"].includes(y)&&(n.fillStyle=c,n.globalAlpha=.85,n.beginPath(),n.ellipse(0,2,y==="wide"?13:9,3.2,0,0,at),n.fill(),n.globalAlpha=1),n.restore()}function oh(n,e,t){if(t.style==="none")return;n.save(),n.fillStyle=t.colour,n.strokeStyle=t.colour;const i=(e.noseY+e.mouthY)/2+2;if(t.style==="moustache")n.beginPath(),n.moveTo(128,i-3),n.quadraticCurveTo(114,i-6,108,i+3),n.quadraticCurveTo(118,i+1,128,i+2),n.quadraticCurveTo(138,i+1,148,i+3),n.quadraticCurveTo(142,i-6,128,i-3),n.fill();else if(t.style==="walrus")n.beginPath(),n.ellipse(128,i+1,24,8,0,0,at),n.fill();else if(t.style==="stubble"){n.globalAlpha=.35;for(let s=0;s<140;s++){const r=Math.PI*(.1+.8*(s%47)/46),o=46+s*7%11,a=128+Math.cos(r)*o*.95,l=e.mouthY-26+Math.sin(r)*o*.8;l>e.noseY+8&&n.fillRect(a,l,1.6,1.6)}n.globalAlpha=1}else t.style==="beard"?(n.beginPath(),n.moveTo(84,e.noseY),n.quadraticCurveTo(90,e.mouthY+40,128,e.mouthY+42),n.quadraticCurveTo(166,e.mouthY+40,172,e.noseY),n.lineTo(160,e.noseY+4),n.quadraticCurveTo(150,e.mouthY+18,128,e.mouthY+16),n.quadraticCurveTo(106,e.mouthY+18,96,e.noseY+4),n.closePath(),n.fill()):t.style==="goatee"&&(n.beginPath(),n.ellipse(128,e.mouthY+18,9,11,0,0,at),n.fill());n.restore()}function ah(n,e,t){if(t.style==="none")return;n.save(),n.strokeStyle=t.colour,n.lineWidth=3.2;const i=15*e.eyeS+2,s=e.eyeY,r=i*e.eyeW;for(const o of[-1,1]){const a=128+o*e.spread;n.beginPath(),t.style==="round"?n.ellipse(a,s,r,i,0,0,at):t.style==="half"?n.ellipse(a,s-2,r,i,0,Math.PI*.05,Math.PI*.95):n.roundRect?n.roundRect(a-r*1.1,s-i*.8,r*2.2,i*1.6,6):n.rect(a-r*1.1,s-i*.8,r*2.2,i*1.6),t.style==="sun"&&(n.fillStyle="rgba(30,34,40,.9)",n.fill()),n.stroke(),t.style!=="sun"&&(n.save(),n.strokeStyle="rgba(255,255,255,.55)",n.lineWidth=2,n.beginPath(),n.moveTo(a+i*.3,s-i*.55),n.lineTo(a+i*.6,s-i*.25),n.stroke(),n.restore())}n.beginPath(),n.moveTo(128-e.spread+r*(t.style==="round"||t.style==="half"?1:1.1),s-2),n.quadraticCurveTo(128,s-8,128+e.spread-r*(t.style==="round"||t.style==="half"?1:1.1),s-2),n.stroke(),n.restore()}function av(n,e,t,i=n.canvas.width){const s=e.body.skin,r="#2b2623",o={...e,eyes:{...e.eyes,height:.5,spacing:.5,size:.5,tilt:.5},brows:{...e.brows,height:.5,spacing:.5,size:.5,tilt:.5},nose:{...e.nose,height:.5,x:.5,size:.5},mouth:{...e.mouth,height:.5,x:.5,size:.5,width:.5}},a=Ar(o),l={eyes:[128,a.eyeY,1.75],glasses:[128,a.eyeY,1.6],brows:[128,a.browY,2],nose:[128,a.noseY,3.4],mouth:[128,a.mouthY+2,2.7],facial:[128,(a.noseY+a.mouthY)/2+(e.facial.style==="beard"?18:e.facial.style==="goatee"?14:2),e.facial.style==="beard"?1.5:2.2]}[t]||[128,128,1],c=i/256;if(n.save(),n.setTransform(c,0,0,c,0,0),n.canvas.__skin=s,n.fillStyle=s,n.fillRect(0,0,256,256),n.translate(128,128),n.scale(l[2],l[2]),n.translate(-l[0],-l[1]),n.lineCap="round",n.lineJoin="round",t==="eyes"||t==="glasses")for(const u of[-1,1])ih(n,128+u*a.spread,a.eyeY,a.eyeS,u,o.eyes,"open",[0,0],a.eyeTilt,a.eyeW);if(t==="brows"&&e.brows.style!=="none")for(const u of[-1,1])sh(n,128+u*a.browSpread,a.browY,a.browS,u,o.brows,a.browTilt,0);t==="nose"&&rh(n,a.noseX,a.noseY,a.noseS,e.nose.style,s),t==="mouth"&&Lo(n,a.mouthX,a.mouthY,a.mouthS,o.mouth,null,0,r,a.mouthW),t==="facial"&&(Lo(n,a.mouthX,a.mouthY,a.mouthS,{...o.mouth,style:"flat"},null,0,"rgba(43,38,35,.35)",a.mouthW),oh(n,a,e.facial)),t==="glasses"&&ah(n,a,e.glasses),n.restore(),(t==="brows"&&e.brows.style==="none"||t==="nose"&&e.nose.style==="none"||t==="glasses"&&e.glasses.style==="none"||t==="facial"&&e.facial.style==="none")&&(n.save(),n.strokeStyle="rgba(43,38,35,.25)",n.lineWidth=i*.04,n.lineCap="round",n.beginPath(),n.moveTo(i*.3,i*.7),n.lineTo(i*.7,i*.3),n.stroke(),n.restore())}function Bg(n,e=2){return n.userData.worldTextureScale=e,n.onBeforeCompile=t=>{t.uniforms.townTileMetres={value:e},t.vertexShader=`uniform float townTileMetres;
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
      #endif`)},n.customProgramCacheKey=()=>"town-world-uv-v1",n}const ql={2:[96,255],3:[92,178,255],4:[80,142,202,255],soft:[180,255],soft3:[172,214,255]},po=new Map;function zg(n=3){if(po.has(n))return po.get(n);const e=ql[n]||ql[3],t=new Uint8Array(e.length*4);for(let s=0;s<e.length;s++)t[s*4]=t[s*4+1]=t[s*4+2]=e[s],t[s*4+3]=255;const i=new Mr(t,e.length,1,1023);return i.minFilter=i.magFilter=1003,i.generateMipmaps=!1,i.needsUpdate=!0,po.set(n,i),i}const lh="lights_toon_pars_fragment",jl="vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;",Hg=`
	vec3 celBand = getGradientIrradiance( geometryNormal, directLight.direction );
	vec3 irradiance = celBand * mix( uShadowTint, vec3( 1.0 ), celBand ) * directLight.color;`;let Do="";{const n=Ge[lh];n.includes(jl)&&(Do=`uniform vec3 uShadowTint;
`+n.replace(jl,Hg))}const ch="map_fragment",Kl="diffuseColor *= sampledDiffuseColor;",Vg=`diffuseColor.rgb *= mix( vec3( 1.0 ), sampledDiffuseColor.rgb, uFlatten );
	diffuseColor.a *= sampledDiffuseColor.a;`,Gg=`uniform float uFlatten;
`;let No="";{const n=Ge[ch];n.includes(Kl)&&(No=n.replace(Kl,Vg))}const Wg=.65;function Xg(n){return!!(n.normalMap||n.roughnessMap||n.bumpMap||n.aoMap)}function Yg(n,e,t=1,{base:i=null,baseKey:s=""}={}){const r=!!Do,o=!!No&&t<1&&!!n.map;if(!r&&!o&&!i)return n;const a={value:new Ue(e)},l={value:t};n.userData.shadowTint=a,n.userData.flatten=l,n.onBeforeCompile=(h,u)=>{i?.(h,u),r&&(h.uniforms.uShadowTint=a,h.fragmentShader=h.fragmentShader.replace("#include <"+lh+">",Do)),o&&(h.uniforms.uFlatten=l,h.fragmentShader=Gg+h.fragmentShader.replace("#include <"+ch+">",No))};const c=new Ue(e).getHexString();return n.customProgramCacheKey=()=>"cel_"+c+"_"+(o?t:1)+"_"+s,n}const hh=7102348,qg=.66;function jg(n){return n?n.r*.2126+n.g*.7152+n.b*.0722:0}function Kg(n){return jg(n.color)>=qg?"soft3":3}function Jg(n,{skinned:e=!1}={}){return e?!0:n.userData?.keepPhysical!==!0?!1:n.userData.keepPhysicalStrict===!0?!0:!!n.transparent&&(n.opacity??1)<.95}const Zg=.3,mo=new WeakMap;function Rr(n,{tint:e=hh,bands:t=null}={}){if(mo.has(n))return mo.get(n);const i=new $0({color:n.color?n.color.clone():new Ue(16777215),map:n.map||null,alphaMap:n.alphaMap||null,gradientMap:zg(t??Kg(n)),transparent:n.transparent,opacity:n.opacity,side:n.side,alphaTest:n.alphaTest,fog:n.fog,vertexColors:n.vertexColors,emissive:n.emissive?n.emissive.clone():new Ue(0),emissiveMap:n.emissiveMap||null,emissiveIntensity:n.emissiveIntensity??1});i.depthWrite=n.depthWrite,i.depthTest=n.depthTest,i.polygonOffset=n.polygonOffset,i.polygonOffsetFactor=n.polygonOffsetFactor,i.polygonOffsetUnits=n.polygonOffsetUnits,i.name=n.name,i.userData={...n.userData,celFrom:n};const s=n.userData?.worldTextureScale;Number.isFinite(s)&&Bg(i,s);const r=typeof i.onBeforeCompile=="function"?i.onBeforeCompile:null,o=Number.isFinite(s)?"worlduv"+s:"",a=n.userData?.keepPhysical===!0;return Yg(i,e,Xg(n)?a?Zg:Wg:1,{base:r,baseKey:o}),mo.set(n,i),$g(n,i),i}function $g(n,e){n.emissive&&n.emissive.isColor&&(e.emissive=n.emissive);for(const t of["emissiveIntensity","opacity","visible"]){let i=n[t];try{Object.defineProperty(n,t,{configurable:!0,enumerable:!0,get(){return i},set(s){i=s,e[t]=s,t==="opacity"&&(e.needsUpdate=e.needsUpdate)}})}catch{}}}function Qg(n,e){return!n||n.isMeshToonMaterial||!n.isMeshStandardMaterial&&!n.isMeshPhongMaterial&&!n.isMeshLambertMaterial?!0:Jg(n,{skinned:e})}function lv(n,{tint:e=hh,seen:t=null,force:i=!1,collect:s=null}={}){const r={converted:0,skipped:0,visited:0};return n&&n.traverse(o=>{if(!o.isMesh&&!o.isPoints&&!o.isLine)return;if(!i&&t){if(t.has(o))return;t.add(o)}r.visited++;const a=!!o.isSkinnedMesh,l=c=>{if(Qg(c,a))return r.skipped++,c;r.converted++;const h=Rr(c,{tint:e});return s&&h.userData.flatten&&s.add(h.userData.flatten),h};o.material=Array.isArray(o.material)?o.material.map(l):l(o.material)}),r}const nn=Object.freeze({width:512,height:352,V0:.3,T0:-.1,T1:1.05,SLEEVE:Object.freeze({v0:.06,v1:.28})}),Jl=Object.freeze([.5,.02]);function Zl(n,e){const t=.5+Math.atan2(n.x/(e.width/2),n.z/(e.depth/2))/(Math.PI*2),i=(n.y-e.hipY)/e.torso;return[t,nn.V0+(1-nn.V0)*ke.clamp((i-nn.T0)/(nn.T1-nn.T0),0,1)]}function $l(n,e,t,i){const s=t[0]-e[0],r=t[1]-e[1],o=t[2]-e[2],a=Math.hypot(s,r,o)||1,l=n.x-e[0],c=n.y-e[1],h=n.z-e[2],u=ke.clamp((l*s+c*r+h*o)/(a*a),0,1),p=.5+Math.atan2(l*i,h)/(Math.PI*2),f=nn.SLEEVE;return[p,f.v1-(f.v1-f.v0)*u]}const Lt=(n,e)=>"#"+new Ue(n).multiplyScalar(e).getHexString(),Qi=(n,e)=>"#"+new Ue(n).lerp(new Ue("#ffffff"),e).getHexString(),e_=["polo","blouse","kariyushi","jacket","smock","cardigan"];function t_(n,e,t,i){const{width:s,height:r,V0:o,T0:a,T1:l}=nn,c=e.outfit,h=c.topColour,u=[];n.clearRect(0,0,s,r);const p=t.width,f=t.depth,g=M=>(1-(o+(1-o)*(M-a)/(l-a)))*r,y=(M,N)=>Math.asin(ke.clamp(M/(p/2*Math.max(.05,i(N))),-1,1)),m=(M,N,Z=!1)=>{const ce=y(M,N);return(.5+(Z?Math.PI-ce:ce)/(Math.PI*2))*s},d=(1-o)*r/((l-a)*t.torso),v=(M,N)=>s/(Math.PI*2)/(Math.max(.05,i(N))*Math.hypot(p/2*Math.cos(M),f/2*Math.sin(M))),b=Lt(h,.5),_=Math.max(1.5,s/300),E=(M,N)=>{N(),M&&(n.save(),n.translate(-s,0),N(),n.restore())},w=(M,N,{stroke:Z=b,back:ce=!1,width:Ce=_}={})=>E(ce,()=>{n.beginPath(),M.forEach(([J,ue],oe)=>{const X=m(J,ue,ce),ne=g(ue);oe?n.lineTo(X,ne):n.moveTo(X,ne)}),n.closePath(),N&&(n.fillStyle=N,n.fill()),Z&&(n.strokeStyle=Z,n.lineWidth=Ce,n.lineJoin="round",n.stroke())}),R=(M,N,Z=_,ce=!1)=>{n.beginPath(),M.forEach(([Ce,J],ue)=>{const oe=m(Ce,J,ce),X=g(J);ue?n.lineTo(oe,X):n.moveTo(oe,X)}),n.strokeStyle=N,n.lineWidth=Z,n.lineCap="round",n.lineJoin="round",n.stroke()},I=(M,N,Z,ce,Ce=null)=>{const J=y(M,N);n.beginPath(),n.ellipse(m(M,N),g(N),Z*v(J,N),Z*d,0,0,Math.PI*2),ce&&(n.fillStyle=ce,n.fill()),Ce&&(n.strokeStyle=Ce,n.lineWidth=_*.8,n.stroke())},S=(M,N,Z)=>{for(const ce of M)I(0,ce,N*t.k,Z,Lt(Z,.6));u.push("buttons:"+M.length)},x=c.top==="kariyushi"?pr(e,t):null,A=t.k,O=.92,U=x?Math.max(nn.T0+.02,(x.waist-x.length-t.hipY)/t.torso+.01):.15;if(c.pattern==="stripes"&&!["tank","overalls","sundress"].includes(c.top)){const M=t.torso*.12*d,N=g(1),Z=g(U);n.fillStyle="#f4f1ea";for(let ce=Z-M;ce>N;ce-=M*2)n.fillRect(0,Math.max(N,ce-M),s,Math.min(M,ce-N));u.push("stripes")}if(c.pattern==="flowers"||c.pattern==="dots"){const M=c.pattern==="flowers",N=c.top==="kariyushi",Z=A*(M?N?.05:.036:.016),ce=M?"#f8f6ef":c.accent,Ce="#f4c83c",J=M?N?7:8:14,ue=M?N?4:5:9,oe=[];for(let X=0;X<ue;X++)for(let ne=0;ne<J;ne++){const ge=Math.abs(Math.sin(X*12.9898+ne*78.233)*43758.5453)%1;oe.push([(ne+X%2*.5+ge*.18)/J*Math.PI*2-Math.PI,U+.07+(X+.5+ge*.15)/ue*(O-U-.1),X*J+ne])}for(const[X,ne,ge]of oe){if(e_.includes(c.top)&&Math.abs(X)<.2)continue;const ee=(.5+X/(Math.PI*2))*s,B=g(ne),q=Z*v(X,ne),re=Z*d;for(const D of[0,-s,s]){if(n.save(),n.translate(ee+D,B),n.scale(q,re),n.rotate(ge*.7),M){n.fillStyle=ce;for(let de=0;de<5;de++)n.beginPath(),n.ellipse(Math.cos(de*1.2566)*.5,Math.sin(de*1.2566)*.5,.42,.42,0,0,Math.PI*2),n.fill();n.fillStyle=Ce,n.beginPath(),n.arc(0,0,.28,0,Math.PI*2),n.fill()}else n.fillStyle=ce,n.beginPath(),n.arc(0,0,1,0,Math.PI*2),n.fill();n.restore()}}u.push(c.pattern)}const V=(M=Lt(h,.86))=>{n.fillStyle=M,n.fillRect(0,g(1.03),s,g(.985)-g(1.03)),n.strokeStyle=b,n.lineWidth=_*.8,n.beginPath(),n.moveTo(0,g(.985)),n.lineTo(s,g(.985)),n.stroke(),u.push("neckline")},F=(M,{drop:N=.84,spread:Z=.115,round:ce=!1}={})=>{for(const Ce of[-1,1])if(ce){const J=[];for(let ue=0;ue<=10;ue++){const oe=ue/10*Math.PI;J.push([Ce*(.012+Math.sin(oe)*Z*.62)*A,1-(1-Math.cos(oe))*.5*(1-N)*1.2])}J.push([Ce*.012*A,1]),w(J,M)}else w([[Ce*.008*A,.99],[Ce*Z*A,1],[Ce*Z*.9*A,.95],[Ce*.03*A,N]],M);n.fillStyle=M,n.fillRect(0,g(1.035),s,g(.975)-g(1.035)),n.fillRect(m(-.012*A,.99),g(1.035),m(.012*A,.99)-m(-.012*A,.99),g(.985)-g(1.035)),n.strokeStyle=b,n.lineWidth=_*.8,n.beginPath(),n.moveTo(0,g(.975)),n.lineTo(m(-Z*A,1),g(.975)),n.moveTo(m(Z*A,1),g(.975)),n.lineTo(s,g(.975)),n.stroke(),u.push("collar")},H=(M,N,Z=.022)=>{w([[-Z*A,M],[Z*A,M],[Z*A,N],[-Z*A,N]],null,{width:_*.8}),u.push("placket")},Q=(M,N,Z,ce,Ce=null)=>{w([[M-Z/2,N+ce/2],[M+Z/2,N+ce/2],[M+Z/2,N-ce/2],[M-Z/2,N-ce/2]],Ce,{width:_*.8}),R([[M-Z/2,N+ce/2-.035],[M+Z/2,N+ce/2-.035]],b,_*.6),u.push("pocket")},Y=()=>{n.strokeStyle=Lt(h,.72),n.lineWidth=_*.7,n.beginPath(),n.moveTo(0,g(U+.035)),n.lineTo(s,g(U+.035)),n.stroke()};switch(c.top){case"tee":V(),Y();break;case"hoodie":{V(Lt(h,.9));const M=p*.36,N=.36;w([[-M,N+.13],[M,N+.13],[M*1.12,N-.12],[-M*1.12,N-.12]],Lt(h,.93));for(const Z of[-1,1])R([[Z*.024*A,.97],[Z*.03*A,.74]],c.accent,_*1.6),I(Z*.03*A,.73,.007*A,c.accent);u.push("pocket","drawstrings"),Y();break}case"polo":F(Qi(h,.12)),H(.97,.78),S([.9,.82],.0075,Qi(h,.5)),Y();break;case"blouse":F("#f8f6ef",{drop:.88,spread:.1,round:!0}),H(.97,U+.04,.018),S([.85,.69,.53,.37],.007,"#f8f6ef");break;case"smock":F("#f8f6ef",{drop:.88,spread:.1,round:!0}),Q(0,.42,p*.5,.16,Lt(h,.94)),Y();break;case"kariyushi":{const M=e.body.skin,N=(ce,Ce)=>ce*p/2*i(Ce),Z=(ce,Ce,J)=>[J*N(ce,Ce),Ce];w([Z(.62,1.01,-1),Z(.62,1.01,1),[0,.73]],M,{stroke:null}),u.push("open neck");for(const ce of[-1,1])w([Z(.5,.95,ce),Z(.72,.845,ce),Z(.9,.79,ce),Z(.16,.725,ce),[0,.73]],h,{width:_*1.4}),w([Z(.6,1,ce),Z(.97,.835,ce),Z(.72,.845,ce),Z(.5,.95,ce)],h,{width:_*1.4});u.push("lapels"),H(.73,U+.03,.02),S([.695],.011,"#9a6a42"),S([.57,.45,.33],.0085,"#f8f6ef"),Q(p*.25,.62,p*.22,.17,h),Y();break}case"jacket":{w([[-.06*A,1],[.06*A,1],[0,.66]],"#f4f1ea",{stroke:null});for(const M of[-1,1])w([[M*.01*A,1],[M*.12*A,.99],[M*.13*A,.86],[M*.09*A,.84],[M*.1*A,.78],[M*.012*A,.62]],Lt(h,.88));R([[0,.62],[0,U]],b,_*.8),S([.52,.4],.009,Lt(h,.7));for(const M of[-1,1])R([[M*p*.16,.32],[M*p*.36,.32]],b,_);u.push("lapels","pocket");break}case"cardigan":{w([[-.05*A,1],[.05*A,1],[.02*A,.7],[-.02*A,.7]],Qi(h,.7),{stroke:null});for(const M of[-1,1])w([[M*.012*A,1],[M*.06*A,1],[M*.035*A,.7],[M*.035*A,U],[M*.008*A,U],[M*.008*A,.7]],c.accent,{width:_*.8});S([.62,.5,.38,.26],.008,Lt(c.accent,.8)),n.fillStyle=c.accent,n.fillRect(0,g(U+.05),s,g(U)-g(U+.05)),u.push("bands");break}case"festival":{for(const M of[-1,1])w([[M*.13*A,1],[M*.07*A,1],[-M*.06*A,.45],[-M*.13*A,.45]],c.accent);n.fillStyle=Lt(c.accent,.85),n.fillRect(0,g(.4),s,g(.3)-g(.4)),u.push("bands","sash");break}case"sailorlong":case"sailor":{const M=c.accent,N=Qi(M,.85);E(!0,()=>{n.fillStyle=M,n.fillRect(m(-p*.3,.75,!0),g(1.03),m(p*.3,.75,!0)-m(-p*.3,.75,!0),g(.72)-g(1.03)),n.strokeStyle=N,n.lineWidth=_*1.4,n.strokeRect(m(-p*.26,.75,!0),g(1),m(p*.26,.75,!0)-m(-p*.26,.75,!0),g(.76)-g(1))});for(const Z of[-1,1])w([[Z*.012*A,1],[Z*.16*A,1],[Z*.03*A,.66],[Z*0*A,.66]],M),R([[Z*.13*A,.985],[Z*.02*A,.69]],N,_*1.2);w([[-.045*A,.7],[.045*A,.7],[0,.56]],"#d8342c"),u.push("collar","scarf");break}case"police":{F("#f4f1ea",{drop:.87,spread:.09}),w([[-.016*A,.93],[.016*A,.93],[.027*A,.75],[0,.7],[-.027*A,.75]],"#18243d");for(const M of[-1,1])for(const N of[.64,.49,.34])I(M*p*.15,N,.009*A,"#d7b561");Q(-p*.25,.73,p*.19,.1,Lt(h,.92)),I(p*.25,.76,.022*A,"#d7b561"),u.push("tie","badge","buttons"),Y();break}case"overalls":{const M=c.bottomColour,N=p*.3,Z=.74;w([[-N,Z],[N,Z],[N*1.05,U],[-N*1.05,U]],M),Q(0,.58,N*.9,.14,Lt(M,.94));for(const ce of[-1,1])w([[ce*N*.95,Z],[ce*N*.55,Z],[ce*p*.18,1],[ce*p*.32,1]],M,{width:_*.8}),w([[ce*p*.32,1],[ce*p*.18,1],[-ce*p*.1,.5],[-ce*p*.25,.5]],M,{back:!0,width:_*.8}),I(ce*N*.75,Z-.03,.012*A,"#e2b84a",Lt("#e2b84a",.6));u.push("bib","straps");break}case"sundress":for(const M of[-1,1])w([[M*p*.3,.8],[M*p*.18,.8],[M*p*.16,1.02],[M*p*.28,1.02]],h,{width:_*.8}),w([[M*p*.3,.8],[M*p*.18,.8],[M*p*.16,1.02],[M*p*.28,1.02]],h,{back:!0,width:_*.8});n.fillStyle=Lt(h,.7),n.fillRect(0,g(.795),s,_*.8),u.push("straps");break;case"apron":F("#f8f6ef",{drop:.88,spread:.1,round:!0});break}{const M=nn.SLEEVE,N=(1-M.v1)*r,Z=(1-M.v0)*r,ce=Z-N,Ce=c.top,J=uh.includes(Ce),ue=Math.PI*2*t.armR*(J?1.04:1.2),oe=J?t.upper+t.fore:t.upper*.6,X=s/ue,ne=ce/oe;if(c.pattern==="stripes"){n.fillStyle="#f4f1ea";const ge=t.torso*.12*ne;for(let ee=N+ge;ee<Z;ee+=ge*2)n.fillRect(0,ee,s,Math.min(ge,Z-ee))}if(c.pattern==="flowers"||c.pattern==="dots"){const ge=c.pattern==="flowers",ee=t.k*(ge?Ce==="kariyushi"?.05:.036:.016),B=ge?"#f8f6ef":c.accent,q=ge?4:8,re=Math.max(1,Math.round(oe/(ee*4)));for(let D=0;D<re;D++)for(let de=0;de<q;de++){const le=(de+D%2*.5+.25)/q*s,ye=N+(D+.5)/re*ce*.82;for(const pe of[0,-s,s]){if(n.save(),n.translate(le+pe,ye),n.scale(ee*X,ee*ne),n.rotate(D*1.3+de),ge){n.fillStyle=B;for(let De=0;De<5;De++)n.beginPath(),n.ellipse(Math.cos(De*1.2566)*.5,Math.sin(De*1.2566)*.5,.42,.42,0,0,Math.PI*2),n.fill();n.fillStyle="#f4c83c",n.beginPath(),n.arc(0,0,.28,0,Math.PI*2),n.fill()}else n.fillStyle=B,n.beginPath(),n.arc(0,0,1,0,Math.PI*2),n.fill();n.restore()}}}if(!["tank","sundress"].includes(Ce)){const ge=Math.max(3,(J?.03:.018)*t.k*ne),ee=Lt(c.topColour,.5);n.fillStyle=Ce==="kariyushi"?Qi(c.topColour,.22):Lt(c.topColour,.86),n.fillRect(0,Z-ge,s,ge),n.fillStyle=ee,n.fillRect(0,Z-ge-1.2,s,1.2),u.push(J?"cuffs":"sleeve-hems")}}return u}const uh=Object.freeze(["jacket","smock","sailorlong","police","hoodie","cardigan","festival","lighthouse","lantern","reef"]),ko=Object.freeze(["root","hips","spine","chest","neck","head","shoulderL","elbowL","handL","shoulderR","elbowR","handR","thighL","kneeL","footL","thighR","kneeR","footR",...Ag]),Uo=Object.fromEntries(ko.map((n,e)=>[n,e])),Ql=Object.freeze({child:{base:1.12,span:.2,head:1.4},teen:{base:1.4,span:.28,head:1.18},adult:{base:1.36,span:.44,head:1.12},elder:{base:1.33,span:.34,head:1.14}});function aa(n){const e=Ut(n),t=Ql[e.age]||Ql.adult,i=t.base+e.body.height*t.span,s=i/1.6,r=e.body.build,o=Pg(e.head),a=(.19+e.head.size*.055)*s*t.head*(e.body.proportion==="rounded"?1.3:1),l=o.width,c=o.height,h=e.body.proportion==="rounded",u=.055*s,p=i-a*2*c-u,f=p*(h?.37:.47),g=p-f,y=.07*s,m=(f-y)*.5,d=m,v=(.058+r*.024)*s,b=(.045+r*.016)*s,_=e.body.silhouette==="feminine",E=e.body.silhouette==="masculine",w=(.3+r*.15)*s*(h?1.2:1)*(_?.94:E?1.08:1),R=(.2+r*.09)*s*(h?1.15:1),I=w*(_?1.13:E?.9:1),S=_?.79:E?.98:.96,x=(h?.18:.22)*s,A=(h?.16:.2)*s,O=.056*s,U=f,V=U+g*.5,F=U+g,H=F+u;return{H:i,k:s,Rh:a,headSX:l,headSY:c,profile:o,neck:u,torso:g,leg:f,foot:y,thigh:m,shin:d,legR:v,armR:b,width:w,hips:I,waistRatio:S,depth:R,upper:x,fore:A,hand:O,hipY:U,chestY:V,neckY:F,headY:H,headCentre:H+a*c*.94,shoulderX:w/2-b*.2,shoulderY:F-.075*s,hipX:I*.24,seatDrop:v*.95}}function n_(n){return{root:[0,0,0],hips:[0,n.hipY,0],spine:[0,n.hipY+n.torso*.25,0],chest:[0,n.chestY,0],neck:[0,n.neckY,0],head:[0,n.headY,0],shoulderL:[n.shoulderX,n.shoulderY,0],elbowL:[n.shoulderX+.01,n.shoulderY-n.upper,0],handL:[n.shoulderX+.015,n.shoulderY-n.upper-n.fore,0],shoulderR:[-n.shoulderX,n.shoulderY,0],elbowR:[-n.shoulderX-.01,n.shoulderY-n.upper,0],handR:[-n.shoulderX-.015,n.shoulderY-n.upper-n.fore,0],thighL:[n.hipX,n.hipY,0],kneeL:[n.hipX,n.hipY-n.thigh,0],footL:[n.hipX,n.foot,0],thighR:[-n.hipX,n.hipY,0],kneeR:[-n.hipX,n.hipY-n.thigh,0],footR:[-n.hipX,n.foot,0]}}const i_={...Rg,hips:"root",spine:"hips",chest:"spine",neck:"chest",head:"neck",shoulderL:"chest",elbowL:"shoulderL",handL:"elbowL",shoulderR:"chest",elbowR:"shoulderR",handR:"elbowR",thighL:"hips",kneeL:"thighL",footL:"kneeL",thighR:"hips",kneeR:"thighR",footR:"kneeR"},es=new Ue;function is(n,e){for(let t=1;t<n.length;t++){const[i,s]=n[t-1],[r,o]=n[t];if(e<=o)return i+(r-i)*((e-s)/(o-s||1))}return n.at(-1)[0]}function Fe(n,e,t,i,s,r=null){let o=e.index?e.toNonIndexed():e.clone();for(const d of Object.keys(o.attributes))["position","normal"].includes(d)||o.deleteAttribute(d);s&&o.applyMatrix4(s);const a=o.attributes.position.count,l=new Float32Array(a*2);if(r){const d=o.attributes.position,v=new P;for(let b=0;b<a;b++){v.fromBufferAttribute(d,b);const[_,E]=r(v);l[b*2]=_,l[b*2+1]=E}for(let b=0;b<a;b+=3){const _=[l[b*2],l[b*2+2],l[b*2+4]];if(Math.max(..._)-Math.min(..._)>.5)for(let E=0;E<3;E++)l[(b+E)*2]<.5&&(l[(b+E)*2]+=1)}}else for(let d=0;d<a;d++)l[d*2]=Jl[0],l[d*2+1]=Jl[1];o.setAttribute("uv",new Ct(l,2));const c=new Float32Array(a*3),h=new Uint16Array(a*4),u=new Float32Array(a*4),p=typeof i=="function"?i:null,f=typeof t=="function"?t:null;p||es.set(i);const g=new P,y=new P,m=new P;for(let d=0;d<a;d++){if(p&&d%3===0){const _=o.attributes.position;g.fromBufferAttribute(_,d),y.fromBufferAttribute(_,d+1),m.fromBufferAttribute(_,d+2),g.add(y).add(m).multiplyScalar(1/3),es.set(p(g))}if(c[d*3]=es.r,c[d*3+1]=es.g,c[d*3+2]=es.b,!f){h[d*4]=Uo[t],u[d*4]=1;continue}g.fromBufferAttribute(o.attributes.position,d);const v=f(g).filter(([,_])=>_>.001).sort((_,E)=>E[1]-_[1]).slice(0,4),b=v.reduce((_,[,E])=>_+E,0)||1;v.forEach(([_,E],w)=>{h[d*4+w]=Uo[_],u[d*4+w]=E/b})}return o.setAttribute("color",new Ct(c,3)),o.setAttribute("skinIndex",new jo(h,4)),o.setAttribute("skinWeight",new Ct(u,4)),o.setAttribute("ink",new Ct(new Float32Array(a).fill(1),1)),n.push(o),e!==o&&!e.userData?.keep&&e.dispose?.(),o}const Ve=(n=0,e=0,t=0,i=0,s=0,r=0,o=1,a=1,l=1)=>new He().compose(new P(n,e,t),new rt().setFromEuler(new rn(i,s,r)),new P(o,a,l));function ir(n,e,t,i,s,r,o=10){const a=new P(...e),l=new P(...t),c=l.clone().sub(a),h=c.length(),u=new xr(i,Math.max(.001,h),3,o),p=new rt().setFromUnitVectors(new P(0,1,0),c.normalize());Fe(n,u,s,r,new He().compose(a.clone().add(l).multiplyScalar(.5),p,new P(1,1,1)))}function Yn(n,e,t,i,s,r,{bone:o,joints:a=[],root:l=null,soft:c=.13,segments:h=14,uvAt:u=null}={}){const p=new P(...e),f=new P(...t),g=f.clone().sub(p),y=g.length(),m=g.clone().normalize(),d=[],v=5,b=12;for(let S=0;S<=v;S++){const x=-Math.PI/2+S/v*Math.PI/2;d.push(new he(Math.cos(x)*i,-y/2+Math.sin(x)*i))}for(let S=1;S<b;S++)d.push(new he(i,-y/2+S/b*y));for(let S=0;S<=v;S++){const x=S/v*Math.PI/2;d.push(new he(Math.cos(x)*i,y/2+Math.sin(x)*i))}d[0].x=d.at(-1).x=0;const _=new $n(d,h),E=_.attributes.position;for(let S=0;S<E.count;S++){const x=E.getY(S),A=ke.clamp(.5-x/y,0,1),O=ke.lerp(i,s,A)/i;E.setXYZ(S,E.getX(S)*O,x+(x>y/2?0:x<-y/2?(x+y/2)*(O-1):0),E.getZ(S)*O)}const w=new rt().setFromUnitVectors(new P(0,-1,0),m),R=new P;Fe(n,_,S=>{const x=R.copy(S).sub(p).dot(m)/y;let A=[[o,1]];for(const[O,U,V]of a){const F=ke.smoothstep(x,O-c,O+c);A=A.flatMap(([H,Q])=>H===U?[[U,Q*(1-F)],[V,Q*F]]:[[H,Q]])}if(l){const O=l[1]*(1-ke.smoothstep(x,-.04,l[2]??.2));A=A.map(([U,V])=>[U,V*(1-O)]),A.push([l[0],O])}return A},r,new He().compose(p.clone().add(f).multiplyScalar(.5),w,new P(1,1,1)),u)}const We=(n,e,t,i,s,r=[1,1,1],o=12,a=8)=>Fe(n,new Mt(e,o,a),i,s,Ve(t[0],t[1],t[2],0,0,0,...r)),dh=Object.freeze({crop:{front:.46,side:.02,back:-.5,radius:1.07,faceHalf:.78},sidepart:{front:.4,swoop:.28,side:0,back:-.5,radius:1.08,faceHalf:.78},bob:{front:.24,side:-.62,back:-.66,radius:1.12,faceHalf:.64},long:{front:.3,side:-.62,back:-.7,radius:1.11,faceHalf:.64},ponytail:{front:.44,side:.02,back:-.25,radius:1.08,faceHalf:.78},braids:{front:.4,swoop:.26,side:-.12,back:-.6,radius:1.08,faceHalf:.74},bun:{front:.46,side:.02,back:-.32,radius:1.07,faceHalf:.78},spiky:{front:.5,side:.05,back:-.34,radius:1.08,faceHalf:.78},perm:{front:.42,side:-.12,back:-.44,radius:1.15,faceHalf:.74,bumps:!0},buzz:{front:.52,side:.06,back:-.36,radius:1.025,faceHalf:.8},afro:{front:.48,side:-.12,back:-.5,radius:1.34,faceHalf:.74,lift:.18},horseshoe:{ring:!0,radius:1.03},bald:null});function s_(n,e){const t=dh[n];if(!t)return null;if(t.ring)return r_(t);const i=new Mt(1,64,44),s=i.attributes.position,r=new P,o=e?-1:1;for(let a=0;a<s.count;a++){r.fromBufferAttribute(s,a);let l=t.front;t.swoop&&(l-=t.swoop*ke.smoothstep(r.x*o,-.3,.5));const c=Math.max(.18-r.z,Math.abs(r.x)-t.faceHalf,r.y-l),h=ke.lerp(t.side,t.back,ke.smoothstep(-r.z,-.2,.7)),u=Math.min(c,r.y-h),p=u>0,f=t.radius*(1+(t.lift&&r.y>0?r.y*t.lift:0)),g=t.radius<1.04?.985:.8,y=ke.lerp(g,f,ke.smoothstep(u,-.035,.035));s.setXYZ(a,r.x*y,r.y*y+(t.lift&&p?t.lift*.25:0),r.z*y)}return i.computeVertexNormals(),i}function r_(n){const i=new Mt(n.radius,48,8,Math.PI/2+.95,Math.PI*2-1.9,.1,1),s=i.attributes.position,r=i.attributes.uv;for(let o=0;o<s.count;o++){const a=o%49/48,l=Math.PI/2+.95+a*(Math.PI*2-.95*2),c=ke.smoothstep(-Math.sin(l),-.3,1),h=(1-Math.abs(Math.sin(a*Math.PI*11)))*.09*c,u=Math.acos(.06+c*.5)+h,p=Math.acos(-.42-c*.12),f=u+(1-r.getY(o))*(p-u),g=ke.smoothstep(Math.min(a,1-a),0,.08),y=ke.lerp(p-.12,f,.35+.65*g);s.setXYZ(o,-Math.cos(l)*Math.sin(y)*n.radius,Math.cos(y)*n.radius,Math.sin(l)*Math.sin(y)*n.radius)}return i.computeVertexNormals(),i}function go(n,e,t){const i=n.length,s=e.hair.colour,r=e.hair.style,o=e.hair.flip?-1:1,a=t.Rh,l=0,c=t.headCentre-t.headY,h=[t.headSX*a,t.headSY*a,a*.98],u=(m,d,v)=>[m,t.headY+d,v],p=s_(r,e.hair.flip);if(p){const m=p.attributes.position,d=new P;for(let v=0;v<m.count;v++)d.fromBufferAttribute(m,v),ms(d,t.profile),m.setXYZ(v,d.x,d.y,d.z);p.computeVertexNormals(),Fe(n,p,"head",s,Ve(l,t.headY+c,0,0,0,0,...h))}const f=new Ue(s).multiplyScalar(.82).getStyle(),g=Po(e,t),y=zl("head",["hairA","hairB"],[g.rest.hairA,g.rest.hairB,g.chains.find(m=>m.kind==="hair")?.tip??g.rest.hairB]);if(r==="long"&&We(n,a*.95,u(0,c-a*.72,-a*.55),y,s,[1.05,1.25,.5]),r==="ponytail"&&(We(n,a*.34,u(0,c+a*.1,-a*1.05),"head",s,[1,1,1]),We(n,a*.3,u(0,c-a*.45,-a*1.18),y,s,[.9,1.9,.9]),We(n,a*.16,u(0,c+a*.1,-a*1.2),"head",e.outfit.accent)),r==="bun"&&We(n,a*.42,u(0,c+a*.95,-a*.3),"head",s),r==="spiky")for(let m=0;m<9;m++){const d=m/9*Math.PI*2,v=Math.cos(d)*a*.55,b=Math.sin(d)*a*.5-a*.1,_=new Ei(a*.2,a*.5,6);Fe(n,_,"head",s,Ve(v,t.headY+c+a*.88,b,Math.sin(d)*.5,0,-Math.cos(d)*.5))}if(r==="perm")for(let m=0;m<22;m++){const d=m*2.39996,v=.2+.75*(m*.618%1),b=Math.sqrt(1-v*v),_=Math.cos(d)*b,E=Math.sin(d)*b;E>.35&&v<.55||We(n,a*.24,u(_*a*1.1*t.headSX,c+v*a*1.1,E*a*1.05),"head",m%3?s:f,[1,1,1],8,6)}if(r==="braids")for(const m of[-1,1]){const d=m*a*.8,v=-a*.35;let b=c-a*.35;const _=m>0?"L":"R",E=g.chains.find(R=>R.bones[0]==="braid"+_+"1"),w=zl("head",["braid"+_+"1","braid"+_+"2"],[g.rest["braid"+_+"1"],g.rest["braid"+_+"2"],E.tip]);for(let R=0;R<6;R++){const I=a*(.2-R*.012);We(n,I,u(d+m*a*.05,b,v+a*.05*R),w,R%2?s:f,[1,1.3,1],8,6),b-=I*1.5}We(n,a*.13,u(d+m*a*.05,b+a*.05,v+a*.3),w,e.outfit.accent,[1.2,.7,1.2],8,6),We(n,a*.12,u(d+m*a*.05,b-a*.12,v+a*.3),w,s,[1,1.4,1],8,6)}if((r==="sidepart"||r==="braids")&&We(n,a*.34,u(o*a*.5,c+a*.62,a*.62),"head",s,[1.4,.55,.7],10,6),(r==="bob"||r==="long")&&We(n,a*.4,u(0,c+a*.52,a*.72),"head",s,[2,.5,.6],10,6),!["none","headband","ribbon"].includes(e.outfit.hat))for(const m of n.slice(i)){const d=m.attributes.position;m.userData.hatHair={position:d.array.slice(),normal:m.attributes.normal.array.slice()};for(let v=0;v<d.count;v++){const b=d.getX(v)/h[0],_=(d.getY(v)-t.headCentre)/h[1],E=d.getZ(v)/h[2],w=Math.hypot(b,_,E);if(_>.3&&w>1.035){const R=1.035/w;d.setXYZ(v,b*R*h[0],t.headCentre+_*R*h[1],E*R*h[2])}}m.computeVertexNormals()}}function o_(n,e){const t=dh[n],i=56,s=new Mt(1,i,1,0,Math.PI*2,.5,.5),r=s.attributes.position,o=s.attributes.uv,a=new P;let l=[0,.4,-1];for(let c=0;c<r.count;c++){const h=c%(i+1)/i,u=h*Math.PI*2,p=Math.sin(u),f=Math.cos(u),g=ke.smoothstep(-f,-.2,1),y=.3+g*.14,m=y+(o.getY(c)-.5)*.14,d=Math.sqrt(1-m*m);a.set(p*d,m,f*d);let v=1.035;if(t&&!t.ring){const b=Math.max(.18-a.z,Math.abs(a.x)-t.faceHalf,a.y-t.front),_=ke.lerp(t.side,t.back,ke.smoothstep(-a.z,-.2,.7)),E=Math.min(b,a.y-_),w=t.radius*(1+(t.lift&&a.y>0?a.y*t.lift:0))+.03;v=ke.lerp(1.035,Math.max(1.035,w),ke.smoothstep(E,-.06,.06))}else t?.ring&&g>.3&&(v=t.radius+.03);a.multiplyScalar(v),ms(a,e),r.setXYZ(c,a.x,a.y,a.z),Math.abs(h-.5)<1e-6&&o.getY(c)>.5&&(l=[0,a.y-.07,a.z])}return s.computeVertexNormals(),{geometry:s,knot:l}}function a_(n,e=aa(n)){return{brimY:e.headCentre+e.Rh*e.headSY*.55,crownHeight:e.Rh*e.headSY*.8}}function fh(n,e,t){const i=e.outfit.hat,s=e.outfit.hatColour,r=t.Rh;if(t.headCentre+r*t.headSY*.2,i==="none")return;const o=[t.headSX*r,t.headSY*r,r];if(i==="cap"||i==="police"||i==="captain"){const a=i==="police",l=a?new Je(1.16,1.03,.4,28,1,!0):new Mt(1.1,24,12,0,Math.PI*2,0,Math.PI*.5);Fe(n,l,"head",s,Ve(0,t.headCentre+r*t.headSY*(a?.95:.23),0,a?0:-.08,0,0,o[0],o[1]*(a?1:i==="cap"?.9:1.05),o[2])),a&&Fe(n,new hr(1.16,28),"head",s,Ve(0,t.headCentre+r*t.headSY*1.15,0,-Math.PI/2,0,0,o[0],o[2],1)),We(n,r*.68,[0,t.headCentre+r*t.headSY*(a?.68:.25),r*.9],"head",i==="cap"?s:"#1c1c24",[t.headSX*1.4,.07,1],20,8),i!=="cap"&&(Fe(n,new Je(r*1.12,r*1.12,r*.14,24,1,!0),"head",i==="captain"?"#1c1c24":"#1c2742",Ve(0,t.headCentre+r*(a?.72:.26),0,-.08)),We(n,r*.1,[0,t.headCentre+r*(a?.95:.62),r*1.02],"head","#e0b93a",[1,1,.4],8,6))}else if(i==="helmet")i!=="paperboat"&&Fe(n,new Mt(1.16,24,12,0,Math.PI*2,0,Math.PI*.52),"head",s,Ve(0,t.headCentre+r*t.headSY*.35,0,0,0,0,o[0],o[1]*.9,o[2])),Fe(n,new sn(1.16,.045,6,24),"head",s,Ve(0,t.headCentre+r*t.headSY*.35,0,Math.PI/2,0,0,o[0],o[2],o[1]));else if(i==="straw"){const a=a_(e,t),l=a.brimY;Fe(n,new ur(r*.98,r*2.1,32),"head",s,Ve(0,l,0,-Math.PI/2,0,0,t.headSX,1,1)),Fe(n,new ur(r*.98,r*2.1,32),"head",s,Ve(0,l-.012*t.k,0,Math.PI/2,0,0,t.headSX,1,1)),Fe(n,new Je(r*.78,r*1.08,a.crownHeight,24,1,!0),"head",s,Ve(0,l+a.crownHeight/2,0,0,0,0,t.headSX,1,1)),Fe(n,new hr(r*.78,24),"head",s,Ve(0,l+a.crownHeight,0,-Math.PI/2,0,0,t.headSX,1,1)),Fe(n,new Je(r*1.045,r*1.09,r*.12*t.headSY,24,1,!0),"head","#d8342c",Ve(0,l+r*.06*t.headSY,0,0,0,0,t.headSX,1,1))}else if(i==="beanie")Fe(n,new Mt(1.17,20,12,0,Math.PI*2,0,Math.PI*.49),"head",s,Ve(0,t.headCentre+r*.12,0,0,0,0,...o)),Fe(n,new sn(1.14,.09,6,24),"head",s,Ve(0,t.headCentre+r*.18,0,Math.PI/2,0,0,o[0],o[2],o[1])),We(n,r*.22,[0,t.headCentre+r*t.headSY*1.32,0],"head",s,[1,1,1],10,8);else if(i==="beret")We(n,r,[r*.15,t.headCentre+r*t.headSY*.83,0],"head",s,[t.headSX*1.35,.38,1.25],20,12),Fe(n,new Je(r*.055,r*.055,r*.15,6),"head",s,Ve(r*.15,t.headCentre+r*t.headSY*1.2,0));else if(i==="bucket"){const a=t.headCentre+r*t.headSY*.88;Fe(n,new Je(r*.93,r*1.13,r*.62,20),"head",s,Ve(0,a,0,0,0,0,t.headSX,1,1)),Fe(n,new Je(r*1.12,r*1.5,r*.16,24,1,!0),"head",s,Ve(0,a-r*.33,0,0,0,0,t.headSX,1,1))}else if(["squid","teapot","sunflower","paperboat","mountain"].includes(i)){i!=="paperboat"&&Fe(n,new Mt(1.16,24,12,0,Math.PI*2,0,Math.PI*.49),"head",s,Ve(0,t.headCentre+r*t.headSY*.35,0,0,0,0,o[0],o[1]*.86,o[2]));const a=t.headCentre+r*t.headSY*1.16;if(i==="squid"){We(n,r*.6,[0,a+r*.2,0],"head",s,[1,.9,1],16,12);for(const l of[-1,1]){We(n,r*.12,[l*r*.25,a+r*.2,r*.53],"head","#f4f1ea",[1,1,.45],10,8),We(n,r*.055,[l*r*.25,a+r*.2,r*.59],"head","#27304d",[1,1,.4],8,6);for(const c of[-.45,.05])ir(n,[l*r*.78,a-r*.18,c*r],[l*r*.96,a-r*.65,c*r],r*.1,"head",s,8)}}else if(i==="teapot")We(n,r*.62,[0,a+r*.14,0],"head",s,[1.15,.72,1],16,12),Fe(n,new sn(r*.38,r*.07,8,18),"head",s,Ve(-r*.66,a+r*.14,0)),Fe(n,new Ei(r*.17,r*.55,12),"head",s,Ve(r*.69,a+r*.25,0,0,0,-.9)),We(n,r*.12,[0,a+r*.67,0],"head",e.outfit.accent,[1,.6,1],10,8);else if(i==="sunflower"){for(let l=0;l<10;l++){const c=l*Math.PI/5;We(n,r*.25,[Math.cos(c)*r*.45,a+r*.44+Math.sin(c)*r*.45,r*.25],"head","#f4d23c",[1,.65,.25],10,8)}We(n,r*.29,[0,a+r*.44,r*.31],"head","#9a6a42",[1,1,.3],12,10)}else if(i==="mountain")Fe(n,new Ei(r*.75,r*.86,12),"head",s,Ve(0,a+r*.26,0)),Fe(n,new Ei(r*.31,r*.38,12),"head","#f4f1ea",Ve(0,a+r*.69,0));else{for(const l of[-1,1]){const c=new _t;c.setAttribute("position",new Ke([-r*1.25,a,l*r*.65,r*1.25,a,l*r*.65,0,a+r*.67,0],3)),c.computeVertexNormals(),Fe(n,c,"head","#f4f1ea")}Fe(n,new wt(r*2.45,r*.16,r*.11),"head",s,Ve(0,a-r*.02,r*.66))}}else if(i==="ribbon"){const a=r*t.headSX*.68,l=t.headCentre+r*t.headSY*.85,c=r*.52;for(const h of[-1,1])We(n,r*.2,[a+h*r*.16,l,c],"head",s,[1.1,.7,.45],10,8);We(n,r*.09,[a,l,c+r*.04],"head",s,[1,1,.7],8,6)}else if(i==="headband"){const a=o_(e.hair.style,t.profile);Fe(n,a.geometry,"head",s,Ve(0,t.headCentre,0,0,0,0,...o)),We(n,r*.13,[0,t.headCentre+a.knot[1]*o[1],a.knot[2]*o[2]-r*.04],"head",s,[1.5,.8,.7],8,6)}else i==="kerchief"&&(Fe(n,new Mt(1.1,24,12,0,Math.PI*2,0,Math.PI*.36),"head",s,Ve(0,t.headCentre+r*.05,-r*.12,-.45,0,0,...o)),We(n,r*.2,[0,t.headCentre+r*.1,-r*1.1],"head",s,[1.3,.9,.9],8,6))}function cv(n,{mode:e="wall",shadows:t=!0}={}){const i=Ut(n);if(i.outfit.hat==="none")return null;const s=[];if(fh(s,i,aa(i)),!s.length)return null;const r=nr(s,!1);s.forEach(c=>c.dispose());for(const c of["skinIndex","skinWeight"])r.deleteAttribute(c);r.computeBoundingBox();const o=r.boundingBox,a=o.getCenter(new P);r.translate(-a.x,e==="stand"?-o.min.y:-a.y,e==="stand"?-a.z:-o.min.z),r.computeBoundingSphere();const l=new ut(r,Rr(new St({vertexColors:!0}),{bands:"soft3"}));return l.name=(i.name||"Resident")+"’s hat",l.castShadow=t,l.receiveShadow=!0,l.userData.hatProp=!0,l}function l_(n,e,t){const i=e.accessories,s=t.Rh,r=i.colour;if(i.earrings!=="none")for(const o of[-1,1]){const a=o*s*t.headSX*1.035,l=t.headCentre-s*.21,c=s*.04;i.earrings==="studs"?We(n,s*.085,[a,l,c],"head",r,[1,1,.65],8,6):Fe(n,new sn(s*.16,s*.035,6,14),"head",r,Ve(a,l-s*.1,c,0,o*.5))}i.neckwear==="pendant"?(Fe(n,new sn(t.width*.3,t.k*.007,5,18),"chest",r,Ve(0,t.neckY-.035,t.depth*.05,Math.PI/2-.5)),We(n,t.k*.025,[0,t.neckY-.12,t.depth*.53],"chest",r,[.7,1,.35],8,6)):i.neckwear==="scarf"&&(Fe(n,new sn(t.armR*1.7,t.armR*.55,6,18),"chest",r,Ve(0,t.neckY-.035,0,Math.PI/2)),Fe(n,new wt(t.width*.22,t.torso*.5,.025),"chest",r,Ve(t.width*.14,t.neckY-t.torso*.28,t.depth*.53,0,0,-.15))),i.pin&&We(n,t.k*.024,[t.width*.22,t.neckY-t.torso*.28,t.depth*.52],"chest",r,[1,1,.3],8,6)}const c_=n=>n.facial.style==="none"&&(["bob","long","ponytail","braids","bun","perm"].includes(n.hair.style)||n.mouth.colour!=="#b8544a");function ph(n,e){const t=1+(n.body.build-.5)*.12,i=e.hips/e.width;return[[0,-.1],[i*.86,-.08],[i,.05],[i,.13],[i,.15],[e.waistRatio*t,.3],[e.waistRatio*(1+(t-1)*.6),.5],[1,.66],[.985,.74],[.95,.8],[.88,.87],[.76,.93],[.58,.98],[.38,1.01],[.19,1.03],[0,1.04]]}function ec(n,e){const t=document.createElement("canvas");t.width=nn.width,t.height=nn.height;const i=t.getContext("2d"),s=ph(n,e),r=t_(i,n,e,h=>is(s,h))||[],o=new Nc(t);o.colorSpace=Bt,o.wrapS=1e3,o.generateMipmaps=!1,o.minFilter=1006,o.anisotropy=4;const a=Rr(new St({vertexColors:!0}),{bands:"soft3"});a.map=o;const l=a.onBeforeCompile,c=a.customProgramCacheKey?.bind(a);return a.onBeforeCompile=(h,u)=>{l?.call(a,h,u),h.fragmentShader=h.fragmentShader.replace("#include <map_fragment>","").replace("#include <color_fragment>",`#include <color_fragment>
#ifdef USE_MAP
 vec4 garment = texture2D( map, vMapUv );
 diffuseColor.rgb = mix( diffuseColor.rgb, garment.rgb, garment.a );
#endif`)},a.customProgramCacheKey=()=>"garment_"+(c?c():""),a.userData.garment={canvas:t,texture:o,marks:r},a}function _o(n,e,t,i=!1){const s=e.outfit,r=e.body.skin,o=i?r:s.topColour,a=i?e.swim.colour:s.bottomColour,l=t.width,c=t.depth,h=t.hipY,u=!i&&s.top==="tank",p=!i&&s.bottom==="underwear",f=ph(e,t),g=new $n(f.map(([E,w])=>new he(E,w)),28),y=h+t.torso*(p?.05:.13);if(Fe(n,g,E=>{const w=ke.smoothstep(E.y,h+t.torso*.15,h+t.torso*.55);return[["hips",1-w],["chest",w]]},E=>i?E.y<y?a:r:E.y<y?a:u?r:["jacket","cardigan","festival"].includes(s.top)&&E.z>c*.18&&Math.abs(E.x)<l*.13?s.accent:s.top==="sundress"&&(E.y-h)/t.torso>.78?r:o,Ve(0,h,0,0,0,0,l/2,t.torso,c/2),i?null:E=>Zl(E,t)),u){const w=f.filter(([,x])=>x>=.05&&x<=.77).concat([[is(f,.77),.77]]),R=new $n(w.map(([x,A])=>new he(x*1.025,A)),28);Fe(n,R,"chest",o,Ve(0,h,0,0,0,0,l/2,t.torso,c/2));const I=.4,S=x=>{const A=is(f,x)*1.025;return c/2*Math.sqrt(Math.max(0,A*A-I*I))+.004*t.k};for(const x of[-1,1]){const A=x*l/2*I,O=[.77,.9,1].map(V=>[A,h+t.torso*V,S(V)]);O.push([A,h+t.torso*1.035,0]);const U=O.concat(O.slice(0,-1).reverse().map(([V,F,H])=>[V,F,-H]));for(let V=1;V<U.length;V++)ir(n,U[V-1],U[V],.016*t.k,"chest",o,6)}}if(i&&c_(e)&&Fe(n,new Je(l*.52,l*.52,t.torso*.2,16,1,!0),"chest",e.swim.colour,Ve(0,h+t.torso*.66,0,0,0,0,1,1,c/l)),ir(n,[0,t.neckY-.02,0],[0,t.headY+.01,0],t.armR*1.08,"neck",r,8),!i&&s.top==="kariyushi"){const E=t.armR*1.08+.004*t.k,w=.007*t.k,R=.045*t.k,I=.012*t.k,S=.95,x=new $n([[E,0],[E+w,0],[E+w+I,R],[E+I*.6,R]].map(([O,U])=>new he(O,U)).concat([new he(E,0)]),24,S,Math.PI*2-S*2),A=x.attributes.position;for(let O=0;O<A.count;O++){const U=Math.abs(Math.atan2(A.getX(O),A.getZ(O)));A.setY(O,A.getY(O)*ke.smoothstep(U,S,S+.9))}x.computeVertexNormals(),Fe(n,x,"chest",o,Ve(0,t.neckY-.012*t.k,0))}if(!i&&s.top==="hoodie"&&Fe(n,new Mt(t.width*.35,16,12,0,Math.PI*2,0,Math.PI*.75),"chest",o,Ve(0,t.neckY-.045,-c*.32,.9,0,0,1,.7,.55)),!i&&["lighthouse","lantern","reef"].includes(s.top)){const E=h+t.torso*.52;if(s.top==="lantern"){Fe(n,new Mt(1,24,16),"chest",o,Ve(0,E,0,0,0,0,l*.63,t.torso*.55,c*.68));for(const w of[.12,.9])Fe(n,new Je(l*.48,l*.48,.026*t.k,24),"chest",s.accent,Ve(0,h+t.torso*w,0,0,0,0,1,1,c/l));for(const w of[-.9,-.45,0,.45,.9]){const R=[];for(let I=0;I<=10;I++){const S=-1.05+I*.21;R.push([Math.sin(w)*l*.64*Math.cos(S),E+Math.sin(S)*t.torso*.55,Math.cos(w)*c*.69*Math.cos(S)])}for(let I=1;I<R.length;I++)ir(n,R[I-1],R[I],.007*t.k,"chest",s.accent,5)}}else if(s.top==="lighthouse"){for(const w of[.25,.6])Fe(n,new Je(l*.51,l*.51,t.torso*.11,24,1,!0),"chest",s.accent,Ve(0,h+t.torso*w,0,0,0,0,1,1,c/l));Fe(n,new sn(l*.11,.012*t.k,8,18),"chest",s.accent,Ve(0,h+t.torso*.79,c*.38)),We(n,l*.09,[0,h+t.torso*.79,c*.38],"chest","#7fb0d8",[1,1,.2],12,8)}else{for(const w of[-1,1]){const R=new _t;R.setAttribute("position",new Ke([w*l*.42,h+t.torso*.24,-c*.15,w*l*.9,h+t.torso*.49,-c*.15,w*l*.42,h+t.torso*.83,-c*.15],3)),R.computeVertexNormals(),Fe(n,R,"chest",s.accent);const I=R.clone();I.scale(1,1,-1),Fe(n,I,"chest",s.accent)}for(let w=0;w<3;w++)We(n,.026*t.k,[(w-1)*l*.19,E,c*.52],"chest",s.accent,[1,1,.35],8,6)}}if(!i&&s.top==="apron"){const E=h+t.torso*.75,w=h-t.thigh*.78,R=new ps(l*.7,E-w,8,14);R.translate(0,(E+w)/2,0);const I=R.attributes.position,S=["skirt","longskirt"].includes(s.bottom),x=s.bottom==="longskirt"?t.thigh+t.shin*.85:t.thigh*.9;for(let O=0;O<I.count;O++){const U=I.getY(O),V=(U-h)/t.torso,F=U>=h?l/2*is(f,V):S?ke.lerp(t.hips*.53,t.hips*.66+x*.22,ke.clamp((h+.03-U)/x,0,1)):l*.52,H=I.getX(O)*(U>h?1-ke.clamp(V,0,1)*.25:1);I.setXYZ(O,H,U,F*c/l*Math.sqrt(Math.max(.05,1-(H/F)**2))+.025*t.k)}R.computeVertexNormals(),Fe(n,R,O=>{if(O.y>h){const F=ke.smoothstep(O.y,h,h+t.torso*.35);return[["hips",1-F],["chest",F]]}const U=ke.smoothstep(h-O.y,.02,.12),V=ke.smoothstep(O.x,-l*.25,l*.25);return[["hips",1-U],["thighL",U*V],["thighR",U*(1-V)]]},new Ue(s.topColour).multiplyScalar(1.12).getHex())}const v=!i&&uh.includes(s.top),b=t.upper/(t.upper+t.fore);for(const E of["L","R"]){const w=E==="L"?1:-1,R=[w*t.shoulderX,t.shoulderY,0],I=[w*(t.shoulderX+.015),t.shoulderY-t.upper-t.fore,0],S={bone:"shoulder"+E,joints:[[b,"shoulder"+E,"elbow"+E]]};Yn(n,R,I,t.armR*1.04,t.armR*.86,i||!v?r:o,v?{...S,uvAt:A=>$l(A,R,I,w)}:S);const x=A=>{const O=ke.smoothstep(Math.abs(A.x),t.shoulderX-t.armR*1.1,t.shoulderX+t.armR*.3);return[["chest",1-O],["shoulder"+E,O]]};if(Fe(n,new Mt(t.armR*1.18,16,12),x,i||u||s.top==="sundress"?r:o,Ve(R[0]-w*t.armR*.12,R[1]-t.armR*.05,0,0,0,0,1,.62,Math.min(1.1,c/l*1.6))),!i&&!v&&!u&&s.top!=="sundress"){const A=s.top==="kariyushi",O=[R[0]-w*t.armR*.05,R[1]+t.armR*.08,0],U=[R[0]+w*.008,R[1]-t.upper*(A?.52:.56),0];Yn(n,O,U,t.armR*(A?1.2:1.16),t.armR*(A?1.16:1.12),o,{...S,joints:[],root:["chest",.55,.3],uvAt:V=>$l(V,O,U,w)})}We(n,t.hand,[I[0],I[1]-t.hand*.55,0],"hand"+E,r,[.9,1.15,.78],12,10),We(n,t.hand*.42,[I[0]-w*t.hand*.55,I[1]-t.hand*.35,t.hand*.42],"hand"+E,r,[1,1.2,1],8,6)}if(!i&&s.top==="kariyushi"){const E=pr(e,t),w=l/2*is(f,(E.waist-h)/t.torso)*.97,R=new Je(w,E.rx*1.04,E.length,32,4,!0);Fe(n,R,Hl(E,()=>[["hips",1]]),o,Ve(0,E.waist-E.length/2,0,0,0,0,1,1,c/l),I=>Zl(I,t))}const _=i?"swim":s.bottom;for(const E of["L","R"]){const w=E==="L"?1:-1,R=[w*t.hipX,h,0];w*t.hipX,h-t.thigh;const I=[w*t.hipX,t.foot,0],S={bone:"thigh"+E,joints:[[t.thigh/(h-t.foot),"thigh"+E,"knee"+E]]},x=_==="trousers"||_==="widepants";if(Yn(n,R,I,t.legR*(_==="widepants"?1.32:1.02),t.legR*(_==="widepants"?1.28:.86),x?a:r,S),_==="cropped"||_==="culottes"){const O=_==="cropped"?t.foot+t.shin*.35:h-t.thigh*1.12;Yn(n,R,[R[0],O,0],t.legR*(_==="culottes"?1.55:1.12),t.legR*(_==="culottes"?1.7:1.16),a,S)}(_==="shorts"||_==="swim")&&Yn(n,[R[0],R[1]+t.legR*.3,0],[R[0]*1.04,h-t.thigh*(_==="swim"?.22:.55),0],t.legR*1.2,t.legR*1.26,a,{...S,joints:[]}),_==="underwear"&&Yn(n,[R[0],R[1]+t.legR*.3,0],[R[0]*1.02,h-t.thigh*.16,0],t.legR*1.12,t.legR*1.14,a,{...S,joints:[]});const A=i?"barefoot":s.footwear;A==="barefoot"||A==="sandals"?(We(n,t.legR*1.12,[w*t.hipX,t.foot*.55,t.legR*.5],"foot"+E,r,[1,.55,1.7],12,8),A==="sandals"&&(We(n,t.legR*1.24,[w*t.hipX,t.foot*.12,t.legR*.55],"foot"+E,e.age==="elder"?"#6b4a32":"#c8a878",[1,.18,1.8],12,6),We(n,t.legR*.42,[w*t.hipX,t.foot*.55+t.legR*.55,t.legR*.95],"foot"+E,s.shoes,[2.3,.5,.8],10,6))):(We(n,t.legR*1.25,[w*t.hipX,t.foot*.62,t.legR*.55],"foot"+E,s.shoes,[1,.6,A==="shoes"?1.85:1.75],12,8),A==="boots"&&Yn(n,[w*t.hipX,t.foot,0],[w*t.hipX,t.foot+t.shin*.65,0],t.legR*1.08,t.legR*1.05,s.shoes,{bone:"knee"+E,joints:[]}),We(n,t.legR*1.32,[w*t.hipX,t.foot*.16,t.legR*.6],"foot"+E,A==="shoes"?"#2b2622":e.age==="elder"?"#6b4a32":"#f2efe6",[1,.24,1.8],12,6))}if(_==="skirt"||_==="longskirt"||_==="pleatedskirt"){const E=_==="skirt"||_==="pleatedskirt"?t.thigh*.9:t.thigh+t.shin*.85,w=S=>{const x=ke.smoothstep(h-S.y,.02,.12),A=ke.smoothstep(S.x,-l*.25,l*.25);return[["hips",1-x],["thighL",x*A],["thighR",x*(1-A)]]},R=new Je(t.hips*.53,t.hips*.66+E*.22,E,_==="pleatedskirt"?64:24,6,!0);if(_==="pleatedskirt"){const S=R.attributes.position;for(let x=0;x<S.count;x++){const A=S.getX(x),O=S.getZ(x),U=1+.055*Math.cos(Math.atan2(O,A)*16);S.setXYZ(x,A*U,S.getY(x),O*U)}R.computeVertexNormals()}const I=pr(e,t);Fe(n,R,I?Hl(I,w):w,s.bottomPattern==="plaid"?(S=>{const x=Math.floor(Math.atan2(S.x,S.z)*12/Math.PI)%4===0,A=Math.floor((h-S.y)/(.06*t.k))%4===0;return x||A?s.accent:a}):a,Ve(0,y-E/2,0,0,0,0,1,1,c/l))}}const h_=.011,yo=new Map;function tc({skinned:n=!0,colour:e=null,width:t=h_}={}){const i=(n?"s":"m")+(e??"v")+t;if(yo.has(i))return yo.get(i);const s=new qo({color:e??16777215,vertexColors:e==null,side:1});s.name="Shimanchu outline",s.userData.outline=!0;const r={value:t};return s.onBeforeCompile=o=>{o.uniforms.uOutline=r,o.vertexShader=`uniform float uOutline;
`+o.vertexShader.replace("#include <project_vertex>",(n?`vec3 outlineN = normalize( objectNormal ) * ink;
`:`vec3 outlineN = normalize( position );
`)+`transformed += outlineN * uOutline;
#include <project_vertex>`),n&&(o.vertexShader=`attribute float ink;
`+o.vertexShader),e==null&&(o.fragmentShader=o.fragmentShader.replace("#include <color_fragment>",`#include <color_fragment>
 diffuseColor.rgb *= vec3( 0.32, 0.27, 0.27 );`))},s.customProgramCacheKey=()=>"shimanchu-outline-"+i,yo.set(i,s),s}function vo(n,e,t){const i=t?new tr(e.geometry,tc({skinned:!0})):new ut(e.geometry,tc({skinned:!1,colour:4861992}));return i.name=e.name+" outline",i.castShadow=!1,i.receiveShadow=!1,i.frustumCulled=!1,i.userData.outline=!0,t?(i.bind(e.skeleton,e.bindMatrix),n.add(i)):e.add(i),i}function u_(n,e,t){const i=document.createElement("canvas");i.width=i.height=t;const s=i.getContext("2d"),r=new Nc(i);r.colorSpace=Bt,r.anisotropy=4;let o=new Mt(1,36,26);const a=o.attributes.position,l=o.attributes.uv,c=new P,h=Math.PI/2-.95,u=1.9,p=Math.PI*.28,f=Math.PI*.58;for(let w=0;w<a.count;w++){c.fromBufferAttribute(a,w);const R=Math.atan2(c.z,-c.x),I=Math.acos(ke.clamp(c.y,-1,1));l.setXY(w,ke.clamp((R-h)/u,.002,.998),ke.clamp(1-(I-p)/f,.002,.998)),ms(c,e.profile),a.setXYZ(w,c.x,c.y,c.z)}o.scale(e.Rh*e.headSX,e.Rh*e.headSY,e.Rh*.98),o.computeVertexNormals();const g=o.attributes.normal,y=new P,m=new P(0,.4,.92).normalize();for(let w=0;w<g.count;w++)y.fromBufferAttribute(g,w),y.lerp(m,ke.smoothstep(y.z,-.35,.45)*.7).normalize(),g.setXYZ(w,y.x,y.y,y.z);const d=o;o=d.toNonIndexed(),d.dispose();const v=o.attributes.position,b=o.attributes.uv;for(let w=0;w<v.count;w+=3){const R=[b.getX(w),b.getX(w+1),b.getX(w+2)];if(v.getZ(w)<=0&&v.getZ(w+1)<=0&&v.getZ(w+2)<=0||Math.max(...R)-Math.min(...R)>.5)for(let S=0;S<3;S++)b.setXY(w+S,.002,.002)}const _=Rr(new St({map:r,emissive:16777215,emissiveMap:r,emissiveIntensity:.05}),{bands:"soft3"}),E=new ut(o,_);return E.name="Shimanchu head",E.position.y=e.headCentre-e.headY,{head:E,canvas:i,ctx:s,texture:r}}function bo(n,e,t){if(e.nose.style==="none")return;const i=Ar(e),s=Math.PI*.28+i.noseY/256*Math.PI*.58,r=Math.PI/2-.95+i.noseX/256*1.9,o=ms(new P(-Math.cos(r)*Math.sin(s),Math.cos(s),Math.sin(r)*Math.sin(s)),t.profile),a=e.nose.style==="hook",l=e.nose.style==="wide",c=t.Rh*(.065+e.nose.size*.055);We(n,c,[o.x*t.Rh*t.headSX,t.headCentre+o.y*t.Rh*t.headSY,o.z*t.Rh*.98+c*.55],"head",e.body.skin,[l?1.45:.85,a?1.55:.85,a?1.65:1.2],12,10)}function Fo(n,{shadows:e=!0,faceSize:t=256}={}){const i=Ut(n),s=aa(i),r=Po(i,s),o={...n_(s),...r.rest},a={},l=ko.map(F=>{const H=new Ic;return H.name=F,a[F]=H,H});for(const F of ko){const H=a[F],Q=o[F],Y=i_[F];if(Y){const M=o[Y];H.position.set(Q[0]-M[0],Q[1]-M[1],Q[2]-M[2]),a[Y].add(H)}else H.position.set(...Q)}const c=[];_o(c,i,s,!1);const h=c.reduce((F,H)=>F+H.attributes.position.count,0);for(const F of["L","R"]){const H=F==="L"?1:-1,Q=H*(s.shoulderX+.015),Y=s.shoulderY-s.upper-s.fore;for(let M=0;M<4;M++)Fe(c,new xr(s.hand*.105,s.hand*(M===0||M===3?.4:.6),3,6),"hand"+F,i.body.skin,Ve(Q+(M-1.5)*s.hand*.37,Y-s.hand*(M===0||M===3?1.65:1.85),s.hand*.04,0,0,(M-1.5)*.16))}const u=c.reduce((F,H)=>F+H.attributes.position.count,0);bo(c,i,s);for(const F of[-1,1])We(c,s.Rh*.2,[F*s.Rh*s.headSX*.97,s.headCentre-s.Rh*.08,-s.Rh*.05],"head",i.body.skin,[.55,1,.8],8,6);go(c,i,s),l_(c,i,s);const p=c.reduce((F,H)=>F+H.attributes.position.count,0);fh(c,i,s);const f=[];let g=0;for(const F of c)F.userData.hatHair&&f.push({offset:g,original:F.userData.hatHair,tucked:{position:F.attributes.position.array.slice(),normal:F.attributes.normal.array.slice()}}),g+=F.attributes.position.count*3;let y=!0;const m=nr(c,!1);c.forEach(F=>F.dispose());const d=m.attributes.position.count>p;m.computeBoundingSphere();const v=ec(i,s),b=new tr(m,v);b.name="Shimanchu body",b.add(a.root),b.bind(new Zo(l)),b.castShadow=e,b.receiveShadow=!0,b.frustumCulled=!1;let _=null,E=null,w=null,R=null;const I=u_(i,s,t);I.head.castShadow=e,I.head.receiveShadow=!0,a.head.add(I.head);const S=new Xt;S.name="Shimanchu · "+(i.name||"resident"),S.add(b,a.root),S.rotation.y=Math.PI;const x=vo(S,b,!0);vo(I.head,I.head,!1);const A=m.attributes.position.array.slice(h*3,u*3),O=A.slice();for(let F=h;F<u;F++){const H=m.attributes.skinIndex.getX(F)===Uo.handL?1:-1,Q=(F-h)*3;O[Q]=H*(s.shoulderX+.015),O[Q+1]=s.shoulderY-s.upper-s.fore-s.hand*.55,O[Q+2]=0}m.attributes.position.array.set(O,h*3);let U=!1;const V={recipe:i,measure:s,root:S,body:b,bones:a,face:I,height:s.H,hasHat:d,garment:v.userData.garment,springSetup:r,springs:null,setOpenHands(F){F=!!F,U!==F&&(U=F,m.attributes.position.array.set(F?A:O,h*3),m.attributes.position.needsUpdate=!0)},setHat(F){if(m.setDrawRange(0,F||!d?1/0:p),y!==!!F){for(const H of f){const Q=F?H.tucked:H.original;m.attributes.position.array.set(Q.position,H.offset),m.attributes.normal.array.set(Q.normal,H.offset)}f.length&&(m.attributes.position.needsUpdate=!0,m.attributes.normal.needsUpdate=!0),y=!!F}},get hatOn(){return d&&m.drawRange.count===1/0},faceState:{expression:"neutral",blink:0,talk:0,look:[0,0]},paintFace(F){const H=V.faceState,Q={...H,...F},Y=Q.expression+"|"+(Q.blink>.5?1:0)+"|"+(Q.talk>.5?1:0)+"|"+Math.round(Q.look[0]*2)+","+Math.round(Q.look[1]*2);return Y===V.faceKey?!1:(V.faceKey=Y,Object.assign(H,Q),Og(I.ctx,i,{...Q,size:I.canvas.width}),I.texture.needsUpdate=!0,!0)},wear(F){if(["nozomi","sailor"].includes(F)&&R!==F){E?.removeFromParent(),w?.removeFromParent(),E?.geometry.dispose(),R=F;const Q=Ut({...i,outfit:{...i.outfit,...F==="sailor"?Co:Wl}}),Y=[];_o(Y,Q,s),bo(Y,Q,s);for(const N of[-1,1])We(Y,s.Rh*.2,[N*s.Rh*s.headSX*.97,s.headCentre-s.Rh*.08,-s.Rh*.05],"head",i.body.skin,[.55,1,.8],8,6);go(Y,Q,s);const M=nr(Y,!1);Y.forEach(N=>N.dispose()),E=new tr(M,ec(Q,s)),E.name=F==="sailor"?"Thuan · harbour academy sailor":"Thuan · shopping lane outfit",E.bind(b.skeleton,b.bindMatrix),E.castShadow=e,E.frustumCulled=!1,S.add(E),w=vo(S,E,!0)}if(F==="swim"&&!_){const Q=[];_o(Q,i,s,!0),bo(Q,i,s);for(const M of[-1,1])We(Q,s.Rh*.2,[M*s.Rh*s.headSX*.97,s.headCentre-s.Rh*.08,-s.Rh*.05],"head",i.body.skin,[.55,1,.8],8,6);go(Q,{...i,outfit:{...i.outfit,hat:"none"}},s);const Y=nr(Q,!1);Q.forEach(M=>M.dispose()),_=new tr(Y,v),_.name="Shimanchu swimwear",_.bind(b.skeleton,b.bindMatrix),_.castShadow=e,_.frustumCulled=!1,S.add(_)}const H=F==="sailor"?{...i,outfit:{...i.outfit,...Co}}:F==="nozomi"?{...i,outfit:{...i.outfit,...Wl}}:F==="swim"?{...i,outfit:{...i.outfit,top:"tank",bottom:"shorts"}}:i;V.springKey!==F&&(V.springKey=F,V.springs?.reset(),V.springSetup=Po(Ut(H),s),V.springs=Vl(V)),b.visible=F!=="swim"&&!["nozomi","sailor"].includes(F),x.visible=b.visible,E&&(E.visible=F===R,w.visible=E.visible),_&&(_.visible=F==="swim")},dispose(){m.dispose(),v.dispose(),v.map?.dispose(),E&&(E.material.map?.dispose(),E.material.dispose()),I.texture.dispose(),I.head.geometry.dispose(),I.head.material.dispose(),_?.geometry.dispose(),E?.geometry.dispose()}};return V.springs=Vl(V),V.paintFace({}),V}const Oo="johansson-town-resident-wardrobes";function d_(n,e=globalThis.localStorage){try{return ra(JSON.parse(e?.getItem(Oo)||"{}")[n]||"")}catch{return null}}function hv(n,e,t=globalThis.localStorage){const i=Ut({...e,name:n});let s={};try{s=JSON.parse(t?.getItem(Oo)||"{}")||{}}catch{}return s[n]=nh(i),t?.setItem(Oo,JSON.stringify(s)),globalThis.dispatchEvent?.(new Event("johansson-appearance-change")),i}const la=[{name:"Aya",age:24,role:"bookshop assistant",female:!0,height:1.62,work:[4.3,34],evening:[24,18],home:[-25,-47],top:"#967a99",start:540,close:1110,retire:1210,personality:"Playful mischief",friend:"Emi",look:"Black tank, olive shorts, high ponytail",hairStyle:"pony",outfit:"tank",hello:"Window seat is mine. I bookmark the funny parts — apparently that is not how a lending library works.",gossip:"Emi made a tiny apron for Tama. He has declined every fitting.",clue:"A rain-stained book is drying at the harbour office. Yoshiko knows how to save the pages.",model:"resident-00",build:.88,supperStart:1110,supperEnd:1210,house:{x:-22.4,z:-47,angle:-1.5707963267948966},homeAddress:"1 Willow Alley"},{name:"Kenji",age:32,role:"repairman",female:!1,height:1.76,work:[-3.5,17],evening:[4.5,21],home:[-29,-47],top:"#527d99",start:540,close:1080,retire:1260,personality:"Enthusiastic tinkerer",friend:"Tetsuo",look:"Blue hoodie and tousled ink-black hair",hairStyle:"messy",outfit:"work",hello:"I fixed the kettle. It now whistles in a slightly more confident key.",gossip:"Tetsuo says my repairs are too loud. His radio can be heard from the pier.",clue:"The cabinet outside my workshop runs Star Port. Beat my score and I will show you around.",model:"resident-01",build:.965,supperStart:1092,supperEnd:1207,house:{x:-31.6,z:-47,angle:1.5707963267948966},homeAddress:"2 Willow Alley"},{name:"Mrs Sato",age:68,role:"shopkeeper",female:!0,height:1.55,work:[-4.2,-26],evening:[-26,46],home:[-25,-39],top:"#ad6178",start:540,close:1080,retire:1260,personality:"Affectionately formidable",friend:"Fumiko",look:"Berry apron dress, silver bob and round spectacles",hairStyle:"bun",outfit:"apron",hello:"You look hungry. Yes, I say that to everyone. I am usually right.",gossip:"Fumiko claims she only came for tea. I have saved her the largest bowl.",clue:"Thuan names her plants. The assistant manager by her door is very demanding.",model:"resident-02",build:1.05,supperStart:1104,supperEnd:1234,house:{x:-22.4,z:-39,angle:-1.5707963267948966},homeAddress:"3 Willow Alley"},{name:"Harbour master",age:58,role:"harbour master",female:!1,height:1.74,work:[1.6,-70],evening:[4.2,-48],home:[-29,-39],top:"#405d7e",start:300,close:840,retire:1260,personality:"Dry wit, soft heart",friend:"Mr Fujita",look:"Navy vest, silver hair and round spectacles",hairStyle:"part",outfit:"jacket",hello:"I can predict rain by my knees. The radio insists on taking all the credit.",gossip:"Fujita caught a fish this big. The distance between his hands increases every evening.",clue:"There is a blue-taped folio in the harbour office tray. Take a proper look; it has travelled.",model:"resident-03",build:1.135,supperStart:1020,supperEnd:1120,house:{x:-31.6,z:-39,angle:1.5707963267948966},homeAddress:"4 Willow Alley"},{name:"Bus driver",age:49,role:"bus driver",female:!1,height:1.73,work:[-4.5,44],evening:[-26,46],home:[-25,-32],top:"#498d8b",start:540,close:1080,retire:1260,personality:"Patient storyteller",friend:"Naoko",look:"Navy vest and neat dark hair",hairStyle:"part",outfit:"vest",hello:"I collect passengers and opening sentences. The best stories start at the last stop.",gossip:"Naoko can deliver a letter before I finish reading the address.",clue:"Read the timetable by the stop before you wander down to the water.",model:"resident-04",build:.88,supperStart:1092,supperEnd:1207,house:{x:-22.4,z:-32,angle:-1.5707963267948966},homeAddress:"5 Willow Alley"},{name:"Cold-storage kid",age:19,role:"ice store assistant",female:!1,height:1.69,work:[-8,-55],evening:[-8,-55],home:[-29,-32],top:"#6eaa9b",start:540,close:1080,retire:1260,personality:"Shy, unexpectedly funny",friend:"Kenta",look:"Pale-blue hoodie and chestnut hair",hairStyle:"fringe",outfit:"work",hello:"I work with ice. Breaking it socially is the difficult part.",gossip:"Kenta practises his introduction to Emi in front of the freezer. I try not to applaud.",clue:"Buy ice before you go fishing. The fish appreciate the planning, briefly.",model:"resident-05",build:.965,supperStart:null,supperEnd:130,house:{x:-31.6,z:-32,angle:1.5707963267948966},homeAddress:"6 Willow Alley"},{name:"Officer Mori",age:45,role:"policeman",female:!1,height:1.78,work:[0,49],evening:[-26,46],home:[-25,-25],top:"#4b6e9c",start:1320,close:1800,retire:1800,personality:"Earnest and easily teased",friend:"Reiko",look:"Blue vest and softly greying hair",hairStyle:"crop",outfit:"jacket",hello:"No suspicious activity today. Except someone teaching the cat to ignore me.",gossip:"Reiko asked for a statement. I gave her three pages. She printed the bit about my lunch.",clue:"The river path circles back to the harbour. Keep an eye out for the heron.",model:"resident-06",build:1.05,supperStart:null,supperEnd:null,house:{x:-22.4,z:-25,angle:-1.5707963267948966},homeAddress:"7 Willow Alley"},{name:"Hana",age:17,role:"school pupil",female:!0,height:1.57,work:[43,36],evening:[36,30],home:[-29,-25],top:"#d17b78",start:540,close:1080,retire:1260,personality:"Bold little artist",friend:"Daichi",look:"Coral apron dress and chestnut bob",hairStyle:"bob",outfit:"cardigan",hello:"I sketch everyone while they wait for the bus. Sitting still is their contribution.",gossip:"Daichi says he cannot pose. He has three different heroic expressions prepared.",clue:"The hillside shrine has the best view for drawing roofs.",model:"resident-07",build:1.135,supperStart:null,supperEnd:115,house:{x:-31.6,z:-25,angle:1.5707963267948966},homeAddress:"8 Willow Alley"},{name:"Daichi",age:17,role:"school pupil",female:!1,height:1.7,work:[45,36],evening:[28,50],home:[-25,-20],top:"#cda04f",start:540,close:1080,retire:1260,personality:"Big dreams, gentle nature",friend:"Hana",look:"Ochre hoodie and warm brown hair",hairStyle:"messy",outfit:"sweater",hello:"One day I will pitch a perfect game. Today I am working on finding the ball.",gossip:"Hana drew me as a famous player. She made the ball enormous so I could hit it.",clue:"Hana likes the shrine view. I carry the pencils. It is a specialist position.",model:"resident-08",build:.88,supperStart:null,supperEnd:130,house:{x:-22.4,z:-20,angle:-1.5707963267948966},homeAddress:"9 Willow Alley"},{name:"Mr Fujita",age:73,role:"retired fisherman",female:!1,height:1.64,work:[-38,-60],evening:[-34,39],home:[-29,-20],top:"#73988a",start:540,close:1080,retire:1260,personality:"Cheerful embellisher",friend:"Harbour master",look:"Sea-green vest, white hair and round spectacles",hairStyle:"receding",outfit:"sweater",hello:"The fish was enormous. Ask me tomorrow; I expect it will have grown.",gossip:"The harbour master has heard this story before. He still asks how it ends.",clue:"The outer pier has a bait station. The gulls regard it as their property.",model:"resident-09",build:.965,supperStart:1080,supperEnd:1180,house:{x:-31.6,z:-20,angle:1.5707963267948966},homeAddress:"10 Willow Alley"},{name:"Masaru",age:51,role:"fisherman",female:!1,height:1.72,work:[-38,-74],evening:[24,18],home:[-25,-12],top:"#bd7959",start:540,close:1080,retire:1560,personality:"Boisterous cook-at-heart",friend:"Nao",look:"Rust hoodie and brown hair",hairStyle:"curly",outfit:"work",hello:"A good catch is a good supper. A poor catch is a very long story.",gossip:"Nao lets me suggest specials. She very sensibly ignores most of them.",clue:"Try the grilled skewers at Minato. The last one is always the best one.",model:"resident-10",build:1.05,supperStart:1380,supperEnd:1560,house:{x:-22.4,z:-12,angle:-1.5707963267948966},homeAddress:"11 Willow Alley"},{name:"Yoshiko",age:61,role:"bathhouse keeper",female:!0,height:1.58,work:[-34,39],evening:[-34,39],home:[-29,-12],top:"#9ea66c",start:540,close:1260,retire:1260,personality:"Calm neighbourhood anchor",friend:"Mrs Sato",look:"Sage apron dress and silver bob",hairStyle:"bun",outfit:"apron",hello:"A hot bath, a clean towel, a little patience. Most days need all three.",gossip:"Sato pretends she does not gossip. She just asks exceptionally well-informed questions.",clue:"Bring the waterlogged book to my warm drying rack. Slowly, away from the stove.",model:"resident-11",build:1.135,supperStart:1284,supperEnd:1380,house:{x:-31.6,z:-12,angle:1.5707963267948966},homeAddress:"12 Willow Alley"},{name:"Reiko",age:36,role:"newspaper editor",female:!0,height:1.62,work:[-4,-2],evening:[-4,-2],home:[-25,-5],top:"#a96883",start:540,close:1080,retire:1260,personality:"Curious, loves a scoop",friend:"Officer Mori",look:"Burgundy vest, long dark hair and round spectacles",hairStyle:"bob",outfit:"jacket",hello:"Nothing is off the record until I put my pencil away. There. What did you hear?",gossip:"Mori writes beautiful incident reports. Unfortunately nothing ever happens.",clue:"I left a stack of evening papers outside the press. The corrections are on page two.",model:"resident-12",build:.88,supperStart:1080,supperEnd:1180,house:{x:-22.4,z:-5,angle:-1.5707963267948966},homeAddress:"13 Willow Alley"},{name:"Tetsuo",age:40,role:"radio repairer",female:!1,height:1.7,work:[4,-13],evening:[24,18],home:[-29,-5],top:"#807398",start:540,close:1080,retire:1605,personality:"Deadpan music lover",friend:"Kenji",look:"Aubergine vest, dark hair and round spectacles",hairStyle:"part",outfit:"vest",hello:"Turn it gently. Radios have feelings. Mostly static, but feelings.",gossip:"Kenji has repaired my radio twice. I keep finding extra screws.",clue:"There are three radio stations. Each claims it has the most reliable weather.",model:"resident-13",build:.965,supperStart:1440,supperEnd:1605,house:{x:-31.6,z:-5,angle:1.5707963267948966},homeAddress:"14 Willow Alley"},{name:"Emi",age:29,role:"seamstress",female:!0,height:1.61,work:[38,34],evening:[28,50],home:[-25,2],top:"#d797a2",start:540,close:1080,retire:1260,personality:"Warm, quietly daring",friend:"Aya",look:"Rose dress and chestnut ponytail",hairStyle:"pony",outfit:"blouse",hello:"I keep little fabric scraps. They are not clutter; they are future possibilities.",gossip:"Aya lends me adventure novels. I repay her in pockets deep enough to hide one.",clue:"Thuan has postcards by the biscuits. Ask her which gull looks most important.",model:"resident-14",build:1.05,supperStart:1104,supperEnd:1234,house:{x:-22.4,z:2,angle:-1.5707963267948966},homeAddress:"15 Willow Alley"},{name:"Mr Tanabe",age:66,role:"shrine caretaker",female:!1,height:1.66,work:[20,50],evening:[20,56],home:[-29,2],top:"#bbaa85",start:540,close:1080,retire:1260,personality:"Playful philosopher",friend:"Mr Fujita",look:"Cream vest, silver hair and round spectacles",hairStyle:"receding",outfit:"sweater",hello:"The shrine bell sounds different every day. Or perhaps I am getting better at listening.",gossip:"Fujita says his fish was a sign of good fortune. It was certainly a sign of good appetite.",clue:"Leave an intention at the shrine. Then do one small thing about it.",model:"resident-15",build:1.135,supperStart:1080,supperEnd:1180,house:{x:-31.6,z:2,angle:1.5707963267948966},homeAddress:"16 Willow Alley"},{name:"Naoko",age:33,role:"postal worker",female:!0,height:1.65,work:[4,11],evening:[-26,46],home:[-25,12],top:"#c77465",start:540,close:1080,retire:1260,personality:"Brisk, remembers everyone",friend:"Bus driver",look:"Post-red dress and dark ponytail",hairStyle:"pony",outfit:"jacket",hello:"I know every door in this town. Some of them are more polite than their owners.",gossip:"The bus driver saves stories for me. I deliver the endings to everyone else.",clue:"The postbox collection plate tells you when the next bag leaves.",model:"resident-16",build:.88,supperStart:1092,supperEnd:1207,house:{x:-22.4,z:12,angle:-1.5707963267948966},homeAddress:"17 Willow Alley"},{name:"Hiroshi",age:54,role:"grocer",female:!1,height:1.68,work:[-4,-28],evening:[24,18],home:[-29,12],top:"#7c9959",start:540,close:1080,retire:1260,personality:"Proud amateur singer",friend:"Yoshiko",look:"Moss hoodie and salt-and-pepper hair",hairStyle:"curly",outfit:"apron",hello:"I sing to the vegetables. The aubergines are a difficult audience.",gossip:"Yoshiko says I may sing at the bathhouse if I agree to sing quietly. Negotiations continue.",clue:"Sakura has cold tea. A cup after walking the harbour is an excellent idea.",model:"resident-17",build:.965,supperStart:1104,supperEnd:1234,house:{x:-31.6,z:12,angle:1.5707963267948966},homeAddress:"18 Willow Alley"},{name:"Fumiko",age:77,role:"neighbour",female:!0,height:1.49,work:[-29,50],evening:[-34,39],home:[-25,19],top:"#aa90b4",start:540,close:1080,retire:1260,personality:"Fearless neighbourhood aunt",friend:"Mrs Sato",look:"Lavender apron dress, white bob and round spectacles",hairStyle:"bob",outfit:"cardigan",hello:"At my age you can say almost anything. I am making up for lost time.",gossip:"Sato and I never gossip. We maintain the oral history of the neighbourhood.",clue:"There is a quiet bench by the shops. Sit long enough and the town comes to you.",model:"resident-18",build:1.05,supperStart:1080,supperEnd:1180,house:{x:-22.4,z:19,angle:-1.5707963267948966},homeAddress:"19 Willow Alley"},{name:"Kenta",age:21,role:"apprentice engineer",female:!1,height:1.8,work:[-4.5,17],evening:[24,18],home:[-29,19],top:"#77a5b7",start:540,close:1080,retire:1260,personality:"Sweetly awkward inventor",friend:"Cold-storage kid",look:"Sky-blue hoodie and chestnut hair",hairStyle:"curly",outfit:"work",hello:"I made a machine to save time. Explaining it takes most of the afternoon.",gossip:"The cold-store lad laughs at my jokes. Slowly, but the room is very cold.",clue:"Kenji has a small prototype on display. Pick it up and turn it over.",model:"resident-19",build:1.135,supperStart:1092,supperEnd:1207,house:{x:-31.6,z:19,angle:1.5707963267948966},homeAddress:"20 Willow Alley"},{name:"Nao",age:34,role:"izakaya owner",female:!0,height:1.65,work:[24,20],evening:[24,20],home:[-25,25],start:960,close:1620,retire:1620,top:"#c87d65",personality:"Generous host, wicked timing",friend:"Masaru",look:"Terracotta apron dress and dark bob",hairStyle:"bun",outfit:"apron",hello:"Come in, come in. The spare chair has been expecting you.",gossip:"Masaru called his catch the special of the day. It was so small I nearly served it as garnish.",clue:"Take a seat, order something warm, and listen. This town tells its best stories over supper.",model:"resident-20",build:.88,supperStart:960,supperEnd:1620,house:{x:-22.4,z:25,angle:-1.5707963267948966},homeAddress:"21 Willow Alley"},{name:"Barfly",age:43,role:"Minato regular",female:!1,height:1.72,work:[24,21],evening:[24,21],home:[24,21],top:"#b74e43",start:0,close:0,retire:1440,personality:"Unhurried, permanently thirsty",friend:"Nao",look:"Broad build, short salt-and-pepper hair, red patterned open-collar shirt and wristwatch",hairStyle:"short",outfit:"hawaiian",hello:"Another one? Nao knows my usual. I am staying right here.",gossip:"I have been at this stool long enough to know when the lanterns need trimming.",clue:"Minato stays open late. The regular at the end of the counter has never once caught the last bus.",model:"barfly",build:1.14,supperStart:null,supperEnd:null,house:{x:24,z:21,angle:0},homeAddress:"Minato Izakaya"}],mh={interests:["read","inspect","seat","shop"],snack:"rice",drink:"tea",meal:"rice"},gh=Object.freeze(Object.fromEntries(Object.entries({Kenji:{source:"casual_2",top:"#477697",trousers:"#334b55",hair:"#24272b",skin:"#bd8b65",width:.96,accessory:"tool-pouch",interests:["arcade","machine","radio","inspect"],snack:"bun",drink:"beer",meal:"yakitori"},"Mrs Sato":{source:"female_formal",top:"#96566d",trousers:"#96566d",hair:"#c5c0ae",skin:"#c69c7c",width:1.06,accessory:"glasses",interests:["read","shop","seat","post"],snack:"tea",drink:"tea",meal:"rice"},"Harbour master":{source:"suit",top:"#455b6b",trousers:"#374653",hair:"#92958d",skin:"#b5805d",width:1.1,accessory:"captain",interests:["office","fish","read","machine","phone"],snack:"rice",drink:"beer",meal:"fish"},Tetsuo:{source:"worker",top:"#698071",trousers:"#4a5146",hair:"#444035",skin:"#ba895d",helmet:"#737768",width:1.03,accessory:"glasses",interests:["radio","machine","arcade","inspect"],snack:"bun",drink:"beer",meal:"yakitori"},"Officer Mori":{source:"suit",top:"#3c5780",trousers:"#303e57",hair:"#202528",skin:"#c79872",width:.98,accessory:"police",interests:["read","phone","post","inspect"],snack:"rice",drink:"tea",meal:"rice"},"Bus driver":{source:"suit",top:"#437f78",trousers:"#3b514e",hair:"#61564b",skin:"#b88968",width:1.04,accessory:"driver",interests:["seat","read","phone","shop"],snack:"tea",drink:"tea",meal:"fish"},Nao:{source:"female_casual",top:"#bd7557",trousers:"#394b58",hair:"#292a30",skin:"#cf9b77",width:.98,accessory:"apron",interests:["shop","post","read","radio"],shopping:"soda",snack:"rice",drink:"tea",meal:"yakitori"},Aya:{source:"female_casual",top:"#424552",trousers:"#74764e",hair:"#24212a",skin:"#d5a17d",width:.91,accessory:"ponytail-satchel",accent:"#ab799e",height:1.62,interests:["read","seat","post","shop"],snack:"tea",drink:"beer",meal:"rice"},Reiko:{source:"female_formal",top:"#a05c75",trousers:"#a05c75",hair:"#44332b",skin:"#d8ae8c",width:.96,accessory:"headband-scarf",accent:"#efe2c3",height:1.62,interests:["read","radio","phone","shop"],snack:"rice",drink:"beer",meal:"fish"},Thuan:{source:"thuan-mh",top:"#d8b23a",trousers:"#27304d",hair:"#1c1612",skin:"#e6c3a8",width:1.02,accessory:"ribbon",interests:["shop","seat","read","post"],snack:"tea",drink:"tea",meal:"rice",height:1.64},"Cold-storage kid":{source:"worker",top:"#87a5b2",trousers:"#495e71",hair:"#664634",skin:"#d4a982",helmet:"#658499",width:.9,accessory:"scarf",accent:"#ddd6ba"},Hana:{source:"female_formal",top:"#c58176",trousers:"#c58176",hair:"#76503e",skin:"#dcb594",width:.92,accessory:"headband",accent:"#eee0ae"},Daichi:{source:"casual_2",top:"#bba153",trousers:"#5d614c",hair:"#634f34",skin:"#cea276",width:.93,accessory:"satchel",accent:"#655337"},"Mr Fujita":{source:"suit",top:"#648a80",trousers:"#455d5c",hair:"#d2ccba",skin:"#b08461",width:1.08,accessory:"glasses"},Masaru:{source:"worker",top:"#a56545",trousers:"#485970",hair:"#514335",skin:"#ac7655",helmet:"#ad9264",width:1.15,accessory:"scarf",accent:"#caba8a"},Yoshiko:{source:"female_formal",top:"#859263",trousers:"#859263",hair:"#b3ada0",skin:"#c59b79",width:1.04,accessory:"bun-apron"},Emi:{source:"female_casual",top:"#c08d97",trousers:"#68657b",hair:"#775746",skin:"#d3a884",width:.95,accessory:"ponytail-satchel",accent:"#ded0ab"},"Mr Tanabe":{source:"suit",top:"#b9aa85",trousers:"#797565",hair:"#aaa998",skin:"#bd936e",width:1.02,accessory:"glasses"},Naoko:{source:"female_casual",top:"#b45a51",trousers:"#484753",hair:"#302f32",skin:"#c89977",width:.98,accessory:"headband-satchel",accent:"#7b5746"},Hiroshi:{source:"casual_2",top:"#778a53",trousers:"#535345",hair:"#79776a",skin:"#bb9269",width:1.12,accessory:"apron"},Fumiko:{source:"female_formal",top:"#9c7fac",trousers:"#9c7fac",hair:"#d6d2c8",skin:"#c69f82",width:1.08,accessory:"glasses"},Kenta:{source:"casual_2",top:"#78a7b8",trousers:"#546679",hair:"#825f44",skin:"#d4ac85",width:.96,accessory:"tool-pouch"},Yui:{source:"female_casual",top:"#66969a",trousers:"#45465e",hair:"#332d31",skin:"#d0a586",width:1.01,accessory:"headband",accent:"#e8cf85"},Barfly:{source:"casual_2",top:"#b74e43",trousers:"#36343a",hair:"#77766f",skin:"#b9825f",width:1.14,accessory:"hawaiian",interests:["seat","drink","radio"],snack:"yakitori",drink:"beer",meal:"yakitori",height:1.72}}).map(([n,e])=>[n,Object.freeze({...mh,...e})]))),f_=Object.freeze({Aiko:"Aya",Nozomi:"Reiko"}),p_=n=>gh[f_[n]||n]||mh;function uv(n){const e={};if(!n||typeof n!="object")return e;for(const t of Object.keys(gh)){const i=n[t];if(!i||!Number.isSafeInteger(i.day)||!Number.isFinite(i.yen))continue;const s={day:i.day,yen:Math.max(0,Math.min(2400,i.yen)),purchases:[],activities:[],meals:{}};Array.isArray(i.purchases)&&(s.purchases=i.purchases.filter(o=>o&&typeof o.id=="string"&&typeof o.item=="string"&&Number.isFinite(o.cost)&&o.cost>=0).slice(-24).map(o=>({id:o.id.slice(0,160),item:o.item.slice(0,160),cost:o.cost}))),Array.isArray(i.activities)&&(s.activities=i.activities.filter(o=>typeof o=="string").slice(-8).map(o=>o.slice(0,180)));for(const o of["market","izakaya","ramen"]){const a=i.meals?.[o];!a||!["bun","rice","tea","ramen","fish","yakitori"].includes(a.item)||(s.meals[o]={stockClaim:a.stockClaim&&["bun","rice","tea"].includes(a.stockClaim.item)&&Number.isSafeInteger(a.stockClaim.unitCost)?{item:a.stockClaim.item,unitCost:a.stockClaim.unitCost}:null,item:a.item,drink:a.drink==="beer"?"beer":"tea",delivered:a.delivered===!0,finished:a.finished===!0,started:Number.isFinite(a.started)?a.started:null,waited:Number.isFinite(a.waited)?Math.max(0,Math.min(45,a.waited)):0,eaten:Number.isFinite(a.eaten)?Math.max(0,Math.min(42,a.eaten)):0})}const r=i.shopping;r&&["browse","pickup","queue","paid","finished"].includes(r.phase)&&Number.isFinite(r.started)&&(["tea","coffee","rice","biscuit","soap","notebook","postcard","battery","cola","water","beer","noodles","milk","bun"].includes(r.item)||r.phase==="browse"&&!r.picked)&&(s.shopping={phase:r.phase,started:r.started,finished:r.finished===!0,item:["tea","coffee","rice","biscuit","soap","notebook","postcard","battery","cola","water","beer","noodles","milk","bun"].includes(r.item)?r.item:null,picked:r.picked===!0,paid:r.paid===!0,timer:Number.isFinite(r.timer)?Math.max(0,Math.min(3,r.timer)):0,position:Array.isArray(r.position)&&r.position.length===3&&r.position.every(o=>Number.isFinite(o)&&Math.abs(o)<7)?r.position:[0,0,5.2]}),e[t]=s}return e}function dv(n=()=>null){const e={};function t(i,s){const r=n()||e,o=Math.floor(s/1440);r.residentLife??={};let a=r.residentLife[i];return(!a||a.day!==o)&&(a=r.residentLife[i]={day:o,yen:2400,purchases:[],activities:[]}),a}return{account:t,purchase(i,s,r,o,a){const l=t(i,s);return l.purchases.some(c=>c.id===r)?!0:!Number.isFinite(a)||a<0||l.yen<a?!1:(a===0||(l.yen-=a,l.purchases.push({id:r,item:o,cost:a}),l.purchases=l.purchases.slice(-24)),!0)},record(i,s,r){const o=t(i,s);o.activities.push(r),o.activities=o.activities.slice(-8)}}}const fv=Object.freeze([Object.freeze({key:"pace",label:"Pace",low:"Unhurried",high:"Brisk"}),Object.freeze({key:"talk",label:"Talk",low:"Careful",high:"Frank"}),Object.freeze({key:"show",label:"Feelings",low:"Calm",high:"Lively"}),Object.freeze({key:"outlook",label:"Outlook",low:"Serious",high:"Easygoing"})]),Fn=8,nc=[["Notices what others miss and follows through.","Checking the quay lamps before a storm."],["Makes room for people who need to be heard.","Sharing tea on a shaded porch."],["Keeps memories vivid and welcomes a good listener.","Retelling a fishing adventure after supper."],["Finds possibilities in an ordinary afternoon.","Sketching clouds from the garden bridge."],["Brings care and patience to difficult work.","Finishing a small repair at the dock workshop."],["Offers practical help without making a fuss.","Lending a ladder across the garden fence."],["Makes it easy for friends to share their feelings.","Cheering loudest at the island school match."],["Turns a detour into a new experience.","Following the coastal path past the cape."],["Keeps a busy day manageable for everyone.","Organising the morning harbour deliveries."],["Brings useful energy to a neighbour’s problem.","Carrying shopping home for someone else."],["Helps a good idea find an audience.","Rehearsing for the Community Hall concert."],["Draws newcomers into the fun.","Saving a seat at the festival table."],["Makes decisions when everyone else hesitates.","Sorting out a delayed cargo delivery."],["Finds the humour that eases a tense moment.","Making the shop queue laugh on a rainy day."],["Stands up for friends with wholehearted feeling.","Arguing a point, then buying everyone supper."],["Starts adventures and takes friends along.","Planning three outings before the ferry docks."]],m_=Object.freeze([["Lighthouse keeper","Steady and watchful. Keeps a promise to the letter.","#3d6a8a"],["Porch sitter","In no hurry at all. Always has time to listen.","#8a5a2e"],["Old storyteller","Slow to start, but tells it with all their heart.","#8a4ab8"],["Cloud watcher","Drifts happily along with a head full of ideas.","#7fb0d8"],["Quiet craftsman","Few words, all of them meant. Does things properly.","#6d7478"],["Easy neighbour","Plain-spoken and relaxed. Will lend you a ladder.","#8fbf4a"],["Big heart","Laughs loudest, cries at films, says how they feel.","#e98aa6"],["Wanderer","Says what they like and goes where the day takes them.","#2a8a5a"],["Timekeeper","Quick, polite and composed. Has a list for everything.","#2f5f9e"],["Helping hand","First to help, and pleasant about it.","#3fa0c8"],["Rising star","Polished, quick and fond of an audience.","#f4d23c"],["Festival friend","Everywhere at once and friends with all of it.","#e8742a"],["Straight shooter","Fast and blunt. Gets it done.","#27304d"],["Joker","Quick, frank, and always up to something.","#d8342c"],["Firecracker","Quick to flare up, quick to laugh. Big energy.","#c8402e"],["Typhoon","Never still, says everything, enjoys every minute.","#45b7f0"]].map(([n,e,t],i)=>Object.freeze({name:n,line:e,colour:t,strength:nc[i][0],islandMoment:nc[i][1]}))),ss=n=>Math.min(1,Math.max(0,Number.isFinite(+n)?+n:.5)),Li=n=>Math.min(Fn,1+Math.floor(ss(n)*Fn*.9999)),pv=n=>(Math.min(Fn,Math.max(1,n))-.5)/Fn;function _h(n={}){const e=t=>Li(n[t])>Fn/2?1:0;return m_[e("pace")*8+e("talk")*4+e("show")*2+e("outlook")]}const ic=[261.6,329.6,349.2,392,493.9,523.3,659.3,698.5,784,987.8,1046.5];function mv(n={}){const e=ss(n.pitch),t=ss(n.speed);return{freq:ic[Math.round(e*(ic.length-1))],type:ss(n.talk)>.62?"triangle":"sine",letterMs:Math.round(34-t*20),swing:ss(n.show)>.5?1.0595:1}}const g_=Object.freeze(["January","February","March","April","May","June","July","August","September","October","November","December"]),__=[31,29,31,30,31,30,31,31,30,31,30,31],y_=n=>__[Math.min(11,Math.max(0,n-1))],v_=n=>`${b_(n.month,n.day)} ${g_[(n.month||1)-1]}`;function b_(n,e){return Math.min(y_(n||1),Math.max(1,e|0||1))}function gv(n){const e=n.name||"your new islander",t=n.profile||{},i=_h(t),s=t.catchphrase?` ${t.catchphrase}`:"",r=Li(t.talk)>4?`Hey! I'm ${e}.`:`Hello. My name is ${e}.`,o=Li(t.show)>4?" I am so happy to be here!":" Nice to meet you.";return`${r}${o}${s}

${i.name} · born ${v_(t)}`}const M_=Object.freeze(Object.fromEntries(Object.entries({Johansson:[.3,.7,.7,.8],Thuan:[.7,.35,.75,.75],"Mrs Higa":[.25,.3,.3,.3],Aya:[.6,.65,.4,.75],Kenji:[.7,.4,.75,.7],"Mrs Sato":[.4,.75,.7,.3],"Harbour master":[.3,.7,.3,.65],"Bus driver":[.25,.35,.7,.3],"Cold-storage kid":[.4,.25,.35,.7],"Officer Mori":[.7,.3,.4,.6],Hana:[.7,.75,.75,.4],Daichi:[.3,.3,.7,.7],"Mr Fujita":[.35,.75,.75,.75],Masaru:[.75,.8,.8,.7],Yoshiko:[.25,.4,.25,.6],Reiko:[.75,.7,.65,.6],Tetsuo:[.3,.65,.2,.35],Emi:[.6,.35,.45,.65],"Mr Tanabe":[.25,.3,.65,.75],Naoko:[.8,.35,.35,.35],Hiroshi:[.65,.4,.8,.3],Fumiko:[.7,.85,.4,.3],Kenta:[.4,.25,.6,.65],Nao:[.7,.75,.6,.8],Barfly:[.15,.65,.35,.8]}).map(([n,[e,t,i,s]])=>[n,Object.freeze({pace:e,talk:t,show:i,outlook:s})]))),yh=["pace","talk","show","outlook"],x_=n=>!n||yh.every(e=>n[e]===void 0||n[e]===.5);function Bo(n,e=n?.name){if(!n||!x_(n.profile))return n;let t=M_[e];if(!t&&e){let i=2166136261;for(const s of String(e))i=Math.imul(i^s.charCodeAt(0),16777619)>>>0;t=Object.fromEntries(yh.map((s,r)=>[s,(i>>>r*7&127)/127*.8+.1]))}return t?{...n,profile:{...n.profile||{},...t}}:n}const st=n=>Ut(Bo(n)),S_=new Set(["Thuan","Mrs Higa","Mina","Grandmother Higa","Mrs Nakamura","Mrs Yonamine","Mrs Miyagi","Mrs Kamiya","Mrs Kinjō"]),vh=n=>Object.freeze(Object.fromEntries(Object.entries(n).map(([e,t])=>{const i=la.find(s=>s.name===e)?.female??S_.has(e);return[e,Ut({...t,body:{...t.body,silhouette:t.body.silhouette==="neutral"?i?"feminine":"masculine":t.body.silhouette}})]}))),zo=vh({Johansson:st({name:"Johansson",body:{height:.72,build:.72,silhouette:"masculine",skin:"#dc9d7a"},head:{size:.48,shape:.45,form:"square",jaw:.75,cheeks:.55},hair:{style:"horseshoe",colour:"#b8b4aa"},eyes:{style:"gentle",colour:"#3d6a8a",size:.45,spacing:.52,height:.5,tilt:.45},brows:{style:"bushy",colour:"#a8a49a",size:.6,height:.55,tilt:.45},nose:{style:"wide",size:.6,height:.48},mouth:{style:"smile",colour:"#a8433e",size:.55,height:.5},facial:{style:"stubble",colour:"#b8b4aa"},wrinkles:.7,blush:.35,outfit:{top:"kariyushi",topColour:"#7fb0d8",pattern:"flowers",bottom:"shorts",bottomColour:"#c8b48a",footwear:"sandals",shoes:"#6d4a32",accent:"#f4f1ea"},swim:{colour:"#2f5f9e"}}),Thuan:st({name:"Thuan",accessories:{earrings:"studs",neckwear:"pendant",colour:"#e0b93a"},body:{height:.36,build:.35,silhouette:"feminine",skin:"#f1cfae"},head:{size:.48,shape:.48,form:"heart",jaw:.3,cheeks:.62},hair:{style:"braids",colour:"#1c1714",flip:!1},eyes:{style:"lashes",colour:"#2a1d16",size:.78,spacing:.5,height:.48,tilt:.55},brows:{style:"arched",colour:"#2a1d16",size:.42,height:.55,tilt:.5},nose:{style:"dot",size:.35,height:.5},mouth:{style:"smile",colour:"#cc3d52",size:.42,height:.5},glasses:{style:"round",colour:"#e06a7a"},blush:.65,outfit:{top:"blouse",topColour:"#f4d23c",pattern:"flowers",bottom:"trousers",bottomColour:"#27304d",shoes:"#f4f1ea",accent:"#f4d23c"},swim:{colour:"#e98aa6"}}),Nao:st({name:"Nao",body:{height:.42,build:.45,skin:"#e8bf98"},head:{size:.46,shape:.4,form:"oval",jaw:.35,cheeks:.45},hair:{style:"ponytail",colour:"#292a30"},eyes:{style:"almond",colour:"#2a1d16",size:.55,spacing:.5,height:.5,tilt:.6},brows:{style:"straight",colour:"#292a30",size:.5},nose:{style:"button",size:.4},mouth:{style:"grin",colour:"#b8544a",size:.5},blush:.3,outfit:{top:"apron",topColour:"#bd7557",bottom:"trousers",bottomColour:"#394b58",shoes:"#2b2b2b",hat:"kerchief",hatColour:"#27304d",accent:"#f4f1ea"}}),Aya:st({name:"Aya",accessories:{earrings:"hoops",pin:!0,colour:"#c8a060"},body:{height:.34,build:.38,skin:"#efc9a4"},head:{size:.5,shape:.52,form:"round",jaw:.35,cheeks:.6},hair:{style:"bob",colour:"#2e211b"},eyes:{style:"round",colour:"#3a2a1e",size:.6,spacing:.5,height:.5,tilt:.5},brows:{style:"arched",colour:"#2e211b",size:.45},nose:{style:"button",size:.35},mouth:{style:"small",colour:"#c4485a",size:.45},glasses:{style:"round",colour:"#7a4a2a"},blush:.45,outfit:{hat:"beret",hatColour:"#5f8f6a",top:"jacket",topColour:"#5f8f6a",pattern:"dots",bottom:"longskirt",bottomColour:"#e6d3b0",shoes:"#6b4a2e",accent:"#f4e4c8"}}),Reiko:st({name:"Reiko",accessories:{neckwear:"scarf",colour:"#d8342c"},body:{height:.46,build:.42,skin:"#e8bf98"},head:{size:.47,shape:.44,form:"oval",jaw:.4,cheeks:.4},hair:{style:"ponytail",colour:"#1c1714"},eyes:{style:"almond",colour:"#2a1d16",size:.5,tilt:.6},brows:{style:"straight",colour:"#1c1714",size:.5},nose:{style:"line",size:.4},mouth:{style:"smirk",colour:"#a8433e",size:.45},outfit:{top:"smock",topColour:"#3f5f7a",bottom:"trousers",bottomColour:"#2b2b33",shoes:"#2b2b2b",accent:"#f4f1ea"}}),Kenji:st({name:"Kenji",body:{height:.6,build:.55,skin:"#c98d62"},head:{size:.48,shape:.5,form:"square",jaw:.6,cheeks:.45},hair:{style:"spiky",colour:"#2b1d14"},eyes:{style:"sparkle",colour:"#2a1d16",size:.55},brows:{style:"thick",colour:"#2b1d14",size:.55},nose:{style:"wide",size:.5},mouth:{style:"grin",size:.55},facial:{style:"stubble",colour:"#2b1d14"},outfit:{top:"kariyushi",topColour:"#f2a93b",pattern:"flowers",bottom:"shorts",bottomColour:"#3f5f7a",shoes:"#f4f1ea",accent:"#f4f1ea"}}),Tetsuo:st({name:"Tetsuo",accessories:{pin:!0,colour:"#e0b93a"},body:{height:.44,build:.5,skin:"#dca97e"},head:{size:.5,shape:.5,form:"narrow",jaw:.55,cheeks:.35},hair:{style:"horseshoe",colour:"#8a8680"},eyes:{style:"sleepy",colour:"#2a1d16",size:.45},brows:{style:"bushy",colour:"#8a8680",size:.6},nose:{style:"hook",size:.55},mouth:{style:"flat",size:.5},glasses:{style:"half",colour:"#2b2b2b"},wrinkles:.6,outfit:{top:"jacket",topColour:"#6b6f4a",bottom:"trousers",bottomColour:"#4a4238",shoes:"#3a2a1e",accent:"#e8d7b0"}}),"Mrs Sato":st({name:"Mrs Sato",body:{height:.22,build:.6,skin:"#e2b48c"},head:{size:.5,shape:.56,form:"round",jaw:.4,cheeks:.6},hair:{style:"bun",colour:"#c9c6c0"},eyes:{style:"gentle",colour:"#2a1d16",size:.45},brows:{style:"arched",colour:"#b9b6b0",size:.5},nose:{style:"button",size:.45},mouth:{style:"smile",colour:"#b8544a",size:.5},glasses:{style:"round",colour:"#6b4a2e"},wrinkles:.7,blush:.3,outfit:{top:"apron",topColour:"#ad6178",bottom:"trousers",bottomColour:"#4a4040",shoes:"#2b2b2b",hat:"kerchief",hatColour:"#f4f1ea",accent:"#f4f1ea"}}),"Mrs Higa":st({name:"Mrs Higa",body:{height:.24,build:.58,skin:"#c99a74"},head:{size:.5,shape:.55,form:"round",jaw:.35,cheeks:.6},hair:{style:"perm",colour:"#9a968e"},eyes:{style:"sleepy",colour:"#2a1d16",size:.42},brows:{style:"thin",colour:"#8a8680",size:.45},nose:{style:"button",size:.45},mouth:{style:"small",colour:"#a8433e",size:.45},glasses:{style:"half",colour:"#6b4a2e"},wrinkles:.75,blush:.25,outfit:{top:"blouse",topColour:"#6d8a74",bottom:"skirt",bottomColour:"#3a3a42",shoes:"#2b2b2b",accent:"#f4f1ea"}}),"Harbour master":st({name:"Harbour master",body:{height:.52,build:.68,skin:"#b5805d"},head:{size:.52,shape:.55,form:"round",jaw:.6,cheeks:.5},hair:{style:"horseshoe",colour:"#b9b7b0"},eyes:{style:"gentle",colour:"#2a1d16",size:.45},brows:{style:"bushy",colour:"#cfcdc6",size:.6},nose:{style:"wide",size:.55},mouth:{style:"flat",size:.5},glasses:{style:"round",colour:"#2b2b2b"},facial:{style:"walrus",colour:"#dedbd3"},wrinkles:.55,outfit:{top:"jacket",topColour:"#2c3e5c",bottom:"trousers",bottomColour:"#27304d",shoes:"#1c1c24",hat:"captain",hatColour:"#f4f1ea",accent:"#e0b93a"}}),"Officer Mori":st({name:"Officer Mori",body:{height:.7,build:.48,skin:"#c79872"},head:{size:.48,shape:.46,form:"oval",jaw:.5,cheeks:.4},hair:{style:"crop",colour:"#4a4845"},eyes:{style:"round",colour:"#2a1d16",size:.62},brows:{style:"worried",colour:"#3a3835",size:.55},nose:{style:"button",size:.45},mouth:{style:"smile",size:.45},blush:.2,wrinkles:.2,outfit:{top:"police",topColour:"#273858",bottom:"trousers",bottomColour:"#27304d",shoes:"#1c1c24",hat:"police",hatColour:"#27304d",accent:"#e0b93a"}})}),sc=vh({Riku:st({body:{silhouette:"masculine",height:.56,build:.55,skin:"#c89a74"},hair:{style:"crop",colour:"#33271f"},eyes:{style:"round"},brows:{style:"thick"},mouth:{style:"smile"},outfit:{top:"polo",topColour:"#587d83",bottom:"trousers",bottomColour:"#505f65",hat:"helmet",hatColour:"#dabb55"}}),"Emi Kado":st({body:{silhouette:"feminine",height:.43,build:.42,skin:"#d1a079"},hair:{style:"ponytail",colour:"#3c2c24"},eyes:{style:"almond"},mouth:{style:"smile"},outfit:{top:"polo",topColour:"#a77e67",bottom:"trousers",bottomColour:"#465d69",hat:"cap",hatColour:"#465d69"}}),Haru:st({head:{form:"square",jaw:.72,cheeks:.4},body:{height:.63,build:.58,skin:"#bf875f"},hair:{style:"crop",colour:"#302419"},eyes:{style:"narrow"},brows:{style:"thick"},nose:{style:"wide"},mouth:{style:"smile"},facial:{style:"stubble",colour:"#302419"},outfit:{top:"polo",topColour:"#607c84",bottom:"shorts",bottomColour:"#7b7155",hat:"cap",hatColour:"#c4b486"}}),Mina:st({head:{form:"oval",jaw:.35,cheeks:.6},body:{height:.4,build:.45,skin:"#d8ac87"},hair:{style:"bun",colour:"#3b2920"},eyes:{style:"gentle",size:.48},brows:{style:"arched"},nose:{style:"button"},mouth:{style:"smile"},outfit:{top:"apron",topColour:"#849267",bottom:"longskirt",bottomColour:"#5c6e75"}}),Jun:st({head:{form:"narrow",jaw:.4,cheeks:.3},body:{height:.53,build:.4,skin:"#dbb393"},hair:{style:"sidepart",colour:"#29241e"},eyes:{style:"almond"},brows:{style:"straight"},nose:{style:"line"},mouth:{style:"small"},glasses:{style:"half",colour:"#5b5c52"},outfit:{top:"polo",topColour:"#e0dac7",bottom:"trousers",bottomColour:"#3e596d"}}),"Grandmother Higa":st({head:{size:.48,shape:.5,form:"round",jaw:.7,cheeks:.85},body:{height:.2,build:.6,skin:"#dca97e"},hair:{style:"perm",colour:"#d8d6d0"},eyes:{style:"gentle",size:.4},brows:{style:"thin",colour:"#9a9a96"},nose:{style:"button",size:.55},mouth:{style:"smile",size:.45},glasses:{style:"half",colour:"#8a4a3a"},wrinkles:1,blush:.4,outfit:{top:"blouse",topColour:"#8a4ab8",pattern:"flowers",bottom:"longskirt",bottomColour:"#6d7478",shoes:"#2b2b2b"}}),"Mr Ōshiro":st({head:{size:.48,shape:.5,form:"narrow",jaw:.45,cheeks:.3},body:{height:.4,build:.4,skin:"#b27449"},hair:{style:"buzz",colour:"#d8d6d0"},eyes:{style:"narrow"},brows:{style:"bushy",colour:"#d8d6d0"},nose:{style:"hook",size:.6},mouth:{style:"flat"},facial:{style:"stubble",colour:"#d8d6d0"},wrinkles:.9,outfit:{top:"tee",topColour:"#f4f1ea",bottom:"trousers",bottomColour:"#6d7478",shoes:"#2b2b2b",hat:"straw",hatColour:"#e0c078"}}),"Uncle Kinjō":st({head:{size:.48,shape:.5,form:"square",jaw:.8,cheeks:.65},body:{height:.55,build:.75,skin:"#c98d62"},hair:{style:"crop",colour:"#5a3a22"},eyes:{style:"dot"},brows:{style:"thick"},nose:{style:"wide"},mouth:{style:"wide"},facial:{style:"moustache",colour:"#3a2618"},wrinkles:.5,outfit:{top:"polo",topColour:"#2a8a5a",bottom:"shorts",bottomColour:"#c8b48a",shoes:"#6d4a32",hat:"cap",hatColour:"#d8342c"}}),"Mrs Nakamura":st({head:{size:.48,shape:.5,form:"round",jaw:.55,cheeks:.8},body:{height:.25,build:.6,skin:"#e8bf98"},hair:{style:"bun",colour:"#5a3a22"},eyes:{style:"round",size:.55},brows:{style:"arched"},nose:{style:"button"},mouth:{style:"grin",colour:"#cc3d52"},blush:.5,wrinkles:.4,outfit:{top:"apron",topColour:"#3fa0c8",bottom:"skirt",bottomColour:"#27304d",shoes:"#f4f1ea",hat:"kerchief",hatColour:"#f4f1ea",accent:"#f4f1ea"}}),"Mr Shimabukuro":st({head:{size:.48,shape:.5,form:"narrow",jaw:.5,cheeks:.35},body:{height:.5,build:.45,skin:"#dca97e"},hair:{style:"sidepart",colour:"#1c1714"},eyes:{style:"almond"},brows:{style:"straight"},nose:{style:"line"},mouth:{style:"smirk"},facial:{style:"moustache",colour:"#1c1714"},wrinkles:.3,outfit:{top:"smock",topColour:"#f4f1ea",bottom:"trousers",bottomColour:"#2b2b2b",shoes:"#2b2b2b"}}),"Mrs Yonamine":st({head:{size:.48,shape:.5,form:"heart",jaw:.3,cheeks:.65},body:{height:.3,build:.55,skin:"#c98d62"},hair:{style:"ponytail",colour:"#3a2618"},eyes:{style:"sparkle"},brows:{style:"thick"},nose:{style:"button"},mouth:{style:"wide"},blush:.3,outfit:{top:"apron",topColour:"#2f5f9e",bottom:"trousers",bottomColour:"#27304d",shoes:"#f4f1ea",hat:"headband",hatColour:"#d8342c",accent:"#f4f1ea"}}),"Mrs Miyagi":st({head:{size:.48,shape:.5,form:"oval",jaw:.35,cheeks:.4},body:{height:.1,build:.4,skin:"#c98d62"},hair:{style:"bun",colour:"#f4f1ea"},eyes:{style:"sleepy"},brows:{style:"thin",colour:"#d8d6d0"},nose:{style:"button"},mouth:{style:"small"},wrinkles:1,outfit:{top:"blouse",topColour:"#f4f1ea",bottom:"longskirt",bottomColour:"#2f5f9e",shoes:"#2b2b2b"}}),"Mr Tamaki":st({head:{size:.48,shape:.5,form:"square",jaw:.7,cheeks:.4},body:{height:.6,build:.7,skin:"#c98d62"},hair:{style:"spiky",colour:"#1c1714"},eyes:{style:"round"},brows:{style:"thick"},nose:{style:"wide"},mouth:{style:"grin"},outfit:{top:"jacket",topColour:"#e8742a",bottom:"trousers",bottomColour:"#27304d",shoes:"#2b2b2b",hat:"headband",hatColour:"#f4f1ea"}}),Kōji:st({head:{size:.48,shape:.5,form:"oval",jaw:.65,cheeks:.4},body:{height:.58,build:.5,skin:"#b27449"},hair:{style:"crop",colour:"#3a2618"},eyes:{style:"dot"},brows:{style:"straight"},nose:{style:"button"},mouth:{style:"grin"},outfit:{top:"tee",topColour:"#d8342c",bottom:"shorts",bottomColour:"#2f5f9e",shoes:"#f4f1ea",hat:"kerchief",hatColour:"#2f5f9e"}}),"Mr Nakasone":st({head:{size:.48,shape:.5,form:"square",jaw:.75,cheeks:.6},body:{height:.42,build:.55,skin:"#dca97e"},hair:{style:"horseshoe",colour:"#d8d6d0"},eyes:{style:"gentle"},brows:{style:"bushy",colour:"#d8d6d0"},nose:{style:"wide"},mouth:{style:"smile"},glasses:{style:"square",colour:"#2b2b2b"},wrinkles:.8,outfit:{top:"polo",topColour:"#d8342c",bottom:"trousers",bottomColour:"#c8b48a",shoes:"#f4f1ea",hat:"cap",hatColour:"#f4f1ea"}}),"Mrs Kamiya":st({head:{size:.48,shape:.5,form:"round",jaw:.5,cheeks:.7},body:{height:.2,build:.5,skin:"#e8bf98"},hair:{style:"perm",colour:"#9a9a96"},eyes:{style:"round",size:.45},brows:{style:"arched",colour:"#9a9a96"},nose:{style:"dot"},mouth:{style:"small",colour:"#e06a7a"},wrinkles:.8,blush:.4,outfit:{top:"polo",topColour:"#3fa0c8",bottom:"trousers",bottomColour:"#f4f1ea",shoes:"#f4f1ea",hat:"straw",hatColour:"#f4f1ea"}}),"Mr Arakaki":st({head:{size:.48,shape:.5,form:"narrow",jaw:.3,cheeks:.25},body:{height:.35,build:.35,skin:"#dca97e"},hair:{style:"bald",colour:"#9a9a96"},eyes:{style:"narrow"},brows:{style:"worried",colour:"#9a9a96"},nose:{style:"hook"},mouth:{style:"flat"},glasses:{style:"round",colour:"#2b2b2b"},wrinkles:.9,outfit:{top:"polo",topColour:"#f4d23c",bottom:"trousers",bottomColour:"#27304d",shoes:"#2b2b2b",hat:"cap",hatColour:"#2f5f9e"}}),"Mrs Kinjō":st({head:{size:.48,shape:.5,form:"heart",jaw:.4,cheeks:.55},body:{height:.32,build:.55,skin:"#dca97e"},hair:{style:"bob",colour:"#3a2618"},eyes:{style:"round"},brows:{style:"arched"},nose:{style:"button"},mouth:{style:"smile",colour:"#b8544a"},blush:.4,wrinkles:.3,outfit:{top:"blouse",topColour:"#e98aa6",pattern:"dots",bottom:"skirt",bottomColour:"#6d7478",shoes:"#9a6a42"}}),"Postman Tōma":st({head:{size:.48,shape:.5,form:"oval",jaw:.5,cheeks:.4},body:{height:.6,build:.4,skin:"#e8bf98"},hair:{style:"sidepart",colour:"#3a2618",flip:!0},eyes:{style:"round"},brows:{style:"straight"},nose:{style:"line"},mouth:{style:"smile"},outfit:{top:"polo",topColour:"#2f5f9e",bottom:"trousers",bottomColour:"#27304d",shoes:"#2b2b2b",hat:"cap",hatColour:"#2f5f9e"}})}),w_={captain:["captain","#f4f1ea"],police:["police","#27304d"],driver:["cap","#2a8a5a"],apron:["kerchief","#f4f1ea"],"headband-scarf":["headband","#efe2c3"],headband:["headband","#e8cf85"],"headband-satchel":["headband","#7b5746"]},Ho=new Map(la.map(n=>[n.name,n.age])),rc=(n,e)=>{const t=th(Ho.get(e));return Ho.has(e)&&n.age!==t?Ut({...n,age:t}):n};function T_(n=""){const e=d_(n);if(e)return e;if(zo[n])return rc(zo[n],n);if(sc[n])return rc(Ut(Bo(sc[n],n)),n);const t=p_(n),i=oa(n),s=c=>c[Math.floor(i()*c.length)],r=la.find(c=>c.name===n)?.female??(/female/.test(t.source||"")||/^(Mrs |Aya|Reiko|Hana|Yoshiko|Emi|Naoko|Fumiko|Yui)/.test(n)),o=/^#[a-f0-9]{6}$/i.test(t.hair||"")&&parseInt(t.hair.slice(1,3),16)>150,a=w_[t.accessory]||(t.helmet?["helmet",t.helmet]:["none","#f4f1ea"]),l=Ut(Bo({name:n,age:th(Ho.get(n)),body:{silhouette:r?"feminine":"masculine",height:.3+i()*.45,build:.3+(Math.min(1.2,t.width||1)-.85)*1.6,skin:t.skin||"#e8bf98"},head:{size:.38+i()*.22,shape:i(),form:s(pt.head),jaw:.25+i()*.5,cheeks:.25+i()*.5},hair:{style:s(o&&!r?["horseshoe","buzz","crop"]:r?["bob","long","ponytail","bun","sidepart"]:["crop","sidepart","spiky","buzz"]),colour:t.hair||"#1c1714",flip:i()<.5},eyes:{style:s(pt.eyes),size:.35+i()*.35,spacing:.4+i()*.2,tilt:.4+i()*.2},brows:{style:s(pt.brows.slice(0,6)),colour:t.hair||"#1c1714"},nose:{style:s(pt.nose.slice(0,5)),size:.35+i()*.4},mouth:{style:s(pt.mouth),colour:r?"#cc3d52":"#b8544a"},glasses:{style:/glasses/.test(t.accessory||"")?"square":"none",colour:"#2b2b2b"},facial:{style:!r&&i()<.25?s(["moustache","stubble","goatee"]):"none",colour:t.hair||"#1c1714"},blush:r?.4:.15,wrinkles:o?.7:0,outfit:{top:t.accessory==="apron"?"apron":t.accessory==="hawaiian"?"kariyushi":r?"blouse":"polo",topColour:t.top||"#3fa0c8",pattern:t.accessory==="hawaiian"?"flowers":"none",bottom:r&&t.top===t.trousers?"longskirt":"trousers",bottomColour:t.trousers||"#27304d",shoes:"#2b2b2b",hat:a[0],hatColour:a[1],accent:t.accent||"#f4d23c"}}));return n==="Hana"?Ut({...l,outfit:{...l.outfit,top:"sailor",topColour:"#f3ecd9",bottom:"pleatedskirt",bottomColour:"#343959",footwear:"shoes",shoes:"#483b36",hat:"none",accent:"#428b88",pattern:"none"}}):l}const oc=Object.freeze({x:-25,z:-44,width:8.8,depth:7.4,door:Object.freeze([-25,0,-39.65])}),_v=Object.freeze({width:8.4,depth:7,bounds:{minX:-4.2,maxX:4.2,minZ:-3.5,maxZ:3.5},doorX:0,spawn:[0,0,2.9],exit:[0,1.1,3.42],yaw:0,staff:{Kenji:[-1.25,0,-1.9],Tetsuo:[1.5,0,-1.9]}}),bh=Object.freeze({title:"Dock Electrical & Repair Workshop",jp:"Dock Electrical Workshop",sub:"ELECTRICAL · INSTRUMENTS · REPAIRS",industrialWorkshop:!0,x:oc.x,z:oc.z,line:"Kenji’s fabrication and Form 3D bench, with Tetsuo’s electrical and instrument repairs.",directions:"On the western quay, beside the harbour warehouse. Look for the blue electrical workshop sign."}),Mh=Object.freeze([{id:"yuri-home",entry:"one",number:"1",residents:["Thuan","Nao"]},{id:"resident-home-aya",entry:"two",number:"2",residents:["Aya","Reiko"]},{id:"resident-home-kenji",entry:"three",number:"3",residents:["Kenji","Tetsuo"]},{id:"resident-home-mrs-sato",entry:"four",number:"4A",residents:["Mrs Sato"]},{id:"resident-home-officer-mori",entry:"four",number:"4B",residents:["Officer Mori"]},{id:"resident-home-harbour-master",entry:"five",number:"5A",residents:["Harbour master"]},{id:"resident-home-bus-driver",entry:"five",number:"5B",residents:["Bus driver"]}].map(n=>Object.freeze({...n,residents:Object.freeze(n.residents),address:n.number+" Main Street",title:n.residents.join(" & ")+"’s home"}))),E_=Object.freeze({"resident-home-nao":"yuri-home","resident-home-reiko":"resident-home-aya","resident-home-tetsuo":"resident-home-kenji"}),xh=n=>E_[n]||n,A_=n=>Mh.find(e=>e.residents.includes(n)),R_=n=>Mh.find(e=>e.id===xh(n?.id))||A_(n?.homeOwner),yv=n=>n?.homeOwners||R_(n)?.residents||(n?.homeOwner?[n.homeOwner]:[]),Ri=Object.freeze({LEGACY:"legacy",SHOPPING:"shopping-district",PENINSULA:"peninsula"});let mr=Ri.LEGACY;function vv(n=Ri.LEGACY){return mr=Object.values(Ri).includes(n)?n:Ri.LEGACY,mr}const bv=()=>mr!==Ri.LEGACY,C_=()=>mr===Ri.PENINSULA,Mv=Object.freeze({z:1.6,width:8.8,depth:7.4}),xv=Object.freeze({width:8.4,depth:7,doorX:0,bounds:{minX:-4.2,maxX:4.2,minZ:-3.5,maxZ:3.5},spawn:[0,0,2.9],exit:[0,1.1,3.42],yaw:0,staff:{Aya:[-2.6,0,1.2],Reiko:[-2.6,0,-1.9]}}),Sh=Object.freeze({title:"Front-Row Books",jp:"Front-Row Books",sub:"BOOKS · NEWSPAPERS · LOCAL STORIES",bookshop:!0,side:-1,line:"Aya’s small neighbourhood bookshop, with reading copies, second-hand books and Reiko’s evening newspaper.",directions:"On the west pavement, north of Minato Izakaya. A quiet bookshop with a window reading chair and a counter for recommendations."}),wh=Object.freeze({journal:"frontrow",electronics:"form3d",stepwise:"form3d",career:"office"}),P_=n=>wh[n]||n,Sv=n=>n==="form3d",Vo=Object.freeze([{id:"frontrow",title:"Front-Row Books & Press",jp:"Maegeru Shobo/Printing",sub:"BOOKS · EVENING PRESS",side:1,z:4,color:7559241,accent:"#8b3f36",line:"Aya’s books and Reiko’s evening paper, under one roof.",directions:"The bookshop and printing desk share the west block, facing Main Street."},{id:"form3d",title:"Kenji & Tetsuo Repairs",jp:"Three-dimensional/electrical workshop",sub:"PATTERNS · RADIOS · INSTRUMENTS",side:1,z:4,color:5663603,accent:"#385f6e",line:"Kenji’s pattern bench and Tetsuo’s radio and instrument repairs.",directions:"The repair workshop is in the east block, across Main Street from the bookshop."},{id:"office",title:"Johansson Harbour Office",jp:"Port Affairs and Technology Office",sub:"MARINE SERVICE · HARBOUR RECORDS",side:1,z:-42,color:6453102,accent:"#49675d",line:"Shipping records, tide tables and Johansson’s marine service files.",directions:"Follow the main street to the quay. The harbour office is on the right, opposite the warehouse."},{id:"market",title:"Sakura Shōten",jp:"Sakura Shop",sub:"DAILY GOODS",side:-1,z:-28,color:10321022,accent:"#a76680",line:"Thuan’s convenience store · tea, snacks and everyday things."}].map(Object.freeze)),I_=()=>Vo.map(n=>({...n})),wv=()=>I_().filter(n=>["market","frontrow","form3d","office"].includes(n.id)).map(n=>n.id==="frontrow"?{...n,...Sh}:n.id==="form3d"?{...n,...bh}:n);function Tv(n){const e=new Set(Object.keys(wh));for(let t=n.length-1;t>=0;t--)e.has(n[t].id)&&n.splice(t,1);for(const t of Vo){const i=n.find(s=>s.id===t.id);i&&Object.assign(i,t)}if(C_()){let t=n.find(s=>s.id==="form3d");t||(t={...Vo.find(s=>s.id==="form3d")},n.push(t)),Object.assign(t,bh);const i=n.find(s=>s.id==="frontrow");i&&Object.assign(i,Sh)}return n}function L_(n=[]){return[...new Set(n.map(e=>xh(P_(e))))]}const gr="johansson-town-1988-v5",D_=["johansson-town-1988-v4","johansson-town-1988-v3"];function N_(n){const e=t=>typeof t=="string"?t.replace(/\b(?:Yuri|Yui)\b/g,"Thuan"):t;for(const t of["residentLocations","residentLife"]){const i=n[t];if(!(!i||typeof i!="object"||Array.isArray(i)))for(const s of["Yuri","Yui"])Object.hasOwn(i,s)&&(Object.hasOwn(i,"Thuan")||(i.Thuan=i[s]),delete i[s])}Array.isArray(n.notes)&&(n.notes=[...new Set(n.notes.map(e))]);for(const t of Object.values(n.residentLife||{}))Array.isArray(t?.activities)&&(t.activities=t.activities.map(e));if(Array.isArray(n.sakura?.journal))for(const t of n.sakura.journal)t&&typeof t=="object"&&(t.buyer=e(t.buyer));return n}const Th="johansson-town-players",sr=Object.freeze({id:"player-1",name:"Visitor"}),k_=n=>n===sr.id?gr:gr+"@"+n,_r=n=>String(n||"").replace(/[\u0000-\u001f<>]/g,"").trim().slice(0,24);function Bi(n){let e=null;try{e=JSON.parse(n?.getItem?.(Th))}catch{}const t=Array.isArray(e?.players)?e.players.filter(s=>s&&typeof s.id=="string"&&/^[\w-]{1,40}$/.test(s.id)).map(s=>({id:s.id,name:_r(s.name)||"Visitor",created:Number(s.created)||0,lastPlayed:Number(s.lastPlayed)||0})):[];return t.some(s=>s.id===sr.id)||t.unshift({...sr,created:0,lastPlayed:0}),{active:t.some(s=>s.id===e?.active)?e.active:sr.id,players:t}}function Cr(n,e){try{return n.setItem(Th,JSON.stringify(e)),!0}catch{return!1}}const Ev=n=>{const e=Bi(n);return e.players.find(t=>t.id===e.active)};function Av(n,e,t=Date.now()){const i=Bi(n),s="player-"+t.toString(36)+Math.floor(Math.random()*1296).toString(36);return i.players.push({id:s,name:_r(e)||"Visitor",created:t,lastPlayed:t}),i.active=s,Cr(n,i),s}function Rv(n,e){const t=Bi(n);return t.players.some(i=>i.id===e)?(t.active=e,Cr(n,t)):!1}function Cv(n,e){const t=Bi(n),i=t.players.find(s=>s.id===t.active);return!i||!_r(e)?!1:(i.name=_r(e),Cr(n,t))}function Pv(n,e=Date.now()){const t=Bi(n),i=t.players.find(s=>s.id===t.active);i&&(i.lastPlayed=e,Cr(n,t))}function Iv(n){const e=k_(Bi(n).active);for(const t of e===gr?[gr,...D_]:[e])try{const i=JSON.parse(n.getItem(t));if(i&&typeof i=="object"&&!Array.isArray(i))return Array.isArray(i.visited)&&(i.visited=L_(i.visited.filter(s=>typeof s=="string"))),N_(i)}catch{}return null}function rr(n){return{scale:Math.max(.5,Math.min(.9,((n.thigh+n.shin)*.94+n.foot-n.seatDrop)/.56)),saddle:.74}}function Lv(n,e,t,i,s){const r=Math.sin(t)*.54*i,o=Math.cos(t)*.54*i;return s(n,e,.28)||s(n-r,e-o,.23*i)||s(n+r,e+o,.23*i)}function ac(n,e,t){const i=n.getWorldPosition(new P),s=e.getWorldPosition(new P).sub(i).normalize(),r=t.clone().sub(i).normalize(),o=new rt().setFromUnitVectors(s,r).multiply(n.getWorldQuaternion(new rt));n.quaternion.copy(n.parent.getWorldQuaternion(new rt).invert().multiply(o)),n.updateWorldMatrix(!1,!0)}function lc(n,e,t,i,s){const r=n.getWorldPosition(new P),o=e.getWorldPosition(new P),a=t.getWorldPosition(new P),l=r.distanceTo(o),c=o.distanceTo(a),h=i.clone().sub(r),u=ke.clamp(h.length(),Math.abs(l-c)+1e-4,l+c-1e-4);h.normalize();const p=s.clone().addScaledVector(h,-s.dot(h)).normalize(),f=(l*l-c*c+u*u)/(2*u),g=Math.sqrt(Math.max(0,l*l-f*f));ac(n,e,r.clone().addScaledVector(h,f).addScaledVector(p,g)),ac(e,t,r.clone().addScaledVector(h,u))}function U_(n,e=0,t=rr(n.measure)){const{bones:i,measure:s,root:r}=n,o=r.parent,a=t.scale;r.updateWorldMatrix(!0,!0);const l=o?o.getWorldQuaternion(new rt):new rt,c=(p,f,g)=>{const y=new P(p,f,g);return o?o.localToWorld(y):y},h=(p,f,g)=>new P(p,f,g).applyQuaternion(l),u=r.getWorldQuaternion(new rt);for(const[p,f,g]of[["L",-1,Math.PI],["R",1,0]]){const y=e*Math.PI*2+g;lc(i["thigh"+p],i["knee"+p],i["foot"+p],c(f*.12*a,(.32+Math.sin(y)*.12)*a+s.foot,(.12+Math.cos(y)*.12)*a),h(0,0,-1));const m=i["foot"+p];m.quaternion.copy(m.parent.getWorldQuaternion(new rt).invert().multiply(u)),m.updateWorldMatrix(!1,!0),lc(i["shoulder"+p],i["elbow"+p],i["hand"+p],c(f*.25*a,1.04*a+s.hand*.55,-.25*a),h(f,-.2,.1));const d=i["hand"+p];d.quaternion.copy(d.parent.getWorldQuaternion(new rt).invert().multiply(l)),d.updateWorldMatrix(!1,!0)}}function F_(n,e=2.4){const t=ke.clamp(n/e,0,1);return{lift:ke.smoothstep(t,0,.3)*(1-ke.smoothstep(t,.7,1)),swallow:ke.smoothstep(t,.4,.65),done:t>=1}}function Eh(n,e,t=!1){return t?0:-(.55+.2*(1-ke.clamp(n?.userData?.portion??1,0,1)))*e}function O_(n,e,t=!1){return t?0:-.05*(1-ke.clamp(n?.userData?.portion??1,0,1))*ke.smoothstep(e,.5,1)}function cc(n,e,t){const i=n.getWorldPosition(new P),s=e.getWorldPosition(new P).sub(i).normalize(),r=new rt().setFromUnitVectors(s,t.clone().sub(i).normalize()).multiply(n.getWorldQuaternion(new rt));n.quaternion.copy(n.parent.getWorldQuaternion(new rt).invert().multiply(r)),n.updateWorldMatrix(!1,!0)}function B_(n,e){const t=n.bones,i=t.shoulderR.getWorldPosition(new P),s=i.distanceTo(t.elbowR.getWorldPosition(new P)),r=t.elbowR.getWorldPosition(new P).distanceTo(t.handR.getWorldPosition(new P)),o=e.clone().sub(i),a=ke.clamp(o.length(),Math.abs(s-r)+1e-4,s+r-1e-4);o.normalize();const l=new P(-1,-.25,0).transformDirection(n.root.matrixWorld);l.addScaledVector(o,-l.dot(o)).normalize();const c=(s*s-r*r+a*a)/(2*a),h=Math.sqrt(Math.max(0,s*s-c*c));cc(t.shoulderR,t.elbowR,i.clone().addScaledVector(o,c).addScaledVector(l,h)),cc(t.elbowR,t.handR,i.clone().addScaledVector(o,a))}function z_(n,e,t=!1,i=null){const{root:s,measure:r,bones:o}=n;s.updateWorldMatrix(!0,!0);const a=Ar(n.recipe),l=o.head,c=Math.PI*.28+a.mouthY/256*Math.PI*.58,h=Math.PI/2-.95+a.mouthX/256*1.9,u=ms(new P(-Math.cos(h)*Math.sin(c),Math.cos(c),Math.sin(h)*Math.sin(c)),r.profile),p=new P(u.x*r.Rh*r.headSX,r.headCentre-r.headY+u.y*r.Rh*r.headSY,u.z*r.Rh*.98+.025*r.k),f=s.localToWorld(new P(-r.shoulderX,r.shoulderY-r.upper*.75,r.depth*.75+r.fore*.45)),g=s.getWorldQuaternion(new rt).multiply(new rt().setFromAxisAngle(new P(1,0,0),Eh(i,e,t))),y=new P(t?0:-.1*r.k,t?.04:(i?.userData.rimHeight??.15)-.08*r.k,t?.115:.015*r.k).applyQuaternion(g),m=o.shoulderR.getWorldPosition(new P),d=(r.upper+r.fore)*.985;let v=null;for(let b=0;b<12;b++){l.updateWorldMatrix(!0,!1),v=f.clone().lerp(l.localToWorld(p.clone()).sub(y),e);const _=v.distanceTo(m)-d;if(_<=5e-4||e<.01)break;l.rotation.x+=Math.min(.12,_/(r.Rh*1.1))}B_(n,v),o.handR.quaternion.copy(o.handR.parent.getWorldQuaternion(new rt).invert().multiply(g)),o.handR.updateWorldMatrix(!1,!0)}function yr(n,e,t=0,i="R"){const s=!!e.userData.food,r=n.measure,o=n.bones["hand"+i];n.root.updateWorldMatrix(!0,!0);const a=n.root.getWorldQuaternion(new rt).multiply(new rt().setFromAxisAngle(new P(1,0,0),Eh(e,t,s))),l=new P(s?0:(i==="R"?-.1:.1)*r.k,s?0:-.08*r.k,.015*r.k).applyQuaternion(a),c=o.getWorldPosition(new P).add(l),h=new He().compose(c,a,new P(1,1,1));e.matrixAutoUpdate=!1,e.matrix.copy(o.matrixWorld).invert().multiply(h),e.matrixWorldNeedsUpdate=!0}const Ah=Object.freeze({"Lighthouse keeper":{feel:{happy:"Nod",laugh:"Nod",shy:"Bow"},idle:["LookAround","LookAround","Think"],talk:["Nod","Think"]},"Porch sitter":{feel:{happy:"Nod",laugh:"Laugh",shy:"Fidget"},idle:["Stretch","LookAround"],talk:["Nod","Talk"]},"Old storyteller":{feel:{happy:"Clap",laugh:"Laugh",shy:"Fidget"},idle:["Think","LookAround"],talk:["Talk","Talk","Point","Clap"]},"Cloud watcher":{feel:{happy:"Heart",laugh:"Laugh",shy:"Coy"},idle:["Stretch","LookAround","Coy"],talk:["Coy","Heart","Talk"]},"Quiet craftsman":{feel:{happy:"Nod",laugh:"Nod",shy:"Shrug"},idle:["HandsOnHips","Think"],talk:["Nod","Shrug"]},"Easy neighbour":{feel:{happy:"Laugh",laugh:"Laugh",shy:"Shrug"},idle:["Stretch","HandsOnHips"],talk:["Shrug","Talk","Laugh"]},"Big heart":{feel:{happy:"Heart",laugh:"Laugh",shy:"Fidget",sad:"Slump"},idle:["Heart","Clap","HandsOnHips"],talk:["Heart","Talk","Laugh"]},Wanderer:{feel:{happy:"Tada",laugh:"Laugh",shy:"Shrug"},idle:["Stretch","Kachashi","LookAround"],talk:["Shrug","Laugh","Peace"]},Timekeeper:{feel:{happy:"Bow",laugh:"Nod",shy:"Bow"},idle:["HandsOnHips","LookAround"],talk:["Bow","Nod","Point"]},"Helping hand":{feel:{happy:"Clap",laugh:"Laugh",shy:"Fidget"},idle:["Wave","HandsOnHips"],talk:["Nod","Clap","Point"]},"Rising star":{feel:{happy:"Peace",laugh:"Laugh",shy:"Coy"},idle:["Peace","Coy","HeelKick"],talk:["Peace","Coy","Heart"]},"Festival friend":{feel:{happy:"HeelKick",laugh:"Laugh",shy:"Coy"},idle:["Heart","HeelKick","Kachashi"],talk:["Heart","Peace","Clap"]},"Straight shooter":{feel:{happy:"Nod",laugh:"Laugh",shy:"HandsOnHips"},idle:["HandsOnHips","HandsOnHips","LookAround"],talk:["Point","HandsOnHips","Nod"]},Joker:{feel:{happy:"Peace",laugh:"Laugh",shy:"Shrug"},idle:["Peace","Shrug","Coy"],talk:["Peace","Laugh","Shrug"]},Firecracker:{feel:{happy:"Tada",laugh:"Laugh",shy:"HandsOnHips",angry:"Stomp"},idle:["HandsOnHips","Fist","Tada"],talk:["Point","Fist","HandsOnHips"]},Typhoon:{feel:{happy:"Tada",laugh:"Laugh",shy:"Coy"},idle:["Tada","Kachashi","HeelKick","Cheer"],talk:["Tada","Peace","Laugh"]}}),H_=n=>(Li(n.show)-1)/(Fn-1),V_=n=>(Li(n.pace)-1)/(Fn-1),G_=n=>(Li(n.talk)-1)/(Fn-1);function W_(n={}){const e=_h(n),t=Ah[e.name],i=H_(n),s=V_(n),r=34-i*20-s*6;return{type:e.name,feel:t.feel,idle:t.idle,talk:t.talk,idleEvery:[r*.6,r*1.4],talkChance:Math.min(.85,.3+i*.4+G_(n)*.15)}}Object.freeze([...new Set(Object.values(Ah).flatMap(n=>[...Object.values(n.feel),...n.idle,...n.talk]))]);function Dv(n=""){const e=String(n).toLowerCase();return/\b(ha){2,}|\bhehe|\bahaha|\blol\b|funny|joke|laugh/.test(e)?"laugh":/\bsorry\b|\bsad\b|\bmiss (him|her|them|it)|lonely|\balas\b|passed away|can't sleep|worried/.test(e)?"sad":/\?!|!\?|\breally\?|\bno way\b|\bwhat\?|goodness|\bwow\b/.test(e)?"surprised":/\b(love|wonderful|lovely|great|welcome|thank(s| you)|congratulations|happy|delicious|perfect|yay)\b|!/.test(e)?"happy":/\bhmm+\b|\bwell\.\.\.|let me think|i wonder/.test(e)?"thinking":null}const Qs=["hips","spine","chest","neck","head","shoulderL","elbowL","handL","shoulderR","elbowR","handR","thighL","kneeL","footL","thighR","kneeR","footR"],X_=(n,e)=>n<0||n>e?0:Math.sin(Math.PI*Math.min(1,n/e)),Y_=(n,e,t=.25)=>Math.min(1,n/t,(e-n)/t),Ci=Object.freeze({Wave:1.6,Bow:1.5,Nod:1.1,HeadShake:1.2,Point:1.6,Shrug:1.3,Clap:1.8,Laugh:2,Think:2.4,LookAround:2.6,Stretch:2.2,PickUp:1.6,Fist:1.4,Jab:.42,JabL:.42,Swipe:.7,Hurt:.5,Jump:.9,Cheer:1.6,Hop:1.2,Gasp:1.6,Stomp:1.4,Slump:2.2,Fidget:2.4,SitEnjoyFood:3.8,SitPresentFood:4.2,SitToast:2.4,SitDrink:2.4,SitEat:2.4,Drink:2.4,Eat:2.4,Heart:2.8,Peace:2.8,Coy:3,Tada:2.4,HandsOnHips:2.6,HeelKick:2.6,Talk:1/0,Kachashi:1/0,Crouch:1/0,Phone:1/0,FishIdle:1/0,Reel:1/0}),q_=Object.freeze({happy:"Hop",laugh:"Laugh",sad:"Slump",angry:"Stomp",shy:"Fidget",surprised:"Gasp",worried:"Think"});function Go(n,{lively:e=!1,random:t=Math.random}={}){const{bones:i,measure:s}=n,r=W_(n.recipe?.profile||{}),o=oe=>oe[Math.floor(t()*oe.length)],a=()=>r.idleEvery[0]+t()*(r.idleEvery[1]-r.idleEvery[0]);let l=4+a()*.6,c=!1,h=10;const u=oa(n.recipe.name||JSON.stringify(n.recipe)),p=.92+u()*.16,f=.8+u()*.25,g=(u()-.5)*.055,y=.85+u()*.3,m=Object.fromEntries(Qs.map(oe=>[oe,new P])),d=Object.fromEntries(Qs.map(oe=>[oe,new P])),v=new P;let b=0,_=Math.random()*10,E=0,w=0,R=null,I=1+Math.random()*3,S=-1,x=0,A=0,O=[0,0],U=2,V="neutral",F=null,H=0,Q=null,Y=0;const M=(oe,X=0,ne=0,ge=0)=>d[oe].set(X,ne,ge),N=(oe,X=0,ne=0,ge=0)=>d[oe].add(new P(X,ne,ge));function Z(oe,X){return oe in Ci?(R={name:oe,t:0,d:Ci[oe]===1/0&&X?X:Ci[oe]},!0):!1}const ce=oe=>Z(oe,2.6+t()*1.4),Ce=()=>{R=null};function J(oe,X={}){_+=oe;const ne=R?.name||X.pose||X.seat;n.setOpenHands?.(["SitEnjoyFood","SitPresentFood"].includes(ne));const ge=["Eat","EatStanding","SitEat"].includes(ne),ee=["Drink","DrinkStanding","SitDrink","SitToast"].includes(ne);if(ge||ee){ne!==Q&&(H=0),H+=oe;const k=Number.isFinite(X.consumeElapsed)?X.consumeElapsed:R?R.t+oe:H%5;F={...F_(k),food:ge,elapsed:H,cycle:Math.floor(H/5)}}else F=null,H=0;Q=ne;for(const k of Qs)d[k].set(0,0,0);let B=0,q=0;const re=X.speed||0,D=re>.08&&!X.seated&&!X.riding;if(M("shoulderL",0,0,.13),M("shoulderR",0,0,-.13),M("elbowL",-.12),M("elbowR",-.12),X.riding){const k=X.ridePhase||0,$=X.bicycleFit||rr(s);B=$.saddle*$.scale-s.hipY+s.seatDrop,M("thighL",-1.05+Math.sin(k*Math.PI*2)*.38),M("kneeL",1.05+Math.cos(k*Math.PI*2)*.4),M("thighR",-1.05-Math.sin(k*Math.PI*2)*.38),M("kneeR",1.05-Math.cos(k*Math.PI*2)*.4),M("chest",.28),M("head",-.18),M("shoulderL",-1.15,0,.18),M("shoulderR",-1.15,0,-.18),M("elbowL",-.35),M("elbowR",-.35)}else if(X.seated){const k=X.seat==="Soak"||X.pose==="Soak";B=(Number.isFinite(X.seatHeight)?X.seatHeight:.45)-s.hipY+s.seatDrop,M("thighL",-1.52,0,.06),M("thighR",-1.52,0,-.06),M("kneeL",1.45),M("kneeR",1.45),M("shoulderL",-.45,0,.15),M("shoulderR",-.45,0,-.15),M("elbowL",-.55),M("elbowR",-.55),N("chest",Math.sin(_*1.5)*.02);const $=X.pose;if(X.driving)M("shoulderL",-.95,0,.12),M("shoulderR",-.95,0,-.12),M("elbowL",-.65),M("elbowR",-.65),M("head",-.06);else if($==="Type")M("shoulderL",-.9,0,.1),M("shoulderR",-.9,0,-.1),M("elbowL",-.7+Math.sin(_*14)*.08),M("elbowR",-.7+Math.sin(_*13+1)*.08),M("head",.15);else if($==="Eat"||$==="Drink"||X.seat==="SitEat"){const se=Math.max(0,Math.sin(_*1.4))**4;M("shoulderR",-.6-se*.9,0,-.25),M("elbowR",-.8-se*1.3),M("head",.08-se*.1)}else if($==="Sleep"||X.sleeping)M("head",.45,0,.15),M("chest",.15);else if(k)M("thighL",-1.3,0,.25),M("thighR",-1.3,0,-.25),M("kneeL",.9),M("kneeR",.9),M("shoulderL",0,0,.9),M("shoulderR",0,0,-.9),M("head",-.1);else if($==="Wake"){const se=Math.max(0,Math.sin(_*.8));M("shoulderL",0,0,.4+se*2.2),M("shoulderR",0,0,-.4-se*2.2)}}else if(D){const k=X.running||re>2.6,$=s.leg*(k?2.6:1.7)*p;b+=re/$*Math.PI*2*oe*.5;const se=k?.95:Math.min(.62,.25+re*.3),te=Math.sin(b),Re=Math.cos(b);M("thighL",-te*se),M("thighR",te*se),M("kneeL",Math.max(0,Math.sin(b-.9))*se*1.5+.05),M("kneeR",Math.max(0,Math.sin(b+Math.PI-.9))*se*1.5+.05),M("footL",te*se*.3),M("footR",-te*se*.3),M("shoulderL",te*se*f,0,.12),M("shoulderR",-te*se*f,0,-.12),M("elbowL",k?-1.35:-.25-Math.max(0,-te)*.3),M("elbowR",k?-1.35:-.25-Math.max(0,te)*.3),M("hips",0,te*.14,0),M("chest",k?.22:.05,-te*.18,0),M("head",k?-.12:-.02,te*.08,0),q=Math.abs(Re)*(k?.055:.025)*s.k-(k?.02:0),X.carrying&&(M("shoulderL",-1.15,0,.3),M("shoulderR",-1.15,0,-.3),M("elbowL",-.5),M("elbowR",-.5))}else{N("chest",Math.sin(_*1.6)*.025),M("hips",0,0,Math.sin(_*.45)*.035),N("head",Math.sin(_*.7)*.03,Math.sin(_*.31)*.12,Math.sin(_*.5)*.04),N("thighL",0,0,-Math.sin(_*.45)*.03),N("thighR",0,0,-Math.sin(_*.45)*.03),N("chest",g),N("head",0,Math.sin(_*.31*y)*.035,0),q=Math.sin(_*1.6*y)*.004;const k=X.pose;if(k==="CounterIdle")M("shoulderL",-.5,0,.2),M("shoulderR",-.5,0,-.2),M("elbowL",-.95),M("elbowR",-.95);else if(k==="Interact")M("shoulderL",-.75+Math.sin(_*4.5)*.18,0,.15),M("shoulderR",-.75+Math.sin(_*4.5+1.7)*.18,0,-.15),M("elbowL",-.8),M("elbowR",-.8),N("chest",.12),N("head",.2);else if(k==="DrinkStanding"||k==="Drink"){const $=Math.max(0,Math.sin(_*1.2))**4;M("shoulderR",-.5-$*1.1,0,-.2),M("elbowR",-.9-$*1.2)}else(k==="Sit"||k==="Sleep")&&M("head",.2);X.carrying&&(M("shoulderL",-1.15,0,.3),M("shoulderR",-1.15,0,-.3),M("elbowL",-.5),M("elbowR",-.5))}const de=ke.clamp((X.tipsy||0)/2.5,0,1);let le=0;if(de>0&&!X.riding&&!X.airborne){const k=Math.sin(_*1.7),$=Math.max(0,Math.sin(_*.43+Math.sin(_*.19)*2))**8;if(X.seated)N("head",.22*de+Math.sin(_*.6)*.06*de,Math.sin(_*.37)*.1*de,Math.sin(_*.5)*.12*de),N("chest",.08*de,0,Math.sin(_*.5)*.05*de);else if(D){const se=1+Math.sin(b*.5)*.35*de;d.thighL.x*=se,d.thighR.x*=2-se,N("hips",0,0,k*.12*de),N("chest",.06*de+$*.25*de,0,-k*.14*de),N("head",.1*de,Math.sin(_*.8)*.15*de,k*.18*de),N("shoulderL",0,0,.35*de),N("shoulderR",0,0,-.35*de),le=k*.07*de+$*Math.sign(Math.sin(_*.21))*.06*de}else N("hips",0,0,Math.sin(_*.9)*.06*de),N("chest",.04*de,0,-Math.sin(_*.9)*.08*de),N("head",.12*de,Math.sin(_*.4)*.12*de,Math.sin(_*.9+.6)*.12*de),N("thighL",0,0,.05*de),N("thighR",0,0,-.05*de),le=Math.sin(_*.9)*.04*de}Y+=(le-Y)*(1-Math.exp(-oe*6)),X.airborne&&!X.seated&&(M("thighL",-.6),M("thighR",-.2),M("kneeL",1),M("kneeR",.6),M("shoulderL",-.3,0,1.6),M("shoulderR",-.3,0,-1.6));const ye=X.expression||"neutral";if(ye!==V){V=ye;const k=r.feel[ye]||q_[ye];k&&!X.seated&&!D&&!R&&ce(k)}const pe=!!X.talking;if(e){const k=!D&&!X.seated&&!X.riding&&!X.airborne&&!X.sleeping&&!X.carrying&&!F&&(!X.pose||X.pose==="Idle")&&!X.heldProp;pe&&!c&&h>.8&&k&&!R&&t()<r.talkChance&&ce(o(r.talk)),k&&!pe&&!R?(l-=oe,l<=0&&(ce(o(r.idle)),l=a())):l=Math.max(l,2)}if(h=pe?0:h+oe,c=pe,X.waving&&!R&&Z("Wave"),R)if(R.t+=oe,R.t>=R.d)R=null;else{const k=ue(R);k?.root!==void 0&&(B+=k.root)}let De=null;if(X.gaze&&!X.sleeping){v.set(...X.gaze.isVector3?X.gaze.toArray():X.gaze),n.root.worldToLocal(v);const k=Math.atan2(v.x,v.z),$=-Math.atan2(v.y-s.headCentre,Math.hypot(v.x,v.z));if(Math.abs(k)<2.4){const se=ke.clamp(k,-1.35,1.35),te=ke.clamp($,-.45,.4);N("head",te*.8,se*.62,0),N("chest",te*.15,se*.3,0),De=[ke.clamp((k-se*.62)*1.6,-1,1),ke.clamp(te*.5,-.6,.6)]}}const Me=1-Math.exp(-oe*14);for(const k of Qs)m[k].lerp(d[k],Me),i[k].rotation.set(m[k].x,m[k].y,m[k].z);E+=(B-E)*(X.seated||X.riding?1-Math.exp(-oe*9):Me),w+=(q-w)*Me,X.riding&&(E=B),n.root.position.x=X.riding?0:Y,n.root.position.z=X.riding?.21*(X.bicycleFit||rr(s)).scale:0,n.root.position.y=E+(X.seated||X.riding?0:X.floorHeight||0),i.hips.position.y=s.hipY+(X.riding?0:w),X.riding?U_(n,X.ridePhase||0,X.bicycleFit||rr(s)):F&&(i.head.rotation.x+=O_(X.heldProp,F.lift,F.food),z_(n,F.lift,F.food,X.heldProp)),I-=oe,I<=0&&S<0&&(S=0,I=1.8+Math.random()*3.8);let L=0;S>=0&&(S+=oe,L=S<.13?1:0,S>=.13&&(S=-1)),X.talking?(x-=oe,x<=0&&(x=.09+Math.random()*.12,A=A?0:Math.random()<.8?1:0)):A=0,U-=oe,U<=0&&(U=1.2+Math.random()*3,O=Math.random()<.45?[0,0]:[(Math.random()-.5)*1.6,(Math.random()-.5)*.8]);const T=X.sleeping?"sleep":ye;n.paintFace({expression:T,blink:L,talk:A,look:X.look||De||(T==="thinking"?[1,-1]:O)})}function ue(oe,X){const ne=oe.t,ge=oe.d,ee=ge===1/0?1:X_(ne,ge),B=ge===1/0?Math.min(1,ne/.3):Y_(ne,ge);switch(oe.name){case"Wave":M("shoulderR",-.2,0,-2.55*B),M("elbowR",0,0,-.45+Math.sin(ne*10)*.45*B),N("head",0,0,.08*B);break;case"Bow":N("chest",.95*ee),N("spine",.25*ee),N("head",.2*ee),M("shoulderL",.1,0,.05),M("shoulderR",.1,0,-.05);break;case"Nod":N("head",Math.sin(ne*9)*.28*ee);break;case"HeadShake":N("head",0,Math.sin(ne*11)*.45*ee);break;case"Point":M("shoulderR",-1.5*B,.2,-.1),M("elbowR",-.05),N("head",0,-.15*B);break;case"Shrug":M("shoulderL",-.3*ee,0,.55*ee+.13),M("shoulderR",-.3*ee,0,-.55*ee-.13),M("elbowL",-1.3*ee),M("elbowR",-1.3*ee),N("head",0,0,.2*ee);break;case"Clap":{const q=Math.abs(Math.sin(ne*9));M("shoulderL",-1.2*B,0,.1+q*.35),M("shoulderR",-1.2*B,0,-.1-q*.35),M("elbowL",-.9*B),M("elbowR",-.9*B);break}case"Laugh":N("chest",-.24*ee+Math.sin(ne*16)*.07*ee),N("head",-.32*ee),M("shoulderL",-.85*ee,0,.4),M("shoulderR",-.85*ee,0,-.4),M("elbowL",-1.65*ee),M("elbowR",-1.65*ee);break;case"Gasp":return N("chest",-.18*ee),N("head",-.12*ee),M("shoulderL",-.7*ee,0,.28),M("shoulderR",-.7*ee,0,-.28),M("elbowL",-1.9*ee),M("elbowR",-1.9*ee),{root:Math.sin(Math.PI*ne/ge)*.045};case"Think":M("shoulderR",-1.25*B,0,-.35),M("elbowR",-1.95*B),M("shoulderL",-.4*B,0,.3),M("elbowL",-1.4*B),N("head",.12*B,0,.18*B);break;case"LookAround":N("head",0,Math.sin(ne*2.4)*.75*ee),N("chest",0,Math.sin(ne*2.4)*.2*ee);break;case"Stretch":M("shoulderL",-.2,0,2.8*ee),M("shoulderR",-.2,0,-2.8*ee),N("chest",-.25*ee),N("head",-.3*ee);break;case"PickUp":return N("chest",1.1*ee),N("spine",.3*ee),M("shoulderR",-1.3*ee),M("thighL",-.5*ee),M("thighR",-.5*ee),M("kneeL",.9*ee),M("kneeR",.9*ee),{root:-.08*ee};case"Fist":M("shoulderR",-2.4*B+Math.sin(ne*8)*.2*B,0,-.1),M("elbowR",-.5*B),N("chest",-.1*B);break;case"Jab":case"JabL":{const q=oe.name==="Jab",re=q?"R":"L",D=q?"L":"R",de=q?1:-1,le=ne<.1?-(ne/.1)*.3:ne<.2?(ne-.1)/.1:Math.max(0,1-(ne-.2)/.22);return M("shoulder"+re,-.9-.75*le,0,-de*.05),M("elbow"+re,-1.9+1.85*le),M("shoulder"+D,-1.05,0,de*.18),M("elbow"+D,-2.1),N("chest",.06*le,-de*.4*le),N("head",0,de*.12*le),{root:-.02*B}}case"Swipe":{const q=ne<.32?ne/.32:Math.max(0,1-(ne-.32)/.14),re=ne<.32?0:Math.min(1,(ne-.32)/.14)*Math.max(0,1-(ne-.5)/.2);return M("shoulderL",-2.7*q-1.2*re,0,.25),M("shoulderR",-2.7*q-1.2*re,0,-.25),M("elbowL",-.4*q),M("elbowR",-.4*q),N("chest",-.2*q+.45*re),N("head",-.15*q+.2*re),{root:.04*q}}case"Hurt":return M("shoulderL",-.5*ee,0,.9*ee+.13),M("shoulderR",-.5*ee,0,-.9*ee-.13),M("elbowL",-.5*ee),M("elbowR",-.5*ee),N("chest",-.4*ee),N("head",-.35*ee,Math.sin(ne*20)*.1*ee),{root:-.03*ee};case"Jump":{const q=ne<.2?-.08:Math.sin(Math.PI*Math.min(1,(ne-.2)/.6))*.25;return M("shoulderL",-.3,0,1.4*B),M("shoulderR",-.3,0,-1.4*B),M("kneeL",ne<.2?.8:.3),M("kneeR",ne<.2?.8:.3),M("thighL",ne<.2?-.5:-.2),M("thighR",ne<.2?-.5:-.2),{root:q}}case"Cheer":return M("shoulderL",-.2,0,2.6*B),M("shoulderR",-.2,0,-2.6*B),M("elbowL",-.3),M("elbowR",-.3),{root:Math.abs(Math.sin(ne*7))*.1*ee};case"Hop":return M("shoulderL",-.2,0,.9*ee),M("shoulderR",-.2,0,-.9*ee),N("head",-.15*ee),{root:Math.abs(Math.sin(ne*8))*.12*ee};case"Stomp":M("shoulderL",-.2,0,.35),M("shoulderR",-.2,0,-.35),M("elbowL",-1.6*B),M("elbowR",-1.6*B),M("thighL",-.5*Math.max(0,Math.sin(ne*9))*ee),M("kneeL",.6*Math.max(0,Math.sin(ne*9))*ee),N("head",.18*ee,Math.sin(ne*14)*.1*ee),N("chest",.12*ee);break;case"Slump":return N("chest",.3*ee),N("head",.4*ee),M("shoulderL",.05,0,.03),M("shoulderR",.05,0,-.03),{root:-.03*ee};case"Fidget":M("shoulderL",-.55*B,0,-.2*B),M("shoulderR",-.55*B,0,.2*B),M("elbowL",-.6*B),M("elbowR",-.6*B),N("head",.18*ee,0,.25*ee),N("hips",0,Math.sin(ne*3)*.12*ee);break;case"SitEnjoyFood":{M("shoulderL",-.7*B,.18*B,.62*B),M("shoulderR",-.7*B,-.18*B,-.62*B),M("elbowL",-1.35*B),M("elbowR",-1.35*B),M("handL",-1.25*B,.55*B,.25*B),M("handR",-1.25*B,-.55*B,-.25*B),N("chest",.05*ee),N("head",-.06*ee,0,.16*ee);break}case"SitPresentFood":{M("shoulderL",-1.1*B,0,.22*B),M("shoulderR",-1.1*B,0,-.22*B),M("elbowL",-1.18*B),M("elbowR",-1.18*B),M("handL",-1.45*B,0,.18*B),M("handR",-1.45*B,0,-.18*B),N("head",-.08*ee,0,-.1*ee);break}case"SitToast":M("shoulderR",-1.9*B,0,-.2),M("elbowR",-.6*B),N("head",-.15*B);break;case"SitDrink":{const q=Math.max(0,Math.sin(ne*2.6))**2;M("shoulderR",-.6-q*1,0,-.25),M("elbowR",-.9-q*1.2);break}case"Heart":return M("shoulderL",-.8*B,0,.5*B),M("elbowL",-.45*B,0,-1.7*B),M("shoulderR",-.8*B,0,-.5*B),M("elbowR",-.45*B,0,1.7*B),N("head",.06*B,0,.22*B+Math.sin(ne*3.2)*.04*B),M("hips",0,0,-.05*B),M("thighR",-.12*B),M("kneeR",.3*B),{root:Math.abs(Math.sin(ne*3.2))*.012*B};case"Peace":{M("shoulderR",-.55*B,0,-1.25*B),M("elbowR",-1.9*B,0,-.2*B),M("shoulderL",.15*B,0,.75*B),M("elbowL",-.3*B,0,-1.5*B),N("head",.06*B,-.1*B,-.24*B),M("hips",0,.15*B,-.07*B),M("thighL",-.15*B),M("kneeL",.4*B);break}case"Coy":{M("shoulderR",-1.15*B,0,-.12*B),M("elbowR",-2.1*B),M("shoulderL",.15*B,0,.75*B),M("elbowL",-.3*B,0,-1.5*B),N("head",.12*B,.2*B,.2*B),N("chest",0,.12*B,-.05*B),M("hips",0,-.2*B,.08*B),M("thighR",-.1*B,0,-.06*B),M("kneeR",.3*B);break}case"Tada":{const q=Math.min(1,ne/.3);return M("shoulderL",-.15*B,0,1.9*B),M("shoulderR",-.15*B,0,-1.9*B),M("elbowL",0,0,.2*B),M("elbowR",0,0,-.2*B),M("thighL",.35*B*q),M("kneeL",1.3*B*q),N("chest",-.12*B),N("head",-.15*B,0,.12*B),{root:.03*B*q}}case"HandsOnHips":M("shoulderL",.15*B,0,.75*B),M("elbowL",-.3*B,0,-1.5*B),M("shoulderR",.15*B,0,-.75*B),M("elbowR",-.3*B,0,1.5*B),N("chest",-.12*B),N("head",-.12*B,0,Math.sin(ne*2.2)*.08*B),M("thighL",0,0,.12*B),M("thighR",0,0,-.12*B);break;case"HeelKick":M("thighR",.45*B),M("kneeR",1.7*B+Math.sin(ne*3)*.08*B),M("shoulderL",-1.2*B,0,-.2*B),M("shoulderR",-1.2*B,0,.2*B),M("elbowL",-1.6*B),M("elbowR",-1.6*B),N("head",.08*B,0,-.25*B),N("chest",.1*B,0,-.06*B);break;case"Talk":M("shoulderR",-.55+Math.sin(ne*3.1)*.25,0,-.2),M("elbowR",-1.1+Math.sin(ne*4.3)*.3),M("shoulderL",-.35+Math.sin(ne*2.3+1)*.2,0,.2),M("elbowL",-1+Math.sin(ne*3.7)*.3),N("head",Math.sin(ne*2.6)*.06);break;case"Kachashi":{const q=Math.sin(ne*5.5),re=Math.sin(ne*2.75);return M("shoulderL",-.4,0,1.9+q*.25),M("shoulderR",-.4,0,-1.9+q*.25),M("elbowL",0,0,1.1+q*.5),M("elbowR",0,0,-1.1+q*.5),M("hips",0,re*.2,re*.08),N("chest",0,-re*.2),N("head",0,re*.15,-re*.1),M("thighL",-Math.max(0,re)*.5),M("kneeL",Math.max(0,re)*.8),M("thighR",-Math.max(0,-re)*.5),M("kneeR",Math.max(0,-re)*.8),{root:Math.abs(re)*.03}}case"Crouch":return M("thighL",-1.7,0,.25),M("thighR",-1.7,0,-.25),M("kneeL",2.3),M("kneeR",2.3),M("footL",-.6),M("footR",-.6),N("chest",.5),M("shoulderL",-.9,0,.1),M("shoulderR",-.9,0,-.1),M("elbowL",-.4),M("elbowR",-.4),{root:-(s.thigh+s.shin)*.72};case"Phone":M("shoulderR",-.4,0,-.5),M("elbowR",-2.2),N("head",0,0,-.15);break;case"FishIdle":M("shoulderL",-1,0,.1),M("shoulderR",-1,0,-.1),M("elbowL",-.6),M("elbowR",-.6);break;case"Reel":M("shoulderL",-1,0,.1),M("elbowL",-.6),M("shoulderR",-1+Math.sin(ne*9)*.25,0,-.2),M("elbowR",-.8+Math.cos(ne*9)*.3);break}return null}return{update:J,play:Z,stop:Ce,style:r,get gesture(){return R?.name||null},get consumption(){return F}}}const Jn=Object.freeze(Object.fromEntries(["icecream","ramen","onigiri","curry","gyoza"].map(n=>[n,`./assets/food/island-${n}.png`])));function Nv(n){const e=String(n).toLowerCase();return/ice cream/.test(e)?Jn.icecream:/rice ball|onigiri/.test(e)?Jn.onigiri:/ramen/.test(e)?Jn.ramen:/gyoza|dumpling/.test(e)?Jn.gyoza:/curry/.test(e)&&!/pack|box|pouch/.test(e)?Jn.curry:null}const hc=new Map;function j_(n,e){if(!Jn[e]||typeof Image>"u")return;const t=new Xt;t.name="Food geometry fallback";for(const c of[...n.children])t.add(c);n.add(t);const i=new Cc({transparent:!0,alphaTest:.02,depthWrite:!1}),s=new p0(i);s.name="Original "+e+" food cutout",s.scale.set(.25,.25,1),s.position.y=.105,s.visible=!1,n.add(s);const r=n.userData;r.foodCutout={sprite:s,fallback:t,ready:!1};const o=c=>{s.parent&&(i.map=c,i.needsUpdate=!0,r.foodCutout.ready=!0,t.visible=!1,s.visible=!0)},a=hc.get(e);if(a){a.then(o);return}const l=new Promise(c=>new ug().load(Jn[e],h=>{h.colorSpace=Bt,c(h)},void 0,()=>{}));hc.set(e,l),l.then(o)}function K_(n){const e=n.userData,t=e.foodCutout;if(!t?.ready)return;const i=e.portion??1;t.sprite.visible=i>0,t.sprite.material.opacity=Math.min(1,i*1.8);const s=.25*(.65+.35*i);t.sprite.scale.set(s,s,1),t.fallback.visible=i===0}const Zn=Object.freeze({draft:Object.freeze({id:"draft",jp:"Orion draught, medium mug",en:"Orion draught, a frosted mug",price:450,sips:6,alcohol:1,pour:4.2,line:"One Orion draught! Cold from the tap."}),bottle:Object.freeze({id:"bottle",jp:"Orion Large bottle",en:"Orion large bottle and a small glass",price:600,sips:8,alcohol:1.4,pour:2,line:"It's a big bottle. Pour for yourself -- or I pour the first one."}),can:Object.freeze({id:"can",jp:"Orion Can",en:"Orion can, 350 ml",price:300,sips:4,alcohol:.8,pour:1.2,line:"Still in the can? Straight from the can, then."}),awamori:Object.freeze({id:"awamori",jp:"Awamori on the rocks",en:"awamori on the rocks",price:250,sips:5,alcohol:1.6,pour:1.8,line:"Awamori. Slowly -- it is older than you think."}),sake:Object.freeze({id:"sake",jp:"Warm sake, one flask",en:"a flask of warm sake",price:220,sips:5,alcohol:1.3,pour:2.4,line:"Hot sake. Careful, the tokkuri is hot."}),oolong:Object.freeze({id:"oolong",jp:"Oolong tea",en:"Oolong tea over ice",price:150,sips:4,alcohol:0,pour:1.6,line:"Oolong tea. Plenty of ice."})}),wi=Object.freeze({yakitori:Object.freeze({id:"yakitori",jp:"Assorted Yakitori",en:"a plate of yakitori",price:180,bites:4,station:"grill",cook:6,line:"Yakitori. Two tare, two salt."}),edamame:Object.freeze({id:"edamame",jp:"Edamame",en:"a bowl of edamame",price:120,bites:3,station:"prep",cook:2,line:"Edamame. Salted while they were hot."}),oden:Object.freeze({id:"oden",jp:"Oden",en:"a bowl of oden",price:260,bites:4,station:"oden",cook:3,line:"Oden. The daikon has been in since four."}),hiyayakko:Object.freeze({id:"hiyayakko",jp:"Cold tofu",en:"cold tofu with ginger",price:150,bites:3,station:"prep",cook:2,line:"It's cold tofu. Ginger and a little soy."}),dashimaki:Object.freeze({id:"dashimaki",jp:"Dashi-rolled egg",en:"a rolled dashi omelette",price:200,bites:3,station:"range",cook:5,line:"Dashi roll. Still warm in the middle."}),hokke:Object.freeze({id:"hokke",jp:"Grilled Atka mackerel",en:"grilled hokke",price:280,bites:4,station:"grill",cook:7,line:"It's Hokke. Lemon on the side."}),sashimi:Object.freeze({id:"sashimi",jp:"Assorted sashimi",en:"the sashimi plate",price:320,bites:4,station:"prep",cook:4,line:"Sashimi. Masaru brought the tuna this morning."}),agedashi:Object.freeze({id:"agedashi",jp:"Fried tofu",en:"agedashi tofu",price:180,bites:3,station:"fryer",cook:5,line:"It's fried. Mind the broth, it is hot."}),karaage:Object.freeze({id:"karaage",jp:"Fried chicken",en:"chicken karaage",price:220,bites:4,station:"fryer",cook:6,line:"It's fried chicken. Straight out of the oil."}),ochazuke:Object.freeze({id:"ochazuke",jp:"Ochazuke",en:"ochazuke to finish",price:180,bites:3,station:"range",cook:4,line:"Ochazuke. The way to end an evening."})});Object.freeze([...Object.values(wi),...Object.values(Zn)]);const Mo=n=>Zn[n]||wi[n]||null,uc=Object.freeze({grill:[1.7,0,-3.6],oden:[-4.2,0,-3.6],range:[1.4,0,-5.15],fryer:[2.75,0,-5.15],prep:[5.4,0,-5.15]}),xo=Object.freeze([3.5,0,-3.8]),kv=Object.freeze({table:Object.freeze({id:"table",label:"Sit at the table",position:[3.3,0,.9],stand:[3.3,0,.25],eyeY:1.14,yaw:Math.PI,table:[3.3,.945,1.52],dish:[3.02,.945,1.5],serve:[3.95,0,.3],route:[[3.95,-3.55],[3.95,.3]]}),window:Object.freeze({id:"window",label:"Sit and enjoy the evening",position:[4,0,2.7],stand:[2.95,0,2.7],eyeY:1.2,yaw:Math.PI/2,table:[3.62,.945,2.55],dish:[3.62,.945,2.3],serve:[4,0,1.6],route:[[3.95,-3.55],[3.95,.3],[4,1.6]]}),...Object.fromEntries([-3.8,-2.3,-.8,.7,2.2].map((n,e)=>["counter"+e,Object.freeze({id:"counter"+e,label:"Sit at the counter",counter:!0,position:[n,0,-1.42],stand:[n,0,-.72],eyeY:1.32,yaw:0,table:[n+.15,1.11,-2.2],dish:[n-.12,1.11,-2.24],serve:[n,0,-3.75],route:[[n,-3.75]]})]))});function dc(n,e,t,i,s){const r=e.position.y-i/2,o=10,a=new Float32Array(o*3),l=[];for(let u=0;u<o;u++){const p=u*2.4,f=s*(.25+.7*(u*37%10)/10);a[u*3]=e.position.x+Math.cos(p)*f,a[u*3+1]=r+u*.31%1*i,a[u*3+2]=Math.sin(p)*f,l.push(.012+u*13%7*.004)}const c=new _t;c.setAttribute("position",new Ct(a,3));const h=new v0(c,new Dc({color:16773828,size:.0035,transparent:!0,opacity:.8,depthWrite:!1}));h.name="Beer bubbles",n.add(h),n.userData.pour={liquid:e,head:t,bottom:r,height:i,headHeight:t.geometry.parameters.height,bubbles:h,rise:l}}function J_(n,e){const t=n.pour,i=n.portion,s=t.bottom+t.height*i;t.liquid.scale.y=Math.max(.001,i),t.liquid.position.y=t.bottom+t.height*i/2,t.head.visible=i>.03,t.head.scale.y=.55+.45*i,t.head.position.y=s+t.headHeight*t.head.scale.y/2;const r=t.bubbles.geometry.attributes.position;t.bubbles.visible=i>.05;for(let o=0;o<r.count;o++){let a=r.getY(o)+t.rise[o]*e*(i>.1?1:.3);a>s&&(a=t.bottom+(a-s)%Math.max(.005,s-t.bottom)),r.setY(o,a)}r.needsUpdate=!0}function Rh(n,{held:e=!1}={}){const t=new Xt;t.name="Minato drink · "+n;const i=new St({color:14674148,roughness:.08,metalness:0,transparent:!0,opacity:.42,depthWrite:!1}),s=new St({color:14259230,roughness:.3,emissive:4860418,emissiveIntensity:.25}),r=new St({color:16512486,roughness:.9}),o=(l,c,h=0,u=0,p=0)=>{const f=new ut(l,c);return f.position.set(u,h,p),t.add(f),f},a=new Xt;if(t.add(a),t.userData.level=a,n==="draft"){o(new Je(.045,.042,.15,20),i,.075);const l=new ut(new Je(.041,.039,.12,20),s);l.position.y=.063,a.add(l);const c=new ut(new Je(.043,.041,.025,20),r);c.position.y=.135,a.add(c),dc(t,l,c,.12,.036);const h=o(new sn(.03,.007,8,16,Math.PI),i,.08,.05);h.rotation.z=-Math.PI/2}else if(n==="bottle"){const l=new St({color:5910032,roughness:.25,transparent:!0,opacity:.48,depthWrite:!1});if(!e){o(new Je(.038,.038,.2,18),l,.1,-.06),o(new Je(.013,.036,.08,14),l,.24,-.06),o(new Je(.034,.034,.05,18),new St({color:15921384,roughness:.6}),.1,-.06);const p=new ut(new Je(.034,.034,.185,18),s);p.position.set(-.06,.095,0),a.add(p)}const c=e?0:.05;o(new Je(.03,.027,.09,16),i,.045,c);const h=new ut(new Je(.027,.025,.07,16),s);h.position.set(c,.037,0),a.add(h);const u=new ut(new Je(.028,.027,.012,16),r);u.position.set(c,.078,0),a.add(u),dc(t,h,u,.07,.022)}else if(n==="can")o(new Je(.033,.033,.122,20),new St({color:15921902,roughness:.35,metalness:.55}),.061),o(new Je(.0335,.0335,.045,20),new St({color:1986460,roughness:.4,metalness:.4}),.07),o(new Je(.0336,.0336,.008,20),new St({color:13120042,roughness:.4}),.095);else if(n==="coffee"){const l=new St({color:16052714,roughness:.35});o(new Je(.036,.028,.07,20,1,!0),new St({color:16052714,roughness:.35,side:2}),.035),o(new Je(.028,.028,.004,20),l,.002);const c=o(new sn(.017,.005,8,14,Math.PI),l,.04,.038);c.rotation.z=-Math.PI/2,e||o(new Je(.062,.055,.008,24),l,-.004);const h=new ut(new Je(.033,.028,.055,20),new St({color:2823690,roughness:.15}));h.position.y=.03,a.add(h)}else{o(new Je(.036,.032,.11,18),i,.055);const l=new ut(new Je(.033,.03,.085,18),new St({color:n==="mugicha"?11036714:8011544,roughness:.25,transparent:!0,opacity:n==="mugicha"?.78:.85}));l.position.y=.045,a.add(l);for(let c=0;c<3;c++){const h=new ut(new wt(.022,.022,.022),i);h.position.set((c-1)*.012,.08,c%2*.01),h.rotation.set(c,c*.7,0),a.add(h)}}return t.userData.portion=1,t.userData.targetPortion=1,t.userData.consumable="drink",t.userData.rimHeight=n==="draft"?.15:n==="bottle"?.09:n==="can"?.122:n==="coffee"?.07:.11,t.traverse(l=>{l.isMesh&&(l.castShadow=!1,l.receiveShadow=!0)}),t}function Ch(n){const e=new Xt;e.name="Minato dish · "+n;const t=a=>new St({color:a,roughness:.6}),i=(a,l,c=0,h=0,u=0,p=e)=>{const f=new ut(a,l);return f.position.set(c,h,u),p.add(f),f},s=new Xt;e.add(s),e.userData.level=s;const r=(a,l,c=3102834)=>i(new wt(a,.014,l),t(c),0,.007),o=(a,l,c=15854816)=>i(new Je(a,a*.7,l,16,1,!0),new St({color:c,roughness:.35,side:2}),0,l/2);if(n==="yakitori"||n==="hokke")if(r(.26,.12,15854816),n==="yakitori")for(let a=0;a<4;a++){i(new wt(.22,.006,.006),t(10513474),0,.02,-.04+a*.027,s);for(let l=0;l<4;l++)i(new wt(.03,.024,.024),t(a%2?8142619:14267002),-.07+l*.045,.028,-.04+a*.027,s)}else{const a=i(new wt(.2,.025,.08),t(11565637),0,.027,0,s);a.rotation.y=.1,i(new Mt(.018,8,6),t(15917914),.09,.03,.04,s)}else if(n==="sashimi"){r(.24,.16,15854816);for(let a=0;a<6;a++)i(new wt(.04,.018,.1),t([15370844,10366005,15721426][a%3]),-.08+a*.032,.024,0,s).rotation.y=.25;i(new Mt(.015,8,6),t(8231749),.1,.025,.05,s)}else if(n==="edamame"||n==="karaage"){o(.07,.045,3102834);for(let a=0;a<(n==="edamame"?9:6);a++){const l=a*2.3,c=.035*(a%3/2+.3);i(n==="edamame"?new wt(.045,.014,.018):new Mt(.022,8,6),t(n==="edamame"?8231749:12088366),Math.cos(l)*c,.045,Math.sin(l)*c,s).rotation.y=l}}else if(n==="oden"||n==="agedashi"||n==="ochazuke"||n==="ramen"||n==="rice")if(o(.075,.06,n==="ochazuke"?3102834:9067066),i(new Je(.068,.068,.004,16),t(n==="ochazuke"?12034908:11039535),0,.045,0,s),n==="oden")i(new Je(.025,.025,.03,12),t(14930854),-.025,.05,0,s),i(new Mt(.02,8,6),t(12159562),.025,.052,.01,s);else if(n==="agedashi")for(let a=0;a<2;a++)i(new wt(.04,.03,.04),t(14132570),-.02+a*.04,.05,0,s);else if(n==="ramen"||n==="rice")for(let a=0;a<6;a++)i(new Mt(.016,8,6),t(15257466),(a%3-1)*.025,.052,Math.floor(a/3)*.025-.012,s);else i(new wt(.05,.004,.05),t(2042402),0,.05,0,s);else if(n==="hiyayakko")r(.12,.12,3102834),i(new wt(.07,.04,.07),t(15854816),0,.035,0,s),i(new wt(.02,.01,.02),t(14267226),0,.06,0,s);else if(n==="gyoza"){r(.22,.12,15854816);for(let a=0;a<6;a++)i(new Mt(.024,8,6),t(14267002),-.08+a*.032,.022,0,s).scale.set(.8,.6,1.4)}else{r(.2,.1,15854816);for(let a=0;a<4;a++)i(new wt(.035,.035,.06),t(15780170),-.06+a*.04,.03,0,s)}return j_(e,n),e.userData.portion=1,e.userData.targetPortion=1,e.userData.consumable="food",e.traverse(a=>{a.isMesh&&(a.castShadow=!1,a.receiveShadow=!0)}),e}function an(n,e,{immediate:t=!1}={}){const i=ke.clamp(Number(e)||0,0,1);n.userData.targetPortion=i,t&&(n.userData.portion=i,Di(n,0))}function Di(n,e){const t=n.userData,i=t.level;if(!i)return;const s=t.targetPortion??1,r=t.portion??1;if(t.portion=Math.abs(r-s)<.001?s:ke.damp(r,s,7,Math.max(0,e)),i.visible=t.portion>0,K_(n),t.consumable==="food"){const o=i.children.length*t.portion;i.children.forEach((a,l)=>{a.visible=l<Math.ceil(o),a.scale.setScalar(Math.min(1,Math.max(0,o-l)))})}else if(t.pour){i.scale.y=1,J_(t,e);for(const o of i.children)o!==t.pour.liquid&&o!==t.pour.head&&(o.userData.baseY??=o.position.y,o.scale.y=Math.max(.001,t.portion),o.position.y=o.userData.baseY*t.portion)}else i.scale.y=Math.max(.001,t.portion)}function Z_(n){const e=new Xt;e.userData.food=!0,e.userData.consumable="food",e.userData.portion=1,e.userData.targetPortion=1;const t=new St({color:13214315,roughness:.6});for(const r of[-.008,.008]){const o=new ut(new wt(.005,.005,.16),t);o.position.set(r,.02,.04),e.add(o)}const i=new Xt;e.add(i),e.userData.level=i;const s=new ut(new Mt(.018,8,6),new St({color:n==="edamame"?8231749:n==="sashimi"?15370844:14267002,roughness:.6}));return s.position.set(0,.04,.1),i.add(s),e}function Wo(n){if(!n)return;n.removeFromParent();const e=new Set;n.traverse(t=>{if(t.isMesh||t.isSprite){t.isMesh&&t.geometry.dispose();for(const i of Array.isArray(t.material)?t.material:[t.material])e.add(i)}}),e.forEach(t=>t.dispose())}function Uv({room:n,getNao:e,blocked:t,say:i=()=>{}}){let s=null,r=null,o=null,a=0;function l(d){if(d)for(const v of["playerService","heldItem","socialPose","carrying"])delete d.userData[v]}function c(d,v,b){for(;v.length;){const[_,E]=v[0],w=_-d.position.x,R=E-d.position.z,I=Math.hypot(w,R);if(I<.03){v.shift();continue}const S=Math.atan2(-w,-R),x=Math.atan2(Math.sin(S-d.rotation.y),Math.cos(S-d.rotation.y));if(d.rotation.y+=Math.max(-b*5,Math.min(b*5,x)),Math.abs(x)<.9){const A=Math.min(I,b*1.15*(1-Math.abs(x)/1.2));d.position.x+=w/I*A,d.position.z+=R/I*A}return!1}return!0}const h=d=>{d&&(d.prop.removeFromParent(),d.prop.traverse(v=>{v.isMesh&&(v.geometry.dispose(),v.material.dispose?.())}))};function u(){h(r),r=null}function p(){h(o),o=null}const f=(d,v,b)=>{d.rotation.y=Math.atan2(-(v-d.position.x),-(b-d.position.z))},g=()=>[xo[0],xo[2]];function y(d,v){if(Zn[d]){u();const b=Rh(d);b.position.set(...v.table),n.add(b),r={kind:d,left:Zn[d].sips,prop:b}}else{p();const b=Ch(d);b.position.set(...v.dish||v.table),n.add(b),o={kind:d,left:wi[d].bites,prop:b}}a++}function m(d,v){d.left=Math.max(0,d.left-1),an(d.prop,d.left/v)}return{get pending(){return s?{kind:s.kind,phase:s.phase}:null},get drink(){return r?{kind:r.kind,left:r.left,sips:Zn[r.kind].sips}:null},get dish(){return o?{kind:o.kind,left:o.left,bites:wi[o.kind].bites}:null},get served(){return a},order(d,v){const b=Mo(d),_=e();if(!b||!v||s||!_)return!1;const E=!!wi[d];return s={kind:d,seat:v,phase:E?"cooking":"pouring",timer:E?b.cook:b.pour,path:E?[[uc[b.station][0],uc[b.station][2]]]:null},_.userData.playerService=!0,_.userData.socialPose="Use",_.userData.activity=E?"cooking "+b.en+" for you":"pouring "+b.en.toLowerCase()+" for you",!0},sip(){if(!r||r.left<=0)return null;r.left=Math.max(0,r.left-1);const d=Zn[r.kind];r.prop.userData.level,an(r.prop,r.left/d.sips);const v={kind:r.kind,left:r.left,alcohol:d.alcohol/d.sips};if(r.left===0){const b=r;setTimeout(()=>{r===b&&u()},1500)}return v},bite(){if(!o||o.left<=0)return null;m(o,wi[o.kind].bites);const d={kind:o.kind,left:o.left};if(o.left===0){const v=o;setTimeout(()=>{o===v&&p()},2500)}return d},serveNow(d,v){return!Mo(d)||!v?.table?!1:(y(d,v),!0)},update(d){if(r&&Di(r.prop,d),o&&Di(o.prop,d),!s)return;const v=e();if(!v){s=null;return}const b=Mo(s.kind),{seat:_}=s;if(s.phase==="cooking"){if(s.path.length){delete v.userData.socialPose,c(v,s.path,d);return}v.userData.socialPose="Use",(s.timer-=d)<=0&&(s.path=[..._.counter?[]:[g()],..._.route].map(E=>[...E]),s.phase="carrying",v.userData.heldItem="tray",delete v.userData.socialPose,v.userData.carrying=!0,v.userData.activity="bringing your "+b.en.replace(/^(a|an|the) /,""))}else if(s.phase==="pouring")v.userData.socialPose="Use",(s.timer-=d)<=0&&(s.path=_.route.map(E=>[...E]),s.phase="carrying",v.userData.heldItem=s.kind==="oolong"?"tea":"beer",delete v.userData.socialPose,v.userData.carrying=!0,v.userData.activity="bringing your drink");else if(s.phase==="carrying"){delete v.userData.socialPose;const E=Zn[s.kind]?_.table:_.dish||_.table;c(v,s.path,d)&&(f(v,E[0],E[2]),s.phase="placing",s.timer=1.1,v.userData.socialPose="CarryIdle")}else s.phase==="placing"?(s.timer-=d)<=0&&(y(s.kind,_),delete v.userData.heldItem,delete v.userData.carrying,v.userData.socialPose="Greet",i("Nao: "+b.line,4),s.phase="bowing",s.timer=.9):s.phase==="bowing"?(s.timer-=d)<=0&&(delete v.userData.socialPose,s.path=[..._.route.slice(0,-1).reverse(),g()].map(E=>[...E]),s.phase="returning",v.userData.activity="back to the counter"):s.phase==="returning"&&(delete v.userData.socialPose,c(v,s.path,d)&&(v.rotation.set(0,Math.PI,0),l(v),s=null))},clear(){const d=e();s&&d&&(d.position.set(...xo),d.rotation.set(0,Math.PI,0),l(d)),s=null,u(),p()},place(d,v){y(d,v)}}}const $_=new P,Ph="johansson-town-avatar";function Q_(n=globalThis.localStorage){try{const e=n?.getItem(Ph);if(e){const t=ra(e);if(t)return{...t,outfit:$c("Johansson",t.outfit)}}}catch{}return zo.Johansson}function ey(n,e=globalThis.localStorage){const t=nh({...n,outfit:$c("Johansson",n.outfit)});try{e?.setItem(Ph,t)}catch{}return t}const ty=.2,ny=["Wake","Sit","Type","Eat","Drink","Sleep","Soak"];function Fv(){try{const n=new URL(location.href),e=n.searchParams.get("avatar");if(!e)return null;const t=ra(e);return n.searchParams.delete("avatar"),history.replaceState(history.state,"",n.href),t&&ey(t),t}catch{return null}}function Ov(n,e,{shadows:t=!1}={}){const i=T_(e),s=Fo(i,{shadows:t,faceSize:e==="Thuan"?512:256});for(const r of n.children)r.visible=!1;return n.add(s.root),n.userData.visualReady=!0,n.userData.visualSource="Shimanchu · "+(i.name||e),{isAvatar:!0,avatar:s,animator:Go(s,{lively:!0}),entity:n,model:s.root,mixer:null,actions:new Map,current:null,last:n.position.clone(),gestureTime:0,speed:0,moving:!1,wasVisible:!0,height:s.height,isThuan:e==="Thuan",outfit:"clothes"}}function Bv(n,e,t=performance.now()){const{entity:i,avatar:s}=n,r=i.userData;let o=!0;for(let _=i;_;_=_.parent)if(!_.visible){o=!1;break}if(!o){n.last.copy(i.position),n.speed=0,n.moving=!1,n.wasVisible=!1;return}const a=Math.hypot(i.position.x-n.last.x,i.position.z-n.last.z);n.last.copy(i.position);const l=!n.wasVisible||a>1;n.wasVisible=!0;const c=l||Number.isFinite(r.chairBlend)?0:a/Math.max(e,.001);n.speed=ke.damp(n.speed,c,20,e),n.moving=n.speed>(n.moving?.03:.07),n.gestureTime=Math.max(0,n.gestureTime-e);const h=r.outfit==="swim"?"swim":n.isThuan?r.alternativeOutfit||"clothes":r.outfit||"clothes";n.outfit!==h&&(s.wear(h),n.outfit=h);const u=!r.hatOff;n.hatOn!==u&&(s.setHat?.(u),n.hatOn=u);const p=!!(r.playerControlled&&n.isThuan),f=!p&&(Number.isFinite(r.seatHeight)&&ny.includes(r.socialPose)||Number.isFinite(r.chairBlend)&&r.chairBlend>.5),g=r.thuanMood,y=r.lineFeeling,m=g&&g.until>t?g.expression:y&&y.until>t?y.expression:null,d=!!(r.playerConversation||r.chat||n.gestureTime),v=Number(r.sleepBlend)>.28||r.sleeping&&!r.roomTransition;n.animator.update(e,{speed:n.moving?n.speed:0,running:n.speed>3.2,seated:f,seatHeight:r.seatHeight,floorHeight:(Number(r.floorHeight)||0)+(r.socialPose==="CounterIdle"?ty:0),pose:r.socialPose,seat:r.socialPose,driving:!!r.inVehicle,riding:p,ridePhase:r.bicyclePhase||0,bicycleFit:r.bicycleFit,carrying:!!r.carrying,heldProp:n.heldProp,waving:!!(r.chat?.greeting||n.gestureTime>0&&!n.waved),talking:!!(r.chat?.speaking||r.speakingUntil>t),expression:r.thuanExpression||m||(d?"smile":"neutral"),sleeping:v,gaze:Array.isArray(r.lookTarget)?r.lookTarget:null,consumeElapsed:r.consumeElapsed,tipsy:r.tipsy||0}),Cg(i.getWorldPosition($_),n.isThuan)?(s.springs?.update(e),n.swingResting=!1):n.swingResting||(s.springs?.reset(),n.swingResting=!0);const b=r.heldItem||(["Drink","DrinkStanding"].includes(r.socialPose)?"beer":r.socialPose==="Eat"?"rice":null);if(n.heldKind!==b){Wo(n.heldProp),Wo(n.dishProp),n.heldProp=null,n.dishProp=null,n.heldKind=b,n.portion=1,n.consumedCycle=-1;const _={beer:"draft",tea:"oolong",cup:"oolong",coffee:"coffee",mugicha:"mugicha",can:"can",bottle:"bottle",draft:"draft",oolong:"oolong",awamori:"awamori",sake:"sake"},E=["rice","bun","ramen","fish","yakitori","gyoza","edamame","sashimi","oden","hiyayakko","dashimaki","agedashi","karaage","ochazuke","chopsticks"];_[b]?n.heldProp=Rh(_[b],{held:!0}):E.includes(b)&&(n.heldProp=Z_(b),b!=="bun"&&b!=="chopsticks"&&(n.dishProp=Ch(b==="fish"?"hokke":b),n.dishProp.userData.food=!0,s.bones.handL.add(n.dishProp))),n.heldProp&&s.bones.handR.add(n.heldProp),n.heldProp&&Number.isFinite(r.heldPortion)&&an(n.heldProp,r.heldPortion,{immediate:!0}),n.dishProp&&Number.isFinite(r.foodPortion)&&an(n.dishProp,r.foodPortion,{immediate:!0})}if(n.heldProp){const _=n.animator.consumption;_&&!Number.isFinite(r.heldPortion)&&_.swallow>.5&&n.consumedCycle!==_.cycle&&(n.consumedCycle=_.cycle,n.portion=Math.max(0,n.portion-(_.food?.25:1/6)),an(n.heldProp,_.food?0:n.portion),n.dishProp&&an(n.dishProp,n.portion)),Number.isFinite(r.heldPortion)?an(n.heldProp,r.heldPortion):_?.food&&_.swallow===0&&n.portion>0&&an(n.heldProp,1),Di(n.heldProp,e),yr(s,n.heldProp,_?.lift||0),n.dishProp&&(Number.isFinite(r.foodPortion)&&an(n.dishProp,r.foodPortion),Di(n.dishProp,e),yr(s,n.dishProp,0,"L"))}n.gestureTime>0?n.waved=!0:n.waved=!1}function zv(n,e=new P){const t=n.avatar.bones.head,i=n.avatar.measure;return t.getWorldPosition(e),e.y+=(i.headCentre-i.headY)*.95,e}function Hv({scene:n,recipe:e=Q_()}={}){const t=new Xt;t.name="Johansson (third person)",t.visible=!1,n.add(t);let i=Fo(e,{shadows:!0,faceSize:512}),s=Go(i);t.add(i.root);let r="neutral",o=0,a=0,l=0,c="Sit",h="clothes",u=null,p=null,f=null;const g=()=>i.bones.handR,y={root:t,loading:Promise.resolve(!0),get ready(){return!0},get move(){return f},get expression(){return r},get weights(){return{}},get actions(){return[...Object.keys(Ci),"Idle","Walk","Run","Sit","SitEat","Soak","Fall"]},get avatar(){return i},play(m,{face:d}={}){f=m,d&&y.express(d,3);const v={Bow:"Bow",Wave:"Wave"};s.play(v[m]||m)||s.play("Nod");const b={Wave:"happy",Clap:"happy",Kachashi:"laugh",Laugh:"laugh",Think:"thinking",Shrug:"worried",HeadShake:"grumpy",Bow:"content",Nod:"content",Stretch:"content",LookAround:"surprised",SitToast:"happy",Heart:"happy",Peace:"laugh",Coy:"smile",Tada:"laugh",HandsOnHips:"content",HeelKick:"happy"};b[m]&&y.express(b[m],(Ci[m]===1/0?4:Ci[m]||2)+.6)},express(m,d=3){r=m,o=d>0?l+d:0},speak(m=2){a=Math.max(a,l+m)},lookAt(m){p=m?m.clone?.()||m:null},seat(m="Sit"){c=m},wear(m){h=m==="swim"?"swim":"clothes",i.wear(h)},get outfit(){return h},get lens(){const m=i.measure;return{eye:m.H+.14,side:m.Rh*m.headSX+.26,head:m.headCentre}},get sitHip(){const m=i.measure;return m.hipY+.09-m.seatDrop},hold(m){u&&(u.userData.consumable?Wo(u):u.removeFromParent()),u=m||null,u&&(u.position.set(0,-i.measure.hand*.4,i.measure.hand*.6),g().add(u),u.userData.consumable&&yr(i,u))},jump(){s.play("Jump")},stop(){s.stop(),f=null},setRecipe(m){const d=Ut(m);i.root.removeFromParent(),i.dispose(),i=Fo(d,{shadows:!0,faceSize:512}),s=Go(i),t.add(i.root),i.wear(h),u&&g().add(u)},update(m,d={}){if(l+=m,t.visible=!!d.visible,o&&l>o&&(r="neutral",o=0),s.gesture||(f=null),s.update(m,{speed:d.speed||0,running:!!d.running,seated:!!d.seated,seatHeight:d.seated?i.measure.hipY-i.measure.seatDrop:void 0,seat:c,airborne:!!d.airborne,talking:l<a,expression:r,gaze:p,heldProp:u,tipsy:d.tipsy||0}),d.seated&&(i.root.position.y=0),t.visible&&i.springs?.update(m),u?.userData.consumable){const v=s.consumption;v&&u.userData.finishPortion!==void 0&&an(u,ke.lerp(u.userData.startPortion,u.userData.finishPortion,v.swallow)),Di(u,m),yr(i,u,v?.lift||0)}}};return y}export{Mh as $,ke as A,On as B,Ue as C,Yy as D,Wc as E,Ke as F,Xt as G,Gy as H,Xc as I,Yc as J,Fy as K,yy as L,qo as M,Un as N,xc as O,ps as P,rt as Q,dy as R,Uy as S,qc as T,sy as U,tt as V,ky as W,he as X,fy as Y,Mt as Z,C_ as _,Bt as a,Lc as a$,A_ as a0,sv as a1,sn as a2,ur as a3,hr as a4,ay as a5,v0 as a6,bv as a7,ug as a8,Ly as a9,$n as aA,Wo as aB,an as aC,Rh as aD,Ch as aE,Di as aF,Oi as aG,qy as aH,cg as aI,Hy as aJ,Ni as aK,Wy as aL,vl as aM,jy as aN,f0 as aO,_y as aP,vy as aQ,gy as aR,my as aS,py as aT,Dc as aU,xn as aV,y0 as aW,ct as aX,tr as aY,rv as aZ,Oy as a_,Bg as aa,P_ as ab,Mv as ac,oc as ad,Tv as ae,la as af,ry as ag,$y as ah,Qy as ai,pt as aj,Zy as ak,ev as al,Go as am,Ci as an,Ut as ao,Co as ap,Wl as aq,zo as ar,jm as as,Iy as at,xr as au,Xy as av,To as aw,Cc as ax,p0 as ay,hg as az,Fo as b,Ov as b$,By as b0,Wt as b1,Zo as b2,Dl as b3,Ic as b4,Ay as b5,Ry as b6,or as b7,Pt as b8,fr as b9,gh as bA,Vy as bB,wy as bC,Sy as bD,Ny as bE,uy as bF,Eh as bG,Lg as bH,Ig as bI,$c as bJ,Qn as bK,ov as bL,nh as bM,ra as bN,gv as bO,mv as bP,g_ as bQ,fv as bR,Fn as bS,y_ as bT,Li as bU,Pg as bV,ms as bW,av as bX,pv as bY,Jn as bZ,lv as b_,dr as ba,Tr as bb,Qe as bc,wr as bd,Mn as be,Cy as bf,Py as bg,Jy as bh,Rr as bi,p_ as bj,xv as bk,_v as bl,yv as bm,Dy as bn,cv as bo,zy as bp,Ko as bq,wi as br,Zn as bs,kv as bt,dv as bu,F_ as bv,qn as bw,m_ as bx,_h as by,Dv as bz,Iv as c,Bv as c0,vv as c1,Sv as c2,uv as c3,k_ as c4,Bi as c5,Pv as c6,Cv as c7,Rv as c8,Av as c9,ey as cA,Nv as ca,Ev as cb,Mo as cc,cy as cd,zv as ce,$0 as cf,Ge as cg,My as ch,Sc as ci,Ey as cj,xy as ck,vc as cl,ly as cm,iy as cn,wv as co,Fv as cp,Rc as cq,Ky as cr,hy as cs,rr as ct,Hv as cu,Uv as cv,tv as cw,Lv as cx,Z_ as cy,hv as cz,iv as d,nv as e,Ct as f,He as g,P as h,St as i,ut as j,wt as k,zc as l,nr as m,_t as n,Je as o,Q_ as p,rn as q,T_ as r,Nc as s,oy as t,M0 as u,Ei as v,vt as w,Mr as x,Ty as y,by as z};
