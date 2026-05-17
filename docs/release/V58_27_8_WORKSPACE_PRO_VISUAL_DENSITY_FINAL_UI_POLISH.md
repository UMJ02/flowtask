# v58.27.8 — Workspace Pro Visual Density + Final UI Polish

## Objetivo

Cerrar la etapa visual del Workspace Pro después de v58.27.7.1, reduciendo la sensación de interfaz centrada/pegada y mejorando densidad, ancho útil, jerarquía, navegación y lectura sin tocar Supabase ni migraciones.

## Base obligatoria

- Base: v58.27.7.1 — Workspace Pro Render Diet CLI Hotfix.
- Mantiene Render Diet de v58.27.7.
- Mantiene Deep Cleanup + 2026 UI Controls de v58.27.6.

## Cambios UX/UI aplicados

- Sidebar desktop ampliado de 248px a 264px para mejorar lectura de espacios/proyectos.
- Contenido principal usa `ws-pro-content` y frames de hasta 1440px para evitar cards demasiado centradas.
- Home usa un layout más ancho con dock derecho de 320/340px.
- Se agrega `ws-pro-utility-dock` sticky para Hoy, Nota rápida y Acciones rápidas.
- Cards principales usan `ws-pro-clean-card` con bordes más suaves, radius 2xl y sombra sutil.
- Tabs superiores usan `ws-pro-tabs-strip` para verse como control pro compacto.
- Vistas Lista, Proyectos, Board, Timeline, Tabla, Canvas, Archivos y Reportes usan `ws-pro-view-frame`.
- Board mantiene columnas configurables, concluidas ocultables, drag/drop y edición rápida, pero con mejor ancho útil.
- Timeline/Tabla/Canvas dejan de verse angostos y aprovechan el mismo ancho visual.

## Scripts nuevos

```bash
npm run workspace:visual-density:ready
npm run verify:v58.27.8
```

`build:preflight` ahora incluye `workspace:visual-density:ready` antes de `typecheck`.

## No incluido

- No migraciones.
- No cambios RLS.
- No cambios en Supabase.
- No cambios en `safe_delete_visual_board`.
- No reemplazo de rutas clásicas.
- No dependencias nuevas.

## Resultado esperado

Workspace Pro debe sentirse más abierto, menos comprimido, con mejor jerarquía visual y con menos cards flotando en el centro. Esta versión prepara la línea para una siguiente fase de UX funcional por vista, por ejemplo Lista Pro / Board Pro / Projects Nested Polish.
