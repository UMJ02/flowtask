#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const failures=[];
const read=(rel)=>fs.existsSync(path.join(root,rel))?fs.readFileSync(path.join(root,rel),'utf8'):'';
const requireIncludes=(rel,text)=>{ if(!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`)};
const requireFile=(rel)=>{ if(!fs.existsSync(path.join(root,rel))) failures.push(`Missing required file: ${rel}`)};
const pkg=JSON.parse(read('package.json'));
if(pkg.version!=='58.25.5-records-spacing-compact-metrics') failures.push('package version must be v58.25.5');
if((pkg.scripts??{})['verify:current']!=='npm run verify:v58.25.5') failures.push('verify:current must target verify:v58.25.5');
if((pkg.scripts??{})['verify:v58.25.5']!=='node scripts/verify-v58.25.5.mjs') failures.push('verify:v58.25.5 script missing');
requireFile('docs/release/V58_25_5_RECORDS_SPACING_COMPACT_METRICS.md');
requireFile('docs/qa/FLOWTASK_V58_25_5_RECORDS_SPACING_COMPACT_METRICS_QA.md');
requireIncludes('src/lib/release/version.ts','58.25.5-records-spacing-compact-metrics');
requireIncludes('src/components/clients/client-manager-panel.tsx','space-y-5 pt-2 md:pt-3');
requireIncludes('src/components/clients/client-manager-panel.tsx','xl:grid-cols-[minmax(0,1fr)_460px]');
requireIncludes('src/components/clients/client-manager-panel.tsx','grid gap-3 sm:grid-cols-3 xl:pt-1');
requireIncludes('src/components/clients/client-manager-panel.tsx','rounded-[18px] border border-slate-200 bg-white px-4 py-4');
requireIncludes('src/components/clients/client-manager-panel.tsx','text-[18px] font-extrabold');
if(failures.length){
 console.error('[verify:v58.25.5] FAIL');
 failures.forEach(f=>console.error('- '+f));
 process.exit(1);
}
console.log('[verify:v58.25.5] OK — Records spacing and compact metrics aligned.');
