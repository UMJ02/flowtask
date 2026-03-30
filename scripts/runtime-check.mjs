import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

const cwd = process.cwd();
const candidateFiles = ['.env.local', '.env'];
const loadedFrom = [];

for (const file of candidateFiles) {
  const fullPath = path.join(cwd, file);
  if (fs.existsSync(fullPath)) {
    dotenv.config({ path: fullPath, override: false });
    loadedFrom.push(file);
  }
}

const requiredKeys = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'];

const missing = requiredKeys.filter((key) => {
  const value = process.env[key];
  return !value || !value.trim();
});

if (missing.length > 0) {
  console.error('[runtime-check] Missing variables:');
  for (const key of missing) {
    console.error(`- ${key}`);
  }
  if (loadedFrom.length === 0) {
    console.error('[runtime-check] No .env.local or .env file was found in the project root.');
  } else {
    console.error(`[runtime-check] Loaded env files: ${loadedFrom.join(', ')}`);
  }
  process.exit(1);
}

function decodeJwtPayload(token) {
  const parts = token.split('.');
  if (parts.length < 2) return null;

  try {
    return JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch {
    return null;
  }
}

const anonPayload = decodeJwtPayload(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
if (anonPayload?.role === 'service_role') {
  console.warn('[runtime-check] Warning: NEXT_PUBLIC_SUPABASE_ANON_KEY looks like a service_role key.');
  console.warn('[runtime-check] Do not expose service_role keys in the browser; use the public anon key from Supabase Settings > API.');
}

console.log('[runtime-check] OK');
console.log(`[runtime-check] Loaded env files: ${loadedFrom.length > 0 ? loadedFrom.join(', ') : 'none'}`);
for (const key of requiredKeys) {
  console.log(`- ${key}: present`);
}
