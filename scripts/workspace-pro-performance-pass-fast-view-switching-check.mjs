#!/usr/bin/env node
import fs from "node:fs";
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const page = fs.readFileSync("src/components/workspace-pro/workspace-pro-page.tsx", "utf8");
const css = fs.readFileSync("src/app/globals.css", "utf8");
const failures = [];
if (pkg.version !== "58.28.7-workspace-pro-performance-pass-fast-view-switching") failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.28.7") failures.push("verify:current must target verify:v58.28.7");
if (!page.includes("setDisplayedView(view)") || !page.includes("window.history.replaceState")) failures.push("Tab switching must update local view and URL without server refresh");
if (page.includes('router.refresh();\n  }\n\n  function openView')) failures.push("openView/setWorkspaceParam must not chain router.refresh after router.replace");
if (!css.includes("transition-duration: 90ms") || !css.includes("cursor: pointer") || !css.includes("backdrop-filter: none")) failures.push("Performance CSS must reduce expensive animation/backdrop and improve hover/click feedback");
if (failures.length) { console.error("[workspace:performance-pass:ready] FAIL"); for (const failure of failures) console.error(`- ${failure}`); process.exit(1); }
console.log("[workspace:performance-pass:ready] OK — fast view switching, hover feedback and render-cost reduction aligned.");
