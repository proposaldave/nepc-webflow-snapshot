import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const copy = JSON.parse(readFileSync(join(root, 'scripts/seo-data.json'), 'utf8'));
const structured = JSON.parse(readFileSync(join(root, 'scripts/seo-structured-data.json'), 'utf8'));
const seenTitles = new Set(), seenDescriptions = new Set();
const decode = s => s.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>');
const text = s => decode(s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
const protectedLinks = s => [...s.matchAll(/(?:href|src)="([^"]*(?:courtreserve\.com|shop\.newenglandpickleball\.com)[^"]*)"/gi)].map(m => m[1]).sort();
const sitemap = readFileSync(join(root, 'dist/sitemap.xml'), 'utf8');
for (const [route, values] of Object.entries(copy)) {
  const relative = `dist${route}index.html`;
  const html = readFileSync(join(root, relative), 'utf8');
  assert.equal((html.match(/<h1\b/gi) || []).length, 1, `${route}: H1 count`);
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1, `${route}: canonical count`);
  assert(html.includes(`href="https://newenglandpickleball.com${route}"`), `${route}: canonical host`);
  const title = decode(html.match(/<title>(.*?)<\/title>/s)[1]);
  assert.equal(title, values.title);
  assert(!seenTitles.has(title), `${route}: duplicate title`); seenTitles.add(title);
  const description = decode(html.match(/<meta name="description" content="([^"]*)"/)[1]);
  assert.equal(description, values.description);
  assert(!seenDescriptions.has(description), `${route}: duplicate description`); seenDescriptions.add(description);
  assert(sitemap.includes(`<loc>https://newenglandpickleball.com${route}</loc>`));
  assert(html.includes('tel:+19783073820') && html.includes('tel:+16039451139'), `${route}: footer phone links`);
  assert(!/<meta[^>]*noindex/i.test(html), `${route}: accidental noindex`);
  const schema = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1]);
  assert(schema['@graph'].some(n => n['@type'] === 'Organization'));
  assert(!schema['@graph'].some(n => ['Review', 'AggregateRating'].includes(n['@type'])));
  if (route !== '/') assert(schema['@graph'].some(n => n['@type'] === 'BreadcrumbList'));
  for (const q of structured.faq[route]?.mainEntity || []) {
    assert(text(html).includes(q.name), `${route}: FAQ question not in page`);
    assert(text(html).includes(q.acceptedAnswer.text), `${route}: FAQ answer not in page`);
  }
  if (!['/middleton/', '/rye/', '/founder-story/'].includes(route)) {
    const before = execFileSync('git', ['show', `4072e90:${relative}`], { cwd: root, encoding: 'utf8', maxBuffer: 5e6 });
    assert.deepEqual([...new Set(protectedLinks(html))], [...new Set(protectedLinks(before))], `${route}: booking/shop destinations changed`);
    assert.deepEqual(text(html).match(/\$[\d,.]+/g), text(before).match(/\$[\d,.]+/g), `${route}: prices changed`);
    if (route.startsWith('/legal-pages/')) {
      assert.equal(text(html.match(/<main\b[\s\S]*?<\/main>/)[0]), text(before.match(/<main\b[\s\S]*?<\/main>/)[0]).replace("[insert email]", "Middleton@Nepclub.com "), `${route}: legal wording changed`);
    }
  }
  for (const [, src] of html.matchAll(/<img\b[^>]*src="(\/[^"]*)"/g)) {
    assert(existsSync(join(root, 'dist', decodeURIComponent(decode(src).split("?")[0]))), `${route}: missing image ${src}`);
  }
}
assert(!sitemap.includes('/social-events/'));
const headers = readFileSync(join(root, 'dist/_headers'), 'utf8').replaceAll('\r\n', '\n');
assert(headers.includes('https://nepc-website.pages.dev/*\n  X-Robots-Tag: noindex'));
console.log(`PASS: ${seenTitles.size} routes; metadata, H1, canonical, schema, sitemap, footer, images, protected booking links, prices and policy wording.`);

