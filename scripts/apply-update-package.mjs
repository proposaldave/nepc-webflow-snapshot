import { mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const pdfPath =
  "/assets/cdn.prod.website-files.com/67d7a7154f2e71cc1081b1bf/68e3fe82db64a2ba70c5b246_NEPC Corporate Events & Private Parties.pdf";
const img = {
  leagues: "/assets/cdn.prod.website-files.com/67d8ef9f47150547ee5f7682/69e7fd670276d194c03b043a_New_England_Pickleball_Club-partner-league-TV.jpg",
  leagueCard: "/assets/cdn.prod.website-files.com/67d7a7154f2e71cc1081b1bf/6818c7d8b7e634aa6f4919f4_Join in a competitive league.webp",
  privateCourt: "/assets/cdn.prod.website-files.com/67d7a7154f2e71cc1081b1bf/6818c8a81376935f7beb1264_Book a private court.webp",
  social: "/assets/cdn.prod.website-files.com/67d7a7154f2e71cc1081b1bf/6818c7bfeff9dcdb05525cef_Sign up for a social play.webp",
  cta: "/assets/cdn.prod.website-files.com/67d7a7154f2e71cc1081b1bf/67d7e8b027ec9b12a6fc9b65_NEPC_Home CTA BG 1.webp",
  rye: "/assets/cdn.prod.website-files.com/67d8ef9f47150547ee5f7682/6818aa32bef417e3e7601fed_NEPC RYE INTERIOR&EXTERIOR 1.webp",
  middleton: "/assets/cdn.prod.website-files.com/67d8ef9f47150547ee5f7682/6818aa4b6c49a7e1cbe37e20_NEPC MIDDLETON INTERIOR&EXTERIOR 2.webp",
};

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

function moveEventsBeforeContact(html) {
  const navOrder = ["CLUBS", "CALENDAR", "LEAGUES", "COACHING", "MEMBERSHIP", "EVENTS", "CONTACT", "GIFT CARDS"];
  const footerOrder = ["CLUBS", "CALENDAR", "LEAGUES", "COACHING", "MEMBERSHIP", "EVENTS", "CONTACT"];
  return html
    .replace(/<div class="navbar14_menu-links">([\s\S]*?)<\/div><div id="w-node/, (_match, links) => {
      const ordered = orderLinks(links, navOrder);
      return `<div class="navbar14_menu-links">${ordered}</div><div id="w-node`;
    })
    .replace(/<div class="w-layout-grid footer4_link-list">([\s\S]*?)<\/div>/g, (_match, links) => {
      const ordered = orderLinks(links, footerOrder);
      return `<div class="w-layout-grid footer4_link-list">${ordered}</div>`;
    });
}

function orderLinks(links, order) {
  const byText = new Map();
  for (const match of links.matchAll(/<a\b[^>]*>(CLUBS|CALENDAR|LEAGUES|EVENTS|COACHING|MEMBERSHIP|CONTACT|GIFT CARDS)<\/a>/g)) {
    const anchor = match[0];
    const text = match[1];
    if (!byText.has(text) || anchor.includes("w--current")) {
      byText.set(text, anchor);
    }
  }
  return order.map((text) => byText.get(text)).filter(Boolean).join("");
}

