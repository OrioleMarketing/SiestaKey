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
- [x] Frontend: photo gallery — view and remove existing photos from dashboard listing (implemented in edit form)
- [x] Frontend: photo gallery — upload new photos via S3 (implemented via base64 + storagePut)
- [x] Add /dashboard route to App.tsx
- [x] Add Dashboard link to navbar for logged-in users

## Enhancement Round 11 — S3 Photo Upload
- [x] Server: add dashboard.uploadPhoto tRPC procedure (base64 + storagePut, returns URL — no separate REST endpoint needed)
- [x] Server: add dashboard.addPhoto and dashboard.removePhoto tRPC procedures
- [x] Client: photo upload UI in dashboard (file picker + loading spinner; drag-drop deferred)
- [x] Client: add confirmation dialog before removing a photo from the dashboard gallery
- [x] Stripe webhook audit: confirmed correctly registered before express.json()

## Enhancement Round 12 — Admin Listing Management
- [x] Backend: admin.createBusiness tRPC procedure (name, category, address, phone, website, description, area)
- [x] Backend: admin.deleteBusiness tRPC procedure (by id, admin-only)
- [x] Admin UI: "Add Listing" button + dialog form on the Businesses tab
- [x] Admin UI: Delete button with confirmation dialog on each listing row

## Enhancement Round 13 — Contact Us + Google Reviews
- [x] Create /contact page: name, email, phone (optional), message form
- [x] Wire Contact form → GHL "Contact Form Submitted" workflow (CONTACT_FORM_SUBMITTED)
- [x] Add /contact route to App.tsx
- [x] Add Contact Us link to Footer (Contact column + legal links row)
- [x] Schema: add googleReviewEmbedCode text column to businesses table
- [x] DB migration: ALTER TABLE businesses ADD googleReviewEmbedCode text
- [x] Backend: admin.updateGoogleReview tRPC procedure (by business id, admin-only)
- [x] Backend: dashboard.updateMyListing accepts googleReviewEmbedCode field
- [x] Admin UI: Google Review (chat bubble) icon button on featured/sponsored rows → embed code dialog
- [x] Dashboard UI: Google Reviews Widget section (Gulf Breeze + Island Premier only) with textarea for embed code
- [x] BusinessProfile: render googleReviewEmbedCode via dangerouslySetInnerHTML for featured/sponsored tiers only

## Bug Fix — Submission Approval Auto-Creates Listing
- [x] Bug: approving a submission only updated its status but never created a business listing
- [x] Fix: updateSubmission procedure now fetches the submission row and inserts a new business when status === "approved"
- [x] Fix: Admin SubmissionsTab shows a descriptive toast on approval and invalidates the businesses list cache

## Enhancement Round 14 — Payment at Submission + Admin Improvements
- [x] Submission form: add tier selection step (Free / Gulf Breeze / Island Premier) before submit
- [x] Submission form: after submit, redirect Free tier straight to confirmation; paid tiers redirect to Stripe checkout
- [x] Schema: add stripeCheckoutSessionId, stripePaymentIntentId, stripeSubscriptionId, tier, createdBusinessId columns to listing_submissions
- [x] Backend: createListingSubmission stores tier; createCheckout creates session linked to submission
- [x] Backend: updateSubmission (approve) triggers GHL NEW_LISTING_ADDED workflow with profile URL; maps tier to business tier
- [x] Backend: updateSubmission (reject) calls cancelAndRefundSubmission to cancel subscription and refund payment
- [x] Admin Submissions tab: show "View Listing" button on approved submissions
- [x] Admin Submissions tab: show "Edit Listing" link that jumps to admin Businesses tab for that business
- [x] Admin Submissions tab: show tier badge (Gulf Breeze / Island Premier) on paid submissions
- [x] SubmitListing.tsx: plan IDs corrected to free/gulf_breeze/island_premier (matching backend enum)
- [x] SubmitListing.tsx: payment=success and payment=cancelled redirect states handled with clear messaging
- [x] stripeWebhook.ts: createCheckoutSession supports submissionId and redirects back to /submit-listing
- [x] stripeWebhook.ts: cancelAndRefundSubmission helper added

