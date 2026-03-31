# Final Handoff v10

## Ruta sugerida de cierre
1. Instalar dependencias
2. Configurar variables de entorno reales
3. Ejecutar:
   - `npm run qa:full-client`
   - `npm run ux:review`
   - `npm run release:check`
   - `npm run preprod:validate`
   - `npm run production:gate`
   - `npm run build`
4. Validar en entorno conectado a Supabase:
   - login
   - dashboard
   - tasks
   - projects
   - notifications
5. Registrar bugs restantes y bloquear salida si son críticos

## Mínimos para deploy
- `.env` productivo correcto
- build exitoso
- health endpoints correctos
- core validado
