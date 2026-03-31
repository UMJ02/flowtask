# FlowTask V2 – Workspace alignment

## Objetivo
Alinear la pizarra y los formularios principales con el modelo multi-tenant de Supabase.

## Cambios incluidos
- nueva utilidad cliente para resolver contexto de workspace activo
- board ahora lee tareas y proyectos con scope de organización activa o owner fallback
- board persiste su estado principal en `boards.layout_config.interactiveDashboardBoard`
- board mantiene fallback en localStorage para resiliencia del cliente
- creación de tareas desde board respeta `organization_id`
- formularios de tareas y proyectos ahora insertan `organization_id` cuando existe membresía activa
- formularios intentan resolver `client_id` por nombre dentro de la organización activa

## Base utilizada
- flowtask_v1_full_source.zip

## Nota de validación
En este entorno no fue posible ejecutar una validación TypeScript completa porque el ZIP de trabajo no trae dependencias instaladas. La revisión se centró en coherencia estructural de código fuente y alineación con el schema actual.
