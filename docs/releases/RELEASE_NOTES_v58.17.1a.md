# Flowtask v58.17.1a — Account Model & Supabase Migration Hotfix

## Base validated

Built from: `flowtask_V58.17_Core_Consolidation_Release_FULL(1).zip`.

## Product contract fixed

Flowtask is personal-first:

- The individual user is always the primary identity.
- The personal workspace is always valid.
- Organizations are collaborative workspaces created by individual users.
- An organization is never a user account.
- When an individual creates an organization, that individual becomes `admin_global` / owner-admin.
- Plan names such as Free / Work / Partner remain provisional and were not hardcoded as final commercial names.

## Supabase hotfix included

Included migration / SQL file:

- `supabase/migrations/0042_v58_17_1a_account_model_supabase_hotfix.sql`
- root copy: `0042_v58_17_1a_account_model_supabase_hotfix.sql`

The SQL is idempotent and designed for a database where a previous v58.17.1 / 0043 attempt may already have been run.

It does not delete business data.

## Code corrections

- Added `src/lib/account-model.ts` as the central account model contract.
- Updated `src/lib/security/organization-access.ts` so the app does not auto-promote the first/default organization as active workspace.
- Updated `src/lib/queries/organization.ts` so active organization requires explicit workspace cookie selection.
- Updated onboarding logic so personal workspace is valid and not treated as incomplete.
- Updated version metadata to `58.17.1a-supabase-migration-hotfix`.
- Added `scripts/verify-v58.17.1a.mjs` and mapped `verify:current` to it.

## Validation performed

- Static inspection of v58.17 source structure.
- Static inspection of Supabase migration and DB contract references.
- Verified no `country_id` / `is_done` references were introduced in `src` or the hotfix migration.
- Ran `node scripts/verify-v58.17.1a.mjs` successfully.

## Important deployment note

Before deploying to Vercel, paste/run the SQL from:

`0042_v58_17_1a_account_model_supabase_hotfix.sql`

Then deploy this full ZIP.

