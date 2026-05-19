# FlowTask v58.28.21.4 — Share Landing Short Link QA

## Objetivo
Validar que los reportes compartidos usen enlaces cortos guardados en Supabase y que el enlace legacy `/share?data=...` siga funcionando como fallback.

## Checklist
- Ejecutar la migración `0061_v58_28_21_4_shared_report_tokens.sql`.
- Abrir Analytics / Reportes.
- Usar `Copiar link corto`.
- Confirmar que el link tenga forma `/share/rpt_...`.
- Abrir el link en una ventana anónima.
- Confirmar que carga métricas, comentarios, avance y checklist.
- Confirmar que el botón PDF abre `/share/rpt_...?print=1`.
- Confirmar que si falla el API, la app mantiene fallback `/share?data=...`.
