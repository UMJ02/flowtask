# FlowTask v8.7.0 — Production Guardrails v9

Base completa para continuar 1:1 desde la V8, con enfoque en **guardrails de producción**, preflight más fuerte, CI básico y endpoint de salud para deploy.

## Qué cambia en esta versión
- se mantiene el source completo de la V8 como base
- se agrega validación de versión de Node antes del preflight
- se agrega reporte de preflight para handoff y QA
- se agrega workflow de GitHub Actions para validación continua
- se agrega endpoint `api/health` para verificación rápida del entorno
- se actualiza la metadata del proyecto a `8.7.0-production-guardrails-v9`

## Archivos nuevos de esta versión
- `.github/workflows/ci.yml`
- `scripts/check-node-version.mjs`
- `scripts/preflight-report.mjs`
- `src/app/api/health/route.ts`
- `V_Report/VERSION_REPORT_v8.7.0-production-guardrails-v9.md`
- `V_Report/DEPLOY_RUNBOOK_v9.md`

## Variables de entorno requeridas
### Públicas
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

### Solo servidor
- `SUPABASE_SERVICE_ROLE_KEY`

### Opcionales
- `NEXT_PUBLIC_ENABLE_REALTIME`
- `CRON_SECRET`
- `DIGEST_TIMEZONE`
- `NOTIFICATION_BATCH_SIZE`

## Flujo recomendado para reinstalación limpia
1. Usar la versión de Node sugerida:
   - `nvm use`
2. Instalar dependencias:
   - `npm install`
3. Crear variables locales:
   - `cp .env.example .env.local`
4. Completar las variables reales de Supabase
5. Validar Node:
   - `npm run validate:node`
6. Correr el preflight completo:
   - `npm run preflight:full`
7. Generar reporte de preflight:
   - `npm run preflight:report`
8. Correr build:
   - `npm run build`
9. Levantar localmente:
   - `npm run dev`

## Scripts de validación recomendados
- `npm run validate:node`
- `npm run validate:env`
- `npm run security:check`
- `npm run runtime:check`
- `npm run typecheck`
- `npm run preflight:full`
- `npm run ci:full`
- `npm run deploy:gate`

## Endpoint operativo
- `GET /api/health`
- devuelve estado general de entorno y readiness básico
- útil para smoke test rápido después de deploy

## Flujo recomendado para Vercel
1. Confirmar repo y proyecto enlazados correctamente.
2. Cargar en Vercel las variables equivalentes al `.env.local`.
3. Validar localmente con `npm run deploy:gate`.
4. Ejecutar `npm run build`.
5. Desplegar solo si preflight y build pasan limpios.
6. Confirmar `GET /api/health` después del deploy.

## Estado honesto de la base
- esta versión sigue siendo una base completa de continuidad
- mejora el handoff técnico y la capacidad de validación antes de deploy
- añade un mínimo de disciplina CI para no romper silenciosamente
- cualquier secreto expuesto en versiones anteriores debe seguir rotado en Supabase y Vercel

## Notas finales
- no subir `node_modules`, `.next`, `.env.local` ni secretos
- usa esta V9 como nueva base 1:1 para los siguientes ciclos de corrección
- revisa `V_Report/DEPLOY_RUNBOOK_v9.md` antes del siguiente paso de release

## V10 Ops readiness

Flujo recomendado de verificación operativa:

```bash
npm run smoke:health
npm run readiness:report
npm run postdeploy:verify
```

Comando consolidado de release:

```bash
npm run release:ops
```


## V11 local QA / bugfix readiness

Recommended validation flow after unpacking the source:

```bash
rm -rf node_modules .next package-lock.json
npm install
cp .env.example .env.local
npm run validate:node
npm run doctor:install
npm run validate:env
npm run doctor:supabase
npm run runtime:check
npm run typecheck
npm run build
npm run dev
```

Additional local endpoints:

- `GET /api/health` → basic service heartbeat
- `GET /api/ready` → safe readiness snapshot for local QA (no secrets returned)

If `doctor:install` fails, reinstall dependencies from zero before debugging source code.
If `doctor:supabase` fails, fix environment bindings before testing auth or workspace flows.
