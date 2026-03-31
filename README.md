# FlowTask v8.6.0 — Post Release Hardening v8

Base completa para continuar 1:1 desde la V7, con enfoque en handoff limpio, validación previa a deploy y una reinstalación más reproducible.

## Qué cambia en esta versión
- se mantiene el source completo de la V7 como base
- se agrega validación dedicada de variables de entorno antes del build
- se incorpora `.nvmrc` para fijar una versión sugerida de Node
- se refuerza `.env.example` como plantilla única de arranque local
- se agregan reportes de continuidad y checklist post-release
- se actualiza la metadata del proyecto a `8.6.0-post-release-hardening-v8`

## Archivos clave de esta versión
- `.env.example`
- `.nvmrc`
- `scripts/validate-env.mjs`
- `V_Report/VERSION_REPORT_v8.6.0-post-release-hardening-v8.md`
- `V_Report/QA_HANDOFF_v8.md`

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
5. Correr el preflight completo:
   - `npm run preflight:full`
6. Correr build:
   - `npm run build`
7. Levantar localmente:
   - `npm run dev`

## Scripts de validación recomendados
- `npm run validate:env`
- `npm run security:check`
- `npm run runtime:check`
- `npm run typecheck`
- `npm run preflight:full`
- `npm run deploy:checklist`

## Flujo recomendado para Vercel
1. Confirmar que el proyecto y el repo correctos están enlazados.
2. Cargar en Vercel las variables equivalentes al `.env.local`.
3. Validar localmente con `npm run preflight:full`.
4. Ejecutar `npm run build`.
5. Desplegar solo si el preflight y el build pasan limpios.

## Estado honesto de la base
- esta versión sigue siendo una base completa de continuidad
- mejora la reproducibilidad del arranque y el handoff técnico
- reduce el riesgo de deploy con variables incompletas
- cualquier secreto expuesto en versiones anteriores debe seguir rotado en Supabase y Vercel

## Notas finales
- no subir `node_modules`, `.next`, `.env.local` ni secretos
- usa esta V8 como nueva base 1:1 para los siguientes ciclos de corrección
- revisa `V_Report/QA_HANDOFF_v8.md` antes del siguiente QA o deploy
