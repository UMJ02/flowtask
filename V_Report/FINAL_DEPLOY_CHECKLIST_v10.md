# Final Deploy Checklist v10

## Core
- [ ] Login correcto
- [ ] Logout correcto
- [ ] Registro correcto
- [ ] Recuperación de contraseña correcta
- [ ] Dashboard carga con datos
- [ ] Dashboard carga sin datos
- [ ] Crear tarea
- [ ] Editar tarea
- [ ] Eliminar tarea
- [ ] Crear proyecto
- [ ] Editar proyecto
- [ ] Eliminar proyecto
- [ ] Notificaciones sin error runtime

## Validaciones
- [ ] `npm run qa:full-client`
- [ ] `npm run ux:review`
- [ ] `npm run release:check`
- [ ] `npm run preprod:validate`
- [ ] `npm run production:gate`
- [ ] `npm run build`

## Técnica
- [ ] Variables productivas configuradas
- [ ] `/api/health` responde 200
- [ ] `/api/ready` responde 200
- [ ] Revisión móvil básica
- [ ] Sin bugs críticos abiertos
