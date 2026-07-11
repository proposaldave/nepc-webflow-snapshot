$ErrorActionPreference = "Stop"

function Fail($Message) {
  Write-Host "ERROR: $Message" -ForegroundColor Red
  exit 1
}

if (-not (Test-Path -LiteralPath ".git")) {
  Fail "Run this from the NEPC_WEBSITE_PUBLIC repo root."
}

$branch = (git branch --show-current).Trim()
if (-not $branch) {
  Fail "No current Git branch was found."
}

if ($branch -eq "main") {
  Fail "Direct pushes from main are disabled. Create a review branch first."
}

node .\scripts\normalize-navigation.mjs dist
if ($LASTEXITCODE -ne 0) {
  Fail "Navigation normalization failed."
}

node .\scripts\build-github-pages-preview.mjs
if ($LASTEXITCODE -ne 0) {
  Fail "Preview build failed."
}

node .\scripts\scan-public-preview.mjs
if ($LASTEXITCODE -ne 0) {
  Fail "Public-site safety scan failed."
}

git diff --check
if ($LASTEXITCODE -ne 0) {
  Fail "Git diff validation failed."
}

git push -u origin $branch
if ($LASTEXITCODE -ne 0) {
  Fail "Review-branch push failed."
}

Write-Host "Review branch pushed: $branch" -ForegroundColor Green
Write-Host "Use the Cloudflare preview for review. Do not merge to main without explicit publish-live approval."
