# FlowTask — VERSION REPORT v8.9.0-qa-bugfix-readiness-v11

## Base
Built from V10 full source as the new 1:1 complete base.

## Goal
Improve local QA readiness before the next real bugfix cycle in Bash / local environment.

## Included changes
- package version bumped to `8.9.0-qa-bugfix-readiness-v11`
- added `doctor:install` script to detect broken or partial local installs
- added `doctor:supabase` script to validate required Supabase/runtime variables
- added `qa:smoke-local` script for a safe local preflight chain
- added `release:qa` script for a stronger local release pass
- added `GET /api/ready` route for safe readiness inspection
- README expanded with V11 local QA flow

## Operator note
This version is focused on reducing false debugging during local testing by separating:
1. dependency/install problems
2. env binding problems
3. source/runtime problems
