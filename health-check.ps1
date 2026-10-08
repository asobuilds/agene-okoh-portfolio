# Health check — run before every deploy
$ErrorActionPreference = "Continue"
Write-Host "`n🩺 Portfolio Health Check`n" -ForegroundColor Cyan

$issues = 0

# Check critical files
$files = @(
    "index.html",
    "about.html",
    "projects.html",
    "contact.html",
    "services.html",
    "assets\css\style.css",
    "assets\js\script.js"
)

foreach ($f in $files) {
    $path = Join-Path $PWD $f
    if (-not (Test-Path $path)) {
        Write-Host "❌ MISSING: $f" -ForegroundColor Red
        $issues++
    } else {
        $size = (Get-Item $path).Length
        if ($size -lt 500 -and $f -like "*.html") {
            Write-Host "❌ CORRUPTED: $f is only $size bytes" -ForegroundColor Red
            $issues++
        } elseif ($f -like "*.html" -and $size -lt 2000) {
            Write-Host "⚠️  SUSPICIOUS: $f is only $size bytes" -ForegroundColor Yellow
            $issues++
        } else {
            Write-Host "✅ $f ($size bytes)" -ForegroundColor Green
        }
    }
}

# Check index.html doesn't contain the corruption marker
$idx = Get-Content "$PWD\index.html" -Raw
if ($idx -match '^C:\\Users') {
    Write-Host "`n🚨 CRITICAL: index.html contains 'C:\Users' corruption" -ForegroundColor Red
    $issues++
} elseif ($idx -notmatch '<html') {
    Write-Host "`n🚨 CRITICAL: index.html is missing <html> tag" -ForegroundColor Red
    $issues++
}

Write-Host "`n" -NoNewline
if ($issues -eq 0) {
    Write-Host "✅ ALL CLEAR — safe to deploy" -ForegroundColor Green
} else {
    Write-Host "❌ $issues ISSUE(S) FOUND — DO NOT DEPLOY" -ForegroundColor Red
}
Write-Host ""