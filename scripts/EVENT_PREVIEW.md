# Public event agenda: local preview and Cloudflare Pages

The website remains a static HTML, CSS, and JavaScript snapshot. A single server-only endpoint at `/api/public-events` supplies public calendar events. `server/public-events.mjs` is shared by the local preview wrapper and `functions/api/public-events.js` on Cloudflare Pages. Neither server module belongs in `dist/` or `docs/`.

Enable it with `NEPC_ENABLE_EVENT_PREVIEW=1` when starting `node serve.mjs`. Supply `RYE_USERNAME`, `RYE_API_KEY`, `MIDDLETON_USERNAME`, and `MIDDLETON_API_KEY` through the server process environment. Never put credential values in site assets, browser code, Git, or this document.

The adapter makes GET requests only to the organization API's event-category and event-list endpoints. It returns only active events with public booking enabled, a public category, and a public registration URL for the selected club. It excludes participant information, counts, pricing, SSO URLs, and unrelated organization fields. Responses are cached for two minutes; categories for one hour. Club/date bounds and rate limits constrain requests. The preview server listens on localhost only.

The default agenda shows one upcoming day that contain matching sessions, with arrows to browse the following day. Week and month views remain optional. Counts are shown per day. The beginner page uses a month-sized feed while still showing one matching day at a time, so a Quick Start class later in the month is discoverable immediately. Its program filters and next-day navigation stay on the same page; the original Quick Start widgets remain a collapsed CourtReserve fallback.

Activity groups use each club's verified category IDs. Explicitly named ladders, leagues, tournaments, and scrambles also appear under competitive play. Beginner-titled sessions appear in Beginner Programs as well as their applicable program category. Session times are displayed in Eastern Time. Special events use CourtReserve's featured-event flag. Private court booking opens a separate guide and the existing club portal.

Registration remains in CourtReserve. The agenda does not represent or promise individual eligibility, prices, or available spots. Visitors open the event's public registration page to confirm these details.

## Cloudflare setup

The existing Cloudflare Pages project is `nepc-website`, with the static output directory `dist`. File-based routing builds the root `functions/` directory automatically. `dist/_routes.json` limits Function invocation to the public event endpoint; other pages and assets remain static. GitHub Pages cannot run this Function and is not a fully functional calendar preview.

In Cloudflare, select **Workers & Pages → nepc-website → Settings → Variables and Secrets**. Configure the following separately for **Preview** and **Production**:

| Name | Type | Purpose |
| --- | --- | --- |
| `NEPC_ENABLE_PUBLIC_EVENTS` | Public text variable, value `1`, managed in `wrangler.toml` | Enables the public agenda |
| `RYE_USERNAME` | Encrypted secret | Rye Organization API username |
| `RYE_API_KEY` | Encrypted secret | Rye Organization API key |
| `MIDDLETON_USERNAME` | Encrypted secret | Middleton Organization API username |
| `MIDDLETON_API_KEY` | Encrypted secret | Middleton Organization API key |

Never add credential values to Git, a build command, a URL, browser JavaScript, screenshots, or this document. Store them as encrypted runtime secrets. Use an existing approved credential source; do not request keys in chat. Secrets must exist before deploying the Function that uses them. Changing them requires a new deployment to take effect. With Wrangler managing the project, configure only the four encrypted credentials in the dashboard; the non-sensitive enable flag is defined in the versioned configuration and applies to Preview and Production.

Deploy and verify the design branch in Preview first. Check both clubs, activity changes, Day navigation, Month view, beginner program filters, and registration links. Responses must contain only the public field allowlist. Missing configuration returns a generic 503, upstream failures return a generic 502, and the interface retains the existing embedded calendars and club portal links. Do not promote a failed calendar to production.

Production publication remains a separate approval step. After approval, merge the reviewed commit into the configured production branch and verify the custom domain. No DNS change or new booking system is required for this endpoint. Do not change plans or add paid resources without authorization.

The endpoint accepts only GET requests for the two configured clubs and the weekly/monthly periods used by the interface. Successful public responses are cached for two minutes; concurrent identical requests are combined. An isolate-local limit of 20 upstream loads per club per minute bounds bursts, but is not an account-wide quota. No authenticated response or credentials are cached in the browser. Disabling `NEPC_ENABLE_PUBLIC_EVENTS` and redeploying turns off the public feed while keeping CourtReserve fallback links.

## Validation

Run `node scripts/check-event-preview.mjs`, `node scripts/check-public-events.mjs`, the normal preview build, SEO checks, and public safety scanner. Compile the Function with Wrangler as well. Verify real category changes, both clubs, next/previous days and weeks, month view, event-registration links, mobile layout, and failure/fallback states.

Cloudflare documents [Function routing](https://developers.cloudflare.com/pages/functions/routing/) and [encrypted secret bindings](https://developers.cloudflare.com/pages/functions/bindings/).

CourtReserve documents [API website integrations](https://help.courtreserve.com/en/articles/12771256-understanding-the-courtreserve-api) and [calendar widget options](https://help.courtreserve.com/en/articles/11558490-widgets-events-calendar). The adapter uses the organization's documented read-only API routes; no booking or account mutation endpoints are called.