## Enhancement Round 15 — Submission UX + Admin Tier Control
- [x] Backend: trigger GHL LISTING_REJECTED workflow on rejection (upsert contact + fire workflow)
- [x] Backend: admin.resendPaymentLink procedure — re-create Stripe checkout for a pending submission and return the URL
- [x] Admin Submissions tab: Paid/Unpaid badge on each card (green "Paid" if stripeSubscriptionId present, amber "Unpaid" otherwise for paid-tier submissions)
- [x] Admin Submissions tab: "Resend Payment Link" button on pending unpaid paid-tier submissions
- [x] Admin Businesses tab: manual tier change dropdown — updates DB only, no Stripe charge; labelled "Admin override" with "(no charge)" suffix on each option
- [x] ghl.ts: added LISTING_REJECTED workflow constant (currently maps to CLAIM_REQUEST_REJECTED — update ID when a dedicated GHL workflow is created)

## Enhancement Round 16 — Trust Badges Expansion
- [x] Footer: link Chamber of Commerce logo to https://www.siestakey.com
- [x] Contact page: add Chamber + BBB trust badges alongside address/phone in sidebar
- [x] Pricing page: add "Powered by Oriole Marketing" trust section with Chamber + BBB badges above Footer

## Enhancement Round 17 — Category Fix + Full Admin Edit
- [x] Fix ADMIN_CATEGORIES constants to match actual DB order (Services=4, Nightlife=5, Wellness=6, Accommodations=7, Real Estate=8)
- [x] Fix Oriole Marketing LLC categoryId from 6 (Wellness) to 4 (Services) in DB
- [x] Backend: expand admin.updateBusiness to accept all business fields (name, slug, categoryId, descriptions, address, area, phone, website, email, lat, lng, rating, reviewCount, tags, hours, socialLinks, googleReviewEmbedCode)
- [x] Admin Businesses tab: add Pencil (Edit) button per row that opens a full-edit dialog
- [x] EditListingDialog: scrollable modal with all DB fields — core info, descriptions, tags, hours (per day), social links, ratings, Google Review embed

## Enhancement Round 18 — Bulk CSV Import
- [x] Backend: admin.bulkImportBusinesses tRPC procedure (upsert by slug: create if missing, update if exists)
- [x] Backend: validate required columns (name, category) and return per-row errors with row number and column name
- [x] Admin panel: new "CSV Import" tab with file picker, column validation feedback, preview table (first 5 rows, first 8 cols), and Import button
- [x] Admin panel: downloadable CSV template with all 28 supported columns and one example row
- [x] Admin panel: import results summary (created N, updated N, errors N) with per-row result table
- [x] AdminCsvImport.tsx: pure client-side CSV parser (handles quoted fields, commas in values)
- [x] Quick Reference section: valid categories, tiers, upsert logic, tags/hours format
- [x] Admin CSV import: invalidate businesses list after successful import so Listings tab refreshes automatically

## Bug Fix — Claim Approval Flow
- [x] Schema: added status (pending/approved/rejected), ghlContactId, approvedAt columns to claim_leads table
- [x] DB migration: ALTER TABLE claim_leads ADD COLUMN status/ghlContactId/approvedAt
- [x] Backend: updateClaimStatus helper added to db.ts
- [x] Backend: approveClaim now updates claim status, fetches business slug, links business.isClaimed + claimedByUserId, returns businessSlug
- [x] Backend: rejectClaim now updates claim status to rejected
- [x] Backend: ghlContactId stored on claim creation for later use in approve/reject
- [x] Admin ClaimsTab: Approve button passes ghlContactId as contactId so GHL workflow fires correctly
- [x] Admin ClaimsTab: Pending/Approved/Rejected/GHL Sent status badges on each card
- [x] Admin ClaimsTab: View Listing + Edit in Admin links appear immediately after approval
- [x] Admin ClaimsTab: resolved claims hidden by default with "Show resolved (N)" toggle
- [x] Admin ClaimsTab: success/error toasts on approve and reject

## Enhancement Round 19 — Claimed Badge, Homepage Featured, Lifeguard Default, Profile Redesign
- [x] Upload lifeguard image to webdev static assets and get CDN URL
- [x] BusinessCard: add blue "Claimed" badge overlay on listing image when isClaimed is true
- [x] Homepage: show all featured businesses (gulf_breeze + island_premier) not just a limited count
- [x] BusinessCard + BusinessProfile: use lifeguard image as default photo for unclaimed free-tier listings
- [x] BusinessProfile: redesign to match Hawaii Thrive detail page layout with all plan-tier features

