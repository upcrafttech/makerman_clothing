# Handoff: Razorpay Online Payment Gating
Date: 29-10-2026   Branch: feature/development

## Goal
Dynamically show online payment options (UPI, Card, Net Banking) in makerman_clothing checkout only when Razorpay is configured and active in upcraft-admin-panel. Fallback to COD only when disabled.

## Done
- Backend: created StorefrontPaymentConfigDTO and StorefrontPaymentController (GET /storefront/payment/config) reading business_payment_configs.is_active.
- Backend: permitted /storefront/payment/** in SecurityConfig.java.
- Backend: created and executed unit test StorefrontPaymentControllerTest (5/5 passed, BUILD SUCCESS).
- Storefront: added usePaymentConfig hook in src/hooks/use-api.ts.
- Storefront: updated src/routes/checkout.tsx with dynamic payment method filter, skeleton loader, COD warning banner, auto-COD selection, defensive submission check, and loading button disable.
- Storefront: verified build via `npx vite build` (exit code 0).
- Implementation plan completed in makerman_clothing/docs/plans/29-10-2026 - Makerman_Razorpay_Online_Payment_plan.md.

## Not done
- Phase 3 QA: live end-to-end checkout test with test API keys in admin panel.

## Decisions (and why)
- Public endpoint GET /storefront/payment/config: Keeps Razorpay key secret secure, only exposes boolean onlinePaymentEnabled and currency. Rejected embedding in store-profile to keep separation of concerns.
- Project-level docs: Stored plan strictly in makerman_clothing/docs/plans/ per updated implementation-plan skill.

## Files changed
- makerman_clothing/src/hooks/use-api.ts - Added usePaymentConfig hook
- makerman_clothing/src/routes/checkout.tsx - Gated payment options, added skeleton and banner
- makerman_clothing/docs/plans/29-10-2026 - Makerman_Razorpay_Online_Payment_plan.md - Plan document
- upcraft-backed/src/main/java/com/upcraft/platform/controller/StorefrontPaymentController.java - New public config endpoint
- upcraft-backed/src/main/java/com/upcraft/platform/dto/StorefrontPaymentConfigDTO.java - New response DTO
- upcraft-backed/src/main/java/com/upcraft/platform/security/SecurityConfig.java - Permitted public access

## Open problems
- None. Backend compiles cleanly; storefront Vite build passes.

## Next step
Run live manual verification: configure test Razorpay credentials in admin panel, toggle on/off, verify storefront checkout reflects status.

## Do not redo
- Do not create Liquibase migration (business_payment_configs already exists).
- Do not modify upcraft-admin-panel (PaymentsPage already fully supports Razorpay config and toggling).
- Do not store documentation in workspace-root Docs directory.

