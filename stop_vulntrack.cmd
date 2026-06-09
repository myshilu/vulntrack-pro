@echo off
setlocal EnableExtensions EnableDelayedExpansion

echo.
echo VulnTrack Pro stop helper
echo.

for %%P in (8000 5173) do (
  set "FOUND="
  for /f "tokens=5" %%A in ('netstat -ano ^| findstr /R /C:":%%P .*LISTENING"') do (
    set "FOUND=1"
    set "PID=%%A"
    echo Port %%P is in use by PID !PID!.
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-CimInstance Win32_Process -Filter \"ProcessId=!PID!\" | Select-Object ProcessId,CommandLine | Format-List"
    set /p "CONFIRM=Stop this process on port %%P? [y/N] "
    if /i "!CONFIRM!"=="Y" (
      taskkill /PID !PID! /T /F
    ) else (
      echo Left PID !PID! running.
    )
  )
  if not defined FOUND echo Port %%P is not currently listening.
)

echo.
echo Done.
pause
