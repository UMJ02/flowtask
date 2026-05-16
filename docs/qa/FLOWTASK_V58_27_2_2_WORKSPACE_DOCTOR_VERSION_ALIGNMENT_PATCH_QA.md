# QA — FlowTask v58.27.2.2 Workspace Doctor Version Alignment Patch

## Acceptance checklist

- `npm run workspace:doctor` passes and expects v58.27.2.2.
- `npm run verify:current` runs `verify:v58.27.2.2`.
- `src/lib/release/version.ts` exports `APP_VERSION`, `APP_RELEASE_NAME`, and `APP_RELEASE_STAGE`.
- `package.json` and `package-lock.json` use `58.27.2.2-workspace-doctor-version-alignment-patch`.
- Existing Workspace Pro UI remains unchanged.
- No migrations, RLS, Supabase, or dependency changes are introduced.
