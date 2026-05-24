# NEPC Webflow Update Package

This package converts the Krista/Ryann requests into Webflow-ready changes without a redesign.

## What changed in the preview

- Added a dedicated Leagues page at `/leagues/`.
- Updated the homepage "Join a competitive league" card so it goes to `/leagues/`, not `/calendar/`.
- Added a main nav and footer link for `LEAGUES`.
- Added `/private-events/` and `/corporate-events/` pages for private parties and corporate outings.
- Added `/glow-in-the-dark/` for the glow-event request.
- Updated the Clubs FAQ so corporate/private events are no longer buried behind only a PDF link.
- Kept the existing Webflow visual system instead of introducing a new design.

## Fast Webflow implementation

1. In Webflow Designer, create static pages with these slugs:
   - `leagues`
   - `private-events`
   - `corporate-events`
   - `glow-in-the-dark`
2. Use `page-copy.md` for page title, meta description, H1, intro, and body copy.
3. Copy the current Clubs page hero/content layout for the new pages so styling stays native to Webflow.
4. Update the homepage card "Join a competitive league" link from `/calendar/` to `/leagues/`.
5. Add `LEAGUES` to nav/footer between Calendar and Coaching.
6. Update Clubs FAQ corporate/private events answer using `page-copy.md`.
7. Publish Webflow.

## API note

Direct Webflow publish requires a Webflow API credential and site/page IDs. No credential is present locally, so this repo provides the exact content and change map instead of touching production.
