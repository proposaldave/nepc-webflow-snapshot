# Public event agenda in the local design preview

The website remains a static HTML, CSS, and JavaScript snapshot. The local preview server has an optional read-only event adapter at `/api/public-events`.

Enable it with `NEPC_ENABLE_EVENT_PREVIEW=1` when starting `node serve.mjs`. Supply `RYE_USERNAME`, `RYE_API_KEY`, `MIDDLETON_USERNAME`, and `MIDDLETON_API_KEY` through the server process environment. Never put credential values in site assets, browser code, Git, or this document.

The adapter makes GET requests only to the organization API's event-category and event-list endpoints. It returns only active events with public booking enabled, a public category, and a public registration URL for the selected club. It excludes participant information, counts, pricing, SSO URLs, and unrelated organization fields. Responses are cached for two minutes; categories for one hour. Club/date bounds and rate limits constrain requests. The preview server listens on localhost only.

The default agenda shows one upcoming day that contain matching sessions, with arrows to browse the following day. Week and month views remain optional. Counts are shown per day.

Activity groups use each club's verified category IDs. Explicitly named ladders, leagues, tournaments, and scrambles also appear under competitive play. Beginner-titled sessions appear in Beginner Programs as well as their applicable program category. Session times are displayed in Eastern Time. Special events use CourtReserve's featured-event flag. Private court booking opens a separate guide and the existing club portal.

Registration remains in CourtReserve. The agenda does not represent or promise individual eligibility, prices, or available spots. Visitors open the event's public registration page to confirm these details.

## Before production

`serve.mjs` is a local preview server, not a deployed integration. A static GitHub Pages build cannot run the authenticated adapter. Before enabling the agenda on a production host, provide a reviewed server-side endpoint with protected environment credentials and equivalent public-field restrictions. The existing embedded calendars remain available in the page as a fallback; error states also offer the existing club portals. No production service or credential configuration was changed during this redesign.

## Validation

Run `node scripts/check-event-preview.mjs`, the normal preview build, SEO checks, and public safety scanner. Verify real category changes, both clubs, next/previous weeks, month view, event-registration links, mobile layout, and failure/fallback states.

CourtReserve documents [API website integrations](https://help.courtreserve.com/en/articles/12771256-understanding-the-courtreserve-api) and [calendar widget options](https://help.courtreserve.com/en/articles/11558490-widgets-events-calendar). The adapter uses the organization's documented read-only API routes; no booking or account mutation endpoints are called.
