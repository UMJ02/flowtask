# FlowTask v6.2.7-micro-interactions-fixed

## Base
- Regenerada sobre el ZIP compartido por el usuario.

## Correcciones aplicadas
- `package.json`
  - script `dev` restaurado a `next dev -p 3001`
  - `start` alineado a puerto 3001
  - versionado actualizado
- `public/sw.js`
  - service worker simplificado para devolver siempre un `Response` válido
  - fallback offline seguro
- `src/components/pwa/pwa-register.tsx`
  - en localhost elimina service workers viejos para evitar errores persistentes en desarrollo

## Validación
- ZIP íntegro
- Sin `.git`, `.next`, `node_modules`, `.env.local`, `__MACOSX`, `.DS_Store`, `tsconfig.tsbuildinfo`
