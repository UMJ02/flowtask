# FlowTask v58.26.5 — Workspace Error Recovery + Final QA Hardening

## Objetivo
Cerrar la línea Workspace-First con recuperación profesional ante errores reales de producción, estados inválidos y fallos recuperables de Supabase/RLS sin romper las rutas clásicas.

## Cambios principales

- Nuevo `WorkspaceRecoveryPanel` para errores recuperables del workspace.
- Nuevo `src/app/(app)/app/workspace/error.tsx` como error boundary dedicado.
- Nuevo `src/app/(app)/app/workspace/loading.tsx` con skeleton full-screen.
- Detección visual de `savedViewId` inválido.
- Panel de recuperación cuando Supabase/RLS bloquea la persistencia.
- Acciones de recuperación:
  - Reintentar.
  - Volver al Workspace Home.
  - Abrir Proyectos.
  - Volver al dashboard clásico.
- CSS nuevo `ft-ws-recovery-*`.
- Nuevo script `workspace:error-recovery:ready`.
- `build:preflight` ahora valida error recovery.
- `verify:current` apunta a `verify:v58.26.5`.

## No incluido

- No agrega migraciones.
- No cambia RLS.
- No reemplaza rutas clásicas.
- No agrega dependencias.
- No toca `safe_delete_visual_board`.

## Validación recomendada

```bash
npm run workspace:doctor
npm run workspace:production:ready
npm run workspace:real-env:ready
npm run workspace:performance:ready
npm run workspace:automation:ready
npm run workspace:collaboration:ready
npm run workspace:error-recovery:ready
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
```
