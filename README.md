# FlowTask — v58.25.2 Settings Colorful Redesign Alignment

Base: **v58.25.1 — Settings Footer Cleanup + Alignment Polish**

## Objetivo

Aplicar de forma más fiel el documento **FlowTask Settings Colorful UX/UI Redesign Guide** sin cambiar funcionalidades.

## Cambios principales

- Hero blanco premium con ilustración derecha.
- Se agrega asset `public/settings/herosettings.png`.
- El contenido de Settings mantiene `max-width: 1440px`, alineado al header/contenedor principal.
- No se agrega footer local; se conserva solo footer global.
- Metric cards más coloridas por categoría:
  - Workspace verde
  - Espacios azul
  - Clientes morado
  - Canales naranja
- Acceso y plan usa gradiente verde suave y botón activo con gradiente.
- Asistente inteligente usa fondo morado suave.
- Zona de peligro vuelve a fondo blanco con borde rojo suave.
- Se conservan las funcionalidades actuales de notificaciones, asistente, permisos y eliminación de cuenta.

## Validación recomendada

```bash
npm install
npm run verify:v58.25.2
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