## Enhancement Round 22 — Admin Rejection Dialog + Claim Form Hint
- [x] Admin ClaimsTab: Reject button now opens a dialog instead of immediately rejecting
- [x] Admin ClaimsTab rejection dialog: 17-item dropdown of pre-set rejection reasons (required)
- [x] Admin ClaimsTab rejection dialog: free-text Additional Notes textarea (optional, included in GHL notification)
- [x] Admin ClaimsTab rejection dialog: Confirm Rejection button disabled until a reason is selected
- [x] Backend: rejectClaim tRPC procedure already accepts rejectionReason + rejectionNotes; passes to GHL custom fields + triggers CLAIM_REQUEST_REJECTED workflow
- [x] ClaimBusiness form: branded email domain hint below email field ("Tip: Using your business email helps verify ownership faster")
- [x] Vitest: added 3 new tests for rejectClaim input validation (missing claimId, reason too long, notes too long)

## Enhancement Round 23 — Chamber Members Filter
- [x] Directory page: add "Chamber Members" toggle pill to the tier filter row
- [x] Backend db.ts: add chamberMember?: boolean filter to getBusinesses (eq isChamberMember = true)
- [x] Backend routers.ts: add chamberMember: z.boolean().optional() to businesses.list input schema
- [x] Pill uses teal accent color and small chamber badge thumbnail; toggling it deselects tier pills
- [x] Vitest: 2 new tests for chamberMember filter (accepts param, returns only chamber members)

## Enhancement Round 24 — Directory Nav Tab + Sort + Label Fix
- [x] Navbar: add "Directory" link as first item in nav (links to /directory — all listings)
- [x] Navbar: active state for /directory uses exact match so category sub-pages don't highlight it
- [x] Directory page: add Sort By dropdown (Featured, Name A–Z, Category, Tags) in the search row
- [x] Backend db.ts: sortBy param added to getBusinesses (default=featured-first, name=A–Z, category=by categoryId, tags=by name)
- [x] Backend routers.ts: sortBy z.enum added to businesses.list input schema
- [x] BusinessCard: "Proud Chamber Member" tooltip changed to "Chamber Member"
- [x] BusinessProfile: "Proud Chamber Member" tooltip changed to "Chamber Member"

## Enhancement Round 25 — Default Images for New Businesses
- [x] Upload SiestaKey.webp panorama to storage: /manus-storage/SiestaKey_panorama_734eb779.webp
- [x] BusinessCard: all businesses without a photo now show the 500x500 lifeguard stand (was only unclaimed free)
- [x] BusinessProfile: cover photo area now always shows the panorama default when no coverPhoto or photos exist (was null for paid/claimed listings)

## Enhancement Round 26 — SEO og:image, Update Photos CTA, Admin default cover
- [x] BusinessProfile: seoImage now uses panorama as og:image fallback (absolute URL) instead of undefined
- [x] BusinessProfile: "Update Photos" CTA banner shown to the claimed listing owner when no custom photos exist
- [x] Admin createBusiness: new listings seeded with panorama as default coverPhoto so profile page shows branded cover immediately

## Enhancement Round 27 — Schema Markup, Panorama Backfill, Share Button
- [x] Add JSON-LD structured data (LocalBusiness, WebSite, BreadcrumbList) to SEO component and business profile
- [x] Add JSON-LD to Homepage (WebSite + SearchAction)
- [x] Add JSON-LD to Directory page (ItemList)
- [x] Backfill panorama coverPhoto on existing listings where coverPhoto IS NULL (203 rows updated)
- [x] Add Share button to business profile page (copy URL to clipboard, with toast feedback)

## Enhancement Round 28 — Sitemap, robots.txt, Schema Subtypes
- [x] Add dynamic /sitemap.xml server route listing all active business slugs and category pages (216 URLs)
- [x] Add /robots.txt pointing crawlers to the sitemap
- [x] Map category slugs to schema.org LocalBusiness subtypes in BusinessProfile JSON-LD (Restaurant, Store, TouristAttraction, etc.)

## Enhancement Round 29 — Canonical Tags, OG Types, Last Updated
- [x] Add canonical <link rel="canonical"> to every business profile via SEO component
- [x] Add ogType prop to SEO component and map category slugs to granular og:type values
- [x] Add "Last Updated" timestamp below business name on profile page

## Enhancement Round 30 — Blog / Guide Section

