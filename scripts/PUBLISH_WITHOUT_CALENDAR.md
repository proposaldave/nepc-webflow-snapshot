# Redesign release with the existing calendar

The owner approved publishing the redesign while postponing the new daily agenda and Cloudflare event-feed configuration.

- The production `/calendar/` source is preserved byte-for-byte from commit `d16d80069b6efe004de79de5161c94d35c903779`, including both original CourtReserve calendar widgets.
- All other redesigned pages, approved photographs, navigation, memberships, coaching content, booking links, and gift-card checkout remain in this release.
- Beginner program discovery uses the original Quick Start widgets and the verified club-calendar destinations. Program buttons display information; they do not claim to filter live sessions.
- No public event API, Pages Function, new event credentials, or DNS changes are included.

The complete daily-agenda prototype and protected endpoint remain on `codex/nepc-clubs-phase-3` at `9d28de34df114b27b6e126212155b3badcaa7e40`. Resume that work separately when the owner requests it. Preserve this published release's later changes when reintroducing the agenda.

Build `docs/` from `dist/`, run SEO, gift-card and public safety checks, then verify the production domain after the approved push to `main`. The SEO check additionally verifies that the deferred calendar page is unchanged.
