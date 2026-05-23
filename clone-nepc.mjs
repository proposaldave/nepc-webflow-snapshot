import fs from "node:fs/promises";
import path from "node:path";

const ORIGIN = "https://www.newenglandpickleball.com";
const OUT_DIR = path.resolve("sites/nepc_static_clone/dist");

const seedPaths = [
  "/",
  "/clubs",
  "/calendar",
  "/coaching",
  "/membership",
  "/contact",
  "/book-a-court",
  "/choose-club",
  "/new-to-pickle-ball",
  "/quickstart-classes/middleton",
  "/quickstart-classes/rye",
  "/club-news/new-nepc-partner-leagues",
];

const pageQueue = [...seedPaths];
const seenPages = new Set();
const fetchedAssets = new Set();

function normalizePathname(pathname) {
  if (!pathname || pathname === "/") return "/";
  return pathname.replace(/\/+$/, "");
}

function outputPathForPage(pathname) {
  const clean = normalizePathname(pathname);
  if (clean === "/") return path.join(OUT_DIR, "index.html");
  return path.join(OUT_DIR, clean.slice(1), "index.html");
}

function localHrefForPath(pathname) {
  const clean = normalizePathname(pathname);
  if (clean === "/") return "/";
  return `${clean}/`;
}

function shouldMirrorPage(url) {
  if (url.origin !== ORIGIN) return false;
  if (url.search || url.hash) return false;
  const p = normalizePathname(url.pathname);
  if (p.includes(".")) return false;
  return (
    p === "/" ||
    [
      "/clubs",
      "/calendar",
      "/coaching",
      "/membership",
      "/contact",
      "/book-a-court",
      "/choose-club",
      "/new-to-pickle-ball",
      "/quickstart-classes/middleton",
      "/quickstart-classes/rye",
    ].includes(p) ||
    p.startsWith("/club-news/") ||
    p.startsWith("/legal-pages/")
  );
}

function localAssetPath(url) {
  const u = new URL(url);
  const safeHost = u.hostname.replace(/[^a-z0-9.-]/gi, "_");
  const decodedPath = decodeURIComponent(u.pathname)
    .split("/")
    .map((part) => part.replace(/[<>:"\\|?*\u0000-\u001F]/g, "_"))
    .join("/");
  return `/assets/${safeHost}${decodedPath}`;
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "user-agent": "Mozilla/5.0 NEPC static migration audit",
    },
  });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.text();
}

async function fetchAsset(url) {
  if (fetchedAssets.has(url)) return;
  fetchedAssets.add(url);

  try {
    const response = await fetch(url, {
      headers: {
        "user-agent": "Mozilla/5.0 NEPC static migration audit",
      },
    });
    if (!response.ok) return;
    const target = path.join(OUT_DIR, localAssetPath(url).slice(1));
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, Buffer.from(await response.arrayBuffer()));
  } catch {
    // Asset mirroring is best-effort. Broken assets are easier to find visually.
  }
}

function collectPageLinks(html) {
  const links = [...html.matchAll(/\s(?:href|src)=["']([^"']+)["']/gi)].map((m) => m[1]);
  for (const href of links) {
    try {
      const url = new URL(href, ORIGIN);
      if (shouldMirrorPage(url)) {
        const clean = normalizePathname(url.pathname);
        if (!seenPages.has(clean) && !pageQueue.includes(clean)) pageQueue.push(clean);
      }
    } catch {
      // Ignore malformed URLs from embeds.
    }
  }
}

function collectAssetUrls(html) {
  const urls = new Set();
  const attrMatches = html.matchAll(/\s(?:src|href)=["'](https:\/\/(?:cdn\.prod\.website-files\.com|d3e54v103j8qbb\.cloudfront\.net)[^"']+)["']/gi);
  for (const match of attrMatches) urls.add(match[1]);

  const srcsetMatches = html.matchAll(/\ssrcset=["']([^"']+)["']/gi);
  for (const match of srcsetMatches) {
    for (const part of match[1].split(",")) {
      const url = part.trim().split(/\s+/)[0];
      if (url.startsWith("https://cdn.prod.website-files.com/")) urls.add(url);
    }
  }

  const inlineUrlMatches = html.matchAll(/url\(["']?(https:\/\/cdn\.prod\.website-files\.com[^"')]+)["']?\)/gi);
  for (const match of inlineUrlMatches) urls.add(match[1]);

  return [...urls];
}

function rewriteHtml(html) {
  let out = html;

  for (const assetUrl of collectAssetUrls(html)) {
    out = out.split(assetUrl).join(localAssetPath(assetUrl));
  }

  out = out.replace(/https:\/\/www\.newenglandpickleball\.com/g, "");

  out = out.replace(/\s(href|src)=["']\/lsfr[^"']+["']/gi, "");

  out = out.replace(/\shref=["'](\/[^"'?#]+)["']/gi, (full, href) => {
    const clean = normalizePathname(href);
    if (clean.includes(".")) return full;
    return ` href="${localHrefForPath(clean)}"`;
  });

  return out;
}

async function mirrorPage(pathname) {
  const clean = normalizePathname(pathname);
  if (seenPages.has(clean)) return;
  seenPages.add(clean);

  const url = `${ORIGIN}${clean === "/" ? "/" : clean}`;
  const html = await fetchText(url);
  collectPageLinks(html);

  const assets = collectAssetUrls(html);
  await Promise.all(assets.map(fetchAsset));

  const rewritten = rewriteHtml(html);
  const target = outputPathForPage(clean);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, rewritten, "utf8");
  console.log(`mirrored ${clean} (${assets.length} assets referenced)`);
}

async function main() {
  await fs.rm(OUT_DIR, { recursive: true, force: true });
  await fs.mkdir(OUT_DIR, { recursive: true });

  while (pageQueue.length) {
    const next = pageQueue.shift();
    try {
      await mirrorPage(next);
    } catch (error) {
      console.warn(`skip ${next}: ${error.message}`);
    }
  }

  await fs.writeFile(
    path.join(OUT_DIR, "MIGRATION_NOTES.txt"),
    [
      "NEPC static mirror generated from public Webflow pages.",
      `Generated: ${new Date().toISOString()}`,
      "",
      "Known limitations:",
      "- Webflow forms are not replaced with working form handlers.",
      "- CourtReserve embeds remain external.",
      "- Webflow CMS/news was snapshotted as static HTML.",
      "- Webflow scripts are mirrored only when referenced from public CDN URLs.",
      "- This is a proof-of-migration artifact, not the final maintainable codebase.",
      "",
    ].join("\n"),
    "utf8",
  );

  console.log(`done: ${seenPages.size} pages, ${fetchedAssets.size} unique asset URLs`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
