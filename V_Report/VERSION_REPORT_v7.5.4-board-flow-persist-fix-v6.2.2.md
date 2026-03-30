# FlowTask v7.5.4 board flow persist fix v6.2.2

- Restaurado texto secundario en tarjetas laterales de paneles.
- Añadida persistencia local de estado de kanban para evitar que una tarea vuelva a su columna anterior durante rerenders o mientras llega el refresco de datos.
- El movimiento entre En progreso, Pendiente y Hecho actualiza Supabase y deja override local hasta que el servidor refleje el cambio.
