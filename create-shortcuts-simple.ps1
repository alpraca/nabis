# Create Desktop Shortcuts for Nabis Farmaci

$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ProjectPath = "C:\Users\Admin\2nd-step"

function Create-Shortcut {
    param($ShortcutPath, $TargetPath, $Arguments, $Description)
    
    $WshShell = New-Object -comObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($ShortcutPath)
    $Shortcut.TargetPath = $TargetPath
    if ($Arguments) { $Shortcut.Arguments = $Arguments }
    $Shortcut.Description = $Description
    $Shortcut.Save()
}

Write-Host "Creating desktop shortcuts for Nabis Farmaci..." -ForegroundColor Green

# Start Nabis shortcut
Create-Shortcut -ShortcutPath "$DesktopPath\Start Nabis Farmaci.lnk" -TargetPath "$ProjectPath\start-nabis.bat" -Description "Start Nabis Farmaci Development Environment"

# Stop Nabis shortcut  
Create-Shortcut -ShortcutPath "$DesktopPath\Stop Nabis Farmaci.lnk" -TargetPath "$ProjectPath\stop-nabis.bat" -Description "Stop Nabis Farmaci Development Environment"

# Open Frontend shortcut using default browser
$BrowserPath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
if (-not (Test-Path $BrowserPath)) {
    $BrowserPath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
}
Create-Shortcut -ShortcutPath "$DesktopPath\Open Nabis Website.lnk" -TargetPath $BrowserPath -Arguments "http://localhost:5174" -Description "Open Nabis Farmaci Website"

Write-Host "Desktop shortcuts created successfully!" -ForegroundColor Green
Write-Host "Shortcuts created:" -ForegroundColor Cyan
Write-Host "- Start Nabis Farmaci" 
Write-Host "- Stop Nabis Farmaci"
Write-Host "- Open Nabis Website"

pause
