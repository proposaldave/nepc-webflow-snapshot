# NEPC Webflow Snapshot

This folder is the exact-current-site track for moving `newenglandpickleball.com` off Webflow.

It snapshots public Webflow pages into static HTML and mirrors public CDN assets into `dist/assets`. Treat this as the visual/content reference, not the maintainable long-term site.

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

After `gh auth login`, publish with:

```powershell
.\PUBLISH_TO_GITHUB.ps1
```
