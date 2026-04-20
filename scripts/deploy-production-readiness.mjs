import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const vercel = JSON.parse(fs.readFileSync(path.join(root, "vercel.json"), "utf8"));
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
const envExample = fs.readFileSync(path.join(root, ".env.example"), "utf8");
const releaseVersion = fs.readFileSync(path.join(root, "src/lib/release/version.ts"), "utf8");

const checks = [
  ["vercel build command", vercel.buildCommand === "npm run vercel:build"],
  ["vercel security headers", Array.isArray(vercel.headers) && vercel.headers.length > 0],
  ["env has NEXT_PUBLIC_APP_URL", envExample.includes("NEXT_PUBLIC_APP_URL=")],
  ["env has FLOWTASK_BASE_URL helper", envExample.includes("FLOWTASK_BASE_URL=")],
  ["readme mentions V58.12.2", readme.includes("V58.12.2")],
  ["release exports include APP_RELEASE_STAGE", releaseVersion.includes("APP_RELEASE_STAGE")],
  ["package version aligned", pkg.version === "58.12.2-organization-delete-now-fix"],
];

const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error("[deploy-production-readiness] Failed checks:");
  for (const [label] of failed) console.error(`- ${label}`);
  process.exit(1);
}

console.log("[deploy-production-readiness] OK");
for (const [label] of checks) console.log(` - ${label}`);
