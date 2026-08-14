@echo off
set IMAGE=lucky-radio-api:latest
set BUILD_DIR=build
set OUTPUT=%BUILD_DIR%\lucky-radio-api.tar

echo.
echo === Building %IMAGE% for Raspberry Pi (linux/arm64) ===
echo.

docker buildx build ^
    --platform linux/arm64 ^
    -t %IMAGE% ^
    --load .

if errorlevel 1 (
    echo.
    echo BUILD FAILED
    pause
    exit /b 1
)

echo.
echo === Exporting image ===
echo.

if not exist "%BUILD_DIR%" mkdir "%BUILD_DIR%"
docker save -o %OUTPUT% %IMAGE%

if errorlevel 1 (
    echo.
    echo EXPORT FAILED
    pause
    exit /b 1
)

echo.
echo === DONE ===
echo Image: %IMAGE%
echo File:  %OUTPUT%
echo.

pause
