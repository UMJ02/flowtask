# v58.28.18.2 — Dependency Security Public Registry Lockfile Hotfix

This hotfix corrects v58.28.18 package-lock resolved URLs so local installs fetch from public npm registry instead of an internal build registry.

## Fixes

- package-lock.json no longer contains `packages.applied-caas` or `internal.api.openai.org`.
- `verify:current` points to `verify:v58.28.18.2`.
- `workspace:dependency-security:ready` verifies public registry lockfile markers.
- Keeps Next 15.5.18 and safe dependency overrides.

## No application changes

No Supabase, RLS, migrations, UI, routes, task sync, or Workspace Pro behavior changed.
