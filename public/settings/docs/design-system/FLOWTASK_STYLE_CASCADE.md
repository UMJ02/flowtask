# FlowTask Style Cascade Reset

Base: v58.21.7.

## Principio

FlowTask usa una cascada visual única: base, components y utilities. No se acumulan capas de versiones anteriores ni overrides globales que apaguen estilos por fuerza.

## Superficies

- Normal: borde + fondo, sin sombra.
- Interactiva: borde más visible y movimiento de 1px.
- Flotante: sombra nombrada mediante `ft-floating-card`.
- Overlay: sombra nombrada mediante `ft-overlay-card`.

## Densidad

- App productiva: compacta.
- Formularios de creación: medio compactos.
- Auth/marketing: relajados, pero sin sombras pesadas.

## Motion

- Hover: transición suave de 130–180ms.
- Expandir: fade + escala vertical sutil.
- Drawer/dropdown: slide corto.
- Reduced motion: desactiva animaciones.

## Regla de mantenimiento

No usar en pantallas core:

- `rounded-[34px]`
- `shadow-[0_30px...]`
- `shadow-[0_24px_60px...]`
- `min-h-[64px]`
- `sm:text-[32px]`
- overrides globales tipo `body [class*="shadow-"]`

Si un componente necesita sombra, debe usar variante flotante u overlay.
