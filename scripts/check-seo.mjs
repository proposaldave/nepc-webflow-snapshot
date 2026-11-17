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
  if (route === '/gift-cards/') {
    assert.deepEqual([...new Set(protectedLinks(html))].sort(), [
      'https://shop.newenglandpickleball.com/products/nepc-gift-card?utm_source=copyToPasteBoard&amp;utm_medium=product-links&amp;utm_content=web',
      'https://shop.newenglandpickleball.com/buy/46887012729082:1'
    ].sort(), 'Gift cards must retain the original shop fallback and the verified default checkout variant');
  }
  if (route !== '/') assert(schema['@graph'].some(n => n['@type'] === 'BreadcrumbList'));
  for (const q of structured.faq[route]?.mainEntity || []) {
    assert(text(html).includes(q.name), `${route}: FAQ question not in page`);
    assert(text(html).includes(q.acceptedAnswer.text), `${route}: FAQ answer not in page`);
  }
  if (!['/middleton/', '/rye/', '/founder-story/', '/gift-cards/'].includes(route)) {
    const baseline = route === '/calendar/' ? 'd16d80069b6efe004de79de5161c94d35c903779' : '4072e90';
    const before = execFileSync('git', ['show', `${baseline}:${relative}`], { cwd: root, encoding: 'utf8', maxBuffer: 5e6 });
    if (route === '/calendar/') assert.equal(html, before, 'The owner deferred the new calendar: preserve the existing production page exactly');
    const expectedDestinations = new Set(protectedLinks(before));
    // Gift promotions now open the redesigned internal landing page. The
    // original shop purchase URL is checked separately on /gift-cards/ above.
    if (route !== '/calendar/') expectedDestinations.delete('https://shop.newenglandpickleball.com/products/nepc-gift-card?utm_source=copyToPasteBoard&amp;utm_medium=product-links&amp;utm_content=web');
    if (['/community-events/', '/glow-in-the-dark/'].includes(route)) {
      // The owner explicitly retired this past event-details link. Glow now
      // presents the offered experience and event-inquiry path instead.
      expectedDestinations.delete('https://app.courtreserve.com/Online/Events/Details/13164/A8K47F313164330?resId=58624351');
    }
    // Find Your Play also links directly to the two existing club portals.
    // Keep the exact original embed/shop URLs and allow only these known additions.
    if (route === '/new-to-pickle-ball/') {
      // Inline beginner discovery retains the exact existing club portals and
      // location-specific Quick Start widgets as its registration fallback.
      for (const destination of [
        'https://app.courtreserve.com/Online/Portal/Index/7432',
        'https://app.courtreserve.com/Online/Portal/Index/13164',
        'https://widgets.courtreserve.com/Online/Public/EmbedCode/7432/47383',
        'https://widgets.courtreserve.com/Online/Public/EmbedCode/13164/47384'
      ]) expectedDestinations.add(destination);
    }
    assert.deepEqual([...new Set(protectedLinks(html))].sort(), [...expectedDestinations].sort(), `${route}: booking/shop destinations changed`);
    const expectedPrices = text(before).match(/\$[\d,.]+/g);
    if (route === '/membership/') {
      // Repeat the existing Blue hourly fee in the accessible comparison table.
      const blueHourlyFee = text(before).match(/Court Fees:\s*(\$[\d,.]+)/)?.[1];
      assert(blueHourlyFee, 'Existing Blue hourly court fee is required');
      expectedPrices.push(blueHourlyFee);
    }
    assert.deepEqual(text(html).match(/\$[\d,.]+/g), expectedPrices, `${route}: prices changed`);
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

