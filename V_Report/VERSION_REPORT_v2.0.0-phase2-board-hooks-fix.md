# FlowTask v2.0.0 – phase2 board hooks fix

Base:
- Continuación directa de `flowtask_v1_phase1_clean.zip`

Incluye:
- corrección del orden de hooks en `src/components/dashboard/interactive-dashboard-board.tsx`
- los `useMemo` quedan declarados antes del `return` condicional de hidratación
- proyecto se mantiene limpio, sin `node_modules`, `.next`, `.git`, `.env`, `.env.local`

Estado de validación de esta entrega:
- lista como base limpia para reinstalación local
- fix aplicado sobre el punto crítico identificado en auditoría
- la reinstalación y build real deben ejecutarse en entorno local con `npm install` y luego `npm run typecheck` / `npm run build`
