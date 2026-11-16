# SEO maintenance

Edit page content in dist/. Approved route titles/descriptions live in scripts/seo-data.json; FAQ and location facts live in scripts/seo-structured-data.json. Keep FAQ markup identical to visible answers and verify location facts before changing them.

Run:

```sh
node scripts/build-github-pages-preview.mjs
node scripts/check-seo.mjs
node scripts/scan-public-preview.mjs
```

The build generates canonical/social metadata, organization and breadcrumb schema, sitemap, and copyright year. docs/ is generated. No runtime dependency was added.

The proposed primary host is https://newenglandpickleball.com with trailing slashes. The pages.dev production hostname receives a host-specific noindex header. Cloudflare branch previews receive Cloudflare's default noindex header; verify each deployed preview. Do not apply noindex to the custom production domain.

The seo-foundation branch is for review. Do not merge or change domain redirects until production publication is approved. Preserve the gift-card shop host and existing CourtReserve booking links.
