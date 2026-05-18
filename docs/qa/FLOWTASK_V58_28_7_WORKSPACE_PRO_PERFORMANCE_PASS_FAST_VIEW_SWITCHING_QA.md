# QA — v58.28.7 Workspace Pro Performance Pass + Fast View Switching

## CLI
Ejecutar:

```bash
npm install
npm run verify:current
npm run workspace:performance-pass:ready
npm run build:preflight
npm run vercel:build
```

## QA visual
- Cambiar entre Tareas, Proyectos, Board, Timeline y Tabla debe sentirse inmediato.
- Los botones deben mostrar hover/pressed state claro.
- Los overlays no deben sentirse pesados al abrir/cerrar.
- Home, Canvas, Archivos y Reportes pueden sincronizar con servidor porque cargan data extra.
- Board no debe mostrar concluidas por defecto.
- El panel de acciones del board debe seguir anclado al item.
