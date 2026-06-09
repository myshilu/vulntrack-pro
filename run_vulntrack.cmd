@echo off
setlocal EnableExtensions

set "ROOT=%~dp0"
set "ROOT=%ROOT:~0,-1%"
set "BACKEND=%ROOT%\backend"
set "FRONTEND=%ROOT%\frontend"
set "VENV=%BACKEND%\venv"
set "REQ_HASH_FILE=%VENV%\.requirements.sha256"
set "LAUNCH_LOG=%ROOT%\.vulntrack-launcher.log"
>"%LAUNCH_LOG%" echo VulnTrack Pro launch started at %DATE% %TIME%

echo.
echo VulnTrack Pro launcher
echo Project root: "%ROOT%"
echo.

where python >nul 2>nul
if errorlevel 1 (
  echo ERROR: Python was not found on PATH. Install Python 3.11 or 3.12 and enable Add Python to PATH.
  pause
  exit /b 1
)

where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js was not found on PATH. Install the current Node.js LTS release.
  pause
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo ERROR: npm was not found on PATH. Install Node.js LTS, which includes npm.
  pause
  exit /b 1
)

if not exist "%VENV%\Scripts\python.exe" (
  echo Creating backend virtual environment...
  python -m venv "%VENV%"
  if errorlevel 1 goto error
)

if not exist "%BACKEND%\.env" (
  echo Creating backend .env...
  copy "%BACKEND%\.env.example" "%BACKEND%\.env" >nul
  powershell -NoProfile -ExecutionPolicy Bypass -Command "$p='%BACKEND%\.env'; $secret=[guid]::NewGuid().ToString('N') + [guid]::NewGuid().ToString('N'); $content=(Get-Content -Raw $p) -replace 'SESSION_SECRET=.*', ('SESSION_SECRET=' + $secret); [IO.File]::WriteAllText($p,$content)"
)

if not exist "%FRONTEND%\.env" (
  echo Creating frontend .env...
  copy "%FRONTEND%\.env.example" "%FRONTEND%\.env" >nul
)

for /f "usebackq tokens=*" %%H in (`powershell -NoProfile -Command "(Get-FileHash '%BACKEND%\requirements.txt' -Algorithm SHA256).Hash"`) do set "REQ_HASH=%%H"
set "OLD_REQ_HASH="
if exist "%REQ_HASH_FILE%" set /p OLD_REQ_HASH=<"%REQ_HASH_FILE%"

if not "%REQ_HASH%"=="%OLD_REQ_HASH%" (
  echo Installing backend requirements...
  "%VENV%\Scripts\python.exe" -m pip install --upgrade pip
  if errorlevel 1 goto error
  "%VENV%\Scripts\python.exe" -m pip install -r "%BACKEND%\requirements.txt"
  if errorlevel 1 goto error
  >"%REQ_HASH_FILE%" echo %REQ_HASH%
) else (
  echo Backend requirements are already installed.
)

if not exist "%FRONTEND%\node_modules" (
  echo Installing frontend dependencies...
  pushd "%FRONTEND%"
  call npm install
  if errorlevel 1 (
    popd
    goto error
  )
  popd
) else (
  echo Frontend dependencies are already installed.
)

echo Starting backend in a new Command Prompt window...
>>"%LAUNCH_LOG%" echo Starting backend window
start "VulnTrack Pro Backend" /D "%BACKEND%" cmd /k "call venv\Scripts\activate.bat && python run.py"

echo Starting frontend in a new Command Prompt window...
>>"%LAUNCH_LOG%" echo Starting frontend window
start "VulnTrack Pro Frontend" /D "%FRONTEND%" cmd /k "npm run dev -- --host 127.0.0.1 --port 5173"

echo Waiting for backend health endpoint...
"%VENV%\Scripts\python.exe" "%BACKEND%\wait_for_url.py" "http://localhost:8000/api/health" 60
>>"%LAUNCH_LOG%" echo Backend wait exit code: %ERRORLEVEL%
if errorlevel 1 (
  echo ERROR: Backend did not become healthy at http://localhost:8000/api/health.
  pause
  exit /b 1
)

echo Waiting for frontend...
"%VENV%\Scripts\python.exe" "%BACKEND%\wait_for_url.py" "http://localhost:5173/index.html" 60
>>"%LAUNCH_LOG%" echo Frontend wait exit code: %ERRORLEVEL%
if errorlevel 1 (
  echo ERROR: Frontend did not respond at http://localhost:5173.
  pause
  exit /b 1
)

echo Opening http://localhost:5173 ...
start "" "http://localhost:5173"
echo.
echo VulnTrack Pro is running.
>>"%LAUNCH_LOG%" echo VulnTrack Pro launch completed successfully
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8000
echo Swagger:  http://localhost:8000/docs
echo.
exit /b 0

:error
echo.
echo ERROR: Setup failed. Review the message above, then run run_vulntrack.cmd again.
pause
exit /b 1
