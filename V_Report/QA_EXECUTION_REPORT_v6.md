# QA Execution Report v6

Generated: 2026-05-05T15:45:21.434Z

## Recommended local execution order

1. npm install
2. npm run validate:env
3. npm run doctor:supabase
4. npm run qa:smoke-local
5. npm run qa:functional
6. npm run build
7. npm run smoke:health

## Manual core flow

- Login
- Register
- Forgot/reset password
- Dashboard initial load
- Task create/edit/delete
- Project create/edit/delete
- Notifications view
- Logout

## Notes

- This report is generated locally and is meant to document QA execution.
- Mark pass/fail results directly in this file after your local run.
