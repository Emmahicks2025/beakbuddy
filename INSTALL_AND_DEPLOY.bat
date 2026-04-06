@echo off
echo ========================================
echo Parrot Master - Install and Deploy
echo ========================================
echo.

echo Step 1: Checking for Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js first:
    echo 1. Download from: https://nodejs.org/
    echo 2. Run the installer
    echo 3. Restart this script
    echo.
    pause
    exit /b 1
)

echo Node.js found!
node --version
npm --version
echo.

echo Step 2: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo Step 3: Installing Firebase CLI...
call npm install -g firebase-tools
if %errorlevel% neq 0 (
    echo ERROR: Failed to install Firebase CLI
    pause
    exit /b 1
)
echo.

echo Step 4: Logging into Firebase...
echo A browser window will open. Please login with your Google account.
call firebase login
if %errorlevel% neq 0 (
    echo ERROR: Firebase login failed
    pause
    exit /b 1
)
echo.

echo Step 5: Building web version (this may take 5-10 minutes)...
call npx expo export:web
if %errorlevel% neq 0 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo.

echo Step 6: Deploying to Firebase...
call firebase deploy --only hosting
if %errorlevel% neq 0 (
    echo ERROR: Deployment failed
    pause
    exit /b 1
)
echo.

echo ========================================
echo SUCCESS! Your app is now live!
echo URL: https://parrot-1fc71.web.app
echo ========================================
echo.
pause
