# QA — FlowTask v58.26.5 Workspace Error Recovery + Final QA Hardening

## Checklist funcional

- [ ] `/app/workspace` muestra loading skeleton durante carga.
- [ ] Error boundary dedicado aparece si una excepción rompe la ruta workspace.
- [ ] El botón Reintentar ejecuta `reset()` en el error boundary.
- [ ] Link “Volver al Workspace Home” funciona.
- [ ] Link “Abrir proyectos” funciona.
- [ ] Link “Dashboard clásico” funciona.
- [ ] `savedViewId` inválido muestra recuperación profesional.
- [ ] `projectId` inválido sigue bloqueando datos cruzados.
- [ ] Persistencia bloqueada muestra recovery panel sin romper la pantalla.
- [ ] Workspace sigue funcionando con fallback si faltan tablas.
- [ ] Rutas clásicas siguen vivas: tasks, projects, boards, reports.

## QA Supabase/RLS

- [ ] Usuario con permisos puede crear tareas.
- [ ] Usuario solo lectura ve acciones bloqueadas con explicación.
- [ ] RLS bloqueando escritura no muestra error crudo.
- [ ] Migraciones faltantes se explican visualmente.

## QA mobile

- [ ] Recovery panel no desborda.
- [ ] Botones de recuperación ocupan ancho correcto.
- [ ] Loading skeleton se ve correcto en mobile.
- [ ] Share panel y Command Center siguen funcionando después de recuperación.

## Comandos

```bash
npm run workspace:error-recovery:ready
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
```
