# QA — v58.27.8.1 Workspace Pro Vercel Readiness Hotfix

## Comandos obligatorios

```bash
npm run verify:current
npm run workspace:doctor
npm run workspace:production:ready
npm run workspace:real-env:ready
npm run workspace:performance:ready
npm run workspace:automation:ready
npm run workspace:collaboration:ready
npm run workspace:error-recovery:ready
npm run workspace:release-candidate:ready
npm run workspace:rc-fixes:ready
npm run workspace:design-reset:ready
npm run workspace:layout-cleanup:ready
npm run workspace:interaction:ready
npm run workspace:board-pro:ready
npm run workspace:files-reports:ready
npm run workspace:deep-cleanup:ready
npm run workspace:render-diet:ready
npm run workspace:visual-density:ready
npm run typecheck
npm run build:preflight
npm run build
```

## Vercel

El comando `npm run vercel:build` debe avanzar más allá de `workspace:production:ready` y continuar hasta `typecheck` / build de Next.
