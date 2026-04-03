
# V57.4.2 — Settings Tooltips Refined

## Ajuste aplicado
Se redujeron los textos hover a máximo 3 palabras para evitar que invadan visualmente las métricas de Settings.

### Antes → Después
- Espacios vinculados → **Sin espacios**
- Clientes editables → **Sin clientes**
- Canales activos → **Solo in-app**

## Resultado
- tooltips más limpios
- no invaden visualmente los cards
- mantiene contexto UX sin ruido

## Validación
```bash
node scripts/verify-v57.4.2.mjs
```
