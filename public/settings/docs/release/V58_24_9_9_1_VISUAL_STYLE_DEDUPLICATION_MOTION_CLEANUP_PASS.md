# v58.24.9.9.1 — Visual Style Deduplication + Motion Cleanup Pass

**Base:** v58.24.9.9 — Visual System Cleanup + Apple Workspace UI Polish

## Problema

v58.24.9.9 creó el sistema visual, pero muchas vistas seguían usando estilos directos repetidos:

```txt
border-[#E5EAF1]
text-[#0F172A]
text-[#64748B]
rounded-[...]
hover:-translate
animate-pulse
```

Eso hacía que el cambio visual se sintiera débil.

## Solución

- Se reemplazan colores directos antiguos por aliases del sistema visual.
- Se reducen movimientos de hover innecesarios.
- Se limpia `rounded-[...]` en pantallas principales.
- Se fortalece el uso de clases `ft-apple-*`.
- Se agrega verificador para evitar regresión de tokens antiguos.

## Alcance

Esta pasada se centra en las pantallas principales de uso:

- Tareas
- Papelera
- Kanban
- Workspace Home
- Detalle de tarea

Los módulos de Projects, Analytics y Boards quedan listos para una siguiente pasada visual si se requiere.
