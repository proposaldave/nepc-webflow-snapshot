import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const topNav = [
  ["Our Clubs", "clubs"],
  ["Find Your Play", "calendar"],
  ["Lessons &amp; Coaching", "coaching"],
  ["Membership", "membership"],
  ["Club Experiences", "community-events"],
  ["Contact", "contact"],
];
const footerNav = [
  ...topNav,
  ["New to Pickleball", "new-to-pickle-ball"],
  ["Long Point Pickleball", "founder-story"],
  ["Leagues", "leagues"],
  ["Gift Cards", "gift-cards"],
];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function basePathFor(html) {
  return html.includes('href="/nepc-webflow-snapshot/') ? "/nepc-webflow-snapshot" : "";
}

function hrefFor(slugOrUrl, basePath) {
  if (slugOrUrl.startsWith("https://")) return slugOrUrl;
  return `${basePath}/${slugOrUrl}/`;
}


function navAnchor([text, slugOrUrl], basePath, current) {
  const href = hrefFor(slugOrUrl, basePath);
  const currentAttrs = href === current ? ' aria-current="page" class="navbar14_link w-nav-link w--current"' : ' class="navbar14_link w-nav-link"';
  return `<a href="${href}"${currentAttrs}>${text}</a>`;
}

function footerAnchor([text, slugOrUrl], basePath, current) {
  const href = hrefFor(slugOrUrl, basePath);
  const currentAttrs = href === current ? ' aria-current="page" class="footer4_link w--current"' : ' class="footer4_link"';
  return `<a href="${href}"${currentAttrs}>${text}</a>`;
}

export function normalizeNavigationHtml(html) {
  const basePath = basePathFor(html);
  const canonical = html.match(/<link[^>]*rel="canonical"[^>]*href="([^"]+)"/);
  let current = '';
  if (canonical) current = basePath + new URL(canonical[1]).pathname;
  let updated = html
    .replace(/<div class="navbar14_menu-links">[\s\S]*?<\/div><div id="w-node/g, () =>
      `<div class="navbar14_menu-links">${topNav.map(item => navAnchor(item, basePath, current)).join('')}</div><div id="w-node`)
    .replace(/(<div\b[^>]*class="navbar14_button-wrapper"[^>]*>)[\s\S]*?<\/div>/g, (_match, opening) =>
      `${opening}<a href="${basePath}/book-a-court/" class="button is-alternate is-small w-button">Book a Court</a><a href="${basePath}/new-to-pickle-ball/" class="button is-secondary is-alternate is-small w-button">New to Pickleball?</a></div>`)
    .replace(/<div class="w-layout-grid footer4_link-list">[\s\S]*?<\/div>/g, () =>
      `<div class="w-layout-grid footer4_link-list">${footerNav.map(item => footerAnchor(item, basePath, current)).join('')}</div>`);
  // Keep the full promotion on the homepage only. Inner pages retain the
  // discreet Gift Cards footer link without interrupting their main task.
  if (!canonical || new URL(canonical[1]).pathname !== '/') {
    updated = updated.replace(/<aside class="nepc-gift-promo"[\s\S]*?<\/aside>/g, '');
  } else if (updated.includes('footer4_component')) {
    const logo = `${basePath}/assets/cdn.prod.website-files.com/67d7a7154f2e71cc1081b1bf/67d7cef66ded173bdc7deee3_NEPC Logo.svg`;
    const promo = `<aside class="nepc-gift-promo" aria-label="NEPC gift cards"><div class="nepc-gift-promo-visual" aria-hidden="true"><img src="${logo}" alt="" loading="lazy"><span>Gift Card</span></div><div class="nepc-gift-promo-copy"><p class="nepc-gift-promo-label">NEPC Gift Cards</p><h2>Good games make great gifts.</h2><p>Surprise your favorite pickleball player with an NEPC gift card.</p></div><a href="${basePath}/gift-cards/">Shop Gift Cards <span aria-hidden="true">→</span></a></aside>`;
    if (updated.includes('nepc-gift-promo')) updated = updated.replace(/<aside class="nepc-gift-promo"[\s\S]*?<\/aside>/g, promo);
    else updated = updated.replace(/(<footer\b[^>]*>)/, '$1' + promo);
  }
  return updated;
}

export function normalizeNavigationInTree(dir) {
  for (const file of walk(dir).filter((path) => path.endsWith(".html"))) {
    const html = readFileSync(file, "utf8");
    const normalized = normalizeNavigationHtml(html);
    if (normalized !== html) writeFileSync(file, normalized);
  }
}

if (process.argv[1] && basename(process.argv[1]) === "normalize-navigation.mjs") {
  normalizeNavigationInTree(join(root, process.argv[2] || "dist"));
}
