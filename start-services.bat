@echo off
echo Starting URL Shortener Microservices (JavaScript Frontend)...

echo.
echo Starting Users Service (Port 5001)...
start "Users Service" cmd /k "cd /d C:\Users\Admin\Documents\AMD\URLShortener\Users && dotnet run"

timeout /t 5 /nobreak > nul

echo.
echo Starting Shorten Service (Port 5002)...
start "Shorten Service" cmd /k "cd /d C:\Users\Admin\Documents\AMD\URLShortener\Shorten && dotnet run"

timeout /t 5 /nobreak > nul

echo.
echo Starting React Frontend - JavaScript (Port 3000)...
start "React Frontend" cmd /k "cd /d C:\Users\Admin\Documents\AMD\URLShortener\frontend && npm start"

echo.
echo All services are starting...
echo Users API: https://localhost:7001
echo Shorten API: https://localhost:7002  
echo Frontend: http://localhost:3000
echo.
echo ✅ Frontend converted to JavaScript (no TypeScript)
echo Press any key to exit...
pause > nul
