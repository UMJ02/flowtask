# Flowtask V6 — Full Functional QA

## Objetivo
Llevar la base más cerca de cliente con una capa clara de validación funcional del core.

## Cambios incluidos
- Se añadieron scripts de QA funcional:
  - `npm run qa:functional`
  - `npm run qa:report`
  - `npm run qa:full-client`
- Se agregó precheck estructural para:
  - login
  - register
  - forgot password
  - app shell
  - health/ready endpoints
  - contratos básicos de `.env.example`
- Se agregó generador de reporte local:
  - `V_Report/QA_EXECUTION_REPORT_v6.md`

## Alcance de esta versión
Esta versión no inventa una validación remota que no se ejecutó en este entorno.
Sí deja una base más seria para correr QA local de punta a punta sobre:
- autenticación
- dashboard
- tareas
- proyectos
- notificaciones
- endpoints de salud

## Ejecución recomendada local
```bash
npm install
npm run validate:env
npm run doctor:supabase
npm run qa:smoke-local
npm run qa:functional
npm run qa:report
npm run build
npm run smoke:health
```

## Resultado esperado
Dejar evidencia clara y repetible para la siguiente fase:
UX/UI premium + cierre de bugs reales encontrados durante QA.
