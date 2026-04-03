# Deploy Handoff v8

## Orden recomendado
1. Configurar variables de entorno de producción
2. Instalar dependencias
3. Ejecutar:
   - `npm run qa:full-client`
   - `npm run ux:review`
   - `npm run release:check`
   - `npm run build`
4. Confirmar endpoints:
   - `/api/health`
   - `/api/ready`
5. Revisar login, dashboard, tareas y proyectos en entorno real

## Variables mínimas
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Recomendación
No marcar esta versión como producción final sin correr la validación local y una prueba real contra Supabase.
