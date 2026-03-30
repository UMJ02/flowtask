# Vercel checklist

## Antes de instalar
- Confirma que el proyecto en Vercel apunta al repo correcto.
- Revisa que no haya otro proyecto viejo enlazado por error.

## Variables de entorno mínimas
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Variables server-side
- `SUPABASE_SERVICE_ROLE_KEY` solo en entorno servidor, nunca en cliente.

## Secuencia recomendada
```bash
npm install
npm run typecheck
npm run runtime:check
npm run build
```

## Si Vercel falla
1. Revisar que el commit desplegado sea el correcto.
2. Revisar que las env vars estén en Production / Preview según corresponda.
3. Revisar si el fallo es de TypeScript, build, repo equivocado o variables faltantes.
4. No empujar nuevas features hasta resolver el build real.
