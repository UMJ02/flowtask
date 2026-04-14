import { purgeExpiredOrganizations } from '../src/lib/organization/purge';

async function main() {
  const result = await purgeExpiredOrganizations();
  console.log(`[organization-purge] scanned=${result.scanned} purged=${result.purged}`);
  if (result.purgedIds.length) {
    console.log(`[organization-purge] purged ids: ${result.purgedIds.join(', ')}`);
  }
}

main().catch((error) => {
  console.error('[organization-purge] failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