function patchAllPages() {
  for (const file of htmlFiles()) {
    let html = readFileSync(file, "utf8");
    html = html.replace(
      '<a href="/calendar/" class="navbar14_link w-nav-link">CALENDAR</a><a href="/coaching/" class="navbar14_link w-nav-link">COACHING</a>',
      '<a href="/calendar/" class="navbar14_link w-nav-link">CALENDAR</a><a href="/leagues/" class="navbar14_link w-nav-link">LEAGUES</a><a href="/coaching/" class="navbar14_link w-nav-link">COACHING</a>',
    );
    html = html.replace(
      '<a href="/leagues/" class="navbar14_link w-nav-link">LEAGUES</a><a href="/coaching/" class="navbar14_link w-nav-link">COACHING</a>',
      '<a href="/leagues/" class="navbar14_link w-nav-link">LEAGUES</a><a href="/private-events/" class="navbar14_link w-nav-link">EVENTS</a><a href="/coaching/" class="navbar14_link w-nav-link">COACHING</a>',
    );
    html = html.replace(
      '<a href="/calendar/" class="footer4_link">CALENDAR</a><a href="/coaching/" class="footer4_link">COACHING</a>',
      '<a href="/calendar/" class="footer4_link">CALENDAR</a><a href="/leagues/" class="footer4_link">LEAGUES</a><a href="/coaching/" class="footer4_link">COACHING</a>',
    );
    html = html.replace(
      '<a href="/leagues/" class="footer4_link">LEAGUES</a><a href="/coaching/" class="footer4_link">COACHING</a>',
      '<a href="/leagues/" class="footer4_link">LEAGUES</a><a href="/private-events/" class="footer4_link">EVENTS</a><a href="/coaching/" class="footer4_link">COACHING</a>',
    );
    html = html.replace(
      '<a href="/leagues/" class="footer4_link">CALENDAR</a>',
      '<a href="/calendar/" class="footer4_link">CALENDAR</a>',
    );
    html = moveEventsBeforeContact(html);
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

function codexCss() {
  return `<style>
.codex-page{background:#f7fbff}
.codex-hero{position:relative;min-height:620px;display:flex;align-items:flex-end;overflow:hidden;background:#0d5497;color:white}
.codex-hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.codex-hero:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,36,70,.88),rgba(5,36,70,.52) 48%,rgba(5,36,70,.18))}
.codex-hero-inner{position:relative;z-index:1;width:100%;padding:8rem 5vw 5rem}
.codex-hero-copy{max-width:760px}
.codex-eyebrow{margin-bottom:.75rem;color:#9ed8ff;font-weight:700;text-transform:uppercase;letter-spacing:.08em}
.codex-hero h1{margin:0 0 1rem;font-size:clamp(3rem,7vw,6.5rem);line-height:.95;color:white}
.codex-hero p{max-width:680px;font-size:1.25rem;line-height:1.5;color:rgba(255,255,255,.9)}
.codex-actions{display:flex;gap:1rem;flex-wrap:wrap;margin-top:2rem}
.codex-button{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:.9rem 1.25rem;border-radius:999px;background:#4bb8ff;color:#061f38;text-decoration:none;font-weight:800}
.codex-button.secondary{background:white;color:#0d5497}
.codex-section{padding:5rem 5vw}
.codex-container{max-width:1180px;margin:0 auto}
.codex-kicker{color:#0d5497;font-weight:800;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.5rem}
.codex-section h2{font-size:clamp(2rem,4vw,3.5rem);line-height:1.05;margin:0 0 1rem;color:#071b2d}
.codex-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.25rem}
.codex-grid.two{grid-template-columns:repeat(2,minmax(0,1fr))}
.codex-card{background:white;border:1px solid rgba(13,84,151,.14);border-radius:16px;overflow:hidden;box-shadow:0 14px 40px rgba(13,84,151,.08)}
.codex-card img{width:100%;height:220px;object-fit:cover;display:block}
.codex-card-body{padding:1.4rem}
.codex-card h3{font-size:1.45rem;line-height:1.1;margin:0 0 .5rem;color:#071b2d}
.codex-card p,.codex-card li{color:#425466;line-height:1.5}
.codex-card ul{padding-left:1.1rem;margin:.75rem 0 0}
.codex-panel{display:grid;grid-template-columns:1fr 1fr;gap:2rem;align-items:center;background:white;border-radius:20px;padding:1.5rem;box-shadow:0 18px 48px rgba(13,84,151,.08)}
.codex-panel img{width:100%;height:420px;object-fit:cover;border-radius:14px}
.codex-rich{font-size:1.05rem;line-height:1.65;color:#24364a}
.codex-rich h2,.codex-rich h3,.codex-rich h4{color:#071b2d}
.codex-link-card{display:flex;flex-direction:column;justify-content:flex-end;min-height:300px;padding:1.25rem;border-radius:16px;overflow:hidden;position:relative;color:white;text-decoration:none;background:#0d5497}
.codex-link-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.codex-link-card:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(3,22,40,.05),rgba(3,22,40,.78))}
.codex-link-card div{position:relative;z-index:1}
.codex-link-card h3{color:white;margin:0 0 .35rem;font-size:1.6rem}
.codex-link-card p{margin:0;color:rgba(255,255,255,.88)}
.codex-dark{background:#061f38;color:white}
.codex-dark h2,.codex-dark h3{color:white}
.codex-dark p{color:rgba(255,255,255,.86)}
@media(max-width:900px){.codex-hero{min-height:560px}.codex-grid,.codex-grid.two,.codex-panel{grid-template-columns:1fr}.codex-panel img{height:280px}.codex-section{padding:3.25rem 1.25rem}.codex-hero-inner{padding:7rem 1.25rem 3.5rem}}
</style>`;
}

function page(title, description, eyebrow, lead, heroImage, bodyHtml, ctaHtml = "") {
  const { head, footer } = shellFrom("dist/clubs/index.html", title, description);
  const content = `<main class="main-wrapper max-width-full codex-page">
${codexCss()}
<section class="codex-hero">
  <img src="${heroImage}" alt=""/>
  <div class="codex-hero-inner">
    <div class="codex-hero-copy">
      <div class="codex-eyebrow">${eyebrow}</div>
      <h1>${title}</h1>
      <p>${lead}</p>
      ${ctaHtml}
    </div>
  </div>
</section>
${bodyHtml}
</main>`;
  return `${head}${content}${footer}`;
}

function cta(primaryHref, primaryLabel, secondaryHref = "/contact/", secondaryLabel = "Contact us") {
  return `<div class="codex-actions">
<a href="${primaryHref}" class="codex-button">${primaryLabel}</a>
<a href="${secondaryHref}" class="codex-button secondary">${secondaryLabel}</a>
</div>`;
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
  html = html.replace(
    /(<h3 class="heading-style-h5">Join a competitive league<\/h3>[\s\S]*?<div class="button-group"><a href=")\/calendar\/(")/,
    "$1/leagues/$2",
  );
  html = html.replace(
    /(<h3 class="heading-style-h5">Take a class or lesson<\/h3>[\s\S]*?<div class="button-group"><a href=")\/leagues\/(")/,
    "$1/coaching/$2",
  );
  writeFileSync(file, html);
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
  const eventLinks = `<section class="codex-section">
  <div class="codex-container">
    <div class="codex-kicker">Plan something different</div>
    <h2>Events that are easy to find</h2>
    <div class="codex-grid">
      <a class="codex-link-card" href="/private-events/"><img src="${img.privateCourt}" alt=""/><div><h3>Private Events</h3><p>Parties, celebrations, and custom group play.</p></div></a>
      <a class="codex-link-card" href="/corporate-events/"><img src="${img.cta}" alt=""/><div><h3>Corporate Events</h3><p>Team outings with a structured pickleball format.</p></div></a>
      <a class="codex-link-card" href="/glow-in-the-dark/"><img src="${img.social}" alt=""/><div><h3>Glow in the Dark</h3><p>A lights-down social event format.</p></div></a>
    </div>
  </div>
</section>`;

  const leagueBody = `<section class="codex-section">
  <div class="codex-container">
    <div class="codex-panel">
      <img src="${img.leagueCard}" alt=""/>
      <div>
        <div class="codex-kicker">Dedicated League Page</div>
        <h2>Seasonal league information now lives here.</h2>
        <p class="codex-rich">This page can be updated each season while keeping one consistent destination for players looking for competitive play.</p>
        <div class="codex-actions"><a class="codex-button" href="mailto:ryann@nepclub.com">Email Ryann</a><a class="codex-button secondary" href="/calendar/">View Calendar</a></div>
      </div>
    </div>
  </div>
</section>
<section class="codex-section" style="padding-top:0">
  <div class="codex-container">
    <div class="codex-rich">
      ${extractLeagueBody()}
    </div>
  </div>
</section>
${eventLinks}`;

  write(
    "dist/leagues/index.html",
    page(
      "NEPC Leagues",
      "Find current New England Pickleball Club league information for Rye and Middleton.",
      "Competitive Play",
      "Weekly partner leagues and competitive formats for players who want organized match play at Rye and Middleton.",
      img.leagues,
      leagueBody,
      cta("/calendar/", "View the club calendar", "mailto:ryann@nepclub.com", "Email Ryann"),
    ),
  );

  const privateEventsBody = `<section class="codex-section">
  <div class="codex-container">
    <div class="codex-kicker">Choose the event format</div>
    <h2>Private events should feel organized, social, and easy.</h2>
    <div class="codex-grid">
      <div class="codex-card"><img src="${img.privateCourt}" alt=""/><div class="codex-card-body"><h3>Private parties</h3><p>Birthday parties, family events, and celebrations with court time and a clear play format.</p></div></div>
      <div class="codex-card"><img src="${img.cta}" alt=""/><div class="codex-card-body"><h3>Corporate outings</h3><p>Beginner-friendly team building, mixed-level round robins, and structured play for coworkers.</p></div></div>
      <div class="codex-card"><img src="${img.social}" alt=""/><div class="codex-card-body"><h3>Social play</h3><p>Events that keep people rotating, meeting each other, and playing without awkward downtime.</p></div></div>
    </div>
  </div>
</section>
<section class="codex-section codex-dark">
  <div class="codex-container">
    <div class="codex-grid two">
      <div><h2>What NEPC can help with</h2><p>Court time, event flow, beginner-friendly instruction, round robin play, and a format that keeps everyone moving.</p></div>
      <div class="codex-card"><div class="codex-card-body"><h3>Start with four details</h3><ul role="list"><li>Preferred club: Middleton or Rye</li><li>Date range and group size</li><li>Beginner, mixed-level, or competitive</li><li>Private party, corporate outing, or glow event</li></ul></div></div>
    </div>
  </div>
</section>
${eventLinks}`;

  const privateEventsPage = page(
    "Private Events & Corporate Outings",
    "Host a private party, team outing, or corporate pickleball event at New England Pickleball Club.",
    "Groups & Events",
    "Bring your group to NEPC for a fun, structured pickleball event that works for beginners, mixed-level groups, and experienced players.",
    img.privateCourt,
    privateEventsBody,
    cta(pdfPath, "View the brochure", "/contact/", "Contact a club"),
  );
  write("dist/private-events/index.html", privateEventsPage);
  write(
    "dist/corporate-events/index.html",
    page(
      "Corporate Events at NEPC",
      "Host a corporate outing or team-building pickleball event at New England Pickleball Club.",
      "Team Outings",
      "A lively team-building format that gets everyone on court, rotating, laughing, and playing together.",
      img.cta,
      `<section class="codex-section">
  <div class="codex-container">
    <div class="codex-panel">
      <img src="${img.middleton}" alt=""/>
      <div>
        <div class="codex-kicker">Team Building</div>
        <h2>More active than dinner. Easier than planning a tournament.</h2>
        <p class="codex-rich">NEPC can turn a group outing into a structured pickleball experience with court time, beginner-friendly play, rotations, and a format that works for mixed levels.</p>
        <div class="codex-actions"><a class="codex-button" href="${pdfPath}">View Brochure</a><a class="codex-button secondary" href="/contact/">Contact a Club</a></div>
      </div>
    </div>
  </div>
</section>
${eventLinks}`,
      cta(pdfPath, "View the brochure", "/private-events/", "See all event options"),
    ),
  );

  const glowBody = `<section class="codex-section codex-dark">
  <div class="codex-container">
    <div class="codex-panel" style="background:#0a2e52">
      <img src="${img.social}" alt=""/>
      <div>
        <div class="codex-kicker">Lights down. Energy up.</div>
        <h2>A social night that feels different from normal court time.</h2>
        <p>Music, glow gear, lights-down play, and a social flow built for parties, corporate groups, and member events.</p>
      </div>
    </div>
  </div>
</section>
<section class="codex-section">
  <div class="codex-container">
    <div class="codex-grid">
      <div class="codex-card"><div class="codex-card-body"><h3>Corporate groups</h3><p>A memorable team event that gets everyone moving.</p></div></div>
      <div class="codex-card"><div class="codex-card-body"><h3>Private parties</h3><p>Birthdays, celebrations, and social nights with a built-in activity.</p></div></div>
      <div class="codex-card"><div class="codex-card-body"><h3>Club events</h3><p>A special format when the experience matters as much as the score.</p></div></div>
    </div>
  </div>
</section>
${eventLinks}`;

  write(
    "dist/glow-in-the-dark/index.html",
    page(
      "Glow in the Dark Pickleball",
      "Plan a glow in the dark pickleball event at New England Pickleball Club.",
      "Special Events",
      "A lights-down, high-energy pickleball format for private parties, social nights, and corporate outings.",
      img.social,
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

Direct Webflow publish requires a Webflow API credential and site/page IDs. No credential is present locally, so this repo provides the exact content and change map instead of touching production.
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
          reason: "No Webflow API credential found in local environment.",
          needed: ["Webflow API credential", "Webflow site ID", "Webflow page IDs or permission to create pages"],
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
