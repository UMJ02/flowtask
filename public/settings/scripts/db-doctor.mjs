#!/usr/bin/env node
import { loadEnvFiles } from './load-env.mjs';

loadEnvFiles();

const requiredEnv = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
const missing = requiredEnv.filter((key) => !process.env[key]?.trim());
if (missing.length) {
  console.error('[db:doctor] Missing environment variables:');
  for (const key of missing) console.error(`- ${key}`);
  process.exit(1);
}

const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/tasks?select=id,deleted_at&limit=1`;
const response = await fetch(url, {
  headers: {
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  },
});

if (!response.ok) {
  const body = await response.text();
  console.error('[db:doctor] Failed tasks deleted_at check.');
  console.error(body);
  process.exit(1);
}

console.log('[db:doctor] OK - tasks.deleted_at is queryable.');
console.log('[db:doctor] Reminder: validate RPCs in Supabase SQL Editor: safe_delete_task, restore_deleted_task, purge_deleted_task, and organization lifecycle functions.');
