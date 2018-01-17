@echo off
ECHO Installing/Updating Dependencies...
CALL cmd /C npm install --silent
CALL cmd /C npm update --silent
node ./config/install.js
npx electron ./config/config.js
pause
