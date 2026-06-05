import { mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const pdfPath =
  "/assets/cdn.prod.website-files.com/67d7a7154f2e71cc1081b1bf/68e3fe82db64a2ba70c5b246_NEPC Corporate Events & Private Parties.pdf";
const img = {
  hero:
    "/assets/cdn.prod.website-files.com/67d8ef9f47150547ee5f7682/69e7fd670276d194c03b043a_New_England_Pickleball_Club-partner-league-TV.jpg",
  league:
    "/assets/cdn.prod.website-files.com/67d7a7154f2e71cc1081b1bf/6818c7d8b7e634aa6f4919f4_Join in a competitive league.webp",
  social:
    "/assets/cdn.prod.website-files.com/67d7a7154f2e71cc1081b1bf/6818c7bfeff9dcdb05525cef_Sign up for a social play.webp",
  court:
    "/assets/cdn.prod.website-files.com/67d7a7154f2e71cc1081b1bf/6818c8a81376935f7beb1264_Book a private court.webp",
  cta:
    "/assets/cdn.prod.website-files.com/67d7a7154f2e71cc1081b1bf/67d7e8b027ec9b12a6fc9b65_NEPC_Home CTA BG 1.webp",
  team:
    "/assets/cdn.prod.website-files.com/67d8ef9f47150547ee5f7682/69beb90c0eec67370faad104_NEPC-Team_Trio_Event-thumbnail.jpg",
  teamAlt:
    "/assets/cdn.prod.website-files.com/67d8ef9f47150547ee5f7682/69bf091fd585ee922ae43b14_NEPC-Trio_Team-thumbnail.jpg",
};

const calendarHref = "/calendar/";
const middletonEventsHref = "https://app.courtreserve.com/Online/Events/List/13164";
const ryeEventsHref = "https://app.courtreserve.com/Online/Events/List/7432";
const organizerHref = "mailto:ryann@nepclub.com";

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

function neutralizeCurrent(html) {
  return html.replaceAll(' aria-current="page"', "").replaceAll(" w--current", "");
}

function shellFrom(templateRel, title, description) {
  const html = read(templateRel);
  const mainStart = html.indexOf('<main class="main-wrapper max-width-full');
  const footerStart = html.indexOf('<footer class="footer4_component');
  if (mainStart < 0 || footerStart < 0) {
    throw new Error(`Could not split Webflow shell for ${templateRel}`);
  }
  let head = neutralizeCurrent(html.slice(0, mainStart));
  let footer = neutralizeCurrent(html.slice(footerStart));
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
.codex-hero{position:relative;min-height:600px;display:flex;align-items:flex-end;overflow:hidden;background:#0d5497;color:white}
.codex-hero img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.codex-hero:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(5,36,70,.9),rgba(5,36,70,.58) 52%,rgba(5,36,70,.2))}
.codex-hero-inner{position:relative;z-index:1;width:100%;padding:8rem 5vw 5rem}
.codex-hero-copy{max-width:820px}
.codex-eyebrow{margin-bottom:.75rem;color:#9ed8ff;font-weight:800;text-transform:uppercase;letter-spacing:.08em}
.codex-hero h1{margin:0 0 1rem;font-size:clamp(2.75rem,6vw,5.7rem);line-height:1;color:white}
.codex-hero p{max-width:720px;font-size:1.2rem;line-height:1.5;color:rgba(255,255,255,.9)}
.codex-actions{display:flex;gap:.85rem;flex-wrap:wrap;margin-top:1.5rem}
.codex-button{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:.85rem 1.15rem;border:0;border-radius:999px;background:#4bb8ff;color:#061f38;text-decoration:none;font-weight:800;line-height:1.1}
.codex-button.secondary{background:white;color:#0d5497}
.codex-button.is-disabled{background:#d9e2ea;color:#506273;cursor:not-allowed;pointer-events:none}
.codex-section{padding:4.75rem 5vw}
.codex-section.is-tight{padding-top:0}
.codex-container{max-width:1180px;margin:0 auto}
.codex-section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:1.25rem;margin-bottom:1.5rem}
.codex-kicker{color:#0d5497;font-weight:800;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.5rem}
.codex-section h2{font-size:clamp(2rem,4vw,3.35rem);line-height:1.05;margin:0;color:#071b2d}
.codex-section p{color:#425466;line-height:1.55}
.codex-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1.25rem}
.codex-grid.two{grid-template-columns:repeat(2,minmax(0,1fr))}
.codex-card{background:white;border:1px solid rgba(13,84,151,.14);border-radius:16px;overflow:hidden;box-shadow:0 14px 40px rgba(13,84,151,.08)}
.codex-card img{width:100%;height:225px;object-fit:cover;display:block}
.codex-card a:not(.codex-button){color:inherit;text-decoration:none}
.codex-image-link{display:block;overflow:hidden}
.codex-image-link img{transition:transform .2s ease}
.codex-image-link:hover img{transform:scale(1.025)}
.codex-title-link:hover{text-decoration:underline;text-decoration-thickness:2px;text-underline-offset:4px}
.codex-card-body{padding:1.35rem}
.codex-card h3{font-size:1.45rem;line-height:1.12;margin:0 0 .55rem;color:#071b2d}
.codex-meta{display:flex;gap:.5rem;flex-wrap:wrap;margin:.75rem 0 0}
.codex-pill{display:inline-flex;border-radius:999px;background:#e8f4ff;color:#0d5497;font-size:.82rem;font-weight:800;padding:.35rem .65rem}
.codex-pill.gold{background:#fff5d9;color:#7c5d00}
.codex-pill.muted{background:#eef2f6;color:#506273}
.codex-link-card{display:flex;flex-direction:column;justify-content:flex-end;min-height:300px;padding:1.25rem;border-radius:16px;overflow:hidden;position:relative;color:white;text-decoration:none;background:#0d5497}
.codex-link-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.codex-link-card:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(3,22,40,.05),rgba(3,22,40,.8))}
.codex-link-card div{position:relative;z-index:1}
.codex-link-card h3{color:white;margin:0 0 .35rem;font-size:1.6rem}
.codex-link-card p{margin:0;color:rgba(255,255,255,.88)}
.codex-dark{background:#061f38;color:white}
.codex-dark h2,.codex-dark h3{color:white}
.codex-dark p{color:rgba(255,255,255,.86)}
.codex-home-events{background:#f7fbff;padding:5rem 5vw}
.codex-home-events-inner{max-width:1180px;margin:0 auto}
.codex-home-events-head{display:flex;align-items:flex-end;justify-content:space-between;gap:1.25rem;margin-bottom:1.25rem}
.codex-home-events h2{font-size:clamp(2rem,4vw,3.35rem);line-height:1.05;margin:0;color:#071b2d}
.codex-home-events-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.25rem}
@media(max-width:900px){.codex-hero{min-height:560px}.codex-grid,.codex-grid.two,.codex-home-events-grid{grid-template-columns:1fr}.codex-section,.codex-home-events{padding:3.25rem 1.25rem}.codex-section-head,.codex-home-events-head{align-items:flex-start;flex-direction:column}.codex-hero-inner{padding:7rem 1.25rem 3.5rem}}
</style>`;
}

function page(title, description, eyebrow, lead, heroImage, bodyHtml, ctaHtml = "") {
  const { head, footer } = shellFrom("dist/clubs/index.html", title, description);
  return `${head}<main class="main-wrapper max-width-full codex-page">
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
</main>${footer}`;
}

function actions(items) {
  return `<div class="codex-actions">${items
    .map((item) => {
      if (item.disabled) return `<span class="codex-button is-disabled">${item.label}</span>`;
      const klass = item.secondary ? "codex-button secondary" : "codex-button";
      return `<a class="${klass}" href="${item.href}">${item.label}</a>`;
    })
    .join("")}</div>`;
}

function card(item) {
  const meta = item.meta?.length
    ? `<div class="codex-meta">${item.meta.map((m) => `<span class="codex-pill ${m.kind || ""}">${m.text}</span>`).join("")}</div>`
    : "";
  const image = item.cardHref
    ? `<a class="codex-image-link" href="${item.cardHref}"><img src="${item.image}" alt=""/></a>`
    : `<img src="${item.image}" alt=""/>`;
  const title = item.cardHref
    ? `<a class="codex-title-link" href="${item.cardHref}">${item.title}</a>`
    : item.title;
  return `<article class="codex-card">
  ${image}
  <div class="codex-card-body">
    <h3>${title}</h3>
    <p>${item.description}</p>
    ${meta}
    ${actions(item.actions)}
  </div>
</article>`;
}

function buildLeaguesPage() {
  const leagues = [
    {
      title: "Men's & Women's Doubles Summer Flex League",
      image: img.league,
      cardHref: organizerHref,
      description:
        "Partner flex league for men's and women's doubles teams. Teams coordinate weekly matches inside the league window, report results, and compete toward final standings.",
      meta: [{ text: "Summer flex" }, { text: "Registration link pending", kind: "muted" }],
      actions: [
        { label: "Registration link pending", disabled: true },
        { label: "Email League Organizer", href: organizerHref, secondary: true },
      ],
    },
    {
      title: "Co-Ed Doubles Summer Drop-In League",
      image: img.social,
      cardHref: calendarHref,
      description:
        "Weekly co-ed doubles play for players who want organized competitive reps without committing to a full flex-league schedule.",
      meta: [{ text: "Weekly sign-ups" }, { text: "Co-ed doubles" }],
      actions: [
        { label: "Weekly Sign-Ups", href: calendarHref },
        { label: "Email League Organizer", href: organizerHref, secondary: true },
      ],
    },
    {
      title: "Monday Night Ladies League",
      image: img.cta,
      cardHref: organizerHref,
      description:
        "Ladies night league with proposed 2.5-3.0 and 3.0-3.5 sessions so players get level-appropriate matches in one consistent evening block.",
      meta: [{ text: "Currently Full", kind: "muted" }, { text: "Next session target: July 8th", kind: "gold" }],
      actions: [
        { label: "Currently Full", disabled: true },
        { label: "Email League Organizer", href: organizerHref, secondary: true },
      ],
    },
    {
      title: "Thursday Night Men's League",
      image: img.hero,
      cardHref: organizerHref,
      description:
        "Men's evening league with proposed 2.5-3.0 and 3.0-3.5 sessions for players who want structured weekly match play.",
      meta: [{ text: "Currently Full", kind: "muted" }, { text: "Next session target: July 11th", kind: "gold" }],
      actions: [
        { label: "Currently Full", disabled: true },
        { label: "Email League Organizer", href: organizerHref, secondary: true },
      ],
    },
  ];

  const tournaments = [
    {
      title: "3.0-3.5 MLP Team Event",
      image: img.team,
      description:
        "Middleton team-format event for 3.0-3.5 players. The date is targeted for Saturday July 18th, pending the Thursday men's league schedule.",
      meta: [{ text: "Middleton" }, { text: "Saturday July 18th target", kind: "gold" }],
      actions: [{ label: "Registration opens June 25th", disabled: true }],
    },
    {
      title: "2.5-3.0 MLP Team Event",
      image: img.teamAlt,
      description:
        "Middleton team-format event for 2.5-3.0 players. The date is targeted for Saturday July 25th, pending final calendar confirmation.",
      meta: [{ text: "Middleton" }, { text: "Saturday July 25th target", kind: "gold" }],
      actions: [{ label: "Registration opens July 2nd", disabled: true }],
    },
    {
      title: "3.5-4.0 MLP Team Event",
      image: img.league,
      description:
        "Rye team-format event for 3.5-4.0 players. The date is targeted for Sunday August 2nd, pending final calendar confirmation.",
      meta: [{ text: "Rye" }, { text: "Sunday August 2nd target", kind: "gold" }],
      actions: [{ label: "Registration opens July 9th", disabled: true }],
    },
  ];

  const body = `<section class="codex-section">
  <div class="codex-container">
    <div class="codex-section-head">
      <div>
        <div class="codex-kicker">Current Leagues</div>
        <h2>Current Leagues</h2>
      </div>
      <a class="codex-button secondary" href="#team-tournaments">Skip to Team Tournaments</a>
    </div>
    <div class="codex-grid two">${leagues.map(card).join("")}</div>
  </div>
</section>
<section id="team-tournaments" class="codex-section is-tight">
  <div class="codex-container">
    <div class="codex-section-head">
      <div>
        <div class="codex-kicker">Team Tournaments</div>
        <h2>Upcoming Team Tournaments at NEPC</h2>
      </div>
    </div>
    <div class="codex-grid">${tournaments.map(card).join("")}</div>
  </div>
</section>
<section class="codex-section codex-dark">
  <div class="codex-container">
    <div class="codex-grid two">
      <div>
        <div class="codex-kicker">Need Help Choosing?</div>
        <h2>Ryann can route players to the right format.</h2>
        <p>Players can email the league organizer if they are choosing between flex league, drop-in league, or team tournament formats.</p>
      </div>
      <div>${actions([
        { label: "Email League Organizer", href: organizerHref },
        { label: "View Club Calendar", href: calendarHref, secondary: true },
      ])}</div>
    </div>
  </div>
</section>`;

  write(
    "dist/leagues/index.html",
    page(
      "Join a Competitive League or Team Tournament",
      "Find current leagues and upcoming team tournaments at New England Pickleball Club.",
      "Competitive Play",
      "Find current NEPC leagues, weekly sign-up formats, and upcoming team tournaments for players who want organized match play.",
      img.hero,
      body,
      actions([
        { label: "Current Leagues", href: "#current-leagues" },
        { label: "Team Tournaments", href: "#team-tournaments", secondary: true },
      ]).replace('href="#current-leagues"', 'href="#current-leagues"'),
    ).replace('<section class="codex-section">', '<section id="current-leagues" class="codex-section">'),
  );
}

function eventCard(item, index) {
  const image = [img.social, img.cta, img.court, img.team][index % 4];
  const href = item.href || calendarHref;
  const label = item.href ? "Register on CourtReserve" : "View Calendar";
  return `<article class="codex-card">
  <a class="codex-image-link" href="${href}"><img src="${image}" alt=""/></a>
  <div class="codex-card-body">
    <h3><a class="codex-title-link" href="${href}">${item.title}</a></h3>
    <p>${item.description}</p>
    <div class="codex-meta"><span class="codex-pill">${item.location}</span><span class="codex-pill muted">Calendar registration</span></div>
    ${actions([{ label, href }])}
  </div>
</article>`;
}

function buildSocialEventsPage() {
  const events = [
    {
      title: "World Cup Party",
      location: "Rye",
      href: ryeEventsHref,
      description: "A watch-party social at Rye with pickleball, food-and-drink energy, and a reason for members to gather off the normal play schedule.",
    },
    {
      title: "Father's Day",
      location: "Both clubs",
      description: "A family-friendly club social built around Father's Day play, rotating games, and a relaxed community feel.",
    },
    {
      title: "World Cup Party",
      location: "Middleton",
      href: middletonEventsHref,
      description: "The Middleton version of the World Cup social, giving members another location-specific party night tied to the same event theme.",
    },
    {
      title: "4th of July Socials",
      location: "Both clubs",
      description: "Holiday-themed social play for members and guests who want structured games around the July 4th week.",
    },
    {
      title: "Member Appreciation Day",
      location: "Rye",
      href: ryeEventsHref,
      description: "A Rye community day that celebrates members, gives newer players a reason to come in, and keeps the club feeling active.",
    },
    {
      title: "Member Appreciation Day",
      location: "Middleton",
      href: middletonEventsHref,
      description: "A Middleton community day focused on member connection, social play, and a stronger club rhythm outside normal reservations.",
    },
    {
      title: "80s Night",
      location: "Middleton",
      href: middletonEventsHref,
      description: "A themed social night at Middleton with music, rotating play, and a different feel from a standard open-play block.",
    },
    {
      title: "80s Night",
      location: "Rye",
      href: ryeEventsHref,
      description: "Rye's version of the 80s Night social, keeping the theme visible for members who missed the Middleton date.",
    },
    {
      title: "Glow in the Dark Pickleball",
      location: "Monthly",
      description: "A monthly lights-down pickleball event with glow gear, music, rotating play, and a special-event feel.",
    },
    {
      title: "Latin Night",
      location: "Middleton",
      href: middletonEventsHref,
      description: "A music-forward Middleton social night with pickleball, community energy, and a clear reason to invite friends.",
    },
    {
      title: "Latin Night",
      location: "Rye",
      href: ryeEventsHref,
      description: "Rye's Latin Night social, built to make the club calendar feel active, varied, and community-led.",
    },
  ];

  const body = `<section class="codex-section">
  <div class="codex-container">
    <div class="codex-section-head">
      <div>
        <div class="codex-kicker">Upcoming Social Events</div>
        <h2>Club events worth planning around</h2>
      </div>
      <a class="codex-button secondary" href="${calendarHref}">View Calendar</a>
    </div>
    <div class="codex-grid">${events.map(eventCard).join("")}</div>
  </div>
</section>
<section class="codex-section codex-dark">
  <div class="codex-container">
    <div class="codex-grid two">
      <a class="codex-link-card" href="/glow-in-the-dark/"><img src="${img.social}" alt=""/><div><h3>Glow in the Dark Pickleball</h3><p>Monthly glow pickleball now has its own website space.</p></div></a>
      <a class="codex-link-card" href="/private-events/"><img src="${img.court}" alt=""/><div><h3>Parties & Corporate Events</h3><p>Private parties, corporate outings, and custom group events live here.</p></div></a>
    </div>
  </div>
</section>
<section class="codex-section">
  <div class="codex-container">
    <div class="codex-card"><div class="codex-card-body">
      <h3>Past events stay visible after they happen.</h3>
      <p>Completed events should move into a muted state instead of disappearing, so new members can see what the NEPC community calendar feels like across the year.</p>
    </div></div>
  </div>
</section>`;

  write(
    "dist/social-events/index.html",
    page(
      "Social Events at NEPC",
      "Find upcoming social events at New England Pickleball Club.",
      "Social Events",
      "A single place for NEPC parties, socials, theme nights, member appreciation days, and monthly glow in the dark pickleball.",
      img.social,
      body,
      actions([
        { label: "View Calendar", href: calendarHref },
        { label: "Glow in the Dark", href: "/glow-in-the-dark/", secondary: true },
      ]),
    ),
  );
}

function updateHomePage() {
  const file = join(dist, "index.html");
  let html = readFileSync(file, "utf8");
  html = html
    .replace("Signup for social play</h3>", "Social events</h3>")
    .replace(
      "Our skill-based events are a great way to meet others while playing in a fun, no-pressure environment.",
      "Theme nights, member socials, glow pickleball, and club events live in one easy place.",
    )
    .replace(
      /(<h3 class="heading-style-h5">Social events<\/h3>[\s\S]*?<div class="button-group"><a href=")\/calendar\/(")/,
      "$1/social-events/$2",
    )
    .replace(/(<h3 class="heading-style-h5">Social events<\/h3>[\s\S]*?<div>)(Sign Up)(<\/div><\/a>)/, "$1Events$3")
    .replace("Join a competitive league</h3>", "Join a competitive league or team tournament</h3>")
    .replace(
      "If you love the thrill of competition, our weekly leagues give you a shot at climbing the leaderboard.",
      "Weekly leagues and team tournaments give competitive players a clear place to find the right format.",
    );

  if (!html.includes("codex-home-events")) {
    const homeEvents = `<section class="codex-home-events">
<style>
.codex-home-events{background:#f7fbff;padding:5rem 5vw}
.codex-home-events-inner{max-width:1180px;margin:0 auto}
.codex-home-events-head{display:flex;align-items:flex-end;justify-content:space-between;gap:1.25rem;margin-bottom:1.25rem}
.codex-home-events h2{font-size:clamp(2rem,4vw,3.35rem);line-height:1.05;margin:0;color:#071b2d}
.codex-home-events p{color:#425466;line-height:1.55}
.codex-kicker{color:#0d5497;font-weight:800;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.5rem}
.codex-home-events-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1.25rem}
.codex-link-card{display:flex;flex-direction:column;justify-content:flex-end;min-height:315px;padding:1.25rem;border-radius:16px;overflow:hidden;position:relative;color:white;text-decoration:none;background:#0d5497}
.codex-link-card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.codex-link-card:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(3,22,40,.05),rgba(3,22,40,.8))}
.codex-link-card div{position:relative;z-index:1}
.codex-link-card h3{color:white;margin:0 0 .35rem;font-size:1.6rem}
.codex-link-card p{margin:0;color:rgba(255,255,255,.88)}
.codex-button{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:.85rem 1.15rem;border:0;border-radius:999px;background:#4bb8ff;color:#061f38;text-decoration:none;font-weight:800;line-height:1.1}
@media(max-width:900px){.codex-home-events{padding:3.25rem 1.25rem}.codex-home-events-grid{grid-template-columns:1fr}.codex-home-events-head{align-items:flex-start;flex-direction:column}}
</style>
<div class="codex-home-events-inner">
  <div class="codex-home-events-head">
    <div><div class="codex-kicker">Events & Parties</div><h2>Social events, parties, and corporate outings.</h2></div>
    <a class="codex-button" href="/social-events/">View Social Events</a>
  </div>
  <div class="codex-home-events-grid">
    <a class="codex-link-card" href="/social-events/"><img src="${img.social}" alt=""/><div><h3>Social Events</h3><p>Theme nights, member socials, World Cup parties, Latin Night, 80s Night, and monthly glow pickleball.</p></div></a>
    <a class="codex-link-card" href="/private-events/"><img src="${img.court}" alt=""/><div><h3>Parties & Corporate Events</h3><p>Private parties, corporate outings, team-building events, and custom group pickleball.</p></div></a>
  </div>
</div>
</section>`;
    html = html.replace('<section class="section_club-news">', `${homeEvents}<section class="section_club-news">`);
  }

  if (!html.includes(".codex-kicker{color:#0d5497") && html.includes(".codex-home-events p{color:#425466")) {
    html = html.replace(
      ".codex-home-events p{color:#425466;line-height:1.55}",
      ".codex-home-events p{color:#425466;line-height:1.55}\n.codex-kicker{color:#0d5497;font-weight:800;text-transform:uppercase;letter-spacing:.08em;margin-bottom:.5rem}",
    );
  }

  writeFileSync(file, html);
}

function routeEventsNav() {
  for (const file of htmlFiles()) {
    let html = readFileSync(file, "utf8");
    html = html.replace(/href="\/private-events\/"([^>]*>EVENTS<\/a>)/g, 'href="/social-events/"$1');
    writeFileSync(file, html);
  }
}

function buildWebflowCopy() {
  write(
    "webflow-update-package/leagues-social-events-update.md",
    `# Leagues, Team Tournaments, and Social Events Update

## Pages

- /leagues/ becomes "Join a Competitive League or Team Tournament".
- /social-events/ is the public social-events index.
- /glow-in-the-dark/ remains the detailed glow-event page.
- /private-events/ and /corporate-events/ remain the party and corporate event category pages.

## Homepage

- Change the card title "Join a competitive league" to "Join a competitive league or team tournament".
- Change the social play card to "Social events" and link it to /social-events/.
- Add a homepage band with two cards: Social Events and Parties & Corporate Events.

## Leagues Page

Current Leagues:
- Men's & Women's Doubles Summer Flex League
- Co-Ed Doubles Summer Drop-In League
- Monday Night Ladies League
- Thursday Night Men's League

Upcoming Team Tournaments at NEPC:
- 3.0-3.5 MLP Team Event at Middleton, Saturday July 18th target, registration opens June 25th.
- 2.5-3.0 MLP Team Event at Middleton, Saturday July 25th target, registration opens July 2nd.
- 3.5-4.0 MLP Team Event at Rye, Sunday August 2nd target, registration opens July 9th.

## Social Events Page

List these events with calendar registration buttons:
- World Cup Party, Rye
- Father's Day
- World Cup Party, Middleton
- 4th of July Socials
- Member Appreciation Day, Rye
- Member Appreciation Day, Middleton
- 80s Night, Middleton
- 80s Night, Rye
- Glow in the Dark Pickleball
- Latin Night, Middleton
- Latin Night, Rye

Completed events should stay visible in a muted state instead of being removed.
`,
  );
}

buildLeaguesPage();
buildSocialEventsPage();
updateHomePage();
routeEventsNav();
buildWebflowCopy();

console.log("Applied NEPC leagues, team tournaments, and social events update.");
