@echo off
echo Starting URL Shortener with Ocelot Gateway...
echo ========================================

echo Starting Users Service (Port 5001/7001)
start "Users Service" cmd /k "cd Users && dotnet run"

echo Starting Shorten Service (Port 5002/7002)  
start "Shorten Service" cmd /k "cd Shorten && dotnet run"

echo Starting Ocelot Gateway (Port 5000/7000)
start "Ocelot Gateway" cmd /k "cd OcelotGateway && dotnet run"

echo Starting Frontend (Port 3000)
start "Frontend" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo All services are starting...
echo - Users Service: http://localhost:5001
echo - Shorten Service: http://localhost:5002  
echo - Ocelot Gateway: http://localhost:5000
echo - Frontend: http://localhost:3000
echo ========================================
echo.
echo Access your application at: http://localhost:3000
echo API Gateway available at: http://localhost:5000
echo.
pause
