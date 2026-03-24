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
  process.exit(1);
}

console.log('[runtime-check] OK');
for (const key of requiredKeys) {
  console.log(`- ${key}: present`);
}
