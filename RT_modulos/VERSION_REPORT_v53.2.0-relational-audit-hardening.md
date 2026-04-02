# FlowTask V53.2.0 — Relational Audit & Hardening

## Objetivo
Completar la capa de trazabilidad operativa sin romper la base V53.1, agregando contexto relacional a la bitácora y exponiendo actividad útil en organización, proyectos y tareas.

## Incluye
- `activity_logs` extendido con `organization_id`, `client_id`, `project_id`, `task_id`
- políticas de lectura auditada por alcance
- triggers de gobierno para clientes, miembros, invitaciones y permisos
- bitácora visible en organización, proyecto y tarea
- logging cliente-side en formularios y acciones operativas
- versión `53.2.0-relational-audit-hardening`

## Aplicación SQL
Ejecutar `supabase/migrations/0020_v53_2_relational_audit_hardening.sql` en Supabase SQL Editor sobre la base actual.
