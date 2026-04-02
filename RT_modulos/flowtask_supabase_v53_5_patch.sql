-- 0023_v53_5_release_candidate.sql
-- FlowTask V53.5
-- Release candidate continuity migration.
-- No breaking schema changes are introduced here on purpose.

create or replace function public.flowtask_release_marker_v53_5()
returns text
language sql
stable
as $$
  select '53.5.0-release-candidate'::text;
$$;

comment on function public.flowtask_release_marker_v53_5()
  is 'FlowTask release marker for v53.5 release candidate';
