import fs from "node:fs";

const failures = [];
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const lockText = fs.readFileSync("package-lock.json", "utf8");
const versionText = fs.readFileSync("src/lib/release/version.ts", "utf8");
const nextConfig = fs.readFileSync("next.config.ts", "utf8");
const allowedVersions = [
  "58.28.18.2-dependency-security-next-root-lockfile-guard",
  "58.28.19-ux-copy-empty-states-final",
  "58.28.20-mobile-responsive-final-pass",
  "58.28.21-supabase-rls-client-readiness-final",
  "58.28.21.3-classic-reports-data-integrity-checklist-progress-export",
  "58.28.21.4-share-landing-short-link-stored-report-tokens",
  "58.28.21.5-radar-analytics-due-state-integrity",
];
const allowedVerifyTargets = [
  "npm run verify:v58.28.18.2",
  "npm run verify:v58.28.19",
  "npm run verify:v58.28.20",
  "npm run verify:v58.28.21",
  "npm run verify:v58.28.21.3",
  "npm run verify:v58.28.21.4", "npm run verify:v58.28.21.5",
];

if (!allowedVersions.includes(pkg.version)) failures.push(`Unexpected package version: ${pkg.version}`);
if (!allowedVerifyTargets.includes(pkg.scripts?.["verify:current"])) failures.push("verify:current must target an active v58.28.18.2+ verify script");
if (!allowedVersions.some((version) => versionText.includes(version))) failures.push("version.ts must contain an allowed dependency security compatible slug");
if (lockText.includes("packages.applied-caas") || lockText.includes("internal.api.openai.org")) failures.push("package-lock.json still contains internal registry URLs");
if (!lockText.includes("https://registry.npmjs.org/next/-/next-15.5.18.tgz")) failures.push("package-lock.json must resolve next 15.5.18 from registry.npmjs.org");
if (!lockText.includes("https://registry.npmjs.org/ws/-/ws-8.20.1.tgz")) failures.push("package-lock.json must resolve ws 8.20.1 from registry.npmjs.org");
if (!pkg.overrides?.ws || pkg.overrides.ws !== "8.20.1") failures.push("package.json overrides.ws must be 8.20.1");
if (!pkg.overrides?.picomatch || pkg.overrides.picomatch !== "4.0.4") failures.push("package.json overrides.picomatch must be 4.0.4");
if (!nextConfig.includes("outputFileTracingRoot: process.cwd()")) failures.push("next.config.ts must define outputFileTracingRoot: process.cwd()");

if (failures.length) {
  console.error("[workspace:dependency-security:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[workspace:dependency-security:ready] OK — public npm registry, safe Next patch and project-root tracing guard aligned.");
