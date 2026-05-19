-- FlowTask v58.28.21.4 — Shared report tokens validation

select tablename, rowsecurity
from pg_tables
where schemaname = 'public'
and tablename = 'shared_reports';

select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public'
and tablename = 'shared_reports'
order by policyname;

select count(*) as shared_reports_total
from public.shared_reports;

select token, workspace_name, created_at, expires_at, revoked_at
from public.shared_reports
order by created_at desc
limit 10;
