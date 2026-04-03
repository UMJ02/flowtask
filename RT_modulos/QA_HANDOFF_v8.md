# FlowTask — QA Handoff v8

## Checklist técnico mínimo
- [ ] `nvm use`
- [ ] `npm install`
- [ ] `cp .env.example .env.local`
- [ ] completar variables reales
- [ ] `npm run validate:env`
- [ ] `npm run security:check`
- [ ] `npm run runtime:check`
- [ ] `npm run typecheck`
- [ ] `npm run build`

## Checklist funcional sugerido
- [ ] login
- [ ] register
- [ ] reset password
- [ ] dashboard
- [ ] board
- [ ] crear tarea
- [ ] editar tarea
- [ ] crear proyecto
- [ ] editar proyecto
- [ ] settings
- [ ] notifications
- [ ] organization / billing
- [ ] organization / support
- [ ] platform

## Notas
- si falla `validate:env`, no continuar a build
- si falla `runtime:check` o `typecheck`, corregir antes del deploy
- si la instalación local usa otra versión de Node, normalizar con `.nvmrc`
