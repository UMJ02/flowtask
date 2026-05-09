# QA — v58.21.6 Visual Rhythm

## Checklist visual

1. Abrir `/app/tasks/new` y confirmar que el título del formulario ya no se siente gigante.
2. Abrir `/app/projects/new` y confirmar que la card principal se siente más compacta.
3. Abrir `/app/tasks/[id]` y confirmar que título, botones y acciones conservan jerarquía sin exceso de tamaño.
4. Abrir `/app/projects/[id]` y confirmar que hero, tabs, miembros y archivos se sienten más densos.
5. Abrir `/app/projects` y `/app/tasks`; revisar tabla, filtros y acciones.
6. Confirmar que cards normales no tienen sombras decorativas.
7. Confirmar que modales/drawers/dropdowns conservan sombra si aparecen.
8. Confirmar que hover y active scale son sutiles.
9. Validar responsive mobile y tablet.
10. Confirmar que crear/editar/guardar sigue funcionando.

## CLI

```bash
npm run verify:v58.21.6
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
