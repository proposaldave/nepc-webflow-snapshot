# Public Site Safety Rules

This repo is public. Treat every committed file as publishable.

## Allowed sources

- Current Webflow export in `dist/`.
- Public NEPC website copy.
- Explicit public-facing copy written for this site.
- Public NEPC social media assets only after Dave provides the exact Instagram link or uploads approved files.

## Blocked sources

- Local Give n Take / GnT strategy, operations, investor, canon, or product files.
- CourtReserve exports, member data, rosters, internal schedules, private Slack/email text, and local memory files.
- API tokens, credentials, local paths, or machine-specific instructions.

## Required before pushing

Run:

```powershell
node .\scripts\scan-public-preview.mjs
```

The scanner checks the public preview and handoff files for local paths, private company terms, token markers, and known internal-file names.

## Photo handling

The GitHub preview uses copied assets under `docs/assets/`, so reviewers see the same images without depending on Webflow. For Webflow publish, each approved image should be uploaded to Webflow Assets, then the Webflow page should point to that asset. The `docs/assets/` paths preserve the source filenames so the handoff can identify the exact image used.
