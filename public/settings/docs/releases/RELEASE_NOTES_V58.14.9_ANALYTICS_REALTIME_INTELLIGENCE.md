# FlowTask V58.14.9 Analytics Realtime Intelligence PASS

Base: V58.14.8 Product Logic Normalization PASS.

## Objetivo
Convertir Analytics en una vista operativa basada en datos reales, sin métricas fake de horas/personas y sin contaminar vencidos con tareas concluidas o en espera.

## Cambios
- Analytics usa series reales de tareas creadas, concluidas y vencimientos activos.
- KPIs reemplazados por métricas operativas reales: tareas operativas, en espera, concluidas, vencidas reales, comentarios/adjuntos.
- Donut usa distribución real de estados.
- Progreso por proyecto se calcula desde tareas reales del proyecto.
- Carga operativa se calcula por cliente/departamento, no por horas falsas.
- Export CSV real del resumen de analytics.
- Documentación de versiones movida a `docs/releases` para evitar archivos sueltos en raíz.

## Reglas respetadas
- No tocar package.json.
- No tocar vercel.json.
- No agregar schema nuevo.
- Mantener normalización V58.14.8: concluidas ocultas de operación y en espera no cuenta como vencida.
