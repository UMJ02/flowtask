# QA — v58.25.6 Design System Consolidation + App UI Architecture Hardening

## 1. Guardrails

```bash
npm run verify:v58.25.6
npm run design:doctor
```

Ambos deben pasar.

## 2. Controles

Validar en Settings, Tasks, Projects y Registros:

1. Inputs con borde/radius/focus consistente.
2. Selects con estilo propio y flecha visual.
3. Textareas con padding correcto.
4. Checkboxes con check verde.
5. Switches/toggles con estilo switch.
6. Ranges con accent verde.

## 3. Cards

1. Revisar que cards principales no se vean gigantes.
2. Revisar que cards internas no generen sombras excesivas.
3. Revisar que no haya contenido pegado al borde.
4. Revisar que títulos largos hagan wrap sin romper layout.

## 4. Botones

1. Primary oscuro/verde según contexto.
2. Secondary blanco con borde.
3. Danger rojo suave.
4. No más saltos visuales por hover.

## 5. Vistas clave

- `/app/tasks`
- `/app/settings`
- `/app/notifications`
- `/app/clients`
- `/app/projects`
- `/app/analytics`
- `/app/boards`

## 6. CLI completo

```bash
npm install
npm run verify:v58.25.6
npm run design:doctor
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
