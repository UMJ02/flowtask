
# V57.9 Production Checklist

1. Run database migrations in order:
   - 0028_v57_5_access_onboarding_modernization.sql
   - 0029_v57_6_subscription_capacity_controls.sql
   - 0030_v57_7_billing_commercial_lifecycle.sql
   - 0031_v57_8_individual_mode_guardrails.sql
2. Confirm environment variables for Supabase and app runtime.
3. Run local validation:
   - npm run verify:v57.9
   - npm run qa:smoke-local
   - npm run typecheck
   - npm run build
4. Validate critical flows in browser:
   - individual onboarding
   - team onboarding
   - invite member
   - billing page
   - notifications
5. Deploy to Vercel and run:
   - npm run smoke:health
   - npm run readiness:report
