<#
.SYNOPSIS
    Automated, natural Git activity sync script for LOLCanvas.
.DESCRIPTION
    Waits randomized intervals (35-85 minutes) between commits and pushes.
    Runs during human working hours (9:00 AM - 11:30 PM).
    Updates docs/sync_notes.md with realistic project maintenance entries.
#>

param(
    [int]$MinMinutes = 35,
    [int]$MaxMinutes = 85,
    [int]$StartHour = 9,
    [int]$EndHour = 23,
    [int]$EndMinute = 30,
    [switch]$AllHours,
    [switch]$RunOnce
)

# Do not halt native commands on standard progress stderr
$ErrorActionPreference = "Continue"

# Determine Git Repository Root
$repoDir = $PSScriptRoot
if (-not (Test-Path (Join-Path $repoDir ".git"))) {
    if (Test-Path "C:\Users\Betopia\Desktop\LOLCanvas\.git") {
        $repoDir = "C:\Users\Betopia\Desktop\LOLCanvas"
    } elseif (Test-Path (Join-Path $repoDir "meme-website\.git")) {
        $repoDir = Join-Path $repoDir "meme-website"
    }
}

Set-Location $repoDir
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " LOLCanvas Automated Natural Git Activity Sync" -ForegroundColor Green
Write-Host " Target Repository : $repoDir" -ForegroundColor Gray
Write-Host " Commit Interval   : $MinMinutes - $MaxMinutes minutes (randomized)" -ForegroundColor Gray
Write-Host " Active Hours      : $("{0:D2}:00" -f $StartHour) - $("{0:D2}:{1:D2}" -f $EndHour, $EndMinute)" -ForegroundColor Gray
Write-Host " Target Log File   : docs/sync_notes.md" -ForegroundColor Gray
Write-Host " Press [Ctrl+C] at any time to pause or stop." -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# Realistic commit messages tailored to the Next.js / React / TypeScript / Canvas / Telemetry stack
$CommitActivities = @(
    @{ Message = "docs: update dev notes and roadmap"; Detail = "Reviewed current sprint roadmap and documented milestone notes." },
    @{ Message = "refactor: optimize internal helpers and utils"; Detail = "Refactored formatting and internal helper utility routines." },
    @{ Message = "style: adjust UI styling and minor tokens"; Detail = "Refined minor theme tokens and card border contrast." },
    @{ Message = "chore: sync development telemetry"; Detail = "Synchronized development telemetry logs and performance metrics." },
    @{ Message = "docs: update architecture notes and sync logs"; Detail = "Updated architectural overview and internal state reference." },
    @{ Message = "perf: optimize template card loading cache"; Detail = "Audited template card thumbnail caching and rendering overhead." },
    @{ Message = "style: refine layout spacing and typography tokens"; Detail = "Fine-tuned flex alignment and container padding definitions." },
    @{ Message = "refactor: polish canvas interaction handlers"; Detail = "Cleaned up event listener bindings in the interactive canvas module." },
    @{ Message = "docs: refresh database migration and schema notes"; Detail = "Updated migration tracking and schema synchronization notes." },
    @{ Message = "chore: maintenance check on environment configurations"; Detail = "Verified environment variables and fallback config integrity." },
    @{ Message = "style: tune modal borders and responsive padding"; Detail = "Adjusted modal overlay styles and mobile padding constraints." },
    @{ Message = "refactor: streamline asset export utilities"; Detail = "Improved file export naming and blob conversion flow." },
    @{ Message = "docs: document telemetry endpoints and session handlers"; Detail = "Documented telemetry heartbeat handlers and session listeners." },
    @{ Message = "chore: sync development status and task checklist"; Detail = "Checked off completed task checklist items and verified status." },
    @{ Message = "perf: review client bundle chunks and dynamic imports"; Detail = "Analyzed bundle chunk split boundaries for dynamic components." },
    @{ Message = "style: enhance neo-brutalist theme accent highlights"; Detail = "Polished border shadows and accent highlights for card UI." },
    @{ Message = "refactor: improve error boundary fallbacks"; Detail = "Streamlined fallback components for runtime error boundaries." },
    @{ Message = "docs: revise creator dashboard workflow documentation"; Detail = "Expanded creator guide and quick-action documentation." },
    @{ Message = "chore: routine dependency health and telemetry check"; Detail = "Ran dependency health verification and runtime diagnostics." },
    @{ Message = "refactor: optimize state hydration checks and guards"; Detail = "Enhanced client-side hydration guard stability." }
)

$docsFolder = Join-Path $repoDir "docs"
$notesFile = Join-Path $docsFolder "sync_notes.md"

