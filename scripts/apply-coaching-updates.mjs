import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const coachingPath = join(root, "dist", "coaching", "index.html");

const oldHero = "/assets/cdn.prod.website-files.com/67d7a7154f2e71cc1081b1bf/6818c66cc42d1248a690bdc9_Elevate your gameplay";
const newHero = "/assets/cdn.prod.website-files.com/67d7a7154f2e71cc1081b1bf/6818c7f2f3d1c756d57d60b7_Take a class or lesson";

function replaceAllHeroVariants(html) {
  return html
    .replaceAll(`${oldHero}.webp`, `${newHero}.webp`)
    .replaceAll(`${oldHero}-p-500.webp`, `${newHero}-p-500.webp`)
    .replaceAll(`${oldHero}-p-800.webp`, `${newHero}-p-800.webp`)
    .replaceAll(`${oldHero}-p-1080.webp`, `${newHero}-p-1080.webp`)
    .replaceAll(`${oldHero}-p-1600.webp`, `${newHero}-p-1080.webp`)
    .replaceAll(`${oldHero}-p-2000.webp`, `${newHero}-p-1080.webp`);
}

function removeCoachCard(html, coachName) {
  const cardStart = '<div style="background-color:#f9f9f9" role="listitem" class="team2_item w-dyn-item">';
  const nameIndex = html.indexOf(coachName);
  if (nameIndex < 0) return html;
  const start = html.lastIndexOf(cardStart, nameIndex);
  const end = html.indexOf(cardStart, nameIndex + coachName.length);
  if (start < 0 || end < 0) {
    throw new Error(`Could not safely remove ${coachName} card`);
  }
  return html.slice(0, start) + html.slice(end);
}

function removeTipCardsForCoach(html, coachName) {
  const itemStart = '<div role="listitem" class="event-header5_item w-dyn-item">';
  let next = html.indexOf(coachName);
  while (next >= 0) {
    const start = html.lastIndexOf(itemStart, next);
    const end = html.indexOf(itemStart, next + coachName.length);
    if (start < 0 || end < 0) break;
    html = html.slice(0, start) + html.slice(end);
    next = html.indexOf(coachName);
  }
  return html;
}

function retitleCoach(html, coachName, newTitle) {
  const nameIndex = html.indexOf(coachName);
  if (nameIndex < 0) throw new Error(`Could not find ${coachName}`);
  const roleStart = html.indexOf('<div style="color:#0d5497">', nameIndex);
  const roleEnd = html.indexOf("</div>", roleStart);
  if (roleStart < 0 || roleEnd < 0) throw new Error(`Could not find title for ${coachName}`);
  return html.slice(0, roleStart) + `<div style="color:#0d5497">${newTitle}` + html.slice(roleEnd);
}

function patchCoachingNav(html) {
  html = html.replace(
    '<a href="/calendar/" class="navbar14_link w-nav-link">CALENDAR</a><a href="/coaching/" aria-current="page" class="navbar14_link w-nav-link w--current">COACHING</a>',
    '<a href="/calendar/" class="navbar14_link w-nav-link">CALENDAR</a><a href="/leagues/" class="navbar14_link w-nav-link">LEAGUES</a><a href="/private-events/" class="navbar14_link w-nav-link">EVENTS</a><a href="/coaching/" aria-current="page" class="navbar14_link w-nav-link w--current">COACHING</a>',
  );
  html = html.replace(
    '<a href="/calendar/" class="footer4_link">CALENDAR</a><a href="/coaching/" aria-current="page" class="footer4_link w--current">COACHING</a>',
    '<a href="/calendar/" class="footer4_link">CALENDAR</a><a href="/leagues/" class="footer4_link">LEAGUES</a><a href="/private-events/" class="footer4_link">EVENTS</a><a href="/coaching/" aria-current="page" class="footer4_link w--current">COACHING</a>',
  );
  return html;
}

let html = readFileSync(coachingPath, "utf8");
html = replaceAllHeroVariants(html);
html = html.replaceAll('class="header28_lightbox w-inline-block w-lightbox"', 'class="header28_lightbox w-inline-block"');
html = html.replaceAll('<div class="w-layout-vflex lightbox_play-icon_wrap">', '<div class="w-layout-vflex lightbox_play-icon_wrap" style="display:none">');
html = removeCoachCard(html, "Cobi Moore");
html = removeTipCardsForCoach(html, "Cobi Moore");
html = retitleCoach(html, "Tina Lech", "Teaching Pro / Drilling Pro");
html = retitleCoach(html, "Ben Herrick", "Teaching Pro / Drilling Pro");
html = retitleCoach(html, "Jared Wright", "Teaching Pro / Drilling Pro");
html = patchCoachingNav(html);

writeFileSync(coachingPath, html);
console.log("Coaching page updates applied.");
