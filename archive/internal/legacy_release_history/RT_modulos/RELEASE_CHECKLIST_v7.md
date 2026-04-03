# RELEASE CHECKLIST — V7

## Seguridad
- [ ] Confirmar que no viajan `.env` ni `.env.local`
- [ ] Confirmar que no viajan secretos en reportes o documentación
- [ ] Rotar credenciales si alguna versión previa expuso llaves reales

## Entorno
- [ ] Crear `.env.local` a partir de `.env.example`
- [ ] Verificar `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Verificar `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Verificar `SUPABASE_SERVICE_ROLE_KEY` solo del lado servidor

## Preflight local
- [ ] `npm install`
- [ ] `npm run security:check`
- [ ] `npm run runtime:check`
- [ ] `npm run typecheck`
- [ ] `npm run build`

## Deploy
- [ ] Variables replicadas en Vercel
- [ ] Proyecto Vercel correcto
- [ ] Repo correcto
- [ ] Build local limpio antes de push

## QA mínimo
- [ ] Login
- [ ] Dashboard
- [ ] Tasks
- [ ] Projects
- [ ] Notifications
- [ ] Organization / Billing / Support
