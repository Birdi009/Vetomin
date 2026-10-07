import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeBase,joinBase,canonicalPath} from '../../src/lib/urls.mjs';
import {readingMinutes} from '../../src/lib/reading.mjs';
for(const base of ['/','/Vetomin','/Vetomin/']) {
 test(`URL joins at ${base}`,()=>{
  const root=base==='/'?'/':'/Vetomin/';
  assert.equal(normalizeBase(base),root);
  for(const path of ['work/','projects/atlas/','media/atlas-after-640.webp','pagefind/pagefind.js','sw.js','manifest.webmanifest','contact/?project=Atlas','#method'])assert.equal(joinBase(path,base),root+path);
  assert.equal(joinBase('',base),root);assert.equal(joinBase('/work/',base),root+'work/');
  assert.equal(canonicalPath(root+'contact/?project=Atlas#form',base),root+'contact/');
 });
}
test('unsafe URL inputs are rejected',()=>{for(const path of ['https://elsewhere.test/','//elsewhere.test/','../work/','%2e%2e/work/','foo\\bar'])assert.throws(()=>joinBase(path,'/Vetomin/'));});
test('reading time is derived from actual words',()=>{assert.equal(readingMinutes(''),1);assert.equal(readingMinutes('word '.repeat(441)),3);assert.equal(readingMinutes('[A link](https://example.test/long/route)'),1);});
