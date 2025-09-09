@echo off
echo Stopping Nabis Farmaci Development Environment...

REM Kill any running Node.js processes related to the project
taskkill /f /im node.exe 2>nul
taskkill /f /im npm.exe 2>nul

echo.
echo Nabis Farmaci has been stopped.
pause
