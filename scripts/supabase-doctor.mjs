#!/usr/bin/env node
const required = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

const optional = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'CRON_SECRET',
  'FLOWTASK_APP_URL',
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

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
if (url && !/^https:\/\//.test(url)) {
  console.error('\n[supabase-doctor] NEXT_PUBLIC_SUPABASE_URL must start with https://');
  process.exit(1);
}

if (missing.length) {
  console.error(`\n[supabase-doctor] Missing required variables: ${missing.join(', ')}`);
  process.exit(1);
}

console.log('\n[supabase-doctor] Environment looks ready for local auth + data flows.');
