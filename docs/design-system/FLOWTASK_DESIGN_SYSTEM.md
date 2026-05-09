# FlowTask Design System

## Principio

El sistema visual debe gobernar las pantallas principales de FlowTask. No debe depender de clases sueltas en cada vista.

## Componentes base

- `AppPage`: shell de página con título, subtítulo, kicker y acción principal.
- `AppCard`: card principal, sección, compacta o plain.
- `AppBadge`: estados y chips semánticos.
- `AppToolbar`: filtros, búsqueda y acciones de tabla.
- `AppTabs`: tabs con spacing y bordes consistentes.
- `AppEmptyState`: estados vacíos con mensaje humano y acción.

## Escala tipográfica

- Page title: 28–32px
- Section title: 20–22px
- Card title: 17px
- Body: 15px
- Secondary: 14px
- Meta: 12px

## Botones

- Primary: acción principal de pantalla o formulario.
- Secondary: acciones alternativas.
- Ghost: navegación secundaria.
- Icon: acciones compactas.
- Danger: acciones destructivas.

## Cards

- Main: contenedores principales de página.
- Section: bloques funcionales.
- Compact: bloques pequeños o tips.

## Regla de migración

Toda pantalla nueva debe partir de `AppPage`, `AppCard`, `Button`, `Input`, `Select`, `Textarea`, `AppBadge` y `AppEmptyState` antes de usar clases manuales.
