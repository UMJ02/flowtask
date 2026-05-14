# FlowTask v58.26.0 — Production Checklist

## 1. Entorno
- [ ] Node 20.x activo.
- [ ] `.env.local` con variables reales.
- [ ] `NEXT_PUBLIC_SUPABASE_URL` apunta al proyecto correcto.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` pertenece al mismo project ref.
- [ ] Vercel Environment Variables alineadas.

## 2. CLI
- [ ] `npm run workspace:doctor`
- [ ] `npm run workspace:production:ready`
- [ ] `npm run verify:current`
- [ ] `npm run typecheck`
- [ ] `npm run build:preflight`
- [ ] `npm run build`

## 3. Supabase
- [ ] `workspace_spaces` existe.
- [ ] `project_views` existe.
- [ ] `workspace_space_projects` existe.
- [ ] RLS activo.
- [ ] Policies de lectura y escritura validadas.
- [ ] `project_views_view_type_check` acepta `home`.
- [ ] `safe_delete_visual_board` sigue existiendo.

## 4. Workspace
- [ ] `/app/workspace` carga en modo full-screen.
- [ ] Home carga por defecto.
- [ ] Sidebar muestra espacios/proyectos.
- [ ] Command Center abre con `⌘K`.
- [ ] Right Panel muestra health y contexto.
- [ ] Mobile drawer funciona.

## 5. Views
- [ ] Home.
- [ ] Lista.
- [ ] Board.
- [ ] Timeline.
- [ ] Tabla.
- [ ] Canvas.
- [ ] Archivos.
- [ ] Reportes.

## 6. Rutas clásicas
- [ ] `/app/tasks`
- [ ] `/app/projects`
- [ ] `/app/boards`
- [ ] `/app/reports`

## 7. Producción
- [ ] Deploy preview Vercel.
- [ ] Smoke test login.
- [ ] Smoke test workspace personal.
- [ ] Smoke test workspace organización.
- [ ] Smoke test saved views.
- [ ] Smoke test spaces.
- [ ] Smoke test files.
- [ ] Smoke test boards.
