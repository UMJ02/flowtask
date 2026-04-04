
# V57.9 QA Matrix

## Access and onboarding
- [ ] user can register and verify account
- [ ] individual onboarding completes without organization
- [ ] team onboarding creates organization correctly
- [ ] first creator becomes owner/admin initial member
- [ ] activation code redeems once and cannot be reused
- [ ] redirects after onboarding land in correct destination

## Organization and members
- [ ] owner can invite members
- [ ] roles are visible as Owner / Admin / Manager / Member
- [ ] plan seat limits block excess members and invites
- [ ] project limits respect plan capacity

## Billing and lifecycle
- [ ] current plan state is visible
- [ ] renewal date and annual cycle are visible
- [ ] upgrade is immediate
- [ ] downgrade is scheduled for next renewal when needed
- [ ] expired subscription triggers soft lock UX
- [ ] activation code relation is traceable from workspace billing

## Individual mode
- [ ] dashboard loads with no active organization
- [ ] clients work in personal mode
- [ ] projects work in personal mode
- [ ] tasks work in personal mode
- [ ] settings reflects individual context
- [ ] notifications render coherently in personal mode

## Final release
- [ ] npm run typecheck
- [ ] npm run build
- [ ] smoke health check passes
- [ ] release notes updated
- [ ] Supabase migrations order documented