- [x] Add blog_posts table to drizzle schema
- [x] Run migration and apply SQL
- [x] Add db.ts helpers: getBlogPosts, getBlogPostBySlug, createBlogPost, updateBlogPost, deleteBlogPost
- [x] Add tRPC procedures: blog.list, blog.bySlug, blog.create (admin), blog.update (admin), blog.delete (admin)
- [x] Build /guides page — article listing with featured post hero
- [x] Build /guides/:slug page — full article with JSON-LD Article schema, Share button, CTA to directory
- [x] Add Admin blog editor tab — create/edit/delete posts with markdown editor
- [x] Add "Guides" nav link to Navbar
- [x] Add blog teaser section to Homepage (latest 3 posts)
- [x] Seed 4 articles targeting high-value local search terms
- [x] Add JSON-LD Article schema to blog post pages
- [x] Add 4 blog post URLs to /sitemap.xml (now 284 total URLs)
- [x] Fix blog article paragraph spacing (prose-p:mb-5, leading-relaxed, heading margins)
- [x] Generate and assign unique AI cover images for all 4 blog posts

## Weather Widget
- [x] Add weather.getCurrent tRPC procedure fetching Open-Meteo API for Siesta Key coords with 30-min server-side cache
- [x] Build WeatherBar component showing current temp, condition, feels-like, wind, UV index, and 5-day forecast strip
- [x] Insert WeatherBar below Navbar on homepage

## Free Listing Feature Parity (Pricing Page Alignment)
- [x] Unlock website link display for free listings (currently gated behind isPaid)
- [x] Unlock email address display for free listings (currently gated behind isPaid)
- [x] Unlock social media links display for free listings (currently gated behind isPaid)
- [x] Unlock business hours display for free listings (currently gated behind isPaid)
- [x] Unlock Google Maps pin/link for free listings (currently gated behind isPaid)
- [x] Ensure business description is visible on free listings
- [x] Ensure cover image is visible on free listings
- [x] Add email/N/A guard and social link URL validation to prevent bad data showing
- [x] Update upgrade CTA copy to reflect what's actually gated (photo gallery, featured badge, Google Reviews, homepage spotlight)

## Expanded Submit Listing Form (Tier-Conditional Fields)
- [x] Update listing_submissions table schema to store hours, socialLinks, coverPhoto, photos, googleReviewEmbedCode, videoEmbed
- [x] Update submissions.submit tRPC procedure to accept and store all new fields
- [x] Add Business Hours section to form (all tiers) — 7-day open/close time grid
- [x] Add Social Media Links section (Gulf Breeze+) — Facebook, Instagram, TripAdvisor, Yelp
- [x] Add Cover Image upload (Gulf Breeze+) — S3 upload, preview thumbnail
- [x] Add Photo Gallery upload (Gulf Breeze+: max 5, Island Premier: max 10) — S3 multi-upload
- [x] Add Google Review Embed code field (Gulf Breeze+)
- [x] Add Video Embed URL field (Island Premier only)
- [x] Wire uploaded file URLs into the submission payload
- [x] On admin approval, copy all submitted fields into the businesses table

## Events & Announcements (Island Premier only)

- [x] Add `business_events` table to schema: id, businessId (FK), type (event|announcement), title, description, startDate, endDate (nullable), location (nullable), imageUrl (nullable), isPublished, createdAt
- [x] Generate and apply Drizzle migration SQL
- [x] tRPC procedures: events.list (public, by businessId), events.upsert (admin), events.delete (admin), events.listAll (admin, all businesses)
- [x] Admin panel — Events tab: list all events across businesses, inline edit/delete, add new event for any business
- [x] Business profile page — "Events & Announcements" section (Island Premier only): upcoming events card grid, past events collapsed, announcement badge style
- [x] Guard upsert/delete so only Island Premier businesses can have events
- [x] Vitest coverage for events procedures

## Fix: Claim Approval Not Setting isClaimed + Events Self-Management + Homepage Events Widget

- [x] Investigate why approved claims (SkyRun, siesta 4 rent, Beach to Bay) are not showing isClaimed=true on their business profiles
- [x] Fix approveClaim procedure to correctly set isClaimed=true on the matched business when businessId is present — root cause: businessId was null in claim_leads; added name-based fallback matching
- [x] Retroactively patched isClaimed=true for SkyRun, Siesta 4 Rent, Beach to Bay via SQL
- [x] Owner Dashboard: Events & Announcements section for Island Premier owners to create/edit/delete their own events
- [x] Homepage: Upcoming Events widget showing next 5 events across all Island Premier businesses

## Chamber Events Auto-Refresh (Weekly AGENT Cron)

- [ ] Add `/api/scheduled/sync-chamber-events` POST endpoint and handler in server
- [ ] Handler: authenticate as cron, scrape Chamber events page via fetch, upsert new/updated events, remove stale past events
- [ ] Register the route in server/_core/index.ts before Vite fallthrough
- [ ] Save checkpoint, deploy, then create AGENT cron via manus-heartbeat CLI (weekly, Mondays 9am UTC)
