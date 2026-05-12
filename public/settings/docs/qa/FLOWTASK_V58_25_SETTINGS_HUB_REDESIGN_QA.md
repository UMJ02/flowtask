# QA — v58.25 Settings Hub Redesign

## 1. Hero

1. Abrir `/app/settings`.
2. Confirmar que el hero es blanco, no navy.
3. Confirmar chips de usuario/contexto.
4. Confirmar 4 métricas:
   - Workspace activo
   - Espacios vinculados
   - Clientes editables
   - Canales activos

## 2. Acceso y plan

1. Confirmar card Acceso y plan.
2. Click en Permisos organización.
3. Click en Permisos en tu plan.
4. Click en Ver detalle.
5. Confirmar que la lógica responde.

## 3. Preferencias

1. Confirmar sección Preferencias operativas.
2. Abrir Seleccionar.
3. Cambiar tabs:
   - Entrega y frecuencia
   - Canales externos
   - Horas silenciosas
4. Guardar preferencias.

## 4. Asistente inteligente

1. Cambiar motor de prioridad.
2. Activar/desactivar familias de alertas.
3. Mover sliders.
4. Activar/desactivar toggles.
5. Confirmar persistencia local.

## 5. Zona peligro

1. Confirmar visual rojo suave.
2. Click Eliminar cuenta.
3. Confirmar input ELIMINAR.
4. No ejecutar eliminación en datos reales sin ambiente de prueba.

## 6. Responsive

1. Probar desktop.
2. Probar tablet.
3. Probar mobile.

## 7. CLI

```bash
npm install
npm run verify:v58.25
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
