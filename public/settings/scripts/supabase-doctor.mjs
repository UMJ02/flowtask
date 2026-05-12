#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

for (const rel of ['.env.local', '.env']) {
  const full = path.join(process.cwd(), rel);
  if (!fs.existsSync(full)) continue;
  for (const raw of fs.readFileSync(full, 'utf8').split(/\r?\n/)) {
    if (!raw || raw.trim().startsWith('#') || !raw.includes('=')) continue;
    const idx = raw.indexOf('=');
    const key = raw.slice(0, idx).trim();
    let value = raw.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key && !process.env[key]) process.env[key] = value;
  }
}

const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

const optional = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'CRON_SECRET',
  'FLOWTASK_BASE_URL',
  'NEXT_PUBLIC_APP_URL',
];

const missing = [];
console.log('[supabase-doctor] Validating Supabase/runtime environment...');
for (const key of required) {
  const value = process.env[key];
  const ok = typeof value === 'string' && value.trim().length > 0;
  console.log(`${ok ? '✓' : '✗'} ${key}`);
  if (!ok) missing.push(key);
}

for (const key of optional) {
  const ok = typeof process.env[key] === 'string' && process.env[key].trim().length > 0;
  console.log(`${ok ? '•' : '○'} ${key} ${ok ? '(set)' : '(optional / missing)'}`);
}

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
if (url && !/^https:\/\//.test(url)) {
  console.error('\n[supabase-doctor] NEXT_PUBLIC_SUPABASE_URL must start with https://');
  process.exit(1);
}

if (missing.length) {
  console.error(`\n[supabase-doctor] Missing required variables: ${missing.join(', ')}`);
  process.exit(1);
}

console.log('\n[supabase-doctor] Environment looks ready for local auth + data flows.');
