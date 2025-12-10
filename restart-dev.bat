@echo off
echo Stopping development servers...
taskkill /f /im node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Cleaning Next.js cache...
cd frontend
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache
cd ..

cd backend  
if exist .next rmdir /s /q .next
if exist node_modules\.cache rmdir /s /q node_modules\.cache
cd ..

echo Starting backend...
start "Backend" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting frontend...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo Development servers are starting...
echo Backend: http://localhost:3001
echo Frontend: http://localhost:3000
pause