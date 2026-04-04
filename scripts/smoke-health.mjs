#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

const root = process.cwd();
const routePaths = [
  path.join(root, "src", "app", "api", "health", "route.ts"),
  path.join(root, "src", "app", "api", "ready", "route.ts"),
];
const envPath = path.join(root, ".env.local");
const envExamplePath = path.join(root, ".env.example");
const problems = [];

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath, override: false });
}

for (const routePath of routePaths) {
  if (!fs.existsSync(routePath)) {
    problems.push(`Missing route at ${path.relative(root, routePath)}`);
  }
}

if (!fs.existsSync(envExamplePath)) {
  problems.push("Missing .env.example template");
}

const baseUrl = (process.env.FLOWTASK_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || "").trim().replace(/\/$/, "");
const canPing = /^https?:\/\//.test(baseUrl) && !baseUrl.includes('localhost');

async function ping(pathname) {
  const res = await fetch(`${baseUrl}${pathname}`, { headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error(`${pathname} returned ${res.status}`);
  return res;
}

if (problems.length) {
  console.error('[smoke-health] FAILED');
  for (const item of problems) console.error(` - ${item}`);
  process.exit(1);
}

console.log('[smoke-health] OK');
console.log(' - Health route present');
console.log(' - Ready route present');
console.log(' - Environment template present');

if (!fs.existsSync(envPath)) {
  console.log('[smoke-health] .env.local not found. Continuing with structural smoke validation only.');
}

if (!canPing) {
  console.log('[smoke-health] No deploy URL detected. Live smoke validation skipped.');
  process.exit(0);
}

try {
  await ping('/api/health');
  await ping('/api/ready');
  console.log(`[smoke-health] Live smoke passed against ${baseUrl}`);
} catch (error) {
  console.error(`[smoke-health] Live smoke failed: ${error.message}`);
  process.exit(1);
}
