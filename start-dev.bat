@echo off
REM Venu Development Startup Script for Windows
REM This script starts both the frontend and backend servers with the correct ports

echo 🚀 Starting Venu Development Environment...
echo.

REM Start backend server on port 3001
echo 🔧 Starting backend server on port 3001...
cd backend
start "Backend Server" cmd /k "set PORT=3001 && npm run dev"
cd ..

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server on port 3000
echo 🎨 Starting frontend server on port 3000...
start "Frontend Server" cmd /k "set PORT=3000 && npm run dev"

echo.
echo ✅ Both servers are starting up!
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:3001
echo.
echo Close the terminal windows to stop the servers
pause
