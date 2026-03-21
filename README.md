# FlowTask v6.1 Full

Base completa regenerada a partir de v5, empaquetada de nuevo para descarga estable.

## Qué trae esta versión
- Login, registro, recuperación y reset de contraseña por correo.
- Dashboard privado con panel tipo pizarra.
- CRUD funcional para tareas, proyectos y recordatorios.
- Pantallas de edición para tareas y proyectos.
- Comentarios con fecha automática.
- Invitación de colaboradores por correo en proyectos.
- Enlaces compartidos de solo lectura para tarea y proyecto.
- SQL y seed incluidos en `supabase/migrations` y `supabase/seed.sql`.
- Script `scripts/process-reminders.ts` para procesar recordatorios pendientes y marcar `sent_at`.

## Configuración
1. Copiar `.env.example` a `.env.local`
2. Completar:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
SUPABASE_SERVICE_ROLE_KEY=
```

3. Instalar dependencias:

```bash
npm install
```

4. Levantar el proyecto:

```bash
npm run dev
```

## Procesar recordatorios

```bash
npm run process-reminders
```

El script busca recordatorios con `sent_at IS NULL` y `remind_at <= now()` y los marca como enviados.

## Importante
- La base de esta versión es exactamente v5.
- Esta regeneración es completa para evitar zips incompletos o vacíos.
- El tablero principal sigue siendo privado; solo se comparten vistas públicas de tarea o proyecto.


## Realtime base (v7.2)

This version adds a realtime-ready foundation using Supabase Realtime.

Included:
- `src/lib/realtime/channel.ts`
- `src/hooks/use-task-comments-realtime.ts`
- `src/hooks/use-project-comments-realtime.ts`
- `src/hooks/use-project-tasks-realtime.ts`
- `src/components/ui/live-indicator.tsx`
- `supabase/migrations/0003_realtime.sql`

### Activation
1. Run the new migration.
2. In Supabase, confirm Realtime is enabled for `comments`, `tasks`, and `projects`.
3. Keep `NEXT_PUBLIC_ENABLE_REALTIME=true` in your environment.

### Suggested use
Use the hooks in detail views to trigger `router.refresh()` or invalidate your local query cache whenever a relevant comment, task, or project changes.


## v7.3

- Realtime montado en pantallas de detalle de tarea y proyecto.
- `router.refresh()` automático al detectar nuevos comentarios o cambios en tareas del proyecto.
- Indicador visual `En vivo` en comentarios y tareas del proyecto.


## Novedades v7.4

- Tablero Kanban en `/app/tasks` con arrastre y cambio rápido de estado.
- Métricas por departamento en dashboard.
- Salud de proyectos con cierre y carga colaborativa.


## v7.8

- Exportación CSV de tareas y proyectos desde `/app/reports`
- Vista lista para imprimir y guardar en PDF desde `/app/reports/print`
- Gestión más fina de permisos en miembros de proyecto (`owner`, `editor`, `viewer`)
- Migration nueva: `supabase/migrations/0004_project_member_roles.sql`


## v7.9
- Adjuntos por tarea y proyecto usando bucket `attachments`.
- Permisos por sección para proyectos (`overview`, `tasks`, `comments`, `members`, `files`, `reports`).
- Migration nueva: `0005_attachments_and_section_permissions.sql`.


## v8.0
- Bitácora de actividad en tareas y proyectos.
- Centro de notificaciones dentro de `/app/notifications`.
- Timeline visual con actividad reciente.
- Migration `0006_activity_notifications.sql`.


## v8.1

- Notificaciones en tiempo real sin refresh en `/app/notifications`
- Badge en el header con cantidad de no leídas
- Toasts visuales cuando entra una notificación nueva
- `scripts/process-reminders.ts` ahora crea notificaciones internas y puede disparar webhooks opcionales para email o WhatsApp
- Nueva migration: `0007_notifications_realtime.sql`


## v8.2
- badge de notificaciones también en sidebar
- botón para marcar visibles como leídas
- filtros por tipo dentro del centro de notificaciones


## v8.5
- preferencias de notificaciones por usuario
- activación por tipo (tareas, proyectos, comentarios, recordatorios)
- frecuencia inmediata o resumen diario
- base lista para canal email y WhatsApp desde configuración
