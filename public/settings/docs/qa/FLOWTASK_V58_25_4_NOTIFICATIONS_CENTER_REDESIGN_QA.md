# QA — v58.25.4 Notifications Center Redesign

## 1. Ancho

1. Abrir `/app/notifications`.
2. Confirmar que el contenido se extiende al ancho visual del header.
3. Confirmar que no quedan espacios laterales grandes.

## 2. Hero

1. Confirmar que no hay hero oscuro.
2. Confirmar card blanca premium.
3. Confirmar métricas Pendientes y Entrega.

## 3. Centro de notificaciones

1. Probar búsqueda.
2. Probar chips:
   - Todas
   - No leídas
   - Menciones
   - Asignadas a mí
   - Actualizaciones
   - Sistema
3. Confirmar chip activo verde.

## 4. Feed

1. Confirmar cards blancas.
2. Confirmar iconos coloridos.
3. Confirmar pill No leída / Leída.
4. Confirmar hover suave.

## 5. Acciones

1. Seleccionar notificaciones.
2. Marcar como leídas.
3. Marcar visibles.
4. Eliminar.

## 6. CLI

```bash
npm install
npm run verify:v58.25.4
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
