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

const requiredPublic = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'NEXT_PUBLIC_APP_URL',
];

const requiredServer = ['SUPABASE_SERVICE_ROLE_KEY'];
const optionalVars = [
  'NEXT_PUBLIC_ENABLE_REALTIME',
  'CRON_SECRET',
  'DIGEST_TIMEZONE',
  'NOTIFICATION_BATCH_SIZE',
];

const missingRequired = [...requiredPublic, ...requiredServer].filter(
  (key) => !process.env[key] || String(process.env[key]).trim() === ''
);

const presentOptional = optionalVars.filter(
  (key) => process.env[key] && String(process.env[key]).trim() !== ''
);
const missingOptional = optionalVars.filter((key) => !presentOptional.includes(key));

console.log('[validate-env] Checking FlowTask environment variables...');
console.log(`[validate-env] Loaded env files: ${loadedFrom.length > 0 ? loadedFrom.join(', ') : 'none'}`);

if (missingRequired.length > 0) {
  console.error('[validate-env] Missing required variables:');
  for (const key of missingRequired) console.error(` - ${key}`);
  process.exit(1);
}

console.log('[validate-env] Required variables are present.');

if (missingOptional.length > 0) {
  console.warn('[validate-env] Optional variables not set:');
  for (const key of missingOptional) console.warn(` - ${key}`);
}

if (presentOptional.length > 0) {
  console.log('[validate-env] Optional variables present:');
  for (const key of presentOptional) console.log(` - ${key}`);
}

console.log('[validate-env] Environment validation completed.');
