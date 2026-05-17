# QA — FlowTask v58.27.8 Workspace Pro Visual Density + Final UI Polish

## Comandos obligatorios

```bash
npm install
npm run verify:current
npm run workspace:visual-density:ready
npm run workspace:render-diet:ready
npm run workspace:deep-cleanup:ready
npm run workspace:doctor
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```

## Checklist visual

- [ ] `/app/workspace` carga sin error.
- [ ] El header no se siente alto ni desbordado.
- [ ] Las tabs se ven compactas y horizontales.
- [ ] Home se ve más ancho y menos centrado.
- [ ] El dock derecho muestra Hoy, Nota rápida y Acciones rápidas.
- [ ] Las cards principales no se sienten pegadas ni demasiado estrechas.
- [ ] Lista aprovecha mejor el ancho de pantalla.
- [ ] Proyectos se despliega sin saturar la vista de tareas individuales.
- [ ] Board mantiene columnas, drag/drop, edición rápida y ocultar concluidas.
- [ ] Timeline muestra fechas/progreso con ancho suficiente.
- [ ] Tabla no queda comprimida en desktop.
- [ ] Canvas muestra pizarras reales con mejor ancho.
- [ ] Archivos mantiene CRUD visual y upload entry.
- [ ] Reportes mantiene acciones de generación/exportación.

## Checklist técnico

- [ ] `verify:current` apunta a `verify:v58.27.8`.
- [ ] `package.json` usa versión `58.27.8-workspace-pro-visual-density-final-ui-polish`.
- [ ] `src/lib/release/version.ts` está en v58.27.8.
- [ ] `build:preflight` incluye `workspace:visual-density:ready`.
- [ ] `workspace:doctor` acepta la versión v58.27.8.
- [ ] No hay migraciones nuevas.
- [ ] No hay dependencias nuevas.

## Notas

El warning `EBADENGINE` con Node 22 puede aparecer en desarrollo local. El script `validate:node` lo permite para local, pero deploy recomendado sigue siendo Node 20.x.
