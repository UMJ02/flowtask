# FlowTask — v58.25 Settings Hub Redesign

Base: **v58.24.9.10 — Session Security + Interaction Performance + Account Danger Zone + Auth Asset Fix**

## Objetivo

Rediseñar Settings como un hub premium blanco, moderno y más claro, manteniendo las funcionalidades actuales.

## Referencia aplicada

Se tomó como guía el PDF **FlowTask - Settings Hub Redesign**:

- Hero blanco premium.
- Métricas internas limpias.
- Acceso y plan con botones visibles.
- Preferencias operativas agrupadas.
- Canales y automatización dentro de una card madre.
- Asistente inteligente avanzado en grid responsive.
- Zona de peligro abajo, en rojo suave.
- Footer simple y limpio.

## Cambios principales

### Settings Hero

`SettingsAccountOverview` se reescribió para reemplazar el hero oscuro por un card blanco premium con:

- Settings Hub
- Cuenta, notificaciones y contexto de trabajo
- chips de usuario/contexto
- 4 metric cards:
  - Workspace activo
  - Espacios vinculados
  - Clientes editables
  - Canales activos

### Acceso y plan

`AccessControlSettingsCard` se rediseñó como card blanca independiente con:

- Permisos organización
- Permisos en tu plan
- Ver detalle
- chips inferiores de plan/cobertura

### Preferencias operativas

La página agrupa `NotificationPreferencesForm` dentro de una card madre con jerarquía clara.

### Asistente inteligente avanzado

Se mantuvo la lógica actual de localStorage, sensibilidad, alertas, sliders/toggles, pero se aplicó un look más cercano al PDF.

### Zona de peligro

Se conserva `AccountDangerZone`, con visual rojo suave y botón rojo sólido.

### Footer

Nuevo componente:

```txt
src/components/settings/settings-footer.tsx
```

## Validación recomendada

```bash
npm install
npm run verify:v58.25
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
