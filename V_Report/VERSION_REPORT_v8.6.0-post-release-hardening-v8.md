# FlowTask — VERSION REPORT v8.6.0-post-release-hardening-v8

## Base
- versión base tomada: V7 full regenerada
- objetivo: reforzar handoff, validación de entorno y reproducibilidad de arranque

## Cambios aplicados
- `package.json`
  - versión actualizada a `8.6.0-post-release-hardening-v8`
  - scripts nuevos:
    - `validate:env`
    - `preflight:full`
    - `deploy:checklist`
- `scripts/validate-env.mjs`
  - nuevo validador de variables requeridas y opcionales
- `.nvmrc`
  - agregado para fijar versión sugerida de Node
- `.env.example`
  - reforzado como plantilla única de entorno
- `README.md`
  - ampliado con flujo de reinstalación limpia, preflight y despliegue
- `V_Report/QA_HANDOFF_v8.md`
  - agregado checklist operativo para continuidad

## Resultado esperado
- menos riesgo de deploy con variables faltantes
- handoff más claro entre iteraciones
- arranque local más consistente
- base más limpia para continuar V9+
