# FlowTask v58.22.0 QA — Semantic UI Classes + Density Contracts

## Visual QA

1. Open `/app/tasks` and validate compact list rhythm.
2. Open `/app/tasks/[id]` and validate detail density without oversized cards.
3. Open `/app/tasks/new` and validate create density: guided, but not landing-sized.
4. Open `/app/projects` and validate filters/table use compact rhythm.
5. Open `/app/projects/[id]` and validate detail workspace density.
6. Open `/login` and `/register` and confirm auth screens keep relaxed rhythm without heavy shadows.

## System QA

- Shared Button uses semantic button classes.
- Shared Input/Select/Textarea use semantic control classes.
- AppPage exposes density contracts.
- AppCard exposes surface and density variants.
- No Supabase migrations were added.
