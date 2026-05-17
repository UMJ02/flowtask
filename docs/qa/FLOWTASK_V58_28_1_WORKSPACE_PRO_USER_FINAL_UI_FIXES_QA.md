# QA — v58.28.1 Workspace Pro User Final UI Fixes

## Validar en navegador

1. Workspace > Board > modo Completas:
   - Los botones de movimiento deben verse pequeños.
   - Las tarjetas no deben crecer innecesariamente por acciones.
   - Editar debe mantenerse como chip compacto.

2. Editar tarea desde Board:
   - Estado, Prioridad, Abrir detalle y Editar completa deben quedar en una misma línea en desktop.
   - Guardar, Cerrar y Borrar no deben pelear visualmente con la línea de edición rápida.

3. Espacios:
   - El modal/sheet debe abrir amplio.
   - El formulario no debe solaparse.
   - Color, icono y Crear deben alinearse sin invadir el estado de persistencia.
   - En mobile debe apilarse correctamente.

## CLI

```bash
npm run verify:current
npm run workspace:user-final-ui:ready
npm run workspace:production-ux:ready
npm run build:preflight
npm run vercel:build
```
