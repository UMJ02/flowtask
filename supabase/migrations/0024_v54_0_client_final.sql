-- 0024_v54_0_client_final.sql
-- FlowTask V54.0
-- Final client release marker.
-- No breaking schema changes are introduced here on purpose.

create or replace function public.flowtask_release_marker_v54_0()
returns text
language sql
stable
as $$
  select '54.0.0-client-final'::text;
$$;

comment on function public.flowtask_release_marker_v54_0()
  is 'FlowTask release marker for v54.0 client final';
