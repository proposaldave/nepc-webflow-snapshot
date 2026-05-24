param(
  [string]$Repo = "proposaldave/nepc-webflow-snapshot",
  [switch]$Public
)

$ErrorActionPreference = "Stop"

function Fail($Message) {
  Write-Host "ERROR: $Message" -ForegroundColor Red
  exit 1
}

if (-not (Test-Path -LiteralPath ".git")) {
  Fail "Run this from the nepc_static_clone repo root."
}

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Fail "GitHub CLI is not installed or not on PATH."
}

cmd /c "gh auth status >NUL 2>NUL"
if ($LASTEXITCODE -ne 0) {
  Fail "GitHub CLI is not authenticated. Run: gh auth login"
}

$visibility = if ($Public) { "--public" } else { "--private" }
$existingRemote = ""
cmd /c "git remote get-url origin > .publish-origin.tmp 2>NUL"
if ($LASTEXITCODE -eq 0) {
  $existingRemote = (Get-Content -Raw -Path ".publish-origin.tmp").Trim()
}
Remove-Item -Force -ErrorAction SilentlyContinue ".publish-origin.tmp"

if ($existingRemote) {
  git push -u origin main
  exit $LASTEXITCODE
}

cmd /c "gh repo view $Repo >NUL 2>NUL"
if ($LASTEXITCODE -eq 0) {
  git remote add origin "git@github.com:$Repo.git"
  git push -u origin main
  exit $LASTEXITCODE
}

gh repo create $Repo $visibility --source . --remote origin --push
exit $LASTEXITCODE
