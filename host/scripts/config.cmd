@echo off
set LW_ACCOUNT_NAME=%1
set LW_ACCESS_TOKEN=%2
set LW_SCANNER_DISABLE_UPDATES=true
echo | %~dp0lw-scanner.exe configure auth