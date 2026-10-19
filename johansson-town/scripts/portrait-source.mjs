/** One portrait fingerprint for rendering, metadata sync and Studio validation. */
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

export async function portraitSourceHash(root,files,guideText){
 const directory=root instanceof URL?fileURLToPath(root):root,hash=createHash('sha256');
 for(const path of files)hash.update(path+'\0').update(path==='guide/residents.json'&&guideText!==undefined?guideText:await readFile(resolve(directory,path))).update('\0');
 return hash.digest('hex');
}
