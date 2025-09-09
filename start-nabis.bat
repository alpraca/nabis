@echo off
echo Starting Nabis Farmaci Development Environment...
echo.

REM Change to the project directory
cd /d "C:\Users\Admin\2nd-step"

REM Start the development environment
npm run dev:full

echo.
echo Nabis Farmaci is now running!
echo Frontend: http://localhost:5173
echo Backend API: http://localhost:3001
echo.
pause
