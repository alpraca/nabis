# Windows Task Scheduler Setup for Nabis Farmaci
# Run this script as Administrator to set up automatic startup

$TaskName = "NabisFarmaciAutoStart"
$ProjectPath = "C:\Users\Admin\2nd-step"
$ScriptPath = "$ProjectPath\nabis-manager.ps1"

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "Setting up Nabis Farmaci Auto-Start Task..." -ForegroundColor Green

# Remove existing task if it exists
try {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host "Removed existing task" -ForegroundColor Yellow
} catch {
    # Task doesn't exist, continue
}

# Create the scheduled task action
$Action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -File `"$ScriptPath`" -Action start"

# Create the trigger (at startup)
$Trigger = New-ScheduledTaskTrigger -AtStartup

# Create the task settings
$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)

# Create the principal (run as current user)
$Principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive

# Register the scheduled task
Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Principal $Principal -Description "Auto-start Nabis Farmaci development environment"

Write-Host "`n✓ Scheduled task created successfully!" -ForegroundColor Green
Write-Host "Nabis Farmaci will now start automatically when Windows boots up." -ForegroundColor Cyan
Write-Host "`nTo manage the task:" -ForegroundColor Yellow
Write-Host "- Run: taskschd.msc" 
Write-Host "- Look for: $TaskName"
Write-Host "`nTo disable auto-start:" -ForegroundColor Yellow
Write-Host "- Run this script again to update settings"
Write-Host "- Or disable the task in Task Scheduler"

Write-Host "`nPress any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
