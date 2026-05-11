#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const read = (rel) => fs.existsSync(path.join(root, rel)) ? fs.readFileSync(path.join(root, rel), "utf8") : "";
const exists = (rel) => fs.existsSync(path.join(root, rel));
const requireFile = (rel) => { if (!exists(rel)) failures.push(`Missing required file: ${rel}`); };
const requireIncludes = (rel, text) => { if (!read(rel).includes(text)) failures.push(`Expected '${text}' in ${rel}`); };

const expectedVersion = "58.24.9.10-session-security-interaction-performance-account-danger-zone-auth-asset-fix";
const expectedRelease = "v58.24.9.10 Session Security + Interaction Performance + Account Danger Zone + Auth Asset Fix";

const pkg = JSON.parse(read("package.json"));
if (pkg.version !== expectedVersion) failures.push("package version must be v58.24.9.10");
if ((pkg.scripts ?? {})["verify:current"] !== "npm run verify:v58.24.9.10") failures.push("verify:current must target verify:v58.24.9.10");
if ((pkg.scripts ?? {})["verify:v58.24.9.10"] !== "node scripts/verify-v58.24.9.10.mjs") failures.push("verify:v58.24.9.10 script must be available");

requireFile("scripts/verify-v58.24.9.10.mjs");
requireFile("docs/release/V58_24_9_10_SESSION_SECURITY_INTERACTION_PERFORMANCE_ACCOUNT_DANGER_ZONE_AUTH_ASSET_FIX.md");
requireFile("docs/qa/FLOWTASK_V58_24_9_10_SESSION_SECURITY_INTERACTION_PERFORMANCE_ACCOUNT_DANGER_ZONE_AUTH_ASSET_FIX_QA.md");
requireFile("src/components/auth/idle-session-guard.tsx");
requireFile("src/components/auth/login-session-notice.tsx");
requireFile("src/components/settings/account-danger-zone.tsx");
requireFile("src/app/api/account/delete/route.ts");
requireFile("supabase/migrations/0054_v58_24_9_10_account_deletion_status.sql");
requireFile("public/check/confirmacion.png");
requireFile("src/app/(public)/confirmed/page.tsx");

requireIncludes("src/lib/release/version.ts", expectedVersion);
requireIncludes("src/lib/release/version.ts", expectedRelease);
requireIncludes("package-lock.json", expectedVersion);
requireIncludes("README.md", "v58.24.9.10");

requireIncludes("src/components/auth/idle-session-guard.tsx", "15 * 60 * 1000");
requireIncludes("src/components/auth/idle-session-guard.tsx", "supabase.auth.signOut");
requireIncludes("src/components/layout/app-shell.tsx", "IdleSessionGuard");
requireIncludes("src/components/auth/login-session-notice.tsx", "reason === 'idle'");
requireIncludes("src/app/(public)/login/page.tsx", "LoginSessionNotice");
requireIncludes("src/components/settings/account-danger-zone.tsx", "ELIMINAR");
requireIncludes("src/components/settings/account-danger-zone.tsx", "/api/account/delete");
requireIncludes("src/app/(app)/app/settings/page.tsx", "AccountDangerZone");
requireIncludes("src/app/api/account/delete/route.ts", "createAdminClient");
requireIncludes("src/app/api/account/delete/route.ts", "account_deletion_requested_at");
requireIncludes("supabase/migrations/0054_v58_24_9_10_account_deletion_status.sql", "account_deletion_requested_at");
requireIncludes("src/app/(public)/confirmed/page.tsx", "/check/confirmacion.png");
requireIncludes("src/app/globals.css", "ft-skeleton-card");
requireIncludes("src/app/globals.css", "ft-scroll-stable");

if (failures.length) {
  console.error("[verify:v58.24.9.10] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.24.9.10] OK — Session security, interaction performance, account danger zone and auth asset fix aligned.");
