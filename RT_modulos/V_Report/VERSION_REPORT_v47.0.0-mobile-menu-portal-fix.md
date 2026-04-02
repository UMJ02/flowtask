# Flowtask V47 — Mobile Menu Portal Fix

## Objetivo
Corregir el menú desplegable móvil para que no quede visualmente metido dentro del header y se vea como una capa completa e independiente.

## Cambios aplicados
- el menú móvil ahora se renderiza con portal en `document.body`
- se fuerza como capa full screen independiente
- se bloquea el scroll del body mientras el menú está abierto
- se mantiene el diseño visual actual del drawer

## Resultado esperado
- menú móvil completamente visible
- fuera del contenedor visual del header
- experiencia más limpia y profesional
