#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const expectedVersion = "58.21.3-design-system-foundation-visual-consistency";
const expectedRelease = "v58.21.3 Design System Foundation + Visual Consistency";

function read(rel) {
  const full = path.join(root, rel);
  return fs.existsSync(full) ? fs.readFileSync(full, "utf8") : "";
}
function exists(rel) { return fs.existsSync(path.join(root, rel)); }
function requireFile(rel) { if (!exists(rel)) failures.push(`Missing file: ${rel}`); }
function requireIncludes(rel, text) { const content = read(rel); if (!content.includes(text)) failures.push(`Expected '${text}' in ${rel}`); }

requireFile("src/lib/design-system/tokens.ts");
requireFile("docs/release/V58_21_3_DESIGN_SYSTEM_FOUNDATION_VISUAL_CONSISTENCY.md");
requireFile("docs/qa/FLOWTASK_V58_21_3_DESIGN_SYSTEM_VISUAL_QA.md");

const pkg = JSON.parse(read("package.json"));
const scripts = pkg.scripts ?? {};
if (pkg.version !== expectedVersion) failures.push(`package.json version must be ${expectedVersion}`);
if (scripts["verify:current"] !== "npm run verify:v58.21.3") failures.push("verify:current must target verify:v58.21.3");
if (scripts["verify:v58.21.3"] !== "node scripts/verify-v58.21.3.mjs") failures.push("verify:v58.21.3 script must target scripts/verify-v58.21.3.mjs");

requireIncludes("package-lock.json", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("src/lib/release/version.ts", "production-candidate");

requireIncludes("src/lib/design-system/tokens.ts", "flowtaskDesignSystem");
requireIncludes("src/lib/design-system/tokens.ts", "pageTitle");
requireIncludes("src/lib/design-system/tokens.ts", "buttonPrimary");
requireIncludes("src/lib/design-system/tokens.ts", "inputLarge");

requireIncludes("src/app/globals.css", "--ft-color-app-bg");
requireIncludes("src/app/globals.css", ".ft-page-title");
requireIncludes("src/app/globals.css", ".ft-main-card");
requireIncludes("src/app/globals.css", ".ft-button");
requireIncludes("src/app/globals.css", ".ft-control");

requireIncludes("src/components/ui/button.tsx", "size?: \"sm\" | \"md\" | \"icon\"");
requireIncludes("src/components/ui/input.tsx", "h-12 w-full rounded-2xl");
requireIncludes("src/components/ui/select.tsx", "h-12 w-full rounded-2xl");
requireIncludes("src/components/ui/textarea.tsx", "min-h-[130px]");

requireIncludes("docs/release/V58_21_3_DESIGN_SYSTEM_FOUNDATION_VISUAL_CONSISTENCY.md", "Design System Foundation + Visual Consistency");
requireIncludes("docs/qa/FLOWTASK_V58_21_3_DESIGN_SYSTEM_VISUAL_QA.md", "Checklist visual");

if (failures.length) {
  console.error("[verify:v58.21.3] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.21.3] OK — Design System Foundation + Visual Consistency aligned.");
