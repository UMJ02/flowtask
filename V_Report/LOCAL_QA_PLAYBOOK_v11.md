# FlowTask — LOCAL QA PLAYBOOK V11

## Clean bootstrap
```bash
rm -rf node_modules .next package-lock.json
npm install
cp .env.example .env.local
```

## Doctor checks
```bash
npm run validate:node
npm run doctor:install
npm run validate:env
npm run doctor:supabase
```

## App checks
```bash
npm run runtime:check
npm run typecheck
npm run build
npm run dev
```

## Useful endpoints
- `/api/health`
- `/api/ready`

## If build fails
1. verify install with `npm run doctor:install`
2. verify env with `npm run doctor:supabase`
3. only after that inspect the source error

## If auth fails
1. verify `NEXT_PUBLIC_SUPABASE_URL`
2. verify `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. verify redirect/app URL settings in Supabase + Vercel
