@echo off
echo ===========================================
echo     URL Shortener - Don Gian (No DTOs)
echo ===========================================

echo Dang khoi chay cac services...

echo.
echo [1/4] Khoi chay Users Service (Port 5001)...
start "Users Service" cmd /c "cd Users && dotnet run --urls=http://localhost:5001"

timeout /t 3 /nobreak > nul

echo [2/4] Khoi chay Shorten Service (Port 5002)...
start "Shorten Service" cmd /c "cd Shorten && dotnet run --urls=http://localhost:5002"

timeout /t 3 /nobreak > nul

echo [3/4] Khoi chay API Gateway (Port 5000)...
start "API Gateway" cmd /c "cd OcelotGateway && dotnet run --urls=http://localhost:5000"

timeout /t 3 /nobreak > nul

echo [4/4] Khoi chay React Frontend (Port 3000)...
start "React Frontend" cmd /c "cd frontend && npm start"

echo.
echo ===========================================
echo   Tat ca services da duoc khoi chay!
echo ===========================================
echo.
echo API Gateway:  http://localhost:5000
echo Users API:    http://localhost:5001  
echo URLs API:     http://localhost:5002
echo React Frontend: http://localhost:3000
echo.
echo ===========================================
echo   THONG TIN DON GIAN HOA:
echo   - Da bo DTO, dung truc tiep JObject
echo   - Controllers don gian hon
echo   - Frontend React giu nguyen nhung CSS don gian
echo   - Tat ca validation co ban van hoat dong
echo   - SU DUNG HTTP thay vi HTTPS de don gian
echo ===========================================
echo.
echo Nhan phim bat ky de dong cua so nay...
pause > nul
