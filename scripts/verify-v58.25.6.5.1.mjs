#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), 'utf8') : '';
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };
const requireNotIncludes = (rel, text) => { if (read(rel).includes(text)) failures.push(`Did not expect '${text}' in ${rel}`); };

const expectedVersion = '58.25.6.5.1-boards-table-typecheck-fix';
const expectedRelease = 'v58.25.6.5.1 Boards Table Typecheck Fix';

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== expectedVersion) failures.push('package version must be v58.25.6.5.1');
if ((pkg.scripts ?? {})['verify:current'] !== 'npm run verify:v58.25.6.5.1') failures.push('verify:current must target verify:v58.25.6.5.1');
if ((pkg.scripts ?? {})['verify:v58.25.6.5.1'] !== 'node scripts/verify-v58.25.6.5.1.mjs') failures.push('verify:v58.25.6.5.1 script missing');

requireFile('docs/release/V58_25_6_5_1_BOARDS_TABLE_TYPECHECK_FIX.md');
requireFile('docs/qa/FLOWTASK_V58_25_6_5_1_BOARDS_TABLE_TYPECHECK_FIX_QA.md');

requireIncludes('src/lib/release/version.ts', expectedVersion);
requireIncludes('src/lib/release/version.ts', expectedRelease);

requireIncludes('src/components/boards/board-element.tsx', 'const table = element;');
requireIncludes('src/components/boards/board-element.tsx', 'return table.rowStyles?.[rowId]?.backgroundColor;');
requireIncludes('src/components/boards/board-element.tsx', 'handleClick();');
requireNotIncludes('src/components/boards/board-element.tsx', 'handleClick(event);');

requireIncludes('src/components/boards/board-share-view.tsx', 'onResolveTableFormula={() => undefined}');
requireIncludes('src/components/boards/board-share-view.tsx', 'onSelectTableRange={() => undefined}');
requireIncludes('src/components/boards/board-share-view.tsx', 'onAutofillTableFromCell={() => undefined}');

requireIncludes('src/lib/boards/table-tools.ts', 'if (selection.type === "row") return selection.rowId === id;');
requireIncludes('src/lib/boards/table-tools.ts', 'if (selection.type === "column") return selection.columnId === id;');

if (failures.length) {
  console.error('[verify:v58.25.6.5.1] FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('[verify:v58.25.6.5.1] OK — Boards table typecheck fix aligned.');
