# FlowTask — Deploy Production Runbook (V58.8)

## 1. Preparación local
```bash
npm install
cp .env.example .env.local
npm run validate:node
npm run validate:env
npm run verify:current
npm run runtime:check
npm run typecheck
npm run deploy:production:ready
npm run hardening:final:check
```

## 2. Preflight de build
```bash
npm run vercel:preflight
npm run build
```

## 3. Variables mínimas
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FLOWTASK_BASE_URL` (recomendado para smoke y postdeploy)

## 4. Deploy
- conectar repo/proyecto en Vercel
- cargar variables en Preview y Production
- confirmar dominio/base URL
- ejecutar deploy preview
- ejecutar deploy production

## 5. Verificación postdeploy
```bash
npm run smoke:health
npm run postdeploy:smoke
npm run readiness:report
```

## 6. Gate final
```bash
npm run production:gate
```

## 7. Rollback
- conservar último build estable
- documentar versión anterior y commit/tag asociado
- si el smoke falla en producción, revertir al último deploy estable antes de continuar
