# FlowTask — V58.13.1 Workspace v2 PRO

Workspace unificado: Radar inteligente, KPIs, Kanban central y widgets rápidos sobre la base estable V58.12.6.

# FlowTask — V58.12.6 Workspace Catalog + Delete Flow + Task/Project Form Fix

## Qué cambia en la V58.12.6
- Alinea la app con la migración `0038_v58_12_6_database_sanitization_foundation.sql`.
- Corrige el flujo de eliminación de registros/clientes usando RPC segura `delete_workspace_client`.
- Sanea catálogos de países y departamentos con unicidad por scope: global, personal y organización.
- Evita duplicados dentro del mismo workspace sin bloquear catálogos base compartidos.
- Ajusta formularios de tareas y proyectos para recargar y seleccionar correctamente país/departamento al editar.
- Mantiene el deploy de Vercel con `npm run vercel:build`, Node 20.x y `npm ci`.

## Deploy recomendado
1. Ejecutar la migración `0038` en Supabase si no se ha aplicado.
2. Validar localmente:

```bash
npm ci
npm run typecheck
npm run vercel:build
```

3. Subir a GitHub y desplegar en Vercel.
