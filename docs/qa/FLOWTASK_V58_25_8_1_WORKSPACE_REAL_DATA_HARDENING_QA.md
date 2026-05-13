# QA — v58.25.8.1 Workspace Real Data Hardening

## Objetivo QA

Confirmar que `/app/workspace` usa datos reales del workspace activo y mantiene aislamiento entre modo personal/organización, espacios y proyectos.

## Checklist funcional

- [ ] Entrar a `/app/workspace` en modo personal y confirmar que solo muestra datos personales.
- [ ] Cambiar a organización desde el selector actual de workspace y confirmar que el nombre del workspace cambia.
- [ ] Confirmar que los espacios del sidebar salen de departamentos/clientes reales.
- [ ] Abrir `/app/workspace?space=...` y validar que tareas/proyectos se filtran por ese espacio.
- [ ] Abrir `/app/workspace?projectId=ID_REAL` y validar que el header muestra ese proyecto.
- [ ] Abrir `/app/workspace?projectId=ID_INVALIDO` y validar que aparece aviso de aislamiento y no se muestran datos cruzados.
- [ ] Probar `?status=en_espera`, `?status=concluido`, `?status=en_proceso`.
- [ ] Cambiar tabs `list`, `board`, `timeline`, `table`, `canvas`, `files`, `reports` sin perder contexto.
- [ ] Validar que el panel derecho muestra vencimientos reales ordenados.
- [ ] Confirmar que no se crearon tablas nuevas ni migraciones.

## Checklist CLI

```bash
npm run verify:current
npm run typecheck
npm run design:doctor
npm run density:guard
npm run density:guard:strict
npm run build:preflight
npm run build
```

## Criterio de aceptación

La versión queda aceptada si `/app/workspace` centraliza datos reales sin mezclar personal/organización, sin fallback inseguro de proyecto inválido y sin romper las rutas existentes.
