# FlowTask — v58.25.7.1 Deep Density Component Refactor + Hardcoded Style Cleanup

Base: **v58.25.7 — Global Productivity Density System + UI Scale Refactor**

## Objetivo

Convertir la capa global de densidad en cambios reales dentro de componentes. Esta versión no solo agrega tokens: limpia estilos hardcoded de los módulos con más deuda visual.

## Componentes depurados

- Dashboard interactivo.
- Workspace home.
- Tasks list/action form.
- Task workspace inline.
- Projects detail/timeline/inline tasks.
- Reports overview.
- Notifications command/live panel.
- Organization members.
- Clients manager/detail.
- Boards properties panel.
- Command palette.
- Empty state.

## Limpieza realizada

- `p-5`, `p-6`, `px-6`, `py-6` reducidos.
- `rounded-[24px]`, `rounded-[28px]`, `rounded-[34px]` eliminados en los componentes objetivo.
- `text-[28px]`, `text-[32px]` reducidos.
- `h-12`, `h-14`, `h-16` reducidos en controles internos.
- `shadow-[...]` pesado reemplazado por `shadow-sm`.
- Bordes hardcoded `border-slate-200` / `border-[#E7...]` normalizados donde correspondía.
- Se agrega `density:guard:strict`.

## Validación recomendada

```bash
npm install
npm run verify:v58.25.7.1
npm run design:doctor
npm run density:guard
npm run density:guard:strict
npm run typecheck
npm run build:preflight
npm run build
npm run dev
```
