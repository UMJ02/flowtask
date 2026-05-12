# QA — v58.25.3 Settings Width + Compact Hero/Metrics

## 1. Ancho

1. Abrir `/app/settings`.
2. Confirmar que el contenido se extiende al ancho visual del header.
3. Confirmar que ya no quedan espacios blancos laterales grandes.

## 2. Hero

1. Confirmar que el hero sigue blanco y colorido.
2. Confirmar que la ilustración derecha es más pequeña.
3. Confirmar que el hero ocupa menos alto.

## 3. Métricas

1. Confirmar que las 4 metric cards son más compactas.
2. Confirmar que mantienen color por categoría.

## 4. Funcionalidad

1. Probar permisos.
2. Probar preferencias.
3. Probar asistente.
4. Probar zona de peligro sin borrar datos reales.

## 5. CLI

```bash
npm install
npm run verify:v58.25.3
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
