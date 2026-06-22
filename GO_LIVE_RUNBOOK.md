# NEPC Website Go-Live Runbook

## Decision

Use Cloudflare Pages for the production `newenglandpickleball.com` site.

Keep GitHub as the source of truth and keep GitHub Pages as the staging/review URL:
`https://proposaldave.github.io/nepc-webflow-snapshot/`

Do not use Ploy for production right now.

## Why Not GitHub Pages For Production

GitHub Pages can technically host a custom domain for free, but GitHub's own Pages limits say Pages is not intended for free hosting of an online business, ecommerce site, or transaction-oriented site. NEPC is a real business website with booking, memberships, leagues, gift cards, and public club information.

GitHub Pages also has a 100 GB/month soft bandwidth limit and no paid bandwidth-overage tier for Pages. GitHub paid plans mainly change private-repository Pages availability; they do not turn Pages into a high-traffic business hosting product.

## Why Cloudflare Pages

Cloudflare Pages Free fits this site better:

- Free static hosting.
- Unlimited static requests/bandwidth.
- Custom domains.
- GitHub-connected deploys.
- No backend server needed.

Current production folder check:

- Publish folder: `dist`
- Total site size: about 38.6 MB
- File count: 272
- Largest file: about 3.75 MB
- Preview folder `docs` is only for the GitHub Pages preview path.

## Traffic Reality

Exact NEPC traffic cannot be known from public data alone. The site has Google Analytics installed (`G-6JMKFWB8TL`), but exact traffic requires GA or Webflow analytics access.

Traffic math from actual current page weight:

- Preview homepage first load is about 2.57 MB.
- GitHub's 100 GB/month Pages limit equals about 39,800 uncached homepage first-loads/month.
- Netlify's 15 GB-ish free credit-equivalent bandwidth equals about 6,000 uncached homepage first-loads/month before counting request credits.
- Cloudflare Pages avoids this concern for static bandwidth.

## CMS Decision

No CMS is required for launch.

Launch with the static site first. Use Codex/GitHub updates for staff edits, homepage announcements, Club News, and league/event changes.

Add a lightweight CMS later only if Krista, Ryann, or Mike need to publish edits without Dave/Codex. If that becomes necessary, use a Git-backed CMS such as Decap CMS so content edits still go through GitHub and deploy cleanly. Do not add a full backend CMS before launch.

## Production Launch Steps

1. In Cloudflare, create a Pages project.
2. Connect GitHub repo: `proposaldave/nepc-webflow-snapshot`.
3. Production branch: `main`.
4. Framework preset: None / Static HTML.
5. Build command: leave blank.
6. Build output directory: `dist`.
7. Deploy.
8. Open the temporary Cloudflare Pages URL and verify:
   - Homepage
   - Clubs
   - Leagues
   - Calendar
   - Coaching
   - Membership
   - Contact
   - Book a Court links
   - Typeform league links
   - Gift-card/shop links
9. Add custom domains in Cloudflare Pages:
   - `www.newenglandpickleball.com`
   - `newenglandpickleball.com`
10. Set `www.newenglandpickleball.com` as the canonical production URL.
11. Update DNS away from Webflow:
   - Remove current Webflow records pointing to `cdn.webflow.com`.
   - Point both `www` and root to the Cloudflare Pages project as Cloudflare instructs.
12. Verify HTTPS after Cloudflare issues certificates.
13. Keep Webflow active for at least 7 days as rollback insurance.

## Rollback

If something fails after DNS cutover, point DNS back to Webflow:

- `www.newenglandpickleball.com` -> `cdn.webflow.com`
- `newenglandpickleball.com` -> `cdn.webflow.com`

Then investigate before trying again.

## Pre-Launch Safety Rule

Only deploy from `C:\Users\dave\NEPC_WEBSITE_PUBLIC`.

Do not deploy anything from `C:\Users\dave\CLAUDE COWORK`, Downloads, Desktop, Slack screenshots, or private working folders.
