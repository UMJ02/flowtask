# Flowtask V41 — Home Video Layer Fix

## Objetivo
Asegurar que el video sí quede visible como fondo en desktop y que no vuelva a quedar escondido detrás de capas o estilos del contenedor principal.

## Cambios aplicados
- se reforzó la jerarquía visual:
  - video en capa `z-0`
  - contenido en capa `z-10`
- el video ahora queda anclado full bleed con:
  - `absolute inset-0`
  - `object-cover`
- se eliminó la lógica de fondo desktop que podía taparlo
- el card principal se mantuvo blanco translúcido para separar bien el contenido del fondo

## Resultado esperado
- video visible de forma estable en desktop
- card principal limpio y legible
- composición premium sin romper V40
