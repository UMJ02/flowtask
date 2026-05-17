# QA — v58.28.2 Workspace Pro Action Model + Progressive Disclosure

## CLI

```bash
npm run verify:current
npm run workspace:action-model:ready
npm run workspace:user-final-ui:ready
npm run workspace:production-ux:ready
npm run build:preflight
npm run vercel:build
```

## UX visual

- Board no debe mostrar chips repetidos para mover tareas dentro de cada card.
- Cada card debe mostrar solo `⋯` como entrada a acciones secundarias.
- El menú `⋯` debe permitir cambiar estado, cambiar prioridad, editar rápido, abrir detalle y editar completa.
- Board debe mantener drag/drop entre columnas.
- El control global de columnas debe seguir funcionando.
- Las tareas concluidas deben seguir ocultas por defecto.

## Lista

- La acción visible por fila debe ser mínima.
- `Gestionar` abre edición rápida contextual.
- El ícono de edición completa sigue disponible como acción secundaria visual mínima.

## Espacios

- La vista debe verse como experiencia de usuario final, no como pantalla técnica.
- No debe mostrar `workspace_spaces: OK` de forma permanente.
- El diagnóstico técnico solo debe aparecer dentro de `details` cuando el estado lo requiera.
- La asignación de proyectos debe estar dentro de disclosure para reducir ruido.

## Mobile

- El menú de acciones debe comportarse como bottom sheet compacto.
- No debe generar overflow horizontal.
- El formulario de espacios debe apilarse correctamente.
