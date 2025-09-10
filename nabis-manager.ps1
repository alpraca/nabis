# Nabis Farmaci Development Environment Manager
# This script handles starting, stopping, and monitoring the application

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("start", "stop", "restart", "status")]
    [string]$Action = "start"
)

$ProjectPath = "C:\Users\Admin\2nd-step"
$LogFile = "$ProjectPath\nabis.log"

function Write-Log {
    param($Message)
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "[$Timestamp] $Message"
    Write-Host $LogEntry
    Add-Content -Path $LogFile -Value $LogEntry
}

function Start-NabisService {
    Write-Log "Starting Nabis Farmaci Development Environment..."
    
    # Check if already running
    $ExistingProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
        $_.MainModule.FileName -like "*$ProjectPath*"
    }
    
    if ($ExistingProcess) {
        Write-Log "Nabis Farmaci is already running (PID: $($ExistingProcess.Id))"
        return
    }
    
    # Change to project directory
    Set-Location $ProjectPath
    
    # Start the service in background
    Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "npm run dev:full" -WindowStyle Minimized
    
    Write-Log "Nabis Farmaci started successfully!"
    Write-Log "Frontend: http://localhost:5173"
    Write-Log "Backend API: http://localhost:3001"
    
    # Wait a moment and check if services are responding
    Start-Sleep -Seconds 5
    Test-NabisServices
}

function Stop-NabisService {
    Write-Log "Stopping Nabis Farmaci Development Environment..."
    
    # Kill Node.js processes
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
    Get-Process -Name "npm" -ErrorAction SilentlyContinue | Stop-Process -Force
    
    Write-Log "Nabis Farmaci stopped successfully!"
}

function Test-NabisServices {
    Write-Log "Testing service connectivity..."
    
    try {
        $Frontend = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -ErrorAction SilentlyContinue
        $Backend = Invoke-WebRequest -Uri "http://localhost:3001/api/products/brands" -TimeoutSec 5 -ErrorAction SilentlyContinue
        
        if ($Frontend) {
            Write-Log "✓ Frontend is responding on port 5173"
        } else {
            Write-Log "✗ Frontend is not responding on port 5173"
        }
        
        if ($Backend) {
            Write-Log "✓ Backend API is responding on port 3001"
        } else {
            Write-Log "✗ Backend API is not responding on port 3001"
        }
    }
    catch {
        Write-Log "Services are still starting up..."
    }
}

function Get-NabisStatus {
    Write-Log "Checking Nabis Farmaci status..."
    
    $NodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    
    if ($NodeProcesses) {
        Write-Log "Node.js processes running:"
        $NodeProcesses | ForEach-Object {
            Write-Log "  PID: $($_.Id), CPU: $($_.CPU), Memory: $([math]::Round($_.WorkingSet64/1MB, 2))MB"
        }
        Test-NabisServices
    } else {
        Write-Log "No Node.js processes found. Nabis Farmaci is not running."
    }
}

# Main execution
switch ($Action) {
    "start" { Start-NabisService }
    "stop" { Stop-NabisService }
    "restart" { 
        Stop-NabisService
        Start-Sleep -Seconds 3
        Start-NabisService
    }
    "status" { Get-NabisStatus }
}

if ($Action -ne "stop") {
    Write-Host "`nPress any key to continue..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}
