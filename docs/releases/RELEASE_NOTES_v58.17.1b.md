# Flowtask v58.17.1b — Real DB Contract Fix

Base: v58.17.1a FINAL BUILD FIX FULL. Package/release metadata intentionally remains `58.17-core-consolidation-release` so Vercel `build-deploy-readiness` continues to pass.

## Included
- Individual user remains the primary identity.
- Personal workspace is the default/base workspace.
- Organization workspace only becomes active after explicit selection.
- Organization is treated as a workspace created by an individual user, not as a user account.
- Owner/admin contract remains through existing organization bootstrap/membership flow.
- `src/types/database.ts` now contains a real partial Supabase DB contract generated from the provided schema export.
- Onboarding now has separate personal vs organization step sets.
- Internal plan naming remains neutral (`personal_free`, `personal_pro`, `team`, `business`) while accepting legacy `starter` data.
- DB column contract documents real columns: `tasks.country`, `projects.country`, `task_checklist_items.done`.
- Migration SQL is correctly located under `supabase/migrations/0043_v58_17_1b_real_db_contract_fix.sql`.
- No loose migration SQL is left at project root.
