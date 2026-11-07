// Bundle the character system only; Three.js is shared with World and no game simulation is imported.
import {createRequire} from 'node:module';
import {resolve} from 'node:path';
const root=resolve(new URL('../..',import.meta.url).pathname),require=createRequire(process.env.PORT_BUILD_PACKAGE||resolve(root,'johansson-town/package.json')),esbuild=require('esbuild');
await esbuild.build({entryPoints:[resolve(root,'assets/js/office-port-live.source.js')],outfile:resolve(root,'assets/js/office-port-live.js'),bundle:true,format:'esm',target:['es2022'],minify:true,metafile:true,plugins:[{name:'shared-three',setup(build){build.onResolve({filter:/three\.module\.js$/},()=>({path:'/johansson-town/vendor/three.module.js',external:true}));}}]});
