#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd();
const failures=[];
const read=(rel)=>fs.existsSync(path.join(root,rel))?fs.readFileSync(path.join(root,rel),'utf8'):'';
const requireIncludes=(rel,text)=>{ if(!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`)};
const requireFile=(rel)=>{ if(!fs.existsSync(path.join(root,rel))) failures.push(`Missing required file: ${rel}`)};
const pkg=JSON.parse(read('package.json'));
if(pkg.version!=='58.25.5.1-records-metric-text-overflow-fix') failures.push('package version must be v58.25.5.1');
if((pkg.scripts??{})['verify:current']!=='npm run verify:v58.25.5.1') failures.push('verify:current must target verify:v58.25.5.1');
if((pkg.scripts??{})['verify:v58.25.5.1']!=='node scripts/verify-v58.25.5.1.mjs') failures.push('verify:v58.25.5.1 script missing');
requireFile('docs/release/V58_25_5_1_RECORDS_METRIC_TEXT_OVERFLOW_FIX.md');
requireFile('docs/qa/FLOWTASK_V58_25_5_1_RECORDS_METRIC_TEXT_OVERFLOW_FIX_QA.md');
requireIncludes('src/lib/release/version.ts','58.25.5.1-records-metric-text-overflow-fix');
requireIncludes('src/components/clients/client-manager-panel.tsx','grid grid-cols-[36px_minmax(0,1fr)] items-start gap-3');
requireIncludes('src/components/clients/client-manager-panel.tsx','whitespace-normal break-words text-[11px]');
requireIncludes('src/components/clients/client-manager-panel.tsx','tracking-[0.12em]');
if(failures.length){
 console.error('[verify:v58.25.5.1] FAIL');
 failures.forEach(f=>console.error('- '+f));
 process.exit(1);
}
console.log('[verify:v58.25.5.1] OK — Records metric text overflow fix aligned.');
