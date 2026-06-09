@echo off
setlocal EnableExtensions

set "ROOT=%~dp0"
set "ROOT=%ROOT:~0,-1%"
set "DB=%ROOT%\backend\vulntrack.db"

echo.
echo VulnTrack Pro database reset
echo This will stop local port 8000/5173 processes after confirmation and delete:
echo "%DB%"
echo.
set /p "CONFIRM=Reset the local SQLite database? [y/N] "
if /i not "%CONFIRM%"=="Y" (
  echo Reset canceled.
  pause
  exit /b 0
)

call "%ROOT%\stop_vulntrack.cmd"

if exist "%DB%" (
  del "%DB%"
  if errorlevel 1 (
    echo ERROR: Could not delete "%DB%".
    pause
    exit /b 1
  )
  echo Deleted local SQLite database.
) else (
  echo No local SQLite database exists yet.
)

echo Restarting VulnTrack Pro so demo data is recreated...
call "%ROOT%\run_vulntrack.cmd"
