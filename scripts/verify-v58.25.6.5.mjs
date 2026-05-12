#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const exists = (rel) => fs.existsSync(path.join(root, rel));
const read = (rel) => exists(rel) ? fs.readFileSync(path.join(root, rel), 'utf8') : '';
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const expectedVersion = '58.25.6.5-boards-table-spreadsheet-tools-properties-panel-collapse';
const expectedRelease = 'v58.25.6.5 Boards Table Spreadsheet Tools + Properties Panel Collapse';

const pkg = JSON.parse(read('package.json'));
if (pkg.version !== expectedVersion) failures.push('package version must be v58.25.6.5');
if ((pkg.scripts ?? {})['verify:current'] !== 'npm run verify:v58.25.6.5') failures.push('verify:current must target verify:v58.25.6.5');
if ((pkg.scripts ?? {})['verify:v58.25.6.5'] !== 'node scripts/verify-v58.25.6.5.mjs') failures.push('verify:v58.25.6.5 script missing');

requireFile('docs/release/V58_25_6_5_BOARDS_TABLE_SPREADSHEET_TOOLS_PROPERTIES_PANEL_COLLAPSE.md');
requireFile('docs/qa/FLOWTASK_V58_25_6_5_BOARDS_TABLE_SPREADSHEET_TOOLS_PROPERTIES_PANEL_COLLAPSE_QA.md');
requireFile('src/lib/boards/table-tools.ts');

requireIncludes('src/lib/release/version.ts', expectedVersion);
requireIncludes('src/lib/release/version.ts', expectedRelease);

requireIncludes('src/lib/boards/board-types.ts', 'BoardTableSelection');
requireIncludes('src/lib/boards/board-types.ts', 'hiddenRowIds?: string[]');
requireIncludes('src/lib/boards/board-types.ts', 'rowStyles?: Record<string, BoardTableCellStyle>');
requireIncludes('src/lib/boards/board-serialization.ts', 'hiddenRowIds');
requireIncludes('src/lib/boards/board-serialization.ts', 'selectedRange');
requireIncludes('src/lib/boards/board-defaults.ts', 'hiddenColumnIds: []');

requireIncludes('src/lib/boards/table-tools.ts', 'evaluateTableFormula');
requireIncludes('src/lib/boards/table-tools.ts', 'nextAutofillValue');
requireIncludes('src/lib/boards/table-tools.ts', 'visibleColumns');

requireIncludes('src/components/boards/board-element.tsx', 'onResolveTableFormula');
requireIncludes('src/components/boards/board-element.tsx', 'onSelectTableRange');
requireIncludes('src/components/boards/board-element.tsx', 'board-table-context-menu');
requireIncludes('src/components/boards/board-element.tsx', 'board-table-fill-handle');
requireIncludes('src/components/boards/board-element.tsx', 'onAutofillTableFromCell');

requireIncludes('src/components/boards/board-page.tsx', 'resolveTableFormula');
requireIncludes('src/components/boards/board-page.tsx', 'applyTableSelectionColor');
requireIncludes('src/components/boards/board-page.tsx', 'hideTableRow');
requireIncludes('src/components/boards/board-page.tsx', 'autofillTableFromCell');

requireIncludes('src/components/boards/properties-panel.tsx', 'collapsed');
requireIncludes('src/components/boards/properties-panel.tsx', 'Mostrar filas');
requireIncludes('src/components/boards/properties-panel.tsx', 'ChevronLeft');

requireIncludes('src/app/globals.css', 'v58.25.6.5 — Boards Table Spreadsheet Tools + Properties Panel Collapse');
requireIncludes('src/app/globals.css', '.board-table-context-menu');
requireIncludes('src/app/globals.css', '.board-table-fill-handle');
requireIncludes('src/app/globals.css', '.board-inspector-collapsed');

if (failures.length) {
  console.error('[verify:v58.25.6.5] FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('[verify:v58.25.6.5] OK — Boards table spreadsheet tools and properties panel collapse aligned.');
