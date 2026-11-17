import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const giftCardUrl = "https://shop.newenglandpickleball.com/products/nepc-gift-card?utm_source=copyToPasteBoard&amp;utm_medium=product-links&amp;utm_content=web";
const topNav = [
  ["Our Clubs", "clubs"],
  ["Find Your Play", "calendar"],
  ["Lessons &amp; Coaching", "coaching"],
  ["Memberships", "membership"],
  ["Club Experiences", "community-events"],
  ["Contact", "contact"],
];
const footerNav = [
  ...topNav,
  ["New to Pickleball", "new-to-pickle-ball"],
  ["Dave’s Philosophy", "founder-story"],
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
  if (canonical && new URL(canonical[1]).pathname === '/gift-cards/') {
    updated = updated.replace(/<aside class="nepc-gift-promo"[\s\S]*?<\/aside>/g, '');
  } else if (updated.includes('footer4_component') && !updated.includes('nepc-gift-promo')) {
    const promo = `<aside class="nepc-gift-promo" aria-label="NEPC gift cards"><div><span>Give a little more play.</span><p>A gift for the pickleball player in your life.</p></div><a href="${giftCardUrl}">Shop Gift Cards <span aria-hidden="true">↗</span></a></aside>`;
    updated = updated.replace(/(<footer\b[^>]*>)/, '$1' + promo);
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
