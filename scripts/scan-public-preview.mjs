import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const scanRoots = ["dist", "docs", "webflow-update-package", "README.md", "scripts"];
const blockedPatterns = [
  /C:\\Users\\/i,
  /CLAUDE COWORK/i,
  /[\\/]\\.codex[\\/]/i,
  /OPENAI_API_KEY/i,
  /WEBFLOW_TOKEN/i,
  /GITHUB_TOKEN/i,
  /NETLIFY_AUTH_TOKEN/i,
  /BEGIN (RSA|OPENSSH|PRIVATE) KEY/i,
  /password\s*[:=]/i,
  /secret\s*[:=]/i,
  /Give n Take|Give 'n Take|GnT\b|v2\.gnt\.ai/i,
  /CourtSheet_Data|full_canon_context|GOD_PROMPT|TASKS\.md/i,
  /68306d72872ce01f396771ad_New to pickleball_ We got you/i,
  /Julio Lupo|Julio_Lupo/i,
];
const allowedBinary = /\.(png|jpe?g|webp|gif|svg|pdf|ico|woff2?)$/i;
const allowedText = /\.(html|css|js|mjs|json|md|txt|xml|svg)$/i;

function walk(path) {
  const full = join(root, path);
  if (!statSync(full).isDirectory()) return [full];
  return readdirSync(full).flatMap((name) => {
    const child = join(full, name);
    return statSync(child).isDirectory() ? walk(join(path, name)) : [child];
  });
}

const files = scanRoots.flatMap(walk);
const findings = [];

for (const file of files) {
  if (file.includes(`${join(root, ".git")}`) || file.includes(`${join(root, "release")}`)) continue;
  if (file.endsWith(`${join("scripts", "scan-public-preview.mjs")}`)) continue;
  if (file.includes(`${join("assets")}`) && /\.(js|css)$/i.test(file)) continue;
  if (allowedBinary.test(file) && !allowedText.test(file)) continue;
  const text = readFileSync(file, "utf8");
  for (const pattern of blockedPatterns) {
    if (pattern.test(text)) {
      findings.push(`${file.replace(root, "")}: ${pattern}`);
    }
  }
}

if (findings.length) {
  console.error("Public preview scan failed:");
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log(`Public preview scan passed (${files.length} files checked).`);
