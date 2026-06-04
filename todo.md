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
- [ ] Photos gallery section on BusinessProfile page (render business.photos with empty-state)
- [ ] Configure GHL_CLAIM_WEBHOOK_URL in Secrets panel to activate claim webhook
- [ ] Configure GHL_SUBMISSION_WEBHOOK_URL in Secrets panel to activate submission webhook
- [ ] Configure VITE_GHL_PAYMENT_LINK in Secrets panel to wire premium upgrade CTA
- [ ] Add structured category/area/plan fields to listing_submissions table (currently packed into description)
- [ ] Custom 404 page with coastal branding
