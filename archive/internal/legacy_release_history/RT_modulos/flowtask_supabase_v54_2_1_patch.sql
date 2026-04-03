-- V54.2.1 DB Cleanup + Index Normalization
-- Safe cleanup after mixed patch/migration application.
-- Drops only clearly redundant indexes while preserving query-serving indexes.

-- Exact duplicates or redundant equivalents detected during audit.
drop index if exists public.client_permissions_org_user_idx;
drop index if exists public.error_logs_org_idx;
drop index if exists public.usage_events_org_idx;

-- Reassert canonical indexes so the schema remains stable even if prior runs were partial.
create index if not exists client_permissions_org_user_client_idx
  on public.client_permissions (organization_id, user_id, client_id);

create index if not exists error_logs_org_created_idx
  on public.error_logs (organization_id, created_at desc);

create index if not exists usage_events_org_created_idx
  on public.usage_events (organization_id, created_at desc);

create index if not exists internal_support_tickets_org_status_created_idx
  on public.internal_support_tickets (organization_id, status, created_at desc);

-- Optional planner refresh for touched tables.
analyze public.client_permissions;
analyze public.error_logs;
analyze public.usage_events;
analyze public.internal_support_tickets;
