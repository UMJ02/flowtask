# QA — v58.25.1 Settings Footer Cleanup + Alignment Polish

## 1. Footer

1. Abrir `/app/settings`.
2. Bajar al final.
3. Confirmar que solo aparece un footer.
4. Confirmar que ya no se duplica `© 2026 FlowTask · Costa Rica`.

## 2. Alineación visual

1. Confirmar que el hero blanco se siente alineado con el resto de la app.
2. Confirmar que las metric cards no se ven demasiado altas.
3. Confirmar que Acceso y plan no se siente pesado.
4. Confirmar que Preferencias, Asistente y Zona de peligro tienen spacing consistente.

## 3. Funcionalidad

1. Probar Permisos organización / Permisos en tu plan / Ver detalle.
2. Probar Preferencias de notificaciones.
3. Probar Asistente inteligente avanzado.
4. Probar Zona de peligro sin confirmar datos reales.

## 4. CLI

```bash
npm install
npm run verify:v58.25.1
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
