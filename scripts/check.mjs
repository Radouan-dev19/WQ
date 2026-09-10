import { readFile, readdir, access } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const directory=new URL('../dist/',import.meta.url);
for(const file of await readdir(directory)){
  const source=await readFile(new URL(file,directory),'utf8');
  if(file.endsWith('.js')){
    const result=spawnSync(process.execPath,['--check',fileURLToPath(new URL(file,directory))],{encoding:'utf8'});
    if(result.status!==0)throw new Error(result.stderr);
  }
  if(file.endsWith('.webmanifest'))JSON.parse(source);
  if(file.endsWith('.html'))for(const match of source.matchAll(/(?:href|src)="(\.\/[^"#]+)"/g))await access(new URL(match[1],directory));
}
const {questions}=await import('../dist/questions.js');
if(questions.length!==12||new Set(questions.map(q=>q.id)).size!==12)throw new Error('Le jeu doit contenir 12 questions uniques.');
console.log('Entrée HTML, fichiers locaux, JavaScript, manifeste et questions : OK.');
