# Start Here For Codex

This is the self-contained public NEPC website project.

## Required Workspace

Open Codex with the standalone `NEPC_WEBSITE_PUBLIC` repository folder as the workspace.

Do not start NEPC website work from a broader personal workspace, Downloads, Desktop, or Documents.

Use the project's workspace-only permission profile. Do not select Full access.

## Why

This repository is public. Anything committed here can end up on the live New England Pickleball Club website.

Keeping Codex scoped to this folder prevents accidental use of private files, member data, Slack screenshots, internal notes, investor material, or other sensitive local content.

## Allowed Content

- Files already in this repo.
- Public NEPC website copy.
- Public-facing copy Dave explicitly asks to add.
- Images Dave explicitly attaches or approves for the public website.

## Blocked Content

- Member data.
- CourtReserve exports.
- Staff/private operations files.
- Slack/email screenshots unless Dave explicitly says the exact content is approved for the public website.
- Investor/company strategy material.
- Credentials, API keys, tokens, local paths, or machine-specific private notes.

## Normal Edit Loop

1. Create or continue a review branch.
2. Edit `dist/`.
3. Normalize shared navigation:

```powershell
node .\scripts\normalize-navigation.mjs dist
```

4. Rebuild GitHub preview:

```powershell
node .\scripts\build-github-pages-preview.mjs
```

5. Run the public safety scan:

```powershell
node .\scripts\scan-public-preview.mjs
```

6. Check the diff and affected pages locally.
7. Commit and push the review branch.
8. Share the Cloudflare branch preview for approval.
9. Merge to `main` only after Dave explicitly says `publish live`.

## Production Hosting

- GitHub repo remains the source of truth.
- Cloudflare branch deployments are the primary review links.
- GitHub Pages remains a fallback snapshot.
- Production should deploy from `dist/` to Cloudflare Pages.
