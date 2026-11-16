import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, 'dist');
const origin = 'https://newenglandpickleball.com';
const metadata = JSON.parse(readFileSync(join(root, 'scripts/seo-data.json'), 'utf8'));
const structured = JSON.parse(readFileSync(join(root, 'scripts/seo-structured-data.json'), 'utf8'));
const socialImage = 'https://cdn.prod.website-files.com/67d7a7154f2e71cc1081b1bf/685ec6c781d18bf59383025a_NEPC%20-%20OpenGraph.jpg';
const escape = value => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.name === 'assets' ? [] : entry.isDirectory() ? walk(join(dir, entry.name)) : [join(dir, entry.name)]);
const pages = walk(dist).filter(file => file.endsWith(`${sep}index.html`));
const urls = [];
for (const file of pages) {
  const route = '/' + relative(dist, file).split(sep).join('/').replace(/index\.html$/, '');
  let html = readFileSync(file, 'utf8');
  if (route === '/social-events/') {
    html = html.replace(/<link\b[^>]*rel="canonical"[^>]*>/gi, `<link rel="canonical" href="${origin}/community-events/">`);
    writeFileSync(file, html);
    continue;
  }
  if (route === '/our-story/') continue; // Legacy URL is a noindex redirect to /founder-story/.
  const url = origin + route;
  const copy = metadata[route];
  if (!copy) throw new Error(`Missing approved metadata for ${route}`);
  urls.push(url);
  html = html.replace(/<!-- nepc-seo:start -->[\s\S]*?<!-- nepc-seo:end -->/g, '');
  html = html.replace(/<link\b[^>]*rel="canonical"[^>]*>/gi, '');
  html = html.replace(/<meta\b[^>]*(?:property|name)="og:url"[^>]*>/gi, '');
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escape(copy.title)}</title>`);
  html = html.replace(/<meta\b[^>]*>/gi, tag => /(?:name|property)="(?:description|og:[^"]+|twitter:[^"]+)"/i.test(tag) ? '' : tag);
  html = html.replace(/©\s*\d{4}\s+NEPC/g, `© ${new Date().getFullYear()} NEPC`);
  const graph = [{ '@type': 'Organization', '@id': origin + '/#organization', name: 'New England Pickleball Club', url: origin + '/', logo: origin + '/assets/cdn.prod.website-files.com/67d7a7154f2e71cc1081b1bf/67d7cef66ded173bdc7deee3_NEPC%20Logo.svg', sameAs: ['https://www.facebook.com/nepclub', 'https://www.instagram.com/nep_club/', 'https://www.youtube.com/@nep_club'] }];
  if (structured.locations[route]) graph.push(structured.locations[route]);
  if (structured.faq[route]) graph.push(structured.faq[route]);
  // Breadcrumb labels are taken from the existing page title, not new marketing copy.
  if (route !== '/') {
    const title = (html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || 'NEPC').replace(/&amp;/g, '&').replace(/\s*\|.*$/, '');
    graph.push({ '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: origin + '/' }, { '@type': 'ListItem', position: 2, name: title, item: url }] });
  }
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replaceAll('<', '\\u003c');
  const tags = `<meta name="description" content="${escape(copy.description)}"><meta property="og:type" content="website"><meta property="og:title" content="${escape(copy.title)}"><meta property="og:description" content="${escape(copy.description)}"><meta property="og:image" content="${socialImage}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(copy.title)}"><meta name="twitter:description" content="${escape(copy.description)}"><meta name="twitter:image" content="${socialImage}">`;
  const block = `<!-- nepc-seo:start --><link rel="canonical" href="${escape(url)}"><meta property="og:url" content="${escape(url)}">${tags}<script type="application/ld+json">${json}</script><!-- nepc-seo:end -->`;
  html = html.replace('</head>', block + '</head>');
  writeFileSync(file, html);
}
writeFileSync(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.sort().map(url => `  <url><loc>${escape(url)}</loc></url>`).join('\n')}\n</urlset>\n`);
writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`);
console.log(`SEO foundation built for ${urls.length} indexable routes.`);
