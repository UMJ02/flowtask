-- V57.8 Individual mode guardrails
-- No destructive schema changes. This release hardens the app layer to support personal mode
-- while reusing the existing organization backbone and workspace subscriptions.

comment on table public.user_account_modes is 'Controls whether a user is operating in individual or team context.';
