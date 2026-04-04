# FlowTask — Client Release Checklist (V58.7)

## 1. Base técnica
- [ ] `npm install`
- [ ] `cp .env.example .env.local`
- [ ] variables de entorno completas y correctas
- [ ] `npm run validate:node`
- [ ] `npm run validate:env`
- [ ] `npm run verify:current`
- [ ] `npm run runtime:check`
- [ ] `npm run typecheck`
- [ ] `npm run deploy:readiness`
- [ ] `npm run client:readiness:check`
- [ ] `npm run deploy:production:ready`

## 2. Repo limpio
- [ ] sin `node_modules`
- [ ] sin `.next`
- [ ] sin `.git` en el zip de entrega
- [ ] sin `.env` ni `.env.local`
- [ ] sin `RT_modulos` en raíz
- [ ] sin patch SQL históricos fuera de `archive/internal`
- [ ] `supabase/migrations/` confirmado como fuente oficial de BD
- [ ] sin `tsconfig.tsbuildinfo` en el bundle

## 3. QA funcional mínimo
- [ ] login
- [ ] dashboard principal
- [ ] clientes
- [ ] proyectos
- [ ] tareas
- [ ] board
- [ ] soporte
- [ ] platform/admin
- [ ] permisos por rol
- [ ] agenda del día con favoritas
- [ ] cierre rápido de tareas desde board

## 4. QA visual
- [ ] estados vacíos
- [ ] loaders
- [ ] mensajes de error
- [ ] mensajes de éxito
- [ ] navegación estable desktop
- [ ] navegación estable mobile básico

## 5. Deploy real
- [ ] variables cargadas en Vercel Preview y Production
- [ ] dominio/base URL confirmada
- [ ] `npm run vercel:preflight` completado
- [ ] deploy preview sin errores
- [ ] deploy production sin errores
- [ ] `/api/health` = 200
- [ ] `/api/ready` = 200
- [ ] `npm run postdeploy:smoke` OK
- [ ] rollback documentado

## 6. Release técnico
- [ ] `npm run security:check`
- [ ] `npm run performance:check`
- [ ] `npm run ops:check`
- [ ] `npm run qa:current`
- [ ] `npm run qa:functional`
- [ ] `npm run qa:report`
- [ ] `npm run preprod:validate`
- [ ] `npm run production:gate`

## 7. Entrega final
- [ ] zip limpio generado desde esta base
- [ ] documentación de handoff incluida
- [ ] cliente recibe solo fuente necesaria
- [ ] histórico técnico queda solo como archivo interno
- [ ] llaves reales rotadas si en algún momento salieron del entorno seguro
