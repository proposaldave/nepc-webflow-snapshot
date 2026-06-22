# Start Here For Codex

This is the self-contained public NEPC website project.

## Required Workspace

Open Codex with the standalone `NEPC_WEBSITE_PUBLIC` repository folder as the workspace.

Do not start NEPC website work from a broader personal workspace, Downloads, Desktop, or Documents.

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

1. Edit `dist/`.
2. Rebuild GitHub preview:

```powershell
node .\scripts\build-github-pages-preview.mjs
```

3. Run the public safety scan:

```powershell
node .\scripts\scan-public-preview.mjs
```

4. Check the diff.
5. Commit and push.

## Production Hosting

- GitHub repo remains the source of truth.
- GitHub Pages remains staging/review.
- Production should deploy from `dist/` to Cloudflare Pages.
