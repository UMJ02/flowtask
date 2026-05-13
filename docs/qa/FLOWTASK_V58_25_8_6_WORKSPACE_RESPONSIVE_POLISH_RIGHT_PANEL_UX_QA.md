# QA — v58.25.8.6 Workspace Responsive Polish + Right Panel UX

## Validación técnica
- [ ] `package.json` usa `58.25.8.6-workspace-responsive-polish-right-panel-ux`.
- [ ] `verify:current` apunta a `verify:v58.25.8.6`.
- [ ] `src/lib/release/version.ts` coincide con v58.25.8.6.
- [ ] `scripts/verify-v58.25.8.6.mjs` existe y pasa.
- [ ] Readiness scripts esperan v58.25.8.6.
- [ ] `npm run typecheck` pasa con Node 20.
- [ ] `npm run build:preflight` pasa con `.env` real.
- [ ] `npm run build` pasa con Node 20.

## QA responsive
- [ ] En desktop ancho, `/app/workspace` mantiene sidebar lateral fija.
- [ ] En desktop ancho, el panel derecho queda sticky y no tapa el contenido central.
- [ ] En desktop, el botón `Panel` muestra/oculta el panel derecho.
- [ ] En tablet/mobile, aparece botón `Workspace` arriba.
- [ ] El botón `Workspace` abre drawer lateral oscuro.
- [ ] El drawer móvil se puede cerrar tocando fuera.
- [ ] El drawer móvil se cierra al navegar a view, espacio o proyecto.
- [ ] El botón `Resumen` muestra/oculta el panel derecho en mobile.
- [ ] Las tabs superiores hacen scroll horizontal sin romper layout.
- [ ] La action bar acomoda botones en dos columnas en mobile.

## QA panel derecho
- [ ] Muestra título/contexto real del workspace/proyecto.
- [ ] Muestra progress ring con porcentaje real.
- [ ] Muestra conteos de en curso, pendientes y completadas.
- [ ] Muestra mini métricas: Importantes, Vencidas, Hoy y Proyectos.
- [ ] Próximos vencimientos ordena fechas y muestra proyecto/contexto.
- [ ] Si no hay vencimientos, muestra empty state profesional.
- [ ] IA contextual muestra señal principal según datos reales.

## QA no regresión
- [ ] `/app/tasks` sigue funcionando.
- [ ] `/app/projects` sigue funcionando.
- [ ] `/app/boards` sigue funcionando.
- [ ] `/app/reports` sigue funcionando.
- [ ] No se agregaron migraciones.
- [ ] No se crearon tablas nuevas.
- [ ] No se modificó `safe_delete_visual_board`.
