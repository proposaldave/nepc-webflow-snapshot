# NEPC Website Working Rules

This repo is the active continuation path for the NEPC Webflow replacement preview.

## Project boundary

- Treat this folder as the only source for the public NEPC website preview.
- Start NEPC website Codex sessions from this repository folder, not from a broader personal or company workspace.
- If the current working directory is not this repository folder, stop and switch to this folder before reading, editing, building, or publishing site files.
- Do not copy source files from the parent workspace into this repo.
- Do not use parent-workspace search results as website content unless the exact source is already public-facing and approved for the site.
- If a file would be inappropriate on the public website, it does not belong anywhere in this repo.

## Source of truth

- Edit `dist/` first. It is the editable static site snapshot.
- Rebuild `docs/` from `dist/` with `node .\scripts\build-github-pages-preview.mjs`.
- GitHub Pages serves `docs/`.
- Do not hand-edit `docs/` unless the requested change is GitHub Pages-only.

## Edit loop

1. Check `git status --short --branch`.
2. Create or continue a review branch. Never make normal edit batches directly on `main`.
3. Make the smallest change that satisfies the request.
4. Run `node .\scripts\normalize-navigation.mjs dist`.
5. Run `node .\scripts\build-github-pages-preview.mjs`.
6. Run `node .\scripts\scan-public-preview.mjs`.
7. Verify the affected page locally with `node .\serve.mjs` and `http://localhost:4177/`.
8. Commit and push the review branch.
9. Use the Cloudflare branch preview for staff review.
10. Merge to `main` only after Dave explicitly says `publish live`.

## Safety

- This repo is public. Commit only public NEPC website content and public-facing assets.
- Do not use member data, exports from operating systems, private chat/email text, company strategy, investor material, private notes, credentials, or local machine paths.
- Use public NEPC website copy, approved public-facing copy, and explicitly approved public social/media assets only.
- Never search the user's Desktop, Downloads, Documents, broader workspaces, Slack exports, Drive sync folders, or memory folders for website content.
- If Dave attaches an image or file, use only that explicit attachment for the requested public-site change and do not browse nearby folders.
- Treat Slack, Gmail, Google Drive, Chrome, Computer Use, and other connected sources as out of scope unless Dave explicitly authorizes one exact source for one public-site request.
- Keep the GitHub connector as the only normally enabled app for this project.
- Never switch this project to Full access. Use the committed workspace-only permission profile.

## Publishing boundary

- A review-branch push is for preview only and must not change the production domain.
- A push to `main` is a production publish because Cloudflare Pages deploys `main` automatically.
- Do not merge or push to `main` without Dave's explicit `publish live` approval in the current task.
- After production deployment, verify the affected route and the main navigation on the public domain before reporting completion.

## Migration stance

- Current edit work happens here.
- Do not start a new site project unless the request is to convert this static snapshot into a maintainable component/content system.
- Webflow replacement should happen only after forms, bookings, embeds, analytics, redirects, and DNS cutover are explicitly verified.
