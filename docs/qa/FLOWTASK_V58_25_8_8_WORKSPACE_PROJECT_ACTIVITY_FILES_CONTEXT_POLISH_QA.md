# QA — v58.25.8.8 Workspace Project Activity + Files Context Polish

## Validación técnica

- [ ] `package.json` usa `58.25.8.8-workspace-project-activity-files-context-polish`.
- [ ] `verify:current` apunta a `verify:v58.25.8.8`.
- [ ] `src/lib/release/version.ts` coincide con v58.25.8.8.
- [ ] `scripts/verify-v58.25.8.8.mjs` existe y pasa.
- [ ] Readiness scripts esperan v58.25.8.8.

## Workspace

- [ ] `/app/workspace` carga sin romper el shell full-screen.
- [ ] El panel derecho muestra actividad del proyecto/workspace.
- [ ] El panel derecho muestra archivos recientes.
- [ ] La vista Archivos muestra adjuntos reales cuando existen.
- [ ] La vista Archivos conserva las pizarras conectadas.
- [ ] El filtro por proyecto limita archivos/actividad al contexto activo cuando aplica.
- [ ] Si no hay actividad o adjuntos, se muestra estado vacío profesional.

## Seguridad / arquitectura

- [ ] No se agregaron migraciones.
- [ ] No se crearon tablas `workspace_spaces` ni `project_views`.
- [ ] No se duplicó BoardPage.
- [ ] No se tocó `safe_delete_visual_board`.
- [ ] No se reemplazaron rutas legacy.

## Comandos

```bash
npm run verify:current
npm run typecheck
npm run build:preflight
npm run build
```
