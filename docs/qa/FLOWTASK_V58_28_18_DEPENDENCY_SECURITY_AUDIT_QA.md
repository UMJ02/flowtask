# QA — v58.28.18 Dependency Security Audit + Safe Next Patch

## CLI obligatorio
- [ ] `npm install` termina sin errores.
- [ ] `npm audit --audit-level=moderate` muestra `found 0 vulnerabilities`.
- [ ] `npm run verify:current` pasa.
- [ ] `npm run workspace:dependency-security:ready` pasa.
- [ ] `npm run build:preflight` pasa.
- [ ] `npm run vercel:build` pasa.
- [ ] `npm run dev` levanta.

## QA funcional mínimo
- [ ] Login carga.
- [ ] `/app/workspace` carga.
- [ ] Cambio de vistas Pro funciona.
- [ ] Board Pro abre popovers correctamente.
- [ ] Clásico y Pro conservan estados: Pendiente, En curso, Producción, En espera, Revisión, Concluido.
- [ ] Crear/editar tarea no rompe fecha, prioridad ni estado.

## Nota
No aplicar `npm audit fix --force` en esta versión.
