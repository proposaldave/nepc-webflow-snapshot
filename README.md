# NEPC Webflow Snapshot

This folder is the exact-current-site track for moving `newenglandpickleball.com` off Webflow.

It snapshots public Webflow pages into static HTML and mirrors public CDN assets into `dist/assets`. Treat this as the visual/content reference, not the maintainable long-term site.

## Project Boundary

This is the public-only NEPC website project. Keep it self-contained and do not pull unpublished club operations, member data, investor material, private notes, local memory, or parent-workspace files into this repo.

## Run

```powershell
node sites/nepc_static_clone/clone-nepc.mjs
```

## Preview

```powershell
node sites/nepc_static_clone/serve.mjs
```

Open `http://localhost:4177`.

## Use

This is not the final site architecture. It proves the public Webflow site can be captured and hosted outside Webflow, and gives Dave a close side-by-side reference against the 10x Codex site.

## Codex Continuation Workflow

Use this repo for current website edits. Do not start a new project for normal copy, nav, page, image, or layout changes.

The edit path is:

```powershell
git status --short --branch
node .\serve.mjs
```

Make changes in `dist/`, then rebuild and check the public preview files:

```powershell
node .\scripts\build-github-pages-preview.mjs
node .\scripts\scan-public-preview.mjs
git diff --check
git status --short
```

Create a review branch before each edit batch:

```powershell
git switch -c review/describe-the-change
git add dist docs scripts .github .codex README.md AGENTS.md PUBLIC_SITE_SAFETY.md START_HERE_FOR_CODEX.md
git commit -m "Describe NEPC website edit"
git push -u origin HEAD
```

Use the Cloudflare branch deployment as the review link. Do not merge the branch to `main` until Dave explicitly says `publish live`. Cloudflare deploys `main` to `newenglandpickleball.com`, so merging to `main` is the production publishing action.

GitHub Pages serves the rebuilt `docs/` folder at:

```text
https://proposaldave.github.io/nepc-webflow-snapshot/
```

Keep Webflow as the production site until the static replacement has verified forms, booking links, embeds, analytics, redirects, and DNS cutover.

Final migration should convert the mirror into a maintainable codebase with:
- Reusable page components
- Editable content files
- Real form handling
- Explicit CourtReserve embed wrappers
- A deploy target such as Vercel, Netlify, or Cloudflare Pages

## Current Snapshot

Refreshed from the live site on 2026-05-23.

Verified locally:

- `http://localhost:4177/`
- `http://localhost:4177/club-news/new-nepc-partner-leagues/`

## Local Release Artifacts

Generated release artifacts are ignored in git and live in `release/`:

- `nepc-webflow-snapshot-dist.zip` is the static Webflow snapshot.
- `nepc-webflow-snapshot.bundle` is a git bundle for recreating this local repo.
- `SHA256SUMS.txt` contains checksums for both artifacts.

## GitHub Publish

This folder is a standalone git repo.

After `gh auth login`, push the current review branch with:

```powershell
.\PUBLISH_TO_GITHUB.ps1
```

The helper refuses to push from `main`.
