# QA — v58.25.8.5 Workspace Full-Screen Shell + Navigation Polish

## Release metadata
- [ ] `package.json` usa `58.25.8.5-workspace-full-screen-shell-navigation-polish`.
- [ ] `verify:current` apunta a `verify:v58.25.8.5`.
- [ ] `src/lib/release/version.ts` coincide con v58.25.8.5.
- [ ] `scripts/verify-v58.25.8.5.mjs` existe y pasa.
- [ ] Readiness scripts esperan v58.25.8.5.

## Full-screen shell
- [ ] `/app/workspace` carga sin el `AppHeader` clásico.
- [ ] `/app/workspace` carga sin el `AppFooter` clásico.
- [ ] `/app/workspace` carga sin el `AppSidebar` clásico.
- [ ] Las demás rutas conservan su shell normal.
- [ ] La pantalla no necesita compensaciones `-mx-5/-my-5`.

## Sidebar Workspace
- [ ] Muestra Workspace Pro.
- [ ] Muestra botón para volver al dashboard clásico.
- [ ] Las vistas del proyecto cambian entre Lista, Board, Timeline, Tabla, Canvas/Pizarras y Reportes.
- [ ] El estado activo de la view se marca correctamente.
- [ ] Espacios reales y proyectos filtrados siguen visibles.
- [ ] El acceso a Biblioteca de Pizarras abre `/app/boards`.

## Navegación
- [ ] Cambiar filtro de estado usa navegación suave y refresca datos.
- [ ] Los query params `view`, `space`, `projectId` y `status` se preservan donde corresponde.
- [ ] Desde el AppSidebar clásico se puede entrar a `Workspace Pro`.

## Restricciones
- [ ] No se agregaron migraciones.
- [ ] No se crearon `workspace_spaces` ni `project_views`.
- [ ] No se reemplazó ninguna ruta legacy.
- [ ] No se tocó `safe_delete_visual_board`.
- [ ] No se agregaron dependencias nuevas.
