# FlowTask V58.14.7 Final Interactive Connections PASS

Base: V58.14.6 Product Final Connections PASS.

## Objetivo
Reducir elementos visuales sin acción y conectar interacciones visibles en módulos clave sin tocar Supabase destructivamente ni cambiar `package.json`/`vercel.json`.

## Cambios incluidos

### Analytics
- Exportación CSV real del resumen de Analytics.
- Exportación CSV real de carga de equipo.
- Botón de actividad diaria/semanal con estado interactivo.
- Enlaces reales hacia Proyectos, Tareas y Notificaciones.
- Elementos de dona ahora aceptan click además de hover.

### Tareas
- Smart Timeline: controles Día/Semana/Mes/Mis tareas/Equipo ahora actualizan estado visual.
- Smart Timeline: navegación anterior/siguiente mueve el rango visible.
- Botón Filtros lleva a la vista Lista filtrable.
- Calendar Pro: controles Hoy/Día/Semana/Mes actualizan estado visual.
- Calendar Pro: Config muestra/oculta el resumen lateral.
- `+N más` en calendario lleva a Lista.
- Detalle de tarea: se retiraron botones decorativos de favorito/fijar/menú/etiqueta; queda CTA real de Editar tarea.
- Sidebar de Ver tarea: Agregar recordatorio y agregar etiqueta navegan al editor real.
- Comentarios: se eliminó menú decorativo sin backend.

### Proyectos
- Tabs del detalle convertidas en navegación por anclas reales.
- Invitar lleva a Organización/Roles.
- Ver archivos y actividad apuntan a secciones reales.
- Archivos sin URL ya no usan `href="#"`.

### Registros
- Botón Filtros se reemplazó por Limpiar filtros con acción real.

## No tocado
- Supabase schema existente de V58.14.6.
- `package.json`.
- `vercel.json`.
- Migrations previas.

## Validación
- ZIP validado con `unzip -t`.
- Si npm instala correctamente en entorno local, ejecutar:
  - `npm ci`
  - `npm run typecheck`
  - `npm run build:preflight`
  - `npm run build`

