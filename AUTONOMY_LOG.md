# Autonomy Log

## 2026-05-24 NEPC Webflow Update Package

ASSUMED: The active direction is the current Webflow-style snapshot, not the separate 10x redesign, because Dave said he did not like the 10x site and wanted to focus on Krista/Ryann's requested updates.

ASSUMED: Leagues should become a dedicated permanent page at `/leagues/` because Krista explicitly said the league announcement should not point to the calendar.

ASSUMED: Corporate events, private parties, and glow in the dark should be implemented as first-class static pages and Webflow page-copy handoff materials because Mike said anything more prominent than a PDF/news item needs design/work, and Dave wants Codex to do the work.

BLOCKED ACTION: Directly publish changes into the live Webflow project.

WHY NEEDED: Publishing to Webflow would let Dave show Krista/Ryann the live production draft without manually recreating pages.

WHAT I TRIED: Checked the local environment for Webflow credentials and reviewed Webflow API direction.

MANUAL STEP NEEDED: Add a Webflow API token and the target site/page IDs, or recreate the pages in Webflow using `webflow-update-package/page-copy.md`.

FALLBACK USED: Built working local preview pages in `dist/`, a repeatable patch script at `scripts/apply-update-package.mjs`, and a Webflow implementation package in `webflow-update-package/`.
