import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const topNav = [
  ["CLUBS", "clubs"],
  ["CALENDAR", "calendar"],
  ["LEAGUES", "leagues"],
  ["COACHING", "coaching"],
  ["MEMBERSHIP", "membership"],
  ["CONTACT", "contact"],
  ["GIFT CARDS", "https://shop.newenglandpickleball.com/products/nepc-gift-card?utm_source=copyToPasteBoard&amp;utm_medium=product-links&amp;utm_content=web"],
];

const footerNav = [
  ["CLUBS", "clubs"],
  ["CALENDAR", "calendar"],
  ["LEAGUES", "leagues"],
  ["COACHING", "coaching"],
  ["MEMBERSHIP", "membership"],
  ["CONTACT", "contact"],
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

function currentText(links) {
  const current = links.match(/<a\b[^>]*(?:aria-current="page"|w--current)[^>]*>(CLUBS|CALENDAR|LEAGUES|COACHING|MEMBERSHIP|CONTACT|GIFT CARDS)<\/a>/);
  return current?.[1] || "";
}

function navAnchor([text, slugOrUrl], basePath, current) {
  const href = hrefFor(slugOrUrl, basePath);
  const currentAttrs = text === current ? ' aria-current="page" class="navbar14_link w-nav-link w--current"' : ' class="navbar14_link w-nav-link"';
  return `<a href="${href}"${currentAttrs}>${text}</a>`;
}

function footerAnchor([text, slugOrUrl], basePath, current) {
  const href = hrefFor(slugOrUrl, basePath);
  const currentAttrs = text === current ? ' aria-current="page" class="footer4_link w--current"' : ' class="footer4_link"';
  return `<a href="${href}"${currentAttrs}>${text}</a>`;
}

export function normalizeNavigationHtml(html) {
  const basePath = basePathFor(html);
  return html
    .replace(/<div class="navbar14_menu-links">([\s\S]*?)<\/div><div id="w-node/g, (_match, links) => {
      const current = currentText(links);
      return `<div class="navbar14_menu-links">${topNav.map((item) => navAnchor(item, basePath, current)).join("")}</div><div id="w-node`;
    })
    .replace(/<div class="w-layout-grid footer4_link-list">([\s\S]*?)<\/div>/g, (_match, links) => {
      const current = currentText(links);
      return `<div class="w-layout-grid footer4_link-list">${footerNav.map((item) => footerAnchor(item, basePath, current)).join("")}</div>`;
    });
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
