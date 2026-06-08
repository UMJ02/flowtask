import fs from "node:fs";

const failures = [];
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const lockText = fs.readFileSync("package-lock.json", "utf8");
const versionText = fs.readFileSync("src/lib/release/version.ts", "utf8");
const expectedVersion = "58.28.19-ux-copy-empty-states-final";

if (pkg.version !== expectedVersion) failures.push(`Unexpected package version: ${pkg.version}`);
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.28.19", "npm run verify:v58.28.20", "npm run verify:v58.28.21",
  "npm run verify:v58.28.21.3",
  "npm run verify:v58.28.21.4", "npm run verify:v58.28.21.5",
  "npm run verify:v58.28.21.6", "npm run verify:v58.28.21.6", "npm run verify:v58.28.21",
  "npm run verify:v58.28.21.3",
  "npm run verify:v58.28.21.4", "npm run verify:v58.28.21.5") failures.push("verify:current must target verify:v58.28.18.2");
if (!versionText.includes(expectedVersion)) failures.push("version.ts must contain the v58.28.18.2 slug");
if (lockText.includes("packages.applied-caas") || lockText.includes("internal.api.openai.org")) {
  failures.push("package-lock.json still contains internal registry URLs");
}
if (!lockText.includes("https://registry.npmjs.org/next/-/next-15.5.18.tgz")) {
  failures.push("package-lock.json must resolve next 15.5.18 from registry.npmjs.org");
}
if (!lockText.includes("https://registry.npmjs.org/ws/-/ws-8.20.1.tgz")) {
  failures.push("package-lock.json must resolve ws 8.20.1 from registry.npmjs.org");
}
if (!pkg.overrides?.ws || pkg.overrides.ws !== "8.20.1") failures.push("package.json overrides.ws must be 8.20.1");
if (!pkg.overrides?.picomatch || pkg.overrides.picomatch !== "4.0.4") failures.push("package.json overrides.picomatch must be 4.0.4");

if (failures.length) {
  console.error("[workspace:dependency-security:ready] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[workspace:dependency-security:ready] OK — dependency security patch uses public npm registry lockfile and safe Next patch.");
