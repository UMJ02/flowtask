import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const version = fs.readFileSync("src/lib/release/version.ts", "utf8");
const css = fs.existsSync("src/app/globals.css") ? fs.readFileSync("src/app/globals.css", "utf8") : "";
const audit = fs.existsSync("docs/audits/V58_28_13_FINAL_CLEANUP_AUDIT.md");
const failures = [];

if (pkg.version !== "58.28.14-workspace-pro-component-split-runtime-slimdown") failures.push("Unexpected package version");
if (pkg.scripts?.["verify:current"] !== "npm run verify:v58.28.14") failures.push("verify:current must target verify:v58.28.13");
if (!version.includes("58.28.14-workspace-pro-component-split-runtime-slimdown")) failures.push("version.ts must contain v58.28.13 slug");
if (!pkg.scripts?.["workspace:final-cleanup:ready"]) failures.push("workspace:final-cleanup:ready script missing");
if (!pkg.scripts?.["build:preflight"]?.includes("workspace:final-cleanup:ready")) failures.push("build:preflight must include workspace:final-cleanup:ready");
if (Object.keys(pkg.scripts || {}).length > 80) failures.push("package.json still exposes too many active scripts for client-final build");
if (!audit) failures.push("final cleanup audit doc missing");
if (css.includes("Actualizando vista")) failures.push("legacy updating view text should not be present in CSS");

if (failures.length) {
  console.error("[verify:v58.28.13] FAIL");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("[verify:v58.28.13] OK — final cleanup audit and safe dead surface removal aligned.");
