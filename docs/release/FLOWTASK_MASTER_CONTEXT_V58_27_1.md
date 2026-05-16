# FlowTask Master Context — v58.27.1

Base: v58.27.0 Client Final Release Candidate.

Estado: Release Candidate Fixes.

Reglas de continuidad:

1. No agregar features grandes antes de validar el build real.
2. No tocar RLS ni migraciones salvo error real.
3. Mantener Workspace-First como experiencia principal y rutas clásicas vivas.
4. Validar con Node 20, `.env` real y Supabase real.
5. Si aparece error real, generar v58.27.1.x como patch específico.

Próximo paso recomendado: validar en máquina local y Vercel.
