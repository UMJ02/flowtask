# v58.28.21.1 — Classic Project Detail UX QA

## Scope
Classic project detail and inline edit experience before Client Final Release Candidate.

## Manual checks
1. Open a project detail page.
2. Confirm members, recent files and workspace entry are visible near the upper project surface.
3. Click Editar proyecto.
4. Confirm the edit form does not create a large empty center gap.
5. Confirm image controls appear over the project image.
6. Change image, save, and confirm the new image persists after refresh.
7. Remove image and confirm fallback image appears.
8. Confirm Tareas internas create row does not overflow on desktop/tablet/mobile.
9. Confirm the old Acción rápida card is not visible.
10. Confirm Proyecto colaborativo, estado, departamento, registro, país and fecha límite remain editable.

## Commands
npm run verify:current
npm run workspace:classic-project-ux:ready
npm run build:preflight
npm run vercel:build
npm run dev
