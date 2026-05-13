# QA — FlowTask v58.25.8 Workspace-First Foundation

## Checklist técnico

- [ ] `npm run verify:current` pasa.
- [ ] `npm run typecheck` pasa.
- [ ] `npm run build:preflight` pasa con `.env` real.
- [ ] `npm run build` pasa con Node 20.x.
- [ ] La ruta `/app/workspace` carga sin romper AppShell.
- [ ] `/app/tasks`, `/app/projects`, `/app/boards` y `/app/reports` siguen funcionando.

## Checklist UX

- [ ] Sidebar muestra workspace, accesos globales, espacios y proyectos.
- [ ] Header muestra Workspace / Espacio / Proyecto.
- [ ] Tabs superiores cambian views usando `?view=`.
- [ ] Cambiar de Lista a Board/Timeline/Tabla/Canvas/Archivos/Reportes conserva el contexto.
- [ ] Panel derecho muestra resumen, vencimientos e IA contextual.
- [ ] La experiencia se parece al PDF: sidebar oscura, header contextual, tabs superiores, panel derecho y centro dinámico.

## Checklist datos reales

- [ ] Lista muestra tareas reales.
- [ ] Board agrupa las mismas tareas por estado.
- [ ] Timeline usa tareas con fecha.
- [ ] Tabla usa tareas reales.
- [ ] Reportes usan `getReportsOverview` cuando está disponible.
- [ ] `?projectId=ID` filtra tareas del proyecto.
- [ ] No hay datos quemados como fuente principal de la operación.

## Checklist Supabase

- [ ] No se requieren migraciones para esta versión.
- [ ] No se crean tablas `workspace_spaces` ni `project_views` todavía.
- [ ] Se respeta RLS porque la carga sigue usando queries server existentes.
- [ ] No se toca `safe_delete_visual_board` ni políticas de pizarras.

## Riesgos a revisar manualmente

- El header global actual puede seguir presente por AppShell; en una fase posterior puede crearse `WorkspaceFullShell`.
- Quick create es visual en esta foundation; la creación real debe venir en v58.25.8.1 o v58.25.8.2.
- Canvas está preparado visualmente; la conexión profunda con BoardPage debe hacerse en una versión posterior.
