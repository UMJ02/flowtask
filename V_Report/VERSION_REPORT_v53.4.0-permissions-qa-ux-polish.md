# FlowTask V53.4.0 — Permissions QA + UX Polish

## Base
- Construida sobre V53.3 sin alterar el modelo de datos activo.
- Enfoque: QA operativo, permisos visibles end-to-end y pulido UX para cliente.

## Cambios principales
- Resumen visible de acceso efectivo en organización, proyecto y tarea.
- Acciones sensibles bloqueadas visualmente cuando el usuario no tiene permiso:
  - editar proyecto
  - gestionar miembros de proyecto
  - crear tarea desde proyecto
  - comentar
  - subir/eliminar adjuntos
  - editar tarea
  - asignar/quitar responsables
  - invitar/revocar miembros de organización
- Mensajes de solo lectura para evitar UI engañosa.
- Continuidad de release con migration placeholder 0022.

## Objetivo
- Reducir fricción operativa en QA real.
- Alinear UI con RLS y permisos efectivos sin romper la base estable.
