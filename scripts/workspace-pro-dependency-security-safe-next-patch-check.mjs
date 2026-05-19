import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const failures = [];

const expectedVersion = "58.28.19-ux-copy-empty-states-final";

if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.28.19", "npm run verify:v58.28.20", "npm run verify:v58.28.21",
  "npm run verify:v58.28.21.3",
  "npm run verify:v58.28.21.4", "npm run verify:v58.28.21",
  "npm run verify:v58.28.21.3",
  "npm run verify:v58.28.21.4") failures.push("verify:current must target verify:v58.28.18");
if (pkg.dependencies?.next !== "15.5.18") failures.push("Next must be pinned to 15.5.18");
if (pkg.overrides?.["next@15.5.18"]?.postcss !== "8.5.14") failures.push("Next nested postcss must be overridden to 8.5.14");
if (pkg.overrides?.["brace-expansion"] !== "5.0.6") failures.push("brace-expansion must be overridden to 5.0.6");
if (pkg.overrides?.picomatch !== "4.0.4") failures.push("picomatch must be overridden to 4.0.4");
if (pkg.overrides?.ws !== "8.20.1") failures.push("ws must be overridden to 8.20.1");

try {
  execFileSync("npm", ["audit", "--audit-level=moderate"], { stdio: "pipe" });
} catch (error) {
  const output = `${error.stdout?.toString?.() ?? ""}${error.stderr?.toString?.() ?? ""}`.trim();
  failures.push(`npm audit --audit-level=moderate must pass with 0 vulnerabilities.${output ? `\n${output}` : ""}`);
}

if (failures.length) {
  console.error("[workspace:dependency-security:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[workspace:dependency-security:ready] OK — npm audit is clean and safe Next patch is aligned.");
