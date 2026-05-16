import fs from 'node:fs';

const required = [
  'src/components/workspace-pro/workspace-pro-page.tsx',
  'src/app/globals.css',
  'src/lib/release/version.ts',
];
const failures = [];
for (const file of required) if (!fs.existsSync(file)) failures.push(`${file} missing`);
const page = fs.readFileSync('src/components/workspace-pro/workspace-pro-page.tsx', 'utf8');
const css = fs.readFileSync('src/app/globals.css', 'utf8');
const version = fs.readFileSync('src/lib/release/version.ts', 'utf8');

const mustInclude = [
  'Workspace Pro Layout Simplification + Interaction Cleanup',
  'WorkspaceProSheet',
  'WorkspaceProInspector',
  'ws-pro-menu',
  'ws-pro-home-summary',
];
for (const marker of mustInclude) if (!page.includes(marker) && !css.includes(marker) && !version.includes(marker)) failures.push(`${marker} marker missing`);
if (page.includes('viewItems.slice(0, 4).map')) failures.push('sidebar must not duplicate workspace view tabs');
if (page.includes('WorkspaceTaskQuickMove')) failures.push('board cards should not render always-visible quick move controls');
if (!page.includes('setRightPanelOpen] = useState(false)')) failures.push('inspector/right panel should be closed by default');
if (!page.includes('MetricChip')) failures.push('Home should use compact metric chips instead of large metric cards');
if (failures.length) {
  console.error('[workspace:layout-cleanup:ready] FAIL');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log('[workspace:layout-cleanup:ready] OK — Workspace Pro layout simplification and interaction cleanup aligned.');
