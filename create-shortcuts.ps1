# Create Desktop Shortcuts for Nabis Farmaci

$DesktopPath = [Environment]::GetFolderPath("Desktop")
$ProjectPath = "C:\Users\Admin\2nd-step"

# Function to create shortcut
function Create-Shortcut {
    param($ShortcutPath, $TargetPath, $Arguments, $Description, $IconPath)
    
    $WshShell = New-Object -comObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($ShortcutPath)
    $Shortcut.TargetPath = $TargetPath
    if ($Arguments) { $Shortcut.Arguments = $Arguments }
    $Shortcut.Description = $Description
    if ($IconPath) { $Shortcut.IconLocation = $IconPath }
    $Shortcut.Save()
}

Write-Host "Creating desktop shortcuts for Nabis Farmaci..." -ForegroundColor Green

# Start Nabis shortcut
Create-Shortcut -ShortcutPath "$DesktopPath\Start Nabis Farmaci.lnk" -TargetPath "$ProjectPath\start-nabis.bat" -Description "Start Nabis Farmaci Development Environment"

# Stop Nabis shortcut  
Create-Shortcut -ShortcutPath "$DesktopPath\Stop Nabis Farmaci.lnk" -TargetPath "$ProjectPath\stop-nabis.bat" -Description "Stop Nabis Farmaci Development Environment"

# Advanced Manager shortcut
Create-Shortcut -ShortcutPath "$DesktopPath\Nabis Manager.lnk" -TargetPath "PowerShell.exe" -Arguments "-ExecutionPolicy Bypass -File `"$ProjectPath\nabis-manager.ps1`"" -Description "Nabis Farmaci Advanced Manager"

# Open Frontend shortcut
Create-Shortcut -ShortcutPath "$DesktopPath\Open Nabis Website.lnk" -TargetPath "http://localhost:5174" -Description "Open Nabis Farmaci Website"

# Open Admin Panel shortcut
Create-Shortcut -ShortcutPath "$DesktopPath\Nabis Admin Panel.lnk" -TargetPath "http://localhost:5174/admin" -Description "Open Nabis Farmaci Admin Panel"

Write-Host "`n✓ Desktop shortcuts created successfully!" -ForegroundColor Green
Write-Host "`nShortcuts created:" -ForegroundColor Cyan
Write-Host "- Start Nabis Farmaci (Simple start)"
Write-Host "- Stop Nabis Farmaci (Simple stop)"  
Write-Host "- Nabis Manager (Advanced management)"
Write-Host "- Open Nabis Website (http://localhost:5174)"
Write-Host "- Nabis Admin Panel (http://localhost:5174/admin)"

Write-Host "`nPress any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
