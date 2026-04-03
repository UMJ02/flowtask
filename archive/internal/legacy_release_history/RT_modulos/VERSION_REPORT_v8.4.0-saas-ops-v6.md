# FlowTask V8.4.0 — SaaS Ops & Billing Layer (V6)

## Objetivo
Extender la capa avanzada SaaS del workspace con una lectura ejecutiva de billing, soporte interno y plataforma.

## Cambios incluidos
- Nuevo `BillingCommandCenter` en `/app/organization/billing` con lectura de readiness, renovación, presión de límites y capacidad disponible.
- Nueva ruta `/app/organization/support` para centralizar tickets internos por organización.
- Nueva ruta `/app/platform` para administración global con métricas, organizaciones, usuarios y soporte.
- Nuevos helpers de datos para soporte: `getOrganizationSupportTickets` y `getOrganizationSupportReadiness`.
- Actualización de navegación para exponer Soporte y Platform.

## Resultado esperado
- Mejor visibilidad de suscripción y límites desde la organización activa.
- Capa SaaS más clara para operación interna.
- Base preparada para futuras acciones administrativas y workflows de soporte.
