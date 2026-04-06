import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const archivedScriptsDir = path.join(root, "archive/internal/legacy_release_history/scripts");
const scriptsDir = path.join(root, "scripts");

const archivedExpected = [
  "client-final-signoff.mjs",
  "release-candidate-signoff.mjs",
  "verify-v53.3.mjs",
  "verify-v53.4.mjs",
  "verify-v53.5.mjs",
  "verify-v54.0.mjs",
  "verify-v54.1.mjs",
  "verify-v54.2.mjs",
  "verify-v54.2.1.mjs"
];

const forbiddenInScriptsRootPrefixes = ["verify-v15", "verify-v16", "verify-v17", "verify-v18", "verify-v19", "verify-v20", "verify-v21", "verify-v25", "verify-v26", "verify-v27", "verify-v28", "verify-v29", "verify-v30", "verify-v31", "verify-v32", "verify-v33", "verify-v35", "verify-v36", "verify-v37", "verify-v39", "verify-v40", "verify-v41", "verify-v42", "verify-v43", "verify-v44", "verify-v45", "verify-v46", "verify-v47", "verify-v48", "verify-v49", "verify-v50", "verify-v51", "verify-v52", "verify-v53.3", "verify-v53.4", "verify-v53.5", "verify-v54.0", "verify-v54.1", "verify-v54.2", "verify-v54.2.1"];

let failures = 0;
console.log("\n[verify-v54.3.1] FlowTask release script cleanup\n");

const mustExist = [
  "package.json",
  "scripts/runtime-check.mjs",
  "scripts/security-check.mjs",
  "scripts/release-check.mjs",
  "scripts/verify-v54.3.mjs",
  "scripts/verify-v54.3.1.mjs",
  "archive/internal/README.md",
  "archive/internal/legacy_release_history/scripts"
];
for (const rel of mustExist) {
  const ok = fs.existsSync(path.join(root, rel));
  console.log(`${ok ? "PASS" : "FAIL"}  ${rel}`);
  if (!ok) failures += 1;
}

console.log("\n[verify-v54.3.1] Archived legacy scripts");
for (const rel of archivedExpected) {
  const ok = fs.existsSync(path.join(archivedScriptsDir, rel));
  console.log(`${ok ? "PASS" : "FAIL"}  archive/internal/legacy_release_history/scripts/${rel}`);
  if (!ok) failures += 1;
}

console.log("\n[verify-v54.3.1] Forbidden legacy verify scripts in root scripts/");
const rootScripts = fs.existsSync(scriptsDir) ? fs.readdirSync(scriptsDir) : [];
for (const prefix of forbiddenInScriptsRootPrefixes) {
  const present = rootScripts.some((name) => name.startsWith(prefix));
  console.log(`${!present ? "PASS" : "FAIL"}  scripts/${prefix}*`);
  if (present) failures += 1;
}

const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const requiredScripts = ["verify:v54.3", "verify:v54.3.1", "release:repo:v54.3", "release:repo:v54.3.1"];
const forbiddenPackageScripts = [
  "verify:v53.3",
  "verify:v53.4",
  "verify:v53.5",
  "verify:v54.0",
  "verify:current",
  "verify:v54.2",
  "client:release",
  "client:final",
  "release:candidate",
  "release:final"
];

console.log("\n[verify-v54.3.1] package.json script registry");
for (const name of requiredScripts) {
  const ok = Boolean(packageJson.scripts?.[name]);
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) failures += 1;
}
for (const name of forbiddenPackageScripts) {
  const ok = !packageJson.scripts?.[name];
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}`);
  if (!ok) failures += 1;
}

if (failures > 0) {
  console.error(`\n[verify-v54.3.1] Completed with ${failures} failing checks.`);
  process.exit(1);
}

console.log("\n[verify-v54.3.1] Release script cleanup checks passed.\n");
