# QA — v58.28.18.2 Dependency Security + Next Root Lockfile Guard

## CLI esperado

```bash
cd ~/Documents/"Web Projects"/flowtask
rm -rf node_modules .next tsconfig.tsbuildinfo
npm config set registry https://registry.npmjs.org/
npm install
npm audit --audit-level=moderate
npm run verify:current
npm run workspace:dependency-security:ready
npm run build:preflight
npm run vercel:build
npm run dev
```

## Resultado esperado
- `npm audit` debe indicar `found 0 vulnerabilities`.
- `verify:current` debe apuntar a `verify:v58.28.18.2`.
- `workspace:dependency-security:ready` debe pasar.
- `vercel:build` debe compilar con Next `15.5.18`.
- No debe fallar aunque exista otro `package-lock.json` fuera del proyecto.
