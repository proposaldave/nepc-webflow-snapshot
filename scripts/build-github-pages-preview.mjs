import { copyFileSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { normalizeNavigationInTree } from "./normalize-navigation.mjs";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, "dist");
const target = join(root, "docs");
const basePath = "/nepc-webflow-snapshot";

function copyDir(from, to) {
  mkdirSync(to, { recursive: true });
  for (const name of readdirSync(from)) {
    if (name === "desktop.ini") continue;
    const src = join(from, name);
    const dest = join(to, name);
    if (statSync(src).isDirectory()) {
      copyDir(src, dest);
    } else {
      copyFileSync(src, dest);
    }
  }
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

function rewriteHtml(path) {
  let html = readFileSync(path, "utf8");
  html = html
    .replaceAll('href="/', `href="${basePath}/`)
    .replaceAll('src="/', `src="${basePath}/`)
    .replaceAll('srcset="/', `srcset="${basePath}/`)
    .replaceAll(", /", `, ${basePath}/`)
    .replaceAll("url('/", `url('${basePath}/`)
    .replaceAll('url("/', `url("${basePath}/`);
  writeFileSync(path, html);
}

if (existsSync(target)) {
  rmSync(target, { recursive: true, force: true });
}

copyDir(source, target);
for (const file of walk(target).filter((path) => path.endsWith(".html"))) {
  rewriteHtml(file);
}
normalizeNavigationInTree(target);
writeFileSync(join(target, ".nojekyll"), "");

console.log(`GitHub Pages preview built in ${target}`);
