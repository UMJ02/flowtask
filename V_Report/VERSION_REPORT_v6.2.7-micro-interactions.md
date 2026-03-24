# FlowTask v6.2.7-micro-interactions

## Base
- Base aplicada: v6.2.6-ui-consistency-pass-hotfix

## Objetivo
- subir micro-interacciones de UI sin romper la base funcional
- corregir desbordes visuales en métricas críticas
- reforzar patrón de búsqueda desplegable con comportamiento más premium

## Cambios principales
- `src/app/globals.css`
  - nuevas utilidades para superficies interactivas, números tabulares inline y truncado seguro
- `src/components/ui/card.tsx`
  - cards con hover más limpio y consistente
- `src/components/ui/button.tsx`
  - estados hover/active más suaves
- `src/components/ui/expandable-bar.tsx`
  - lupa destacada + chevron con rotación al abrir
  - transición más clara al desplegar filtros
- `src/app/(app)/app/workspace/page.tsx`
  - métricas superiores del hero sin desbordes
  - mejor lectura inline entre label y valor
- `src/components/dashboard/recent-activity.tsx`
  - métricas compactas sin textos largos desbordados
  - tarjetas más estables visualmente
- `src/app/(app)/app/projects/page.tsx`
- `src/app/(app)/app/tasks/page.tsx`
- `src/app/(app)/app/clients/page.tsx`
  - barra desplegable con copy más corto y más UX

## Validación
- integridad del ZIP validada con `unzip -t`
- empaquetado limpio sin `.git`, `.next`, `node_modules`, `.env.local`, `__MACOSX`, `.DS_Store`, `tsconfig.tsbuildinfo`
