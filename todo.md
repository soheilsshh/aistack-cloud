# Project TODO

- [x] Define database schema for subscription products and purchase support tickets
- [x] Add database helpers for products and ticket workflows
- [x] Add public product listing and product detail data procedures
- [x] Add authenticated purchase-request procedure that creates a support ticket
- [x] Add admin-only ticket list, status update, and follow-up note procedures
- [x] Build light-first storefront with n8n-inspired workflow visuals
- [x] Add responsive public navigation and product catalog UI
- [x] Add purchase-request form with selected subscription and customer contact details
- [x] Add accessible light/dark theme toggle with light as default
- [x] Build role-protected admin ticket management panel
- [x] Add responsive states, loading states, empty states, and error feedback
- [x] Add Vitest coverage for ticket creation and admin-only procedure protection
- [x] Run typecheck, tests, and visual verification
- [x] Save final project checkpoint for delivery

## Historical Changes

- [x] Initial request: modern AI subscription storefront with customer purchase flow and admin follow-up workflow
- [x] Requirement refinement: purchase requests must create support tickets; ticket-management procedures must be admin-only

## Notes

- Products and tickets are persisted in the database.
- Authentication uses the scaffolded Manus OAuth flow.
- No payment processor is included; purchase requests are routed to admin follow-up tickets.
- Light theme is the default; dark mode is user-switchable.
- [x] Add a Vitest success-path test proving an authenticated purchase request creates a ticket with the selected product and generated ticket code.
