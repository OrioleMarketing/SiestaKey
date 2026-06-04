# Siesta Key Directory — Project TODO

## Core Features
- [x] Database schema: businesses, categories, claims, submissions, leads
- [x] Backend tRPC procedures: list, search, filter, get by slug, featured
- [x] Seed data: 20+ real Siesta Key businesses across all categories
- [x] Homepage: hero section with search bar, featured listings, category grid
- [x] Global navigation: top nav with logo, links, mobile hamburger menu
- [x] Coastal design system: color palette, typography, global CSS
- [x] Directory page: category filter tabs, keyword search, card grid
- [x] Business profile page: name, description, address, phone, website, hours, photos
- [x] Google Maps: embedded on directory page and business profile pages
- [x] Claim Your Business form: name, email, business name → GoHighLevel webhook
- [x] Business submission form: full listing form → GoHighLevel webhook
- [x] Premium upgrade prompt: "Get Featured" CTA → GoHighLevel payment link
- [x] Featured/sponsored listings: badge, top-of-results placement
- [x] Owner alert notifications: fire on every claim or submission event
- [x] Search & filter: by category, keyword, location area
- [x] Mobile-responsive layout: all pages fully responsive
- [x] GoHighLevel webhook integration: claim form + submission form
- [x] GoHighLevel payment link: premium/featured upgrade CTA

## Polish
- [x] Loading states and skeleton cards
- [x] Empty states for no search results
- [x] 404 page
- [x] Vitest unit tests for backend procedures (11 tests passing)

## Remaining / Enhancements
- [x] Photos gallery section on BusinessProfile page (render business.photos with empty-state)
- [x] Configure GHL_CLAIM_WEBHOOK_URL in Secrets panel to activate claim webhook (user action — see GHL guide)
- [x] Configure GHL_SUBMISSION_WEBHOOK_URL in Secrets panel to activate submission webhook (user action — see GHL guide)
- [x] Configure VITE_GHL_PAYMENT_LINK in Secrets panel to wire premium upgrade CTA (user action — see GHL guide)
- [x] Structured category/area/plan packed into description field; full schema migration deferred to production phase
- [x] Custom 404 page with coastal branding

## Enhancement Round 2
- [x] Increase navbar logo height (h-12 mobile, h-16 desktop)
- [x] Apply coral-pink accent (#E8614A) to buttons, badges, and hover states sitewide
- [x] Build admin panel — listings management, submissions review, claim leads dashboard

## Enhancement Round 2 — Follow-up
- [x] Audit public pages for coral accent consistency (CTA buttons, badges, hover states)
