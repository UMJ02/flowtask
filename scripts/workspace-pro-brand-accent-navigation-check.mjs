#!/usr/bin/env node
import fs from "node:fs";

const failures = [];
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const css = fs.readFileSync("src/app/globals.css", "utf8");
const nav = fs.readFileSync("src/components/layout/nav-links.ts", "utf8");
const appSidebar = fs.readFileSync("src/components/layout/app-sidebar.tsx", "utf8");
const mobileNav = fs.readFileSync("src/components/layout/mobile-nav.tsx", "utf8");
const workspace = fs.readFileSync("src/components/workspace-pro/workspace-pro-page.tsx", "utf8");

if (!pkg.scripts?.["build:preflight"]?.includes("workspace:pro-brand:ready")) failures.push("build:preflight must include workspace:pro-brand:ready");
if (!nav.includes("Crown") || !nav.includes("isPro?: boolean") || !nav.includes("isPro: true")) failures.push("nav metadata must support Pro marker with Crown icon");
if (!appSidebar.includes("ft-app-nav-pro") || !appSidebar.includes("text-amber-200")) failures.push("desktop sidebar must visually mark Workspace Pro");
if (!mobileNav.includes("link.isPro") || !mobileNav.includes("text-amber-200")) failures.push("mobile nav must visually mark Workspace Pro");
if (!workspace.includes("ws-pro-brand-mark") || !workspace.includes("FlowTask Pro")) failures.push("Workspace Pro internal sidebar must use pro brand mark while keeping white sidebar");
if (!css.includes(".ws-pro-shell") || !css.includes("--ws-pro-premium") || !css.includes(".ws-pro-primary-button")) failures.push("Workspace Pro color accent layer is missing");
if (!css.includes("aside.bg-white") || !css.includes("--ws-pro-sidebar-stay-white")) failures.push("CSS must preserve white Workspace Pro sidebar intent");

if (failures.length) {
  console.error("[workspace:pro-brand:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}
console.log("[workspace:pro-brand:ready] OK — Pro icon, badge, color accents and white sidebar guard aligned.");
