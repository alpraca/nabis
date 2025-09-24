@echo off
title Nabis Pharmacy - Product Upload System

echo.
echo ========================================
echo    Nabis Pharmacy Product Upload System
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Node.js version: 
node --version

echo.
echo Checking system requirements...

REM Check if required files exist
if not exist "farmaon_products.xlsx" (
    echo ERROR: farmaon_products.xlsx not found
    echo Please place your Excel file in this folder
    pause
    exit /b 1
)

if not exist "product_images" (
    echo ERROR: product_images folder not found
    echo Please create the folder and add your product images
    pause
    exit /b 1
)

echo ✓ Excel file found
echo ✓ Images folder found

echo.
echo Installing dependencies...
call npm install xlsx axios form-data

echo.
echo Starting product upload system...
echo.

REM Run the upload system
node product-upload-system.js

echo.
echo Upload process completed!
echo Check the generated report for details.
echo.
pause