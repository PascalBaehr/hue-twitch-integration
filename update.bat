@echo off
ECHO Installing/Updating Dependencies...
CALL cmd /C npm install --silent
CALL cmd /C npm update --silent
pause