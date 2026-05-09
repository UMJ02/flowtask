# v58.24.5 — Board Toolbar Collapse Animation Fix

Base: v58.24.4 — Board Premium Visual System + Motion Polish  
Estado: production-candidate

## Objetivo

Corregir el bug visual detectado en la paleta de herramientas del módulo Pizarra: al contraer la toolbar, los iconos superiores se desbordaban y durante la animación los textos/tooltips podían verse fuera del contenedor o generar un efecto oscuro extraño.

## Cambios aplicados

- Se separó el header expandido del header colapsado.
- En modo colapsado ya no se renderizan tres controles superiores en una fila pequeña.
- El botón de ocultar en modo colapsado se movió a un footer compacto.
- Se agregó `changeMode()` para cerrar popovers antes de expandir/contraer/ocultar.
- Se actualizó el `localStorage` de toolbar a `flowtask.board.toolbar.v58.24.5`.
- Se reforzó CSS para evitar overflow visual en `board-tool-palette-collapsed`.
- Se cambió el tooltip oscuro por tooltip claro tipo glass para evitar el “fondo negro” durante la animación.
- Se mantuvieron las funciones de mover toolbar, expandir, contraer, ocultar, mostrar, herramientas, Más y Limpiar pizarra.

## Sin cambios de backend

- No agrega migraciones.
- No toca Supabase.
- No toca RLS.
- No toca Storage.
- No toca Realtime.
- No cambia contratos de datos.

## Validación esperada

```bash
npm run verify:v58.24.5
npm run typecheck
npm run build:preflight
npm run build
```
