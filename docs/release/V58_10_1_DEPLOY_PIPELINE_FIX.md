# V58.10.1 — Deploy Pipeline Fix

Base: V58.10

## Objetivo
Corregir el pipeline de preflight/deploy sin tocar la UI trabajada en la pantalla de Equipo.

## Ajustes
- scripts de preflight alineados a V58.10.1
- `.nvmrc` agregado
- `.env.example` agregado
- workflow de CI mínimo agregado
- compatibilidad con `npm ci` o `npm install` en `vercel.json`
- compatibilidad local con Node 22 y deploy recomendado en Node 20

## Validación esperada
- `npm run validate:node`
- `npm run verify:current`
- `npm run deploy:readiness`
- `npm run deploy:production:ready`
- `npm run build`
