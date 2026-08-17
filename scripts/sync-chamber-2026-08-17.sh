#!/usr/bin/env bash
set -euo pipefail

: "${SCHEDULED_TASK_ENDPOINT_BASE:?SCHEDULED_TASK_ENDPOINT_BASE is required}"
: "${SCHEDULED_TASK_COOKIE:?SCHEDULED_TASK_COOKIE is required}"

payload=$(cat <<'JSON'
{
  "events": [
    {
      "title": "Business Card Exchange | Glow & Grow",
      "description": "Connect, refresh, and glow at the Siesta Key Chamber of Commerce Business Card Exchange, hosted at The Face of Paris, a premier day spa offering customized skincare in Sarasota. Build meaningful business connections in a relaxed after-hours setting, discover the spa's personalized approach to self-care, and bring a door prize to showcase your business. Pricing: $10 for members and $20 for non-members.",
      "startDate": "2026-08-20T21:00:00.000Z",
      "endDate": "2026-08-20T22:30:00.000Z",
      "location": "The Face of Paris, Sarasota, FL",
      "type": "event"
    },
    {
      "title": "High Tide Happy Hour",
      "description": "An exclusive Siesta Key Chamber business-community evening on the water with High Tide Tiki Tours. Chamber members and guests receive discounted pricing, a complimentary welcome drink, and light bites while enjoying intracoastal waterfront views and a Sarasota sunset cruise. Additional beverages are available for purchase. Advance reservations are required; seating is limited. Tickets: $50 member / $60 non-member.",
      "startDate": "2026-09-17T21:00:00.000Z",
      "endDate": "2026-09-17T23:00:00.000Z",
      "location": "High Tide Tiki Tours, Sarasota, FL",
      "type": "event"
    },
    {
      "title": "Scarecrow Stroll 2026",
      "description": "A family-friendly seasonal event where homemade scarecrows created by local businesses adorn storefronts across Siesta Key. Stroll, dine, or shop while enjoying displays throughout October during regular business hours, then vote for your favorite scarecrow. Online voting runs October 1–31, and the winner will be announced November 2.",
      "startDate": "2026-10-01T04:00:00.000Z",
      "endDate": "2026-11-01T03:59:59.000Z",
      "location": "Siesta Key, FL",
      "type": "event"
    },
    {
      "title": "Paws & Perks | Networking Breakfast",
      "description": "Start the morning with purpose at a networking breakfast hosted by the Humane Society of Sarasota County in celebration of National Adopt a Shelter Dog Month. Local professionals, entrepreneurs, and community leaders will enjoy breakfast and coffee, make connections, and learn about adoption programs, volunteer initiatives, and ways businesses can support animal welfare. Pricing: $25 members / $35 non-members.",
      "startDate": "2026-10-07T12:00:00.000Z",
      "endDate": "2026-10-07T13:30:00.000Z",
      "location": "Humane Society of Sarasota County, Sarasota, FL",
      "type": "event"
    },
    {
      "title": "Business Card Exchange | Be Happy. Be Healthy. Be Connected.",
      "description": "Join the Siesta Key Chamber of Commerce for an inspiring evening of networking at Boca Boutique, where wellness, style, and community come together. Meet fellow local professionals, discover home lifestyle accessories and products from local artisans, and build relationships that strengthen the business community. Attendees are encouraged to bring a door prize. Pricing: $10 members / $20 non-members.",
      "startDate": "2026-10-15T21:00:00.000Z",
      "endDate": "2026-10-15T22:30:00.000Z",
      "location": "Boca Boutique, Sarasota, FL",
      "type": "event"
    },
    {
      "title": "Siesta Key Safe Treats",
      "description": "A free Halloween trick-or-treat event for children and families across Siesta Key. Participating businesses will display Safe Treats signs and hand out treats, creating a safe and fun afternoon for the community. No family registration is required; participating businesses must register to be listed on the website.",
      "startDate": "2026-10-30T20:00:00.000Z",
      "endDate": "2026-10-30T22:00:00.000Z",
      "location": "Participating businesses across Siesta Key, FL",
      "type": "event"
    },
    {
      "title": "Crystal Classic 2026",
      "description": "The Siesta Key Crystal Classic International Sand Sculpting Festival is a four-day event on Siesta Beach. Twenty artists compete in a Master Sand Sculpting competition, with a community carve, 20 solo sculptures, demonstrations, live music, an amateur sculpting competition, and a Vendor Village. The ticketed area remains open until 9pm on Saturday for illuminated sculpture viewing; winners are revealed Sunday afternoon.",
      "startDate": "2026-11-13T05:00:00.000Z",
      "endDate": "2026-11-17T04:59:59.000Z",
      "location": "Siesta Beach, Siesta Key, FL",
      "type": "event"
    },
    {
      "title": "2026 Holiday Parade",
      "description": "Help Light Up the Village at Siesta Key's 2026 Holiday Parade. Santa greets children at the Siesta Key Chamber of Commerce & Visitor Center from 2–4pm before departing for the parade; free photos and gift bags are available for the first 250 children. The parade begins at 5:30pm at Avenida del Mare and Beach Road, travels north on Beach Road and Ocean Boulevard, and enters Siesta Key Village.",
      "startDate": "2026-11-28T22:30:00.000Z",
      "endDate": "2026-11-29T02:00:00.000Z",
      "location": "Siesta Key Village, FL (start: Avenida del Mare & Beach Road)",
      "type": "event"
    },
    {
      "title": "50th Annual Sandy Claws Beach Run",
      "description": "Sarasota County Parks, Recreation and Natural Resources and New Balance University host this longtime Sarasota running tradition at Siesta Beach. Choose the chip-timed 5K on hard-packed sand, a 1-mile fun run, or a virtual option. Participants receive finisher medals and can enjoy music, food, raffle prizes, awards, and a holiday-themed costume contest. A 5K Family 4-Pack discount is available.",
      "startDate": "2026-12-12T13:00:00.000Z",
      "endDate": "2026-12-12T14:00:00.000Z",
      "location": "Siesta Beach, Siesta Key, FL",
      "type": "event"
    }
  ]
}
JSON
)

curl --fail-with-body --silent --show-error \
  -X POST "${SCHEDULED_TASK_ENDPOINT_BASE}/api/scheduled/sync-chamber-events" \
  -H "Content-Type: application/json" \
  -H "Cookie: app_session_id=${SCHEDULED_TASK_COOKIE}" \
  --data "$payload"
