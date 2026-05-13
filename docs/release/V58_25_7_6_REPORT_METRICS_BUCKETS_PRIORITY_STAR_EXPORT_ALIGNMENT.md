# v58.25.7.6 — Report Metrics Buckets + Priority Star Export Alignment

## Base

v58.25.7.5 — Boards Create Card Red Accent + Color Cover Previews

## Objetivo

Alinear métricas, reporte público y Excel con la regla operativa real del usuario:

1. Estrella / `priority = alta` => Importantes.
2. Sin estrella + fecha en semana actual => Semana actual.
3. Sin estrella + fecha en mes actual fuera de semana => Mes actual.
4. Sin estrella + fecha posterior al mes => Próximas.
5. Sin estrella + sin fecha => Sin fecha.
6. En espera => módulo separado.

## Cambios

- `reportModules.dayTasks` se reemplaza por `importantItems`.
- `weeklyInProgress` se reemplaza por `currentWeekItems`.
- Se agregan `currentMonthItems`, `upcomingItems`, `undatedItems`.
- El Excel cambia "Tareas del día" por "Importantes".
- La hoja exportada agrega columna `Tipo` para Tarea / Proyecto.
- Los proyectos activos se incluyen en Semana/Mes/Próximas/Sin fecha.
- Las tareas importantes no se duplican en semana/mes.
- `Diccionario` explica la nueva lógica.
