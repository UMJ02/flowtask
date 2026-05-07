# FlowTask v58.20 — Task Workspace Pro

Base: v58.19.9 Supabase Live QA + Vercel Verify Fix.

## Objetivo

Rediseñar la vista de detalle de tareas para que funcione como un workspace operativo moderno, alineado al blueprint Task Workspace Pro.

## Cambios incluidos

- Nueva experiencia visual de detalle de tarea con barra sticky secundaria.
- Layout premium 70/30: contenido principal + sidebar inteligente sticky.
- Hero operativo con título, descripción, chips de contexto, estado, prioridad, responsable y fecha límite.
- Checklist como centro operativo de la tarea.
- Progreso corregido: si la tarea no tiene checklist, inicia en 0% en vez de simular avance.
- Recordatorio visual cuando no existe checklist.
- Sidebar de contexto operativo con estado, prioridad, progreso, check-in, responsables, fechas, archivos, etiquetas y bitácora rápida.
- Modo lectura claro para usuarios sin permisos de edición.
- Timeline de actividad presentado en lenguaje humano.
- Se preservan Supabase, RLS, rutas, queries, exportación XLSX real y landing pública.

## Sin cambios de backend

No se agregaron tablas, migraciones ni cambios de RLS. La versión reutiliza los hooks, queries y componentes existentes.

## Verificación

Comando principal:

```bash
npm run verify:v58.20
```

Build recomendado:

```bash
npm run build:preflight
npm run build
```
