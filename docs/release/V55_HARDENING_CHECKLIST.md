# FlowTask — V55 Hardening Checklist

## 1. Higiene del repo
- [ ] sin `.env`
- [ ] sin `.env.local`
- [ ] sin `.git` en bundle entregable
- [ ] sin `.next`
- [ ] sin `node_modules`
- [ ] sin `__MACOSX`
- [ ] sin `.DS_Store`
- [ ] sin `tsconfig.tsbuildinfo`

## 2. Contrato de entorno
- [ ] `.env.example` completo y actualizado
- [ ] variables `NEXT_PUBLIC_*` separadas de server-only
- [ ] `SUPABASE_SERVICE_ROLE_KEY` solo para procesos server / scripts
- [ ] configuración real cargada en Vercel y no en el zip

## 3. Validación estructural
- [ ] `npm run verify:current`
- [ ] `npm run runtime:check`
- [ ] `npm run security:check`
- [ ] `npm run release:check`
- [ ] `npm run typecheck`

## 4. Regla de continuidad
- [ ] no refactorizar el core
- [ ] no mover la arquitectura base
- [ ] no mezclar históricos fuera de `archive/internal`
- [ ] seguir sobre esta base para V56+
