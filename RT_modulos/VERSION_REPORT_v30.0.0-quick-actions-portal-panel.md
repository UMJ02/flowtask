# Flowtask V30 — Quick Actions Portal Panel

## Objetivo
Sacar por completo el panel de acciones rápidas del contenedor del hero para que no se corte ni herede clipping visual.

## Cambios aplicados
- el botón `Acción rápida` sigue inline en el hero
- el panel ya no se renderiza dentro del árbol visual del hero
- ahora se monta con `portal` directamente en `document.body`
- el panel sigue entrando desde la derecha
- se mantiene la X de cierre y el overlay suave

## Resultado esperado
- panel flotante realmente independiente
- sin cortes dentro del hero
- apertura más limpia y profesional
