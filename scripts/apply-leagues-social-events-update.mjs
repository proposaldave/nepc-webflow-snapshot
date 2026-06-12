import { mkdirSync, readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const pdfPath =
  "/assets/cdn.prod.website-files.com/67d7a7154f2e71cc1081b1bf/68e3fe82db64a2ba70c5b246_NEPC Corporate Events & Private Parties.pdf";
const img = {
  hero:
    "/assets/cdn.prod.website-files.com/67d8ef9f47150547ee5f7682/68372bd5ba56f17b92bda07b_Hero_image_2.webp",
  league:
    "/assets/cdn.prod.website-files.com/67d8ef9f47150547ee5f7682/68372bd5ac1a9c51fa951136_Hero_image_4.webp",
  social:
    "/assets/cdn.prod.website-files.com/67d7a7154f2e71cc1081b1bf/6818c7bfeff9dcdb05525cef_Sign up for a social play.webp",
  court:
    "/assets/cdn.prod.website-files.com/67d7a7154f2e71cc1081b1bf/6818c8a81376935f7beb1264_Book a private court.webp",
  cta:
    "/assets/cdn.prod.website-files.com/67d7a7154f2e71cc1081b1bf/67d7e8b027ec9b12a6fc9b65_NEPC_Home CTA BG 1.webp",
  team:
    "/assets/cdn.prod.website-files.com/67d8ef9f47150547ee5f7682/68372bd5ac1a9c51fa951136_Hero_image_4.webp",
  teamAlt:
    "/assets/cdn.prod.website-files.com/67d8ef9f47150547ee5f7682/68372bd5ba56f17b92bda07b_Hero_image_2.webp",
};

const calendarHref = "/calendar/";
const middletonEventsHref = "https://app.courtreserve.com/Online/Events/List/13164";
const ryeEventsHref = "https://app.courtreserve.com/Online/Events/List/7432";
const organizerHref = "mailto:nepcleague@gmail.com";
const summerFlexMiddletonHref = "https://form.typeform.com/to/FaBROOxu";
const summerFlexRyeHref = "https://form.typeform.com/to/lDSLhbf8";

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
@media(max-width:900px){.codex-hero{min-height:560px}.codex-grid,.codex-grid.two{grid-template-columns:1fr}.codex-section{padding:3.25rem 1.25rem}.codex-section-head{align-items:flex-start;flex-direction:column}.codex-hero-inner{padding:7rem 1.25rem 3.5rem}}
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
      cardHref: summerFlexMiddletonHref,
      description:
        "Partner flex league for men's and women's doubles teams. Teams coordinate weekly matches inside the league window, report results, and compete toward final standings.",
      meta: [{ text: "Summer flex" }, { text: "Middleton + Rye registration" }],
      actions: [
        { label: "Middleton Registration", href: summerFlexMiddletonHref },
        { label: "Rye Registration", href: summerFlexRyeHref },
        { label: "Email League Organizer", href: organizerHref, secondary: true },
      ],
    },
    {
      title: "Co-Ed Doubles Summer Drop-In League",
      image: img.team,
      cardHref: calendarHref,
      description:
        "No commitment, weekly co-ed doubles play for players who want organized competitive matches with a partner of their choice, without the long-term commitment. You may sign up for multiple weeks or just one week at a time and may change partners week to week if you'd like. Visit our calendar to register for your desired league based on the following days and times:<br/><br/>Wednesdays: 3.5-4.0: 10:00am-12:00pm<br/>Wednesdays: 2.5-3.0: 12:00pm-2:00pm<br/>Thursdays: 3.0-3.5: 12:00pm-2:00pm",
      meta: [{ text: "Weekly sign-ups" }, { text: "Co-ed doubles" }],
      actions: [
        { label: "Weekly Sign-Ups", href: calendarHref },
        { label: "Email League Organizer", href: organizerHref, secondary: true },
      ],
    },
  ];

  const body = `<section class="codex-section">
  <div class="codex-container">
    <div class="codex-section-head">
      <div>
        <div class="codex-kicker">Current Leagues</div>
        <h2>Current Leagues</h2>
      </div>
    </div>
    <div class="codex-grid two">${leagues.map(card).join("")}</div>
  </div>
</section>
<section class="codex-section codex-dark">
  <div class="codex-container">
    <div class="codex-grid two">
      <div>
        <div class="codex-kicker">Need help choosing?</div>
        <h2>Contact our league organizer at nepcleague@gmail.com for assistance!</h2>
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
      "Join a Competitive League",
      "Find current leagues at New England Pickleball Club.",
      "Competitive Play",
      "Find current NEPC leagues and weekly sign-up formats for players who want organized match play.",
      img.hero,
      body,
      actions([
        { label: "Current Leagues", href: "#current-leagues" },
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

function updateHomePage() {
  const file = join(dist, "index.html");
  let html = readFileSync(file, "utf8");
  html = html
    .replace(/<section class="codex-home-events">[\s\S]*?<\/section><section class="section_club-news">/, '<section class="section_club-news">')
    .replace(/<section class="section_club-news">[\s\S]*?<\/section><section class="section_cta42">/, '<section class="section_cta42">')
    .replace("Signup for social play</h3>", "Social events</h3>")
    .replace(
      "Our skill-based events are a great way to meet others while playing in a fun, no-pressure environment.",
      "Theme nights, member socials, glow pickleball, and club events live in one easy place.",
    )
    .replace(
      /(<h3 class="heading-style-h5">Social events<\/h3>[\s\S]*?<div class="button-group"><a href=")\/social-events\/(")/,
      "$1calendar/$2",
    )
    .replace(/(<h3 class="heading-style-h5">Social events<\/h3>[\s\S]*?<div>)(Sign Up)(<\/div><\/a>)/, "$1Events$3")
    .replace(`Join a competitive league or team ${"tournament"}</h3>`, "Join a competitive league</h3>")
    .replace(
      `Weekly leagues and team ${"tournaments"} give competitive players a clear place to find the right format.`,
      "Weekly leagues give competitive players a clear place to find the right format.",
    )
    .replaceAll(`href="/leagues/${"#team-" + "tournaments"}"`, 'href="/leagues/"');

  writeFileSync(file, html);
}

function routeEventsNav() {
  for (const file of htmlFiles()) {
    let html = readFileSync(file, "utf8");
    html = html
      .replace(/<a\b[^>]*href="\/(?:social-events|private-events)\/"[^>]*>EVENTS<\/a>/g, "")
      .replace(/href="\/social-events\/"/g, 'href="/calendar/"');
    writeFileSync(file, html);
  }
}

function buildWebflowCopy() {
  write(
    "webflow-update-package/leagues-social-events-update.md",
    `# Leagues and Social Events Update

## Pages

- /leagues/ becomes "Join a Competitive League".
- /glow-in-the-dark/ remains the detailed glow-event page.
- /private-events/ and /corporate-events/ remain the party and corporate event category pages.

## Homepage

- Keep the card title "Join a competitive league".
- Keep the social play card linked to /calendar/.

## Leagues Page

Current Leagues:
- Men's & Women's Doubles Summer Flex League
- Co-Ed Doubles Summer Drop-In League
`,
  );
}

buildLeaguesPage();
updateHomePage();
routeEventsNav();
buildWebflowCopy();

console.log("Applied NEPC leagues and social events update.");
