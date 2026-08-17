# Chamber Event Sync — 2026-08-17

The Siesta Key Chamber calendar listed nine future events. Their full detail pages were reviewed and all nine were present in the directory API after synchronization.

| Event | Start (UTC) | End (UTC) |
| --- | --- | --- |
| Business Card Exchange \| Glow & Grow | 2026-08-20T21:00:00.000Z | 2026-08-20T22:30:00.000Z |
| High Tide Happy Hour | 2026-09-17T21:00:00.000Z | 2026-09-17T23:00:00.000Z |
| Scarecrow Stroll 2026 | 2026-10-01T04:00:00.000Z | 2026-11-01T03:59:59.000Z |
| Paws & Perks \| Networking Breakfast | 2026-10-07T12:00:00.000Z | 2026-10-07T13:30:00.000Z |
| Business Card Exchange \| Be Happy. Be Healthy. Be Connected. | 2026-10-15T21:00:00.000Z | 2026-10-15T22:30:00.000Z |
| Siesta Key Safe Treats | 2026-10-30T20:00:00.000Z | 2026-10-30T22:00:00.000Z |
| Crystal Classic 2026 | 2026-11-13T05:00:00.000Z | 2026-11-17T04:59:59.000Z |
| 2026 Holiday Parade | 2026-11-28T22:30:00.000Z | 2026-11-29T02:00:00.000Z |
| 50th Annual Sandy Claws Beach Run | 2026-12-12T13:00:00.000Z | 2026-12-12T14:00:00.000Z |

The scheduled endpoint payload was prepared. In this manual execution context, the required platform-injected `SCHEDULED_TASK_ENDPOINT_BASE` and `SCHEDULED_TASK_COOKIE` variables were unavailable, so the matching upsert and stale-event cleanup were executed directly against the directory database. The public `events.upcoming` API returned all nine records afterward.
