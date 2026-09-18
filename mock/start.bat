@echo off
cd /d "%~dp0"

set PORT=9999
echo Starting Moco on port %PORT% ...
start "moco" java -Dfile.encoding=utf-8 -jar moco-runner.jar http -p %PORT% -g config.json
echo Moco started in a new window. Close that window or run stop.bat to stop.
