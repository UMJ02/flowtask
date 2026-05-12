# QA — v58.25.2 Settings Colorful Redesign Alignment

## 1. Hero

1. Abrir `/app/settings`.
2. Confirmar hero blanco, no oscuro.
3. Confirmar imagen derecha `/settings/herosettings.png`.
4. Confirmar que el contenido queda alineado con el ancho del header.
5. Confirmar 4 métricas coloridas.

## 2. Footer

1. Bajar al final.
2. Confirmar que solo se muestra el footer global.
3. Confirmar que no existe footer local duplicado.

## 3. Acceso y plan

1. Probar `Permisos organización`.
2. Probar `Permisos en tu plan`.
3. Probar `Ver detalle`.

## 4. Preferencias

1. Cambiar frecuencia.
2. Probar tabs.
3. Guardar preferencias.

## 5. Asistente

1. Cambiar sensibilidad.
2. Mover sliders.
3. Cambiar toggles.
4. Confirmar persistencia local.

## 6. Zona de peligro

1. Confirmar fondo blanco y borde rojo suave.
2. Probar flujo hasta confirmación, sin borrar datos reales.

## 7. CLI

```bash
npm install
npm run verify:v58.25.2
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
