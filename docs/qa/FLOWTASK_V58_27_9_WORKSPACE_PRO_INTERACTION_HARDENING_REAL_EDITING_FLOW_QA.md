# QA — v58.27.9 Workspace Pro Interaction Hardening + Real Editing Flow

## CLI requerido

```bash
npm install
npm run verify:current
npm run workspace:real-editing:ready
npm run workspace:visual-density:ready
npm run workspace:render-diet:ready
npm run workspace:deep-cleanup:ready
npm run workspace:doctor
npm run typecheck
npm run build:preflight
npm run vercel:build
```

## QA navegador

- `/app/workspace` abre sin errores.
- Home: tareas importantes, vencimientos, proyectos activos y recursos son accionables.
- Nueva tarea: el sheet no se desborda; permite crear tarea o proyecto.
- Nueva tarea: checklist opcional crea items si la tabla existe en el proyecto.
- Lista: abrir edición rápida permite cambiar nombre, proyecto, estado, prioridad y fecha.
- Lista: borrar tarea respeta permisos/RLS.
- Board: arrastrar entre columnas actualiza estado.
- Board: concluidas quedan ocultas por defecto y se muestran con el toggle.
- Board: editar card abre modal simple y permite guardar.
- Proyectos: cada proyecto despliega tareas anidadas.
- Timeline: muestra avance por estado, fecha y vínculo real.
- Vercel: `workspace:production:ready` no debe bloquear por versión.
