# FlowTask — Deploy Production Runbook (V58.7)

## 1. Preparación local
```bash
npm install
cp .env.example .env.local
npm run vercel:preflight
npm run deploy:production:ready
```

## 2. Variables mínimas
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FLOWTASK_BASE_URL` (recomendado para smoke postdeploy)

## 3. Vercel
- vincular el repo/proyecto correcto
- cargar variables de entorno en Preview y Production
- confirmar `Build Command` = `npm run vercel:build`
- confirmar versión de Node usando `.nvmrc`

## 4. Predeploy gate
```bash
npm run verify:current
npm run qa:current
npm run qa:functional
npm run release:check
npm run production:gate
```

## 5. Postdeploy smoke
```bash
npm run postdeploy:smoke
npm run postdeploy:verify
```

## 6. Rutas mínimas a validar
- `/`
- `/login`
- `/app/dashboard`
- `/app/projects`
- `/app/tasks`
- `/app/clients`
- `/api/health`
- `/api/ready`

## 7. Rollback
- no publicar sin punto de rollback identificado
- mantener el último zip estable y el último deploy estable
- si falla smoke postdeploy, revertir antes de abrir a cliente
