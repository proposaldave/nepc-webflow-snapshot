import { mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const pdfPath =
  "/assets/cdn.prod.website-files.com/67d7a7154f2e71cc1081b1bf/68e3fe82db64a2ba70c5b246_NEPC Corporate Events & Private Parties.pdf";

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

function write(rel, content) {
  const path = join(root, rel);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function htmlFiles() {
  return walk(dist).filter((path) => path.endsWith(".html"));
}

function patchAllPages() {
  for (const file of htmlFiles()) {
    let html = readFileSync(file, "utf8");
    html = html.replace(
      '<a href="/calendar/" class="navbar14_link w-nav-link">CALENDAR</a><a href="/coaching/" class="navbar14_link w-nav-link">COACHING</a>',
      '<a href="/calendar/" class="navbar14_link w-nav-link">CALENDAR</a><a href="/leagues/" class="navbar14_link w-nav-link">LEAGUES</a><a href="/coaching/" class="navbar14_link w-nav-link">COACHING</a>',
    );
    html = html.replace(
      '<a href="/calendar/" class="footer4_link">CALENDAR</a><a href="/coaching/" class="footer4_link">COACHING</a>',
      '<a href="/calendar/" class="footer4_link">CALENDAR</a><a href="/leagues/" class="footer4_link">LEAGUES</a><a href="/coaching/" class="footer4_link">COACHING</a>',
    );
    writeFileSync(file, html);
  }
}

function shellFrom(templateRel, title, description) {
  let html = read(templateRel);
  const mainStart = html.indexOf('<main class="main-wrapper max-width-full">');
  const footerStart = html.indexOf('<footer class="footer4_component');
  if (mainStart < 0 || footerStart < 0) {
    throw new Error(`Could not split Webflow shell for ${templateRel}`);
  }
  let head = html.slice(0, mainStart);
  let footer = html.slice(footerStart);
  head = head.replace(/<title>.*?<\/title>/, `<title>${title} | New England Pickleball Club</title>`);
  head = head.replace(
    /<meta content=".*?" name="description"\/>/,
    `<meta content="${description}" name="description"/>`,
  );
  head = head.replace(/<meta content=".*?" property="og:title"\/>/, `<meta content="${title}" property="og:title"/>`);
  head = head.replace(
    /<meta content=".*?" property="og:description"\/>/,
    `<meta content="${description}" property="og:description"/>`,
  );
  head = head.replace(
    /<meta content=".*?" property="twitter:title"\/>/,
    `<meta content="${title}" property="twitter:title"/>`,
  );
  head = head.replace(
    /<meta content=".*?" property="twitter:description"\/>/,
    `<meta content="${description}" property="twitter:description"/>`,
  );
  return { head, footer };
}

function page(title, description, eyebrow, lead, bodyHtml, ctaHtml = "") {
  const { head, footer } = shellFrom("dist/clubs/index.html", title, description);
  const content = `<main class="main-wrapper max-width-full">
<section class="section_contact29">
  <div class="padding-global">
    <div class="padding-section-large is-extra-top">
      <div class="container-large">
        <div class="contact29_component">
          <div class="margin-bottom margin-xxlarge">
            <div class="max-width-large">
              <div class="margin-bottom margin-small">
                <div class="text-size-medium text-weight-semibold text-color-blue">${eyebrow}</div>
                <h1 class="heading-style-h2"><span>${title}</span></h1>
              </div>
              <p class="text-size-xlarge text-color-tertiary">${lead}</p>
            </div>
          </div>
          <div class="max-width-large">
            <div class="texts-rich-text w-richtext">
              ${bodyHtml}
            </div>
            ${ctaHtml}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
</main>`;
  return `${head}${content}${footer}`;
}

function cta(primaryHref, primaryLabel, secondaryHref = "/contact/", secondaryLabel = "Contact us") {
  return `<div class="margin-top margin-large"><div class="button-group">
<a href="${primaryHref}" class="button w-button">${primaryLabel}</a>
<a href="${secondaryHref}" class="button is-secondary w-button">${secondaryLabel}</a>
</div></div>`;
}

function extractLeagueBody() {
  const html = read("dist/club-news/new-nepc-partner-leagues/index.html");
  const marker = '<div class="texts-rich-text w-richtext">';
  const start = html.indexOf(marker);
  if (start < 0) {
    throw new Error("Could not find league rich text content");
  }
  const bodyStart = start + marker.length;
  const end = html.indexOf('<div class="content29_content-bottom">', bodyStart);
  if (end < 0) {
    throw new Error("Could not find league rich text end");
  }
  let body = html.slice(bodyStart, end).replace(/<\/div><\/div>$/, "");
  body = `<p><strong>Seasonal league information now lives here instead of the calendar.</strong> This page can be updated each season while keeping one consistent destination for players looking for competitive play.</p>${body}`;
  return body;
}

function patchHomeLeagueCard() {
  const file = join(dist, "index.html");
  let html = readFileSync(file, "utf8");
  const marker = '<h3 class="heading-style-h5">Join a competitive league</h3>';
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) throw new Error("Could not find homepage league card");
  const before = html.slice(0, markerIndex);
  const after = html.slice(markerIndex).replace('href="/calendar/"', 'href="/leagues/"');
  writeFileSync(file, before + after);
}

function patchClubsFaq() {
  const file = join(dist, "clubs", "index.html");
  let html = readFileSync(file, "utf8");
  html = html.replace(
    `We do! <a href="${pdfPath}">View our brochure</a> for more information.`,
    `We do! Visit our <a href="/private-events/">Private Events &amp; Corporate Outings page</a> or <a href="${pdfPath}">view our brochure</a> for more information.`,
  );
  writeFileSync(file, html);
}

function patchCalendarCopy() {
  const file = join(dist, "calendar", "index.html");
  let html = readFileSync(file, "utf8");
  html = html.replace(
    "Register for a league or competitive ladder",
    'Register for a <a href="/leagues/">league</a> or competitive ladder',
  );
  writeFileSync(file, html);
}

function buildPages() {
  write(
    "dist/leagues/index.html",
    page(
      "NEPC Leagues",
      "Find current New England Pickleball Club league information for Rye and Middleton.",
      "Competitive Play",
      "Weekly partner leagues and competitive formats for players who want organized match play at Rye and Middleton.",
      extractLeagueBody(),
      cta("/calendar/", "View the club calendar", "mailto:ryann@nepclub.com", "Email Ryann"),
    ),
  );

  const privateEventsBody = `
<h2>Private parties, team outings, and corporate events</h2>
<p>NEPC hosts structured pickleball events for companies, teams, families, and private groups at both club locations. We can help with court time, event flow, beginner-friendly instruction, round robin play, and a format that keeps everyone moving.</p>
<h3>Good fits</h3>
<ul role="list">
  <li>Corporate outings and team-building events</li>
  <li>Birthday parties, family events, and private celebrations</li>
  <li>Beginner-friendly pickleball introductions</li>
  <li>Competitive group play for experienced players</li>
</ul>
<h3>Locations</h3>
<p>Private events are available at NEPC Middleton and NEPC Rye, subject to court availability and staffing.</p>
<h3>How to start</h3>
<p>Use the brochure for package details, then contact the club with your preferred location, date range, group size, and whether the group is beginner, mixed-level, or competitive.</p>`;

  const privateEventsPage = page(
    "Private Events & Corporate Outings",
    "Host a private party, team outing, or corporate pickleball event at New England Pickleball Club.",
    "Groups & Events",
    "Bring your group to NEPC for a fun, structured pickleball event that works for beginners, mixed-level groups, and experienced players.",
    privateEventsBody,
    cta(pdfPath, "View the brochure", "/contact/", "Contact a club"),
  );
  write("dist/private-events/index.html", privateEventsPage);
  write("dist/corporate-events/index.html", privateEventsPage.replaceAll("Private Events & Corporate Outings", "Corporate Events at NEPC"));

  const glowBody = `
<h2>Glow in the Dark Pickleball</h2>
<p>Glow in the Dark Pickleball is a high-energy event format for parties, social nights, and group outings. The format is designed to feel different from a normal court reservation: music, glow gear, lights-down play, and a social event flow.</p>
<h3>Best for</h3>
<ul role="list">
  <li>Corporate groups looking for a memorable team event</li>
  <li>Private parties and celebrations</li>
  <li>Social nights where the experience matters as much as the score</li>
</ul>
<h3>Booking note</h3>
<p>Availability depends on location, date, staffing, and event setup time. Contact the club with group size and preferred dates so the team can confirm the right format.</p>`;

  write(
    "dist/glow-in-the-dark/index.html",
    page(
      "Glow in the Dark Pickleball",
      "Plan a glow in the dark pickleball event at New England Pickleball Club.",
      "Special Events",
      "A lights-down, high-energy pickleball format for private parties, social nights, and corporate outings.",
      glowBody,
      cta("/private-events/", "Plan a group event", "/contact/", "Contact a club"),
    ),
  );
}

function buildWebflowPackage() {
  write(
    "webflow-update-package/README.md",
    `# NEPC Webflow Update Package

This package converts the Krista/Ryann requests into Webflow-ready changes without a redesign.

## What changed in the preview

- Added a dedicated Leagues page at \`/leagues/\`.
- Updated the homepage "Join a competitive league" card so it goes to \`/leagues/\`, not \`/calendar/\`.
- Added a main nav and footer link for \`LEAGUES\`.
- Added \`/private-events/\` and \`/corporate-events/\` pages for private parties and corporate outings.
- Added \`/glow-in-the-dark/\` for the glow-event request.
- Updated the Clubs FAQ so corporate/private events are no longer buried behind only a PDF link.
- Kept the existing Webflow visual system instead of introducing a new design.

## Fast Webflow implementation

1. In Webflow Designer, create static pages with these slugs:
   - \`leagues\`
   - \`private-events\`
   - \`corporate-events\`
   - \`glow-in-the-dark\`
2. Use \`page-copy.md\` for page title, meta description, H1, intro, and body copy.
3. Copy the current Clubs page hero/content layout for the new pages so styling stays native to Webflow.
4. Update the homepage card "Join a competitive league" link from \`/calendar/\` to \`/leagues/\`.
5. Add \`LEAGUES\` to nav/footer between Calendar and Coaching.
6. Update Clubs FAQ corporate/private events answer using \`page-copy.md\`.
7. Publish Webflow.

## API note

Direct Webflow publish from Codex requires a Webflow API token and site/page IDs. No token is present locally, so this repo provides the exact content and change map instead of touching production.
`,
  );

  write(
    "webflow-update-package/page-copy.md",
    `# Page Copy

## /leagues/

Title: NEPC Leagues

Meta description: Find current New England Pickleball Club league information for Rye and Middleton.

H1: NEPC Leagues

Intro: Weekly partner leagues and competitive formats for players who want organized match play at Rye and Middleton.

Body: Use the existing "New NEPC Partner Leagues" article content, with this note at the top:

Seasonal league information now lives here instead of the calendar. This page can be updated each season while keeping one consistent destination for players looking for competitive play.

CTA:
- View the club calendar: /calendar/
- Email Ryann: ryann@nepclub.com

## /private-events/

Title: Private Events & Corporate Outings

Meta description: Host a private party, team outing, or corporate pickleball event at New England Pickleball Club.

H1: Private Events & Corporate Outings

Intro: Bring your group to NEPC for a fun, structured pickleball event that works for beginners, mixed-level groups, and experienced players.

Body:

Private parties, team outings, and corporate events

NEPC hosts structured pickleball events for companies, teams, families, and private groups at both club locations. We can help with court time, event flow, beginner-friendly instruction, round robin play, and a format that keeps everyone moving.

Good fits:
- Corporate outings and team-building events
- Birthday parties, family events, and private celebrations
- Beginner-friendly pickleball introductions
- Competitive group play for experienced players

Locations:
Private events are available at NEPC Middleton and NEPC Rye, subject to court availability and staffing.

How to start:
Use the brochure for package details, then contact the club with your preferred location, date range, group size, and whether the group is beginner, mixed-level, or competitive.

CTA:
- View the brochure: ${pdfPath}
- Contact a club: /contact/

## /corporate-events/

Use the same page as /private-events/, with the H1 "Corporate Events at NEPC".

## /glow-in-the-dark/

Title: Glow in the Dark Pickleball

Meta description: Plan a glow in the dark pickleball event at New England Pickleball Club.

H1: Glow in the Dark Pickleball

Intro: A lights-down, high-energy pickleball format for private parties, social nights, and corporate outings.

Body:

Glow in the Dark Pickleball

Glow in the Dark Pickleball is a high-energy event format for parties, social nights, and group outings. The format is designed to feel different from a normal court reservation: music, glow gear, lights-down play, and a social event flow.

Best for:
- Corporate groups looking for a memorable team event
- Private parties and celebrations
- Social nights where the experience matters as much as the score

Booking note:
Availability depends on location, date, staffing, and event setup time. Contact the club with group size and preferred dates so the team can confirm the right format.

CTA:
- Plan a group event: /private-events/
- Contact a club: /contact/

## Clubs FAQ replacement

Question: Do you offer corporate events or private parties?

Answer: We do! Visit our Private Events & Corporate Outings page or view our brochure for more information.
`,
  );

  write(
    "webflow-update-package/change-map.json",
    JSON.stringify(
      {
        pages_to_create: [
          { slug: "leagues", source: "Existing New NEPC Partner Leagues article plus permanent page intro" },
          { slug: "private-events", source: "New page copy in page-copy.md" },
          { slug: "corporate-events", source: "Alias page for corporate-event search intent" },
          { slug: "glow-in-the-dark", source: "New page copy in page-copy.md" },
        ],
        links_to_update: [
          { location: "Homepage service card", label: "Join a competitive league", from: "/calendar/", to: "/leagues/" },
          { location: "Main navigation", action: "Add LEAGUES between CALENDAR and COACHING", href: "/leagues/" },
          { location: "Footer navigation", action: "Add LEAGUES between CALENDAR and COACHING", href: "/leagues/" },
          { location: "Clubs FAQ", action: "Point corporate/private events answer to /private-events/ plus brochure PDF" },
        ],
        blocked_for_direct_api_publish: {
          reason: "No WEBFLOW_TOKEN found in local environment.",
          needed: ["WEBFLOW_TOKEN", "Webflow site ID", "Webflow page IDs or permission to create pages"],
        },
      },
      null,
      2,
    ),
  );
}

patchAllPages();
patchHomeLeagueCard();
patchClubsFaq();
patchCalendarCopy();
buildPages();
patchAllPages();
buildWebflowPackage();

console.log("NEPC Webflow update package applied.");
