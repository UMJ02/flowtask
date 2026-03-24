# FlowTask v6.0.6 — Release Cleanup

Base limpiada para continuar el proyecto sobre una entrega más profesional y portable.

## Objetivo de esta versión
- limpiar el proyecto para distribución y handoff
- agregar `.env.example` para onboarding técnico
- mantener la base funcional de `v6.0.5-workspace-route-fix`
- eliminar residuos de entorno del paquete final

## Scripts clave
- `npm run dev`
- `npm run build`
- `npm run start`
- `npm run lint`
- `npm run typecheck`
- `npm run runtime:check`
- `npm run release:check`

## Qué se limpió
- el ZIP final ya no incluye `node_modules`
- el ZIP final ya no incluye `.next`
- el ZIP final ya no incluye `.git`
- el ZIP final ya no incluye `.env.local`
- el ZIP final ya no incluye residuos de macOS como `__MACOSX` y `.DS_Store`
- se agregó `.env.example` como guía de configuración

## Estado honesto
- `npm run typecheck` pasa en esta base
- `npm run release:check` ya no falla por ausencia de `.env.example`
- `next build` sigue dependiendo del entorno local/CI y de un binario SWC compatible
