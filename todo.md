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

## Enhancement Round 3
- [x] Fix navbar blending into bright sky — add always-visible semi-transparent background on transparent state
- [x] "Get Your Business Featured" heading — change to white text
- [x] Reorder category grid: Row 1: Dining, Shopping, Activities, Nightlife | Row 2: Accommodations, Wellness, Services, Real Estate
- [x] Update featured businesses: CB's, The HUB, The Salty Dog, Palm Bay Club, Chamber of Commerce, Olaf's Siesta Village
- [x] Use SiestaKey beach image as consistent header banner on all directory/inner pages

## Enhancement Round 4
- [x] Create Privacy Policy page (opens in new tab from footer)
- [x] Create Terms & Conditions page with SMS consent language (opens in new tab from footer)
- [x] Update footer copyright line: "Copyright © 2026 Shop In Siesta Key | An Oriole Marketing Local Directory"
- [x] Add /privacy and /terms routes to App.tsx
- [x] Update footer links to open Privacy and T&C in new tab
- [x] Correct Olaf's Siesta Village to be an ice cream shop (update description, category)

## Enhancement Round 5
- [x] Navbar: increase background darkness so logo/links are clearly visible over bright hero sky
- [x] Navbar: replace current links with Dining, Shopping, Activities, Nightlife, Accommodations (remove duplicate Add Listing)
- [x] Navbar: keep Claim Your Business and Add Listing CTA buttons (one each, no duplicates)
- [x] Navbar: add Admin link visible only to logged-in admin users (moved to footer, then removed per user request)
- [x] Featured businesses: find and add 2-3 real photos per business (CB's, The Hub, The Salty Dog, Palm Bay Club, Chamber, Olaf's)

## Enhancement Round 7 — SEO
- [x] Create reusable SEO/Head component (title, description, OG tags, canonical)
- [x] Add SEO tags to Home page
- [x] Add SEO tags to Directory and category pages
- [x] Add SEO tags to Business Profile page (dynamic per business)
- [x] Add SEO tags to Claim Business, Submit Listing, Privacy, Terms pages

## Enhancement Round 8 — Pricing Page
- [x] Create /pricing page with 3 tiers: Free, Featured ($149/yr), Premium ($299/yr)
- [x] Premium tier includes AI Search Audit ($299 value) as bonus
- [x] Feature comparison rows with checkmarks/X marks like Hawaii Thrive
- [x] Add /pricing route to App.tsx
- [x] Add Pricing link to footer

## Enhancement Round 9 — GHL + Stripe Integration
- [x] Store GHL API key as environment secret (GHL_API_KEY)
- [x] Build server/ghl.ts helper: upsertContact, addTags, triggerWorkflow
- [x] Wire Claim Business form → GHL New Claim Request workflow
- [x] Wire Submit Listing form → GHL New Business Request workflow
- [x] Wire Contact form → GHL Contact Form Submitted workflow
- [x] Wire new user registration → GHL New User Created workflow
- [x] Install Stripe npm package
- [x] Create server/stripeProducts.ts with Gulf Breeze and Island Premier plan configs
- [x] Create server/stripeWebhook.ts: checkout session creator + webhook handler
- [x] Register Stripe webhook route before express.json() in server/_core/index.ts
- [x] Add stripe.createCheckout and stripe.subscriptionStatus tRPC procedures to routers.ts
- [x] Wire Pricing page CTA buttons to Stripe checkout (auth-aware, loading state)
- [x] Add Login button to Navbar (shows user first name + Sign Out dropdown when logged in)

## Enhancement Round 10 — User Dashboard
- [x] Backend: add dashboard.getMyListing and dashboard.updateMyListing tRPC procedures
- [x] Backend: add dashboard.getMyProfile procedure (subscription plan, status)
- [x] Frontend: /dashboard page — plan status card with upgrade CTA for free users
- [x] Frontend: business listing edit form (name, description, phone, website, hours, address, social links)
- [ ] Frontend: photo gallery management (view current photos, add/remove) — deferred
- [x] Add /dashboard route to App.tsx
- [x] Add Dashboard link to navbar for logged-in users
