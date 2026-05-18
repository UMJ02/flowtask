# QA — v58.28.18.2 Public Registry Lockfile Hotfix

Run:

```bash
cd ~/Documents/"Web Projects"/flowtask
rm -rf node_modules .next tsconfig.tsbuildinfo
npm config set registry https://registry.npmjs.org/
npm install
npm audit --audit-level=moderate
npm run verify:current
npm run workspace:dependency-security:ready
npm run build:preflight
npm run vercel:build
npm run dev
```

Expected:

- `npm install` does not request `packages.applied-caas...`.
- `tsc` exists after install.
- `next/dist/bin/next` exists after install.
- Audit remains clean at moderate level.
