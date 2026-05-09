# QA — v58.21.7 Style Cascade Reset

## CLI

```bash
npm run verify:v58.21.7
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```

## Checklist visual

1. Abrir `/app/tasks` y confirmar tablas/listas compactas.
2. Abrir `/app/projects` y confirmar filtros sin estilos pesados.
3. Abrir `/app/tasks/new` y confirmar inputs compactos.
4. Abrir `/app/projects/new` y confirmar cards sin sombra decorativa.
5. Abrir `/app/tasks/[id]` y revisar feed, tabs y adjuntos.
6. Abrir `/app/projects/[id]` y revisar hero, tareas internas y archivos.
7. Abrir `/login`, `/register`, `/forgot-password` y `/reset-password`.
8. Confirmar que auth no usa radius gigante ni sombra pesada.
9. Abrir command palette/mobile nav y confirmar que la sombra solo existe en UI flotante.
10. Validar reduced motion si el sistema operativo lo tiene activo.
