@echo off
set ROOT=%~dp0

start "Mantella" powershell -NoExit -Command "Set-Location '%ROOT%Mantella-0.14\Mantella-0.14'; C:\Users\Antonio\anaconda3\envs\mantella\python.exe main.py"

start "Backend Proxy" powershell -NoExit -Command "Set-Location '%ROOT%'; C:\Users\Antonio\anaconda3\python.exe backend\proxy.py"

start "Frontend" powershell -NoExit -Command "Set-Location '%ROOT%frontend'; npm install; npm run dev"
