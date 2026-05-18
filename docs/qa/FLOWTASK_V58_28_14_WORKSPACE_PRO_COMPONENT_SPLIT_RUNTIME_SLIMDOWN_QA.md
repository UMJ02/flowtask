# QA — v58.28.14 Workspace Pro Component Split + Runtime Slimdown

## CLI
```bash
npm run verify:current
npm run workspace:component-split:ready
npm run build:preflight
npm run vercel:build
npm run dev
```

## Navegador
Validar:
- Home → Tareas → Board → Timeline → Tabla sin recarga visual pesada.
- Abrir y cerrar panel derecho sin recalcular la vista central.
- Board mantiene popover externo y columnas activas.
- Archivos y Reportes siguen funcionando.
- No regresa el cintillo de Actualizando vista.
