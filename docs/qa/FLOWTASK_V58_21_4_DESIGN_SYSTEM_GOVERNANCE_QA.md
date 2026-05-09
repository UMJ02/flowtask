# QA — v58.21.4 Design System Governance + Core Screen Migration

## Checklist visual

### Pantallas principales

- [ ] `/app/projects` usa una estructura visual más consistente.
- [ ] `/app/tasks` usa escala de título, cards y botones alineada.
- [ ] Las cards no compiten por tamaños ni sombras.
- [ ] Los botones principales y secundarios tienen alturas consistentes.
- [ ] Las tablas usan encabezados y celdas con spacing estable.
- [ ] Los filtros no se desbordan en desktop/tablet.

### Sistema visual

- [ ] `AppPage` existe y puede gobernar páginas nuevas.
- [ ] `AppCard` existe para evitar cards manuales.
- [ ] `AppBadge` existe para estados/chips.
- [ ] `AppToolbar` existe para filtros y barras de acciones.
- [ ] `AppEmptyState` existe para estados vacíos.
- [ ] `AppTabs` existe para tabs consistentes.

### No regresiones

- [ ] No se agregaron migraciones Supabase.
- [ ] No se tocaron RLS ni contratos de datos.
- [ ] Crear tarea sigue funcionando.
- [ ] Crear proyecto sigue funcionando.
- [ ] Editar proyecto inline sigue funcionando.
- [ ] Feed operativo de v58.21.2 se mantiene.
- [ ] Thumbnails de adjuntos se mantienen.

## CLI

```bash
npm run verify:v58.21.4
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
