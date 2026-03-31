# Deploy Runbook V9

## Antes de deploy
1. `nvm use`
2. `npm install`
3. `cp .env.example .env.local`
4. completar variables reales
5. `npm run deploy:gate`

## En Vercel
1. confirmar variables
2. confirmar rama y proyecto correctos
3. lanzar deploy

## Después de deploy
1. abrir `/api/health`
2. revisar login
3. revisar dashboard
4. revisar tasks
5. revisar projects
6. revisar notifications

## Criterio de salida
- `/api/health` en `ok`
- login funcional
- dashboard carga
- sin error fatal en consola inicial
