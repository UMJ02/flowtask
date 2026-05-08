#!/usr/bin/env node
import fs from 'node:fs';
const failures = [];
function read(file){ if(!fs.existsSync(file)){ failures.push(`Missing ${file}`); return ''; } return fs.readFileSync(file,'utf8'); }
function mustInclude(file, marker, label=marker){ if(!read(file).includes(marker)) failures.push(`${file} must include ${label}`); }
function mustNotInclude(file, marker, label=marker){ if(read(file).includes(marker)) failures.push(`${file} must not include ${label}`); }
function mustNotExist(path){ if(fs.existsSync(path)) failures.push(`${path} must not exist in release package`); }
mustInclude('package.json','"version": "58.20-task-workspace-inline-redesign"','v58.20 package version');
mustInclude('package.json','"verify:current": "npm run verify:v58.20"','current verifier target');
mustInclude('package.json','"verify:v58.20": "node scripts/verify-v58.20.mjs"','v58.20 verifier script');
mustInclude('package-lock.json','"version": "58.20-task-workspace-inline-redesign"','lockfile version');
mustInclude('src/lib/release/version.ts','58.20-task-workspace-inline-redesign','runtime version');
mustInclude('src/lib/release/version.ts','v58.20 Task Workspace Inline Redesign','runtime release name');
mustInclude('README.md','v58.20 Task Workspace Inline Redesign','README release title');
mustInclude('src/app/(app)/app/tasks/[id]/page.tsx','TaskWorkspaceInline','task detail renders new inline workspace');
mustInclude('src/app/(app)/app/tasks/[id]/edit/page.tsx',"queryString.set('mode', 'edit')",'edit route redirects into inline mode');
mustInclude('src/components/tasks/task-workspace-inline.tsx','setMode("edit")','inline edit mode state');
mustInclude('src/components/tasks/task-workspace-inline.tsx','saveInline','inline save handler');
mustInclude('src/components/tasks/task-workspace-inline.tsx','TaskQuickCommentsCard','feed composer present');
mustInclude('src/components/tasks/task-workspace-inline.tsx','Información','simple contextual sidebar');
mustNotInclude('src/app/(app)/app/tasks/[id]/page.tsx','TaskDetailSummary','old summary hero removed');
mustNotInclude('src/app/(app)/app/tasks/[id]/page.tsx','Bitácora completa','old separate log card removed');
mustInclude('src/components/tasks/task-checklist-card.tsx','const pct = items.length ? Math.round((done / items.length) * 100) : 0;','empty checklist starts at 0%');
mustNotInclude('src/components/tasks/task-checklist-card.tsx','bg-gradient-to-br from-white via-white to-violet-50/70','old pastel checklist card removed');
mustInclude('src/lib/share/analytics-share.ts','function buildXlsx(payload: SharedAnalyticsPayload)','dependency-free XLSX builder preserved');
mustNotInclude('package.json','exceljs','exceljs dependency still absent');
mustInclude('src/components/shared/shared-analytics-landing.tsx','max-w-[1180px]','clean public landing preserved');
mustInclude('src/lib/security/organization-access.ts','PERSONAL_WORKSPACE_VALUE','personal workspace support preserved');
mustInclude('src/lib/queries/workspace.ts','return query.eq("owner_id", userId).is("organization_id", null);','personal scope isolation preserved');
mustInclude('src/lib/queries/workspace.ts','return query.eq("organization_id", organizationId);','organization scope isolation preserved');
mustInclude('docs/releases/RELEASE_NOTES_v58.20.md','Task Workspace Inline Redesign','v58.20 release notes');
mustInclude('docs/qa/FLOWTASK_V58.20_TASK_WORKSPACE_INLINE_QA.md','Aislamiento','v58.20 QA checklist');
if(process.env.FLOWTASK_VERIFY_RELEASE_PACKAGE==='1'){ mustNotExist('.env'); mustNotExist('.env.local'); mustNotExist('node_modules'); mustNotExist('.next'); }
if(failures.length){ console.error('[verify:v58.20] FAIL'); for(const f of failures) console.error(`- ${f}`); process.exit(1); }
console.log('[verify:v58.20] OK — Task Workspace Inline Redesign aligned: same-route edit mode, simple contextual sidebar, checklist-first progress, operational feed, Vercel-safe verification, XLSX/landing and personal/org safeguards preserved.');
