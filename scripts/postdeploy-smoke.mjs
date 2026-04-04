#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

const root = process.cwd();
for (const file of ['.env.local', '.env']) {
  const full = path.join(root, file);
  if (fs.existsSync(full)) {
    dotenv.config({ path: full, override: false });
  }
}

const baseUrl = (process.env.FLOWTASK_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || '').trim().replace(/\/$/, '');
if (!/^https?:\/\//.test(baseUrl)) {
  console.error('[postdeploy-smoke] Missing FLOWTASK_BASE_URL or NEXT_PUBLIC_APP_URL with an absolute URL.');
  process.exit(1);
}

const targets = ['/api/health', '/api/ready'];
let failures = 0;

for (const target of targets) {
  try {
    const response = await fetch(`${baseUrl}${target}`, { headers: { Accept: 'application/json' } });
    if (!response.ok) {
      console.error(`[postdeploy-smoke] FAIL ${target} -> ${response.status}`);
      failures += 1;
      continue;
    }
    const payload = await response.json();
    console.log(`[postdeploy-smoke] OK ${target} -> ${response.status} (${payload?.version || 'no-version'})`);
  } catch (error) {
    console.error(`[postdeploy-smoke] FAIL ${target} -> ${error.message}`);
    failures += 1;
  }
}

if (failures > 0) {
  process.exit(1);
}
