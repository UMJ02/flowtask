# FlowTask v8.5.0 — Release Candidate v7

Base completa para continuar 1:1 desde la V6, con enfoque de cierre de release: menos artefactos locales, menos riesgo de exponer secretos y una guía más clara para preflight + deploy.

## Qué cambia en esta versión
- se eliminan del source entregable los artefactos locales y sensibles que no deben viajar en un zip de handoff
- se agrega `.env.example` como plantilla segura para reconstruir variables de entorno
- se actualiza la metadata de versión del proyecto a `8.5.0-release-candidate-v7`
- se agregan reportes de cierre para checklist de release y continuidad

## Archivos removidos del source entregable
- `.env`
- `.env.local`
- `tsconfig.tsbuildinfo`
- `next` (artefacto vacío)

## Variables de entorno esperadas
Mínimas para levantar la app:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

Solo server-side:
- `SUPABASE_SERVICE_ROLE_KEY`

Opcionales según jobs / procesos:
- `CRON_SECRET`
- `DIGEST_TIMEZONE`
- `NOTIFICATION_BATCH_SIZE`

Usa `.env.example` como plantilla y crea tu `.env.local` solo en tu entorno local o en Vercel.

## Flujo recomendado de preflight local
1. Instalar dependencias limpias:
   - `npm install`
2. Crear variables locales desde la plantilla:
   - `cp .env.example .env.local`
3. Validar seguridad básica:
   - `npm run security:check`
4. Validar runtime:
   - `npm run runtime:check`
5. Validar TypeScript:
   - `npm run typecheck`
6. Validar build:
   - `npm run build`
7. Solo después conectar o empujar a Vercel.

## Flujo recomendado para Vercel
1. Conectar el repo correcto al proyecto correcto.
2. Cargar en Vercel las mismas variables de entorno necesarias.
3. Confirmar que la `NEXT_PUBLIC_SUPABASE_ANON_KEY` sea la anon key pública.
4. Correr localmente el preflight antes del push final.
5. Desplegar solo cuando `security:check`, `runtime:check`, `typecheck` y `build` pasen en limpio.

## Estado honesto de esta base
- esta versión está pensada como release candidate de continuidad
- conserva el source completo de la V6
- limpia artefactos que no deben viajar
- deja una plantilla segura de entorno para reinstalación y deploy
- cualquier secreto previamente expuesto en zips anteriores debe rotarse en Supabase / Vercel antes de producción

## Scripts clave
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run typecheck`
- `npm run runtime:check`
- `npm run security:check`
- `npm run vercel:preflight`
- `npm run deploy:ready`

## Notas finales
- no subir `node_modules`, `.next`, `.env.local` ni secretos
- si vas a retomar el proyecto desde un entorno limpio, usa esta versión como nueva base 1:1
- revisa `V_Report/RELEASE_CHECKLIST_v7.md` antes del próximo deploy
