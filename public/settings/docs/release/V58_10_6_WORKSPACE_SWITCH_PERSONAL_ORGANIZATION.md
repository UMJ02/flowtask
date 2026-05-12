# FlowTask — V58.10.6 Workspace Switch Personal + Organization

Esta versión toma como base **V58.10.5** y corrige el comportamiento del workspace activo para que el usuario pueda alternar entre **modo personal** y **organizaciones** sin perder acceso a sus datos previos.

## Objetivo
- mantener el workspace personal siempre disponible
- permitir cambiar entre espacio personal y organizaciones como en apps modernas
- evitar que crear o aceptar una organización oculte permanentemente tareas y proyectos individuales
- alinear las queries para que el contexto personal filtre `organization_id = null`

## Qué cambia en la V58.10.6
- nuevo selector real de workspace con opción **Workspace personal** y organizaciones
- persistencia del workspace activo mediante cookie segura de preferencia
- nuevas rutas para cambiar el workspace activo desde la app
- `getWorkspaceContext` y `getClientWorkspaceContext` respetan la preferencia activa
- queries personales de tareas/proyectos vuelven a usar el scope personal
- crear o aceptar una organización sigue permitiendo volver al modo personal inmediatamente

## Resultado esperado
Un usuario puede trabajar de forma individual, crear o aceptar una organización y alternar entre ambos contextos sin mezclar datos ni perder visibilidad de sus tareas anteriores.
