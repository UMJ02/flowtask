# V58.12 — Workspace Isolation Hardening Pro Level

## Objetivo
Blindar el aislamiento entre workspace personal y múltiples organizaciones para que cada contexto opere como un mundo independiente.

## Cambios
- resolución del workspace activo ignora organizaciones eliminadas
- fallback a personal cuando no existe workspace organizacional válido
- cambio de workspace actualiza `is_default` de forma consistente
- organización eliminada deja de quedar como default
- reactivación vuelve a marcar la organización activa como default
- catálogos de clientes/departamentos/países endurecidos por scope
- helpers server-side filtran personal por `owner_id` + `organization_id is null`

## Resultado esperado
- Personal, Organización A, Organización B y demás workspaces operan con datos separados
- crear o eliminar una organización no arrastra datos del espacio personal
- si un workspace queda eliminado, la app vuelve al contexto personal sin romper el dashboard
