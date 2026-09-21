import { readFile, writeFile, readdir, unlink } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
// Preserve the published React/Three.js dependencies. The original project did
// not include its source or lockfile; these bounded sections are now editable.
export async function buildCode() {
  let code = await readFile(root + 'vendor/original-runtime.js', 'utf8');
  const sections = [
    ['stockroom', 'var ad=[', 'var Ad={'],
    ['character', 'var Lf=', 'function ep(e,t=0,n=0)'],
    ['scene', 'function Yp(e){', 'var Xp='],
    ['game', 'var Xp=', 'var sm='],
    ['ui', 'typeof window<`u`&&Wf();', null],
  ];
  for (const [name, start, end] of sections) {
    const from = code.lastIndexOf(start);
    const to = end ? code.indexOf(end, from) : code.length;
    if (from < 0 || to < from) throw Error('Missing source boundary: ' + name);
    code = code.slice(0, from) + await readFile(root + `src/${name}.js`, 'utf8') + '\n' + code.slice(to);
  }
  return code;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const code = await buildCode();
  const hash = createHash('sha256').update(code).digest('hex').slice(0, 12);
  const name = `storage-${hash}.js`;
  await writeFile(root + 'assets/' + name, code);
  const html = await readFile(root + 'index.html', 'utf8');
  await writeFile(root + 'index.html', html.replace(/\/thuans-storage\/assets\/(?:ghpages|storage)-[^" ]+\.js/, '/thuans-storage/assets/' + name));
  for (const file of await readdir(root + 'assets')) {
    if (/^storage-.*\.js$/.test(file) && file !== name) await unlink(root + 'assets/' + file);
  }
  console.log(`Built ${name} (${code.length} characters)`);
}
