import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const versionText = readFileSync("src/lib/release/version.ts", "utf8");
const lockText = readFileSync("package-lock.json", "utf8");
const nextConfig = readFileSync("next.config.ts", "utf8");
const failures = [];

const expectedVersion = "58.28.19-ux-copy-empty-states-final";

if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.28.19", "npm run verify:v58.28.20", "npm run verify:v58.28.21",
  "npm run verify:v58.28.21.1", "npm run verify:v58.28.21",
  "npm run verify:v58.28.21.1") failures.push("verify:current must target verify:v58.28.18.2");
if (pkg.dependencies?.next !== "15.5.18") failures.push("next dependency must be pinned to 15.5.18");
if (!pkg.overrides?.["next@15.5.18"]?.postcss || pkg.overrides["next@15.5.18"].postcss !== "8.5.14") failures.push("next postcss override must pin postcss 8.5.14");
if (pkg.overrides?.["brace-expansion"] !== "5.0.6") failures.push("brace-expansion override must pin 5.0.6");
if (pkg.overrides?.picomatch !== "4.0.4") failures.push("picomatch override must pin 4.0.4");
if (pkg.overrides?.ws !== "8.20.1") failures.push("ws override must pin 8.20.1");
if (!versionText.includes(expectedVersion)) failures.push("version.ts must contain v58.28.18.2 slug");
if (!lockText.includes('"next": "15.5.18"')) failures.push("package-lock must contain Next 15.5.18");
if (lockText.includes("packages.applied-caas") || lockText.includes("internal.api.openai.org")) failures.push("package-lock.json must not contain internal registry URLs");
if (!nextConfig.includes("outputFileTracingRoot: process.cwd()")) failures.push("next.config.ts must pin outputFileTracingRoot to process.cwd() to avoid parent lockfile warnings");
if (!pkg.scripts?.["build:preflight"]?.includes("workspace:dependency-security:ready")) failures.push("build:preflight must include workspace:dependency-security:ready");

if (failures.length) {
  console.error("[verify:v58.28.18.2] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.28.18.2] OK — dependency security, public registry and Next root lockfile guard aligned.");
