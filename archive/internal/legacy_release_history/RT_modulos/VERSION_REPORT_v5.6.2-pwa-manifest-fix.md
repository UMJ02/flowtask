# v5.6.2 PWA Manifest Fix

## Fixes
- Restored `src/app/manifest.ts` with valid PWA metadata.
- Added `public/manifest.webmanifest` as a static fallback for `/manifest.webmanifest`.
- Updated root metadata to point explicitly to `/manifest.webmanifest`.
- Adjusted PWA start URL to `/app/workspace`.
- Package version updated to `5.6.2-pwa-manifest-fix`.

## Goal
Avoid 404 errors when the browser requests `/manifest.webmanifest` during local development.
