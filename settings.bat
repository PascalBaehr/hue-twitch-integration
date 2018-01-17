@echo off
ECHO Installing/Updating Dependencies...
CALL cmd /C npm install --silent
CALL cmd /C npm update --silent
npx electron ./config/config.js
pause
