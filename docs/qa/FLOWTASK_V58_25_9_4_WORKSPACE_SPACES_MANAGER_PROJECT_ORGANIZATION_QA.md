# QA — v58.25.9.4 Workspace Spaces Manager + Project Organization

## Checklist funcional
- [ ] `/app/workspace` carga sin romper shell full-screen.
- [ ] El botón “Espacios” abre `WorkspaceSpacesManager`.
- [ ] Si `workspace_spaces` está disponible, se puede crear espacio.
- [ ] El espacio creado aparece en sidebar.
- [ ] Se puede renombrar un espacio.
- [ ] Se puede archivar un espacio.
- [ ] Si `workspace_space_projects` está disponible, se puede asignar proyecto.
- [ ] Al abrir un espacio persistido, solo se muestran proyectos asignados.
- [ ] Las tareas visibles pertenecen a proyectos asignados.
- [ ] Quitar proyecto del espacio actualiza sidebar y vista.

## Checklist Supabase
- [ ] `workspace_spaces` existe.
- [ ] `project_views` existe.
- [ ] `workspace_space_projects` existe.
- [ ] RLS está activo en `workspace_space_projects`.
- [ ] Policy SELECT permite lectura por dueño/miembro de organización.
- [ ] Policy WRITE permite edición por owner/editor/admin/manager.
- [ ] El trigger `workspace_space_projects_set_updated_at` existe.

## Checklist regresión
- [ ] `/app/tasks` sigue funcionando.
- [ ] `/app/projects` sigue funcionando.
- [ ] `/app/boards` sigue funcionando.
- [ ] `/app/reports` sigue funcionando.
- [ ] Saved Views Manager sigue guardando/abriendo vistas.
- [ ] Canvas/Boards no cambió su borrado con `safe_delete_visual_board`.

## Comandos
```bash
npm run workspace:doctor
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
```
