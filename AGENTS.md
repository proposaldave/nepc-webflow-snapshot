# NEPC Website Working Rules

This repo is the active continuation path for the NEPC Webflow replacement preview.

## Source of truth

- Edit `dist/` first. It is the editable static site snapshot.
- Rebuild `docs/` from `dist/` with `node .\scripts\build-github-pages-preview.mjs`.
- GitHub Pages serves `docs/`.
- Do not hand-edit `docs/` unless the requested change is GitHub Pages-only.

## Edit loop

1. Check `git status --short --branch`.
2. Make the smallest change that satisfies the request.
3. Run `node .\scripts\build-github-pages-preview.mjs`.
4. Run `node .\scripts\scan-public-preview.mjs`.
5. Verify the affected page locally with `node .\serve.mjs` and `http://localhost:4177/`.
6. Commit and push to `origin main`.

## Safety

- This repo is public. Commit only public NEPC website content and public-facing assets.
- Do not use member data, CourtReserve exports, Slack/email text, Give n Receive strategy, investor material, private notes, credentials, or local machine paths.
- Use public NEPC website copy, approved public-facing copy, and explicitly approved public social/media assets only.

## Migration stance

- Current edit work happens here.
- Do not start a new site project unless the request is to convert this static snapshot into a maintainable component/content system.
- Webflow replacement should happen only after forms, bookings, embeds, analytics, redirects, and DNS cutover are explicitly verified.