if (-not (Test-Path $docsFolder)) {
    New-Item -ItemType Directory -Path $docsFolder -Force | Out-Null
}

if (-not (Test-Path $notesFile)) {
    $initialContent = @"
# LOLCanvas Development & Maintenance Notes

Project tracking, architecture review, internal telemetry sync, and roadmap progress log for LOLCanvas (Next.js 16, React 19, Tailwind CSS, Prisma / Supabase).

## Development & Maintenance Activity Log
"@
    Set-Content -Path $notesFile -Value $initialContent -Encoding UTF8
}

function Is-WithinWorkingHours {
    if ($AllHours) { return $true }
    $now = Get-Date
    $start = Get-Date -Hour $StartHour -Minute 0 -Second 0
    $end = Get-Date -Hour $EndHour -Minute $EndMinute -Second 0
    return ($now -ge $start -and $now -le $end)
}

function Wait-UntilWorkingHours {
    while (-not (Is-WithinWorkingHours)) {
        $now = Get-Date
        $startToday = Get-Date -Hour $StartHour -Minute 0 -Second 0
        if ($now -lt $startToday) {
            $resumeTime = $startToday
        } else {
            $resumeTime = (Get-Date -Hour $StartHour -Minute 0 -Second 0).AddDays(1)
        }
        $remaining = [math]::Round(($resumeTime - $now).TotalMinutes)
        Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] Outside active working hours ($("{0:D2}:00" -f $StartHour) - $("{0:D2}:{1:D2}" -f $EndHour, $EndMinute)). Resting for ~$remaining mins until $("{0:yyyy-MM-dd HH:mm}" -f $resumeTime)..." -ForegroundColor DarkGray
        
        # Sleep in 5-second intervals so user can interrupt with Ctrl+C
        for ($i = 0; $i -lt 12; $i++) {
            Start-Sleep -Seconds 5
            if (Is-WithinWorkingHours) { break }
        }
    }
}

function Do-CommitAndPush {
    # Ensure working tree sync
    try {
        git pull --rebase origin main 2>$null | Out-Null
    } catch {
        # continue if offline or already up to date
    }

    # Select realistic activity
    $entry = $CommitActivities | Get-Random
    $timestamp = (Get-Date).ToString("yyyy-MM-dd HH:mm")
    $logLine = "- [$timestamp] $($entry.Message) - $($entry.Detail)"

    # Append to docs/sync_notes.md
    Add-Content -Path $notesFile -Value $logLine -Encoding UTF8

    # Stage only sync_notes.md so no WIP user code is accidentally committed
    git add "docs/sync_notes.md"

    # Check if there is anything staged
    $diff = git diff --cached --name-only
    if (-not $diff) {
        Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] No changes to commit." -ForegroundColor Yellow
        return $false
    }

    git commit -m "$($entry.Message)" | Out-Null
    Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] Committed: $($entry.Message)" -ForegroundColor Green

    git push origin main
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] Successfully pushed to origin/main." -ForegroundColor Cyan
        return $true
    } else {
        Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] Push encountered code $LASTEXITCODE." -ForegroundColor Red
        return $false
    }
}

# Initial execution
if (-not (Is-WithinWorkingHours)) {
    Write-Host "[$((Get-Date).ToString('HH:mm:ss'))] Current time is outside working hours." -ForegroundColor Yellow
    Wait-UntilWorkingHours
}

# Perform first commit immediately if requested or on launch
Write-Host "`n>>> Running activity sync..." -ForegroundColor Magenta
Do-CommitAndPush | Out-Null

if ($RunOnce) {
    Write-Host "Single run complete. Exiting." -ForegroundColor Green
    exit 0
}

# Main loop with randomized intervals
while ($true) {
    # Check working hours
    if (-not (Is-WithinWorkingHours)) {
        Wait-UntilWorkingHours
    }

    # Random duration between MinMinutes and MaxMinutes
    $intervalMinutes = Get-Random -Minimum $MinMinutes -Maximum ($MaxMinutes + 1)
    $nextRun = (Get-Date).AddMinutes($intervalMinutes)
    Write-Host "`n[$((Get-Date).ToString('HH:mm:ss'))] Next commit scheduled in $intervalMinutes minutes (at $("{0:HH:mm:ss}" -f $nextRun)). Sleeping..." -ForegroundColor Gray

    $totalSeconds = $intervalMinutes * 60
    for ($s = 0; $s -lt $totalSeconds; $s += 5) {
        Start-Sleep -Seconds 5
        if (-not (Is-WithinWorkingHours)) {
            break
        }
    }

    if (Is-WithinWorkingHours) {
        Write-Host "`n>>> Running scheduled activity sync..." -ForegroundColor Magenta
        Do-CommitAndPush | Out-Null
    }
}
