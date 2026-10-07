import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { transform as compile } from '@astrojs/compiler';
import { transform } from 'esbuild';
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(join(dir,entry.name)):[join(dir,entry.name)]);
mkdirSync('.quality/templates',{recursive:true});
for(const file of walk('src').filter(file=>file.endsWith('.astro'))){
  const result=await compile(readFileSync(file,'utf8'),{filename:file});
  try{await transform(result.code,{loader:'ts',format:'esm'});}catch(error){
    const output='.quality/templates/'+file.replaceAll('/','-')+'.ts';
    writeFileSync(output,result.code);
    for(const problem of error.errors||[]){const line=problem.location?.line||1;console.error(`${file}: ${problem.text}\n${result.code.split('\n').slice(Math.max(0,line-2),line+1).join('\n')}`);}
    throw error;
  }
}
console.log('Every Astro template compiles to valid JavaScript.');
