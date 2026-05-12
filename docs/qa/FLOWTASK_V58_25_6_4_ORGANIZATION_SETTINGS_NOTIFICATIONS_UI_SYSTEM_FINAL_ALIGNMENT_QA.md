# QA — v58.25.6.4 Organization + Settings + Notifications UI System Final Alignment

## 1. Organization

1. Abrir `/app/organization`.
2. Confirmar que el wrapper ocupa el ancho del header.
3. Revisar bootstrap/no organization.
4. Revisar miembros, roles, invitaciones, permisos y admin settings.
5. Confirmar cards compactas y acciones alineadas.

## 2. Settings

1. Abrir `/app/settings`.
2. Confirmar hero, métricas, preferencias, asistente y danger zone.
3. Probar preferencias de notificaciones.
4. Confirmar toggles y selects con estilo global.
5. Confirmar eliminar cuenta sin ejecutar en datos reales.

## 3. Notifications

1. Abrir `/app/notifications`.
2. Confirmar hero, métricas, búsqueda, chips y feed.
3. Probar filtros.
4. Probar marcar leídas / visibles / eliminar.

## 4. Profile

1. Abrir `/app/profile`.
2. Confirmar que ya no hay hero oscuro.
3. Confirmar hero blanco y cards compactas.
4. Probar actualización de perfil/avatar si aplica.

## 5. CLI

```bash
npm install
npm run verify:v58.25.6.4
npm run design:doctor
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
